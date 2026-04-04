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

  // === PARTIE 1 : Créer le Resource Pack ===
  const langFiles = collectTranslatedLangFiles(modsExtractedDir)
  await createResourcePack(langFiles, resourcePackPath)
  finalZip.addFile('ModVF_Traduction_FR.zip', await fsp.readFile(resourcePackPath))
  console.log('[REPACK] Resource pack créé avec ' + langFiles.size + ' mods traduits')

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


QUETES (traduit les quêtes FTB)

Copiez le dossier "config/" dans votre modpack (remplacez les fichiers)
Relancez Minecraft


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

function collectTranslatedLangFiles(modsExtractedDir: string): Map<string, Buffer> {
  const langFiles = new Map<string, Buffer>()
  if (!fs.existsSync(modsExtractedDir)) return langFiles

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
        langFiles.set(match[1], fs.readFileSync(fullPath))
      }
    }
  }

  walk(modsExtractedDir)
  return langFiles
}

async function createResourcePack(langFiles: Map<string, Buffer>, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve())
    archive.on('error', reject)
    archive.pipe(output)

    archive.append(
      JSON.stringify(
        {
          pack: { pack_format: 15, description: 'ModVF - Traduction FR' },
        },
        null,
        2,
      ),
      { name: 'pack.mcmeta' },
    )

    for (const [modId, content] of langFiles) {
      archive.append(content, { name: `assets/${modId}/lang/en_us.json` })
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
