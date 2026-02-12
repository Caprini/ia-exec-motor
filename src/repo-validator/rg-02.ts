/**
 * RG-02: Archivos raíz obligatorios — README.md, CHANGELOG.md, AGENTS.md.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { RepoValidatorResult } from "../types.js";

const REQUIRED_FILES = ["README.md", "CHANGELOG.md", "AGENTS.md"];

export function evaluateRg02(repoRoot: string): RepoValidatorResult {
  const missing: string[] = [];
  for (const file of REQUIRED_FILES) {
    const full = join(repoRoot, file);
    if (!existsSync(full)) {
      missing.push(file);
    }
  }
  if (missing.length > 0) {
    return {
      id: "RG-02",
      status: "FAIL",
      message: `Faltan archivos raíz: ${missing.join(", ")}.`,
      findings: missing.map((f) => `Falta archivo: ${f}`),
      remediation: "Añadir los archivos indicados en la raíz del repositorio.",
    };
  }
  return {
    id: "RG-02",
    status: "PASS",
    message: "Archivos raíz README, CHANGELOG y AGENTS presentes.",
  };
}
