import AdmZip from 'adm-zip'
import fs from 'node:fs/promises'
import path from 'node:path'
import { JAR_MANIFEST_FILE, type JarExtractionManifestItem } from './extractor.js'

async function repackModifiedJars(extractedDir: string, modifiedJarDirs: Set<string>) {
  const modsExtractedRoot = path.join(extractedDir, 'mods_extracted')
  const manifestPath = path.join(modsExtractedRoot, JAR_MANIFEST_FILE)
  const raw = await fs.readFile(manifestPath, 'utf-8').catch(() => '')
  if (!raw) return

  const manifest = JSON.parse(raw) as JarExtractionManifestItem[]
  for (const item of manifest) {
    if (!modifiedJarDirs.has(item.extractedDirName)) continue
    const jarSourceDir = path.join(modsExtractedRoot, item.extractedDirName)
    const jarTargetPath = path.join(extractedDir, item.relativeJarPath)
    const jarZip = new AdmZip()
    jarZip.addLocalFolder(jarSourceDir)
    await fs.mkdir(path.dirname(jarTargetPath), { recursive: true })
    jarZip.writeZip(jarTargetPath)
  }
}

export async function repackZip(extractedDir: string, outZipPath: string, modifiedJarDirs: Set<string> = new Set()) {
  await repackModifiedJars(extractedDir, modifiedJarDirs)
  await fs.mkdir(path.dirname(outZipPath), { recursive: true })
  const zip = new AdmZip()
  zip.addLocalFolder(extractedDir)
  zip.writeZip(outZipPath)
  await fs.rm(path.join(extractedDir, 'mods_extracted'), { recursive: true, force: true })
  return outZipPath
}
