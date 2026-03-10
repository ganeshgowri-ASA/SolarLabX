// ---------------------------------------------------------------------------
// Master Index Files — Test Index per IEC standard
// ---------------------------------------------------------------------------

export type TestStatus = "completed" | "in_progress" | "scheduled" | "not_started" | "on_hold" | "failed";

export interface MasterIndexEntry {
  id: string;
  testId: string;
  testName: string;
  standard: string;
  clause: string;
  moduleId: string;
  manufacturer: string;
  sampleType: string;
  testSequence: string;
  status: TestStatus;
  startDate: string;
  endDate: string;
  assignedTo: string;
  equipment: string;
  reportNumber: string;
  result: "pass" | "fail" | "pending" | "n/a";
  remarks: string;
}

export const testStatusColors: Record<TestStatus, { bg: string; text: string }> = {
  completed: { bg: "bg-green-100", text: "text-green-800" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800" },
  scheduled: { bg: "bg-purple-100", text: "text-purple-800" },
  not_started: { bg: "bg-gray-100", text: "text-gray-600" },
  on_hold: { bg: "bg-orange-100", text: "text-orange-800" },
  failed: { bg: "bg-red-100", text: "text-red-800" },
};

export const masterIndexEntries: MasterIndexEntry[] = [
  // IEC 61215 Tests
  {
    id: "mi-001", testId: "T-61215-001", testName: "Visual Inspection", standard: "IEC 61215:2021",
    clause: "MQT 01", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq A - Initial",
    status: "completed", startDate: "2026-02-01", endDate: "2026-02-01",
    assignedTo: "Ravi Kumar", equipment: "Inspection Table IT-01",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "No visual defects observed",
  },
  {
    id: "mi-002", testId: "T-61215-002", testName: "Maximum Power Determination", standard: "IEC 61215:2021",
    clause: "MQT 02", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq A - Initial",
    status: "completed", startDate: "2026-02-02", endDate: "2026-02-02",
    assignedTo: "Suresh Iyer", equipment: "Solar Simulator SS-01 + IV Tracer",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "Pmax = 405.2 W (Nominal 400 W)",
  },
  {
    id: "mi-003", testId: "T-61215-003", testName: "Insulation Test", standard: "IEC 61215:2021",
    clause: "MQT 03", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq A - Initial",
    status: "completed", startDate: "2026-02-02", endDate: "2026-02-02",
    assignedTo: "Ravi Kumar", equipment: "Insulation Tester IR-02",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "Resistance = 4.2 GΩ (Limit >40 MΩ)",
  },
  {
    id: "mi-004", testId: "T-61215-004", testName: "Temperature Coefficients", standard: "IEC 61215:2021",
    clause: "MQT 04", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq A - Characterization",
    status: "completed", startDate: "2026-02-03", endDate: "2026-02-05",
    assignedTo: "Suresh Iyer", equipment: "Environmental Chamber EC-01 + SS-01",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "α=0.05%/K, β=-0.31%/K, γ=-0.38%/K",
  },
  {
    id: "mi-005", testId: "T-61215-005", testName: "NMOT Determination", standard: "IEC 61215:2021",
    clause: "MQT 05", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq A - Characterization",
    status: "completed", startDate: "2026-02-06", endDate: "2026-02-10",
    assignedTo: "Ravi Kumar", equipment: "Outdoor Test Facility",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "NMOT = 44.2°C",
  },
  {
    id: "mi-006", testId: "T-61215-006", testName: "UV Preconditioning", standard: "IEC 61215:2021",
    clause: "MQT 10", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq B - Preconditioning",
    status: "completed", startDate: "2026-02-11", endDate: "2026-02-18",
    assignedTo: "Meena Joshi", equipment: "UV Chamber UV-01",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "15 kWh/m² UVA accumulated",
  },
  {
    id: "mi-007", testId: "T-61215-007", testName: "Thermal Cycling TC200", standard: "IEC 61215:2021",
    clause: "MQT 11", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq C - Stress Test",
    status: "completed", startDate: "2026-02-19", endDate: "2026-03-01",
    assignedTo: "Vikram Desai", equipment: "Thermal Chamber TC-01",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "200 cycles, -2.1% Pmax degradation",
  },
  {
    id: "mi-008", testId: "T-61215-008", testName: "Humidity Freeze HF10", standard: "IEC 61215:2021",
    clause: "MQT 12", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq C - Stress Test",
    status: "in_progress", startDate: "2026-03-02", endDate: "",
    assignedTo: "Vikram Desai", equipment: "Environmental Chamber EC-02",
    reportNumber: "", result: "pending", remarks: "Cycle 7 of 10 completed",
  },
  {
    id: "mi-009", testId: "T-61215-009", testName: "Damp Heat DH1000", standard: "IEC 61215:2021",
    clause: "MQT 13", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq D - Accelerated Aging",
    status: "scheduled", startDate: "2026-03-15", endDate: "",
    assignedTo: "Meena Joshi", equipment: "Humidity Chamber HC-01",
    reportNumber: "", result: "pending", remarks: "Scheduled after HF completion",
  },
  {
    id: "mi-010", testId: "T-61215-010", testName: "Mechanical Load Test", standard: "IEC 61215:2021",
    clause: "MQT 16", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq E - Mechanical",
    status: "not_started", startDate: "", endDate: "",
    assignedTo: "Ravi Kumar", equipment: "Mechanical Load Frame ML-01",
    reportNumber: "", result: "pending", remarks: "",
  },
  {
    id: "mi-011", testId: "T-61215-011", testName: "Hail Test", standard: "IEC 61215:2021",
    clause: "MQT 17", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq E - Mechanical",
    status: "not_started", startDate: "", endDate: "",
    assignedTo: "Ravi Kumar", equipment: "Hail Launcher HL-01",
    reportNumber: "", result: "pending", remarks: "",
  },
  {
    id: "mi-012", testId: "T-61215-012", testName: "Hot-Spot Endurance", standard: "IEC 61215:2021",
    clause: "MQT 09", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Seq B - Preconditioning",
    status: "completed", startDate: "2026-02-11", endDate: "2026-02-12",
    assignedTo: "Suresh Iyer", equipment: "Solar Simulator SS-01 + IR Camera",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "Max cell temp 132°C (limit <150°C)",
  },
  // IEC 61730 Tests
  {
    id: "mi-013", testId: "T-61730-001", testName: "Visual Inspection (Safety)", standard: "IEC 61730:2016",
    clause: "MST 01", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Safety - Initial",
    status: "completed", startDate: "2026-03-03", endDate: "2026-03-03",
    assignedTo: "Ravi Kumar", equipment: "Inspection Table IT-01",
    reportNumber: "TR-2026-0043", result: "pass", remarks: "No safety-critical defects",
  },
  {
    id: "mi-014", testId: "T-61730-002", testName: "Ground Continuity Test", standard: "IEC 61730:2016",
    clause: "MST 13", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Safety - Electrical",
    status: "completed", startDate: "2026-03-04", endDate: "2026-03-04",
    assignedTo: "Suresh Iyer", equipment: "Ground Continuity Tester GC-01",
    reportNumber: "TR-2026-0043", result: "pass", remarks: "Resistance = 0.08 Ω (Limit <0.1 Ω)",
  },
  {
    id: "mi-015", testId: "T-61730-003", testName: "Impulse Voltage Test", standard: "IEC 61730:2016",
    clause: "MST 14", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Safety - Electrical",
    status: "completed", startDate: "2026-03-04", endDate: "2026-03-04",
    assignedTo: "Suresh Iyer", equipment: "Impulse Generator IG-01",
    reportNumber: "TR-2026-0043", result: "pass", remarks: "No flashover or breakdown",
  },
  {
    id: "mi-016", testId: "T-61730-004", testName: "Dielectric Withstand", standard: "IEC 61730:2016",
    clause: "MST 16", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Safety - Electrical",
    status: "in_progress", startDate: "2026-03-08", endDate: "",
    assignedTo: "Suresh Iyer", equipment: "Hipot Tester HT-01",
    reportNumber: "", result: "pending", remarks: "Test in progress",
  },
  {
    id: "mi-017", testId: "T-61730-005", testName: "Fire Test (Class A)", standard: "IEC 61730:2016",
    clause: "MST 23", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Safety - Fire",
    status: "on_hold", startDate: "", endDate: "",
    assignedTo: "Vikram Desai", equipment: "Fire Test Facility FT-01",
    reportNumber: "", result: "pending", remarks: "Awaiting external lab coordination",
  },
  // IEC 61853 Tests
  {
    id: "mi-018", testId: "T-61853-001", testName: "Power Rating Matrix", standard: "IEC 61853:2018",
    clause: "Clause 7", moduleId: "MOD-2026-0139", manufacturer: "GreenPower Corp",
    sampleType: "PV Module", testSequence: "Energy Rating - Power",
    status: "completed", startDate: "2026-03-01", endDate: "2026-03-05",
    assignedTo: "Suresh Iyer", equipment: "SS-01 + EC-01",
    reportNumber: "TR-2026-0044", result: "pass", remarks: "22-point matrix completed",
  },
  {
    id: "mi-019", testId: "T-61853-002", testName: "Spectral Response", standard: "IEC 61853:2018",
    clause: "Clause 9", moduleId: "MOD-2026-0139", manufacturer: "GreenPower Corp",
    sampleType: "PV Module", testSequence: "Energy Rating - Spectral",
    status: "in_progress", startDate: "2026-03-07", endDate: "",
    assignedTo: "Meena Joshi", equipment: "Spectroradiometer SR-01",
    reportNumber: "", result: "pending", remarks: "Measurements at 3 of 6 angles done",
  },
  {
    id: "mi-020", testId: "T-61853-003", testName: "Angular Response (IAM)", standard: "IEC 61853:2018",
    clause: "Clause 10", moduleId: "MOD-2026-0139", manufacturer: "GreenPower Corp",
    sampleType: "PV Module", testSequence: "Energy Rating - Angular",
    status: "scheduled", startDate: "2026-03-12", endDate: "",
    assignedTo: "Meena Joshi", equipment: "Goniometer Stage GS-01",
    reportNumber: "", result: "pending", remarks: "Depends on spectral response completion",
  },
  // IEC 61701 Tests
  {
    id: "mi-021", testId: "T-61701-001", testName: "Salt Mist Corrosion - Severity 1", standard: "IEC 61701:2020",
    clause: "Sev 1", moduleId: "MOD-2026-0142", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Environmental - Salt",
    status: "completed", startDate: "2026-01-10", endDate: "2026-01-20",
    assignedTo: "Vikram Desai", equipment: "Salt Spray Chamber SC-01",
    reportNumber: "TR-2026-0030", result: "pass", remarks: "4 cycles completed, no corrosion",
  },
  {
    id: "mi-022", testId: "T-61701-002", testName: "Salt Mist Corrosion - Severity 6", standard: "IEC 61701:2020",
    clause: "Sev 6", moduleId: "MOD-2026-0142", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Environmental - Salt",
    status: "in_progress", startDate: "2026-02-15", endDate: "",
    assignedTo: "Vikram Desai", equipment: "Salt Spray Chamber SC-01",
    reportNumber: "", result: "pending", remarks: "Cycle 48 of 96",
  },
  // IEC 62804 Test
  {
    id: "mi-023", testId: "T-62804-001", testName: "PID Test (System Voltage)", standard: "IEC 62804:2015",
    clause: "Clause 5", moduleId: "MOD-2026-0139", manufacturer: "GreenPower Corp",
    sampleType: "PV Module", testSequence: "Degradation - PID",
    status: "scheduled", startDate: "2026-03-20", endDate: "",
    assignedTo: "Ravi Kumar", equipment: "PID Test Setup PID-01",
    reportNumber: "", result: "pending", remarks: "96h at 85°C/85%RH + system voltage",
  },
  // Additional IEC 60904 Tests
  {
    id: "mi-024", testId: "T-60904-001", testName: "I-V Characterization at STC", standard: "IEC 60904-1",
    clause: "60904-1", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "PV Module", testSequence: "Measurement - IV",
    status: "completed", startDate: "2026-02-01", endDate: "2026-02-01",
    assignedTo: "Suresh Iyer", equipment: "Solar Simulator SS-01",
    reportNumber: "TR-2026-0042", result: "pass", remarks: "STC measurement baseline",
  },
  {
    id: "mi-025", testId: "T-60904-002", testName: "Sun Simulator Classification", standard: "IEC 60904-9",
    clause: "60904-9", moduleId: "MOD-2026-0145", manufacturer: "SolarTech Industries",
    sampleType: "Equipment Verification", testSequence: "Calibration",
    status: "completed", startDate: "2026-01-15", endDate: "2026-01-15",
    assignedTo: "Meena Joshi", equipment: "Solar Simulator SS-01",
    reportNumber: "CAL-2026-0118", result: "pass", remarks: "Class A+A+A+ confirmed",
  },
  // Module Type C - new batch
  {
    id: "mi-026", testId: "T-61215-013", testName: "Visual Inspection", standard: "IEC 61215:2021",
    clause: "MQT 01", moduleId: "MOD-2026-0160", manufacturer: "SunPeak Energy",
    sampleType: "PV Module", testSequence: "Seq A - Initial",
    status: "completed", startDate: "2026-03-06", endDate: "2026-03-06",
    assignedTo: "Ravi Kumar", equipment: "Inspection Table IT-01",
    reportNumber: "", result: "pass", remarks: "Minor cosmetic scratches on frame - acceptable",
  },
  {
    id: "mi-027", testId: "T-61215-014", testName: "Maximum Power Determination", standard: "IEC 61215:2021",
    clause: "MQT 02", moduleId: "MOD-2026-0160", manufacturer: "SunPeak Energy",
    sampleType: "PV Module", testSequence: "Seq A - Initial",
    status: "completed", startDate: "2026-03-07", endDate: "2026-03-07",
    assignedTo: "Suresh Iyer", equipment: "Solar Simulator SS-01",
    reportNumber: "", result: "fail", remarks: "Pmax = 388.1 W (Nominal 400 W) - below tolerance",
  },
  {
    id: "mi-028", testId: "T-61215-015", testName: "Insulation Test", standard: "IEC 61215:2021",
    clause: "MQT 03", moduleId: "MOD-2026-0160", manufacturer: "SunPeak Energy",
    sampleType: "PV Module", testSequence: "Seq A - Initial",
    status: "in_progress", startDate: "2026-03-08", endDate: "",
    assignedTo: "Ravi Kumar", equipment: "Insulation Tester IR-02",
    reportNumber: "", result: "pending", remarks: "Re-test after Pmax failure investigation",
  },
];
