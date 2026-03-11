// Test Flow Data - Mock data for integrated test data flow system

export type FlowStage =
  | 'service_request'
  | 'incoming_inspection'
  | 'equipment_assignment'
  | 'test_execution'
  | 'raw_data'
  | 'master_db'
  | 'protocol_form'
  | 'review_approval'
  | 'test_report'

export type FlowStatus = 'pending' | 'active' | 'complete' | 'failed'
export type ApprovalStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'report_generated'

export interface ServiceRequest {
  id: string
  requestNo: string
  customerName: string
  customerContact: string
  customerEmail: string
  moduleManufacturer: string
  moduleModel: string
  modulePower: number
  quantity: number
  testStandard: string[]
  testScope: string[]
  receivedDate: string
  requiredDate: string
  status: FlowStatus
  currentStage: FlowStage
  approvalStatus: ApprovalStatus
}

export interface SampleRegistration {
  id: string
  moduleId: string
  barcode: string
  serviceRequestId: string
  location: string
  rack: string
  status: string
  receivedDate: string
  incomingCondition: string
}

export interface IncomingInspectionItem {
  id: string
  category: string
  checkItem: string
  result: 'pass' | 'fail' | 'na' | 'pending'
  notes: string
}

export interface IVMeasurement {
  id: string
  moduleId: string
  testStage: 'Pre' | 'Post'
  testType: string
  measurementDate: string
  equipmentId: string
  operator: string
  pmax: number
  isc: number
  voc: number
  ff: number
  imp: number
  vmp: number
  irradiance: number
  temperature: number
  rawFileRef: string
  isSelected: boolean
}

export interface Equipment {
  id: string
  name: string
  type: string
  location: string
  status: 'available' | 'in_use' | 'maintenance' | 'calibration'
  lastCalDate: string
  nextCalDate: string
  calibrationStatus: 'valid' | 'due_soon' | 'overdue'
  currentTest: string | null
  operator: string | null
  totalTests: number
}

export interface IEC61215SequenceStep {
  id: string
  stepNo: number
  name: string
  type: 'test' | 'characterization' | 'initial' | 'final'
  duration: string
  status: FlowStatus
  startDate: string | null
  endDate: string | null
  pmaxBefore: number | null
  pmaxAfter: number | null
  deltaPercent: number | null
  equipmentId: string | null
  iecLimit: number
}

export interface ApprovalRecord {
  id: string
  serviceRequestId: string
  moduleId: string
  reportTitle: string
  submittedBy: string
  submittedDate: string
  status: ApprovalStatus
  engineerApproval: { name: string; date: string; status: string; comments: string } | null
  techManagerApproval: { name: string; date: string; status: string; comments: string } | null
  qualityApproval: { name: string; date: string; status: string; comments: string } | null
  reportGeneratedDate: string | null
}

export interface KPIData {
  equipmentUtilization: { name: string; testsThisMonth: number; totalCapacity: number }[]
  operatorPerformance: { name: string; measurements: number; errorRate: number }[]
  tatData: { week: string; avgDays: number; target: number }[]
  environmentalCompliance: { month: string; compliance: number; target: number }[]
  sampleThroughput: { week: string; modulesIn: number; modulesOut: number }[]
}

// --- Mock Data ---

export const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'SR001',
    requestNo: 'SR-2026-001',
    customerName: 'Adani Solar Pvt Ltd',
    customerContact: 'Rahul Sharma',
    customerEmail: 'rsharma@adanisolar.com',
    moduleManufacturer: 'Adani Solar',
    moduleModel: 'AS-M672-BF-420W',
    modulePower: 420,
    quantity: 6,
    testStandard: ['IEC 61215-1:2021', 'IEC 61730-1:2023'],
    testScope: ['TC200', 'TC400', 'HF10', 'DH1000', 'UV', 'MST', 'EL'],
    receivedDate: '2026-02-10',
    requiredDate: '2026-04-15',
    status: 'active',
    currentStage: 'test_execution',
    approvalStatus: 'under_review',
  },
  {
    id: 'SR002',
    requestNo: 'SR-2026-002',
    customerName: 'Waaree Energies Ltd',
    customerContact: 'Priya Nair',
    customerEmail: 'pnair@waaree.com',
    moduleManufacturer: 'Waaree',
    moduleModel: 'WS-440M-HM',
    modulePower: 440,
    quantity: 4,
    testStandard: ['IEC 61215-1:2021'],
    testScope: ['TC200', 'HF10', 'DH1000'],
    receivedDate: '2026-02-20',
    requiredDate: '2026-04-30',
    status: 'active',
    currentStage: 'incoming_inspection',
    approvalStatus: 'draft',
  },
  {
    id: 'SR003',
    requestNo: 'SR-2026-003',
    customerName: 'Tata Power Solar',
    customerContact: 'Ankit Mehta',
    customerEmail: 'amehta@tatapowersolar.com',
    moduleManufacturer: 'Tata Power Solar',
    moduleModel: 'TPSSL-500BiH',
    modulePower: 500,
    quantity: 8,
    testStandard: ['IEC 61215-1:2021', 'IEC 61730-1:2023', 'IEC 61853-1'],
    testScope: ['TC200', 'TC400', 'HF10', 'DH1000', 'DH2000', 'UV', 'EL', 'Insulation'],
    receivedDate: '2026-01-15',
    requiredDate: '2026-03-30',
    status: 'complete',
    currentStage: 'test_report',
    approvalStatus: 'report_generated',
  },
]

export const mockSamples: SampleRegistration[] = [
  { id: 'S001', moduleId: 'MOD-2026-001-A', barcode: 'SLX2026001A', serviceRequestId: 'SR001', location: 'Climate Chamber C1', rack: 'Rack-1', status: 'In Test (TC200)', receivedDate: '2026-02-10', incomingCondition: 'Good' },
  { id: 'S002', moduleId: 'MOD-2026-001-B', barcode: 'SLX2026001B', serviceRequestId: 'SR001', location: 'Climate Chamber C1', rack: 'Rack-2', status: 'In Test (TC200)', receivedDate: '2026-02-10', incomingCondition: 'Good' },
  { id: 'S003', moduleId: 'MOD-2026-001-C', barcode: 'SLX2026001C', serviceRequestId: 'SR001', location: 'IV Measurement Station', rack: 'Station-1', status: 'Characterization', receivedDate: '2026-02-10', incomingCondition: 'Good' },
  { id: 'S004', moduleId: 'MOD-2026-001-D', barcode: 'SLX2026001D', serviceRequestId: 'SR001', location: 'Storage Room A', rack: 'Shelf-3', status: 'Awaiting Test', receivedDate: '2026-02-10', incomingCondition: 'Minor scratch on frame' },
  { id: 'S005', moduleId: 'MOD-2026-002-A', barcode: 'SLX2026002A', serviceRequestId: 'SR002', location: 'Incoming Inspection Area', rack: 'Table-1', status: 'Incoming Inspection', receivedDate: '2026-02-20', incomingCondition: 'Good' },
]

export const mockIncomingInspection: IncomingInspectionItem[] = [
  { id: 'II001', category: 'Visual', checkItem: 'Glass surface - No cracks, chips, or breakage', result: 'pass', notes: '' },
  { id: 'II002', category: 'Visual', checkItem: 'Frame - No deformation, corrosion, or damage', result: 'pass', notes: '' },
  { id: 'II003', category: 'Visual', checkItem: 'Backsheet - No delamination, bubbles, or tears', result: 'pass', notes: '' },
  { id: 'II004', category: 'Visual', checkItem: 'Junction box - Properly sealed, no damage', result: 'pass', notes: '' },
  { id: 'II005', category: 'Visual', checkItem: 'Cables and connectors - No damage, proper crimping', result: 'pass', notes: '' },
  { id: 'II006', category: 'Dimensional', checkItem: 'Module dimensions - Within ±2mm of spec', result: 'pass', notes: '2108 x 1048 mm ✓' },
  { id: 'II007', category: 'Dimensional', checkItem: 'Weight - Within ±0.5 kg of spec', result: 'pass', notes: '23.5 kg ✓' },
  { id: 'II008', category: 'Labeling', checkItem: 'Rating label present and legible', result: 'pass', notes: '' },
  { id: 'II009', category: 'Labeling', checkItem: 'Safety symbols present', result: 'pass', notes: '' },
  { id: 'II010', category: 'Labeling', checkItem: 'Manufacturer and model info correct', result: 'pass', notes: '' },
  { id: 'II011', category: 'Electrical', checkItem: 'Open circuit voltage (spot check) - Within 5% of STC Voc', result: 'pass', notes: 'Measured 49.2V, Spec: 49.5V' },
  { id: 'II012', category: 'Documentation', checkItem: 'Datasheet provided', result: 'pass', notes: '' },
  { id: 'II013', category: 'Documentation', checkItem: 'Packing list matches received quantity', result: 'pass', notes: '6 modules received ✓' },
]

export const mockIVMeasurements: IVMeasurement[] = [
  // Module A - Initial + TC200 stages
  { id: 'IV001', moduleId: 'MOD-2026-001-A', testStage: 'Pre', testType: 'Initial Char', measurementDate: '2026-02-12', equipmentId: 'EQ-SS-001', operator: 'Ravi Kumar', pmax: 421.5, isc: 10.82, voc: 49.6, ff: 78.5, imp: 10.21, vmp: 41.3, irradiance: 1000, temperature: 25.1, rawFileRef: 'RAW/IV_MOD001A_IC_20260212.csv', isSelected: true },
  { id: 'IV002', moduleId: 'MOD-2026-001-A', testStage: 'Post', testType: 'TC200', measurementDate: '2026-02-20', equipmentId: 'EQ-SS-001', operator: 'Ravi Kumar', pmax: 418.8, isc: 10.79, voc: 49.4, ff: 78.2, imp: 10.18, vmp: 41.1, irradiance: 1000, temperature: 25.0, rawFileRef: 'RAW/IV_MOD001A_TC200_20260220.csv', isSelected: true },
  { id: 'IV003', moduleId: 'MOD-2026-001-A', testStage: 'Post', testType: 'TC400', measurementDate: '2026-03-01', equipmentId: 'EQ-SS-001', operator: 'Priya Singh', pmax: 416.2, isc: 10.76, voc: 49.2, ff: 77.9, imp: 10.15, vmp: 41.0, irradiance: 1000, temperature: 25.2, rawFileRef: 'RAW/IV_MOD001A_TC400_20260301.csv', isSelected: true },
  { id: 'IV004', moduleId: 'MOD-2026-001-A', testStage: 'Post', testType: 'HF10', measurementDate: '2026-03-05', equipmentId: 'EQ-SS-001', operator: 'Ravi Kumar', pmax: 419.1, isc: 10.80, voc: 49.5, ff: 78.1, imp: 10.19, vmp: 41.2, irradiance: 1000, temperature: 25.0, rawFileRef: 'RAW/IV_MOD001A_HF10_20260305.csv', isSelected: true },
  { id: 'IV005', moduleId: 'MOD-2026-001-A', testStage: 'Post', testType: 'DH1000', measurementDate: '2026-03-10', equipmentId: 'EQ-SS-001', operator: 'Anita Rao', pmax: 415.0, isc: 10.74, voc: 49.1, ff: 77.7, imp: 10.13, vmp: 41.0, irradiance: 1000, temperature: 25.1, rawFileRef: 'RAW/IV_MOD001A_DH1000_20260310.csv', isSelected: true },
  // Module B - Initial + TC200 stages
  { id: 'IV006', moduleId: 'MOD-2026-001-B', testStage: 'Pre', testType: 'Initial Char', measurementDate: '2026-02-12', equipmentId: 'EQ-SS-001', operator: 'Ravi Kumar', pmax: 420.8, isc: 10.81, voc: 49.5, ff: 78.4, imp: 10.20, vmp: 41.3, irradiance: 1000, temperature: 25.0, rawFileRef: 'RAW/IV_MOD001B_IC_20260212.csv', isSelected: true },
  { id: 'IV007', moduleId: 'MOD-2026-001-B', testStage: 'Post', testType: 'TC200', measurementDate: '2026-02-20', equipmentId: 'EQ-SS-001', operator: 'Priya Singh', pmax: 418.2, isc: 10.78, voc: 49.3, ff: 78.1, imp: 10.17, vmp: 41.1, irradiance: 1000, temperature: 25.1, rawFileRef: 'RAW/IV_MOD001B_TC200_20260220.csv', isSelected: true },
  // Control Module (REF)
  { id: 'IV008', moduleId: 'MOD-2026-001-REF', testStage: 'Pre', testType: 'Reference', measurementDate: '2026-02-12', equipmentId: 'EQ-SS-001', operator: 'Ravi Kumar', pmax: 422.0, isc: 10.83, voc: 49.7, ff: 78.6, imp: 10.22, vmp: 41.3, irradiance: 1000, temperature: 25.0, rawFileRef: 'RAW/IV_REF_IC_20260212.csv', isSelected: true },
  { id: 'IV009', moduleId: 'MOD-2026-001-REF', testStage: 'Post', testType: 'Reference', measurementDate: '2026-03-10', equipmentId: 'EQ-SS-001', operator: 'Ravi Kumar', pmax: 421.5, isc: 10.82, voc: 49.6, ff: 78.5, imp: 10.21, vmp: 41.2, irradiance: 1000, temperature: 25.0, rawFileRef: 'RAW/IV_REF_END_20260310.csv', isSelected: true },
]

export const mockEquipment: Equipment[] = [
  { id: 'EQ-SS-001', name: 'Pasan 3B Sun Simulator', type: 'Solar Simulator', location: 'Lab A - Bay 1', status: 'in_use', lastCalDate: '2026-01-10', nextCalDate: '2026-07-10', calibrationStatus: 'valid', currentTest: 'IV Char - MOD-2026-001-C', operator: 'Ravi Kumar', totalTests: 342 },
  { id: 'EQ-CC-001', name: 'Weiss WKL 100 Climate Chamber', type: 'Climate Chamber', location: 'Lab B - Bay 1', status: 'in_use', lastCalDate: '2025-12-15', nextCalDate: '2026-06-15', calibrationStatus: 'valid', currentTest: 'TC200 - Batch 2026-001', operator: 'Anita Rao', totalTests: 156 },
  { id: 'EQ-CC-002', name: 'Weiss WKL 100 Climate Chamber #2', type: 'Climate Chamber', location: 'Lab B - Bay 2', status: 'available', lastCalDate: '2026-01-20', nextCalDate: '2026-07-20', calibrationStatus: 'valid', currentTest: null, operator: null, totalTests: 89 },
  { id: 'EQ-DH-001', name: 'Damp Heat Chamber Memmert HCP', type: 'Damp Heat Chamber', location: 'Lab C - Bay 1', status: 'in_use', lastCalDate: '2025-11-01', nextCalDate: '2026-05-01', calibrationStatus: 'due_soon', currentTest: 'DH1000 - MOD-2026-001', operator: 'Priya Singh', totalTests: 210 },
  { id: 'EQ-UV-001', name: 'Atlas UV 2000 Weatherometer', type: 'UV Chamber', location: 'Lab C - Bay 2', status: 'available', lastCalDate: '2026-02-01', nextCalDate: '2026-08-01', calibrationStatus: 'valid', currentTest: null, operator: null, totalTests: 67 },
  { id: 'EQ-EL-001', name: 'EL Imaging System - Greateyes', type: 'EL Imager', location: 'Lab A - Bay 2', status: 'in_use', lastCalDate: '2025-10-15', nextCalDate: '2026-04-15', calibrationStatus: 'due_soon', currentTest: 'EL Inspection - MOD-2026-001', operator: 'Ravi Kumar', totalTests: 178 },
  { id: 'EQ-INS-001', name: 'Seaward Solar PV200 Tester', type: 'Insulation Tester', location: 'Lab A - Bay 3', status: 'maintenance', lastCalDate: '2025-09-01', nextCalDate: '2026-03-01', calibrationStatus: 'overdue', currentTest: null, operator: null, totalTests: 445 },
]

export const mockIEC61215Sequence: IEC61215SequenceStep[] = [
  { id: 'SEQ01', stepNo: 1, name: 'Stabilization', type: 'test', duration: '3 cycles', status: 'complete', startDate: '2026-02-11', endDate: '2026-02-12', pmaxBefore: null, pmaxAfter: 421.5, deltaPercent: null, equipmentId: 'EQ-SS-001', iecLimit: -2.0 },
  { id: 'SEQ02', stepNo: 2, name: 'Initial Characterization', type: 'characterization', duration: '1 day', status: 'complete', startDate: '2026-02-12', endDate: '2026-02-12', pmaxBefore: 421.5, pmaxAfter: 421.5, deltaPercent: 0.0, equipmentId: 'EQ-SS-001', iecLimit: -2.0 },
  { id: 'SEQ03', stepNo: 3, name: 'TC 200 Cycles', type: 'test', duration: '200 cycles', status: 'complete', startDate: '2026-02-13', endDate: '2026-02-19', pmaxBefore: 421.5, pmaxAfter: null, deltaPercent: null, equipmentId: 'EQ-CC-001', iecLimit: -2.0 },
  { id: 'SEQ04', stepNo: 4, name: 'Characterization Post TC200', type: 'characterization', duration: '1 day', status: 'complete', startDate: '2026-02-20', endDate: '2026-02-20', pmaxBefore: 421.5, pmaxAfter: 418.8, deltaPercent: -0.64, equipmentId: 'EQ-SS-001', iecLimit: -2.0 },
  { id: 'SEQ05', stepNo: 5, name: 'TC 200 More Cycles (to 400)', type: 'test', duration: '200 cycles', status: 'complete', startDate: '2026-02-21', endDate: '2026-02-28', pmaxBefore: 418.8, pmaxAfter: null, deltaPercent: null, equipmentId: 'EQ-CC-001', iecLimit: -2.0 },
  { id: 'SEQ06', stepNo: 6, name: 'Characterization Post TC400', type: 'characterization', duration: '1 day', status: 'complete', startDate: '2026-03-01', endDate: '2026-03-01', pmaxBefore: 418.8, pmaxAfter: 416.2, deltaPercent: -1.28, equipmentId: 'EQ-SS-001', iecLimit: -2.0 },
  { id: 'SEQ07', stepNo: 7, name: 'Humidity Freeze (HF 10)', type: 'test', duration: '10 cycles', status: 'complete', startDate: '2026-03-02', endDate: '2026-03-04', pmaxBefore: 416.2, pmaxAfter: null, deltaPercent: null, equipmentId: 'EQ-CC-001', iecLimit: -2.0 },
  { id: 'SEQ08', stepNo: 8, name: 'Characterization Post HF10', type: 'characterization', duration: '1 day', status: 'complete', startDate: '2026-03-05', endDate: '2026-03-05', pmaxBefore: 416.2, pmaxAfter: 419.1, deltaPercent: 0.70, equipmentId: 'EQ-SS-001', iecLimit: -2.0 },
  { id: 'SEQ09', stepNo: 9, name: 'Damp Heat 1000h', type: 'test', duration: '1000 hours', status: 'active', startDate: '2026-03-06', endDate: null, pmaxBefore: 419.1, pmaxAfter: null, deltaPercent: null, equipmentId: 'EQ-DH-001', iecLimit: -5.0 },
  { id: 'SEQ10', stepNo: 10, name: 'Characterization Post DH1000', type: 'characterization', duration: '1 day', status: 'pending', startDate: null, endDate: null, pmaxBefore: null, pmaxAfter: null, deltaPercent: null, equipmentId: null, iecLimit: -5.0 },
  { id: 'SEQ11', stepNo: 11, name: 'UV Preconditioning', type: 'test', duration: '15 kWh/m²', status: 'pending', startDate: null, endDate: null, pmaxBefore: null, pmaxAfter: null, deltaPercent: null, equipmentId: null, iecLimit: -2.0 },
  { id: 'SEQ12', stepNo: 12, name: 'Final Characterization', type: 'final', duration: '1 day', status: 'pending', startDate: null, endDate: null, pmaxBefore: null, pmaxAfter: null, deltaPercent: null, equipmentId: null, iecLimit: -5.0 },
]

export const mockApprovals: ApprovalRecord[] = [
  {
    id: 'APR001',
    serviceRequestId: 'SR001',
    moduleId: 'MOD-2026-001',
    reportTitle: 'IEC 61215 Type Approval Test Report - AS-M672-BF-420W',
    submittedBy: 'Ravi Kumar',
    submittedDate: '2026-03-08',
    status: 'under_review',
    engineerApproval: { name: 'Ravi Kumar', date: '2026-03-08', status: 'approved', comments: 'All data verified. Protocol complete.' },
    techManagerApproval: { name: 'Dr. Suresh Patel', date: '2026-03-09', status: 'under_review', comments: 'Reviewing DH1000 data completeness.' },
    qualityApproval: null,
    reportGeneratedDate: null,
  },
  {
    id: 'APR002',
    serviceRequestId: 'SR003',
    moduleId: 'MOD-2026-003',
    reportTitle: 'IEC 61215 + IEC 61730 Type Approval Report - TPSSL-500BiH',
    submittedBy: 'Anita Rao',
    submittedDate: '2026-03-01',
    status: 'report_generated',
    engineerApproval: { name: 'Anita Rao', date: '2026-03-01', status: 'approved', comments: '' },
    techManagerApproval: { name: 'Dr. Suresh Patel', date: '2026-03-03', status: 'approved', comments: 'All test data within limits.' },
    qualityApproval: { name: 'Meera Krishnan', date: '2026-03-05', status: 'approved', comments: 'Data integrity check passed.' },
    reportGeneratedDate: '2026-03-06',
  },
]

