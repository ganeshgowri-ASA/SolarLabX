import { describe, it, expect } from "vitest";
import {
  calculateSpectralMatch,
  calculateUniformity,
  calculateTemporalStability,
  overallClassification,
  WAVELENGTH_BANDS,
  AM15G_REFERENCE,
  type SpectralDataPoint,
} from "@/lib/sun-simulator";

/**
 * Build a synthetic step spectrum engineered to produce band fractions that
 * match WAVELENGTH_BANDS.am15gFraction exactly (ratio = 1.0 for every band).
 *
 * For constant irradiance c_i across band i (width w_i nm):
 *   bandFraction_i = c_i * w_i / sum(c_j * w_j)
 *
 * Setting totalIntegral = 10000 and solving gives:
 *   c_i = am15gFraction_i * totalIntegral / (100 * w_i)
 *
 * Bands (nm):   400-500  500-600  600-700  700-800  800-900  900-1100
 * Width (nm):     100      100      100      100      100      200
 * am15gFraction: 18.4    19.9    18.4    14.9    12.5    15.9  (sums to 100)
 * c_i (W/m²/nm): 18.4    19.9    18.4    14.9    12.5    7.95
 */
function engineeredAplusSpectrum(): SpectralDataPoint[] {
  const segments = [
    { start: 400, end: 500, irr: 18.4 },
    { start: 500, end: 600, irr: 19.9 },
    { start: 600, end: 700, irr: 18.4 },
    { start: 700, end: 800, irr: 14.9 },
    { start: 800, end: 900, irr: 12.5 },
    { start: 900, end: 1100, irr: 7.95 },
  ];
  const points: SpectralDataPoint[] = [];
  for (const seg of segments) {
    for (let wl = seg.start; wl <= seg.end; wl += 5) {
      points.push({ wavelength: wl, irradiance: seg.irr });
    }
  }
  // Deduplicate boundary wavelengths: keep the first occurrence (end of previous band)
  const seen = new Set<number>();
  return points.filter((p) => {
    if (seen.has(p.wavelength)) return false;
    seen.add(p.wavelength);
    return true;
  });
}

describe("calculateSpectralMatch", () => {
  it("engineered A+ spectrum — all band ratios ≈ 1.0 → grade A+", () => {
    const result = calculateSpectralMatch(engineeredAplusSpectrum());
    expect(result.grade).toBe("A+");
    for (const interval of result.intervals) {
      expect(interval.ratio).toBeGreaterThan(0.875);
      expect(interval.ratio).toBeLessThan(1.125);
    }
  });

  it("returns 6 spectral intervals matching IEC 60904-9 Ed.3 bands", () => {
    const result = calculateSpectralMatch(engineeredAplusSpectrum());
    expect(result.intervals).toHaveLength(6);
  });

  it("mean ratio for engineered A+ spectrum is close to 1.0", () => {
    const result = calculateSpectralMatch(engineeredAplusSpectrum());
    expect(result.meanRatio).toBeGreaterThan(0.95);
    expect(result.meanRatio).toBeLessThan(1.05);
  });

  it("uniformly scaled spectrum (2×) produces the same grade", () => {
    const scaled = engineeredAplusSpectrum().map((d) => ({ ...d, irradiance: d.irradiance * 2 }));
    const base = calculateSpectralMatch(engineeredAplusSpectrum());
    const result = calculateSpectralMatch(scaled);
    expect(result.grade).toBe(base.grade);
  });

  it("grade degrades when one band is zeroed out", () => {
    // Zero the 400-500nm band → that band's ratio = 0 → below C threshold
    const data = engineeredAplusSpectrum().map((d) =>
      d.wavelength >= 400 && d.wavelength < 500 ? { ...d, irradiance: 0 } : d
    );
    const result = calculateSpectralMatch(data);
    expect(result.grade).not.toBe("A+");
    expect(result.grade).not.toBe("A");
  });
});

