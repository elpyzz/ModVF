import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-text-muted sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo-navbar.svg" alt="ModVF" className="h-6 opacity-60" />
            <p>© {new Date().getFullYear()} Tous droits réservés.</p>
          </div>
          <p className="text-center sm:text-right">Paiement sécurisé par Stripe</p>
        </div>
        <p className="mt-3 text-center sm:text-left">
          <a href="mailto:modvf.contact@gmail.com" className="transition hover:text-text">
            modvf.contact@gmail.com
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
          <a
            href="https://discord.gg/xPxFjvAHYb"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Discord
          </a>
        </div>
      </div>
    </footer>
  )
}
