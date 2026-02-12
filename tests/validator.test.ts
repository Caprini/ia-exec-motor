import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateInstructionRequest } from "../src/validator.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = join(__dirname, "fixtures");

describe("validateInstructionRequest", () => {
  it("acepta InstructionRequest válido (fixture)", () => {
    const raw = readFileSync(join(FIXTURES, "instruction-request-valid.json"), "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const result = validateInstructionRequest(parsed);
    assert.strictEqual(result.valid, true);
    assert.ok(result.request);
    assert.strictEqual(result.request!.role, "Ingeniero de Software Senior");
    assert.strictEqual(result.request!.task, "Implementar un servicio de validación de OTP");
    assert.strictEqual(result.request!.acceptance_criteria.length, 3);
  });

  it("rechaza InstructionRequest inválido (falta acceptance_criteria y output_format)", () => {
    const raw = readFileSync(join(FIXTURES, "instruction-request-invalid.json"), "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const result = validateInstructionRequest(parsed);
    assert.strictEqual(result.valid, false);
    assert.ok(Array.isArray(result.errors));
    assert.ok(result.errors!.length >= 1);
    assert.ok(
      result.errors!.some((e) => e.includes("acceptance_criteria") || e.includes("output_format")),
      "Debe mencionar campos faltantes"
    );
  });

  it("rechaza si input no es objeto", () => {
    const result = validateInstructionRequest(null);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors?.some((e) => e.includes("objeto")));

    const result2 = validateInstructionRequest("string");
    assert.strictEqual(result2.valid, false);
  });

  it("rechaza si role está vacío", () => {
    const result = validateInstructionRequest({
      role: "",
      task: "Algo",
      specifications: ["x"],
      acceptance_criteria: ["y"],
      output_format: "text",
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors?.some((e) => e.includes("role")));
  });

  it("rechaza si specifications no es array de strings", () => {
    const result = validateInstructionRequest({
      role: "Rol",
      task: "Tarea",
      specifications: [1, 2],
      acceptance_criteria: ["a"],
      output_format: "text",
    });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors?.some((e) => e.includes("specifications")));
  });
});
