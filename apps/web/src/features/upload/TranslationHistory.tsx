import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/useAuthStore'
import { useToastStore } from '../../stores/useToastStore'
import { useUploadStore } from '../../stores/useUploadStore'

export type HistoryRow = {
  id: string
  file_name: string
  status: string
  created_at: string
  total_strings: number
  translated_strings: number
  download_expires_at: string | null
}

function statusLabel(status: string): string {
  if (status === 'completed') return 'Termine'
  if (status === 'failed') return 'Echec'
  if (status === 'processing' || status === 'pending') return 'En cours'
  return status
}

function canRedownload(row: HistoryRow): boolean {
  if (row.status !== 'completed') return false
  if (!row.download_expires_at) return true
  return new Date(row.download_expires_at) > new Date()
}

export function TranslationHistory() {
  const [items, setItems] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const showToast = useToastStore((state) => state.showToast)

  const loadHistory = useCallback(async () => {
    try {
      const token = useAuthStore.getState().session?.access_token
      if (!token) {
        setItems([])
        return
      }
      const data = await api.getTranslationHistory(token)
      setItems(data as HistoryRow[])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  useEffect(() => {
    const unsub = useUploadStore.subscribe((state, prev) => {
      if (state.state === 'complete' && prev.state === 'processing') {
        void loadHistory()
      }
    })
    return unsub
  }, [loadHistory])

  const handleRedownload = async (row: HistoryRow) => {
    if (!canRedownload(row)) {
      showToast('Lien expire')
      return
    }
    try {
      const token = useAuthStore.getState().session?.access_token
      if (!token) {
        showToast('Non connecté')
        return
      }
      const blob = await api.downloadModpack(row.id, token)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = row.file_name.replace(/\.zip$/i, '_FR.zip')
      a.click()
      URL.revokeObjectURL(url)
      showToast('Telechargement lance')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur telechargement'
      showToast(message)
    }
  }

  return (
    <aside className="space-y-4 rounded-2xl border border-white/10 bg-surface p-5">
      <h2 className="font-display text-xl font-bold">Historique</h2>

      {loading && <p className="text-sm text-text-muted">Chargement...</p>}

      {!loading && items.length === 0 && (
        <p className="text-sm text-text-muted">Aucune traduction pour l&apos;instant</p>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const expired = item.status === 'completed' && !canRedownload(item)
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-white/10 bg-dark/70 p-4"
            >
              <p className="text-sm font-semibold">{item.file_name}</p>
              <p className="mt-1 text-xs text-text-muted">
                {new Date(item.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {(item.translated_strings ?? 0).toLocaleString('fr-FR')} /{' '}
                {(item.total_strings ?? 0).toLocaleString('fr-FR')} strings · {statusLabel(item.status)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    item.status === 'completed'
                      ? 'bg-secondary/15 text-secondary'
                      : item.status === 'failed'
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-white/10 text-text-muted'
                  }`}
                >
                  {statusLabel(item.status)}
                </span>
                <button
                  type="button"
                  onClick={() => void handleRedownload(item)}
                  disabled={expired || item.status !== 'completed'}
                  className="rounded-lg border border-white/15 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {expired ? 'Expire' : 'Re-telecharger'}
                </button>
              </div>
            </motion.article>
          )
        })}
      </div>
    </aside>
  )
}
