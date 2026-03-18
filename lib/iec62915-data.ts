// IEC TS 62915:2023 - Design Change Assessment Data
// Central constants file for all test mappings, component definitions, and compliance data

// ─── Types ────────────────────────────────────────────────────────────────────

export type Severity = "minor" | "major" | "full_requalification"

export interface ChangeCategory {
  id: string
  label: string
  severity: Severity
  description?: string
}

export interface BomComponent {
  id: string
  clause: string
  name: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  categories: ChangeCategory[]
  requiredTests: string[] // test IDs
}

export interface TestDefinition {
  id: string
  name: string
  standard: "IEC 61215-2" | "IEC 61730-2" | "Both"
  mqt?: string // MQT number
  mst?: string // MST number
  sequences: string[] // A, B, C, D, E
  samplesStandalone: number
  samplesCombined: number
  equipment: string[]
  durationHours: number
  personnel: number
  description: string
  costEstimateUSD: number
}

export interface TestSequence {
  id: string
  name: string
  description: string
  color: string
  modules61215: number[]
  modules61730: number[]
  tests: string[]
}

export interface MNRECheckItem {
  id: string
  category: string
  requirement: string
  reference: string
  status: "required" | "conditional" | "recommended"
  description: string
}

// ─── Test Definitions ─────────────────────────────────────────────────────────

