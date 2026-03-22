// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { auditPlans, auditFindings, auditMetrics } from "@/lib/data/audit-data";
import { FindingSeverityBadge, FindingStatusBadge } from "@/components/audit/FindingSeverityBadge";
import { FindingsTrendChart, ClosureRateChart } from "@/components/audit/TrendChart";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

export default function AuditDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const upcomingAudits = auditPlans.filter((a) => a.status === "Planned" || a.status === "In Progress");
  const openFindings = auditFindings.filter((f) => f.status !== "Closed");
  const totalFindings = auditFindings.length;
  const closedFindings = auditFindings.filter((f) => f.status === "Closed").length;
  const closureRate = totalFindings > 0 ? Math.round((closedFindings / totalFindings) * 100) : 0;
  const majorNCs = auditFindings.filter((f) => f.severity === "Major NC" && f.status !== "Closed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Management</h1>
        <div className="flex gap-2">
          <Link href="/audit/plans" className="btn-secondary text-sm">View All Plans</Link>
          <Link href="/audit/findings" className="btn-secondary text-sm">View Findings</Link>
          <Link href="/audit/car" className="btn-primary text-sm">CAR/8D Reports</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Upcoming Audits</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{upcomingAudits.length}</p>
          <p className="text-xs text-gray-400 mt-1">Planned & In Progress</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Open Findings</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{openFindings.length}</p>
          <p className="text-xs text-gray-400 mt-1">Requiring attention</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Closure Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{closureRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{closedFindings}/{totalFindings} findings closed</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Open Major NCs</p>
          <p className={cn("text-3xl font-bold mt-1", majorNCs > 0 ? "text-red-600" : "text-green-600")}>{majorNCs}</p>
          <p className="text-xs text-gray-400 mt-1">Critical findings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="witness-audit">Witness Audit</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FindingsTrendChart data={auditMetrics.findingsByMonth} />
            <ClosureRateChart data={auditMetrics.closureRate} />
          </div>

          {/* Upcoming Audits Table */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Upcoming Audits</h2>
              <Link href="/audit/plans" className="text-xs text-primary-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingAudits.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        <Link href={`/audit/plans/${audit.id}`} className="text-primary-600 hover:underline">
                          {audit.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{audit.title}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-primary-50 text-primary-700">{audit.standard}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{audit.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(audit.scheduledDate)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge", statusStyles[audit.status])}>{audit.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{audit.leadAuditor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Open Findings */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Open Findings</h2>
              <Link href="/audit/findings" className="text-xs text-primary-600 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {openFindings.map((finding) => (
                    <tr key={finding.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        <Link href={`/audit/findings/${finding.id}`} className="text-primary-600 hover:underline">
                          {finding.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 max-w-sm truncate">{finding.description}</td>
                      <td className="px-4 py-3"><FindingSeverityBadge severity={finding.severity} /></td>
                      <td className="px-4 py-3"><FindingStatusBadge status={finding.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(finding.targetDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{finding.responsiblePerson}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Witness Audit Tab */}
        <TabsContent value="witness-audit" className="space-y-6">
          <WitnessAuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Witness Audit Tab Component
function WitnessAuditTab() {
  const [viewMode, setViewMode] = useState<"schedule" | "observations" | "actions" | "checklist">("schedule");

  const witnessAudits = [
    { id: "WA-001", type: "NABL Witness Audit", standard: "ISO 17025:2017", scheduledDate: "2026-04-15", assessor: "Dr. S. Ramanathan (NABL)", scope: "IEC 61215 - DH, TC, HF Tests", status: "Scheduled", lab: "Environmental Testing Lab", lastAudit: "2025-04-10", frequency: "Annual" },
    { id: "WA-002", type: "IAS Witness Audit", standard: "ISO 17025:2017", scheduledDate: "2026-05-20", assessor: "Ms. K. Patel (IAS)", scope: "IEC 61730 - Safety Tests", status: "Planned", lab: "Electrical Safety Lab", lastAudit: "2025-05-22", frequency: "Annual" },
    { id: "WA-003", type: "NABL Surveillance", standard: "ISO 17025:2017", scheduledDate: "2026-06-10", assessor: "Mr. V. Krishnan (NABL)", scope: "IEC 60904 - STC Measurements", status: "Planned", lab: "Solar Simulator Lab", lastAudit: "2025-06-15", frequency: "Annual" },
    { id: "WA-004", type: "NABL Witness Audit", standard: "ISO 17025:2017", scheduledDate: "2025-11-05", assessor: "Dr. M. Gupta (NABL)", scope: "IEC 61853 - Energy Rating", status: "Completed", lab: "Performance Testing Lab", lastAudit: "2025-11-05", frequency: "Annual" },
  ];

  const observations = [
    { id: "WO-001", auditId: "WA-004", clause: "7.2.1", observation: "Test procedure for IV curve measurement at STC follows IEC 60904-1 Ed.3 correctly", type: "Positive", assessor: "Dr. M. Gupta", date: "2025-11-05" },
    { id: "WO-002", auditId: "WA-004", clause: "7.6.1", observation: "Measurement uncertainty calculation for Pmax needs to include spectral mismatch contribution", type: "Improvement", assessor: "Dr. M. Gupta", date: "2025-11-05" },
    { id: "WO-003", auditId: "WA-004", clause: "6.4.1", observation: "Environmental conditions monitoring datalogger calibration certificate expired by 2 weeks", type: "Non-Conformity", assessor: "Dr. M. Gupta", date: "2025-11-05" },
    { id: "WO-004", auditId: "WA-004", clause: "7.2.2", observation: "Excellent documentation of test deviations and client communication", type: "Positive", assessor: "Dr. M. Gupta", date: "2025-11-05" },
    { id: "WO-005", auditId: "WA-004", clause: "7.8.2", observation: "Test report template missing uncertainty statement for energy yield calculation", type: "Improvement", assessor: "Dr. M. Gupta", date: "2025-11-05" },
  ];

  const correctiveActions = [
    { id: "WCA-001", observationId: "WO-003", description: "Recalibrate environmental datalogger and establish 30-day advance reminder for calibration renewals", responsible: "Amit Sharma", targetDate: "2025-12-05", status: "Completed", completedDate: "2025-11-20", evidence: "Calibration cert #CAL-DL-2025-089 uploaded" },
    { id: "WCA-002", observationId: "WO-002", description: "Update uncertainty budget to include spectral mismatch factor per IEC 60904-7", responsible: "Dr. Priya Mehta", targetDate: "2025-12-15", status: "Completed", completedDate: "2025-12-10", evidence: "Revised uncertainty budget UB-2025-REV3" },
    { id: "WCA-003", observationId: "WO-005", description: "Update test report template to include uncertainty statement for energy yield calculations", responsible: "Rahul Singh", targetDate: "2026-01-15", status: "Completed", completedDate: "2026-01-12", evidence: "Template REP-TPL-61853-v4 approved" },
  ];

  const preAssessmentChecklist = [
    { id: 1, category: "Personnel", item: "All test engineers have valid competency records and authorizations", status: "complete" },
    { id: 2, category: "Personnel", item: "Training records up to date for all personnel in scope", status: "complete" },
    { id: 3, category: "Equipment", item: "All equipment in scope has valid calibration certificates", status: "warning" },
    { id: 4, category: "Equipment", item: "Intermediate check records are current", status: "complete" },
    { id: 5, category: "Equipment", item: "Equipment maintenance logs are up to date", status: "complete" },
    { id: 6, category: "Documents", item: "Test procedures reviewed and current revision in use", status: "complete" },
    { id: 7, category: "Documents", item: "Quality manual and SOPs are accessible", status: "complete" },
    { id: 8, category: "Documents", item: "Previous audit findings closed with evidence", status: "complete" },
    { id: 9, category: "Environment", item: "Environmental monitoring system operational", status: "complete" },
    { id: 10, category: "Environment", item: "Lab conditions meet test requirements", status: "complete" },
    { id: 11, category: "Records", item: "Sample test records complete and traceable", status: "warning" },
    { id: 12, category: "Records", item: "Measurement uncertainty budgets current and approved", status: "complete" },
    { id: 13, category: "Records", item: "Proficiency testing / ILC participation records available", status: "incomplete" },
    { id: 14, category: "Safety", item: "Safety protocols and emergency procedures posted", status: "complete" },
    { id: 15, category: "Safety", item: "PPE available and condition verified", status: "complete" },
  ];

  const observationTypeColors: Record<string, string> = {
    Positive: "bg-green-100 text-green-700",
    Improvement: "bg-amber-100 text-amber-700",
    "Non-Conformity": "bg-red-100 text-red-700",
  };

  const auditStatusColors: Record<string, string> = {
    Scheduled: "bg-blue-100 text-blue-700",
    Planned: "bg-purple-100 text-purple-700",
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
  };

  const checkStatusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Upcoming Witness Audits</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{witnessAudits.filter(a => a.status !== "Completed").length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Completed This Year</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{witnessAudits.filter(a => a.status === "Completed").length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Open Observations</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{observations.filter(o => o.type !== "Positive").length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Actions Closed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{correctiveActions.filter(a => a.status === "Completed").length}/{correctiveActions.length}</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        {([
          { key: "schedule", label: "Schedule & Tracking", icon: Calendar },
          { key: "observations", label: "Observations Log", icon: Eye },
          { key: "actions", label: "Corrective Actions", icon: ClipboardCheck },
          { key: "checklist", label: "Pre-Assessment Checklist", icon: FileText },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              viewMode === key
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Schedule & Tracking */}
      {viewMode === "schedule" && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">NABL / IAS Witness Audit Schedule</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Scope</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Lab</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Assessor</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Last Audit</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {witnessAudits.map(audit => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-mono text-gray-600">{audit.id}</td>
                    <td className="px-3 py-3 font-medium text-gray-900">{audit.type}</td>
                    <td className="px-3 py-3 text-gray-700">{audit.scope}</td>
                    <td className="px-3 py-3 text-gray-600">{audit.lab}</td>
                    <td className="px-3 py-3 text-gray-600">{audit.assessor}</td>
                    <td className="px-3 py-3 text-gray-600">{audit.scheduledDate}</td>
                    <td className="px-3 py-3 text-gray-400">{audit.lastAudit}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", auditStatusColors[audit.status])}>
                        {audit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Observations Log */}
      {viewMode === "observations" && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Witness Audit Observations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Audit</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">ISO Clause</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Observation</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Assessor</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {observations.map(obs => (
                  <tr key={obs.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-mono text-gray-500">{obs.id}</td>
                    <td className="px-3 py-3 font-mono text-gray-500">{obs.auditId}</td>
                    <td className="px-3 py-3 font-medium text-gray-900">{obs.clause}</td>
                    <td className="px-3 py-3 text-gray-700 max-w-md">{obs.observation}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", observationTypeColors[obs.type])}>
                        {obs.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{obs.assessor}</td>
                    <td className="px-3 py-3 text-gray-500">{obs.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Corrective Actions */}
      {viewMode === "actions" && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Corrective Actions from Witness Audits</h2>
          <div className="space-y-3">
            {correctiveActions.map(action => (
              <div key={action.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">{action.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500">Ref: {action.observationId}</span>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold",
                    action.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {action.status}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-2">{action.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                  <div><span className="font-medium text-gray-700">Responsible:</span> {action.responsible}</div>
                  <div><span className="font-medium text-gray-700">Target:</span> {action.targetDate}</div>
                  {action.completedDate && <div><span className="font-medium text-gray-700">Completed:</span> {action.completedDate}</div>}
                  {action.evidence && <div><span className="font-medium text-gray-700">Evidence:</span> {action.evidence}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Assessment Checklist */}
      {viewMode === "checklist" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Pre-Assessment Checklist — Next Witness Audit (WA-001)</h2>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> {preAssessmentChecklist.filter(c => c.status === "complete").length} Ready</span>
              <span className="flex items-center gap-1 text-amber-500"><AlertTriangle className="h-3.5 w-3.5" /> {preAssessmentChecklist.filter(c => c.status === "warning").length} Needs Attention</span>
              <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="h-3.5 w-3.5" /> {preAssessmentChecklist.filter(c => c.status === "incomplete").length} Not Ready</span>
            </div>
          </div>
          <div className="space-y-1">
            {["Personnel", "Equipment", "Documents", "Environment", "Records", "Safety"].map(category => {
              const items = preAssessmentChecklist.filter(c => c.category === category);
              if (items.length === 0) return null;
              return (
                <div key={category} className="mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-3">{category}</h3>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50">
                      {checkStatusIcon(item.status)}
                      <span className={cn("text-sm flex-1",
                        item.status === "complete" ? "text-gray-700" :
                        item.status === "warning" ? "text-amber-700" : "text-red-700"
                      )}>
                        {item.item}
                      </span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded font-semibold",
                        item.status === "complete" ? "bg-green-100 text-green-700" :
                        item.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        {item.status === "complete" ? "Ready" : item.status === "warning" ? "Attention" : "Not Ready"}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
