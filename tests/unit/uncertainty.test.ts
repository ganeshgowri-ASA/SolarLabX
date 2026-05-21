/**
 * Unit tests for lib/uncertainty.ts
 * GUM (JCGM 100:2008) uncertainty calculator — IEC 61215 / 61730 / 61853 / 60904
 */
import { describe, it, expect } from 'vitest'
import {
  toStandardUncertainty,
  calculateTypeA,
  calculateCombinedUncertainty,
  welchSatterthwaite,
  getCoverageFactor,
  createComponent,
  calculateBudget,
  type UncertaintyComponent,
} from '../../lib/uncertainty'

// ── helpers ──────────────────────────────────────────────────────────────────

function makeComp(
  id: string,
  varianceContribution: number,
  degreesOfFreedom: number = Infinity,
  standardUncertainty: number = 0,
  sensitivityCoefficient: number = 1,
): UncertaintyComponent {
  return {
    id,
    name: id,
    value: 0,
    uncertainty: 0,
    standardUncertainty,
    distribution: 'normal',
    type: 'typeB',
    sensitivityCoefficient,
    degreesOfFreedom,
    varianceContribution,
    percentageContribution: 0,
  }
}

// ── toStandardUncertainty ─────────────────────────────────────────────────────

describe('toStandardUncertainty', () => {
  it('normal distribution: value passes through unchanged', () => {
    expect(toStandardUncertainty(1.0, 'normal')).toBeCloseTo(1.0)
    expect(toStandardUncertainty(2.5, 'normal')).toBeCloseTo(2.5)
  })

  it('uniform distribution: divides by √3 (GUM §4.3.7)', () => {
    expect(toStandardUncertainty(Math.sqrt(3), 'uniform')).toBeCloseTo(1.0)
    expect(toStandardUncertainty(1.0, 'uniform')).toBeCloseTo(1 / Math.sqrt(3))
  })

  it('triangular distribution: divides by √6 (GUM §4.3.9)', () => {
    expect(toStandardUncertainty(Math.sqrt(6), 'triangular')).toBeCloseTo(1.0)
  })

  it('u-shaped distribution: divides by √2', () => {
    expect(toStandardUncertainty(Math.sqrt(2), 'u-shaped')).toBeCloseTo(1.0)
  })

  it('lognormal distribution: treated like normal', () => {
    expect(toStandardUncertainty(1.5, 'lognormal')).toBeCloseTo(1.5)
  })

  it('expanded uncertainty (isExpanded=true): divides by k before distribution conversion', () => {
    // expanded=2.0, k=2 → u=1.0, normal → 1.0
    expect(toStandardUncertainty(2.0, 'normal', true, 2)).toBeCloseTo(1.0)
    // expanded=2√3, k=2 → u=√3, uniform → 1.0
    expect(toStandardUncertainty(2 * Math.sqrt(3), 'uniform', true, 2)).toBeCloseTo(1.0)
  })
})

// ── calculateTypeA ────────────────────────────────────────────────────────────

describe('calculateTypeA', () => {
  it('identical measurements: zero standard deviation and uncertainty', () => {
    const result = calculateTypeA([10, 10, 10, 10])
    expect(result.mean).toBeCloseTo(10)
    expect(result.stdDev).toBeCloseTo(0)
    expect(result.standardUncertainty).toBeCloseTo(0)
    expect(result.degreesOfFreedom).toBe(3)
    expect(result.n).toBe(4)
  })

  it('[1, 2, 3]: mean=2, stdDev=1, standardUncertainty=1/√3', () => {
    const result = calculateTypeA([1, 2, 3])
    expect(result.mean).toBeCloseTo(2)
    expect(result.stdDev).toBeCloseTo(1) // s = sqrt((1+0+1)/2) = 1
    expect(result.standardUncertainty).toBeCloseTo(1 / Math.sqrt(3))
    expect(result.degreesOfFreedom).toBe(2)
    expect(result.n).toBe(3)
  })

  it('single measurement: handled gracefully with zero uncertainty', () => {
    const result = calculateTypeA([5])
    expect(result.mean).toBe(5)
    expect(result.standardUncertainty).toBe(0)
    expect(result.degreesOfFreedom).toBe(0)
  })
})

// ── calculateCombinedUncertainty ──────────────────────────────────────────────

describe('calculateCombinedUncertainty', () => {
  it('RSS of two independent components (GUM §13)', () => {
    // uc = sqrt(0.04 + 0.09) = sqrt(0.13)
    const comps = [makeComp('a', 0.04), makeComp('b', 0.09)]
    expect(calculateCombinedUncertainty(comps)).toBeCloseTo(Math.sqrt(0.13))
  })

  it('single component: uc equals its standard contribution', () => {
    expect(calculateCombinedUncertainty([makeComp('a', 0.25)])).toBeCloseTo(0.5)
  })

  it('zero contributions: combined uncertainty is zero', () => {
    expect(calculateCombinedUncertainty([makeComp('a', 0), makeComp('b', 0)])).toBeCloseTo(0)
  })

  it('positive correlation increases combined uncertainty (GUM §13.4)', () => {
    // With r=+1: uc = sqrt(0.04 + 0.09 + 2*1*1*0.2*1*0.3) = sqrt(0.25) = 0.5
    const c1 = makeComp('a', 0.04, Infinity, 0.2, 1)
    const c2 = makeComp('b', 0.09, Infinity, 0.3, 1)
    const uc = calculateCombinedUncertainty([c1, c2], [
      { component1Id: 'a', component2Id: 'b', coefficient: 1 },
    ])
    expect(uc).toBeCloseTo(0.5)
  })

  it('negative correlation decreases combined uncertainty', () => {
    const c1 = makeComp('a', 0.04, Infinity, 0.2, 1)
    const c2 = makeComp('b', 0.09, Infinity, 0.3, 1)
    const ucCorr = calculateCombinedUncertainty([c1, c2], [
      { component1Id: 'a', component2Id: 'b', coefficient: -1 },
    ])
    const ucNoCorr = calculateCombinedUncertainty([c1, c2])
    expect(ucCorr).toBeLessThan(ucNoCorr)
  })
})

