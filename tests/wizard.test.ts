import { describe, it } from "node:test";
import assert from "node:assert";
import { mkdtempSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildBlueprint, writeProject, runWizard, runPrompt, answersFromOptions, validateBlueprint } from "../src/wizard/index.js";
import type { WizardAnswers } from "../src/wizard/types.js";
import { DEFAULT_GOVERNANCE_TOGGLES } from "../src/wizard/types.js";

const FIXTURE_ANSWERS: WizardAnswers = {
  projectName: "mi-app-test",
  description: "App de prueba generada por el wizard.",
  repoVisibility: "public",
  stack: "node-ts",
  qualityProfile: "Standard",
  governanceToggles: { ...DEFAULT_GOVERNANCE_TOGGLES },
};

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), "ia-exec-wizard-"));
}

describe("buildBlueprint", () => {
  it("genera blueprint con projectName, stack y governanceToggles", () => {
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    assert.strictEqual(bp.projectName, "mi-app-test");
    assert.strictEqual(bp.stack, "node-ts");
    assert.strictEqual(bp.qualityProfile, "Standard");
    assert.deepStrictEqual(bp.governanceToggles, FIXTURE_ANSWERS.governanceToggles);
    assert.strictEqual(bp.generatedBy, "ia-exec-motor");
    assert.strictEqual(bp.generatedVersion, "0.5.2");
  });

  it("Strict → strictMode true y toggles requireNoRegression/requireLogs activos", () => {
    const answersStrict: WizardAnswers = {
      ...FIXTURE_ANSWERS,
      qualityProfile: "Strict",
      governanceToggles: {
        ...DEFAULT_GOVERNANCE_TOGGLES,
        requireNoRegression: true,
        requireLogs: true,
      },
    };
    const bp = buildBlueprint(answersStrict);
    assert.strictEqual(bp.strictMode, true);
    assert.strictEqual(bp.governanceToggles.requireNoRegression, true);
    assert.strictEqual(bp.governanceToggles.requireLogs, true);
  });

  it("Production → strictMode true", () => {
    const answersProd: WizardAnswers = {
      ...FIXTURE_ANSWERS,
      qualityProfile: "Production",
    };
    const bp = buildBlueprint(answersProd);
    assert.strictEqual(bp.strictMode, true);
  });

  it("Standard → strictMode false", () => {
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    assert.strictEqual(bp.strictMode, false);
  });

  it("normaliza projectName a slug si no cumple formato", () => {
    const answers: WizardAnswers = {
      ...FIXTURE_ANSWERS,
      projectName: "Mi App 123",
    };
    const bp = buildBlueprint(answers);
    assert.strictEqual(bp.projectName, "mi-app-123");
  });
});

describe("writeProject", () => {
  it("crea blueprint/project.json válido en directorio destino", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, outDir);
    const path = join(outDir, "blueprint", "project.json");
    assert.ok(existsSync(path));
    const raw = readFileSync(path, "utf-8");
    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.projectName, "mi-app-test");
    assert.strictEqual(parsed.stack, "node-ts");
    assert.strictEqual(parsed.version, "0.1");
    assert.ok(parsed.governanceToggles);
  });

  it("genera todos los archivos mínimos", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, outDir);
    const required = [
      "blueprint/project.json",
      "docs/00_PROJECT_CHARTER.md",
      "ROADMAP.md",
      "CHECKLIST_QA.md",
      ".cursor/rules/20_PROJECT_BOOTSTRAP.mdc",
      "AGENTS.md",
      "README.md",
      ".gitignore",
      ".github/pull_request_template.md",
      ".github/ISSUE_TEMPLATE/config.yml",
      "CHANGELOG.md",
    ];
    for (const rel of required) {
      assert.ok(existsSync(join(outDir, rel)), `debe existir ${rel}`);
    }
  });

  it("determinismo: mismas respuestas → mismo project.json", () => {
    const tmp = makeTmpDir();
    const out1 = join(tmp, "a");
    const out2 = join(tmp, "b");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, out1);
    writeProject(bp, out2);
    const raw1 = readFileSync(join(out1, "blueprint", "project.json"), "utf-8");
    const raw2 = readFileSync(join(out2, "blueprint", "project.json"), "utf-8");
    assert.strictEqual(raw1, raw2);
  });

  it("genera .github templates y CHANGELOG (Repo Bootstrap)", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, outDir);
    const prTemplate = readFileSync(join(outDir, ".github", "pull_request_template.md"), "utf-8");
    const issueConfig = readFileSync(join(outDir, ".github", "ISSUE_TEMPLATE", "config.yml"), "utf-8");
    const changelog = readFileSync(join(outDir, "CHANGELOG.md"), "utf-8");
    assert.ok(prTemplate.includes("Checklist QA"));
    assert.ok(prTemplate.includes("CHECKLIST_QA.md"));
    assert.ok(issueConfig.includes("blank_issues_enabled: false"));
    assert.ok(changelog.includes("[0.1.0]"));
    assert.ok(changelog.includes("mi-app-test"));
    assert.ok(changelog.includes("App de prueba"));
  });

  it("determinismo: dos buildBlueprint con mismas respuestas → mismo JSON", () => {
    const bp1 = buildBlueprint(FIXTURE_ANSWERS);
    const bp2 = buildBlueprint(FIXTURE_ANSWERS);
    const json1 = JSON.stringify(bp1);
    const json2 = JSON.stringify(bp2);
    assert.strictEqual(json1, json2);
  });
});

