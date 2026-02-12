import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { writeGateReport, writeExecReport } from "../src/reporter.js";
import { getDefaultQualityProfile } from "../src/config/quality-profile.js";
import { evaluateAllGates } from "../src/gates/index.js";
import type { InstructionRequest } from "../src/types.js";
import { getPolicyMatrix } from "../src/config/policy-matrix.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = join(__dirname, "fixtures");

function loadValidRequest(): InstructionRequest {
  const raw = readFileSync(join(FIXTURES, "instruction-request-valid.json"), "utf-8");
  return JSON.parse(raw) as InstructionRequest;
}

describe("writeGateReport", () => {
  it("escribe GATE_REPORT.json con version, profileId, gates y summary", () => {
    const dir = mkdtempSync(join(tmpdir(), "ia-exec-"));
    try {
      const request = loadValidRequest();
      const profile = getDefaultQualityProfile();
      const matrix = getPolicyMatrix();
      const results = evaluateAllGates(request, profile, matrix);
      writeGateReport(results, profile, dir);

      const path = join(dir, "GATE_REPORT.json");
      const content = readFileSync(path, "utf-8");
      const payload = JSON.parse(content);

      assert.strictEqual(typeof payload.version, "string");
      assert.strictEqual(typeof payload.timestamp, "string");
      assert.strictEqual(payload.profileId, "Standard");
      assert.strictEqual(payload.profileStrictMode, false);
      assert.strictEqual(Array.isArray(payload.gates), true);
      assert.strictEqual(payload.gates.length, 13);
      assert.ok(typeof payload.summary.pass === "number");
      assert.ok(typeof payload.summary.fail === "number");
      assert.ok(typeof payload.summary.warn === "number");
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});

describe("writeExecReport", () => {
  it("escribe EXEC_REPORT.md con título, resumen y tabla de gates", () => {
    const dir = mkdtempSync(join(tmpdir(), "ia-exec-"));
    try {
      const request = loadValidRequest();
      const profile = getDefaultQualityProfile();
      const matrix = getPolicyMatrix();
      const results = evaluateAllGates(request, profile, matrix);
      writeExecReport(results, profile, dir);

      const path = join(dir, "EXEC_REPORT.md");
      const content = readFileSync(path, "utf-8");

      assert.ok(content.includes("# EXEC_REPORT"));
      assert.ok(content.includes("## Resumen"));
      assert.ok(content.includes("Perfil:"));
      assert.ok(content.includes("## Resultados por Gate"));
      assert.ok(content.includes("| Gate"));
      assert.ok(content.includes("## Logs del proceso"));
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});

describe("snapshot GATE_REPORT.json", () => {
  it("estructura estable: version, profileId, 13 gates, summary (timestamp normalizado)", () => {
    const dir = mkdtempSync(join(tmpdir(), "ia-exec-"));
    try {
      const request = loadValidRequest();
      const profile = getDefaultQualityProfile();
      const matrix = getPolicyMatrix();
      const results = evaluateAllGates(request, profile, matrix);
      writeGateReport(results, profile, dir);

      const path = join(dir, "GATE_REPORT.json");
      const content = readFileSync(path, "utf-8");
      const payload = JSON.parse(content);

      // Normalizar para snapshot estable (sin timestamp variable)
      const normalized = {
        version: payload.version,
        profileId: payload.profileId,
        profileStrictMode: payload.profileStrictMode,
        gateIds: payload.gates.map((g: { gateId: string }) => g.gateId),
        gateStatuses: payload.gates.map((g: { gateId: string; status: string }) => `${g.gateId}:${g.status}`),
        summary: payload.summary,
      };

      assert.strictEqual(normalized.version, "1.0");
      assert.strictEqual(normalized.profileId, "Standard");
      assert.strictEqual(normalized.gateIds.length, 13);
      assert.deepStrictEqual(
        normalized.gateStatuses.sort(),
        [
          "G-01:PASS", "G-02:PASS", "G-03:WARN", "G-04:WARN", "G-05:WARN", "G-06:WARN", "G-07:WARN",
          "G-08:WARN", "G-09:WARN", "G-10:WARN", "G-11:PASS", "G-12:PASS", "G-13:PASS",
        ].sort()
      );
      assert.strictEqual(normalized.summary.pass, 5);
      assert.strictEqual(normalized.summary.warn, 8);
      assert.strictEqual(normalized.summary.fail, 0);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });
});
