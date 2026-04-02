import fs from 'node:fs/promises'
import path from 'node:path'

/** MVP strict : uniquement les formats cœur modpack / mods. */
export type ScannedFormat = 'json-lang' | 'snbt' | 'json-quest' | 'json-patchouli' | 'json-advancement'

export interface ScannedFile {
  path: string
  format: ScannedFormat
  priority: 1 | 2 | 3
}

export async function scanTranslatableFiles(rootDir: string | string[]) {
  const roots = (Array.isArray(rootDir) ? rootDir : [rootDir]).filter(Boolean)
  const scannedFiles: ScannedFile[] = []
  const seenNormalizedPaths = new Set<string>()
  let totalFiles = 0

  async function detectFormat(full: string): Promise<ScannedFile | null> {
    const normalized = full.replace(/\\/g, '/').toLowerCase()
    const ext = path.extname(full).toLowerCase()

    // 1. json-lang : uniquement en_us.json (insensible à la casse du chemin)
    if (ext === '.json' && normalized.endsWith('/lang/en_us.json')) {
      return { path: full, format: 'json-lang', priority: 1 }
    }

    // 2. snbt : uniquement sous config/ftbquests/
    if (ext === '.snbt' && normalized.includes('/config/ftbquests/')) {
      return { path: full, format: 'snbt', priority: 1 }
    }

    // 3. json-quest : JSON sous config/betterquesting/ ou config/hqm/
    if (
      ext === '.json' &&
      (normalized.includes('/config/betterquesting/') || normalized.includes('/config/hqm/'))
    ) {
      return { path: full, format: 'json-quest', priority: 1 }
    }

    // 4. json-patchouli
    if (ext === '.json' && normalized.includes('patchouli_books')) {
      return { path: full, format: 'json-patchouli', priority: 2 }
    }

    // 5. json-advancement : JSON sous .../advancements/ avec clé "display"
    if (ext === '.json' && normalized.includes('/advancements/')) {
      try {
        const raw = await fs.readFile(full, 'utf-8')
        const parsed = JSON.parse(raw) as Record<string, unknown>
        if (parsed && typeof parsed === 'object' && 'display' in parsed) {
          return { path: full, format: 'json-advancement', priority: 2 }
        }
      } catch {
        return null
      }
      return null
    }

    return null
  }

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      totalFiles += 1
      const detected = await detectFormat(full)
      if (!detected) continue
      const key = path.normalize(full)
      if (seenNormalizedPaths.has(key)) continue
      seenNormalizedPaths.add(key)
      scannedFiles.push(detected)
    }
  }

  for (const root of roots) {
    const st = await fs.stat(root).catch(() => null)
    if (!st?.isDirectory()) continue
    await walk(root)
  }
  scannedFiles.sort((a, b) => a.priority - b.priority)
  return { scannedFiles, totalFiles }
}
