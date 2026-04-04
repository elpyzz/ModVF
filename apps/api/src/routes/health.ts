import type { FastifyInstance } from 'fastify'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }))

  app.get('/api/cache/flush', async (request, reply) => {
    const Redis = (await import('ioredis')).default
    const redis = new Redis(process.env.REDIS_URL!)
    const keys = await redis.keys('trad:*')
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    await redis.quit()
    return reply.send({ flushed: keys.length })
  })

  app.get('/api/cache/info', async (request, reply) => {
    const Redis = (await import('ioredis')).default
    const redis = new Redis(process.env.REDIS_URL!)
    const allKeys = await redis.keys('*')
    const sample = allKeys.slice(0, 20)
    await redis.quit()
    return reply.send({ totalKeys: allKeys.length, sample })
  })
}
