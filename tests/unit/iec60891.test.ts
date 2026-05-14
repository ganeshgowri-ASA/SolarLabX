import { describe, it, expect } from 'vitest'
import {
  translateProcedure1,
  translateProcedure2,
  translateProcedure3,
  determineRsFromSlope,
  determineRsFromTwoCurves,
} from '@/lib/iec60891'
import type { IVDataPoint } from '@/lib/iec60904'

/** Build a linear I-V curve: V from 0..Voc, I from Isc..0 */
function linIV(n: number, isc: number, voc: number): IVDataPoint[] {
  return Array.from({ length: n }, (_, i) => ({
    voltage: (voc * i) / (n - 1),
    current: isc * (1 - i / (n - 1)),
  }))
}

const BASE_IV = linIV(21, 9.0, 40.0)
const STD_PARAMS = {
  alpha: 0.05,
  beta: -0.31,
  kappa: 0.4,
  alphaIsRelative: true,
  betaIsRelative: true,
}

// ── Procedure 1: Temperature Coefficient Method ──────────────────────────────
describe('translateProcedure1', () => {
  it('identity: G1=G2 and T1=T2 → translated equals original', () => {
    const result = translateProcedure1(
      { ivData: BASE_IV, measuredIrradiance: 1000, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 },
      STD_PARAMS
    )
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(BASE_IV[i].current, 6)
      expect(pt.voltage).toBeCloseTo(BASE_IV[i].voltage, 6)
    })
  })

  it('deltaT and deltaG are computed from measurement and target conditions', () => {
    const result = translateProcedure1(
      { ivData: BASE_IV, measuredIrradiance: 800, measuredTemperature: 45, targetIrradiance: 1000, targetTemperature: 25 },
      STD_PARAMS
    )
    expect(result.deltaT).toBeCloseTo(-20)
    expect(result.deltaG).toBeCloseTo(200)
  })

  it('pure irradiance step: Isc at V=0 scales with G2/G1 when dT=0 and kappa=0', () => {
    const result = translateProcedure1(
      { ivData: BASE_IV, measuredIrradiance: 800, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 },
      { ...STD_PARAMS, kappa: 0 }
    )
    const expectedIsc2 = BASE_IV[0].current * (1000 / 800)
    expect(result.translatedData[0].current).toBeCloseTo(expectedIsc2, 4)
  })

  it('all translated points have non-negative current and voltage (clamp holds)', () => {
    const result = translateProcedure1(
      { ivData: BASE_IV, measuredIrradiance: 500, measuredTemperature: 60, targetIrradiance: 1000, targetTemperature: 25 },
      STD_PARAMS
    )
    for (const pt of result.translatedData) {
      expect(pt.current).toBeGreaterThanOrEqual(0)
      expect(pt.voltage).toBeGreaterThanOrEqual(0)
    }
  })

  it('procedure label identifies the method', () => {
    const result = translateProcedure1(
      { ivData: BASE_IV, measuredIrradiance: 1000, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 },
      STD_PARAMS
    )
    expect(result.procedure).toContain('Procedure 1')
  })

  it('correctionApplied string contains the supplied alpha and beta values', () => {
    const result = translateProcedure1(
      { ivData: BASE_IV, measuredIrradiance: 1000, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 },
      { alpha: 0.06, beta: -0.35, kappa: 0.5, alphaIsRelative: true, betaIsRelative: true }
    )
    expect(result.correctionApplied).toContain('0.06')
    expect(result.correctionApplied).toContain('-0.35')
  })
})

// ── Procedure 2: Reference Device Method ────────────────────────────────────
describe('translateProcedure2', () => {
  it('identity: same reference Isc, dT=0, beta=0 → translated equals original', () => {
    const result = translateProcedure2(
      { ivData: BASE_IV, measuredIrradiance: 1000, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 },
      { refIsc1: 9.0, refIsc2: 9.0, beta: 0, rs: 0 }
    )
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(BASE_IV[i].current, 6)
      expect(pt.voltage).toBeCloseTo(BASE_IV[i].voltage, 6)
    })
  })

  it('current scales by refIsc2/refIsc1 ratio when dT=0 and beta=0', () => {
    const ratio = 10.0 / 8.0
    const result = translateProcedure2(
      { ivData: BASE_IV, measuredIrradiance: 800, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 },
      { refIsc1: 8.0, refIsc2: 10.0, beta: 0, rs: 0 }
    )
    expect(result.translatedData[0].current).toBeCloseTo(BASE_IV[0].current * ratio, 4)
  })

  it('procedure label identifies the method', () => {
    const result = translateProcedure2(
      { ivData: BASE_IV, measuredIrradiance: 1000, measuredTemperature: 25, targetIrradiance: 1000, targetTemperature: 25 },
      { refIsc1: 9.0, refIsc2: 9.0, beta: 0, rs: 0 }
    )
    expect(result.procedure).toContain('Procedure 2')
  })

  it('all translated points remain non-negative', () => {
    const result = translateProcedure2(
      { ivData: BASE_IV, measuredIrradiance: 500, measuredTemperature: 50, targetIrradiance: 1000, targetTemperature: 25 },
      { refIsc1: 5.0, refIsc2: 9.5, beta: -0.3, rs: 0.3 }
    )
    for (const pt of result.translatedData) {
      expect(pt.current).toBeGreaterThanOrEqual(0)
      expect(pt.voltage).toBeGreaterThanOrEqual(0)
    }
  })
})

