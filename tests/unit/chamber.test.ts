import { describe, it, expect } from 'vitest'
import {
  calculateVolume,
  calculateCoolingCapacity,
  calculateHeatingCapacity,
  calculateUVSystem,
  generateChamberSpec,
  compareChambers,
  STANDARD_TEST_PROFILES,
} from '@/lib/chamber'

// ── calculateVolume ──────────────────────────────────────────────────────────
describe('calculateVolume', () => {
  it('1000×1000×1000 mm = 1.0 m³', () => {
    expect(calculateVolume({ length: 1000, width: 1000, height: 1000 })).toBeCloseTo(1.0, 6)
  })

  it('2000×1500×1200 mm = 3.6 m³', () => {
    expect(calculateVolume({ length: 2000, width: 1500, height: 1200 })).toBeCloseTo(3.6, 6)
  })

  it('returns 0 when any dimension is 0', () => {
    expect(calculateVolume({ length: 0, width: 1000, height: 1000 })).toBe(0)
    expect(calculateVolume({ length: 1000, width: 0, height: 1000 })).toBe(0)
  })

  it('scales linearly with each dimension', () => {
    const base  = calculateVolume({ length: 1000, width: 1000, height: 1000 })
    const twoX  = calculateVolume({ length: 2000, width: 1000, height: 1000 })
    expect(twoX).toBeCloseTo(base * 2, 6)
  })
})

// ── calculateCoolingCapacity ─────────────────────────────────────────────────
describe('calculateCoolingCapacity', () => {
  it('returns a positive value for standard TC parameters (1 m³, -40°C, 1.67°C/min)', () => {
    expect(calculateCoolingCapacity(1.0, -40, 1.67)).toBeGreaterThan(0)
  })

  it('larger chamber volume requires more cooling', () => {
    const c1 = calculateCoolingCapacity(1.0, -40, 1.67)
    const c2 = calculateCoolingCapacity(3.0, -40, 1.67)
    expect(c2).toBeGreaterThan(c1)
  })

  it('higher ramp rate increases cooling demand', () => {
    const slow = calculateCoolingCapacity(1.0, -40, 1.0)
    const fast = calculateCoolingCapacity(1.0, -40, 3.0)
    expect(fast).toBeGreaterThan(slow)
  })

  it('lower target temperature increases cooling demand', () => {
    const less  = calculateCoolingCapacity(1.0, -20, 1.67)
    const more  = calculateCoolingCapacity(1.0, -40, 1.67)
    expect(more).toBeGreaterThan(less)
  })

  it('result is rounded to one decimal place', () => {
    const cap = calculateCoolingCapacity(1.0, -40, 1.67)
    expect(Math.abs(cap - Math.round(cap * 10) / 10)).toBeLessThan(0.001)
  })
})

// ── calculateHeatingCapacity ─────────────────────────────────────────────────
describe('calculateHeatingCapacity', () => {
  it('returns a positive value for standard DH parameters (1 m³, 85°C, 0°C/min)', () => {
    expect(calculateHeatingCapacity(1.0, 85, 0)).toBeGreaterThan(0)
  })

  it('larger chamber volume requires more heating', () => {
    const h1 = calculateHeatingCapacity(1.0, 85, 1.67)
    const h2 = calculateHeatingCapacity(3.0, 85, 1.67)
    expect(h2).toBeGreaterThan(h1)
  })

  it('higher target temperature requires more heating', () => {
    const h60 = calculateHeatingCapacity(1.0, 60, 1.67)
    const h85 = calculateHeatingCapacity(1.0, 85, 1.67)
    expect(h85).toBeGreaterThan(h60)
  })

  it('higher ramp rate increases heating demand', () => {
    const slow = calculateHeatingCapacity(1.0, 85, 1.0)
    const fast = calculateHeatingCapacity(1.0, 85, 3.0)
    expect(fast).toBeGreaterThan(slow)
  })

  it('result is rounded to one decimal place', () => {
    const cap = calculateHeatingCapacity(1.0, 85, 1.67)
    expect(Math.abs(cap - Math.round(cap * 10) / 10)).toBeLessThan(0.001)
  })
})

