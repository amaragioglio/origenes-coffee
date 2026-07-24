---
id: task-004
title: Implement Supabase lead capture foundation
status: ready
priority: critical
created: 2026-07-17
updated: 2026-07-17
base_branch: main
base_commit: 857b777cff0b610f651fc69415d38c6a1b883491
assigned_agent: codex
report_path: docs/reports/task-004-implement-supabase-foundation-report.md
---

# Objetivo

Implementar la primera versión funcional del sistema de captura de leads de Orígenes Coffee mediante una Vercel Serverless Function y Supabase, sustituyendo el flujo actual basado en Formspree y `mailto`.

# Contexto

Arquitectura aprobada:

Visitante
→ landing estática
→ captura de first-touch y last-touch
→ formulario
→ `POST /api/leads`
→ validación server-side
→ upsert en Supabase
→ respuesta exitosa
→ evento de conversión

Documentos obligatorios:

- `AGENTS.md`
- `docs/HOME.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/reports/task-001-audit-lead-capture-report.md`
- `docs/reports/task-002-design-supabase-foundation-report.md`
- `docs/analytics/measurement-plan.md`

# Decisiones aprobadas

- Mantener el sitio estático.
- Usar `POST /api/leads`.
- Escribir en Supabase únicamente desde servidor.
- Usar `SUPABASE_SERVICE_ROLE_KEY` solo en entorno server-side.
- No exponer secretos al navegador.
- Usar una única tabla `leads` en fase 1.
- No crear todavía `lead_events`.
- Postergar `profile_completed_at`.
- Mantener el diseño visual actual.
- Disparar `trackLead` solo después de persistencia exitosa.
- Aceptar rutas limpias y rutas `.html`.
- Privacidad obligatoria.
- Marketing opcional y desmarcado.
- Mantener first-touch.
- Actualizar last-touch.
- Eliminar dependencia funcional de Formspree cuando el endpoint esté conectado.

# Alcance

Implementar:

1. Migración SQL de Supabase.
2. Endpoint Vercel `POST /api/leads`.
3. Cliente server-side de Supabase.
4. Validación estricta del payload.
5. Normalización de email.
6. Deduplicación por `email_normalized`.
7. Upsert que preserve first-touch.
8. Actualización de last-touch.
9. Honeypot.
10. Tiempo mínimo de envío.
11. Idempotency key.
12. Anonymous session ID.
13. Form version.
14. Límite de payload de 16 KB.
15. Allowlist de países.
16. Validación de paths.
17. Respuestas HTTP seguras.
18. Rate limiting básico, documentando sus limitaciones.
19. Conexión de `script.js` con `/api/leads`.
20. Estados de loading, success y error.
21. Consentimiento mínimo en los formularios.
22. `.env.example`.
23. Documentación de configuración.
24. Pruebas manuales y automatizadas razonables.

# Fuera de alcance

- No crear proyecto de Supabase automáticamente.
- No ejecutar SQL en una cuenta real.
- No configurar variables reales en Vercel.
- No añadir GA4 todavía.
- No añadir Clarity todavía.
- No implementar formulario progresivo.
- No implementar email de confirmación.
- No instalar un framework.
- No modificar narrativa editorial.
- No hacer commit.
- No hacer push.
- No desplegar.

# Archivos esperados

Ajustar a la arquitectura real:

