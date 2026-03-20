"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QRCodeSVG } from "qrcode.react"
import { RotateCcw } from "lucide-react"
import {
  ROUTINE_TESTS,
  ACCELERATED_TESTS,
  generateOMRFilename,
} from "@/lib/data/omr-route-card-v2-data"
import type { BubbleStatus, OMRBubbleEntry, OMRRouteCardV2 } from "@/lib/data/omr-route-card-v2-data"

// ============================================================================
// Single OMR Bubble - clickable, cycles through states
// ============================================================================

const STATUS_CYCLE: BubbleStatus[] = ["empty", "pass", "fail", "in-progress"]

const STATUS_STYLES: Record<BubbleStatus, string> = {
  empty: "bg-white border-gray-400 hover:border-gray-600",
  pass: "bg-emerald-500 border-emerald-600",
  fail: "bg-red-500 border-red-600",
  "in-progress": "bg-amber-400 border-amber-500 animate-pulse",
}

const STATUS_LABELS: Record<BubbleStatus, string> = {
  empty: "Not tested",
  pass: "Pass",
  fail: "Fail",
  "in-progress": "In Progress",
}

interface ClickableBubbleProps {
  status: BubbleStatus
  routineTest: string
  acceleratedTest: string
  operator?: string
  date?: string
  filename?: string
  onStatusChange: (rt: string, at: string, newStatus: BubbleStatus) => void
}

