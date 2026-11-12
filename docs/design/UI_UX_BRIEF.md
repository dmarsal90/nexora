# Nexora — UI/UX Brief

**Versión:** 1.0 · propuesta para aprobación · 2026-11-12

## 1. Principios de experiencia e identidad

Nexora es una herramienta interna para trabajo comercial cuidadoso: precisa, profesional, confiable y moderna. Prioriza densidad útil sin ruido; deja visibles fuente, estado, fecha y confianza cuando la interfaz muestra datos externos. Inglés predeterminado y español; labels centralizados en i18next. No presentar la interfaz como SaaS público.

El Master Prompt describe una N geométrica original con degradado azul/cian/violeta, variante monocroma, horizontal, favicon y tamaños PWA. No hay logo ni boceto aprobados en el repo inspeccionado. Se propone esa dirección como brief, sujeto a aprobación; no se afirma que exista un arte final.

### Paleta propuesta (requiere aprobación)

Se adopta como propuesta la paleta aportada por Master Prompt. Los valores actuales en `packages/ui/styles/tokens.css` son defaults neutrales, no marca.

| Token semántico | Claro | Oscuro |
|---|---|---|
| background | `#F8FAFC` | `#090F1D` |
| surface | `#FFFFFF` | `#111827` |
| surface-muted | `#F1F5F9` | `#1E293B` |
| sidebar | `#0F172A` | `#080D18` |
| sidebar-hover | `#1E293B` | `#1E293B` |
| primary | `#6045E8` | `#8B75FF` |
| primary-hover | `#5036D6` | `#A394FF` |
| secondary | `#2563EB` | `#60A5FA` |
| accent | `#06B6D4` | `#22D3EE` |
| text-primary | `#0F172A` | `#F8FAFC` |
| text-secondary | `#64748B` | `#94A3B8` |
| border | `#E2E8F0` | `#293548` |
| success/warning/danger | `#16A34A` / `#D97706` / `#DC2626` | `#22C55E` / `#F59E0B` / `#F87171` |

Validar contrastes reales texto/fondo antes de aprobar tokens; ajustes accesibles conservan el matiz. No codificar colores raw en componentes. Evitar dependencia exclusiva del color; 60/30/10 es guía, no cuota rígida.

## 2. Design system

- **Tipografía:** Inter Variable self-hosted ya existe. Escala propuesta: 12/14/16 px base, títulos 20/24/30/36; line-height 1.4–1.6 para cuerpo; tabular numbers para métricas. Mantener no más de tres jerarquías por vista.
- **Espaciado:** unidad base 4 px; escala 4, 8, 12, 16, 24, 32, 40, 48. Contenido cómodo, tablas compactas pero con altura interactiva suficiente.
- **Radios:** 8/12/16 px según control/card; están parcialmente presentes como tokens neutrales.
- **Bordes/sombras:** bordes 1 px semánticos; sombras suaves y escasas; elevación para popover/modal, no cada card.
- **Breakpoints:** mobile <640 px; tablet 640–1023; desktop 1024–1439; wide ≥1440. Contenedor de lectura y dashboard limitado para no estirar tablas.
- **Interacción:** focus visible 2 px; hover/focus/pressed/disabled/loading/error; targets táctiles ≥44×44 px donde aplique; destructivas con confirmación.
- **Navegación:** sidebar oscuro colapsable desktop; drawer accesible mobile; header con breadcrumbs, búsqueda contextual, idioma, tema, notificaciones y usuario.
- **Modo:** claro/oscuro/manual y preferencia sistema al primer uso; persistir selección; contraste en ambos.
- **Motion:** Motion (`motion/react`) único runtime; CSS para transiciones simples; 120/180/240 ms como guía existente; reduced-motion, sin bloquear datos ni indicar progreso falso.

## 3. Jerarquía de componentes

1. Tailwind CSS v4 tokens y layout como sistema de estilos.
2. shadcn/ui como fuente adaptable de primitives (config actual Base UI); accesibilidad y ownership en `packages/ui`.
3. HeroUI solo si existe gap concreto, no duplicar rol de componente.
4. Aceternity UI/Magic UI solo adaptaciones puntuales premium tras revisión de origen, licencia, teclado, reduced motion, responsividad y peso; sin tema global.
5. Motion como runtime de animación.
6. InteraUI/Animate: no usar hasta identificar fuente oficial, licencia y compatibilidad inequívocas; nombres ambiguos.

Componentes de producto previstos: AppShell, Sidebar, Header, PageHeader, StatCard, DataTable, FilterBar, SearchInput, StatusBadge, ScoreIndicator, EmptyState, LoadingState, ErrorState, ConfirmationDialog, ActivityTimeline, KanbanBoard con vista alternativa, ChartCard, AIProcessingIndicator, LandingPreview, ProposalPreview, NotificationCenter. Componentes compartidos se importan desde `@nexora/ui`; la API responde estado/acciones, no decisiones visuales.

## 4. Especificación de pantallas

Las pantallas privadas comparten shell, estados de interfaz de APP_FLOW, autorización server-side, navegación por teclado, responsive y traducciones. Cada lista conserva filtros/paginación; cada dato externo muestra fuente/fecha; errores muestran retry solo si seguro.

