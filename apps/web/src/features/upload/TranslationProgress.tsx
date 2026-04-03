import { useUploadStore } from '../../stores/useUploadStore'

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

function buildMainLine(
  progress: number,
  jobId: string | null,
  uploadProgress: number,
  fileSize: number,
  translatedStrings: number,
  totalStrings: number,
): string {
  if (progress >= 100) return '✅ Terminé !'
  if (!jobId) {
    const mo = Math.round(fileSize / 1048576)
    return `📤 Upload en cours... ${uploadProgress}% (${mo} Mo)`
  }
  return `🌐 Traduction en cours... ${translatedStrings.toLocaleString('fr-FR')} / ${totalStrings.toLocaleString('fr-FR')} strings`
}

export function TranslationProgress({
  progress,
  currentStep: _currentStep,
  translatedStrings,
  totalStrings,
  estimatedSecondsRemaining,
  onCancel,
}: TranslationProgressProps) {
  const jobId = useUploadStore((s) => s.jobId)
  const uploadProgress = useUploadStore((s) => s.uploadProgress)
  const file = useUploadStore((s) => s.file)
  const fileSize = file?.size ?? 0

  const mainLine = buildMainLine(progress, jobId, uploadProgress, fileSize, translatedStrings, totalStrings)

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-surface p-6">
      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold">{mainLine}</p>
        <p className="text-text-muted">{Math.round(progress)}%</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-dark">
        <div
          className="h-full animate-pulse bg-gradient-to-r from-primary to-secondary shadow-[0_0_18px_rgba(108,60,225,0.45)] transition-[width] duration-500 ease-in-out"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
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
