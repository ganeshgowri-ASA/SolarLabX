// @ts-nocheck
"use client"

import { useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine,
} from "recharts"
import { CalendarDays, AlertTriangle } from "lucide-react"
import {
  getRequiredTestsForChanges, getAffectedSequences,
  estimateTotalDuration,
} from "@/lib/iec62915-data"

interface CertificationTimelineProps {
  selectedChanges: string[]
}

interface Phase {
  id: string
  name: string
  minWeeks: number
  maxWeeks: number
  weeks: number
  color: string
  description: string
  editable: boolean
  isCritical?: boolean
}

const DEFAULT_PHASES: Omit<Phase, "isCritical">[] = [
  { id: "design", name: "Design Review & Documentation", minWeeks: 2, maxWeeks: 4, weeks: 3, color: "#3b82f6", description: "BoM change documentation, design files preparation, IEC 62915 classification", editable: true },
  { id: "sampling", name: "Sample Procurement", minWeeks: 2, maxWeeks: 6, weeks: 4, color: "#06b6d4", description: "Module sampling from production, shipping to test lab", editable: true },
  { id: "iec_testing", name: "IEC 61215/61730 Testing", minWeeks: 8, maxWeeks: 24, weeks: 16, color: "#8b5cf6", description: "Type testing per IEC 61215/61730 as determined by IEC 62915 assessment", editable: true },
  { id: "report", name: "Test Report Generation", minWeeks: 1, maxWeeks: 2, weeks: 2, color: "#22c55e", description: "Lab generates official test report with results", editable: true },
  { id: "cb_review", name: "CB/Certification Body Review", minWeeks: 2, maxWeeks: 4, weeks: 3, color: "#f59e0b", description: "Certification body reviews test reports and issues updated certificate", editable: true },
  { id: "bis_reg", name: "BIS Registration Update", minWeeks: 4, maxWeeks: 8, weeks: 6, color: "#ef4444", description: "Update BIS CRS registration with new BoM, IS 14286 compliance", editable: true },
  { id: "almm", name: "ALMM Listing Update", minWeeks: 8, maxWeeks: 12, weeks: 10, color: "#ec4899", description: "Update ALMM Part I listing with MNRE, requires BIS registration", editable: true },
  { id: "production", name: "Production Clearance", minWeeks: 1, maxWeeks: 2, weeks: 1, color: "#84cc16", description: "Final clearance for mass production with updated BoM", editable: true },
]

