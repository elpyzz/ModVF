import { getCachedTranslation, setCachedTranslation } from './cache.js'
import { getGlossaryTranslation } from './glossary.js'
import { GoogleTranslateEngine } from './translator.js'
import { applyWatermark } from './watermark.js'

const engine = new GoogleTranslateEngine()

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
      results[i] = glossaryResult
      stats.glossary++
      continue
    }

    // Cache
    const cached = await getCachedTranslation(text, from, to)
    if (cached) {
      results[i] = cached
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

    const textsToTranslate = engineQueue.map((q) => q.text)
    const engineResults = await engine.translate(textsToTranslate, from, to)

    for (let j = 0; j < engineQueue.length; j++) {
      const { originalIndex, text } = engineQueue[j]
      const translated = engineResults[j] || text
      // Cache sans watermark (partagé entre utilisateurs)
      await setCachedTranslation(text, from, to, translated)
      let out = translated
      if (userId && out.length > 20) {
        out = applyWatermark(out, userId)
      }
      results[originalIndex] = out
      stats.engine++
    }
  }

  return { translations: results, stats }
}
