import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fs from 'node:fs/promises'
import path from 'node:path'
import { env } from './config/env.js'
import { downloadRoutes } from './routes/download.js'
import { healthRoutes } from './routes/health.js'
import { profileRoutes } from './routes/profile.js'
import { statusRoutes } from './routes/status.js'
import { translateRoutes } from './routes/translate.js'
import { translationsListRoutes } from './routes/translations-list.js'
import { getQueueConnection } from './services/queue.service.js'
import { translationWorker } from './workers/translation.worker.js'

const app = Fastify({
  bodyLimit: 2 * 1024 * 1024 * 1024, // 2 Go
  logger: true,
})

await fs.mkdir(path.resolve(env.UPLOAD_DIR), { recursive: true })

await app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})
await app.register(multipart, {
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2 Go
    files: 1,
  },
})

await healthRoutes(app)
await translateRoutes(app)
await statusRoutes(app)
await downloadRoutes(app)
await profileRoutes(app)
await translationsListRoutes(app)

await app.listen({ port: env.PORT, host: '0.0.0.0' })

console.log(`🚀 ModVF API running on port ${env.PORT}`)
await getQueueConnection().ping()
console.log('📦 Translation queue connected to Redis')
if (translationWorker) console.log('👷 Translation worker started')
