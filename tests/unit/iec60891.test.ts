import { describe, it, expect } from 'vitest'
import type { IVDataPoint } from '../../lib/iec60904'
import {
  translateProcedure1,
  translateProcedure2,
  translateProcedure3,
  determineRsFromSlope,
  determineRsFromTwoCurves,
} from '../../lib/iec60891'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function linearIV(isc: number, voc: number, n: number): IVDataPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    voltage: (voc * i) / (n - 1),
    current: isc * (1 - i / (n - 1)),
  }))
}

// ─── Procedure 1 ─────────────────────────────────────────────────────────────

describe('translateProcedure1', () => {
  const ivData = linearIV(10, 40, 21)
  const baseInput = { ivData, measuredIrradiance: 1000, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 }

  it('identity: same T and G, absolute coefficients → output equals input', () => {
    const result = translateProcedure1(baseInput, { alpha: 0, beta: 0, kappa: 0, alphaIsRelative: false, betaIsRelative: false })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivData[i].current, 5)
      expect(pt.voltage).toBeCloseTo(ivData[i].voltage, 5)
    })
  })
  it('procedure label is correct', () => {
    const result = translateProcedure1(baseInput, { alpha: 0, beta: 0, kappa: 0, alphaIsRelative: false, betaIsRelative: false })
    expect(result.procedure).toBe('Procedure 1 (Temperature Coefficients)')
  })
  it('deltaT is T2 - T1', () => {
    const r = translateProcedure1({ ...baseInput, targetTemperature: 35 }, { alpha: 0, beta: 0, kappa: 0, alphaIsRelative: false, betaIsRelative: false })
    expect(r.deltaT).toBe(10)
  })
  it('deltaG is G2 - G1', () => {
    const r = translateProcedure1({ ...baseInput, targetIrradiance: 800 }, { alpha: 0, beta: 0, kappa: 0, alphaIsRelative: false, betaIsRelative: false })
    expect(r.deltaG).toBe(-200)
  })
  it('halving irradiance (G1→G2) scales Isc by ~0.5 when alpha=0', () => {
    const input = { ...baseInput, targetIrradiance: 500 }
    const result = translateProcedure1(input, { alpha: 0, beta: 0, kappa: 0, alphaIsRelative: false, betaIsRelative: false })
    expect(result.translatedData[0].current).toBeCloseTo(ivData[0].current * 0.5, 3)
  })
  it('non-zero absolute alpha shifts all currents by alpha*dT', () => {
    const alpha = 0.05 // A/°C
    const dT = 10
    const input = { ...baseInput, targetTemperature: 35 }
    const result = translateProcedure1(input, { alpha, beta: 0, kappa: 0, alphaIsRelative: false, betaIsRelative: false })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivData[i].current + alpha * dT, 3)
    })
  })
  it('relative alpha/beta: correctionApplied string contains %', () => {
    const result = translateProcedure1(baseInput, { alpha: 0.05, beta: -0.3, kappa: 0, alphaIsRelative: true, betaIsRelative: true })
    expect(result.correctionApplied).toContain('%')
  })
  it('translated currents and voltages are non-negative', () => {
    const input = { ...baseInput, targetTemperature: -40 }
    const result = translateProcedure1(input, { alpha: -1, beta: 2, kappa: 5, alphaIsRelative: false, betaIsRelative: false })
    result.translatedData.forEach(pt => {
      expect(pt.current).toBeGreaterThanOrEqual(0)
      expect(pt.voltage).toBeGreaterThanOrEqual(0)
    })
  })
  it('output length matches input length', () => {
    const result = translateProcedure1(baseInput, { alpha: 0, beta: 0, kappa: 0, alphaIsRelative: false, betaIsRelative: false })
    expect(result.translatedData).toHaveLength(ivData.length)
  })
})

// ─── Procedure 2 ─────────────────────────────────────────────────────────────

describe('translateProcedure2', () => {
  const ivData = linearIV(10, 40, 11)
  const baseInput = { ivData, measuredIrradiance: 800, measuredTemperature: 35, targetIrradiance: 1000, targetTemperature: 25 }

  it('identity: refIsc1 = refIsc2, dT = 0 → output equals input', () => {
    const result = translateProcedure2({ ...baseInput, targetTemperature: 35 }, { refIsc1: 8, refIsc2: 8, beta: 0, rs: 0 })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivData[i].current, 5)
      expect(pt.voltage).toBeCloseTo(ivData[i].voltage, 5)
    })
  })
  it('procedure label is correct', () => {
    const result = translateProcedure2(baseInput, { refIsc1: 8, refIsc2: 10, beta: 0, rs: 0 })
    expect(result.procedure).toBe('Procedure 2 (Reference Device)')
  })
  it('Isc scales by refIsc ratio', () => {
    const result = translateProcedure2(baseInput, { refIsc1: 8, refIsc2: 10, beta: 0, rs: 0 })
    expect(result.translatedData[0].current).toBeCloseTo(ivData[0].current * (10 / 8), 4)
  })
  it('correctionApplied string includes Isc ratio', () => {
    const result = translateProcedure2(baseInput, { refIsc1: 8, refIsc2: 10, beta: 0, rs: 0 })
    expect(result.correctionApplied).toContain('Isc ratio')
  })
  it('translated values are non-negative', () => {
    const result = translateProcedure2(baseInput, { refIsc1: 10, refIsc2: 5, beta: -2, rs: 5 })
    result.translatedData.forEach(pt => {
      expect(pt.current).toBeGreaterThanOrEqual(0)
      expect(pt.voltage).toBeGreaterThanOrEqual(0)
    })
  })
  it('output length equals input length', () => {
    const result = translateProcedure2(baseInput, { refIsc1: 8, refIsc2: 10, beta: 0, rs: 0 })
    expect(result.translatedData).toHaveLength(ivData.length)
  })
})

