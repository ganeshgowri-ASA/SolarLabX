// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Search, Download, Plus, FileText, CheckCircle2, AlertTriangle, Clock, Eye
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type DocType = "QM" | "QP" | "QSF" | "WI" | "AX"
type DocStatus = "Approved" | "Draft" | "Under Review" | "Obsolete"

interface InternalDocument {
  docId: string
  title: string
  type: DocType
  version: string
  effectiveDate: string
  reviewFrequency: string
  nextReview: string
  status: DocStatus
  preparedBy: string
  approvedBy: string
  custodian: string
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const INTERNAL_DOCS: InternalDocument[] = [
  {
    docId: "QP-7.2-01", title: "SOP for I-V Characterization Testing (IEC 60904-1)",
    type: "QP", version: "3.0", effectiveDate: "2025-09-15", reviewFrequency: "Annual",
    nextReview: "2026-09-15", status: "Approved", preparedBy: "Dr. R. Sharma",
    approvedBy: "Prof. K. Mehta", custodian: "Quality Manager"
  },
  {
    docId: "QP-7.2-02", title: "SOP for Electroluminescence (EL) Imaging Inspection",
    type: "QP", version: "2.1", effectiveDate: "2025-08-01", reviewFrequency: "Annual",
    nextReview: "2026-08-01", status: "Approved", preparedBy: "A. Patel",
    approvedBy: "Dr. R. Sharma", custodian: "Lab Supervisor"
  },
  {
    docId: "QP-7.2-03", title: "SOP for Thermal Cycling Test (IEC 61215 MQT 11)",
    type: "QP", version: "2.0", effectiveDate: "2025-07-10", reviewFrequency: "Annual",
    nextReview: "2026-07-10", status: "Approved", preparedBy: "S. Verma",
    approvedBy: "Prof. K. Mehta", custodian: "Quality Manager"
  },
  {
    docId: "QP-6.4-01", title: "SOP for Equipment Calibration & Maintenance",
    type: "QP", version: "4.0", effectiveDate: "2025-06-01", reviewFrequency: "Annual",
    nextReview: "2026-06-01", status: "Approved", preparedBy: "V. Kumar",
    approvedBy: "Dr. R. Sharma", custodian: "Equipment Manager"
  },
  {
    docId: "QP-7.6-01", title: "SOP for Measurement Uncertainty Budget Estimation",
    type: "QP", version: "2.0", effectiveDate: "2025-10-01", reviewFrequency: "Annual",
    nextReview: "2026-10-01", status: "Approved", preparedBy: "Dr. R. Sharma",
    approvedBy: "Prof. K. Mehta", custodian: "Quality Manager"
  },
  {
    docId: "QP-7.4-01", title: "SOP for Sample Handling, Receipt & Storage",
    type: "QP", version: "3.1", effectiveDate: "2025-05-15", reviewFrequency: "Annual",
    nextReview: "2026-05-15", status: "Approved", preparedBy: "M. Singh",
    approvedBy: "Dr. R. Sharma", custodian: "Lab Supervisor"
  },
  {
    docId: "QP-7.2-04", title: "SOP for Insulation Resistance Testing (IEC 61215 MQT 03)",
    type: "QP", version: "2.0", effectiveDate: "2025-11-01", reviewFrequency: "Annual",
    nextReview: "2026-11-01", status: "Approved", preparedBy: "A. Patel",
    approvedBy: "Prof. K. Mehta", custodian: "Quality Manager"
  },
  {
    docId: "QP-7.2-05", title: "SOP for Wet Leakage Current Test (IEC 61215 MQT 15)",
    type: "QP", version: "1.2", effectiveDate: "2025-04-20", reviewFrequency: "Annual",
    nextReview: "2026-04-20", status: "Approved", preparedBy: "S. Verma",
    approvedBy: "Dr. R. Sharma", custodian: "Lab Supervisor"
  },
  {
    docId: "QP-7.2-06", title: "SOP for Mechanical Load Test (IEC 61215 MQT 16)",
    type: "QP", version: "2.0", effectiveDate: "2025-03-01", reviewFrequency: "Annual",
    nextReview: "2026-03-01", status: "Under Review", preparedBy: "V. Kumar",
    approvedBy: "—", custodian: "Quality Manager"
  },
  {
    docId: "QP-7.2-07", title: "SOP for Hail Impact Test (IEC 61215 MQT 17)",
    type: "QP", version: "1.0", effectiveDate: "2025-12-10", reviewFrequency: "Annual",
    nextReview: "2026-12-10", status: "Approved", preparedBy: "M. Singh",
    approvedBy: "Prof. K. Mehta", custodian: "Equipment Manager"
  },
  {
    docId: "QP-7.2-08", title: "SOP for Hot Spot Endurance Test (IEC 61215 MQT 09)",
    type: "QP", version: "1.1", effectiveDate: "2025-10-20", reviewFrequency: "Annual",
    nextReview: "2026-10-20", status: "Approved", preparedBy: "A. Patel",
    approvedBy: "Dr. R. Sharma", custodian: "Quality Manager"
  },
  {
    docId: "QP-7.2-09", title: "SOP for Potential Induced Degradation (PID) Test (IEC 62804)",
    type: "QP", version: "2.0", effectiveDate: "2025-09-01", reviewFrequency: "Annual",
    nextReview: "2026-09-01", status: "Approved", preparedBy: "Dr. R. Sharma",
    approvedBy: "Prof. K. Mehta", custodian: "Lab Supervisor"
  },
  {
    docId: "QP-7.2-10", title: "SOP for Damp Heat Test (IEC 61215 MQT 13)",
    type: "QP", version: "2.2", effectiveDate: "2025-08-15", reviewFrequency: "Annual",
    nextReview: "2026-08-15", status: "Approved", preparedBy: "S. Verma",
    approvedBy: "Dr. R. Sharma", custodian: "Quality Manager"
  },
  {
    docId: "QP-7.2-11", title: "SOP for Humidity Freeze Test (IEC 61215 MQT 12)",
    type: "QP", version: "1.0", effectiveDate: "2026-01-15", reviewFrequency: "Annual",
    nextReview: "2027-01-15", status: "Draft", preparedBy: "V. Kumar",
    approvedBy: "—", custodian: "Quality Manager"
  },
  {
    docId: "QM-01", title: "Quality Manual – Solar PV Testing Laboratory",
    type: "QM", version: "5.0", effectiveDate: "2025-01-01", reviewFrequency: "Annual",
    nextReview: "2026-01-01", status: "Approved", preparedBy: "Prof. K. Mehta",
    approvedBy: "Director", custodian: "Quality Manager"
  },
  {
    docId: "WI-7.2-01", title: "Work Instruction – Solar Simulator Lamp Alignment",
    type: "WI", version: "1.0", effectiveDate: "2025-11-01", reviewFrequency: "Biennial",
    nextReview: "2027-11-01", status: "Approved", preparedBy: "A. Patel",
    approvedBy: "Dr. R. Sharma", custodian: "Lab Supervisor"
  },
  {
    docId: "QSF-7.8-01", title: "Test Report Template – IEC 61215 Type Approval",
    type: "QSF", version: "3.0", effectiveDate: "2025-06-15", reviewFrequency: "Annual",
    nextReview: "2026-06-15", status: "Approved", preparedBy: "Dr. R. Sharma",
    approvedBy: "Prof. K. Mehta", custodian: "Quality Manager"
  },
  {
    docId: "AX-6.2-01", title: "Annexure – Competency Matrix for Lab Personnel",
    type: "AX", version: "2.0", effectiveDate: "2025-03-01", reviewFrequency: "Annual",
    nextReview: "2026-03-01", status: "Approved", preparedBy: "HR Manager",
    approvedBy: "Director", custodian: "HR Manager"
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<DocType, string> = {
  QM: "bg-blue-100 text-blue-700",
  QP: "bg-purple-100 text-purple-700",
  QSF: "bg-green-100 text-green-700",
  WI: "bg-amber-100 text-amber-700",
  AX: "bg-slate-100 text-slate-700",
}

const STATUS_ICONS: Record<DocStatus, JSX.Element> = {
  Approved: <CheckCircle2 className="h-3 w-3 text-green-600" />,
  Draft: <Clock className="h-3 w-3 text-blue-500" />,
  "Under Review": <AlertTriangle className="h-3 w-3 text-amber-500" />,
  Obsolete: <AlertTriangle className="h-3 w-3 text-red-500" />,
}

const STATUS_BADGE: Record<DocStatus, string> = {
  Approved: "bg-green-100 text-green-700",
  Draft: "bg-blue-100 text-blue-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Obsolete: "bg-red-100 text-red-700",
}

function exportCSV(docs: InternalDocument[]) {
  const headers = ["Doc ID", "Title", "Type", "Version", "Effective Date", "Review Frequency",
    "Next Review", "Status", "Prepared By", "Approved By", "Custodian"]
  const rows = docs.map(d => [
    d.docId, `"${d.title}"`, d.type, d.version, d.effectiveDate, d.reviewFrequency,
    d.nextReview, d.status, d.preparedBy, d.approvedBy, d.custodian
  ])
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "internal_documents.csv"
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InternalDocumentsTab() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<DocType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all")

  const filtered = useMemo(() => {
    return INTERNAL_DOCS.filter(d => {
      if (typeFilter !== "all" && d.type !== typeFilter) return false
      if (statusFilter !== "all" && d.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return d.docId.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) ||
          d.preparedBy.toLowerCase().includes(q) || d.custodian.toLowerCase().includes(q)
      }
      return true
    })
  }, [search, typeFilter, statusFilter])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { QM: 0, QP: 0, QSF: 0, WI: 0, AX: 0 }
    INTERNAL_DOCS.forEach(d => counts[d.type]++)
    return counts
  }, [])

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["QM", "QP", "QSF", "WI", "AX"] as DocType[]).map(t => (
          <Card key={t} className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}>
            <CardContent className="pt-4 pb-3 text-center">
              <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${TYPE_COLORS[t]}`}>{t}</div>
              <div className="text-2xl font-bold mt-1">{typeCounts[t]}</div>
              <div className="text-xs text-muted-foreground">
                {t === "QM" ? "Quality Manual" : t === "QP" ? "Procedures" : t === "QSF" ? "Forms" : t === "WI" ? "Work Instructions" : "Annexures"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Doc ID, title, author..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 text-sm" />
            </div>
            <Select value={typeFilter} onValueChange={v => setTypeFilter(v as DocType | "all")}>
              <SelectTrigger className="w-[140px] text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="QM">QM</SelectItem>
                <SelectItem value="QP">QP</SelectItem>
                <SelectItem value="QSF">QSF</SelectItem>
                <SelectItem value="WI">WI</SelectItem>
                <SelectItem value="AX">AX</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as DocStatus | "all")}>
              <SelectTrigger className="w-[150px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Obsolete">Obsolete</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-4 pb-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Doc ID</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Version</TableHead>
                <TableHead className="text-xs">Effective Date</TableHead>
                <TableHead className="text-xs">Review Freq.</TableHead>
                <TableHead className="text-xs">Next Review</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Prepared By</TableHead>
                <TableHead className="text-xs">Approved By</TableHead>
                <TableHead className="text-xs">Custodian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(doc => {
                const overdue = new Date(doc.nextReview) < new Date() && doc.status === "Approved"
                return (
                  <TableRow key={doc.docId} className={overdue ? "bg-red-50/50" : ""}>
                    <TableCell className="text-xs font-mono font-medium">{doc.docId}</TableCell>
                    <TableCell className="text-xs max-w-[280px]">
                      <span className="line-clamp-2">{doc.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${TYPE_COLORS[doc.type]}`}>{doc.type}</span>
                    </TableCell>
                    <TableCell className="text-xs">v{doc.version}</TableCell>
                    <TableCell className="text-xs">{doc.effectiveDate}</TableCell>
                    <TableCell className="text-xs">{doc.reviewFrequency}</TableCell>
                    <TableCell className="text-xs">
                      {overdue ? (
                        <span className="text-red-600 font-medium">{doc.nextReview} (overdue)</span>
                      ) : doc.nextReview}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${STATUS_BADGE[doc.status]}`}>
                        {STATUS_ICONS[doc.status]} {doc.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{doc.preparedBy}</TableCell>
                    <TableCell className="text-xs">{doc.approvedBy}</TableCell>
                    <TableCell className="text-xs">{doc.custodian}</TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-sm text-muted-foreground py-8">
                    No documents match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="text-xs text-muted-foreground mt-3">
            Showing {filtered.length} of {INTERNAL_DOCS.length} documents
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
