# Reportes

Crear un reporte cuando una tarea modifique varios archivos, cambie comportamiento, registre una decisión importante o deje handoff para otro agente.

## Convención de nombres

Usar `report-001-descripcion.md`, con número incremental y descripción corta en minúsculas separada por guiones.

## Contenido esperado

El reporte debe incluir resumen, tarea relacionada, estado inicial, trabajo realizado, archivos modificados, decisiones, comandos, pruebas, resultado, errores preexistentes, errores introducidos, limitaciones, pendientes, estado de Git y handoff.

## Relación con tareas

Vincular el reporte desde el `report_path` de la tarea correspondiente.

Un reporte no sustituye `git diff` ni el historial de commits.
