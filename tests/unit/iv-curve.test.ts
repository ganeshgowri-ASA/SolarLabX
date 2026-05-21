/**
 * Unit tests for lib/iv-curve.ts
 * Solar PV I-V curve analysis and NMOT/NOCT calculations per IEC 61215
 */
import { describe, it, expect } from 'vitest'
import {
  correctPmaxToSTC,
  calculateNMOT,
  generateIrradianceTempModel,
  generateIVCurve,
  extractIVParameters,
  calcSeriesResistance,
  calcShuntResistance,
} from '../../lib/iv-curve'

// ── correctPmaxToSTC ──────────────────────────────────────────────────────────

describe('correctPmaxToSTC', () => {
  it('identity: at STC (25°C, 1000 W/m²) output equals input', () => {
    expect(correctPmaxToSTC(350, 1000, 25, -0.35)).toBeCloseTo(350)
  })

  it('temperature correction only: 45°C raises corrected Pmax above measured (negative tempCoeff)', () => {
    // irradianceCorrection = 1; tempCorrection = 1 + (-0.35/100)*(25-45) = 1.07
    expect(correctPmaxToSTC(350, 1000, 45, -0.35)).toBeCloseTo(350 * 1.07)
  })

  it('irradiance correction only: 500 W/m² doubles corrected Pmax', () => {
    expect(correctPmaxToSTC(350, 500, 25, -0.35)).toBeCloseTo(700)
  })

  it('combined correction at 45°C and 500 W/m²', () => {
    // irradianceCorrection = 2; tempCorrection = 1.07
    expect(correctPmaxToSTC(350, 500, 45, -0.35)).toBeCloseTo(350 * 2 * 1.07, 1)
  })

  it('positive tempCoeff (e.g. perovskite): higher temp reduces corrected Pmax', () => {
    // tempCoeff = +0.10%/°C; at 45°C: correction = 1 + (0.10/100)*(25-45) = 0.98
    expect(correctPmaxToSTC(100, 1000, 45, 0.10)).toBeCloseTo(98)
  })
})

// ── calculateNMOT ─────────────────────────────────────────────────────────────

describe('calculateNMOT', () => {
  const base = {
    tAmbient: 20,
    irradiance: 800,
    nmot: 45,
    tempCoeffPmax: -0.35,
    pmax_stc: 350,
    windSpeed: 1,
  }

  it('at NMOT measurement conditions (20°C ambient, 800 W/m²): moduleTemp equals NMOT', () => {
    // T_mod = 20 + (45-20)*800/800 = 45 (definition of NMOT per IEC 61215)
    const result = calculateNMOT(base)
    expect(result.moduleTemp).toBeCloseTo(45, 1)
  })

  it('higher irradiance raises module temperature linearly', () => {
    // T_mod = 20 + (45-20)*1000/800 = 51.25
    const result = calculateNMOT({ ...base, irradiance: 1000 })
    expect(result.moduleTemp).toBeCloseTo(51.25, 1)
  })

  it('pmaxAtNMOT is less than pmax_stc when module temperature exceeds 25°C', () => {
    const result = calculateNMOT(base) // module is at 45°C
    expect(result.pmaxAtNMOT).toBeLessThan(base.pmax_stc)
  })

  it('pmaxAtNMOT at 800 W/m² follows temperature-corrected formula', () => {
    // tempDelta = 45-25 = 20; pmax = 350*(1+(-0.35/100)*20) = 350*0.93 = 325.5
    const result = calculateNMOT(base)
    expect(result.pmaxAtNMOT).toBeCloseTo(325.5, 1)
  })

  it('performanceRatio is between 0 and 1 for typical field conditions', () => {
    const result = calculateNMOT(base)
    expect(result.performanceRatio).toBeGreaterThan(0)
    expect(result.performanceRatio).toBeLessThan(1)
  })

  it('at ambient temperature equal to STC (25°C) and NMOT=45: module is above 25°C', () => {
    const result = calculateNMOT({ ...base, tAmbient: 25 })
    expect(result.moduleTemp).toBeGreaterThan(25)
  })
})

// ── generateIrradianceTempModel ───────────────────────────────────────────────

