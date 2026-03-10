// IV Curve Analysis library for solar PV modules
// Implements single-diode model, parameter extraction, and temperature correction

export interface IVPoint {
  voltage: number;
  current: number;
  power: number;
}

export interface IVCurveData {
  id: string;
  label: string;
  points: IVPoint[];
  voc: number;
  isc: number;
  pmax: number;
  vmpp: number;
  impp: number;
  ff: number;
  rsh: number; // shunt resistance
  rs: number;  // series resistance
  n: number;   // diode ideality factor
  temperature: number; // °C
  irradiance: number;  // W/m²
  color: string;
}

export interface TemperatureCorrectionParams {
  alphaIsc: number;  // %/°C (Isc temp coefficient)
  betaVoc: number;   // %/°C (Voc temp coefficient)
  gammaPmax: number; // %/°C (Pmax temp coefficient)
  nmot: number;      // NMOT in °C
  noct: number;      // NOCT in °C
}

const DEFAULT_TEMP_COEFFICIENTS: TemperatureCorrectionParams = {
  alphaIsc: 0.05,
  betaVoc: -0.29,
  gammaPmax: -0.37,
  nmot: 44,
  noct: 45,
};

// Generate IV curve from single-diode model parameters
export function generateIVCurve(
  isc: number,
  voc: number,
  rs: number,
  rsh: number,
  n: number,
  temperature: number,
  irradiance: number,
  numPoints = 200
): IVPoint[] {
  const k = 1.380649e-23; // Boltzmann constant
  const q = 1.602176634e-19; // electron charge
  const T = temperature + 273.15; // Kelvin
  const Vt = (n * k * T) / q; // thermal voltage
  const I0 = isc / (Math.exp(voc / Vt) - 1); // reverse saturation current

  const points: IVPoint[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const v = (voc * 1.05 * i) / numPoints;
    // Simplified single-diode: I = Iph - I0*(exp(V/Vt)-1) - V/Rsh
    let current = isc - I0 * (Math.exp((v + 0) / Vt) - 1) - v / rsh;
    // Account for series resistance iteratively
    for (let iter = 0; iter < 5; iter++) {
      const vd = v + current * rs;
      current = isc - I0 * (Math.exp(vd / Vt) - 1) - vd / rsh;
    }
    if (current < 0) current = 0;
    points.push({
      voltage: Number(v.toFixed(4)),
      current: Number(current.toFixed(4)),
      power: Number((v * current).toFixed(4)),
    });
  }
  return points;
}

// Extract IV parameters from curve data
export function extractIVParameters(points: IVPoint[]): {
  voc: number; isc: number; pmax: number; vmpp: number; impp: number; ff: number; rs: number; rsh: number;
} {
  if (points.length === 0) {
    return { voc: 0, isc: 0, pmax: 0, vmpp: 0, impp: 0, ff: 0, rs: 0, rsh: 0 };
  }

  const isc = points[0].current;
  const voc = points.find(p => p.current <= 0.001)?.voltage || points[points.length - 1].voltage;

  let pmax = 0, vmpp = 0, impp = 0;
  for (const p of points) {
    if (p.power > pmax) {
      pmax = p.power;
      vmpp = p.voltage;
      impp = p.current;
    }
  }

  const ff = (isc * voc > 0) ? (pmax / (isc * voc)) * 100 : 0;

  // Estimate Rs from slope near Voc
  const nearVoc = points.filter(p => p.voltage > voc * 0.85 && p.current > 0);
  let rs = 0.5;
  if (nearVoc.length >= 2) {
    const dv = nearVoc[0].voltage - nearVoc[nearVoc.length - 1].voltage;
    const di = nearVoc[0].current - nearVoc[nearVoc.length - 1].current;
    if (di !== 0) rs = Math.abs(dv / di);
  }

  // Estimate Rsh from slope near Isc
  const nearIsc = points.filter(p => p.voltage < voc * 0.15);
  let rsh = 500;
  if (nearIsc.length >= 2) {
    const dv = nearIsc[nearIsc.length - 1].voltage - nearIsc[0].voltage;
    const di = nearIsc[nearIsc.length - 1].current - nearIsc[0].current;
    if (di !== 0) rsh = Math.abs(dv / di);
  }

  return {
    voc: Number(voc.toFixed(3)),
    isc: Number(isc.toFixed(3)),
    pmax: Number(pmax.toFixed(2)),
    vmpp: Number(vmpp.toFixed(3)),
    impp: Number(impp.toFixed(3)),
    ff: Number(ff.toFixed(2)),
    rs: Number(rs.toFixed(3)),
    rsh: Number(rsh.toFixed(1)),
  };
}

