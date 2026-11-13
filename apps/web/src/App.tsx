import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/app-shell'
import { RequireAuth } from './components/require-auth'
import { DashboardPage } from './pages/dashboard'
import { InvitePage, LoginPage } from './pages/auth'
import { AuditLogPage, SettingsPage, UsersPage } from './pages/settings'
import { ModulePage } from './pages/module'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/users" element={<UsersPage />} />
        <Route path="/settings/audit-log" element={<AuditLogPage />} />
        <Route path="/discover" element={<ModulePage module="Discover" phase={2} />} />
        <Route path="/verify" element={<ModulePage module="Verify" phase={2} />} />
        <Route path="/audit" element={<ModulePage module="Audit" phase={3} />} />
        <Route path="/intelligence" element={<ModulePage module="Intelligence" phase={3} />} />
        <Route path="/leads" element={<ModulePage module="Leads" phase={2} />} />
        <Route path="/studio" element={<ModulePage module="Nexora Studio" phase={4} />} />
        <Route path="/proposals" element={<ModulePage module="Proposals" phase={5} />} />
        <Route path="/outreach" element={<ModulePage module="Outreach" phase={5} />} />
        <Route path="/crm" element={<ModulePage module="CRM" phase={6} />} />
        <Route path="/projects" element={<ModulePage module="Projects" phase={6} />} />
        <Route path="/analytics" element={<ModulePage module="Analytics" phase={7} />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
