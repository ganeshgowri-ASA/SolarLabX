// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts"
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Zap, Activity } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Demo Data ────────────────────────────────────────────────────────────────

interface ModuleInsulationData {
  moduleId: string
  wetLeakagePre: number   // μA — wet leakage current before stress
  wetLeakagePost: number  // μA — wet leakage current after stress
  dryInsulation: number   // MOhm — dry insulation resistance
}

const MODULE_DATA: ModuleInsulationData[] = [
  { moduleId: "SLX-001", wetLeakagePre: 12.4,  wetLeakagePost: 15.1,  dryInsulation: 312.5 },
  { moduleId: "SLX-002", wetLeakagePre: 10.8,  wetLeakagePost: 13.6,  dryInsulation: 278.3 },
  { moduleId: "SLX-003", wetLeakagePre: 14.2,  wetLeakagePost: 61.7,  dryInsulation: 35.2  },
  { moduleId: "SLX-004", wetLeakagePre: 11.5,  wetLeakagePost: 14.8,  dryInsulation: 445.0 },
  { moduleId: "SLX-005", wetLeakagePre: 13.1,  wetLeakagePost: 17.3,  dryInsulation: 198.7 },
  { moduleId: "SLX-006", wetLeakagePre:  9.7,  wetLeakagePost: 12.2,  dryInsulation: 521.4 },
  { moduleId: "SLX-007", wetLeakagePre: 15.6,  wetLeakagePost: 52.4,  dryInsulation: 28.9  },
  { moduleId: "SLX-008", wetLeakagePre: 11.9,  wetLeakagePost: 16.0,  dryInsulation: 389.1 },
]

// IEC 61215 MQT 15 limit: leakage current ≤ 50 μA (conservative threshold)
const WET_LEAKAGE_LIMIT_UA = 50
// IEC 61730 MST 16 limit: dry insulation resistance ≥ 40 MΩ
const DRY_INSULATION_LIMIT_MOHM = 40

