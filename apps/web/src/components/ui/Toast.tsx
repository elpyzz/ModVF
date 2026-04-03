import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useToastStore, type Toast as ToastItem } from '../../stores/useToastStore'

const DISMISS_MS = 4000

function toastStyles(type: ToastItem['type']): string {
  switch (type) {
    case 'success':
      return 'border-emerald-500/35 bg-emerald-950/90 text-emerald-100'
    case 'error':
      return 'border-red-500/35 bg-red-950/90 text-red-100'
    default:
      return 'border-primary/35 bg-[#1a1530]/95 text-text'
  }
}

export function Toast() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastRow({
  toast,
  removeToast,
}: {
  toast: ToastItem
  removeToast: (id: string) => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => removeToast(toast.id), DISMISS_MS)
    return () => window.clearTimeout(timer)
  }, [toast.id, removeToast])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 32, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-sm ${toastStyles(toast.type)}`}
      role="status"
    >
      {toast.message}
    </motion.div>
  )
}
