/**
 * IEC 60891 - I-V Curve Translation Procedures
 * Procedures for temperature and irradiance corrections of measured I-V characteristics
 */

import type { IVDataPoint } from "./iec60904";

// ============================================================
// Procedure 1: Using Temperature Coefficients
// ============================================================

export interface Procedure1Params {
  alpha: number;     // Isc temperature coefficient (%/°C or A/°C)
  beta: number;      // Voc temperature coefficient (%/°C or V/°C)
  kappa: number;     // Curve correction factor (Ω)
  alphaIsRelative: boolean; // true if alpha is %/°C, false if A/°C
  betaIsRelative: boolean;  // true if beta is %/°C, false if V/°C
}

export interface TranslationInput {
  ivData: IVDataPoint[];
  measuredIrradiance: number;  // G1 (W/m²)
  measuredTemperature: number; // T1 (°C)
  targetIrradiance: number;    // G2 (W/m², typically 1000)
  targetTemperature: number;   // T2 (°C, typically 25)
}

export interface TranslationResult {
  originalData: IVDataPoint[];
  translatedData: IVDataPoint[];
  procedure: string;
  deltaT: number;
  deltaG: number;
  correctionApplied: string;
}

/**
 * IEC 60891 Procedure 1 — temperature coefficient method.
 * Translates an I-V characteristic to standard reference conditions using
 * explicit temperature coefficients α (Isc) and β (Voc) per IEC 60891:2021 §5.1.
 * @param input - Measured I-V points with source and target irradiance/temperature
 * @param params - Coefficients α, β, curve correction factor κ (Ω), and unit flags
 * @returns Translated I-V array with procedure label and applied-correction string
 */
export function translateProcedure1(
  input: TranslationInput,
  params: Procedure1Params
): TranslationResult {
  const { ivData, measuredIrradiance: G1, measuredTemperature: T1, targetIrradiance: G2, targetTemperature: T2 } = input;
  const dT = T2 - T1;
  const dG = G2 - G1;

  // Get Isc from data for relative coefficients
  const isc = ivData.length > 0 ? ivData[0].current : 1;
  const voc = ivData.length > 0 ? ivData[ivData.length - 1].voltage : 1;

  const alphaAbs = params.alphaIsRelative ? (params.alpha / 100) * isc : params.alpha;
  const betaAbs = params.betaIsRelative ? (params.beta / 100) * voc : params.beta;

  const translatedData: IVDataPoint[] = ivData.map((point) => {
    // I2 = I1 + Isc1*(G2/G1 - 1) + alpha*(T2-T1)
    const I2 = point.current + isc * (G2 / G1 - 1) + alphaAbs * dT;
    // V2 = V1 - Rs*(I2-I1) + beta*(T2-T1) + kappa*I1*(T2-T1)
    const dI = I2 - point.current;
    const V2 = point.voltage - params.kappa * dI + betaAbs * dT;
    return { voltage: Math.max(0, V2), current: Math.max(0, I2) };
  });

  return {
    originalData: ivData,
    translatedData,
    procedure: "Procedure 1 (Temperature Coefficients)",
    deltaT: dT,
    deltaG: dG,
    correctionApplied: `α=${params.alpha}${params.alphaIsRelative ? '%' : 'A'}/°C, β=${params.beta}${params.betaIsRelative ? '%' : 'V'}/°C, κ=${params.kappa}Ω`,
  };
}

// ============================================================
// Procedure 2: Using Reference Device
// ============================================================

export interface Procedure2Params {
  refIsc1: number;  // Reference Isc at G1, T1
  refIsc2: number;  // Reference Isc at G2, T2 (or just at target)
  beta: number;     // Voc temperature coefficient (V/°C)
  rs: number;       // Internal series resistance (Ω)
}

/**
 * IEC 60891 Procedure 2 — reference device method.
 * Scales currents by the Isc ratio of a co-irradiated reference device, then
 * applies the series-resistance voltage correction per IEC 60891:2021 §5.2.
 * @param input - Measured I-V points with source and target irradiance/temperature
 * @param params - Reference device Isc at both conditions, β (V/°C), and Rs (Ω)
 * @returns Translated I-V array with procedure label and applied-correction string
 */