| Pantalla | Objetivo, layout y componentes | Acciones, estados y validaciones |
|---|---|---|
| Login/MFA | formulario centrado, marca, selector de idioma; campos etiquetados | login, TOTP, error genérico, expiry, teclado, no recordar secretos |
| Dashboard | PageHeader/período; KPI cards y gráficos; lista de actividad y acciones rápidas | filtros y drilldown; skeleton, empty sin histórico, error parcial; charts con resumen textual |
| Discover | panel filtros/location arriba; tabla/lista resultados paginada | buscar, cancelar, seleccionar, verify; validar ubicación/radio/categoría y cuota; resultado con provenance |
| Verify/Audit | encabezado de negocio/URL, estado del job, checklist de evidencia, severidad | iniciar/reintentar/cancelar seguro, revisión manual, export; URL validada; no resultados falsos |
| Intelligence | score prominente, barras de factores, evidencia y siguientes acciones | recalcular con reglas visibles; unknown separado de 0; confianza y descargos en contexto |
| Leads | tabla con filtros, owner/status, acciones; detalle con tabs Overview/Audit/Intelligence/Studio/Proposals/Outreach/Activity/Notes | crear/editar/asignar/archivar; validación y duplicados; drawer de edición; conflicto concurrente |
| Studio | selector plantilla; editor por secciones y panel preview responsive | generar, editar, reorder/show/hide, autosave, versionar; placeholders marcados; noindex; error IA con recuperación |
| Proposals | editor de servicios/precio/plazo y panel de resumen; lista/versiones | calcular, preview/PDF, revisar, export; validación de moneda, cantidades, márgenes y condiciones |
| Outreach | lista campañas/mensajes, editor y preview completo, conexión Gmail | redactar, solicitar/aprobar/enviar individual, suprimir/revocar; destinatario y hash aprobado visibles; baja evidente |
| CRM | Kanban y tabla accesible, filtros, detalle lateral/timeline | transicionar etapa, tarea, asignar, cerrar Won/Lost; drag alternativo por menú/botón; motivo Lost requerido |
| Projects | lista de proyectos; detalle con etapas, checklist/tareas, archivos, fechas/costes | avanzar estado, asignar, cargar documento, publicar; límites de archivo; aprobación antes de publicación |
| Analytics | filtros comunes, KPI y chart cards, tabla de desglose | período/sector/ciudad/campaña/owner; fórmulas, zona horaria y datos parciales; export según permiso |
| Settings | tabs perfil/preferencias/integraciones/organización/seguridad/audit | guardar, test/revoke, invitar, cambiar roles; reautenticación/MFA para crítico; nunca mostrar secreto |
| Users & Roles | tabla de miembros y panel de invitación | invitar, cambiar rol, desactivar, revocar sesiones; expiración, último Admin y confirmación |

## 5. Wireframes de baja fidelidad

### Shell desktop

```text
┌──────────── Sidebar 248/72 ─────────┬──────── Header: breadcrumbs · search · EN/ES · theme · user ─┐
│ N [Nexora]                           ├──────────────────────────────────────────────────────────────┤
│ Dashboard                            │ Page title                         Primary action          │
│ Discover                             │ filters / date range                                      │
│ Audit · Intelligence                 │ ┌ KPI ─┐ ┌ KPI ─┐ ┌ KPI ─┐ ┌ KPI ─┐                      │
│ Leads · Studio · Proposals            │ └──────┘ └──────┘ └──────┘ └──────┘                      │
│ Outreach · CRM · Projects             │ ┌──────── chart / table ───────────┐ ┌ activity ────────┐ │
│ Analytics                             │ └──────────────────────────────────┘ └─────────────────┘ │
│ Settings                              │                                                              │
└───────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```

### Discover

```text
Page title + quota/cost note                 [New search]
Location [City/State/ZIP] Category [..] Radius [..] Website [Any/...] [Search]
Source + timestamp + job status
☐ Name / category / location / website status / verified / score / source / actions
pagination; selected results → Verify → review evidence → Create lead
```

### Lead detail / Studio

```text
← Leads  Business · status · owner · next action
Overview | Audit | Intelligence | Studio | Proposals | Outreach | Activity | Notes
┌ identity/contact/source + verification ┐ ┌ recent activity / next task ┐
Studio: template + verified facts → section editor → desktop | tablet | mobile preview
```

### CRM mobile

```text
CRM   [Filters]
[Stage selector / horizontal stage tabs]
Lead card: business · value · next task · owner
Tap card → detail sheet; stage transition via explicit menu; no drag-only interaction
```

## 6. Accesibilidad y responsive

Objetivo WCAG 2.2 AA. Semántica HTML; labels persistentes; mensajes ligados a campos; focus trap/restore en dialogs; `aria-live` para cambios de jobs; tabla con headers; charts con tabla/resumen; Kanban operable sin drag; no transmitir estado solo con color; zoom/reflow; idioma declarado; texto alternativo basado en información real; movimiento reducido. Validar contraste de tokens en light/dark.

Mobile: sidebar pasa a drawer; métricas 1–2 columnas; filtros en sheet con chips activos; tablas pasan a lista/card o scroll con encabezados; formularios en una columna; preview en viewport seleccionable; Kanban pasa a etapas seleccionables/lista. Tablet: nav colapsable y tablas scroll/columnas prioritarias. Desktop: sidebar fija/colapsable, paneles dobles. Wide: max-width para lectura y charts.

Animaciones: navegación/fade leve, modal con entrada corta, skeleton sin shimmer agresivo, progreso solo de job real; ninguna animación prolongada en tabla/formulario; se deshabilita o reduce con `prefers-reduced-motion`.
