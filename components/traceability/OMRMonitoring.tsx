"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
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
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
} from "lucide-react"
import { mockOMRRouteCards } from "@/lib/data-linkage"

// ============================================================================
// Station monitoring stats
// ============================================================================

interface StationStats {
  stationName: string
  totalSamples: number
  passed: number
  failed: number
  pending: number
  avgProcessingMinutes: number
  currentOperator: string | null
}

function computeStationStats(): StationStats[] {
  const stationMap = new Map<string, StationStats>()

  for (const rc of mockOMRRouteCards) {
    for (const station of rc.stations) {
      const existing = stationMap.get(station.stationName)
      if (existing) {
        existing.totalSamples++
        if (station.passFail === "pass") existing.passed++
        else if (station.passFail === "fail") existing.failed++
        else existing.pending++
        if (station.operatorName) existing.currentOperator = station.operatorName
      } else {
        stationMap.set(station.stationName, {
          stationName: station.stationName,
          totalSamples: 1,
          passed: station.passFail === "pass" ? 1 : 0,
          failed: station.passFail === "fail" ? 1 : 0,
          pending: station.passFail === "pending" ? 1 : 0,
          avgProcessingMinutes: 30 + Math.floor(Math.random() * 90),
          currentOperator: station.operatorName || null,
        })
      }
    }
  }

  return Array.from(stationMap.values())
}

// ============================================================================
// OMR Monitoring Dashboard
// ============================================================================

export function OMRMonitoring() {
  const stationStats = computeStationStats()

  const totalStations = mockOMRRouteCards.reduce((sum, rc) => sum + rc.stations.length, 0)
  const passedStations = mockOMRRouteCards.reduce(
    (sum, rc) => sum + rc.stations.filter((s) => s.passFail === "pass").length,
    0
  )
  const failedStations = mockOMRRouteCards.reduce(
    (sum, rc) => sum + rc.stations.filter((s) => s.passFail === "fail").length,
    0
  )
  const pendingStations = totalStations - passedStations - failedStations
  const overallPassRate = totalStations > 0 ? Math.round((passedStations / totalStations) * 100) : 0

  // Active operators
  const operators = new Set<string>()
  for (const rc of mockOMRRouteCards) {
    for (const s of rc.stations) {
      if (s.operatorName) operators.add(s.operatorName)
    }
  }

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Active Cards</span>
            </div>
            <p className="text-2xl font-bold mt-1">{mockOMRRouteCards.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Passed</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-700">{passedStations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Failed</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-700">{failedStations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-amber-700">{pendingStations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Pass Rate</span>
            </div>
            <p className="text-2xl font-bold mt-1">{overallPassRate}%</p>
            <Progress value={overallPassRate} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Route Card Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Route Card Progress
          </CardTitle>
          <CardDescription>Real-time completion tracking for active route cards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOMRRouteCards.map((rc) => {
              const completed = rc.sampleFlow.filter((s) => s.status === "completed").length
              const total = rc.sampleFlow.length
              const pct = Math.round((completed / total) * 100)
              const stationsPassed = rc.stations.filter((s) => s.passFail === "pass").length
              const stationsFailed = rc.stations.filter((s) => s.passFail === "fail").length

              return (
                <div key={rc.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold font-mono">{rc.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {rc.sampleName} • {rc.clientName} • {rc.standard}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {completed}/{total} steps
                      </Badge>
                      <span className="text-sm font-bold">{pct}%</span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2 mb-2" />
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      {stationsPassed} passed
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-600" />
                      {stationsFailed} failed
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500" />
                      {rc.stations.length - stationsPassed - stationsFailed} pending
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Station Performance Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-5 w-5" />
            Station Performance
          </CardTitle>
          <CardDescription>
            Throughput and pass rates per station ({operators.size} active operators)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead className="text-center">Samples</TableHead>
                <TableHead className="text-center">Pass</TableHead>
                <TableHead className="text-center">Fail</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">Pass Rate</TableHead>
                <TableHead className="text-center">Avg Time</TableHead>
                <TableHead>Operator</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stationStats.map((stat) => {
                const passRate =
                  stat.totalSamples > 0
                    ? Math.round((stat.passed / stat.totalSamples) * 100)
                    : 0
                return (
                  <TableRow key={stat.stationName}>
                    <TableCell className="font-medium text-sm">{stat.stationName}</TableCell>
                    <TableCell className="text-center font-mono">{stat.totalSamples}</TableCell>
                    <TableCell className="text-center text-green-700 font-mono">{stat.passed}</TableCell>
                    <TableCell className="text-center text-red-700 font-mono">{stat.failed}</TableCell>
                    <TableCell className="text-center text-amber-600 font-mono">{stat.pending}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${passRate >= 80 ? "bg-green-500" : passRate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{passRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs font-mono">
                      {stat.avgProcessingMinutes}m
                    </TableCell>
                    <TableCell className="text-xs">
                      {stat.currentOperator || "—"}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts */}
      {failedStations > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {failedStations} station{failedStations > 1 ? "s" : ""} with failures detected
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Review failed stations and initiate CAPA if required. Failed route cards may need re-testing or NCR generation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
