import { useScrollReveal } from '../../hooks/useScrollReveal'

const testimonials = [
  {
    name: 'LeCrafteur_',
    stars: '★★★★★',
    text: 'J’ai traduit Better Minecraft complet en 10 minutes. 42 000 chaînes, 224 mods. Avant je galérais avec des packs de ressources incomplets.',
  },
  {
    name: 'Mina_Builds',
    stars: '★★★★★',
    text: 'Les quêtes FTB sont parfaitement traduites ! Même les descriptions longues et les codes couleur sont préservés.',
  },
  {
    name: 'DarkPvP_Fr',
    stars: '★★★★★',
    text: 'J’ai testé avec All The Mods 9, Vault Hunters et Prominence. Tout marche. Le pack de ressources se met en deux secondes.',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-20 sm:py-24">
      <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Ils jouent enfin en français</h2>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-transparent p-6 backdrop-blur-sm"
          >
            <p className="text-lg leading-none text-amber-400" aria-label="Note cinq sur cinq">
              {item.stars}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div aria-hidden className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-90" />
              <div>
                <p className="font-semibold text-text">{item.name}</p>
                <p className="text-xs text-text-muted">Joueur ModVF</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
