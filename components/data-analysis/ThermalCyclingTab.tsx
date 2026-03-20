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
import { Thermometer, CheckCircle, XCircle, AlertTriangle, Zap } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Demo Data ────────────────────────────────────────────────────────────────

const MODULE_DATA = [
  {
    moduleId: "TC-MOD-001",
    initialPmax: 400.2,
    pmax50: 399.1,
    pmax100: 397.8,
    pmax150: 396.4,
    pmax200: 395.5,
    totalDegradation: 1.17,
    elBefore: "Pass",
    elAfter: "Pass",
    insulationResistance: 312.4,
    overallResult: "Pass",
  },
  {
    moduleId: "TC-MOD-002",
    initialPmax: 401.5,
    pmax50: 400.2,
    pmax100: 398.6,
    pmax150: 397.1,
    pmax200: 396.2,
    totalDegradation: 1.32,
    elBefore: "Pass",
    elAfter: "Pass",
    insulationResistance: 298.7,
    overallResult: "Pass",
  },
  {
    moduleId: "TC-MOD-003",
    initialPmax: 399.8,
    pmax50: 398.4,
    pmax100: 396.7,
    pmax150: 395.0,
    pmax200: 393.9,
    totalDegradation: 1.48,
    elBefore: "Pass",
    elAfter: "Pass",
    insulationResistance: 275.1,
    overallResult: "Pass",
  },
  {
    moduleId: "TC-MOD-004",
    initialPmax: 402.1,
    pmax50: 399.5,
    pmax100: 395.3,
    pmax150: 389.8,
    pmax200: 381.2,
    totalDegradation: 5.20,
    elBefore: "Pass",
    elAfter: "Fail",
    insulationResistance: 42.3,
    overallResult: "Fail",
  },
  {
    moduleId: "TC-MOD-005",
    initialPmax: 400.9,
    pmax50: 399.8,
    pmax100: 398.3,
    pmax150: 396.9,
    pmax200: 395.8,
    totalDegradation: 1.27,
    elBefore: "Pass",
    elAfter: "Pass",
    insulationResistance: 305.6,
    overallResult: "Pass",
  },
  {
    moduleId: "TC-MOD-006",
    initialPmax: 398.7,
    pmax50: 397.5,
    pmax100: 396.0,
    pmax150: 394.5,
    pmax200: 393.5,
    totalDegradation: 1.31,
    elBefore: "Pass",
    elAfter: "Pass",
    insulationResistance: 288.9,
    overallResult: "Pass",
  },
]

// Pmax retention % vs cycle number per module
const PMAX_RETENTION_DATA = [
  {
    cycle: 0,
    "TC-MOD-001": 100.00,
    "TC-MOD-002": 100.00,
    "TC-MOD-003": 100.00,
    "TC-MOD-004": 100.00,
    "TC-MOD-005": 100.00,
    "TC-MOD-006": 100.00,
  },
  {
    cycle: 50,
    "TC-MOD-001": 99.72,
    "TC-MOD-002": 99.67,
    "TC-MOD-003": 99.65,
    "TC-MOD-004": 99.35,
    "TC-MOD-005": 99.73,
    "TC-MOD-006": 99.70,
  },
  {
    cycle: 100,
    "TC-MOD-001": 99.40,
    "TC-MOD-002": 99.28,
    "TC-MOD-003": 99.22,
    "TC-MOD-004": 98.32,
    "TC-MOD-005": 99.35,
    "TC-MOD-006": 99.32,
  },
  {
    cycle: 150,
    "TC-MOD-001": 99.05,
    "TC-MOD-002": 98.90,
    "TC-MOD-003": 98.80,
    "TC-MOD-004": 97.09,
    "TC-MOD-005": 98.99,
    "TC-MOD-006": 98.94,
  },
  {
    cycle: 200,
    "TC-MOD-001": 98.83,
    "TC-MOD-002": 98.68,
    "TC-MOD-003": 98.52,
    "TC-MOD-004": 94.80,
    "TC-MOD-005": 98.73,
    "TC-MOD-006": 98.69,
  },
]

