import { randomInt } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { supabaseAdmin } from '../services/supabase.service.js'

function buildReferralPrefix(email: string): string {
  const localPart = email.split('@')[0] || 'USR'
  const cleaned = localPart.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return (cleaned.slice(0, 3) || 'USR').padEnd(3, 'X')
}

function buildReferralCode(email: string): string {
  const prefix = buildReferralPrefix(email)
  const digits = randomInt(0, 10000).toString().padStart(4, '0')
  return `${prefix}${digits}`
}

async function generateUniqueReferralCode(email: string): Promise<string> {
  for (let i = 0; i < 20; i += 1) {
    const candidate = buildReferralCode(email)
    const { data, error } = await supabaseAdmin.from('profiles').select('id').eq('referral_code', candidate).maybeSingle()
    if (error) throw error
    if (!data) return candidate
  }
  throw new Error('Impossible de générer un code de parrainage unique')
}

export async function referralRoutes(app: FastifyInstance) {
  app.get('/api/referral/code', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = request.user?.id
    if (!userId) return reply.status(401).send({ error: 'Non authentifié' })

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, referral_code')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return reply.status(404).send({ error: 'Profil non trouvé' })
    }

    const existingCode = typeof profile.referral_code === 'string' ? profile.referral_code : null
    if (existingCode) {
      return reply.send({ code: existingCode, link: `https://modvf.fr/?ref=${existingCode}` })
    }

    const email = request.user?.email || profile.email
    if (!email) {
      return reply.status(400).send({ error: 'Email utilisateur introuvable' })
    }

    const code = await generateUniqueReferralCode(email)
    const { error: updateError } = await supabaseAdmin.from('profiles').update({ referral_code: code }).eq('id', userId)
    if (updateError) {
      return reply.status(500).send({ error: `Erreur update referral_code: ${updateError.message}` })
    }

    return reply.send({ code, link: `https://modvf.fr/?ref=${code}` })
  })

  app.get('/api/referral/stats', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = request.user?.id
    if (!userId) return reply.status(401).send({ error: 'Non authentifié' })

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('referral_code, referral_earnings')
      .eq('id', userId)
      .single()
    if (profileError || !profile) {
      return reply.status(404).send({ error: 'Profil non trouvé' })
    }

    const { count: totalReferred, error: totalError } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
    if (totalError) {
      return reply.status(500).send({ error: `Erreur referrals: ${totalError.message}` })
    }

    const { count: totalConverted, error: convertedError } = await supabaseAdmin
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'converted')
    if (convertedError) {
      return reply.status(500).send({ error: `Erreur referrals convertis: ${convertedError.message}` })
    }

    const code = typeof profile.referral_code === 'string' ? profile.referral_code : null

    return reply.send({
      code,
      link: code ? `https://modvf.fr/?ref=${code}` : null,
      totalReferred: totalReferred ?? 0,
      totalConverted: totalConverted ?? 0,
      totalEarnings: Number(profile.referral_earnings) || 0,
    })
  })

  app.post('/api/referral/track', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = request.user?.id
    if (!userId) return reply.status(401).send({ error: 'Non authentifié' })

    const body = request.body as { referralCode?: unknown }
    const referralCodeRaw = body?.referralCode
    if (typeof referralCodeRaw !== 'string' || !referralCodeRaw.trim()) {
      return reply.status(400).send({ error: 'referralCode manquant' })
    }

    const referralCode = referralCodeRaw.trim().toUpperCase()
    const { data: referrerProfile, error: referrerError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .single()

    if (referrerError || !referrerProfile) {
      return reply.status(404).send({ error: 'Code de parrainage invalide' })
    }

    if (referrerProfile.id === userId) {
      return reply.status(400).send({ error: 'Auto-parrainage interdit' })
    }

    const { data: existingReferral, error: existingError } = await supabaseAdmin
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .maybeSingle()

    if (existingError) {
      return reply.status(500).send({ error: `Erreur vérification referral: ${existingError.message}` })
    }
    if (existingReferral) {
      return reply.status(409).send({ error: 'Referral déjà enregistré pour cet utilisateur' })
    }

    const { error: insertError } = await supabaseAdmin.from('referrals').insert({
      referrer_id: referrerProfile.id,
      referred_id: userId,
      referral_code: referralCode,
      status: 'pending',
    })
    if (insertError) {
      return reply.status(500).send({ error: `Erreur création referral: ${insertError.message}` })
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from('profiles')
      .update({ referred_by: referralCode })
      .eq('id', userId)
    if (updateProfileError) {
      return reply.status(500).send({ error: `Erreur update profile referred_by: ${updateProfileError.message}` })
    }

    return reply.send({ success: true })
  })
}
