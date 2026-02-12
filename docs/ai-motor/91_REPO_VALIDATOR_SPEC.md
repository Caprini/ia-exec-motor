# 91 — Repo Validator (especificación v0)

Este documento define el **Repo Validator v0** del Motor de Ejecución: un conjunto de comprobaciones deterministas sobre la estructura y convenciones del repositorio. Los resultados se integran en GATE_REPORT.json y EXEC_REPORT.md.

## Alcance v0

- **Checks implementados**: RG-01 a RG-05.
- **Status posibles por check**: `PASS`, `FAIL`, `WARN`, `NOT_IMPLEMENTED`.
- Los checks no implementados aún devuelven `NOT_IMPLEMENTED` con un mensaje y `remediation` descriptiva.

## Checks implementados

| ID    | Descripción | Criterio |
|-------|-------------|----------|
| **RG-01** | Estructura mínima | Existencia de directorios obligatorios: `docs`, `src`, `tests`, `.cursor/rules`, `context`. |
| **RG-02** | Archivos raíz | Existencia en la raíz de `README.md`, `CHANGELOG.md`, `AGENTS.md`. |
| **RG-03** | Reglas en .cursor/rules | Al menos un archivo con extensión `.mdc` o `.md` en `.cursor/rules`. |
| **RG-04** | SemVer en package.json | Campo `version` en `package.json` con formato X.Y.Z (SemVer). |
| **RG-05** | Test runner exit 0 | Ejecución de `npm test` en el repo termina con código de salida 0. |

## Contrato de resultado

Cada check devuelve un objeto **RepoValidatorResult**:

- `id`: identificador del check (ej. "RG-01").
- `status`: `PASS` | `FAIL` | `WARN` | `NOT_IMPLEMENTED`.
- `message`: descripción breve del resultado.
- `remediation` (opcional): acción correctiva sugerida.
- `findings` (opcional): lista de detalles (ej. directorios o archivos faltantes).

## Checks no implementados aún

Los siguientes se consideran fuera del alcance de v0 y, si se exponen como checks, deben devolver `status: NOT_IMPLEMENTED` y `remediation` adecuada:

- **Mapping AC → tests**: verificación de que cada criterio de aceptación tiene cobertura de tests asociada.
- **Auditoría MAJOR**: revisión de cambios con impacto MAJOR (ej. breaking changes en versionado).
- **Telemetría firmada**: validación de firma o integridad de datos de telemetría.

En v0 no se definen IDs RG-06, RG-07, etc.; solo RG-01 a RG-05 están implementados.

## Integración en el CLI

El Repo Validator se ejecuta **después** de la evaluación de gates (G-01 a G-13) y **antes** de escribir los reportes. El directorio validado es por defecto el directorio de trabajo actual (`process.cwd()`). Los resultados se añaden a:

- **GATE_REPORT.json**: clave `repoValidator` (array de RepoValidatorResult).
- **EXEC_REPORT.md**: sección "Repo Validator" con tabla RG / Status / Message / Remediation.

## Determinismo

Las salidas del Repo Validator son deterministas: mismo repositorio (mismo estado de disco) produce los mismos resultados. El único timestamp del pipeline sigue siendo el del reporte global.
