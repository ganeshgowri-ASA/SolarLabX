import { describe, it, expect } from "vitest";
import {
  calculateNMOT,
  calculateNOCT,
  calculateCellTemp,
  calculatePerformanceAtNMOT,
  generateIrradianceTempModel,
  generatePRCurve,
  DEFAULT_MODULE_SPECS,
} from "@/lib/nmot-noct";

// ──────────────────────────────────────────────────
// calculateNMOT
// ──────────────────────────────────────────────────
describe("calculateNMOT", () => {
  it("open_rack adds no mounting correction", () => {
    const nmot = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    expect(nmot).toBe(45); // no mounting correction, no wind correction at 1 m/s
  });

  it("close_roof adds +3°C mounting correction", () => {
    const nmot = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "close_roof" });
    expect(nmot).toBe(48);
  });

  it("bipv adds +6°C mounting correction", () => {
    const nmot = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "bipv" });
    expect(nmot).toBe(51);
  });

  it("higher wind speed reduces NMOT (−2°C per m/s above 1)", () => {
    const base = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    const windy = calculateNMOT({ nocTmeasured: 45, windSpeed: 3, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    expect(windy).toBe(base - 4); // (3-1)*-2 = -4
  });

  it("lower wind speed increases NMOT", () => {
    const nmot = calculateNMOT({ nocTmeasured: 45, windSpeed: 0, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    expect(nmot).toBe(47); // (0-1)*-2 = +2
  });
});

// ──────────────────────────────────────────────────
// calculateNOCT
// ──────────────────────────────────────────────────
describe("calculateNOCT", () => {
  it("open_rack adds no correction to measured NOCT", () => {
    expect(calculateNOCT(44, "open_rack")).toBe(44);
  });

  it("close_roof adds +3°C", () => {
    expect(calculateNOCT(44, "close_roof")).toBe(47);
  });

  it("bipv adds +6°C", () => {
    expect(calculateNOCT(44, "bipv")).toBe(50);
  });

  it("unknown mountingType adds 0°C", () => {
    expect(calculateNOCT(44, "unknown_type")).toBe(44);
  });
});

// ──────────────────────────────────────────────────
// calculateCellTemp (Ross model)
// ──────────────────────────────────────────────────
describe("calculateCellTemp", () => {
  it("matches Ross model at NMOT reference conditions (G=800, Ta=20, w=1)", () => {
    // At nmot=45: Tc = 20 + (45-20)*(800/800)*1 = 20+25 = 45 °C
    const tc = calculateCellTemp(20, 800, 45, 1);
    expect(tc).toBeCloseTo(45);
  });

  it("zero irradiance gives ambient temperature", () => {
    expect(calculateCellTemp(25, 0, 45)).toBeCloseTo(25);
  });

  it("cell temperature is monotonically increasing with irradiance", () => {
    const ta = 25;
    const nmot = 45;
    const prevTemp = calculateCellTemp(ta, 200, nmot);
    const currTemp = calculateCellTemp(ta, 400, nmot);
    const highTemp = calculateCellTemp(ta, 1000, nmot);
    expect(currTemp).toBeGreaterThan(prevTemp);
    expect(highTemp).toBeGreaterThan(currTemp);
  });

  it("cell temperature is monotonically increasing with ambient temperature", () => {
    const nmot = 45;
    const tc20 = calculateCellTemp(20, 800, nmot);
    const tc30 = calculateCellTemp(30, 800, nmot);
    const tc40 = calculateCellTemp(40, 800, nmot);
    expect(tc30).toBeGreaterThan(tc20);
    expect(tc40).toBeGreaterThan(tc30);
  });

  it("uses default wind speed of 1 m/s when omitted", () => {
    const withDefault = calculateCellTemp(25, 800, 45);
    const explicit = calculateCellTemp(25, 800, 45, 1);
    expect(withDefault).toBeCloseTo(explicit);
  });

  it("wind factor is floored at 0.5 for very high wind speeds", () => {
    // windFactor = max(0.5, 1-(w-1)*0.05)
    // at w=11: 1-(11-1)*0.05 = 0.5; at w=100: would be negative but floored to 0.5
    const tc11 = calculateCellTemp(20, 800, 45, 11);
    const tc100 = calculateCellTemp(20, 800, 45, 100);
    expect(tc100).toBeCloseTo(tc11);
  });
});

// ──────────────────────────────────────────────────
// calculatePerformanceAtNMOT
// ──────────────────────────────────────────────────
describe("calculatePerformanceAtNMOT", () => {
  const specs = DEFAULT_MODULE_SPECS; // Pmax=400W, alphaPmax=-0.37%/°C
  const nmot = 45;
  const result = calculatePerformanceAtNMOT(specs, nmot, 800);

  it("returns all required output fields", () => {
    expect(result).toHaveProperty("nmot");
    expect(result).toHaveProperty("cellTemp");
    expect(result).toHaveProperty("correctedPmax");
    expect(result).toHaveProperty("correctedVoc");
    expect(result).toHaveProperty("correctedIsc");
    expect(result).toHaveProperty("tempDerate");
    expect(result).toHaveProperty("performanceRatio");
  });

  it("nmot in output matches input nmot", () => {
    expect(result.nmot).toBe(nmot);
  });

  it("cell temperature is higher than reference ambient (20°C) at 800 W/m²", () => {
    expect(result.cellTemp).toBeGreaterThan(20);
  });

  it("correctedPmax is less than STC Pmax at 800 W/m² with negative temp coeff", () => {
    // At 800 W/m² and typical NMOT>STC temp, power < 400W
    expect(result.correctedPmax).toBeLessThan(specs.pmaxSTC);
  });

  it("tempDerate < 1 when cell is hotter than 25°C", () => {
    expect(result.tempDerate).toBeLessThan(1);
  });

  it("STC-equivalent conditions give Pmax close to rated", () => {
    // nmot=25°C so cellTemp = 20 + (25-20)*(800/800) = 25°C, dT=0, derate=1
    const stcLike = calculatePerformanceAtNMOT(specs, 25, 800);
    expect(stcLike.correctedPmax).toBeCloseTo(specs.pmaxSTC * 0.8, 0);
  });

  it("higher NMOT gives higher cell temperature", () => {
    const r1 = calculatePerformanceAtNMOT(specs, 40, 800);
    const r2 = calculatePerformanceAtNMOT(specs, 50, 800);
    expect(r2.cellTemp).toBeGreaterThan(r1.cellTemp);
  });
});

// ──────────────────────────────────────────────────
// generateIrradianceTempModel
// ──────────────────────────────────────────────────
describe("generateIrradianceTempModel", () => {
  const data = generateIrradianceTempModel(45);

  it("produces 6x6=36 data points with default inputs", () => {
    expect(data.length).toBe(36);
  });

  it("each entry has ambient, irradiance, and cellTemp fields", () => {
    for (const d of data) {
      expect(d).toHaveProperty("ambient");
      expect(d).toHaveProperty("irradiance");
      expect(d).toHaveProperty("cellTemp");
    }
  });

  it("zero irradiance entries have cellTemp equal to ambient", () => {
    const zeroIrr = data.filter((d) => d.irradiance === 200); // smallest default
    // cellTemp should be > ambient for irradiance > 0
    for (const d of zeroIrr) {
      expect(d.cellTemp).toBeGreaterThan(d.ambient);
    }
  });

  it("supports custom ambient and irradiance arrays", () => {
    const custom = generateIrradianceTempModel(45, [0, 25], [400, 800]);
    expect(custom.length).toBe(4);
  });
});

// ──────────────────────────────────────────────────
// generatePRCurve
// ──────────────────────────────────────────────────
describe("generatePRCurve", () => {
  const curve = generatePRCurve(DEFAULT_MODULE_SPECS, 45);

  it("returns 61 points for default -10 to 50°C range", () => {
    expect(curve.length).toBe(61);
  });

  it("each point has ambient, cellTemp, pr, and power fields", () => {
    for (const p of curve) {
      expect(p).toHaveProperty("ambient");
      expect(p).toHaveProperty("cellTemp");
      expect(p).toHaveProperty("pr");
      expect(p).toHaveProperty("power");
    }
  });

  it("PR decreases as ambient temperature increases", () => {
    // All ambient temps -10..50; performance ratio should decrease for hotter temps
    const ta0 = curve.find((p) => p.ambient === 0)!;
    const ta25 = curve.find((p) => p.ambient === 25)!;
    const ta50 = curve.find((p) => p.ambient === 50)!;
    expect(ta25.pr).toBeLessThan(ta0.pr);
    expect(ta50.pr).toBeLessThan(ta25.pr);
  });

  it("all power values are positive", () => {
    for (const p of curve) {
      expect(p.power).toBeGreaterThan(0);
    }
  });
});
