import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowDownToLine, FileArchive, LoaderCircle, Upload } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { formatFileSize } from '../../lib/utils'
import { useHistoryStore } from '../../stores/useHistoryStore'
import { useUploadStore } from '../../stores/useUploadStore'
import { FilePreview } from './FilePreview'
import { TranslationComplete } from './TranslationComplete'
import { TranslationProgress } from './TranslationProgress'

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2 Go

function getStep(progress: number): string {
  if (progress < 15) return '📦 Extraction du modpack...'
  if (progress < 30) return '🔍 Analyse des fichiers...'
  if (progress < 85) return '🌐 Traduction en cours...'
  if (progress < 95) return '🔧 Reconstruction du modpack...'
  if (progress < 100) return '✅ Finalisation...'
  return '✅ Termine !'
}

export function UploadZone() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const processingStarted = useRef(false)
  const {
    state,
    file,
    progress,
    currentStep,
    translatedStrings,
    totalStrings,
    error,
    setState,
    setFile,
    setProgress,
    setCurrentStep,
    setTranslationStats,
    setError,
    reset,
  } = useUploadStore()
  const addTranslation = useHistoryStore((store) => store.addTranslation)

  const handleFile = (selected: File | null) => {
    if (!selected) return
    setFile(selected)
    setState('validating')
    setError(null)

    window.setTimeout(() => {
      const lowerName = selected.name.toLowerCase()
      if (!lowerName.endsWith('.zip')) {
        setError("Ce fichier n'est pas un ZIP valide")
        setState('error')
        return
      }
      if (selected.size > MAX_FILE_SIZE) {
        setError('Le fichier depasse la taille maximale (2 Go)')
        setState('error')
        return
      }
      if (selected.size <= 0) {
        setError('Le fichier est vide')
        setState('error')
        return
      }
      setState('ready')
    }, 1300)
  }

  useEffect(() => {
    if (state !== 'processing' || processingStarted.current) return
    processingStarted.current = true
    setProgress(0)
    setCurrentStep(getStep(0))
    setTranslationStats(0, 4500)

    const timer = window.setInterval(() => {
      useUploadStore.setState((store) => {
        let inc = 2.4
        if (store.progress < 15) inc = 4.5
        else if (store.progress < 30) inc = 2.3
        else if (store.progress < 85) inc = 0.6 + Math.random() * 0.9
        else if (store.progress < 95) inc = 1.8
        else inc = 3.2

        const next = Math.min(100, store.progress + inc)
        const nextStep = getStep(next)
        const translated = Math.min(store.totalStrings, Math.round((next / 100) * store.totalStrings))

        return {
          progress: next,
          currentStep: nextStep,
          translatedStrings: translated,
        }
      })
    }, 200)

    const finisher = window.setInterval(() => {
      const s = useUploadStore.getState()
      if (s.progress >= 100) {
        window.clearInterval(timer)
        window.clearInterval(finisher)
        window.setTimeout(() => {
          if (file) {
            addTranslation({
              id: crypto.randomUUID(),
              fileName: file.name,
              translatedAt: new Date(),
              totalStrings: s.totalStrings,
              status: 'translated',
            })
          }

          useUploadStore.setState({
            state: 'complete',
            downloadUrl: '/downloads/modpack-fr.zip',
            currentStep: '✅ Termine !',
          })
          processingStarted.current = false
        }, 500)
      }
    }, 120)

    return () => {
      window.clearInterval(timer)
      window.clearInterval(finisher)
      processingStarted.current = false
    }
  }, [addTranslation, file, setCurrentStep, setProgress, setTranslationStats, state])

  const startProcessing = () => {
    setState('processing')
  }

  const resetAll = () => {
    processingStarted.current = false
    reset()
  }

  return (
    <section className="min-h-[400px] rounded-3xl border border-white/10 bg-surface p-6 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      <AnimatePresence mode="wait">
        {(state === 'idle' || state === 'dragover') && (
          <motion.button
            key={state}
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
            className={`group flex min-h-[400px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-8 text-center transition duration-200 ${
              state === 'dragover'
                ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(108,60,225,0.35)]'
                : 'border-dashed border-white/20 bg-dark/30 hover:border-white/40 hover:bg-surface-light/40'
            }`}
          >
            {state === 'dragover' ? (
              <ArrowDownToLine className="h-14 w-14 text-primary" />
            ) : (
              <Upload className="h-14 w-14 text-text-muted transition duration-200 group-hover:text-primary" />
            )}
            <p className="mt-6 text-2xl font-bold">
              {state === 'dragover' ? 'Lache ton modpack ici !' : 'Depose ton modpack ici'}
            </p>
            <p className="mt-2 text-text-muted">ou clique pour parcourir tes fichiers</p>
            <p className="mt-4 text-xs text-text-muted">ZIP uniquement · 2 Go max · Forge, Fabric, Quilt, NeoForge</p>
          </motion.button>
        )}

        {state === 'validating' && file && (
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

        {state === 'ready' && file && (
          <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <FilePreview fileName={file.name} fileSize={file.size} onChangeFile={resetAll} />
            <button
              type="button"
              onClick={startProcessing}
              className="w-full rounded-xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(108,60,225,0.5)] transition hover:bg-primary/90"
            >
              🚀 Traduire mon modpack
            </button>
            <p className="text-center text-sm text-text-muted">Cout : 1 credit</p>
          </motion.div>
        )}

        {state === 'processing' && (
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

        {state === 'complete' && file && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TranslationComplete translatedName={file.name.replace(/\.zip$/i, '_FR.zip')} onReset={resetAll} />
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[400px]">
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6">
              <div className="flex items-center gap-3 text-red-200">
                <AlertTriangle className="h-6 w-6" />
                <p className="font-semibold">{error ?? 'Erreur lors de la traduction. Reessaye ou contacte le support.'}</p>
              </div>
              <button type="button" onClick={resetAll} className="mt-5 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15">
                Reessayer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {state === 'idle' && (
        <div className="mt-4 rounded-xl border border-white/10 bg-dark/50 p-3 text-xs text-text-muted">
          Astuce: les modpacks volumineux peuvent prendre quelques minutes selon le nombre de mods.
        </div>
      )}

      {state === 'ready' && file && (
        <div className="mt-4 text-xs text-text-muted">
          <FileArchive className="mr-1 inline h-3.5 w-3.5" /> Pret a traiter: {file.name}
        </div>
      )}
    </section>
  )
}
