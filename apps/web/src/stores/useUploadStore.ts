export type UploadState =
  | 'idle'
  | 'dragover'
  | 'validating'
  | 'ready'
  | 'processing'
  | 'complete'
  | 'error'

export interface UploadStore {
  state: UploadState
  file: File | null
  progress: number
  currentStep: string
  translatedStrings: number
  totalStrings: number
  downloadUrl: string | null
  error: string | null

  setState: (state: UploadState) => void
  setFile: (file: File | null) => void
  setProgress: (progress: number) => void
  setCurrentStep: (step: string) => void
  setTranslationStats: (translated: number, total: number) => void
  setDownloadUrl: (url: string | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

import { create } from 'zustand'

const initialState = {
  state: 'idle' as UploadState,
  file: null,
  progress: 0,
  currentStep: '',
  translatedStrings: 0,
  totalStrings: 4500,
  downloadUrl: null,
  error: null,
}

export const useUploadStore = create<UploadStore>((set) => ({
  ...initialState,
  setState: (state) => set({ state }),
  setFile: (file) => set({ file }),
  setProgress: (progress) => set({ progress }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setTranslationStats: (translatedStrings, totalStrings) => set({ translatedStrings, totalStrings }),
  setDownloadUrl: (downloadUrl) => set({ downloadUrl }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
