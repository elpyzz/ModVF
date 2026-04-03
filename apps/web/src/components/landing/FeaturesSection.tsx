import { motion } from 'framer-motion'
import { CheckCircle, MousePointerClick, Package, Puzzle, Trophy, Zap } from 'lucide-react'

const features = [
  {
    icon: CheckCircle,
    title: 'Traduction complète',
    desc: 'Objets, blocs, entités, quêtes FTB, livres Patchouli, progrès… Nous traduisons environ 95 % du contenu visible.',
  },
  {
    icon: Puzzle,
    title: '224 mods pris en charge',
    desc: 'Forge, Fabric, Quilt, NeoForge. De la 1.7.10 à la 1.21+. Better MC, ATM9, RLCraft et bien d’autres.',
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
  return (
    <section className="border-t border-white/5 py-20 sm:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="text-center font-display text-3xl font-bold sm:text-4xl"
      >
        Tout ce que les autres solutions ne font pas
      </motion.h2>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-surface p-6 transition hover:border-transparent hover:[background:linear-gradient(#12121A,#12121A)_padding-box,linear-gradient(135deg,#6C3CE1,#00D4AA)_border-box]"
            >
              <Icon className="h-7 w-7 text-secondary" aria-hidden />
              <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{feature.desc}</p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
