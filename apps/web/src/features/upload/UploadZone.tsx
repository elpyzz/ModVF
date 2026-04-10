import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowDownToLine, CreditCard, FileArchive, LoaderCircle, Upload, WifiOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatFileSize } from '../../lib/utils'
import { useAuthStore } from '../../stores/useAuthStore'
import { useUploadStore } from '../../stores/useUploadStore'
import { FilePreview } from './FilePreview'
import { TranslationComplete } from './TranslationComplete'
import { TranslationProgress } from './TranslationProgress'

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2 Go

function isCreditsError(message: string) {
  return /crédit/i.test(message) || /credit/i.test(message) || message.includes('402')
}

function isNetworkError(message: string) {
  const m = message.toLowerCase()
  return m.includes('réseau') || m.includes('reseau') || m.includes('fetch') || m.includes('network')
}

export function UploadZone() {
  const navigate = useNavigate()
  const profile = useAuthStore((state) => state.profile)
  const session = useAuthStore((state) => state.session)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const uploadState = useUploadStore((state) => state.state)
  const file = useUploadStore((state) => state.file)
  const progress = useUploadStore((state) => state.progress)
  const currentStep = useUploadStore((state) => state.currentStep)
  const translatedStrings = useUploadStore((state) => state.translatedStrings)
  const totalStrings = useUploadStore((state) => state.totalStrings)
  const modsCount = useUploadStore((state) => state.modsCount)
  const completedAt = useUploadStore((state) => state.completedAt)
  const startTime = useUploadStore((state) => state.startTime)
  const downloadCount = useUploadStore((state) => state.downloadCount)
  const maxDownloads = useUploadStore((state) => state.maxDownloads)
  const downloadExpiresAt = useUploadStore((state) => state.downloadExpiresAt)
  const error = useUploadStore((state) => state.error)
  const setState = useUploadStore((state) => state.setState)
  const setFile = useUploadStore((state) => state.setFile)
  const reset = useUploadStore((state) => state.reset)
  const startTranslation = useUploadStore((state) => state.startTranslation)
  const downloadResult = useUploadStore((state) => state.downloadResult)
  const [isDragging, setIsDragging] = useState(false)
  const [activeModpacksCount, setActiveModpacksCount] = useState(0)
  const [billingLoading, setBillingLoading] = useState(false)

  const handleFile = (selected: File | null) => {
    if (!selected) return
    setFile(selected)
    setState('validating')
    useUploadStore.setState({ error: null })

    window.setTimeout(() => {
      const lowerName = selected.name.toLowerCase()
      if (!lowerName.endsWith('.zip') && !lowerName.endsWith('.jar')) {
        useUploadStore.setState({ error: "Format invalide: utilisez un .zip (modpack) ou un .jar (mod)", state: 'error' })
        return
      }
      if (selected.size > MAX_FILE_SIZE) {
        useUploadStore.setState({ error: 'Le fichier depasse la taille maximale (2 Go)', state: 'error' })
        return
      }
      if (selected.size <= 0) {
        useUploadStore.setState({ error: 'Le fichier est vide', state: 'error' })
        return
      }
      setState('ready')
    }, 1300)
  }

  const resetAll = () => {
    reset()
  }

  const durationSeconds =
    completedAt != null && startTime != null
      ? Math.max(0, Math.round((completedAt - startTime) / 1000))
      : null
  const uploadType = file?.name.toLowerCase().endsWith('.jar') ? 'mod' : 'modpack'
  const subscriptionStatus = profile?.subscription_status ?? 'none'
  const subscriptionPlan = profile?.subscription_plan ?? null
  const isActiveSubscriber = subscriptionStatus === 'active'
  const isPastDue = subscriptionStatus === 'past_due'
  const planMaxMap: Record<string, number> = { starter_monthly: 3, pack_monthly: 10, pack_annual: 10 }
  const planNameMap: Record<string, string> = {
    starter_monthly: 'Starter Mensuel',
    pack_monthly: 'Pack Mensuel',
    pack_annual: 'Pack Annuel',
  }
  const planMaxModpacks = subscriptionPlan ? planMaxMap[subscriptionPlan] ?? 0 : 0
  const planLabel = subscriptionPlan ? planNameMap[subscriptionPlan] ?? subscriptionPlan : 'Abonnement'
  const reachedModpackLimit = isActiveSubscriber && uploadType === 'modpack' && planMaxModpacks > 0 && activeModpacksCount >= planMaxModpacks

  useEffect(() => {
    const loadActiveModpacks = async () => {
      if (!isActiveSubscriber || !supabase) {
        setActiveModpacksCount(0)
        return
      }
      const userId = session?.user?.id
      if (!userId) return
      const nowIso = new Date().toISOString()
      const { data, error } = await supabase
        .from('translations')
        .select('id, download_expires_at')
        .eq('user_id', userId)
        .eq('type', 'modpack')
        .eq('status', 'completed')
      if (error) return
      const count = (data ?? []).filter((row) => !row.download_expires_at || row.download_expires_at > nowIso).length
      setActiveModpacksCount(count)
    }
    void loadActiveModpacks()
  }, [isActiveSubscriber, session?.user?.id, uploadState])

  async function handleBillingPortal() {
    if (!session?.access_token || !session?.user?.id) return
    setBillingLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const res = await fetch(apiUrl + '/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ userId: session.user.id }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      }
    } finally {
      setBillingLoading(false)
    }
  }

  return (
    <section className="min-h-[400px] w-full rounded-3xl border border-white/10 bg-surface p-4 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.jar"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <AnimatePresence mode="wait">
        {(uploadState === 'idle' || isDragging) && (
          <motion.button
            key={isDragging ? 'dragover' : 'idle'}
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDragging(true)
            }}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDragging(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDragging(false)
              const files = e.dataTransfer.files
              if (files.length > 0) {
                handleFile(files[0])
              }
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`group flex min-h-[min(400px,70vh)] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-6 text-center transition duration-200 sm:p-8 ${
              isDragging
                ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(108,60,225,0.35)]'
                : 'border-dashed border-white/20 bg-dark/30 hover:border-white/40 hover:bg-surface-light/40'
            }`}
          >
            <div className="pointer-events-none flex flex-col items-center">
              {isDragging ? (
                <ArrowDownToLine className="h-14 w-14 text-primary" />
              ) : (
                <Upload className="h-14 w-14 text-text-muted transition duration-200 group-hover:text-primary" />
              )}
              <p className="mt-6 text-xl font-bold sm:text-2xl">{isDragging ? 'Lache ton fichier ici !' : 'Dépose ton fichier ici'}</p>
              <p className="mt-2 text-sm text-text-muted sm:text-base">ou clique pour parcourir tes fichiers</p>
              <p className="mt-4 text-xs text-text-muted">Déposez votre modpack (.zip) ou mod (.jar) · 2 Go max · 1.18 à 1.21+ · Forge, Fabric, Quilt, NeoForge</p>
            </div>
          </motion.button>
        )}

        {uploadState === 'validating' && file && (
          <motion.div
            key="validating"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex min-h-[400px] flex-col items-center justify-center text-center"
          >
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-5 text-lg font-semibold">
              {uploadType === 'mod' ? 'Vérification du mod...' : 'Vérification du modpack...'}
            </p>
            <p className="mt-2 text-text-muted">{file.name}</p>
            <p className="text-sm text-text-muted">{formatFileSize(file.size)}</p>
          </motion.div>
        )}

        {uploadState === 'ready' && file && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <FilePreview fileName={file.name} fileSize={file.size} onChangeFile={resetAll} />
            <div className="flex justify-center">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  uploadType === 'mod' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                }`}
              >
                {uploadType === 'mod' ? 'Mod individuel' : 'Modpack'}
              </span>
            </div>
            <motion.button
              type="button"
              onClick={() => {
                if (isPastDue) return
                if (reachedModpackLimit) return
                void startTranslation()
              }}
              disabled={isPastDue || reachedModpackLimit}
              className="w-full rounded-xl bg-primary px-5 py-4 text-base font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ animation: 'ctaGlow 4s ease-in-out infinite' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {uploadType === 'mod' ? 'Traduire mon mod' : 'Traduire mon modpack'}
            </motion.button>
            {isPastDue ? (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-center text-sm text-amber-100">
                Votre dernier paiement a échoué. Mettez à jour votre moyen de paiement pour continuer à utiliser votre abonnement.
                <button
                  type="button"
                  onClick={() => void handleBillingPortal()}
                  disabled={billingLoading}
                  className="ml-2 font-semibold text-amber-300 underline-offset-2 hover:underline disabled:opacity-70"
                >
                  {billingLoading ? 'Ouverture...' : 'Mettre à jour mon paiement'}
                </button>
              </div>
            ) : null}
            {reachedModpackLimit ? (
              <p className="text-center text-sm text-amber-300">
                Limite de modpacks atteinte. Supprimez un modpack ou passez au plan supérieur.
              </p>
            ) : null}
            <p className="text-center text-xs text-text-muted">
              ℹ️ Première traduction d&apos;un {uploadType === 'mod' ? 'mod' : 'modpack'} : peut prendre 10 à 30 minutes
              selon la taille.
              <br />
              Les traductions suivantes du même {uploadType === 'mod' ? 'mod' : 'modpack'} seront quasi instantanées
              grâce au cache.
            </p>
            {isActiveSubscriber ? (
              <div className="space-y-1 text-center">
                <p className="text-sm text-emerald-300">
                  Abonné {planLabel} — Mods illimités
                </p>
                {planMaxModpacks > 0 ? (
                  <p className="text-xs text-gray-400">
                    Modpacks : {activeModpacksCount}/{planMaxModpacks}
                  </p>
                ) : null}
                <p className="text-xs text-text-muted">{uploadType === 'mod' ? 'Gratuit' : 'Cout : 1 credit'}</p>
                {uploadType !== 'mod' ? (
                  <p className="text-xs text-text-muted">Sans crédit, l&apos;upload ne se fera jamais.</p>
                ) : null}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-text-muted">{uploadType === 'mod' ? 'Gratuit' : 'Cout : 1 credit'}</p>
                {uploadType !== 'mod' ? (
                  <p className="mt-1 text-xs text-text-muted">Sans crédit, l&apos;upload ne se fera jamais.</p>
                ) : null}
              </div>
            )}
          </motion.div>
        )}

        {uploadState === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TranslationProgress
              progress={progress}
              currentStep={currentStep}
              translatedStrings={translatedStrings}
              totalStrings={totalStrings}
              onCancel={resetAll}
            />
          </motion.div>
        )}

        {uploadState === 'complete' && file && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TranslationComplete
              translatedName={
                uploadType === 'mod'
                  ? `ModVF_${file.name.replace(/\.(zip|jar)$/i, '')}_FR.zip`
                  : file.name.replace(/\.(zip|jar)$/i, '_FR.zip')
              }
              translationType={uploadType}
              translatedStrings={translatedStrings}
              totalStrings={totalStrings}
              durationSeconds={durationSeconds}
              modsCount={modsCount}
              downloadCount={downloadCount}
              maxDownloads={maxDownloads}
              downloadExpiresAt={downloadExpiresAt}
              onDownload={() => void downloadResult()}
              onReset={resetAll}
            />
          </motion.div>
        )}

        {uploadState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[400px]"
          >
            <div className="rounded-2xl border border-white/10 bg-dark/40 p-6 sm:p-8">
              {error === 'credits_insufficient' ? (
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-200">
                    <CreditCard className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">Crédits insuffisants</h3>
                  <p className="mt-2 max-w-sm text-sm text-text-muted">Vous n&apos;avez plus de crédits de traduction.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/tarifs')}
                    className="mt-6 w-full max-w-xs rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-dark transition hover:bg-secondary/90 sm:w-auto"
                  >
                    Acheter des crédits
                  </button>
                  <button type="button" onClick={resetAll} className="mt-3 text-sm text-text-muted hover:text-text">
                    Retour
                  </button>
                </div>
              ) : error && isNetworkError(error) ? (
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/15 text-sky-200">
                    <WifiOff className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">Problème de connexion</h3>
                  <p className="mt-2 max-w-sm text-sm text-text-muted">
                    Verifiez votre connexion internet et reessayez.
                  </p>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="mt-6 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold transition hover:bg-white/15"
                  >
                    Reessayer
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-200">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold">Erreur</h3>
                  <p className="mt-2 max-w-sm text-sm text-text-muted">
                    {error ?? 'Erreur lors de la traduction. Reessaye ou contacte le support.'}
                  </p>
                  {error && isCreditsError(error) ? (
                    <Link
                      to="/tarifs"
                      className="mt-4 text-sm font-semibold text-secondary underline-offset-2 hover:underline"
                    >
                      Voir les offres
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={resetAll}
                    className="mt-6 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold transition hover:bg-white/15"
                  >
                    Reessayer
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {uploadState === 'idle' && (
        <>
          <div className="mt-4 rounded-xl border border-white/10 bg-dark/50 p-3 text-xs text-text-muted">
            Astuce: les gros fichiers peuvent prendre quelques minutes selon leur taille.
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            Première fois ?{' '}
            <a href="/guide" className="text-emerald-400 hover:underline">
              Consultez notre guide →
            </a>
          </p>
        </>
      )}

      {uploadState === 'ready' && file && (
        <div className="mt-4 text-xs text-text-muted">
          <FileArchive className="mr-1 inline h-3.5 w-3.5" /> Pret a traiter: {file.name}
        </div>
      )}
    </section>
  )
}
