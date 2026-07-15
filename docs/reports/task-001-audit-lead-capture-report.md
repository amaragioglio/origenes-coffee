---
id: report-task-001
title: Audit lead capture
created: 2026-07-15
updated: 2026-07-15
task_path: docs/tasks/task-001-audit-lead-capture.md
base_branch: main
base_commit: 476e595
actual_branch: docs/project-brain
actual_commit: dd04e42c5938496d3df5824f17e49667c7558790
agent: codex
---

# Auditoría de captura de leads

## 1. Estado de Git

Confirmado al inicio de la auditoría:

- Repositorio: `amaragioglio/origenes-coffee`.
- Rama actual: `docs/project-brain`.
- Commit actual: `dd04e42c5938496d3df5824f17e49667c7558790`.
- Commit base indicado por la tarea: `476e595`.
- La tarea indica `base_branch: main`, pero no se cambió de rama porque la política de Git lo prohíbe sin autorización.
- Archivos no rastreados preexistentes al reporte: `docs/.obsidian/graph.json` y `docs/tasks/task-001-audit-lead-capture.md`.
- No se hizo commit.
- No se hizo push.

## 2. Arquitectura actual

Confirmado:

- Sitio estático sin build.
- Despliegue configurado para Vercel mediante `vercel.json`.
- Landings existentes: `index.html`, `colombia.html`, `mexico.html`, `venezuela.html`, `guatemala.html` y `brasil.html`.
- Página `404.html`.
- Todas las landings principales cargan `analytics-config.js`, `script.js` y Vercel Web Analytics.
- `404.html` carga Vercel Web Analytics, pero no `script.js` ni `analytics-config.js`.
- `vercel.json` activa `cleanUrls`, `trailingSlash: false`, cache inmutable para `assets/` y cabeceras `X-Content-Type-Options` y `Referrer-Policy`.

## 3. Flujo actual del formulario

Confirmado:

1. Cada landing principal contiene un formulario `id="leadForm"` con `data-origen`.
2. Orígenes actuales: `atlas`, `colombia`, `mexico`, `venezuela`, `guatemala`, `brasil`.
3. Cada formulario incluye:
   - Campo honeypot `_gotcha`.
   - Campo `email` requerido con validación nativa del navegador.
   - Botón `I want in`.
4. `script.js` intercepta `submit` con `preventDefault()`.
5. Lee `emailInput.value.trim()`.
6. Si `FORMSPREE_ID === "TU_ID_AQUI"`, abre fallback `mailto`.
7. Si hay ID real, construye `FormData(leadForm)`.
8. Añade `origen`, `pagina`, atribución guardada y `_subject`.
9. Envía `fetch` a `https://formspree.io/f/${FORMSPREE_ID}`.
10. Si `res.ok`, muestra éxito y llama `window.trackLead(...)`.
11. Si Formspree falla, reactiva el botón y cae a `mailto`.

## 4. Referencias a Formspree

Confirmado:

- `script.js` define `const FORMSPREE_ID = "TU_ID_AQUI"`.
- `script.js` usa `fetch` contra `https://formspree.io/f/${FORMSPREE_ID}`.
- `README.md` documenta cómo crear una cuenta de Formspree y reemplazar `TU_ID_AQUI`.
- `ADS.md` asume comparación de leads en Formspree.
- `docs/ARCHITECTURE.md` y `docs/DECISIONS.md` documentan el estado actual y la evaluación propuesta de Supabase.
- `INVESTIGACION.md` conserva notas históricas donde el formulario todavía se describe como `mailto` o futuro Formspree/Tally; eso es contexto histórico, no estado técnico más reciente.

## 5. Qué ocurre con `TU_ID_AQUI`

Confirmado:

- Mientras `FORMSPREE_ID` sea `TU_ID_AQUI`, no hay envío a Formspree.
- El formulario abre un correo prellenado a una dirección hardcoded en `script.js`.
- En ese camino no se llama `trackLead`.
- En ese camino no se adjuntan UTMs al cuerpo del email; solo se incluye email y origen.
- El usuario puede cerrar el cliente de correo sin enviar, por lo que no hay garantía real de captura.

