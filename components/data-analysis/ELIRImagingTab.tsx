// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Camera, ScanLine, AlertTriangle, CheckCircle2, XCircle, Activity, Eye } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "minor" | "major" | "critical"

interface DefectEntry {
  moduleId: string
  defectsBefore: number
  defectsAfter: number
  newDefects: number
  defectTypes: string[]
  severity: Severity
  result: "PASS" | "FAIL"
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const MODULE_DATA: DefectEntry[] = [
  {
    moduleId: "EL-MOD-001",
    defectsBefore: 0,
    defectsAfter: 1,
    newDefects: 1,
    defectTypes: ["micro-cracks"],
    severity: "minor",
    result: "PASS",
  },
  {
    moduleId: "EL-MOD-002",
    defectsBefore: 1,
    defectsAfter: 3,
    newDefects: 2,
    defectTypes: ["cell cracks", "hot spots"],
    severity: "major",
    result: "FAIL",
  },
  {
    moduleId: "EL-MOD-003",
    defectsBefore: 0,
    defectsAfter: 0,
    newDefects: 0,
    defectTypes: [],
    severity: "minor",
    result: "PASS",
  },
  {
    moduleId: "EL-MOD-004",
    defectsBefore: 2,
    defectsAfter: 5,
    newDefects: 3,
    defectTypes: ["inactive cells", "PID signatures"],
    severity: "critical",
    result: "FAIL",
  },
  {
    moduleId: "EL-MOD-005",
    defectsBefore: 0,
    defectsAfter: 1,
    newDefects: 1,
    defectTypes: ["snail trails"],
    severity: "minor",
    result: "PASS",
  },
  {
    moduleId: "EL-MOD-006",
    defectsBefore: 1,
    defectsAfter: 2,
    newDefects: 1,
    defectTypes: ["micro-cracks"],
    severity: "minor",
    result: "PASS",
  },
  {
    moduleId: "EL-MOD-007",
    defectsBefore: 0,
    defectsAfter: 4,
    newDefects: 4,
    defectTypes: ["cell cracks", "inactive cells"],
    severity: "critical",
    result: "FAIL",
  },
  {
    moduleId: "EL-MOD-008",
    defectsBefore: 1,
    defectsAfter: 2,
    newDefects: 1,
    defectTypes: ["hot spots", "snail trails"],
    severity: "major",
    result: "FAIL",
  },
]

// Defect type counts across all modules (after test)
const DEFECT_TYPE_COUNTS: { type: string; count: number; fill: string }[] = [
  { type: "Micro-cracks",    count: 3, fill: "#f59e0b" },
  { type: "Cell Cracks",     count: 4, fill: "#ef4444" },
  { type: "Inactive Cells",  count: 3, fill: "#7c3aed" },
  { type: "Hot Spots",       count: 2, fill: "#dc2626" },
  { type: "PID Signatures",  count: 2, fill: "#0891b2" },
  { type: "Snail Trails",    count: 2, fill: "#65a30d" },
]

// ─── EL Defect Map ────────────────────────────────────────────────────────────
// 6 rows × 10 columns = 60 cells simulating EL image for EL-MOD-004 (worst case)
// 0 = normal, 1 = minor, 2 = major, 3 = critical
const EL_MAP_ROWS = 6
const EL_MAP_COLS = 10

const EL_CELL_GRID: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 2, 0, 3, 0, 0, 0, 0, 0],
  [0, 0, 2, 3, 3, 0, 1, 0, 2, 0],
  [0, 0, 0, 0, 2, 0, 0, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
]

const CELL_COLOR_MAP: Record<number, string> = {
  0: "bg-green-200 border-green-300",
  1: "bg-yellow-300 border-yellow-400",
  2: "bg-red-400 border-red-500",
  3: "bg-red-800 border-red-900",
}

const CELL_LABEL_MAP: Record<number, string> = {
  0: "Normal",
  1: "Minor",
  2: "Major",
  3: "Critical",
}

