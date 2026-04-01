import type { InputHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  error?: string
}

export function Input({ label, icon: Icon, error, className = '', ...rest }: InputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="relative">
        {Icon ? <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" /> : null}
        <input
          {...rest}
          className={`w-full rounded-xl border border-white/15 bg-dark px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-muted/60 focus:border-primary ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-400/50' : ''} ${className}`}
        />
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </label>
  )
}
