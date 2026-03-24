// @ts-nocheck
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck, AlertTriangle, CheckCircle2, Calendar, FileText,
  Search, X, ChevronDown,
} from "lucide-react";

// ── Types ──
type FindingCategory = "Conformity" | "Minor NC" | "Major NC" | "Observation" | "OFI";
type NCSource = "Internal" | "NABL" | "BIS" | "IECEE" | "Intertek" | "TUV" | "UL";
type NCStatus = "Open" | "In Progress" | "Closed" | "Verified";
type AuditStatus = "Planned" | "In Progress" | "Completed";

// ── Internal Audit Checklist Data ──
const ISO_CLAUSES = [
  { clause: "4.1", title: "Impartiality", findings: "Conformity" as FindingCategory },
  { clause: "4.2", title: "Confidentiality", findings: "Conformity" as FindingCategory },
  { clause: "5.1", title: "Legal Entity", findings: "Conformity" as FindingCategory },
  { clause: "5.2", title: "Management Commitment", findings: "Observation" as FindingCategory },
  { clause: "5.3", title: "Safeguarding Impartiality", findings: "Conformity" as FindingCategory },
  { clause: "5.5", title: "Organizational Structure", findings: "Conformity" as FindingCategory },
  { clause: "5.6", title: "Confidentiality of Information", findings: "Conformity" as FindingCategory },
  { clause: "6.1", title: "General Resources", findings: "Conformity" as FindingCategory },
  { clause: "6.2", title: "Personnel Competence", findings: "Minor NC" as FindingCategory },
  { clause: "6.3", title: "Facilities & Conditions", findings: "OFI" as FindingCategory },
  { clause: "6.4", title: "Equipment", findings: "Minor NC" as FindingCategory },
  { clause: "6.5", title: "Metrological Traceability", findings: "Conformity" as FindingCategory },
  { clause: "6.6", title: "Externally Provided Products", findings: "Conformity" as FindingCategory },
  { clause: "7.1", title: "Review of Requests", findings: "Conformity" as FindingCategory },
  { clause: "7.2", title: "Selection, Verification & Validation", findings: "Conformity" as FindingCategory },
  { clause: "7.3", title: "Sampling", findings: "Observation" as FindingCategory },
  { clause: "7.4", title: "Handling of Test Items", findings: "Conformity" as FindingCategory },
  { clause: "7.5", title: "Technical Records", findings: "Conformity" as FindingCategory },
  { clause: "7.6", title: "Measurement Uncertainty", findings: "Major NC" as FindingCategory },
  { clause: "7.7", title: "Validity of Results", findings: "OFI" as FindingCategory },
  { clause: "7.8", title: "Reporting of Results", findings: "Conformity" as FindingCategory },
  { clause: "8.1", title: "Options - General", findings: "Conformity" as FindingCategory },
  { clause: "8.2", title: "Management System Documentation", findings: "Conformity" as FindingCategory },
  { clause: "8.3", title: "Control of Management System Documents", findings: "Conformity" as FindingCategory },
  { clause: "8.4", title: "Control of Records", findings: "Conformity" as FindingCategory },
  { clause: "8.5", title: "Actions to Address Risks", findings: "Conformity" as FindingCategory },
  { clause: "8.6", title: "Improvement", findings: "Conformity" as FindingCategory },
  { clause: "8.7", title: "Corrective Actions", findings: "Minor NC" as FindingCategory },
  { clause: "8.8", title: "Internal Audits", findings: "Conformity" as FindingCategory },
  { clause: "8.9", title: "Management Reviews", findings: "Observation" as FindingCategory },
];

const AUDIT_PLAN = {
  id: "IA-2026-001", title: "ISO 17025:2017 Annual Internal Audit", standard: "ISO/IEC 17025:2017",
  auditor: "Dr. Priya Mehta", coAuditor: "Rahul Singh", department: "Solar PV Testing Lab",
  plannedDate: "2026-03-15", completedDate: "2026-03-22", status: "Completed" as AuditStatus,
  scope: "All clauses 4.1 - 8.9 covering LIMS, equipment, personnel, test methods",
};

const findingColors: Record<FindingCategory, string> = {
  Conformity: "bg-emerald-900/60 text-emerald-400",
  "Minor NC": "bg-amber-900/60 text-amber-400",
  "Major NC": "bg-red-900/60 text-red-400",
  Observation: "bg-blue-900/60 text-blue-400",
  OFI: "bg-purple-900/60 text-purple-400",
};

// ── NC Register Data ──
interface NCRecord {
  ncNo: string; source: NCSource; auditDate: string; clauseRef: string;
  description: string; category: FindingCategory; rootCause: string;
  correctiveAction: string; dueDate: string; responsible: string;
  status: NCStatus; effectivenessCheck: string;
}

const NC_REGISTER: NCRecord[] = [
  { ncNo: "NC-2026-001", source: "Internal", auditDate: "2026-03-22", clauseRef: "6.2", description: "Two technicians missing updated competency records for IEC 61215 Ed.2", category: "Minor NC", rootCause: "Training schedule not updated after standard revision", correctiveAction: "Schedule retraining and update competency matrix", dueDate: "2026-04-15", responsible: "A. Kumar", status: "In Progress", effectivenessCheck: "Verify updated records by 2026-05-01" },
  { ncNo: "NC-2026-002", source: "Internal", auditDate: "2026-03-22", clauseRef: "6.4", description: "Solar simulator reference cell calibration expired 2026-03-01", category: "Minor NC", rootCause: "Calibration reminder system failed for this item", correctiveAction: "Recalibrate and fix automated reminder", dueDate: "2026-04-01", responsible: "S. Reddy", status: "Closed", effectivenessCheck: "Confirmed recalibration cert received" },
  { ncNo: "NC-2026-003", source: "Internal", auditDate: "2026-03-22", clauseRef: "7.6", description: "Measurement uncertainty budget for EL imaging not including lens distortion component", category: "Major NC", rootCause: "Uncertainty budget template missing imaging-specific components", correctiveAction: "Revise uncertainty budget to include lens distortion, update template", dueDate: "2026-04-10", responsible: "Dr. P. Mehta", status: "Open", effectivenessCheck: "Review revised budget and verify calculation" },
  { ncNo: "NC-2026-004", source: "Internal", auditDate: "2026-03-22", clauseRef: "8.7", description: "3 CAPA records missing effectiveness verification evidence", category: "Minor NC", rootCause: "No follow-up process after CAPA implementation", correctiveAction: "Implement CAPA effectiveness verification checklist", dueDate: "2026-04-20", responsible: "R. Singh", status: "Open", effectivenessCheck: "Check all open CAPAs have verification dates" },
  { ncNo: "NC-2025-018", source: "NABL", auditDate: "2025-11-05", clauseRef: "6.4.1", description: "Environmental datalogger calibration expired during witness audit", category: "Minor NC", rootCause: "Manual calibration tracking missed renewal date", correctiveAction: "Recalibrate and implement automated 30-day reminder", dueDate: "2025-12-05", responsible: "A. Sharma", status: "Verified", effectivenessCheck: "Verified - automated reminders working since Dec 2025" },
  { ncNo: "NC-2025-019", source: "NABL", auditDate: "2025-11-05", clauseRef: "7.8.2", description: "Test report template missing uncertainty statement for energy yield", category: "Minor NC", rootCause: "Template not updated for IEC 61853 requirements", correctiveAction: "Update report template with uncertainty statement section", dueDate: "2026-01-15", responsible: "R. Singh", status: "Verified", effectivenessCheck: "Verified - template v4 includes uncertainty statement" },
  { ncNo: "NC-2025-012", source: "BIS", auditDate: "2025-09-20", clauseRef: "7.2", description: "Test method validation records incomplete for new bifacial module test", category: "Major NC", rootCause: "Validation protocol not finalized before accepting test samples", correctiveAction: "Complete validation protocol, retrain staff on acceptance criteria", dueDate: "2025-10-31", responsible: "Dr. P. Mehta", status: "Closed", effectivenessCheck: "Validation records complete, process gate added" },
  { ncNo: "NC-2025-010", source: "TUV", auditDate: "2025-07-15", clauseRef: "6.3", description: "Lab temperature excursion not documented during IEC 61215 TC test", category: "Minor NC", rootCause: "Environmental monitoring alert sent but not formally recorded", correctiveAction: "Implement auto-logging of all env excursions into LIMS", dueDate: "2025-08-30", responsible: "M. Patel", status: "Verified", effectivenessCheck: "Auto-logging verified with 3 months data" },
];

