export type ModpackDifficulty = 'Débutant' | 'Intermédiaire' | 'Avancé'

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
  },
  {
    slug: 'dawncraft',
    name: 'DawnCraft',
    shortName: 'DawnCraft',
    lines: 28000,
    version: '1.20.1',
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
  },
  {
    slug: 'ftb-stoneblock-4',
    name: 'FTB StoneBlock 4',
    shortName: 'StoneBlock 4',
    lines: 52000,
    version: '1.21+',
    loader: 'NeoForge',
    status: 'verified',
    description:
      'Le célèbre modpack skyblock inversé où vous commencez enfermé dans la pierre. Technologie, automatisation et progression : tout est traduit en français pour une meilleure compréhension des recettes et quêtes.',
    features: ['Items traduits', 'Quêtes traduites', 'Recettes traduites', 'Descriptions traduites'],
    difficulty: 'Intermédiaire',
    modsCount: '250+',
    image: '/screenshots/stoneblock4.png',
    curseforgeUrl: 'https://www.curseforge.com/minecraft/modpacks/ftb-stoneblock-4',
    seoTitle: 'FTB StoneBlock 4 en français — Traduire StoneBlock 4 automatiquement | ModVF',
    seoDescription: 'Traduisez FTB StoneBlock 4 en français avec ModVF. 52 000 lignes traduites. Essai gratuit.',
  },
]

export const DEFAULT_MODPACKS_SEO = {
  title: 'Modpacks Minecraft traduits en français | ModVF — Liste complète',
  description:
    'Découvrez tous les modpacks Minecraft traduits et validés par ModVF. ATM10, Better MC, Prominence II, DawnCraft, DeceasedCraft, FTB Stoneblock 4 et plus. Essai gratuit.',
  keywords:
    'modpack minecraft français, traduction modpack, ATM10 français, Better MC français, DawnCraft français, Prominence II français, DeceasedCraft français, FTB Stoneblock 4 français',
}

export function formatLines(lines: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(lines)} lignes`
}
