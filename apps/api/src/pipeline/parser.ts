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

function parseSnbt(content: string): Map<string, string> {
  try {
    const entries = new Map<string, string>()
    const lines = content.split('\n')
    const translatableKeys = new Set(['title', 'subtitle', 'description', 'text', 'quest_description'])

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim()
      const singleMatch = line.match(/^(\w+)\s*:\s*"((?:[^"\\]|\\.)*)"/)
      if (singleMatch) {
        const [, key, value] = singleMatch
        if (translatableKeys.has(key) && value.trim()) entries.set(`s:${i}:${key}`, value)
        continue
      }

      const arrayStartMatch = line.match(/^(\w+)\s*:\s*\[/)
      if (arrayStartMatch && translatableKeys.has(arrayStartMatch[1])) {
        const key = arrayStartMatch[1]
        const singleLineArray = line.match(/\[(.*)\]/)
        if (singleLineArray) {
          const strings = [...singleLineArray[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)]
          strings.forEach((m, idx) => {
            if (m[1].trim()) entries.set(`s:${i}:${key}:${idx}`, m[1])
          })
          continue
        }
        let j = i + 1
        let idx = 0
        while (j < lines.length) {
          const matches = [...lines[j].matchAll(/"((?:[^"\\]|\\.)*)"/g)]
          matches.forEach((m) => {
            if (m[1]?.trim()) entries.set(`s:${j}:${key}:${idx++}`, m[1])
          })
          if (lines[j].includes(']')) break
          j += 1
        }
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
