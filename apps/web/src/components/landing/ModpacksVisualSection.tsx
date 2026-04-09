import { useScrollReveal } from '../../hooks/useScrollReveal'

const modpacks = [
  {
    name: 'ATM10',
    lines: '211 000 lignes traduites',
    image: '/screenshots/atm10.png',
  },
  {
    name: 'Better MC',
    lines: '41 000 lignes',
    image: '/screenshots/bettermc.png',
  },
  {
    name: 'Prominence II',
    lines: '66 000 lignes',
    image: '/screenshots/prominence.png',
  },
  {
    name: 'DawnCraft',
    lines: '28 000 lignes',
    image: '/screenshots/dawncraft.png',
  },
  {
    name: 'MC Eternal 2',
    lines: '94 000 lignes',
    image: '/screenshots/mceternal.png',
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
            <article
              key={m.name}
              className="overflow-hidden rounded-2xl border border-white/10 bg-surface transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(0,0,0,0.35)]"
            >
              <div className="relative">
                <img
                  src={m.image}
                  alt={`Screenshot ${m.name}`}
                  className="h-40 w-full object-cover sm:h-44"
                  loading="lazy"
                />
                <span className="absolute right-4 top-4 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  ✅ Testé
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-white">{m.name}</h3>
                <p className="mt-1 text-sm text-text-muted">{m.lines}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-muted sm:text-base">Et n&apos;importe quel modpack 1.18+</p>
      </div>
    </section>
  )
}

