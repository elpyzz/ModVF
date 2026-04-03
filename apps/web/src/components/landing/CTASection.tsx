import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section className="border-t border-white/5 py-20 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-primary/25 bg-dark p-10 text-center sm:p-14"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(108,60,225,0.35),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(108,60,225,0.12),transparent)]" />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Prêt à jouer en français ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
            Ta première traduction est gratuite. Aucune carte bancaire requise.
          </p>
          <Link
            to="/dashboard"
            className="mx-auto mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_36px_rgba(108,60,225,0.55)] transition hover:-translate-y-0.5 hover:bg-primary/90"
            style={{ animation: 'ctaGlow 4s ease-in-out infinite' }}
          >
            Traduire mon premier modpack
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
