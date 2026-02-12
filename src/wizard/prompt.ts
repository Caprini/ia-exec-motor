/**
 * Preguntas interactivas del Wizard v0. Solo Node readline, sin dependencias.
 * Acepta defaults (p. ej. desde flags CLI): si todos los obligatorios vienen en defaults, no usa readline.
 */
import { createInterface } from "node:readline/promises";
import type { WizardAnswers, GovernanceToggles, Stack, RepoVisibility } from "./types.js";
import { DEFAULT_GOVERNANCE_TOGGLES } from "./types.js";
import type { WizardCLIOptions } from "./types.js";
import type { QualityProfileId } from "../types.js";

const SLUG_REGEX = /^[a-z0-9-]+$/;
export const STACKS: Stack[] = ["node-ts", "python", "nextjs"];
export const PROFILES: QualityProfileId[] = ["Exploratory", "Standard", "Strict", "Production"];
export const VISIBILITY: RepoVisibility[] = ["public", "private"];

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parseBoolean(input: string, defaultValue: boolean): boolean {
  const s = input.trim().toLowerCase();
  if (s === "" || s === "s" || s === "y" || s === "yes" || s === "si") return true;
  if (s === "n" || s === "no") return false;
  return defaultValue;
}

/** Convierte opciones CLI en Partial<WizardAnswers> para usar como defaults. */
export function answersFromOptions(opts?: WizardCLIOptions): Partial<WizardAnswers> | undefined {
  if (!opts) return undefined;
  const partial: Partial<WizardAnswers> = {};
  if (opts.projectName !== undefined && SLUG_REGEX.test(opts.projectName)) partial.projectName = opts.projectName;
  if (opts.desc !== undefined && opts.desc.trim().length > 0) partial.description = opts.desc.trim();
  if (opts.stack !== undefined) partial.stack = opts.stack;
  if (opts.profile !== undefined) partial.qualityProfile = opts.profile;
  if (opts.visibility !== undefined) partial.repoVisibility = opts.visibility;
  return Object.keys(partial).length > 0 ? partial : undefined;
}

function hasAllRequiredDefaults(d: Partial<WizardAnswers>): d is Pick<WizardAnswers, "projectName" | "description" | "stack" | "qualityProfile" | "repoVisibility"> {
  return (
    typeof d.projectName === "string" && SLUG_REGEX.test(d.projectName) &&
    typeof d.description === "string" && d.description.trim().length > 0 &&
    d.stack !== undefined && STACKS.includes(d.stack) &&
    d.qualityProfile !== undefined && PROFILES.includes(d.qualityProfile) &&
    d.repoVisibility !== undefined && VISIBILITY.includes(d.repoVisibility)
  );
}

export async function runPrompt(defaults?: Partial<WizardAnswers>): Promise<WizardAnswers> {
  if (defaults && hasAllRequiredDefaults(defaults)) {
    return {
      projectName: defaults.projectName,
      description: defaults.description.trim(),
      repoVisibility: defaults.repoVisibility,
      stack: defaults.stack,
      qualityProfile: defaults.qualityProfile,
      governanceToggles: { ...DEFAULT_GOVERNANCE_TOGGLES },
    };
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  let projectName = typeof defaults?.projectName === "string" && SLUG_REGEX.test(defaults.projectName) ? defaults.projectName : "";
  while (!projectName) {
    const raw = await rl.question("projectName (slug, solo a-z 0-9 -): ");
    const slug = toSlug(raw) || raw.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) {
      console.error("[WARN] projectName no puede estar vacío.");
      continue;
    }
    if (!SLUG_REGEX.test(slug)) {
      console.error("[WARN] Usa solo letras minúsculas, números y guiones.");
      continue;
    }
    projectName = slug;
  }

  let description = typeof defaults?.description === "string" && defaults.description.trim().length > 0 ? defaults.description.trim() : "";
  while (!description) {
    description = (await rl.question("description (1-2 frases): ")).trim();
    if (!description) console.error("[WARN] description no puede estar vacío.");
  }

  let stack: Stack = (defaults?.stack && STACKS.includes(defaults.stack) ? defaults.stack : "node-ts") as Stack;
  while (true) {
    const raw = await rl.question(`stack (${STACKS.join(" / ")}) [${stack}]: `);
    const v = (raw.trim() || stack).toLowerCase();
    if (STACKS.includes(v as Stack)) {
      stack = v as Stack;
      break;
    }
    console.error("[WARN] Elige uno de: " + STACKS.join(", "));
  }

  let qualityProfile: QualityProfileId = (defaults?.qualityProfile && PROFILES.includes(defaults.qualityProfile) ? defaults.qualityProfile : "Standard") as QualityProfileId;
  while (true) {
    const raw = await rl.question(`qualityProfile (${PROFILES.join(" / ")}) [${qualityProfile}]: `);
    const v = (raw.trim() || qualityProfile) as QualityProfileId;
    if (PROFILES.includes(v)) {
      qualityProfile = v;
      break;
    }
    console.error("[WARN] Elige uno de: " + PROFILES.join(", "));
  }

  let repoVisibility: RepoVisibility = (defaults?.repoVisibility && VISIBILITY.includes(defaults.repoVisibility) ? defaults.repoVisibility : "public") as RepoVisibility;
  const visRaw = await rl.question(`repoVisibility (public / private) [${repoVisibility}]: `);
  const vis = (visRaw.trim() || repoVisibility).toLowerCase();
  if (vis === "private") repoVisibility = "private";
  else if (vis === "public") repoVisibility = "public";

  const toggles: GovernanceToggles = { ...DEFAULT_GOVERNANCE_TOGGLES };

  const askToggle = async (key: keyof GovernanceToggles, label: string, defaultVal: boolean): Promise<void> => {
    const def = defaultVal ? "Y" : "N";
    const raw = await rl.question(`${label} (s/n) [${def}]: `);
    toggles[key] = parseBoolean(raw, defaultVal);
  };

  await askToggle("plannerExecutorSplit", "Planificador/Ejecutor separado", true);
  await askToggle("requireTests", "Tests obligatorios", true);
  await askToggle("requireNoRegression", "No-regresión obligatoria", true);
  await askToggle("requireLogs", "Logs obligatorios", true);
  await askToggle("scopeGuard", "SCOPE_GUARD", true);

  rl.close();

  return {
    projectName,
    description: description.trim(),
    repoVisibility,
    stack,
    qualityProfile,
    governanceToggles: toggles,
  };
}
