# Nexora — Progress

**Última actualización:** 2026-11-13
**Estado global:** Fase 0 aprobada y entregada; Fase 1 Foundation implementada, verificada y enviada a revisión.

## Resumen

- [x] Inspección inicial del repositorio y revisión de la base existente.
- [x] Fase 0 aprobada, documentada y publicada en PR #5.
- [x] Aprobación del propietario de Fase 1 y gates DG-01 a DG-04 (2026-11-12).
- [x] Foundation implementada en `feat/phase-1-foundation`.
- [x] Docker local con servicios saludables, API/web respondiendo y autenticación privada inicial.
- [x] typecheck, lint, pruebas unitarias y build completados.
- [ ] Integraciones reales y configuración de operación externa: gates DG-05/DG-06 antes de producción o proveedores.

## Fase 0

| ID | Estado | Evidencia |
|---|---|---|
| TASK-DOC-001…008 | Completado | Ocho documentos completos y matriz cruzada en `docs/`. |
| OWNER-APPROVAL-001 | Completado | Aprobación explícita de Fase 1 y DG-01…DG-04 el 2026-11-12. |
| PHASE-0-PR-001 | Completado | Commit `98d0e80`; PR [#5](https://github.com/dmarsal90/nexora/pull/5), docs-only. |

## Fase 1 — Foundation

| ID | Estado | Evidencia |
|---|---|---|
| PHASE-1-START-001 | Completado | Rama `feat/phase-1-foundation`, apilada sobre `docs/phase-0`. |
| TASK-FOUND-001 | Completado | pnpm 12.11.2, Turborepo 2.11.11, lockfile/workspaces y workflow CI. |
| TASK-FOUND-002 | Completado | API modular Express 5, configuración validada, OpenAPI inicial y contratos versionados. |
| TASK-FOUND-003 | Completado | Mongoose, conexión/indexes e inicialización de colecciones de identidad/auditoría. |
| TASK-FOUND-004 | Completado | Redis protegido, worker de salud y readiness checks. |
| TASK-AUTH-001 | Completado | Bootstrap de primer admin, login Argon2id, sesiones HttpOnly, TOTP obligatorio Admin e invitaciones. Smoke test real: login inicial devuelve 202 y exige MFA. |
| TASK-AUTH-002 | Completado | Roles Admin/Operator, policies del backend, aislamiento por `organizationId`, sesiones revocables y audit log. Pruebas de middleware: anónimo 401, Operator 403, Admin permitido. |
| TASK-UI-001 | Completado | AppShell, rutas protegidas, shell Dashboard/Admin, inglés/español, modo claro/oscuro y tokens aceptados. |
| TASK-OPS-001 | Completado | Compose, Nginx, Mongo replica set con auth/keyfile, Redis con clave y secretos fuera de imágenes/repositorio. |
| TASK-OBS-001 | Completado | Logs JSON estructurados, correlación y health/readiness. |
| PHASE-1-VERIFY-001 | Completado | `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, Compose config, `git diff --check`; MongoDB/Redis/API/worker/web/Nginx saludables; HTTP web/readiness 200 y API administrativa anónima 401. |
| PHASE-1-PR-001 | En progreso | Commit/PR apilado pendientes de publicación. |

## Pruebas y límites registrados

- Vitest/Node test runner: suites de Argon2id, TOTP, cifrado/digest y políticas de autenticación; 7 tests verificados al finalizar.
- Docker Compose: `mongodb`, `redis`, `api`, `worker`, `web` saludables; `nginx` healthy. `landings` arranca en desarrollo, pero no tiene healthcheck propio.
- Smoke HTTP a través de Nginx: `GET /` y `GET /api/v1/health/ready` devuelven 200; `GET /api/v1/users` sin sesión devuelve 401.
- Inicio de sesión del admin de prueba validado sin mostrar contraseña; se solicita enrolamiento TOTP. Credenciales locales permanecen en `.env` ignorado por Git para que el propietario las guarde en su gestor; el servicio API no recibe estas variables.
- Las APIs de negocio (Discovery, Gmail, OpenAI, auditorías externas) no se activaron ni simularon; quedan para fases siguientes y DG-06.
- El test automatizado de aislamiento entre dos organizaciones y E2E de UI queda como ampliación de QA; el código de las rutas de usuarios consulta por organización del contexto de sesión.

## Decisiones y cambios

- **DG-01…DG-04, 2026-11-12:** propietario confirma mercado US/USD, migración pnpm/Turbo, marca tokens y organización interna única.
- **ADR-DB-001, 2026-11-13:** desarrollo usa MongoDB 7.0.48 porque MongoDB documenta incompatibilidad de su línea 8.0 con el kernel host 6.19; imagen fijada y replica set autenticado usa keyfile generado desde `.env`. Revaluar MongoDB 8.0 cuando su build sea compatible.
- **ADR-OPS-001, 2026-11-13:** API no recibe credenciales temporales de bootstrap; un servicio Compose con profile `bootstrap` crea el admin una sola vez.
