import type {
  ServiceRequest,
  ApprovalWorkflowEntry,
  BOMEntry,
  ProjectSchedule,
  AuditTrailEntry,
  LabCertificate,
} from '@/lib/types'

// ============================================================================
// Service Requests
// ============================================================================

export const serviceRequests: ServiceRequest[] = [
  {
    id: 'SR-001',
    requestNumber: 'SR-2026-00001',
    clientName: 'SunPower Corp',
    clientEmail: 'testing@sunpower.com',
    clientOrganization: 'SunPower Corporation',
    clientPhone: '+1-408-555-0123',
    testStandards: ['IEC 61215', 'IEC 61730'],
    moduleDetails: [
      {
        manufacturer: 'SunPower',
        modelNumber: 'SPR-MAX6-450',
        quantity: 8,
        moduleType: 'Monocrystalline PERC',
        cellTechnology: 'IBC',
        ratedPower: 450,
        dimensions: { length: 2094, width: 1038, thickness: 40 },
      },
    ],
    specialRequirements: 'Full IEC 61215 Design Qualification & IEC 61730 Safety Qualification. Expedited testing required.',
    requestedDeliveryDate: '2026-05-15',
    status: 'testing',
    priority: 'high',
    quoteAmount: 2850000,
    quoteValidUntil: '2026-02-28',
    quoteSentAt: '2026-01-18T10:00:00Z',
    quoteApprovedAt: '2026-01-20T14:30:00Z',
    assignedLabManager: 'Dr. Rajesh Kumar',
    projectId: 'PROJECT-2026-00001',
    sampleIds: ['SAMPLE-2026-00001', 'SAMPLE-2026-00002'],
    notes: 'Priority client. BIS certification support needed.',
    communicationLog: [
      { timestamp: '2026-01-15T09:00:00Z', from: 'SunPower Corp', to: 'Lab Reception', subject: 'Test Request Submission', message: 'Requesting full IEC 61215 & 61730 qualification for new MAX6-450 module.', type: 'email' },
      { timestamp: '2026-01-18T10:00:00Z', from: 'Dr. Rajesh Kumar', to: 'SunPower Corp', subject: 'Quotation - SR-2026-00001', message: 'Please find attached our quotation for the requested testing services.', type: 'email' },
      { timestamp: '2026-01-20T14:30:00Z', from: 'SunPower Corp', to: 'Dr. Rajesh Kumar', subject: 'RE: Quotation Approved', message: 'We approve the quotation. Please proceed with sample receipt arrangements.', type: 'email' },
    ],
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'SR-002',
    requestNumber: 'SR-2026-00002',
    clientName: 'Tata Power Solar',
    clientEmail: 'quality@tatapower.com',
    clientOrganization: 'Tata Power Solar Systems Ltd',
    clientPhone: '+91-80-2222-0456',
    testStandards: ['IEC 61853'],
    moduleDetails: [
      {
        manufacturer: 'Tata Power Solar',
        modelNumber: 'TP-DCR-545-BF',
        quantity: 4,
        moduleType: 'Bifacial Mono PERC',
        cellTechnology: 'TOPCon',
        ratedPower: 545,
        dimensions: { length: 2278, width: 1134, thickness: 35 },
      },
    ],
    specialRequirements: 'IEC 61853-1 to 61853-4 energy rating tests. Include bifacial characterization.',
    requestedDeliveryDate: '2026-04-30',
    status: 'quote_sent',
    priority: 'normal',
    quoteAmount: 1650000,
    quoteValidUntil: '2026-03-31',
    quoteSentAt: '2026-03-05T11:00:00Z',
    quoteApprovedAt: null,
    assignedLabManager: 'Dr. Rajesh Kumar',
    projectId: null,
    sampleIds: [],
    notes: 'New bifacial module line. Need energy rating for ALMM listing.',
    communicationLog: [
      { timestamp: '2026-03-01T10:00:00Z', from: 'Tata Power Solar', to: 'Lab Reception', subject: 'Energy Rating Test Request', message: 'We require IEC 61853 energy rating for our new bifacial module for ALMM listing.', type: 'email' },
      { timestamp: '2026-03-05T11:00:00Z', from: 'Dr. Rajesh Kumar', to: 'Tata Power Solar', subject: 'Quotation - SR-2026-00002', message: 'Please find our quotation for IEC 61853 testing services.', type: 'email' },
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-05T11:00:00Z',
  },
  {
    id: 'SR-003',
    requestNumber: 'SR-2026-00003',
    clientName: 'Adani Solar',
    clientEmail: 'lab@adanisolar.com',
    clientOrganization: 'Adani Solar Energy',
    clientPhone: '+91-79-2555-0789',
    testStandards: ['IEC 61215', 'IEC 61730', 'IEC 62716'],
    moduleDetails: [
      {
        manufacturer: 'Adani Solar',
        modelNumber: 'ASE-HJT-700',
        quantity: 12,
        moduleType: 'HJT Bifacial',
        cellTechnology: 'HJT',
        ratedPower: 700,
        dimensions: { length: 2384, width: 1303, thickness: 35 },
      },
    ],
    specialRequirements: 'Full qualification + ammonia resistance testing per IEC 62716. Urgent timeline.',
    requestedDeliveryDate: '2026-06-30',
    status: 'submitted',
    priority: 'urgent',
    quoteAmount: null,
    quoteValidUntil: null,
    quoteSentAt: null,
    quoteApprovedAt: null,
    assignedLabManager: 'Dr. Priya Sharma',
    projectId: null,
    sampleIds: [],
    notes: 'New HJT module for international markets. Needs expedited processing.',
    communicationLog: [
      { timestamp: '2026-03-08T08:00:00Z', from: 'Adani Solar', to: 'Lab Reception', subject: 'Urgent Test Request - HJT Module', message: 'Requesting qualification testing for our new 700W HJT module.', type: 'email' },
    ],
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-03-08T08:00:00Z',
  },
  {
    id: 'SR-004',
    requestNumber: 'SR-2026-00004',
    clientName: 'Vikram Solar',
    clientEmail: 'certification@vikramsolar.com',
    clientOrganization: 'Vikram Solar Ltd',
    clientPhone: '+91-33-4040-1234',
    testStandards: ['IEC 61215', 'IEC 60904'],
    moduleDetails: [
      {
        manufacturer: 'Vikram Solar',
        modelNumber: 'VS-ELDORA-580',
        quantity: 6,
        moduleType: 'Mono PERC Half-Cut',
        cellTechnology: 'PERC',
        ratedPower: 580,
        dimensions: { length: 2278, width: 1134, thickness: 35 },
      },
    ],
    specialRequirements: 'Design qualification and I-V characterization at STC/NOCT conditions.',
    requestedDeliveryDate: '2026-05-31',
    status: 'sample_received',
    priority: 'normal',
    quoteAmount: 1950000,
    quoteValidUntil: '2026-03-15',
    quoteSentAt: '2026-02-10T09:00:00Z',
    quoteApprovedAt: '2026-02-14T16:00:00Z',
    assignedLabManager: 'Dr. Rajesh Kumar',
    projectId: 'PROJECT-2026-00004',
    sampleIds: ['SAMPLE-2026-00008', 'SAMPLE-2026-00009'],
    notes: 'ALMM listing application support.',
    communicationLog: [
      { timestamp: '2026-02-05T09:00:00Z', from: 'Vikram Solar', to: 'Lab Reception', subject: 'Qualification Test Request', message: 'Need IEC 61215 qualification for ELDORA-580.', type: 'email' },
      { timestamp: '2026-02-10T09:00:00Z', from: 'Dr. Rajesh Kumar', to: 'Vikram Solar', subject: 'Quotation', message: 'Quote attached for requested testing.', type: 'email' },
      { timestamp: '2026-02-14T16:00:00Z', from: 'Vikram Solar', to: 'Dr. Rajesh Kumar', subject: 'Quote Approved', message: 'PO raised. Samples shipping next week.', type: 'email' },
      { timestamp: '2026-02-22T10:00:00Z', from: 'Lab Reception', to: 'Dr. Rajesh Kumar', subject: 'Samples Received', message: '6 modules received. Visual inspection pending.', type: 'internal_note' },
    ],
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-02-22T10:00:00Z',
  },
  {
    id: 'SR-005',
    requestNumber: 'SR-2026-00005',
    clientName: 'Waaree Energies',
    clientEmail: 'testing@waaree.com',
    clientOrganization: 'Waaree Energies Ltd',
    clientPhone: '+91-22-6666-5678',
    testStandards: ['IEC 61730'],
    moduleDetails: [
      {
        manufacturer: 'Waaree',
        modelNumber: 'WS-610-BG',
        quantity: 4,
        moduleType: 'Bifacial Glass-Glass',
        cellTechnology: 'TOPCon',
        ratedPower: 610,
        dimensions: { length: 2384, width: 1134, thickness: 30 },
      },
    ],
    specialRequirements: 'Safety qualification only. Expedited 4-week timeline.',
    requestedDeliveryDate: '2026-04-15',
    status: 'delivered',
    priority: 'high',
    quoteAmount: 980000,
    quoteValidUntil: '2026-02-15',
    quoteSentAt: '2026-01-10T09:00:00Z',
    quoteApprovedAt: '2026-01-12T11:00:00Z',
    assignedLabManager: 'Dr. Priya Sharma',
    projectId: 'PROJECT-2026-00005',
    sampleIds: ['SAMPLE-2026-00010', 'SAMPLE-2026-00011'],
    notes: 'Completed. Final report and certificate delivered.',
    communicationLog: [
      { timestamp: '2026-01-08T09:00:00Z', from: 'Waaree Energies', to: 'Lab Reception', subject: 'Safety Test Request', message: 'IEC 61730 safety qualification for WS-610-BG.', type: 'email' },
      { timestamp: '2026-03-01T10:00:00Z', from: 'Dr. Priya Sharma', to: 'Waaree Energies', subject: 'Test Report Delivered', message: 'Final test report and certificate attached.', type: 'email' },
    ],
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
]

// ============================================================================
// Approval Workflows
// ============================================================================

export const approvalWorkflows: ApprovalWorkflowEntry[] = [
  {
    id: 'AW-001',
    recordId: 'TEST-2026-00001',
    recordType: 'test_result',
    currentLevel: 'approver',
    approvals: [
      { level: 'technician', approverName: 'Amit Patel', approverId: 'TECH-001', status: 'approved', digitalSignature: 'DS-TECH-001-20260215', comments: 'Test data verified. Results within expected range.', timestamp: '2026-02-15T10:00:00Z' },
      { level: 'reviewer', approverName: 'Dr. Meena Singh', approverId: 'REV-001', status: 'approved', digitalSignature: 'DS-REV-001-20260216', comments: 'Reviewed methodology and calculations. Approved.', timestamp: '2026-02-16T14:00:00Z' },
      { level: 'approver', approverName: 'Dr. Rajesh Kumar', approverId: 'APR-001', status: 'pending', digitalSignature: null, comments: '', timestamp: null },
      { level: 'lab_manager', approverName: 'Dr. Suresh Nair', approverId: 'LM-001', status: 'pending', digitalSignature: null, comments: '', timestamp: null },
    ],
    status: 'in_progress',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-16T14:00:00Z',
  },
  {
    id: 'AW-002',
    recordId: 'TEST-2026-00003',
    recordType: 'test_result',
    currentLevel: 'reviewer',
    approvals: [
      { level: 'technician', approverName: 'Rohit Verma', approverId: 'TECH-003', status: 'approved', digitalSignature: 'DS-TECH-003-20260305', comments: 'Dielectric withstand test completed. All parameters recorded.', timestamp: '2026-03-05T16:00:00Z' },
      { level: 'reviewer', approverName: 'Dr. Meena Singh', approverId: 'REV-001', status: 'pending', digitalSignature: null, comments: '', timestamp: null },
      { level: 'approver', approverName: 'Dr. Priya Sharma', approverId: 'APR-002', status: 'pending', digitalSignature: null, comments: '', timestamp: null },
      { level: 'lab_manager', approverName: 'Dr. Suresh Nair', approverId: 'LM-001', status: 'pending', digitalSignature: null, comments: '', timestamp: null },
    ],
    status: 'in_progress',
    createdAt: '2026-03-05T16:00:00Z',
    updatedAt: '2026-03-05T16:00:00Z',
  },
  {
    id: 'AW-003',
    recordId: 'CERT-2026-00001',
    recordType: 'certificate',
    currentLevel: 'lab_manager',
    approvals: [
      { level: 'technician', approverName: 'Amit Patel', approverId: 'TECH-001', status: 'approved', digitalSignature: 'DS-TECH-001-20260225', comments: 'All test data compiled and verified.', timestamp: '2026-02-25T10:00:00Z' },
      { level: 'reviewer', approverName: 'Dr. Meena Singh', approverId: 'REV-001', status: 'approved', digitalSignature: 'DS-REV-001-20260226', comments: 'Report reviewed. Calculations verified.', timestamp: '2026-02-26T09:00:00Z' },
      { level: 'approver', approverName: 'Dr. Priya Sharma', approverId: 'APR-002', status: 'approved', digitalSignature: 'DS-APR-002-20260227', comments: 'Approved for certificate issuance.', timestamp: '2026-02-27T11:00:00Z' },
      { level: 'lab_manager', approverName: 'Dr. Suresh Nair', approverId: 'LM-001', status: 'pending', digitalSignature: null, comments: '', timestamp: null },
    ],
    status: 'in_progress',
    createdAt: '2026-02-25T10:00:00Z',
    updatedAt: '2026-02-27T11:00:00Z',
  },
]

// ============================================================================
// BOM (Bill of Materials) Entries
// ============================================================================

export const bomEntries: BOMEntry[] = [
  { id: 'BOM-001', sampleId: 'SAMPLE-2026-00001', component: 'Solar Cells', specification: 'IBC Mono c-Si, 166mm x 166mm', manufacturer: 'SunPower', partNumber: 'SP-CELL-IBC-166', quantity: 120, unit: 'pcs', certificationRef: 'UL 61730-1 certified', verified: true, verifiedBy: 'Amit Patel', verifiedAt: '2026-01-16T10:00:00Z' },
  { id: 'BOM-002', sampleId: 'SAMPLE-2026-00001', component: 'EVA Encapsulant', specification: 'Fast-cure EVA, 0.45mm thickness', manufacturer: 'Hangzhou First', partNumber: 'HF-EVA-045', quantity: 2, unit: 'rolls', certificationRef: 'IEC 62788-1-6 tested', verified: true, verifiedBy: 'Amit Patel', verifiedAt: '2026-01-16T10:15:00Z' },
  { id: 'BOM-003', sampleId: 'SAMPLE-2026-00001', component: 'Backsheet', specification: 'TPT White, 350um', manufacturer: 'Cybrid Technologies', partNumber: 'CYB-TPT-350W', quantity: 1, unit: 'sheet', certificationRef: 'UL 746C listed', verified: true, verifiedBy: 'Amit Patel', verifiedAt: '2026-01-16T10:30:00Z' },
  { id: 'BOM-004', sampleId: 'SAMPLE-2026-00001', component: 'Front Glass', specification: 'AR-coated tempered glass, 3.2mm', manufacturer: 'Xinyi Solar', partNumber: 'XY-AR-3.2', quantity: 1, unit: 'sheet', certificationRef: 'IEC 61730-1 Cl. 10.5', verified: true, verifiedBy: 'Amit Patel', verifiedAt: '2026-01-16T10:45:00Z' },
  { id: 'BOM-005', sampleId: 'SAMPLE-2026-00001', component: 'Junction Box', specification: 'IP68, 3-diode, 25A rated', manufacturer: 'Staubli', partNumber: 'ST-JB-3D-25A', quantity: 1, unit: 'pcs', certificationRef: 'TUV certified', verified: true, verifiedBy: 'Amit Patel', verifiedAt: '2026-01-16T11:00:00Z' },
  { id: 'BOM-006', sampleId: 'SAMPLE-2026-00001', component: 'Frame', specification: 'Anodized aluminium, 40mm profile', manufacturer: 'Alu Solar', partNumber: 'AS-FR-40-BLK', quantity: 1, unit: 'set', certificationRef: 'EN 573-3 certified', verified: false, verifiedBy: null, verifiedAt: null },
  { id: 'BOM-007', sampleId: 'SAMPLE-2026-00001', component: 'Ribbon/Busbar', specification: 'Copper ribbon, Sn-Pb-Ag coated', manufacturer: 'Ulbrich', partNumber: 'UL-RIB-0.2', quantity: 1, unit: 'spool', certificationRef: 'RoHS compliant', verified: true, verifiedBy: 'Rohit Verma', verifiedAt: '2026-01-17T09:00:00Z' },
  { id: 'BOM-008', sampleId: 'SAMPLE-2026-00001', component: 'Connectors', specification: 'MC4 compatible, IP68', manufacturer: 'Staubli', partNumber: 'ST-MC4-EVO2', quantity: 2, unit: 'pcs', certificationRef: 'TUV certified to EN 50521', verified: true, verifiedBy: 'Rohit Verma', verifiedAt: '2026-01-17T09:15:00Z' },
]

// ============================================================================
// Project Schedules
// ============================================================================

export const projectSchedules: ProjectSchedule[] = [
  {
    id: 'PS-001',
    projectId: 'PROJECT-2026-00001',
    projectName: 'SunPower MAX6-450 Full Qualification',
    clientName: 'SunPower Corp',
    milestones: [
      { id: 'M-001', name: 'Sample Receipt & Inspection', description: 'Receive and inspect 8 modules', startDate: '2026-01-15', endDate: '2026-01-18', status: 'completed', progress: 100, assignedTo: 'Amit Patel', dependencies: [] },
      { id: 'M-002', name: 'Initial I-V Measurement (STC)', description: 'I-V curve measurement at STC for all samples', startDate: '2026-01-20', endDate: '2026-01-22', status: 'completed', progress: 100, assignedTo: 'Deepa Krishnan', dependencies: ['M-001'] },
      { id: 'M-003', name: 'Visual Inspection (IEC 61215 Cl. 10.1)', description: 'Detailed visual inspection per standard', startDate: '2026-01-20', endDate: '2026-01-21', status: 'completed', progress: 100, assignedTo: 'Amit Patel', dependencies: ['M-001'] },
      { id: 'M-004', name: 'Thermal Cycling TC200 (IEC 61215 Cl. 10.11)', description: '200 thermal cycles from -40C to +85C', startDate: '2026-02-01', endDate: '2026-03-15', status: 'in_progress', progress: 65, assignedTo: 'Rohit Verma', dependencies: ['M-002'] },
      { id: 'M-005', name: 'Damp Heat DH1000 (IEC 61215 Cl. 10.13)', description: '1000 hours at 85C/85%RH', startDate: '2026-02-01', endDate: '2026-03-25', status: 'in_progress', progress: 55, assignedTo: 'Rohit Verma', dependencies: ['M-002'] },
      { id: 'M-006', name: 'Safety Tests (IEC 61730)', description: 'Insulation, dielectric, grounding tests', startDate: '2026-03-20', endDate: '2026-04-05', status: 'pending', progress: 0, assignedTo: 'Kavitha Rajan', dependencies: ['M-004'] },
      { id: 'M-007', name: 'Final I-V & Degradation Analysis', description: 'Post-stress I-V measurement and degradation calculation', startDate: '2026-04-05', endDate: '2026-04-10', status: 'pending', progress: 0, assignedTo: 'Deepa Krishnan', dependencies: ['M-004', 'M-005'] },
      { id: 'M-008', name: 'Report Generation & Review', description: 'Generate test report and internal review', startDate: '2026-04-10', endDate: '2026-04-20', status: 'pending', progress: 0, assignedTo: 'Dr. Meena Singh', dependencies: ['M-006', 'M-007'] },
      { id: 'M-009', name: 'Certificate Issuance & Delivery', description: 'Issue certificate and deliver to client', startDate: '2026-04-20', endDate: '2026-04-25', status: 'pending', progress: 0, assignedTo: 'Dr. Rajesh Kumar', dependencies: ['M-008'] },
    ],
    startDate: '2026-01-15',
    targetEndDate: '2026-04-25',
    actualEndDate: null,
    status: 'in_progress',
    overallProgress: 42,
  },
  {
    id: 'PS-002',
    projectId: 'PROJECT-2026-00005',
    projectName: 'Waaree WS-610-BG Safety Qualification',
    clientName: 'Waaree Energies',
    milestones: [
      { id: 'M-010', name: 'Sample Receipt', description: 'Receive 4 modules', startDate: '2026-01-15', endDate: '2026-01-16', status: 'completed', progress: 100, assignedTo: 'Kavitha Rajan', dependencies: [] },
      { id: 'M-011', name: 'Insulation Resistance Test', description: 'IEC 61730 Cl. 10.3', startDate: '2026-01-17', endDate: '2026-01-20', status: 'completed', progress: 100, assignedTo: 'Kavitha Rajan', dependencies: ['M-010'] },
      { id: 'M-012', name: 'Dielectric Withstand Test', description: 'IEC 61730 Cl. 10.4', startDate: '2026-01-21', endDate: '2026-01-25', status: 'completed', progress: 100, assignedTo: 'Kavitha Rajan', dependencies: ['M-011'] },
      { id: 'M-013', name: 'Ground Continuity Test', description: 'IEC 61730 Cl. 10.10', startDate: '2026-01-26', endDate: '2026-01-28', status: 'completed', progress: 100, assignedTo: 'Kavitha Rajan', dependencies: ['M-012'] },
      { id: 'M-014', name: 'Report & Certificate', description: 'Final report and certificate issuance', startDate: '2026-02-01', endDate: '2026-02-10', status: 'completed', progress: 100, assignedTo: 'Dr. Priya Sharma', dependencies: ['M-013'] },
    ],
    startDate: '2026-01-15',
    targetEndDate: '2026-02-15',
    actualEndDate: '2026-02-10',
    status: 'completed',
    overallProgress: 100,
  },
]

// ============================================================================
// Audit Trail
// ============================================================================

export const auditTrailEntries: AuditTrailEntry[] = [
  { id: 'AT-001', recordId: 'SAMPLE-2026-00001', recordType: 'sample', fieldName: 'status', oldValue: 'received', newValue: 'inspected', changedBy: 'Amit Patel', changedAt: '2026-01-15T14:00:00Z', reason: 'Visual inspection completed', version: 2 },
  { id: 'AT-002', recordId: 'SAMPLE-2026-00001', recordType: 'sample', fieldName: 'currentLocation', oldValue: 'Receiving Area', newValue: 'Incoming Inspection', changedBy: 'Amit Patel', changedAt: '2026-01-15T14:00:00Z', reason: 'Moved for inspection', version: 2 },
  { id: 'AT-003', recordId: 'SAMPLE-2026-00001', recordType: 'sample', fieldName: 'status', oldValue: 'inspected', newValue: 'in_test', changedBy: 'Deepa Krishnan', changedAt: '2026-01-20T08:00:00Z', reason: 'Initial I-V measurement started', version: 3 },
  { id: 'AT-004', recordId: 'SAMPLE-2026-00001', recordType: 'sample', fieldName: 'currentLocation', oldValue: 'Rack A-12', newValue: 'Solar Simulator Lab', changedBy: 'Deepa Krishnan', changedAt: '2026-01-20T08:00:00Z', reason: 'Moved for I-V testing', version: 3 },
  { id: 'AT-005', recordId: 'SAMPLE-2026-00001', recordType: 'sample', fieldName: 'currentLocation', oldValue: 'Solar Simulator Lab', newValue: 'Environmental Chamber Lab', changedBy: 'Rohit Verma', changedAt: '2026-02-01T08:00:00Z', reason: 'Starting thermal cycling TC200', version: 4 },
  { id: 'AT-006', recordId: 'TEST-2026-00001', recordType: 'test', fieldName: 'status', oldValue: 'not_started', newValue: 'in_progress', changedBy: 'Deepa Krishnan', changedAt: '2026-01-20T08:30:00Z', reason: 'I-V measurement initiated', version: 2 },
  { id: 'AT-007', recordId: 'TEST-2026-00001', recordType: 'test', fieldName: 'status', oldValue: 'in_progress', newValue: 'completed', changedBy: 'Deepa Krishnan', changedAt: '2026-01-22T16:00:00Z', reason: 'Measurement completed. Results within spec.', version: 3 },
  { id: 'AT-008', recordId: 'TEST-2026-00002', recordType: 'test', fieldName: 'results.pmax', oldValue: '448.5', newValue: '449.2', changedBy: 'Dr. Meena Singh', changedAt: '2026-02-16T14:30:00Z', reason: 'Recalculated after spectral correction factor update', version: 2 },
  { id: 'AT-009', recordId: 'SR-2026-00001', recordType: 'service_request', fieldName: 'status', oldValue: 'quote_sent', newValue: 'quote_approved', changedBy: 'System', changedAt: '2026-01-20T14:30:00Z', reason: 'Client approved quotation via email', version: 3 },
  { id: 'AT-010', recordId: 'SR-2026-00001', recordType: 'service_request', fieldName: 'status', oldValue: 'sample_received', newValue: 'testing', changedBy: 'Dr. Rajesh Kumar', changedAt: '2026-01-25T09:00:00Z', reason: 'All samples received and accepted. Testing initiated.', version: 5 },
]

// ============================================================================
// Lab Certificates
// ============================================================================

export const labCertificates: LabCertificate[] = [
  {
    id: 'CERT-001',
    certificateNumber: 'CERT-SLX-2026-00001',
    projectId: 'PROJECT-2026-00005',
    sampleId: 'SAMPLE-2026-00010',
    clientName: 'Waaree Energies',
    testStandard: 'IEC 61730',
    issueDate: '2026-02-10',
    validUntil: '2029-02-10',
    accreditationBody: 'NABL',
    accreditationNumber: 'TC-10234',
    labName: 'SolarLabX National PV Testing Centre',
    signatories: [
      { name: 'Dr. Priya Sharma', title: 'Test Engineer', role: 'approver', signedAt: '2026-02-09T10:00:00Z', digitalSignature: 'DS-APR-002-CERT001' },
      { name: 'Dr. Suresh Nair', title: 'Lab Director', role: 'lab_manager', signedAt: '2026-02-10T09:00:00Z', digitalSignature: 'DS-LM-001-CERT001' },
    ],
    testResults: [
      { testName: 'Insulation Resistance (Dry)', standard: 'IEC 61730', clause: '10.3', result: 'pass', value: '> 400 MΩ·m²', acceptanceCriteria: '> 40 MΩ·m²' },
      { testName: 'Insulation Resistance (Wet)', standard: 'IEC 61730', clause: '10.3', result: 'pass', value: '> 200 MΩ·m²', acceptanceCriteria: '> 40 MΩ·m²' },
      { testName: 'Dielectric Withstand (Dry)', standard: 'IEC 61730', clause: '10.4', result: 'pass', value: 'No breakdown at 3000V DC', acceptanceCriteria: 'No breakdown at test voltage' },
      { testName: 'Ground Continuity', standard: 'IEC 61730', clause: '10.10', result: 'pass', value: '0.08 Ω', acceptanceCriteria: '< 0.1 Ω' },
    ],
    status: 'issued',
    version: 1,
  },
]

// ============================================================================
// LIMS Dashboard Metrics
// ============================================================================

export const limsDashboardMetrics = {
  serviceRequestsByStatus: [
    { status: 'Submitted', count: 3, color: '#3B82F6' },
    { status: 'Under Review', count: 2, color: '#F59E0B' },
    { status: 'Quote Sent', count: 4, color: '#8B5CF6' },
    { status: 'In Testing', count: 6, color: '#10B981' },
    { status: 'Delivered', count: 12, color: '#6B7280' },
  ],
  testProgressByProject: [
    { project: 'SunPower MAX6', total: 12, completed: 5, inProgress: 4, pending: 3 },
    { project: 'Vikram ELDORA', total: 8, completed: 2, inProgress: 3, pending: 3 },
    { project: 'Tata TP-DCR', total: 6, completed: 0, inProgress: 0, pending: 6 },
  ],
  monthlyThroughput: [
    { month: 'Oct', samples: 8, tests: 24, reports: 6 },
    { month: 'Nov', samples: 12, tests: 35, reports: 9 },
    { month: 'Dec', samples: 10, tests: 28, reports: 8 },
    { month: 'Jan', samples: 15, tests: 42, reports: 11 },
    { month: 'Feb', samples: 11, tests: 38, reports: 10 },
    { month: 'Mar', samples: 6, tests: 18, reports: 4 },
  ],
  pendingApprovals: 5,
  activeProjects: 4,
  samplesInLab: 18,
  calibrationDueSoon: 3,
}