// ─── Procedure 3 ─────────────────────────────────────────────────────────────

describe('translateProcedure3', () => {
  const ivLow = linearIV(8, 36, 11)
  const ivHigh = linearIV(10, 40, 11)
  const baseInput = { ivDataLow: ivLow, ivDataHigh: ivHigh, gLow: 800, gHigh: 1000, tLow: 25, tHigh: 25, targetIrradiance: 800, targetTemperature: 25 }

  it('f=0 (target = gLow) → output equals ivDataLow', () => {
    const result = translateProcedure3(baseInput)
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivLow[i].current, 5)
      expect(pt.voltage).toBeCloseTo(ivLow[i].voltage, 5)
    })
  })
  it('f=1 (target = gHigh) → output equals ivDataHigh', () => {
    const result = translateProcedure3({ ...baseInput, targetIrradiance: 1000 })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivHigh[i].current, 5)
      expect(pt.voltage).toBeCloseTo(ivHigh[i].voltage, 5)
    })
  })
  it('f=0.5 → output is arithmetic mean of low and high', () => {
    const result = translateProcedure3({ ...baseInput, targetIrradiance: 900 })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo((ivLow[i].current + ivHigh[i].current) / 2, 5)
      expect(pt.voltage).toBeCloseTo((ivLow[i].voltage + ivHigh[i].voltage) / 2, 5)
    })
  })
  it('output length is min(low.length, high.length)', () => {
    const shortHigh = linearIV(10, 40, 7)
    const result = translateProcedure3({ ...baseInput, ivDataHigh: shortHigh })
    expect(result.translatedData).toHaveLength(7)
  })
  it('procedure label is correct', () => {
    expect(translateProcedure3(baseInput).procedure).toBe('Procedure 3 (Interpolation)')
  })
  it('deltaG is targetIrradiance - gLow', () => {
    const result = translateProcedure3({ ...baseInput, targetIrradiance: 900 })
    expect(result.deltaG).toBe(100)
  })
  it('correctionApplied string contains interpolation factor', () => {
    expect(translateProcedure3(baseInput).correctionApplied).toContain('Interpolation factor')
  })
  it('gLow === gHigh → f=0, returns low curve unchanged', () => {
    const result = translateProcedure3({ ...baseInput, gHigh: 800, targetIrradiance: 800 })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivLow[i].current, 5)
    })
  })
})

// ─── determineRsFromSlope ─────────────────────────────────────────────────────

describe('determineRsFromSlope', () => {
  it('returns non-negative Rs', () => {
    const iv = linearIV(10, 40, 51)
    expect(determineRsFromSlope(iv).rs).toBeGreaterThanOrEqual(0)
  })
  it('returns method label "Slope near Voc"', () => {
    expect(determineRsFromSlope(linearIV(10, 40, 51)).method).toBe('Slope near Voc')
  })
  it('single-point data returns rs=0 with insufficient data message', () => {
    const result = determineRsFromSlope([{ voltage: 40, current: 0 }])
    expect(result.rs).toBe(0)
    expect(result.details).toMatch(/[Ii]nsufficient/)
  })
  it('linear IV with known slope computes expected Rs', () => {
    // Build a minimal curve with two near-Voc points where the slope is known.
    // voc = 40, nearVoc filter: voltage > 40*0.85 = 34 AND current > 0
    // Two points: (35, 2) and (39, 0.5) → rs = -(39-35)/(0.5-2) = 4/1.5 ≈ 2.667
    const iv: IVDataPoint[] = [
      { voltage: 0, current: 10 },
      { voltage: 35, current: 2 },
      { voltage: 39, current: 0.5 },
      { voltage: 40, current: 0 },
    ]
    expect(determineRsFromSlope(iv).rs).toBeCloseTo(4 / 1.5, 3)
  })
})

// ─── determineRsFromTwoCurves ─────────────────────────────────────────────────

describe('determineRsFromTwoCurves', () => {
  it('returns non-negative Rs', () => {
    const iv1 = linearIV(8, 36, 21)
    const iv2 = linearIV(10, 40, 21)
    expect(determineRsFromTwoCurves(iv1, iv2, 800, 1000).rs).toBeGreaterThanOrEqual(0)
  })
  it('returns method label "Two I-V Curves"', () => {
    const iv1 = linearIV(8, 36, 21)
    const iv2 = linearIV(10, 40, 21)
    expect(determineRsFromTwoCurves(iv1, iv2, 800, 1000).method).toBe('Two I-V Curves')
  })
  it('identical curves produce Rs = 0 (no Vmpp shift)', () => {
    const iv = linearIV(10, 40, 21)
    const result = determineRsFromTwoCurves(iv, iv, 1000, 1000)
    expect(result.rs).toBe(0)
  })
  it('details string references both irradiance levels', () => {
    const iv1 = linearIV(8, 36, 21)
    const iv2 = linearIV(10, 40, 21)
    const result = determineRsFromTwoCurves(iv1, iv2, 800, 1000)
    expect(result.details).toContain('800')
    expect(result.details).toContain('1000')
  })
})