export function translateProcedure2(
  input: TranslationInput,
  params: Procedure2Params
): TranslationResult {
  const { ivData, measuredTemperature: T1, targetTemperature: T2 } = input;
  const dT = T2 - T1;
  const iscRatio = params.refIsc2 / params.refIsc1;

  const translatedData: IVDataPoint[] = ivData.map((point) => {
    const I2 = point.current * iscRatio;
    const dI = I2 - point.current;
    const V2 = point.voltage + params.beta * dT - params.rs * dI;
    return { voltage: Math.max(0, V2), current: Math.max(0, I2) };
  });

  return {
    originalData: ivData,
    translatedData,
    procedure: "Procedure 2 (Reference Device)",
    deltaT: dT,
    deltaG: input.targetIrradiance - input.measuredIrradiance,
    correctionApplied: `Isc ratio=${iscRatio.toFixed(4)}, β=${params.beta}V/°C, Rs=${params.rs}Ω`,
  };
}

// ============================================================
// Procedure 3: Interpolation
// ============================================================

export interface Procedure3Input {
  ivDataLow: IVDataPoint[];   // I-V at lower irradiance
  ivDataHigh: IVDataPoint[];  // I-V at higher irradiance
  gLow: number;               // Lower irradiance (W/m²)
  gHigh: number;              // Higher irradiance (W/m²)
  tLow: number;               // Temperature at lower (°C)
  tHigh: number;              // Temperature at higher (°C)
  targetIrradiance: number;   // Target G (W/m²)
  targetTemperature: number;  // Target T (°C)
}

/**
 * IEC 60891 Procedure 3 — linear interpolation between two I-V curves.
 * Blends point-by-point voltages and currents from curves measured at two
 * irradiance levels using the fractional distance f = (G_target − G_low) /
 * (G_high − G_low), per IEC 60891:2021 §5.3.
 * @param input - Paired low/high I-V datasets with their irradiance and temperature conditions
 * @returns Interpolated I-V array (length = min of both input arrays) with procedure metadata
 */
export function translateProcedure3(input: Procedure3Input): TranslationResult {
  const { ivDataLow, ivDataHigh, gLow, gHigh, targetIrradiance: gTarget } = input;
  const f = gHigh !== gLow ? (gTarget - gLow) / (gHigh - gLow) : 0;

  // Interpolate matching voltage points
  const nPoints = Math.min(ivDataLow.length, ivDataHigh.length);
  const translatedData: IVDataPoint[] = [];

  for (let i = 0; i < nPoints; i++) {
    const vLow = ivDataLow[i]?.voltage ?? 0;
    const vHigh = ivDataHigh[i]?.voltage ?? 0;
    const iLow = ivDataLow[i]?.current ?? 0;
    const iHigh = ivDataHigh[i]?.current ?? 0;

    translatedData.push({
      voltage: vLow + f * (vHigh - vLow),
      current: iLow + f * (iHigh - iLow),
    });
  }

  return {
    originalData: ivDataLow,
    translatedData,
    procedure: "Procedure 3 (Interpolation)",
    deltaT: input.targetTemperature - input.tLow,
    deltaG: gTarget - gLow,
    correctionApplied: `Interpolation factor f=${f.toFixed(4)} between G=${gLow} and G=${gHigh} W/m²`,
  };
}

// ============================================================
// Rs Determination Methods
// ============================================================

export interface RsDeterminationResult {
  rs: number;
  method: string;
  details: string;
}

/**
 * Determine series resistance from the slope of the I-V curve near Voc (Method 1).
 * Uses points above 85 % of Voc; Rs = −ΔV/ΔI per IEC 60891:2021 Annex A.
 * @param ivData - Measured I-V points sorted by ascending voltage
 * @returns Best-fit Rs (Ω), method label, and calculation details string
 */
export function determineRsFromSlope(ivData: IVDataPoint[]): RsDeterminationResult {
  const sorted = [...ivData].sort((a, b) => a.voltage - b.voltage);
  const voc = sorted[sorted.length - 1].voltage;
  const nearVoc = sorted.filter((p) => p.voltage > voc * 0.85 && p.current > 0);

  if (nearVoc.length < 2) {
    return { rs: 0, method: "Slope near Voc", details: "Insufficient data points near Voc" };
  }

  const last = nearVoc[nearVoc.length - 1];
  const first = nearVoc[0];
  const dV = last.voltage - first.voltage;
  const dI = last.current - first.current;
  const rs = dI !== 0 ? -dV / dI : 0;

  return {
    rs: Math.max(0, rs),
    method: "Slope near Voc",
    details: `Calculated from ${nearVoc.length} points between V=${first.voltage.toFixed(2)}V and V=${last.voltage.toFixed(2)}V`,
  };
}

