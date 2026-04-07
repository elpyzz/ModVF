import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const { signIn, isLoading, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    document.title = 'Connexion — ModVF'
  }, [])

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn(email, password)
      if (useAuthStore.getState().isAuthenticated) {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de se connecter.')
    }
  }

  async function handleGoogleLogin() {
    if (!supabase) {
      console.error('Google login error:', new Error('Supabase non configuré'))
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    })
    if (error) console.error('Google login error:', error)
  }

  return (
    <section className="relative flex min-h-[75vh] items-center justify-center py-8">
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface p-7 sm:p-8">
        <div className="mb-6 text-center">
          <img src="/logo-full.svg" alt="ModVF" className="mx-auto mb-8 h-12" />
          <h1 className="text-2xl font-bold">Content de te revoir</h1>
        </div>

        <button
          onClick={() => void handleGoogleLogin()}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all text-white font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-gray-400">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@email.com" required />

          <div className="relative">
            <Input
              label="Mot de passe"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[42px] text-text-muted hover:text-text"
              aria-label="Afficher/masquer le mot de passe"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <Button type="submit" isLoading={isLoading}>
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Creer un compte
          </Link>
        </p>
      </div>
    </section>
  )
}
