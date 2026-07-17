# Contexto del proyecto

## Confirmado

- Proyecto: Orígenes Coffee.
- Dominio de producción usado en canonical, sitemap y `generar_paises.py`: `https://origenescoffee.com`.
- Repositorio remoto: `amaragioglio/origenes-coffee`.
- Despliegue previsto en Vercel, con `vercel.json`.
- Sitio estático de contenido y validación con páginas por país.
- Páginas existentes: `index.html`, `colombia.html`, `mexico.html`, `venezuela.html`, `guatemala.html`, `brasil.html` y `404.html`.
- Existe Vercel Web Analytics mediante `/_vercel/insights/script.js`.
- Existe `analytics-config.js` para IDs de Meta Pixel, Google Ads, GA4 y TikTok Pixel; actualmente están vacíos.
- Existen `ADS.md` e `INVESTIGACION.md`.
- Commit base confirmado para esta infraestructura: `476e595`.
- El sitio captura `utm_*`, `fbclid`, `gclid` y `ttclid` como first-touch en `sessionStorage`.
- El formulario usa Formspree si se configura `FORMSPREE_ID`; mientras siga el placeholder usa `mailto` como respaldo.

## Propuesto

- Usar Supabase para leads.
- Integrar GA4.
- Integrar Microsoft Clarity.
- Crear un formulario progresivo.
- Capturar y persistir UTMs más allá de `sessionStorage`.
- Usar Obsidian como interfaz del cerebro documental.
- Usar `/docs` como memoria compartida.
- Posible futura marca Orquídea Coffee.

## Pendiente de decisión

- Sustituir Formspree.
- Modelo final de datos.
- Consentimiento y política de privacidad.
- IDs de tracking.
- Criterios de éxito del smoke test.
- Presupuesto y duración de campañas.
