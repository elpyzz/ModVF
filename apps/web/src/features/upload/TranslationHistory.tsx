import { motion } from 'framer-motion'
import { History, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { MODPACKS, type ModpackSupportLevel } from '../../features/modpacks/modpacksData'
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
  download_count?: number
  max_downloads?: number
  output_path?: string | null
}

interface TranslationHistoryProps {
  onItemsChange?: (items: HistoryRow[]) => void
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
  if (isLegacyLocalArchive(row)) return false
  const downloadCount = Number(row.download_count ?? 0)
  const maxDownloads = Number(row.max_downloads ?? 3)
  if (downloadCount >= maxDownloads) return false
  if (!row.download_expires_at) return true
  return new Date(row.download_expires_at) > new Date()
}

function isLegacyLocalArchive(row: HistoryRow): boolean {
  const outputPath = String(row.output_path ?? '')
  return outputPath.startsWith('/app/tmp/') || outputPath.startsWith('./tmp/') || outputPath.startsWith('tmp/')
}

function formatExpireDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function inferSupportLevel(fileName: string): ModpackSupportLevel | null {
  const baseName = normalize(fileName.replace(/\.(zip|jar)$/i, ''))
  for (const modpack of MODPACKS) {
    const candidates = [modpack.name, modpack.shortName, modpack.slug.replace(/-/g, ' ')]
    if (candidates.some((candidate) => baseName.includes(normalize(candidate)))) {
      return modpack.supportLevel
    }
  }
  return null
}

export function TranslationHistory({ onItemsChange }: TranslationHistoryProps) {
  const [items, setItems] = useState<HistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [downloadingById, setDownloadingById] = useState<Record<string, boolean>>({})
  const [expiredById, setExpiredById] = useState<Record<string, boolean>>({})
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
        .select(
          'id, file_name, type, status, created_at, total_strings, translated_strings, download_expires_at, download_count, max_downloads, output_path',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      const nextItems = (data ?? []) as HistoryRow[]
      setItems(nextItems)
      onItemsChange?.(nextItems)
    } catch {
      setItems([])
      onItemsChange?.([])
    } finally {
      setLoading(false)
    }
  }, [onItemsChange])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadHistory()
      addToast('success', 'Historique mis à jour')
    } catch {
      addToast('error', "Impossible d'actualiser l'historique")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const unsub = useUploadStore.subscribe((state, prev) => {
      if (state.state === 'complete' && prev.state === 'processing') {
        void loadHistory()
      }
    })
    return unsub
  }, [loadHistory])

  const handleRedownload = async (row: HistoryRow) => {
    const downloadCount = Number(row.download_count ?? 0)
    const maxDownloads = Number(row.max_downloads ?? 3)
    const isQuotaExhausted = downloadCount >= maxDownloads
    const isExpiredByDate = row.download_expires_at ? new Date(row.download_expires_at) <= new Date() : false
    if (isQuotaExhausted) {
      addToast('error', 'Téléchargements épuisés')
      return
    }
    if (isExpiredByDate || expiredById[row.id]) {
      addToast('error', 'Lien expiré')
      return
    }
    setDownloadingById((prev) => ({ ...prev, [row.id]: true }))
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
        setExpiredById((prev) => ({ ...prev, [row.id]: true }))
        addToast('error', 'Le fichier a expiré. Relancez la traduction (gratuit si déjà en cache).')
      } else {
        addToast('error', message)
      }
    } finally {
      setDownloadingById((prev) => ({ ...prev, [row.id]: false }))
    }
  }

  return (
    <aside className="flex w-full flex-col rounded-2xl border border-white/10 bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Historique</h2>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-text transition hover:border-primary/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualisation...' : 'Rafraîchir'}
        </button>
      </div>

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
            const downloadCount = Number(item.download_count ?? 0)
            const maxDownloads = Number(item.max_downloads ?? 3)
            const remainingDownloads = Math.max(0, maxDownloads - downloadCount)
            const downloadsExhausted = downloadCount >= maxDownloads
            const expiredByDate = item.download_expires_at ? new Date(item.download_expires_at) <= new Date() : false
            const expiredFromApi = Boolean(expiredById[item.id])
            const isLegacyUnavailable = isLegacyLocalArchive(item)
            const isExpired = expired || expiredByDate || expiredFromApi || isLegacyUnavailable
            const isDownloading = Boolean(downloadingById[item.id])
            const supportLevel = item.type === 'modpack' ? inferSupportLevel(item.file_name) : null
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
                  {item.status === 'completed' && downloadsExhausted ? (
                    <span className="text-xs text-gray-500">Téléchargements épuisés</span>
                  ) : item.status === 'completed' && isLegacyUnavailable ? (
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Archive indisponible</span>
                      <p className="text-[11px] text-gray-500">Ancienne traduction locale. Relancez la traduction.</p>
                    </div>
                  ) : item.status === 'completed' && isExpired ? (
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Fichier expiré</span>
                      <p className="text-[11px] text-gray-500">Relancez la traduction (gratuit grâce au cache)</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleRedownload(item)}
                      disabled={isExpired || item.status !== 'completed' || expiredProgress || isDownloading}
                      className="rounded-lg border border-white/15 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDownloading ? 'Téléchargement...' : isExpired ? 'Expiré' : 'Re-télécharger'}
                    </button>
                  )}
                </div>
                {item.status === 'completed' && supportLevel === 'items_only' ? (
                  <div className="mt-2 rounded-lg border border-red-500/30 bg-red-900/20 p-2">
                    <p className="text-xs text-red-200">
                      ⚠️ Installez UNIQUEMENT le resource pack (ModVF_Traduction_FR.zip). Ne copiez PAS le dossier
                      config/ pour ce modpack.
                    </p>
                  </div>
                ) : null}
                {item.status === 'completed' && supportLevel === 'partial' ? (
                  <div className="mt-2 rounded-lg border border-orange-500/30 bg-orange-900/20 p-2">
                    <p className="text-xs text-orange-200">
                      ⚠️ Ce modpack a une traduction partielle des quêtes. Vous pouvez installer normalement (resource
                      pack + dossier config). La majorité des quêtes seront en français, certaines resteront en anglais.
                      Si après installation certaines quêtes apparaissent sans texte ("Unnamed"), réinstallez votre
                      modpack et recopiez les fichiers traduits SANS le dossier ftbquests (dans config/).
                    </p>
                  </div>
                ) : null}
                {item.status === 'completed' ? (
                  <div className="mt-2 flex flex-col gap-1">
                    <span className="text-xs text-gray-500">{remainingDownloads} téléchargement(s) restant(s)</span>
                    <span className="text-xs text-gray-500">Expire le {formatExpireDate(item.download_expires_at)}</span>
                  </div>
                ) : null}
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
