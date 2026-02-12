/**
 * CLI ia-exec-motor — punto de entrada.
 * Uso: npx tsx src/cli.ts <path-to-instruction-request.json>
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateInstructionRequest } from "./validator.js";
import { getDefaultQualityProfile } from "./config/quality-profile.js";
import { getPolicyMatrix } from "./config/policy-matrix.js";
import { evaluateAllGates } from "./gates/index.js";
import { writeGateReport, writeExecReport } from "./reporter.js";
import { writeExportables } from "./exportables.js";

const DEFAULT_OUT_DIR = ".";

function main(): number {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Uso: ia-exec-motor <path-to-instruction-request.json>");
    return 1;
  }

  const absolutePath = resolve(process.cwd(), inputPath);
  let raw: string;
  try {
    raw = readFileSync(absolutePath, "utf-8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error leyendo archivo: ${msg}`);
    return 1;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    console.error("El archivo no es JSON válido.");
    return 1;
  }

  const validation = validateInstructionRequest(parsed);
  if (!validation.valid) {
    console.error("InstructionRequest inválido:");
    validation.errors?.forEach((e) => console.error(`  - ${e}`));
    return 1;
  }

  const request = validation.request!;
  const profile = getDefaultQualityProfile();
  const matrix = getPolicyMatrix();
  const gateResults = evaluateAllGates(request, profile, matrix);
  const outDir = process.env.OUT_DIR ?? DEFAULT_OUT_DIR;

  writeGateReport(gateResults, profile, outDir);
  writeExecReport(gateResults, profile, outDir);
  writeExportables(outDir);

  return 0;
}

process.exit(main());
