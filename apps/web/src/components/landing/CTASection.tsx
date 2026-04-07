import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CTASection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400/10 via-transparent to-brand-400/5" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-5xl">
          Prêt à jouer <span className="gradient-text">en français</span> ?
        </h2>
        <p className="mb-8 text-lg text-muted">Première traduction gratuite. Sans carte bancaire.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-400 px-8 py-4 font-semibold text-surface-0 transition-all duration-300 hover:bg-brand-500 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]"
        >
          Traduire mon premier modpack
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

export default CTASection