# Tareas

## Convención de nombres

Usar `task-001-descripcion.md`, con número incremental y descripción corta en minúsculas separada por guiones.

## Estados posibles

- `draft`
- `ready`
- `in_progress`
- `blocked`
- `review`
- `completed`
- `cancelled`

## Flujo

1. Crear la tarea con objetivo, contexto, alcance, archivos permitidos y restringidos.
2. Registrar rama y commit base.
3. Ejecutar la tarea respetando `AGENTS.md`.
4. Revisar diff y validaciones.
5. Crear o actualizar reporte en `docs/reports/`.
6. Cerrar la tarea cuando cumpla criterios de aceptación.

## Relación entre tarea y reporte

Una tarea importante debe tener un reporte asociado mediante `report_path`. El reporte describe lo ejecutado; no sustituye el diff ni el historial de commits.

## Regla de alcance

Una tarea principal por archivo. Si aparecen objetivos independientes, crear tareas separadas.

## Rama y commit base

Indicar `base_branch` y `base_commit` en el frontmatter antes de editar.
