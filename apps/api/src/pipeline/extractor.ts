import fs from 'node:fs/promises'
import path from 'node:path'
// @ts-ignore - provided by runtime dependency
import unzipper from 'unzipper'

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

async function extractArchiveToDir(archivePath: string, outputDir: string): Promise<void> {
  const directory = await unzipper.Open.file(archivePath)
  for (const entry of directory.files) {
    const normalizedEntryPath = path.normalize(entry.path).replace(/^([/\\])+/, '')
    if (!normalizedEntryPath) continue
    const destination = path.join(outputDir, normalizedEntryPath)
    if (entry.type === 'Directory') {
      await fs.mkdir(destination, { recursive: true })
      continue
    }
    await fs.mkdir(path.dirname(destination), { recursive: true })
    const content = await entry.buffer()
    await fs.writeFile(destination, content)
  }
}

export async function extractZip(zipPath: string, outputDir: string): Promise<ExtractionResult> {
  await fs.mkdir(outputDir, { recursive: true })
  await extractArchiveToDir(zipPath, outputDir)

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
      const jarZip = await unzipper.Open.file(absoluteJarPath)
      const entries = jarZip.files
      let langFilesFound = 0

      for (const entry of entries) {
        if (entry.type === 'Directory') continue
        const norm = entry.path.replace(/\\/g, '/')
        const langMatch = norm.match(/^assets\/([^/]+)\/lang\/en_[uU][sS]\.(json|lang)$/i)
        if (!langMatch) continue
        const namespace = langMatch[1]
        const ext = langMatch[2].toLowerCase()

        const outDir = path.join(modsExtractedRoot, extractedDirName, 'assets', namespace, 'lang')
        await fs.mkdir(outDir, { recursive: true })
        const destName = ext === 'json' ? 'en_us.json' : 'en_us.lang'
        const destPath = path.join(outDir, destName)
        const data = await entry.buffer()
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

export async function extractJar(jarPath: string, outputDir: string): Promise<ExtractionResult> {
  await fs.mkdir(outputDir, { recursive: true })

  const modsExtractedRoot = path.join(outputDir, 'mods_extracted')
  await fs.mkdir(modsExtractedRoot, { recursive: true })

  const jarName = path.basename(jarPath)
  const extractedDirName = `0000-${jarName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const jarLangFiles: string[] = []
  const jarExtractedLangPaths: string[] = []
  const jarReports: JarExtractionReport[] = []

  try {
    const jarZip = await unzipper.Open.file(jarPath)
    const entries = jarZip.files
    let langFilesFound = 0

    for (const entry of entries) {
      if (entry.type === 'Directory') continue
      const norm = entry.path.replace(/\\/g, '/')
      const langMatch = norm.match(/^assets\/([^/]+)\/lang\/en_[uU][sS]\.(json|lang)$/i)
      if (!langMatch) continue
      const namespace = langMatch[1]
      const ext = langMatch[2].toLowerCase()
      const outDir = path.join(modsExtractedRoot, extractedDirName, 'assets', namespace, 'lang')
      await fs.mkdir(outDir, { recursive: true })
      const destName = ext === 'json' ? 'en_us.json' : 'en_us.lang'
      const destPath = path.join(outDir, destName)
      await fs.writeFile(destPath, await entry.buffer())
      langFilesFound += 1
      jarLangFiles.push(`${jarName}:${norm}`)
      jarExtractedLangPaths.push(destPath)
    }

    jarReports.push({ jarPath: jarName, langFilesFound })
    if (langFilesFound > 0) {
      await fs.writeFile(
        path.join(modsExtractedRoot, JAR_MANIFEST_FILE),
        JSON.stringify([{ relativeJarPath: jarName, extractedDirName }], null, 2),
        'utf-8',
      )
    } else {
      await fs.writeFile(path.join(modsExtractedRoot, JAR_MANIFEST_FILE), '[]', 'utf-8')
    }
  } catch (err) {
    console.error('[EXTRACT] Erreur JAR:', jarName, err instanceof Error ? err.message : err)
    jarReports.push({ jarPath: jarName, langFilesFound: 0 })
    await fs.writeFile(path.join(modsExtractedRoot, JAR_MANIFEST_FILE), '[]', 'utf-8')
  }

  return {
    extractedRoot: outputDir,
    modpackRoot: outputDir,
    jarFiles: [jarPath],
    jarLangFiles,
    jarReports,
    jarExtractedLangPaths,
  }
}
