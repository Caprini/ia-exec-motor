/**
 * Validador del schema InstructionRequest (doc 61).
 * Validación de integridad G-02: 5 campos obligatorios no nulos y tipos correctos.
 */
import type { InstructionRequest } from "./types.js";

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  request?: InstructionRequest;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isOutputFormat(v: unknown): boolean {
  return typeof v === "string" || (typeof v === "object" && v !== null && !Array.isArray(v));
}

export function validateInstructionRequest(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: ["El input debe ser un objeto JSON."] };
  }

  const o = input as Record<string, unknown>;

  if (!("role" in o) || !isNonEmptyString(o.role)) {
    errors.push("Campo obligatorio 'role' debe ser un string no vacío.");
  }
  if (!("task" in o) || !isNonEmptyString(o.task)) {
    errors.push("Campo obligatorio 'task' debe ser un string no vacío.");
  }
  if (!("specifications" in o) || !Array.isArray(o.specifications)) {
    errors.push("Campo obligatorio 'specifications' debe ser un array.");
  } else if (!isStringArray(o.specifications)) {
    errors.push("'specifications' debe ser un array de strings.");
  }
  if (!("acceptance_criteria" in o) || !Array.isArray(o.acceptance_criteria)) {
    errors.push("Campo obligatorio 'acceptance_criteria' debe ser un array.");
  } else if (!isStringArray(o.acceptance_criteria)) {
    errors.push("'acceptance_criteria' debe ser un array de strings.");
  }
  if (!("output_format" in o) || !isOutputFormat(o.output_format)) {
    errors.push("Campo obligatorio 'output_format' debe ser string u objeto.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const request: InstructionRequest = {
    role: o.role as string,
    task: o.task as string,
    specifications: o.specifications as string[],
    acceptance_criteria: o.acceptance_criteria as string[],
    output_format: o.output_format as string | Record<string, unknown>,
  };

  if (o.context_references !== undefined) {
    if (!Array.isArray(o.context_references) || !o.context_references.every((x) => typeof x === "string")) {
      errors.push("'context_references' debe ser un array de strings (URIs).");
    } else {
      request.context_references = o.context_references as string[];
    }
  }

  if (o.execution_config !== undefined) {
    if (typeof o.execution_config !== "object" || o.execution_config === null || Array.isArray(o.execution_config)) {
      errors.push("'execution_config' debe ser un objeto.");
    } else {
      const ec = o.execution_config as Record<string, unknown>;
      request.execution_config = {};
      if (typeof ec.strictMode === "boolean") request.execution_config.strictMode = ec.strictMode;
      if (ec.priority === "Team" || ec.priority === "Project" || ec.priority === "User") {
        request.execution_config.priority = ec.priority;
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, request };
}
