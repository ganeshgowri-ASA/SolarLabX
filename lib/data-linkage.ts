// ============================================================================
// Data Linkage System: Project -> Samples -> Test Data -> Analysis -> Protocol
// Enables export-to-protocol and data traceability across modules
// ============================================================================

export interface DataLinkageRecord {
  id: string
  projectId: string
  projectName: string
  sampleId: string
  sampleName: string
  testDataId: string
  testName: string
  standard: string
  analysisId: string
  protocolReportId: string | null
  status: 'pending' | 'analyzed' | 'exported' | 'linked'
  createdAt: string
  updatedAt: string
}

export interface AnalysisExportPayload {
  analysisId: string
  projectId: string
  sampleId: string
  standard: string
  testName: string
  statistics: AnalysisStatistics
  charts: ChartExportData[]
  passFailResult: 'pass' | 'fail' | 'conditional'
  exportedAt: string
  exportedBy: string
}

export interface AnalysisStatistics {
  parameter: string
  mean: number
  stdDev: number
  min: number
  max: number
  median: number
  count: number
  cp: number
  cpk: number
  lsl: number
  usl: number
  passRate: number
}

export interface ChartExportData {
  id: string
  chartType: 'iv_curve' | 'spc_chart' | 'trend_plot' | 'comparison' | 'histogram' | 'pass_fail'
  title: string
  description: string
  dataPoints: number
  parameters: Record<string, string | number>
}

// ============================================================================
// Route Card OMR Types
// ============================================================================

export interface RouteCardOMRStation {
  stationNumber: number
  stationName: string
  testName: string
  standard: string
  preTestMeasurements: OMRMeasurement[]
  postTestMeasurements: OMRMeasurement[]
  passFail: 'pass' | 'fail' | 'pending'
  inspectionChecks: OMRCheckItem[]
  operatorName: string
  operatorSignature: string
  dateTime: string
  equipmentUsed: string
  equipmentCalId: string
  observations: string
}

export interface OMRMeasurement {
  parameter: string
  value: number | null
  unit: string
  nominal: number
  tolerance: number
}

export interface OMRCheckItem {
  label: string
  checked: boolean
}

export interface RouteCardOMR {
  id: string
  projectId: string
  sampleId: string
  sampleName: string
  clientName: string
  standard: string
  testType: string
  testSetNo: string
  createdAt: string
  qrCodeData: string
  stations: RouteCardOMRStation[]
  sampleFlow: SampleFlowStep[]
}

export interface SampleFlowStep {
  step: number
  name: string
  status: 'completed' | 'in_progress' | 'pending'
  dateTime: string | null
  operator: string | null
}

// ============================================================================
// Filename Generation
// ============================================================================

export function generateRouteCardFilename(
  projectId: string,
  sampleId: string,
  testName: string,
  prePost: 'Pre' | 'Post',
  testSetNo: string,
  date: Date = new Date()
): string {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const sanitizedTestName = testName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
  return `${projectId}_${sampleId}_${sanitizedTestName}_${prePost}_${testSetNo}_${dateStr}.pdf`
}

// ============================================================================
// Mock Data Linkage Records
// ============================================================================

