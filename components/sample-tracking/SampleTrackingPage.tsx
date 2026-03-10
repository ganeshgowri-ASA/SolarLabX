// @ts-nocheck
"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  Users,
  Barcode,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  ClipboardList,
  FlaskConical,
  FileText,
  AlertCircle,
} from "lucide-react"
import { cn, formatDate, formatDateTime } from "@/lib/utils"
import {
  generateMockSamples,
  generateBatchData,
  LIFECYCLE_STAGES,
  type TrackedSample,
  type BatchInfo,
  type SampleLifecycleStage,
  type TimelineEvent,
  type CustodyRecord,
  type ConditionLog,
} from "@/lib/sample-tracking"

const STAGE_ICONS: Record<string, React.ReactNode> = {
  Package: <Package className="h-4 w-4" />,
  ClipboardList: <ClipboardList className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  FlaskConical: <FlaskConical className="h-4 w-4" />,
  CheckCircle: <CheckCircle className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Truck: <Truck className="h-4 w-4" />,
}

function getStageIndex(stage: SampleLifecycleStage): number {
  return LIFECYCLE_STAGES.findIndex((s) => s.key === stage)
}

function getLifecycleProgress(stage: SampleLifecycleStage): number {
  const idx = getStageIndex(stage)
  return Math.round(((idx + 1) / LIFECYCLE_STAGES.length) * 100)
}

function getStageBadgeClasses(stage: SampleLifecycleStage): string {
  const map: Record<SampleLifecycleStage, string> = {
    reception: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    registration: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
    inspection: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    testing: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    review: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30",
    reporting: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    delivery: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  }
  return map[stage]
}

function getPriorityBadgeClasses(priority: string): string {
  const map: Record<string, string> = {
    low: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    normal: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    high: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    urgent: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  }
  return map[priority] || ""
}

function getConditionBadgeClasses(condition: string): string {
  const map: Record<string, string> = {
    good: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    minor_damage: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    damaged: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  }
  return map[condition] || ""
}

function getConditionLabel(condition: string): string {
  const map: Record<string, string> = {
    good: "Good",
    minor_damage: "Minor Damage",
    damaged: "Damaged",
    rejected: "Rejected",
  }
  return map[condition] || condition
}

function getBatchStatusClasses(status: string): string {
  const map: Record<string, string> = {
    active: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    completed: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    on_hold: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  }
  return map[status] || ""
}

// ─── Tracker Tab ───────────────────────────────────────────────────────────────