## 6. Captura actual de UTMs

Confirmado:

- `script.js` ejecuta una IIFE `captureUtm`.
- Si `sessionStorage.getItem("oc_attrib")` ya existe, no lo sobrescribe.
- Captura: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `ttclid`.
- Añade `landing = window.location.pathname`.
- Añade `referrer = document.referrer || "direct"`.
- Guarda todo como JSON en `sessionStorage` bajo `oc_attrib`.
- Al enviar a Formspree, parsea `oc_attrib` y añade sus pares clave/valor a `FormData`.

Riesgo confirmado:

- `sessionStorage` solo vive en la pestaña/sesión actual. No persiste entre sesiones, navegadores o dispositivos.
- No hay last-touch.
- Si la primera visita no trae UTMs, se guarda igualmente `landing` y `referrer`; una visita posterior con UTMs en la misma sesión no sobrescribe `oc_attrib`.

## 7. Analítica actual

Confirmado:

- Vercel Web Analytics está cargado en las páginas principales y en `404.html`.
- `analytics-config.js` contiene IDs vacíos para Meta Pixel, Google Ads, GA4 y TikTok Pixel.
- Con IDs vacíos no se cargan scripts de esas plataformas.
- `window.trackLead(pais)` existe y dispara:
  - `fbq('track', 'Lead', { content_category: pais })` si Meta Pixel está configurado.
  - `gtag('event', 'generate_lead', { origin_country: pais })` si GA4 o Google Ads están configurados.
  - `ttq.track('SubmitForm', { content_id: pais })` si TikTok Pixel está configurado.
- `trackLead` solo se llama después de `res.ok` de Formspree.
- No hay integración actual de Microsoft Clarity.

## 8. Datos enviados actualmente

Confirmado para Formspree cuando hay ID real:

- `email`.
- `_gotcha`, si el bot lo llena.
- `origen`.
- `pagina`.
- Campos de atribución disponibles: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `ttclid`, `landing`, `referrer`.
- `_subject`.

Confirmado para fallback `mailto`:

- Email.
- Origen.

No confirmado:

- No hay almacenamiento propio.
- No hay deduplicación.
- No hay endpoint seguro.
- No hay consentimiento explícito separado del envío.

## 9. Validaciones existentes

Confirmado:

- Validación nativa HTML: `input type="email"` y `required`.
- `autocomplete="email"` e `inputmode="email"`.
- `trim()` del email en JavaScript.
- Manejo de error de Formspree con fallback a `mailto`.
- Honeypot `_gotcha`.

Limitaciones:

- No hay normalización explícita a lowercase.
- No hay validación server-side propia.
- No hay rate limiting propio.
- No hay validación de origen contra allowlist server-side.
- No hay deduplicación por email.
- No hay control de consentimiento.

## 10. Riesgos críticos

- Captura no garantizada mientras `FORMSPREE_ID` siga como `TU_ID_AQUI`, porque el fallback depende de que el usuario envíe el email desde su cliente.
- Si se migra directo a Supabase desde el cliente con una key inadecuada, se expondrían credenciales o se permitirían escrituras no controladas.
- Sin endpoint server-side, no hay control robusto contra spam, abuso, payloads inesperados ni rate limiting.
- Sin política de privacidad y consentimiento definidos, recolectar más datos que email/origen puede crear riesgo legal y reputacional.
- La atribución en `sessionStorage` puede perderse antes de convertir.

## 11. Riesgos importantes

