export type BlogCategory = 'guide' | 'modpack' | 'tutoriel' | 'actualite'

export interface BlogArticle {
  slug: string
  title: string
  seoTitle: string
  seoDescription: string
  keywords: string
  category: BlogCategory
  publishedAt: string
  readingTime: string
  content: string
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'comment-jouer-atm10-en-francais',
    title: 'Comment jouer a ATM10 en francais : guide complet',
    seoTitle: 'Comment jouer a ATM10 en francais | Guide complet 2026 - ModVF',
    seoDescription:
      'Decouvrez comment traduire ATM10 en francais automatiquement. Guide etape par etape pour jouer a All The Mods 10 en francais avec ModVF.',
    keywords: 'ATM10 francais, All The Mods 10 francais, traduire ATM10, modpack minecraft francais',
    category: 'guide',
    publishedAt: '2026-04-09',
    readingTime: '5 min',
    content: '<p>Article placeholder</p>',
  },
]