const ncStatusColors: Record<NCStatus, string> = {
  Open: "bg-red-900/60 text-red-400",
  "In Progress": "bg-amber-900/60 text-amber-400",
  Closed: "bg-blue-900/60 text-blue-400",
  Verified: "bg-emerald-900/60 text-emerald-400",
};

// ── Audit Schedule Data ──
interface ScheduleEntry {
  id: string; month: string; type: string; scope: string; auditor: string;
  planned: string; actual: string; status: AuditStatus;
}

const AUDIT_SCHEDULE: ScheduleEntry[] = [
  { id: "AS-01", month: "Jan 2026", type: "Internal", scope: "Clauses 4-5 (Structural)", auditor: "Dr. P. Mehta", planned: "2026-01-20", actual: "2026-01-22", status: "Completed" },
  { id: "AS-02", month: "Mar 2026", type: "Internal", scope: "Clauses 6-7 (Resource & Process)", auditor: "Dr. P. Mehta", planned: "2026-03-15", actual: "2026-03-22", status: "Completed" },
  { id: "AS-03", month: "Apr 2026", type: "NABL Witness", scope: "IEC 61215 DH/TC/HF", auditor: "NABL Assessor", planned: "2026-04-15", actual: "—", status: "Planned" },
  { id: "AS-04", month: "May 2026", type: "IAS Witness", scope: "IEC 61730 Safety", auditor: "IAS Assessor", planned: "2026-05-20", actual: "—", status: "Planned" },
  { id: "AS-05", month: "Jun 2026", type: "Internal", scope: "Clauses 8 (Management System)", auditor: "R. Singh", planned: "2026-06-10", actual: "—", status: "Planned" },
  { id: "AS-06", month: "Jul 2026", type: "BIS Surveillance", scope: "IS 14286 / IEC 61215", auditor: "BIS Assessor", planned: "2026-07-15", actual: "—", status: "Planned" },
  { id: "AS-07", month: "Sep 2026", type: "Internal", scope: "Full scope (Clauses 4-8)", auditor: "Dr. P. Mehta", planned: "2026-09-15", actual: "—", status: "Planned" },
  { id: "AS-08", month: "Nov 2026", type: "NABL Surveillance", scope: "IEC 60904 STC", auditor: "NABL Assessor", planned: "2026-11-10", actual: "—", status: "Planned" },
];

// ── Audit Reports Data ──
interface AuditReport {
  id: string; title: string; date: string; auditor: string;
  conformities: number; minorNCs: number; majorNCs: number; observations: number; ofis: number;
  status: "Draft" | "Reviewed" | "Approved";
}

