import { createServer } from 'node:http'
import { createClient } from 'redis'
import pino from 'pino'

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info', base: { service: 'nexora-worker' } })
const redisUrl = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379'
const port = Number(process.env.WORKER_HEALTH_PORT ?? 4010)
const redis = createClient({ url: redisUrl })
redis.on('error', (error) => logger.error({ error: error.message }, 'Redis connection error'))

const health = createServer((_req, res) => {
  const ready = redis.isReady
  res.statusCode = ready ? 200 : 503
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify({ status: ready ? 'ready' : 'not-ready' }))
})

async function main() {
  await redis.connect()
  health.listen(port, '0.0.0.0', () => logger.info({ port }, 'Worker health endpoint listening'))
  logger.info('Worker connected; no domain processors are enabled yet')
}

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down worker')
  health.close()
  if (redis.isOpen) await redis.quit()
  process.exit(0)
}

process.once('SIGTERM', () => void shutdown('SIGTERM'))
process.once('SIGINT', () => void shutdown('SIGINT'))
main().catch((error: unknown) => {
  logger.fatal({ error: error instanceof Error ? error.message : 'unknown' }, 'Worker startup failed')
  process.exit(1)
})
