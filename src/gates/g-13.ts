/**
 * G-13: Código listo para producción. En MVP no se valida despliegue (doc 63).
 */
import type { GateResult, QualityProfile } from "../types.js";
import { getSeverityForGateAndProfile } from "../config/policy-matrix.js";

export function evaluateG13(_request: unknown, profile: QualityProfile): GateResult {
  const severity = getSeverityForGateAndProfile("G-13", profile.id);
  return {
    gateId: "G-13",
    status: "PASS",
    severity,
    message: "Cumplimiento production no verificado en MVP.",
  };
}
