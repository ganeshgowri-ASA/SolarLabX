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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Printer,
  Download,
  FileText,
  Settings2,
  Maximize2,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import type { RouteCardOMR as RouteCardOMRType, RouteCardOMRStation } from "@/lib/data-linkage"
import { mockOMRRouteCards, generateRouteCardFilename } from "@/lib/data-linkage"
import { OMRBubble } from "./OMRBubbleMatrix"

// ============================================================================
// Printable OMR Sheet - Optimized for A4 printing
// ============================================================================

interface PrintableSheetProps {
  routeCard: RouteCardOMRType
  layout: "compact" | "full" | "stations-only"
}

function PrintableSheet({ routeCard, layout }: PrintableSheetProps) {
  const filename = generateRouteCardFilename(
    routeCard.projectId,
    routeCard.sampleId,
    routeCard.testType,
    "Pre",
    routeCard.testSetNo
  )

  return (
    <div className="bg-white text-black print:text-black" id={`printable-${routeCard.id}`}>
      {/* Header */}
      {layout !== "stations-only" && (
        <div className="border-2 border-gray-800 rounded-md p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold">ROUTE CARD / OMR SHEET</h2>
              <p className="text-xs text-gray-500">
                Solar PV Testing Laboratory — ISO 17025 Compliant
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500">Project ID:</span>
                  <span className="font-mono font-bold">{routeCard.projectId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">Sample ID:</span>
                  <span className="font-mono font-bold">{routeCard.sampleId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">Sample:</span>
                  <span className="font-semibold">{routeCard.sampleName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">Client:</span>
                  <span className="font-semibold">{routeCard.clientName}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">Standard:</span>
                  <span className="font-mono">{routeCard.standard}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500">Test Set:</span>
                  <span className="font-mono">{routeCard.testSetNo}</span>
                </div>
              </div>
              <div className="mt-2 text-xs">
                <span className="text-gray-500">Filename: </span>
                <span className="font-mono">{filename}</span>
              </div>
            </div>
            <div className="shrink-0 ml-4">
              <QRCodeSVG value={routeCard.qrCodeData} size={90} level="M" includeMargin />
              <p className="text-[9px] text-center text-gray-500 mt-1">Scan for digital record</p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Flow (compact) */}
      {layout === "full" && (
        <div className="border-2 border-gray-800 rounded-md p-2 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
            Sample Flow
          </p>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {routeCard.sampleFlow.map((step, idx) => (
              <React.Fragment key={step.step}>
                <div className="flex items-center gap-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      step.status === "completed"
                        ? "bg-green-600"
                        : step.status === "in_progress"
                        ? "bg-blue-600"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="font-medium">{step.name}</span>
                </div>
                {idx < routeCard.sampleFlow.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Stations */}
      {routeCard.stations.map((station) => (
        <div
          key={station.stationNumber}
          className="border-2 border-gray-800 rounded-md p-3 mb-2 print:break-inside-avoid"
        >
          {/* Station header */}
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-1.5 mb-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-gray-800 text-white flex items-center justify-center font-bold text-xs">
                {station.stationNumber}
              </div>
              <div>
                <p className="font-bold text-sm">{station.stationName}</p>
                <p className="text-xs text-gray-500">{station.testName}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {station.standard}
            </Badge>
          </div>

          {/* OMR bubbles */}
          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
              Result (fill bubble)
            </p>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-mono">{station.testName}</span>
              <div className="flex items-center gap-3">
                <OMRBubble filled={station.passFail === "pass"} label="PASS" size="sm" />
                <OMRBubble filled={station.passFail === "fail"} label="FAIL" size="sm" />
                <OMRBubble filled={station.passFail === "pending"} label="N/A" size="sm" />
              </div>
            </div>
          </div>

          {/* Measurements (compact grid) */}
          {(station.preTestMeasurements.length > 0 || station.postTestMeasurements.length > 0) && (
            <div className="mb-2">
              {station.preTestMeasurements.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Pre-Test</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mb-1">
                    {station.preTestMeasurements.map((m, i) => (
                      <div key={i} className="flex justify-between text-xs border-b border-dotted border-gray-200 py-0.5">
                        <span className="font-mono">{m.parameter}</span>
                        <span className="font-bold">
                          {m.value !== null ? `${m.value} ${m.unit}` : "____"}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {station.postTestMeasurements.length > 0 && (
                <>
                  <p className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Post-Test</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {station.postTestMeasurements.map((m, i) => (
                      <div key={i} className="flex justify-between text-xs border-b border-dotted border-gray-200 py-0.5">
                        <span className="font-mono">{m.parameter}</span>
                        <span className="font-bold">
                          {m.value !== null ? `${m.value} ${m.unit}` : "____"}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Inspection checks */}
          {station.inspectionChecks.length > 0 && layout !== "compact" && (
            <div className="mb-2">
              <p className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Checks</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {station.inspectionChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                    <div
                      className={`h-3 w-3 border-2 border-gray-800 rounded-sm ${
                        check.checked ? "bg-gray-800" : ""
                      }`}
                    />
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer row */}
          <div className="grid grid-cols-4 gap-2 border-t-2 border-gray-800 pt-1.5 mt-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">Operator</p>
              <p className="text-xs font-mono border-b border-gray-400 min-h-[1rem]">
                {station.operatorName || "________________"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">Signature</p>
              <p className="text-xs border-b border-gray-400 min-h-[1rem]">
                {station.operatorSignature || "________________"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">Date/Time</p>
              <p className="text-xs font-mono border-b border-gray-400 min-h-[1rem]">
                {station.dateTime
                  ? new Date(station.dateTime).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "____/____/____"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">Equipment</p>
              <p className="text-xs font-mono border-b border-gray-400 min-h-[1rem] truncate">
                {station.equipmentUsed || "________________"}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Final disposition */}
      {layout !== "stations-only" && (
        <div className="border-2 border-gray-800 rounded-md p-3 text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">Final Disposition</p>
              <div className="flex gap-4 mt-1">
                <OMRBubble filled={false} label="PASS" />
                <OMRBubble filled={false} label="FAIL" />
                <OMRBubble filled={false} label="CONDITIONAL" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">Lab Manager</p>
              <p className="border-b border-gray-400 mt-2 min-h-[1.2rem]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-600">QA Approval</p>
              <p className="border-b border-gray-400 mt-2 min-h-[1.2rem]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Print Preview & Configuration
// ============================================================================

export function OMRPrintable() {
  const [selectedCard, setSelectedCard] = useState<string>(
    mockOMRRouteCards[0]?.id ?? ""
  )
  const [layout, setLayout] = useState<"compact" | "full" | "stations-only">("full")

  const routeCard = mockOMRRouteCards.find((rc) => rc.id === selectedCard)

  const handlePrint = () => {
    if (!routeCard) return
    const filename = generateRouteCardFilename(
      routeCard.projectId,
      routeCard.sampleId,
      routeCard.testType,
      "Pre",
      routeCard.testSetNo
    )
    toast.success(`Printing: ${filename}`)
    window.print()
  }

  const handleDownload = () => {
    if (!routeCard) return
    const filename = generateRouteCardFilename(
      routeCard.projectId,
      routeCard.sampleId,
      routeCard.testType,
      "Pre",
      routeCard.testSetNo
    )
    toast.success(`PDF generated: ${filename}`)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Print Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label className="text-xs">Route Card</Label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockOMRRouteCards.map((rc) => (
                    <SelectItem key={rc.id} value={rc.id}>
                      {rc.id} — {rc.sampleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Layout</Label>
              <Select value={layout} onValueChange={(v) => setLayout(v as typeof layout)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full (Header + Stations)</SelectItem>
                  <SelectItem value="compact">Compact (No Checks)</SelectItem>
                  <SelectItem value="stations-only">Stations Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} disabled={!routeCard}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={!routeCard}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {routeCard ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Maximize2 className="h-5 w-5" />
              Print Preview
            </CardTitle>
            <CardDescription>
              A4 optimized layout — {layout} mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white shadow-inner max-h-[70vh] overflow-y-auto">
              <PrintableSheet routeCard={routeCard} layout={layout} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Select a route card to preview</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
