// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  ClipboardList, FlaskConical, Calendar, BarChart3, CheckCircle2,
  Clock, AlertCircle, XCircle, ChevronRight, Search, Plus, Filter,
  Zap, Thermometer, Droplets, Sun, Wind, Activity, TrendingUp,
  FileText, Users, Wrench, ArrowRight, Info
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MQT {
  id: string
  code: string
  name: string
  standard: string
  clause: string
  category: "electrical" | "environmental" | "mechanical" | "visual" | "safety"
  duration: string
  sequence: number
  acceptance: string[]
  equipment: string[]
  description: string
  critical: boolean
}

interface RouteCard {
  id: string
  sampleId: string
  sampleDesc: string
  client: string
  standard: string
  createdDate: string
  dueDate: string
  priority: "low" | "normal" | "high" | "urgent"
  status: "open" | "in_progress" | "completed" | "on_hold"
  progress: number
  assignedTo: string
  currentTest: string
  mqtResults: Record<string, "pending" | "pass" | "fail" | "na" | "in_progress">
}

interface ScheduledTest {
  id: string
  sampleId: string
  mqtCode: string
  mqtName: string
  standard: string
  startDate: string
  endDate: string
  equipment: string
  technician: string
  status: "scheduled" | "in_progress" | "completed" | "delayed"
  chamber?: string
}

// ─── IEC 61215 MQTs ──────────────────────────────────────────────────────────

const IEC_61215_MQTS: MQT[] = [
  { id: "61215-mqt01", code: "MQT 01", name: "Visual Inspection", standard: "IEC 61215", clause: "4.1",
    category: "visual", duration: "1h", sequence: 1, critical: false,
    description: "Examination of the module for construction defects, workmanship issues and appearance anomalies",
    equipment: ["Lightbox", "Magnifier 10x", "Camera"],
    acceptance: ["No broken cells", "No delamination", "No interconnect damage", "Labels readable"] },
  { id: "61215-mqt02", code: "MQT 02", name: "Maximum Power Determination (STC)", standard: "IEC 61215", clause: "4.2",
    category: "electrical", duration: "2h", sequence: 2, critical: true,
    description: "I-V characteristic measurement at Standard Test Conditions (1000 W/m², 25°C, AM1.5G)",
    equipment: ["Flash Tester", "Reference Cell", "Temperature Sensor"],
    acceptance: ["Pmax ≥ Pnom × (1 - 0.03)", "Voc, Isc, FF within ±3% of nominal"] },
  { id: "61215-mqt03", code: "MQT 03", name: "Insulation Test", standard: "IEC 61215", clause: "4.3",
    category: "safety", duration: "1h", sequence: 3, critical: true,
    description: "Evaluation of insulation resistance between circuit and frame",
    equipment: ["Insulation Tester", "Test Probes"],
    acceptance: ["R_ins × Area ≥ 40 MΩ·m²", "No dielectric breakdown"] },
  { id: "61215-mqt04", code: "MQT 04", name: "Measurement of Temperature Coefficients", standard: "IEC 61215", clause: "4.4",
    category: "electrical", duration: "4h", sequence: 4, critical: false,
    description: "Determination of temperature coefficients for Pmax, Voc, Isc per IEC 60891",
    equipment: ["Flash Tester", "Thermal Chamber", "Reference Cell"],
    acceptance: ["α(Isc), β(Voc), γ(Pmax) within manufacturer spec ±20%"] },
  { id: "61215-mqt05", code: "MQT 05", name: "NMOT Determination", standard: "IEC 61215", clause: "4.5",
    category: "electrical", duration: "8h", sequence: 5, critical: false,
    description: "Nominal Module Operating Temperature measurement per IEC 61215-2 cl 4.5",
    equipment: ["Solar Simulator or Outdoor", "Thermocouple", "Pyranometer", "Anemometer"],
    acceptance: ["NMOT = Tm at (800 W/m², 20°C ambient, 1 m/s wind) ± 2°C"] },
  { id: "61215-mqt06", code: "MQT 06", name: "Performance at Low Irradiance", standard: "IEC 61215", clause: "4.6",
    category: "electrical", duration: "2h", sequence: 6, critical: false,
    description: "I-V measurement at 200 W/m², 25°C to evaluate low-light performance",
    equipment: ["Flash Tester", "Neutral Density Filters", "Reference Cell"],
    acceptance: ["η(200 W/m²) / η(1000 W/m²) ≥ 0.95"] },
  { id: "61215-mqt07", code: "MQT 07", name: "EL Imaging (Initial)", standard: "IEC 61215", clause: "4.7",
    category: "visual", duration: "1h", sequence: 7, critical: false,
    description: "Electroluminescence imaging to detect initial cell cracks, inactive areas",
    equipment: ["EL Camera", "DC Power Supply", "Dark Enclosure"],
    acceptance: ["No cell breaks >5% area", "No inactive strings"] },
  { id: "61215-mqt10", code: "MQT 10", name: "UV Preconditioning", standard: "IEC 61215", clause: "4.10",
    category: "environmental", duration: "120h", sequence: 10, critical: false,
    description: "UV exposure 15 kWh/m² (280–400 nm) for stress conditioning before sequential tests",
    equipment: ["UV Chamber", "UV Radiometer", "Flash Tester"],
    acceptance: ["Pmax degradation ≤ 5%", "No visual defects"] },
  { id: "61215-mqt11", code: "MQT 11", name: "Thermal Cycling (TC 200/400)", standard: "IEC 61215", clause: "4.11",
    category: "environmental", duration: "670h", sequence: 11, critical: true,
    description: "200 or 400 cycles between -40°C and +85°C with current injection at Isc",
    equipment: ["Thermal Chamber", "Flash Tester", "EL Camera", "Data Logger"],
    acceptance: ["Pmax degradation ≤ 5%", "R_ins ≥ 40 MΩ·m²", "No visual defects"] },
  { id: "61215-mqt12", code: "MQT 12", name: "Humidity-Freeze (HF 10)", standard: "IEC 61215", clause: "4.12",
    category: "environmental", duration: "100h", sequence: 12, critical: false,
    description: "10 cycles: 85°C/85%RH soak followed by freeze to -40°C",
    equipment: ["Humidity Chamber", "Flash Tester", "EL Camera"],
    acceptance: ["Pmax degradation ≤ 5%", "R_ins ≥ 40 MΩ·m²"] },
  { id: "61215-mqt13", code: "MQT 13", name: "Damp Heat (DH 1000)", standard: "IEC 61215", clause: "4.13",
    category: "environmental", duration: "1050h", sequence: 13, critical: true,
    description: "1000 hours at 85°C, 85%RH to evaluate humidity-driven degradation",
    equipment: ["Humidity Chamber", "Flash Tester", "EL Camera", "Insulation Tester"],
    acceptance: ["Pmax degradation ≤ 5%", "R_ins ≥ 40 MΩ·m²", "No visual defects"] },
  { id: "61215-mqt14", code: "MQT 14", name: "Robustness of Terminations", standard: "IEC 61215", clause: "4.14",
    category: "mechanical", duration: "2h", sequence: 14, critical: false,
    description: "Mechanical test of electrical terminations: tension, torque, bending",
    equipment: ["Force Gauge", "Torque Wrench", "Fixture"],
    acceptance: ["No disconnection at 250N pull", "No damage at rated torque"] },
  { id: "61215-mqt15", code: "MQT 15", name: "Wet Leakage Current", standard: "IEC 61215", clause: "4.15",
    category: "safety", duration: "4h", sequence: 15, critical: true,
    description: "Leakage current measurement when module is wet (immersed in conductive solution)",
    equipment: ["Immersion Tank", "HV Supply", "Current Meter"],
    acceptance: ["Leakage current ≤ 50 μA", "R_ins × Area ≥ 40 MΩ·m²"] },
  { id: "61215-mqt16", code: "MQT 16", name: "Static Mechanical Load (2400 Pa)", standard: "IEC 61215", clause: "4.16",
    category: "mechanical", duration: "4h", sequence: 16, critical: false,
    description: "Uniform load test: 2400 Pa front/back to simulate wind/snow loading",
    equipment: ["Load Frame", "Vacuum Bag", "Flash Tester", "EL Camera"],
    acceptance: ["Pmax degradation ≤ 5%", "No structural failure", "No cell breakage"] },
  { id: "61215-mqt17", code: "MQT 17", name: "Hail Test", standard: "IEC 61215", clause: "4.17",
    category: "mechanical", duration: "2h", sequence: 17, critical: false,
    description: "Impact of 25 mm ice balls at 23 m/s on 11 defined positions",
    equipment: ["Ice Ball Cannon", "Flash Tester", "EL Camera"],
    acceptance: ["No visual damage", "Pmax degradation ≤ 5%"] },
  { id: "61215-mqt18", code: "MQT 18", name: "Bypass Diode Thermal Test", standard: "IEC 61215", clause: "4.18",
    category: "electrical", duration: "8h", sequence: 18, critical: true,
    description: "Current loading of bypass diodes at Isc for 1h followed by thermal cycling",
    equipment: ["Power Supply", "Thermal Camera", "Thermal Chamber", "Flash Tester"],
    acceptance: ["Diode junction temp ≤ Tj,max", "Pmax degradation ≤ 5% after cycling"] },
  { id: "61215-mqt19", code: "MQT 19", name: "Reverse Current Overload", standard: "IEC 61215", clause: "4.19",
    category: "electrical", duration: "2h", sequence: 19, critical: false,
    description: "Apply 135% of Isc in reverse for 2 minutes to test reverse current tolerance",
    equipment: ["Power Supply", "Flash Tester", "EL Camera"],
    acceptance: ["No fire, explosion, or arcing", "Pmax degradation ≤ 5%"] },
]

