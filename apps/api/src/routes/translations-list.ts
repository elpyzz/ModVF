import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function translationsListRoutes(app: FastifyInstance) {
  app.get('/api/translations', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = request.user!.id

    const { data, error } = await supabaseAdmin
      .from('translations')
      .select('id, file_name, status, created_at, total_strings, translated_strings, download_expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return reply.status(500).send({ error: error.message })
    }

    return data ?? []
  })
}
