import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { formatLines, MODPACKS, type ModpackDifficulty } from '../features/modpacks/modpacksData'
import { useAuthStore } from '../stores/useAuthStore'

function setSeo(title: string, description: string) {
  document.title = title
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) metaDescription.setAttribute('content', description)
}

function difficultyClass(difficulty: ModpackDifficulty): string {
  if (difficulty === 'Débutant') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
  if (difficulty === 'Intermédiaire') return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
  return 'border-red-400/30 bg-red-400/10 text-red-300'
}

const STEP_ITEMS = [
  { icon: '📤', title: 'Upload', description: 'Importez le fichier zip de votre modpack sur ModVF.' },
  { icon: '🧩', title: 'Extraction', description: 'Nous détectons automatiquement tous les fichiers de langue.' },
  { icon: '🌍', title: 'Traduction', description: 'Les textes sont traduits avec notre pipeline spécialisé Minecraft.' },
  { icon: '📦', title: 'Resource pack', description: 'Téléchargez votre pack FR prêt à glisser dans le jeu.' },
]

function supportWarning(level: 'full' | 'partial' | 'items_only') {
  if (level === 'partial') {
    return {
      className: 'bg-orange-900/20 border border-orange-500/30 rounded-lg p-4',
      icon: '⚠️',
      title: 'Traduction partielle des quêtes',
      text:
        'Les items, descriptions et la majorité des quêtes de ce modpack sont traduits en français. Cependant, certaines quêtes peuvent rester en anglais en raison de limitations techniques. Le reste du modpack (items, blocs, descriptions, enchantements) est entièrement traduit.',
    }
  }
  if (level === 'items_only') {
    return {
      className: 'bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4',
      icon: '📦',
      title: 'Items et descriptions traduits — Quêtes non supportées',
      text:
        'Ce modpack utilise un format de quêtes incompatible avec la traduction automatique. Les quêtes restent en anglais. Tous les items, blocs, descriptions, enchantements et interfaces sont traduits en français.',
    }
  }
  return null
}

export default function ModpackDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const ctaHref = isAuthenticated ? '/dashboard' : '/register'

  const modpack = useMemo(() => MODPACKS.find((item) => item.slug === slug), [slug])
  const otherModpacks = useMemo(() => MODPACKS.filter((item) => item.slug !== slug).slice(0, 4), [slug])
  const warning = supportWarning(modpack?.supportLevel ?? 'full')

  useEffect(() => {
    if (!modpack) return
    setSeo(modpack.seoTitle, modpack.seoDescription)
  }, [modpack])

  if (!modpack) {
    return <Navigate to="/modpacks" replace />
  }

  return (
    <div className="border-t border-white/5 bg-dark/40 pb-16">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10">
          <img src={modpack.image} alt={modpack.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-dark/80" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm text-text-muted">Modpacks testés et validés</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{modpack.name}</h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
              {formatLines(modpack.lines)}
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-sm text-text-muted">
              {modpack.version}
            </span>
            <span className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-sm text-text-muted">
              {modpack.loader}
            </span>
          </div>
          <Link
            to={ctaHref}
            className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Traduire {modpack.shortName} en français — Essai gratuit
          </Link>
          <p className="mt-3 text-sm font-medium text-secondary">Première traduction gratuite — même pour ce modpack</p>
          <p className="mt-1 text-xs text-text-muted">Aucune carte bancaire requise</p>
        </div>
      </section>

      <div className="mx-auto mt-10 max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        {warning ? (
          <section className={warning.className}>
            <h2 className="text-base font-semibold text-white">
              <span className="mr-2">{warning.icon}</span>
              {warning.title}
            </h2>
            <p className="mt-2 text-sm text-text-muted">{warning.text}</p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/10 bg-surface/70 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">{modpack.description}</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-surface/70 p-6">
            <h2 className="font-display text-2xl font-bold">Ce qui est traduit</h2>
            <div className="mt-4 space-y-3">
              {modpack.features.map((feature) => (
                <p key={feature} className="flex items-center gap-2 text-sm text-text-muted sm:text-base">
                  <span className="text-emerald-400">✅</span>
                  <span>{feature}</span>
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-surface/70 p-6">
            <h2 className="font-display text-2xl font-bold">Informations</h2>
            <div className="mt-4 space-y-3 text-sm text-text-muted sm:text-base">
              <p>
                <span className="text-white">Version :</span> {modpack.version}
              </p>
              <p>
                <span className="text-white">Loader :</span> {modpack.loader}
              </p>
              <p>
                <span className="text-white">Difficulté :</span>{' '}
                <span className={`ml-2 rounded-full border px-2.5 py-1 text-xs ${difficultyClass(modpack.difficulty)}`}>
                  {modpack.difficulty}
                </span>
              </p>
              <p>
                <span className="text-white">Mods :</span> {modpack.modsCount} mods
              </p>
              <p>
                <a
                  href={modpack.curseforgeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary transition hover:underline"
                >
                  Voir sur CurseForge →
                </a>
              </p>
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface/70 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">Comment traduire {modpack.shortName}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEP_ITEMS.map((step) => (
              <article key={step.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xl">{step.icon}</p>
                <h3 className="mt-2 text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface/70 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">Tutoriel vidéo</h2>
          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            <iframe
              width="100%"
              style={{ aspectRatio: '16 / 9' }}
              src="https://www.youtube.com/embed/W2hp4I---po"
              title={`Tutoriel ${modpack.name}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-primary/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">Prêt à jouer en français ?</h2>
          <p className="mt-3 text-sm text-text-muted sm:text-base">
            Lancez votre première traduction gratuitement et récupérez un resource pack prêt à l&apos;emploi.
          </p>
          <Link to="/register" className="mt-5 inline-flex text-base font-semibold text-secondary transition hover:underline">
            Essayez gratuitement →
          </Link>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold">Autres modpacks</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherModpacks.map((item) => (
              <Link
                key={item.slug}
                to={`/modpacks/${item.slug}`}
                className="overflow-hidden rounded-xl border border-white/10 bg-surface/70 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <img src={item.image} alt={item.name} className="aspect-video w-full object-cover" loading="lazy" />
                <div className="p-3">
                  <p className="text-sm font-semibold text-white">{item.shortName}</p>
                  <p className="mt-1 text-xs text-text-muted">{formatLines(item.lines)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
