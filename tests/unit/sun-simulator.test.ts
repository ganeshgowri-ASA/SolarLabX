/**
 * Unit tests for lib/sun-simulator.ts
 * IEC 60904-9 Ed.3 solar simulator classification algorithms
 */
import { describe, it, expect } from 'vitest'
import {
  calculateUniformity,
  calculateTemporalStability,
  overallClassification,
  calculateSPC,
  calculateSpectralMatch,
  calculateGageRR,
} from '../../lib/sun-simulator'

// ── calculateUniformity ───────────────────────────────────────────────────────

describe('calculateUniformity (IEC 60904-9 §6.3)', () => {
  // nonUniformity = (max - min) / (max + min) × 100

  it('perfectly uniform grid: nonUniformity = 0, grade A+', () => {
    const result = calculateUniformity([[1000, 1000], [1000, 1000]])
    expect(result.nonUniformity).toBeCloseTo(0)
    expect(result.grade).toBe('A+')
  })

  it('1% non-uniformity → grade A+ (threshold ≤ 1%)', () => {
    // (1010-990)/(1010+990)*100 = 20/2000*100 = 1.0%
    const result = calculateUniformity([[1010, 990]])
    expect(result.nonUniformity).toBeCloseTo(1.0)
    expect(result.grade).toBe('A+')
  })

  it('1.5% non-uniformity → grade A (1% < x ≤ 2%)', () => {
    // (1015-985)/(1015+985)*100 = 30/2000*100 = 1.5%
    const result = calculateUniformity([[1015, 985]])
    expect(result.nonUniformity).toBeCloseTo(1.5)
    expect(result.grade).toBe('A')
  })

  it('2% non-uniformity → grade A (upper boundary)', () => {
    // (1020-980)/(1020+980)*100 = 40/2000*100 = 2.0%
    const result = calculateUniformity([[1020, 980]])
    expect(result.nonUniformity).toBeCloseTo(2.0)
    expect(result.grade).toBe('A')
  })

  it('5% non-uniformity → grade B (2% < x ≤ 5%)', () => {
    // (1050-950)/(1050+950)*100 = 100/2000*100 = 5.0%
    const result = calculateUniformity([[1050, 950]])
    expect(result.nonUniformity).toBeCloseTo(5.0)
    expect(result.grade).toBe('B')
  })

  it('10% non-uniformity → grade C (5% < x ≤ 10%)', () => {
    // (1100-900)/(1100+900)*100 = 200/2000*100 = 10.0%
    const result = calculateUniformity([[1100, 900]])
    expect(result.nonUniformity).toBeCloseTo(10.0)
    expect(result.grade).toBe('C')
  })

  it('20% non-uniformity → grade Fail (> 10%)', () => {
    // (1200-800)/(1200+800)*100 = 400/2000*100 = 20%
    const result = calculateUniformity([[1200, 800]])
    expect(result.grade).toBe('Fail')
  })

  it('returns correct statistical measures (mean, min, max)', () => {
    const result = calculateUniformity([[900, 1100], [1000, 1000]])
    expect(result.min).toBe(900)
    expect(result.max).toBe(1100)
    expect(result.mean).toBeCloseTo(1000)
  })
})

// ── calculateTemporalStability ────────────────────────────────────────────────

