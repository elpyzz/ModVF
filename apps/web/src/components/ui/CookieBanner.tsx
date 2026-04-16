import { useEffect, useState } from 'react'

type Consent = {
  essential: boolean
  analytics: boolean
}

const STORAGE_KEY = 'modvf_cookie_consent'

function readStoredConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Consent
  } catch {
    return null
  }
}

function saveConsent(consent: Consent) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
}

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const stored = readStoredConsent()
    if (stored) {
      setConsent(stored)
    } else {
      setConsent(null)
    }
  }, [])

  const hasChosen = consent !== null

  function acceptAll() {
    const next: Consent = { essential: true, analytics: true }
    saveConsent(next)
    setConsent(next)
  }

  function refuseAll() {
    const next: Consent = { essential: true, analytics: false }
    saveConsent(next)
    setConsent(next)
  }

  if (hasChosen) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] flex justify-center px-4 pb-4">
      <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-surface/95 p-4 shadow-xl backdrop-blur-md sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-sm text-text">
            <p className="font-semibold">Gestion des cookies</p>
            <p className="mt-1 text-xs text-text-muted sm:text-sm">
              On utilise des cookies <span className="font-medium">strictement nécessaires</span> au fonctionnement de
              ModVF, ainsi que des statistiques anonymes pour améliorer le site. Aucun cookie publicitaire, marketing
              ou tracking tiers.
            </p>

            {showDetails && (
              <ul className="mt-2 space-y-1 text-xs text-text-muted sm:text-sm">
                <li>
                  • <span className="font-medium text-text">Essentiels</span> : connexion, sécurité, fonctionnement du
                  service (obligatoires).
                </li>
                <li>
                  • <span className="font-medium text-text">Statistiques</span> : mesure anonyme de trafic (pages vues,
                  clics principaux).
                </li>
              </ul>
            )}

            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="mt-2 text-xs font-medium text-secondary underline-offset-2 hover:underline"
            >
              {showDetails ? 'Réduire' : 'En savoir plus / personnaliser'}
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:mt-0 sm:min-w-[220px]">
            <button
              type="button"
              onClick={acceptAll}
              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Tout accepter
            </button>
            <button
              type="button"
              onClick={refuseAll}
              className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/5"
            >
              Tout refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

