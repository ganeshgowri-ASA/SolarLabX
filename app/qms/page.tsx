"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatDate, getStatusColor } from "@/lib/utils";
import type { QMSDocument, CAPA } from "@/lib/types";
import { mockComplianceRequirements } from "@/lib/mock-data";

// ============================================================================
// Inline Mock Data for Enhanced QMS
// ============================================================================

interface NCR {
  id: string;
  ncrNumber: string;
  title: string;
  source: string;
  status: "Open" | "Under Investigation" | "Disposition Decided" | "Closed";
  severity: "Critical" | "Major" | "Minor";
  disposition: "Scrap" | "Rework" | "Use As-Is" | "Return to Supplier" | "Pending";
  department: string;
  raisedBy: string;
  raisedDate: string;
  description: string;
  rootCause: string;
  linkedCapa: string;
}

const mockNCRs: NCR[] = [
  {
    id: "NCR-2026-001",
    ncrNumber: "NCR-2026-001",
    title: "EL Camera Sensor Drift Beyond Tolerance",
    source: "Calibration Check",
    status: "Under Investigation",
    severity: "Major",
    disposition: "Pending",
    department: "PV Testing Lab",
    raisedBy: "Raj Krishnan",
    raisedDate: "2026-03-05",
    description: "EL camera sensor (Asset #ELC-003) showing 3.2% drift in pixel intensity calibration, exceeding ±2% tolerance. Detected during routine monthly verification.",
    rootCause: "Sensor aging beyond expected rate, possibly due to high UV exposure during recent extended test campaign.",
    linkedCapa: "CAPA-2026-003",
  },
  {
    id: "NCR-2026-002",
    ncrNumber: "NCR-2026-002",
    title: "Test Chamber Temperature Overshoot",
    source: "Test Execution",
    status: "Disposition Decided",
    severity: "Critical",
    disposition: "Rework",
    department: "Environmental Testing",
    raisedBy: "Vikram Singh",
    raisedDate: "2026-03-02",
    description: "Thermal cycling chamber TC-02 exceeded +87°C during cycle 45 of IEC 61215 TC200 test (spec: +85°C ±2°C). Two modules affected.",
    rootCause: "Faulty PID controller tuning after recent maintenance. Proportional gain set too high.",
    linkedCapa: "CAPA-2026-004",
  },
  {
    id: "NCR-2026-003",
    ncrNumber: "NCR-2026-003",
    title: "Reference Cell Certificate Expired",
    source: "Internal Audit",
    status: "Open",
    severity: "Major",
    disposition: "Pending",
    department: "Calibration Lab",
    raisedBy: "Anil Mehta",
    raisedDate: "2026-03-07",
    description: "Reference cell RC-Mono-02 calibration certificate expired on 2026-02-28. Cell was used for 3 I-V measurements on 2026-03-01 and 2026-03-03.",
    rootCause: "",
    linkedCapa: "",
  },
  {
    id: "NCR-2026-004",
    ncrNumber: "NCR-2026-004",
    title: "Incorrect Test Sequence Applied to Module",
    source: "Peer Review",
    status: "Closed",
    severity: "Minor",
    disposition: "Use As-Is",
    department: "PV Testing Lab",
    raisedBy: "Priya Sharma",
    raisedDate: "2026-02-20",
    description: "Module MOD-2026-0137 received humidity freeze test before thermal cycling, contrary to IEC 61215 test sequence A. Module integrity verified post-test.",
    rootCause: "Technician followed outdated test plan revision. Latest revision not distributed to workstation.",
    linkedCapa: "CAPA-2026-002",
  },
  {
    id: "NCR-2026-005",
    ncrNumber: "NCR-2026-005",
    title: "Incoming Material - Thermocouple Wire Out of Spec",
    source: "Goods Inspection",
    status: "Closed",
    severity: "Minor",
    disposition: "Return to Supplier",
    department: "Procurement",
    raisedBy: "Lab Technician",
    raisedDate: "2026-02-15",
    description: "Type T thermocouple wire batch TC-2026-B02 failed incoming inspection. Resistance measured 5.8% above nominal, exceeding IEC 60584 special tolerance.",
    rootCause: "Supplier manufacturing defect. Wrong wire gauge used.",
    linkedCapa: "",
  },
];

interface TrainingRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  qualifications: string[];
  certifications: { name: string; validUntil: string; status: "Valid" | "Expiring Soon" | "Expired" }[];
  trainings: { name: string; completedDate: string; nextDue: string; status: "Current" | "Due Soon" | "Overdue" }[];
}

