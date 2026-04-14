import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, isLoading, isAuthenticated } = useAuthStore()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Inscription — ModVF'
  }, [])

  useEffect(() => {
    if (isAuthenticated && !signupSuccess) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate, signupSuccess])

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
      setSignupEmail(email)
      setSignupSuccess(true)
      setResendMessage(null)
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Inscription impossible.' })
    }
  }

  async function handleResendEmail() {
    if (!supabase || !signupEmail) return
    setResendLoading(true)
    setResendMessage(null)
    const { error } = await supabase.auth.resend({ type: 'signup', email: signupEmail })
    if (error) {
      setResendMessage("Impossible de renvoyer l'email pour le moment. Réessayez dans quelques instants.")
    } else {
      setResendMessage(`Email renvoyé à ${signupEmail}.`)
    }
    setResendLoading(false)
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
        {signupSuccess ? (
          <div className="text-center">
            <img src="/logo-full.svg" alt="ModVF" className="mx-auto mb-8 h-12" />
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold">Vérifiez votre boîte mail 📬</h1>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              On vous a envoyé un email de confirmation à <span className="font-semibold text-white">{signupEmail}</span>.
              Cliquez sur le lien dans l&apos;email pour activer votre compte et accéder à votre première traduction gratuite.
            </p>
            <p className="mt-3 text-xs text-text-muted/90">
              Vous ne trouvez pas l&apos;email ? Vérifiez vos spams ou attendez quelques secondes.
            </p>

            <button
              type="button"
              onClick={() => void handleResendEmail()}
              disabled={resendLoading}
              className="mt-6 w-full rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/10 disabled:opacity-70"
            >
              {resendLoading ? 'Envoi en cours...' : "Renvoyer l'email"}
            </button>
            {resendMessage ? <p className="mt-3 text-xs text-text-muted">{resendMessage}</p> : null}

            <p className="mt-6 text-sm text-text-muted">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                J&apos;ai déjà confirmé → Se connecter
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <img src="/logo-full.svg" alt="ModVF" className="mx-auto mb-8 h-12" />
              <h1 className="text-2xl font-bold">Cree ton compte</h1>
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

            <p className="mt-6 text-center text-sm text-text-muted">
              Deja un compte ?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  )
}
