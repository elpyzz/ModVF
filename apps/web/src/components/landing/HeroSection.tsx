import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

function TranslationFlowVisual() {
  return (
    <motion.div
      variants={item}
      className="relative mx-auto mt-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-surface p-6"
      aria-label="Illustration de traduction automatique de modpack"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,60,225,0.25),transparent_55%)]" />
      <div className="relative grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-white/10 bg-dark/60 p-4">
          <p className="text-xs text-text-muted">Entrée</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">modpack.zip</span>
            <span aria-label="Drapeau Royaume-Uni" className="text-xl">🇬🇧</span>
          </div>
        </div>

        <div className="relative h-10">
          <motion.div
            className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-secondary"
            animate={{ x: ['0%', '260%'], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          />
          <div className="h-full w-24 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
        </div>

        <div className="rounded-xl border border-white/10 bg-dark/60 p-4">
          <p className="text-xs text-text-muted">Sortie</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">modpack-fr.zip</span>
            <span aria-label="Drapeau France" className="text-xl">🇫🇷</span>
          </div>
        </div>
      </div>

      <motion.div
        className="pointer-events-none absolute right-6 top-4 text-secondary"
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        ✦ ✧ ✦
      </motion.div>
    </motion.div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />

      <motion.div initial="hidden" animate="show" variants={container} className="relative text-center">
        <motion.p variants={item} className="mx-auto inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
          ✨ Le premier traducteur automatique de modpacks
        </motion.p>

        <motion.h1 variants={item} className="mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
          Joue a Minecraft <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">en francais</span>.
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-6 max-w-2xl text-base text-text-muted sm:text-xl">
          Glisse ton modpack, recupere-le traduit. En quelques minutes, pas en quelques heures.
        </motion.p>

        <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(108,60,225,0.5)] transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Traduire mon modpack
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-text transition hover:border-primary/60 hover:text-white"
          >
            Voir comment ca marche
          </a>
        </motion.div>

        <motion.p variants={item} className="mt-6 text-sm text-text-muted">
          500+ modpacks traduits · 50 000+ strings traduites · Qualite pro
        </motion.p>

        <TranslationFlowVisual />
      </motion.div>
    </section>
  )
}