const mockTrainingRecords: TrainingRecord[] = [
  {
    id: "EMP-001", name: "Dr. Ramesh Kumar", role: "Lead Auditor", department: "Quality",
    qualifications: ["Ph.D. Materials Science", "ISO 17025 Lead Auditor"],
    certifications: [
      { name: "IRCA Lead Auditor - ISO 9001", validUntil: "2027-06-15", status: "Valid" },
      { name: "NABL Assessor", validUntil: "2026-12-31", status: "Valid" },
    ],
    trainings: [
      { name: "ISO 17025:2017 Updates", completedDate: "2025-11-10", nextDue: "2026-11-10", status: "Current" },
      { name: "Root Cause Analysis (8D)", completedDate: "2025-06-15", nextDue: "2026-06-15", status: "Current" },
    ],
  },
  {
    id: "EMP-002", name: "Vikram Singh", role: "Lab Manager", department: "PV Testing Lab",
    qualifications: ["M.Tech Solar Energy", "IEC 61215 Test Specialist"],
    certifications: [
      { name: "IEC 61215/61730 Test Engineer", validUntil: "2026-09-30", status: "Valid" },
    ],
    trainings: [
      { name: "Measurement Uncertainty (GUM)", completedDate: "2025-08-20", nextDue: "2026-08-20", status: "Current" },
      { name: "Environmental Chamber Operation", completedDate: "2025-03-10", nextDue: "2026-03-10", status: "Due Soon" },
      { name: "I-V Curve Measurement Technique", completedDate: "2024-12-01", nextDue: "2025-12-01", status: "Overdue" },
    ],
  },
  {
    id: "EMP-003", name: "Priya Sharma", role: "Quality Manager", department: "Quality",
    qualifications: ["M.Sc. Physics", "Six Sigma Green Belt"],
    certifications: [
      { name: "ISO 9001 Lead Auditor", validUntil: "2026-05-20", status: "Valid" },
      { name: "Six Sigma Green Belt", validUntil: "2028-01-01", status: "Valid" },
    ],
    trainings: [
      { name: "CAPA Management", completedDate: "2025-09-05", nextDue: "2026-09-05", status: "Current" },
      { name: "Document Control Best Practices", completedDate: "2025-07-20", nextDue: "2026-07-20", status: "Current" },
    ],
  },
  {
    id: "EMP-004", name: "Anil Mehta", role: "Senior Technician", department: "Calibration Lab",
    qualifications: ["B.Tech Electronics", "Calibration Specialist"],
    certifications: [
      { name: "NABL Calibration Technician", validUntil: "2026-03-15", status: "Expiring Soon" },
    ],
    trainings: [
      { name: "Pyranometer Calibration per ISO 9847", completedDate: "2025-04-10", nextDue: "2026-04-10", status: "Current" },
      { name: "Reference Cell Calibration", completedDate: "2024-11-20", nextDue: "2025-11-20", status: "Overdue" },
    ],
  },
  {
    id: "EMP-005", name: "Kavitha Nair", role: "Lab Technician", department: "PV Testing Lab",
    qualifications: ["B.Tech Electrical Engineering"],
    certifications: [],
    trainings: [
      { name: "IEC 61215 Test Procedures", completedDate: "2025-10-15", nextDue: "2026-10-15", status: "Current" },
      { name: "Safety in HV Testing", completedDate: "2025-01-20", nextDue: "2026-01-20", status: "Overdue" },
      { name: "EL Imaging Interpretation", completedDate: "2025-08-05", nextDue: "2026-08-05", status: "Current" },
    ],
  },
  {
    id: "EMP-006", name: "Rajesh Gupta", role: "Lab Technician", department: "Environmental Testing",
    qualifications: ["Diploma Mechanical Engineering"],
    certifications: [],
    trainings: [
      { name: "Thermal Cycling Chamber Operation", completedDate: "2025-05-12", nextDue: "2026-05-12", status: "Current" },
      { name: "Humidity Chamber Maintenance", completedDate: "2024-09-18", nextDue: "2025-09-18", status: "Overdue" },
    ],
  },
  {
    id: "EMP-007", name: "Dr. Meera Patel", role: "Quality Director", department: "Quality",
    qualifications: ["Ph.D. Quality Engineering", "ASQ CQE"],
    certifications: [
      { name: "ASQ Certified Quality Engineer", validUntil: "2027-03-01", status: "Valid" },
      { name: "IRCA Lead Auditor - ISO 17025", validUntil: "2026-08-15", status: "Valid" },
    ],
    trainings: [
      { name: "Management Review Best Practices", completedDate: "2025-12-10", nextDue: "2026-12-10", status: "Current" },
      { name: "Risk-Based Thinking (ISO 31000)", completedDate: "2025-10-01", nextDue: "2026-10-01", status: "Current" },
    ],
  },
  {
    id: "EMP-008", name: "Sanjay Verma", role: "IT Manager", department: "IT",
    qualifications: ["M.Tech Computer Science"],
    certifications: [
      { name: "ISO 27001 Lead Implementer", validUntil: "2026-04-30", status: "Valid" },
    ],
    trainings: [
      { name: "Data Integrity in Lab Systems", completedDate: "2025-07-15", nextDue: "2026-07-15", status: "Current" },
      { name: "LIMS Administration", completedDate: "2025-11-20", nextDue: "2026-11-20", status: "Current" },
    ],
  },
];

