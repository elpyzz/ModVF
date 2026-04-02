console.log('[API] VITE_API_URL (env brut):', import.meta.env.VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
console.log('[API] URL résolue pour fetch:', API_URL)

export const api = {
  async uploadModpack(file: File, token: string): Promise<{ jobId: string }> {
    console.log('[API] fetch POST /api/translate')
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(API_URL + '/api/translate', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: formData,
    })
    console.log('[API] status:', res.status)
    if (!res.ok) {
      const error = (await res.json()) as { error?: string }
      throw new Error(error.error || 'Erreur upload')
    }
    return res.json() as Promise<{ jobId: string }>
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
