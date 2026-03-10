// @ts-nocheck
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ComposedChart, Area, AreaChart,
} from "recharts"
import { AlertTriangle, CheckCircle, TrendingUp, Activity } from "lucide-react"
import type { DataPoint } from "@/lib/data-analysis"

// Western Electric Rules detection
function detectWERules(values: number[], mean: number, sigma: number): {
  violations: { index: number; rule: string; color: string }[]
} {
  const violations: { index: number; rule: string; color: string }[] = []
  const ucl1 = mean + sigma
  const ucl2 = mean + 2 * sigma
  const ucl3 = mean + 3 * sigma
  const lcl1 = mean - sigma
  const lcl2 = mean - 2 * sigma
  const lcl3 = mean - 3 * sigma

  values.forEach((v, i) => {
    // Rule 1: Point beyond 3σ
    if (v > ucl3 || v < lcl3) {
      violations.push({ index: i, rule: "Rule 1: Beyond 3σ", color: "#ef4444" })
    }
    // Rule 2: 2 of 3 consecutive beyond 2σ (same side)
    if (i >= 2) {
      const prev = [values[i - 2], values[i - 1], v]
      const aboveCount = prev.filter(p => p > ucl2).length
      const belowCount = prev.filter(p => p < lcl2).length
      if (aboveCount >= 2 || belowCount >= 2) {
        violations.push({ index: i, rule: "Rule 2: 2 of 3 beyond 2σ", color: "#f97316" })
      }
    }
    // Rule 3: 4 of 5 consecutive beyond 1σ
    if (i >= 4) {
      const segment = values.slice(i - 4, i + 1)
      const above = segment.filter(p => p > ucl1).length
      const below = segment.filter(p => p < lcl1).length
      if (above >= 4 || below >= 4) {
        violations.push({ index: i, rule: "Rule 3: 4 of 5 beyond 1σ", color: "#f59e0b" })
      }
    }
    // Rule 4: 8 consecutive on same side
    if (i >= 7) {
      const segment = values.slice(i - 7, i + 1)
      if (segment.every(p => p > mean) || segment.every(p => p < mean)) {
        violations.push({ index: i, rule: "Rule 4: 8 in a row same side", color: "#8b5cf6" })
      }
    }
  })
  return { violations }
}

// Build subgroup X-bar and R chart data
function buildXbarRData(values: number[], subgroupSize: number = 5) {
  const subgroups: number[][] = []
  for (let i = 0; i < values.length; i += subgroupSize) {
    const sg = values.slice(i, i + subgroupSize)
    if (sg.length === subgroupSize) subgroups.push(sg)
  }

  const xbars = subgroups.map(sg => sg.reduce((a, b) => a + b, 0) / sg.length)
  const ranges = subgroups.map(sg => Math.max(...sg) - Math.min(...sg))

  const xbarMean = xbars.reduce((a, b) => a + b, 0) / xbars.length
  const rMean = ranges.reduce((a, b) => a + b, 0) / ranges.length

  // Control chart constants for n=5
  const A2 = 0.577; const D3 = 0; const D4 = 2.114

  const xbarUCL = xbarMean + A2 * rMean
  const xbarLCL = xbarMean - A2 * rMean
  const rUCL = D4 * rMean
  const rLCL = D3 * rMean

  return {
    xbarData: xbars.map((xbar, i) => ({ subgroup: i + 1, xbar: parseFloat(xbar.toFixed(3)), range: parseFloat(ranges[i].toFixed(3)) })),
    xbarMean, rMean, xbarUCL, xbarLCL, rUCL, rLCL,
    violations: detectWERules(xbars, xbarMean, (xbarUCL - xbarMean) / 3)
  }
}

interface SPCControlChartsProps {
  data: DataPoint[]
  parameter: string
  parameterLabel: string
  unit: string
  lsl: number
  usl: number
}

const CustomSPCDot = (props: any) => {
  const { cx, cy, payload, violations } = props
  const isViolation = violations.some((v: any) => v.index === payload?.index)
  if (isViolation) {
    const viol = violations.find((v: any) => v.index === payload?.index)
    return <circle cx={cx} cy={cy} r={5} fill={viol?.color} stroke="white" strokeWidth={1} />
  }
  return <circle cx={cx} cy={cy} r={3} fill="#2563eb" stroke="white" strokeWidth={1} />
}

