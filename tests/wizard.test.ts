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
  license: "MIT",
  author: "Test Author",
  codeowners: ["@Caprini"],
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
    assert.strictEqual(bp.generatedVersion, "0.5.6");
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
    assert.strictEqual(parsed.version, "0.2");
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
      ".cursorrules",
      "context/STACK.md",
      "context/DECISIONS.md",
      "context/CONSTRAINTS.md",
      "context/REQUIREMENTS.md",
      "context/INTERFACES.md",
      "docs/ARCHITECTURE.md",
      "docs/DECISIONS.md",
      "docs/QA.md",
      "docs/ONBOARDING.md",
      "LICENSE",
      "CODEOWNERS",
    ];
    for (const rel of required) {
      assert.ok(existsSync(join(outDir, rel)), `debe existir ${rel}`);
    }
  });

  it("genera .cursorrules, context/, docs extra, LICENSE y CODEOWNERS (v0.5.5)", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, outDir);
    const cursorrules = readFileSync(join(outDir, ".cursorrules"), "utf-8");
    const stackMd = readFileSync(join(outDir, "context", "STACK.md"), "utf-8");
    const decisionsMd = readFileSync(join(outDir, "context", "DECISIONS.md"), "utf-8");
    const codeowners = readFileSync(join(outDir, "CODEOWNERS"), "utf-8");
    const license = readFileSync(join(outDir, "LICENSE"), "utf-8");
    assert.ok(cursorrules.includes("Prompt Anatomy"), ".cursorrules debe incluir Prompt Anatomy");
    assert.ok(cursorrules.includes("Scope Guard"), ".cursorrules debe incluir Scope Guard");
    assert.ok(cursorrules.includes("SCOPE-01"), ".cursorrules debe incluir SCOPE-01");
    assert.ok(cursorrules.includes("No-regression"), ".cursorrules debe incluir No-regression");
    assert.ok(cursorrules.includes("Context anchoring"), ".cursorrules debe incluir Context anchoring");
    assert.ok(cursorrules.includes("Non-negotiables"), ".cursorrules debe incluir Non-negotiables");
    assert.ok(cursorrules.includes("**Standard**"), ".cursorrules debe incluir el perfil del blueprint (Standard)");
    assert.ok(stackMd.includes("node-ts"), "context/STACK.md debe mencionar el stack del blueprint");
    assert.ok(decisionsMd.includes("no editar historia"), "context/DECISIONS.md debe incluir regla no editar historia");
    assert.ok(decisionsMd.includes("Licencia MIT") || decisionsMd.includes("licencia MIT"), "context/DECISIONS.md debe incluir decisión licencia MIT");
    assert.ok(decisionsMd.includes("CODEOWNERS") && decisionsMd.includes("@Caprini"), "context/DECISIONS.md debe incluir owners CODEOWNERS del blueprint");
    assert.ok(codeowners.includes("@Caprini"), "CODEOWNERS debe contener @Caprini");
    assert.ok(license.includes("MIT License"), "LICENSE debe contener MIT License");
    assert.ok(license.includes("Test Author"), "LICENSE debe contener el author del blueprint");
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

  it("determinismo: mismos artefactos v0.5.5 en dos escrituras", () => {
    const tmp = makeTmpDir();
    const out1 = join(tmp, "a");
    const out2 = join(tmp, "b");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, out1);
    writeProject(bp, out2);
    const cursorrules1 = readFileSync(join(out1, ".cursorrules"), "utf-8");
    const cursorrules2 = readFileSync(join(out2, ".cursorrules"), "utf-8");
    const stack1 = readFileSync(join(out1, "context", "STACK.md"), "utf-8");
    const stack2 = readFileSync(join(out2, "context", "STACK.md"), "utf-8");
    assert.strictEqual(cursorrules1, cursorrules2);
    assert.strictEqual(stack1, stack2);
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

  it("genera ROADMAP con Definition of v1.0.0, Fuera de alcance y Stack decisions (v0.5.3)", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, outDir);
    const roadmap = readFileSync(join(outDir, "ROADMAP.md"), "utf-8");
    assert.ok(roadmap.includes("## Definition of v1.0.0"), "ROADMAP debe contener sección Definition of v1.0.0");
    assert.ok(roadmap.includes("mi-app-test") || roadmap.includes("App de prueba"), "ROADMAP debe incluir datos del blueprint");
    assert.ok(roadmap.includes("node-ts"), "ROADMAP debe referenciar el stack del blueprint");
    assert.ok(roadmap.includes("## Fuera de alcance"), "ROADMAP debe contener sección Fuera de alcance");
    assert.ok(roadmap.includes("No inventar dependencias") || roadmap.includes("no inventar dependencias"), "ROADMAP debe incluir límite de dependencias");
    assert.ok(roadmap.includes("## Stack decisions"), "ROADMAP debe contener sección Stack decisions");
  });

  it("ROADMAP incluye stack elegido para python y nextjs", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const bpPy = buildBlueprint({ ...FIXTURE_ANSWERS, stack: "python" });
    writeProject(bpPy, outDir);
    const roadmapPy = readFileSync(join(outDir, "ROADMAP.md"), "utf-8");
    assert.ok(roadmapPy.includes("python"));
    const bpNext = buildBlueprint({ ...FIXTURE_ANSWERS, stack: "nextjs" });
    const outDirNext = join(tmp, "dest-next");
    writeProject(bpNext, outDirNext);
    const roadmapNext = readFileSync(join(outDirNext, "ROADMAP.md"), "utf-8");
    assert.ok(roadmapNext.includes("nextjs"));
  });

  it("determinismo: dos buildBlueprint con mismas respuestas → mismo JSON", () => {
    const bp1 = buildBlueprint(FIXTURE_ANSWERS);
    const bp2 = buildBlueprint(FIXTURE_ANSWERS);
    const json1 = JSON.stringify(bp1);
    const json2 = JSON.stringify(bp2);
    assert.strictEqual(json1, json2);
  });

  it("determinismo: mismo conjunto de codeowners en distinto orden → mismo output (v0.5.6)", () => {
    const tmp = makeTmpDir();
    const outA = join(tmp, "a");
    const outB = join(tmp, "b");
    const answersA: WizardAnswers = { ...FIXTURE_ANSWERS, codeowners: ["@B", "@A"] };
    const answersB: WizardAnswers = { ...FIXTURE_ANSWERS, codeowners: ["@A", "@B"] };
    const bpA = buildBlueprint(answersA);
    const bpB = buildBlueprint(answersB);
    writeProject(bpA, outA);
    writeProject(bpB, outB);
    const projectJsonA = readFileSync(join(outA, "blueprint", "project.json"), "utf-8");
    const projectJsonB = readFileSync(join(outB, "blueprint", "project.json"), "utf-8");
    const codeownersA = readFileSync(join(outA, "CODEOWNERS"), "utf-8");
    const codeownersB = readFileSync(join(outB, "CODEOWNERS"), "utf-8");
    assert.strictEqual(projectJsonA, projectJsonB, "project.json debe ser idéntico con distinto orden de codeowners");
    assert.strictEqual(codeownersA, codeownersB, "CODEOWNERS debe ser idéntico con distinto orden de entrada");
    assert.ok(projectJsonA.includes('"@A"') && projectJsonA.includes('"@B"'));
    assert.ok(codeownersA.includes("* @A") && codeownersA.includes("* @B"));
  });

  it("license None → no genera LICENSE (v0.5.6)", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const answersNone: WizardAnswers = { ...FIXTURE_ANSWERS, license: "None", author: "" };
    const bp = buildBlueprint(answersNone);
    writeProject(bp, outDir);
    assert.ok(!existsSync(join(outDir, "LICENSE")), "No debe existir LICENSE cuando license es None");
  });

  it("codeowners vacío → no genera CODEOWNERS (v0.5.6)", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const answersEmpty: WizardAnswers = { ...FIXTURE_ANSWERS, codeowners: [] };
    const bp = buildBlueprint(answersEmpty);
    writeProject(bp, outDir);
    assert.ok(!existsSync(join(outDir, "CODEOWNERS")), "No debe existir CODEOWNERS cuando codeowners está vacío");
  });

  it("CODEOWNERS generado contiene entries del blueprint (v0.5.6)", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const answersMulti: WizardAnswers = { ...FIXTURE_ANSWERS, codeowners: ["@Caprini", "@Fabio"] };
    const bp = buildBlueprint(answersMulti);
    writeProject(bp, outDir);
    const codeowners = readFileSync(join(outDir, "CODEOWNERS"), "utf-8");
    assert.ok(codeowners.includes("* @Caprini"), "CODEOWNERS debe contener * @Caprini");
    assert.ok(codeowners.includes("* @Fabio"), "CODEOWNERS debe contener * @Fabio");
  });

  it("LICENSE generado contiene author del blueprint (v0.5.6)", () => {
    const tmp = makeTmpDir();
    const outDir = join(tmp, "dest");
    const bp = buildBlueprint(FIXTURE_ANSWERS);
    writeProject(bp, outDir);
    const license = readFileSync(join(outDir, "LICENSE"), "utf-8");
    assert.ok(license.includes("Test Author"), "LICENSE debe contener el author del blueprint");
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

  it("rechaza license inválido (v0.5.6)", () => {
    const bp = { ...buildBlueprint(FIXTURE_ANSWERS), license: "GPL" };
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors?.some((e) => e.includes("license")));
  });

  it("rechaza license !== None con author vacío (v0.5.6)", () => {
    const bp = { ...buildBlueprint(FIXTURE_ANSWERS), author: "   " };
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors?.some((e) => e.includes("author")));
  });

  it("rechaza codeowners sin @ (v0.5.6)", () => {
    const bp = { ...buildBlueprint(FIXTURE_ANSWERS), codeowners: ["Caprini", "@Fabio"] };
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors?.some((e) => e.includes("codeowners") && e.includes("@")));
  });

  it("rechaza codeowners entry vacío (v0.5.6)", () => {
    const bp = { ...buildBlueprint(FIXTURE_ANSWERS), codeowners: ["@Caprini", "  "] };
    const r = validateBlueprint(bp);
    assert.strictEqual(r.valid, false);
    assert.ok(r.errors?.some((e) => e.includes("codeowners") && e.includes("vacío")));
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
      license: "MIT" as const,
      author: "Flags Author",
      codeowners: ["@Caprini"],
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

  it("license None sin --author: no-interactivo, exit 0, no LICENSE (author condicional)", async () => {
    const opts = {
      projectName: "x",
      stack: "node-ts" as const,
      profile: "Standard" as const,
      desc: "x",
      visibility: "public" as const,
      license: "None" as const,
      codeowners: [] as string[],
    };
    const defaults = answersFromOptions(opts);
    assert.ok(defaults);
    assert.strictEqual(defaults.author, undefined);
    const answers = await runPrompt(defaults);
    assert.strictEqual(answers.projectName, "x");
    assert.strictEqual(answers.license, "None");
    assert.strictEqual(answers.author, "");
    const bp = buildBlueprint(answers);
    assert.strictEqual(bp.license, "None");
    assert.strictEqual(bp.author, "");
    const tmp = makeTmpDir();
    const outDir = join(tmp, "out");
    writeProject(bp, outDir);
    assert.ok(!existsSync(join(outDir, "LICENSE")), "No debe generarse LICENSE cuando license es None");
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
        license: "MIT",
        author: "Test",
        codeowners: ["@Caprini"],
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
        license: "MIT",
        author: "Test",
        codeowners: ["@Caprini"],
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