export const mockDataLinkages: DataLinkageRecord[] = [
  {
    id: 'DL-001',
    projectId: 'PRJ2026001',
    projectName: 'SunPower MAX6 Design Qualification',
    sampleId: 'SM001',
    sampleName: 'SunPower SPR-MAX6-450',
    testDataId: 'RD-61215-TC-2026-001',
    testName: 'Thermal Cycling TC200',
    standard: 'IEC 61215',
    analysisId: 'DA-61215-2026-001',
    protocolReportId: 'TP-61215-TC-2026-001',
    status: 'linked',
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'DL-002',
    projectId: 'PRJ2026002',
    projectName: 'JA Solar JAM72 Characterization',
    sampleId: 'SM002',
    sampleName: 'JA Solar JAM72S30-MR',
    testDataId: 'RD-60904-IV-2026-001',
    testName: 'I-V Characterization',
    standard: 'IEC 60904',
    analysisId: 'DA-60904-2026-002',
    protocolReportId: null,
    status: 'analyzed',
    createdAt: '2026-03-06T10:00:00Z',
    updatedAt: '2026-03-06T16:00:00Z',
  },
  {
    id: 'DL-003',
    projectId: 'PRJ2026003',
    projectName: 'Canadian Solar HiKu7 Qualification',
    sampleId: 'SM003',
    sampleName: 'Canadian Solar CS7N-665TB',
    testDataId: 'RD-61215-DH-2026-002',
    testName: 'Damp Heat DH1000',
    standard: 'IEC 61215',
    analysisId: '',
    protocolReportId: null,
    status: 'pending',
    createdAt: '2026-03-08T14:00:00Z',
    updatedAt: '2026-03-08T14:00:00Z',
  },
  {
    id: 'DL-004',
    projectId: 'PRJ2026001',
    projectName: 'SunPower MAX6 Design Qualification',
    sampleId: 'SM004',
    sampleName: 'SunPower SPR-MAX6-450 (Set 2)',
    testDataId: 'RD-61215-HF-2026-003',
    testName: 'Humidity Freeze HF10',
    standard: 'IEC 61215',
    analysisId: 'DA-61215-2026-003',
    protocolReportId: null,
    status: 'analyzed',
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-03-15T12:00:00Z',
  },
  {
    id: 'DL-005',
    projectId: 'PRJ2026004',
    projectName: 'Trina Vertex Energy Rating',
    sampleId: 'SM005',
    sampleName: 'Trina Solar TSM-DE21C-660',
    testDataId: 'RD-61853-ER-2026-001',
    testName: 'Energy Rating IEC 61853',
    standard: 'IEC 61853',
    analysisId: 'DA-61853-2026-001',
    protocolReportId: 'TP-61853-ER-2026-001',
    status: 'linked',
    createdAt: '2026-03-09T10:00:00Z',
    updatedAt: '2026-03-18T09:00:00Z',
  },
]

// ============================================================================
// Mock Charts for Export
// ============================================================================

export const mockExportCharts: ChartExportData[] = [
  {
    id: 'chart-iv-001',
    chartType: 'iv_curve',
    title: 'I-V Curve at STC',
    description: 'Forward and reverse I-V sweep at 1000 W/m² & 25°C',
    dataPoints: 200,
    parameters: { irradiance: 1000, temperature: 25, sweepDirection: 'forward+reverse' },
  },
  {
    id: 'chart-spc-001',
    chartType: 'spc_chart',
    title: 'Pmax X-bar Control Chart',
    description: 'Statistical process control chart for Pmax over time',
    dataPoints: 50,
    parameters: { ucl: 465.2, lcl: 448.8, centerLine: 457.0 },
  },
  {
    id: 'chart-trend-001',
    chartType: 'trend_plot',
    title: 'Power Degradation Trend',
    description: 'Pmax degradation over thermal cycling intervals',
    dataPoints: 10,
    parameters: { startPmax: 455.2, endPmax: 444.3, degradation: '-2.4%' },
  },
  {
    id: 'chart-comp-001',
    chartType: 'comparison',
    title: 'Batch Comparison - Pmax',
    description: 'Mean Pmax comparison across test batches',
    dataPoints: 5,
    parameters: { batchCount: 5, bestBatch: 'B-2026-003' },
  },
  {
    id: 'chart-hist-001',
    chartType: 'histogram',
    title: 'Pmax Distribution Histogram',
    description: 'Normal distribution fit for Pmax values',
    dataPoints: 120,
    parameters: { bins: 12, mean: 457.0, stdDev: 2.7 },
  },
  {
    id: 'chart-pf-001',
    chartType: 'pass_fail',
    title: 'Pass/Fail Summary by Standard',
    description: 'Pass/fail rates grouped by IEC standard',
    dataPoints: 4,
    parameters: { overallPassRate: '96.7%' },
  },
]

// ============================================================================
// Mock OMR Route Cards
// ============================================================================

