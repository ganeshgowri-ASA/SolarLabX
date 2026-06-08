import { IEC61215_PROTOCOLS } from './iec61215'
import { IEC61730_PROTOCOLS } from './iec61730'
import { IEC61853_PROTOCOLS } from './iec61853'
import { IEC61701_PROTOCOLS } from './iec61701'
import type { ProtocolDefinition, StandardName } from '@/lib/protocol-types'

export const ALL_PROTOCOLS: ProtocolDefinition[] = [
  ...IEC61215_PROTOCOLS,
  ...IEC61730_PROTOCOLS,
  ...IEC61853_PROTOCOLS,
  ...IEC61701_PROTOCOLS,
]

export const PROTOCOLS_BY_STANDARD: Record<StandardName, ProtocolDefinition[]> = {
  'IEC 61215': IEC61215_PROTOCOLS,
  'IEC 61730': IEC61730_PROTOCOLS,
  'IEC 61853': IEC61853_PROTOCOLS,
  'IEC 61701': IEC61701_PROTOCOLS,
}

export function getProtocolById(id: string): ProtocolDefinition | undefined {
  return ALL_PROTOCOLS.find(p => p.id === id)
}

export function getProtocolsByStandard(standard: StandardName): ProtocolDefinition[] {
  return PROTOCOLS_BY_STANDARD[standard]
}

export { IEC61215_PROTOCOLS, IEC61730_PROTOCOLS, IEC61853_PROTOCOLS, IEC61701_PROTOCOLS }
