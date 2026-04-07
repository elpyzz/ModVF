import AdmZip from 'adm-zip'
import archiver from 'archiver'
import fs, { createWriteStream } from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

export async function repackZip(
  extractedRoot: string,
  outputPath: string,
  modpackRoot: string,
  _modifiedJarDirs: Set<string>,
  meta: { jobId: string; userId: string; type?: 'mod' | 'modpack' },
): Promise<void> {
  await fsp.mkdir(path.dirname(outputPath), { recursive: true })

  const modsExtractedDir = path.join(extractedRoot, 'mods_extracted')
  const modsDir = path.join(modpackRoot, 'mods')
  const resourcePackPath = path.join(path.dirname(outputPath), `modvf-resourcepack-${Date.now()}.zip`)
  const isModOnly = meta.type === 'mod'

  const packFormat = detectPackFormat(extractedRoot, modsDir)
  console.log('[REPACK] Using pack_format:', packFormat)

  // === PARTIE 1 : Créer le Resource Pack (fichiers sur disque, pas tout en RAM) ===
  console.log('[REPACK] Looking for lang files in:', modsExtractedDir)
  if (fs.existsSync(modsExtractedDir)) {
    console.log('[REPACK] Found directories:', fs.readdirSync(modsExtractedDir))
  } else {
    console.log('[REPACK] Found directories:', [])
  }
  const langEntries = listLangEntries(modsExtractedDir)
  console.log('[REPACK] Files added to resource pack:', langEntries.length)
  const resourcePackOutput = isModOnly ? outputPath : resourcePackPath
  await createResourcePackFromPaths(langEntries, resourcePackOutput, packFormat)
  for (const { absPath } of langEntries) {
    await fsp.rm(absPath, { force: true }).catch(() => {})
  }
  console.log('[REPACK] Resource pack créé avec ' + langEntries.length + ' fichier(s) lang')
  if (isModOnly) {
    console.log('[REPACK] ZIP final créé : ' + outputPath)
    return
  }

  const finalZip = new AdmZip()
  finalZip.addFile('ModVF_Traduction_FR.zip', await fsp.readFile(resourcePackPath))

  // === PARTIE 2 : Fichiers config traduits (quêtes, etc.) ===
  const configDir = path.join(modpackRoot, 'config')
  if (fs.existsSync(configDir)) {
    addDirToZip(finalZip, configDir, 'config', modpackRoot)
    console.log('[REPACK] Config traduit ajouté')
  }

  // === PARTIE 3 : Licence + instructions ===
  const licenseContent = JSON.stringify(
    {
      service: 'ModVF',
      website: 'https://modvf.fr',
      license_id: meta.jobId,
      user_hash: meta.userId.slice(0, 8),
      generated_at: new Date().toISOString(),
      warning: 'Ce fichier est sous licence personnelle. La redistribution est interdite.',
      terms: 'https://modvf.fr/cgv',
    },
    null,
    2,
  )
  finalZip.addFile('LICENCE_MODVF.json', Buffer.from(licenseContent, 'utf-8'))

  const instructions = `═══════════════════════════════════════════════
ModVF - Modpack traduit en français
═══════════════════════════════════════════════
INSTALLATION :

RESOURCE PACK (traduit items, blocs, mobs)

Copiez "ModVF_Traduction_FR.zip" dans le dossier "resourcepacks/" de votre modpack
Dans Minecraft : Options > Resource Packs > Activez "ModVF - Traduction FR"


ÉTAPE 2 - Quêtes (traduit les quêtes FTB, descriptions, etc.)
────────────────────────────────────────────────────────
1. Ouvrez le dossier de votre modpack (via votre launcher)
2. Supprimez le dossier config/ existant dans votre modpack
3. Copiez le dossier config/ de ce ZIP dans votre modpack
   ⚠️ IMPORTANT : Ne glissez PAS le dossier config/ SUR le dossier config/ existant,
   cela le mettrait à l'intérieur au lieu de le remplacer.
   Faites : Supprimer l'ancien → Coller le nouveau.
   Ou bien : Ctrl+C sur le config/ traduit → allez dans le dossier du modpack → Ctrl+V → Remplacer.
4. Relancez Minecraft


⚠️ IMPORTANT : Ce modpack traduit est lié à votre compte ModVF.
La redistribution, le partage ou la revente est strictement interdit
et constitue une violation de nos conditions d'utilisation.
Chaque fichier contient un identifiant unique permettant de tracer son origine.


Traduit par ModVF - modvf.fr

⚠️ NOTE IMPORTANTE :
Certains mods utilisent des textes codés directement en Java qui ne peuvent pas être traduits par un resource pack.
Si vous voyez des items ou menus en anglais malgré la traduction, c'est que le mod en question
ne supporte pas la traduction externe. Cela concerne une minorité de mods (ex: Vault Hunters).
La grande majorité des mods populaires sont entièrement traduits.
`

  finalZip.addFile('INSTRUCTIONS.txt', Buffer.from(instructions, 'utf-8'))

  finalZip.writeZip(outputPath)
  await fsp.rm(resourcePackPath, { force: true })
  console.log('[REPACK] ZIP final créé : ' + outputPath)
}

