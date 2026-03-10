"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleReports } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Inline mock data
// ---------------------------------------------------------------------------

const reportTemplates = [
  {
    id: "tpl-001",
    name: "Test Report - IEC 61215",
    standard: "IEC 61215:2021",
    category: "Test Report",
    description:
      "Design qualification and type approval test report for crystalline silicon terrestrial photovoltaic modules.",
    fields: [
      "Report Number",
      "Module Identification",
      "Manufacturer Details",
      "Test Sequence & Clause Ref",
      "Pre/Post Test I-V Data",
      "Visual Inspection Records",
      "Environmental Conditions",
      "Uncertainty Statement",
      "Pass/Fail Verdict per MQT",
      "Signatures & Approval",
    ],
    lastUpdated: "2026-02-10",
    version: "3.1",
  },
  {
    id: "tpl-002",
    name: "Calibration Certificate - ISO 17025",
    standard: "ISO/IEC 17025:2017",
    category: "Calibration Certificate",
    description:
      "Accredited calibration certificate template for reference cells, pyranometers, and measurement instruments.",
    fields: [
      "Certificate Number",
      "Instrument Identification",
      "Calibration Method & Procedure",
      "Environmental Conditions",
      "Measurement Results & Uncertainty",
      "Traceability Statement",
      "Calibration Interval Recommendation",
      "Accreditation Body Logo & Scope",
      "Authorized Signatory",
    ],
    lastUpdated: "2026-01-22",
    version: "2.4",
  },
  {
    id: "tpl-003",
    name: "Audit Report",
    standard: "ISO 9001 / ISO 17025",
    category: "Audit Report",
    description:
      "Internal and external audit report template covering system, process, and technical audits.",
    fields: [
      "Audit Number & Scope",
      "Audit Team & Auditee",
      "Checklist / Clause Reference",
      "Findings (NC / OFI / Observation)",
      "Objective Evidence",
      "Risk Classification",
      "CAPA Linkage",
      "Auditor Conclusion",
      "Approval & Distribution",
    ],
    lastUpdated: "2026-02-18",
    version: "1.7",
  },
  {
    id: "tpl-004",
    name: "Management Review Minutes",
    standard: "ISO 17025 Clause 8.9",
    category: "Management Review",
    description:
      "Template for recording management review meeting inputs, outputs, decisions, and action items.",
    fields: [
      "Meeting Date & Attendees",
      "Review of Previous Actions",
      "Quality Objectives Status",
      "Audit & CAPA Summary",
      "Customer Feedback Analysis",
      "Resource & Training Needs",
      "Risk & Opportunity Register",
      "Decisions & Action Items",
      "Next Review Date",
    ],
    lastUpdated: "2026-03-01",
    version: "1.2",
  },
];

const signatureRecords = [
  {
    id: "sig-001",
    reportNumber: "TR-2026-0042",
    reportTitle: "IEC 61215 Design Qualification - Module Type A",
    preparedBy: { name: "Ravi Kumar", role: "Sr. Lab Technician", date: "2026-02-28", status: "signed" as const },
    reviewedBy: { name: "Priya Sharma", role: "Lab Manager", date: "2026-03-02", status: "signed" as const },
    approvedBy: { name: "Dr. Anand Mehta", role: "Lab Director", date: "2026-03-05", status: "signed" as const },
  },
  {
    id: "sig-002",
    reportNumber: "TR-2026-0043",
    reportTitle: "IEC 61730 Safety Qualification - Module Type A",
    preparedBy: { name: "Ravi Kumar", role: "Sr. Lab Technician", date: "2026-03-06", status: "signed" as const },
    reviewedBy: { name: "Priya Sharma", role: "Lab Manager", date: "", status: "pending" as const },
    approvedBy: { name: "Dr. Anand Mehta", role: "Lab Director", date: "", status: "awaiting" as const },
  },
  {
    id: "sig-003",
    reportNumber: "TR-2026-0044",
    reportTitle: "IEC 61853 Energy Rating - Module Type B",
    preparedBy: { name: "Suresh Iyer", role: "Lab Technician", date: "2026-03-08", status: "signed" as const },
    reviewedBy: { name: "Priya Sharma", role: "Lab Manager", date: "", status: "awaiting" as const },
    approvedBy: { name: "Dr. Anand Mehta", role: "Lab Director", date: "", status: "awaiting" as const },
  },
  {
    id: "sig-004",
    reportNumber: "CAL-2026-0118",
    reportTitle: "Reference Cell Calibration Certificate",
    preparedBy: { name: "Meena Joshi", role: "Calibration Technician", date: "2026-02-15", status: "signed" as const },
    reviewedBy: { name: "Priya Sharma", role: "Lab Manager", date: "2026-02-17", status: "signed" as const },
    approvedBy: { name: "Dr. Anand Mehta", role: "Lab Director", date: "2026-02-18", status: "signed" as const },
  },
  {
    id: "sig-005",
    reportNumber: "AUD-2026-0009",
    reportTitle: "Internal Audit Report - Q1 2026",
    preparedBy: { name: "Vikram Desai", role: "Lead Auditor", date: "2026-03-03", status: "signed" as const },
    reviewedBy: { name: "Dr. Anand Mehta", role: "Lab Director", date: "2026-03-04", status: "signed" as const },
    approvedBy: { name: "Rajesh Patel", role: "Quality Head", date: "", status: "pending" as const },
  },
];

