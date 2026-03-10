// IV Curve Analysis utilities for Solar PV testing

export interface IVDataPoint {
  voltage: number
  current: number
  power: number
}

export interface IVCurveData {
  id: string
  label: string
  color: string
  dataPoints: IVDataPoint[]
  voc: number
  isc: number
  pmax: number
  vmpp: number
  impp: number
  ff: number
  efficiency: number
  area: number // module area m²
  irradiance: number // W/m²
  temperature: number // °C
  rSeries: number // series resistance Ω
  rShunt: number // shunt resistance Ω
  ideality: number // diode ideality factor
}

export interface NMOTInputs {
  tAmbient: number // ambient temperature °C
  irradiance: number // W/m²
  windSpeed: number // m/s
  nmot: number // nominal module operating temp °C (typically 43-48)
  tempCoeffPmax: number // %/°C (typically -0.3 to -0.5)
  pmax_stc: number // rated power at STC
}

export interface NMOTResult {
  moduleTemp: number
  pmaxAtNMOT: number
  performanceRatio: number
  thermalLoss: number // percentage
  tempDelta: number
}

// Generate a realistic IV curve using single-diode model
export function generateIVCurve(
  isc: number,
  voc: number,
  impp: number,
  vmpp: number,
  numPoints: number = 100,
): IVDataPoint[] {
  const points: IVDataPoint[] = []

  // Simplified single-diode model parameters
  const il = isc // photo-generated current ≈ Isc
  const vt = 0.026 * (voc / (Math.log(isc / 0.0000001))) // thermal voltage approximation
  const io = isc / (Math.exp(voc / vt) - 1) // reverse saturation current

  for (let i = 0; i <= numPoints; i++) {
    const v = (voc * 1.05) * (i / numPoints) // voltage from 0 to slightly beyond Voc
    let current = il - io * (Math.exp(v / vt) - 1)
    if (current < 0) current = 0
    if (v > voc) current = 0

    points.push({
      voltage: parseFloat(v.toFixed(4)),
      current: parseFloat(current.toFixed(4)),
      power: parseFloat((v * current).toFixed(4)),
    })
  }

  return points
}

// Calculate series resistance from IV curve
export function calcSeriesResistance(voc: number, vmpp: number, impp: number, isc: number): number {
  // Approximate Rs from slope near Voc
  return parseFloat(((voc - vmpp) / impp - (voc - vmpp) / (isc - impp) * 0.5).toFixed(4))
}

// Calculate shunt resistance from IV curve
export function calcShuntResistance(voc: number, isc: number, points: IVDataPoint[]): number {
  // Approximate Rsh from slope near Isc (low voltage region)
  if (points.length < 5) return 1000
  const p1 = points[0]
  const p2 = points[Math.min(5, points.length - 1)]
  const dv = p2.voltage - p1.voltage
  const di = p1.current - p2.current
  if (di === 0) return 10000
  return parseFloat(Math.abs(dv / di).toFixed(2))
}

// Calculate diode ideality factor
export function calcIdealityFactor(voc: number, isc: number, vmpp: number, impp: number, temp: number): number {
  const k = 1.381e-23 // Boltzmann constant
  const q = 1.602e-19 // electron charge
  const T = temp + 273.15 // convert to Kelvin
  const vt = k * T / q
  // Simplified calculation
  const n = voc / (vt * Math.log(isc / (isc - impp) + 1)) / 60 // 60 cells typical
  return parseFloat(Math.max(1, Math.min(2, n)).toFixed(3))
}

// Temperature correction to STC (25°C, 1000 W/m²)
export function correctToSTC(
  pmax: number,
  irradiance: number,
  temperature: number,
  tempCoeffPmax: number, // in %/°C
): number {
  const irradianceCorrection = 1000 / irradiance
  const tempCorrection = 1 + (tempCoeffPmax / 100) * (25 - temperature)
  return parseFloat((pmax * irradianceCorrection * tempCorrection).toFixed(2))
}

