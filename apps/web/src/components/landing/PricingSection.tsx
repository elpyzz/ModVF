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
    features: [
      '1 traduction de modpack gratuite jusqu’à 50 mods',
      '3 mods (.jar) par jour',
      'Téléchargement 24 h',
    ],
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
    <section ref={sectionRef} className="reveal border-t border-white/5 py-20 sm:py-24">
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Tarifs simples, sans surprise</h2>
        <p className="mx-auto mt-3 max-w-xl text-text-muted">
          Plan Découverte : 1 traduction de modpack gratuite jusqu&apos;à 50 mods. Sans carte bancaire pour commencer.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative rounded-2xl border p-7 transition-transform duration-200 hover:scale-[1.02] ${
              plan.highlight
                ? 'scale-[1.02] border-transparent bg-surface [background:linear-gradient(#12121A,#12121A)_padding-box,linear-gradient(135deg,#6C3CE1,#00D4AA)_border-box] shadow-[0_0_36px_rgba(108,60,225,0.3)]'
                : 'border-white/10 bg-surface'
            }`}
          >
            {plan.highlight ? (
              <span className="absolute right-4 top-4 rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary">
                Populaire
              </span>
            ) : null}

            <h3 className="text-sm font-semibold tracking-wide text-text-muted">{plan.name}</h3>
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <p className="text-4xl font-extrabold">{plan.price}</p>
              {plan.oldPrice ? <p className="pb-1 text-sm text-text-muted line-through">{plan.oldPrice}</p> : null}
            </div>

            <ul className="mt-6 space-y-2 text-left text-sm text-text-muted">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>

            <div className="mt-7 block transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]">
              <Link
                to={isAuthenticated ? plan.hrefAuth : plan.hrefGuest}
                className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  plan.outlined
                    ? 'border border-white/20 text-text hover:border-primary/60 hover:bg-white/5'
                    : 'bg-primary text-white shadow-[0_0_28px_rgba(108,60,225,0.5)] hover:bg-primary/90 [animation:ctaGlow_4s_ease-in-out_infinite]'
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
