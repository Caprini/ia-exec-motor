/**
 * Exportables mínimos: .cursor/rules/00_SYSTEM_CORE.mdc y AGENTS.md (placeholders).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PLACEHOLDER_CORE = `---
description: Reglas del motor — placeholder
globs: 
---
Placeholder — ia-exec-motor MVP. Ver docs/ai-motor para especificación.
`;

const PLACEHOLDER_AGENTS = `# AGENTS.md (placeholder)
Placeholder — ia-exec-motor MVP.
`;

export function writeExportables(outDir: string): void {
  const cursorRulesDir = join(outDir, ".cursor", "rules");
  mkdirSync(cursorRulesDir, { recursive: true });

  writeFileSync(join(cursorRulesDir, "00_SYSTEM_CORE.mdc"), PLACEHOLDER_CORE, "utf-8");

  const agentsPath = join(outDir, "AGENTS.md");
  writeFileSync(agentsPath, PLACEHOLDER_AGENTS, "utf-8");
}
