import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  CreditCard,
  Cpu,
  FolderOpen,
  Globe,
  Languages,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type FaqEntry = {
  id: string
  q: string
  searchText: string
  a: ReactNode
}

type FaqCategory = {
  id: string
  title: string
  icon: LucideIcon
  items: FaqEntry[]
}

function AnswerParagraph({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-text-muted sm:text-base">{children}</p>
}

const faqCategories: FaqCategory[] = [
  {
    id: 'compat',
    title: 'Compatibilité',
    icon: Globe,
    items: [
      {
        id: 'c1',
        q: 'Quelles versions de Minecraft sont supportées ?',
        searchText: 'minecraft versions 1.18 1.19 1.20 1.21 supportées',
        a: (
          <AnswerParagraph>
            ModVF supporte les modpacks Minecraft de la version 1.18 à 1.21+, en Forge, Fabric et NeoForge.
          </AnswerParagraph>
        ),
      },
      {
        id: 'c2',
        q: 'Quels loaders sont compatibles ?',
        searchText: 'loaders forge fabric quilt neoforge modernes',
        a: (
          <AnswerParagraph>
            Forge, Fabric, Quilt et NeoForge. Tous les loaders modernes sont supportés.
          </AnswerParagraph>
        ),
      },
      {
        id: 'c3',
        q: 'Quels launchers sont compatibles ?',
        searchText:
          'launchers curseforge prism atlauncher multimc modrinth gdlauncher technic dossier modpack',
        a: (
          <AnswerParagraph>
            Tous : CurseForge, Prism Launcher, ATLauncher, MultiMC, Modrinth App, GDLauncher, Technic Launcher. Il
            suffit d&apos;accéder au dossier du modpack.
          </AnswerParagraph>
        ),
      },
      {
        id: 'c4',
        q: 'Quelle taille de modpack maximum ?',
        searchText: 'taille 2 go mods 300 minutes traduction gros',
        a: (
          <AnswerParagraph>
            Jusqu&apos;à 2 Go. Les modpacks de 300+ mods sont supportés. Plus le modpack est gros, plus la première
            traduction prend de temps (15-30 minutes pour un très gros modpack).
          </AnswerParagraph>
        ),
      },
    ],
  },
  {
    id: 'trad',
    title: 'Traduction',
    icon: Languages,
    items: [
      {
        id: 't1',
        q: "Qu'est-ce qui est traduit exactement ?",
        searchText:
          'traduit items blocs tooltips quêtes ftb patchouli advancements enchantements potions messages',
        a: (
          <div className="space-y-3 text-sm leading-relaxed text-text-muted sm:text-base">
            <p>ModVF traduit environ 95% du texte visible en jeu :</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>Noms des items, blocs, outils, armures, mobs</li>
              <li>Descriptions et tooltips</li>
              <li>Quêtes FTB Quests (titres, descriptions, sous-titres)</li>
              <li>Livres Patchouli (guides in-game)</li>
              <li>Avancements (advancements)</li>
              <li>Noms des enchantements, potions, effets</li>
              <li>Messages et dialogues des mods</li>
            </ul>
          </div>
        ),
      },
      {
        id: 't2',
        q: 'Pourquoi certains items restent en anglais ?',
        searchText:
          'pas traduit 5 pour cent code java messages système interfaces limitation minecraft resource pack',
        a: (
          <AnswerParagraph>
            Certains mods codent leurs textes directement dans le code Java au lieu d&apos;utiliser des fichiers de
            langue standard. Ces textes sont impossibles à traduire par un resource pack, que ce soit par ModVF ou
            même par un traducteur humain. Cela ne concerne qu&apos;une minorité de mods (ex : Vault Hunters). La
            grande majorité des mods populaires sont entièrement traduits.
          </AnswerParagraph>
        ),
      },
      {
        id: 't3',
        q: 'Toutes les quêtes sont traduites ?',
        searchText:
          'quêtes ftb quests vault hunters better minecraft all the mods prominence enigmatica propriétaire',
        a: (
          <div className="space-y-3 text-sm leading-relaxed text-text-muted sm:text-base">
            <p>
              Les quêtes utilisant FTB Quests sont entièrement traduites. La majorité des modpacks populaires utilisent
              FTB Quests : Better Minecraft, All The Mods, Prominence, Create: Above & Beyond, Medieval Minecraft,
              Enigmatica, et beaucoup d&apos;autres.
            </p>
            <p>
              Quelques rares modpacks comme Vault Hunters utilisent un système de quêtes propriétaire intégré au mod.
              Ces quêtes ne peuvent pas être traduites, mais tous les items et blocs le sont.
            </p>
          </div>
        ),
      },
      {
        id: 't4',
        q: 'La qualité de traduction est-elle bonne ?',
        searchText: 'qualité glossaire crafting table établi naturel phrases',
        a: (
          <AnswerParagraph>
            ModVF utilise un moteur de traduction avancé avec un glossaire gaming Minecraft intégré. Par exemple,
            &apos;Crafting Table&apos; est toujours traduit en &apos;Établi&apos; (pas &apos;Table de fabrication&apos;).
            Les termes techniques du jeu sont correctement traduits. Pour les descriptions longues, la traduction est
            très bonne mais peut parfois manquer de naturel sur des phrases complexes.
          </AnswerParagraph>
        ),
      },
      {
        id: 't5',
        q: 'Les codes couleur et le formatage sont préservés ?',
        searchText: 'codes couleur formatage placeholders préservés',
        a: (
          <AnswerParagraph>
            Oui. Les codes couleur Minecraft (§a, §b, &amp;6, etc.), les placeholders (%s, %d, {'{0}'}), et le formatage
            spécial sont détectés et préservés automatiquement.
          </AnswerParagraph>
        ),
      },
    ],
  },
  {
    id: 'usage',
    title: 'Utilisation',
    icon: FolderOpen,
    items: [
      {
        id: 'u1',
        q: 'Quels dossiers dois-je inclure dans le ZIP ?',
        searchText: 'zip mods config dossiers inclure',
        a: (
          <AnswerParagraph>
            Sélectionnez le dossier mods/ et le dossier config/ de votre modpack, puis compressez-les en ZIP. Le
            dossier mods/ contient les traductions des items/blocs, le dossier config/ contient les quêtes.
          </AnswerParagraph>
        ),
      },
      {
        id: 'u2',
        q: 'Combien de temps prend une traduction ?',
        searchText: 'temps durée minutes cache première traduction',
        a: (
          <div className="space-y-3 text-sm leading-relaxed text-text-muted sm:text-base">
            <p>Cela dépend de la taille du modpack et de si c&apos;est la première traduction :</p>
            <ul className="list-inside list-disc space-y-1 pl-1">
              <li>Petit modpack (&lt; 50 mods) : 2-5 minutes</li>
              <li>Modpack moyen (50-150 mods) : 5-10 minutes</li>
              <li>Gros modpack (200+ mods) : 15-30 minutes la première fois</li>
            </ul>
            <p>
              Les traductions suivantes du même modpack sont beaucoup plus rapides (2-5 minutes) grâce au cache.
            </p>
          </div>
        ),
      },
      {
        id: 'u2b',
        q: 'Pourquoi la traduction est longue la première fois ?',
        searchText: 'premiere fois longue cache strings 50000',
        a: (
          <AnswerParagraph>
            Quand un modpack est traduit pour la première fois, ModVF doit traduire chaque string une par une. Cela
            peut prendre 10 à 30 minutes pour les gros modpacks (50 000+ strings). Mais bonne nouvelle : toutes ces
            traductions sont mises en cache. Si un autre joueur traduit le même modpack, ou un modpack qui partage des
            mods en commun, ce sera quasi instantané.
          </AnswerParagraph>
        ),
      },
      {
        id: 'u3',
        q: 'Comment installer le modpack traduit ?',
        searchText: 'installer resourcepacks config guide téléchargement',
        a: (
          <div className="space-y-3 text-sm leading-relaxed text-text-muted sm:text-base">
            <p>Le fichier téléchargé contient :</p>
            <ol className="list-inside list-decimal space-y-2 pl-1">
              <li>
                ModVF_Traduction_FR.zip — copiez-le dans le dossier resourcepacks/ de votre modpack, puis activez-le
                dans Options &gt; Packs de ressources
              </li>
              <li>
                config/ — remplacez le dossier config/ de votre modpack par celui du ZIP (supprimez l&apos;ancien
                d&apos;abord, puis collez le nouveau)
              </li>
            </ol>
            <p>
              Consultez notre{' '}
              <Link to="/guide" className="font-semibold text-secondary underline-offset-2 hover:underline">
                Guide
              </Link>{' '}
              pour les instructions détaillées.
            </p>
          </div>
        ),
      },
      {
        id: 'u4',
        q: 'Mon modpack a été mis à jour, je dois tout retraduire ?',
        searchText: 'mise à jour cache retraduction',
        a: (
          <AnswerParagraph>
            Oui, il faut relancer une traduction après chaque mise à jour du modpack. Mais grâce au cache, la
            retraduction est très rapide : 90% des textes n&apos;ont pas changé et sont réutilisés instantanément.
          </AnswerParagraph>
        ),
      },
      {
        id: 'u5',
        q: "Le resource pack affiche 'incompatible', c'est grave ?",
        searchText: 'incompatible pack_format oui charger',
        a: (
          <AnswerParagraph>
            Non, ce message apparaît parfois quand le pack_format ne correspond pas exactement à votre version de
            Minecraft. Cliquez &apos;Oui&apos; pour charger quand même — le resource pack fonctionnera normalement dans
            la grande majorité des cas.
          </AnswerParagraph>
        ),
      },
      {
        id: 'u6',
        q: 'Est-ce que ça modifie mon modpack original ?',
        searchText: 'modifie original resource pack séparé',
        a: (
          <AnswerParagraph>
            Non, jamais. ModVF crée une traduction séparée (resource pack + config traduit). Votre modpack original
            n&apos;est pas touché. Si vous voulez revenir en anglais, désactivez simplement le resource pack.
          </AnswerParagraph>
        ),
      },
      {
        id: 'u7',
        q: 'Le jeu doit être en quelle langue ?',
        searchText: 'jeu langue anglais resource pack',
        a: (
          <AnswerParagraph>
            Votre jeu Minecraft doit être réglé en anglais dans les options de langue. ModVF remplace les textes
            anglais par du français via un resource pack. Si votre jeu est réglé en français, les traductions ModVF ne
            s&apos;afficheront pas.
          </AnswerParagraph>
        ),
      },
    ],
  },
  {
    id: 'pay',
    title: 'Paiement et crédits',
    icon: CreditCard,
    items: [
      {
        id: 'p1',
        q: 'Comment fonctionnent les crédits ?',
        searchText: 'crédits traduction gratuit inscription',
        a: (
          <AnswerParagraph>
            1 crédit = 1 traduction de modpack. Vous recevez 1 crédit gratuit à l&apos;inscription pour tester le
            service.
          </AnswerParagraph>
        ),
      },
      {
        id: 'p2',
        q: 'Combien de temps mes crédits sont-ils valables ?',
        searchText: 'validité 6 mois achat',
        a: <AnswerParagraph>Vos crédits sont valables 6 mois à partir de la date d&apos;achat.</AnswerParagraph>,
      },
      {
        id: 'p3',
        q: 'Puis-je obtenir un remboursement ?',
        searchText: 'remboursement 14 jours contact modvf',
        a: (
          <AnswerParagraph>
            Oui, dans les 14 jours si vous n&apos;avez utilisé aucun crédit acheté. Contactez-nous à contact@modvf.fr.
          </AnswerParagraph>
        ),
      },
      {
        id: 'p4',
        q: 'Quels moyens de paiement sont acceptés ?',
        searchText: 'paiement stripe visa mastercard amex',
        a: (
          <AnswerParagraph>
            Carte bancaire (Visa, Mastercard, American Express) via Stripe, leader mondial du paiement sécurisé en
            ligne.
          </AnswerParagraph>
        ),
      },
      {
        id: 'p5',
        q: 'Pourquoi le téléchargement est limité à 3 fois ?',
        searchText: 'téléchargement 3 fois redistribution compte cache',
        a: (
          <AnswerParagraph>
            Pour protéger les traductions contre la redistribution. Chaque traduction est liée à votre compte. Si vous
            avez besoin de re-télécharger, relancez simplement une traduction (ce sera quasi instantané grâce au cache).
          </AnswerParagraph>
        ),
      },
    ],
  },
  {
    id: 'tech',
    title: 'Technique',
    icon: Cpu,
    items: [
      {
        id: 'k1',
        q: 'Comment fonctionne ModVF ?',
        searchText: 'fonctionne analyse extrait langue resource pack',
        a: (
          <AnswerParagraph>
            ModVF analyse votre modpack, extrait tous les fichiers de langue des mods (items, blocs, quêtes), les traduit
            automatiquement avec un moteur spécialisé gaming, puis reconstruit un resource pack Minecraft prêt à
            l&apos;emploi.
          </AnswerParagraph>
        ),
      },
      {
        id: 'k2',
        q: 'Mes fichiers sont-ils en sécurité ?',
        searchText: 'sécurité serveurs 24h stockage',
        a: (
          <AnswerParagraph>
            Oui. Vos fichiers sont traités sur des serveurs sécurisés et automatiquement supprimés après 24h. Nous ne
            stockons jamais vos modpacks.
          </AnswerParagraph>
        ),
      },
      {
        id: 'k3',
        q: 'ModVF fonctionne-t-il sur serveur Minecraft ?',
        searchText: 'serveur multijoueur client config',
        a: (
          <AnswerParagraph>
            Le resource pack est côté client, il fonctionne en solo et sur serveur sans configuration serveur. Pour les
            quêtes (dossier config/), c&apos;est le serveur qui doit avoir les fichiers traduits.
          </AnswerParagraph>
        ),
      },
    ],
  },
]

export default function FAQPage() {
  const [query, setQuery] = useState('')
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const normalizedQuery = query.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return faqCategories
    return faqCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(normalizedQuery) ||
            item.searchText.toLowerCase().includes(normalizedQuery),
        ),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [normalizedQuery])

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Foire aux questions</h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-text-muted sm:text-lg">
          Tout ce que ModVF fait et ne fait pas — avant de lancer une traduction.
        </p>
      </div>

      <div className="relative mt-10">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un mot-clé (ex. quêtes, crédits, FTB)…"
          className="w-full rounded-xl border border-white/10 bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-muted/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Rechercher dans la FAQ"
        />
      </div>

      {normalizedQuery && filteredCategories.length === 0 ? (
        <p className="mt-10 text-center text-sm text-text-muted">Aucun résultat pour « {query.trim()} ».</p>
      ) : null}

      <div className="mt-12 space-y-14">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon
          return (
            <section key={cat.id} aria-labelledby={`faq-cat-${cat.id}`}>
              <h2
                id={`faq-cat-${cat.id}`}
                className="flex items-center gap-3 font-display text-xl font-bold text-text sm:text-2xl"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                {cat.title}
              </h2>

              <div className="mt-6 space-y-2">
                {cat.items.map((item) => {
                  const isOpen = openIds.has(item.id)
                  return (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-surface">
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        aria-expanded={isOpen}
                      >
                        {item.q}
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/5 px-5 pb-5 pt-2">{item.a}</div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <p className="mt-14 text-center text-sm text-text-muted">
        Une question sans réponse ?{' '}
        <a href="mailto:contact@modvf.fr" className="font-medium text-secondary underline-offset-2 hover:underline">
          contact@modvf.fr
        </a>
      </p>
    </div>
  )
}
