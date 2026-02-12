import { describe, it } from "node:test";
import assert from "node:assert";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runRepoValidator } from "../src/repo-validator/index.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const FIXTURES = join(__dirname, "fixtures");
const REPO_VALID = join(FIXTURES, "repo-valid");
const REPO_INVALID = join(FIXTURES, "repo-invalid");

describe("runRepoValidator", () => {
  it("devuelve 5 resultados (RG-01 a RG-05)", () => {
    const results = runRepoValidator(REPO_VALID);
    assert.strictEqual(results.length, 5);
    assert.deepStrictEqual(
      results.map((r) => r.id).sort(),
      ["RG-01", "RG-02", "RG-03", "RG-04", "RG-05"]
    );
  });

  it("repo válido (fixture repo-valid): RG-01 a RG-05 PASS", () => {
    const results = runRepoValidator(REPO_VALID);
    for (const r of results) {
      assert.strictEqual(r.status, "PASS", `${r.id} debería ser PASS: ${r.message}`);
    }
  });

  it("repo inválido (fixture repo-invalid): RG-01 FAIL por directorios faltantes", () => {
    const results = runRepoValidator(REPO_INVALID);
    const rg01 = results.find((r) => r.id === "RG-01");
    assert.ok(rg01);
    assert.strictEqual(rg01!.status, "FAIL");
    assert.ok(rg01!.message.includes("directorios") || rg01!.message.includes("Faltan"));
  });

  it("repo inválido (fixture repo-invalid): RG-02 FAIL por archivos raíz faltantes", () => {
    const results = runRepoValidator(REPO_INVALID);
    const rg02 = results.find((r) => r.id === "RG-02");
    assert.ok(rg02);
    assert.strictEqual(rg02!.status, "FAIL");
    assert.ok(rg02!.message.includes("archivos") || rg02!.message.includes("Faltan"));
  });
});
