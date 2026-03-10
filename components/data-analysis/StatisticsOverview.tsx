// @ts-nocheck
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Cell
} from "recharts"
import { CheckCircle, XCircle, AlertTriangle, TrendingUp, Sigma, BarChart3 } from "lucide-react"
import { calculateStatistics, generateHistogram, IEC_TOLERANCES, PARAMETER_LABELS } from "@/lib/data-analysis"
import type { DataPoint } from "@/lib/data-analysis"

// Anderson-Darling test approximation (simplified)
function andersonDarlingNormality(values: number[]): { statistic: number; pValue: string; isNormal: boolean } {
  const n = values.length
  if (n < 8) return { statistic: 0, pValue: "n/a", isNormal: true }
  const sorted = [...values].sort((a, b) => a - b)
  const mean = sorted.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1))

  // Approximate normal CDF
  const erf = (x: number) => {
    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)
    const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429
    const p=0.3275911
    const t = 1 / (1 + p * x)
    const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x)
    return sign * y
  }
  const normCDF = (x: number) => 0.5 * (1 + erf((x - mean) / (std * Math.SQRT2)))

  let S = 0
  for (let i = 0; i < n; i++) {
    const p = Math.max(1e-10, Math.min(1 - 1e-10, normCDF(sorted[i])))
    S += (2 * (i + 1) - 1) * (Math.log(p) + Math.log(1 - normCDF(sorted[n - 1 - i])))
  }
  const A2 = -n - S / n

  const isNormal = A2 < 0.752 // p > 0.05 approx threshold
  const pValue = A2 < 0.341 ? ">0.5" : A2 < 0.470 ? ">0.25" : A2 < 0.631 ? ">0.1" : A2 < 0.752 ? ">0.05" : "<0.05"
  return { statistic: parseFloat(A2.toFixed(4)), pValue, isNormal }
}

// Shapiro-Wilk W approximation
function skewnessKurtosis(values: number[]): { skewness: number; kurtosis: number } {
  const n = values.length
  const mean = values.reduce((a, b) => a + b, 0) / n
  const m2 = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const m3 = values.reduce((s, v) => s + (v - mean) ** 3, 0) / n
  const m4 = values.reduce((s, v) => s + (v - mean) ** 4, 0) / n
  const std = Math.sqrt(m2)
  return {
    skewness: parseFloat((m3 / (std ** 3)).toFixed(3)),
    kurtosis: parseFloat((m4 / (m2 ** 2) - 3).toFixed(3)),
  }
}

interface StatisticsOverviewProps {
  data: DataPoint[]
}

const PARAM_KEYS = ["pmax", "voc", "isc", "ff", "efficiency"] as const
type ParamKey = typeof PARAM_KEYS[number]

