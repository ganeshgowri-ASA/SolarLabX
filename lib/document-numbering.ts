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

// Standard code mapping for document numbering
function getStandardCode(standard: string): string {
  const mapping: Record<string, string> = {
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
  return mapping[standard] || standard.replace(/[^0-9]/g, '')
}

/**
 * Generate a document number based on type and parameters
 * Patterns:
 *   Test Reports:      TR-[STD]-[YYYY]-[SEQ]
 *   Test Protocols:    TP-[STD]-[TEST]-[YYYY]-[SEQ]
 *   Analysis Reports:  DA-[STD]-[YYYY]-[SEQ]
 *   Raw Data:          RD-[STD]-[TEST]-[YYYY]-[SEQ]
 *   Calibration Certs: CAL-[EQUIP]-[YYYY]-[SEQ]
 *   SOPs:              SOP-[DEPT]-[YYYY]-[SEQ]
 *   NCRs:              NCR-[YYYY]-[SEQ]
 *   CAPAs:             CAPA-[YYYY]-[SEQ]
 *   Audit Reports:     AR-[YYYY]-[SEQ]
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
  const year = options.year || new Date().getFullYear()
  const seq = String(sequence).padStart(3, '0')

  switch (type) {
    case 'test_report':
      return `${prefix}-${getStandardCode(options.standard || '')}-${year}-${seq}`
    case 'test_protocol':
      return `${prefix}-${getStandardCode(options.standard || '')}-${options.testCode || 'GEN'}-${year}-${seq}`
    case 'analysis_report':
      return `${prefix}-${getStandardCode(options.standard || '')}-${year}-${seq}`
    case 'raw_data':
      return `${prefix}-${getStandardCode(options.standard || '')}-${options.testCode || 'GEN'}-${year}-${seq}`
    case 'calibration_cert':
      return `${prefix}-${options.equipmentCode || 'EQ'}-${year}-${seq}`
    case 'sop':
      return `${prefix}-${options.department || 'GEN'}-${year}-${seq}`
    case 'ncr':
      return `${prefix}-${year}-${seq}`
    case 'capa':
      return `${prefix}-${year}-${seq}`
    case 'audit_report':
      return `${prefix}-${year}-${seq}`
    default:
      return `DOC-${year}-${seq}`
  }
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
  const y = year || new Date().getFullYear()
  const key = `${DOCUMENT_PREFIXES[type]}-${y}`
  const current = sequenceCounters[key] || 0
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
