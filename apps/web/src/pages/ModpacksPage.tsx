import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_MODPACKS_SEO, formatLines, MODPACKS, type Modpack, type ModpackDifficulty } from '../features/modpacks/modpacksData'
import { useAuthStore } from '../stores/useAuthStore'

type SortMode = 'popular' | 'alphabetical'

const VERSION_FILTERS = ['Toutes', '1.21+', '1.20.1', '1.18.2'] as const
const LOADER_FILTERS = ['Tous', 'Forge', 'Fabric', 'NeoForge'] as const
const DIFFICULTY_FILTERS: Array<'Toutes' | ModpackDifficulty> = ['Toutes', 'Débutant', 'Intermédiaire', 'Avancé']

function setSeo(title: string, description: string, keywords: string) {
  document.title = title
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) metaDescription.setAttribute('content', description)

  let metaKeywords = document.querySelector('meta[name="keywords"]')
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta')
    metaKeywords.setAttribute('name', 'keywords')
    document.head.append(metaKeywords)
  }
  metaKeywords.setAttribute('content', keywords)
}

function difficultyClass(difficulty: ModpackDifficulty): string {
  if (difficulty === 'Débutant') return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
  if (difficulty === 'Intermédiaire') return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
  return 'border-red-400/30 bg-red-400/10 text-red-300'
}

function CompactFeatureTag({ label }: { label: string }) {
  const compact = label
    .replace(' traduits', '')
    .replace(' traduites', '')
    .replace(' traduit', '')
    .replace(' traduite', '')
  return (
    <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs text-text-muted">
      {compact}
    </span>
  )
}

function supportBadge(modpack: Modpack): { className: string; label: string } {
  if (modpack.supportLevel === 'partial') {
    return {
      className: 'border-orange-400/30 bg-orange-400/15 text-orange-300',
      label: '⚠️ Quêtes partielles',
    }
  }
  if (modpack.supportLevel === 'items_only') {
    return {
      className: 'border-yellow-400/30 bg-yellow-400/15 text-yellow-300',
      label: '📦 Items traduits uniquement',
    }
  }
  return {
    className: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
    label: '✅ Traduction complète',
  }
}

