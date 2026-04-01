export type TranslationJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface TranslationJob {
  id: string
  filename: string
  status: TranslationJobStatus
  progress: number
  createdAt: string
}
