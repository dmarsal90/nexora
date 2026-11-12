# Nexora — Implementation Plan

**Versión:** 1.0 · propuesta para aprobación · 2026-11-12

## Reglas de ejecución

Fase 0 es exclusivamente documentación/revisión. Ningún código de aplicación, componente, dependencia, migración de package manager ni infraestructura se inicia hasta que el propietario apruebe explícitamente la Fase 0. La base React/Vite existente fue creada en commits previos; se documenta, no se amplía durante esta fase. Cada fase actualiza este plan, Traceability y PROGRESS con evidencia concreta. Pruebas requeridas por requisitos del producto se implementarán en las fases enumeradas; no se han ejecutado en Fase 0.

## Fase 0 — Documentación y decisiones

- **Objetivo:** cerrar alcance, arquitectura, UX, datos, trazabilidad y criterios de aceptación.
- **Dependencias:** inspección repo y Master Prompt.
- **Tareas/artefactos:** `TASK-DOC-001` inspeccionar repo; `TASK-DOC-002` PRD; `TASK-DOC-003` TRD/ADRs; `TASK-DOC-004` App Flow; `TASK-DOC-005` UI/UX; `TASK-DOC-006` Backend Schema; `TASK-DOC-007` plan y progreso; `TASK-DOC-008` matriz y revisión cruzada.
- **Entregables:** ocho documentos obligatorios listados en estructura; decisiones críticas y riesgos expuestos.
- **Pruebas/revisión:** checklist de 10 puntos de Fase 0; revisión de coherencia ID por ID; sin pruebas de app.
- **Riesgos:** mercado/paleta/package manager no ratificados; términos/proveedores/retención requieren verificación antes de activar integraciones.
- **Aceptación:** ocho archivos con contenido específico, matrices completas, contradicciones críticas corregidas o declaradas como gate; propietario aprueba iniciar Fase 1.
- **DoD:** todos los criterios de 0.7 y 0.9 atendidos; status en PROGRESS refleja review/aprobación real.

## Fase 1 — Foundation

- **Objetivo:** base desplegable local, contratos y controles de acceso seguros.
- **Dependencias:** Fase 0 aprobada; decision gate DG-01 a DG-04 confirmado; Node/package manager/versions seleccionados.
- **Tareas:** `TASK-FOUND-001` package manager/workspaces y CI; `TASK-FOUND-002` API modular/strict TS/OpenAPI; `TASK-FOUND-003` Mongo connection/schema/index setup; `TASK-FOUND-004` Redis/worker/health; `TASK-AUTH-001` sesión, login/MFA, invitación; `TASK-AUTH-002` org-scoped policies/roles/audit; `TASK-UI-001` shell/router/i18n/tokens; `TASK-OPS-001` Docker Compose dev/Nginx/secrets config; `TASK-OBS-001` logs/health/budgets.
- **Archivos/módulos:** `apps/api`, `apps/worker`, `apps/web`, `packages/{types,validation,security,config,database,ui}`, workspace manifests, Dockerfiles/compose, `.env.example`, CI.
- **Entregables:** login privado, MFA Admin, roles, layout accesible, health services y OpenAPI inicial.
- **Pruebas:** unit auth/policy; integración Mongo/Redis/session; E2E login/invitación/Forbidden; secret scan/build/typecheck.
- **Riesgos:** sesión/config mal definida, package-manager migration.
- **Aceptación:** `docker compose up` inicia stack local health; rutas privadas deniegan anónimo; operator no administra usuarios; consultas cross-org rechazadas; CI reproducible.
- **DoD:** migraciones/índices revisados; sin defaults secretos; runbook local y pruebas críticas verdes.

## Fase 2 — Discover & Leads

