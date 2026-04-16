import { useCallback, useEffect, useMemo, useState } from 'react'
import { BadgeCheck, CircleDollarSign, Copy, Users } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { useToastStore } from '../stores/useToastStore'

type SettingsTab = 'profil' | 'abonnement' | 'credits' | 'historique' | 'securite' | 'parrainage'

type HistoryItem = {
  id: string
  file_name: string
  type?: 'mod' | 'modpack'
  status: string
  created_at: string
  download_expires_at: string | null
}

type ExtendedProfile = {
  email?: string
  display_name?: string
  avatar_url?: string | null
  credits?: number
  credits_purchased?: number
  subscription_status?: string | null
  subscription_plan?: string | null
  subscription_current_period_end?: string | null
}

const tabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'profil', label: 'Profil' },
  { id: 'abonnement', label: 'Abonnement' },
  { id: 'credits', label: 'Crédits' },
  { id: 'historique', label: 'Historique' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'parrainage', label: 'Parrainage' },
]

const planLabels: Record<string, string> = {
  starter_monthly: 'Starter Mensuel',
  pack_monthly: 'Pack Mensuel',
  pack_annual: 'Pack Annuel',
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const profileExt = (profile ?? {}) as ExtendedProfile
  const signOut = useAuthStore((s) => s.signOut)
  const addToast = useToastStore((s) => s.addToast)

  const [activeTab, setActiveTab] = useState<SettingsTab>('profil')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [referralLoading, setReferralLoading] = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [totalReferred, setTotalReferred] = useState(0)
  const [totalConverted, setTotalConverted] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [copySuccess, setCopySuccess] = useState(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  const subscriptionStatus = profileExt.subscription_status ?? 'none'
  const periodEnd = profileExt.subscription_current_period_end ? new Date(profileExt.subscription_current_period_end) : null
  const periodEndLabel = periodEnd
    ? periodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const planLabel = profileExt.subscription_plan ? planLabels[profileExt.subscription_plan] || profileExt.subscription_plan : '—'

  const avatarUrl =
    profileExt.avatar_url ||
    (typeof user?.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null) ||
    null
  const email = user?.email || profileExt.email || '—'
  const initials = (profileExt.display_name || user?.email || 'U').slice(0, 1).toUpperCase()
  const createdAtLabel = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const provider = (user?.app_metadata?.provider as string | undefined) || ''
  const isGoogleAuth = provider === 'google'

  const canUpdatePassword = password.length >= 8 && password === confirmPassword

  const canDownload = (row: HistoryItem) => {
    if (row.status !== 'completed') return false
    if (!row.download_expires_at) return true
    return new Date(row.download_expires_at) > new Date()
  }

  const sortedHistory = useMemo(
    () =>
      [...history].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [history],
  )

  const loadHistory = useCallback(async () => {
    if (!session?.access_token) return
    setHistoryLoading(true)
    try {
      const items = await api.getTranslationHistory(session.access_token)
      setHistory(items as HistoryItem[])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    document.title = 'Paramètres — ModVF'
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  useEffect(() => {
    const loadReferral = async () => {
      if (activeTab !== 'parrainage' || !session?.access_token) return
      setReferralLoading(true)
      try {
        const codeData = await api.getReferralCode(session.access_token)
        const statsData = await api.getReferralStats(session.access_token)
        setReferralCode(statsData.code ?? codeData.code)
        setReferralLink(statsData.link ?? codeData.link)
        setTotalReferred(statsData.totalReferred ?? 0)
        setTotalConverted(statsData.totalConverted ?? 0)
        setTotalEarnings(statsData.totalEarnings ?? 0)
      } catch {
        addToast('error', 'Impossible de charger les informations de parrainage.')
      } finally {
        setReferralLoading(false)
      }
    }
    void loadReferral()
  }, [activeTab, session?.access_token, addToast])

  if (!user || !session) return <Navigate to="/login" replace />

  async function openBillingPortal() {
    if (!session?.access_token || !user?.id) return
    setBillingLoading(true)
    try {
      const res = await fetch(apiUrl + '/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        addToast('error', data?.error || "Impossible d'ouvrir l'espace abonnement.")
      }
    } catch {
      addToast('error', 'Erreur de connexion.')
    } finally {
      setBillingLoading(false)
    }
  }

  async function handleChangePassword() {
    if (!supabase) return
    if (!canUpdatePassword) {
      addToast('error', 'Le mot de passe doit contenir 8 caractères minimum et correspondre à la confirmation.')
      return
    }
    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        addToast('error', error.message)
        return
      }
      setPassword('')
      setConfirmPassword('')
      addToast('success', 'Mot de passe mis à jour.')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleDownload(item: HistoryItem) {
    if (!session?.access_token || !canDownload(item)) return
    setDownloadingId(item.id)
    try {
      const blob = await api.downloadModpack(item.id, session.access_token)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const baseName = item.file_name.replace(/\.(zip|jar)$/i, '')
      a.href = url
      a.download = item.type === 'mod' ? `ModVF_${baseName}_FR.zip` : `${baseName}_FR.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      addToast('error', 'Téléchargement impossible.')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleCopyReferralLink() {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      window.setTimeout(() => setCopySuccess(false), 2000)
    } catch {
      addToast('error', 'Impossible de copier le lien.')
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Paramètres du compte</h1>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <nav className="rounded-2xl border border-white/10 bg-surface p-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeTab === tab.id ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm ${
                  activeTab === tab.id
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-white/10 bg-surface text-text-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'profil' && (
            <div className="rounded-2xl border border-white/10 bg-surface p-6">
              <h2 className="text-lg font-semibold">Profil</h2>
              <div className="mt-4 flex items-center gap-4">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
                    {initials}
                  </div>
                )}
                <div className="text-sm text-text-muted">
                  <p>
                    <span className="font-medium text-white">Email :</span> {email}
                  </p>
                  <p className="mt-1">
                    <span className="font-medium text-white">Compte créé le :</span> {createdAtLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
              >
                Se déconnecter
              </button>
            </div>
          )}

          {activeTab === 'abonnement' && (
            <div className="rounded-2xl border border-white/10 bg-surface p-6">
              <h2 className="text-lg font-semibold">Abonnement</h2>
              {subscriptionStatus === 'active' ? (
                <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-200">
                    {planLabel} <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs">Actif</span>
                  </p>
                  <p className="mt-1 text-sm text-emerald-100/90">Prochain renouvellement : {periodEndLabel}</p>
                  <button
                    type="button"
                    disabled={billingLoading}
                    onClick={() => void openBillingPortal()}
                    className="mt-4 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-dark hover:bg-emerald-300 disabled:opacity-70"
                  >
                    {billingLoading ? 'Ouverture...' : 'Gérer mon abonnement'}
                  </button>
                </div>
              ) : subscriptionStatus === 'past_due' ? (
                <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                  <p className="text-sm font-semibold text-amber-200">Votre paiement a échoué</p>
                  <p className="mt-1 text-sm text-amber-100/90">
                    Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour continuer à utiliser votre abonnement.
                  </p>
                  <button
                    type="button"
                    disabled={billingLoading}
                    onClick={() => void openBillingPortal()}
                    className="mt-4 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-dark hover:bg-amber-300 disabled:opacity-70"
                  >
                    {billingLoading ? 'Ouverture...' : 'Mettre à jour mon paiement'}
                  </button>
                </div>
              ) : subscriptionStatus === 'canceled' ? (
                periodEnd && periodEnd > new Date() ? (
                  <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                    <p className="text-sm font-semibold text-amber-200">
                      <span className="mr-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs">Annulé</span>
                    </p>
                    <p className="mt-2 text-sm text-amber-100/90">
                      Votre abonnement a été annulé. Accès actif jusqu&apos;au {periodEndLabel}
                    </p>
                    <Link
                      to="/pricing"
                      className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Se réabonner
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-white/10 bg-dark/40 p-4">
                    <p className="text-sm font-semibold text-white">Votre abonnement a été annulé.</p>
                    <Link
                      to="/pricing"
                      className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Se réabonner
                    </Link>
                  </div>
                )
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-dark/40 p-4">
                  <p className="text-sm text-text-muted">Aucun abonnement actif</p>
                  <Link
                    to="/pricing"
                    className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                  >
                    Découvrir les abonnements
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="rounded-2xl border border-white/10 bg-surface p-6">
              <h2 className="text-lg font-semibold">Crédits</h2>
              <div className="mt-4 space-y-2 text-sm text-text-muted">
                <p>
                  Crédits restants : <span className="font-semibold text-white">{profileExt.credits ?? 0}</span>
                </p>
                <p>
                  Crédits achetés au total :{' '}
                  <span className="font-semibold text-white">{profileExt.credits_purchased ?? 0}</span>
                </p>
              </div>
              <Link
                to="/pricing#credits"
                className="mt-4 inline-flex rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-dark hover:bg-secondary/90"
              >
                Acheter des crédits
              </Link>
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="rounded-2xl border border-white/10 bg-surface p-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Historique de traductions</h2>
                <button
                  type="button"
                  onClick={() => void loadHistory()}
                  disabled={historyLoading}
                  className="inline-flex items-center gap-1 rounded p-1 text-xs text-text-muted transition hover:bg-gray-700/50 hover:text-text disabled:opacity-60"
                  aria-label="Rafraîchir l'historique"
                  title="Rafraîchir"
                >
                  <svg
                    className={`h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path
                      d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Rafraîchir
                </button>
              </div>
              {historyLoading ? <p className="mt-3 text-sm text-text-muted">Chargement...</p> : null}
              {!historyLoading && sortedHistory.length === 0 ? (
                <p className="mt-3 text-sm text-text-muted">
                  Vous n&apos;avez pas encore de traduction. Commencez maintenant !
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sortedHistory.map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-dark/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.file_name}</p>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-text-muted">
                          {item.type === 'mod' ? 'mod' : 'modpack'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">
                        {new Date(item.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">Statut : {item.status}</p>
                      {canDownload(item) ? (
                        <button
                          type="button"
                          disabled={downloadingId === item.id}
                          onClick={() => void handleDownload(item)}
                          className="mt-3 rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-70"
                        >
                          {downloadingId === item.id ? 'Téléchargement...' : 'Télécharger'}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'securite' && (
            <div className="rounded-2xl border border-white/10 bg-surface p-6">
              <h2 className="text-lg font-semibold">Sécurité</h2>
              {isGoogleAuth ? (
                <p className="mt-4 text-sm text-text-muted">
                  Compte connecté via Google — le mot de passe est géré par Google.
                </p>
              ) : (
                <div className="mt-4 max-w-md space-y-3">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full rounded-xl border border-white/10 bg-dark/40 px-4 py-2 text-sm text-white outline-none focus:border-primary/50"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le nouveau mot de passe"
                    className="w-full rounded-xl border border-white/10 bg-dark/40 px-4 py-2 text-sm text-white outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    disabled={!canUpdatePassword || passwordLoading}
                    onClick={() => void handleChangePassword()}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
                  >
                    {passwordLoading ? 'Mise à jour...' : 'Changer mon mot de passe'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'parrainage' && (
            <div className="rounded-2xl border border-white/10 bg-surface p-6">
              <h2 className="text-lg font-semibold">Programme de parrainage</h2>
              <p className="mt-1 text-sm text-text-muted">
                Gagnez 25% de commission sur chaque vente générée par votre lien !
              </p>

              {referralLoading ? (
                <p className="mt-4 text-sm text-text-muted">Chargement...</p>
              ) : (
                <>
                  <div className="mt-4">
                    <label className="mb-2 block text-xs uppercase tracking-wide text-text-muted">Votre lien de parrainage</label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        readOnly
                        value={referralLink || (referralCode ? `https://modvf.fr/?ref=${referralCode}` : '')}
                        className="w-full rounded-xl border border-white/10 bg-dark/40 px-4 py-2 text-sm text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleCopyReferralLink()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                      >
                        <Copy className="h-4 w-4" />
                        {copySuccess ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-dark/40 p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
                        <Users className="h-4 w-4" /> Filleuls
                      </p>
                      <p className="mt-2 text-2xl font-bold">{totalReferred}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-dark/40 p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
                        <BadgeCheck className="h-4 w-4" /> Conversions
                      </p>
                      <p className="mt-2 text-2xl font-bold">{totalConverted}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-dark/40 p-4">
                      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-text-muted">
                        <CircleDollarSign className="h-4 w-4" /> Gains
                      </p>
                      <p className="mt-2 text-2xl font-bold">{totalEarnings.toFixed(2)}€</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">💰 Comment récupérer mes gains ?</p>
                    <p className="mt-2 text-sm leading-relaxed text-blue-800">
                      Vos commissions s&apos;accumulent automatiquement à chaque achat de vos filleuls. Dès que votre
                      solde atteint 10€, vous pouvez demander un versement par virement bancaire ou PayPal en nous
                      contactant à modvf.contact@gmail.com. Les versements sont traités sous 7 jours ouvrés.
                    </p>
                    <p className="mt-2 text-xs text-blue-700">
                      Commission : 25% sur chaque vente · Minimum de versement : 10€ · Validité : illimitée
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

