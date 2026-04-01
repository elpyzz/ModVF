import { motion } from 'framer-motion'
import { CheckCircle, MousePointerClick, Puzzle, RefreshCw, Trophy, Zap } from 'lucide-react'

const features = [
  {
    icon: CheckCircle,
    title: 'Traduction complete',
    desc: "Items, blocs, entites, quetes, interfaces, livres, panneaux... On traduit TOUT, pas juste les noms d'items.",
  },
  {
    icon: Puzzle,
    title: 'Compatible tous modpacks',
    desc: 'Forge, Fabric, Quilt, NeoForge. De 1.7.10 a 1.21+. Peu importe la taille ou le nombre de mods.',
  },
  {
    icon: Zap,
    title: 'Rapide',
    desc: 'Un modpack de 200 mods traduit en moins de 2 minutes. Pas besoin dattendre des heures.',
  },
  {
    icon: Trophy,
    title: 'Qualite gaming',
    desc: "Notre moteur connait le vocabulaire Minecraft. 'Crafting Table' -> 'Etabli', pas 'Table dartisanat'.",
  },
  {
    icon: MousePointerClick,
    title: 'Zero config',
    desc: 'Pas de mod a installer, pas de cle API a configurer, pas de ligne de commande. Tu drop, on traduit.',
  },
  {
    icon: RefreshCw,
    title: 'Mises a jour faciles',
    desc: 'Ton modpack a ete mis a jour ? Re-traduis en un clic. On ne retraduit que ce qui a change.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="border-t border-white/5 py-24">
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
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-surface p-6 transition hover:border-transparent hover:[background:linear-gradient(#12121A,#12121A)_padding-box,linear-gradient(135deg,#6C3CE1,#00D4AA)_border-box]"
            >
              <Icon className="h-7 w-7 text-secondary" />
              <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm text-text-muted">{feature.desc}</p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
