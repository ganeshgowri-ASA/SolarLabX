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
import { Wind, TrendingDown, Layers, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AbrasionSample {
  id: string
  glassType: string
  initialTransmittance: number  // %
  readings: number[]            // transmittance at each cycle interval
  hazeIncrease: number          // delta haze (%)
  surfaceRoughnessChange: number // delta Ra (nm)
}

// Cycle intervals at which transmittance is measured
const CYCLE_INTERVALS = [0, 200, 400, 600, 800, 1000]

// Minimum acceptable transmittance threshold per draft IEC 62782
const MIN_TRANSMITTANCE = 89.0  // %
const MAX_ALLOWED_LOSS   = 2.0  // % absolute transmittance loss

// ─── Demo Data ────────────────────────────────────────────────────────────────

const SAMPLES: AbrasionSample[] = [
  {
    id: "SA-001",
    glassType: "Tempered",
    initialTransmittance: 91.2,
    readings: [91.2, 90.8, 90.3, 89.9, 89.5, 89.1],
    hazeIncrease: 0.18,
    surfaceRoughnessChange: 1.4,
  },
  {
    id: "SA-002",
    glassType: "AR-Coated",
    initialTransmittance: 94.1,
    readings: [94.1, 93.5, 92.8, 92.1, 91.5, 90.9],
    hazeIncrease: 0.43,
    surfaceRoughnessChange: 2.1,
  },
  {
    id: "SA-003",
    glassType: "AR-Coated",
    initialTransmittance: 93.8,
    readings: [93.8, 93.3, 92.6, 91.9, 91.3, 90.7],
    hazeIncrease: 0.41,
    surfaceRoughnessChange: 1.9,
  },
  {
    id: "SA-004",
    glassType: "Tempered",
    initialTransmittance: 91.0,
    readings: [91.0, 90.4, 89.7, 89.1, 88.5, 87.9],
    hazeIncrease: 0.29,
    surfaceRoughnessChange: 2.8,
  },
  {
    id: "SA-005",
    glassType: "AR-Coated",
    initialTransmittance: 94.3,
    readings: [94.3, 93.8, 93.4, 92.9, 92.5, 92.1],
    hazeIncrease: 0.22,
    surfaceRoughnessChange: 1.2,
  },
  {
    id: "SA-006",
    glassType: "Tempered",
    initialTransmittance: 91.4,
    readings: [91.4, 91.0, 90.6, 90.2, 89.9, 89.6],
    hazeIncrease: 0.15,
    surfaceRoughnessChange: 1.1,
  },
]

// Colours assigned per sample for line chart
const SAMPLE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

// ─── Derived helpers ──────────────────────────────────────────────────────────

function getFinalTransmittance(s: AbrasionSample): number {
  return s.readings[s.readings.length - 1]
}

function getLoss(s: AbrasionSample): number {
  return parseFloat((s.initialTransmittance - getFinalTransmittance(s)).toFixed(2))
}

function isPassing(s: AbrasionSample): boolean {
  return getLoss(s) <= MAX_ALLOWED_LOSS && getFinalTransmittance(s) >= MIN_TRANSMITTANCE
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SandDustAbrasionTab() {
  const samples = useMemo(() => SAMPLES, [])

  // ── KPI values ──────────────────────────────────────────────────────────────
  const maxCycles       = CYCLE_INTERVALS[CYCLE_INTERVALS.length - 1]
  const maxLoss         = Math.max(...samples.map(getLoss))
  const avgOpticalLoss  = parseFloat(
    (samples.reduce((sum, s) => sum + getLoss(s), 0) / samples.length).toFixed(2)
  )
  const passCount       = samples.filter(isPassing).length
  const overallPass     = passCount === samples.length

  // ── Line chart data: one row per cycle interval ──────────────────────────
  const lineData = CYCLE_INTERVALS.map((cycle, idx) => {
    const row: Record<string, number> = { cycle }
    samples.forEach(s => { row[s.id] = s.readings[idx] })
    return row
  })

  // ── Bar chart data: total loss per sample ────────────────────────────────
  const barData = samples.map(s => ({
    sample: s.id,
    "Transmittance Loss (%)": getLoss(s),
    pass: isPassing(s),
  }))

  // ── Export payload ────────────────────────────────────────────────────────
  const exportData = samples.map(s => ({
    "Sample ID":                     s.id,
    "Glass Type":                    s.glassType,
    "Initial Transmittance (%)":     s.initialTransmittance,
    "Final Transmittance (%)":       getFinalTransmittance(s),
    "Transmittance Loss (%)":        getLoss(s),
    "Haze Increase (%)":             s.hazeIncrease,
    "Surface Roughness Change (nm)": s.surfaceRoughnessChange,
    "Result":                        isPassing(s) ? "PASS" : "FAIL",
  }))

  return (
    <div className="space-y-4">

      {/* ── IEC Standard Card ─────────────────────────────────────────────── */}
      <IECStandardCard
        standard="IEC 62782 (Draft)"
        title="Photovoltaic (PV) modules — Cyclic (dynamic) mechanical load testing — Sand/dust abrasion test for optical transmittance degradation"
        testConditions={[
          "Abrasive medium: standardised silica sand (grain size 0.1–0.3 mm)",
          "Sand flow rate: 1.0 kg/min directed at module glass surface",
          "Nozzle angle: 45° to glass surface",
          "Test duration: up to 1000 abrasion cycles",
          "Ambient temperature: 23 °C ± 2 °C, RH 50 ± 10 %",
          "Optical transmittance measured at 0, 200, 400, 600, 800, and 1000 cycles",
        ]}
        dosageLevels={[
          "Cycle intervals: 0 / 200 / 400 / 600 / 800 / 1000 cycles",
          "Total sand mass impacted per sample: ~1000 g over 1000 cycles",
          "Haze measurement per ISO 14782 after each interval",
          "Surface roughness (Ra) measured via profilometry pre/post test",
        ]}
        passCriteria={[
          { parameter: "Transmittance loss",  requirement: "≤ 2.0 % absolute over 1000 cycles",      note: "Measured at 550 nm" },
          { parameter: "Final transmittance", requirement: "≥ 89.0 % (tempered) / ≥ 91.0 % (AR)",    note: "Post 1000 cycles" },
          { parameter: "Haze increase",       requirement: "≤ 1.0 % absolute",                         note: "ISO 14782" },
          { parameter: "Surface roughness",   requirement: "Ra change ≤ 5 nm",                         note: "Profilometry" },
          { parameter: "Visual inspection",   requirement: "No delamination, scratches, or pitting",   note: "IEC 62782 §7" },
        ]}
        failCriteria={[
          { parameter: "Transmittance loss",  requirement: "> 2.0 % absolute — energy yield risk for desert sites" },
          { parameter: "Haze > 1.0 %",        requirement: "Light scattering affecting cell efficiency" },
          { parameter: "Surface damage",      requirement: "Visible pitting, scratches, or coating delamination" },
          { parameter: "Ra change > 5 nm",    requirement: "Micro-roughness accelerating soiling adhesion" },
        ]}
        notes={[
          "IEC 62782 remains under development; values represent working draft thresholds",
          "AR-coated glass shows higher initial transmittance but is more susceptible to coating removal",
          "Desert installation sites (e.g., MENA, Rajasthan) should use enhanced AR coatings with scratch-resistant hard-coats",
          "Combined sand/dust + soiling effects can compound transmittance losses by 3–6 % annually in arid climates",
          "Testing should be followed by wet leakage current test per IEC 61215-2 MQT 15 to verify sealing integrity",
        ]}
      />

      {/* ── Export ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: exportData,
            filename: "sand-dust-abrasion-iec62782",
            title: "Sand/Dust Abrasion Test – IEC 62782 (Draft)",
            subtitle: `Samples: ${samples.length} | Max cycles: ${maxCycles} | Max loss: ${maxLoss.toFixed(2)} %`,
          }}
        />
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              <Wind className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{maxCycles}</div>
            <div className="text-xs text-gray-500 mt-0.5">Abrasion Cycles</div>
          </CardContent>
        </Card>

        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{maxLoss.toFixed(2)} %</div>
            <div className="text-xs text-gray-500 mt-0.5">Max Transmittance Loss</div>
          </CardContent>
        </Card>

        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{avgOpticalLoss.toFixed(2)} %</div>
            <div className="text-xs text-gray-500 mt-0.5">Avg Optical Loss</div>
          </CardContent>
        </Card>

        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="flex justify-center mb-1">
              {overallPass
                ? <ShieldCheck className="h-5 w-5 text-green-500" />
                : <ShieldAlert className="h-5 w-5 text-red-500" />
              }
            </div>
            <div className={`text-2xl font-bold ${overallPass ? "text-green-600" : "text-red-600"}`}>
              {overallPass ? "PASS" : "FAIL"}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Overall Result
              {!overallPass && (
                <span className="text-red-500 font-semibold ml-1">
                  ({samples.length - passCount} failed)
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Line chart: transmittance vs cycles */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-blue-500" />
              Transmittance (%) vs Abrasion Cycles
            </CardTitle>
            <CardDescription className="text-xs">
              All 6 samples · Minimum threshold: {MIN_TRANSMITTANCE} %
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="cycle"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Abrasion Cycles", position: "insideBottom", offset: -2, fontSize: 10 }}
                />
                <YAxis
                  domain={[87, 95]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Transmittance (%)", angle: -90, position: "insideLeft", fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toFixed(2)} %`, name]}
                  labelFormatter={label => `Cycle: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={MIN_TRANSMITTANCE}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  strokeWidth={2}
                  label={{ value: `Min ${MIN_TRANSMITTANCE} %`, fill: "#ef4444", fontSize: 9, position: "right" }}
                />
                {samples.map((s, i) => (
                  <Line
                    key={s.id}
                    type="monotone"
                    dataKey={s.id}
                    stroke={SAMPLE_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: SAMPLE_COLORS[i] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar chart: total transmittance loss per sample */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              Total Transmittance Loss per Sample
            </CardTitle>
            <CardDescription className="text-xs">
              Loss after {maxCycles} abrasion cycles · Limit: {MAX_ALLOWED_LOSS} % absolute
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="sample"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Sample ID", position: "insideBottom", offset: -2, fontSize: 10 }}
                />
                <YAxis
                  domain={[0, 3]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Loss (%)", angle: -90, position: "insideLeft", fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v.toFixed(2)} %`, name]}
                  labelFormatter={label => `Sample: ${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={MAX_ALLOWED_LOSS}
                  stroke="#ef4444"
                  strokeDasharray="5 3"
                  strokeWidth={2}
                  label={{ value: `Limit ${MAX_ALLOWED_LOSS} %`, fill: "#ef4444", fontSize: 9, position: "right" }}
                />
                <Bar
                  dataKey="Transmittance Loss (%)"
                  maxBarSize={36}
                  radius={[3, 3, 0, 0]}
                  fill="#f59e0b"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-1 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-green-500" /> Pass (≤ {MAX_ALLOWED_LOSS} %)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-red-500" /> Fail (&gt; {MAX_ALLOWED_LOSS} %)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            Sample Detail – IEC 62782 (Draft) Sand/Dust Abrasion
          </CardTitle>
          <CardDescription className="text-xs">
            6 glass samples tested · 1000 abrasion cycles · Transmittance measured at 550 nm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="border p-1.5 bg-gray-50 text-left font-semibold">Sample ID</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Glass Type</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Initial T (%)</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Final T (%)</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Loss (%)</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Haze Increase (%)</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Ra Change (nm)</th>
                  <th className="border p-1.5 bg-gray-50 text-center font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((s, i) => {
                  const finalT = getFinalTransmittance(s)
                  const loss   = getLoss(s)
                  const pass   = isPassing(s)
                  return (
                    <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="border p-1.5 font-mono font-semibold text-gray-700">{s.id}</td>
                      <td className="border p-1.5 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium
                          ${s.glassType === "AR-Coated"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"}`}>
                          {s.glassType}
                        </span>
                      </td>
                      <td className="border p-1.5 text-center font-mono">{s.initialTransmittance.toFixed(1)}</td>
                      <td className="border p-1.5 text-center font-mono">{finalT.toFixed(1)}</td>
                      <td className={`border p-1.5 text-center font-mono font-semibold
                        ${loss > MAX_ALLOWED_LOSS ? "text-red-600" : "text-green-700"}`}>
                        {loss.toFixed(2)}
                      </td>
                      <td className={`border p-1.5 text-center font-mono
                        ${s.hazeIncrease > 1.0 ? "text-red-600 font-semibold" : "text-gray-700"}`}>
                        {s.hazeIncrease.toFixed(2)}
                      </td>
                      <td className={`border p-1.5 text-center font-mono
                        ${s.surfaceRoughnessChange > 5 ? "text-red-600 font-semibold" : "text-gray-700"}`}>
                        {s.surfaceRoughnessChange.toFixed(1)}
                      </td>
                      <td className="border p-1.5 text-center">
                        {pass
                          ? <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">PASS</Badge>
                            </span>
                          : <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">FAIL</Badge>
                            </span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="border p-1.5" colSpan={4}>Summary ({samples.length} samples)</td>
                  <td className="border p-1.5 text-center font-mono">{avgOpticalLoss.toFixed(2)} avg</td>
                  <td className="border p-1.5 text-center font-mono">
                    {(samples.reduce((s, x) => s + x.hazeIncrease, 0) / samples.length).toFixed(2)} avg
                  </td>
                  <td className="border p-1.5 text-center font-mono">
                    {(samples.reduce((s, x) => s + x.surfaceRoughnessChange, 0) / samples.length).toFixed(1)} avg
                  </td>
                  <td className="border p-1.5 text-center">
                    <Badge className={overallPass
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      {passCount}/{samples.length} PASS
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Amber Reference Note ───────────────────────────────────────────── */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 62782 (Draft) – Sand/Dust Abrasion for Desert Installations:</span>{" "}
            Sand and dust abrasion is a critical degradation mechanism for PV modules deployed in arid and
            desert environments (MENA region, Rajasthan, Atacama, Sahel). Airborne silica particles at wind
            speeds of 10–30 m/s can progressively erode the glass surface and AR coatings, leading to
            sustained optical transmittance losses of 1–4 % per year. IEC 62782 (under development) defines
            a standardised abrasion test using calibrated silica sand at 45° angle of incidence over 1000
            cycles. AR-coated glass offers higher initial transmittance (93–95 %) but requires scratch-resistant
            hard-coat layers (e.g., SiO₂ or TiO₂ top layers) to survive long-term abrasion. Tempered glass
            shows lower initial transmittance (~91 %) but better mechanical resistance. For sites with high
            sand/dust flux (&gt; 2 g/m²/day), modules should be qualified to at least 2000 abrasion cycles and
            combined with soiling rate monitoring per IEC TS 61724-3 to capture actual energy yield impact.
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
