import { motion } from 'framer-motion'
import { Upload, Cpu, Download } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Dépose ton fichier',
    description:
      'Glisse ton modpack (.zip) ou un mod seul (.jar). Forge, Fabric, NeoForge — de 1.18 à 1.21+. Jusqu\'à 2 Go.',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'Traduction automatique',
    description:
      'Extraction des fichiers de langue, application du glossaire gaming (250+ termes), traduction, mise en cache. Un modpack déjà traduit ? Prêt en secondes.',
  },
  {
    icon: Download,
    number: '03',
    title: 'Télécharge et joue',
    description:
      'Resource pack + quêtes traduites. Copie dans ton dossier Minecraft, active le pack, joue. Aucun mod à installer.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-1/50 to-transparent" />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-5xl">
            Simple comme <span className="gradient-text">craft un stick</span>
          </h2>
          <p className="text-lg text-muted">Trois étapes. Zéro configuration.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="card-hover group relative rounded-2xl border border-white/5 bg-surface-2 p-8"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-400/10 transition-colors group-hover:bg-brand-400/20">
                  <step.icon className="h-5 w-5 text-brand-400" />
                </div>
                <span className="text-4xl font-extrabold text-white/5 transition-colors group-hover:text-white/10">{step.number}</span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection