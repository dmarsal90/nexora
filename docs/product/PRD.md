# Nexora — Product Requirements Document

**Versión:** 1.0 · **Estado:** propuesta para aprobación · **Fecha:** 2026-11-12

**Fuente de alcance:** solicitud Fase 0 y `NEXORA — MASTER DEVELOPMENT PROMPT` aportado por el propietario.
**Producto:** herramienta privada interna para vender y entregar servicios web a negocios locales de Estados Unidos.

## 1. Visión

Nexora reúne investigación de negocios, verificación de presencia digital, auditoría web, priorización transparente, preparación de demos y propuestas y seguimiento hasta la entrega. Resuelve el trabajo fragmentado y manual de encontrar negocios que podrían beneficiarse de una web mejor y convertir esa investigación en un proceso comercial verificable.

La propuesta de valor es un flujo continuo desde una fuente autorizada hasta un proyecto entregado, con evidencias junto a las inferencias, revisión humana antes del contacto y trazabilidad de cada cambio. El primer usuario es el propietario/administrador; el segundo rol previsto es operador comercial. Mercado inicial: Estados Unidos; idioma predeterminado: inglés, con español; moneda comercial: USD. Estos son datos expresos del Master Prompt, pendientes de aprobación como parte de esta Fase 0.

### Objetivos

**Comerciales:** convertir oportunidades locales en clientes de diseño/desarrollo web; medir conversión, ingresos, costes y margen de servicios; no monetizar el acceso a Nexora. No se presuponen resultados históricos ni metas numéricas sin línea base.

**Técnicos:** experiencia privada, segura y auditable; datos segmentados por organización; proveedores sustituibles; trabajos costosos en segundo plano; evidencia de origen y retención; interfaz bilingüe accesible; generación de landings mediante plantillas controladas y datos estructurados, nunca ejecución libre de código generado.

**Diferenciadores:** integración del ciclo investigación→evidencia→demo→propuesta→contacto revisado→proyecto; scoring explicable; separación de hechos, inferencias y sugerencias; guardas de proveedores; historial de versiones y actividades.

**Alcance MVP:** login/invitación y roles; shell y dashboard con datos reales disponibles; adaptador de descubrimiento tras aprobación de proveedor y credenciales; verificación con revisión manual; CRUD de leads; auditorías no intrusivas; scoring por reglas; landing basada en plantilla y preview privado; propuesta versionada/PDF; borradores de outreach con aprobación explícita, exclusión y auditoría; pipeline CRM y creación de proyectos. La activación de cada integración real queda condicionada a credenciales y revisión de condiciones.

**Post-MVP:** agregaciones analíticas avanzadas, más plantillas e integraciones, métricas de proveedor, automatizaciones controladas, enriquecimiento de actividad y optimización operativa. **Futuro:** evolución organizativa multiempresa y nuevas fuentes autorizadas. No se implementan autoservicio público, planes, suscripciones, marketplace ni facturación SaaS.

## 2. Usuarios, permisos y restricciones

| Rol | Necesidad | Permisos previstos |
|---|---|---|
| Admin | Configurar y operar la herramienta | Todo dentro de su organización; usuarios, integraciones y ajustes; consulta de auditoría |
| Operator | Investigar y llevar oportunidades | Leer datos permitidos; gestionar leads, borradores, propuestas y tareas; sin secretos, gestión de usuarios ni configuración crítica |

La invitación la inicia un Admin; no existe registro público. Todo recurso comercial lleva `organizationId` y las consultas lo aplican en servidor. En MVP se opera una organización interna; el modelo permite aislar varias sin incorporar onboarding o facturación SaaS.

Restricciones expresas: uso privado inicial; repositorio privado; sin licencia abierta para código propio (All Rights Reserved); sin registro público, planes SaaS, suscripciones internas o créditos comerciales; cumplimiento de términos de fuentes, APIs, correo y derechos de terceros; no scraping evasivo, datos inventados ni envíos masivos sin supervisión.

## 3. Requisitos funcionales por módulo

Convenciones: todos los módulos requieren sesión vigente, `organizationId` y autorización del servidor. Estados globales de interfaz y tratamiento de errores se detallan en APP_FLOW y UI_UX_BRIEF. Prioridad: **MVP**, **Post-MVP**, **Futuro**.

### FR-DASH-001 — Dashboard — MVP

