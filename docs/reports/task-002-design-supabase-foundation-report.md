---
id: report-task-002
title: Design Supabase lead capture foundation
created: 2026-07-15
updated: 2026-07-15
task_path: docs/tasks/task-002-design-supabase-foundation.md
base_branch: docs/project-brain
base_commit: PENDIENTE_REEMPLAZAR
actual_branch: docs/project-brain
actual_commit: 05a28856708fe5ffe275055aebef44631bc31bcb
agent: codex
---

# Diseño de base Supabase para captura de leads

## 1. Arquitectura final propuesta

Diseño aprobado por la tarea, todavía no implementado:

Visitante -> landing estática -> captura first-touch y last-touch en cliente -> `POST /api/leads` -> validación en Vercel Serverless Function -> upsert en Supabase con service role -> respuesta pública segura -> evento de conversión en cliente.

Responsabilidades:

- Cliente estático: conserva diseño, recoge email, contexto de página, atribución y consentimiento.
- Vercel Serverless Function: única puerta de escritura, validación, normalización, antispam, idempotencia, upsert y respuesta.
- Supabase: almacenamiento de leads. La inserción principal usa `SUPABASE_SERVICE_ROLE_KEY` solo desde servidor.
- Analytics: Vercel Web Analytics se mantiene. Conversiones pagas/GA4 se disparan solo tras persistencia exitosa.

No se propone escribir directamente desde el navegador a Supabase en esta fase.

## 2. Tabla `leads`

Modelo final recomendado para fase 1:

- `id`: identificador interno.
- `email`: email original ya recortado, conservado para contacto.
- `email_normalized`: email recortado y lowercase, usado para deduplicación.
- `landing_country`: país/origen de landing declarado por el formulario.
- `landing_path`: primera ruta atribuida.
- `page_path`: ruta desde la que se envió el registro más reciente.
- `first_referrer`: referrer original.
- `last_referrer`: referrer del registro más reciente.
- `first_touch`: snapshot JSON de atribución original.
- `last_touch`: snapshot JSON de atribución más reciente.
- `marketing_consent`: consentimiento para recibir comunicaciones.
- `privacy_acknowledged`: confirmación de privacidad.
- `consent_version`: versión del texto/política aceptada.
- `status`: estado operativo del lead.
- `anonymous_session_id`: identificador anónimo opcional generado por cliente para depuración de atribución sin usar PII.
- `form_version`: versión del formulario/contrato.
- `idempotency_key`: último idempotency key aceptado.
- `profile_completed_at`: reservado para marcar perfil progresivo completo; queda nullable.
- `created_at`: creación.
- `updated_at`: última actualización.

Justificación de columnas evaluadas:

- `anonymous_session_id`: sí conviene, porque ayuda a depurar atribución y reintentos sin guardar IP ni PII adicional.
- `form_version`: sí conviene, porque el formulario migrará de Formspree a Supabase y luego puede volverse progresivo.
- `idempotency_key`: sí conviene, pero como último valor por lead, no como tabla separada en fase 1.
- `profile_completed_at`: sí conviene como nullable porque evita una migración inmediata cuando se agregue formulario progresivo, sin obligar a guardar campos progresivos todavía.

No se agregan columnas separadas para cada UTM en fase 1. Se conservan en `first_touch` y `last_touch` para reducir duplicación. Si las consultas de campaña lo requieren, se pueden crear columnas generadas o vistas en una fase posterior.

## 3. SQL completo propuesto

SQL propuesto, no ejecutado:

