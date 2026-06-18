import { describe, it, expect } from 'vitest'
import {
  calculateVolume,
  calculateCoolingCapacity,
  calculateHeatingCapacity,
  calculateUVSystem,
  compareChambers,
  generateChamberSpec,
  STANDARD_TEST_PROFILES,
} from '@/lib/chamber'

const TC_PROFILES = STANDARD_TEST_PROFILES.filter((p) => p.testType === 'TC')

describe('calculateVolume', () => {
  it('1 000 × 1 000 × 1 000 mm = 1.0 m³', () => {
    expect(calculateVolume({ length: 1000, width: 1000, height: 1000 })).toBeCloseTo(1.0, 9)
  })

  it('2 000 × 1 500 × 1 000 mm = 3.0 m³', () => {
    expect(calculateVolume({ length: 2000, width: 1500, height: 1000 })).toBeCloseTo(3.0, 9)
  })

  it('doubles when length doubles', () => {
    const v1 = calculateVolume({ length: 1000, width: 1000, height: 1000 })
    const v2 = calculateVolume({ length: 2000, width: 1000, height: 1000 })
    expect(v2).toBeCloseTo(v1 * 2, 9)
  })
})

describe('calculateCoolingCapacity', () => {
  it('returns positive capacity for TC chamber (−40 °C, 1.67 °C/min)', () => {
    const vol = calculateVolume({ length: 2000, width: 1500, height: 1000 })
    expect(calculateCoolingCapacity(vol, -40, 1.67)).toBeGreaterThan(0)
  })

  it('lower tempMin demands higher capacity', () => {
    const vol = 2.0
    const c1 = calculateCoolingCapacity(vol, -20, 1.0)
    const c2 = calculateCoolingCapacity(vol, -40, 1.0)
    expect(c2).toBeGreaterThan(c1)
  })

  it('higher rampRate demands higher capacity', () => {
    const vol = 2.0
    const c1 = calculateCoolingCapacity(vol, -40, 1.0)
    const c2 = calculateCoolingCapacity(vol, -40, 2.0)
    expect(c2).toBeGreaterThan(c1)
  })

  it('result is rounded to 0.1 precision (Math.ceil)', () => {
    const vol = 1.0
    const result = calculateCoolingCapacity(vol, -40, 1.67)
    expect(result).toBe(Math.ceil(result * 10) / 10)
  })
})

describe('calculateHeatingCapacity', () => {
  it('returns positive capacity for tempMax = 85 °C', () => {
    const vol = calculateVolume({ length: 2000, width: 1500, height: 1000 })
    expect(calculateHeatingCapacity(vol, 85, 1.67)).toBeGreaterThan(0)
  })

  it('higher tempMax demands higher heating capacity', () => {
    const vol = 2.0
    const h1 = calculateHeatingCapacity(vol, 70, 1.0)
    const h2 = calculateHeatingCapacity(vol, 85, 1.0)
    expect(h2).toBeGreaterThan(h1)
  })

  it('result is rounded to 0.1 precision', () => {
    const vol = 2.0
    const result = calculateHeatingCapacity(vol, 85, 1.67)
    expect(result).toBe(Math.ceil(result * 10) / 10)
  })
})

describe('calculateUVSystem', () => {
  it('ledCount = ⌈area / 0.05⌉', () => {
    const area = 2.0
    expect(calculateUVSystem(area, 250).ledCount).toBe(Math.ceil(area / 0.05))
  })

  it('totalPower = ledCount × 0.085 (rounded to 2 dp)', () => {
    const area = 3.0
    const { ledCount, totalPower } = calculateUVSystem(area, 250)
    expect(totalPower).toBeCloseTo(Math.round(ledCount * 0.085 * 100) / 100, 2)
  })

  it('uniformity is always 8.5 %', () => {
    expect(calculateUVSystem(1.0, 100).uniformity).toBe(8.5)
    expect(calculateUVSystem(4.0, 300).uniformity).toBe(8.5)
  })

  it('more area → more LEDs', () => {
    const small = calculateUVSystem(1.0, 250)
    const large = calculateUVSystem(4.0, 250)
    expect(large.ledCount).toBeGreaterThan(small.ledCount)
  })
})

describe('compareChambers', () => {
  it('returns exactly 6 comparison parameters', () => {
    const dims = { length: 2000, width: 1500, height: 1000 }
    const a = generateChamberSpec('A', dims, TC_PROFILES)
    const b = generateChamberSpec('B', { length: 1000, width: 1000, height: 1000 }, TC_PROFILES)
    expect(compareChambers(a, b)).toHaveLength(6)
  })

  it('includes Volume, Cooling Capacity, and Estimated Cost parameters', () => {
    const dims = { length: 2000, width: 1500, height: 1000 }
    const a = generateChamberSpec('A', dims, TC_PROFILES)
    const b = generateChamberSpec('B', { length: 1000, width: 1000, height: 1000 }, TC_PROFILES)
    const params = compareChambers(a, b).map((r) => r.parameter)
    expect(params).toContain('Volume')
    expect(params).toContain('Cooling Capacity')
    expect(params).toContain('Estimated Cost')
  })

  it('larger chamber wins Volume comparison (advantage = "A")', () => {
    const large = generateChamberSpec('A', { length: 2000, width: 1500, height: 1000 }, TC_PROFILES)
    const small = generateChamberSpec('B', { length: 1000, width: 1000, height: 1000 }, TC_PROFILES)
    const volumeRow = compareChambers(large, small).find((r) => r.parameter === 'Volume')!
    expect(volumeRow.advantage).toBe('A')
  })

  it('identical dims → advantage = "equal" for Volume', () => {
    const dims = { length: 1500, width: 1200, height: 800 }
    const a = generateChamberSpec('A', dims, TC_PROFILES)
    const b = generateChamberSpec('B', dims, TC_PROFILES)
    const volumeRow = compareChambers(a, b).find((r) => r.parameter === 'Volume')!
    expect(volumeRow.advantage).toBe('equal')
  })

  it('specA and specB strings are non-empty', () => {
    const dims = { length: 2000, width: 1500, height: 1000 }
    const a = generateChamberSpec('A', dims, TC_PROFILES)
    const b = generateChamberSpec('B', { length: 1000, width: 1000, height: 1000 }, TC_PROFILES)
    for (const row of compareChambers(a, b)) {
      expect(row.specA.length).toBeGreaterThan(0)
      expect(row.specB.length).toBeGreaterThan(0)
    }
  })
})
