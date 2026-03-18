// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell
} from "recharts"
import { FlaskConical, CheckCircle, XCircle, Beaker } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SoxhletSample {
  sampleId: string
  initialWeight: number  // g
  driedWeight: number    // g
  gelContent: number     // %
}

interface DSCSample {
  sampleId: string
  hTotal: number         // J/g total enthalpy (uncured)
  hResidual: number      // J/g residual enthalpy (cured)
  degreeOfCure: number   // %
  tcUncured: number      // °C crystallization temp uncured
  tcCured: number        // °C crystallization temp cured
  gelContent: number     // % from Soxhlet for correlation
}

interface DSCThermogramPoint {
  temperature: number
  heatFlow: number
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

function generateSoxhletData(): SoxhletSample[] {
  const samples: SoxhletSample[] = [
    { sampleId: "GC-001", initialWeight: 0.5120, driedWeight: 0.4510, gelContent: 0 },
    { sampleId: "GC-002", initialWeight: 0.4980, driedWeight: 0.4230, gelContent: 0 },
    { sampleId: "GC-003", initialWeight: 0.5050, driedWeight: 0.4550, gelContent: 0 },
    { sampleId: "GC-004", initialWeight: 0.5200, driedWeight: 0.4056, gelContent: 0 },
    { sampleId: "GC-005", initialWeight: 0.4900, driedWeight: 0.4361, gelContent: 0 },
    { sampleId: "GC-006", initialWeight: 0.5080, driedWeight: 0.4674, gelContent: 0 },
  ]
  // G% = (dried/initial)*100
  return samples.map(s => ({
    ...s,
    gelContent: parseFloat(((s.driedWeight / s.initialWeight) * 100).toFixed(1))
  }))
}

function generateDSCData(soxhletData: SoxhletSample[]): DSCSample[] {
  return soxhletData.map((s, i) => {
    const hTotal = 28 + Math.random() * 8 // J/g
    // Degree of cure correlates with gel content
    const degreeOfCure = s.gelContent * 0.95 + (Math.random() - 0.5) * 3
    const hResidual = hTotal * (1 - degreeOfCure / 100)
    return {
      sampleId: s.sampleId,
      hTotal: parseFloat(hTotal.toFixed(1)),
      hResidual: parseFloat(hResidual.toFixed(1)),
      degreeOfCure: parseFloat(degreeOfCure.toFixed(1)),
      tcUncured: parseFloat((48 + Math.random() * 3).toFixed(1)),
      tcCured: parseFloat((55 + Math.random() * 4 + (s.gelContent - 80) * 0.2).toFixed(1)),
      gelContent: s.gelContent,
    }
  })
}

function generateDSCThermogram(): DSCThermogramPoint[] {
  const points: DSCThermogramPoint[] = []
  for (let t = 30; t <= 200; t += 1) {
    let hf = 0
    // Endothermic melting peak around 70°C (EVA)
    hf += -2.5 * Math.exp(-Math.pow((t - 70) / 8, 2))
    // Exothermic curing peak around 150°C
    hf += 1.8 * Math.exp(-Math.pow((t - 150) / 12, 2))
    // Baseline drift
    hf += 0.002 * (t - 100)
    // Noise
    hf += (Math.random() - 0.5) * 0.08
    points.push({ temperature: t, heatFlow: parseFloat(hf.toFixed(4)) })
  }
  return points
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GelContentAnalysis() {
  const soxhletData = useMemo(() => generateSoxhletData(), [])
  const dscData = useMemo(() => generateDSCData(soxhletData), [soxhletData])
  const thermogramData = useMemo(() => generateDSCThermogram(), [])

  const MIN_GEL = 65  // JPL criteria
  const TARGET_GEL = 80  // recommended

  // Soxhlet statistics
  const gelValues = soxhletData.map(s => s.gelContent)
  const avgGel = parseFloat((gelValues.reduce((a, b) => a + b, 0) / gelValues.length).toFixed(1))
  const minGel = Math.min(...gelValues)
  const maxGel = Math.max(...gelValues)
  const stdDev = parseFloat(Math.sqrt(gelValues.reduce((s, v) => s + Math.pow(v - avgGel, 2), 0) / gelValues.length).toFixed(2))
  const passCountSoxhlet = gelValues.filter(v => v >= MIN_GEL).length

  // DSC statistics
  const avgDOC = parseFloat((dscData.reduce((s, d) => s + d.degreeOfCure, 0) / dscData.length).toFixed(1))
  const passCountDSC = dscData.filter(d => d.degreeOfCure >= 60).length

  const overallPassRate = parseFloat(((passCountSoxhlet / soxhletData.length) * 100).toFixed(1))

  // Bar chart data for Soxhlet
  const barData = soxhletData.map(s => ({
    id: s.sampleId.replace("GC-", ""),
    gelContent: s.gelContent,
    pass: s.gelContent >= MIN_GEL,
  }))

  // Comparison table data
  const comparisonData = soxhletData.map((s, i) => ({
    sampleId: s.sampleId,
    soxhletGel: s.gelContent,
    dscDOC: dscData[i].degreeOfCure,
    hTotal: dscData[i].hTotal,
    hResidual: dscData[i].hResidual,
    tcShift: parseFloat((dscData[i].tcCured - dscData[i].tcUncured).toFixed(1)),
  }))

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 62788-1-2"
        title="Measurement procedures for materials used in PV modules — Part 1-2: Encapsulants — Gel content (Soxhlet extraction)"
        testConditions={[
          "Extraction solvent: xylene (reflux at ~110°C)",
          "Extraction duration: 24 hours minimum",
          "Sample mass: 0.3–0.5 g per specimen",
          "Drying: vacuum oven at 50°C to constant mass",
        ]}
        dosageLevels={[
          "Xylene reflux at 110°C for 24 hours",
          "Minimum 3 specimens per sample",
          "Alternative: DSC method for degree of cure crosscheck",
        ]}
        passCriteria={[
          { parameter: "EVA gel content", requirement: "≥65%", note: "Ethylene-vinyl acetate" },
          { parameter: "POE gel content", requirement: "≥70%", note: "Polyolefin elastomer" },
          { parameter: "Repeatability", requirement: "CV < 5% between specimens" },
        ]}
        failCriteria={[
          { parameter: "EVA", requirement: "<65% indicates undercure" },
          { parameter: "POE", requirement: "<70% indicates undercure" },
        ]}
        notes={[
          "Under-cured encapsulant leads to delamination and PID susceptibility",
          "DSC residual enthalpy <3 J/g confirms adequate cure for EVA",
        ]}
      />
      {/* Header badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="border-amber-300 text-amber-700">IEC 62788-1-6</Badge>
        <Badge variant="outline" className="border-blue-300 text-blue-700">Gel Content / Degree of Cure</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{avgGel}%</div>
            <div className="text-xs text-gray-500">Avg Gel Content</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{avgDOC}%</div>
            <div className="text-xs text-gray-500">Avg Degree of Cure</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold">{soxhletData.length}</div>
            <div className="text-xs text-gray-500">Samples Tested</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className={`text-2xl font-bold ${overallPassRate >= 90 ? "text-green-600" : "text-amber-600"}`}>
              {overallPassRate}%
            </div>
            <div className="text-xs text-gray-500">Pass Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Soxhlet Extraction Section ─── */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-amber-500" />
          Soxhlet Extraction (Weight Method)
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sample Weights & Gel Content</CardTitle>
            <CardDescription className="text-xs">G% = (Dried Weight / Initial Weight) × 100</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="border p-1.5 bg-gray-50 text-left">Sample ID</th>
                    <th className="border p-1.5 bg-gray-50 text-center">Initial (g)</th>
                    <th className="border p-1.5 bg-gray-50 text-center">Dried (g)</th>
                    <th className="border p-1.5 bg-gray-50 text-center">G%</th>
                    <th className="border p-1.5 bg-gray-50 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {soxhletData.map(s => (
                    <tr key={s.sampleId}>
                      <td className="border p-1.5 font-mono">{s.sampleId}</td>
                      <td className="border p-1.5 text-center font-mono">{s.initialWeight.toFixed(4)}</td>
                      <td className="border p-1.5 text-center font-mono">{s.driedWeight.toFixed(4)}</td>
                      <td className="border p-1.5 text-center font-mono font-bold">{s.gelContent}%</td>
                      <td className="border p-1.5 text-center">
                        {s.gelContent >= TARGET_GEL ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">PASS</Badge>
                        ) : s.gelContent >= MIN_GEL ? (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">MARGINAL</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 text-xs">FAIL</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-gray-500">Average</div>
                <div className="font-bold font-mono">{avgGel}%</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-gray-500">Min</div>
                <div className="font-bold font-mono">{minGel.toFixed(1)}%</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-gray-500">Max</div>
                <div className="font-bold font-mono">{maxGel.toFixed(1)}%</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-gray-500">Std Dev</div>
                <div className="font-bold font-mono">{stdDev}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gel Content Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gel Content per Sample</CardTitle>
            <CardDescription className="text-xs">
              Min threshold: {MIN_GEL}% (JPL) | Target: {TARGET_GEL}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="id" tick={{ fontSize: 10 }}
                  label={{ value: "Sample", position: "insideBottom", offset: -5, fontSize: 10 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10 }}
                  label={{ value: "Gel Content (%)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Gel Content"]} />
                <ReferenceLine y={MIN_GEL} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                  label={{ value: `Min ${MIN_GEL}%`, position: "right", fill: "#ef4444", fontSize: 9 }} />
                <ReferenceLine y={TARGET_GEL} stroke="#22c55e" strokeDasharray="5 3" strokeWidth={2}
                  label={{ value: `Target ${TARGET_GEL}%`, position: "right", fill: "#22c55e", fontSize: 9 }} />
                <Bar dataKey="gelContent" name="Gel Content (%)" maxBarSize={40}>
                  {barData.map((d, i) => (
                    <Cell key={i}
                      fill={d.gelContent >= TARGET_GEL ? "#86efac" : d.gelContent >= MIN_GEL ? "#fcd34d" : "#fca5a5"}
                      stroke={d.gelContent >= TARGET_GEL ? "#22c55e" : d.gelContent >= MIN_GEL ? "#f59e0b" : "#ef4444"}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── DSC Method Section ─── */}
      <div className="space-y-1 pt-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Beaker className="h-4 w-4 text-blue-500" />
          DSC Method (Differential Scanning Calorimetry)
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DSC Enthalpy Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Residual Enthalpy – Degree of Cure</CardTitle>
            <CardDescription className="text-xs">
              DOC = (1 − H_residual / H_total) × 100
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="border p-1.5 bg-gray-50 text-left">Sample</th>
                    <th className="border p-1.5 bg-gray-50 text-center">H_total (J/g)</th>
                    <th className="border p-1.5 bg-gray-50 text-center">H_residual (J/g)</th>
                    <th className="border p-1.5 bg-gray-50 text-center">DOC (%)</th>
                    <th className="border p-1.5 bg-gray-50 text-center">Tc_uncured</th>
                    <th className="border p-1.5 bg-gray-50 text-center">Tc_cured</th>
                  </tr>
                </thead>
                <tbody>
                  {dscData.map(d => (
                    <tr key={d.sampleId}>
                      <td className="border p-1.5 font-mono">{d.sampleId}</td>
                      <td className="border p-1.5 text-center font-mono">{d.hTotal}</td>
                      <td className="border p-1.5 text-center font-mono">{d.hResidual}</td>
                      <td className="border p-1.5 text-center font-mono font-bold">{d.degreeOfCure}%</td>
                      <td className="border p-1.5 text-center font-mono">{d.tcUncured}°C</td>
                      <td className="border p-1.5 text-center font-mono">{d.tcCured}°C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* DSC Thermogram */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">DSC Thermogram</CardTitle>
            <CardDescription className="text-xs">
              Heat Flow vs Temperature – Endothermic (down) / Exothermic (up)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={thermogramData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="temperature" type="number"
                  label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5, fontSize: 10 }}
                  tick={{ fontSize: 10 }} />
                <YAxis
                  label={{ value: "Heat Flow (W/g)", angle: -90, position: "insideLeft", fontSize: 9 }}
                  tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(4)} W/g`, "Heat Flow"]}
                  labelFormatter={l => `${l}°C`} />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="heatFlow" stroke="#8b5cf6" dot={false} strokeWidth={1.5} name="Heat Flow" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-1 text-xs text-gray-500">
              <span>↓ Endothermic (~70°C EVA melt)</span>
              <span>↑ Exothermic (~150°C curing)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Comparison Section ─── */}
      <div className="space-y-1 pt-2">
        <h3 className="text-sm font-semibold">Soxhlet vs DSC – Comparison</h3>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="border p-1.5 bg-gray-50 text-left">Sample</th>
                  <th className="border p-1.5 bg-amber-50 text-center" colSpan={1}>Soxhlet G%</th>
                  <th className="border p-1.5 bg-blue-50 text-center" colSpan={1}>DSC DOC%</th>
                  <th className="border p-1.5 bg-blue-50 text-center">H_total (J/g)</th>
                  <th className="border p-1.5 bg-blue-50 text-center">H_residual (J/g)</th>
                  <th className="border p-1.5 bg-purple-50 text-center">ΔTc (°C)</th>
                  <th className="border p-1.5 bg-gray-50 text-center">Correlation</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(d => {
                  const diff = Math.abs(d.soxhletGel - d.dscDOC)
                  return (
                    <tr key={d.sampleId}>
                      <td className="border p-1.5 font-mono">{d.sampleId}</td>
                      <td className="border p-1.5 text-center font-mono font-bold bg-amber-50">{d.soxhletGel}%</td>
                      <td className="border p-1.5 text-center font-mono font-bold bg-blue-50">{d.dscDOC}%</td>
                      <td className="border p-1.5 text-center font-mono">{d.hTotal}</td>
                      <td className="border p-1.5 text-center font-mono">{d.hResidual}</td>
                      <td className="border p-1.5 text-center font-mono">{d.tcShift > 0 ? "+" : ""}{d.tcShift}</td>
                      <td className="border p-1.5 text-center">
                        {diff < 5 ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">Good</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Review</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reference */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 62788-1-6 – Gel Content & Degree of Cure:</span>{" "}
            <strong>Soxhlet extraction:</strong> G% = (dried weight / initial weight) × 100.
            Pass: ≥65% (JPL 5101-161 criteria). Recommended: ≥80%.
            <strong> DSC method:</strong> Degree of cure = (1 − H_residual/H_total) × 100.
            Crystallization temp shift (Tc_cured − Tc_uncured) indicates crosslink density.
            Both methods should correlate within ±5%.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
