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
import { checkoutRoutes } from './routes/checkout.js'
import { cacheCleanupRoutes } from './routes/cache-cleanup.js'
import { translateRoutes } from './routes/translate.js'
import { webhookRoutes } from './routes/webhook.js'
import { getQueueConnection } from './services/queue.service.js'
import { translationWorker } from './workers/translation.worker.js'

const app = Fastify({
  logger: true,
  bodyLimit: 2 * 1024 * 1024 * 1024,
  connectionTimeout: 300000,
  keepAliveTimeout: 300000,
})

await app.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

await fs.mkdir(path.resolve(env.UPLOAD_DIR), { recursive: true })

app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
  try {
    if (req.url === '/api/webhooks/stripe') {
      done(null, body)
      return
    }
    const json = JSON.parse(body.toString())
    done(null, json)
  } catch (err) {
    done(err as Error, undefined)
  }
})

app.addHook('preHandler', (req, _reply, done) => {
  if (req.url === '/api/webhooks/stripe') {
    ;(req as any).rawBody = req.body
  }
  done()
})

await app.register(multipart, {
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024,
    files: 1,
  },
  throwFileSizeLimit: true,
})

await webhookRoutes(app)
await healthRoutes(app)
await checkoutRoutes(app)
await cacheCleanupRoutes(app)
await translateRoutes(app)
await statusRoutes(app)
await downloadRoutes(app)
await app.register(profileRoutes)

const port = parseInt(process.env.PORT || '3001', 10)
app.server.headersTimeout = 300000
app.server.requestTimeout = 300000
await app.listen({ port, host: '0.0.0.0' })

console.log(`🚀 ModVF API running on port ${port}`)
await getQueueConnection().ping()
console.log('📦 Translation queue connected to Redis')
if (translationWorker) console.log('👷 Translation worker started')