```sql
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  landing_country text not null,
  landing_path text,
  page_path text,
  first_referrer text,
  last_referrer text,
  first_touch jsonb not null default '{}'::jsonb,
  last_touch jsonb not null default '{}'::jsonb,
  marketing_consent boolean not null default false,
  privacy_acknowledged boolean not null default false,
  consent_version text,
  status text not null default 'new',
  anonymous_session_id text,
  form_version text,
  idempotency_key text,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint leads_email_normalized_unique unique (email_normalized),
  constraint leads_email_normalized_not_blank check (length(email_normalized) > 3),
  constraint leads_landing_country_allowed check (
    landing_country in ('atlas', 'colombia', 'mexico', 'venezuela', 'guatemala', 'brasil')
  ),
  constraint leads_status_allowed check (
    status in ('new', 'confirmed', 'unsubscribed', 'invalid', 'spam')
  ),
  constraint leads_email_shape check (
    email_normalized ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  ),
  constraint leads_landing_path_shape check (
    landing_path is null or (
      landing_path like '/%' and
      landing_path not like '%://%' and
      length(landing_path) <= 256
    )
  ),
  constraint leads_page_path_shape check (
    page_path is null or (
      page_path like '/%' and
      page_path not like '%://%' and
      length(page_path) <= 256
    )
  ),
  constraint leads_first_touch_object check (jsonb_typeof(first_touch) = 'object'),
  constraint leads_last_touch_object check (jsonb_typeof(last_touch) = 'object')
);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

create index if not exists leads_updated_at_idx
  on public.leads (updated_at desc);

create index if not exists leads_landing_country_created_at_idx
  on public.leads (landing_country, created_at desc);

create index if not exists leads_status_created_at_idx
  on public.leads (status, created_at desc);

create index if not exists leads_first_touch_gin_idx
  on public.leads using gin (first_touch);

create index if not exists leads_last_touch_gin_idx
  on public.leads using gin (last_touch);

create or replace function public.set_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;

create trigger set_leads_updated_at
before update on public.leads
for each row
execute function public.set_leads_updated_at();

alter table public.leads enable row level security;

revoke all on table public.leads from anon;
revoke all on table public.leads from authenticated;

create policy "No public lead reads"
on public.leads
for select
to anon, authenticated
using (false);

create policy "No public lead inserts"
on public.leads
for insert
to anon, authenticated
with check (false);

create policy "No public lead updates"
on public.leads
for update
to anon, authenticated
using (false)
with check (false);

create policy "No public lead deletes"
on public.leads
for delete
to anon, authenticated
using (false);
```

## 4. Constraints e índices

Constraints:

- `leads_email_normalized_unique`: deduplica por email normalizado.
- `leads_email_normalized_not_blank`: evita valores vacíos o inválidos triviales.
- `leads_landing_country_allowed`: impide países fuera del alcance del sitio.
- `leads_status_allowed`: mantiene estados operativos controlados.
- `leads_email_shape`: defensa secundaria; la validación principal ocurre en el endpoint.
- `leads_landing_path_shape` y `leads_page_path_shape`: evita URLs absolutas y payloads largos.
- `leads_first_touch_object` y `leads_last_touch_object`: fuerza objetos JSON, no arrays ni strings.

Índices:

- `leads_created_at_idx`: listados recientes y métricas por fecha de captura.
- `leads_updated_at_idx`: revisión de leads actualizados por reintentos.
- `leads_landing_country_created_at_idx`: análisis por landing country.
- `leads_status_created_at_idx`: operación por estado.
- `leads_first_touch_gin_idx` y `leads_last_touch_gin_idx`: consultas futuras por UTMs/click IDs dentro del JSON.

## 5. Estrategia de upsert

Clave de conflicto: `email_normalized`.

Regla:

- Si no existe el email, crear lead y guardar `first_touch` y `last_touch`.
- Si existe el email, actualizar solo campos de último contexto y consentimiento.
- Nunca sobrescribir `first_touch`, `first_referrer`, `landing_path` original ni `created_at`.
- Actualizar `last_touch`, `last_referrer`, `page_path`, `marketing_consent`, `privacy_acknowledged`, `consent_version`, `anonymous_session_id`, `form_version`, `idempotency_key` y `updated_at`.

SQL conceptual del upsert:

```sql
insert into public.leads (
  email,
  email_normalized,
  landing_country,
  landing_path,
  page_path,
  first_referrer,
  last_referrer,
  first_touch,
  last_touch,
  marketing_consent,
  privacy_acknowledged,
  consent_version,
  anonymous_session_id,
  form_version,
  idempotency_key
)
values (
  :email,
  :email_normalized,
  :landing_country,
  :landing_path,
  :page_path,
  :first_referrer,
  :last_referrer,
  :first_touch,
  :last_touch,
  :marketing_consent,
  :privacy_acknowledged,
  :consent_version,
  :anonymous_session_id,
  :form_version,
  :idempotency_key
)
on conflict (email_normalized)
do update set
  email = excluded.email,
  page_path = excluded.page_path,
  last_referrer = excluded.last_referrer,
  last_touch = excluded.last_touch,
  marketing_consent = excluded.marketing_consent,
  privacy_acknowledged = excluded.privacy_acknowledged,
  consent_version = excluded.consent_version,
  anonymous_session_id = excluded.anonymous_session_id,
  form_version = excluded.form_version,
  idempotency_key = excluded.idempotency_key
returning id, created_at, updated_at;
```

Nota: `updated_at` lo modifica el trigger. El endpoint no debe registrar el email en logs.

## 6. Estrategia first-touch y last-touch

First-touch:

- El cliente debe enviar `firstTouch`.
- El endpoint acepta solo claves permitidas.
- Al crear un lead se guarda como `first_touch`.
- En upserts posteriores no se sobrescribe.
- Debe incluir, cuando existan: UTMs, click IDs, landing, referrer, timestamp y path.

Last-touch:

- El cliente debe enviar `lastTouch`.
- El endpoint acepta solo claves permitidas.
- En cada registro o reintento válido se guarda como `last_touch`.
- Debe representar el contexto más reciente.

Claves permitidas dentro de `firstTouch` y `lastTouch`:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `fbclid`
- `gclid`
- `ttclid`
- `landing`
- `referrer`
- `page`
- `capturedAt`

Tamaño máximo recomendado por objeto: 4 KB serializado.

## 7. Contrato del endpoint

Endpoint:

`POST /api/leads`

Content-Type:

`application/json`

Payload máximo:

16 KB. Rechazar antes de parsear si `content-length` supera el límite.

Campos permitidos:

- `email`: string, requerido.
- `landingCountry`: string, requerido.
- `landingPath`: string, opcional.
- `pagePath`: string, opcional.
- `firstTouch`: object, opcional.
- `lastTouch`: object, opcional.
- `marketingConsent`: boolean, opcional, default `false`.
- `privacyAcknowledged`: boolean, requerido para aceptar persistencia.
- `consentVersion`: string, opcional pero recomendado.
- `honeypot`: string, opcional; si tiene contenido, tratar como spam silencioso.
- `formStartedAt`: string ISO o number epoch ms, requerido.
- `idempotencyKey`: string, requerido.
- `anonymousSessionId`: string, opcional.
- `formVersion`: string, requerido.

Campos rechazados:

- Cualquier campo no listado.
- Objetos anidados fuera de `firstTouch` y `lastTouch`.
- Arrays.
- Texto libre no previsto.
- PII adicional como nombre, teléfono o dirección.

Allowlist de países:

- `atlas`
- `colombia`
- `mexico`
- `venezuela`
- `guatemala`
- `brasil`

Validación de paths:

- Deben empezar con `/`.
- No pueden contener `://`.
- Máximo 256 caracteres.
- Rutas esperadas: `/`, `/colombia`, `/mexico`, `/venezuela`, `/guatemala`, `/brasil`; aceptar equivalentes `.html` solo durante transición si el cliente todavía los envía.

## 8. Ejemplos de request y response

Request válido:

```json
{
  "email": "Persona@Example.com ",
  "landingCountry": "guatemala",
  "landingPath": "/guatemala",
  "pagePath": "/guatemala",
  "firstTouch": {
    "utm_source": "instagram",
    "utm_medium": "paid",
    "utm_campaign": "gt_abuela_v1",
    "utm_content": "video_atitlan",
    "landing": "/guatemala",
    "referrer": "direct",
    "capturedAt": "2026-07-15T18:00:00.000Z"
  },
  "lastTouch": {
    "utm_source": "instagram",
    "utm_medium": "paid",
    "utm_campaign": "gt_abuela_v1",
    "utm_content": "video_atitlan",
    "page": "/guatemala",
    "referrer": "direct",
    "capturedAt": "2026-07-15T18:02:00.000Z"
  },
  "marketingConsent": true,
  "privacyAcknowledged": true,
  "consentVersion": "2026-07-15",
  "honeypot": "",
  "formStartedAt": "2026-07-15T18:01:50.000Z",
  "idempotencyKey": "client-generated-random-id",
  "anonymousSessionId": "client-generated-session-id",
  "formVersion": "lead-v1"
}
```

Response exitoso:

```json
{
  "ok": true,
  "leadStatus": "accepted"
}
```

Response honeypot:

```json
{
  "ok": true,
  "leadStatus": "accepted"
}
```

El honeypot debe devolver éxito genérico para no entrenar bots, pero no debe escribir como lead válido.

Response de validación:

```json
{
  "ok": false,
  "error": "invalid_request"
}
```

No devolver detalles con PII ni indicar si un email ya existe.

## 9. Códigos HTTP