/** Fichiers lang traduits (en_us.json et/ou en_us.lang) ; doublon par (modId + extension) : dernier gagne. */
function listLangEntries(modsExtractedDir: string): { modId: string; absPath: string; langExt: 'json' | 'lang' }[] {
  const byKey = new Map<string, { modId: string; absPath: string; langExt: 'json' | 'lang' }>()
  if (!fs.existsSync(modsExtractedDir)) return []

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name.toLowerCase() === 'en_us.json') {
        const normalized = fullPath.replace(/\\/g, '/')
        const match = normalized.match(/assets\/([^/]+)\/lang\/en_us\.json$/i)
        if (!match?.[1]) continue
        const modId = match[1]
        byKey.set(`${modId}|json`, { modId, absPath: fullPath, langExt: 'json' })
      } else if (/^en_[uU][sS]\.lang$/i.test(entry.name)) {
        const normalized = fullPath.replace(/\\/g, '/')
        const match = normalized.match(/assets\/([^/]+)\/lang\/en_[uU][sS]\.lang$/i)
        if (!match?.[1]) continue
        const modId = match[1]
        byKey.set(`${modId}|lang`, { modId, absPath: fullPath, langExt: 'lang' })
      }
    }
  }

  walk(modsExtractedDir)
  return [...byKey.values()]
}

const MC_PACK_FORMAT: Record<string, number> = {
  '1.6': 1,
  '1.7': 1,
  '1.8': 1,
  '1.9': 2,
  '1.10': 2,
  '1.11': 3,
  '1.12': 3,
  '1.13': 4,
  '1.14': 4,
  '1.15': 5,
  '1.16': 5,
  '1.16.1': 5,
  '1.16.2': 6,
  '1.16.3': 6,
  '1.16.4': 6,
  '1.16.5': 6,
  '1.17': 7,
  '1.17.1': 7,
  '1.18': 8,
  '1.18.1': 8,
  '1.18.2': 8,
  '1.19': 9,
  '1.19.1': 9,
  '1.19.2': 9,
  '1.19.3': 12,
  '1.19.4': 13,
  '1.20': 15,
  '1.20.1': 15,
  '1.20.2': 18,
  '1.20.3': 22,
  '1.20.4': 22,
  '1.20.5': 32,
  '1.20.6': 32,
  '1.21': 34,
  '1.21.1': 34,
  '1.21.2': 42,
  '1.21.3': 42,
  '1.21.4': 46,
}

function mcVersionToPackFormat(version: string): number | null {
  if (MC_PACK_FORMAT[version] !== undefined) return MC_PACK_FORMAT[version]
  const parts = version.split('.')
  if (parts.length === 3) {
    const minor = parts[0] + '.' + parts[1]
    if (MC_PACK_FORMAT[minor] !== undefined) return MC_PACK_FORMAT[minor]
  }
  return null
}