- **Objetivo:** candidatos autorizados y CRM básico fiable.
- **Dependencias:** Fase 1, proveedor/cuenta/contrato revisados y cuota definida.
- **Tareas:** `TASK-DISC-001` contrato provider; `TASK-DISC-002` búsqueda/job/quota/usage; `TASK-VER-001` verificación/evidencias/manual review; `TASK-LEAD-001` CRUD/policies/pagination; `TASK-LEAD-002` dedupe/source provenance/activity; `TASK-LEAD-003` filtros, tabla y detail.
- **Archivos/módulos:** `modules/discovery,businesses,leads,verification`; provider adapters; jobs; frontend Discover/Verify/Leads.
- **Entregables:** buscar con fuente real configurada, revisar, convertir campo autorizado a lead propio.
- **Pruebas:** adapter mocks contract; integración quota/duplicate/org isolation; E2E search→verify→lead con proveedor mock y contrato real separado.
- **Riesgos:** términos almacenamiento y falsos negativos.
- **Aceptación:** sin credencial no finge resultados; result page y fuente visibles; uncertain separado; lead persistido y aislado.
- **DoD:** provenance/expiry configurados por campo; coste medible cuando provider informa; export solo autorizado.

## Fase 3 — Audit & Intelligence

- **Objetivo:** informes web seguros y score explicable.
- **Dependencias:** Fase 2, política SSRF/egress, límites de auditoría y provider API.
- **Tareas:** `TASK-AUD-001` aislamiento URL fetch; `TASK-AUD-002` checks Lighthouse/PSI opcional y evidencias; `TASK-AUD-003` informe/versiones/PDF; `TASK-INT-001` scoring determinista versionado; `TASK-INT-002` explicación IA opcional con schema.
- **Archivos:** `modules/audits,intelligence`; worker audit/score; UI audit report/score.
- **Entregables:** auditoría no intrusiva, score explicable.
- **Pruebas:** SSRF suite (IPv4/v6, DNS rebinding/redirects), URL fuzz, scoring unit, provider mocks, PDF snapshot.
- **Riesgos:** acceso a redes internas, confundir lab con RUM, proveedor externo.
- **Aceptación:** host privado/redirect bloqueado; cada hallazgo tiene fuente/evidencia; score suma factores y no se llama probabilidad.
- **DoD:** límites egress/time/bytes, resultados parciales explícitos, auditoría registrada.

## Fase 4 — Nexora Studio

- **Objetivo:** demo privada editable con templates y texto estructurado.
- **Dependencias:** Fase 2 Lead y provenance; Fase 1 auth/storage/security; proveedor IA opcional configurado.
- **Tareas:** `TASK-STUDIO-001` template schema/catalog; `TASK-STUDIO-002` generación AI job; `TASK-STUDIO-003` editor/version/autosave; `TASK-STUDIO-004` Next renderer/previews/private noindex; `TASK-STUDIO-005` sanitizer/authorization/publish gates.
- **Archivos:** `apps/landings`, `packages/landing-templates`, `modules/landings`, Studio UI, storage policy.
- **Entregables:** 5 templates iniciales, editor, previews responsive y versionado.
- **Pruebas:** Zod/schema, prompt injection fixtures, XSS sanitization, access expiry/noindex, editor E2E.
- **Riesgos:** dato falso, materiales protegidos, ejecución arbitraria.
- **Aceptación:** placeholder de hecho faltante; renderer no ejecuta output; preview privado; versión restaurable.
- **DoD:** fuentes/datos visibles a editor, coste/timeout límite y publicación explícitamente autorizada.

## Fase 5 — Proposals & Outreach

