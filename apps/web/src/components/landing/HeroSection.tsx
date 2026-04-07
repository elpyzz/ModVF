import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function TranslationFlowVisual() {
  return (
    <div
      className="relative mx-auto mt-12 w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-surface/80 p-6 shadow-[0_0_60px_rgba(108,60,225,0.12)] backdrop-blur-sm sm:p-10"
      aria-label="Schéma : fichier modpack traduit automatiquement"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(108,60,225,0.35),transparent_58%),radial-gradient(ellipse_at_80%_80%,rgba(0,212,170,0.15),transparent_45%)]" />

      <div className="relative flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex-1 rounded-2xl border border-white/15 bg-dark/70 p-5 shadow-inner sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Entrée</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-base font-bold text-text sm:text-lg">modpack.zip</span>
            <span aria-hidden className="text-2xl sm:text-3xl">
              🇬🇧
            </span>
          </div>
          <p className="mt-2 text-xs text-text-muted">Archive d&apos;origine</p>
        </div>

        <div className="flex h-24 w-full flex-col items-center justify-center gap-2 lg:hidden">
          <div className="h-8 w-0.5 rounded-full bg-gradient-to-b from-primary via-secondary to-primary" />
          <div className="flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-2">
            <span className="text-lg" aria-hidden>
              ⚡
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-secondary">ModVF</span>
          </div>
          <span className="text-xs font-semibold text-secondary">Traduction</span>
          <div className="h-8 w-0.5 rounded-full bg-gradient-to-b from-primary via-secondary to-primary" />
        </div>

        <div className="relative hidden w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 py-2 lg:flex lg:max-w-[11rem] lg:px-1 xl:max-w-[14rem]">
          <div className="relative h-5 w-[112px] shrink-0">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-secondary" />
            <div
              className="translate-dot absolute left-0 top-1/2 h-3 w-3 -mt-1.5 rounded-full bg-secondary shadow-[0_0_20px_rgba(0,212,170,0.9)]"
              aria-hidden
            />
          </div>
          <div className="flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-2">
              <span className="text-lg" aria-hidden>
                ⚡
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-secondary">ModVF</span>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-secondary/35 bg-gradient-to-br from-secondary/10 to-dark/80 p-5 shadow-[0_0_32px_rgba(0,212,170,0.12)] sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">Sortie</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-base font-bold text-text sm:text-lg">resource-pack-fr.zip</span>
            <span aria-hidden className="text-2xl sm:text-3xl">
              🇫🇷
            </span>
          </div>
          <p className="mt-2 text-xs text-text-muted">Pack prêt à importer dans ton lanceur</p>
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 text-secondary/80 sm:right-8 sm:top-6" aria-hidden>
        <span className="text-xl sm:text-2xl">✦ ✧ ✦</span>
      </div>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:top-28 sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

      <motion.div initial="hidden" animate="show" variants={container} className="relative text-center">
        <motion.p
          variants={item}
          className="mx-auto inline-flex max-w-[95vw] items-center justify-center rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary sm:text-sm"
        >
          ✨ Le 1er traducteur automatique de modpacks
        </motion.p>

        <motion.h1
          variants={item}
          className="mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
        >
          Joue à Minecraft{' '}
          <span className="bg-gradient-to-r from-primary via-violet-400 to-secondary bg-clip-text text-transparent">en français</span>
          .
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl px-2 text-base leading-relaxed text-text-muted sm:text-xl"
        >
          Dépose ton modpack, récupère un resource pack traduit. Compatible Forge, Fabric et NeoForge, de 1.18 à 1.21+.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
        >
          <Link
            to="/dashboard"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_36px_rgba(108,60,225,0.55)] transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_0_44px_rgba(108,60,225,0.65)] sm:w-auto sm:max-w-none"
            style={{ animation: 'ctaGlow 4s ease-in-out infinite' }}
          >
            Traduire mon modpack
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/guide"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-semibold text-text backdrop-blur-sm transition hover:border-primary/50 hover:bg-white/10 sm:w-auto sm:max-w-none"
          >
            Voir comment ça marche
            <ArrowRight className="h-4 w-4 opacity-80" />
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <TranslationFlowVisual />
        </motion.div>
      </motion.div>
    </section>
  )
}