- Eventos duplicados si en el futuro se dispara `trackLead` tanto en cliente como en servidor o si se reintenta el submit sin idempotencia.
- `trackLead` no se ejecuta en el fallback `mailto`, por lo que las conversiones quedan incompletas mientras Formspree no esté configurado.
- El campo honeypot ayuda, pero no sustituye controles server-side.
- Formspree recibe PII y UTMs; hay dependencia externa para leads.
- La documentación histórica tiene referencias a `mailto`, Tally y Formspree en distintos estados; puede confundir si no se toma `script.js` como fuente técnica actual.
- El email hardcoded en cliente expone una dirección de contacto.

## 12. Mejoras recomendadas

Recomendado:

- Implementar una Vercel Serverless Function para recibir leads.
- Guardar leads en Supabase desde el servidor usando service role solo en variable de entorno.
- Mantener el cliente estático y enviar el formulario a `/api/leads`.
- Normalizar email a lowercase y deduplicar.
- Guardar first-touch y last-touch.
- Añadir idempotency key por intento de lead.
- Disparar eventos de conversión solo después de confirmar persistencia.
- Registrar errores de formulario sin PII sensible.
- Añadir consentimiento visible antes de ampliar campos progresivos.
- Mantener Formspree temporalmente solo como fallback operativo o retirarlo cuando Supabase esté probado.

## 13. Arquitectura propuesta

Recomendado, no implementado:

Visitante -> landing por país -> captura first-touch y last-touch -> formulario -> `POST /api/leads` -> validación server-side -> protección antispam -> Supabase -> respuesta OK -> evento de conversión -> enriquecimiento progresivo opcional.

Componentes:

- Cliente: conserva UI actual, captura atribución, envía JSON o `FormData` al endpoint.
- Vercel Serverless Function: valida, normaliza, aplica rate limiting básico y escribe en Supabase.
- Supabase: almacena leads y eventos de atribución.
- Analytics: GA4, Vercel Analytics y Clarity con consentimiento y sin PII.

## 14. Modelo de datos de Supabase

Recomendado, no implementado:

Tabla `leads`:

- `id uuid primary key`.
- `email text not null`.
- `email_normalized text not null unique`.
- `origin_country text`.
- `landing_path text`.
- `page_path text`.
- `referrer text`.
- `first_touch jsonb`.
- `last_touch jsonb`.
- `utm_source text`.
- `utm_medium text`.
- `utm_campaign text`.
- `utm_content text`.
- `utm_term text`.
- `fbclid text`.
- `gclid text`.
- `ttclid text`.
- `consent_marketing boolean`.
- `consent_analytics boolean`.
- `status text default 'new'`.
- `created_at timestamptz default now()`.
- `updated_at timestamptz default now()`.

Tabla opcional `lead_events`:

- `id uuid primary key`.
- `lead_id uuid references leads(id)`.
- `event_name text`.
- `page_path text`.
- `metadata jsonb`.
- `created_at timestamptz default now()`.

Campos progresivos futuros, si se aprueban:

- `identity_country text`.
- `preferred_origin text`.
- `purchase_intent text`.
- `price_range text`.
- `profile_completed_at timestamptz`.

## 15. Estrategia first-touch y last-touch

Recomendado:

- Mantener `first_touch` como el primer set de UTMs/click IDs visto.
- Añadir `last_touch` que se actualice en cada visita con parámetros de campaña.
- Persistir ambos en `localStorage` con expiración explícita, por ejemplo 30 o 90 días, si privacidad lo aprueba.
- Enviar ambos al endpoint al convertir.
- En Supabase, guardar snapshot de atribución por lead para evitar cambios posteriores.

Pendiente de decisión:

- Duración exacta de persistencia.
- Si se permite `localStorage` antes o después del consentimiento.
- Reglas de prioridad cuando existen click IDs y UTMs.

## 16. Eventos de GA4

Recomendado, no implementado:

- `lead_form_view`: cuando el bloque de formulario entra en viewport.
- `lead_form_submit`: intento de envío, sin email ni PII.
- `generate_lead`: solo después de persistencia correcta.
- `lead_form_error`: error técnico o validación fallida, sin PII.
- `profile_step_completed`: si se implementa formulario progresivo.

