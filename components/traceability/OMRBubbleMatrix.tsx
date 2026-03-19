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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock, Grid3X3 } from "lucide-react"
import type { RouteCardOMR as RouteCardOMRType, RouteCardOMRStation } from "@/lib/data-linkage"
import { mockOMRRouteCards } from "@/lib/data-linkage"

// ============================================================================
// OMR Bubble Component (reusable)
// ============================================================================

interface OMRBubbleProps {
  filled: boolean
  label?: string
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  interactive?: boolean
}

export function OMRBubble({ filled, label, size = "md", onClick, interactive = false }: OMRBubbleProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
  const innerSize = size === "sm" ? "h-2 w-2" : size === "lg" ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
  return (
    <div
      className={`flex items-center gap-1.5 ${interactive ? "cursor-pointer" : ""}`}
      onClick={interactive ? onClick : undefined}
    >
      <div
        className={`${sizeClass} rounded-full border-2 border-gray-800 flex items-center justify-center transition-colors ${
          filled ? "bg-gray-800" : "bg-white"
        } ${interactive ? "hover:border-blue-600" : ""}`}
      >
        {filled && <div className={`${innerSize} rounded-full bg-white`} />}
      </div>
      {label && <span className="text-xs font-mono">{label}</span>}
    </div>
  )
}

// ============================================================================
// Bubble Matrix View - Shows all stations x criteria in a scannable grid
// ============================================================================

type MatrixFilter = "all" | "pass" | "fail" | "pending"

export function OMRBubbleMatrix() {
  const [selectedCard, setSelectedCard] = useState<string>(
    mockOMRRouteCards[0]?.id ?? ""
  )
  const [filter, setFilter] = useState<MatrixFilter>("all")

  const routeCard = mockOMRRouteCards.find((rc) => rc.id === selectedCard)
  if (!routeCard) return null

  const filteredStations =
    filter === "all"
      ? routeCard.stations
      : routeCard.stations.filter((s) => s.passFail === filter)

  // All unique measurement parameters across stations
  const allParams = Array.from(
    new Set(
      routeCard.stations.flatMap((s) => [
        ...s.preTestMeasurements.map((m) => m.parameter),
        ...s.postTestMeasurements.map((m) => m.parameter),
      ])
    )
  )

  const statusIcon = (status: "pass" | "fail" | "pending") => {
    if (status === "pass") return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (status === "fail") return <XCircle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-amber-500" />
  }

  const stationSummary = {
    total: routeCard.stations.length,
    pass: routeCard.stations.filter((s) => s.passFail === "pass").length,
    fail: routeCard.stations.filter((s) => s.passFail === "fail").length,
    pending: routeCard.stations.filter((s) => s.passFail === "pending").length,
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedCard} onValueChange={setSelectedCard}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Select route card" />
          </SelectTrigger>
          <SelectContent>
            {mockOMRRouteCards.map((rc) => (
              <SelectItem key={rc.id} value={rc.id}>
                {rc.id} — {rc.sampleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filter} onValueChange={(v) => setFilter(v as MatrixFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stations</SelectItem>
            <SelectItem value="pass">Pass Only</SelectItem>
            <SelectItem value="fail">Fail Only</SelectItem>
            <SelectItem value="pending">Pending Only</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2 text-xs">
          <Badge variant="outline" className="border-green-400 text-green-700">
            {stationSummary.pass} Pass
          </Badge>
          <Badge variant="outline" className="border-red-400 text-red-700">
            {stationSummary.fail} Fail
          </Badge>
          <Badge variant="outline" className="border-amber-400 text-amber-700">
            {stationSummary.pending} Pending
          </Badge>
        </div>
      </div>

      {/* Matrix Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            OMR Bubble Matrix — {routeCard.sampleName}
          </CardTitle>
          <CardDescription>
            Station × Pass/Fail grid with measurement data overlay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead className="text-center">Pass</TableHead>
                  <TableHead className="text-center">Fail</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead>Checks</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Equipment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => {
                  const checksComplete = station.inspectionChecks.filter(
                    (c) => c.checked
                  ).length
                  return (
                    <TableRow key={station.stationNumber}>
                      <TableCell>
                        <div className="h-7 w-7 rounded bg-gray-800 text-white flex items-center justify-center font-bold text-xs">
                          {station.stationNumber}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {station.stationName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {station.testName}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <OMRBubble filled={station.passFail === "pass"} size="md" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <OMRBubble filled={station.passFail === "fail"} size="md" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <OMRBubble filled={station.passFail === "pending"} size="md" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono">
                          {checksComplete}/{station.inspectionChecks.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {station.operatorName || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono truncate max-w-[120px]">
                        {station.equipmentUsed || "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Heatmap */}
      {allParams.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Measurement Parameters</CardTitle>
            <CardDescription>
              Pre/Post test measurement values across stations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    {filteredStations.map((s) => (
                      <TableHead key={s.stationNumber} className="text-center text-xs">
                        Stn {s.stationNumber}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allParams.slice(0, 8).map((param) => (
                    <TableRow key={param}>
                      <TableCell className="font-mono text-xs">{param}</TableCell>
                      {filteredStations.map((station) => {
                        const pre = station.preTestMeasurements.find(
                          (m) => m.parameter === param
                        )
                        const post = station.postTestMeasurements.find(
                          (m) => m.parameter === param
                        )
                        const meas = post ?? pre
                        if (!meas || meas.value === null)
                          return (
                            <TableCell
                              key={station.stationNumber}
                              className="text-center text-xs text-muted-foreground"
                            >
                              —
                            </TableCell>
                          )
                        const inTolerance =
                          Math.abs(meas.value - meas.nominal) <= meas.tolerance
                        return (
                          <TableCell
                            key={station.stationNumber}
                            className={`text-center text-xs font-mono ${
                              inTolerance ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                            }`}
                          >
                            {meas.value} {meas.unit}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
