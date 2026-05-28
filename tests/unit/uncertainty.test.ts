import { describe, it, expect } from 'vitest'
import {
  toStandardUncertainty,
  calculateTypeA,
  calculateCombinedUncertainty,
  welchSatterthwaite,
  getCoverageFactor,
  createComponent,
  calculateBudget,
} from '../../lib/uncertainty'

const SQRT2 = Math.sqrt(2)
const SQRT3 = Math.sqrt(3)
const SQRT6 = Math.sqrt(6)

// ─── toStandardUncertainty ────────────────────────────────────────────────────

describe('toStandardUncertainty', () => {
  it('normal distribution passes through unchanged', () => {
    expect(toStandardUncertainty(2.0, 'normal')).toBeCloseTo(2.0, 10)
  })
  it('lognormal distribution passes through unchanged', () => {
    expect(toStandardUncertainty(3.5, 'lognormal')).toBeCloseTo(3.5, 10)
  })
  it('uniform: divides by sqrt(3) — JCGM 100:2008 Table B.1', () => {
    expect(toStandardUncertainty(1.0, 'uniform')).toBeCloseTo(1 / SQRT3, 10)
  })
  it('triangular: divides by sqrt(6)', () => {
    expect(toStandardUncertainty(1.0, 'triangular')).toBeCloseTo(1 / SQRT6, 10)
  })
  it('u-shaped: divides by sqrt(2)', () => {
    expect(toStandardUncertainty(1.0, 'u-shaped')).toBeCloseTo(1 / SQRT2, 10)
  })
  it('expanded=true k=2 with uniform: halves first, then divides by sqrt(3)', () => {
    // U=2, k=2 → half-width = 1.0 → /sqrt(3)
    expect(toStandardUncertainty(2.0, 'uniform', true, 2)).toBeCloseTo(1 / SQRT3, 10)
  })
  it('expanded=true k=1.96 with normal: divides by k only', () => {
    expect(toStandardUncertainty(1.96, 'normal', true, 1.96)).toBeCloseTo(1.0, 10)
  })
  it('zero input returns zero for every distribution', () => {
    for (const dist of ['normal', 'uniform', 'triangular', 'u-shaped', 'lognormal'] as const) {
      expect(toStandardUncertainty(0, dist)).toBe(0)
    }
  })
})

// ─── calculateTypeA ───────────────────────────────────────────────────────────

describe('calculateTypeA', () => {
  it('[3,5,7,9,11]: mean=7, stdDev=√10, u_A=√2, dof=4', () => {
    // variance = [(3-7)²+(5-7)²+0+(9-7)²+(11-7)²] / (5-1) = 40/4 = 10
    const r = calculateTypeA([3, 5, 7, 9, 11])
    expect(r.mean).toBeCloseTo(7, 10)
    expect(r.stdDev).toBeCloseTo(Math.sqrt(10), 8)
    expect(r.standardUncertainty).toBeCloseTo(Math.sqrt(2), 8) // √10/√5
    expect(r.degreesOfFreedom).toBe(4)
    expect(r.n).toBe(5)
  })
  it('n=1 returns zero uncertainty and zero dof', () => {
    const r = calculateTypeA([42])
    expect(r.mean).toBe(42)
    expect(r.standardUncertainty).toBe(0)
    expect(r.degreesOfFreedom).toBe(0)
  })
  it('identical measurements give zero stdDev and zero standardUncertainty', () => {
    const r = calculateTypeA([5, 5, 5, 5])
    expect(r.stdDev).toBe(0)
    expect(r.standardUncertainty).toBe(0)
    expect(r.mean).toBe(5)
  })
  it('degreesOfFreedom = n - 1 (Bessel correction)', () => {
    for (const n of [2, 3, 5, 10, 20]) {
      const arr = Array.from({ length: n }, (_, i) => i)
      expect(calculateTypeA(arr).degreesOfFreedom).toBe(n - 1)
    }
  })
})

// ─── getCoverageFactor ────────────────────────────────────────────────────────

