import { motion } from 'framer-motion'

export function StatsSection() {
  const stats = [
    { value: '~300K', label: 'Strings en cache' },
    { value: '250+', label: 'Termes dans le glossaire' },
    { value: '1.18 ? 1.21+', label: 'Versions supportées' },
    { value: '<2 min', label: 'Modpack déjà en cache' },
  ]

  return (
    <section className="section-padding border-y border-white/5">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="gradient-text mb-2 text-3xl font-extrabold md:text-4xl">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection