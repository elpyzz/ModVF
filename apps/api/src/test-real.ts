import fs from 'node:fs/promises'
import { openAsBlob } from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import AdmZip from 'adm-zip'
import { createClient } from '@supabase/supabase-js'
import Redis from 'ioredis'

dotenv.config()

const API_BASE_URL = 'http://localhost:3001'
const RESULT_ZIP_PATH = path.resolve('tmp', 'real-test-result.zip')

type StatusResponse = {
  status: string
  progress: number
  currentStep: string
  translatedStrings: number
  totalStrings: number
}

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatStep(status: StatusResponse): string {
  const pct = Math.round(status.progress)
  const step = status.currentStep || 'Traitement...'
  if (status.totalStrings > 0) {
    return `⏳ ${pct}% — ${step} (${status.translatedStrings}/${status.totalStrings} strings)`
  }
  return `⏳ ${pct}% — ${step}`
}

function tryParsePreview(content: string): Array<[string, string]> {
  const entries: Array<[string, string]> = []

  try {
    const json = JSON.parse(content) as Record<string, unknown>
    for (const [k, v] of Object.entries(json)) {
      if (typeof v === 'string') entries.push([k, v])
      if (entries.length >= 3) break
    }
    if (entries.length > 0) return entries
  } catch {
    // ignore
  }

  for (const line of content.split(/\r?\n/)) {
    const idx = line.indexOf('=')
    if (idx > 0) {
      entries.push([line.slice(0, idx).trim(), line.slice(idx + 1).trim()])
      if (entries.length >= 3) break
    }
  }

  return entries
}

async function main() {
  const zipArg = process.argv[2]
  if (!zipArg) {
    throw new Error('Usage: npm run test:real -- "C:\\path\\to\\modpack.zip"')
  }

  const realZipPath = path.resolve(zipArg)
  const stat = await fs.stat(realZipPath).catch(() => null)
  if (!stat || !stat.isFile()) throw new Error(`Fichier introuvable: ${realZipPath}`)
  if (!realZipPath.toLowerCase().endsWith('.zip')) throw new Error('Le fichier fourni doit être un .zip')

  const redisUrl = assertEnv('REDIS_URL')
  const supabaseUrl = assertEnv('SUPABASE_URL')
  const supabaseServiceRoleKey = assertEnv('SUPABASE_SERVICE_ROLE_KEY')
  const email = assertEnv('TEST_USER_EMAIL')
  const password = assertEnv('TEST_USER_PASSWORD')

  const redis = new Redis(redisUrl)
  await redis.flushdb()
  console.log('🗑️ Cache Redis vidé')
  await redis.quit()

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError || !signInData.session?.access_token) {
    throw new Error(`Sign-in failed: ${signInError?.message ?? 'No token returned'}`)
  }
  const accessToken = signInData.session.access_token
  console.log('✅ Token obtenu')

  const form = new FormData()
  const zipBlob = await openAsBlob(realZipPath)
  form.append('file', zipBlob, path.basename(realZipPath))

  const startedAt = Date.now()
  const uploadResp = await fetch(`${API_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  })

  if (!uploadResp.ok) {
    const body = await uploadResp.text()
    throw new Error(`Upload failed (${uploadResp.status}): ${body}`)
  }
  const uploadJson = (await uploadResp.json()) as { jobId: string }
  const jobId = uploadJson.jobId
  console.log(`🚀 Upload envoyé — jobId: ${jobId}`)

  let latestStatus: StatusResponse = {
    status: 'pending',
    progress: 0,
    currentStep: 'En attente',
    translatedStrings: 0,
    totalStrings: 0,
  }

  while (latestStatus.status !== 'completed') {
    await sleep(3000)
    const statusResp = await fetch(`${API_BASE_URL}/api/translate/${jobId}/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!statusResp.ok) {
      const body = await statusResp.text()
      throw new Error(`Status failed (${statusResp.status}): ${body}`)
    }
    latestStatus = (await statusResp.json()) as StatusResponse
    console.log(formatStep(latestStatus))
    if (latestStatus.status === 'failed') throw new Error('Translation job failed')
  }
  console.log('✅ Status: completed!')

  const downloadResp = await fetch(`${API_BASE_URL}/api/translate/${jobId}/download`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!downloadResp.ok) {
    const body = await downloadResp.text()
    throw new Error(`Download failed (${downloadResp.status}): ${body}`)
  }

  const arrayBuffer = await downloadResp.arrayBuffer()
  await fs.mkdir(path.dirname(RESULT_ZIP_PATH), { recursive: true })
  await fs.writeFile(RESULT_ZIP_PATH, Buffer.from(arrayBuffer))

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1)

  const { data: translationRow } = await supabase
    .from('translations')
    .select('translated_strings,total_strings,scanned_files_count,translated_files_count,glossary_count,cache_count,engine_count')
    .eq('id', jobId)
    .single()

  console.log('📊 Résultat de la traduction :')
  console.log(`- Fichiers scannés : ${translationRow?.scanned_files_count ?? 'N/A'}`)
  console.log(`- Fichiers traduits : ${translationRow?.translated_files_count ?? 'N/A'}`)
  console.log(`- Strings totales : ${translationRow?.total_strings ?? latestStatus.totalStrings ?? 0}`)
  console.log(`- Traduites par glossaire : ${translationRow?.glossary_count ?? 'N/A'}`)
  console.log(`- Traduites par cache : ${translationRow?.cache_count ?? 'N/A'}`)
  console.log(`- Traduites par moteur : ${translationRow?.engine_count ?? 'N/A'}`)
  console.log(`- Temps total : ${elapsedSec} secondes`)

  const zip = new AdmZip(RESULT_ZIP_PATH)
  const entries = zip
    .getEntries()
    .filter((e) => !e.isDirectory && /\.(json|lang|properties|snbt|txt|toml|js|zs)$/i.test(e.entryName))
    .slice(0, 5)

  console.log('🧾 Aperçu des 5 premiers fichiers traduits :')
  for (const entry of entries) {
    const content = entry.getData().toString('utf-8')
    const preview = tryParsePreview(content)
    console.log(`📄 ${entry.entryName}`)
    if (preview.length === 0) {
      console.log(content.split(/\r?\n/).slice(0, 3).join('\n'))
      continue
    }
    preview.forEach(([k, v]) => console.log(`  - ${k}: ${v}`))
  }
}

main().catch((error) => {
  console.error('❌ test:real failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
