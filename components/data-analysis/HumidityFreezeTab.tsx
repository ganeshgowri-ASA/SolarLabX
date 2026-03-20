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
import { Thermometer, Droplets, AlertTriangle, CheckCircle, XCircle, ShieldAlert } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Constants ─────────────────────────────────────────────────────────────────

const MODULE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

const INSULATION_THRESHOLD = 40 // MΩ — pass threshold per IEC 61215

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ModuleResult {
  id: string
  initialInsR: number   // MΩ initial (before test)
  insR_c2: number       // after cycle 2
  insR_c4: number       // after cycle 4
  insR_c6: number       // after cycle 6
  insR_c8: number       // after cycle 8
  insR_c10: number      // after cycle 10
  minInsR: number       // minimum value across all cycles
  pmaxDegradationPct: number
  visualInspection: string
  pass: boolean
}

// ─── Demo Data ─────────────────────────────────────────────────────────────────

// 6 modules tracked over 10 Humidity-Freeze cycles
// Insulation resistance (MΩ) measured after every 2nd cycle
// Pass threshold: 40 MΩ — majority pass; two modules fail
const MODULE_RESULTS: ModuleResult[] = [
  {
    id: "HF-MOD-001",
    initialInsR: 218.4,
    insR_c2: 210.1,
    insR_c4: 201.7,
    insR_c6: 196.3,
    insR_c8: 189.5,
    insR_c10: 184.2,
    minInsR: 184.2,
    pmaxDegradationPct: 1.4,
    visualInspection: "No change",
    pass: true,
  },
  {
    id: "HF-MOD-002",
    initialInsR: 195.7,
    insR_c2: 185.2,
    insR_c4: 174.8,
    insR_c6: 163.9,
    insR_c8: 154.1,
    insR_c10: 145.6,
    minInsR: 145.6,
    pmaxDegradationPct: 2.1,
    visualInspection: "Minor edge discoloration",
    pass: true,
  },
  {
    id: "HF-MOD-003",
    initialInsR: 156.3,
    insR_c2: 138.4,
    insR_c4: 112.6,
    insR_c6: 87.2,
    insR_c8: 61.4,
    insR_c10: 42.8,
    minInsR: 42.8,
    pmaxDegradationPct: 3.7,
    visualInspection: "Hairline crack observed",
    pass: true,
  },
  {
    id: "HF-MOD-004",
    initialInsR: 132.5,
    insR_c2: 108.3,
    insR_c4: 82.1,
    insR_c6: 58.4,
    insR_c8: 36.2,
    insR_c10: 22.7,
    minInsR: 22.7,
    pmaxDegradationPct: 5.9,
    visualInspection: "Delamination at corner",
    pass: false,
  },
  {
    id: "HF-MOD-005",
    initialInsR: 241.8,
    insR_c2: 234.5,
    insR_c4: 226.9,
    insR_c6: 219.3,
    insR_c8: 212.7,
    insR_c10: 207.1,
    minInsR: 207.1,
    pmaxDegradationPct: 1.1,
    visualInspection: "No change",
    pass: true,
  },
  {
    id: "HF-MOD-006",
    initialInsR: 118.9,
    insR_c2: 94.7,
    insR_c4: 68.3,
    insR_c6: 44.1,
    insR_c8: 28.6,
    insR_c10: 17.3,
    minInsR: 17.3,
    pmaxDegradationPct: 6.8,
    visualInspection: "Moisture ingress, bubbling",
    pass: false,
  },
]

// ─── Insulation Resistance vs Cycle Number (line chart data) ──────────────────