// ── Procedure 3: Interpolation ───────────────────────────────────────────────
describe('translateProcedure3', () => {
  const ivLow  = linIV(11, 8.0, 38.0)   // measured at 800 W/m²
  const ivHigh = linIV(11, 10.0, 42.0)  // measured at 1000 W/m²

  it('f=0 (target == gLow): result equals ivDataLow', () => {
    const result = translateProcedure3({
      ivDataLow: ivLow, ivDataHigh: ivHigh,
      gLow: 800, gHigh: 1000, tLow: 25, tHigh: 25,
      targetIrradiance: 800, targetTemperature: 25,
    })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivLow[i].current, 6)
      expect(pt.voltage).toBeCloseTo(ivLow[i].voltage, 6)
    })
  })

  it('f=1 (target == gHigh): result equals ivDataHigh', () => {
    const result = translateProcedure3({
      ivDataLow: ivLow, ivDataHigh: ivHigh,
      gLow: 800, gHigh: 1000, tLow: 25, tHigh: 25,
      targetIrradiance: 1000, targetTemperature: 25,
    })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo(ivHigh[i].current, 6)
      expect(pt.voltage).toBeCloseTo(ivHigh[i].voltage, 6)
    })
  })

  it('f=0.5 (midpoint): result is arithmetic mean of the two curves', () => {
    const result = translateProcedure3({
      ivDataLow: ivLow, ivDataHigh: ivHigh,
      gLow: 800, gHigh: 1000, tLow: 25, tHigh: 25,
      targetIrradiance: 900, targetTemperature: 25,
    })
    result.translatedData.forEach((pt, i) => {
      expect(pt.current).toBeCloseTo((ivLow[i].current + ivHigh[i].current) / 2, 6)
      expect(pt.voltage).toBeCloseTo((ivLow[i].voltage + ivHigh[i].voltage) / 2, 6)
    })
  })

  it('result length equals min(ivDataLow, ivDataHigh) length', () => {
    const result = translateProcedure3({
      ivDataLow: ivLow, ivDataHigh: linIV(7, 10.0, 42.0),
      gLow: 800, gHigh: 1000, tLow: 25, tHigh: 25,
      targetIrradiance: 900, targetTemperature: 25,
    })
    expect(result.translatedData).toHaveLength(7)
  })

  it('deltaG reflects the gap between target and gLow', () => {
    const result = translateProcedure3({
      ivDataLow: ivLow, ivDataHigh: ivHigh,
      gLow: 800, gHigh: 1000, tLow: 25, tHigh: 25,
      targetIrradiance: 900, targetTemperature: 25,
    })
    expect(result.deltaG).toBeCloseTo(100)
  })

  it('procedure label identifies the method', () => {
    const result = translateProcedure3({
      ivDataLow: ivLow, ivDataHigh: ivHigh,
      gLow: 800, gHigh: 1000, tLow: 25, tHigh: 25,
      targetIrradiance: 900, targetTemperature: 25,
    })
    expect(result.procedure).toContain('Procedure 3')
  })
})

// ── Rs determination ──────────────────────────────────────────────────────────
describe('determineRsFromSlope', () => {
  it('returns rs >= 0 for a valid linear IV curve', () => {
    const result = determineRsFromSlope(BASE_IV)
    expect(result.rs).toBeGreaterThanOrEqual(0)
  })

  it('returns rs=0 and details string for an empty curve', () => {
    const result = determineRsFromSlope([])
    expect(result.rs).toBe(0)
    expect(result.details).toBeTruthy()
  })

  it('returns rs=0 with only one point near Voc', () => {
    const singleNearVoc: IVDataPoint[] = [{ voltage: 39, current: 0.001 }]
    const result = determineRsFromSlope(singleNearVoc)
    expect(result.rs).toBe(0)
  })

  it('method field describes the slope technique', () => {
    const result = determineRsFromSlope(BASE_IV)
    expect(result.method).toMatch(/slope/i)
  })
})

describe('determineRsFromTwoCurves', () => {
  const iv1 = linIV(11, 8.0, 38.0)
  const iv2 = linIV(11, 10.0, 41.0)

  it('returns rs >= 0 for two distinct curves', () => {
    const result = determineRsFromTwoCurves(iv1, iv2, 800, 1000)
    expect(result.rs).toBeGreaterThanOrEqual(0)
  })

  it('rs >= 0 even for identical curves', () => {
    const result = determineRsFromTwoCurves(BASE_IV, BASE_IV, 1000, 1000)
    expect(result.rs).toBeGreaterThanOrEqual(0)
  })

  it('details string references both irradiance levels', () => {
    const result = determineRsFromTwoCurves(iv1, iv2, 800, 1000)
    expect(result.details).toContain('800')
    expect(result.details).toContain('1000')
  })
})
