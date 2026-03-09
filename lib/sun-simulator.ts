/**
 * Sun Simulator Classification - IEC 60904-9 Ed.3
 * TypeScript port of SunSim-IEC60904-Classifier
 */

export type ClassificationGrade = "A+" | "A" | "B" | "C" | "Fail";

export interface WavelengthBand {
  range: string;
  start: number;
  end: number;
  am15gFraction: number;
}

export const WAVELENGTH_BANDS: WavelengthBand[] = [
  { range: "400-500nm", start: 400, end: 500, am15gFraction: 18.4 },
  { range: "500-600nm", start: 500, end: 600, am15gFraction: 19.9 },
  { range: "600-700nm", start: 600, end: 700, am15gFraction: 18.4 },
  { range: "700-800nm", start: 700, end: 800, am15gFraction: 14.9 },
  { range: "800-900nm", start: 800, end: 900, am15gFraction: 12.5 },
  { range: "900-1100nm", start: 900, end: 1100, am15gFraction: 15.9 },
];

/** AM1.5G Reference Spectrum (selected wavelengths, W/m²/nm) */
export const AM15G_REFERENCE: Record<number, number> = {
  300: 0.04, 350: 0.59, 400: 1.11, 450: 1.74, 500: 1.84, 550: 1.72,
  600: 1.64, 650: 1.53, 700: 1.32, 750: 1.26, 800: 1.12, 850: 0.97,
  900: 0.87, 950: 0.17, 1000: 0.74, 1050: 0.64, 1100: 0.52, 1150: 0.31, 1200: 0.17,
};

export interface SpectralDataPoint {
  wavelength: number;
  irradiance: number;
}

export interface SpectralBandResult {
  band: string;
  start: number;
  end: number;
  measuredFraction: number;
  referenceFraction: number;
  ratio: number;
  inSpecAPlus: boolean;
  inSpecA: boolean;
  inSpecB: boolean;
  inSpecC: boolean;
}

export interface SpectralMatchResult {
  intervals: SpectralBandResult[];
  minRatio: number;
  maxRatio: number;
  meanRatio: number;
  grade: ClassificationGrade;
  weightedDeviationPct: number;
}

/** Trapezoidal integration */
function trapezoid(x: number[], y: number[]): number {
  let sum = 0;
  for (let i = 0; i < x.length - 1; i++) {
    sum += (x[i + 1] - x[i]) * (y[i] + y[i + 1]) / 2;
  }
  return sum;
}

