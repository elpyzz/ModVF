import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowDownToLine, CreditCard, FileArchive, LoaderCircle, Upload, WifiOff } from 'lucide-react'
import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatFileSize } from '../../lib/utils'
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

  return (
    <section className="min-h-[400px] w-full rounded-xl border border-white/5 bg-surface p-4 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.jar"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <AnimatePresence mode="wait">
        {(uploadState === 'idle' || uploadState === 'dragover') && (
          <motion.button
            key={uploadState}
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setState('dragover')
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setState('idle')
            }}
            onDrop={(e) => {
              e.preventDefault()
              setState('idle')
              handleFile(e.dataTransfer.files?.[0] ?? null)
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`group flex min-h-[min(400px,70vh)] w-full cursor-pointer flex-col items-center justify-center rounded-xl border p-6 text-center transition-colors duration-200 sm:p-8 ${
              uploadState === 'dragover'
                ? 'border-primary/50 bg-primary/5'
                : 'border-white/10 bg-surface hover:border-primary/35'
            }`}
          >
            {uploadState === 'dragover' ? (
              <ArrowDownToLine className="h-10 w-10 text-primary" strokeWidth={1.25} />
            ) : (
              <Upload className="h-10 w-10 text-text-muted transition-colors duration-200 group-hover:text-primary" strokeWidth={1.25} />
            )}
            <p className="mt-6 text-xl font-bold sm:text-2xl">
              {uploadState === 'dragover' ? 'Lache ton fichier ici !' : 'Dépose ton fichier ici'}
            </p>
            <p className="mt-2 text-sm text-text-muted sm:text-base">ou clique pour parcourir tes fichiers</p>
            <p className="mt-4 text-xs text-text-muted">Déposez votre modpack (.zip) ou mod (.jar) · 2 Go max · 1.18 à 1.21+ · Forge, Fabric, Quilt, NeoForge</p>
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
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" strokeWidth={1.25} />
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
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                  uploadType === 'mod'
                    ? 'border-primary/25 bg-primary/10 text-primary'
                    : 'border-white/10 bg-white/[0.04] text-text-muted'
                }`}
              >
                {uploadType === 'mod' ? 'Mod individuel' : 'Modpack'}
              </span>
            </div>
            <motion.button
              type="button"
              onClick={() => void startTranslation()}
              className="w-full rounded-xl bg-primary px-5 py-4 text-base font-semibold text-dark transition hover:bg-primary/90"
            >
              {uploadType === 'mod' ? 'Traduire mon mod' : 'Traduire mon modpack'}
            </motion.button>
            <p className="text-center text-xs text-text-muted">
              ℹ️ Première traduction d&apos;un {uploadType === 'mod' ? 'mod' : 'modpack'} : peut prendre 10 à 30 minutes
              selon la taille.
              <br />
              Les traductions suivantes du même {uploadType === 'mod' ? 'mod' : 'modpack'} seront quasi instantanées
              grâce au cache.
            </p>
            <p className="text-center text-sm text-text-muted">{uploadType === 'mod' ? 'Gratuit' : 'Cout : 1 credit'}</p>
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
            <div className="rounded-xl border border-white/5 bg-surface p-6 sm:p-8">
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
                    className="mt-6 w-full max-w-xs rounded-xl bg-purchase px-4 py-3 text-sm font-semibold text-white transition hover:bg-purchase/90 sm:w-auto"
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
                      className="mt-4 text-sm font-semibold text-primary underline-offset-2 hover:underline"
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
          <div className="mt-4 rounded-xl border border-white/5 border-l-4 border-l-primary/50 bg-surface p-3 text-xs text-text-muted">
            Astuce: les gros fichiers peuvent prendre quelques minutes selon leur taille.
          </div>
          <p className="mt-3 text-center text-sm text-text-muted">
            <Link to="/guide" className="text-primary underline-offset-2 transition hover:text-primary/90 hover:underline">
              Première fois ? Consultez notre guide →
            </Link>
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
