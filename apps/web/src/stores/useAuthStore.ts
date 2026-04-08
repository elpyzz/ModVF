import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { resolveDisplayName } from '../lib/displayName'
import { translateAuthError } from '../lib/authErrors'
import { api } from '../lib/api'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  credits: number
  total_translations: number
  subscription_status?: string | null
  subscription_plan?: string | null
  subscription_current_period_end?: string | null
}

interface AuthStore {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  initialize: () => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
}

let authInitialized = false
const REF_STORAGE_KEY = 'modvf_ref'

async function maybeTrackReferral(token: string): Promise<void> {
  if (typeof window === 'undefined') return
  const referralCode = window.localStorage.getItem(REF_STORAGE_KEY)
  if (!referralCode) return

  try {
    await api.trackReferral(token, referralCode)
    window.localStorage.removeItem(REF_STORAGE_KEY)
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (
      /déjà enregistré/i.test(message) ||
      /invalide/i.test(message) ||
      /auto-parrainage/i.test(message) ||
      /non authentifié/i.test(message)
    ) {
      window.localStorage.removeItem(REF_STORAGE_KEY)
    }
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    if (authInitialized) return
    authInitialized = true
    set({ isLoading: true })
    if (!isSupabaseConfigured || !supabase) {
      set({ isLoading: false, user: null, session: null, profile: null, isAuthenticated: false, error: null })
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const sess = sessionData.session ?? null
    const sessionUser = sess?.user ?? null
    set({ user: sessionUser, session: sess, isAuthenticated: Boolean(sessionUser) })

    if (sessionUser) {
      await get().fetchProfile()
      if (sess?.access_token) await maybeTrackReferral(sess.access_token)
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null
      set({ user: nextUser, session: session ?? null, isAuthenticated: Boolean(nextUser) })

      if (nextUser) {
        await get().fetchProfile()
        if (session?.access_token) await maybeTrackReferral(session.access_token)
      } else {
        set({ profile: null })
      }
    })

    set({ isLoading: false })
  },

  signUp: async (email, password, displayName) => {
    if (!isSupabaseConfigured || !supabase) throw new Error('Configuration Supabase manquante')
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error

      const { data: sessionData } = await supabase.auth.getSession()
      const sess = sessionData.session ?? null
      const nextUser = sess?.user ?? null
      set({ user: nextUser, session: sess, isAuthenticated: Boolean(nextUser), error: null })
      if (nextUser) {
        await get().fetchProfile()
        if (sess?.access_token) await maybeTrackReferral(sess.access_token)
      }
      set({ isLoading: false })
    } catch (err) {
      const translated = translateAuthError(err instanceof Error ? err.message : 'Erreur inconnue')
      set({ isLoading: false, error: translated })
      throw new Error(translated)
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured || !supabase) throw new Error('Configuration Supabase manquante')
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: sessionData } = await supabase.auth.getSession()
      const sess = sessionData.session ?? null
      const nextUser = sess?.user ?? null
      set({ user: nextUser, session: sess, isAuthenticated: Boolean(nextUser), error: null })
      if (nextUser) await get().fetchProfile()
      set({ isLoading: false })
    } catch (err) {
      const translated = translateAuthError(err instanceof Error ? err.message : 'Erreur inconnue')
      set({ isLoading: false, error: translated })
      throw new Error(translated)
    }
  },

  signInWithGoogle: async () => {
    if (!isSupabaseConfigured || !supabase) throw new Error('Configuration Supabase manquante')
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      set({ isLoading: false })
      if (error) throw error
    } catch (err) {
      const translated = translateAuthError(err instanceof Error ? err.message : 'Erreur inconnue')
      set({ isLoading: false, error: translated })
      throw new Error(translated)
    }
  },

  signOut: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      return
    }
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  fetchProfile: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ profile: null })
      return
    }
    const { user } = get()
    if (!user) {
      set({ profile: null })
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      set({
        profile: {
          id: user.id,
          email: user.email ?? '',
          display_name: resolveDisplayName(user, null),
          avatar_url: null,
          credits: 1,
          total_translations: 0,
        },
      })
      return
    }

    const row = data as Profile
    set({
      profile: {
        ...row,
        display_name: resolveDisplayName(user, row),
      },
    })
  },
}))
