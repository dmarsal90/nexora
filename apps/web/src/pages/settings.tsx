import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, KeyRound, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/page-header'
import { ApiError, apiRequest } from '../lib/api'
import { useAuth } from '../providers/auth-provider'
import i18n from '../i18n'

type TeamMember = { id: string; email: string; displayName: string; userStatus: string; role: 'admin' | 'operator'; membershipStatus: 'active' | 'invited' | 'suspended'; lastLoginAt?: string | null }
type AuditItem = { id: string; actorId: string | null; action: string; resourceType: string | null; resourceId: string | null; occurredAt: string; outcome: string }

function ErrorMessage({ message }: { message: string }) { return <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{message}</p> }

export function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [locale, setLocale] = useState(i18n.language.startsWith('es') ? 'es' : 'en')
  const [saved, setSaved] = useState(false)
  const changeLocale = (next: 'en' | 'es') => {
    setLocale(next)
    localStorage.setItem('nexora-locale', next)
    void i18n.changeLanguage(next)
    setSaved(true)
  }
  return <>
    <PageHeader title={t('settings')} description={t('profilePreferences')} />
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold">{t('profilePreferences')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{user?.displayName} · {user?.email}</p>
        <label className="mt-6 block max-w-sm text-sm font-medium">{t('language')}
          <select className="mt-2 h-11 w-full rounded-lg border border-input bg-surface px-3" value={locale} onChange={(event) => changeLocale(event.target.value as 'en' | 'es')}>
            <option value="en">English</option><option value="es">Español</option>
          </select>
        </label>
        {saved && <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300"><Check size={14} />{t('save')}</p>}
      </section>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><ShieldCheck className="text-primary" size={20} /><h2 className="font-semibold">{t('security')}</h2></div>
        <p className="mt-4 text-sm">{user?.mfaEnabled ? t('mfaEnabled') : t('mfaRequired')}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t(user?.role === 'admin' ? 'admin' : 'operator')}</p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-2">
        <div className="flex items-center gap-3"><KeyRound className="text-primary" size={20} /><h2 className="font-semibold">{t('integrations')}</h2></div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t('integrationsNote')}</p>
      </section>
      {user?.role === 'admin' && <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-2">
        <div className="flex items-center gap-3"><Users className="text-primary" size={20} /><h2 className="font-semibold">{t('usersAndRoles')}</h2></div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/settings/users" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground"><Users size={16} />{t('userManagement')}</Link>
          <Link to="/settings/audit-log" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium hover:bg-muted"><ShieldCheck size={16} />{t('auditLog')}</Link>
        </div>
      </section>}
    </div>
  </>
}

