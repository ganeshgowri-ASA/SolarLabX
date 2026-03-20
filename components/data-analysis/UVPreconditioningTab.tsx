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
import { Sun, Activity, TrendingDown, CheckCircle2 } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Demo Data ────────────────────────────────────────────────────────────────

// 6 modules tracked at UV dose intervals (kWh/m²)
const MODULE_IDS = ["M1", "M2", "M3", "M4", "M5", "M6"]

// Cumulative UV dose checkpoints (kWh/m²) — total UVA+UVB
const DOSE_POINTS = [0, 5, 10, 15, 20]

// Pmax change (%) at each dose checkpoint — negative = degradation
const PMAX_PROFILES: Record<string, number[]> = {
  M1: [0, -0.3, -0.6, -0.9, -1.1],
  M2: [0, -0.5, -0.9, -1.3, -1.5],
  M3: [0, -0.2, -0.4, -0.7, -0.8],
  M4: [0, -0.8, -1.5, -2.3, -3.1],
  M5: [0, -0.4, -0.7, -1.0, -1.2],
  M6: [0, -0.3, -0.5, -0.8, -0.9],
}

// IEC 61215 MQT 10 pass limit: Pmax change ≤ 5%
const PMAX_LIMIT = -5.0

// Yellowing index (YI) before and after exposure
interface ModuleSummary {
  id: string
  uvaReceived: number    // kWh/m²
  uvbReceived: number    // kWh/m²
  yiBefore: number
  yiAfter: number
  yiChange: number
  pmaxChangePct: number
  visualInspection: string
  result: "PASS" | "FAIL"
}

const MODULE_SUMMARIES: ModuleSummary[] = [
  {
    id: "M1",
    uvaReceived: 15.0,
    uvbReceived: 5.0,
    yiBefore: 1.2,
    yiAfter: 3.8,
    yiChange: 2.6,
    pmaxChangePct: -1.1,
    visualInspection: "No discolouration — uniform surface",
    result: "PASS",
  },
  {
    id: "M2",
    uvaReceived: 15.0,
    uvbReceived: 5.0,
    yiBefore: 1.5,
    yiAfter: 4.6,
    yiChange: 3.1,
    pmaxChangePct: -1.5,
    visualInspection: "Minor yellowing at edges — acceptable",
    result: "PASS",
  },
  {
    id: "M3",
    uvaReceived: 15.0,
    uvbReceived: 5.0,
    yiBefore: 1.1,
    yiAfter: 3.2,
    yiChange: 2.1,
    pmaxChangePct: -0.8,
    visualInspection: "No discolouration — uniform surface",
    result: "PASS",
  },
  {
    id: "M4",
    uvaReceived: 15.0,
    uvbReceived: 5.0,
    yiBefore: 1.8,
    yiAfter: 7.4,
    yiChange: 5.6,
    pmaxChangePct: -3.1,
    visualInspection: "Visible yellowing — EVA discolouration detected",
    result: "PASS",
  },
  {
    id: "M5",
    uvaReceived: 15.0,
    uvbReceived: 5.0,
    yiBefore: 1.3,
    yiAfter: 4.0,
    yiChange: 2.7,
    pmaxChangePct: -1.2,
    visualInspection: "Slight yellowing at frame edges — within tolerance",
    result: "PASS",
  },
  {
    id: "M6",
    uvaReceived: 15.0,
    uvbReceived: 5.0,
    yiBefore: 1.0,
    yiAfter: 3.3,
    yiChange: 2.3,
    pmaxChangePct: -0.9,
    visualInspection: "No discolouration — uniform surface",
    result: "PASS",
  },
]

// Line chart data: dose vs Pmax change per module
const pmaxTimeSeries = DOSE_POINTS.map((dose) => {
  const point: Record<string, number> = { dose }
  MODULE_IDS.forEach((id) => {
    point[id] = PMAX_PROFILES[id][DOSE_POINTS.indexOf(dose)]
  })
  return point
})

// Bar chart data: yellowing index change per module (before & after)
const yiBarData = MODULE_SUMMARIES.map((m) => ({
  moduleId: m.id,
  "YI Before": m.yiBefore,
  "YI After": m.yiAfter,
}))

// Module line colours
const MODULE_COLORS: Record<string, string> = {
  M1: "#3b82f6",
  M2: "#22c55e",
  M3: "#8b5cf6",
  M4: "#ef4444",
  M5: "#f59e0b",
  M6: "#06b6d4",
}

// KPI summary
const totalUVADose = 15.0
const totalUVBDose = 5.0
const maxYIChange = Math.max(...MODULE_SUMMARIES.map((m) => m.yiChange))
const maxPmaxChange = Math.min(...MODULE_SUMMARIES.map((m) => m.pmaxChangePct))
const allPass = MODULE_SUMMARIES.every((m) => m.result === "PASS")
const failCount = MODULE_SUMMARIES.filter((m) => m.result === "FAIL").length

