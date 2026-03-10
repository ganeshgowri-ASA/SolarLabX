/**
 * IEC 60904 - Photovoltaic Devices: All Parts Calculation Library
 * Covers Parts 1-10, 13 measurement and analysis utilities
 */

// ============================================================
// Part 1: I-V Curve Measurement
// ============================================================

export interface IVDataPoint {
  voltage: number;
  current: number;
}

export interface IVParameters {
  isc: number;       // Short-circuit current (A)
  voc: number;       // Open-circuit voltage (V)
  impp: number;      // Maximum power point current (A)
  vmpp: number;      // Maximum power point voltage (V)
  pmax: number;      // Maximum power (W)
  ff: number;        // Fill factor
  efficiency: number; // Efficiency (%)
  rs: number;        // Series resistance (Ohm)
  rsh: number;       // Shunt resistance (Ohm)
  area: number;      // Cell/module area (m2)
  irradiance: number; // Irradiance (W/m2)
}

export interface IVAnalysisResult {
  params: IVParameters;
  curve: IVDataPoint[];
  powerCurve: { voltage: number; power: number }[];
  ffLoss: { rsLoss: number; rshLoss: number; idealFF: number };
}

/** Extract key parameters from an I-V curve dataset */
export function analyzeIVCurve(
  data: IVDataPoint[],
  area: number,
  irradiance: number = 1000
): IVAnalysisResult {
  const sorted = [...data].sort((a, b) => a.voltage - b.voltage);

  // Isc: current at V=0 (interpolate)
  let isc = sorted[0].current;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].voltage <= 0 && sorted[i + 1].voltage >= 0) {
      const t = (0 - sorted[i].voltage) / (sorted[i + 1].voltage - sorted[i].voltage);
      isc = sorted[i].current + t * (sorted[i + 1].current - sorted[i].current);
      break;
    }
  }

  // Voc: voltage at I=0 (interpolate)
  let voc = sorted[sorted.length - 1].voltage;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].current >= 0 && sorted[i + 1].current <= 0) {
      const t = (0 - sorted[i].current) / (sorted[i + 1].current - sorted[i].current);
      voc = sorted[i].voltage + t * (sorted[i + 1].voltage - sorted[i].voltage);
      break;
    }
  }

  // Power curve and Pmax
  const powerCurve = sorted.map((p) => ({
    voltage: p.voltage,
    power: p.voltage * p.current,
  }));

  let pmax = 0;
  let impp = 0;
  let vmpp = 0;
  for (const p of powerCurve) {
    if (p.power > pmax) {
      pmax = p.power;
      vmpp = p.voltage;
      impp = pmax / vmpp;
    }
  }

  const ff = isc * voc > 0 ? pmax / (isc * voc) : 0;
  const efficiency = area > 0 && irradiance > 0 ? (pmax / (area * irradiance)) * 100 : 0;

  // Rs estimation: slope near Voc
  let rs = 0;
  const vocPoints = sorted.filter((p) => p.voltage > voc * 0.85);
  if (vocPoints.length >= 2) {
    const last = vocPoints[vocPoints.length - 1];
    const prev = vocPoints[vocPoints.length - 2];
    const dI = last.current - prev.current;
    const dV = last.voltage - prev.voltage;
    rs = dI !== 0 ? Math.abs(dV / dI) : 0;
  }

  // Rsh estimation: slope near Isc
  let rsh = 0;
  const iscPoints = sorted.filter((p) => p.voltage < voc * 0.15);
  if (iscPoints.length >= 2) {
    const dI = iscPoints[1].current - iscPoints[0].current;
    const dV = iscPoints[1].voltage - iscPoints[0].voltage;
    rsh = dI !== 0 ? Math.abs(dV / dI) : Infinity;
  }

  // FF loss analysis
  const vt = 0.02585; // Thermal voltage at 25C
  const idealVoc = voc / vt;
  const idealFF = (idealVoc - Math.log(idealVoc + 0.72)) / (idealVoc + 1);
  const rsLoss = rs > 0 && isc > 0 ? (rs * isc / voc) : 0;
  const rshLoss = rsh > 0 ? (voc / (rsh * isc)) : 0;

  return {
    params: { isc, voc, impp, vmpp, pmax, ff, efficiency, rs, rsh, area, irradiance },
    curve: sorted,
    powerCurve,
    ffLoss: { rsLoss, rshLoss, idealFF },
  };
}

