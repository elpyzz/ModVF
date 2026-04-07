import { motion } from 'framer-motion'
import { Download, LoaderCircle } from 'lucide-react'
import { useUploadStore } from '../../stores/useUploadStore'

const MotionPath = motion.path

interface TranslationCompleteProps {
  translatedName: string
  translationType: 'mod' | 'modpack'
  translatedStrings: number
  totalStrings: number
  durationSeconds: number | null
  modsCount: number | null
  downloadCount: number
  maxDownloads: number
  downloadExpiresAt: string | null
  onDownload: () => void | Promise<void>
  onReset: () => void
}

function formatDuration(totalSec: number | null): string {
  if (totalSec === null || totalSec < 0) return '—'
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m <= 0) return `${s} s`
  return `${m} min ${s} s`
}

function formatExpireHours(iso: string | null): string {
  if (!iso) return '24 h'
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return '0 h'
  const hours = Math.floor(ms / (60 * 60 * 1000))
  if (hours <= 0) return "moins d'1 h"
  return `${hours} h`
}

function formatDownloadLimitsLine(downloadCount: number, maxDownloads: number, downloadExpiresAt: string | null): string {
  const remaining = Math.max(0, maxDownloads - downloadCount)
  const hoursLabel = formatExpireHours(downloadExpiresAt)
  if (remaining === 0) {
    return `📥 Limite de téléchargements atteinte · Expire dans ${hoursLabel}`
  }
  const noun = remaining === 1 ? 'téléchargement' : 'téléchargements'
  if (downloadCount === 0) {
    const adj = remaining === 1 ? 'disponible' : 'disponibles'
    return `📥 ${remaining} ${noun} ${adj} · Expire dans ${hoursLabel}`
  }
  const adj = remaining === 1 ? 'restant' : 'restants'
  return `📥 ${remaining} ${noun} ${adj} · Expire dans ${hoursLabel}`
}

export function TranslationComplete({
  translatedName,
  translationType,
  translatedStrings,
  totalStrings,
  durationSeconds,
  modsCount,
  downloadCount,
  maxDownloads,
  downloadExpiresAt,
  onDownload,
  onReset,
}: TranslationCompleteProps) {
  const isDownloading = useUploadStore((s) => s.isDownloading)

  const stringsDisplay = totalStrings > 0 ? totalStrings.toLocaleString('fr-FR') : translatedStrings.toLocaleString('fr-FR')
  const modsLabel = modsCount != null && modsCount > 0 ? `${modsCount} mods` : '—'
  const limitsLine = formatDownloadLimitsLine(downloadCount, maxDownloads, downloadExpiresAt)

  return (
    <div className="space-y-8 rounded-xl border border-white/5 bg-surface p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <svg className="h-20 w-20 -rotate-90 text-primary" viewBox="0 0 64 64" aria-hidden>
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={175.93}
              initial={{ strokeDashoffset: 175.93 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          </svg>
          <svg
            className="pointer-events-none absolute h-10 w-10 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <MotionPath
              d="M6.5 12.5l4 4 7-9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.42, duration: 0.38, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>

        <motion.h2
          className="mt-6 font-display text-2xl font-bold sm:text-3xl"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {translationType === 'mod' ? 'Mod traduit avec succès ! 🎉' : 'Modpack traduit avec succès ! 🎉'}
        </motion.h2>
        <p className="mt-2 max-w-md text-sm text-text-muted">{translatedName}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Strings traduites', value: stringsDisplay },
          { label: 'Temps', value: formatDuration(durationSeconds) },
          { label: 'Mods', value: modsLabel },
        ].map((cell) => (
          <motion.div
            key={cell.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/5 bg-dark/40 px-4 py-3 text-center"
          >
            <p className="text-xs uppercase tracking-wide text-text-muted">{cell.label}</p>
            <motion.p
              className="mt-1 font-display text-lg font-bold tabular-nums text-text"
              key={cell.value}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
            >
              {cell.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <motion.button
          type="button"
          disabled={isDownloading || maxDownloads - downloadCount <= 0}
          onClick={() => {
            if (useUploadStore.getState().isDownloading) return
            void onDownload()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 text-base font-semibold text-dark transition hover:bg-primary/90 disabled:opacity-70"
        >
          {isDownloading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {isDownloading ? '⏳ Téléchargement en cours...' : translationType === 'mod' ? '⬇️ Télécharger le resource pack' : '⬇️ Télécharger le modpack traduit'}
        </motion.button>
        <p className="text-center text-sm text-text-muted" key={limitsLine}>
          {limitsLine}
        </p>
        <p className="text-center text-xs text-text-muted">
          Note : certains textes codés en Java par les développeurs de mods peuvent rester en anglais. Cela concerne
          une minorité de mods.
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition hover:border-white/15 hover:bg-white/[0.03]"
      >
        Traduire un autre fichier
      </button>
    </div>
  )
}
