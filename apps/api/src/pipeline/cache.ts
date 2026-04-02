import { createHash } from 'node:crypto'
import IORedis from 'ioredis'
import { env } from '../config/env.js'

const redis = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })
const TTL_SECONDS = 60 * 60 * 24 * 30

function cacheKey(text: string, from: string, to: string): string {
  const digest = createHash('sha256').update(`${from}:${to}:${text}`).digest('hex')
  return `translation:${digest}`
}

export async function getCachedTranslation(text: string, from: string, to: string): Promise<string | null> {
  try {
    return await redis.get(cacheKey(text, from, to))
  } catch {
    return null
  }
}

export async function setCachedTranslation(text: string, from: string, to: string, translation: string): Promise<void> {
  try {
    await redis.set(cacheKey(text, from, to), translation, 'EX', TTL_SECONDS)
  } catch {
    // ignore cache errors
  }
}
