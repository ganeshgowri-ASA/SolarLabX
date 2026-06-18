import { describe, it, expect } from 'vitest'
import {
  calculateEnNumber,
  evaluateComparison,
  calculateECT,
  analyzeLinearity,
  analyzeELResults,
} from '@/lib/iec60904'
import type { ELDefect, LinearityPoint } from '@/lib/iec60904'

describe('calculateEnNumber', () => {
  it('returns 0 when lab = reference', () => {
    expect(calculateEnNumber(1.0, 0.01, 1.0, 0.005)).toBe(0)
  })

  it('matches |diff| / √(u1² + u2²)', () => {
    const en = calculateEnNumber(1.01, 0.005, 1.00, 0.003)
    const expected = 0.01 / Math.sqrt(0.005 ** 2 + 0.003 ** 2)
    expect(en).toBeCloseTo(expected, 6)
  })

  it('returns Infinity when both uncertainties are 0', () => {
    expect(calculateEnNumber(1.01, 0, 1.00, 0)).toBe(Infinity)
  })

  it('En ≤ 1 for a nearly-identical lab (compatible)', () => {
    // diff = 0.001, combined unc = √(0.01²+0.01²) ≈ 0.014 → En ≈ 0.07
    const en = calculateEnNumber(1.001, 0.01, 1.000, 0.01)
    expect(en).toBeLessThanOrEqual(1.0)
  })
})

describe('evaluateComparison', () => {
  const labs = [
    { name: 'Lab A', id: 'LA', value: 9.99, uncertainty: 0.05 },
    { name: 'Lab B', id: 'LB', value: 10.5, uncertainty: 0.05 },
  ]
  const refValue = 10.0
  const refU = 0.03

  it('returns one result per lab', () => {
    expect(evaluateComparison(labs, refValue, refU)).toHaveLength(2)
  })

  it('marks Lab A as pass (En ≈ 0.17 ≤ 1)', () => {
    // |9.99-10.0|/√(0.05²+0.03²) = 0.01/0.0583 ≈ 0.17
    const results = evaluateComparison(
      [{ name: 'A', id: 'A', value: 9.99, uncertainty: 0.05 }],
      10.0,
      0.03
    )
    expect(results[0].pass).toBe(true)
    expect(results[0].enNumber).toBeLessThanOrEqual(1.0)
  })

  it('marks Lab B as fail (En >> 1)', () => {
    // |10.5-10.0|/√(0.05²+0.03²) = 0.5/0.0583 ≈ 8.57
    const results = evaluateComparison(
      [{ name: 'B', id: 'B', value: 10.5, uncertainty: 0.05 }],
      10.0,
      0.03
    )
    expect(results[0].pass).toBe(false)
    expect(results[0].enNumber).toBeGreaterThan(1)
  })

  it('preserves labName and referenceValue in output', () => {
    const results = evaluateComparison(labs, refValue, refU)
    expect(results[0].labName).toBe('Lab A')
    expect(results[0].referenceValue).toBe(refValue)
  })
})

describe('calculateECT', () => {
  it('returns all expected fields', () => {
    const r = calculateECT(48.5, 49.0, -0.1, 1000)
    expect(r).toHaveProperty('ect')
    expect(r).toHaveProperty('vocMeasured')
    expect(r).toHaveProperty('vocSTC')
    expect(r).toHaveProperty('betaVoc')
    expect(r).toHaveProperty('irradiance')
  })

  it('ECT = 25 °C when vocMeasured = vocSTC at 1 000 W/m²', () => {
    // vocIrrCorrection = nCells*nIdeal*(kB*T/q)*ln(1000/1000) = 0
    // → vocCorrected = vocSTC → ect = 25
    const r = calculateECT(49.0, 49.0, -0.1, 1000)
    expect(r.ect).toBeCloseTo(25, 1)
  })

  it('irradiance ≠ 1 000 W/m² shifts ECT from 25 °C', () => {
    const r1 = calculateECT(49.0, 49.0, -0.1, 1000)
    const r2 = calculateECT(49.0, 49.0, -0.1, 800)
    expect(r1.ect).not.toBeCloseTo(r2.ect, 0)
  })

  it('returns stcTemp when betaVoc = 0', () => {
    const r = calculateECT(49.0, 49.0, 0, 1000, 60, 25)
    expect(r.ect).toBe(25)
  })
})

