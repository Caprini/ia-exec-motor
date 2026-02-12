/**
 * G-11: No-regresión. En MVP no se ejecutan tests; se reporta como verificado
 * si hay criterios de aceptación que mencionen tests (doc 63).
 */
import type { GateResult, InstructionRequest, QualityProfile } from "../types.js";
import { getSeverityForGateAndProfile } from "../config/policy-matrix.js";

export function evaluateG11(request: InstructionRequest, profile: QualityProfile): GateResult {
  const severity = getSeverityForGateAndProfile("G-11", profile.id);
  const criteria = request.acceptance_criteria ?? [];
  const mentionsTests = criteria.some(
    (c) => typeof c === "string" && /test|regresión|no-regresión|TDD/i.test(c)
  );

  if (!mentionsTests && (profile.strictMode || profile.id === "Production")) {
    return {
      gateId: "G-11",
      status: "WARN",
      severity,
      message: "No se exige ejecución de tests en MVP; se recomienda criterio de no-regresión en acceptance_criteria.",
      findings: ["acceptance_criteria sin mención explícita a tests/regresión"],
      remediation: "Añadir criterios de aceptación que exijan tests de no-regresión.",
    };
  }

  return {
    gateId: "G-11",
    status: "PASS",
    severity,
    message: "Criterio de no-regresión referenciado en acceptance_criteria (MVP no ejecuta tests).",
  };
}
