import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appName: 'Nexora', tagline: 'Private business intelligence', signIn: 'Sign in', signInTitle: 'Welcome back',
      signInDescription: 'Sign in to your private Nexora workspace.', email: 'Email address', password: 'Password', displayName: 'Full name',
      role: 'Role', admin: 'Administrator', operator: 'Operator', authenticatorCode: '6-digit authenticator code',
      mfaTitle: 'Secure your administrator account', mfaDescription: 'Add this key to your authenticator app, then enter the current code.',
      continue: 'Continue', cancel: 'Cancel', language: 'Language', toggleTheme: 'Toggle light and dark theme', dashboard: 'Dashboard',
      discover: 'Discover', verify: 'Verify', audit: 'Audit', intelligence: 'Intelligence', leads: 'Leads', studio: 'Nexora Studio',
      proposals: 'Proposals', outreach: 'Outreach', crm: 'CRM', projects: 'Projects', analytics: 'Analytics', settings: 'Settings',
      usersAndRoles: 'Users & roles', auditLog: 'Audit log', signOut: 'Sign out', workspace: 'Workspace', overview: 'Overview',
      activeMembers: 'Active team members', recentActivity: 'Recent activity', noActivity: 'No recorded activity yet.',
      welcome: 'Your private workspace is ready.', foundationNote: 'The foundation is active. Commercial modules will appear as their phases are delivered.',
      moduleComing: '{{module}} is planned for Phase {{phase}}.', backToDashboard: 'Back to dashboard', userManagement: 'Team members',
      inviteUser: 'Invite a user', sendInvitation: 'Create invitation', invitationReady: 'Invitation link (copy and share securely)',
      copyLink: 'Copy invitation link', copied: 'Copied', noUsers: 'No team members found.', status: 'Status', active: 'Active',
      invited: 'Invited', suspended: 'Suspended', changeRole: 'Change role', revokeSessions: 'Revoke sessions', save: 'Save changes',
      profilePreferences: 'Profile and preferences', integrations: 'Integrations',
      integrationsNote: 'Provider connections will be enabled after their credentials and data terms are reviewed.', security: 'Security',
      mfaEnabled: 'Authenticator MFA enabled', mfaRequired: 'Administrators must enroll in MFA during their first sign-in.',
      noPermission: 'You do not have permission to view this page.', loading: 'Loading…', errorGeneric: 'Something went wrong. Try again.',
      invitationTitle: 'Accept your Nexora invitation', invitationDescription: 'Set your name and password to join the private workspace.',
      acceptInvitation: 'Accept invitation', passwordRule: 'Use at least 12 characters.', navigation: 'Main navigation',
      collapseSidebar: 'Collapse navigation', expandSidebar: 'Expand navigation', openMenu: 'Open menu', closeMenu: 'Close menu',
      unknownError: 'The request could not be completed.', apiConfiguration: 'API configuration',
    },
  },
  es: {
    translation: {
      appName: 'Nexora', tagline: 'Inteligencia comercial privada', signIn: 'Iniciar sesión', signInTitle: 'Bienvenido de nuevo',
      signInDescription: 'Accede a tu espacio privado de Nexora.', email: 'Correo electrónico', password: 'Contraseña', displayName: 'Nombre completo',
      role: 'Rol', admin: 'Administrador', operator: 'Operador', authenticatorCode: 'Código de autenticación de 6 dígitos',
      mfaTitle: 'Protege tu cuenta de administrador', mfaDescription: 'Añade esta clave a tu app de autenticación e introduce el código actual.',
      continue: 'Continuar', cancel: 'Cancelar', language: 'Idioma', toggleTheme: 'Cambiar entre tema claro y oscuro', dashboard: 'Panel',
      discover: 'Descubrir', verify: 'Verificar', audit: 'Auditoría', intelligence: 'Inteligencia', leads: 'Leads', studio: 'Nexora Studio',
      proposals: 'Propuestas', outreach: 'Contacto', crm: 'CRM', projects: 'Proyectos', analytics: 'Analítica', settings: 'Configuración',
      usersAndRoles: 'Usuarios y roles', auditLog: 'Registro de auditoría', signOut: 'Cerrar sesión', workspace: 'Espacio de trabajo', overview: 'Resumen',
      activeMembers: 'Miembros activos', recentActivity: 'Actividad reciente', noActivity: 'Todavía no hay actividad registrada.',
      welcome: 'Tu espacio privado está listo.', foundationNote: 'La base está activa. Los módulos comerciales aparecerán al completar sus fases.',
      moduleComing: '{{module}} está planificado para la Fase {{phase}}.', backToDashboard: 'Volver al panel', userManagement: 'Miembros del equipo',
      inviteUser: 'Invitar a un usuario', sendInvitation: 'Crear invitación', invitationReady: 'Enlace de invitación (cópialo y compártelo de forma segura)',
      copyLink: 'Copiar enlace de invitación', copied: 'Copiado', noUsers: 'No se encontraron miembros.', status: 'Estado', active: 'Activo',
      invited: 'Invitado', suspended: 'Suspendido', changeRole: 'Cambiar rol', revokeSessions: 'Revocar sesiones', save: 'Guardar cambios',
      profilePreferences: 'Perfil y preferencias', integrations: 'Integraciones',
      integrationsNote: 'Las conexiones se activarán después de revisar credenciales y condiciones de datos.', security: 'Seguridad',
      mfaEnabled: 'MFA con autenticador activado', mfaRequired: 'Los administradores deben configurar MFA al iniciar sesión por primera vez.',
      noPermission: 'No tienes permiso para ver esta página.', loading: 'Cargando…', errorGeneric: 'Algo salió mal. Inténtalo de nuevo.',
      invitationTitle: 'Acepta tu invitación a Nexora', invitationDescription: 'Indica tu nombre y contraseña para entrar al espacio privado.',
      acceptInvitation: 'Aceptar invitación', passwordRule: 'Usa al menos 12 caracteres.', navigation: 'Navegación principal',
      collapseSidebar: 'Contraer navegación', expandSidebar: 'Expandir navegación', openMenu: 'Abrir menú', closeMenu: 'Cerrar menú',
      unknownError: 'No se pudo completar la solicitud.', apiConfiguration: 'Configuración de API',
    },
  },
} as const

const storedLocale = typeof window === 'undefined' ? null : window.localStorage.getItem('nexora-locale')
void i18n.use(initReactI18next).init({ resources, lng: storedLocale === 'es' ? 'es' : 'en', fallbackLng: 'en', interpolation: { escapeValue: false } })

export default i18n
