import { supabase } from './supabase'
import { useAuthStore } from '../stores/useAuthStore'

export async function getFreshToken(): Promise<string | null> {
  if (!supabase) {
    return useAuthStore.getState().session?.access_token ?? null
  }

  const session = useAuthStore.getState().session

  if (session?.expires_at) {
    const expiresAt = session.expires_at * 1000
    const now = Date.now()

    if (expiresAt - now < 300000) {
      const { data } = await supabase.auth.refreshSession()
      if (data.session) {
        useAuthStore.setState({ session: data.session, user: data.session.user })
        return data.session.access_token
      }
    }

    return session.access_token ?? null
  }

  if (session?.access_token) {
    return session.access_token
  }

  const { data } = await supabase.auth.getSession()
  if (data.session) {
    useAuthStore.setState({ session: data.session, user: data.session.user })
    return data.session.access_token
  }

  return null
}
