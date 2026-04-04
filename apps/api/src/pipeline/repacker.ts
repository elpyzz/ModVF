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
  meta: { jobId: string; userId: string },
): Promise<void> {
  await fsp.mkdir(path.dirname(outputPath), { recursive: true })

  const finalZip = new AdmZip()
  const modsExtractedDir = path.join(extractedRoot, 'mods_extracted')
  const resourcePackPath = path.join(path.dirname(outputPath), `modvf-resourcepack-${Date.now()}.zip`)

  // === PARTIE 1 : Créer le Resource Pack (fichiers sur disque, pas tout en RAM) ===
  const langEntries = listLangEntries(modsExtractedDir)
  const packFormat = detectPackFormat(modpackRoot)
  await createResourcePackFromPaths(langEntries, resourcePackPath, packFormat)
  for (const { absPath } of langEntries) {
    await fsp.rm(absPath, { force: true }).catch(() => {})
  }
  finalZip.addFile('ModVF_Traduction_FR.zip', await fsp.readFile(resourcePackPath))
  console.log('[REPACK] Resource pack créé avec ' + langEntries.length + ' mods traduits')

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
`

  finalZip.addFile('INSTRUCTIONS.txt', Buffer.from(instructions, 'utf-8'))

  finalZip.writeZip(outputPath)
  await fsp.rm(resourcePackPath, { force: true })
  console.log('[REPACK] ZIP final créé : ' + outputPath)
}

/** Chemins absolus des en_us.json traduits ; en cas de doublon de namespace, le dernier gagne (comme avant). */
function listLangEntries(modsExtractedDir: string): { modId: string; absPath: string }[] {
  const byMod = new Map<string, string>()
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
        byMod.set(match[1], fullPath)
      }
    }
  }

  walk(modsExtractedDir)
  return [...byMod.entries()].map(([modId, absPath]) => ({ modId, absPath }))
}

function detectPackFormat(modpackRoot: string): number {
  const packMcmeta = path.join(modpackRoot, 'pack.mcmeta')
  if (fs.existsSync(packMcmeta)) {
    try {
      const content = JSON.parse(fs.readFileSync(packMcmeta, 'utf8')) as { pack?: { pack_format?: number } }
      if (typeof content.pack?.pack_format === 'number' && Number.isFinite(content.pack.pack_format)) {
        return content.pack.pack_format
      }
    } catch {
      /* ignore */
    }
  }

  const modsDir = path.join(modpackRoot, 'mods')
  if (fs.existsSync(modsDir)) {
    const jars = fs.readdirSync(modsDir).filter((f) => f.toLowerCase().endsWith('.jar'))
    let best: { minor: number; patch: number } | null = null
    const re = /\b1\.(\d+)(?:\.(\d+))?/g
    for (const name of jars) {
      let m: RegExpExecArray | null
      re.lastIndex = 0
      while ((m = re.exec(name)) !== null) {
        const minor = parseInt(m[1], 10)
        const patch = m[2] !== undefined ? parseInt(m[2], 10) : 0
        if (!best || minor > best.minor || (minor === best.minor && patch > best.patch)) {
          best = { minor, patch }
        }
      }
    }
    if (best) {
      const fromJar = mcVersionToPackFormat(best.minor, best.patch)
      if (fromJar !== null) return fromJar
    }
  }

  return 34
}

function mcVersionToPackFormat(minor: number, patch: number): number | null {
  if (minor >= 21) return 34
  if (minor === 20) {
    if (patch >= 5) return 32
    if (patch >= 3) return 22
    if (patch >= 2) return 18
    return 15
  }
  if (minor === 19) return patch >= 4 ? 13 : 12
  if (minor === 18) return 9
  if (minor === 17) return 7
  if (minor === 16) return 6
  return null
}

async function createResourcePackFromPaths(
  entries: { modId: string; absPath: string }[],
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

    for (const { modId, absPath } of entries) {
      archive.file(absPath, { name: `assets/${modId}/lang/en_us.json` })
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
