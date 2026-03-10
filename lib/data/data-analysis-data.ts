// ============================================================================
// Data Analysis Module - Types & Mock Data
// ============================================================================

export type IECStandard = "IEC 61215" | "IEC 61730" | "IEC 61853" | "IEC 60891" | "IEC 60904";

export type AnalysisStatus = "draft" | "in_progress" | "validated" | "reviewed" | "approved" | "rejected";

export type ValidationStatus = "pass" | "fail" | "warning" | "pending";

export interface DataPoint {
  id: string;
  value: number;
  unit: string;
  timestamp: string;
  equipmentId: string;
  equipmentName: string;
  calibrationCertId: string;
  calibrationDate: string;
  calibrationNextDue: string;
  operatorId: string;
  operatorName: string;
  uncertainty: number;
  uncertaintyUnit: string;
  coverageFactor: number;
}

export interface ValidationResult {
  field: string;
  status: ValidationStatus;
  message: string;
  value: number | string;
  expectedRange?: [number, number];
}

export interface AnalysisReport {
  id: string;
  reportNumber: string;
  standard: IECStandard;
  title: string;
  status: AnalysisStatus;
  sampleId: string;
  sampleName: string;
  projectId: string;
  analysisType: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rawDataFileId: string;
  rawDataFileName: string;
  equipmentUsed: EquipmentRef[];
  results: Record<string, unknown>;
  uncertaintyBudget: UncertaintyComponent[];
  auditTrail: AuditEntry[];
}

export interface EquipmentRef {
  equipmentId: string;
  equipmentName: string;
  calCertNumber: string;
  calDate: string;
  calNextDue: string;
  calStatus: "valid" | "expiring_soon" | "expired";
}

export interface UncertaintyComponent {
  source: string;
  type: "A" | "B";
  distribution: "normal" | "rectangular" | "triangular" | "u-shaped";
  standardUncertainty: number;
  sensitivityCoefficient: number;
  contribution: number;
  degreesOfFreedom: number;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  field: string;
  oldValue: string;
  newValue: string;
}

// IV Curve data point
export interface IVPoint {
  voltage: number;
  current: number;
}

// Power matrix for IEC 61853
export interface PowerMatrixEntry {
  irradiance: number;
  temperature: number;
  power: number;
  voc: number;
  isc: number;
  ff: number;
}

// ============================================================================
// Mock Data
// ============================================================================

export const mockEquipmentRefs: EquipmentRef[] = [
  {
    equipmentId: "EQ-SS-001",
    equipmentName: "Pasan SunSim 3C (AAA+ Solar Simulator)",
    calCertNumber: "CAL-SS-2026-001",
    calDate: "2026-01-15",
    calNextDue: "2027-01-15",
    calStatus: "valid",
  },
  {
    equipmentId: "EQ-IV-002",
    equipmentName: "Keithley 2400 SMU (I-V Tracer)",
    calCertNumber: "CAL-IV-2026-003",
    calDate: "2025-11-20",
    calNextDue: "2026-11-20",
    calStatus: "valid",
  },
  {
    equipmentId: "EQ-TC-003",
    equipmentName: "Weiss WK3 -40/180 (Thermal Chamber)",
    calCertNumber: "CAL-TC-2025-012",
    calDate: "2025-06-10",
    calNextDue: "2026-06-10",
    calStatus: "valid",
  },
  {
    equipmentId: "EQ-IR-004",
    equipmentName: "FLIR T640 (IR Camera)",
    calCertNumber: "CAL-IR-2026-002",
    calDate: "2026-02-01",
    calNextDue: "2027-02-01",
    calStatus: "valid",
  },
  {
    equipmentId: "EQ-EL-005",
    equipmentName: "Greateyes VS-NIR (EL Camera)",
    calCertNumber: "CAL-EL-2025-008",
    calDate: "2025-08-15",
    calNextDue: "2026-08-15",
    calStatus: "expiring_soon",
  },
  {
    equipmentId: "EQ-HV-006",
    equipmentName: "Hipotronics HD100 (HV Tester)",
    calCertNumber: "CAL-HV-2026-005",
    calDate: "2026-01-22",
    calNextDue: "2027-01-22",
    calStatus: "valid",
  },
  {
    equipmentId: "EQ-IR-007",
    equipmentName: "Megger MIT525 (Insulation Tester)",
    calCertNumber: "CAL-IR-2025-011",
    calDate: "2025-09-30",
    calNextDue: "2026-09-30",
    calStatus: "valid",
  },
  {
    equipmentId: "EQ-SP-008",
    equipmentName: "Ocean Optics HR4000 (Spectroradiometer)",
    calCertNumber: "CAL-SP-2026-004",
    calDate: "2026-01-05",
    calNextDue: "2027-01-05",
    calStatus: "valid",
  },
];

