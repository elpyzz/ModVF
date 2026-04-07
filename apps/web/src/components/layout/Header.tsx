import { LogOut, Menu, Pickaxe, UserRound } from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { CreditsDisplay } from '../ui/CreditsDisplay'
import { resolveDisplayName } from '../../lib/displayName'
import { useAuthStore } from '../../stores/useAuthStore'

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Tarifs', to: '/tarifs' },
  { label: 'Guide', to: '/guide' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Dashboard', to: '/dashboard' },
]

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, profile, user, signOut } = useAuthStore()
  const displayLabel = resolveDisplayName(user, profile)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    setMobileNavOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dark/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-none md:gap-4">
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-white/5 hover:text-text md:hidden"
            aria-expanded={mobileNavOpen}
            aria-label="Menu navigation"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold text-text"
            onClick={() => setMobileNavOpen(false)}
          >
            <Pickaxe className="h-5 w-5 shrink-0 text-secondary" />
            <span className="truncate">ModVF</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx('text-sm font-medium text-text-muted transition-colors hover:text-text', isActive && 'text-text')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {!isAuthenticated ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/register"
              className="hidden rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-text hover:border-primary/60 sm:inline-flex sm:px-4 sm:text-sm"
            >
              Commencer
            </Link>
            <Link
              to="/login"
              className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 sm:px-4 sm:text-sm"
            >
              Connexion
            </Link>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <CreditsDisplay variant="compact" />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex max-w-[11rem] items-center gap-2 rounded-xl border border-white/15 bg-surface px-2 py-2 text-sm sm:max-w-none sm:px-3"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{displayLabel}</span>
                <Menu className="h-4 w-4 shrink-0 text-text-muted" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-surface p-1 shadow-xl">
                  <div className="border-b border-white/10 px-3 py-2 sm:hidden">
                    <CreditsDisplay variant="compact" />
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-light"
                  >
                    Mon espace
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-surface-light"
                  >
                    <LogOut className="h-4 w-4" />
                    Deconnexion
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {mobileNavOpen ? (
        <nav className="border-t border-white/10 bg-dark/95 px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-white/10 text-text' : 'text-text-muted hover:bg-white/5 hover:text-text',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
