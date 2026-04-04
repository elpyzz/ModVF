import type { ScannedFormat } from './scanner.js'

function setByPath(obj: unknown, path: string[], value: string) {
  let current = obj as Record<string, unknown>
  for (let i = 0; i < path.length - 1; i += 1) {
    const token = path[i]
    const nextToken = path[i + 1]
    if (Array.isArray(current)) {
      const idx = Number(token)
      current[idx] = current[idx] ?? (Number.isInteger(Number(nextToken)) ? [] : {})
      current = current[idx] as Record<string, unknown>
    } else {
      current[token] = current[token] ?? (Number.isInteger(Number(nextToken)) ? [] : {})
      current = current[token] as Record<string, unknown>
    }
  }
  const last = path[path.length - 1]
  if (Array.isArray(current)) current[Number(last)] = value
  else current[last] = value
}

function injectJsonByPath(content: string, translations: Map<string, string>, prefix: string): string {
  const parsed = JSON.parse(content) as unknown
  for (const [k, v] of translations.entries()) {
    if (!k.startsWith(`${prefix}:`)) continue
    const path = k.slice(2).split('.')
    setByPath(parsed, path, v)
  }
  return `${JSON.stringify(parsed, null, 2)}\n`
}

function injectJsonLangFlat(content: string, translations: Map<string, string>): string {
  const parsed = JSON.parse(content) as Record<string, unknown>
  for (const [k, v] of translations.entries()) {
    if (!k.startsWith('k:')) continue
    const langKey = k.slice(2)
    if (typeof parsed[langKey] === 'string') parsed[langKey] = v
  }
  return `${JSON.stringify(parsed, null, 2)}\n`
}

/** Fichiers .lang Minecraft : remplace les valeurs par clé (key=value). */
function injectLangMc(content: string, translations: Map<string, string>): string {
  const lines = content.split(/\r?\n/)
  return lines
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return line
      const eqIndex = line.indexOf('=')
      if (eqIndex === -1) return line
      const key = line.slice(0, eqIndex).trim()
      if (!translations.has(key)) return line
      const newVal = translations.get(key) ?? ''
      return `${line.slice(0, eqIndex + 1)}${newVal}`
    })
    .join('\n')
}

function injectLangLike(content: string, translations: Map<string, string>, prefix: string): string {
  const lines = content.split(/\r?\n/)
  return lines
    .map((line, i) => {
      const key = `${prefix}:${i}`
      if (!translations.has(key)) return line
      const idx = line.indexOf('=')
      if (idx <= 0) return line
      return `${line.slice(0, idx)}=${translations.get(key) ?? ''}`
    })
    .join('\n')
}

function injectSnbt(content: string, translations: Map<string, string>): string {
  const lines = content.split('\n')
  const ordered = [...translations.entries()]
    .filter(([k]) => k.startsWith('s:'))
    .sort((a, b) => {
      const pa = a[0].split(':')
      const pb = b[0].split(':')
      const la = Number(pa[1]) || 0
      const lb = Number(pb[1]) || 0
      if (la !== lb) return la - lb
      const ia = Number(pa[3] ?? 0)
      const ib = Number(pb[3] ?? 0)
      return ia - ib
    })
  for (const [k, v] of ordered) {
    const parts = k.split(':')
    const lineNo = Number(parts[1])
    if (Number.isNaN(lineNo) || !lines[lineNo]) continue
    const targetStringIndex = Number(parts[3] ?? 0)
    let seen = -1
    lines[lineNo] = lines[lineNo].replace(/"((?:[^"\\]|\\.)*)"/g, (full) => {
      seen += 1
      if (seen !== targetStringIndex) return full
      return `"${v.replaceAll('"', '\\"')}"`
    })
  }
  return lines.join('\n')
}

function injectKubeJs(content: string, translations: Map<string, string>): string {
  let idx = 0
  return content.replace(/\.(displayName|tooltip|name)\s*\(\s*(["'])([^"']+)\2\s*\)/g, (_full, method, quote) => {
    const key = `k:${idx++}`
    const value = translations.get(key)
    if (!value) return _full
    return `.${method}(${quote}${value}${quote})`
  })
}

function injectCraftTweaker(content: string, translations: Map<string, string>): string {
  let idx = 0
  return content.replace(
    /(\.displayName\s*=\s*["']([^"']+)["'])|(\.addTooltip\(\s*["']([^"']+)["']\s*\))/g,
    (full) => {
      const key = `c:${idx++}`
      const value = translations.get(key)
      if (!value) return full
      return full.replace(/["'][^"']+["']/, `"${value.replaceAll('"', '\\"')}"`)
    },
  )
}

function injectTomlDesc(content: string, translations: Map<string, string>): string {
  const lines = content.split(/\r?\n/)
  return lines
    .map((line, i) => {
      const key = `o:${i}`
      const value = translations.get(key)
      if (!value) return line
      return line.replace(/=\s*"((?:[^"\\]|\\.)*)"/, `= "${value.replaceAll('"', '\\"')}"`)
    })
    .join('\n')
}

export function injectTranslations(originalContent: string, translations: Map<string, string>, format: ScannedFormat): string {
  switch (format) {
    case 'json-lang':
      return injectJsonLangFlat(originalContent, translations)
    case 'lang':
      return injectLangMc(originalContent, translations)
    case 'json-quest':
      return injectJsonByPath(originalContent, translations, 'q')
    case 'json-patchouli':
      return injectJsonByPath(originalContent, translations, 'p')
    case 'json-advancement':
      return injectJsonByPath(originalContent, translations, 'a')
    case 'snbt':
      return injectSnbt(originalContent, translations)
    default:
      return originalContent
  }
}
