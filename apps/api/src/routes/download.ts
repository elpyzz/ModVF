import fs from 'node:fs'
import type { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middleware/auth.js'
import { supabaseAdmin } from '../services/supabase.service.js'

export async function downloadRoutes(app: FastifyInstance) {
  app.get('/api/translate/:jobId/download', { preHandler: [authMiddleware] }, async (request, reply) => {
    const params = request.params as { jobId: string }
    const jobId = params.jobId
    const userId = request.user!.id

    const { data: translation } = await supabaseAdmin
      .from('translations')
      .select('download_count, max_downloads, download_expires_at, output_path, user_id, file_name, status, type')
      .eq('id', jobId)
      .single()

    if (!translation) {
      return reply.status(404).send({ error: 'Fichier introuvable' })
    }

    if (translation.user_id !== userId) {
      return reply.status(403).send({ error: 'Accès non autorisé' })
    }

    if (translation.status !== 'completed') {
      return reply.status(400).send({ error: 'Traduction non terminée' })
    }

    if (translation.download_expires_at && new Date(translation.download_expires_at) < new Date()) {
      return reply
        .status(410)
        .send({ error: "Lien expiré. Le téléchargement n'est plus disponible après 24h." })
    }

    const maxDl = translation.max_downloads ?? 3
    const currentCount = translation.download_count ?? 0
    if (currentCount >= maxDl) {
      return reply
        .status(429)
        .send({ error: 'Nombre maximum de téléchargements atteint (3). Relancez une traduction.' })
    }

    const nextCount = currentCount + 1
    console.log('[DOWNLOAD] User:', userId, 'Job:', jobId, 'Count:', nextCount)

    await supabaseAdmin.from('translations').update({ download_count: nextCount }).eq('id', jobId)

    const filePath = translation.output_path as string
    if (!filePath || !fs.existsSync(filePath)) {
      return reply.status(404).send({ error: 'Archive indisponible' })
    }

    const originalName = String(translation.file_name ?? 'fichier.zip')
    const baseName = originalName.replace(/\.(zip|jar)$/i, '')
    const frName =
      translation.type === 'mod' ? `ModVF_${baseName}_FR.zip` : `${baseName}_FR.zip`
    reply.header('Content-Type', 'application/zip')
    reply.header('Content-Disposition', `attachment; filename="${frName}"`)
    return reply.send(fs.createReadStream(filePath))
  })
}
