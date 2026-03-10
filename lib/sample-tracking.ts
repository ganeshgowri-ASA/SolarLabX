// Sample Tracking utilities and mock data

export type SampleLifecycleStage =
  | 'reception'
  | 'registration'
  | 'inspection'
  | 'testing'
  | 'review'
  | 'reporting'
  | 'delivery'

export interface TrackedSample {
  id: string
  sampleId: string
  barcode: string
  clientName: string
  clientOrganization: string
  manufacturer: string
  modelNumber: string
  serialNumber: string
  batchId: string
  sampleType: string
  currentStage: SampleLifecycleStage
  currentLocation: string
  condition: 'good' | 'minor_damage' | 'damaged' | 'rejected'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  testStandard: string
  timeline: TimelineEvent[]
  custodyChain: CustodyRecord[]
  conditionLogs: ConditionLog[]
  notes: string
  createdAt: string
  updatedAt: string
  estimatedCompletion: string
}

export interface TimelineEvent {
  id: string
  stage: SampleLifecycleStage
  status: 'completed' | 'current' | 'pending'
  timestamp: string | null
  performedBy: string
  notes: string
  duration?: string // time spent in stage
}

export interface CustodyRecord {
  id: string
  timestamp: string
  fromPerson: string
  toPerson: string
  fromLocation: string
  toLocation: string
  action: string
  signature: string
  notes: string
}

export interface ConditionLog {
  id: string
  timestamp: string
  loggedBy: string
  condition: 'good' | 'minor_damage' | 'damaged'
  description: string
  photoRef?: string
}

export interface BatchInfo {
  batchId: string
  clientName: string
  totalSamples: number
  samplesCompleted: number
  samplesInProgress: number
  samplesPending: number
  status: 'active' | 'completed' | 'on_hold'
  createdAt: string
}

export const LIFECYCLE_STAGES: { key: SampleLifecycleStage; label: string; icon: string; color: string }[] = [
  { key: 'reception', label: 'Reception', icon: 'Package', color: '#3b82f6' },
  { key: 'registration', label: 'Registration', icon: 'ClipboardList', color: '#8b5cf6' },
  { key: 'inspection', label: 'Inspection', icon: 'Search', color: '#f59e0b' },
  { key: 'testing', label: 'Testing', icon: 'FlaskConical', color: '#f97316' },
  { key: 'review', label: 'Review', icon: 'CheckCircle', color: '#06b6d4' },
  { key: 'reporting', label: 'Reporting', icon: 'FileText', color: '#8b5cf6' },
  { key: 'delivery', label: 'Delivery', icon: 'Truck', color: '#22c55e' },
]

export const LOCATIONS = [
  'Reception Desk',
  'Sample Storage A',
  'Sample Storage B',
  'Solar Simulator Lab',
  'Environmental Chamber 1',
  'Environmental Chamber 2',
  'UV Chamber',
  'Mechanical Load Bay',
  'EL Imaging Room',
  'IR Thermography Room',
  'Review Office',
  'Dispatch Area',
]

