import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

const primaryLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Comment ça marche', to: '/how-it-works' },
  { label: 'Tarifs', to: '/pricing' },
  { label: 'Guide', to: '/guide' },
  { label: 'FAQ', to: '/faq' },
]

const socialLinks = [
  { label: 'Discord', href: 'https://discord.gg/xPxFjvAHYb' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@modvf' },
  { label: 'Instagram', href: 'https://www.instagram.com/modvf' },
  { label: 'Twitter', href: 'https://x.com/modvf' },
]

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, signOut } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[140] transition-all duration-300 ${
          isScrolled ? 'border-b border-white/10 bg-dark/85 backdrop-blur-md' : 'bg-dark/20'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="w-10 shrink-0" aria-hidden />

          <Link to="/" className="absolute left-1/2 -translate-x-1/2" onClick={() => setMenuOpen(false)}>
            <img src="/logo-navbar.svg" alt="ModVF" className="h-7 sm:h-8" />
          </Link>

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-text transition hover:bg-white/10"
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
          className={`ml-auto flex h-full w-full max-w-md flex-col bg-[#0b0c12] px-8 py-20 text-white transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-1 flex-col justify-center">
            <div className="space-y-5">
              {primaryLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`block text-3xl font-semibold tracking-tight transition-colors ${
                    isActivePath(item.to) ? 'text-secondary' : 'text-white hover:text-secondary'
                  }`}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="my-8 h-px bg-white/10" />

            <div className="space-y-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl border border-white/25 px-5 py-3 text-center text-base font-semibold text-white transition hover:border-secondary hover:text-secondary"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl bg-primary px-5 py-3 text-center text-base font-semibold text-white transition hover:bg-primary/90"
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
                      className={`block text-2xl font-semibold transition-colors ${
                        isActivePath(item.to) ? 'text-secondary' : 'text-white hover:text-secondary'
                      }`}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="inline-flex items-center gap-2 text-left text-2xl font-semibold text-red-300 transition hover:text-red-200"
                  >
                    <LogOut className="h-5 w-5" />
                    Se déconnecter
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 border-t border-white/10 pt-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-text-muted transition hover:text-secondary"
              >
                {social.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
