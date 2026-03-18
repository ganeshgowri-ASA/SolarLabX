// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Cell, PieChart, Pie
} from "recharts"
import { CheckCircle, XCircle, FlaskConical } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"

// ─── Types & Constants ──────────────────────────────────────────────────────

interface PeelPoint {
  position: string
  before: number
  after: number
  unit: string
}

interface LapShearPoint {
  sampleId: string
  before: number
  after: number
}

type FailureMode = "Adhesive" | "Cohesive" | "Interfacial"

const PEEL_PASS_THRESHOLD = 15 // N/cm per IEC 61215 MQT 23

// Sample data: Before avg 45 N/cm, After avg 38 N/cm (84% retention)
function genPeelData(): PeelPoint[] {
  return [
    { position: "Point 1", before: 44.2, after: 37.5, unit: "N/cm" },
    { position: "Point 2", before: 46.1, after: 39.2, unit: "N/cm" },
    { position: "Point 3", before: 43.8, after: 36.8, unit: "N/cm" },
    { position: "Point 4", before: 47.3, after: 40.1, unit: "N/cm" },
    { position: "Point 5", before: 43.6, after: 36.4, unit: "N/cm" },
  ]
}

function genLapShearData(): LapShearPoint[] {
  return [
    { sampleId: "LS-001", before: 8.2, after: 7.1 },
    { sampleId: "LS-002", before: 7.9, after: 6.8 },
    { sampleId: "LS-003", before: 8.5, after: 7.4 },
    { sampleId: "LS-004", before: 8.1, after: 6.9 },
    { sampleId: "LS-005", before: 7.7, after: 6.5 },
  ]
}

const FAILURE_MODE_DATA: { mode: FailureMode; count: number; color: string }[] = [
  { mode: "Adhesive", count: 12, color: "#ef4444" },
  { mode: "Cohesive", count: 28, color: "#22c55e" },
  { mode: "Interfacial", count: 8, color: "#f59e0b" },
]

