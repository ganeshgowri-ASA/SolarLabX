// Statistical analysis utilities and mock data for Data Analysis module

export interface DataPoint {
  sampleId: string
  batchId: string
  module: string
  manufacturer: string
  testDate: string
  pmax: number
  voc: number
  isc: number
  ff: number
  efficiency: number
  irradiance: number
  temperature: number
  testStandard: string
  result: 'pass' | 'fail'
}

export interface StatisticalSummary {
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
  outlierCount: number
}

export interface HistogramBin {
  range: string
  count: number
  midpoint: number
}

/** Result of a Grubbs iterative outlier test (ISO 5725-2:2019). */
export interface GrubbsResult {
  /** Original indices of values flagged as outliers. */
  outlierIndices: number[]
  /** Raw values flagged as outliers, in detection order. */
  outlierValues: number[]
  /** G statistic of the last tested (most extreme remaining) value. */
  testStatistic: number
  /** Tabulated G critical value for the final remaining n at α=0.05. */
  criticalValue: number
}

/** Shewhart X-bar control limits for SPC monitoring (ISO 7870-2:2013). */
export interface ControlLimits {
  /** Upper Control Limit: mean + 3σ (action limit). */
  ucl: number
  /** Lower Control Limit: mean − 3σ (action limit). */
  lcl: number
  /** Upper Warning Limit: mean + 2σ (Western Electric Rule 2). */
  uwl: number
  /** Lower Warning Limit: mean − 2σ (Western Electric Rule 2). */
  lwl: number
  mean: number
  sigma: number
}

// Grubbs critical values G_crit at α=0.05 (two-tailed), source: ISO 5725-2:2019 Table C.1
// Stored as [n, G_crit] pairs; values between entries are linearly interpolated.
const GRUBBS_CRITICAL_VALUES: [number, number][] = [
  [3, 1.153], [4, 1.463], [5, 1.672], [6, 1.822], [7, 1.938], [8, 2.032],
  [9, 2.110], [10, 2.176], [11, 2.234], [12, 2.285], [13, 2.331], [14, 2.371],
  [15, 2.409], [16, 2.443], [17, 2.475], [18, 2.504], [19, 2.532], [20, 2.557],
  [25, 2.663], [30, 2.745], [35, 2.811], [40, 2.866], [50, 2.956],
  [75, 3.079], [100, 3.163], [150, 3.273], [200, 3.338],
]

function grubbsCriticalValue(n: number): number {
  if (n < 3) return Infinity
  const table = GRUBBS_CRITICAL_VALUES
  if (n <= table[0][0]) return table[0][1]
  for (let i = 0; i < table.length - 1; i++) {
    const [n0, g0] = table[i]
    const [n1, g1] = table[i + 1]
    if (n <= n1) return g0 + ((n - n0) / (n1 - n0)) * (g1 - g0)
  }
  return table[table.length - 1][1]
}

/**
 * Iterative Grubbs test for outlier detection (ISO 5725-2:2019, §7.3.1).
 *
 * Repeatedly removes the most extreme value while its G statistic exceeds
 * the critical value at α=0.05, stopping when no outlier is found or when
 * floor(n/3) values have been removed to protect against masking.
 *
 * @param values - Input sample (order-independent).
 * @param alpha  - Reserved; only α=0.05 tables are currently loaded.
 * @returns GrubbsResult with outlier indices, values, final G, and critical value.
 */
export function detectOutliers(values: number[], alpha = 0.05): GrubbsResult {
  void alpha // α=0.05 table only; parameter reserved for future extension
  const pool = values.map((v, i) => ({ v, i }))
  const outlierIndices: number[] = []
  const outlierValues: number[] = []
  let lastG = 0
  let lastCv = 0
  const maxRemovals = Math.floor(values.length / 3)

  while (outlierIndices.length < maxRemovals && pool.length >= 3) {
    const mean = pool.reduce((s, p) => s + p.v, 0) / pool.length
    const variance = pool.reduce((s, p) => s + (p.v - mean) ** 2, 0) / (pool.length - 1)
    const s = Math.sqrt(variance)
    if (s === 0) break

    let extremeIdx = 0
    let extremeG = 0
    for (let i = 0; i < pool.length; i++) {
      const g = Math.abs(pool[i].v - mean) / s
      if (g > extremeG) { extremeG = g; extremeIdx = i }
    }

    const cv = grubbsCriticalValue(pool.length)
    lastG = extremeG
    lastCv = cv

    if (extremeG <= cv) break

    const removed = pool.splice(extremeIdx, 1)[0]
    outlierIndices.push(removed.i)
    outlierValues.push(removed.v)
  }

  return {
    outlierIndices,
    outlierValues,
    testStatistic: parseFloat(lastG.toFixed(4)),
    criticalValue: parseFloat(lastCv.toFixed(4)),
  }
}

/**
 * Shewhart X-bar control limits for SPC monitoring (ISO 7870-2:2013, §5).
 *
 * Computes action limits (±3σ) and Western Electric warning limits (±2σ)
 * from the full sample. Intended for individual measurement (ImR) charts
 * where subgroup size = 1.
 *
 * @param values - Ordered measurement sequence.
 * @returns ControlLimits with ucl, lcl, uwl, lwl, mean, sigma.
 */