export function SPCControlCharts({ data, parameter, parameterLabel, unit, lsl, usl }: SPCControlChartsProps) {
  const [subgroupSize, setSubgroupSize] = useState(5)

  const values = useMemo(() => data.map(d => d[parameter] as number), [data, parameter])

  const mean = useMemo(() => values.reduce((a, b) => a + b, 0) / values.length, [values])
  const stdDev = useMemo(() => {
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1)
    return Math.sqrt(variance)
  }, [values, mean])

  const ucl = mean + 3 * stdDev
  const lcl = mean - 3 * stdDev
  const ucl1 = mean + stdDev
  const ucl2 = mean + 2 * stdDev
  const lcl1 = mean - stdDev
  const lcl2 = mean - 2 * stdDev

  const { violations } = useMemo(() => detectWERules(values, mean, stdDev), [values, mean, stdDev])

  const individualChartData = useMemo(() =>
    values.map((v, i) => ({
      index: i,
      value: parseFloat(v.toFixed(3)),
      mr: i > 0 ? parseFloat(Math.abs(v - values[i - 1]).toFixed(3)) : 0,
    })), [values])

  const { xbarData, xbarMean, rMean, xbarUCL, xbarLCL, rUCL, rLCL } =
    useMemo(() => buildXbarRData(values, subgroupSize), [values, subgroupSize])

  const violationSummary = useMemo(() => {
    const counts: Record<string, number> = {}
    violations.forEach(v => {
      counts[v.rule] = (counts[v.rule] || 0) + 1
    })
    return Object.entries(counts).map(([rule, count]) => ({ rule, count }))
  }, [violations])

  const CustomDot = (props: any) => {
    const { cx, cy, index } = props
    const isViolation = violations.some(v => v.index === index)
    if (isViolation) {
      const viol = violations.find(v => v.index === index)
      return <circle cx={cx} cy={cy} r={5} fill={viol?.color} stroke="white" strokeWidth={1} />
    }
    return <circle cx={cx} cy={cy} r={2} fill="#2563eb" />
  }

  return (
    <div className="space-y-4">
      {/* WE Rules Violations Summary */}
      {violationSummary.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-amber-800 mb-1">
                  Western Electric Rule Violations Detected
                </div>
                <div className="flex flex-wrap gap-2">
                  {violationSummary.map(({ rule, count }) => (
                    <Badge key={rule} variant="outline" className="text-xs border-amber-300 text-amber-800">
                      {rule}: {count} occurrence{count > 1 ? "s" : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Process in statistical control – No Western Electric rule violations detected</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Individual (I) Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Individual (I) Chart – {parameterLabel}
            </CardTitle>
            <CardDescription className="text-xs">
              UCL={ucl.toFixed(3)} | Mean={mean.toFixed(3)} | LCL={lcl.toFixed(3)} | σ={stdDev.toFixed(3)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={individualChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="index" tick={{ fontSize: 10 }} label={{ value: "Sample", position: "insideBottom", offset: -3, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]}
                       label={{ value: `${parameterLabel} (${unit})`, angle: -90, position: "insideLeft", fontSize: 10 }} />
                <Tooltip formatter={(v: any) => [`${v} ${unit}`, parameterLabel]} labelFormatter={(l) => `Sample ${l}`} />

                {/* Zone fills */}
                <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5}
                               label={{ value: "UCL", position: "right", fill: "#ef4444", fontSize: 9 }} />
                <ReferenceLine y={ucl2} stroke="#f97316" strokeDasharray="3 3" strokeWidth={1}
                               label={{ value: "+2σ", position: "right", fill: "#f97316", fontSize: 9 }} />
                <ReferenceLine y={ucl1} stroke="#f59e0b" strokeDasharray="2 2" strokeWidth={1}
                               label={{ value: "+1σ", position: "right", fill: "#f59e0b", fontSize: 9 }} />
                <ReferenceLine y={mean} stroke="#22c55e" strokeWidth={1.5}
                               label={{ value: "X̄", position: "right", fill: "#22c55e", fontSize: 9 }} />
                <ReferenceLine y={lcl1} stroke="#f59e0b" strokeDasharray="2 2" strokeWidth={1}
                               label={{ value: "-1σ", position: "right", fill: "#f59e0b", fontSize: 9 }} />
                <ReferenceLine y={lcl2} stroke="#f97316" strokeDasharray="3 3" strokeWidth={1}
                               label={{ value: "-2σ", position: "right", fill: "#f97316", fontSize: 9 }} />
                <ReferenceLine y={lcl} stroke="#ef4444" strokeDasharray="5 3" strokeWidth={1.5}
                               label={{ value: "LCL", position: "right", fill: "#ef4444", fontSize: 9 }} />

                {/* Spec limits */}
                <ReferenceLine y={usl} stroke="#dc2626" strokeDasharray="8 4" strokeWidth={2}
                               label={{ value: "USL", position: "right", fill: "#dc2626", fontSize: 9 }} />
                <ReferenceLine y={lsl} stroke="#dc2626" strokeDasharray="8 4" strokeWidth={2}
                               label={{ value: "LSL", position: "right", fill: "#dc2626", fontSize: 9 }} />

                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={1.5}
                      dot={<CustomDot />} name={parameterLabel} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Moving Range (MR) Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Moving Range (MR) Chart
            </CardTitle>
            <CardDescription className="text-xs">
              Consecutive point variation – UCL(MR) = d4 × MR̄
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={individualChartData.slice(1)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="index" tick={{ fontSize: 10 }} label={{ value: "Sample", position: "insideBottom", offset: -3, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: "Moving Range", angle: -90, position: "insideLeft", fontSize: 10 }} />
                <Tooltip />
                {(() => {
                  const mrValues = individualChartData.slice(1).map(d => d.mr)
                  const mrMean = mrValues.reduce((a, b) => a + b, 0) / mrValues.length
                  const mrUCL = 3.267 * mrMean
                  return (
                    <>
                      <ReferenceLine y={mrUCL} stroke="#ef4444" strokeDasharray="5 3"
                                     label={{ value: `UCL=${mrUCL.toFixed(3)}`, position: "right", fill: "#ef4444", fontSize: 9 }} />
                      <ReferenceLine y={mrMean} stroke="#22c55e"
                                     label={{ value: `MR̄=${mrMean.toFixed(3)}`, position: "right", fill: "#22c55e", fontSize: 9 }} />
                    </>
                  )
                })()}
                <Bar dataKey="mr" fill="#8b5cf6" opacity={0.7} name="Moving Range" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* X-bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">X̄ (X-bar) Chart</CardTitle>
                <CardDescription className="text-xs">
                  Subgroup means – n={subgroupSize} | UCL={xbarUCL.toFixed(3)} | X̿={xbarMean.toFixed(3)} | LCL={xbarLCL.toFixed(3)}
                </CardDescription>
              </div>
              <select value={subgroupSize} onChange={e => setSubgroupSize(parseInt(e.target.value))}
                      className="text-xs border rounded px-1 py-0.5">
                {[2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>n={n}</option>)}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={xbarData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="subgroup" tick={{ fontSize: 10 }} label={{ value: "Subgroup", position: "insideBottom", offset: -3, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                <Tooltip />
                <ReferenceLine y={xbarUCL} stroke="#ef4444" strokeDasharray="5 3"
                               label={{ value: "UCL", position: "right", fill: "#ef4444", fontSize: 9 }} />
                <ReferenceLine y={xbarMean} stroke="#22c55e"
                               label={{ value: "X̿", position: "right", fill: "#22c55e", fontSize: 9 }} />
                <ReferenceLine y={xbarLCL} stroke="#ef4444" strokeDasharray="5 3"
                               label={{ value: "LCL", position: "right", fill: "#ef4444", fontSize: 9 }} />
                <Line type="monotone" dataKey="xbar" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="X̄" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* R Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">R (Range) Chart</CardTitle>
            <CardDescription className="text-xs">
              Subgroup ranges – n={subgroupSize} | UCL={rUCL.toFixed(3)} | R̄={rMean.toFixed(3)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={xbarData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="subgroup" tick={{ fontSize: 10 }} label={{ value: "Subgroup", position: "insideBottom", offset: -3, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <ReferenceLine y={rUCL} stroke="#ef4444" strokeDasharray="5 3"
                               label={{ value: `UCL=${rUCL.toFixed(3)}`, position: "right", fill: "#ef4444", fontSize: 9 }} />
                <ReferenceLine y={rMean} stroke="#22c55e"
                               label={{ value: `R̄=${rMean.toFixed(3)}`, position: "right", fill: "#22c55e", fontSize: 9 }} />
                <Bar dataKey="range" fill="#06b6d4" opacity={0.7} name="Range" />
                <Line type="monotone" dataKey="range" stroke="#0284c7" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* WE Rules Reference */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-gray-500">Western Electric Rules Reference (out-of-control signals)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { rule: "Rule 1", desc: "1 point beyond ±3σ (UCL/LCL)", color: "bg-red-100 text-red-700" },
              { rule: "Rule 2", desc: "2 of 3 consecutive beyond ±2σ (same side)", color: "bg-orange-100 text-orange-700" },
              { rule: "Rule 3", desc: "4 of 5 consecutive beyond ±1σ (same side)", color: "bg-amber-100 text-amber-700" },
              { rule: "Rule 4", desc: "8 consecutive on same side of center line", color: "bg-purple-100 text-purple-700" },
            ].map(({ rule, desc, color }) => (
              <div key={rule} className={`p-2 rounded text-xs ${color}`}>
                <div className="font-semibold mb-0.5">{rule}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
