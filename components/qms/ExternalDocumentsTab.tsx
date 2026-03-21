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
  Search, Download, Plus, Bell, RefreshCcw, BookOpen, CheckCircle2,
  AlertTriangle, Clock, ExternalLink, Filter, FileText, Calendar, Users
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DocStatus = "Current" | "Superseded" | "Withdrawn" | "Under Review";
type DocSource = "IEC" | "ISO" | "BIS" | "MNRE" | "NABL" | "ASTM" | "IEEE";

interface ExternalDocument {
  id: string;
  title: string;
  standardNumber: string;
  edition: string;
  year: number;
  amendmentStatus: string;
  source: DocSource;
  dateReceived: string;
  reviewedBy: string;
  reviewDate: string;
  nextReviewDate: string;
  distributionList: string[];
  locationPhysical: string;
  locationDigital: string;
  supersededBy?: string;
  status: DocStatus;
  clause: string; // ISO 17025 clause reference
  changeHistory: ChangeRecord[];
}

interface ChangeRecord {
  date: string;
  action: string;
  by: string;
  notes: string;
}

// ─── Seed Data ──────────────────────────────────────────────────────────────────

const EXTERNAL_DOCUMENTS: ExternalDocument[] = [
  {
    id: "EXT-001",
    title: "Photovoltaic (PV) modules — Design qualification and type approval — Part 1: Test requirements",
    standardNumber: "IEC 61215-1",
    edition: "Ed.2",
    year: 2021,
    amendmentStatus: "Amendment 1 (2023) incorporated",
    source: "IEC",
    dateReceived: "2021-07-15",
    reviewedBy: "Dr. Meera Patel",
    reviewDate: "2025-01-10",
    nextReviewDate: "2026-01-10",
    distributionList: ["Lab Manager", "Test Engineer", "Quality Manager"],
    locationPhysical: "QMS Cabinet – Shelf A1",
    locationDigital: "SharePoint/ExternalStandards/IEC61215",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2021-07-15", action: "First Receipt", by: "Dr. Meera Patel", notes: "Received from BIS. Replaced Ed.1 (2016)." },
      { date: "2023-05-20", action: "Amendment", by: "Priya Sharma", notes: "Amendment 1 incorporated; test conditions updated." },
      { date: "2025-01-10", action: "Annual Review", by: "Dr. Meera Patel", notes: "Confirmed current. No new edition expected before 2027." },
    ],
  },
  {
    id: "EXT-002",
    title: "Photovoltaic (PV) modules — Design qualification and type approval — Part 1-1: Special requirements for testing of thin-film",
    standardNumber: "IEC 61215-1-1",
    edition: "Ed.1",
    year: 2016,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2017-03-01",
    reviewedBy: "Priya Sharma",
    reviewDate: "2025-03-01",
    nextReviewDate: "2026-03-01",
    distributionList: ["Lab Manager", "Test Engineer"],
    locationPhysical: "QMS Cabinet – Shelf A1",
    locationDigital: "SharePoint/ExternalStandards/IEC61215",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2017-03-01", action: "First Receipt", by: "Priya Sharma", notes: "Received from IEC." },
      { date: "2025-03-01", action: "Annual Review", by: "Priya Sharma", notes: "Still current." },
    ],
  },
  {
    id: "EXT-003",
    title: "Photovoltaic (PV) module safety qualification — Part 1: Requirements for construction",
    standardNumber: "IEC 61730-1",
    edition: "Ed.2",
    year: 2023,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2023-10-01",
    reviewedBy: "Dr. Meera Patel",
    reviewDate: "2025-02-15",
    nextReviewDate: "2026-02-15",
    distributionList: ["Lab Manager", "Test Engineer", "Quality Manager", "Safety Officer"],
    locationPhysical: "QMS Cabinet – Shelf A2",
    locationDigital: "SharePoint/ExternalStandards/IEC61730",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2023-10-01", action: "First Receipt", by: "Dr. Meera Patel", notes: "Replaced Ed.1 (2016). Major revision—safety marking requirements updated." },
      { date: "2025-02-15", action: "Annual Review", by: "Dr. Meera Patel", notes: "Current. IEC TC82 has no active amendment." },
    ],
  },
  {
    id: "EXT-004",
    title: "Measurement of photovoltaic current–voltage characteristics — Part 1: Requirements for I-V curve measurement",
    standardNumber: "IEC 60904-1",
    edition: "Ed.3",
    year: 2020,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2020-11-05",
    reviewedBy: "Anil Mehta",
    reviewDate: "2025-04-01",
    nextReviewDate: "2026-04-01",
    distributionList: ["Test Engineer", "Data Analyst"],
    locationPhysical: "QMS Cabinet – Shelf B1",
    locationDigital: "SharePoint/ExternalStandards/IEC60904",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2020-11-05", action: "First Receipt", by: "Anil Mehta", notes: "Replaced Ed.2." },
      { date: "2025-04-01", action: "Annual Review", by: "Anil Mehta", notes: "Confirmed current." },
    ],
  },
  {
    id: "EXT-005",
    title: "Photovoltaic devices — Part 9: Classification of solar simulator characteristics",
    standardNumber: "IEC 60904-9",
    edition: "Ed.3",
    year: 2020,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2020-12-01",
    reviewedBy: "Anil Mehta",
    reviewDate: "2025-04-01",
    nextReviewDate: "2026-04-01",
    distributionList: ["Test Engineer", "Lab Manager"],
    locationPhysical: "QMS Cabinet – Shelf B1",
    locationDigital: "SharePoint/ExternalStandards/IEC60904",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2020-12-01", action: "First Receipt", by: "Anil Mehta", notes: "Ed.3 received." },
    ],
  },
  {
    id: "EXT-006",
    title: "Photovoltaic (PV) module energy rating — Part 1: Irradiance and temperature performance measurements",
    standardNumber: "IEC 61853-1",
    edition: "Ed.1",
    year: 2011,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2012-06-01",
    reviewedBy: "Raj Krishnan",
    reviewDate: "2025-06-01",
    nextReviewDate: "2026-06-01",
    distributionList: ["Test Engineer", "Data Analyst", "Lab Manager"],
    locationPhysical: "QMS Cabinet – Shelf B2",
    locationDigital: "SharePoint/ExternalStandards/IEC61853",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2012-06-01", action: "First Receipt", by: "Raj Krishnan", notes: "Original receipt." },
      { date: "2025-06-01", action: "Annual Review", by: "Raj Krishnan", notes: "Confirmed current." },
    ],
  },
  {
    id: "EXT-007",
    title: "Photovoltaic (PV) modules — Retesting, re-certification and type approval extension",
    standardNumber: "IEC 62915",
    edition: "Ed.2",
    year: 2022,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2022-08-10",
    reviewedBy: "Dr. Meera Patel",
    reviewDate: "2025-02-01",
    nextReviewDate: "2026-02-01",
    distributionList: ["Quality Manager", "Lab Manager"],
    locationPhysical: "QMS Cabinet – Shelf A3",
    locationDigital: "SharePoint/ExternalStandards/IEC62915",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2022-08-10", action: "First Receipt", by: "Dr. Meera Patel", notes: "Ed.2 received." },
    ],
  },
  {
    id: "EXT-008",
    title: "Photovoltaic devices — Procedure for correcting solar simulator spectral mismatch errors",
    standardNumber: "IEC 60891",
    edition: "Ed.3",
    year: 2021,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2021-10-01",
    reviewedBy: "Anil Mehta",
    reviewDate: "2025-10-01",
    nextReviewDate: "2026-10-01",
    distributionList: ["Test Engineer"],
    locationPhysical: "QMS Cabinet – Shelf B1",
    locationDigital: "SharePoint/ExternalStandards/IEC60891",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2021-10-01", action: "First Receipt", by: "Anil Mehta", notes: "Ed.3 received." },
    ],
  },
  {
    id: "EXT-009",
    title: "General requirements for the competence of testing and calibration laboratories",
    standardNumber: "ISO/IEC 17025",
    edition: "Ed.3",
    year: 2017,
    amendmentStatus: "No amendments",
    source: "ISO",
    dateReceived: "2018-01-15",
    reviewedBy: "Dr. Meera Patel",
    reviewDate: "2025-01-01",
    nextReviewDate: "2026-01-01",
    distributionList: ["Lab Director", "Quality Manager", "Lab Manager", "All Staff"],
    locationPhysical: "QMS Cabinet – Shelf C1 (Master Copy)",
    locationDigital: "SharePoint/ExternalStandards/ISO17025",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2018-01-15", action: "First Receipt", by: "Dr. Meera Patel", notes: "Ed.3 received. Replaced Ed.2 (2005)." },
      { date: "2025-01-01", action: "Annual Review", by: "Dr. Meera Patel", notes: "Current. ISO CASCO has no active revision." },
    ],
  },
  {
    id: "EXT-010",
    title: "Solar photovoltaic energy systems — Terms, definitions and symbols",
    standardNumber: "IS 14286",
    edition: "Ed.1",
    year: 2019,
    amendmentStatus: "No amendments",
    source: "BIS",
    dateReceived: "2019-09-01",
    reviewedBy: "Priya Sharma",
    reviewDate: "2025-09-01",
    nextReviewDate: "2026-09-01",
    distributionList: ["Lab Manager", "Test Engineer"],
    locationPhysical: "QMS Cabinet – Shelf D1",
    locationDigital: "SharePoint/ExternalStandards/BIS",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2019-09-01", action: "First Receipt", by: "Priya Sharma", notes: "Received from BIS." },
    ],
  },
  {
    id: "EXT-011",
    title: "MNRE Guidelines for Solar PV Testing Laboratories",
    standardNumber: "MNRE/TL/2020/01",
    edition: "Rev.2",
    year: 2020,
    amendmentStatus: "Corrigendum 1 (2022) incorporated",
    source: "MNRE",
    dateReceived: "2020-07-01",
    reviewedBy: "Dr. Meera Patel",
    reviewDate: "2025-07-01",
    nextReviewDate: "2026-07-01",
    distributionList: ["Lab Director", "Quality Manager", "Lab Manager"],
    locationPhysical: "QMS Cabinet – Shelf C2",
    locationDigital: "SharePoint/ExternalStandards/MNRE",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2020-07-01", action: "First Receipt", by: "Dr. Meera Patel", notes: "Rev.2 received." },
      { date: "2022-11-01", action: "Amendment", by: "Dr. Meera Patel", notes: "Corrigendum 1 incorporated." },
    ],
  },
  {
    id: "EXT-012",
    title: "NABL Criteria for Accreditation of Laboratories (Specific Criteria for Testing Labs)",
    standardNumber: "NABL 112",
    edition: "Issue 9",
    year: 2023,
    amendmentStatus: "No amendments",
    source: "NABL",
    dateReceived: "2023-04-01",
    reviewedBy: "Dr. Meera Patel",
    reviewDate: "2025-04-01",
    nextReviewDate: "2026-04-01",
    distributionList: ["Lab Director", "Quality Manager"],
    locationPhysical: "QMS Cabinet – Shelf C3 (NABL File)",
    locationDigital: "SharePoint/ExternalStandards/NABL",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2023-04-01", action: "First Receipt", by: "Dr. Meera Patel", notes: "Issue 9 received. Replaced Issue 8." },
    ],
  },
  {
    id: "EXT-013",
    title: "Test methods for photovoltaic modules — Part 2: Procedures for measuring and reporting short-circuit current",
    standardNumber: "IEC 62788-2",
    edition: "Ed.1",
    year: 2017,
    amendmentStatus: "No amendments",
    source: "IEC",
    dateReceived: "2017-12-01",
    reviewedBy: "Raj Krishnan",
    reviewDate: "2025-03-01",
    nextReviewDate: "2026-03-01",
    distributionList: ["Test Engineer"],
    locationPhysical: "QMS Cabinet – Shelf B3",
    locationDigital: "SharePoint/ExternalStandards/IEC62788",
    status: "Current",
    clause: "8.3",
    changeHistory: [
      { date: "2017-12-01", action: "First Receipt", by: "Raj Krishnan", notes: "Original receipt." },
    ],
  },
  {
    id: "EXT-014",
    title: "Photovoltaic (PV) modules — Design qualification and type approval — Part 1: Test requirements (OLD)",
    standardNumber: "IEC 61215-1",
    edition: "Ed.1",
    year: 2016,
    amendmentStatus: "Superseded",
    source: "IEC",
    dateReceived: "2016-03-01",
    reviewedBy: "Dr. Meera Patel",
    reviewDate: "2021-07-15",
    nextReviewDate: "N/A",
    distributionList: ["Lab Manager", "Test Engineer"],
    locationPhysical: "Archive – Box 1",
    locationDigital: "SharePoint/Archives/IEC61215",
    supersededBy: "IEC 61215-1 Ed.2 (2021)",
    status: "Superseded",
    clause: "8.3",
    changeHistory: [
      { date: "2016-03-01", action: "First Receipt", by: "Dr. Meera Patel", notes: "Original receipt." },
      { date: "2021-07-15", action: "Superseded", by: "Dr. Meera Patel", notes: "Replaced by Ed.2. Archived." },
    ],
  },
];

