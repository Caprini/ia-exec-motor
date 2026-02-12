/**
 * Plantillas deterministas (blueprint → string). Sin timestamps.
 */
import type { ProjectBlueprint } from "../types.js";

/** Orden de claves fijo para project.json */
export function renderProjectJson(bp: ProjectBlueprint): string {
  const obj = {
    version: bp.version,
    projectName: bp.projectName,
    description: bp.description,
    repoVisibility: bp.repoVisibility,
    stack: bp.stack,
    qualityProfile: bp.qualityProfile,
    strictMode: bp.strictMode,
    governanceToggles: bp.governanceToggles,
    generatedBy: bp.generatedBy,
    generatedVersion: bp.generatedVersion,
  };
  return JSON.stringify(obj, null, 2);
}

export function renderCharter(bp: ProjectBlueprint): string {
  return `# Project Charter — ${bp.projectName}

## Misión
${bp.description}

## Alcance
- Stack: **${bp.stack}**
- Perfil de calidad: **${bp.qualityProfile}**
- Repo: **${bp.repoVisibility}**

## Fuera de alcance (v0)
- Creación automática de repos en GitHub
- Generación de código de negocio
- PRs automáticos

## Criterios de éxito
- Blueprint en \`blueprint/project.json\` como fuente de verdad
- Reglas de gobernanza en \`.cursor/rules/\` aplicadas
- Tests y no-regresión según \`CHECKLIST_QA.md\`
`;
}

export function renderRoadmap(bp: ProjectBlueprint): string {
  const lines: string[] = [
    `# Roadmap — ${bp.projectName}`,
    "",
    "Roadmap del proyecto destino (generado por ia-exec-motor Wizard v0).",
    "",
    "## Fase inicial",
    "- [ ] Establecer estructura según blueprint",
    "- [ ] Configurar calidad y gates según perfil",
    "",
  ];
  if (bp.stack === "node-ts") {
    lines.push("## Próximos hitos (Node/TS)", "- [ ] Tests y lint integrados", "- [ ] CI según CHECKLIST_QA");
  } else if (bp.stack === "python") {
    lines.push("## Próximos hitos (Python)", "- [ ] Tests (pytest) y lint", "- [ ] CI según CHECKLIST_QA");
  } else {
    lines.push("## Próximos hitos (Next.js)", "- [ ] Lint y tests (e2e/unit)", "- [ ] CI según CHECKLIST_QA");
  }
  lines.push("");
  return lines.join("\n");
}

export function renderChecklistQa(bp: ProjectBlueprint): string {
  const g = bp.governanceToggles;
  const items: string[] = [
    "# Checklist QA — antes de merge/commit",
    "",
    "Ejecutar antes de cada merge o commit relevante.",
    "",
  ];
  if (g.requireTests) items.push("- [ ] Tests pasan (`npm test` / `pytest` / equivalente)");
  if (g.requireNoRegression) items.push("- [ ] No-regresión: suite existente en verde");
  if (g.requireLogs) items.push("- [ ] Logs estructurados revisados (si aplica)");
  if (g.scopeGuard) items.push("- [ ] Cambios dentro del alcance declarado del ticket");
  items.push("");
  items.push("Perfil: **" + bp.qualityProfile + "** | Stack: **" + bp.stack + "**");
  items.push("");
  return items.join("\n");
}

export function renderBootstrapMdc(bp: ProjectBlueprint): string {
  const g = bp.governanceToggles;
  const parts: string[] = [
    "---",
    "description: Reglas derivadas del Project Blueprint (Wizard v0)",
    "globs:",
    "alwaysApply: true",
    "---",
    "",
    "# PROJECT_BOOTSTRAP — Gobernanza del proyecto",
    "",
    "Generado por ia-exec-motor Wizard. Fuente de verdad: `blueprint/project.json`.",
    "",
    "## Perfil y stack",
    "- **Calidad:** " + bp.qualityProfile + (bp.strictMode ? " (modo estricto)" : "") + "",
    "- **Stack:** " + bp.stack + "",
    "",
  ];
  if (g.plannerExecutorSplit) {
    parts.push("## Planificador / Ejecutor");
    parts.push("Este proyecto usa separación Planificador (diseño) y Ejecutor (implementación). No mezclar roles en un mismo ticket.");
    parts.push("");
  }
  if (g.scopeGuard) {
    parts.push("## Scope Guard");
    parts.push("Respetar alcance declarado en el ticket. Si hace falta tocar código fuera de alcance, proponer ticket separado.");
    parts.push("");
  }
  if (g.requireTests) {
    parts.push("## Tests");
    parts.push("Tests obligatorios antes de merge. Mantener suite en verde.");
    parts.push("");
  }
  if (g.requireLogs) {
    parts.push("## Logs");
    parts.push("Logs estructurados obligatorios donde aplique (operaciones relevantes, errores).");
    parts.push("");
  }
  return parts.join("\n");
}

export function renderAgentsMd(bp: ProjectBlueprint): string {
  const g = bp.governanceToggles;
  let body = "Roles y política de agentes para **" + bp.projectName + "**.\n\n";
  if (g.plannerExecutorSplit) {
    body += "## Planificador / Ejecutor\n";
    body += "- **Planificador:** diseña el plan y los criterios; no implementa.\n";
    body += "- **Ejecutor:** implementa según el plan; no cambia alcance sin ticket.\n\n";
  }
  body += "Reglas de gobernanza: ver `.cursor/rules/20_PROJECT_BOOTSTRAP.mdc` y `blueprint/project.json`.\n";
  return body;
}

export function renderReadme(bp: ProjectBlueprint): string {
  return `# ${bp.projectName}

${bp.description}

## Instalación

Proyecto generado por **ia-exec-motor** Wizard v0. Blueprint en \`blueprint/project.json\`.

\`\`\`
# Según stack: instalar dependencias (npm/pip/pnpm según corresponda)
\`\`\`

## Uso del blueprint

- \`blueprint/project.json\` — fuente de verdad del proyecto (stack, calidad, toggles).
- \`docs/00_PROJECT_CHARTER.md\` — misión y criterios de éxito.
- \`.cursor/rules/20_PROJECT_BOOTSTRAP.mdc\` — reglas derivadas del blueprint.
- \`CHECKLIST_QA.md\` — checks antes de merge/commit.
`;
}

export function renderGitignore(bp: ProjectBlueprint): string {
  if (bp.stack === "python") {
    return `# Python
__pycache__/
*.py[cod]
.venv/
venv/
.env
.env.*
*.egg-info/
dist/
build/
`;
  }
  if (bp.stack === "nextjs") {
    return `# Next.js / Node
.next/
node_modules/
out/
.env
.env.*
*.log
`;
  }
  return `# Node/TS
node_modules/
dist/
.env
.env.*
*.log
`;
}
