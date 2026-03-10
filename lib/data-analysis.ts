// Data Analysis utility functions for statistical calculations and IEC tolerance checks

export interface DataPoint {
  id: string;
  sampleId: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  testStandard: string;
  operator: string;
  equipment: string;
}

export interface StatisticalSummary {
  count: number;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  median: number;
  range: number;
  cv: number; // coefficient of variation %
  cp: number;
  cpk: number;
  lsl: number;
  usl: number;
  passFail: "pass" | "fail" | "marginal";
}

export interface IECTolerance {
  parameter: string;
  unit: string;
  nominalValue: number;
  lowerLimit: number;
  upperLimit: number;
  standard: string;
  clause: string;
}

// IEC tolerance specs for common PV parameters
export const IEC_TOLERANCES: IECTolerance[] = [
  { parameter: "Pmax", unit: "W", nominalValue: 400, lowerLimit: -3, upperLimit: 3, standard: "IEC 61215", clause: "MQT 06" },
  { parameter: "Voc", unit: "V", nominalValue: 49.5, lowerLimit: -5, upperLimit: 5, standard: "IEC 61215", clause: "MQT 06" },
  { parameter: "Isc", unit: "A", nominalValue: 10.2, lowerLimit: -5, upperLimit: 5, standard: "IEC 61215", clause: "MQT 06" },
  { parameter: "FF", unit: "%", nominalValue: 79.5, lowerLimit: -5, upperLimit: 5, standard: "IEC 61215", clause: "MQT 06" },
  { parameter: "Insulation Resistance", unit: "MΩ", nominalValue: 400, lowerLimit: 0, upperLimit: 100, standard: "IEC 61730", clause: "MST 16" },
  { parameter: "Wet Leakage Current", unit: "μA", nominalValue: 10, lowerLimit: 0, upperLimit: 100, standard: "IEC 61730", clause: "MST 17" },
  { parameter: "Spectral Responsivity", unit: "A/W", nominalValue: 0.55, lowerLimit: -2, upperLimit: 2, standard: "IEC 60904-8", clause: "7.3" },
  { parameter: "Irradiance", unit: "W/m²", nominalValue: 1000, lowerLimit: -2, upperLimit: 2, standard: "IEC 60904-3", clause: "5.2" },
];

export function calculateStatistics(
  values: number[],
  lsl: number,
  usl: number
): StatisticalSummary {
  const n = values.length;
  if (n === 0) {
    return {
      count: 0, mean: 0, stdDev: 0, min: 0, max: 0, median: 0,
      range: 0, cv: 0, cp: 0, cpk: 0, lsl, usl, passFail: "fail",
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1 || 1);
  const stdDev = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[n - 1];
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  const cp = stdDev > 0 ? (usl - lsl) / (6 * stdDev) : 0;
  const cpupper = stdDev > 0 ? (usl - mean) / (3 * stdDev) : 0;
  const cplower = stdDev > 0 ? (mean - lsl) / (3 * stdDev) : 0;
  const cpk = Math.min(cpupper, cplower);

  let passFail: "pass" | "fail" | "marginal" = "pass";
  if (cpk < 1.0) passFail = "fail";
  else if (cpk < 1.33) passFail = "marginal";

  return {
    count: n,
    mean,
    stdDev,
    min,
    max,
    median,
    range: max - min,
    cv: mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0,
    cp,
    cpk,
    lsl,
    usl,
    passFail,
  };
}

export function generateHistogramBins(values: number[], binCount = 12): { bin: string; count: number; cumulative: number }[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount || 1;
  const bins: { bin: string; count: number; cumulative: number }[] = [];
  let cumulative = 0;

  for (let i = 0; i < binCount; i++) {
    const lo = min + i * binWidth;
    const hi = lo + binWidth;
    const count = values.filter(v => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
    cumulative += count;
    bins.push({
      bin: `${lo.toFixed(1)}-${hi.toFixed(1)}`,
      count,
      cumulative,
    });
  }
  return bins;
}

export function checkIECPassFail(
  parameter: string,
  measuredValue: number,
  nominalValue: number,
  tolerancePct: number
): { pass: boolean; deviation: number; deviationPct: number } {
  const deviationPct = ((measuredValue - nominalValue) / nominalValue) * 100;
  return {
    pass: Math.abs(deviationPct) <= tolerancePct,
    deviation: measuredValue - nominalValue,
    deviationPct,
  };
}

// Mock dataset generator for demo
export function generateMockData(parameter: string, nominal: number, stdPct: number, count: number): DataPoint[] {
  const points: DataPoint[] = [];
  const operators = ["Tech-A", "Tech-B", "Tech-C"];
  const equipments = ["Spire 4600SLP", "Pasan IIIb", "Halm IV-CT"];
  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.5) * 2 * (nominal * stdPct / 100);
    points.push({
      id: `DP-${i.toString().padStart(4, "0")}`,
      sampleId: `S-${(Math.floor(i / 5) + 1).toString().padStart(3, "0")}`,
      parameter,
      value: Number((nominal + noise).toFixed(4)),
      unit: parameter === "Pmax" ? "W" : parameter === "Voc" ? "V" : parameter === "Isc" ? "A" : "%",
      timestamp: new Date(2026, 0, 1 + Math.floor(i / 3), 8 + (i % 8)).toISOString(),
      testStandard: "IEC 61215",
      operator: operators[i % operators.length],
      equipment: equipments[i % equipments.length],
    });
  }
  return points;
}
