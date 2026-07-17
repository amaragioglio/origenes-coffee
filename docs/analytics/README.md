# Analytics

## Herramientas actuales

- Vercel Web Analytics está cargado en las páginas mediante `/_vercel/insights/script.js`.
- `analytics-config.js` existe y controla IDs de Meta Pixel, Google Ads, GA4 y TikTok Pixel.
- Los IDs actuales están vacíos, por lo que esas plataformas no se cargan.
- `script.js` captura UTMs y click IDs first-touch en `sessionStorage` y los adjunta a leads.

## Herramientas propuestas

- GA4 con ID real.
- Microsoft Clarity.
- Posible integración futura con Supabase para leads y atribución persistente.

## Archivo de configuración

El archivo que controla actualmente los IDs de tracking es `analytics-config.js`.

## Datos que no deben enviarse a analítica

No enviar secretos, datos personales innecesarios, contenido sensible, datos legales no confirmados, identificadores privados ni información que permita perfilar personas sin consentimiento adecuado.

## Relación con el plan de medición

[[measurement-plan]] define objetivos, métricas, dimensiones, eventos propuestos, fórmulas y riesgos. Es un plan, no un reporte de resultados.

## Enlaces

- [[../../ADS]]
