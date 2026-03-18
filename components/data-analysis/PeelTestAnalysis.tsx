// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ScatterChart, Scatter,
  ComposedChart, Cell
} from "recharts"
import { CheckCircle, XCircle, AlertTriangle, BarChart3, TrendingUp } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PeelSample {
  sampleId: string
  testDate: string
  standard: string
  material: "backsheet" | "encapsulant_glass" | "encapsulant_backsheet" | "frame_adhesive"
  peelStrength: number   // N/cm
  failureMode: "adhesive" | "cohesive" | "mixed" | "substrate"
  conditionType: "initial" | "post_tc200" | "post_dh1000" | "post_uv15" | "post_hf10"
  tempAtTest: number
  humidity: number
  specimenWidth: number  // cm
  crossheadSpeed: number // mm/min
  peakLoad: number       // N
  avgLoad: number        // N
  sampleGroup: string
}

const PEEL_STANDARDS = {
  IEC_61215: { lsl: 25, label: "IEC 61215 min 25 N/cm" },
  IEC_61730: { lsl: 20, label: "IEC 61730 min 20 N/cm" },
  ASTM_D1876: { lsl: 15, label: "ASTM D1876 min 15 N/cm" },
}

// Mock data generator
function genPeelData(): PeelSample[] {
  const conditions = ["initial", "post_tc200", "post_dh1000", "post_uv15", "post_hf10"] as const
  const materials = ["backsheet", "encapsulant_glass", "encapsulant_backsheet"] as const
  const failureModes = ["adhesive", "cohesive", "mixed", "substrate"] as const
  const data: PeelSample[] = []
  let id = 1

  conditions.forEach(cond => {
    materials.forEach(mat => {
      const base = mat === "encapsulant_glass" ? 60 : mat === "encapsulant_backsheet" ? 45 : 35
      const degradFactor = cond === "initial" ? 1 : cond === "post_tc200" ? 0.92 : cond === "post_dh1000" ? 0.78 : cond === "post_uv15" ? 0.88 : 0.85
      for (let i = 0; i < 5; i++) {
        const peelStrength = parseFloat((base * degradFactor * (0.9 + Math.random() * 0.2)).toFixed(1))
        const specimenWidth = 2.5
        const peakLoad = parseFloat((peelStrength * specimenWidth * (1.1 + Math.random() * 0.1)).toFixed(1))
        data.push({
          sampleId: `PS-${String(id++).padStart(4, "0")}`,
          testDate: "2026-03-10",
          standard: "IEC 61215",
          material: mat,
          peelStrength,
          failureMode: failureModes[Math.floor(Math.random() * 3)],
          conditionType: cond,
          tempAtTest: 23 + Math.round((Math.random() - 0.5) * 4),
          humidity: 50 + Math.round((Math.random() - 0.5) * 20),
          specimenWidth,
          crossheadSpeed: 50,
          peakLoad,
          avgLoad: parseFloat((peakLoad * 0.88).toFixed(1)),
          sampleGroup: `G${Math.floor(i / 2) + 1}`,
        })
      }
    })
  })
  return data
}

const MATERIAL_LABELS: Record<string, string> = {
  backsheet: "Backsheet Adhesion",
  encapsulant_glass: "Encapsulant-Glass",
  encapsulant_backsheet: "Encapsulant-Backsheet",
  frame_adhesive: "Frame Adhesive",
}

const CONDITION_LABELS: Record<string, string> = {
  initial: "Initial",
  post_tc200: "Post TC200",
  post_dh1000: "Post DH1000",
  post_uv15: "Post UV15",
  post_hf10: "Post HF10",
}

const CONDITION_COLORS: Record<string, string> = {
  initial: "#22c55e",
  post_tc200: "#3b82f6",
  post_dh1000: "#ef4444",
  post_uv15: "#f59e0b",
  post_hf10: "#8b5cf6",
}

const FAILURE_COLORS: Record<string, string> = {
  adhesive: "#ef4444",
  cohesive: "#22c55e",
  mixed: "#f59e0b",
  substrate: "#8b5cf6",
}

