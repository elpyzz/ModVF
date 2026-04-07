import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-1">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 text-xs text-muted sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
          <Link to="/" className="transition-colors hover:text-white">Accueil</Link>
          <Link to="/tarifs" className="transition-colors hover:text-white">Tarifs</Link>
          <Link to="/guide" className="transition-colors hover:text-white">Guide</Link>
          <Link to="/faq" className="transition-colors hover:text-white">FAQ</Link>
          <Link to="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
          <a href="mailto:contact@modvf.fr" className="transition-colors hover:text-white">contact@modvf.fr</a>
        </div>
        <p className="mt-4 text-center">© 2026 ModVF · Auto-entrepreneur, France · Paiement sécurisé par Stripe</p>
      </div>
    </footer>
  )
}