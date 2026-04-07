import type { FastifyInstance } from 'fastify'

const CORRUPTED_PERCENT_REGEX = /%(?!\d+\$[sdfo]|[sdfo%]|\s*$)/

export async function cacheCleanupRoutes(app: FastifyInstance) {
  app.get('/api/cache/cleanup-placeholders', async (_request, reply) => {
    const Redis = (await import('ioredis')).default
    const redis = new Redis(process.env.REDIS_URL!)

    let scanned = 0
    let deleted = 0

    try {
      const stream = redis.scanStream({ match: 'trad:*', count: 500 })

      for await (const keysChunk of stream as AsyncIterable<string[]>) {
        for (const key of keysChunk) {
          scanned += 1
          const value = await redis.get(key)
          if (typeof value !== 'string') continue
          if (!CORRUPTED_PERCENT_REGEX.test(value)) continue
          deleted += await redis.del(key)
        }
      }

      return reply.send({ scanned, deleted })
    } finally {
      await redis.quit()
    }
  })
}