export function PeelTestAnalysis() {
  const [selectedMaterial, setSelectedMaterial] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [selectedStandard, setSelectedStandard] = useState("IEC_61215")

  const data = useMemo(() => genPeelData(), [])

  const filteredData = useMemo(() => data.filter(d => {
    if (selectedMaterial !== "all" && d.material !== selectedMaterial) return false
    if (selectedCondition !== "all" && d.conditionType !== selectedCondition) return false
    return true
  }), [data, selectedMaterial, selectedCondition])

  const lsl = PEEL_STANDARDS[selectedStandard as keyof typeof PEEL_STANDARDS].lsl

  // Stats by condition and material
  const conditionStats = useMemo(() => {
    const conditions = ["initial", "post_tc200", "post_dh1000", "post_uv15", "post_hf10"]
    const materials = ["backsheet", "encapsulant_glass", "encapsulant_backsheet"]

    return conditions.map(cond => {
      const row: Record<string, any> = { condition: CONDITION_LABELS[cond] }
      materials.forEach(mat => {
        const values = data.filter(d => d.conditionType === cond && d.material === mat).map(d => d.peelStrength)
        const mean = values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : 0
        row[mat] = mean
        row[`${mat}_pass`] = values.filter(v => v >= lsl).length
        row[`${mat}_fail`] = values.filter(v => v < lsl).length
        row[`${mat}_n`] = values.length
      })
      return row
    })
  }, [data, lsl])

  // Degradation trend per material
  const degradationTrend = useMemo(() => {
    const conditions = ["initial", "post_tc200", "post_dh1000", "post_uv15", "post_hf10"]
    const materials = ["backsheet", "encapsulant_glass", "encapsulant_backsheet"]

    return conditions.map((cond, ci) => {
      const row: Record<string, any> = { condition: CONDITION_LABELS[cond], order: ci }
      materials.forEach(mat => {
        const values = data.filter(d => d.conditionType === cond && d.material === mat).map(d => d.peelStrength)
        const initial = data.filter(d => d.conditionType === "initial" && d.material === mat).map(d => d.peelStrength)
        const meanInitial = initial.length > 0 ? initial.reduce((a, b) => a + b, 0) / initial.length : 1
        const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
        row[mat] = parseFloat((mean / meanInitial * 100).toFixed(1))
      })
      return row
    })
  }, [data])

  // Failure mode distribution
  const failureModeData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredData.forEach(d => {
      counts[d.failureMode] = (counts[d.failureMode] || 0) + 1
    })
    return Object.entries(counts).map(([mode, count]) => ({ mode, count, pct: parseFloat((count / filteredData.length * 100).toFixed(1)) }))
  }, [filteredData])

  // Per-sample peel strength bars
  const sampleBars = useMemo(() =>
    filteredData.slice(0, 30).map(d => ({
      id: d.sampleId.replace("PS-", ""),
      strength: d.peelStrength,
      pass: d.peelStrength >= lsl,
      material: d.material,
    })), [filteredData, lsl])

  const passCount = filteredData.filter(d => d.peelStrength >= lsl).length
  const failCount = filteredData.length - passCount
  const passRate = filteredData.length > 0 ? parseFloat((passCount / filteredData.length * 100).toFixed(1)) : 0

  // Detailed statistics
  const detailedStats = useMemo(() => {
    const values = filteredData.map(d => d.peelStrength)
    if (values.length === 0) return { mean: 0, min: 0, max: 0, stdDev: 0, cv: 0 }
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1 || 1)
    const stdDev = Math.sqrt(variance)
    const cv = mean > 0 ? (stdDev / mean) * 100 : 0
    return {
      mean: parseFloat(mean.toFixed(1)),
      min: parseFloat(min.toFixed(1)),
      max: parseFloat(max.toFixed(1)),
      stdDev: parseFloat(stdDev.toFixed(2)),
      cv: parseFloat(cv.toFixed(1)),
    }
  }, [filteredData])

  // Before/After summary by material
  const beforeAfterSummary = useMemo(() => {
    const materials = ["backsheet", "encapsulant_glass", "encapsulant_backsheet"]
    return materials.map(mat => {
      const initial = data.filter(d => d.conditionType === "initial" && d.material === mat).map(d => d.peelStrength)
      const postDH = data.filter(d => d.conditionType === "post_dh1000" && d.material === mat).map(d => d.peelStrength)
      const calcStats = (arr: number[]) => {
        if (arr.length === 0) return { mean: 0, min: 0, max: 0, stdDev: 0 }
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length
        const stdDev = Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / (arr.length - 1 || 1))
        return { mean: parseFloat(mean.toFixed(1)), min: parseFloat(Math.min(...arr).toFixed(1)), max: parseFloat(Math.max(...arr).toFixed(1)), stdDev: parseFloat(stdDev.toFixed(2)) }
      }
      const beforeStats = calcStats(initial)
      const afterStats = calcStats(postDH)
      const retention = beforeStats.mean > 0 ? parseFloat((afterStats.mean / beforeStats.mean * 100).toFixed(1)) : 0
      return {
        material: MATERIAL_LABELS[mat],
        before: beforeStats,
        after: afterStats,
        retention,
        pass: afterStats.mean >= lsl,
      }
    })
  }, [data, lsl])

  return (
    <div className="space-y-4">
      {/* Filters + Summary */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          <span className="text-xs text-gray-500 self-center mr-1">Material:</span>
          {["all", "backsheet", "encapsulant_glass", "encapsulant_backsheet"].map(m => (
            <button key={m} onClick={() => setSelectedMaterial(m)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${selectedMaterial === m ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {m === "all" ? "All" : MATERIAL_LABELS[m].split("-")[0]}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <span className="text-xs text-gray-500 self-center mr-1">Condition:</span>
          {["all", "initial", "post_tc200", "post_dh1000", "post_uv15"].map(c => (
            <button key={c} onClick={() => setSelectedCondition(c)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${selectedCondition === c ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c === "all" ? "All" : CONDITION_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {Object.keys(PEEL_STANDARDS).map(std => (
            <button key={std} onClick={() => setSelectedStandard(std)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${selectedStandard === std ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {std.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <div className="text-xs text-gray-500">Total Specimens</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">{passCount}</div>
            <div className="text-xs text-gray-500">Pass ({passRate}%)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-red-600">{failCount}</div>
            <div className="text-xs text-gray-500">Fail (&lt;{lsl} N/cm)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{detailedStats.mean}</div>
            <div className="text-xs text-gray-500">Mean (N/cm)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">±{detailedStats.stdDev}</div>
            <div className="text-xs text-gray-500">Std Dev (N/cm)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{detailedStats.min}–{detailedStats.max}</div>
            <div className="text-xs text-gray-500">Min–Max Range</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per-sample peel strength */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Peel Strength per Specimen</CardTitle>
            <CardDescription className="text-xs">With LSL = {lsl} N/cm threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sampleBars}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="id" tick={{ fontSize: 9 }} label={{ value: "Sample ID", position: "insideBottom", offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "Peel Strength (N/cm)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [`${v} N/cm`, "Peel Strength"]} />
                <ReferenceLine y={lsl} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={2}
                               label={{ value: `LSL ${lsl} N/cm`, position: "right", fill: "#ef4444", fontSize: 9 }} />
                <Bar dataKey="strength" name="Peel Strength (N/cm)" maxBarSize={20}>
                  {sampleBars.map((d, i) => (
                    <Cell key={i} fill={d.pass ? "#93c5fd" : "#fca5a5"} stroke={d.pass ? "#3b82f6" : "#ef4444"} strokeWidth={0.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Degradation trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Adhesion Retention (%) by Conditioning</CardTitle>
            <CardDescription className="text-xs">Retention relative to initial values after each test sequence</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={degradationTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="condition" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[60, 110]} tick={{ fontSize: 10 }} label={{ value: "Retention (%)", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip formatter={(v: any) => [`${v}%`, ""]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 2"
                               label={{ value: "80% limit", fill: "#ef4444", fontSize: 9 }} />
                <Line type="monotone" dataKey="backsheet" stroke="#ef4444" name="Backsheet" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="encapsulant_glass" stroke="#22c55e" name="Encap-Glass" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="encapsulant_backsheet" stroke="#3b82f6" name="Encap-BS" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Condition comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mean Peel Strength by Condition & Material</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={conditionStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="condition" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "N/cm", angle: -90, position: "insideLeft", fontSize: 9 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={lsl} stroke="#ef4444" strokeDasharray="5 3"
                               label={{ value: `LSL=${lsl}`, fill: "#ef4444", fontSize: 9 }} />
                <Bar dataKey="backsheet" fill="#ef4444" name="Backsheet" />
                <Bar dataKey="encapsulant_glass" fill="#22c55e" name="Encap-Glass" />
                <Bar dataKey="encapsulant_backsheet" fill="#3b82f6" name="Encap-BS" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Failure mode distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Failure Mode Distribution</CardTitle>
            <CardDescription className="text-xs">Cohesive failure preferred; adhesive = delamination risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failureModeData.map(({ mode, count, pct }) => (
                <div key={mode}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium capitalize">{mode} Failure</span>
                    <span className="font-mono">{count} specimens ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-3 rounded-full" style={{ width: `${pct}%`, backgroundColor: FAILURE_COLORS[mode] }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {mode === "cohesive" && "Preferred: failure within adhesive layer (good adhesion)"}
                    {mode === "adhesive" && "Concern: failure at interface (poor adhesion, delamination risk)"}
                    {mode === "mixed" && "Acceptable: mixed cohesive/adhesive"}
                    {mode === "substrate" && "Substrate damage: adhesion stronger than material"}
                  </div>
                </div>
              ))}
            </div>

            {/* Standards reference */}
            <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <div className="font-semibold mb-1">Peel Test Standards:</div>
              <div>• IEC 61215-2 Cl.4.1 / ASTM D1876: T-peel at 50 mm/min</div>
              <div>• Specimen width: 25 mm, gauge length: 150 mm</div>
              <div>• Condition: 23°C ± 2°C, 50% ± 10% RH</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Before / After Summary with Statistics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Before vs After Conditioning – Statistical Summary</CardTitle>
          <CardDescription className="text-xs">Initial vs Post DH1000 · Mean ± StdDev · Retention ratio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-3 font-semibold">Material</th>
                  <th className="text-right py-2 pr-3 font-semibold" colSpan={4}>Before (N/cm)</th>
                  <th className="text-right py-2 pr-3 font-semibold" colSpan={4}>After DH1000 (N/cm)</th>
                  <th className="text-right py-2 pr-3 font-semibold">Retention</th>
                  <th className="text-center py-2 font-semibold">Result</th>
                </tr>
                <tr className="border-b text-muted-foreground">
                  <th className="py-1"></th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">Mean</th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">Min</th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">Max</th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">σ</th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">Mean</th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">Min</th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">Max</th>
                  <th className="text-right py-1 pr-3 text-xs font-normal">σ</th>
                  <th className="py-1"></th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody>
                {beforeAfterSummary.map(row => (
                  <tr key={row.material} className={`border-b ${!row.pass ? "bg-red-50" : ""}`}>
                    <td className="py-2 pr-3 font-medium">{row.material}</td>
                    <td className="py-2 pr-3 text-right font-mono font-semibold">{row.before.mean}</td>
                    <td className="py-2 pr-3 text-right font-mono text-muted-foreground">{row.before.min}</td>
                    <td className="py-2 pr-3 text-right font-mono text-muted-foreground">{row.before.max}</td>
                    <td className="py-2 pr-3 text-right font-mono text-purple-600">{row.before.stdDev}</td>
                    <td className="py-2 pr-3 text-right font-mono font-semibold">{row.after.mean}</td>
                    <td className="py-2 pr-3 text-right font-mono text-muted-foreground">{row.after.min}</td>
                    <td className="py-2 pr-3 text-right font-mono text-muted-foreground">{row.after.max}</td>
                    <td className="py-2 pr-3 text-right font-mono text-purple-600">{row.after.stdDev}</td>
                    <td className={`py-2 pr-3 text-right font-mono font-bold ${row.retention >= 80 ? "text-green-600" : "text-red-600"}`}>
                      {row.retention}%
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${row.pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {row.pass ? "PASS" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
