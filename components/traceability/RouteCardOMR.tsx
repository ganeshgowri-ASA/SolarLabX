"use client"

import React, { useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  ClipboardCheck,
  Wrench,
  User,
  Calendar,
  MapPin,
  Circle,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import type { RouteCardOMR as RouteCardOMRType, RouteCardOMRStation, SampleFlowStep } from "@/lib/data-linkage"
import { mockOMRRouteCards, generateRouteCardFilename } from "@/lib/data-linkage"

// ============================================================================
// OMR Bubble Component
// ============================================================================

interface OMRBubbleProps {
  filled: boolean
  label?: string
  size?: "sm" | "md"
}

function OMRBubble({ filled, label, size = "md" }: OMRBubbleProps) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${sizeClass} rounded-full border-2 border-gray-800 flex items-center justify-center ${
          filled ? "bg-gray-800" : "bg-white"
        }`}
      >
        {filled && (
          <div className={`${size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full bg-white`} />
        )}
      </div>
      {label && <span className="text-xs font-mono">{label}</span>}
    </div>
  )
}

// ============================================================================
// OMR Pass/Fail Row
// ============================================================================

interface OMRPassFailRowProps {
  label: string
  value: "pass" | "fail" | "pending"
}

function OMRPassFailRow({ label, value }: OMRPassFailRowProps) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-dashed border-gray-300 last:border-0">
      <span className="text-xs font-mono">{label}</span>
      <div className="flex items-center gap-3">
        <OMRBubble filled={value === "pass"} label="PASS" size="sm" />
        <OMRBubble filled={value === "fail"} label="FAIL" size="sm" />
        <OMRBubble filled={value === "pending"} label="N/A" size="sm" />
      </div>
    </div>
  )
}

// ============================================================================
// Sample Flow Visualization
// ============================================================================

interface SampleFlowProps {
  steps: SampleFlowStep[]
}

function SampleFlow({ steps }: SampleFlowProps) {
  const statusColors: Record<string, string> = {
    completed: "bg-green-500",
    in_progress: "bg-blue-500 animate-pulse",
    pending: "bg-gray-300",
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((step, idx) => (
        <React.Fragment key={step.step}>
          <div className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-full ${statusColors[step.status]}`} />
            <div className="text-xs">
              <span className="font-medium">{step.name}</span>
              {step.operator && (
                <span className="text-muted-foreground ml-1">({step.operator})</span>
              )}
            </div>
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ============================================================================
// OMR Station Card (Printable Layout)
// ============================================================================

interface OMRStationCardProps {
  station: RouteCardOMRStation
  routeCard: RouteCardOMRType
}

function OMRStationCard({ station, routeCard }: OMRStationCardProps) {
  return (
    <div className="border-2 border-gray-800 rounded-md p-3 print:break-inside-avoid mb-3">
      {/* Station Header */}
      <div className="flex items-center justify-between border-b-2 border-gray-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
            {station.stationNumber}
          </div>
          <div>
            <p className="font-bold text-sm">{station.stationName}</p>
            <p className="text-xs text-muted-foreground">{station.testName}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge
            variant="outline"
            className={`text-xs ${
              station.standard ? "border-blue-400 text-blue-700" : ""
            }`}
          >
            {station.standard}
          </Badge>
        </div>
      </div>

      {/* OMR Pass/Fail Bubbles */}
      <div className="mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
          Result (fill bubble completely)
        </p>
        <OMRPassFailRow label={station.testName} value={station.passFail} />
      </div>

      {/* Pre-test Measurements */}
      {station.preTestMeasurements.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
            Pre-Test Measurements
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {station.preTestMeasurements.map((m, i) => (
              <div key={i} className="flex justify-between text-xs border-b border-dotted border-gray-200 py-0.5">
                <span className="font-mono">{m.parameter}</span>
                <span className="font-bold">
                  {m.value !== null ? `${m.value} ${m.unit}` : "____"}
                  <span className="text-muted-foreground font-normal ml-1">
                    (±{m.tolerance})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-test Measurements */}
      {station.postTestMeasurements.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
            Post-Test Measurements
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {station.postTestMeasurements.map((m, i) => (
              <div key={i} className="flex justify-between text-xs border-b border-dotted border-gray-200 py-0.5">
                <span className="font-mono">{m.parameter}</span>
                <span className="font-bold">
                  {m.value !== null ? `${m.value} ${m.unit}` : "____"}
                  <span className="text-muted-foreground font-normal ml-1">
                    (±{m.tolerance})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspection Checkmarks (OMR style) */}
      {station.inspectionChecks.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">
            Inspection Checks
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {station.inspectionChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs py-0.5">
                <div
                  className={`h-3.5 w-3.5 border-2 border-gray-800 rounded-sm flex items-center justify-center ${
                    check.checked ? "bg-gray-800" : ""
                  }`}
                >
                  {check.checked && (
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station Footer: Operator, Date, Equipment */}
      <div className="grid grid-cols-4 gap-2 border-t-2 border-gray-800 pt-2 mt-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Operator</p>
          <p className="text-xs font-mono border-b border-gray-400 min-h-[1.2rem]">
            {station.operatorName || "________________"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Signature</p>
          <p className="text-xs font-mono border-b border-gray-400 min-h-[1.2rem]">
            {station.operatorSignature || "________________"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Date/Time</p>
          <p className="text-xs font-mono border-b border-gray-400 min-h-[1.2rem]">
            {station.dateTime
              ? new Date(station.dateTime).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "____/____/________"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Equipment</p>
          <p className="text-xs font-mono border-b border-gray-400 min-h-[1.2rem] truncate">
            {station.equipmentUsed || "________________"}
          </p>
        </div>
      </div>

      {/* Observations */}
      <div className="mt-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Observations</p>
        <p className="text-xs border border-gray-300 rounded p-1 min-h-[2rem] font-mono">
          {station.observations || " "}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Full Route Card OMR Sheet Preview
// ============================================================================

interface RouteCardOMRSheetProps {
  routeCard: RouteCardOMRType
}

function RouteCardOMRSheet({ routeCard }: RouteCardOMRSheetProps) {
  const filename = generateRouteCardFilename(
    routeCard.projectId,
    routeCard.sampleId,
    routeCard.testType,
    "Pre",
    routeCard.testSetNo
  )

  return (
    <div className="space-y-4 print:space-y-2" id={`route-card-${routeCard.id}`}>
      {/* Header with QR Code */}
      <div className="border-2 border-gray-800 rounded-md p-4 print:p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold">ROUTE CARD / OMR SHEET</h2>
            <p className="text-xs text-muted-foreground">
              Solar PV Testing Laboratory — ISO 17025 Compliant
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">Project ID:</span>
                <span className="font-mono font-bold">{routeCard.projectId}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Sample ID:</span>
                <span className="font-mono font-bold">{routeCard.sampleId}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Sample:</span>
                <span className="font-semibold">{routeCard.sampleName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-semibold">{routeCard.clientName}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Standard:</span>
                <span className="font-mono">{routeCard.standard}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Test:</span>
                <span className="font-mono">{routeCard.testType}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Test Set:</span>
                <span className="font-mono">{routeCard.testSetNo}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Date:</span>
                <span>{new Date(routeCard.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Filename: </span>
              <span className="font-mono text-primary">{filename}</span>
            </div>
          </div>
          <div className="shrink-0 ml-4">
            <QRCodeSVG
              value={routeCard.qrCodeData}
              size={100}
              level="M"
              includeMargin
            />
            <p className="text-[9px] text-center text-muted-foreground mt-1">
              Scan for digital record
            </p>
          </div>
        </div>
      </div>

      {/* Sample Flow */}
      <div className="border-2 border-gray-800 rounded-md p-3 print:p-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-2">
          Sample Flow
        </p>
        <SampleFlow steps={routeCard.sampleFlow} />
      </div>

      {/* OMR Stations */}
      {routeCard.stations.map((station) => (
        <OMRStationCard
          key={station.stationNumber}
          station={station}
          routeCard={routeCard}
        />
      ))}

      {/* Footer */}
      <div className="border-2 border-gray-800 rounded-md p-3 print:p-2 text-xs">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Final Disposition
            </p>
            <div className="flex gap-4 mt-1">
              <OMRBubble filled={false} label="PASS" />
              <OMRBubble filled={false} label="FAIL" />
              <OMRBubble filled={false} label="CONDITIONAL" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Lab Manager Approval
            </p>
            <p className="border-b border-gray-400 mt-2 min-h-[1.5rem]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Quality Assurance
            </p>
            <p className="border-b border-gray-400 mt-2 min-h-[1.5rem]" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Route Card OMR Tab Component
// ============================================================================

export function RouteCardOMRTab() {
  const [selectedRouteCard, setSelectedRouteCard] = useState<RouteCardOMRType | null>(null)
  const [filterStandard, setFilterStandard] = useState("all")

  const filteredCards = filterStandard === "all"
    ? mockOMRRouteCards
    : mockOMRRouteCards.filter((rc) => rc.standard === filterStandard)

  const handlePrint = (routeCard: RouteCardOMRType) => {
    const filename = generateRouteCardFilename(
      routeCard.projectId,
      routeCard.sampleId,
      routeCard.testType,
      "Pre",
      routeCard.testSetNo
    )
    toast.success(`Route card ready for print: ${filename}`)
    window.print()
  }

  const handleDownloadPDF = (routeCard: RouteCardOMRType) => {
    const filename = generateRouteCardFilename(
      routeCard.projectId,
      routeCard.sampleId,
      routeCard.testType,
      "Pre",
      routeCard.testSetNo
    )
    toast.success(`PDF generated: ${filename}`)
  }

  const getCompletionPercent = (routeCard: RouteCardOMRType): number => {
    const completed = routeCard.sampleFlow.filter((s) => s.status === "completed").length
    return Math.round((completed / routeCard.sampleFlow.length) * 100)
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockOMRRouteCards.length}</p>
                <p className="text-xs text-muted-foreground">Route Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockOMRRouteCards.reduce(
                    (sum, rc) =>
                      sum + rc.stations.filter((s) => s.passFail === "pass").length,
                    0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Stations Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockOMRRouteCards.reduce(
                    (sum, rc) =>
                      sum + rc.stations.filter((s) => s.passFail === "pending").length,
                    0
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Stations Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <QrCode className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockOMRRouteCards.length}</p>
                <p className="text-xs text-muted-foreground">QR Codes Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <Select value={filterStandard} onValueChange={setFilterStandard}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by standard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Standards</SelectItem>
            <SelectItem value="IEC 61215">IEC 61215</SelectItem>
            <SelectItem value="IEC 61730">IEC 61730</SelectItem>
            <SelectItem value="IEC 60904">IEC 60904</SelectItem>
            <SelectItem value="IEC 61853">IEC 61853</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Route Card List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Route Cards (OMR Format)
          </CardTitle>
          <CardDescription>
            Track sample journey through test stations with scannable OMR sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Card</TableHead>
                <TableHead>Sample</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Standard</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.map((rc) => {
                const pct = getCompletionPercent(rc)
                const filename = generateRouteCardFilename(
                  rc.projectId,
                  rc.sampleId,
                  rc.testType,
                  "Pre",
                  rc.testSetNo
                )
                return (
                  <TableRow key={rc.id}>
                    <TableCell className="font-mono font-bold">{rc.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{rc.sampleId}</p>
                        <p className="text-xs text-muted-foreground">{rc.sampleName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{rc.clientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rc.standard}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{rc.testType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] max-w-[200px] truncate">
                      {filename}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRouteCard(rc)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Route Card OMR Sheet — {rc.id}</DialogTitle>
                              <DialogDescription>
                                {rc.sampleName} | {rc.standard} | {rc.testType}
                              </DialogDescription>
                            </DialogHeader>
                            <RouteCardOMRSheet routeCard={rc} />
                            <div className="flex gap-3 pt-2">
                              <Button onClick={() => handleDownloadPDF(rc)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </Button>
                              <Button variant="outline" onClick={() => handlePrint(rc)}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(rc)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(rc)}
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* OMR Sheet Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">OMR Sheet Legend</CardTitle>
          <CardDescription>
            Instructions for filling out the Optical Mark Recognition route card
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium mb-2">Pass/Fail Bubbles</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <OMRBubble filled={true} size="sm" />
                  <span>Fill bubble completely for selection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <OMRBubble filled={false} size="sm" />
                  <span>Leave empty for non-selection</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Inspection Checks</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3.5 w-3.5 border-2 border-gray-800 rounded-sm bg-gray-800 flex items-center justify-center">
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span>Checked = Verified/Completed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3.5 w-3.5 border-2 border-gray-800 rounded-sm" />
                  <span>Unchecked = Not yet verified</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">QR Code</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Each route card has a unique QR code linking to the digital record in SolarLabX.</p>
                <p>Scan with any QR reader to access full traceability data.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