describe('calculateTemporalStability (IEC 60904-9 §6.2)', () => {
  // STI / LTI = (max - min) / (max + min) × 100

  it('constant irradiance: STI = LTI = 0, overall grade A+', () => {
    const stiData = [{ time: 0, irradiance: 1000 }, { time: 5, irradiance: 1000 }]
    const ltiData = [{ time: 0, irradiance: 1000 }, { time: 100, irradiance: 1000 }]
    const result = calculateTemporalStability(stiData, ltiData)
    expect(result.sti).toBeCloseTo(0)
    expect(result.lti).toBeCloseTo(0)
    expect(result.stiGrade).toBe('A+')
    expect(result.ltiGrade).toBe('A+')
    expect(result.overallGrade).toBe('A+')
  })

  it('STI 1% → grade A (0.5% < STI ≤ 2%)', () => {
    // (1010-990)/(1010+990)*100 = 1.0%
    const stiData = [{ time: 0, irradiance: 1010 }, { time: 5, irradiance: 990 }]
    const ltiData = [{ time: 0, irradiance: 1000 }, { time: 100, irradiance: 1000 }]
    const result = calculateTemporalStability(stiData, ltiData)
    expect(result.sti).toBeCloseTo(1.0)
    expect(result.stiGrade).toBe('A')
  })

  it('STI 5% → grade B (2% < STI ≤ 5%)', () => {
    // (1050-950)/(1050+950)*100 = 5.0%
    const stiData = [{ time: 0, irradiance: 1050 }, { time: 5, irradiance: 950 }]
    const ltiData = [{ time: 0, irradiance: 1000 }, { time: 100, irradiance: 1000 }]
    const result = calculateTemporalStability(stiData, ltiData)
    expect(result.stiGrade).toBe('B')
  })

  it('overall grade is the worse of STI and LTI grades', () => {
    const stiData = [{ time: 0, irradiance: 1050 }, { time: 5, irradiance: 950 }] // 5% → B
    const ltiData = [{ time: 0, irradiance: 1000 }, { time: 100, irradiance: 1000 }] // 0% → A+
    const result = calculateTemporalStability(stiData, ltiData)
    expect(result.overallGrade).toBe('B')
  })

  it('returns stiData and ltiData in result for charting', () => {
    const stiData = [{ time: 0, irradiance: 1000 }, { time: 5, irradiance: 1000 }]
    const ltiData = [{ time: 0, irradiance: 1000 }, { time: 60, irradiance: 1000 }]
    const result = calculateTemporalStability(stiData, ltiData)
    expect(result.stiData).toHaveLength(2)
    expect(result.ltiData).toHaveLength(2)
  })
})

// ── overallClassification ─────────────────────────────────────────────────────

describe('overallClassification (IEC 60904-9 §6.1)', () => {
  it('all A+: overall is A+', () => {
    expect(overallClassification('A+', 'A+', 'A+')).toBe('A+')
  })

  it('one A, others A+: overall is A', () => {
    expect(overallClassification('A+', 'A+', 'A')).toBe('A')
  })

  it('one B among A and A+: overall is B', () => {
    expect(overallClassification('A+', 'B', 'A')).toBe('B')
  })

  it('one C: overall is C', () => {
    expect(overallClassification('A', 'B', 'C')).toBe('C')
  })

  it('one Fail: overall is Fail regardless of others', () => {
    expect(overallClassification('A+', 'A', 'Fail')).toBe('Fail')
    expect(overallClassification('Fail', 'A+', 'A+')).toBe('Fail')
  })
})

// ── calculateSPC ──────────────────────────────────────────────────────────────

describe('calculateSPC (Shewhart X-bar & R chart, n=5)', () => {
  // IEC SPC constants for n=5: A2=0.577, D3=0, D4=2.115, d2=2.326

  it('uniform data: xBarMean = 10, rMean = 0', () => {
    const data = [
      { subgroup: 1, values: [10, 10, 10, 10, 10] },
      { subgroup: 2, values: [10, 10, 10, 10, 10] },
    ]
    const result = calculateSPC(data, 12, 8)
    expect(result.xBarMean).toBeCloseTo(10)
    expect(result.rMean).toBeCloseTo(0)
    expect(result.xBarUCL).toBeCloseTo(10)
    expect(result.xBarLCL).toBeCloseTo(10)
  })

  it('control limits use tabulated A2=0.577 for n=5', () => {
    // subgroup 1: [9,10,11,10,10] → mean=10, range=2
    // subgroup 2: [10,10,10,10,10] → mean=10, range=0
    // rMean=1; xBarUCL = 10 + 0.577*1 = 10.577; xBarLCL = 10 - 0.577*1 = 9.423
    const data = [
      { subgroup: 1, values: [9, 10, 11, 10, 10] },
      { subgroup: 2, values: [10, 10, 10, 10, 10] },
    ]
    const result = calculateSPC(data, 12, 8)
    expect(result.xBarUCL).toBeCloseTo(10.577)
    expect(result.xBarLCL).toBeCloseTo(9.423)
  })

  it('R-chart UCL uses D4=2.115 for n=5', () => {
    const data = [
      { subgroup: 1, values: [9, 10, 11, 10, 10] },
      { subgroup: 2, values: [10, 10, 10, 10, 10] },
    ]
    const result = calculateSPC(data, 12, 8)
    expect(result.rUCL).toBeCloseTo(2.115)
    expect(result.rLCL).toBeCloseTo(0) // D3=0 for n≤6
  })

  it('Cp and Cpk are positive for centred process with variation', () => {
    const data = [
      { subgroup: 1, values: [9, 10, 11, 10, 10] },
      { subgroup: 2, values: [10, 10, 10, 10, 10] },
    ]
    const result = calculateSPC(data, 12, 8)
    expect(result.cp).toBeGreaterThan(0)
    expect(result.cpk).toBeGreaterThan(0)
  })

  it('subgroups array preserves original order', () => {
    const data = [
      { subgroup: 1, values: [10, 10, 10, 10, 10] },
      { subgroup: 2, values: [10, 10, 10, 10, 10] },
      { subgroup: 3, values: [10, 10, 10, 10, 10] },
    ]
    const result = calculateSPC(data, 12, 8)
    expect(result.subgroups).toEqual([1, 2, 3])
  })
})

