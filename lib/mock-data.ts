import { DetectionResult } from "@/components/vision/DetectionResultCard";

// Re-export LIMS/QMS mock data
export { mockSamples, mockTestExecutions, mockEquipment, mockDocuments, mockCAPAs, mockComplianceRequirements } from "./mock-data-lims";

// Sample detection results for demo purposes
export const sampleDetectionResults: DetectionResult[] = [
  {
    id: "det-001",
    imageName: "Module_A1_EL_Front.png",
    imageUrl: "/sample-el.png",
    inspectionType: "el",
    date: "2026-03-08",
    moduleId: "MOD-2026-0145",
    defects: [
      { class: "crack", confidence: 0.94, x: 320, y: 240, width: 80, height: 60 },
      { class: "crack", confidence: 0.87, x: 520, y: 380, width: 70, height: 50 },
      { class: "broken_interconnect", confidence: 0.91, x: 180, y: 160, width: 100, height: 30 },
    ],
    status: "completed",
  },
  {
    id: "det-002",
    imageName: "Module_B3_IR_Thermal.png",
    imageUrl: "/sample-ir.png",
    inspectionType: "ir",
    date: "2026-03-07",
    moduleId: "MOD-2026-0142",
    defects: [
      { class: "hotspot", confidence: 0.96, x: 400, y: 300, width: 60, height: 60 },
      { class: "hotspot", confidence: 0.82, x: 150, y: 200, width: 45, height: 45 },
    ],
    status: "completed",
  },
  {
    id: "det-003",
    imageName: "Module_C7_Visual.jpg",
    imageUrl: "/sample-visual.jpg",
    inspectionType: "visual",
    date: "2026-03-07",
    moduleId: "MOD-2026-0139",
    defects: [
      { class: "snail_trail", confidence: 0.89, x: 250, y: 180, width: 200, height: 40 },
      { class: "discoloration", confidence: 0.76, x: 500, y: 400, width: 120, height: 80 },
    ],
    status: "completed",
  },
  {
    id: "det-004",
    imageName: "Module_D2_EL_Rear.png",
    imageUrl: "/sample-el-2.png",
    inspectionType: "el",
    date: "2026-03-06",
    moduleId: "MOD-2026-0137",
    defects: [
      { class: "cell_breakage", confidence: 0.97, x: 300, y: 250, width: 90, height: 90 },
      { class: "busbar_misalignment", confidence: 0.84, x: 100, y: 350, width: 150, height: 20 },
      { class: "crack", confidence: 0.79, x: 450, y: 150, width: 60, height: 40 },
      { class: "pid", confidence: 0.92, x: 600, y: 300, width: 100, height: 100 },
    ],
    status: "completed",
  },
  {
    id: "det-005",
    imageName: "Module_E5_IR_Full.png",
    imageUrl: "/sample-ir-2.png",
    inspectionType: "ir",
    date: "2026-03-05",
    moduleId: "MOD-2026-0134",
    defects: [],
    status: "completed",
  },
  {
    id: "det-006",
    imageName: "Module_F1_Visual_Surface.jpg",
    imageUrl: "/sample-visual-2.jpg",
    inspectionType: "visual",
    date: "2026-03-05",
    moduleId: "MOD-2026-0131",
    defects: [
      { class: "delamination", confidence: 0.88, x: 200, y: 300, width: 150, height: 100 },
      { class: "corrosion", confidence: 0.83, x: 500, y: 100, width: 80, height: 60 },
    ],
    status: "completed",
  },
];

// Sample SOPs
export interface SampleSOP {
  id: string;
  title: string;
  sopNumber: string;
  standard: string;
  clause: string;
  version: string;
  status: "draft" | "pending_review" | "reviewed" | "approved" | "rejected" | "superseded";
  createdAt: string;
  updatedAt: string;
  author: string;
  approver: string;
  sections: {
    purpose: string;
    scope: string;
    references: string;
    definitions: string;
    responsibilities: string;
    procedure: string;
    records: string;
    revisionHistory: string;
  };
}

