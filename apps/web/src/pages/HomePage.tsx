import { lazy, Suspense } from 'react'
import HeroSection from '../components/landing/HeroSection'

const HowItWorksSection = lazy(() => import('../components/landing/HowItWorksSection'))
const FeaturesSection = lazy(() => import('../components/landing/FeaturesSection'))
const TestimonialsSection = lazy(() => import('../components/landing/TestimonialsSection'))
const PricingSection = lazy(() => import('../components/landing/PricingSection'))
const FAQSection = lazy(() => import('../components/landing/FAQSection'))
const CTASection = lazy(() => import('../components/landing/CTASection'))

function SectionSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl bg-surface/50" aria-hidden />
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </Suspense>
    </div>
  )
}