interface RiskItem {
  id: string;
  riskId: string;
  category: string;
  description: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  mitigation: string;
  owner: string;
  status: "Open" | "Mitigated" | "Accepted" | "Monitoring";
  reviewDate: string;
}

const mockRiskRegister: RiskItem[] = [
  { id: "RSK-001", riskId: "RSK-001", category: "Technical", description: "Sun simulator spectral mismatch exceeding Class A requirements due to lamp aging", likelihood: 3, severity: 4, riskScore: 12, riskLevel: "High", mitigation: "Monthly spectral verification, spare lamp in stock, defined replacement interval", owner: "Vikram Singh", status: "Monitoring", reviewDate: "2026-04-01" },
  { id: "RSK-002", riskId: "RSK-002", category: "Personnel", description: "Key personnel departure leading to loss of IEC 61215 testing competency", likelihood: 2, severity: 5, riskScore: 10, riskLevel: "High", mitigation: "Cross-training program, documented procedures, competency matrix maintained", owner: "Dr. Meera Patel", status: "Open", reviewDate: "2026-04-15" },
  { id: "RSK-003", riskId: "RSK-003", category: "Equipment", description: "Environmental chamber compressor failure causing extended downtime", likelihood: 2, severity: 4, riskScore: 8, riskLevel: "Medium", mitigation: "Preventive maintenance schedule, AMC with manufacturer, backup chamber identified", owner: "Rajesh Gupta", status: "Mitigated", reviewDate: "2026-05-01" },
  { id: "RSK-004", riskId: "RSK-004", category: "Data Integrity", description: "LIMS data corruption or loss due to system failure", likelihood: 1, severity: 5, riskScore: 5, riskLevel: "Medium", mitigation: "Daily backups, redundant storage, disaster recovery plan tested annually", owner: "Sanjay Verma", status: "Mitigated", reviewDate: "2026-06-01" },
  { id: "RSK-005", riskId: "RSK-005", category: "Compliance", description: "Failure to maintain NABL accreditation due to audit non-conformities", likelihood: 2, severity: 5, riskScore: 10, riskLevel: "High", mitigation: "Internal audit program, management reviews, CAPA tracking, pre-assessment audits", owner: "Dr. Meera Patel", status: "Monitoring", reviewDate: "2026-03-31" },
  { id: "RSK-006", riskId: "RSK-006", category: "Supply Chain", description: "Reference cell calibration service unavailable from accredited lab", likelihood: 2, severity: 3, riskScore: 6, riskLevel: "Medium", mitigation: "Multiple approved calibration labs, advance booking, in-house comparison capability", owner: "Anil Mehta", status: "Accepted", reviewDate: "2026-07-01" },
  { id: "RSK-007", riskId: "RSK-007", category: "Impartiality", description: "Commercial pressure from major client influencing test results", likelihood: 1, severity: 5, riskScore: 5, riskLevel: "Medium", mitigation: "Impartiality policy, blind testing where possible, management oversight, whistleblower mechanism", owner: "Dr. Ramesh Kumar", status: "Mitigated", reviewDate: "2026-06-15" },
  { id: "RSK-008", riskId: "RSK-008", category: "Environmental", description: "Power outage during long-duration environmental tests causing test invalidation", likelihood: 3, severity: 3, riskScore: 9, riskLevel: "Medium", mitigation: "UPS for critical systems, diesel generator backup, auto-resume capability on chambers", owner: "Sanjay Verma", status: "Monitoring", reviewDate: "2026-04-01" },
];

interface ManagementReview {
  id: string;
  reviewNumber: string;
  date: string;
  status: "Scheduled" | "Completed" | "In Progress";
  chairperson: string;
  attendees: string[];
  agendaItems: string[];
  actionItems: { action: string; responsible: string; dueDate: string; status: "Open" | "Completed" | "Overdue" }[];
  kpis: { metric: string; target: string; actual: string; status: "On Target" | "Below Target" | "Exceeds Target" }[];
}

