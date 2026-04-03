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

function getStepMessage(progress: number, currentStep: string): string {
  if (progress <= 5) return '📤 Upload du modpack...'
  if (progress <= 10) return '📦 Extraction du modpack...'
  if (progress <= 15) return '🔍 Analyse des fichiers...'
  if (progress <= 89) return '🌐 Traduction en cours...'
  if (progress <= 95) return '🔧 Reconstruction du modpack...'
  if (progress >= 100) return '✅ Terminé !'
  return currentStep || 'Traitement...'
}

export function TranslationProgress({
  progress,
  currentStep,
  translatedStrings,
  totalStrings,
  estimatedSecondsRemaining,
  onCancel,
}: TranslationProgressProps) {
  const stepMessage = getStepMessage(progress, currentStep)

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-surface p-6">
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold">
          {stepMessage} {Math.round(progress)}%
        </p>
        <p className="text-text-muted">{Math.round(progress)}%</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-dark">
        <div
          className="h-full animate-pulse bg-gradient-to-r from-primary to-secondary shadow-[0_0_18px_rgba(108,60,225,0.45)] transition-[width] duration-500 ease-in-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
        {progress > 15 && totalStrings > 0 && (
          <p>
            {translatedStrings.toLocaleString('fr-FR')} / {totalStrings.toLocaleString('fr-FR')} strings traduites
          </p>
        )}
        <p>{formatEta(estimatedSecondsRemaining)}</p>
      </div>

      <div className="space-y-1 text-xs italic text-text-muted">
        <p>⏳ La traduction peut prendre plusieurs minutes selon la taille du modpack. Ne fermez pas cette page.</p>
        {totalStrings > 10000 && <p>Ce modpack est volumineux, comptez environ 10-15 minutes.</p>}
      </div>

      <button type="button" onClick={onCancel} className="text-sm text-text-muted transition hover:text-text">
        Annuler
      </button>
    </div>
  )
}