export function CertificationTimeline({ selectedChanges }: CertificationTimelineProps) {
  const [phases, setPhases] = useState<Phase[]>(
    DEFAULT_PHASES.map(p => ({ ...p, isCritical: false }))
  )

  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const affectedSequences = useMemo(() => getAffectedSequences(requiredTestIds), [requiredTestIds])
  const testDurationHours = useMemo(() => estimateTotalDuration(requiredTestIds), [requiredTestIds])

  // Auto-adjust IEC testing phase based on actual test duration
  const adjustedPhases = useMemo(() => {
    const testWeeks = Math.max(8, Math.ceil(testDurationHours / 168))
    return phases.map(p => {
      if (p.id === "iec_testing" && selectedChanges.length > 0) {
        return { ...p, weeks: Math.max(p.weeks, testWeeks) }
      }
      return p
    })
  }, [phases, testDurationHours, selectedChanges])

  // Calculate cumulative start weeks and critical path
  const ganttData = useMemo(() => {
    let cumulativeStart = 0
    const data = adjustedPhases.map(phase => {
      const start = cumulativeStart
      cumulativeStart += phase.weeks
      return {
        ...phase,
        startWeek: start,
        endWeek: start + phase.weeks,
      }
    })

    // Mark critical path (longest contiguous path - here it&apos;s all sequential)
    const totalWeeks = data[data.length - 1]?.endWeek || 0
    // Mark phases that are on the longest path (BIS + ALMM are typically critical)
    return data.map(d => ({
      ...d,
      isCritical: d.id === "iec_testing" || d.id === "bis_reg" || d.id === "almm",
    }))
  }, [adjustedPhases])

  const totalWeeks = ganttData[ganttData.length - 1]?.endWeek || 0
  const totalMonths = (totalWeeks / 4.33).toFixed(1)

  const handleWeeksChange = useCallback((id: string, value: number) => {
    setPhases(prev => prev.map(p => {
      if (p.id !== id) return p
      return { ...p, weeks: Math.max(p.minWeeks, Math.min(p.maxWeeks, value)) }
    }))
  }, [])

  // Recharts Gantt data
  const chartData = ganttData.map(d => ({
    name: d.name.length > 20 ? d.name.slice(0, 20) + "..." : d.name,
    fullName: d.name,
    start: d.startWeek,
    duration: d.weeks,
    color: d.color,
    isCritical: d.isCritical,
  }))

  if (selectedChanges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No design changes selected.</p>
          <p className="text-xs text-muted-foreground mt-1">Select BoM changes to see the certification timeline.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{totalWeeks} wk</div>
            <div className="text-xs text-muted-foreground">Total Duration</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{totalMonths} mo</div>
            <div className="text-xs text-muted-foreground">~Months</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{ganttData.filter(d => d.isCritical).length}</div>
            <div className="text-xs text-muted-foreground">Critical Path Items</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">{adjustedPhases.length}</div>
            <div className="text-xs text-muted-foreground">Phases</div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            Certification Gantt Chart
          </CardTitle>
          <CardDescription className="text-xs">
            Sequential phases from design review to production clearance. Red border = critical path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Custom SVG Gantt */}
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 800 ${ganttData.length * 40 + 60}`} className="w-full" style={{ minWidth: 600 }}>
              {/* Grid lines */}
              {Array.from({ length: Math.ceil(totalWeeks / 4) + 1 }, (_, i) => i * 4).map(week => (
                <g key={`grid-${week}`}>
                  <line x1={180 + (week / totalWeeks) * 580} y1={30} x2={180 + (week / totalWeeks) * 580} y2={ganttData.length * 40 + 40} stroke="#e2e8f0" strokeWidth="1" />
                  <text x={180 + (week / totalWeeks) * 580} y={25} textAnchor="middle" fontSize="9" fill="#94a3b8">
                    Wk {week}
                  </text>
                </g>
              ))}

              {/* Bars */}
              {ganttData.map((phase, i) => {
                const barX = 180 + (phase.startWeek / totalWeeks) * 580
                const barWidth = Math.max(8, (phase.weeks / totalWeeks) * 580)
                const barY = 35 + i * 40
                return (
                  <g key={phase.id}>
                    {/* Phase label */}
                    <text x={175} y={barY + 16} textAnchor="end" fontSize="9" fontWeight="500" fill="#334155">
                      {phase.name.length > 24 ? phase.name.slice(0, 24) + "..." : phase.name}
                    </text>
                    {/* Bar */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={24}
                      rx={4}
                      fill={phase.color}
                      opacity={0.85}
                      stroke={phase.isCritical ? "#dc2626" : "none"}
                      strokeWidth={phase.isCritical ? 2 : 0}
                    />
                    {/* Duration label on bar */}
                    {barWidth > 30 && (
                      <text x={barX + barWidth / 2} y={barY + 15} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">
                        {phase.weeks}wk
                      </text>
                    )}
                    {/* Critical path marker */}
                    {phase.isCritical && (
                      <text x={barX + barWidth + 4} y={barY + 16} fontSize="8" fill="#dc2626" fontWeight="600">
                        CP
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Today marker at week 0 */}
              <line x1={180} y1={30} x2={180} y2={ganttData.length * 40 + 40} stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2" />
              <text x={180} y={ganttData.length * 40 + 55} textAnchor="middle" fontSize="8" fill="#22c55e" fontWeight="600">START</text>

              {/* End marker */}
              <line x1={760} y1={30} x2={760} y2={ganttData.length * 40 + 40} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
              <text x={760} y={ganttData.length * 40 + 55} textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="600">Wk {totalWeeks}</text>
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Editable Phase Durations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Phase Durations (Editable)</CardTitle>
          <CardDescription className="text-xs">
            Adjust durations within the min-max range. IEC testing phase auto-adjusts based on selected changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2.5 px-3 font-semibold">Phase</th>
                  <th className="text-left py-2.5 px-3 font-semibold max-w-[200px]">Description</th>
                  <th className="text-center py-2.5 px-3 font-semibold">Min (wk)</th>
                  <th className="text-center py-2.5 px-3 font-semibold">Max (wk)</th>
                  <th className="text-center py-2.5 px-3 font-semibold w-24">Duration (wk)</th>
                  <th className="text-center py-2.5 px-3 font-semibold">Start</th>
                  <th className="text-center py-2.5 px-3 font-semibold">End</th>
                  <th className="text-center py-2.5 px-3 font-semibold">Critical</th>
                </tr>
              </thead>
              <tbody>
                {ganttData.map(phase => (
                  <tr key={phase.id} className={`border-b ${phase.isCritical ? "bg-red-50" : "hover:bg-muted/30"}`}>
                    <td className="py-2 px-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: phase.color }} />
                        {phase.name}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground max-w-[200px] truncate">{phase.description}</td>
                    <td className="py-2 px-3 text-center font-mono">{phase.minWeeks}</td>
                    <td className="py-2 px-3 text-center font-mono">{phase.maxWeeks}</td>
                    <td className="py-2 px-3 text-center">
                      {phase.editable ? (
                        <Input
                          type="number"
                          value={phase.weeks}
                          min={phase.minWeeks}
                          max={phase.maxWeeks}
                          onChange={e => handleWeeksChange(phase.id, Number(e.target.value))}
                          className="h-7 w-16 text-xs text-center mx-auto"
                        />
                      ) : (
                        <span className="font-mono">{phase.weeks}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">Wk {phase.startWeek}</td>
                    <td className="py-2 px-3 text-center font-mono">Wk {phase.endWeek}</td>
                    <td className="py-2 px-3 text-center">
                      {phase.isCritical ? (
                        <Badge className="bg-red-100 text-red-700 text-[10px]">
                          <AlertTriangle className="h-3 w-3 mr-0.5" /> Critical
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="py-2.5 px-3" colSpan={4}>TOTAL</td>
                  <td className="py-2.5 px-3 text-center font-mono">{totalWeeks} wk</td>
                  <td className="py-2.5 px-3 text-center font-mono">Wk 0</td>
                  <td className="py-2.5 px-3 text-center font-mono">Wk {totalWeeks}</td>
                  <td className="py-2.5 px-3 text-center">{ganttData.filter(d => d.isCritical).length} items</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MNRE Pathway Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="py-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">MNRE Pathway Note:</span> BIS Registration (4-8 weeks) and ALMM Listing (8-12 weeks) are typically on the critical path for India market.
            These run sequentially after IEC testing and CB review. Total India certification pathway typically takes 6-12 months depending on test scope.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
