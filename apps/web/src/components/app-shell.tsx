import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, BarChart3, BriefcaseBusiness, Building2, ChevronLeft, ChevronRight, Compass, FileText, LayoutDashboard, LogOut, Menu, SearchCheck, Settings, ShieldCheck, Sparkles, Users, X } from 'lucide-react'
import { ThemeToggle } from '@nexora/ui/components/navigation/theme-toggle'
import { useAuth } from '../providers/auth-provider'
import i18n from '../i18n'

const navigation = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { to: '/discover', key: 'discover', icon: Compass },
  { to: '/verify', key: 'verify', icon: SearchCheck },
  { to: '/audit', key: 'audit', icon: ShieldCheck },
  { to: '/intelligence', key: 'intelligence', icon: Sparkles },
  { to: '/leads', key: 'leads', icon: Building2 },
  { to: '/studio', key: 'studio', icon: Sparkles },
  { to: '/proposals', key: 'proposals', icon: FileText },
  { to: '/outreach', key: 'outreach', icon: Activity },
  { to: '/crm', key: 'crm', icon: BriefcaseBusiness },
  { to: '/projects', key: 'projects', icon: Building2 },
  { to: '/analytics', key: 'analytics', icon: BarChart3 },
]

export function AppShell() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebar = (
    <aside className={`flex h-full flex-col bg-sidebar text-sidebar-foreground ${collapsed ? 'w-[76px]' : 'w-[248px]'}`}>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <img src="/nexora-mark.svg" alt="" className="size-8 shrink-0" />
        {!collapsed && <span className="text-base font-semibold tracking-tight">Nexora</span>}
        <button type="button" className="ml-auto hidden size-8 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground lg:inline-flex" aria-label={collapsed ? t('expandSidebar') : t('collapseSidebar')} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
        <button type="button" className="ml-auto inline-flex size-8 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-hover lg:hidden" aria-label={t('closeMenu')} onClick={() => setMobileOpen(false)}><X size={18} /></button>
      </div>
      <nav aria-label={t('navigation')} className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">{t('overview')}</p>}
        {navigation.map(({ to, key, icon: Icon }) => (
          <NavLink key={to} to={to} title={collapsed ? t(key) : undefined} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${isActive ? 'bg-sidebar-active text-white shadow-sm' : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'} ${collapsed ? 'justify-center px-0' : ''}`}>
            <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
            {!collapsed && <span>{t(key)}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <NavLink to="/settings" title={collapsed ? t('settings') : undefined} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm ${isActive ? 'bg-sidebar-active text-white' : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'} ${collapsed ? 'justify-center px-0' : ''}`}>
          <Settings aria-hidden="true" size={18} strokeWidth={1.8} />{!collapsed && <span>{t('settings')}</span>}
        </NavLink>
        {user?.role === 'admin' && <NavLink to="/settings/users" title={collapsed ? t('usersAndRoles') : undefined} onClick={() => setMobileOpen(false)} className={({ isActive }) => `mt-1 flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm ${isActive ? 'bg-sidebar-active text-white' : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground'} ${collapsed ? 'justify-center px-0' : ''}`}>
          <Users aria-hidden="true" size={18} strokeWidth={1.8} />{!collapsed && <span>{t('usersAndRoles')}</span>}
        </NavLink>}
      </div>
    </aside>
  )

  const locale = i18n.language.startsWith('es') ? 'es' : 'en'
  const changeLocale = (next: 'en' | 'es') => {
    localStorage.setItem('nexora-locale', next)
    void i18n.changeLanguage(next)
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden">
        <button className="absolute inset-0 bg-black/45" aria-label={t('closeMenu')} onClick={() => setMobileOpen(false)} />
        <div className="relative h-full w-[min(84vw,280px)] shadow-2xl">{sidebar}</div>
      </div>}
      <div className={`min-h-svh transition-[padding] duration-200 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[248px]'}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="inline-flex size-9 items-center justify-center rounded-lg border border-border lg:hidden" aria-label={t('openMenu')} onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
            <div className="hidden text-sm text-muted-foreground sm:block">{t('workspace')} <span className="mx-1.5 text-border">/</span> <span className="font-medium text-foreground">{user?.displayName}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5" aria-label={t('language')}>
              <button type="button" onClick={() => changeLocale('en')} aria-pressed={locale === 'en'} className={`min-h-8 rounded-md px-2 text-xs font-semibold ${locale === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>EN</button>
              <button type="button" onClick={() => changeLocale('es')} aria-pressed={locale === 'es'} className={`min-h-8 rounded-md px-2 text-xs font-semibold ${locale === 'es' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>ES</button>
            </div>
            <ThemeToggle label={t('toggleTheme')} />
            <div className="ml-1 hidden border-l border-border pl-3 sm:block">
              <p className="max-w-36 truncate text-sm font-medium">{user?.displayName}</p>
              <p className="text-xs capitalize text-muted-foreground">{user?.role === 'admin' ? t('admin') : t('operator')}</p>
            </div>
            <button type="button" onClick={() => void signOut().then(() => navigate('/login'))} className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('signOut')} title={t('signOut')}><LogOut size={17} /></button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><Outlet /></main>
      </div>
    </div>
  )
}
