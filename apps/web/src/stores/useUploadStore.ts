import { create } from 'zustand'
import { api } from '../lib/api'
import { getFreshToken } from '../lib/getToken'
import { supabase } from '../lib/supabase'
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
  modsCount: number | null
  uploadProgress: number
  estimatedSecondsRemaining: number | null
  processingStartedAt: number | null
  completedAt: number | null
  downloadCount: number
  maxDownloads: number
  downloadExpiresAt: string | null
  isDownloading: boolean
  startTime: number | null
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
  isDownloading: false,
  startTime: null as number | null,
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

function isCreditsInsufficientMessage(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes('crédit') || lower.includes('credit') || lower.includes('insuffisant') || lower.includes('402')
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
    const token = await getFreshToken()
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
      startTime: null,
      isDownloading: false,
    })

    try {
      const { jobId } = await api.uploadModpack(file, token, (uploadPercent) => {
        set({
          progress: Math.round(uploadPercent * 0.3),
          currentStep: 'Upload en cours... ' + uploadPercent + '% (' + sizeMB + ' Mo)',
          uploadProgress: uploadPercent,
        })
      })

      set({ jobId, progress: 30, currentStep: 'Traduction lancée...', uploadProgress: 100, startTime: Date.now() })
      get().pollStatus()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      if (!isCreditsInsufficientMessage(message)) {
        useToastStore.getState().addToast('error', 'Erreur lors de l\'upload')
      }
      if (isCreditsInsufficientMessage(message)) {
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
    let stopped = false
    let consecutiveFailures = 0
    let reconnectMessageShown = false

    const scheduleNextPoll = (delayMs: number) => {
      if (stopped) return
      const timeout = setTimeout(() => {
        void tick()
      }, delayMs)
      set({ pollingInterval: timeout as unknown as ReturnType<typeof setInterval> })
    }

    const tick = async () => {
      if (stopped) return
      try {
        let token = await getFreshToken()
        if (!token && supabase) {
          const { data } = await supabase.auth.refreshSession()
          if (data.session) {
            token = data.session.access_token
            useAuthStore.setState({ session: data.session, user: data.session.user })
          }
        }

        if (!token) throw new Error('Auth token unavailable')

        let status
        try {
          status = await api.getJobStatus(jobId, token)
        } catch {
          const refreshed = await getFreshToken()
          if (!refreshed) throw new Error('Retry token unavailable')
          status = await api.getJobStatus(jobId, refreshed)
          token = refreshed
        }

        consecutiveFailures = 0
        reconnectMessageShown = false

        console.log(
          '[POLL] Status:',
          status.status,
          'Progress:',
          status.progress,
          'Translated:',
          status.translated_strings ?? 0,
          '/',
          status.total_strings ?? 0,
        )

        const rawMods = (status as { mods_count?: number }).mods_count
        const nextMods = typeof rawMods === 'number' && Number.isFinite(rawMods) ? rawMods : get().modsCount

        const st = status as typeof status & { translatedStrings?: number; totalStrings?: number }

        if (status.status === 'completed') {
          stopped = true
          console.log('[POLL] Stopped - reason:', 'completed')
          clearPollingInterval(get, set)
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
          const isMod = get().file?.name.toLowerCase().endsWith('.jar') ?? false
          useToastStore.getState().addToast('success', isMod ? 'Mod traduit avec succès !' : 'Modpack traduit avec succès !')
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
          return
        }

        if (status.status === 'failed') {
          stopped = true
          console.log('[POLL] Stopped - reason:', 'failed')
          clearPollingInterval(get, set)
          set({ state: 'error', error: status.error_message?.trim() || 'Traduction échouée', pollingInterval: null })
          return
        }

        const backendProgress = Number(status.progress) || 0
        let displayProgress: number
        let stepMessage: string

        if (backendProgress <= 10) {
          displayProgress = 30 + Math.round(backendProgress * 0.5)
          stepMessage = '📦 Extraction du modpack...'
        } else if (backendProgress <= 15) {
          displayProgress = 35 + Math.round((backendProgress - 10) * 1)
          stepMessage = '🔍 Analyse des fichiers...'
        } else if (backendProgress < 90) {
          displayProgress = 40 + Math.round(((backendProgress - 15) / 75) * 50)
          const translated = status.translated_strings ?? st.translatedStrings ?? 0
          const total = status.total_strings ?? st.totalStrings ?? 0
          if (total > 0) {
            stepMessage =
              '🌐 Traduction en cours... ' + translated.toLocaleString('fr-FR') + ' / ' + total.toLocaleString('fr-FR')
          } else {
            stepMessage = '🌐 Traduction en cours...'
          }
        } else if (backendProgress < 100) {
          displayProgress = 90 + Math.round(((backendProgress - 90) / 10) * 5)
          stepMessage = '🔧 Reconstruction du modpack...'
        } else {
          displayProgress = 100
          stepMessage = '✅ Terminé !'
        }

        set({
          progress: displayProgress,
          currentStep: stepMessage,
          translatedStrings: status.translated_strings ?? st.translatedStrings ?? 0,
          totalStrings: status.total_strings ?? st.totalStrings ?? 0,
          modsCount: nextMods,
          state: 'processing',
        })

        scheduleNextPoll(3000)
      } catch (error) {
        console.log('[POLL] Error:', error)
        consecutiveFailures += 1
        const message = error instanceof Error ? error.message : ''
        if (isCreditsInsufficientMessage(message)) {
          stopped = true
          clearPollingInterval(get, set)
          set({ state: 'error', error: 'credits_insufficient', pollingInterval: null })
          return
        }
        if (consecutiveFailures >= 3 && !reconnectMessageShown) {
          reconnectMessageShown = true
          set({ currentStep: 'Connexion perdue, reconnexion...' })
        }
        if (consecutiveFailures >= 8) {
          stopped = true
          clearPollingInterval(get, set)
          set({
            state: 'error',
            error: 'Connexion perdue pendant la traduction. Réessayez.',
            pollingInterval: null,
          })
          return
        }
        scheduleNextPoll(consecutiveFailures >= 3 ? 10000 : 3000)
      }
    }

    scheduleNextPoll(0)
  },

  downloadResult: async () => {
    if (get().isDownloading) return

    const { jobId, file } = get()
    if (!jobId || !file) {
      useToastStore.getState().addToast('error', 'Aucun fichier à télécharger')
      return
    }

    set({ isDownloading: true })

    try {
      const token = await getFreshToken()
      if (!token) throw new Error('Non connecté')

      const blob = await api.downloadModpack(jobId, token)

      const url = URL.createObjectURL(blob)
      const isMod = file.name.toLowerCase().endsWith('.jar')
      const a = document.createElement('a')
      a.href = url
      const baseName = (file.name || 'fichier').replace(/\.(zip|jar)$/i, '')
      a.download = isMod ? `ModVF_${baseName}_FR.zip` : `${baseName}_FR.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
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
          downloadCount: Math.min(s.maxDownloads, s.downloadCount + 1),
        }))
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur téléchargement'
      console.error('[DOWNLOAD] erreur:', message)
      useToastStore.getState().addToast('error', message)
    } finally {
      set({ isDownloading: false })
    }
  },
}))
