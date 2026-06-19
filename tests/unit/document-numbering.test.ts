import { describe, it, expect } from "vitest";
import {
  generateDocumentNumber,
  parseDocumentNumber,
  getNextSequence,
  generateNextDocumentNumber,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_COLORS,
} from "@/lib/document-numbering";

describe("generateDocumentNumber", () => {
  it("generates test_report number with standard code", () => {
    const num = generateDocumentNumber("test_report", 1, { standard: "IEC 61215", year: 2026 });
    expect(num).toBe("TR-61215-2026-001");
  });

  it("generates test_report with IEC 61730 standard", () => {
    const num = generateDocumentNumber("test_report", 42, { standard: "IEC 61730", year: 2026 });
    expect(num).toBe("TR-61730-2026-042");
  });

  it("pads sequence with leading zeros to 3 digits", () => {
    const num = generateDocumentNumber("ncr", 5, { year: 2026 });
    expect(num).toBe("NCR-2026-005");
  });

  it("generates test_protocol with testCode", () => {
    const num = generateDocumentNumber("test_protocol", 7, {
      standard: "IEC 61853",
      testCode: "MQT10",
      year: 2026,
    });
    expect(num).toBe("TP-61853-MQT10-2026-007");
  });

  it("generates calibration_cert with equipmentCode", () => {
    const num = generateDocumentNumber("calibration_cert", 3, {
      equipmentCode: "SS-001",
      year: 2026,
    });
    expect(num).toBe("CAL-SS-001-2026-003");
  });

  it("generates sop with department", () => {
    const num = generateDocumentNumber("sop", 12, { department: "LIMS", year: 2026 });
    expect(num).toBe("SOP-LIMS-2026-012");
  });

  it("generates analysis_report number", () => {
    const num = generateDocumentNumber("analysis_report", 9, { standard: "ISO 17025", year: 2026 });
    expect(num).toBe("DA-17025-2026-009");
  });

  it("generates raw_data number with testCode", () => {
    const num = generateDocumentNumber("raw_data", 20, {
      standard: "IEC 60904",
      testCode: "IV",
      year: 2026,
    });
    expect(num).toBe("RD-60904-IV-2026-020");
  });

  it("generates capa number without extra options", () => {
    const num = generateDocumentNumber("capa", 3, { year: 2026 });
    expect(num).toBe("CAPA-2026-003");
  });

  it("generates audit_report number", () => {
    const num = generateDocumentNumber("audit_report", 5, { year: 2026 });
    expect(num).toBe("AR-2026-005");
  });

  it("falls back to numeric extraction for unknown standard names", () => {
    const num = generateDocumentNumber("test_report", 1, { standard: "NABL 141", year: 2026 });
    expect(num).toBe("TR-141-2026-001");
  });

  it("uses current year when year is not provided", () => {
    const num = generateDocumentNumber("ncr", 1);
    expect(num).toMatch(/^NCR-\d{4}-001$/);
  });
});

describe("parseDocumentNumber", () => {
  it("parses a test_report number correctly", () => {
    const result = parseDocumentNumber("TR-61215-2026-042");
    expect(result.type).toBe("test_report");
    expect(result.prefix).toBe("TR");
    expect(result.year).toBe(2026);
    expect(result.sequence).toBe(42);
  });

  it("parses an NCR number", () => {
    const result = parseDocumentNumber("NCR-2026-008");
    expect(result.type).toBe("ncr");
    expect(result.prefix).toBe("NCR");
    expect(result.year).toBe(2026);
    expect(result.sequence).toBe(8);
  });

  it("parses a SOP number", () => {
    const result = parseDocumentNumber("SOP-LIMS-2026-012");
    expect(result.type).toBe("sop");
    expect(result.year).toBe(2026);
    expect(result.sequence).toBe(12);
  });

  it("parses a CAL number", () => {
    const result = parseDocumentNumber("CAL-SS-001-2026-003");
    expect(result.type).toBe("calibration_cert");
    expect(result.year).toBe(2026);
    expect(result.sequence).toBe(3);
  });

  it("returns null type for unknown prefix", () => {
    const result = parseDocumentNumber("XYZ-2026-001");
    expect(result.type).toBeNull();
    expect(result.prefix).toBe("XYZ");
  });

  it("returns null for malformed number with no separators", () => {
    const result = parseDocumentNumber("NOSEPERATORS");
    expect(result.year).toBeNull();
    expect(result.sequence).toBeNull();
  });
});

describe("getNextSequence", () => {
  it("returns an integer greater than zero for test_report 2026", () => {
    const seq = getNextSequence("test_report", 2026);
    expect(typeof seq).toBe("number");
    expect(Number.isInteger(seq)).toBe(true);
    expect(seq).toBeGreaterThan(0);
  });

  it("increments on each call", () => {
    const seq1 = getNextSequence("ncr", 2026);
    const seq2 = getNextSequence("ncr", 2026);
    expect(seq2).toBe(seq1 + 1);
  });

  it("starts a fresh counter for an unknown year", () => {
    const seq = getNextSequence("capa", 2099);
    expect(seq).toBe(1);
  });
});

describe("generateNextDocumentNumber", () => {
  it("returns a non-empty string", () => {
    const num = generateNextDocumentNumber("audit_report", { year: 2026 });
    expect(typeof num).toBe("string");
    expect(num.length).toBeGreaterThan(0);
    expect(num).toMatch(/^AR-/);
  });

  it("produces unique numbers on successive calls", () => {
    const a = generateNextDocumentNumber("sop", { department: "QMS", year: 2026 });
    const b = generateNextDocumentNumber("sop", { department: "QMS", year: 2026 });
    expect(a).not.toBe(b);
  });
});

describe("DOCUMENT_TYPE_LABELS", () => {
  it("has an entry for every document type", () => {
    const types = [
      "test_report", "test_protocol", "analysis_report", "raw_data",
      "calibration_cert", "sop", "ncr", "capa", "audit_report",
    ];
    for (const t of types) {
      expect(DOCUMENT_TYPE_LABELS).toHaveProperty(t);
      expect(typeof DOCUMENT_TYPE_LABELS[t as keyof typeof DOCUMENT_TYPE_LABELS]).toBe("string");
    }
  });
});

describe("DOCUMENT_TYPE_COLORS", () => {
  it("every entry has bg, text and border keys", () => {
    for (const [, v] of Object.entries(DOCUMENT_TYPE_COLORS)) {
      expect(v).toHaveProperty("bg");
      expect(v).toHaveProperty("text");
      expect(v).toHaveProperty("border");
    }
  });
});
