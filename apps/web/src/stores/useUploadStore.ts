import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './useAuthStore'
import { useToastStore } from './useToastStore'

export type UploadState = 'idle' | 'dragover' | 'validating' | 'ready' | 'processing' | 'complete' | 'error'

export interface UploadStore {
  state: UploadState
  file: File | null
  jobId: string | null
  progress: number
  currentStep: string
  translatedStrings: number
  totalStrings: number
  uploadProgress: number
  estimatedSecondsRemaining: number | null
  processingStartedAt: number | null
  completedAt: number | null
  error: string | null
  pollingInterval: ReturnType<typeof setInterval> | null

  setState: (state: UploadState) => void
  setFile: (file: File | null) => void
  reset: () => void
  startTranslation: () => Promise<void>
  pollStatus: () => void
  downloadResult: () => Promise<void>
}

const initialState = {
  state: 'idle' as UploadState,
  file: null as File | null,
  jobId: null as string | null,
  progress: 0,
  currentStep: '',
  translatedStrings: 0,
  totalStrings: 0,
  uploadProgress: 0,
  estimatedSecondsRemaining: null as number | null,
  processingStartedAt: null as number | null,
  completedAt: null as number | null,
  error: null as string | null,
  pollingInterval: null as ReturnType<typeof setInterval> | null,
}

function clearPollingInterval(get: () => UploadStore, set: (partial: Partial<UploadStore>) => void) {
  const prev = get().pollingInterval
  if (prev) {
    clearInterval(prev)
    set({ pollingInterval: null })
  }
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  ...initialState,

  setState: (state) => set({ state }),
  setFile: (file) => set({ file }),

  reset: () => {
    clearPollingInterval(get, set)
    set(initialState)
  },

  startTranslation: async () => {
    console.log('[UPLOAD] startTranslation appelé')
    console.log('[UPLOAD] file:', get().file?.name, get().file?.size)

    const file = get().file
    if (!file) {
      console.warn('[UPLOAD] Pas de fichier dans le store, abandon (vérifier setFile / état ready)')
      return
    }

    clearPollingInterval(get, set)
    const started = Date.now()
    set({
      state: 'processing',
      error: null,
      jobId: null,
      progress: 0,
      currentStep: 'Upload du fichier en cours...',
      translatedStrings: 0,
      totalStrings: 0,
      uploadProgress: 0,
      estimatedSecondsRemaining: null,
      processingStartedAt: started,
      completedAt: null,
    })

    try {
      const session = useAuthStore.getState().session
      const token = session?.access_token
      if (!token) {
        set({ state: 'error', error: 'Non connecté' })
        return
      }

      console.log('[UPLOAD] Appel api.uploadModpack...')
      const { jobId } = await api.uploadModpack(file, token, (percent) => {
        set({
          uploadProgress: percent,
          currentStep: 'Upload en cours... ' + percent + '%',
          progress: Math.round(percent * 0.3),
        })
      })
      console.log('[UPLOAD] jobId reçu:', jobId)

      set({ jobId, currentStep: 'Traduction lancée...', progress: 30, uploadProgress: 100 })
      console.log('[UPLOAD] Lancement du polling pour', jobId)
      get().pollStatus()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('[UPLOAD] ERREUR:', message, err)
      if (message.includes('Crédits insuffisants') || message.includes('402')) {
        set({ state: 'error', error: 'credits_insufficient' })
      } else {
        set({ state: 'error', error: message })
      }
    }
  },

  pollStatus: () => {
    console.log('[POLL] pollStatus appelé, jobId:', get().jobId)
    const jobId = get().jobId
    if (!jobId) return

    clearPollingInterval(get, set)

    const interval = setInterval(async () => {
      console.log('[POLL] tick')
      try {
        const session = useAuthStore.getState().session
        const token = session?.access_token

        if (!token) {
          console.error('[POLL] pas de token')
          return
        }

        console.log('[POLL] appel getJobStatus')
        const status = await api.getJobStatus(jobId, token)
        console.log('[POLL] reçu:', status.status, status.progress + '%')

        const backendProgress = Number(status.progress) || 0
        const mappedProgress = 30 + Math.round((backendProgress / 100) * 65)

        set({
          progress: Math.min(95, mappedProgress),
          currentStep: status.current_step || (status as any).currentStep || '',
          translatedStrings: status.translated_strings || (status as any).translatedStrings || 0,
          totalStrings: status.total_strings || (status as any).totalStrings || 0,
          state: 'processing',
        })

        if (status.status === 'completed') {
          set({ state: 'complete', progress: 100, currentStep: 'Terminé' })
          try {
            const profile = await api.getProfile(token)
            const authState = useAuthStore.getState()
            if (authState.profile) {
              useAuthStore.setState({
                profile: {
                  ...authState.profile,
                  credits: Number(profile.credits ?? authState.profile.credits ?? 0),
                  total_translations: Number(profile.total_translations ?? authState.profile.total_translations ?? 0),
                },
              })
            }
          } catch (profileErr) {
            console.error('[CREDITS] échec refresh profil après completion', profileErr)
          }
          clearInterval(interval)
        } else if (status.status === 'failed') {
          set({ state: 'error', error: 'Traduction échouée' })
          clearInterval(interval)
        }
      } catch (err: any) {
        console.error('[POLL] erreur:', err.message)
      }
    }, 2000)

    set({ pollingInterval: interval })
  },

  downloadResult: async () => {
    const { jobId, file } = get()
    if (!jobId || !file) {
      useToastStore.getState().showToast('Aucun fichier à télécharger')
      return
    }
    const session = useAuthStore.getState().session
    const token = session?.access_token
    if (!token) {
      useToastStore.getState().showToast('Non connecté')
      return
    }
    try {
      const blob = await api.downloadModpack(jobId, token)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.zip$/i, '_FR.zip')
      a.click()
      URL.revokeObjectURL(url)
      useToastStore.getState().showToast('Téléchargement lancé')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur téléchargement'
      useToastStore.getState().showToast(message)
    }
  },
}))
