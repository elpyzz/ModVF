import { motion } from 'framer-motion'
import { History } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { useToastStore } from '../../stores/useToastStore'
import { useUploadStore } from '../../stores/useUploadStore'

export type HistoryRow = {
  id: string
  file_name: string
  type?: 'mod' | 'modpack'
  status: string
  created_at: string
  total_strings: number
  translated_strings: number
  download_expires_at: string | null
}

const STALE_MS = 2 * 60 * 60 * 1000

function statusLabel(status: string, expiredInProgress: boolean): string {
  if (expiredInProgress) return 'Expiré'
  if (status === 'completed') return 'Terminé'
  if (status === 'failed') return 'Échec'
  if (status === 'processing' || status === 'pending') return 'En cours'
  return status
}

function isExpiredInProgress(row: HistoryRow): boolean {
  if (row.status !== 'processing' && row.status !== 'pending') return false
  const created = new Date(row.created_at).getTime()
  if (!Number.isFinite(created)) return false
  return Date.now() - created > STALE_MS
}

function canRedownload(row: HistoryRow): boolean {
  if (row.status !== 'completed') return false
  if (!row.download_expires_at) return true
  return new Date(row.download_expires_at) > new Date()
}

export function TranslationHistory() {
  const [items, setItems] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const addToast = useToastStore((state) => state.addToast)

  const loadHistory = useCallback(async () => {
    try {
      if (!supabase) {
        setItems([])
        return
      }
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setItems([])
        return
      }

      const { data } = await supabase
        .from('translations')
        .select('id, file_name, type, status, created_at, total_strings, translated_strings, download_expires_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setItems((data ?? []) as HistoryRow[])
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
      addToast('error', 'Lien expiré')
      return
    }
    setDownloadingId(row.id)
    try {
      if (!supabase) {
        addToast('error', 'Non connecté')
        return
      }
      const { data: sessionData } = await supabase.auth.getSession()
      let token = sessionData?.session?.access_token
      if (!token) {
        const { data: refreshData } = await supabase.auth.refreshSession()
        token = refreshData?.session?.access_token
      }
      if (!token) {
        addToast('error', 'Non connecté')
        return
      }
      const blob = await api.downloadModpack(row.id, token)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const baseName = row.file_name.replace(/\.(zip|jar)$/i, '')
      a.download = row.type === 'mod' ? `ModVF_${baseName}_FR.zip` : `${baseName}_FR.zip`
      a.click()
      URL.revokeObjectURL(url)
      addToast('success', 'Téléchargement lancé')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur téléchargement'
      const lower = message.toLowerCase()
      const is404Like = lower.includes('404') || lower.includes('introuvable') || lower.includes('not found')
      if (is404Like) {
        addToast('error', 'Le fichier a expiré. Relancez la traduction (gratuit si déjà en cache).')
      } else {
        addToast('error', message)
      }
    } finally {
      setDownloadingId((current) => (current === row.id ? null : current))
    }
  }

  return (
    <aside className="flex w-full flex-col rounded-2xl border border-white/10 bg-surface p-5">
      <h2 className="font-display text-xl font-bold">Historique</h2>

      {loading && <p className="mt-3 text-sm text-text-muted">Chargement...</p>}

      {!loading && items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 py-6 text-center text-text-muted">
          <History className="h-10 w-10 opacity-40" />
          <p className="text-sm">Aucune traduction pour l&apos;instant</p>
        </div>
      ) : null}

      <div
        className={clsxScrollArea()}
        style={{ maxHeight: '60vh' }}
      >
        {!loading &&
          items.map((item, index) => {
            const expired = item.status === 'completed' && !canRedownload(item)
            const expiredProgress = isExpiredInProgress(item)
            const label = statusLabel(item.status, expiredProgress)
            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.25 }}
                className={`rounded-xl border p-4 ${
                  expiredProgress ? 'border-white/5 bg-dark/30 opacity-80' : 'border-white/10 bg-dark/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{item.file_name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      item.type === 'mod' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                    }`}
                  >
                    {item.type === 'mod' ? 'Mod' : 'Modpack'}
                  </span>
                </div>
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
                  {(item.total_strings ?? 0).toLocaleString('fr-FR')} strings
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      expiredProgress
                        ? 'bg-white/10 text-text-muted'
                        : item.status === 'completed'
                          ? 'bg-secondary/15 text-secondary'
                          : item.status === 'failed'
                            ? 'bg-red-500/20 text-red-200'
                            : 'bg-white/10 text-text-muted'
                    }`}
                  >
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleRedownload(item)}
                    disabled={expired || item.status !== 'completed' || expiredProgress || downloadingId === item.id}
                    className="rounded-lg border border-white/15 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {downloadingId === item.id ? 'Téléchargement...' : expired ? 'Expiré' : 'Re-télécharger'}
                  </button>
                </div>
              </motion.article>
            )
          })}
      </div>
    </aside>
  )
}

function clsxScrollArea(): string {
  return [
    'mt-4 flex flex-col gap-3 overflow-y-auto pr-1',
    '[scrollbar-width:thin]',
    '[scrollbar-color:rgba(255,255,255,0.18)_transparent]',
    '[&::-webkit-scrollbar]:w-1.5',
    '[&::-webkit-scrollbar-track]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:rounded-full',
    '[&::-webkit-scrollbar-thumb]:bg-white/18',
    '[&::-webkit-scrollbar-thumb:hover]:bg-white/28',
  ].join(' ')
}