// ─── IEC 61730 MQTs ──────────────────────────────────────────────────────────

const IEC_61730_MQTS: MQT[] = [
  { id: "61730-mst01", code: "MST 01", name: "Visual Inspection", standard: "IEC 61730", clause: "10.1",
    category: "visual", duration: "1h", sequence: 1, critical: false,
    description: "Physical examination for construction defects per IEC 61730-1 safety classes",
    equipment: ["Lightbox", "Camera", "Calipers"],
    acceptance: ["No exposed conductors", "Labels legible", "Frame integrity"] },
  { id: "61730-mst11", code: "MST 11", name: "Accessibility Test", standard: "IEC 61730", clause: "10.11",
    category: "safety", duration: "2h", sequence: 2, critical: true,
    description: "Probe access test with standard test fingers (IEC 60529 IP2X)",
    equipment: ["Test Finger Probes", "Continuity Tester"],
    acceptance: ["No contact with live parts at 2.5× Vsys", "IP2X achieved"] },
  { id: "61730-mst12", code: "MST 12", name: "Cut Susceptibility", standard: "IEC 61730", clause: "10.12",
    category: "mechanical", duration: "2h", sequence: 3, critical: false,
    description: "Resistance of backsheet and insulation to cuts and abrasion",
    equipment: ["Cut Tester", "Blade", "Continuity Tester"],
    acceptance: ["No electrical continuity through cuts", "No access to live parts"] },
  { id: "61730-mst13", code: "MST 13", name: "Ground Continuity", standard: "IEC 61730", clause: "10.13",
    category: "safety", duration: "1h", sequence: 4, critical: true,
    description: "Continuity of grounding circuit including frame and mounting hardware",
    equipment: ["Ground Bond Tester", "Milliohmmeter"],
    acceptance: ["Ground resistance ≤ 0.1 Ω", "No breaks in ground path"] },
  { id: "61730-mst14", code: "MST 14", name: "Impulse Voltage", standard: "IEC 61730", clause: "10.14",
    category: "safety", duration: "2h", sequence: 5, critical: true,
    description: "Lightning impulse test 10/700 μs at 6kV (Application Class A)",
    equipment: ["Impulse Generator", "Oscilloscope", "Insulation Tester"],
    acceptance: ["No flashover or puncture", "R_ins unchanged post-test"] },
  { id: "61730-mst15", code: "MST 15", name: "Dielectric Withstand (Hi-Pot)", standard: "IEC 61730", clause: "10.15",
    category: "safety", duration: "1h", sequence: 6, critical: true,
    description: "High voltage withstand test at Vtest = 2×Vsys + 1000V DC for 1 minute",
    equipment: ["Hi-Pot Tester", "HV Supply"],
    acceptance: ["No breakdown", "Leakage current < 50 μA"] },
  { id: "61730-mst16", code: "MST 16", name: "Insulation Test", standard: "IEC 61730", clause: "10.16",
    category: "safety", duration: "1h", sequence: 7, critical: true,
    description: "Resistance measurement between circuit and all accessible parts",
    equipment: ["Insulation Tester (1000V)"],
    acceptance: ["R_ins × Area ≥ 40 MΩ·m²"] },
  { id: "61730-mst17", code: "MST 17", name: "Wet Leakage Current", standard: "IEC 61730", clause: "10.17",
    category: "safety", duration: "4h", sequence: 8, critical: true,
    description: "Leakage current in wet conditions per IEC 62716",
    equipment: ["Spray Rack", "HV Supply", "Current Meter"],
    acceptance: ["Leakage ≤ 50 μA throughout", "No insulation failure"] },
  { id: "61730-mst22", code: "MST 22", name: "Bypass Diode Functionality", standard: "IEC 61730", clause: "10.22",
    category: "electrical", duration: "3h", sequence: 9, critical: false,
    description: "Verify correct polarity, forward voltage, and current rating of bypass diodes",
    equipment: ["Multimeter", "Power Supply", "Thermal Camera"],
    acceptance: ["All diodes functional", "Correct polarity", "Vf within spec"] },
  { id: "61730-mst32", code: "MST 32", name: "Temperature Test", standard: "IEC 61730", clause: "10.32",
    category: "environmental", duration: "8h", sequence: 10, critical: false,
    description: "Thermal evaluation under 1.25× Isc load to check thermal limits",
    equipment: ["Solar Simulator", "Thermal Camera", "Thermocouples"],
    acceptance: ["No component exceeds rated temperature", "No deformation"] },
  { id: "61730-mst51", code: "MST 51", name: "Robustness of Terminations", standard: "IEC 61730", clause: "10.51",
    category: "mechanical", duration: "2h", sequence: 11, critical: false,
    description: "Cable and connector pull test, connector mating/unmating cycle",
    equipment: ["Force Gauge", "Connector Tester"],
    acceptance: ["No disconnection at 250N", "Connectors IP65 rated"] },
  { id: "61730-mst52", code: "MST 52", name: "Module Breakage and Fire", standard: "IEC 61730", clause: "10.52",
    category: "safety", duration: "4h", sequence: 12, critical: true,
    description: "Fire spread evaluation, ball drop test, fragment retention",
    equipment: ["Ball Drop Fixture", "Fire Test Chamber"],
    acceptance: ["Class C fire rating minimum", "No fragment scatter >2m"] },
]