/** Linear interpolation */
function interpolate(x: number, x0: number, y0: number, x1: number, y1: number): number {
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

/** Interpolate data array at target wavelengths */
function interpolateSpectrum(data: SpectralDataPoint[], targetWavelengths: number[]): number[] {
  return targetWavelengths.map((wl) => {
    if (wl <= data[0].wavelength) return data[0].irradiance;
    if (wl >= data[data.length - 1].wavelength) return data[data.length - 1].irradiance;
    for (let i = 0; i < data.length - 1; i++) {
      if (wl >= data[i].wavelength && wl <= data[i + 1].wavelength) {
        return interpolate(wl, data[i].wavelength, data[i].irradiance, data[i + 1].wavelength, data[i + 1].irradiance);
      }
    }
    return 0;
  });
}

/** Calculate spectral match classification per IEC 60904-9 SPD method */
export function calculateSpectralMatch(data: SpectralDataPoint[]): SpectralMatchResult {
  const sorted = [...data].sort((a, b) => a.wavelength - b.wavelength);
  const wavelengths = sorted.map((d) => d.wavelength);
  const irradiances = sorted.map((d) => d.irradiance);
  const totalMeasured = trapezoid(wavelengths, irradiances);

  const intervals: SpectralBandResult[] = WAVELENGTH_BANDS.map((band) => {
    // Filter or interpolate to band range
    const bandWl: number[] = [];
    const bandIrr: number[] = [];

    for (let wl = band.start; wl <= band.end; wl += 5) {
      bandWl.push(wl);
      const irr = interpolateSpectrum(sorted, [wl])[0];
      bandIrr.push(irr);
    }

    const bandIntegral = trapezoid(bandWl, bandIrr);
    const measuredFraction = totalMeasured > 0 ? (bandIntegral / totalMeasured) * 100 : 0;
    const ratio = band.am15gFraction > 0 ? measuredFraction / band.am15gFraction : 0;

    return {
      band: band.range,
      start: band.start,
      end: band.end,
      measuredFraction,
      referenceFraction: band.am15gFraction,
      ratio,
      inSpecAPlus: ratio >= 0.875 && ratio <= 1.125,
      inSpecA: ratio >= 0.75 && ratio <= 1.25,
      inSpecB: ratio >= 0.6 && ratio <= 1.4,
      inSpecC: ratio >= 0.4 && ratio <= 2.0,
    };
  });

  const ratios = intervals.map((r) => r.ratio);
  let grade: ClassificationGrade = "Fail";
  if (intervals.every((r) => r.inSpecAPlus)) grade = "A+";
  else if (intervals.every((r) => r.inSpecA)) grade = "A";
  else if (intervals.every((r) => r.inSpecB)) grade = "B";
  else if (intervals.every((r) => r.inSpecC)) grade = "C";

  const weightedDeviationPct =
    Math.sqrt(ratios.reduce((sum, r) => sum + (r - 1) ** 2, 0) / ratios.length) * 100;

  return {
    intervals,
    minRatio: Math.min(...ratios),
    maxRatio: Math.max(...ratios),
    meanRatio: ratios.reduce((a, b) => a + b, 0) / ratios.length,
    grade,
    weightedDeviationPct,
  };
}

/** Uniformity calculation */
export interface UniformityResult {
  nonUniformity: number;
  grade: ClassificationGrade;
  mean: number;
  min: number;
  max: number;
  std: number;
  cv: number;
  grid: number[][];
}

export function calculateUniformity(grid: number[][]): UniformityResult {
  const flat = grid.flat();
  const mean = flat.reduce((a, b) => a + b, 0) / flat.length;
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const std = Math.sqrt(flat.reduce((sum, v) => sum + (v - mean) ** 2, 0) / flat.length);
  const cv = mean > 0 ? (std / mean) * 100 : 0;
  const nonUniformity = (max + min) > 0 ? ((max - min) / (max + min)) * 100 : 0;

  let grade: ClassificationGrade = "Fail";
  if (nonUniformity <= 1) grade = "A+";
  else if (nonUniformity <= 2) grade = "A";
  else if (nonUniformity <= 5) grade = "B";
  else if (nonUniformity <= 10) grade = "C";

  return { nonUniformity, grade, mean, min, max, std, cv, grid };
}

/** Temporal stability calculation */
export interface TemporalStabilityResult {
  sti: number;
  lti: number;
  stiGrade: ClassificationGrade;
  ltiGrade: ClassificationGrade;
  overallGrade: ClassificationGrade;
  stiData: { time: number; irradiance: number }[];
  ltiData: { time: number; irradiance: number }[];
}

function classifySTI(value: number): ClassificationGrade {
  if (value <= 0.5) return "A+";
  if (value <= 2) return "A";
  if (value <= 5) return "B";
  if (value <= 10) return "C";
  return "Fail";
}

function classifyLTI(value: number): ClassificationGrade {
  if (value <= 1) return "A+";
  if (value <= 2) return "A";
  if (value <= 5) return "B";
  if (value <= 10) return "C";
  return "Fail";
}

const gradeOrder: ClassificationGrade[] = ["A+", "A", "B", "C", "Fail"];

function worseGrade(a: ClassificationGrade, b: ClassificationGrade): ClassificationGrade {
  return gradeOrder.indexOf(a) >= gradeOrder.indexOf(b) ? a : b;
}

export function calculateTemporalStability(
  stiData: { time: number; irradiance: number }[],
  ltiData: { time: number; irradiance: number }[]
): TemporalStabilityResult {
  const stiValues = stiData.map((d) => d.irradiance);
  const stiMax = Math.max(...stiValues);
  const stiMin = Math.min(...stiValues);
  const sti = (stiMax + stiMin) > 0 ? ((stiMax - stiMin) / (stiMax + stiMin)) * 100 : 0;

  const ltiValues = ltiData.map((d) => d.irradiance);
  const ltiMax = Math.max(...ltiValues);
  const ltiMin = Math.min(...ltiValues);
  const lti = (ltiMax + ltiMin) > 0 ? ((ltiMax - ltiMin) / (ltiMax + ltiMin)) * 100 : 0;

  const stiGrade = classifySTI(sti);
  const ltiGrade = classifyLTI(lti);
  const overallGrade = worseGrade(stiGrade, ltiGrade);

  return { sti, lti, stiGrade, ltiGrade, overallGrade, stiData, ltiData };
}

/** SPC/MSA calculations */
export interface SPCDataPoint {
  subgroup: number;
  values: number[];
}

export interface SPCResult {
  xBar: number[];
  range: number[];
  xBarMean: number;
  rMean: number;
  xBarUCL: number;
  xBarLCL: number;
  rUCL: number;
  rLCL: number;
  cp: number;
  cpk: number;
  subgroups: number[];
}

// SPC constants for subgroup sizes 2-10
const A2: Record<number, number> = { 2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308 };
const D3: Record<number, number> = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223 };
const D4: Record<number, number> = { 2: 3.267, 3: 2.575, 4: 2.282, 5: 2.115, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777 };
const d2: Record<number, number> = { 2: 1.128, 3: 1.693, 4: 2.059, 5: 2.326, 6: 2.534, 7: 2.704, 8: 2.847, 9: 2.970, 10: 3.078 };

