export type AuditStandard = "ISO 9001" | "IATF 16949" | "VDA 6.3" | "ISO 17025" | "ISO 14001" | "ISO 45001";
export type AuditType = "Internal" | "External" | "Supplier" | "Process" | "System" | "Surveillance";
export type AuditStatus = "Planned" | "In Progress" | "Completed" | "Cancelled";
export type FindingSeverity = "Major NC" | "Minor NC" | "OFI" | "Observation";
export type FindingStatus = "Open" | "In Progress" | "Verification" | "Closed" | "Overdue";
export type CARStatus = "D1-Team" | "D2-Problem" | "D3-Containment" | "D4-RootCause" | "D5-Corrective" | "D6-Implementation" | "D7-Prevention" | "D8-Closure";

export interface AuditPlan {
  id: string;
  title: string;
  standard: AuditStandard;
  type: AuditType;
  status: AuditStatus;
  department: string;
  leadAuditor: string;
  auditTeam: string[];
  scheduledDate: string;
  endDate: string;
  scope: string;
  objectives: string[];
  checklistItems: ChecklistItem[];
  findings: string[];
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  clause: string;
  requirement: string;
  evidenceRequired: string;
  status: "Pending" | "Conforming" | "Non-Conforming" | "Not Applicable";
  notes: string;
  evidenceCollected: string;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  auditTitle: string;
  clause: string;
  severity: FindingSeverity;
  status: FindingStatus;
  description: string;
  evidence: string;
  rootCause: string;
  correctiveAction: string;
  responsiblePerson: string;
  targetDate: string;
  closureDate: string | null;
  verificationNotes: string;
  createdAt: string;
}

export interface CARReport {
  id: string;
  findingId: string;
  title: string;
  status: CARStatus;
  priority: "Critical" | "High" | "Medium" | "Low";
  d1Team: { leader: string; members: string[]; sponsor: string };
  d2Problem: { statement: string; isIs: string; isNot: string; impact: string };
  d3Containment: { actions: string[]; implementedDate: string | null; verification: string };
  d4RootCause: { ishikawa: IshikawaDiagram; fiveWhy: FiveWhy[]; rootCauses: string[] };
  d5Corrective: { actions: CorrectiveAction[] };
  d6Implementation: { plan: string; verificationMethod: string; completedDate: string | null };
  d7Prevention: { systemicActions: string[]; documentsUpdated: string[]; lessonsLearned: string };
  d8Closure: { closedDate: string | null; closedBy: string; effectiveness: string };
  createdAt: string;
}

export interface IshikawaDiagram {
  man: string[];
  machine: string[];
  material: string[];
  method: string[];
  measurement: string[];
  environment: string[];
}

export interface FiveWhy {
  level: number;
  question: string;
  answer: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  targetDate: string;
  status: "Planned" | "In Progress" | "Completed" | "Verified";
}
