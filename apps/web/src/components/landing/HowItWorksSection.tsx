import { CloudUpload, Download, Languages } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const steps = [
  {
    icon: CloudUpload,
    stepLabel: 'Étape 1',
    title: 'Dépose ton fichier',
    desc: 'Glisse ton modpack (.zip) ou un mod seul (.jar). Forge, Fabric, NeoForge — de 1.18 à 1.21+. Jusqu’à 2 Go.',
  },
  {
    icon: Languages,
    stepLabel: 'Étape 2',
    title: 'Traduction automatique',
    desc: 'Extraction des fichiers de langue, glossaire gaming de 250+ termes, traduction via Google Translate. Le cache accélère les traductions suivantes.',
  },
  {
    icon: Download,
    stepLabel: 'Étape 3',
    title: 'Télécharge et joue',
    desc: 'Récupère ton resource pack + les quêtes traduites. Copie-les dans ton dossier Minecraft, active le resource pack, et joue. Aucun mod à installer, aucune modification du jeu.',
  },
]

export default function HowItWorksSection() {
  const sectionRef = useScrollReveal()

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="reveal border-t border-white/5 py-20 sm:py-24"
    >
      <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Simple comme craft un stick</h2>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className="group h-full rounded-2xl border border-white/10 bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_28px_rgba(108,60,225,0.22)]"
            >
              <div className="flex h-full flex-col">
                <Icon className="h-8 w-8 text-secondary" aria-hidden />
                <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                  {step.stepLabel}
                </span>
                <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                <p className="mt-3 flex-grow text-sm leading-relaxed text-text-muted">{step.desc}</p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
