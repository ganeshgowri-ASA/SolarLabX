// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"
import { Droplets, Thermometer, Clock, TrendingDown, CheckCircle, XCircle, AlertTriangle, Waves } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PmaxPoint {
  label: string
  hours: number
  M1: number
  M2: number
  M3: number
  M4: number
  M5: number
  M6: number
}

interface ModuleResult {
  id: string
  severityLevel: number
  exposureHours: number
  initialPmax: number
  pmax96: number
  pmax192: number
  pmax288: number
  pmax384: number
  pmax480: number
  pmax576: number
  finalDegradationPct: number
  corrosionGrade: number
  visualDefects: string
  pass: boolean
}

// ─── Demo Data ─────────────────────────────────────────────────────────────────

// Pmax retention (%) at 0, 96, 192, 288, 384, 480, 576h
// 6 modules tested at severity level 6 (most severe) — NaCl 5% / 35°C cyclic
const PMAX_DATA: PmaxPoint[] = [
  { label: "0h",   hours: 0,   M1: 100.0, M2: 100.0, M3: 100.0, M4: 100.0, M5: 100.0, M6: 100.0 },
  { label: "96h",  hours: 96,  M1: 99.5,  M2: 99.1,  M3: 98.7,  M4: 99.7,  M5: 98.4,  M6: 99.3  },
  { label: "192h", hours: 192, M1: 98.8,  M2: 98.0,  M3: 97.2,  M4: 99.3,  M5: 96.5,  M6: 98.6  },
  { label: "288h", hours: 288, M1: 98.2,  M2: 97.1,  M3: 95.9,  M4: 98.9,  M5: 94.2,  M6: 97.8  },
  { label: "384h", hours: 384, M1: 97.6,  M2: 96.2,  M3: 94.5,  M4: 98.6,  M5: 92.0,  M6: 97.2  },
  { label: "480h", hours: 480, M1: 97.1,  M2: 95.5,  M3: 93.3,  M4: 98.3,  M5: 89.8,  M6: 96.7  },
  { label: "576h", hours: 576, M1: 96.6,  M2: 94.8,  M3: 92.1,  M4: 98.0,  M5: 87.6,  M6: 96.2  },
]

// Module final results for bar chart and table
const MODULE_RESULTS: ModuleResult[] = [
  {
    id: "SM-MOD-001",
    severityLevel: 6,
    exposureHours: 576,
    initialPmax: 400.0,
    pmax96: 398.0,
    pmax192: 395.2,
    pmax288: 392.8,
    pmax384: 390.4,
    pmax480: 388.4,
    pmax576: 386.4,
    finalDegradationPct: 3.4,
    corrosionGrade: 1,
    visualDefects: "Minor frame edge oxidation",
    pass: true,
  },
  {
    id: "SM-MOD-002",
    severityLevel: 6,
    exposureHours: 576,
    initialPmax: 400.0,
    pmax96: 396.4,
    pmax192: 392.0,
    pmax288: 388.4,
    pmax384: 384.8,
    pmax480: 382.0,
    pmax576: 379.2,
    finalDegradationPct: 5.2,
    corrosionGrade: 2,
    visualDefects: "Pitting on aluminum frame, busbar tarnish",
    pass: false,
  },
  {
    id: "SM-MOD-003",
    severityLevel: 6,
    exposureHours: 576,
    initialPmax: 400.0,
    pmax96: 394.8,
    pmax192: 388.8,
    pmax288: 383.6,
    pmax384: 378.0,
    pmax480: 373.2,
    pmax576: 368.4,
    finalDegradationPct: 7.9,
    corrosionGrade: 3,
    visualDefects: "Severe frame corrosion, corroded junction box contacts",
    pass: false,
  },
  {
    id: "SM-MOD-004",
    severityLevel: 6,
    exposureHours: 576,
    initialPmax: 400.0,
    pmax96: 398.8,
    pmax192: 397.2,
    pmax288: 395.6,
    pmax384: 394.4,
    pmax480: 393.2,
    pmax576: 392.0,
    finalDegradationPct: 2.0,
    corrosionGrade: 1,
    visualDefects: "Trace white deposits on frame corner",
    pass: true,
  },
  {
    id: "SM-MOD-005",
    severityLevel: 6,
    exposureHours: 576,
    initialPmax: 400.0,
    pmax96: 393.6,
    pmax192: 386.0,
    pmax288: 376.8,
    pmax384: 368.0,
    pmax480: 359.2,
    pmax576: 350.4,
    finalDegradationPct: 12.4,
    corrosionGrade: 4,
    visualDefects: "Extensive corrosion, encapsulant delamination, ribbon corrosion",
    pass: false,
  },
  {
    id: "SM-MOD-006",
    severityLevel: 6,
    exposureHours: 576,
    initialPmax: 400.0,
    pmax96: 397.2,
    pmax192: 394.4,
    pmax288: 391.2,
    pmax384: 388.8,
    pmax480: 386.8,
    pmax576: 384.8,
    finalDegradationPct: 3.8,
    corrosionGrade: 1,
    visualDefects: "Minor discoloration at ribbon exit points",
    pass: true,
  },
]

