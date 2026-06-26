/**
 * Unit tests for SPC (Statistical Process Control) and MSA (Measurement System Analysis)
 * functions in lib/sun-simulator.ts: calculateSPC, calculateGageRR, overallClassification.
 *
 * IEC 60904-9 spectral / uniformity / temporal tests were added in the earlier
 * Thu-2026-05-28 PR (unmerged). This file covers the SPC / GageRR / overall-grade
 * functions not yet under test.
 */

import { describe, it, expect } from 'vitest'
import { calculateSPC, calculateGageRR, overallClassification } from '@/lib/sun-simulator'

// ─────────────────────────────────────────────────────────────────────────────
// calculateSPC — Shewhart X̄-R chart with Cp / Cpk
// SPC constants (AIAG SPC 2nd Ed.) for n=2: A2=1.880, D3=0, D4=3.267, d2=1.128
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateSPC — centered process, n=2', () => {
  // Sub1: [100, 102] → x̄=101, R=2
  // Sub2: [98, 100]  → x̄=99,  R=2
  // x̄̄=100, R̄=2; σ̂=R̄/d2=2/1.128≈1.773
  const data = [
    { subgroup: 1, values: [100, 102] },
    { subgroup: 2, values: [98, 100] },
  ]
  const usl = 110
  const lsl = 90

  it('returns arrays with the same length as input subgroups', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.xBar).toHaveLength(2)
    expect(r.range).toHaveLength(2)
    expect(r.subgroups).toHaveLength(2)
  })

  it('computes x̄ as the mean of each subgroup', () => {
    const { xBar } = calculateSPC(data, usl, lsl)
    expect(xBar[0]).toBeCloseTo(101, 6)
    expect(xBar[1]).toBeCloseTo(99, 6)
  })

  it('computes range as max − min of each subgroup', () => {
    const { range } = calculateSPC(data, usl, lsl)
    expect(range[0]).toBeCloseTo(2, 6)
    expect(range[1]).toBeCloseTo(2, 6)
  })

  it('computes x̄̄ (grand mean) and R̄ (mean range)', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.xBarMean).toBeCloseTo(100, 6)
    expect(r.rMean).toBeCloseTo(2, 6)
  })

  it('x̄ UCL = x̄̄ + A2·R̄  (A2=1.880 for n=2)', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.xBarUCL).toBeCloseTo(100 + 1.880 * 2, 3)   // 103.76
  })

  it('x̄ LCL = x̄̄ − A2·R̄', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.xBarLCL).toBeCloseTo(100 - 1.880 * 2, 3)   // 96.24
  })

  it('UCL > mean > LCL', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.xBarUCL).toBeGreaterThan(r.xBarMean)
    expect(r.xBarMean).toBeGreaterThan(r.xBarLCL)
  })

  it('R UCL = D4·R̄  (D4=3.267 for n=2)', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.rUCL).toBeCloseTo(3.267 * 2, 3)   // 6.534
  })

  it('R LCL = 0 for n=2 (D3=0)', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.rLCL).toBeCloseTo(0, 6)
  })

  it('cp > 0 when USL ≠ LSL', () => {
    expect(calculateSPC(data, usl, lsl).cp).toBeGreaterThan(0)
  })

  it('cpk ≤ cp always', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.cpk).toBeLessThanOrEqual(r.cp + 1e-10)
  })

  it('cp ≈ cpk when process is perfectly centered', () => {
    // x̄̄=100 = midpoint of [90,110] → cpu = cpl → cpk = cp
    const r = calculateSPC(data, usl, lsl)
    expect(r.cp).toBeCloseTo(r.cpk, 5)
  })

  it('subgroups array echoes input subgroup identifiers', () => {
    const r = calculateSPC(data, usl, lsl)
    expect(r.subgroups).toEqual([1, 2])
  })
})

