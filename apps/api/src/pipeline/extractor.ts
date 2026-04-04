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

  for (let i = 0; i < jarFiles.length; i += 1) {
    const absoluteJarPath = jarFiles[i]
    const relativeJarPath = path.relative(outputDir, absoluteJarPath)
    const jarName = path.basename(absoluteJarPath)
    const extractedDirName = `${String(i).padStart(4, '0')}-${jarName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    try {
      const jarZip = new AdmZip(absoluteJarPath)
      const entries = jarZip.getEntries()
      let langFilesFound = 0

      for (const entry of entries) {
        if (entry.entryName.endsWith('/')) continue
        const norm = entry.entryName.replace(/\\/g, '/')
        if (!/^assets\/[^/]+\/lang\/en_us\.json$/i.test(norm)) continue
        const modIdMatch = norm.match(/^assets\/([^/]+)\//)
        if (!modIdMatch) continue

        const outDir = path.join(modsExtractedRoot, extractedDirName, 'assets', modIdMatch[1], 'lang')
        await fs.mkdir(outDir, { recursive: true })
        const destPath = path.join(outDir, 'en_us.json')
        const data = entry.getData()
        await fs.writeFile(destPath, data)

        langFilesFound += 1
        jarLangFiles.push(`${relativeJarPath.replace(/\\/g, '/')}:${norm}`)
        jarExtractedLangPaths.push(destPath)
      }

      jarReports.push({ jarPath: relativeJarPath.replace(/\\/g, '/'), langFilesFound })
      if (langFilesFound > 0) {
        manifest.push({ relativeJarPath, extractedDirName })
      }
    } catch (err) {
      console.error('[EXTRACT] Erreur JAR:', path.basename(absoluteJarPath), err instanceof Error ? err.message : err)
      jarReports.push({ jarPath: relativeJarPath.replace(/\\/g, '/'), langFilesFound: 0 })
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
