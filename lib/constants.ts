export const APP_NAME = "SolarLabX";
export const APP_DESCRIPTION = "Solar PV Lab Operations Suite";

export const NAV_MODULES = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    description: "Overview & KPIs",
  },
  {
    title: "LIMS",
    href: "/lims",
    icon: "FlaskConical",
    description: "Lab Information Management",
  },
  {
    title: "QMS",
    href: "/qms",
    icon: "FileCheck",
    description: "Quality Management System",
  },
  {
    title: "Audit",
    href: "/audit",
    icon: "ClipboardCheck",
    description: "Audit Management",
  },
  {
    title: "Projects",
    href: "/projects",
    icon: "FolderKanban",
    description: "Project Management",
  },
  {
    title: "Uncertainty",
    href: "/uncertainty",
    icon: "Calculator",
    description: "Uncertainty Calculator",
  },
  {
    title: "Vision AI",
    href: "/vision-ai",
    icon: "ScanEye",
    description: "AI Defect Detection",
  },
  {
    title: "SOP Gen",
    href: "/sop-gen",
    icon: "BookOpen",
    description: "SOP Generator",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: "FileBarChart",
    description: "Test Report Automation",
  },
  {
    title: "Sun Simulator",
    href: "/sun-simulator",
    icon: "Sun",
    description: "IEC 60904-9 Classifier",
  },
  {
    title: "Chamber Config",
    href: "/chamber-config",
    icon: "Thermometer",
    description: "Chamber Configurator",
  },
  {
    title: "Procurement",
    href: "/procurement",
    icon: "ShoppingCart",
    description: "Procurement Management",
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: "BarChart3",
    description: "Statistical Analysis & SPC",
  },
] as const;

export const IEC_STANDARDS = [
  "IEC 61215",
  "IEC 61730",
  "IEC 61853",
  "IEC 60904",
  "IEC 62716",
  "IEC 61701",
  "IEC 62804",
] as const;

// Defect types for solar PV module inspection (Vision AI)
export const DEFECT_TYPES = [
  { id: "crack", label: "Cell Crack", severity: "critical", color: "#ef4444" },
  { id: "hotspot", label: "Hotspot", severity: "critical", color: "#f97316" },
  { id: "snail_trail", label: "Snail Trail", severity: "major", color: "#eab308" },
  { id: "pid", label: "PID (Potential Induced Degradation)", severity: "critical", color: "#dc2626" },
  { id: "busbar_misalignment", label: "Busbar Misalignment", severity: "major", color: "#a855f7" },
  { id: "cell_breakage", label: "Cell Breakage", severity: "critical", color: "#be123c" },
  { id: "delamination", label: "Delamination", severity: "major", color: "#0891b2" },
  { id: "discoloration", label: "Discoloration", severity: "minor", color: "#65a30d" },
  { id: "corrosion", label: "Corrosion", severity: "major", color: "#b45309" },
  { id: "broken_interconnect", label: "Broken Interconnect", severity: "critical", color: "#7c3aed" },
] as const;

export type DefectTypeId = (typeof DEFECT_TYPES)[number]["id"];

export const SEVERITY_LEVELS = {
  critical: { label: "Critical", color: "#ef4444", bgColor: "#fef2f2" },
  major: { label: "Major", color: "#f97316", bgColor: "#fff7ed" },
  minor: { label: "Minor", color: "#eab308", bgColor: "#fefce8" },
} as const;

export const INSPECTION_TYPES = [
  { id: "el", label: "Electroluminescence (EL)", description: "EL imaging for cell-level defect detection" },
  { id: "ir", label: "IR Thermography", description: "Infrared imaging for hotspot detection" },
  { id: "visual", label: "Visual Inspection", description: "Standard visual inspection for surface defects" },
] as const;

