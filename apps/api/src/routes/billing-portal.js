import { authMiddleware } from '../middleware/auth.js'
import { stripe } from '../services/stripe.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function billingPortalRoutes(app) {
  app.post('/api/billing-portal', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = request.user?.id
    if (!userId) {
      return reply.status(401).send({ error: 'Non authentifié' })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (profileError) {
      return reply.status(500).send({ error: `Erreur profile: ${profileError.message}` })
    }

    const stripeCustomerId = profile?.stripe_customer_id
    if (!stripeCustomerId) {
      return reply.status(400).send({ error: 'Aucun abonnement trouvé.' })
    }

    const returnUrl = `${process.env.FRONTEND_URL || 'https://modvf.fr'}/dashboard`
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    })

    return reply.status(200).send({ url: session.url })
  })
}
