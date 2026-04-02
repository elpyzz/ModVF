import { motion } from 'framer-motion'

interface TranslationProgressProps {
  progress: number
  currentStep: string
  translatedStrings: number
  totalStrings: number
  estimatedSecondsRemaining: number | null
  onCancel: () => void
}

function formatEta(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return 'Estimation en cours...'
  if (seconds < 60) return `~${seconds} s restantes`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `~${m} min ${s} s restantes`
}

export function TranslationProgress({
  progress,
  currentStep,
  translatedStrings,
  totalStrings,
  estimatedSecondsRemaining,
  onCancel,
}: TranslationProgressProps) {
  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-surface p-6">
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold">{currentStep}</p>
        <p className="text-text-muted">{Math.round(progress)}%</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-dark">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          animate={{ width: `${progress}%`, opacity: [0.85, 1, 0.85] }}
          transition={{ width: { duration: 0.2 }, opacity: { repeat: Number.POSITIVE_INFINITY, duration: 1.2 } }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
        <p>
          {translatedStrings.toLocaleString('fr-FR')} / {totalStrings.toLocaleString('fr-FR')} strings traduites
        </p>
        <p>{formatEta(estimatedSecondsRemaining)}</p>
      </div>

      <button type="button" onClick={onCancel} className="text-sm text-text-muted transition hover:text-text">
        Annuler
      </button>
    </div>
  )
}
