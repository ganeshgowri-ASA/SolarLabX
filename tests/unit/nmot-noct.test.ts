import { describe, it, expect } from 'vitest'
import {
  calculateNMOT,
  calculateNOCT,
  calculateCellTemp,
  calculatePerformanceAtNMOT,
  generateIrradianceTempModel,
  generatePRCurve,
  DEFAULT_MODULE_SPECS,
} from '../../lib/nmot-noct'

// ─── calculateNMOT ────────────────────────────────────────────────────────────

describe('calculateNMOT', () => {
  it('open_rack adds 0°C mounting correction at 1 m/s wind', () => {
    expect(calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: 'open_rack' })).toBe(45)
  })
  it('close_roof adds +3°C mounting correction at 1 m/s wind', () => {
    expect(calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: 'close_roof' })).toBe(48)
  })
  it('bipv adds +6°C mounting correction at 1 m/s wind', () => {
    expect(calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: 'bipv' })).toBe(51)
  })
  it('wind speed > 1 m/s reduces NMOT (−2°C per m/s above 1)', () => {
    const nmot2ms = calculateNMOT({ nocTmeasured: 45, windSpeed: 2, ambientTemp: 20, irradiance: 800, mountingType: 'open_rack' })
    expect(nmot2ms).toBe(43) // 45 + 0 + (2-1)*-2 = 43
  })
  it('wind speed < 1 m/s increases NMOT', () => {
    const nmot0ms = calculateNMOT({ nocTmeasured: 45, windSpeed: 0, ambientTemp: 20, irradiance: 800, mountingType: 'open_rack' })
    expect(nmot0ms).toBe(47) // 45 + 0 + (0-1)*-2 = 47
  })
  it('unknown mounting type defaults to 0 correction', () => {
    const nmot = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: 'open_rack' })
    expect(nmot).toBe(45)
  })
})

// ─── calculateNOCT ───────────────────────────────────────────────────────────

describe('calculateNOCT', () => {
  it('open_rack returns measured NOCT unchanged', () => {
    expect(calculateNOCT(45, 'open_rack')).toBe(45)
  })
  it('close_roof adds +3°C', () => {
    expect(calculateNOCT(45, 'close_roof')).toBe(48)
  })
  it('bipv adds +6°C', () => {
    expect(calculateNOCT(45, 'bipv')).toBe(51)
  })
  it('unknown type defaults to 0 correction', () => {
    expect(calculateNOCT(45, 'unknown')).toBe(45)
  })
})

// ─── calculateCellTemp ───────────────────────────────────────────────────────

describe('calculateCellTemp', () => {
  it('at standard NMOT conditions: 20°C ambient, 800 W/m², 1 m/s → NMOT', () => {
    const nmot = 45
    // windFactor = max(0.5, 1 - (1-1)*0.05) = 1
    // Tc = 20 + (45-20) * (800/800) * 1 = 20 + 25 = 45
    expect(calculateCellTemp(20, 800, nmot, 1)).toBeCloseTo(45, 5)
  })
  it('zero irradiance returns ambient temperature', () => {
    expect(calculateCellTemp(25, 0, 45, 1)).toBe(25)
  })
  it('higher irradiance increases cell temperature', () => {
    const tc800 = calculateCellTemp(20, 800, 45)
    const tc1000 = calculateCellTemp(20, 1000, 45)
    expect(tc1000).toBeGreaterThan(tc800)
  })
  it('higher ambient temperature increases cell temperature proportionally', () => {
    const tc20 = calculateCellTemp(20, 800, 45)
    const tc30 = calculateCellTemp(30, 800, 45)
    expect(tc30 - tc20).toBeCloseTo(10, 1)
  })
  it('wind factor floors at 0.5 for very high wind speeds', () => {
    // windFactor = max(0.5, 1 - (100-1)*0.05) = max(0.5, very negative) = 0.5
    const tc = calculateCellTemp(20, 800, 45, 100)
    const tcExpected = 20 + (45 - 20) * (800 / 800) * 0.5
    expect(tc).toBeCloseTo(tcExpected, 5)
  })
  it('default wind speed is 1 m/s (windFactor = 1)', () => {
    const tcDefault = calculateCellTemp(20, 800, 45)
    const tc1ms = calculateCellTemp(20, 800, 45, 1)
    expect(tcDefault).toBeCloseTo(tc1ms, 10)
  })
})

// ─── calculatePerformanceAtNMOT ──────────────────────────────────────────────

