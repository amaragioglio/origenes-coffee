---
id: report-task-003
title: Normalize research vault
created: 2026-07-16
updated: 2026-07-16
task_path: docs/tasks/task-003-normalize-research-vault.md
base_branch: docs/project-brain
base_commit: 05a28856708fe5ffe275055aebef44631bc31bcb
actual_branch: docs/project-brain
actual_commit: 05a28856708fe5ffe275055aebef44631bc31bcb
agent: codex
---

# Reporte task-003: Normalize research vault

## Resumen

Se normalizó el vault de investigación de `docs/research/` para que funcione como base de conocimiento operativa en Obsidian: índice central, README por área, README por país, página de insights accionables, matriz de experimentos y registro inicial de fuentes. No se eliminó investigación original y no se modificó código de producción.

También se reemplazó en la tarea `base_commit: CURRENT_HEAD` por el HEAD real: `05a28856708fe5ffe275055aebef44631bc31bcb`.

## Archivos revisados

- `docs/research/README.md`
- `docs/research/market/us-hispanic-coffee-market.md`
- `docs/research/market/seo-opportunity-map.md`
- `docs/research/synthesis/cross-country-strategy.md`
- `docs/research/countries/colombia/colombia-research-master.md`
- `docs/research/countries/mexico/mexico-research-master.md`
- `docs/research/countries/venezuela/venezuela-research-master.md`
- `docs/research/countries/guatemala/guatemala-research-master.md`
- `docs/research/countries/brasil/brasil-research-master.md`
- `docs/reports/task-001-audit-lead-capture-report.md`
- `docs/reports/task-002-design-supabase-foundation-report.md`
- `docs/tasks/task-001-audit-lead-capture.md`
- `docs/tasks/task-002-design-supabase-foundation.md`
- `docs/tasks/task-003-normalize-research-vault.md`
- `docs/analytics/README.md`
- `docs/analytics/measurement-plan.md`
- `docs/HOME.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/DECISIONS.md`
- `docs/ROADMAP.md`
- `ADS.md`

## Archivos creados

- `docs/research/RESEARCH_INDEX.md`
- `docs/research/countries/README.md`
- `docs/research/market/README.md`
- `docs/research/synthesis/README.md`
- `docs/research/countries/colombia/README.md`
- `docs/research/countries/mexico/README.md`
- `docs/research/countries/venezuela/README.md`
- `docs/research/countries/guatemala/README.md`
- `docs/research/countries/brasil/README.md`
- `docs/research/synthesis/actionable-insights.md`
- `docs/research/synthesis/smoke-test-experiment-matrix.md`
- `docs/research/sources-register.md`
- `docs/reports/task-003-normalize-research-vault-report.md`

## Documentos normalizados

Se normalizó frontmatter en:

- `docs/research/market/us-hispanic-coffee-market.md`
- `docs/research/market/seo-opportunity-map.md`
- `docs/research/synthesis/cross-country-strategy.md`
- `docs/research/countries/colombia/colombia-research-master.md`
- `docs/research/countries/mexico/mexico-research-master.md`
- `docs/research/countries/venezuela/venezuela-research-master.md`
- `docs/research/countries/guatemala/guatemala-research-master.md`
- `docs/research/countries/brasil/brasil-research-master.md`

Cambios aplicados:

- Se añadió `type: research`.
- Se añadió o completó `country`.
- Se normalizó `confidence` a valores permitidos: `medium`.
- Se añadieron `tags`.
- Se añadieron `related`.
- En `cross-country-strategy.md`, `source_documents: 7` se conservó y se añadió `sources_count: 7` para compatibilidad con el esquema.

No se cambiaron hallazgos, cifras ni fuentes del cuerpo de los documentos maestros.

## Inventario operativo

