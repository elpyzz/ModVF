import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Lock, Mail, RotateCcw, Zap } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHasCompletedModpack } from '../hooks/useHasCompletedModpack'
import { useAuthStore } from '../stores/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const STARTER_PRICE_ID =
  import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_1TI87wHz8fVVNyb1NvoenrZc'
const PACK_PRICE_ID =
  import.meta.env.VITE_STRIPE_PACK_PRICE_ID || 'price_1TI88tHz8fVVNyb1CujboMHJ'
const SUB_STARTER_MONTHLY_PRICE_ID =
  import.meta.env.VITE_STRIPE_SUB_STARTER_MONTHLY_PRICE_ID || 'price_1TJyu5Hz8fVVNyb1GCUwm3Bg'
const SUB_PACK_MONTHLY_PRICE_ID =
  import.meta.env.VITE_STRIPE_SUB_PACK_MONTHLY_PRICE_ID || 'price_1TJyvIHz8fVVNyb1aOSLkNA3'
const SUB_PACK_ANNUAL_PRICE_ID =
  import.meta.env.VITE_STRIPE_SUB_PACK_ANNUAL_PRICE_ID || 'price_1TJyw8Hz8fVVNyb1Y9n6g756'
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const faqTarifs = [
  {
    q: 'Combien de temps durent mes crédits ?',
    a: 'Vos crédits sont valables 6 mois à partir de l’achat.',
  },
  {
    q: 'Puis-je obtenir un remboursement ?',
    a: 'Oui, dans les 14 jours si vous n’avez utilisé aucun crédit. Contactez-nous par courriel.',
  },
  {
    q: 'Comment fonctionne le crédit gratuit ?',
    a: 'À l’inscription, vous recevez 1 crédit gratuit pour tester le service. Aucune carte bancaire requise.',
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: 'Carte bancaire (Visa, Mastercard, American Express) via Stripe, référence mondiale du paiement sécurisé.',
  },
]

function FeatureLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm text-text-muted">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
      <span>{children}</span>
    </li>
  )
}

