/**
 * GUM Uncertainty Calculator - TypeScript port
 * Implements Guide to the Expression of Uncertainty in Measurement (JCGM 100:2008)
 */

export type DistributionType = "normal" | "uniform" | "triangular" | "lognormal";
export type UncertaintyType = "typeA" | "typeB";

export interface UncertaintyComponent {
  id: string;
  name: string;
  value: number;
  uncertainty: number;
  standardUncertainty: number;
  distribution: DistributionType;
  type: UncertaintyType;
  sensitivityCoefficient: number;
  degreesOfFreedom: number;
  varianceContribution: number;
  percentageContribution: number;
}

export interface UncertaintyBudget {
  id: string;
  name: string;
  description: string;
  measurand: string;
  measuredValue: number;
  components: UncertaintyComponent[];
  combinedStandardUncertainty: number;
  expandedUncertainty: number;
  coverageFactor: number;
  coverageProbability: number;
  relativeUncertaintyPercent: number;
  effectiveDegreesOfFreedom: number;
  createdAt: string;
}

/** Convert raw uncertainty to standard uncertainty based on distribution */
export function toStandardUncertainty(
  rawUncertainty: number,
  distribution: DistributionType,
  isExpanded: boolean = false,
  k: number = 2
): number {
  let u = rawUncertainty;
  if (isExpanded) {
    u = rawUncertainty / k;
  }
  switch (distribution) {
    case "uniform":
      return u / Math.sqrt(3);
    case "triangular":
      return u / Math.sqrt(6);
    case "lognormal":
    case "normal":
    default:
      return u;
  }
}

/** Calculate Type A uncertainty from repeated measurements */
export function calculateTypeA(measurements: number[]): {
  mean: number;
  stdDev: number;
  standardUncertainty: number;
  degreesOfFreedom: number;
  n: number;
} {
  const n = measurements.length;
  if (n < 2) return { mean: measurements[0] || 0, stdDev: 0, standardUncertainty: 0, degreesOfFreedom: 0, n };
  const mean = measurements.reduce((a, b) => a + b, 0) / n;
  const variance = measurements.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  const standardUncertainty = stdDev / Math.sqrt(n);
  return { mean, stdDev, standardUncertainty, degreesOfFreedom: n - 1, n };
}

/** Calculate combined standard uncertainty (root sum of squares) */
export function calculateCombinedUncertainty(components: UncertaintyComponent[]): number {
  const totalVariance = components.reduce((sum, c) => sum + c.varianceContribution, 0);
  return Math.sqrt(totalVariance);
}

/** Welch-Satterthwaite effective degrees of freedom */
export function welchSatterthwaite(components: UncertaintyComponent[]): number {
  const uc4 = components.reduce((sum, c) => sum + c.varianceContribution, 0) ** 2;
  const denominator = components.reduce((sum, c) => {
    const vi = c.degreesOfFreedom;
    if (vi === Infinity || vi === 0) return sum;
    return sum + c.varianceContribution ** 2 / vi;
  }, 0);
  if (denominator === 0) return Infinity;
  return Math.round(uc4 / denominator);
}

/** Get coverage factor from Student's t-distribution (simplified lookup) */
export function getCoverageFactor(dof: number, probability: number = 0.95): number {
  if (dof === Infinity || dof > 100) return probability === 0.95 ? 1.96 : probability === 0.99 ? 2.576 : 2.0;
  const t95: Record<number, number> = {
    1: 12.71, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042, 40: 2.021,
    50: 2.009, 60: 2.000, 80: 1.990, 100: 1.984,
  };
  if (probability === 0.95) {
    if (t95[dof]) return t95[dof];
    const keys = Object.keys(t95).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < keys.length - 1; i++) {
      if (dof > keys[i] && dof < keys[i + 1]) {
        const fraction = (dof - keys[i]) / (keys[i + 1] - keys[i]);
        return t95[keys[i]] + fraction * (t95[keys[i + 1]] - t95[keys[i]]);
      }
    }
    return 2.0;
  }
  return 2.0;
}

