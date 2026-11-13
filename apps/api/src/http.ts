import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { AuditLog, AuthChallenge, Membership, Session, User } from '@nexora/database'
import type { AppConfig } from './config.js'
import { digest } from '@nexora/security'
import { logger } from './logger.js'

export function requestContext(req: Request, res: Response, next: NextFunction) {
  req.requestId = randomUUID()
  res.setHeader('X-Request-Id', req.requestId)
  next()
}

export function getCookie(req: Request, name: string) {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    if (part.slice(0, separator).trim() === name) return decodeURIComponent(part.slice(separator + 1).trim())
  }
  return undefined
}

export function setSessionCookie(res: Response, token: string, config: AppConfig) {
  const options = [`nx_session=${encodeURIComponent(token)}`, 'Path=/api', 'HttpOnly', 'SameSite=Lax', 'Max-Age=28800']
  if (config.cookieSecure) options.push('Secure')
  res.append('Set-Cookie', options.join('; '))
}

export function clearSessionCookie(res: Response, config: AppConfig) {
  const options = ['nx_session=', 'Path=/api', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']
  if (config.cookieSecure) options.push('Secure')
  res.append('Set-Cookie', options.join('; '))
}

export async function authenticate(req: Request, _res: Response, next: NextFunction, config: AppConfig) {
  try {
    const token = getCookie(req, 'nx_session')
    if (!token || token.length < 40) return next()
    const session = await Session.findOne({ tokenHash: digest(token), revokedAt: null, expiresAt: { $gt: new Date() } })
      .select('+tokenHash +csrfHash')
      .exec()
    if (!session || Date.now() - session.lastSeenAt.getTime() > config.sessionIdleMs) return next()
    const [user, membership] = await Promise.all([
      User.findOne({ _id: session.userId, status: 'active' }).select('email displayName mfa.enabled').exec(),
      Membership.findOne({ userId: session.userId, organizationId: session.organizationId, status: 'active' })
        .select('role')
        .exec(),
    ])
    if (!user || !membership) return next()
    req.auth = {
      userId: user._id,
      organizationId: session.organizationId,
      role: membership.role as 'admin' | 'operator',
      displayName: user.displayName,
      email: user.email,
      mfaEnabled: user.mfa.enabled,
      sessionId: session._id,
      csrfHash: session.csrfHash,
    }
    if (Date.now() - session.lastSeenAt.getTime() > 5 * 60_000) {
      void Session.updateOne({ _id: session._id }, { $set: { lastSeenAt: new Date() } }).catch((error: unknown) => {
        logger.warn({ error, requestId: req.requestId }, 'Could not update session activity')
      })
    }
    next()
  } catch (error) {
    next(error)
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in is required.', requestId: req.requestId } })
  next()
}

export function requireRole(...roles: Array<'admin' | 'operator'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return requireAuth(req, res, next)
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not have permission for this action.', requestId: req.requestId } })
    }
    next()
  }
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) return requireAuth(req, res, next)
  const token = req.header('x-csrf-token')
  if (!token || token.length > 200) {
    return res.status(403).json({ error: { code: 'CSRF_INVALID', message: 'Reload the page and try again.', requestId: req.requestId } })
  }
  const supplied = Buffer.from(digest(token), 'hex')
  const expected = Buffer.from(req.auth.csrfHash, 'hex')
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(403).json({ error: { code: 'CSRF_INVALID', message: 'Reload the page and try again.', requestId: req.requestId } })
  }
  next()
}

export async function writeAudit(
  req: Request,
  action: string,
  outcome: 'success' | 'denied' | 'failure',
  resourceType?: string,
  resourceId?: string,
  metadata: Record<string, string | number | boolean> = {},
) {
  const organizationId = req.auth?.organizationId ?? (req as Request & { organizationId?: unknown }).organizationId
  if (!organizationId) return
  await AuditLog.create({
    organizationId,
    actorId: req.auth?.userId,
    action,
    resourceType,
    resourceId,
    requestId: req.requestId,
    outcome,
    redactedMetadata: metadata,
  })
}

export async function consumeChallenge(token: string) {
  return AuthChallenge.findOne({ tokenHash: digest(token), consumedAt: null, expiresAt: { $gt: new Date() } })
    .select('+tokenHash +secretCiphertext')
}

export function hashForAudit(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
