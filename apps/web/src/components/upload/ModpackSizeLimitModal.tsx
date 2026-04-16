import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useAuthStore } from '../../stores/useAuthStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const STARTER_PRICE_ID =
  import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_1TI87wHz8fVVNyb1NvoenrZc'
const PACK_PRICE_ID = import.meta.env.VITE_STRIPE_PACK_PRICE_ID || 'price_1TI88tHz8fVVNyb1CujboMHJ'

export interface ModpackSizeLimitModalProps {
  open: boolean
  onClose: () => void
}

function FeatureBullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 text-sm text-text-muted">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
      <span>{children}</span>
    </li>
  )
}

export function ModpackSizeLimitModal({ open, onClose }: ModpackSizeLimitModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<'starter' | 'pack' | null>(null)

  const handleCheckout = useCallback(async (plan: 'starter' | 'pack') => {
    const session = useAuthStore.getState().session
    if (!session?.access_token) {
      window.location.href = '/login'
      return
    }

    setLoadingPlan(plan)
    const priceId = plan === 'starter' ? STARTER_PRICE_ID : PACK_PRICE_ID
    try {
      const res = await fetch(API_URL + '/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ priceId }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
        return
      }
      console.error('[CHECKOUT] No URL:', data)
      alert(data?.error || 'Erreur lors de la création du paiement. Veuillez réessayer.')
    } catch (e) {
      console.error('[CHECKOUT]', e)
      alert('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modpack-size-limit-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modpack-size-limit-title"
          className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Fermer"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 max-h-[min(92vh,900px)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-surface p-5 shadow-[0_0_40px_rgba(108,60,225,0.2)] sm:p-8"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-white/10 hover:text-text"
              aria-label="Fermer la fenêtre"
            >
              <X className="h-5 w-5" />
            </button>

            <header className="pr-10 text-center">
              <h2
                id="modpack-size-limit-title"
                className="font-display text-xl font-bold text-white sm:text-2xl"
              >
                🎮 Ton modpack est trop gros pour l&apos;offre gratuite
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted sm:text-base">
                Le plan Découverte couvre les modpacks jusqu&apos;à 50 mods. Débloque ton modpack en quelques secondes.
              </p>
            </header>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <article className="flex flex-col rounded-2xl border border-white/10 bg-dark/40 p-6 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Starter</p>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">7€</p>
                  <p className="pb-1 text-sm text-text-muted line-through">9€</p>
                </div>
                <p className="mt-1 text-xs text-text-muted">Pack de crédits — 3 traductions de modpacks</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  <FeatureBullet>3 traductions de modpacks + mods illimités</FeatureBullet>
                  <FeatureBullet>Tous les modpacks, toutes tailles</FeatureBullet>
                  <FeatureBullet>Téléchargement 72 h par traduction</FeatureBullet>
                </ul>
                <button
                  type="button"
                  disabled={!!loadingPlan}
                  onClick={() => void handleCheckout('starter')}
                  className="mt-8 w-full rounded-xl border border-white/20 py-3.5 text-sm font-semibold text-text transition hover:border-primary/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPlan === 'starter' ? 'Redirection…' : 'Choisir Starter'}
                </button>
              </article>

              <article className="relative flex flex-col rounded-2xl border border-primary/35 bg-gradient-to-b from-primary/10 to-surface p-6 shadow-[0_0_28px_rgba(108,60,225,0.22)] sm:p-7">
                <span className="absolute right-4 top-4 rounded-full bg-secondary/25 px-3 py-1 text-xs font-semibold text-secondary">
                  Meilleure offre
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pack</p>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <p className="font-display text-3xl font-extrabold text-white sm:text-4xl">12€</p>
                  <p className="pb-1 text-sm text-text-muted line-through">15€</p>
                </div>
                <p className="mt-1 text-xs text-text-muted">Pack de crédits — 10 traductions de modpacks</p>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  <FeatureBullet>10 traductions de modpacks + mods illimités</FeatureBullet>
                  <FeatureBullet>Tous les modpacks, toutes tailles</FeatureBullet>
                  <FeatureBullet>Téléchargement 7 jours par traduction</FeatureBullet>
                  <FeatureBullet>Support prioritaire — idéal pour communautés et serveurs</FeatureBullet>
                </ul>
                <button
                  type="button"
                  disabled={!!loadingPlan}
                  onClick={() => void handleCheckout('pack')}
                  className="mt-8 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(108,60,225,0.45)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ animation: 'ctaGlow 4s ease-in-out infinite' }}
                >
                  {loadingPlan === 'pack' ? 'Redirection…' : 'Choisir Pack'}
                </button>
              </article>
            </div>

            <footer className="mt-8 space-y-3 border-t border-white/10 pt-6 text-center">
              <p className="text-xs text-text-muted">
                Paiement sécurisé via Stripe. Annulable à tout moment depuis ton dashboard.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-text-muted underline-offset-2 transition hover:text-text hover:underline"
              >
                Annuler
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
