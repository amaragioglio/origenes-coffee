# Plan de campañas — Smoke test Orígenes Coffee

Objetivo: validar qué comunidad de origen convierte mejor (lead = email en
"Join la lista"). Presupuesto sugerido para la primera lectura: dividir
en partes iguales por país durante 7–10 días y comparar costo por lead.

## Convención de UTMs (ya capturadas por el sitio)

El sitio guarda `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
`utm_term`, `fbclid`, `gclid` y `ttclid` en la primera visita y los envía
con cada lead a Formspree, junto con `landing`, `referrer`, `origen` y
`pagina`.

Formato de campaña: `{pais}_{angulo}_{version}` — ej. `gt_abuela_v1`.

URL de ejemplo:

```
https://origenes-coffee.vercel.app/guatemala?utm_source=instagram&utm_medium=paid&utm_campaign=gt_abuela_v1&utm_content=video_atitlan
```

## Segmentación sugerida (Meta/Instagram)

- Ubicación: EE. UU. (empezar por FL, TX, CA, NY, IL).
- Idioma: inglés y español.
- Intereses por campaña: {país} + coffee, café de olla / tinto / guayoyo /
  cafezinho, first/second-generation immigrant media del país.
- Edad: 24–45 (2ª/3ª generación con poder de compra).

## Copys por país (angulo "abuela" — heritage)

**Guatemala → /guatemala**
- Hook: "Your abuela never called it 'single origin.' She called it breakfast."
- Body: "Coffee from the land of volcanoes — with the story of how it got there. Join la lista."
- Alt hook (ES): "El café con tortillas de la casa de tu abuela. Esa historia también es tuya."

**México → /mexico**
- Hook: "Café de olla isn't a recipe. It's a memory."
- Body: "Cinnamon, piloncillo, and the story of the Revolution in a clay pot. Reserve the first roast."
- Alt hook: "Seeds crossed the border hidden like contraband. Sound familiar?"

**Venezuela → /venezuela**
- Hook: "¿Negrito, marrón o guayoyo? If you know, you know."
- Body: "Before oil, Venezuela ran on coffee. In your family's kitchen, it still does. Join la lista."

**Colombia → /colombia**
- Hook: "You didn't grow up drinking coffee. You grew up drinking tinto."
- Body: "A priest's penance became a nation's identity. Read the story, reserve the roast."

**Brasil → /brasil**
- Hook: "Vem tomar um cafezinho. ☕"
- Body: "The smallest cup with the biggest history — smuggled into Brazil inside a bouquet. Join a lista."

## Creativos

- Usar video/foto real (regla de marca: nada de IA). El clip del tostado
  (`assets/video/tostado.mp4`, Pexels) sirve como creative base.
- Formato: Reels/Stories 9:16 con el titular como texto grande estilo
  editorial (Fraunces sobre crema — mismo look de las tarjetas og).

## Métricas a comparar (con Formspree + Vercel Analytics)

1. Costo por lead por país (`utm_campaign` → leads en Formspree).
2. Conversión de la página: leads / visitas por país (Vercel Analytics).
3. Ángulo ganador: comparar `utm_content` (video vs foto, EN vs ES).

Regla de decisión sugerida: el país con menor costo por lead y ≥3% de
conversión gana el primer lote de producción.
