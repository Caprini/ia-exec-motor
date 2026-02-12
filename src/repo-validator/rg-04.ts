/**
 * RG-04: SemVer formato X.Y.Z en package.json (version).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RepoValidatorResult } from "../types.js";

/** Acepta X.Y.Z y X.Y.Z-prerelease (semver básico). */
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-.+)?$/;

export function evaluateRg04(repoRoot: string): RepoValidatorResult {
  const pkgPath = join(repoRoot, "package.json");
  if (!existsSync(pkgPath)) {
    return {
      id: "RG-04",
      status: "FAIL",
      message: "No existe package.json en la raíz del repositorio.",
      remediation: "Crear package.json con campo version en formato SemVer X.Y.Z.",
    };
  }
  let raw: string;
  try {
    raw = readFileSync(pkgPath, "utf-8");
  } catch {
    return {
      id: "RG-04",
      status: "FAIL",
      message: "No se pudo leer package.json.",
      remediation: "Comprobar permisos y que package.json es un archivo válido.",
    };
  }
  let pkg: { version?: unknown };
  try {
    pkg = JSON.parse(raw) as { version?: unknown };
  } catch {
    return {
      id: "RG-04",
      status: "FAIL",
      message: "package.json no es JSON válido.",
      remediation: "Corregir la sintaxis JSON de package.json.",
    };
  }
  const v = pkg.version;
  if (v == null || typeof v !== "string") {
    return {
      id: "RG-04",
      status: "FAIL",
      message: "package.json no tiene el campo version.",
      findings: ["Campo version ausente o no string"],
      remediation: "Añadir en package.json: \"version\": \"X.Y.Z\" (SemVer).",
    };
  }
  if (!SEMVER_REGEX.test(v.trim())) {
    return {
      id: "RG-04",
      status: "FAIL",
      message: `Versión en package.json no cumple SemVer X.Y.Z: ${v}.`,
      findings: [`version actual: ${v}`],
      remediation: "Usar formato SemVer (ej: 1.0.0, 0.2.1).",
    };
  }
  return {
    id: "RG-04",
    status: "PASS",
    message: `Versión SemVer válida: ${v}.`,
  };
}
