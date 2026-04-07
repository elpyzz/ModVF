import type { MultipartFile } from '@fastify/multipart'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { env } from '../config/env.js'

export async function validateAndStoreUpload(file: MultipartFile, jobId: string) {
  const lower = file.filename.toLowerCase()
  const isZip = lower.endsWith('.zip')
  const isJar = lower.endsWith('.jar')
  if (!isZip && !isJar) {
    throw new Error("Format invalide: utilisez un .zip (modpack) ou un .jar (mod)")
  }

  const jobDir = path.resolve(env.UPLOAD_DIR, jobId)
  await fs.mkdir(jobDir, { recursive: true })

  const ext = isJar ? '.jar' : '.zip'
  const filePath = path.join(jobDir, `original${ext}`)
  const writeStream = (await import('node:fs')).createWriteStream(filePath)
  await pipeline(file.file, writeStream)

  const stats = await fs.stat(filePath)
  if (stats.size <= 0) throw new Error('Le fichier est vide')
  if (stats.size > env.MAX_FILE_SIZE) throw new Error('Le fichier dépasse la taille maximale (2 Go)')

  return { filePath, fileSize: stats.size, fileName: file.filename, jobDir }
}
