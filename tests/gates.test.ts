import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateAllGates } from "../src/gates/index.js";
import { getDefaultQualityProfile, getQualityProfile } from "../src/config/quality-profile.js";
import { getPolicyMatrix } from "../src/config/policy-matrix.js";
import type { InstructionRequest } from "../src/types.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = join(__dirname, "fixtures");

function loadValidRequest(): InstructionRequest {
  const raw = readFileSync(join(FIXTURES, "instruction-request-valid.json"), "utf-8");
  return JSON.parse(raw) as InstructionRequest;
}

describe("evaluateAllGates", () => {
  it("devuelve 13 resultados (uno por gate)", () => {
    const request = loadValidRequest();
    const profile = getDefaultQualityProfile();
    const matrix = getPolicyMatrix();
    const results = evaluateAllGates(request, profile, matrix);
    assert.strictEqual(results.length, 13);
    assert.ok(results.every((r) => r.gateId.startsWith("G-") && ["PASS", "FAIL", "WARN"].includes(r.status)));
  });

  it("G-01 PASS cuando hay context_references (perfil Standard)", () => {
    const request = loadValidRequest();
    const profile = getDefaultQualityProfile();
    const matrix = getPolicyMatrix();
    const results = evaluateAllGates(request, profile, matrix);
    const g01 = results.find((r) => r.gateId === "G-01");
    assert.ok(g01);
    assert.strictEqual(g01!.status, "PASS");
  });

  it("G-01 FAIL en strictMode sin context_references", () => {
    const request: InstructionRequest = {
      role: "Rol",
      task: "Tarea",
      specifications: ["S1"],
      acceptance_criteria: ["C1"],
      output_format: "text",
      execution_config: { strictMode: true },
    };
    const profile = getQualityProfile("Strict");
    const matrix = getPolicyMatrix();
    const results = evaluateAllGates(request, profile, matrix);
    const g01 = results.find((r) => r.gateId === "G-01");
    assert.ok(g01);
    assert.strictEqual(g01!.status, "FAIL");
  });

  it("G-02 PASS con specifications no vacío (Standard)", () => {
    const request = loadValidRequest();
    const profile = getDefaultQualityProfile();
    const matrix = getPolicyMatrix();
    const results = evaluateAllGates(request, profile, matrix);
    const g02 = results.find((r) => r.gateId === "G-02");
    assert.ok(g02);
    assert.strictEqual(g02!.status, "PASS");
  });

  it("G-02 FAIL en strictMode con specifications vacío", () => {
    const request: InstructionRequest = {
      role: "Rol",
      task: "Tarea",
      specifications: [],
      acceptance_criteria: ["C1"],
      output_format: "text",
      execution_config: { strictMode: true },
    };
    const profile = getQualityProfile("Strict");
    const matrix = getPolicyMatrix();
    const results = evaluateAllGates(request, profile, matrix);
    const g02 = results.find((r) => r.gateId === "G-02");
    assert.ok(g02);
    assert.strictEqual(g02!.status, "FAIL");
  });

  it("G-03 a G-10 devuelven WARN (not_implemented)", () => {
    const request = loadValidRequest();
    const profile = getDefaultQualityProfile();
    const matrix = getPolicyMatrix();
    const results = evaluateAllGates(request, profile, matrix);
    for (const id of ["G-03", "G-04", "G-05", "G-06", "G-07", "G-08", "G-09", "G-10"]) {
      const r = results.find((x) => x.gateId === id);
      assert.ok(r, `Falta ${id}`);
      assert.strictEqual(r!.status, "WARN");
      assert.ok(r!.message.includes("no implementado") || r!.message.includes("not_implemented"));
    }
  });

  it("G-11, G-12, G-13 implementados (PASS o WARN según criterios)", () => {
    const request = loadValidRequest();
    const profile = getDefaultQualityProfile();
    const matrix = getPolicyMatrix();
    const results = evaluateAllGates(request, profile, matrix);
    const g11 = results.find((r) => r.gateId === "G-11");
    const g12 = results.find((r) => r.gateId === "G-12");
    const g13 = results.find((r) => r.gateId === "G-13");
    assert.ok(g11 && g12 && g13);
    assert.ok(["PASS", "WARN"].includes(g11!.status));
    assert.strictEqual(g12!.status, "PASS");
    assert.strictEqual(g13!.status, "PASS");
  });
});
