import { Coins } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { useUploadStore } from '../../stores/useUploadStore'

export function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null)

  const load = async () => {
    try {
      if (!supabase) {
        setCredits(null)
        return
      }
      const { data: sessionData } = await supabase.auth.getSession()
      let token = sessionData?.session?.access_token
      if (!token) {
        const { data: refreshData } = await supabase.auth.refreshSession()
        token = refreshData?.session?.access_token
      }
      if (!token) {
        setCredits(null)
        return
      }
      const p = await api.getProfile(token)
      setCredits(p.credits)
    } catch {
      setCredits(null)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    const unsub = useUploadStore.subscribe((state, prev) => {
      if (state.state === 'complete' && prev.state === 'processing') {
        void load()
      }
    })
    return unsub
  }, [])

  const label = credits === null ? '—' : credits.toLocaleString('fr-FR')

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
      <Coins className="h-4 w-4" />
      {label} credits restants
    </div>
  )
}
