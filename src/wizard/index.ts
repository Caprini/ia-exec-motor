/**
 * Orquestación del Wizard v0: prompt → buildBlueprint → validate → writeProject.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { runPrompt, answersFromOptions } from "./prompt.js";
import { buildBlueprint } from "./build-blueprint.js";
import { validateBlueprint } from "./validate-blueprint.js";
import { writeProject } from "./write-project.js";
import { logError } from "./logger.js";
import type { WizardCLIOptions } from "./types.js";

export async function runWizard(options?: WizardCLIOptions): Promise<number> {
  try {
    const defaults = answersFromOptions(options);
    const answers = await runPrompt(defaults);
    const blueprint = buildBlueprint(answers);
    const validation = validateBlueprint(blueprint);
    if (!validation.valid) {
      validation.errors?.forEach((e) => logError(e));
      return 1;
    }
    const outDir = resolve(process.cwd(), "..", blueprint.projectName);
    if (existsSync(outDir) && !options?.force) {
      logError("La carpeta destino ya existe. Use --force para sobrescribir.");
      return 1;
    }
    const overwrite = Boolean(options?.force && existsSync(outDir));
    writeProject(blueprint, outDir, { overwrite });
    return 0;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(msg);
    return 1;
  }
}

export { runPrompt, answersFromOptions } from "./prompt.js";
export { buildBlueprint } from "./build-blueprint.js";
export { validateBlueprint } from "./validate-blueprint.js";
export { writeProject } from "./write-project.js";
