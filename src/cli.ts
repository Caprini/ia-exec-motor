/**
 * CLI ia-exec-motor — punto de entrada.
 * Uso: npx tsx src/cli.ts <path-to-instruction-request.json>
 *      npx tsx src/cli.ts wizard [--project-name <slug>] [--stack ...] [--profile ...] [--desc "..."] [--visibility ...] [--license MIT|Apache-2.0|None] [--author "..."] [--codeowners "@a,@b"] [--force]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateInstructionRequest } from "./validator.js";
import { getDefaultQualityProfile } from "./config/quality-profile.js";
import { getPolicyMatrix } from "./config/policy-matrix.js";
import { evaluateAllGates } from "./gates/index.js";
import { writeGateReport, writeExecReport } from "./reporter.js";
import { writeExportables } from "./exportables.js";
import { runWizard } from "./wizard/index.js";
import type { WizardCLIOptions } from "./wizard/types.js";
import type { Stack, RepoVisibility, LicenseId } from "./wizard/types.js";
import { LICENSES } from "./wizard/prompt.js";
import type { QualityProfileId } from "./types.js";

const STACKS: Stack[] = ["node-ts", "python", "nextjs"];
const PROFILES: QualityProfileId[] = ["Exploratory", "Standard", "Strict", "Production"];
const VISIBILITY: RepoVisibility[] = ["public", "private"];

function parseWizardFlags(argv: string[]): WizardCLIOptions {
  const opts: WizardCLIOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--project-name" && argv[i + 1] !== undefined) {
      opts.projectName = argv[++i];
    } else if (arg === "--stack" && argv[i + 1] !== undefined) {
      const v = argv[++i].toLowerCase();
      if (STACKS.includes(v as Stack)) opts.stack = v as Stack;
    } else if (arg === "--profile" && argv[i + 1] !== undefined) {
      const v = argv[++i];
      if (PROFILES.includes(v as QualityProfileId)) opts.profile = v as QualityProfileId;
    } else if (arg === "--desc" && argv[i + 1] !== undefined) {
      opts.desc = argv[++i];
    } else if (arg === "--visibility" && argv[i + 1] !== undefined) {
      const v = argv[++i].toLowerCase();
      if (VISIBILITY.includes(v as RepoVisibility)) opts.visibility = v as RepoVisibility;
    } else if (arg === "--license" && argv[i + 1] !== undefined) {
      const v = argv[++i];
      if (LICENSES.includes(v as LicenseId)) opts.license = v as LicenseId;
    } else if (arg === "--author" && argv[i + 1] !== undefined) {
      opts.author = argv[++i];
    } else if (arg === "--codeowners" && argv[i + 1] !== undefined) {
      opts.codeowners = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    } else if (arg === "--force") {
      opts.force = true;
    }
  }
  return opts;
}

const DEFAULT_OUT_DIR = ".";

function main(): number {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Uso: ia-exec-motor <path-to-instruction-request.json> | wizard");
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

if (process.argv[2] === "wizard") {
  const options = parseWizardFlags(process.argv.slice(3));
  runWizard(options).then((code) => process.exit(code));
} else {
  process.exit(main());
}
