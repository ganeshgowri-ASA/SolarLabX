// @ts-nocheck
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ClipboardCheck, FileText, Users, AlertTriangle, Calendar, BarChart3,
  Download, FileDown, Paperclip, Camera, ChevronDown,
} from "lucide-react";

// ── Types ──
type FindingCategory = "Conformity" | "Minor NC" | "Major NC" | "Observation" | "OFI";
type Compliance = "Comply" | "Not Comply" | "Not Applicable";
type NCSource = "Internal" | "NABL" | "BIS" | "IECEE" | "Intertek" | "TUV" | "UL" | "Bureau Veritas";
type NCStatus = "Open" | "In Progress" | "Closed" | "Verified";
type AuditStatus = "Planned" | "In Progress" | "Completed";

// ── ISO 17025 Clauses with Sub-clauses ──
const ISO_CLAUSES: { clause: string; title: string; compliance: Compliance; finding: FindingCategory; observation: string }[] = [
  { clause: "4.1.1", title: "Impartiality — General commitment", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "4.1.2", title: "Impartiality — Management commitment to impartiality", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "4.1.3", title: "Impartiality — Identification of risks", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "4.1.4", title: "Impartiality — Pressure elimination/minimization", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "4.2.1", title: "Confidentiality — Legally enforceable commitments", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "4.2.2", title: "Confidentiality — Informing customers in advance", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "5.1", title: "Legal Entity", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "5.2.1", title: "Management Commitment — Quality policy", compliance: "Not Comply", finding: "Observation", observation: "Policy review overdue" },
  { clause: "5.3", title: "Safeguarding Impartiality", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "5.5", title: "Organizational Structure", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "5.6", title: "Confidentiality of Information", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.1", title: "General Resources", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.2.1", title: "Personnel — General competence requirements", compliance: "Not Comply", finding: "Minor NC", observation: "2 technicians missing IEC 61215 Ed.2 records" },
  { clause: "6.2.2", title: "Personnel — Competence requirements", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.2.3", title: "Personnel — Training and awareness", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.3.1", title: "Facilities — General suitability", compliance: "Comply", finding: "OFI", observation: "Consider additional ESD protection" },
  { clause: "6.3.2", title: "Facilities — Environmental conditions control", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.4.1", title: "Equipment — General availability", compliance: "Not Comply", finding: "Minor NC", observation: "Reference cell calibration expired" },
  { clause: "6.4.2", title: "Equipment — Calibration/verification", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.5.1", title: "Metrological Traceability — General", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.5.2", title: "Metrological Traceability — Calibration", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "6.6", title: "Externally Provided Products & Services", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.1.1", title: "Review of Requests — Procedures", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.2.1", title: "Selection, Verification & Validation of Methods", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.2.2", title: "Validation of Methods", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.3", title: "Sampling", compliance: "Comply", finding: "Observation", observation: "Sampling plan needs update for bifacial" },
  { clause: "7.4", title: "Handling of Test Items", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.5", title: "Technical Records", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.6.1", title: "Measurement Uncertainty — General evaluation", compliance: "Not Comply", finding: "Major NC", observation: "EL imaging uncertainty missing lens distortion" },
  { clause: "7.6.2", title: "Measurement Uncertainty — Evaluation", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.7.1", title: "Validity of Results — Monitoring", compliance: "Comply", finding: "OFI", observation: "Consider adding ILC for EL imaging" },
  { clause: "7.7.2", title: "Validity of Results — Interlaboratory comparisons", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.8.1", title: "Reporting — General requirements", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "7.8.2", title: "Reporting — Test/calibration reports", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.1", title: "Management System — Options", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.2", title: "Management System Documentation", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.3", title: "Control of Management System Documents", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.4", title: "Control of Records", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.5", title: "Actions to Address Risks & Opportunities", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.6", title: "Improvement", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.7.1", title: "Corrective Actions — Response to NCs", compliance: "Not Comply", finding: "Minor NC", observation: "3 CAPAs missing effectiveness verification" },
  { clause: "8.7.2", title: "Corrective Actions — Root cause analysis", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.8", title: "Internal Audits", compliance: "Comply", finding: "Conformity", observation: "" },
  { clause: "8.9", title: "Management Reviews", compliance: "Comply", finding: "Observation", observation: "MR frequency to be increased" },
];

const findingColors: Record<FindingCategory, string> = {
  Conformity: "bg-emerald-900/60 text-emerald-400", "Minor NC": "bg-amber-900/60 text-amber-400",
  "Major NC": "bg-red-900/60 text-red-400", Observation: "bg-blue-900/60 text-blue-400", OFI: "bg-purple-900/60 text-purple-400",
};
const complianceColors: Record<Compliance, string> = {
  Comply: "text-emerald-400", "Not Comply": "text-red-400", "Not Applicable": "text-gray-500",
};

// ── Auditor Registry ──
const AUDITORS = [
  { name: "Dr. Priya Mehta", empId: "EMP-101", dept: "Quality", qualification: "Ph.D. Materials Sci.", training: "ISO 19011 Lead Auditor", trainingDate: "2024-06-15", certNo: "LA-2024-0451", depts: ["Testing", "Calibration", "QMS"], audits: 24, leadEligible: true, status: "Active" as const },
  { name: "Rahul Singh", empId: "EMP-205", dept: "Quality", qualification: "M.Tech Solar Energy", training: "ISO 17025 Internal Auditor", trainingDate: "2025-01-20", certNo: "IA-2025-0189", depts: ["Testing", "Procurement"], audits: 8, leadEligible: false, status: "Active" as const },
  { name: "Anil Kumar", empId: "EMP-118", dept: "Testing", qualification: "B.E. Electrical", training: "ISO 17025 Internal Auditor", trainingDate: "2024-09-10", certNo: "IA-2024-0672", depts: ["Quality", "Calibration"], audits: 5, leadEligible: false, status: "Active" as const },
  { name: "Dr. Meera Shah", empId: "EMP-089", dept: "Calibration", qualification: "Ph.D. Metrology", training: "ISO 19011 Lead Auditor", trainingDate: "2023-11-05", certNo: "LA-2023-0298", depts: ["Testing", "Quality", "Procurement"], audits: 18, leadEligible: true, status: "Active" as const },
  { name: "Suresh Reddy", empId: "EMP-142", dept: "Testing", qualification: "M.Sc. Physics", training: "ISO 17025 Internal Auditor", trainingDate: "2025-03-12", certNo: "IA-2025-0301", depts: ["Quality"], audits: 3, leadEligible: false, status: "Inactive" as const },
];

// ── NC Register Data ──
const NC_REGISTER: { ncNo: string; source: NCSource; auditDate: string; clauseRef: string; description: string; category: FindingCategory; rootCause: string; correctiveAction: string; dueDate: string; responsible: string; status: NCStatus; effectiveness: string }[] = [
  { ncNo: "NC-2026-001", source: "Internal", auditDate: "2026-03-22", clauseRef: "6.2.1", description: "Two technicians missing updated competency records for IEC 61215 Ed.2", category: "Minor NC", rootCause: "Training schedule not updated after standard revision", correctiveAction: "Schedule retraining and update competency matrix", dueDate: "2026-04-15", responsible: "A. Kumar", status: "In Progress", effectiveness: "Verify updated records by 2026-05-01" },
  { ncNo: "NC-2026-002", source: "Internal", auditDate: "2026-03-22", clauseRef: "6.4.1", description: "Solar simulator reference cell calibration expired 2026-03-01", category: "Minor NC", rootCause: "Calibration reminder system failed", correctiveAction: "Recalibrate and fix automated reminder", dueDate: "2026-04-01", responsible: "S. Reddy", status: "Closed", effectiveness: "Confirmed recalibration cert received" },
  { ncNo: "NC-2026-003", source: "Internal", auditDate: "2026-03-22", clauseRef: "7.6.1", description: "Measurement uncertainty budget for EL imaging not including lens distortion component", category: "Major NC", rootCause: "Uncertainty budget template missing imaging-specific components", correctiveAction: "Revise uncertainty budget, update template", dueDate: "2026-04-10", responsible: "Dr. P. Mehta", status: "Open", effectiveness: "Review revised budget" },
  { ncNo: "NC-2026-004", source: "Internal", auditDate: "2026-03-22", clauseRef: "8.7.1", description: "3 CAPA records missing effectiveness verification evidence", category: "Minor NC", rootCause: "No follow-up process after CAPA implementation", correctiveAction: "Implement CAPA effectiveness verification checklist", dueDate: "2026-04-20", responsible: "R. Singh", status: "Open", effectiveness: "Check all open CAPAs" },
  { ncNo: "NC-2025-018", source: "NABL", auditDate: "2025-11-05", clauseRef: "6.4.1", description: "Environmental datalogger calibration expired during witness audit", category: "Minor NC", rootCause: "Manual tracking missed renewal date", correctiveAction: "Recalibrate and implement 30-day reminder", dueDate: "2025-12-05", responsible: "A. Sharma", status: "Verified", effectiveness: "Automated reminders working since Dec 2025" },
  { ncNo: "NC-2025-019", source: "NABL", auditDate: "2025-11-05", clauseRef: "7.8.2", description: "Test report template missing uncertainty statement for energy yield", category: "Minor NC", rootCause: "Template not updated for IEC 61853", correctiveAction: "Update report template", dueDate: "2026-01-15", responsible: "R. Singh", status: "Verified", effectiveness: "Template v4 includes uncertainty statement" },
  { ncNo: "NC-2025-012", source: "BIS", auditDate: "2025-09-20", clauseRef: "7.2.1", description: "Test method validation records incomplete for bifacial module test", category: "Major NC", rootCause: "Validation protocol not finalized before accepting samples", correctiveAction: "Complete validation protocol, retrain staff", dueDate: "2025-10-31", responsible: "Dr. P. Mehta", status: "Closed", effectiveness: "Validation records complete" },
  { ncNo: "NC-2025-010", source: "TUV", auditDate: "2025-07-15", clauseRef: "6.3.1", description: "Lab temperature excursion not documented during IEC 61215 TC test", category: "Minor NC", rootCause: "Environmental monitoring alert not formally recorded", correctiveAction: "Implement auto-logging of env excursions", dueDate: "2025-08-30", responsible: "M. Patel", status: "Verified", effectiveness: "Auto-logging verified with 3 months data" },
];

const ncStatusColors: Record<NCStatus, string> = {
  Open: "bg-red-900/60 text-red-400", "In Progress": "bg-amber-900/60 text-amber-400",
  Closed: "bg-blue-900/60 text-blue-400", Verified: "bg-emerald-900/60 text-emerald-400",
};

// ── Historical NC summary per clause group ──
const CLAUSE_HISTORY: { clause: string; title: string; total: number; internal: number; nabl: number; bis: number; other: number; trend: "↑" | "↓" | "→"; lastDate: string }[] = [
  { clause: "4.1", title: "Impartiality", total: 1, internal: 1, nabl: 0, bis: 0, other: 0, trend: "→", lastDate: "2024-03-10" },
  { clause: "4.2", title: "Confidentiality", total: 0, internal: 0, nabl: 0, bis: 0, other: 0, trend: "→", lastDate: "—" },
  { clause: "5.2", title: "Management Commitment", total: 2, internal: 2, nabl: 0, bis: 0, other: 0, trend: "↓", lastDate: "2025-01-22" },
  { clause: "6.2", title: "Personnel Competence", total: 5, internal: 3, nabl: 1, bis: 1, other: 0, trend: "↑", lastDate: "2026-03-22" },
  { clause: "6.3", title: "Facilities & Conditions", total: 3, internal: 1, nabl: 0, bis: 0, other: 2, trend: "↓", lastDate: "2025-07-15" },
  { clause: "6.4", title: "Equipment", total: 6, internal: 2, nabl: 2, bis: 1, other: 1, trend: "↑", lastDate: "2026-03-22" },
  { clause: "6.5", title: "Metrological Traceability", total: 2, internal: 1, nabl: 1, bis: 0, other: 0, trend: "→", lastDate: "2025-06-10" },
  { clause: "7.2", title: "Method Validation", total: 3, internal: 1, nabl: 0, bis: 2, other: 0, trend: "↓", lastDate: "2025-09-20" },
  { clause: "7.6", title: "Measurement Uncertainty", total: 4, internal: 2, nabl: 1, bis: 0, other: 1, trend: "↑", lastDate: "2026-03-22" },
  { clause: "7.8", title: "Reporting of Results", total: 2, internal: 0, nabl: 2, bis: 0, other: 0, trend: "↓", lastDate: "2025-11-05" },
  { clause: "8.7", title: "Corrective Actions", total: 4, internal: 3, nabl: 1, bis: 0, other: 0, trend: "↑", lastDate: "2026-03-22" },
];

// ── Audit Schedule ──
const AUDIT_SCHEDULE = [
  { id: "AS-01", month: "Jan 2026", type: "Internal", scope: "Clauses 4-5 (Structural)", auditor: "Dr. P. Mehta", planned: "2026-01-20", actual: "2026-01-22", status: "Completed" as AuditStatus },
  { id: "AS-02", month: "Mar 2026", type: "Internal", scope: "Clauses 6-7 (Resource & Process)", auditor: "Dr. P. Mehta", planned: "2026-03-15", actual: "2026-03-22", status: "Completed" as AuditStatus },
  { id: "AS-03", month: "Apr 2026", type: "NABL Witness", scope: "IEC 61215 DH/TC/HF", auditor: "NABL Assessor", planned: "2026-04-15", actual: "—", status: "Planned" as AuditStatus },
  { id: "AS-04", month: "May 2026", type: "IAS Witness", scope: "IEC 61730 Safety", auditor: "IAS Assessor", planned: "2026-05-20", actual: "—", status: "Planned" as AuditStatus },
  { id: "AS-05", month: "Jun 2026", type: "Internal", scope: "Clauses 8 (Management System)", auditor: "R. Singh", planned: "2026-06-10", actual: "—", status: "Planned" as AuditStatus },
  { id: "AS-06", month: "Jul 2026", type: "BIS Surveillance", scope: "IS 14286 / IEC 61215", auditor: "BIS Assessor", planned: "2026-07-15", actual: "—", status: "Planned" as AuditStatus },
  { id: "AS-07", month: "Sep 2026", type: "Internal", scope: "Full scope (Clauses 4-8)", auditor: "Dr. P. Mehta", planned: "2026-09-15", actual: "—", status: "Planned" as AuditStatus },
  { id: "AS-08", month: "Nov 2026", type: "NABL Surveillance", scope: "IEC 60904 STC", auditor: "NABL Assessor", planned: "2026-11-10", actual: "—", status: "Planned" as AuditStatus },
];

// ── Audit Reports ──
const AUDIT_REPORTS = [
  { id: "RPT-IA-2026-002", title: "Internal Audit - Resource & Process Requirements", date: "2026-03-25", auditor: "Dr. P. Mehta", conformities: 22, minorNCs: 3, majorNCs: 1, observations: 3, ofis: 2, status: "Reviewed" as const },
  { id: "RPT-IA-2026-001", title: "Internal Audit - Structural Requirements", date: "2026-01-25", auditor: "Dr. P. Mehta", conformities: 8, minorNCs: 0, majorNCs: 0, observations: 1, ofis: 1, status: "Approved" as const },
  { id: "RPT-WA-2025-001", title: "NABL Witness Audit - IEC 61853 Energy Rating", date: "2025-11-10", auditor: "Dr. M. Gupta (NABL)", conformities: 5, minorNCs: 2, majorNCs: 0, observations: 2, ofis: 1, status: "Approved" as const },
  { id: "RPT-EA-2025-002", title: "BIS Surveillance Audit", date: "2025-09-25", auditor: "BIS Assessor", conformities: 12, minorNCs: 1, majorNCs: 1, observations: 0, ofis: 0, status: "Approved" as const },
  { id: "RPT-EA-2025-001", title: "TUV Witness Audit - Environmental Tests", date: "2025-07-20", auditor: "TUV Assessor", conformities: 10, minorNCs: 1, majorNCs: 0, observations: 1, ofis: 0, status: "Approved" as const },
];

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("checklist");
  const [checklist, setChecklist] = useState(ISO_CLAUSES);
  const [ncFilter, setNcFilter] = useState("All");
  const [selectedClause, setSelectedClause] = useState<string | null>(null);

  const findingSummary = checklist.reduce((a, c) => { a[c.finding] = (a[c.finding] || 0) + 1; return a; }, {} as Record<string, number>);
  const filteredNCs = ncFilter === "All" ? NC_REGISTER : NC_REGISTER.filter(nc => nc.source === ncFilter || nc.status === ncFilter);
  const openNCs = NC_REGISTER.filter(nc => nc.status === "Open" || nc.status === "In Progress").length;
  const maxHist = Math.max(...CLAUSE_HISTORY.map(c => c.total), 1);

  const updateRow = (idx: number, field: string, value: string) => {
    setChecklist(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Management</h1>
          <p className="text-sm text-gray-400 mt-1">ISO 17025 internal & external audit tracking</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="checklist" className="text-xs gap-1"><ClipboardCheck className="h-3 w-3" />Checklist</TabsTrigger>
          <TabsTrigger value="scope" className="text-xs gap-1"><FileText className="h-3 w-3" />Scope & Criteria</TabsTrigger>
          <TabsTrigger value="auditors" className="text-xs gap-1"><Users className="h-3 w-3" />Auditor Qualifications</TabsTrigger>
          <TabsTrigger value="nc-register" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" />NC Register</TabsTrigger>
          <TabsTrigger value="historical" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />Historical NCs</TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs gap-1"><Calendar className="h-3 w-3" />Schedule</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs gap-1"><FileDown className="h-3 w-3" />Reports</TabsTrigger>
        </TabsList>

        {/* TAB 1: Internal Audit Checklist */}
        <TabsContent value="checklist" className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><span className="text-gray-500 block">Audit ID</span><span className="text-orange-400 font-mono">IA-2026-001</span></div>
              <div><span className="text-gray-500 block">Lead Auditor</span><span className="text-gray-300">Dr. Priya Mehta</span></div>
              <div><span className="text-gray-500 block">Standard</span><span className="text-gray-300">ISO/IEC 17025:2017</span></div>
              <div><span className="text-gray-500 block">Status</span><span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-400 text-xs">Completed</span></div>
            </div>
          </div>
          <div className="flex gap-2 text-xs flex-wrap">
            {Object.entries(findingSummary).map(([cat, count]) => (
              <span key={cat} className={cn("px-2 py-1 rounded", findingColors[cat as FindingCategory])}>{cat}: {count}</span>
            ))}
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-900/80 text-gray-400 uppercase tracking-wider">
                  <th className="px-2 py-2 text-left w-16">Clause</th>
                  <th className="px-2 py-2 text-left">Requirement</th>
                  <th className="px-2 py-2 text-center w-28">Compliance</th>
                  <th className="px-2 py-2 text-left w-40">Observations</th>
                  <th className="px-2 py-2 text-center w-16">Evidence</th>
                  <th className="px-2 py-2 text-center w-24">Finding</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {checklist.map((c, i) => (
                    <tr key={c.clause} className="hover:bg-gray-900/50">
                      <td className="px-2 py-1.5 font-mono text-orange-400">{c.clause}</td>
                      <td className="px-2 py-1.5 text-gray-300">{c.title}</td>
                      <td className="px-2 py-1.5 text-center">
                        <select value={c.compliance} onChange={e => updateRow(i, "compliance", e.target.value)}
                          className={cn("bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] w-full", complianceColors[c.compliance])}>
                          <option>Comply</option><option>Not Comply</option><option>Not Applicable</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={c.observation} onChange={e => updateRow(i, "observation", e.target.value)}
                          placeholder="—" className="bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-gray-300 text-[10px] w-full" />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <div className="flex gap-1 justify-center">
                          <button title="Attach Document" className="p-0.5 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400"><Paperclip className="h-3 w-3" /></button>
                          <button title="Attach Photo" className="p-0.5 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-400"><Camera className="h-3 w-3" /></button>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <select value={c.finding} onChange={e => updateRow(i, "finding", e.target.value)}
                          className={cn("bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] w-full", findingColors[c.finding])}>
                          <option>Conformity</option><option>Minor NC</option><option>Major NC</option><option>Observation</option><option>OFI</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Audit Scope & Criteria */}
        <TabsContent value="scope" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Audit Objective</h3>
              <p className="text-xs text-gray-400">Evaluate conformity of the Solar PV Testing Laboratory Quality Management System with ISO/IEC 17025:2017 requirements and determine effectiveness of implemented processes.</p>
              <h3 className="text-sm font-semibold text-white mt-4">Audit Scope</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <p><span className="text-gray-500">Clauses:</span> 4.1 – 8.9 (Full scope)</p>
                <p><span className="text-gray-500">Departments:</span> Testing, Calibration, Quality, Procurement</p>
                <p><span className="text-gray-500">Test Methods:</span> IEC 61215, IEC 61730, IEC 61853, IEC 60904</p>
                <p><span className="text-gray-500">Location:</span> Solar PV Testing Laboratory, Bangalore</p>
              </div>
              <h3 className="text-sm font-semibold text-white mt-4">Audit Criteria</h3>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>ISO/IEC 17025:2017 — General requirements for competence</li>
                <li>NABL 130 — Specific criteria for testing laboratories</li>
                <li>NABL 163 — Policy on proficiency testing</li>
                <li>Lab QMS Manual (QM-SLX-001 Rev.5)</li>
                <li>Standard Operating Procedures (all applicable SOPs)</li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Audit Details</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-gray-500 block">Audit Type</span><span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-400">Internal</span></div>
                  <div><span className="text-gray-500 block">Audit ID</span><span className="text-orange-400 font-mono">IA-2026-001</span></div>
                  <div><span className="text-gray-500 block">Lead Auditor</span><span className="text-gray-300">Dr. Priya Mehta</span></div>
                  <div><span className="text-gray-500 block">Co-Auditor</span><span className="text-gray-300">Rahul Singh</span></div>
                  <div><span className="text-gray-500 block">Start Date</span><span className="text-gray-300">2026-03-15</span></div>
                  <div><span className="text-gray-500 block">End Date</span><span className="text-gray-300">2026-03-22</span></div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Audit Team</h3>
                <div className="space-y-2 text-xs">
                  {[{ name: "Dr. Priya Mehta", role: "Lead Auditor", scope: "Clauses 4–7" }, { name: "Rahul Singh", role: "Co-Auditor", scope: "Clauses 8.1–8.9" }, { name: "Anil Kumar", role: "Technical Expert", scope: "Equipment & Methods" }].map(m => (
                    <div key={m.name} className="flex justify-between items-center py-1 border-b border-gray-800/50">
                      <span className="text-gray-300">{m.name}</span>
                      <span className="text-gray-500">{m.role}</span>
                      <span className="text-gray-400">{m.scope}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white">Meeting Details</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-gray-500 block">Opening Meeting</span><span className="text-gray-300">2026-03-15, 09:00 — Conf Room A</span></div>
                  <div><span className="text-gray-500 block">Closing Meeting</span><span className="text-gray-300">2026-03-22, 15:00 — Conf Room A</span></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Auditor Qualifications */}
        <TabsContent value="auditors" className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Minimum Auditor Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
              <div className="flex gap-2"><span className="text-gray-500">Qualification:</span> B.E./B.Tech or equivalent minimum</div>
              <div className="flex gap-2"><span className="text-gray-500">Experience:</span> ≥ 2 years in relevant technical field</div>
              <div className="flex gap-2"><span className="text-gray-500">Independence:</span> Cannot audit own department</div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-900/80 text-gray-400 uppercase tracking-wider">
                  <th className="px-2 py-2 text-left">Name</th><th className="px-2 py-2 text-left">Emp ID</th>
                  <th className="px-2 py-2 text-left">Dept</th><th className="px-2 py-2 text-left">Qualification</th>
                  <th className="px-2 py-2 text-left">Training</th><th className="px-2 py-2 text-left">Date</th>
                  <th className="px-2 py-2 text-left">Cert #</th><th className="px-2 py-2 text-left">Cross-Dept Exp.</th>
                  <th className="px-2 py-2 text-center">Audits</th><th className="px-2 py-2 text-center">Lead</th>
                  <th className="px-2 py-2 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {AUDITORS.map(a => (
                    <tr key={a.empId} className="hover:bg-gray-900/50">
                      <td className="px-2 py-1.5 text-gray-200 font-medium">{a.name}</td>
                      <td className="px-2 py-1.5 font-mono text-orange-400">{a.empId}</td>
                      <td className="px-2 py-1.5 text-gray-400">{a.dept}</td>
                      <td className="px-2 py-1.5 text-gray-300">{a.qualification}</td>
                      <td className="px-2 py-1.5 text-gray-300">{a.training}</td>
                      <td className="px-2 py-1.5 text-gray-400">{a.trainingDate}</td>
                      <td className="px-2 py-1.5 font-mono text-gray-400">{a.certNo}</td>
                      <td className="px-2 py-1.5 text-gray-400">{a.depts.join(", ")}</td>
                      <td className="px-2 py-1.5 text-center text-gray-300">{a.audits}</td>
                      <td className="px-2 py-1.5 text-center">{a.leadEligible ? <span className="text-emerald-400">Y</span> : <span className="text-gray-500">N</span>}</td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", a.status === "Active" ? "bg-emerald-900/60 text-emerald-400" : "bg-gray-700 text-gray-400")}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: NC Register */}
        <TabsContent value="nc-register" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-gray-500">Filter:</span>
              {["All", "Internal", "NABL", "BIS", "TUV", "Bureau Veritas", "Open", "Closed", "Verified"].map(f => (
                <button key={f} onClick={() => setNcFilter(f)} className={cn("px-2 py-1 rounded text-xs", ncFilter === f ? "bg-orange-500/20 text-orange-400" : "bg-gray-800 text-gray-400 hover:text-white")}>{f}</button>
              ))}
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-900/40 text-emerald-400 text-xs hover:bg-emerald-900/60">
              <Download className="h-3 w-3" />Export to Excel
            </button>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-red-900/40 text-red-400">{openNCs} Open</span>
            <span className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-400">{NC_REGISTER.filter(nc => nc.status === "Verified").length} Verified</span>
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-gray-900/80 text-gray-400 uppercase tracking-wider">
                  <th className="px-2 py-2 text-left">NC#</th><th className="px-2 py-2 text-left">Source</th>
                  <th className="px-2 py-2 text-left">Audit Date</th><th className="px-2 py-2 text-left">Clause</th>
                  <th className="px-2 py-2 text-left">Description</th><th className="px-2 py-2 text-center">Category</th>
                  <th className="px-2 py-2 text-left">Root Cause</th><th className="px-2 py-2 text-left">Corrective Action</th>
                  <th className="px-2 py-2 text-left">Due</th><th className="px-2 py-2 text-left">Resp.</th>
                  <th className="px-2 py-2 text-center">Status</th><th className="px-2 py-2 text-left">Effectiveness</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredNCs.map(nc => (
                    <tr key={nc.ncNo} className="hover:bg-gray-900/50">
                      <td className="px-2 py-1.5 font-mono text-orange-400">{nc.ncNo}</td>
                      <td className="px-2 py-1.5 text-gray-300">{nc.source}</td>
                      <td className="px-2 py-1.5 text-gray-400">{nc.auditDate}</td>
                      <td className="px-2 py-1.5 font-mono text-gray-300">{nc.clauseRef}</td>
                      <td className="px-2 py-1.5 text-gray-300 max-w-[160px] truncate" title={nc.description}>{nc.description}</td>
                      <td className="px-2 py-1.5 text-center"><span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", findingColors[nc.category])}>{nc.category}</span></td>
                      <td className="px-2 py-1.5 text-gray-400 max-w-[120px] truncate" title={nc.rootCause}>{nc.rootCause}</td>
                      <td className="px-2 py-1.5 text-gray-400 max-w-[140px] truncate" title={nc.correctiveAction}>{nc.correctiveAction}</td>
                      <td className="px-2 py-1.5 text-gray-400">{nc.dueDate}</td>
                      <td className="px-2 py-1.5 text-gray-300">{nc.responsible}</td>
                      <td className="px-2 py-1.5 text-center"><span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", ncStatusColors[nc.status])}>{nc.status}</span></td>
                      <td className="px-2 py-1.5 text-gray-400 max-w-[120px] truncate" title={nc.effectiveness}>{nc.effectiveness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: Historical NCs */}
        <TabsContent value="historical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">NC Count by Clause</h3>
              <div className="space-y-2">
                {CLAUSE_HISTORY.map(c => (
                  <button key={c.clause} onClick={() => setSelectedClause(selectedClause === c.clause ? null : c.clause)}
                    className={cn("w-full flex items-center gap-2 text-xs py-1 rounded px-1 hover:bg-gray-800/50", selectedClause === c.clause && "bg-gray-800/80")}>
                    <span className="font-mono text-orange-400 w-8">{c.clause}</span>
                    <span className="text-gray-400 w-36 text-left truncate">{c.title}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange-500/80 to-red-500/80" style={{ width: `${(c.total / maxHist) * 100}%` }} />
                    </div>
                    <span className="text-gray-300 w-6 text-right">{c.total}</span>
                    <span className={cn("w-4", c.trend === "↑" ? "text-red-400" : c.trend === "↓" ? "text-emerald-400" : "text-gray-500")}>{c.trend}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Clause Detail</h3>
              {selectedClause ? (() => {
                const ch = CLAUSE_HISTORY.find(c => c.clause === selectedClause)!;
                const clauseNCs = NC_REGISTER.filter(nc => nc.clauseRef.startsWith(selectedClause));
                return (<div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg bg-gray-800 p-2 text-center"><span className="text-gray-500 block">Total NCs</span><span className="text-white font-bold text-lg">{ch.total}</span></div>
                    <div className="rounded-lg bg-gray-800 p-2 text-center"><span className="text-gray-500 block">Trend</span><span className={cn("font-bold text-lg", ch.trend === "↑" ? "text-red-400" : ch.trend === "↓" ? "text-emerald-400" : "text-gray-400")}>{ch.trend}</span></div>
                    <div className="rounded-lg bg-gray-800 p-2 text-center"><span className="text-gray-500 block">Last NC</span><span className="text-gray-300">{ch.lastDate}</span></div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Internal: {ch.internal} | NABL: {ch.nabl} | BIS: {ch.bis} | Other: {ch.other}</p>
                  </div>
                  {clauseNCs.length > 0 && (<div className="space-y-1 mt-2">
                    <p className="text-xs text-gray-500 font-medium">Recent NCs in register:</p>
                    {clauseNCs.map(nc => (
                      <div key={nc.ncNo} className="text-xs border border-gray-800 rounded p-2">
                        <div className="flex justify-between"><span className="font-mono text-orange-400">{nc.ncNo}</span><span className={cn("px-1.5 py-0.5 rounded text-[10px]", ncStatusColors[nc.status])}>{nc.status}</span></div>
                        <p className="text-gray-400 mt-1">{nc.description}</p>
                      </div>
                    ))}
                  </div>)}
                </div>);
              })() : <p className="text-xs text-gray-500 mt-8 text-center">Click a clause in the chart to view details</p>}
            </div>
          </div>
        </TabsContent>

        {/* TAB 6: Audit Schedule */}
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
                {AUDIT_SCHEDULE.map(s => (
                  <tr key={s.id} className="hover:bg-gray-900/50">
                    <td className="px-4 py-2 text-white text-xs font-medium">{s.month}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">{s.type}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{s.scope}</td>
                    <td className="px-4 py-2 text-gray-300 text-xs">{s.auditor}</td>
                    <td className="px-4 py-2 text-gray-400 text-xs">{s.planned}</td>
                    <td className="px-4 py-2 text-xs">{s.actual === "—" ? <span className="text-gray-600">—</span> : <span className="text-gray-300">{s.actual}</span>}</td>
                    <td className="px-4 py-2 text-center"><span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", s.status === "Completed" ? "bg-emerald-900/60 text-emerald-400" : s.status === "In Progress" ? "bg-amber-900/60 text-amber-400" : "bg-blue-900/60 text-blue-400")}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">2026 Audit Calendar</h3>
            <div className="grid grid-cols-12 gap-1">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => {
                const inMonth = AUDIT_SCHEDULE.filter(s => s.month.startsWith(m));
                const done = inMonth.some(a => a.status === "Completed");
                const plan = inMonth.some(a => a.status === "Planned");
                return (<div key={m} className={cn("rounded-lg p-2 text-center border", done ? "border-emerald-700 bg-emerald-950/30" : plan ? "border-blue-700 bg-blue-950/30" : "border-gray-800 bg-gray-900/40")}>
                  <span className="text-[10px] text-gray-400 block">{m}</span>
                  {inMonth.length > 0 ? <span className={cn("text-xs font-bold", done ? "text-emerald-400" : "text-blue-400")}>{inMonth.length}</span> : <span className="text-xs text-gray-600">—</span>}
                </div>);
              })}
            </div>
          </div>
        </TabsContent>

        {/* TAB 7: Audit Reports */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-end gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-900/40 text-red-400 text-xs hover:bg-red-900/60"><FileDown className="h-3 w-3" />Export to PDF</button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded bg-blue-900/40 text-blue-400 text-xs hover:bg-blue-900/60"><FileDown className="h-3 w-3" />Export to Word</button>
          </div>
          <div className="space-y-3">
            {AUDIT_REPORTS.map(r => (
              <div key={r.id} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-orange-400" />
                    <span className="font-mono text-orange-400 text-xs">{r.id}</span>
                    <span className="text-white text-sm font-medium">{r.title}</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium", r.status === "Approved" ? "bg-emerald-900/60 text-emerald-400" : r.status === "Reviewed" ? "bg-blue-900/60 text-blue-400" : "bg-gray-700 text-gray-300")}>{r.status}</span>
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
