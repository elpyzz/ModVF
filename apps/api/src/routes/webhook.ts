import type { FastifyInstance } from 'fastify'
import { stripe } from '../services/stripe.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'
import { env } from '../config/env.js'
import { PRICE_TO_PLAN } from '../config/plans.js'

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/api/webhooks/stripe', async (request, reply) => {
    const sig = request.headers['stripe-signature']
    if (!sig || Array.isArray(sig)) return reply.status(400).send({ error: 'Signature manquante' })

    const rawBody = ((request as any).rawBody as Buffer) ?? (request.body as Buffer)

    let event
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET)
    } catch {
      return reply.status(400).send({ error: 'Signature invalide' })
    }

    if (event.type === 'checkout.session.completed') {
      try {
        const session = event.data.object as any
        if (session.mode === 'subscription') {
          const subscriptionId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
          if (subscriptionId) {
            const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any
            const userId = session.metadata?.userId || session.client_reference_id
            const priceId = subscription.items?.data?.[0]?.price?.id
            const plan = priceId ? PRICE_TO_PLAN[priceId] ?? null : null
            if (userId) {
              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_status: 'active',
                  subscription_plan: plan,
                  stripe_customer_id: session.customer,
                  stripe_subscription_id: subscriptionId,
                  subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                })
                .eq('id', userId)
            }
          }
        } else {
          const userId = session.metadata?.userId
          const creditsRaw = session.metadata?.credits
          const credits = Number.parseInt(creditsRaw ?? '0', 10)

          if (userId && credits > 0) {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('credits, credits_purchased')
              .eq('id', userId)
              .single()
            await supabaseAdmin
              .from('profiles')
              .update({
                credits: (Number(profile?.credits) || 0) + credits,
                credits_purchased:
                  (Number((profile as { credits_purchased?: number } | null)?.credits_purchased) || 0) + credits,
              })
              .eq('id', userId)

            console.log('[STRIPE] +' + credits + ' crédits pour user ' + userId)
          }
        }
      } catch (err) {
        console.error('[Webhook] checkout.session.completed error:', err)
      }
    } else if (event.type === 'invoice.paid') {
      try {
        const invoice = event.data.object as any
        const subscriptionId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
        if (subscriptionId) {
            const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)
          console.log(`[Webhook] invoice.paid — subscription ${subscriptionId} renewed`)
        }
      } catch (err) {
        console.error('[Webhook] invoice.paid error:', err)
      }
    } else if (event.type === 'invoice.payment_failed') {
      try {
        const invoice = event.data.object as any
        const subscriptionId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
        if (subscriptionId) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)
          console.log(`[Webhook] invoice.payment_failed — subscription ${subscriptionId}`)
        }
      } catch (err) {
        console.error('[Webhook] invoice.payment_failed error:', err)
      }
    } else if (event.type === 'customer.subscription.deleted') {
      try {
        const subscription = event.data.object as any
        const subscriptionId = subscription.id
        if (subscriptionId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_plan: null,
              stripe_subscription_id: null,
              subscription_current_period_end: null,
            })
            .eq('stripe_subscription_id', subscriptionId)
          console.log(`[Webhook] subscription deleted — ${subscriptionId}`)
        }
      } catch (err) {
        console.error('[Webhook] customer.subscription.deleted error:', err)
      }
    } else if (event.type === 'customer.subscription.updated') {
      try {
        const subscription = event.data.object as any
        const subscriptionId = subscription.id
        if (subscriptionId) {
          if (subscription.cancel_at_period_end === true) {
            await supabaseAdmin
              .from('profiles')
              .update({ subscription_status: 'canceled' })
              .eq('stripe_subscription_id', subscriptionId)
          } else if (subscription.status === 'active') {
            const priceId = subscription.items?.data?.[0]?.price?.id
            const plan = priceId ? PRICE_TO_PLAN[priceId] ?? null : null
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_plan: plan,
                subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq('stripe_subscription_id', subscriptionId)
          }
        }
      } catch (err) {
        console.error('[Webhook] customer.subscription.updated error:', err)
      }
    }

    return reply.send({ received: true })
  })
}
