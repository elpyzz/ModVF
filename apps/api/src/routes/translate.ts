import type { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { authMiddleware } from '../middleware/auth.js'
import { SUBSCRIPTION_PLANS } from '../config/plans.js'
import { extractZip } from '../pipeline/extractor.js'
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
      .select('credits, credits_purchased, subscription_status, subscription_plan, subscription_current_period_end')
      .eq('id', userId)
      .single()

    console.log('[CREDITS CHECK] profile result:', JSON.stringify(profile))
    console.log('[CREDITS CHECK] error:', JSON.stringify(error))
    const profileAny = profile as
      | {
          credits?: number
          credits_purchased?: number
          subscription_status?: string | null
          subscription_plan?: string | null
          subscription_current_period_end?: string | null
        }
      | null
    const creditsPurchased = Number(profileAny?.credits_purchased ?? 0)
    const subscriptionStatus = profileAny?.subscription_status ?? 'none'
    const subscriptionPlan = profileAny?.subscription_plan ?? null
    const periodEnd = profileAny?.subscription_current_period_end ? new Date(profileAny.subscription_current_period_end) : null
    const hasValidActiveSubscription =
      (subscriptionStatus === 'active' || subscriptionStatus === 'canceled') && !!periodEnd && periodEnd > new Date()

    // 1) Priorité au statut d'impayé
    if (subscriptionStatus === 'past_due') {
      return reply
        .status(403)
        .send({ error: 'Votre paiement a échoué. Mettez à jour votre moyen de paiement dans votre espace abonné.' })
    }

    // 2) Abonnement actif : appliquer les limites du plan, sans consommer de crédits
    if (hasValidActiveSubscription) {
      const limits =
        subscriptionPlan && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, subscriptionPlan)
          ? (SUBSCRIPTION_PLANS as Record<string, any>)[subscriptionPlan]
          : null

      if (translationType === 'modpack' && limits) {
        const nowIso = new Date().toISOString()
        const { data: activeModpacks, error: activeModpacksError } = await supabaseAdmin
          .from('translations')
          .select('id, download_expires_at')
          .eq('user_id', userId)
          .eq('type', 'modpack')
          .eq('status', 'completed')

        if (activeModpacksError) {
          return reply.status(500).send({ error: `Erreur DB compteur modpacks actifs: ${activeModpacksError.message}` })
        }

        const activeCount = (activeModpacks ?? []).filter((row) => !row.download_expires_at || row.download_expires_at > nowIso).length
        if (activeCount >= Number(limits.maxModpacks ?? 0)) {
          return reply.status(403).send({
            error: `Votre plan ${limits.name} est limité à ${limits.maxModpacks} modpacks simultanés. Supprimez un modpack ou passez au plan supérieur.`,
          })
        }
      }
    } else {
      // 3) Fallback crédits existant pour les non-abonnés (none/canceled/sans abonnement)
      if (translationType === 'modpack') {
        if (!profile || Number(profileAny?.credits ?? 0) <= 0) {
          return reply.status(402).send({ error: 'Crédits insuffisants. Achetez des crédits pour continuer.' })
        }
      } else if (creditsPurchased <= 0) {
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
    if (translationType === 'modpack' && !hasValidActiveSubscription && creditsPurchased <= 0) {
      const precheckExtractedDir = path.join(uploaded.jobDir, 'precheck-extracted')
      try {
        const extraction = await extractZip(uploaded.filePath, precheckExtractedDir)
        const modsDir = path.join(extraction.modpackRoot, 'mods')
        let modsJarCount = 0
        try {
          const modsEntries = await fsp.readdir(modsDir, { withFileTypes: true })
          modsJarCount = modsEntries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.jar')).length
        } catch {
          modsJarCount = 0
        }
        if (modsJarCount > 50) {
          return reply.status(403).send({
            error:
              'Le plan Découverte est limité aux modpacks de 50 mods maximum. Passez au plan Starter pour traduire tous les modpacks.',
          })
        }
      } finally {
        await fsp.rm(precheckExtractedDir, { recursive: true, force: true }).catch(() => {})
      }
    }

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