// ─── Export Data ──────────────────────────────────────────────────────────────

const exportData = MODULE_DATA.map((m) => ({
  "Module ID": m.moduleId,
  "Defects Before Test": m.defectsBefore,
  "Defects After Test": m.defectsAfter,
  "New Defects": m.newDefects,
  "Defect Types": m.defectTypes.join(", ") || "None",
  "Severity": m.severity,
  "Result": m.result,
}))

// ─── Component ────────────────────────────────────────────────────────────────

export function ELIRImagingTab() {
  const [selectedModule, setSelectedModule] = useState<string>("EL-MOD-004")

  const totalInspected = MODULE_DATA.length
  const totalDefectsFound = useMemo(
    () => MODULE_DATA.reduce((s, m) => s + m.defectsAfter, 0),
    []
  )
  const defectRate = useMemo(
    () => ((MODULE_DATA.filter((m) => m.defectsAfter > 0).length / totalInspected) * 100).toFixed(1),
    []
  )
  const criticalDefects = useMemo(
    () => MODULE_DATA.filter((m) => m.severity === "critical").length,
    []
  )
  const passCount = useMemo(() => MODULE_DATA.filter((m) => m.result === "PASS").length, [])

  return (
    <div className="space-y-4">
      {/* IEC Standard Reference */}
      <IECStandardCard
        standard="IEC 60904-13 / IEC TS 60904-13"
        title="Electroluminescence & Infrared Thermography Imaging — Defect Detection and Classification for PV Modules"
        testConditions={[
          "EL imaging: Forward-biased DC injection at Isc (1×) or 2×Isc under dark conditions",
          "IR thermography: Module under illumination at ≥ 500 W/m², stabilised at operating temperature",
          "Camera resolution: EL ≥ 1 MP (cooled Si CCD / InGaAs); IR ≥ 320×240 pixels (NETD ≤ 50 mK)",
          "Emissivity correction: ε = 0.90 ± 0.02 for glass-encapsulated modules",
          "Ambient temperature: 20°C ± 5°C; wind speed < 2 m/s during IR measurement",
          "Pre-test IV curve at STC to establish baseline Pmax and FF",
        ]}
        dosageLevels={[
          "EL image capture: Pre-test (t=0) and post-test baseline minimum; mid-test optional",
          "IR scan: Full module scan at NMOT operating conditions (steady-state)",
          "Defect mapping: EL image digitised to cell-level grid (rows × columns)",
          "Repeatability: Minimum 3 EL images per module at identical injection current",
        ]}
        passCriteria={[
          { parameter: "New EL dark areas", requirement: "No new inactive cell areas > 1 cm²", note: "Post-test vs pre-test" },
          { parameter: "Crack propagation", requirement: "Micro-cracks: allowed if not causing cell disconnection", note: "IEC 60904-13 §7" },
          { parameter: "IR ΔT (hot spot)", requirement: "ΔT ≤ 20°C above adjacent reference cells", note: "IEC 61215 MQT 09" },
          { parameter: "PID signature area", requirement: "No increase in PID-induced dark patches", note: "Cross-ref IEC 62804" },
          { parameter: "Pmax post-test", requirement: "≤ 5% degradation vs pre-test STC", note: "IEC 61215-2 §4.4" },
        ]}
        failCriteria={[
          { parameter: "Inactive cell area > 1 cm²", requirement: "New area in post-test EL image → FAIL" },
          { parameter: "Cell crack → disconnection", requirement: "Full or partial bus-bar fracture observed in EL" },
          { parameter: "IR ΔT > 20°C", requirement: "Confirmed hot spot: module FAIL (IEC 61215 MQT 09)" },
          { parameter: "Snail trail + corrosion", requirement: "Visual corrosion combined with EL dark finger regions" },
        ]}
        notes={[
          "EL imaging is sensitive to current injection level; results must always state the applied current.",
          "IR thermography must be performed at steady-state irradiance; transient shading clouds invalidate results.",
          "PID signatures appear as uniform darkening of entire cell rows in EL images — distinct from crack patterns.",
          "Snail trails may not appear in EL images but are visible in UV fluorescence imaging (cross-reference IEC 61215 MQT 10).",
          "IEC TS 60904-13:2018 provides the normative test procedure for EL imaging; IEC 62446-3 covers in-situ IR thermography.",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "EL_IR_Imaging_Analysis",
            title: "EL & IR Imaging Analysis — Module Defect Detection Results",
            standard: "IEC 60904-13 / IEC TS 60904-13",
            description: "Electroluminescence and infrared thermography defect inspection results for 8 modules",
            sheetName: "EL-IR Data",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              Total Modules Inspected
            </CardDescription>
            <div className="text-2xl font-bold text-blue-600">{totalInspected}</div>
            <p className="text-xs text-muted-foreground">EL + IR imaging performed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <ScanLine className="h-3.5 w-3.5 text-amber-500" />
              Defects Found
            </CardDescription>
            <div className="text-2xl font-bold text-amber-600">{totalDefectsFound}</div>
            <p className="text-xs text-muted-foreground">Total across all modules (post-test)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-purple-500" />
              Defect Rate (%)
            </CardDescription>
            <div className={`text-2xl font-bold ${parseFloat(defectRate) > 50 ? "text-red-600" : "text-purple-600"}`}>
              {defectRate}%
            </div>
            <p className="text-xs text-muted-foreground">Modules with ≥ 1 defect detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              Critical Defects
            </CardDescription>
            <div className={`text-2xl font-bold ${criticalDefects > 0 ? "text-red-600" : "text-green-600"}`}>
              {criticalDefects}
            </div>
            <p className="text-xs text-muted-foreground">
              Modules with critical-severity findings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Defect Map Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bar chart: Defect count by type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-amber-500" />
              Defect Count by Type (Post-Test)
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregated defect occurrences across all 8 modules after test sequence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={DEFECT_TYPE_COUNTS}
                margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 9 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Count", angle: -90, position: "insideLeft", fontSize: 9 }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [v, "Defect Count"]}
                  labelFormatter={(l) => `Type: ${l}`}
                />
                <Bar dataKey="count" name="Defect Count" radius={[3, 3, 0, 0]}>
                  {DEFECT_TYPE_COUNTS.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DEFECT_TYPE_COUNTS.map((d) => (
                <span
                  key={d.type}
                  className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border"
                  style={{ borderColor: d.fill, color: d.fill, background: `${d.fill}18` }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: d.fill }}
                  />
                  {d.type}: {d.count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* EL Defect Map */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-500" />
              EL Defect Map — {selectedModule}
            </CardTitle>
            <CardDescription className="text-xs">
              Cell-level defect map simulating EL image (6 rows × 10 columns). Select module below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Module selector */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {MODULE_DATA.map((m) => (
                <button
                  key={m.moduleId}
                  onClick={() => setSelectedModule(m.moduleId)}
                  className={`text-xs px-2 py-0.5 rounded border font-mono transition-colors ${
                    selectedModule === m.moduleId
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {m.moduleId.replace("EL-MOD-", "M")}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <div
                className="grid gap-0.5 w-max"
                style={{ gridTemplateColumns: `repeat(${EL_MAP_COLS}, 1.6rem)` }}
              >
                {EL_CELL_GRID.map((row, ri) =>
                  row.map((val, ci) => (
                    <div
                      key={`${ri}-${ci}`}
                      title={`Row ${ri + 1}, Col ${ci + 1}: ${CELL_LABEL_MAP[val]}`}
                      className={`h-6 w-6 rounded-sm border text-center flex items-center justify-center text-[7px] font-bold ${CELL_COLOR_MAP[val]}`}
                    >
                      {val > 0 ? val : ""}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-green-200 border border-green-300" />
                Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-yellow-300 border border-yellow-400" />
                Minor defect
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-red-400 border border-red-500" />
                Major defect
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-red-800 border border-red-900" />
                Critical defect
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Map shown for EL-MOD-004 (worst-case module). Numbers in cells indicate severity level (1=minor, 2=major, 3=critical).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Before / After Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Before / After EL Inspection Results — All Modules
          </CardTitle>
          <CardDescription className="text-xs">
            Defect count and type comparison from pre-test and post-test EL imaging; new defects indicate test-induced degradation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 pr-3 text-left font-semibold">Module ID</th>
                  <th className="py-2 px-2 text-right font-semibold">Defects Before</th>
                  <th className="py-2 px-2 text-right font-semibold">Defects After</th>
                  <th className="py-2 px-2 text-right font-semibold">New Defects</th>
                  <th className="py-2 px-2 text-left font-semibold">Defect Types</th>
                  <th className="py-2 px-2 text-center font-semibold">Severity</th>
                  <th className="py-2 text-center font-semibold">Pass / Fail</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_DATA.map((m, i) => (
                  <tr
                    key={m.moduleId}
                    className={`border-b hover:bg-muted/50 ${
                      m.result === "FAIL"
                        ? m.severity === "critical"
                          ? "bg-red-50/70"
                          : "bg-orange-50/50"
                        : ""
                    }`}
                  >
                    <td className="py-1.5 pr-3 font-mono font-semibold">{m.moduleId}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{m.defectsBefore}</td>
                    <td
                      className={`py-1.5 px-2 text-right font-mono font-semibold ${
                        m.defectsAfter > m.defectsBefore ? "text-red-600" : "text-green-700"
                      }`}
                    >
                      {m.defectsAfter}
                    </td>
                    <td
                      className={`py-1.5 px-2 text-right font-mono font-bold ${
                        m.newDefects > 0 ? "text-amber-600" : "text-green-700"
                      }`}
                    >
                      {m.newDefects > 0 ? `+${m.newDefects}` : "0"}
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground">
                      {m.defectTypes.length > 0 ? m.defectTypes.join(", ") : "—"}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          m.severity === "critical"
                            ? "border-red-500 text-red-700 bg-red-50"
                            : m.severity === "major"
                            ? "border-orange-400 text-orange-700 bg-orange-50"
                            : "border-yellow-400 text-yellow-700 bg-yellow-50"
                        }`}
                      >
                        {m.severity.charAt(0).toUpperCase() + m.severity.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-1.5 text-center">
                      {m.result === "PASS" ? (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-700 border-green-400 bg-green-50 gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          PASS
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="text-xs gap-1"
                        >
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
            Pass criterion: No new inactive cell areas &gt; 1 cm², no cell cracks causing disconnection, IR ΔT ≤ 20°C.{" "}
            {passCount}/{totalInspected} modules passed imaging inspection.
          </div>
        </CardContent>
      </Card>

      {/* Amber reference note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              IEC 60904-13 / IEC TS 60904-13 — EL &amp; IR Imaging Importance:
            </span>{" "}
            Electroluminescence (EL) imaging and Infrared (IR) thermography are complementary non-destructive
            inspection techniques essential for detecting sub-visual defects in crystalline silicon PV modules.
            EL imaging — performed by forward-biasing the module in the dark — reveals micro-cracks, cell fractures,
            inactive cell areas, and PID signatures as dark regions in the luminescence image. IR thermography, conducted
            under operating irradiance, detects hotspots, bypass diode failures, and cell current mismatch as
            elevated-temperature anomalies. Together they provide a comprehensive picture of module integrity both
            before and after qualification stress tests (IEC 61215, IEC 61730). The IEC TS 60904-13 standard
            specifies procedures for EL image acquisition and analysis; IEC 62446-3 governs in-situ IR thermography
            for operating PV systems. Defect classification must reference both techniques to distinguish reversible
            (PID) from irreversible (crack-induced) degradation mechanisms.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