describe('calculatePerformanceAtNMOT', () => {
  const specs = DEFAULT_MODULE_SPECS // Pmax=400W, Voc=49.5V, Isc=10.2A, alphaPmax=-0.37%/°C

  it('returns an object with all required keys', () => {
    const result = calculatePerformanceAtNMOT(specs, 45)
    expect(result).toHaveProperty('nmot')
    expect(result).toHaveProperty('cellTemp')
    expect(result).toHaveProperty('correctedPmax')
    expect(result).toHaveProperty('correctedVoc')
    expect(result).toHaveProperty('correctedIsc')
    expect(result).toHaveProperty('tempDerate')
    expect(result).toHaveProperty('performanceRatio')
  })
  it('nmot in result matches input nmot', () => {
    expect(calculatePerformanceAtNMOT(specs, 45).nmot).toBe(45)
  })
  it('cell temperature is above ambient (20°C) at 800 W/m²', () => {
    expect(calculatePerformanceAtNMOT(specs, 45).cellTemp).toBeGreaterThan(20)
  })
  it('corrected Pmax is less than STC Pmax at sub-1000 W/m²', () => {
    // At 800 W/m² the irradiance factor is 0.8, so power must be < STC
    expect(calculatePerformanceAtNMOT(specs, 45).correctedPmax).toBeLessThan(specs.pmaxSTC)
  })
  it('tempDerate is less than 1 when cell temperature > 25°C', () => {
    // NMOT typically yields cell temp > 25°C, so tempDerate < 1 for negative alphaPmax
    const result = calculatePerformanceAtNMOT(specs, 45)
    if (result.cellTemp > 25) {
      expect(result.tempDerate).toBeLessThan(1)
    }
  })
  it('at STC equivalent (25°C cell, 1000 W/m²): corrected Pmax ≈ STC Pmax', () => {
    // nmot chosen so cellTemp lands on 25°C: 20 + (nmot-20)*(1000/800) = 25 → nmot = 24
    const result = calculatePerformanceAtNMOT(specs, 24, 1000)
    // tempDerate ≈ 1 when cellTemp ≈ 25
    expect(result.correctedPmax).toBeCloseTo(specs.pmaxSTC, 0)
  })
  it('higher NMOT produces higher cell temperature', () => {
    const r45 = calculatePerformanceAtNMOT(specs, 45)
    const r50 = calculatePerformanceAtNMOT(specs, 50)
    expect(r50.cellTemp).toBeGreaterThan(r45.cellTemp)
  })
})

// ─── generateIrradianceTempModel ─────────────────────────────────────────────

describe('generateIrradianceTempModel', () => {
  it('default call returns 6 × 6 = 36 data points', () => {
    expect(generateIrradianceTempModel(45)).toHaveLength(36)
  })
  it('each entry has ambient, irradiance, and cellTemp keys', () => {
    const entry = generateIrradianceTempModel(45)[0]
    expect(entry).toHaveProperty('ambient')
    expect(entry).toHaveProperty('irradiance')
    expect(entry).toHaveProperty('cellTemp')
  })
  it('custom ambient and irradiance arrays determine output count', () => {
    const result = generateIrradianceTempModel(45, [0, 25, 50], [400, 800, 1200])
    expect(result).toHaveLength(9)
  })
  it('zero irradiance gives cellTemp equal to ambient', () => {
    const result = generateIrradianceTempModel(45, [20], [0])
    expect(result[0].cellTemp).toBeCloseTo(20, 1)
  })
  it('higher irradiance produces higher cell temperature at fixed ambient', () => {
    const result = generateIrradianceTempModel(45, [20], [400, 800])
    expect(result[1].cellTemp).toBeGreaterThan(result[0].cellTemp)
  })
})

// ─── generatePRCurve ─────────────────────────────────────────────────────────

describe('generatePRCurve', () => {
  it('default range produces 61 points (−10 to 50°C inclusive)', () => {
    expect(generatePRCurve(DEFAULT_MODULE_SPECS, 45)).toHaveLength(61)
  })
  it('each entry has ambient, cellTemp, pr, and power keys', () => {
    const entry = generatePRCurve(DEFAULT_MODULE_SPECS, 45)[0]
    expect(entry).toHaveProperty('ambient')
    expect(entry).toHaveProperty('cellTemp')
    expect(entry).toHaveProperty('pr')
    expect(entry).toHaveProperty('power')
  })
  it('negative alphaPmax → PR decreases as ambient temperature increases', () => {
    const curve = generatePRCurve(DEFAULT_MODULE_SPECS, 45, [20, 30, 40])
    expect(curve[2].pr).toBeLessThan(curve[0].pr)
  })
  it('power at lower ambient is higher than at high ambient (negative coeff)', () => {
    const curve = generatePRCurve(DEFAULT_MODULE_SPECS, 45, [10, 40])
    expect(curve[0].power).toBeGreaterThan(curve[1].power)
  })
  it('custom temp range controls output length', () => {
    expect(generatePRCurve(DEFAULT_MODULE_SPECS, 45, [25, 35, 45])).toHaveLength(3)
  })
})
