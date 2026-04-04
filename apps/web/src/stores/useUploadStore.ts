import { create } from 'zustand'
import { api } from '../lib/api'
import { useAuthStore } from './useAuthStore'
import { useToastStore } from './useToastStore'

export type UploadState = 'idle' | 'dragover' | 'validating' | 'ready' | 'processing' | 'complete' | 'error'

function getStepMessage(backendProgress: number, backendStep: string | undefined): string {
  const step = backendStep?.trim()
  if (step) return step
  if (backendProgress < 10) return 'Préparation de la traduction...'
  if (backendProgress < 30) return 'Analyse du modpack...'
  if (backendProgress < 60) return 'Traduction des textes...'
  if (backendProgress < 90) return 'Assemblage du modpack...'
  return 'Finalisation...'
}

export interface UploadStore {
  state: UploadState
  file: File | null
  jobId: string | null
  progress: number
  currentStep: string
  translatedStrings: number
  totalStrings: number
  modsCount: number | null
  uploadProgress: number
  estimatedSecondsRemaining: number | null
  processingStartedAt: number | null
  completedAt: number | null
  downloadCount: number
  maxDownloads: number
  downloadExpiresAt: string | null
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
  modsCount: null as number | null,
  uploadProgress: 0,
  estimatedSecondsRemaining: null as number | null,
  processingStartedAt: null as number | null,
  completedAt: null as number | null,
  downloadCount: 0,
  maxDownloads: 3,
  downloadExpiresAt: null as string | null,
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
    const session = useAuthStore.getState().session
    const token = session?.access_token
    if (!token) {
      set({ state: 'error', error: 'Non connecté' })
      return
    }

    const file = get().file
    if (!file) return

    clearPollingInterval(get, set)
    const sizeMB = Math.round(file.size / 1048576)
    set({
      state: 'processing',
      error: null,
      jobId: null,
      progress: 0,
      currentStep: 'Upload en cours... (' + sizeMB + ' Mo)',
      translatedStrings: 0,
      totalStrings: 0,
      modsCount: null,
      uploadProgress: 0,
      estimatedSecondsRemaining: null,
      processingStartedAt: Date.now(),
      completedAt: null,
      downloadCount: 0,
      maxDownloads: 3,
      downloadExpiresAt: null,
    })

    try {
      const { jobId } = await api.uploadModpack(file, token, (uploadPercent) => {
        set({
          progress: Math.round(uploadPercent * 0.3),
          currentStep: 'Upload en cours... ' + uploadPercent + '% (' + sizeMB + ' Mo)',
          uploadProgress: uploadPercent,
        })
      })

      set({ jobId, progress: 30, currentStep: 'Traduction lancée...', uploadProgress: 100 })
      get().pollStatus()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      if (!message.includes('Crédits insuffisants') && !message.includes('402')) {
        useToastStore.getState().addToast('error', 'Erreur lors de l\'upload')
      }
      if (message.includes('Crédits insuffisants') || message.includes('402')) {
        set({ state: 'error', error: 'credits_insufficient' })
      } else {
        set({ state: 'error', error: message })
      }
    }
  },

  pollStatus: () => {
    const jobId = get().jobId
    if (!jobId) return

    clearPollingInterval(get, set)

    const interval = setInterval(async () => {
      try {
        const session = useAuthStore.getState().session
        const token = session?.access_token
        if (!token) return

        const status = await api.getJobStatus(jobId, token)
        const backendProgress = Number(status.progress) || 0
        const mappedProgress = 30 + Math.round((backendProgress / 100) * 65)

        const rawMods = (status as { mods_count?: number }).mods_count
        const nextMods =
          typeof rawMods === 'number' && Number.isFinite(rawMods) ? rawMods : get().modsCount

        set({
          progress: Math.min(95, mappedProgress),
          currentStep: getStepMessage(backendProgress, status.current_step),
          translatedStrings: status.translated_strings ?? 0,
          totalStrings: status.total_strings ?? 0,
          modsCount: nextMods,
          state: 'processing',
        })

        if (status.status === 'completed') {
          clearInterval(interval)
          set({
            state: 'complete',
            progress: 100,
            currentStep: 'Terminé !',
            completedAt: Date.now(),
            pollingInterval: null,
            downloadCount: status.download_count ?? 0,
            maxDownloads: status.max_downloads ?? 3,
            downloadExpiresAt: status.download_expires_at ?? null,
          })
          useToastStore.getState().addToast('success', 'Modpack traduit avec succès !')
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
        } else if (status.status === 'failed') {
          clearInterval(interval)
          set({ state: 'error', error: status.error_message?.trim() || 'Traduction échouée', pollingInterval: null })
        }
      } catch {
        // Polling continue en cas d’erreur réseau ponctuelle
      }
    }, 2000)

    set({ pollingInterval: interval })
  },

  downloadResult: async () => {
    const { jobId, file } = get()
    if (!jobId || !file) {
      useToastStore.getState().addToast('error', 'Aucun fichier à télécharger')
      return
    }
    const session = useAuthStore.getState().session
    const token = session?.access_token
    if (!token) {
      useToastStore.getState().addToast('error', 'Non connecté')
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
      useToastStore.getState().addToast('success', 'Téléchargement lancé')
      try {
        const refreshed = await api.getJobStatus(jobId, token)
        set({
          downloadCount: refreshed.download_count ?? 0,
          maxDownloads: refreshed.max_downloads ?? 3,
          downloadExpiresAt: refreshed.download_expires_at ?? null,
        })
      } catch {
        set((s) => ({
          downloadCount: Math.min(s.maxDownloads, (s.downloadCount ?? 0) + 1),
        }))
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur téléchargement'
      useToastStore.getState().addToast('error', message)
    }
  },
}))
