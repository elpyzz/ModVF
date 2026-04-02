import fs from 'node:fs/promises'
import path from 'node:path'
import AdmZip from 'adm-zip'

export type JarExtractionManifestItem = {
  relativeJarPath: string
  extractedDirName: string
}

export const JAR_MANIFEST_FILE = '_jar_manifest.json'

export type JarExtractionReport = {
  jarPath: string
  langFilesFound: number
}

export type ExtractionResult = {
  extractedRoot: string
  modpackRoot: string
  jarFiles: string[]
  jarLangFiles: string[]
  jarReports: JarExtractionReport[]
  /** Chemins absolus des en_us.json extraits depuis les JAR (sous mods_extracted/.../assets/.../lang/) */
  jarExtractedLangPaths: string[]
}

function isSkippableRootFolder(name: string): boolean {
  const n = name.toLowerCase()
  return n === '__macosx'
}

async function findAllJarFiles(root: string): Promise<string[]> {
  const out: string[] = []
  const stack = [root]
  while (stack.length > 0) {
    const current = stack.pop()!
    const entries = await fs.readdir(current, { withFileTypes: true }).catch(() => [])
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
        continue
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.jar')) out.push(full)
    }
  }
  return out
}

export async function extractZip(zipPath: string, outputDir: string): Promise<ExtractionResult> {
  await fs.mkdir(outputDir, { recursive: true })
  const zip = new AdmZip(zipPath)
  zip.extractAllTo(outputDir, true)

  const rootEntries = await fs.readdir(outputDir, { withFileTypes: true }).catch(() => [])
  const rootDirs = rootEntries.filter((e) => e.isDirectory() && !isSkippableRootFolder(e.name))
  const rootFiles = rootEntries.filter((e) => e.isFile())
  const modpackRoot = rootDirs.length === 1 && rootFiles.length === 0 ? path.join(outputDir, rootDirs[0].name) : outputDir

  const modsExtractedRoot = path.join(outputDir, 'mods_extracted')
  const manifest: JarExtractionManifestItem[] = []
  const jarLangFiles: string[] = []
  const jarExtractedLangPaths: string[] = []
  const jarReports: JarExtractionReport[] = []

  await fs.mkdir(modsExtractedRoot, { recursive: true })
  const jarFiles = await findAllJarFiles(modpackRoot)

  let extractedCount = 0
  for (let i = 0; i < jarFiles.length; i += 1) {
    const absoluteJarPath = jarFiles[i]
    const relativeJarPath = path.relative(outputDir, absoluteJarPath)
    const jarName = path.basename(absoluteJarPath)
    const extractedDirName = `${String(i).padStart(4, '0')}-${jarName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const targetDir = path.join(modsExtractedRoot, extractedDirName)

    try {
      const jarZip = new AdmZip(absoluteJarPath)
      const jarEntriesList = jarZip.getEntries()
      const langEntries = jarEntriesList.filter((z) =>
        /assets\/[^/]+\/lang\/en_us\.json$/i.test(z.entryName.replace(/\\/g, '/')),
      )
      jarReports.push({ jarPath: relativeJarPath.replace(/\\/g, '/'), langFilesFound: langEntries.length })
      if (langEntries.length === 0) continue

      await fs.mkdir(targetDir, { recursive: true })
      jarZip.extractAllTo(targetDir, true)
      manifest.push({ relativeJarPath, extractedDirName })
      extractedCount += 1
      for (const entry of langEntries) {
        const rel = entry.entryName.replace(/\\/g, '/')
        jarLangFiles.push(`${relativeJarPath.replace(/\\/g, '/')}:${rel}`)
        const destPath = path.normalize(path.join(targetDir, ...rel.split('/')))
        jarExtractedLangPaths.push(destPath)
      }
    } catch (error) {
      console.warn(`JAR corrompu ignore: ${jarName}`, error instanceof Error ? error.message : error)
    }
  }

  await fs.writeFile(path.join(modsExtractedRoot, JAR_MANIFEST_FILE), JSON.stringify(manifest, null, 2), 'utf-8')

  return {
    extractedRoot: outputDir,
    modpackRoot,
    jarFiles,
    jarLangFiles,
    jarReports,
    jarExtractedLangPaths,
  }
}
