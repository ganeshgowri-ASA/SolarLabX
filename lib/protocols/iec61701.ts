import type { ProtocolDefinition } from '@/lib/protocol-types'

export const IEC61701_PROTOCOLS: ProtocolDefinition[] = [
  {
    id: 'iec61701-sc',
    code: 'IEC 61701 SC',
    name: 'Salt Mist Corrosion (Severity Class)',
    standard: 'IEC 61701',
    standardYear: '2020',
    clause: '10',
    category: 'environmental',
    duration: '96h',
    sequence: 1,
    critical: false,
    description: 'Salt mist (fog) corrosion test for PV modules intended for use in marine or coastal environments per IEC 61701:2020.',
    documentFormatNumber: 'SLX-FMT-61701-SC-001',
    revision: '01',
    equipment: ['Salt mist chamber (per IEC 60068-2-52)', 'NaCl solution preparation', 'Flash tester', 'Insulation tester'],
    testConditions: [
      { label: 'NaCl concentration', value: '5 ± 1', unit: '% by weight', source: 'IEC 61701:2020 cl 10' },
      { label: 'Chamber temperature', value: '35 ± 2', unit: '°C', source: 'IEC 61701:2020 cl 10' },
      { label: 'Duration (Severity 1)', value: '96', unit: 'h', source: 'IEC 61701:2020 Table 1' },
      { label: 'Duration (Severity 6)', value: '96 × 6 cycles', unit: 'h', source: 'IEC 61701:2020 Table 1' },
    ],
    acceptanceCriteria: [
      { id: 'ac-61701-1', parameter: 'Pmax degradation', operator: 'max_degradation', limit: '5%', limitValue: 5, unit: '%', critical: true, description: 'Power loss ≤ 5% after salt mist test' },
      { id: 'ac-61701-2', parameter: 'R_ins × Area', operator: 'gte', limit: '40 MΩ·m²', limitValue: 40, unit: 'MΩ·m²', critical: true, description: 'Insulation maintained after salt mist' },
      { id: 'ac-61701-3', parameter: 'Corrosion of frame/connectors', operator: 'manual', limit: 'No severe corrosion', unit: '-', critical: false, description: 'No severe corrosion affecting function' },
    ],
    measurements: [
      { id: 'm-61701-1', label: 'Pmax before salt mist', unit: 'W', type: 'number', required: true },
      { id: 'm-61701-2', label: 'Pmax after salt mist', unit: 'W', type: 'number', required: true, autoFillFrom: 'pmax' },
      { id: 'm-61701-3', label: 'Pmax degradation', unit: '%', type: 'number', required: true, criterionId: 'ac-61701-1' },
      { id: 'm-61701-4', label: 'R_ins × Area (after)', unit: 'MΩ·m²', type: 'number', required: true, criterionId: 'ac-61701-2' },
      { id: 'm-61701-5', label: 'Severity class applied', unit: '-', type: 'select', options: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'], required: true },
      { id: 'm-61701-6', label: 'Test duration (hours)', unit: 'h', type: 'number', required: true },
      { id: 'm-61701-7', label: 'Severe corrosion observed', unit: '-', type: 'boolean', required: true },
    ],
    rawDataConfig: {
      type: 'chamber_log',
      description: 'Salt mist chamber log',
      acceptedFormats: ['.csv', '.xlsx'],
      columnMapping: { time: ['Time', 'DateTime'], temperature: ['Temp', 'Temperature'] },
    },
    hasIVCurve: false,
  },
]
