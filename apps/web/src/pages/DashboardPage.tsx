import { CreditsDisplay } from '../components/ui/CreditsDisplay'
import { TranslationHistory } from '../features/upload/TranslationHistory'
import { UploadZone } from '../features/upload/UploadZone'

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#08080d] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Mon espace</h1>
          <p className="mt-1 text-text-muted">Salut, joueur 👋</p>
        </div>
        <CreditsDisplay credits={3} />
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