// Export data
const exportData = MODULE_SUMMARIES.map((m) => ({
  "Module ID": m.id,
  "UVA Received (kWh/m²)": m.uvaReceived,
  "UVB Received (kWh/m²)": m.uvbReceived,
  "Yellowing Index Before": m.yiBefore,
  "Yellowing Index After": m.yiAfter,
  "YI Change": m.yiChange,
  "Pmax Change (%)": m.pmaxChangePct,
  "Visual Inspection": m.visualInspection,
  Result: m.result,
}))

// ─── Component ────────────────────────────────────────────────────────────────

export function UVPreconditioningTab() {
  return (
    <div className="space-y-4">
      {/* IEC Standard Reference */}
      <IECStandardCard
        standard="IEC 61215 MQT 10"
        title="UV Preconditioning Test — IEC 61215-2 Clause MQT 10"
        testConditions={[
          "UV source: broadband UV lamp (UVA 315–400 nm + UVB 280–315 nm)",
          "Total UVA dose: 15 kWh/m² (minimum); total UVB dose: 5 kWh/m²",
          "Module temperature during exposure: 60 ± 5°C (monitored continuously)",
          "Module mounted at angle to ensure uniform irradiation across active area",
          "Irradiance uniformity: ≥ 80% over test aperture per IEC 61215-2 §4.4",
        ]}
        dosageLevels={[
          "UVA dose target: 15 kWh/m² (monitored by calibrated UV radiometer)",
          "UVB dose target: 5 kWh/m² (monitored by calibrated UV radiometer)",
          "Intermediate checks at 5, 10, 15 kWh/m² total dose milestones",
          "Post-test STC electrical characterisation within 2 hours of exposure end",
        ]}
        passCriteria={[
          { parameter: "Pmax degradation", requirement: "≤ 5% loss vs pre-test STC", note: "IEC 61215-2 §4.4" },
          { parameter: "Visual inspection", requirement: "No delamination, cracking, or severe discolouration", note: "Post-test" },
          { parameter: "Yellowing index", requirement: "Moderate increase acceptable — no severe browning", note: "Informative" },
          { parameter: "UV dose delivered", requirement: "UVA ≥ 15 kWh/m² and UVB ≥ 5 kWh/m²", note: "Minimum requirement" },
          { parameter: "Module temperature", requirement: "60 ± 5°C maintained throughout exposure", note: "Per test spec" },
        ]}
        failCriteria={[
          { parameter: "Pmax > 5% loss", requirement: "Electrical degradation beyond allowable limit → FAIL" },
          { parameter: "Delamination", requirement: "Any visible delamination at encapsulant/cell interface → FAIL" },
          { parameter: "Cracking", requirement: "Glass breakage or cell cracking detected post-test → FAIL" },
        ]}
        notes={[
          "UV preconditioning is typically the first test in the IEC 61215 sequence, performed before damp heat and thermal cycling to activate latent degradation mechanisms.",
          "Yellowing index (ASTM E313) is measured on a representative sample of encapsulant material; an increase indicates photochemical oxidation of EVA or similar.",
          "The 60°C module temperature is critical — lower temperatures slow degradation kinetics and may not adequately stress the encapsulant.",
          "Test is performed on the front face only; rear-facing encapsulants are assessed under separate bifacial test protocols if applicable.",
        ]}
      />

      {/* Export */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "IEC61215_MQT10_UVPreconditioning",
            title: "IEC 61215 MQT 10 — UV Preconditioning Results",
            standard: "IEC 61215 MQT 10",
            description: "Module-level UV dose, yellowing index and Pmax change for UV preconditioning test",
            sheetName: "UV Preconditioning Data",
            orientation: "landscape",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Sun className="h-3.5 w-3.5 text-yellow-500" />
              UVA Dose (kWh/m²)
            </CardDescription>
            <div className="text-2xl font-bold text-yellow-600">{totalUVADose.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Target ≥ 15 kWh/m² — MET</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Sun className="h-3.5 w-3.5 text-orange-500" />
              UVB Dose (kWh/m²)
            </CardDescription>
            <div className="text-2xl font-bold text-orange-600">{totalUVBDose.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Target ≥ 5 kWh/m² — MET</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-amber-500" />
              Yellowing Index Change
            </CardDescription>
            <div className="text-2xl font-bold text-amber-600">+{maxYIChange.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Max ΔYI across all modules</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription className="flex items-center gap-1">
              <TrendingDown className={`h-3.5 w-3.5 ${maxPmaxChange < PMAX_LIMIT ? "text-red-500" : "text-green-500"}`} />
              Max Pmax Change (%)
            </CardDescription>
            <div className={`text-2xl font-bold ${maxPmaxChange < PMAX_LIMIT ? "text-red-600" : "text-green-600"}`}>
              {maxPmaxChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Worst module vs pre-test STC</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Line chart: Cumulative UV dose vs Pmax change */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              Pmax Change vs Cumulative UV Dose
            </CardTitle>
            <CardDescription className="text-xs">
              Pmax change (%) for each module across 0–20 kWh/m² UV dose exposure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={pmaxTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="dose"
                  label={{ value: "Cumulative UV Dose (kWh/m²)", position: "insideBottom", offset: -5, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: "Pmax Change (%)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  domain={[-6, 1]}
                />
                <Tooltip formatter={(v: number, name: string) => [`${v.toFixed(2)}%`, name]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={PMAX_LIMIT}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  label={{ value: "Limit (−5%)", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <ReferenceLine
                  x={15}
                  stroke="#64748b"
                  strokeDasharray="4 2"
                  label={{ value: "MQT 10 target", fill: "#64748b", fontSize: 9, position: "insideTopLeft" }}
                />
                {MODULE_IDS.map((id) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={MODULE_COLORS[id]}
                    strokeWidth={1.5}
                    dot={{ r: 3 }}
                    name={id}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart: Yellowing index before/after per module */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              Yellowing Index — Before vs After UV Exposure
            </CardTitle>
            <CardDescription className="text-xs">
              ASTM E313 yellowing index measured on encapsulant samples pre- and post-exposure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yiBarData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="moduleId"
                  label={{ value: "Module ID", position: "insideBottom", offset: -14, fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{ value: "Yellowing Index (YI)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }}
                  domain={[0, 10]}
                />
                <Tooltip formatter={(v: number, name: string) => [v.toFixed(2), name]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="YI Before" fill="#93c5fd" radius={[3, 3, 0, 0]} name="YI Before" />
                <Bar dataKey="YI After" fill="#f59e0b" radius={[3, 3, 0, 0]} name="YI After" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            Module-Level UV Preconditioning Results
          </CardTitle>
          <CardDescription className="text-xs">
            UV dose received, yellowing index measurements, Pmax change and visual inspection per module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Module ID</th>
                  <th className="py-2 px-2 text-right font-semibold">UVA (kWh/m²)</th>
                  <th className="py-2 px-2 text-right font-semibold">UVB (kWh/m²)</th>
                  <th className="py-2 px-2 text-right font-semibold">YI Before</th>
                  <th className="py-2 px-2 text-right font-semibold">YI After</th>
                  <th className="py-2 px-2 text-right font-semibold">ΔYI</th>
                  <th className="py-2 px-2 text-right font-semibold">Pmax Δ (%)</th>
                  <th className="py-2 px-2 text-left font-semibold">Visual Inspection</th>
                  <th className="py-2 text-center font-semibold">Pass/Fail</th>
                </tr>
              </thead>
              <tbody>
                {MODULE_SUMMARIES.map((mod) => (
                  <tr
                    key={mod.id}
                    className={`border-b hover:bg-muted/50 ${mod.result === "FAIL" ? "bg-red-50/60" : ""}`}
                  >
                    <td className="py-1.5 pr-3 font-mono font-semibold">{mod.id}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{mod.uvaReceived.toFixed(1)}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{mod.uvbReceived.toFixed(1)}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{mod.yiBefore.toFixed(2)}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-amber-700 font-semibold">
                      {mod.yiAfter.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-amber-600">
                      +{mod.yiChange.toFixed(2)}
                    </td>
                    <td
                      className={`py-1.5 px-2 text-right font-mono font-bold ${
                        mod.pmaxChangePct < PMAX_LIMIT ? "text-red-600" : "text-green-700"
                      }`}
                    >
                      {mod.pmaxChangePct.toFixed(2)}%
                    </td>
                    <td className="py-1.5 px-2 text-muted-foreground">{mod.visualInspection}</td>
                    <td className="py-1.5 text-center">
                      <Badge
                        variant={mod.result === "PASS" ? "outline" : "destructive"}
                        className={`text-xs ${
                          mod.result === "PASS"
                            ? "text-green-700 border-green-400 bg-green-50"
                            : ""
                        }`}
                      >
                        {mod.result}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Pass criterion: Pmax degradation ≤ 5% vs pre-test STC; no delamination or cracking on visual inspection.
            YI measured per ASTM E313 on encapsulant witness coupons.
          </p>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61215 MQT 10 — UV Preconditioning Purpose:</span>{" "}
            UV preconditioning is performed to ensure that photochemical degradation of polymeric
            encapsulants (typically EVA) and other UV-sensitive materials is initiated before subsequent
            stress tests such as damp heat (MQT 13) and thermal cycling (MQT 11). A minimum UV dose of
            15 kWh/m² UVA and 5 kWh/m² UVB is required, delivered at a module temperature of 60 ± 5°C.
            This pre-conditioning step activates acetic acid outgassing in EVA-based encapsulants, which
            can accelerate corrosion in later tests, thereby exposing potential quality weaknesses that
            would not be revealed without UV pre-treatment. Yellowing index (ASTM E313) serves as an
            informative indicator of photochemical change in the encapsulant, though it is not a
            standalone pass/fail criterion under IEC 61215-2. The primary electrical acceptance criterion
            is a Pmax change of no more than 5% relative to pre-test STC measurements.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
