import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import type { ReactNode } from 'react'
import { useState } from 'react'
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
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden strokeWidth={2} />
      <span>{children}</span>
    </li>
  )
}

export default function PricingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  void stripePromise

  const discoveryHref = isAuthenticated ? '/dashboard' : '/register'

  return (
    <div className="space-y-16 pb-8 sm:space-y-20">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="rounded-xl border border-white/5 bg-surface p-8 text-center sm:p-10"
      >
        <h1 className="font-display text-3xl font-semibold sm:text-4xl md:font-bold">Tarifs ModVF</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base font-normal text-text-muted sm:text-lg">
          Choisissez le pack adapté à vos besoins. Première traduction offerte.
        </p>
      </motion.header>

      <div className="grid w-full auto-rows-fr gap-6 lg:grid-cols-3">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
          className="flex h-full flex-col rounded-xl border border-white/5 bg-surface p-6 sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Découverte</p>
          <p className="mt-4 font-display text-4xl font-bold sm:text-5xl">0€</p>
          <p className="mt-2 text-sm text-text-muted">Pour découvrir ModVF</p>
          <ul className="mt-8 flex flex-1 flex-col gap-3">
            <FeatureLine>1 traduction de modpack offerte + 3 mods par jour</FeatureLine>
            <FeatureLine>Modpacks jusqu’à 50 mods</FeatureLine>
            <FeatureLine>Pack de ressources + quêtes traduites</FeatureLine>
            <FeatureLine>Téléchargement 24 h</FeatureLine>
          </ul>
          <Link
            to={discoveryHref}
            className="mt-8 block w-full rounded-xl border border-white/10 py-3.5 text-center text-sm font-semibold text-text transition hover:border-primary/35 hover:bg-white/[0.03]"
          >
            Commencer gratuitement
          </Link>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="relative flex h-full flex-col rounded-xl border border-purchase/35 bg-surface p-6 sm:p-8"
        >
          <span className="absolute right-4 top-4 rounded-full border border-purchase/25 bg-purchase/10 px-2.5 py-0.5 text-[11px] font-medium text-purchase">
            Le plus populaire
          </span>
          <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Starter</p>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <p className="font-display text-4xl font-bold sm:text-5xl">7€</p>
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
            className="mt-8 w-full rounded-xl bg-purchase py-3.5 text-sm font-semibold text-white transition hover:bg-purchase/90"
          >
            Acheter le Starter — 7€
          </button>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          className="flex h-full flex-col rounded-xl border border-white/5 bg-surface p-6 sm:p-8"
        >
          <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
            Meilleur rapport qualité-prix
          </span>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Pack</p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <p className="font-display text-4xl font-bold sm:text-5xl">12€</p>
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
            className="mt-8 w-full rounded-xl bg-purchase py-3.5 text-sm font-semibold text-white transition hover:bg-purchase/90"
          >
            Acheter le Pack — 12€
          </button>
        </motion.article>
      </div>

      <section className="rounded-xl border border-white/5 bg-surface p-6 sm:p-8">
        <h2 className="text-center font-display text-xl font-semibold sm:text-2xl md:font-bold">Réassurance</h2>
        <ul className="mx-auto mt-5 grid max-w-4xl gap-3 text-sm text-text-muted sm:grid-cols-2">
          <li className="rounded-xl border border-white/5 bg-dark/30 p-3">
            Première traduction offerte — sans carte bancaire
          </li>
          <li className="rounded-xl border border-white/5 bg-dark/30 p-3">Paiement sécurisé par Stripe</li>
          <li className="rounded-xl border border-white/5 bg-dark/30 p-3">Crédits valables 6 mois</li>
          <li className="rounded-xl border border-white/5 bg-dark/30 p-3">Satisfait ou remboursé sous 7 jours</li>
        </ul>
      </section>

      <section className="rounded-xl border border-white/5 bg-surface p-6 sm:p-8">
        <h2 className="text-center font-display text-xl font-semibold sm:text-2xl md:font-bold">Comparatif rapide</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-3 py-3 font-semibold text-text">Fonction</th>
                <th className="px-3 py-3 text-center font-semibold text-text">Découverte</th>
                <th className="px-3 py-3 text-center font-semibold text-text">Starter</th>
                <th className="px-3 py-3 text-center font-semibold text-text">Pack</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <td className="px-3 py-3 text-text-muted">Traduction de mods individuels</td>
                <td className="px-3 py-3 text-center text-text-muted">3/jour</td>
                <td className="px-3 py-3 text-center text-text-muted">Illimité</td>
                <td className="px-3 py-3 text-center text-text-muted">Illimité</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="rounded-xl border border-white/5 bg-surface p-8 sm:p-10"
      >
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-dark/40 text-lg" aria-hidden>
              🔒
            </span>
            <p className="mt-4 text-sm font-semibold text-text">Paiement sécurisé par Stripe</p>
          </div>
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-dark/40 text-lg" aria-hidden>
              ⚡
            </span>
            <p className="mt-4 text-sm font-semibold text-text">Crédits ajoutés instantanément</p>
          </div>
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-dark/40 text-lg" aria-hidden>
              💬
            </span>
            <p className="mt-4 text-sm font-semibold text-text">Support par courriel</p>
          </div>
        </div>
      </motion.section>

      <section className="border-t border-white/5 pt-16">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center font-display text-2xl font-semibold sm:text-3xl md:font-bold"
        >
          Questions sur les tarifs
        </motion.h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-2">
          {faqTarifs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div key={faq.q} className="rounded-xl border border-white/5 bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text"
                  aria-expanded={isOpen}
                >
                  {faq.q}
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-white/5 px-5 pb-5 pt-3 text-sm font-normal leading-relaxed text-text-muted">
                        {faq.a}
                      </p>
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
