// ============================================================================
// Document Numbering Engine - ISO 17025 & ISO 9001 Compliant
// Central registry with sequential numbering, no gaps
// ============================================================================

export type DocumentType =
  | 'test_report'
  | 'test_protocol'
  | 'analysis_report'
  | 'raw_data'
  | 'calibration_cert'
  | 'sop'
  | 'ncr'
  | 'capa'
  | 'audit_report'

export interface DocumentRegistryEntry {
  id: string
  documentNumber: string
  documentType: DocumentType
  title: string
  standard?: string
  testCode?: string
  equipmentCode?: string
  department?: string
  year: number
  sequence: number
  createdBy: string
  createdAt: string
  status: 'active' | 'superseded' | 'voided'
  linkedDocuments: string[]
  revision: number
  description: string
}

// Prefix patterns per document type
const DOCUMENT_PREFIXES: Record<DocumentType, string> = {
  test_report: 'TR',
  test_protocol: 'TP',
  analysis_report: 'DA',
  raw_data: 'RD',
  calibration_cert: 'CAL',
  sop: 'SOP',
  ncr: 'NCR',
  capa: 'CAPA',
  audit_report: 'AR',
}

// Standard code mapping — module-level constant (no per-call object allocation)
const STANDARD_CODES: Record<string, string> = {
  'IEC 61215': '61215',
  'IEC 61730': '61730',
  'IEC 61853': '61853',
  'IEC 60904': '60904',
  'IEC 62716': '62716',
  'IEC 61701': '61701',
  'IEC 62804': '62804',
  'ISO 17025': '17025',
  'ISO 9001': '9001',
}

function getStandardCode(standard: string): string {
  return STANDARD_CODES[standard] ?? standard.replace(/[^0-9]/g, '')
}

// Format families — adding a new DocumentType requires one entry here and
// one in DOCUMENT_PREFIXES; no switch case needed.
type DocFormat = 'std' | 'std_test' | 'equip' | 'dept' | 'plain'

const DOCUMENT_FORMATS: Record<DocumentType, DocFormat> = {
  test_report: 'std',        // TR-[STD]-[YYYY]-[SEQ]
  analysis_report: 'std',    // DA-[STD]-[YYYY]-[SEQ]
  test_protocol: 'std_test', // TP-[STD]-[TEST]-[YYYY]-[SEQ]
  raw_data: 'std_test',      // RD-[STD]-[TEST]-[YYYY]-[SEQ]
  calibration_cert: 'equip', // CAL-[EQUIP]-[YYYY]-[SEQ]
  sop: 'dept',               // SOP-[DEPT]-[YYYY]-[SEQ]
  ncr: 'plain',              // NCR-[YYYY]-[SEQ]
  capa: 'plain',             // CAPA-[YYYY]-[SEQ]
  audit_report: 'plain',     // AR-[YYYY]-[SEQ]
}

/**
 * Generate a document number based on type and parameters.
 * Format families:
 *   std      — prefix-[STD]-[YYYY]-[SEQ]        (test_report, analysis_report)
 *   std_test — prefix-[STD]-[TEST]-[YYYY]-[SEQ] (test_protocol, raw_data)
 *   equip    — prefix-[EQUIP]-[YYYY]-[SEQ]      (calibration_cert)
 *   dept     — prefix-[DEPT]-[YYYY]-[SEQ]       (sop)
 *   plain    — prefix-[YYYY]-[SEQ]              (ncr, capa, audit_report)
 */
export function generateDocumentNumber(
  type: DocumentType,
  sequence: number,
  options: {
    standard?: string
    testCode?: string
    equipmentCode?: string
    department?: string
    year?: number
  } = {}
): string {
  const prefix = DOCUMENT_PREFIXES[type]
  const year = options.year ?? new Date().getFullYear()
  const seq = String(sequence).padStart(3, '0')
  const fmt = DOCUMENT_FORMATS[type]

  if (fmt === 'std') return `${prefix}-${getStandardCode(options.standard ?? '')}-${year}-${seq}`
  if (fmt === 'std_test') return `${prefix}-${getStandardCode(options.standard ?? '')}-${options.testCode ?? 'GEN'}-${year}-${seq}`
  if (fmt === 'equip') return `${prefix}-${options.equipmentCode ?? 'EQ'}-${year}-${seq}`
  if (fmt === 'dept') return `${prefix}-${options.department ?? 'GEN'}-${year}-${seq}`
  return `${prefix}-${year}-${seq}` // plain: ncr, capa, audit_report
}

/**
 * Parse a document number to extract its components
 */
export function parseDocumentNumber(docNumber: string): {
  type: DocumentType | null
  prefix: string
  year: number | null
  sequence: number | null
} {
  const parts = docNumber.split('-')
  const prefix = parts[0]
  const typeEntry = Object.entries(DOCUMENT_PREFIXES).find(([, v]) => v === prefix)

  // Extract year and sequence from the last two segments
  const yearStr = parts[parts.length - 2]
  const seqStr = parts[parts.length - 1]

  return {
    type: typeEntry ? (typeEntry[0] as DocumentType) : null,
    prefix,
    year: yearStr ? parseInt(yearStr, 10) || null : null,
    sequence: seqStr ? parseInt(seqStr, 10) || null : null,
  }
}

// Current sequence counters (in production, from database)
const sequenceCounters: Record<string, number> = {
  'TR-2026': 42,
  'TP-2026': 18,
  'DA-2026': 15,
  'RD-2026': 67,
  'CAL-2026': 24,
  'SOP-2026': 12,
  'NCR-2026': 8,
  'CAPA-2026': 3,
  'AR-2026': 5,
}

/**
 * Get the next available sequence number for a document type
 */
export function getNextSequence(type: DocumentType, year?: number): number {
  const y = year ?? new Date().getFullYear()
  const key = `${DOCUMENT_PREFIXES[type]}-${y}`
  const current = sequenceCounters[key] ?? 0
  const next = current + 1
  sequenceCounters[key] = next
  return next
}

/**
 * Generate the next document number for a given type
 */
export function generateNextDocumentNumber(
  type: DocumentType,
  options: {
    standard?: string
    testCode?: string
    equipmentCode?: string
    department?: string
    year?: number
  } = {}
): string {
  const seq = getNextSequence(type, options.year)
  return generateDocumentNumber(type, seq, options)
}

// Document type labels for display
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  test_report: 'Test Report',
  test_protocol: 'Test Protocol',
  analysis_report: 'Analysis Report',
  raw_data: 'Raw Data',
  calibration_cert: 'Calibration Certificate',
  sop: 'SOP',
  ncr: 'Non-Conformance Report',
  capa: 'CAPA',
  audit_report: 'Audit Report',
}

// Document type colors for UI
export const DOCUMENT_TYPE_COLORS: Record<DocumentType, { bg: string; text: string; border: string }> = {
  test_report: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  test_protocol: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  analysis_report: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  raw_data: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  calibration_cert: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  sop: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  ncr: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  capa: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  audit_report: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
}
