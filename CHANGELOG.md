# Changelog

## [0.5.3] - 2026-02-12

- Wizard: ROADMAP.md del proyecto destino ahora incluye Definition of v1.0.0, Stack decisions y Fuera de alcance
- ROADMAP marcado como consumible por Cursor y referenciado desde 20_PROJECT_BOOTSTRAP.mdc
- Tests: cobertura de secciones del ROADMAP para stacks node-ts/nextjs/python

## [0.5.2] - 2025-02-12

- Repo Bootstrap: el wizard genera en el proyecto destino `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/config.yml` y `CHANGELOG.md` mínimo. Alineación con RG-02.

## [0.5.1] - 2025-02-12

- Wizard Hardening: modo no-interactivo con flags (`--project-name`, `--stack`, `--profile`, `--desc`, `--visibility`, `--force`).
- Control de colisión: si `../<projectName>` ya existe, el wizard aborta por defecto; con `--force` sobrescribe.
- Blueprint schema versionado: `src/schemas/blueprint.schema.json` y documentación en `docs/ai-motor/70_BLUEPRINT_SCHEMA.md`.
- Validador del blueprint antes de escribir archivos: si la validación falla, se aborta sin escribir.

## [0.5.0] - 2025-02-12

- Wizard v0: CLI interactivo para generar Project Blueprint y artefactos de gobernanza en `../<projectName>`. Stacks: node-ts, python, nextjs. Sin integración GitHub.

## [0.4.0] - 2025-02-12

- Added Repo Validator v0 (RG-01..RG-05) with fixtures and tests

## [0.3.0] - 2025-02-12

- Added formal product roadmap (00_ROADMAP_V1.md)
- Defined v1.0.0 objective
- Established SemVer evolution policy
- Integrated roadmap reference in WORKFLOW and README

## 0.1.0

- MVP CLI: validación InstructionRequest, gates G-01 a G-13, reportes.
- Repo Validator v0: RG-01 a RG-05.
