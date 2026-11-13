import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../providers/auth-provider'

export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  if (loading) return <main className="grid min-h-svh place-items-center text-sm text-muted-foreground">{t('loading')}</main>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children ? <>{children}</> : <Outlet />
}
