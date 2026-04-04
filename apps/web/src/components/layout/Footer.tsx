import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-text-muted sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} ModVF. Tous droits réservés.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
          <Link to="/mentions-legales" className="transition hover:text-text">
            Mentions légales
          </Link>
          <Link to="/cgv" className="transition hover:text-text">
            CGV
          </Link>
          <Link to="/confidentialite" className="transition hover:text-text">
            Confidentialité
          </Link>
          <Link to="/faq" className="transition hover:text-text">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  )
}
