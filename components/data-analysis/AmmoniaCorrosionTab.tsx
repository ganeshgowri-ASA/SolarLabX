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
import { FlaskConical, Thermometer, Clock, TrendingDown, CheckCircle, XCircle, AlertTriangle, Wind } from "lucide-react"
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
  pmax168: number
  pmax336: number
  pmax504: number
  finalDegradationPct: number
  visualInspection: string
  insulationResistance: number
  pass: boolean
}

// ─── Demo Data ─────────────────────────────────────────────────────────────────

// Pmax retention (%) at 0, 168, 336, 504h
// 6 modules exposed to 500 ppm NH3 at 60°C / 60% RH — cyclic exposure
const PMAX_DATA: PmaxPoint[] = [
  { label: "0h",   hours: 0,   M1: 100.0, M2: 100.0, M3: 100.0, M4: 100.0, M5: 100.0, M6: 100.0 },
  { label: "168h", hours: 168, M1: 99.3,  M2: 98.6,  M3: 97.9,  M4: 99.6,  M5: 97.1,  M6: 99.1  },
  { label: "336h", hours: 336, M1: 98.5,  M2: 97.2,  M3: 96.0,  M4: 99.1,  M5: 94.7,  M6: 98.4  },
  { label: "504h", hours: 504, M1: 97.7,  M2: 96.1,  M3: 94.1,  M4: 98.7,  M5: 92.3,  M6: 97.6  },
]

// Module final results for bar chart and table
const MODULE_RESULTS: ModuleResult[] = [
  {
    id: "NH3-MOD-001",
    initialPmax: 400.0,
    pmax168: 397.2,
    pmax336: 394.0,
    pmax504: 390.8,
    finalDegradationPct: 2.3,
    visualInspection: "No change",
    insulationResistance: 118.6,
    pass: true,
  },
  {
    id: "NH3-MOD-002",
    initialPmax: 400.0,
    pmax168: 394.4,
    pmax336: 388.8,
    pmax504: 384.4,
    finalDegradationPct: 3.9,
    visualInspection: "Light tarnish on busbars",
    insulationResistance: 95.3,
    pass: true,
  },
  {
    id: "NH3-MOD-003",
    initialPmax: 400.0,
    pmax168: 391.6,
    pmax336: 384.0,
    pmax504: 376.4,
    finalDegradationPct: 5.9,
    visualInspection: "Corrosion on contacts",
    insulationResistance: 68.4,
    pass: false,
  },
  {
    id: "NH3-MOD-004",
    initialPmax: 400.0,
    pmax168: 398.4,
    pmax336: 396.4,
    pmax504: 394.8,
    finalDegradationPct: 1.3,
    visualInspection: "No change",
    insulationResistance: 142.1,
    pass: true,
  },
  {
    id: "NH3-MOD-005",
    initialPmax: 400.0,
    pmax168: 388.4,
    pmax336: 378.8,
    pmax504: 369.2,
    finalDegradationPct: 7.7,
    visualInspection: "Severe busbar corrosion, frame pitting",
    insulationResistance: 51.7,
    pass: false,
  },
  {
    id: "NH3-MOD-006",
    initialPmax: 400.0,
    pmax168: 396.4,
    pmax336: 393.6,
    pmax504: 390.4,
    finalDegradationPct: 2.4,
    visualInspection: "Slight discoloration at ribbon",
    insulationResistance: 124.8,
    pass: true,
  },
]

// Bar chart data: final degradation per module
const DEGRADATION_BAR_DATA = MODULE_RESULTS.map((m) => ({
  module: m.id.replace("NH3-", ""),
  degradation: m.finalDegradationPct,
  fill: m.finalDegradationPct > 5 ? "#ef4444" : "#22c55e",
}))

// ─── Constants ─────────────────────────────────────────────────────────────────

const MODULE_COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e", "#a855f7", "#06b6d4"]

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

