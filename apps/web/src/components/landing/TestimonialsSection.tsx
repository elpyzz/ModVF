import { useScrollReveal } from '../../hooks/useScrollReveal'

const testedModpacks = [
  {
    name: 'Better Minecraft (1.20.1)',
    strings: '41K strings',
  },
  {
    name: 'All The Mods 10 (1.21+)',
    strings: '211K strings',
  },
  {
    name: 'Prominence II (1.20.1 Fabric)',
    strings: '66K strings',
  },
  {
    name: 'DawnCraft (1.20.1)',
    strings: '28K strings',
  },
  {
    name: 'MC Eternal 2 (1.20.1)',
    strings: '94K strings',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-20 sm:py-24">
      <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Déjà testé sur les plus gros modpacks</h2>

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {testedModpacks.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-transparent p-6 backdrop-blur-sm"
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-400">✓</span>
              <p className="font-semibold text-text">{item.name}</p>
            </div>
            <p className="mt-3 text-sm text-text-muted">{item.strings}</p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-gray-400">Et tous les modpacks Forge/Fabric/NeoForge en 1.18+</p>
    </section>
  )
}
