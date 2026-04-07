import { CheckCircle, MousePointerClick, Package, Trophy, Zap } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const features = [
  {
    icon: CheckCircle,
    title: 'Traduction automatique',
    desc: 'Quêtes, objets, interfaces… selon les fichiers de langue disponibles.',
  },
  {
    icon: Zap,
    title: 'Rapide',
    desc: 'Gros pack : souvent moins de 15 min. Le cache accélère la suite.',
  },
  {
    icon: Trophy,
    title: 'Glossaire gaming intégré',
    desc: 'Vocabulaire Minecraft : « Établi », pas « table de fabrication ».',
  },
  {
    icon: MousePointerClick,
    title: 'Zéro configuration',
    desc: 'Pas de mod ni de terminal. Tu envoies le zip.',
  },
  {
    icon: CheckCircle,
    title: 'Mod seul ou modpack entier',
    desc: 'Traduisez un mod seul ou un modpack entier — déposez un .jar ou un .zip et c’est parti.',
  },
  {
    icon: Package,
    title: 'Pack de ressources prêt',
    desc: 'De 1.18 à 1.21+. Tu importes dans ton lanceur et tu joues.',
  },
]

export default function FeaturesSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-24 sm:py-32">
      <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl md:font-bold">
        Tout ce que les autres solutions ne font pas
      </h2>

      <div className="mt-12 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <article
              key={feature.title}
              className="group flex h-full flex-col rounded-xl border border-white/5 bg-surface p-6 transition-colors hover:border-primary/25"
            >
              <Icon
                className="h-7 w-7 text-text-muted transition-colors group-hover:text-primary"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 flex-1 text-sm font-normal leading-relaxed text-text-muted">{feature.desc}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
