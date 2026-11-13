import { Router, type Request, type Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { AuditLog, AuthChallenge, Membership, Session, User } from '@nexora/database'
import { decryptSecret, digest, encryptSecret, hashPassword, makeOtpAuthUrl, newTotpSecret, randomToken, verifyPassword, verifyTotp } from '@nexora/security'
import { z } from 'zod'
import type { AppConfig } from '../config.js'
import { clearSessionCookie, consumeChallenge, getCookie, requireAuth, requireCsrf, setSessionCookie } from '../http.js'

const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) }).strict()
const challengeSchema = z.object({ challengeToken: z.string().min(40).max(128), code: z.string().regex(/^\d{6}$/u) }).strict()
const setupSchema = z.object({ challengeToken: z.string().min(40).max(128) }).strict()
const acceptSchema = z.object({ invitationToken: z.string().min(40).max(128), displayName: z.string().trim().min(2).max(120), password: z.string().min(12).max(200) }).strict()

function cookieToken(req: Request) {
  const token = getCookie(req, 'nx_session')
  return token && token.length >= 40 ? token : undefined
}

async function createSession(req: Request, res: Response, config: AppConfig, userId: string, organizationId: string) {
  const token = randomToken()
  const csrfToken = randomToken(24)
  const now = new Date()
  await Session.create({
    userId,
    organizationId,
    tokenHash: digest(token),
    csrfHash: digest(csrfToken),
    csrfCiphertext: encryptSecret(csrfToken, config.ENCRYPTION_KEY),
    lastSeenAt: now,
    expiresAt: new Date(now.getTime() + 8 * 60 * 60_000),
    userAgentSummary: req.header('user-agent')?.slice(0, 256),
  })
  await User.updateOne({ _id: userId }, { $set: { lastLoginAt: now } })
  await AuditLog.create({ organizationId, actorId: userId, action: 'auth.login', resourceType: 'Session', requestId: req.requestId, outcome: 'success' })
  setSessionCookie(res, token, config)
  return csrfToken
}

async function newChallenge(userId: string, organizationId: string, purpose: 'login' | 'mfa_enroll') {
  const challengeToken = randomToken()
  await AuthChallenge.create({
    userId,
    organizationId,
    tokenHash: digest(challengeToken),
    purpose,
    expiresAt: new Date(Date.now() + 5 * 60_000),
  })
  return challengeToken
}

