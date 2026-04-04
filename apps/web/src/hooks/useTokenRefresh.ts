import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

export function useTokenRefresh() {
  useEffect(() => {
    const client = supabase
    if (!client) return

    const interval = setInterval(async () => {
      const {
        data: { session: current },
      } = await client.auth.getSession()
      if (!current) return
      const { data } = await client.auth.refreshSession()
      if (data.session) {
        useAuthStore.setState({ session: data.session, user: data.session.user })
        console.log('[AUTH] Token refreshed')
      }
    }, 45 * 60 * 1000)

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (session) {
        useAuthStore.setState({ session, user: session.user })
      }
      if (event === 'TOKEN_REFRESHED') {
        console.log('[AUTH] Token auto-refreshed by Supabase')
      }
    })

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])
}
