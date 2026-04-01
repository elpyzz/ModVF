import { Link, NavLink } from 'react-router-dom'
import { Pickaxe } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Dashboard', to: '/dashboard' },
]

export function Header() {
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
                clsx(
                  'text-sm font-medium text-text-muted transition-colors hover:text-text',
                  isActive && 'text-text',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/login"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Connexion
        </Link>
      </div>
    </header>
  )
}
