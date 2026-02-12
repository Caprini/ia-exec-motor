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
    "Roadmap del proyecto destino (generado por ia-exec-motor Wizard v0). Consumible por Cursor: alcance y v1.0.0 en este archivo.",
    "",
    "## Definition of v1.0.0",
    "",
    `v1.0.0 se define como: **${bp.description}** con stack **${bp.stack}** y perfil de calidad **${bp.qualityProfile}** (repo ${bp.repoVisibility}).`,
    "",
    "## Stack decisions",
    "",
    `- **Stack elegido:** ${bp.stack}`,
    "- No añadir dependencias fuera del stack elegido. No inventar dependencias.",
    "",
    "## Fuera de alcance",
    "",
    "- Creación automática de repos en GitHub (sin integración GitHub API).",
    "- Generación de código de negocio automática.",
    "- PRs o issues automáticos.",
    "- No inventar dependencias ni librerías fuera del stack.",
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
    "Generado por ia-exec-motor Wizard. Fuente de verdad: `blueprint/project.json`. Alcance y v1.0.0: ver `ROADMAP.md`.",
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
  const installCmd =
    bp.stack === "python"
      ? "python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
      : "npm install";
  const testCmd = bp.stack === "python" ? "pytest" : "npm test";
  return `# ${bp.projectName}

${bp.description}

## Arranque rápido (5–10 min)

Proyecto generado por **ia-exec-motor** Wizard v0.

\`\`\`bash
# Clonar (o crear) repo y entrar en la raíz
${installCmd}
${testCmd}
\`\`\`

## Dónde está la verdad del proyecto

- **blueprint/project.json** — fuente de verdad (stack, perfil, toggles).
- **ROADMAP.md** — alcance, Definition of v1.0.0, fuera de alcance (consumible por Cursor).
- **context/** — STACK, DECISIONS, CONSTRAINTS, REQUIREMENTS, INTERFACES.
- **docs/** — arquitectura, decisiones, QA, onboarding.
- \`.cursor/rules/20_PROJECT_BOOTSTRAP.mdc\` — reglas derivadas del blueprint.
- \`CHECKLIST_QA.md\` — checks antes de merge/commit.
`;
}

/** Plantilla de PR con checklist QA. Determinista. */
export function renderPullRequestTemplate(bp: ProjectBlueprint): string {
  const g = bp.governanceToggles;
  const items: string[] = [
    "## Descripción",
    "",
    "<!-- Describir brevemente los cambios -->",
    "",
    "## Checklist QA",
    "",
    "Ver `CHECKLIST_QA.md` para el perfil completo.",
    "",
  ];
  if (g.requireTests) items.push("- [ ] Tests pasan");
  if (g.requireNoRegression) items.push("- [ ] No-regresión: suite en verde");
  if (g.scopeGuard) items.push("- [ ] Cambios dentro del alcance declarado del ticket");
  items.push("");
  return items.join("\n");
}

/** Config del selector de issues (GitHub). Determinista. */
export function renderIssueTemplateConfig(bp: ProjectBlueprint): string {
  return `blank_issues_enabled: false
contact_links:
  - name: Documentación del proyecto
    url: https://github.com
    about: Ver README.md y documentación antes de abrir issues.
`;
}

/** CHANGELOG mínimo (Keep a Changelog, Sin timestamps dinámicos). Determinista. */
export function renderChangelog(bp: ProjectBlueprint): string {
  return `# Changelog

## [0.1.0] - 2025-02-12

- Proyecto inicial: ${bp.projectName}
- ${bp.description}
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

// --- v0.5.5 Generated Repo Governance Pack (determinista, sin timestamps) ---

export function renderCursorRules(bp: ProjectBlueprint): string {
  const profile = bp.qualityProfile;
  return `# ia-exec-motor / Cursor Governance Rules (Project-Level)

## 0) Non-negotiables
- No inventes información. Si falta, pregunta o marca como TBD.
- No cambies alcance. Si el ticket dice "solo docs", NO toques src/ tests/ etc.
- No "rellenes huecos" con suposiciones. Mejor corto y verdadero que largo y falso.
- Si una decisión afecta arquitectura/stack, debe quedar escrita en docs/ y context/.

## 1) Prompt Anatomy (obligatorio)
Toda tarea se convierte en un prompt completo con:
1) ROLE: quién eres (Planificador/Ejecutor/QA)
2) TASK: qué hay que conseguir (resultado observable)
3) SPECIFICATIONS: restricciones técnicas (archivos, stack, dependencias, determinismo)
4) ACCEPTANCE CRITERIA: checks medibles ("cuando… entonces…")
5) OUTPUT FORMAT: exactamente qué devuelves (lista, diff, comandos, archivos)

Si falta uno de los 5, paras y pides la info.

## 2) Planner / Executor split (modo industrial)
- Planificador: define alcance, archivos a tocar, pasos, criterios y riesgos.
- Ejecutor: implementa solo lo planificado. No refactor libre.
- QA: valida con tests + criterios. Si falla, devuelve evidencia y causa.

