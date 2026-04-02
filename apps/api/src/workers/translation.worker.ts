import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { Worker } from 'bullmq'
import { env } from '../config/env.js'
import { extractZip } from '../pipeline/extractor.js'
import { injectTranslations } from '../pipeline/injector.js'
import { parseFile } from '../pipeline/parser.js'
import { repackZip } from '../pipeline/repacker.js'
import { scanTranslatableFiles, type ScannedFormat } from '../pipeline/scanner.js'
import { translateWithOrchestrator } from '../pipeline/translate-orchestrator.js'
import { getQueueConnection } from '../services/queue.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'
import type { TranslationJobData } from '../types/index.js'

const logFile = './tmp/debug.log'

function debugLog(msg: string) {
  const line = `${new Date().toISOString()} ${msg}\n`
  fs.mkdirSync(path.dirname(logFile), { recursive: true })
  fs.appendFileSync(logFile, line)
  console.log(msg)
}

export const translationWorker = new Worker<TranslationJobData>(
  'translation',
  async (job) => {
    debugLog(`[START] Job demarre: ${job.id}`)
    try {
      const { jobId, userId, filePath } = job.data
      const jobDir = path.resolve(env.UPLOAD_DIR, jobId)
      const extractedDir = path.join(jobDir, 'extracted')
      const outZipPath = path.join(jobDir, 'translated.zip')

      await supabaseAdmin.from('translations').update({ status: 'processing', progress: 10, current_step: 'Extraction' }).eq('id', jobId)
      await job.updateProgress(10)

      const extraction = await extractZip(filePath, extractedDir)
      debugLog(`[EXTRACT] Contenu: ${fs.readdirSync(extraction.extractedRoot).join(', ')}`)
      debugLog(`[ROOT] Racine modpack: ${extraction.modpackRoot}`)
      debugLog(`[JAR] Nombre de .jar trouves: ${extraction.jarFiles.length}`)
      for (const report of extraction.jarReports) {
        debugLog(`[JAR] ${path.basename(report.jarPath)} -> fichiers lang: ${report.langFilesFound}`)
      }
      for (const langPath of extraction.jarExtractedLangPaths) {
        debugLog(`[JAR] Fichier lang extrait vers: ${langPath}`)
      }
      await job.updateProgress(15)

      const modsExtractedRoot = path.join(extraction.extractedRoot, 'mods_extracted')
      const { scannedFiles } = await scanTranslatableFiles([extraction.modpackRoot, modsExtractedRoot])
      const byFormat = scannedFiles.reduce<Record<string, number>>((acc, item) => {
        acc[item.format] = (acc[item.format] ?? 0) + 1
        return acc
      }, {})
      debugLog(`[SCAN] Fichiers traduisibles: ${JSON.stringify(byFormat)}`)
      await supabaseAdmin.from('translations').update({ progress: 15, current_step: 'Analyse', total_strings: 0 }).eq('id', jobId)
      await job.updateProgress(15)

      const formatStats = new Map<string, number>()
      const modifiedJarDirs = new Set<string>()
      const preparedFiles: Array<{
        filePath: string
        format: ScannedFormat
        content: string
        keys: string[]
        values: string[]
      }> = []
      let totalStrings = 0
      let glossaryCount = 0
      let cacheCount = 0
      let engineCount = 0
      let skippedCount = 0

      for (const file of scannedFiles) {
        const content = await fsp.readFile(file.path, 'utf-8')
        const parsed = parseFile(content, file.format)
        if (parsed.size === 0) continue

        const keys = [...parsed.keys()]
        const values = [...parsed.values()]
        totalStrings += values.length
        preparedFiles.push({ filePath: file.path, format: file.format, content, keys, values })
      }

      let translatedCount = 0
      await supabaseAdmin
        .from('translations')
        .update({ progress: 15, current_step: 'Traduction', translated_strings: 0, total_strings: totalStrings })
        .eq('id', jobId)

      for (const file of preparedFiles) {
        formatStats.set(file.format, (formatStats.get(file.format) ?? 0) + 1)
        const translatedResult = await translateWithOrchestrator(file.values, 'en', 'fr')
        const translated = translatedResult.translations
        glossaryCount += translatedResult.stats.glossary
        cacheCount += translatedResult.stats.cache
        engineCount += translatedResult.stats.engine
        skippedCount += translatedResult.stats.skipped
        const translatedMap = new Map<string, string>()
        file.keys.forEach((k, i) => translatedMap.set(k, translated[i] ?? file.values[i]))
        const injected = injectTranslations(file.content, translatedMap, file.format)
        await fsp.writeFile(file.filePath, injected, 'utf-8')
        const jarMatch = file.filePath.match(/[\\/]mods_extracted[\\/](.+?)[\\/]/)
        if (jarMatch?.[1]) modifiedJarDirs.add(jarMatch[1])

        translatedCount += file.values.length
        const progress = Math.min(90, 15 + Math.floor((translatedCount / Math.max(1, totalStrings)) * 75))
        await job.updateProgress(progress)
        await supabaseAdmin
          .from('translations')
          .update({ progress, current_step: 'Traduction', translated_strings: translatedCount, total_strings: totalStrings })
          .eq('id', jobId)
      }
      debugLog(`[TRANSLATE] Total strings a traduire: ${totalStrings}`)

      await job.updateProgress(90)
      await supabaseAdmin.from('translations').update({ progress: 90, current_step: 'Injection' }).eq('id', jobId)

      await repackZip(extraction.extractedRoot, outZipPath, modifiedJarDirs)
      await job.updateProgress(95)
      await supabaseAdmin.from('translations').update({ progress: 95, current_step: 'Reconstruction' }).eq('id', jobId)

      const downloadExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      await supabaseAdmin
        .from('translations')
        .update({
          status: 'completed',
          progress: 100,
          current_step: 'Terminé',
          output_path: outZipPath,
          download_expires_at: downloadExpiresAt,
          max_downloads: 3,
        })
        .eq('id', jobId)
      try {
        await supabaseAdmin.rpc('decrement_credits', { uid: userId, amount: 1 })
      } catch {
        const { data } = await supabaseAdmin.from('profiles').select('credits').eq('id', userId).single()
        await supabaseAdmin.from('profiles').update({ credits: Math.max(0, Number(data?.credits ?? 0) - 1) }).eq('id', userId)
      }

      await fsp.access(outZipPath)
      await job.updateProgress(100)

      debugLog(
        `[STATS] ${JSON.stringify({
          jobId,
          formats: Object.fromEntries(formatStats.entries()),
          strings: {
            total: totalStrings,
            glossary: glossaryCount,
            cache: cacheCount,
            engine: engineCount,
            skipped: skippedCount,
          },
        })}`,
      )
    } catch (err: any) {
      debugLog('[FATAL ERROR] ' + err.message);
      debugLog('[FATAL STACK] ' + err.stack);
      await supabaseAdmin.from('translations').update({ status: 'failed', error_message: err.message }).eq('id', job.data.jobId);
      throw err;
    }
  },
  {
    connection: getQueueConnection(),
    lockDuration: 1_800_000,
    lockRenewTime: 60_000,
  },
)
