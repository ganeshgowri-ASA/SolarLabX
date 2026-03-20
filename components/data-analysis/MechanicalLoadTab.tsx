// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts"
import { Weight, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Demo Data ───────────────────────────────────────────────────────────────

const MODULE_DATA = [
  {
    moduleId: "MOD-001",
    frontDeflection: 14.2,
    rearDeflection: 11.8,
    dynamicCycles: 1000,
    elBefore: "Pass",
    elAfter: "Pass",
    frontResult: "Pass",
    rearResult: "Pass",
    overallResult: "Pass",
  },
  {
    moduleId: "MOD-002",
    frontDeflection: 15.7,
    rearDeflection: 12.4,
    dynamicCycles: 1000,
    elBefore: "Pass",
    elAfter: "Pass",
    frontResult: "Pass",
    rearResult: "Pass",
    overallResult: "Pass",
  },
  {
    moduleId: "MOD-003",
    frontDeflection: 13.9,
    rearDeflection: 10.5,
    dynamicCycles: 1000,
    elBefore: "Pass",
    elAfter: "Pass",
    frontResult: "Pass",
    rearResult: "Pass",
    overallResult: "Pass",
  },
  {
    moduleId: "MOD-004",
    frontDeflection: 22.3,
    rearDeflection: 18.1,
    dynamicCycles: 840,
    elBefore: "Pass",
    elAfter: "Fail",
    frontResult: "Fail",
    rearResult: "Fail",
    overallResult: "Fail",
  },
  {
    moduleId: "MOD-005",
    frontDeflection: 16.4,
    rearDeflection: 13.2,
    dynamicCycles: 1000,
    elBefore: "Pass",
    elAfter: "Pass",
    frontResult: "Pass",
    rearResult: "Pass",
    overallResult: "Pass",
  },
  {
    moduleId: "MOD-006",
    frontDeflection: 18.8,
    rearDeflection: 15.6,
    dynamicCycles: 1000,
    elBefore: "Pass",
    elAfter: "Pass",
    frontResult: "Pass",
    rearResult: "Pass",
    overallResult: "Pass",
  },
]

// Dynamic load cycling deflection data (deflection mm vs cycle number)
const DYNAMIC_CYCLE_DATA = [
  { cycle: 0,    MOD001: 0.0, MOD002: 0.0, MOD003: 0.0, MOD004: 0.0, MOD005: 0.0, MOD006: 0.0 },
  { cycle: 50,   MOD001: 4.1, MOD002: 4.5, MOD003: 3.8, MOD004: 5.2, MOD005: 4.3, MOD006: 4.9 },
  { cycle: 100,  MOD001: 5.8, MOD002: 6.2, MOD003: 5.3, MOD004: 7.8, MOD005: 5.9, MOD006: 6.7 },
  { cycle: 200,  MOD001: 7.2, MOD002: 7.9, MOD003: 6.7, MOD004: 10.4, MOD005: 7.5, MOD006: 8.3 },
  { cycle: 300,  MOD001: 8.1, MOD002: 8.8, MOD003: 7.5, MOD004: 12.9, MOD005: 8.4, MOD006: 9.2 },
  { cycle: 400,  MOD001: 8.9, MOD002: 9.6, MOD003: 8.2, MOD004: 15.1, MOD005: 9.2, MOD006: 10.0 },
  { cycle: 500,  MOD001: 9.5, MOD002: 10.2, MOD003: 8.7, MOD004: 17.5, MOD005: 9.8, MOD006: 10.6 },
  { cycle: 600,  MOD001: 10.1, MOD002: 10.8, MOD003: 9.2, MOD004: 19.2, MOD005: 10.3, MOD006: 11.2 },
  { cycle: 700,  MOD001: 10.6, MOD002: 11.3, MOD003: 9.7, MOD004: 20.8, MOD005: 10.8, MOD006: 11.7 },
  { cycle: 800,  MOD001: 11.0, MOD002: 11.8, MOD003: 10.1, MOD004: 22.1, MOD005: 11.2, MOD006: 12.1 },
  { cycle: 900,  MOD001: 11.4, MOD002: 12.2, MOD003: 10.4, MOD004: null, MOD005: 11.6, MOD006: 12.5 },
  { cycle: 1000, MOD001: 11.8, MOD002: 12.6, MOD003: 10.7, MOD004: null, MOD005: 12.0, MOD006: 12.9 },
]

const DEFLECTION_LIMIT = 20 // mm – representative practical acceptance limit

// ─── Component ────────────────────────────────────────────────────────────────

export function MechanicalLoadTab() {
  const [highlightFail, setHighlightFail] = useState(false)

  const deflectionChartData = useMemo(
    () =>
      MODULE_DATA.map((m) => ({
        module: m.moduleId,
        "Front (2400 Pa)": m.frontDeflection,
        "Rear (5400 Pa)": m.rearDeflection,
      })),
    []
  )

  const maxDeflection = useMemo(
    () => Math.max(...MODULE_DATA.map((m) => Math.max(m.frontDeflection, m.rearDeflection))),
    []
  )

  const passCount = MODULE_DATA.filter((m) => m.overallResult === "Pass").length
  const failCount = MODULE_DATA.filter((m) => m.overallResult === "Fail").length
  const elChangeCount = MODULE_DATA.filter((m) => m.elAfter === "Fail").length

  const exportData = MODULE_DATA.map((m) => ({
    "Module ID": m.moduleId,
    "Front Deflection (mm)": m.frontDeflection,
    "Rear Deflection (mm)": m.rearDeflection,
    "Dynamic Cycles": m.dynamicCycles,
    "EL Before": m.elBefore,
    "EL After": m.elAfter,
    "Front Load Result": m.frontResult,
    "Rear Load Result": m.rearResult,
    "Overall Result": m.overallResult,
  }))

  return (
    <div className="space-y-4">
      {/* IEC Standard Reference Card */}
      <IECStandardCard
        standard="IEC 61215 MQT 16"
        title="Mechanical load test — Static and dynamic loading for PV module structural integrity"
        testConditions={[
          "Static front load: 2400 Pa applied uniformly for 1 hour (simulates snow/wind pressure)",
          "Static rear load: 5400 Pa applied uniformly for 1 hour (IEC 61215:2021 increased load)",
          "Dynamic load cycling: ±1000 Pa sinusoidal, 1000 cycles at 0.5 Hz",
          "EL (Electroluminescence) imaging performed before and after each load sequence",
          "Visual inspection after each static load and after dynamic cycling",
        ]}
        dosageLevels={[
          "Front static: 2400 Pa (IEC 61215 MQT 16.1)",
          "Rear static: 5400 Pa (IEC 61215 MQT 16.2)",
          "Dynamic: ±1000 Pa × 1000 cycles (IEC 61215 MQT 16.3)",
          "Deflection measured at centre point and at 9-point grid per IEC 61215 Annex E",
        ]}
        passCriteria={[
          { parameter: "Visual inspection", requirement: "No evidence of major visual defects", note: "Per IEC 61215 §11.1" },
          { parameter: "Pmax degradation", requirement: "≤ 5% relative reduction from pre-test", note: "IEC 61215 §11.3" },
          { parameter: "EL imaging", requirement: "No new inactive cell area; no new cracks spanning full cell", note: "Informative criterion" },
          { parameter: "Deflection", requirement: "Structural integrity maintained; no frame separation", note: "No numeric limit in standard" },
          { parameter: "Insulation resistance", requirement: "MΩ·m² > 40 per IEC 61730 MST 16", note: "Safety sequence" },
        ]}
        failCriteria={[
          { parameter: "Frame/glass failure", requirement: "Any breakage, delamination, or frame separation" },
          { parameter: "EL degradation", requirement: "New cell cracks or inactive areas detected post-test" },
          { parameter: "Pmax > 5%", requirement: "Power loss exceeds allowable threshold" },
          { parameter: "Cycle termination", requirement: "Module fails structurally before completing 1000 cycles" },
        ]}
        notes={[
          "IEC 61215:2021 increased rear static load from 2400 Pa to 5400 Pa vs the 2016 edition",
          "Deflection limits are module-design specific — lab must document acceptance criteria",
          "Dynamic load test is intended to simulate fatigue from wind flutter over module lifetime",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "IEC61215_MQT16_Mechanical_Load",
            title: "Mechanical Load Test Results — IEC 61215 MQT 16",
            standard: "IEC 61215 MQT 16",
            description: "Static and dynamic mechanical load test deflection and EL results",
            sheetName: "Mechanical Load",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Max Deflection</CardDescription>
            <div className={`text-2xl font-bold ${maxDeflection > DEFLECTION_LIMIT ? "text-red-600" : "text-blue-600"}`}>
              {maxDeflection.toFixed(1)} mm
            </div>
            <p className="text-xs text-muted-foreground">Across all modules & loads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Front Load Result</CardDescription>
            <div className="text-2xl font-bold text-green-600">
              {MODULE_DATA.filter((m) => m.frontResult === "Pass").length}/{MODULE_DATA.length}
            </div>
            <p className="text-xs text-muted-foreground">Passed at 2400 Pa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Rear Load Result</CardDescription>
            <div className={`text-2xl font-bold ${MODULE_DATA.filter((m) => m.rearResult === "Fail").length > 0 ? "text-red-600" : "text-green-600"}`}>
              {MODULE_DATA.filter((m) => m.rearResult === "Pass").length}/{MODULE_DATA.length}
            </div>
            <p className="text-xs text-muted-foreground">Passed at 5400 Pa</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>EL Change Status</CardDescription>
            <div className={`text-2xl font-bold ${elChangeCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {elChangeCount > 0 ? `${elChangeCount} Changed` : "No Change"}
            </div>
            <p className="text-xs text-muted-foreground">Post-load EL vs baseline</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bar Chart: Front vs Rear Deflection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Weight className="h-4 w-4 text-blue-500" />
              Static Load Deflection by Module
            </CardTitle>
            <CardDescription className="text-xs">
              Centre-point deflection (mm) at 2400 Pa front and 5400 Pa rear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deflectionChartData} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="module"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Module ID", position: "insideBottom", offset: -12, fontSize: 9 }}
                />
                <YAxis
                  label={{ value: "Deflection (mm)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  domain={[0, 28]}
                />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)} mm`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={DEFLECTION_LIMIT}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "Alert limit", fill: "#ef4444", fontSize: 9, position: "right" }}
                />
                <Bar dataKey="Front (2400 Pa)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Rear (5400 Pa)" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart: Dynamic Load Cycling */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              Dynamic Load Cycling — Deflection vs Cycle
            </CardTitle>
            <CardDescription className="text-xs">
              ±1000 Pa sinusoidal cycling; degradation trend over ~1000 cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={DYNAMIC_CYCLE_DATA} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="cycle"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Cycle Number", position: "insideBottom", offset: -12, fontSize: 9 }}
                />
                <YAxis
                  label={{ value: "Deflection (mm)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  domain={[0, 28]}
                />
                <Tooltip formatter={(v: number) => (v != null ? `${v.toFixed(1)} mm` : "—")} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={DEFLECTION_LIMIT}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "Alert limit", fill: "#ef4444", fontSize: 9, position: "right" }}
                />
                <Line type="monotone" dataKey="MOD001" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="MOD-001" />
                <Line type="monotone" dataKey="MOD002" stroke="#22c55e" strokeWidth={1.5} dot={false} name="MOD-002" />
                <Line type="monotone" dataKey="MOD003" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="MOD-003" />
                <Line
                  type="monotone"
                  dataKey="MOD004"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="MOD-004 (Fail)"
                  strokeDasharray="6 3"
                />
                <Line type="monotone" dataKey="MOD005" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="MOD-005" />
                <Line type="monotone" dataKey="MOD006" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="MOD-006" />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-1 text-xs text-muted-foreground">
              MOD-004 dashed red line terminated at cycle 840 due to structural failure threshold breach.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Module-Level Results Summary</CardTitle>
          <CardDescription className="text-xs">
            Static load deflection, dynamic cycle count, EL before/after, and pass/fail determination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Module ID</th>
                  <th className="py-2 px-2 text-right font-semibold">Front Defl. (mm)</th>
                  <th className="py-2 px-2 text-right font-semibold">Rear Defl. (mm)</th>
                  <th className="py-2 px-2 text-right font-semibold">Dyn. Cycles</th>
                  <th className="py-2 px-2 text-center font-semibold">EL Before</th>
                  <th className="py-2 px-2 text-center font-semibold">EL After</th>
                  <th className="py-2 px-2 text-center font-semibold">Front Load</th>
                  <th className="py-2 px-2 text-center font-semibold">Rear Load</th>
                  <th className="py-2 text-center font-semibold">Overall</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_DATA.map((m) => {
                  const isFail = m.overallResult === "Fail"
                  return (
                    <tr
                      key={m.moduleId}
                      className={`border-b hover:bg-muted/50 ${isFail ? "bg-red-50/60" : ""}`}
                    >
                      <td className="py-1.5 pr-3 font-mono font-semibold">{m.moduleId}</td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${
                          m.frontDeflection > DEFLECTION_LIMIT ? "text-red-600 font-bold" : ""
                        }`}
                      >
                        {m.frontDeflection.toFixed(1)}
                      </td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${
                          m.rearDeflection > DEFLECTION_LIMIT ? "text-red-600 font-bold" : ""
                        }`}
                      >
                        {m.rearDeflection.toFixed(1)}
                      </td>
                      <td
                        className={`py-1.5 px-2 text-right font-mono ${
                          m.dynamicCycles < 1000 ? "text-red-600 font-bold" : "text-green-700"
                        }`}
                      >
                        {m.dynamicCycles}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          {m.elBefore}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            m.elAfter === "Pass"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {m.elAfter}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            m.frontResult === "Pass"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {m.frontResult}
                        </Badge>
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            m.rearResult === "Pass"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {m.rearResult}
                        </Badge>
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
                  <td className="py-1.5 pr-3 font-semibold" colSpan={3}>
                    Summary
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-semibold">
                    {MODULE_DATA.filter((m) => m.dynamicCycles >= 1000).length}/{MODULE_DATA.length} completed
                  </td>
                  <td />
                  <td className="py-1.5 px-2 text-center font-semibold">
                    {elChangeCount > 0 ? (
                      <span className="text-red-600">{elChangeCount} changed</span>
                    ) : (
                      <span className="text-green-700">No change</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center font-semibold">
                    <span className={passCount < MODULE_DATA.length ? "text-red-600" : "text-green-700"}>
                      {MODULE_DATA.filter((m) => m.frontResult === "Pass").length}/{MODULE_DATA.length}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center font-semibold">
                    <span className={MODULE_DATA.filter((m) => m.rearResult === "Fail").length > 0 ? "text-red-600" : "text-green-700"}>
                      {MODULE_DATA.filter((m) => m.rearResult === "Pass").length}/{MODULE_DATA.length}
                    </span>
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
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800 flex gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              <span className="font-semibold">IEC 61215 MQT 16 — Mechanical Load:</span>{" "}
              The static load sequence applies 2400 Pa to the front face and 5400 Pa to the rear face
              (IEC 61215:2021). The dynamic load test cycles ±1000 Pa sinusoidally for 1000 cycles to
              simulate wind-induced fatigue. EL imaging before and after each sequence is used to detect
              new cell cracks or inactive areas. The standard does not specify a numeric deflection limit —
              laboratories must define and document their own acceptance criterion based on module design.
              Failure is declared upon any structural breakage, frame separation, or a Pmax decrease
              exceeding 5% relative to the pre-test measurement.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
