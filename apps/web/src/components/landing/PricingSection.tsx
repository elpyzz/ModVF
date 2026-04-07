import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

const plans = [
  {
    name: 'Découverte',
    price: '0',
    suffix: '€',
    highlight: false,
    cta: 'Essayer gratuitement',
    hrefGuest: '/register',
    hrefAuth: '/dashboard',
    features: ['1 traduction offerte', 'Modpacks jusqu’à 50 mods', 'Téléchargement 24 h'],
  },
  {
    name: 'Starter',
    price: '7',
    suffix: '€',
    highlight: true,
    cta: 'Choisir le Starter',
    hrefGuest: '/tarifs',
    hrefAuth: '/tarifs',
    features: ['3 traductions', 'Tous les modpacks, toutes tailles', 'Téléchargement 72 h', 'Support prioritaire'],
  },
  {
    name: 'Pack',
    price: '12',
    suffix: '€',
    highlight: false,
    cta: 'Choisir le Pack',
    hrefGuest: '/tarifs',
    hrefAuth: '/tarifs',
    features: ['10 traductions', 'Tous les modpacks, toutes tailles', 'Téléchargement 7 jours', 'Support prioritaire'],
  },
]

export function PricingSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <section className="section-padding border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">Tarifs simples, sans surprise</h2>
          <p className="mt-3 text-lg text-muted">Première traduction offerte. Sans carte bancaire.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.highlight
                  ? 'glow-green relative rounded-2xl border border-brand-400/30 bg-surface-2 p-8'
                  : 'rounded-2xl border border-white/5 bg-surface-2 p-8'
              }
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-400 px-4 py-1 text-xs font-semibold text-surface-0">
                  Populaire
                </span>
              ) : null}

              <h3 className="text-sm font-semibold tracking-wide text-muted">{plan.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <p className="text-5xl font-extrabold text-white">{plan.price}</p>
                <span className="pb-1 text-2xl text-muted">{plan.suffix}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={isAuthenticated ? plan.hrefAuth : plan.hrefGuest}
                className={
                  plan.highlight
                    ? 'mt-7 block w-full rounded-xl bg-brand-400 py-3 text-center font-semibold text-surface-0 transition hover:bg-brand-500'
                    : 'mt-7 block w-full rounded-xl border border-white/10 py-3 text-center font-medium text-white/80 transition hover:border-white/20'
                }
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingSection