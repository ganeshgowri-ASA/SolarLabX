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

// ============================================================================
// LIMS Extended Types - Service Request Flow & Approval Workflow
// ============================================================================

export type ServiceRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'quote_sent'
  | 'quote_approved'
  | 'sample_received'
  | 'testing'
  | 'report_generation'
  | 'delivered'
  | 'cancelled'

export type ApprovalLevel = 'technician' | 'reviewer' | 'approver' | 'lab_manager'

export interface ServiceRequest {
  id: string
  requestNumber: string
  clientName: string
  clientEmail: string
  clientOrganization: string
  clientPhone: string
  testStandards: string[]
  moduleDetails: ModuleDetail[]
  specialRequirements: string
  requestedDeliveryDate: string
  status: ServiceRequestStatus
  priority: Priority
  quoteAmount: number | null
  quoteValidUntil: string | null
  quoteSentAt: string | null
  quoteApprovedAt: string | null
  assignedLabManager: string
  projectId: string | null
  sampleIds: string[]
  notes: string
  communicationLog: CommunicationEntry[]
  createdAt: string
  updatedAt: string
}

export interface ModuleDetail {
  manufacturer: string
  modelNumber: string
  quantity: number
  moduleType: string
  cellTechnology: string
  ratedPower: number
  dimensions: { length: number; width: number; thickness: number }
}

export interface CommunicationEntry {
  timestamp: string
  from: string
  to: string
  subject: string
  message: string
  type: 'email' | 'phone' | 'internal_note'
}

export interface ApprovalWorkflowEntry {
  id: string
  recordId: string
  recordType: 'service_request' | 'test_result' | 'report' | 'certificate'
  currentLevel: ApprovalLevel
  approvals: ApprovalStepEntry[]
  status: 'in_progress' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export interface ApprovalStepEntry {
  level: ApprovalLevel
  approverName: string
  approverId: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  digitalSignature: string | null
  comments: string
  timestamp: string | null
}

export interface BOMEntry {
  id: string
  sampleId: string
  component: string
  specification: string
  manufacturer: string
  partNumber: string
  quantity: number
  unit: string
  certificationRef: string
  verified: boolean
  verifiedBy: string | null
  verifiedAt: string | null
}

export interface ProjectSchedule {
  id: string
  projectId: string
  projectName: string
  clientName: string
  milestones: ScheduleMilestone[]
  startDate: string
  targetEndDate: string
  actualEndDate: string | null
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'delayed'
  overallProgress: number
}

export interface ScheduleMilestone {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  progress: number
  assignedTo: string
  dependencies: string[]
}

export interface AuditTrailEntry {
  id: string
  recordId: string
  recordType: string
  fieldName: string
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: string
  reason: string
  version: number
}

export interface LabCertificate {
  id: string
  certificateNumber: string
  projectId: string
  sampleId: string
  clientName: string
  testStandard: string
  issueDate: string
  validUntil: string
  accreditationBody: string
  accreditationNumber: string
  labName: string
  signatories: CertificateSignatory[]
  testResults: CertificateTestResult[]
  status: 'draft' | 'issued' | 'revoked'
  version: number
}

export interface CertificateSignatory {
  name: string
  title: string
  role: ApprovalLevel
  signedAt: string | null
  digitalSignature: string | null
}

export interface CertificateTestResult {
  testName: string
  standard: string
  clause: string
  result: 'pass' | 'fail' | 'conditional'
  value: string
  acceptanceCriteria: string
}

// ============================================================================
// RCA Types - Root Cause Analysis
// ============================================================================

export type RCAStatus =
  | 'initiated'
  | 'investigation'
  | 'root_cause_identified'
  | 'action_planning'
  | 'implementation'
  | 'verification'
  | 'closed'

export type RCASource = 'ncr' | 'test_failure' | 'customer_complaint' | 'audit_finding' | 'internal_observation' | 'management_review'

export interface RCA {
  id: string
  rcaNumber: string
  title: string
  description: string
  status: RCAStatus
  priority: Priority
  source: RCASource
  sourceRefId: string | null
  initiatedBy: string
  assignedTo: string
  teamMembers: string[]
  fiveWhys: FiveWhyEntry[]
  fishboneDiagram: FishboneData
  eightDReport: EightDReport
  capaIds: string[]
  linkedNCRs: string[]
  linkedComplaints: string[]
  attachments: string[]
  createdAt: string
  updatedAt: string
  closedAt: string | null
}

export interface FiveWhyEntry {
  level: number
  question: string
  answer: string
  evidence: string
  isRootCause: boolean
}

export interface FishboneData {
  problem: string
  categories: FishboneCategory[]
}

export interface FishboneCategory {
  name: string
  causes: FishboneCause[]
}

export interface FishboneCause {
  id: string
  text: string
  subCauses: string[]
  isContributing: boolean
}

export interface EightDReport {
  d1TeamFormation: { members: string[]; leader: string; sponsor: string }
  d2ProblemDescription: string
  d3InterimContainment: string
  d4RootCauseAnalysis: string
  d5CorrectiveActions: EightDAction[]
  d6Implementation: string
  d7PreventiveActions: EightDAction[]
  d8TeamRecognition: string
  status: ('pending' | 'in_progress' | 'completed')[]
}

export interface EightDAction {
  id: string
  description: string
  assignedTo: string
  targetDate: string
  completedDate: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'verified'
  verificationNotes: string
}

// ============================================================================
// Customer Complaints Types
// ============================================================================

export type ComplaintSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ComplaintStatus =
  | 'registered'
  | 'acknowledged'
  | 'under_investigation'
  | 'resolution_proposed'
  | 'resolution_accepted'
  | 'closed'
  | 'reopened'

export interface CustomerComplaint {
  id: string
  complaintNumber: string
  title: string
  description: string
  severity: ComplaintSeverity
  status: ComplaintStatus
  priority: Priority
  customerName: string
  customerEmail: string
  customerOrganization: string
  customerPhone: string
  relatedProjectId: string | null
  relatedSampleId: string | null
  relatedTestId: string | null
  category: string
  subcategory: string
  rcaId: string | null
  capaIds: string[]
  slaDeadline: string
  slaBreached: boolean
  investigationNotes: string
  resolution: string
  resolutionAcceptedBy: string | null
  resolutionAcceptedAt: string | null
  communicationLog: ComplaintCommunication[]
  timeline: ComplaintTimelineEntry[]
  assignedTo: string
  escalatedTo: string | null
  createdAt: string
  updatedAt: string
  closedAt: string | null
}

export interface ComplaintCommunication {
  id: string
  timestamp: string
  from: string
  to: string
  channel: 'email' | 'phone' | 'meeting' | 'portal'
  subject: string
  message: string
  attachments: string[]
}

export interface ComplaintTimelineEntry {
  timestamp: string
  action: string
  performedBy: string
  details: string
  status: ComplaintStatus
}

export interface ComplaintAnalytics {
  totalComplaints: number
  openComplaints: number
  avgResolutionDays: number
  slaComplianceRate: number
  byCategory: { category: string; count: number }[]
  bySeverity: { severity: string; count: number }[]
  byMonth: { month: string; opened: number; closed: number }[]
  topIssues: { issue: string; count: number; avgDays: number }[]
}
