import dotenv from 'dotenv'

dotenv.config() // Charge le .env local si il existe, sinon les vars viennent de process.env

// Puis lis les variables depuis process.env
export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID || '',
  STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './tmp',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '2147483648', 10),
}
