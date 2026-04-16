import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

interface FreeModpackBannerProps {
  onVisibilityChange: (visible: boolean) => void
}

export function FreeModpackBanner({ onVisibilityChange }: FreeModpackBannerProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [dismissed, setDismissed] = useState(false)
  const ctaHref = isAuthenticated ? '/dashboard' : '/register'

  const isVisible = !dismissed

  useEffect(() => {
    onVisibilityChange(isVisible)
  }, [isVisible, onVisibilityChange])

  function handleBannerClick() {
    setDismissed(true)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[160] border-b border-white/10 bg-gradient-to-r from-primary via-violet-500 to-secondary text-white">
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-center gap-2 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium sm:hidden">🎮 1 modpack gratuit jusqu&apos;à 50 mods !</p>
        <p className="hidden text-center text-sm font-medium sm:block">
          🎮 Plan Découverte : 1 traduction de modpack gratuite jusqu&apos;à 50 mods
        </p>
        <Link
          to={ctaHref}
          onClick={handleBannerClick}
          className="text-xs font-semibold underline-offset-2 transition hover:underline sm:text-sm"
        >
          Essayer maintenant →
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-white/90 transition hover:bg-white/15"
          aria-label="Fermer la bannière"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
