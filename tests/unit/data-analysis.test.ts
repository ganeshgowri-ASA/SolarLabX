import { describe, it, expect } from 'vitest'
import { calculateStatistics, generateHistogram } from '@/lib/data-analysis'

describe('calculateStatistics', () => {
  it('returns all zeros for empty array', () => {
    const r = calculateStatistics([], 0, 100)
    expect(r.count).toBe(0)
    expect(r.mean).toBe(0)
    expect(r.stdDev).toBe(0)
    expect(r.cp).toBe(0)
    expect(r.cpk).toBe(0)
  })

  it('computes correct mean', () => {
    const r = calculateStatistics([10, 20, 30], 0, 40)
    expect(r.mean).toBe(20)
    expect(r.count).toBe(3)
  })

  it('uses Bessel correction: stdDev([0,2,4]) = 2.0', () => {
    // variance = (4+0+4)/(3-1) = 4, std = 2
    const r = calculateStatistics([0, 2, 4], 0, 10)
    expect(r.stdDev).toBeCloseTo(2.0, 4)
  })

  it('Cp = (usl-lsl)/(6*stdDev)', () => {
    // [48,50,52]: stdDev=2, cp=(60-40)/(6*2)=1.6667
    const r = calculateStatistics([48, 50, 52], 40, 60)
    expect(r.cp).toBeCloseTo(20 / (6 * 2), 3)
  })

  it('Cpk < Cp for off-center process', () => {
    // [60,65,70]: mean=65, lsl=50, usl=100 → cplower < cpupper
    const r = calculateStatistics([60, 65, 70], 50, 100)
    expect(r.cpk).toBeLessThan(r.cp)
  })

  it('Cpk ≈ Cp for centered process', () => {
    // [48,50,52]: mean=50 = center of [0,100]
    const r = calculateStatistics([48, 50, 52], 0, 100)
    expect(Math.abs(r.cpk - r.cp)).toBeLessThan(0.01)
  })

  it('returns correct min, max, and even-n median', () => {
    // sorted [1,1,2,3,4,5,6,9] → median = (3+4)/2 = 3.5
    const r = calculateStatistics([3, 1, 4, 1, 5, 9, 2, 6], 0, 10)
    expect(r.min).toBe(1)
    expect(r.max).toBe(9)
    expect(r.median).toBe(3.5)
  })

  it('cp and cpk are 0 when stdDev is 0 (all-equal values)', () => {
    const r = calculateStatistics([5, 5, 5], 0, 10)
    expect(r.cp).toBe(0)
    expect(r.cpk).toBe(0)
  })
})

describe('generateHistogram', () => {
  it('returns [] for empty input', () => {
    expect(generateHistogram([])).toEqual([])
  })

  it('returns requested number of bins', () => {
    const bins = generateHistogram([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)
    expect(bins).toHaveLength(5)
  })

  it('defaults to 10 bins', () => {
    const values = Array.from({ length: 50 }, (_, i) => i + 1)
    expect(generateHistogram(values)).toHaveLength(10)
  })

  it('total count across bins equals input length', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const bins = generateHistogram(values, 4)
    const total = bins.reduce((s, b) => s + b.count, 0)
    expect(total).toBe(values.length)
  })

  it('handles single value without throwing', () => {
    const bins = generateHistogram([42])
    const total = bins.reduce((s, b) => s + b.count, 0)
    expect(total).toBe(1)
  })

  it('each bin has a range string and numeric midpoint', () => {
    const bins = generateHistogram([10, 20, 30], 3)
    for (const bin of bins) {
      expect(typeof bin.range).toBe('string')
      expect(bin.range).toMatch(/[\d.]+-[\d.]+/)
      expect(typeof bin.midpoint).toBe('number')
    }
  })
})
