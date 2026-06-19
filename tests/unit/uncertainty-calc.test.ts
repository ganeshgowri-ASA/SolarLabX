import { describe, it, expect } from "vitest";
import {
  toStandardUncertainty,
  calculateTypeA,
  calculateCombinedUncertainty,
  welchSatterthwaite,
  getCoverageFactor,
  createComponent,
  calculateBudget,
  UNCERTAINTY_TEMPLATES,
  TEMPLATE_CATEGORIES,
} from "@/lib/uncertainty";

// ──────────────────────────────────────────────────
// toStandardUncertainty
// ──────────────────────────────────────────────────
describe("toStandardUncertainty", () => {
  it("normal distribution passes raw uncertainty through unchanged", () => {
    expect(toStandardUncertainty(1.0, "normal")).toBeCloseTo(1.0);
  });

  it("uniform distribution divides by sqrt(3)", () => {
    expect(toStandardUncertainty(1.0, "uniform")).toBeCloseTo(1 / Math.sqrt(3));
  });

  it("triangular distribution divides by sqrt(6)", () => {
    expect(toStandardUncertainty(1.0, "triangular")).toBeCloseTo(1 / Math.sqrt(6));
  });

  it("u-shaped distribution divides by sqrt(2)", () => {
    expect(toStandardUncertainty(1.0, "u-shaped")).toBeCloseTo(1 / Math.sqrt(2));
  });

  it("lognormal acts like normal (no divisor)", () => {
    expect(toStandardUncertainty(2.0, "lognormal")).toBeCloseTo(2.0);
  });

  it("expanded flag divides by k first then applies distribution", () => {
    // expanded normal with k=2: 2.0/2 = 1.0 then normal → 1.0
    expect(toStandardUncertainty(2.0, "normal", true, 2)).toBeCloseTo(1.0);
    // expanded uniform with k=2: 2.0/2 = 1.0 then /sqrt(3)
    expect(toStandardUncertainty(2.0, "uniform", true, 2)).toBeCloseTo(1 / Math.sqrt(3));
  });
});

// ──────────────────────────────────────────────────
// calculateTypeA
// ──────────────────────────────────────────────────
describe("calculateTypeA", () => {
  it("computes correct mean for a known set", () => {
    const { mean } = calculateTypeA([1, 2, 3, 4, 5]);
    expect(mean).toBeCloseTo(3.0);
  });

  it("computes Bessel-corrected std dev", () => {
    // sample [1,2,3,4,5], variance = 2.5, stdDev = sqrt(2.5)
    const { stdDev } = calculateTypeA([1, 2, 3, 4, 5]);
    expect(stdDev).toBeCloseTo(Math.sqrt(2.5));
  });

  it("standard uncertainty = stdDev / sqrt(n)", () => {
    const n = 5;
    const { stdDev, standardUncertainty } = calculateTypeA([1, 2, 3, 4, 5]);
    expect(standardUncertainty).toBeCloseTo(stdDev / Math.sqrt(n));
  });

  it("degrees of freedom = n - 1", () => {
    const { degreesOfFreedom } = calculateTypeA([10, 20, 30]);
    expect(degreesOfFreedom).toBe(2);
  });

  it("returns zero uncertainty for a single measurement", () => {
    const { standardUncertainty, degreesOfFreedom } = calculateTypeA([42]);
    expect(standardUncertainty).toBe(0);
    expect(degreesOfFreedom).toBe(0);
  });

  it("identical measurements produce zero std dev", () => {
    const { stdDev } = calculateTypeA([5, 5, 5, 5]);
    expect(stdDev).toBeCloseTo(0);
  });
});

// ──────────────────────────────────────────────────
// getCoverageFactor (Student-t table)
// ──────────────────────────────────────────────────
describe("getCoverageFactor", () => {
  it("returns 1.96 for large DOF at 95%", () => {
    expect(getCoverageFactor(Infinity)).toBeCloseTo(1.96);
    expect(getCoverageFactor(200)).toBeCloseTo(1.96);
  });

  it("returns 2.576 for large DOF at 99%", () => {
    expect(getCoverageFactor(Infinity, 0.99)).toBeCloseTo(2.576);
  });

  it("returns tabulated value for DOF=2 at 95%", () => {
    expect(getCoverageFactor(2)).toBeCloseTo(4.303);
  });

  it("returns tabulated value for DOF=10 at 95%", () => {
    expect(getCoverageFactor(10)).toBeCloseTo(2.228);
  });

  it("interpolates between DOF 10 and 11", () => {
    // DOF=10 → 2.228, DOF=11 → 2.201; halfway should be ~2.2145
    const half = getCoverageFactor(10.5 as number);
    expect(half).toBeGreaterThan(2.201);
    expect(half).toBeLessThan(2.228);
  });

  it("k decreases monotonically as DOF increases (95%)", () => {
    const dofs = [2, 5, 10, 20, 50, 100];
    const ks = dofs.map((d) => getCoverageFactor(d));
    for (let i = 1; i < ks.length; i++) {
      expect(ks[i]).toBeLessThan(ks[i - 1]);
    }
  });
});