- `200 OK`: lead creado, actualizado o honeypot aceptado silenciosamente.
- `400 Bad Request`: JSON inválido, campos extra, formato inválido, path inválido, país fuera de allowlist.
- `405 Method Not Allowed`: método distinto de `POST`.
- `413 Payload Too Large`: payload mayor a 16 KB.
- `415 Unsupported Media Type`: Content-Type distinto de `application/json`.
- `429 Too Many Requests`: rate limit superado.
- `500 Internal Server Error`: error no esperado.
- `503 Service Unavailable`: Supabase no disponible o variables críticas ausentes.

Respuesta pública siempre genérica.

## 10. Validación server-side

Reglas:

- Rechazar método no `POST`.
- Rechazar `Content-Type` no JSON.
- Rechazar payload grande.
- Parsear JSON de forma segura.
- Rechazar campos no permitidos.
- `email`: trim, lowercase para `email_normalized`, validación de formato y longitud máxima 254.
- `landingCountry`: allowlist estricta.
- `landingPath` y `pagePath`: path relativo, longitud máxima 256.
- `firstTouch` y `lastTouch`: objeto plano con claves permitidas y valores string acotados.
- `marketingConsent`: boolean.
- `privacyAcknowledged`: debe ser `true` para escritura real.
- `consentVersion`: string corta; recomendado formato fecha o versión semántica.
- `honeypot`: si no está vacío, devolver éxito genérico sin insertar.
- `formStartedAt`: debe existir y tener antigüedad mínima.
- `idempotencyKey`: string requerida, longitud razonable, por ejemplo 16 a 128.
- `formVersion`: string requerida.

Tiempo mínimo de envío:

- Rechazar o aceptar silenciosamente envíos con menos de 2 segundos desde `formStartedAt`.
- Recomendación: tratar como spam silencioso con `200 OK` genérico para no revelar regla.

## 11. Idempotencia

Objetivo:

- Evitar duplicados por doble click, retry del navegador o timeout.

Fase 1:

- El cliente genera `idempotencyKey`.
- El servidor guarda el último `idempotency_key` aceptado en `leads`.
- Si llega el mismo `email_normalized` con el mismo `idempotencyKey`, devolver `200 OK` sin cambiar first-touch.
- Si llega el mismo email con key distinta, ejecutar upsert normal y actualizar last-touch.

Limitación:

- Una sola columna no audita todos los intentos históricos. Es suficiente para fase 1 porque `lead_events` está pospuesto.

## 12. Rate limiting

Recomendado para Vercel Function:

- Límite por IP aproximada: 5 intentos por minuto y 30 por hora.
- Límite por email normalizado: 3 intentos por 10 minutos.
- Límite global defensivo: 100 intentos por minuto.

Implementación inicial:

- Si no hay Redis/KV aprobado, usar un mecanismo simple serverless no confiable solo como defensa parcial y depender de validación, honeypot y Supabase constraints.
- Recomendación más sólida: usar Vercel KV, Upstash Redis o una tabla separada de rate limit en Supabase. Esto requiere decisión adicional porque agrega dependencia o tabla.

Respuesta:

- `429` con cuerpo genérico.
- No incluir email ni IP en logs.

## 13. Seguridad

Variables:

- `SUPABASE_URL`: URL del proyecto.
- `SUPABASE_SERVICE_ROLE_KEY`: solo servidor; nunca navegador.
- `ALLOWED_ORIGINS`: lista de orígenes permitidos, por ejemplo dominio de producción y preview si se aprueba.

CORS:

- Permitir solo `POST`.
- Permitir solo `Content-Type`.
- `Access-Control-Allow-Origin` debe reflejar únicamente orígenes incluidos en `ALLOWED_ORIGINS`.
- Para solicitudes same-origin desde el sitio, CORS casi no debería intervenir, pero protege previews y usos indebidos.

Supabase:

- Activar RLS.
- Revocar permisos de `anon` y `authenticated`.
- No crear políticas públicas de inserción.
- Escribir con service role desde Vercel Function.
- No exponer service role ni SQL en cliente.

Logs:

- No registrar email.
- No registrar payload completo.
- Loguear solo outcome, código de error, país, path validado y request id si existe.

Payloads:

- Límite 16 KB.
- Rechazar campos extra.
- Rechazar arrays y objetos profundos.
- Acotar longitud de strings.

## 14. Variables de entorno

