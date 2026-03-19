import type { EquipmentCalendarEvent, EquipmentCalendarStatus } from "@/lib/types/equipment-calendar";

export const equipmentCalendarEvents: EquipmentCalendarEvent[] = [
  // Running tests (GREEN)
  { id: "ECE-001", equipmentId: "EQ-TC-01", equipmentName: "Thermal Cycling Chamber TC-01", equipmentCategory: "Climate Chamber", status: "running", title: "TC200 - IEC 61215 MQT 11", startDate: "2026-03-10", endDate: "2026-04-15", testName: "Thermal Cycling TC200", sampleId: "SM-500B #1-4", projectId: "PRJ-2026-001", projectName: "SunPower SPR-MAX6-450", operator: "Kumar", notes: "TC200 cycle 145/200" },
  { id: "ECE-002", equipmentId: "EQ-TC-02", equipmentName: "Thermal Cycling Chamber TC-02", equipmentCategory: "Climate Chamber", status: "running", title: "TC200 - IEC 61215 MQT 11", startDate: "2026-03-12", endDate: "2026-04-20", testName: "Thermal Cycling TC200", sampleId: "IS-600T #1-2", projectId: "PRJ-2026-004", projectName: "IndiSolar IS-600T", operator: "Sharma", notes: "TC200 cycle 120/200" },
  { id: "ECE-003", equipmentId: "EQ-DH-01", equipmentName: "Damp Heat Chamber DH-01", equipmentCategory: "Climate Chamber", status: "running", title: "DH1000 - IEC 61215 MQT 13", startDate: "2026-03-01", endDate: "2026-04-12", testName: "Damp Heat DH1000", sampleId: "SM-500B #5-8", projectId: "PRJ-2026-001", projectName: "SunPower SPR-MAX6-450", operator: "Sharma", notes: "DH1000 720h/1000h done" },
  { id: "ECE-004", equipmentId: "EQ-UV-01", equipmentName: "UV Chamber UV-01", equipmentCategory: "UV Chamber", status: "running", title: "UV Preconditioning - IEC 61215 MQT 10", startDate: "2026-03-05", endDate: "2026-03-20", testName: "UV Preconditioning", sampleId: "SM-500B #9-12", projectId: "PRJ-2026-001", projectName: "SunPower SPR-MAX6-450", operator: "Patel", notes: "UV 45/60 kWh/m2" },
  { id: "ECE-005", equipmentId: "EQ-SS-01", equipmentName: "Sun Simulator SS-01", equipmentCategory: "Sun Simulator", status: "running", title: "IEC 60904-1 STC Measurement", startDate: "2026-03-16", endDate: "2026-03-16", testName: "STC Power Measurement", sampleId: "GP-400M #1", projectId: "PRJ-2026-002", projectName: "GreenPower GP-400M", operator: "Kumar", notes: "Initial STC measurement" },
  { id: "ECE-006", equipmentId: "EQ-HP-01", equipmentName: "Hi-pot Tester HP-01", equipmentCategory: "Hi-pot Tester", status: "running", title: "Dielectric Withstand Test", startDate: "2026-03-18", endDate: "2026-03-18", testName: "IEC 61730 Dielectric", sampleId: "IS-600T #3", projectId: "PRJ-2026-004", projectName: "IndiSolar IS-600T", operator: "Deepa Iyer", notes: "Safety testing" },

  // Booked/Scheduled (BLUE)
  { id: "ECE-007", equipmentId: "EQ-TC-05", equipmentName: "Thermal Cycling Chamber TC-05", equipmentCategory: "Climate Chamber", status: "booked", title: "TC200 - Jinko Tiger Neo", startDate: "2026-03-20", endDate: "2026-05-01", testName: "Thermal Cycling TC200", sampleId: null, projectId: "PRJ-2026-005", projectName: "Jinko Tiger Neo N-type", operator: "TBD", notes: "Reserved for Jinko project" },
  { id: "ECE-008", equipmentId: "EQ-DH-02", equipmentName: "Damp Heat Chamber DH-02", equipmentCategory: "Climate Chamber", status: "booked", title: "DH1000 - Jinko Tiger Neo", startDate: "2026-03-25", endDate: "2026-05-10", testName: "Damp Heat DH1000", sampleId: null, projectId: "PRJ-2026-005", projectName: "Jinko Tiger Neo N-type", operator: "TBD", notes: "Scheduled after TC starts" },
  { id: "ECE-009", equipmentId: "EQ-SS-01", equipmentName: "Sun Simulator SS-01", equipmentCategory: "Sun Simulator", status: "booked", title: "STC - Adani Mono PERC", startDate: "2026-03-22", endDate: "2026-03-23", testName: "STC Power Measurement", sampleId: null, projectId: "PRJ-2026-006", projectName: "Adani Mono PERC 540W", operator: "Kumar", notes: "Pre-test baseline measurements" },
  { id: "ECE-010", equipmentId: "EQ-ML-01", equipmentName: "Mechanical Load Tester ML-01", equipmentCategory: "Mechanical Load", status: "booked", title: "Mechanical Load IEC 61215", startDate: "2026-03-24", endDate: "2026-03-26", testName: "Static Mechanical Load", sampleId: "SM-500B #13-14", projectId: "PRJ-2026-001", projectName: "SunPower SPR-MAX6-450", operator: "Kavitha Nair", notes: "5400Pa front / 2400Pa rear" },

  // Breakdown (RED)
  { id: "ECE-011", equipmentId: "EQ-TC-04", equipmentName: "Thermal Cycling Chamber TC-04", equipmentCategory: "Climate Chamber", status: "breakdown", title: "Compressor Failure", startDate: "2026-03-14", endDate: "2026-03-21", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Maintenance Team", notes: "Compressor seized - replacement ordered" },
  { id: "ECE-012", equipmentId: "EQ-IR-01", equipmentName: "IR Camera IR-01", equipmentCategory: "IR Camera", status: "breakdown", title: "Sensor Malfunction", startDate: "2026-03-17", endDate: "2026-03-19", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Maintenance Team", notes: "Thermal sensor drift - recalibration needed" },

  // Maintenance (ORANGE)
  { id: "ECE-013", equipmentId: "EQ-TC-03", equipmentName: "Thermal Cycling Chamber TC-03", equipmentCategory: "Climate Chamber", status: "maintenance", title: "Quarterly PM Service", startDate: "2026-03-19", endDate: "2026-03-20", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Suresh Kumar", notes: "Quarterly preventive maintenance" },
  { id: "ECE-014", equipmentId: "EQ-DH-04", equipmentName: "Damp Heat Chamber DH-04", equipmentCategory: "Climate Chamber", status: "maintenance", title: "Gasket Replacement", startDate: "2026-03-18", endDate: "2026-03-19", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Suresh Kumar", notes: "Door gasket worn out" },
  { id: "ECE-015", equipmentId: "EQ-EL-02", equipmentName: "EL Camera EL-02", equipmentCategory: "EL Camera", status: "maintenance", title: "Lens Cleaning & Alignment", startDate: "2026-03-20", endDate: "2026-03-20", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Maintenance Team", notes: "Annual lens maintenance" },

  // Calibration (PURPLE)
  { id: "ECE-016", equipmentId: "EQ-DH-03", equipmentName: "Damp Heat Chamber DH-03", equipmentCategory: "Climate Chamber", status: "calibration", title: "Annual Calibration", startDate: "2026-03-15", endDate: "2026-03-17", testName: null, sampleId: null, projectId: null, projectName: null, operator: "ExtCal Services", notes: "Annual calibration overdue" },
  { id: "ECE-017", equipmentId: "EQ-HP-02", equipmentName: "Hi-pot Tester HP-02", equipmentCategory: "Hi-pot Tester", status: "calibration", title: "Annual Calibration", startDate: "2026-03-18", endDate: "2026-03-19", testName: null, sampleId: null, projectId: null, projectName: null, operator: "ExtCal Services", notes: "Calibration due" },
  { id: "ECE-018", equipmentId: "EQ-SS-02", equipmentName: "Sun Simulator SS-02", equipmentCategory: "Sun Simulator", status: "calibration", title: "Spectral Calibration", startDate: "2026-03-21", endDate: "2026-03-22", testName: null, sampleId: null, projectId: null, projectName: null, operator: "ExtCal Services", notes: "Spectral match recalibration" },

  // Intermediate Checks (YELLOW)
  { id: "ECE-019", equipmentId: "EQ-SS-01", equipmentName: "Sun Simulator SS-01", equipmentCategory: "Sun Simulator", status: "intermediate-check", title: "Weekly Ref Cell Check", startDate: "2026-03-17", endDate: "2026-03-17", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Kumar", notes: "Weekly reference cell verification" },
  { id: "ECE-020", equipmentId: "EQ-IV-01", equipmentName: "IV Tracer IV-01", equipmentCategory: "IV Tracer", status: "intermediate-check", title: "Intermediate Check", startDate: "2026-03-19", endDate: "2026-03-19", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Anil Mehta", notes: "Monthly linearity check" },
  { id: "ECE-021", equipmentId: "EQ-TC-01", equipmentName: "Thermal Cycling Chamber TC-01", equipmentCategory: "Climate Chamber", status: "intermediate-check", title: "Temperature Uniformity Check", startDate: "2026-03-22", endDate: "2026-03-22", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Suresh Kumar", notes: "Quarterly uniformity verification" },

  // Upgradation (TEAL)
  { id: "ECE-022", equipmentId: "EQ-EL-01", equipmentName: "EL Camera EL-01", equipmentCategory: "EL Camera", status: "upgradation", title: "Camera Sensor Upgrade", startDate: "2026-03-23", endDate: "2026-03-27", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Vendor Team", notes: "Upgrading to InGaAs sensor for higher resolution" },
  { id: "ECE-023", equipmentId: "EQ-SS-03", equipmentName: "Sun Simulator SS-03", equipmentCategory: "Sun Simulator", status: "upgradation", title: "LED Source Upgrade", startDate: "2026-03-25", endDate: "2026-03-30", testName: null, sampleId: null, projectId: null, projectName: null, operator: "Vendor Team", notes: "Replacing Xenon with multi-LED source" },
];

export const EQUIPMENT_STATUS_CONFIG: Record<EquipmentCalendarStatus, { label: string; color: string; bgColor: string; borderColor: string; textColor: string }> = {
  running: { label: "Running", color: "bg-green-500", bgColor: "bg-green-100", borderColor: "border-green-400", textColor: "text-green-700" },
  booked: { label: "Booked/Scheduled", color: "bg-blue-500", bgColor: "bg-blue-100", borderColor: "border-blue-400", textColor: "text-blue-700" },
  breakdown: { label: "Breakdown", color: "bg-red-500", bgColor: "bg-red-100", borderColor: "border-red-400", textColor: "text-red-700" },
  maintenance: { label: "Maintenance", color: "bg-orange-500", bgColor: "bg-orange-100", borderColor: "border-orange-400", textColor: "text-orange-700" },
  calibration: { label: "Calibration", color: "bg-purple-500", bgColor: "bg-purple-100", borderColor: "border-purple-400", textColor: "text-purple-700" },
  "intermediate-check": { label: "Intermediate Check", color: "bg-yellow-500", bgColor: "bg-yellow-100", borderColor: "border-yellow-400", textColor: "text-yellow-700" },
  upgradation: { label: "Upgradation", color: "bg-teal-500", bgColor: "bg-teal-100", borderColor: "border-teal-400", textColor: "text-teal-700" },
};

export const EQUIPMENT_CATEGORIES = [
  "All",
  "Climate Chamber",
  "Sun Simulator",
  "UV Chamber",
  "EL Camera",
  "IR Camera",
  "IV Tracer",
  "Hi-pot Tester",
  "Mechanical Load",
  "Insulation Tester",
] as const;