export default function ModpacksPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const ctaHref = isAuthenticated ? '/dashboard' : '/register'

  const [versionFilter, setVersionFilter] = useState<(typeof VERSION_FILTERS)[number]>('Toutes')
  const [loaderFilter, setLoaderFilter] = useState<(typeof LOADER_FILTERS)[number]>('Tous')
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof DIFFICULTY_FILTERS)[number]>('Toutes')
  const [sortMode, setSortMode] = useState<SortMode>('popular')

  useEffect(() => {
    setSeo(DEFAULT_MODPACKS_SEO.title, DEFAULT_MODPACKS_SEO.description, DEFAULT_MODPACKS_SEO.keywords)
    // #region agent log
    fetch('http://127.0.0.1:7546/ingest/2d8b084d-a0b7-4c57-bf6d-39baad40337a', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'db5095' },
      body: JSON.stringify({
        sessionId: 'db5095',
        runId: 'initial',
        hypothesisId: 'H1',
        location: 'ModpacksPage.tsx:56',
        message: 'modpacks page mounted',
        data: { modpacksCount: MODPACKS.length },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [])

  const filteredModpacks = useMemo(() => {
    const base = MODPACKS.filter((modpack) => {
      const byVersion = versionFilter === 'Toutes' || modpack.version.includes(versionFilter)
      const byLoader = loaderFilter === 'Tous' || modpack.loader.includes(loaderFilter)
      const byDifficulty = difficultyFilter === 'Toutes' || modpack.difficulty === difficultyFilter
      return byVersion && byLoader && byDifficulty
    })

    if (sortMode === 'alphabetical') {
      return [...base].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    }
    return [...base].sort((a, b) => b.lines - a.lines)
  }, [difficultyFilter, loaderFilter, sortMode, versionFilter])

  return (
    <div className="border-t border-white/5 bg-dark/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-surface/70 p-8 text-center sm:p-10">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Modpacks testés et validés</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-text-muted sm:text-base">
            Chaque modpack est traduit, installé et vérifié en jeu par notre équipe. Si c&apos;est sur cette page, c&apos;est
            que ça marche.
          </p>
          <span className="mt-6 inline-flex rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">
            {MODPACKS.length} modpacks validés
          </span>
        </section>

        <section className="mt-10 space-y-4 rounded-2xl border border-white/10 bg-surface/40 p-4 sm:p-5">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Version</p>
            <div className="flex flex-wrap gap-2">
              {VERSION_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVersionFilter(option)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    versionFilter === option
                      ? 'border-primary/60 bg-primary/20 text-white'
                      : 'border-white/15 bg-white/[0.03] text-text-muted hover:border-white/25 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Loader</p>
            <div className="flex flex-wrap gap-2">
              {LOADER_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLoaderFilter(option)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    loaderFilter === option
                      ? 'border-primary/60 bg-primary/20 text-white'
                      : 'border-white/15 bg-white/[0.03] text-text-muted hover:border-white/25 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Difficulté</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDifficultyFilter(option)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    difficultyFilter === option
                      ? 'border-primary/60 bg-primary/20 text-white'
                      : 'border-white/15 bg-white/[0.03] text-text-muted hover:border-white/25 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Tri</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSortMode('popular')}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  sortMode === 'popular'
                    ? 'border-primary/60 bg-primary/20 text-white'
                    : 'border-white/15 bg-white/[0.03] text-text-muted hover:border-white/25 hover:text-white'
                }`}
              >
                Plus populaire
              </button>
              <button
                type="button"
                onClick={() => setSortMode('alphabetical')}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  sortMode === 'alphabetical'
                    ? 'border-primary/60 bg-primary/20 text-white'
                    : 'border-white/15 bg-white/[0.03] text-text-muted hover:border-white/25 hover:text-white'
                }`}
              >
                Alphabétique
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredModpacks.map((modpack) => {
            const badge = supportBadge(modpack)
            return (
              <article
                key={modpack.slug}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-surface transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)]"
              >
              <Link to={`/modpacks/${modpack.slug}`} className="block">
                <div className="relative aspect-video">
                  <img src={modpack.image} alt={modpack.name} className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute right-3 top-3 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    ✅ Vérifié
                  </span>
                </div>
              </Link>

              <div className="p-5">
                <Link to={`/modpacks/${modpack.slug}`} className="block">
                  <h2 className="font-display text-xl font-semibold text-white">{modpack.name}</h2>
                </Link>
                <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
                <p className="mt-1 text-sm text-text-muted">
                  {modpack.version} · {modpack.loader}
                </p>
                <p className="mt-3 text-2xl font-bold text-secondary">{formatLines(modpack.lines)}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-muted">{modpack.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {modpack.features.slice(0, 4).map((feature) => (
                    <CompactFeatureTag key={feature} label={feature} />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyClass(modpack.difficulty)}`}>
                    {modpack.difficulty}
                  </span>
                  <span className="text-sm text-text-muted">{modpack.modsCount} mods</span>
                </div>

                <Link
                  to={ctaHref}
                  className="mt-5 inline-flex text-base font-semibold text-primary transition hover:underline"
                >
                  Traduire en français →
                </Link>
              </div>
              </article>
            )
          })}
        </section>

        <section className="mt-12 rounded-2xl border border-primary/20 bg-primary/10 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold">Votre modpack n&apos;est pas dans la liste ?</h2>
          <p className="mt-3 max-w-3xl text-sm text-text-muted sm:text-base">
            ModVF est compatible avec tous les modpacks Minecraft 1.18+. Même si votre modpack n&apos;apparaît pas ici, vous
            pouvez le traduire. On ajoute régulièrement de nouveaux modpacks testés et validés.
          </p>
          <Link to="/dashboard" className="mt-5 inline-flex text-base font-semibold text-secondary transition hover:underline">
            Traduire mon modpack →
          </Link>
        </section>
      </div>
    </div>
  )
}