// ──────────────────────────────────────────────────
// createComponent
// ──────────────────────────────────────────────────
describe("createComponent", () => {
  it("correctly derives standardUncertainty for uniform distribution", () => {
    const c = createComponent("c1", "test", 0, 1.0, "uniform", "typeB", 1.0);
    expect(c.standardUncertainty).toBeCloseTo(1 / Math.sqrt(3));
  });

  it("varianceContribution = (ci * u)^2", () => {
    const ci = 2.0;
    const u = 0.5; // normal, so su = 0.5
    const c = createComponent("c2", "test", 0, u, "normal", "typeB", ci);
    expect(c.varianceContribution).toBeCloseTo((ci * u) ** 2);
  });

  it("percentageContribution is initialised to 0", () => {
    const c = createComponent("c3", "test", 0, 1.0, "normal", "typeB", 1.0);
    expect(c.percentageContribution).toBe(0);
  });

  it("passes optional fields through", () => {
    const c = createComponent("c4", "label", 100, 0.5, "normal", "typeA", 1.0, 9, false, "Equipment", "some desc");
    expect(c.category).toBe("Equipment");
    expect(c.description).toBe("some desc");
    expect(c.degreesOfFreedom).toBe(9);
  });
});

// ──────────────────────────────────────────────────
// calculateCombinedUncertainty
// ──────────────────────────────────────────────────
describe("calculateCombinedUncertainty", () => {
  it("combines two independent components in quadrature", () => {
    const c1 = createComponent("a", "a", 0, 3.0, "normal", "typeB", 1.0); // su=3 vc=9
    const c2 = createComponent("b", "b", 0, 4.0, "normal", "typeB", 1.0); // su=4 vc=16
    const uc = calculateCombinedUncertainty([c1, c2]);
    expect(uc).toBeCloseTo(5.0); // sqrt(9+16)=5
  });

  it("returns zero for empty component list", () => {
    expect(calculateCombinedUncertainty([])).toBe(0);
  });

  it("positive correlation increases combined uncertainty", () => {
    const c1 = createComponent("x", "x", 0, 1.0, "normal", "typeB", 1.0);
    const c2 = createComponent("y", "y", 0, 1.0, "normal", "typeB", 1.0);
    const uncorrelated = calculateCombinedUncertainty([c1, c2]);
    const correlated = calculateCombinedUncertainty([c1, c2], [
      { component1Id: "x", component2Id: "y", coefficient: 1.0 },
    ]);
    expect(correlated).toBeGreaterThan(uncorrelated);
  });

  it("negative correlation decreases combined uncertainty", () => {
    const c1 = createComponent("p", "p", 0, 1.0, "normal", "typeB", 1.0);
    const c2 = createComponent("q", "q", 0, 1.0, "normal", "typeB", 1.0);
    const uncorrelated = calculateCombinedUncertainty([c1, c2]);
    const correlated = calculateCombinedUncertainty([c1, c2], [
      { component1Id: "p", component2Id: "q", coefficient: -1.0 },
    ]);
    expect(correlated).toBeLessThan(uncorrelated);
  });
});

// ──────────────────────────────────────────────────
// welchSatterthwaite
// ──────────────────────────────────────────────────
describe("welchSatterthwaite", () => {
  it("returns Infinity when all components have Infinity DOF", () => {
    const c1 = createComponent("a", "a", 0, 1.0, "normal", "typeB", 1.0, Infinity);
    const c2 = createComponent("b", "b", 0, 1.0, "normal", "typeB", 1.0, Infinity);
    expect(welchSatterthwaite([c1, c2])).toBe(Infinity);
  });

  it("finite DOF components reduce effective DOF", () => {
    const c1 = createComponent("a", "a", 0, 1.0, "normal", "typeA", 1.0, 9);
    const c2 = createComponent("b", "b", 0, 0.2, "normal", "typeB", 1.0, Infinity);
    const vEff = welchSatterthwaite([c1, c2]);
    expect(typeof vEff).toBe("number");
    expect(vEff).toBeGreaterThanOrEqual(9);
  });

  it("returns integer (rounded)", () => {
    const c1 = createComponent("a", "a", 0, 1.0, "normal", "typeA", 1.0, 5);
    const vEff = welchSatterthwaite([c1]);
    expect(Number.isInteger(vEff)).toBe(true);
  });
});