export const mockUncertaintyBudget: UncertaintyComponent[] = [
  { source: "Reference cell calibration", type: "B", distribution: "normal", standardUncertainty: 0.5, sensitivityCoefficient: 1.0, contribution: 0.25, degreesOfFreedom: Infinity },
  { source: "Irradiance non-uniformity", type: "B", distribution: "rectangular", standardUncertainty: 0.3, sensitivityCoefficient: 1.0, contribution: 0.09, degreesOfFreedom: Infinity },
  { source: "Temperature measurement", type: "B", distribution: "normal", standardUncertainty: 0.2, sensitivityCoefficient: 0.45, contribution: 0.008, degreesOfFreedom: Infinity },
  { source: "Repeatability (Type A)", type: "A", distribution: "normal", standardUncertainty: 0.15, sensitivityCoefficient: 1.0, contribution: 0.023, degreesOfFreedom: 9 },
  { source: "DAQ resolution", type: "B", distribution: "rectangular", standardUncertainty: 0.05, sensitivityCoefficient: 1.0, contribution: 0.0025, degreesOfFreedom: Infinity },
  { source: "Spectral mismatch", type: "B", distribution: "normal", standardUncertainty: 0.4, sensitivityCoefficient: 1.0, contribution: 0.16, degreesOfFreedom: Infinity },
];

// Generate IV curve data
export function generateIVCurve(isc: number, voc: number, pmax: number, points = 50): IVPoint[] {
  const data: IVPoint[] = [];
  const ff = pmax / (isc * voc);
  const n = 1.3;
  const vt = 0.026 * (25 + 273.15) / 300;
  for (let i = 0; i <= points; i++) {
    const v = (voc * i) / points;
    const ratio = v / voc;
    const current = isc * (1 - Math.pow(ratio, 1 / (n * ff))) * Math.max(0, 1 - Math.pow(ratio, 8));
    data.push({ voltage: Math.round(v * 1000) / 1000, current: Math.round(Math.max(0, current) * 1000) / 1000 });
  }
  return data;
}

// Generate power matrix for IEC 61853
export function generatePowerMatrix(): PowerMatrixEntry[] {
  const irradiances = [100, 200, 400, 600, 800, 1000, 1100];
  const temperatures = [15, 25, 50, 75];
  const entries: PowerMatrixEntry[] = [];
  for (const irr of irradiances) {
    for (const temp of temperatures) {
      const pstc = 400;
      const gamma = -0.0035;
      const power = Math.round(pstc * (irr / 1000) * (1 + gamma * (temp - 25)) * (0.97 + Math.random() * 0.06) * 10) / 10;
      const voc = Math.round((48.5 - 0.12 * (temp - 25)) * 100) / 100;
      const isc = Math.round((10.5 * (irr / 1000) + 0.0003 * (temp - 25)) * 1000) / 1000;
      const ff = Math.round((power / (voc * isc)) * 1000) / 1000;
      entries.push({ irradiance: irr, temperature: temp, power, voc, isc, ff });
    }
  }
  return entries;
}

// Degradation trend data
export interface DegradationPoint {
  hours: number;
  pmax: number;
  isc: number;
  voc: number;
  ff: number;
}

export function generateDegradationData(startPmax: number, degradationRate: number, cycles: number): DegradationPoint[] {
  const data: DegradationPoint[] = [];
  for (let i = 0; i <= cycles; i += Math.max(1, Math.floor(cycles / 20))) {
    const factor = 1 - (degradationRate * i) / cycles + (Math.random() - 0.5) * 0.005;
    data.push({
      hours: i,
      pmax: Math.round(startPmax * factor * 100) / 100,
      isc: Math.round(10.5 * (factor + 0.002) * 1000) / 1000,
      voc: Math.round(48.5 * (factor + 0.001) * 100) / 100,
      ff: Math.round(0.785 * (factor - 0.003) * 1000) / 1000,
    });
  }
  return data;
}

