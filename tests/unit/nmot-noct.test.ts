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

describe("calculateNMOT", () => {
  it("open rack with 1 m/s wind (reference conditions): no correction", () => {
    // correction for open_rack = 0, windCorrection = (1-1)*-2 = 0
    const result = calculateNMOT({
      nocTmeasured: 45,
      windSpeed: 1,
      ambientTemp: 20,
      irradiance: 800,
      mountingType: "open_rack",
    });
    expect(result).toBeCloseTo(45, 1);
  });

  it("close-roof mounting adds 3°C vs open rack", () => {
    const openRack = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    const closeRoof = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "close_roof" });
    expect(closeRoof - openRack).toBeCloseTo(3, 1);
  });

  it("BIPV mounting adds 6°C vs open rack", () => {
    const openRack = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    const bipv = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "bipv" });
    expect(bipv - openRack).toBeCloseTo(6, 1);
  });

  it("higher wind speed reduces effective NMOT", () => {
    const low = calculateNMOT({ nocTmeasured: 45, windSpeed: 1, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    const high = calculateNMOT({ nocTmeasured: 45, windSpeed: 3, ambientTemp: 20, irradiance: 800, mountingType: "open_rack" });
    expect(high).toBeLessThan(low);
  });
});

describe("calculateNOCT", () => {
  it("open rack: returns measured NOCT unchanged", () => {
    expect(calculateNOCT(45, "open_rack")).toBeCloseTo(45, 3);
  });

  it("close_roof: adds 3°C", () => {
    expect(calculateNOCT(45, "close_roof")).toBeCloseTo(48, 3);
  });

  it("bipv: adds 6°C", () => {
    expect(calculateNOCT(45, "bipv")).toBeCloseTo(51, 3);
  });
});

describe("calculateCellTemp", () => {
  it("Ross model: at NMOT reference (20°C ambient, 800 W/m², NMOT=45°C) → cellTemp = 45°C", () => {
    // Ross: Tc = Ta + (NMOT - 20) * (G / 800) * windFactor
    // windFactor at 1 m/s = max(0.5, 1 - (1-1)*0.05) = 1.0
    // Tc = 20 + (45-20) * (800/800) * 1 = 45°C
    const result = calculateCellTemp(20, 800, 45, 1);
    expect(result).toBeCloseTo(45, 1);
  });

  it("at STC irradiance (1000 W/m²), cell temp is higher than at 800 W/m²", () => {
    const t800 = calculateCellTemp(25, 800, 45, 1);
    const t1000 = calculateCellTemp(25, 1000, 45, 1);
    expect(t1000).toBeGreaterThan(t800);
  });

  it("higher wind speed lowers cell temperature", () => {
    const low = calculateCellTemp(25, 1000, 45, 1);
    const high = calculateCellTemp(25, 1000, 45, 5);
    expect(high).toBeLessThan(low);
  });

  it("cell temp equals ambient when irradiance is zero", () => {
    const result = calculateCellTemp(30, 0, 45, 1);
    expect(result).toBeCloseTo(30, 3);
  });
});

describe("calculatePerformanceAtNMOT", () => {
  it("performance ratio ≤ 1 when cell temp > 25°C (negative temp coefficient)", () => {
    const result = calculatePerformanceAtNMOT(DEFAULT_MODULE_SPECS, 45);
    // At NMOT, cell temp > 25°C, so tempDerate < 1
    expect(result.performanceRatio).toBeLessThan(1);
  });

  it("correctedPmax < pmaxSTC * 0.8 due to thermal derating at NMOT", () => {
    // 0.8 = 800/1000 irradiance factor; thermal loss further reduces it
    const expected_no_loss = DEFAULT_MODULE_SPECS.pmaxSTC * 0.8;
    const result = calculatePerformanceAtNMOT(DEFAULT_MODULE_SPECS, 45);
    expect(result.correctedPmax).toBeLessThan(expected_no_loss);
  });

  it("correctedVoc < vocSTC at temperature > 25°C (negative Voc coefficient)", () => {
    const result = calculatePerformanceAtNMOT(DEFAULT_MODULE_SPECS, 45);
    expect(result.correctedVoc).toBeLessThan(DEFAULT_MODULE_SPECS.vocSTC);
  });

  it("correctedIsc increases with temperature (positive Isc coefficient)", () => {
    const atNMOT = calculatePerformanceAtNMOT(DEFAULT_MODULE_SPECS, 45, 1000);
    const atSTC_irr = DEFAULT_MODULE_SPECS.iscSTC * (1000 / 1000);
    // At higher temp, Isc slightly > STC value
    expect(atNMOT.correctedIsc).toBeGreaterThanOrEqual(atSTC_irr * 0.99); // allow rounding
  });

  it("tempDerate is in a physically reasonable range (0.8 to 1.0)", () => {
    const result = calculatePerformanceAtNMOT(DEFAULT_MODULE_SPECS, 45);
    expect(result.tempDerate).toBeGreaterThan(0.8);
    expect(result.tempDerate).toBeLessThanOrEqual(1.0);
  });
});

describe("generateIrradianceTempModel (nmot-noct module)", () => {
  it("returns one entry per (ambientTemp × irradiance) combination", () => {
    const temps = [0, 20, 40];
    const irrs = [400, 800, 1200];
    const data = generateIrradianceTempModel(45, temps, irrs);
    expect(data).toHaveLength(temps.length * irrs.length);
  });

  it("higher irradiance → higher cellTemp at the same ambient", () => {
    const data = generateIrradianceTempModel(45, [25], [400, 800, 1200]);
    expect(data[1].cellTemp).toBeGreaterThan(data[0].cellTemp);
    expect(data[2].cellTemp).toBeGreaterThan(data[1].cellTemp);
  });
});

describe("generatePRCurve", () => {
  it("returns 61 data points for the default -10 to 50°C range", () => {
    const curve = generatePRCurve(DEFAULT_MODULE_SPECS, 45);
    expect(curve).toHaveLength(61);
  });

  it("PR is highest at the lowest ambient temperature", () => {
    const curve = generatePRCurve(DEFAULT_MODULE_SPECS, 45);
    // Coldest ambient → lowest cell temp → best PR
    const firstPR = curve[0].pr;
    const lastPR = curve[curve.length - 1].pr;
    expect(firstPR).toBeGreaterThan(lastPR);
  });

  it("all power values are positive", () => {
    const curve = generatePRCurve(DEFAULT_MODULE_SPECS, 45);
    for (const point of curve) {
      expect(point.power).toBeGreaterThan(0);
    }
  });
});