- **Objetivo/funciones:** ofrecer resumen accionable de embudo, actividad y costes; filtros temporales y accesos rápidos.
- **Entrada/salida:** período/filtros → agregados de datos persistidos, series y enlaces a vistas filtradas.
- **Reglas/estados:** sin datos mostrar cero/estado vacío, jamás cifras de muestra; indicar período y disponibilidad; no mezclar estimaciones con valores realizados.
- **Permisos/dependencias:** lectura por rol; depende de leads, CRM, propuestas, proyectos y ApiUsage.
- **Errores:** agregación fallida muestra error recuperable y último dato/fecha si está disponible.
- **Aceptación:** cada KPI tiene fórmula visible/documentada, filtro se refleja en consulta, valores rastreables a registros y vacío no se presenta como historial.

### FR-DISC-001 — Discover — MVP condicionado a proveedor

- **Objetivo/funciones:** buscar negocios locales por estado/ciudad/ZIP/categoría/palabras clave/radio y filtrar; inspeccionar resultados de proveedor y seleccionar candidato para verificación.
- **Entrada/salida:** consulta validada → resultados paginados con fuente, fecha, identificador permitido, estado web declarado y coste/unidades si aplica.
- **Reglas/estados:** proveedor intercambiable; no inferir “sin web” por campo vacío; conservar solamente campos autorizados; límites, cancelación, cuota y deduplicación por claves permitidas.
- **Permisos/dependencias:** acceso Admin/Operator; `IntegrationConnection`, proveedor y jobs.
- **Errores:** credenciales ausentes, cuota, timeout, proveedor no disponible, respuesta parcial; no simular resultados reales.
- **Aceptación:** una búsqueda señala fuente y estado de ejecución; resultados paginados; operación sin credenciales informa configuración pendiente; no se persiste payload restringido.

### FR-VER-001 — Verify — MVP

- **Objetivo/funciones:** comprobar estado de sitio y datos comerciales, presentar evidencias y permitir corrección/revisión manual.
- **Entrada/salida:** negocio/candidato y URL → verificación con evidencias, fuente, método, fecha, confianza y revisor.
- **Reglas/estados:** `website_found`, `no_website_confirmed`, `uncertain`, `inaccessible`, `manual_review`; ausencia de resultado no prueba ausencia; directorios/social no equivalen a sitio propio; no adivinar emails.
- **Permisos/dependencias:** Admin/Operator; fuentes autorizadas, `BusinessReference`, `LeadVerification`.
- **Errores:** URL inválida, timeout, bloqueado, evidencia insuficiente; estado incierto, nunca falso negativo concluyente.
- **Aceptación:** cada estado no manual tiene evidencia/método y fecha; revisión manual conserva autoría; evidencia no se convierte silenciosamente en dato permanente.

### FR-AUD-001 — Audit — MVP

- **Objetivo/funciones:** analizar páginas públicamente accesibles/autorizadas, recopilar hallazgos no intrusivos y generar informe exportable.
- **Entrada/salida:** URL aprobada → resumen, comprobaciones, hallazgos, severidad, evidencia y fecha; PageSpeed/Lighthouse solo con proveedor configurado.
- **Reglas/estados:** SSRF bloqueado (IP privada/reservada, redirects revalidados, protocolos restringidos, DNS y egress limitados); límites de profundidad/tamaño/tiempo; lab vs RUM explícito; auditoría básica no certifica seguridad.
- **Permisos/dependencias:** Admin/Operator; cola, worker, allow/deny policy, almacenamiento de informes.
- **Errores:** DNS/TLS/HTTP/robots/cuota/timeout se registran como limitación y pueden permitir reintento seguro.
- **Aceptación:** URL peligrosa se rechaza; informe cita hallazgos reproducibles y timestamp; métrica no disponible se omite y no se inventa; export refleja versión guardada.

### FR-INT-001 — Opportunity Intelligence — MVP

- **Objetivo/funciones:** priorizar oportunidades con desglose, nivel de confianza y próxima acción.
- **Entrada/salida:** hechos verificados y reglas versionadas → score 0–100, factores/evidencias, sugerencias y rango configurable.
- **Reglas/estados:** pesos iniciales heurísticos del Master Prompt (sitio ausente verificado 35, sector 20, contacto verificable 15, necesidad funcional 15, facilidad 15); no es probabilidad de compra; dato desconocido no equivale a cero sin explicarlo; IA separa hechos/inferencias.
- **Permisos/dependencias:** lectura Admin/Operator; verificación, auditorías, configuración del score y proveedor IA opcional.
- **Errores:** fuente insuficiente produce score parcial/no calculable; IA caída mantiene cálculo determinista.
- **Aceptación:** desglose suma el total ponderado; versión de reglas/modelo y evidencias consultables; IA no muta hechos verificados.

