---
id: task-001
title: Audit lead capture
status: ready
priority: high
created: 2026-07-15
updated: 2026-07-15
base_branch: main
base_commit: 476e595
assigned_agent: codex
report_path: docs/reports/task-001-audit-lead-capture-report.md
---

# Objetivo

Auditar el sistema actual de captura de leads de Orígenes Coffee y diseñar una propuesta técnica para sustituir o complementar Formspree con Supabase.

# Contexto

Orígenes Coffee es un sitio estático desplegado en Vercel para realizar un smoke test de mercado.

El proyecto ya contiene:

- Landings por país.
- Formulario actual.
- Integración pendiente con Formspree.
- Captura first-touch de UTMs.
- Vercel Web Analytics.
- `analytics-config.js`.
- Función `trackLead(pais)`.
- Preparación para GA4, Meta Pixel, Google Ads y TikTok Pixel.

Se quiere evaluar:

- Supabase para almacenar leads.
- Un endpoint seguro en Vercel.
- Google Analytics 4.
- Microsoft Clarity.
- Formulario progresivo.
- Privacidad y protección contra spam.

# Alcance

Analizar:

- `index.html`
- páginas HTML por país
- `script.js`
- `analytics-config.js`
- `vercel.json`
- `README.md`
- `ADS.md`
- `INVESTIGACION.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/analytics/measurement-plan.md`
- historial reciente de Git

Determinar:

- Cómo funciona actualmente el formulario.
- Todas las referencias a Formspree.
- Qué ocurre con `TU_ID_AQUI`.
- Cómo se capturan y conservan las UTMs.
- Cómo se ejecuta `trackLead`.
- Riesgo de eventos duplicados.
- Qué datos se envían actualmente.
- Qué validaciones existen.
- Qué protección contra spam existe.
- Qué arquitectura conviene para Supabase.
- Si conviene usar una Vercel Serverless Function.
- Modelo mínimo de datos.
- Variables de entorno necesarias.
- Eventos de analítica recomendados.
- Riesgos de privacidad.
- Plan de implementación por fases.

# Fuera de alcance

- No modificar código de producción.
- No configurar Supabase.
- No crear tablas reales.
- No añadir IDs de analytics.
- No completar Formspree.
- No hacer deploy.
- No hacer commit.
- No hacer push.
- No cambiar de framework.
- No cambiar el diseño.

# Archivos permitidos

Solo se permite crear o modificar:

- `docs/reports/task-001-audit-lead-capture-report.md`
- `docs/ROADMAP.md`, únicamente si es necesario reflejar el estado de la auditoría
- `docs/DECISIONS.md`, únicamente si aparece una nueva decisión propuesta claramente identificada como `Proposed`

# Archivos restringidos

No modificar:

- HTML
- CSS
- JavaScript
- Python
- `vercel.json`
- `robots.txt`
- `sitemap.xml`
- archivos de configuración de producción
- `.env`
- secretos
- ramas remotas

# Requisitos

El informe debe incluir:

1. Estado de Git.
2. Arquitectura actual.
3. Flujo actual del formulario.
4. Referencias a Formspree.
5. Captura actual de UTMs.
6. Analítica actual.
7. Riesgos críticos.
8. Riesgos importantes.
9. Mejoras recomendadas.
10. Arquitectura propuesta.
11. Modelo de datos de Supabase.
12. Estrategia de first-touch y last-touch.
13. Eventos de GA4.
14. Integración de Clarity.
15. Protección contra spam.
16. Privacidad.
17. Variables de entorno.
18. Archivos que cambiarían en una futura implementación.
19. Plan incremental.
20. Decisiones que requieren aprobación.

# Criterios de aceptación

- El informe se guarda en:
  `docs/reports/task-001-audit-lead-capture-report.md`
- No se modifica código de producción.
- No se hace commit.
- No se hace push.
- La propuesta distingue claramente entre:
  - confirmado
  - recomendado
  - pendiente de decisión
- No se inventan secretos, IDs ni información legal.
- El informe es suficientemente detallado para servir como base de implementación.

# Validaciones

Ejecutar:

```powershell
git status
git branch --show-current
git rev-parse HEAD
git log --oneline --decorate -10
git diff --check

Además:

Buscar referencias a Formspree.
Buscar TU_ID_AQUI.
Buscar trackLead.
Buscar utm_.
Buscar fetch.
Revisar todos los formularios HTML.
Revisar la configuración de Vercel.
Confirmar que no se modificó código de producción.
Riesgos
Confundir funcionalidades propuestas con funcionalidades implementadas.
Exponer secretos en código cliente.
Duplicar eventos.
Perder atribución UTM.
Sobrescribir leads existentes.
Recolectar datos personales innecesarios.
Añadir complejidad excesiva al sitio estático.
Política de Git
No cambiar de rama sin autorización.
No hacer commit.
No hacer push.
No descartar cambios.
No usar git reset --hard.
No usar git clean.
No usar force push.
Entregable

Crear:

docs/reports/task-001-audit-lead-capture-report.md

El reporte debe terminar con una sección:

HANDOFF PARA CHATGPT

Debe incluir:

repositorio
rama
commit base
archivos revisados
arquitectura encontrada
riesgos
recomendación técnica
modelo de datos propuesto
variables necesarias
próximos pasos