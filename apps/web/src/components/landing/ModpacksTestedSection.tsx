import { useScrollReveal } from '../../hooks/useScrollReveal'

const modpacks = [
  'Better Minecraft',
  'All The Mods 10',
  'Vault Hunters',
  'Prominence II',
  'DawnCraft',
  'MC Eternal 2',
]

export default function ModpacksTestedSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-24 sm:py-32">
      <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl md:font-bold">
        Compatible avec tous vos modpacks préférés
      </h2>

      <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5 sm:gap-3">
        {modpacks.map((name) => (
          <span
            key={name}
            className="rounded-full border border-white/5 bg-surface px-3.5 py-2 text-xs font-medium text-text sm:px-4 sm:text-sm"
          >
            {name}
          </span>
        ))}
      </div>

      <p className="mt-8 text-center text-sm font-normal text-text-muted sm:text-base">
        Et tous les modpacks Forge/Fabric/NeoForge en 1.18+
      </p>
    </section>
  )
}
