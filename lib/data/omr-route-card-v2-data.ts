// ============================================================================
// OMR Route Card V2 - IEC 61215/61730 PV Module Qualification Tracking
// Bubble matrix: Routine Tests (rows) x Accelerated Tests (columns)
// ============================================================================

// Routine tests (row headers) - measurements done at each stage
export const ROUTINE_TESTS = [
  { code: "VI", name: "Visual Inspection", standard: "IEC 61215-2 Cl.4.1" },
  { code: "EL", name: "Electroluminescence", standard: "IEC TS 60904-13" },
  { code: "IR", name: "IR Thermography", standard: "IEC TS 62446-3" },
  { code: "STC", name: "I-V at STC", standard: "IEC 60904-1" },
  { code: "INS", name: "Insulation Test", standard: "IEC 61215-2 Cl.4.5" },
  { code: "WLT", name: "Wet Leakage Test", standard: "IEC 61215-2 Cl.4.15" },
  { code: "DIM", name: "Dimension Check", standard: "IEC 61215-1 Cl.4" },
] as const

// Accelerated / environmental tests (column headers) - IEC sequence order
export const ACCELERATED_TESTS = [
  { code: "Initial", name: "Initial Characterization", standard: "IEC 61215-1" },
  { code: "TC50", name: "Thermal Cycling 50", standard: "IEC 61215-2 Cl.4.11" },
  { code: "TC100", name: "Thermal Cycling 100", standard: "IEC 61215-2 Cl.4.11" },
  { code: "TC200", name: "Thermal Cycling 200", standard: "IEC 61215-2 Cl.4.11" },
  { code: "HF10", name: "Humidity Freeze 10", standard: "IEC 61215-2 Cl.4.12" },
  { code: "HF20", name: "Humidity Freeze 20", standard: "IEC 61215-2 Cl.4.12" },
  { code: "DH500", name: "Damp Heat 500h", standard: "IEC 61215-2 Cl.4.13" },
  { code: "DH1000", name: "Damp Heat 1000h", standard: "IEC 61215-2 Cl.4.13" },
  { code: "PID", name: "PID Test", standard: "IEC TS 62804" },
  { code: "UV", name: "UV Preconditioning", standard: "IEC 61215-2 Cl.4.10" },
  { code: "STAB", name: "Stabilization", standard: "IEC 61215-2 Cl.4.2" },
  { code: "TC50+HF10", name: "TC50 + HF10 Sequence", standard: "IEC 61215-1 MQT" },
  { code: "TC200+HF10", name: "TC200 + HF10 Sequence", standard: "IEC 61215-1 MQT" },
  { code: "SD", name: "Static Load (Snow/Wind)", standard: "IEC 61215-2 Cl.4.16" },
  { code: "ML", name: "Mechanical Load", standard: "IEC 61215-2 Cl.4.17" },
  { code: "HT", name: "Hot Spot Test", standard: "IEC 61215-2 Cl.4.9" },
] as const

export type BubbleStatus = "empty" | "pass" | "fail" | "in-progress"

export interface OMRBubbleEntry {
  routineTest: string
  acceleratedTest: string
  status: BubbleStatus
  operator?: string
  date?: string
  notes?: string
  filename?: string
}

export interface OMRRouteCardV2 {
  id: string
  projectId: string
  moduleId: string
  client: string
  moduleType: string
  powerRating: string
  standard: string
  date: string
  bubbleMatrix: OMRBubbleEntry[]
  createdAt: string
  updatedAt: string
}

export interface ScannedBubbleResult {
  routineTest: string
  acceleratedTest: string
  detectedStatus: BubbleStatus
  confidence: number
  x: number
  y: number
  corrected: boolean
}

// Helper: generate filename per IEC nomenclature
export function generateOMRFilename(
  projectId: string,
  moduleId: string,
  accelTest: string,
  routineTest: string,
  prePost: "Pre" | "Post",
  setNo: string,
  date: Date = new Date()
): string {
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "")
  return `${projectId}_${moduleId}_${accelTest}_${routineTest}_${prePost}_${setNo}_${dateStr}.pdf`
}

