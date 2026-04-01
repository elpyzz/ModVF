import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'LeCrafteur_',
    text: "J'ai traduit tout le modpack All The Mods 9 en 3 minutes. Avant je passais des heures a chercher des resource packs incomplets.",
  },
  {
    name: 'Mina_Builds',
    text: 'La qualite de traduction est dingue. Les quetes FTB sont parfaitement traduites, meme les descriptions longues.',
  },
  {
    name: 'DarkPvP_Fr',
    text: 'Mon serveur est passe en full FR grace a ModVF. Les nouveaux joueurs comprennent enfin les mods techniques.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="border-t border-white/5 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="text-center font-display text-3xl font-bold sm:text-4xl"
      >
        Ils jouent enfin en francais
      </motion.h2>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((item, index) => (
          <motion.article
            key={item.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <div aria-hidden className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
              <div>
                <p className="font-semibold text-primary">{item.name}</p>
                <p className="text-xs text-text-muted">★★★★★ 5/5</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-text-muted">{item.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
