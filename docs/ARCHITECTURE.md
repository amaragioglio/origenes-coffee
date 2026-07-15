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
- Captura first-touch de UTMs y click IDs en `sessionStorage`.
- Envío de leads a Formspree cuando hay ID configurado.
- Respaldo por `mailto` cuando Formspree no está configurado o falla.
- Reproducción de video en pantalla.
- Año dinámico en el footer.

## Generación de páginas

`generar_paises.py` define una plantilla HTML común y una lista `PAISES` para generar `colombia.html`, `mexico.html`, `venezuela.html`, `guatemala.html` y `brasil.html`. El script usa `SITE = "https://origenescoffee.com"` para metadata y canonical.

## Flujo actual del formulario

Cada formulario tiene `id="leadForm"` y `data-origen` con el origen correspondiente: `atlas`, `colombia`, `mexico`, `venezuela`, `guatemala` o `brasil`.

`script.js` lee el email, añade `origen`, `pagina`, atribución guardada y `_subject`, y envía por AJAX a `https://formspree.io/f/${FORMSPREE_ID}` si el ID no es el placeholder. Si `FORMSPREE_ID` sigue como `TU_ID_AQUI` o el envío falla, abre un correo prellenado como respaldo.

## Analítica y atribución

`analytics-config.js` contiene IDs vacíos para Meta Pixel, Google Ads, GA4 y TikTok Pixel. Con IDs vacíos no carga esas plataformas. La función `window.trackLead(pais)` dispara eventos solo si existe una plataforma configurada.

Vercel Web Analytics está cargado en las páginas HTML mediante `/_vercel/insights/script.js`.

La atribución UTM implementada actualmente es first-touch en `sessionStorage` e incluye `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `ttclid`, `landing` y `referrer`.

## SEO, sitemap, robots y canonical

Las páginas tienen metadata Open Graph, canonical y datos estructurados en las páginas generadas. `sitemap.xml` lista las rutas públicas principales. `robots.txt` permite el rastreo y apunta al sitemap de producción.

## Despliegue

El despliegue confirmado por configuración es Vercel. `vercel.json` activa clean URLs, cabeceras de seguridad básicas y cache inmutable para `assets/`.

## Arquitectura propuesta, todavía no implementada

Flujo conceptual futuro:

Visitante -> landing por país -> captura de atribución -> formulario -> endpoint seguro -> Supabase -> evento de conversión -> enriquecimiento opcional.

Este flujo no está implementado en el repositorio actual. Requiere decisiones sobre Supabase, privacidad, consentimiento, protección contra spam, modelo de datos y tracking.
