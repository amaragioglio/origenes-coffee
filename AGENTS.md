# Guía para agentes

Este repositorio usa `docs/` como cerebro compartido del proyecto. Antes de ejecutar una tarea, cualquier agente debe leer primero [[docs/HOME.md]], luego [[docs/PROJECT_CONTEXT.md]] y después la tarea activa en `docs/tasks/`, si existe.

## Prioridad de instrucciones

1. Tarea activa.
2. [[docs/DECISIONS.md]].
3. [[docs/ARCHITECTURE.md]].
4. [[docs/PROJECT_CONTEXT.md]].
5. Reportes anteriores en `docs/reports/`.
6. Documentos archivados en `docs/archive/`.

Los documentos archivados son referencia histórica, no instrucciones actuales.

## Reglas de trabajo

- Ejecutar `git status` antes de modificar archivos.
- Confirmar rama actual y commit base antes de editar.
- No trabajar directamente en `main` sin autorización.
- No hacer commit ni push sin autorización explícita.
- No sobrescribir cambios del usuario.
- No usar `git reset --hard`, `git clean` ni force push.
- No exponer secretos.
- No inventar API keys, analytics IDs o información legal.
- No cambiar de framework sin aprobación.
- Preservar diseño, contenido editorial y rutas existentes.
- Ejecutar validaciones después de modificar código.
- Crear un reporte para tareas importantes.
- Registrar decisiones permanentes en [[docs/DECISIONS.md]].
- Distinguir errores preexistentes de errores introducidos.

## Flujo antes de cada tarea

1. Leer [[docs/HOME.md]] y [[docs/PROJECT_CONTEXT.md]].
2. Leer la tarea activa en `docs/tasks/`, si aplica.
3. Ejecutar `git status --short`.
4. Confirmar rama y commit base.
5. Identificar archivos permitidos y restringidos.
6. Revisar decisiones aplicables en [[docs/DECISIONS.md]].
7. Planear validaciones antes de editar.

## Flujo después de cada tarea

1. Revisar `git diff`.
2. Ejecutar las validaciones relevantes.
3. Confirmar que no se modificaron archivos fuera de alcance.
4. Documentar decisiones permanentes en [[docs/DECISIONS.md]], si aplica.
5. Crear o actualizar un reporte en `docs/reports/` cuando la tarea sea importante.
6. Informar archivos modificados, comandos ejecutados, pruebas y estado final de Git.