export const mockOMRRouteCards: RouteCardOMR[] = [
  {
    id: 'OMR-RC-001',
    projectId: 'PRJ2026001',
    sampleId: 'SM001',
    sampleName: 'SunPower SPR-MAX6-450',
    clientName: 'SunPower Corp',
    standard: 'IEC 61215',
    testType: 'TC200',
    testSetNo: 'Set1',
    createdAt: '2026-02-15T09:00:00Z',
    qrCodeData: 'https://solarlabx.app/traceability/route-card/OMR-RC-001',
    sampleFlow: [
      { step: 1, name: 'Receiving', status: 'completed', dateTime: '2026-02-15T09:00:00Z', operator: 'Priya Sharma' },
      { step: 2, name: 'Visual Inspection', status: 'completed', dateTime: '2026-02-16T10:30:00Z', operator: 'Rajesh Kumar' },
      { step: 3, name: 'Pre-conditioning', status: 'completed', dateTime: '2026-02-17T08:00:00Z', operator: 'Amit Patel' },
      { step: 4, name: 'Test Execution', status: 'completed', dateTime: '2026-02-18T09:00:00Z', operator: 'Vikram Singh' },
      { step: 5, name: 'Post-test Measurements', status: 'completed', dateTime: '2026-03-10T14:00:00Z', operator: 'Amit Patel' },
      { step: 6, name: 'Report', status: 'in_progress', dateTime: null, operator: null },
    ],
    stations: [
      {
        stationNumber: 1,
        stationName: 'Receiving',
        testName: 'Sample Reception & Initial Inspection',
        standard: 'ISO 17025 Cl.7.4',
        preTestMeasurements: [
          { parameter: 'Pmax (nameplate)', value: 450, unit: 'W', nominal: 450, tolerance: 5 },
          { parameter: 'Weight', value: 23.5, unit: 'kg', nominal: 23.5, tolerance: 0.5 },
        ],
        postTestMeasurements: [],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Packaging intact', checked: true },
          { label: 'No visible damage', checked: true },
          { label: 'Label matches PO', checked: true },
          { label: 'Documents received', checked: true },
        ],
        operatorName: 'Priya Sharma',
        operatorSignature: 'PS',
        dateTime: '2026-02-15T09:00:00Z',
        equipmentUsed: 'Receiving Bay 1',
        equipmentCalId: '',
        observations: 'Module received in good condition',
      },
      {
        stationNumber: 2,
        stationName: 'Visual Inspection',
        testName: 'MQT 01 - Visual Inspection',
        standard: 'IEC 61215-2 Cl.4.1',
        preTestMeasurements: [],
        postTestMeasurements: [],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Front glass clean', checked: true },
          { label: 'No cell cracks', checked: true },
          { label: 'No delamination', checked: true },
          { label: 'Connectors intact', checked: true },
          { label: 'Frame straight', checked: true },
        ],
        operatorName: 'Rajesh Kumar',
        operatorSignature: 'RK',
        dateTime: '2026-02-16T10:30:00Z',
        equipmentUsed: 'Inspection Table A',
        equipmentCalId: '',
        observations: 'No defects observed',
      },
      {
        stationNumber: 3,
        stationName: 'Pre-conditioning (STC Flash)',
        testName: 'MQT 06 - Pre-test I-V at STC',
        standard: 'IEC 60904-1',
        preTestMeasurements: [
          { parameter: 'Pmax', value: 452.3, unit: 'W', nominal: 450, tolerance: 10 },
          { parameter: 'Voc', value: 49.8, unit: 'V', nominal: 49.5, tolerance: 2 },
          { parameter: 'Isc', value: 11.42, unit: 'A', nominal: 11.4, tolerance: 0.5 },
          { parameter: 'FF', value: 79.5, unit: '%', nominal: 80, tolerance: 3 },
        ],
        postTestMeasurements: [],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Simulator Class A+AA verified', checked: true },
          { label: 'Reference cell calibrated', checked: true },
          { label: 'Temperature 25±2°C', checked: true },
        ],
        operatorName: 'Amit Patel',
        operatorSignature: 'AP',
        dateTime: '2026-02-17T08:00:00Z',
        equipmentUsed: 'Pasan HighLIGHT 3b (SS-001)',
        equipmentCalId: 'CAL-SS001-2026-001',
        observations: 'Pre-test values within spec',
      },
      {
        stationNumber: 4,
        stationName: 'Test Execution',
        testName: 'MQT 11 - Thermal Cycling TC200',
        standard: 'IEC 61215-2 Cl.4.11',
        preTestMeasurements: [
          { parameter: 'Chamber Temp Min', value: -40, unit: '°C', nominal: -40, tolerance: 2 },
          { parameter: 'Chamber Temp Max', value: 85, unit: '°C', nominal: 85, tolerance: 2 },
          { parameter: 'Cycles Programmed', value: 200, unit: 'cycles', nominal: 200, tolerance: 0 },
        ],
        postTestMeasurements: [
          { parameter: 'Cycles Completed', value: 200, unit: 'cycles', nominal: 200, tolerance: 0 },
          { parameter: 'Max Temp Deviation', value: 1.2, unit: '°C', nominal: 0, tolerance: 2 },
        ],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Chamber calibrated', checked: true },
          { label: 'TC sensors attached', checked: true },
          { label: 'Profile verified', checked: true },
          { label: 'Monitoring log complete', checked: true },
        ],
        operatorName: 'Vikram Singh',
        operatorSignature: 'VS',
        dateTime: '2026-02-18T09:00:00Z',
        equipmentUsed: 'Weiss WK3-340/70 (TC-001)',
        equipmentCalId: 'CAL-TC001-2026-002',
        observations: 'TC200 completed successfully, all cycles within spec',
      },
      {
        stationNumber: 5,
        stationName: 'Post-test Measurements',
        testName: 'MQT 06 - Post-test I-V at STC',
        standard: 'IEC 60904-1',
        preTestMeasurements: [],
        postTestMeasurements: [
          { parameter: 'Pmax', value: 441.5, unit: 'W', nominal: 450, tolerance: 22.5 },
          { parameter: 'Voc', value: 49.2, unit: 'V', nominal: 49.5, tolerance: 2 },
          { parameter: 'Isc', value: 11.38, unit: 'A', nominal: 11.4, tolerance: 0.5 },
          { parameter: 'FF', value: 78.9, unit: '%', nominal: 80, tolerance: 3 },
          { parameter: 'Degradation', value: 2.4, unit: '%', nominal: 0, tolerance: 5 },
        ],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Post-test visual OK', checked: true },
          { label: 'Degradation < 5%', checked: true },
          { label: 'No new defects in EL', checked: true },
        ],
        operatorName: 'Amit Patel',
        operatorSignature: 'AP',
        dateTime: '2026-03-10T14:00:00Z',
        equipmentUsed: 'Pasan HighLIGHT 3b (SS-001)',
        equipmentCalId: 'CAL-SS001-2026-001',
        observations: 'Pmax degradation 2.4% - within 5% limit, PASS',
      },
      {
        stationNumber: 6,
        stationName: 'Report',
        testName: 'Report Compilation & Review',
        standard: 'ISO 17025 Cl.7.8',
        preTestMeasurements: [],
        postTestMeasurements: [],
        passFail: 'pending',
        inspectionChecks: [
          { label: 'Data compiled', checked: true },
          { label: 'Report drafted', checked: true },
          { label: 'Technical review', checked: false },
          { label: 'Approved & released', checked: false },
        ],
        operatorName: 'Dr. Anand Patel',
        operatorSignature: '',
        dateTime: '',
        equipmentUsed: '',
        equipmentCalId: '',
        observations: '',
      },
    ],
  },
  {
    id: 'OMR-RC-002',
    projectId: 'PRJ2026002',
    sampleId: 'SM002',
    sampleName: 'JA Solar JAM72S30-MR',
    clientName: 'ReNew Power',
    standard: 'IEC 60904',
    testType: 'IV',
    testSetNo: 'Set1',
    createdAt: '2026-03-01T09:00:00Z',
    qrCodeData: 'https://solarlabx.app/traceability/route-card/OMR-RC-002',
    sampleFlow: [
      { step: 1, name: 'Receiving', status: 'completed', dateTime: '2026-03-01T09:00:00Z', operator: 'Priya Sharma' },
      { step: 2, name: 'Visual Inspection', status: 'completed', dateTime: '2026-03-02T11:00:00Z', operator: 'Rajesh Kumar' },
      { step: 3, name: 'Pre-conditioning', status: 'completed', dateTime: '2026-03-03T08:00:00Z', operator: 'Amit Patel' },
      { step: 4, name: 'Test Execution', status: 'completed', dateTime: '2026-03-03T14:00:00Z', operator: 'Neha Gupta' },
      { step: 5, name: 'Post-test Measurements', status: 'completed', dateTime: '2026-03-04T10:00:00Z', operator: 'Amit Patel' },
      { step: 6, name: 'Report', status: 'completed', dateTime: '2026-03-06T16:00:00Z', operator: 'Dr. Anand Patel' },
    ],
    stations: [
      {
        stationNumber: 1,
        stationName: 'Receiving',
        testName: 'Sample Reception',
        standard: 'ISO 17025 Cl.7.4',
        preTestMeasurements: [
          { parameter: 'Pmax (nameplate)', value: 540, unit: 'W', nominal: 540, tolerance: 5 },
        ],
        postTestMeasurements: [],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Packaging intact', checked: true },
          { label: 'No visible damage', checked: true },
          { label: 'Documents received', checked: true },
        ],
        operatorName: 'Priya Sharma',
        operatorSignature: 'PS',
        dateTime: '2026-03-01T09:00:00Z',
        equipmentUsed: 'Receiving Bay 2',
        equipmentCalId: '',
        observations: 'Good condition',
      },
      {
        stationNumber: 2,
        stationName: 'Visual Inspection',
        testName: 'Visual Inspection',
        standard: 'IEC 61215-2 Cl.4.1',
        preTestMeasurements: [],
        postTestMeasurements: [],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'No defects', checked: true },
          { label: 'Label OK', checked: true },
        ],
        operatorName: 'Rajesh Kumar',
        operatorSignature: 'RK',
        dateTime: '2026-03-02T11:00:00Z',
        equipmentUsed: 'Inspection Table B',
        equipmentCalId: '',
        observations: 'Clean module, no issues',
      },
      {
        stationNumber: 3,
        stationName: 'I-V Measurement',
        testName: 'I-V Characterization at STC',
        standard: 'IEC 60904-1',
        preTestMeasurements: [
          { parameter: 'Irradiance', value: 1000, unit: 'W/m²', nominal: 1000, tolerance: 20 },
          { parameter: 'Module Temp', value: 25.1, unit: '°C', nominal: 25, tolerance: 2 },
        ],
        postTestMeasurements: [
          { parameter: 'Pmax', value: 542.7, unit: 'W', nominal: 540, tolerance: 15 },
          { parameter: 'Voc', value: 50.3, unit: 'V', nominal: 50.0, tolerance: 2 },
          { parameter: 'Isc', value: 13.62, unit: 'A', nominal: 13.6, tolerance: 0.5 },
          { parameter: 'FF', value: 79.2, unit: '%', nominal: 79.5, tolerance: 3 },
        ],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Simulator verified', checked: true },
          { label: 'Ref cell calibrated', checked: true },
          { label: 'Temp stabilized', checked: true },
        ],
        operatorName: 'Amit Patel',
        operatorSignature: 'AP',
        dateTime: '2026-03-03T08:00:00Z',
        equipmentUsed: 'Pasan HighLIGHT 3b (SS-001)',
        equipmentCalId: 'CAL-SS001-2026-001',
        observations: 'Pmax +0.5% above nameplate',
      },
      {
        stationNumber: 4,
        stationName: 'Report',
        testName: 'Report & Data Analysis',
        standard: 'ISO 17025 Cl.7.8',
        preTestMeasurements: [],
        postTestMeasurements: [],
        passFail: 'pass',
        inspectionChecks: [
          { label: 'Data compiled', checked: true },
          { label: 'Report reviewed', checked: true },
          { label: 'Report approved', checked: true },
        ],
        operatorName: 'Dr. Anand Patel',
        operatorSignature: 'DAP',
        dateTime: '2026-03-06T16:00:00Z',
        equipmentUsed: '',
        equipmentCalId: '',
        observations: 'Report DA-60904-2026-002 issued',
      },
    ],
  },
]
