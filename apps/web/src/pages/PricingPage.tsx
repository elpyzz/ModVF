import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const STARTER_PRICE_ID =
  import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_1TI87wHz8fVVNyb1NvoenrZc'
const PACK_PRICE_ID =
  import.meta.env.VITE_STRIPE_PACK_PRICE_ID || 'price_1TI88tHz8fVVNyb1CujboMHJ'
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

async function handleCheckout(plan: 'starter' | 'pro') {
  const session = useAuthStore.getState().session
  if (!session?.access_token) {
    window.location.href = '/login'
    return
  }

  const priceId = plan === 'starter' ? STARTER_PRICE_ID : PACK_PRICE_ID

  const res = await fetch(API_URL + '/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + session.access_token,
    },
    body: JSON.stringify({ priceId }),
  })
  const { url } = await res.json()
  window.location.href = url
}

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
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  void stripePromise

  const discoveryHref = isAuthenticated ? '/dashboard' : '/register'

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
          Choisissez le pack adapté à vos besoins. Première traduction offerte.
        </p>
      </motion.header>

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
          <Link
            to={discoveryHref}
            className="mt-8 block w-full rounded-xl border border-white/20 py-3.5 text-center text-sm font-semibold text-text transition hover:border-primary/50 hover:bg-white/5"
          >
            Commencer gratuitement
          </Link>
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
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(108,60,225,0.45)] transition hover:opacity-95"
            style={{ animation: 'ctaGlow 4s ease-in-out infinite' }}
          >
            Acheter le Starter — 7€
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
            className="mt-8 w-full rounded-xl border border-white/20 py-3.5 text-sm font-semibold text-text transition hover:border-primary/50 hover:bg-white/5"
          >
            Acheter le Pack — 12€
          </button>
        </motion.article>
      </div>

      <section className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
        <h2 className="text-center font-display text-xl font-bold sm:text-2xl">Réassurance</h2>
        <ul className="mx-auto mt-5 grid max-w-4xl gap-3 text-sm text-text-muted sm:grid-cols-2">
          <li className="rounded-xl border border-white/10 bg-dark/30 p-3">
            Première traduction offerte — sans carte bancaire
          </li>
          <li className="rounded-xl border border-white/10 bg-dark/30 p-3">Paiement sécurisé par Stripe</li>
          <li className="rounded-xl border border-white/10 bg-dark/30 p-3">Crédits valables 6 mois</li>
          <li className="rounded-xl border border-white/10 bg-dark/30 p-3">Satisfait ou remboursé sous 7 jours</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
        <h2 className="text-center font-display text-xl font-bold sm:text-2xl">Comparatif rapide</h2>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-dark/40 p-3 font-semibold text-text">Fonction</div>
          <div className="rounded-xl border border-white/10 bg-dark/40 p-3 text-center font-semibold text-text">Découverte</div>
          <div className="rounded-xl border border-white/10 bg-dark/40 p-3 text-center font-semibold text-text">Starter</div>
          <div className="rounded-xl border border-white/10 bg-dark/40 p-3 text-center font-semibold text-text">Pack</div>
          <div className="rounded-xl border border-white/10 bg-dark/30 p-3 text-text-muted">Traduction de mods individuels</div>
          <div className="rounded-xl border border-white/10 bg-dark/30 p-3 text-center text-text-muted">3/jour</div>
          <div className="rounded-xl border border-white/10 bg-dark/30 p-3 text-center text-text-muted">Illimité</div>
          <div className="rounded-xl border border-white/10 bg-dark/30 p-3 text-center text-text-muted">Illimité</div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="rounded-2xl border border-white/10 bg-dark/40 p-8 sm:p-10"
      >
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-2xl" aria-hidden>
              🔒
            </span>
            <p className="mt-4 text-sm font-semibold text-text">Paiement sécurisé par Stripe</p>
          </div>
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-2xl" aria-hidden>
              ⚡
            </span>
            <p className="mt-4 text-sm font-semibold text-text">Crédits ajoutés instantanément</p>
          </div>
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-2xl" aria-hidden>
              💬
            </span>
            <p className="mt-4 text-sm font-semibold text-text">Support par courriel</p>
          </div>
        </div>
      </motion.section>

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
    </div>
  )
}