// Insulation resistance data for IEC 61730
export interface InsulationDataPoint {
  timestamp: string;
  resistanceMOhm: number;
  appliedVoltageV: number;
  temperatureC: number;
  humidity: number;
  passThreshold: number;
}

export function generateInsulationData(points = 20): InsulationDataPoint[] {
  const data: InsulationDataPoint[] = [];
  const baseDate = new Date("2026-01-10");
  for (let i = 0; i < points; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 2);
    data.push({
      timestamp: date.toISOString().split("T")[0],
      resistanceMOhm: Math.round((400 + Math.random() * 200 - i * 3) * 10) / 10,
      appliedVoltageV: 1000 + Math.round(Math.random() * 50),
      temperatureC: 23 + Math.round(Math.random() * 4),
      humidity: 45 + Math.round(Math.random() * 10),
      passThreshold: 40,
    });
  }
  return data;
}

// Spectral data for IEC 60904
export interface SpectralDataPoint {
  wavelength: number;
  amReference: number;
  simulatorSpectral: number;
  spectralMismatch: number;
}

export function generateSpectralData(): SpectralDataPoint[] {
  const data: SpectralDataPoint[] = [];
  for (let wl = 300; wl <= 1200; wl += 25) {
    const am15 = Math.exp(-0.5 * Math.pow((wl - 600) / 250, 2)) * (0.9 + Math.random() * 0.2);
    const sim = am15 * (0.92 + Math.random() * 0.16);
    data.push({
      wavelength: wl,
      amReference: Math.round(am15 * 1000) / 1000,
      simulatorSpectral: Math.round(sim * 1000) / 1000,
      spectralMismatch: Math.round((sim / am15) * 1000) / 1000,
    });
  }
  return data;
}

