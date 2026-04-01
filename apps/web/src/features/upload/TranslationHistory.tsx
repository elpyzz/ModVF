import { motion } from 'framer-motion'
import { useHistoryStore } from '../../stores/useHistoryStore'
import { useToastStore } from '../../stores/useToastStore'

const demoItems = [
  { name: 'All The Mods 9', date: '12 mars 2026', status: 'Traduit' },
  { name: 'Better MC [Fabric]', date: '10 mars 2026', status: 'Traduit' },
  { name: 'Vault Hunters 3rd Ed.', date: '8 mars 2026', status: 'Expire' },
]

export function TranslationHistory() {
  const history = useHistoryStore((state) => state.history)
  const showToast = useToastStore((state) => state.showToast)

  return (
    <aside className="space-y-4 rounded-2xl border border-white/10 bg-surface p-5">
      <h2 className="font-display text-xl font-bold">Historique</h2>

      <div className="space-y-3">
        {history.map((item) => {
          const translated = item.status === 'translated'
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/10 bg-dark/70 p-4"
            >
              <p className="text-sm font-semibold">{item.fileName}</p>
              <p className="mt-1 text-xs text-text-muted">
                {item.translatedAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="mt-1 text-xs text-text-muted">{item.totalStrings.toLocaleString('fr-FR')} strings</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-secondary/15 px-2 py-1 text-xs text-secondary">
                  {translated ? 'Traduit' : 'Expire'}
                </span>
                <button
                  type="button"
                  onClick={() => showToast('⚙️ Le telechargement sera disponible une fois le backend connecte')}
                  disabled={!translated}
                  className="rounded-lg border border-white/15 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Re-telecharger
                </button>
              </div>
            </motion.article>
          )
        })}
      </div>

      <p className="text-xs uppercase tracking-wide text-text-muted/80">Exemples (demo)</p>
      <div className="space-y-3 opacity-75">
        {demoItems.map((item) => {
          const translated = item.status === 'Traduit'
          return (
            <article key={item.name} className="rounded-xl border border-white/10 bg-dark/70 p-4">
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-text-muted">{item.date}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    translated ? 'bg-secondary/15 text-secondary' : 'bg-white/10 text-text-muted'
                  }`}
                >
                  {item.status}
                </span>
                <button
                  type="button"
                  disabled={!translated}
                  className="rounded-lg border border-white/15 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Re-telecharger
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <p className="text-sm text-text-muted">Tu as traduit {history.length + 3} modpacks ce mois-ci</p>
    </aside>
  )
}
