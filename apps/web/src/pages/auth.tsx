import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, LoaderCircle, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@nexora/ui/components/navigation/theme-toggle'
import { ApiError, apiPublicRequest, type UserIdentity } from '../lib/api'
import { useAuth } from '../providers/auth-provider'

type LoginResult = {
  user?: UserIdentity
  csrfToken?: string
  challengeToken?: string
  mfaSetupRequired?: boolean
}

function AuthFrame({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#17133a] via-[#292063] to-[#15364e] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-36 -top-36 size-[520px] rounded-full border border-white/10" />
        <div className="absolute -right-12 -top-12 size-[270px] rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3"><img src="/nexora-mark.svg" alt="" className="size-10" /><span className="text-xl font-semibold tracking-tight">Nexora</span></div>
        <div className="relative max-w-xl pb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{t('tagline')}</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">A clearer path from opportunity to delivery.</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/70">Research, proposals, and client work in one private workspace.</p>
        </div>
        <p className="relative text-xs text-white/50">Nexora · Private workspace</p>
      </section>
      <section className="flex min-h-svh flex-col px-5 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden"><img src="/nexora-mark.svg" alt="" className="size-8" /><span className="font-semibold">Nexora</span></div>
          <ThemeToggle label={t('toggleTheme')} />
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">{children}</div>
        <p className="text-center text-xs text-muted-foreground">{t('tagline')}</p>
      </section>
    </main>
  )
}

export function LoginPage() {
  const { t } = useTranslation()
  const { user, completeSignIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />

  const finish = (result: LoginResult) => {
    if (!result.user || !result.csrfToken) throw new Error('The sign-in response was incomplete.')
    completeSignIn(result.user, result.csrfToken)
    const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
    navigate(from, { replace: true })
  }

  const submitCredentials = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await apiPublicRequest<LoginResult>('/auth/login', { email, password })
      if (result.challengeToken) {
        setChallenge(result.challengeToken)
        if (result.mfaSetupRequired) {
          const setup = await apiPublicRequest<{ secret: string }>('/auth/mfa/setup', { challengeToken: result.challengeToken })
          setMfaSecret(setup.secret)
        }
      } else finish(result)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('unknownError'))
    } finally { setBusy(false) }
  }

  const submitCode = async (event: FormEvent) => {
    event.preventDefault()
    if (!challenge) return
    setError('')
    setBusy(true)
    try {
      const result = await apiPublicRequest<LoginResult>('/auth/mfa/verify', { challengeToken: challenge, code })
      finish(result)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('unknownError'))
    } finally { setBusy(false) }
  }

  return (
    <AuthFrame>
      {!challenge ? <>
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">{t('signInTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('signInDescription')}</p>
        </div>
        <form onSubmit={(event) => void submitCredentials(event)} className="space-y-5">
          <label className="block text-sm font-medium">{t('email')}
            <input className="mt-2 h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/30" autoComplete="username" type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm font-medium">{t('password')}
            <input className="mt-2 h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/30" autoComplete="current-password" type="password" required maxLength={200} value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60" disabled={busy}>
            {busy ? <LoaderCircle size={17} className="animate-spin" /> : <>{t('signIn')}<ArrowRight size={16} /></>}
          </button>
        </form>
      </> : <>
        <div className="mb-7 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck size={23} /></div>
        <h2 className="text-2xl font-semibold tracking-tight">{mfaSecret ? t('mfaTitle') : t('authenticatorCode')}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{mfaSecret ? t('mfaDescription') : t('signInDescription')}</p>
        {mfaSecret && <div className="my-5 rounded-lg border border-border bg-muted/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">Authenticator setup key</p>
          <code className="mt-1 block break-all font-mono text-sm font-semibold tracking-wider">{mfaSecret}</code>
        </div>}
        <form onSubmit={(event) => void submitCode(event)} className="mt-5 space-y-5">
          <label className="block text-sm font-medium">{t('authenticatorCode')}
            <input className="mt-2 h-12 w-full rounded-lg border border-input bg-surface px-3.5 text-center font-mono text-lg tracking-[0.35em] outline-none focus-visible:ring-3 focus-visible:ring-ring/30" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/gu, '').slice(0, 6))} />
          </label>
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60" disabled={busy || code.length !== 6}>
            {busy ? <LoaderCircle size={17} className="animate-spin" /> : t('continue')}
          </button>
          <button type="button" className="w-full rounded-md py-2 text-sm text-muted-foreground hover:text-foreground" onClick={() => { setChallenge(''); setMfaSecret(''); setCode(''); setError('') }}>{t('cancel')}</button>
        </form>
      </>}
    </AuthFrame>
  )
}

export function InvitePage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await apiPublicRequest('/auth/accept-invitation', { invitationToken: token, displayName, password })
      navigate('/login', { replace: true })
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : t('unknownError'))
    } finally { setBusy(false) }
  }
  return (
    <AuthFrame>
      <h2 className="text-3xl font-semibold tracking-tight">{t('invitationTitle')}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('invitationDescription')}</p>
      {!token ? <p role="alert" className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">This invitation link is incomplete.</p> : <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-5">
        <label className="block text-sm font-medium">{t('displayName')}<input className="mt-2 h-11 w-full rounded-lg border border-input bg-surface px-3.5" required minLength={2} maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
        <label className="block text-sm font-medium">{t('password')}<input className="mt-2 h-11 w-full rounded-lg border border-input bg-surface px-3.5" type="password" autoComplete="new-password" required minLength={12} maxLength={200} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <p className="-mt-3 text-xs text-muted-foreground">{t('passwordRule')}</p>
        {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
        <button className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60" disabled={busy}>{busy ? t('loading') : t('acceptInvitation')}</button>
        <Link className="block text-center text-sm text-muted-foreground hover:text-foreground" to="/login">{t('signIn')}</Link>
      </form>}
    </AuthFrame>
  )
}