/** Generate a synthetic I-V curve from parameters using single-diode model */
export function generateIVCurve(
  isc: number,
  voc: number,
  rs: number = 0.5,
  rsh: number = 500,
  nPoints: number = 100
): IVDataPoint[] {
  const vt = 0.02585 * 60; // ~1.551V for 60-cell module
  const n = voc / (vt * Math.log(isc / 1e-10));
  const i0 = isc / (Math.exp(voc / (n * vt)) - 1);
  const points: IVDataPoint[] = [];

  for (let k = 0; k <= nPoints; k++) {
    const v = (voc * 1.05 * k) / nPoints;
    // Newton iteration to find I
    let current = isc;
    for (let iter = 0; iter < 20; iter++) {
      const f = isc - i0 * (Math.exp((v + current * rs) / (n * vt)) - 1) - (v + current * rs) / rsh - current;
      const df = -i0 * (rs / (n * vt)) * Math.exp((v + current * rs) / (n * vt)) - rs / rsh - 1;
      const step = f / df;
      current -= step;
      if (Math.abs(step) < 1e-8) break;
    }
    if (current < 0) current = 0;
    points.push({ voltage: v, current });
  }
  return points;
}

// ============================================================
// Part 2: Reference Device Requirements
// ============================================================

export interface ReferenceDeviceCalibration {
  deviceId: string;
  calibrationValue: number; // mA or A
  calibrationDate: string;
  expiryDate: string;
  calibrationLab: string;
  certificateNumber: string;
  uncertainty: number; // % expanded uncertainty
  coverageFactor: number;
  spectralResponseType: string; // e.g., "c-Si", "mc-Si"
  temperatureCoefficient: number; // %/°C
  traceabilityChain: string[];
}

export function isCalibrationValid(cal: ReferenceDeviceCalibration): boolean {
  return new Date(cal.expiryDate) > new Date();
}

