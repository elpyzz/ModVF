import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import AdmZip from 'adm-zip'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const API_BASE_URL = 'http://localhost:3001'
const TEST_ZIP_NAME = 'modvf-test.zip'
const RESULT_ZIP_PATH = path.resolve('tmp', 'test-result.zip')
const TEST_LANG_PATH = 'assets/testmod/lang/en_us.json'

const testLangPayload = {
  'item.testmod.diamond_sword': 'Diamond Sword',
  'item.testmod.iron_ingot': 'Iron Ingot',
  'block.testmod.crafting_table': 'Crafting Table',
  'gui.testmod.inventory': 'Inventory',
  'quest.testmod.welcome': 'Welcome to the adventure!',
}

function assertEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var: ${name}`)
  return value
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function createTestZipBuffer(): Promise<Buffer> {
  const zip = new AdmZip()
  zip.addFile(TEST_LANG_PATH, Buffer.from(`${JSON.stringify(testLangPayload, null, 2)}\n`, 'utf-8'))
  return zip.toBuffer()
}

async function main() {
  const supabaseUrl = assertEnv('SUPABASE_URL')
  const supabaseServiceRoleKey = assertEnv('SUPABASE_SERVICE_ROLE_KEY')
  const email = assertEnv('TEST_USER_EMAIL')
  const password = assertEnv('TEST_USER_PASSWORD')

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  if (signInError || !signInData.session?.access_token) {
    throw new Error(`Sign-in failed: ${signInError?.message ?? 'No token returned'}`)
  }
  const accessToken = signInData.session.access_token
  console.log('✅ Token obtenu')
  console.log(`🔑 Token preview: ${accessToken.slice(0, 20)}...`)

  const zipBuffer = await createTestZipBuffer()
  console.log('📦 ZIP de test créé')

  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(zipBuffer)], { type: 'application/zip' }), TEST_ZIP_NAME)

  const uploadResp = await fetch(`${API_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  })

  if (!uploadResp.ok) {
    const body = await uploadResp.text()
    throw new Error(`Upload failed (${uploadResp.status}): ${body}`)
  }

  const uploadJson = (await uploadResp.json()) as { jobId: string }
  const { jobId } = uploadJson
  console.log(`🚀 Upload envoyé — jobId: ${jobId}`)

  let status = 'pending'
  while (status !== 'completed') {
    await sleep(2000)
    const statusResp = await fetch(`${API_BASE_URL}/api/translate/${jobId}/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!statusResp.ok) {
      const body = await statusResp.text()
      throw new Error(`Status failed (${statusResp.status}): ${body}`)
    }
    const statusJson = (await statusResp.json()) as {
      status: string
      progress: number
      currentStep: string
    }
    status = statusJson.status
    console.log(`⏳ Status: ${statusJson.status} (${Math.round(statusJson.progress)}%)`)
    if (status === 'failed') {
      throw new Error('Translation job failed')
    }
  }
  console.log('✅ Status: completed!')

  console.log('⬇️ Téléchargement...')
  const downloadResp = await fetch(`${API_BASE_URL}/api/translate/${jobId}/download`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!downloadResp.ok) {
    const body = await downloadResp.text()
    throw new Error(`Download failed (${downloadResp.status}): ${body}`)
  }

  const arrayBuffer = await downloadResp.arrayBuffer()
  const resultBuffer = Buffer.from(arrayBuffer)
  await fs.mkdir(path.dirname(RESULT_ZIP_PATH), { recursive: true })
  await fs.writeFile(RESULT_ZIP_PATH, resultBuffer)

  const resultZip = new AdmZip(resultBuffer)
  const resultEntry = resultZip.getEntry(TEST_LANG_PATH)
  if (!resultEntry) {
    throw new Error(`File not found in result zip: ${TEST_LANG_PATH}`)
  }
  const translatedContent = resultEntry.getData().toString('utf-8')
  console.log('📄 Contenu traduit :')
  console.log(translatedContent)
}

main().catch((error) => {
  console.error('❌ Test pipeline failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
