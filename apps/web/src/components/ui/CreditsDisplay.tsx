import { clsx } from 'clsx'
import { Coins } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useUploadStore } from '../../stores/useUploadStore'

type Variant = 'dashboard' | 'compact'

export function CreditsDisplay({ variant = 'dashboard' }: { variant?: Variant }) {
  const profile = useAuthStore((s) => s.profile)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const credits = profile?.credits
  const periodEnd = profile?.subscription_current_period_end ? new Date(profile.subscription_current_period_end) : null
  const hasSubscriptionAccess =
    (profile?.subscription_status === 'active' || profile?.subscription_status === 'canceled') &&
    !!periodEnd &&
    periodEnd > new Date()
  const monthlyTotal = Number(profile?.monthly_modpack_credits_total ?? 0)
  const monthlyUsed = Number(profile?.monthly_modpack_credits_used ?? 0)
  const monthlyRemaining = Math.max(0, monthlyTotal - monthlyUsed)
  const showsMonthlyCredits = hasSubscriptionAccess && monthlyTotal > 0
  const prevCredits = useRef<number | undefined>(undefined)
  const [bounce, setBounce] = useState(false)

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    const unsub = useUploadStore.subscribe((state, prev) => {
      if (state.state === 'complete' && prev.state === 'processing') {
        void fetchProfile()
      }
    })
    return unsub
  }, [fetchProfile])

  useEffect(() => {
    if (credits === undefined) return
    if (prevCredits.current !== undefined && prevCredits.current !== credits) {
      setBounce(true)
      const t = window.setTimeout(() => setBounce(false), 500)
      prevCredits.current = credits
      return () => window.clearTimeout(t)
    }
    prevCredits.current = credits
  }, [credits])

  const label = showsMonthlyCredits
    ? monthlyRemaining.toLocaleString('fr-FR')
    : credits === undefined
      ? '—'
      : credits.toLocaleString('fr-FR')
  const isZero = showsMonthlyCredits ? monthlyRemaining === 0 : credits === 0

  const base = clsx(
    'inline-flex items-center gap-2 rounded-xl border font-semibold transition-colors',
    variant === 'compact' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm',
    isZero
      ? 'border-amber-500/40 bg-amber-950/40 text-amber-100'
      : 'border-emerald-500/35 bg-emerald-950/35 text-emerald-100',
    bounce && 'animate-[creditsBounce_0.5s_ease-out]',
  )

  return (
    <div className={base}>
      <Coins className={variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span className="tabular-nums">
        {variant === 'compact' ? (
          <>
            {label} {showsMonthlyCredits ? 'crédits mensuels' : 'crédits'}
          </>
        ) : (
          <>
            {label} {showsMonthlyCredits ? 'crédits mensuels restants' : 'crédits restants'}
          </>
        )}
      </span>
      {isZero ? (
        <Link
          to="/tarifs"
          className={clsx(
            'ml-1 font-medium text-secondary underline-offset-2 hover:underline',
            variant === 'compact' && 'text-[11px]',
          )}
        >
          Acheter
        </Link>
      ) : null}
    </div>
  )
}
