import { getCachedTranslation, setCachedTranslation } from './cache.js'
import { getGlossaryTranslation } from './glossary.js'
import { GoogleTranslateEngine } from './translator.js'
import { addMicroVariations } from './watermark.js'

const engine = new GoogleTranslateEngine()
const JAVA_PLACEHOLDER_REGEX = /%(\d+\$)?[sdfo%]/g
const INVALID_PERCENT_REGEX = /%(?!\d+\$?[sdfo%]|[sdfo%])/g
const PROTECTED_TOKEN_REGEX = /%(\d+\$)?[sdfo%]|\$\{[^{}]+\}|\{\{[^{}]+\}\}|<\/?[a-z][a-z0-9_-]*>/gi

function protectPlaceholders(input: string): { protectedText: string; placeholders: string[] } {
  const placeholders: string[] = []
  let idx = 0
  const protectedText = input.replace(PROTECTED_TOKEN_REGEX, (match) => {
    const token = `§PLACEHOLDER_${idx}§`
    placeholders.push(match)
    idx += 1
    return token
  })
  return { protectedText, placeholders }
}

function restorePlaceholders(input: string, placeholders: string[]): string {
  let out = input
  for (let i = 0; i < placeholders.length; i += 1) {
    out = out.replaceAll(`§PLACEHOLDER_${i}§`, placeholders[i])
  }
  return out
}

function extractProtectedTokens(input: string): string[] {
  const matches = input.match(PROTECTED_TOKEN_REGEX)
  return matches ? matches : []
}

function hasInvalidPercentSpecifier(input: string): boolean {
  return INVALID_PERCENT_REGEX.test(input)
}

function hasSameProtectedTokens(original: string, translated: string): boolean {
  const a = extractProtectedTokens(original)
  const b = extractProtectedTokens(translated)
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export type TranslationStats = {
  glossary: number
  cache: number
  engine: number
  skipped: number
}

export async function translateWithOrchestrator(
  texts: string[],
  from: string = 'en',
  to: string = 'fr',
  userId?: string,
): Promise<{ translations: string[]; stats: TranslationStats }> {
  const results: string[] = new Array(texts.length)
  const stats: TranslationStats = { glossary: 0, cache: 0, engine: 0, skipped: 0 }

  // Index des strings qui doivent passer par le moteur
  const engineQueue: { originalIndex: number; text: string }[] = []

  // Passe 1 : glossaire + cache
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]

    if (!text || text.trim().length <= 1) {
      results[i] = text
      stats.skipped++
      continue
    }

    // Glossaire
    const glossaryResult = getGlossaryTranslation(text)
    if (glossaryResult) {
      results[i] = userId ? addMicroVariations(glossaryResult, userId) : glossaryResult
      stats.glossary++
      continue
    }

    // Cache
    const cached = await getCachedTranslation(text, from, to)
    if (cached) {
      results[i] = userId ? addMicroVariations(cached, userId) : cached
      stats.cache++
      continue
    }

    // Marque pour le moteur
    engineQueue.push({ originalIndex: i, text })
  }

  // Passe 2 : UN SEUL appel moteur pour toutes les strings restantes
  if (engineQueue.length > 0) {
    console.log(
      '[ORCHESTRATOR] ' +
        engineQueue.length +
        ' strings vers le moteur (glossaire: ' +
        stats.glossary +
        ', cache: ' +
        stats.cache +
        ')',
    )

    const protectedInputs = engineQueue.map((q) => protectPlaceholders(q.text))
    const textsToTranslate = protectedInputs.map((item) => item.protectedText)
    const engineResults = await engine.translate(textsToTranslate, from, to)

    for (let j = 0; j < engineQueue.length; j++) {
      const { originalIndex, text } = engineQueue[j]
      const rawTranslated = engineResults[j] || textsToTranslate[j] || text
      const restored = restorePlaceholders(rawTranslated, protectedInputs[j].placeholders)
      const translated =
        hasInvalidPercentSpecifier(restored) || !hasSameProtectedTokens(text, restored) ? text : restored
      // Cache texte brut (partagé entre utilisateurs)
      await setCachedTranslation(text, from, to, translated)
      let out = translated
      if (userId) {
        out = addMicroVariations(out, userId)
      }
      results[originalIndex] = out
      stats.engine++
    }
  }

  console.log(`[GLOSSARY] ${stats.glossary} terms applied`)
  return { translations: results, stats }
}
