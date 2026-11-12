# Nexora — Requirements Traceability Matrix

**Versión:** 1.0 · propuesta para aprobación · 2026-11-12

Status inicial de todas las filas: **Planificado**. La columna Test describe evidencia exigida; “Pendiente Fase N” no significa prueba ejecutada. API/schema se refiere a `docs/backend/BACKEND_SCHEMA.md`; los nombres de rutas son propuestos.

| Requirement ID | PRD Section | App Flow | UI Screen | API/Schema | Implementation Task | Test / aceptación verificable | Status |
|---|---|---|---|---|---|---|---|
| FR-AUTH-001 Login/MFA | Users & Roles | H | Login/MFA | auth, User, Session | TASK-AUTH-001 | unit Argon/TOTP; E2E login, MFA invalid/valid | Planificado |
| FR-AUTH-002 Invitación/roles | Users & Roles | H | Users & Roles | Membership/User | TASK-AUTH-002 | operator admin endpoint 403; invite single-use | Planificado |
| FR-ORG-001 aislamiento | restricciones/Users | H + todos | todas privadas | organizationId en OrgDoc | TASK-AUTH-002 | cross-org IDOR integration denies | Planificado |
| FR-DASH-001 KPIs reales | Dashboard | navegación | Dashboard | Analytics/Activity/ApiUsage | TASK-FOUND-001, TASK-ANA-001 | reconcile API against fixtures; empty no fake | Planificado |
| FR-DISC-001 búsqueda | Discover | A | Discover | BusinessReference/IntegrationConnection | TASK-DISC-001/002 | provider contract mock; quota/error/paging | Planificado |
| FR-DISC-002 retención | Discover/restricciones | A | Discover | BusinessReference/sourceRefs | TASK-DISC-001 | field retention policy test/expiry | Planificado |
| FR-VER-001 evidencia | Verify | A | Verify | LeadVerification/LeadContact | TASK-VER-001 | absence stays uncertain; manual reviewer | Planificado |
| FR-VER-002 contacto fuente | Verify | E | Lead detail/Outreach | LeadContact/SuppressionEntry | TASK-VER-001, TASK-OUT-003 | no guessed contact accepted; provenance required | Planificado |
| FR-AUD-001 auditoría no intrusiva | Audit | B | Audit | WebsiteAudit | TASK-AUD-001/002 | SSRF/redirect/internal-IP security suite | Planificado |
| FR-AUD-002 informe/export | Audit | B | Audit report | WebsiteAudit/reportObjectKey | TASK-AUD-003 | evidence/date/limitations in PDF snapshot | Planificado |
| FR-INT-001 scoring explainable | Intelligence | A/B | Intelligence | OpportunityScore | TASK-INT-001 | deterministic weights sum; unknown factor handling | Planificado |
| FR-INT-002 IA bounded | Intelligence | B/C | Intelligence/Studio | modelInfo/structuredContent | TASK-INT-002, TASK-STUDIO-002 | schema validates; prompt injection fixture | Planificado |
| FR-LEAD-001 CRUD | Leads | A/B/C/D/E | Leads/detail | Lead | TASK-LEAD-001 | CRUD/paging/filter/API + E2E | Planificado |
| FR-LEAD-002 dedupe/history | Leads | A/F | Leads/detail | Activity/Lead | TASK-LEAD-002 | duplicate conflict and event actor/time | Planificado |
| FR-STUDIO-001 templates | Nexora Studio | C | Studio | LandingProject/Version | TASK-STUDIO-001 | templates schema and missing fact placeholder | Planificado |
| FR-STUDIO-002 edit/preview | Nexora Studio | C | Studio/preview | LandingVersion | TASK-STUDIO-003/004 | version restore, responsive, noindex/private expiry | Planificado |
| FR-STUDIO-003 safe content | Nexora Studio | C | Studio | structuredContent | TASK-STUDIO-002/005 | XSS sanitize, no code execution | Planificado |
| FR-PROP-001 calculator/version/PDF | Proposal Builder | D | Proposals | Proposal/ProposalVersion | TASK-PROP-001/002 | unit calculation and PDF version snapshot | Planificado |
| FR-OUT-001 OAuth | Outreach/Settings | E/H | Outreach/Integrations | IntegrationConnection | TASK-OUT-001 | state mismatch, revoke, secret redaction | Planificado |
| FR-OUT-002 approval/send | Outreach | E | Outreach | CampaignMessage/EmailEvent | TASK-OUT-002 | content hash required; ambiguous send no retry | Planificado |
| FR-OUT-003 suppression | Outreach | E | Outreach | SuppressionEntry | TASK-OUT-003 | suppression blocks backend send even stale UI | Planificado |
| FR-CRM-001 pipeline | CRM | F | CRM | SalesOpportunity/Activity | TASK-CRM-001/002 | transition and history persisted; keyboard alternative | Planificado |
| FR-PROJ-001 conversion | Projects | F/G | CRM/Projects | Project/Customer | TASK-PROJ-001 | repeated conversion unique/idempotent | Planificado |
| FR-PROJ-002 delivery/costs | Projects | G | Projects | Project/Task/ApiUsage | TASK-PROJ-002/003 | permissioned state, file limits, reconcile totals | Planificado |
| FR-ANA-001 formulas | Analytics | navigation | Analytics/Dashboard | analytics endpoints | TASK-ANA-001/002 | cohort denominators reconcile, no-data state | Planificado |
| FR-SET-001 integrations/secrets | Settings | H | Settings | IntegrationConnection/AppSetting | TASK-FOUND-002, TASK-OUT-001 | API never returns ciphertext/secret; revoke | Planificado |
| FR-UI-001 bilingual/theme/accessibility | restricciones/UI | todos | Shell/Settings | User locale/AppSetting | TASK-UI-001 | locale persistence, keyboard, WCAG checks | Planificado |
| FR-OPS-001 Docker/backup | TRD/ops | deployment | n/a | storage/DB | TASK-OPS-001/002 | Compose health and restore drill | Planificado |
| FR-OBS-001 audit/usage | seguridad/metrics | todos | audit/costs | AuditLog/ApiUsage | TASK-OBS-001 | redaction scan, append-only policy, usage reconciliation | Planificado |

