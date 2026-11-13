import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/nexora'),
  REDIS_URL: z.string().min(1).default('redis://127.0.0.1:6379'),
  WEB_ORIGIN: z.string().url().default('http://localhost:5173'),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/u, 'must be 32 random bytes as 64 hex characters'),
  SESSION_IDLE_MINUTES: z.coerce.number().int().min(5).max(240).default(30),
  SESSION_COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
})

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const parsed = envSchema.safeParse(env)
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
    throw new Error(`Invalid environment configuration: ${details}`)
  }

  const config = parsed.data
  if (config.NODE_ENV === 'production' && config.SESSION_COOKIE_SECURE !== 'true') {
    throw new Error('SESSION_COOKIE_SECURE must be true in production')
  }
  if (config.NODE_ENV === 'production' && config.ENCRYPTION_KEY === '0'.repeat(64)) {
    throw new Error('ENCRYPTION_KEY must not use the example value in production')
  }
  return {
    ...config,
    cookieSecure: config.SESSION_COOKIE_SECURE === 'true' || config.NODE_ENV === 'production',
    trustProxy: config.TRUST_PROXY === 'true',
    sessionIdleMs: config.SESSION_IDLE_MINUTES * 60_000,
  }
}

export type AppConfig = ReturnType<typeof loadConfig>