export function daysUntilExpiry(cal: ReferenceDeviceCalibration): number {
  const diff = new Date(cal.expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================
// Part 3: AM1.5G Reference Spectrum
// ============================================================

/** AM1.5G Reference Spectrum (IEC 60904-3 Ed.2) - selected wavelengths */
export const AM15G_SPECTRUM: { wavelength: number; irradiance: number }[] = [
  { wavelength: 300, irradiance: 0.04 }, { wavelength: 320, irradiance: 0.25 },
  { wavelength: 340, irradiance: 0.40 }, { wavelength: 360, irradiance: 0.55 },
  { wavelength: 380, irradiance: 0.82 }, { wavelength: 400, irradiance: 1.11 },
  { wavelength: 420, irradiance: 1.42 }, { wavelength: 440, irradiance: 1.60 },
  { wavelength: 460, irradiance: 1.74 }, { wavelength: 480, irradiance: 1.80 },
  { wavelength: 500, irradiance: 1.84 }, { wavelength: 520, irradiance: 1.82 },
  { wavelength: 540, irradiance: 1.76 }, { wavelength: 560, irradiance: 1.72 },
  { wavelength: 580, irradiance: 1.68 }, { wavelength: 600, irradiance: 1.64 },
  { wavelength: 620, irradiance: 1.58 }, { wavelength: 640, irradiance: 1.54 },
  { wavelength: 660, irradiance: 1.49 }, { wavelength: 680, irradiance: 1.42 },
  { wavelength: 700, irradiance: 1.32 }, { wavelength: 720, irradiance: 1.28 },
  { wavelength: 740, irradiance: 1.26 }, { wavelength: 760, irradiance: 1.22 },
  { wavelength: 780, irradiance: 1.19 }, { wavelength: 800, irradiance: 1.12 },
  { wavelength: 820, irradiance: 1.05 }, { wavelength: 840, irradiance: 1.00 },
  { wavelength: 860, irradiance: 0.97 }, { wavelength: 880, irradiance: 0.90 },
  { wavelength: 900, irradiance: 0.87 }, { wavelength: 920, irradiance: 0.60 },
  { wavelength: 940, irradiance: 0.20 }, { wavelength: 960, irradiance: 0.65 },
  { wavelength: 980, irradiance: 0.72 }, { wavelength: 1000, irradiance: 0.74 },
  { wavelength: 1050, irradiance: 0.64 }, { wavelength: 1100, irradiance: 0.52 },
  { wavelength: 1150, irradiance: 0.31 }, { wavelength: 1200, irradiance: 0.17 },
];

/** Measurement compliance checklist items for Part 3 */
export const PART3_CHECKLIST = [
  { id: "stc-irradiance", label: "Irradiance at 1000 W/m² ± 20 W/m²", category: "STC" },
  { id: "stc-temperature", label: "Cell temperature at 25°C ± 2°C", category: "STC" },
  { id: "stc-spectrum", label: "AM1.5G spectrum per IEC 60904-3", category: "STC" },
  { id: "ref-cell", label: "Reference device calibrated per IEC 60904-2", category: "Reference" },
  { id: "ref-traceability", label: "Calibration traceable to primary lab", category: "Reference" },
  { id: "spectral-mismatch", label: "Spectral mismatch correction applied (IEC 60904-7)", category: "Correction" },
  { id: "temp-correction", label: "Temperature correction applied", category: "Correction" },
  { id: "irradiance-correction", label: "Irradiance correction to 1000 W/m²", category: "Correction" },
  { id: "sweep-time", label: "I-V sweep time appropriate for DUT", category: "Measurement" },
  { id: "four-wire", label: "4-wire (Kelvin) connection used", category: "Measurement" },
  { id: "contact-resistance", label: "Contact resistance minimized", category: "Measurement" },
  { id: "shading", label: "No shading on DUT during measurement", category: "Measurement" },
];

// ============================================================
// Part 4: Calibration Traceability
// ============================================================

export interface CalibrationComparison {
  labName: string;
  labId: string;
  measuredValue: number;
  uncertainty: number;
  referenceValue: number;
  enNumber: number; // |En| value
  pass: boolean;
}

/** Calculate En number for inter-lab comparison */
export function calculateEnNumber(
  labValue: number,
  labUncertainty: number,
  refValue: number,
  refUncertainty: number
): number {
  const denom = Math.sqrt(labUncertainty ** 2 + refUncertainty ** 2);
  return denom > 0 ? Math.abs(labValue - refValue) / denom : Infinity;
}

/** Evaluate inter-laboratory comparison results */
export function evaluateComparison(
  labs: { name: string; id: string; value: number; uncertainty: number }[],
  refValue: number,
  refUncertainty: number
): CalibrationComparison[] {
  return labs.map((lab) => {
    const en = calculateEnNumber(lab.value, lab.uncertainty, refValue, refUncertainty);
    return {
      labName: lab.name,
      labId: lab.id,
      measuredValue: lab.value,
      uncertainty: lab.uncertainty,
      referenceValue: refValue,
      enNumber: en,
      pass: en <= 1.0,
    };
  });
}

// ============================================================
// Part 5: Equivalent Cell Temperature (ECT)
// ============================================================

export interface ECTResult {
  ect: number;          // Equivalent cell temperature (°C)
  vocMeasured: number;  // Measured Voc (V)
  vocSTC: number;       // Voc at STC (V)
  betaVoc: number;      // Voc temperature coefficient (V/°C)
  irradiance: number;   // Irradiance (W/m²)
}

/** Calculate ECT from Voc method per IEC 60904-5 */
export function calculateECT(
  vocMeasured: number,
  vocSTC: number,
  betaVoc: number,   // V/°C (negative value expected)
  irradiance: number,
  nCells: number = 60,
  stcTemp: number = 25
): ECTResult {
  // Voc correction for irradiance
  const kB = 1.38065e-23; // Boltzmann constant
  const q = 1.602e-19;    // Electron charge
  const nIdeal = 1.2;     // Ideality factor
  const vocIrrCorrection = nCells * nIdeal * (kB * (stcTemp + 273.15) / q) * Math.log(irradiance / 1000);

  const vocCorrected = vocMeasured - vocIrrCorrection;
  const ect = betaVoc !== 0 ? stcTemp + (vocCorrected - vocSTC) / betaVoc : stcTemp;

  return { ect, vocMeasured, vocSTC, betaVoc, irradiance };
}

// ============================================================
// Part 7: Spectral Mismatch Correction
// ============================================================

export interface SpectralMismatchResult {
  M: number; // Mismatch factor
  numerator1: number;
  denominator1: number;
  numerator2: number;
  denominator2: number;
}

/** Trapezoidal integration */
function trapIntegrate(x: number[], y: number[]): number {
  let sum = 0;
  for (let i = 0; i < x.length - 1; i++) {
    sum += (x[i + 1] - x[i]) * (y[i] + y[i + 1]) / 2;
  }
  return sum;
}

/** Calculate spectral mismatch factor M per IEC 60904-7 */
export function calculateSpectralMismatch(
  refSpectrum: { wavelength: number; irradiance: number }[],
  measSpectrum: { wavelength: number; irradiance: number }[],
  dutSR: { wavelength: number; response: number }[],
  refSR: { wavelength: number; response: number }[]
): SpectralMismatchResult {
  // Common wavelength range
  const wlMin = Math.max(
    refSpectrum[0].wavelength, measSpectrum[0].wavelength,
    dutSR[0].wavelength, refSR[0].wavelength
  );
  const wlMax = Math.min(
    refSpectrum[refSpectrum.length - 1].wavelength,
    measSpectrum[measSpectrum.length - 1].wavelength,
    dutSR[dutSR.length - 1].wavelength,
    refSR[refSR.length - 1].wavelength
  );

  // Generate common wavelength points
  const wls: number[] = [];
  for (let w = wlMin; w <= wlMax; w += 5) wls.push(w);

  function interpAt(data: { wavelength: number; irradiance?: number; response?: number }[], wl: number, key: "irradiance" | "response"): number {
    const vals = data.map((d) => ({ x: d.wavelength, y: (d as Record<string, number>)[key] || 0 }));
    if (wl <= vals[0].x) return vals[0].y;
    if (wl >= vals[vals.length - 1].x) return vals[vals.length - 1].y;
    for (let i = 0; i < vals.length - 1; i++) {
      if (wl >= vals[i].x && wl <= vals[i + 1].x) {
        const t = (wl - vals[i].x) / (vals[i + 1].x - vals[i].x);
        return vals[i].y + t * (vals[i + 1].y - vals[i].y);
      }
    }
    return 0;
  }

  // M = [∫Eref*SRdut dλ * ∫Emeas*SRref dλ] / [∫Emeas*SRdut dλ * ∫Eref*SRref dλ]
  const erefSRdut = wls.map((w) => interpAt(refSpectrum, w, "irradiance") * interpAt(dutSR, w, "response"));
  const emeasSRref = wls.map((w) => interpAt(measSpectrum, w, "irradiance") * interpAt(refSR, w, "response"));
  const emeasSRdut = wls.map((w) => interpAt(measSpectrum, w, "irradiance") * interpAt(dutSR, w, "response"));
  const erefSRref = wls.map((w) => interpAt(refSpectrum, w, "irradiance") * interpAt(refSR, w, "response"));

  const num1 = trapIntegrate(wls, erefSRdut);
  const num2 = trapIntegrate(wls, emeasSRref);
  const den1 = trapIntegrate(wls, emeasSRdut);
  const den2 = trapIntegrate(wls, erefSRref);

  const M = den1 * den2 > 0 ? (num1 * num2) / (den1 * den2) : 1;

  return { M, numerator1: num1, denominator1: den1, numerator2: num2, denominator2: den2 };
}

// ============================================================
// Part 8: Spectral Responsivity
// ============================================================

export interface SpectralResponsivityPoint {
  wavelength: number;  // nm
  response: number;    // A/W
}

export interface SpectralResponsivityResult {
  data: SpectralResponsivityPoint[];
  peakWavelength: number;
  peakResponse: number;
  bandgap: number;     // eV estimated from cutoff
  integratedCurrent: number; // A/m² under AM1.5G
}

/** Analyze spectral responsivity data */
export function analyzeSpectralResponsivity(
  data: SpectralResponsivityPoint[]
): SpectralResponsivityResult {
  const sorted = [...data].sort((a, b) => a.wavelength - b.wavelength);
  let peakWl = 0;
  let peakSR = 0;
  for (const d of sorted) {
    if (d.response > peakSR) {
      peakSR = d.response;
      peakWl = d.wavelength;
    }
  }

  // Estimate bandgap from long-wavelength cutoff (50% of peak)
  let cutoffWl = sorted[sorted.length - 1].wavelength;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].response >= peakSR * 0.5) {
      cutoffWl = sorted[i].wavelength;
      break;
    }
  }
  const bandgap = 1240 / cutoffWl; // eV from nm

  // Integrated short-circuit current under AM1.5G
  const wls = sorted.map((d) => d.wavelength);
  const srVals = sorted.map((d) => d.response);
  const am15Values = wls.map((wl) => {
    const closest = AM15G_SPECTRUM.reduce((prev, curr) =>
      Math.abs(curr.wavelength - wl) < Math.abs(prev.wavelength - wl) ? curr : prev
    );
    return closest.irradiance;
  });
  const jscIntegrand = wls.map((_, i) => srVals[i] * am15Values[i]);
  const integratedCurrent = trapIntegrate(wls, jscIntegrand);

  return { data: sorted, peakWavelength: peakWl, peakResponse: peakSR, bandgap, integratedCurrent };
}

