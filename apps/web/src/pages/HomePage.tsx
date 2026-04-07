import { lazy, Suspense } from 'react'
import HeroSection from '../components/landing/HeroSection'

const HowItWorksSection = lazy(() => import('../components/landing/HowItWorksSection'))
const FeaturesSection = lazy(() => import('../components/landing/FeaturesSection'))
const StatsSection = lazy(() => import('../components/landing/StatsSection'))
const ModpacksTestedSection = lazy(() => import('../components/landing/ModpacksTestedSection'))
const TestimonialsSection = lazy(() => import('../components/landing/TestimonialsSection'))
const PricingSection = lazy(() => import('../components/landing/PricingSection'))
const FAQSection = lazy(() => import('../components/landing/FAQSection'))
const CTASection = lazy(() => import('../components/landing/CTASection'))

function SectionSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl bg-surface-2/60" aria-hidden />
}

function TransparencySection() {
  return (
    <section className="section-padding border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-white/5 bg-surface-2 p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="md:border-r md:border-white/5 md:pr-8">
              <h3 className="mb-4 text-lg font-semibold text-brand-400">? Ce que ModVF traduit</h3>
              <p className="text-sm leading-relaxed text-muted">
                Items, blocs, entités, enchantements · Interfaces et menus de mods · Quêtes FTB Quests · Descriptions et tooltips ·
                Fichiers de configuration traduisibles · Livres et guides in-game (Patchouli)
              </p>
            </div>
            <div className="md:pl-2">
              <h3 className="mb-4 text-lg font-semibold text-amber-400">?? Limites connues</h3>
              <p className="text-sm leading-relaxed text-muted">
                Certains textes codés en Java restent intraduisibles · Les mods déjà traduits en français ne sont pas retraduits ·
                Certains systèmes de quêtes propriétaires ne sont pas supportés · Le moteur de traduction peut produire des tournures
                approximatives sur certaines phrases complexes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <TransparencySection />
        <TestimonialsSection />
        <ModpacksTestedSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </Suspense>
    </div>
  )
}