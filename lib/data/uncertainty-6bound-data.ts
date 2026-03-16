// Uncertainty 6-bound reference data for all quantifier tests
// Per JCGM 100:2008 (GUM), ILAC-G17:01/2021, IEC 60904-9, IEC 61215, IEC 61730

export interface SixBoundConfig {
  templateId: string
  measurand: string
  unit: string
  typicalValue: number
  typicalUc: number
  standardRef: string
  testType: string
  description: string
}

export const UNCERTAINTY_6BOUND_CONFIGS: SixBoundConfig[] = [
  // ── IEC 61215 Tests ──
  {
    templateId: "iec61215-pmax",
    measurand: "Pmax",
    unit: "W",
    typicalValue: 350.5,
    typicalUc: 4.92,
    standardRef: "IEC 61215 / IEC 60904-1 / GUM",
    testType: "Power at STC",
    description: "Maximum power at Standard Test Conditions (1000 W/m2, 25C, AM1.5G)",
  },
  {
    templateId: "iec61215-isc",
    measurand: "Isc",
    unit: "A",
    typicalValue: 10.25,
    typicalUc: 0.098,
    standardRef: "IEC 61215 / IEC 60904-1 / GUM",
    testType: "Short-Circuit Current",
    description: "Short-circuit current measurement at STC",
  },
  {
    templateId: "iec61215-voc",
    measurand: "Voc",
    unit: "V",
    typicalValue: 42.8,
    typicalUc: 0.15,
    standardRef: "IEC 61215 / IEC 60904-1 / GUM",
    testType: "Open-Circuit Voltage",
    description: "Open-circuit voltage measurement at STC",
  },
  {
    templateId: "iec61215-ff",
    measurand: "Fill Factor",
    unit: "",
    typicalValue: 0.798,
    typicalUc: 0.012,
    standardRef: "IEC 61215 / GUM",
    testType: "Fill Factor",
    description: "Fill factor FF = Pmax / (Isc x Voc)",
  },
  {
    templateId: "iec61215-tempcoeff",
    measurand: "gamma_Pmax",
    unit: "%/K",
    typicalValue: -0.35,
    typicalUc: 0.015,
    standardRef: "IEC 60891 / IEC 61215 / GUM",
    testType: "Temperature Coefficient",
    description: "Temperature coefficient of maximum power per IEC 60891",
  },
  {
    templateId: "iec61215-visual",
    measurand: "Dimension",
    unit: "mm",
    typicalValue: 1722.0,
    typicalUc: 0.45,
    standardRef: "IEC 61215 / GUM",
    testType: "Dimensional Measurement",
    description: "Visual inspection dimensional measurement",
  },
  // ── IEC 61730 Safety Tests ──
  {
    templateId: "iec61730-insulation",
    measurand: "Insulation Resistance",
    unit: "MOhm",
    typicalValue: 850.0,
    typicalUc: 42.5,
    standardRef: "IEC 61730-2 MST 16 / GUM",
    testType: "Insulation Resistance",
    description: "Insulation resistance test per IEC 61730-2 MST 16",
  },
  {
    templateId: "iec61730-wet-leakage",
    measurand: "Leakage Current",
    unit: "uA",
    typicalValue: 12.5,
    typicalUc: 0.85,
    standardRef: "IEC 61730-2 MST 17 / GUM",
    testType: "Wet Leakage Current",
    description: "Wet leakage current test per IEC 61730-2 MST 17",
  },
  {
    templateId: "iec61730-impulse",
    measurand: "Impulse Voltage Peak",
    unit: "kV",
    typicalValue: 6.0,
    typicalUc: 0.18,
    standardRef: "IEC 61730-2 MST 14 / GUM",
    testType: "Impulse Voltage",
    description: "Impulse voltage test per IEC 61730-2 MST 14",
  },
  {
    templateId: "iec61730-dielectric",
    measurand: "Leakage Current at Test Voltage",
    unit: "mA",
    typicalValue: 0.25,
    typicalUc: 0.012,
    standardRef: "IEC 61730-2 MST 15 / GUM",
    testType: "Dielectric Withstand",
    description: "Hi-pot / dielectric withstand test per IEC 61730-2 MST 15",
  },
  // ── IEC 61853 Energy Rating Tests ──
  {
    templateId: "iec61853-power-matrix",
    measurand: "Power at (G, T)",
    unit: "W",
    typicalValue: 280.0,
    typicalUc: 5.6,
    standardRef: "IEC 61853-1 / GUM",
    testType: "Power Matrix",
    description: "Power at various irradiance and temperature conditions",
  },
  {
    templateId: "iec61853-spectral",
    measurand: "Spectral Responsivity",
    unit: "A/W",
    typicalValue: 0.35,
    typicalUc: 0.007,
    standardRef: "IEC 60904-8 / IEC 61853-2 / GUM",
    testType: "Spectral Response",
    description: "Spectral responsivity measurement per IEC 60904-8",
  },
  {
    templateId: "iec61853-aoi",
    measurand: "IAM",
    unit: "",
    typicalValue: 0.95,
    typicalUc: 0.008,
    standardRef: "IEC 61853-2 / GUM",
    testType: "Angle of Incidence",
    description: "Angular dependence (IAM) measurement",
  },
  // ── IEC 60891 Correction Tests ──
  {
    templateId: "iec60891-temp-correction",
    measurand: "Corrected Pmax",
    unit: "W",
    typicalValue: 350.0,
    typicalUc: 5.25,
    standardRef: "IEC 60891 / GUM",
    testType: "Temperature Correction",
    description: "I-V curve translation for temperature correction",
  },
  {
    templateId: "iec60891-irradiance-correction",
    measurand: "Corrected Isc",
    unit: "A",
    typicalValue: 10.2,
    typicalUc: 0.102,
    standardRef: "IEC 60891 / GUM",
    testType: "Irradiance Correction",
    description: "I-V curve translation for irradiance correction",
  },
  {
    templateId: "iec60891-curve-fitting",
    measurand: "Fitted Rs",
    unit: "Ohm",
    typicalValue: 0.45,
    typicalUc: 0.022,
    standardRef: "IEC 60891 / GUM",
    testType: "I-V Curve Fitting",
    description: "Uncertainty in I-V curve fitting parameters",
  },
  // ── IEC 61724 System Performance ──
  {
    templateId: "iec61724-pr",
    measurand: "Performance Ratio",
    unit: "",
    typicalValue: 0.82,
    typicalUc: 0.025,
    standardRef: "IEC 61724-1 / GUM",
    testType: "Performance Ratio",
    description: "PV system performance ratio",
  },
  {
    templateId: "iec61724-yield",
    measurand: "Specific Yield",
    unit: "kWh/kWp",
    typicalValue: 1450.0,
    typicalUc: 43.5,
    standardRef: "IEC 61724-1 / GUM",
    testType: "Specific Yield",
    description: "Specific energy yield measurement",
  },
  {
    templateId: "iec61724-reference-yield",
    measurand: "Reference Yield",
    unit: "kWh/m2",
    typicalValue: 1800.0,
    typicalUc: 36.0,
    standardRef: "IEC 61724-1 / GUM",
    testType: "Reference Yield",
    description: "Reference yield (in-plane irradiation)",
  },
  // ── IEC 60904 Calibration Tests ──
  {
    templateId: "iec60904-spectral-mismatch",
    measurand: "Mismatch Factor M",
    unit: "",
    typicalValue: 1.002,
    typicalUc: 0.015,
    standardRef: "IEC 60904-7 / IEC 60904-9 / GUM",
    testType: "Spectral Mismatch",
    description: "Spectral mismatch correction factor M",
  },
  {
    templateId: "iec60904-irradiance",
    measurand: "Irradiance",
    unit: "W/m2",
    typicalValue: 1000.0,
    typicalUc: 15.0,
    standardRef: "IEC 60904-2 / IEC 60904-9 / GUM",
    testType: "Irradiance Measurement",
    description: "Irradiance measurement using reference cell",
  },
]

// Standard coverage factors per GUM Table G.2 and ILAC-G17
export const STANDARD_COVERAGE_FACTORS = [
  { k: 1.00, confidence: "68.27%", label: "k=1 (1-sigma)" },
  { k: 1.65, confidence: "90.00%", label: "k=1.65 (90%)" },
  { k: 1.96, confidence: "95.00%", label: "k=1.96 (95%)" },
  { k: 2.00, confidence: "95.45%", label: "k=2 (2-sigma)" },
  { k: 2.58, confidence: "99.00%", label: "k=2.58 (99%)" },
  { k: 3.00, confidence: "99.73%", label: "k=3 (3-sigma)" },
]

export function getConfigByTemplateId(templateId: string): SixBoundConfig | undefined {
  return UNCERTAINTY_6BOUND_CONFIGS.find((c) => c.templateId === templateId)
}
