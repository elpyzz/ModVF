import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import AdmZip from 'adm-zip'
import { Worker } from 'bullmq'
import { env } from '../config/env.js'
import { extractJar, extractZip } from '../pipeline/extractor.js'
import { injectTranslations } from '../pipeline/injector.js'
import { parseFile } from '../pipeline/parser.js'
import { repackZip } from '../pipeline/repacker.js'
import { scanTranslatableFiles, type ScannedFormat } from '../pipeline/scanner.js'
import { translateWithOrchestrator } from '../pipeline/translate-orchestrator.js'
import { getQueueConnection } from '../services/queue.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'
import type { TranslationJobData } from '../types/index.js'

const logFile = './tmp/debug.log'
const MC_PACK_FORMAT: Record<string, number> = {
  '1.6': 1,
  '1.7': 1,
  '1.8': 1,
  '1.9': 2,
  '1.10': 2,
  '1.11': 3,
  '1.12': 3,
  '1.13': 4,
  '1.14': 4,
  '1.15': 5,
  '1.16': 6,
  '1.16.1': 6,
  '1.16.2': 7,
  '1.16.3': 7,
  '1.16.4': 7,
  '1.16.5': 7,
  '1.17': 7,
  '1.18': 8,
  '1.18.1': 8,
  '1.18.2': 8,
  '1.19': 9,
  '1.19.1': 9,
  '1.19.2': 9,
  '1.19.3': 12,
  '1.19.4': 13,
  '1.20': 15,
  '1.20.1': 15,
  '1.20.2': 18,
  '1.20.3': 22,
  '1.20.4': 22,
  '1.20.5': 32,
  '1.20.6': 32,
  '1.21': 34,
  '1.21.1': 34,
  '1.21.2': 42,
  '1.21.3': 42,
  '1.21.4': 46,
}

function mcVersionToPackFormat(version: string): number | null {
  if (MC_PACK_FORMAT[version] !== undefined) return MC_PACK_FORMAT[version]
  const parts = version.split('.')
  if (parts.length === 3) {
    const minor = parts[0] + '.' + parts[1]
    if (MC_PACK_FORMAT[minor] !== undefined) return MC_PACK_FORMAT[minor]
  }
  return null
}

function packFormatToMcVersion(packFormat: number): string | null {
  for (const [version, format] of Object.entries(MC_PACK_FORMAT)) {
    if (format === packFormat) return version
  }
  return null
}