Necesarias para fase 1:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`

Opcionales recomendadas:

- `LEADS_FORM_VERSION`
- `LEADS_CONSENT_VERSION`
- `LEADS_RATE_LIMIT_ENABLED`
- `LEADS_MIN_SUBMIT_MS`
- `LEADS_MAX_PAYLOAD_BYTES`

No necesarias en fase 1:

- `SUPABASE_ANON_KEY`, porque la inserción principal no ocurre desde navegador.
- `GA4_ID`, `CLARITY_PROJECT_ID` y pixels pagos, porque la tarea no implementa analytics nuevos.

## 15. Archivos futuros

Archivos a crear en una futura implementación:

- `api/leads.js` o `api/leads.ts`: Vercel Serverless Function.
- `supabase/migrations/001_create_leads.sql`: migración propuesta.
- `.env.example`: nombres de variables sin valores reales.

Archivos a modificar en una futura implementación:

- `script.js`: enviar a `/api/leads`, generar idempotency key, añadir last-touch y llamar `trackLead` tras éxito.
- `index.html` y páginas por país: solo si se añade checkbox/texto de consentimiento visible.
- `generar_paises.py`: si se modifica el markup del formulario de páginas por país.
- `docs/ARCHITECTURE.md`: reflejar arquitectura implementada.
- `docs/DECISIONS.md`: registrar ADR de Supabase si se quiere convertir la decisión de tarea en decisión permanente.
- `docs/analytics/measurement-plan.md`: ajustar eventos después de la implementación.

Archivos que no deberían cambiar en fase 1:

- `styles.css`, salvo que consentimiento requiera UI nueva.
- `vercel.json`, salvo que el endpoint necesite cabeceras específicas.
- `robots.txt` y `sitemap.xml`.

## 16. Pruebas

Pruebas unitarias del endpoint:

- Rechaza método distinto de `POST`.
- Rechaza Content-Type inválido.
- Rechaza payload mayor a 16 KB.
- Rechaza JSON inválido.
- Rechaza campos extra.
- Rechaza email inválido.
- Normaliza email con trim y lowercase.
- Rechaza `landingCountry` fuera de allowlist.
- Rechaza path absoluto o con `://`.
- Acepta honeypot con respuesta genérica sin insertar.
- Rechaza o acepta silenciosamente envío demasiado rápido.
- Respeta idempotency key.
- No sobrescribe first-touch en upsert.
- Actualiza last-touch en upsert.

Pruebas de integración:

- Inserción nueva en Supabase.
- Upsert por mismo email.
- RLS impide acceso con anon key.
- Service role desde endpoint puede insertar.
- Error de Supabase devuelve respuesta segura.

Pruebas manuales:

- Enviar desde `/`, `/colombia`, `/mexico`, `/venezuela`, `/guatemala`, `/brasil`.
- Verificar que `trackLead` se llama solo tras `ok`.
- Confirmar que no hay email en logs.
- Confirmar que no se envían campos extra a analytics.

## 17. Rollback

Plan de rollback:

1. Mantener el código anterior de Formspree disponible hasta validar Supabase.
2. Si `/api/leads` falla, revertir `script.js` al envío anterior o activar temporalmente fallback de Formspree si hay ID real.
3. No borrar la tabla `leads`; dejarla intacta para preservar capturas realizadas.
4. Desactivar variables de entorno solo si se retira el endpoint.
5. Si la migración SQL causa problemas, aplicar migración correctiva en vez de editar datos manualmente.

Rollback de datos:

- No eliminar leads salvo solicitud explícita y política de privacidad aplicable.
- Si se insertan leads de prueba, marcarlos como `invalid` o borrarlos solo si están claramente identificados como pruebas internas.

## 18. Riesgos

Críticos:

- Exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente.
- Crear políticas RLS públicas por error.
- Sobrescribir first-touch en upserts.
- Enviar PII a analytics.
- Guardar payloads completos en logs.

Importantes:

- Rate limiting débil en entorno serverless sin storage compartido.
- Regex de email demasiado estricta o demasiado laxa.
- Rechazar leads válidos por CORS mal configurado.
- Duplicar eventos de conversión si se llama `trackLead` antes y después de persistencia.
- Consentimiento insuficiente para marketing o analytics.

Operativos:

- `base_commit` de la tarea está como `PENDIENTE_REEMPLAZAR`.
- La tarea `task-002` está no rastreada al momento del reporte.

## 19. Decisiones pendientes

