console.log('[API] VITE_API_URL (env brut):', import.meta.env.VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
console.log('[API] URL résolue pour fetch:', API_URL)

export const api = {
  async uploadModpack(
    file: File,
    token: string,
    onUploadProgress?: (percent: number) => void,
  ): Promise<{ jobId: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onUploadProgress) {
          const percent = Math.round((e.loaded / e.total) * 100)
          onUploadProgress(percent)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 202) {
          resolve(JSON.parse(xhr.responseText) as { jobId: string })
        } else {
          try {
            const error = JSON.parse(xhr.responseText) as { error?: string }
            reject(new Error(error.error || 'Erreur upload'))
          } catch {
            reject(new Error('Erreur upload: ' + xhr.status))
          }
        }
      }

      xhr.onerror = () => reject(new Error('Erreur réseau'))
      xhr.ontimeout = () => reject(new Error('Upload timeout'))
      xhr.timeout = 600000

      xhr.open('POST', API_URL + '/api/translate')
      xhr.setRequestHeader('Authorization', 'Bearer ' + token)
      xhr.send(formData)
    })
  },

  async getJobStatus(
    jobId: string,
    token: string,
  ): Promise<{
    status: string
    progress: number
    current_step: string
    translated_strings: number
    total_strings: number
    error_message?: string | null
  }> {
    const res = await fetch(API_URL + '/api/translate/' + jobId + '/status', {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!res.ok) throw new Error('Erreur statut')
    return res.json()
  },

  async downloadModpack(jobId: string, token: string): Promise<Blob> {
    const res = await fetch(API_URL + '/api/translate/' + jobId + '/download', {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!res.ok) throw new Error('Erreur téléchargement')
    return res.blob()
  },

  async getProfile(token: string): Promise<{
    credits: number
    total_translations: number
    display_name: string
  }> {
    const res = await fetch(API_URL + '/api/profile', {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!res.ok) throw new Error('Erreur profil')
    return res.json()
  },

  async getTranslationHistory(token: string): Promise<
    Array<{
      id: string
      file_name: string
      status: string
      created_at: string
      total_strings: number
      translated_strings: number
      download_expires_at: string | null
    }>
  > {
    const res = await fetch(API_URL + '/api/translations', {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!res.ok) throw new Error('Erreur historique')
    return res.json()
  },
}