export function UsersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [users, setUsers] = useState<TeamMember[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'operator'>('operator')
  const [inviteUrl, setInviteUrl] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const refresh = useCallback(async () => {
    try { setUsers(await apiRequest<TeamMember[]>('/users')) }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : t('unknownError')) }
  }, [t])
  useEffect(() => { if (user?.role === 'admin') void refresh() }, [refresh, user?.role])
  if (user?.role !== 'admin') return <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{t('noPermission')}</section>

  const invite = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true); setError(''); setInviteUrl('')
    try {
      const result = await apiRequest<{ invitationToken: string }>('/users/invitations', { method: 'POST', body: JSON.stringify({ email, role }) })
      setInviteUrl(`${window.location.origin}/invite?token=${encodeURIComponent(result.invitationToken)}`)
      setEmail('')
      await refresh()
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : t('unknownError')) }
    finally { setBusy(false) }
  }
  const update = async (member: TeamMember, change: { role?: 'admin' | 'operator'; status?: 'active' | 'suspended' }) => {
    setError('')
    try { await apiRequest(`/users/${member.id}`, { method: 'PATCH', body: JSON.stringify(change) }); await refresh() }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : t('unknownError')) }
  }
  const revoke = async (member: TeamMember) => {
    setError('')
    try { await apiRequest(`/users/${member.id}/revoke-sessions`, { method: 'POST' }); await refresh() }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : t('unknownError')) }
  }
  const copyLink = async () => { await navigator.clipboard.writeText(inviteUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1600) }

  return <>
    <PageHeader title={t('userManagement')} description={t('usersAndRoles')} />
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><UserPlus size={18} /></span><h2 className="font-semibold">{t('inviteUser')}</h2></div>
      <form onSubmit={(event) => void invite(event)} className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px_auto]">
        <label className="text-sm font-medium">{t('email')}<input className="mt-1.5 h-10 w-full rounded-lg border border-input bg-surface px-3" type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="text-sm font-medium">{t('role')}<select className="mt-1.5 h-10 w-full rounded-lg border border-input bg-surface px-3" value={role} onChange={(event) => setRole(event.target.value as 'admin' | 'operator')}><option value="operator">{t('operator')}</option><option value="admin">{t('admin')}</option></select></label>
        <button disabled={busy} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy ? t('loading') : t('sendInvitation')}</button>
      </form>
      {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
      {inviteUrl && <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
        <p className="text-sm font-medium">{t('invitationReady')}</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row"><input className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-surface px-3 text-xs" readOnly value={inviteUrl} aria-label={t('invitationReady')} /><button type="button" onClick={() => void copyLink()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium"><Copy size={15} />{copied ? t('copied') : t('copyLink')}</button></div>
      </div>}
    </section>
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4"><h2 className="font-semibold">{t('usersAndRoles')}</h2></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-5 py-3">{t('email')}</th><th scope="col" className="px-5 py-3">{t('role')}</th><th scope="col" className="px-5 py-3">{t('status')}</th><th scope="col" className="px-5 py-3">{t('revokeSessions')}</th></tr></thead>
        <tbody className="divide-y divide-border">{users.map((member) => <tr key={member.id}>
          <td className="px-5 py-3.5"><p className="font-medium">{member.displayName}</p><p className="text-xs text-muted-foreground">{member.email}</p></td>
          <td className="px-5 py-3.5"><select className="h-9 rounded-md border border-input bg-surface px-2" value={member.role} onChange={(event) => void update(member, { role: event.target.value as 'admin' | 'operator' })} aria-label={`${t('changeRole')}: ${member.email}`}><option value="admin">{t('admin')}</option><option value="operator">{t('operator')}</option></select></td>
          <td className="px-5 py-3.5"><select className="h-9 rounded-md border border-input bg-surface px-2" value={member.membershipStatus} onChange={(event) => void update(member, { status: event.target.value as 'active' | 'suspended' })} aria-label={`${t('status')}: ${member.email}`}><option value="active">{t('active')}</option><option value="suspended">{t('suspended')}</option><option value="invited" disabled>{t('invited')}</option></select></td>
          <td className="px-5 py-3.5"><button type="button" onClick={() => void revoke(member)} disabled={member.membershipStatus !== 'active'} className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium disabled:opacity-50">{t('revokeSessions')}</button></td>
        </tr>)}</tbody></table></div>
      {!users.length && <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t('noUsers')}</p>}
    </section>
  </>
}

export function AuditLogPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [items, setItems] = useState<AuditItem[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (user?.role !== 'admin') return
    apiRequest<{ data: AuditItem[] }>('/users/audit-logs').then((result) => setItems(result.data)).catch((cause: unknown) => setError(cause instanceof ApiError ? cause.message : t('unknownError')))
  }, [t, user?.role])
  if (user?.role !== 'admin') return <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{t('noPermission')}</section>
  return <>
    <PageHeader title={t('auditLog')} />
    {error && <ErrorMessage message={error} />}
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-5 py-3">Action</th><th scope="col" className="px-5 py-3">Resource</th><th scope="col" className="px-5 py-3">{t('status')}</th><th scope="col" className="px-5 py-3">Time</th></tr></thead><tbody className="divide-y divide-border">{items.map((item) => <tr key={item.id}><td className="px-5 py-3.5 font-medium">{item.action}</td><td className="px-5 py-3.5 text-muted-foreground">{item.resourceType ?? '—'} {item.resourceId ?? ''}</td><td className="px-5 py-3.5">{item.outcome}</td><td className="px-5 py-3.5 text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.occurredAt))}</td></tr>)}</tbody></table></div>
      {!items.length && !error && <p className="px-5 py-8 text-center text-sm text-muted-foreground">{t('noActivity')}</p>}
    </section>
  </>
}
