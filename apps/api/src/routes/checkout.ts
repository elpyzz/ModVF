import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { stripe } from '../services/stripe.service.js'

const STARTER_PRICE_ID = process.env.STRIPE_STARTER_PRICE_ID || 'price_1TI87wHz8fVVNyb1NvoenrZc'
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || 'price_1TI88tHz8fVVNyb1CujboMHJ'

function creditsFromPriceId(priceId: string): number {
  if (priceId === STARTER_PRICE_ID) return 3
  if (priceId === PRO_PRICE_ID) return 10
  return 0
}

export async function checkoutRoutes(app: FastifyInstance) {
  app.post('/api/checkout', { preHandler: [authMiddleware] }, async (request, reply) => {
    const body = request.body as { priceId?: string }
    const priceId = body?.priceId
    if (!priceId) return reply.status(400).send({ error: 'priceId manquant' })

    const credits = creditsFromPriceId(priceId)
    if (!credits) return reply.status(400).send({ error: 'priceId invalide' })

    const userId = request.user!.id
    const userEmail = request.user?.email

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://modvf.fr/dashboard?payment=success',
      cancel_url: 'https://modvf.fr/tarifs',
      metadata: {
        userId,
        credits: credits.toString(),
      },
      customer_email: userEmail,
    })

    return reply.send({ url: session.url })
  })
}
