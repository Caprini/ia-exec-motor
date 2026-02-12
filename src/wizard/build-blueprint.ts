/**
 * Construcción determinista del Project Blueprint (sin fechas).
 */
import type { ProjectBlueprint, WizardAnswers, GovernanceToggles } from "./types.js";
import { DEFAULT_GOVERNANCE_TOGGLES, isStrictProfile } from "./types.js";

const BLUEPRINT_VERSION = "0.2";
const GENERATED_BY = "ia-exec-motor";
const GENERATED_VERSION = "0.5.6";

const SLUG_REGEX = /^[a-z0-9-]+$/;

function toSlug(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return s || "project";
}

/** Normaliza entry para CODEOWNERS: trim y añade @ si falta. Orden estable para determinismo. */
function normalizeCodeowners(entries: string[]): string[] {
  const normalized = entries.map((s) => {
    const t = s.trim();
    return t.startsWith("@") ? t : `@${t}`;
  });
  return [...normalized].sort();
}

export function buildBlueprint(answers: WizardAnswers): ProjectBlueprint {
  const projectName = SLUG_REGEX.test(answers.projectName)
    ? answers.projectName
    : toSlug(answers.projectName);

  const governanceToggles: GovernanceToggles = {
    ...DEFAULT_GOVERNANCE_TOGGLES,
    ...answers.governanceToggles,
  };

  const strictMode = isStrictProfile(answers.qualityProfile);

  return {
    version: BLUEPRINT_VERSION,
    projectName,
    description: answers.description.trim(),
    repoVisibility: answers.repoVisibility,
    stack: answers.stack,
    qualityProfile: answers.qualityProfile,
    strictMode,
    governanceToggles,
    license: answers.license,
    author: answers.author.trim(),
    codeowners: normalizeCodeowners(answers.codeowners),
    generatedBy: GENERATED_BY,
    generatedVersion: GENERATED_VERSION,
  };
}
