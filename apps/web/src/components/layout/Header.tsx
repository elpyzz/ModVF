import { LogOut, Menu, Pickaxe, UserRound } from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { resolveDisplayName } from '../../lib/displayName'
import { useAuthStore } from '../../stores/useAuthStore'

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Dashboard', to: '/dashboard' },
]

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, profile, user, signOut } = useAuthStore()
  const displayLabel = resolveDisplayName(user, profile)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-dark/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-text">
          <Pickaxe className="h-5 w-5 text-secondary" />
          ModVF
        </Link>

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
          <div className="flex items-center gap-2">
            <Link to="/register" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-text hover:border-primary/60">
              Commencer
            </Link>
            <Link to="/login" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
              Connexion
            </Link>
          </div>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-surface px-3 py-2 text-sm"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="max-w-28 truncate">{displayLabel}</span>
              <Menu className="h-4 w-4 text-text-muted" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-surface p-1 shadow-xl">
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-light">
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
        )}
      </div>
    </header>
  )
}