- Versión inicial de consentimiento (`consentVersion`).
- Texto visible de privacidad y marketing.
- Duración de persistencia cliente para first-touch y last-touch.
- Herramienta real de rate limiting.
- Si se aceptan rutas `.html` durante transición.
- Si `privacyAcknowledged` debe ser requerido desde el primer deploy o se introduce junto con un cambio visual.
- Si `profile_completed_at` queda en fase 1 o se posterga hasta el formulario progresivo.
- Si se crea `.env.example`.

## 20. Plan exacto de implementación

1. Crear migración SQL `supabase/migrations/001_create_leads.sql` con la tabla `leads`, constraints, índices, trigger y RLS.
2. Crear `.env.example` con nombres de variables sin valores.
3. Configurar variables reales en Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`.
4. Crear `api/leads.js`.
5. Implementar validación de método, Content-Type, tamaño y JSON.
6. Implementar allowlist de campos y países.
7. Implementar normalización de email.
8. Implementar sanitización de `firstTouch` y `lastTouch`.
9. Implementar honeypot y tiempo mínimo de envío.
10. Implementar upsert por `email_normalized`.
11. Implementar respuestas HTTP genéricas.
12. Actualizar `script.js` para enviar JSON a `/api/leads`.
13. Generar `idempotencyKey`, `anonymousSessionId`, `formStartedAt`, `formVersion`, first-touch y last-touch en cliente.
14. Mantener `trackLead` solo después de respuesta `ok`.
15. Probar localmente con variables de entorno de prueba.
16. Probar en Vercel preview.
17. Validar RLS con anon key.
18. Validar que logs no contengan email.
19. Hacer smoke test interno con cada landing.
20. Actualizar documentación de arquitectura y decisiones.

## 21. Validaciones ejecutadas en esta tarea

Comandos ejecutados:

- `git status --short`
- `git branch --show-current`
- `git rev-parse HEAD`
- Lectura de `AGENTS.md`.
- Lectura de `docs/tasks/task-002-design-supabase-foundation.md`.
- Lectura de `docs/HOME.md`.
- Lectura de `docs/PROJECT_CONTEXT.md`.
- Lectura de `docs/DECISIONS.md`.
- Lectura de `docs/ARCHITECTURE.md`.
- Lectura de `docs/reports/task-001-audit-lead-capture-report.md`.
- Lectura de `docs/analytics/measurement-plan.md`.

Resultado:

- No se modificó código de producción.
- No se creó proyecto Supabase.
- No se ejecutó SQL real.
- No se modificó `script.js`, HTML, `analytics-config.js` ni `vercel.json`.
- No se hizo commit.
- No se hizo push.

## HANDOFF PARA CHATGPT

Repositorio: `amaragioglio/origenes-coffee`.

Rama: `docs/project-brain`.

Commit actual usado para el diseño: `05a28856708fe5ffe275055aebef44631bc31bcb`.

Tarea: `docs/tasks/task-002-design-supabase-foundation.md`.

Reporte: `docs/reports/task-002-design-supabase-foundation-report.md`.

Arquitectura recomendada:

- Sitio estático conserva diseño.
- `POST /api/leads` recibe leads.
- Vercel Serverless Function valida y escribe en Supabase.
- Supabase se usa solo desde servidor con service role.
- Conversiones se disparan solo después de persistencia exitosa.
- First-touch no se sobrescribe; last-touch se actualiza en reintentos.

SQL propuesto:

- Tabla `public.leads`.
- Unique por `email_normalized`.
- Constraints de país, estado, email, paths y JSON object.
- Índices por fechas, país, estado y JSONB GIN.
- Trigger `updated_at`.
- RLS habilitado y sin acceso público para `anon`/`authenticated`.

Endpoint:

- `POST /api/leads`.
- JSON máximo 16 KB.
- Campos permitidos estrictos.
- Respuestas públicas genéricas.
- `200` para éxito, upsert y honeypot silencioso.
- `400`, `405`, `413`, `415`, `429`, `500`, `503` según caso.

Variables necesarias:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`

Pendiente antes de implementar:

- Reemplazar `base_commit: PENDIENTE_REEMPLAZAR` en la tarea si se quiere precisión documental.
- Aprobar texto y versión de consentimiento.
- Elegir mecanismo de rate limiting real.
- Decidir si se aceptan rutas `.html`.
- Decidir si `profile_completed_at` entra en fase 1 o se posterga.