// ── calculateSpectralMatch ────────────────────────────────────────────────────

describe('calculateSpectralMatch (IEC 60904-9 SPD method)', () => {
  it('returns exactly 6 interval results (one per IEC 60904-9 wavelength band)', () => {
    const spectrum = [{ wavelength: 400, irradiance: 1 }, { wavelength: 1100, irradiance: 1 }]
    const result = calculateSpectralMatch(spectrum)
    expect(result.intervals).toHaveLength(6)
  })

  it('flat spectrum gives grade C (band fractions mismatch AM1.5G 900-1100 nm band)', () => {
    // Flat spectrum: all band measured fractions ≠ AM1.5G fractions
    // 900-1100 band is 200nm wide → gets ~28.6% of total vs reference 15.9% → ratio ≈ 1.8 > 1.4 → fails class B
    const spectrum = [{ wavelength: 400, irradiance: 1 }, { wavelength: 1100, irradiance: 1 }]
    const result = calculateSpectralMatch(spectrum)
    expect(result.grade).toBe('C')
  })

  it('minRatio ≤ meanRatio ≤ maxRatio', () => {
    const spectrum = [{ wavelength: 400, irradiance: 1 }, { wavelength: 1100, irradiance: 1 }]
    const result = calculateSpectralMatch(spectrum)
    expect(result.minRatio).toBeLessThanOrEqual(result.meanRatio)
    expect(result.meanRatio).toBeLessThanOrEqual(result.maxRatio)
  })

  it('band flags are consistent with ratio thresholds', () => {
    const spectrum = [{ wavelength: 400, irradiance: 1 }, { wavelength: 1100, irradiance: 1 }]
    const result = calculateSpectralMatch(spectrum)
    for (const interval of result.intervals) {
      // inSpecAPlus requires [0.875, 1.125] — inSpecA is wider, must include it
      if (interval.inSpecAPlus) expect(interval.inSpecA).toBe(true)
      if (interval.inSpecA) expect(interval.inSpecB).toBe(true)
      if (interval.inSpecB) expect(interval.inSpecC).toBe(true)
    }
  })
})

// ── calculateGageRR ───────────────────────────────────────────────────────────

describe('calculateGageRR (MSA Gage R&R)', () => {
  it('perfect measurement system: repeatability = 0, gageRRPercent = 0, acceptable', () => {
    // Each operator measures each part identically across all trials
    const measurements = [
      [[10, 10, 10], [11, 11, 11], [12, 12, 12]], // op1
      [[10, 10, 10], [11, 11, 11], [12, 12, 12]], // op2
    ]
    const result = calculateGageRR(measurements)
    expect(result.repeatability).toBeCloseTo(0)
    expect(result.gageRRPercent).toBeCloseTo(0)
    expect(result.acceptable).toBe(true)
  })

  it('consistent operator bias: reproducibility > 0', () => {
    // op2 consistently measures 0.5 units higher than op1 on every part
    const measurements = [
      [[10, 10, 10], [11, 11, 11], [12, 12, 12]],           // op1
      [[10.5, 10.5, 10.5], [11.5, 11.5, 11.5], [12.5, 12.5, 12.5]], // op2
    ]
    const result = calculateGageRR(measurements)
    expect(result.reproducibility).toBeGreaterThan(0)
  })

  it('within-trial repeatability is zero when all trials for a part are identical', () => {
    const measurements = [
      [[10, 10], [11, 11]], // op1: each part measured twice, identical
      [[10, 10], [11, 11]], // op2
    ]
    const result = calculateGageRR(measurements)
    expect(result.repeatability).toBeCloseTo(0)
  })
})
