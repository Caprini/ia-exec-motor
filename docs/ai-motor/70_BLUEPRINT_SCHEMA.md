# 70 — Blueprint Schema (Project Blueprint)

Especificación del schema del **Project Blueprint** generado por el Wizard v0 de ia-exec-motor. El blueprint es la fuente de verdad del proyecto destino y se escribe en `blueprint/project.json`.

## Schema machine-readable

El schema en formato JSON Schema está en: [src/schemas/blueprint.schema.json](../../src/schemas/blueprint.schema.json). Puede usarse para validación con herramientas externas o en IDE.

## Campos

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `version` | string | Sí | Versión del schema del blueprint (ej. `"0.1"`). |
| `projectName` | string | Sí | Slug: solo `a-z`, `0-9` y `-`. Pattern: `^[a-z0-9-]+$`. |
| `description` | string | Sí | No vacío; típicamente 1-2 frases. |
| `repoVisibility` | string | Sí | Enum: `"public"` \| `"private"`. |
| `stack` | string | Sí | Enum: `"node-ts"` \| `"nextjs"` \| `"python"`. |
| `qualityProfile` | string | Sí | Enum: `"Exploratory"` \| `"Standard"` \| `"Strict"` \| `"Production"`. |
| `strictMode` | boolean | Sí | Derivado del perfil (Strict/Production → true). |
| `governanceToggles` | object | Sí | Objeto con las 5 claves booleanas indicadas abajo. |
| `generatedBy` | string | Sí | Identificador de la herramienta (ej. `"ia-exec-motor"`). |
| `generatedVersion` | string | Sí | Versión de la herramienta (ej. `"0.5.0"`). |

## governanceToggles

Objeto con exactamente estas claves (todas boolean):

- `plannerExecutorSplit`
- `requireTests`
- `requireNoRegression`
- `requireLogs`
- `scopeGuard`

No se permiten propiedades adicionales.

## Validación

El wizard valida el blueprint **antes** de escribir archivos en disco. Si la validación falla, se aborta y no se escribe nada. El validador en código está en `src/wizard/validate-blueprint.ts` y es determinista (mismas entradas → mismos errores).

## Versionado

El campo `version` del blueprint permite evolución del schema. En v0 se usa `"0.1"`. Cambios incompatibles en campos obligatorios o enums deberían ir acompañados de un incremento de versión del schema.
