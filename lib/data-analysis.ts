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
}

export interface HistogramBin {
  range: string
  count: number
  midpoint: number
}

export function calculateStatistics(values: number[], lsl: number, usl: number): StatisticalSummary {
  const n = values.length
  if (n === 0) return { mean: 0, stdDev: 0, min: 0, max: 0, median: 0, count: 0, cp: 0, cpk: 0, lsl, usl }

  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]

  const cp = stdDev > 0 ? (usl - lsl) / (6 * stdDev) : 0
  const cpupper = stdDev > 0 ? (usl - mean) / (3 * stdDev) : 0
  const cplower = stdDev > 0 ? (mean - lsl) / (3 * stdDev) : 0
  const cpk = Math.min(cpupper, cplower)

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