// ============================================================
// Part 10: Linearity Measurement
// ============================================================

export interface LinearityPoint {
  irradiance: number; // W/m²
  isc: number;        // A
}

export interface LinearityResult {
  data: LinearityPoint[];
  slope: number;
  intercept: number;
  rSquared: number;
  maxDeviation: number; // % from linear fit
  isLinear: boolean;    // deviation < 2%
  normalizedData: { irradiance: number; normalizedIsc: number; linearFit: number; deviation: number }[];
}

/** Analyze linearity of Isc vs irradiance per IEC 60904-10 */
export function analyzeLinearity(data: LinearityPoint[]): LinearityResult {
  const n = data.length;
  if (n < 2) {
    return { data, slope: 0, intercept: 0, rSquared: 0, maxDeviation: 100, isLinear: false, normalizedData: [] };
  }

  // Linear regression: Isc = slope * G + intercept
  const sumX = data.reduce((s, d) => s + d.irradiance, 0);
  const sumY = data.reduce((s, d) => s + d.isc, 0);
  const sumXY = data.reduce((s, d) => s + d.irradiance * d.isc, 0);
  const sumX2 = data.reduce((s, d) => s + d.irradiance ** 2, 0);
  const sumY2 = data.reduce((s, d) => s + d.isc ** 2, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;
  const rNumerator = n * sumXY - sumX * sumY;
  const rDenominator = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
  const rSquared = rDenominator > 0 ? (rNumerator / rDenominator) ** 2 : 0;

  // Normalize to 1000 W/m²
  const isc1000 = slope * 1000 + intercept;
  const normalizedData = data.map((d) => {
    const linearFit = slope * d.irradiance + intercept;
    const deviation = linearFit !== 0 ? ((d.isc - linearFit) / linearFit) * 100 : 0;
    return {
      irradiance: d.irradiance,
      normalizedIsc: isc1000 > 0 ? d.isc / isc1000 : 0,
      linearFit: isc1000 > 0 ? linearFit / isc1000 : 0,
      deviation,
    };
  });

  const maxDeviation = Math.max(...normalizedData.map((d) => Math.abs(d.deviation)));

  return { data, slope, intercept, rSquared, maxDeviation, isLinear: maxDeviation < 2, normalizedData };
}

// ============================================================
// Part 13: Electroluminescence
// ============================================================

export type ELDefectType = "crack" | "inactive_area" | "shunt" | "finger_break" | "potential_induced_degradation" | "other";

export interface ELDefect {
  id: string;
  type: ELDefectType;
  severity: "minor" | "major" | "critical";
  location: { x: number; y: number; width: number; height: number };
  description: string;
  cellIndex?: number;
}

export interface ELAnalysisResult {
  defects: ELDefect[];
  totalDefects: number;
  defectsByType: Record<ELDefectType, number>;
  defectsBySeverity: Record<string, number>;
  affectedCellPercentage: number;
  overallGrade: "pass" | "marginal" | "fail";
}

export function analyzeELResults(defects: ELDefect[], totalCells: number): ELAnalysisResult {
  const defectsByType: Record<ELDefectType, number> = {
    crack: 0, inactive_area: 0, shunt: 0, finger_break: 0,
    potential_induced_degradation: 0, other: 0,
  };
  const defectsBySeverity: Record<string, number> = { minor: 0, major: 0, critical: 0 };
  const affectedCells = new Set<number>();

  for (const d of defects) {
    defectsByType[d.type]++;
    defectsBySeverity[d.severity]++;
    if (d.cellIndex !== undefined) affectedCells.add(d.cellIndex);
  }

  const affectedCellPercentage = totalCells > 0 ? (affectedCells.size / totalCells) * 100 : 0;
  let overallGrade: "pass" | "marginal" | "fail" = "pass";
  if (defectsBySeverity.critical > 0 || affectedCellPercentage > 10) overallGrade = "fail";
  else if (defectsBySeverity.major > 2 || affectedCellPercentage > 5) overallGrade = "marginal";

  return {
    defects, totalDefects: defects.length,
    defectsByType, defectsBySeverity,
    affectedCellPercentage, overallGrade,
  };
}

// ============================================================
// ISO 17025 Document Numbering
// ============================================================

export function generateDocNumber(part: number, type: "protocol" | "data" | "analysis" | "report"): string {
  const typeCode = { protocol: "P", data: "D", analysis: "A", report: "R" }[type];
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `IEC60904-${part}-${typeCode}-${dateStr}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
}

export const IEC60904_PARTS = [
  { part: 1, title: "I-V Characteristics", shortTitle: "I-V Curve", icon: "LineChart" },
  { part: 2, title: "Reference Devices", shortTitle: "Ref Cell", icon: "Target" },
  { part: 3, title: "Measurement Principles", shortTitle: "AM1.5G", icon: "BookOpen" },
  { part: 4, title: "Calibration Traceability", shortTitle: "Traceability", icon: "Link2" },
  { part: 5, title: "Equivalent Cell Temperature", shortTitle: "ECT", icon: "Thermometer" },
  { part: 7, title: "Spectral Mismatch", shortTitle: "Mismatch", icon: "Shuffle" },
  { part: 8, title: "Spectral Responsivity", shortTitle: "SR", icon: "Waves" },
  { part: 9, title: "Solar Simulator", shortTitle: "Sun Sim", icon: "Sun" },
  { part: 10, title: "Linearity", shortTitle: "Linearity", icon: "TrendingUp" },
  { part: 13, title: "Electroluminescence", shortTitle: "EL", icon: "ScanEye" },
] as const;
