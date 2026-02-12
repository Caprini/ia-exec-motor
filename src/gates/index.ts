/**
 * Evaluador de todos los gates. G-01, G-02, G-11, G-12, G-13 implementados;
 * resto stub (not_implemented).
 */
import type { GateResult, InstructionRequest, QualityProfile } from "../types.js";
import type { PolicyMatrixEntry } from "../types.js";
import { evaluateG01 } from "./g-01.js";
import { evaluateG02 } from "./g-02.js";
import { evaluateG11 } from "./g-11.js";
import { evaluateG12 } from "./g-12.js";
import { evaluateG13 } from "./g-13.js";
import { evaluateStub } from "./stub.js";

const ALL_GATE_IDS = ["G-01", "G-02", "G-03", "G-04", "G-05", "G-06", "G-07", "G-08", "G-09", "G-10", "G-11", "G-12", "G-13"];

export function evaluateAllGates(
  request: InstructionRequest,
  profile: QualityProfile,
  _matrix: PolicyMatrixEntry[]
): GateResult[] {
  const results: GateResult[] = [];

  for (const gateId of ALL_GATE_IDS) {
    if (gateId === "G-01") results.push(evaluateG01(request, profile));
    else if (gateId === "G-02") results.push(evaluateG02(request, profile));
    else if (gateId === "G-11") results.push(evaluateG11(request, profile));
    else if (gateId === "G-12") results.push(evaluateG12(request, profile));
    else if (gateId === "G-13") results.push(evaluateG13(request, profile));
    else results.push(evaluateStub(gateId, request, profile));
  }

  return results;
}