| Ruta | Título | País | Tema | Estado | Fecha | Fuentes | Confianza | Enlaces salientes principales | Duplicaciones / pendiente |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| `docs/research/market/us-hispanic-coffee-market.md` | Mercado hispano y café en Estados Unidos | United States | Mercado | draft | 2026-07-16 | 35 | medium | síntesis, SEO, measurement plan | Duplicación esperada con ACS/Pew/MPI; faltan datos por nacionalidad. |
| `docs/research/market/seo-opportunity-map.md` | Mapa de oportunidades SEO | United States | SEO | draft | 2026-07-16 | 29 | medium | mercado, síntesis, measurement plan | Sin volumen/dificultad; SERP puntual. |
| `docs/research/synthesis/cross-country-strategy.md` | Síntesis estratégica comparativa | multi | Síntesis | draft | 2026-07-16 | 7 docs | medium | mercado, SEO, roadmap | Depende de documentos internos; no agrega fuentes externas. |
| `docs/research/countries/colombia/colombia-research-master.md` | Colombia: investigación maestra | Colombia | País | draft | 2026-07-16 | 40 | medium | README país, mercado, síntesis | Nostalgia y conducta en EE. UU. por verificar. |
| `docs/research/countries/mexico/mexico-research-master.md` | México: investigación maestra | México | País | draft | 2026-07-16 | 46 | medium | README país, mercado, síntesis | Café de olla vs origen requiere separación. |
| `docs/research/countries/venezuela/venezuela-research-master.md` | Venezuela: investigación maestra | Venezuela | País | draft | 2026-07-16 | 40 | medium | README país, mercado, síntesis | Producción reciente contradictoria. |
| `docs/research/countries/guatemala/guatemala-research-master.md` | Guatemala: investigación maestra | Guatemala | País | draft | 2026-07-16 | 38 | medium | README país, mercado, síntesis | Riesgo de generalizar "Maya" o "volcánico". |
| `docs/research/countries/brasil/brasil-research-master.md` | Brasil: investigación maestra | Brasil | País | draft | 2026-07-16 | 41 | medium | README país, mercado, síntesis | Brasil no es hispano por defecto; PT separado. |
| `docs/research/synthesis/actionable-insights.md` | Actionable Insights | multi | Acción | reviewed | 2026-07-16 | 8 | medium | matriz, síntesis, países | Nuevo mapa operativo. |
| `docs/research/synthesis/smoke-test-experiment-matrix.md` | Smoke Test Experiment Matrix | multi | Experimentos | reviewed | 2026-07-16 | 8 | medium | insights, measurement plan | No contiene resultados. |
| `docs/research/sources-register.md` | Sources Register | multi | Fuentes | draft | 2026-07-16 | 8 docs | medium | índice | Registro resumido; no duplica fuentes completas. |

## Enlaces entrantes y salientes

Se añadieron conexiones relevantes entre:

- Países y síntesis: `countries/*/README.md` -> `cross-country-strategy` y `actionable-insights`.
- Mercado y SEO: `market/README.md`, `RESEARCH_INDEX.md`, `actionable-insights.md`.
- Síntesis y medición: `smoke-test-experiment-matrix.md` -> `docs/analytics/measurement-plan.md`.
- Research Center y Home: `docs/HOME.md` -> índice, actionable insights, estrategia, matriz, mercado y SEO.
- Documentos del proyecto: `RESEARCH_INDEX.md` enlaza `PROJECT_CONTEXT`, `DECISIONS`, `ROADMAP`, `ADS` y measurement plan.

No se añadieron enlaces arbitrarios solo para densificar el grafo.

## Contradicciones encontradas

1. **Venezuela: producción reciente.** USDA y fuente oficial venezolana presentan magnitudes incompatibles; se marcó en `sources-register.md`.
2. **Guatemala: suelo volcánico.** La investigación indica que Huehuetenango no debe describirse como volcánico, mientras competidores lo hacen; se conserva como oportunidad de rigor.
3. **Brasil: clasificación hispana.** El mercado general hispano no debe absorber Brasil; se trató como latinoamericano lusófono.
4. **México: origen del café de olla.** La narrativa de Adelitas aparece como relato popular, no hecho primario confirmado.
5. **Colombia: leyenda de Francisco Romero.** Debe tratarse como tradición con elementos míticos, no causalidad histórica demostrada.

## Fuentes débiles

- SERP y precios comerciales: útiles como fotografía del 2026-07-16, no como verdad estable.
- Nostalgia alimentaria: estudios cualitativos o generales, no específicos de café por nacionalidad.
- Datos de producción venezolana reciente: requieren reconciliación.
- Estudios laborales guatemaltecos 2009-2011: útiles como alerta, no prevalencia actual.
- Volumen SEO/dificultad/CPC: no validado.

