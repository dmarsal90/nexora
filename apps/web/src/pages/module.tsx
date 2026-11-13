import { useTranslation } from 'react-i18next'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/page-header'

export function ModulePage({ module, phase }: { module: string; phase: number }) {
  const { t } = useTranslation()
  return <>
    <PageHeader title={module} />
    <section className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole size={22} /></span>
      <h2 className="mt-5 text-lg font-semibold">{t('moduleComing', { module, phase })}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('foundationNote')}</p>
      <Link to="/dashboard" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-sm font-medium hover:bg-muted"><ArrowLeft size={16} />{t('backToDashboard')}</Link>
    </section>
  </>
}