export const mockKPIData: KPIData = {
  equipmentUtilization: [
    { name: 'SS-001', testsThisMonth: 42, totalCapacity: 60 },
    { name: 'CC-001', testsThisMonth: 18, totalCapacity: 20 },
    { name: 'CC-002', testsThisMonth: 8, totalCapacity: 20 },
    { name: 'DH-001', testsThisMonth: 5, totalCapacity: 8 },
    { name: 'UV-001', testsThisMonth: 3, totalCapacity: 10 },
    { name: 'EL-001', testsThisMonth: 25, totalCapacity: 40 },
  ],
  operatorPerformance: [
    { name: 'Ravi Kumar', measurements: 89, errorRate: 0.8 },
    { name: 'Priya Singh', measurements: 62, errorRate: 1.2 },
    { name: 'Anita Rao', measurements: 74, errorRate: 0.5 },
    { name: 'Deepak Nair', measurements: 45, errorRate: 2.1 },
  ],
  tatData: [
    { week: 'W1 Feb', avgDays: 48, target: 45 },
    { week: 'W2 Feb', avgDays: 46, target: 45 },
    { week: 'W3 Feb', avgDays: 52, target: 45 },
    { week: 'W4 Feb', avgDays: 43, target: 45 },
    { week: 'W1 Mar', avgDays: 41, target: 45 },
    { week: 'W2 Mar', avgDays: 39, target: 45 },
  ],
  environmentalCompliance: [
    { month: 'Oct', compliance: 96, target: 98 },
    { month: 'Nov', compliance: 97, target: 98 },
    { month: 'Dec', compliance: 95, target: 98 },
    { month: 'Jan', compliance: 98, target: 98 },
    { month: 'Feb', compliance: 99, target: 98 },
    { month: 'Mar', compliance: 100, target: 98 },
  ],
  sampleThroughput: [
    { week: 'W1 Feb', modulesIn: 12, modulesOut: 8 },
    { week: 'W2 Feb', modulesIn: 8, modulesOut: 14 },
    { week: 'W3 Feb', modulesIn: 16, modulesOut: 10 },
    { week: 'W4 Feb', modulesIn: 6, modulesOut: 12 },
    { week: 'W1 Mar', modulesIn: 10, modulesOut: 8 },
    { week: 'W2 Mar', modulesIn: 14, modulesOut: 6 },
  ],
}

// Pre/Post comparison data
export const prePostComparisonData = [
  { testType: 'TC200', preAvg: 421.5, postAvg: 418.8, delta: -0.64, limit: -2.0, pass: true },
  { testType: 'TC400', preAvg: 421.5, postAvg: 416.2, delta: -1.28, limit: -2.0, pass: true },
  { testType: 'HF10', preAvg: 416.2, postAvg: 419.1, delta: 0.70, limit: -2.0, pass: true },
  { testType: 'DH1000', preAvg: 419.1, postAvg: 415.0, delta: -0.98, limit: -5.0, pass: true },
  { testType: 'UV (proj)', preAvg: 415.0, postAvg: null, delta: null, limit: -2.0, pass: null },
]

export const pmaxSequenceData = [
  { step: 'Initial', pmax: 421.5, refPmax: 422.0 },
  { step: 'Post TC200', pmax: 418.8, refPmax: 421.8 },
  { step: 'Post TC400', pmax: 416.2, refPmax: 421.5 },
  { step: 'Post HF10', pmax: 419.1, refPmax: 421.2 },
  { step: 'Post DH1000', pmax: 415.0, refPmax: 421.0 },
]
