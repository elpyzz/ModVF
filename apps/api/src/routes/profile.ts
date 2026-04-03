import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function profileRoutes(app: FastifyInstance) {
  app.get('/api/profile', { preHandler: authMiddleware }, async (request, reply) => {
    const user = (request as any).user

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('credits, display_name, total_translations, email, avatar_url')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      return reply.status(404).send({ error: 'Profil non trouvé' })
    }

    return reply.send(data)
  })

  app.get('/api/translations', { preHandler: authMiddleware }, async (request, reply) => {
    const user = (request as any).user

    const { data, error } = await supabaseAdmin
      .from('translations')
      .select('id, file_name, status, created_at, total_strings, translated_strings')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return reply.status(500).send({ error: 'Erreur serveur' })
    }

    return reply.send(data || [])
  })
}
