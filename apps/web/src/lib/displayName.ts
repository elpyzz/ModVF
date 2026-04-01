import type { User } from '@supabase/supabase-js'

type ProfileLike = {
  display_name?: string | null
} | null

/**
 * Pseudo affiché : d'abord user_metadata (pseudo saisi à l'inscription / OAuth),
 * puis profil DB si ce n'est pas la partie locale de l'email.
 */
export function resolveDisplayName(user: User | null, profile: ProfileLike): string {
  const meta = user?.user_metadata as Record<string, unknown> | undefined
  const metaDisplay = typeof meta?.display_name === 'string' ? meta.display_name.trim() : ''
  const raw = profile?.display_name?.trim()
  const emailLocal = user?.email?.includes('@') ? user.email.split('@')[0]?.toLowerCase() ?? '' : ''
  const profileMatchesEmailLocal = Boolean(raw && emailLocal && raw.toLowerCase() === emailLocal)

  // 1) Pseudo saisi à l'inscription (JWT) — toujours prioritaire sur la ligne profiles
  if (metaDisplay && !metaDisplay.includes('@')) {
    return metaDisplay
  }

  // 2) Ligne profiles si ce n'est pas un email ni la partie locale
  const fromProfile = raw && !raw.includes('@') ? raw : ''
  if (fromProfile && !profileMatchesEmailLocal) {
    return fromProfile
  }

  const fromMeta =
    (typeof meta?.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta?.name === 'string' && meta.name.trim()) ||
    ''

  if (fromMeta) return fromMeta

  return 'Joueur'
}
