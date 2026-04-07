import { motion } from 'framer-motion'
import { ArrowRight, FileArchive, FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

function TranslationFlowVisual() {
  return (
    <div
      className="relative mx-auto mt-12 w-full max-w-4xl rounded-xl border border-white/5 bg-transparent p-6 sm:p-8"
      aria-label="Schéma : fichier modpack traduit automatiquement"
    >
      <div className="relative flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex-1 rounded-xl border border-white/5 bg-surface p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Entrée</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-base font-semibold text-text sm:text-lg">modpack.zip</span>
            <FileArchive className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-2 text-xs text-text-muted">Archive d&apos;origine</p>
        </div>

        <div className="flex h-24 w-full flex-col items-center justify-center gap-2 lg:hidden">
          <div className="h-8 w-px rounded-full bg-white/10" />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">ModVF</span>
          </div>
          <span className="text-xs text-text-muted">Traduction</span>
          <div className="h-8 w-px rounded-full bg-white/10" />
        </div>

        <div className="relative hidden w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 py-2 lg:flex lg:max-w-[11rem] lg:px-1 xl:max-w-[14rem]">
          <div className="relative h-5 w-[112px] shrink-0">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 rounded-full bg-white/10" />
            <div
              className="translate-dot absolute left-0 top-1/2 h-2.5 w-2.5 -mt-1.5 rounded-full bg-primary"
              aria-hidden
            />
          </div>
          <div className="flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">ModVF</span>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-white/5 bg-surface p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Sortie</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-base font-semibold text-text sm:text-lg">resource-pack-fr.zip</span>
            <FileDown className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-2 text-xs text-text-muted">Resource pack prêt à importer</p>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl sm:top-32 sm:h-80 sm:w-80" />

      <motion.div initial="hidden" animate="show" variants={container} className="relative text-center">
        <motion.p
          variants={item}
          className="mx-auto inline-flex max-w-[95vw] items-center justify-center rounded-full border border-primary/25 bg-transparent px-4 py-1.5 text-xs font-medium text-primary sm:text-sm"
        >
          Le 1er traducteur automatique de modpacks
        </motion.p>

        <motion.h1
          variants={item}
          className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl md:font-bold"
        >
          Joue à Minecraft{' '}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">en français</span>
          .
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl px-2 text-base font-normal leading-relaxed text-text-muted sm:text-lg"
        >
          Dépose ton modpack, récupère un resource pack traduit. Compatible Forge, Fabric et NeoForge, de 1.18 à 1.21+.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
        >
          <Link
            to="/dashboard"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-dark transition hover:bg-primary/90 sm:w-auto sm:max-w-none"
          >
            Traduire mon modpack
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            to="/guide"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-text transition hover:border-primary/30 hover:bg-white/[0.05] sm:w-auto sm:max-w-none"
          >
            Voir comment ça marche
            <ArrowRight className="h-4 w-4 opacity-80" strokeWidth={2} />
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <TranslationFlowVisual />
        </motion.div>
      </motion.div>
    </section>
  )
}