const mockManagementReviews: ManagementReview[] = [
  {
    id: "MR-2026-Q1", reviewNumber: "MR-2026-Q1", date: "2026-03-28", status: "Scheduled",
    chairperson: "Dr. S. Raghavan (Director)",
    attendees: ["Dr. Meera Patel", "Vikram Singh", "Priya Sharma", "Raj Krishnan", "Sanjay Verma"],
    agendaItems: [
      "Review of Q4 2025 internal audit findings and CAPA status",
      "Customer satisfaction survey results",
      "Equipment calibration and maintenance status",
      "Resource requirements for IEC 61853 scope extension",
      "Risk register review and update",
      "Proficiency testing participation results",
    ],
    actionItems: [
      { action: "Complete pending competency assessments for 3 technicians", responsible: "Vikram Singh", dueDate: "2026-04-15", status: "Open" },
      { action: "Update measurement uncertainty budgets per CAR-2026-001", responsible: "Dr. Meera Patel", dueDate: "2026-04-01", status: "Open" },
    ],
    kpis: [
      { metric: "Report Turnaround Time", target: "≤15 working days", actual: "12.3 days", status: "Exceeds Target" },
      { metric: "CAPA Closure Rate", target: "≥85%", actual: "78%", status: "Below Target" },
      { metric: "Customer Satisfaction Score", target: "≥4.5/5", actual: "4.6/5", status: "Exceeds Target" },
      { metric: "Calibration Compliance", target: "100%", actual: "98%", status: "Below Target" },
      { metric: "Training Compliance", target: "≥95%", actual: "89%", status: "Below Target" },
    ],
  },
  {
    id: "MR-2025-Q4", reviewNumber: "MR-2025-Q4", date: "2025-12-20", status: "Completed",
    chairperson: "Dr. S. Raghavan (Director)",
    attendees: ["Dr. Meera Patel", "Vikram Singh", "Priya Sharma", "Anil Mehta"],
    agendaItems: [
      "Annual audit program review",
      "NABL surveillance audit preparation",
      "Budget review and 2026 resource planning",
      "Customer feedback analysis",
      "Scope extension proposal - IEC 61853",
    ],
    actionItems: [
      { action: "Submit NABL scope extension application", responsible: "Dr. Meera Patel", dueDate: "2026-01-31", status: "Completed" },
      { action: "Procure reference cells for IEC 61853", responsible: "Raj Krishnan", dueDate: "2026-02-28", status: "Completed" },
      { action: "Hire 2 additional technicians for expanded scope", responsible: "HR Manager", dueDate: "2026-03-31", status: "Open" },
    ],
    kpis: [
      { metric: "Report Turnaround Time", target: "≤15 working days", actual: "14.1 days", status: "On Target" },
      { metric: "CAPA Closure Rate", target: "≥85%", actual: "86%", status: "On Target" },
      { metric: "Customer Satisfaction Score", target: "≥4.5/5", actual: "4.5/5", status: "On Target" },
      { metric: "Calibration Compliance", target: "100%", actual: "100%", status: "On Target" },
    ],
  },
  {
    id: "MR-2025-Q3", reviewNumber: "MR-2025-Q3", date: "2025-09-25", status: "Completed",
    chairperson: "Dr. S. Raghavan (Director)",
    attendees: ["Dr. Meera Patel", "Vikram Singh", "Priya Sharma"],
    agendaItems: [
      "Mid-year performance review",
      "Proficiency testing results - IECEE CTL round",
      "Equipment investment plan",
      "Process improvement initiatives",
    ],
    actionItems: [
      { action: "Implement electronic test report signing", responsible: "Sanjay Verma", dueDate: "2025-12-31", status: "Completed" },
      { action: "Complete VDA 6.3 auditor training for supply chain team", responsible: "Dr. Ramesh Kumar", dueDate: "2025-11-30", status: "Completed" },
    ],
    kpis: [
      { metric: "Report Turnaround Time", target: "≤15 working days", actual: "13.5 days", status: "On Target" },
      { metric: "CAPA Closure Rate", target: "≥85%", actual: "91%", status: "Exceeds Target" },
      { metric: "Customer Satisfaction Score", target: "≥4.5/5", actual: "4.7/5", status: "Exceeds Target" },
    ],
  },
];

interface InternalAuditSchedule {
  id: string;
  auditId: string;
  area: string;
  standard: string;
  plannedDate: string;
  auditor: string;
  status: "Planned" | "In Progress" | "Completed" | "Overdue";
  findingsCount: number;
}

const mockAuditSchedule: InternalAuditSchedule[] = [
  { id: "IAS-001", auditId: "AUD-2026-001", area: "PV Testing Laboratory", standard: "ISO 17025", plannedDate: "2026-03-15", auditor: "Dr. Ramesh Kumar", status: "In Progress", findingsCount: 2 },
  { id: "IAS-002", auditId: "AUD-2026-002", area: "Module Assembly", standard: "IATF 16949", plannedDate: "2026-04-05", auditor: "Suresh Patel", status: "Planned", findingsCount: 0 },
  { id: "IAS-003", auditId: "AUD-2026-003", area: "Supply Chain", standard: "VDA 6.3", plannedDate: "2026-04-20", auditor: "Dr. Ramesh Kumar", status: "Planned", findingsCount: 0 },
  { id: "IAS-004", auditId: "AUD-2026-004", area: "Quality Management", standard: "ISO 9001", plannedDate: "2026-05-10", auditor: "Priya Sharma", status: "Planned", findingsCount: 0 },
  { id: "IAS-005", auditId: "", area: "Calibration Laboratory", standard: "ISO 17025", plannedDate: "2026-06-15", auditor: "Anil Mehta", status: "Planned", findingsCount: 0 },
  { id: "IAS-006", auditId: "", area: "Document Control", standard: "ISO 9001", plannedDate: "2026-07-10", auditor: "Priya Sharma", status: "Planned", findingsCount: 0 },
];

