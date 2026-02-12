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
- Schema del blueprint: [docs/ai-motor/70_BLUEPRINT_SCHEMA.md](docs/ai-motor/70_BLUEPRINT_SCHEMA.md).

## Project Direction

Este proyecto es un **Cursor Project Bootstrapper**: un sistema de bootstrap profesional para proyectos gobernados de Vibecoding con Cursor IDE.

Objetivo v1.0.0: crear un proyecto profesional gobernado para vibecoding en menos de 10 minutos.

Ver [docs/ai-motor/00_ROADMAP_V1.md](docs/ai-motor/00_ROADMAP_V1.md) para la evolución completa.
