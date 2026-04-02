import AdmZip from 'adm-zip'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function repackZip(extractedDir: string, outZipPath: string) {
  await fs.mkdir(path.dirname(outZipPath), { recursive: true })
  const zip = new AdmZip()
  zip.addLocalFolder(extractedDir)
  zip.writeZip(outZipPath)
  return outZipPath
}
