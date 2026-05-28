import { describe, it, expect } from 'vitest'
import {
  correctPmaxToSTC,
  calculateNMOT,
  generateIrradianceTempModel,
  extractIVParameters,
  DEFAULT_TEMP_COEFFICIENTS,
} from '../../lib/iv-curve'
import type { IVDataPoint } from '../../lib/iv-curve'

// ─── DEFAULT_TEMP_COEFFICIENTS (regression guard) ────────────────────────────

describe('DEFAULT_TEMP_COEFFICIENTS', () => {
  it('tempCoeffPmax = -0.35 %/°C (IEC 60904-1 typical)', () => {
    expect(DEFAULT_TEMP_COEFFICIENTS.tempCoeffPmax).toBe(-0.35)
  })
  it('tempCoeffVoc = -0.30 %/°C', () => {
    expect(DEFAULT_TEMP_COEFFICIENTS.tempCoeffVoc).toBe(-0.30)
  })
  it('tempCoeffIsc = +0.05 %/°C', () => {
    expect(DEFAULT_TEMP_COEFFICIENTS.tempCoeffIsc).toBe(0.05)
  })
  it('aliases gammaPmax/betaVoc/alphaIsc match primary coefficients', () => {
    expect(DEFAULT_TEMP_COEFFICIENTS.gammaPmax).toBe(DEFAULT_TEMP_COEFFICIENTS.tempCoeffPmax)
    expect(DEFAULT_TEMP_COEFFICIENTS.betaVoc).toBe(DEFAULT_TEMP_COEFFICIENTS.tempCoeffVoc)
    expect(DEFAULT_TEMP_COEFFICIENTS.alphaIsc).toBe(DEFAULT_TEMP_COEFFICIENTS.tempCoeffIsc)
  })
  it('nmot and noct default to 45 °C', () => {
    expect(DEFAULT_TEMP_COEFFICIENTS.nmot).toBe(45)
    expect(DEFAULT_TEMP_COEFFICIENTS.noct).toBe(45)
  })
})

// ─── correctPmaxToSTC ────────────────────────────────────────────────────────

describe('correctPmaxToSTC', () => {
  it('at STC (G=1000, T=25) returns pmax unchanged', () => {
    expect(correctPmaxToSTC(300, 1000, 25, -0.35)).toBeCloseTo(300, 2)
  })
  it('G=800, T=25: irradiance correction 1000/800 = 1.25', () => {
    expect(correctPmaxToSTC(250, 800, 25, -0.35)).toBeCloseTo(312.5, 2)
  })
  it('G=1000, T=45: negative tempCoeff boosts corrected power (colder at STC)', () => {
    // tempCorrection = 1 + (-0.35/100) × (25 - 45) = 1 + 0.07 = 1.07
    expect(correctPmaxToSTC(250, 1000, 45, -0.35)).toBeCloseTo(250 * 1.07, 2)
  })
  it('G=1000, T=10: positive delta reduces corrected power (warmer at STC)', () => {
    // tempCorrection = 1 + (-0.35/100) × (25 - 10) = 1 - 0.0525 = 0.9475
    expect(correctPmaxToSTC(300, 1000, 10, -0.35)).toBeCloseTo(300 * 0.9475, 2)
  })
  it('combined G=800, T=35: both corrections applied', () => {
    // irr: 1000/800 = 1.25; temp: 1 + (-0.35/100) × (25-35) = 1.035
    const expected = parseFloat((250 * 1.25 * 1.035).toFixed(2))
    expect(correctPmaxToSTC(250, 800, 35, -0.35)).toBe(expected)
  })
  it('zero irradiance or zero pmax returns 0', () => {
    expect(correctPmaxToSTC(0, 1000, 25, -0.35)).toBe(0)
  })
})

// ─── calculateNMOT ───────────────────────────────────────────────────────────

describe('calculateNMOT', () => {
  it('at NMOT reference (T_amb=20, G=800) module temp = nmot', () => {
    // T_mod = 20 + (45 - 20) × 800/800 = 45
    const r = calculateNMOT({ tAmbient: 20, irradiance: 800, windSpeed: 1, nmot: 45, tempCoeffPmax: -0.35, pmax_stc: 400 })
    expect(r.moduleTemp).toBeCloseTo(45, 1)
  })
  it('Ross model: T_mod = T_amb + (nmot - 20) × G / 800', () => {
    const nmot = 46
    const G = 1000
    const tAmb = 25
    const expected = tAmb + (nmot - 20) * G / 800
    const r = calculateNMOT({ tAmbient: tAmb, irradiance: G, windSpeed: 1, nmot, tempCoeffPmax: -0.35, pmax_stc: 400 })
    expect(r.moduleTemp).toBeCloseTo(expected, 1)
  })
  it('pmaxAtNMOT = pmax_stc × (1 + tc/100 × (T_mod − 25))', () => {
    const pmax_stc = 400
    const tc = -0.35
    const r = calculateNMOT({ tAmbient: 20, irradiance: 800, windSpeed: 1, nmot: 45, tempCoeffPmax: tc, pmax_stc })
    // T_mod = 45 → tempDelta = 20
    const expected = pmax_stc * (1 + tc / 100 * 20)
    expect(r.pmaxAtNMOT).toBeCloseTo(expected, 1)
  })
  it('thermalLoss = |tempCoeffPmax × tempDelta| (percent)', () => {
    const r = calculateNMOT({ tAmbient: 20, irradiance: 800, windSpeed: 1, nmot: 45, tempCoeffPmax: -0.35, pmax_stc: 400 })
    // tempDelta = 45 − 25 = 20; loss = |-0.35 × 20| = 7.0%
    expect(r.thermalLoss).toBeCloseTo(7.0, 1)
  })
  it('tempDelta = moduleTemp − 25', () => {
    const r = calculateNMOT({ tAmbient: 20, irradiance: 800, windSpeed: 1, nmot: 45, tempCoeffPmax: -0.35, pmax_stc: 400 })
    expect(r.tempDelta).toBeCloseTo(r.moduleTemp - 25, 1)
  })
  it('higher irradiance increases module temperature', () => {
    const base = { tAmbient: 20, windSpeed: 1, nmot: 45, tempCoeffPmax: -0.35, pmax_stc: 400 }
    const low = calculateNMOT({ ...base, irradiance: 400 })
    const high = calculateNMOT({ ...base, irradiance: 1000 })
    expect(high.moduleTemp).toBeGreaterThan(low.moduleTemp)
  })
})

