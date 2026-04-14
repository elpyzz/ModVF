import dotenv from 'dotenv'
dotenv.config()

function required(name: string): string {
  const value = process.env[name]
  if (!value || value.trim() === '') {
    console.error(`❌ FATAL: Missing required environment variable: ${name}`)
    process.exit(1)
  }
  return value.trim()
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback
}

export const env = {
  PORT: parseInt(optional('PORT', '3001'), 10),
  REDIS_URL: required('REDIS_URL'),
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  STRIPE_SECRET_KEY: required('STRIPE_SECRET_KEY'),
  STRIPE_STARTER_PRICE_ID: required('STRIPE_STARTER_PRICE_ID'),
  STRIPE_PRO_PRICE_ID: required('STRIPE_PRO_PRICE_ID'),
  STRIPE_WEBHOOK_SECRET: required('STRIPE_WEBHOOK_SECRET'),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:5173'),
  UPLOAD_DIR: optional('UPLOAD_DIR', './tmp'),
  MAX_FILE_SIZE: parseInt(optional('MAX_FILE_SIZE', '2147483648'), 10),
}
