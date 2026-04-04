import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { translationQueue } from '../services/queue.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function statusRoutes(app: FastifyInstance) {
  app.get('/api/translate/:jobId/status', { preHandler: [authMiddleware] }, async (request, reply) => {
    const params = request.params as { jobId: string }
    const userId = request.user!.id

    const { data } = await supabaseAdmin
      .from('translations')
      .select(
        'status, progress, current_step, translated_strings, total_strings, error_message, download_count, max_downloads, download_expires_at',
      )
      .eq('id', params.jobId)
      .eq('user_id', userId)
      .single()

    if (!data) {
      const job = await translationQueue.getJob(params.jobId)
      if (job) {
        return {
          status: 'processing',
          progress: Number(job.progress ?? 0),
          current_step: 'Traitement en file d’attente',
          translated_strings: 0,
          total_strings: 0,
          error_message: null,
        }
      }
      return reply.status(404).send({ error: 'Job introuvable' })
    }

    const job = await translationQueue.getJob(params.jobId)
    const progress = job ? Number(job.progress ?? data.progress ?? 0) : Number(data.progress ?? 0)

    return {
      status: data.status,
      progress,
      current_step: data.current_step,
      translated_strings: data.translated_strings ?? 0,
      total_strings: data.total_strings ?? 0,
      error_message: data.error_message ?? null,
      download_count: data.download_count ?? 0,
      max_downloads: data.max_downloads ?? 3,
      download_expires_at: data.download_expires_at ?? null,
    }
  })
}
