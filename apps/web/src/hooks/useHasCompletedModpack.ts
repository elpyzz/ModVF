import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/useAuthStore'

export function useHasCompletedModpack() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const session = useAuthStore((state) => state.session)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCompletedModpack, setHasCompletedModpack] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !session?.access_token) {
      setHasCompletedModpack(false)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    void api
      .getTranslationHistory(session.access_token)
      .then((history) => {
        if (cancelled) return
        const hasCompleted = history.some((item) => item.type === 'modpack' && item.status === 'completed')
        setHasCompletedModpack(hasCompleted)
      })
      .catch(() => {
        if (cancelled) return
        setHasCompletedModpack(false)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, session?.access_token])

  return { hasCompletedModpack, isLoading }
}