function detectMinecraftVersion(extractedDir: string): { version: string; source: 'metadata' | 'mods.toml' } | null {
  const candidates = ['minecraftinstance.json', 'instance.json', 'manifest.json', 'modrinth.index.json', 'pack.toml']
  for (const file of candidates) {
    const filePath = path.join(extractedDir, file)
    if (!fs.existsSync(filePath)) continue
    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      if (file.endsWith('.json')) {
        const data = JSON.parse(raw) as Record<string, unknown>
        const maybeMinecraft = data.minecraft as { version?: unknown } | undefined
        if (typeof maybeMinecraft?.version === 'string') return { version: maybeMinecraft.version, source: 'metadata' }
        const maybeDependencies = data.dependencies as { minecraft?: unknown } | undefined
        if (typeof maybeDependencies?.minecraft === 'string')
          return { version: maybeDependencies.minecraft, source: 'metadata' }
        if (typeof data.gameVersion === 'string') return { version: data.gameVersion, source: 'metadata' }
        if (typeof data.mc_version === 'string') return { version: data.mc_version, source: 'metadata' }
      }
      if (file === 'pack.toml') {
        const match = raw.match(/minecraft\s*=\s*\"([^\"]+)\"/)
        if (match?.[1]) return { version: match[1], source: 'metadata' }
      }
    } catch {
      /* ignore */
    }
  }
  const modsDir = path.join(extractedDir, 'mods')
  if (fs.existsSync(modsDir)) {
    const jars = fs.readdirSync(modsDir).filter((f) => f.toLowerCase().endsWith('.jar'))
    for (const jar of jars.slice(0, 10)) {
      try {
        const zip = new AdmZip(path.join(modsDir, jar))
        const modsToml = zip.getEntry('META-INF/mods.toml')
        if (!modsToml) continue
        const content = modsToml.getData().toString('utf8')
        const match = content.match(/modId\s*=\s*"minecraft"[\s\S]*?versionRange\s*=\s*"\[(\d+\.\d+(?:\.\d+)?)/)
        if (match?.[1]) return { version: match[1], source: 'mods.toml' }
      } catch {
        /* ignore */
      }
    }
  }
  return null
}

function detectPackDebugInfo(extractedDir: string, modsDir: string): { mcVersion: string | null; packFormat: number; source: string } {
  const detection = detectMinecraftVersion(extractedDir)
  if (detection) {
    const mapped = mcVersionToPackFormat(detection.version)
    if (mapped !== null) return { mcVersion: detection.version, packFormat: mapped, source: detection.source }
  }
  if (fs.existsSync(modsDir)) {
    const jars = fs.readdirSync(modsDir).filter((f) => f.toLowerCase().endsWith('.jar'))
    const formatCounts = new Map<number, number>()
    for (const jar of jars.slice(0, 20)) {
      try {
        const zip = new AdmZip(path.join(modsDir, jar))
        const packMcmeta = zip.getEntry('pack.mcmeta')
        if (packMcmeta && !packMcmeta.isDirectory) {
          const content = JSON.parse(packMcmeta.getData().toString('utf8')) as { pack?: { pack_format?: number } }
          if (typeof content.pack?.pack_format === 'number' && Number.isFinite(content.pack.pack_format)) {
            formatCounts.set(content.pack.pack_format, (formatCounts.get(content.pack.pack_format) || 0) + 1)
          }
        }
      } catch {
        /* ignore */
      }
    }
    if (formatCounts.size > 0) {
      const best = [...formatCounts.entries()].sort((a, b) => b[1] - a[1])[0]
      return { mcVersion: packFormatToMcVersion(best[0]), packFormat: best[0], source: 'jar-fallback' }
    }
  }
  return { mcVersion: null, packFormat: 15, source: 'default' }
}

function debugLog(msg: string) {
  const line = `${new Date().toISOString()} ${msg}\n`
  fs.mkdirSync(path.dirname(logFile), { recursive: true })
  fs.appendFileSync(logFile, line)
  console.log(msg)
}

function logMemoryRss() {
  console.log('[MEMORY] RSS:', Math.round(process.memoryUsage().rss / 1024 / 1024) + ' Mo')
}

function getDownloadExpireDurationMs(creditsPurchased: number): number {
  if (creditsPurchased >= 10) return 7 * 24 * 60 * 60 * 1000
  if (creditsPurchased > 0) return 72 * 60 * 60 * 1000
  return 24 * 60 * 60 * 1000
}

export const translationWorker = new Worker<TranslationJobData>(
  'translation',
  async (job) => {
    debugLog(`[START] Job demarre: ${job.id}`)
    try {
      logMemoryRss()
      const { jobId, userId, filePath, type } = job.data
      const jobDir = path.resolve(env.UPLOAD_DIR, jobId)
      const extractedDir = path.join(jobDir, 'extracted')
      const outZipPath = path.join(jobDir, 'translated.zip')

      await supabaseAdmin.from('translations').update({ status: 'processing', progress: 10, current_step: 'Extraction' }).eq('id', jobId)
      await job.updateProgress(10)

      const extraction = type === 'mod' ? await extractJar(filePath, extractedDir) : await extractZip(filePath, extractedDir)
      if (type === 'mod') {
        console.log(
          '[MOD] extractJar result:',
          JSON.stringify({
            langFiles: extraction.jarLangFiles.length,
            langPaths: extraction.jarExtractedLangPaths,
            jarReports: extraction.jarReports,
          }),
        )
      }
      logMemoryRss()
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
      console.log('[SCAN] scanTranslatableFiles roots:', extraction.modpackRoot, modsExtractedRoot)
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
      const workItems: { path: string; format: ScannedFormat }[] = []
      let totalStrings = 0
      let glossaryCount = 0
      let cacheCount = 0
      let engineCount = 0
      let skippedCount = 0

      for (const file of scannedFiles) {
        console.log('[PROCESS] Fichier:', file.format, file.path.slice(-60))
        try {
          const content = await fsp.readFile(file.path, 'utf-8')
          const parsed = parseFile(content, file.format)
          console.log('[PROCESS] Parsé:', file.format, 'keys:', parsed.size)
          if (parsed.size === 0) {
            console.log('[PROCESS] Skip (0 keys):', file.path.slice(-60))
            continue
          }
          totalStrings += parsed.size
          workItems.push({ path: file.path, format: file.format })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error('[PROCESS] ERREUR parse:', file.format, file.path.slice(-60), msg)
        }
      }

      logMemoryRss()

      let translatedCount = 0
      await supabaseAdmin
        .from('translations')
        .update({ progress: 15, current_step: 'Traduction', translated_strings: 0, total_strings: totalStrings })
        .eq('id', jobId)

      for (const item of workItems) {
        const content = await fsp.readFile(item.path, 'utf-8')
        const parsed = parseFile(content, item.format)
        if (parsed.size === 0) continue

        const keys = [...parsed.keys()]
        const values = [...parsed.values()]
        formatStats.set(item.format, (formatStats.get(item.format) ?? 0) + 1)
        const translatedResult = await translateWithOrchestrator(values, 'en', 'fr', userId)
        const translated = translatedResult.translations
        glossaryCount += translatedResult.stats.glossary
        cacheCount += translatedResult.stats.cache
        engineCount += translatedResult.stats.engine
        skippedCount += translatedResult.stats.skipped
        const translatedMap = new Map<string, string>()
        keys.forEach((k, i) => translatedMap.set(k, translated[i] ?? values[i]))
        const injected = injectTranslations(content, translatedMap, item.format)
        await fsp.writeFile(item.path, injected, 'utf-8')
        const jarMatch = item.path.match(/[\\/]mods_extracted[\\/](.+?)[\\/]/)
        if (jarMatch?.[1]) modifiedJarDirs.add(jarMatch[1])

        translatedCount += values.length
        const progress = Math.min(90, 15 + Math.floor((translatedCount / Math.max(1, totalStrings)) * 75))
        await job.updateProgress(progress)
        await supabaseAdmin
          .from('translations')
          .update({ progress, current_step: 'Traduction', translated_strings: translatedCount, total_strings: totalStrings })
          .eq('id', jobId)
      }
      debugLog(`[TRANSLATE] Total strings a traduire: ${totalStrings}`)
      logMemoryRss()

      await job.updateProgress(90)
      await supabaseAdmin.from('translations').update({ progress: 90, current_step: 'Injection' }).eq('id', jobId)

      await repackZip(extraction.extractedRoot, outZipPath, extraction.modpackRoot, modifiedJarDirs, {
        jobId,
        userId,
        type,
      })
      const packDebug = detectPackDebugInfo(extraction.extractedRoot, path.join(extraction.modpackRoot, 'mods'))
      logMemoryRss()

      await fsp.rm(extractedDir, { recursive: true, force: true })
      logMemoryRss()

      await job.updateProgress(95)
      await supabaseAdmin.from('translations').update({ progress: 95, current_step: 'Reconstruction' }).eq('id', jobId)

      const { data: profileForDownloadExpiry, error: profileForDownloadExpiryError } = await supabaseAdmin
        .from('profiles')
        .select('credits_purchased, subscription_status, subscription_current_period_end')
        .eq('id', userId)
        .single()
      if (profileForDownloadExpiryError) {
        console.warn('[DOWNLOAD_EXPIRY] Impossible de lire credits_purchased:', profileForDownloadExpiryError.message)
      }
      const creditsPurchasedForExpiry = Number(profileForDownloadExpiry?.credits_purchased ?? 0)
      const downloadExpiresAt = new Date(Date.now() + getDownloadExpireDurationMs(creditsPurchasedForExpiry)).toISOString()
      await supabaseAdmin
        .from('translations')
        .update({
          status: 'completed',
          progress: 100,
          current_step: 'Terminé',
          output_path: outZipPath,
          download_expires_at: downloadExpiresAt,
          max_downloads: 3,
          download_count: 0,
        })
        .eq('id', jobId)
      await fsp.access(outZipPath)
      await job.updateProgress(100)

      logMemoryRss()

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
          mcVersion: packDebug.mcVersion,
          packFormat: packDebug.packFormat,
          packSource: packDebug.source,
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
    concurrency: 3,
    lockDuration: 1_800_000,
    lockRenewTime: 60_000,
  },
)