## Hallazgos accionables

- Lanzar aprendizaje por motivación y ciudad, no por nacionalidad aislada.
- Mantener Colombia como benchmark, México como escala, Guatemala como especialidad regional, Venezuela como demanda no atendida y Brasil como prueba PT/EN separada.
- Probar ritual vs región y nostalgia vs trazabilidad.
- Medir precio visible, formato, regalo y relación con país antes de declarar ganador.
- No publicar páginas de compra, suscripción o producto hasta que exista oferta real.

## Hipótesis prioritarias

- País específico vs comparador transversal.
- Cultura + trazabilidad vs nostalgia sola.
- Café de olla vs café mexicano de origen.
- Venezuela como waitlist transparente.
- Brasil PT vs EN.
- Flight de tres orígenes vs bolsa de país.
- Grano entero vs molido vs recomendación.

## Calidad y advertencias

Se marcaron advertencias con formato Obsidian:

- Falta de volumen/dificultad SEO.
- Producción venezolana contradictoria.
- Nostalgia cafetera sin evidencia representativa.

No se corrigieron hechos históricos mediante suposiciones.

## Validaciones ejecutadas

- `git status --short`
- Detección de Markdown vacío en `docs/`
- Búsqueda de posibles secretos/placeholders
- Detección de enlaces wiki internos inexistentes
- Detección de frontmatter incompleto en `docs/research`
- Confirmación de archivos modificados con `git diff --name-only`

Resultados antes de este reporte:

- No se detectaron Markdown vacíos.
- No se detectaron enlaces wiki internos rotos en `docs`.
- No se detectó frontmatter incompleto en `docs/research`.
- La búsqueda de secretos devolvió menciones documentales a placeholders o nombres de variables, no valores reales.

## Estado de Git observado

Estado antes de crear este reporte:

```text
 M docs/HOME.md
 M docs/tasks/task-001-audit-lead-capture.md
?? docs/reports/task-002-design-supabase-foundation-report.md
?? docs/research/RESEARCH_INDEX.md
?? docs/research/countries/
?? docs/research/market/
?? docs/research/sources-register.md
?? docs/research/synthesis/
?? docs/tasks/task-002-design-supabase-foundation.md
?? docs/tasks/task-003-normalize-research-vault.md
```

Nota: `docs/tasks/task-001-audit-lead-capture.md`, `docs/tasks/task-002-design-supabase-foundation.md` y `docs/reports/task-002-design-supabase-foundation-report.md` ya aparecían modificados/no rastreados antes de esta tarea. No se tocó código de producción.

## HANDOFF PARA CHATGPT

### Archivos revisados

Investigación de mercado, SEO, síntesis, cinco research masters de país, reportes task-001/task-002, tareas, analytics docs y documentación de contexto del proyecto.

### Archivos creados

Índice central de research, README por sección, README por país, actionable insights, matriz de experimentos, sources register y este reporte.

### Documentos normalizados

Ocho documentos de investigación principales recibieron frontmatter compatible con el esquema solicitado.

### Contradicciones encontradas

Producción venezolana reciente; suelo volcánico de Guatemala mal generalizado por terceros; Brasil como hispano por defecto; café de olla/Adelitas; Francisco Romero en Colombia.

### Fuentes débiles

SERP/precios comerciales puntuales, nostalgia no específica de café, comportamiento cafetero por nacionalidad, volumen SEO, producción venezolana, estudios laborales antiguos.

### Hallazgos accionables

Priorizar aprendizaje por motivación, ciudad, idioma, formato, precio y viabilidad de producto. No elegir país ganador por volumen bruto de emails.

### Hipótesis prioritarias

País vs comparador; ritual vs región; nostalgia vs trazabilidad; Brasil PT/EN; Venezuela waitlist; México café de olla vs origen; regalo flight vs bolsa; grano vs molido.

### Próximos pasos

1. Validar keywords con herramienta y guardar exportaciones.
2. Definir evento primario y lead cualificado.
3. Diseñar formulario progresivo alineado con Supabase y measurement plan.
4. Preparar tests de país vs comparador.
5. Revisar claims culturales con lectores de cada país.
6. No implementar páginas comerciales hasta confirmar producto real, precio, margen y trazabilidad.