// Temperature correction to STC (25°C, 1000 W/m²)
export function correctToSTC(
  curve: IVCurveData,
  coefficients: TemperatureCorrectionParams = DEFAULT_TEMP_COEFFICIENTS
): IVCurveData {
  const dT = 25 - curve.temperature;
  const irradianceRatio = 1000 / curve.irradiance;

  const correctedIsc = curve.isc * irradianceRatio * (1 + coefficients.alphaIsc / 100 * dT);
  const correctedVoc = curve.voc * (1 + coefficients.betaVoc / 100 * dT);
  const correctedPmax = curve.pmax * irradianceRatio * (1 + coefficients.gammaPmax / 100 * dT);

  const points = generateIVCurve(correctedIsc, correctedVoc, curve.rs, curve.rsh, curve.n, 25, 1000);
  const params = extractIVParameters(points);

  return {
    ...curve,
    id: `${curve.id}-stc`,
    label: `${curve.label} (STC)`,
    points,
    ...params,
    temperature: 25,
    irradiance: 1000,
    color: curve.color,
  };
}

// Correct to NMOT/NOCT conditions
export function correctToNMOT(
  curve: IVCurveData,
  coefficients: TemperatureCorrectionParams = DEFAULT_TEMP_COEFFICIENTS
): IVCurveData {
  const targetTemp = coefficients.nmot;
  const targetIrradiance = 800; // NMOT conditions: 800 W/m²
  const dT = targetTemp - curve.temperature;
  const irradianceRatio = targetIrradiance / curve.irradiance;

  const correctedIsc = curve.isc * irradianceRatio * (1 + coefficients.alphaIsc / 100 * dT);
  const correctedVoc = curve.voc * (1 + coefficients.betaVoc / 100 * dT);

  const points = generateIVCurve(correctedIsc, correctedVoc, curve.rs, curve.rsh, curve.n, targetTemp, targetIrradiance);
  const params = extractIVParameters(points);

  return {
    ...curve,
    id: `${curve.id}-nmot`,
    label: `${curve.label} (NMOT)`,
    points,
    ...params,
    temperature: targetTemp,
    irradiance: targetIrradiance,
    color: curve.color,
  };
}

const CURVE_COLORS = [
  "#f97316", "#3b82f6", "#22c55e", "#ef4444", "#a855f7",
  "#06b6d4", "#eab308", "#ec4899", "#14b8a6", "#6366f1",
];

// Generate demo IV curves
export function generateDemoCurves(): IVCurveData[] {
  const configs = [
    { label: "Module A – STC", isc: 10.2, voc: 49.5, rs: 0.35, rsh: 500, n: 1.2, temp: 25, irr: 1000 },
    { label: "Module A – 45°C", isc: 10.25, voc: 46.1, rs: 0.38, rsh: 450, n: 1.22, temp: 45, irr: 1000 },
    { label: "Module A – 800W/m²", isc: 8.16, voc: 48.9, rs: 0.36, rsh: 520, n: 1.2, temp: 25, irr: 800 },
    { label: "Module B – STC", isc: 9.8, voc: 50.2, rs: 0.32, rsh: 550, n: 1.15, temp: 25, irr: 1000 },
  ];

  return configs.map((c, i) => {
    const points = generateIVCurve(c.isc, c.voc, c.rs, c.rsh, c.n, c.temp, c.irr);
    const params = extractIVParameters(points);
    return {
      id: `curve-${i + 1}`,
      label: c.label,
      points,
      ...params,
      rs: c.rs,
      rsh: c.rsh,
      n: c.n,
      temperature: c.temp,
      irradiance: c.irr,
      color: CURVE_COLORS[i % CURVE_COLORS.length],
    };
  });
}

export { DEFAULT_TEMP_COEFFICIENTS, CURVE_COLORS };
