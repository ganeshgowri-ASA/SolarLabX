import { describe, it, expect } from "vitest";
import {
  correctPmaxToSTC,
  calculateNMOT,
  generateIrradianceTempModel,
  extractIVParameters,
  DEFAULT_TEMP_COEFFICIENTS,
  type IVDataPoint,
} from "@/lib/iv-curve";

describe("correctPmaxToSTC", () => {
  it("returns the same pmax when already at STC (25°C, 1000 W/m²)", () => {
    expect(correctPmaxToSTC(400, 1000, 25, -0.35)).toBeCloseTo(400, 1);
  });

  it("applies irradiance correction at low light", () => {
    // At 500 W/m², irradiance factor = 2 → pmax doubles (ignoring temp)
    const result = correctPmaxToSTC(200, 500, 25, -0.35);
    expect(result).toBeCloseTo(400, 1);
  });

  it("applies negative temperature correction above 25°C", () => {
    // At 45°C with -0.35%/°C coefficient: factor = 1 + (-0.35/100)*(25-45) = 1.07
    const result = correctPmaxToSTC(400, 1000, 45, -0.35);
    expect(result).toBeGreaterThan(400);
    expect(result).toBeCloseTo(428, 0);
  });

  it("applies positive temperature correction below 25°C", () => {
    // At 10°C: factor = 1 + (-0.35/100)*(25-10) = 1 - 0.0525 = 0.9475
    const result = correctPmaxToSTC(400, 1000, 10, -0.35);
    expect(result).toBeLessThan(400);
    expect(result).toBeCloseTo(379, 0);
  });
});

describe("calculateNMOT (iv-curve module)", () => {
  it("at NMOT reference conditions (20°C, 800 W/m², NMOT=45°C) → moduleTemp = 45°C", () => {
    const result = calculateNMOT({
      tAmbient: 20,
      irradiance: 800,
      windSpeed: 1,
      nmot: 45,
      tempCoeffPmax: -0.35,
      pmax_stc: 400,
    });
    expect(result.moduleTemp).toBeCloseTo(45, 1);
  });

  it("tempDelta is moduleTemp - 25", () => {
    const result = calculateNMOT({
      tAmbient: 20,
      irradiance: 800,
      windSpeed: 1,
      nmot: 45,
      tempCoeffPmax: -0.35,
      pmax_stc: 400,
    });
    expect(result.tempDelta).toBeCloseTo(result.moduleTemp - 25, 2);
  });

  it("higher irradiance increases module temperature", () => {
    const low = calculateNMOT({ tAmbient: 25, irradiance: 400, windSpeed: 1, nmot: 45, tempCoeffPmax: -0.35, pmax_stc: 400 });
    const high = calculateNMOT({ tAmbient: 25, irradiance: 800, windSpeed: 1, nmot: 45, tempCoeffPmax: -0.35, pmax_stc: 400 });
    expect(high.moduleTemp).toBeGreaterThan(low.moduleTemp);
  });

  it("performanceRatio is relative to STC power scaled by irradiance", () => {
    const result = calculateNMOT({
      tAmbient: 25,
      irradiance: 1000,
      windSpeed: 1,
      nmot: 45,
      tempCoeffPmax: 0, // no temp loss
      pmax_stc: 400,
    });
    // With 0 tempCoeff and 1000 W/m² → PR should be 1.0
    expect(result.performanceRatio).toBeCloseTo(1.0, 3);
  });

  it("thermalLoss is always non-negative", () => {
    const result = calculateNMOT({
      tAmbient: 30,
      irradiance: 1000,
      windSpeed: 1,
      nmot: 45,
      tempCoeffPmax: -0.35,
      pmax_stc: 400,
    });
    expect(result.thermalLoss).toBeGreaterThanOrEqual(0);
  });
});

describe("generateIrradianceTempModel (iv-curve module)", () => {
  it("sweeps irradiance from 200 to 1200 W/m² in 100 W/m² steps", () => {
    const data = generateIrradianceTempModel(45, 400, -0.35);
    const irradiances = data.map((d) => d.irradiance);
    expect(irradiances[0]).toBe(200);
    expect(irradiances[irradiances.length - 1]).toBe(1200);
    expect(data).toHaveLength(11);
  });

  it("power increases with irradiance when temperature effect is small", () => {
    const data = generateIrradianceTempModel(45, 400, 0); // no temp coefficient
    for (let i = 1; i < data.length; i++) {
      expect(data[i].power).toBeGreaterThan(data[i - 1].power);
    }
  });

  it("module temperature increases with irradiance", () => {
    const data = generateIrradianceTempModel(45, 400, -0.35);
    for (let i = 1; i < data.length; i++) {
      expect(data[i].moduleTemp).toBeGreaterThan(data[i - 1].moduleTemp);
    }
  });
});

describe("extractIVParameters", () => {
  it("returns zeros for empty points array", () => {
    const result = extractIVParameters([]);
    expect(result.voc).toBe(0);
    expect(result.isc).toBe(0);
    expect(result.pmax).toBe(0);
    expect(result.ff).toBe(0);
  });

  it("extracts correct Isc (first point current) and Voc (last point voltage)", () => {
    const points: IVDataPoint[] = [
      { voltage: 0, current: 10, power: 0 },
      { voltage: 20, current: 8, power: 160 },
      { voltage: 40, current: 0, power: 0 },
    ];
    const result = extractIVParameters(points);
    expect(result.isc).toBe(10);
    expect(result.voc).toBe(40);
  });

  it("finds pmax as maximum power point", () => {
    const points: IVDataPoint[] = [
      { voltage: 0, current: 10, power: 0 },
      { voltage: 20, current: 9, power: 180 },
      { voltage: 35, current: 7, power: 245 }, // MPP
      { voltage: 45, current: 2, power: 90 },
      { voltage: 50, current: 0, power: 0 },
    ];
    const result = extractIVParameters(points);
    expect(result.pmax).toBe(245);
    expect(result.vmpp).toBe(35);
    expect(result.impp).toBe(7);
  });

  it("fill factor is between 0 and 1 for valid IV curve", () => {
    const points: IVDataPoint[] = [
      { voltage: 0, current: 9.5, power: 0 },
      { voltage: 38, current: 8.5, power: 323 },
      { voltage: 46, current: 0, power: 0 },
    ];
    const result = extractIVParameters(points);
    expect(result.ff).toBeGreaterThan(0);
    expect(result.ff).toBeLessThanOrEqual(1);
  });
});

describe("DEFAULT_TEMP_COEFFICIENTS", () => {
  it("has expected IEC 60904-1 default values", () => {
    expect(DEFAULT_TEMP_COEFFICIENTS.gammaPmax).toBeCloseTo(-0.35, 3);
    expect(DEFAULT_TEMP_COEFFICIENTS.betaVoc).toBeCloseTo(-0.30, 3);
    expect(DEFAULT_TEMP_COEFFICIENTS.alphaIsc).toBeCloseTo(0.05, 3);
    expect(DEFAULT_TEMP_COEFFICIENTS.nmot).toBe(45);
  });
});
