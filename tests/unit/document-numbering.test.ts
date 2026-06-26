import { describe, it, expect } from 'vitest'
import {
  generateDocumentNumber,
  parseDocumentNumber,
  getNextSequence,
  generateNextDocumentNumber,
  DOCUMENT_TYPE_LABELS,
} from '@/lib/document-numbering'

// ────────────────────────────────────────────────────────────────────────────
// generateDocumentNumber — deterministic; does NOT touch sequenceCounters
// ────────────────────────────────────────────────────────────────────────────

describe('generateDocumentNumber', () => {
  describe('test_report', () => {
    it('formats TR-{STD}-{YEAR}-{SEQ}', () => {
      expect(
        generateDocumentNumber('test_report', 42, { standard: 'IEC 61215', year: 2026 })
      ).toBe('TR-61215-2026-042')
    })

    it('pads sequence to 3 digits', () => {
      expect(
        generateDocumentNumber('test_report', 1, { standard: 'IEC 61730', year: 2026 })
      ).toBe('TR-61730-2026-001')
    })

    it('strips non-numeric chars from unknown standard', () => {
      // 'Custom 99999' → digits only → '99999'
      expect(
        generateDocumentNumber('test_report', 5, { standard: 'Custom 99999', year: 2026 })
      ).toBe('TR-99999-2026-005')
    })
  })

  describe('test_protocol', () => {
    it('formats TP-{STD}-{TEST}-{YEAR}-{SEQ}', () => {
      expect(
        generateDocumentNumber('test_protocol', 5, {
          standard: 'IEC 61730',
          testCode: 'TC01',
          year: 2026,
        })
      ).toBe('TP-61730-TC01-2026-005')
    })

    it('uses GEN when testCode omitted', () => {
      expect(
        generateDocumentNumber('test_protocol', 1, { standard: 'IEC 61215', year: 2026 })
      ).toBe('TP-61215-GEN-2026-001')
    })
  })

  describe('analysis_report', () => {
    it('formats DA-{STD}-{YEAR}-{SEQ}', () => {
      expect(
        generateDocumentNumber('analysis_report', 3, { standard: 'IEC 60904', year: 2026 })
      ).toBe('DA-60904-2026-003')
    })
  })

  describe('raw_data', () => {
    it('formats RD-{STD}-{TEST}-{YEAR}-{SEQ}', () => {
      expect(
        generateDocumentNumber('raw_data', 10, {
          standard: 'IEC 61853',
          testCode: 'EY01',
          year: 2026,
        })
      ).toBe('RD-61853-EY01-2026-010')
    })
  })

  describe('calibration_cert', () => {
    it('formats CAL-{EQUIP}-{YEAR}-{SEQ}', () => {
      expect(
        generateDocumentNumber('calibration_cert', 3, { equipmentCode: 'SIM01', year: 2026 })
      ).toBe('CAL-SIM01-2026-003')
    })

    it('uses EQ when equipmentCode omitted', () => {
      expect(generateDocumentNumber('calibration_cert', 1, { year: 2026 })).toBe('CAL-EQ-2026-001')
    })
  })

  describe('sop', () => {
    it('formats SOP-{DEPT}-{YEAR}-{SEQ}', () => {
      expect(
        generateDocumentNumber('sop', 1, { department: 'QMS', year: 2026 })
      ).toBe('SOP-QMS-2026-001')
    })

    it('uses GEN when department omitted', () => {
      expect(generateDocumentNumber('sop', 2, { year: 2026 })).toBe('SOP-GEN-2026-002')
    })
  })

  describe('simple types (no context segment)', () => {
    it('formats NCR-{YEAR}-{SEQ}', () => {
      expect(generateDocumentNumber('ncr', 8, { year: 2026 })).toBe('NCR-2026-008')
    })

    it('formats CAPA-{YEAR}-{SEQ}', () => {
      expect(generateDocumentNumber('capa', 3, { year: 2026 })).toBe('CAPA-2026-003')
    })

    it('formats AR-{YEAR}-{SEQ}', () => {
      expect(generateDocumentNumber('audit_report', 5, { year: 2026 })).toBe('AR-2026-005')
    })
  })

  describe('known standard codes', () => {
    const cases: Array<[string, string]> = [
      ['IEC 61215', '61215'],
      ['IEC 61730', '61730'],
      ['IEC 61853', '61853'],
      ['IEC 60904', '60904'],
      ['IEC 62716', '62716'],
      ['IEC 61701', '61701'],
      ['IEC 62804', '62804'],
      ['ISO 17025', '17025'],
      ['ISO 9001', '9001'],
    ]

    it.each(cases)('%s → code %s in TR number', (standard, code) => {
      const num = generateDocumentNumber('test_report', 1, { standard, year: 2026 })
      expect(num).toBe(`TR-${code}-2026-001`)
    })
  })
})

// ────────────────────────────────────────────────────────────────────────────
// parseDocumentNumber
// ────────────────────────────────────────────────────────────────────────────

