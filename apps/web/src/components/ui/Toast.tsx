import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useToastStore } from '../../stores/useToastStore'

export function Toast() {
  const { isVisible, message, hideToast } = useToastStore()

  useEffect(() => {
    if (!isVisible) return
    const timer = window.setTimeout(() => hideToast(), 3000)
    return () => window.clearTimeout(timer)
  }, [hideToast, isVisible])

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-white/15 bg-surface-light px-4 py-3 text-sm text-text-muted shadow-xl"
          role="status"
          aria-live="polite"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
