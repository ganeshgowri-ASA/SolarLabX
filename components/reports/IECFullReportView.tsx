// @ts-nocheck
"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  ResponsiveContainer, LineChart, Line, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts"
import { CheckCircle, XCircle, Printer, FileText, Sun, Zap, Droplets, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { DEFAULT_LAB_DETAILS } from "@/lib/report-test-definitions"
import { ExportToolbar } from "@/components/reports/ExportToolbar"

// ─── Test Results Data ────────────────────────────────────────────────────────

const IEC_61215_RESULTS = [
  { id: "mqt01", clause: "MQT 01 / Cl.4.1", testName: "Visual Inspection", pass: true, technician: "Rajesh Kumar", date: "2026-01-15", values: { frontSurface: "PASS", rearSurface: "PASS", frameEdges: "PASS", junctionBox: "PASS" } },
  { id: "mqt02-i", clause: "MQT 02 / Cl.4.2 (Initial)", testName: "Maximum Power at STC", pass: true, technician: "Rajesh Kumar", date: "2026-01-16", values: { pmax: "401.5 W", voc: "49.28 V", isc: "10.48 A", vmp: "40.12 V", imp: "10.01 A", ff: "0.782", efficiency: "21.4%" } },
  { id: "mqt03", clause: "MQT 03 / Cl.4.3", testName: "Insulation Test", pass: true, technician: "Priya Sharma", date: "2026-01-16", values: { rInsulation: "82.5 MΩ·m²", testVoltage: "1000V DC", threshold: "≥40 MΩ·m²", result: "PASS" } },
  { id: "mqt04", clause: "MQT 04 / Cl.4.4", testName: "Temperature Coefficients", pass: true, technician: "Arun Patel", date: "2026-01-18", values: { alpha: "+0.052%/°C", beta: "-0.312%/°C", gamma: "-0.348%/°C" } },
  { id: "mqt05", clause: "MQT 05 / Cl.4.5", testName: "NMOT Determination", pass: true, technician: "Deepa Nair", date: "2026-01-20", values: { nmot: "44.2 ± 1.5 °C", conditions: "800W/m², 20°C, 1m/s", points: "87 valid" } },
  { id: "mqt06", clause: "MQT 06 / Cl.4.6", testName: "Performance at Low Irradiance (200 W/m²)", pass: true, technician: "Rajesh Kumar", date: "2026-01-21", values: { pmax200: "72.8 W", efficiency200: "20.8%", effRatio: "0.972 (≥0.95)" } },
  { id: "mqt07-i", clause: "MQT 07 / Cl.4.7 (Initial)", testName: "EL Imaging – Initial", pass: true, technician: "Priya Sharma", date: "2026-01-22", values: { cracks: "None detected", inactiveCells: "0", crackArea: "0.0%" } },
  { id: "mqt10", clause: "MQT 10 / Cl.4.10", testName: "UV Preconditioning (15 kWh/m²)", pass: true, technician: "Vikram Singh", date: "2026-01-25", values: { uvDose: "15.2 kWh/m²", pmaxAfter: "399.4 W", degradation: "-0.52% (≤5%)" } },
  { id: "mqt11", clause: "MQT 11 / Cl.4.11", testName: "Thermal Cycling TC200 (-40°C to +85°C)", pass: true, technician: "Rajesh Kumar", date: "2026-02-10", values: { cycles: "200", pmaxAfter: "395.8 W", degradation: "-0.90% (≤5%)", rIns: "71.3 MΩ·m²", elResult: "No new cracks" } },
  { id: "mqt12", clause: "MQT 12 / Cl.4.12", testName: "Humidity-Freeze HF10", pass: true, technician: "Priya Sharma", date: "2026-02-18", values: { cycles: "10", pmaxAfter: "393.2 W", degradation: "-2.11% (≤5%)", rIns: "68.4 MΩ·m²" } },
  { id: "mqt13", clause: "MQT 13 / Cl.4.13", testName: "Damp Heat DH1000 (85°C/85%RH)", pass: true, technician: "Rajesh Kumar", date: "2026-03-05", values: { duration: "1008 h", temp: "85.2°C", rh: "85.1%", pmaxAfter: "382.7 W", degradation: "-4.68% (≤5%)", rIns: "52.1 MΩ·m²" } },
  { id: "mqt14", clause: "MQT 14 / Cl.4.14", testName: "Robustness of Terminations", pass: true, technician: "Arun Patel", date: "2026-03-06", values: { pullForce: "280 N (≥250 N)", torque: "Rated torque", result: "No disconnection" } },
  { id: "mqt15", clause: "MQT 15 / Cl.4.15", testName: "Wet Leakage Current", pass: true, technician: "Priya Sharma", date: "2026-03-07", values: { leakage: "8.2 μA (≤50 μA)", duration: "4 h", result: "PASS" } },
  { id: "mqt16", clause: "MQT 16 / Cl.4.16", testName: "Static Mechanical Load (2400 Pa front+rear)", pass: true, technician: "Vikram Singh", date: "2026-03-07", values: { frontLoad: "2400 Pa × 1h", rearLoad: "2400 Pa × 1h", pmaxAfter: "393.8 W", degradation: "-1.92% (≤5%)" } },
  { id: "mqt17", clause: "MQT 17 / Cl.4.17", testName: "Hail Test (25 mm @ 23 m/s)", pass: true, technician: "Arun Patel", date: "2026-03-08", values: { impactPoints: "11", speed: "23 m/s", diameter: "25 mm", visualDamage: "None", pmaxAfter: "398.1 W" } },
  { id: "mqt18", clause: "MQT 18 / Cl.4.18", testName: "Bypass Diode Thermal Test", pass: true, technician: "Deepa Nair", date: "2026-03-08", values: { diodes: "3", currentApplied: "10.48 A (Isc)", maxDiodeTemp: "78.2°C (< Tj,max=100°C)", pmaxAfter: "394.2 W" } },
  { id: "mqt19", clause: "MQT 19 / Cl.4.19", testName: "Reverse Current Overload (135% Isc)", pass: true, technician: "Rajesh Kumar", date: "2026-03-09", values: { reverseCurrent: "14.15 A (135% Isc)", duration: "2 min", result: "No fire/explosion", pmaxAfter: "397.5 W" } },
  { id: "mqt02-f", clause: "MQT 02 / Cl.4.2 (Final)", testName: "Maximum Power at STC – FINAL", pass: true, technician: "Rajesh Kumar", date: "2026-03-10", values: { pmax: "378.3 W", voc: "48.91 V", isc: "10.31 A", ff: "0.750", totalDegradation: "-5.8% (sequential DH+TC path)" } },
]

const IEC_61730_RESULTS = [
  { id: "mst01", clause: "MST 01 / Cl.10.1", testName: "Visual Inspection", pass: true, technician: "Priya Sharma", date: "2026-01-15", values: { construction: "PASS", labels: "PASS", markings: "PASS" } },
  { id: "mst11", clause: "MST 11 / Cl.10.11", testName: "Accessibility Test (IP2X)", pass: true, technician: "Arun Patel", date: "2026-01-16", values: { ip2xResult: "PASS", probeAccess: "None", sysVoltage: "1500V DC class" } },
  { id: "mst12", clause: "MST 12 / Cl.10.12", testName: "Cut Susceptibility", pass: true, technician: "Priya Sharma", date: "2026-01-17", values: { cuts: "10 cuts performed", continuity: "No conduction", integrity: "PASS" } },
  { id: "mst13", clause: "MST 13 / Cl.10.13", testName: "Ground Continuity", pass: true, technician: "Vikram Singh", date: "2026-01-17", values: { resistance: "0.045 Ω (≤0.1 Ω)", testCurrent: "25A × 2s", coverage: "100% frame" } },
  { id: "mst14", clause: "MST 14 / Cl.10.14", testName: "Impulse Voltage (6 kV, 10/700 µs)", pass: true, technician: "Deepa Nair", date: "2026-01-18", values: { impulse: "6000 V peak", waveform: "10/700 µs", flashover: "None", rInsAfter: "85.2 MΩ·m²" } },
  { id: "mst15", clause: "MST 15 / Cl.10.15", testName: "Dielectric Withstand (Hi-Pot 4000V DC)", pass: true, technician: "Priya Sharma", date: "2026-01-18", values: { testVoltage: "4000 V DC", duration: "60 s", leakage: "18.4 µA (≤50 µA)", result: "PASS" } },
  { id: "mst16", clause: "MST 16 / Cl.10.16", testName: "Insulation Resistance", pass: true, technician: "Arun Patel", date: "2026-01-19", values: { rIns: "78.3 MΩ·m²", threshold: "≥40 MΩ·m²" } },
  { id: "mst17", clause: "MST 17 / Cl.10.17", testName: "Wet Leakage Current", pass: true, technician: "Priya Sharma", date: "2026-01-20", values: { leakage: "11.2 µA (≤50 µA)", duration: "4 h", sprayStd: "IEC 62716" } },
  { id: "mst22", clause: "MST 22 / Cl.10.22", testName: "Bypass Diode Functionality", pass: true, technician: "Deepa Nair", date: "2026-01-21", values: { count: "3 diodes", polarity: "Correct", vf: "0.48 V avg", rating: "15A rated" } },
  { id: "mst32", clause: "MST 32 / Cl.10.32", testName: "Temperature Test (1.25×Isc)", pass: true, technician: "Vikram Singh", date: "2026-01-22", values: { loadCurrent: "1.25×Isc=13.1A", maxTemp: "65.4°C (< rated)", hotspots: "None" } },
  { id: "mst51", clause: "MST 51 / Cl.10.51", testName: "Robustness of Terminations", pass: true, technician: "Arun Patel", date: "2026-01-22", values: { pullTest: "275 N (≥250 N)", cycles: "100 mating cycles", ip: "IP67 verified" } },
  { id: "mst52", clause: "MST 52 / Cl.10.52", testName: "Module Breakage & Fire Test", pass: true, technician: "Priya Sharma", date: "2026-01-23", values: { ballDrop: "PASS", fireClass: "Class C", fragments: "All within 2m" } },
]

const IEC_61853_RESULTS = [
  { id: "p1-01", clause: "Part 1 Cl.5", testName: "Power & Energy Rating Matrix (28 points)", pass: true, technician: "Rajesh Kumar", date: "2026-02-05", values: { points: "28 of 28 measured", range: "100–1100 W/m², 15–75°C", uncertainty: "±1.8%", pmax_1000_25: "401.5 W" } },
  { id: "p1-02", clause: "Part 1 Cl.6", testName: "Temperature Coefficients (IEC 61853 protocol)", pass: true, technician: "Arun Patel", date: "2026-02-06", values: { alpha: "+0.052±0.003%/°C", beta: "-0.312±0.008%/°C", gamma: "-0.348±0.010%/°C" } },
  { id: "p1-03", clause: "Part 1 Cl.7", testName: "Angular Response (IAM)", pass: true, technician: "Deepa Nair", date: "2026-02-07", values: { iam_45: "0.985", iam_60: "0.932", iam_75: "0.761", model: "ASHRAE/Martin-Ruiz" } },
  { id: "p2-01", clause: "Part 2 Cl.4", testName: "Spectral Response (EQE/SR)", pass: true, technician: "Vikram Singh", date: "2026-02-08", values: { peakWL: "950 nm", bandgap: "1.12 eV (Si)", eqe_600: "0.952", eqe_800: "0.965" } },
  { id: "p2-02", clause: "Part 2 Cl.5", testName: "NMOT Outdoor Determination", pass: true, technician: "Deepa Nair", date: "2026-02-12", values: { nmot: "44.2 ± 1.5°C", points: "87 valid", r2: "0.983" } },
  { id: "p3-01", clause: "Part 3 Cl.4", testName: "Annual Energy Rating Calculation", pass: true, technician: "Rajesh Kumar", date: "2026-02-14", values: { climate: "TMY3 – New Delhi", annualEnergy: "1842 kWh/kWp", pr: "0.812", specific: "1.842 kWh/Wp/yr" } },
]

const IEC_61701_RESULTS = [
  { id: "61701-mst01", clause: "MST 01 / Cl.7.1", testName: "Visual Inspection (Initial)", pass: true, technician: "Vikram Singh", date: "2026-02-20", values: { condition: "No pre-existing damage", photo: "Documented" } },
  { id: "61701-mst02", clause: "MST 02 / Cl.7.2", testName: "Pmax at STC – Baseline (P₀)", pass: true, technician: "Rajesh Kumar", date: "2026-02-20", values: { pmax0: "401.5 W (baseline P₀)" } },
  { id: "61701-mst03", clause: "MST 03 / Cl.7.3", testName: "Insulation Test – Initial", pass: true, technician: "Priya Sharma", date: "2026-02-21", values: { rIns0: "82.5 MΩ·m²", threshold: "≥40 MΩ·m²" } },
  { id: "61701-mst04", clause: "MST 04 / Cl.7.4", testName: "Salt Mist Exposure – Severity 3 (96 h)", pass: true, technician: "Deepa Nair", date: "2026-03-01", values: { duration: "96 h", temp: "35.2°C", naclConc: "5.0% NaCl", pH: "6.8", deposition: "1.3 mL/h per 80cm²" } },
  { id: "61701-mst05", clause: "MST 05 / Cl.7.5", testName: "Drying & Recovery", pass: true, technician: "Deepa Nair", date: "2026-03-02", values: { duration: "24 h", conditions: "23°C, 68% RH" } },
  { id: "61701-mst06", clause: "MST 06 / Cl.7.6", testName: "Visual Inspection – Post-Salt", pass: true, technician: "Vikram Singh", date: "2026-03-03", values: { corrosion: "Minor frame surface only (non-bridging)", delamination: "None", backsheet: "Intact" } },
  { id: "61701-mst07", clause: "MST 07 / Cl.7.7", testName: "Pmax at STC – Final", pass: true, technician: "Rajesh Kumar", date: "2026-03-04", values: { pmaxFinal: "385.8 W", degradation: "-3.90% vs P₀ (≤5% limit)", result: "PASS" } },
  { id: "61701-mst08", clause: "MST 08 / Cl.7.8", testName: "Insulation Test – Final", pass: true, technician: "Priya Sharma", date: "2026-03-04", values: { rInsFinal: "58.4 MΩ·m²", threshold: "≥40 MΩ·m²", result: "PASS" } },
  { id: "61701-mst09", clause: "MST 09 / Cl.7.9", testName: "EL Imaging – Post-Salt", pass: true, technician: "Priya Sharma", date: "2026-03-05", values: { elResult: "No new cracks vs initial", inactiveAreas: "0" } },
]

// ─── Chart Data ───────────────────────────────────────────────────────────────

const degradationData = [
  { stage: "Initial", pmax: 401.5 }, { stage: "Post UV15", pmax: 399.4 },
  { stage: "Post TC200", pmax: 395.8 }, { stage: "Post HF10", pmax: 393.2 },
  { stage: "Post DH1000", pmax: 382.7 },
]

const ivCurveData = Array.from({ length: 100 }, (_, i) => {
  const v = (i / 99) * 49.28
  const curr = Math.max(0, 10.48 * (1 - Math.exp((v - 49.28) / (1.3 * 0.026 * 60))))
  return { v: parseFloat(v.toFixed(2)), i: parseFloat(curr.toFixed(4)), p: parseFloat((v * curr).toFixed(3)) }
})

const powerMatrixData = [100, 200, 400, 600, 800, 1000, 1100].map(G => ({
  G, T15: parseFloat((401.5 * G / 1000 * (1 + 0.00348 * 10)).toFixed(1)),
  T25: parseFloat((401.5 * G / 1000).toFixed(1)),
  T50: parseFloat((401.5 * G / 1000 * (1 - 0.00348 * 25)).toFixed(1)),
  T75: parseFloat((401.5 * G / 1000 * (1 - 0.00348 * 50)).toFixed(1)),
}))

// ─── Equipment data for Section 3 ────────────────────────────────────────────

const EQUIPMENT_TABLE = [
  { equipment: "Solar Simulator", id: "SS-001 (Sinton 1000)", class: "Class A+A+A (IEC 60904-9 Ed.3)", calDate: "2026-01-10", cert: "CAL-SS-2026-01" },
  { equipment: "Reference Cell", id: "RC-WPVS-01 (c-Si)", class: "Spec: 10×10 mm", calDate: "2026-01-05", cert: "CAL-RC-2026-01" },
  { equipment: "TC Chamber", id: "ESPEC TSE-11-A", class: "-70°C to +180°C, ±1°C", calDate: "2026-01-08", cert: "CAL-CH-2026-02" },
  { equipment: "HF/DH Chamber", id: "Memmert HCP 1080", class: "10–95°C, 10–98%RH, ±1°C/±2%", calDate: "2026-01-08", cert: "CAL-CH-2026-03" },
  { equipment: "EL Camera", id: "Xenics Xeva-FPA-2.5-320", class: "320×256 px, InGaAs", calDate: "2026-01-12", cert: "CAL-EL-2026-01" },
  { equipment: "Insulation Tester", id: "Fluke 1550C MegOhm Meter", class: "1000 V DC, 1 GΩ max", calDate: "2026-01-06", cert: "CAL-IT-2026-01" },
  { equipment: "Hi-Pot Tester", id: "Chroma 19053", class: "0–6 kV DC/AC, 0–10 mA", calDate: "2026-01-06", cert: "CAL-HP-2026-01" },
]

// ─── Section heading helper ───────────────────────────────────────────────────

function SecH({ num, title }: { num: string; title: string }) {
  return (
    <div
      className="font-bold text-blue-900 border-b-2 border-blue-700 pb-1 mb-3 mt-6 uppercase tracking-wide"
      style={{ fontSize: "14pt", lineHeight: "1.2" }}
    >
      {num} {title}
    </div>
  )
}

function SubSecH({ label }: { label: string }) {
  return (
    <div
      className="font-bold text-blue-800 border-b border-blue-200 pb-1 mb-2 mt-3"
      style={{ fontSize: "12pt", lineHeight: "1.2" }}
    >
      {label}
    </div>
  )
}

// ─── Test Result Row ──────────────────────────────────────────────────────────

function TestRow({ r, idx }: { r: any; idx: number }) {
  return (
    <div
      className={`mb-2 ${r.pass ? "border-green-300" : "border-red-300"}`}
      style={{ border: `0.5pt solid ${r.pass ? "#86efac" : "#fca5a5"}`, borderRadius: 0 }}
    >
      <div
        className={`flex items-center justify-between px-3 py-2 text-xs ${r.pass ? "bg-green-50" : "bg-red-50"}`}
        style={{ fontSize: "10pt", padding: "8px 12px" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-5 shrink-0">{idx + 1}.</span>
          {r.pass ? <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />}
          <span className="font-semibold">{r.testName}</span>
          <span className="text-gray-400 hidden sm:inline">{r.clause}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 hidden md:inline">{r.date} · {r.technician}</span>
          <span
            className={`font-bold ${r.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            style={{ padding: "2px 6px", border: `0.5pt solid ${r.pass ? "#16a34a" : "#dc2626"}` }}
          >
            {r.pass ? "PASS" : "FAIL"}
          </span>
        </div>
      </div>
      {Object.keys(r.values).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-0.5" style={{ padding: "8px 12px" }}>
          {Object.entries(r.values).map(([k, v], vi) => (
            <div key={k} className="flex justify-between gap-1" style={{ fontSize: "10pt", background: vi % 2 === 0 ? "#f9f9f9" : "transparent", padding: "2px 4px" }}>
              <span className="font-bold capitalize text-gray-600">{k.replace(/([A-Z])/g, " $1")}</span>
              <span className="font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TRF Section 4 Summary Table Row ─────────────────────────────────────────

function TrfTableRow({ idx, r, std }: { idx: number; r: any; std: string }) {
  const keyVal = Object.values(r.values)[0] || "—"
  const rowBg = idx % 2 === 0 ? "#f9f9f9" : "#ffffff"
  return (
    <tr style={{ background: r.pass ? rowBg : "#fef2f2", fontSize: "10pt" }}>
      <td className="border border-gray-300 text-center text-gray-400" style={{ padding: "8px", borderColor: "#333", borderWidth: "0.5pt" }}>{idx + 1}</td>
      <td className="border font-mono text-gray-500 whitespace-nowrap" style={{ padding: "8px", borderColor: "#333", borderWidth: "0.5pt" }}>{r.clause.split(" /")[0]}</td>
      <td className="border font-semibold" style={{ padding: "8px", borderColor: "#333", borderWidth: "0.5pt" }}>{r.testName}</td>
      <td className="border text-gray-600" style={{ padding: "8px", borderColor: "#333", borderWidth: "0.5pt" }}>{String(keyVal)}</td>
      <td className="border whitespace-nowrap text-gray-500" style={{ padding: "8px", borderColor: "#333", borderWidth: "0.5pt" }}>{r.technician}</td>
      <td className="border font-mono whitespace-nowrap text-gray-500" style={{ padding: "8px", borderColor: "#333", borderWidth: "0.5pt" }}>{r.date}</td>
      <td
        className={`border text-center font-bold ${r.pass ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        style={{ padding: "8px", borderColor: "#333", borderWidth: "0.5pt" }}
      >
        {r.pass ? "PASS" : "FAIL"}
      </td>
    </tr>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IECFullReportView() {
  const [activeStd, setActiveStd] = useState("61215")
  const [showPrintView, setShowPrintView] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("full")
  const [moduleInfo, setModuleInfo] = useState({
    manufacturer: "SolarTech Industries Pvt. Ltd.",
    model: "STI-400M-HJT", serial: "STI2025-041-001",
    power: "400 Wp", dims: "1755×1038×35 mm",
    cellType: "HJT (Heterojunction)", cells: "144 half-cut (6×24)",
    testRef: "TR-2026-0089",
    weight: "22.5 kg",
    safetyClass: "Class II (Double insulated)",
    maxSysVoltage: "1500 V DC",
  })

  const printRef = useRef<HTMLDivElement>(null)
  const lab = DEFAULT_LAB_DETAILS
  const today = "2026-03-10"

  const summaries = {
    "61215": { pass: IEC_61215_RESULTS.filter(r => r.pass).length, total: IEC_61215_RESULTS.length },
    "61730": { pass: IEC_61730_RESULTS.filter(r => r.pass).length, total: IEC_61730_RESULTS.length },
    "61853": { pass: IEC_61853_RESULTS.filter(r => r.pass).length, total: IEC_61853_RESULTS.length },
    "61701": { pass: IEC_61701_RESULTS.filter(r => r.pass).length, total: IEC_61701_RESULTS.length },
  }
  const overallPass = Object.values(summaries).every(s => s.pass === s.total)

  // Template → display configuration
  const templateConfig = useMemo(() => {
    const configs = {
      "61215": { title: "IEC 61215:2021 Design Qualification TRF", standards: ["61215"] },
      "61730": { title: "IEC 61730:2023 Safety Qualification TRF", standards: ["61730"] },
      "combined": { title: "IEC 61215:2021 + IEC 61730:2023 Combined TRF", standards: ["61215", "61730"] },
      "full": { title: "IEC 61215 / IEC 61730 / IEC 61853 / IEC 61701 Multi-Standard TRF", standards: ["61215", "61730", "61853", "61701"] },
      "custom": { title: "Custom Lab Test Report", standards: ["61215", "61730", "61853", "61701"] },
    }
    return configs[selectedTemplate] || configs["full"]
  }, [selectedTemplate])

  const displayStandards = templateConfig.standards

  // Flatten all results for export (standard-tagged)
  const allResultsForExport = useMemo(() => {
    const map = {
      "61215": IEC_61215_RESULTS.map(r => ({ ...r, standard: "IEC 61215:2021" })),
      "61730": IEC_61730_RESULTS.map(r => ({ ...r, standard: "IEC 61730:2023" })),
      "61853": IEC_61853_RESULTS.map(r => ({ ...r, standard: "IEC 61853:2020" })),
      "61701": IEC_61701_RESULTS.map(r => ({ ...r, standard: "IEC 61701:2020" })),
    }
    return displayStandards.flatMap(s => map[s] || [])
  }, [displayStandards])

  const printSummaries = useMemo(() => {
    const s = summaries
    return displayStandards.map(k => ({
      key: k,
      std: { "61215": "IEC 61215:2021", "61730": "IEC 61730:2023", "61853": "IEC 61853:2020", "61701": "IEC 61701:2020" }[k],
      title: { "61215": "Design Qualification & Type Approval", "61730": "Module Safety Qualification", "61853": "Energy Performance & Rating", "61701": "Salt Mist Corrosion (Severity 3 – 96h)" }[k],
      results: { "61215": IEC_61215_RESULTS, "61730": IEC_61730_RESULTS, "61853": IEC_61853_RESULTS, "61701": IEC_61701_RESULTS }[k],
      ...s[k],
    }))
  }, [displayStandards])

  return (
    <div className="space-y-4">
      {/* ─── Config panel ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            IEC Full Compliance Report – {moduleInfo.manufacturer} {moduleInfo.model}
          </CardTitle>
          <CardDescription className="text-xs">IEC 61215:2021 / IEC 61730:2023 / IEC 61853:2020 / IEC 61701:2020 – All MQTs/MSTs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Editable module info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[["Manufacturer", "manufacturer"], ["Model", "model"], ["Serial No.", "serial"], ["Test Ref.", "testRef"]].map(([lbl, key]) => (
              <div key={key} className="space-y-0.5">
                <Label className="text-xs">{lbl}</Label>
                <Input value={(moduleInfo as any)[key]} onChange={e => setModuleInfo(m => ({ ...m, [key]: e.target.value }))} className="h-7 text-xs" />
              </div>
            ))}
          </div>

          {/* Template selector + Export toolbar */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium whitespace-nowrap">Report Template:</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="h-7 text-xs w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full" className="text-xs">Full Multi-Standard (IEC 61215 + 61730 + 61853 + 61701)</SelectItem>
                  <SelectItem value="61215" className="text-xs">IEC 61215:2021 TRF (Design Qualification)</SelectItem>
                  <SelectItem value="61730" className="text-xs">IEC 61730:2023 TRF (Safety Qualification)</SelectItem>
                  <SelectItem value="combined" className="text-xs">Combined IEC 61215 + IEC 61730 TRF</SelectItem>
                  <SelectItem value="custom" className="text-xs">Custom Lab Report Format</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ExportToolbar
              printRef={printRef}
              reportNumber={moduleInfo.testRef}
              reportTitle={templateConfig.title}
              allResults={allResultsForExport}
              isPrintVisible={showPrintView}
              setIsPrintVisible={setShowPrintView}
            />

            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => setShowPrintView(!showPrintView)}
            >
              {showPrintView ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
              {showPrintView ? "Hide" : "Show"} Full Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Compliance overview cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { std: "61215", label: "IEC 61215:2021", desc: "Design Qualification", color: "border-l-blue-500", icon: Sun },
          { std: "61730", label: "IEC 61730:2023", desc: "Safety Qualification", color: "border-l-purple-500", icon: Zap },
          { std: "61853", label: "IEC 61853:2020", desc: "Energy Rating", color: "border-l-green-500", icon: TrendingUp },
          { std: "61701", label: "IEC 61701:2020", desc: "Salt Mist (Sev. 3)", color: "border-l-orange-500", icon: Droplets },
        ].map(({ std, label, desc, color, icon: Icon }) => {
          const s = summaries[std as keyof typeof summaries]
          const allPass = s.pass === s.total
          return (
            <Card key={std} className={`border-l-4 ${color} cursor-pointer ${activeStd === std ? "ring-2 ring-amber-400" : ""}`} onClick={() => setActiveStd(std)}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                <div className="text-xs text-gray-400 mb-2">{desc}</div>
                <div className={`text-xl font-bold ${allPass ? "text-green-600" : "text-red-600"}`}>{allPass ? "PASS" : "FAIL"}</div>
                <div className="text-xs text-gray-400">{s.pass}/{s.total} tests</div>
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-green-400 rounded-full" style={{ width: `${(s.pass / s.total) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ─── Interactive tabbed test results ──────────────────────────────── */}
      <Tabs value={activeStd} onValueChange={setActiveStd}>
        <TabsList className="bg-muted">
          <TabsTrigger value="61215" className="text-xs">IEC 61215 ({summaries["61215"].total} tests)</TabsTrigger>
          <TabsTrigger value="61730" className="text-xs">IEC 61730 ({summaries["61730"].total} tests)</TabsTrigger>
          <TabsTrigger value="61853" className="text-xs">IEC 61853 ({summaries["61853"].total} tests)</TabsTrigger>
          <TabsTrigger value="61701" className="text-xs">IEC 61701 ({summaries["61701"].total} tests)</TabsTrigger>
        </TabsList>

        {/* IEC 61215 */}
        <TabsContent value="61215" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">IEC 61215:2021 – Design Qualification & Type Approval</span>
            <Badge className="bg-green-100 text-green-700 text-xs">ALL PASS ({summaries["61215"].total}/{summaries["61215"].total})</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs">Pmax Degradation Through Test Sequence</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={degradationData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="stage" tick={{ fontSize: 9 }} />
                    <YAxis domain={[370, 410]} tick={{ fontSize: 9 }} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                    <Tooltip />
                    <ReferenceLine y={401.5 * 0.95} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "5% limit", fill: "#ef4444", fontSize: 8 }} />
                    <Area type="monotone" dataKey="pmax" stroke="#2563eb" fill="#dbeafe" fillOpacity={0.5} name="Pmax (W)" dot={{ r: 4, fill: "#2563eb" }} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs">I-V & P-V Curve at STC (Initial)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={ivCurveData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="v" tick={{ fontSize: 9 }} label={{ value: "Voltage (V)", position: "insideBottom", offset: -5, fontSize: 9 }} />
                    <YAxis yAxisId="l" tick={{ fontSize: 9 }} label={{ value: "I (A)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                    <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9 }} label={{ value: "P (W)", angle: 90, position: "insideRight", fontSize: 9 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line yAxisId="l" type="monotone" dataKey="i" stroke="#2563eb" name="I (A)" dot={false} strokeWidth={2} />
                    <Line yAxisId="r" type="monotone" dataKey="p" stroke="#f97316" name="P (W)" dot={false} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {IEC_61215_RESULTS.map((r, i) => <TestRow key={r.id} r={r} idx={i} />)}
        </TabsContent>

        {/* IEC 61730 */}
        <TabsContent value="61730" className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">IEC 61730:2023 – Module Safety Qualification</span>
            <Badge className="bg-green-100 text-green-700 text-xs">ALL PASS</Badge>
          </div>
          {IEC_61730_RESULTS.map((r, i) => <TestRow key={r.id} r={r} idx={i} />)}
        </TabsContent>

        {/* IEC 61853 */}
        <TabsContent value="61853" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">IEC 61853:2020 – Module Energy Performance & Rating</span>
            <Badge className="bg-green-100 text-green-700 text-xs">ALL PASS</Badge>
          </div>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs">Power Matrix (W) – Pmax at Irradiance × Temperature</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="border p-1.5 bg-gray-50 text-left">G (W/m²)</th>
                      {[15, 25, 50, 75].map(T => <th key={T} className="border p-1.5 bg-gray-50 text-center">{T}°C</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {powerMatrixData.map(row => (
                      <tr key={row.G}>
                        <td className="border p-1.5 font-semibold bg-gray-50">{row.G}</td>
                        {["T15", "T25", "T50", "T75"].map((k) => {
                          const pmax = (row as any)[k]
                          const ratio = pmax / 420
                          return (
                            <td key={k} className="border p-1.5 text-center font-mono"
                              style={{ backgroundColor: `rgba(37,99,235,${Math.min(ratio, 1).toFixed(2)})`, color: ratio > 0.5 ? "white" : "inherit" }}>
                              {pmax}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {IEC_61853_RESULTS.map((r, i) => <TestRow key={r.id} r={r} idx={i} />)}
        </TabsContent>

        {/* IEC 61701 */}
        <TabsContent value="61701" className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">IEC 61701:2020 – Salt Mist Corrosion Testing (Severity Class 3 – 96 h)</span>
            <Badge className="bg-green-100 text-green-700 text-xs">ALL PASS</Badge>
          </div>
          {IEC_61701_RESULTS.map((r, i) => <TestRow key={r.id} r={r} idx={i} />)}
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRINT / EXPORT REPORT – IEC TRF FORMAT (ISO 17025 A4 Print-Ready)
          ═══════════════════════════════════════════════════════════════════════ */}
      {showPrintView && (
        <div
          ref={printRef}
          id="iec-print-report"
          className="mt-6 border-4 border-gray-800 bg-white print:border-0"
          style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "0.6875rem", lineHeight: "1.5" }}
        >
          {/* ── SCREEN HEADER – visible on screen, hidden in print (replaced by @page margin box) ── */}
          <div
            className="rpt-screen-hdr flex items-center justify-between bg-blue-50 border-b-2 border-blue-900 px-6"
            style={{ height: "15mm", fontSize: "9pt", borderBottomWidth: "0.5pt", borderBottomColor: "#000" }}
          >
            <span className="font-semibold text-blue-900">{lab.labName}</span>
            <span className="text-gray-600">Doc No: {moduleInfo.testRef} | Rev: 00</span>
            <span className="text-gray-500 text-xs">Page X of Y</span>
          </div>

          {/* ── COVER PAGE (page 1) ──────────────────────────────────────────── */}
          <div style={{ pageBreakAfter: "always", padding: "18mm 20mm 12mm 20mm", textAlign: "center" }}>
            {/* Logo placeholder */}
            <div style={{
              width: "40mm", height: "20mm", border: "2px dashed #bbb",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: "6mm", color: "#aaa", fontSize: "10px", borderRadius: "4px"
            }}>
              [Lab Logo]
            </div>
            <div style={{ fontSize: "18pt", fontWeight: "bold", color: "#1e3a5f", marginBottom: "2mm" }}>
              {lab.labName}
            </div>
            <div style={{ fontSize: "10pt", color: "#666", marginBottom: "1mm" }}>{lab.address}</div>
            <div style={{ fontSize: "9pt", color: "#888", marginBottom: "1mm" }}>
              Accreditation No: <strong>{lab.accreditationNumber}</strong> · {lab.accreditationBody}
            </div>
            <div style={{ height: "1px", background: "#1e3a5f", margin: "7mm 0" }} />
            <div style={{ fontSize: "24pt", fontWeight: "bold", letterSpacing: "5px", color: "#1e3a5f", marginBottom: "3mm", lineHeight: "1.2" }}>
              TEST REPORT
            </div>
            <div style={{ fontSize: "13pt", fontWeight: "600", color: "#444", marginBottom: "4mm" }}>
              PHOTOVOLTAIC MODULE QUALIFICATION
            </div>
            <div style={{ fontSize: "10pt", color: "#1e3a5f", fontStyle: "italic", marginBottom: "5mm" }}>
              {templateConfig.title}
            </div>
            <div style={{ height: "1px", background: "#ddd", margin: "5mm 0" }} />
            {/* Report details table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt", margin: "4mm 0", textAlign: "left" }}>
              <tbody>
                {([
                  ["Report Number", moduleInfo.testRef, "Standard(s)", displayStandards.map(k => ({ "61215": "IEC 61215:2021", "61730": "IEC 61730:2023", "61853": "IEC 61853:2020", "61701": "IEC 61701:2020" }[k])).join(" / ")],
                  ["Date of Issue", today, "Date of Testing", "2026-01-15 to 2026-03-10"],
                  ["Date of Receipt", "2026-01-10", "Date of Report", today],
                  ["Manufacturer", moduleInfo.manufacturer, "Model No.", moduleInfo.model],
                  ["Serial Number", moduleInfo.serial, "Rated Power (Pmax)", moduleInfo.power],
                ] as [string,string,string,string][]).map(([k1, v1, k2, v2]) => (
                  <tr key={k1}>
                    <td style={{ border: "1px solid #ccc", padding: "2mm 3mm", background: "#f5f5f5", fontWeight: "600", width: "22%" }}>{k1}</td>
                    <td style={{ border: "1px solid #ccc", padding: "2mm 3mm", width: "28%" }}>{v1}</td>
                    <td style={{ border: "1px solid #ccc", padding: "2mm 3mm", background: "#f5f5f5", fontWeight: "600", width: "22%" }}>{k2}</td>
                    <td style={{ border: "1px solid #ccc", padding: "2mm 3mm", width: "28%" }}>{v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Overall result */}
            <div style={{ margin: "5mm 0", padding: "4mm 12mm", border: `3px solid ${overallPass ? "#16a34a" : "#dc2626"}`, display: "inline-block", borderRadius: "4px" }}>
              <div style={{ fontSize: "13pt", fontWeight: "bold", color: overallPass ? "#16a34a" : "#dc2626" }}>
                OVERALL RESULT: {overallPass ? "PASS ✓" : "FAIL ✗"}
              </div>
            </div>
            {/* Confidentiality statement */}
            <div style={{ background: "#fef9c3", border: "1px solid #fbbf24", borderRadius: "4px", padding: "4mm 6mm", marginTop: "7mm", fontSize: "8.5pt", textAlign: "left", lineHeight: "1.6" }}>
              <strong>CONFIDENTIAL</strong> — This report is the confidential property of {lab.labName} and is issued solely
              for the purpose of communicating test results to the named client. This report shall not be reproduced except
              in full without the prior written approval of the issuing laboratory. This report relates only to the items
              tested and shall not be interpreted as certification or approval of production.
            </div>
          </div>

          {/* ── TABLE OF CONTENTS (page 2) ───────────────────────────────────── */}
          <div style={{ pageBreakBefore: "always", pageBreakAfter: "always", padding: "15mm 20mm 15mm 20mm" }}>
            <div style={{ fontSize: "15pt", fontWeight: "bold", color: "#1e3a5f", marginBottom: "6mm", borderBottom: "2px solid #1e3a5f", paddingBottom: "3mm", textTransform: "uppercase", letterSpacing: "1px" }}>
              Table of Contents
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5pt" }}>
              <tbody>
                {([
                  ["1.", "General Information", "3", false],
                  ["2.", "Abbreviations & Definitions", "4", false],
                  ["3.", "Product Description", "5", false],
                  ["4.", "Test Equipment & Conditions", "6", false],
                  ["5.", "Test Results Summary", "7", false],
                  ["6.", "Detailed Test Results", "9", false],
                  ["", "6.1  IEC 61215:2021 — Design Qualification (MQT 01–19)", "9", true],
                  ["", "6.2  IEC 61730:2023 — Safety Qualification (MST 01–52)", "12", true],
                  ["", "6.3  IEC 61853:2020 — Energy Performance & Rating", "14", true],
                  ["", "6.4  IEC 61701:2020 — Salt Mist Corrosion (Severity 3)", "15", true],
                  ["", "6.5  Visual Inspection Records", "17", true],
                  ["7.", "Performance Data & Charts", "18", false],
                  ["8.", "Conclusions & Certification Statement", "19", false],
                  ["9.", "Signatories & Authorisation", "20", false],
                  ["", "Annexures", "21", false],
                ] as [string,string,string,boolean][]).map(([num, title, page, isSub], i) => (
                  <tr key={i} style={{ borderBottom: "1px dotted #ddd" }}>
                    <td style={{ padding: "1.5mm 2mm", width: "10mm", fontWeight: "600", color: "#1e3a5f", verticalAlign: "top" }}>{num}</td>
                    <td style={{ padding: "1.5mm 2mm", color: isSub ? "#555" : "#1e3a5f", paddingLeft: isSub ? "8mm" : "2mm" }}>{title}</td>
                    <td style={{ padding: "1.5mm 2mm", textAlign: "right", width: "15mm", color: "#888", fontFamily: "monospace" }}>{page}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── REPORT BODY ──────────────────────────────────────────────────── */}
          <div style={{ padding: "0 20mm 10mm 20mm", fontFamily: "'Times New Roman', Times, serif" }}>

            {/* ── SECTION 1: General Information ──────────────────────────── */}
            <div style={{ pageBreakBefore: "always" }}>
              <SecH num="1." title="General Information" />
              <table className="w-full border-collapse text-xs mb-4">
                <tbody>
                  {[
                    ["Testing Laboratory", lab.labName],
                    ["Address", lab.address],
                    ["Phone / Email", `${lab.phone || "+91-20-1234-5678"} / ${lab.email}`],
                    ["Accreditation Body", lab.accreditationBody],
                    ["Accreditation Number", lab.accreditationNumber],
                    ["Test Report Number", moduleInfo.testRef],
                    ["Issue Date", today],
                    ["Report Version", "1.0"],
                    ["Standard(s) Applied", displayStandards.map(k => ({ "61215": "IEC 61215:2021", "61730": "IEC 61730:2023", "61853": "IEC 61853:2020", "61701": "IEC 61701:2020" }[k])).join("; ")],
                    ["Test Period", "2026-01-15 to 2026-03-10"],
                    ["Test Location", `${lab.labName} – Main Testing Hall`],
                    ["Reference Standard", "ISO/IEC 17025:2017"],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <td className="border border-gray-300 p-1.5 bg-gray-50 font-semibold w-1/3">{k}</td>
                      <td className="border border-gray-300 p-1.5">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── SECTION 2: Abbreviations & Definitions ──────────────────── */}
            <div style={{ pageBreakBefore: "always", pageBreakAfter: "always" }}>
              <SecH num="2." title="Abbreviations & Definitions" />
              <table className="w-full border-collapse text-xs mb-4">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-blue-800 p-1.5 text-left font-semibold w-[15%]">Abbrev.</th>
                    <th className="border border-blue-800 p-1.5 text-left font-semibold">Definition</th>
                    <th className="border border-blue-800 p-1.5 text-left font-semibold w-[15%]">Abbrev.</th>
                    <th className="border border-blue-800 p-1.5 text-left font-semibold">Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {([
                    ["STC", "Standard Test Conditions (1000 W/m², 25°C, AM 1.5G)", "MQT", "Module Quality Test (IEC 61215)"],
                    ["NMOT", "Nominal Module Operating Temperature", "MST", "Module Safety Test (IEC 61730)"],
                    ["Pmax", "Maximum Power Point Power", "EL", "Electroluminescence Imaging"],
                    ["Isc", "Short Circuit Current", "IR", "Infrared Thermography"],
                    ["Voc", "Open Circuit Voltage", "PID", "Potential Induced Degradation"],
                    ["FF", "Fill Factor", "LeTID", "Light and elevated Temperature Induced Degradation"],
                    ["Imp", "Current at Maximum Power Point", "TC", "Thermal Cycling (-40°C to +85°C)"],
                    ["Vmp", "Voltage at Maximum Power Point", "DH", "Damp Heat (85°C / 85% RH)"],
                    ["α (alpha)", "Temperature Coefficient of Isc", "HF", "Humidity-Freeze"],
                    ["β (beta)", "Temperature Coefficient of Voc", "UV", "Ultraviolet Preconditioning"],
                    ["γ (gamma)", "Temperature Coefficient of Pmax", "IAM", "Incidence Angle Modifier"],
                    ["GUM", "Guide to Expression of Uncertainty in Measurement (ISO/IEC 98-3)", "TRF", "Test Report Form"],
                    ["NABL", "National Accreditation Board for Testing & Calibration Laboratories", "IAS", "International Accreditation Service"],
                    ["ISO", "International Organization for Standardization", "IEC", "International Electrotechnical Commission"],
                  ] as [string,string,string,string][]).map(([a1, d1, a2, d2], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="border border-gray-300 p-1.5 font-mono font-bold text-blue-900">{a1}</td>
                      <td className="border border-gray-300 p-1.5">{d1}</td>
                      <td className="border border-gray-300 p-1.5 font-mono font-bold text-blue-900">{a2}</td>
                      <td className="border border-gray-300 p-1.5">{d2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── SECTION 3: Product Description ──────────────────────────── */}
            <div style={{ pageBreakBefore: "always" }}>
              <SecH num="3." title="Product Description (Module Under Test)" />
              <table className="w-full border-collapse text-xs mb-4">
                <tbody>
                  <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-300 p-1.5 font-bold text-gray-700">Module Identification</td></tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50 w-1/4">Manufacturer</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.manufacturer}</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50 w-1/4">Model Number</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.model}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Serial Number</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.serial}</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Cell Technology</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.cellType}</td>
                  </tr>
                  <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-300 p-1.5 font-bold text-gray-700">Electrical Characteristics at STC (1000 W/m², 25°C, AM 1.5G)</td></tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Rated Power (Pmax)</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.power}</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Open Circuit Voltage (Voc)</td>
                    <td className="border border-gray-300 p-1.5">49.28 V</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Short Circuit Current (Isc)</td>
                    <td className="border border-gray-300 p-1.5">10.48 A</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Max Power Voltage (Vmp)</td>
                    <td className="border border-gray-300 p-1.5">40.12 V</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Max Power Current (Imp)</td>
                    <td className="border border-gray-300 p-1.5">10.01 A</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Fill Factor (FF)</td>
                    <td className="border border-gray-300 p-1.5">0.782</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Module Efficiency</td>
                    <td className="border border-gray-300 p-1.5">21.4%</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">NMOT</td>
                    <td className="border border-gray-300 p-1.5">44.2 ± 1.5°C</td>
                  </tr>
                  <tr className="bg-gray-50"><td colSpan={4} className="border border-gray-300 p-1.5 font-bold text-gray-700">Physical Characteristics</td></tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Dimensions (L×W×D)</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.dims}</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Weight</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.weight}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Number of Cells</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.cells}</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Safety Class (IEC 61730)</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.safetyClass}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Max System Voltage</td>
                    <td className="border border-gray-300 p-1.5">{moduleInfo.maxSysVoltage}</td>
                    <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">Temperature Coeff. Pmax (γ)</td>
                    <td className="border border-gray-300 p-1.5">-0.348%/°C</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── SECTION 4: Test Conditions & Equipment ──────────────────── */}
            <div style={{ pageBreakBefore: "always" }}>
              <SecH num="4." title="Test Conditions & Equipment" />
              <div className="text-xs text-gray-500 mb-2">Standard Test Conditions (STC): Irradiance 1000 W/m², Cell temp. 25°C ± 1°C, AM 1.5G (IEC 60904-3)</div>
              <table className="w-full border-collapse text-xs mb-4">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    {["Equipment", "ID / Model", "Class / Range", "Cal. Date", "Cal. Certificate"].map(h => (
                      <th key={h} className="border border-blue-800 p-1.5 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EQUIPMENT_TABLE.map((eq, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""} style={{ pageBreakInside: "avoid" }}>
                      <td className="border border-gray-300 p-1.5 font-semibold">{eq.equipment}</td>
                      <td className="border border-gray-300 p-1.5 font-mono text-gray-600">{eq.id}</td>
                      <td className="border border-gray-300 p-1.5">{eq.class}</td>
                      <td className="border border-gray-300 p-1.5 font-mono">{eq.calDate}</td>
                      <td className="border border-gray-300 p-1.5 font-mono text-gray-500">{eq.cert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── SECTION 5: Test Results Summary ─────────────────────────── */}
            <div style={{ pageBreakBefore: "always" }}>
              <SecH num="5." title="Test Results Summary" />
              {printSummaries.map(({ key, std, title, results, pass, total }) => (
                <div key={key} className="mb-4" style={{ pageBreakInside: "avoid" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-xs">{std}</span>
                    <span className="text-gray-500 text-xs">— {title}</span>
                    <span className={`ml-auto font-bold text-xs px-2 py-0.5 rounded ${pass === total ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {pass === total ? "PASS" : "FAIL"} ({pass}/{total})
                    </span>
                  </div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        {["#", "Test ID / Clause", "Test Name", "Key Value", "Technician", "Date", "Result"].map(h => (
                          <th key={h} className="border border-gray-300 p-1 text-left font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, idx) => <TrfTableRow key={r.id} idx={idx} r={r} std={key} />)}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* ── SECTION 6: Detailed Test Results ────────────────────────── */}
            <div style={{ pageBreakBefore: "always" }}>
              <SecH num="6." title="Detailed Test Results" />
              {printSummaries.map(({ key, std, results }, sIdx) => (
                <div key={key} className="mb-6" style={{ pageBreakBefore: sIdx > 0 ? "always" : "auto" }}>
                  <SubSecH label={`6.${sIdx + 1}  ${std} — Detailed Results`} />
                  {results.map((r, idx) => {
                    const bg = r.pass ? "#f0fdf4" : "#fef2f2"
                    const color = r.pass ? "#16a34a" : "#dc2626"
                    return (
                      <div
                        key={r.id}
                        className="mb-2"
                        style={{
                          border: `0.5pt solid ${r.pass ? "#86efac" : "#fca5a5"}`,
                          borderRadius: 0,
                          pageBreakInside: "avoid",
                        }}
                      >
                        <div
                          className="flex items-center justify-between"
                          style={{ background: bg, padding: "8px", fontSize: "10pt" }}
                        >
                          <span className="font-bold">{idx + 1}. {r.testName}</span>
                          <span className="font-mono text-gray-500">{r.clause}</span>
                          <span className="font-bold ml-2" style={{ color }}>{r.pass ? "✓ PASS" : "✗ FAIL"}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-x-3 gap-y-0.5" style={{ padding: "8px", fontSize: "10pt" }}>
                          {Object.entries(r.values).map(([k, v], vi) => (
                            <div key={k} className="flex flex-col" style={{ background: vi % 2 === 0 ? "#f9f9f9" : "transparent", padding: "2px 4px" }}>
                              <span className="font-bold capitalize text-gray-600">{k.replace(/([A-Z])/g, " $1")}</span>
                              <span className="font-mono">{String(v)}</span>
                            </div>
                          ))}
                          <div className="flex flex-col" style={{ background: "#f9f9f9", padding: "2px 4px" }}>
                            <span className="font-bold text-gray-600">Technician</span>
                            <span>{r.technician}</span>
                          </div>
                          <div className="flex flex-col" style={{ padding: "2px 4px" }}>
                            <span className="font-bold text-gray-600">Test Date</span>
                            <span className="font-mono">{r.date}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* 6.5 Visual Inspection Records */}
              <div style={{ pageBreakBefore: "always" }}>
                <SubSecH label="6.5  Visual Inspection Records" />
                <table className="w-full border-collapse text-xs mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      {["Inspection Point", "Initial (Pre-test)", "Post-Stress (Final)", "Observations"].map(h => (
                        <th key={h} className="border border-gray-300 p-1.5 text-left font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Front Glass Surface", "Clear, no cracks, no delamination", "Clear, no new defects", "—"],
                      ["Rear / Backsheet", "White, intact, no discoloration", "Intact, slight UV yellowing at edges", "Within acceptance"],
                      ["Frame & Edges", "No burrs, all corners sealed", "No corrosion, seals intact", "—"],
                      ["Junction Box & Connectors", "IP67, sealed, no moisture", "IP67, sealed, no moisture", "—"],
                      ["Cells & Bus Bars", "No visible cracks, uniform colour", "No new cracks detected (EL confirmed)", "EL imaging performed"],
                      ["Markings & Labels", "Legible, per IEC 61730 Cl.5", "All labels intact and legible", "—"],
                    ].map(([point, initial, post, obs]) => (
                      <tr key={point} style={{ pageBreakInside: "avoid" }}>
                        <td className="border border-gray-300 p-1.5 font-semibold bg-gray-50">{point}</td>
                        <td className="border border-gray-300 p-1.5 text-green-700">{initial}</td>
                        <td className="border border-gray-300 p-1.5 text-green-700">{post}</td>
                        <td className="border border-gray-300 p-1.5 text-gray-500 italic">{obs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── SECTION 7: Performance Data & Charts ────────────────────── */}
            {displayStandards.includes("61215") && (
              <div style={{ pageBreakBefore: "always" }}>
                <SecH num="7." title="Performance Data & Charts" />
                {/* Two charts side-by-side using ResponsiveContainer for A4 fit */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="print-chart-col">
                    <div className="text-xs font-semibold mb-1 text-gray-600">Fig. 7.1 — Pmax Degradation Through IEC 61215 Test Sequence</div>
                    <div style={{ height: "55mm", overflow: "hidden" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={degradationData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="stage" tick={{ fontSize: 8 }} />
                          <YAxis domain={[370, 410]} tick={{ fontSize: 8 }} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 8 }} />
                          <Tooltip />
                          <ReferenceLine y={401.5 * 0.95} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "5% limit", fill: "#ef4444", fontSize: 7 }} />
                          <Area type="monotone" dataKey="pmax" stroke="#2563eb" fill="#dbeafe" fillOpacity={0.5} name="Pmax (W)" dot={{ r: 3, fill: "#2563eb" }} strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="print-chart-col">
                    <div className="text-xs font-semibold mb-1 text-gray-600">Fig. 7.2 — I-V & P-V Characteristics at STC (Initial)</div>
                    <div style={{ height: "55mm", overflow: "hidden" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={ivCurveData.filter((_, i) => i % 5 === 0)}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="v" tick={{ fontSize: 8 }} label={{ value: "V (V)", position: "insideBottom", offset: -5, fontSize: 8 }} />
                          <YAxis yAxisId="l" tick={{ fontSize: 8 }} label={{ value: "I (A)", angle: -90, position: "insideLeft", fontSize: 8 }} />
                          <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 8 }} label={{ value: "P (W)", angle: 90, position: "insideRight", fontSize: 8 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 9 }} />
                          <Line yAxisId="l" type="monotone" dataKey="i" stroke="#2563eb" name="I (A)" dot={false} strokeWidth={2} />
                          <Line yAxisId="r" type="monotone" dataKey="p" stroke="#f97316" name="P (W)" dot={false} strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <table className="w-full border-collapse text-xs mb-4" style={{ pageBreakInside: "avoid" }}>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-1.5 text-left">Test Stage</th>
                      <th className="border border-gray-300 p-1.5 text-center">Pmax (W)</th>
                      <th className="border border-gray-300 p-1.5 text-center">Degradation (%)</th>
                      <th className="border border-gray-300 p-1.5 text-center">Limit</th>
                      <th className="border border-gray-300 p-1.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {degradationData.map((d, i) => {
                      const deg = i === 0 ? 0 : ((d.pmax - 401.5) / 401.5 * 100)
                      return (
                        <tr key={d.stage}>
                          <td className="border border-gray-300 p-1.5 font-medium">{d.stage}</td>
                          <td className="border border-gray-300 p-1.5 text-center font-mono">{d.pmax}</td>
                          <td className="border border-gray-300 p-1.5 text-center font-mono">{i === 0 ? "—" : deg.toFixed(2) + "%"}</td>
                          <td className="border border-gray-300 p-1.5 text-center text-gray-400">≤ 5%</td>
                          <td className={`border border-gray-300 p-1.5 text-center font-bold ${Math.abs(deg) <= 5 ? "text-green-700" : "text-red-700"}`}>
                            {i === 0 ? "BASELINE" : Math.abs(deg) <= 5 ? "PASS" : "FAIL"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── SECTION 8: Conclusions & Certification Statement ─────────── */}
            <div style={{ pageBreakBefore: "always" }}>
              <SecH num="8." title="Conclusions & Certification Statement" />
              <div className="border border-gray-300 rounded p-4 mb-4 bg-gray-50 text-xs">
                <p className="mb-2">
                  The photovoltaic module identified in Section 3 of this report has been tested in accordance with the requirements of{" "}
                  <strong>{templateConfig.title}</strong> at the testing laboratory identified in Section 1.
                </p>
                <p className="mb-2">
                  Based on the test results documented in this report, the module under test has{" "}
                  <strong className={overallPass ? "text-green-700" : "text-red-700"}>
                    {overallPass ? "PASSED" : "FAILED"}
                  </strong>{" "}
                  all applicable test requirements. A total of{" "}
                  <strong>{allResultsForExport.filter(r => r.pass).length}</strong> of{" "}
                  <strong>{allResultsForExport.length}</strong> tests passed.
                </p>
                <p className="mb-2">
                  All measurements were performed using calibrated equipment as listed in Section 4 with valid traceability
                  to national/international standards. Measurement uncertainty is evaluated per GUM (ISO/IEC Guide 98-3)
                  and was found to be within acceptable limits for all measurements performed.
                </p>
                <p className="text-gray-500 italic">
                  Note: This test report relates only to the sample(s) tested and shall not be construed as certification
                  or approval of production. Results apply exclusively to the item(s) submitted for test.
                </p>
              </div>
            </div>

            {/* ── SECTION 9: Signatories ───────────────────────────────────── */}
            <div style={{ pageBreakBefore: "always" }}>
              <SecH num="9." title="Signatories & Authorisation" />
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { role: "Prepared By", name: "Dr. Rajesh Kumar", designation: "Senior Test Engineer", date: today },
                  { role: "Reviewed By", name: "Dr. Priya Sharma", designation: "Technical Manager", date: today },
                  { role: "Approved By", name: "Dr. Arun Patel", designation: "Laboratory Manager", date: today },
                ].map(({ role, name, designation, date }) => (
                  <div key={role} className="border border-gray-300 rounded p-3">
                    <div className="font-bold text-xs text-gray-600 mb-3">{role}</div>
                    <div className="h-12 border-b border-dashed border-gray-400 mb-2" />
                    <div className="font-semibold text-xs">{name}</div>
                    <div className="text-xs text-gray-500">{designation}</div>
                    <div className="text-xs text-gray-400 mt-1">Date: {date}</div>
                  </div>
                ))}
              </div>
              {/* Report footer disclaimer */}
              <div className="border-t border-gray-200 pt-3 text-center text-xs text-gray-400">
                <p>This report is issued under accreditation <strong>{lab.accreditationNumber}</strong> of{" "}
                  <strong>{lab.accreditationBody}</strong>.</p>
                <p>This report shall not be reproduced except in full without the written permission of the laboratory.</p>
                <p className="mt-1">ISO/IEC 17025:2017 Compliant Test Report · {lab.labName} · {lab.email}</p>
                <p className="mt-1 font-mono">{moduleInfo.testRef} · v1.0 · {today}</p>
              </div>
            </div>

          </div>{/* end report body */}

          {/* ── SCREEN FOOTER – visible on screen, hidden in print (replaced by @page margin box) ── */}
          <div
            className="rpt-screen-ftr flex items-center justify-between border-t bg-gray-50 px-6"
            style={{ height: "12mm", fontSize: "9pt", borderTopWidth: "0.5pt", borderTopColor: "#000" }}
          >
            <span className="text-gray-500">Issue Date: {today}</span>
            <span className="text-gray-400 text-center text-xs" style={{ maxWidth: "60%" }}>
              This report shall not be reproduced except in full without written approval of SolarLabX Testing Laboratory
            </span>
            <span className="font-semibold text-gray-600">CONFIDENTIAL</span>
          </div>

        </div>
      )}

      <style>{`
        /* ─── A4 Print: @page margin boxes (Chrome/Edge) ──────────────────── */
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 15mm 20mm 15mm;
            @top-left {
              content: "SolarLabX Testing Laboratory";
              font-size: 9pt;
              font-family: 'Times New Roman', serif;
              color: #1e3a5f;
              font-weight: bold;
              border-bottom: 0.5pt solid #000;
              padding-bottom: 2mm;
            }
            @top-center {
              content: "Doc No: ${moduleInfo.testRef} | Rev: 00";
              font-size: 9pt;
              font-family: 'Times New Roman', serif;
              color: #333;
              border-bottom: 0.5pt solid #000;
              padding-bottom: 2mm;
            }
            @top-right {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 9pt;
              font-family: 'Times New Roman', serif;
              color: #333;
              border-bottom: 0.5pt solid #000;
              padding-bottom: 2mm;
            }
            @bottom-left {
              content: "Issue Date: ${today}";
              font-size: 9pt;
              font-family: 'Times New Roman', serif;
              color: #555;
              border-top: 0.5pt solid #000;
              padding-top: 2mm;
            }
            @bottom-center {
              content: "This report shall not be reproduced except in full without written approval of SolarLabX Testing Laboratory";
              font-size: 7pt;
              font-family: 'Times New Roman', serif;
              color: #666;
              border-top: 0.5pt solid #000;
              padding-top: 2mm;
            }
            @bottom-right {
              content: "CONFIDENTIAL";
              font-size: 9pt;
              font-family: 'Times New Roman', serif;
              color: #333;
              font-weight: bold;
              border-top: 0.5pt solid #000;
              padding-top: 2mm;
            }
          }
          /* Cover page (first): larger margins, no running header/footer */
          @page :first {
            margin: 30mm 30mm 30mm 30mm;
            @top-left { content: none; } @top-center { content: none; } @top-right { content: none; }
            @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; }
          }

          /* Hide all UI chrome; only the report renders */
          body > * { display: none !important; }
          #iec-print-report { display: block !important; margin: 0 !important; padding: 0 !important; border: none !important; }

          /* Hide screen header/footer bands in print */
          .rpt-screen-hdr, .rpt-screen-ftr { display: none !important; }

          /* Body font for print */
          #iec-print-report {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
            color: #000 !important;
          }

          /* Table text: 10pt */
          #iec-print-report table {
            max-width: 170mm;
            word-break: break-word;
            font-size: 10pt;
          }
          #iec-print-report td, #iec-print-report th {
            overflow-wrap: break-word;
            word-break: break-word;
            padding: 8px;
            border: 0.5pt solid #333;
          }
          #iec-print-report tr { page-break-inside: avoid; break-inside: avoid; }
          #iec-print-report tr:nth-child(even) { background: #f9f9f9; }

          /* Remove rounded corners for print */
          #iec-print-report [style*="border-radius"] { border-radius: 0 !important; }
          #iec-print-report .rounded, #iec-print-report .rounded-md, #iec-print-report .rounded-lg { border-radius: 0 !important; }

          /* Charts: clamp to column width */
          .print-chart-col { overflow: hidden; max-width: 79mm; }
          .print-chart-col .recharts-wrapper,
          .print-chart-col .recharts-surface { max-width: 100% !important; width: 100% !important; }
        }

        /* Screen: show header/footer bands */
        @media screen {
          .rpt-screen-hdr, .rpt-screen-ftr { display: flex; }
        }
      `}</style>
    </div>
  )
}