// ── calculateUVSystem ────────────────────────────────────────────────────────
describe('calculateUVSystem', () => {
  it('1 m² → 20 LEDs (⌈1/0.05⌉ = 20)', () => {
    expect(calculateUVSystem(1.0, 250).ledCount).toBe(20)
  })

  it('1 m² → 1.70 kW total power (20 × 0.085)', () => {
    expect(calculateUVSystem(1.0, 250).totalPower).toBeCloseTo(1.70, 2)
  })

  it('uniformity is always 8.5% regardless of area', () => {
    expect(calculateUVSystem(0.5,  250).uniformity).toBe(8.5)
    expect(calculateUVSystem(2.0,  250).uniformity).toBe(8.5)
    expect(calculateUVSystem(10.0, 250).uniformity).toBe(8.5)
  })

  it('larger area needs proportionally more LEDs', () => {
    const uv1 = calculateUVSystem(1.0, 250)
    const uv2 = calculateUVSystem(2.0, 250)
    expect(uv2.ledCount).toBeGreaterThan(uv1.ledCount)
  })

  it('total power scales with LED count', () => {
    const uv = calculateUVSystem(2.0, 250)
    expect(uv.totalPower).toBeCloseTo(uv.ledCount * 0.085, 2)
  })
})

// ── STANDARD_TEST_PROFILES ───────────────────────────────────────────────────
describe('STANDARD_TEST_PROFILES', () => {
  it('defines exactly 6 standard IEC 61215 profiles', () => {
    expect(STANDARD_TEST_PROFILES).toHaveLength(6)
  })

  it('TC profile: 200 cycles, -40°C min, 85°C max per IEC 61215 MQT 11', () => {
    const tc = STANDARD_TEST_PROFILES.find((p) => p.testType === 'TC')!
    expect(tc).toBeDefined()
    expect(tc.cycles).toBe(200)
    expect(tc.params.tempMin).toBe(-40)
    expect(tc.params.tempMax).toBe(85)
    expect(tc.standard).toContain('61215')
  })

  it('DH profile: 85°C / 85%RH per IEC 61215 MQT 13', () => {
    const dh = STANDARD_TEST_PROFILES.find((p) => p.testType === 'DH')!
    expect(dh).toBeDefined()
    expect(dh.params.tempMin).toBe(85)
    expect(dh.params.humidityMax).toBe(85)
    expect(dh.standard).toContain('MQT 13')
  })

  it('HF profile: 10 humidity-freeze cycles per IEC 61215 MQT 12', () => {
    const hf = STANDARD_TEST_PROFILES.find((p) => p.testType === 'HF')!
    expect(hf).toBeDefined()
    expect(hf.cycles).toBe(10)
    expect(hf.params.tempMin).toBe(-40)
  })

  it('UV profile has non-zero UV intensity', () => {
    const uv = STANDARD_TEST_PROFILES.find((p) => p.testType === 'UV')!
    expect(uv).toBeDefined()
    expect(uv.params.uvIntensity).toBeGreaterThan(0)
  })

  it('full combined profile (UV+TC+HF+DH) enables all test parameters', () => {
    const full = STANDARD_TEST_PROFILES.find((p) => p.testType === 'UV+TC+HF+DH')!
    expect(full).toBeDefined()
    expect(full.params.uvIntensity).toBeGreaterThan(0)
    expect(full.params.humidityMax).toBeGreaterThan(0)
    expect(full.params.tempMin).toBeLessThan(0)
  })

  it('all profiles have a non-empty duration string', () => {
    for (const profile of STANDARD_TEST_PROFILES) {
      expect(profile.duration).toBeTruthy()
    }
  })
})

