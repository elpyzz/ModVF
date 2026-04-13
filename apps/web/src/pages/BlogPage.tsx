import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BLOG_ARTICLES, type BlogCategory } from '../data/blog/articles'

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

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  useEffect(() => {
    document.title = 'Blog ModVF - Guides et actus traduction Minecraft'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Retrouvez nos guides, tutoriels et actualites pour traduire vos modpacks Minecraft en francais avec ModVF.'
      )
    }

    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.setAttribute('name', 'keywords')
      document.head.append(metaKeywords)
    }
    metaKeywords.setAttribute('content', 'blog minecraft, guide modpack, tutoriel traduction, modvf')
  }, [])

  const sortedArticles = useMemo(
    () => [...BLOG_ARTICLES].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    []
  )

  return (
    <div className="border-t border-white/5 bg-dark/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/10 bg-surface/70 p-8 sm:p-10">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Blog ModVF</h1>
          <p className="mt-4 max-w-3xl text-sm text-text-muted sm:text-base">
            Guides, tutoriels et actualites pour jouer a Minecraft en francais sans prise de tete.
          </p>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {sortedArticles.map((article) => {
            const excerpt = stripHtml(article.content).slice(0, 150)
            return (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="group rounded-2xl border border-white/10 bg-surface/70 p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-surface"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className={`rounded-full border px-2 py-0.5 font-medium ${categoryStyles[article.category]}`}>
                    {categoryLabel[article.category]}
                  </span>
                  <span>{formatDate(article.publishedAt)}</span>
                  <span aria-hidden>•</span>
                  <span>{article.readingTime}</span>
                </div>
                <h2 className="text-lg font-semibold text-white transition group-hover:text-primary">{article.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{excerpt}{excerpt.length >= 150 ? '...' : ''}</p>
              </Link>
            )
          })}
        </section>
      </div>
    </div>
  )
}
