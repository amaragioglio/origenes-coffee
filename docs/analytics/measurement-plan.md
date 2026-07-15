# Plan de medición

Este documento es un plan. No contiene resultados reales.

## Objetivo de medición

Medir qué comunidad de origen y qué campaña convierten mejor a leads para el smoke test de Orígenes Coffee.

## Hipótesis

- Las landings por país pueden convertir de forma distinta.
- Los mensajes de memoria familiar pueden generar leads de mayor intención.
- La atribución UTM puede identificar campaña, creativo y origen con mejor desempeño.

## Métricas

- Visitantes únicos.
- Leads únicos.
- Conversion rate.
- Cost per lead.
- Conversión por landing.
- Conversión por campaña.
- Conversión por creativo.
- Preferencia de origen.
- Intención de compra.
- Rango de precio.
- Profile completion rate.
- Tasa de errores de formulario.

## Dimensiones

- Landing country.
- Identity country.
- Preferred coffee origin.
- `utm_source`.
- `utm_medium`.
- `utm_campaign`.
- `utm_content`.
- `utm_term`.
- Dispositivo.
- Referrer.

## Eventos propuestos

- `page_view`.
- `lead_form_view`.
- `lead_form_submit`.
- `generate_lead`.
- `lead_form_error`.
- `profile_step_completed`.

## Convenciones UTM

Usar la convención de `ADS.md`: `{pais}_{angulo}_{version}` para `utm_campaign`, por ejemplo `gt_abuela_v1`.

## Fórmulas

Conversion rate = leads únicos / visitantes únicos × 100

Cost per lead = gasto de campaña / leads atribuidos

Profile completion rate = perfiles completos / correos capturados × 100

## Riesgos de interpretación

- Visitantes únicos y leads únicos pueden medirse con metodologías distintas por herramienta.
- `sessionStorage` no persiste entre sesiones ni dispositivos.
- Bloqueadores de tracking pueden reducir medición.
- Leads duplicados pueden inflar conversiones si no se deduplican.
- Campañas con poco volumen pueden producir conclusiones inestables.

## Datos prohibidos

No registrar secretos, datos de pago, información legal no confirmada, datos personales innecesarios, información sensible ni perfiles individuales sin consentimiento.