### FR-LEAD-001 — Leads — MVP

- **Objetivo/funciones:** CRUD, asignación, búsqueda, filtros, notas, etiquetas, actividades, archivo/restauración, detección de duplicados y detalle con pestañas.
- **Entrada/salida:** datos comerciales y fuente → ficha versionada/actividades.
- **Reglas/estados:** datos propios separados de snapshots de proveedor; contacto con fuente/fecha/estado; estados comerciales centralizados en CRM; borrado lógico donde aplica; duplicado requiere resolver/confirmar.
- **Permisos/dependencias:** Admin/Operator con policy; referencias, verificaciones, auditoría, actividad y CRM.
- **Errores:** conflicto de duplicado, validación, versión concurrente, acceso cruzado; mostrar conflictos sin sobrescritura silenciosa.
- **Aceptación:** CRUD persiste; filtros/paginación server-side; usuario de otra organización no puede leer ni mutar; cambios críticos quedan en Activity/AuditLog.

### FR-STUDIO-001 — Nexora Studio — MVP limitado

- **Objetivo/funciones:** elegir plantilla local, generar contenido estructurado asistido, editar texto/secciones/tema, preview responsive privado, autosave y versiones.
- **Entrada/salida:** lead y datos confirmados + plantilla + instrucción → `LandingProject` y `LandingVersion` revisables.
- **Reglas/estados:** plantillas iniciales Cleaning, Auto Detailing, Landscaping, Barber, General; placeholders ante datos ausentes; prohibido inventar credenciales/testimonios/precios/fotos/garantías; IA no emite código ejecutable; demos noindex y enlace temporal/autorizado.
- **Permisos/dependencias:** Admin/Operator; lead, almacenamiento, plantillas, OpenAI opcional, sanitización.
- **Errores:** proveedor IA ausente/coste límite/JSON inválido → estado failed y recuperación/edición manual; no afirmar generación real simulada.
- **Aceptación:** contenido validado por schema, editor puede corregir, versión anterior recuperable y preview no indexable; sanitización XSS.

### FR-PROP-001 — Proposal Builder — MVP

- **Objetivo/funciones:** propuesta ligada a lead, paquetes y servicios editables, precio/plazo/condiciones, versiones, preview y PDF.
- **Entrada/salida:** servicios, cantidades, moneda USD, costes y margen → propuesta versionada y documento.
- **Reglas/estados:** precios iniciales configurables $299/$599/$999 como referencia del Master Prompt, no hechos de mercado ni suscripciones; cálculos reproducibles; sin promesas SEO garantizadas.
- **Permisos/dependencias:** Admin/Operator; lead/customer, catálogo de servicios, renderer PDF y almacenamiento.
- **Errores:** cálculo incompleto, render fallido, cambio concurrente → no marcar como enviada/aceptada.
- **Aceptación:** subtotal/total/margen calculable; export incluye versión, validez y condiciones; actualizar genera nueva versión auditable.

### FR-OUT-001 — Outreach — MVP supervisado

- **Objetivo/funciones:** conectar Gmail OAuth, preparar borradores, mostrar destinatario/contenido, aprobación humana, envío individual autorizado, registro de respuestas cuando API lo permita, bajas y supresión.
- **Entrada/salida:** lead con contacto permitido y copy revisado → draft/approved/sent/evento verificable.
- **Reglas/estados:** scopes mínimos; tokens cifrados; CAN-SPAM y otras reglas aplicables revisadas antes de habilitar; identidad real, dirección válida, asunto veraz, mecanismo de baja y supresión; no pixel/open claims sin señal verificable; envío nunca se reintenta a ciegas.
- **Permisos/dependencias:** operador puede redactar; permiso de envío separado (Admin inicialmente); Gmail, contactos, Campaign/Message, SuppressionEntry y audit log.
- **Errores:** OAuth revocado, baja, bounce, rate limit, resultado de envío incierto; incierto requiere reconciliación antes de retry.
- **Aceptación:** envío requiere aprobación vigente ligada al hash de destinatario/contenido; supresión bloquea envío en servidor; evento Sent requiere respuesta inequívoca del proveedor.

