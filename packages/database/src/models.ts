import mongoose, { Schema, model, type Model, type Types } from 'mongoose'

const timestamps = { timestamps: true, versionKey: 'version' as const }

type OrganizationRecord = { name: string; slug: string; status: 'active' | 'archived'; defaultLocale: 'en' | 'es'; timezone: string; currency: 'USD' }
type UserRecord = { email: string; displayName: string; passwordHash: string; locale: 'en' | 'es'; status: 'invited' | 'active' | 'disabled'; mfa: { enabled: boolean; secretCiphertext?: string; recoveryCodeHashes: string[] }; lastLoginAt?: Date }
type MembershipRecord = { userId: Types.ObjectId; organizationId: Types.ObjectId; role: 'admin' | 'operator'; status: 'invited' | 'active' | 'suspended'; invitationTokenHash?: string; invitationExpiresAt?: Date; invitationAcceptedAt?: Date; invitedBy?: Types.ObjectId }
type SessionRecord = { userId: Types.ObjectId; organizationId: Types.ObjectId; tokenHash: string; csrfHash: string; csrfCiphertext: string; lastSeenAt: Date; expiresAt: Date; revokedAt?: Date; userAgentSummary?: string }
type AuthChallengeRecord = { userId: Types.ObjectId; organizationId: Types.ObjectId; tokenHash: string; purpose: 'login' | 'mfa_enroll'; secretCiphertext?: string; attempts: number; expiresAt: Date; consumedAt?: Date }
type AuditLogRecord = { organizationId: Types.ObjectId; actorId?: Types.ObjectId; action: string; resourceType?: string; resourceId?: string; occurredAt: Date; requestId: string; outcome: 'success' | 'denied' | 'failure'; redactedMetadata: Record<string, unknown> }

const organizationSchema = new Schema<OrganizationRecord>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    defaultLocale: { type: String, enum: ['en', 'es'], default: 'en' },
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, enum: ['USD'], default: 'USD' },
  },
  timestamps,
)

const userSchema = new Schema<UserRecord>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, maxlength: 254 },
    displayName: { type: String, required: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    locale: { type: String, enum: ['en', 'es'], default: 'en' },
    status: { type: String, enum: ['invited', 'active', 'disabled'], default: 'invited' },
    mfa: {
      enabled: { type: Boolean, default: false },
      secretCiphertext: { type: String, select: false },
      recoveryCodeHashes: { type: [String], default: [], select: false },
    },
    lastLoginAt: Date,
  },
  timestamps,
)

const membershipSchema = new Schema<MembershipRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    role: { type: String, enum: ['admin', 'operator'], required: true },
    status: { type: String, enum: ['invited', 'active', 'suspended'], default: 'invited' },
    invitationTokenHash: { type: String, select: false },
    invitationExpiresAt: Date,
    invitationAcceptedAt: Date,
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  timestamps,
)
membershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true })
membershipSchema.index({ invitationTokenHash: 1 }, { unique: true, sparse: true })

const sessionSchema = new Schema<SessionRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    csrfHash: { type: String, required: true, select: false },
    csrfCiphertext: { type: String, required: true, select: false },
    lastSeenAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    userAgentSummary: { type: String, maxlength: 256 },
  },
  timestamps,
)
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
sessionSchema.index({ userId: 1, revokedAt: 1 })

const authChallengeSchema = new Schema<AuthChallengeRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    purpose: { type: String, enum: ['login', 'mfa_enroll'], required: true },
    secretCiphertext: { type: String, select: false },
    attempts: { type: Number, default: 0, min: 0, max: 5 },
    expiresAt: { type: Date, required: true },
    consumedAt: Date,
  },
  timestamps,
)
authChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const auditLogSchema = new Schema<AuditLogRecord>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, maxlength: 100 },
    resourceType: { type: String, maxlength: 80 },
    resourceId: { type: String, maxlength: 100 },
    occurredAt: { type: Date, required: true, default: Date.now },
    requestId: { type: String, required: true },
    outcome: { type: String, enum: ['success', 'denied', 'failure'], required: true },
    redactedMetadata: { type: Schema.Types.Mixed, default: {} },
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: false } },
)
auditLogSchema.index({ organizationId: 1, occurredAt: -1 })
auditLogSchema.index({ organizationId: 1, action: 1, occurredAt: -1 })

export const Organization = (mongoose.models.Organization as Model<OrganizationRecord> | undefined) ?? model<OrganizationRecord>('Organization', organizationSchema)
export const User = (mongoose.models.User as Model<UserRecord> | undefined) ?? model<UserRecord>('User', userSchema)
export const Membership = (mongoose.models.Membership as Model<MembershipRecord> | undefined) ?? model<MembershipRecord>('Membership', membershipSchema)
export const Session = (mongoose.models.Session as Model<SessionRecord> | undefined) ?? model<SessionRecord>('Session', sessionSchema)
export const AuthChallenge = (mongoose.models.AuthChallenge as Model<AuthChallengeRecord> | undefined) ?? model<AuthChallengeRecord>('AuthChallenge', authChallengeSchema)
export const AuditLog = (mongoose.models.AuditLog as Model<AuditLogRecord> | undefined) ?? model<AuditLogRecord>('AuditLog', auditLogSchema)

export type Role = 'admin' | 'operator'
