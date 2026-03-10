export type SafetyTestType =
  | "Insulation Resistance"
  | "Wet Leakage Current"
  | "Dielectric Withstand"
  | "Ground Continuity"
  | "Impulse Voltage";

export type SafetyTestStatus = "Pending" | "In Progress" | "Pass" | "Fail" | "Conditional";

export type SafetyClass = "Class 0" | "Class II" | "Class III";

export interface ElectricalSafetyProject {
  id: string;
  projectId: string;
  projectName: string;
  sampleId: string;
  moduleName: string;
  standard: string;
  safetyClass: SafetyClass;
  status: "Draft" | "In Progress" | "Completed" | "On Hold";
  assignedTo: string;
  createdDate: string;
  completedDate: string | null;
  tests: SafetyTest[];
  certificateNumber: string | null;
}

export interface SafetyTest {
  id: string;
  type: SafetyTestType;
  standard: string;
  clause: string;
  sequence: number;
  status: SafetyTestStatus;
  equipment: string;
  equipmentId: string;
  calibrationValid: boolean;
  parameters: SafetyTestParameters;
  results: SafetyTestResult | null;
  checklist: SafetyChecklistItem[];
  startedAt: string | null;
  completedAt: string | null;
  technician: string | null;
  notes: string;
}

export interface SafetyTestParameters {
  testVoltage?: number;
  testDuration?: number;
  leakageLimit?: number;
  resistanceLimit?: number;
  impulseVoltage?: number;
  impulseCount?: number;
  wettingAgent?: string;
  surfaceArea?: number;
  appliedCurrent?: number;
  contactResistanceLimit?: number;
}

export interface SafetyTestResult {
  measured: number;
  unit: string;
  limit: number;
  passFail: "Pass" | "Fail";
  uncertainty: number;
  timestamp: string;
  ambientTemp: number;
  ambientHumidity: number;
}

export interface SafetyChecklistItem {
  id: string;
  step: number;
  description: string;
  completed: boolean;
  critical: boolean;
}

export interface SafetyEquipment {
  id: string;
  name: string;
  type: SafetyTestType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  calibrationDate: string;
  calibrationDue: string;
  calibrationStatus: "Valid" | "Due Soon" | "Overdue";
  certificateNumber: string;
}
