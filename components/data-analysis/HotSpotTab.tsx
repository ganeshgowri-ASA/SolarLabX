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
import { Thermometer, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Demo Data ───────────────────────────────────────────────────────────────

// 6 cells measured at 0,1,2,3,4,5 hours
// Cell C4 is the worst-case (highest temp rise), simulating a shading-induced hotspot
const CELL_IDS = ["C1", "C2", "C3", "C4 (WC)", "C5", "C6"]

const TIME_HOURS = [0, 1, 2, 3, 4, 5]

// Temperature rise (ΔT) in °C for each cell at each hour
const CELL_TEMP_RISE_PROFILES: Record<string, number[]> = {
  "C1":       [0,  8.2, 10.4, 11.1, 11.6, 11.8],
  "C2":       [0,  6.7,  8.9,  9.4,  9.7,  9.9],
  "C3":       [0,  9.1, 12.3, 13.0, 13.4, 13.5],
  "C4 (WC)": [0, 18.4, 27.6, 31.2, 33.8, 34.7],
  "C5":       [0,  7.5,  9.8, 10.2, 10.6, 10.8],
  "C6":       [0,  5.9,  7.4,  7.8,  8.0,  8.1],
}

// Pass threshold per IEC 61215 MQT 09: ΔT must not exceed 20°C above the reference cell
const HOTSPOT_THRESHOLD = 20

// Build time-series data for line chart
const tempRiseTimeSeries = TIME_HOURS.map((h) => {
  const point: Record<string, number> = { hour: h }
  CELL_IDS.forEach((id) => {
    point[id] = CELL_TEMP_RISE_PROFILES[id][h]
  })
  return point
})

// Build per-cell summary for bar chart and table
interface CellSummary {
  cellId: string
  initialTemp: number
  maxTemp: number
  tempRise: number
  duration: number
  irThermography: string
  result: "PASS" | "FAIL"
}

const CELL_SUMMARIES: CellSummary[] = [
  { cellId: "C1",       initialTemp: 45.0, maxTemp: 56.8, tempRise: 11.8, duration: 5, irThermography: "Uniform — no anomaly",           result: "PASS" },
  { cellId: "C2",       initialTemp: 45.0, maxTemp: 54.9, tempRise:  9.9, duration: 5, irThermography: "Uniform — no anomaly",           result: "PASS" },
  { cellId: "C3",       initialTemp: 45.0, maxTemp: 58.5, tempRise: 13.5, duration: 5, irThermography: "Minor warm spot — within limit", result: "PASS" },
  { cellId: "C4 (WC)", initialTemp: 45.0, maxTemp: 79.7, tempRise: 34.7, duration: 5, irThermography: "Hot spot detected — cell crack",  result: "FAIL" },
  { cellId: "C5",       initialTemp: 45.0, maxTemp: 55.8, tempRise: 10.8, duration: 5, irThermography: "Uniform — no anomaly",           result: "PASS" },
  { cellId: "C6",       initialTemp: 45.0, maxTemp: 53.1, tempRise:  8.1, duration: 5, irThermography: "Uniform — no anomaly",           result: "PASS" },
]

// Bar chart data: max temp rise per cell
const barData = CELL_SUMMARIES.map((c) => ({
  cellId: c.cellId,
  "Max ΔT (°C)": c.tempRise,
  fill: c.result === "FAIL" ? "#ef4444" : "#3b82f6",
}))

// Cell line colours
const CELL_COLORS: Record<string, string> = {
  "C1":       "#3b82f6",
  "C2":       "#22c55e",
  "C3":       "#8b5cf6",
  "C4 (WC)": "#ef4444",
  "C5":       "#f59e0b",
  "C6":       "#06b6d4",
}

// Worst-case cell
const worstCell = CELL_SUMMARIES.find((c) => c.result === "FAIL")!
const maxTempRise = worstCell.tempRise
const allPass = CELL_SUMMARIES.every((c) => c.result === "PASS")

// Export data
const exportData = CELL_SUMMARIES.map((c) => ({
  "Cell ID": c.cellId,
  "Initial Temp (°C)": c.initialTemp,
  "Max Temp (°C)": c.maxTemp,
  "Temp Rise ΔT (°C)": c.tempRise,
  "Duration (h)": c.duration,
  "IR Thermography": c.irThermography,
  "Result": c.result,
}))

// ─── Component ───────────────────────────────────────────────────────────────

export function HotSpotTab() {
  return (
    <div className="space-y-4">
      {/* IEC Standard Reference */}
      <IECStandardCard
        standard="IEC 61215 MQT 09"
        title="Hot Spot Endurance Test — IEC 61215-2 Clause MQT 09"
        testConditions={[
          "Worst-case cell identification via bypass diode shading and IV curve analysis",
          "Irradiance: 1000 W/m² ±10%, module temperature at NMOT or as per test sequence",
          "Duration: 5 hours continuous exposure under worst-case shading condition",
          "IR thermography performed at t = 0 h and t = 5 h minimum; recommended every 1 h",
          "Temperature sensors (PT100/thermocouple) on worst-case cell and three reference cells",
        ]}
        dosageLevels={[
          "5 hours total irradiation at worst-case shading",
          "One complete IV curve sweep per hour per cell string",
          "IR image capture at each hourly interval",
        ]}
        passCriteria={[
          { parameter: "Temp Rise ΔT", requirement: "ΔT ≤ 20°C above reference cell", note: "At any point during 5 h" },
          { parameter: "Visual inspection", requirement: "No cracking, burning, or delamination", note: "Post-test" },
          { parameter: "Pmax degradation", requirement: "≤ 5% loss vs pre-test STC", note: "IEC 61215-2 §4.4" },
          { parameter: "IR thermography", requirement: "No new hot spot pattern formation", note: "Comparison vs t=0" },
        ]}
        failCriteria={[
          { parameter: "Temp Rise ΔT > 20°C", requirement: "Exceeds threshold at worst-case cell → immediate FAIL" },
          { parameter: "Burning / charring", requirement: "Any visible burn mark constitutes a safety FAIL" },
          { parameter: "Pmax > 5% loss", requirement: "Electrical degradation beyond allowable limit" },
        ]}
        notes={[
          "Worst-case cell is determined by the cell with highest mismatch current — typically identified by partial shading the module column-by-column and measuring Isc reduction.",
          "IR thermography must use emissivity-corrected imaging (ε ≈ 0.90 for EVA/glass laminates).",
          "The 5-hour duration is a minimum; some certification bodies require an extended soak.",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "IEC61215_MQT09_HotSpot",
            title: "IEC 61215 MQT 09 — Hot Spot Test Results",
            standard: "IEC 61215 MQT 09",
            description: "Cell-level temperature rise and IR thermography results for hot spot endurance test",
            sheetName: "Hot Spot Data",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Thermometer className="h-3.5 w-3.5 text-red-500" />
              Max Temp Rise (°C)
            </CardDescription>
            <div className={`text-2xl font-bold ${maxTempRise > HOTSPOT_THRESHOLD ? "text-red-600" : "text-green-600"}`}>
              {maxTempRise.toFixed(1)} °C
            </div>
            <p className="text-xs text-muted-foreground">Worst-case cell (ΔT vs ref)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Worst-Case Cell ID
            </CardDescription>
            <div className="text-2xl font-bold text-amber-600">{worstCell.cellId}</div>
            <p className="text-xs text-muted-foreground">Shading-induced mismatch</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              Test Duration (h)
            </CardDescription>
            <div className="text-2xl font-bold text-blue-600">5.0 h</div>
            <p className="text-xs text-muted-foreground">IEC 61215 MQT 09 minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-red-500" />
              Overall Result
            </CardDescription>
            <div className={`text-2xl font-bold ${allPass ? "text-green-600" : "text-red-600"}`}>
              {allPass ? "PASS" : "FAIL"}
            </div>
            <p className="text-xs text-muted-foreground">
              {CELL_SUMMARIES.filter((c) => c.result === "FAIL").length} of {CELL_SUMMARIES.length} cells failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line chart: Temperature rise vs duration */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              Temperature Rise vs Duration (All Cells)
            </CardTitle>
            <CardDescription className="text-xs">
              ΔT (°C) above ambient reference — 5-hour test window
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tempRiseTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="hour"
                  label={{ value: "Duration (h)", position: "insideBottom", offset: -5, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: "ΔT (°C)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  domain={[0, 40]}
                />
                <Tooltip formatter={(v: number, name: string) => [`${v.toFixed(1)} °C`, name]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={HOTSPOT_THRESHOLD}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "Limit (20°C)", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                {CELL_IDS.map((id) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={CELL_COLORS[id]}
                    strokeWidth={id === "C4 (WC)" ? 2.5 : 1.5}
                    strokeDasharray={id === "C4 (WC)" ? undefined : "4 2"}
                    dot={{ r: id === "C4 (WC)" ? 4 : 3 }}
                    name={id}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart: Max ΔT per cell with threshold reference */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Max Temperature Rise per Cell
            </CardTitle>
            <CardDescription className="text-xs">
              Peak ΔT recorded over 5 h — red bars indicate threshold exceedance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="cellId"
                  label={{ value: "Cell ID", position: "insideBottom", offset: -14, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: "Max ΔT (°C)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  domain={[0, 40]}
                />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)} °C`, "Max ΔT"]} />
                <ReferenceLine
                  y={HOTSPOT_THRESHOLD}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "Threshold (20°C)", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <Bar dataKey="Max ΔT (°C)" radius={[3, 3, 0, 0]}>
                  {barData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              Blue = PASS (ΔT ≤ 20°C). Red = FAIL (ΔT &gt; 20°C).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Cell-Level Hot Spot Results
          </CardTitle>
          <CardDescription className="text-xs">
            Temperature measurements and IR thermography findings for each monitored cell
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Cell ID</th>
                  <th className="py-2 px-2 text-right font-semibold">Initial Temp (°C)</th>
                  <th className="py-2 px-2 text-right font-semibold">Max Temp (°C)</th>
                  <th className="py-2 px-2 text-right font-semibold">Temp Rise ΔT (°C)</th>
                  <th className="py-2 px-2 text-right font-semibold">Duration (h)</th>
                  <th className="py-2 px-2 text-left font-semibold">IR Thermography</th>
                  <th className="py-2 text-center font-semibold">Pass/Fail</th>
                </tr>
              </thead>
              <tbody>
                {CELL_SUMMARIES.map((cell) => (
                  <tr
                    key={cell.cellId}
                    className={`border-b hover:bg-muted/50 ${cell.result === "FAIL" ? "bg-red-50/60" : ""}`}
                  >
                    <td className="py-1.5 pr-3 font-mono font-semibold">{cell.cellId}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{cell.initialTemp.toFixed(1)}</td>
                    <td className={`py-1.5 px-2 text-right font-mono font-semibold ${cell.result === "FAIL" ? "text-red-700" : ""}`}>
                      {cell.maxTemp.toFixed(1)}
                    </td>
                    <td className={`py-1.5 px-2 text-right font-mono font-bold ${cell.tempRise > HOTSPOT_THRESHOLD ? "text-red-600" : "text-green-700"}`}>
                      {cell.tempRise.toFixed(1)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">{cell.duration}</td>
                    <td className="py-1.5 px-2 text-muted-foreground">{cell.irThermography}</td>
                    <td className="py-1.5 text-center">
                      <Badge
                        variant={cell.result === "PASS" ? "outline" : "destructive"}
                        className={`text-xs ${cell.result === "PASS" ? "text-green-700 border-green-400 bg-green-50" : ""}`}
                      >
                        {cell.result}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Threshold: ΔT ≤ 20°C above reference cell throughout 5 h duration. WC = Worst Case.
          </p>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61215 MQT 09 — Hot Spot Endurance:</span>{" "}
            The hot spot test is designed to evaluate the ability of a PV module to withstand localised heating
            caused by reverse-biased cells operating in a shaded string. The worst-case cell is identified by
            systematically shading individual cells to maximise the dissipated power in the shaded cell.
            The module must sustain 5 hours of continuous irradiation at the worst-case condition without
            exhibiting a temperature rise exceeding 20°C above the reference (unshaded) cell. Failure is
            indicated by excessive ΔT, visible burning, delamination, or a post-test Pmax degradation greater
            than 5% relative to pre-test STC measurements. IR thermography provides spatial confirmation of
            hot spot location and severity.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
