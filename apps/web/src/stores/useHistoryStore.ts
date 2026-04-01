import { create } from 'zustand'

export interface TranslationRecord {
  id: string
  fileName: string
  translatedAt: Date
  totalStrings: number
  status: 'translated' | 'expired'
}

interface HistoryStore {
  history: TranslationRecord[]
  addTranslation: (record: TranslationRecord) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  history: [],
  addTranslation: (record) => set((state) => ({ history: [record, ...state.history] })),
  clearHistory: () => set({ history: [] }),
}))
