import { BookOpen, Database, FileSearch, Shield } from 'lucide-react'
import { lazy, Suspense } from 'react'
import HeroSection from '../components/landing/HeroSection'

const HowItWorksSection = lazy(() => import('../components/landing/HowItWorksSection'))
const FeaturesSection = lazy(() => import('../components/landing/FeaturesSection'))
const ModpacksTestedSection = lazy(() => import('../components/landing/ModpacksTestedSection'))
const TestimonialsSection = lazy(() => import('../components/landing/TestimonialsSection'))
const PricingSection = lazy(() => import('../components/landing/PricingSection'))
const FAQSection = lazy(() => import('../components/landing/FAQSection'))
const CTASection = lazy(() => import('../components/landing/CTASection'))

function SectionSkeleton() {
  return <div className="h-24 animate-pulse rounded-xl bg-surface/50" aria-hidden />
}

function TransparencySection() {
  return (
    <section className="border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Ce que ModVF traduit</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6">
            <h3 className="text-lg font-bold text-emerald-300">✅ Ce que ModVF traduit</h3>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-text-muted">
              <li>Noms d&apos;items, blocs, entités et enchantements</li>
              <li>Interfaces et menus des mods</li>
              <li>Quêtes FTB Quests (la majorité des modpacks)</li>
              <li>Descriptions et tooltips</li>
              <li>Fichiers de configuration traduisibles</li>
              <li>Livres et guides in-game (Patchouli)</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6">
            <h3 className="text-lg font-bold text-amber-300">⚠️ Limites connues</h3>
            <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-text-muted">
              <li>
                Certains mods codent leurs textes directement en Java — ces textes sont intraduisibles par tout
                resource pack, y compris par des traducteurs humains (ex : Vault Hunters)
              </li>
              <li>
                Les mods qui ont déjà une traduction française intégrée ne seront pas re-traduits — ModVF ne traduit
                que les textes en anglais
              </li>
              <li>Certains systèmes de quêtes propriétaires ne sont pas encore supportés</li>
              <li>
                La qualité de traduction dépend du moteur Google Translate — des termes techniques gaming sont corrigés
                via notre glossaire mais certaines phrases peuvent être approximatives
              </li>
            </ul>
          </article>
        </div>
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
  return (
    <div>
      <HeroSection />
      <Suspense fallback={<SectionSkeleton />}>
        <HowItWorksSection />
        <UnderTheHoodSection />
        <FeaturesSection />
        <TransparencySection />
        <ModpacksTestedSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </Suspense>
    </div>
  )
}