### FR-CRM-001 — CRM — MVP

- **Objetivo/funciones:** pipeline configurable, board/lista accesible, asignación, valor, fecha, tareas, notas, motivo de pérdida, historial y conversión a proyecto.
- **Entrada/salida:** cambios de etapa y actividad → `SalesOpportunity`, timeline y próximo paso.
- **Reglas/estados:** New→Verified→Qualified→Contacted→Replied→Interested→Proposal Sent→Negotiation→Won/Lost; transiciones configurables con validación; Kanban no único método de uso.
- **Permisos/dependencias:** Admin/Operator; Lead, Activity, Proposal, Project.
- **Errores:** conflicto de etapa, oportunidad archivada, autorización; conservar estado actual.
- **Aceptación:** drag/acción equivalente persiste, registra autor/fecha y puede deshacer vía nueva transición; Won ofrece creación idempotente de proyecto.

### FR-PROJ-001 — Projects — MVP básico

- **Objetivo/funciones:** planificar y seguir entrega del servicio vendido con tareas, responsables, fechas, documentos, costes/ingresos y URLs.
- **Entrada/salida:** SalesOpportunity Won y alcance aprobado → Project y checklist.
- **Reglas/estados:** Pending, Planning, Design, Development, Review, Approved, Published, Maintenance, Completed; mantenimiento es servicio al cliente, no SaaS.
- **Permisos/dependencias:** Admin/Operator según policy; Customer, Proposal, ProjectTask, Activity, documentos.
- **Errores:** conversión repetida no duplica; tarea inválida no mueve proyecto.
- **Aceptación:** proyecto mantiene vínculo con oportunidad y propuesta aceptada; estados y tareas auditados; acceso aislado.

### FR-ANA-001 — Analytics — MVP básico, avanzado Post-MVP

- **Objetivo/funciones:** métricas descriptivas filtrables de embudo, sector, ciudad, períodos, fuente/responsable y costes.
- **Entrada/salida:** rango/filtros → agregados reproducibles y exportación autorizada.
- **Reglas/estados:** fórmulas explícitas en Traceability/Schema; ventanas temporales y denominadores mostrados; no predicción hasta suficientes datos.
- **Permisos/dependencias:** Admin; Operator solo agregados permitidos; registros CRM, proyectos y ApiUsage.
- **Errores:** rango inválido, agregación parcial; indicar datos parciales.
- **Aceptación:** totales reconciliables con registros de muestra de pruebas internas; cero historial se muestra vacío y no como tendencia.

### FR-SET-001 — Settings e integraciones — MVP

- **Objetivo/funciones:** idioma, perfil, preferencias, integraciones disponibles, políticas y parámetros comerciales autorizados.
- **Entradas/salidas:** configuración validada → cambios versionados y estados de conexión.
- **Reglas/estados:** secreto jamás se devuelve completo; conexión OAuth revocable; cambios críticos solo Admin.
- **Permisos/dependencias:** Admin para organización/secretos e integraciones; preferencias propias para ambos.
- **Errores:** credencial inválida/revocada, configuración inválida; conservar configuración anterior.
- **Aceptación:** secretos cifrados; lectura devuelve estado y sufijo seguro; auditoría captura actor/acción.

### FR-AUTH-001 — Users & Roles — MVP

- **Objetivo/funciones:** invitaciones, activar/desactivar, asignar Admin/Operator, revocar sesiones, recuperación de contraseña, MFA TOTP Admin.
- **Entrada/salida:** invitación verificada y acción Admin → membresía/sesiones actualizadas.
- **Reglas/estados:** sin alta pública; MFA requerido Admin; último Admin protegido de desactivación accidental; sesión HttpOnly, rotada, revocable, vencimiento por inactividad.
- **Permisos/dependencias:** solo Admin gestiona usuarios; ambos usuarios acceden a su perfil.
- **Errores:** invitación expirada/consumida, contraseña/MFA incorrectos, límite de intentos; no filtrar existencia de cuentas.
- **Aceptación:** operador no puede elevarse; sesión revocada no autentica; rutas server-side aplican permisos.

## 4. Historias de usuario y aceptación

