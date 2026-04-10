import { Disc3, HelpCircle, Home, LogOut, Settings, Tag, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { resolveDisplayName } from '../../lib/displayName'
import { useAuthStore } from '../../stores/useAuthStore'

const primaryLinks = [
  { label: 'Accueil', to: '/', Icon: Home },
  { label: 'Comment ça marche', to: '/how-it-works', Icon: Settings },
  { label: 'Modpacks', to: '/modpacks', Icon: Disc3 },
  { label: 'Tarifs', to: '/pricing', Icon: Tag },
  { label: 'Guide', to: '/guide', Icon: BookIcon },
  { label: 'FAQ', to: '/faq', Icon: HelpCircle },
]

function BookIcon() {
  return <span aria-hidden>📖</span>
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, profile, user, signOut } = useAuthStore()
  const displayLabel = resolveDisplayName(user, profile)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setProfileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleSignOut = async (): Promise<void> => {
    await signOut()
    setMenuOpen(false)
    setProfileMenuOpen(false)
    navigate('/')
  }

  const authLinks = isAuthenticated
    ? [
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Mon compte', to: '/settings' },
      ]
    : []

  const isActivePath = (to: string): boolean => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7546/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'db5095' },
      body: JSON.stringify({
        sessionId: 'db5095',
        runId: 'initial',
        hypothesisId: 'H2',
        location: 'Header.tsx:95',
        message: 'header rendered',
        data: {
          pathname: location.pathname,
          menuOpen,
          primaryLinksCount: primaryLinks.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [location.pathname, menuOpen])

  useEffect(() => {
    const iconNames = primaryLinks.map((item) => item.Icon?.name ?? 'unknown')
    // #region agent log
    fetch('http://127.0.0.1:7546/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'db5095' },
      body: JSON.stringify({
        sessionId: 'db5095',
        runId: 'initial',
        hypothesisId: 'H3',
        location: 'Header.tsx:116',
        message: 'link icons resolved',
        data: { iconNames },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[140] transition-all duration-300 ${
          isScrolled ? 'border-b border-white/10 bg-dark/85 backdrop-blur-md' : 'bg-dark/20'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text transition hover:bg-white/10"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  menuOpen ? 'top-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  menuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  menuOpen ? 'top-[7px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2" onClick={() => setMenuOpen(false)}>
            <img src="/logo-navbar.svg" alt="ModVF" className="h-7 sm:h-8" />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {!menuOpen &&
              (!isAuthenticated ? (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link
                    to="/login"
                    className="rounded-xl border border-white/25 px-3 py-2 text-xs font-semibold text-white transition hover:border-secondary hover:text-secondary"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                  >
                    Commencer gratuitement
                  </Link>
                </div>
              ) : (
                <div className="hidden sm:block" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface px-3 py-2 text-xs font-semibold text-white transition hover:border-white/30"
                    aria-expanded={profileMenuOpen}
                    aria-label="Ouvrir le menu du compte"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <UserRound className="h-3.5 w-3.5" />
                    </span>
                    <span className="max-w-28 truncate">{displayLabel}</span>
                  </button>

                  {profileMenuOpen ? (
                    <div className="absolute right-6 mt-2 w-52 rounded-xl border border-white/10 bg-surface p-1 shadow-xl sm:right-8 lg:right-[max(2rem,calc((100vw-72rem)/2+2rem))]">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-light"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-light"
                      >
                        Mon compte
                      </Link>
                      <div className="my-1 h-px bg-white/10" />
                      <button
                        type="button"
                        onClick={() => void handleSignOut()}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 transition hover:bg-surface-light"
                      >
                        <LogOut className="h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[130] bg-black/60 transition-opacity duration-300 ${
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <nav
          className={`relative mr-auto flex h-full w-full max-w-sm flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-black via-[#0b0f1a] to-[#0a1020]/95 px-7 py-16 text-white backdrop-blur-xl transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="flex flex-1 flex-col justify-center">
            <div className="space-y-4">
              {primaryLinks.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  style={{ transitionDelay: `${120 + index * 50}ms` }}
                  className={`flex items-center gap-3 rounded-lg border-l-4 py-2.5 pl-3 text-2xl font-semibold tracking-tight transition-all duration-300 ${
                    menuOpen ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                  } ${
                    isActivePath(item.to)
                      ? 'border-secondary bg-white/5 text-secondary'
                      : 'border-transparent text-white hover:border-secondary hover:bg-white/5 hover:text-secondary'
                  }`}
                >
                  <item.Icon className="h-5 w-5 shrink-0 text-text-muted" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="my-6 h-px bg-white/10" />

            <div className="mb-4 text-center text-xs text-text-muted">
              <span>6 modpacks</span>
              <span className="mx-2 text-white/30">|</span>
              <span>300K+ lignes</span>
              <span className="mx-2 text-white/30">|</span>
              <span>1.18 → 1.21+</span>
            </div>

            <div className="space-y-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl border border-white/25 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:border-secondary hover:text-secondary"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary/90"
                  >
                    Commencer gratuitement
                  </Link>
                </>
              ) : (
                <>
                  {authLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={`block text-xl font-semibold transition-colors ${
                        isActivePath(item.to) ? 'text-secondary' : 'text-white hover:text-secondary'
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="inline-flex items-center gap-2 text-left text-xl font-semibold text-red-300 transition hover:text-red-200"
                  >
                    <LogOut className="h-5 w-5" />
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </div>

        </nav>
      </div>
    </>
  )
}
