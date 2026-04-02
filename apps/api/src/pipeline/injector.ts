import fs from 'node:fs/promises'
import path from 'node:path'

export async function injectTranslations(filePath: string, translated: Map<string, string>) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.json') {
    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(content) as Record<string, unknown>
    for (const [k, v] of translated.entries()) parsed[k] = v
    await fs.writeFile(filePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf-8')
    return
  }

  const lines = (await fs.readFile(filePath, 'utf-8')).split(/\r?\n/)
  const output = lines.map((line) => {
    const idx = line.indexOf('=')
    if (idx <= 0) return line
    const key = line.slice(0, idx).trim()
    if (!translated.has(key)) return line
    return `${line.slice(0, idx)}=${translated.get(key) ?? ''}`
  })
  await fs.writeFile(filePath, output.join('\n'), 'utf-8')
}
