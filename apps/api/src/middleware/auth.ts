import type { FastifyReply, FastifyRequest } from 'fastify'
import { supabaseAdmin } from '../services/supabase.service.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email?: string
      user_metadata?: Record<string, unknown>
    }
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers.authorization

  const match = auth?.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return reply.status(401).send({ error: 'Non authentifié' })
  }

  const token = match[1].trim()
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    console.warn('[AUTH] Token rejected:', error?.code ?? 'unknown')
    return reply.status(401).send({ error: 'Non authentifié' })
  }

  request.user = data.user
}
