import { motion } from 'framer-motion'

const modpacks = [
  'Better Minecraft',
  'All The Mods 9',
  'RLCraft',
  'Vault Hunters',
  'Create: Above & Beyond',
  'Prominence II',
  'Cobblemon',
  'SkyFactory 4',
  'All of Fabric',
  'Medieval Minecraft',
]

export default function ModpacksTestedSection() {
  return (
    <section className="border-t border-white/5 py-20 sm:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="text-center font-display text-3xl font-bold sm:text-4xl"
      >
        Compatible avec tous vos modpacks préférés
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: 0.06 }}
        className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5 sm:gap-3"
      >
        {modpacks.map((name, index) => (
          <motion.span
            key={name}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-text sm:px-4 sm:text-sm"
          >
            {name}
          </motion.span>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8 text-center text-sm text-text-muted sm:text-base"
      >
        Et des milliers d&apos;autres…
      </motion.p>
    </section>
  )
}
