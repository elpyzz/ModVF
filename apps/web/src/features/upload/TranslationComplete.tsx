import { motion } from 'framer-motion'

interface TranslationCompleteProps {
  translatedName: string
  totalStrings: number
  durationSeconds: number | null
  onDownload: () => void
  onReset: () => void
}

export function TranslationComplete({
  translatedName,
  totalStrings,
  durationSeconds,
  onDownload,
  onReset,
}: TranslationCompleteProps) {
  const durationLabel =
    durationSeconds !== null && durationSeconds >= 0
      ? `${Math.floor(durationSeconds / 60)} min ${durationSeconds % 60} s`
      : '—'

  return (
    <div className="space-y-5 rounded-2xl border border-secondary/30 bg-surface p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 text-secondary"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary/15">✓</span>
        <p className="font-semibold">Modpack traduit avec succes !</p>
      </motion.div>

      <div className="rounded-xl border border-white/10 bg-dark/70 p-4 text-sm">
        <p className="font-medium">{translatedName}</p>
        <p className="mt-2 text-text-muted">
          {totalStrings.toLocaleString('fr-FR')} strings traduites · duree {durationLabel}
        </p>
      </div>

      <button
        type="button"
        onClick={onDownload}
        className="w-full rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-dark shadow-[0_0_24px_rgba(0,212,170,0.45)] transition hover:bg-secondary/90"
      >
        Telecharger le modpack traduit
      </button>
      <p className="text-center text-xs text-text-muted">Lien valide 24h · 3 telechargements max</p>

      <button type="button" onClick={onReset} className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm">
        Traduire un autre modpack
      </button>
    </div>
  )
}
