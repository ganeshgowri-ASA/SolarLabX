import { describe, it, expect } from 'vitest'
import {
  calculateUniformity,
  calculateTemporalStability,
  overallClassification,
  calculateSpectralMatch,
  WAVELENGTH_BANDS,
} from '../../lib/sun-simulator'
import type { ClassificationGrade, SpectralDataPoint } from '../../lib/sun-simulator'

// ─── calculateUniformity ─────────────────────────────────────────────────────

describe('calculateUniformity', () => {
  it('uniform grid: nonUniformity=0, grade=A+', () => {
    const r = calculateUniformity([[1000, 1000], [1000, 1000]])
    expect(r.nonUniformity).toBe(0)
    expect(r.grade).toBe('A+')
    expect(r.mean).toBe(1000)
  })
  it('IEC 60904-9 formula: (max−min)/(max+min)×100', () => {
    // max=1020, min=980 → 40/2000×100 = 2.0% → grade A
    const r = calculateUniformity([[980, 1020], [1000, 1000]])
    expect(r.nonUniformity).toBeCloseTo(2.0, 6)
    expect(r.grade).toBe('A')
  })
  it('grade boundary ≤1%: A+', () => {
    // max=1010, min=990 → 20/2000×100 = 1.0% → A+
    expect(calculateUniformity([[990, 1010]]).grade).toBe('A+')
  })
  it('grade boundary >1%, ≤2%: A', () => {
    // exactly 2.0% (see above)
    expect(calculateUniformity([[980, 1020]]).grade).toBe('A')
  })
  it('grade boundary >2%, ≤5%: B', () => {
    // max=1030, min=970 → 60/2000×100 = 3.0%
    expect(calculateUniformity([[970, 1030]]).grade).toBe('B')
  })
  it('grade boundary >5%, ≤10%: C', () => {
    // max=1100, min=900 → 200/2000×100 = 10.0%
    expect(calculateUniformity([[900, 1100]]).grade).toBe('C')
  })
  it('grade boundary >10%: Fail', () => {
    // max=1200, min=800 → 400/2000×100 = 20%
    expect(calculateUniformity([[800, 1200]]).grade).toBe('Fail')
  })
  it('returns correct min, max, and mean over the full grid', () => {
    const r = calculateUniformity([[900, 1100], [950, 1050]])
    expect(r.min).toBe(900)
    expect(r.max).toBe(1100)
    expect(r.mean).toBe(1000)
    expect(r.grid).toBeDefined()
  })
  it('std and cv are non-negative', () => {
    const r = calculateUniformity([[970, 1030], [990, 1010]])
    expect(r.std).toBeGreaterThanOrEqual(0)
    expect(r.cv).toBeGreaterThanOrEqual(0)
  })
})

// ─── calculateTemporalStability ───────────────────────────────────────────────

describe('calculateTemporalStability', () => {
  const ltiConstant = [{ time: 0, irradiance: 1000 }, { time: 3600, irradiance: 1000 }]

  it('constant irradiance: sti=0, lti=0, overallGrade=A+', () => {
    const stiData = [{ time: 0, irradiance: 1000 }, { time: 10, irradiance: 1000 }]
    const r = calculateTemporalStability(stiData, ltiConstant)
    expect(r.sti).toBe(0)
    expect(r.lti).toBe(0)
    expect(r.stiGrade).toBe('A+')
    expect(r.ltiGrade).toBe('A+')
    expect(r.overallGrade).toBe('A+')
  })
  it('STI formula: (max−min)/(max+min)×100', () => {
    // max=1010, min=990 → 1.0%
    const stiData = [{ time: 0, irradiance: 990 }, { time: 5, irradiance: 1010 }]
    const r = calculateTemporalStability(stiData, ltiConstant)
    expect(r.sti).toBeCloseTo(1.0, 6)
  })
  it('STI thresholds: ≤0.5→A+, ≤2→A, ≤5→B, ≤10→C', () => {
    // A+: max=1003, min=997 → 0.3%
    expect(calculateTemporalStability(
      [{ time: 0, irradiance: 997 }, { time: 5, irradiance: 1003 }], ltiConstant
    ).stiGrade).toBe('A+')
    // A: max=1010, min=990 → 1.0%
    expect(calculateTemporalStability(
      [{ time: 0, irradiance: 990 }, { time: 5, irradiance: 1010 }], ltiConstant
    ).stiGrade).toBe('A')
    // B: max=1030, min=970 → 3.0%
    expect(calculateTemporalStability(
      [{ time: 0, irradiance: 970 }, { time: 5, irradiance: 1030 }], ltiConstant
    ).stiGrade).toBe('B')
    // C: max=1060, min=940 → 6.0%
    expect(calculateTemporalStability(
      [{ time: 0, irradiance: 940 }, { time: 5, irradiance: 1060 }], ltiConstant
    ).stiGrade).toBe('C')
  })
  it('LTI threshold ≤1→A+, >1≤2→A', () => {
    // A+: max=1005, min=995 → 0.5%
    expect(calculateTemporalStability(ltiConstant,
      [{ time: 0, irradiance: 995 }, { time: 3600, irradiance: 1005 }]
    ).ltiGrade).toBe('A+')
    // A: max=1015, min=985 → 1.5% (strictly >1, ≤2)
    expect(calculateTemporalStability(ltiConstant,
      [{ time: 0, irradiance: 985 }, { time: 3600, irradiance: 1015 }]
    ).ltiGrade).toBe('A')
  })
  it('overallGrade is the worst of stiGrade and ltiGrade', () => {
    // STI=A+, LTI=B
    const r = calculateTemporalStability(
      ltiConstant,
      [{ time: 0, irradiance: 970 }, { time: 3600, irradiance: 1030 }] // lti=3% → B
    )
    expect(r.ltiGrade).toBe('B')
    expect(r.overallGrade).toBe('B')
  })
  it('result contains the input data arrays', () => {
    const stiData = [{ time: 0, irradiance: 1000 }]
    const ltiData = [{ time: 0, irradiance: 1000 }]
    const r = calculateTemporalStability(stiData, ltiData)
    expect(r.stiData).toBe(stiData)
    expect(r.ltiData).toBe(ltiData)
  })
})