type ClauseStatus = "covered" | "partial" | "not_covered";

interface ComplianceRow {
  standard: string;
  fullName: string;
  clauses: { clause: string; title: string; status: ClauseStatus }[];
}

const complianceMatrix: ComplianceRow[] = [
  {
    standard: "IEC 61215:2021",
    fullName: "Design Qualification & Type Approval",
    clauses: [
      { clause: "MQT 01", title: "Visual Inspection", status: "covered" },
      { clause: "MQT 02", title: "Maximum Power at STC", status: "covered" },
      { clause: "MQT 03", title: "Insulation Test", status: "covered" },
      { clause: "MQT 04", title: "Temperature Coefficients", status: "covered" },
      { clause: "MQT 05", title: "NMOT Determination", status: "covered" },
      { clause: "MQT 06", title: "Performance at STC/NMOT", status: "covered" },
      { clause: "MQT 07", title: "Hot-Spot Endurance", status: "covered" },
      { clause: "MQT 08", title: "UV Preconditioning", status: "covered" },
      { clause: "MQT 09", title: "Thermal Cycling TC200", status: "covered" },
      { clause: "MQT 10", title: "Humidity-Freeze HF10", status: "covered" },
      { clause: "MQT 11", title: "Damp Heat DH1000", status: "covered" },
      { clause: "MQT 12", title: "Robustness of Terminations", status: "covered" },
      { clause: "MQT 13", title: "Wet Leakage Current", status: "covered" },
      { clause: "MQT 14", title: "Mechanical Load", status: "covered" },
      { clause: "MQT 15", title: "Hail Test", status: "covered" },
      { clause: "MQT 16", title: "Bypass Diode Thermal", status: "covered" },
      { clause: "MQT 17", title: "Static Mechanical Load", status: "covered" },
    ],
  },
  {
    standard: "IEC 61730:2016",
    fullName: "PV Module Safety Qualification",
    clauses: [
      { clause: "MST 01", title: "Visual Inspection", status: "covered" },
      { clause: "MST 02", title: "Accessibility Test", status: "covered" },
      { clause: "MST 03", title: "Cut Susceptibility", status: "covered" },
      { clause: "MST 04", title: "Ground Continuity", status: "covered" },
      { clause: "MST 05", title: "Impulse Voltage", status: "covered" },
      { clause: "MST 06", title: "Dielectric Withstand", status: "covered" },
      { clause: "MST 07", title: "Wet Leakage Current", status: "covered" },
      { clause: "MST 08", title: "Temperature Test", status: "covered" },
      { clause: "MST 09", title: "Hot-Spot Test (Safety)", status: "covered" },
      { clause: "MST 10", title: "Reverse Current Overload", status: "covered" },
      { clause: "MST 11", title: "Module Breakage", status: "covered" },
      { clause: "MST 12", title: "Fire Test", status: "covered" },
    ],
  },
  {
    standard: "IEC 61853:2018",
    fullName: "PV Module Energy Rating",
    clauses: [
      { clause: "Clause 7", title: "Power Rating Matrix", status: "covered" },
      { clause: "Clause 8", title: "Energy Rating (CSER)", status: "covered" },
      { clause: "Clause 9", title: "Spectral Response", status: "covered" },
      { clause: "Clause 10", title: "Angular Response (IAM)", status: "covered" },
      { clause: "Clause 11", title: "Temperature Coefficients", status: "covered" },
    ],
  },
  {
    standard: "IEC 61701:2020",
    fullName: "Salt Mist Corrosion Testing",
    clauses: [
      { clause: "Sev 1", title: "Severity 1 (4 cycles)", status: "covered" },
      { clause: "Sev 2", title: "Severity 2 (8 cycles)", status: "partial" },
      { clause: "Sev 3", title: "Severity 3 (16 cycles)", status: "partial" },
      { clause: "Sev 6", title: "Severity 6 (96 cycles)", status: "covered" },
    ],
  },
  {
    standard: "IEC 62716:2013",
    fullName: "Ammonia Corrosion Resistance",
    clauses: [
      { clause: "Clause 7", title: "Ammonia Exposure Test", status: "covered" },
    ],
  },
  {
    standard: "IEC 60904",
    fullName: "PV Device Measurement Procedures",
    clauses: [
      { clause: "60904-1", title: "I-V Measurement", status: "covered" },
      { clause: "60904-2", title: "Reference Device Requirements", status: "covered" },
      { clause: "60904-3", title: "Spectral Irradiance Data", status: "partial" },
      { clause: "60904-7", title: "Spectral Mismatch Correction", status: "covered" },
      { clause: "60904-9", title: "Sun Simulator Classification", status: "covered" },
      { clause: "60904-10", title: "Linearity Measurement", status: "not_covered" },
    ],
  },
  {
    standard: "ISO/IEC 17025:2017",
    fullName: "General Requirements for Competence of Testing & Calibration Labs",
    clauses: [
      { clause: "4.1", title: "Impartiality", status: "covered" },
      { clause: "4.2", title: "Confidentiality", status: "covered" },
      { clause: "6.2", title: "Personnel Competence", status: "covered" },
      { clause: "6.4", title: "Equipment", status: "covered" },
      { clause: "6.5", title: "Metrological Traceability", status: "covered" },
      { clause: "7.2", title: "Selection & Validation of Methods", status: "partial" },
      { clause: "7.5", title: "Technical Records", status: "covered" },
      { clause: "7.6", title: "Uncertainty of Measurement", status: "covered" },
      { clause: "7.7", title: "Validity of Results", status: "partial" },
      { clause: "7.8", title: "Reporting of Results", status: "covered" },
      { clause: "8.5", title: "Actions to Address Risks", status: "partial" },
      { clause: "8.7", title: "Control of Data & Information", status: "covered" },
      { clause: "8.9", title: "Management Reviews", status: "covered" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const tabs = [
  { key: "registry", label: "Report Registry" },
  { key: "templates", label: "Templates" },
  { key: "generate", label: "Generate" },
  { key: "signatures", label: "Digital Signatures" },
  { key: "compliance", label: "Compliance Matrix" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  pending_review: "#eab308",
  approved: "#22c55e",
  issued: "#3b82f6",
};

const signatureStatusStyles: Record<string, string> = {
  signed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  awaiting: "bg-gray-100 text-gray-500",
};

const clauseStatusStyles: Record<ClauseStatus, string> = {
  covered: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  not_covered: "bg-red-100 text-red-800",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("registry");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStandard, setFilterStandard] = useState("all");

  // Stats
  const approved = sampleReports.filter((r) => r.status === "approved").length;
  const pending = sampleReports.filter((r) => r.status === "pending_review").length;
  const drafts = sampleReports.filter((r) => r.status === "draft").length;

  // Filtered reports
  const filteredReports = sampleReports.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.reportNumber.toLowerCase().includes(q) ||
      r.manufacturer.toLowerCase().includes(q) ||
      r.standard.toLowerCase().includes(q);
    const matchesType = filterType === "all" || r.reportType === filterType;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesStandard = filterStandard === "all" || r.standard === filterStandard;
    return matchesSearch && matchesType && matchesStatus && matchesStandard;
  });

  // Unique values for filter dropdowns
  const reportTypes = Array.from(new Set(sampleReports.map((r) => r.reportType)));
  const standards = Array.from(new Set(sampleReports.map((r) => r.standard)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Reports</h1>
          <p className="text-muted-foreground mt-1">
            Automated ISO 17025 compliant test report generation
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reports</CardDescription>
            <CardTitle className="text-3xl">{sampleReports.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{drafts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
              activeTab === tab.key
                ? "bg-background border border-b-0 border-border text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB: Report Registry                                           */}
      {/* ============================================================== */}
      {activeTab === "registry" && (
        <div className="space-y-4">
          {/* Search + Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-64"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Types</option>
              {reportTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="issued">Issued</option>
            </select>
            <select
              value={filterStandard}
              onChange={(e) => setFilterStandard(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Standards</option>
              {standards.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Report List */}
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reports match the current filters.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const passCount = report.testResults.filter((t) => t.result === "pass").length;
                const totalCount = report.testResults.length;
                return (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm text-muted-foreground">
                                {report.reportNumber}
                              </span>
                              <Badge
                                style={{
                                  backgroundColor:
                                    (statusColors[report.status] || "#6b7280") + "20",
                                  color: statusColors[report.status],
                                }}
                              >
                                {report.status.replace("_", " ").toUpperCase()}
                              </Badge>
                              <Badge
                                variant={
                                  report.testResults.every((t) => t.result !== "fail")
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {report.testResults.every((t) => t.result !== "fail")
                                  ? "PASS"
                                  : "FAIL"}
                              </Badge>
                            </div>
                            <h3 className="font-medium mt-1">{report.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>{report.standard}</span>
                              <span>Module: {report.moduleId}</span>
                              <span>{report.manufacturer}</span>
                              <span>
                                {passCount}/{totalCount} passed
                              </span>
                              <span>Updated: {report.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: Templates                                                 */}
      {/* ============================================================== */}
      {activeTab === "templates" && (
        <div className="grid gap-6 md:grid-cols-2">
          {reportTemplates.map((tpl) => (
            <Card key={tpl.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tpl.name}</CardTitle>
                  <Badge variant="outline">v{tpl.version}</Badge>
                </div>
                <CardDescription>{tpl.standard}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{tpl.description}</p>
                <div>
                  <p className="text-sm font-medium mb-2">Template Fields</p>
                  <ul className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
                    {tpl.fields.map((field) => (
                      <li key={field} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Last updated: {tpl.lastUpdated}
                  </span>
                  <Button size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: Generate                                                  */}
      {/* ============================================================== */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>
                Auto-populate a new report from existing test data in the LIMS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Template Selection */}
              <div>
                <label className="text-sm font-medium block mb-1">Report Template</label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select a template...</option>
                  {reportTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Module / Sample */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Module / Sample ID</label>
                  <input
                    type="text"
                    placeholder="e.g. MOD-2026-0145"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Test Standard</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Select standard...</option>
                    <option value="IEC 61215:2021">IEC 61215:2021</option>
                    <option value="IEC 61730:2016">IEC 61730:2016</option>
                    <option value="IEC 61853:2018">IEC 61853:2018</option>
                    <option value="IEC 60904">IEC 60904</option>
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Test Date From</label>
                  <input
                    type="date"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Test Date To</label>
                  <input
                    type="date"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Include Sections</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {[
                    "Test Results",
                    "Uncertainty Statements",
                    "Visual Inspection Photos",
                    "Equipment Used",
                    "Environmental Conditions",
                    "I-V Curves",
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              {/* Available Test Data Preview */}
              <div>
                <p className="text-sm font-medium mb-2">Available Test Data (from LIMS)</p>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Module</th>
                        <th className="p-2 text-left font-medium">Standard</th>
                        <th className="p-2 text-left font-medium">Tests</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleReports.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="p-2 font-mono text-xs">{r.moduleId}</td>
                          <td className="p-2">{r.standard}</td>
                          <td className="p-2">{r.testResults.length} tests</td>
                          <td className="p-2">
                            <Badge
                              style={{
                                backgroundColor:
                                  (statusColors[r.status] || "#6b7280") + "20",
                                color: statusColors[r.status],
                              }}
                            >
                              {r.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Button variant="outline" size="sm">
                              Select
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button>Generate Report</Button>
                <Button variant="outline">Preview</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: Digital Signatures                                        */}
      {/* ============================================================== */}
      {activeTab === "signatures" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Three-stage signoff chain: Prepared By &rarr; Reviewed By &rarr; Approved By
              </CardDescription>
            </CardHeader>
          </Card>

          {signatureRecords.map((sig) => {
            const steps = [
              { label: "Prepared By", ...sig.preparedBy },
              { label: "Reviewed By", ...sig.reviewedBy },
              { label: "Approved By", ...sig.approvedBy },
            ];
            const completedCount = steps.filter((s) => s.status === "signed").length;
            return (
              <Card key={sig.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="font-mono text-sm text-muted-foreground">
                        {sig.reportNumber}
                      </span>
                      <h3 className="font-medium">{sig.reportTitle}</h3>
                    </div>
                    <Badge
                      variant={completedCount === 3 ? "default" : "outline"}
                      className={
                        completedCount === 3
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {completedCount}/3 Signed
                    </Badge>
                  </div>

                  {/* Signoff Chain */}
                  <div className="flex items-start gap-0">
                    {steps.map((step, idx) => (
                      <div key={step.label} className="flex items-start flex-1">
                        <div className="flex flex-col items-center flex-1">
                          {/* Circle */}
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2",
                              step.status === "signed"
                                ? "border-green-500 bg-green-50 text-green-700"
                                : step.status === "pending"
                                ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                                : "border-gray-300 bg-gray-50 text-gray-400"
                            )}
                          >
                            {step.status === "signed" ? "\u2713" : idx + 1}
                          </div>
                          {/* Details */}
                          <p className="text-xs font-medium mt-2 text-center">{step.label}</p>
                          <p className="text-xs text-muted-foreground text-center">{step.name}</p>
                          <p className="text-xs text-muted-foreground text-center">{step.role}</p>
                          {step.date && (
                            <p className="text-xs text-muted-foreground text-center">{step.date}</p>
                          )}
                          <Badge
                            variant="outline"
                            className={cn(
                              "mt-1 text-[10px] px-1.5 py-0",
                              signatureStatusStyles[step.status]
                            )}
                          >
                            {step.status.toUpperCase()}
                          </Badge>
                        </div>
                        {/* Connector line */}
                        {idx < steps.length - 1 && (
                          <div className="flex items-center pt-5 -mx-2">
                            <div
                              className={cn(
                                "h-0.5 w-12",
                                step.status === "signed" ? "bg-green-400" : "bg-gray-200"
                              )}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: Compliance Matrix                                         */}
      {/* ============================================================== */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standards Compliance Matrix</CardTitle>
              <CardDescription>
                Clause-by-clause coverage status across all applicable IEC/ISO standards
              </CardDescription>
            </CardHeader>
          </Card>

          {complianceMatrix.map((row) => {
            const covered = row.clauses.filter((c) => c.status === "covered").length;
            const partial = row.clauses.filter((c) => c.status === "partial").length;
            const notCovered = row.clauses.filter((c) => c.status === "not_covered").length;
            const pct = Math.round(
              ((covered + partial * 0.5) / row.clauses.length) * 100
            );
            return (
              <Card key={row.standard}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{row.standard}</CardTitle>
                      <CardDescription>{row.fullName}</CardDescription>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-green-700 font-medium">{covered} covered</span>
                      <span className="text-yellow-700 font-medium">{partial} partial</span>
                      <span className="text-red-700 font-medium">{notCovered} gaps</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          pct >= 80
                            ? "border-green-500 text-green-700"
                            : pct >= 50
                            ? "border-yellow-500 text-yellow-700"
                            : "border-red-500 text-red-700"
                        )}
                      >
                        {pct}%
                      </Badge>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-green-500 h-full"
                        style={{
                          width: `${(covered / row.clauses.length) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-yellow-400 h-full"
                        style={{
                          width: `${(partial / row.clauses.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left font-medium w-28">Clause</th>
                          <th className="p-2 text-left font-medium">Title</th>
                          <th className="p-2 text-left font-medium w-32">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.clauses.map((clause) => (
                          <tr key={clause.clause} className="border-b last:border-0">
                            <td className="p-2 font-mono text-xs">{clause.clause}</td>
                            <td className="p-2">{clause.title}</td>
                            <td className="p-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  clauseStatusStyles[clause.status]
                                )}
                              >
                                {clause.status === "not_covered"
                                  ? "NOT COVERED"
                                  : clause.status.toUpperCase()}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
