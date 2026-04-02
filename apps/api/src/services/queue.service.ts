import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import { env } from '../config/env.js'
import type { TranslationJobData } from '../types/index.js'

const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })

export const translationQueue = new Queue<TranslationJobData, unknown, 'translate'>('translation', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
})

export async function addTranslationJob(data: TranslationJobData) {
  return translationQueue.add('translate', data, {
    attempts: 2,
    timeout: 1_800_000,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 20,
    jobId: data.jobId,
  } as any)
}

export function getQueueConnection() {
  return connection
}