Parámetros recomendados sin PII:

- `origin_country`.
- `landing_path`.
- `page_path`.
- `utm_source`.
- `utm_medium`.
- `utm_campaign`.
- `utm_content`.
- `form_version`.

Evitar:

- Email.
- Nombre.
- Teléfono.
- Texto libre sensible.

## 17. Integración de Clarity

Recomendado, no implementado:

- Añadir Microsoft Clarity solo después de decidir consentimiento y privacidad.
- Cargarlo condicionalmente desde `analytics-config.js` o un módulo equivalente.
- Configurar masking de campos de formulario.
- No enviar identificadores personales.
- Documentar el ID en variable/configuración, no inventarlo.

Pendiente de decisión:

- Si Clarity se activa antes del smoke test o después de validar tráfico básico.
- Si requiere banner o consentimiento explícito según política final.

## 18. Protección contra spam

Recomendado:

- Mantener honeypot `_gotcha`.
- Añadir rate limiting por IP en el endpoint.
- Validar email server-side.
- Rechazar orígenes fuera de allowlist.
- Añadir timestamp de carga del formulario y rechazar envíos demasiado rápidos.
- Considerar Turnstile o hCaptcha solo si aparece spam real.
- Registrar intentos bloqueados sin guardar PII innecesaria.

## 19. Privacidad

Pendiente de decisión:

- Política de privacidad.
- Texto de consentimiento para marketing.
- Consentimiento para analytics no esenciales.
- Retención de leads.
- Derecho de baja o eliminación.
- Lista final de campos permitidos.

Recomendado:

- Recoger inicialmente solo email, origen/página y atribución necesaria para medir campañas.
- No enviar PII a GA4, Meta, TikTok, Google Ads ni Clarity.
- Mantener secretos únicamente en variables de entorno de Vercel.

## 20. Variables de entorno

Recomendado para implementación futura:

- `SUPABASE_URL`.
- `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_ANON_KEY`, solo si se usa para lectura pública o SDK cliente con RLS estricta; no necesaria para inserción si todo pasa por endpoint.
- `LEADS_RATE_LIMIT_SECRET` o equivalente si se firma algún control.
- `ALLOWED_ORIGINS`.
- `GA4_ID`, si se mueve fuera de configuración cliente hardcoded.
- `GOOGLE_ADS_ID`.
- `GOOGLE_ADS_CONVERSION_LABEL`, si se mide conversión de Ads.
- `META_PIXEL_ID`.
- `TIKTOK_PIXEL_ID`.
- `CLARITY_PROJECT_ID`.

No se deben inventar valores.

## 21. Archivos que cambiarían en una futura implementación

Recomendado, no ejecutado:

- `script.js`: cambiar destino de envío, añadir last-touch, idempotencia y eventos.
- `analytics-config.js`: añadir Clarity y separar configuración de eventos.
- `index.html` y páginas por país: solo si se añade consentimiento o campos progresivos.
- `generar_paises.py`: si los cambios de formulario deben replicarse en landings generadas.
- `vercel.json`: solo si requiere headers o rutas específicas para `/api`.
- `api/leads.js` o equivalente: nuevo endpoint.
- Documentación en `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/analytics/measurement-plan.md`.
- `.env.example`: si se decide documentar variables sin secretos.

## 22. Plan incremental

1. Aprobar si Formspree se reemplaza, se complementa o se mantiene como fallback.
2. Definir política mínima de privacidad y consentimiento.
3. Diseñar tabla `leads` y constraints de deduplicación.
4. Crear endpoint Vercel `POST /api/leads`.
5. Conectar Supabase server-side con variables de entorno.
6. Cambiar `script.js` para enviar al endpoint.
7. Mantener `trackLead` después de persistencia correcta.
8. Añadir last-touch y persistencia con expiración si se aprueba.
9. Añadir eventos GA4 sin PII.
10. Evaluar Clarity con masking y consentimiento.
11. Probar con campañas internas antes de gastar presupuesto.
12. Retirar Formspree si Supabase queda estable.