export function StatisticsOverview({ data }: StatisticsOverviewProps) {
  const paramStats = useMemo(() => {
    return PARAM_KEYS.map(key => {
      const values = data.map(d => d[key] as number)
      const tol = IEC_TOLERANCES[key]
      const stats = calculateStatistics(values, tol.lsl, tol.usl)
      const cv = stats.mean !== 0 ? parseFloat(((stats.stdDev / stats.mean) * 100).toFixed(2)) : 0
      const normTest = andersonDarlingNormality(values)
      const { skewness, kurtosis } = skewnessKurtosis(values)
      const histogram = generateHistogram(values, 10)

      // Normal curve overlay data
      const range = stats.max - stats.min
      const padding = range * 0.15
      const normalCurveData = Array.from({ length: 40 }, (_, i) => {
        const x = (stats.min - padding) + (i / 39) * (range + 2 * padding)
        const z = (x - stats.mean) / (stats.stdDev || 1)
        const y = (1 / ((stats.stdDev || 1) * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z)
        const maxCount = Math.max(...histogram.map(b => b.count))
        const scaledY = y * maxCount * (histogram[0]?.midpoint ? (histogram[1]?.midpoint - histogram[0]?.midpoint) || 1 : 1) * 5
        return { x: parseFloat(x.toFixed(3)), y: parseFloat(scaledY.toFixed(4)) }
      })

      // Histogram with color coding
      const histWithColor = histogram.map(bin => ({
        ...bin,
        color: bin.midpoint < tol.lsl || bin.midpoint > tol.usl ? "#ef4444" : "#3b82f6",
        outOfSpec: bin.midpoint < tol.lsl || bin.midpoint > tol.usl,
      }))

      return {
        key, label: PARAMETER_LABELS[key], unit: tol.unit,
        ...stats, cv, normTest, skewness, kurtosis,
        histogram: histWithColor, normalCurveData,
        range: parseFloat((stats.max - stats.min).toFixed(4)),
        pp: stats.stdDev > 0 ? parseFloat(((tol.usl - tol.lsl) / (6 * stats.stdDev)).toFixed(3)) : 0,
        ppk: stats.stdDev > 0 ? parseFloat(Math.min((tol.usl - stats.mean) / (3 * stats.stdDev), (stats.mean - tol.lsl) / (3 * stats.stdDev)).toFixed(3)) : 0,
      }
    })
  }, [data])

  const getCapabilityColor = (cpk: number) =>
    cpk >= 1.67 ? "text-green-600" : cpk >= 1.33 ? "text-blue-600" : cpk >= 1.0 ? "text-amber-600" : "text-red-600"

  const getCapabilityLabel = (cpk: number) =>
    cpk >= 1.67 ? "Excellent" : cpk >= 1.33 ? "Capable" : cpk >= 1.0 ? "Marginal" : "Incapable"

  return (
    <div className="space-y-6">
      {/* JMP-style Capability Summary Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sigma className="h-4 w-4 text-blue-500" />
            Process Capability Summary (JMP-Level Statistics)
          </CardTitle>
          <CardDescription className="text-xs">Cp, Cpk, Pp, Ppk, CV%, Normality Test for all IEC parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  {["Parameter", "n", "Mean", "Std Dev", "Min", "Max", "CV%", "Cp", "Cpk", "Pp", "Ppk", "Skewness", "Kurtosis", "Normality (A-D)", "Capability"].map(h => (
                    <th key={h} className="text-left py-2 pr-3 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paramStats.map(p => (
                  <tr key={p.key} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-3 font-medium whitespace-nowrap">{p.label} ({p.unit})</td>
                    <td className="py-2 pr-3 font-mono">{p.count}</td>
                    <td className="py-2 pr-3 font-mono">{p.mean.toFixed(3)}</td>
                    <td className="py-2 pr-3 font-mono">{p.stdDev.toFixed(4)}</td>
                    <td className="py-2 pr-3 font-mono">{p.min.toFixed(3)}</td>
                    <td className="py-2 pr-3 font-mono">{p.max.toFixed(3)}</td>
                    <td className={`py-2 pr-3 font-mono font-semibold ${p.cv > 5 ? "text-amber-600" : "text-green-600"}`}>{p.cv}%</td>
                    <td className={`py-2 pr-3 font-mono font-bold ${getCapabilityColor(p.cp)}`}>{p.cp.toFixed(3)}</td>
                    <td className={`py-2 pr-3 font-mono font-bold ${getCapabilityColor(p.cpk)}`}>{p.cpk.toFixed(3)}</td>
                    <td className="py-2 pr-3 font-mono">{p.pp.toFixed(3)}</td>
                    <td className="py-2 pr-3 font-mono">{p.ppk.toFixed(3)}</td>
                    <td className={`py-2 pr-3 font-mono ${Math.abs(p.skewness) > 0.5 ? "text-amber-600" : "text-gray-700"}`}>{p.skewness}</td>
                    <td className={`py-2 pr-3 font-mono ${Math.abs(p.kurtosis) > 1 ? "text-amber-600" : "text-gray-700"}`}>{p.kurtosis}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${p.normTest.isNormal ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        A²={p.normTest.statistic} p{p.normTest.pValue}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getCapabilityColor(p.cpk)} bg-opacity-10
                        ${p.cpk >= 1.67 ? "bg-green-100" : p.cpk >= 1.33 ? "bg-blue-100" : p.cpk >= 1.0 ? "bg-amber-100" : "bg-red-100"}`}>
                        {getCapabilityLabel(p.cpk)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Capability Color Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: "Cpk ≥ 1.67 – World Class", color: "text-green-600 bg-green-100" },
          { label: "Cpk ≥ 1.33 – Capable", color: "text-blue-600 bg-blue-100" },
          { label: "Cpk ≥ 1.00 – Marginal", color: "text-amber-600 bg-amber-100" },
          { label: "Cpk < 1.00 – Incapable", color: "text-red-600 bg-red-100" },
        ].map(({ label, color }) => (
          <span key={label} className={`px-2 py-0.5 rounded font-medium ${color}`}>{label}</span>
        ))}
      </div>

      {/* Histograms with Normal Distribution Overlay */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-purple-500" />
          Histograms with Normal Distribution Overlay & Spec Limits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paramStats.map(p => {
            const outOfSpecCount = p.histogram.reduce((s: number, b: any) => s + (b.outOfSpec ? b.count : 0), 0)
            return (
              <Card key={p.key}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold flex items-center justify-between">
                    <span>{p.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getCapabilityColor(p.cpk)} ${p.cpk >= 1.33 ? "bg-green-100" : p.cpk >= 1.0 ? "bg-amber-100" : "bg-red-100"}`}>
                      Cpk={p.cpk.toFixed(3)}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Mean={p.mean.toFixed(3)} σ={p.stdDev.toFixed(4)} CV={p.cv}%
                    {outOfSpecCount > 0 && <span className="text-red-500 ml-2">⚠ {outOfSpecCount} out-of-spec</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={p.histogram} margin={{ right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="midpoint" tick={{ fontSize: 9 }} tickFormatter={v => v.toFixed(1)} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip
                        formatter={(v: any, name: string) => name === "count" ? [v, "Count"] : [v.toFixed(4), "Normal PDF"]}
                        labelFormatter={(l) => `${l} ${p.unit}`}
                      />
                      {/* LSL/USL reference lines */}
                      <ReferenceLine x={p.lsl} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5}
                                     label={{ value: "LSL", position: "top", fill: "#ef4444", fontSize: 8 }} />
                      <ReferenceLine x={p.usl} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1.5}
                                     label={{ value: "USL", position: "top", fill: "#ef4444", fontSize: 8 }} />
                      <ReferenceLine x={p.mean} stroke="#22c55e" strokeWidth={1.5}
                                     label={{ value: "X̄", position: "top", fill: "#22c55e", fontSize: 8 }} />
                      <Bar dataKey="count" name="count" maxBarSize={40}>
                        {p.histogram.map((bin: any, i: number) => (
                          <Cell key={i} fill={bin.outOfSpec ? "#fca5a5" : "#93c5fd"} stroke={bin.outOfSpec ? "#ef4444" : "#3b82f6"} strokeWidth={0.5} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>

                  {/* Mini stats footer */}
                  <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-400">Range</div>
                      <div className="font-mono font-medium">{p.range.toFixed(3)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Skew</div>
                      <div className={`font-mono font-medium ${Math.abs(p.skewness) > 0.5 ? "text-amber-600" : "text-gray-700"}`}>{p.skewness}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Kurt</div>
                      <div className={`font-mono font-medium ${Math.abs(p.kurtosis) > 1 ? "text-amber-600" : "text-gray-700"}`}>{p.kurtosis}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Normality Test Reference */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4 pb-4">
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Anderson-Darling Normality Test:</span> H₀ = data follows normal distribution.{" "}
            <span className="font-mono">A² &lt; 0.752</span> → p &gt; 0.05 → fail to reject H₀ (data consistent with normality).{" "}
            Skewness |s| &lt; 0.5 = near-symmetric. Kurtosis |k| &lt; 1 = near-mesokurtic (normal tails).
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
