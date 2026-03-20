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
import { Thermometer, Droplets, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
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
  initialPmax: number
  pmax250: number
  pmax500: number
  pmax750: number
  pmax1000: number
  finalDegradationPct: number
  visualInspection: string
  insulationResistance: number
  pass: boolean
}

// ─── Demo Data ─────────────────────────────────────────────────────────────────

// Pmax retention (%) at 0, 250, 500, 750, 1000h
// 6 modules with varying degradation — some fail the 5% threshold
const PMAX_DATA: PmaxPoint[] = [
  { label: "0h",    hours: 0,    M1: 100.0, M2: 100.0, M3: 100.0, M4: 100.0, M5: 100.0, M6: 100.0 },
  { label: "250h",  hours: 250,  M1: 99.1,  M2: 98.7,  M3: 98.2,  M4: 99.5,  M5: 97.8,  M6: 99.3  },
  { label: "500h",  hours: 500,  M1: 98.3,  M2: 97.4,  M3: 96.5,  M4: 99.1,  M5: 95.9,  M6: 98.7  },
  { label: "750h",  hours: 750,  M1: 97.6,  M2: 96.1,  M3: 94.7,  M4: 98.6,  M5: 94.1,  M6: 98.2  },
  { label: "1000h", hours: 1000, M1: 97.0,  M2: 95.2,  M3: 93.1,  M4: 98.2,  M5: 92.6,  M6: 97.8  },
]

// Module final results for bar chart and table
const MODULE_RESULTS: ModuleResult[] = [
  {
    id: "DH-MOD-001",
    initialPmax: 400.0,
    pmax250: 396.4,
    pmax500: 393.2,
    pmax750: 390.4,
    pmax1000: 388.0,
    finalDegradationPct: 3.0,
    visualInspection: "No change",
    insulationResistance: 112.4,
    pass: true,
  },
  {
    id: "DH-MOD-002",
    initialPmax: 400.0,
    pmax250: 394.8,
    pmax500: 389.6,
    pmax750: 384.4,
    pmax1000: 380.8,
    finalDegradationPct: 4.8,
    visualInspection: "Minor discoloration",
    insulationResistance: 98.7,
    pass: true,
  },
  {
    id: "DH-MOD-003",
    initialPmax: 400.0,
    pmax250: 392.8,
    pmax500: 386.0,
    pmax750: 378.8,
    pmax1000: 372.4,
    finalDegradationPct: 6.9,
    visualInspection: "Edge delamination",
    insulationResistance: 72.1,
    pass: false,
  },
  {
    id: "DH-MOD-004",
    initialPmax: 400.0,
    pmax250: 398.0,
    pmax500: 396.4,
    pmax750: 394.4,
    pmax1000: 392.8,
    finalDegradationPct: 1.8,
    visualInspection: "No change",
    insulationResistance: 135.6,
    pass: true,
  },
  {
    id: "DH-MOD-005",
    initialPmax: 400.0,
    pmax250: 391.2,
    pmax500: 383.6,
    pmax750: 376.4,
    pmax1000: 370.4,
    finalDegradationPct: 7.4,
    visualInspection: "Corrosion at ribbon",
    insulationResistance: 58.3,
    pass: false,
  },
  {
    id: "DH-MOD-006",
    initialPmax: 400.0,
    pmax250: 397.2,
    pmax500: 394.8,
    pmax750: 392.8,
    pmax1000: 391.2,
    finalDegradationPct: 2.2,
    visualInspection: "No change",
    insulationResistance: 128.9,
    pass: true,
  },
]

// Bar chart data: final degradation per module
const DEGRADATION_BAR_DATA = MODULE_RESULTS.map((m) => ({
  module: m.id.replace("DH-", ""),
  degradation: m.finalDegradationPct,
  fill: m.finalDegradationPct > 5 ? "#ef4444" : "#22c55e",
}))

// ─── Constants ─────────────────────────────────────────────────────────────────

const MODULE_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e", "#a855f7", "#06b6d4"]
const MODULE_NAMES = [
  "M1 (DH-MOD-001)",
  "M2 (DH-MOD-002)",
  "M3 (DH-MOD-003)",
  "M4 (DH-MOD-004)",
  "M5 (DH-MOD-005)",
  "M6 (DH-MOD-006)",
]

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

