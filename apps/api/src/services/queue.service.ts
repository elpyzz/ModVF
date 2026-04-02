import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import { env } from '../config/env.js'
import type { TranslationJobData } from '../types/index.js'

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })

export const translationQueue = new Queue<TranslationJobData>('translation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
  },
})

export async function addTranslationJob(data: TranslationJobData) {
  return translationQueue.add(data.jobId, data)
}

export function getQueueConnection() {
  return connection
}
