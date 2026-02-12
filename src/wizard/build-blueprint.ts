/**
 * Construcción determinista del Project Blueprint (sin fechas).
 */
import type { ProjectBlueprint, WizardAnswers, GovernanceToggles } from "./types.js";
import { DEFAULT_GOVERNANCE_TOGGLES, isStrictProfile } from "./types.js";

const BLUEPRINT_VERSION = "0.1";
const GENERATED_BY = "ia-exec-motor";
const GENERATED_VERSION = "0.5.5";

const SLUG_REGEX = /^[a-z0-9-]+$/;

function toSlug(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return s || "project";
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
    generatedBy: GENERATED_BY,
    generatedVersion: GENERATED_VERSION,
  };
}
