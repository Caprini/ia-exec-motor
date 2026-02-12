/**
 * G-12: Logging estructurado. En MVP no se inspecciona código; resultado fijo (doc 63).
 */
import type { GateResult, QualityProfile } from "../types.js";
import { getSeverityForGateAndProfile } from "../config/policy-matrix.js";

export function evaluateG12(_request: unknown, profile: QualityProfile): GateResult {
  const severity = getSeverityForGateAndProfile("G-12", profile.id);
  return {
    gateId: "G-12",
    status: "PASS",
    severity,
    message: "Logging estructurado no verificado en MVP (sin inspección de código).",
  };
}
