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
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart, Area, Cell
} from "recharts"
import { CheckCircle, XCircle, Printer, FileText, Sun, Zap, Droplets, TrendingUp } from "lucide-react"
import { DEFAULT_LAB_DETAILS } from "@/lib/report-test-definitions"

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

// ─── Result Row ───────────────────────────────────────────────────────────────

function TestRow({ r, idx }: { r: any; idx: number }) {
  return (
    <div className={`border rounded mb-2 ${r.pass ? "border-green-200" : "border-red-200"}`}>
      <div className={`flex items-center justify-between px-3 py-2 text-xs ${r.pass ? "bg-green-50" : "bg-red-50"}`}>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-5 shrink-0">{idx + 1}.</span>
          {r.pass ? <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />}
          <span className="font-semibold">{r.testName}</span>
          <span className="text-gray-400 hidden sm:inline">{r.clause}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 hidden md:inline">{r.date} · {r.technician}</span>
          <span className={`px-1.5 py-0.5 rounded font-bold ${r.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {r.pass ? "PASS" : "FAIL"}
          </span>
        </div>
      </div>
      {Object.keys(r.values).length > 0 && (
        <div className="px-3 py-2 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-0.5">
          {Object.entries(r.values).map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs gap-1">
              <span className="text-gray-400 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
              <span className="font-mono font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function IECFullReportView() {
  const [activeStd, setActiveStd] = useState("61215")
  const [showPrintView, setShowPrintView] = useState(false)
  const [moduleInfo, setModuleInfo] = useState({
    manufacturer: "SolarTech Industries Pvt. Ltd.",
    model: "STI-400M-HJT", serial: "STI2025-041-001",
    power: "400 Wp", dims: "1755×1038×35 mm",
    cellType: "HJT (Heterojunction)", cells: "144 half-cut (6×24)",
    testRef: "TR-2026-0089",
  })

  const lab = DEFAULT_LAB_DETAILS
  const today = "2026-03-10"

  const summaries = {
    "61215": { pass: IEC_61215_RESULTS.filter(r => r.pass).length, total: IEC_61215_RESULTS.length },
    "61730": { pass: IEC_61730_RESULTS.filter(r => r.pass).length, total: IEC_61730_RESULTS.length },
    "61853": { pass: IEC_61853_RESULTS.filter(r => r.pass).length, total: IEC_61853_RESULTS.length },
    "61701": { pass: IEC_61701_RESULTS.filter(r => r.pass).length, total: IEC_61701_RESULTS.length },
  }
  const overallPass = Object.values(summaries).every(s => s.pass === s.total)

  return (
    <div className="space-y-4">
      {/* Config panel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            IEC Full Compliance Report – {moduleInfo.manufacturer} {moduleInfo.model}
          </CardTitle>
          <CardDescription className="text-xs">IEC 61215:2021 / IEC 61730:2023 / IEC 61853:2020 / IEC 61701:2020 – All MQTs/MSTs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {[["Manufacturer", "manufacturer"], ["Model", "model"], ["Serial No.", "serial"], ["Test Ref.", "testRef"]].map(([lbl, key]) => (
              <div key={key} className="space-y-0.5">
                <Label className="text-xs">{lbl}</Label>
                <Input value={(moduleInfo as any)[key]} onChange={e => setModuleInfo(m => ({ ...m, [key]: e.target.value }))} className="h-7 text-xs" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => window.print()}>
              <Printer className="h-3 w-3 mr-1" /> Print / Save as PDF
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowPrintView(!showPrintView)}>
              {showPrintView ? "Hide" : "Show"} Full Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance overview */}
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

      {/* Tabbed test results */}
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
                        {["T15", "T25", "T50", "T75"].map((k, ti) => {
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

      {/* ═══ PRINT-READY REPORT ═══════════════════════════════════════ */}
      {showPrintView && (
        <div className="mt-6 border-4 border-gray-800 p-6 print:border-0" id="iec-print-report">
          {/* Cover */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <div className="text-xl font-bold">{lab.labName}</div>
            <div className="text-sm text-gray-500">{lab.accreditationBody}</div>
            <div className="text-xs text-gray-400">Accreditation No: {lab.accreditationNumber} | {lab.address}</div>
            <div className="mt-4 text-2xl font-bold text-blue-900">PHOTOVOLTAIC MODULE TEST REPORT</div>
            <div className="text-base font-semibold text-gray-700 mt-1">
              IEC 61215:2021 / IEC 61730:2023 / IEC 61853:2020 / IEC 61701:2020
            </div>
          </div>

          {/* Module + Report info */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div>
              <div className="font-bold text-gray-600 uppercase text-xs mb-2">Module Under Test</div>
              {[["Manufacturer", moduleInfo.manufacturer], ["Model", moduleInfo.model], ["Serial No.", moduleInfo.serial], ["Rated Power", moduleInfo.power], ["Dimensions", moduleInfo.dims], ["Cell Technology", moduleInfo.cellType]].map(([k, v]) => (
                <div key={k} className="flex gap-2 mb-0.5"><span className="text-gray-400 w-28 shrink-0">{k}:</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
            <div>
              <div className="font-bold text-gray-600 uppercase text-xs mb-2">Report Details</div>
              {[["Report No.", moduleInfo.testRef], ["Report Date", today], ["Test Period", "2026-01-15 to 2026-03-10"], ["Prepared By", "Dr. Rajesh Kumar"], ["Reviewed By", "Dr. Priya Sharma"], ["Overall Result", overallPass ? "PASS" : "FAIL"]].map(([k, v]) => (
                <div key={k} className="flex gap-2 mb-0.5">
                  <span className="text-gray-400 w-28 shrink-0">{k}:</span>
                  <span className={`font-medium ${k === "Overall Result" ? (overallPass ? "text-green-700 font-bold" : "text-red-700 font-bold") : ""}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Summary Table */}
          <div className="mb-6">
            <div className="text-sm font-bold border-b border-gray-300 pb-1 mb-2">COMPLIANCE SUMMARY</div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {["Standard", "Title", "Tests", "Pass", "Fail", "Result"].map(h => (
                    <th key={h} className="border border-gray-300 p-1.5 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { std: "IEC 61215:2021", title: "Design Qualification & Type Approval", key: "61215" },
                  { std: "IEC 61730:2023", title: "Module Safety Qualification", key: "61730" },
                  { std: "IEC 61853:2020", title: "Energy Performance & Rating", key: "61853" },
                  { std: "IEC 61701:2020", title: "Salt Mist Corrosion (Severity 3 – 96h)", key: "61701" },
                ].map(({ std, title, key }) => {
                  const s = summaries[key as keyof typeof summaries]
                  return (
                    <tr key={std}>
                      <td className="border border-gray-300 p-1.5 font-semibold">{std}</td>
                      <td className="border border-gray-300 p-1.5 text-gray-600">{title}</td>
                      <td className="border border-gray-300 p-1.5 text-center">{s.total}</td>
                      <td className="border border-gray-300 p-1.5 text-center text-green-700 font-bold">{s.pass}</td>
                      <td className="border border-gray-300 p-1.5 text-center text-red-700">{s.total - s.pass || "–"}</td>
                      <td className={`border border-gray-300 p-1.5 text-center font-bold ${s.pass === s.total ? "text-green-700" : "text-red-700"}`}>{s.pass === s.total ? "PASS" : "FAIL"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Detailed results tables per standard */}
          {[
            { label: "IEC 61215:2021 – Design Qualification Test Results", results: IEC_61215_RESULTS, color: "text-blue-900 border-blue-400" },
            { label: "IEC 61730:2023 – Safety Qualification Test Results", results: IEC_61730_RESULTS, color: "text-purple-900 border-purple-400" },
            { label: "IEC 61853:2020 – Energy Performance Test Results", results: IEC_61853_RESULTS, color: "text-green-900 border-green-400" },
            { label: "IEC 61701:2020 – Salt Mist Corrosion Test Results", results: IEC_61701_RESULTS, color: "text-orange-900 border-orange-400" },
          ].map(({ label, results, color }) => (
            <div key={label} className="mb-6">
              <div className={`text-sm font-bold border-b-2 pb-1 mb-2 ${color}`}>{label}</div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    {["#", "Clause", "Test Name", "Key Values", "Technician", "Date", "Result"].map(h => (
                      <th key={h} className="border border-gray-300 p-1.5 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr key={r.id} className={r.pass ? "" : "bg-red-50"}>
                      <td className="border border-gray-300 p-1.5 text-gray-400">{idx + 1}</td>
                      <td className="border border-gray-300 p-1.5 font-mono text-gray-500 whitespace-nowrap">{r.clause.split(" /")[0]}</td>
                      <td className="border border-gray-300 p-1.5 font-medium">{r.testName}</td>
                      <td className="border border-gray-300 p-1.5 text-gray-600">
                        {Object.entries(r.values).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join("; ")}
                      </td>
                      <td className="border border-gray-300 p-1.5 whitespace-nowrap">{r.technician}</td>
                      <td className="border border-gray-300 p-1.5 font-mono whitespace-nowrap">{r.date}</td>
                      <td className={`border border-gray-300 p-1.5 text-center font-bold ${r.pass ? "text-green-700" : "text-red-700"}`}>
                        {r.pass ? "PASS" : "FAIL"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Signature Block */}
          <div className="mt-8 pt-4 border-t-2 border-gray-300">
            <div className="text-sm font-bold mb-4">AUTHORISATION & SIGNATURES</div>
            <div className="grid grid-cols-3 gap-6 text-xs">
              {[
                { role: "Prepared By", name: "Dr. Rajesh Kumar", designation: "Senior Test Engineer" },
                { role: "Reviewed By", name: "Dr. Priya Sharma", designation: "Technical Manager" },
                { role: "Approved By", name: "Dr. Arun Patel", designation: "Laboratory Manager" },
              ].map(({ role, name, designation }) => (
                <div key={role} className="border rounded p-3">
                  <div className="font-bold text-gray-600 mb-2">{role}</div>
                  <div className="h-10 border-b border-gray-300 mb-2" />
                  <div className="font-medium">{name}</div>
                  <div className="text-gray-400">{designation}</div>
                  <div className="text-gray-400 mt-1">Date: {today}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500">
              <strong>DISCLAIMER:</strong> This report is issued under accreditation {lab.accreditationNumber} of {lab.accreditationBody}.
              Results apply only to the sample(s) tested. Not to be reproduced except in full without laboratory written approval.
              Testing conducted in accordance with ISO/IEC 17025:2017. Contact: {lab.email}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body > *:not(#iec-print-report) { display: none !important; }
          #iec-print-report { display: block !important; border: none !important; }
        }
      `}</style>
    </div>
  )
}
