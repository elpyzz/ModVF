import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Link } from 'react-router-dom'

const modpacks = [
  {
    slug: 'atm10',
    name: 'ATM10',
    lines: '211 000 lignes traduites',
    image: '/screenshots/atm10.png',
  },
  {
    slug: 'better-minecraft',
    name: 'Better MC',
    lines: '41 000 lignes',
    image: '/screenshots/bettermc.png',
  },
  {
    slug: 'prominence-2',
    name: 'Prominence II',
    lines: '66 000 lignes',
    image: '/screenshots/prominence.png',
  },
]

export default function ModpacksVisualSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Modpacks testés</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted sm:text-lg">
            Des preuves concrètes avec des modpacks majeurs.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modpacks.map((m) => (
            <Link
              key={m.slug}
              to={`/modpacks/${m.slug}`}
              className="block overflow-hidden rounded-2xl border border-white/10 bg-surface transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              <div>
                <img
                  src={m.image}
                  alt={`Screenshot ${m.name}`}
                  className="h-40 w-full object-cover sm:h-44"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-white">{m.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{m.lines}</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-muted sm:text-base">Et n&apos;importe quel modpack 1.18+</p>
        <div className="mt-4 text-center">
          <Link to="/modpacks" className="text-base font-medium text-primary transition hover:underline">
            Voir tous les modpacks testés →
          </Link>
        </div>
      </div>
    </section>
  )
}

