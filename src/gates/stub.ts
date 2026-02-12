/**
 * Stub para gates no implementados (G-03 a G-10). Devuelve not_implemented.
 * status se mapea a WARN para mantener contrato GateResult.
 */
import type { GateResult, QualityProfile } from "../types.js";
import { getSeverityForGateAndProfile } from "../config/policy-matrix.js";

export function evaluateStub(gateId: string, _request: unknown, profile: QualityProfile): GateResult {
  const severity = getSeverityForGateAndProfile(gateId, profile.id);
  return {
    gateId,
    status: "WARN",
    severity,
    message: `Gate ${gateId} no implementado en MVP (not_implemented).`,
    findings: ["Evaluación no disponible"],
    remediation: "Implementar evaluador cuando se requiera.",
  };
}
