import fs from 'node:fs'
import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function downloadRoutes(app: FastifyInstance) {
  app.get('/api/translate/:jobId/download', { preHandler: [authMiddleware] }, async (request, reply) => {
    const params = request.params as { jobId: string }
    const userId = request.user!.id
    const { data: row } = await supabaseAdmin
      .from('translations')
      .select('file_name,status,download_expires_at,download_count,max_downloads,output_path')
      .eq('id', params.jobId)
      .eq('user_id', userId)
      .single()

    if (!row) return reply.status(404).send({ error: 'Fichier introuvable' })
    if (row.status !== 'completed') return reply.status(400).send({ error: 'Traduction non terminée' })
    if (row.download_expires_at && new Date(row.download_expires_at) < new Date()) {
      return reply.status(410).send({ error: 'Lien expiré' })
    }
    if ((row.download_count ?? 0) >= (row.max_downloads ?? 3)) {
      return reply.status(429).send({ error: 'Limite de téléchargements atteinte' })
    }

    const nextCount = (row.download_count ?? 0) + 1
    await supabaseAdmin.from('translations').update({ download_count: nextCount }).eq('id', params.jobId)

    const filePath = row.output_path as string
    if (!filePath || !fs.existsSync(filePath)) return reply.status(404).send({ error: 'Archive indisponible' })

    const frName = String(row.file_name ?? 'modpack.zip').replace(/\.zip$/i, '_FR.zip')
    reply.header('Content-Type', 'application/zip')
    reply.header('Content-Disposition', `attachment; filename="${frName}"`)
    return reply.send(fs.createReadStream(filePath))
  })
}