// Mock Analysis Reports
export const mockAnalysisReports: AnalysisReport[] = [
  {
    id: "1",
    reportNumber: "DA-61215-2026-001",
    standard: "IEC 61215",
    title: "TC200 Power Degradation Analysis - Module A",
    status: "approved",
    sampleId: "SMP-2601-A1B2",
    sampleName: "Canadian Solar CS6P-400MS",
    projectId: "PRJ-2026-001",
    analysisType: "Power Degradation",
    createdBy: "Dr. Ravi Kumar",
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-02-20T14:30:00Z",
    approvedBy: "Dr. Meena Sharma",
    approvedAt: "2026-02-21T09:00:00Z",
    rawDataFileId: "RD-61215-TC200-2026-001",
    rawDataFileName: "TC200_Module_A_raw.csv",
    equipmentUsed: [mockEquipmentRefs[0], mockEquipmentRefs[1], mockEquipmentRefs[2]],
    results: { pmaxDegradation: 2.3, initialPmax: 401.5, finalPmax: 392.3, passLimit: 5.0, result: "PASS" },
    uncertaintyBudget: mockUncertaintyBudget,
    auditTrail: [
      { timestamp: "2026-02-15T10:00:00Z", action: "Created", user: "Dr. Ravi Kumar", field: "", oldValue: "", newValue: "" },
      { timestamp: "2026-02-18T11:00:00Z", action: "Data Validated", user: "Priya Singh", field: "status", oldValue: "draft", newValue: "validated" },
      { timestamp: "2026-02-20T14:30:00Z", action: "Reviewed", user: "Dr. Meena Sharma", field: "status", oldValue: "validated", newValue: "reviewed" },
      { timestamp: "2026-02-21T09:00:00Z", action: "Approved", user: "Dr. Meena Sharma", field: "status", oldValue: "reviewed", newValue: "approved" },
    ],
  },
  {
    id: "2",
    reportNumber: "DA-61730-2026-002",
    standard: "IEC 61730",
    title: "Insulation Resistance Analysis - Module B",
    status: "validated",
    sampleId: "SMP-2601-C3D4",
    sampleName: "JA Solar JAM72S30-545/MR",
    projectId: "PRJ-2026-002",
    analysisType: "Insulation Resistance",
    createdBy: "Amit Patel",
    createdAt: "2026-02-18T09:00:00Z",
    updatedAt: "2026-02-22T16:00:00Z",
    approvedBy: null,
    approvedAt: null,
    rawDataFileId: "RD-61730-IR-2026-002",
    rawDataFileName: "IR_Module_B_raw.csv",
    equipmentUsed: [mockEquipmentRefs[5], mockEquipmentRefs[6]],
    results: { minResistance: 385.2, avgResistance: 452.1, threshold: 40, result: "PASS" },
    uncertaintyBudget: mockUncertaintyBudget.slice(0, 4),
    auditTrail: [
      { timestamp: "2026-02-18T09:00:00Z", action: "Created", user: "Amit Patel", field: "", oldValue: "", newValue: "" },
      { timestamp: "2026-02-22T16:00:00Z", action: "Data Validated", user: "Priya Singh", field: "status", oldValue: "draft", newValue: "validated" },
    ],
  },
  {
    id: "3",
    reportNumber: "DA-61853-2026-003",
    standard: "IEC 61853",
    title: "Energy Rating Matrix - Module C",
    status: "in_progress",
    sampleId: "SMP-2601-E5F6",
    sampleName: "Trina Solar Vertex S+ TSM-440NEG9R.28",
    projectId: "PRJ-2026-001",
    analysisType: "Energy Rating",
    createdBy: "Sneha Reddy",
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-05T12:00:00Z",
    approvedBy: null,
    approvedAt: null,
    rawDataFileId: "RD-61853-ER-2026-003",
    rawDataFileName: "ER_Matrix_Module_C_raw.xlsx",
    equipmentUsed: [mockEquipmentRefs[0], mockEquipmentRefs[1], mockEquipmentRefs[7]],
    results: { nmot: 43.2, annualEnergy: 678.5, climateProfile: "Subtropical" },
    uncertaintyBudget: mockUncertaintyBudget,
    auditTrail: [
      { timestamp: "2026-03-01T08:00:00Z", action: "Created", user: "Sneha Reddy", field: "", oldValue: "", newValue: "" },
    ],
  },
  {
    id: "4",
    reportNumber: "DA-60891-2026-004",
    standard: "IEC 60891",
    title: "I-V Translation Procedure 1 - Module D",
    status: "draft",
    sampleId: "SMP-2602-G7H8",
    sampleName: "LONGi LR5-72HBD-545M",
    projectId: "PRJ-2026-003",
    analysisType: "IV Translation",
    createdBy: "Arjun Mehta",
    createdAt: "2026-03-08T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
    approvedBy: null,
    approvedAt: null,
    rawDataFileId: "RD-60891-IVT-2026-004",
    rawDataFileName: "IVT_Module_D_raw.csv",
    equipmentUsed: [mockEquipmentRefs[0], mockEquipmentRefs[1]],
    results: { procedure: 1, rs: 0.35, kappa: 0.0012, alpha: 0.0004 },
    uncertaintyBudget: mockUncertaintyBudget.slice(0, 3),
    auditTrail: [
      { timestamp: "2026-03-08T10:00:00Z", action: "Created", user: "Arjun Mehta", field: "", oldValue: "", newValue: "" },
    ],
  },
  {
    id: "5",
    reportNumber: "DA-60904-2026-005",
    standard: "IEC 60904",
    title: "Reference Device Calibration & Spectral Mismatch",
    status: "reviewed",
    sampleId: "SMP-2602-I9J0",
    sampleName: "WPVS Reference Cell RC-01",
    projectId: "PRJ-2026-004",
    analysisType: "Calibration Analysis",
    createdBy: "Dr. Ravi Kumar",
    createdAt: "2026-02-25T08:00:00Z",
    updatedAt: "2026-03-02T15:00:00Z",
    approvedBy: null,
    approvedAt: null,
    rawDataFileId: "RD-60904-CAL-2026-005",
    rawDataFileName: "CalAnalysis_RC01_raw.csv",
    equipmentUsed: [mockEquipmentRefs[0], mockEquipmentRefs[7]],
    results: { spectralMismatchFactor: 1.012, linearity: 0.998, calValue: 0.1023 },
    uncertaintyBudget: mockUncertaintyBudget,
    auditTrail: [
      { timestamp: "2026-02-25T08:00:00Z", action: "Created", user: "Dr. Ravi Kumar", field: "", oldValue: "", newValue: "" },
      { timestamp: "2026-03-01T10:00:00Z", action: "Data Validated", user: "Amit Patel", field: "status", oldValue: "draft", newValue: "validated" },
      { timestamp: "2026-03-02T15:00:00Z", action: "Reviewed", user: "Dr. Meena Sharma", field: "status", oldValue: "validated", newValue: "reviewed" },
    ],
  },
];