// ─── overallClassification ────────────────────────────────────────────────────

describe('overallClassification', () => {
  it('all A+ → A+', () => {
    expect(overallClassification('A+', 'A+', 'A+')).toBe('A+')
  })
  it('one A among A+ grades → A', () => {
    expect(overallClassification('A+', 'A', 'A+')).toBe('A')
    expect(overallClassification('A', 'A+', 'A+')).toBe('A')
    expect(overallClassification('A+', 'A+', 'A')).toBe('A')
  })
  it('one B among better grades → B', () => {
    expect(overallClassification('B', 'A+', 'A')).toBe('B')
    expect(overallClassification('A+', 'B', 'A+')).toBe('B')
  })
  it('one C → C regardless of other grades', () => {
    expect(overallClassification('C', 'A+', 'A')).toBe('C')
    expect(overallClassification('A+', 'C', 'B')).toBe('C')
  })
  it('any Fail → Fail', () => {
    expect(overallClassification('Fail', 'A+', 'A+')).toBe('Fail')
    expect(overallClassification('A+', 'Fail', 'A+')).toBe('Fail')
    expect(overallClassification('A', 'B', 'Fail')).toBe('Fail')
  })
  it('grade ordering A+ < A < B < C < Fail is strictly enforced', () => {
    const grades: ClassificationGrade[] = ['A+', 'A', 'B', 'C', 'Fail']
    // overallClassification(grades[i], grades[j], 'A+') should always be grades[i] when i >= j
    for (let i = 0; i < grades.length; i++) {
      for (let j = 0; j <= i; j++) {
        expect(overallClassification(grades[i], grades[j], 'A+')).toBe(grades[i])
      }
    }
  })
})

// ─── calculateSpectralMatch ───────────────────────────────────────────────────

describe('calculateSpectralMatch', () => {
  function flatSpectrum(start = 400, end = 1100, step = 10, value = 1.0): SpectralDataPoint[] {
    const pts: SpectralDataPoint[] = []
    for (let wl = start; wl <= end; wl += step) pts.push({ wavelength: wl, irradiance: value })
    return pts
  }

  it('returns one SpectralBandResult per WAVELENGTH_BANDS entry (6 bands)', () => {
    const r = calculateSpectralMatch(flatSpectrum())
    expect(r.intervals).toHaveLength(WAVELENGTH_BANDS.length)
    expect(r.intervals).toHaveLength(6)
  })
  it('all band ratios are positive', () => {
    const r = calculateSpectralMatch(flatSpectrum())
    for (const band of r.intervals) {
      expect(band.ratio).toBeGreaterThan(0)
    }
  })
  it('minRatio ≤ meanRatio ≤ maxRatio', () => {
    const r = calculateSpectralMatch(flatSpectrum())
    expect(r.minRatio).toBeLessThanOrEqual(r.meanRatio)
    expect(r.meanRatio).toBeLessThanOrEqual(r.maxRatio)
  })
  it('grade is a valid ClassificationGrade string', () => {
    const r = calculateSpectralMatch(flatSpectrum())
    expect(['A+', 'A', 'B', 'C', 'Fail']).toContain(r.grade)
  })
  it('band result contains all required fields', () => {
    const r = calculateSpectralMatch(flatSpectrum())
    for (const b of r.intervals) {
      expect(b).toHaveProperty('band')
      expect(b).toHaveProperty('ratio')
      expect(b).toHaveProperty('measuredFraction')
      expect(b).toHaveProperty('referenceFraction')
      expect(typeof b.inSpecAPlus).toBe('boolean')
      expect(typeof b.inSpecA).toBe('boolean')
    }
  })
  it('inSpecA implies inSpecB implies inSpecC (containment)', () => {
    const r = calculateSpectralMatch(flatSpectrum())
    for (const b of r.intervals) {
      if (b.inSpecAPlus) expect(b.inSpecA).toBe(true)
      if (b.inSpecA) expect(b.inSpecB).toBe(true)
      if (b.inSpecB) expect(b.inSpecC).toBe(true)
    }
  })
  it('does not throw on a single-wavelength input', () => {
    expect(() => calculateSpectralMatch([{ wavelength: 550, irradiance: 1.0 }])).not.toThrow()
  })
  it('very high irradiance in one band is handled without NaN', () => {
    const data: SpectralDataPoint[] = flatSpectrum()
    // spike at 550 nm
    const idx = data.findIndex(p => p.wavelength === 550)
    data[idx] = { wavelength: 550, irradiance: 1000 }
    const r = calculateSpectralMatch(data)
    for (const b of r.intervals) {
      expect(Number.isFinite(b.ratio)).toBe(true)
      expect(Number.isNaN(b.ratio)).toBe(false)
    }
  })
})
