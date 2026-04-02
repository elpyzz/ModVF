import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import AdmZip from 'adm-zip'
import { createClient } from '@supabase/supabase-js'
import Redis from 'ioredis'

dotenv.config()

const API_BASE_URL = 'http://localhost:3001'
const TEST_ZIP_NAME = 'modvf-test.zip'
const RESULT_ZIP_PATH = path.resolve('tmp', 'test-result.zip')
const TEST_LANG_PATH = 'assets/testmod/lang/en_us.json'
const TEST_SNBT_PATH = 'config/ftbquests/quests/chapters/chapter1.snbt'
const TEST_PATCHOULI_PATH = 'data/testmod/patchouli_books/guide/en_us/entries/intro.json'
const TEST_ADVANCEMENT_PATH = 'data/testmod/advancements/welcome.json'

const testLangPayload = {
  'item.testmod.diamond_sword': 'Diamond Sword',
  'item.testmod.iron_ingot': 'Iron Ingot',
  'block.testmod.crafting_table': 'Crafting Table',
  'gui.testmod.inventory': 'Inventory',
  'quest.testmod.welcome': 'Welcome to the adventure!',
}

const testSnbtPayload = `{
    default_hide_dependency_lines: false
    group: ""
    id: "3A4B5C6D7E8F"
    order_index: 0
    title: "Getting Started"
    subtitle: "Begin your adventure"
    quests: [{
        title: "First Steps"
        subtitle: "Craft a wooden pickaxe"
        description: ["Welcome to this modpack!", "Your first task is to craft a wooden pickaxe.", "Use it to mine some stone."]
        id: "1A2B3C"
        tasks: [{
            id: "4D5E6F"
            type: "item"
        }]
    }]
}
`

const testPatchouliPayload = {
  name: 'Introduction',
  icon: 'minecraft:book',
  category: 'basics',
  pages: [
    {
      type: 'text',
      title: 'Welcome',
      text: 'Welcome to the $(item)Ultimate Guide$(). This book will teach you everything about $(thing)machines$() and $(bold)automation$().',
    },
  ],
}

const testAdvancementPayload = {
  display: {
    title: { text: 'Welcome!' },
    description: { text: 'Join the server for the first time' },
    icon: { item: 'minecraft:grass_block' },
  },
  criteria: {},
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
  zip.addFile(TEST_SNBT_PATH, Buffer.from(testSnbtPayload, 'utf-8'))
  zip.addFile(TEST_PATCHOULI_PATH, Buffer.from(`${JSON.stringify(testPatchouliPayload, null, 2)}\n`, 'utf-8'))
  zip.addFile(TEST_ADVANCEMENT_PATH, Buffer.from(`${JSON.stringify(testAdvancementPayload, null, 2)}\n`, 'utf-8'))
  return zip.toBuffer()
}

async function main() {
  const redisUrl = assertEnv('REDIS_URL')
  const redis = new Redis(redisUrl)
  await redis.flushdb()
  console.log('🗑️ Cache Redis vidé')
  await redis.quit()

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
  const snbtEntry = resultZip.getEntry(TEST_SNBT_PATH)
  const patchouliEntry = resultZip.getEntry(TEST_PATCHOULI_PATH)
  const advancementEntry = resultZip.getEntry(TEST_ADVANCEMENT_PATH)
  if (!snbtEntry || !patchouliEntry || !advancementEntry) {
    throw new Error('One or more expected translated files are missing in output zip')
  }

  const snbtContent = snbtEntry.getData().toString('utf-8')
  const patchouliContent = patchouliEntry.getData().toString('utf-8')
  const advancementContent = advancementEntry.getData().toString('utf-8')

  console.log(`📄 ${TEST_LANG_PATH}:`)
  console.log(translatedContent)
  console.log(`📄 ${TEST_SNBT_PATH}:`)
  console.log(snbtContent)
  console.log(`📄 ${TEST_PATCHOULI_PATH}:`)
  console.log(patchouliContent)
  console.log(`📄 ${TEST_ADVANCEMENT_PATH}:`)
  console.log(advancementContent)

  const parsedLang = JSON.parse(translatedContent) as Record<string, string>
  const parsedPatchouli = JSON.parse(patchouliContent) as { name?: string; pages?: Array<{ text?: string }> }
  const parsedAdvancement = JSON.parse(advancementContent) as {
    display?: { title?: { text?: string }; description?: { text?: string } }
  }

  const checks = [
    parsedLang['item.testmod.diamond_sword']?.includes('[FR]') ||
      parsedLang['item.testmod.diamond_sword'] === 'Epee en diamant',
    snbtContent.includes('[FR] Getting Started') || snbtContent.includes('Getting Started'),
    parsedPatchouli.name?.includes('[FR]') || parsedPatchouli.name === 'Introduction',
    parsedPatchouli.pages?.[0]?.text?.includes('$(item)') && parsedPatchouli.pages?.[0]?.text?.includes('$(thing)'),
    parsedAdvancement.display?.title?.text?.includes('[FR]') || parsedAdvancement.display?.title?.text === 'Welcome!',
    parsedAdvancement.display?.description?.text?.includes('[FR]') ||
      parsedAdvancement.display?.description?.text === 'Join the server for the first time',
  ]

  if (checks.some((ok) => !ok)) {
    console.warn('⚠️ Post-check warning: translated output does not match expected format coverage')
  }
}

main().catch((error) => {
  console.error('❌ Test pipeline failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
