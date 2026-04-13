import {
  CheckCircle2,
  FileArchive,
  FileSearch,
  Globe2,
  Languages,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wand2,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatLines, MODPACKS } from '../features/modpacks/modpacksData'

const testedModpacks = MODPACKS.map((pack) => ({
  name: pack.shortName,
  lines: formatLines(pack.lines),
  ok: true,
}))

const steps = [
  {
    title: 'Upload',
    text: 'Uploadez votre dossier en ZIP contenant les dossiers config et mods.',
    Icon: FileArchive,
  },
  {
    title: 'Extraction',
    text: 'ModVF extrait les fichiers de langue anglais (en_us.json) de chaque mod.',
    Icon: FileSearch,
  },
  {
    title: 'Traduction',
    text: 'Chaque texte est traduit via Google Translate, enrichi par un glossaire gaming de 250+ termes Minecraft (items, enchantements, effets...) pour éviter les traductions absurdes.',
    Icon: Languages,
  },
  {
    title: 'Resource Pack',
    text: 'ModVF génère un resource pack séparé à installer dans Minecraft. Vos mods originaux ne sont JAMAIS modifiés.',
    Icon: PackageCheck,
  },
]

export default function HowItWorksPage() {
  useEffect(() => {
    document.title = 'Comment ça marche — ModVF'
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Comment fonctionne ModVF ?
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base text-text-muted sm:text-lg">
          Transparence totale sur notre pipeline : ce que nous traitons, ce que nous générons, et ce que nous ne
          modifions jamais.
        </p>
      </header>

      <section className="mt-10 rounded-2xl border border-white/10 bg-surface p-5 sm:p-7">
        <h2 className="text-xl font-semibold sm:text-2xl">1) Comment fonctionne ModVF ?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, idx) => (
            <article key={step.title} className="rounded-xl border border-white/10 bg-dark/40 p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <step.Icon className="h-5 w-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Étape {idx + 1}</p>
              </div>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
          2) Vos mods ne sont pas modifiés
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-emerald-100/90 sm:text-base">
          ModVF ne touche pas à vos fichiers de mods. Il génère un resource pack indépendant qui s&apos;installe dans
          le dossier resourcepacks/ de Minecraft. Vous pouvez le retirer à tout moment pour revenir à l&apos;anglais.
          Le resource pack contient uniquement des fichiers JSON de traduction que vous pouvez ouvrir et vérifier
          vous-même.
        </p>
        <p className="mt-3 text-sm font-medium text-emerald-100 sm:text-base">
          Installation : copiez simplement le resource pack dans votre dossier. Ne supprimez jamais vos fichiers
          existants.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-surface p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
          <Wand2 className="h-5 w-5 text-primary" />
          3) Qualité de traduction
        </h2>
        <div className="mt-5 space-y-3 text-sm text-text-muted sm:text-base">
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            Glossaire gaming de 250+ termes spécialisés (exemples : Redstone, Nether, Ender Dragon restent tels quels)
          </p>
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            Protection des placeholders techniques (%s, %d, etc.)
          </p>
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            Cache de 300 000+ traductions déjà validées
          </p>
          <p className="rounded-xl border border-white/10 bg-dark/40 p-4 leading-relaxed">
            La traduction n&apos;est pas parfaite à 100%, mais elle rend le jeu compréhensible et jouable en français.
            Les améliorations sont continues.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-surface p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
          <UserRound className="h-5 w-5 text-primary" />
          4) Qui est derrière ModVF ?
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-muted sm:text-base">
          <p>ModVF est créé par Louis Pereira et une petite équipe de développeur, passionnés de Minecraft.</p>
          <p>Auto-entrepreneur basé en France (SIRET visible dans les mentions légales).</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link to="/mentions-legales" className="text-secondary underline-offset-2 hover:underline">
              Mentions légales
            </Link>
            <Link to="/cgv" className="text-secondary underline-offset-2 hover:underline">
              CGV
            </Link>
            <Link to="/confidentialite" className="text-secondary underline-offset-2 hover:underline">
              Politique RGPD
            </Link>
            <a href="mailto:contact@modvf.fr" className="text-secondary underline-offset-2 hover:underline">
              contact@modvf.fr
            </a>
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-surface p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
          <Globe2 className="h-5 w-5 text-primary" />
          5) Modpacks testés et supportés
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {testedModpacks.map((pack) => (
            <div key={pack.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-dark/40 p-4">
              <p className="font-medium text-white">{pack.name}</p>
              <p className="text-sm text-text-muted">
                {pack.lines} {pack.ok ? '✅' : ''}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-text-muted">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Et n&apos;importe quel modpack 1.18+
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Attention : dans de rares cas, certains modpacks n&apos;incluent pas de fichiers de langue en .json. Ces
          textes sont alors très difficiles à traduire, même manuellement, mais cela reste exceptionnel.
        </p>
      </section>
    </div>
  )
}
