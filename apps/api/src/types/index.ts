import type { User } from '@supabase/supabase-js'

export type TranslationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type TranslationJobData = {
  jobId: string
  userId: string
  filePath: string
  fileName: string
  type: 'mod' | 'modpack'
  billingSource?: 'none' | 'monthly' | 'purchased'
}

export type RequestUser = User
