import { Coins } from 'lucide-react'

interface CreditsDisplayProps {
  credits: number
}

export function CreditsDisplay({ credits }: CreditsDisplayProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
      <Coins className="h-4 w-4" />
      {credits} credits restants
    </div>
  )
}
