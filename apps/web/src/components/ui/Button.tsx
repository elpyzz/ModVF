import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'google'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
  icon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-dark hover:bg-primary/90',
  secondary: 'border border-white/10 text-text hover:border-primary/35',
  danger: 'bg-red-500/80 text-white hover:bg-red-500',
  google: 'border border-white/20 text-text hover:bg-white/5',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  icon,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
      {isLoading ? 'Chargement...' : children}
    </button>
  )
}