describe('calculateSPC — off-center process', () => {
  // x̄̄ ≈ 106.5, shifted toward USL; cpk < cp
  const data = [
    { subgroup: 1, values: [105, 107] },
    { subgroup: 2, values: [106, 108] },
  ]

  it('cpk < cp when process is not centered', () => {
    const r = calculateSPC(data, 115, 90)
    expect(r.cpk).toBeLessThan(r.cp)
  })

  it('cp is determined by spread (USL-LSL) regardless of centering', () => {
    const r = calculateSPC(data, 115, 90)
    // sigma ≈ 2/1.128; cp = (115-90)/(6·sigma)
    const sigma = 2 / 1.128
    expect(r.cp).toBeCloseTo(25 / (6 * sigma), 3)
  })
})

describe('calculateSPC — n=5 subgroups', () => {
  // Uses A2(5)=0.577, D3(5)=0, D4(5)=2.115, d2(5)=2.326
  const data = [
    { subgroup: 1, values: [50, 51, 49, 50, 50] },
    { subgroup: 2, values: [51, 50, 52, 49, 50] },
    { subgroup: 3, values: [49, 50, 50, 51, 48] },
  ]

  it('computes correct x̄ for each subgroup', () => {
    const r = calculateSPC(data, 60, 40)
    expect(r.xBar[0]).toBeCloseTo(50, 5)
    expect(r.xBar[1]).toBeCloseTo(50.4, 5)
    expect(r.xBar[2]).toBeCloseTo(49.6, 5)
  })

  it('computes R as max − min', () => {
    const r = calculateSPC(data, 60, 40)
    expect(r.range[0]).toBe(2)   // 51-49
    expect(r.range[1]).toBe(3)   // 52-49
    expect(r.range[2]).toBe(3)   // 51-48
  })

  it('x̄ UCL uses A2=0.577 for n=5', () => {
    const r = calculateSPC(data, 60, 40)
    expect(r.xBarUCL).toBeCloseTo(r.xBarMean + 0.577 * r.rMean, 3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// calculateGageRR — ANOVA Gage R&R per AIAG MSA
// ─────────────────────────────────────────────────────────────────────────────

describe('calculateGageRR — perfect measurement system', () => {
  // 2 operators × 3 parts × 2 trials, zero spread within and between operators.
  // All part-to-part variation; gauge contribution = 0.
  const measurements: number[][][] = [
    [[5, 5], [10, 10], [15, 15]],   // operator 0
    [[5, 5], [10, 10], [15, 15]],   // operator 1
  ]

  it('returns all required result fields', () => {
    const r = calculateGageRR(measurements)
    expect(r).toHaveProperty('repeatability')
    expect(r).toHaveProperty('reproducibility')
    expect(r).toHaveProperty('gageRR')
    expect(r).toHaveProperty('partVariation')
    expect(r).toHaveProperty('totalVariation')
    expect(r).toHaveProperty('gageRRPercent')
    expect(r).toHaveProperty('ndc')
    expect(r).toHaveProperty('acceptable')
  })

  it('repeatability = 0 when all trials identical', () => {
    expect(calculateGageRR(measurements).repeatability).toBeCloseTo(0, 10)
  })

  it('reproducibility = 0 when operators agree perfectly', () => {
    expect(calculateGageRR(measurements).reproducibility).toBeCloseTo(0, 10)
  })

  it('gageRR = 0 for a perfect system', () => {
    expect(calculateGageRR(measurements).gageRR).toBeCloseTo(0, 10)
  })

  it('gageRRPercent = 0 for a perfect system', () => {
    expect(calculateGageRR(measurements).gageRRPercent).toBeCloseTo(0, 10)
  })

  it('partVariation > 0 (all spread is from parts)', () => {
    expect(calculateGageRR(measurements).partVariation).toBeGreaterThan(0)
  })

  it('acceptable = true when gageRRPercent ≤ 10', () => {
    const r = calculateGageRR(measurements)
    expect(r.acceptable).toBe(r.gageRRPercent <= 10)
  })
})

describe('calculateGageRR — noisy measurement system', () => {
  // 2 operators × 3 parts × 2 trials, with repeatable spread and operator bias.
  // Op0 ±0.2, Op1 ±0.4 — gauge has real uncertainty.
  const measurements: number[][][] = [
    [[5.1, 4.9], [10.2, 9.8], [15.3, 14.7]],   // operator 0
    [[5.3, 4.7], [10.4, 9.6], [15.5, 14.5]],   // operator 1
  ]

  it('repeatability > 0 when trials differ', () => {
    expect(calculateGageRR(measurements).repeatability).toBeGreaterThan(0)
  })

  it('all numeric fields are finite non-negative', () => {
    const r = calculateGageRR(measurements)
    for (const field of ['repeatability', 'reproducibility', 'gageRR',
                          'partVariation', 'totalVariation', 'gageRRPercent'] as const) {
      expect(r[field]).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(r[field])).toBe(true)
    }
  })

  it('gageRR² = repeatability² + reproducibility²', () => {
    const r = calculateGageRR(measurements)
    const computed = Math.sqrt(r.repeatability ** 2 + r.reproducibility ** 2)
    expect(r.gageRR).toBeCloseTo(computed, 8)
  })

  it('gageRRPercent is in [0, 100]', () => {
    const r = calculateGageRR(measurements)
    expect(r.gageRRPercent).toBeGreaterThanOrEqual(0)
    expect(r.gageRRPercent).toBeLessThanOrEqual(100)
  })

  it('acceptable field mirrors gageRRPercent ≤ 10 rule', () => {
    const r = calculateGageRR(measurements)
    expect(r.acceptable).toBe(r.gageRRPercent <= 10)
  })

  it('part variation drives most of total variation for clear part spread', () => {
    // Parts are at 5 / 10 / 15 → large spread dominates gauge noise
    const r = calculateGageRR(measurements)
    expect(r.partVariation).toBeGreaterThan(r.gageRR)
  })
})

describe('calculateGageRR — minimum valid input (2 ops × 2 parts × 2 trials)', () => {
  const measurements: number[][][] = [
    [[100, 101], [200, 199]],
    [[100, 102], [200, 198]],
  ]

  it('does not throw', () => {
    expect(() => calculateGageRR(measurements)).not.toThrow()
  })

  it('totalVariation ≥ gageRR', () => {
    const r = calculateGageRR(measurements)
    expect(r.totalVariation).toBeGreaterThanOrEqual(r.gageRR - 1e-10)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// overallClassification — returns the worst of three IEC 60904-9 grades
// Grade order (best → worst): A+ > A > B > C > Fail
// ─────────────────────────────────────────────────────────────────────────────

describe('overallClassification', () => {
  it('returns worst of three — B wins over A and A+', () => {
    expect(overallClassification('A+', 'A', 'B')).toBe('B')
  })

  it('all A+ → A+', () => {
    expect(overallClassification('A+', 'A+', 'A+')).toBe('A+')
  })

  it('all A → A', () => {
    expect(overallClassification('A', 'A', 'A')).toBe('A')
  })

  it('Fail always wins', () => {
    expect(overallClassification('A+', 'A+', 'Fail')).toBe('Fail')
    expect(overallClassification('C', 'A', 'Fail')).toBe('Fail')
    expect(overallClassification('Fail', 'A+', 'A+')).toBe('Fail')
  })

  it('is transitive: B beats A+ and A', () => {
    expect(overallClassification('B', 'A+', 'A')).toBe('B')
    expect(overallClassification('A+', 'B', 'A')).toBe('B')
    expect(overallClassification('A', 'A+', 'B')).toBe('B')
  })

  it('C beats A, A+, and B', () => {
    expect(overallClassification('A+', 'A', 'C')).toBe('C')
    expect(overallClassification('B', 'C', 'A+')).toBe('C')
  })
})
