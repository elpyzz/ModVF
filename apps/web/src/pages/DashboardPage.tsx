import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditsDisplay } from '../components/ui/CreditsDisplay'
import { TranslationHistory } from '../features/upload/TranslationHistory'
import { UploadZone } from '../features/upload/UploadZone'
import { resolveDisplayName } from '../lib/displayName'
import { useAuthStore } from '../stores/useAuthStore'
import { useToastStore } from '../stores/useToastStore'

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const profile = useAuthStore((state) => state.profile)
  const session = useAuthStore((state) => state.session)
  const user = useAuthStore((state) => state.user)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const addToast = useToastStore((state) => state.addToast)
  const greetingName = resolveDisplayName(user, profile)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  useEffect(() => {
    document.title = 'Mon espace — ModVF'
  }, [])

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setShowPaymentSuccess(true)
      addToast('success', 'Paiement réussi ! Vos crédits ont été ajoutés.')
      setSearchParams({})
      void fetchProfile()
    }
  }, [addToast, fetchProfile, searchParams, setSearchParams])

  useEffect(() => {
    if (searchParams.get('subscription') === 'success') {
      addToast('success', 'Abonnement activé ! Bienvenue 🎉')
      const url = new URL(window.location.href)
      url.searchParams.delete('subscription')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
      void fetchProfile()
    }
  }, [addToast, fetchProfile, searchParams])

  useEffect(() => {
    if (!showPaymentSuccess) return
    const timeoutId = window.setTimeout(() => setShowPaymentSuccess(false), 5000)
    return () => window.clearTimeout(timeoutId)
  }, [showPaymentSuccess])

  async function handleBillingPortal() {
    if (!session?.access_token) return
    setBillingLoading(true)
    try {
      const res = await fetch(apiUrl + '/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
        return
      }
      addToast('error', data?.error || "Impossible d'ouvrir l'espace abonné.")
    } catch {
      addToast('error', 'Erreur de connexion.')
    } finally {
      setBillingLoading(false)
    }
  }

  const subscriptionStatus = profile?.subscription_status ?? 'none'
  const periodEnd = profile?.subscription_current_period_end ? new Date(profile.subscription_current_period_end) : null
  const hasFutureAccess = !!periodEnd && periodEnd > new Date()
  const periodEndLabel = periodEnd
    ? periodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const planLabels: Record<string, string> = {
    starter_monthly: 'Starter Mensuel',
    pack_monthly: 'Pack Mensuel',
    pack_annual: 'Pack Annuel',
  }
  const planLabel = profile?.subscription_plan ? planLabels[profile.subscription_plan] || profile.subscription_plan : 'Abonnement'

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#08080d] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Mon espace</h1>
          <p className="mt-1 text-text-muted">Bienvenue, {greetingName} 👋</p>
        </div>
        <CreditsDisplay />
      </header>

      {showPaymentSuccess ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm font-medium text-emerald-200">
          Paiement réussi ! Vos crédits ont été ajoutés.
        </div>
      ) : null}

      <div>
        {subscriptionStatus === 'active' ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 sm:p-5">
            <p className="text-sm font-semibold text-emerald-200 sm:text-base">✓ Abonnement actif</p>
            <p className="mt-1 text-sm text-emerald-100/90">{planLabel}</p>
            <p className="mt-1 text-sm text-emerald-100/80">
              Prochain renouvellement : {periodEndLabel ?? '—'}
            </p>
            <button
              type="button"
              onClick={() => void handleBillingPortal()}
              disabled={billingLoading}
              className="mt-3 inline-flex rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-dark transition hover:bg-emerald-300 disabled:opacity-70"
            >
              {billingLoading ? 'Ouverture...' : 'Gérer mon abonnement'}
            </button>
          </div>
        ) : subscriptionStatus === 'past_due' ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 sm:p-5">
            <p className="text-sm font-semibold text-amber-200 sm:text-base">⚠️ Paiement échoué</p>
            <p className="mt-1 text-sm text-amber-100/90">
              Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour continuer à utiliser votre abonnement.
            </p>
            <button
              type="button"
              onClick={() => void handleBillingPortal()}
              disabled={billingLoading}
              className="mt-3 inline-flex rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-dark transition hover:bg-amber-300 disabled:opacity-70"
            >
              {billingLoading ? 'Ouverture...' : 'Mettre à jour mon paiement'}
            </button>
          </div>
        ) : subscriptionStatus === 'canceled' ? (
          <div className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-5">
            <p className="text-sm font-semibold text-text sm:text-base">Votre abonnement a été annulé.</p>
            {hasFutureAccess ? (
              <p className="mt-1 text-sm text-text-muted">Vous avez accès jusqu&apos;au {periodEndLabel}.</p>
            ) : null}
            <Link to="/pricing" className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
              Se réabonner
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-dark/40 p-4 text-sm text-text-muted">
            Envie de mods illimités ?{' '}
            <Link to="/pricing" className="font-semibold text-emerald-400 hover:underline">
              Découvrez nos abonnements à partir de 4,99€/mois
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 sm:p-5">
        <p className="text-sm font-semibold text-amber-200 sm:text-base">
          Important : avant de lancer une traduction, consultez le guide d&apos;installation.
        </p>
        <p className="mt-1 text-sm text-amber-100/90">
          Cela évite les erreurs et vous permet d&apos;installer correctement la traduction dès la première fois.
        </p>
        <Link to="/guide" className="mt-3 inline-block text-sm font-semibold text-emerald-400 hover:underline">
          Consulter le guide maintenant →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-10 lg:items-start">
        <div className="order-1 w-full min-w-0 lg:col-span-7">
          <UploadZone />
        </div>
        <div className="order-2 w-full min-w-0 lg:col-span-3">
          <TranslationHistory />
        </div>
      </div>
    </section>
  )
}
