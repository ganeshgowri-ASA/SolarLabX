// @ts-nocheck
"use client"

import { useMemo } from "react"
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
import { AlertTriangle, Zap, TrendingDown, Activity, CheckCircle, XCircle } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimePoint {
  label: string
  hours: number
  phase: "stress" | "recovery"
  M1: number
  M2: number
  M3: number
  M4: number
}

interface LeakagePoint {
  label: string
  hours: number
  M1: number
  M2: number
  M3: number
  M4: number
}

interface ModuleResult {
  id: string
  initialPmax: number
  finalStressPmax: number
  finalRecoveryPmax: number
  degradationPct: number
  recoveryPct: number
  peakLeakage: number
  pass: boolean
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

// Pmax retention (%) during stress (0–96h) and recovery (96+24h to 96+72h)
// Each module degrades differently, then partially recovers
const PMAX_DATA: TimePoint[] = [
  { label: "0h",       hours: 0,   phase: "stress",   M1: 100.0, M2: 100.0, M3: 100.0, M4: 100.0 },
  { label: "24h",      hours: 24,  phase: "stress",   M1: 98.1,  M2: 97.3,  M3: 96.8,  M4: 99.2 },
  { label: "48h",      hours: 48,  phase: "stress",   M1: 96.9,  M2: 95.1,  M3: 94.2,  M4: 98.3 },
  { label: "72h",      hours: 72,  phase: "stress",   M1: 96.2,  M2: 93.8,  M3: 92.7,  M4: 97.8 },
  { label: "96h",      hours: 96,  phase: "stress",   M1: 95.8,  M2: 93.1,  M3: 91.9,  M4: 97.5 },
  { label: "R+24h",    hours: 120, phase: "recovery",  M1: 96.7,  M2: 94.2,  M3: 93.1,  M4: 98.0 },
  { label: "R+48h",    hours: 144, phase: "recovery",  M1: 97.4,  M2: 95.0,  M3: 94.0,  M4: 98.4 },
  { label: "R+72h",    hours: 168, phase: "recovery",  M1: 97.9,  M2: 95.6,  M3: 94.7,  M4: 98.7 },
]

// Leakage current (μA) during stress and recovery
const LEAKAGE_DATA: LeakagePoint[] = [
  { label: "0h",    hours: 0,   M1: 1.2,  M2: 1.5,  M3: 1.8,  M4: 0.9  },
  { label: "24h",   hours: 24,  M1: 4.8,  M2: 6.2,  M3: 8.1,  M4: 2.3  },
  { label: "48h",   hours: 48,  M1: 6.1,  M2: 8.5,  M3: 11.4, M4: 2.9  },
  { label: "72h",   hours: 72,  M1: 6.5,  M2: 9.1,  M3: 12.3, M4: 3.1  },
  { label: "96h",   hours: 96,  M1: 6.7,  M2: 9.3,  M3: 12.7, M4: 3.2  },
  { label: "R+24h", hours: 120, M1: 4.1,  M2: 5.8,  M3: 7.9,  M4: 2.0  },
  { label: "R+48h", hours: 144, M1: 2.5,  M2: 3.4,  M3: 4.8,  M4: 1.4  },
  { label: "R+72h", hours: 168, M1: 1.8,  M2: 2.2,  M3: 3.1,  M4: 1.1  },
]

// Module summary table data
const MODULE_RESULTS: ModuleResult[] = [
  {
    id: "PID-MOD-001",
    initialPmax: 400.0,
    finalStressPmax: 383.2,
    finalRecoveryPmax: 391.6,
    degradationPct: 4.2,
    recoveryPct: 2.1,
    peakLeakage: 6.7,
    pass: true,
  },
  {
    id: "PID-MOD-002",
    initialPmax: 400.0,
    finalStressPmax: 372.4,
    finalRecoveryPmax: 382.4,
    degradationPct: 6.9,
    recoveryPct: 2.5,
    peakLeakage: 9.3,
    pass: false,
  },
  {
    id: "PID-MOD-003",
    initialPmax: 400.0,
    finalStressPmax: 367.6,
    finalRecoveryPmax: 378.8,
    degradationPct: 8.1,
    recoveryPct: 2.8,
    peakLeakage: 12.7,
    pass: false,
  },
  {
    id: "PID-MOD-004",
    initialPmax: 400.0,
    finalStressPmax: 390.0,
    finalRecoveryPmax: 394.8,
    degradationPct: 2.5,
    recoveryPct: 1.2,
    peakLeakage: 3.2,
    pass: true,
  },
]

// ─── KPI Cards ────────────────────────────────────────────────────────────────

const MODULE_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e"]
const MODULE_NAMES = ["M1 (PID-MOD-001)", "M2 (PID-MOD-002)", "M3 (PID-MOD-003)", "M4 (PID-MOD-004)"]

// Custom tooltip for the Pmax chart showing phase
const PmaxTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const point = PMAX_DATA.find((d) => d.label === label)
  return (
    <div className="bg-white border rounded shadow-md p-2 text-xs space-y-1">
      <div className="font-semibold text-gray-700">
        {label} — {point?.phase === "recovery" ? "Recovery Phase" : "Stress Phase"}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(1)}%
        </div>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PIDTab() {
  const passCount = useMemo(() => MODULE_RESULTS.filter((m) => m.pass).length, [])
  const avgDegradation = useMemo(
    () => MODULE_RESULTS.reduce((s, m) => s + m.degradationPct, 0) / MODULE_RESULTS.length,
    []
  )
  const avgRecovery = useMemo(
    () => MODULE_RESULTS.reduce((s, m) => s + m.recoveryPct, 0) / MODULE_RESULTS.length,
    []
  )
  const maxLeakage = useMemo(
    () => Math.max(...MODULE_RESULTS.map((m) => m.peakLeakage)),
    []
  )

  const exportConfig = {
    filename: "PID_Analysis_IEC62804",
    title: "PID Stress Test – IEC 62804 / TS 62804-1",
    headers: ["Module ID", "Initial Pmax (W)", "Final Stress Pmax (W)", "Final Recovery Pmax (W)", "Degradation (%)", "Recovery (%)", "Peak Leakage (μA)", "Result"],
    rows: MODULE_RESULTS.map((m) => [
      m.id,
      m.initialPmax.toFixed(1),
      m.finalStressPmax.toFixed(1),
      m.finalRecoveryPmax.toFixed(1),
      m.degradationPct.toFixed(1),
      m.recoveryPct.toFixed(1),
      m.peakLeakage.toFixed(1),
      m.pass ? "PASS" : "FAIL",
    ]),
  }

  return (
    <div className="space-y-4">
      {/* IEC Standard Card */}
      <IECStandardCard
        standard="IEC 62804 / TS 62804-1"
        title="Photovoltaic (PV) modules — Test methods for the detection of potential-induced degradation"
        testConditions={[
          "Temperature: 85°C ± 2°C",
          "Relative Humidity: 85% ± 5% RH",
          "Voltage bias: System voltage (negative or positive)",
          "Duration: 96 hours continuous stress",
          "I-V measurement at STC before and after stress",
        ]}
        dosageLevels={[
          "Stress duration: 96 hours at −1000 V (or rated system voltage)",
          "Recovery: Open-circuit or short-circuit at room temperature",
          "Optional recovery anneal: 25°C, 48–72 hours",
          "Measurement intervals: 0h, 24h, 48h, 72h, 96h",
        ]}
        passCriteria={[
          { parameter: "ΔPmax", requirement: "≤ 5% after 96h stress", note: "At STC (IEC 60904-1)" },
          { parameter: "Leakage current", requirement: "Stable trend, no runaway", note: "Monitoring only" },
          { parameter: "Visual inspection", requirement: "No delamination, discoloration, bubbles" },
        ]}
        failCriteria={[
          { parameter: "ΔPmax", requirement: "> 5% degradation at 96h" },
          { parameter: "Electrical insulation", requirement: "Breakdown or arcing during stress" },
        ]}
        notes={[
          "PID primarily affects n-type PERC and standard p-type silicon modules",
          "Sodium ion migration from glass through anti-reflective coating to cell surface is a key mechanism",
          "Recovery test at STC after 48–72h open-circuit helps quantify reversible vs permanent PID",
          "Both negative-polarity (PID-s) and positive-polarity (PID-p) variants are addressed in TS 62804-1",
        ]}
      />

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-amber-300 text-amber-700">IEC 62804</Badge>
          <Badge variant="outline" className="border-blue-300 text-blue-700">TS 62804-1</Badge>
          <Badge variant="outline" className="border-purple-300 text-purple-700">85°C / 85% RH</Badge>
          <Badge variant="outline" className="border-gray-300 text-gray-700">96h Stress + Recovery</Badge>
          <Badge
            className={passCount === MODULE_RESULTS.length
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"}
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
                <div className="text-xs text-muted-foreground mb-1">Avg Pmax Degradation</div>
                <div className="text-2xl font-bold font-mono text-red-600">
                  {avgDegradation.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">at 96h stress end</div>
              </div>
              <TrendingDown className="h-5 w-5 text-red-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs">
              <span className={avgDegradation <= 5 ? "text-green-600" : "text-red-600"}>
                Limit: ≤ 5%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Avg Recovery Rate</div>
                <div className="text-2xl font-bold font-mono text-blue-600">
                  {avgRecovery.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Pmax regained at R+72h</div>
              </div>
              <Activity className="h-5 w-5 text-blue-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Reversible PID component
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Voltage Stress</div>
                <div className="text-2xl font-bold font-mono text-amber-600">−1000 V</div>
                <div className="text-xs text-muted-foreground mt-0.5">System voltage bias</div>
              </div>
              <Zap className="h-5 w-5 text-amber-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Negative polarity (PID-s)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Peak Leakage Current</div>
                <div className="text-2xl font-bold font-mono text-purple-600">
                  {maxLeakage.toFixed(1)} μA
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">worst module at 96h</div>
              </div>
              <Activity className="h-5 w-5 text-purple-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Decreases on recovery
            </div>
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
              Pmax Retention vs Time — Stress &amp; Recovery
            </CardTitle>
            <CardDescription className="text-xs">
              Pmax/Pmax₀ (%) | Stress phase: 0–96h | Recovery phase: R+24h to R+72h | Divider at 96h
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={PMAX_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Time", position: "insideBottom", offset: -12, fontSize: 10 }}
                />
                <YAxis
                  domain={[90, 101]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Pmax Retention (%)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }}
                />
                <Tooltip content={<PmaxTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {/* 5% pass/fail limit */}
                <ReferenceLine
                  y={95}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "−5% limit", fill: "#ef4444", fontSize: 9, position: "insideTopLeft" }}
                />
                {/* Vertical divider at stress end (96h = index 4, label "96h") */}
                <ReferenceLine
                  x="96h"
                  stroke="#6b7280"
                  strokeDasharray="4 2"
                  label={{ value: "Stress end", fill: "#6b7280", fontSize: 9, position: "insideTopRight" }}
                />
                <Line type="monotone" dataKey="M1" name="PID-MOD-001" stroke={MODULE_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M2" name="PID-MOD-002" stroke={MODULE_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M3" name="PID-MOD-003" stroke={MODULE_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M4" name="PID-MOD-004" stroke={MODULE_COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leakage Current Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              Leakage Current vs Time
            </CardTitle>
            <CardDescription className="text-xs">
              Module leakage current (μA) during stress and recovery | Peaks at 96h then declines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={LEAKAGE_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Time", position: "insideBottom", offset: -12, fontSize: 10 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Leakage Current (μA)", angle: -90, position: "insideLeft", offset: 10, fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v?.toFixed(1)} μA`, name]}
                  labelFormatter={(l) => `Time: ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  x="96h"
                  stroke="#6b7280"
                  strokeDasharray="4 2"
                  label={{ value: "Stress end", fill: "#6b7280", fontSize: 9, position: "insideTopRight" }}
                />
                <Line type="monotone" dataKey="M1" name="PID-MOD-001" stroke={MODULE_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M2" name="PID-MOD-002" stroke={MODULE_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M3" name="PID-MOD-003" stroke={MODULE_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M4" name="PID-MOD-004" stroke={MODULE_COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Module PID Test Results Summary</CardTitle>
          <CardDescription className="text-xs">
            IEC 62804 pass criterion: Pmax degradation ≤ 5% after 96h stress at 85°C / 85% RH / −1000 V
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium">Module ID</th>
                  <th className="text-right p-2 font-medium">Initial Pmax (W)</th>
                  <th className="text-right p-2 font-medium">Final Stress Pmax (W)</th>
                  <th className="text-right p-2 font-medium">Final Recovery Pmax (W)</th>
                  <th className="text-right p-2 font-medium">Degradation (%)</th>
                  <th className="text-right p-2 font-medium">Recovery (%)</th>
                  <th className="text-right p-2 font-medium">Peak Leakage (μA)</th>
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
                    <td className="p-2 text-right font-mono">{m.finalStressPmax.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.finalRecoveryPmax.toFixed(1)}</td>
                    <td className={`p-2 text-right font-mono font-semibold ${m.degradationPct > 5 ? "text-red-600" : "text-green-600"}`}>
                      {m.degradationPct.toFixed(1)}%
                    </td>
                    <td className="p-2 text-right font-mono text-blue-600">
                      +{m.recoveryPct.toFixed(1)}%
                    </td>
                    <td className="p-2 text-right font-mono">{m.peakLeakage.toFixed(1)}</td>
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
            Pass criterion: ΔPmax ≤ 5% (IEC 62804-1 Clause 7). Recovery measured at R+72h after open-circuit rest at 25°C.
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              IEC 62804 / TS 62804-1 — PID Stress Test Reference:
            </span>{" "}
            Potential Induced Degradation (PID) testing subjects modules to voltage bias equal to
            the rated system voltage at 85°C / 85% RH for 96 hours. Pmax degradation is measured at STC
            (IEC 60904-1) before and after stress. Pass criterion is ≤ 5% Pmax loss. Recovery testing
            (open-circuit at 25°C for 48–72h) quantifies the reversible PID component via sodium ion
            back-migration. TS 62804-1 covers negative polarity (PID-s: shunting) and TS 62804-2 covers
            positive polarity (PID-p: polarization). Leakage current monitoring throughout stress is
            recommended but not mandatory per the standard.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