// Validation rules by standard
export const validationRules: Record<string, { field: string; min: number; max: number; unit: string }[]> = {
  "IEC 61215": [
    { field: "Irradiance", min: 950, max: 1050, unit: "W/m²" },
    { field: "Cell Temperature", min: 23, max: 27, unit: "°C" },
    { field: "Pmax", min: 0, max: 1000, unit: "W" },
    { field: "Voc", min: 0, max: 100, unit: "V" },
    { field: "Isc", min: 0, max: 20, unit: "A" },
    { field: "Fill Factor", min: 0.5, max: 0.9, unit: "" },
  ],
  "IEC 61730": [
    { field: "Insulation Resistance", min: 40, max: 10000, unit: "MΩ" },
    { field: "Applied Voltage", min: 500, max: 5000, unit: "V" },
    { field: "Leakage Current", min: 0, max: 50, unit: "µA" },
    { field: "Temperature", min: 18, max: 28, unit: "°C" },
    { field: "Humidity", min: 30, max: 75, unit: "%" },
  ],
  "IEC 61853": [
    { field: "Irradiance", min: 50, max: 1200, unit: "W/m²" },
    { field: "Module Temperature", min: -10, max: 80, unit: "°C" },
    { field: "Power", min: 0, max: 1000, unit: "W" },
    { field: "Wind Speed", min: 0, max: 5, unit: "m/s" },
  ],
  "IEC 60891": [
    { field: "Irradiance (STC)", min: 950, max: 1050, unit: "W/m²" },
    { field: "Cell Temp (STC)", min: 23, max: 27, unit: "°C" },
    { field: "Rs", min: 0, max: 2, unit: "Ω" },
    { field: "κ (kappa)", min: -0.01, max: 0.01, unit: "Ω/°C" },
  ],
  "IEC 60904": [
    { field: "Spectral Mismatch Factor", min: 0.95, max: 1.05, unit: "" },
    { field: "Reference Irradiance", min: 990, max: 1010, unit: "W/m²" },
    { field: "Linearity", min: 0.98, max: 1.02, unit: "" },
    { field: "Spatial Non-Uniformity", min: 0, max: 2, unit: "%" },
  ],
};

// Mock validation results
export function generateValidationResults(standard: IECStandard): ValidationResult[] {
  const rules = validationRules[standard] || [];
  return rules.map((rule) => {
    const range = rule.max - rule.min;
    const value = rule.min + Math.random() * range;
    const inRange = value >= rule.min && value <= rule.max;
    const nearEdge = value < rule.min + range * 0.1 || value > rule.max - range * 0.1;
    return {
      field: rule.field,
      status: inRange ? (nearEdge ? "warning" : "pass") : "fail",
      message: inRange
        ? nearEdge
          ? `Value near limit (${rule.min}-${rule.max} ${rule.unit})`
          : `Within acceptable range`
        : `Out of range (${rule.min}-${rule.max} ${rule.unit})`,
      value: Math.round(value * 1000) / 1000,
      expectedRange: [rule.min, rule.max],
    };
  });
}

// Weibull distribution data for reliability
export interface WeibullPoint {
  time: number;
  cumulativeFailure: number;
  reliability: number;
}

export function generateWeibullData(beta = 3.5, eta = 2000, points = 30): WeibullPoint[] {
  const data: WeibullPoint[] = [];
  for (let i = 1; i <= points; i++) {
    const t = (eta * 1.5 * i) / points;
    const F = 1 - Math.exp(-Math.pow(t / eta, beta));
    data.push({
      time: Math.round(t),
      cumulativeFailure: Math.round(F * 10000) / 100,
      reliability: Math.round((1 - F) * 10000) / 100,
    });
  }
  return data;
}
