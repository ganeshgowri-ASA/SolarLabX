// NMOT/NOCT Calculator per IEC 61215 and IEC 61853

export interface NMOTInput {
  nocTmeasured: number;   // Measured NOCT (°C) from IEC 61215 MQT 05
  windSpeed: number;      // m/s (default 1 m/s for NMOT)
  ambientTemp: number;    // °C
  irradiance: number;     // W/m² (typically 800 for NMOT, 800 for NOCT)
  mountingType: "open_rack" | "close_roof" | "bipv";
}

export interface NMOTResult {
  nmot: number;           // Nominal Module Operating Temperature (°C)
  noct: number;           // Nominal Operating Cell Temperature (°C)
  cellTemp: number;       // Cell temperature at given conditions
  performanceRatio: number;
  correctedPmax: number;  // Corrected power at NMOT
  correctedVoc: number;
  correctedIsc: number;
  tempDerate: number;     // Temperature derating factor
}

export interface TempCoefficientSet {
  alphaPmax: number;  // %/°C
  alphaVoc: number;   // %/°C (usually negative like -0.29)
  alphaIsc: number;   // %/°C (usually positive like +0.05)
}

export interface ModuleSpecs {
  pmaxSTC: number;    // W at STC
  vocSTC: number;     // V at STC
  iscSTC: number;     // A at STC
  ffSTC: number;      // Fill Factor % at STC
  tempCoefficients: TempCoefficientSet;
}

// Mounting correction factors per IEC 61853-2
const MOUNTING_CORRECTIONS: Record<string, number> = {
  open_rack: 0,
  close_roof: 3,
  bipv: 6,
};

// Calculate NMOT per IEC 61215:2021 (replaces NOCT)
export function calculateNMOT(input: NMOTInput): number {
  const correction = MOUNTING_CORRECTIONS[input.mountingType] || 0;
  // NMOT = NOCT_measured + correction - (for wind speed difference)
  // IEC 61215:2021 defines NMOT conditions: 800 W/m², 20°C, 1 m/s wind
  const windCorrection = (input.windSpeed - 1) * -2; // approximate correction
  return input.nocTmeasured + correction + windCorrection;
}

// Calculate NOCT (legacy per IEC 61215:2005)
export function calculateNOCT(measuredNOCT: number, mountingType: string): number {
  return measuredNOCT + (MOUNTING_CORRECTIONS[mountingType] || 0);
}

// Calculate cell temperature at any operating conditions
export function calculateCellTemp(
  ambientTemp: number,
  irradiance: number,
  nmot: number,
  windSpeed: number = 1
): number {
  // Ross model: Tc = Ta + (NMOT - 20) * (G / 800)
  // With wind correction
  const windFactor = Math.max(0.5, 1 - (windSpeed - 1) * 0.05);
  return ambientTemp + (nmot - 20) * (irradiance / 800) * windFactor;
}

// Calculate performance at NMOT/NOCT conditions
export function calculatePerformanceAtNMOT(
  moduleSpecs: ModuleSpecs,
  nmot: number,
  irradiance: number = 800
): NMOTResult {
  const ambientTemp = 20; // NMOT reference ambient
  const cellTemp = calculateCellTemp(ambientTemp, irradiance, nmot);
  const dT = cellTemp - 25; // Difference from STC (25°C)

  const tempDerate = 1 + moduleSpecs.tempCoefficients.alphaPmax / 100 * dT;
  const irradianceFactor = irradiance / 1000;

  const correctedPmax = moduleSpecs.pmaxSTC * irradianceFactor * tempDerate;
  const correctedVoc = moduleSpecs.vocSTC * (1 + moduleSpecs.tempCoefficients.alphaVoc / 100 * dT);
  const correctedIsc = moduleSpecs.iscSTC * irradianceFactor * (1 + moduleSpecs.tempCoefficients.alphaIsc / 100 * dT);
  const performanceRatio = correctedPmax / (moduleSpecs.pmaxSTC * irradianceFactor);

  return {
    nmot,
    noct: nmot, // NMOT supersedes NOCT in latest standard
    cellTemp,
    performanceRatio,
    correctedPmax: Number(correctedPmax.toFixed(2)),
    correctedVoc: Number(correctedVoc.toFixed(3)),
    correctedIsc: Number(correctedIsc.toFixed(3)),
    tempDerate: Number(tempDerate.toFixed(4)),
  };
}

// Generate irradiance vs temperature model data for charting
export function generateIrradianceTempModel(
  nmot: number,
  ambientTemps: number[] = [0, 10, 20, 30, 40, 50],
  irradiances: number[] = [200, 400, 600, 800, 1000, 1200]
): { ambient: number; irradiance: number; cellTemp: number }[] {
  const data: { ambient: number; irradiance: number; cellTemp: number }[] = [];
  for (const ta of ambientTemps) {
    for (const g of irradiances) {
      data.push({
        ambient: ta,
        irradiance: g,
        cellTemp: Number(calculateCellTemp(ta, g, nmot).toFixed(1)),
      });
    }
  }
  return data;
}

// Generate performance ratio curve across temperatures
export function generatePRCurve(
  moduleSpecs: ModuleSpecs,
  nmot: number,
  tempRange: number[] = Array.from({ length: 61 }, (_, i) => i - 10) // -10 to 50°C
): { ambient: number; cellTemp: number; pr: number; power: number }[] {
  return tempRange.map((ta) => {
    const cellTemp = calculateCellTemp(ta, 800, nmot);
    const dT = cellTemp - 25;
    const tempDerate = 1 + moduleSpecs.tempCoefficients.alphaPmax / 100 * dT;
    const power = moduleSpecs.pmaxSTC * 0.8 * tempDerate; // 800/1000 irradiance factor
    return {
      ambient: ta,
      cellTemp: Number(cellTemp.toFixed(1)),
      pr: Number((tempDerate * 100).toFixed(1)),
      power: Number(power.toFixed(1)),
    };
  });
}

// Default module specs for demo
export const DEFAULT_MODULE_SPECS: ModuleSpecs = {
  pmaxSTC: 400,
  vocSTC: 49.5,
  iscSTC: 10.2,
  ffSTC: 79.5,
  tempCoefficients: {
    alphaPmax: -0.37,
    alphaVoc: -0.29,
    alphaIsc: 0.05,
  },
};