describe('analyzeLinearity', () => {
  it('returns early for < 2 data points', () => {
    const r = analyzeLinearity([{ irradiance: 1000, isc: 9.5 }])
    expect(r.isLinear).toBe(false)
    expect(r.rSquared).toBe(0)
    expect(r.normalizedData).toHaveLength(0)
  })

  it('perfect proportional data → R²=1, maxDev≈0, isLinear=true', () => {
    const data: LinearityPoint[] = [200, 400, 600, 800, 1000].map((g) => ({
      irradiance: g,
      isc: g * 0.0095,
    }))
    const r = analyzeLinearity(data)
    expect(r.rSquared).toBeCloseTo(1.0, 4)
    expect(r.maxDeviation).toBeLessThan(0.01)
    expect(r.isLinear).toBe(true)
  })

  it('10 % bump at 400 W/m² → maxDev > 2 %, isLinear = false', () => {
    const data: LinearityPoint[] = [
      { irradiance: 200, isc: 1.9 },
      { irradiance: 400, isc: 4.0 }, // ~5% above linear
      { irradiance: 600, isc: 5.7 },
      { irradiance: 800, isc: 7.6 },
      { irradiance: 1000, isc: 9.5 },
    ]
    const r = analyzeLinearity(data)
    expect(r.maxDeviation).toBeGreaterThan(2)
    expect(r.isLinear).toBe(false)
  })

  it('slope = 0.0095 for Isc = 0.0095 × G data', () => {
    const data: LinearityPoint[] = [
      { irradiance: 500, isc: 4.75 },
      { irradiance: 1000, isc: 9.50 },
    ]
    const r = analyzeLinearity(data)
    expect(r.slope).toBeCloseTo(0.0095, 4)
  })

  it('normalizedData length equals input length', () => {
    const data: LinearityPoint[] = [200, 400, 600, 800, 1000].map((g) => ({
      irradiance: g,
      isc: g * 0.0095,
    }))
    expect(analyzeLinearity(data).normalizedData).toHaveLength(data.length)
  })
})

describe('analyzeELResults', () => {
  it('no defects → pass grade, zero counts', () => {
    const r = analyzeELResults([], 60)
    expect(r.overallGrade).toBe('pass')
    expect(r.totalDefects).toBe(0)
    expect(r.affectedCellPercentage).toBe(0)
  })

  it('one critical defect → fail grade', () => {
    const defects: ELDefect[] = [{
      id: 'd1', type: 'crack', severity: 'critical',
      location: { x: 0, y: 0, width: 10, height: 10 },
      description: 'Critical crack', cellIndex: 1,
    }]
    expect(analyzeELResults(defects, 60).overallGrade).toBe('fail')
  })

  it('3 major defects → marginal grade', () => {
    const defects: ELDefect[] = [1, 2, 3].map((i) => ({
      id: `d${i}`, type: 'inactive_area' as const, severity: 'major' as const,
      location: { x: i * 10, y: 0, width: 5, height: 5 },
      description: 'Major inactive area', cellIndex: i,
    }))
    expect(analyzeELResults(defects, 60).overallGrade).toBe('marginal')
  })

  it('tallies defectsByType correctly', () => {
    const defects: ELDefect[] = [
      { id: 'd1', type: 'crack', severity: 'minor', location: { x: 0, y: 0, width: 5, height: 5 }, description: '', cellIndex: 0 },
      { id: 'd2', type: 'crack', severity: 'minor', location: { x: 10, y: 0, width: 5, height: 5 }, description: '', cellIndex: 1 },
      { id: 'd3', type: 'shunt', severity: 'minor', location: { x: 20, y: 0, width: 5, height: 5 }, description: '', cellIndex: 2 },
    ]
    const r = analyzeELResults(defects, 60)
    expect(r.defectsByType.crack).toBe(2)
    expect(r.defectsByType.shunt).toBe(1)
  })

  it('affectedCellPercentage counts unique cellIndex values only', () => {
    // 2 defects on the same cell → 1 unique cell out of 60
    const defects: ELDefect[] = [
      { id: 'd1', type: 'crack', severity: 'minor', location: { x: 0, y: 0, width: 5, height: 5 }, description: '', cellIndex: 5 },
      { id: 'd2', type: 'crack', severity: 'minor', location: { x: 0, y: 0, width: 5, height: 5 }, description: '', cellIndex: 5 },
    ]
    const r = analyzeELResults(defects, 60)
    expect(r.affectedCellPercentage).toBeCloseTo((1 / 60) * 100, 2)
  })

  it('2 minor defects on different cells → pass grade', () => {
    const defects: ELDefect[] = [
      { id: 'd1', type: 'crack', severity: 'minor', location: { x: 0, y: 0, width: 5, height: 5 }, description: '', cellIndex: 0 },
      { id: 'd2', type: 'crack', severity: 'minor', location: { x: 5, y: 0, width: 5, height: 5 }, description: '', cellIndex: 1 },
    ]
    expect(analyzeELResults(defects, 60).overallGrade).toBe('pass')
  })
})
