# Arquitectura

## Tipo de proyecto

Sitio estático sin dependencias ni build, compuesto por HTML, CSS y JavaScript en la raíz del repositorio.

## Estructura general

- `index.html`: portada editorial y Atlas de países.
- `colombia.html`, `mexico.html`, `venezuela.html`, `guatemala.html`, `brasil.html`: artículos por país.
- `404.html`: página de error.
- `styles.css`: sistema visual editorial.
- `script.js`: navegación, reveal, parallax, progreso de lectura, CTA móvil, atribución UTM, formulario y video.
- `analytics-config.js`: carga condicional de pixels y evento unificado de lead.
- `api/leads.js`: endpoint serverless para captura de leads.
- `api/_lib/`: validación, rate limiting y cliente REST de Supabase para uso server-only.
- `supabase/migrations/001_create_leads.sql`: migración SQL propuesta para la tabla `leads`.
- `generar_paises.py`: genera páginas de país desde una plantilla común.
- `sitemap.xml` y `robots.txt`: SEO técnico.
- `vercel.json`: configuración de Vercel.

## Páginas y rutas

`vercel.json` activa `cleanUrls`, por lo que las rutas públicas esperadas son:

- `/`
- `/colombia`
- `/mexico`
- `/venezuela`
- `/guatemala`
- `/brasil`

El sitemap confirma esas URLs bajo `https://origenescoffee.com`.

## Archivos compartidos

Las páginas cargan `styles.css`, `analytics-config.js` y `script.js`. Las páginas principales incluyen Vercel Web Analytics con `/_vercel/insights/script.js`.

## Estilos

`styles.css` contiene el sistema editorial minimalista descrito en `README.md` e `INVESTIGACION.md`: fondo crema, tipografía serif, hairlines, acentos por país y diseño responsive.

## Scripts

`script.js` implementa:

- Estado de la barra superior.
- Menú móvil.
- Aparición suave al hacer scroll.
- Parallax sutil del hero en páginas de país.
- Barra de progreso de lectura.
- CTA fijo móvil.
- Captura first-touch y last-touch de UTMs y click IDs en `localStorage`, con expiración local de 90 días.
- Envío de leads a `/api/leads` mediante JSON.
- Mensajes de éxito/error del formulario sin fallback externo.
- Reproducción de video en pantalla.
- Año dinámico en el footer.

## Generación de páginas

`generar_paises.py` define una plantilla HTML común y una lista `PAISES` para generar `colombia.html`, `mexico.html`, `venezuela.html`, `guatemala.html` y `brasil.html`. El script usa `SITE = "https://origenescoffee.com"` para metadata y canonical.

## Flujo actual del formulario y leads

Cada formulario tiene `id="leadForm"` y `data-origen` con el origen correspondiente: `atlas`, `colombia`, `mexico`, `venezuela`, `guatemala` o `brasil`.

`script.js` lee el email, honeypot, consentimiento de privacidad obligatorio, consentimiento de marketing opcional, país de aterrizaje, ruta, first-touch, last-touch, `formStartedAt`, `anonymousSessionId`, `idempotencyKey`, `formVersion` y `consentVersion`. El navegador envía ese payload por `POST /api/leads`.

`api/leads.js` valida método, `Content-Type`, tamaño máximo, rate limit, esquema del payload, rutas permitidas, países permitidos, timing mínimo y honeypot. Si la validación es correcta, usa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` solo en servidor para insertar o actualizar un registro en Supabase.

El upsert usa `email_normalized` como identidad del lead: crea un registro nuevo si no existe y actualiza campos operativos si ya existe, preservando first-touch y datos de creación. Un consentimiento de marketing previo `true` no se revoca por un envío normal con checkbox desmarcado; la revocación queda reservada para un flujo explícito futuro. `last_touch` solo se actualiza cuando el payload trae al menos una clave útil.

Las respuestas públicas distinguen `leadStatus: "accepted"` para persistencia real, `leadStatus: "ignored"` para honeypot/timing trap y `leadStatus: "duplicate"` para reintentos idempotentes. El cliente solo dispara `trackLead` con `accepted`.

Si faltan variables de entorno de Supabase, el endpoint responde `503 service_unavailable`. No hay secretos reales en el repositorio.

## Analítica y atribución

`analytics-config.js` contiene IDs vacíos para Meta Pixel, Google Ads, GA4 y TikTok Pixel. Con IDs vacíos no carga esas plataformas. La función `window.trackLead(pais)` dispara eventos solo si existe una plataforma configurada.

Vercel Web Analytics está cargado en las páginas HTML mediante `/_vercel/insights/script.js`.

La atribución UTM implementada actualmente guarda first-touch y last-touch en `localStorage` con expiración local de 90 días. Los objetos enviados al servidor solo aceptan `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `ttclid`, `landing`, `referrer`, `page` y `capturedAt`.

## SEO, sitemap, robots y canonical

Las páginas tienen metadata Open Graph, canonical y datos estructurados en las páginas generadas. `sitemap.xml` lista las rutas públicas principales. `robots.txt` permite el rastreo y apunta al sitemap de producción.

## Despliegue

El despliegue confirmado por configuración es Vercel. `vercel.json` activa clean URLs, cabeceras de seguridad básicas y cache inmutable para `assets/`.

Para activar captura real en Vercel se deben configurar variables de entorno del proyecto, no commitearlas:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`
- `LEADS_MIN_SUBMIT_MS`
- `LEADS_MAX_PAYLOAD_BYTES`
- `LEADS_FORM_VERSION`
- `LEADS_CONSENT_VERSION`

## Supabase

La migración `supabase/migrations/001_create_leads.sql` define una sola tabla `public.leads`, índices operativos, índice único parcial para `idempotency_key`, constraint de privacidad obligatoria, trigger de `updated_at`, RLS habilitado y policies que niegan acceso a `anon` y `authenticated`. La escritura desde el endpoint debe usar service role en servidor.

La migración queda documentada y versionada, pero no fue ejecutada contra una cuenta real durante la implementación de esta tarea.

El endpoint mantiene chequeo de `Content-Length` y corta lecturas raw que superan 16 KB. Si Vercel entrega `req.body` ya parseado, el código solo puede medir el JSON reserializado con `JSON.stringify`, no el tamaño raw exacto original.
