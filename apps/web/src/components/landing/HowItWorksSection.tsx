import { motion } from 'framer-motion'
import { CloudUpload, Download, Languages } from 'lucide-react'

const steps = [
  {
    icon: CloudUpload,
    title: '1. Depose ton modpack',
    desc: 'Glisse ton .zip directement dans le navigateur. On accepte tous les modpacks : Forge, Fabric, Quilt, NeoForge.',
  },
  {
    icon: Languages,
    title: '2. Traduction automatique',
    desc: 'Notre moteur analyse chaque mod, detecte les textes et traduit tout en francais. Items, quetes, interfaces, descriptions.',
  },
  {
    icon: Download,
    title: '3. Telecharge et joue',
    desc: "Recupere ton modpack traduit, glisse-le dans ton launcher, c'est pret. Aucune config, aucun mod supplementaire.",
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-white/5 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="text-center font-display text-3xl font-bold sm:text-4xl"
      >
        Simple comme craft un stick
      </motion.h2>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(108,60,225,0.2)]"
            >
              <span className="pointer-events-none absolute -right-2 -top-8 text-8xl font-black text-white/5">{index + 1}</span>
              <Icon className="h-8 w-8 text-secondary" />
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-3 text-sm text-text-muted">{step.desc}</p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
