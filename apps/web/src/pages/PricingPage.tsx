import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
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

export default function PricingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  void stripePromise
  // #region agent log
  fetch('http://127.0.0.1:7546/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e8bfc'},body:JSON.stringify({sessionId:'1e8bfc',runId:'pre-fix',hypothesisId:'H4',location:'src/pages/PricingPage.tsx:31',message:'PricingPage rendu',data:{isAuthenticated,hasPublishableKey:Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)},timestamp:Date.now()})}).catch(()=>{})
  // #endregion

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-surface p-8">
        <h1 className="font-display text-3xl font-bold">Tarifs ModVF</h1>
        <p className="mt-3 text-text-muted">Achetez des crédits et traduisez vos modpacks en quelques minutes.</p>
      </header>

      <div className="grid w-full gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <motion.article
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="rounded-2xl border border-white/10 bg-surface p-6"
        >
          <p className="text-sm uppercase tracking-wide text-text-muted">Découverte</p>
          <p className="mt-3 font-display text-4xl font-bold">0€</p>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            <li>1 traduction offerte à l&apos;inscription</li>
            <li>Modpacks jusqu&apos;à 50 mods</li>
          </ul>
          <a
            href={isAuthenticated ? '/dashboard' : '/register'}
            className="mt-6 inline-block w-full rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold"
          >
            S&apos;inscrire gratuitement
          </a>
        </motion.article>

        <motion.article
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="scale-[1.02] rounded-2xl border border-secondary/60 bg-gradient-to-b from-secondary/10 to-surface p-6 shadow-[0_0_28px_rgba(0,212,170,0.18)]"
        >
          <p className="text-sm uppercase tracking-wide text-secondary">Starter · Populaire</p>
          <p className="mt-3 font-display text-4xl font-bold">7€</p>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            <li>3 traductions</li>
            <li>Tous les modpacks, toutes tailles</li>
            <li>Valable 6 mois</li>
          </ul>
          <button
            type="button"
            onClick={() => void handleCheckout('starter')}
            className="mt-6 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-dark transition hover:bg-secondary/90"
          >
            Acheter le Starter
          </button>
        </motion.article>

        <motion.article
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="rounded-2xl border border-white/10 bg-surface p-6"
        >
          <p className="text-sm uppercase tracking-wide text-text-muted">Pack</p>
          <p className="mt-3 font-display text-4xl font-bold">12€</p>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            <li>10 traductions</li>
            <li>Tous les modpacks, toutes tailles</li>
            <li>Valable 6 mois</li>
            <li>Meilleur rapport qualité-prix</li>
          </ul>
          <button
            type="button"
            onClick={() => void handleCheckout('pro')}
            className="mt-6 w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
          >
            Acheter le Pack
          </button>
        </motion.article>
      </div>
    </section>
  )
}
