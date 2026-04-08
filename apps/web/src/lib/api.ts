const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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
          onUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 202 || xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText) as { jobId: string })
        } else {
          try {
            const error = JSON.parse(xhr.responseText) as { error?: string }
            reject(new Error(error.error || 'Erreur upload'))
          } catch {
            reject(new Error('Erreur: ' + xhr.status))
          }
        }
      }

      xhr.onerror = () => reject(new Error('Erreur réseau. Vérifiez votre connexion.'))
      xhr.ontimeout = () => reject(new Error('Upload trop long. Réessayez.'))
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
    mods_count?: number
    download_count?: number
    max_downloads?: number
    download_expires_at?: string | null
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
    if (!res.ok) {
      let msg = 'Erreur téléchargement'
      try {
        const j = (await res.json()) as { error?: string }
        if (j.error) msg = j.error
      } catch {
        /* ignore */
      }
      throw new Error(msg)
    }
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
      type?: 'mod' | 'modpack'
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

  async getReferralCode(token: string): Promise<{ code: string; link: string }> {
    const res = await fetch(API_URL + '/api/referral/code', {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!res.ok) throw new Error('Erreur code de parrainage')
    return res.json()
  },

  async getReferralStats(token: string): Promise<{
    code: string | null
    link: string | null
    totalReferred: number
    totalConverted: number
    totalEarnings: number
  }> {
    const res = await fetch(API_URL + '/api/referral/stats', {
      headers: { Authorization: 'Bearer ' + token },
    })
    if (!res.ok) throw new Error('Erreur stats de parrainage')
    return res.json()
  },

  async trackReferral(token: string, referralCode: string): Promise<void> {
    const res = await fetch(API_URL + '/api/referral/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ referralCode }),
    })
    if (!res.ok) {
      let msg = 'Erreur tracking parrainage'
      try {
        const body = (await res.json()) as { error?: string }
        if (body.error) msg = body.error
      } catch {
        /* ignore */
      }
      throw new Error(msg)
    }
  },
}