// Generate barcode/sample ID
export function generateBarcode(): string {
  const prefix = 'SLX'
  const date = new Date()
  const yr = date.getFullYear().toString().slice(-2)
  const mn = (date.getMonth() + 1).toString().padStart(2, '0')
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}-${yr}${mn}-${rand}`
}

// Generate mock tracked samples
export function generateMockSamples(): TrackedSample[] {
  const stages: SampleLifecycleStage[] = ['reception', 'registration', 'inspection', 'testing', 'review', 'reporting', 'delivery']
  const clients = [
    { name: 'Adani Solar', org: 'Adani Green Energy' },
    { name: 'Tata Power Solar', org: 'Tata Power' },
    { name: 'Vikram Solar', org: 'Vikram Solar Ltd' },
    { name: 'Waaree Energies', org: 'Waaree Group' },
    { name: 'Renewsys India', org: 'Renewsys' },
  ]
  const manufacturers = ['SunPower', 'JinkoSolar', 'Trina Solar', 'LONGi', 'Canadian Solar']
  const standards = ['IEC 61215', 'IEC 61730', 'IEC 61853', 'IEC 60904']
  const conditions: ('good' | 'minor_damage' | 'damaged')[] = ['good', 'good', 'good', 'minor_damage']
  const priorities: ('low' | 'normal' | 'high' | 'urgent')[] = ['normal', 'normal', 'high', 'urgent', 'low']

  const samples: TrackedSample[] = []

  for (let i = 0; i < 25; i++) {
    const stageIdx = i < 3 ? 0 : i < 6 ? 1 : i < 8 ? 2 : i < 15 ? 3 : i < 19 ? 4 : i < 22 ? 5 : 6
    const currentStage = stages[stageIdx]
    const client = clients[i % clients.length]
    const batchIdx = Math.floor(i / 5)

    const timeline: TimelineEvent[] = stages.map((stage, idx) => ({
      id: `tl-${i}-${idx}`,
      stage,
      status: idx < stageIdx ? 'completed' as const : idx === stageIdx ? 'current' as const : 'pending' as const,
      timestamp: idx <= stageIdx ? new Date(2025, 8, 1 + idx * 2 + i).toISOString() : null,
      performedBy: idx <= stageIdx ? ['R. Kumar', 'S. Patel', 'A. Singh', 'M. Gupta'][idx % 4] : '',
      notes: idx <= stageIdx ? `Stage ${stage} completed successfully` : '',
      duration: idx < stageIdx ? `${2 + idx}h ${30 + idx * 5}m` : undefined,
    }))

    const custodyChain: CustodyRecord[] = []
    for (let j = 0; j <= Math.min(stageIdx, 4); j++) {
      custodyChain.push({
        id: `cst-${i}-${j}`,
        timestamp: new Date(2025, 8, 1 + j * 2 + i).toISOString(),
        fromPerson: j === 0 ? 'Client' : ['R. Kumar', 'S. Patel', 'A. Singh'][j % 3],
        toPerson: ['R. Kumar', 'S. Patel', 'A. Singh', 'M. Gupta'][(j + 1) % 4],
        fromLocation: j === 0 ? 'Client Site' : LOCATIONS[j],
        toLocation: LOCATIONS[j + 1] || LOCATIONS[j],
        action: j === 0 ? 'Sample received from client' : `Transferred for ${stages[j]}`,
        signature: `SIG-${String(i).padStart(3, '0')}-${j}`,
        notes: '',
      })
    }

    const conditionLogs: ConditionLog[] = [{
      id: `cl-${i}-0`,
      timestamp: new Date(2025, 8, 1 + i).toISOString(),
      loggedBy: 'R. Kumar',
      condition: conditions[i % conditions.length],
      description: conditions[i % conditions.length] === 'good' ? 'Sample received in good condition' : 'Minor packaging damage noted, sample intact',
    }]

    samples.push({
      id: `s-${i}`,
      sampleId: `SPL-2025-${String(i + 1).padStart(4, '0')}`,
      barcode: generateBarcode(),
      clientName: client.name,
      clientOrganization: client.org,
      manufacturer: manufacturers[i % manufacturers.length],
      modelNumber: `MOD-${String(400 + i * 5)}W`,
      serialNumber: `SN-${String(100000 + i)}`,
      batchId: `B-2025-${String(batchIdx + 1).padStart(3, '0')}`,
      sampleType: 'PV Module',
      currentStage,
      currentLocation: LOCATIONS[stageIdx] || LOCATIONS[0],
      condition: conditions[i % conditions.length] === 'damaged' ? 'damaged' : conditions[i % conditions.length],
      priority: priorities[i % priorities.length],
      testStandard: standards[i % standards.length],
      timeline,
      custodyChain,
      conditionLogs,
      notes: i % 3 === 0 ? 'Priority client - expedited processing' : '',
      createdAt: new Date(2025, 8, 1 + i).toISOString(),
      updatedAt: new Date(2025, 8, 5 + i).toISOString(),
      estimatedCompletion: new Date(2025, 9, 1 + i).toISOString(),
    })
  }

  return samples
}

// Generate mock batch data
export function generateBatchData(): BatchInfo[] {
  return [
    { batchId: 'B-2025-001', clientName: 'Adani Solar', totalSamples: 5, samplesCompleted: 3, samplesInProgress: 2, samplesPending: 0, status: 'active', createdAt: '2025-09-01' },
    { batchId: 'B-2025-002', clientName: 'Tata Power Solar', totalSamples: 5, samplesCompleted: 1, samplesInProgress: 3, samplesPending: 1, status: 'active', createdAt: '2025-09-03' },
    { batchId: 'B-2025-003', clientName: 'Vikram Solar', totalSamples: 5, samplesCompleted: 0, samplesInProgress: 2, samplesPending: 3, status: 'active', createdAt: '2025-09-05' },
    { batchId: 'B-2025-004', clientName: 'Waaree Energies', totalSamples: 5, samplesCompleted: 5, samplesInProgress: 0, samplesPending: 0, status: 'completed', createdAt: '2025-08-15' },
    { batchId: 'B-2025-005', clientName: 'Renewsys India', totalSamples: 5, samplesCompleted: 0, samplesInProgress: 1, samplesPending: 4, status: 'active', createdAt: '2025-09-10' },
  ]
}