describe('getCoverageFactor', () => {
  it('returns tabulated t₉₅ values for exact dof entries', () => {
    expect(getCoverageFactor(2, 0.95)).toBeCloseTo(4.303, 3)
    expect(getCoverageFactor(5, 0.95)).toBeCloseTo(2.571, 3)
    expect(getCoverageFactor(10, 0.95)).toBeCloseTo(2.228, 3)
    expect(getCoverageFactor(20, 0.95)).toBeCloseTo(2.086, 3)
  })
  it('returns tabulated t₉₉ values for exact dof entries', () => {
    expect(getCoverageFactor(5, 0.99)).toBeCloseTo(4.032, 3)
    expect(getCoverageFactor(10, 0.99)).toBeCloseTo(3.169, 3)
    expect(getCoverageFactor(20, 0.99)).toBeCloseTo(2.845, 3)
  })
  it('returns 1.96 for infinite dof at 95%', () => {
    expect(getCoverageFactor(Infinity, 0.95)).toBeCloseTo(1.96, 3)
    expect(getCoverageFactor(200, 0.95)).toBeCloseTo(1.96, 1)
  })
  it('returns 2.576 for infinite dof at 99%', () => {
    expect(getCoverageFactor(Infinity, 0.99)).toBeCloseTo(2.576, 3)
  })
  it('interpolates monotonically between tabulated rows', () => {
    const k10 = getCoverageFactor(10, 0.95)
    const k15 = getCoverageFactor(15, 0.95) // tabulated
    const k12 = getCoverageFactor(12, 0.95) // interpolated
    expect(k12).toBeGreaterThan(k15)
    expect(k12).toBeLessThan(k10)
  })
  it('k decreases monotonically with dof at 95%', () => {
    const dofs = [1, 2, 5, 10, 20, 50, 100]
    const ks = dofs.map(d => getCoverageFactor(d, 0.95))
    for (let i = 1; i < ks.length; i++) {
      expect(ks[i]).toBeLessThan(ks[i - 1])
    }
  })
})

// ─── createComponent ─────────────────────────────────────────────────────────

describe('createComponent', () => {
  it('standardUncertainty = toStandardUncertainty(uncertainty, distribution)', () => {
    const c = createComponent('u1', 'cal cert', 100, 2, 'uniform', 'typeB', 1, Infinity)
    expect(c.standardUncertainty).toBeCloseTo(2 / SQRT3, 8)
  })
  it('varianceContribution = (ci × standardUncertainty)²', () => {
    const ci = 1.5
    const c = createComponent('u2', 'temp sensor', 25, 0.4, 'normal', 'typeB', ci, 30)
    expect(c.varianceContribution).toBeCloseTo((ci * 0.4) ** 2, 10)
  })
  it('percentageContribution is initialised to 0 — set by calculateBudget', () => {
    const c = createComponent('u3', 'ref std', 0, 1, 'normal', 'typeB', 1, Infinity)
    expect(c.percentageContribution).toBe(0)
  })
  it('all required UncertaintyComponent fields are present', () => {
    const c = createComponent('u4', 'irradiance', 1000, 5, 'uniform', 'typeB', 1, Infinity, false, 'Equipment')
    expect(c).toHaveProperty('id', 'u4')
    expect(c).toHaveProperty('name', 'irradiance')
    expect(c).toHaveProperty('standardUncertainty')
    expect(c).toHaveProperty('varianceContribution')
    expect(c).toHaveProperty('distribution', 'uniform')
    expect(c).toHaveProperty('category', 'Equipment')
  })
})

// ─── calculateCombinedUncertainty ────────────────────────────────────────────

describe('calculateCombinedUncertainty', () => {
  it('3²+4²=5²: two uncorrelated normal components give 5', () => {
    const c1 = createComponent('a', 'u1', 0, 3, 'normal', 'typeB', 1, Infinity)
    const c2 = createComponent('b', 'u2', 0, 4, 'normal', 'typeB', 1, Infinity)
    expect(calculateCombinedUncertainty([c1, c2])).toBeCloseTo(5, 8)
  })
  it('single component: result = |ci| × standardUncertainty', () => {
    const c = createComponent('x', 'single', 0, 2, 'normal', 'typeA', 3, 10)
    expect(calculateCombinedUncertainty([c])).toBeCloseTo(6, 8)
  })
  it('positive correlation increases combined uncertainty', () => {
    const c1 = createComponent('a', 'u1', 0, 1, 'normal', 'typeB', 1, Infinity)
    const c2 = createComponent('b', 'u2', 0, 1, 'normal', 'typeB', 1, Infinity)
    const noCorr = calculateCombinedUncertainty([c1, c2])
    const withCorr = calculateCombinedUncertainty(
      [c1, c2],
      [{ component1Id: 'a', component2Id: 'b', coefficient: 0.8 }]
    )
    expect(withCorr).toBeGreaterThan(noCorr)
  })
  it('negative correlation decreases combined uncertainty', () => {
    const c1 = createComponent('a', 'u1', 0, 1, 'normal', 'typeB', 1, Infinity)
    const c2 = createComponent('b', 'u2', 0, 1, 'normal', 'typeB', 1, Infinity)
    const noCorr = calculateCombinedUncertainty([c1, c2])
    const withCorr = calculateCombinedUncertainty(
      [c1, c2],
      [{ component1Id: 'a', component2Id: 'b', coefficient: -0.8 }]
    )
    expect(withCorr).toBeLessThan(noCorr)
  })
  it('full negative correlation on equal components gives zero', () => {
    const c1 = createComponent('a', 'u1', 0, 1, 'normal', 'typeB', 1, Infinity)
    const c2 = createComponent('b', 'u2', 0, 1, 'normal', 'typeB', 1, Infinity)
    const result = calculateCombinedUncertainty(
      [c1, c2],
      [{ component1Id: 'a', component2Id: 'b', coefficient: -1 }]
    )
    expect(result).toBeCloseTo(0, 8)
  })
})