// IEC/ISO Standards for SOP generation
export const STANDARDS = [
  { id: "iec_61215", label: "IEC 61215", title: "Terrestrial PV Modules - Design Qualification", clauses: [
    "10.1 - Visual Inspection", "10.2 - Maximum Power Determination", "10.3 - Insulation Test",
    "10.4 - Measurement of Temperature Coefficients", "10.5 - Measurement of NMOT",
    "10.6 - Performance at STC", "10.7 - Performance at NMOT", "10.8 - Performance at Low Irradiance",
    "10.9 - Outdoor Exposure Test", "10.10 - Hot-spot Endurance Test", "10.11 - UV Preconditioning",
    "10.12 - Thermal Cycling Test", "10.13 - Humidity-Freeze Test", "10.14 - Damp Heat Test",
    "10.15 - Robustness of Terminations", "10.16 - Wet Leakage Current Test",
    "10.17 - Mechanical Load Test", "10.18 - Hail Test", "10.19 - Bypass Diode Test",
  ]},
  { id: "iec_61730", label: "IEC 61730", title: "PV Module Safety Qualification", clauses: [
    "10.1 - Visual Inspection", "10.2 - Accessibility Test", "10.3 - Cut Susceptibility",
    "10.4 - Ground Continuity", "10.5 - Impulse Voltage", "10.6 - Insulation Resistance",
    "10.7 - Wet Leakage Current", "10.8 - Temperature Test", "10.9 - Hot-spot Test",
    "10.10 - Reverse Current Overload", "10.11 - Module Breakage", "10.12 - Fire Test",
  ]},
  { id: "iec_61853", label: "IEC 61853", title: "PV Module Energy Rating", clauses: [
    "7 - Power Rating", "8 - Energy Rating", "9 - Spectral Response",
    "10 - Angular Response", "11 - Temperature Coefficients", "12 - NMOT Determination",
  ]},
  { id: "iec_60904", label: "IEC 60904", title: "PV Devices - Measurement Procedures", clauses: [
    "60904-1 - I-V Characteristics", "60904-2 - Reference Devices", "60904-3 - Measurement Principles",
    "60904-4 - Reference Solar Devices", "60904-7 - Spectral Mismatch", "60904-8 - Spectral Response",
    "60904-9 - Solar Simulator Classification", "60904-10 - Linearity Measurement",
  ]},
  { id: "iso_17025", label: "ISO/IEC 17025", title: "General Requirements for Competence of Testing Labs", clauses: [
    "4.1 - Impartiality", "4.2 - Confidentiality", "5 - Structural Requirements",
    "6.1 - General Resources", "6.2 - Personnel", "6.3 - Facilities & Environment",
    "6.4 - Equipment", "6.5 - Metrological Traceability", "6.6 - Externally Provided Products",
    "7.1 - Review of Requests", "7.2 - Selection & Verification of Methods",
    "7.3 - Sampling", "7.4 - Handling of Test Items", "7.5 - Technical Records",
    "7.6 - Evaluation of Measurement Uncertainty", "7.7 - Ensuring Validity of Results",
    "7.8 - Reporting of Results", "8 - Management System Requirements",
  ]},
] as const;

// Report types
export const REPORT_TYPES = [
  { id: "iec_61215_qualification", label: "IEC 61215 Design Qualification", standard: "IEC 61215" },
  { id: "iec_61730_safety", label: "IEC 61730 Safety Qualification", standard: "IEC 61730" },
  { id: "iec_61853_energy", label: "IEC 61853 Energy Rating", standard: "IEC 61853" },
  { id: "iec_60904_measurement", label: "IEC 60904 Measurement", standard: "IEC 60904" },
  { id: "iec_61701_salt", label: "IEC 61701 Salt Mist Corrosion", standard: "IEC 61701" },
  { id: "iec_62716_ammonia", label: "IEC 62716 Ammonia Corrosion", standard: "IEC 62716" },
  { id: "custom", label: "Custom Report", standard: "Custom" },
] as const;

// SOP sections structure
export const SOP_SECTIONS = [
  "Purpose",
  "Scope",
  "References",
  "Definitions",
  "Responsibilities",
  "Procedure",
  "Records",
  "Revision History",
] as const;

// Approval statuses
export const APPROVAL_STATUS = {
  draft: { label: "Draft", color: "#6b7280" },
  pending_review: { label: "Pending Review", color: "#eab308" },
  reviewed: { label: "Reviewed", color: "#3b82f6" },
  approved: { label: "Approved", color: "#22c55e" },
  rejected: { label: "Rejected", color: "#ef4444" },
  superseded: { label: "Superseded", color: "#9ca3af" },
} as const;

