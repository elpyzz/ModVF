import fs from 'node:fs/promises'
import path from 'node:path'
import { Worker } from 'bullmq'
import { env } from '../config/env.js'
import { extractZip } from '../pipeline/extractor.js'
import { injectTranslations } from '../pipeline/injector.js'
import { parseFile } from '../pipeline/parser.js'
import { repackZip } from '../pipeline/repacker.js'
import { scanTranslatableFiles } from '../pipeline/scanner.js'
import { StubTranslator } from '../pipeline/translator.js'
import { getQueueConnection } from '../services/queue.service.js'
import { supabaseAdmin } from '../services/supabase.service.js'
import type { TranslationJobData } from '../types/index.js'

const translator = new StubTranslator()

export const translationWorker = new Worker<TranslationJobData>(
  'translation',
  async (job) => {
    const { jobId, userId, filePath } = job.data
    const jobDir = path.resolve(env.UPLOAD_DIR, jobId)
    const extractedDir = path.join(jobDir, 'extracted')
    const outZipPath = path.join(jobDir, 'translated.zip')

    await supabaseAdmin.from('translations').update({ status: 'processing', progress: 10, current_step: 'Extraction' }).eq('id', jobId)
    await job.updateProgress(10)

    await extractZip(filePath, extractedDir)
    await job.updateProgress(15)

    const { translatableFiles } = await scanTranslatableFiles(extractedDir)
    await supabaseAdmin.from('translations').update({ progress: 25, current_step: 'Analyse', total_strings: translatableFiles.length }).eq('id', jobId)
    await job.updateProgress(25)

    let done = 0
    for (const f of translatableFiles) {
      const parsed = await parseFile(f)
      const keys = [...parsed.keys()]
      const values = [...parsed.values()]
      const translated = await translator.translate(values)
      const translatedMap = new Map<string, string>()
      keys.forEach((k, i) => translatedMap.set(k, translated[i] ?? values[i]))
      await injectTranslations(f, translatedMap)

      done += 1
      const progress = Math.min(85, 30 + Math.floor((done / Math.max(1, translatableFiles.length)) * 55))
      await job.updateProgress(progress)
      await supabaseAdmin
        .from('translations')
        .update({ progress, current_step: 'Traduction', translated_strings: done })
        .eq('id', jobId)
    }

    await job.updateProgress(90)
    await supabaseAdmin.from('translations').update({ progress: 90, current_step: 'Injection' }).eq('id', jobId)

    await repackZip(extractedDir, outZipPath)
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

    await fs.access(outZipPath)
    await job.updateProgress(100)
  },
  { connection: getQueueConnection() },
)
