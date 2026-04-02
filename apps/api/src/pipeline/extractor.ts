import fs from 'node:fs/promises'
import AdmZip from 'adm-zip'

export async function extractZip(zipPath: string, outputDir: string) {
  await fs.mkdir(outputDir, { recursive: true })
  const zip = new AdmZip(zipPath)
  zip.extractAllTo(outputDir, true)
  return outputDir
}
