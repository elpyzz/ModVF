import { motion } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import { useUploadStore } from '../../stores/useUploadStore'

interface TranslationProgressProps {
  progress: number
  currentStep: string
  translatedStrings: number
  totalStrings: number
  estimatedSecondsRemaining?: number | null
  onCancel: () => void
}

export function TranslationProgress({
  progress,
  currentStep,
  translatedStrings,
  totalStrings,
  onCancel,
}: TranslationProgressProps) {
  const file = useUploadStore((s) => s.file)
  const fileSizeMB = file ? file.size / (1024 * 1024) : 0
  const isMod = file?.name.toLowerCase().endsWith('.jar') ?? false
  const largePack = fileSizeMB > 100
  const pct = Math.max(0, Math.min(100, progress))

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-medium leading-relaxed text-text">{currentStep}</p>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-dark">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-secondary shadow-[0_0_20px_rgba(108,60,225,0.5)] transition-[width] duration-500 ease-in-out [animation:progressPulse_2.2s_ease-in-out_infinite]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-end">
        <span className="text-sm font-semibold tabular-nums text-text-muted">{Math.round(pct)}%</span>
      </div>

      {totalStrings > 0 ? (
        <motion.p
          key={translatedStrings}
          initial={{ opacity: 0.65, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center text-sm tabular-nums text-text-muted"
        >
          {translatedStrings.toLocaleString('fr-FR')} / {totalStrings.toLocaleString('fr-FR')} strings traduites
        </motion.p>
      ) : null}

      <div className="space-y-2 border-t border-white/5 pt-4 text-xs leading-relaxed text-text-muted">
        <p>⏳ Ne fermez pas cette page. La traduction peut prendre plusieurs minutes.</p>
        {largePack && !isMod ? <p>Modpack volumineux détecté, comptez 10-15 minutes.</p> : null}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="w-full text-center text-sm text-text-muted transition hover:text-text"
      >
        Annuler
      </button>
    </div>
  )
}