export default function PricingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const profile = useAuthStore((state) => state.profile)
  const { hasCompletedModpack, isLoading: isCompletedCheckLoading } = useHasCompletedModpack()
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  void stripePromise

  const discoveryHref = isAuthenticated ? '/dashboard' : '/register'

  async function handleCheckout(plan: 'starter' | 'pro') {
    const session = useAuthStore.getState().session
    if (!session?.access_token) {
      window.location.href = '/login'
      return
    }

    setLoadingPlan(plan)
    const priceId = plan === 'starter' ? STARTER_PRICE_ID : PACK_PRICE_ID
    try {
      console.log('[CHECKOUT] Starting...', { plan, priceId, apiUrl: API_URL })
      const res = await fetch(API_URL + '/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ priceId }),
      })
      console.log('[CHECKOUT] Response status:', res.status)
      const data = await res.json()
      console.log('[CHECKOUT] Response data:', data)
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('[CHECKOUT] No URL in response:', data)
        alert('Erreur lors de la création du paiement. Veuillez réessayer.')
      }
    } catch (err) {
      console.error('[CHECKOUT] Error:', err)
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  async function handleSubscription(priceId: string) {
    const session = useAuthStore.getState().session
    if (!session?.access_token) {
      window.location.href = '/login'
      return
    }
    setLoadingPlan(priceId)
    try {
      console.log('Subscribe request:', { priceId, userId: session.user?.id })
      const res = await fetch(API_URL + '/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      console.log('Subscribe response:', res.status, data)
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data?.error || 'Erreur lors de la création de l’abonnement.')
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  async function handleBillingPortal() {
    const session = useAuthStore.getState().session
    const userId = session?.user?.id
    if (!session?.access_token || !userId) {
      window.location.href = '/login'
      return
    }
    setLoadingPlan('billing_portal')
    try {
      const res = await fetch(API_URL + '/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data?.error || 'Erreur lors de l’ouverture de l’espace abonné.')
      }
    } catch {
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  function handleFreeRedirect() {
    setLoadingPlan('free')
    window.location.href = discoveryHref
  }

  const subscriptionStatus = profile?.subscription_status ?? 'none'
  const subscriptionPlan = profile?.subscription_plan ?? null
  const hasActiveSubscription = subscriptionStatus === 'active'

  const subscriptionPlans: Array<{
    key: string
    name: string
    price: string
    priceId: string
    features: string[]
    accent: 'secondary' | 'primary'
    badge?: string
    subtitle?: string
  }> = [
    {
      key: 'starter_monthly',
      name: 'Starter Mensuel',
      price: '4,99€/mois',
      priceId: SUB_STARTER_MONTHLY_PRICE_ID,
      features: ['3 modpacks simultanés', 'Mods illimités', 'Téléchargement 72h'],
      accent: 'secondary',
      badge: undefined,
      subtitle: undefined,
    },
    {
      key: 'pack_monthly',
      name: 'Pack Mensuel',
      price: '9,99€/mois',
      priceId: SUB_PACK_MONTHLY_PRICE_ID,
      features: ['10 modpacks simultanés', 'Mods illimités', 'Téléchargement 7 jours'],
      badge: 'Populaire',
      accent: 'primary',
      subtitle: undefined,
    },
    {
      key: 'pack_annual',
      name: 'Pack Annuel',
      price: '89€/an',
      subtitle: 'soit 7,42€/mois — Économisez 31%',
      priceId: SUB_PACK_ANNUAL_PRICE_ID,
      features: ['10 modpacks simultanés', 'Mods illimités', 'Téléchargement 7 jours'],
      badge: 'Meilleure offre',
      accent: 'primary',
    },
  ]

  useEffect(() => {
    document.title = 'Tarifs ModVF — Traduction de modpacks Minecraft'
  }, [])

  return (
    <div className="space-y-16 pb-8 sm:space-y-20">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-2xl border border-white/10 bg-surface/80 p-8 text-center sm:p-10"
      >
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Tarifs ModVF</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
          Choisissez la formule la plus adaptée à votre usage.
        </p>
      </motion.header>

      <section className="space-y-6">
        {(!isAuthenticated || (!isCompletedCheckLoading && !hasCompletedModpack)) && (
          <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-6">
            <h2 className="text-xl font-semibold text-white">🎁 Votre première traduction est offerte</h2>
            <p className="mt-2 text-sm text-text-muted">
              Traduisez votre premier modpack gratuitement, sans limite de taille. Aucune carte bancaire requise.
              Créez un compte et lancez votre première traduction.
            </p>
            <Link
              to={discoveryHref}
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Commencer gratuitement
            </Link>
          </div>
        )}
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Abonnements</h2>
          <p className="mt-2 text-sm text-text-muted">Accès prioritaire et limites élargies pour les joueurs réguliers.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {subscriptionPlans.map((plan, idx) => {
            const isActiveCard = hasActiveSubscription && subscriptionPlan === plan.key
            const isLoading = loadingPlan === plan.priceId || loadingPlan === 'billing_portal'
            const isPrimary = plan.accent === 'primary'
            return (
              <motion.article
                key={plan.key}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 + idx * 0.05 }}
                className={`relative flex flex-col rounded-2xl p-6 sm:p-8 ${
                  isPrimary
                    ? 'border border-primary/40 bg-gradient-to-b from-primary/10 to-surface shadow-[0_0_28px_rgba(108,60,225,0.28)]'
                    : 'border border-white/10 bg-surface'
                }`}
              >
                {plan.badge ? (
                  <span className="absolute right-4 top-4 rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold text-secondary">
                    {plan.badge}
                  </span>
                ) : null}
                {isActiveCard ? (
                  <span className="absolute left-4 top-4 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Actif
                  </span>
                ) : null}
                <p
                  className={`text-sm font-semibold uppercase tracking-wide ${isPrimary ? 'text-primary' : 'text-text-muted'} ${
                    isActiveCard ? 'mt-6' : ''
                  }`}
                >
                  {plan.name}
                </p>
                <p className="mt-4 font-display text-4xl font-extrabold">{plan.price}</p>
                {plan.subtitle ? <p className="mt-2 text-sm text-emerald-300">{plan.subtitle}</p> : null}
                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <FeatureLine key={f}>{f}</FeatureLine>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={!!loadingPlan}
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = '/login'
                      return
                    }
                    if (hasActiveSubscription) {
                      void handleBillingPortal()
                      return
                    }
                    void handleSubscription(plan.priceId)
                  }}
                  className={`mt-8 w-full rounded-xl py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                    isPrimary
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-secondary text-dark hover:bg-secondary/90'
                  }`}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center justify-center">
                      <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirection...
                    </span>
                  ) : hasActiveSubscription ? (
                    isActiveCard ? 'Gérer mon abonnement' : 'Changer de plan'
                  ) : (
                    "S'abonner"
                  )}
                </button>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-center font-display text-xl font-bold sm:text-2xl">Ou achetez des crédits à l&apos;unité</h2>
      </section>

      <div className="grid w-full gap-6 lg:grid-cols-3 lg:items-stretch">
        {/* Découverte */}
        <motion.article
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          whileHover={{ scale: 1.01 }}
          className="flex flex-col rounded-2xl border border-white/10 bg-surface p-6 sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Découverte</p>
          <p className="mt-4 font-display text-4xl font-extrabold sm:text-5xl">0€</p>
          <p className="mt-2 text-sm text-text-muted">Pour découvrir ModVF</p>
          <ul className="mt-8 flex flex-1 flex-col gap-3">
            <FeatureLine>1 traduction de modpack offerte + 3 mods par jour</FeatureLine>
            <FeatureLine>Modpacks jusqu’à 50 mods</FeatureLine>
            <FeatureLine>Pack de ressources + quêtes traduites</FeatureLine>
            <FeatureLine>Téléchargement 24 h</FeatureLine>
          </ul>
          <button
            type="button"
            onClick={handleFreeRedirect}
            disabled={!!loadingPlan}
            className="mt-8 block w-full rounded-xl border border-white/20 py-3.5 text-center text-sm font-semibold text-text transition hover:border-primary/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingPlan === 'free' ? (
              <span className="inline-flex items-center justify-center">
                <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirection vers Stripe...
              </span>
            ) : (
              'Essayer gratuitement'
            )}
          </button>
        </motion.article>

        {/* Starter */}
        <motion.article
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="relative flex flex-col rounded-2xl border border-transparent bg-surface p-6 shadow-[0_0_40px_rgba(108,60,225,0.25)] [background:linear-gradient(#12121A,#12121A)_padding-box,linear-gradient(135deg,#6C3CE1,#00D4AA)_border-box] lg:scale-[1.03] sm:p-8"
        >
          <span className="absolute right-4 top-4 rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold text-secondary">
            Le plus populaire
          </span>
          <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Starter</p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <p className="font-display text-4xl font-extrabold sm:text-5xl">7€</p>
            <p className="pb-1 text-sm text-text-muted line-through">9€</p>
          </div>
          <p className="mt-2 text-sm text-text-muted">Pour les joueurs réguliers</p>
          <ul className="mt-8 flex flex-1 flex-col gap-3">
            <FeatureLine>3 traductions de modpacks + mods illimités</FeatureLine>
            <FeatureLine>Tous les modpacks, toutes tailles</FeatureLine>
            <FeatureLine>Pack de ressources + quêtes traduites</FeatureLine>
            <FeatureLine>Téléchargement 72 h</FeatureLine>
            <FeatureLine>Support prioritaire</FeatureLine>
            <FeatureLine>Valable 6 mois</FeatureLine>
          </ul>
          <button
            type="button"
            onClick={() => void handleCheckout('starter')}
            disabled={!!loadingPlan}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(108,60,225,0.45)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ animation: 'ctaGlow 4s ease-in-out infinite' }}
          >
            {loadingPlan === 'starter' ? (
              <span className="inline-flex items-center justify-center">
                <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirection vers Stripe...
              </span>
            ) : (
              'Acheter le Starter — 7€'
            )}
          </button>
        </motion.article>

        {/* Pack */}
        <motion.article
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          whileHover={{ scale: 1.01 }}
          className="flex flex-col rounded-2xl border border-white/10 bg-surface p-6 sm:p-8"
        >
          <span className="inline-flex w-fit rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
            Meilleur rapport qualité-prix
          </span>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Pack</p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <p className="font-display text-4xl font-extrabold sm:text-5xl">12€</p>
            <p className="pb-1 text-sm text-text-muted line-through">15€</p>
          </div>
          <p className="mt-2 text-sm text-text-muted">Pour les passionnés</p>
          <ul className="mt-8 flex flex-1 flex-col gap-3">
            <FeatureLine>10 traductions de modpacks + mods illimités</FeatureLine>
            <FeatureLine>Tous les modpacks, toutes tailles</FeatureLine>
            <FeatureLine>Pack de ressources + quêtes traduites</FeatureLine>
            <FeatureLine>Téléchargement 7 jours</FeatureLine>
            <FeatureLine>Support prioritaire</FeatureLine>
            <FeatureLine>Traductions incrémentales</FeatureLine>
            <FeatureLine>Valable 6 mois</FeatureLine>
          </ul>
          <button
            type="button"
            onClick={() => void handleCheckout('pro')}
            disabled={!!loadingPlan}
            className="mt-8 w-full rounded-xl border border-white/20 py-3.5 text-sm font-semibold text-text transition hover:border-primary/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingPlan === 'pro' ? (
              <span className="inline-flex items-center justify-center">
                <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirection vers Stripe...
              </span>
            ) : (
              'Choisir le Pack — 12€'
            )}
          </button>
        </motion.article>
      </div>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Quels modpacks sont compatibles ?</h2>
        <h3 className="text-lg font-semibold text-white">Compatibilité des modpacks</h3>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-4">
            <h4 className="font-semibold text-emerald-300">✅ Traduction complète</h4>
            <ul className="mt-3 space-y-1 text-sm text-text-muted">
              <li>ATM10 — 211 000 lignes</li>
              <li>Better Minecraft — 41 000 lignes</li>
              <li>DawnCraft — 28 000 lignes</li>
              <li>Dungeon Heroes — 20 788 lignes</li>
              <li>Minecraft Legendary — 28 497 lignes</li>
              <li>Beyond Depth — 41 987 lignes</li>
              <li>Et tous les modpacks 1.18+ non listés ici</li>
            </ul>
          </article>

          <article className="rounded-xl border border-orange-500/30 bg-orange-900/20 p-4">
            <h4 className="font-semibold text-orange-300">⚠️ Quêtes partiellement traduites</h4>
            <ul className="mt-3 space-y-1 text-sm text-text-muted">
              <li>Prominence II — 66 000 lignes (la majorité des quêtes sont traduites, certaines restent en anglais)</li>
            </ul>
          </article>

          <article className="rounded-xl border border-yellow-500/30 bg-yellow-900/20 p-4">
            <h4 className="font-semibold text-yellow-300">📦 Items traduits, quêtes non supportées</h4>
            <ul className="mt-3 space-y-1 text-sm text-text-muted">
              <li>MC Eternal 2 — 94 000 lignes (items et descriptions OK, quêtes incompatibles)</li>
              <li>Vault Hunters — 31 000 lignes (certains éléments Java hardcodés)</li>
              <li>FTB StoneBlock 4 — quêtes incompatibles avec la traduction</li>
            </ul>
          </article>
        </div>

        <p className="text-sm text-text-muted">
          Votre modpack n&apos;est pas dans la liste ? Essayez quand même ! ModVF est compatible avec tous les modpacks
          1.18+. La traduction des items et descriptions fonctionne dans tous les cas.
        </p>
      </section>

      <section className="mt-20 mx-auto max-w-4xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">Comparatif détaillé</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="w-1/3 py-4 pr-4 text-left font-medium text-gray-400">Fonctionnalité</th>
                <th className="py-4 px-4 text-center font-medium text-gray-400">
                  Découverte
                  <br />
                  <span className="text-lg font-bold text-white">0€</span>
                </th>
                <th className="py-4 px-4 text-center font-medium">
                  <span className="text-emerald-400">Starter</span>
                  <br />
                  <span className="text-lg font-bold text-white">7€</span>
                </th>
                <th className="py-4 px-4 text-center font-medium text-gray-400">
                  Pack
                  <br />
                  <span className="text-lg font-bold text-white">12€</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Traductions de modpacks', free: '1', starter: '3', pack: '10' },
                { feature: 'Traduction de mods individuels', free: '3 / jour', starter: 'Illimité', pack: 'Illimité' },
                { feature: "Taille de modpack", free: "Jusqu'à 50 mods", starter: 'Illimité', pack: 'Illimité' },
                { feature: 'Resource pack + quêtes', free: true, starter: true, pack: true },
                { feature: 'Glossaire gaming (250+ termes)', free: true, starter: true, pack: true },
                { feature: 'Cache communautaire', free: true, starter: true, pack: true },
                { feature: 'Durée de téléchargement', free: '24 h', starter: '72 h', pack: '7 jours' },
                { feature: 'Téléchargements par traduction', free: '3', starter: '3', pack: '3' },
                { feature: 'Support', free: 'FAQ', starter: 'Email prioritaire', pack: 'Email prioritaire' },
                { feature: 'Validité des crédits', free: '—', starter: 'Illimitée', pack: 'Illimitée' },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="py-3.5 pr-4 text-gray-300">{row.feature}</td>
                  {['free', 'starter', 'pack'].map((plan) => {
                    const val = row[plan as keyof typeof row]
                    return (
                      <td
                        key={plan}
                        className={`py-3.5 px-4 text-center ${plan === 'starter' ? 'bg-emerald-400/[0.03]' : ''}`}
                      >
                        {val === true ? (
                          <svg
                            className="mx-auto h-5 w-5 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : val === false ? (
                          <span className="text-gray-600">—</span>
                        ) : (
                          <span className={`${plan === 'starter' ? 'font-medium text-emerald-400' : 'text-gray-300'}`}>
                            {val}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
          <span>
            <Lock className="mr-1 inline h-3.5 w-3.5 text-gray-500" />
            Paiement sécurisé par Stripe
          </span>
          <span>
            <Zap className="mr-1 inline h-3.5 w-3.5 text-gray-500" />
            Crédits ajoutés instantanément
          </span>
          <span>
            <Mail className="mr-1 inline h-3.5 w-3.5 text-gray-500" />
            Support par email : contact@modvf.fr
          </span>
          <span>
            <RotateCcw className="mr-1 inline h-3.5 w-3.5 text-gray-500" />
            Satisfait ou remboursé sous 7 jours
          </span>
        </div>
      </section>

      <section className="border-t border-white/5 pt-16">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-2xl font-bold sm:text-3xl"
        >
          Questions sur les tarifs
        </motion.h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqTarifs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div key={faq.q} className="rounded-xl border border-white/10 bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text"
                  aria-expanded={isOpen}
                >
                  {faq.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">{faq.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-t border-white/5 pt-12">
        <h2 className="text-center font-display text-xl font-bold sm:text-2xl">FAQ Abonnements</h2>
        <div className="mx-auto mt-6 max-w-3xl space-y-3">
          {[
            {
              q: 'Puis-je annuler à tout moment ?',
              a: 'Oui, vous pouvez annuler depuis votre espace abonné. Votre accès reste actif jusqu’à la fin de la période payée.',
            },
            {
              q: 'Les crédits que j’ai déjà achetés sont-ils perdus ?',
              a: 'Non, vos crédits restent disponibles et valides même avec un abonnement.',
            },
            {
              q: 'Quelle est la différence entre abonnement et crédits ?',
              a: 'L’abonnement vous donne un accès illimité aux mods chaque mois. Les crédits sont des achats ponctuels.',
            },
          ].map((row, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-surface p-4">
              <p className="text-sm font-semibold text-text">{row.q}</p>
              <p className="mt-2 text-sm text-text-muted">{row.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