// Generate an initial empty bubble matrix
function createEmptyMatrix(): OMRBubbleEntry[] {
  const matrix: OMRBubbleEntry[] = []
  for (const rt of ROUTINE_TESTS) {
    for (const at of ACCELERATED_TESTS) {
      matrix.push({
        routineTest: rt.code,
        acceleratedTest: at.code,
        status: "empty",
      })
    }
  }
  return matrix
}

// Mock data: 3 modules in various stages of qualification
export const mockOMRRouteCardsV2: OMRRouteCardV2[] = [
  {
    id: "OMR-V2-001",
    projectId: "PRJ2026001",
    moduleId: "MOD-SP-450-A01",
    client: "SunPower Corp",
    moduleType: "Mono PERC Bifacial",
    powerRating: "450 Wp",
    standard: "IEC 61215 / IEC 61730",
    date: "2026-02-15",
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-03-18T14:00:00Z",
    bubbleMatrix: (() => {
      const m = createEmptyMatrix()
      const set = (rt: string, at: string, s: BubbleStatus, op?: string, d?: string) => {
        const entry = m.find(e => e.routineTest === rt && e.acceleratedTest === at)
        if (entry) { entry.status = s; entry.operator = op; entry.date = d }
      }
      // Initial characterization - all routine tests done
      set("VI", "Initial", "pass", "Rajesh Kumar", "2026-02-16")
      set("EL", "Initial", "pass", "Neha Gupta", "2026-02-16")
      set("IR", "Initial", "pass", "Neha Gupta", "2026-02-16")
      set("STC", "Initial", "pass", "Amit Patel", "2026-02-17")
      set("INS", "Initial", "pass", "Vikram Singh", "2026-02-17")
      set("WLT", "Initial", "pass", "Vikram Singh", "2026-02-17")
      set("DIM", "Initial", "pass", "Rajesh Kumar", "2026-02-16")
      // TC50
      set("VI", "TC50", "pass", "Rajesh Kumar", "2026-02-25")
      set("EL", "TC50", "pass", "Neha Gupta", "2026-02-25")
      set("STC", "TC50", "pass", "Amit Patel", "2026-02-26")
      set("INS", "TC50", "pass", "Vikram Singh", "2026-02-26")
      // TC100
      set("VI", "TC100", "pass", "Rajesh Kumar", "2026-03-02")
      set("EL", "TC100", "pass", "Neha Gupta", "2026-03-02")
      set("STC", "TC100", "pass", "Amit Patel", "2026-03-03")
      set("INS", "TC100", "pass", "Vikram Singh", "2026-03-03")
      // TC200
      set("VI", "TC200", "pass", "Rajesh Kumar", "2026-03-10")
      set("EL", "TC200", "in-progress", "Neha Gupta", "2026-03-10")
      set("STC", "TC200", "in-progress")
      // HF10
      set("VI", "HF10", "pass", "Rajesh Kumar", "2026-03-12")
      set("STC", "HF10", "pass", "Amit Patel", "2026-03-13")
      // DH500
      set("VI", "DH500", "pass", "Rajesh Kumar", "2026-03-15")
      set("STC", "DH500", "pass", "Amit Patel", "2026-03-16")
      set("EL", "DH500", "fail", "Neha Gupta", "2026-03-16")
      // UV
      set("VI", "UV", "pass", "Rajesh Kumar", "2026-03-14")
      set("STC", "UV", "pass", "Amit Patel", "2026-03-14")
      return m
    })(),
  },
  {
    id: "OMR-V2-002",
    projectId: "PRJ2026002",
    moduleId: "MOD-JA-540-B03",
    client: "ReNew Power",
    moduleType: "TOPCon N-type",
    powerRating: "540 Wp",
    standard: "IEC 61215",
    date: "2026-03-01",
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-18T10:00:00Z",
    bubbleMatrix: (() => {
      const m = createEmptyMatrix()
      const set = (rt: string, at: string, s: BubbleStatus, op?: string, d?: string) => {
        const entry = m.find(e => e.routineTest === rt && e.acceleratedTest === at)
        if (entry) { entry.status = s; entry.operator = op; entry.date = d }
      }
      // Initial only
      set("VI", "Initial", "pass", "Rajesh Kumar", "2026-03-02")
      set("EL", "Initial", "pass", "Neha Gupta", "2026-03-02")
      set("IR", "Initial", "pass", "Neha Gupta", "2026-03-02")
      set("STC", "Initial", "pass", "Amit Patel", "2026-03-03")
      set("INS", "Initial", "pass", "Vikram Singh", "2026-03-03")
      set("WLT", "Initial", "pass", "Vikram Singh", "2026-03-03")
      set("DIM", "Initial", "pass", "Rajesh Kumar", "2026-03-02")
      // TC50 in progress
      set("VI", "TC50", "in-progress")
      set("EL", "TC50", "in-progress")
      return m
    })(),
  },
  {
    id: "OMR-V2-003",
    projectId: "PRJ2026003",
    moduleId: "MOD-CS-665-C05",
    client: "Adani Solar",
    moduleType: "HJT Heterojunction",
    powerRating: "665 Wp",
    standard: "IEC 61215 / IEC 61730",
    date: "2026-03-08",
    createdAt: "2026-03-08T09:00:00Z",
    updatedAt: "2026-03-18T16:00:00Z",
    bubbleMatrix: (() => {
      const m = createEmptyMatrix()
      const set = (rt: string, at: string, s: BubbleStatus, op?: string, d?: string) => {
        const entry = m.find(e => e.routineTest === rt && e.acceleratedTest === at)
        if (entry) { entry.status = s; entry.operator = op; entry.date = d }
      }
      // Initial characterization - all done
      set("VI", "Initial", "pass", "Rajesh Kumar", "2026-03-09")
      set("EL", "Initial", "pass", "Neha Gupta", "2026-03-09")
      set("IR", "Initial", "pass", "Neha Gupta", "2026-03-09")
      set("STC", "Initial", "pass", "Amit Patel", "2026-03-10")
      set("INS", "Initial", "pass", "Vikram Singh", "2026-03-10")
      set("WLT", "Initial", "pass", "Vikram Singh", "2026-03-10")
      set("DIM", "Initial", "pass", "Rajesh Kumar", "2026-03-09")
      // TC50 done
      set("VI", "TC50", "pass", "Rajesh Kumar", "2026-03-14")
      set("EL", "TC50", "pass", "Neha Gupta", "2026-03-14")
      set("STC", "TC50", "pass", "Amit Patel", "2026-03-15")
      set("INS", "TC50", "pass", "Vikram Singh", "2026-03-15")
      set("WLT", "TC50", "pass", "Vikram Singh", "2026-03-15")
      // TC100 done
      set("VI", "TC100", "pass", "Rajesh Kumar", "2026-03-16")
      set("EL", "TC100", "pass", "Neha Gupta", "2026-03-16")
      set("STC", "TC100", "pass", "Amit Patel", "2026-03-17")
      set("INS", "TC100", "pass", "Vikram Singh", "2026-03-17")
      // TC200 in progress
      set("VI", "TC200", "in-progress")
      set("EL", "TC200", "in-progress")
      // DH500
      set("VI", "DH500", "pass", "Rajesh Kumar", "2026-03-16")
      set("STC", "DH500", "pass", "Amit Patel", "2026-03-17")
      // DH1000 in progress
      set("VI", "DH1000", "in-progress")
      // HF10
      set("VI", "HF10", "pass", "Rajesh Kumar", "2026-03-15")
      set("STC", "HF10", "pass", "Amit Patel", "2026-03-16")
      set("INS", "HF10", "pass", "Vikram Singh", "2026-03-16")
      return m
    })(),
  },
]
