import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface TranslationDisclaimerModalProps {
  open: boolean
  onAccept: () => void
  onDecline: () => void
}

export function TranslationDisclaimerModal({ open, onAccept, onDecline }: TranslationDisclaimerModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDecline()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onDecline])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="translation-disclaimer-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="translation-disclaimer-title"
          className="fixed inset-0 z-[230] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Fermer"
            onClick={onDecline}
          />

          <motion.div
            className="relative z-10 w-full max-w-2xl rounded-2xl border border-amber-400/30 bg-surface p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] sm:p-8"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onDecline}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-white/10 hover:text-text"
              aria-label="Fermer la fenêtre"
            >
              <X className="h-5 w-5" />
            </button>

            <header className="pr-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 id="translation-disclaimer-title" className="mt-4 font-display text-2xl font-extrabold text-amber-100 sm:text-3xl">
                Disclaimer important avant traduction
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-amber-50/90 sm:text-base">
                Toute personne qui upload un modpack sans avoir suivi le guide d&apos;installation complet ne doit pas continuer.
                Merci de vérifier le guide pas à pas avant de lancer la traduction.
              </p>
            </header>

            <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100/95">
              <p>
                Pour les modpacks non testés ou non validés, des incompatibilités peuvent apparaître une fois en jeu. En cas de
                problème après installation, contacte le support à{' '}
                <a className="font-semibold underline underline-offset-2" href="mailto:modvf.contact@gmail.com">
                  modvf.contact@gmail.com
                </a>
                .
              </p>
            </div>

            <footer className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onDecline}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-text transition hover:bg-white/10 sm:w-auto"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={onAccept}
                className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(108,60,225,0.35)] transition hover:bg-primary/90 sm:w-auto"
              >
                J&apos;ai lu et j&apos;accepte
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
