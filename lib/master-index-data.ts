// Master Test Index data for IEC standards

export type TestStatus = "completed" | "in_progress" | "scheduled" | "not_started" | "on_hold" | "failed";

export interface MasterTestIndexEntry {
  id: string;
  testId: string;
  testName: string;
  clause: string;
  standard: string;
  status: TestStatus;
  moduleId: string;
  chamber: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  result: "pass" | "fail" | "pending" | "n/a";
  sequence: string;
  remarks: string;
}

export const testStatusConfig: Record<TestStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "#16a34a", bg: "#dcfce7" },
  in_progress: { label: "In Progress", color: "#2563eb", bg: "#dbeafe" },
  scheduled: { label: "Scheduled", color: "#7c3aed", bg: "#ede9fe" },
  not_started: { label: "Not Started", color: "#6b7280", bg: "#f3f4f6" },
  on_hold: { label: "On Hold", color: "#ea580c", bg: "#fff7ed" },
  failed: { label: "Failed", color: "#dc2626", bg: "#fef2f2" },
};

export const masterTestIndex: MasterTestIndexEntry[] = [
  // IEC 61215 tests
  { id: "mi-001", testId: "MQT-01", testName: "Visual Inspection", clause: "MQT 01 (10.1)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Ravi Kumar", startDate: "2026-01-15", endDate: "2026-01-15", result: "pass", sequence: "Seq A - Pre-test", remarks: "No defects found" },
  { id: "mi-002", testId: "MQT-02", testName: "Maximum Power at STC", clause: "MQT 02 (10.2)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "Sun Sim #1 (A+AA)", assignedTo: "Ravi Kumar", startDate: "2026-01-16", endDate: "2026-01-16", result: "pass", sequence: "Seq A - Pre-test", remarks: "Pmax = 405.2 W" },
  { id: "mi-003", testId: "MQT-03", testName: "Insulation Test", clause: "MQT 03 (10.3)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Suresh Iyer", startDate: "2026-01-17", endDate: "2026-01-17", result: "pass", sequence: "Seq A - Pre-test", remarks: "4.2 GΩ" },
  { id: "mi-004", testId: "MQT-04", testName: "Temperature Coefficients", clause: "MQT 04 (10.4)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "Sun Sim #1 (A+AA)", assignedTo: "Ravi Kumar", startDate: "2026-01-20", endDate: "2026-01-22", result: "pass", sequence: "Seq A", remarks: "α=0.05, β=-0.31, γ=-0.38" },
  { id: "mi-005", testId: "MQT-05", testName: "NMOT Determination", clause: "MQT 05 (10.5)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "Outdoor Testbed", assignedTo: "Meena Joshi", startDate: "2026-01-25", endDate: "2026-02-05", result: "pass", sequence: "Seq A", remarks: "NMOT = 44.2°C" },
  { id: "mi-006", testId: "MQT-06", testName: "Performance at STC/NMOT", clause: "MQT 06 (10.6)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "Sun Sim #1 (A+AA)", assignedTo: "Ravi Kumar", startDate: "2026-02-06", endDate: "2026-02-06", result: "pass", sequence: "Seq A", remarks: "STC: 405.2W, NMOT: 302.1W" },
  { id: "mi-007", testId: "MQT-07", testName: "Hot-Spot Endurance", clause: "MQT 07 (10.7)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "Sun Sim #2", assignedTo: "Suresh Iyer", startDate: "2026-02-08", endDate: "2026-02-08", result: "pass", sequence: "Seq A", remarks: "Max cell T=128°C, -1.2% degradation" },
  { id: "mi-008", testId: "MQT-08", testName: "UV Preconditioning", clause: "MQT 08 (10.8)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "UV Chamber #1", assignedTo: "Meena Joshi", startDate: "2026-02-10", endDate: "2026-02-22", result: "pass", sequence: "Seq B", remarks: "UVA=16.2 kWh/m², UVB=5.4 kWh/m²" },
  { id: "mi-009", testId: "MQT-09", testName: "Thermal Cycling TC200", clause: "MQT 09 (10.9)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "TC Chamber #1", assignedTo: "Vikram Desai", startDate: "2026-02-23", endDate: "2026-03-01", result: "pass", sequence: "Seq B", remarks: "-2.1% degradation" },
  { id: "mi-010", testId: "MQT-10", testName: "Humidity-Freeze HF10", clause: "MQT 10 (10.10)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0145", chamber: "HF Chamber #1", assignedTo: "Vikram Desai", startDate: "2026-03-01", endDate: "2026-03-03", result: "pass", sequence: "Seq B", remarks: "-0.8% degradation" },
  { id: "mi-011", testId: "MQT-11", testName: "Damp Heat DH1000", clause: "MQT 11 (10.11)", standard: "IEC 61215", status: "in_progress", moduleId: "MOD-2026-0145", chamber: "DH Chamber #1", assignedTo: "Meena Joshi", startDate: "2026-03-04", endDate: "", result: "pending", sequence: "Seq C", remarks: "720h completed, 280h remaining" },
  { id: "mi-012", testId: "MQT-12", testName: "Robustness of Terminations", clause: "MQT 12 (10.12)", standard: "IEC 61215", status: "scheduled", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Ravi Kumar", startDate: "2026-03-20", endDate: "", result: "pending", sequence: "Seq C", remarks: "Awaiting DH completion" },
  { id: "mi-013", testId: "MQT-13", testName: "Wet Leakage Current", clause: "MQT 13 (10.13)", standard: "IEC 61215", status: "scheduled", moduleId: "MOD-2026-0145", chamber: "Wet Leakage Tank", assignedTo: "Suresh Iyer", startDate: "2026-03-21", endDate: "", result: "pending", sequence: "Seq C", remarks: "" },
  { id: "mi-014", testId: "MQT-14", testName: "Mechanical Load", clause: "MQT 14 (10.14)", standard: "IEC 61215", status: "not_started", moduleId: "MOD-2026-0145", chamber: "ML Tester #1", assignedTo: "Vikram Desai", startDate: "", endDate: "", result: "pending", sequence: "Seq D", remarks: "" },
  { id: "mi-015", testId: "MQT-15", testName: "Hail Test", clause: "MQT 15 (10.15)", standard: "IEC 61215", status: "not_started", moduleId: "MOD-2026-0145", chamber: "Hail Launcher", assignedTo: "Suresh Iyer", startDate: "", endDate: "", result: "pending", sequence: "Seq D", remarks: "" },
  { id: "mi-016", testId: "MQT-16", testName: "Bypass Diode Thermal", clause: "MQT 16 (10.16)", standard: "IEC 61215", status: "not_started", moduleId: "MOD-2026-0145", chamber: "TC Chamber #2", assignedTo: "Ravi Kumar", startDate: "", endDate: "", result: "pending", sequence: "Seq D", remarks: "" },
  { id: "mi-017", testId: "MQT-17", testName: "Static Mechanical Load", clause: "MQT 17 (10.17)", standard: "IEC 61215", status: "not_started", moduleId: "MOD-2026-0145", chamber: "ML Tester #1", assignedTo: "Vikram Desai", startDate: "", endDate: "", result: "pending", sequence: "Seq D", remarks: "" },

  // IEC 61730 tests
  { id: "mi-018", testId: "MST-01", testName: "Visual Inspection", clause: "MST 01", standard: "IEC 61730", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Ravi Kumar", startDate: "2026-01-15", endDate: "2026-01-15", result: "pass", sequence: "Safety Seq", remarks: "No safety hazards" },
  { id: "mi-019", testId: "MST-02", testName: "Accessibility Test", clause: "MST 02", standard: "IEC 61730", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Suresh Iyer", startDate: "2026-01-16", endDate: "2026-01-16", result: "pass", sequence: "Safety Seq", remarks: "No live parts accessible" },
  { id: "mi-020", testId: "MST-03", testName: "Cut Susceptibility", clause: "MST 03", standard: "IEC 61730", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Suresh Iyer", startDate: "2026-01-17", endDate: "2026-01-17", result: "pass", sequence: "Safety Seq", remarks: "" },
  { id: "mi-021", testId: "MST-04", testName: "Ground Continuity", clause: "MST 04", standard: "IEC 61730", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Ravi Kumar", startDate: "2026-01-18", endDate: "2026-01-18", result: "pass", sequence: "Safety Seq", remarks: "0.08 Ω" },
  { id: "mi-022", testId: "MST-05", testName: "Impulse Voltage", clause: "MST 05", standard: "IEC 61730", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Suresh Iyer", startDate: "2026-02-10", endDate: "2026-02-10", result: "pass", sequence: "Safety Seq", remarks: "No flashover" },
  { id: "mi-023", testId: "MST-06", testName: "Dielectric Withstand", clause: "MST 06", standard: "IEC 61730", status: "completed", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Suresh Iyer", startDate: "2026-02-11", endDate: "2026-02-11", result: "pass", sequence: "Safety Seq", remarks: "" },
  { id: "mi-024", testId: "MST-07", testName: "Wet Leakage Current", clause: "MST 07", standard: "IEC 61730", status: "completed", moduleId: "MOD-2026-0145", chamber: "Wet Leakage Tank", assignedTo: "Ravi Kumar", startDate: "2026-02-12", endDate: "2026-02-12", result: "pass", sequence: "Safety Seq", remarks: "12 µA" },
  { id: "mi-025", testId: "MST-08", testName: "Temperature Test", clause: "MST 08", standard: "IEC 61730", status: "in_progress", moduleId: "MOD-2026-0145", chamber: "Sun Sim #2", assignedTo: "Meena Joshi", startDate: "2026-03-08", endDate: "", result: "pending", sequence: "Safety Seq", remarks: "Data collection ongoing" },
  { id: "mi-026", testId: "MST-09", testName: "Hot-Spot Test (Safety)", clause: "MST 09", standard: "IEC 61730", status: "scheduled", moduleId: "MOD-2026-0145", chamber: "Sun Sim #2", assignedTo: "Suresh Iyer", startDate: "2026-03-12", endDate: "", result: "pending", sequence: "Safety Seq", remarks: "" },
  { id: "mi-027", testId: "MST-10", testName: "Reverse Current Overload", clause: "MST 10", standard: "IEC 61730", status: "not_started", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Vikram Desai", startDate: "", endDate: "", result: "pending", sequence: "Safety Seq", remarks: "" },
  { id: "mi-028", testId: "MST-11", testName: "Module Breakage", clause: "MST 11", standard: "IEC 61730", status: "not_started", moduleId: "MOD-2026-0145", chamber: "-", assignedTo: "Ravi Kumar", startDate: "", endDate: "", result: "pending", sequence: "Safety Seq", remarks: "" },
  { id: "mi-029", testId: "MST-12", testName: "Fire Test", clause: "MST 12", standard: "IEC 61730", status: "not_started", moduleId: "MOD-2026-0145", chamber: "Fire Test Rig", assignedTo: "Vikram Desai", startDate: "", endDate: "", result: "pending", sequence: "Safety Seq", remarks: "" },

  // IEC 61853 tests
  { id: "mi-030", testId: "61853-PM", testName: "Power Rating Matrix", clause: "Clause 7", standard: "IEC 61853", status: "completed", moduleId: "MOD-2026-0139", chamber: "Sun Sim #1 (A+AA)", assignedTo: "Ravi Kumar", startDate: "2026-02-01", endDate: "2026-02-05", result: "pass", sequence: "Energy Rating", remarks: "28-point matrix complete" },
  { id: "mi-031", testId: "61853-SR", testName: "Spectral Response", clause: "Clause 9", standard: "IEC 61853", status: "completed", moduleId: "MOD-2026-0139", chamber: "Spectral Lab", assignedTo: "Meena Joshi", startDate: "2026-02-06", endDate: "2026-02-08", result: "pass", sequence: "Energy Rating", remarks: "300-1200nm covered" },
  { id: "mi-032", testId: "61853-AR", testName: "Angle of Incidence", clause: "Clause 10", standard: "IEC 61853", status: "completed", moduleId: "MOD-2026-0139", chamber: "AOI Goniometer", assignedTo: "Ravi Kumar", startDate: "2026-02-10", endDate: "2026-02-11", result: "pass", sequence: "Energy Rating", remarks: "0-85° measured" },
  { id: "mi-033", testId: "61853-TC", testName: "Temperature Coefficients", clause: "Clause 11", standard: "IEC 61853", status: "completed", moduleId: "MOD-2026-0139", chamber: "Sun Sim #1 (A+AA)", assignedTo: "Ravi Kumar", startDate: "2026-02-12", endDate: "2026-02-13", result: "pass", sequence: "Energy Rating", remarks: "R²>0.99 all coefficients" },
  { id: "mi-034", testId: "61853-ER", testName: "Energy Rating (CSER)", clause: "Clause 8", standard: "IEC 61853", status: "in_progress", moduleId: "MOD-2026-0139", chamber: "-", assignedTo: "Meena Joshi", startDate: "2026-03-05", endDate: "", result: "pending", sequence: "Energy Rating", remarks: "Calculation in progress" },

  // IEC 61701 tests
  { id: "mi-035", testId: "SM-S1", testName: "Salt Mist - Severity 1", clause: "Clause 7 (Sev 1)", standard: "IEC 61701", status: "completed", moduleId: "MOD-2026-0142", chamber: "Salt Spray #1", assignedTo: "Vikram Desai", startDate: "2026-01-10", endDate: "2026-01-18", result: "pass", sequence: "Corrosion", remarks: "-1.2% degradation" },
  { id: "mi-036", testId: "SM-S6", testName: "Salt Mist - Severity 6", clause: "Clause 7 (Sev 6)", standard: "IEC 61701", status: "in_progress", moduleId: "MOD-2026-0142", chamber: "Salt Spray #1", assignedTo: "Vikram Desai", startDate: "2026-02-01", endDate: "", result: "pending", sequence: "Corrosion", remarks: "64/96 cycles done" },

  // Additional modules - IEC 61215
  { id: "mi-037", testId: "MQT-01", testName: "Visual Inspection", clause: "MQT 01 (10.1)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0139", chamber: "-", assignedTo: "Ravi Kumar", startDate: "2026-01-20", endDate: "2026-01-20", result: "pass", sequence: "Seq A - Pre-test", remarks: "" },
  { id: "mi-038", testId: "MQT-02", testName: "Maximum Power at STC", clause: "MQT 02 (10.2)", standard: "IEC 61215", status: "completed", moduleId: "MOD-2026-0139", chamber: "Sun Sim #1 (A+AA)", assignedTo: "Ravi Kumar", startDate: "2026-01-21", endDate: "2026-01-21", result: "pass", sequence: "Seq A - Pre-test", remarks: "Pmax = 410.5 W" },
  { id: "mi-039", testId: "MQT-09", testName: "Thermal Cycling TC200", clause: "MQT 09 (10.9)", standard: "IEC 61215", status: "on_hold", moduleId: "MOD-2026-0139", chamber: "TC Chamber #1", assignedTo: "Vikram Desai", startDate: "2026-02-15", endDate: "", result: "pending", sequence: "Seq B", remarks: "Chamber maintenance - 120/200 cycles" },
  { id: "mi-040", testId: "MQT-11", testName: "Damp Heat DH1000", clause: "MQT 11 (10.11)", standard: "IEC 61215", status: "failed", moduleId: "MOD-2026-0134", chamber: "DH Chamber #2", assignedTo: "Meena Joshi", startDate: "2026-01-05", endDate: "2026-02-20", result: "fail", sequence: "Seq C", remarks: "-7.2% degradation, exceeds 5% limit" },
];
