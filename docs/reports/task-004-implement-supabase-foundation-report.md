# Task 004 - Implement Supabase Foundation

Fecha: 2026-07-17
Branch: `feature/supabase-lead-capture`
Base commit registrado: `857b777cff0b610f651fc69415d38c6a1b883491`

## Resumen

Se implemento la base de captura de leads con Supabase sin configurar secretos reales y sin ejecutar SQL en una cuenta real.

El flujo anterior de Formspree/mailto fue reemplazado por `POST /api/leads`. El formulario ahora envia JSON con email, pais, ruta, first-touch, last-touch, consentimiento obligatorio de privacidad, consentimiento opcional de marketing, honeypot, timing trap, idempotency key, anonymous session id, form version y consent version.

## Archivos creados

- `.env.example`
- `api/leads.js`
- `api/_lib/validation.js`
- `api/_lib/rate-limit.js`
- `api/_lib/supabase.js`
- `supabase/migrations/001_create_leads.sql`
- `tests/leads-validation.test.js`
- `docs/reports/task-004-implement-supabase-foundation-report.md`

## Archivos modificados

- `script.js`
- `styles.css`
- `index.html`
- `colombia.html`
- `mexico.html`
- `venezuela.html`
- `guatemala.html`
- `brasil.html`
- `generar_paises.py`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/tasks/task-004-implement-supabase-foundation.md` (`base_commit` reemplazado por el HEAD real)

## SQL

Se agrego `supabase/migrations/001_create_leads.sql`.

La migracion crea una sola tabla `public.leads` con:

- `email` y `email_normalized`
- pais y rutas de landing/pagina
- `first_touch` y `last_touch`
- referrers derivados
- consentimiento de marketing y privacidad
- `consent_version`, `form_version`, `anonymous_session_id`, `idempotency_key`
- `status`, `created_at`, `updated_at`
- indices operativos
- trigger de `updated_at`
- RLS habilitado
- policies que niegan acceso a `anon` y `authenticated`

No se creo `lead_events`. No se agrego `profile_completed_at`.

No ejecute SQL contra Supabase ni contra una cuenta real.

## Endpoint

`api/leads.js` implementa:

- `OPTIONS` para CORS
- solo `POST`
- `Content-Type: application/json`
- limite de payload por `LEADS_MAX_PAYLOAD_BYTES`
- rate limit en memoria por identidad IP hasheada
- validacion estricta de campos permitidos
- honeypot y timing trap con respuesta generica aceptada
- respuesta `503 service_unavailable` si faltan variables Supabase
- logs sin email ni payload completo

El cliente Supabase esta en `api/_lib/supabase.js` y usa REST API con `SUPABASE_SERVICE_ROLE_KEY` solo del entorno server-side.

## Upsert

La identidad principal es `email_normalized`.

Si no existe lead, se inserta. Si ya existe, se actualizan email visible, pagina actual, last-touch, ultimo referrer, consentimientos, session id, form version e idempotency key. No se sobrescriben first-touch, landing inicial ni `created_at`.

## First-touch y last-touch

`script.js` guarda atribucion local con expiracion de 90 dias:

- first-touch se mantiene mientras la atribucion no expire
- last-touch se actualiza en cada visita
- los campos permitidos son `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `ttclid`, `landing`, `referrer`, `page`, `capturedAt`
- las rutas se normalizan sin slash final
- los valores de atribucion se limitan a 512 caracteres

## Consentimiento

Los seis formularios HTML incluyen:

- checkbox obligatorio `privacyAcknowledged`
- checkbox opcional `marketingConsent`, sin marcar por defecto
- texto placeholder para politica/responsable:
  - `[PENDIENTE: correo de privacidad]`
  - `[PENDIENTE: responsable del sitio]`

Estos placeholders son deliberados porque la tarea prohibe configurar secretos/datos reales no confirmados.

## Variables

`.env.example` contiene placeholders vacios:

- `SUPABASE_URL=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `ALLOWED_ORIGINS=http://localhost:3000,https://origenescoffee.com`
- `LEADS_MIN_SUBMIT_MS=2000`
- `LEADS_MAX_PAYLOAD_BYTES=16384`
- `LEADS_FORM_VERSION=lead-v1`
- `LEADS_CONSENT_VERSION=2026-07-17`

