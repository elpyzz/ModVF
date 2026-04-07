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

    const user = request.user!
    const userId = user.id
    const fileNameLower = file.filename.toLowerCase()
    const translationType: 'mod' | 'modpack' = fileNameLower.endsWith('.jar') ? 'mod' : 'modpack'

    console.log('[CREDITS CHECK] userId:', user.id)
    console.log('[CREDITS CHECK] SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING')

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('credits, credits_purchased')
      .eq('id', userId)
      .single()

    console.log('[CREDITS CHECK] profile result:', JSON.stringify(profile))
    console.log('[CREDITS CHECK] error:', JSON.stringify(error))

    if (translationType === 'modpack') {
      if (!profile || Number(profile.credits) <= 0) {
        return reply.status(402).send({ error: 'Crédits insuffisants. Achetez des crédits pour continuer.' })
      }
    } else {
      const creditsPurchased = Number((profile as { credits_purchased?: number } | null)?.credits_purchased ?? 0)
      if (creditsPurchased <= 0) {
        const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count, error: countError } = await supabaseAdmin
          .from('translations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('type', 'mod')
          .gte('created_at', sinceIso)
        if (countError) {
          return reply.status(500).send({ error: `Erreur DB compteur mods: ${countError.message}` })
        }
        if ((count ?? 0) >= 3) {
          return reply
            .status(429)
            .send({
              error:
                'Limite de 3 traductions de mods par jour atteinte. Passez à un plan payant pour des traductions illimitées.',
            })
        }
      }
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
      type: translationType,
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
      type: translationType,
    })

    return reply.status(202).send({ jobId, message: 'Traduction en cours' })
  })
}