// ─── generateIrradianceTempModel ─────────────────────────────────────────────

describe('generateIrradianceTempModel', () => {
  it('generates 11 points: G = 200 to 1200 in 100 W/m² steps', () => {
    const data = generateIrradianceTempModel(45, 400, -0.35)
    expect(data).toHaveLength(11)
    expect(data[0].irradiance).toBe(200)
    expect(data[10].irradiance).toBe(1200)
  })
  it('irradiance increments are exactly 100 W/m²', () => {
    const data = generateIrradianceTempModel(45, 400, -0.35)
    for (let i = 1; i < data.length; i++) {
      expect(data[i].irradiance - data[i - 1].irradiance).toBe(100)
    }
  })
  it('module temperature increases with irradiance (Ross model)', () => {
    const data = generateIrradianceTempModel(45, 400, -0.35)
    for (let i = 1; i < data.length; i++) {
      expect(data[i].moduleTemp).toBeGreaterThan(data[i - 1].moduleTemp)
    }
  })
  it('pr is defined as power / (pmax_stc × G/1000)', () => {
    const pmax_stc = 400
    const data = generateIrradianceTempModel(45, pmax_stc, -0.35)
    for (const d of data) {
      const expected = d.power / (pmax_stc * d.irradiance / 1000)
      expect(d.pr).toBeCloseTo(expected, 3)
    }
  })
  it('power at G=1000 equals pmaxAtNMOT from calculateNMOT with same params', () => {
    const data = generateIrradianceTempModel(45, 400, -0.35)
    const pt1000 = data.find(d => d.irradiance === 1000)!
    const nmotResult = calculateNMOT({ tAmbient: 25, irradiance: 1000, windSpeed: 1, nmot: 45, tempCoeffPmax: -0.35, pmax_stc: 400 })
    expect(pt1000.power).toBeCloseTo(nmotResult.pmaxAtNMOT, 1)
  })
})

// ─── extractIVParameters ─────────────────────────────────────────────────────

describe('extractIVParameters', () => {
  it('empty array returns all-zero result', () => {
    const r = extractIVParameters([])
    expect(r.voc).toBe(0)
    expect(r.isc).toBe(0)
    expect(r.pmax).toBe(0)
    expect(r.ff).toBe(0)
  })
  it('Isc is taken from the first point (V=0)', () => {
    const points: IVDataPoint[] = [
      { voltage: 0, current: 9.5, power: 0 },
      { voltage: 20, current: 9.0, power: 180 },
      { voltage: 40, current: 0, power: 0 },
    ]
    expect(extractIVParameters(points).isc).toBe(9.5)
  })
  it('Voc is taken from the last point', () => {
    const points: IVDataPoint[] = [
      { voltage: 0, current: 9.5, power: 0 },
      { voltage: 20, current: 9.0, power: 180 },
      { voltage: 40, current: 0, power: 0 },
    ]
    expect(extractIVParameters(points).voc).toBe(40)
  })
  it('Pmax and fill factor are extracted correctly', () => {
    const points: IVDataPoint[] = [
      { voltage: 0, current: 10, power: 0 },
      { voltage: 30, current: 9, power: 270 },   // MPP
      { voltage: 40, current: 0, power: 0 },
    ]
    const r = extractIVParameters(points)
    expect(r.pmax).toBe(270)
    expect(r.vmpp).toBe(30)
    expect(r.impp).toBe(9)
    // FF = 270 / (40 × 10) = 0.675
    expect(r.ff).toBeCloseTo(0.675, 3)
  })
  it('FF is in range (0, 1] for a valid IV curve', () => {
    const points: IVDataPoint[] = [
      { voltage: 0, current: 9.5, power: 0 },
      { voltage: 35, current: 8.8, power: 308 },
      { voltage: 45, current: 0, power: 0 },
    ]
    const r = extractIVParameters(points)
    expect(r.ff).toBeGreaterThan(0)
    expect(r.ff).toBeLessThanOrEqual(1)
  })
})
