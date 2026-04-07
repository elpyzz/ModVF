import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const plans = [
  {
    name: 'Découverte',
    price: '0€',
    oldPrice: null as string | null,
    highlight: false,
    cta: 'Essayer gratuitement',
    outlined: true,
    hrefGuest: '/register',
    hrefAuth: '/dashboard',
    features: ['1 traduction offerte', 'Modpacks jusqu’à 50 mods', 'Téléchargement 24 h'],
  },
  {
    name: 'Starter · Populaire',
    price: '7€',
    oldPrice: null as string | null,
    highlight: true,
    cta: 'Choisir le Starter',
    outlined: false,
    hrefGuest: '/tarifs',
    hrefAuth: '/tarifs',
    features: ['3 traductions', 'Tous les modpacks, toutes tailles', 'Téléchargement 72 h', 'Support prioritaire'],
  },
  {
    name: 'Pack',
    price: '12€',
    oldPrice: null as string | null,
    highlight: false,
    cta: 'Choisir le Pack',
    outlined: true,
    hrefGuest: '/tarifs',
    hrefAuth: '/tarifs',
    features: [
      '10 traductions',
      'Tous les modpacks, toutes tailles',
      'Meilleur rapport qualité-prix',
      'Téléchargement 7 jours',
      'Support prioritaire',
    ],
  },
]

export default function PricingSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-24 sm:py-32">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl md:font-bold">Tarifs simples, sans surprise</h2>
        <p className="mx-auto mt-3 max-w-xl text-text-muted">Première traduction offerte. Sans carte bancaire.</p>
      </div>

      <div className="mt-12 grid auto-rows-fr gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative flex h-full flex-col rounded-xl border p-7 transition-colors ${
              plan.highlight
                ? 'border-purchase/35 bg-surface'
                : 'border-white/5 bg-surface'
            }`}
          >
            {plan.highlight ? (
              <span className="absolute right-4 top-4 rounded-full border border-purchase/25 bg-purchase/10 px-2.5 py-0.5 text-[11px] font-medium text-purchase">
                Populaire
              </span>
            ) : null}

            <h3 className="text-sm font-semibold tracking-wide text-text-muted">{plan.name}</h3>
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <p className="text-4xl font-bold">{plan.price}</p>
              {plan.oldPrice ? <p className="pb-1 text-sm text-text-muted line-through">{plan.oldPrice}</p> : null}
            </div>

            <ul className="mt-6 flex flex-1 flex-col space-y-2 text-left text-sm text-text-muted">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>

            <div className="mt-7 block">
              <Link
                to={isAuthenticated ? plan.hrefAuth : plan.hrefGuest}
                className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.outlined
                    ? 'border border-white/10 text-text hover:border-primary/35 hover:bg-white/[0.04]'
                    : 'bg-primary text-dark hover:bg-primary/90'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
