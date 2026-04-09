import { ArrowRight, FileArchive, Globe2, PackageCheck, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const steps = [
  { Icon: FileArchive, title: '📤 Uploadez votre modpack', desc: '(.zip ou .jar)' },
  { Icon: Search, title: '🔍 ModVF extrait les textes anglais', desc: '(en_us.json)' },
  { Icon: Globe2, title: '🌍 Traduction automatique + glossaire gaming', desc: '250+ termes Minecraft' },
  { Icon: PackageCheck, title: '📦 Téléchargez votre resource pack français', desc: 'Mods originaux intacts' },
]

export default function HowItWorksShortSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 bg-dark/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Comment ça marche (résumé)</h2>
            <p className="mt-3 max-w-2xl text-base text-text-muted sm:text-lg">
              Une pipeline simple et transparente : upload → extraction → traduction → resource pack.
            </p>
          </div>
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-text transition hover:border-primary/50 hover:bg-white/[0.06]"
          >
            En savoir plus <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <article key={i} className="rounded-2xl border border-white/10 bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <s.Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Étape {i + 1}</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-white">{s.title}</p>
              <p className="mt-1 text-xs text-text-muted">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