// ─── IEC 61853 MQTs ──────────────────────────────────────────────────────────

const IEC_61853_MQTS: MQT[] = [
  { id: "61853-p1-matrix", code: "P1-01", name: "Power & Energy Rating Matrix", standard: "IEC 61853", clause: "Part 1 Cl.5",
    category: "electrical", duration: "16h", sequence: 1, critical: true,
    description: "I-V measurements at 28 irradiance/temperature matrix points (100–1100 W/m², 15–75°C)",
    equipment: ["Flash Tester", "Thermal Chamber", "Reference Cell", "IV Tracer"],
    acceptance: ["All 28 matrix points measured", "Uncertainty ≤ 2%", "FF continuity"] },
  { id: "61853-p1-tc", code: "P1-02", name: "Temperature Coefficients", standard: "IEC 61853", clause: "Part 1 Cl.6",
    category: "electrical", duration: "4h", sequence: 2, critical: false,
    description: "α(Isc), β(Voc), γ(Pmax) determination across -10°C to +70°C",
    equipment: ["Climate Chamber", "Flash Tester", "Reference Cell"],
    acceptance: ["TC values within ±10% of stated datasheet values"] },
  { id: "61853-p1-angularloss", code: "P1-03", name: "Angular Response (IAM)", standard: "IEC 61853", clause: "Part 1 Cl.7",
    category: "electrical", duration: "8h", sequence: 3, critical: false,
    description: "Incidence angle modifier measurement at 0°, 15°, 30°, 45°, 60°, 75°",
    equipment: ["Solar Simulator", "Angle Stage", "Reference Cell"],
    acceptance: ["IAM at 60° ≥ 0.85 for mono-Si", "Smooth monotonic decrease"] },
  { id: "61853-p2-spectral", code: "P2-01", name: "Spectral Response", standard: "IEC 61853", clause: "Part 2 Cl.4",
    category: "electrical", duration: "4h", sequence: 4, critical: false,
    description: "Spectral responsivity at 300–1200 nm with QE/SR measurement",
    equipment: ["Monochromator", "Lock-In Amplifier", "Reference Cell"],
    acceptance: ["SR smoothly varying", "Peak SR within ±5% of reference"] },
  { id: "61853-p2-nmot", code: "P2-02", name: "NMOT / NOCT", standard: "IEC 61853", clause: "Part 2 Cl.5",
    category: "electrical", duration: "8h", sequence: 5, critical: false,
    description: "Outdoor measurement of NMOT (Nominal Module Operating Temperature)",
    equipment: ["Outdoor Test Stand", "Thermocouples", "Pyranometer", "Wind Sensor"],
    acceptance: ["NMOT = T_module at 800 W/m², 20°C, 1 m/s ± 2°C"] },
  { id: "61853-p3-energy", code: "P3-01", name: "Energy Rating Calculation", standard: "IEC 61853", clause: "Part 3 Cl.4",
    category: "electrical", duration: "2h", sequence: 6, critical: true,
    description: "Calculation of energy yield from power matrix and climate datasets",
    equipment: ["Software (e.g. pvlib, PVSYST)", "Power Matrix Data"],
    acceptance: ["Energy rating within ±3% of independent calculation"] },
]

