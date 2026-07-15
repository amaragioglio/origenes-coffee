# Decisiones

Formato ADR: fecha, estado, contexto, decisión, razones y consecuencias.

## ADR-001: Usar un solo dominio con landings por país

- Fecha: 2026-07-15
- Estado: Accepted
- Contexto: El sitemap y las canonical usan `https://origenescoffee.com` con rutas por país.
- Decisión: Mantener un solo dominio con landings por país.
- Razones: Simplifica SEO, medición y mantenimiento de un sitio estático.
- Consecuencias: Las campañas deben diferenciar país por ruta y UTMs.

## ADR-002: Mantener Vercel como plataforma de despliegue

- Fecha: 2026-07-15
- Estado: Accepted
- Contexto: Existe `vercel.json` y las páginas cargan Vercel Web Analytics.
- Decisión: Mantener Vercel para el despliegue del sitio estático.
- Razones: El proyecto no requiere build y Vercel soporta clean URLs y Analytics.
- Consecuencias: Cambios de despliegue deben respetar `vercel.json`.

## ADR-003: Usar Git y GitHub como sistema principal de versiones

- Fecha: 2026-07-15
- Estado: Accepted
- Contexto: El remoto confirmado es `amaragioglio/origenes-coffee`.
- Decisión: Usar Git y GitHub como fuente principal de historial.
- Razones: Permite trazabilidad de cambios, ramas, commits y revisión.
- Consecuencias: La documentación no sustituye `git diff` ni el historial.

## ADR-004: Usar `/docs` como cerebro compartido

- Fecha: 2026-07-15
- Estado: Accepted
- Contexto: Esta tarea crea infraestructura documental para agentes y Obsidian.
- Decisión: Centralizar contexto vivo en `/docs`.
- Razones: Reduce pérdida de contexto entre Codex, Claude Code, ChatGPT, VS Code y Obsidian.
- Consecuencias: Las tareas importantes deben actualizar documentación aplicable.

## ADR-005: Usar Obsidian como interfaz local de documentación

- Fecha: 2026-07-15
- Estado: Proposed
- Contexto: La tarea solicita Markdown compatible con Obsidian y un índice principal.
- Decisión: Usar Obsidian como interfaz local del cerebro documental.
- Razones: Facilita navegación wiki y lectura local.
- Consecuencias: Los enlaces internos deben mantenerse compatibles con Obsidian.

## ADR-006: No guardar automáticamente cada prompt y cada respuesta

- Fecha: 2026-07-15
- Estado: Accepted
- Contexto: La documentación debe evitar conversaciones completas y datos innecesarios.
- Decisión: No registrar automáticamente cada prompt y respuesta.
- Razones: Evita ruido, duplicación y riesgo de guardar información sensible.
- Consecuencias: Se documentan decisiones, tareas y reportes, no transcripciones.

## ADR-007: Separar tareas, reportes, decisiones e investigación

- Fecha: 2026-07-15
- Estado: Accepted
- Contexto: La estructura documental separa `tasks`, `reports`, `DECISIONS` y `research`.
- Decisión: Mantener esos tipos de documentos separados.
- Razones: Cada tipo tiene ciclo de vida y propósito distinto.
- Consecuencias: Los agentes deben ubicar cada información en su carpeta correspondiente.

## ADR-008: Evaluar Supabase antes de completar Formspree

- Fecha: 2026-07-15
- Estado: Proposed
- Contexto: Formspree existe con placeholder; Supabase está propuesto para leads.
- Decisión: Evaluar Supabase antes de invertir en completar la configuración definitiva de Formspree.
- Razones: Supabase podría resolver persistencia, UTMs y modelo de datos propio.
- Consecuencias: No se debe presentar Supabase como implementado.

## ADR-009: Mantener el proyecto estático salvo necesidad aprobada de migración

- Fecha: 2026-07-15
- Estado: Accepted
- Contexto: El README confirma sitio estático sin dependencias ni build.
- Decisión: Mantener arquitectura estática salvo aprobación explícita.
- Razones: Es suficiente para el smoke test actual y reduce complejidad.
- Consecuencias: Migraciones de framework requieren decisión documentada.