/** Build a complete uncertainty component from inputs */
export function createComponent(
  id: string,
  name: string,
  value: number,
  uncertainty: number,
  distribution: DistributionType,
  type: UncertaintyType,
  sensitivityCoefficient: number,
  degreesOfFreedom: number = Infinity,
  isExpanded: boolean = false
): UncertaintyComponent {
  const standardUncertainty = toStandardUncertainty(uncertainty, distribution, isExpanded);
  const varianceContribution = (sensitivityCoefficient * standardUncertainty) ** 2;
  return {
    id,
    name,
    value,
    uncertainty,
    standardUncertainty,
    distribution,
    type,
    sensitivityCoefficient,
    degreesOfFreedom,
    varianceContribution,
    percentageContribution: 0, // calculated after all components
  };
}

/** Calculate full uncertainty budget */
export function calculateBudget(
  name: string,
  measurand: string,
  measuredValue: number,
  components: UncertaintyComponent[],
  coverageProbability: number = 0.95
): UncertaintyBudget {
  const totalVariance = components.reduce((sum, c) => sum + c.varianceContribution, 0);
  const combinedStandardUncertainty = Math.sqrt(totalVariance);

  // Update percentage contributions
  const updatedComponents = components.map((c) => ({
    ...c,
    percentageContribution: totalVariance > 0 ? (c.varianceContribution / totalVariance) * 100 : 0,
  }));

  const effectiveDegreesOfFreedom = welchSatterthwaite(updatedComponents);
  const coverageFactor = getCoverageFactor(effectiveDegreesOfFreedom, coverageProbability);
  const expandedUncertainty = combinedStandardUncertainty * coverageFactor;
  const relativeUncertaintyPercent =
    measuredValue !== 0 ? (expandedUncertainty / Math.abs(measuredValue)) * 100 : 0;

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name,
    description: "",
    measurand,
    measuredValue,
    components: updatedComponents.sort((a, b) => b.percentageContribution - a.percentageContribution),
    combinedStandardUncertainty,
    expandedUncertainty,
    coverageFactor,
    coverageProbability,
    relativeUncertaintyPercent,
    effectiveDegreesOfFreedom,
    createdAt: new Date().toISOString(),
  };
}

/** Pre-built uncertainty templates */
export interface UncertaintyTemplate {
  id: string;
  name: string;
  description: string;
  measurand: string;
  category: string;
  components: Array<{
    name: string;
    defaultUncertainty: number;
    distribution: DistributionType;
    type: UncertaintyType;
    sensitivityCoefficient: number;
    degreesOfFreedom: number;
    description: string;
  }>;
}

