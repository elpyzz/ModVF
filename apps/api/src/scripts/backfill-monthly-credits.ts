import { SUBSCRIPTION_PLANS } from '../config/plans.js'
import { supabaseAdmin } from '../services/supabase.service.js'

type ProfileRow = {
  id: string
  subscription_status: string | null
  subscription_plan: string | null
  subscription_current_period_end: string | null
}

function getPeriodStart(periodEndIso: string, interval: string): string {
  const end = new Date(periodEndIso)
  const days = interval === 'year' ? 365 : 30
  return new Date(end.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  const nowIso = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, subscription_status, subscription_plan, subscription_current_period_end')
    .in('subscription_status', ['active', 'canceled'])
    .not('subscription_plan', 'is', null)
    .gt('subscription_current_period_end', nowIso)

  if (error) throw new Error(`Impossible de charger les profils: ${error.message}`)
  const profiles = (data ?? []) as ProfileRow[]
  console.log(`[BACKFILL] Profils candidats: ${profiles.length}`)

  let updated = 0
  for (const profile of profiles) {
    const planKey = profile.subscription_plan
    const plan = planKey ? (SUBSCRIPTION_PLANS as Record<string, any>)[planKey] : null
    const periodEndIso = profile.subscription_current_period_end
    if (!plan || !periodEndIso) continue

    const total = Number(plan.maxModpacks ?? 0)
    const periodStartIso = getPeriodStart(periodEndIso, String(plan.interval ?? 'month'))

    const { count, error: countError } = await supabaseAdmin
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('type', 'modpack')
      .eq('status', 'completed')
      .gte('created_at', periodStartIso)
      .lt('created_at', periodEndIso)
    if (countError) throw new Error(`Count error (${profile.id}): ${countError.message}`)

    const used = Math.max(0, Math.min(total, Number(count ?? 0)))
    console.log(`[BACKFILL] ${profile.id} plan=${planKey} total=${total} used=${used} start=${periodStartIso} end=${periodEndIso}`)

    if (!dryRun) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          monthly_modpack_credits_total: total,
          monthly_modpack_credits_used: used,
          monthly_credits_period_start: periodStartIso,
          monthly_credits_period_end: periodEndIso,
        })
        .eq('id', profile.id)
      if (updateError) throw new Error(`Update error (${profile.id}): ${updateError.message}`)
      updated += 1
    }
  }

  console.log(`[BACKFILL] Terminé. dryRun=${dryRun} updated=${updated}/${profiles.length}`)
}

run().catch((err) => {
  console.error('[BACKFILL] Fatal:', err)
  process.exit(1)
})
