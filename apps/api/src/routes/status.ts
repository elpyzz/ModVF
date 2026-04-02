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
      .select('status, progress, current_step, translated_strings, total_strings')
      .eq('id', params.jobId)
      .eq('user_id', userId)
      .single()
    // #region agent log
    fetch('http://127.0.0.1:7330/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e8bfc'},body:JSON.stringify({sessionId:'1e8bfc',runId:'pre-fix',hypothesisId:'H2',location:'src/routes/status.ts:db-select',message:'Status lookup in translations',data:{jobId:params.jobId,userId,found:Boolean(data)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    if (!data) {
      const job = await translationQueue.getJob(params.jobId)
      // #region agent log
      fetch('http://127.0.0.1:7330/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e8bfc'},body:JSON.stringify({sessionId:'1e8bfc',runId:'pre-fix',hypothesisId:'H3',location:'src/routes/status.ts:missing-db-row',message:'DB row missing, queue fallback check',data:{jobId:params.jobId,queueJobFound:Boolean(job)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (job) {
        return {
          status: 'processing',
          progress: Number(job.progress ?? 0),
          currentStep: 'Traitement en file d’attente',
          translatedStrings: 0,
          totalStrings: 0,
        }
      }
      return reply.status(404).send({ error: 'Job introuvable' })
    }

    const job = await translationQueue.getJob(params.jobId)
    const progress = job ? Number(job.progress ?? data.progress ?? 0) : Number(data.progress ?? 0)

    return {
      status: data.status,
      progress,
      currentStep: data.current_step,
      translatedStrings: data.translated_strings ?? 0,
      totalStrings: data.total_strings ?? 0,
    }
  })
}
