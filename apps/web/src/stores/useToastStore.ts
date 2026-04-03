import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (type: Toast['type'], message: string) => string
  removeToast: (id: string) => void
  /** @deprecated Préférez addToast avec un type explicite */
  showToast: (message: string) => void
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (type, message) => {
    const id = makeId()
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    return id
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  showToast: (message) => {
    const id = makeId()
    set((state) => ({ toasts: [...state.toasts, { id, type: 'info', message }] }))
  },
}))