export function calculateSPC(
  data: SPCDataPoint[],
  usl: number,
  lsl: number
): SPCResult {
  const n = data[0]?.values.length || 2;
  const xBars = data.map((d) => d.values.reduce((a, b) => a + b, 0) / d.values.length);
  const ranges = data.map((d) => Math.max(...d.values) - Math.min(...d.values));
  const xBarMean = xBars.reduce((a, b) => a + b, 0) / xBars.length;
  const rMean = ranges.reduce((a, b) => a + b, 0) / ranges.length;

  const a2 = A2[n] || 0.577;
  const d3 = D3[n] || 0;
  const d4 = D4[n] || 2.115;
  const d2Val = d2[n] || 2.326;

  const xBarUCL = xBarMean + a2 * rMean;
  const xBarLCL = xBarMean - a2 * rMean;
  const rUCL = d4 * rMean;
  const rLCL = d3 * rMean;

  const sigma = rMean / d2Val;
  const cp = sigma > 0 ? (usl - lsl) / (6 * sigma) : 0;
  const cpuValue = sigma > 0 ? (usl - xBarMean) / (3 * sigma) : 0;
  const cplValue = sigma > 0 ? (xBarMean - lsl) / (3 * sigma) : 0;
  const cpk = Math.min(cpuValue, cplValue);

  return {
    xBar: xBars,
    range: ranges,
    xBarMean,
    rMean,
    xBarUCL,
    xBarLCL,
    rUCL,
    rLCL,
    cp,
    cpk,
    subgroups: data.map((d) => d.subgroup),
  };
}

/** Gage R&R (MSA) calculation */
export interface GageRRResult {
  repeatability: number;
  reproducibility: number;
  gageRR: number;
  partVariation: number;
  totalVariation: number;
  gageRRPercent: number;
  ndc: number; // Number of distinct categories
  acceptable: boolean;
}

export function calculateGageRR(
  measurements: number[][][]  // [operator][part][trial]
): GageRRResult {
  const nOperators = measurements.length;
  const nParts = measurements[0]?.length || 0;
  const nTrials = measurements[0]?.[0]?.length || 0;
  const total = nOperators * nParts * nTrials;

  // Grand mean
  let grandSum = 0;
  measurements.forEach((op) => op.forEach((part) => part.forEach((v) => (grandSum += v))));
  const grandMean = grandSum / total;

  // Part means
  const partMeans = Array.from({ length: nParts }, (_, p) => {
    let sum = 0, count = 0;
    measurements.forEach((op) => op[p]?.forEach((v) => { sum += v; count++; }));
    return sum / count;
  });

  // Operator means
  const opMeans = measurements.map((op) => {
    let sum = 0, count = 0;
    op.forEach((part) => part.forEach((v) => { sum += v; count++; }));
    return sum / count;
  });

  // Equipment variation (repeatability) - within operator, within part
  let ssWithin = 0;
  measurements.forEach((op) =>
    op.forEach((part) => {
      const mean = part.reduce((a, b) => a + b, 0) / part.length;
      part.forEach((v) => (ssWithin += (v - mean) ** 2));
    })
  );
  const repeatabilityVar = ssWithin / (total - nOperators * nParts);

  // Appraiser variation (reproducibility)
  const ssOperator = nParts * nTrials * opMeans.reduce((sum, m) => sum + (m - grandMean) ** 2, 0);
  const reproducibilityVar = Math.max(0, (ssOperator / (nOperators - 1) - repeatabilityVar) / (nParts * nTrials));

  // Part variation
  const ssPart = nOperators * nTrials * partMeans.reduce((sum, m) => sum + (m - grandMean) ** 2, 0);
  const partVar = Math.max(0, (ssPart / (nParts - 1) - repeatabilityVar) / (nOperators * nTrials));

  const gageRRVar = repeatabilityVar + reproducibilityVar;
  const totalVar = gageRRVar + partVar;
  const gageRR = Math.sqrt(gageRRVar);
  const totalVariation = Math.sqrt(totalVar);
  const gageRRPercent = totalVar > 0 ? (gageRRVar / totalVar) * 100 : 0;
  const ndc = totalVar > 0 ? Math.floor(1.41 * Math.sqrt(partVar / gageRRVar)) : 0;

  return {
    repeatability: Math.sqrt(repeatabilityVar),
    reproducibility: Math.sqrt(reproducibilityVar),
    gageRR,
    partVariation: Math.sqrt(partVar),
    totalVariation,
    gageRRPercent,
    ndc,
    acceptable: gageRRPercent <= 10,
  };
}

/** Overall classification (worst of spectral, uniformity, temporal) */
export function overallClassification(
  spectral: ClassificationGrade,
  uniformity: ClassificationGrade,
  temporal: ClassificationGrade
): ClassificationGrade {
  return worseGrade(worseGrade(spectral, uniformity), temporal);
}
