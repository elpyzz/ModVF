import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { BLOG_ARTICLES, type BlogArticle, type BlogCategory } from '../data/blog/articles'
import { MODPACKS } from '../features/modpacks/modpacksData'
import { useAuthStore } from '../stores/useAuthStore'

const categoryStyles: Record<BlogCategory, string> = {
  guide: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  modpack: 'border-violet-400/30 bg-violet-500/10 text-violet-300',
  tutoriel: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
  actualite: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
}

const categoryLabel: Record<BlogCategory, string> = {
  guide: 'Guide',
  modpack: 'Modpack',
  tutoriel: 'Tutoriel',
  actualite: 'Actualite',
}

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function setArticleSeo(article: BlogArticle) {
  document.title = article.seoTitle

  const setMeta = (selector: string, attr: 'name' | 'property', value: string, content: string) => {
    let tag = document.querySelector(selector)
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute(attr, value)
      document.head.append(tag)
    }
    tag.setAttribute('content', content)
  }

  setMeta('meta[name="description"]', 'name', 'description', article.seoDescription)
  setMeta('meta[name="keywords"]', 'name', 'keywords', article.keywords)
  setMeta('meta[property="og:title"]', 'property', 'og:title', article.seoTitle)
  setMeta('meta[property="og:description"]', 'property', 'og:description', article.seoDescription)
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'article')
}

export default function BlogArticlePage() {
  const { slug } = useParams()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const ctaHref = isAuthenticated ? '/dashboard' : '/register'
  const article = useMemo(() => BLOG_ARTICLES.find((item) => item.slug === slug), [slug])

  useEffect(() => {
    if (!article) return
    setArticleSeo(article)
  }, [article])

  const related = useMemo(() => {
    if (!article) return []
    return BLOG_ARTICLES.filter((item) => item.category === article.category && item.slug !== article.slug).slice(0, 3)
  }, [article])

  const ctaModpackName = useMemo(() => {
    if (!article) return 'votre modpack'
    const haystack = `${article.title} ${article.content}`.toLowerCase()
    const found = MODPACKS.find((modpack) => {
      const name = modpack.name.toLowerCase()
      const shortName = modpack.shortName.toLowerCase()
      return haystack.includes(name) || haystack.includes(shortName)
    })
    return found ? found.shortName : 'votre modpack'
  }, [article])

  if (!article) return <Navigate to="/blog" replace />

  return (
    <div className="border-t border-white/5 bg-dark/40 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex text-sm font-medium text-primary transition hover:underline">
          ← Retour au blog
        </Link>

        <article className="mx-auto mt-6 max-w-[720px]">
          <header className="border-b border-white/10 pb-6">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{article.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <span className={`rounded-full border px-2.5 py-0.5 font-medium ${categoryStyles[article.category]}`}>
                {categoryLabel[article.category]}
              </span>
              <span>{formatDate(article.publishedAt)}</span>
              <span aria-hidden>•</span>
              <span>{article.readingTime}</span>
            </div>
          </header>

          <div
            className="prose prose-invert mt-8 max-w-none prose-headings:font-display prose-h2:mt-10 prose-h2:text-2xl prose-h2:text-white prose-h3:mt-8 prose-h3:text-xl prose-h3:text-white prose-p:leading-8 prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <section className="mx-auto mt-12 max-w-[720px] rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
          <h2 className="text-xl font-semibold text-white">Traduisez {ctaModpackName} gratuitement</h2>
          <p className="mt-2 text-sm text-text-muted">Première traduction offerte, sans limite de taille</p>
          <Link
            to={ctaHref}
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Essayer gratuitement
          </Link>
        </section>

        <section className="mx-auto mt-10 max-w-[720px]">
          <h2 className="text-xl font-semibold text-white">Articles similaires</h2>
          {related.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to={`/blog/${item.slug}`}
                  className="rounded-xl border border-white/10 bg-surface/60 p-4 text-sm transition hover:border-white/20"
                >
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-2 text-xs text-text-muted">{item.readingTime}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-muted">D'autres articles de cette categorie arrivent bientot.</p>
          )}
        </section>
      </div>
    </div>
  )
}
