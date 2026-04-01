import { create } from 'zustand'

type AppState = {
  theme: 'dark'
}

export const useAppStore = create<AppState>(() => ({
  theme: 'dark',
}))
