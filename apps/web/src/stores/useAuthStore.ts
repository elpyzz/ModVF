import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { resolveDisplayName } from '../lib/displayName'
import { translateAuthError } from '../lib/authErrors'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  credits: number
  total_translations: number
}

interface AuthStore {
  user: User | null
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

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    if (authInitialized) return
    authInitialized = true
    set({ isLoading: true })
    if (!isSupabaseConfigured || !supabase) {
      set({ isLoading: false, user: null, profile: null, isAuthenticated: false, error: null })
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const sessionUser = sessionData.session?.user ?? null
    set({ user: sessionUser, isAuthenticated: Boolean(sessionUser) })

    if (sessionUser) {
      await get().fetchProfile()
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null
      set({ user: nextUser, isAuthenticated: Boolean(nextUser) })

      if (nextUser) {
        await get().fetchProfile()
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
      const nextUser = sessionData.session?.user ?? null
      set({ user: nextUser, isAuthenticated: Boolean(nextUser), error: null })
      if (nextUser) await get().fetchProfile()
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
      const nextUser = sessionData.session?.user ?? null
      set({ user: nextUser, isAuthenticated: Boolean(nextUser), error: null })
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
