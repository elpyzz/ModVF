import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { authMiddleware } from '../middleware/auth.js'
import { addTranslationJob } from '../services/queue.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'
import { validateAndStoreUpload } from '../services/upload.service.js'

export async function translateRoutes(app: FastifyInstance) {
  app.post('/api/translate', { preHandler: [authMiddleware] }, async (request, reply) => {
    console.log('[ROUTE] POST /api/translate - requête reçue')
    const file = await request.file()
    if (!file) return reply.status(400).send({ error: 'Fichier manquant' })

    const userId = request.user!.id
    const { data: profile } = await supabaseAdmin.from('profiles').select('credits').eq('id', userId).single()
    if (!profile || Number(profile.credits) <= 0) {
      return reply.status(402).send({ error: 'Crédits insuffisants. Achetez des crédits pour continuer.' })
    }

    const jobId = randomUUID()
    const uploaded = await validateAndStoreUpload(file, jobId)

    // #region agent log
    fetch('http://127.0.0.1:7330/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e8bfc'},body:JSON.stringify({sessionId:'1e8bfc',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/translate.ts:insert-start',message:'Creating translations row',data:{jobId,userId,fileName:uploaded.fileName,fileSize:uploaded.fileSize},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const { error: insertError } = await supabaseAdmin.from('translations').insert({
      id: jobId,
      user_id: userId,
      file_name: uploaded.fileName,
      file_size: uploaded.fileSize,
      status: 'pending',
      progress: 0,
      current_step: 'En attente',
      translated_strings: 0,
      total_strings: 0,
      output_path: path.resolve(uploaded.jobDir, 'translated.zip'),
    })
    // #region agent log
    fetch('http://127.0.0.1:7330/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e8bfc'},body:JSON.stringify({sessionId:'1e8bfc',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/translate.ts:insert-result',message:'translations insert result',data:{jobId,ok:!insertError,error:insertError?.message??null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (insertError) {
      return reply.status(500).send({ error: `Erreur DB translations: ${insertError.message}` })
    }

    await addTranslationJob({
      jobId,
      userId,
      filePath: uploaded.filePath,
      fileName: uploaded.fileName,
    })

    return reply.status(202).send({ jobId, message: 'Traduction en cours' })
  })
}
