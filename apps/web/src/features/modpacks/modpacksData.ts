export type ModpackDifficulty = 'Débutant' | 'Intermédiaire' | 'Avancé'
export type ModpackSupportLevel = 'full' | 'partial' | 'items_only'

export interface Modpack {
  slug: string
  name: string
  shortName: string
  lines: number
  version: string
  loader: string
  status: 'verified'
  description: string
  features: string[]
  difficulty: ModpackDifficulty
  modsCount: string
  image: string
  curseforgeUrl: string
  seoTitle: string
  seoDescription: string
  keywords?: string
  screenshot?: string
  supportLevel: ModpackSupportLevel
}

export const MODPACKS: Modpack[] = [
  {
    slug: 'atm10',
    name: 'All The Mods 10',
    shortName: 'ATM10',
    lines: 211000,
    version: '1.21+',
    loader: 'NeoForge',
    status: 'verified',
    description:
      'Le modpack ultime avec plus de 400 mods. Technologie, magie, exploration, tout y est. ModVF traduit les 211 000 lignes de texte en français : items, quêtes, descriptions et enchantements.',
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Enchantements traduits'],
    difficulty: 'Intermédiaire',
    modsCount: '400+',
    image: '/screenshots/atm10.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-10',
    seoTitle: 'ATM10 en français — Traduire All The Mods 10 automatiquement | ModVF',
    seoDescription:
      'Traduisez ATM10 (All The Mods 10) en français automatiquement avec ModVF. 211 000 lignes traduites. Essai gratuit.',
    supportLevel: 'full',
  },
  {
    slug: 'better-minecraft',
    name: 'Better Minecraft',
    shortName: 'Better MC',
    lines: 41000,
    version: '1.20.1 / 1.21',
    loader: 'Forge / NeoForge',
    status: 'verified',
    description:
      "Le modpack qui améliore l'expérience vanilla avec de nouveaux biomes, donjons, mobs et items. Parfait pour les joueurs qui veulent rester proche du Minecraft classique avec du contenu en plus.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Nouveaux biomes traduits'],
    difficulty: 'Débutant',
    modsCount: '200+',
    image: '/screenshots/bettermc.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/better-mc-forge-bmc4',
    seoTitle: 'Better Minecraft en français — Traduire Better MC automatiquement | ModVF',
    seoDescription:
      'Traduisez Better Minecraft en français avec ModVF. 41 000 lignes traduites. Compatible 1.20.1 et 1.21. Essai gratuit.',
    supportLevel: 'full',
  },
  {
    slug: 'prominence-2',
    name: 'Prominence II',
    shortName: 'Prominence II',
    lines: 66000,
    version: '1.20.1',
    loader: 'Fabric',
    status: 'verified',
    description:
      "Un modpack RPG immersif avec un monde ouvert, des quêtes complexes, des donjons et un système de progression. La traduction des quêtes est essentielle pour profiter pleinement de l'aventure.",
    features: ['Items traduits', 'Quêtes traduites', 'Lore traduit', 'Descriptions traduites'],
    difficulty: 'Intermédiaire',
    modsCount: '200+',
    image: '/screenshots/prominence.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/prominence-2-rpg',
    seoTitle: 'Prominence II en français — Traduire Prominence 2 automatiquement | ModVF',
    seoDescription:
      'Traduisez Prominence II en français avec ModVF. 66 000 lignes traduites. Quêtes RPG et descriptions. Essai gratuit.',
    supportLevel: 'full',
  },
  {
    slug: 'homestead',
    name: 'Homestead',
    shortName: 'Homestead',
    lines: 49423,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "Homestead est un modpack orienté progression et construction de base avec une expérience de jeu immersive. ModVF traduit 49 423 lignes en français pour rendre les quêtes, items et descriptions bien plus lisibles.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Interfaces traduites'],
    difficulty: 'Intermédiaire',
    modsCount: '200+',
    image: '/screenshots/homestead.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/homestead',
    seoTitle: 'Homestead en français — Traduire Homestead automatiquement | ModVF',
    seoDescription:
      'Traduisez Homestead en français avec ModVF. 49 423 lignes traduites automatiquement. Essai gratuit.',
    keywords: 'Homestead français, Homestead traduction, modpack minecraft français',
    supportLevel: 'full',
  },
  {
    slug: 'better-fantasy',
    name: 'Better Fantasy',
    shortName: 'Better Fantasy',
    lines: 69742,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "Better Fantasy est un modpack axé aventure et exploration fantastique avec de nombreuses quêtes et descriptions de progression. ModVF traduit 69 742 lignes en français pour une expérience plus claire et immersive.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Interfaces traduites'],
    difficulty: 'Intermédiaire',
    modsCount: '200+',
    image: '/screenshots/better-fantasy.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/better-fantasy',
    seoTitle: 'Better Fantasy en français — Traduire Better Fantasy automatiquement | ModVF',
    seoDescription:
      'Traduisez Better Fantasy en français avec ModVF. 69 742 lignes traduites automatiquement. Essai gratuit.',
    keywords: 'Better Fantasy français, Better Fantasy traduction, modpack minecraft français',
    supportLevel: 'full',
  },
  {
    slug: 'dawncraft',
    name: 'DawnCraft',
    shortName: 'DawnCraft',
    lines: 28000,
    version: '1.18.2',
    loader: 'Forge',
    status: 'verified',
    description:
      "DawnCraft transforme Minecraft en véritable RPG avec des classes, des compétences, des quêtes narratives et des boss. Comprendre les dialogues et les quêtes en français change complètement l'expérience.",
    features: ['Items traduits', 'Quêtes narratives traduites', 'Dialogues traduits', 'Classes traduites'],
    difficulty: 'Avancé',
    modsCount: '150+',
    image: '/screenshots/dawncraft.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/dawn-craft',
    seoTitle: 'DawnCraft en français — Traduire DawnCraft automatiquement | ModVF',
    seoDescription:
      'Traduisez DawnCraft en français avec ModVF. 28 000 lignes traduites. Quêtes RPG et dialogues. Essai gratuit.',
    supportLevel: 'full',
  },
  {
    slug: 'deceasedcraft',
    name: 'DeceasedCraft',
    shortName: 'DeceasedCraft',
    lines: 45000,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      'Un modpack survival-horror qui transforme Minecraft en expérience terrifiante avec des zombies, des maladies et un système de survie réaliste. La traduction aide à comprendre les mécaniques de survie complexes.',
    features: ['Items traduits', 'Mécaniques de survie traduites', 'Descriptions traduites', 'Quêtes traduites'],
    difficulty: 'Avancé',
    modsCount: '200+',
    image: '/screenshots/deceasedcraft.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/deceasedcraft',
    seoTitle: 'DeceasedCraft en français — Traduire DeceasedCraft automatiquement | ModVF',
    seoDescription:
      'Traduisez DeceasedCraft en français avec ModVF. 45 000 lignes traduites. Survie et horreur en français. Essai gratuit.',
    supportLevel: 'full',
  },
  {
    slug: 'ftb-stoneblock-4',
    name: 'FTB StoneBlock 4',
    shortName: 'StoneBlock 4',
    lines: 82157,
    version: '1.21',
    loader: 'NeoForge',
    status: 'verified',
    description:
      "FTB StoneBlock 4 est un modpack a progression unique ou vous minez a travers la pierre. ModVF traduit tous les items, blocs, descriptions et enchantements en francais. Les quetes utilisent un format specifique incompatible avec la traduction automatique et restent en anglais.",
    features: ['Items traduits', 'Descriptions traduites', 'Enchantements traduits', 'Interfaces traduites'],
    difficulty: 'Intermédiaire',
    modsCount: '250+',
    image: '/screenshots/ftb-stoneblock4.png',
    screenshot: '/screenshots/ftb-stoneblock4.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/ftb-stoneblock-4',
    seoTitle: 'FTB StoneBlock 4 en français — Items et descriptions traduits | ModVF',
    seoDescription: 'Traduisez les items et descriptions de FTB StoneBlock 4 en français avec ModVF. 82 157 lignes traduites.',
    keywords: 'FTB StoneBlock 4 français, StoneBlock 4 traduction, modpack minecraft français',
    supportLevel: 'items_only',
  },
  {
    slug: 'dungeon-heroes',
    name: 'Dungeon Heroes',
    shortName: 'Dungeon Heroes',
    lines: 20788,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "Dungeon Heroes est un modpack axe sur l'exploration de donjons et le combat. Avec plus de 20 000 lignes de texte, les descriptions d'items, de quetes et de competences sont essentielles pour progresser. ModVF traduit automatiquement l'integralite de Dungeon Heroes en francais.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Compétences traduites'],
    difficulty: 'Intermédiaire',
    modsCount: '150+',
    image: '/screenshots/dungeon-heroes.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/dungeon-heroes',
    seoTitle: 'Dungeon Heroes en français — Traduire Dungeon Heroes automatiquement | ModVF',
    seoDescription:
      'Traduisez Dungeon Heroes en français automatiquement avec ModVF. 20 788 lignes traduites, items, quêtes et descriptions. Essai gratuit.',
    supportLevel: 'full',
  },
  {
    slug: 'minecraft-legendary',
    name: 'Minecraft Legendary',
    shortName: 'Minecraft Legendary',
    lines: 28497,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "Minecraft Legendary est un modpack complet qui combine aventure, exploration et progression. Avec plus de 28 000 lignes de texte, ModVF traduit automatiquement l'integralite du modpack en francais pour une experience de jeu fluide.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Progression traduite'],
    difficulty: 'Intermédiaire',
    modsCount: '150+',
    image: '/screenshots/minecraft-legendary.png',
    screenshot: '/screenshots/minecraft-legendary.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/minecraft-legendary',
    seoTitle: 'Minecraft Legendary en français — Traduire Minecraft Legendary | ModVF',
    seoDescription:
      'Traduisez Minecraft Legendary en français automatiquement avec ModVF. 28 497 lignes traduites. Essai gratuit.',
    keywords:
      'Minecraft Legendary français, Minecraft Legendary traduction, modpack minecraft français',
    supportLevel: 'full',
  },
  {
    slug: 'beyond-depth',
    name: 'Beyond Depth',
    shortName: 'Beyond Depth',
    lines: 41987,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "Beyond Depth est un modpack d'exploration et d'aventure en profondeur. Avec pres de 42 000 lignes de texte, les quetes, items et descriptions sont essentiels pour progresser. ModVF traduit automatiquement l'integralite de Beyond Depth en francais.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Exploration traduite'],
    difficulty: 'Intermédiaire',
    modsCount: '200+',
    image: '/screenshots/beyond-depth.png',
    screenshot: '/screenshots/beyond-depth.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/beyond-depth',
    seoTitle: 'Beyond Depth en français — Traduire Beyond Depth automatiquement | ModVF',
    seoDescription:
      'Traduisez Beyond Depth en français automatiquement avec ModVF. 41 987 lignes traduites. Essai gratuit.',
    keywords:
      'Beyond Depth français, Beyond Depth traduction, Beyond Depth modpack français, modpack minecraft français',
    supportLevel: 'full',
  },
  {
    slug: 'atm10-to-the-sky',
    name: 'ATM10 To The Sky',
    shortName: 'ATM10 Sky',
    lines: 132511,
    version: '1.21+',
    loader: 'NeoForge',
    status: 'verified',
    description:
      "ATM10 To The Sky est la version skyblock du celebre All The Mods 10. Commencez sur une ile flottante et construisez votre empire avec plus de 200 mods. ModVF traduit les 132 511 lignes de texte en francais : items, quetes, descriptions, enchantements.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Enchantements traduits'],
    difficulty: 'Intermédiaire',
    modsCount: '200+',
    image: '/screenshots/atm10-sky.png',
    screenshot: '/screenshots/atm10-sky.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-10-to-the-sky',
    seoTitle: 'ATM10 To The Sky en français — Traduire ATM10 Skyblock | ModVF',
    seoDescription:
      'Traduisez ATM10 To The Sky en français automatiquement avec ModVF. 132 511 lignes traduites. Items, quêtes et descriptions. Essai gratuit.',
    keywords:
      'ATM10 To The Sky français, ATM10 skyblock français, All The Mods 10 skyblock traduction, modpack minecraft français',
    supportLevel: 'full',
  },
  {
    slug: 'cursed-walking',
    name: 'Cursed Walking',
    shortName: 'Cursed Walking',
    lines: 24683,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "Cursed Walking est un modpack d'horreur et de survie qui transforme Minecraft en experience terrifiante. Avec plus de 24 000 lignes de texte, comprendre les quetes et descriptions est essentiel pour survivre. ModVF traduit l'integralite du modpack en francais.",
    features: ['Items traduits', 'Quêtes traduites', 'Descriptions traduites', 'Survie traduite'],
    difficulty: 'Avancé',
    modsCount: '120+',
    image: '/screenshots/cursed-walking.png',
    screenshot: '/screenshots/cursed-walking.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/cursed-walking',
    seoTitle: 'Cursed Walking en français — Traduire Cursed Walking | ModVF',
    seoDescription:
      'Traduisez Cursed Walking en français automatiquement avec ModVF. 24 683 lignes traduites. Essai gratuit.',
    keywords: 'Cursed Walking français, Cursed Walking traduction, modpack horreur minecraft français',
    supportLevel: 'full',
  },
  {
    slug: 'mc-eternal-2',
    name: 'MC Eternal 2',
    shortName: 'MC Eternal 2',
    lines: 94000,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "MC Eternal 2 est un modpack massif qui melange technologie, aventure et exploration. ModVF traduit les items, descriptions, enchantements et interfaces. Les quetes utilisent un format non supporte pour une traduction complete.",
    features: ['Items traduits', 'Descriptions traduites', 'Enchantements traduits', 'Interfaces traduites'],
    difficulty: 'Intermédiaire',
    modsCount: '300+',
    image: '/screenshots/mc-eternal-2.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/mc-eternal-2',
    seoTitle: 'MC Eternal 2 en français — Items et descriptions traduits | ModVF',
    seoDescription:
      'Traduisez MC Eternal 2 en français avec ModVF. 94 000 lignes traduites pour les items, descriptions et interfaces.',
    supportLevel: 'items_only',
  },
  {
    slug: 'vault-hunters',
    name: 'Vault Hunters',
    shortName: 'Vault Hunters',
    lines: 31000,
    version: '1.20.1',
    loader: 'Forge',
    status: 'verified',
    description:
      "Vault Hunters propose une progression unique basee sur les vaults. ModVF traduit les items, descriptions, enchantements et une large partie des interfaces. Certaines zones restent en anglais car elles sont codees directement en Java.",
    features: ['Items traduits', 'Descriptions traduites', 'Enchantements traduits', 'Interfaces traduites'],
    difficulty: 'Avancé',
    modsCount: '180+',
    image: '/screenshots/vault-hunters.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/vault-hunters-1-18-2',
    seoTitle: 'Vault Hunters en français — Items et descriptions traduits | ModVF',
    seoDescription:
      'Traduisez Vault Hunters en français avec ModVF. 31 000 lignes traduites pour les items, descriptions et interfaces.',
    supportLevel: 'items_only',
  },
]

export const DEFAULT_MODPACKS_SEO = {
  title: 'Modpacks Minecraft traduits en français | ModVF — Liste complète',
  description:
    'Découvrez tous les modpacks Minecraft traduits et validés par ModVF. ATM10, Better MC, Prominence II, DawnCraft, DeceasedCraft et plus. Essai gratuit.',
  keywords:
    'modpack minecraft français, traduction modpack, ATM10 français, Better MC français, DawnCraft français, Prominence II français, DeceasedCraft français',
}

export function formatLines(lines: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(lines)} lignes`
}
