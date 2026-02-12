/**
 * Policy Matrix (doc 63). Severidad efectiva por gate y perfil.
 */
import type { PolicyMatrixEntry, QualityProfileId } from "../types.js";

const GATE_IDS = ["G-01", "G-02", "G-03", "G-04", "G-05", "G-06", "G-07", "G-08", "G-09", "G-10", "G-11", "G-12", "G-13"] as const;
const PROFILES: QualityProfileId[] = ["Exploratory", "Standard", "Strict", "Production"];

// Severidad por (gateId, profileId) según tabla 63. Clave: "G-01|Strict"
const SEVERITY_MAP: Record<string, "ERROR" | "WARNING" | "INFO"> = {
  "G-01|Exploratory": "INFO", "G-01|Standard": "WARNING", "G-01|Strict": "ERROR", "G-01|Production": "ERROR",
  "G-02|Exploratory": "INFO", "G-02|Standard": "WARNING", "G-02|Strict": "ERROR", "G-02|Production": "ERROR",
  "G-03|Exploratory": "INFO", "G-03|Standard": "INFO", "G-03|Strict": "WARNING", "G-03|Production": "ERROR",
  "G-04|Exploratory": "WARNING", "G-04|Standard": "ERROR", "G-04|Strict": "ERROR", "G-04|Production": "ERROR",
  "G-05|Exploratory": "INFO", "G-05|Standard": "WARNING", "G-05|Strict": "ERROR", "G-05|Production": "ERROR",
  "G-06|Exploratory": "INFO", "G-06|Standard": "INFO", "G-06|Strict": "INFO", "G-06|Production": "WARNING",
  "G-07|Exploratory": "INFO", "G-07|Standard": "WARNING", "G-07|Strict": "ERROR", "G-07|Production": "ERROR",
  "G-08|Exploratory": "INFO", "G-08|Standard": "INFO", "G-08|Strict": "WARNING", "G-08|Production": "WARNING",
  "G-09|Exploratory": "INFO", "G-09|Standard": "WARNING", "G-09|Strict": "ERROR", "G-09|Production": "ERROR",
  "G-10|Exploratory": "INFO", "G-10|Standard": "WARNING", "G-10|Strict": "WARNING", "G-10|Production": "ERROR",
  "G-11|Exploratory": "INFO", "G-11|Standard": "WARNING", "G-11|Strict": "ERROR", "G-11|Production": "ERROR",
  "G-12|Exploratory": "INFO", "G-12|Standard": "WARNING", "G-12|Strict": "ERROR", "G-12|Production": "ERROR",
  "G-13|Exploratory": "WARNING", "G-13|Standard": "ERROR", "G-13|Strict": "ERROR", "G-13|Production": "ERROR",
};

function buildMatrix(): PolicyMatrixEntry[] {
  const entries: PolicyMatrixEntry[] = [];
  for (const gateId of GATE_IDS) {
    for (const profileId of PROFILES) {
      const key = `${gateId}|${profileId}`;
      const severity = SEVERITY_MAP[key] ?? "INFO";
      entries.push({
        gateId,
        profileId,
        severity,
        autoRemediation: severity === "INFO" || (severity === "WARNING" && profileId !== "Strict" && profileId !== "Production"),
        persistence: severity !== "ERROR" || profileId === "Exploratory" || profileId === "Standard",
        humanIntervention: (severity === "ERROR" && (profileId === "Strict" || profileId === "Production")) || (profileId === "Production" && gateId === "G-06"),
        snapshot: (gateId === "G-01" || gateId === "G-02" || gateId === "G-03" || gateId === "G-04" || gateId === "G-05" || gateId === "G-06" || gateId === "G-07" || gateId === "G-09" || gateId === "G-10" || gateId === "G-11" || gateId === "G-12" || gateId === "G-13") && (profileId === "Strict" || profileId === "Production"),
      });
    }
  }
  return entries;
}

let cached: PolicyMatrixEntry[] | null = null;

export function getPolicyMatrix(): PolicyMatrixEntry[] {
  if (!cached) cached = buildMatrix();
  return cached;
}

export function getSeverityForGateAndProfile(gateId: string, profileId: QualityProfileId): "ERROR" | "WARNING" | "INFO" {
  const key = `${gateId}|${profileId}`;
  return SEVERITY_MAP[key] ?? "INFO";
}