export const sopTemplates = [
  { id: "iv-testing", name: "IV Testing", standard: "IEC 60904-1" },
  { id: "el-imaging", name: "EL Imaging", standard: "IEC 61215" },
  { id: "thermal-cycling", name: "Thermal Cycling", standard: "IEC 61215 MQT 11" },
  { id: "humidity-freeze", name: "Humidity Freeze", standard: "IEC 61215 MQT 12" },
  { id: "damp-heat", name: "Damp Heat", standard: "IEC 61215 MQT 13" },
  { id: "uv-exposure", name: "UV Exposure", standard: "IEC 61215 MQT 10" },
  { id: "mechanical-load", name: "Mechanical Load", standard: "IEC 61215 MQT 16" },
  { id: "hail-test", name: "Hail Test", standard: "IEC 61215 MQT 17" },
  { id: "hot-spot", name: "Hot Spot", standard: "IEC 61215 MQT 09" },
  { id: "bypass-diode", name: "Bypass Diode", standard: "IEC 61215 MQT 18" },
] as const;

export const sampleSOPs: SampleSOP[] = [
  {
    id: "sop-001",
    title: "Visual Inspection of PV Modules per IEC 61215",
    sopNumber: "SOP-LAB-001",
    standard: "IEC 61215",
    clause: "10.1 - Visual Inspection",
    version: "2.1",
    status: "approved",
    createdAt: "2026-01-15",
    updatedAt: "2026-02-20",
    author: "Dr. Ganesh Kumar",
    approver: "Lab Director",
    sections: {
      purpose: "To define the procedure for visual inspection of crystalline silicon PV modules in accordance with IEC 61215-2:2021, Clause 10.1.",
      scope: "This SOP applies to all crystalline silicon terrestrial PV modules submitted for design qualification and type approval testing at the laboratory.",
      references: "IEC 61215-1:2021, IEC 61215-2:2021, IEC 60904-1, ISO/IEC 17025:2017",
      definitions: "PV Module: A complete assembly of interconnected solar cells. Visual Defect: Any observable anomaly affecting module appearance or function. EL Image: Electroluminescence image used for sub-surface defect detection.",
      responsibilities: "Lab Technician: Perform inspection and record findings. Lab Manager: Review and approve inspection reports. Quality Manager: Ensure SOP compliance.",
      procedure: "1. Ensure module has been conditioned to room temperature (23+/-2C) for minimum 4 hours.\n2. Place module on inspection table under diffused lighting (>1000 lux).\n3. Inspect front surface for: cracks, bubbles, delamination, discoloration, cell misalignment.\n4. Inspect rear surface for: backsheet damage, junction box integrity, label legibility.\n5. Inspect frame and edges for: deformation, corrosion, seal integrity.\n6. Record all findings using Form F-VI-001.\n7. Capture photographic evidence of any defects found.\n8. Classify defects per IEC 61215-1 Table 1 severity criteria.",
      records: "F-VI-001 Visual Inspection Checklist, F-VI-002 Defect Photo Log, Inspection Report Template R-VI-001",
      revisionHistory: "v1.0 (2025-06-01): Initial release\nv2.0 (2025-12-01): Updated for IEC 61215:2021 edition\nv2.1 (2026-02-20): Added EL imaging reference",
    },
  },
  {
    id: "sop-002",
    title: "Thermal Cycling Test per IEC 61215",
    sopNumber: "SOP-LAB-012",
    standard: "IEC 61215",
    clause: "10.12 - Thermal Cycling Test",
    version: "1.3",
    status: "approved",
    createdAt: "2025-09-10",
    updatedAt: "2026-01-15",
    author: "Dr. Ganesh Kumar",
    approver: "Lab Director",
    sections: {
      purpose: "To define the procedure for thermal cycling testing of PV modules per IEC 61215-2:2021, MQT 11.",
      scope: "All PV modules undergoing IEC 61215 design qualification at the laboratory.",
      references: "IEC 61215-2:2021, IEC 60068-2-14, ISO/IEC 17025:2017",
      definitions: "Thermal Cycle: One complete temperature excursion from -40C to +85C and back. Dwell Time: Duration at extreme temperature.",
      responsibilities: "Lab Technician: Configure and monitor chamber. Lab Manager: Approve test parameters.",
      procedure: "1. Perform initial characterization (I-V, insulation, visual).\n2. Configure environmental chamber: -40C to +85C, ramp rate 100C/h max.\n3. Set dwell time at extremes: minimum 10 minutes.\n4. Program 200 cycles (TC200) or 50 cycles (TC50) per test sequence.\n5. Monitor module temperature using attached thermocouples.\n6. At cycle 0, perform current injection per MQT 11.3.\n7. After completion, condition module 24h at room temperature.\n8. Perform final characterization and compare with initial values.",
      records: "F-TC-001 Chamber Program Log, F-TC-002 Temperature Profile Record",
      revisionHistory: "v1.0 (2025-09-10): Initial release\nv1.3 (2026-01-15): Updated ramp rate limits",
    },
  },
  {
    id: "sop-003",
    title: "Damp Heat Test per IEC 61215",
    sopNumber: "SOP-LAB-014",
    standard: "IEC 61215",
    clause: "10.14 - Damp Heat Test",
    version: "1.0",
    status: "pending_review",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
    author: "Sr. Lab Technician",
    approver: "Lab Director",
    sections: {
      purpose: "To define the damp heat test procedure per IEC 61215-2:2021, MQT 13.",
      scope: "All PV modules undergoing IEC 61215 testing.",
      references: "IEC 61215-2:2021, IEC 60068-2-78",
      definitions: "Damp Heat: Accelerated aging at 85C/85%RH. DH1000: 1000 hours of damp heat exposure.",
      responsibilities: "Lab Technician: Operate chamber and monitor conditions.",
      procedure: "1. Initial characterization.\n2. Place modules in chamber at 85+/-2C, 85+/-5%RH.\n3. Maintain conditions for 1000 hours continuously.\n4. Monitor and log T/RH every 15 minutes.\n5. Final characterization after 24h recovery.",
      records: "F-DH-001 Chamber Log",
      revisionHistory: "v1.0 (2026-03-01): Initial release",
    },
  },
  {
    id: "sop-004",
    title: "I-V Curve Measurement per IEC 60904-1",
    sopNumber: "SOP-LAB-004",
    standard: "IEC 60904",
    clause: "60904-1 - I-V Characteristics",
    version: "2.0",
    status: "approved",
    createdAt: "2025-08-20",
    updatedAt: "2026-01-10",
    author: "Dr. Ganesh Kumar",
    approver: "Lab Director",
    sections: {
      purpose: "To define the procedure for measuring current-voltage (I-V) characteristics of photovoltaic devices under Standard Test Conditions (STC) per IEC 60904-1.",
      scope: "Applicable to all PV cells and modules tested for power determination at the laboratory.",
      references: "IEC 60904-1:2020, IEC 60904-3, IEC 60904-7, ISO/IEC 17025:2017",
      definitions: "STC: Standard Test Conditions (25C cell temperature, 1000 W/m2 irradiance, AM1.5G spectrum). Isc: Short-circuit current. Voc: Open-circuit voltage. Pmax: Maximum power.",
      responsibilities: "Lab Technician: Operate solar simulator and I-V tracer. Lab Manager: Verify calibration and review results.",
      procedure: "1. Verify solar simulator classification (Class A+AA or better per IEC 60904-9).\n2. Ensure reference cell calibration is current.\n3. Condition DUT at 25+/-1C for minimum 30 minutes.\n4. Mount DUT on test plane ensuring uniform illumination.\n5. Connect four-wire measurement leads.\n6. Set irradiance to 1000 W/m2 using reference cell.\n7. Perform forward and reverse I-V sweep.\n8. Record Isc, Voc, Pmax, Imp, Vmp, FF.\n9. Apply spectral mismatch correction per IEC 60904-7.\n10. Calculate measurement uncertainty per laboratory MU budget.",
      records: "F-IV-001 I-V Test Data Sheet, F-IV-002 Solar Simulator Daily Check Log",
      revisionHistory: "v1.0 (2025-08-20): Initial release\nv2.0 (2026-01-10): Updated for IEC 60904-1:2020",
    },
  },
  {
    id: "sop-005",
    title: "EL Imaging Inspection of PV Modules",
    sopNumber: "SOP-LAB-005",
    standard: "IEC 61215",
    clause: "10.1 - Visual Inspection",
    version: "1.2",
    status: "approved",
    createdAt: "2025-10-05",
    updatedAt: "2026-02-01",
    author: "Sr. Lab Technician",
    approver: "Lab Director",
    sections: {
      purpose: "To define the procedure for electroluminescence (EL) imaging of PV modules for sub-surface defect detection.",
      scope: "All PV modules undergoing qualification testing where EL imaging is required as supplementary inspection.",
      references: "IEC 61215-2:2021, IEC TS 60904-13, ISO/IEC 17025:2017",
      definitions: "EL: Electroluminescence - light emission from a solar cell when forward biased. Inactive Area: Region of cell showing no or significantly reduced EL signal.",
      responsibilities: "Lab Technician: Perform EL imaging and initial defect identification. Lab Manager: Review and classify defects.",
      procedure: "1. Ensure complete darkness in imaging room (<1 lux).\n2. Connect module to DC power supply in forward bias.\n3. Apply current equal to Isc of the module.\n4. Allow 2 minutes stabilization time.\n5. Capture EL image using cooled CCD/CMOS camera.\n6. Capture at both 10% Isc (micro-cracks) and 100% Isc (inactive areas).\n7. Process images for contrast enhancement.\n8. Identify and classify defects: cracks, inactive cells, shunts, broken interconnects.\n9. Generate annotated defect map.\n10. Save raw and processed images with module ID and timestamp.",
      records: "F-EL-001 EL Imaging Log, F-EL-002 Defect Classification Sheet",
      revisionHistory: "v1.0 (2025-10-05): Initial release\nv1.2 (2026-02-01): Added dual-current imaging protocol",
    },
  },
  {
    id: "sop-006",
    title: "UV Preconditioning Test per IEC 61215",
    sopNumber: "SOP-LAB-011",
    standard: "IEC 61215",
    clause: "10.11 - UV Preconditioning",
    version: "1.0",
    status: "pending_review",
    createdAt: "2026-02-15",
    updatedAt: "2026-02-15",
    author: "Lab Technician",
    approver: "Lab Director",
    sections: {
      purpose: "To define the UV preconditioning test procedure per IEC 61215-2:2021, MQT 10.",
      scope: "All PV modules requiring UV preconditioning before thermal cycling sequences.",
      references: "IEC 61215-2:2021, IEC 61345, ISO/IEC 17025:2017",
      definitions: "UV Dose: Total UV irradiation energy per unit area (kWh/m2). UVA: Ultraviolet radiation 315-400 nm. UVB: Ultraviolet radiation 280-315 nm.",
      responsibilities: "Lab Technician: Operate UV chamber and monitor dose accumulation. Lab Manager: Approve test completion.",
      procedure: "1. Perform initial characterization (I-V, visual, insulation).\n2. Mount module in UV chamber at 60+/-5C module temperature.\n3. Set UV irradiance: UVA 280-400 nm.\n4. Accumulate total UV dose of 15 kWh/m2 (UVA) with minimum 5 kWh/m2 UVB.\n5. Monitor module temperature continuously.\n6. Record UV dose daily.\n7. After completion, condition module 24h at room temperature.\n8. Perform post-test characterization.",
      records: "F-UV-001 UV Exposure Log, F-UV-002 UV Dose Accumulation Record",
      revisionHistory: "v1.0 (2026-02-15): Initial release",
    },
  },
  {
    id: "sop-007",
    title: "Mechanical Load Test per IEC 61215",
    sopNumber: "SOP-LAB-016",
    standard: "IEC 61215",
    clause: "10.17 - Mechanical Load Test",
    version: "1.1",
    status: "draft",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
    author: "Lab Technician",
    approver: "Lab Director",
    sections: {
      purpose: "To define the mechanical load test procedure for PV modules per IEC 61215-2:2021, MQT 16.",
      scope: "All PV modules undergoing IEC 61215 design qualification.",
      references: "IEC 61215-2:2021, IEC 62938, ISO/IEC 17025:2017",
      definitions: "Mechanical Load: Uniform pressure applied to module surface. Front Load: Positive pressure (wind/snow). Rear Load: Negative pressure (wind suction).",
      responsibilities: "Lab Technician: Operate mechanical load tester. Lab Manager: Approve test parameters and review results.",
      procedure: "1. Perform initial characterization.\n2. Mount module in mechanical load frame per manufacturer mounting instructions.\n3. Apply 3 cycles of +2400 Pa / -2400 Pa (standard) or +5400 Pa / -2400 Pa (heavy snow).\n4. Hold each load for minimum 1 hour.\n5. Ramp rate: 100 Pa/s maximum.\n6. Monitor for audible cracking or visible deformation.\n7. After completion, perform visual inspection and EL imaging.\n8. Perform post-test I-V and insulation measurements.",
      records: "F-ML-001 Mechanical Load Test Record, F-ML-002 Load Profile Data",
      revisionHistory: "v1.0 (2026-03-01): Initial release\nv1.1 (2026-03-05): Added heavy snow load option",
    },
  },
  {
    id: "sop-008",
    title: "Hail Impact Test per IEC 61215",
    sopNumber: "SOP-LAB-017",
    standard: "IEC 61215",
    clause: "10.18 - Hail Test",
    version: "1.0",
    status: "approved",
    createdAt: "2025-11-15",
    updatedAt: "2025-11-15",
    author: "Dr. Ganesh Kumar",
    approver: "Lab Director",
    sections: {
      purpose: "To define the hail impact test procedure per IEC 61215-2:2021, MQT 17.",
      scope: "All PV modules undergoing IEC 61215 design qualification.",
      references: "IEC 61215-2:2021, ISO/IEC 17025:2017",
      definitions: "Ice Ball: Frozen sphere of specified diameter and mass. Impact Point: Location on module surface where ice ball strikes.",
      responsibilities: "Lab Technician: Operate hail launcher and record impacts. Lab Manager: Select impact points and review results.",
      procedure: "1. Perform initial characterization.\n2. Condition module at 25+/-5C.\n3. Prepare ice balls: 25 mm diameter, 7.53 g (+/-5%).\n4. Select 11 impact points per IEC 61215 Table 3.\n5. Launch ice balls at 23 m/s (+/-5%) velocity.\n6. Verify impact velocity using optical sensor.\n7. Impact each point once perpendicular to module surface.\n8. After all impacts, perform visual inspection.\n9. Perform post-test I-V and insulation measurements.\n10. Perform EL imaging to check for micro-cracks.",
      records: "F-HL-001 Hail Test Impact Log, F-HL-002 Ice Ball Preparation Record",
      revisionHistory: "v1.0 (2025-11-15): Initial release",
    },
  },
  {
    id: "sop-009",
    title: "Bypass Diode Thermal Test per IEC 61215",
    sopNumber: "SOP-LAB-019",
    standard: "IEC 61215",
    clause: "10.19 - Bypass Diode Test",
    version: "1.0",
    status: "draft",
    createdAt: "2026-03-08",
    updatedAt: "2026-03-08",
    author: "Lab Technician",
    approver: "Lab Director",
    sections: {
      purpose: "To define the bypass diode thermal test procedure per IEC 61215-2:2021, MQT 18.",
      scope: "All PV modules with bypass diodes undergoing IEC 61215 qualification.",
      references: "IEC 61215-2:2021, IEC 62979, ISO/IEC 17025:2017",
      definitions: "Bypass Diode: Protective diode connected anti-parallel to a string of cells. Thermal Runaway: Uncontrolled temperature increase in bypass diode.",
      responsibilities: "Lab Technician: Operate test equipment and monitor temperatures. Lab Manager: Review thermal data and approve results.",
      procedure: "1. Perform initial characterization including I-V and thermal imaging.\n2. Mount module in environmental chamber at 75+/-2C.\n3. Apply 1.25 x Isc through each bypass diode.\n4. Monitor diode temperature using thermocouples.\n5. Maintain current flow for 1 hour.\n6. Record temperature profile every 30 seconds.\n7. Verify diode temperature does not exceed manufacturer rating.\n8. Repeat for each bypass diode in the module.\n9. After cooling, perform post-test I-V and insulation measurements.",
      records: "F-BD-001 Bypass Diode Test Log, F-BD-002 Diode Temperature Profile",
      revisionHistory: "v1.0 (2026-03-08): Initial release",
    },
  },
  {
    id: "sop-010",
    title: "Hot Spot Endurance Test per IEC 61215",
    sopNumber: "SOP-LAB-010",
    standard: "IEC 61215",
    clause: "10.10 - Hot-spot Endurance Test",
    version: "1.0",
    status: "approved",
    createdAt: "2025-07-20",
    updatedAt: "2025-12-10",
    author: "Dr. Ganesh Kumar",
    approver: "Lab Director",
    sections: {
      purpose: "To define the hot-spot endurance test procedure per IEC 61215-2:2021, MQT 09.",
      scope: "All PV modules undergoing IEC 61215 design qualification.",
      references: "IEC 61215-2:2021, IEC 60904-1, ISO/IEC 17025:2017",
      definitions: "Hot Spot: Localized overheating in a solar cell caused by reverse bias. Worst-case Cell: Cell that produces the highest temperature when shaded.",
      responsibilities: "Lab Technician: Perform shading tests and monitor temperatures. Lab Manager: Identify worst-case cells and approve test plan.",
      procedure: "1. Perform initial I-V characterization.\n2. Measure Isc of each cell string using shading method.\n3. Identify worst-case hot-spot cell using IR camera under 1000 W/m2.\n4. Shade worst-case cell completely.\n5. Expose module to 1000 W/m2 irradiance for 5 hours.\n6. Monitor cell temperature continuously.\n7. Record maximum cell temperature.\n8. After completion, perform visual inspection and EL imaging.\n9. Perform post-test I-V and insulation measurements.",
      records: "F-HS-001 Hot Spot Test Data, F-HS-002 Thermal Image Records",
      revisionHistory: "v1.0 (2025-07-20): Initial release",
    },
  },
];

