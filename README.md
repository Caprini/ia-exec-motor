CLI ia-exec-motor — valida InstructionRequest, aplica Quality Profile + Gates, genera reportes.

## Wizard (bootstrap de proyecto)

Desde la raíz del repo, genera un proyecto con blueprint y gobernanza en `../<projectName>`:

```bash
npm run cli -- wizard
```

Modo no-interactivo (todas las flags; sin preguntas):

```bash
npm run cli -- wizard --project-name demo --stack node-ts --profile Standard --desc "Descripción del proyecto" --visibility public
```

- **Colisión:** si `../<projectName>` ya existe, el wizard **aborta** con error. Usa `--force` para sobrescribir.
- **Stacks:** `node-ts`, `nextjs`, `python`. **Perfiles:** `Exploratory`, `Standard`, `Strict`, `Production`.
- **Artefactos generados:** blueprint, docs, `.cursor/rules`, `.cursorrules`, `context/*.md` (STACK, DECISIONS, CONSTRAINTS, REQUIREMENTS, INTERFACES), `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/QA.md`, `docs/ONBOARDING.md`, `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/config.yml`, `CHANGELOG.md`, `README.md`, `AGENTS.md`, `LICENSE`, `CODEOWNERS`, etc.
- Schema del blueprint: [docs/ai-motor/70_BLUEPRINT_SCHEMA.md](docs/ai-motor/70_BLUEPRINT_SCHEMA.md).
- **Auditoría de coherencia del wizard:** desde la raíz del repo, `./tools/audit_wizard_coherence.sh` ejecuta una checklist PASS/FAIL (contrato blueprint v0.2, no-interactivo, condicionales, colisión, determinismo).

## Project Direction

Este proyecto es un **Cursor Project Bootstrapper**: un sistema de bootstrap profesional para proyectos gobernados de Vibecoding con Cursor IDE.

Objetivo v1.0.0: crear un proyecto profesional gobernado para vibecoding en menos de 10 minutos.

Ver [docs/ai-motor/00_ROADMAP_V1.md](docs/ai-motor/00_ROADMAP_V1.md) para la evolución completa.