## Validación cruzada (10 controles)

1. **Módulos PRD→App Flow:** Dashboard, Discover, Verify, Audit, Intelligence, Leads, Studio, Proposals, Outreach, CRM, Projects, Analytics, Settings, Users/Roles se encuentran en mapa/pantallas y flujos pertinentes. ✅
2. **Requisitos→TRD:** módulos enlazan endpoints/paquetes, jobs, controles y ADRs; se detallan en tabla anterior. ✅
3. **Requisitos→entidades:** todos los módulos tienen modelos/relaciones; datos auxiliares se especifican como campos/referencias, con candidatos separados. ✅
4. **Requisitos→pantallas:** cada módulo operativo aparece en UI/UX Brief con acciones/estados/validaciones. ✅
5. **Requisitos→tareas:** cada FR tiene uno o más TASK IDs. ✅
6. **Tareas críticas→acceptance:** fases 1–7 describen aceptación y pruebas; tareas con nombres relacionados en la matriz. ✅
7. **Permisos consistentes:** Admin gestiona usuarios/config/secrets, aprueba/envía; Operator gestiona flujo comercial; servidor aplica org scope. ✅
8. **Proveedores/datos:** separación BusinessReference/Lead, provenance/expiry y activación condicionada. ✅
9. **Seguridad:** sesiones, CSRF, SSRF, XSS, NoSQL, IDOR, cifrado, auditoría, backups, jobs de correo incluidos. ✅
10. **MVP delimitado:** uso privado interno, single org operativa, proveedor condicionado, envío supervisado, sin SaaS público/monetización. ✅

### Pendientes de decisión (no ocultar como contradicción resuelta)

- DG-01: ratificar mercado EEUU, idioma inicial inglés, USD, servicios web locales y precios de referencia editables (Master Prompt).
- DG-02: ratificar migración de npm workspaces existente a pnpm + Turborepo.
- DG-03: aprobar paleta/logo descritos o suministrar referencia de marca; tokens actuales neutrales.
- DG-04: ratificar organización interna única en MVP y preparación de aislamiento multi-org.
- DG-05: definir operador de hosting/backup y valores finales RPO/RTO/coste antes de prod.
- DG-06: revisar términos vigentes, retención y habilitación de Google/Gmail/OpenAI y requisitos comerciales/legales antes de activar proveedores.
- **Conflicto de orden en el Master Prompt:** la regla inicial de Fase 0 exige aprobación del propietario antes de implementar; su sección 33 pide empezar Fase 1 inmediatamente tras documentar. Se aplica la regla inicial explícita de aprobación, coherente también con el apartado 0.8 original; la sección 33 queda subordinada y no autoriza saltarse la aprobación.

No se identifican contradicciones críticas sin registrar entre documentos. Los gates anteriores son decisiones abiertas que bloquean los componentes afectados de Fase 1/activación de proveedores, no la revisión de estos documentos.
