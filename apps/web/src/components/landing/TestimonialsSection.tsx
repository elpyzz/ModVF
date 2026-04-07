import { useScrollReveal } from '../../hooks/useScrollReveal'

const testedModpacks = [
  {
    name: 'Better Minecraft (1.20.1)',
    strings: '41 067 strings',
    scope: 'Items, quêtes, descriptions',
  },
  {
    name: 'All The Mods 10 (1.21+)',
    strings: '211 346 strings',
    scope: 'Traduction complète',
  },
  {
    name: 'Prominence II (1.20.1 Fabric)',
    strings: '65 898 strings',
    scope: 'Traduction complète',
  },
  {
    name: 'DawnCraft (1.20.1)',
    strings: '28 088 strings',
    scope: 'Traduction complète',
  },
  {
    name: 'MC Eternal 2 (1.20.1)',
    strings: '94 071 strings',
    scope: 'Items et interfaces traduits',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-20 sm:py-24">
      <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Modpacks testés et validés</h2>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testedModpacks.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-transparent p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-text">{item.name}</p>
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">Validé</span>
            </div>
            <p className="mt-3 text-sm text-text-muted">{item.strings}</p>
            <p className="mt-1 text-sm text-text-muted">{item.scope} ✅</p>
          </article>
        ))}
      </div>
    </section>
  )
}
