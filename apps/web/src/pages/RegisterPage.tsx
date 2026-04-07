import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/useAuthStore'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z"/>
    </svg>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, isLoading, isAuthenticated } = useAuthStore()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (displayName.trim().length < 2) nextErrors.displayName = 'Le pseudo doit contenir au moins 2 caracteres.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Format email invalide.'
    if (password.length < 6) nextErrors.password = 'Minimum 6 caracteres.'
    if (confirmPassword !== password) nextErrors.confirmPassword = 'La confirmation ne correspond pas.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await signUp(email, password, displayName)
      if (useAuthStore.getState().isAuthenticated) {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Inscription impossible.' })
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Connexion Google indisponible.' })
    }
  }

  return (
    <section className="relative flex min-h-[75vh] items-center justify-center py-8">
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface p-7 sm:p-8">
        <div className="mb-6 text-center">
          <img src="/logo-full.svg" alt="ModVF" className="mx-auto mb-8 h-12" />
          <h1 className="text-2xl font-bold">Cree ton compte</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Pseudo" icon={User} value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} required />
          <Input label="Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />

          <div className="relative">
            <Input
              label="Mot de passe"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
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

          <Input
            label="Confirmer le mot de passe"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />

          {errors.form ? <p className="text-sm text-red-300">{errors.form}</p> : null}

          <Button type="submit" isLoading={isLoading}>
            Creer mon compte
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-text-muted">
          <span className="h-px flex-1 bg-white/10" />ou<span className="h-px flex-1 bg-white/10" />
        </div>

        <Button variant="google" onClick={handleGoogle} isLoading={isLoading} icon={<GoogleIcon />}>
          Continuer avec Google
        </Button>

        <p className="mt-6 text-center text-sm text-text-muted">
          Deja un compte ?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </section>
  )
}
