"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"
import {
  ROUTINE_TESTS,
  ACCELERATED_TESTS,
} from "@/lib/data/omr-route-card-v2-data"
import type { OMRRouteCardV2 } from "@/lib/data/omr-route-card-v2-data"

// ============================================================================
// Monitoring: Progress tracker, completion %, alerts for missing tests
// ============================================================================

interface OMRMonitoringProps {
  cards: OMRRouteCardV2[]
}

interface StageProgress {
  stage: string
  stageName: string
  pass: number
  fail: number
  inProgress: number
  empty: number
  total: number
  completionPct: number
}

interface MissingTestAlert {
  cardId: string
  moduleId: string
  routineTest: string
  acceleratedTest: string
  message: string
  severity: "warning" | "error" | "info"
}

export function OMRMonitoring({ cards }: OMRMonitoringProps) {
  // Per-module completion
  const moduleProgress = useMemo(() => {
    return cards.map((card) => {
      const total = card.bubbleMatrix.length
      const pass = card.bubbleMatrix.filter((b) => b.status === "pass").length
      const fail = card.bubbleMatrix.filter((b) => b.status === "fail").length
      const inProgress = card.bubbleMatrix.filter((b) => b.status === "in-progress").length
      const tested = pass + fail + inProgress
      return {
        cardId: card.id,
        moduleId: card.moduleId,
        client: card.client,
        standard: card.standard,
        total,
        pass,
        fail,
        inProgress,
        empty: total - tested,
        completionPct: Math.round((tested / total) * 100),
        passPct: tested > 0 ? Math.round((pass / tested) * 100) : 0,
      }
    })
  }, [cards])

  // Per-stage (accelerated test column) completion across all modules
  const stageProgress = useMemo(() => {
    const stages: StageProgress[] = ACCELERATED_TESTS.map((at) => {
      let pass = 0, fail = 0, inProgress = 0, empty = 0
      cards.forEach((card) => {
        card.bubbleMatrix
          .filter((b) => b.acceleratedTest === at.code)
          .forEach((b) => {
            if (b.status === "pass") pass++
            else if (b.status === "fail") fail++
            else if (b.status === "in-progress") inProgress++
            else empty++
          })
      })
      const total = pass + fail + inProgress + empty
      const tested = pass + fail + inProgress
      return {
        stage: at.code,
        stageName: at.name,
        pass,
        fail,
        inProgress,
        empty,
        total,
        completionPct: total > 0 ? Math.round((tested / total) * 100) : 0,
      }
    })
    return stages
  }, [cards])

  // Alerts: find missing tests (should have been done based on sequence)
  const alerts = useMemo(() => {
    const results: MissingTestAlert[] = []
    const accelOrder = ACCELERATED_TESTS.map((a) => a.code)

    cards.forEach((card) => {
      ROUTINE_TESTS.forEach((rt) => {
        let lastCompletedIdx = -1
        let hasGap = false

        accelOrder.forEach((at, atIdx) => {
          const bubble = card.bubbleMatrix.find(
            (b) => b.routineTest === rt.code && b.acceleratedTest === at
          )
          if (bubble && (bubble.status === "pass" || bubble.status === "fail")) {
            if (hasGap) {
              // There was a gap - find the missing ones
              for (let g = lastCompletedIdx + 1; g < atIdx; g++) {
                results.push({
                  cardId: card.id,
                  moduleId: card.moduleId,
                  routineTest: rt.code,
                  acceleratedTest: accelOrder[g],
                  message: `${rt.code} missing at ${accelOrder[g]} stage (completed at later stage ${at})`,
                  severity: "warning",
                })
              }
            }
            lastCompletedIdx = atIdx
            hasGap = false
          } else if (bubble && bubble.status === "empty" && lastCompletedIdx >= 0) {
            hasGap = true
          }
        })

        // Check if any fail results need attention
        card.bubbleMatrix
          .filter((b) => b.routineTest === rt.code && b.status === "fail")
          .forEach((b) => {
            results.push({
              cardId: card.id,
              moduleId: card.moduleId,
              routineTest: rt.code,
              acceleratedTest: b.acceleratedTest,
              message: `${rt.code} FAILED at ${b.acceleratedTest} — investigation required`,
              severity: "error",
            })
          })
      })
    })
    return results
  }, [cards])

  // Chart data for stage completion
  const chartData = stageProgress.map((s) => ({
    name: s.stage,
    Pass: s.pass,
    Fail: s.fail,
    "In Progress": s.inProgress,
  }))

  const totalTests = moduleProgress.reduce((s, m) => s + m.total, 0)
  const totalCompleted = moduleProgress.reduce((s, m) => s + m.pass + m.fail + m.inProgress, 0)
  const overallPct = totalTests > 0 ? Math.round((totalCompleted / totalTests) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Overall KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{cards.length}</p>
                <p className="text-xs text-muted-foreground">Modules Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{overallPct}%</p>
                <p className="text-xs text-muted-foreground">Overall Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">
                  {moduleProgress.reduce((s, m) => s + m.pass, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Tests Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {moduleProgress.reduce((s, m) => s + m.fail, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Tests Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-xs text-muted-foreground">Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Progress Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Module Progress Tracker
          </CardTitle>
          <CardDescription>
            Completion percentage per module across all test stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Standard</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-center">Pass</TableHead>
                <TableHead className="text-center">Fail</TableHead>
                <TableHead className="text-center">In Progress</TableHead>
                <TableHead className="text-center">Remaining</TableHead>
                <TableHead className="text-center">Pass Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moduleProgress.map((mp) => (
                <TableRow key={mp.cardId}>
                  <TableCell className="font-mono font-bold text-sm">{mp.moduleId}</TableCell>
                  <TableCell className="text-sm">{mp.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{mp.standard}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={mp.completionPct} className="h-2 flex-1" />
                      <span className="text-xs font-bold w-10 text-right">{mp.completionPct}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-emerald-600 font-bold">
                    {mp.pass}
                  </TableCell>
                  <TableCell className="text-center font-mono text-red-600 font-bold">
                    {mp.fail}
                  </TableCell>
                  <TableCell className="text-center font-mono text-amber-500 font-bold">
                    {mp.inProgress}
                  </TableCell>
                  <TableCell className="text-center font-mono text-gray-400">
                    {mp.empty}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        mp.passPct >= 90
                          ? "border-emerald-400 text-emerald-700"
                          : mp.passPct >= 70
                          ? "border-amber-400 text-amber-700"
                          : "border-red-400 text-red-700"
                      }
                    >
                      {mp.passPct}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stage Completion Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Completion by Test Stage</CardTitle>
          <CardDescription>
            Pass / Fail / In-Progress counts per accelerated test stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <RechartsTooltip />
                <Bar dataKey="Pass" stackId="a" fill="#22c55e" />
                <Bar dataKey="Fail" stackId="a" fill="#ef4444" />
                <Bar dataKey="In Progress" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stage Progress Detail */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Stage-wise Completion Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stageProgress.map((sp) => (
              <div key={sp.stage} className="border rounded-lg p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-mono">{sp.stage}</span>
                  <span className="text-xs font-bold">{sp.completionPct}%</span>
                </div>
                <Progress value={sp.completionPct} className="h-1.5 mb-1" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="text-emerald-600">{sp.pass}P</span>
                  <span className="text-red-600">{sp.fail}F</span>
                  <span className="text-amber-500">{sp.inProgress}IP</span>
                  <span>{sp.empty}E</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Alerts &amp; Missing Tests ({alerts.length})
            </CardTitle>
            <CardDescription>
              Sequence gaps, failures, and missing routine tests detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 p-2 rounded text-sm ${
                    alert.severity === "error"
                      ? "bg-red-50 border border-red-200"
                      : alert.severity === "warning"
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  {alert.severity === "error" ? (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  ) : alert.severity === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-mono text-xs font-bold">{alert.moduleId}</span>
                    <span className="mx-1">&mdash;</span>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
