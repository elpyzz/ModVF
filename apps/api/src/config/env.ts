import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPLOAD_DIR: z.string().default('./tmp'),
  MAX_FILE_SIZE: z.coerce.number().default(2147483648),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
})

export const env = envSchema.parse(process.env)
