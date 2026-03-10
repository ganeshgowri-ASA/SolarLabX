/**
 * GUM Uncertainty Calculator - Comprehensive Implementation
 * Implements Guide to the Expression of Uncertainty in Measurement (JCGM 100:2008)
 * Covers IEC 61215, 61730, 61853, 60891, 61724, 60904
 */

// ===== Core Types =====

export type DistributionType = "normal" | "uniform" | "triangular" | "lognormal" | "u-shaped";
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
  category?: string; // For fishbone: Equipment, Method, Environment, Personnel, Sample, Reference
  description?: string;
}

export interface UncertaintyBudget {
  id: string;
  name: string;
  description: string;
  measurand: string;
  unit: string;
  measuredValue: number;
  components: UncertaintyComponent[];
  combinedStandardUncertainty: number;
  expandedUncertainty: number;
  coverageFactor: number;
  coverageProbability: number;
  relativeUncertaintyPercent: number;
  effectiveDegreesOfFreedom: number;
  createdAt: string;
  measurementModel?: string;
  standardReference?: string;
}

export interface MonteCarloResult {
  iterations: number;
  mean: number;
  standardDeviation: number;
  percentile2_5: number;
  percentile97_5: number;
  expandedUncertainty: number;
  histogram: { bin: number; count: number }[];
  convergenceData: { iteration: number; runningMean: number; runningStd: number }[];
}

export interface CorrelationEntry {
  component1Id: string;
  component2Id: string;
  coefficient: number;
}

// ===== Distribution Conversion =====

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
    case "u-shaped":
      return u / Math.sqrt(2);
    case "lognormal":
    case "normal":
    default:
      return u;
  }
}

// ===== Type A (Statistical) =====

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

// ===== Combined Uncertainty (with optional correlations) =====

export function calculateCombinedUncertainty(
  components: UncertaintyComponent[],
  correlations?: CorrelationEntry[]
): number {
  let totalVariance = components.reduce((sum, c) => sum + c.varianceContribution, 0);

  if (correlations && correlations.length > 0) {
    for (const corr of correlations) {
      const c1 = components.find((c) => c.id === corr.component1Id);
      const c2 = components.find((c) => c.id === corr.component2Id);
      if (c1 && c2) {
        totalVariance +=
          2 *
          corr.coefficient *
          c1.sensitivityCoefficient *
          c1.standardUncertainty *
          c2.sensitivityCoefficient *
          c2.standardUncertainty;
      }
    }
  }

  return Math.sqrt(Math.max(0, totalVariance));
}

// ===== Welch-Satterthwaite =====

export function welchSatterthwaite(components: UncertaintyComponent[]): number {
  const totalVariance = components.reduce((sum, c) => sum + c.varianceContribution, 0);
  const uc4 = totalVariance ** 2;
  const denominator = components.reduce((sum, c) => {
    const vi = c.degreesOfFreedom;
    if (vi === Infinity || vi === 0) return sum;
    return sum + c.varianceContribution ** 2 / vi;
  }, 0);
  if (denominator === 0) return Infinity;
  return Math.round(uc4 / denominator);
}

// ===== Coverage Factor (Student's t) =====

export function getCoverageFactor(dof: number, probability: number = 0.95): number {
  if (dof === Infinity || dof > 100) {
    if (probability === 0.99) return 2.576;
    if (probability === 0.95) return 1.96;
    return 2.0;
  }
  const t95: Record<number, number> = {
    1: 12.71, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
    16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
    25: 2.060, 30: 2.042, 35: 2.030, 40: 2.021, 45: 2.014,
    50: 2.009, 60: 2.000, 80: 1.990, 100: 1.984,
  };
  const t99: Record<number, number> = {
    1: 63.66, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032,
    6: 3.707, 7: 3.499, 8: 3.355, 9: 3.250, 10: 3.169,
    15: 2.947, 20: 2.845, 25: 2.787, 30: 2.750, 40: 2.704,
    50: 2.678, 60: 2.660, 80: 2.639, 100: 2.626,
  };
  const table = probability === 0.99 ? t99 : t95;
  if (table[dof]) return table[dof];
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (dof > keys[i] && dof < keys[i + 1]) {
      const fraction = (dof - keys[i]) / (keys[i + 1] - keys[i]);
      return table[keys[i]] + fraction * (table[keys[i + 1]] - table[keys[i]]);
    }
  }
  return probability === 0.99 ? 2.576 : 2.0;
}

// ===== Component Builder =====

export function createComponent(
  id: string,
  name: string,
  value: number,
  uncertainty: number,
  distribution: DistributionType,
  type: UncertaintyType,
  sensitivityCoefficient: number,
  degreesOfFreedom: number = Infinity,
  isExpanded: boolean = false,
  category?: string,
  description?: string
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
    percentageContribution: 0,
    category,
    description,
  };
}

// ===== Full Budget Calculation =====