## 3) Scope Guard (SCOPE-01)
Si la tarea declara restricciones de alcance (ej. "solo documentación", "no tocar src/"):
- Prohibido modificar: src/, tests/, artefactos generados, workflows, dependencias
- Excepción: bump de versión si el ticket lo pide explícitamente
Si para cumplir hay que tocar código: BLOQUEADO por alcance → propone ticket separado.

## 4) Quality Mode (Profiles)
Perfil de este proyecto: **${profile}**

Perfiles: Exploratory | Standard | Strict | Production
- Exploratory: velocidad, pero sin inventar. Documenta decisiones.
- Standard: equilibrio. Tests cuando existan.
- Strict: "no-regresión" obligatorio, scope estricto, nada de suposiciones.
- Production: además exige logging estructurado, trazabilidad y cero deuda oculta.

Si profile = Strict o Production:
- Las decisiones deben quedar en context/DECISIONS.md
- Los cambios deben tener test asociado o justificar "NOT_IMPLEMENTED".

## 5) No-regression (tests)
Regla base: si hay suite de tests, se ejecuta antes de persistir cambios.
- Antes de commit: \`npm test\` (o runner equivalente según stack)
- Si falla: no se commitea. Se arregla o se revierte.

## 6) Context anchoring (anti-alucinación)
La "verdad" vive en:
- context/ (constraints, requirements, interfaces, stack)
- docs/ (arquitectura, decisiones, QA, onboarding)
Cuando haya conflicto entre chat y docs/context → gana docs/context.
Nuevas decisiones: se escriben y se linkean.

## 7) Output discipline
- Responde con: (a) qué se cambió, (b) evidencia (tests, diff), (c) riesgos/TBD.
- Nada de prometer trabajo "luego" o "en background".
- Si algo no se puede validar, dilo explícitamente y marca el bloque como TBD.
`;
}

export function renderContextStack(bp: ProjectBlueprint): string {
  const stack = bp.stack;
  let allowed = "";
  let notAllowed = "";
  let conventions = "";
  if (stack === "node-ts") {
    allowed = "Node.js, TypeScript, npm/pnpm, ESLint, tests (node:test o vitest/jest).";
    notAllowed =
      "No añadir Python, runtimes distintos de Node, ni dependencias fuera del ecosistema Node/TS. No se permite añadir tooling o dependencias extra sin decisión documentada en context/DECISIONS.md.";
    conventions =
      "Nombres en camelCase para código; estructura por módulos; scripts en package.json (build, test, lint); carpetas src/, tests/ según convención del proyecto.";
  } else if (stack === "python") {
    allowed = "Python 3, pip/venv, pytest, ruff/black según configuración.";
    notAllowed =
      "No añadir Node ni dependencias fuera del ecosistema Python. No se permite añadir tooling o dependencias extra sin decisión documentada en context/DECISIONS.md.";
    conventions =
      "Nombres snake_case; estructura por paquetes; tests con pytest; estructura básica de carpetas y scripts según convención del proyecto.";
  } else {
    allowed = "Next.js, React, Node, npm/pnpm, ESLint; tests (unit/e2e según configuración).";
    notAllowed =
      "No añadir Python ni dependencias fuera del ecosistema Next/React/Node. No se permite añadir tooling o dependencias extra sin decisión documentada en context/DECISIONS.md.";
    conventions =
      "Rutas en app/ o pages/; convenciones Next.js; estructura por features o capas; scripts en package.json.";
  }
  return `# Stack — ${bp.projectName}

**Stack elegido:** ${stack}

## Permitido (por defecto)
${allowed}

## Qué NO se permite añadir sin decisión
${notAllowed}

## Convenciones mínimas
${conventions}
`;
}

export function renderContextDecisions(bp: ProjectBlueprint): string {
  return `# Decision log — ${bp.projectName}

Formato: Decision / Rationale / Consequences.

Regla: no editar historia; nuevas decisiones se añaden al final.

## Decisiones iniciales (proyecto generado)
- **Decision:** Stack ${bp.stack}, perfil de calidad ${bp.qualityProfile}, strictMode ${bp.strictMode}.
- **Rationale:** Definido en el blueprint del proyecto para gobernanza y límites de alcance.
- **Consequences:** Alcance y gates según ROADMAP.md y CHECKLIST_QA.md; no inventar dependencias; tests según perfil.

- **Decision:** Licencia MIT.
- **Rationale:** Estándar permisivo para proyectos generados por el wizard.
- **Consequences:** Uso y redistribución según términos MIT.

- **Decision:** Owners: CODEOWNERS (placeholder).
- **Rationale:** Asignación de responsabilidad de revisión; configurable en futuras versiones del blueprint.
- **Consequences:** Repo con archivo CODEOWNERS; sustituir placeholder por equipos reales.
`;
}

export function renderContextConstraints(bp: ProjectBlueprint): string {
  const logsNote =
    bp.qualityProfile === "Production"
      ? "\n- Logs estructurados obligatorios donde aplique (operaciones relevantes, errores)."
      : "";
  return `# Constraints — ${bp.projectName}

Límites duros y reglas de calidad. ROADMAP.md es el límite de alcance explícito del proyecto.

- No inventar dependencias ni librerías fuera del stack (ver context/STACK.md).
- Sin integración GitHub API (creación de repos, PRs, issues automáticos fuera de alcance).
- No scope creep: cambios fuera de ROADMAP.md requieren ticket separado.
- Tests y no-regresión según perfil (ver blueprint y CHECKLIST_QA.md). Suite existente en verde antes de persistir.
- Artefactos generados deben ser deterministas (mismas entradas → mismas salidas).${logsNote}
`;
}