const AUDIT_REPORTS: AuditReport[] = [
  { id: "RPT-IA-2026-002", title: "Internal Audit - Resource & Process Requirements", date: "2026-03-25", auditor: "Dr. P. Mehta", conformities: 22, minorNCs: 3, majorNCs: 1, observations: 3, ofis: 2, status: "Reviewed" },
  { id: "RPT-IA-2026-001", title: "Internal Audit - Structural Requirements", date: "2026-01-25", auditor: "Dr. P. Mehta", conformities: 8, minorNCs: 0, majorNCs: 0, observations: 1, ofis: 1, status: "Approved" },
  { id: "RPT-WA-2025-001", title: "NABL Witness Audit - IEC 61853 Energy Rating", date: "2025-11-10", auditor: "Dr. M. Gupta (NABL)", conformities: 5, minorNCs: 2, majorNCs: 0, observations: 2, ofis: 1, status: "Approved" },
  { id: "RPT-EA-2025-002", title: "BIS Surveillance Audit", date: "2025-09-25", auditor: "BIS Assessor", conformities: 12, minorNCs: 1, majorNCs: 1, observations: 0, ofis: 0, status: "Approved" },
  { id: "RPT-EA-2025-001", title: "TUV Witness Audit - Environmental Tests", date: "2025-07-20", auditor: "TUV Assessor", conformities: 10, minorNCs: 1, majorNCs: 0, observations: 1, ofis: 0, status: "Approved" },
];

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("checklist");
  const [ncFilter, setNcFilter] = useState<string>("All");

  const findingSummary = ISO_CLAUSES.reduce((acc, c) => {
    acc[c.findings] = (acc[c.findings] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredNCs = ncFilter === "All" ? NC_REGISTER : NC_REGISTER.filter((nc) => nc.source === ncFilter || nc.status === ncFilter);
  const openNCs = NC_REGISTER.filter((nc) => nc.status === "Open" || nc.status === "In Progress").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Management</h1>
          <p className="text-sm text-gray-400 mt-1">ISO 17025 internal & external audit tracking</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-red-900/40 text-red-400">{openNCs} Open NCs</span>
          <span className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-400">{NC_REGISTER.filter((nc) => nc.status === "Verified").length} Verified</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="checklist">Internal Audit Checklist</TabsTrigger>
          <TabsTrigger value="nc-register">NC Register</TabsTrigger>
          <TabsTrigger value="schedule">Audit Schedule</TabsTrigger>
          <TabsTrigger value="reports">Audit Reports</TabsTrigger>
        </TabsList>

        {/* TAB 1: Internal Audit Checklist */}
        <TabsContent value="checklist" className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
              <div><span className="text-gray-500 block">Audit ID</span><span className="text-orange-400 font-mono">{AUDIT_PLAN.id}</span></div>
              <div><span className="text-gray-500 block">Lead Auditor</span><span className="text-gray-300">{AUDIT_PLAN.auditor}</span></div>
              <div><span className="text-gray-500 block">Date</span><span className="text-gray-300">{AUDIT_PLAN.completedDate}</span></div>
              <div><span className="text-gray-500 block">Status</span><span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-400 text-xs">{AUDIT_PLAN.status}</span></div>
            </div>
            <p className="text-xs text-gray-500 mb-1">Scope: {AUDIT_PLAN.scope}</p>
          </div>
          <div className="flex gap-2 text-xs">
            {Object.entries(findingSummary).map(([cat, count]) => (
              <span key={cat} className={cn("px-2 py-1 rounded", findingColors[cat as FindingCategory])}>
                {cat}: {count}
              </span>
            ))}
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left w-20">Clause</th>
                <th className="px-4 py-3 text-left">Requirement</th>
                <th className="px-4 py-3 text-center w-32">Finding</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-800/50">
                {ISO_CLAUSES.map((c) => (
                  <tr key={c.clause} className="hover:bg-gray-900/50">
                    <td className="px-4 py-2 font-mono text-orange-400 text-xs">{c.clause}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">{c.title}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", findingColors[c.findings])}>{c.findings}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 2: NC Register */}
        <TabsContent value="nc-register" className="space-y-4">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-gray-500">Filter:</span>
            {["All", "Internal", "NABL", "BIS", "TUV", "Open", "Closed", "Verified"].map((f) => (
              <button key={f} onClick={() => setNcFilter(f)} className={cn("px-2 py-1 rounded text-xs transition-colors", ncFilter === f ? "bg-orange-500/20 text-orange-400" : "bg-gray-800 text-gray-400 hover:text-white")}>{f}</button>
            ))}
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-900/80 text-gray-400 uppercase tracking-wider">
                  <th className="px-3 py-3 text-left">NC#</th><th className="px-3 py-3 text-left">Source</th>
                  <th className="px-3 py-3 text-left">Audit Date</th><th className="px-3 py-3 text-left">Clause</th>
                  <th className="px-3 py-3 text-left">Description</th><th className="px-3 py-3 text-center">Category</th>
                  <th className="px-3 py-3 text-left">Corrective Action</th><th className="px-3 py-3 text-left">Due</th>
                  <th className="px-3 py-3 text-left">Responsible</th><th className="px-3 py-3 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredNCs.map((nc) => (
                    <tr key={nc.ncNo} className="hover:bg-gray-900/50">
                      <td className="px-3 py-2 font-mono text-orange-400">{nc.ncNo}</td>
                      <td className="px-3 py-2 text-gray-300">{nc.source}</td>
                      <td className="px-3 py-2 text-gray-400">{nc.auditDate}</td>
                      <td className="px-3 py-2 font-mono text-gray-300">{nc.clauseRef}</td>
                      <td className="px-3 py-2 text-gray-300 max-w-[200px] truncate">{nc.description}</td>
                      <td className="px-3 py-2 text-center"><span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", findingColors[nc.category])}>{nc.category}</span></td>
                      <td className="px-3 py-2 text-gray-400 max-w-[180px] truncate">{nc.correctiveAction}</td>
                      <td className="px-3 py-2 text-gray-400">{nc.dueDate}</td>
                      <td className="px-3 py-2 text-gray-300">{nc.responsible}</td>
                      <td className="px-3 py-2 text-center"><span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", ncStatusColors[nc.status])}>{nc.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Audit Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-900/80 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Scope</th><th className="px-4 py-3 text-left">Auditor</th>
                <th className="px-4 py-3 text-left">Planned</th><th className="px-4 py-3 text-left">Actual</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-800/50">
                {AUDIT_SCHEDULE.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-900/50">
                    <td className="px-4 py-2 text-white text-xs font-medium">{s.month}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">{s.type}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{s.scope}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">{s.auditor}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{s.planned}</td>
                    <td className="px-4 py-2 text-xs">{s.actual === "—" ? <span className="text-gray-600">—</span> : <span className="text-gray-300">{s.actual}</span>}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium",
                        s.status === "Completed" ? "bg-emerald-900/60 text-emerald-400" :
                        s.status === "In Progress" ? "bg-amber-900/60 text-amber-400" :
                        "bg-blue-900/60 text-blue-400"
                      )}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Annual Calendar Visual */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">2026 Audit Calendar</h3>
            <div className="grid grid-cols-12 gap-1">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => {
                const auditsInMonth = AUDIT_SCHEDULE.filter((s) => s.month.startsWith(m));
                const hasCompleted = auditsInMonth.some((a) => a.status === "Completed");
                const hasPlanned = auditsInMonth.some((a) => a.status === "Planned");
                return (
                  <div key={m} className={cn("rounded-lg p-2 text-center border", hasCompleted ? "border-emerald-700 bg-emerald-950/30" : hasPlanned ? "border-blue-700 bg-blue-950/30" : "border-gray-800 bg-gray-900/40")}>
                    <span className="text-[10px] text-gray-400 block">{m}</span>
                    {auditsInMonth.length > 0 ? (
                      <span className={cn("text-xs font-bold", hasCompleted ? "text-emerald-400" : "text-blue-400")}>{auditsInMonth.length}</span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: Audit Reports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-3">
            {AUDIT_REPORTS.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-orange-400" />
                    <span className="font-mono text-orange-400 text-xs">{r.id}</span>
                    <span className="text-white text-sm font-medium">{r.title}</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium",
                    r.status === "Approved" ? "bg-emerald-900/60 text-emerald-400" :
                    r.status === "Reviewed" ? "bg-blue-900/60 text-blue-400" :
                    "bg-gray-700 text-gray-300"
                  )}>{r.status}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                  <div><span className="text-gray-500 block">Date</span><span className="text-gray-300">{r.date}</span></div>
                  <div><span className="text-gray-500 block">Auditor</span><span className="text-gray-300">{r.auditor}</span></div>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-400">{r.conformities} Conformities</span>
                  {r.minorNCs > 0 && <span className="px-2 py-0.5 rounded bg-amber-900/40 text-amber-400">{r.minorNCs} Minor NC</span>}
                  {r.majorNCs > 0 && <span className="px-2 py-0.5 rounded bg-red-900/40 text-red-400">{r.majorNCs} Major NC</span>}
                  {r.observations > 0 && <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-400">{r.observations} Observations</span>}
                  {r.ofis > 0 && <span className="px-2 py-0.5 rounded bg-purple-900/40 text-purple-400">{r.ofis} OFI</span>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
