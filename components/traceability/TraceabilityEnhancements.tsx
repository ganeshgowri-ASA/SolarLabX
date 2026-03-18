// @ts-nocheck
'use client'

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Clock,
  User,
  FileText,
  CheckCircle2,
  Edit3,
  ArrowRightLeft,
  ShieldCheck,
  Trash2,
  Plus,
  Link2,
  Download,
  Eye,
  ChevronDown,
  ChevronRight,
  Filter,
  Calendar,
  FileDown,
  FileSpreadsheet,
  FileType,
  Beaker,
  ClipboardCheck,
  Wrench,
  BookOpen,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"

// ============================================================================
// Mock Data - Audit Trail Timeline
// ============================================================================

const mockAuditTimelineEvents = [
  {
    id: "ATE-001",
    timestamp: "2026-03-18T09:15:00",
    action: "created",
    user: "Dr. Priya Sharma",
    role: "Lab Manager",
    recordType: "Sample",
    recordId: "SMP-2026-0142",
    description: "New sample registered: LONGi Hi-MO 6 Module (545W)",
    changes: null,
  },
  {
    id: "ATE-002",
    timestamp: "2026-03-18T09:32:00",
    action: "created",
    user: "Dr. Priya Sharma",
    role: "Lab Manager",
    recordType: "Test Protocol",
    recordId: "TP-IEC61215-0089",
    description: "Test protocol created for IEC 61215 Design Qualification",
    changes: null,
  },
  {
    id: "ATE-003",
    timestamp: "2026-03-18T10:05:00",
    action: "approved",
    user: "Dr. Rajesh Kumar",
    role: "Technical Director",
    recordType: "Test Protocol",
    recordId: "TP-IEC61215-0089",
    description: "Test protocol approved for execution",
    changes: { field: "Status", from: "Draft", to: "Approved" },
  },
  {
    id: "ATE-004",
    timestamp: "2026-03-18T10:45:00",
    action: "modified",
    user: "Ankit Verma",
    role: "Technician",
    recordType: "Equipment",
    recordId: "EQ-SS-001",
    description: "Sun simulator calibration data updated after annual recalibration",
    changes: { field: "Calibration Date", from: "2025-03-15", to: "2026-03-18" },
  },
  {
    id: "ATE-005",
    timestamp: "2026-03-17T14:20:00",
    action: "transferred",
    user: "Meera Patel",
    role: "Sample Coordinator",
    recordType: "Sample",
    recordId: "SMP-2026-0141",
    description: "Sample transferred from Receiving Bay to Environmental Test Chamber #2",
    changes: { field: "Location", from: "Receiving Bay", to: "Env. Chamber #2" },
  },
  {
    id: "ATE-006",
    timestamp: "2026-03-17T11:00:00",
    action: "created",
    user: "Ankit Verma",
    role: "Technician",
    recordType: "Test Result",
    recordId: "TR-TC200-0056",
    description: "TC200 thermal cycling test results recorded (200 cycles completed)",
    changes: null,
  },
  {
    id: "ATE-007",
    timestamp: "2026-03-17T09:30:00",
    action: "approved",
    user: "Dr. Priya Sharma",
    role: "Lab Manager",
    recordType: "Calibration Certificate",
    recordId: "CAL-2026-0034",
    description: "Calibration certificate approved for Reference Cell RC-001",
    changes: { field: "Status", from: "Pending Review", to: "Approved" },
  },
  {
    id: "ATE-008",
    timestamp: "2026-03-16T16:45:00",
    action: "modified",
    user: "Suresh Reddy",
    role: "Quality Manager",
    recordType: "SOP",
    recordId: "SOP-PV-TC-003",
    description: "SOP for Thermal Cycling updated to Rev 4 (added IEC 61215:2021 changes)",
    changes: { field: "Revision", from: "Rev 3", to: "Rev 4" },
  },
  {
    id: "ATE-009",
    timestamp: "2026-03-16T14:10:00",
    action: "created",
    user: "Dr. Rajesh Kumar",
    role: "Technical Director",
    recordType: "Test Report",
    recordId: "RPT-IEC61730-0078",
    description: "Final test report generated for IEC 61730 Safety Qualification",
    changes: null,
  },
  {
    id: "ATE-010",
    timestamp: "2026-03-16T10:00:00",
    action: "transferred",
    user: "Meera Patel",
    role: "Sample Coordinator",
    recordType: "Sample",
    recordId: "SMP-2026-0139",
    description: "Sample returned to client after testing completion (Trina Solar TSM-DEG21C.20)",
    changes: { field: "Status", from: "Testing Complete", to: "Returned to Client" },
  },
  {
    id: "ATE-011",
    timestamp: "2026-03-15T15:30:00",
    action: "deleted",
    user: "Dr. Priya Sharma",
    role: "Lab Manager",
    recordType: "Test Protocol",
    recordId: "TP-DRAFT-0091",
    description: "Draft test protocol removed (duplicate entry)",
    changes: null,
  },
  {
    id: "ATE-012",
    timestamp: "2026-03-15T11:20:00",
    action: "approved",
    user: "Suresh Reddy",
    role: "Quality Manager",
    recordType: "SOP",
    recordId: "SOP-PV-DH-002",
    description: "Damp Heat test SOP approved after management review",
    changes: { field: "Status", from: "Under Review", to: "Approved" },
  },
  {
    id: "ATE-013",
    timestamp: "2026-03-15T09:00:00",
    action: "created",
    user: "Ankit Verma",
    role: "Technician",
    recordType: "Equipment",
    recordId: "EQ-IR-003",
    description: "New IR camera registered: FLIR T540 (for EL/IR imaging)",
    changes: null,
  },
  {
    id: "ATE-014",
    timestamp: "2026-03-14T16:00:00",
    action: "modified",
    user: "Dr. Rajesh Kumar",
    role: "Technical Director",
    recordType: "Test Report",
    recordId: "RPT-IEC61215-0077",
    description: "Test report amended with corrected uncertainty values",
    changes: { field: "Expanded Uncertainty", from: "±2.1%", to: "±1.8%" },
  },
  {
    id: "ATE-015",
    timestamp: "2026-03-14T10:30:00",
    action: "transferred",
    user: "Meera Patel",
    role: "Sample Coordinator",
    recordType: "Sample",
    recordId: "SMP-2026-0140",
    description: "Sample moved to UV preconditioning chamber for IEC 61215 MQT 10",
    changes: { field: "Location", from: "Storage Area A", to: "UV Chamber #1" },
  },
]