export function calculateBudget(
  name: string,
  measurand: string,
  measuredValue: number,
  components: UncertaintyComponent[],
  coverageProbability: number = 0.95,
  correlations?: CorrelationEntry[],
  unit: string = "",
  measurementModel?: string,
  standardReference?: string
): UncertaintyBudget {
  const totalVariance = components.reduce((sum, c) => sum + c.varianceContribution, 0);
  const combinedStandardUncertainty = calculateCombinedUncertainty(components, correlations);

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
    id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
    name,
    description: "",
    measurand,
    unit,
    measuredValue,
    components: updatedComponents.sort((a, b) => b.percentageContribution - a.percentageContribution),
    combinedStandardUncertainty,
    expandedUncertainty,
    coverageFactor,
    coverageProbability,
    relativeUncertaintyPercent,
    effectiveDegreesOfFreedom,
    createdAt: new Date().toISOString(),
    measurementModel,
    standardReference,
  };
}

// ===== Monte Carlo Simulation =====

function sampleFromDistribution(
  mean: number,
  stdUncertainty: number,
  distribution: DistributionType
): number {
  // Box-Muller for normal
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  switch (distribution) {
    case "normal":
      return mean + z * stdUncertainty;
    case "uniform": {
      const halfWidth = stdUncertainty * Math.sqrt(3);
      return mean + (Math.random() * 2 - 1) * halfWidth;
    }
    case "triangular": {
      const halfWidth2 = stdUncertainty * Math.sqrt(6);
      const r1 = Math.random();
      const r2 = Math.random();
      return mean + halfWidth2 * (r1 + r2 - 1) / 1;
    }
    case "u-shaped": {
      const halfWidth3 = stdUncertainty * Math.sqrt(2);
      const theta = Math.random() * 2 * Math.PI;
      return mean + halfWidth3 * Math.cos(theta);
    }
    case "lognormal":
      return mean * Math.exp(z * stdUncertainty / mean);
    default:
      return mean + z * stdUncertainty;
  }
}

export function runMonteCarloSimulation(
  components: UncertaintyComponent[],
  measuredValue: number,
  iterations: number = 10000,
  correlations?: CorrelationEntry[]
): MonteCarloResult {
  const results: number[] = [];
  const convergenceData: { iteration: number; runningMean: number; runningStd: number }[] = [];
  let runningSum = 0;
  let runningSumSq = 0;

  for (let i = 0; i < iterations; i++) {
    let simValue = measuredValue;
    for (const comp of components) {
      const deviation = sampleFromDistribution(0, comp.standardUncertainty, comp.distribution);
      simValue += comp.sensitivityCoefficient * deviation;
    }
    results.push(simValue);
    runningSum += simValue;
    runningSumSq += simValue * simValue;

    if ((i + 1) % Math.max(1, Math.floor(iterations / 100)) === 0) {
      const n = i + 1;
      const rm = runningSum / n;
      const rv = n > 1 ? Math.sqrt((runningSumSq / n - rm * rm) * n / (n - 1)) : 0;
      convergenceData.push({ iteration: n, runningMean: rm, runningStd: rv });
    }
  }

  results.sort((a, b) => a - b);
  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const variance = results.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (results.length - 1);
  const standardDeviation = Math.sqrt(variance);

  const p2_5Index = Math.floor(results.length * 0.025);
  const p97_5Index = Math.floor(results.length * 0.975);
  const percentile2_5 = results[p2_5Index];
  const percentile97_5 = results[p97_5Index];

  // Build histogram
  const numBins = Math.min(50, Math.ceil(Math.sqrt(iterations)));
  const min = results[0];
  const max = results[results.length - 1];
  const binWidth = (max - min) / numBins;
  const histogram: { bin: number; count: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    histogram.push({ bin: min + (i + 0.5) * binWidth, count: 0 });
  }
  for (const val of results) {
    const binIndex = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
    histogram[binIndex].count++;
  }

  return {
    iterations,
    mean,
    standardDeviation,
    percentile2_5,
    percentile97_5,
    expandedUncertainty: (percentile97_5 - percentile2_5) / 2,
    histogram,
    convergenceData,
  };
}

// ===== Fishbone Categories =====

export const FISHBONE_CATEGORIES = [
  "Equipment",
  "Method",
  "Environment",
  "Personnel",
  "Sample",
  "Reference Standard",
] as const;

export type FishboneCategory = (typeof FISHBONE_CATEGORIES)[number];

// ===== Template Definitions =====

export interface UncertaintyTemplate {
  id: string;
  name: string;
  description: string;
  measurand: string;
  unit: string;
  category: string;
  standardReference: string;
  measurementModel: string;
  defaultMeasuredValue: number;
  components: Array<{
    name: string;
    defaultUncertainty: number;
    distribution: DistributionType;
    type: UncertaintyType;
    sensitivityCoefficient: number;
    degreesOfFreedom: number;
    description: string;
    category: FishboneCategory;
  }>;
}

// ===== IEC 61215 Templates (Design Qualification) =====

