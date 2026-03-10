// Master Test Index data for IEC standards
// Each entry represents a test from the standard with its execution status

export type TestIndexStatus = "completed" | "in_progress" | "scheduled" | "not_started" | "skipped" | "failed";

export interface MasterIndexEntry {
  id: string;
  standard: string;
  clause: string;
  testName: string;
  category: "Design" | "Safety" | "Performance" | "Durability" | "Environmental" | "Measurement";
  status: TestIndexStatus;
  moduleId: string;
  assignedTo: string;
  scheduledDate: string;
  completedDate: string;
  result: "pass" | "fail" | "pending" | "n/a";
  remarks: string;
  equipment: string;
  sequence: number;
}

export const masterIndexData: MasterIndexEntry[] = [
  // IEC 61215 Tests
  { id: "mi-001", standard: "IEC 61215", clause: "MQT 01", testName: "Visual Inspection (Initial)", category: "Design", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-01-15", completedDate: "2026-01-15", result: "pass", remarks: "No visible defects", equipment: "Visual Inspection Booth", sequence: 1 },
  { id: "mi-002", standard: "IEC 61215", clause: "MQT 02", testName: "Maximum Power Determination at STC", category: "Performance", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-01-16", completedDate: "2026-01-16", result: "pass", remarks: "Pmax = 405.2W (Rated: 400W)", equipment: "Sun Simulator SS-1600", sequence: 2 },
  { id: "mi-003", standard: "IEC 61215", clause: "MQT 03", testName: "Insulation Test", category: "Safety", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-01-17", completedDate: "2026-01-17", result: "pass", remarks: "Rins = 4.2 GΩ (>40 MΩ)", equipment: "Insulation Tester IR-500", sequence: 3 },
  { id: "mi-004", standard: "IEC 61215", clause: "MQT 04", testName: "Temperature Coefficients Measurement", category: "Performance", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-01-20", completedDate: "2026-01-21", result: "pass", remarks: "α=0.05%/K, β=-0.31%/K", equipment: "Sun Simulator SS-1600 + TC Chamber", sequence: 4 },
  { id: "mi-005", standard: "IEC 61215", clause: "MQT 05", testName: "NMOT Determination", category: "Performance", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-01-22", completedDate: "2026-01-23", result: "pass", remarks: "NMOT = 43.5°C", equipment: "Outdoor Test Stand", sequence: 5 },
  { id: "mi-006", standard: "IEC 61215", clause: "MQT 06", testName: "Performance at STC & NMOT", category: "Performance", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-01-24", completedDate: "2026-01-24", result: "pass", remarks: "Within tolerance", equipment: "Sun Simulator SS-1600", sequence: 6 },
  { id: "mi-007", standard: "IEC 61215", clause: "MQT 07", testName: "Performance at Low Irradiance", category: "Performance", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-01-25", completedDate: "2026-01-25", result: "pass", remarks: "P200 = 76.8W", equipment: "Sun Simulator SS-1600", sequence: 7 },
  { id: "mi-008", standard: "IEC 61215", clause: "MQT 08", testName: "Outdoor Exposure Test", category: "Durability", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Meena Joshi", scheduledDate: "2026-01-27", completedDate: "2026-02-10", result: "pass", remarks: "60 kWh/m² cumulative", equipment: "Outdoor Rack OT-3", sequence: 8 },
  { id: "mi-009", standard: "IEC 61215", clause: "MQT 09", testName: "Hot-Spot Endurance Test", category: "Safety", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-02-11", completedDate: "2026-02-12", result: "pass", remarks: "No degradation observed", equipment: "Sun Simulator SS-1600", sequence: 9 },
  { id: "mi-010", standard: "IEC 61215", clause: "MQT 10", testName: "UV Preconditioning", category: "Durability", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Meena Joshi", scheduledDate: "2026-02-13", completedDate: "2026-02-20", result: "pass", remarks: "15 kWh/m² UV dose", equipment: "UV Chamber UV-2000", sequence: 10 },
  { id: "mi-011", standard: "IEC 61215", clause: "MQT 11", testName: "Thermal Cycling TC200", category: "Durability", status: "in_progress", moduleId: "MOD-2026-0145", assignedTo: "Meena Joshi", scheduledDate: "2026-02-21", completedDate: "", result: "pending", remarks: "Cycle 156/200 completed", equipment: "TC Chamber TC-3000", sequence: 11 },
  { id: "mi-012", standard: "IEC 61215", clause: "MQT 12", testName: "Humidity-Freeze HF10", category: "Durability", status: "scheduled", moduleId: "MOD-2026-0145", assignedTo: "Meena Joshi", scheduledDate: "2026-03-15", completedDate: "", result: "pending", remarks: "", equipment: "HF Chamber HF-1500", sequence: 12 },
  { id: "mi-013", standard: "IEC 61215", clause: "MQT 13", testName: "Damp Heat DH1000", category: "Durability", status: "scheduled", moduleId: "MOD-2026-0145", assignedTo: "Meena Joshi", scheduledDate: "2026-03-20", completedDate: "", result: "pending", remarks: "", equipment: "DH Chamber DH-5000", sequence: 13 },
  { id: "mi-014", standard: "IEC 61215", clause: "MQT 14", testName: "Robustness of Terminations", category: "Safety", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-04-15", completedDate: "", result: "pending", remarks: "", equipment: "Mechanical Tester", sequence: 14 },
  { id: "mi-015", standard: "IEC 61215", clause: "MQT 15", testName: "Wet Leakage Current", category: "Safety", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-04-20", completedDate: "", result: "pending", remarks: "", equipment: "Leakage Current Tester", sequence: 15 },
  { id: "mi-016", standard: "IEC 61215", clause: "MQT 16", testName: "Mechanical Load Test", category: "Durability", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-04-25", completedDate: "", result: "pending", remarks: "", equipment: "Mechanical Load Frame ML-1000", sequence: 16 },
  { id: "mi-017", standard: "IEC 61215", clause: "MQT 17", testName: "Hail Test", category: "Durability", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-05-01", completedDate: "", result: "pending", remarks: "", equipment: "Hail Tester HT-200", sequence: 17 },
  { id: "mi-018", standard: "IEC 61215", clause: "MQT 18", testName: "Bypass Diode Thermal Test", category: "Safety", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-05-05", completedDate: "", result: "pending", remarks: "", equipment: "Diode Tester", sequence: 18 },
  { id: "mi-019", standard: "IEC 61215", clause: "MQT 19", testName: "Static Mechanical Load", category: "Durability", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-05-10", completedDate: "", result: "pending", remarks: "", equipment: "Static Load Frame", sequence: 19 },

  // IEC 61730 Tests
  { id: "mi-020", standard: "IEC 61730", clause: "MST 01", testName: "Visual Inspection", category: "Safety", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-01-15", completedDate: "2026-01-15", result: "pass", remarks: "No safety concerns", equipment: "Visual Inspection Booth", sequence: 1 },
  { id: "mi-021", standard: "IEC 61730", clause: "MST 02", testName: "Accessibility Test", category: "Safety", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-01-16", completedDate: "2026-01-16", result: "pass", remarks: "IP rated", equipment: "Test Probe Kit", sequence: 2 },
  { id: "mi-022", standard: "IEC 61730", clause: "MST 03", testName: "Cut Susceptibility Test", category: "Safety", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-01-17", completedDate: "2026-01-17", result: "pass", remarks: "No penetration", equipment: "Cut Test Apparatus", sequence: 3 },
  { id: "mi-023", standard: "IEC 61730", clause: "MST 04", testName: "Ground Continuity Test", category: "Safety", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-01-18", completedDate: "2026-01-18", result: "pass", remarks: "R = 0.08Ω (<0.1Ω)", equipment: "Ground Bond Tester", sequence: 4 },
  { id: "mi-024", standard: "IEC 61730", clause: "MST 05", testName: "Impulse Voltage Test", category: "Safety", status: "completed", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-01-20", completedDate: "2026-01-20", result: "pass", remarks: "No flashover", equipment: "Impulse Voltage Generator", sequence: 5 },
  { id: "mi-025", standard: "IEC 61730", clause: "MST 06", testName: "Dielectric Withstand Test", category: "Safety", status: "in_progress", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-03-08", completedDate: "", result: "pending", remarks: "Testing at 3000V AC", equipment: "Hipot Tester HV-5000", sequence: 6 },
  { id: "mi-026", standard: "IEC 61730", clause: "MST 07", testName: "Wet Leakage Current", category: "Safety", status: "scheduled", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-03-12", completedDate: "", result: "pending", remarks: "", equipment: "Leakage Current Tester", sequence: 7 },
  { id: "mi-027", standard: "IEC 61730", clause: "MST 08", testName: "Temperature Test", category: "Safety", status: "scheduled", moduleId: "MOD-2026-0145", assignedTo: "Meena Joshi", scheduledDate: "2026-03-18", completedDate: "", result: "pending", remarks: "", equipment: "TC Chamber TC-3000", sequence: 8 },
  { id: "mi-028", standard: "IEC 61730", clause: "MST 09", testName: "Hot-Spot Test (Safety)", category: "Safety", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-03-25", completedDate: "", result: "pending", remarks: "", equipment: "Sun Simulator SS-1600", sequence: 9 },
  { id: "mi-029", standard: "IEC 61730", clause: "MST 10", testName: "Reverse Current Overload", category: "Safety", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Suresh Iyer", scheduledDate: "2026-04-01", completedDate: "", result: "pending", remarks: "", equipment: "DC Power Supply", sequence: 10 },
  { id: "mi-030", standard: "IEC 61730", clause: "MST 11", testName: "Module Breakage Test", category: "Safety", status: "not_started", moduleId: "MOD-2026-0145", assignedTo: "Ravi Kumar", scheduledDate: "2026-04-05", completedDate: "", result: "pending", remarks: "", equipment: "Impact Tester", sequence: 11 },
  { id: "mi-031", standard: "IEC 61730", clause: "MST 12", testName: "Fire Test (Class C)", category: "Safety", status: "skipped", moduleId: "MOD-2026-0145", assignedTo: "N/A", scheduledDate: "", completedDate: "", result: "n/a", remarks: "Not applicable for this module class", equipment: "Fire Test Chamber", sequence: 12 },

  // IEC 61853 Tests
  { id: "mi-032", standard: "IEC 61853", clause: "Clause 7", testName: "Power Rating Matrix (Multi-condition)", category: "Performance", status: "completed", moduleId: "MOD-2026-0139", assignedTo: "Ravi Kumar", scheduledDate: "2026-02-01", completedDate: "2026-02-05", result: "pass", remarks: "22 I-V measurements at varying irradiance/temperature", equipment: "Sun Simulator SS-1600", sequence: 1 },
  { id: "mi-033", standard: "IEC 61853", clause: "Clause 8", testName: "Energy Rating (CSER Calculation)", category: "Performance", status: "completed", moduleId: "MOD-2026-0139", assignedTo: "Ravi Kumar", scheduledDate: "2026-02-06", completedDate: "2026-02-08", result: "pass", remarks: "CSER calculated for 6 climate profiles", equipment: "Software + Data Logger", sequence: 2 },
  { id: "mi-034", standard: "IEC 61853", clause: "Clause 9", testName: "Spectral Response Measurement", category: "Performance", status: "in_progress", moduleId: "MOD-2026-0139", assignedTo: "Suresh Iyer", scheduledDate: "2026-03-01", completedDate: "", result: "pending", remarks: "Wavelength scan 300-1200nm in progress", equipment: "Spectroradiometer SR-3000", sequence: 3 },
  { id: "mi-035", standard: "IEC 61853", clause: "Clause 10", testName: "Angular Response (IAM)", category: "Performance", status: "scheduled", moduleId: "MOD-2026-0139", assignedTo: "Suresh Iyer", scheduledDate: "2026-03-15", completedDate: "", result: "pending", remarks: "", equipment: "Goniometric Stage + SS-1600", sequence: 4 },
  { id: "mi-036", standard: "IEC 61853", clause: "Clause 11", testName: "Temperature Coefficients", category: "Performance", status: "scheduled", moduleId: "MOD-2026-0139", assignedTo: "Ravi Kumar", scheduledDate: "2026-03-20", completedDate: "", result: "pending", remarks: "", equipment: "Sun Simulator + TC Chamber", sequence: 5 },

  // IEC 61701 Tests
  { id: "mi-037", standard: "IEC 61701", clause: "Sev 1", testName: "Salt Mist Severity 1 (4 cycles)", category: "Environmental", status: "completed", moduleId: "MOD-2026-0142", assignedTo: "Meena Joshi", scheduledDate: "2026-01-10", completedDate: "2026-01-24", result: "pass", remarks: "No corrosion observed", equipment: "Salt Mist Chamber SM-500", sequence: 1 },
  { id: "mi-038", standard: "IEC 61701", clause: "Sev 2", testName: "Salt Mist Severity 2 (8 cycles)", category: "Environmental", status: "in_progress", moduleId: "MOD-2026-0142", assignedTo: "Meena Joshi", scheduledDate: "2026-02-01", completedDate: "", result: "pending", remarks: "Cycle 6/8 completed", equipment: "Salt Mist Chamber SM-500", sequence: 2 },
  { id: "mi-039", standard: "IEC 61701", clause: "Sev 3", testName: "Salt Mist Severity 3 (16 cycles)", category: "Environmental", status: "scheduled", moduleId: "MOD-2026-0142", assignedTo: "Meena Joshi", scheduledDate: "2026-03-15", completedDate: "", result: "pending", remarks: "", equipment: "Salt Mist Chamber SM-500", sequence: 3 },
  { id: "mi-040", standard: "IEC 61701", clause: "Sev 6", testName: "Salt Mist Severity 6 (96 cycles)", category: "Environmental", status: "not_started", moduleId: "MOD-2026-0142", assignedTo: "Meena Joshi", scheduledDate: "2026-05-01", completedDate: "", result: "pending", remarks: "", equipment: "Salt Mist Chamber SM-500", sequence: 4 },
  { id: "mi-041", standard: "IEC 61701", clause: "Visual", testName: "Post-Exposure Visual Inspection", category: "Environmental", status: "not_started", moduleId: "MOD-2026-0142", assignedTo: "Ravi Kumar", scheduledDate: "2026-06-01", completedDate: "", result: "pending", remarks: "", equipment: "Visual Inspection Booth", sequence: 5 },
  { id: "mi-042", standard: "IEC 61701", clause: "I-V", testName: "Post-Exposure I-V Measurement", category: "Environmental", status: "not_started", moduleId: "MOD-2026-0142", assignedTo: "Ravi Kumar", scheduledDate: "2026-06-02", completedDate: "", result: "pending", remarks: "", equipment: "Sun Simulator SS-1600", sequence: 6 },
];

export const standardInfo: Record<string, { fullName: string; edition: string; totalTests: number }> = {
  "IEC 61215": { fullName: "Design Qualification & Type Approval", edition: "2021 Ed.2", totalTests: 19 },
  "IEC 61730": { fullName: "PV Module Safety Qualification", edition: "2016 Ed.2", totalTests: 12 },
  "IEC 61853": { fullName: "PV Module Energy Rating", edition: "2018 Ed.1", totalTests: 5 },
  "IEC 61701": { fullName: "Salt Mist Corrosion Testing", edition: "2020 Ed.3", totalTests: 6 },
};
