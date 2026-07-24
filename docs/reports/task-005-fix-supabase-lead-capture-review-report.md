# Task 005 - Fix Supabase Lead Capture Review Findings

Fecha: 2026-07-17
Branch: `feature/supabase-lead-capture`
Base commit registrado: `857b777cff0b610f651fc69415d38c6a1b883491`

## Resumen

Se corrigieron los hallazgos criticos e importantes de la revision de Task 004 sin configurar servicios reales, sin ejecutar SQL real, sin commit y sin push.

## Hallazgos y correcciones

### Conversiones falsas

- Hallazgo: `trackLead` podia ejecutarse con respuestas `ok: true` de honeypot o timing trap.
- Correccion: `api/leads.js` devuelve `leadStatus: "ignored"` para honeypot/timing trap y `script.js` solo llama `trackLead` cuando `leadStatus === "accepted"`.
- Archivos: `api/leads.js`, `script.js`.
- Pruebas: `tests/leads-http.test.js`, `tests/script-conversion.test.js`.
- Resultado: corregido.

### Marketing consent previo

- Hallazgo: un submit nuevo con `marketingConsent: false` podia revocar un consentimiento previo `true`.
- Correccion: el update conserva `marketing_consent = existing.marketing_consent OR incoming.marketing_consent`.
- Archivos: `api/_lib/supabase.js`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`.
- Pruebas: `tests/supabase-upsert.test.js`.
- Resultado: corregido.

### Last-touch vacio

- Hallazgo: `last_touch` podia sobrescribirse con `{}` y borrar datos utiles.
- Correccion: `last_touch` solo se incluye en PATCH cuando trae al menos una clave util. `last_referrer` preserva el valor existente si el entrante es vacio/null.
- Archivos: `api/_lib/supabase.js`, `docs/ARCHITECTURE.md`.
- Pruebas: `tests/supabase-upsert.test.js`.
- Resultado: corregido.

### Idempotencia

- Hallazgo: la idempotencia no distinguia duplicados y no habia indice unico parcial para `idempotency_key`.
- Correccion: se agrego indice unico parcial SQL, validacion de formato/longitud y respuesta publica `leadStatus: "duplicate"` para conflictos por idempotency key.
- Archivos: `api/_lib/validation.js`, `api/_lib/supabase.js`, `supabase/migrations/001_create_leads.sql`, `script.js`.
- Pruebas: `tests/leads-validation.test.js`, `tests/supabase-upsert.test.js`, `tests/script-conversion.test.js`, `tests/sql-migration.test.js`.
- Resultado: corregido para esta fase. Una RPC transaccional sigue como mejora futura.

### Privacidad en SQL

- Hallazgo: la API exigia privacidad, pero la tabla podia aceptar `privacy_acknowledged = false`.
- Correccion: se agrego `constraint leads_privacy_acknowledged_true check (privacy_acknowledged is true)`.
- Archivo: `supabase/migrations/001_create_leads.sql`.
- Prueba: `tests/sql-migration.test.js`.
- Resultado: corregido.

### Metadata de Task 004

- Hallazgo: `docs/tasks/task-004-implement-supabase-foundation.md` conservaba `base_commit: CURRENT_HEAD`.
- Correccion: se reemplazo por `857b777cff0b610f651fc69415d38c6a1b883491`. Tambien se registro el mismo base commit real en Task 005.
- Archivos: `docs/tasks/task-004-implement-supabase-foundation.md`, `docs/tasks/task-005-fix-supabase-lead-capture-review.md`.
- Resultado: corregido.

### Limite de payload

- Hallazgo: el limite de 16 KB no era estrictamente raw si Vercel entregaba `req.body` ya parseado.
- Correccion: se mantiene chequeo de `Content-Length`, se corta lectura streaming raw cuando supera 16 KB, se mide `req.body` string antes de parsear y se documenta la limitacion del caso `req.body` ya parseado.
- Archivos: `api/leads.js`, `docs/ARCHITECTURE.md`.
- Pruebas: `tests/leads-http.test.js`.
- Resultado: mejorado dentro del estilo actual de Vercel Function, sin dependencias.

## Pruebas anadidas

- `tests/leads-http.test.js`
  - 405
  - 415
  - 413 por `Content-Length`
  - 413 por body string raw mayor a 16 KB
  - 429
  - honeypot -> `ignored`
  - timing trap -> `ignored`
  - missing Supabase env -> 503
  - accepted -> `accepted`
  - CORS permitido
  - CORS no permitido
- `tests/supabase-upsert.test.js`
  - marketing consent previo `true` preservado ante incoming `false`
  - last-touch util actualizado
  - last-touch vacio preservado
  - conflicto por idempotency key -> `duplicate`
- `tests/script-conversion.test.js`
  - `trackLead` condicionado a `leadStatus === "accepted"`
- `tests/sql-migration.test.js`
  - constraint de privacidad
  - constraint de idempotency key
  - indice unico parcial de idempotency key

Tambien se amplio `tests/leads-validation.test.js` para validar formato de `idempotencyKey`.

## Validaciones ejecutadas

- `git status --short`
- `git diff --check`
- `git diff --stat`
- `node --check api/leads.js`
- `node --check api/_lib/validation.js`
- `node --check api/_lib/supabase.js`
- `node --check script.js`
- `node --check tests/leads-validation.test.js`
- `node --check tests/leads-http.test.js`
- `node --check tests/supabase-upsert.test.js`
- `node --check tests/script-conversion.test.js`
- `node --check tests/sql-migration.test.js`
- `node tests/leads-validation.test.js`
- `node tests/leads-http.test.js`
- `node tests/supabase-upsert.test.js`
- `node tests/script-conversion.test.js`
- `node tests/sql-migration.test.js`

Resultados:

- Sintaxis JS: OK
- Tests: OK
- `git diff --check`: sin errores; solo advertencias LF/CRLF de Windows

## Limitaciones restantes

- El rate limiting sigue siendo en memoria y no global entre instancias serverless.
- El upsert aun no es una RPC transaccional; el indice unico parcial y el manejo de 409 reducen duplicados en esta fase.
- Si Vercel entrega `req.body` ya parseado, no se puede conocer el tamano raw exacto original desde este handler; se mide el JSON reserializado.
- No se ejecuto la migracion SQL contra Supabase real.
- No se configuraron variables reales ni servicios reales.

## Estado de Git

El arbol sigue con cambios modificados y archivos nuevos sin staging. No se hizo commit ni push.

## HANDOFF PARA CHATGPT

Task 005 corrige los hallazgos de revision de Task 004 dentro del alcance solicitado. Antes de commit, revisar el diff completo incluyendo archivos untracked de `api/`, `tests/`, `supabase/` y `docs/reports/`, y ejecutar de nuevo las pruebas si se hacen cambios adicionales.
