/**
 * Tipos del Project Blueprint (Wizard v0).
 * Sin timestamps para salida determinista.
 */
import type { QualityProfileId } from "../types.js";

export type Stack = "node-ts" | "python" | "nextjs";
export type RepoVisibility = "public" | "private";

export interface GovernanceToggles {
  plannerExecutorSplit: boolean;
  requireTests: boolean;
  requireNoRegression: boolean;
  requireLogs: boolean;
  scopeGuard: boolean;
}

export const DEFAULT_GOVERNANCE_TOGGLES: GovernanceToggles = {
  plannerExecutorSplit: true,
  requireTests: true,
  requireNoRegression: true,
  requireLogs: true,
  scopeGuard: true,
};

export interface ProjectBlueprint {
  version: string;
  projectName: string;
  description: string;
  repoVisibility: RepoVisibility;
  stack: Stack;
  qualityProfile: QualityProfileId;
  strictMode: boolean;
  governanceToggles: GovernanceToggles;
  generatedBy: string;
  generatedVersion: string;
}

export interface WizardAnswers {
  projectName: string;
  description: string;
  repoVisibility: RepoVisibility;
  stack: Stack;
  qualityProfile: QualityProfileId;
  governanceToggles: GovernanceToggles;
}

/** Opciones del wizard desde CLI (modo no-interactivo o mixto). */
export interface WizardCLIOptions {
  projectName?: string;
  stack?: Stack;
  profile?: QualityProfileId;
  desc?: string;
  visibility?: RepoVisibility;
  force?: boolean;
}

/** Strict/Production → strictMode true */
export function isStrictProfile(profile: QualityProfileId): boolean {
  return profile === "Strict" || profile === "Production";
}