- **Objetivo:** precios/propuestas auditables y comunicación revisada.
- **Dependencias:** Fase 2 lead/contact; Fase 1 sessions/secrets; aprobación owner de cumplimiento/retención y cuenta OAuth.
- **Tareas:** `TASK-PROP-001` service catalog/calculator; `TASK-PROP-002` version/PDF; `TASK-OUT-001` Gmail OAuth/revoke; `TASK-OUT-002` draft/approval/hash/send; `TASK-OUT-003` suppression/events/reconciliation; `TASK-LEGAL-001` checklist operativo Can-SPAM/otras reglas aplicables.
- **Archivos:** `modules/proposals,outreach`; jobs; email templates; OAuth callbacks; UI Proposal/Outreach.
- **Entregables:** PDF con versión y Gmail individual supervisado.
- **Pruebas:** cálculo/PDF; OAuth state/PKCE/revoke; send exact-content; suppression; ambiguous-send no retry; E2E draft review.
- **Riesgos:** consentimiento/base, regulación, abuso de remitente, duplicación.
- **Aceptación:** la aprobación no se puede reutilizar tras cambiar contenido; suppression bloquea en backend; evento Sent solo con señal real.
- **DoD:** límites de envío, bajas, retención cifrada y términos provider revisados.

## Fase 6 — CRM & Projects

- **Objetivo:** gestionar venta y cumplimiento del servicio.
- **Dependencias:** Fase 2 leads, Fase 5 proposals; controles org y audit.
- **Tareas:** `TASK-CRM-001` estados/transiciones/historial; `TASK-CRM-002` board/list accessible + tasks; `TASK-PROJ-001` customer/project conversion idempotente; `TASK-PROJ-002` task/doc/dates/status; `TASK-PROJ-003` ingresos/costes y publicación gates.
- **Archivos:** `modules/crm,projects,customers`; UI CRM/Projects; object storage.
- **Entregables:** ciclo Won→proyecto→Completed.
- **Pruebas:** state transition, concurrent update, duplicate conversion, org isolation, document validation, E2E flow.
- **Riesgos:** scope contractual/financiero y datos de cliente.
- **Aceptación:** oportunidad enlaza a propuesta aceptada y un único proyecto; cada estado y actividad persiste.
- **DoD:** archivos privados, auditoría, informe de costes y UX usable sin drag.

## Fase 7 — Analytics & Hardening

- **Objetivo:** métricas descriptivas, seguridad, rendimiento y preparación de despliegue privado.
- **Dependencias:** datos representativos de fases previas, hosting/operación definidos.
- **Tareas:** `TASK-ANA-001` formulas/cohortes/agregados; `TASK-ANA-002` filtros/charts; `TASK-SEC-001` threat-model review/ASVS; `TASK-PERF-001` baseline/load/index; `TASK-OPS-002` backups/restore/runbook; `TASK-REL-001` E2E/observability/release readiness.
- **Archivos:** analytics modules/UI, scripts/monitoring, docs security/deployment, CI.
- **Entregables:** dashboard conectado, backup/restore, reporte de pruebas y despliegue controlado.
- **Pruebas:** reconciliación fórmulas, load profile, E2E/security regression, restore drill, image/dependency scan.
- **Riesgos:** datos escasos, métricas mal interpretadas, coste de hosting.
- **Aceptación:** fórmulas reconciliadas; KPIs vacíos sin fake; restore probado dentro de RTO/RPO aprobados; no bloqueos críticos conocidos.
- **DoD:** resultados medidos diferenciados de objetivos; runbooks; aprobación antes de exposición pública.

## Dependencias globales y orden

Fase 0 → autenticación/org/contratos/base API → Discover/Leads → Audit/Score → Studio → Proposals/Outreach; CRM puede construirse con Leads y Projects depende de oportunidad/propuesta; Analytics se apoya en eventos persistidos. No habilitar provider real sin credencial, revisión de términos, coste y prueba contract. CI, observabilidad, seguridad y docs se actualizan en cada fase, no se aplazan todos a Fase 7.

## Definition of Done compartido

Requisito enlazado a acceptance y test; DTO/schema y permisos implementados; errores/empty/loading; i18n y accesibilidad básica; telemetría redactada; índices/retención documentados; pruebas relevantes ejecutadas con resultados anotados; build/typecheck limpios; documentación/progreso actualizados; ninguna integración declarada real sin credentialed run.