// ─── Constants ─────────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<DocSource, { bg: string; text: string; border: string }> = {
  IEC:   { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200" },
  ISO:   { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  BIS:   { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200" },
  MNRE:  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200" },
  NABL:  { bg: "bg-teal-100",   text: "text-teal-700",   border: "border-teal-200" },
  ASTM:  { bg: "bg-rose-100",   text: "text-rose-700",   border: "border-rose-200" },
  IEEE:  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
};

const STATUS_CONFIG: Record<DocStatus, { bg: string; text: string; icon: any }> = {
  "Current":      { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle2 },
  "Superseded":   { bg: "bg-gray-200",   text: "text-gray-600",   icon: RefreshCcw },
  "Withdrawn":    { bg: "bg-red-100",    text: "text-red-700",    icon: AlertTriangle },
  "Under Review": { bg: "bg-amber-100",  text: "text-amber-700",  icon: Clock },
};

const SOURCES: DocSource[] = ["IEC", "ISO", "BIS", "MNRE", "NABL", "ASTM", "IEEE"];
const STATUSES: DocStatus[] = ["Current", "Superseded", "Withdrawn", "Under Review"];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: DocSource }) {
  const cfg = SOURCE_COLORS[source] ?? SOURCE_COLORS.IEC;
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-semibold border", cfg.bg, cfg.text, cfg.border)}>
      {source}
    </span>
  );
}