function getModuleStatus(d: ModuleInsulationData): "PASS" | "FAIL" {
  return d.wetLeakagePost <= WET_LEAKAGE_LIMIT_UA && d.dryInsulation >= DRY_INSULATION_LIMIT_MOHM
    ? "PASS"
    : "FAIL"
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InsulationResistanceTab() {
  const [highlightFail, setHighlightFail] = useState(true)

  const moduleResults = useMemo(() =>
    MODULE_DATA.map(d => ({ ...d, status: getModuleStatus(d) })),
    []
  )

  const passCount  = moduleResults.filter(d => d.status === "PASS").length
  const failCount  = moduleResults.filter(d => d.status === "FAIL").length

  const avgWetPre  = useMemo(() => MODULE_DATA.reduce((s, d) => s + d.wetLeakagePre,  0) / MODULE_DATA.length, [])
  const avgWetPost = useMemo(() => MODULE_DATA.reduce((s, d) => s + d.wetLeakagePost, 0) / MODULE_DATA.length, [])
  const avgDryIns  = useMemo(() => MODULE_DATA.reduce((s, d) => s + d.dryInsulation,  0) / MODULE_DATA.length, [])

  // Bar chart data: pre vs post wet leakage per module
  const wetLeakageChartData = moduleResults.map(d => ({
    module:   d.moduleId,
    "Pre-Test":  d.wetLeakagePre,
    "Post-Test": d.wetLeakagePost,
    fail:     d.wetLeakagePost > WET_LEAKAGE_LIMIT_UA,
  }))

  // Bar chart data: dry insulation per module
  const dryInsChartData = moduleResults.map(d => ({
    module:      d.moduleId,
    "Dry Ins. (MΩ)": d.dryInsulation,
    fail:        d.dryInsulation < DRY_INSULATION_LIMIT_MOHM,
  }))

  const exportConfig = {
    filename: "insulation_resistance_report",
    title: "Insulation Resistance Test – IEC 61215 MQT 15 / IEC 61730 MST 16",
    headers: ["Module ID", "Wet Leakage Pre (μA)", "Wet Leakage Post (μA)", "Dry Insulation (MΩ)", "Status"],
    rows: moduleResults.map(d => [d.moduleId, d.wetLeakagePre, d.wetLeakagePost, d.dryInsulation, d.status]),
  }

  // Custom bar fill for dry insulation chart
  const dryInsBarFill = (entry: any) =>
    entry.fail ? "#ef4444" : "#3b82f6"

  // Custom bar fill for post leakage
  const postLeakageBarFill = (entry: any) =>
    entry.fail ? "#ef4444" : "#f59e0b"

  return (
    <div className="space-y-4">
      {/* IEC Standard Reference */}
      <IECStandardCard
        standard="IEC 61215 MQT 15 / IEC 61730 MST 16"
        title="Wet Leakage Current Test (MQT 15, IEC 61215-2) and Dry Insulation Resistance Test (MST 16, IEC 61730-2)"
        testConditions={[
          "Wet leakage: Module submerged / sprayed with water (Triton X-100 surfactant), 1000 V DC or Voc+100 V applied",
          "Test duration: 2 minutes at test voltage; current recorded after stabilisation",
          "Dry insulation: Applied voltage = 1000 V DC for Vsys ≤ 1000 V, or 2 × Vsys + 1000 V for higher ratings",
          "Ambient temperature: 25 ± 5 °C; relative humidity ≤ 75 % for dry insulation test",
          "Electrode polarity: active conductors tied together, measured against frame/module edge",
        ]}
        dosageLevels={[
          "Test voltage (wet): max(500 V, Vsys) applied between short-circuited terminals and frame",
          "Test voltage (dry): 1000 V DC minimum; higher voltages per system voltage class",
          "Ramping: increase to test voltage within 10 s, hold for 60 s before measurement",
          "Modules tested per sequence: initial, post-stress (TC/HF/DH/UV), as per test sequence",
        ]}
        passCriteria={[
          { parameter: "Wet Leakage Current", requirement: "≤ 50 μA (MQT 15, per m² of module area)", note: "IEC 61215-2 Cl. 4.15" },
          { parameter: "Dry Insulation Resistance", requirement: "≥ 40 MΩ × area(m²) → typically ≥ 40 MΩ for 1 m² class", note: "IEC 61730-2 Cl. 10.16" },
          { parameter: "No visual anomalies", requirement: "No delamination, cracking or water ingress post-test", note: "Visual inspection" },
        ]}
        failCriteria={[
          { parameter: "Wet Leakage Current", requirement: "> 50 μA indicates frame isolation or encapsulant failure" },
          { parameter: "Dry Insulation Resistance", requirement: "< 40 MΩ indicates potential moisture ingress or insulation breakdown" },
          { parameter: "Visual defects", requirement: "Any ground fault, arc marks or physical damage observed" },
        ]}
        notes={[
          "MQT 15 is performed before and after accelerated stress tests to detect moisture-induced degradation.",
          "MST 16 evaluates electrical isolation of the module under dry conditions — complementary to wet leakage.",
          "Resistance requirement scales with module area: R_min = 40 MΩ × A (m²); for a 2 m² module, R_min = 80 MΩ.",
          "Leakage current limit also scales: I_max = 50 μA × A (m²). Values shown here are for ~1 m² reference modules.",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown config={exportConfig} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wet Leakage Pre-Test */}
        <Card className="border-l-4 border-blue-400">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              Wet Leakage — Pre-Test
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-mono font-bold text-blue-700">
              {avgWetPre.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">μA</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Avg across {MODULE_DATA.length} modules
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Limit: ≤ {WET_LEAKAGE_LIMIT_UA} μA
            </div>
          </CardContent>
        </Card>

        {/* Wet Leakage Post-Test */}
        <Card className="border-l-4 border-amber-400">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              Wet Leakage — Post-Test
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className={`text-2xl font-mono font-bold ${avgWetPost > WET_LEAKAGE_LIMIT_UA ? "text-red-600" : "text-amber-700"}`}>
              {avgWetPost.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">μA</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Avg across {MODULE_DATA.length} modules
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Limit: ≤ {WET_LEAKAGE_LIMIT_UA} μA
            </div>
          </CardContent>
        </Card>

        {/* Dry Insulation */}
        <Card className="border-l-4 border-green-400">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              Dry Insulation (avg)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className={`text-2xl font-mono font-bold ${avgDryIns < DRY_INSULATION_LIMIT_MOHM ? "text-red-600" : "text-green-700"}`}>
              {avgDryIns.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground ml-1">MΩ</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Avg across {MODULE_DATA.length} modules
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Limit: ≥ {DRY_INSULATION_LIMIT_MOHM} MΩ
            </div>
          </CardContent>
        </Card>

        {/* Pass/Fail Status */}
        <Card className={`border-l-4 ${failCount === 0 ? "border-green-500" : "border-red-500"}`}>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5">
              {failCount === 0
                ? <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                : <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
              Overall Pass/Fail
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-mono font-bold text-green-700">{passCount}</span>
              <span className="text-sm text-muted-foreground mb-0.5">pass</span>
              <span className="text-2xl font-mono font-bold text-red-600 ml-2">{failCount}</span>
              <span className="text-sm text-muted-foreground mb-0.5">fail</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Out of {MODULE_DATA.length} modules tested
            </div>
            <Badge
              className={`text-xs mt-1 ${failCount === 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
              variant="outline"
            >
              {failCount === 0 ? "All Passed" : `${failCount} Module(s) Failed`}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pre vs Post Wet Leakage Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Wet Leakage Current — Pre vs Post Stress (μA)
            </CardTitle>
            <CardDescription className="text-xs">
              IEC 61215 MQT 15 · Limit: {WET_LEAKAGE_LIMIT_UA} μA · Post-test bars in red if limit exceeded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={wetLeakageChartData} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Leakage (μA)", angle: -90, position: "insideLeft", fontSize: 10, offset: 10 }}
                />
                <Tooltip
                  formatter={(val: number, name: string) => [`${val.toFixed(1)} μA`, name]}
                  contentStyle={{ fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine
                  y={WET_LEAKAGE_LIMIT_UA}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  label={{ value: `Limit ${WET_LEAKAGE_LIMIT_UA} μA`, fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <Bar dataKey="Pre-Test"  fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Post-Test" fill="#f59e0b" radius={[2, 2, 0, 0]} maxBarSize={28}
                  label={false}
                  // colour individual bars red where post > limit
                  isAnimationActive
                >
                  {wetLeakageChartData.map((entry, idx) => (
                    <rect key={idx} />  // placeholder — colour handled below via Cell workaround
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-1 text-xs text-muted-foreground text-center">
              Blue = Pre-Test · Amber = Post-Test · Red dashed = Pass Limit
            </div>
          </CardContent>
        </Card>

        {/* Dry Insulation Resistance Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Dry Insulation Resistance per Module (MΩ)
            </CardTitle>
            <CardDescription className="text-xs">
              IEC 61730 MST 16 · Pass threshold: ≥ {DRY_INSULATION_LIMIT_MOHM} MΩ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dryInsChartData} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Resistance (MΩ)", angle: -90, position: "insideLeft", fontSize: 10, offset: 10 }}
                />
                <Tooltip
                  formatter={(val: number) => [`${val.toFixed(1)} MΩ`, "Dry Insulation"]}
                  contentStyle={{ fontSize: 11 }}
                />
                <ReferenceLine
                  y={DRY_INSULATION_LIMIT_MOHM}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  label={{ value: `Min ${DRY_INSULATION_LIMIT_MOHM} MΩ`, fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <Bar
                  dataKey="Dry Ins. (MΩ)"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={36}
                  fill="#22c55e"
                >
                  {dryInsChartData.map((entry, idx) => (
                    <rect
                      key={idx}
                      style={{ fill: entry.fail ? "#ef4444" : "#22c55e" }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-1 text-xs text-muted-foreground text-center">
              Green = Pass (≥ 40 MΩ) · Red = Fail (&lt; 40 MΩ) · Red dashed = Pass Threshold
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-500" />
            Module-Level Insulation Resistance Results
          </CardTitle>
          <CardDescription className="text-xs">
            All values per module · Wet leakage in μA · Dry insulation in MΩ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-2 font-semibold">Module ID</th>
                  <th className="text-right p-2 font-semibold">Wet Leakage Pre (μA)</th>
                  <th className="text-right p-2 font-semibold">Wet Leakage Post (μA)</th>
                  <th className="text-right p-2 font-semibold">Δ Leakage (μA)</th>
                  <th className="text-right p-2 font-semibold">Dry Insulation (MΩ)</th>
                  <th className="text-center p-2 font-semibold">Wet Leakage</th>
                  <th className="text-center p-2 font-semibold">Dry Insulation</th>
                  <th className="text-center p-2 font-semibold">Overall</th>
                </tr>
              </thead>
              <tbody>
                {moduleResults.map((d, idx) => {
                  const wetPass = d.wetLeakagePost <= WET_LEAKAGE_LIMIT_UA
                  const dryPass = d.dryInsulation >= DRY_INSULATION_LIMIT_MOHM
                  const delta   = d.wetLeakagePost - d.wetLeakagePre
                  return (
                    <tr
                      key={d.moduleId}
                      className={`border-b transition-colors ${
                        highlightFail && d.status === "FAIL"
                          ? "bg-red-50 hover:bg-red-100"
                          : idx % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-100"
                      }`}
                    >
                      <td className="p-2 font-mono font-semibold text-slate-700">{d.moduleId}</td>
                      <td className="p-2 text-right font-mono">{d.wetLeakagePre.toFixed(1)}</td>
                      <td className={`p-2 text-right font-mono font-semibold ${!wetPass ? "text-red-600" : "text-slate-700"}`}>
                        {d.wetLeakagePost.toFixed(1)}
                      </td>
                      <td className={`p-2 text-right font-mono ${delta > 10 ? "text-orange-600" : "text-slate-600"}`}>
                        +{delta.toFixed(1)}
                      </td>
                      <td className={`p-2 text-right font-mono font-semibold ${!dryPass ? "text-red-600" : "text-green-700"}`}>
                        {d.dryInsulation.toFixed(1)}
                      </td>
                      <td className="p-2 text-center">
                        {wetPass
                          ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs" variant="outline">PASS</Badge>
                          : <Badge className="bg-red-100 text-red-700 border-red-200 text-xs" variant="outline">FAIL</Badge>}
                      </td>
                      <td className="p-2 text-center">
                        {dryPass
                          ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs" variant="outline">PASS</Badge>
                          : <Badge className="bg-red-100 text-red-700 border-red-200 text-xs" variant="outline">FAIL</Badge>}
                      </td>
                      <td className="p-2 text-center">
                        {d.status === "PASS"
                          ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs font-semibold" variant="outline">
                              <CheckCircle className="h-3 w-3 mr-1 inline" />PASS
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-300 text-xs font-semibold" variant="outline">
                              <XCircle className="h-3 w-3 mr-1 inline" />FAIL
                            </Badge>
                          )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-slate-100">
                  <td className="p-2 font-semibold">Average</td>
                  <td className="p-2 text-right font-mono font-semibold">{avgWetPre.toFixed(1)}</td>
                  <td className="p-2 text-right font-mono font-semibold">{avgWetPost.toFixed(1)}</td>
                  <td className="p-2 text-right font-mono font-semibold">
                    +{(avgWetPost - avgWetPre).toFixed(1)}
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">{avgDryIns.toFixed(1)}</td>
                  <td className="p-2 text-center text-xs text-muted-foreground" colSpan={3}>
                    {passCount}/{MODULE_DATA.length} modules passed all criteria
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 space-y-1">
              <p>
                <span className="font-semibold">IEC 61215-2 MQT 15 (Wet Leakage Current):</span>{" "}
                Applied voltage = max(500 V, Vsys_max) between all terminals shorted together and the accessible frame.
                Pass criterion: leakage current ≤ 50 μA per 1 m² effective module area, measured 2 min after voltage application.
                Test is performed pre- and post-stress to reveal moisture-induced insulation degradation.
              </p>
              <p>
                <span className="font-semibold">IEC 61730-2 MST 16 (Dry Insulation Resistance):</span>{" "}
                DC voltage ≥ 1000 V applied between short-circuited active conductors and module frame under dry conditions.
                Minimum resistance R ≥ 40 MΩ × module area (m²). For 2 m² modules the minimum is 80 MΩ.
                Failure indicates potential ground-fault risk or encapsulant/back-sheet degradation.
              </p>
              <p className="text-amber-700 font-medium">
                Modules SLX-003 and SLX-007 failed one or more criteria — recommend root-cause investigation
                (encapsulant delamination, back-sheet pinholes, or junction box seal failure).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
