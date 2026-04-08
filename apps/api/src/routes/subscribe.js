import { authMiddleware } from '../middleware/auth.js'
import { PRICE_TO_PLAN, SUBSCRIPTION_PLANS, VALID_SUBSCRIPTION_PRICES } from '../config/plans.js'
import { stripe } from '../services/stripe.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function subscribeRoutes(app) {
  app.post('/api/subscribe', { preHandler: [authMiddleware] }, async (request, reply) => {
    const body = request.body ?? {}
    const priceId = body.priceId

    if (typeof priceId !== 'string' || !priceId) {
      return reply.status(400).send({ error: 'priceId manquant' })
    }

    if (!VALID_SUBSCRIPTION_PRICES.includes(priceId)) {
      return reply.status(400).send({ error: 'Plan invalide' })
    }

    const userId = request.user?.id
    if (!userId) {
      return reply.status(401).send({ error: 'Non authentifié' })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single()

    if (profileError) {
      return reply.status(500).send({ error: `Erreur profile: ${profileError.message}` })
    }

    if (profile?.subscription_status === 'active') {
      return reply
        .status(400)
        .send({ error: 'Vous avez déjà un abonnement actif. Gérez-le depuis votre espace client.' })
    }

    const authUserEmail = request.user?.email
    const profileEmail = typeof profile?.email === 'string' ? profile.email : undefined
    const userEmail = authUserEmail || profileEmail

    let stripeCustomerId = typeof profile?.stripe_customer_id === 'string' ? profile.stripe_customer_id : null
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      })
      stripeCustomerId = customer.id

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId)
      if (updateError) {
        return reply.status(500).send({ error: `Erreur update customer: ${updateError.message}` })
      }
    }

    const planKey = PRICE_TO_PLAN[priceId]
    const planName = SUBSCRIPTION_PLANS[planKey]?.name || planKey
    const frontendUrl = process.env.FRONTEND_URL || 'https://modvf.fr'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard?subscription=success`,
      cancel_url: `${frontendUrl}/pricing?subscription=canceled`,
      metadata: { userId, plan: planName },
      subscription_data: { metadata: { userId } },
    })

    return reply.status(200).send({ url: session.url })
  })
}
