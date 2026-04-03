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
  const processingStartedAt = useUploadStore((state) => state.processingStartedAt)
  const completedAt = useUploadStore((state) => state.completedAt)
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
      if (!lowerName.endsWith('.zip')) {
        useUploadStore.setState({ error: "Ce fichier n'est pas un ZIP valide", state: 'error' })
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
    completedAt && processingStartedAt ? Math.max(0, Math.round((completedAt - processingStartedAt) / 1000)) : null

  return (
    <section className="min-h-[400px] w-full rounded-3xl border border-white/10 bg-surface p-4 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
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
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`group flex min-h-[min(400px,70vh)] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-6 text-center transition duration-200 sm:p-8 ${
              uploadState === 'dragover'
                ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(108,60,225,0.35)]'
                : 'border-dashed border-white/20 bg-dark/30 hover:border-white/40 hover:bg-surface-light/40'
            }`}
          >
            {uploadState === 'dragover' ? (
              <ArrowDownToLine className="h-14 w-14 text-primary" />
            ) : (
              <Upload className="h-14 w-14 text-text-muted transition duration-200 group-hover:text-primary" />
            )}
            <p className="mt-6 text-xl font-bold sm:text-2xl">
              {uploadState === 'dragover' ? 'Lache ton modpack ici !' : 'Depose ton modpack ici'}
            </p>
            <p className="mt-2 text-sm text-text-muted sm:text-base">ou clique pour parcourir tes fichiers</p>
            <p className="mt-4 text-xs text-text-muted">ZIP uniquement · 2 Go max · Forge, Fabric, Quilt, NeoForge</p>
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
            <p className="mt-5 text-lg font-semibold">Verification du modpack...</p>
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
            <motion.button
              type="button"
              onClick={() => void startTranslation()}
              className="w-full rounded-xl bg-primary px-5 py-4 text-base font-semibold text-white transition hover:bg-primary/90"
              style={{ animation: 'ctaGlow 4s ease-in-out infinite' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Traduire mon modpack
            </motion.button>
            <p className="text-center text-sm text-text-muted">Cout : 1 credit</p>
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
              translatedName={file.name.replace(/\.zip$/i, '_FR.zip')}
              translatedStrings={translatedStrings}
              totalStrings={totalStrings}
              durationSeconds={durationSeconds}
              modsCount={modsCount}
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
        <div className="mt-4 rounded-xl border border-white/10 bg-dark/50 p-3 text-xs text-text-muted">
          Astuce: les modpacks volumineux peuvent prendre quelques minutes selon le nombre de mods.
        </div>
      )}

      {uploadState === 'ready' && file && (
        <div className="mt-4 text-xs text-text-muted">
          <FileArchive className="mr-1 inline h-3.5 w-3.5" /> Pret a traiter: {file.name}
        </div>
      )}
    </section>
  )
}
