import type { FastifyInstance } from 'fastify'
import { stripe } from '../services/stripe.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'
import { env } from '../config/env.js'

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
      const session = event.data.object
      const userId = session.metadata?.userId
      const creditsRaw = session.metadata?.credits
      const credits = Number.parseInt(creditsRaw ?? '0', 10)

      if (userId && credits > 0) {
        const { data: profile } = await supabaseAdmin.from('profiles').select('credits').eq('id', userId).single()
        await supabaseAdmin
          .from('profiles')
          .update({ credits: (Number(profile?.credits) || 0) + credits })
          .eq('id', userId)

        console.log('[STRIPE] +' + credits + ' crédits pour user ' + userId)
      }
    }

    return reply.send({ received: true })
  })
}