// Sample reports
export interface SampleReport {
  id: string;
  title: string;
  reportNumber: string;
  reportType: string;
  standard: string;
  moduleId: string;
  manufacturer: string;
  status: "draft" | "pending_review" | "approved" | "issued";
  createdAt: string;
  updatedAt: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
  testResults: {
    testName: string;
    clause: string;
    result: "pass" | "fail" | "n/a";
    value?: string;
    limit?: string;
  }[];
}

export const sampleReports: SampleReport[] = [
  {
    id: "rpt-001",
    title: "IEC 61215 Design Qualification - Module Type A",
    reportNumber: "TR-2026-0042",
    reportType: "iec_61215_qualification",
    standard: "IEC 61215:2021",
    moduleId: "MOD-2026-0145",
    manufacturer: "SolarTech Industries",
    status: "approved",
    createdAt: "2026-02-28",
    updatedAt: "2026-03-05",
    preparedBy: "Sr. Lab Technician",
    reviewedBy: "Lab Manager",
    approvedBy: "Lab Director",
    testResults: [
      { testName: "Visual Inspection", clause: "MQT 01", result: "pass" },
      { testName: "Maximum Power Determination", clause: "MQT 02", result: "pass", value: "405.2 W", limit: ">400 W" },
      { testName: "Insulation Test", clause: "MQT 03", result: "pass", value: "4.2 GΩ", limit: ">40 MΩ" },
      { testName: "Thermal Cycling TC200", clause: "MQT 11", result: "pass", value: "-2.1%", limit: "<5% degradation" },
      { testName: "Humidity Freeze", clause: "MQT 12", result: "pass", value: "-0.8%", limit: "<5% degradation" },
      { testName: "Damp Heat DH1000", clause: "MQT 13", result: "pass", value: "-3.2%", limit: "<5% degradation" },
      { testName: "Mechanical Load", clause: "MQT 16", result: "pass" },
      { testName: "Hail Test", clause: "MQT 17", result: "pass" },
    ],
  },
  {
    id: "rpt-002",
    title: "IEC 61730 Safety Qualification - Module Type A",
    reportNumber: "TR-2026-0043",
    reportType: "iec_61730_safety",
    standard: "IEC 61730:2016",
    moduleId: "MOD-2026-0145",
    manufacturer: "SolarTech Industries",
    status: "pending_review",
    createdAt: "2026-03-06",
    updatedAt: "2026-03-06",
    preparedBy: "Sr. Lab Technician",
    reviewedBy: "",
    approvedBy: "",
    testResults: [
      { testName: "Visual Inspection", clause: "MST 01", result: "pass" },
      { testName: "Accessibility Test", clause: "MST 11", result: "pass" },
      { testName: "Ground Continuity", clause: "MST 13", result: "pass", value: "0.08 Ω", limit: "<0.1 Ω" },
      { testName: "Impulse Voltage", clause: "MST 14", result: "pass" },
      { testName: "Insulation Resistance", clause: "MST 16", result: "pass", value: "5.1 GΩ", limit: ">40 MΩ" },
      { testName: "Wet Leakage Current", clause: "MST 17", result: "pass", value: "12 µA", limit: "<10 µA/m²" },
      { testName: "Temperature Test", clause: "MST 21", result: "pass" },
    ],
  },
  {
    id: "rpt-003",
    title: "IEC 61853 Energy Rating - Module Type B",
    reportNumber: "TR-2026-0044",
    reportType: "iec_61853_energy",
    standard: "IEC 61853:2018",
    moduleId: "MOD-2026-0139",
    manufacturer: "GreenPower Corp",
    status: "draft",
    createdAt: "2026-03-08",
    updatedAt: "2026-03-08",
    preparedBy: "Lab Technician",
    reviewedBy: "",
    approvedBy: "",
    testResults: [
      { testName: "Power Rating at STC", clause: "7.1", result: "pass", value: "410.5 W", limit: "Nominal ±3%" },
      { testName: "Power at NMOT", clause: "7.2", result: "pass", value: "302.1 W" },
      { testName: "Power at Low Irradiance", clause: "7.3", result: "pass", value: "38.2 W" },
      { testName: "Temperature Coefficients", clause: "11", result: "pass", value: "α=0.05%/K, β=-0.31%/K, γ=-0.38%/K" },
    ],
  },
];
