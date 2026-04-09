import { LogOut, Menu, UserRound } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { resolveDisplayName } from '../../lib/displayName'
import { useAuthStore } from '../../stores/useAuthStore'

const navItems = [
  { label: 'Tarifs', to: '/pricing' },
  { label: 'Comment ça marche', to: '/how-it-works' },
  { label: 'Guide', to: '/guide' },
]

export function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, profile, user, signOut } = useAuthStore()
  const displayLabel = resolveDisplayName(user, profile)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

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
          <Link
            to="/"
            className="flex items-center"
            onClick={() => {
              setMobileNavOpen(false)
              setMenuOpen(false)
            }}
          >
            <img src="/logo-navbar.svg" alt="ModVF" className="h-7" />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
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
          <a
            href="https://discord.gg/xPxFjvAHYb"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-white"
            aria-label="Rejoindre le Discord ModVF"
            title="Discord ModVF"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3a13.538 13.538 0 0 0-.663 1.357 18.27 18.27 0 0 0-6.444 0A13.506 13.506 0 0 0 8.115 3a19.736 19.736 0 0 0-4.433 1.369C.533 9.064-.32 13.642.099 18.157a19.9 19.9 0 0 0 5.993 3.03 14.04 14.04 0 0 0 1.284-2.106 12.962 12.962 0 0 1-2.037-.976c.171-.126.338-.258.5-.396a14.644 14.644 0 0 0 12.323 0c.162.138.329.27.5.396a12.9 12.9 0 0 1-2.04.977 13.93 13.93 0 0 0 1.286 2.105 19.861 19.861 0 0 0 5.993-3.03c.492-5.236-.84-9.772-3.683-13.788ZM8.02 15.331c-1.182 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419Zm7.974 0c-1.182 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419Z" />
            </svg>
          </a>
        </nav>

        {!isAuthenticated ? (
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 sm:px-4 sm:text-sm"
            >
              Connexion
            </Link>
          </div>
        ) : (
          <div className="hidden shrink-0 items-center gap-2 sm:gap-3 md:flex">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-surface px-2 py-2 text-sm sm:px-3"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="hidden max-w-28 truncate lg:inline">{displayLabel}</span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-surface p-1 shadow-xl">
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-light"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-light"
                  >
                    Mon compte
                  </Link>
                  <div className="my-1 h-px bg-white/10" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-surface-light"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-text-muted transition hover:bg-white/5 hover:text-text md:hidden"
          aria-expanded={mobileNavOpen}
          aria-label="Menu navigation"
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileNavOpen ? (
        <nav className="fixed inset-0 z-50 border-t border-white/10 bg-dark/95 px-4 py-5 md:hidden">
          <div className="mx-auto flex h-full max-w-6xl flex-col gap-2">
            <div className="mb-2 flex items-center justify-between">
              <Link to="/" onClick={() => setMobileNavOpen(false)} className="flex items-center">
                <img src="/logo-navbar.svg" alt="ModVF" className="h-7" />
              </Link>
              <button
                type="button"
                className="rounded-lg p-2 text-text-muted transition hover:bg-white/5 hover:text-text"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Fermer le menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            {[
              ...navItems,
              { label: 'FAQ', to: '/faq' },
              ...(isAuthenticated
                ? [
                    { label: 'Dashboard', to: '/dashboard' },
                    { label: 'Mon compte', to: '/settings' },
                  ]
                : []),
            ].map((item) => (
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

            <a
              href="https://discord.gg/xPxFjvAHYb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text"
            >
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.317 4.369A19.791 19.791 0 0 0 15.885 3a13.538 13.538 0 0 0-.663 1.357 18.27 18.27 0 0 0-6.444 0A13.506 13.506 0 0 0 8.115 3a19.736 19.736 0 0 0-4.433 1.369C.533 9.064-.32 13.642.099 18.157a19.9 19.9 0 0 0 5.993 3.03 14.04 14.04 0 0 0 1.284-2.106 12.962 12.962 0 0 1-2.037-.976c.171-.126.338-.258.5-.396a14.644 14.644 0 0 0 12.323 0c.162.138.329.27.5.396a12.9 12.9 0 0 1-2.04.977 13.93 13.93 0 0 0 1.286 2.105 19.861 19.861 0 0 0 5.993-3.03c.492-5.236-.84-9.772-3.683-13.788ZM8.02 15.331c-1.182 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.955 2.419-2.156 2.419Zm7.974 0c-1.182 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.175 1.095 2.156 2.418 0 1.334-.946 2.419-2.156 2.419Z" />
              </svg>
              Discord
            </a>

            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Connexion
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="mt-2 inline-flex items-center justify-center rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                Se déconnecter
              </button>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
