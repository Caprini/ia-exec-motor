/**
 * Validador determinista del Project Blueprint (sin dependencias; alineado con blueprint.schema.json).
 * Si falla, el wizard aborta sin escribir archivos.
 */
import type { ProjectBlueprint, GovernanceToggles } from "./types.js";

const SLUG_REGEX = /^[a-z0-9-]+$/;
const STACKS = ["node-ts", "nextjs", "python"] as const;
const PROFILES = ["Exploratory", "Standard", "Strict", "Production"] as const;
const VISIBILITY = ["public", "private"] as const;
const TOGGLE_KEYS: (keyof GovernanceToggles)[] = [
  "plannerExecutorSplit",
  "requireTests",
  "requireNoRegression",
  "requireLogs",
  "scopeGuard",
];

export interface BlueprintValidationResult {
  valid: boolean;
  errors?: string[];
}

function isGovernanceToggles(v: unknown): v is GovernanceToggles {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  for (const key of TOGGLE_KEYS) {
    if (typeof o[key] !== "boolean") return false;
  }
  return true;
}

export function validateBlueprint(bp: unknown): BlueprintValidationResult {
  const errors: string[] = [];

  if (bp === null || typeof bp !== "object" || Array.isArray(bp)) {
    return { valid: false, errors: ["El blueprint debe ser un objeto JSON."] };
  }

  const o = bp as Record<string, unknown>;

  if (typeof o.version !== "string" || o.version.length === 0) {
    errors.push("Campo obligatorio 'version' debe ser un string no vacío.");
  }

  if (typeof o.projectName !== "string" || o.projectName.length === 0) {
    errors.push("Campo obligatorio 'projectName' debe ser un string no vacío.");
  } else if (!SLUG_REGEX.test(o.projectName)) {
    errors.push("'projectName' debe ser un slug (solo a-z, 0-9 y guiones).");
  }

  if (typeof o.description !== "string" || (o.description as string).trim().length === 0) {
    errors.push("Campo obligatorio 'description' debe ser un string no vacío.");
  }

  if (!("repoVisibility" in o) || typeof o.repoVisibility !== "string") {
    errors.push("Campo obligatorio 'repoVisibility' debe ser un string.");
  } else if (!VISIBILITY.includes(o.repoVisibility as "public" | "private")) {
    errors.push("'repoVisibility' debe ser 'public' o 'private'.");
  }

  if (!("stack" in o) || typeof o.stack !== "string") {
    errors.push("Campo obligatorio 'stack' debe ser un string.");
  } else if (!STACKS.includes(o.stack as "node-ts" | "nextjs" | "python")) {
    errors.push("'stack' debe ser uno de: node-ts, nextjs, python.");
  }

  if (!("qualityProfile" in o) || typeof o.qualityProfile !== "string") {
    errors.push("Campo obligatorio 'qualityProfile' debe ser un string.");
  } else if (!PROFILES.includes(o.qualityProfile as "Exploratory" | "Standard" | "Strict" | "Production")) {
    errors.push("'qualityProfile' debe ser uno de: Exploratory, Standard, Strict, Production.");
  }

  if (typeof o.strictMode !== "boolean") {
    errors.push("Campo obligatorio 'strictMode' debe ser un boolean.");
  }

  if (!("governanceToggles" in o)) {
    errors.push("Campo obligatorio 'governanceToggles' debe estar presente.");
  } else if (!isGovernanceToggles(o.governanceToggles)) {
    errors.push("'governanceToggles' debe ser un objeto con las claves booleanas: plannerExecutorSplit, requireTests, requireNoRegression, requireLogs, scopeGuard.");
  }

  if (typeof o.generatedBy !== "string" || (o.generatedBy as string).length === 0) {
    errors.push("Campo obligatorio 'generatedBy' debe ser un string no vacío.");
  }

  if (typeof o.generatedVersion !== "string" || (o.generatedVersion as string).length === 0) {
    errors.push("Campo obligatorio 'generatedVersion' debe ser un string no vacío.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
