/**
 * Tipos según docs/ai-motor/61 (InstructionRequest) y 60 (GateResult).
 */

export interface ExecutionConfig {
  strictMode?: boolean;
  priority?: "Team" | "Project" | "User";
}

export interface InstructionRequest {
  role: string;
  task: string;
  specifications: string[];
  acceptance_criteria: string[];
  output_format: string | Record<string, unknown>;
  context_references?: string[];
  execution_config?: ExecutionConfig;
}

export type GateStatus = "PASS" | "FAIL" | "WARN";
export type Severity = "ERROR" | "WARNING" | "INFO";

export interface GateResult {
  gateId: string;
  status: GateStatus;
  severity: Severity;
  message: string;
  findings?: string[];
  remediation?: string;
}

export type QualityProfileId = "Exploratory" | "Standard" | "Strict" | "Production";

export interface QualityProfile {
  id: QualityProfileId;
  strictMode: boolean;
  defaultSeverity: Severity;
}

export interface PolicyMatrixEntry {
  gateId: string;
  profileId: QualityProfileId;
  severity: Severity;
  autoRemediation: boolean;
  persistence: boolean;
  humanIntervention: boolean;
  snapshot: boolean;
}
