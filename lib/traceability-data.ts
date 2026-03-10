// ============================================================================
// Traceability & Document Control - Mock Data
// ISO 17025 & ISO 9001 Compliant
// ============================================================================

import type { DocumentRegistryEntry, DocumentType } from './document-numbering'

// ============================================================================
// Central Document Registry
// ============================================================================

export const mockDocumentRegistry: DocumentRegistryEntry[] = [
  // Test Reports
  { id: 'dr-1', documentNumber: 'TR-61215-2026-001', documentType: 'test_report', title: 'IEC 61215 Design Qualification - SunPower SPR-MAX6-450', standard: 'IEC 61215', year: 2026, sequence: 1, createdBy: 'Priya Sharma', createdAt: '2026-01-25T16:00:00Z', status: 'active', linkedDocuments: ['TP-61215-TC-2026-001', 'RD-61215-TC-2026-001', 'CAL-SS001-2026-001'], revision: 1, description: 'Full qualification test report' },
  { id: 'dr-2', documentNumber: 'TR-61730-2026-002', documentType: 'test_report', title: 'IEC 61730 Safety Qualification - SunPower SPR-MAX6-450', standard: 'IEC 61730', year: 2026, sequence: 2, createdBy: 'Rajesh Kumar', createdAt: '2026-01-26T10:00:00Z', status: 'active', linkedDocuments: ['TP-61730-INS-2026-001'], revision: 1, description: 'Safety qualification report' },
  { id: 'dr-3', documentNumber: 'TR-60904-2026-003', documentType: 'test_report', title: 'IEC 60904 I-V Measurement - JA Solar JAM72S30', standard: 'IEC 60904', year: 2026, sequence: 3, createdBy: 'Priya Sharma', createdAt: '2026-03-05T16:00:00Z', status: 'active', linkedDocuments: ['RD-60904-IV-2026-001'], revision: 1, description: 'I-V characterization report' },
  { id: 'dr-4', documentNumber: 'TR-61215-2026-004', documentType: 'test_report', title: 'IEC 61215 Thermal Cycling - Canadian Solar CS7N-665TB', standard: 'IEC 61215', year: 2026, sequence: 4, createdBy: 'Priya Sharma', createdAt: '2026-03-08T14:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Thermal cycling test report' },
  // Test Protocols
  { id: 'dr-5', documentNumber: 'TP-61215-TC-2026-001', documentType: 'test_protocol', title: 'Thermal Cycling Test Protocol TC200', standard: 'IEC 61215', testCode: 'TC', year: 2026, sequence: 1, createdBy: 'Priya Sharma', createdAt: '2026-01-15T09:00:00Z', status: 'active', linkedDocuments: ['SOP-PERF-2026-001'], revision: 2, description: 'TC200 protocol per IEC 61215 Cl.10.11' },
  { id: 'dr-6', documentNumber: 'TP-61730-INS-2026-001', documentType: 'test_protocol', title: 'Insulation Resistance Test Protocol', standard: 'IEC 61730', testCode: 'INS', year: 2026, sequence: 1, createdBy: 'Rajesh Kumar', createdAt: '2026-01-16T08:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Insulation test protocol per IEC 61730 Cl.10.6' },
  { id: 'dr-7', documentNumber: 'TP-61215-IV-2026-002', documentType: 'test_protocol', title: 'I-V Characterization at STC Protocol', standard: 'IEC 61215', testCode: 'IV', year: 2026, sequence: 2, createdBy: 'Priya Sharma', createdAt: '2026-01-18T09:00:00Z', status: 'active', linkedDocuments: ['SOP-PERF-2026-001'], revision: 3, description: 'I-V measurement at STC per IEC 61215 Cl.10.2' },
  // Analysis Reports
  { id: 'dr-8', documentNumber: 'DA-61215-2026-001', documentType: 'analysis_report', title: 'TC200 Data Analysis - Power Degradation', standard: 'IEC 61215', year: 2026, sequence: 1, createdBy: 'Dr. Anand Patel', createdAt: '2026-02-20T14:00:00Z', status: 'active', linkedDocuments: ['RD-61215-TC-2026-001', 'TR-61215-2026-001'], revision: 1, description: 'Statistical analysis of power degradation after TC200' },
  { id: 'dr-9', documentNumber: 'DA-60904-2026-002', documentType: 'analysis_report', title: 'I-V Curve Analysis - JA Solar Module', standard: 'IEC 60904', year: 2026, sequence: 2, createdBy: 'Priya Sharma', createdAt: '2026-03-06T10:00:00Z', status: 'active', linkedDocuments: ['RD-60904-IV-2026-001'], revision: 1, description: 'I-V curve fitting and parameter extraction' },
  // Raw Data
  { id: 'dr-10', documentNumber: 'RD-61215-TC-2026-001', documentType: 'raw_data', title: 'TC200 Raw Temperature & I-V Data', standard: 'IEC 61215', testCode: 'TC', year: 2026, sequence: 1, createdBy: 'Priya Sharma', createdAt: '2026-02-01T08:00:00Z', status: 'active', linkedDocuments: ['TP-61215-TC-2026-001'], revision: 1, description: 'Chamber temperature logs and I-V snapshots during TC200' },
  { id: 'dr-11', documentNumber: 'RD-60904-IV-2026-001', documentType: 'raw_data', title: 'I-V Curve Raw Data - JA Solar', standard: 'IEC 60904', testCode: 'IV', year: 2026, sequence: 1, createdBy: 'Priya Sharma', createdAt: '2026-03-03T12:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: '200-point I-V sweep forward and reverse' },
  { id: 'dr-12', documentNumber: 'RD-61215-DH-2026-002', documentType: 'raw_data', title: 'Damp Heat 1000h Monitoring Data', standard: 'IEC 61215', testCode: 'DH', year: 2026, sequence: 2, createdBy: 'Rajesh Kumar', createdAt: '2026-02-15T08:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Temperature and humidity logs during DH1000' },
  // Calibration Certificates
  { id: 'dr-13', documentNumber: 'CAL-SS001-2026-001', documentType: 'calibration_cert', title: 'Solar Simulator Calibration Certificate', equipmentCode: 'SS001', year: 2026, sequence: 1, createdBy: 'Cal-Lab Intl.', createdAt: '2025-12-15T00:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Class AAA verification - Pasan SunSim 3C' },
  { id: 'dr-14', documentNumber: 'CAL-TC001-2026-002', documentType: 'calibration_cert', title: 'Thermal Chamber Calibration Certificate', equipmentCode: 'TC001', year: 2026, sequence: 2, createdBy: 'NABL-AccLab', createdAt: '2025-11-20T00:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Temperature uniformity and accuracy verification' },
  { id: 'dr-15', documentNumber: 'CAL-IR001-2026-003', documentType: 'calibration_cert', title: 'Insulation Tester Calibration Certificate', equipmentCode: 'IR001', year: 2026, sequence: 3, createdBy: 'Megger Service', createdAt: '2026-01-05T00:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Megger MIT1025 annual calibration' },
  { id: 'dr-16', documentNumber: 'CAL-DL001-2026-004', documentType: 'calibration_cert', title: 'Data Logger Calibration Certificate', equipmentCode: 'DL001', year: 2026, sequence: 4, createdBy: 'Keysight Service', createdAt: '2026-02-01T00:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Keysight 34972A multi-channel verification' },
  // SOPs
  { id: 'dr-17', documentNumber: 'SOP-PERF-2026-001', documentType: 'sop', title: 'SOP for I-V Curve Measurement', department: 'PERF', year: 2026, sequence: 1, createdBy: 'Priya Sharma', createdAt: '2026-01-01T00:00:00Z', status: 'active', linkedDocuments: [], revision: 3, description: 'I-V measurement procedure per IEC 60904-1' },
  { id: 'dr-18', documentNumber: 'SOP-SMPL-2026-002', documentType: 'sop', title: 'Sample Receipt and Registration Procedure', department: 'SMPL', year: 2026, sequence: 2, createdBy: 'Rajesh Kumar', createdAt: '2025-09-01T00:00:00Z', status: 'active', linkedDocuments: [], revision: 4, description: 'Sample handling per ISO 17025 Cl.7.4' },
  { id: 'dr-19', documentNumber: 'SOP-QA-2026-003', documentType: 'sop', title: 'Equipment Calibration Management Procedure', department: 'QA', year: 2026, sequence: 3, createdBy: 'Dr. Anand Patel', createdAt: '2026-03-01T00:00:00Z', status: 'active', linkedDocuments: [], revision: 4, description: 'Calibration planning and execution per ISO 17025 Cl.6.4' },
  // NCRs
  { id: 'dr-20', documentNumber: 'NCR-2026-001', documentType: 'ncr', title: 'Solar Simulator Uniformity Non-Conformance', year: 2026, sequence: 1, createdBy: 'Priya Sharma', createdAt: '2026-02-01T00:00:00Z', status: 'active', linkedDocuments: ['CAPA-2026-001', 'CAL-SS001-2026-001'], revision: 1, description: 'Spatial uniformity exceeded ±2% Class A spec' },
  { id: 'dr-21', documentNumber: 'NCR-2026-002', documentType: 'ncr', title: 'Chain of Custody Documentation Gap', year: 2026, sequence: 2, createdBy: 'External Auditor', createdAt: '2026-02-28T00:00:00Z', status: 'active', linkedDocuments: ['CAPA-2026-002'], revision: 1, description: 'Missing CoC record for SAMPLE-2025-00042' },
  { id: 'dr-22', documentNumber: 'NCR-2026-003', documentType: 'ncr', title: 'EL Camera Calibration Overdue', year: 2026, sequence: 3, createdBy: 'Rajesh Kumar', createdAt: '2026-03-05T00:00:00Z', status: 'active', linkedDocuments: ['CAL-EL001-2025-002'], revision: 1, description: 'EL-001 calibration was due 2026-04-01, past grace period' },
  // CAPAs
  { id: 'dr-23', documentNumber: 'CAPA-2026-001', documentType: 'capa', title: 'Solar Simulator Irradiance Non-Uniformity Correction', year: 2026, sequence: 1, createdBy: 'Priya Sharma', createdAt: '2026-02-01T00:00:00Z', status: 'active', linkedDocuments: ['NCR-2026-001'], revision: 1, description: 'Corrective action for lamp degradation issue' },
  { id: 'dr-24', documentNumber: 'CAPA-2026-002', documentType: 'capa', title: 'Digital Chain of Custody Implementation', year: 2026, sequence: 2, createdBy: 'Rajesh Kumar', createdAt: '2026-03-01T00:00:00Z', status: 'active', linkedDocuments: ['NCR-2026-002'], revision: 1, description: 'Implement QR-based CoC system' },
  { id: 'dr-25', documentNumber: 'CAPA-2026-003', documentType: 'capa', title: 'Calibration Schedule Optimization', year: 2026, sequence: 3, createdBy: 'Dr. Anand Patel', createdAt: '2026-03-01T00:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Risk-based calibration intervals' },
  // Audit Reports
  { id: 'dr-26', documentNumber: 'AR-2026-001', documentType: 'audit_report', title: 'Internal Audit - Performance Testing Lab', year: 2026, sequence: 1, createdBy: 'Dr. Anand Patel', createdAt: '2026-01-30T00:00:00Z', status: 'active', linkedDocuments: ['NCR-2026-001', 'CAPA-2026-001'], revision: 1, description: 'Annual internal audit of Performance Testing Lab' },
  { id: 'dr-27', documentNumber: 'AR-2026-002', documentType: 'audit_report', title: 'NABL Surveillance Audit', year: 2026, sequence: 2, createdBy: 'NABL Assessor', createdAt: '2026-02-28T00:00:00Z', status: 'active', linkedDocuments: ['NCR-2026-002', 'CAPA-2026-002'], revision: 1, description: 'NABL surveillance audit findings' },
  { id: 'dr-28', documentNumber: 'AR-2026-003', documentType: 'audit_report', title: 'Internal Audit - Sample Management', year: 2026, sequence: 3, createdBy: 'Dr. Anand Patel', createdAt: '2026-03-05T00:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Q1 2026 sample management process audit' },
  // Extra test reports
  { id: 'dr-29', documentNumber: 'TR-61853-2026-005', documentType: 'test_report', title: 'IEC 61853 Energy Rating - Trina Solar TSM-DE21C', standard: 'IEC 61853', year: 2026, sequence: 5, createdBy: 'Priya Sharma', createdAt: '2026-03-09T10:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Energy rating characterization report' },
  { id: 'dr-30', documentNumber: 'TR-61215-2026-006', documentType: 'test_report', title: 'IEC 61215 Hail Test - Module Batch B-045', standard: 'IEC 61215', year: 2026, sequence: 6, createdBy: 'Rajesh Kumar', createdAt: '2026-03-10T08:00:00Z', status: 'active', linkedDocuments: [], revision: 1, description: 'Hail impact test report' },
]

// ============================================================================
// Traceability Matrix - Full Chain Links
// ============================================================================

export interface TraceabilityChain {
  id: string
  projectId: string
  projectName: string
  clientName: string
  sampleId: string
  standard: string
  nodes: TraceabilityNode[]
  links: TraceabilityLink[]
}

export interface TraceabilityNode {
  id: string
  type: 'sample' | 'protocol' | 'equipment' | 'raw_data' | 'analysis' | 'report' | 'calibration'
  label: string
  documentNumber?: string
  status: string
  date: string
  details: Record<string, string>
}

export interface TraceabilityLink {
  source: string
  target: string
  label: string
}

export const mockTraceabilityChains: TraceabilityChain[] = [
  {
    id: 'tc-1',
    projectId: 'PROJECT-2026-00001',
    projectName: 'SunPower SPR-MAX6-450 IEC 61215 Qualification',
    clientName: 'SunPower Corp',
    sampleId: 'SAMPLE-2026-00001',
    standard: 'IEC 61215',
    nodes: [
      { id: 'n1', type: 'sample', label: 'Sample Receipt', documentNumber: 'SAMPLE-2026-00001', status: 'Completed', date: '2026-01-15', details: { manufacturer: 'SunPower', model: 'SPR-MAX6-450', serial: 'SP-2026-001234' } },
      { id: 'n2', type: 'protocol', label: 'Visual Inspection', documentNumber: 'TP-61215-VI-2026-001', status: 'Completed', date: '2026-01-16', details: { clause: 'IEC 61215 Cl.7', technician: 'Rajesh Kumar' } },
      { id: 'n3', type: 'equipment', label: 'Solar Simulator SS-001', documentNumber: 'SS-001', status: 'Calibrated', date: '2025-12-15', details: { make: 'Pasan SA', model: 'SunSim 3C', calCert: 'CAL-SS001-2026-001' } },
      { id: 'n4', type: 'protocol', label: 'I-V at STC', documentNumber: 'TP-61215-IV-2026-002', status: 'Completed', date: '2026-01-20', details: { clause: 'IEC 61215 Cl.10.2', technician: 'Priya Sharma' } },
      { id: 'n5', type: 'raw_data', label: 'I-V Curve Data', documentNumber: 'RD-61215-IV-2026-001', status: 'Archived', date: '2026-01-20', details: { dataPoints: '200', format: 'CSV' } },
      { id: 'n6', type: 'equipment', label: 'Thermal Chamber TC-001', documentNumber: 'TC-001', status: 'Calibrated', date: '2025-11-20', details: { make: 'Votsch', model: 'VT3 7060', calCert: 'CAL-TC001-2026-002' } },
      { id: 'n7', type: 'protocol', label: 'Thermal Cycling TC200', documentNumber: 'TP-61215-TC-2026-001', status: 'In Progress', date: '2026-02-01', details: { clause: 'IEC 61215 Cl.10.11', cycles: '142/200' } },
      { id: 'n8', type: 'raw_data', label: 'TC200 Temperature Data', documentNumber: 'RD-61215-TC-2026-001', status: 'Recording', date: '2026-02-01', details: { channels: '8', interval: '1 min' } },
      { id: 'n9', type: 'calibration', label: 'SS-001 Calibration', documentNumber: 'CAL-SS001-2026-001', status: 'Valid', date: '2025-12-15', details: { lab: 'Cal-Lab Intl.', nextDue: '2026-06-15' } },
      { id: 'n10', type: 'calibration', label: 'TC-001 Calibration', documentNumber: 'CAL-TC001-2026-002', status: 'Valid', date: '2025-11-20', details: { lab: 'NABL-AccLab', nextDue: '2026-05-20' } },
      { id: 'n11', type: 'analysis', label: 'TC200 Data Analysis', documentNumber: 'DA-61215-2026-001', status: 'Completed', date: '2026-02-20', details: { analyst: 'Dr. Anand Patel', method: 'Statistical' } },
      { id: 'n12', type: 'report', label: 'Test Report', documentNumber: 'TR-61215-2026-001', status: 'Issued', date: '2026-01-25', details: { version: '1.0', pages: '24' } },
    ],
    links: [
      { source: 'n1', target: 'n2', label: 'inspected by' },
      { source: 'n2', target: 'n4', label: 'then tested' },
      { source: 'n3', target: 'n4', label: 'equipment for' },
      { source: 'n9', target: 'n3', label: 'calibrates' },
      { source: 'n4', target: 'n5', label: 'produces' },
      { source: 'n1', target: 'n7', label: 'subjected to' },
      { source: 'n6', target: 'n7', label: 'equipment for' },
      { source: 'n10', target: 'n6', label: 'calibrates' },
      { source: 'n7', target: 'n8', label: 'produces' },
      { source: 'n5', target: 'n11', label: 'analyzed in' },
      { source: 'n8', target: 'n11', label: 'analyzed in' },
      { source: 'n11', target: 'n12', label: 'reported in' },
    ],
  },
  {
    id: 'tc-2',
    projectId: 'PROJECT-2026-00001',
    projectName: 'SunPower SPR-MAX6-450 IEC 61730 Safety',
    clientName: 'SunPower Corp',
    sampleId: 'SAMPLE-2026-00002',
    standard: 'IEC 61730',
    nodes: [
      { id: 'n1', type: 'sample', label: 'Sample Receipt', documentNumber: 'SAMPLE-2026-00002', status: 'Completed', date: '2026-01-15', details: { manufacturer: 'SunPower', model: 'SPR-MAX6-450', serial: 'SP-2026-001235' } },
      { id: 'n2', type: 'protocol', label: 'Insulation Test', documentNumber: 'TP-61730-INS-2026-001', status: 'Completed', date: '2026-01-16', details: { clause: 'IEC 61730 Cl.10.6' } },
      { id: 'n3', type: 'equipment', label: 'Insulation Tester IR-001', documentNumber: 'IR-001', status: 'Calibrated', date: '2026-01-05', details: { make: 'Megger', model: 'MIT1025', calCert: 'CAL-IR001-2026-003' } },
      { id: 'n4', type: 'report', label: 'Safety Report', documentNumber: 'TR-61730-2026-002', status: 'Issued', date: '2026-01-26', details: { version: '1.0' } },
    ],
    links: [
      { source: 'n1', target: 'n2', label: 'tested with' },
      { source: 'n3', target: 'n2', label: 'equipment for' },
      { source: 'n2', target: 'n4', label: 'reported in' },
    ],
  },
  {
    id: 'tc-3',
    projectId: 'PROJECT-2026-00003',
    projectName: 'JA Solar JAM72S30 IEC 60904 Measurement',
    clientName: 'JA Solar',
    sampleId: 'SAMPLE-2026-00004',
    standard: 'IEC 60904',
    nodes: [
      { id: 'n1', type: 'sample', label: 'Sample Receipt', documentNumber: 'SAMPLE-2026-00004', status: 'Completed', date: '2026-02-20', details: { manufacturer: 'JA Solar', model: 'JAM72S30-550/MR', serial: 'JA-2026-045123' } },
      { id: 'n2', type: 'protocol', label: 'I-V Measurement', documentNumber: 'TP-60904-IV-2026-003', status: 'Completed', date: '2026-03-03', details: { clause: 'IEC 60904-1 Cl.7' } },
      { id: 'n3', type: 'equipment', label: 'Solar Simulator SS-001', documentNumber: 'SS-001', status: 'Calibrated', date: '2025-12-15', details: { calCert: 'CAL-SS001-2026-001' } },
      { id: 'n4', type: 'raw_data', label: 'I-V Curve Data', documentNumber: 'RD-60904-IV-2026-001', status: 'Archived', date: '2026-03-03', details: { dataPoints: '200' } },
      { id: 'n5', type: 'analysis', label: 'I-V Analysis', documentNumber: 'DA-60904-2026-002', status: 'Completed', date: '2026-03-06', details: { analyst: 'Priya Sharma' } },
      { id: 'n6', type: 'report', label: 'Test Report', documentNumber: 'TR-60904-2026-003', status: 'Pending Review', date: '2026-03-05', details: { version: '1.0' } },
    ],
    links: [
      { source: 'n1', target: 'n2', label: 'tested with' },
      { source: 'n3', target: 'n2', label: 'equipment for' },
      { source: 'n2', target: 'n4', label: 'produces' },
      { source: 'n4', target: 'n5', label: 'analyzed in' },
      { source: 'n5', target: 'n6', label: 'reported in' },
    ],
  },
]

// ============================================================================
// Equipment Master File (26 equipment)
// ============================================================================

export interface EquipmentMasterEntry {
  id: string
  equipmentId: string
  name: string
  category: string
  make: string
  model: string
  serialNumber: string
  location: string
  lastCalDate: string
  nextCalDue: string
  calCertificateNo: string
  measurementUncertainty: string
  status: 'active' | 'under_maintenance' | 'retired'
  calHistory: { date: string; certNo: string; result: string; lab: string }[]
}

export const mockEquipmentMaster: EquipmentMasterEntry[] = [
  { id: 'em-1', equipmentId: 'SS-001', name: 'Pasan SunSim 3C Class AAA Solar Simulator', category: 'Solar Simulator', make: 'Pasan SA (Meyer Burger)', model: 'SunSim 3C', serialNumber: 'PS-SIM-2024-0042', location: 'Solar Simulator Lab - Bay 1', lastCalDate: '2025-12-15', nextCalDue: '2026-06-15', calCertificateNo: 'CAL-SS001-2026-001', measurementUncertainty: '±1.5% (irradiance)', status: 'active', calHistory: [{ date: '2025-12-15', certNo: 'CAL-SS001-2026-001', result: 'Pass', lab: 'Cal-Lab Intl.' }, { date: '2025-06-15', certNo: 'CAL-SS001-2025-001', result: 'Pass', lab: 'Cal-Lab Intl.' }] },
  { id: 'em-2', equipmentId: 'SS-002', name: 'Pasan HighLIGHT Class AAA Simulator', category: 'Solar Simulator', make: 'Pasan SA', model: 'HighLIGHT 3', serialNumber: 'PS-HL-2025-0011', location: 'Solar Simulator Lab - Bay 2', lastCalDate: '2026-01-10', nextCalDue: '2026-07-10', calCertificateNo: 'CAL-SS002-2026-001', measurementUncertainty: '±1.2% (irradiance)', status: 'active', calHistory: [{ date: '2026-01-10', certNo: 'CAL-SS002-2026-001', result: 'Pass', lab: 'Cal-Lab Intl.' }] },
  { id: 'em-3', equipmentId: 'TC-001', name: 'Votsch VT3 7060 Thermal Chamber', category: 'Environmental Chamber', make: 'Votsch Industrietechnik', model: 'VT3 7060', serialNumber: 'VT-2023-7060-0018', location: 'Environmental Test Lab - Bay 3', lastCalDate: '2025-11-20', nextCalDue: '2026-05-20', calCertificateNo: 'CAL-TC001-2026-002', measurementUncertainty: '±0.5°C', status: 'active', calHistory: [{ date: '2025-11-20', certNo: 'CAL-TC001-2026-002', result: 'Pass', lab: 'NABL-AccLab' }] },
  { id: 'em-4', equipmentId: 'TC-002', name: 'Votsch VC3 7060 Thermal/Humidity Chamber', category: 'Environmental Chamber', make: 'Votsch Industrietechnik', model: 'VC3 7060', serialNumber: 'VT-2024-VC-0023', location: 'Environmental Test Lab - Bay 4', lastCalDate: '2025-12-01', nextCalDue: '2026-06-01', calCertificateNo: 'CAL-TC002-2026-001', measurementUncertainty: '±0.5°C / ±3% RH', status: 'active', calHistory: [{ date: '2025-12-01', certNo: 'CAL-TC002-2026-001', result: 'Pass', lab: 'NABL-AccLab' }] },
  { id: 'em-5', equipmentId: 'TC-003', name: 'Weiss WKL 1000/70 Climate Chamber', category: 'Environmental Chamber', make: 'Weiss Technik', model: 'WKL 1000/70', serialNumber: 'WT-2024-WKL-0045', location: 'Environmental Test Lab - Bay 5', lastCalDate: '2026-01-15', nextCalDue: '2026-07-15', calCertificateNo: 'CAL-TC003-2026-001', measurementUncertainty: '±0.3°C / ±2% RH', status: 'active', calHistory: [{ date: '2026-01-15', certNo: 'CAL-TC003-2026-001', result: 'Pass', lab: 'NABL-AccLab' }] },
  { id: 'em-6', equipmentId: 'UV-001', name: 'Atlas UVTest UV Exposure Chamber', category: 'UV Chamber', make: 'Atlas Material Testing', model: 'UVTest', serialNumber: 'AT-UV-2024-0008', location: 'UV Test Lab', lastCalDate: '2025-10-15', nextCalDue: '2026-04-15', calCertificateNo: 'CAL-UV001-2025-002', measurementUncertainty: '±5% (UV irradiance)', status: 'active', calHistory: [{ date: '2025-10-15', certNo: 'CAL-UV001-2025-002', result: 'Pass', lab: 'Atlas Service' }] },
  { id: 'em-7', equipmentId: 'IR-001', name: 'Megger MIT1025 Insulation Resistance Tester', category: 'Safety Tester', make: 'Megger', model: 'MIT1025', serialNumber: 'MG-MIT-2024-1122', location: 'Safety Test Lab', lastCalDate: '2026-01-05', nextCalDue: '2026-07-05', calCertificateNo: 'CAL-IR001-2026-001', measurementUncertainty: '±5%', status: 'active', calHistory: [{ date: '2026-01-05', certNo: 'CAL-IR001-2026-001', result: 'Pass', lab: 'Megger Service' }] },
  { id: 'em-8', equipmentId: 'DW-001', name: 'Hipot Tester 5kV AC/DC', category: 'Safety Tester', make: 'Associated Research', model: 'HypotULTRA 7804', serialNumber: 'AR-HP-2024-0032', location: 'Safety Test Lab', lastCalDate: '2025-11-10', nextCalDue: '2026-05-10', calCertificateNo: 'CAL-DW001-2025-002', measurementUncertainty: '±3% (voltage)', status: 'active', calHistory: [{ date: '2025-11-10', certNo: 'CAL-DW001-2025-002', result: 'Pass', lab: 'AR Service' }] },
  { id: 'em-9', equipmentId: 'GC-001', name: 'Ground Continuity Tester', category: 'Safety Tester', make: 'Megger', model: 'DET2/3', serialNumber: 'MG-GC-2024-0091', location: 'Safety Test Lab', lastCalDate: '2026-02-01', nextCalDue: '2026-08-01', calCertificateNo: 'CAL-GC001-2026-001', measurementUncertainty: '±2% (resistance)', status: 'active', calHistory: [{ date: '2026-02-01', certNo: 'CAL-GC001-2026-001', result: 'Pass', lab: 'Megger Service' }] },
  { id: 'em-10', equipmentId: 'EL-001', name: 'Greateyes GE 1024 EL Camera', category: 'Imaging', make: 'Greateyes GmbH', model: 'GE 1024 1024 BI', serialNumber: 'GE-2024-BI-0055', location: 'EL/IR Imaging Lab', lastCalDate: '2025-10-01', nextCalDue: '2026-04-01', calCertificateNo: 'CAL-EL001-2025-002', measurementUncertainty: 'N/A (qualitative)', status: 'active', calHistory: [{ date: '2025-10-01', certNo: 'CAL-EL001-2025-002', result: 'Pass', lab: 'Greateyes Service' }] },
  { id: 'em-11', equipmentId: 'IR-002', name: 'FLIR T540 IR Thermal Camera', category: 'Imaging', make: 'FLIR Systems', model: 'T540', serialNumber: 'FL-T540-2024-0234', location: 'EL/IR Imaging Lab', lastCalDate: '2025-09-15', nextCalDue: '2026-03-15', calCertificateNo: 'CAL-IR002-2025-002', measurementUncertainty: '±2°C', status: 'active', calHistory: [{ date: '2025-09-15', certNo: 'CAL-IR002-2025-002', result: 'Pass', lab: 'FLIR Service' }] },
  { id: 'em-12', equipmentId: 'ML-001', name: 'Mechanical Load Tester 5400Pa', category: 'Mechanical Tester', make: 'Custom Build', model: 'ML-5400', serialNumber: 'ML-2022-001', location: 'Mechanical Test Lab', lastCalDate: '2025-09-01', nextCalDue: '2026-03-01', calCertificateNo: 'CAL-ML001-2025-002', measurementUncertainty: '±2% (load)', status: 'under_maintenance', calHistory: [{ date: '2025-09-01', certNo: 'CAL-ML001-2025-002', result: 'Pass', lab: 'In-house' }] },
  { id: 'em-13', equipmentId: 'HL-001', name: 'Hail Impact Tester', category: 'Mechanical Tester', make: 'Custom Build', model: 'HIT-25', serialNumber: 'HIT-2023-001', location: 'Mechanical Test Lab', lastCalDate: '2025-12-10', nextCalDue: '2026-06-10', calCertificateNo: 'CAL-HL001-2025-002', measurementUncertainty: '±1mm (diameter)', status: 'active', calHistory: [{ date: '2025-12-10', certNo: 'CAL-HL001-2025-002', result: 'Pass', lab: 'In-house' }] },
  { id: 'em-14', equipmentId: 'DL-001', name: 'Keysight 34972A Data Acquisition Unit', category: 'Data Acquisition', make: 'Keysight Technologies', model: '34972A', serialNumber: 'KS-2024-34972-0201', location: 'Environmental Test Lab', lastCalDate: '2026-02-01', nextCalDue: '2026-08-01', calCertificateNo: 'CAL-DL001-2026-001', measurementUncertainty: '±0.004%', status: 'active', calHistory: [{ date: '2026-02-01', certNo: 'CAL-DL001-2026-001', result: 'Pass', lab: 'Keysight Service' }] },
  { id: 'em-15', equipmentId: 'DL-002', name: 'NI cDAQ-9174 Data Logger', category: 'Data Acquisition', make: 'National Instruments', model: 'cDAQ-9174', serialNumber: 'NI-2024-9174-0088', location: 'Solar Simulator Lab', lastCalDate: '2025-11-01', nextCalDue: '2026-05-01', calCertificateNo: 'CAL-DL002-2025-002', measurementUncertainty: '±0.01%', status: 'active', calHistory: [{ date: '2025-11-01', certNo: 'CAL-DL002-2025-002', result: 'Pass', lab: 'NI Service' }] },
  { id: 'em-16', equipmentId: 'RC-001', name: 'WPVS Reference Cell', category: 'Reference Device', make: 'Fraunhofer ISE', model: 'WPVS-RC-01', serialNumber: 'ISE-RC-2024-0012', location: 'Solar Simulator Lab', lastCalDate: '2025-08-01', nextCalDue: '2026-08-01', calCertificateNo: 'CAL-RC001-2025-001', measurementUncertainty: '±0.5% (Isc)', status: 'active', calHistory: [{ date: '2025-08-01', certNo: 'CAL-RC001-2025-001', result: 'Pass', lab: 'Fraunhofer ISE' }] },
  { id: 'em-17', equipmentId: 'RC-002', name: 'Secondary Reference Cell (Mono-Si)', category: 'Reference Device', make: 'ESTI/JRC', model: 'Mono-Si Ref', serialNumber: 'JRC-RC-2024-0034', location: 'Solar Simulator Lab', lastCalDate: '2026-01-15', nextCalDue: '2027-01-15', calCertificateNo: 'CAL-RC002-2026-001', measurementUncertainty: '±1.0% (Isc)', status: 'active', calHistory: [{ date: '2026-01-15', certNo: 'CAL-RC002-2026-001', result: 'Pass', lab: 'ESTI/JRC' }] },
  { id: 'em-18', equipmentId: 'SP-001', name: 'Spectroradiometer EKO MS-711', category: 'Spectroradiometer', make: 'EKO Instruments', model: 'MS-711', serialNumber: 'EKO-MS-2024-0019', location: 'Solar Simulator Lab', lastCalDate: '2025-07-01', nextCalDue: '2026-07-01', calCertificateNo: 'CAL-SP001-2025-001', measurementUncertainty: '±3% (spectral irradiance)', status: 'active', calHistory: [{ date: '2025-07-01', certNo: 'CAL-SP001-2025-001', result: 'Pass', lab: 'EKO Service' }] },
  { id: 'em-19', equipmentId: 'PY-001', name: 'Kipp & Zonen CMP11 Pyranometer', category: 'Pyranometer', make: 'Kipp & Zonen', model: 'CMP11', serialNumber: 'KZ-CMP-2024-0056', location: 'Outdoor Test Field', lastCalDate: '2025-06-01', nextCalDue: '2026-06-01', calCertificateNo: 'CAL-PY001-2025-001', measurementUncertainty: '±1.4% (daily total)', status: 'active', calHistory: [{ date: '2025-06-01', certNo: 'CAL-PY001-2025-001', result: 'Pass', lab: 'PMOD/WRC' }] },
  { id: 'em-20', equipmentId: 'MM-001', name: 'Keysight 34465A Digital Multimeter', category: 'Multimeter', make: 'Keysight Technologies', model: '34465A', serialNumber: 'KS-MM-2024-0112', location: 'Performance Testing Lab', lastCalDate: '2026-01-20', nextCalDue: '2026-07-20', calCertificateNo: 'CAL-MM001-2026-001', measurementUncertainty: '±0.0035% DC V', status: 'active', calHistory: [{ date: '2026-01-20', certNo: 'CAL-MM001-2026-001', result: 'Pass', lab: 'Keysight Service' }] },
  { id: 'em-21', equipmentId: 'MM-002', name: 'Fluke 8846A Precision Multimeter', category: 'Multimeter', make: 'Fluke', model: '8846A', serialNumber: 'FL-8846-2023-0078', location: 'Safety Test Lab', lastCalDate: '2025-10-20', nextCalDue: '2026-04-20', calCertificateNo: 'CAL-MM002-2025-002', measurementUncertainty: '±0.0024% DC V', status: 'active', calHistory: [{ date: '2025-10-20', certNo: 'CAL-MM002-2025-002', result: 'Pass', lab: 'Fluke Service' }] },
  { id: 'em-22', equipmentId: 'IV-001', name: 'Keithley 2460 SourceMeter (I-V Tracer)', category: 'I-V Tester', make: 'Keithley (Tektronix)', model: '2460', serialNumber: 'KT-2460-2024-0034', location: 'Solar Simulator Lab', lastCalDate: '2026-02-10', nextCalDue: '2026-08-10', calCertificateNo: 'CAL-IV001-2026-001', measurementUncertainty: '±0.012% (I), ±0.02% (V)', status: 'active', calHistory: [{ date: '2026-02-10', certNo: 'CAL-IV001-2026-001', result: 'Pass', lab: 'Tektronix Service' }] },
  { id: 'em-23', equipmentId: 'TH-001', name: 'T-type Thermocouple Set (20 channels)', category: 'Temperature Sensor', make: 'Omega Engineering', model: 'TT-T-30-SLE', serialNumber: 'OM-TC-2024-SET01', location: 'Environmental Test Lab', lastCalDate: '2025-12-05', nextCalDue: '2026-06-05', calCertificateNo: 'CAL-TH001-2025-002', measurementUncertainty: '±0.5°C', status: 'active', calHistory: [{ date: '2025-12-05', certNo: 'CAL-TH001-2025-002', result: 'Pass', lab: 'In-house' }] },
  { id: 'em-24', equipmentId: 'WL-001', name: 'Wet Leakage Current Test Setup', category: 'Safety Tester', make: 'Custom Build', model: 'WLC-500', serialNumber: 'WLC-2023-001', location: 'Safety Test Lab', lastCalDate: '2025-11-20', nextCalDue: '2026-05-20', calCertificateNo: 'CAL-WL001-2025-002', measurementUncertainty: '±5% (leakage current)', status: 'active', calHistory: [{ date: '2025-11-20', certNo: 'CAL-WL001-2025-002', result: 'Pass', lab: 'In-house' }] },
  { id: 'em-25', equipmentId: 'BD-001', name: 'Bypass Diode Integrity Tester', category: 'Electrical Tester', make: 'Custom Build', model: 'BDT-100', serialNumber: 'BDT-2024-001', location: 'Safety Test Lab', lastCalDate: '2026-01-25', nextCalDue: '2026-07-25', calCertificateNo: 'CAL-BD001-2026-001', measurementUncertainty: '±1% (current)', status: 'active', calHistory: [{ date: '2026-01-25', certNo: 'CAL-BD001-2026-001', result: 'Pass', lab: 'In-house' }] },
  { id: 'em-26', equipmentId: 'SM-001', name: 'Salt Mist Chamber', category: 'Environmental Chamber', make: 'Ascott Analytical', model: 'S450iP', serialNumber: 'AA-SM-2024-0015', location: 'Corrosion Test Lab', lastCalDate: '2025-09-20', nextCalDue: '2026-03-20', calCertificateNo: 'CAL-SM001-2025-002', measurementUncertainty: '±2°C / ±5% (salt conc.)', status: 'active', calHistory: [{ date: '2025-09-20', certNo: 'CAL-SM001-2025-002', result: 'Pass', lab: 'Ascott Service' }] },
]

// ============================================================================
// Personnel Master
// ============================================================================

export interface PersonnelMasterEntry {
  id: string
  name: string
  employeeId: string
  role: string
  department: string
  qualifications: string[]
  trainingRecords: { course: string; date: string; certNo: string; validUntil: string }[]
  authorizations: string[]
  joinDate: string
  status: 'active' | 'inactive'
}

export const mockPersonnelMaster: PersonnelMasterEntry[] = [
  { id: 'pm-1', name: 'Dr. Anand Patel', employeeId: 'EMP-001', role: 'Lab Director / Quality Manager', department: 'Management', qualifications: ['Ph.D. Solar Energy (IIT Delhi)', 'ISO 17025 Lead Assessor', 'Six Sigma Black Belt'], trainingRecords: [{ course: 'ISO 17025:2017 Lead Assessor', date: '2025-03-15', certNo: 'IRCA-17025-2025-0042', validUntil: '2028-03-15' }, { course: 'Measurement Uncertainty (GUM)', date: '2025-06-10', certNo: 'MU-2025-018', validUntil: '2027-06-10' }], authorizations: ['Approve Test Reports', 'Approve SOPs', 'Sign Certificates', 'Authorize Equipment', 'Conduct Management Reviews'], joinDate: '2020-04-01', status: 'active' },
  { id: 'pm-2', name: 'Priya Sharma', employeeId: 'EMP-002', role: 'Senior Test Engineer', department: 'Performance Testing', qualifications: ['M.Tech Renewable Energy', 'IEC 60904 Specialist', 'Certified I-V Measurement Technician'], trainingRecords: [{ course: 'IEC 61215:2021 Updates', date: '2025-09-01', certNo: 'IEC-2025-TR-034', validUntil: '2027-09-01' }, { course: 'Solar Simulator Operation & Calibration', date: '2025-04-20', certNo: 'SS-CAL-2025-012', validUntil: '2027-04-20' }, { course: 'Measurement Uncertainty', date: '2025-06-10', certNo: 'MU-2025-019', validUntil: '2027-06-10' }], authorizations: ['Perform I-V Measurements', 'Operate Solar Simulators', 'Prepare Test Reports', 'Review Raw Data', 'Supervise Technicians'], joinDate: '2021-07-15', status: 'active' },
  { id: 'pm-3', name: 'Rajesh Kumar', employeeId: 'EMP-003', role: 'Lab Technician (Senior)', department: 'Sample Management & Safety Testing', qualifications: ['B.Tech Electrical Engineering', 'NABL Internal Auditor'], trainingRecords: [{ course: 'ISO 17025 Internal Auditor', date: '2025-01-20', certNo: 'IA-17025-2025-008', validUntil: '2028-01-20' }, { course: 'High Voltage Safety', date: '2025-05-10', certNo: 'HV-2025-045', validUntil: '2026-05-10' }], authorizations: ['Receive & Register Samples', 'Perform Safety Tests', 'Operate Insulation Testers', 'Chain of Custody Management'], joinDate: '2022-01-10', status: 'active' },
  { id: 'pm-4', name: 'Vikram Singh', employeeId: 'EMP-004', role: 'Test Engineer', department: 'Environmental Testing', qualifications: ['M.Sc. Materials Science', 'Thermal Chamber Specialist'], trainingRecords: [{ course: 'Environmental Chamber Operation', date: '2025-02-15', certNo: 'EC-2025-021', validUntil: '2027-02-15' }, { course: 'IEC 61215 TC/DH/HF Tests', date: '2025-08-01', certNo: 'ENV-2025-033', validUntil: '2027-08-01' }], authorizations: ['Operate Environmental Chambers', 'Perform TC/DH/HF Tests', 'Monitor Long-duration Tests', 'Prepare Test Data'], joinDate: '2022-06-01', status: 'active' },
  { id: 'pm-5', name: 'Sneha Reddy', employeeId: 'EMP-005', role: 'Quality Assurance Officer', department: 'Quality Assurance', qualifications: ['M.Tech Quality Engineering', 'ISO 9001 Lead Auditor'], trainingRecords: [{ course: 'ISO 9001:2015 Lead Auditor', date: '2024-11-10', certNo: 'IRCA-9001-2024-0089', validUntil: '2027-11-10' }, { course: 'Document Control Management', date: '2025-03-25', certNo: 'DCM-2025-011', validUntil: '2027-03-25' }], authorizations: ['Document Control', 'Internal Audit', 'CAPA Management', 'Compliance Monitoring'], joinDate: '2023-03-01', status: 'active' },
  { id: 'pm-6', name: 'Amit Desai', employeeId: 'EMP-006', role: 'Lab Technician', department: 'Mechanical Testing', qualifications: ['Diploma Mechanical Engineering'], trainingRecords: [{ course: 'Mechanical Load Testing', date: '2025-07-15', certNo: 'MLT-2025-009', validUntil: '2027-07-15' }], authorizations: ['Operate Mechanical Load Tester', 'Perform Hail Test', 'Assist with Sample Handling'], joinDate: '2023-09-01', status: 'active' },
  { id: 'pm-7', name: 'Kavitha Nair', employeeId: 'EMP-007', role: 'Data Analyst', department: 'Data & Reports', qualifications: ['M.Sc. Statistics', 'Python/Data Science'], trainingRecords: [{ course: 'Statistical Analysis for Labs', date: '2025-05-20', certNo: 'STAT-2025-015', validUntil: '2027-05-20' }, { course: 'ISO 17025 Uncertainty of Measurement', date: '2025-09-15', certNo: 'MU-2025-044', validUntil: '2027-09-15' }], authorizations: ['Perform Data Analysis', 'Generate Uncertainty Budgets', 'Prepare Analysis Reports'], joinDate: '2024-01-15', status: 'active' },
  { id: 'pm-8', name: 'Ravi Menon', employeeId: 'EMP-008', role: 'Lab Technician', department: 'Performance Testing', qualifications: ['B.Tech Electronics'], trainingRecords: [{ course: 'I-V Measurement Basics', date: '2025-10-01', certNo: 'IV-2025-058', validUntil: '2027-10-01' }], authorizations: ['Assist with I-V Measurements', 'Data Entry', 'Equipment Cleaning'], joinDate: '2024-06-01', status: 'active' },
]

// ============================================================================
// Standards Master
// ============================================================================

export interface StandardMasterEntry {
  id: string
  standardNumber: string
  title: string
  edition: string
  year: number
  category: string
  clauses: { clause: string; title: string; description: string }[]
  status: 'current' | 'superseded' | 'withdrawn'
  purchaseDate: string
  nextReviewDate: string
}

export const mockStandardsMaster: StandardMasterEntry[] = [
  { id: 'std-1', standardNumber: 'IEC 61215-1:2021', title: 'Terrestrial PV Modules - Design Qualification and Type Approval - Part 1: Test Requirements', edition: 'Ed. 2.0', year: 2021, category: 'Design Qualification', clauses: [{ clause: '10.1', title: 'Visual Inspection', description: 'Inspect for visible defects per MQT 01' }, { clause: '10.2', title: 'Maximum Power Determination', description: 'I-V curve measurement at STC per MQT 02' }, { clause: '10.11', title: 'Thermal Cycling', description: 'TC200 -40°C to +85°C per MQT 11' }, { clause: '10.13', title: 'Damp Heat', description: 'DH1000 85°C/85%RH per MQT 13' }], status: 'current', purchaseDate: '2021-06-15', nextReviewDate: '2026-06-15' },
  { id: 'std-2', standardNumber: 'IEC 61730-1:2016/AMD2:2021', title: 'PV Module Safety Qualification - Part 1: Requirements for Construction', edition: 'Ed. 2.2', year: 2021, category: 'Safety', clauses: [{ clause: '10.5', title: 'Impulse Voltage Test', description: 'MST 14' }, { clause: '10.6', title: 'Insulation Resistance', description: 'MST 16' }, { clause: '10.7', title: 'Wet Leakage Current', description: 'MST 17' }], status: 'current', purchaseDate: '2021-09-01', nextReviewDate: '2026-09-01' },
  { id: 'std-3', standardNumber: 'IEC 61853-1:2011', title: 'PV Module Performance Testing & Energy Rating - Part 1: Irradiance and Temperature', edition: 'Ed. 1.0', year: 2011, category: 'Energy Rating', clauses: [{ clause: '7', title: 'Power Rating', description: 'Multi-condition power matrix' }, { clause: '8', title: 'Energy Rating', description: 'Annual energy yield estimation' }], status: 'current', purchaseDate: '2018-01-01', nextReviewDate: '2026-01-01' },
  { id: 'std-4', standardNumber: 'IEC 60904-1:2020', title: 'PV Devices - Part 1: Measurement of I-V Characteristics', edition: 'Ed. 3.0', year: 2020, category: 'Measurement', clauses: [{ clause: '7', title: 'I-V Measurement', description: 'Standard procedure for I-V curve' }, { clause: '8', title: 'Data Reporting', description: 'Required data to report' }], status: 'current', purchaseDate: '2020-11-01', nextReviewDate: '2025-11-01' },
  { id: 'std-5', standardNumber: 'IEC 60904-9:2020', title: 'PV Devices - Part 9: Classification of Solar Simulator Characteristics', edition: 'Ed. 3.0', year: 2020, category: 'Solar Simulator', clauses: [{ clause: '5', title: 'Spectral Match', description: 'A+/A/B/C classification' }, { clause: '6', title: 'Spatial Uniformity', description: 'Non-uniformity of irradiance' }, { clause: '7', title: 'Temporal Instability', description: 'Short/long-term stability' }], status: 'current', purchaseDate: '2020-11-01', nextReviewDate: '2025-11-01' },
  { id: 'std-6', standardNumber: 'ISO/IEC 17025:2017', title: 'General Requirements for Competence of Testing and Calibration Laboratories', edition: 'Ed. 3.0', year: 2017, category: 'Lab Accreditation', clauses: [{ clause: '6.4', title: 'Equipment', description: 'Equipment management and calibration' }, { clause: '6.5', title: 'Metrological Traceability', description: 'Calibration traceability chain' }, { clause: '7.5', title: 'Technical Records', description: 'Record keeping requirements' }, { clause: '7.8', title: 'Reporting', description: 'Report content requirements' }], status: 'current', purchaseDate: '2018-01-01', nextReviewDate: '2026-01-01' },
]

// ============================================================================
// Customer Master
// ============================================================================

export interface CustomerMasterEntry {
  id: string
  customerCode: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  country: string
  projectCount: number
  activeProjects: number
  since: string
}

export const mockCustomerMaster: CustomerMasterEntry[] = [
  { id: 'cm-1', customerCode: 'CUST-001', name: 'SunPower Corporation', contactPerson: 'John Mitchell', email: 'testing@sunpower.com', phone: '+1-408-240-5500', address: 'San Jose, CA, USA', country: 'USA', projectCount: 5, activeProjects: 2, since: '2023-01-15' },
  { id: 'cm-2', customerCode: 'CUST-002', name: 'Trina Solar Co., Ltd.', contactPerson: 'Zhang Wei', email: 'qa@trinasolar.com', phone: '+86-519-8548-2008', address: 'Changzhou, Jiangsu, China', country: 'China', projectCount: 3, activeProjects: 1, since: '2024-03-10' },
  { id: 'cm-3', customerCode: 'CUST-003', name: 'JA Solar Holdings', contactPerson: 'Li Ming', email: 'lab@jasolar.com', phone: '+86-10-6361-8988', address: 'Beijing, China', country: 'China', projectCount: 2, activeProjects: 1, since: '2024-09-20' },
  { id: 'cm-4', customerCode: 'CUST-004', name: 'Canadian Solar Inc.', contactPerson: 'Sarah Thompson', email: 'testing@canadiansolar.com', phone: '+1-519-954-2057', address: 'Guelph, ON, Canada', country: 'Canada', projectCount: 4, activeProjects: 1, since: '2023-06-01' },
  { id: 'cm-5', customerCode: 'CUST-005', name: 'Adani Solar', contactPerson: 'Rahul Verma', email: 'qa@adanisolar.com', phone: '+91-79-2555-5555', address: 'Ahmedabad, Gujarat, India', country: 'India', projectCount: 6, activeProjects: 2, since: '2022-04-15' },
  { id: 'cm-6', customerCode: 'CUST-006', name: 'Waaree Energies', contactPerson: 'Deepak Joshi', email: 'testing@waaree.com', phone: '+91-22-2859-9999', address: 'Mumbai, Maharashtra, India', country: 'India', projectCount: 4, activeProjects: 1, since: '2023-02-10' },
]

// ============================================================================
// Supplier Master
// ============================================================================

export interface SupplierMasterEntry {
  id: string
  supplierCode: string
  name: string
  category: string
  contactPerson: string
  email: string
  phone: string
  address: string
  accreditation: string
  status: 'approved' | 'conditional' | 'under_evaluation'
  lastAuditDate: string
  nextAuditDue: string
}

export const mockSupplierMaster: SupplierMasterEntry[] = [
  { id: 'sp-1', supplierCode: 'SUP-001', name: 'Cal-Lab International', category: 'Calibration Lab', contactPerson: 'Michael Brown', email: 'service@cal-lab.com', phone: '+1-714-898-9001', address: 'Santa Ana, CA, USA', accreditation: 'ILAC/A2LA Accredited', status: 'approved', lastAuditDate: '2025-06-15', nextAuditDue: '2026-06-15' },
  { id: 'sp-2', supplierCode: 'SUP-002', name: 'NABL-AccLab Services', category: 'Calibration Lab', contactPerson: 'Dr. Suresh Patil', email: 'calibration@nablacclab.in', phone: '+91-20-2570-1234', address: 'Pune, Maharashtra, India', accreditation: 'NABL Accredited (TC-1234)', status: 'approved', lastAuditDate: '2025-09-20', nextAuditDue: '2026-09-20' },
  { id: 'sp-3', supplierCode: 'SUP-003', name: 'Pasan SA (Meyer Burger)', category: 'Equipment Supplier', contactPerson: 'Jean-Pierre Mueller', email: 'support@pasan.ch', phone: '+41-32-391-1234', address: 'Neuchatel, Switzerland', accreditation: 'ISO 9001:2015', status: 'approved', lastAuditDate: '2025-03-10', nextAuditDue: '2026-03-10' },
  { id: 'sp-4', supplierCode: 'SUP-004', name: 'Votsch Industrietechnik', category: 'Equipment Supplier', contactPerson: 'Hans Weber', email: 'service@voetsch.info', phone: '+49-7432-900-0', address: 'Balingen, Germany', accreditation: 'ISO 9001:2015', status: 'approved', lastAuditDate: '2025-04-20', nextAuditDue: '2026-04-20' },
  { id: 'sp-5', supplierCode: 'SUP-005', name: 'Keysight Technologies', category: 'Instrument Supplier', contactPerson: 'David Kim', email: 'support@keysight.com', phone: '+1-800-829-4444', address: 'Santa Rosa, CA, USA', accreditation: 'ISO 9001:2015 / ISO 17025', status: 'approved', lastAuditDate: '2025-07-15', nextAuditDue: '2026-07-15' },
  { id: 'sp-6', supplierCode: 'SUP-006', name: 'Fraunhofer ISE', category: 'Reference Cell Supplier / Cal Lab', contactPerson: 'Dr. Stefan Winter', email: 'pv-ref@ise.fraunhofer.de', phone: '+49-761-4588-0', address: 'Freiburg, Germany', accreditation: 'DAkkS Accredited', status: 'approved', lastAuditDate: '2025-01-20', nextAuditDue: '2027-01-20' },
]

// ============================================================================
// Audit Trail Entries
// ============================================================================

export interface AuditTrailLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'export' | 'view' | 'login' | 'logout'
  module: string
  documentId: string
  documentNumber: string
  fieldName: string
  oldValue: string
  newValue: string
  ipAddress: string
  details: string
}

export const mockAuditTrail: AuditTrailLogEntry[] = [
  { id: 'at-1', timestamp: '2026-03-10T08:01:00Z', userId: 'EMP-002', userName: 'Priya Sharma', action: 'login', module: 'Auth', documentId: '', documentNumber: '', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.42', details: 'Login from Performance Testing Lab workstation' },
  { id: 'at-2', timestamp: '2026-03-10T08:15:00Z', userId: 'EMP-002', userName: 'Priya Sharma', action: 'update', module: 'LIMS', documentId: 'te-3', documentNumber: 'TE-2026-00003', fieldName: 'rawData.cyclesCompleted', oldValue: '140', newValue: '142', ipAddress: '192.168.1.42', details: 'Updated TC200 cycle count from chamber data logger' },
  { id: 'at-3', timestamp: '2026-03-10T08:30:00Z', userId: 'EMP-003', userName: 'Rajesh Kumar', action: 'login', module: 'Auth', documentId: '', documentNumber: '', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.55', details: 'Login from Sample Management workstation' },
  { id: 'at-4', timestamp: '2026-03-10T08:45:00Z', userId: 'EMP-003', userName: 'Rajesh Kumar', action: 'create', module: 'LIMS', documentId: 'sample-new', documentNumber: 'SAMPLE-2026-00006', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.55', details: 'New sample registration - LONGi LR5-72HBD-555M' },
  { id: 'at-5', timestamp: '2026-03-10T09:00:00Z', userId: 'EMP-001', userName: 'Dr. Anand Patel', action: 'approve', module: 'QMS', documentId: 'doc-3', documentNumber: 'SOP-CAL-001', fieldName: 'status', oldValue: 'in_review', newValue: 'approved', ipAddress: '192.168.1.10', details: 'Approved SOP v4.0 for equipment calibration management' },
  { id: 'at-6', timestamp: '2026-03-10T09:15:00Z', userId: 'EMP-005', userName: 'Sneha Reddy', action: 'create', module: 'QMS', documentId: 'ncr-new', documentNumber: 'NCR-2026-004', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.33', details: 'Raised NCR for expired reagent found in chemistry lab' },
  { id: 'at-7', timestamp: '2026-03-10T09:30:00Z', userId: 'EMP-002', userName: 'Priya Sharma', action: 'export', module: 'Reports', documentId: 'tr-3', documentNumber: 'TR-60904-2026-003', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.42', details: 'Exported test report as HTML for client review' },
  { id: 'at-8', timestamp: '2026-03-10T09:45:00Z', userId: 'EMP-001', userName: 'Dr. Anand Patel', action: 'update', module: 'CAPA', documentId: 'capa-1', documentNumber: 'CAPA-2026-001', fieldName: 'eightDSteps[6].status', oldValue: 'in_progress', newValue: 'completed', ipAddress: '192.168.1.10', details: 'D7 Prevention step completed - automated lamp tracking live' },
  { id: 'at-9', timestamp: '2026-03-10T10:00:00Z', userId: 'EMP-004', userName: 'Vikram Singh', action: 'update', module: 'Equipment', documentId: 'eq-2', documentNumber: 'TC-001', fieldName: 'status', oldValue: 'in_use', newValue: 'maintenance', ipAddress: '192.168.1.60', details: 'Thermal chamber placed under scheduled maintenance' },
  { id: 'at-10', timestamp: '2026-03-10T10:15:00Z', userId: 'EMP-002', userName: 'Priya Sharma', action: 'view', module: 'Traceability', documentId: 'tc-1', documentNumber: '', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.42', details: 'Viewed traceability chain for PROJECT-2026-00001' },
  { id: 'at-11', timestamp: '2026-03-09T16:00:00Z', userId: 'EMP-003', userName: 'Rajesh Kumar', action: 'update', module: 'LIMS', documentId: 'sample-4', documentNumber: 'SAMPLE-2026-00004', fieldName: 'status', oldValue: 'in_test', newValue: 'pending_review', ipAddress: '192.168.1.55', details: 'All tests completed, moved to review queue' },
  { id: 'at-12', timestamp: '2026-03-09T14:00:00Z', userId: 'EMP-007', userName: 'Kavitha Nair', action: 'create', module: 'Analysis', documentId: 'da-2', documentNumber: 'DA-60904-2026-002', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.77', details: 'Created I-V curve analysis report for JA Solar module' },
  { id: 'at-13', timestamp: '2026-03-09T11:00:00Z', userId: 'EMP-001', userName: 'Dr. Anand Patel', action: 'create', module: 'Audit', documentId: 'ar-3', documentNumber: 'AR-2026-003', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.10', details: 'Internal audit report - Sample Management Q1 2026' },
  { id: 'at-14', timestamp: '2026-03-09T09:00:00Z', userId: 'EMP-005', userName: 'Sneha Reddy', action: 'update', module: 'QMS', documentId: 'doc-1', documentNumber: 'SOP-LIMS-001', fieldName: 'expiryDate', oldValue: '2027-01-01', newValue: '2027-06-01', ipAddress: '192.168.1.33', details: 'Extended SOP validity per management review decision' },
  { id: 'at-15', timestamp: '2026-03-08T15:00:00Z', userId: 'EMP-002', userName: 'Priya Sharma', action: 'create', module: 'Reports', documentId: 'tr-4', documentNumber: 'TR-61215-2026-004', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.42', details: 'Created TC test report for Canadian Solar module' },
  { id: 'at-16', timestamp: '2026-03-08T10:00:00Z', userId: 'EMP-006', userName: 'Amit Desai', action: 'update', module: 'Equipment', documentId: 'eq-5', documentNumber: 'ML-001', fieldName: 'status', oldValue: 'available', newValue: 'maintenance', ipAddress: '192.168.1.65', details: 'Hydraulic pump replacement started' },
  { id: 'at-17', timestamp: '2026-03-07T14:30:00Z', userId: 'EMP-003', userName: 'Rajesh Kumar', action: 'create', module: 'Calibration', documentId: 'cal-new', documentNumber: 'CAL-SS001-2026-002', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.55', details: 'Uploaded interim calibration certificate for SS-001' },
  { id: 'at-18', timestamp: '2026-03-07T09:00:00Z', userId: 'EMP-001', userName: 'Dr. Anand Patel', action: 'approve', module: 'Reports', documentId: 'tr-2', documentNumber: 'TR-61730-2026-002', fieldName: 'status', oldValue: 'pending_review', newValue: 'approved', ipAddress: '192.168.1.10', details: 'Approved IEC 61730 safety qualification report' },
  { id: 'at-19', timestamp: '2026-03-06T16:00:00Z', userId: 'EMP-002', userName: 'Priya Sharma', action: 'export', module: 'Uncertainty', documentId: 'unc-1', documentNumber: 'UNC-2026-001', fieldName: '', oldValue: '', newValue: '', ipAddress: '192.168.1.42', details: 'Exported uncertainty budget PDF for Pmax measurement' },
  { id: 'at-20', timestamp: '2026-03-06T11:00:00Z', userId: 'EMP-005', userName: 'Sneha Reddy', action: 'update', module: 'CAPA', documentId: 'capa-2', documentNumber: 'CAPA-2026-002', fieldName: 'status', oldValue: 'investigation', newValue: 'root_cause_identified', ipAddress: '192.168.1.33', details: 'Root cause confirmed: manual CoC system inadequate' },
]

// ============================================================================
// Helper: Get document type distribution for charts
// ============================================================================

export function getDocumentTypeDistribution(): { type: string; count: number }[] {
  const counts: Record<string, number> = {}
  mockDocumentRegistry.forEach((d) => {
    const label = d.documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    counts[label] = (counts[label] || 0) + 1
  })
  return Object.entries(counts).map(([type, count]) => ({ type, count }))
}

export function getMonthlyDocumentTrend(): { month: string; count: number }[] {
  return [
    { month: 'Oct', count: 5 },
    { month: 'Nov', count: 8 },
    { month: 'Dec', count: 7 },
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 10 },
    { month: 'Mar', count: 14 },
  ]
}
