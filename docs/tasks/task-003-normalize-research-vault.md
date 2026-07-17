---
id: task-003
title: Normalize research vault
status: ready
priority: high
created: 2026-07-16
updated: 2026-07-16
base_branch: docs/project-brain
base_commit: 05a28856708fe5ffe275055aebef44631bc31bcb
assigned_agent: codex
report_path: docs/reports/task-003-normalize-research-vault-report.md
---

# Objetivo

Revisar, normalizar y conectar toda la investigación creada para Orígenes Coffee, de manera que el vault de Obsidian funcione como una base de conocimiento operativa y no solamente como una colección de documentos.

# Contexto

Actualmente existen investigaciones sobre:

- Mercado hispano y cafetero en Estados Unidos.
- Colombia.
- México.
- Venezuela.
- Guatemala.
- Brasil.
- SEO.
- Síntesis estratégica transversal.
- Captación de leads.
- Diseño de Supabase.

La investigación fue generada mediante ChatGPT Work y ya está guardada dentro de `docs/research/`.

# Regla principal

No modificar código de producción.

No modificar:

- HTML.
- CSS.
- JavaScript.
- Python.
- `vercel.json`.
- `sitemap.xml`.
- `robots.txt`.
- `analytics-config.js`.

No hacer commit.
No hacer push.
No cambiar de rama.
No eliminar investigación original.

# Alcance

## 1. Inventario

Inspeccionar todos los archivos dentro de:

- `docs/research/`
- `docs/reports/`
- `docs/tasks/`
- `docs/analytics/`

Crear un inventario con:

- Ruta.
- Título.
- País.
- Tema.
- Estado.
- Fecha.
- Número de fuentes.
- Nivel de confianza.
- Enlaces entrantes.
- Enlaces salientes.
- Duplicaciones.
- Información pendiente.

## 2. Frontmatter

Normalizar los documentos de investigación para utilizar, cuando corresponda:

```yaml
---
title:
type: research
country:
topic:
status:
created:
updated:
research_date:
sources_count:
confidence:
tags:
related:
---
Valores permitidos:

status
draft
reviewed
verified
needs-update
confidence
high
medium
low

No inventar cantidades de fuentes. Contarlas cuando sea posible.

3. Índices y mapas de contenido

Crear o actualizar:

docs/research/RESEARCH_INDEX.md
docs/research/countries/README.md
docs/research/market/README.md
docs/research/synthesis/README.md

RESEARCH_INDEX.md debe incluir:

Resumen del programa.
Estado por país.
Investigación de mercado.
SEO.
Síntesis.
Documentos por verificar.
Próximas investigaciones.
Enlaces a los documentos principales.

Usar enlaces wiki de Obsidian.

4. Página por país

Para cada país crear o actualizar un índice:

docs/research/countries/colombia/README.md
docs/research/countries/mexico/README.md
docs/research/countries/venezuela/README.md
docs/research/countries/guatemala/README.md
docs/research/countries/brasil/README.md

Cada índice debe contener:

Resumen ejecutivo.
Documentos disponibles.
Hallazgos principales.
Oportunidades narrativas.
Oportunidades de producto.
Oportunidades de SEO.
Riesgos culturales.
Datos faltantes.
Hipótesis del smoke test.
Enlaces relacionados.

No repetir toda la investigación; resumir y enlazar.

5. Fuentes

Revisar si existe docs/research/sources-register.md.

Si existe:

Normalizarlo.
Detectar fuentes duplicadas.
Marcar calidad A, B, C o D.
Detectar cifras sin fuente.
Detectar enlaces sin fecha de consulta.
Marcar fuentes desactualizadas.

Si no existe, crearlo sin inventar fuentes.

6. Separar conocimiento y acción

Crear:

docs/research/synthesis/actionable-insights.md

Debe convertir la investigación en decisiones y experimentos.

Estructura:

Hallazgos con alta confianza
Hallazgos con confianza media
Hipótesis todavía no verificadas
Mensajes que vale la pena probar
Países y ciudades prioritarias
Oportunidades para las landings
Oportunidades SEO
Preguntas para formularios
Riesgos culturales
Datos todavía necesarios
Experimentos recomendados

Toda recomendación debe enlazar al documento que la respalda.

7. Matriz de experimentos

Crear:

docs/research/synthesis/smoke-test-experiment-matrix.md

Columnas:

| ID | País | Audiencia | Mensaje | Landing | Canal | Variable | Métrica | Señal positiva | Riesgo | Evidencia |

No inventar resultados.

8. Backlinks

Añadir enlaces wiki relevantes entre:

Países.
Mercado estadounidense.
SEO.
Síntesis.
Measurement plan.
ADS.
PROJECT_CONTEXT.
DECISIONS.
ROADMAP.

No añadir enlaces arbitrarios solo para aumentar conexiones del grafo.

9. HOME

Actualizar docs/HOME.md con una sección:

Research Center

Enlazar:

[[research/RESEARCH_INDEX]]
[[research/synthesis/actionable-insights]]
[[research/synthesis/cross-country-strategy]]
[[research/synthesis/smoke-test-experiment-matrix]]
[[research/market/us-hispanic-coffee-market]]
[[research/market/seo-opportunity-map]]
10. Calidad

Identificar:

Contradicciones.
Afirmaciones sin fuente.
Estadísticas antiguas.
Duplicaciones.
Documentos demasiado generales.
Documentos que mezclan hechos e hipótesis.
Links rotos.
Frontmatter inválido.
Nombres inconsistentes.

No corregir hechos históricos mediante suposiciones.

Marcar con:

> [!warning]
> Requiere verificación humana o una fuente adicional.
Archivos permitidos

Solo:

docs/
.gitignore, únicamente si aparece nueva configuración local de Obsidian que deba ignorarse.
Criterios de aceptación
Existe un índice central de investigación.
Cada país tiene un README operativo.
Existe una página de actionable insights.
Existe una matriz del smoke test.
Los enlaces principales funcionan.
Las hipótesis están separadas de los hechos.
No se modificó producción.
No se eliminó investigación original.
No se hizo commit.
No se hizo push.
Validaciones

Ejecutar:

git status --short
git diff --check
git diff --stat

Además:

Detectar archivos Markdown vacíos.
Detectar enlaces wiki a archivos inexistentes.
Detectar frontmatter incompleto.
Detectar posibles secretos.
Confirmar que no cambió código de producción.
Entregable

Crear:

docs/reports/task-003-normalize-research-vault-report.md

Terminar con:

HANDOFF PARA CHATGPT

Incluir:

Archivos revisados.
Archivos creados.
Documentos normalizados.
Contradicciones encontradas.
Fuentes débiles.
Hallazgos accionables.
Hipótesis prioritarias.
Próximos pasos.

Reemplaza:

```text
base_commit: CURRENT_HEAD

con el resultado de:

git rev-parse HEAD
