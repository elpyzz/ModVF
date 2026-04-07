import { motion } from 'framer-motion'
import { useMemo } from 'react'

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

export function TestimonialsSection() {
  const cardClasses = useMemo(() => ['md:col-span-1', 'md:col-span-1', 'md:col-span-1', 'md:col-start-1', 'md:col-start-3'], [])

  return (
    <section className="section-padding border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold md:text-5xl">Modpacks testés et validés</h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {testedModpacks.map((item, i) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`card-hover rounded-xl border border-white/5 bg-surface-2 p-5 ${cardClasses[i] ?? ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-white">{item.name}</p>
                <span className="rounded-full border border-brand-400/20 bg-brand-400/10 px-2 py-0.5 text-xs text-brand-400">Validé</span>
              </div>
              <p className="mt-3 font-mono text-sm text-muted">{item.strings}</p>
              <p className="mt-1 text-sm text-muted">{item.scope}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection