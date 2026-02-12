/**
 * RG-05: Test runner exit 0 — ejecutar npm test en repoRoot.
 */
import { spawnSync } from "node:child_process";
import type { RepoValidatorResult } from "../types.js";

export function evaluateRg05(repoRoot: string): RepoValidatorResult {
  const result = spawnSync("npm", ["test"], {
    cwd: repoRoot,
    shell: true,
    encoding: "utf-8",
    timeout: 120_000,
  });
  if (result.status === 0) {
    return {
      id: "RG-05",
      status: "PASS",
      message: "npm test finalizó con exit 0.",
    };
  }
  const stderr = result.stderr?.slice(0, 200) ?? "";
  return {
    id: "RG-05",
    status: "FAIL",
    message: `npm test no finalizó con exit 0 (código: ${result.status ?? "null"}).`,
    findings: stderr ? [stderr.replace(/\n/g, " ")] : undefined,
    remediation: "Corregir tests o configuración para que npm test termine con éxito.",
  };
}