// ============================================================================
// Tab Definitions
// ============================================================================

const tabs = [
  { key: "dashboard", label: "Dashboard" },
  { key: "documents", label: "Document Control" },
  { key: "ncr", label: "NCR Management" },
  { key: "capa", label: "CAPA" },
  { key: "management-review", label: "Management Review" },
  { key: "audit-schedule", label: "Internal Audit" },
  { key: "training", label: "Training Records" },
  { key: "risk-register", label: "Risk Register" },
];

const ncrStatusStyles: Record<string, string> = {
  Open: "bg-red-100 text-red-700",
  "Under Investigation": "bg-yellow-100 text-yellow-700",
  "Disposition Decided": "bg-blue-100 text-blue-700",
  Closed: "bg-green-100 text-green-700",
};

const severityStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  Major: "bg-orange-100 text-orange-700",
  Minor: "bg-yellow-100 text-yellow-700",
};

const riskLevelStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const auditStatusStyles: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
};

const trainingStatusStyles: Record<string, string> = {
  Current: "bg-green-100 text-green-700",
  "Due Soon": "bg-yellow-100 text-yellow-700",
  Overdue: "bg-red-100 text-red-700",
  Valid: "bg-green-100 text-green-700",
  "Expiring Soon": "bg-yellow-100 text-yellow-700",
  Expired: "bg-red-100 text-red-700",
};

// ============================================================================
// Component
// ============================================================================