export function DampHeatTab() {
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
    filename: "DampHeat_IEC61215_MQT13",
    title: "Damp Heat Test – IEC 61215 MQT 13 (85°C / 85% RH / 1000h)",
    headers: [
      "Module ID",
      "Initial Pmax (W)",
      "Pmax @250h (W)",
      "Pmax @500h (W)",
      "Pmax @750h (W)",
      "Pmax @1000h (W)",
      "Degradation (%)",
      "Visual Inspection",
      "Insulation Resistance (MΩ)",
      "Result",
    ],
    rows: MODULE_RESULTS.map((m) => [
      m.id,
      m.initialPmax.toFixed(1),
      m.pmax250.toFixed(1),
      m.pmax500.toFixed(1),
      m.pmax750.toFixed(1),
      m.pmax1000.toFixed(1),
      m.finalDegradationPct.toFixed(1),
      m.visualInspection,
      m.insulationResistance.toFixed(1),
      m.pass ? "PASS" : "FAIL",
    ]),
  }

  return (
    <div className="space-y-4">
      {/* IEC Standard Card */}
      <IECStandardCard
        standard="IEC 61215 MQT 13"
        title="Photovoltaic (PV) modules — Design qualification and type approval — Damp Heat Test"
        testConditions={[
          "Temperature: 85°C ± 2°C",
          "Relative Humidity: 85% ± 5% RH",
          "Duration: 1000 hours continuous exposure",
          "I-V measurement at STC (IEC 60904-1) before and at intermediate intervals",
          "Visual inspection and insulation resistance test before and after",
        ]}
        dosageLevels={[
          "Exposure duration: 1000 hours at 85°C / 85% RH",
          "Intermediate measurements: 0h, 250h, 500h, 750h, 1000h",
          "Modules mounted vertically or as specified in installation instructions",
          "Minimum 2 modules per test sequence",
        ]}
        passCriteria={[
          { parameter: "ΔPmax", requirement: "≤ 5% after 1000h", note: "At STC (IEC 60904-1)" },
          { parameter: "Visual inspection", requirement: "No major visual defects", note: "Per IEC 61215-2 §4.1" },
          { parameter: "Insulation resistance", requirement: "≥ 40 MΩ·m²", note: "IEC 61215 §10.15" },
          { parameter: "Wet leakage current", requirement: "Pass wet insulation test after DH", note: "MQT 15" },
        ]}
        failCriteria={[
          { parameter: "ΔPmax", requirement: "> 5% Pmax degradation at 1000h" },
          { parameter: "Visual", requirement: "Delamination, corrosion, bubbles, cracked encapsulant" },
          { parameter: "Insulation", requirement: "Insulation resistance below threshold" },
        ]}
        notes={[
          "DH 1000 is the standard damp heat exposure; extended DH 2000h may be required for enhanced qualification",
          "Test simulates long-term moisture ingress effects: corrosion, delamination, encapsulant degradation",
          "Modules with frame must be tested with frame; frameless modules tested without",
        ]}
      />

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-blue-300 text-blue-700">IEC 61215 MQT 13</Badge>
          <Badge variant="outline" className="border-amber-300 text-amber-700">85°C / 85% RH</Badge>
          <Badge variant="outline" className="border-purple-300 text-purple-700">1000h Duration</Badge>
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
                <div className="text-xs text-muted-foreground mb-1">Chamber Temp</div>
                <div className="text-2xl font-bold font-mono text-red-600">85°C</div>
                <div className="text-xs text-muted-foreground mt-0.5">±2°C tolerance</div>
              </div>
              <Thermometer className="h-5 w-5 text-red-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Per IEC 61215 MQT 13</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Humidity</div>
                <div className="text-2xl font-bold font-mono text-blue-600">85% RH</div>
                <div className="text-xs text-muted-foreground mt-0.5">±5% RH tolerance</div>
              </div>
              <Droplets className="h-5 w-5 text-blue-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Continuous exposure</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Max Pmax Degradation</div>
                <div className={`text-2xl font-bold font-mono ${maxDegradation > 5 ? "text-red-600" : "text-green-600"}`}>
                  {maxDegradation.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">worst module at 1000h</div>
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
                <div className="text-xs text-muted-foreground mb-1">Test Duration</div>
                <div className="text-2xl font-bold font-mono text-amber-600">1000h</div>
                <div className="text-xs text-muted-foreground mt-0.5">4 intermediate checks</div>
              </div>
              <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Avg degradation: {avgDegradation}%</div>
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
              Pmax Retention vs Exposure Hours
            </CardTitle>
            <CardDescription className="text-xs">
              Pmax/Pmax₀ (%) for all 6 modules | 5% degradation limit at 95%
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
                  domain={[90, 101]}
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
                <Line type="monotone" dataKey="M1" name="DH-MOD-001" stroke={MODULE_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M2" name="DH-MOD-002" stroke={MODULE_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M3" name="DH-MOD-003" stroke={MODULE_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M4" name="DH-MOD-004" stroke={MODULE_COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M5" name="DH-MOD-005" stroke={MODULE_COLORS[4]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M6" name="DH-MOD-006" stroke={MODULE_COLORS[5]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Final Degradation Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Final Pmax Degradation at 1000h (per Module)
            </CardTitle>
            <CardDescription className="text-xs">
              Bars colored by pass (green) / fail (red) | 5% threshold reference line
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DEGRADATION_BAR_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Module ID", position: "insideBottom", offset: -12, fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Degradation (%)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v?.toFixed(1)}%`, "Pmax Degradation"]}
                  labelFormatter={(l) => `Module: ${l}`}
                />
                <ReferenceLine
                  y={5}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "5% limit", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <Bar dataKey="degradation" name="Pmax Degradation (%)" fill="#22c55e" radius={[3, 3, 0, 0]}>
                  {DEGRADATION_BAR_DATA.map((entry, index) => (
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
          <CardTitle className="text-sm">Damp Heat Module Test Results Summary</CardTitle>
          <CardDescription className="text-xs">
            IEC 61215 MQT 13 pass criterion: Pmax degradation ≤ 5% after 1000h at 85°C / 85% RH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium">Module ID</th>
                  <th className="text-right p-2 font-medium">Initial Pmax (W)</th>
                  <th className="text-right p-2 font-medium">@250h (W)</th>
                  <th className="text-right p-2 font-medium">@500h (W)</th>
                  <th className="text-right p-2 font-medium">@750h (W)</th>
                  <th className="text-right p-2 font-medium">@1000h (W)</th>
                  <th className="text-right p-2 font-medium">Degradation (%)</th>
                  <th className="text-left p-2 font-medium">Visual Inspection</th>
                  <th className="text-right p-2 font-medium">Ins. Resistance (MΩ)</th>
                  <th className="text-center p-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_RESULTS.map((m, i) => (
                  <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="p-2 font-mono font-semibold" style={{ color: MODULE_COLORS[i] }}>
                      {m.id}
                    </td>
                    <td className="p-2 text-right font-mono">{m.initialPmax.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax250.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax500.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax750.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax1000.toFixed(1)}</td>
                    <td
                      className={`p-2 text-right font-mono font-semibold ${
                        m.finalDegradationPct > 5 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {m.finalDegradationPct.toFixed(1)}%
                    </td>
                    <td className="p-2 text-muted-foreground">{m.visualInspection}</td>
                    <td
                      className={`p-2 text-right font-mono ${
                        m.insulationResistance < 40 ? "text-red-600 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {m.insulationResistance.toFixed(1)}
                    </td>
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
            Pass criterion: ΔPmax ≤ 5% (IEC 61215 MQT 13). Insulation resistance threshold: ≥ 40 MΩ (IEC 61215 §10.15).
            Visual inspection per IEC 61215-2 §4.1.
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              IEC 61215 MQT 13 — Damp Heat Test Significance:
            </span>{" "}
            The Damp Heat test (DH 1000) is one of the most demanding qualification tests in IEC 61215,
            subjecting modules to 85°C and 85% relative humidity for 1000 continuous hours. This accelerated
            aging test simulates years of moisture-related degradation mechanisms including corrosion of
            cell interconnects and busbars, delamination of the encapsulant from the cell or glass,
            degradation of EVA or polyolefin encapsulant optical and adhesive properties, and ingress of
            moisture into the junction box and connectors. The 5% Pmax degradation limit is assessed at
            STC per IEC 60904-1 after completion of the full 1000h exposure. Modules intended for hot and
            humid climates (tropical, coastal) should additionally be evaluated under extended DH 2000h
            or combined UV + DH sequences per IEC 61215 and IEC TS 62804. Insulation resistance is measured
            before and after to confirm structural integrity of the electrical isolation.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
