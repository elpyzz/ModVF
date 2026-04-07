import { BookOpen, Database, FileSearch, Shield } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
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

function TransparencySection() {
  const items = [
    "Noms d'items et de blocs",
    'Interfaces et menus des mods',
    'Quêtes FTB Quests',
    'Descriptions et tooltips',
    'Livres et guides in-game',
    'Fichiers de configuration',
  ]

  return (
    <section className="border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Tout ce qui change quand tu installes ModVF</h2>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-y-4 gap-x-8 md:grid-cols-3">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2 py-2 text-white/90">
              <span className="text-emerald-400">✅</span>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-gray-500">
          Environ 5% des textes sont codés en Java par les développeurs de mods et ne peuvent être traduits par aucun
          outil.{' '}
          <a href="/faq" className="text-gray-400 underline">
            En savoir plus
          </a>
        </p>
      </div>
    </section>
  )
}

function UnderTheHoodSection() {
  const items = [
    {
      title: 'Extraction intelligente',
      desc: 'Analyse chaque .jar du modpack pour extraire les fichiers de langue (en_us.json).',
      Icon: FileSearch,
    },
    {
      title: 'Glossaire gaming',
      desc: '250+ termes corrigés automatiquement (Redstone, Ender Pearl, Nether Portal ne sont pas traduits).',
      Icon: BookOpen,
    },
    {
      title: 'Cache partagé',
      desc: 'Chaque traduction enrichit le cache. Plus la communauté traduit, plus c’est rapide pour tout le monde.',
      Icon: Database,
    },
    {
      title: 'Protection des placeholders',
      desc: 'Les codes techniques (%s, %d, %1$s) sont préservés pour éviter les crashs.',
      Icon: Shield,
    },
  ]

  return (
    <section className="border-t border-white/5 bg-dark/30 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Comment ça fonctionne</h2>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
          {items.map(({ title, desc, Icon }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-surface p-6">
              <Icon className="mb-3 h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  useEffect(() => {
    document.title = 'ModVF — Traduis tes modpacks Minecraft en français'
  }, [])

  return (
    <div>
      <HeroSection />
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorksSection />
        <UnderTheHoodSection />
        <FeaturesSection />
        <TransparencySection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </Suspense>
    </div>
  )
}