export const UNCERTAINTY_TEMPLATES: UncertaintyTemplate[] = [
  {
    id: "iv-pmax",
    name: "I-V Measurement - Pmax",
    description: "Maximum power measurement uncertainty for PV modules per IEC 61215/60904",
    measurand: "Pmax (W)",
    category: "I-V Measurement",
    components: [
      { name: "Reference cell calibration", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Calibration uncertainty of reference cell (% of reading)" },
      { name: "Reference cell long-term drift", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Annual drift of reference cell sensitivity" },
      { name: "Simulator spatial non-uniformity", defaultUncertainty: 2.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spatial non-uniformity of irradiance" },
      { name: "Simulator temporal instability", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Short-term temporal instability" },
      { name: "Spectral mismatch", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral mismatch correction uncertainty" },
      { name: "Temperature measurement", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.4, degreesOfFreedom: Infinity, description: "Module temperature sensor uncertainty (°C)" },
      { name: "Temperature correction", defaultUncertainty: 0.05, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Temperature coefficient uncertainty" },
      { name: "Voltage measurement", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ voltage channel uncertainty" },
      { name: "Current measurement", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ current channel / shunt uncertainty" },
      { name: "I-V curve fitting", defaultUncertainty: 0.2, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Curve fitting algorithm uncertainty" },
      { name: "Repeatability", defaultUncertainty: 0.3, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Type A: standard deviation of repeated measurements (n=10)" },
    ],
  },
  {
    id: "iv-isc",
    name: "I-V Measurement - Isc",
    description: "Short-circuit current measurement uncertainty",
    measurand: "Isc (A)",
    category: "I-V Measurement",
    components: [
      { name: "Reference cell calibration", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Calibration uncertainty of reference cell" },
      { name: "Simulator spatial non-uniformity", defaultUncertainty: 2.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spatial non-uniformity effect on Isc" },
      { name: "Spectral mismatch", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral mismatch correction" },
      { name: "Current measurement", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ current measurement" },
      { name: "Temperature correction", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Isc temperature correction" },
      { name: "Repeatability", defaultUncertainty: 0.2, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Type A: repeated measurement std dev" },
    ],
  },
  {
    id: "iv-voc",
    name: "I-V Measurement - Voc",
    description: "Open-circuit voltage measurement uncertainty",
    measurand: "Voc (V)",
    category: "I-V Measurement",
    components: [
      { name: "Voltage measurement", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ voltage channel uncertainty" },
      { name: "Temperature correction", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.3, degreesOfFreedom: Infinity, description: "Voc temperature coefficient uncertainty (°C)" },
      { name: "Irradiance level", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.06, degreesOfFreedom: Infinity, description: "Voc dependence on irradiance level" },
      { name: "Repeatability", defaultUncertainty: 0.1, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Type A: repeated measurement std dev" },
    ],
  },
  {
    id: "iv-ff",
    name: "I-V Measurement - Fill Factor",
    description: "Fill factor measurement uncertainty (FF = Pmax / (Isc x Voc))",
    measurand: "FF",
    category: "I-V Measurement",
    components: [
      { name: "Pmax uncertainty", defaultUncertainty: 2.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Combined Pmax measurement uncertainty" },
      { name: "Isc uncertainty", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Combined Isc measurement uncertainty" },
      { name: "Voc uncertainty", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Combined Voc measurement uncertainty" },
      { name: "Repeatability", defaultUncertainty: 0.15, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Type A: repeated FF std dev" },
    ],
  },
  {
    id: "spectral-mismatch",
    name: "Spectral Mismatch Correction",
    description: "Uncertainty in spectral mismatch factor M per IEC 60904-7",
    measurand: "M (spectral mismatch factor)",
    category: "Spectral",
    components: [
      { name: "Reference cell SR calibration", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral response calibration of reference cell" },
      { name: "DUT spectral response", defaultUncertainty: 3.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DUT spectral response measurement" },
      { name: "Simulator spectrum measurement", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectroradiometer measurement uncertainty" },
      { name: "AM1.5G reference spectrum", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference spectrum data uncertainty" },
    ],
  },
  {
    id: "temperature-coefficient",
    name: "Temperature Coefficient",
    description: "Uncertainty in temperature coefficient determination per IEC 60891",
    measurand: "Temperature Coefficient (%/°C)",
    category: "Temperature",
    components: [
      { name: "Temperature measurement", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Thermocouple/sensor calibration" },
      { name: "Temperature uniformity", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Temperature uniformity across module" },
      { name: "I-V measurement at each temp", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "I-V measurement at each temperature point" },
      { name: "Linear fit residuals", defaultUncertainty: 0.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 3, description: "Residuals of linear regression (min 5 points)" },
    ],
  },
  {
    id: "irradiance",
    name: "Irradiance Measurement",
    description: "Uncertainty in irradiance measurement using reference cell",
    measurand: "Irradiance (W/m²)",
    category: "Irradiance",
    components: [
      { name: "Reference cell calibration", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Primary calibration uncertainty" },
      { name: "Spectral mismatch", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral response mismatch" },
      { name: "Angular response", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Cosine response deviation" },
      { name: "Temperature correction", defaultUncertainty: 0.2, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference cell temperature correction" },
      { name: "Data acquisition", defaultUncertainty: 0.05, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ resolution and accuracy" },
      { name: "Repeatability", defaultUncertainty: 0.1, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 19, description: "Repeated measurement standard deviation (n=20)" },
    ],
  },
];