export const TEST_DEFINITIONS: Record<string, TestDefinition> = {
  MQT_01: {
    id: "MQT_01", name: "Visual Inspection", standard: "IEC 61215-2", mqt: "MQT 01",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 8, samplesCombined: 8,
    equipment: ["Inspection table", "Magnifier (10×)", "EL camera"],
    durationHours: 2, personnel: 1,
    description: "Visual inspection of module for defects per Clause 7 of IEC 61215-1",
    costEstimateUSD: 200,
  },
  MQT_02: {
    id: "MQT_02", name: "Maximum Power Determination", standard: "IEC 61215-2", mqt: "MQT 02",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 8, samplesCombined: 8,
    equipment: ["Class A+ Solar Simulator", "IV Tracer", "Reference cell"],
    durationHours: 4, personnel: 2,
    description: "STC power measurement: 1000 W/m², 25°C, AM1.5G",
    costEstimateUSD: 500,
  },
  MQT_03: {
    id: "MQT_03", name: "Insulation Test", standard: "IEC 61215-2", mqt: "MQT 03",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 8, samplesCombined: 8,
    equipment: ["Hipot tester", "Insulation resistance meter"],
    durationHours: 2, personnel: 1,
    description: "Insulation resistance and dielectric withstand test",
    costEstimateUSD: 300,
  },
  MQT_04: {
    id: "MQT_04", name: "Measurement of Temperature Coefficients", standard: "IEC 61215-2", mqt: "MQT 04",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Solar simulator", "Temperature-controlled chamber", "IV tracer"],
    durationHours: 16, personnel: 2,
    description: "α(Isc), β(Voc), δ(Pmax) measurement over temperature range",
    costEstimateUSD: 1200,
  },
  MQT_05: {
    id: "MQT_05", name: "Measurement of NMOT", standard: "IEC 61215-2", mqt: "MQT 05",
    sequences: ["A"], samplesStandalone: 1, samplesCombined: 1,
    equipment: ["Outdoor test rack", "Pyranometer", "Thermocouples", "Data logger"],
    durationHours: 720, personnel: 1,
    description: "Nominal Module Operating Temperature per IEC 61215-2 MQT 05",
    costEstimateUSD: 2000,
  },
  MQT_06: {
    id: "MQT_06", name: "Performance at STC and NMOT", standard: "IEC 61215-2", mqt: "MQT 06",
    sequences: ["A", "B", "C"], samplesStandalone: 4, samplesCombined: 4,
    equipment: ["Solar simulator", "IV tracer", "Reference cell"],
    durationHours: 8, personnel: 2,
    description: "Performance at STC (25°C) and NMOT conditions",
    costEstimateUSD: 800,
  },
  MQT_07: {
    id: "MQT_07", name: "Performance at Low Irradiance", standard: "IEC 61215-2", mqt: "MQT 07",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Solar simulator (200 W/m² capable)", "IV tracer"],
    durationHours: 4, personnel: 2,
    description: "Power measurement at 200 W/m², 25°C",
    costEstimateUSD: 600,
  },
  MQT_08: {
    id: "MQT_08", name: "Outdoor Exposure Test", standard: "IEC 61215-2", mqt: "MQT 08",
    sequences: ["A"], samplesStandalone: 1, samplesCombined: 1,
    equipment: ["Outdoor exposure rack", "Pyranometer", "Data logger"],
    durationHours: 1440, personnel: 1,
    description: "60 kWh/m² minimum outdoor exposure",
    costEstimateUSD: 1500,
  },
  MQT_09: {
    id: "MQT_09", name: "Hot-spot Endurance Test", standard: "IEC 61215-2", mqt: "MQT 09",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Solar simulator", "IR camera", "Shading devices"],
    durationHours: 8, personnel: 2,
    description: "5 hours at 1000 W/m² with worst-case cell shading",
    costEstimateUSD: 1000,
  },
  MQT_10: {
    id: "MQT_10", name: "UV Preconditioning Test", standard: "IEC 61215-2", mqt: "MQT 10",
    sequences: ["B", "C"], samplesStandalone: 4, samplesCombined: 4,
    equipment: ["UV chamber", "UV radiometer", "Temperature controller"],
    durationHours: 120, personnel: 1,
    description: "15 kWh/m² UV-A + UV-B exposure (280–400 nm)",
    costEstimateUSD: 2500,
  },
  MQT_11: {
    id: "MQT_11", name: "Thermal Cycling Test", standard: "IEC 61215-2", mqt: "MQT 11",
    sequences: ["B", "C", "D"], samplesStandalone: 6, samplesCombined: 6,
    equipment: ["Environmental chamber (TC)", "Thermocouples", "Controller"],
    durationHours: 400, personnel: 1,
    description: "200 cycles (Seq B/C) or 50 cycles (Seq D): −40°C to +85°C",
    costEstimateUSD: 8000,
  },
  MQT_12: {
    id: "MQT_12", name: "Humidity-Freeze Test", standard: "IEC 61215-2", mqt: "MQT 12",
    sequences: ["B"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Environmental chamber (HF)", "Temperature/humidity controller"],
    durationHours: 240, personnel: 1,
    description: "10 cycles: 85°C/85%RH → −40°C",
    costEstimateUSD: 4000,
  },
  MQT_13: {
    id: "MQT_13", name: "Damp Heat Test", standard: "IEC 61215-2", mqt: "MQT 13",
    sequences: ["C"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Environmental chamber (DH)", "Temperature/humidity controller"],
    durationHours: 1000, personnel: 1,
    description: "1000 hours at 85°C / 85% RH",
    costEstimateUSD: 6000,
  },
  MQT_14: {
    id: "MQT_14", name: "Robustness of Terminations", standard: "IEC 61215-2", mqt: "MQT 14",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Pull/torque tester", "Force gauge"],
    durationHours: 4, personnel: 1,
    description: "Axial pull, torsion, and bending of terminations",
    costEstimateUSD: 400,
  },
  MQT_15: {
    id: "MQT_15", name: "Wet Leakage Current Test", standard: "IEC 61215-2", mqt: "MQT 15",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 8, samplesCombined: 8,
    equipment: ["Wet leakage tester", "Wetting agent", "Surface resistance meter"],
    durationHours: 4, personnel: 1,
    description: "Leakage current measurement with wetted module surface",
    costEstimateUSD: 400,
  },
  MQT_16: {
    id: "MQT_16", name: "Static Mechanical Load Test", standard: "IEC 61215-2", mqt: "MQT 16",
    sequences: ["D"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Mechanical load tester", "Pneumatic system", "Pressure gauge"],
    durationHours: 8, personnel: 2,
    description: "2400 Pa front / 2400 Pa rear (3 cycles each side)",
    costEstimateUSD: 1500,
  },
  MQT_17: {
    id: "MQT_17", name: "Hail Test", standard: "IEC 61215-2", mqt: "MQT 17",
    sequences: ["E"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Hail gun", "Ice ball maker", "Velocity sensor"],
    durationHours: 4, personnel: 2,
    description: "25 mm ice balls at 23 m/s to 11 impact locations",
    costEstimateUSD: 2000,
  },
  MQT_18: {
    id: "MQT_18", name: "Bypass Diode Thermal Test", standard: "IEC 61215-2", mqt: "MQT 18",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Power supply", "Thermocouples", "IR camera"],
    durationHours: 8, personnel: 1,
    description: "1 hour at 75°C with 1.25 × Isc through each bypass diode",
    costEstimateUSD: 800,
  },
  MQT_19: {
    id: "MQT_19", name: "Stabilization", standard: "IEC 61215-2", mqt: "MQT 19",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 8, samplesCombined: 8,
    equipment: ["Light soaking system or outdoor rack", "IV tracer"],
    durationHours: 48, personnel: 1,
    description: "Light soaking until ±2% Pmax between consecutive measurements",
    costEstimateUSD: 1000,
  },
  MQT_20: {
    id: "MQT_20", name: "Dynamic Mechanical Load Test", standard: "IEC 61215-2", mqt: "MQT 20",
    sequences: ["D"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Dynamic load tester", "Pneumatic system"],
    durationHours: 24, personnel: 1,
    description: "1000 cycles at ±1000 Pa",
    costEstimateUSD: 3000,
  },
  MQT_21: {
    id: "MQT_21", name: "PID Test", standard: "IEC 61215-2", mqt: "MQT 21",
    sequences: ["E"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["High-voltage power supply", "Environmental chamber", "IV tracer"],
    durationHours: 96, personnel: 1,
    description: "96 hours at 60°C / 85%RH with system voltage stress",
    costEstimateUSD: 3500,
  },
  MQT_22: {
    id: "MQT_22", name: "Mechanical Stress Test", standard: "IEC 61215-2", mqt: "MQT 22",
    sequences: ["B", "C"], samplesStandalone: 4, samplesCombined: 4,
    equipment: ["Mechanical stress tester"],
    durationHours: 8, personnel: 1,
    description: "Mechanical stress test on laminate materials",
    costEstimateUSD: 1000,
  },
  // IEC 61730-2 MST tests
  MST_01: {
    id: "MST_01", name: "Visual Inspection (Safety)", standard: "IEC 61730-2", mst: "MST 01",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 10, samplesCombined: 10,
    equipment: ["Inspection table", "Magnifier"],
    durationHours: 2, personnel: 1,
    description: "Safety-related visual inspection per IEC 61730-2",
    costEstimateUSD: 200,
  },
  MST_03: {
    id: "MST_03", name: "Accessibility Test", standard: "IEC 61730-2", mst: "MST 03",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Test finger (IEC 61032)", "Force gauge"],
    durationHours: 2, personnel: 1,
    description: "Verification of inaccessibility to hazardous parts",
    costEstimateUSD: 300,
  },
  MST_11: {
    id: "MST_11", name: "Dielectric Withstand Test (Dry)", standard: "IEC 61730-2", mst: "MST 11",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 10, samplesCombined: 10,
    equipment: ["Hipot tester"],
    durationHours: 2, personnel: 1,
    description: "1000V + 2× system voltage for 1 minute (dry)",
    costEstimateUSD: 300,
  },
  MST_12: {
    id: "MST_12", name: "Wet Leakage Current (Safety)", standard: "IEC 61730-2", mst: "MST 12",
    sequences: ["A", "B", "C", "D", "E"], samplesStandalone: 10, samplesCombined: 10,
    equipment: ["Wet leakage tester", "Surfactant solution"],
    durationHours: 4, personnel: 1,
    description: "Wet insulation test at system voltage",
    costEstimateUSD: 400,
  },
  MST_13: {
    id: "MST_13", name: "Ground Continuity Test", standard: "IEC 61730-2", mst: "MST 13",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Ground bond tester"],
    durationHours: 1, personnel: 1,
    description: "Frame grounding resistance < 0.1 Ω at 2× rated current or 25A",
    costEstimateUSD: 200,
  },
  MST_14: {
    id: "MST_14", name: "Impulse Voltage Test", standard: "IEC 61730-2", mst: "MST 14",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Impulse voltage generator"],
    durationHours: 4, personnel: 1,
    description: "1.2/50 µs impulse: positive and negative polarity",
    costEstimateUSD: 600,
  },
  MST_16: {
    id: "MST_16", name: "Temperature Test", standard: "IEC 61730-2", mst: "MST 16",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Thermal chamber", "Thermocouples"],
    durationHours: 8, personnel: 1,
    description: "Component temperature test during operation",
    costEstimateUSD: 500,
  },
  MST_17: {
    id: "MST_17", name: "Fire Test", standard: "IEC 61730-2", mst: "MST 17",
    sequences: ["A"], samplesStandalone: 3, samplesCombined: 3,
    equipment: ["Fire test apparatus", "Spreading flame burner"],
    durationHours: 8, personnel: 2,
    description: "Spread of flame / fire resistance classification",
    costEstimateUSD: 3000,
  },
  MST_22: {
    id: "MST_22", name: "Bypass Diode Thermal Test (Safety)", standard: "IEC 61730-2", mst: "MST 22",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Power supply", "Thermocouples", "IR camera"],
    durationHours: 8, personnel: 1,
    description: "Bypass diode safety assessment per IEC 61730-2",
    costEstimateUSD: 800,
  },
  MST_25: {
    id: "MST_25", name: "Reverse Current Overload Test", standard: "IEC 61730-2", mst: "MST 25",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Power supply", "Load bank", "IR camera"],
    durationHours: 4, personnel: 1,
    description: "Reverse current at 1.35 × Isc for 2 hours",
    costEstimateUSD: 600,
  },
  MST_26: {
    id: "MST_26", name: "Module Breakage Test", standard: "IEC 61730-2", mst: "MST 26",
    sequences: ["E"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Impact tester", "Steel ball"],
    durationHours: 4, personnel: 1,
    description: "Hard-body (steel ball) and soft-body impact test",
    costEstimateUSD: 800,
  },
  MST_34: {
    id: "MST_34", name: "Mechanical Load Test (Safety)", standard: "IEC 61730-2", mst: "MST 34",
    sequences: ["D"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Mechanical load tester", "Pneumatic system"],
    durationHours: 8, personnel: 2,
    description: "5400 Pa front and 2400 Pa rear static load safety test",
    costEstimateUSD: 1500,
  },
  MST_35: {
    id: "MST_35", name: "Peel Test", standard: "IEC 61730-2", mst: "MST 35",
    sequences: ["A", "B", "C"], samplesStandalone: 6, samplesCombined: 6,
    equipment: ["Peel tester (180°/90°)", "Force gauge", "Mounting jig"],
    durationHours: 4, personnel: 1,
    description: "Adhesion of backsheet/encapsulant: ≥ 50 N/cm (initial)",
    costEstimateUSD: 500,
  },
  MST_36: {
    id: "MST_36", name: "Cut Susceptibility Test", standard: "IEC 61730-2", mst: "MST 36",
    sequences: ["A"], samplesStandalone: 2, samplesCombined: 2,
    equipment: ["Cut tester", "Insulation tester"],
    durationHours: 4, personnel: 1,
    description: "Backsheet cut resistance and post-cut insulation",
    costEstimateUSD: 400,
  },
}

// ─── Test Sequences ───────────────────────────────────────────────────────────

export const TEST_SEQUENCES: TestSequence[] = [
  {
    id: "A", name: "Sequence A", color: "#3b82f6",
    description: "Baseline & Initial characterization — TC, NMOT, performance, hotspot, terminations, diode tests",
    modules61215: [1, 2], modules61730: [1, 2],
    tests: ["MQT_01", "MQT_02", "MQT_03", "MQT_04", "MQT_05", "MQT_06", "MQT_07", "MQT_08", "MQT_09", "MQT_14", "MQT_15", "MQT_18", "MQT_19"],
  },
  {
    id: "B", name: "Sequence B", color: "#22c55e",
    description: "UV + TC200 + HF10 — Accelerated aging: UV preconditioning → Thermal cycling (200) → Humidity-freeze (10)",
    modules61215: [3, 4], modules61730: [3, 4],
    tests: ["MQT_01", "MQT_02", "MQT_03", "MQT_10", "MQT_11", "MQT_12", "MQT_15", "MQT_19", "MQT_22", "MST_35"],
  },
  {
    id: "C", name: "Sequence C", color: "#f59e0b",
    description: "UV + DH1000 — Damp heat: UV preconditioning → 1000h damp heat (85°C/85%RH)",
    modules61215: [5, 6], modules61730: [5, 6],
    tests: ["MQT_01", "MQT_02", "MQT_03", "MQT_10", "MQT_11", "MQT_13", "MQT_15", "MQT_19", "MQT_22", "MST_35"],
  },
  {
    id: "D", name: "Sequence D", color: "#8b5cf6",
    description: "Mechanical loads — Static/dynamic mechanical load + TC50",
    modules61215: [7, 8], modules61730: [7, 8],
    tests: ["MQT_01", "MQT_02", "MQT_03", "MQT_11", "MQT_15", "MQT_16", "MQT_19", "MQT_20", "MST_34"],
  },
  {
    id: "E", name: "Sequence E", color: "#ef4444",
    description: "Hail + PID — Hail impact → PID stress at system voltage",
    modules61215: [9, 10], modules61730: [9, 10],
    tests: ["MQT_01", "MQT_02", "MQT_03", "MQT_15", "MQT_17", "MQT_19", "MQT_21", "MST_26"],
  },
]

// ─── BoM Components per IEC TS 62915:2023 Clause 4.2 ─────────────────────────

export const BOM_COMPONENTS: BomComponent[] = [
  {
    id: "frontsheet", clause: "4.2.1", name: "Frontsheet / Superstrate",
    icon: "Layers", color: "text-sky-700", bgColor: "bg-sky-50", borderColor: "border-sky-200",
    categories: [
      { id: "fs_glass_type", label: "Glass type change (tempered → semi-tempered)", severity: "major" },
      { id: "fs_thickness", label: "Glass thickness change", severity: "major" },
      { id: "fs_coating", label: "Anti-reflective coating change", severity: "minor" },
      { id: "fs_material", label: "Material change (glass → polymer)", severity: "full_requalification" },
      { id: "fs_pattern", label: "Surface texture/pattern change", severity: "minor" },
      { id: "fs_manufacturer", label: "Glass manufacturer change", severity: "major" },
    ],
    requiredTests: [
      "MQT_01", "MQT_02", "MQT_03", "MQT_06", "MQT_10", "MQT_11", "MQT_12", "MQT_13",
      "MQT_15", "MQT_16", "MQT_17", "MQT_19", "MQT_22",
      "MST_01", "MST_11", "MST_12", "MST_17", "MST_26", "MST_34", "MST_35", "MST_36",
    ],
  },
  {
    id: "encapsulation", clause: "4.2.2", name: "Encapsulation System",
    icon: "Shield", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200",
    categories: [
      { id: "enc_material", label: "Encapsulant material change (EVA → POE)", severity: "full_requalification" },
      { id: "enc_additive", label: "Additive/UV stabilizer change", severity: "major" },
      { id: "enc_manufacturer", label: "Encapsulant manufacturer change", severity: "major" },
      { id: "enc_curing", label: "Curing process change (time/temperature)", severity: "major" },
      { id: "enc_thickness", label: "Encapsulant thickness change", severity: "minor" },
      { id: "enc_crosslink", label: "Cross-linking degree change >5%", severity: "major" },
    ],
    requiredTests: [
      "MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_15", "MQT_16", "MQT_19", "MQT_22",
      "MST_01", "MST_11", "MST_12", "MST_16", "MST_17", "MST_35", "MST_36",
    ],
  },
  {
    id: "cell_tech", clause: "4.2.3", name: "Cell Technology",
    icon: "Cpu", color: "text-violet-700", bgColor: "bg-violet-50", borderColor: "border-violet-200",
    categories: [
      { id: "cell_metal", label: "Metallization material composition (paste)", severity: "major" },
      { id: "cell_busbar_area", label: "Change in busbar metallization area >20%", severity: "major" },
      { id: "cell_busbar_count", label: "Change in number of busbars", severity: "major" },
      { id: "cell_ar", label: "Change in anti-reflective coating", severity: "minor" },
      { id: "cell_semiconductor", label: "Semiconductor layer material change", severity: "full_requalification" },
      { id: "cell_crystal", label: "Crystallization process change (mono ↔ poly)", severity: "full_requalification" },
      { id: "cell_thickness", label: "Cell thickness change", severity: "major" },
      { id: "cell_dimensions", label: "Cell dimensions change", severity: "major" },
      { id: "cell_manufacturer", label: "Different cell manufacturer", severity: "major" },
    ],
    requiredTests: [
      "MQT_06", "MQT_07", "MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_15", "MQT_16",
      "MQT_19", "MQT_20", "MQT_21",
      "MST_01", "MST_11", "MST_12",
    ],
  },
  {
    id: "cell_layout", clause: "4.2.4", name: "Cell Layout",
    icon: "LayoutGrid", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200",
    categories: [
      { id: "layout_string", label: "String layout change (series/parallel)", severity: "major" },
      { id: "layout_spacing", label: "Cell spacing change", severity: "minor" },
      { id: "layout_count", label: "Number of cells change", severity: "major" },
      { id: "layout_size", label: "Cell size change (half-cut, third-cut)", severity: "major" },
      { id: "layout_shingling", label: "Shingling/tiling method change", severity: "full_requalification" },
    ],
    requiredTests: [
      "MQT_06", "MQT_09", "MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_15", "MQT_16",
      "MQT_18", "MQT_19", "MQT_20",
      "MST_01", "MST_11", "MST_12", "MST_22",
    ],
  },
  {
    id: "interconnect", clause: "4.2.5", name: "Interconnect Material / Technique",
    icon: "Cable", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200",
    categories: [
      { id: "ic_ribbon", label: "Ribbon material change (Cu → Cu-clad)", severity: "major" },
      { id: "ic_solder", label: "Solder alloy change (Pb-free transition)", severity: "major" },
      { id: "ic_bonding", label: "Bonding technique change (soldering → conductive adhesive)", severity: "full_requalification" },
      { id: "ic_tape", label: "Insulation tape material change", severity: "minor" },
      { id: "ic_wire", label: "Wire gauge/cross-section change", severity: "minor" },
      { id: "ic_busbar_ribbon", label: "Bus ribbon dimensions change", severity: "major" },
    ],
    requiredTests: [
      "MQT_06", "MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_15", "MQT_16", "MQT_19", "MQT_20",
      "MST_01", "MST_11", "MST_12", "MST_35",
    ],
  },
  {
    id: "backsheet", clause: "4.2.6", name: "Backsheet / Substrate",
    icon: "Square", color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200",
    categories: [
      { id: "bs_material", label: "Backsheet material change (TPT → TPE)", severity: "full_requalification" },
      { id: "bs_thickness", label: "Backsheet thickness change", severity: "major" },
      { id: "bs_layers", label: "Layer structure change", severity: "major" },
      { id: "bs_manufacturer", label: "Backsheet manufacturer change", severity: "major" },
      { id: "bs_color", label: "Backsheet color change (white → black)", severity: "minor" },
    ],
    requiredTests: [
      "MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_15", "MQT_16", "MQT_19", "MQT_22",
      "MST_01", "MST_03", "MST_11", "MST_12", "MST_16", "MST_17", "MST_35", "MST_36",
    ],
  },
  {
    id: "edge_seal", clause: "4.2.7", name: "Edge Seal",
    icon: "Frame", color: "text-teal-700", bgColor: "bg-teal-50", borderColor: "border-teal-200",
    categories: [
      { id: "es_material", label: "Edge seal material change", severity: "major" },
      { id: "es_dimensions", label: "Edge seal dimensions change", severity: "minor" },
      { id: "es_process", label: "Application process change", severity: "minor" },
    ],
    requiredTests: [
      "MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_15", "MQT_16", "MQT_19",
      "MST_01", "MST_11", "MST_12", "MST_35",
    ],
  },
  {
    id: "junction_box", clause: "4.2.8", name: "Junction Box / Electrical Termination",
    icon: "Box", color: "text-indigo-700", bgColor: "bg-indigo-50", borderColor: "border-indigo-200",
    categories: [
      { id: "jb_material", label: "Junction box housing material change", severity: "major" },
      { id: "jb_design", label: "Junction box design change", severity: "major" },
      { id: "jb_potting", label: "Potting compound change", severity: "major" },
      { id: "jb_attachment", label: "Attachment method change (adhesive → mechanical)", severity: "major" },
      { id: "jb_connector", label: "Connector type change", severity: "major" },
      { id: "jb_manufacturer", label: "Junction box manufacturer change", severity: "major" },
    ],
    requiredTests: [
      "MQT_06", "MQT_11", "MQT_12", "MQT_15", "MQT_14",
      "MST_01", "MST_14", "MST_22", "MST_25", "MST_34", "MST_35",
    ],
  },
  {
    id: "bypass_diode", clause: "4.2.9", name: "Bypass Diode",
    icon: "Zap", color: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-200",
    categories: [
      { id: "bd_type", label: "Diode type change (Schottky → TVS)", severity: "major" },
      { id: "bd_number", label: "Number of bypass diodes change", severity: "major" },
      { id: "bd_rating", label: "Diode voltage/current rating change", severity: "major" },
      { id: "bd_manufacturer", label: "Diode manufacturer change", severity: "minor" },
    ],
    requiredTests: [
      "MQT_06", "MQT_18",
      "MST_14", "MST_22", "MST_25", "MST_34",
    ],
  },
  {
    id: "frame", clause: "4.2.10", name: "Frame / Mounting Structure",
    icon: "Maximize2", color: "text-slate-700", bgColor: "bg-slate-50", borderColor: "border-slate-200",
    categories: [
      { id: "fr_shape", label: "Frame profile/shape change", severity: "major" },
      { id: "fr_cross", label: "Cross-section dimensions change", severity: "major" },
      { id: "fr_attachment", label: "Frame attachment method change", severity: "major" },
      { id: "fr_material", label: "Frame material change (Al → steel)", severity: "full_requalification" },
      { id: "fr_finish", label: "Surface treatment/anodizing change", severity: "minor" },
    ],
    requiredTests: [
      "MQT_06", "MQT_16", "MQT_20",
      "MST_01", "MST_13", "MST_34", "MST_35",
    ],
  },
  {
    id: "module_size", clause: "4.2.11", name: "Module Size / Output",
    icon: "Scaling", color: "text-cyan-700", bgColor: "bg-cyan-50", borderColor: "border-cyan-200",
    categories: [
      { id: "ms_dimensions", label: "Module dimensions increase >10%", severity: "major" },
      { id: "ms_power_up", label: "Power output increase >10%", severity: "major" },
      { id: "ms_power_down", label: "Power output decrease >10%", severity: "major" },
      { id: "ms_weight", label: "Module weight change >15%", severity: "major" },
      { id: "ms_voltage", label: "System voltage class change", severity: "full_requalification" },
    ],
    requiredTests: [
      "MQT_01", "MQT_02", "MQT_03", "MQT_06", "MQT_09", "MQT_11", "MQT_15", "MQT_16",
      "MQT_17", "MQT_18", "MQT_19", "MQT_20",
      "MST_01", "MST_11", "MST_12", "MST_13", "MST_26", "MST_34",
    ],
  },
  {
    id: "back_contact", clause: "4.2.3-TF", name: "Back Contact / TCO (Thin-film)",
    icon: "Sparkles", color: "text-fuchsia-700", bgColor: "bg-fuchsia-50", borderColor: "border-fuchsia-200",
    categories: [
      { id: "tco_material", label: "TCO material change (ITO → AZO)", severity: "full_requalification" },
      { id: "tco_process", label: "TCO deposition process change", severity: "major" },
      { id: "bc_material", label: "Back contact material change (Mo → Al)", severity: "full_requalification" },
      { id: "bc_thickness", label: "Back contact thickness change", severity: "major" },
    ],
    requiredTests: [
      "MQT_06", "MQT_07", "MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_15", "MQT_16",
      "MQT_19", "MQT_20", "MQT_21",
      "MST_01", "MST_11", "MST_12",
    ],
  },
]

// ─── MNRE/BIS Compliance Checklist ────────────────────────────────────────────

export const MNRE_CHECKLIST: MNRECheckItem[] = [
  {
    id: "mnre_01", category: "Registration",
    requirement: "BIS Registration (CRS) for PV modules under QCO",
    reference: "BIS QCO 2025 / IS 14286:2023",
    status: "required",
    description: "All PV modules sold in India must have BIS registration mark (ISI/CRS). Apply through BIS portal with test reports from NABL-accredited labs.",
  },
  {
    id: "mnre_02", category: "Registration",
    requirement: "ALMM (Approved List of Models and Manufacturers) listing",
    reference: "MNRE Order F.No.7/42/2020-Grid Solar",
    status: "required",
    description: "Module must be listed on MNRE ALMM Part I for government-subsidized projects. Requires BIS registration + performance data.",
  },
  {
    id: "mnre_03", category: "Standards",
    requirement: "IS/IEC 61215:2021 (Design Qualification)",
    reference: "IS 14286:2023 Part 1-1 to 1-4",
    status: "required",
    description: "Complete design qualification testing per IS/IEC 61215 series at NABL-accredited lab.",
  },
  {
    id: "mnre_04", category: "Standards",
    requirement: "IS/IEC 61730:2023 (Safety Qualification)",
    reference: "IS 14286:2023 Part 2",
    status: "required",
    description: "Safety qualification testing per IS/IEC 61730 series. Must include fire class rating.",
  },
  {
    id: "mnre_05", category: "Standards",
    requirement: "IS/IEC 62915:2023 (Type Test Re-test Guidelines)",
    reference: "IS/IEC TS 62915:2023",
    status: "required",
    description: "Design change assessment following IEC TS 62915 methodology for any BoM changes post-certification.",
  },
  {
    id: "mnre_06", category: "Sampling",
    requirement: "12 modules randomly selected from production batch",
    reference: "IS 14286:2023 Clause 6",
    status: "required",
    description: "Minimum 12 modules from a batch of ≥100 modules. Random selection witnessed by lab representative.",
  },
  {
    id: "mnre_07", category: "Sampling",
    requirement: "8 modules for IEC 61215 + 10 modules for IEC 61730",
    reference: "IEC 61215-1 / IEC 61730-1",
    status: "required",
    description: "8 modules for design qualification (2 per sequence A-D + 2 for E). 10 modules for safety qualification.",
  },
  {
    id: "mnre_08", category: "Documentation",
    requirement: "Product Family Declaration (fewer-cell variant)",
    reference: "IEC TS 62915:2023 Clause 5",
    status: "conditional",
    description: "If claiming product family coverage, declare all variants. Fewer-cell variants may be exempt from full re-test if within same family.",
  },
  {
    id: "mnre_09", category: "Documentation",
    requirement: "Bill of Materials (BoM) declaration with component specifications",
    reference: "IEC TS 62915:2023 Clause 4",
    status: "required",
    description: "Complete BoM with manufacturer names, part numbers, material specifications for all 12 component categories.",
  },
  {
    id: "mnre_10", category: "Documentation",
    requirement: "Change notification to certification body within 30 days",
    reference: "BIS CRS Scheme / IS 14286",
    status: "required",
    description: "Any design change must be notified to BIS/certification body within 30 days. Failure may result in suspension of license.",
  },
  {
    id: "mnre_11", category: "Re-testing",
    requirement: "Retesting trigger: any BoM component change",
    reference: "IEC TS 62915:2023 Table A.1",
    status: "required",
    description: "Any change to BoM components listed in Clause 4.2 triggers re-testing assessment per Table A.1 matrix.",
  },
  {
    id: "mnre_12", category: "Re-testing",
    requirement: "Full requalification if semiconductor material or module construction type changes",
    reference: "IEC TS 62915:2023 Clause 6",
    status: "required",
    description: "Changes to semiconductor material, cell technology class, or fundamental construction require full IEC 61215 + 61730 requalification.",
  },
  {
    id: "mnre_13", category: "Lab Requirements",
    requirement: "Testing at NABL-accredited / BIS-recognized lab",
    reference: "BIS QCO 2025",
    status: "required",
    description: "All qualification and re-qualification tests must be performed at NABL-accredited labs recognized by BIS for PV testing.",
  },
  {
    id: "mnre_14", category: "Lab Requirements",
    requirement: "Lab must hold ISO/IEC 17025 accreditation for PV testing scope",
    reference: "NABL / ISO 17025:2017",
    status: "required",
    description: "Laboratory must be accredited under NABL with scope covering IEC 61215, 61730, and related PV test methods.",
  },
  {
    id: "mnre_15", category: "Product Family",
    requirement: "Product family rules: same cell type, same construction, same materials",
    reference: "IEC TS 62915:2023 Clause 5",
    status: "required",
    description: "Product family defined by same cell technology, construction type, and critical materials. Variants within family may share test results.",
  },
  {
    id: "mnre_16", category: "Product Family",
    requirement: "Fewer-cell variant exemption: reduced test scope if within product family",
    reference: "IEC TS 62915:2023 Clause 5.3",
    status: "conditional",
    description: "Modules with fewer cells (lower power) within same family may qualify with reduced testing (MQT 16, 17, 20 only).",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSeverityColor(severity: Severity) {
  switch (severity) {
    case "minor": return { text: "text-blue-700", bg: "bg-blue-100", border: "border-blue-300", label: "Minor Change" }
    case "major": return { text: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", label: "Major Change" }
    case "full_requalification": return { text: "text-red-700", bg: "bg-red-100", border: "border-red-300", label: "Full Requalification" }
  }
}

export function getMaxSeverity(severities: Severity[]): Severity {
  if (severities.includes("full_requalification")) return "full_requalification"
  if (severities.includes("major")) return "major"
  return "minor"
}

/** Return unique test IDs needed for a set of selected change category IDs */
export function getRequiredTestsForChanges(selectedCategoryIds: string[]): string[] {
  const testSet = new Set<string>()
  for (const comp of BOM_COMPONENTS) {
    const hasSelected = comp.categories.some(c => selectedCategoryIds.includes(c.id))
    if (hasSelected) {
      comp.requiredTests.forEach(t => testSet.add(t))
    }
  }
  return Array.from(testSet).sort((a, b) => {
    const aNum = parseInt(a.replace(/\D/g, ""))
    const bNum = parseInt(b.replace(/\D/g, ""))
    const aPrefix = a.startsWith("MST") ? 1 : 0
    const bPrefix = b.startsWith("MST") ? 1 : 0
    if (aPrefix !== bPrefix) return aPrefix - bPrefix
    return aNum - bNum
  })
}

/** Return affected test sequences for given test IDs */
export function getAffectedSequences(testIds: string[]): string[] {
  const seqSet = new Set<string>()
  for (const seq of TEST_SEQUENCES) {
    if (seq.tests.some(t => testIds.includes(t))) {
      seqSet.add(seq.id)
    }
  }
  return Array.from(seqSet)
}

/** Total cost estimate for given test IDs */
export function estimateTotalCost(testIds: string[]): number {
  return testIds.reduce((sum, id) => sum + (TEST_DEFINITIONS[id]?.costEstimateUSD ?? 0), 0)
}

/** Total duration in hours (longest parallel path) */
export function estimateTotalDuration(testIds: string[]): number {
  // Group tests by sequence; within a sequence tests run sequentially
  // Sequences run in parallel with each other
  const seqDurations: Record<string, number> = {}
  for (const seq of TEST_SEQUENCES) {
    const seqTests = seq.tests.filter(t => testIds.includes(t))
    seqDurations[seq.id] = seqTests.reduce((sum, t) => sum + (TEST_DEFINITIONS[t]?.durationHours ?? 0), 0)
  }
  // Standalone tests not in any sequence
  const allSeqTests = new Set(TEST_SEQUENCES.flatMap(s => s.tests))
  const standalone = testIds.filter(t => !allSeqTests.has(t))
  const standaloneDuration = standalone.reduce((sum, t) => sum + (TEST_DEFINITIONS[t]?.durationHours ?? 0), 0)

  return Math.max(...Object.values(seqDurations), standaloneDuration, 0)
}

/** Total personnel-hours for given test IDs */
export function estimatePersonnelHours(testIds: string[]): number {
  return testIds.reduce((sum, id) => {
    const t = TEST_DEFINITIONS[id]
    return sum + (t ? t.durationHours * t.personnel : 0)
  }, 0)
}

/** Total samples needed (max across all sequences) */
export function estimateSamplesNeeded(testIds: string[]): { iec61215: number; iec61730: number } {
  // IEC 61215 needs 2 modules per active sequence (A-E) = max 10
  // IEC 61730 needs 2 modules per active sequence + additional
  const activeSeqs = getAffectedSequences(testIds)
  return {
    iec61215: Math.min(activeSeqs.length * 2, 10),
    iec61730: Math.min(activeSeqs.length * 2 + 2, 12),
  }
}