// ──────────────────────────────────────────────────
// calculateBudget — end-to-end with IEC 61215 Pmax data
// ──────────────────────────────────────────────────
describe("calculateBudget (IEC 61215 Pmax)", () => {
  // Build components similar to IEC_61215_PMAX template
  const refCal = createComponent("rc", "Ref cell cal", 0, 1.5, "normal", "typeB", 1.0, Infinity);
  const nonUnif = createComponent("nu", "Spatial non-unif", 0, 2.0, "uniform", "typeB", 1.0, Infinity);
  const repeat = createComponent("rep", "Repeatability", 0, 0.3, "normal", "typeA", 1.0, 9);

  const budget = calculateBudget(
    "Pmax Budget",
    "Pmax",
    350,
    [refCal, nonUnif, repeat],
    0.95
  );

  it("returns an object with all required fields", () => {
    expect(budget).toHaveProperty("combinedStandardUncertainty");
    expect(budget).toHaveProperty("expandedUncertainty");
    expect(budget).toHaveProperty("coverageFactor");
    expect(budget).toHaveProperty("effectiveDegreesOfFreedom");
    expect(budget).toHaveProperty("relativeUncertaintyPercent");
    expect(budget).toHaveProperty("components");
    expect(budget).toHaveProperty("createdAt");
  });

  it("combined uncertainty is positive", () => {
    expect(budget.combinedStandardUncertainty).toBeGreaterThan(0);
  });

  it("expanded uncertainty > combined standard uncertainty", () => {
    expect(budget.expandedUncertainty).toBeGreaterThan(budget.combinedStandardUncertainty);
  });

  it("coverage factor is approximately 2 for large effective DOF", () => {
    expect(budget.coverageFactor).toBeCloseTo(2.0, 0);
  });

  it("components are sorted by descending percentageContribution", () => {
    const pcts = budget.components.map((c) => c.percentageContribution);
    for (let i = 1; i < pcts.length; i++) {
      expect(pcts[i]).toBeLessThanOrEqual(pcts[i - 1]);
    }
  });

  it("percentageContributions sum to ~100", () => {
    const total = budget.components.reduce((s, c) => s + c.percentageContribution, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it("relativeUncertaintyPercent is positive for non-zero measuredValue", () => {
    expect(budget.relativeUncertaintyPercent).toBeGreaterThan(0);
  });

  it("relativeUncertainty is U/|measured_value|×100", () => {
    const expected = (budget.expandedUncertainty / 350) * 100;
    expect(budget.relativeUncertaintyPercent).toBeCloseTo(expected);
  });

  it("coverageProbability is stored correctly", () => {
    expect(budget.coverageProbability).toBe(0.95);
  });
});

// ──────────────────────────────────────────────────
// UNCERTAINTY_TEMPLATES catalogue
// ──────────────────────────────────────────────────
describe("UNCERTAINTY_TEMPLATES", () => {
  it("contains 21 templates total", () => {
    expect(UNCERTAINTY_TEMPLATES.length).toBe(21);
  });

  it("every template has a unique id", () => {
    const ids = UNCERTAINTY_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template has at least one component", () => {
    for (const t of UNCERTAINTY_TEMPLATES) {
      expect(t.components.length).toBeGreaterThan(0);
    }
  });

  it("all components have positive defaultUncertainty", () => {
    for (const t of UNCERTAINTY_TEMPLATES) {
      for (const c of t.components) {
        expect(c.defaultUncertainty).toBeGreaterThan(0);
      }
    }
  });

  it("all components have valid distribution type", () => {
    const valid = new Set(["normal", "uniform", "triangular", "lognormal", "u-shaped"]);
    for (const t of UNCERTAINTY_TEMPLATES) {
      for (const c of t.components) {
        expect(valid.has(c.distribution)).toBe(true);
      }
    }
  });

  it("all components have valid type (typeA or typeB)", () => {
    for (const t of UNCERTAINTY_TEMPLATES) {
      for (const c of t.components) {
        expect(["typeA", "typeB"]).toContain(c.type);
      }
    }
  });

  it("IEC 61215 Pmax template has 14 components", () => {
    const pmax = UNCERTAINTY_TEMPLATES.find((t) => t.id === "iec61215-pmax");
    expect(pmax).toBeDefined();
    expect(pmax!.components.length).toBe(14);
  });

  it("IEC 61215 Pmax measurand and unit are correct", () => {
    const pmax = UNCERTAINTY_TEMPLATES.find((t) => t.id === "iec61215-pmax");
    expect(pmax!.measurand).toBe("Pmax");
    expect(pmax!.unit).toBe("W");
  });
});

// ──────────────────────────────────────────────────
// TEMPLATE_CATEGORIES
// ──────────────────────────────────────────────────
describe("TEMPLATE_CATEGORIES", () => {
  it("category counts match template counts", () => {
    for (const cat of TEMPLATE_CATEGORIES) {
      const actual = UNCERTAINTY_TEMPLATES.filter((t) => t.category === cat.id).length;
      expect(actual).toBe(cat.count);
    }
  });

  it("all template categories exist in TEMPLATE_CATEGORIES", () => {
    const catIds = new Set(TEMPLATE_CATEGORIES.map((c) => c.id));
    for (const t of UNCERTAINTY_TEMPLATES) {
      expect(catIds.has(t.category)).toBe(true);
    }
  });
});
