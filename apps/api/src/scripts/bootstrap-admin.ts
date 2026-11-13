import { connectDatabase, disconnectDatabase, Membership, Organization, User } from '@nexora/database'
import { hashPassword } from '@nexora/security'
import { loadConfig } from '../config.js'

async function bootstrap() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD
  const organizationName = process.env.BOOTSTRAP_ORGANIZATION_NAME?.trim() || 'Nexora'
  if (!email || !password) throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD for this one-time command.')
  if (password.length < 16) throw new Error('The initial admin password must contain at least 16 characters.')
  const config = loadConfig()
  await connectDatabase(config.MONGODB_URI)
  try {
    if (await Membership.exists({ role: 'admin', status: 'active' })) throw new Error('An active administrator already exists; bootstrap is disabled.')
    if (await User.exists({ email })) throw new Error('A user with this email already exists.')
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/(^-|-$)/gu, '') || 'nexora'
    const organization = await Organization.create({ name: organizationName, slug, defaultLocale: 'en', currency: 'USD' })
    const user = await User.create({ email, displayName: email.split('@')[0]!.slice(0, 120), passwordHash: await hashPassword(password), status: 'active' })
    await Membership.create({ userId: user._id, organizationId: organization._id, role: 'admin', status: 'active' })
    process.stdout.write(`Initial administrator created for ${email}. The first login will require TOTP enrollment. Remove bootstrap credentials from the environment now.\n`)
  } finally {
    await disconnectDatabase()
  }
}

bootstrap().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : 'Bootstrap failed'}\n`)
  process.exitCode = 1
})
