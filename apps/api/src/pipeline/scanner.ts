import fs from 'node:fs/promises'
import path from 'node:path'

const CANDIDATE_EXTS = new Set(['.json', '.lang', '.properties', '.cfg'])

export async function scanTranslatableFiles(rootDir: string) {
  const translatableFiles: string[] = []
  let totalFiles = 0

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      totalFiles += 1
      const ext = path.extname(entry.name).toLowerCase()
      if (!CANDIDATE_EXTS.has(ext)) continue
      if (ext === '.json') {
        const inLangFolder = full.toLowerCase().includes(`${path.sep}lang${path.sep}`)
        if (inLangFolder) translatableFiles.push(full)
        continue
      }
      translatableFiles.push(full)
    }
  }

  await walk(rootDir)
  return { translatableFiles, totalFiles }
}