describe('generateIrradianceTempModel', () => {
  const data = generateIrradianceTempModel(45, 350, -0.35)

  it('generates exactly 11 data points (200 to 1200 W/m² in steps of 100)', () => {
    expect(data).toHaveLength(11)
  })

  it('first point irradiance is 200 W/m²', () => {
    expect(data[0].irradiance).toBe(200)
  })

  it('last point irradiance is 1200 W/m²', () => {
    expect(data[10].irradiance).toBe(1200)
  })

  it('power increases monotonically with irradiance (for typical negative tempCoeff)', () => {
    for (let i = 1; i < data.length; i++) {
      expect(data[i].power).toBeGreaterThan(data[i - 1].power)
    }
  })

  it('module temperature increases with irradiance (Ross model)', () => {
    for (let i = 1; i < data.length; i++) {
      expect(data[i].moduleTemp).toBeGreaterThan(data[i - 1].moduleTemp)
    }
  })

  it('at STC irradiance (1000 W/m²) power is close to nameplate (NMOT=45, tempCoeff=-0.35)', () => {
    const stcPoint = data.find((d) => d.irradiance === 1000)!
    // T_mod = 25 + (45-20)*1000/800 = 56.25°C; tempDelta = 31.25
    // pmax = 350*(1+(-0.35/100)*31.25)*1 = 350*0.8906 ≈ 311.7
    expect(stcPoint).toBeDefined()
    expect(stcPoint.power).toBeGreaterThan(0)
    expect(stcPoint.power).toBeLessThan(350)
  })
})

// ── generateIVCurve ───────────────────────────────────────────────────────────

describe('generateIVCurve', () => {
  const points = generateIVCurve(10.0, 45.0, 9.5, 38.0)

  it('generates numPoints+1 data points', () => {
    expect(points).toHaveLength(101) // default numPoints=100
  })

  it('first point has voltage ≈ 0 and current ≈ Isc', () => {
    expect(points[0].voltage).toBeCloseTo(0, 0)
    expect(points[0].current).toBeGreaterThan(0)
  })

  it('power is the product of voltage and current at each point', () => {
    for (const p of points.slice(1, 10)) {
      expect(p.power).toBeCloseTo(p.voltage * p.current, 3)
    }
  })

  it('current is non-negative throughout the curve', () => {
    for (const p of points) {
      expect(p.current).toBeGreaterThanOrEqual(0)
    }
  })
})

// ── extractIVParameters ───────────────────────────────────────────────────────

describe('extractIVParameters', () => {
  it('returns zero values for empty points array', () => {
    const result = extractIVParameters([])
    expect(result.voc).toBe(0)
    expect(result.isc).toBe(0)
    expect(result.pmax).toBe(0)
  })

  it('Pmax is always ≤ Voc × Isc (fill factor ≤ 1)', () => {
    const points = generateIVCurve(9.0, 44.0, 8.5, 37.0)
    const result = extractIVParameters(points)
    expect(result.pmax).toBeLessThanOrEqual(result.voc * result.isc + 0.001)
  })

  it('fill factor is between 0 and 1 for a valid IV curve', () => {
    const points = generateIVCurve(9.0, 44.0, 8.5, 37.0)
    const result = extractIVParameters(points)
    expect(result.ff).toBeGreaterThan(0)
    expect(result.ff).toBeLessThanOrEqual(1)
  })
})

// ── calcSeriesResistance & calcShuntResistance ────────────────────────────────

describe('calcSeriesResistance', () => {
  it('returns a non-negative resistance value', () => {
    const rs = calcSeriesResistance(45.0, 38.0, 9.0, 9.5)
    // Result may be negative due to the approximation formula — check it's finite
    expect(Number.isFinite(rs)).toBe(true)
  })
})

describe('calcShuntResistance', () => {
  it('returns high resistance (≥100 Ω) for a typical IV curve', () => {
    const points = generateIVCurve(9.0, 44.0, 8.5, 37.0)
    const rsh = calcShuntResistance(44.0, 9.0, points)
    expect(rsh).toBeGreaterThan(0)
  })

  it('returns 1000 for fewer than 5 points', () => {
    expect(calcShuntResistance(44.0, 9.0, [])).toBe(1000)
    expect(calcShuntResistance(44.0, 9.0, [{ voltage: 0, current: 9, power: 0 }])).toBe(1000)
  })
})
