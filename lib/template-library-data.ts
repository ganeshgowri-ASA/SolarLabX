// Test Report Template Library data

export type TemplateCategory = "Design" | "Safety" | "Performance" | "Durability" | "Calibration" | "Audit" | "Management" | "Measurement";

export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  required: boolean;
  type: "header" | "table" | "text" | "signature" | "image" | "chart" | "results" | "checklist";
}

export interface ReportTemplate {
  id: string;
  name: string;
  standard: string;
  category: TemplateCategory;
  description: string;
  version: string;
  lastUpdated: string;
  author: string;
  approvedBy: string;
  usageCount: number;
  sections: TemplateSection[];
  tags: string[];
}

export const templateLibrary: ReportTemplate[] = [
  {
    id: "tlib-001",
    name: "IEC 61215 Design Qualification Full Report",
    standard: "IEC 61215:2021",
    category: "Design",
    description: "Complete design qualification and type approval test report covering all MQT 01-19 tests for crystalline silicon PV modules.",
    version: "3.2",
    lastUpdated: "2026-02-15",
    author: "Dr. Anand Mehta",
    approvedBy: "Rajesh Patel",
    usageCount: 47,
    sections: [
      { id: "s1", name: "Cover Page", description: "Lab logo, report number, module details, accreditation marks", required: true, type: "header" },
      { id: "s2", name: "Table of Contents", description: "Auto-generated TOC with page references", required: true, type: "text" },
      { id: "s3", name: "Scope & Objective", description: "Test scope, applicable standard edition, test sequences", required: true, type: "text" },
      { id: "s4", name: "Module Under Test (MUT)", description: "Module identification, manufacturer, model, serial, dimensions", required: true, type: "table" },
      { id: "s5", name: "Test Sequence Summary", description: "Summary table of all tests with pass/fail status", required: true, type: "results" },
      { id: "s6", name: "Visual Inspection Records", description: "Pre/post test visual inspection with photos", required: true, type: "image" },
      { id: "s7", name: "I-V Characterization Data", description: "I-V curves, power matrix, temperature correction", required: true, type: "chart" },
      { id: "s8", name: "Environmental Test Results", description: "TC, HF, DH test data with degradation analysis", required: true, type: "results" },
      { id: "s9", name: "Mechanical Test Results", description: "Mechanical load, hail, termination tests", required: true, type: "results" },
      { id: "s10", name: "Uncertainty Statement", description: "Measurement uncertainty per ISO/IEC 17025", required: true, type: "text" },
      { id: "s11", name: "Equipment List", description: "Instruments used with calibration status", required: true, type: "table" },
      { id: "s12", name: "Conclusion & Verdict", description: "Overall pass/fail verdict with remarks", required: true, type: "text" },
      { id: "s13", name: "Signatures & Approval", description: "Prepared/Reviewed/Approved signature block", required: true, type: "signature" },
    ],
    tags: ["design qualification", "type approval", "crystalline silicon", "MQT"],
  },
  {
    id: "tlib-002",
    name: "IEC 61730 Safety Qualification Report",
    standard: "IEC 61730:2016",
    category: "Safety",
    description: "Safety qualification test report covering all MST tests including electrical safety, mechanical integrity, and fire resistance.",
    version: "2.8",
    lastUpdated: "2026-02-20",
    author: "Priya Sharma",
    approvedBy: "Dr. Anand Mehta",
    usageCount: 38,
    sections: [
      { id: "s1", name: "Cover Page", description: "Lab accreditation, report ID, classification", required: true, type: "header" },
      { id: "s2", name: "Application Class", description: "Application class determination (A/B/C)", required: true, type: "text" },
      { id: "s3", name: "Construction Assessment", description: "Module construction analysis and BOM review", required: true, type: "table" },
      { id: "s4", name: "Electrical Safety Tests", description: "Insulation, dielectric, ground continuity results", required: true, type: "results" },
      { id: "s5", name: "Mechanical Safety Tests", description: "Impact, breakage, cut susceptibility results", required: true, type: "results" },
      { id: "s6", name: "Fire Safety Tests", description: "Fire classification and test results", required: false, type: "results" },
      { id: "s7", name: "Marking & Documentation", description: "Label compliance and installation manual review", required: true, type: "checklist" },
      { id: "s8", name: "Risk Assessment", description: "Hazard identification and risk evaluation", required: true, type: "table" },
      { id: "s9", name: "Certification Recommendation", description: "Recommendation for safety certification", required: true, type: "text" },
      { id: "s10", name: "Signatures & Approval", description: "Multi-level approval chain", required: true, type: "signature" },
    ],
    tags: ["safety", "certification", "electrical safety", "MST"],
  },
  {
    id: "tlib-003",
    name: "IEC 61853 Energy Rating Report",
    standard: "IEC 61853:2018",
    category: "Performance",
    description: "Energy rating test report with power matrix, spectral response, angular response, and CSER calculation for multiple climate zones.",
    version: "2.1",
    lastUpdated: "2026-01-30",
    author: "Dr. Anand Mehta",
    approvedBy: "Rajesh Patel",
    usageCount: 22,
    sections: [
      { id: "s1", name: "Cover Page", description: "Report identification and scope", required: true, type: "header" },
      { id: "s2", name: "Power Rating Matrix", description: "22-point I-V data at varying irradiance/temperature", required: true, type: "chart" },
      { id: "s3", name: "Temperature Coefficients", description: "α, β, γ coefficients with measurement details", required: true, type: "results" },
      { id: "s4", name: "Spectral Response", description: "SR measurement from 300-1200nm", required: true, type: "chart" },
      { id: "s5", name: "Angular Response (IAM)", description: "Incidence angle modifier measurements", required: true, type: "chart" },
      { id: "s6", name: "NMOT Determination", description: "Nominal module operating temperature", required: true, type: "results" },
      { id: "s7", name: "Energy Rating (CSER)", description: "Climate-specific energy rating calculation", required: true, type: "table" },
      { id: "s8", name: "Uncertainty Budget", description: "Full uncertainty budget per GUM", required: true, type: "table" },
      { id: "s9", name: "Signatures", description: "Approval chain", required: true, type: "signature" },
    ],
    tags: ["energy rating", "power matrix", "CSER", "spectral response"],
  },
  {
    id: "tlib-004",
    name: "IEC 61701 Salt Mist Corrosion Report",
    standard: "IEC 61701:2020",
    category: "Durability",
    description: "Salt mist corrosion test report for PV modules with multiple severity levels and visual/electrical assessments.",
    version: "1.5",
    lastUpdated: "2026-02-08",
    author: "Priya Sharma",
    approvedBy: "Dr. Anand Mehta",
    usageCount: 15,
    sections: [
      { id: "s1", name: "Cover Page", description: "Report header and module identification", required: true, type: "header" },
      { id: "s2", name: "Test Severity Selection", description: "Severity level justification based on IEC 60721-2-1", required: true, type: "text" },
      { id: "s3", name: "Pre-Test Assessment", description: "Baseline visual and I-V measurements", required: true, type: "results" },
      { id: "s4", name: "Salt Mist Exposure Log", description: "Cycle-by-cycle exposure parameters", required: true, type: "table" },
      { id: "s5", name: "Post-Test Assessment", description: "Post-exposure visual and I-V measurements", required: true, type: "results" },
      { id: "s6", name: "Degradation Analysis", description: "Power degradation and corrosion progression", required: true, type: "chart" },
      { id: "s7", name: "Photo Documentation", description: "Before/after comparison photos", required: true, type: "image" },
      { id: "s8", name: "Verdict", description: "Pass/fail per severity level criteria", required: true, type: "text" },
      { id: "s9", name: "Signatures", description: "Approval block", required: true, type: "signature" },
    ],
    tags: ["salt mist", "corrosion", "coastal", "durability"],
  },
  {
    id: "tlib-005",
    name: "IEC 60904 I-V Measurement Report",
    standard: "IEC 60904:2020",
    category: "Measurement",
    description: "Standard I-V measurement report per IEC 60904-1 with spectral mismatch correction and sun simulator classification.",
    version: "2.3",
    lastUpdated: "2026-02-25",
    author: "Ravi Kumar",
    approvedBy: "Priya Sharma",
    usageCount: 89,
    sections: [
      { id: "s1", name: "Cover Page", description: "Report identification", required: true, type: "header" },
      { id: "s2", name: "Sun Simulator Classification", description: "Spectral, spatial, temporal classification (A+/A/B/C)", required: true, type: "results" },
      { id: "s3", name: "Reference Device", description: "Reference cell details and calibration certificate", required: true, type: "table" },
      { id: "s4", name: "I-V Characteristics", description: "Full I-V curve data with key parameters", required: true, type: "chart" },
      { id: "s5", name: "STC Translation", description: "Temperature/irradiance correction to STC", required: true, type: "results" },
      { id: "s6", name: "Spectral Mismatch", description: "MMF calculation per IEC 60904-7", required: false, type: "results" },
      { id: "s7", name: "Measurement Uncertainty", description: "Expanded uncertainty for Pmax, Isc, Voc, FF", required: true, type: "table" },
      { id: "s8", name: "Signatures", description: "Approval block", required: true, type: "signature" },
    ],
    tags: ["I-V measurement", "STC", "spectral mismatch", "flash test"],
  },
  {
    id: "tlib-006",
    name: "ISO 17025 Calibration Certificate",
    standard: "ISO/IEC 17025:2017",
    category: "Calibration",
    description: "Accredited calibration certificate for reference cells, pyranometers, and measurement instruments per ISO 17025 requirements.",
    version: "3.0",
    lastUpdated: "2026-01-18",
    author: "Meena Joshi",
    approvedBy: "Dr. Anand Mehta",
    usageCount: 124,
    sections: [
      { id: "s1", name: "Certificate Header", description: "Accreditation logo, certificate number, unique ID", required: true, type: "header" },
      { id: "s2", name: "Instrument Details", description: "Instrument identification, manufacturer, model, serial", required: true, type: "table" },
      { id: "s3", name: "Calibration Method", description: "Method reference, procedure number, standard used", required: true, type: "text" },
      { id: "s4", name: "Environmental Conditions", description: "Temperature, humidity, barometric pressure during calibration", required: true, type: "table" },
      { id: "s5", name: "Measurement Results", description: "Calibration data with reference values and corrections", required: true, type: "results" },
      { id: "s6", name: "Uncertainty Statement", description: "Expanded uncertainty with coverage factor", required: true, type: "text" },
      { id: "s7", name: "Traceability", description: "Metrological traceability chain", required: true, type: "text" },
      { id: "s8", name: "Authorized Signatory", description: "Authorized signatory with scope statement", required: true, type: "signature" },
    ],
    tags: ["calibration", "ISO 17025", "traceability", "accreditation"],
  },
  {
    id: "tlib-007",
    name: "Internal Audit Report",
    standard: "ISO 9001 / ISO 17025",
    category: "Audit",
    description: "Internal audit report template for quality management system audits covering all applicable ISO 17025 and ISO 9001 clauses.",
    version: "2.0",
    lastUpdated: "2026-02-12",
    author: "Vikram Desai",
    approvedBy: "Rajesh Patel",
    usageCount: 31,
    sections: [
      { id: "s1", name: "Audit Header", description: "Audit number, scope, team, dates", required: true, type: "header" },
      { id: "s2", name: "Audit Plan", description: "Planned activities, areas, and timing", required: true, type: "table" },
      { id: "s3", name: "Clause Checklist", description: "Clause-by-clause assessment with evidence", required: true, type: "checklist" },
      { id: "s4", name: "Findings Register", description: "NC/OFI/Observations with classification", required: true, type: "table" },
      { id: "s5", name: "CAPA Links", description: "Corrective action assignments and timelines", required: true, type: "table" },
      { id: "s6", name: "Auditor Conclusion", description: "Overall assessment and recommendations", required: true, type: "text" },
      { id: "s7", name: "Signatures", description: "Lead Auditor and Quality Manager sign-off", required: true, type: "signature" },
    ],
    tags: ["audit", "internal", "ISO 9001", "ISO 17025", "compliance"],
  },
  {
    id: "tlib-008",
    name: "Management Review Minutes",
    standard: "ISO 17025 Clause 8.9",
    category: "Management",
    description: "Template for management review meeting minutes capturing inputs, outputs, decisions, and action items per ISO 17025.",
    version: "1.4",
    lastUpdated: "2026-03-01",
    author: "Dr. Anand Mehta",
    approvedBy: "Rajesh Patel",
    usageCount: 8,
    sections: [
      { id: "s1", name: "Meeting Details", description: "Date, attendees, agenda", required: true, type: "header" },
      { id: "s2", name: "Previous Action Review", description: "Status of previous action items", required: true, type: "checklist" },
      { id: "s3", name: "Quality Objectives Status", description: "KPI review and trend analysis", required: true, type: "chart" },
      { id: "s4", name: "Audit & CAPA Summary", description: "Summary of audit findings and CAPA status", required: true, type: "table" },
      { id: "s5", name: "Customer Feedback", description: "Client satisfaction and complaints", required: true, type: "table" },
      { id: "s6", name: "Resource & Training", description: "Resource needs and training plan review", required: true, type: "table" },
      { id: "s7", name: "Decisions & Actions", description: "Decisions made and new action items", required: true, type: "table" },
      { id: "s8", name: "Approval", description: "Meeting chair approval", required: true, type: "signature" },
    ],
    tags: ["management review", "ISO 17025", "KPIs", "action items"],
  },
];

export const sectionTypeIcons: Record<string, string> = {
  header: "FileText",
  table: "Table2",
  text: "AlignLeft",
  signature: "PenTool",
  image: "Image",
  chart: "BarChart3",
  results: "CheckSquare",
  checklist: "ListChecks",
};
