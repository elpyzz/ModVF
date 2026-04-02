import AdmZip from 'adm-zip'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'

export async function repackZip(
  extractedRoot: string,
  outputPath: string,
  modpackRoot: string,
  _modifiedJarDirs: Set<string>,
): Promise<void> {
  await fsp.mkdir(path.dirname(outputPath), { recursive: true })

  const finalZip = new AdmZip()
  const modsExtractedDir = path.join(extractedRoot, 'mods_extracted')

  // === PARTIE 1 : Créer le Resource Pack ===
  const resourcePackZip = new AdmZip()

  const packMcmeta = {
    pack: {
      pack_format: 15,
      description: '§5ModVF§r - Traduction française automatique',
    },
  }
  resourcePackZip.addFile('pack.mcmeta', Buffer.from(`${JSON.stringify(packMcmeta, null, 2)}\n`, 'utf-8'))

  let modsCount = 0
  if (fs.existsSync(modsExtractedDir)) {
    const jarDirs = fs.readdirSync(modsExtractedDir).filter((d) => {
      const fullPath = path.join(modsExtractedDir, d)
      return fs.statSync(fullPath).isDirectory() && d !== '_jar_manifest.json'
    })

    for (const jarDir of jarDirs) {
      const jarPath = path.join(modsExtractedDir, jarDir)
      const langFiles = findLangFiles(jarPath)

      for (const langFile of langFiles) {
        const relativePath = path.relative(jarPath, langFile)
        const frPath = relativePath.replace(/en_us\.json$/i, 'fr_fr.json').split(path.sep).join('/')
        const content = fs.readFileSync(langFile)
        resourcePackZip.addFile(frPath, content)
        modsCount += 1
      }
    }
  }

  console.log('[REPACK] Resource pack créé avec ' + modsCount + ' mods traduits')

  const resourcePackBuffer = resourcePackZip.toBuffer()
  finalZip.addFile('ModVF_Traduction_FR.zip', resourcePackBuffer)

  // === PARTIE 2 : Fichiers config traduits (quêtes, etc.) ===
  const configDir = path.join(modpackRoot, 'config')
  if (fs.existsSync(configDir)) {
    addDirToZip(finalZip, configDir, 'config', modpackRoot)
    console.log('[REPACK] Config traduit ajouté')
  }

  // === PARTIE 3 : Instructions ===
  const instructions = `
╔══════════════════════════════════════════════════════╗
║           ModVF - Modpack traduit en français        ║
╚══════════════════════════════════════════════════════╝

Ce ZIP contient votre modpack traduit en français.

INSTALLATION (2 étapes) :

ÉTAPE 1 - Resource Pack (traduit les items, blocs, mobs, etc.)
────────────────────────────────────────────────────────
1. Ouvrez votre launcher (CurseForge, Prism, etc.)
2. Allez dans le dossier du modpack (Open Folder)
3. Copiez le fichier "ModVF_Traduction_FR.zip" dans le dossier "resourcepacks/"
4. Lancez Minecraft
5. Options → Resource Packs → Activez "ModVF - Traduction FR"
6. Options → Langue → Français (France)

ÉTAPE 2 - Quêtes (traduit les quêtes FTB, descriptions, etc.)
────────────────────────────────────────────────────────
1. Copiez le dossier "config/" de ce ZIP
2. Collez-le dans le dossier de votre modpack (remplacez les fichiers)
3. Relancez Minecraft

C'est tout ! Bon jeu en français !

Traduit par ModVF - modvf.fr
`

  finalZip.addFile('INSTRUCTIONS.txt', Buffer.from(instructions, 'utf-8'))

  finalZip.writeZip(outputPath)
  console.log('[REPACK] ZIP final créé : ' + outputPath)
}

function findLangFiles(dir: string): string[] {
  const results: string[] = []

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name.toLowerCase() === 'en_us.json' && isInsideLangFolder(fullPath)) {
        results.push(fullPath)
      }
    }
  }

  walk(dir)
  return results
}

function isInsideLangFolder(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase()
  return normalized.includes('/lang/')
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