/**
 * Determine series resistance from two I-V curves at different irradiances (Method 2).
 * Rs = |ΔVmpp / ΔIsc| where ΔVmpp is the maximum-power-point voltage shift between
 * the two curves; per IEC 60891:2021 Annex A.2.
 * @param iv1 - I-V points at irradiance G1
 * @param iv2 - I-V points at irradiance G2
 * @param g1 - Irradiance for iv1 (W/m²)
 * @param g2 - Irradiance for iv2 (W/m²)
 * @returns Best-fit Rs (Ω), method label, and calculation details string
 */
export function determineRsFromTwoCurves(
  iv1: IVDataPoint[],
  iv2: IVDataPoint[],
  g1: number,
  g2: number
): RsDeterminationResult {
  // Find Isc for both curves
  const isc1 = iv1[0]?.current ?? 0;
  const isc2 = iv2[0]?.current ?? 0;
  const dIsc = isc2 - isc1;

  // Find Vmpp shift
  let pmax1 = 0, vmpp1 = 0, pmax2 = 0, vmpp2 = 0;
  for (const p of iv1) {
    const pw = p.voltage * p.current;
    if (pw > pmax1) { pmax1 = pw; vmpp1 = p.voltage; }
  }
  for (const p of iv2) {
    const pw = p.voltage * p.current;
    if (pw > pmax2) { pmax2 = pw; vmpp2 = p.voltage; }
  }

  const dV = vmpp2 - vmpp1;
  const rs = dIsc !== 0 ? Math.abs(dV / dIsc) : 0;

  return {
    rs: Math.max(0, rs),
    method: "Two I-V Curves",
    details: `From curves at G=${g1}W/m² and G=${g2}W/m², ΔIsc=${dIsc.toFixed(3)}A, ΔVmpp=${dV.toFixed(3)}V`,
  };
}

/**
 * Determine series resistance by iterative fitting to a reference I-V curve (Method 3).
 * Scans κ from 0 to 5 Ω in 10 mΩ steps; picks the value that minimises the RMS
 * current error between the Procedure-1-translated curve and a reference.
 * Per IEC 60891:2021 Annex A.3.
 * @param ivMeasured - I-V points to translate
 * @param ivReference - Target reference I-V curve for error minimisation
 * @param alpha - Isc temperature coefficient (%/°C)
 * @param beta - Voc temperature coefficient (%/°C)
 * @param g1 - Measured irradiance (W/m²)
 * @param g2 - Target irradiance (W/m²)
 * @param t1 - Measured temperature (°C)
 * @param t2 - Target temperature (°C)
 * @returns Best-fit Rs (Ω), method label, and RMS error at optimum
 */
export function determineRsIterative(
  ivMeasured: IVDataPoint[],
  ivReference: IVDataPoint[],
  alpha: number,
  beta: number,
  g1: number,
  g2: number,
  t1: number,
  t2: number
): RsDeterminationResult {
  let bestRs = 0;
  let minError = Infinity;

  // Search Rs from 0 to 5 Ohm in steps
  for (let rs = 0; rs <= 5; rs += 0.01) {
    const translated = translateProcedure1(
      { ivData: ivMeasured, measuredIrradiance: g1, measuredTemperature: t1, targetIrradiance: g2, targetTemperature: t2 },
      { alpha, beta, kappa: rs, alphaIsRelative: true, betaIsRelative: true }
    );

    // Calculate RMS error vs reference at matching voltages
    let errorSum = 0;
    const nPts = Math.min(translated.translatedData.length, ivReference.length);
    for (let i = 0; i < nPts; i++) {
      const dI = (translated.translatedData[i]?.current ?? 0) - (ivReference[i]?.current ?? 0);
      errorSum += dI ** 2;
    }
    const rmsError = Math.sqrt(errorSum / nPts);

    if (rmsError < minError) {
      minError = rmsError;
      bestRs = rs;
    }
  }

  return {
    rs: bestRs,
    method: "Iterative Fitting",
    details: `Best fit Rs=${bestRs.toFixed(3)}Ω with RMS error=${minError.toFixed(6)}A`,
  };
}
