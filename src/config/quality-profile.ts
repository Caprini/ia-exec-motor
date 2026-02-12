/**
 * Quality Profile (doc 62). Config interna; perfil por defecto = Standard.
 */
import type { QualityProfile, QualityProfileId } from "../types.js";

const PROFILES: Record<QualityProfileId, QualityProfile> = {
  Exploratory: { id: "Exploratory", strictMode: false, defaultSeverity: "INFO" },
  Standard: { id: "Standard", strictMode: false, defaultSeverity: "WARNING" },
  Strict: { id: "Strict", strictMode: true, defaultSeverity: "ERROR" },
  Production: { id: "Production", strictMode: true, defaultSeverity: "ERROR" },
};

export function getDefaultQualityProfile(): QualityProfile {
  return PROFILES.Standard;
}

export function getQualityProfile(id: QualityProfileId): QualityProfile {
  return PROFILES[id];
}
