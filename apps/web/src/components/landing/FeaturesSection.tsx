const features = [
  {
    title: 'Traduction automatique',
    desc: 'Quêtes, objets, interfaces — selon les fichiers de langue disponibles.',
    icon: '?',
  },
  {
    title: 'Cache communautaire',
    desc: 'Gros pack : souvent moins de 15 min. Le cache accélère la suite.',
    icon: '??',
  },
  {
    title: 'Glossaire gaming',
    desc: '250+ termes préservés : Redstone, Ender Pearl, Nether Portal restent en anglais.',
    icon: '??',
  },
  {
    title: 'Zéro configuration',
    desc: 'Pas de mod ni de terminal. Tu envoies le .zip, tu récupères la traduction.',
    icon: '?',
  },
  {
    title: 'Mod seul ou modpack entier',
    desc: 'Dépose un .jar ou un .zip — les deux fonctionnent.',
    icon: '??',
  },
  {
    title: 'Resource pack prêt',
    desc: 'De 1.18 à 1.21+. Tu importes dans ton launcher et tu joues.',
    icon: '??',
  },
]

export function FeaturesSection() {
  return (
    <section className="section-padding border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">Pourquoi ModVF</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="card-hover rounded-2xl border border-white/5 bg-surface-2 p-6"
              style={{ animationDelay: `${(i + 1) * 0.1}s` }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-3 text-lg">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection