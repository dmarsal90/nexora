import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest, setCsrfToken, type UserIdentity } from '../lib/api'

type AuthContextValue = {
  user: UserIdentity | null
  loading: boolean
  refresh: () => Promise<void>
  completeSignIn: (user: UserIdentity, csrfToken: string) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserIdentity | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = useCallback(async () => {
    try {
      const result = await apiRequest<{ user: UserIdentity; csrfToken: string }>('/auth/me')
      setCsrfToken(result.csrfToken)
      setUser(result.user)
    } catch {
      setCsrfToken('')
      setUser(null)
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  const completeSignIn = useCallback((identity: UserIdentity, token: string) => {
    setCsrfToken(token)
    setUser(identity)
    setLoading(false)
  }, [])
  const signOut = useCallback(async () => {
    try { await apiRequest('/auth/logout', { method: 'POST' }) } finally {
      setCsrfToken('')
      setUser(null)
    }
  }, [])
  const value = useMemo(() => ({ user, loading, refresh, completeSignIn, signOut }), [user, loading, refresh, completeSignIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