// EL defect count before/after thermal cycling per module
const EL_DEFECT_DATA = MODULE_DATA.map((m) => ({
  module: m.moduleId.replace("TC-", ""),
  "EL Before": m.moduleId === "TC-MOD-004" ? 0 : 0,
  "EL After": m.moduleId === "TC-MOD-004" ? 5 : m.totalDegradation > 1.4 ? 1 : 0,
}))

const PMAX_THRESHOLD = 95 // % retention pass limit

// ─── Component ────────────────────────────────────────────────────────────────

export function ThermalCyclingTab() {
  const passCount = MODULE_DATA.filter((m) => m.overallResult === "Pass").length
  const failCount = MODULE_DATA.filter((m) => m.overallResult === "Fail").length
  const elChangedCount = MODULE_DATA.filter((m) => m.elAfter === "Fail").length
  const maxDegradation = useMemo(
    () => Math.max(...MODULE_DATA.map((m) => m.totalDegradation)),
    []
  )

  const exportData = MODULE_DATA.map((m) => ({
    "Module ID": m.moduleId,
    "Initial Pmax (W)": m.initialPmax,
    "Pmax @ 50 Cycles (W)": m.pmax50,
    "Pmax @ 100 Cycles (W)": m.pmax100,
    "Pmax @ 150 Cycles (W)": m.pmax150,
    "Pmax @ 200 Cycles (W)": m.pmax200,
    "Total Degradation (%)": m.totalDegradation,
    "EL Before": m.elBefore,
    "EL After": m.elAfter,
    "Insulation Resistance (MΩ·m²)": m.insulationResistance,
    "Overall Result": m.overallResult,
  }))

  return (
    <div className="space-y-4">
      {/* IEC Standard Reference Card */}
      <IECStandardCard
        standard="IEC 61215 MQT 11"
        title="Thermal cycling test — Assessment of PV module ability to withstand thermal fatigue from repeated temperature cycling"
        testConditions={[
          "Temperature range: -40°C to +85°C (ΔT = 125°C per cycle)",
          "Total cycles: 200 (TC200 sequence per IEC 61215:2021)",
          "Cycle duration: approximately 6 hours per complete cycle",
          "Current injection: module operated at Isc during heating phase to assess solder joint integrity",
          "Ramp rate: ≤ 100°C/hour for heating and cooling transitions",
          "Dwell time: ≥ 10 minutes at each temperature extreme",
        ]}
        dosageLevels={[
          "TC50: 50 cycles — used as intermediate checkpoint in combined sequence",
          "TC200: 200 cycles — primary qualification sequence for MQT 11",
          "TC400/TC600: extended stress levels for enhanced reliability programs (not mandatory)",
          "Current injection level: Isc ± 2% throughout thermal exposure",
        ]}
        passCriteria={[
          { parameter: "Pmax degradation", requirement: "≤ 5% relative reduction from pre-test value", note: "IEC 61215 §11.3" },
          { parameter: "Visual inspection", requirement: "No major visual defects (cracking, delamination, bubbling)", note: "Per IEC 61215 §11.1" },
          { parameter: "EL imaging", requirement: "No new inactive cell areas exceeding acceptance criteria", note: "Informative" },
          { parameter: "Insulation resistance", requirement: "≥ 40 MΩ·m² (IEC 61730 MST 16 sequence)", note: "Safety criterion" },
          { parameter: "Wet leakage current", requirement: "No evidence of moisture ingress path to active circuit", note: "Post-test check" },
        ]}
        failCriteria={[
          { parameter: "Pmax > 5%", requirement: "Power loss exceeds 5% relative to initial measurement" },
          { parameter: "Solder joint failure", requirement: "Open circuit or severe resistance increase in interconnects" },
          { parameter: "EL new defects", requirement: "New cracks or inactive areas detected post-TC200" },
          { parameter: "Insulation failure", requirement: "Insulation resistance below 40 MΩ·m²" },
          { parameter: "Physical damage", requirement: "Visible delamination, encapsulant discolouration, or glass breakage" },
        ]}
        notes={[
          "IEC 61215 MQT 11 thermal cycling is one of the most discriminating tests for solder joint and ribbon fatigue",
          "Current injection during cycling accelerates Joule heating at degraded solder bonds, revealing latent failures",
          "TC200 is the standard qualification level; some reliability programs use TC400 or TC600 for harsh climates",
          "Combined sequence: TC50 is performed before and after Humidity-Freeze (MQT 12) in the IEC 61215 test sequence",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "IEC61215_MQT11_Thermal_Cycling",
            title: "Thermal Cycling Test Results — IEC 61215 MQT 11",
            standard: "IEC 61215 MQT 11",
            description: "Pmax retention, EL comparison, and insulation resistance after 200 thermal cycles (-40°C to +85°C)",
            sheetName: "Thermal Cycling",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Temperature Range</CardDescription>
            <div className="text-2xl font-bold text-blue-600">-40 to 85°C</div>
            <p className="text-xs text-muted-foreground">ΔT = 125°C per cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Total Cycles</CardDescription>
            <div className="text-2xl font-bold text-purple-600">200</div>
            <p className="text-xs text-muted-foreground">TC200 @ ~6 h/cycle</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Max Pmax Degradation</CardDescription>
            <div
              className={`text-2xl font-bold ${
                maxDegradation > 5 ? "text-red-600" : maxDegradation > 3 ? "text-amber-600" : "text-green-600"
              }`}
            >
              {maxDegradation.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Limit: ≤ 5% relative</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>EL Comparison Status</CardDescription>
            <div
              className={`text-2xl font-bold ${
                elChangedCount > 0 ? "text-red-600" : "text-green-600"
              }`}
            >
              {elChangedCount > 0 ? `${elChangedCount} Changed` : "No Change"}
            </div>
            <p className="text-xs text-muted-foreground">Post-TC200 vs baseline</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line Chart: Pmax Retention vs Cycle Number */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Pmax Retention vs Cycle Number
            </CardTitle>
            <CardDescription className="text-xs">
              Normalised Pmax retention (%) for all modules across TC200 sequence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart
                data={PMAX_RETENTION_DATA}
                margin={{ top: 8, right: 16, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="cycle"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Cycle Number", position: "insideBottom", offset: -12, fontSize: 9 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  domain={[93, 100.5]}
                  label={{ value: "Pmax Retention (%)", angle: -90, position: "insideLeft", fontSize: 9 }}
                />
                <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={PMAX_THRESHOLD}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "95% limit", fill: "#ef4444", fontSize: 9, position: "right" }}
                />
                <Line type="monotone" dataKey="TC-MOD-001" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} name="TC-MOD-001" />
                <Line type="monotone" dataKey="TC-MOD-002" stroke="#22c55e" strokeWidth={1.5} dot={{ r: 3 }} name="TC-MOD-002" />
                <Line type="monotone" dataKey="TC-MOD-003" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} name="TC-MOD-003" />
                <Line
                  type="monotone"
                  dataKey="TC-MOD-004"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="TC-MOD-004 (Fail)"
                  strokeDasharray="6 3"
                />
                <Line type="monotone" dataKey="TC-MOD-005" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} name="TC-MOD-005" />
                <Line type="monotone" dataKey="TC-MOD-006" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 3 }} name="TC-MOD-006" />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              TC-MOD-004 (dashed red) dropped below 95% threshold — solder joint fatigue suspected.
            </p>
          </CardContent>
        </Card>

        {/* Bar Chart: EL Defect Count Before/After */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              EL Defect Count — Before vs After TC200
            </CardTitle>
            <CardDescription className="text-xs">
              Electroluminescence inactive-cell defect count per module pre- and post-thermal cycling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={EL_DEFECT_DATA}
                margin={{ top: 8, right: 16, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Module ID", position: "insideBottom", offset: -12, fontSize: 9 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Defect Count", angle: -90, position: "insideLeft", fontSize: 9 }}
                  allowDecimals={false}
                  domain={[0, 7]}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="EL Before" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="EL After" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              TC-MOD-004 shows 5 new inactive areas post-TC200. All other modules show no new EL defects.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Module-Level Thermal Cycling Results</CardTitle>
          <CardDescription className="text-xs">
            Initial Pmax, Pmax at each measurement interval, total degradation %, EL before/after,
            insulation resistance, and pass/fail determination per IEC 61215 MQT 11
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Module ID</th>
                  <th className="py-2 px-2 text-right font-semibold">Initial Pmax (W)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ 50 cyc (W)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ 100 cyc (W)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ 150 cyc (W)</th>
                  <th className="py-2 px-2 text-right font-semibold">@ 200 cyc (W)</th>
                  <th className="py-2 px-2 text-right font-semibold">Degradation (%)</th>
                  <th className="py-2 px-2 text-center font-semibold">EL Before</th>
                  <th className="py-2 px-2 text-center font-semibold">EL After</th>
                  <th className="py-2 px-2 text-right font-semibold">Ins. R (MΩ·m²)</th>
                  <th className="py-2 text-center font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_DATA.map((m) => {
                  const isFail = m.overallResult === "Fail"
                  const degradFail = m.totalDegradation > 5
                  return (
                    <tr
                      key={m.moduleId}
                      className={`border-b hover:bg-muted/50 ${isFail ? "bg-red-50/60 dark:bg-red-950/10" : ""}`}
                    >
                      <td className="py-1.5 pr-3 font-mono font-semibold">{m.moduleId}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.initialPmax.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.pmax50.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.pmax100.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.pmax150.toFixed(1)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">{m.pmax200.toFixed(1)}</td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono font-semibold ${
                          degradFail ? "text-red-600" : m.totalDegradation > 3 ? "text-amber-600" : "text-green-700"
                        }`}
                      >
                        {m.totalDegradation.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                        >
                          {m.elBefore}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            m.elAfter === "Pass"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
                          }`}
                        >
                          {m.elAfter}
                        </Badge>
                      </td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${
                          m.insulationResistance < 40 ? "text-red-600 font-bold" : "text-green-700"
                        }`}
                      >
                        {m.insulationResistance.toFixed(1)}
                      </td>
                      <td className="py-1.5 text-center">
                        {m.overallResult === "Pass" ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t bg-muted/30">
                  <td className="py-1.5 pr-3 font-semibold" colSpan={6}>
                    Summary
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-semibold ${
                      maxDegradation > 5 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    Max: {maxDegradation.toFixed(2)}%
                  </td>
                  <td />
                  <td className="py-1.5 px-2 text-center font-semibold">
                    {elChangedCount > 0 ? (
                      <span className="text-red-600">{elChangedCount} changed</span>
                    ) : (
                      <span className="text-green-700">No change</span>
                    )}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-semibold ${
                      MODULE_DATA.some((m) => m.insulationResistance < 40) ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    Min: {Math.min(...MODULE_DATA.map((m) => m.insulationResistance)).toFixed(1)}
                  </td>
                  <td className="py-1.5 text-center font-semibold">
                    <span className={failCount > 0 ? "text-red-600" : "text-green-700"}>
                      {passCount}/{MODULE_DATA.length} Pass
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-800">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800 dark:text-amber-300 flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              <span className="font-semibold">IEC 61215 MQT 11 — Thermal Cycling:</span>{" "}
              The thermal cycling test subjects modules to 200 complete cycles between -40°C and +85°C
              (ΔT = 125°C) at a ramp rate not exceeding 100°C/hour with a minimum 10-minute dwell at
              each extreme. Current injection at Isc is applied during the heating phase to introduce
              Joule heating at interconnect interfaces, accelerating detection of solder joint fatigue and
              ribbon bond failures. Pass criteria require Pmax degradation ≤ 5% relative to the initial
              measurement, no new EL inactive cell areas, and insulation resistance ≥ 40 MΩ·m² per
              IEC 61730 MST 16. TC200 forms part of the full IEC 61215 qualification sequence, where it
              is also conducted as TC50 before and after Humidity-Freeze (MQT 12).
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
