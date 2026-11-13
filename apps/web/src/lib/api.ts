const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
let csrfToken = ''

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string, public requestId?: string) { super(message) }
}

export type UserIdentity = {
  id: string
  email: string
  displayName: string
  role: 'admin' | 'operator'
  organizationId: string
  mfaEnabled: boolean
}

type Envelope<T> = { data: T; requestId?: string; error?: { code?: string; message?: string } }

export function setCsrfToken(token: string) { csrfToken = token }

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const method = (init.method ?? 'GET').toUpperCase()
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) headers.set('X-CSRF-Token', csrfToken)
  let response: Response
  try {
    response = await fetch(`${apiBase}${path}`, { ...init, method, headers, credentials: 'include' })
  } catch {
    throw new ApiError(0, 'The API could not be reached.')
  }
  const body = (await response.json().catch(() => ({}))) as Envelope<T>
  if (!response.ok) throw new ApiError(response.status, body.error?.message ?? 'The request could not be completed.', body.error?.code, body.requestId)
  return body.data
}

export function apiPublicRequest<T>(path: string, body: unknown) {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) })
}
