// Calibration traceability chain data — ISO 17025:2017 cl. 6.4.6
// Each node in the directed graph represents one measurand standard/instrument.
// calibratedBy refers to the parent node id (undefined = NMI root).

export type NodeType = 'NMI' | 'Reference' | 'Working' | 'Instrument'
export type Measurand = 'Irradiance' | 'Voltage' | 'Current' | 'Temperature' | 'Resistance' | 'Mass'

export interface CalibrationNode {
  id: string
  name: string
  model: string
  type: NodeType
  lab: string
  certNumber: string
  certDate: string        // ISO date
  expiryDate: string      // ISO date
  uncertainty: string     // expanded uncertainty k=2
  measurands: Measurand[]
  calibratedBy?: string   // parent node id
}

export const CALIBRATION_NODES: CalibrationNode[] = [
  // ── NMI ───────────────────────────────────────────────────────────────────
  {
    id: 'nmi-npl',
    name: 'National Physical Laboratory',
    model: 'NPL India / BIPM member',
    type: 'NMI',
    lab: 'NPL, New Delhi',
    certNumber: 'NPL-2025-MAT-001',
    certDate: '2025-04-01',
    expiryDate: '2030-04-01',
    uncertainty: '—',
    measurands: ['Irradiance', 'Voltage', 'Current', 'Temperature'],
  },

  // ── Reference Standards ───────────────────────────────────────────────────
  {
    id: 'ref-cell-ptb',
    name: 'PTB Reference Solar Cell',
    model: 'ISE CalTeC Ref-Si-01',
    type: 'Reference',
    lab: 'PTB Braunschweig (primary) / NPL India (secondary)',
    certNumber: 'PTB-2025-SC-0042',
    certDate: '2025-07-15',
    expiryDate: '2026-07-15',
    uncertainty: '0.4% (k=2)',
    measurands: ['Irradiance'],
    calibratedBy: 'nmi-npl',
  },
  {
    id: 'ref-dmm-fluke',
    name: 'Fluke 8588A Reference DMM',
    model: 'Fluke 8588A',
    type: 'Reference',
    lab: 'Fluke Calibration, Everett WA (NVLAP)',
    certNumber: 'FLUKE-2025-DMM-1187',
    certDate: '2025-09-01',
    expiryDate: '2026-09-01',
    uncertainty: '5 ppm DC voltage (k=2)',
    measurands: ['Voltage', 'Current'],
    calibratedBy: 'nmi-npl',
  },
  {
    id: 'ref-sprt-omega',
    name: 'Omega SPRT Pt25 Reference',
    model: 'Omega F100P Pt25',
    type: 'Reference',
    lab: 'NABL Accredited Thermal Lab, Mumbai',
    certNumber: 'NABL-TH-2025-3344',
    certDate: '2025-06-10',
    expiryDate: '2026-06-10',
    uncertainty: '0.005 °C (k=2)',
    measurands: ['Temperature'],
    calibratedBy: 'nmi-npl',
  },

  // ── Working Standards ─────────────────────────────────────────────────────
  {
    id: 'work-cell-wpvs',
    name: 'WPVS-type Working Reference Cell',
    model: 'ISE-CalTeC Ref-Si-WS-04',
    type: 'Working',
    lab: 'SolarLabX In-House (NABL)',
    certNumber: 'SLX-CAL-2025-RC-001',
    certDate: '2025-11-20',
    expiryDate: '2026-05-20',   // ← expires today — RED
    uncertainty: '0.7% (k=2)',
    measurands: ['Irradiance'],
    calibratedBy: 'ref-cell-ptb',
  },
  {
    id: 'work-dmm-keysight',
    name: 'Keysight 3458A Working DMM',
    model: 'Keysight 3458A',
    type: 'Working',
    lab: 'SolarLabX In-House (NABL)',
    certNumber: 'SLX-CAL-2025-DMM-002',
    certDate: '2025-10-05',
    expiryDate: '2026-06-15',   // ← expires < 30 days — AMBER
    uncertainty: '15 ppm DC voltage (k=2)',
    measurands: ['Voltage', 'Current'],
    calibratedBy: 'ref-dmm-fluke',
  },
  {
    id: 'work-sprt-pt100',
    name: 'Omega Pt100 Working Standard',
    model: 'Omega P-M-1/10-1/4-6-0-P-3',
    type: 'Working',
    lab: 'SolarLabX In-House (NABL)',
    certNumber: 'SLX-CAL-2025-PT-003',
    certDate: '2025-12-01',
    expiryDate: '2026-12-01',
    uncertainty: '0.05 °C (k=2)',
    measurands: ['Temperature'],
    calibratedBy: 'ref-sprt-omega',
  },

  // ── Instruments (UUT / measuring instruments) ─────────────────────────────
  {
    id: 'inst-ss001',
    name: 'Solar Simulator SS-001',
    model: 'Pasan SunSim 3C Class AAA',
    type: 'Instrument',
    lab: 'SolarLabX Performance Lab',
    certNumber: 'SLX-CAL-2025-SS-001',
    certDate: '2025-12-15',
    expiryDate: '2026-12-15',
    uncertainty: '1.2% Isc (k=2)',
    measurands: ['Irradiance'],
    calibratedBy: 'work-cell-wpvs',
  },
  {
    id: 'inst-smu001',
    name: 'Source Measurement Unit SMU-001',
    model: 'Keysight B2912B',
    type: 'Instrument',
    lab: 'SolarLabX Performance Lab',
    certNumber: 'SLX-CAL-2025-SMU-001',
    certDate: '2025-11-10',
    expiryDate: '2026-11-10',
    uncertainty: '25 ppm Voltage, 30 ppm Current (k=2)',
    measurands: ['Voltage', 'Current'],
    calibratedBy: 'work-dmm-keysight',
  },
  {
    id: 'inst-dl001',
    name: 'Data Logger DL-001',
    model: 'Keysight 34972A + 34901A',
    type: 'Instrument',
    lab: 'SolarLabX Performance Lab',
    certNumber: 'SLX-CAL-2026-DL-001',
    certDate: '2026-02-01',
    expiryDate: '2027-02-01',
    uncertainty: '50 ppm Voltage, 0.1 °C Temp (k=2)',
    measurands: ['Voltage', 'Current', 'Temperature'],
    calibratedBy: 'work-dmm-keysight',
  },
  {
    id: 'inst-tc001',
    name: 'Module Temperature Sensor TC-001',
    model: 'Dostmann P655-LOG + Pt100',
    type: 'Instrument',
    lab: 'SolarLabX Performance Lab',
    certNumber: 'SLX-CAL-2025-TC-001',
    certDate: '2025-11-20',
    expiryDate: '2026-07-04',   // expires < 45 days — AMBER
    uncertainty: '0.3 °C (k=2)',
    measurands: ['Temperature'],
    calibratedBy: 'work-sprt-pt100',
  },
  {
    id: 'inst-el001',
    name: 'EL Imaging Camera EL-001',
    model: 'Greateyes ELLA 1024',
    type: 'Instrument',
    lab: 'SolarLabX Inspection Lab',
    certNumber: 'SLX-CAL-2025-EL-001',
    certDate: '2025-04-01',
    expiryDate: '2026-04-01',   // ← EXPIRED (past today 2026-05-20) — RED
    uncertainty: 'N/A (imaging)',
    measurands: ['Irradiance'],
    calibratedBy: 'work-cell-wpvs',
  },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-05-20')

export function nodeStatus(node: CalibrationNode): 'valid' | 'amber' | 'expired' {
  const expiry = new Date(node.expiryDate)
  const daysLeft = Math.ceil((expiry.getTime() - TODAY.getTime()) / 86_400_000)
  if (daysLeft <= 0) return 'expired'
  if (daysLeft <= 60) return 'amber'
  return 'valid'
}

export function daysUntilExpiry(node: CalibrationNode): number {
  return Math.ceil((new Date(node.expiryDate).getTime() - TODAY.getTime()) / 86_400_000)
}

export function getChildren(parentId: string): CalibrationNode[] {
  return CALIBRATION_NODES.filter((n) => n.calibratedBy === parentId)
}

export function getAncestors(nodeId: string): CalibrationNode[] {
  const chain: CalibrationNode[] = []
  let current = CALIBRATION_NODES.find((n) => n.id === nodeId)
  while (current?.calibratedBy) {
    const parent = CALIBRATION_NODES.find((n) => n.id === current!.calibratedBy)
    if (!parent) break
    chain.unshift(parent)
    current = parent
  }
  return chain
}
