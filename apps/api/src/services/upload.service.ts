import type { MultipartFile } from '@fastify/multipart'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { env } from '../config/env.js'

export async function validateAndStoreUpload(file: MultipartFile, jobId: string) {
  if (!file.filename.toLowerCase().endsWith('.zip')) {
    throw new Error("Ce fichier n'est pas un ZIP valide")
  }

  const jobDir = path.resolve(env.UPLOAD_DIR, jobId)
  await fs.mkdir(jobDir, { recursive: true })

  const filePath = path.join(jobDir, 'original.zip')
  const writeStream = (await import('node:fs')).createWriteStream(filePath)
  await pipeline(file.file, writeStream)

  const stats = await fs.stat(filePath)
  if (stats.size <= 0) throw new Error('Le fichier est vide')
  if (stats.size > env.MAX_FILE_SIZE) throw new Error('Le fichier dépasse la taille maximale (2 Go)')

  return { filePath, fileSize: stats.size, fileName: file.filename, jobDir }
}
