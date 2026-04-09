import { BookOpen, Database, FileSearch, Shield } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import HeroSection from '../components/landing/HeroSection'
import BeforeAfterSection from '../components/landing/BeforeAfterSection'
import ModpacksVisualSection from '../components/landing/ModpacksVisualSection'
import LiveCounterSection from '../components/landing/LiveCounterSection'

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
        <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-5">
              {items.map(({ title, desc, Icon }, index) => (
                <article key={title} className="relative pl-12 md:pl-0">
                  <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xs font-bold text-emerald-400 md:relative md:top-0 md:mx-auto">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="md:mt-3 md:text-center">
                    <Icon className="mb-2 h-4 w-4 text-emerald-400 md:mx-auto" />
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function VideoSection() {
  return (
    <section className="border-t border-white/5 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Voir ModVF en action</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-text-muted sm:text-base">
          Découvrez comment traduire votre modpack en quelques minutes
        </p>
        <div className="mx-auto mt-8 w-full max-w-[720px] overflow-hidden rounded-xl shadow-lg">
          <iframe
            width="100%"
            style={{ aspectRatio: '16 / 9', maxWidth: '720px' }}
            src="https://www.youtube.com/embed/W2hp4I---po"
            title="Tutoriel ModVF"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
        <ModpacksVisualSection />
        <UnderTheHoodSection />
        <VideoSection />
        <FeaturesSection />
        <TransparencySection />
        <TestimonialsSection />
        <BeforeAfterSection />
        <PricingSection />
        <FAQSection />
        <LiveCounterSection />
        <CTASection />
      </Suspense>
    </div>
  )
}