const actionConfig = {
  created: { color: "bg-green-100 text-green-800 border-green-300", dotColor: "bg-green-500", icon: Plus, label: "Created" },
  modified: { color: "bg-blue-100 text-blue-800 border-blue-300", dotColor: "bg-blue-500", icon: Edit3, label: "Modified" },
  approved: { color: "bg-amber-100 text-amber-800 border-amber-300", dotColor: "bg-amber-500", icon: ShieldCheck, label: "Approved" },
  transferred: { color: "bg-purple-100 text-purple-800 border-purple-300", dotColor: "bg-purple-500", icon: ArrowRightLeft, label: "Transferred" },
  deleted: { color: "bg-red-100 text-red-800 border-red-300", dotColor: "bg-red-500", icon: Trash2, label: "Deleted" },
}

const recordTypeIcons = {
  "Sample": Beaker,
  "Test Protocol": ClipboardCheck,
  "Test Result": BarChart3,
  "Equipment": Wrench,
  "Calibration Certificate": ShieldCheck,
  "SOP": BookOpen,
  "Test Report": FileText,
}

// ============================================================================
// 1. AuditTrailTimeline Component
// ============================================================================

export function AuditTrailTimeline() {
  const [recordTypeFilter, setRecordTypeFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const uniqueRecordTypes = [...new Set(mockAuditTimelineEvents.map(e => e.recordType))]
  const uniqueUsers = [...new Set(mockAuditTimelineEvents.map(e => e.user))]

  const filteredEvents = useMemo(() => {
    return mockAuditTimelineEvents.filter(event => {
      const matchesRecordType = recordTypeFilter === "all" || event.recordType === recordTypeFilter
      const matchesUser = userFilter === "all" || event.user === userFilter
      const matchesDateFrom = !dateFrom || event.timestamp >= dateFrom
      const matchesDateTo = !dateTo || event.timestamp <= dateTo + "T23:59:59"
      return matchesRecordType && matchesUser && matchesDateFrom && matchesDateTo
    })
  }, [recordTypeFilter, userFilter, dateFrom, dateTo])

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof mockAuditTimelineEvents> = {}
    filteredEvents.forEach(event => {
      const date = event.timestamp.split("T")[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(event)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filteredEvents])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Visual Audit Trail Timeline
          </CardTitle>
          <CardDescription>Chronological record of all actions across the traceability system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label className="text-xs mb-1 block">Record Type</Label>
              <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueRecordTypes.map(rt => (
                    <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">User</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {uniqueUsers.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">From Date</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">To Date</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Action type legend */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(actionConfig).map(([key, config]) => {
              const Icon = config.icon
              return (
                <div key={key} className="flex items-center gap-1.5 text-xs">
                  <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                  <Icon className="h-3 w-3" />
                  <span>{config.label}</span>
                </div>
              )
            })}
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {groupedEvents.map(([date, events]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <Badge variant="secondary" className="text-xs">{events.length} events</Badge>
                </div>

                {/* Events for this date */}
                <div className="relative ml-4">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-4">
                    {events.map((event, idx) => {
                      const config = actionConfig[event.action] || actionConfig.created
                      const ActionIcon = config.icon
                      const RecordIcon = recordTypeIcons[event.recordType] || FileText

                      return (
                        <div key={event.id} className="relative flex gap-4 pl-2">
                          {/* Timeline dot */}
                          <div className={`relative z-10 w-6 h-6 rounded-full ${config.dotColor} flex items-center justify-center shrink-0 ring-4 ring-background`}>
                            <ActionIcon className="h-3 w-3 text-white" />
                          </div>

                          {/* Event card */}
                          <div className="flex-1 pb-2">
                            <div className="bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className={`text-xs ${config.color}`}>
                                    {config.label}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                    <RecordIcon className="h-3 w-3" />
                                    {event.recordType}
                                  </Badge>
                                  <span className="font-mono text-xs text-muted-foreground">{event.recordId}</span>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(event.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>

                              <p className="text-sm mb-2">{event.description}</p>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {event.user} ({event.role})
                                </span>
                              </div>

                              {event.changes && (
                                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                  <span className="font-medium">{event.changes.field}:</span>{" "}
                                  <span className="text-red-600 line-through">{event.changes.from}</span>{" "}
                                  <span className="mx-1">&rarr;</span>{" "}
                                  <span className="text-green-600 font-medium">{event.changes.to}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

            {groupedEvents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No audit trail events match the current filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


// ============================================================================
// Mock Data - Linked Document References
// ============================================================================

const mockLinkedDocuments = [
  {
    id: "LD-001",
    type: "Sample",
    docId: "SMP-2026-0142",
    title: "LONGi Hi-MO 6 Module (545W)",
    status: "Under Test",
    linkedTo: ["TP-IEC61215-0089", "EQ-SS-001", "CAL-2026-0034", "SOP-PV-TC-003"],
  },
  {
    id: "LD-002",
    type: "Test Protocol",
    docId: "TP-IEC61215-0089",
    title: "IEC 61215 Design Qualification Protocol",
    status: "Approved",
    linkedTo: ["SMP-2026-0142", "SOP-PV-TC-003", "SOP-PV-DH-002", "EQ-SS-001", "EQ-TC-001"],
  },
  {
    id: "LD-003",
    type: "Test Result",
    docId: "TR-TC200-0056",
    title: "Thermal Cycling 200 Cycles - Results",
    status: "Complete",
    linkedTo: ["SMP-2026-0141", "TP-IEC61215-0088", "EQ-TC-001", "CAL-2026-0031", "RPT-IEC61215-0077"],
  },
  {
    id: "LD-004",
    type: "Calibration Certificate",
    docId: "CAL-2026-0034",
    title: "Reference Cell RC-001 Calibration Certificate",
    status: "Active",
    linkedTo: ["EQ-SS-001", "SMP-2026-0142", "TR-STC-0061"],
  },
  {
    id: "LD-005",
    type: "SOP",
    docId: "SOP-PV-TC-003",
    title: "SOP: Thermal Cycling Test per IEC 61215 MQT 11",
    status: "Active (Rev 4)",
    linkedTo: ["TP-IEC61215-0089", "TP-IEC61215-0088", "EQ-TC-001", "SMP-2026-0142", "SMP-2026-0141"],
  },
  {
    id: "LD-006",
    type: "SOP",
    docId: "SOP-PV-DH-002",
    title: "SOP: Damp Heat Test per IEC 61215 MQT 13",
    status: "Active (Rev 2)",
    linkedTo: ["TP-IEC61215-0089", "EQ-DH-001"],
  },
  {
    id: "LD-007",
    type: "Equipment",
    docId: "EQ-SS-001",
    title: "Pasan SunSim 3C Solar Simulator",
    status: "Active",
    linkedTo: ["CAL-2026-0034", "SMP-2026-0142", "TP-IEC61215-0089", "TR-STC-0061"],
  },
  {
    id: "LD-008",
    type: "Equipment",
    docId: "EQ-TC-001",
    title: "Votsch VCS 7340-5 Thermal Chamber",
    status: "Active",
    linkedTo: ["CAL-2026-0031", "TP-IEC61215-0089", "SOP-PV-TC-003", "TR-TC200-0056"],
  },
  {
    id: "LD-009",
    type: "Test Report",
    docId: "RPT-IEC61215-0077",
    title: "IEC 61215 Design Qualification Report - Jinko Tiger Neo",
    status: "Issued",
    linkedTo: ["TR-TC200-0056", "TR-DH1000-0054", "TR-STC-0058", "SMP-2026-0139"],
  },
  {
    id: "LD-010",
    type: "Test Report",
    docId: "RPT-IEC61730-0078",
    title: "IEC 61730 Safety Qualification Report - Jinko Tiger Neo",
    status: "Issued",
    linkedTo: ["SMP-2026-0139", "TR-HV-0032", "TR-IGN-0019"],
  },
  {
    id: "LD-011",
    type: "Test Result",
    docId: "TR-STC-0061",
    title: "STC Power Measurement - LONGi Hi-MO 6",
    status: "Complete",
    linkedTo: ["SMP-2026-0142", "EQ-SS-001", "CAL-2026-0034"],
  },
  {
    id: "LD-012",
    type: "Sample",
    docId: "SMP-2026-0141",
    title: "Canadian Solar HiKu7 Module (590W)",
    status: "Testing Complete",
    linkedTo: ["TP-IEC61215-0088", "TR-TC200-0056", "SOP-PV-TC-003", "EQ-TC-001"],
  },
]

const docTypeConfig = {
  "Sample": { color: "bg-cyan-100 text-cyan-800", icon: Beaker },
  "Test Protocol": { color: "bg-indigo-100 text-indigo-800", icon: ClipboardCheck },
  "Test Result": { color: "bg-emerald-100 text-emerald-800", icon: BarChart3 },
  "Equipment": { color: "bg-slate-100 text-slate-800", icon: Wrench },
  "Calibration Certificate": { color: "bg-amber-100 text-amber-800", icon: ShieldCheck },
  "SOP": { color: "bg-violet-100 text-violet-800", icon: BookOpen },
  "Test Report": { color: "bg-rose-100 text-rose-800", icon: FileText },
}

// ============================================================================
// 2. LinkedDocumentReferences Component
// ============================================================================

export function LinkedDocumentReferences() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState("all")
  const [search, setSearch] = useState("")

  const uniqueTypes = [...new Set(mockLinkedDocuments.map(d => d.type))]

  const filteredDocs = useMemo(() => {
    return mockLinkedDocuments.filter(doc => {
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      const matchesSearch = !search ||
        doc.docId.toLowerCase().includes(search.toLowerCase()) ||
        doc.title.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [typeFilter, search])

  const resolveDocTitle = (docId: string) => {
    const found = mockLinkedDocuments.find(d => d.docId === docId)
    return found ? found.title : docId
  }

  const resolveDocType = (docId: string) => {
    const found = mockLinkedDocuments.find(d => d.docId === docId)
    return found ? found.type : "Unknown"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-5 w-5 text-amber-600" />
            Linked Document References
          </CardTitle>
          <CardDescription>
            Cross-reference network showing relationships between samples, test results, calibration certificates, SOPs, and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by document ID or title..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Document Types</SelectItem>
                {uniqueTypes.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document type legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(docTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              return (
                <div key={type} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${config.color}`}>
                  <Icon className="h-3 w-3" />
                  {type}
                </div>
              )
            })}
          </div>

          {/* References Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Links</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocs.map(doc => {
                  const isExpanded = expandedRow === doc.id
                  const config = docTypeConfig[doc.type] || { color: "bg-gray-100 text-gray-800", icon: FileText }
                  const DocIcon = config.icon

                  return (
                    <React.Fragment key={doc.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedRow(isExpanded ? null : doc.id)}
                      >
                        <TableCell className="p-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${config.color}`}>
                            <DocIcon className="h-3 w-3 mr-1" />
                            {doc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm font-semibold">{doc.docId}</TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">{doc.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{doc.status}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{doc.linkedTo.length}</Badge>
                        </TableCell>
                      </TableRow>

                      {/* Expanded linked chain */}
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              <p className="text-sm font-medium flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-amber-600" />
                                Linked Documents ({doc.linkedTo.length})
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {doc.linkedTo.map(linkedId => {
                                  const linkedType = resolveDocType(linkedId)
                                  const linkedTitle = resolveDocTitle(linkedId)
                                  const linkedConfig = docTypeConfig[linkedType] || { color: "bg-gray-100 text-gray-800", icon: FileText }
                                  const LinkedIcon = linkedConfig.icon

                                  return (
                                    <div key={linkedId} className="flex items-center gap-2 p-2 bg-background rounded border text-sm">
                                      <LinkedIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-xs font-semibold">{linkedId}</span>
                                          <Badge variant="outline" className={`text-[10px] px-1 py-0 ${linkedConfig.color}`}>
                                            {linkedType}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{linkedTitle}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Visual chain representation */}
                              <div className="mt-3 p-3 bg-background rounded border">
                                <p className="text-xs font-medium mb-2 text-muted-foreground">Reference Chain</p>
                                <div className="flex flex-wrap items-center gap-1">
                                  <Badge className={`${config.color} text-xs`}>
                                    <DocIcon className="h-3 w-3 mr-1" />
                                    {doc.docId}
                                  </Badge>
                                  <span className="text-muted-foreground text-xs mx-1">&harr;</span>
                                  {doc.linkedTo.map((linkedId, idx) => {
                                    const lt = resolveDocType(linkedId)
                                    const lc = docTypeConfig[lt] || { color: "bg-gray-100 text-gray-800", icon: FileText }
                                    return (
                                      <React.Fragment key={linkedId}>
                                        <Badge variant="outline" className={`${lc.color} text-[10px]`}>{linkedId}</Badge>
                                        {idx < doc.linkedTo.length - 1 && <span className="text-muted-foreground text-[10px]">,</span>}
                                      </React.Fragment>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No documents match the current filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


// ============================================================================
// 3. ExportToPDF Component
// ============================================================================

export function ExportToPDF() {
  const [exportSections, setExportSections] = useState({
    auditTrail: true,
    traceabilityChain: true,
    equipmentRecords: false,
    documentReferences: true,
    masterFiles: false,
    complianceSummary: true,
  })
  const [dateFrom, setDateFrom] = useState("2026-03-01")
  const [dateTo, setDateTo] = useState("2026-03-18")
  const [format, setFormat] = useState("pdf")
  const [isGenerating, setIsGenerating] = useState(false)

  const sectionLabels = {
    auditTrail: { label: "Audit Trail", description: "Complete chronological log of all actions", icon: Clock },
    traceabilityChain: { label: "Traceability Chains", description: "Full sample-to-report traceability data flows", icon: Link2 },
    equipmentRecords: { label: "Equipment Records", description: "Equipment master file with calibration data", icon: Wrench },
    documentReferences: { label: "Document References", description: "Cross-reference network of linked documents", icon: FileText },
    masterFiles: { label: "Master Files", description: "Personnel, standards, customers, suppliers", icon: BookOpen },
    complianceSummary: { label: "Compliance Summary", description: "ISO 17025 / NABL compliance status overview", icon: ShieldCheck },
  }

  const formatOptions = [
    { value: "pdf", label: "PDF Document", icon: FileDown, description: "Formatted report with charts and tables" },
    { value: "excel", label: "Excel Workbook", icon: FileSpreadsheet, description: "Multi-sheet workbook with raw data" },
    { value: "csv", label: "CSV Export", icon: FileType, description: "Comma-separated values for data import" },
  ]

  const selectedCount = Object.values(exportSections).filter(Boolean).length
  const totalSections = Object.keys(exportSections).length

  const toggleSection = (key: string) => {
    setExportSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleGenerate = () => {
    if (selectedCount === 0) {
      toast.error("Please select at least one section to export.")
      return
    }

    setIsGenerating(true)

    // Simulate export generation
    setTimeout(() => {
      setIsGenerating(false)
      const selectedNames = Object.entries(exportSections)
        .filter(([, v]) => v)
        .map(([k]) => sectionLabels[k].label)
        .join(", ")

      toast.success(
        `Export generated successfully! Format: ${format.toUpperCase()} | Sections: ${selectedNames} | Date range: ${dateFrom} to ${dateTo}`,
        { duration: 5000 }
      )
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-5 w-5 text-amber-600" />
                Export Configuration
              </CardTitle>
              <CardDescription>Select sections, date range, and format for your traceability export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sections to include */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Sections to Include ({selectedCount}/{totalSections} selected)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(sectionLabels).map(([key, config]) => {
                    const Icon = config.icon
                    const isChecked = exportSections[key]
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isChecked
                            ? "border-amber-400 bg-amber-50/50"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSection(key)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 accent-amber-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">From</Label>
                    <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">To</Label>
                    <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Export Format</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {formatOptions.map(opt => {
                    const Icon = opt.icon
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          format === opt.value
                            ? "border-amber-400 bg-amber-50/50"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="exportFormat"
                          value={opt.value}
                          checked={format === opt.value}
                          onChange={() => setFormat(opt.value)}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 accent-amber-600"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{opt.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedCount === 0}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Export...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate {format.toUpperCase()} Export
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-600" />
                Export Preview
              </CardTitle>
              <CardDescription>Summary of what will be included</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Format:</span>
                <Badge className="bg-amber-100 text-amber-800">{format.toUpperCase()}</Badge>
              </div>

              {/* Date range */}
              <div>
                <span className="text-xs text-muted-foreground">Date Range:</span>
                <p className="text-sm font-medium">
                  {new Date(dateFrom + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" "}&mdash;{" "}
                  {new Date(dateTo + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>

              {/* Selected sections */}
              <div>
                <span className="text-xs text-muted-foreground mb-2 block">
                  Included Sections ({selectedCount}):
                </span>
                <div className="space-y-1.5">
                  {Object.entries(sectionLabels).map(([key, config]) => {
                    const Icon = config.icon
                    const isChecked = exportSections[key]
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2 text-xs p-1.5 rounded ${
                          isChecked ? "bg-green-50 text-green-800" : "bg-muted/50 text-muted-foreground line-through"
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                        )}
                        <Icon className="h-3 w-3 shrink-0" />
                        <span>{config.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Estimated size */}
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Estimated records:</span>
                  <span className="font-medium">{selectedCount * 12 + 5}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Estimated pages:</span>
                  <span className="font-medium">{selectedCount * 3 + 2}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Est. file size:</span>
                  <span className="font-medium">
                    {format === "pdf" ? `~${selectedCount * 120 + 50} KB` : format === "excel" ? `~${selectedCount * 80 + 30} KB` : `~${selectedCount * 25 + 10} KB`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
