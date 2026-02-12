/**
 * G-01: Validación de anclaje. Si strictMode y tarea de alta complejidad,
 * context_references no debe ser vacío (doc 61, 63).
 */
import type { GateResult, InstructionRequest, QualityProfile } from "../types.js";
import { getSeverityForGateAndProfile } from "../config/policy-matrix.js";

export function evaluateG01(request: InstructionRequest, profile: QualityProfile): GateResult {
  const severity = getSeverityForGateAndProfile("G-01", profile.id);
  const strictMode = request.execution_config?.strictMode ?? profile.strictMode;
  const refs = request.context_references;
  const hasContext = Array.isArray(refs) && refs.length > 0;

  if (strictMode && !hasContext) {
    return {
      gateId: "G-01",
      status: "FAIL",
      severity,
      message: "En modo estricto se exige al menos una referencia de contexto (context_references).",
      findings: ["context_references ausente o vacío"],
      remediation: "Añadir URIs a fuentes de verdad en context_references.",
    };
  }

  return {
    gateId: "G-01",
    status: "PASS",
    severity,
    message: "Contexto de anclaje presente o no requerido.",
  };
}
