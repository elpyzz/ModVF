import { create } from 'zustand'

interface ToastStore {
  isVisible: boolean
  message: string
  showToast: (message: string) => void
  hideToast: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  isVisible: false,
  message: '',
  showToast: (message) => set({ isVisible: true, message }),
  hideToast: () => set({ isVisible: false }),
}))