No se agregaron secretos reales.

## Validacion ejecutada

Comandos ejecutados:

- `git status --short`
- `git diff --stat`
- `git diff --check`
- `node --check api/leads.js`
- `node --check api/_lib/validation.js`
- `node --check api/_lib/rate-limit.js`
- `node --check api/_lib/supabase.js`
- `node --check script.js`
- `node --check tests/leads-validation.test.js`
- `node tests/leads-validation.test.js`
- prueba mockeada de `api/leads.js` sin variables Supabase, esperando `503 service_unavailable`
- busqueda de `FORMSPREE_ID`, `TU_ID_AQUI`, `formspree`, `mailto:`
- busqueda de secretos reales y logs con PII

Resultados:

- Sintaxis JS: OK
- Tests: `leads-validation.test.js passed`
- Handler sin configuracion real: `api/leads missing-config test passed`
- `git diff --check`: sin errores de whitespace; solo advertencias LF/CRLF propias de Windows
- Busqueda Formspree/mailto en flujo activo: sin coincidencias
- Busqueda de secretos reales: sin secretos reales encontrados
- Logs del endpoint: no imprimen email ni payload completo

## Estado Git observado

`git status --short` al cierre muestra archivos modificados y archivos nuevos sin staging. No hice commit ni push.

La tarea `docs/tasks/task-004-implement-supabase-foundation.md` estaba sin trackear al iniciar esta ejecucion y se actualizo solo para registrar el `base_commit` real.

## Como probar local

Sin variables Supabase reales:

1. Ejecutar un entorno compatible con Vercel Functions.
2. Enviar un POST valido a `/api/leads`.
3. Verificar respuesta `503 service_unavailable`.

Con entorno de desarrollo controlado, no produccion:

1. Crear un proyecto Supabase de prueba.
2. Ejecutar manualmente `supabase/migrations/001_create_leads.sql` en ese proyecto de prueba.
3. Configurar variables en entorno local, no en archivos versionados.
4. Enviar un lead desde una pagina local.
5. Verificar una fila en `public.leads`.

## Pasos manuales para Supabase

Pendientes para un entorno real:

- Crear o seleccionar proyecto Supabase.
- Revisar y ejecutar manualmente la migracion SQL.
- Confirmar que RLS queda habilitado.
- Confirmar que `anon` y `authenticated` no pueden leer/escribir `public.leads`.
- Crear un proceso operativo para exportacion/borrado de leads si se requiere por privacidad.

## Pasos manuales para Vercel

Pendientes para produccion:

- Configurar `SUPABASE_URL`.
- Configurar `SUPABASE_SERVICE_ROLE_KEY`.
- Configurar `ALLOWED_ORIGINS`.
- Confirmar `LEADS_MIN_SUBMIT_MS`, `LEADS_MAX_PAYLOAD_BYTES`, `LEADS_FORM_VERSION` y `LEADS_CONSENT_VERSION`.
- Probar un deployment preview antes de produccion.

## Preview y rollback

Preview:

- Desplegar en Vercel preview con variables apuntando a Supabase de prueba.
- Probar los seis formularios: atlas, Colombia, Mexico, Venezuela, Guatemala y Brasil.
- Confirmar que `trackLead` solo corre despues de respuesta OK.

Rollback:

- Revertir el cambio de frontend a la version anterior si el endpoint falla.
- Retirar variables de entorno de preview/produccion si se sospecha exposicion.
- No borrar la tabla hasta exportar o decidir tratamiento de datos ya capturados.

## Limitaciones

- Rate limiting en memoria: suficiente como base simple, pero no distribuido entre instancias.
- No hay captcha.
- No hay UI de administracion de leads.
- No se ejecuto migracion real.
- No se configuro Supabase real ni Vercel real.
- El texto de privacidad conserva placeholders hasta que el responsable legal/operativo confirme datos.

## HANDOFF PARA CHATGPT

La base tecnica esta implementada en el repositorio. Para continuar, revisar el diff, confirmar el texto legal de privacidad, ejecutar la migracion en Supabase de prueba, configurar variables en Vercel preview y hacer una prueba end-to-end. No hay commit ni push hechos por esta ejecucion.