// ─── welchSatterthwaite ───────────────────────────────────────────────────────

describe('welchSatterthwaite', () => {
  it('4 equal-variance equal-dof(10) components → ν_eff = 40', () => {
    // uc4 = 4² = 16; denom = 4 × (1²/10) = 0.4; ν = round(16/0.4) = 40
    const comps = [1, 2, 3, 4].map(i =>
      createComponent(`c${i}`, `u${i}`, 0, 1, 'normal', 'typeB', 1, 10)
    )
    expect(welchSatterthwaite(comps)).toBe(40)
  })
  it('infinite dof component does not contribute to denominator', () => {
    // finite: var=9, dof=9; infinite: var=16, dof=∞
    // uc4 = 25² = 625; denom = 9²/9 = 9; ν = round(625/9) = 69
    const finite = createComponent('f', 'finite', 0, 3, 'normal', 'typeB', 1, 9)
    const inf = createComponent('i', 'inf', 0, 4, 'normal', 'typeB', 1, Infinity)
    expect(welchSatterthwaite([finite, inf])).toBe(69)
  })
  it('dominant component drives effective dof toward its own dof', () => {
    // one large component dof=5, one tiny component dof=30 → ν close to 5
    const large = createComponent('l', 'large', 0, 10, 'normal', 'typeB', 1, 5)
    const small = createComponent('s', 'small', 0, 0.1, 'normal', 'typeB', 1, 30)
    const veff = welchSatterthwaite([large, small])
    expect(veff).toBeGreaterThanOrEqual(5)
    expect(veff).toBeLessThanOrEqual(30)
  })
})

// ─── calculateBudget ─────────────────────────────────────────────────────────

describe('calculateBudget', () => {
  it('expandedUncertainty = combinedStandardUncertainty × coverageFactor', () => {
    const c1 = createComponent('a', 'u1', 0, 3, 'normal', 'typeB', 1, Infinity)
    const c2 = createComponent('b', 'u2', 0, 4, 'normal', 'typeB', 1, Infinity)
    const b = calculateBudget('Pmax Budget', 'Pmax', 250, [c1, c2], 0.95)
    expect(b.expandedUncertainty).toBeCloseTo(
      b.combinedStandardUncertainty * b.coverageFactor, 8
    )
  })
  it('components sorted by percentageContribution descending', () => {
    const small = createComponent('a', 'small', 0, 1, 'normal', 'typeB', 1, Infinity)
    const large = createComponent('b', 'large', 0, 5, 'normal', 'typeB', 1, Infinity)
    const b = calculateBudget('test', 'measurand', 100, [small, large])
    for (let i = 1; i < b.components.length; i++) {
      expect(b.components[i - 1].percentageContribution).toBeGreaterThanOrEqual(
        b.components[i].percentageContribution
      )
    }
  })
  it('relativeUncertaintyPercent = (U / |measuredValue|) × 100', () => {
    const c = createComponent('a', 'u', 0, 2, 'normal', 'typeB', 1, Infinity)
    const b = calculateBudget('test', 'Power', 100, [c])
    expect(b.relativeUncertaintyPercent).toBeCloseTo(
      (b.expandedUncertainty / 100) * 100, 6
    )
  })
  it('budget contains all ISO 17025 required fields', () => {
    const c = createComponent('a', 'u', 0, 1, 'normal', 'typeB', 1, 20)
    const b = calculateBudget('B1', 'Pmax', 250, [c], 0.95, undefined, 'W', 'y = x', 'IEC 60904-3')
    expect(b).toHaveProperty('measurand', 'Pmax')
    expect(b).toHaveProperty('combinedStandardUncertainty')
    expect(b).toHaveProperty('expandedUncertainty')
    expect(b).toHaveProperty('coverageFactor')
    expect(b).toHaveProperty('coverageProbability', 0.95)
    expect(b).toHaveProperty('effectiveDegreesOfFreedom')
    expect(b.measurementModel).toBe('y = x')
    expect(b.standardReference).toBe('IEC 60904-3')
  })
  it('percentageContributions sum to 100', () => {
    const comps = [1, 2, 3].map((v, i) =>
      createComponent(`c${i}`, `u${i}`, 0, v, 'normal', 'typeB', 1, Infinity)
    )
    const b = calculateBudget('sum test', 'X', 50, comps)
    const total = b.components.reduce((s, c) => s + c.percentageContribution, 0)
    expect(total).toBeCloseTo(100, 6)
  })
})
