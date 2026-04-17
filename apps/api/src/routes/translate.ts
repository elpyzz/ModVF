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

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select(
        'credits, credits_purchased, subscription_status, subscription_plan, subscription_current_period_end, monthly_modpack_credits_total, monthly_modpack_credits_used, monthly_credits_period_start, monthly_credits_period_end',
      )
      .eq('id', userId)
      .single()

    if (error) console.error('[TRANSLATE] profile fetch error:', error.message)
    const profileAny = profile as
      | {
          credits?: number
          credits_purchased?: number
          subscription_status?: string | null
          subscription_plan?: string | null
          subscription_current_period_end?: string | null
          monthly_modpack_credits_total?: number | null
          monthly_modpack_credits_used?: number | null
          monthly_credits_period_start?: string | null
          monthly_credits_period_end?: string | null
        }
      | null
    const creditsPurchased = Number(profileAny?.credits_purchased ?? 0)
    const subscriptionStatus = profileAny?.subscription_status ?? 'none'
    const subscriptionPlan = profileAny?.subscription_plan ?? null
    const periodEnd = profileAny?.subscription_current_period_end ? new Date(profileAny.subscription_current_period_end) : null
    const hasValidActiveSubscription =
      (subscriptionStatus === 'active' || subscriptionStatus === 'canceled') && !!periodEnd && periodEnd > new Date()
    let isFirstCompletedModpack = false
    let billingSource: 'none' | 'monthly' | 'purchased' = 'none'
    let activePlanLimits: Record<string, any> | null = null

    // 1) Priorité au statut d'impayé
    if (subscriptionStatus === 'past_due') {
      return reply
        .status(403)
        .send({ error: 'Votre paiement a échoué. Mettez à jour votre moyen de paiement dans votre espace abonné.' })
    }

    // 2) Abonnement actif : valider le quota mensuel de crédits modpack sans débiter au démarrage
    if (hasValidActiveSubscription) {
      activePlanLimits =
        subscriptionPlan && Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, subscriptionPlan)
          ? (SUBSCRIPTION_PLANS as Record<string, any>)[subscriptionPlan]
          : null

      if (translationType === 'modpack') {
        if (!activePlanLimits) {
          return reply.status(403).send({ error: "Votre abonnement n'est pas correctement configuré. Contactez le support." })
        }

        const monthlyQuotaTotal = Number(activePlanLimits.maxModpacks ?? 0)
        const now = new Date()
        const nowIso = now.toISOString()

        const currentCycleStart = profileAny?.monthly_credits_period_start ? new Date(profileAny.monthly_credits_period_start) : null
        const currentCycleEnd = profileAny?.monthly_credits_period_end ? new Date(profileAny.monthly_credits_period_end) : null
        const shouldResetCycle = !currentCycleStart || !currentCycleEnd || currentCycleEnd <= now
        const nextCycleStart = shouldResetCycle ? now : currentCycleStart
        const nextCycleEnd = shouldResetCycle
          ? new Date(
              now.getTime() + (String(activePlanLimits.interval ?? 'month') === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000,
            )
          : currentCycleEnd

        if (shouldResetCycle || Number(profileAny?.monthly_modpack_credits_total ?? 0) !== monthlyQuotaTotal) {
          const { error: updateCycleError } = await supabaseAdmin
            .from('profiles')
            .update({
              monthly_modpack_credits_total: monthlyQuotaTotal,
              monthly_modpack_credits_used: shouldResetCycle ? 0 : Number(profileAny?.monthly_modpack_credits_used ?? 0),
              monthly_credits_period_start: nextCycleStart?.toISOString() ?? null,
              monthly_credits_period_end: nextCycleEnd?.toISOString() ?? null,
            })
            .eq('id', userId)
          if (updateCycleError) {
            return reply.status(500).send({ error: `Erreur DB cycle crédits mensuels: ${updateCycleError.message}` })
          }
        }

        const monthlyUsed = shouldResetCycle ? 0 : Number(profileAny?.monthly_modpack_credits_used ?? 0)
        const cycleStartIso = nextCycleStart?.toISOString() ?? nowIso
        const cycleEndIso = nextCycleEnd?.toISOString() ?? nowIso
        const { count: inFlightMonthlyCount, error: inFlightMonthlyError } = await supabaseAdmin
          .from('translations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('type', 'modpack')
          .eq('billing_source', 'monthly')
          .in('status', ['pending', 'processing'])
          .gte('created_at', cycleStartIso)
          .lt('created_at', cycleEndIso)
        if (inFlightMonthlyError) {
          return reply.status(500).send({ error: `Erreur DB quota mensuel en cours: ${inFlightMonthlyError.message}` })
        }

        const remainingMonthly = monthlyQuotaTotal - monthlyUsed - Number(inFlightMonthlyCount ?? 0)
        if (remainingMonthly <= 0) {
          return reply.status(402).send({
            error: `Quota mensuel atteint pour votre plan ${activePlanLimits.name}. Nouveau quota au prochain renouvellement.`,
          })
        }
        billingSource = 'monthly'
      }
    } else {
      // 3) Non-abonné : conserve les règles existantes (.jar inchangé)
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
        const { count: completedModpackCount, error: completedModpackCountError } = await supabaseAdmin
          .from('translations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('type', 'modpack')
          .eq('status', 'completed')
        if (completedModpackCountError) {
          return reply.status(500).send({ error: `Erreur DB compteur modpacks complétés: ${completedModpackCountError.message}` })
        }
        isFirstCompletedModpack = (completedModpackCount ?? 0) === 0
        if (isFirstCompletedModpack && modsJarCount <= 50) {
          console.log(`[FREE] Première traduction modpack gratuite (≤50 mods) pour user ${userId}`)
        }
        if (modsJarCount > 50) {
          return reply.status(403).send({
            error:
              'Le plan Découverte est limité aux modpacks de 50 mods maximum. Passez au plan Starter pour traduire les modpacks plus volumineux.',
          })
        }
        if (!isFirstCompletedModpack) {
          const { count: inFlightPurchasedCount, error: inFlightPurchasedError } = await supabaseAdmin
            .from('translations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'modpack')
            .eq('billing_source', 'purchased')
            .in('status', ['pending', 'processing'])
          if (inFlightPurchasedError) {
            return reply.status(500).send({ error: `Erreur DB crédits en cours: ${inFlightPurchasedError.message}` })
          }
          const availableCredits = Number(profileAny?.credits ?? 0) - Number(inFlightPurchasedCount ?? 0)
          if (availableCredits <= 0) {
            return reply.status(402).send({ error: 'Crédits insuffisants. Achetez des crédits pour continuer.' })
          }
          billingSource = 'purchased'
        }
      } finally {
        await fsp.rm(precheckExtractedDir, { recursive: true, force: true }).catch(() => {})
      }
    } else if (translationType === 'modpack' && !hasValidActiveSubscription && billingSource === 'none') {
      const { count: inFlightPurchasedCount, error: inFlightPurchasedError } = await supabaseAdmin
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'modpack')
        .eq('billing_source', 'purchased')
        .in('status', ['pending', 'processing'])
      if (inFlightPurchasedError) {
        return reply.status(500).send({ error: `Erreur DB crédits en cours: ${inFlightPurchasedError.message}` })
      }
      const availableCredits = Number(profileAny?.credits ?? 0) - Number(inFlightPurchasedCount ?? 0)
      if (availableCredits <= 0) {
        return reply.status(402).send({ error: 'Crédits insuffisants. Achetez des crédits pour continuer.' })
      }
      billingSource = 'purchased'
    }

    try {
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
        billing_source: translationType === 'modpack' ? billingSource : 'none',
        billing_consumed_at: null,
      })
      if (insertError) {
        throw new Error(`Erreur DB translations: ${insertError.message}`)
      }

      await addTranslationJob({
        jobId,
        userId,
        filePath: uploaded.filePath,
        fileName: uploaded.fileName,
        type: translationType,
        billingSource: translationType === 'modpack' ? billingSource : 'none',
      })
    } catch (enqueueErr: unknown) {
      const msg = enqueueErr instanceof Error ? enqueueErr.message : 'Erreur lors de la mise en file'
      return reply.status(500).send({ error: msg })
    }

    return reply.status(202).send({ jobId, message: 'Traduction en cours' })
  })
}