// Each point: cycle number (0 = initial, 2, 4, 6, 8, 10) and insR per module
const INS_R_TREND: { cycle: number; [key: string]: number }[] = [
  {
    cycle: 0,
    "HF-MOD-001": 218.4,
    "HF-MOD-002": 195.7,
    "HF-MOD-003": 156.3,
    "HF-MOD-004": 132.5,
    "HF-MOD-005": 241.8,
    "HF-MOD-006": 118.9,
  },
  {
    cycle: 2,
    "HF-MOD-001": 210.1,
    "HF-MOD-002": 185.2,
    "HF-MOD-003": 138.4,
    "HF-MOD-004": 108.3,
    "HF-MOD-005": 234.5,
    "HF-MOD-006": 94.7,
  },
  {
    cycle: 4,
    "HF-MOD-001": 201.7,
    "HF-MOD-002": 174.8,
    "HF-MOD-003": 112.6,
    "HF-MOD-004": 82.1,
    "HF-MOD-005": 226.9,
    "HF-MOD-006": 68.3,
  },
  {
    cycle: 6,
    "HF-MOD-001": 196.3,
    "HF-MOD-002": 163.9,
    "HF-MOD-003": 87.2,
    "HF-MOD-004": 58.4,
    "HF-MOD-005": 219.3,
    "HF-MOD-006": 44.1,
  },
  {
    cycle: 8,
    "HF-MOD-001": 189.5,
    "HF-MOD-002": 154.1,
    "HF-MOD-003": 61.4,
    "HF-MOD-004": 36.2,
    "HF-MOD-005": 212.7,
    "HF-MOD-006": 28.6,
  },
  {
    cycle: 10,
    "HF-MOD-001": 184.2,
    "HF-MOD-002": 145.6,
    "HF-MOD-003": 42.8,
    "HF-MOD-004": 22.7,
    "HF-MOD-005": 207.1,
    "HF-MOD-006": 17.3,
  },
]

// ─── Pmax Degradation Bar Chart Data ──────────────────────────────────────────

const PMAX_BAR_DATA = MODULE_RESULTS.map((m) => ({
  module: m.id.replace("HF-", ""),
  degradation: m.pmaxDegradationPct,
  fill: m.pmaxDegradationPct > 5 ? "#ef4444" : "#22c55e",
}))

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

const InsRTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border rounded shadow-md p-2 text-xs space-y-1">
      <div className="font-semibold text-gray-700">Cycle {label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(1)} MΩ
        </div>
      ))}
      <div className="text-gray-400 pt-0.5 border-t">Threshold: 40 MΩ</div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function HumidityFreezeTab() {
  const passCount = useMemo(() => MODULE_RESULTS.filter((m) => m.pass).length, [])
  const failCount = useMemo(() => MODULE_RESULTS.filter((m) => !m.pass).length, [])

  const minInsR = useMemo(
    () => Math.min(...MODULE_RESULTS.map((m) => m.minInsR)),
    []
  )

  const overallPass = failCount === 0

  const exportData = MODULE_RESULTS.map((m) => ({
    "Module ID": m.id,
    "Initial Ins. R (MΩ)": m.initialInsR,
    "Ins. R @ Cycle 2 (MΩ)": m.insR_c2,
    "Ins. R @ Cycle 4 (MΩ)": m.insR_c4,
    "Ins. R @ Cycle 6 (MΩ)": m.insR_c6,
    "Ins. R @ Cycle 8 (MΩ)": m.insR_c8,
    "Ins. R @ Cycle 10 (MΩ)": m.insR_c10,
    "Min Ins. R (MΩ)": m.minInsR,
    "Pmax Degradation (%)": m.pmaxDegradationPct,
    "Visual Inspection": m.visualInspection,
    Result: m.pass ? "PASS" : "FAIL",
  }))

  return (
    <div className="space-y-4">
      {/* IEC Standard Card */}
      <IECStandardCard
        standard="IEC 61215 MQT 12"
        title="Humidity Freeze Test — Assessment of PV module ability to withstand thermal fatigue from repeated temperature cycles with high humidity"
        testConditions={[
          "Temperature range: -40°C to +85°C with 85% RH during the high-temperature dwell phase",
          "Total cycles: 10 complete humidity-freeze cycles per IEC 61215:2021",
          "Cycle duration: approximately 24 hours per complete cycle",
          "High-temperature dwell: ≥ 20 h at +85°C / 85% RH (humidity soak phase)",
          "Low-temperature dwell: ≥ 30 min at -40°C (freeze phase)",
          "Ramp rate: ≤ 100°C/hour for all temperature transitions",
          "Insulation resistance measured after cycles 2, 4, 6, 8, and 10",
        ]}
        dosageLevels={[
          "HF10: 10 cycles — mandatory qualification sequence for IEC 61215 MQT 12",
          "Temperature soak at +85°C / 85% RH: 20 h minimum per cycle",
          "Freeze phase at -40°C: minimum 30 min dwell",
          "Modules left in unpowered, open-circuit condition throughout",
        ]}
        passCriteria={[
          { parameter: "Insulation resistance", requirement: "≥ 40 MΩ (adjusted for module area)", note: "IEC 61215 §10.15" },
          { parameter: "ΔPmax", requirement: "≤ 5% relative after 10 cycles", note: "IEC 61215 §11.3" },
          { parameter: "Visual inspection", requirement: "No major defects per IEC 61215-2 §4.1", note: "Cracks, delamination, bubbling" },
          { parameter: "Wet leakage current", requirement: "Pass MQT 15 after HF sequence", note: "Safety criterion" },
        ]}
        failCriteria={[
          { parameter: "Insulation failure", requirement: "Insulation resistance < 40 MΩ at any post-cycle measurement" },
          { parameter: "Pmax > 5%", requirement: "Power loss exceeds 5% relative to initial pre-test measurement" },
          { parameter: "Visual defects", requirement: "Delamination, moisture-induced bubbling, cracked glass or backsheet" },
          { parameter: "Corrosion", requirement: "Visible corrosion of cell ribbons, busbars, or junction box contacts" },
        ]}
        notes={[
          "MQT 12 is performed in the IEC 61215 sequence between TC50 and TC50 blocks (TC50 → HF10 → TC50)",
          "The combined moisture absorption and freeze-thaw stress targets ice-expansion damage in encapsulant voids",
          "Modules for cold and humid climates (alpine, coastal, northern temperate) are most critically assessed by this test",
          "Insulation resistance trend across cycles is highly diagnostic of moisture ingress pathways",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "IEC61215_MQT12_Humidity_Freeze",
            title: "Humidity Freeze Test Results — IEC 61215 MQT 12",
            standard: "IEC 61215 MQT 12",
            description: "Insulation resistance per cycle and Pmax degradation after 10 humidity-freeze cycles (-40°C to +85°C / 85% RH)",
            sheetName: "Humidity Freeze",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>Temp Range</CardDescription>
                <div className="text-2xl font-bold text-blue-600">-40 to 85°C</div>
                <p className="text-xs text-muted-foreground">85% RH during soak</p>
              </div>
              <Thermometer className="h-5 w-5 text-blue-400 mt-0.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>Total Cycles</CardDescription>
                <div className="text-2xl font-bold text-purple-600">10</div>
                <p className="text-xs text-muted-foreground">24 h/cycle</p>
              </div>
              <Droplets className="h-5 w-5 text-purple-400 mt-0.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>Min Insulation Resistance</CardDescription>
                <div
                  className={`text-2xl font-bold font-mono ${
                    minInsR < INSULATION_THRESHOLD ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {minInsR.toFixed(1)} MΩ
                </div>
                <p className="text-xs text-muted-foreground">Threshold: ≥ 40 MΩ</p>
              </div>
              <ShieldAlert
                className={`h-5 w-5 mt-0.5 ${
                  minInsR < INSULATION_THRESHOLD ? "text-red-400" : "text-green-400"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardDescription>Overall Result</CardDescription>
                <div
                  className={`text-2xl font-bold ${
                    overallPass ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {passCount}/{MODULE_RESULTS.length} Pass
                </div>
                <p className="text-xs text-muted-foreground">
                  {overallPass ? "All modules pass" : `${failCount} module(s) fail`}
                </p>
              </div>
              {overallPass ? (
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Insulation Resistance vs Cycle Number */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-500" />
              Insulation Resistance vs Cycle Number
            </CardTitle>
            <CardDescription className="text-xs">
              Insulation resistance (MΩ) per module across 10 HF cycles | 40 MΩ pass threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={INS_R_TREND} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="cycle"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Cycle Number", position: "insideBottom", offset: -12, fontSize: 9 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  domain={[0, 260]}
                  label={{ value: "Insulation Resistance (MΩ)", angle: -90, position: "insideLeft", fontSize: 9 }}
                />
                <Tooltip content={<InsRTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={INSULATION_THRESHOLD}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "40 MΩ limit", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <Line type="monotone" dataKey="HF-MOD-001" stroke={MODULE_COLORS[0]} strokeWidth={1.5} dot={{ r: 3 }} name="HF-MOD-001" />
                <Line type="monotone" dataKey="HF-MOD-002" stroke={MODULE_COLORS[1]} strokeWidth={1.5} dot={{ r: 3 }} name="HF-MOD-002" />
                <Line type="monotone" dataKey="HF-MOD-003" stroke={MODULE_COLORS[2]} strokeWidth={1.5} dot={{ r: 3 }} name="HF-MOD-003" />
                <Line
                  type="monotone"
                  dataKey="HF-MOD-004"
                  stroke={MODULE_COLORS[3]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="HF-MOD-004 (Fail)"
                  strokeDasharray="6 3"
                />
                <Line type="monotone" dataKey="HF-MOD-005" stroke={MODULE_COLORS[4]} strokeWidth={1.5} dot={{ r: 3 }} name="HF-MOD-005" />
                <Line
                  type="monotone"
                  dataKey="HF-MOD-006"
                  stroke={MODULE_COLORS[5]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="HF-MOD-006 (Fail)"
                  strokeDasharray="6 3"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              HF-MOD-004 and HF-MOD-006 (dashed) dropped below the 40 MΩ threshold — moisture ingress suspected.
            </p>
          </CardContent>
        </Card>

        {/* Pmax Degradation Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-amber-500" />
              Pmax Degradation After 10 HF Cycles (per Module)
            </CardTitle>
            <CardDescription className="text-xs">
              Bars colored by pass (green) / fail (red) | 5% degradation threshold reference line
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={PMAX_BAR_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Module ID", position: "insideBottom", offset: -12, fontSize: 9 }}
                />
                <YAxis
                  domain={[0, 9]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Degradation (%)", angle: -90, position: "insideLeft", fontSize: 9 }}
                />
                <Tooltip
                  formatter={(v: number) => [`${v?.toFixed(1)}%`, "Pmax Degradation"]}
                  labelFormatter={(l) => `Module: ${l}`}
                />
                <ReferenceLine
                  y={5}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "5% limit", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <Bar dataKey="degradation" name="Pmax Degradation (%)" radius={[3, 3, 0, 0]}>
                  {PMAX_BAR_DATA.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              HF-MOD-004 (5.9%) and HF-MOD-006 (6.8%) exceed the 5% Pmax degradation limit.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Humidity Freeze Module Test Results Summary</CardTitle>
          <CardDescription className="text-xs">
            IEC 61215 MQT 12 pass criteria: insulation resistance ≥ 40 MΩ and Pmax degradation ≤ 5% after 10 cycles at -40°C ↔ 85°C / 85% RH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Module ID</th>
                  <th className="py-2 px-2 text-right font-semibold">Initial R (MΩ)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ C2 (MΩ)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ C4 (MΩ)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ C6 (MΩ)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ C8 (MΩ)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ C10 (MΩ)</th>
                  <th className="py-2 px-2 text-right font-semibold">Min R (MΩ)</th>
                  <th className="py-2 px-2 text-right font-semibold">Pmax Deg. (%)</th>
                  <th className="py-2 px-2 text-left font-semibold">Visual Inspection</th>
                  <th className="py-2 text-center font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_RESULTS.map((m, i) => {
                  const isFail = !m.pass
                  return (
                    <tr
                      key={m.id}
                      className={`border-b hover:bg-muted/50 ${
                        isFail ? "bg-red-50/60 dark:bg-red-950/10" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="py-1.5 pr-3 font-mono font-semibold" style={{ color: MODULE_COLORS[i] }}>
                        {m.id}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.initialInsR.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.insR_c2.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.insR_c4.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.insR_c6.toFixed(1)}</td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${
                          m.insR_c8 < INSULATION_THRESHOLD ? "text-red-600 font-semibold" : ""
                        }`}
                      >
                        {m.insR_c8.toFixed(1)}
                      </td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${
                          m.insR_c10 < INSULATION_THRESHOLD ? "text-red-600 font-semibold" : ""
                        }`}
                      >
                        {m.insR_c10.toFixed(1)}
                      </td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono font-semibold ${
                          m.minInsR < INSULATION_THRESHOLD ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {m.minInsR.toFixed(1)}
                      </td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono font-semibold ${
                          m.pmaxDegradationPct > 5 ? "text-red-600" : m.pmaxDegradationPct > 3 ? "text-amber-600" : "text-green-700"
                        }`}
                      >
                        {m.pmaxDegradationPct.toFixed(1)}%
                      </td>
                      <td className="py-1.5 px-2 text-muted-foreground">{m.visualInspection}</td>
                      <td className="py-1.5 text-center">
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
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30">
                  <td className="py-1.5 pr-3 font-semibold" colSpan={7}>
                    Summary
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-semibold ${
                      minInsR < INSULATION_THRESHOLD ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    Min: {minInsR.toFixed(1)}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-semibold ${
                      Math.max(...MODULE_RESULTS.map((m) => m.pmaxDegradationPct)) > 5 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    Max: {Math.max(...MODULE_RESULTS.map((m) => m.pmaxDegradationPct)).toFixed(1)}%
                  </td>
                  <td />
                  <td className="py-1.5 text-center font-semibold">
                    <span className={failCount > 0 ? "text-red-600" : "text-green-700"}>
                      {passCount}/{MODULE_RESULTS.length} Pass
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Pass criteria: insulation resistance ≥ 40 MΩ (IEC 61215 §10.15) and ΔPmax ≤ 5% (IEC 61215 §11.3) after 10 cycles at -40°C ↔ +85°C / 85% RH.
            Visual inspection per IEC 61215-2 §4.1. Highlighted red cells indicate values below pass threshold.
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-800">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-amber-800 dark:text-amber-300 flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              <span className="font-semibold">IEC 61215 MQT 12 — Humidity Freeze Test Significance:</span>{" "}
              The Humidity Freeze test subjects modules to 10 cycles between -40°C and +85°C with 85% relative
              humidity during the high-temperature dwell phase (≥ 20 h per cycle), followed by a rapid cool-down
              and freeze at -40°C for ≥ 30 minutes. This sequence is uniquely destructive because moisture absorbed
              by the encapsulant, edge seals, and backsheet during the humid soak phase undergoes volume expansion
              upon freezing, generating mechanical stress within the laminate structure. Recurring freeze-thaw cycles
              progressively weaken the encapsulant-to-cell and encapsulant-to-glass interfaces, promote delamination,
              and can open corrosion pathways to cell interconnects and busbars. Insulation resistance tracked after
              every second cycle is the primary leading indicator of moisture ingress: a declining trend is diagnostic
              even before visible defects appear. In the IEC 61215:2021 qualification sequence, MQT 12 is sandwiched
              between two TC50 thermal cycling blocks (TC50 → HF10 → TC50), reflecting the realistic field scenario
              of alternating hot-humid summers and freezing winters. Modules deployed in alpine, coastal, or northern
              temperate climates are most critically evaluated by this combined stress sequence.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