## 23. Decisiones que requieren aprobación

- Sustituir Formspree por Supabase o mantener ambos temporalmente.
- Usar Vercel Serverless Function como endpoint seguro.
- Campos definitivos del modelo de datos.
- Uso de `localStorage` y duración de atribución.
- Política de privacidad y consentimiento.
- Activación de GA4, Meta Pixel, Google Ads, TikTok Pixel y Clarity.
- Uso de CAPTCHA o Turnstile.
- Regla de deduplicación por email.
- Criterios de éxito del smoke test.

## 24. Validaciones ejecutadas

Comandos ejecutados:

- `git status --short`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git log --oneline --decorate -10`
- `git diff --check`
- Búsquedas con `rg` de Formspree, `TU_ID_AQUI`, `trackLead`, `utm_`, `fetch`, `sessionStorage`, formularios HTML y scripts de analytics.
- Revisión de `vercel.json`.
- Revisión de `script.js`.
- Revisión de `analytics-config.js`.
- Revisión de `README.md`, `ADS.md`, `INVESTIGACION.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` y `docs/analytics/measurement-plan.md`.

Resultado:

- No se modificó código de producción.
- No se modificaron HTML, CSS, JavaScript, Python, `vercel.json`, `robots.txt` ni `sitemap.xml`.
- Solo se creó este reporte.

## HANDOFF PARA CHATGPT

Repositorio: `amaragioglio/origenes-coffee`.

Rama: `docs/project-brain`.

Commit base de tarea: `476e595`.

Commit actual auditado: `dd04e42c5938496d3df5824f17e49667c7558790`.

Archivos revisados:

- `index.html`
- `colombia.html`
- `mexico.html`
- `venezuela.html`
- `guatemala.html`
- `brasil.html`
- `404.html`
- `script.js`
- `analytics-config.js`
- `vercel.json`
- `README.md`
- `ADS.md`
- `INVESTIGACION.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/analytics/measurement-plan.md`
- Historial reciente de Git.

Arquitectura encontrada:

- Sitio estático en Vercel.
- Formulario común en portada y cinco landings por país.
- Formspree preparado pero sin ID real.
- Fallback `mailto` activo mientras `FORMSPREE_ID` sea `TU_ID_AQUI`.
- UTMs first-touch en `sessionStorage`.
- Vercel Web Analytics activo.
- GA4, Meta Pixel, Google Ads y TikTok preparados con IDs vacíos.
- Clarity no implementado.

Riesgos:

- Captura no garantizada con `mailto`.
- Atribución frágil por `sessionStorage`.
- Sin endpoint seguro.
- Sin deduplicación.
- Sin privacidad/consentimiento definidos.
- Riesgo de eventos duplicados en una futura integración si no se centraliza el disparo post-persistencia.

Recomendación técnica:

- Implementar `POST /api/leads` en Vercel.
- Escribir en Supabase desde servidor.
- Mantener sitio estático.
- Disparar conversiones solo tras persistencia correcta.
- Guardar first-touch y last-touch.
- No enviar PII a analytics.

Modelo de datos propuesto:

- Tabla `leads` con email normalizado único, origen, landing, página, referrer, first-touch, last-touch, UTMs/click IDs, consentimientos, estado y timestamps.
- Tabla opcional `lead_events` para eventos asociados.

Variables necesarias:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`
- `GA4_ID`
- `GOOGLE_ADS_ID`
- `GOOGLE_ADS_CONVERSION_LABEL`
- `META_PIXEL_ID`
- `TIKTOK_PIXEL_ID`
- `CLARITY_PROJECT_ID`

Próximos pasos:

1. Aprobar arquitectura Supabase + Vercel Function.
2. Aprobar política mínima de privacidad.
3. Definir modelo final.
4. Crear endpoint y tabla en una tarea separada.
5. Actualizar cliente y medición sin tocar diseño editorial.