// Bar chart data: corrosion grade per module at final inspection
const CORROSION_BAR_DATA = MODULE_RESULTS.map((m) => ({
  module: m.id.replace("SM-", ""),
  corrosionGrade: m.corrosionGrade,
  fill: m.corrosionGrade <= 1 ? "#22c55e" : m.corrosionGrade === 2 ? "#f59e0b" : "#ef4444",
}))

// ─── Constants ─────────────────────────────────────────────────────────────────

const MODULE_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e", "#a855f7", "#06b6d4"]

const CORROSION_GRADE_LABELS: Record<number, string> = {
  0: "None",
  1: "Trace",
  2: "Mild",
  3: "Moderate",
  4: "Severe",
  5: "Very Severe",
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

const PmaxTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border rounded shadow-md p-2 text-xs space-y-1">
      <div className="font-semibold text-gray-700">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(1)}%
        </div>
      ))}
      <div className="text-gray-400 pt-0.5 border-t">5% limit: 95.0%</div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SaltMistTab() {
  const passCount = useMemo(() => MODULE_RESULTS.filter((m) => m.pass).length, [])

  const maxDegradation = useMemo(
    () => Math.max(...MODULE_RESULTS.map((m) => m.finalDegradationPct)),
    []
  )

  const avgDegradation = useMemo(
    () =>
      parseFloat(
        (MODULE_RESULTS.reduce((s, m) => s + m.finalDegradationPct, 0) / MODULE_RESULTS.length).toFixed(1)
      ),
    []
  )

  const exportConfig = {
    filename: "SaltMistCorrosion_IEC61701",
    title: "Salt Mist Corrosion Test – IEC 61701 (Severity Level 6 / NaCl 5% / 35°C / 576h cyclic)",
    headers: [
      "Module ID",
      "Severity Level",
      "Exposure Hours",
      "Initial Pmax (W)",
      "Pmax @96h (W)",
      "Pmax @192h (W)",
      "Pmax @288h (W)",
      "Pmax @384h (W)",
      "Pmax @480h (W)",
      "Pmax @576h (W)",
      "Degradation (%)",
      "Corrosion Grade",
      "Visual Defects",
      "Result",
    ],
    rows: MODULE_RESULTS.map((m) => [
      m.id,
      String(m.severityLevel),
      String(m.exposureHours),
      m.initialPmax.toFixed(1),
      m.pmax96.toFixed(1),
      m.pmax192.toFixed(1),
      m.pmax288.toFixed(1),
      m.pmax384.toFixed(1),
      m.pmax480.toFixed(1),
      m.pmax576.toFixed(1),
      m.finalDegradationPct.toFixed(1),
      `${m.corrosionGrade} — ${CORROSION_GRADE_LABELS[m.corrosionGrade]}`,
      m.visualDefects,
      m.pass ? "PASS" : "FAIL",
    ]),
  }

  return (
    <div className="space-y-4">
      {/* IEC Standard Card */}
      <IECStandardCard
        standard="IEC 61701"
        title="Salt mist corrosion testing of photovoltaic (PV) modules"
        testConditions={[
          "NaCl solution concentration: 5% w/v (±1%) in distilled or deionised water",
          "Chamber temperature: 35°C ± 2°C during salt mist exposure",
          "Cyclic exposure: alternating salt mist spray and drying/recovery phases",
          "Severity levels 1–6 as defined in IEC 61701 §5 (Level 6 is most severe)",
          "Level 6 duration: 576 hours total (multiple spray cycles per IEC 61701 Table 1)",
          "I-V curve measurement at STC per IEC 60904-1 at defined intervals",
          "Visual inspection and wet insulation resistance test before and after exposure",
        ]}
        dosageLevels={[
          "Severity Level 1: 1 cycle (96h) — least severe",
          "Severity Level 2: 2 cycles (192h)",
          "Severity Level 3: 3 cycles (288h)",
          "Severity Level 4: 4 cycles (384h)",
          "Severity Level 5: 5 cycles (480h)",
          "Severity Level 6: 6 cycles (576h) — most severe, simulates marine/coastal environments",
          "Intermediate Pmax measurements at 0, 96, 192, 288, 384, 480, 576h",
        ]}
        passCriteria={[
          { parameter: "ΔPmax", requirement: "≤ 5% after full exposure sequence", note: "At STC per IEC 60904-1" },
          { parameter: "Visual inspection", requirement: "No major visual defects or delamination", note: "Per IEC 61701 §7.1" },
          { parameter: "Wet insulation resistance", requirement: "≥ 40 MΩ·m²", note: "Post-exposure wet insulation test" },
          { parameter: "No structural failure", requirement: "No cracking, breakage, or open circuit", note: "IEC 61701 §7.3" },
        ]}
        failCriteria={[
          { parameter: "ΔPmax", requirement: "> 5% Pmax degradation at end of exposure" },
          { parameter: "Visual", requirement: "Corrosion of contacts, frame, ribbon, or connectors compromising function" },
          { parameter: "Insulation", requirement: "Wet insulation resistance below 40 MΩ threshold" },
          { parameter: "Structural", requirement: "Encapsulant delamination, cell cracking, or electrical failure" },
        ]}
        notes={[
          "IEC 61701 is critical for PV modules deployed in coastal, marine, or high-humidity salt-laden environments",
          "NaCl solution replicates sea-spray aerosol; cyclic exposure alternates deposition and drying to simulate tidal/wind patterns",
          "Severity Level 6 is typically required for offshore floating PV and modules within 1 km of coastline",
          "Aluminum frame alloys and silver-based cell metallization are primary corrosion targets in salt mist tests",
        ]}
      />

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-blue-300 text-blue-700">IEC 61701</Badge>
          <Badge variant="outline" className="border-cyan-300 text-cyan-700">Severity Level 6</Badge>
          <Badge variant="outline" className="border-teal-300 text-teal-700">NaCl 5% / 35°C</Badge>
          <Badge variant="outline" className="border-purple-300 text-purple-700">576h Cyclic</Badge>
          <Badge variant="outline" className="border-gray-300 text-gray-700">6 Modules</Badge>
          <Badge
            className={
              passCount === MODULE_RESULTS.length
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }
          >
            {passCount}/{MODULE_RESULTS.length} Modules Pass
          </Badge>
        </div>
        <ExportDropdown config={exportConfig} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Corrosion Severity Level</div>
                <div className="text-2xl font-bold font-mono text-blue-700">Level 6</div>
                <div className="text-xs text-muted-foreground mt-0.5">Most severe per IEC 61701</div>
              </div>
              <Waves className="h-5 w-5 text-blue-500 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">NaCl 5% w/v solution</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Exposure Duration (h)</div>
                <div className="text-2xl font-bold font-mono text-cyan-600">576 h</div>
                <div className="text-xs text-muted-foreground mt-0.5">6 cyclic spray phases</div>
              </div>
              <Clock className="h-5 w-5 text-cyan-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Avg degradation: {avgDegradation}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Max Pmax Degradation (%)</div>
                <div className={`text-2xl font-bold font-mono ${maxDegradation > 5 ? "text-red-600" : "text-green-600"}`}>
                  {maxDegradation.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">worst module at 576h</div>
              </div>
              <TrendingDown className="h-5 w-5 text-red-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs">
              <span className={maxDegradation <= 5 ? "text-green-600" : "text-red-600"}>
                Limit: ≤ 5%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Modules Passed</div>
                <div className={`text-2xl font-bold font-mono ${passCount === MODULE_RESULTS.length ? "text-green-600" : "text-red-600"}`}>
                  {passCount} / {MODULE_RESULTS.length}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {MODULE_RESULTS.length - passCount} module(s) failed
                </div>
              </div>
              {passCount === MODULE_RESULTS.length
                ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                : <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              }
            </div>
            <div className="mt-2 text-xs text-muted-foreground">IEC 61701 §8 criteria</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pmax Retention Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Pmax Retention (%) vs Exposure Hours
            </CardTitle>
            <CardDescription className="text-xs">
              Pmax/Pmax₀ (%) for all 6 modules | 5% degradation threshold at 95%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={PMAX_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Exposure Time", position: "insideBottom", offset: -12, fontSize: 10 }}
                />
                <YAxis
                  domain={[85, 101]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Pmax Retention (%)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }}
                />
                <Tooltip content={<PmaxTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={95}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "−5% limit", fill: "#ef4444", fontSize: 9, position: "insideTopLeft" }}
                />
                <Line type="monotone" dataKey="M1" name="SM-MOD-001" stroke={MODULE_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M2" name="SM-MOD-002" stroke={MODULE_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M3" name="SM-MOD-003" stroke={MODULE_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M4" name="SM-MOD-004" stroke={MODULE_COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M5" name="SM-MOD-005" stroke={MODULE_COLORS[4]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M6" name="SM-MOD-006" stroke={MODULE_COLORS[5]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Corrosion Grade Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              Corrosion Grade per Module at Final Inspection
            </CardTitle>
            <CardDescription className="text-xs">
              Corrosion grade 0–5 at 576h | Green: trace/none, Amber: mild, Red: moderate/severe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CORROSION_BAR_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Module ID", position: "insideBottom", offset: -12, fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Corrosion Grade", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number) => [`${v} — ${CORROSION_GRADE_LABELS[v] ?? ""}`, "Corrosion Grade"]}
                  labelFormatter={(l) => `Module: ${l}`}
                />
                <ReferenceLine
                  y={2}
                  stroke="#f59e0b"
                  strokeDasharray="5 3"
                  label={{ value: "Grade 2 threshold", fill: "#f59e0b", fontSize: 9, position: "insideTopRight" }}
                />
                <Bar dataKey="corrosionGrade" name="Corrosion Grade" radius={[3, 3, 0, 0]}>
                  {CORROSION_BAR_DATA.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Salt Mist Corrosion Module Test Results Summary</CardTitle>
          <CardDescription className="text-xs">
            IEC 61701 Severity Level 6 pass criterion: Pmax degradation ≤ 5% after cyclic NaCl 5% exposure (35°C, 576h)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium">Module ID</th>
                  <th className="text-center p-2 font-medium">Severity</th>
                  <th className="text-right p-2 font-medium">Exp. Hours</th>
                  <th className="text-right p-2 font-medium">Initial Pmax (W)</th>
                  <th className="text-right p-2 font-medium">@96h (W)</th>
                  <th className="text-right p-2 font-medium">@192h (W)</th>
                  <th className="text-right p-2 font-medium">@288h (W)</th>
                  <th className="text-right p-2 font-medium">@384h (W)</th>
                  <th className="text-right p-2 font-medium">@480h (W)</th>
                  <th className="text-right p-2 font-medium">@576h (W)</th>
                  <th className="text-right p-2 font-medium">Degradation (%)</th>
                  <th className="text-center p-2 font-medium">Corrosion Grade</th>
                  <th className="text-left p-2 font-medium">Visual Defects</th>
                  <th className="text-center p-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_RESULTS.map((m, i) => (
                  <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="p-2 font-mono font-semibold" style={{ color: MODULE_COLORS[i] }}>
                      {m.id}
                    </td>
                    <td className="p-2 text-center font-mono">{m.severityLevel}</td>
                    <td className="p-2 text-right font-mono">{m.exposureHours}</td>
                    <td className="p-2 text-right font-mono">{m.initialPmax.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax96.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax192.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax288.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax384.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax480.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax576.toFixed(1)}</td>
                    <td
                      className={`p-2 text-right font-mono font-semibold ${
                        m.finalDegradationPct > 5 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {m.finalDegradationPct.toFixed(1)}%
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`font-semibold ${
                          m.corrosionGrade <= 1
                            ? "text-green-600"
                            : m.corrosionGrade === 2
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {m.corrosionGrade} — {CORROSION_GRADE_LABELS[m.corrosionGrade]}
                      </span>
                    </td>
                    <td className="p-2 text-muted-foreground">{m.visualDefects}</td>
                    <td className="p-2 text-center">
                      {m.pass ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          PASS
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-300 gap-1">
                          <XCircle className="h-3 w-3" />
                          FAIL
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Pass criterion: ΔPmax ≤ 5% (IEC 61701 §8). Corrosion grade scale: 0 = None, 1 = Trace, 2 = Mild, 3 = Moderate, 4 = Severe, 5 = Very Severe.
            Intermediate measurements at 96h, 192h, 288h, 384h, 480h, 576h. Wet insulation resistance tested post-exposure per IEC 61701 §7.2.
          </div>
        </CardContent>
      </Card>

      {/* Amber Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              IEC 61701 — Salt Mist Corrosion Relevance for Coastal Installations:
            </span>{" "}
            IEC 61701 addresses one of the most significant environmental degradation mechanisms for PV modules
            deployed in coastal, marine, offshore, and salt-desert environments. Sea-spray aerosol contains
            sodium chloride (NaCl) concentrations that closely match the 5% test solution, making IEC 61701
            directly representative of real-world coastal exposure conditions. Salt deposition promotes
            electrochemical corrosion of aluminum alloy frames, silver-based cell finger contacts and busbars,
            copper interconnect ribbons, and steel mounting hardware. The cyclic nature of IEC 61701 testing —
            alternating between salt mist spray and drying phases — simulates tidal patterns and diurnal
            wind-driven salt aerosol deposition more faithfully than constant immersion tests. Severity Level 6
            (576 hours) is the benchmark for modules intended for offshore floating PV, island installations,
            and sites within 500 m of a coastline. Certification to Severity Level 6 is increasingly mandated
            by coastal utility developers and marine energy project insurers as a qualification prerequisite
            alongside IEC 61215 and IEC 61730 for coastal solar parks. Key failure modes observed in salt mist
            testing include progressive frame pit corrosion leading to structural weakening, corrosion-induced
            increase in series resistance via ribbon and busbar degradation, encapsulant delamination triggered
            by moisture ingress at corroded frame interfaces, and junction box seal failure allowing salt
            ingress to electrical contacts.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