// ─── IEC 61701 MQTs (Salt Mist) ──────────────────────────────────────────────

const IEC_61701_MQTS: MQT[] = [
  { id: "61701-mst01", code: "MST 01", name: "Visual Inspection (Initial)", standard: "IEC 61701", clause: "7.1",
    category: "visual", duration: "1h", sequence: 1, critical: false,
    description: "Initial visual inspection and photographic documentation of module",
    equipment: ["Camera", "Lightbox", "Ruler"],
    acceptance: ["Document all pre-existing marks", "Dimensional check complete"] },
  { id: "61701-mst02", code: "MST 02", name: "Pmax at STC (Initial)", standard: "IEC 61701", clause: "7.2",
    category: "electrical", duration: "2h", sequence: 2, critical: true,
    description: "Initial I-V measurement at STC for performance baseline",
    equipment: ["Flash Tester", "Reference Cell"],
    acceptance: ["Pmax documented as baseline P0"] },
  { id: "61701-mst03", code: "MST 03", name: "Insulation Test (Initial)", standard: "IEC 61701", clause: "7.3",
    category: "safety", duration: "1h", sequence: 3, critical: true,
    description: "Baseline insulation resistance before salt exposure",
    equipment: ["Insulation Tester"],
    acceptance: ["R_ins × Area ≥ 40 MΩ·m²"] },
  { id: "61701-mst04", code: "MST 04", name: "Salt Mist Exposure", standard: "IEC 61701", clause: "7.4",
    category: "environmental", duration: "200h", sequence: 4, critical: true,
    description: "Salt fog exposure at 35°C, 5% NaCl solution at 1–2 mL/h per 80 cm². Severity classes: 1 (24h), 2 (48h), 3 (96h), 4 (192h), 5 (96h×2 with recovery), 6 (192h×2 with recovery)",
    equipment: ["Salt Fog Chamber", "pH Meter", "Collection Vessels", "NaCl Solution"],
    acceptance: ["pH 6.5–7.2", "Deposition rate 1–2 mL/h", "Temperature 35°C ± 2°C"] },
  { id: "61701-mst05", code: "MST 05", name: "Drying & Recovery", standard: "IEC 61701", clause: "7.5",
    category: "environmental", duration: "24h", sequence: 5, critical: false,
    description: "Recovery period at ambient conditions after salt mist exposure",
    equipment: ["Clean Bench", "Timer"],
    acceptance: ["24h at 23°C±5°C, RH ≤75%"] },
  { id: "61701-mst06", code: "MST 06", name: "Visual Inspection (Post)", standard: "IEC 61701", clause: "7.6",
    category: "visual", duration: "1h", sequence: 6, critical: false,
    description: "Post-exposure visual inspection: corrosion, delamination, discoloration",
    equipment: ["Camera", "Lightbox", "Magnifier"],
    acceptance: ["No corrosion bridging insulation paths", "Document all changes"] },
  { id: "61701-mst07", code: "MST 07", name: "Pmax at STC (Final)", standard: "IEC 61701", clause: "7.7",
    category: "electrical", duration: "2h", sequence: 7, critical: true,
    description: "Final I-V measurement to assess salt-induced performance degradation",
    equipment: ["Flash Tester", "Reference Cell"],
    acceptance: ["Pmax degradation ≤ 5% from P0"] },
  { id: "61701-mst08", code: "MST 08", name: "Insulation Test (Final)", standard: "IEC 61701", clause: "7.8",
    category: "safety", duration: "1h", sequence: 8, critical: true,
    description: "Post-exposure insulation resistance to check salt-induced degradation",
    equipment: ["Insulation Tester"],
    acceptance: ["R_ins × Area ≥ 40 MΩ·m²"] },
  { id: "61701-mst09", code: "MST 09", name: "EL Imaging (Post)", standard: "IEC 61701", clause: "7.9",
    category: "visual", duration: "1h", sequence: 9, critical: false,
    description: "Electroluminescence imaging post-salt exposure to detect new cracks",
    equipment: ["EL Camera", "DC Power Supply"],
    acceptance: ["No new cell cracks >5% area", "No new inactive strings"] },
]

const ALL_MQTS: MQT[] = [
  ...IEC_61215_MQTS,
  ...IEC_61730_MQTS,
  ...IEC_61853_MQTS,
  ...IEC_61701_MQTS,
]

// ─── Mock Route Cards ──────────────────────────────────────────────────────────