// ── generateChamberSpec ──────────────────────────────────────────────────────
describe('generateChamberSpec', () => {
  const DIMS = { length: 2000, width: 1500, height: 1500 }
  const TC_DH_PROFILES = STANDARD_TEST_PROFILES.filter((p) =>
    ['TC', 'DH'].includes(p.testType)
  )
  const spec = generateChamberSpec('Test TC+DH Chamber', DIMS, TC_DH_PROFILES)

  it('preserves the provided name', () => {
    expect(spec.name).toBe('Test TC+DH Chamber')
  })

  it('volume matches calculateVolume for the same dimensions', () => {
    expect(spec.volume).toBeCloseTo((2000 * 1500 * 1500) / 1e9, 3)
  })

  it('cooling capacity is positive', () => {
    expect(spec.coolingCapacity).toBeGreaterThan(0)
  })

  it('heating capacity is positive', () => {
    expect(spec.heatingCapacity).toBeGreaterThan(0)
  })

  it('no UV LEDs when no UV profile is selected', () => {
    expect(spec.uvLedCount).toBe(0)
    expect(spec.uvPower).toBe(0)
  })

  it('UV LEDs are present when a UV profile is selected', () => {
    const uvProfiles = STANDARD_TEST_PROFILES.filter((p) =>
      ['UV', 'UV+TC+HF+DH'].includes(p.testType)
    )
    const uvSpec = generateChamberSpec('UV Chamber', DIMS, uvProfiles)
    expect(uvSpec.uvLedCount).toBeGreaterThan(0)
  })

  it('total cost in INR is positive', () => {
    expect(spec.estimatedCost.totalINR).toBeGreaterThan(0)
    expect(spec.estimatedCost.totalLakhs).toBeGreaterThan(0)
  })

  it('cost.totalINR = totalLakhs × 100000', () => {
    expect(spec.estimatedCost.totalINR).toBeCloseTo(
      spec.estimatedCost.totalLakhs * 100000, 0
    )
  })

  it('includes humidity feature when DH profile present', () => {
    const hasHumidity = spec.features.some((f) => /humidity/i.test(f))
    expect(hasHumidity).toBe(true)
  })

  it('includes cascade refrigeration feature for sub-zero TC', () => {
    const hasCascade = spec.features.some((f) => /cascade/i.test(f))
    expect(hasCascade).toBe(true)
  })

  it('includes PLC control system feature', () => {
    const hasPLC = spec.features.some((f) => /PLC/i.test(f))
    expect(hasPLC).toBe(true)
  })

  it('testProfiles array matches the input', () => {
    expect(spec.testProfiles).toHaveLength(TC_DH_PROFILES.length)
  })

  it('cost breakdown items are all non-negative', () => {
    for (const item of spec.estimatedCost.items) {
      expect(item.cost).toBeGreaterThanOrEqual(0)
    }
  })
})

// ── compareChambers ──────────────────────────────────────────────────────────
describe('compareChambers', () => {
  const dimsLarge = { length: 2000, width: 1500, height: 1500 }
  const dimsSmall = { length: 1000, width: 1000, height: 1000 }
  const profiles  = [STANDARD_TEST_PROFILES[0]] // TC only

  const specA = generateChamberSpec('Large Chamber', dimsLarge, profiles)
  const specB = generateChamberSpec('Small Chamber', dimsSmall, profiles)
  const comparison = compareChambers(specA, specB)

  it('returns exactly 6 comparison rows', () => {
    expect(comparison).toHaveLength(6)
  })

  it('Volume advantage goes to the larger chamber (A)', () => {
    const row = comparison.find((r) => r.parameter === 'Volume')!
    expect(row.advantage).toBe('A')
  })

  it('Cost advantage goes to the cheaper (smaller) chamber (B)', () => {
    const row = comparison.find((r) => r.parameter === 'Estimated Cost')!
    expect(row.advantage).toBe('B')
  })

  it('identical chamber compared with itself produces "equal" for all rows', () => {
    for (const row of compareChambers(specA, specA)) {
      expect(row.advantage).toBe('equal')
    }
  })

  it('every row has specA and specB strings populated', () => {
    for (const row of comparison) {
      expect(row.specA).toBeTruthy()
      expect(row.specB).toBeTruthy()
    }
  })

  it('advantage is always one of A | B | equal', () => {
    for (const row of comparison) {
      expect(['A', 'B', 'equal']).toContain(row.advantage)
    }
  })
})
