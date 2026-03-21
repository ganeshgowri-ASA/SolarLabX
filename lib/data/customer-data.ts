// Customer Management Module - Sample Data
// Satisfaction, Surveys, Visits, NDAs, Testimonials, FMEA

export interface CSIScore {
  category: string
  score: number
  target: number
  trend: 'up' | 'down' | 'stable'
}

export interface CSIQuarter {
  quarter: string
  overall: number
  scores: CSIScore[]
}

export interface SurveyTemplate {
  id: string
  name: string
  description: string
  questions: SurveyQuestion[]
  createdAt: string
  responseCount: number
  responseRate: number
}

export interface SurveyQuestion {
  id: string
  text: string
  type: 'likert' | 'text' | 'rating' | 'multiple_choice'
  options?: string[]
  required: boolean
}

export interface SurveyResponse {
  id: string
  surveyId: string
  respondentName: string
  respondentOrg: string
  respondentEmail: string
  submittedAt: string
  answers: { questionId: string; value: string | number }[]
}

export interface CustomerVisit {
  id: string
  date: string
  customerName: string
  company: string
  purpose: string
  accompaniedBy: string
  feedbackSummary: string
  rating: number
  actionItems: string[]
  photos: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface NDARecord {
  id: string
  ndaId: string
  customerName: string
  company: string
  effectiveDate: string
  expiryDate: string
  scope: string
  status: 'active' | 'expired' | 'pending' | 'terminated'
  documentRef: string
  renewalAlert: boolean
  notes: string
}

export interface Testimonial {
  id: string
  customerName: string
  company: string
  designation: string
  quote: string
  date: string
  rating: number
  category: 'Lab Visit' | 'Certification Ceremony' | 'Training' | 'General' | 'Partnership'
  approved: boolean
  photoUrl: string | null
}

export interface FMEAEntry {
  id: string
  complaintId: string
  processStep: string
  failureMode: string
  effect: string
  severity: number
  cause: string
  occurrence: number
  detection: number
  rpn: number
  recommendedAction: string
  responsibility: string
  targetDate: string
  actionTaken: string
  revisedSeverity: number | null
  revisedOccurrence: number | null
  revisedDetection: number | null
  revisedRpn: number | null
}

export interface RCAFiveWhy {
  id: string
  complaintId: string
  problem: string
  whys: { level: number; question: string; answer: string }[]
  rootCause: string
  classification: string
  evidence: string[]
  createdAt: string
  createdBy: string
}

export interface RCAFishbone {
  id: string
  complaintId: string
  problem: string
  categories: {
    name: string
    causes: { cause: string; subCauses: string[] }[]
  }[]
  createdAt: string
  createdBy: string
}

// ============================================================================
// Sample Data
// ============================================================================

export const csiData: CSIQuarter[] = [
  {
    quarter: 'Q1 2025',
    overall: 78,
    scores: [
      { category: 'Test Quality', score: 82, target: 85, trend: 'up' },
      { category: 'Report Quality', score: 75, target: 85, trend: 'down' },
      { category: 'Turnaround Time', score: 70, target: 85, trend: 'down' },
      { category: 'Communication', score: 80, target: 85, trend: 'stable' },
      { category: 'Pricing', score: 78, target: 85, trend: 'up' },
      { category: 'Technical Support', score: 83, target: 85, trend: 'up' },
    ],
  },
  {
    quarter: 'Q2 2025',
    overall: 81,
    scores: [
      { category: 'Test Quality', score: 85, target: 85, trend: 'up' },
      { category: 'Report Quality', score: 78, target: 85, trend: 'up' },
      { category: 'Turnaround Time', score: 74, target: 85, trend: 'up' },
      { category: 'Communication', score: 82, target: 85, trend: 'up' },
      { category: 'Pricing', score: 80, target: 85, trend: 'up' },
      { category: 'Technical Support', score: 87, target: 85, trend: 'up' },
    ],
  },
  {
    quarter: 'Q3 2025',
    overall: 84,
    scores: [
      { category: 'Test Quality', score: 88, target: 85, trend: 'up' },
      { category: 'Report Quality', score: 82, target: 85, trend: 'up' },
      { category: 'Turnaround Time', score: 78, target: 85, trend: 'up' },
      { category: 'Communication', score: 85, target: 85, trend: 'up' },
      { category: 'Pricing', score: 82, target: 85, trend: 'up' },
      { category: 'Technical Support', score: 89, target: 85, trend: 'up' },
    ],
  },
  {
    quarter: 'Q4 2025',
    overall: 86,
    scores: [
      { category: 'Test Quality', score: 90, target: 85, trend: 'up' },
      { category: 'Report Quality', score: 84, target: 85, trend: 'up' },
      { category: 'Turnaround Time', score: 80, target: 85, trend: 'up' },
      { category: 'Communication', score: 87, target: 85, trend: 'up' },
      { category: 'Pricing', score: 83, target: 85, trend: 'up' },
      { category: 'Technical Support', score: 92, target: 85, trend: 'up' },
    ],
  },
  {
    quarter: 'Q1 2026',
    overall: 83,
    scores: [
      { category: 'Test Quality', score: 89, target: 85, trend: 'down' },
      { category: 'Report Quality', score: 80, target: 85, trend: 'down' },
      { category: 'Turnaround Time', score: 76, target: 85, trend: 'down' },
      { category: 'Communication', score: 82, target: 85, trend: 'down' },
      { category: 'Pricing', score: 84, target: 85, trend: 'up' },
      { category: 'Technical Support', score: 88, target: 85, trend: 'down' },
    ],
  },
]

export const surveyTemplates: SurveyTemplate[] = [
  {
    id: 'SURV-TPL-001',
    name: 'Solar PV Lab Service Satisfaction',
    description: 'Comprehensive survey for PV testing lab customers covering test quality, reporting, and service experience',
    questions: [
      { id: 'Q1', text: 'How satisfied are you with the overall test quality?', type: 'likert', required: true },
      { id: 'Q2', text: 'How would you rate the accuracy and completeness of test reports?', type: 'likert', required: true },
      { id: 'Q3', text: 'How satisfied are you with the turnaround time for test results?', type: 'likert', required: true },
      { id: 'Q4', text: 'How would you rate our communication during the testing process?', type: 'likert', required: true },
      { id: 'Q5', text: 'How competitive do you find our pricing compared to other labs?', type: 'likert', required: true },
      { id: 'Q6', text: 'How satisfied are you with technical support and consultation?', type: 'likert', required: true },
      { id: 'Q7', text: 'How likely are you to recommend our lab to others? (NPS)', type: 'rating', required: true },
      { id: 'Q8', text: 'What aspects of our service do you value most?', type: 'text', required: false },
      { id: 'Q9', text: 'What areas need improvement?', type: 'text', required: false },
      { id: 'Q10', text: 'Which additional tests/services would you like us to offer?', type: 'multiple_choice', options: ['Reliability Testing', 'Outdoor Exposure', 'BOS Component Testing', 'Inverter Testing', 'Battery Storage Testing', 'Other'], required: false },
    ],
    createdAt: '2025-01-15T10:00:00Z',
    responseCount: 47,
    responseRate: 62,
  },
  {
    id: 'SURV-TPL-002',
    name: 'Post-Project Feedback',
    description: 'Quick feedback form sent after project completion',
    questions: [
      { id: 'Q1', text: 'How satisfied are you with the final deliverables?', type: 'likert', required: true },
      { id: 'Q2', text: 'Was the project completed within the agreed timeline?', type: 'likert', required: true },
      { id: 'Q3', text: 'How would you rate the project communication?', type: 'likert', required: true },
      { id: 'Q4', text: 'Would you engage our lab for future projects?', type: 'likert', required: true },
      { id: 'Q5', text: 'Any additional comments or suggestions?', type: 'text', required: false },
    ],
    createdAt: '2025-06-01T10:00:00Z',
    responseCount: 23,
    responseRate: 78,
  },
]

export const surveyResponses: SurveyResponse[] = [
  { id: 'RESP-001', surveyId: 'SURV-TPL-001', respondentName: 'Arun Mehta', respondentOrg: 'SolarEdge Technologies', respondentEmail: 'arun@solaredge.com', submittedAt: '2026-01-15T10:00:00Z', answers: [{ questionId: 'Q1', value: 4 }, { questionId: 'Q2', value: 4 }, { questionId: 'Q3', value: 3 }, { questionId: 'Q4', value: 4 }, { questionId: 'Q5', value: 4 }, { questionId: 'Q6', value: 5 }, { questionId: 'Q7', value: 8 }] },
  { id: 'RESP-002', surveyId: 'SURV-TPL-001', respondentName: 'Priyanka Reddy', respondentOrg: 'RenewSys India', respondentEmail: 'priyanka@renewsys.com', submittedAt: '2026-01-18T14:00:00Z', answers: [{ questionId: 'Q1', value: 5 }, { questionId: 'Q2', value: 4 }, { questionId: 'Q3', value: 2 }, { questionId: 'Q4', value: 3 }, { questionId: 'Q5', value: 4 }, { questionId: 'Q6', value: 5 }, { questionId: 'Q7', value: 7 }] },
  { id: 'RESP-003', surveyId: 'SURV-TPL-001', respondentName: 'Vikram Joshi', respondentOrg: 'Waaree Energies', respondentEmail: 'vikram@waaree.com', submittedAt: '2026-02-05T09:00:00Z', answers: [{ questionId: 'Q1', value: 4 }, { questionId: 'Q2', value: 3 }, { questionId: 'Q3', value: 3 }, { questionId: 'Q4', value: 4 }, { questionId: 'Q5', value: 3 }, { questionId: 'Q6', value: 4 }, { questionId: 'Q7', value: 7 }] },
  { id: 'RESP-004', surveyId: 'SURV-TPL-002', respondentName: 'Ananya Gupta', respondentOrg: 'First Solar India', respondentEmail: 'ananya@firstsolar.com', submittedAt: '2026-02-20T11:00:00Z', answers: [{ questionId: 'Q1', value: 5 }, { questionId: 'Q2', value: 4 }, { questionId: 'Q3', value: 5 }, { questionId: 'Q4', value: 5 }] },
]

export const customerVisits: CustomerVisit[] = [
  {
    id: 'VISIT-001',
    date: '2026-01-20T10:00:00Z',
    customerName: 'Mr. Rajiv Bansal',
    company: 'Tata Power Solar',
    purpose: 'Lab facility tour and IEC 61215 discussion',
    accompaniedBy: 'Dr. Rajesh Kumar, Dr. Meena Singh',
    feedbackSummary: 'Very impressed with lab infrastructure. Interested in long-term partnership for module qualification.',
    rating: 5,
    actionItems: ['Send proposal for IEC 61215 qualification', 'Schedule follow-up meeting for pricing discussion'],
    photos: [],
    status: 'completed',
  },
  {
    id: 'VISIT-002',
    date: '2026-02-10T09:00:00Z',
    customerName: 'Ms. Shreya Iyer',
    company: 'Adani Solar',
    purpose: 'Witness testing for IEC 61730 safety tests',
    accompaniedBy: 'Dr. Suresh Nair, Mr. Anil Verma',
    feedbackSummary: 'Satisfied with safety testing procedures. Suggested better visitor amenities in the lab viewing gallery.',
    rating: 4,
    actionItems: ['Improve visitor lounge area', 'Share test videos from witness session'],
    photos: [],
    status: 'completed',
  },
  {
    id: 'VISIT-003',
    date: '2026-03-05T14:00:00Z',
    customerName: 'Dr. Manish Agrawal',
    company: 'Vikram Solar',
    purpose: 'Technical consultation on bifacial module testing',
    accompaniedBy: 'Dr. Priya Sharma',
    feedbackSummary: 'Excellent technical depth. Lab team demonstrated strong understanding of IEC 61853 for bifacial characterization.',
    rating: 5,
    actionItems: ['Prepare bifacial testing proposal', 'Share published research papers on bifacial characterization'],
    photos: [],
    status: 'completed',
  },
  {
    id: 'VISIT-004',
    date: '2026-03-25T10:00:00Z',
    customerName: 'Mr. Kunal Shah',
    company: 'Goldi Solar',
    purpose: 'Annual partnership review meeting',
    accompaniedBy: 'Dr. Rajesh Kumar',
    feedbackSummary: '',
    rating: 0,
    actionItems: ['Prepare annual test summary report', 'Review SLA terms for renewal'],
    photos: [],
    status: 'scheduled',
  },
]

export const ndaRecords: NDARecord[] = [
  {
    id: 'NDA-001',
    ndaId: 'NDA-2024-0001',
    customerName: 'Mr. Arun Mehta',
    company: 'SolarEdge Technologies',
    effectiveDate: '2024-06-01',
    expiryDate: '2026-05-31',
    scope: 'Mutual NDA covering test data, proprietary module designs, and test protocols',
    status: 'active',
    documentRef: 'DOC-NDA-2024-0001.pdf',
    renewalAlert: true,
    notes: 'Renewal discussion scheduled for April 2026',
  },
  {
    id: 'NDA-002',
    ndaId: 'NDA-2024-0002',
    customerName: 'Ms. Priyanka Reddy',
    company: 'RenewSys India Pvt Ltd',
    effectiveDate: '2024-09-15',
    expiryDate: '2026-09-14',
    scope: 'One-way NDA for encapsulant formulation data shared during testing',
    status: 'active',
    documentRef: 'DOC-NDA-2024-0002.pdf',
    renewalAlert: false,
    notes: '',
  },
  {
    id: 'NDA-003',
    ndaId: 'NDA-2025-0001',
    customerName: 'Mr. Vikram Joshi',
    company: 'Waaree Energies Ltd',
    effectiveDate: '2025-01-10',
    expiryDate: '2027-01-09',
    scope: 'Mutual NDA covering HJT cell technology test data and results',
    status: 'active',
    documentRef: 'DOC-NDA-2025-0001.pdf',
    renewalAlert: false,
    notes: '',
  },
  {
    id: 'NDA-004',
    ndaId: 'NDA-2023-0005',
    customerName: 'Dr. Ananya Gupta',
    company: 'First Solar India',
    effectiveDate: '2023-03-01',
    expiryDate: '2025-02-28',
    scope: 'Mutual NDA for thin-film CdTe technology testing',
    status: 'expired',
    documentRef: 'DOC-NDA-2023-0005.pdf',
    renewalAlert: true,
    notes: 'Expired - renewal pending customer response',
  },
  {
    id: 'NDA-005',
    ndaId: 'NDA-2026-0001',
    customerName: 'Mr. Sanjay Patel',
    company: 'Adani Solar Energy',
    effectiveDate: '',
    expiryDate: '',
    scope: 'Mutual NDA for TOPCon module reliability testing program',
    status: 'pending',
    documentRef: '',
    renewalAlert: false,
    notes: 'Draft sent to customer legal team on March 1, 2026',
  },
]

export const testimonials: Testimonial[] = [
  {
    id: 'TEST-001',
    customerName: 'Mr. Rajiv Bansal',
    company: 'Tata Power Solar',
    designation: 'VP - Quality Assurance',
    quote: 'SolarLabX has transformed how we approach module qualification. Their NABL-accredited lab and IEC 61215 expertise are second to none. The automated reporting saves us weeks of effort.',
    date: '2025-11-15',
    rating: 5,
    category: 'General',
    approved: true,
    photoUrl: null,
  },
  {
    id: 'TEST-002',
    customerName: 'Dr. Ananya Gupta',
    company: 'First Solar India',
    designation: 'Director - R&D',
    quote: 'Outstanding technical capabilities for thin-film testing. The uncertainty calculations and measurement traceability give us confidence in every result.',
    date: '2025-09-20',
    rating: 5,
    category: 'Certification Ceremony',
    approved: true,
    photoUrl: null,
  },
  {
    id: 'TEST-003',
    customerName: 'Ms. Shreya Iyer',
    company: 'Adani Solar',
    designation: 'Head - Product Certification',
    quote: 'Best lab experience in India. Professional team, well-maintained equipment, and excellent turnaround time. Highly recommended for IEC 61730 safety testing.',
    date: '2026-01-10',
    rating: 5,
    category: 'Lab Visit',
    approved: true,
    photoUrl: null,
  },
  {
    id: 'TEST-004',
    customerName: 'Mr. Vikram Joshi',
    company: 'Waaree Energies',
    designation: 'GM - Quality',
    quote: 'The SPC charts and data analysis tools provided alongside test results give us real insights into our manufacturing process. A true partner in quality improvement.',
    date: '2026-02-05',
    rating: 4,
    category: 'Training',
    approved: true,
    photoUrl: null,
  },
  {
    id: 'TEST-005',
    customerName: 'Dr. Manish Agrawal',
    company: 'Vikram Solar',
    designation: 'CTO',
    quote: 'Impressed with their bifacial module testing capability. IEC 61853 energy rating analysis was thorough and actionable. Will definitely continue our partnership.',
    date: '2026-03-05',
    rating: 5,
    category: 'Partnership',
    approved: false,
    photoUrl: null,
  },
]

export const fmeaEntries: FMEAEntry[] = [
  {
    id: 'FMEA-001',
    complaintId: 'COMP-001',
    processStep: 'Data Transcription to Report',
    failureMode: 'Manual data entry error',
    effect: 'Incorrect test values in customer report',
    severity: 8,
    cause: 'Manual copy-paste from measurement system to report template',
    occurrence: 5,
    detection: 4,
    rpn: 160,
    recommendedAction: 'Implement automated data import from measurement system to report generator',
    responsibility: 'Dr. Meena Singh',
    targetDate: '2026-04-15',
    actionTaken: 'Automated data pipeline implemented for I-V measurements',
    revisedSeverity: 8,
    revisedOccurrence: 2,
    revisedDetection: 2,
    revisedRpn: 32,
  },
  {
    id: 'FMEA-002',
    complaintId: 'COMP-001',
    processStep: 'Report Review',
    failureMode: 'Insufficient cross-check of raw data vs report',
    effect: 'Errors not caught before report release',
    severity: 7,
    cause: 'Single reviewer without checklist',
    occurrence: 4,
    detection: 5,
    rpn: 140,
    recommendedAction: 'Implement dual review with mandatory checklist',
    responsibility: 'Dr. Rajesh Kumar',
    targetDate: '2026-03-30',
    actionTaken: 'Dual review process with digital checklist deployed',
    revisedSeverity: 7,
    revisedOccurrence: 2,
    revisedDetection: 2,
    revisedRpn: 28,
  },
  {
    id: 'FMEA-003',
    complaintId: 'COMP-003',
    processStep: 'Sample Handling & Transport',
    failureMode: 'Physical damage during internal transport',
    effect: 'Module frame damage, customer property damaged',
    severity: 9,
    cause: 'Inadequate handling fixtures for large modules',
    occurrence: 3,
    detection: 6,
    rpn: 162,
    recommendedAction: 'Procure proper module handling carts and train staff',
    responsibility: 'Dr. Suresh Nair',
    targetDate: '2026-04-30',
    actionTaken: '',
    revisedSeverity: null,
    revisedOccurrence: null,
    revisedDetection: null,
    revisedRpn: null,
  },
  {
    id: 'FMEA-004',
    complaintId: 'COMP-004',
    processStep: 'Report Template Update',
    failureMode: 'Stale calibration certificate reference in template',
    effect: 'Report references expired calibration certificate',
    severity: 7,
    cause: 'No automatic update mechanism for calibration references',
    occurrence: 4,
    detection: 3,
    rpn: 84,
    recommendedAction: 'Link report templates to equipment calibration database',
    responsibility: 'Dr. Priya Sharma',
    targetDate: '2026-04-15',
    actionTaken: '',
    revisedSeverity: null,
    revisedOccurrence: null,
    revisedDetection: null,
    revisedRpn: null,
  },
]

export const rcaFiveWhys: RCAFiveWhy[] = [
  {
    id: 'RCA-5W-001',
    complaintId: 'COMP-001',
    problem: 'Incorrect I-V data in test report (Pmax: 448.5W instead of 449.2W)',
    whys: [
      { level: 1, question: 'Why was the I-V data incorrect in the report?', answer: 'The Pmax value was manually entered incorrectly.' },
      { level: 2, question: 'Why was it manually entered?', answer: 'Data from the I-V tracer is exported to CSV and manually copied to the report template.' },
      { level: 3, question: 'Why is the data manually copied instead of automated?', answer: 'The report template uses a different format than the I-V tracer output.' },
      { level: 4, question: 'Why has the format mismatch not been addressed?', answer: 'No integration project was prioritized between the measurement and reporting systems.' },
      { level: 5, question: 'Why was integration not prioritized?', answer: 'Workload focused on expanding test capabilities; process automation was deprioritized.' },
    ],
    rootCause: 'Lack of automated data pipeline between measurement instruments and report generation system',
    classification: 'Process',
    evidence: ['CSV export from I-V tracer', 'Manual entry log', 'Report v1 vs raw data comparison'],
    createdAt: '2026-02-07T10:00:00Z',
    createdBy: 'Dr. Meena Singh',
  },
]

export const rcaFishbones: RCAFishbone[] = [
  {
    id: 'RCA-FB-001',
    complaintId: 'COMP-001',
    problem: 'Incorrect I-V data in test report',
    categories: [
      {
        name: 'Man',
        causes: [
          { cause: 'Manual data entry fatigue', subCauses: ['High volume of reports', 'Insufficient breaks'] },
          { cause: 'Training gap', subCauses: ['No cross-verification procedure training'] },
        ],
      },
      {
        name: 'Method',
        causes: [
          { cause: 'No automated data pipeline', subCauses: ['Manual CSV export', 'Copy-paste workflow'] },
          { cause: 'Single reviewer process', subCauses: ['No dual-check requirement'] },
        ],
      },
      {
        name: 'Machine',
        causes: [
          { cause: 'I-V tracer export format mismatch', subCauses: ['Different CSV structure', 'No direct API'] },
        ],
      },
      {
        name: 'Material',
        causes: [
          { cause: 'Report template design', subCauses: ['Manual input fields', 'No data validation'] },
        ],
      },
      {
        name: 'Measurement',
        causes: [
          { cause: 'No automated cross-check', subCauses: ['No checksum verification', 'No automated comparison tool'] },
        ],
      },
      {
        name: 'Environment',
        causes: [
          { cause: 'End-of-month reporting pressure', subCauses: ['Multiple reports due simultaneously'] },
        ],
      },
    ],
    createdAt: '2026-02-07T11:00:00Z',
    createdBy: 'Dr. Meena Singh',
  },
]
