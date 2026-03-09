// ============================================================================
// LIMS Types - Ported from test-protocols SQLAlchemy models
// ============================================================================

export type SampleStatus =
  | 'received'
  | 'inspected'
  | 'allocated'
  | 'assigned'
  | 'in_test'
  | 'pending_review'
  | 'completed'
  | 'analyzed'
  | 'reported'
  | 'rejected'
  | 'on_hold'

export type TestStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending_review'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type EquipmentStatus =
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'calibration_due'
  | 'out_of_service'

export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export type UserRole = 'admin' | 'lab_manager' | 'technician' | 'auditor'

// Sample
export interface Sample {
  id: string
  sampleId: string
  projectId: string
  clientName: string
  clientEmail: string
  clientOrganization: string
  sampleType: string
  manufacturer: string
  modelNumber: string
  serialNumber: string
  batchNumber: string
  lengthMm: number | null
  widthMm: number | null
  thicknessMm: number | null
  weightKg: number | null
  status: SampleStatus
  currentLocation: string
  storageLocation: string
  testStandard: string
  priority: Priority
  assignedProtocolIds: string[]
  testsCompleted: number
  testsTotal: number
  overallResult: string | null
  notes: string
  custodyHistory: CustodyEntry[]
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface CustodyEntry {
  timestamp: string
  fromLocation: string
  toLocation: string
  handledBy: string
  action: string
  notes: string
}

// Test Execution
export interface TestExecution {
  id: string
  executionNumber: string
  sampleId: string
  protocolId: string
  protocolName: string
  standardReference: string
  status: TestStatus
  technicianId: string
  technicianName: string
  reviewerId: string | null
  inputData: Record<string, unknown>
  rawData: Record<string, unknown>
  processedData: Record<string, unknown>
  results: Record<string, unknown>
  testPassed: boolean | null
  failureMode: string | null
  remarks: string
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

// Equipment
export interface Equipment {
  id: string
  equipmentCode: string
  name: string
  category: string
  manufacturer: string
  model: string
  serialNumber: string
  status: EquipmentStatus
  location: string
  lastCalibrationDate: string | null
  nextCalibrationDate: string | null
  calibrationCertificate: string
  lastMaintenanceDate: string | null
  nextMaintenanceDate: string | null
  maintenanceNotes: string
  specifications: Record<string, unknown>
  protocolsSupported: string[]
  calibrationHistory: CalibrationRecord[]
  createdAt: string
  updatedAt: string
}

export interface CalibrationRecord {
  id: string
  date: string
  performedBy: string
  certificateNumber: string
  result: 'pass' | 'fail' | 'conditional'
  nextDueDate: string
  notes: string
  parameters: Record<string, unknown>
}

// ============================================================================
// QMS Types
// ============================================================================

export type DocumentCategory =
  | 'procedure'
  | 'work_instruction'
  | 'form'
  | 'record'
  | 'specification'
  | 'certificate'
  | 'report'
  | 'manual'
  | 'policy'

export type DocumentStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'superseded'
  | 'obsolete'

export type CAPAStatus =
  | 'open'
  | 'investigation'
  | 'root_cause_identified'
  | 'corrective_action_planned'
  | 'corrective_action_implemented'
  | 'effectiveness_review'
  | 'closed'
  | 'verified'

export type CAPAType = 'corrective' | 'preventive' | 'improvement'

export interface QMSDocument {
  id: string
  documentNumber: string
  title: string
  category: DocumentCategory
  status: DocumentStatus
  version: string
  revision: number
  author: string
  reviewer: string | null
  approver: string | null
  effectiveDate: string | null
  expiryDate: string | null
  department: string
  standardReference: string
  content: string
  changeLog: DocumentChangeEntry[]
  approvalHistory: ApprovalEntry[]
  createdAt: string
  updatedAt: string
}

export interface DocumentChangeEntry {
  version: string
  date: string
  author: string
  description: string
}

export interface ApprovalEntry {
  step: string
  approver: string
  status: 'pending' | 'approved' | 'rejected'
  date: string | null
  comments: string
}

export interface CAPA {
  id: string
  capaNumber: string
  title: string
  type: CAPAType
  status: CAPAStatus
  priority: Priority
  source: string
  description: string
  rootCauseAnalysis: string
  correctiveAction: string
  preventiveAction: string
  targetCompletionDate: string
  actualCompletionDate: string | null
  assignedTo: string
  verifiedBy: string | null
  effectivenessReview: string
  relatedDocuments: string[]
  eightDSteps: EightDStep[]
  createdAt: string
  updatedAt: string
}

export interface EightDStep {
  step: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  assignedTo: string
  completedAt: string | null
  notes: string
}

// ============================================================================
// Test Protocol Template Types
// ============================================================================

export interface TestParameter {
  name: string
  label: string
  type: 'number' | 'text' | 'boolean' | 'select' | 'range'
  unit: string
  required: boolean
  defaultValue: unknown
  min?: number
  max?: number
  step?: number
  options?: string[]
  description: string
}

export interface AcceptanceCriterion {
  parameter: string
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'between' | 'max_degradation'
  value: number | [number, number]
  unit: string
  description: string
}

export interface TestTemplate {
  id: string
  name: string
  standard: string
  clause: string
  category: string
  description: string
  estimatedDurationHours: number
  requiredEquipment: string[]
  prerequisites: string[]
  inputParameters: TestParameter[]
  acceptanceCriteria: AcceptanceCriterion[]
  testSequence: TestSequenceStep[]
}

export interface TestSequenceStep {
  step: number
  name: string
  description: string
  duration: string
  parameters: Record<string, unknown>
}

// Compliance
export interface ComplianceRequirement {
  id: string
  standard: string
  clause: string
  requirement: string
  category: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable'
  evidence: string
  notes: string
  lastAssessedDate: string | null
}
