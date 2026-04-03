import { CheckCircle, MousePointerClick, Package, Trophy, Zap } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const features = [
  {
    icon: CheckCircle,
    title: 'Traduction complète',
    desc: 'Objets, blocs, entités, quêtes FTB, livres Patchouli, progrès… Nous traduisons environ 95 % du contenu visible.',
  },
  {
    icon: Zap,
    title: 'Rapide',
    desc: 'Un gros modpack (200+ mods) traduit en moins de 15 minutes. Les passages suivants peuvent prendre ~2 minutes grâce au cache.',
  },
  {
    icon: Trophy,
    title: 'Qualité jeu vidéo',
    desc: 'Glossaire Minecraft intégré. « Crafting Table » devient « Établi », jamais « Table de fabrication ».',
  },
  {
    icon: MousePointerClick,
    title: 'Zéro configuration',
    desc: 'Pas de mod à installer, pas de clé API, pas de ligne de commande. Tu déposes, nous traduisons.',
  },
  {
    icon: Package,
    title: 'Pack de ressources prêt',
    desc: 'Tu reçois un pack de ressources et les quêtes traduites. Tu copies, tu joues. C’est tout.',
  },
]

export default function FeaturesSection() {
  const sectionRef = useScrollReveal()

  return (
    <section
      ref={sectionRef}
      className="reveal border-t border-white/5 py-20 sm:py-24"
    >
      <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
        Tout ce que les autres solutions ne font pas
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-surface p-6 transition hover:border-transparent hover:[background:linear-gradient(#12121A,#12121A)_padding-box,linear-gradient(135deg,#6C3CE1,#00D4AA)_border-box]"
            >
              <Icon className="h-7 w-7 text-secondary" aria-hidden />
              <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{feature.desc}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
