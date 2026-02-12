/**
 * Repo Validator v0 — ejecuta checks RG-01 a RG-05 (doc 91).
 */
import type { RepoValidatorResult } from "../types.js";
import { evaluateRg01 } from "./rg-01.js";
import { evaluateRg02 } from "./rg-02.js";
import { evaluateRg03 } from "./rg-03.js";
import { evaluateRg04 } from "./rg-04.js";
import { evaluateRg05 } from "./rg-05.js";

export function runRepoValidator(repoRoot: string): RepoValidatorResult[] {
  return [
    evaluateRg01(repoRoot),
    evaluateRg02(repoRoot),
    evaluateRg03(repoRoot),
    evaluateRg04(repoRoot),
    evaluateRg05(repoRoot),
  ];
}

export { evaluateRg01, evaluateRg02, evaluateRg03, evaluateRg04, evaluateRg05 };
