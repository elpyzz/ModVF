import type { ScannedFormat } from './scanner.js'

function parseJsonLang(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    const parsed = JSON.parse(content) as Record<string, unknown>
    for (const [k, v] of Object.entries(parsed)) if (typeof v === 'string') out.set(`k:${k}`, v)
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseLangFile(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    content.split(/\r?\n/).forEach((line, i) => {
      if (!line.trim() || line.trim().startsWith('#')) return
      const idx = line.indexOf('=')
      if (idx <= 0) return
      out.set(`l:${i}`, line.slice(idx + 1))
    })
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

/** Fichiers Minecraft .lang (1.12.2–) : key=value, # commentaire */
function parseLang(content: string): Map<string, string> {
  try {
    const entries = new Map<string, string>()
    const lines = content.split(/\r?\n/)

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || line.startsWith('//')) continue

      const eqIndex = line.indexOf('=')
      if (eqIndex === -1) continue

      const key = line.substring(0, eqIndex).trim()
      const value = line.substring(eqIndex + 1).trim()

      if (value.length > 0) {
        entries.set(key, value)
      }
    }

    return entries
  } catch (err) {
    console.error('[PARSER] .lang parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseSnbt(content: string): Map<string, string> {
  try {
    const entries = new Map<string, string>()
    const lines = content.split(/\r?\n/)

    const translatableKeyEndings = [
      'title',
      'subtitle',
      'quest_desc',
      'description',
      'text',
      'quest_description',
    ]

    function isTranslatableKey(key: string): boolean {
      if (translatableKeyEndings.includes(key)) return true
      for (const ending of translatableKeyEndings) {
        if (key.endsWith('.' + ending)) return true
      }
      return false
    }

    function shouldSkipValue(value: string): boolean {
      const t = value.trim()
      if (!t) return true
      if (t.startsWith('{image:')) return true
      if (t.startsWith('{@')) return true
      return false
    }

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim()

      if (!line || line.startsWith('//') || line.startsWith('#')) continue

      const singleMatch = line.match(/^([^\s:]+)\s*:\s*"((?:[^"\\]|\\.)*)"/)
      if (singleMatch) {
        const [, key, value] = singleMatch
        if (isTranslatableKey(key) && value.trim().length > 0 && !shouldSkipValue(value)) {
          entries.set(`s:${i}:${key}`, value)
        }
        continue
      }

      const arrayInlineMatch = line.match(/^([^\s:]+)\s*:\s*\[(.*)\]\s*$/)
      if (arrayInlineMatch && isTranslatableKey(arrayInlineMatch[1])) {
        const key = arrayInlineMatch[1]
        const inner = arrayInlineMatch[2]
        const strings = inner.match(/"((?:[^"\\]|\\.)*)"/g)
        if (strings) {
          strings.forEach((s, idx) => {
            const cleanValue = s.slice(1, -1)
            if (!shouldSkipValue(cleanValue)) {
              entries.set(`s:${i}:${key}:${idx}`, cleanValue)
            }
          })
        }
        continue
      }

      const arrayStartMatch = line.match(/^([^\s:]+)\s*:\s*\[\s*$/)
      if (arrayStartMatch && isTranslatableKey(arrayStartMatch[1])) {
        const key = arrayStartMatch[1]
        let j = i + 1
        let arrayIdx = 0
        while (j < lines.length && !lines[j].trim().startsWith(']')) {
          const strMatch = lines[j].match(/"((?:[^"\\]|\\.)*)"/)
          if (strMatch && strMatch[1].trim().length > 0) {
            const value = strMatch[1]
            if (!shouldSkipValue(value)) {
              entries.set(`s:${j}:${key}:${arrayIdx}`, value)
              arrayIdx += 1
            }
          }
          j += 1
        }
        i = j
        continue
      }
    }

    return entries
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseJsonByAllowedKeys(content: string, keys: Set<string>, prefix: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    const parsed = JSON.parse(content) as unknown

    function walk(node: unknown, path: string[]) {
      if (Array.isArray(node)) {
        node.forEach((v, i) => walk(v, [...path, String(i)]))
        return
      }
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
          if (typeof v === 'string' && keys.has(k) && v.trim()) {
            out.set(`${prefix}:${[...path, k].join('.')}`, v)
          } else {
            walk(v, [...path, k])
          }
        }
      }
    }
    walk(parsed, [])
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parsePatchouli(content: string): Map<string, string> {
  try {
    return parseJsonByAllowedKeys(content, new Set(['name', 'title', 'text', 'description']), 'p')
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseAdvancement(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    const parsed = JSON.parse(content) as Record<string, unknown>
    const display = parsed.display as Record<string, unknown> | undefined
    const title = display?.title as Record<string, unknown> | undefined
    const description = display?.description as Record<string, unknown> | undefined
    if (typeof title?.text === 'string') out.set('a:display.title.text', title.text)
    if (typeof description?.text === 'string') out.set('a:display.description.text', description.text)
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseKubeJS(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    let idx = 0
    for (const m of content.matchAll(/\.(displayName|tooltip|name)\s*\(\s*["']([^"']+)["']\s*\)/g)) {
      if (m[2].trim()) out.set(`k:${idx++}`, m[2])
    }
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseCraftTweaker(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    let idx = 0
    for (const m of content.matchAll(/(?:\.displayName\s*=\s*["']([^"']+)["'])|(?:\.addTooltip\(\s*["']([^"']+)["']\s*\))/g)) {
      const val = (m[1] || m[2] || '').trim()
      if (val) out.set(`c:${idx++}`, val)
    }
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseQuestJson(content: string): Map<string, string> {
  try {
    return parseJsonByAllowedKeys(content, new Set(['name', 'desc', 'description', 'text', 'title', 'subtitle', 'quest_description']), 'q')
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseTipsJson(content: string): Map<string, string> {
  try {
    const out = parseJsonByAllowedKeys(content, new Set(['tip', 'text', 'title', 'description']), 't')
    const parsed = JSON.parse(content) as Record<string, unknown>
    if (Array.isArray(parsed.tips)) {
      parsed.tips.forEach((v, i) => {
        if (typeof v === 'string' && v.trim()) out.set(`t:tips.${i}`, v)
      })
    }
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parsePackMcmeta(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    const parsed = JSON.parse(content) as { pack?: { description?: unknown } }
    if (typeof parsed.pack?.description === 'string') out.set('m:pack.description', parsed.pack.description)
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseTomlDesc(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    const lines = content.split(/\r?\n/)
    lines.forEach((line, i) => {
      const m = line.match(/^\s*(description|label|display_name|name)\s*=\s*"((?:[^"\\]|\\.)*)"/i)
      if (m?.[2]?.trim()) out.set(`o:${i}`, m[2])
    })
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

function parseTxt(content: string): Map<string, string> {
  try {
    const out = new Map<string, string>()
    if (content.trim()) out.set('x:0', content)
    return out
  } catch (err) {
    console.error('[PARSER] JSON parse failed, skipping file:', (err as Error).message)
    return new Map()
  }
}

export function parseFile(content: string, format: ScannedFormat): Map<string, string> {
  switch (format) {
    case 'json-lang':
      return parseJsonLang(content)
    case 'lang':
      return parseLang(content)
    case 'snbt':
      return parseSnbt(content)
    case 'json-patchouli':
      return parsePatchouli(content)
    case 'json-advancement':
      return parseAdvancement(content)
    case 'json-quest':
      return parseQuestJson(content)
    default:
      return new Map<string, string>()
  }
}