| ID | Historia | Criterios verificables |
|---|---|---|
| US-AUTH-001 | Como Admin, inicio sesión y completo MFA para entrar. | MFA inválido deniega; éxito rota sesión y registra acceso. |
| US-AUTH-002 | Como Admin, invito y asigno rol a un operador. | Invitación de un solo uso con expiración; operador no accede a gestión de usuarios. |
| US-DISC-001 | Como operador, busco negocios por ubicación y categoría. | Consulta validada, proveedor/estado visibles, resultados paginados y coste reportado cuando exista. |
| US-VER-001 | Como operador, verifico la presencia web de un negocio. | Estado y evidencia fechados; ausencia incierta no se etiqueta como confirmada. |
| US-AUD-001 | Como operador, audito un sitio permitido. | URL segura, hallazgos fechados y limitaciones explícitas; host interno rechazado. |
| US-INT-001 | Como operador, priorizo una oportunidad. | Desglose y versión visibles; score no se presenta como probabilidad. |
| US-LEAD-001 | Como operador, guardo y organizo un lead. | CRUD y filtros persisten; el aislamiento de organización se aplica. |
| US-STU-001 | Como operador, preparo una landing para un lead. | Usa plantilla, no inventa datos, permite editar/versionar y crea preview noindex. |
| US-PROP-001 | Como operador, genero una propuesta para revisar. | Cálculo reproducible, PDF versionado, sin marcar envío automáticamente. |
| US-OUT-001 | Como operador, preparo y solicito aprobación de un email. | Requiere contacto con fuente; supresión impide envío; aprobación cubre contenido exacto. |
| US-CRM-001 | Como operador, hago seguimiento de la oportunidad. | Etapa persiste y registra autor, fecha y actividad. |
| US-PROJ-001 | Como operador, convierto venta ganada en entrega. | Conversión crea un proyecto una sola vez y conserva vínculos. |
| US-ANA-001 | Como Admin, reviso resultados por período y sector. | Fórmulas y denominadores están definidos; datos vacíos no generan tendencias ficticias. |
| US-SET-001 | Como Admin, conecto o revoco un proveedor. | Estado verificable; secretos cifrados/no se exponen; acción auditada. |
| US-UI-001 | Como usuario, cambio idioma y tema. | Preferencia persiste; inglés/español; control usable por teclado y lector de pantalla. |

## 5. Métricas y fórmulas

Todas son definiciones futuras, no resultados existentes. Se calculan por organización y ventana temporal documentada.

| KPI | Fórmula |
|---|---|
| Descubiertos | conteo de referencias únicas admitidas en el período; fuentes restringidas excluidas si persistencia no está permitida |
| Verificados | leads con verificación completada / leads enviados a verificación |
| Cualificados | oportunidades que alcanzaron Qualified / leads activos elegibles |
| Tasa de respuesta | mensajes con respuesta humana atribuible / mensajes entregados elegibles; excluir rebotes, bajas y eventos ambiguos |
| Propuestas aceptadas | propuestas aceptadas / propuestas válidas enviadas |
| Conversión ganada | oportunidades Won / oportunidades que entraron en etapa elegible en cohorte definida |
| Ingresos registrados | suma de ingresos de proyectos para período de reconocimiento configurado; distinguir booked/received |
| Costes registrados | suma de costes cargados por categoría y fecha; estimado separado de real |
| Margen bruto estimado | (ingresos − costes directos estimados) / ingresos; nulo si ingresos = 0 |
| Tiempo de entrega | mediana entre inicio y Completed, para proyectos completados de cohorte indicada |
| Coste por búsqueda | cargos/unidades registradas del proveedor / búsquedas completadas atribuibles |

## 6. Trazabilidad y decisiones pendientes

Los IDs funcionales `FR-*` y las historias `US-*` se relacionan con pantallas, contratos, tareas y pruebas en `docs/planning/REQUIREMENTS_TRACEABILITY.md`.

Decisiones de producto que el Master Prompt resuelve provisionalmente y que deben confirmarse antes de Fase 1: operación inicial en EE. UU./USD; objetivo comercial de servicios web locales; composición de una organización interna con roles Admin/Operator; precios de referencia; paleta y logotipo. Las condiciones concretas de retención por proveedor, base legal/consentimiento y configuración operativa del correo requieren revisión antes de activar cada proveedor. Véase registro de decisiones en TRD.
