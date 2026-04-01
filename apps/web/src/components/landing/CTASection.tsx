import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTASection() {
  return (
    <section className="border-t border-white/5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 to-transparent p-10 text-center"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Pret a jouer en francais ?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-text-muted">
          Ta premiere traduction est gratuite. Aucune carte bancaire requise.
        </p>
        <Link
          to="/dashboard"
          className="mx-auto mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(108,60,225,0.5)] transition hover:-translate-y-0.5 hover:bg-primary/90"
        >
          Traduire mon premier modpack
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  )
}
