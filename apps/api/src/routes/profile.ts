import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function profileRoutes(app: FastifyInstance) {
  app.get('/api/profile', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = request.user!.id

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits, display_name')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return reply.status(404).send({ error: 'Profil introuvable' })
    }

    const { count, error: countError } = await supabaseAdmin
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      return reply.status(500).send({ error: 'Erreur comptage traductions' })
    }

    return {
      credits: Number(profile.credits ?? 0),
      display_name: String(profile.display_name ?? ''),
      total_translations: count ?? 0,
    }
  })
}
