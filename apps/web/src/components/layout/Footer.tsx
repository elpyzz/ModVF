import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-text-muted sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© {new Date().getFullYear()} ModVF. Tous droits réservés.</p>
          <p className="text-center sm:text-right">Paiement sécurisé par Stripe</p>
        </div>
        <p className="mt-3 text-center sm:text-left">ModVF est un service édité par Louis — Auto-entrepreneur, France</p>
        <p className="mt-1 text-center sm:text-left">
          <a href="mailto:contact@modvf.fr" className="transition hover:text-text">
            contact@modvf.fr
          </a>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-start">
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