export function AdhesionAnalysis() {
  const peelData = useMemo(() => genPeelData(), [])
  const lapShearData = useMemo(() => genLapShearData(), [])

  // Peel stats
  const peelBeforeAvg = parseFloat((peelData.reduce((s, d) => s + d.before, 0) / peelData.length).toFixed(1))
  const peelAfterAvg = parseFloat((peelData.reduce((s, d) => s + d.after, 0) / peelData.length).toFixed(1))
  const peelRetention = parseFloat((peelAfterAvg / peelBeforeAvg * 100).toFixed(1))
  const peelAllPass = peelData.every(d => d.after >= PEEL_PASS_THRESHOLD)

  // Peel error bars data for chart
  const peelChartData = useMemo(() =>
    peelData.map(d => ({
      position: d.position,
      before: d.before,
      after: d.after,
    })), [peelData])

  // Lap shear stats with std dev
  const lapBeforeAvg = parseFloat((lapShearData.reduce((s, d) => s + d.before, 0) / lapShearData.length).toFixed(2))
  const lapAfterAvg = parseFloat((lapShearData.reduce((s, d) => s + d.after, 0) / lapShearData.length).toFixed(2))
  const lapRetention = parseFloat((lapAfterAvg / lapBeforeAvg * 100).toFixed(1))
  const lapBeforeStd = parseFloat(Math.sqrt(lapShearData.reduce((s, d) => s + (d.before - lapBeforeAvg) ** 2, 0) / (lapShearData.length - 1 || 1)).toFixed(3))
  const lapAfterStd = parseFloat(Math.sqrt(lapShearData.reduce((s, d) => s + (d.after - lapAfterAvg) ** 2, 0) / (lapShearData.length - 1 || 1)).toFixed(3))
  const lapBeforeMin = Math.min(...lapShearData.map(d => d.before))
  const lapBeforeMax = Math.max(...lapShearData.map(d => d.before))
  const lapAfterMin = Math.min(...lapShearData.map(d => d.after))
  const lapAfterMax = Math.max(...lapShearData.map(d => d.after))

  // Lap shear chart data
  const lapChartData = useMemo(() =>
    lapShearData.map(d => ({
      sample: d.sampleId,
      before: d.before,
      after: d.after,
    })), [lapShearData])

  // Failure mode total
  const failureTotal = FAILURE_MODE_DATA.reduce((s, d) => s + d.count, 0)
  const failurePieData = FAILURE_MODE_DATA.map(d => ({
    name: d.mode,
    value: d.count,
    pct: parseFloat((d.count / failureTotal * 100).toFixed(1)),
    fill: d.color,
  }))

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 62788-1-6"
        title="Measurement procedures for materials used in PV modules — Part 1-6: Encapsulants — Adhesion"
        testConditions={[
          "Test temperature: 23°C ± 2°C",
          "Sample conditioning: 24h at 23°C / 50% RH",
          "Pull rate: 50 mm/min (lap shear) or per method",
          "Substrate: glass-encapsulant-backsheet laminate coupon",
        ]}
        dosageLevels={[
          "Test area: 25 mm × 25 mm bonded area (lap shear)",
          "Pre-conditioning options: initial, post-DH1000, post-TC200",
          "Minimum 5 specimens per condition per interface",
        ]}
        passCriteria={[
          { parameter: "Adhesion strength", requirement: "≥0.5 MPa at 23°C", note: "Lap shear method" },
          { parameter: "Failure mode", requirement: "Cohesive failure preferred", note: "Within encapsulant" },
          { parameter: "Post-aging retention", requirement: ">70% of initial adhesion" },
        ]}
        failCriteria={[
          { parameter: "Adhesion", requirement: "<0.5 MPa at any test condition" },
          { parameter: "Adhesive failure", requirement: "Clean delamination at interface" },
        ]}
        notes={[
          "Complementary to IEC 61215-2 MQT 22 peel test",
          "Measures cross-bonding strength vs. peel test linear adhesion",
        ]}
      />
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{peelBeforeAvg}</div>
            <div className="text-xs text-gray-500">Peel Before (N/cm)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{peelAfterAvg}</div>
            <div className="text-xs text-gray-500">Peel After (N/cm)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className={`text-2xl font-bold ${peelRetention >= 80 ? "text-green-600" : "text-red-600"}`}>
              {peelRetention}%
            </div>
            <div className="text-xs text-gray-500">Peel Retention</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{lapBeforeAvg}</div>
            <div className="text-xs text-gray-500">Lap Shear Before (MPa)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className={`text-2xl font-bold ${lapRetention >= 80 ? "text-green-600" : "text-red-600"}`}>
              {lapRetention}%
            </div>
            <div className="text-xs text-gray-500">Lap Shear Retention</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <Badge className={peelAllPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
              {peelAllPass ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
              {peelAllPass ? "ALL PASS" : "FAIL"}
            </Badge>
            <div className="text-xs text-gray-500 mt-1">Min: {PEEL_PASS_THRESHOLD} N/cm</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Peel Test Before/After */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-amber-500" />
              Peel Test – Before/After Conditioning
            </CardTitle>
            <CardDescription className="text-xs">IEC 61215 MQT 23 · T-peel at 5 positions · Pass: ≥{PEEL_PASS_THRESHOLD} N/cm</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={peelChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="position" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }}
                       label={{ value: "Peel Strength (N/cm)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [`${v} N/cm`]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={PEEL_PASS_THRESHOLD} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                               label={{ value: `Min ${PEEL_PASS_THRESHOLD} N/cm`, position: "right", fill: "#ef4444", fontSize: 9 }} />
                <Bar dataKey="before" fill="#f59e0b" name="Before Conditioning" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" fill="#3b82f6" name="After Conditioning" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lap Shear Before/After */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lap Shear Test – Before/After</CardTitle>
            <CardDescription className="text-xs">Shear strength (MPa) · Retention: {lapRetention}%</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={lapChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="sample" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }}
                       label={{ value: "Shear Strength (MPa)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [`${v} MPa`]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="before" fill="#f59e0b" name="Before Conditioning" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" fill="#8b5cf6" name="After Conditioning" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peel Test Data Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Peel Test Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Position</th>
                    <th className="text-right py-2 pr-4 font-semibold">Before (N/cm)</th>
                    <th className="text-right py-2 pr-4 font-semibold">After (N/cm)</th>
                    <th className="text-right py-2 pr-4 font-semibold">Retention (%)</th>
                    <th className="text-center py-2 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {peelData.map(d => {
                    const ret = parseFloat((d.after / d.before * 100).toFixed(1))
                    const pass = d.after >= PEEL_PASS_THRESHOLD
                    return (
                      <tr key={d.position} className={`border-b ${!pass ? "bg-red-50" : ""}`}>
                        <td className="py-2 pr-4 font-mono text-muted-foreground">{d.position}</td>
                        <td className="py-2 pr-4 text-right font-mono">{d.before}</td>
                        <td className="py-2 pr-4 text-right font-mono font-semibold">{d.after}</td>
                        <td className={`py-2 pr-4 text-right font-mono ${ret >= 80 ? "text-green-600" : "text-amber-600"}`}>
                          {ret}%
                        </td>
                        <td className="py-2 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {pass ? "PASS" : "FAIL"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="border-t-2 font-semibold">
                    <td className="py-2 pr-4">Average</td>
                    <td className="py-2 pr-4 text-right font-mono">{peelBeforeAvg}</td>
                    <td className="py-2 pr-4 text-right font-mono">{peelAfterAvg}</td>
                    <td className="py-2 pr-4 text-right font-mono text-amber-600">{peelRetention}%</td>
                    <td className="py-2 text-center">
                      <Badge className={peelAllPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {peelAllPass ? "PASS" : "FAIL"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Failure Mode Classification */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failure Mode Classification</CardTitle>
            <CardDescription className="text-xs">Distribution of failure modes across all adhesion specimens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={failurePieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                       outerRadius={80} innerRadius={40} label={({ name, pct }) => `${name} ${pct}%`}>
                    {failurePieData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v} specimens`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {FAILURE_MODE_DATA.map(({ mode, count, color }) => (
                  <div key={mode}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{mode}</span>
                      <span className="font-mono">{count} ({(count / failureTotal * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-2.5 rounded-full" style={{ width: `${count / failureTotal * 100}%`, backgroundColor: color }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {mode === "Cohesive" && "Preferred: failure within adhesive layer (strong bond)"}
                      {mode === "Adhesive" && "Concern: failure at interface (delamination risk)"}
                      {mode === "Interfacial" && "Interface separation between layers"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lap Shear Statistical Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Lap Shear Test – Statistical Summary</CardTitle>
          <CardDescription className="text-xs">ASTM D3163 · Before vs After conditioning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-semibold">Condition</th>
                  <th className="text-right py-2 pr-3 font-semibold">Mean (MPa)</th>
                  <th className="text-right py-2 pr-3 font-semibold">Min (MPa)</th>
                  <th className="text-right py-2 pr-3 font-semibold">Max (MPa)</th>
                  <th className="text-right py-2 pr-3 font-semibold">Std Dev (MPa)</th>
                  <th className="text-right py-2 pr-3 font-semibold">n</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-amber-600">Before Conditioning</td>
                  <td className="py-2 pr-3 text-right font-mono font-bold">{lapBeforeAvg}</td>
                  <td className="py-2 pr-3 text-right font-mono">{lapBeforeMin}</td>
                  <td className="py-2 pr-3 text-right font-mono">{lapBeforeMax}</td>
                  <td className="py-2 pr-3 text-right font-mono text-purple-600">{lapBeforeStd}</td>
                  <td className="py-2 pr-3 text-right font-mono">{lapShearData.length}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-3 font-medium text-blue-600">After Conditioning</td>
                  <td className="py-2 pr-3 text-right font-mono font-bold">{lapAfterAvg}</td>
                  <td className="py-2 pr-3 text-right font-mono">{lapAfterMin}</td>
                  <td className="py-2 pr-3 text-right font-mono">{lapAfterMax}</td>
                  <td className="py-2 pr-3 text-right font-mono text-purple-600">{lapAfterStd}</td>
                  <td className="py-2 pr-3 text-right font-mono">{lapShearData.length}</td>
                </tr>
                <tr className="border-t-2 font-semibold bg-amber-50">
                  <td className="py-2 pr-3">Retention Ratio</td>
                  <td className={`py-2 pr-3 text-right font-mono ${lapRetention >= 80 ? "text-green-600" : "text-red-600"}`} colSpan={5}>
                    {lapRetention}% {lapRetention >= 80 ? "(PASS)" : "(FAIL)"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61215 MQT 23 (Adhesion Test):</span>{" "}
            Peel test per ASTM D1876 / IEC 61215-2 at 50 mm/min crosshead speed, 25mm specimen width.
            Minimum peel strength: ≥15 N/cm (post-conditioning). Retention ratio compares post-test to initial values.
            Failure mode classification: Cohesive (within adhesive, preferred), Adhesive (at interface, concern),
            Interfacial (layer separation). Lap shear per ASTM D3163 for frame and junction box adhesion.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
