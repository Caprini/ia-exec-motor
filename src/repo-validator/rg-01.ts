/**
 * RG-01: Estructura mínima — directorios obligatorios (docs, src, tests, .cursor/rules, context).
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import type { RepoValidatorResult } from "../types.js";

const REQUIRED_DIRS = ["docs", "src", "tests", ".cursor/rules", "context"];

export function evaluateRg01(repoRoot: string): RepoValidatorResult {
  const missing: string[] = [];
  for (const dir of REQUIRED_DIRS) {
    const full = join(repoRoot, dir);
    if (!existsSync(full) || !statSync(full).isDirectory()) {
      missing.push(dir);
    }
  }
  if (missing.length > 0) {
    return {
      id: "RG-01",
      status: "FAIL",
      message: `Faltan directorios obligatorios: ${missing.join(", ")}.`,
      findings: missing.map((d) => `Falta directorio: ${d}`),
      remediation: "Crear los directorios indicados según la estructura mínima del repo.",
    };
  }
  return {
    id: "RG-01",
    status: "PASS",
    message: "Estructura mínima de directorios cumplida.",
  };
}