function StatusBadge({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cfg.bg, cfg.text)}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function ChangeHistoryDrawer({ doc, onClose }: { doc: ExternalDocument; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-xl w-full max-w-lg p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm">{doc.standardNumber}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{doc.title}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>Close</Button>
        </div>
        <div className="space-y-3">
          {doc.changeHistory.map((ch, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                {i < doc.changeHistory.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
              </div>
              <div className="pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">{ch.date}</span>
                  <Badge variant="outline" className="text-xs">{ch.action}</Badge>
                  <span className="text-xs text-muted-foreground">by {ch.by}</span>
                </div>
                <p className="text-xs mt-1">{ch.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DistributionMatrix({ docs }: { docs: ExternalDocument[] }) {
  const allPersons = Array.from(new Set(docs.flatMap(d => d.distributionList))).sort();
  const currentDocs = docs.filter(d => d.status === "Current");

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/60">
            <th className="px-3 py-2 text-left min-w-40">Standard</th>
            {allPersons.map(p => (
              <th key={p} className="px-2 py-2 text-center whitespace-nowrap">{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentDocs.map((doc, i) => (
            <tr key={doc.id} className={cn("border-t", i % 2 === 0 ? "" : "bg-muted/10")}>
              <td className="px-3 py-2 font-medium">{doc.standardNumber}</td>
              {allPersons.map(p => (
                <td key={p} className="px-2 py-2 text-center">
                  {doc.distributionList.includes(p)
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" />
                    : <span className="text-gray-200">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewSchedule({ docs }: { docs: ExternalDocument[] }) {
  const today = "2026-03-21";
  const upcoming = docs
    .filter(d => d.status === "Current" && d.nextReviewDate !== "N/A")
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));

  return (
    <div className="space-y-2">
      {upcoming.map(doc => {
        const isOverdue = doc.nextReviewDate < today;
        const isUpcoming = !isOverdue && doc.nextReviewDate <= "2026-06-30";
        return (
          <div key={doc.id}
            className={cn("flex items-center justify-between p-3 rounded-lg border text-sm",
              isOverdue ? "bg-red-50 border-red-200" : isUpcoming ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
            )}>
            <div className="flex items-center gap-3">
              {isOverdue ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
               isUpcoming ? <Clock className="h-4 w-4 text-amber-500" /> :
               <CheckCircle2 className="h-4 w-4 text-green-500" />}
              <div>
                <span className="font-medium text-xs">{doc.standardNumber}</span>
                <span className="text-muted-foreground text-xs ml-2">— {doc.reviewedBy}</span>
              </div>
            </div>
            <div className="text-xs font-mono">
              {isOverdue && <span className="text-red-600 font-semibold">OVERDUE · </span>}
              {isUpcoming && <span className="text-amber-600 font-semibold">DUE SOON · </span>}
              {doc.nextReviewDate}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ExternalDocumentsTab() {
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<ExternalDocument | null>(null);
  const [activeView, setActiveView] = useState<"table" | "distribution" | "schedule">("table");
  const [showAddForm, setShowAddForm] = useState(false);
  const [docs, setDocs] = useState<ExternalDocument[]>(EXTERNAL_DOCUMENTS);

  const years = Array.from(new Set(docs.map(d => d.year))).sort((a, b) => b - a);

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const matchSearch = !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.standardNumber.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase());
      const matchSource = filterSource === "all" || d.source === filterSource;
      const matchStatus = filterStatus === "all" || d.status === filterStatus;
      const matchYear = filterYear === "all" || d.year === Number(filterYear);
      return matchSearch && matchSource && matchStatus && matchYear;
    });
  }, [docs, search, filterSource, filterStatus, filterYear]);

  const stats = useMemo(() => ({
    total: docs.length,
    current: docs.filter(d => d.status === "Current").length,
    superseded: docs.filter(d => d.status === "Superseded").length,
    dueReview: docs.filter(d => d.status === "Current" && d.nextReviewDate <= "2026-06-30" && d.nextReviewDate !== "N/A").length,
  }), [docs]);

  function exportCSV() {
    const headers = ["Doc ID","Standard Number","Title","Edition","Year","Amendment Status","Source","Date Received","Reviewed By","Review Date","Next Review","Status","Location (Digital)","Superseded By"];
    const rows = [headers, ...filtered.map(d => [
      d.id, d.standardNumber, `"${d.title}"`, d.edition, d.year,
      d.amendmentStatus, d.source, d.dateReceived, d.reviewedBy, d.reviewDate,
      d.nextReviewDate, d.status, d.locationDigital, d.supersededBy ?? ""
    ])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `external-documents-master-list-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* ── Clause Reference Banner ── */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <strong>ISO 17025:2017 Clause 8.3 — Control of management system documents of external origin.</strong>
          {" "}The laboratory shall identify documents of external origin and control their distribution.
          Documents shall be reviewed annually. NABL reference: NABL 112 Clause 4.3.
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total External Docs", value: stats.total, color: "text-gray-700", bg: "bg-gray-50", icon: FileText },
          { label: "Current",             value: stats.current, color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
          { label: "Superseded/Archived", value: stats.superseded, color: "text-gray-500", bg: "bg-gray-100", icon: RefreshCcw },
          { label: "Due for Review",      value: stats.dueReview, color: "text-amber-700", bg: "bg-amber-50", icon: Bell },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className={cn("border", bg)}>
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={cn("h-5 w-5", color)} />
              <div>
                <div className={cn("text-xl font-bold", color)}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── View Toggle + Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-md border overflow-hidden text-xs">
          {(["table", "distribution", "schedule"] as const).map(v => (
            <button key={v}
              className={cn("px-3 py-1.5 capitalize border-l first:border-l-0",
                activeView === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
              )}
              onClick={() => setActiveView(v)}>
              {v === "table" ? "Master List" : v === "distribution" ? "Distribution Matrix" : "Review Schedule"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportCSV}>
            <Download className="h-3 w-3" /> Export Master List
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1" onClick={() => setShowAddForm(v => !v)}>
            <Plus className="h-3 w-3" /> Add Document
          </Button>
        </div>
      </div>

      {/* ── Search & Filters (table view) ── */}
      {activeView === "table" && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search by title, standard number, ID…"
              className="pl-8 h-8 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Sources</SelectItem>
              {SOURCES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-8 w-24 text-xs"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Years</SelectItem>
              {years.map(y => <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>)}
            </SelectContent>
          </Select>
          {(search || filterSource !== "all" || filterStatus !== "all" || filterYear !== "all") && (
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1"
              onClick={() => { setSearch(""); setFilterSource("all"); setFilterStatus("all"); setFilterYear("all"); }}>
              <Filter className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* ── Main Content ── */}
      {activeView === "table" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              External Documents Master List
              <Badge variant="outline" className="text-xs ml-1">{filtered.length} records</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Per ISO 17025:2017 Clause 8.3 — All external origin documents are registered, reviewed annually, and distributed as per the distribution matrix.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 text-left">Doc ID</th>
                    <th className="px-3 py-2 text-left">Standard No.</th>
                    <th className="px-3 py-2 text-left min-w-64">Title</th>
                    <th className="px-3 py-2 text-center">Ed./Year</th>
                    <th className="px-3 py-2 text-center">Source</th>
                    <th className="px-3 py-2 text-left">Amendment</th>
                    <th className="px-3 py-2 text-left">Reviewed By</th>
                    <th className="px-3 py-2 text-center">Next Review</th>
                    <th className="px-3 py-2 text-center">Status</th>
                    <th className="px-3 py-2 text-center">History</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc, i) => {
                    const isOverdue = doc.status === "Current" && doc.nextReviewDate < "2026-03-21" && doc.nextReviewDate !== "N/A";
                    return (
                      <tr key={doc.id}
                        className={cn("border-t hover:bg-muted/30 transition-colors",
                          i % 2 === 0 ? "" : "bg-muted/10",
                          doc.status === "Superseded" ? "opacity-60" : ""
                        )}>
                        <td className="px-3 py-2 font-mono text-xs text-blue-700">{doc.id}</td>
                        <td className="px-3 py-2 font-medium whitespace-nowrap">{doc.standardNumber}</td>
                        <td className="px-3 py-2 max-w-xs">
                          <div className="line-clamp-2">{doc.title}</div>
                          {doc.supersededBy && (
                            <div className="text-xs text-muted-foreground mt-0.5">↳ Replaced by: {doc.supersededBy}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center whitespace-nowrap">{doc.edition} / {doc.year}</td>
                        <td className="px-3 py-2 text-center"><SourceBadge source={doc.source} /></td>
                        <td className="px-3 py-2 max-w-40">
                          <span className="line-clamp-2">{doc.amendmentStatus}</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{doc.reviewedBy}</td>
                        <td className={cn("px-3 py-2 text-center font-mono whitespace-nowrap", isOverdue ? "text-red-600 font-semibold" : "")}>
                          {isOverdue && "⚠ "}{doc.nextReviewDate}
                        </td>
                        <td className="px-3 py-2 text-center"><StatusBadge status={doc.status} /></td>
                        <td className="px-3 py-2 text-center">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                            onClick={() => setSelectedDoc(doc)}>
                            <Clock className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">No documents match the current filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Location reference */}
            <div className="mt-3 text-xs text-muted-foreground">
              Physical location: QMS Cabinet (Master Copies). Digital: SharePoint &gt; ExternalStandards.
              Distribution controlled per QP-8.3-01. Annual review per ISO 17025 Clause 8.3 and NABL 112.
            </div>
          </CardContent>
        </Card>
      )}

      {activeView === "distribution" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Distribution Matrix — Current Standards
            </CardTitle>
            <CardDescription className="text-xs">
              Shows which roles/persons have received controlled copies of each current external standard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DistributionMatrix docs={docs} />
          </CardContent>
        </Card>
      )}

      {activeView === "schedule" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-500" />
              Annual Review Schedule — ISO 17025 Clause 8.3
            </CardTitle>
            <CardDescription className="text-xs">
              All external documents must be reviewed at minimum annually. Overdue reviews are flagged in red.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewSchedule docs={docs} />
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800 space-y-1">
                  <p><strong>NABL Guidelines Reference:</strong> NABL 112, Issue 9 (2023) — Specific Criteria for Testing Laboratories, Clause 4.3: Control of documents of external origin.</p>
                  <p>Procedure reference: <strong>QP-8.3-01</strong> — Procedure for Control of External Documents. Form: <strong>QSF-8.3-01</strong> — External Document Register.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Change History Drawer ── */}
      {selectedDoc && <ChangeHistoryDrawer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
    </div>
  );
}
