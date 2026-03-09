"use client";

import { useState } from "react";
import Link from "next/link";
import { auditPlans, auditFindings, auditMetrics } from "@/lib/data/audit-data";
import { FindingSeverityBadge, FindingStatusBadge } from "@/components/audit/FindingSeverityBadge";
import { FindingsTrendChart, ClosureRateChart } from "@/components/audit/TrendChart";
import { formatDate, cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Inline mock data
// ---------------------------------------------------------------------------

const checklistTemplates = [
  {
    id: "CLT-001",
    standard: "ISO 17025",
    title: "ISO/IEC 17025:2017 - General Requirements for Competence of Testing Laboratories",
    items: [
      { clause: "4.1", requirement: "Impartiality - Organization demonstrates commitment to impartial laboratory activities", guidance: "Review impartiality policy, risk register for impartiality threats, staff declarations" },
      { clause: "4.2", requirement: "Confidentiality - Management of proprietary information and data protection", guidance: "Review NDAs, IT security controls, data handling procedures, access logs" },
      { clause: "6.2", requirement: "Personnel - Staff competence, qualifications, training records, and authorizations", guidance: "Training matrix, competency assessments, qualification records, supervision plans" },
      { clause: "6.4", requirement: "Equipment - Calibration status, maintenance schedules, and unique identification", guidance: "Calibration certificates, maintenance logs, equipment registers, out-of-tolerance procedures" },
      { clause: "6.5", requirement: "Metrological Traceability - Established and documented traceability chain", guidance: "Traceability diagrams, reference standard certificates, calibration hierarchy" },
      { clause: "7.2", requirement: "Selection, Verification and Validation of Methods", guidance: "Method validation reports, verification records, deviation justifications" },
      { clause: "7.6", requirement: "Evaluation of Measurement Uncertainty for all test/calibration methods", guidance: "Uncertainty budgets, GUM methodology, contribution analysis, CMC statements" },
      { clause: "7.8", requirement: "Reporting of Results - Completeness and accuracy of test reports", guidance: "Sample reports, customer feedback, report templates, opinion/interpretation statements" },
    ],
  },
  {
    id: "CLT-002",
    standard: "IEC 61215",
    title: "IEC 61215:2021 - Terrestrial PV Modules - Design Qualification",
    items: [
      { clause: "MQT 01", requirement: "Visual Inspection - Pre/post test visual assessment per IEC 61215-1 Clause 7", guidance: "Inspection protocol, lighting conditions, magnification requirements, defect catalog" },
      { clause: "MQT 02", requirement: "Maximum Power Determination at STC (1000 W/m2, 25C, AM1.5G)", guidance: "I-V curve tracer calibration, reference cell traceability, temperature correction" },
      { clause: "MQT 06", requirement: "Performance at Low Irradiance - Module characterization at 200 W/m2", guidance: "Irradiance uniformity, temperature stability, spectral match verification" },
      { clause: "MQT 10", requirement: "UV Preconditioning Test - Exposure to 15 kWh/m2 UV (280-400nm)", guidance: "UV sensor calibration, spectral distribution measurement, dose calculation" },
      { clause: "MQT 11", requirement: "Thermal Cycling Test - 200 cycles between -40C and +85C", guidance: "Chamber qualification, thermocouple placement, dwell time verification, ramp rates" },
      { clause: "MQT 12", requirement: "Humidity Freeze Test - 10 cycles, -40C to +85C at 85% RH", guidance: "Humidity sensor calibration, condensation checks, temperature profile validation" },
      { clause: "MQT 13", requirement: "Damp Heat Test - 1000 hours at 85C / 85% RH", guidance: "Chamber stability records, module positioning, air circulation verification" },
      { clause: "MQT 15", requirement: "Mechanical Load Test - Front/back loading at 2400/5400 Pa", guidance: "Load cell calibration, deflection measurement, uniform load distribution" },
    ],
  },
  {
    id: "CLT-003",
    standard: "ISO 9001",
    title: "ISO 9001:2015 - Quality Management Systems Requirements",
    items: [
      { clause: "4.1", requirement: "Understanding the Organization and its Context", guidance: "SWOT analysis, interested parties, internal/external issues register" },
      { clause: "5.1", requirement: "Leadership and Commitment - Top management demonstrated commitment", guidance: "Management review minutes, resource allocation, quality policy communication" },
      { clause: "6.1", requirement: "Actions to Address Risks and Opportunities", guidance: "Risk register, risk treatment plans, opportunity assessment, effectiveness reviews" },
      { clause: "7.1", requirement: "Resources - Determination and provision of necessary resources", guidance: "Resource plans, budget allocation, infrastructure maintenance, competence needs" },
      { clause: "8.1", requirement: "Operational Planning and Control", guidance: "Process maps, control plans, work instructions, outsourced process controls" },
      { clause: "9.1", requirement: "Monitoring, Measurement, Analysis and Evaluation", guidance: "KPI dashboards, customer satisfaction surveys, process performance data, trend analysis" },
      { clause: "9.2", requirement: "Internal Audit Program planning and execution", guidance: "Audit schedule, auditor competence records, audit reports, follow-up evidence" },
      { clause: "10.2", requirement: "Nonconformity and Corrective Action", guidance: "NC register, root cause analysis records, corrective action effectiveness, recurrence data" },
    ],
  },
];

const correctiveActions = [
  {
    id: "CA-2026-001",
    findingId: "FND-2026-002",
    description: "Update MU budget MU-UV-001 with new xenon arc lamp XL-700 spectral characteristics and recalculate combined uncertainty",
    responsiblePerson: "Raj Krishnan",
    department: "Calibration Lab",
    targetDate: "2026-03-25",
    completedDate: "2026-03-23",
    status: "Completed" as const,
    verificationStatus: "Pending",
    verifiedBy: "",
    notes: "MU budget updated and reviewed. Combined uncertainty marginally increased from 2.1% to 2.3%.",
  },
  {
    id: "CA-2026-002",
    findingId: "FND-2026-002",
    description: "Revise change management procedure QMS-CM-001 to include mandatory MU budget review trigger for all equipment changes",
    responsiblePerson: "Dr. Meera Patel",
    department: "Quality Management",
    targetDate: "2026-04-01",
    completedDate: null,
    status: "In Progress" as const,
    verificationStatus: "N/A",
    verifiedBy: "",
    notes: "Draft revision circulated for review. Comments received from 3 departments.",
  },
  {
    id: "CA-2026-003",
    findingId: "FND-2026-002",
    description: "Audit all existing MU budgets against equipment change records for the past 12 months to identify any other gaps",
    responsiblePerson: "Anil Mehta",
    department: "PV Testing Laboratory",
    targetDate: "2026-04-10",
    completedDate: null,
    status: "Planned" as const,
    verificationStatus: "N/A",
    verifiedBy: "",
    notes: "Equipment change register compiled. 23 MU budgets to be reviewed.",
  },
  {
    id: "CA-2026-004",
    findingId: "FND-2026-001",
    description: "Complete competency assessments for technicians T-012, T-015, T-018 for IEC 61215 thermal cycling test operation",
    responsiblePerson: "Vikram Singh",
    department: "PV Testing Laboratory",
    targetDate: "2026-04-15",
    completedDate: null,
    status: "In Progress" as const,
    verificationStatus: "N/A",
    verifiedBy: "",
    notes: "T-012 assessment scheduled for Mar 20. T-015 and T-018 in April.",
  },
  {
    id: "CA-2026-005",
    findingId: "FND-2025-016",
    description: "Update pyranometer calibration procedure CP-PYRA-003 to reference ISO 9847:2023 and implement standard tracking register",
    responsiblePerson: "Raj Krishnan",
    department: "Calibration Lab",
    targetDate: "2026-02-28",
    completedDate: "2026-02-25",
    status: "Verified" as const,
    verificationStatus: "Verified",
    verifiedBy: "Dr. Ramesh Kumar",
    notes: "Procedure updated to Rev 3. Standard tracking register implemented in QMS.",
  },
  {
    id: "CA-2025-012",
    findingId: "FND-2025-015",
    description: "Resolve environmental monitoring datalogger connectivity gaps by coordinating IT maintenance schedule and adding local buffer",
    responsiblePerson: "Sanjay Verma",
    department: "IT Infrastructure",
    targetDate: "2025-12-31",
    completedDate: null,
    status: "Overdue" as const,
    verificationStatus: "N/A",
    verifiedBy: "",
    notes: "Local buffer installed. IT maintenance rescheduled but one remaining network switch needs firmware update.",
  },
];

const auditReports = [
  {
    id: "RPT-2026-001",
    auditId: "AUD-2026-001",
    title: "ISO 17025 Internal Audit Report - PV Testing Lab (March 2026)",
    standard: "ISO 17025",
    status: "Draft" as const,
    author: "Dr. Ramesh Kumar",
    createdDate: "2026-03-20",
    reviewedBy: "",
    approvedBy: "",
    findingsCount: { major: 1, minor: 1, ofi: 0, observation: 0 },
    pages: 24,
  },
  {
    id: "RPT-2025-008",
    auditId: "AUD-2025-010",
    title: "ISO 17025 Annual Internal Audit Report - Calibration Lab (Nov 2025)",
    standard: "ISO 17025",
    status: "Approved" as const,
    author: "Anil Mehta",
    createdDate: "2025-11-20",
    reviewedBy: "Dr. Meera Patel",
    approvedBy: "Dr. S. Raghavan",
    findingsCount: { major: 0, minor: 1, ofi: 1, observation: 1 },
    pages: 18,
  },
  {
    id: "RPT-2025-007",
    auditId: "AUD-2025-009",
    title: "ISO 9001 Surveillance Readiness Audit Report (Oct 2025)",
    standard: "ISO 9001",
    status: "Issued" as const,
    author: "Priya Sharma",
    createdDate: "2025-10-25",
    reviewedBy: "Dr. Meera Patel",
    approvedBy: "Dr. S. Raghavan",
    findingsCount: { major: 0, minor: 2, ofi: 2, observation: 1 },
    pages: 32,
  },
  {
    id: "RPT-2025-006",
    auditId: "AUD-2025-008",
    title: "VDA 6.3 Process Audit Report - Cell Supplier Evaluation (Sep 2025)",
    standard: "VDA 6.3",
    status: "Under Review" as const,
    author: "Dr. Ramesh Kumar",
    createdDate: "2025-09-30",
    reviewedBy: "Suresh Patel",
    approvedBy: "",
    findingsCount: { major: 2, minor: 3, ofi: 1, observation: 0 },
    pages: 28,
  },
];

const departmentTrendData = [
  { department: "PV Testing Laboratory", majorNC: 2, minorNC: 4, observation: 3, ofi: 2, total: 11 },
  { department: "Calibration Lab", majorNC: 0, minorNC: 2, observation: 2, ofi: 3, total: 7 },
  { department: "Module Assembly", majorNC: 1, minorNC: 3, observation: 1, ofi: 1, total: 6 },
  { department: "Quality Management", majorNC: 0, minorNC: 1, observation: 2, ofi: 4, total: 7 },
];

const recurrenceData = [
  { finding: "Personnel competency assessment gaps", occurrences: 4, lastFound: "2026-03-16", departments: ["PV Testing Lab", "Calibration Lab"], riskLevel: "High" },
  { finding: "Document/standard references outdated", occurrences: 3, lastFound: "2025-11-14", departments: ["Calibration Lab", "Quality Management"], riskLevel: "Medium" },
  { finding: "Measurement uncertainty budgets not current", occurrences: 3, lastFound: "2026-03-17", departments: ["PV Testing Lab"], riskLevel: "High" },
  { finding: "Environmental monitoring data integrity", occurrences: 2, lastFound: "2025-11-13", departments: ["Calibration Lab", "IT Infrastructure"], riskLevel: "Low" },
  { finding: "Change management process gaps", occurrences: 2, lastFound: "2026-03-17", departments: ["Quality Management", "PV Testing Lab"], riskLevel: "High" },
];

// ---------------------------------------------------------------------------
// Status styling helpers
// ---------------------------------------------------------------------------

const statusStyles: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

const caStatusStyles: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Verified: "bg-emerald-100 text-emerald-700",
  Overdue: "bg-red-100 text-red-700",
};

const reportStatusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Issued: "bg-blue-100 text-blue-700",
};

const riskLevelStyles: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

// ---------------------------------------------------------------------------
// Tabs configuration
// ---------------------------------------------------------------------------

const tabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "planning", label: "Audit Planning" },
  { key: "checklists", label: "Checklist Generator" },
  { key: "findings", label: "Findings" },
  { key: "corrective-actions", label: "Corrective Actions" },
  { key: "reports", label: "Audit Reports" },
  { key: "trends", label: "Trend Analysis" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuditDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);

  // Computed data from imported sources
  const upcomingAudits = auditPlans.filter((a) => a.status === "Planned" || a.status === "In Progress");
  const openFindings = auditFindings.filter((f) => f.status !== "Closed");
  const totalFindings = auditFindings.length;
  const closedFindings = auditFindings.filter((f) => f.status === "Closed").length;
  const closureRate = totalFindings > 0 ? Math.round((closedFindings / totalFindings) * 100) : 0;
  const majorNCs = auditFindings.filter((f) => f.severity === "Major NC" && f.status !== "Closed").length;

  // ---------------------------------------------------------------------------
  // Tab: Dashboard
  // ---------------------------------------------------------------------------
  const renderDashboard = () => (
    <div className="space-y-6">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FindingsTrendChart data={auditMetrics.findingsByMonth} />
        <ClosureRateChart data={auditMetrics.closureRate} />
      </div>

      {/* Upcoming Audits Quick View */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming Audits</h2>
          <button onClick={() => setActiveTab("planning")} className="text-xs text-primary-600 hover:underline">
            View All Plans
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAudits.slice(0, 5).map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{audit.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{audit.title}</td>
                  <td className="px-4 py-3"><span className="badge bg-primary-50 text-primary-700">{audit.standard}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(audit.scheduledDate)}</td>
                  <td className="px-4 py-3"><span className={cn("badge", statusStyles[audit.status])}>{audit.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Open Findings Quick View */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Open Findings</h2>
          <button onClick={() => setActiveTab("findings")} className="text-xs text-primary-600 hover:underline">
            View All Findings
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {openFindings.slice(0, 5).map((finding) => (
                <tr key={finding.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{finding.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-sm truncate">{finding.description}</td>
                  <td className="px-4 py-3"><FindingSeverityBadge severity={finding.severity} /></td>
                  <td className="px-4 py-3"><FindingStatusBadge status={finding.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Tab: Audit Planning
  // ---------------------------------------------------------------------------
  const renderPlanning = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Audit Schedule & Planning</h2>
        <button className="btn-primary text-sm">+ New Audit Plan</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lead Auditor</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditPlans.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link href={`/audit/plans/${audit.id}`} className="text-primary-600 hover:underline">{audit.id}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">{audit.title}</td>
                  <td className="px-4 py-3"><span className="badge bg-primary-50 text-primary-700">{audit.standard}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{audit.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{audit.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(audit.scheduledDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(audit.endDate)}</td>
                  <td className="px-4 py-3"><span className={cn("badge", statusStyles[audit.status])}>{audit.status}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{audit.leadAuditor}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{audit.auditTeam.length} members</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope & Objectives Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {auditPlans.filter((a) => a.status === "In Progress" || a.status === "Planned").map((audit) => (
          <div key={audit.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">{audit.id} - {audit.standard}</h3>
              <span className={cn("badge", statusStyles[audit.status])}>{audit.status}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{audit.title}</p>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Scope:</p>
              <p className="text-xs text-gray-600">{audit.scope}</p>
            </div>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Objectives:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {audit.objectives.map((obj, i) => (
                  <li key={i} className="text-xs text-gray-600">{obj}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-2">
              <span>Lead: {audit.leadAuditor}</span>
              <span>Team: {audit.auditTeam.join(", ")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Tab: Checklist Generator
  // ---------------------------------------------------------------------------
  const renderChecklists = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Audit Checklist Generator</h2>
        <button className="btn-primary text-sm">+ Create Custom Checklist</button>
      </div>

      <p className="text-sm text-gray-500">
        Select a standard template to generate a clause-by-clause audit checklist. Checklists can be customized and assigned to specific audit plans.
      </p>

      <div className="space-y-4">
        {checklistTemplates.map((template) => {
          const isExpanded = expandedChecklist === template.id;
          return (
            <div key={template.id} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedChecklist(isExpanded ? null : template.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-primary-50 text-primary-700">{template.standard}</span>
                    <h3 className="text-sm font-semibold text-gray-900">{template.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{template.items.length} checklist items</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-xs" onClick={(e) => { e.stopPropagation(); }}>
                    Generate for Audit
                  </button>
                  <span className="text-gray-400 text-sm">{isExpanded ? "\u25B2" : "\u25BC"}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 border-t pt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Clause</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Evidence / Guidance</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-28">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {template.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-700">{item.clause}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.requirement}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{item.guidance}</td>
                            <td className="px-4 py-3">
                              <span className="badge bg-gray-100 text-gray-600">Not Started</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Tab: Findings
  // ---------------------------------------------------------------------------
  const renderFindings = () => {
    const severityCounts = {
      "Major NC": auditFindings.filter((f) => f.severity === "Major NC").length,
      "Minor NC": auditFindings.filter((f) => f.severity === "Minor NC").length,
      Observation: auditFindings.filter((f) => f.severity === "Observation").length,
      OFI: auditFindings.filter((f) => f.severity === "OFI").length,
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Audit Findings</h2>
          <div className="flex gap-2">
            <Link href="/audit/car" className="btn-secondary text-sm">CAR/8D Reports</Link>
            <button className="btn-primary text-sm">+ Log Finding</button>
          </div>
        </div>

        {/* Severity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card border-l-4 border-l-red-500">
            <p className="text-xs text-gray-500 uppercase">Major NC</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{severityCounts["Major NC"]}</p>
          </div>
          <div className="card border-l-4 border-l-orange-500">
            <p className="text-xs text-gray-500 uppercase">Minor NC</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{severityCounts["Minor NC"]}</p>
          </div>
          <div className="card border-l-4 border-l-yellow-500">
            <p className="text-xs text-gray-500 uppercase">Observation</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{severityCounts.Observation}</p>
          </div>
          <div className="card border-l-4 border-l-blue-500">
            <p className="text-xs text-gray-500 uppercase">OFI</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{severityCounts.OFI}</p>
          </div>
        </div>

        {/* Full Findings Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Audit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clause</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">
                      <Link href={`/audit/findings/${finding.id}`} className="text-primary-600 hover:underline">{finding.id}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{finding.auditId}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{finding.clause}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
                      <p className="truncate">{finding.description}</p>
                      {finding.evidence && (
                        <p className="text-xs text-gray-400 mt-1 truncate">Evidence: {finding.evidence}</p>
                      )}
                    </td>
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

        {/* Finding Detail Cards for Open Items */}
        <h3 className="text-sm font-semibold text-gray-900">Open Finding Details</h3>
        <div className="space-y-4">
          {openFindings.map((finding) => (
            <div key={finding.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-semibold text-gray-900">{finding.id}</span>
                  <FindingSeverityBadge severity={finding.severity} />
                  <FindingStatusBadge status={finding.status} />
                </div>
                <span className="text-xs text-gray-500">Target: {formatDate(finding.targetDate)}</span>
              </div>
              <p className="text-sm text-gray-800 mb-2">{finding.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-medium text-gray-700">Evidence:</p>
                  <p className="text-gray-600">{finding.evidence || "Pending collection"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Root Cause:</p>
                  <p className="text-gray-600">{finding.rootCause || "Under investigation"}</p>
                </div>
                {finding.correctiveAction && (
                  <div className="md:col-span-2">
                    <p className="font-medium text-gray-700">Corrective Action Plan:</p>
                    <p className="text-gray-600 whitespace-pre-line">{finding.correctiveAction}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t text-xs text-gray-500">
                <span>Audit: {finding.auditId}</span>
                <span>Clause: {finding.clause}</span>
                <span>Responsible: {finding.responsiblePerson}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Tab: Corrective Actions
  // ---------------------------------------------------------------------------
  const renderCorrectiveActions = () => {
    const caCounts = {
      total: correctiveActions.length,
      planned: correctiveActions.filter((c) => c.status === "Planned").length,
      inProgress: correctiveActions.filter((c) => c.status === "In Progress").length,
      completed: correctiveActions.filter((c) => c.status === "Completed").length,
      verified: correctiveActions.filter((c) => c.status === "Verified").length,
      overdue: correctiveActions.filter((c) => c.status === "Overdue").length,
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Corrective Action Tracking</h2>
          <button className="btn-primary text-sm">+ New Corrective Action</button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Total", count: caCounts.total, color: "text-gray-700" },
            { label: "Planned", count: caCounts.planned, color: "text-blue-600" },
            { label: "In Progress", count: caCounts.inProgress, color: "text-yellow-600" },
            { label: "Completed", count: caCounts.completed, color: "text-green-600" },
            { label: "Verified", count: caCounts.verified, color: "text-emerald-600" },
            { label: "Overdue", count: caCounts.overdue, color: "text-red-600" },
          ].map((item) => (
            <div key={item.label} className="card text-center">
              <p className="text-xs text-gray-500 uppercase">{item.label}</p>
              <p className={cn("text-2xl font-bold mt-1", item.color)}>{item.count}</p>
            </div>
          ))}
        </div>

        {/* CA Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CA ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Finding</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Verification</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {correctiveActions.map((ca) => (
                  <tr key={ca.id} className={cn("hover:bg-gray-50", ca.status === "Overdue" && "bg-red-50")}>
                    <td className="px-4 py-3 text-sm font-mono text-primary-600">{ca.id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{ca.findingId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{ca.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ca.responsiblePerson}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ca.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ca.targetDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ca.completedDate ? formatDate(ca.completedDate) : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", caStatusStyles[ca.status])}>{ca.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "badge",
                        ca.verificationStatus === "Verified" ? "bg-emerald-100 text-emerald-700" :
                        ca.verificationStatus === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-500"
                      )}>
                        {ca.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Notes */}
        <div className="space-y-3">
          {correctiveActions.filter((ca) => ca.status === "Overdue" || ca.status === "In Progress").map((ca) => (
            <div key={ca.id} className={cn("card border-l-4", ca.status === "Overdue" ? "border-l-red-500" : "border-l-yellow-500")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold">{ca.id}</span>
                  <span className={cn("badge", caStatusStyles[ca.status])}>{ca.status}</span>
                </div>
                <span className="text-xs text-gray-500">Due: {formatDate(ca.targetDate)}</span>
              </div>
              <p className="text-sm text-gray-800 mb-1">{ca.description}</p>
              <p className="text-xs text-gray-500">Responsible: {ca.responsiblePerson} ({ca.department})</p>
              {ca.notes && <p className="text-xs text-gray-600 mt-2 italic">Notes: {ca.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Tab: Audit Reports
  // ---------------------------------------------------------------------------
  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Audit Reports</h2>
        <button className="btn-primary text-sm">+ Generate Report</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Report ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Audit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pages</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-primary-600">{report.id}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{report.auditId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{report.title}</td>
                  <td className="px-4 py-3"><span className="badge bg-primary-50 text-primary-700">{report.standard}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{report.author}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(report.createdDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {report.findingsCount.major > 0 && <span className="badge bg-red-100 text-red-700">{report.findingsCount.major} Maj</span>}
                      {report.findingsCount.minor > 0 && <span className="badge bg-orange-100 text-orange-700">{report.findingsCount.minor} Min</span>}
                      {report.findingsCount.observation > 0 && <span className="badge bg-yellow-100 text-yellow-700">{report.findingsCount.observation} Obs</span>}
                      {report.findingsCount.ofi > 0 && <span className="badge bg-blue-100 text-blue-700">{report.findingsCount.ofi} OFI</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{report.pages}</td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", reportStatusStyles[report.status])}>{report.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="text-xs text-primary-600 hover:underline">View</button>
                      {report.status === "Draft" && <button className="text-xs text-yellow-600 hover:underline ml-2">Edit</button>}
                      {(report.status === "Approved" || report.status === "Issued") && <button className="text-xs text-green-600 hover:underline ml-2">PDF</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {auditReports.map((report) => (
          <div key={report.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono font-semibold text-gray-900">{report.id}</span>
              <span className={cn("badge", reportStatusStyles[report.status])}>{report.status}</span>
            </div>
            <p className="text-sm text-gray-800 mb-3">{report.title}</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div><span className="font-medium text-gray-700">Author:</span> {report.author}</div>
              <div><span className="font-medium text-gray-700">Created:</span> {formatDate(report.createdDate)}</div>
              <div><span className="font-medium text-gray-700">Reviewed by:</span> {report.reviewedBy || "Pending"}</div>
              <div><span className="font-medium text-gray-700">Approved by:</span> {report.approvedBy || "Pending"}</div>
            </div>
            <div className="flex gap-1 mt-3 pt-2 border-t">
              {report.findingsCount.major > 0 && <span className="badge bg-red-100 text-red-700">{report.findingsCount.major} Major NC</span>}
              {report.findingsCount.minor > 0 && <span className="badge bg-orange-100 text-orange-700">{report.findingsCount.minor} Minor NC</span>}
              {report.findingsCount.observation > 0 && <span className="badge bg-yellow-100 text-yellow-700">{report.findingsCount.observation} Obs</span>}
              {report.findingsCount.ofi > 0 && <span className="badge bg-blue-100 text-blue-700">{report.findingsCount.ofi} OFI</span>}
              <span className="badge bg-gray-100 text-gray-600 ml-auto">{report.pages} pages</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Tab: Trend Analysis
  // ---------------------------------------------------------------------------
  const renderTrends = () => {
    const maxTotal = Math.max(...departmentTrendData.map((d) => d.total));

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Audit Trend Analysis</h2>
          <span className="text-xs text-gray-500">Data period: Oct 2025 - Mar 2026</span>
        </div>

        {/* Charts from imported data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FindingsTrendChart data={auditMetrics.findingsByMonth} />
          <ClosureRateChart data={auditMetrics.closureRate} />
        </div>

        {/* Findings by Department */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Findings by Department</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Major NC</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Minor NC</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Observation</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">OFI</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-48">Distribution</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentTrendData.map((dept) => (
                  <tr key={dept.department} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{dept.department}</td>
                    <td className="px-4 py-3 text-sm">
                      {dept.majorNC > 0 ? <span className="badge bg-red-100 text-red-700">{dept.majorNC}</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {dept.minorNC > 0 ? <span className="badge bg-orange-100 text-orange-700">{dept.minorNC}</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {dept.observation > 0 ? <span className="badge bg-yellow-100 text-yellow-700">{dept.observation}</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {dept.ofi > 0 ? <span className="badge bg-blue-100 text-blue-700">{dept.ofi}</span> : <span className="text-gray-400">0</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{dept.total}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5 h-4">
                        {dept.majorNC > 0 && (
                          <div
                            className="bg-red-500 rounded-l"
                            style={{ width: `${(dept.majorNC / maxTotal) * 100}%` }}
                            title={`Major NC: ${dept.majorNC}`}
                          />
                        )}
                        {dept.minorNC > 0 && (
                          <div
                            className="bg-orange-500"
                            style={{ width: `${(dept.minorNC / maxTotal) * 100}%` }}
                            title={`Minor NC: ${dept.minorNC}`}
                          />
                        )}
                        {dept.observation > 0 && (
                          <div
                            className="bg-yellow-500"
                            style={{ width: `${(dept.observation / maxTotal) * 100}%` }}
                            title={`Observation: ${dept.observation}`}
                          />
                        )}
                        {dept.ofi > 0 && (
                          <div
                            className="bg-blue-500 rounded-r"
                            style={{ width: `${(dept.ofi / maxTotal) * 100}%` }}
                            title={`OFI: ${dept.ofi}`}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-3 pt-2 border-t text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Major NC</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500 inline-block" /> Minor NC</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Observation</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> OFI</span>
          </div>
        </div>

        {/* Recurring Findings */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recurring Findings Analysis</h3>
          <p className="text-xs text-gray-500 mb-4">Findings that have been identified multiple times across audits, indicating potential systemic issues.</p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Finding Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Occurrences</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Found</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departments Affected</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recurrenceData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.finding}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{item.occurrences}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: item.occurrences }).map((_, i) => (
                            <span key={i} className={cn("w-2 h-2 rounded-full", riskLevelStyles[item.riskLevel].includes("red") ? "bg-red-400" : riskLevelStyles[item.riskLevel].includes("yellow") ? "bg-yellow-400" : "bg-green-400")} />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.lastFound)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.departments.map((dept) => (
                          <span key={dept} className="badge bg-gray-100 text-gray-700">{dept}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", riskLevelStyles[item.riskLevel])}>{item.riskLevel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border-l-4 border-l-red-500">
            <p className="text-xs font-medium text-gray-700 uppercase">Highest Risk Area</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">PV Testing Laboratory</p>
            <p className="text-xs text-gray-500 mt-1">11 total findings (2 Major NCs)</p>
          </div>
          <div className="card border-l-4 border-l-yellow-500">
            <p className="text-xs font-medium text-gray-700 uppercase">Most Recurring Issue</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">Personnel Competency Gaps</p>
            <p className="text-xs text-gray-500 mt-1">4 occurrences across 2 departments</p>
          </div>
          <div className="card border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-700 uppercase">Systemic Root Cause</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">Change Management Process</p>
            <p className="text-xs text-gray-500 mt-1">Linked to 3 recurring finding types</p>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Tab content dispatcher
  // ---------------------------------------------------------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "planning": return renderPlanning();
      case "checklists": return renderChecklists();
      case "findings": return renderFindings();
      case "corrective-actions": return renderCorrectiveActions();
      case "reports": return renderReports();
      case "trends": return renderTrends();
      default: return renderDashboard();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Management</h1>
        <div className="flex gap-2">
          <Link href="/audit/plans" className="btn-secondary text-sm">View All Plans</Link>
          <Link href="/audit/findings" className="btn-secondary text-sm">View Findings</Link>
          <Link href="/audit/car" className="btn-primary text-sm">CAR/8D Reports</Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
              activeTab === tab.key
                ? "bg-white text-primary-700 border border-gray-200 border-b-white -mb-px"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
