import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditsDisplay } from '../components/ui/CreditsDisplay'
import { TranslationHistory } from '../features/upload/TranslationHistory'
import { UploadZone } from '../features/upload/UploadZone'
import { resolveDisplayName } from '../lib/displayName'
import { useAuthStore } from '../stores/useAuthStore'
import { useToastStore } from '../stores/useToastStore'

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const fetchProfile = useAuthStore((state) => state.fetchProfile)
  const addToast = useToastStore((state) => state.addToast)
  const greetingName = resolveDisplayName(user, profile)

  useEffect(() => {
    document.title = 'Mon espace — ModVF'
  }, [])

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      addToast('success', 'Paiement réussi ! Vos crédits ont été ajoutés.')
      setSearchParams({})
      void fetchProfile()
    }
  }, [addToast, fetchProfile, searchParams, setSearchParams])

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#08080d] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Mon espace</h1>
          <p className="mt-1 text-text-muted">Bienvenue, {greetingName} 👋</p>
        </div>
        <CreditsDisplay />
      </header>

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
