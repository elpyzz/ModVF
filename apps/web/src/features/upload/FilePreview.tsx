import { Archive, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatFileSize } from '../../lib/utils'

interface FilePreviewProps {
  fileName: string
  fileSize: number
  onChangeFile: () => void
}

export function FilePreview({ fileName, fileSize, onChangeFile }: FilePreviewProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sourceLabel = 'Anglais'

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Archive className="h-6 w-6 text-primary" />
          <div>
            <p className="font-semibold">{fileName}</p>
            <p className="text-sm text-text-muted">{formatFileSize(fileSize)}</p>
          </div>
        </div>
        <button onClick={onChangeFile} className="text-sm text-text-muted transition hover:text-text" type="button">
          Changer de fichier
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Langue source</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-dark px-4 py-3 text-sm"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
            >
              {sourceLabel}
              <ChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen ? (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-white/10 bg-surface p-2 shadow-xl">
                <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-light">
                  Anglais
                </button>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg px-3 py-2 text-left text-sm text-text-muted/60"
                >
                  Detection automatique (bientot)
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Langue cible</p>
          <div className="rounded-xl border border-white/15 bg-dark px-4 py-3 text-sm">Francais 🇫🇷</div>
        </div>
      </div>
    </div>
  )
}