export function createAuthRouter(config: AppConfig) {
  const router = Router()
  const loginLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many sign-in attempts. Try again later.' } },
  })

  router.post('/login', loginLimiter, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Enter a valid email and password.', requestId: req.requestId } })
    const email = parsed.data.email.toLowerCase()
    const user = await User.findOne({ email, status: 'active' }).select('+passwordHash +mfa.secretCiphertext')
    if (!user || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.', requestId: req.requestId } })
    }
    const membership = await Membership.findOne({ userId: user._id, status: 'active' }).select('organizationId role')
    if (!membership) return res.status(403).json({ error: { code: 'NO_ACTIVE_MEMBERSHIP', message: 'This account is not active in an organization.', requestId: req.requestId } })

    if (membership.role === 'admin' || user.mfa.enabled) {
      const purpose = user.mfa.enabled ? 'login' : 'mfa_enroll'
      const challengeToken = await newChallenge(user.id, membership.organizationId.toString(), purpose)
      return res.status(202).json({ data: { challengeToken, mfaSetupRequired: purpose === 'mfa_enroll' }, requestId: req.requestId })
    }

    const csrfToken = await createSession(req, res, config, user.id, membership.organizationId.toString())
    return res.json({ data: { user: { id: user.id, email: user.email, displayName: user.displayName, role: membership.role, organizationId: membership.organizationId.toString(), mfaEnabled: user.mfa.enabled }, csrfToken }, requestId: req.requestId })
  })

  router.post('/mfa/setup', loginLimiter, async (req, res) => {
    const parsed = setupSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'A valid sign-in challenge is required.', requestId: req.requestId } })
    const challenge = await consumeChallenge(parsed.data.challengeToken)
    if (!challenge || challenge.purpose !== 'mfa_enroll') return res.status(401).json({ error: { code: 'CHALLENGE_EXPIRED', message: 'Sign in again to set up MFA.', requestId: req.requestId } })
    if (!challenge.secretCiphertext) {
      const user = await User.findById(challenge.userId).select('email')
      if (!user) return res.status(401).json({ error: { code: 'CHALLENGE_EXPIRED', message: 'Sign in again to set up MFA.', requestId: req.requestId } })
      const secret = newTotpSecret()
      challenge.secretCiphertext = encryptSecret(secret, config.ENCRYPTION_KEY)
      await challenge.save()
      return res.json({ data: { secret, otpauthUrl: makeOtpAuthUrl(secret, user.email), expiresAt: challenge.expiresAt }, requestId: req.requestId })
    }
    const secret = decryptSecret(challenge.secretCiphertext, config.ENCRYPTION_KEY)
    const user = await User.findById(challenge.userId).select('email')
    if (!user) return res.status(401).json({ error: { code: 'CHALLENGE_EXPIRED', message: 'Sign in again to set up MFA.', requestId: req.requestId } })
    return res.json({ data: { secret, otpauthUrl: makeOtpAuthUrl(secret, user.email), expiresAt: challenge.expiresAt }, requestId: req.requestId })
  })

  router.post('/mfa/verify', loginLimiter, async (req, res) => {
    const parsed = challengeSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Enter a six-digit authenticator code.', requestId: req.requestId } })
    const challenge = await consumeChallenge(parsed.data.challengeToken)
    if (!challenge) return res.status(401).json({ error: { code: 'CHALLENGE_EXPIRED', message: 'Sign in again to continue.', requestId: req.requestId } })
    const user = await User.findOne({ _id: challenge.userId, status: 'active' }).select('+mfa.secretCiphertext')
    const membership = await Membership.findOne({ userId: challenge.userId, organizationId: challenge.organizationId, status: 'active' }).select('role')
    if (!user || !membership) return res.status(401).json({ error: { code: 'CHALLENGE_EXPIRED', message: 'Sign in again to continue.', requestId: req.requestId } })
    const ciphertext = challenge.purpose === 'mfa_enroll' ? challenge.secretCiphertext : user.mfa.secretCiphertext
    if (!ciphertext) return res.status(409).json({ error: { code: 'MFA_SETUP_REQUIRED', message: 'Start MFA setup before verifying.', requestId: req.requestId } })
    const secret = decryptSecret(ciphertext, config.ENCRYPTION_KEY)
    if (!verifyTotp(secret, parsed.data.code)) {
      const attempt = await AuthChallenge.updateOne({ _id: challenge._id, attempts: challenge.attempts, consumedAt: null, expiresAt: { $gt: new Date() } }, {
        $inc: { attempts: 1 },
        ...(challenge.attempts >= 4 ? { $set: { consumedAt: new Date() } } : {}),
      })
      if (attempt.modifiedCount !== 1) return res.status(409).json({ error: { code: 'CHALLENGE_USED', message: 'Sign in again to continue.', requestId: req.requestId } })
      return res.status(401).json({ error: { code: 'MFA_INVALID', message: 'The authenticator code is invalid.', requestId: req.requestId } })
    }
    const consumed = await AuthChallenge.updateOne({ _id: challenge._id, consumedAt: null, expiresAt: { $gt: new Date() } }, { $set: { consumedAt: new Date() } })
    if (consumed.modifiedCount !== 1) return res.status(409).json({ error: { code: 'CHALLENGE_USED', message: 'Sign in again to continue.', requestId: req.requestId } })
    if (challenge.purpose === 'mfa_enroll') {
      await User.updateOne({ _id: user._id }, { $set: { 'mfa.enabled': true, 'mfa.secretCiphertext': encryptSecret(secret, config.ENCRYPTION_KEY) } })
      await AuditLog.create({ organizationId: challenge.organizationId, actorId: user._id, action: 'auth.mfa_enrolled', resourceType: 'User', resourceId: user.id, requestId: req.requestId, outcome: 'success' })
    }
    const csrfToken = await createSession(req, res, config, user.id, challenge.organizationId.toString())
    return res.json({ data: { user: { id: user.id, email: user.email, displayName: user.displayName, role: membership.role, organizationId: challenge.organizationId.toString(), mfaEnabled: true }, csrfToken }, requestId: req.requestId })
  })

  router.post('/accept-invitation', async (req, res) => {
    const parsed = acceptSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Check the invitation details and password.', requestId: req.requestId } })
    const membership = await Membership.findOne({ invitationTokenHash: digest(parsed.data.invitationToken), status: 'invited', invitationExpiresAt: { $gt: new Date() } }).select('+invitationTokenHash')
    if (!membership) return res.status(400).json({ error: { code: 'INVITATION_INVALID', message: 'This invitation is invalid or expired.', requestId: req.requestId } })
    const accepted = await Membership.updateOne({ _id: membership._id, status: 'invited' }, {
      $set: { status: 'active', invitationAcceptedAt: new Date() },
      $unset: { invitationTokenHash: 1, invitationExpiresAt: 1 },
    })
    if (accepted.modifiedCount !== 1) return res.status(409).json({ error: { code: 'INVITATION_USED', message: 'This invitation has already been used.', requestId: req.requestId } })
    await User.updateOne({ _id: membership.userId, status: 'invited' }, {
      $set: { displayName: parsed.data.displayName, passwordHash: await hashPassword(parsed.data.password), status: 'active' },
    })
    return res.status(201).json({ data: { accepted: true }, requestId: req.requestId })
  })

  router.get('/me', requireAuth, async (req, res) => {
    const session = await Session.findOne({ _id: req.auth!.sessionId, revokedAt: null, expiresAt: { $gt: new Date() } }).select('+csrfCiphertext').exec()
    if (!session) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in is required.', requestId: req.requestId } })
    const csrfToken = decryptSecret(session.csrfCiphertext, config.ENCRYPTION_KEY)
    return res.json({
      data: {
        user: { id: req.auth!.userId.toString(), email: req.auth!.email, displayName: req.auth!.displayName, role: req.auth!.role, organizationId: req.auth!.organizationId.toString(), mfaEnabled: req.auth!.mfaEnabled },
        csrfToken,
      },
      requestId: req.requestId,
    })
  })

  router.post('/logout', requireAuth, requireCsrf, async (req, res) => {
    await Session.updateOne({ _id: req.auth!.sessionId }, { $set: { revokedAt: new Date() } })
    await AuditLog.create({ organizationId: req.auth!.organizationId, actorId: req.auth!.userId, action: 'auth.logout', resourceType: 'Session', resourceId: req.auth!.sessionId.toString(), requestId: req.requestId, outcome: 'success' })
    clearSessionCookie(res, config)
    return res.json({ data: { signedOut: true }, requestId: req.requestId })
  })

  router.post('/logout-all', requireAuth, requireCsrf, async (req, res) => {
    await Session.updateMany({ userId: req.auth!.userId, organizationId: req.auth!.organizationId, revokedAt: null }, { $set: { revokedAt: new Date() } })
    clearSessionCookie(res, config)
    return res.json({ data: { signedOut: true }, requestId: req.requestId })
  })

  return router
}