// ── welchSatterthwaite ────────────────────────────────────────────────────────

describe('welchSatterthwaite', () => {
  it('all Infinity DOF (TypeB): effective DOF is Infinity', () => {
    const comps = [makeComp('a', 0.1, Infinity), makeComp('b', 0.2, Infinity)]
    expect(welchSatterthwaite(comps)).toBe(Infinity)
  })

  it('finite DOF components: computes Welch–Satterthwaite formula', () => {
    // uc² = 0.04 + 0.09 = 0.13, uc⁴ = 0.0169
    // denom = 0.04²/10 + 0.09²/30 = 0.00016 + 0.00027 = 0.00043
    // ν_eff = 0.0169/0.00043 ≈ 39.3 → rounded to 39
    const comps = [makeComp('a', 0.04, 10), makeComp('b', 0.09, 30)]
    expect(welchSatterthwaite(comps)).toBe(39)
  })

  it('Infinity DOF component is skipped in denominator', () => {
    // denom = only 0.09²/30 = 0.00027; ν_eff = 0.0169/0.00027 ≈ 62.6 → 63
    const comps = [makeComp('a', 0.04, Infinity), makeComp('b', 0.09, 30)]
    expect(welchSatterthwaite(comps)).toBe(63)
  })
})

// ── getCoverageFactor ─────────────────────────────────────────────────────────

describe('getCoverageFactor', () => {
  it('infinite DOF at 95%: k = 1.96 (normal distribution)', () => {
    expect(getCoverageFactor(Infinity)).toBeCloseTo(1.96)
    expect(getCoverageFactor(200)).toBeCloseTo(1.96)
  })

  it('infinite DOF at 99%: k = 2.576', () => {
    expect(getCoverageFactor(Infinity, 0.99)).toBeCloseTo(2.576)
  })

  it('dof=10 at 95%: tabulated k = 2.228', () => {
    expect(getCoverageFactor(10)).toBeCloseTo(2.228)
  })

  it('dof=2 at 95%: tabulated k = 4.303', () => {
    expect(getCoverageFactor(2)).toBeCloseTo(4.303)
  })

  it('intermediate DOF interpolates between tabulated values', () => {
    // dof=22 lies between 20 (k=2.086) and 25 (k=2.060)
    const k = getCoverageFactor(22)
    expect(k).toBeGreaterThan(2.060)
    expect(k).toBeLessThan(2.086)
  })
})

// ── createComponent ───────────────────────────────────────────────────────────

describe('createComponent', () => {
  it('uniform distribution: varianceContribution = (ci * u/√3)²', () => {
    const comp = createComponent('c1', 'Calibration', 100, 2.0, 'uniform', 'typeB', 1.0)
    // u_std = 2/√3; vc = (1 * 2/√3)² = 4/3 ≈ 1.3333
    expect(comp.standardUncertainty).toBeCloseTo(2 / Math.sqrt(3))
    expect(comp.varianceContribution).toBeCloseTo(4 / 3)
  })

  it('normal TypeA: varianceContribution = (ci * u)²', () => {
    const comp = createComponent('c2', 'Repeatability', 100, 0.5, 'normal', 'typeA', 2.0, 9)
    expect(comp.standardUncertainty).toBeCloseTo(0.5)
    expect(comp.varianceContribution).toBeCloseTo(1.0) // (2 * 0.5)² = 1
    expect(comp.degreesOfFreedom).toBe(9)
  })
})

// ── calculateBudget ───────────────────────────────────────────────────────────

describe('calculateBudget', () => {
  it('single normal TypeB component: k≈1.96 at 95% (infinite DOF)', () => {
    const comp = createComponent('c1', 'ref cell', 350, 1.0, 'normal', 'typeB', 1.0)
    const budget = calculateBudget('Pmax', 'Pmax', 350, [comp])
    expect(budget.combinedStandardUncertainty).toBeCloseTo(1.0)
    expect(budget.coverageFactor).toBeCloseTo(1.96)
    expect(budget.expandedUncertainty).toBeCloseTo(1.96)
    expect(budget.measuredValue).toBe(350)
  })

  it('percentage contributions sum to 100%', () => {
    const c1 = createComponent('c1', 'a', 100, 1.0, 'normal', 'typeB', 1.0)
    const c2 = createComponent('c2', 'b', 100, 2.0, 'normal', 'typeB', 1.0)
    const budget = calculateBudget('Test', 'Pmax', 100, [c1, c2])
    const total = budget.components.reduce((s, c) => s + c.percentageContribution, 0)
    expect(total).toBeCloseTo(100)
  })

  it('components are sorted by percentage contribution descending', () => {
    const small = createComponent('c1', 'small', 100, 0.5, 'normal', 'typeB', 1.0)
    const large = createComponent('c2', 'large', 100, 2.0, 'normal', 'typeB', 1.0)
    const budget = calculateBudget('Test', 'Pmax', 100, [small, large])
    expect(budget.components[0].percentageContribution).toBeGreaterThan(
      budget.components[1].percentageContribution,
    )
  })

  it('relative uncertainty is zero when measuredValue is zero', () => {
    const comp = createComponent('c1', 'a', 0, 1.0, 'normal', 'typeB', 1.0)
    const budget = calculateBudget('Test', 'Pmax', 0, [comp])
    expect(budget.relativeUncertaintyPercent).toBe(0)
  })
})
