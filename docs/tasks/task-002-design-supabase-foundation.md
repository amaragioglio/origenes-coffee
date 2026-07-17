---
id: task-002
title: Design Supabase lead capture foundation
status: ready
priority: high
created: 2026-07-15
updated: 2026-07-15
base_branch: docs/project-brain
base_commit: PENDIENTE_REEMPLAZAR
assigned_agent: codex
report_path: docs/reports/task-002-design-supabase-foundation-report.md
---

# Objetivo

Diseñar en detalle la primera fase de implementación para sustituir Formspree por Supabase mediante una Vercel Serverless Function, sin modificar todavía código de producción.

# Decisiones aprobadas

- Mantener el sitio estático.
- Sustituir Formspree por Supabase.
- Usar una Vercel Serverless Function para recibir leads.
- Usar Supabase solo desde servidor para la inserción principal.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` al navegador.
- Mantener Vercel Web Analytics.
- Disparar conversiones únicamente después de persistencia exitosa.
- Implementar first-touch y last-touch.
- Empezar con una tabla `leads`.
- Posponer `lead_events` hasta que exista una necesidad real.
- No cambiar diseño editorial en esta fase.

# Alcance

Diseñar:

- Esquema final de la tabla `leads`.
- SQL de migración.
- Constraints.
- Índices.
- Estrategia de upsert.
- Normalización de email.
- Estrategia de deduplicación.
- Preservación de first-touch.
- Actualización de last-touch.
- Endpoint `POST /api/leads`.
- Validación server-side.
- Allowlist de orígenes.
- Honeypot.
- Tiempo mínimo de envío.
- Idempotencia.
- Rate limiting proporcional.
- Respuestas HTTP.
- Manejo de errores.
- Variables de entorno.
- Estrategia de pruebas.
- Plan de rollback.
- Archivos que se crearán o modificarán.

# Fuera de alcance

- No crear proyecto de Supabase.
- No ejecutar SQL real.
- No modificar `script.js`.
- No modificar HTML.
- No modificar `analytics-config.js`.
- No desplegar.
- No hacer commit.
- No hacer push.
- No añadir IDs reales.
- No implementar todavía GA4 ni Clarity.
- No implementar todavía el formulario progresivo.

# Modelo mínimo esperado

La tabla `leads` debe considerar como mínimo:

- `id uuid primary key`
- `email text not null`
- `email_normalized text not null unique`
- `landing_country text`
- `landing_path text`
- `page_path text`
- `first_referrer text`
- `last_referrer text`
- `first_touch jsonb`
- `last_touch jsonb`
- `marketing_consent boolean not null default false`
- `privacy_acknowledged boolean not null default false`
- `consent_version text`
- `status text not null default 'new'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Evalúa si también hacen falta:

- `anonymous_session_id`
- `form_version`
- `idempotency_key`
- `profile_completed_at`

No agregues columnas innecesarias.

# Reglas de atribución

## First-touch

- Se guarda únicamente cuando el lead se crea.
- No se sobrescribe en registros posteriores.
- Debe incluir UTMs, click IDs, landing y referrer cuando existan.

## Last-touch

- Se actualiza cuando el mismo email vuelve a registrarse.
- Debe conservar el contexto más reciente.
- No debe borrar first-touch.

# Reglas de email

- Aplicar trim.
- Convertir a lowercase.
- Validar formato server-side.
- No guardar el email en logs.
- Deduplicar por `email_normalized`.
- Conservar el email original solo si aporta valor real; justificarlo.

# Endpoint propuesto

Diseñar:

`POST /api/leads`

Entrada esperada:

- `email`
- `landingCountry`
- `landingPath`
- `pagePath`
- `firstTouch`
- `lastTouch`
- `marketingConsent`
- `privacyAcknowledged`
- `consentVersion`
- `honeypot`
- `formStartedAt`
- `idempotencyKey`

Definir:

- Payload máximo.
- Content-Type.
- Campos permitidos.
- Campos rechazados.
- Allowlist de países.
- Validación de paths.
- Códigos HTTP.
- Respuesta pública segura.
- Manejo de duplicados.
- Manejo de reintentos.

# Seguridad

Analizar:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`
- Rate limiting.
- CORS.
- Protección contra spam.
- Prevención de payloads grandes.
- Logs sin PII.
- Secretos solo en Vercel.
- RLS en Supabase.
- Si la tabla debe permitir cero acceso público y ser escrita solo desde service role.

# Entregable

Crear:

`docs/reports/task-002-design-supabase-foundation-report.md`

El reporte debe incluir:

1. Arquitectura final propuesta.
2. SQL completo propuesto.
3. Explicación de cada constraint e índice.
4. Contrato del endpoint.
5. Ejemplos de request y response.
6. Estrategia de upsert.
7. Estrategia first-touch y last-touch.
8. Seguridad.
9. Rate limiting.
10. Variables de entorno.
11. Archivos futuros.
12. Pruebas.
13. Rollback.
14. Riesgos.
15. Decisiones pendientes.
16. Plan exacto de implementación.

Terminar con:

## HANDOFF PARA CHATGPT