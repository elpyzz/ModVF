import { Gamepad2, Globe, HelpCircle, Package } from 'lucide-react'
import type { ReactNode } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

function RevealBlock({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className={`reveal ${className}`}>
      {children}
    </section>
  )
}

function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-dark/80 px-1.5 py-0.5 font-mono text-sm text-secondary">{children}</code>
  )
}

const faqItems = [
  {
    q: 'Ça marche avec quel launcher ?',
    a: 'Tous : CurseForge, Prism Launcher, ATLauncher, MultiMC, Technic, Modrinth App, GDLauncher…',
  },
  {
    q: 'Ça marche avec quelle version de Minecraft ?',
    a: 'Toutes les versions de 1.7.10 à 1.21+, Forge, Fabric, Quilt et NeoForge.',
  },
  {
    q: 'Est-ce que ça modifie mon modpack original ?',
    a: 'Non, ModVF crée une traduction séparée. Votre modpack original n’est jamais modifié.',
  },
  {
    q: 'Pourquoi certains textes restent en anglais ?',
    a: 'Environ 5 % des textes sont codés directement dans le code des mods et ne peuvent pas être traduits par un resource pack. C’est une limitation technique de Minecraft.',
  },
  {
    q: 'Mon modpack a été mis à jour, je dois tout retraduire ?',
    a: 'Oui, mais la retraduction sera beaucoup plus rapide grâce au cache (90 % des textes sont déjà traduits).',
  },
]

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <RevealBlock className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Comment traduire votre modpack</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-text-muted sm:text-lg">
          Suivez ces 3 étapes simples pour jouer en français
        </p>
      </RevealBlock>

      <div className="mt-14 space-y-10">
        <RevealBlock>
          <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-3xl" aria-hidden>
                📦
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
                  <Package className="hidden h-7 w-7 text-secondary sm:block" aria-hidden />
                  Étape 1 : Préparer le ZIP
                </h2>
                <p className="text-sm leading-relaxed text-text-muted sm:text-base">
                  Ouvrez votre launcher (CurseForge, Prism Launcher, ATLauncher, MultiMC…) et accédez au dossier de votre
                  modpack.
                </p>

                <div className="space-y-3 rounded-xl border border-white/10 bg-dark/40 p-4">
                  <p className="font-semibold text-text">Sur CurseForge :</p>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-text-muted sm:text-base">
                    <li>Clic droit sur votre modpack → « Ouvrir le dossier » (ou Open Folder)</li>
                    <li>
                      Vous voyez les dossiers : <InlineCode>mods/</InlineCode>, <InlineCode>config/</InlineCode>,{' '}
                      <InlineCode>kubejs/</InlineCode>, etc.
                    </li>
                    <li>
                      Sélectionnez les dossiers <strong className="text-text">mods/</strong> et{' '}
                      <strong className="text-text">config/</strong>
                    </li>
                    <li>Clic droit → Compresser en fichier ZIP</li>
                    <li>C’est prêt !</li>
                  </ol>
                </div>

                <div className="space-y-3 rounded-xl border border-white/10 bg-dark/40 p-4">
                  <p className="font-semibold text-text">Sur Prism Launcher / MultiMC :</p>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-text-muted sm:text-base">
                    <li>Clic droit sur l’instance → « Dossier Minecraft »</li>
                    <li>
                      Même chose : sélectionnez <InlineCode>mods/</InlineCode> et <InlineCode>config/</InlineCode> →
                      compressez en ZIP
                    </li>
                  </ol>
                </div>

                <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-4">
                  <p className="font-semibold text-secondary">Important :</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-muted sm:text-base">
                    <li>
                      Incluez toujours le dossier <strong className="text-text">mods/</strong> (traductions des objets)
                    </li>
                    <li>
                      Incluez toujours le dossier <strong className="text-text">config/</strong> (quêtes)
                    </li>
                    <li>
                      Pas besoin d’inclure <InlineCode>saves/</InlineCode>, <InlineCode>logs/</InlineCode>,{' '}
                      <InlineCode>resourcepacks/</InlineCode> ou d’autres dossiers
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </RevealBlock>

        <RevealBlock>
          <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-3xl" aria-hidden>
                🌐
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
                  <Globe className="hidden h-7 w-7 text-secondary sm:block" aria-hidden />
                  Étape 2 : Lancer la traduction
                </h2>
                <ol className="list-inside list-decimal space-y-2 text-sm text-text-muted sm:text-base">
                  <li>
                    Connectez-vous sur <strong className="text-text">modvf.fr</strong> (créez un compte si nécessaire)
                  </li>
                  <li>Sur le tableau de bord, glissez votre fichier ZIP dans la zone d’upload</li>
                  <li>Cliquez « Traduire mon modpack »</li>
                  <li>
                    Patientez pendant la traduction :
                    <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
                      <li>Petits modpacks (&lt; 50 mods) : 2–5 minutes</li>
                      <li>Modpacks moyens (50–150 mods) : 5–10 minutes</li>
                      <li>Gros modpacks (200+ mods) : 10–20 minutes</li>
                    </ul>
                  </li>
                  <li>Une fois terminé, cliquez « Télécharger »</li>
                </ol>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-text-muted sm:text-base">
                  <p>
                    <strong className="text-text">Astuce :</strong> la première traduction est la plus longue. Si vous
                    retraduisez le même modpack (après une mise à jour par exemple), ce sera beaucoup plus rapide grâce
                    au cache.
                  </p>
                </div>
              </div>
            </div>
          </article>
        </RevealBlock>

        <RevealBlock>
          <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-3xl" aria-hidden>
                🎮
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
                  <Gamepad2 className="hidden h-7 w-7 text-secondary sm:block" aria-hidden />
                  Étape 3 : Installer et jouer
                </h2>
                <p className="text-sm text-text-muted sm:text-base">Le fichier téléchargé contient :</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-text-muted sm:text-base">
                  <li>
                    <InlineCode>ModVF_Traduction_FR.zip</InlineCode> → le resource pack
                  </li>
                  <li>
                    <InlineCode>config/</InlineCode> → les quêtes traduites
                  </li>
                  <li>
                    <InlineCode>INSTRUCTIONS.txt</InlineCode> → ce guide en résumé
                  </li>
                </ul>

                <div className="space-y-3 rounded-xl border border-white/10 bg-dark/40 p-4">
                  <p className="font-semibold text-text">Installation du resource pack (objets, blocs, créatures) :</p>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-text-muted sm:text-base">
                    <li>Ouvrez le dossier de votre modpack (comme à l’étape 1)</li>
                    <li>
                      Copiez le fichier <InlineCode>ModVF_Traduction_FR.zip</InlineCode> dans le dossier{' '}
                      <InlineCode>resourcepacks/</InlineCode>
                    </li>
                    <li>Lancez Minecraft</li>
                    <li>Options → Resource Packs</li>
                    <li>Activez « ModVF - Traduction FR » (déplacez-le à droite)</li>
                    <li>Options → Langue → Français (France)</li>
                  </ol>
                </div>

                <div className="space-y-3 rounded-xl border border-white/10 bg-dark/40 p-4">
                  <p className="font-semibold text-text">Installation des quêtes traduites :</p>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-text-muted sm:text-base">
                    <li>
                      Copiez le dossier <InlineCode>config/</InlineCode> du ZIP téléchargé
                    </li>
                    <li>Collez-le dans le dossier de votre modpack (remplacez les fichiers existants)</li>
                    <li>Relancez Minecraft</li>
                  </ol>
                </div>

                <p className="text-base font-medium text-text">
                  C’est tout ! Profitez de votre modpack en français 🇫🇷
                </p>
              </div>
            </div>
          </article>
        </RevealBlock>

        <RevealBlock>
          <section className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
              <HelpCircle className="h-7 w-7 text-secondary" aria-hidden />
              Questions fréquentes
            </h2>
            <dl className="mt-8 space-y-6">
              {faqItems.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-text">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-text-muted sm:text-base">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </RevealBlock>
      </div>
    </div>
  )
}
