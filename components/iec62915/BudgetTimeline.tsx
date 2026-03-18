// @ts-nocheck
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, PieChart, Pie, LineChart, Line, ReferenceLine,
} from "recharts"
import { DollarSign, Clock, Users, CalendarDays, TrendingUp } from "lucide-react"
import {
  TEST_DEFINITIONS, TEST_SEQUENCES,
  getRequiredTestsForChanges, getAffectedSequences,
  estimateTotalCost, estimatePersonnelHours, estimateSamplesNeeded,
  estimateTotalDuration,
} from "@/lib/iec62915-data"

interface BudgetTimelineProps {
  selectedChanges: string[]
}

const SEQ_COLORS: Record<string, string> = {
  A: "#3b82f6", B: "#22c55e", C: "#f59e0b", D: "#8b5cf6", E: "#ef4444",
}

export function BudgetTimeline({ selectedChanges }: BudgetTimelineProps) {
  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const affectedSequences = useMemo(() => getAffectedSequences(requiredTestIds), [requiredTestIds])
  const totalCost = useMemo(() => estimateTotalCost(requiredTestIds), [requiredTestIds])
  const totalPersonnel = useMemo(() => estimatePersonnelHours(requiredTestIds), [requiredTestIds])
  const longestPath = useMemo(() => estimateTotalDuration(requiredTestIds), [requiredTestIds])
  const samples = useMemo(() => estimateSamplesNeeded(requiredTestIds), [requiredTestIds])

  // Gantt data: each sequence has tests, mapped to start/end weeks
  const ganttData = useMemo(() => {
    const data: { sequence: string; test: string; startWeek: number; durationWeeks: number; color: string }[] = []
    for (const seq of TEST_SEQUENCES) {
      if (!affectedSequences.includes(seq.id)) continue
      let weekOffset = 1 // week 1 = initial measurements
      const seqTests = seq.tests.filter(t => requiredTestIds.includes(t))
      for (const testId of seqTests) {
        const test = TEST_DEFINITIONS[testId]
        if (!test) continue
        const durationWeeks = Math.max(0.5, test.durationHours / 168) // 168h per week
        data.push({
          sequence: seq.id,
          test: test.mqt || test.mst || test.id,
          startWeek: weekOffset,
          durationWeeks: parseFloat(durationWeeks.toFixed(1)),
          color: seq.color,
        })
        weekOffset += durationWeeks
      }
    }
    return data
  }, [requiredTestIds, affectedSequences])

  // Timeline chart: grouped by sequence, showing stacked bars
  const timelineBySequence = useMemo(() => {
    return affectedSequences.map(seqId => {
      const seqTests = ganttData.filter(d => d.sequence === seqId)
      const totalWeeks = seqTests.reduce((s, t) => s + t.durationWeeks, 0)
      return {
        sequence: `Seq ${seqId}`,
        weeks: parseFloat(totalWeeks.toFixed(1)),
        color: SEQ_COLORS[seqId] || "#999",
      }
    })
  }, [ganttData, affectedSequences])

  // Cost breakdown by category
  const costBreakdown = useMemo(() => {
    const categories: Record<string, number> = {
      "Environmental (TC/DH/HF/UV)": 0,
      "Electrical (Pmax/Insulation)": 0,
      "Mechanical (Load/Hail)": 0,
      "Safety (MST)": 0,
      "Characterization": 0,
    }
    for (const id of requiredTestIds) {
      const t = TEST_DEFINITIONS[id]
      if (!t) continue
      if (id.startsWith("MST")) categories["Safety (MST)"] += t.costEstimateUSD
      else if (["MQT_10", "MQT_11", "MQT_12", "MQT_13", "MQT_21"].includes(id)) categories["Environmental (TC/DH/HF/UV)"] += t.costEstimateUSD
      else if (["MQT_16", "MQT_17", "MQT_20", "MQT_22"].includes(id)) categories["Mechanical (Load/Hail)"] += t.costEstimateUSD
      else if (["MQT_02", "MQT_03", "MQT_15", "MQT_18"].includes(id)) categories["Electrical (Pmax/Insulation)"] += t.costEstimateUSD
      else categories["Characterization"] += t.costEstimateUSD
    }
    return Object.entries(categories)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [requiredTestIds])

  const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]

  // Equipment utilization
  const equipmentData = useMemo(() => {
    const eqMap: Record<string, number> = {}
    for (const id of requiredTestIds) {
      const t = TEST_DEFINITIONS[id]
      if (!t) continue
      for (const eq of t.equipment) {
        eqMap[eq] = (eqMap[eq] || 0) + t.durationHours
      }
    }
    return Object.entries(eqMap)
      .map(([name, hours]) => ({ name: name.length > 25 ? name.slice(0, 25) + "…" : name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 10)
  }, [requiredTestIds])

  // Milestones
  const totalWeeks = Math.max(...timelineBySequence.map(t => t.weeks), 0)
  const milestones = useMemo(() => {
    const items = [
      { week: 0, label: "Sample receipt & initial measurements", done: false },
      { week: 1, label: "Stabilization complete", done: false },
    ]
    if (affectedSequences.includes("A")) items.push({ week: 4, label: "Seq A characterization complete", done: false })
    if (affectedSequences.includes("B")) items.push({ week: Math.ceil(totalWeeks * 0.6), label: "Seq B (UV+TC200+HF10) complete", done: false })
    if (affectedSequences.includes("C")) items.push({ week: Math.ceil(totalWeeks * 0.8), label: "Seq C (UV+DH1000) complete", done: false })
    if (affectedSequences.includes("D")) items.push({ week: Math.ceil(totalWeeks * 0.5), label: "Seq D (Mechanical) complete", done: false })
    if (affectedSequences.includes("E")) items.push({ week: Math.ceil(totalWeeks * 0.4), label: "Seq E (Hail+PID) complete", done: false })
    items.push({ week: Math.ceil(totalWeeks) + 1, label: "Final measurements & report", done: false })
    return items.sort((a, b) => a.week - b.week)
  }, [affectedSequences, totalWeeks])

  if (selectedChanges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No design changes selected.</p>
          <p className="text-xs text-muted-foreground mt-1">Select BoM changes to see budget and timeline estimates.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">${totalCost.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Est. Test Fees</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{Math.ceil(totalWeeks)} wk</div>
            <div className="text-xs text-muted-foreground">Longest Path</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{totalPersonnel.toLocaleString()}h</div>
            <div className="text-xs text-muted-foreground">Person-Hours</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{samples.iec61215 + samples.iec61730}</div>
            <div className="text-xs text-muted-foreground">Total Modules</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-cyan-600">${(samples.iec61215 + samples.iec61730) * 150}</div>
            <div className="text-xs text-muted-foreground">Sample Cost</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-red-600">${(totalCost + (samples.iec61215 + samples.iec61730) * 150).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Grand Total</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gantt-style Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Test Sequence Timeline (Weeks)
            </CardTitle>
            <CardDescription className="text-xs">Sequences run in parallel; bars show total duration per sequence</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timelineBySequence} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: "Weeks", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis dataKey="sequence" type="category" tick={{ fontSize: 10 }} width={50} />
                <Tooltip formatter={(v: number) => [`${v} weeks`, "Duration"]} />
                <Bar dataKey="weeks" name="Duration (weeks)" maxBarSize={30} radius={[0, 4, 4, 0]}>
                  {timelineBySequence.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Cost Breakdown by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name.split("(")[0].trim()} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "#999", strokeWidth: 1 }}
                >
                  {costBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Cost"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment Utilization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              Equipment Utilization (Top 10)
            </CardTitle>
            <CardDescription className="text-xs">Hours of usage per equipment item</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={equipmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: "Hours", position: "insideBottom", offset: -5, fontSize: 9 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={130} />
                <Tooltip formatter={(v: number) => [`${v}h`, "Usage"]} />
                <Bar dataKey="hours" name="Hours" fill="#8b5cf6" maxBarSize={18} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              Key Milestones
            </CardTitle>
            <CardDescription className="text-xs">Estimated timeline markers for the test program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                      m.done ? "bg-green-500 border-green-500" : "bg-white border-gray-400"
                    }`} />
                    {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">Week {m.week}</Badge>
                      <span className="text-xs">{m.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Estimate Template */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cost Estimate Summary</CardTitle>
          <CardDescription className="text-xs">Detailed cost breakdown for the re-qualification program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-semibold">Category</th>
                  <th className="text-right py-2 px-3 font-semibold">Quantity</th>
                  <th className="text-right py-2 px-3 font-semibold">Unit Cost</th>
                  <th className="text-right py-2 px-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Test Fees (Lab)</td>
                  <td className="py-2 px-3 text-right font-mono">{requiredTestIds.length} tests</td>
                  <td className="py-2 px-3 text-right font-mono">—</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-green-700">${totalCost.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Sample Modules (IEC 61215)</td>
                  <td className="py-2 px-3 text-right font-mono">{samples.iec61215} modules</td>
                  <td className="py-2 px-3 text-right font-mono">$150</td>
                  <td className="py-2 px-3 text-right font-mono">${(samples.iec61215 * 150).toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Sample Modules (IEC 61730)</td>
                  <td className="py-2 px-3 text-right font-mono">{samples.iec61730} modules</td>
                  <td className="py-2 px-3 text-right font-mono">$150</td>
                  <td className="py-2 px-3 text-right font-mono">${(samples.iec61730 * 150).toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Personnel</td>
                  <td className="py-2 px-3 text-right font-mono">{totalPersonnel}h</td>
                  <td className="py-2 px-3 text-right font-mono">$50/h</td>
                  <td className="py-2 px-3 text-right font-mono">${(totalPersonnel * 50).toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Shipping & Handling</td>
                  <td className="py-2 px-3 text-right font-mono">1 lot</td>
                  <td className="py-2 px-3 text-right font-mono">$500</td>
                  <td className="py-2 px-3 text-right font-mono">$500</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Report & Documentation</td>
                  <td className="py-2 px-3 text-right font-mono">1 lot</td>
                  <td className="py-2 px-3 text-right font-mono">$1,000</td>
                  <td className="py-2 px-3 text-right font-mono">$1,000</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold bg-green-50">
                  <td className="py-2.5 px-3" colSpan={3}>GRAND TOTAL ESTIMATE</td>
                  <td className="py-2.5 px-3 text-right font-mono text-green-700 text-sm">
                    ${(totalCost + (samples.iec61215 + samples.iec61730) * 150 + totalPersonnel * 50 + 1500).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