describe("validateBlueprint", () => {
  it("acepta blueprint válido", () => {
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, true);
    assert.strictEqual(r.errors?.length ?? 0, 0);
  });

  it("rechaza stack inválido", () => {
    const bp = { ...buildBlueprint(FIXTURE_ANSWERS), stack: "java" };
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors?.some((e) => e.includes("stack")));
  });

  it("rechaza projectName vacío", () => {
    const bp = { ...buildBlueprint(FIXTURE_ANSWERS), projectName: "" };
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors?.some((e) => e.includes("projectName")));
  });

  it("rechaza projectName que no es slug", () => {
    const bp = { ...buildBlueprint(FIXTURE_ANSWERS), projectName: "Mi App!" };
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors?.some((e) => e.includes("slug") || e.includes("projectName")));
  });

  it("rechaza input no objeto", () => {
    assert.strictEqual(validateBlueprint(null).valid, false);
    assert.strictEqual(validateBlueprint("x").valid, false);
    assert.strictEqual(validateBlueprint([]).valid, false);
  });
});

describe("answersFromOptions + runPrompt (modo no-interactivo)", () => {
  it("con todos los flags devuelve answers sin pedir input", async () => {
    const opts = {
      projectName: "demo-flags",
      stack: "nextjs" as const,
      profile: "Strict" as const,
      desc: "Proyecto con flags",
      visibility: "private" as const,
    };
    const defaults = answersFromOptions(opts);
    assert.ok(defaults);
    const answers = await runPrompt(defaults);
    assert.strictEqual(answers.projectName, "demo-flags");
    assert.strictEqual(answers.stack, "nextjs");
    assert.strictEqual(answers.qualityProfile, "Strict");
    assert.strictEqual(answers.description, "Proyecto con flags");
    assert.strictEqual(answers.repoVisibility, "private");
    const bp = buildBlueprint(answers);
    assert.strictEqual(bp.projectName, "demo-flags");
    assert.strictEqual(bp.stack, "nextjs");
  });
});

describe("runWizard colisión", () => {
  it("sin --force aborta si carpeta destino existe", async () => {
    const tmp = makeTmpDir();
    const parent = join(tmp, "parent");
    mkdirSync(parent, { recursive: true });
    const outDirFromWizard = join(tmp, "demo-collision");
    mkdirSync(outDirFromWizard, { recursive: true });
    const originalCwd = process.cwd();
    try {
      process.chdir(parent);
      const code = await runWizard({
        projectName: "demo-collision",
        stack: "node-ts",
        profile: "Standard",
        desc: "x",
        visibility: "public",
      });
      assert.strictEqual(code, 1);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("con --force sobrescribe y termina con exit 0", async () => {
    const tmp = makeTmpDir();
    const parent = join(tmp, "parent");
    const outDirFromWizard = join(tmp, "demo-force");
    mkdirSync(parent, { recursive: true });
    mkdirSync(outDirFromWizard, { recursive: true });
    const originalCwd = process.cwd();
    try {
      process.chdir(parent);
      const code = await runWizard({
        projectName: "demo-force",
        stack: "node-ts",
        profile: "Standard",
        desc: "y",
        visibility: "public",
        force: true,
      });
      assert.strictEqual(code, 0);
      const projectJson = join(outDirFromWizard, "blueprint", "project.json");
      assert.ok(existsSync(projectJson));
      const raw = readFileSync(projectJson, "utf-8");
      const parsed = JSON.parse(raw);
      assert.strictEqual(parsed.projectName, "demo-force");
      assert.strictEqual(parsed.description, "y");
    } finally {
      process.chdir(originalCwd);
    }
  });
});
