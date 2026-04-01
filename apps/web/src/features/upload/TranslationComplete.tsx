import { motion } from 'framer-motion'
import { useToastStore } from '../../stores/useToastStore'

interface TranslationCompleteProps {
  translatedName: string
  onReset: () => void
}

export function TranslationComplete({ translatedName, onReset }: TranslationCompleteProps) {
  const showToast = useToastStore((state) => state.showToast)

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
        <p className="mt-2 text-text-muted">4 500 strings traduites · 127 fichiers traites · 1 min 23 sec</p>
      </div>

      <button
        type="button"
        onClick={() => showToast('⚙️ Le telechargement sera disponible une fois le backend connecte')}
        className="w-full rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-dark shadow-[0_0_24px_rgba(0,212,170,0.45)] transition hover:bg-secondary/90"
      >
        ⬇️ Telecharger le modpack traduit
      </button>
      <p className="text-center text-xs text-text-muted">Lien valide 24h · 3 telechargements max</p>

      <button type="button" onClick={onReset} className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm">
        Traduire un autre modpack
      </button>
    </div>
  )
}
