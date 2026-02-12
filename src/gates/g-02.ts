/**
 * G-02: Determinismo estructural. Anatomía del prompt: 5 campos obligatorios;
 * en strictMode, specifications no puede estar vacío (doc 61, 63).
 */
import type { GateResult, InstructionRequest, QualityProfile } from "../types.js";
import { getSeverityForGateAndProfile } from "../config/policy-matrix.js";

export function evaluateG02(request: InstructionRequest, profile: QualityProfile): GateResult {
  const severity = getSeverityForGateAndProfile("G-02", profile.id);
  const strictMode = request.execution_config?.strictMode ?? profile.strictMode;
  const specs = request.specifications;

  if (strictMode && (!Array.isArray(specs) || specs.length === 0)) {
    return {
      gateId: "G-02",
      status: "FAIL",
      severity,
      message: "En modo estricto specifications no puede estar vacío.",
      findings: ["specifications vacío"],
      remediation: "Añadir al menos una especificación técnica.",
    };
  }

  return {
    gateId: "G-02",
    status: "PASS",
    severity,
    message: "Anatomía del prompt cumplida.",
  };
}
