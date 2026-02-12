/**
 * Escritura determinista del proyecto destino en disco.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ProjectBlueprint } from "./types.js";
import { logInfo, logWarn, logError } from "./logger.js";
import {
  renderProjectJson,
  renderCharter,
  renderRoadmap,
  renderChecklistQa,
  renderBootstrapMdc,
  renderAgentsMd,
  renderReadme,
  renderGitignore,
  renderPullRequestTemplate,
  renderIssueTemplateConfig,
  renderChangelog,
  renderCursorRules,
  renderContextStack,
  renderContextDecisions,
  renderContextConstraints,
  renderContextRequirements,
  renderContextInterfaces,
  renderDocsArchitecture,
  renderDocsDecisions,
  renderDocsQA,
  renderDocsOnboarding,
  renderLicenseMIT,
  renderCodeowners,
} from "./templates/index.js";

export interface WriteProjectOptions {
  overwrite?: boolean;
}

export function writeProject(blueprint: ProjectBlueprint, outDir: string, options?: WriteProjectOptions): void {
  const existed = existsSync(outDir);
  if (existed) {
    if (options?.overwrite) {
      logWarn(`Sobrescribiendo carpeta existente: ${outDir}`);
    }
  } else {
    mkdirSync(outDir, { recursive: true });
    logInfo(`Creada carpeta: ${outDir}`);
  }

  const write = (relativePath: string, content: string, description: string): void => {
    const fullPath = join(outDir, relativePath);
    const dir = join(fullPath, "..");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    try {
      writeFileSync(fullPath, content, "utf-8");
      logInfo(description);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError(`Escritura fallida ${relativePath}: ${msg}`);
      throw err;
    }
  };

  write("blueprint/project.json", renderProjectJson(blueprint), "blueprint/project.json");
  write("docs/00_PROJECT_CHARTER.md", renderCharter(blueprint), "docs/00_PROJECT_CHARTER.md");
  write("ROADMAP.md", renderRoadmap(blueprint), "ROADMAP.md");
  write("CHECKLIST_QA.md", renderChecklistQa(blueprint), "CHECKLIST_QA.md");
  write(".cursor/rules/20_PROJECT_BOOTSTRAP.mdc", renderBootstrapMdc(blueprint), ".cursor/rules/20_PROJECT_BOOTSTRAP.mdc");
  write("AGENTS.md", renderAgentsMd(blueprint), "AGENTS.md");
  write("README.md", renderReadme(blueprint), "README.md");
  write(".gitignore", renderGitignore(blueprint), ".gitignore");
  write(".github/pull_request_template.md", renderPullRequestTemplate(blueprint), ".github/pull_request_template.md");
  write(".github/ISSUE_TEMPLATE/config.yml", renderIssueTemplateConfig(blueprint), ".github/ISSUE_TEMPLATE/config.yml");
  write("CHANGELOG.md", renderChangelog(blueprint), "CHANGELOG.md");

  write(".cursorrules", renderCursorRules(blueprint), ".cursorrules");
  write("context/STACK.md", renderContextStack(blueprint), "context/STACK.md");
  write("context/DECISIONS.md", renderContextDecisions(blueprint), "context/DECISIONS.md");
  write("context/CONSTRAINTS.md", renderContextConstraints(blueprint), "context/CONSTRAINTS.md");
  write("context/REQUIREMENTS.md", renderContextRequirements(blueprint), "context/REQUIREMENTS.md");
  write("context/INTERFACES.md", renderContextInterfaces(blueprint), "context/INTERFACES.md");
  write("docs/ARCHITECTURE.md", renderDocsArchitecture(blueprint), "docs/ARCHITECTURE.md");
  write("docs/DECISIONS.md", renderDocsDecisions(blueprint), "docs/DECISIONS.md");
  write("docs/QA.md", renderDocsQA(blueprint), "docs/QA.md");
  write("docs/ONBOARDING.md", renderDocsOnboarding(blueprint), "docs/ONBOARDING.md");
  write("LICENSE", renderLicenseMIT(), "LICENSE");
  write("CODEOWNERS", renderCodeowners(), "CODEOWNERS");
}
