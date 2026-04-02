import { create } from 'zustand'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './useAuthStore'
import { useToastStore } from './useToastStore'

export type UploadState = 'idle' | 'dragover' | 'validating' | 'ready' | 'processing' | 'complete' | 'error'

function mapBackendStep(step: string): string {
  const key = step.trim()
  const map: Record<string, string> = {
    Extraction: '📦 Extraction du modpack...',
    Analyse: '🔍 Analyse des fichiers...',
    Traduction: '🌐 Traduction en cours...',
    Injection: '🔧 Injection des traductions...',
    Reconstruction: '🔧 Reconstruction du modpack...',
    'Terminé': '✅ Terminé !',
    'En attente': '⏳ En attente...',
  }
  return map[key] ?? step
}

export interface UploadStore {
  state: UploadState
  file: File | null
  jobId: string | null
  progress: number
  currentStep: string
  translatedStrings: number
  totalStrings: number
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
      currentStep: 'Envoi du modpack...',
      translatedStrings: 0,
      totalStrings: 0,
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
      const { jobId } = await api.uploadModpack(file, token)
      console.log('[UPLOAD] jobId reçu:', jobId)

      set({ jobId, currentStep: mapBackendStep('En attente') })
      get().pollStatus()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('[UPLOAD] ERREUR:', message, err)
      set({ state: 'error', error: message })
    }
  },

  pollStatus: () => {
    const jobId = get().jobId
    if (!jobId) return

    clearPollingInterval(get, set)

    const interval = setInterval(async () => {
      try {
        if (!supabase) return
        const { data } = await supabase.auth.getSession()
        let token = data.session?.access_token
        if (!token) {
          const { data: refreshed } = await supabase.auth.refreshSession()
          if (!refreshed.session) {
            console.error('[POLL] token expiré, impossible de rafraîchir')
            return
          }
          token = refreshed.session.access_token
        }

        console.log('[POLL] checking status for', jobId)
        const status = await api.getJobStatus(jobId, token)
        console.log('[POLL] status:', status.status, status.progress + '%')

        set({
          progress: status.progress,
          currentStep: status.current_step,
          translatedStrings: status.translated_strings,
          totalStrings: status.total_strings,
        })

        if (status.status === 'completed') {
          set({ state: 'complete', pollingInterval: null })
          clearInterval(interval)
        } else if (status.status === 'failed') {
          set({
            state: 'error',
            error: status.error_message || 'Traduction échouée',
            pollingInterval: null,
          })
          clearInterval(interval)
        }
      } catch (err: unknown) {
        const e = err as { message?: string }
        console.error('[POLL] erreur:', e?.message)
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
    if (!supabase) {
      useToastStore.getState().showToast('Non connecté')
      return
    }
    const { data } = await supabase.auth.getSession()
    let token = data.session?.access_token
    if (!token) {
      const { data: refreshed } = await supabase.auth.refreshSession()
      if (!refreshed.session) {
        useToastStore.getState().showToast('Non connecté')
        return
      }
      token = refreshed.session.access_token
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