// LIMS - Equipment categories for solar PV testing labs
export const EQUIPMENT_CATEGORIES = [
  { value: 'solar_simulator', label: 'Solar Simulator' },
  { value: 'thermal_chamber', label: 'Thermal/Environmental Chamber' },
  { value: 'humidity_chamber', label: 'Humidity Chamber' },
  { value: 'uv_chamber', label: 'UV Exposure Chamber' },
  { value: 'iv_tester', label: 'I-V Curve Tracer' },
  { value: 'insulation_tester', label: 'Insulation Resistance Tester' },
  { value: 'el_camera', label: 'EL Camera' },
  { value: 'ir_camera', label: 'IR Thermal Camera' },
  { value: 'mechanical_load', label: 'Mechanical Load Tester' },
  { value: 'hail_tester', label: 'Hail Impact Tester' },
  { value: 'flash_tester', label: 'Flash Tester' },
  { value: 'spectroradiometer', label: 'Spectroradiometer' },
  { value: 'data_logger', label: 'Data Logger' },
  { value: 'multimeter', label: 'Digital Multimeter' },
  { value: 'reference_cell', label: 'Reference Cell' },
  { value: 'pyranometer', label: 'Pyranometer' },
  { value: 'other', label: 'Other' },
] as const;

export const SAMPLE_TYPES = [
  { value: 'pv_module', label: 'PV Module' },
  { value: 'pv_cell', label: 'PV Cell' },
  { value: 'pv_string', label: 'PV String' },
  { value: 'junction_box', label: 'Junction Box' },
  { value: 'connector', label: 'Connector' },
  { value: 'cable', label: 'Cable' },
  { value: 'backsheet', label: 'Backsheet' },
  { value: 'encapsulant', label: 'Encapsulant' },
  { value: 'frame', label: 'Frame' },
  { value: 'glass', label: 'Glass' },
  { value: 'other', label: 'Other' },
] as const;

export const TEST_STANDARDS = [
  { value: 'IEC 61215', label: 'IEC 61215 - Design Qualification & Type Approval' },
  { value: 'IEC 61730', label: 'IEC 61730 - PV Module Safety' },
  { value: 'IEC 61853', label: 'IEC 61853 - PV Module Energy Rating' },
  { value: 'IEC 60904', label: 'IEC 60904 - PV Device Measurement' },
  { value: 'IEC 62716', label: 'IEC 62716 - Ammonia Corrosion Testing' },
  { value: 'IEC 61701', label: 'IEC 61701 - Salt Mist Corrosion Testing' },
  { value: 'IEC 62804', label: 'IEC 62804 - PID Testing' },
  { value: 'UL 1703', label: 'UL 1703 - Flat-Plate PV Modules' },
  { value: 'IS 14286', label: 'IS 14286 - BIS Standard' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const;

export const DOCUMENT_CATEGORIES = [
  { value: 'procedure', label: 'Standard Operating Procedure (SOP)' },
  { value: 'work_instruction', label: 'Work Instruction' },
  { value: 'form', label: 'Form / Template' },
  { value: 'record', label: 'Record' },
  { value: 'specification', label: 'Specification' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'report', label: 'Report' },
  { value: 'manual', label: 'Manual' },
  { value: 'policy', label: 'Policy' },
] as const;

export const CAPA_SOURCES = [
  'Internal Audit',
  'External Audit',
  'Customer Complaint',
  'Management Review',
  'Test Nonconformity',
  'Equipment Failure',
  'Proficiency Testing',
  'Process Deviation',
  'Near Miss',
  'Observation',
] as const;

export const EIGHT_D_STEPS = [
  { step: 1, title: 'D1 - Team Formation', description: 'Establish a cross-functional team with process knowledge' },
  { step: 2, title: 'D2 - Problem Description', description: 'Describe the problem using 5W2H methodology' },
  { step: 3, title: 'D3 - Containment Actions', description: 'Define and implement interim containment actions' },
  { step: 4, title: 'D4 - Root Cause Analysis', description: 'Identify all potential causes using fishbone/5-why analysis' },
  { step: 5, title: 'D5 - Corrective Actions', description: 'Select and verify permanent corrective actions' },
  { step: 6, title: 'D6 - Implementation', description: 'Implement and validate corrective actions' },
  { step: 7, title: 'D7 - Prevention', description: 'Prevent recurrence by updating systems and procedures' },
  { step: 8, title: 'D8 - Closure', description: 'Recognize team contributions and close the CAPA' },
] as const;