function ClickableBubble({
  status,
  routineTest,
  acceleratedTest,
  operator,
  date,
  filename,
  onStatusChange,
}: ClickableBubbleProps) {
  const handleClick = useCallback(() => {
    const currentIdx = STATUS_CYCLE.indexOf(status)
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]
    onStatusChange(routineTest, acceleratedTest, nextStatus)
  }, [status, routineTest, acceleratedTest, onStatusChange])

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleClick}
            className={`h-6 w-6 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${STATUS_STYLES[status]}`}
            aria-label={`${routineTest} at ${acceleratedTest}: ${STATUS_LABELS[status]}`}
          >
            {status === "pass" && (
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
            {status === "fail" && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            )}
            {status === "in-progress" && (
              <div className="h-2 w-2 rounded-full bg-white" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <p className="font-bold">{routineTest} @ {acceleratedTest}</p>
          <p>Status: {STATUS_LABELS[status]}</p>
          {operator && <p>Operator: {operator}</p>}
          {date && <p>Date: {date}</p>}
          {filename && (
            <p className="font-mono text-[10px] mt-1 text-blue-300 break-all">{filename}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ============================================================================
// Header with QR Code + Module Barcode
// ============================================================================

interface OMRHeaderProps {
  card: OMRRouteCardV2
}

function OMRHeader({ card }: OMRHeaderProps) {
  const qrValue = JSON.stringify({
    projectId: card.projectId,
    moduleId: card.moduleId,
    client: card.client,
    standard: card.standard,
  })

  return (
    <Card className="border-2 border-gray-800">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          {/* QR Code - top left */}
          <div className="shrink-0 flex flex-col items-center">
            <QRCodeSVG value={qrValue} size={80} level="M" includeMargin />
            <span className="text-[9px] text-muted-foreground mt-1">Project QR</span>
          </div>

          {/* Header fields */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold tracking-tight">
              OMR ROUTE CARD &mdash; PV Module Qualification
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              IEC 61215 / IEC 61730 Test Sequence Tracker &bull; ISO 17025 Compliant
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Project ID</span>
                <p className="font-mono font-bold">{card.projectId}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Module ID</span>
                <p className="font-mono font-bold">{card.moduleId}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Client</span>
                <p className="font-semibold">{card.client}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Module Type</span>
                <p className="font-semibold">{card.moduleType}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Power Rating</span>
                <p className="font-mono">{card.powerRating}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Standard</span>
                <p className="font-mono">{card.standard}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Date</span>
                <p>{card.date}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Card ID</span>
                <p className="font-mono">{card.id}</p>
              </div>
            </div>
          </div>

          {/* Module ID barcode - top right */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="border border-gray-800 px-2 py-1 rounded">
              <div className="flex gap-[1px] h-10 items-end">
                {card.moduleId.split("").map((char, i) => (
                  <div
                    key={i}
                    className="bg-gray-800"
                    style={{
                      width: i % 3 === 0 ? 2 : 1,
                      height: `${24 + (char.charCodeAt(0) % 16)}px`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[8px] font-mono text-center mt-0.5">{card.moduleId}</p>
            </div>
            <span className="text-[9px] text-muted-foreground mt-1">Module Barcode</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Bubble Matrix Component
// ============================================================================

interface OMRBubbleMatrixProps {
  card: OMRRouteCardV2
  onMatrixChange: (updatedMatrix: OMRBubbleEntry[]) => void
}

export function OMRBubbleMatrix({ card, onMatrixChange }: OMRBubbleMatrixProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const handleStatusChange = useCallback(
    (rt: string, at: string, newStatus: BubbleStatus) => {
      const updated = card.bubbleMatrix.map((entry) => {
        if (entry.routineTest === rt && entry.acceleratedTest === at) {
          return {
            ...entry,
            status: newStatus,
            date: newStatus !== "empty" ? new Date().toISOString().split("T")[0] : undefined,
            filename:
              newStatus !== "empty"
                ? generateOMRFilename(card.projectId, card.moduleId, at, rt, "Post", "Set1")
                : undefined,
          }
        }
        return entry
      })
      onMatrixChange(updated)
    },
    [card, onMatrixChange]
  )

  const handleResetAll = useCallback(() => {
    const reset = card.bubbleMatrix.map((e) => ({
      ...e,
      status: "empty" as BubbleStatus,
      operator: undefined,
      date: undefined,
      filename: undefined,
    }))
    onMatrixChange(reset)
  }, [card.bubbleMatrix, onMatrixChange])

  const getBubble = (rt: string, at: string): OMRBubbleEntry => {
    return (
      card.bubbleMatrix.find(
        (e) => e.routineTest === rt && e.acceleratedTest === at
      ) || { routineTest: rt, acceleratedTest: at, status: "empty" as BubbleStatus }
    )
  }

  // Stats
  const totalBubbles = ROUTINE_TESTS.length * ACCELERATED_TESTS.length
  const passCount = card.bubbleMatrix.filter((b) => b.status === "pass").length
  const failCount = card.bubbleMatrix.filter((b) => b.status === "fail").length
  const inProgressCount = card.bubbleMatrix.filter((b) => b.status === "in-progress").length
  const emptyCount = totalBubbles - passCount - failCount - inProgressCount

  return (
    <div className="space-y-4">
      <OMRHeader card={card} />

      {/* Legend + controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full border-2 border-gray-400 bg-white" />
            <span>Empty ({emptyCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full border-2 border-emerald-600 bg-emerald-500" />
            <span>Pass ({passCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full border-2 border-red-600 bg-red-500" />
            <span>Fail ({failCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full border-2 border-amber-500 bg-amber-400" />
            <span>In Progress ({inProgressCount})</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="pass">Pass Only</SelectItem>
              <SelectItem value="fail">Fail Only</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="empty">Empty Only</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleResetAll} className="h-8 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Bubble Matrix Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">OMR Bubble Matrix</CardTitle>
          <CardDescription>
            Click any bubble to cycle: Empty &rarr; Pass &rarr; Fail &rarr; In Progress &rarr; Empty
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[900px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white border-2 border-gray-800 p-1.5 text-xs font-bold text-left min-w-[80px]">
                    Routine &darr; / Accel &rarr;
                  </th>
                  {ACCELERATED_TESTS.map((at) => (
                    <th
                      key={at.code}
                      className="border-2 border-gray-800 p-1 text-[10px] font-bold text-center min-w-[44px] max-w-[52px]"
                    >
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help whitespace-nowrap">
                              {at.code}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs max-w-[200px]">
                            <p className="font-bold">{at.name}</p>
                            <p className="text-muted-foreground">{at.standard}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROUTINE_TESTS.map((rt) => (
                  <tr key={rt.code}>
                    <td className="sticky left-0 z-10 bg-white border-2 border-gray-800 p-1.5">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <span className="text-xs font-bold font-mono">{rt.code}</span>
                              <span className="text-[10px] text-muted-foreground ml-1 hidden sm:inline">
                                {rt.name}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            <p className="font-bold">{rt.name}</p>
                            <p>{rt.standard}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    {ACCELERATED_TESTS.map((at) => {
                      const bubble = getBubble(rt.code, at.code)
                      const isHighlighted =
                        filterStatus === "all" || bubble.status === filterStatus
                      return (
                        <td
                          key={at.code}
                          className={`border border-gray-300 p-0 text-center ${
                            isHighlighted ? "" : "opacity-20"
                          }`}
                        >
                          <div className="flex items-center justify-center py-1">
                            <ClickableBubble
                              status={bubble.status}
                              routineTest={rt.code}
                              acceleratedTest={at.code}
                              operator={bubble.operator}
                              date={bubble.date}
                              filename={bubble.filename}
                              onStatusChange={handleStatusChange}
                            />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{passCount}</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{failCount}</p>
          <p className="text-xs text-muted-foreground">Failed</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">{inProgressCount}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-gray-400">{emptyCount}</p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
      </div>
    </div>
  )
}
