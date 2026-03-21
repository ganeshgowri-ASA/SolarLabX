// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Search, Download, Plus, AlertTriangle, Clock, CheckCircle2,
  FileText, GitBranch, Eye, ChevronRight, RefreshCcw, Bell
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type DocType = "QM" | "QP" | "WI" | "QSF" | "AX";
type DocStatus = "Draft" | "Under Review" | "Approved" | "Obsolete";

interface VersionEntry {
  version: string;
  date: string;
  changedBy: string;
  summary: string;
}

interface InternalDocument {
  id: string;
  docId: string;
  title: string;
  type: DocType;
  version: string;
  status: DocStatus;
  owner: string;
  lastReviewed: string;
  nextReview: string;
  clause: string;
  history: VersionEntry[];
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const INTERNAL_DOCS: InternalDocument[] = [
  {
    id: "1", docId: "QM-001", title: "Quality Manual – Solar PV Testing Laboratory", type: "QM",
    version: "Rev D", status: "Approved", owner: "Quality Manager", lastReviewed: "2025-01-15",
    nextReview: "2026-01-15", clause: "8.2",
    history: [
      { version: "Rev A", date: "2021-03-01", changedBy: "Dr. S. Kumar", summary: "Initial release." },
      { version: "Rev B", date: "2022-06-10", changedBy: "P. Sharma", summary: "Added NABL scope section." },
      { version: "Rev C", date: "2023-11-20", changedBy: "Dr. S. Kumar", summary: "Updated org chart and responsibilities." },
      { version: "Rev D", date: "2025-01-15", changedBy: "M. Patel", summary: "Incorporated ISO 17025:2017 amd.1 requirements." },
    ],
  },
  {
    id: "2", docId: "QP-001", title: "Procedure for Document and Record Control", type: "QP",
    version: "Rev C", status: "Approved", owner: "Quality Manager", lastReviewed: "2025-02-10",
    nextReview: "2026-02-10", clause: "8.2",
    history: [
      { version: "Rev A", date: "2021-03-05", changedBy: "P. Sharma", summary: "Initial release." },
      { version: "Rev B", date: "2022-09-15", changedBy: "P. Sharma", summary: "Added electronic record controls." },
      { version: "Rev C", date: "2025-02-10", changedBy: "M. Patel", summary: "Added digital signature workflow." },
    ],
  },
  {
    id: "3", docId: "QP-002", title: "Procedure for Internal Audits", type: "QP",
    version: "Rev B", status: "Approved", owner: "Lead Auditor", lastReviewed: "2025-03-01",
    nextReview: "2026-03-01", clause: "8.7",
    history: [
      { version: "Rev A", date: "2021-04-01", changedBy: "R. Nair", summary: "Initial release." },
      { version: "Rev B", date: "2025-03-01", changedBy: "R. Nair", summary: "Revised audit checklist format." },
    ],
  },
  {
    id: "4", docId: "QP-003", title: "Procedure for CAPA Management", type: "QP",
    version: "Rev B", status: "Approved", owner: "Quality Manager", lastReviewed: "2024-11-20",
    nextReview: "2025-11-20", clause: "8.8",
    history: [
      { version: "Rev A", date: "2021-04-15", changedBy: "P. Sharma", summary: "Initial release." },
      { version: "Rev B", date: "2024-11-20", changedBy: "M. Patel", summary: "Added root cause analysis section." },
    ],
  },
  {
    id: "5", docId: "QP-004", title: "Procedure for Handling Complaints and Appeals", type: "QP",
    version: "Rev A", status: "Approved", owner: "Quality Manager", lastReviewed: "2024-07-01",
    nextReview: "2025-07-01", clause: "8.5 / 8.6",
    history: [
      { version: "Rev A", date: "2024-07-01", changedBy: "P. Sharma", summary: "Initial release." },
    ],
  },
  {
    id: "6", docId: "WI-001", title: "Work Instruction – IEC 61215 Thermal Cycling Test", type: "WI",
    version: "Rev C", status: "Approved", owner: "Lab Manager", lastReviewed: "2025-01-20",
    nextReview: "2026-01-20", clause: "7.2",
    history: [
      { version: "Rev A", date: "2022-01-10", changedBy: "A. Mehta", summary: "Initial release." },
      { version: "Rev B", date: "2023-06-01", changedBy: "A. Mehta", summary: "Updated per IEC 61215-2:2021." },
      { version: "Rev C", date: "2025-01-20", changedBy: "S. Rao", summary: "Added humidity bias step." },
    ],
  },
  {
    id: "7", docId: "WI-002", title: "Work Instruction – IV Curve Measurement (IEC 60904-1)", type: "WI",
    version: "Rev B", status: "Approved", owner: "Test Engineer", lastReviewed: "2025-02-28",
    nextReview: "2026-02-28", clause: "7.2",
    history: [
      { version: "Rev A", date: "2022-03-15", changedBy: "S. Rao", summary: "Initial release." },
      { version: "Rev B", date: "2025-02-28", changedBy: "S. Rao", summary: "Added AM1.5G spectral correction factor." },
    ],
  },
  {
    id: "8", docId: "WI-003", title: "Work Instruction – EL Imaging of PV Modules", type: "WI",
    version: "Rev A", status: "Under Review", owner: "Test Engineer", lastReviewed: "2025-03-10",
    nextReview: "2026-03-10", clause: "7.2",
    history: [
      { version: "Rev A", date: "2025-03-10", changedBy: "K. Iyer", summary: "Initial draft for review." },
    ],
  },
  {
    id: "9", docId: "QSF-001", title: "Sample Registration Form", type: "QSF",
    version: "Rev B", status: "Approved", owner: "Lab Manager", lastReviewed: "2024-10-01",
    nextReview: "2025-10-01", clause: "7.4",
    history: [
      { version: "Rev A", date: "2021-05-01", changedBy: "P. Sharma", summary: "Initial release." },
      { version: "Rev B", date: "2024-10-01", changedBy: "A. Mehta", summary: "Added QR code field." },
    ],
  },
  {
    id: "10", docId: "QSF-002", title: "Equipment Calibration Record Form", type: "QSF",
    version: "Rev A", status: "Approved", owner: "Metrology Officer", lastReviewed: "2024-12-15",
    nextReview: "2025-12-15", clause: "6.4",
    history: [
      { version: "Rev A", date: "2024-12-15", changedBy: "R. Nair", summary: "Initial release." },
    ],
  },
  {
    id: "11", docId: "QSF-003", title: "Non-Conformance Report Form", type: "QSF",
    version: "Rev B", status: "Approved", owner: "Quality Manager", lastReviewed: "2025-01-10",
    nextReview: "2026-01-10", clause: "8.8",
    history: [
      { version: "Rev A", date: "2022-02-01", changedBy: "P. Sharma", summary: "Initial release." },
      { version: "Rev B", date: "2025-01-10", changedBy: "M. Patel", summary: "Added severity classification." },
    ],
  },
  {
    id: "12", docId: "AX-001", title: "Annex – NABL Scope of Accreditation Certificate", type: "AX",
    version: "Rev E", status: "Approved", owner: "Quality Manager", lastReviewed: "2025-03-01",
    nextReview: "2026-03-01", clause: "5.2",
    history: [
      { version: "Rev A", date: "2019-01-01", changedBy: "Director", summary: "First accreditation." },
      { version: "Rev E", date: "2025-03-01", changedBy: "M. Patel", summary: "Renewed – 2025 cycle." },
    ],
  },
  {
    id: "13", docId: "QP-005", title: "Procedure for Risk and Opportunity Management", type: "QP",
    version: "Rev A", status: "Draft", owner: "Quality Manager", lastReviewed: "2026-03-15",
    nextReview: "2027-03-15", clause: "8.9",
    history: [
      { version: "Rev A", date: "2026-03-15", changedBy: "M. Patel", summary: "New procedure – in drafting." },
    ],
  },
  {
    id: "14", docId: "WI-004", title: "Work Instruction – Damp Heat Test (IEC 61215)", type: "WI",
    version: "Rev B", status: "Obsolete", owner: "Lab Manager", lastReviewed: "2023-05-01",
    nextReview: "N/A", clause: "7.2",
    history: [
      { version: "Rev A", date: "2020-07-01", changedBy: "A. Mehta", summary: "Initial release." },
      { version: "Rev B", date: "2023-05-01", changedBy: "S. Rao", summary: "Superseded by WI-006; made obsolete." },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<DocType, { color: string; bg: string; label: string }> = {
  QM:  { color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",   label: "Quality Manual" },
  QP:  { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Quality Procedure" },
  WI:  { color: "text-green-700",  bg: "bg-green-50 border-green-200",  label: "Work Instruction" },
  QSF: { color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",  label: "Form/Template" },
  AX:  { color: "text-rose-700",   bg: "bg-rose-50 border-rose-200",    label: "Annexure" },
};

const STATUS_CONFIG: Record<DocStatus, { variant: string; icon: any; color: string }> = {
  Approved:     { variant: "default",     icon: CheckCircle2,  color: "text-green-600" },
  "Under Review": { variant: "secondary", icon: RefreshCcw,    color: "text-blue-600" },
  Draft:        { variant: "outline",     icon: FileText,      color: "text-amber-600" },
  Obsolete:     { variant: "destructive", icon: AlertTriangle, color: "text-red-600" },
};

function isOverdue(nextReview: string): boolean {
  if (nextReview === "N/A") return false;
  return new Date(nextReview) < new Date();
}

function isDueSoon(nextReview: string): boolean {
  if (nextReview === "N/A") return false;
  const d = new Date(nextReview);
  const now = new Date();
  const in30 = new Date();
  in30.setDate(now.getDate() + 30);
  return d >= now && d <= in30;
}

function exportCSV(docs: InternalDocument[]) {
  const header = ["Doc ID", "Title", "Type", "Version", "Status", "Owner", "Last Reviewed", "Next Review", "Clause"];
  const rows = docs.map(d => [d.docId, `"${d.title}"`, d.type, d.version, d.status, d.owner, d.lastReviewed, d.nextReview, d.clause]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "internal_documents.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Lifecycle Workflow ───────────────────────────────────────────────────────

const LIFECYCLE_STEPS = [
  { label: "Draft",        color: "bg-amber-400",  textColor: "text-amber-700",  desc: "Author creates content" },
  { label: "Under Review", color: "bg-blue-400",   textColor: "text-blue-700",   desc: "Peer / QM review" },
  { label: "Approved",     color: "bg-green-500",  textColor: "text-green-700",  desc: "Authorised & published" },
  { label: "Obsolete",     color: "bg-gray-400",   textColor: "text-gray-600",   desc: "Superseded / withdrawn" },
];

function LifecycleViz() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-blue-600" />
          Document Lifecycle Workflow – ISO 17025 Clause 8.2
        </CardTitle>
        <CardDescription className="text-xs">
          All internal documents follow this controlled lifecycle. Approved documents are subject to periodic review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-1 flex-wrap">
          {LIFECYCLE_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1">
              <div className={cn("flex flex-col items-center p-3 rounded-lg border-2 w-32 text-center", step.color === "bg-gray-400" ? "border-gray-300 bg-gray-50" : "border-transparent", step.textColor)}>
                <div className={cn("w-3 h-3 rounded-full mb-1 mx-auto", step.color)} />
                <div className="text-xs font-bold">{step.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{step.desc}</div>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-200">
          <span className="font-semibold">Review Cycle:</span> QM – annual | QP – annual | WI – biannual | QSF/AX – as needed or on process change
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Version History Panel ────────────────────────────────────────────────────

function VersionHistoryPanel({ doc, onClose }: { doc: InternalDocument; onClose: () => void }) {
  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-blue-600" />
            Version History – {doc.docId}
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">{doc.title}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClose}>✕ Close</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[...doc.history].reverse().map((h, i) => (
            <div key={i} className={cn("flex gap-3 p-2 rounded border text-xs", i === 0 ? "bg-green-50 border-green-200" : "bg-muted/40 border-muted")}>
              <div className="shrink-0 w-16 font-mono font-bold text-blue-700">{h.version}</div>
              <div className="shrink-0 w-24 text-muted-foreground">{h.date}</div>
              <div className="shrink-0 w-28 text-muted-foreground">{h.changedBy}</div>
              <div className="flex-1 text-foreground">{h.summary}</div>
              {i === 0 && <Badge variant="default" className="text-[10px] h-4">Current</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InternalDocumentsTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return INTERNAL_DOCS.filter(d => {
      const matchSearch = !search || d.docId.toLowerCase().includes(search.toLowerCase()) || d.title.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || d.type === typeFilter;
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const overdue = INTERNAL_DOCS.filter(d => isOverdue(d.nextReview) && d.status !== "Obsolete");
  const dueSoon = INTERNAL_DOCS.filter(d => isDueSoon(d.nextReview) && d.status !== "Obsolete");

  const stats = useMemo(() => ({
    total: INTERNAL_DOCS.length,
    approved: INTERNAL_DOCS.filter(d => d.status === "Approved").length,
    underReview: INTERNAL_DOCS.filter(d => d.status === "Under Review").length,
    draft: INTERNAL_DOCS.filter(d => d.status === "Draft").length,
    obsolete: INTERNAL_DOCS.filter(d => d.status === "Obsolete").length,
  }), []);

  return (
    <div className="space-y-4">
      {/* ── Header Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Docs", value: stats.total, color: "text-blue-600", bg: "border-l-blue-500" },
          { label: "Approved", value: stats.approved, color: "text-green-600", bg: "border-l-green-500" },
          { label: "Under Review", value: stats.underReview, color: "text-blue-600", bg: "border-l-blue-400" },
          { label: "Draft", value: stats.draft, color: "text-amber-600", bg: "border-l-amber-500" },
          { label: "Obsolete", value: stats.obsolete, color: "text-gray-500", bg: "border-l-gray-400" },
        ].map(s => (
          <Card key={s.label} className={cn("border-l-4", s.bg)}>
            <CardContent className="pt-4 pb-3">
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Alerts ── */}
      {(overdue.length > 0 || dueSoon.length > 0) && (
        <div className="space-y-2">
          {overdue.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Overdue Review ({overdue.length}):</span>{" "}
                {overdue.map(d => d.docId).join(", ")} — immediate review required.
              </div>
            </div>
          )}
          {dueSoon.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <Bell className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Due for Review in 30 Days ({dueSoon.length}):</span>{" "}
                {dueSoon.map(d => d.docId).join(", ")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Lifecycle Viz ── */}
      <LifecycleViz />

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder="Search Doc ID, title, owner…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Types</SelectItem>
            {(Object.keys(TYPE_CONFIG) as DocType[]).map(t => (
              <SelectItem key={t} value={t} className="text-xs">{t} – {TYPE_CONFIG[t].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
            {(["Approved", "Under Review", "Draft", "Obsolete"] as DocStatus[]).map(s => (
              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => exportCSV(filtered)}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
        <Button size="sm" className="h-8 text-xs gap-1">
          <Plus className="h-3.5 w-3.5" /> Add Document
        </Button>
      </div>

      {/* ── Master List Table ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Master List of Internal Documents
            <Badge variant="outline" className="ml-auto text-xs">{filtered.length} records</Badge>
          </CardTitle>
          <CardDescription className="text-xs">ISO 17025:2017 Clause 8.2 – Control of management system documents</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["Doc ID", "Title", "Type", "Version", "Status", "Owner", "Last Reviewed", "Next Review", ""].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const sc = STATUS_CONFIG[doc.status];
                  const tc = TYPE_CONFIG[doc.type];
                  const over = isOverdue(doc.nextReview) && doc.status !== "Obsolete";
                  const soon = isDueSoon(doc.nextReview) && doc.status !== "Obsolete";
                  return (
                    <>
                      <tr key={doc.id} className={cn("border-b hover:bg-muted/30 transition-colors", over && "bg-red-50", expandedId === doc.id && "bg-blue-50")}>
                        <td className="px-3 py-2 font-mono font-bold text-blue-700">{doc.docId}</td>
                        <td className="px-3 py-2 max-w-[280px] truncate" title={doc.title}>{doc.title}</td>
                        <td className="px-3 py-2">
                          <span className={cn("px-1.5 py-0.5 rounded border text-[10px] font-bold", tc.bg, tc.color)}>{doc.type}</span>
                        </td>
                        <td className="px-3 py-2 font-mono">{doc.version}</td>
                        <td className="px-3 py-2">
                          <span className={cn("flex items-center gap-1 font-medium", sc.color)}>
                            <sc.icon className="h-3 w-3" />{doc.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{doc.owner}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{doc.lastReviewed}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={cn(over && "text-red-600 font-bold", soon && "text-amber-600 font-bold")}>
                            {doc.nextReview}
                          </span>
                          {over && <AlertTriangle className="inline ml-1 h-3 w-3 text-red-500" />}
                          {soon && !over && <Clock className="inline ml-1 h-3 w-3 text-amber-500" />}
                        </td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1"
                            onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}>
                            <Eye className="h-3 w-3" />
                            {expandedId === doc.id ? "Hide" : "History"}
                          </Button>
                        </td>
                      </tr>
                      {expandedId === doc.id && (
                        <tr key={`hist-${doc.id}`} className="bg-blue-50/60">
                          <td colSpan={9} className="px-3 py-2">
                            <VersionHistoryPanel doc={doc} onClose={() => setExpandedId(null)} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-xs">No documents match the current filters.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Review Schedule ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Review Schedule Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Overdue ({overdue.length})
              </div>
              {overdue.length === 0
                ? <div className="text-xs text-muted-foreground">None</div>
                : overdue.map(d => (
                  <div key={d.id} className="text-xs text-red-800 py-0.5">{d.docId} – {d.nextReview}</div>
                ))}
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                <Bell className="h-3 w-3" /> Due in 30 Days ({dueSoon.length})
              </div>
              {dueSoon.length === 0
                ? <div className="text-xs text-muted-foreground">None</div>
                : dueSoon.map(d => (
                  <div key={d.id} className="text-xs text-amber-800 py-0.5">{d.docId} – {d.nextReview}</div>
                ))}
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Up to Date
              </div>
              <div className="text-2xl font-bold text-green-700">
                {INTERNAL_DOCS.filter(d => d.status === "Approved" && !isOverdue(d.nextReview) && !isDueSoon(d.nextReview)).length}
              </div>
              <div className="text-xs text-muted-foreground">documents current</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
