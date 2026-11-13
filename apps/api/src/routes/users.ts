import { Router } from 'express'
import { z } from 'zod'
import { AuditLog, Membership, Session, User } from '@nexora/database'
import { digest, hashPassword, randomToken } from '@nexora/security'
import { requireAuth, requireCsrf, requireRole } from '../http.js'

const invitationSchema = z.object({ email: z.string().email().max(254), role: z.enum(['admin', 'operator']) }).strict()
const userUpdateSchema = z.object({ role: z.enum(['admin', 'operator']).optional(), status: z.enum(['active', 'suspended']).optional() }).strict().refine((value) => Object.keys(value).length > 0)

export function createUsersRouter() {
  const router = Router()
  router.use(requireAuth)

  router.get('/', requireRole('admin'), async (req, res) => {
    const memberships = await Membership.find({ organizationId: req.auth!.organizationId })
      .select('userId role status createdAt invitationExpiresAt')
      .sort({ createdAt: 1 })
      .lean()
    const users = await User.find({ _id: { $in: memberships.map((membership) => membership.userId) } })
      .select('email displayName status locale lastLoginAt')
      .lean()
    const userById = new Map(users.map((user) => [user._id.toString(), user]))
    return res.json({
      data: memberships.map((membership) => ({
        id: membership.userId.toString(),
        email: userById.get(membership.userId.toString())?.email,
        displayName: userById.get(membership.userId.toString())?.displayName,
        userStatus: userById.get(membership.userId.toString())?.status,
        role: membership.role,
        membershipStatus: membership.status,
        locale: userById.get(membership.userId.toString())?.locale,
        lastLoginAt: userById.get(membership.userId.toString())?.lastLoginAt ?? null,
        invitationExpiresAt: membership.invitationExpiresAt ?? null,
      })),
      requestId: req.requestId,
    })
  })

  router.post('/invitations', requireRole('admin'), requireCsrf, async (req, res) => {
    const parsed = invitationSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Enter a valid email and role.', requestId: req.requestId } })
    const email = parsed.data.email.toLowerCase()
    const existing = await User.findOne({ email }).select('_id status')
    if (existing && existing.status !== 'invited') return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'An account already exists for this email.', requestId: req.requestId } })
    const invitationToken = randomToken()
    const expiresAt = new Date(Date.now() + 48 * 60 * 60_000)
    const user = existing ?? await User.create({
      email,
      displayName: email.split('@')[0]!.slice(0, 120),
      passwordHash: await hashPassword(randomToken(40)),
      status: 'invited',
    })
    const existingMembership = await Membership.findOne({ userId: user._id, organizationId: req.auth!.organizationId })
    if (existingMembership?.status === 'active') return res.status(409).json({ error: { code: 'MEMBERSHIP_EXISTS', message: 'This account is already a member.', requestId: req.requestId } })
    const membership = existingMembership ?? new Membership({ userId: user._id, organizationId: req.auth!.organizationId })
    membership.role = parsed.data.role
    membership.status = 'invited'
    membership.invitationTokenHash = digest(invitationToken)
    membership.invitationExpiresAt = expiresAt
    membership.invitedBy = req.auth!.userId
    await membership.save()
    await AuditLog.create({ organizationId: req.auth!.organizationId, actorId: req.auth!.userId, action: 'user.invited', resourceType: 'User', resourceId: user.id, requestId: req.requestId, outcome: 'success', redactedMetadata: { role: parsed.data.role } })
    return res.status(201).json({ data: { userId: user.id, email, role: parsed.data.role, invitationToken, expiresAt }, requestId: req.requestId })
  })

  router.patch('/:userId', requireRole('admin'), requireCsrf, async (req, res) => {
    const userId = typeof req.params.userId === 'string' ? req.params.userId : ''
    if (!/^[a-f\d]{24}$/iu.test(userId)) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.', requestId: req.requestId } })
    const parsed = userUpdateSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Provide a valid role or membership status.', requestId: req.requestId } })
    const membership = await Membership.findOne({ userId, organizationId: req.auth!.organizationId })
    if (!membership) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.', requestId: req.requestId } })
    const demotingAdmin = membership.role === 'admin' && (parsed.data.role === 'operator' || parsed.data.status === 'suspended')
    if (demotingAdmin) {
      const adminCount = await Membership.countDocuments({ organizationId: req.auth!.organizationId, role: 'admin', status: 'active' })
      if (adminCount <= 1) return res.status(409).json({ error: { code: 'LAST_ADMIN', message: 'The last active administrator cannot be demoted or suspended.', requestId: req.requestId } })
    }
    if (parsed.data.role) membership.role = parsed.data.role
    if (parsed.data.status) membership.status = parsed.data.status
    await membership.save()
    if (parsed.data.status) {
      if (parsed.data.status === 'suspended') await Session.updateMany({ userId: membership.userId, organizationId: membership.organizationId, revokedAt: null }, { $set: { revokedAt: new Date() } })
    }
    await AuditLog.create({ organizationId: req.auth!.organizationId, actorId: req.auth!.userId, action: 'user.updated', resourceType: 'User', resourceId: membership.userId.toString(), requestId: req.requestId, outcome: 'success', redactedMetadata: { ...(parsed.data.role ? { role: parsed.data.role } : {}), ...(parsed.data.status ? { status: parsed.data.status } : {}) } })
    return res.json({ data: { userId: membership.userId.toString(), role: membership.role, status: membership.status }, requestId: req.requestId })
  })

  router.post('/:userId/revoke-sessions', requireRole('admin'), requireCsrf, async (req, res) => {
    const userId = typeof req.params.userId === 'string' ? req.params.userId : ''
    if (!/^[a-f\d]{24}$/iu.test(userId)) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.', requestId: req.requestId } })
    const member = await Membership.findOne({ userId, organizationId: req.auth!.organizationId }).select('_id')
    if (!member) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.', requestId: req.requestId } })
    const result = await Session.updateMany({ userId, organizationId: req.auth!.organizationId, revokedAt: null }, { $set: { revokedAt: new Date() } })
    await AuditLog.create({ organizationId: req.auth!.organizationId, actorId: req.auth!.userId, action: 'user.sessions_revoked', resourceType: 'User', resourceId: userId, requestId: req.requestId, outcome: 'success', redactedMetadata: { count: result.modifiedCount } })
    return res.json({ data: { revoked: result.modifiedCount }, requestId: req.requestId })
  })

  router.get('/audit-logs', requireRole('admin'), async (req, res) => {
    const limit = Math.min(Number.parseInt(req.query.limit as string, 10) || 50, 100)
    const filter: Record<string, unknown> = { organizationId: req.auth!.organizationId }
    if (typeof req.query.before === 'string' && /^[a-f\d]{24}$/iu.test(req.query.before)) filter._id = { $lt: req.query.before }
    const logs = await AuditLog.find(filter).sort({ _id: -1 }).limit(limit).lean()
    return res.json({ data: logs.map(({ _id, actorId, action, resourceType, resourceId, occurredAt, outcome, redactedMetadata }) => ({ id: _id.toString(), actorId: actorId?.toString() ?? null, action, resourceType: resourceType ?? null, resourceId: resourceId ?? null, occurredAt, outcome, metadata: redactedMetadata })), page: { limit, hasMore: logs.length === limit, nextCursor: logs.at(-1)?._id.toString() ?? null }, requestId: req.requestId })
  })

  return router
}
