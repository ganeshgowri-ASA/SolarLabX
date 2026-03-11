// Protocol Form System Types for SolarLabX
// ISO 17025 / ISO 9001 compliant protocol checksheet system

export type ProtocolCategory = 'electrical' | 'environmental' | 'mechanical' | 'visual' | 'safety'
export type RawDataType = 'flasher_iv' | 'el_image' | 'ir_image' | 'insulation_log' | 'chamber_log' | 'generic' | 'none'
export type FieldType = 'number' | 'text' | 'boolean' | 'select' | 'textarea' | 'date'
export type EvalOperator = 'gte' | 'lte' | 'gt' | 'lt' | 'eq' | 'between' | 'max_degradation' | 'manual'

export interface PreFilledCondition {
  label: string
  value: string
  unit: string
  source: string // e.g. "IEC 61215-2:2021 cl 4.2"
}

export interface AcceptanceCriterion {
  id: string
  parameter: string
  operator: EvalOperator
  limit: string         // display string e.g. "Pnom × 0.97"
  limitValue?: number   // numeric limit for auto-eval
  unit: string
  critical: boolean
  description: string
}

export interface MeasurementField {
  id: string
  label: string
  unit: string
  type: FieldType
  autoFillFrom?: string  // key in parsed raw data
  options?: string[]
  min?: number
  max?: number
  required: boolean
  criterionId?: string   // links to acceptance criterion
  placeholder?: string
}

export interface RawDataConfig {
  type: RawDataType
  description: string
  acceptedFormats: string[]
  expectedHeaders?: string[]
  columnMapping: Record<string, string[]> // standardParam -> possible column names
}

export interface ProtocolDefinition {
  id: string
  code: string           // e.g. "MQT 10.2"
  name: string
  standard: string       // e.g. "IEC 61215"
  standardYear: string
  clause: string         // e.g. "4.2"
  category: ProtocolCategory
  duration: string
  sequence: number
  critical: boolean
  description: string
  documentFormatNumber: string  // e.g. "SLX-FMT-61215-MQT10.2-001"
  revision: string
  equipment: string[]
  testConditions: PreFilledCondition[]
  acceptanceCriteria: AcceptanceCriterion[]
  measurements: MeasurementField[]
  rawDataConfig?: RawDataConfig
  hasIVCurve: boolean
  notes?: string
}

export interface IVDataPoint {
  voltage: number
  current: number
  power?: number
}

export interface ParsedFlasherData {
  ivCurve: IVDataPoint[]
  voc?: number
  isc?: number
  pmax?: number
  vmp?: number
  imp?: number
  ff?: number
  efficiency?: number
  irradiance?: number
  cellTemp?: number
  timestamp?: string
  serialNumber?: string
}

export interface FormRecord {
  id: string
  recordNumber: string    // e.g. "SLX-REC-2026-0001"
  protocolId: string
  documentFormatNumber: string
  revision: string
  sampleId: string
  sampleDescription: string
  clientName: string
  operator: string
  reviewedBy: string
  testDate: string
  submitDate?: string
  environmentConditions: {
    temperature: string
    humidity: string
    pressure: string
  }
  measurements: Record<string, string | number | boolean>
  ivData?: ParsedFlasherData
  rawDataFiles: { name: string; size: number; uploadedAt: string }[]
  traceabilityId: string
  overallResult: 'pass' | 'fail' | 'pending'
  criteriaResults: Record<string, 'pass' | 'fail' | 'na'>
  observations: string
  status: 'draft' | 'submitted' | 'reviewed' | 'approved'
  operatorSignature?: string
  reviewerSignature?: string
}