function TrackerTab({ samples }: { samples: TrackedSample[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState<SampleLifecycleStage | "all">("all")
  const [expandedSampleId, setExpandedSampleId] = useState<string | null>(null)

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        s.sampleId.toLowerCase().includes(q) ||
        s.barcode.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.manufacturer.toLowerCase().includes(q)
      const matchesStage = stageFilter === "all" || s.currentStage === stageFilter
      return matchesSearch && matchesStage
    })
  }, [samples, searchQuery, stageFilter])

  const kpis = useMemo(() => {
    const total = samples.length
    const inTesting = samples.filter((s) => s.currentStage === "testing").length
    const awaitingReview = samples.filter((s) => s.currentStage === "review").length
    const delivered = samples.filter((s) => s.currentStage === "delivery").length
    const overdue = samples.filter((s) => {
      const est = new Date(s.estimatedCompletion)
      return est < new Date() && s.currentStage !== "delivery"
    }).length
    return { total, inTesting, awaitingReview, delivered, overdue }
  }, [samples])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Samples</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{kpis.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-orange-500" />
              <p className="text-sm text-muted-foreground">In Testing</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{kpis.inTesting}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-500" />
              <p className="text-sm text-muted-foreground">Awaiting Review</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{kpis.awaitingReview}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{kpis.delivered}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-red-500">{kpis.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by sample ID, barcode, client, manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as SampleLifecycleStage | "all")}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Stages</option>
            {LIFECYCLE_STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sample List */}
      <div className="space-y-3">
        {filteredSamples.length === 0 && (
          <Card className="bg-card border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No samples match your search criteria.</p>
            </CardContent>
          </Card>
        )}
        {filteredSamples.map((sample) => {
          const isExpanded = expandedSampleId === sample.id
          const progress = getLifecycleProgress(sample.currentStage)

          return (
            <Card key={sample.id} className="bg-card border">
              <CardContent className="p-0">
                {/* Sample Row */}
                <button
                  onClick={() => setExpandedSampleId(isExpanded ? null : sample.id)}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{sample.sampleId}</span>
                      <span className="text-xs text-muted-foreground">
                        <Barcode className="mr-1 inline h-3 w-3" />
                        {sample.barcode}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>
                        <Users className="mr-1 inline h-3 w-3" />
                        {sample.clientName}
                      </span>
                      <span>{sample.manufacturer} {sample.modelNumber}</span>
                      <span>
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {sample.currentLocation}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs", getStageBadgeClasses(sample.currentStage))}>
                        {LIFECYCLE_STAGES.find((s) => s.key === sample.currentStage)?.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", getPriorityBadgeClasses(sample.priority))}>
                        {sample.priority}
                      </Badge>
                    </div>
                    <div className="flex w-32 items-center gap-2">
                      <Progress value={progress} className="h-1.5" />
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                </button>

                {/* Expanded Timeline */}
                {isExpanded && (
                  <div className="border-t px-4 py-6">
                    <div className="mb-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                      <div>
                        <p className="text-muted-foreground">Serial Number</p>
                        <p className="font-medium">{sample.serialNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Batch</p>
                        <p className="font-medium">{sample.batchId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Test Standard</p>
                        <p className="font-medium">{sample.testStandard}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Est. Completion</p>
                        <p className="font-medium">{formatDate(sample.estimatedCompletion)}</p>
                      </div>
                    </div>

                    {sample.notes && (
                      <div className="mb-4 rounded-md bg-muted/50 p-3 text-sm">
                        <AlertCircle className="mr-1 inline h-3 w-3 text-amber-500" />
                        {sample.notes}
                      </div>
                    )}

                    {/* Horizontal Stepper Timeline */}
                    <div className="overflow-x-auto">
                      <div className="flex min-w-[700px] items-start">
                        {sample.timeline.map((event, idx) => {
                          const stageInfo = LIFECYCLE_STAGES[idx]
                          const isCompleted = event.status === "completed"
                          const isCurrent = event.status === "current"
                          const isPending = event.status === "pending"

                          return (
                            <div key={event.id} className="flex flex-1 flex-col items-center">
                              {/* Connector + Circle */}
                              <div className="flex w-full items-center">
                                {/* Left line */}
                                {idx > 0 && (
                                  <div
                                    className={cn(
                                      "h-0.5 flex-1",
                                      isCompleted || isCurrent ? "bg-green-500" : "bg-muted-foreground/20"
                                    )}
                                  />
                                )}
                                {idx === 0 && <div className="flex-1" />}

                                {/* Circle */}
                                <div
                                  className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    isCompleted && "border-green-500 bg-green-500 text-white",
                                    isCurrent && "border-orange-500 bg-orange-500/15 text-orange-500",
                                    isPending && "border-muted-foreground/30 bg-muted text-muted-foreground"
                                  )}
                                >
                                  {STAGE_ICONS[stageInfo.icon]}
                                </div>

                                {/* Right line */}
                                {idx < sample.timeline.length - 1 && (
                                  <div
                                    className={cn(
                                      "h-0.5 flex-1",
                                      isCompleted ? "bg-green-500" : "bg-muted-foreground/20"
                                    )}
                                  />
                                )}
                                {idx === sample.timeline.length - 1 && <div className="flex-1" />}
                              </div>

                              {/* Label + details */}
                              <div className="mt-2 text-center">
                                <p
                                  className={cn(
                                    "text-xs font-medium",
                                    isCompleted && "text-green-600 dark:text-green-400",
                                    isCurrent && "text-orange-600 dark:text-orange-400",
                                    isPending && "text-muted-foreground"
                                  )}
                                >
                                  {stageInfo.label}
                                </p>
                                {event.timestamp && (
                                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    {formatDate(event.timestamp)}
                                  </p>
                                )}
                                {event.performedBy && (
                                  <p className="text-[10px] text-muted-foreground">{event.performedBy}</p>
                                )}
                                {event.duration && (
                                  <p className="text-[10px] text-muted-foreground">
                                    <Clock className="mr-0.5 inline h-2.5 w-2.5" />
                                    {event.duration}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Showing {filteredSamples.length} of {samples.length} samples
      </p>
    </div>
  )
}

// ─── Chain of Custody Tab ──────────────────────────────────────────────────────

function ChainOfCustodyTab({ samples }: { samples: TrackedSample[] }) {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0]?.id || "")

  const selectedSample = useMemo(
    () => samples.find((s) => s.id === selectedSampleId),
    [samples, selectedSampleId]
  )

  return (
    <div className="space-y-6">
      {/* Sample Selector */}
      <Card className="bg-card border">
        <CardContent className="p-4">
          <Label className="text-sm font-medium">Select Sample</Label>
          <select
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sampleId} - {s.clientName} ({s.barcode})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedSample && (
        <>
          {/* Sample Summary */}
          <Card className="bg-card border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {selectedSample.sampleId}
                <Badge variant="outline" className={cn("ml-2 text-xs", getStageBadgeClasses(selectedSample.currentStage))}>
                  {LIFECYCLE_STAGES.find((s) => s.key === selectedSample.currentStage)?.label}
                </Badge>
              </CardTitle>
              <CardDescription>
                {selectedSample.clientName} - {selectedSample.manufacturer} {selectedSample.modelNumber}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Custody Chain Timeline */}
          <Card className="bg-card border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Chain of Custody</CardTitle>
              <CardDescription>{selectedSample.custodyChain.length} transfer records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                {selectedSample.custodyChain.map((record, idx) => {
                  const isLast = idx === selectedSample.custodyChain.length - 1

                  return (
                    <div key={record.id} className="relative flex gap-4 pb-8">
                      {/* Vertical line */}
                      {!isLast && (
                        <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 bg-muted-foreground/20" />
                      )}

                      {/* Dot */}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                        <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 rounded-lg border bg-card p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-sm font-medium">{record.action}</p>
                          <span className="text-xs text-muted-foreground">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {formatDateTime(record.timestamp)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                          <div className="flex items-center gap-1 rounded bg-muted px-2 py-0.5">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{record.fromPerson}</span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <div className="flex items-center gap-1 rounded bg-muted px-2 py-0.5">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span>{record.toPerson}</span>
                          </div>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            <MapPin className="mr-0.5 inline h-3 w-3" />
                            {record.fromLocation}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span>
                            <MapPin className="mr-0.5 inline h-3 w-3" />
                            {record.toLocation}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Signature: <span className="font-mono">{record.signature}</span>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Batch Management Tab ──────────────────────────────────────────────────────

function BatchManagementTab({
  batches,
  samples,
}: {
  batches: BatchInfo[]
  samples: TrackedSample[]
}) {
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {batches.map((batch) => {
        const isExpanded = expandedBatchId === batch.batchId
        const progress = Math.round((batch.samplesCompleted / batch.totalSamples) * 100)
        const batchSamples = samples.filter((s) => s.batchId === batch.batchId)

        return (
          <Card key={batch.batchId} className="bg-card border">
            <CardContent className="p-0">
              <button
                onClick={() => setExpandedBatchId(isExpanded ? null : batch.batchId)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{batch.batchId}</span>
                    <Badge variant="outline" className={cn("text-xs", getBatchStatusClasses(batch.status))}>
                      {batch.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {batch.clientName} &middot; Created {formatDate(batch.createdAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Done</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">{batch.samplesCompleted}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">{batch.samplesInProgress}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="font-semibold text-muted-foreground">{batch.samplesPending}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex w-40 items-center gap-2">
                    <Progress value={progress} className="h-1.5" />
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t p-4">
                  <p className="mb-3 text-sm font-medium">Samples in Batch</p>
                  {batchSamples.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No samples found for this batch.</p>
                  ) : (
                    <div className="space-y-2">
                      {batchSamples.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">{s.sampleId}</span>
                            <span className="text-xs text-muted-foreground">{s.manufacturer} {s.modelNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-xs", getStageBadgeClasses(s.currentStage))}>
                              {LIFECYCLE_STAGES.find((st) => st.key === s.currentStage)?.label}
                            </Badge>
                            <Badge variant="outline" className={cn("text-xs", getConditionBadgeClasses(s.condition))}>
                              {getConditionLabel(s.condition)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ─── Condition Log Tab ─────────────────────────────────────────────────────────

function ConditionLogTab({ samples }: { samples: TrackedSample[] }) {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0]?.id || "")

  const selectedSample = useMemo(
    () => samples.find((s) => s.id === selectedSampleId),
    [samples, selectedSampleId]
  )

  return (
    <div className="space-y-6">
      {/* Sample Selector */}
      <Card className="bg-card border">
        <CardContent className="p-4">
          <Label className="text-sm font-medium">Select Sample</Label>
          <select
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.sampleId} - {s.clientName} ({s.barcode})
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {selectedSample && (
        <>
          {/* Current Condition */}
          <Card className="bg-card border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{selectedSample.sampleId}</CardTitle>
                  <CardDescription>
                    {selectedSample.clientName} - {selectedSample.manufacturer} {selectedSample.modelNumber}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-sm", getConditionBadgeClasses(selectedSample.condition))}
                >
                  Current: {getConditionLabel(selectedSample.condition)}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Condition History */}
          <Card className="bg-card border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Condition History</CardTitle>
              <CardDescription>{selectedSample.conditionLogs.length} log entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedSample.conditionLogs.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "rounded-lg border-l-4 bg-muted/30 p-4",
                      log.condition === "good" && "border-l-green-500",
                      log.condition === "minor_damage" && "border-l-yellow-500",
                      log.condition === "damaged" && "border-l-red-500"
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getConditionBadgeClasses(log.condition))}
                        >
                          {getConditionLabel(log.condition)}
                        </Badge>
                        <span className="text-sm font-medium">{log.loggedBy}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{log.description}</p>
                    {log.photoRef && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Photo: <span className="font-mono">{log.photoRef}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function SampleTrackingPage() {
  const samples = useMemo(() => generateMockSamples(), [])
  const batches = useMemo(() => generateBatchData(), [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sample Tracking</h1>
        <p className="text-sm text-muted-foreground">
          Track sample lifecycle, chain of custody, batch management, and condition logs
        </p>
      </div>

      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="tracker" className="gap-1.5">
            <Package className="h-4 w-4" />
            Tracker
          </TabsTrigger>
          <TabsTrigger value="custody" className="gap-1.5">
            <Users className="h-4 w-4" />
            Chain of Custody
          </TabsTrigger>
          <TabsTrigger value="batches" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Batch Management
          </TabsTrigger>
          <TabsTrigger value="condition" className="gap-1.5">
            <AlertCircle className="h-4 w-4" />
            Condition Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="mt-6">
          <TrackerTab samples={samples} />
        </TabsContent>

        <TabsContent value="custody" className="mt-6">
          <ChainOfCustodyTab samples={samples} />
        </TabsContent>

        <TabsContent value="batches" className="mt-6">
          <BatchManagementTab batches={batches} samples={samples} />
        </TabsContent>

        <TabsContent value="condition" className="mt-6">
          <ConditionLogTab samples={samples} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
