import { CloudUpload, Download, Languages } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const steps = [
  {
    icon: CloudUpload,
    title: '1. Dépose ton fichier',
    desc: 'Glisse ton modpack (.zip) ou un mod seul (.jar). Forge, Fabric, NeoForge — de 1.18 à 1.21+. Jusqu’à 2 Go.',
  },
  {
    icon: Languages,
    title: '2. Traduction automatique',
    desc: 'Notre moteur analyse chaque mod, extrait les fichiers de langue, applique un glossaire gaming de 250+ termes, puis traduit via Google Translate. Les traductions sont mises en cache — un modpack déjà traduit par un autre joueur sera prêt en secondes.',
  },
  {
    icon: Download,
    title: '3. Télécharge et joue',
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
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <article
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_28px_rgba(108,60,225,0.22)]"
            >
              <span className="pointer-events-none absolute -right-2 -top-8 text-8xl font-black text-white/[0.06]">
                {index + 1}
              </span>
              <Icon className="h-8 w-8 text-secondary" aria-hidden />
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{step.desc}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