export function calculateControlLimits(values: number[]): ControlLimits {
  const n = values.length
  if (n < 2) {
    const mean = values[0] ?? 0
    return { ucl: mean, lcl: mean, uwl: mean, lwl: mean, mean, sigma: 0 }
  }
  const mean = values.reduce((a, b) => a + b, 0) / n
  const sigma = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1))
  return {
    ucl: parseFloat((mean + 3 * sigma).toFixed(4)),
    lcl: parseFloat((mean - 3 * sigma).toFixed(4)),
    uwl: parseFloat((mean + 2 * sigma).toFixed(4)),
    lwl: parseFloat((mean - 2 * sigma).toFixed(4)),
    mean: parseFloat(mean.toFixed(4)),
    sigma: parseFloat(sigma.toFixed(4)),
  }
}

export function calculateStatistics(values: number[], lsl: number, usl: number): StatisticalSummary {
  const n = values.length
  if (n === 0) {
    return { mean: 0, stdDev: 0, min: 0, max: 0, median: 0, count: 0, cp: 0, cpk: 0, lsl, usl, outlierCount: 0 }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]

  const cp = stdDev > 0 ? (usl - lsl) / (6 * stdDev) : 0
  const cpupper = stdDev > 0 ? (usl - mean) / (3 * stdDev) : 0
  const cplower = stdDev > 0 ? (mean - lsl) / (3 * stdDev) : 0
  const cpk = Math.min(cpupper, cplower)

  const { outlierIndices } = detectOutliers(values)

  return {
    mean: parseFloat(mean.toFixed(4)),
    stdDev: parseFloat(stdDev.toFixed(4)),
    min: sorted[0],
    max: sorted[n - 1],
    median: parseFloat(median.toFixed(4)),
    count: n,
    cp: parseFloat(cp.toFixed(3)),
    cpk: parseFloat(cpk.toFixed(3)),
    lsl,
    usl,
    outlierCount: outlierIndices.length,
  }
}

export function generateHistogram(values: number[], binCount: number = 10): HistogramBin[] {
  if (values.length === 0) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binWidth = (max - min) / binCount || 1

  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    range: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
    count: 0,
    midpoint: parseFloat((min + (i + 0.5) * binWidth).toFixed(2)),
  }))

  values.forEach((v) => {
    const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1)
    bins[idx].count++
  })

  return bins
}

// Generate realistic mock PV test data
function randNormal(mean: number, std: number): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function generateMockData(): DataPoint[] {
  const manufacturers = ['SunPower', 'JinkoSolar', 'Trina Solar', 'LONGi', 'Canadian Solar']
  const batches = ['B-2025-001', 'B-2025-002', 'B-2025-003', 'B-2025-004', 'B-2025-005']
  const standards = ['IEC 61215', 'IEC 61730', 'IEC 61853']
  const data: DataPoint[] = []

  for (let i = 0; i < 200; i++) {
    const mfr = manufacturers[i % manufacturers.length]
    const batch = batches[Math.floor(i / 40)]
    const pmax = randNormal(400, 8)
    const voc = randNormal(49.5, 0.5)
    const isc = randNormal(10.5, 0.15)
    const ff = randNormal(0.78, 0.015)
    const efficiency = randNormal(21.5, 0.4)

    data.push({
      sampleId: `SPL-${String(i + 1).padStart(4, '0')}`,
      batchId: batch,
      module: `MOD-${mfr.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      manufacturer: mfr,
      testDate: new Date(2025, Math.floor(i / 20), (i % 28) + 1).toISOString().split('T')[0],
      pmax: parseFloat(pmax.toFixed(2)),
      voc: parseFloat(voc.toFixed(3)),
      isc: parseFloat(isc.toFixed(3)),
      ff: parseFloat(ff.toFixed(4)),
      efficiency: parseFloat(efficiency.toFixed(2)),
      irradiance: 1000,
      temperature: 25,
      testStandard: standards[i % 3],
      result: pmax > 380 && ff > 0.74 ? 'pass' : 'fail',
    })
  }
  return data
}

// IEC tolerance limits for pass/fail
export const IEC_TOLERANCES: Record<string, { lsl: number; usl: number; unit: string }> = {
  pmax: { lsl: 380, usl: 425, unit: 'W' },
  voc: { lsl: 48.0, usl: 51.0, unit: 'V' },
  isc: { lsl: 10.0, usl: 11.0, unit: 'A' },
  ff: { lsl: 0.74, usl: 0.83, unit: '' },
  efficiency: { lsl: 20.0, usl: 23.0, unit: '%' },
}

export const PARAMETER_LABELS: Record<string, string> = {
  pmax: 'Maximum Power (Pmax)',
  voc: 'Open Circuit Voltage (Voc)',
  isc: 'Short Circuit Current (Isc)',
  ff: 'Fill Factor (FF)',
  efficiency: 'Efficiency (η)',
}