describe('parseDocumentNumber', () => {
  it('parses test report number into components', () => {
    const result = parseDocumentNumber('TR-61215-2026-042')
    expect(result.type).toBe('test_report')
    expect(result.prefix).toBe('TR')
    expect(result.year).toBe(2026)
    expect(result.sequence).toBe(42)
  })

  it('parses NCR number', () => {
    const result = parseDocumentNumber('NCR-2026-008')
    expect(result.type).toBe('ncr')
    expect(result.prefix).toBe('NCR')
    expect(result.year).toBe(2026)
    expect(result.sequence).toBe(8)
  })

  it('parses CAPA number', () => {
    const result = parseDocumentNumber('CAPA-2026-003')
    expect(result.type).toBe('capa')
    expect(result.year).toBe(2026)
    expect(result.sequence).toBe(3)
  })

  it('parses audit report number', () => {
    const result = parseDocumentNumber('AR-2026-005')
    expect(result.type).toBe('audit_report')
    expect(result.year).toBe(2026)
    expect(result.sequence).toBe(5)
  })

  it('parses calibration cert number', () => {
    const result = parseDocumentNumber('CAL-SIM01-2026-003')
    expect(result.type).toBe('calibration_cert')
    expect(result.year).toBe(2026)
    expect(result.sequence).toBe(3)
  })

  it('returns null type for unrecognised prefix', () => {
    const result = parseDocumentNumber('XYZ-2026-001')
    expect(result.type).toBeNull()
    expect(result.prefix).toBe('XYZ')
  })

  it('round-trips: generate → parse preserves year and sequence', () => {
    const num = generateDocumentNumber('sop', 7, { department: 'LAB', year: 2026 })
    const parsed = parseDocumentNumber(num)
    expect(parsed.year).toBe(2026)
    expect(parsed.sequence).toBe(7)
    expect(parsed.type).toBe('sop')
  })

  it('round-trips for test protocol with all context fields', () => {
    const num = generateDocumentNumber('test_protocol', 15, {
      standard: 'IEC 61215',
      testCode: 'HTXC',
      year: 2026,
    })
    const parsed = parseDocumentNumber(num)
    expect(parsed.year).toBe(2026)
    expect(parsed.sequence).toBe(15)
    expect(parsed.type).toBe('test_protocol')
  })
})

// ────────────────────────────────────────────────────────────────────────────
// getNextSequence — stateful; use a dedicated year to avoid collisions
// ────────────────────────────────────────────────────────────────────────────

describe('getNextSequence', () => {
  const TEST_YEAR = 2088

  it('returns a positive integer', () => {
    const seq = getNextSequence('ncr', TEST_YEAR)
    expect(seq).toBeGreaterThan(0)
    expect(Number.isInteger(seq)).toBe(true)
  })

  it('increments on successive calls for the same type and year', () => {
    const year = 2089
    const first = getNextSequence('sop', year)
    const second = getNextSequence('sop', year)
    expect(second).toBe(first + 1)
  })

  it('counters are independent per document type', () => {
    const year = 2090
    const ncrSeq = getNextSequence('ncr', year)
    const capaSeq = getNextSequence('capa', year)
    // Both should be 1 (new year, fresh counters)
    expect(ncrSeq).toBe(1)
    expect(capaSeq).toBe(1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// generateNextDocumentNumber
// ────────────────────────────────────────────────────────────────────────────

describe('generateNextDocumentNumber', () => {
  const TEST_YEAR = 2091

  it('returns a non-empty string starting with the correct prefix', () => {
    const num = generateNextDocumentNumber('capa', { year: TEST_YEAR })
    expect(typeof num).toBe('string')
    expect(num).toMatch(/^CAPA-/)
  })

  it('contains the year', () => {
    const num = generateNextDocumentNumber('ncr', { year: TEST_YEAR })
    expect(num).toContain(String(TEST_YEAR))
  })

  it('sequence increments across calls', () => {
    const year = 2092
    const first = generateNextDocumentNumber('audit_report', { year })
    const second = generateNextDocumentNumber('audit_report', { year })
    // Extract sequences from end of string (e.g. "AR-2092-001" → "001")
    const seq1 = parseInt(first.split('-').pop()!, 10)
    const seq2 = parseInt(second.split('-').pop()!, 10)
    expect(seq2).toBe(seq1 + 1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// DOCUMENT_TYPE_LABELS
// ────────────────────────────────────────────────────────────────────────────

describe('DOCUMENT_TYPE_LABELS', () => {
  it('has human-readable labels for each document type', () => {
    expect(DOCUMENT_TYPE_LABELS.test_report).toBe('Test Report')
    expect(DOCUMENT_TYPE_LABELS.test_protocol).toBe('Test Protocol')
    expect(DOCUMENT_TYPE_LABELS.sop).toBe('SOP')
    expect(DOCUMENT_TYPE_LABELS.calibration_cert).toBe('Calibration Certificate')
    expect(DOCUMENT_TYPE_LABELS.ncr).toBe('Non-Conformance Report')
    expect(DOCUMENT_TYPE_LABELS.capa).toBe('CAPA')
    expect(DOCUMENT_TYPE_LABELS.audit_report).toBe('Audit Report')
  })
})
