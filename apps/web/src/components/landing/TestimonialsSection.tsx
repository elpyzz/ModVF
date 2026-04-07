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
    <section ref={sectionRef} className="reveal border-t border-white/5 py-24 sm:py-32">
      <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl md:font-bold">Modpacks testés et validés</h2>

      <div className="mt-12 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testedModpacks.map((item) => (
          <article key={item.name} className="flex h-full flex-col rounded-xl border border-white/5 bg-surface p-6">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold leading-snug text-text">{item.name}</p>
              <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Validé
              </span>
            </div>
            <p className="mt-3 text-sm font-normal text-text-muted">{item.strings}</p>
            <p className="mt-1 text-sm font-normal text-text-muted">{item.scope}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