describe("calculateUniformity", () => {
  it("perfectly uniform grid → non-uniformity = 0%, grade = A+", () => {
    const grid = [
      [1000, 1000, 1000],
      [1000, 1000, 1000],
      [1000, 1000, 1000],
    ];
    const result = calculateUniformity(grid);
    expect(result.nonUniformity).toBeCloseTo(0, 6);
    expect(result.grade).toBe("A+");
  });

  it("non-uniformity ≤ 1% → grade A+", () => {
    // max=1010, min=990 → non-uniformity = (20/2000)*100 = 1%
    const grid = [[990, 1000, 1010]];
    const result = calculateUniformity(grid);
    expect(result.nonUniformity).toBeCloseTo(1.0, 3);
    expect(result.grade).toBe("A+");
  });

  it("non-uniformity between 1% and 2% → grade A", () => {
    // max=1015, min=985 → (30/2000)*100 = 1.5%
    const grid = [[985, 1000, 1015]];
    const result = calculateUniformity(grid);
    expect(result.grade).toBe("A");
  });

  it("non-uniformity between 2% and 5% → grade B", () => {
    // max=1030, min=970 → (60/2000)*100 = 3%
    const grid = [[970, 1000, 1030]];
    const result = calculateUniformity(grid);
    expect(result.grade).toBe("B");
  });

  it("non-uniformity > 10% → grade Fail", () => {
    const grid = [[500, 1000, 1500]];
    const result = calculateUniformity(grid);
    expect(result.grade).toBe("Fail");
  });

  it("computed mean matches arithmetic mean of all cells", () => {
    const grid = [[900, 1000], [1100, 1200]];
    const result = calculateUniformity(grid);
    expect(result.mean).toBeCloseTo((900 + 1000 + 1100 + 1200) / 4, 6);
  });

  it("min and max are correct", () => {
    const grid = [[800, 950, 1050, 1200]];
    const result = calculateUniformity(grid);
    expect(result.min).toBe(800);
    expect(result.max).toBe(1200);
  });
});

describe("calculateTemporalStability", () => {
  it("constant signal → STI = 0, LTI = 0, grade A+", () => {
    const flat = Array.from({ length: 10 }, (_, i) => ({ time: i, irradiance: 1000 }));
    const result = calculateTemporalStability(flat, flat);
    expect(result.sti).toBeCloseTo(0, 6);
    expect(result.lti).toBeCloseTo(0, 6);
    expect(result.overallGrade).toBe("A+");
  });

  it("STI ≤ 0.5% → stiGrade A+", () => {
    const data = [
      { time: 0, irradiance: 999 },
      { time: 1, irradiance: 1001 },
    ];
    const flat = [{ time: 0, irradiance: 1000 }, { time: 1, irradiance: 1000 }];
    const result = calculateTemporalStability(data, flat);
    // (1001-999)/(1001+999)*100 = 0.1% → A+
    expect(result.stiGrade).toBe("A+");
  });

  it("overall grade is the worse of STI and LTI grades", () => {
    // High variation in LTI data → B or worse
    const stiData = Array.from({ length: 5 }, (_, i) => ({ time: i, irradiance: 1000 }));
    const ltiData = [
      { time: 0, irradiance: 700 },
      { time: 1, irradiance: 1300 },
    ]; // (600/2000)*100 = 30% → Fail
    const result = calculateTemporalStability(stiData, ltiData);
    expect(result.overallGrade).toBe("Fail");
  });
});

describe("overallClassification", () => {
  it("all A+ → A+", () => {
    expect(overallClassification("A+", "A+", "A+")).toBe("A+");
  });

  it("worst component wins: A+, A, A → A", () => {
    expect(overallClassification("A+", "A", "A")).toBe("A");
  });

  it("one Fail → Fail", () => {
    expect(overallClassification("A+", "B", "Fail")).toBe("Fail");
  });

  it("A+, A+, B → B", () => {
    expect(overallClassification("A+", "A+", "B")).toBe("B");
  });

  it("C + A → C", () => {
    expect(overallClassification("C", "A", "A")).toBe("C");
  });
});

describe("WAVELENGTH_BANDS", () => {
  it("has exactly 6 bands per IEC 60904-9 Ed.3", () => {
    expect(WAVELENGTH_BANDS).toHaveLength(6);
  });

  it("AM1.5G fractions sum to approximately 100%", () => {
    const total = WAVELENGTH_BANDS.reduce((sum, b) => sum + b.am15gFraction, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it("bands cover the full 400–1100nm range without gaps", () => {
    for (let i = 1; i < WAVELENGTH_BANDS.length; i++) {
      expect(WAVELENGTH_BANDS[i].start).toBe(WAVELENGTH_BANDS[i - 1].end);
    }
  });
});
