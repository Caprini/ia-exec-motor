/**
 * RG-03: Reglas en .cursor/rules con extensión (.mdc o .md).
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { RepoValidatorResult } from "../types.js";

const RULES_DIR = ".cursor/rules";
const ALLOWED_EXT = [".mdc", ".md"];

export function evaluateRg03(repoRoot: string): RepoValidatorResult {
  const rulesPath = join(repoRoot, RULES_DIR);
  if (!existsSync(rulesPath) || !statSync(rulesPath).isDirectory()) {
    return {
      id: "RG-03",
      status: "FAIL",
      message: "No existe el directorio .cursor/rules.",
      remediation: "Crear .cursor/rules y añadir al menos un archivo con extensión .mdc o .md.",
    };
  }
  const entries = readdirSync(rulesPath, { withFileTypes: true });
  const hasRuleFile = entries.some((e) => {
    if (!e.isFile()) return false;
    return ALLOWED_EXT.some((ext) => e.name.endsWith(ext));
  });
  if (!hasRuleFile) {
    return {
      id: "RG-03",
      status: "FAIL",
      message: "No hay archivos de reglas con extensión .mdc o .md en .cursor/rules.",
      remediation: "Añadir al menos un archivo .mdc o .md en .cursor/rules.",
    };
  }
  return {
    id: "RG-03",
    status: "PASS",
    message: "Reglas en .cursor/rules con extensión válida presentes.",
  };
}
