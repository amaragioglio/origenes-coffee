---
id: task-005
title: Fix Supabase lead capture review findings
status: ready
priority: critical
created: 2026-07-17
updated: 2026-07-17
base_branch: feature/supabase-lead-capture
base_commit: 857b777cff0b610f651fc69415d38c6a1b883491
assigned_agent: codex
report_path: docs/reports/task-005-fix-supabase-lead-capture-review-report.md
---

# Objetivo

Corregir los hallazgos críticos e importantes detectados en la revisión de Task 004, sin ampliar el alcance funcional.

# Contexto

La implementación actual incluye:

- `POST /api/leads`
- Vercel Serverless Function
- Supabase server-side
- validación
- first-touch y last-touch
- consentimiento
- honeypot
- timing trap
- rate limiting básico
- pruebas iniciales

La revisión concluyó:

`REQUIERE CORRECCIONES`

# Correcciones obligatorias

## 1. Evitar conversiones falsas

Problema:

- El endpoint devuelve `ok: true` para honeypot y timing trap.
- `script.js` dispara `trackLead` ante cualquier `ok: true`.

Corregir de forma que:

- Respuesta persistida:
  - `ok: true`
  - `leadStatus: "accepted"`
- Honeypot o timing trap:
  - `ok: true`
  - `leadStatus: "ignored"`
- `trackLead` solo se ejecuta cuando:
  - `response.ok === true`
  - `data.ok === true`
  - `data.leadStatus === "accepted"`

No disparar conversiones en:

- honeypot
- timing trap
- errores
- respuestas no persistidas
- respuestas 503
- respuestas 429

Añadir pruebas.

## 2. Preservar marketing consent previo

Problema:

Un nuevo submit con `marketingConsent: false` puede sobrescribir un consentimiento previo `true`.

Regla:

- `false` en un formulario normal significa “no otorgó consentimiento en este envío”.
- No debe revocar un consentimiento anterior.
- La revocación debe ocurrir únicamente mediante un flujo explícito de unsubscribe futuro.

Implementar:

```text
marketing_consent = existing.marketing_consent OR incoming.marketing_consent

Documentar esta decisión.

Añadir prueba:

existing true
incoming false
resultado true
3. No reemplazar last-touch con objeto vacío

Problema:

last_touch puede quedar {}.

Corregir:

Si el objeto sanitizado contiene al menos una clave útil, actualizarlo.
Si queda vacío, preservar el valor existente.
No borrar last_referrer con string vacío o null si existe uno previo.

Añadir pruebas.

4. Mejorar idempotencia

La implementación actual no es atómica.

Para esta fase:

Añadir un índice único parcial sobre idempotency_key cuando no sea null.
Validar formato y longitud del idempotency key.
Si Supabase devuelve conflicto por idempotency key, responder como éxito idempotente y no disparar una segunda conversión.
Distinguir en la respuesta pública:
leadStatus: "accepted"
leadStatus: "duplicate"

En cliente:

trackLead solo para accepted.
No disparar conversión para duplicate.

Documentar que una RPC transaccional sería una mejora futura.

5. Endurecer privacidad en SQL

Añadir constraint:

check (privacy_acknowledged is true)

Verificar que el SQL siga siendo válido.

6. Corregir metadata de Task 004

Reemplazar:

base_commit: CURRENT_HEAD

por el commit real usado.

No cambiar otros campos sin necesidad.

7. Límite de payload

Implementar la mejor protección compatible con Vercel sin migrar de framework.

Requisitos:

Mantener chequeo de content-length.
Rechazar si supera 16 KB.
Documentar que, cuando req.body ya llega parseado, no puede garantizarse el tamaño raw exacto mediante JSON.stringify.
No presentar el límite como estrictamente raw en ese caso.
Si puede configurarse el body parser dentro del estilo de función actual, hacerlo sin romper compatibilidad.
No agregar dependencias innecesarias.
8. Tests HTTP

Añadir pruebas para:

405
415
413 por content-length
429
honeypot -> ignored
timing trap -> ignored
missing Supabase env -> 503
accepted -> trackLead permitido conceptualmente
duplicate -> no segunda conversión
error -> no conversión
CORS permitido
CORS no permitido
marketing consent preservado
first-touch preservado
last-touch vacío preservado
last-touch útil actualizado
privacy constraint presente en SQL
idempotency index presente en SQL
Fuera de alcance
No configurar Supabase real.
No ejecutar migración real.
No configurar Vercel real.
No añadir GA4.
No añadir Clarity.
No crear formulario progresivo.
No rediseñar la landing.
No hacer commit.
No hacer push.
No desplegar.
Archivos permitidos
api/leads.js
api/_lib/validation.js
api/_lib/supabase.js
api/_lib/rate-limit.js, solo si es necesario
script.js
supabase/migrations/001_create_leads.sql
tests/
docs/tasks/task-004-implement-supabase-foundation.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
docs/reports/task-005-fix-supabase-lead-capture-review-report.md
Validaciones

Ejecutar:

git status --short
git diff --check
git diff --stat
node --check api/leads.js
node --check api/_lib/validation.js
node --check api/_lib/supabase.js
node --check script.js

Ejecutar todas las pruebas existentes y nuevas.

Entregable

Crear:

docs/reports/task-005-fix-supabase-lead-capture-review-report.md

Debe incluir:

Hallazgo.
Corrección.
Archivo afectado.
Prueba añadida.
Resultado.
Limitaciones restantes.
Estado de Git.

Terminar con:

HANDOFF PARA CHATGPT

Luego reemplaza:

```yaml
base_commit: CURRENT_HEAD

con:

git rev-parse HEAD
