import { CreditsDisplay } from '../components/ui/CreditsDisplay'
import { TranslationHistory } from '../features/upload/TranslationHistory'
import { UploadZone } from '../features/upload/UploadZone'
import { resolveDisplayName } from '../lib/displayName'
import { useAuthStore } from '../stores/useAuthStore'

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const greetingName = resolveDisplayName(user, profile)

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#08080d] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Mon espace</h1>
          <p className="mt-1 text-text-muted">Bienvenue, {greetingName} 👋</p>
        </div>
        <CreditsDisplay credits={profile?.credits ?? 1} />
      </header>

      <div className="grid gap-6 lg:grid-cols-10 lg:items-start">
        <div className="lg:col-span-7">
          <UploadZone />
        </div>
        <div className="lg:col-span-3">
          <TranslationHistory />
        </div>
      </div>
    </section>
  )
}