export function AmmoniaCorrosionTab() {
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
    filename: "AmmoniaCorrosion_IEC62716",
    title: "Ammonia Corrosion Test – IEC 62716 (500 ppm NH3 / 60°C / 60% RH / 504h cyclic)",
    headers: [
      "Module ID",
      "Initial Pmax (W)",
      "Pmax @168h (W)",
      "Pmax @336h (W)",
      "Pmax @504h (W)",
      "Degradation (%)",
      "Visual Inspection",
      "Insulation Resistance (MΩ)",
      "Result",
    ],
    rows: MODULE_RESULTS.map((m) => [
      m.id,
      m.initialPmax.toFixed(1),
      m.pmax168.toFixed(1),
      m.pmax336.toFixed(1),
      m.pmax504.toFixed(1),
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
        standard="IEC 62716"
        title="Photovoltaic (PV) modules — Ammonia corrosion testing"
        testConditions={[
          "NH3 concentration: 500 ppm (±50 ppm) in air",
          "Chamber temperature: 60°C ± 2°C",
          "Relative humidity: 60% ± 5% RH",
          "Cyclic exposure: alternating ammonia-rich and recovery phases",
          "Total test duration: 504 hours (21 cycles × 24h per cycle)",
          "I-V measurement at STC (IEC 60904-1) before and at intermediate intervals",
          "Visual inspection and insulation resistance test before and after",
        ]}
        dosageLevels={[
          "NH3 concentration: 500 ppm (target for agricultural environment simulation)",
          "Intermediate measurements at 0h, 168h (7 cycles), 336h (14 cycles), 504h (21 cycles)",
          "Recovery phase: clean air at ambient conditions between cycles",
          "Minimum 2 modules per test sequence",
        ]}
        passCriteria={[
          { parameter: "ΔPmax", requirement: "≤ 5% after full exposure sequence", note: "At STC (IEC 60904-1)" },
          { parameter: "Visual inspection", requirement: "No major visual defects", note: "Per IEC 62716 §7.1" },
          { parameter: "Insulation resistance", requirement: "≥ 40 MΩ·m²", note: "Post-exposure wet insulation test" },
          { parameter: "No corrosion failure", requirement: "No open circuit or structural failure", note: "IEC 62716 §7.3" },
        ]}
        failCriteria={[
          { parameter: "ΔPmax", requirement: "> 5% Pmax degradation at end of sequence" },
          { parameter: "Visual", requirement: "Severe corrosion of contacts, busbars, frame, or connectors" },
          { parameter: "Insulation", requirement: "Insulation resistance below 40 MΩ threshold" },
          { parameter: "Open circuit", requirement: "Electrical continuity failure due to corrosion" },
        ]}
        notes={[
          "IEC 62716 is specifically designed for PV modules deployed in agricultural environments with elevated ammonia levels",
          "Ammonia reacts with copper, silver, and aluminum alloys present in solar cell metallization and connectors",
          "Cyclic exposure is more representative of real-world intermittent ammonia exposure near livestock facilities",
        ]}
      />

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-green-300 text-green-700">IEC 62716</Badge>
          <Badge variant="outline" className="border-amber-300 text-amber-700">500 ppm NH3</Badge>
          <Badge variant="outline" className="border-orange-300 text-orange-700">60°C / 60% RH</Badge>
          <Badge variant="outline" className="border-purple-300 text-purple-700">504h Cyclic</Badge>
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
                <div className="text-xs text-muted-foreground mb-1">NH3 Concentration</div>
                <div className="text-2xl font-bold font-mono text-green-700">500 ppm</div>
                <div className="text-xs text-muted-foreground mt-0.5">±50 ppm tolerance</div>
              </div>
              <FlaskConical className="h-5 w-5 text-green-500 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Per IEC 62716 §6.2</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Exposure Duration</div>
                <div className="text-2xl font-bold font-mono text-amber-600">504h</div>
                <div className="text-xs text-muted-foreground mt-0.5">21 cyclic exposures</div>
              </div>
              <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Avg degradation: {avgDegradation}%</div>
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
                <div className="text-xs text-muted-foreground mt-0.5">worst module at 504h</div>
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
                <div className="text-xs text-muted-foreground mb-1">Overall Result</div>
                <div className={`text-2xl font-bold font-mono ${passCount === MODULE_RESULTS.length ? "text-green-600" : "text-red-600"}`}>
                  {passCount === MODULE_RESULTS.length ? "PASS" : "FAIL"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {passCount}/{MODULE_RESULTS.length} modules passed
                </div>
              </div>
              {passCount === MODULE_RESULTS.length
                ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                : <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              }
            </div>
            <div className="mt-2 text-xs text-muted-foreground">IEC 62716 §8 criteria</div>
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
                <Line type="monotone" dataKey="M1" name="NH3-MOD-001" stroke={MODULE_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M2" name="NH3-MOD-002" stroke={MODULE_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M3" name="NH3-MOD-003" stroke={MODULE_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M4" name="NH3-MOD-004" stroke={MODULE_COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M5" name="NH3-MOD-005" stroke={MODULE_COLORS[4]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="M6" name="NH3-MOD-006" stroke={MODULE_COLORS[5]} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Final Degradation Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Final Pmax Degradation at 504h (per Module)
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
          <CardTitle className="text-sm">Ammonia Corrosion Module Test Results Summary</CardTitle>
          <CardDescription className="text-xs">
            IEC 62716 pass criterion: Pmax degradation ≤ 5% after cyclic NH3 exposure (500 ppm, 60°C, 60% RH, 504h)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded border overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium">Module ID</th>
                  <th className="text-right p-2 font-medium">Initial Pmax (W)</th>
                  <th className="text-right p-2 font-medium">@168h (W)</th>
                  <th className="text-right p-2 font-medium">@336h (W)</th>
                  <th className="text-right p-2 font-medium">@504h (W)</th>
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
                    <td className="p-2 text-right font-mono">{m.pmax168.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax336.toFixed(1)}</td>
                    <td className="p-2 text-right font-mono">{m.pmax504.toFixed(1)}</td>
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
            Pass criterion: ΔPmax ≤ 5% (IEC 62716 §8). Insulation resistance threshold: ≥ 40 MΩ (post-exposure wet insulation test).
            Visual inspection per IEC 62716 §7.1. Intermediate checks at 168h, 336h, 504h.
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              IEC 62716 — Ammonia Corrosion Relevance for Agricultural PV Installations:
            </span>{" "}
            IEC 62716 addresses a critical environmental hazard for PV modules deployed in or near agricultural
            settings such as livestock farms, poultry houses, and manure storage facilities where ambient ammonia
            (NH3) concentrations can reach 500 ppm or higher. Ammonia is a highly corrosive gas that aggressively
            attacks copper and silver-based solar cell metallization, aluminum frame alloys, and polymer-based
            junction box and connector materials. The cyclic exposure methodology in IEC 62716 simulates realistic
            intermittent NH3 exposure patterns rather than continuous saturation, making it more representative of
            field conditions in agri-PV and agrivoltaic installations. Key failure modes include corrosion and
            pitting of busbars and cell interconnect ribbons, stress corrosion cracking of silver finger contacts,
            degradation of anodized aluminum frames, and chemical attack on elastomeric cable seals and connector
            housings. With the rapid growth of agrivoltaic systems — where PV arrays co-exist with crop cultivation
            or livestock grazing — IEC 62716 qualification has become an important procurement criterion alongside
            IEC 61215 and IEC 61730 for modules intended for these environments.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
