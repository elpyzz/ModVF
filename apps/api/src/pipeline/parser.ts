import fs from 'node:fs/promises'
import path from 'node:path'

export async function parseFile(filePath: string): Promise<Map<string, string>> {
  const ext = path.extname(filePath).toLowerCase()
  const content = await fs.readFile(filePath, 'utf-8')
  const map = new Map<string, string>()

  if (ext === '.json') {
    const parsed = JSON.parse(content) as Record<string, unknown>
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string') map.set(k, v)
    }
    return map
  }

  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1)
    map.set(key, value)
  }

  return map
}
