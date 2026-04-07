import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-400/5 px-4 py-2"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
          <span className="text-sm font-medium text-brand-300">Traducteur automatique de modpacks Minecraft</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
        >
          Joue à Minecraft
          <br />
          <span className="gradient-text">en français.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
        >
          Dépose ton modpack. Récupère un resource pack traduit.
          <br className="hidden md:block" />
          Compatible Forge, Fabric et NeoForge — de 1.18 à 1.21+.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/dashboard"
            className="group flex items-center gap-2 rounded-xl bg-brand-400 px-8 py-4 font-semibold text-surface-0 transition-all duration-300 hover:bg-brand-500 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]"
          >
            Traduire mon modpack
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/guide"
            className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-4 font-medium text-white/80 transition-all duration-300 hover:border-white/20 hover:text-white"
          >
            <Play className="h-4 w-4" />
            Comment ça marche
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto max-w-2xl"
        >
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="flex-1 rounded-xl border border-white/5 bg-surface-2 p-4 text-center md:p-5">
              <div className="mb-2 text-xs uppercase tracking-wider text-muted">Entrée</div>
              <div className="font-mono text-sm text-white/90">modpack.zip</div>
              <div className="mt-1 text-xs text-muted">Archive d'origine</div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-400/20 bg-brand-400/10">
                <span className="text-xs font-bold text-brand-400">VF</span>
              </div>
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
                <ArrowRight className="h-4 w-4 text-brand-400" />
              </motion.div>
            </div>

            <div className="glow-green flex-1 rounded-xl border border-brand-400/10 bg-surface-2 p-4 text-center md:p-5">
              <div className="mb-2 text-xs uppercase tracking-wider text-brand-400">Sortie</div>
              <div className="font-mono text-sm text-white/90">resource-pack-fr.zip</div>
              <div className="mt-1 text-xs text-muted">Prêt à importer</div>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-xs text-muted"
        >
          Première traduction gratuite · Sans carte bancaire · Paiement sécurisé Stripe
        </motion.p>
      </div>
    </section>
  )
}

export default HeroSection