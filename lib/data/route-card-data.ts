// Route Card Types and Mock Data

export interface RouteCardStation {
  id: string
  stationName: string
  testName: string
  standard?: string
  checklist: { item: string; completed: boolean }[]
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  operator?: string
  signOffDate?: string
  notes?: string
  equipmentUsed?: string
}

export interface RouteCard {
  id: string
  sampleId: string
  sampleName: string
  clientName: string
  testType: string
  standard: string
  currentStation: number
  stations: RouteCardStation[]
  createdAt: string
  updatedAt: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export const routeCardTemplates: { id: string; name: string; standard: string; stations: Omit<RouteCardStation, 'id' | 'status'>[] }[] = [
  {
    id: 'tpl-61215',
    name: 'IEC 61215 Design Qualification',
    standard: 'IEC 61215',
    stations: [
      {
        stationName: 'Reception',
        testName: 'Sample Reception & Inspection',
        standard: 'ISO 17025 Cl.7.4',
        checklist: [
          { item: 'Visual condition check', completed: false },
          { item: 'Dimensions verified', completed: false },
          { item: 'Documentation received', completed: false },
          { item: 'Sample ID assigned', completed: false },
          { item: 'QR code generated', completed: false },
        ],
      },
      {
        stationName: 'Visual Inspection',
        testName: 'MQT 01 - Visual Inspection',
        standard: 'IEC 61215-2 Cl.4.1',
        checklist: [
          { item: 'Front surface inspection', completed: false },
          { item: 'Rear surface inspection', completed: false },
          { item: 'Frame & junction box check', completed: false },
          { item: 'Label verification', completed: false },
          { item: 'Photo documentation', completed: false },
        ],
      },
      {
        stationName: 'Sun Simulator',
        testName: 'MQT 06 - STC Power Measurement',
        standard: 'IEC 60904-1',
        checklist: [
          { item: 'Simulator classified (A+AA)', completed: false },
          { item: 'Reference cell calibrated', completed: false },
          { item: 'Module temperature stabilized', completed: false },
          { item: 'IV curve measured', completed: false },
          { item: 'Pmax, Voc, Isc recorded', completed: false },
        ],
      },
      {
        stationName: 'EL Lab',
        testName: 'EL Imaging (Pre-test)',
        standard: 'IEC TS 60904-13',
        checklist: [
          { item: 'Camera calibrated', completed: false },
          { item: 'Forward bias applied', completed: false },
          { item: 'EL image captured', completed: false },
          { item: 'Image analyzed for defects', completed: false },
        ],
      },
      {
        stationName: 'Environmental Chamber',
        testName: 'MQT 11 - Thermal Cycling (200 cycles)',
        standard: 'IEC 61215-2 Cl.4.11',
        checklist: [
          { item: 'Chamber calibrated', completed: false },
          { item: 'TC sensors attached', completed: false },
          { item: 'Program loaded (-40°C to +85°C)', completed: false },
          { item: 'Test started & monitored', completed: false },
          { item: 'Test completed (200 cycles)', completed: false },
        ],
      },
      {
        stationName: 'Sun Simulator',
        testName: 'Final STC Power Measurement',
        standard: 'IEC 60904-1',
        checklist: [
          { item: 'Post-test measurement completed', completed: false },
          { item: 'Degradation calculated', completed: false },
          { item: 'Pass/fail determination', completed: false },
        ],
      },
      {
        stationName: 'EL Lab',
        testName: 'EL Imaging (Post-test)',
        standard: 'IEC TS 60904-13',
        checklist: [
          { item: 'Post-test EL image captured', completed: false },
          { item: 'Compared with pre-test image', completed: false },
          { item: 'Defect analysis completed', completed: false },
        ],
      },
      {
        stationName: 'Report Generation',
        testName: 'Test Report Compilation',
        standard: 'ISO 17025 Cl.7.8',
        checklist: [
          { item: 'Data compiled', completed: false },
          { item: 'Report drafted', completed: false },
          { item: 'Technical review completed', completed: false },
          { item: 'Report approved', completed: false },
          { item: 'Report delivered to client', completed: false },
        ],
      },
    ],
  },
  {
    id: 'tpl-61730',
    name: 'IEC 61730 Safety Qualification',
    standard: 'IEC 61730',
    stations: [
      {
        stationName: 'Reception',
        testName: 'Sample Reception',
        checklist: [
          { item: 'Visual condition check', completed: false },
          { item: 'Construction documents reviewed', completed: false },
          { item: 'Sample ID assigned', completed: false },
        ],
      },
      {
        stationName: 'Construction Lab',
        testName: 'MST 01 - Construction Evaluation',
        standard: 'IEC 61730-1',
        checklist: [
          { item: 'Material identification', completed: false },
          { item: 'Construction drawing review', completed: false },
          { item: 'Marking & labeling check', completed: false },
        ],
      },
      {
        stationName: 'Electrical Lab',
        testName: 'MST 16/17 - Insulation & Dielectric',
        standard: 'IEC 61730-2',
        checklist: [
          { item: 'Insulation resistance measured', completed: false },
          { item: 'Dielectric withstand test', completed: false },
          { item: 'Ground continuity verified', completed: false },
        ],
      },
      {
        stationName: 'Mechanical Lab',
        testName: 'MST 34 - Mechanical Load',
        standard: 'IEC 61730-2',
        checklist: [
          { item: 'Load frame setup', completed: false },
          { item: 'Uniform load applied (2400/5400 Pa)', completed: false },
          { item: 'Visual inspection after test', completed: false },
        ],
      },
      {
        stationName: 'Fire Lab',
        testName: 'MST 23 - Flammability Test',
        standard: 'IEC 61730-2',
        checklist: [
          { item: 'Test setup verified', completed: false },
          { item: 'Flame application completed', completed: false },
          { item: 'Burn characteristics recorded', completed: false },
        ],
      },
      {
        stationName: 'Report Generation',
        testName: 'Safety Report Compilation',
        checklist: [
          { item: 'All test data compiled', completed: false },
          { item: 'Safety classification determined', completed: false },
          { item: 'Report approved', completed: false },
        ],
      },
    ],
  },
]

export const mockRouteCards: RouteCard[] = [
  {
    id: 'RC-2603-A1B2',
    sampleId: 'SMP-2603-XK4R',
    sampleName: 'Trina Solar TSM-DE19 550W',
    clientName: 'SunPower Corp',
    testType: 'Design Qualification',
    standard: 'IEC 61215',
    currentStation: 4,
    priority: 'high',
    createdAt: '2026-02-15',
    updatedAt: '2026-03-08',
    stations: [
      {
        id: 'st-1', stationName: 'Reception', testName: 'Sample Reception & Inspection',
        standard: 'ISO 17025', status: 'completed', operator: 'Priya Sharma',
        signOffDate: '2026-02-15', equipmentUsed: 'Receiving Bay 1',
        checklist: [
          { item: 'Visual condition check', completed: true },
          { item: 'Dimensions verified', completed: true },
          { item: 'Documentation received', completed: true },
          { item: 'Sample ID assigned', completed: true },
          { item: 'QR code generated', completed: true },
        ],
      },
      {
        id: 'st-2', stationName: 'Visual Inspection', testName: 'MQT 01',
        standard: 'IEC 61215-2 Cl.4.1', status: 'completed', operator: 'Rajesh Kumar',
        signOffDate: '2026-02-16', equipmentUsed: 'Inspection Table A',
        checklist: [
          { item: 'Front surface inspection', completed: true },
          { item: 'Rear surface inspection', completed: true },
          { item: 'Frame & junction box check', completed: true },
          { item: 'Label verification', completed: true },
          { item: 'Photo documentation', completed: true },
        ],
      },
      {
        id: 'st-3', stationName: 'Sun Simulator', testName: 'MQT 06 - STC Power',
        standard: 'IEC 60904-1', status: 'completed', operator: 'Amit Patel',
        signOffDate: '2026-02-18', equipmentUsed: 'Pasan HighLIGHT 3b',
        checklist: [
          { item: 'Simulator classified (A+AA)', completed: true },
          { item: 'Reference cell calibrated', completed: true },
          { item: 'Module temperature stabilized', completed: true },
          { item: 'IV curve measured', completed: true },
          { item: 'Pmax, Voc, Isc recorded', completed: true },
        ],
      },
      {
        id: 'st-4', stationName: 'EL Lab', testName: 'EL Imaging (Pre-test)',
        standard: 'IEC TS 60904-13', status: 'completed', operator: 'Neha Gupta',
        signOffDate: '2026-02-19', equipmentUsed: 'Greateyes EL Camera',
        checklist: [
          { item: 'Camera calibrated', completed: true },
          { item: 'Forward bias applied', completed: true },
          { item: 'EL image captured', completed: true },
          { item: 'Image analyzed for defects', completed: true },
        ],
      },
      {
        id: 'st-5', stationName: 'Environmental Chamber', testName: 'MQT 11 - Thermal Cycling',
        standard: 'IEC 61215-2 Cl.4.11', status: 'in_progress', operator: 'Vikram Singh',
        equipmentUsed: 'Weiss WK3-340/70',
        checklist: [
          { item: 'Chamber calibrated', completed: true },
          { item: 'TC sensors attached', completed: true },
          { item: 'Program loaded (-40°C to +85°C)', completed: true },
          { item: 'Test started & monitored', completed: true },
          { item: 'Test completed (200 cycles)', completed: false },
        ],
      },
      {
        id: 'st-6', stationName: 'Sun Simulator', testName: 'Final STC Power',
        standard: 'IEC 60904-1', status: 'pending',
        checklist: [
          { item: 'Post-test measurement completed', completed: false },
          { item: 'Degradation calculated', completed: false },
          { item: 'Pass/fail determination', completed: false },
        ],
      },
      {
        id: 'st-7', stationName: 'EL Lab', testName: 'EL Imaging (Post-test)',
        standard: 'IEC TS 60904-13', status: 'pending',
        checklist: [
          { item: 'Post-test EL image captured', completed: false },
          { item: 'Compared with pre-test image', completed: false },
          { item: 'Defect analysis completed', completed: false },
        ],
      },
      {
        id: 'st-8', stationName: 'Report Generation', testName: 'Report Compilation',
        standard: 'ISO 17025', status: 'pending',
        checklist: [
          { item: 'Data compiled', completed: false },
          { item: 'Report drafted', completed: false },
          { item: 'Technical review completed', completed: false },
          { item: 'Report approved', completed: false },
          { item: 'Report delivered to client', completed: false },
        ],
      },
    ],
  },
  {
    id: 'RC-2603-C3D4',
    sampleId: 'SMP-2603-YL5S',
    sampleName: 'JinkoSolar Tiger Neo 580W',
    clientName: 'ReNew Power',
    testType: 'Safety Qualification',
    standard: 'IEC 61730',
    currentStation: 2,
    priority: 'normal',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-07',
    stations: [
      {
        id: 'st-1', stationName: 'Reception', testName: 'Sample Reception',
        status: 'completed', operator: 'Priya Sharma', signOffDate: '2026-03-01',
        checklist: [
          { item: 'Visual condition check', completed: true },
          { item: 'Construction documents reviewed', completed: true },
          { item: 'Sample ID assigned', completed: true },
        ],
      },
      {
        id: 'st-2', stationName: 'Construction Lab', testName: 'MST 01 - Construction Evaluation',
        standard: 'IEC 61730-1', status: 'completed', operator: 'Rajesh Kumar',
        signOffDate: '2026-03-03',
        checklist: [
          { item: 'Material identification', completed: true },
          { item: 'Construction drawing review', completed: true },
          { item: 'Marking & labeling check', completed: true },
        ],
      },
      {
        id: 'st-3', stationName: 'Electrical Lab', testName: 'MST 16/17 - Insulation & Dielectric',
        standard: 'IEC 61730-2', status: 'in_progress', operator: 'Amit Patel',
        checklist: [
          { item: 'Insulation resistance measured', completed: true },
          { item: 'Dielectric withstand test', completed: false },
          { item: 'Ground continuity verified', completed: false },
        ],
      },
      {
        id: 'st-4', stationName: 'Mechanical Lab', testName: 'MST 34 - Mechanical Load',
        standard: 'IEC 61730-2', status: 'pending',
        checklist: [
          { item: 'Load frame setup', completed: false },
          { item: 'Uniform load applied', completed: false },
          { item: 'Visual inspection after test', completed: false },
        ],
      },
      {
        id: 'st-5', stationName: 'Fire Lab', testName: 'MST 23 - Flammability',
        standard: 'IEC 61730-2', status: 'pending',
        checklist: [
          { item: 'Test setup verified', completed: false },
          { item: 'Flame application completed', completed: false },
          { item: 'Burn characteristics recorded', completed: false },
        ],
      },
      {
        id: 'st-6', stationName: 'Report Generation', testName: 'Safety Report',
        status: 'pending',
        checklist: [
          { item: 'All test data compiled', completed: false },
          { item: 'Safety classification determined', completed: false },
          { item: 'Report approved', completed: false },
        ],
      },
    ],
  },
  {
    id: 'RC-2603-E5F6',
    sampleId: 'SMP-2603-ZM6T',
    sampleName: 'Canadian Solar HiKu7 665W',
    clientName: 'Adani Solar',
    testType: 'Design Qualification',
    standard: 'IEC 61215',
    currentStation: 1,
    priority: 'urgent',
    createdAt: '2026-03-08',
    updatedAt: '2026-03-09',
    stations: [
      {
        id: 'st-1', stationName: 'Reception', testName: 'Sample Reception & Inspection',
        status: 'completed', operator: 'Priya Sharma', signOffDate: '2026-03-08',
        checklist: [
          { item: 'Visual condition check', completed: true },
          { item: 'Dimensions verified', completed: true },
          { item: 'Documentation received', completed: true },
          { item: 'Sample ID assigned', completed: true },
          { item: 'QR code generated', completed: true },
        ],
      },
      {
        id: 'st-2', stationName: 'Visual Inspection', testName: 'MQT 01',
        standard: 'IEC 61215-2 Cl.4.1', status: 'in_progress', operator: 'Rajesh Kumar',
        checklist: [
          { item: 'Front surface inspection', completed: true },
          { item: 'Rear surface inspection', completed: false },
          { item: 'Frame & junction box check', completed: false },
          { item: 'Label verification', completed: false },
          { item: 'Photo documentation', completed: false },
        ],
      },
      {
        id: 'st-3', stationName: 'Sun Simulator', testName: 'MQT 06 - STC Power',
        standard: 'IEC 60904-1', status: 'pending',
        checklist: [
          { item: 'Simulator classified', completed: false },
          { item: 'Reference cell calibrated', completed: false },
          { item: 'Module temperature stabilized', completed: false },
          { item: 'IV curve measured', completed: false },
          { item: 'Pmax, Voc, Isc recorded', completed: false },
        ],
      },
      {
        id: 'st-4', stationName: 'EL Lab', testName: 'EL Imaging (Pre-test)',
        standard: 'IEC TS 60904-13', status: 'pending',
        checklist: [
          { item: 'Camera calibrated', completed: false },
          { item: 'Forward bias applied', completed: false },
          { item: 'EL image captured', completed: false },
          { item: 'Image analyzed for defects', completed: false },
        ],
      },
      {
        id: 'st-5', stationName: 'Environmental Chamber', testName: 'MQT 13 - Damp Heat 1000h',
        standard: 'IEC 61215-2 Cl.4.13', status: 'pending',
        checklist: [
          { item: 'Chamber calibrated', completed: false },
          { item: 'Sensors attached', completed: false },
          { item: 'Program loaded (85°C/85%RH)', completed: false },
          { item: 'Test completed (1000h)', completed: false },
        ],
      },
      {
        id: 'st-6', stationName: 'Sun Simulator', testName: 'Final STC Power',
        standard: 'IEC 60904-1', status: 'pending',
        checklist: [
          { item: 'Post-test measurement completed', completed: false },
          { item: 'Degradation calculated', completed: false },
          { item: 'Pass/fail determination', completed: false },
        ],
      },
      {
        id: 'st-7', stationName: 'Report Generation', testName: 'Report Compilation',
        status: 'pending',
        checklist: [
          { item: 'Data compiled', completed: false },
          { item: 'Report drafted', completed: false },
          { item: 'Report approved', completed: false },
        ],
      },
    ],
  },
]
