import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from './config/env.js'
import { downloadRoutes } from './routes/download.js'
import { healthRoutes } from './routes/health.js'
import { statusRoutes } from './routes/status.js'
import { translateRoutes } from './routes/translate.js'
import { getQueueConnection } from './services/queue.service.js'
import { translationWorker } from './workers/translation.worker.js'

const app = Fastify({ logger: true })

await fs.mkdir(path.resolve(env.UPLOAD_DIR), { recursive: true })

await app.register(cors, { origin: env.FRONTEND_URL })
await app.register(multipart, {
  limits: { fileSize: env.MAX_FILE_SIZE },
})

await healthRoutes(app)
await translateRoutes(app)
await statusRoutes(app)
await downloadRoutes(app)

await app.listen({ port: env.PORT, host: '0.0.0.0' })

console.log(`🚀 ModVF API running on port ${env.PORT}`)
await getQueueConnection().ping()
console.log('📦 Translation queue connected to Redis')
if (translationWorker) console.log('👷 Translation worker started')
