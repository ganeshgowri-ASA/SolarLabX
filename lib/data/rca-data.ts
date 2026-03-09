import type { RCA } from '@/lib/types'

export const rcaRecords: RCA[] = [
  {
    id: 'RCA-001',
    rcaNumber: 'RCA-2026-00001',
    title: 'Thermal Cycling Test Failure - Connector Delamination',
    description: 'During TC200 thermal cycling test on Module Batch BATCH-2025-Q4-012, junction box connector showed delamination after 150 cycles. Detected during intermediate I-V measurement showing increased series resistance.',
    status: 'implementation',
    priority: 'high',
    source: 'test_failure',
    sourceRefId: 'TEST-2025-00089',
    initiatedBy: 'Dr. Meena Singh',
    assignedTo: 'Rohit Verma',
    teamMembers: ['Rohit Verma', 'Amit Patel', 'Kavitha Rajan', 'Dr. Meena Singh'],
    fiveWhys: [
      { level: 1, question: 'Why did the connector delaminate during TC200?', answer: 'Thermal stress caused adhesive bond failure between junction box and backsheet.', evidence: 'Visual inspection photos showing delamination pattern', isRootCause: false },
      { level: 2, question: 'Why did the adhesive bond fail under thermal stress?', answer: 'The adhesive used (silicone RTV) had insufficient thermal cycling endurance.', evidence: 'Adhesive datasheet shows rated for 100 cycles only', isRootCause: false },
      { level: 3, question: 'Why was an adhesive with insufficient endurance used?', answer: 'The manufacturer changed adhesive supplier without notification.', evidence: 'Manufacturer audit report showing supplier change in Q3 2025', isRootCause: false },
      { level: 4, question: 'Why was the supplier change not communicated?', answer: 'No incoming quality control process for junction box adhesive verification.', evidence: 'IQC procedure review showed gap', isRootCause: false },
      { level: 5, question: 'Why was there no IQC process for adhesive verification?', answer: 'BOM critical component list did not include junction box adhesive as a controlled item.', evidence: 'BOM review document showing adhesive not listed as critical', isRootCause: true },
    ],
    fishboneDiagram: {
      problem: 'Connector delamination during thermal cycling TC200',
      categories: [
        { name: 'Materials', causes: [
          { id: 'FC-001', text: 'Adhesive material changed', subCauses: ['New supplier adhesive', 'Lower thermal endurance', 'No equivalence testing'], isContributing: true },
          { id: 'FC-002', text: 'Backsheet surface treatment', subCauses: ['Surface energy variation'], isContributing: false },
        ]},
        { name: 'Methods', causes: [
          { id: 'FC-003', text: 'IQC process gap', subCauses: ['No adhesive incoming inspection', 'BOM critical list incomplete'], isContributing: true },
          { id: 'FC-004', text: 'Assembly process', subCauses: ['Cure time adequate', 'Temperature profile OK'], isContributing: false },
        ]},
        { name: 'Machine', causes: [
          { id: 'FC-005', text: 'Dispensing equipment', subCauses: ['Volume calibrated', 'Pattern consistent'], isContributing: false },
        ]},
        { name: 'Measurement', causes: [
          { id: 'FC-006', text: 'Test detection timing', subCauses: ['Intermediate check at 150 cycles caught early'], isContributing: true },
        ]},
        { name: 'Man', causes: [
          { id: 'FC-007', text: 'Supplier management', subCauses: ['Change notification process lacking', 'Approved vendor list gap'], isContributing: true },
        ]},
        { name: 'Environment', causes: [
          { id: 'FC-008', text: 'Chamber conditions', subCauses: ['Temperature profile verified', 'Ramp rates within spec'], isContributing: false },
        ]},
      ],
    },
    eightDReport: {
      d1TeamFormation: { members: ['Rohit Verma', 'Amit Patel', 'Kavitha Rajan', 'Dr. Meena Singh'], leader: 'Rohit Verma', sponsor: 'Dr. Suresh Nair' },
      d2ProblemDescription: 'Junction box connector delamination on 3/8 modules during TC200 at 150-cycle intermediate check. Increased Rs detected.',
      d3InterimContainment: 'All modules with same JB lot placed on hold. Alternative junction box sourced.',
      d4RootCauseAnalysis: 'BOM critical component list did not include JB adhesive, allowing uncontrolled supplier change.',
      d5CorrectiveActions: [
        { id: '8D-CA-001', description: 'Update BOM critical component list to include JB adhesive', assignedTo: 'Dr. Meena Singh', targetDate: '2026-03-15', completedDate: '2026-03-10', status: 'completed', verificationNotes: 'Updated and approved' },
        { id: '8D-CA-002', description: 'Implement adhesive pull test in IQC procedure', assignedTo: 'Amit Patel', targetDate: '2026-03-20', completedDate: null, status: 'in_progress', verificationNotes: '' },
        { id: '8D-CA-003', description: 'Notify manufacturer of adhesive spec requirement', assignedTo: 'Kavitha Rajan', targetDate: '2026-03-12', completedDate: '2026-03-11', status: 'completed', verificationNotes: 'NCR sent' },
      ],
      d6Implementation: 'Corrective actions being implemented. IQC procedure update in review.',
      d7PreventiveActions: [
        { id: '8D-PA-001', description: 'Quarterly review of BOM critical component list', assignedTo: 'Dr. Meena Singh', targetDate: '2026-04-01', completedDate: null, status: 'pending', verificationNotes: '' },
        { id: '8D-PA-002', description: 'Supplier change notification clause in procurement agreements', assignedTo: 'Kavitha Rajan', targetDate: '2026-04-15', completedDate: null, status: 'pending', verificationNotes: '' },
      ],
      d8TeamRecognition: 'Pending project completion.',
      status: ['completed', 'completed', 'completed', 'completed', 'in_progress', 'in_progress', 'pending', 'pending'],
    },
    capaIds: ['CAPA-2026-00003'],
    linkedNCRs: ['NCR-2026-00005'],
    linkedComplaints: [],
    attachments: ['delamination-photos.zip', 'adhesive-datasheet.pdf'],
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-03-11T16:00:00Z',
    closedAt: null,
  },
  {
    id: 'RCA-002',
    rcaNumber: 'RCA-2026-00002',
    title: 'PID Test Result Anomaly - Leakage Current Spike',
    description: 'During PID testing per IEC 62804, unexpected leakage current spike at 600V bias after 48 hours. Investigation to determine if equipment or sample related.',
    status: 'root_cause_identified',
    priority: 'urgent',
    source: 'test_failure',
    sourceRefId: 'TEST-2026-00045',
    initiatedBy: 'Deepa Krishnan',
    assignedTo: 'Dr. Priya Sharma',
    teamMembers: ['Dr. Priya Sharma', 'Deepa Krishnan', 'Rohit Verma'],
    fiveWhys: [
      { level: 1, question: 'Why was there a leakage current spike during PID testing?', answer: 'Insulation breakdown at module edge seal area.', evidence: 'IR thermography showing hot spot at edge seal', isRootCause: false },
      { level: 2, question: 'Why did insulation breakdown occur at the edge seal?', answer: 'Moisture ingress through micro-cracks in edge sealant.', evidence: 'Cross-section microscopy showing moisture path', isRootCause: false },
      { level: 3, question: 'Why were there micro-cracks in the edge sealant?', answer: 'Edge sealant application insufficient in corner regions due to automated dispensing pattern.', evidence: 'Sealant coverage analysis report', isRootCause: true },
    ],
    fishboneDiagram: {
      problem: 'Leakage current spike during PID testing at 600V/48h',
      categories: [
        { name: 'Materials', causes: [
          { id: 'FC-101', text: 'Edge sealant quality', subCauses: ['Material meets spec'], isContributing: false },
          { id: 'FC-102', text: 'Module edge protection', subCauses: ['Sealant coverage insufficient', 'Corner regions thin'], isContributing: true },
        ]},
        { name: 'Methods', causes: [
          { id: 'FC-103', text: 'Dispensing pattern', subCauses: ['Corner overlap insufficient'], isContributing: true },
        ]},
        { name: 'Machine', causes: [
          { id: 'FC-104', text: 'PID test setup', subCauses: ['Voltage accuracy verified'], isContributing: false },
        ]},
        { name: 'Measurement', causes: [
          { id: 'FC-105', text: 'Leakage current monitoring', subCauses: ['Detection threshold appropriate'], isContributing: false },
        ]},
        { name: 'Man', causes: [
          { id: 'FC-106', text: 'Operator training', subCauses: ['Edge seal inspection'], isContributing: false },
        ]},
        { name: 'Environment', causes: [
          { id: 'FC-107', text: 'Test conditions', subCauses: ['85C/85%RH as specified'], isContributing: false },
        ]},
      ],
    },
    eightDReport: {
      d1TeamFormation: { members: ['Dr. Priya Sharma', 'Deepa Krishnan', 'Rohit Verma'], leader: 'Dr. Priya Sharma', sponsor: 'Dr. Suresh Nair' },
      d2ProblemDescription: 'Leakage current exceeded 10uA threshold at 600V DC bias after 48 hours of PID testing.',
      d3InterimContainment: 'Testing paused. Additional modules from same batch quarantined.',
      d4RootCauseAnalysis: 'Edge sealant application pattern does not provide sufficient coverage at corners.',
      d5CorrectiveActions: [
        { id: '8D-CA-101', description: 'Request manufacturer to revise edge seal dispensing pattern', assignedTo: 'Dr. Priya Sharma', targetDate: '2026-03-20', completedDate: null, status: 'pending', verificationNotes: '' },
      ],
      d6Implementation: 'Pending corrective action completion.',
      d7PreventiveActions: [
        { id: '8D-PA-101', description: 'Add edge seal coverage check to incoming inspection', assignedTo: 'Amit Patel', targetDate: '2026-04-01', completedDate: null, status: 'pending', verificationNotes: '' },
      ],
      d8TeamRecognition: '',
      status: ['completed', 'completed', 'completed', 'completed', 'pending', 'pending', 'pending', 'pending'],
    },
    capaIds: [],
    linkedNCRs: ['NCR-2026-00008'],
    linkedComplaints: [],
    attachments: ['ir-thermography.png', 'cross-section-microscopy.pdf'],
    createdAt: '2026-03-05T11:00:00Z',
    updatedAt: '2026-03-08T15:00:00Z',
    closedAt: null,
  },
  {
    id: 'RCA-003',
    rcaNumber: 'RCA-2026-00003',
    title: 'Customer Complaint - Incorrect Test Report Data',
    description: 'Customer reported discrepancy in I-V measurement data between test report and raw data file. Data transcription error found during report generation.',
    status: 'closed',
    priority: 'high',
    source: 'customer_complaint',
    sourceRefId: 'COMP-2026-00001',
    initiatedBy: 'Dr. Rajesh Kumar',
    assignedTo: 'Dr. Meena Singh',
    teamMembers: ['Dr. Meena Singh', 'Deepa Krishnan'],
    fiveWhys: [
      { level: 1, question: 'Why was incorrect data in the test report?', answer: 'Manual data entry error during report generation.', evidence: 'Comparison of raw data vs report values', isRootCause: false },
      { level: 2, question: 'Why was data manually entered?', answer: 'Report template requires manual copy-paste from measurement system.', evidence: 'Current SOP review', isRootCause: false },
      { level: 3, question: 'Why is there no automated data transfer?', answer: 'Report system not integrated with measurement DAQ system.', evidence: 'System architecture review', isRootCause: true },
    ],
    fishboneDiagram: {
      problem: 'Incorrect I-V data in customer test report',
      categories: [
        { name: 'Methods', causes: [
          { id: 'FC-201', text: 'Manual data transcription', subCauses: ['No automated transfer', 'Copy-paste errors'], isContributing: true },
        ]},
        { name: 'Man', causes: [
          { id: 'FC-202', text: 'Review process', subCauses: ['Reviewer did not cross-check raw data'], isContributing: true },
        ]},
        { name: 'Machine', causes: [
          { id: 'FC-203', text: 'System integration', subCauses: ['DAQ not linked to report system'], isContributing: true },
        ]},
        { name: 'Materials', causes: [] },
        { name: 'Measurement', causes: [] },
        { name: 'Environment', causes: [] },
      ],
    },
    eightDReport: {
      d1TeamFormation: { members: ['Dr. Meena Singh', 'Deepa Krishnan'], leader: 'Dr. Meena Singh', sponsor: 'Dr. Rajesh Kumar' },
      d2ProblemDescription: 'Pmax value in report showed 448.5W vs actual 449.2W. Voc and Isc also had minor discrepancies.',
      d3InterimContainment: 'Revised report issued within 24 hours. Recent reports audited.',
      d4RootCauseAnalysis: 'Manual data transcription from DAQ to report template without automated validation.',
      d5CorrectiveActions: [
        { id: '8D-CA-201', description: 'Implement automated data import in report system', assignedTo: 'Deepa Krishnan', targetDate: '2026-02-28', completedDate: '2026-02-25', status: 'verified', verificationNotes: 'Tested with 10 historical datasets' },
        { id: '8D-CA-202', description: 'Add data validation checklist to report review SOP', assignedTo: 'Dr. Meena Singh', targetDate: '2026-02-20', completedDate: '2026-02-18', status: 'verified', verificationNotes: 'Checklist added, training completed' },
      ],
      d6Implementation: 'Automated data import and validation checklist implemented.',
      d7PreventiveActions: [
        { id: '8D-PA-201', description: 'Quarterly audit of report accuracy against raw data', assignedTo: 'Dr. Meena Singh', targetDate: '2026-03-01', completedDate: '2026-03-01', status: 'completed', verificationNotes: 'First audit completed, no discrepancies' },
      ],
      d8TeamRecognition: 'Team recognized for rapid response.',
      status: ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed'],
    },
    capaIds: ['CAPA-2026-00001'],
    linkedNCRs: ['NCR-2026-00002'],
    linkedComplaints: ['COMP-2026-00001'],
    attachments: ['report-comparison.xlsx', 'revised-report.pdf'],
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    closedAt: '2026-03-01T10:00:00Z',
  },
]

export const rcaMetrics = {
  total: 3,
  open: 2,
  closed: 1,
  bySource: [
    { source: 'Test Failure', count: 2 },
    { source: 'Customer Complaint', count: 1 },
    { source: 'Audit Finding', count: 0 },
  ],
  byStatus: [
    { status: 'Root Cause Identified', count: 1 },
    { status: 'Implementation', count: 1 },
    { status: 'Closed', count: 1 },
  ],
  avgResolutionDays: 24,
  openActions: 5,
}
