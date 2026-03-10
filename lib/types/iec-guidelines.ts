export type ChangeClassification = "Major" | "Minor" | "No Impact";
export type GuidelineStatus = "Draft" | "Active" | "Superseded";
export type TestSequenceGroup = "A" | "B" | "C" | "D" | "E";

export interface TestSequence {
  id: string;
  group: TestSequenceGroup;
  name: string;
  tests: TestInSequence[];
  standard: string;
  moduleTypes: string[];
  description: string;
}

export interface TestInSequence {
  id: string;
  mqtCode: string;
  name: string;
  order: number;
  duration: string;
  prerequisite: string | null;
  description: string;
}

export interface RetestRule {
  id: string;
  changeCategory: string;
  changeDescription: string;
  classification: ChangeClassification;
  affectedTests: string[];
  retestSequences: string[];
  rationale: string;
  iecReference: string;
}

export interface GuidelineWizardStep {
  id: number;
  title: string;
  description: string;
}

export interface BomComponent {
  id: string;
  category: string;
  name: string;
  specification: string;
  supplier: string;
  partNumber: string;
}

export interface BomChange {
  id: string;
  componentId: string;
  componentName: string;
  category: string;
  changeType: "Material" | "Supplier" | "Design" | "Process" | "Dimension";
  oldValue: string;
  newValue: string;
  classification: ChangeClassification;
  affectedTests: string[];
  retestRequired: boolean;
  status: "Pending" | "Approved" | "Rejected" | "In Review";
  submittedBy: string;
  submittedDate: string;
  reviewedBy: string | null;
  reviewedDate: string | null;
  notes: string;
  iecReference: string;
}

export interface TestPlan {
  id: string;
  name: string;
  projectId: string;
  standard: string;
  moduleType: string;
  status: "Draft" | "Approved" | "In Progress" | "Completed";
  createdBy: string;
  createdDate: string;
  approvedBy: string | null;
  approvedDate: string | null;
  sequences: TestPlanSequence[];
  totalDuration: string;
  sampleCount: number;
  notes: string;
}

export interface TestPlanSequence {
  id: string;
  sequenceGroup: TestSequenceGroup;
  sequenceName: string;
  tests: TestPlanTest[];
  assignedTo: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "In Progress" | "Completed";
  dependencies: string[];
}

export interface TestPlanTest {
  id: string;
  mqtCode: string;
  name: string;
  order: number;
  duration: string;
  equipment: string;
  assignedTo: string;
  status: "Pending" | "In Progress" | "Completed" | "Failed";
  result: string | null;
}