function detectMinecraftVersion(extractedDir: string): { version: string; source: 'metadata' | 'mods.toml' } | null {
  const candidates = ['minecraftinstance.json', 'instance.json', 'manifest.json', 'modrinth.index.json', 'pack.toml']
  for (const file of candidates) {
    const filePath = path.join(extractedDir, file)
    if (!fs.existsSync(filePath)) continue
    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      if (file.endsWith('.json')) {
        const data = JSON.parse(raw) as Record<string, unknown>
        const maybeMinecraft = data.minecraft as { version?: unknown } | undefined
        if (maybeMinecraft?.version && typeof maybeMinecraft.version === 'string') return { version: maybeMinecraft.version, source: 'metadata' }

        const maybeDependencies = data.dependencies as { minecraft?: unknown } | undefined
        if (maybeDependencies?.minecraft && typeof maybeDependencies.minecraft === 'string')
          return { version: maybeDependencies.minecraft, source: 'metadata' }

        const gameVersion = data.gameVersion
        if (typeof gameVersion === 'string') return { version: gameVersion, source: 'metadata' }

        const mcVersion = data.mc_version
        if (typeof mcVersion === 'string') return { version: mcVersion, source: 'metadata' }
      }
      if (file === 'pack.toml') {
        const match = raw.match(/minecraft\s*=\s*\"([^\"]+)\"/)
        if (match?.[1]) return { version: match[1], source: 'metadata' }
      }
    } catch {
      /* ignore */
    }
  }

  // Try to detect from forge/neoforge version files inside mods
  if (fs.existsSync(path.join(extractedDir, 'mods'))) {
    const jars = fs.readdirSync(path.join(extractedDir, 'mods')).filter((f) => f.toLowerCase().endsWith('.jar'))
    for (const jar of jars.slice(0, 10)) {
      try {
        const zip = new AdmZip(path.join(extractedDir, 'mods', jar))
        // Check META-INF/mods.toml for Forge mods
        const modsToml = zip.getEntry('META-INF/mods.toml')
        if (modsToml) {
          const content = modsToml.getData().toString('utf8')
          // Look for minecraft version dependency like versionRange="[1.18.2,1.19)"
          const match = content.match(/modId\s*=\s*"minecraft"[\s\S]*?versionRange\s*=\s*"\[(\d+\.\d+(?:\.\d+)?)/)
          if (match) {
            return { version: match[1], source: 'mods.toml' }
          }
        }
      } catch {
        /* ignore */
      }
    }
  }
  return null
}

function packFormatToMcVersion(packFormat: number): string | null {
  for (const [version, format] of Object.entries(MC_PACK_FORMAT)) {
    if (format === packFormat) return version
  }
  return null
}

function detectPackFormat(extractedDir: string, modsDir: string): number {
  const detection = detectMinecraftVersion(extractedDir)
  if (detection) {
    const format = mcVersionToPackFormat(detection.version)
    if (format !== null) {
      console.log(`[REPACK] MC version ${detection.version} → pack_format ${format} (source: ${detection.source})`)
      return format
    }
  }

  if (fs.existsSync(modsDir)) {
    const jars = fs.readdirSync(modsDir).filter((f) => f.toLowerCase().endsWith('.jar'))
    const formatCounts = new Map<number, number>()
    for (const jar of jars.slice(0, 20)) {
      try {
        const zip = new AdmZip(path.join(modsDir, jar))
        const packMcmeta = zip.getEntry('pack.mcmeta')
        if (packMcmeta && !packMcmeta.isDirectory) {
          const content = JSON.parse(packMcmeta.getData().toString('utf8')) as { pack?: { pack_format?: number } }
          if (typeof content.pack?.pack_format === 'number' && Number.isFinite(content.pack.pack_format)) {
            formatCounts.set(content.pack.pack_format, (formatCounts.get(content.pack.pack_format) || 0) + 1)
          }
        }
      } catch {
        /* ignore */
      }
    }
    if (formatCounts.size > 0) {
      const best = [...formatCounts.entries()].sort((a, b) => b[1] - a[1])[0]
      const inferredVersion = packFormatToMcVersion(best[0]) ?? 'unknown'
      console.log(`[REPACK] MC version ${inferredVersion} → pack_format ${best[0]} (source: jar-fallback)`)
      return best[0]
    }
  }

  console.log('[REPACK] No pack_format detected, defaulting to 15')
  return 15
}

async function createResourcePackFromPaths(
  entries: { modId: string; absPath: string; langExt: 'json' | 'lang' }[],
  outputPath: string,
  packFormat: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve())
    archive.on('error', reject)
    archive.pipe(output)

    archive.append(
      JSON.stringify(
        {
          pack: { pack_format: packFormat, description: 'ModVF - Traduction FR' },
        },
        null,
        2,
      ),
      { name: 'pack.mcmeta' },
    )

    for (const { modId, absPath, langExt } of entries) {
      const zipName = langExt === 'json' ? 'en_us.json' : 'en_us.lang'
      archive.file(absPath, { name: `assets/${modId}/lang/${zipName}` })
    }

    void archive.finalize()
  })
}

function addDirToZip(zip: AdmZip, dirPath: string, _zipPrefix: string, basePath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const relativePath = path.relative(basePath, fullPath).split(path.sep).join('/')
    if (entry.isDirectory()) {
      addDirToZip(zip, fullPath, _zipPrefix, basePath)
    } else {
      zip.addFile(relativePath, fs.readFileSync(fullPath))
    }
  }
}
