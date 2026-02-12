/**
 * Generador de GATE_REPORT.json y EXEC_REPORT.md (plantilla).
 * Salidas deterministas; sin logs de runtime.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { GateResult, QualityProfile } from "./types.js";

const REPORT_VERSION = "1.0";

export interface GateReportPayload {
  version: string;
  timestamp: string;
  profileId: string;
  profileStrictMode: boolean;
  gates: GateResult[];
  summary: { pass: number; fail: number; warn: number };
}

export function writeGateReport(
  gateResults: GateResult[],
  profile: QualityProfile,
  outDir: string
): void {
  const pass = gateResults.filter((g) => g.status === "PASS").length;
  const fail = gateResults.filter((g) => g.status === "FAIL").length;
  const warn = gateResults.filter((g) => g.status === "WARN").length;

  const payload: GateReportPayload = {
    version: REPORT_VERSION,
    timestamp: new Date().toISOString(),
    profileId: profile.id,
    profileStrictMode: profile.strictMode,
    gates: gateResults,
    summary: { pass, fail, warn },
  };

  const path = join(outDir, "GATE_REPORT.json");
  writeFileSync(path, JSON.stringify(payload, null, 2), "utf-8");
}

export function writeExecReport(
  gateResults: GateResult[],
  profile: QualityProfile,
  outDir: string
): void {
  const lines: string[] = [
    "# EXEC_REPORT",
    "",
    "## Resumen",
    "",
    `- Perfil: ${profile.id}`,
    `- strictMode: ${profile.strictMode}`,
    "",
    "## Resultados por Gate",
    "",
    "| Gate   | Status | Severity | Message |",
    "|--------|--------|----------|---------|",
  ];

  for (const g of gateResults) {
    const msg = (g.message ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
    lines.push(`| ${g.gateId} | ${g.status} | ${g.severity} | ${msg} |`);
  }

  lines.push("", "## Logs del proceso", "", "- Pipeline: validación → gates → reportes.", "- Sin logs de runtime en este reporte.");

  const path = join(outDir, "EXEC_REPORT.md");
  writeFileSync(path, lines.join("\n"), "utf-8");
}