const MOCK_ROUTE_CARDS: RouteCard[] = [
  {
    id: "RC-2026-001", sampleId: "SMP-2026-041", sampleDesc: "Mono-Si 410W Module",
    client: "SolarTech Industries", standard: "IEC 61215", createdDate: "2026-02-10",
    dueDate: "2026-04-30", priority: "high", status: "in_progress", progress: 45,
    assignedTo: "Rajesh Kumar", currentTest: "MQT 11 - Thermal Cycling",
    mqtResults: { "61215-mqt01": "pass", "61215-mqt02": "pass", "61215-mqt03": "pass",
                  "61215-mqt04": "pass", "61215-mqt05": "pass", "61215-mqt06": "pass",
                  "61215-mqt07": "pass", "61215-mqt10": "pass", "61215-mqt11": "in_progress",
                  "61215-mqt12": "pending", "61215-mqt13": "pending", "61215-mqt14": "pending",
                  "61215-mqt15": "pending", "61215-mqt16": "pending", "61215-mqt17": "pending",
                  "61215-mqt18": "pending", "61215-mqt19": "pending" }
  },
  {
    id: "RC-2026-002", sampleId: "SMP-2026-039", sampleDesc: "TOPCon 430W Module",
    client: "Green Power Corp", standard: "IEC 61730", createdDate: "2026-02-15",
    dueDate: "2026-03-20", priority: "urgent", status: "in_progress", progress: 67,
    assignedTo: "Priya Sharma", currentTest: "MST 17 - Wet Leakage",
    mqtResults: { "61730-mst01": "pass", "61730-mst11": "pass", "61730-mst12": "pass",
                  "61730-mst13": "pass", "61730-mst14": "pass", "61730-mst15": "pass",
                  "61730-mst16": "pass", "61730-mst17": "in_progress", "61730-mst22": "pending",
                  "61730-mst32": "pending", "61730-mst51": "pending", "61730-mst52": "pending" }
  },
  {
    id: "RC-2026-003", sampleId: "SMP-2026-035", sampleDesc: "PERC Bifacial 400W",
    client: "RenewTech Solutions", standard: "IEC 61853", createdDate: "2026-01-20",
    dueDate: "2026-03-15", priority: "normal", status: "completed", progress: 100,
    assignedTo: "Arun Patel", currentTest: "Completed",
    mqtResults: { "61853-p1-matrix": "pass", "61853-p1-tc": "pass", "61853-p1-angularloss": "pass",
                  "61853-p2-spectral": "pass", "61853-p2-nmot": "pass", "61853-p3-energy": "pass" }
  },
  {
    id: "RC-2026-004", sampleId: "SMP-2026-042", sampleDesc: "HJT 450W Module",
    client: "PowerGen Ltd", standard: "IEC 61701", createdDate: "2026-03-01",
    dueDate: "2026-05-15", priority: "normal", status: "in_progress", progress: 30,
    assignedTo: "Deepa Nair", currentTest: "MST 04 - Salt Mist Exposure",
    mqtResults: { "61701-mst01": "pass", "61701-mst02": "pass", "61701-mst03": "pass",
                  "61701-mst04": "in_progress", "61701-mst05": "pending", "61701-mst06": "pending",
                  "61701-mst07": "pending", "61701-mst08": "pending", "61701-mst09": "pending" }
  },
  {
    id: "RC-2026-005", sampleId: "SMP-2026-037", sampleDesc: "Poly-Si 370W Module",
    client: "Budget Solar Inc", standard: "IEC 61215", createdDate: "2026-02-01",
    dueDate: "2026-02-28", priority: "low", status: "on_hold", progress: 20,
    assignedTo: "Vikram Singh", currentTest: "MQT 04 - Temp Coefficients",
    mqtResults: { "61215-mqt01": "pass", "61215-mqt02": "fail", "61215-mqt03": "pass",
                  "61215-mqt04": "in_progress" }
  },
]

// ─── Mock Schedule ─────────────────────────────────────────────────────────────

const MOCK_SCHEDULE: ScheduledTest[] = [
  { id: "SCH-001", sampleId: "SMP-2026-041", mqtCode: "MQT 11", mqtName: "Thermal Cycling TC200",
    standard: "IEC 61215", startDate: "2026-03-10", endDate: "2026-04-01",
    equipment: "Thermal Chamber TC-01", technician: "Rajesh Kumar", status: "in_progress", chamber: "TC-01" },
  { id: "SCH-002", sampleId: "SMP-2026-039", mqtCode: "MST 17", mqtName: "Wet Leakage Current",
    standard: "IEC 61730", startDate: "2026-03-09", endDate: "2026-03-10",
    equipment: "Safety Test Station", technician: "Priya Sharma", status: "in_progress" },
  { id: "SCH-003", sampleId: "SMP-2026-042", mqtCode: "MST 04", mqtName: "Salt Mist Exposure 96h",
    standard: "IEC 61701", startDate: "2026-03-08", endDate: "2026-03-12",
    equipment: "Salt Fog Chamber SF-01", technician: "Deepa Nair", status: "in_progress", chamber: "SF-01" },
  { id: "SCH-004", sampleId: "SMP-2026-044", mqtCode: "MQT 02", mqtName: "Pmax at STC",
    standard: "IEC 61215", startDate: "2026-03-11", endDate: "2026-03-11",
    equipment: "Flash Tester FT-02", technician: "Arun Patel", status: "scheduled" },
  { id: "SCH-005", sampleId: "SMP-2026-045", mqtCode: "MQT 13", mqtName: "Damp Heat DH1000",
    standard: "IEC 61215", startDate: "2026-03-15", endDate: "2026-04-25",
    equipment: "Humidity Chamber HC-02", technician: "Vikram Singh", status: "scheduled", chamber: "HC-02" },
  { id: "SCH-006", sampleId: "SMP-2026-040", mqtCode: "MST 15", mqtName: "Dielectric Withstand",
    standard: "IEC 61730", startDate: "2026-03-12", endDate: "2026-03-12",
    equipment: "Hi-Pot Tester HP-01", technician: "Priya Sharma", status: "scheduled" },
  { id: "SCH-007", sampleId: "SMP-2026-038", mqtCode: "MQT 11", mqtName: "Thermal Cycling TC400",
    standard: "IEC 61215", startDate: "2026-02-01", endDate: "2026-03-08",
    equipment: "Thermal Chamber TC-02", technician: "Rajesh Kumar", status: "completed", chamber: "TC-02" },
]

// ─── Helper ────────────────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  electrical: "bg-blue-100 text-blue-700",
  environmental: "bg-green-100 text-green-700",
  mechanical: "bg-orange-100 text-orange-700",
  visual: "bg-purple-100 text-purple-700",
  safety: "bg-red-100 text-red-700",
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
}

const statusColors: Record<string, string> = {
  open: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-amber-100 text-amber-700",
}

const mqtResultColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-500",
  in_progress: "bg-blue-100 text-blue-700",
  pass: "bg-green-100 text-green-700",
  fail: "bg-red-100 text-red-700",
  na: "bg-gray-50 text-gray-400",
}

const scheduleStatusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  delayed: "bg-red-100 text-red-700",
}

function getStandardColor(standard: string) {
  if (standard.includes("61215")) return "bg-blue-500"
  if (standard.includes("61730")) return "bg-purple-500"
  if (standard.includes("61853")) return "bg-green-500"
  if (standard.includes("61701")) return "bg-orange-500"
  return "bg-gray-500"
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TestProtocolsManager() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [standardFilter, setStandardFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMQT, setSelectedMQT] = useState<MQT | null>(null)
  const [selectedRC, setSelectedRC] = useState<RouteCard | null>(null)

  const filteredMQTs = useMemo(() => {
    return ALL_MQTS.filter((m) => {
      if (standardFilter !== "all" && !m.standard.includes(standardFilter)) return false
      if (categoryFilter !== "all" && m.category !== categoryFilter) return false
      if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !m.code.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [standardFilter, categoryFilter, searchQuery])

  // Stats
  const totalRC = MOCK_ROUTE_CARDS.length
  const inProgressRC = MOCK_ROUTE_CARDS.filter(r => r.status === "in_progress").length
  const completedRC = MOCK_ROUTE_CARDS.filter(r => r.status === "completed").length
  const activeScheduled = MOCK_SCHEDULE.filter(s => s.status === "in_progress").length
  const upcomingScheduled = MOCK_SCHEDULE.filter(s => s.status === "scheduled").length

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 h-auto flex-wrap">
          <TabsTrigger value="dashboard" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="protocols" className="text-xs">
            <ClipboardList className="h-3 w-3 mr-1" /> Protocol Library
          </TabsTrigger>
          <TabsTrigger value="routecards" className="text-xs">
            <FileText className="h-3 w-3 mr-1" /> Route Cards
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" /> Test Scheduler
          </TabsTrigger>
          <TabsTrigger value="status" className="text-xs">
            <Activity className="h-3 w-3 mr-1" /> Status Tracking
          </TabsTrigger>
        </TabsList>

        {/* ── DASHBOARD TAB ──────────────────────────────────────── */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Route Cards", value: totalRC, icon: FileText, color: "text-blue-600" },
              { label: "In Progress", value: inProgressRC, icon: Activity, color: "text-amber-600" },
              { label: "Completed", value: completedRC, icon: CheckCircle2, color: "text-green-600" },
              { label: "Active Tests", value: activeScheduled, icon: Zap, color: "text-purple-600" },
              { label: "Upcoming", value: upcomingScheduled, icon: Calendar, color: "text-gray-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="text-center py-3">
                <CardContent className="pt-2 pb-0">
                  <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Standards Coverage */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { std: "IEC 61215", mqts: IEC_61215_MQTS.length, desc: "Design Qualification", color: "blue", icon: Sun },
              { std: "IEC 61730", mqts: IEC_61730_MQTS.length, desc: "Safety Qualification", color: "purple", icon: Zap },
              { std: "IEC 61853", mqts: IEC_61853_MQTS.length, desc: "Energy Rating", color: "green", icon: TrendingUp },
              { std: "IEC 61701", mqts: IEC_61701_MQTS.length, desc: "Salt Mist Corrosion", color: "orange", icon: Droplets },
            ].map(({ std, mqts, desc, color, icon: Icon }) => (
              <Card key={std} className={`border-l-4 border-l-${color}-500`}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 text-${color}-500`} />
                    <span className="text-sm font-semibold">{std}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{desc}</div>
                  <div className="text-2xl font-bold">{mqts}</div>
                  <div className="text-xs text-gray-400">test sequences</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Active Route Cards Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Active Route Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {MOCK_ROUTE_CARDS.filter(r => r.status === "in_progress").map(rc => (
                  <div key={rc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                       onClick={() => { setSelectedRC(rc); setActiveTab("routecards") }}>
                    <div className={`w-2 h-2 rounded-full ${rc.priority === "urgent" ? "bg-red-500" : rc.priority === "high" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{rc.id}</span>
                        <span className="text-xs text-gray-500">{rc.sampleId}</span>
                        <Badge className={`text-xs py-0 ${priorityColors[rc.priority]}`}>{rc.priority}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">{rc.sampleDesc} · {rc.standard} · {rc.currentTest}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-medium">{rc.progress}%</div>
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-0.5">
                          <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${rc.progress}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{rc.assignedTo.split(" ")[0]}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment Utilization */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-500" />
                Equipment Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Thermal Chamber TC-01", utilization: 85, status: "busy", test: "TC200 – SMP-2026-041" },
                  { name: "Salt Fog Chamber SF-01", utilization: 100, status: "busy", test: "Salt Mist – SMP-2026-042" },
                  { name: "Humidity Chamber HC-01", utilization: 40, status: "available", test: "Idle" },
                  { name: "Flash Tester FT-02", utilization: 60, status: "available", test: "Scheduled 11-Mar" },
                  { name: "Hi-Pot Tester HP-01", utilization: 20, status: "available", test: "Scheduled 12-Mar" },
                ].map(eq => (
                  <div key={eq.name} className="flex items-center gap-3">
                    <div className="w-36 text-xs font-medium truncate">{eq.name}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full">
                      <div className={`h-2 rounded-full ${eq.utilization >= 80 ? "bg-red-400" : eq.utilization >= 50 ? "bg-amber-400" : "bg-green-400"}`}
                           style={{ width: `${eq.utilization}%` }} />
                    </div>
                    <div className="text-xs w-8 text-right font-mono">{eq.utilization}%</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${eq.status === "busy" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {eq.status}
                    </span>
                    <div className="text-xs text-gray-400 w-36 truncate">{eq.test}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PROTOCOL LIBRARY TAB ──────────────────────────────────── */}
        <TabsContent value="protocols" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-gray-400" />
              <Input placeholder="Search MQTs..." className="pl-8 h-8 text-xs w-48"
                     value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-1">
              {["all", "61215", "61730", "61853", "61701"].map(std => (
                <button key={std} onClick={() => setStandardFilter(std)}
                        className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                          standardFilter === std ? `${std === "all" ? "bg-gray-700" : std === "61215" ? "bg-blue-500" : std === "61730" ? "bg-purple-500" : std === "61853" ? "bg-green-500" : "bg-orange-500"} text-white` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {std === "all" ? "All" : `IEC ${std}`}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-2">
              {["all", "electrical", "environmental", "mechanical", "visual", "safety"].map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${categoryFilter === cat ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-auto">{filteredMQTs.length} tests</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMQTs.map(mqt => (
              <Card key={mqt.id}
                    className={`cursor-pointer hover:shadow-md transition-shadow ${mqt.critical ? "border-l-4 border-l-red-400" : ""} ${selectedMQT?.id === mqt.id ? "ring-2 ring-amber-400" : ""}`}
                    onClick={() => setSelectedMQT(selectedMQT?.id === mqt.id ? null : mqt)}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${getStandardColor(mqt.standard)}`}>
                          {mqt.code}
                        </span>
                        <span className="text-sm font-semibold">{mqt.name}</span>
                        {mqt.critical && <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">CRITICAL</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{mqt.standard} · Clause {mqt.clause}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${categoryColors[mqt.category]}`}>{mqt.category}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" />{mqt.duration}</span>
                    </div>
                  </div>

                  {selectedMQT?.id === mqt.id && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <p className="text-xs text-gray-600">{mqt.description}</p>
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> Acceptance Criteria
                        </div>
                        <ul className="space-y-0.5">
                          {mqt.acceptance.map((a, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                              <ArrowRight className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Wrench className="h-3 w-3 text-blue-500" /> Required Equipment
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {mqt.equipment.map(eq => (
                            <span key={eq} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{eq}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── ROUTE CARDS TAB ──────────────────────────────────────── */}
        <TabsContent value="routecards" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {["all", "in_progress", "completed", "on_hold"].map(s => (
                <button key={s} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
            <Button size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" /> New Route Card
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_ROUTE_CARDS.map(rc => {
              const mqtList = ALL_MQTS.filter(m => m.standard.includes(rc.standard.replace("IEC ", "")))
              const results = rc.mqtResults
              const passCount = Object.values(results).filter(v => v === "pass").length
              const failCount = Object.values(results).filter(v => v === "fail").length
              const inProgressCount = Object.values(results).filter(v => v === "in_progress").length

              return (
                <Card key={rc.id} className={`${selectedRC?.id === rc.id ? "ring-2 ring-amber-400" : ""}`}>
                  <CardContent className="pt-4 pb-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{rc.id}</span>
                          <Badge className={`text-xs py-0 ${priorityColors[rc.priority]}`}>{rc.priority}</Badge>
                          <Badge className={`text-xs py-0 ${statusColors[rc.status]}`}>{rc.status.replace("_", " ")}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {rc.sampleId} · {rc.sampleDesc} · <span className="font-medium">{rc.client}</span>
                        </div>
                        <div className="text-xs text-gray-400">{rc.standard} · Due: {rc.dueDate} · {rc.assignedTo}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-500">{rc.progress}%</div>
                        <div className="flex gap-1 text-xs justify-end mt-1">
                          <span className="text-green-600">{passCount}P</span>
                          <span className="text-red-600">{failCount}F</span>
                          {inProgressCount > 0 && <span className="text-blue-600">{inProgressCount}IP</span>}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                           style={{ width: `${rc.progress}%` }} />
                    </div>

                    {/* MQT Status Grid */}
                    <div className="text-xs font-semibold text-gray-600 mb-2">Current Test: {rc.currentTest}</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(rc.mqtResults).map(([mqtId, result]) => {
                        const mqt = ALL_MQTS.find(m => m.id === mqtId)
                        if (!mqt) return null
                        return (
                          <div key={mqtId}
                               className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${mqtResultColors[result]}`}
                               title={`${mqt.code}: ${mqt.name}`}>
                            {result === "pass" && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {result === "fail" && <XCircle className="h-2.5 w-2.5" />}
                            {result === "in_progress" && <Clock className="h-2.5 w-2.5" />}
                            {mqt.code}
                          </div>
                        )
                      })}
                    </div>

                    {/* Test sequence progress for selected */}
                    {selectedRC?.id === rc.id && (
                      <div className="mt-4 border-t pt-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Test Sequence Detail</div>
                        <div className="relative">
                          <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200" />
                          <div className="space-y-2">
                            {ALL_MQTS.filter(m => m.standard.includes(rc.standard.replace("IEC ", ""))).map(mqt => {
                              const result = results[mqt.id] || "pending"
                              return (
                                <div key={mqt.id} className="flex items-center gap-3 pl-7 relative">
                                  <div className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs
                                    ${result === "pass" ? "bg-green-500" : result === "fail" ? "bg-red-500" : result === "in_progress" ? "bg-blue-500" : "bg-gray-200"}`}>
                                    {result === "pass" ? "✓" : result === "fail" ? "✗" : result === "in_progress" ? "▶" : ""}
                                  </div>
                                  <div className="flex-1 flex items-center justify-between">
                                    <div>
                                      <span className="text-xs font-medium">{mqt.code} – {mqt.name}</span>
                                      <span className="text-xs text-gray-400 ml-2">{mqt.duration}</span>
                                    </div>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${mqtResultColors[result]}`}>{result}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex gap-2">
                      <button onClick={() => setSelectedRC(selectedRC?.id === rc.id ? null : rc)}
                              className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                        {selectedRC?.id === rc.id ? "Collapse" : "View Sequence"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* ── TEST SCHEDULER TAB ──────────────────────────────────────── */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Test Schedule – March 2026</h3>
              <p className="text-xs text-gray-500">Equipment booking and technician assignments</p>
            </div>
            <Button size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" /> Schedule Test
            </Button>
          </div>

          {/* Timeline View */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-gray-500">Gantt-style Timeline (March 2026)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day headers */}
                  <div className="flex mb-1">
                    <div className="w-52 shrink-0 text-xs text-gray-400 font-medium">Test</div>
                    {Array.from({ length: 22 }, (_, i) => i + 7).map(d => (
                      <div key={d} className="flex-1 text-center text-xs text-gray-400 font-mono">{d}</div>
                    ))}
                  </div>
                  {/* Test bars */}
                  {MOCK_SCHEDULE.map(sch => {
                    const start = parseInt(sch.startDate.split("-")[2])
                    const end = parseInt(sch.endDate.split("-")[2])
                    const startCol = Math.max(0, start - 7)
                    const spanCols = Math.min(22, end - 7) - startCol + 1

                    return (
                      <div key={sch.id} className="flex items-center mb-1.5">
                        <div className="w-52 shrink-0 pr-2">
                          <div className="text-xs font-medium truncate">{sch.mqtCode}</div>
                          <div className="text-xs text-gray-400 truncate">{sch.sampleId}</div>
                        </div>
                        <div className="flex-1 relative h-6">
                          <div className="absolute h-full flex" style={{ width: "100%" }}>
                            {Array.from({ length: 22 }, (_, i) => (
                              <div key={i} className="flex-1 border-r border-gray-100" />
                            ))}
                          </div>
                          <div className={`absolute h-5 top-0.5 rounded text-white text-xs flex items-center px-2 font-medium
                            ${sch.status === "completed" ? "bg-green-400" : sch.status === "in_progress" ? "bg-amber-400" : sch.status === "delayed" ? "bg-red-400" : "bg-blue-400"}`}
                               style={{
                                 left: `${(startCol / 22) * 100}%`,
                                 width: `${(Math.max(1, spanCols) / 22) * 100}%`,
                               }}>
                            <span className="truncate">{sch.mqtName}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex mt-2 pt-2 border-t gap-4 text-xs text-gray-500">
                    {[["bg-blue-400", "Scheduled"], ["bg-amber-400", "In Progress"], ["bg-green-400", "Completed"], ["bg-red-400", "Delayed"]].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${c}`} />{l}</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Scheduled Tests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {MOCK_SCHEDULE.map(sch => (
                  <div key={sch.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${sch.status === "in_progress" ? "bg-amber-500" : sch.status === "completed" ? "bg-green-500" : sch.status === "delayed" ? "bg-red-500" : "bg-blue-500"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{sch.mqtCode} – {sch.mqtName}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${scheduleStatusColors[sch.status]}`}>{sch.status.replace("_", " ")}</span>
                      </div>
                      <div className="text-xs text-gray-400">{sch.sampleId} · {sch.standard} · {sch.equipment} · {sch.technician}</div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>{sch.startDate}</div>
                      <div>→ {sch.endDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── STATUS TRACKING TAB ──────────────────────────────────────── */}
        <TabsContent value="status" className="space-y-4 mt-4">
          {/* Pass/Fail Summary by Standard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { std: "IEC 61215", pass: 3, fail: 0, inProgress: 1, total: 4 },
              { std: "IEC 61730", pass: 2, fail: 0, inProgress: 1, total: 3 },
              { std: "IEC 61853", pass: 1, fail: 0, inProgress: 0, total: 1 },
              { std: "IEC 61701", pass: 1, fail: 0, inProgress: 1, total: 2 },
            ].map(({ std, pass, fail, inProgress, total }) => (
              <Card key={std}>
                <CardContent className="pt-3 pb-3">
                  <div className="text-xs font-semibold text-gray-700 mb-2">{std}</div>
                  <div className="flex gap-2 text-xs mb-1">
                    <span className="text-green-600 font-bold">{pass} Pass</span>
                    {fail > 0 && <span className="text-red-600 font-bold">{fail} Fail</span>}
                    {inProgress > 0 && <span className="text-blue-600">{inProgress} Active</span>}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="bg-green-400 h-full" style={{ width: `${(pass/total)*100}%` }} />
                    <div className="bg-blue-400 h-full" style={{ width: `${(inProgress/total)*100}%` }} />
                    <div className="bg-red-400 h-full" style={{ width: `${(fail/total)*100}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{total} route cards</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed MQT Status per Standard */}
          {[
            { std: "IEC 61215", mqts: IEC_61215_MQTS, rc: MOCK_ROUTE_CARDS[0] },
            { std: "IEC 61730", mqts: IEC_61730_MQTS, rc: MOCK_ROUTE_CARDS[1] },
            { std: "IEC 61853", mqts: IEC_61853_MQTS, rc: MOCK_ROUTE_CARDS[2] },
            { std: "IEC 61701", mqts: IEC_61701_MQTS, rc: MOCK_ROUTE_CARDS[3] },
          ].map(({ std, mqts, rc }) => (
            <Card key={std}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{std} – Sample {rc?.sampleId}</span>
                  <span className="text-xs text-gray-400 font-normal">{rc?.sampleDesc}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mqts.map(mqt => {
                    const result = rc?.mqtResults[mqt.id] || "pending"
                    return (
                      <div key={mqt.id} className={`flex items-center gap-2 p-2 rounded border ${result === "pass" ? "border-green-200 bg-green-50" : result === "fail" ? "border-red-200 bg-red-50" : result === "in_progress" ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${result === "pass" ? "bg-green-500" : result === "fail" ? "bg-red-500" : result === "in_progress" ? "bg-blue-500 animate-pulse" : "bg-gray-300"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{mqt.code}</div>
                          <div className="text-xs text-gray-500 truncate">{mqt.name}</div>
                        </div>
                        <div className={`text-xs font-medium ${result === "pass" ? "text-green-600" : result === "fail" ? "text-red-600" : result === "in_progress" ? "text-blue-600" : "text-gray-400"}`}>
                          {result === "pass" ? "✓" : result === "fail" ? "✗" : result === "in_progress" ? "▶" : "–"}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