- `api/leads.js`
- `api/_lib/supabase.js`
- `api/_lib/validation.js`
- `api/_lib/rate-limit.js`
- `supabase/migrations/001_create_leads.sql`
- `.env.example`
- `script.js`
- `index.html`
- páginas HTML por país
- `generar_paises.py`, si es necesario para mantener consistencia
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/reports/task-004-implement-supabase-foundation-report.md`

No crear carpetas o dependencias innecesarias.

# Modelo de datos

Usar como base:

- `id uuid primary key`
- `email text not null`
- `email_normalized text not null unique`
- `landing_country text not null`
- `landing_path text`
- `page_path text`
- `first_referrer text`
- `last_referrer text`
- `first_touch jsonb not null default '{}'`
- `last_touch jsonb not null default '{}'`
- `marketing_consent boolean not null default false`
- `privacy_acknowledged boolean not null default false`
- `consent_version text`
- `status text not null default 'new'`
- `anonymous_session_id text`
- `form_version text`
- `idempotency_key text`
- `created_at timestamptz`
- `updated_at timestamptz`

No añadir `profile_completed_at` en esta fase.

# Endpoint

Implementar:

`POST /api/leads`

## Content-Type

`application/json`

## Payload máximo

16 KB.

## Campos

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
- `anonymousSessionId`
- `formVersion`

Rechazar campos desconocidos.

## Países permitidos

- `atlas`
- `colombia`
- `mexico`
- `venezuela`
- `guatemala`
- `brasil`

## Respuestas

- `200`: creado, actualizado o honeypot silencioso.
- `400`: payload inválido.
- `405`: método no permitido.
- `413`: payload demasiado grande.
- `415`: Content-Type incorrecto.
- `429`: rate limit.
- `500`: error interno.
- `503`: configuración o servicio no disponible.

No revelar detalles internos ni PII.

# Atribución

## First-touch

- Conservar el primer valor.
- No sobrescribir en upserts.
- Persistir en cliente con expiración documentada.
- Aceptar UTMs, click IDs, landing, referrer, page y timestamp.

## Last-touch

- Actualizar cuando existan nuevos parámetros de campaña.
- No borrar valores útiles con objetos vacíos.

Claves permitidas:

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

Máximo 4 KB por objeto.

# Formulario

Mantener el diseño actual.

Añadir:

- Checkbox obligatorio de privacidad.
- Checkbox opcional de marketing, desmarcado.
- Estado de carga.
- Botón desactivado durante envío.
- Mensaje de éxito.
- Mensaje de error.
- Prevención de doble envío.
- Labels accesibles.
- Texto de privacidad con enlace provisional.

No inventar información legal. Usar marcadores:

- `[PENDIENTE: correo de privacidad]`
- `[PENDIENTE: responsable del sitio]`

# Formspree

- Retirar `TU_ID_AQUI`.
- Retirar el flujo principal de Formspree.
- Retirar `mailto` como captura principal.
- No dejar código muerto.
- Documentar el cambio.

# Variables de entorno

Crear `.env.example` con:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ALLOWED_ORIGINS=http://localhost:3000,https://origenescoffee.com

Nunca agregar valores reales.

Rate limiting

Implementar una defensa básica compatible con Vercel y documentar que una estructura en memoria no es garantía global en serverless.

La implementación debe poder reemplazarse posteriormente por:

Vercel KV
Upstash Redis
Supabase
otro almacén persistente

No guardar IP completa en Supabase.

Pruebas

Probar:

Email válido.
Email inválido.
País no permitido.
Path inválido.
Campo desconocido.
Honeypot lleno.
Envío demasiado rápido.
Payload demasiado grande.
Content-Type incorrecto.
Método distinto de POST.
Email duplicado.
First-touch preservado.
Last-touch actualizado.
Consentimiento faltante.
Configuración Supabase ausente.
Error de Supabase.
trackLead solo tras respuesta exitosa.
Todas las landings.
Validaciones

Ejecutar:

git status --short
git diff --check
git diff --stat

Además:

Validación de sintaxis JavaScript.
Pruebas disponibles.
Revisión de secretos.
Revisión de PII en logs.
Revisión de HTML.
Confirmación de que no cambió el diseño editorial.
Confirmación de que no se hizo commit ni push.
Entregable

Crear:

docs/reports/task-004-implement-supabase-foundation-report.md

Debe incluir:

Resumen.
Archivos creados.
Archivos modificados.
SQL.
Endpoint.
Validación.
Upsert.
First-touch y last-touch.
Consentimiento.
Rate limiting.
Variables.
Pruebas.
Errores.
Limitaciones.
Pasos manuales en Supabase.
Pasos manuales en Vercel.
Cómo probar localmente.
Cómo probar en preview.
Rollback.
Pendientes.

Terminar con:

HANDOFF PARA CHATGPT

## Paso 4: reemplaza el commit base

En PowerShell:

```powershell
git rev-parse HEAD

Copia el hash y reemplaza:

base_commit: 857b777cff0b610f651fc69415d38c6a1b883491
