import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers.x-csrf-token',
      'req.body.password',
      'req.body.challengeToken',
      'req.body.invitationToken',
      'req.body.code',
      'res.headers.set-cookie',
    ],
    censor: '[REDACTED]',
  },
  base: { service: 'nexora-api' },
})