// NMOT/NOCT calculation per IEC 61215
export function calculateNMOT(inputs: NMOTInputs): NMOTResult {
  // Module temperature: T_mod = T_amb + (NMOT - 20) * G / 800
  // NMOT is measured at 800 W/m², 20°C ambient, 1 m/s wind
  const moduleTemp = inputs.tAmbient + ((inputs.nmot - 20) * inputs.irradiance / 800)
  const tempDelta = moduleTemp - 25 // difference from STC
  const thermalLoss = Math.abs(inputs.tempCoeffPmax * tempDelta)
  const pmaxAtNMOT = inputs.pmax_stc * (1 + inputs.tempCoeffPmax / 100 * tempDelta)
  const performanceRatio = (pmaxAtNMOT / inputs.pmax_stc) * (inputs.irradiance / 1000)

  return {
    moduleTemp: parseFloat(moduleTemp.toFixed(1)),
    pmaxAtNMOT: parseFloat(pmaxAtNMOT.toFixed(2)),
    performanceRatio: parseFloat(performanceRatio.toFixed(4)),
    thermalLoss: parseFloat(thermalLoss.toFixed(2)),
    tempDelta: parseFloat(tempDelta.toFixed(1)),
  }
}

// Generate irradiance vs temperature model data
export function generateIrradianceTempModel(
  nmot: number,
  pmax_stc: number,
  tempCoeffPmax: number,
): { irradiance: number; moduleTemp: number; power: number; pr: number }[] {
  const data: { irradiance: number; moduleTemp: number; power: number; pr: number }[] = []
  for (let g = 200; g <= 1200; g += 100) {
    const tMod = 25 + (nmot - 20) * g / 800
    const pmax = pmax_stc * (1 + tempCoeffPmax / 100 * (tMod - 25)) * (g / 1000)
    data.push({
      irradiance: g,
      moduleTemp: parseFloat(tMod.toFixed(1)),
      power: parseFloat(pmax.toFixed(2)),
      pr: parseFloat((pmax / (pmax_stc * g / 1000)).toFixed(4)),
    })
  }
  return data
}

// Sample IV curve datasets for demo
export function generateSampleCurves(): IVCurveData[] {
  const curves: IVCurveData[] = []

  const configs = [
    { id: 'stc', label: 'STC (25\u00B0C, 1000 W/m\u00B2)', color: '#f97316', isc: 10.5, voc: 49.5, impp: 9.8, vmpp: 40.8, temp: 25, irr: 1000 },
    { id: 'nmot', label: 'NMOT (45\u00B0C, 800 W/m\u00B2)', color: '#3b82f6', isc: 8.5, voc: 46.2, impp: 7.9, vmpp: 38.5, temp: 45, irr: 800 },
    { id: 'low', label: 'Low Irradiance (200 W/m\u00B2)', color: '#22c55e', isc: 2.1, voc: 47.0, impp: 1.95, vmpp: 39.5, temp: 30, irr: 200 },
    { id: 'hot', label: 'Hot (60\u00B0C, 1000 W/m\u00B2)', color: '#ef4444', isc: 10.6, voc: 44.8, impp: 9.7, vmpp: 37.2, temp: 60, irr: 1000 },
  ]

  for (const cfg of configs) {
    const dataPoints = generateIVCurve(cfg.isc, cfg.voc, cfg.impp, cfg.vmpp)
    const pmax = cfg.vmpp * cfg.impp
    const area = 2.0 // 2 m² module

    curves.push({
      id: cfg.id,
      label: cfg.label,
      color: cfg.color,
      dataPoints,
      voc: cfg.voc,
      isc: cfg.isc,
      pmax: parseFloat(pmax.toFixed(2)),
      vmpp: cfg.vmpp,
      impp: cfg.impp,
      ff: parseFloat((pmax / (cfg.voc * cfg.isc)).toFixed(4)),
      efficiency: parseFloat((pmax / (cfg.irr * area) * 100).toFixed(2)),
      area,
      irradiance: cfg.irr,
      temperature: cfg.temp,
      rSeries: calcSeriesResistance(cfg.voc, cfg.vmpp, cfg.impp, cfg.isc),
      rShunt: 500 + Math.random() * 500,
      ideality: calcIdealityFactor(cfg.voc, cfg.isc, cfg.vmpp, cfg.impp, cfg.temp),
    })
  }

  return curves
}
