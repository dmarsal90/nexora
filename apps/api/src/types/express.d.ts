import type { Types } from 'mongoose'

declare global {
  namespace Express {
    interface Request {
      requestId: string
      auth?: {
        userId: Types.ObjectId
        organizationId: Types.ObjectId
        role: 'admin' | 'operator'
        displayName: string
        email: string
        mfaEnabled: boolean
        sessionId: Types.ObjectId
        csrfHash: string
      }
    }
  }
}

export {}
