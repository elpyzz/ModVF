import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export default function CTASection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-24 sm:py-32">
      <div className="relative overflow-hidden rounded-xl border border-purchase/15 bg-surface p-10 text-center sm:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(139,92,246,0.08),transparent_65%)]" />
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl md:font-bold">Prêt à jouer en français ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-normal text-text-muted sm:text-lg">
            Ta première traduction est gratuite. Aucune carte bancaire requise.
          </p>
          <Link
            to="/dashboard"
            className="mx-auto mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-dark transition hover:bg-primary/90"
          >
            Traduire mon premier modpack
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  )
}