const IEC_61215_PMAX: UncertaintyTemplate = {
  id: "iec61215-pmax",
  name: "IEC 61215 - Pmax (STC)",
  description: "Maximum power at Standard Test Conditions per IEC 61215 / IEC 60904-1",
  measurand: "Pmax",
  unit: "W",
  category: "IEC 61215",
  standardReference: "IEC 61215-2:2021 / IEC 60904-1:2020",
  measurementModel: "Pmax = Isc × Voc × FF, corrected to STC (1000 W/m², 25°C, AM1.5G)",
  defaultMeasuredValue: 350,
  components: [
    { name: "Reference cell calibration", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Calibration uncertainty of reference cell from accredited lab (% of reading)", category: "Reference Standard" },
    { name: "Reference cell long-term drift", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Annual drift of reference cell sensitivity between calibrations", category: "Reference Standard" },
    { name: "Reference cell positioning", defaultUncertainty: 0.2, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Positioning of reference cell in test plane", category: "Equipment" },
    { name: "Simulator spatial non-uniformity", defaultUncertainty: 2.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spatial non-uniformity of irradiance over test area (Class A: ≤2%)", category: "Equipment" },
    { name: "Simulator temporal instability", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Short-term temporal instability during I-V sweep (Class A: ≤2%)", category: "Equipment" },
    { name: "Spectral mismatch correction", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral mismatch factor M uncertainty per IEC 60904-7", category: "Method" },
    { name: "Temperature sensor calibration", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.45, degreesOfFreedom: Infinity, description: "Module temperature sensor calibration (°C), sensitivity = γ_Pmax ≈ -0.45%/°C", category: "Equipment" },
    { name: "Temperature spatial uniformity", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 0.45, degreesOfFreedom: Infinity, description: "Temperature non-uniformity across module surface (°C)", category: "Environment" },
    { name: "Temperature correction (γ_Pmax)", defaultUncertainty: 0.05, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Uncertainty in temperature coefficient of Pmax (%/°C)", category: "Method" },
    { name: "Voltage measurement (DAQ)", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ voltage channel accuracy and resolution", category: "Equipment" },
    { name: "Current measurement (shunt/DAQ)", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ current channel / shunt resistor uncertainty", category: "Equipment" },
    { name: "I-V curve fitting algorithm", defaultUncertainty: 0.2, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Curve fitting / Pmax extraction algorithm uncertainty", category: "Method" },
    { name: "Module hysteresis", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Hysteresis between forward and reverse I-V sweeps", category: "Sample" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.3, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Standard deviation of repeated measurements (n=10)", category: "Method" },
  ],
};

const IEC_61215_ISC: UncertaintyTemplate = {
  id: "iec61215-isc",
  name: "IEC 61215 - Isc",
  description: "Short-circuit current measurement uncertainty at STC",
  measurand: "Isc",
  unit: "A",
  category: "IEC 61215",
  standardReference: "IEC 61215-2:2021 / IEC 60904-1:2020",
  measurementModel: "Isc = Isc_meas × (G_ref / G_meas) × [1 + α_Isc × (T_ref - T_meas)]",
  defaultMeasuredValue: 9.5,
  components: [
    { name: "Reference cell calibration", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Calibration uncertainty of reference cell", category: "Reference Standard" },
    { name: "Reference cell drift", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Long-term drift between calibrations", category: "Reference Standard" },
    { name: "Simulator spatial non-uniformity", defaultUncertainty: 2.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spatial non-uniformity effect on Isc", category: "Equipment" },
    { name: "Spectral mismatch", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral mismatch factor uncertainty", category: "Method" },
    { name: "Current measurement", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ current measurement accuracy", category: "Equipment" },
    { name: "Temperature correction (α_Isc)", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.06, degreesOfFreedom: Infinity, description: "Isc temperature coefficient uncertainty, sensitivity ~0.06%/°C", category: "Method" },
    { name: "Irradiance correction", defaultUncertainty: 0.3, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Correction for deviation from 1000 W/m²", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.2, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Repeated measurement std dev (n=10)", category: "Method" },
  ],
};

const IEC_61215_VOC: UncertaintyTemplate = {
  id: "iec61215-voc",
  name: "IEC 61215 - Voc",
  description: "Open-circuit voltage measurement uncertainty at STC",
  measurand: "Voc",
  unit: "V",
  category: "IEC 61215",
  standardReference: "IEC 61215-2:2021 / IEC 60904-1:2020",
  measurementModel: "Voc = Voc_meas + β_Voc × (T_ref - T_meas) + δVoc_irr",
  defaultMeasuredValue: 45.5,
  components: [
    { name: "Voltage measurement", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ voltage channel accuracy", category: "Equipment" },
    { name: "Temperature correction (β_Voc)", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.30, degreesOfFreedom: Infinity, description: "Voc temperature coefficient uncertainty, sensitivity ~-0.30%/°C", category: "Method" },
    { name: "Irradiance level effect", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.06, degreesOfFreedom: Infinity, description: "Voc logarithmic dependence on irradiance", category: "Environment" },
    { name: "Temperature measurement", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.30, degreesOfFreedom: Infinity, description: "Module temperature measurement uncertainty (°C)", category: "Equipment" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.1, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Repeated measurement std dev (n=10)", category: "Method" },
  ],
};

const IEC_61215_FF: UncertaintyTemplate = {
  id: "iec61215-ff",
  name: "IEC 61215 - Fill Factor",
  description: "Fill factor measurement uncertainty FF = Pmax / (Isc × Voc)",
  measurand: "Fill Factor",
  unit: "",
  category: "IEC 61215",
  standardReference: "IEC 61215-2:2021",
  measurementModel: "FF = Pmax / (Isc × Voc) = (Vmp × Imp) / (Voc × Isc)",
  defaultMeasuredValue: 0.78,
  components: [
    { name: "Pmax uncertainty (combined)", defaultUncertainty: 2.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Propagated from combined Pmax measurement uncertainty", category: "Method" },
    { name: "Isc uncertainty (combined)", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Propagated from combined Isc measurement uncertainty", category: "Method" },
    { name: "Voc uncertainty (combined)", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Propagated from combined Voc measurement uncertainty", category: "Method" },
    { name: "I-V curve sweep rate", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Effect of sweep rate on FF determination", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.15, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Repeated FF std dev (n=10)", category: "Method" },
  ],
};

const IEC_61215_TEMPCOEFF: UncertaintyTemplate = {
  id: "iec61215-tempcoeff",
  name: "IEC 61215 - Temperature Coefficients",
  description: "Temperature coefficient determination per IEC 60891",
  measurand: "γ_Pmax",
  unit: "%/°C",
  category: "IEC 61215",
  standardReference: "IEC 61215-2 MQT 05 / IEC 60891:2021",
  measurementModel: "γ = ΔPmax/ΔT from linear regression at 5+ temperature points (25°C to 75°C)",
  defaultMeasuredValue: -0.38,
  components: [
    { name: "Temperature measurement accuracy", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Thermocouple/PT100 sensor calibration", category: "Equipment" },
    { name: "Temperature uniformity on module", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Temperature distribution across module surface", category: "Environment" },
    { name: "Temperature stabilization", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Thermal equilibrium not fully reached", category: "Method" },
    { name: "I-V measurement at each point", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "I-V measurement uncertainty at each temperature", category: "Equipment" },
    { name: "Irradiance variation between points", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Irradiance stability over temperature sweep", category: "Environment" },
    { name: "Linear fit residuals (Type A)", defaultUncertainty: 0.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 3, description: "Linear regression residuals (min 5 temperature points)", category: "Method" },
  ],
};

const IEC_61215_VISUAL: UncertaintyTemplate = {
  id: "iec61215-visual",
  name: "IEC 61215 - Visual Inspection Dimensional",
  description: "Dimensional measurement uncertainty for visual inspection per IEC 61215",
  measurand: "Dimension",
  unit: "mm",
  category: "IEC 61215",
  standardReference: "IEC 61215-1 MQT 01",
  measurementModel: "L = L_measured ± U, with calibrated measuring instruments",
  defaultMeasuredValue: 1640,
  components: [
    { name: "Measuring instrument calibration", defaultUncertainty: 0.1, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Caliper or tape measure calibration", category: "Equipment" },
    { name: "Instrument resolution", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Resolution of measuring instrument (half of least count)", category: "Equipment" },
    { name: "Thermal expansion of module", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Dimensional change due to temperature deviation from 23°C", category: "Environment" },
    { name: "Operator positioning", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Parallax and positioning error by operator", category: "Personnel" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.2, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated dimensional measurement (n=5)", category: "Method" },
  ],
};

// ===== IEC 61730 Templates (Safety Qualification) =====

const IEC_61730_INSULATION: UncertaintyTemplate = {
  id: "iec61730-insulation",
  name: "IEC 61730 - Insulation Resistance",
  description: "Insulation resistance test per IEC 61730-2 MST 16",
  measurand: "Insulation Resistance",
  unit: "MΩ·m²",
  category: "IEC 61730",
  standardReference: "IEC 61730-2:2023 MST 16",
  measurementModel: "R_ins = V_test / I_leakage × A_module, at 500V or 1000V DC",
  defaultMeasuredValue: 400,
  components: [
    { name: "High-voltage source accuracy", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Applied voltage accuracy (±1% of reading)", category: "Equipment" },
    { name: "Leakage current measurement", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Picoammeter/electrometer accuracy at low currents", category: "Equipment" },
    { name: "Module area measurement", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Active area determination uncertainty", category: "Sample" },
    { name: "Temperature effect", defaultUncertainty: 2.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Insulation resistance varies with temperature", category: "Environment" },
    { name: "Humidity effect", defaultUncertainty: 1.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Surface humidity affects leakage current", category: "Environment" },
    { name: "Contact resistance", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Electrical contact quality to module frame/leads", category: "Method" },
    { name: "Measurement settling time", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Charging current decay to steady state", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 1.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated measurement std dev (n=5)", category: "Method" },
  ],
};

const IEC_61730_WET_LEAKAGE: UncertaintyTemplate = {
  id: "iec61730-wet-leakage",
  name: "IEC 61730 - Wet Leakage Current",
  description: "Wet leakage current test per IEC 61730-2 MST 17",
  measurand: "Leakage Current",
  unit: "μA",
  category: "IEC 61730",
  standardReference: "IEC 61730-2:2023 MST 17",
  measurementModel: "I_leak = measured leakage at 500V DC, module immersed in conductive solution",
  defaultMeasuredValue: 15,
  components: [
    { name: "Applied voltage accuracy", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DC voltage source accuracy at 500V", category: "Equipment" },
    { name: "Current measurement accuracy", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Microammeter accuracy at low levels", category: "Equipment" },
    { name: "Solution conductivity", defaultUncertainty: 1.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Wetting agent solution conductivity variation", category: "Method" },
    { name: "Water temperature", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Water temperature effect on conductivity", category: "Environment" },
    { name: "Immersion depth/coverage", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Complete wetting of module surfaces", category: "Method" },
    { name: "Stabilization time", defaultUncertainty: 1.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Current stabilization after voltage application", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 2.0, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated measurement (n=5)", category: "Method" },
  ],
};

const IEC_61730_IMPULSE: UncertaintyTemplate = {
  id: "iec61730-impulse",
  name: "IEC 61730 - Impulse Voltage",
  description: "Impulse voltage test per IEC 61730-2 MST 14",
  measurand: "Impulse Voltage Peak",
  unit: "kV",
  category: "IEC 61730",
  standardReference: "IEC 61730-2:2023 MST 14",
  measurementModel: "V_peak (1.2/50 μs waveform) applied between shorted leads and frame",
  defaultMeasuredValue: 6.0,
  components: [
    { name: "Impulse generator calibration", defaultUncertainty: 3.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Impulse generator peak voltage calibration", category: "Equipment" },
    { name: "Voltage divider ratio", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "HV divider ratio uncertainty", category: "Equipment" },
    { name: "Waveform parameters (T1, T2)", defaultUncertainty: 2.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 0.5, degreesOfFreedom: Infinity, description: "Rise time and half-value time deviation from 1.2/50μs", category: "Equipment" },
    { name: "Oscilloscope measurement", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Digital oscilloscope voltage accuracy", category: "Equipment" },
    { name: "Altitude/pressure correction", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Atmospheric pressure effect on breakdown voltage", category: "Environment" },
    { name: "Repeatability (Type A)", defaultUncertainty: 1.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 2, description: "3 positive + 3 negative applications", category: "Method" },
  ],
};

const IEC_61730_DIELECTRIC: UncertaintyTemplate = {
  id: "iec61730-dielectric",
  name: "IEC 61730 - Dielectric Withstand",
  description: "Dielectric withstand / Hi-pot test per IEC 61730-2 MST 15",
  measurand: "Leakage Current at Test Voltage",
  unit: "mA",
  category: "IEC 61730",
  standardReference: "IEC 61730-2:2023 MST 15",
  measurementModel: "I_leak at applied AC/DC voltage (typically 2000V+1000V per kV system voltage)",
  defaultMeasuredValue: 0.5,
  components: [
    { name: "Test voltage accuracy", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Hi-pot tester voltage accuracy", category: "Equipment" },
    { name: "Current measurement accuracy", defaultUncertainty: 3.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Leakage current meter accuracy at mA levels", category: "Equipment" },
    { name: "Voltage ramp rate", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 0.5, degreesOfFreedom: Infinity, description: "Voltage ramp rate effect on breakdown", category: "Method" },
    { name: "Ambient humidity", defaultUncertainty: 1.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Surface moisture affecting leakage path", category: "Environment" },
    { name: "Temperature effect", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Insulation resistance temperature dependence", category: "Environment" },
    { name: "Repeatability (Type A)", defaultUncertainty: 2.0, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated measurement (n=5)", category: "Method" },
  ],
};

// ===== IEC 61853 Templates (Energy Rating) =====

const IEC_61853_POWER_MATRIX: UncertaintyTemplate = {
  id: "iec61853-power-matrix",
  name: "IEC 61853-1 - Power Matrix",
  description: "Power at different irradiance/temperature conditions per IEC 61853-1",
  measurand: "Power at (G, T)",
  unit: "W",
  category: "IEC 61853",
  standardReference: "IEC 61853-1:2011",
  measurementModel: "P(G,T) = measured power at specific irradiance G and temperature T conditions",
  defaultMeasuredValue: 280,
  components: [
    { name: "Reference cell calibration", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference cell calibration at target irradiance", category: "Reference Standard" },
    { name: "Irradiance setting accuracy", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Irradiance level control accuracy (e.g., at 200, 400, 600, 800, 1000, 1100 W/m²)", category: "Equipment" },
    { name: "Temperature control accuracy", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.45, degreesOfFreedom: Infinity, description: "Module temperature control at target (15, 25, 50, 75°C)", category: "Equipment" },
    { name: "Spectral mismatch at low irradiance", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral mismatch increases at low irradiance levels", category: "Method" },
    { name: "Simulator non-uniformity", defaultUncertainty: 2.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spatial non-uniformity may vary with irradiance level", category: "Equipment" },
    { name: "I-V measurement", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Combined I-V DAQ uncertainty", category: "Equipment" },
    { name: "Module preconditioning", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Light-soaking / stabilization state of module", category: "Sample" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated measurements at same condition (n=5)", category: "Method" },
  ],
};

const IEC_61853_SPECTRAL: UncertaintyTemplate = {
  id: "iec61853-spectral",
  name: "IEC 61853-2 - Spectral Response",
  description: "Spectral responsivity measurement per IEC 60904-8",
  measurand: "Spectral Responsivity",
  unit: "A/W",
  category: "IEC 61853",
  standardReference: "IEC 61853-2 / IEC 60904-8:2014",
  measurementModel: "SR(λ) = I_DUT(λ) / [E(λ) × A_cell], measured at each wavelength",
  defaultMeasuredValue: 0.55,
  components: [
    { name: "Reference detector calibration", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference detector spectral calibration from NMI", category: "Reference Standard" },
    { name: "Monochromator wavelength accuracy", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Wavelength setting accuracy and bandwidth", category: "Equipment" },
    { name: "Lock-in amplifier accuracy", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Signal detection electronics", category: "Equipment" },
    { name: "Bias light level", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Bias light intensity and uniformity", category: "Equipment" },
    { name: "Temperature during measurement", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 0.3, degreesOfFreedom: Infinity, description: "Cell temperature stability during scan", category: "Environment" },
    { name: "Stray light", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Stray/scattered light in monochromator", category: "Equipment" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated SR scans (n=5)", category: "Method" },
  ],
};

const IEC_61853_AOI: UncertaintyTemplate = {
  id: "iec61853-aoi",
  name: "IEC 61853-2 - Angle of Incidence",
  description: "Angular dependence (IAM) measurement per IEC 61853-2",
  measurand: "IAM (Incidence Angle Modifier)",
  unit: "",
  category: "IEC 61853",
  standardReference: "IEC 61853-2:2016",
  measurementModel: "IAM(θ) = Isc(θ) / [Isc(0°) × cos(θ)], relative to normal incidence",
  defaultMeasuredValue: 0.95,
  components: [
    { name: "Angle setting accuracy", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Goniometer/rotation stage angular accuracy (degrees)", category: "Equipment" },
    { name: "Isc measurement accuracy", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Short-circuit current measurement at each angle", category: "Equipment" },
    { name: "Collimation quality", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Light source collimation (beam divergence)", category: "Equipment" },
    { name: "Module alignment", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Initial alignment to normal incidence", category: "Method" },
    { name: "Irradiance stability", defaultUncertainty: 0.3, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Light source intensity stability during angle scan", category: "Equipment" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.3, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated angle scans (n=5)", category: "Method" },
  ],
};

// ===== IEC 60891 Templates (I-V Translation) =====

const IEC_60891_TEMP_CORRECTION: UncertaintyTemplate = {
  id: "iec60891-temp-correction",
  name: "IEC 60891 - Temperature Correction",
  description: "I-V curve translation for temperature correction per IEC 60891",
  measurand: "Corrected Pmax",
  unit: "W",
  category: "IEC 60891",
  standardReference: "IEC 60891:2021",
  measurementModel: "Pcorr = Pmeas × [1 + γ(T_ref - T_meas)] × (G_ref / G_meas)",
  defaultMeasuredValue: 350,
  components: [
    { name: "Measured power uncertainty", defaultUncertainty: 2.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Combined Pmax measurement uncertainty", category: "Equipment" },
    { name: "Temperature coefficient (γ_Pmax)", defaultUncertainty: 5.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.1, degreesOfFreedom: Infinity, description: "Uncertainty in γ_Pmax (%/°C), sensitivity depends on ΔT", category: "Reference Standard" },
    { name: "Temperature measurement", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.45, degreesOfFreedom: Infinity, description: "Module temperature measurement (°C)", category: "Equipment" },
    { name: "Irradiance correction linearity", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Assumption of linear irradiance correction", category: "Method" },
    { name: "Series resistance (Rs) for Procedure 1", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.5, degreesOfFreedom: Infinity, description: "Series resistance used in translation", category: "Method" },
    { name: "Curve correction factor κ", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "IEC 60891 curve correction factor uncertainty", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.3, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Repeated corrected measurements (n=10)", category: "Method" },
  ],
};

const IEC_60891_IRR_CORRECTION: UncertaintyTemplate = {
  id: "iec60891-irradiance-correction",
  name: "IEC 60891 - Irradiance Correction",
  description: "I-V curve translation for irradiance correction per IEC 60891",
  measurand: "Corrected Isc",
  unit: "A",
  category: "IEC 60891",
  standardReference: "IEC 60891:2021",
  measurementModel: "Isc_corr = Isc_meas × (G_ref / G_meas) × [1 + α(T_ref - T_meas)]",
  defaultMeasuredValue: 9.5,
  components: [
    { name: "Isc measurement uncertainty", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: 30, description: "Combined Isc measurement uncertainty", category: "Equipment" },
    { name: "Irradiance measurement", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference irradiance measurement uncertainty", category: "Reference Standard" },
    { name: "Temperature coefficient (α_Isc)", defaultUncertainty: 5.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 0.02, degreesOfFreedom: Infinity, description: "α_Isc uncertainty, sensitivity depends on ΔT", category: "Reference Standard" },
    { name: "Spectral mismatch at actual irradiance", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral mismatch at measurement vs reference conditions", category: "Method" },
    { name: "Non-linearity of Isc with G", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Deviation from linear Isc-vs-G assumption", category: "Sample" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.2, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 9, description: "Repeated corrected measurements (n=10)", category: "Method" },
  ],
};

const IEC_60891_CURVE_FIT: UncertaintyTemplate = {
  id: "iec60891-curve-fitting",
  name: "IEC 60891 - I-V Curve Fitting",
  description: "Uncertainty in I-V curve fitting parameters per IEC 60891",
  measurand: "Fitted Rs",
  unit: "Ω",
  category: "IEC 60891",
  standardReference: "IEC 60891:2021 Procedure 1",
  measurementModel: "V2 = V1 + Isc1(G2/G1 - 1)Rs - κ·Isc1·(G2/G1 - 1)·Rs + β(T2-T1)",
  defaultMeasuredValue: 0.35,
  components: [
    { name: "I-V data point accuracy", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Individual I-V point voltage/current accuracy", category: "Equipment" },
    { name: "Number of I-V data points", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Sampling density along I-V curve", category: "Method" },
    { name: "Fitting algorithm convergence", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Least-squares fitting numerical accuracy", category: "Method" },
    { name: "Model parameter correlation", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Correlation between Rs, Rsh, n, Io parameters", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 4, description: "Repeated fitting from multiple I-V curves (n=5)", category: "Method" },
  ],
};

// ===== IEC 61724 Templates (PV System Performance) =====

const IEC_61724_PR: UncertaintyTemplate = {
  id: "iec61724-pr",
  name: "IEC 61724 - Performance Ratio",
  description: "PV system performance ratio per IEC 61724-1",
  measurand: "Performance Ratio",
  unit: "",
  category: "IEC 61724",
  standardReference: "IEC 61724-1:2021",
  measurementModel: "PR = E_out / (H_i × P_STC / G_STC), where E=energy, H=irradiation, P=rated power",
  defaultMeasuredValue: 0.82,
  components: [
    { name: "Energy meter accuracy", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "AC energy meter (revenue grade ±0.5%)", category: "Equipment" },
    { name: "Pyranometer calibration", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Pyranometer calibration uncertainty (Class A: ±2%)", category: "Reference Standard" },
    { name: "Pyranometer spectral response", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral selectivity of irradiance sensor", category: "Equipment" },
    { name: "Pyranometer temperature dependence", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Temperature coefficient of pyranometer", category: "Equipment" },
    { name: "Pyranometer zero offset", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Thermal offset and night-time drift", category: "Equipment" },
    { name: "Irradiation data aggregation", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Data logger sampling and aggregation", category: "Method" },
    { name: "Module nameplate rating (P_STC)", defaultUncertainty: 3.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Uncertainty in rated power (manufacturer tolerance)", category: "Sample" },
    { name: "Data completeness", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Gap-filling uncertainty for missing data", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 1.0, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 11, description: "Monthly PR variation over 12 months", category: "Method" },
  ],
};

const IEC_61724_YIELD: UncertaintyTemplate = {
  id: "iec61724-yield",
  name: "IEC 61724 - Specific Yield",
  description: "Specific energy yield per IEC 61724-1",
  measurand: "Specific Yield",
  unit: "kWh/kWp",
  category: "IEC 61724",
  standardReference: "IEC 61724-1:2021",
  measurementModel: "Y_f = E_out / P_STC (final yield = AC energy / rated DC power)",
  defaultMeasuredValue: 1450,
  components: [
    { name: "AC energy measurement", defaultUncertainty: 0.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Revenue-grade AC energy meter", category: "Equipment" },
    { name: "Rated power uncertainty", defaultUncertainty: 3.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Module STC power rating tolerance (±3%)", category: "Sample" },
    { name: "Data logger timing", defaultUncertainty: 0.1, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Timestamp accuracy for energy integration", category: "Equipment" },
    { name: "CT/PT transformation ratio", defaultUncertainty: 0.3, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Current/potential transformer accuracy", category: "Equipment" },
    { name: "Inverter power quality", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Inverter waveform distortion effect on energy meter", category: "Equipment" },
    { name: "Repeatability (Type A)", defaultUncertainty: 1.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 11, description: "Monthly yield variation (12 months)", category: "Method" },
  ],
};

const IEC_61724_REF_YIELD: UncertaintyTemplate = {
  id: "iec61724-reference-yield",
  name: "IEC 61724 - Reference Yield",
  description: "Reference yield (in-plane irradiation) per IEC 61724-1",
  measurand: "Reference Yield",
  unit: "kWh/m²",
  category: "IEC 61724",
  standardReference: "IEC 61724-1:2021",
  measurementModel: "Y_r = H_i / G_STC (reference yield = total irradiation / 1000 W/m²)",
  defaultMeasuredValue: 1750,
  components: [
    { name: "Pyranometer calibration", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Irradiance sensor calibration (secondary standard)", category: "Reference Standard" },
    { name: "Cosine response error", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Deviation from ideal cosine response", category: "Equipment" },
    { name: "Spectral selectivity", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Non-ideal spectral response of pyranometer", category: "Equipment" },
    { name: "Soiling of sensor", defaultUncertainty: 1.0, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Dust/soiling on pyranometer dome", category: "Environment" },
    { name: "Tilt/azimuth of sensor", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Sensor mounting angle accuracy", category: "Method" },
    { name: "Data sampling and integration", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Numerical integration of irradiance data", category: "Method" },
    { name: "Repeatability (Type A)", defaultUncertainty: 1.5, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 11, description: "Annual irradiation variability", category: "Method" },
  ],
};

// ===== Additional IEC 60904 Templates =====

const IEC_60904_SPECTRAL_MISMATCH: UncertaintyTemplate = {
  id: "iec60904-spectral-mismatch",
  name: "IEC 60904-7 - Spectral Mismatch",
  description: "Spectral mismatch correction factor M per IEC 60904-7",
  measurand: "Mismatch Factor M",
  unit: "",
  category: "IEC 60904",
  standardReference: "IEC 60904-7:2019",
  measurementModel: "M = [∫E_ref·SR_ref·dλ × ∫E_sim·SR_DUT·dλ] / [∫E_sim·SR_ref·dλ × ∫E_ref·SR_DUT·dλ]",
  defaultMeasuredValue: 1.002,
  components: [
    { name: "Reference cell SR calibration", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference cell spectral response calibration from NMI", category: "Reference Standard" },
    { name: "DUT spectral response", defaultUncertainty: 3.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DUT spectral response measurement uncertainty", category: "Sample" },
    { name: "Simulator spectrum measurement", defaultUncertainty: 2.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectroradiometer measurement of simulator", category: "Equipment" },
    { name: "AM1.5G reference spectrum", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference spectrum data (IEC 60904-3)", category: "Reference Standard" },
    { name: "Numerical integration", defaultUncertainty: 0.2, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Numerical integration method uncertainty", category: "Method" },
    { name: "Wavelength range coverage", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Measurement wavelength range completeness", category: "Method" },
  ],
};

const IEC_60904_IRRADIANCE: UncertaintyTemplate = {
  id: "iec60904-irradiance",
  name: "IEC 60904-2 - Irradiance Measurement",
  description: "Irradiance measurement using reference cell per IEC 60904-2",
  measurand: "Irradiance",
  unit: "W/m²",
  category: "IEC 60904",
  standardReference: "IEC 60904-2:2015",
  measurementModel: "G = Isc_ref / S_ref × M, where S_ref = calibrated sensitivity",
  defaultMeasuredValue: 1000,
  components: [
    { name: "Reference cell calibration", defaultUncertainty: 1.5, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Primary/secondary calibration of reference cell", category: "Reference Standard" },
    { name: "Spectral mismatch", defaultUncertainty: 1.0, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Spectral mismatch between reference and test conditions", category: "Method" },
    { name: "Angular response", defaultUncertainty: 0.3, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Cosine response deviation of reference cell", category: "Equipment" },
    { name: "Temperature correction of reference", defaultUncertainty: 0.2, distribution: "normal", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Reference cell temperature correction accuracy", category: "Method" },
    { name: "Data acquisition accuracy", defaultUncertainty: 0.05, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "DAQ resolution and accuracy for Isc measurement", category: "Equipment" },
    { name: "Reference cell long-term stability", defaultUncertainty: 0.5, distribution: "uniform", type: "typeB", sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, description: "Drift between calibrations", category: "Reference Standard" },
    { name: "Repeatability (Type A)", defaultUncertainty: 0.1, distribution: "normal", type: "typeA", sensitivityCoefficient: 1.0, degreesOfFreedom: 19, description: "Repeated measurements (n=20)", category: "Method" },
  ],
};

// ===== Collect ALL Templates =====

export const UNCERTAINTY_TEMPLATES: UncertaintyTemplate[] = [
  // IEC 61215 - Design Qualification
  IEC_61215_PMAX,
  IEC_61215_ISC,
  IEC_61215_VOC,
  IEC_61215_FF,
  IEC_61215_TEMPCOEFF,
  IEC_61215_VISUAL,
  // IEC 61730 - Safety
  IEC_61730_INSULATION,
  IEC_61730_WET_LEAKAGE,
  IEC_61730_IMPULSE,
  IEC_61730_DIELECTRIC,
  // IEC 61853 - Energy Rating
  IEC_61853_POWER_MATRIX,
  IEC_61853_SPECTRAL,
  IEC_61853_AOI,
  // IEC 60891 - I-V Translation
  IEC_60891_TEMP_CORRECTION,
  IEC_60891_IRR_CORRECTION,
  IEC_60891_CURVE_FIT,
  // IEC 61724 - System Performance
  IEC_61724_PR,
  IEC_61724_YIELD,
  IEC_61724_REF_YIELD,
  // IEC 60904 - Measurement Fundamentals
  IEC_60904_SPECTRAL_MISMATCH,
  IEC_60904_IRRADIANCE,
];

export const TEMPLATE_CATEGORIES = [
  { id: "IEC 61215", name: "IEC 61215 - Design Qualification", count: 6 },
  { id: "IEC 61730", name: "IEC 61730 - Safety Qualification", count: 4 },
  { id: "IEC 61853", name: "IEC 61853 - Energy Rating", count: 3 },
  { id: "IEC 60891", name: "IEC 60891 - I-V Translation", count: 3 },
  { id: "IEC 61724", name: "IEC 61724 - System Performance", count: 3 },
  { id: "IEC 60904", name: "IEC 60904 - Measurement", count: 2 },
];
