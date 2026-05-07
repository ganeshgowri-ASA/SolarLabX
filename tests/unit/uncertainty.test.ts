import { describe, it, expect } from "vitest";
import {
  toStandardUncertainty,
  calculateTypeA,
  calculateCombinedUncertainty,
  welchSatterthwaite,
  getCoverageFactor,
  createComponent,
} from "@/lib/uncertainty";

describe("toStandardUncertainty", () => {
  it("normal distribution: returns value unchanged", () => {
    expect(toStandardUncertainty(1.0, "normal")).toBeCloseTo(1.0, 10);
  });

  it("uniform distribution: divides by √3", () => {
    const u = toStandardUncertainty(1.0, "uniform");
    expect(u).toBeCloseTo(1 / Math.sqrt(3), 10);
  });

  it("triangular distribution: divides by √6", () => {
    const u = toStandardUncertainty(1.0, "triangular");
    expect(u).toBeCloseTo(1 / Math.sqrt(6), 10);
  });

  it("u-shaped distribution: divides by √2", () => {
    const u = toStandardUncertainty(1.0, "u-shaped");
    expect(u).toBeCloseTo(1 / Math.sqrt(2), 10);
  });

  it("expanded uncertainty with k=2: halves before applying distribution", () => {
    // isExpanded=true, k=2, normal → u/k = 0.5
    const u = toStandardUncertainty(1.0, "normal", true, 2);
    expect(u).toBeCloseTo(0.5, 10);
  });

  it("expanded uniform with k=2: (raw/k) / √3", () => {
    const u = toStandardUncertainty(Math.sqrt(3), "uniform", true, 2);
    expect(u).toBeCloseTo(0.5, 8);
  });
});

describe("calculateTypeA", () => {
  it("single measurement: returns mean and zero uncertainty", () => {
    const result = calculateTypeA([5.0]);
    expect(result.mean).toBe(5.0);
    expect(result.standardUncertainty).toBe(0);
    expect(result.degreesOfFreedom).toBe(0);
  });

  it("identical measurements: zero standard deviation", () => {
    const result = calculateTypeA([3, 3, 3, 3, 3]);
    expect(result.stdDev).toBeCloseTo(0, 10);
    expect(result.standardUncertainty).toBeCloseTo(0, 10);
  });

  it("computes correct mean for known dataset", () => {
    const result = calculateTypeA([1, 2, 3, 4, 5]);
    expect(result.mean).toBeCloseTo(3.0, 10);
    expect(result.n).toBe(5);
    expect(result.degreesOfFreedom).toBe(4);
  });

  it("standard uncertainty = stdDev / √n", () => {
    const measurements = [10.1, 10.3, 9.9, 10.2, 10.0];
    const result = calculateTypeA(measurements);
    expect(result.standardUncertainty).toBeCloseTo(result.stdDev / Math.sqrt(5), 8);
  });

  it("known dataset: correct Bessel-corrected standard deviation", () => {
    // [0, 2]: n=2, mean=1, sample variance=(1+1)/1=2, stdDev=√2
    const result = calculateTypeA([0, 2]);
    expect(result.mean).toBeCloseTo(1.0, 10);
    expect(result.stdDev).toBeCloseTo(Math.sqrt(2), 8);
    expect(result.standardUncertainty).toBeCloseTo(1.0, 8); // √2/√2
  });
});

describe("getCoverageFactor", () => {
  it("returns 1.96 for infinite DOF at 95%", () => {
    expect(getCoverageFactor(Infinity)).toBeCloseTo(1.96, 3);
  });

  it("returns 2.576 for infinite DOF at 99%", () => {
    expect(getCoverageFactor(Infinity, 0.99)).toBeCloseTo(2.576, 3);
  });

  it("returns table value for dof=10 at 95%: 2.228", () => {
    expect(getCoverageFactor(10)).toBeCloseTo(2.228, 3);
  });

  it("returns table value for dof=2 at 95%: 4.303", () => {
    expect(getCoverageFactor(2)).toBeCloseTo(4.303, 3);
  });

  it("returns table value for dof=1 at 99%: 63.66", () => {
    expect(getCoverageFactor(1, 0.99)).toBeCloseTo(63.66, 2);
  });

  it("coverage factor decreases as DOF increases (monotonic)", () => {
    const dofs = [1, 2, 5, 10, 20, 30, 100];
    const factors = dofs.map((d) => getCoverageFactor(d));
    for (let i = 1; i < factors.length; i++) {
      expect(factors[i]).toBeLessThan(factors[i - 1]);
    }
  });

  it("interpolates between table entries", () => {
    // dof=12 should be between 2.201 (dof=11) and 2.179 (dof=12) — exact table hit
    const k = getCoverageFactor(12);
    expect(k).toBeCloseTo(2.179, 3);
  });
});

describe("welchSatterthwaite", () => {
  it("returns Infinity when all DOF are Infinity", () => {
    const components = [
      createComponent("a", "A", 1, 0.1, "normal", "typeB", 1, Infinity),
      createComponent("b", "B", 1, 0.2, "uniform", "typeB", 1, Infinity),
    ];
    expect(welchSatterthwaite(components)).toBe(Infinity);
  });

  it("finite DOF reduces effective degrees of freedom vs. infinity", () => {
    const inf = [
      createComponent("a", "A", 1, 0.1, "normal", "typeB", 1, Infinity),
    ];
    const fin = [
      createComponent("a", "A", 1, 0.1, "normal", "typeA", 1, 9),
    ];
    expect(welchSatterthwaite(fin)).toBeLessThan(welchSatterthwaite(inf));
  });
});

describe("calculateCombinedUncertainty", () => {
  it("returns zero for empty components list", () => {
    expect(calculateCombinedUncertainty([])).toBe(0);
  });

  it("combines independent components in quadrature", () => {
    // u1 = 0.3, u2 = 0.4 → combined = 0.5
    const c1 = createComponent("c1", "C1", 0, 0.3, "normal", "typeB", 1);
    const c2 = createComponent("c2", "C2", 0, 0.4, "normal", "typeB", 1);
    const combined = calculateCombinedUncertainty([c1, c2]);
    expect(combined).toBeCloseTo(0.5, 6);
  });

  it("single component: combined uncertainty equals its standard uncertainty", () => {
    const c = createComponent("c1", "C1", 0, 0.5, "normal", "typeB", 1);
    expect(calculateCombinedUncertainty([c])).toBeCloseTo(0.5, 10);
  });

  it("sensitivity coefficient of 2 doubles the contribution", () => {
    const c_s1 = createComponent("c1", "C1", 0, 0.1, "normal", "typeB", 1);
    const c_s2 = createComponent("c2", "C2", 0, 0.1, "normal", "typeB", 2);
    const r1 = calculateCombinedUncertainty([c_s1]);
    const r2 = calculateCombinedUncertainty([c_s2]);
    expect(r2).toBeCloseTo(r1 * 2, 8);
  });
});

describe("createComponent", () => {
  it("correctly converts uniform uncertainty to standard uncertainty", () => {
    const c = createComponent("id", "Name", 10, 0.6, "uniform", "typeB", 1);
    expect(c.standardUncertainty).toBeCloseTo(0.6 / Math.sqrt(3), 8);
  });

  it("varianceContribution = (sensitivity × standardUncertainty)²", () => {
    const sensitivity = 3;
    const c = createComponent("id", "Name", 10, 0.5, "normal", "typeB", sensitivity);
    const expected = (sensitivity * 0.5) ** 2;
    expect(c.varianceContribution).toBeCloseTo(expected, 8);
  });
});