export default function QMSDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [docStats, setDocStats] = useState({ total: 0, approved: 0, inReview: 0, draft: 0, procedures: 0, workInstructions: 0, forms: 0 });
  const [capaStats, setCapaStats] = useState({ total: 0, open: 0, corrective: 0, preventive: 0, overdue: 0 });
  const [recentDocs, setRecentDocs] = useState<QMSDocument[]>([]);
  const [openCAPAs, setOpenCAPAs] = useState<CAPA[]>([]);

  const complianceScore = Math.round(
    (mockComplianceRequirements.filter((r) => r.status === "compliant").length / mockComplianceRequirements.length) * 100
  );

  useEffect(() => {
    fetch("/api/qms/documents")
      .then((r) => r.json())
      .then((d) => { setDocStats(d.stats); setRecentDocs(d.documents.slice(0, 5)); })
      .catch(() => {});
    fetch("/api/qms/capa")
      .then((r) => r.json())
      .then((d) => { setCapaStats(d.stats); setOpenCAPAs(d.capas.filter((c: CAPA) => !["closed", "verified"].includes(c.status))); })
      .catch(() => {});
  }, []);

  const openNCRs = mockNCRs.filter((n) => n.status !== "Closed").length;
  const overdueTrainings = mockTrainingRecords.reduce((c, r) => c + r.trainings.filter((t) => t.status === "Overdue").length, 0);
  const highRisks = mockRiskRegister.filter((r) => r.riskLevel === "High" || r.riskLevel === "Critical").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QMS Dashboard</h1>
          <p className="text-sm text-gray-500">Quality Management System - ISO 17025 / NABL</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                activeTab === tab.key
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ============================================================ */}
      {/* DASHBOARD TAB */}
      {/* ============================================================ */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Compliance</p>
              <p className={cn("text-3xl font-bold mt-1", complianceScore >= 90 ? "text-green-600" : complianceScore >= 70 ? "text-amber-600" : "text-red-600")}>
                {complianceScore}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className={cn("h-1.5 rounded-full", complianceScore >= 90 ? "bg-green-500" : "bg-amber-500")} style={{ width: `${complianceScore}%` }} />
              </div>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Documents</p>
              <p className="text-3xl font-bold mt-1">{docStats.total}</p>
              <p className="text-xs text-green-600">{docStats.approved} approved</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Open CAPAs</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{capaStats.open}</p>
              {capaStats.overdue > 0 && <p className="text-xs text-red-600">{capaStats.overdue} overdue</p>}
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Open NCRs</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{openNCRs}</p>
              <p className="text-xs text-gray-400">non-conformances</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Training Overdue</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{overdueTrainings}</p>
              <p className="text-xs text-gray-400">across all personnel</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase tracking-wide">High Risks</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{highRisks}</p>
              <p className="text-xs text-gray-400">in risk register</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Recent Documents</h2>
                <Link href="/qms/documents" className="text-xs text-amber-600 hover:underline">View All</Link>
              </div>
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div>
                      <div className="text-sm font-medium">{doc.documentNumber}</div>
                      <div className="text-xs text-gray-500">{doc.title}</div>
                      <div className="text-xs text-gray-400">v{doc.version} | {doc.author}</div>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded", getStatusColor(doc.status))}>
                      {doc.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Open CAPAs</h2>
                <Link href="/qms/capa" className="text-xs text-amber-600 hover:underline">View All</Link>
              </div>
              <div className="space-y-2">
                {openCAPAs.map((capa) => (
                  <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                    <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <div>
                        <div className="text-sm font-medium">{capa.capaNumber}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{capa.title}</div>
                        <div className="text-xs text-gray-400">Assigned: {capa.assignedTo}</div>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", getStatusColor(capa.type === "corrective" ? "destructive" : "pending"))}>
                          {capa.type}
                        </span>
                        <div className={cn("text-xs mt-1", getStatusColor(capa.priority))}>{capa.priority}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="card">
            <h2 className="text-sm font-semibold mb-3">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tabs.filter((t) => t.key !== "dashboard").map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="p-3 border rounded hover:bg-gray-50 text-center">
                  <div className="text-sm font-medium">{tab.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DOCUMENT CONTROL TAB */}
      {/* ============================================================ */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Document Control</h2>
            <Link href="/qms/documents" className="btn-primary text-sm px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
              View Full Registry
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">SOPs / Procedures</p>
              <p className="text-2xl font-bold mt-1">{docStats.procedures || 12}</p>
              <p className="text-xs text-gray-400">{docStats.approved || 10} approved</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Work Instructions</p>
              <p className="text-2xl font-bold mt-1">{docStats.workInstructions || 8}</p>
              <p className="text-xs text-gray-400">operational guides</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Forms / Templates</p>
              <p className="text-2xl font-bold mt-1">{docStats.forms || 15}</p>
              <p className="text-xs text-gray-400">active forms</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Recent Documents</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doc #</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-amber-600">{doc.documentNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{doc.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{doc.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">v{doc.version}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge text-xs px-2 py-0.5 rounded", getStatusColor(doc.status))}>{doc.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{doc.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Document Approval Workflow</h3>
            <div className="flex items-center justify-between max-w-2xl mx-auto py-4">
              {["Draft", "Review", "Approval", "Effective"].map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", idx === 0 ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-600")}>
                      {idx + 1}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{step}</span>
                  </div>
                  {idx < 3 && <div className="w-16 h-0.5 bg-gray-300 mx-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* NCR MANAGEMENT TAB */}
      {/* ============================================================ */}
      {activeTab === "ncr" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Non-Conformance Reports</h2>
            <button className="btn-primary text-sm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Raise NCR
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Total NCRs</p>
              <p className="text-2xl font-bold mt-1">{mockNCRs.length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Open</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{mockNCRs.filter((n) => n.status === "Open").length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Under Investigation</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{mockNCRs.filter((n) => n.status === "Under Investigation").length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Closed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{mockNCRs.filter((n) => n.status === "Closed").length}</p>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NCR #</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Disposition</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockNCRs.map((ncr) => (
                    <tr key={ncr.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-red-600">{ncr.ncrNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{ncr.title}</td>
                      <td className="px-4 py-3"><span className={cn("badge text-xs px-2 py-0.5 rounded", severityStyles[ncr.severity])}>{ncr.severity}</span></td>
                      <td className="px-4 py-3"><span className={cn("badge text-xs px-2 py-0.5 rounded", ncrStatusStyles[ncr.status])}>{ncr.status}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ncr.disposition}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ncr.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(ncr.raisedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NCR Detail for first open NCR */}
          {mockNCRs.filter((n) => n.status !== "Closed").length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold mb-3">NCR Detail - {mockNCRs[0].ncrNumber}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Description</p>
                  <p className="text-gray-900 mt-1">{mockNCRs[0].description}</p>
                </div>
                <div>
                  <p className="text-gray-500">Root Cause</p>
                  <p className="text-gray-900 mt-1">{mockNCRs[0].rootCause || "Under investigation"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Source</p>
                  <p className="text-gray-900 mt-1">{mockNCRs[0].source}</p>
                </div>
                <div>
                  <p className="text-gray-500">Linked CAPA</p>
                  <p className="text-gray-900 mt-1">{mockNCRs[0].linkedCapa || "Not linked"}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 font-medium uppercase mb-2">Disposition Options</p>
                <div className="flex gap-2">
                  {["Scrap", "Rework", "Use As-Is", "Return to Supplier"].map((d) => (
                    <button key={d} className="px-3 py-1 text-xs border rounded hover:bg-gray-50">{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* CAPA TAB */}
      {/* ============================================================ */}
      {activeTab === "capa" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">CAPA Management</h2>
            <Link href="/qms/capa" className="btn-primary text-sm px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
              View All CAPAs
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Total CAPAs</p>
              <p className="text-2xl font-bold mt-1">{capaStats.total}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Open</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{capaStats.open}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Corrective</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{capaStats.corrective}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Preventive</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{capaStats.preventive}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Open CAPAs</h3>
            <div className="space-y-3">
              {openCAPAs.map((capa) => (
                <Link key={capa.id} href={`/qms/capa/${capa.id}`}>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium">{capa.capaNumber} - {capa.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{capa.description?.substring(0, 100)}...</div>
                      <div className="text-xs text-gray-400 mt-1">Assigned: {capa.assignedTo} | Target: {formatDate(capa.targetCompletionDate)}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={cn("badge text-xs px-2 py-0.5 rounded", getStatusColor(capa.type === "corrective" ? "destructive" : "pending"))}>{capa.type}</span>
                      <div><span className={cn("badge text-xs px-2 py-0.5 rounded", getStatusColor(capa.priority))}>{capa.priority}</span></div>
                      <div><span className={cn("badge text-xs px-2 py-0.5 rounded", getStatusColor(capa.status))}>{capa.status.replace(/_/g, " ")}</span></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* CAPA Linked to RCA */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Root Cause Analysis Integration</h3>
            <p className="text-sm text-gray-600 mb-3">CAPAs are linked to the 8D problem-solving workflow and Root Cause Analysis tools.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {["Ishikawa / Fishbone", "5-Why Analysis", "8D Methodology", "Pareto Analysis"].map((tool) => (
                <div key={tool} className="p-3 border rounded text-center">
                  <div className="text-sm font-medium">{tool}</div>
                  <div className="text-xs text-gray-500 mt-1">Available for CAPA investigation</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MANAGEMENT REVIEW TAB */}
      {/* ============================================================ */}
      {activeTab === "management-review" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Management Review</h2>

          {mockManagementReviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">{review.reviewNumber}</h3>
                  <p className="text-xs text-gray-500">{formatDate(review.date)} | Chair: {review.chairperson}</p>
                </div>
                <span className={cn("badge text-xs px-2 py-0.5 rounded", review.status === "Completed" ? "bg-green-100 text-green-700" : review.status === "Scheduled" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700")}>
                  {review.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agenda */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Agenda Items</p>
                  <ul className="space-y-1">
                    {review.agendaItems.map((item, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-gray-400 mt-px">{idx + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* KPIs */}
                {review.kpis.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Key Performance Indicators</p>
                    <div className="space-y-2">
                      {review.kpis.map((kpi, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{kpi.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{kpi.actual}</span>
                            <span className={cn("px-1.5 py-0.5 rounded", kpi.status === "Exceeds Target" ? "bg-green-100 text-green-700" : kpi.status === "On Target" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}>
                              {kpi.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Items */}
              {review.actionItems.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Action Items</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500">Action</th>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500">Responsible</th>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500">Due</th>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {review.actionItems.map((ai, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-xs text-gray-700">{ai.action}</td>
                            <td className="px-3 py-2 text-xs text-gray-600">{ai.responsible}</td>
                            <td className="px-3 py-2 text-xs text-gray-600">{formatDate(ai.dueDate)}</td>
                            <td className="px-3 py-2">
                              <span className={cn("badge text-xs px-1.5 py-0.5 rounded", ai.status === "Completed" ? "bg-green-100 text-green-700" : ai.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>
                                {ai.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* INTERNAL AUDIT SCHEDULE TAB */}
      {/* ============================================================ */}
      {activeTab === "audit-schedule" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Internal Audit Schedule</h2>
            <Link href="/audit" className="text-sm text-amber-600 hover:underline">Full Audit Module →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Total Planned</p>
              <p className="text-2xl font-bold mt-1">{mockAuditSchedule.length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{mockAuditSchedule.filter((a) => a.status === "In Progress").length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{mockAuditSchedule.filter((a) => a.status === "Completed").length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Total Findings</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{mockAuditSchedule.reduce((s, a) => s + a.findingsCount, 0)}</p>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Auditor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockAuditSchedule.map((audit) => (
                    <tr key={audit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-amber-600">
                        {audit.auditId ? (
                          <Link href={`/audit/plans/${audit.auditId}`} className="hover:underline">{audit.auditId || audit.id}</Link>
                        ) : (
                          <span className="text-gray-500">{audit.id}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{audit.area}</td>
                      <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{audit.standard}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(audit.plannedDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{audit.auditor}</td>
                      <td className="px-4 py-3"><span className={cn("badge text-xs px-2 py-0.5 rounded", auditStatusStyles[audit.status])}>{audit.status}</span></td>
                      <td className="px-4 py-3 text-sm font-medium">{audit.findingsCount > 0 ? <span className="text-orange-600">{audit.findingsCount}</span> : <span className="text-gray-400">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TRAINING RECORDS TAB */}
      {/* ============================================================ */}
      {activeTab === "training" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Training Records & Personnel Qualifications</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Personnel</p>
              <p className="text-2xl font-bold mt-1">{mockTrainingRecords.length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Active Certifications</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{mockTrainingRecords.reduce((c, r) => c + r.certifications.filter((cert) => cert.status === "Valid").length, 0)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Trainings Due Soon</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{mockTrainingRecords.reduce((c, r) => c + r.trainings.filter((t) => t.status === "Due Soon").length, 0)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{overdueTrainings}</p>
            </div>
          </div>

          {mockTrainingRecords.map((person) => (
            <div key={person.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">{person.name}</h3>
                  <p className="text-xs text-gray-500">{person.role} | {person.department}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{person.qualifications.join(", ")}</p>
                </div>
                <div className="text-right">
                  {person.trainings.some((t) => t.status === "Overdue") && (
                    <span className="badge text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Has Overdue</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Certifications */}
                {person.certifications.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Certifications</p>
                    <div className="space-y-1">
                      {person.certifications.map((cert, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700">{cert.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Until {formatDate(cert.validUntil)}</span>
                            <span className={cn("px-1.5 py-0.5 rounded", trainingStatusStyles[cert.status])}>{cert.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trainings */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Training Status</p>
                  <div className="space-y-1">
                    {person.trainings.map((training, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{training.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Due: {formatDate(training.nextDue)}</span>
                          <span className={cn("px-1.5 py-0.5 rounded", trainingStatusStyles[training.status])}>{training.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* RISK REGISTER TAB */}
      {/* ============================================================ */}
      {activeTab === "risk-register" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Risk Register</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Total Risks</p>
              <p className="text-2xl font-bold mt-1">{mockRiskRegister.length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Critical/High</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{highRisks}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Mitigated</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{mockRiskRegister.filter((r) => r.status === "Mitigated").length}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500 uppercase">Monitoring</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{mockRiskRegister.filter((r) => r.status === "Monitoring").length}</p>
            </div>
          </div>

          {/* Risk Matrix Heatmap */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Likelihood × Severity Matrix</h3>
            <div className="overflow-x-auto">
              <table className="border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-xs text-gray-500 border">L \ S</th>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <th key={s} className="p-2 text-xs text-gray-500 border text-center w-16">Sev {s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2, 1].map((l) => (
                    <tr key={l}>
                      <td className="p-2 text-xs text-gray-500 border font-medium">Lik {l}</td>
                      {[1, 2, 3, 4, 5].map((s) => {
                        const score = l * s;
                        const risksHere = mockRiskRegister.filter((r) => r.likelihood === l && r.severity === s);
                        const bg = score >= 15 ? "bg-red-200" : score >= 8 ? "bg-orange-200" : score >= 4 ? "bg-yellow-200" : "bg-green-200";
                        return (
                          <td key={s} className={cn("p-2 border text-center w-16 h-12", bg)}>
                            {risksHere.length > 0 && (
                              <div className="text-xs font-bold">{risksHere.map((r) => r.riskId.split("-")[1]).join(", ")}</div>
                            )}
                            <div className="text-[10px] text-gray-500">{score}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">L×S</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockRiskRegister.map((risk) => (
                    <tr key={risk.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{risk.riskId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{risk.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">{risk.description}</td>
                      <td className="px-4 py-3 text-sm font-bold">{risk.likelihood}×{risk.severity}={risk.riskScore}</td>
                      <td className="px-4 py-3"><span className={cn("badge text-xs px-2 py-0.5 rounded", riskLevelStyles[risk.riskLevel])}>{risk.riskLevel}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{risk.owner}</td>
                      <td className="px-4 py-3"><span className={cn("badge text-xs px-2 py-0.5 rounded", risk.status === "Mitigated" ? "bg-green-100 text-green-700" : risk.status === "Monitoring" ? "bg-blue-100 text-blue-700" : risk.status === "Accepted" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-700")}>{risk.status}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(risk.reviewDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mitigation Details */}
          <div className="card">
            <h3 className="text-sm font-semibold mb-3">Risk Mitigation Details</h3>
            <div className="space-y-3">
              {mockRiskRegister.filter((r) => r.riskLevel === "High" || r.riskLevel === "Critical").map((risk) => (
                <div key={risk.id} className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-gray-500">{risk.riskId}</span>
                    <span className={cn("badge text-xs px-2 py-0.5 rounded", riskLevelStyles[risk.riskLevel])}>{risk.riskLevel}</span>
                  </div>
                  <p className="text-sm text-gray-900">{risk.description}</p>
                  <p className="text-xs text-gray-500 mt-1"><span className="font-medium">Mitigation:</span> {risk.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
