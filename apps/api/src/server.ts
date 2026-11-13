import { createServer as createHttpServer } from 'node:http'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'
import { createClient } from 'redis'
import { AuditLog, connectDatabase, databaseReady, disconnectDatabase, Membership, Organization } from '@nexora/database'
import { loadConfig } from './config.js'
import { authenticate, requestContext, requireAuth } from './http.js'
import { logger } from './logger.js'
import { createAuthRouter } from './routes/auth.js'
import { createUsersRouter } from './routes/users.js'

export function createApp(config = loadConfig(), redisStatus: () => boolean = () => false) {
  const app = express()
  if (config.trustProxy) app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(requestContext)
  app.use(pinoHttp({ logger }))
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }))
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-Id'] }))
  app.use(express.json({ limit: '128kb', strict: true }))
  app.use((req, res, next) => authenticate(req, res, next, config))

  const api = express.Router()
  api.get('/health/live', (_req, res) => res.json({ data: { status: 'alive' } }))
  api.get('/health/ready', (_req, res) => {
    if (!databaseReady() || !redisStatus()) return res.status(503).json({ error: { code: 'NOT_READY', message: 'A required service is not ready.' } })
    return res.json({ data: { status: 'ready', database: 'ready', redis: 'ready' } })
  })
  api.use('/auth', createAuthRouter(config))
  api.use('/users', createUsersRouter())
  api.get('/dashboard/summary', requireAuth, async (req, res) => {
    const [organization, activeMembers, recentActivity] = await Promise.all([
      Organization.findOne({ _id: req.auth!.organizationId, status: 'active' }).select('name defaultLocale').lean(),
      Membership.countDocuments({ organizationId: req.auth!.organizationId, status: 'active' }),
      AuditLog.find({ organizationId: req.auth!.organizationId }).sort({ occurredAt: -1 }).limit(8).select('action resourceType resourceId occurredAt outcome').lean(),
    ])
    if (!organization) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Organization not found.', requestId: req.requestId } })
    return res.json({ data: { organizationName: organization.name, defaultLocale: organization.defaultLocale, activeMembers, recentActivity: recentActivity.map((event) => ({ action: event.action, resourceType: event.resourceType ?? null, resourceId: event.resourceId ?? null, occurredAt: event.occurredAt, outcome: event.outcome })) }, requestId: req.requestId })
  })
  api.get('/organizations/current', requireAuth, async (req, res) => {
    const organization = await Organization.findOne({ _id: req.auth!.organizationId, status: 'active' }).select('name slug defaultLocale timezone currency').lean()
    if (!organization) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Organization not found.', requestId: req.requestId } })
    const membershipCount = await Membership.countDocuments({ organizationId: organization._id, status: 'active' })
    return res.json({ data: { id: organization._id.toString(), name: organization.name, slug: organization.slug, defaultLocale: organization.defaultLocale, timezone: organization.timezone, currency: organization.currency, activeMembers: membershipCount }, requestId: req.requestId })
  })
  app.use('/api/v1', api)

  const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
    logger.error({ error: error instanceof Error ? { name: error.name, message: error.message } : 'unknown', requestId: req.requestId }, 'Request failed')
    if (res.headersSent) return
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.', requestId: req.requestId } })
  }
  app.use(errorHandler)
  return app
}

async function main() {
  const config = loadConfig()
  await connectDatabase(config.MONGODB_URI)
  const redis = createClient({ url: config.REDIS_URL })
  redis.on('error', (error) => logger.error({ error: error.message }, 'Redis connection error'))
  await redis.connect()
  const app = createApp(config, () => redis.isReady)
  const server = createHttpServer(app).listen(config.PORT, '0.0.0.0', () => {
    logger.info({ port: config.PORT }, 'Nexora API listening')
  })
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down API')
    server.close(async () => {
      await Promise.allSettled([redis.quit(), disconnectDatabase()])
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.once('SIGTERM', () => void shutdown('SIGTERM'))
  process.once('SIGINT', () => void shutdown('SIGINT'))
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    logger.fatal({ error: error instanceof Error ? error.message : 'unknown' }, 'API startup failed')
    process.exit(1)
  })
}
