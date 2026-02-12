# 70 — Blueprint Schema (Project Blueprint)

Especificación del schema del **Project Blueprint** generado por el Wizard v0 de ia-exec-motor. El blueprint es la fuente de verdad del proyecto destino y se escribe en `blueprint/project.json`.

## Schema machine-readable

El schema en formato JSON Schema está en: [src/schemas/blueprint.schema.json](../../src/schemas/blueprint.schema.json). Puede usarse para validación con herramientas externas o en IDE.

## Campos

| Campo | Tipo | Obligatorio | Reglas |
|-------|------|-------------|--------|
| `version` | string | Sí | Versión del schema del blueprint (ej. `"0.2"`). |
| `projectName` | string | Sí | Slug: solo `a-z`, `0-9` y `-`. Pattern: `^[a-z0-9-]+$`. |
| `description` | string | Sí | No vacío; típicamente 1-2 frases. |
| `repoVisibility` | string | Sí | Enum: `"public"` \| `"private"`. |
| `stack` | string | Sí | Enum: `"node-ts"` \| `"nextjs"` \| `"python"`. |
| `qualityProfile` | string | Sí | Enum: `"Exploratory"` \| `"Standard"` \| `"Strict"` \| `"Production"`. |
| `strictMode` | boolean | Sí | Derivado del perfil (Strict/Production → true). |
| `governanceToggles` | object | Sí | Objeto con las 5 claves booleanas indicadas abajo. |
| `license` | string | Sí | Enum: `"MIT"` \| `"Apache-2.0"` \| `"None"`. Si `"None"`, no se genera archivo LICENSE. |
| `author` | string | Condicional | Requerido no vacío si `license !== "None"`; usado en el texto de LICENSE. |
| `codeowners` | string[] | Sí | Array de owners; cada entry debe empezar por `@` (ej. `["@Caprini", "@Fabio"]`). Si vacío, no se genera archivo CODEOWNERS. En `buildBlueprint` se normalizan (añade `@` si falta) y se ordenan para salida determinista. |
| `generatedBy` | string | Sí | Identificador de la herramienta (ej. `"ia-exec-motor"`). |
| `generatedVersion` | string | Sí | Versión de la herramienta (ej. `"0.5.6"`). |

## governanceToggles

Objeto con exactamente estas claves (todas boolean):

- `plannerExecutorSplit`
- `requireTests`
- `requireNoRegression`
- `requireLogs`
- `scopeGuard`

No se permiten propiedades adicionales.

## Reglas de no-generación (v0.2)

- **Si `license === "None"`** → el wizard **no** escribe archivo `LICENSE`.
- **Si `codeowners.length === 0`** → el wizard **no** escribe archivo `CODEOWNERS`.

La validación en `validateBlueprint` exige que, cuando `license` no es `"None"`, el campo `author` no esté vacío. Para `codeowners`: cada entry debe ser no vacía y empezar por `@` (si el blueprint se edita a mano).

## Validación

El wizard valida el blueprint **antes** de escribir archivos en disco. Si la validación falla, se aborta y no se escribe nada. El validador en código está en `src/wizard/validate-blueprint.ts` y es determinista (mismas entradas → mismos errores).

## Versionado

El campo `version` del blueprint permite evolución del schema. En v0.5.6 se usa `"0.2"` (campos `license`, `author`, `codeowners`). Cambios incompatibles en campos obligatorios o enums deberían ir acompañados de un incremento de versión del schema.
