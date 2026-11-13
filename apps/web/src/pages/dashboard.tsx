import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/page-header'
import { apiRequest, ApiError } from '../lib/api'

type Summary = { organizationName: string; defaultLocale: 'en' | 'es'; activeMembers: number; recentActivity: Array<{ action: string; resourceType: string | null; resourceId: string | null; occurredAt: string; outcome: string }> }

export function DashboardPage() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let current = true
    apiRequest<Summary>('/dashboard/summary').then((data) => { if (current) setSummary(data) })
      .catch((cause: unknown) => { if (current) setError(cause instanceof ApiError ? cause.message : t('unknownError')) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [t])

  return <>
    <PageHeader title={summary?.organizationName ?? t('dashboard')} description={t('welcome')} />
    {error && <div role="alert" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{t('activeMembers')}</p><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Users size={19} /></span></div>
        <p className="mt-5 text-3xl font-semibold tracking-tight">{loading ? '—' : summary?.activeMembers ?? '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('workspace')}</p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between"><p className="text-sm font-medium text-muted-foreground">{t('recentActivity')}</p><span className="grid size-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"><Activity size={19} /></span></div>
        <p className="mt-5 text-3xl font-semibold tracking-tight">{loading ? '—' : summary?.recentActivity.length ?? '—'}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('recentActivity')}</p>
      </section>
      <section className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] to-accent/[0.08] p-5 shadow-sm sm:col-span-2 xl:col-span-1">
        <p className="text-sm font-semibold">{t('foundationNote')}</p>
        <Link to="/settings" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">{t('settings')}<ArrowUpRight size={16} /></Link>
      </section>
    </div>
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">{t('recentActivity')}</h2><Link to="/settings/audit-log" className="text-sm font-medium text-primary hover:underline">{t('auditLog')}</Link></div>
      {loading ? <div className="mt-5 h-20 animate-pulse rounded-lg bg-muted" /> : summary?.recentActivity.length ? <ul className="mt-4 divide-y divide-border">
        {summary.recentActivity.map((item, index) => <li key={`${item.action}-${item.occurredAt}-${index}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
          <span className="font-medium">{item.action.replaceAll('.', ' ')}</span>
          <time className="text-xs text-muted-foreground" dateTime={item.occurredAt}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.occurredAt))}</time>
        </li>)}
      </ul> : <p className="mt-5 rounded-xl bg-muted/60 px-4 py-8 text-center text-sm text-muted-foreground">{t('noActivity')}</p>}
    </section>
  </>
}