export function renderContextRequirements(bp: ProjectBlueprint): string {
  return `# Requirements — ${bp.projectName}

## Objetivo del proyecto
${bp.description}

## Requisitos funcionales (top-level)
- Cumplir el objetivo definido en el blueprint y en ROADMAP.md (Definition of v1.0.0).
- Estructura y artefactos según stack ${bp.stack} y perfil ${bp.qualityProfile}.

## Requisitos no funcionales
- Seguridad: no exponer secretos; dependencias dentro del stack acordado.
- Calidad: tests y no-regresión según perfil (CHECKLIST_QA.md).
- UX/compatibilidad: determinismo en artefactos generados; documentación actualizada.

## Definición resumida de v1.0.0 (verificable)
- Objetivo cumplido según ROADMAP.md con stack **${bp.stack}** y perfil **${bp.qualityProfile}**.
- Criterios de aceptación del roadmap y checklist QA satisfechos.
`;
}

export function renderContextInterfaces(bp: ProjectBlueprint): string {
  if (bp.stack === "nextjs") {
    return `# Interfaces — ${bp.projectName}

Qué se considera API pública del proyecto y contratos estables.

- **API pública:** TBD. Por definir según evolución del producto.
- **Entradas/salidas principales:** Rutas (app/ o pages/), data flow; formatos JSON y respuestas por definir.
- **Contratos estables:** Ninguno aún. Documentar aquí cuando existan (schemas, eventos, tipos públicos).
`;
  }
  if (bp.stack === "python") {
    return `# Interfaces — ${bp.projectName}

Qué se considera API pública del proyecto y contratos estables.

- **API pública:** TBD. CLI, módulos exportados o endpoints según tipo de proyecto; documentar cuando existan.
- **Entradas/salidas principales:** Argumentos CLI, formatos de entrada/salida, contratos entre módulos; por definir.
- **Contratos estables:** Ninguno aún. Documentar aquí cuando existan (schemas, eventos, tipos públicos).
`;
  }
  return `# Interfaces — ${bp.projectName}

Qué se considera API pública del proyecto y contratos estables.

- **API pública:** TBD. Contratos y formatos se documentarán cuando existan (CLI, módulos, endpoints según tipo de proyecto).
- **Entradas/salidas principales:** Por definir (flags CLI, rutas, formatos JSON, etc.).
- **Contratos estables:** Ninguno aún. Documentar aquí cuando existan (schemas, eventos, tipos públicos).
`;
}

export function renderDocsArchitecture(bp: ProjectBlueprint): string {
  return `# Architecture — ${bp.projectName}

Límites del sistema, módulos principales y flujos en alto nivel (sin detalle de implementación). Por definir según evolución del proyecto. Stack: ${bp.stack}.
`;
}

export function renderDocsDecisions(bp: ProjectBlueprint): string {
  return `# Decisions — ${bp.projectName}

Decisiones de arquitectura y producto. Trazabilidad: ver \`context/DECISIONS.md\` para el log detallado.
`;
}

export function renderDocsQA(bp: ProjectBlueprint): string {
  return `# QA — ${bp.projectName}

Cómo validar cambios antes de persistir (merge/commit):

- **Tests:** ejecutar suite (\`npm test\` / \`pytest\` / equivalente según stack). Deben pasar.
- **No-regresión:** suite existente en verde; no eliminar tests para "hacer pasar".
- **Scope guard:** cambios dentro del alcance declarado del ticket (ver ROADMAP.md).
- **Logs:** si perfil Production, revisar logs estructurados donde aplique.

Referencia operativa: \`CHECKLIST_QA.md\`.
`;
}

export function renderDocsOnboarding(bp: ProjectBlueprint): string {
  const install =
    bp.stack === "python"
      ? "Crear venv, activar, instalar dependencias (pip install -r requirements.txt o similar)."
      : "Instalar dependencias (npm install o pnpm install).";
  return `# Onboarding — ${bp.projectName}

Guía operativa para nuevos contribuidores.

1. **Arranque:** Clonar repo. ${install}
2. **Comandos:** Ver README.md — build, test, lint según stack (\`npm run build\`, \`npm test\`, etc. o equivalente Python).
3. **Estructura:** blueprint en \`blueprint/project.json\`, docs en \`docs/\`, contexto en \`context/\`. Reglas de gobernanza en \`.cursor/rules/\` y \`.cursorrules\`.
4. **Reglas:** Respetar alcance (ROADMAP.md), Prompt Anatomy y Scope Guard; ver \`.cursorrules\` y \`CHECKLIST_QA.md\` antes de commit.
`;
}

export function renderLicenseMIT(): string {
  return `MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

export function renderCodeowners(): string {
  return `* @Caprini
`;
}
