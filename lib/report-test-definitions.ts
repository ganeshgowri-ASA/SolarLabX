// Exhaustive test definitions for IEC standard test reports

export interface TestDefinition {
  id: string;
  clause: string;
  testName: string;
  purpose: string;
  testConditions: string[];
  equipmentUsed: string[];
  measurements: string[];
  passCriteria: string[];
  resultFields: ResultField[];
}

export interface ResultField {
  label: string;
  unit: string;
  type: "number" | "text" | "pass_fail" | "percentage";
  defaultValue?: string;
}

export interface DetailedTestResult {
  testId: string;
  clause: string;
  testName: string;
  result: "pass" | "fail" | "n/a" | "pending";
  values: Record<string, string>;
  observations: string;
  equipmentUsed: string[];
  testDate: string;
  testedBy: string;
}

export interface LabDetails {
  labName: string;
  accreditationNumber: string;
  accreditationBody: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export const DEFAULT_LAB_DETAILS: LabDetails = {
  labName: "SolarLabX PV Testing Laboratory",
  accreditationNumber: "NABL/TC-XXXX",
  accreditationBody: "National Accreditation Board for Testing and Calibration Laboratories (NABL)",
  address: "Solar Testing Facility, Industrial Area, India",
  contactPerson: "Dr. Ganesh Kumar",
  phone: "+91-XXX-XXXXXXX",
  email: "lab@solarlabx.com",
};

// ---------------------------------------------------------------------------
// IEC 61215:2021 — Design Qualification (MQT 01–19 mapped to 10.1–10.17)
// ---------------------------------------------------------------------------
export const IEC_61215_TESTS: TestDefinition[] = [
  {
    id: "mqt-01", clause: "MQT 01 (10.1)", testName: "Visual Inspection",
    purpose: "Identify visible defects that might affect performance, safety, or reliability before and after each test sequence.",
    testConditions: ["Module at 23 ± 2 °C for ≥ 4 h", "Diffused lighting > 1000 lux", "No direct sunlight on surface"],
    equipmentUsed: ["Inspection table with diffused lighting", "10× magnifying lens", "Calibrated ruler", "Digital camera"],
    measurements: ["Front: cracks, bubbles, delamination, discoloration, cell misalignment", "Rear: backsheet damage, J-box integrity, label legibility", "Frame/edges: deformation, corrosion, seal integrity", "Interconnect ribbons: breakage, solder defects"],
    passCriteria: ["No broken/cracked cells visible to naked eye", "Delamination/bubbles < 1 % cell area", "No moisture/corrosion inside module", "J-box & connectors secure", "Labels legible & permanent", "Frame free of significant deformation"],
    resultFields: [
      { label: "Front Surface", unit: "", type: "pass_fail" },
      { label: "Rear Surface", unit: "", type: "pass_fail" },
      { label: "Frame & Edges", unit: "", type: "pass_fail" },
      { label: "Junction Box", unit: "", type: "pass_fail" },
      { label: "Labels & Markings", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mqt-02", clause: "MQT 02 (10.2)", testName: "Maximum Power Determination at STC",
    purpose: "Determine Pmax under Standard Test Conditions (1000 W/m², 25 °C, AM 1.5G).",
    testConditions: ["Irradiance 1000 ± 20 W/m²", "Cell temperature 25 ± 1 °C", "Spectrum AM 1.5G (IEC 60904-3)", "Simulator ≥ A⁺AA (IEC 60904-9 Ed.3)"],
    equipmentUsed: ["Class A⁺AA solar simulator", "Calibrated reference cell", "I-V curve tracer (4-wire)", "Module temperature sensor", "Spectroradiometer"],
    measurements: ["Isc", "Voc", "Pmax", "Imp", "Vmp", "Fill Factor (FF)"],
    passCriteria: ["Pmax within nominal ± tolerance", "Post-test degradation < 5 % (qualification)", "Post-test degradation < 8 % (extended)"],
    resultFields: [
      { label: "Pmax", unit: "W", type: "number" },
      { label: "Isc", unit: "A", type: "number" },
      { label: "Voc", unit: "V", type: "number" },
      { label: "Imp", unit: "A", type: "number" },
      { label: "Vmp", unit: "V", type: "number" },
      { label: "Fill Factor", unit: "%", type: "percentage" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "mqt-03", clause: "MQT 03 (10.3)", testName: "Insulation Test",
    purpose: "Verify electrical insulation integrity and safety under high voltage.",
    testConditions: ["Module at 23 ± 5 °C, RH < 75 %", "Outputs short-circuited", "Voltage between shorted terminals and frame"],
    equipmentUsed: ["Hipot tester", "Insulation resistance meter (≥ 500 V DC)", "Safety barriers"],
    measurements: ["Insulation resistance (MΩ / GΩ)", "Leakage current during hi-pot", "Applied test voltage"],
    passCriteria: ["Insulation resistance ≥ 40 MΩ·m²", "No dielectric breakdown", "Withstand 1000 V + 2 × Vsys for 1 min", "No tracking / arcing"],
    resultFields: [
      { label: "Insulation Resistance", unit: "GΩ", type: "number" },
      { label: "Applied Voltage", unit: "V", type: "number" },
      { label: "Leakage Current", unit: "µA", type: "number" },
      { label: "Module Area", unit: "m²", type: "number" },
      { label: "Normalized Resistance", unit: "MΩ·m²", type: "number" },
    ],
  },
  {
    id: "mqt-04", clause: "MQT 04 (10.4)", testName: "Temperature Coefficients",
    purpose: "Determine temperature coefficients α (Isc), β (Voc), γ (Pmax).",
    testConditions: ["Irradiance 800–1000 W/m²", "Temperature range 25–65 °C min.", "≥ 4 uniformly spaced points", "Rear-surface centre thermocouple"],
    equipmentUsed: ["Solar simulator / natural sunlight", "I-V tracer", "Temperature-controlled stage", "Multiple thermocouples", "Reference cell"],
    measurements: ["I-V curves at each T point", "Isc, Voc, Pmax vs. T", "Linear regression coefficients"],
    passCriteria: ["Within manufacturer's declared values ± tolerance", "R² > 0.99", "≥ 4 data points"],
    resultFields: [
      { label: "α (Isc)", unit: "%/°C", type: "number" },
      { label: "β (Voc)", unit: "%/°C", type: "number" },
      { label: "γ (Pmax)", unit: "%/°C", type: "number" },
      { label: "Temp Range", unit: "°C", type: "text" },
      { label: "R²", unit: "", type: "number" },
    ],
  },
  {
    id: "mqt-05", clause: "MQT 05 (10.5)", testName: "NMOT Determination",
    purpose: "Determine Nominal Module Operating Temperature under reference conditions (800 W/m², 20 °C ambient, 1 m/s wind).",
    testConditions: ["800 W/m² total irradiance", "Ambient 20 °C", "Wind 1 m/s", "Open-circuit, open-rack mount"],
    equipmentUsed: ["Pyranometer", "Anemometer", "Ambient temperature sensor (shielded)", "≥ 3 rear-surface thermocouples", "Data logger"],
    measurements: ["Module T at various irradiance & ambient", "Wind speed / direction", "Ambient T", "Plane-of-array irradiance"],
    passCriteria: ["Uncertainty < ± 2 °C", "Within declared NMOT ± 3 °C", "Sufficient data for regression"],
    resultFields: [
      { label: "NMOT", unit: "°C", type: "number" },
      { label: "Uncertainty", unit: "°C", type: "number" },
      { label: "Declared NMOT", unit: "°C", type: "number" },
    ],
  },
  {
    id: "mqt-06", clause: "MQT 06 (10.6)", testName: "Performance at STC and NMOT",
    purpose: "Verify electrical performance at STC and at NMOT conditions.",
    testConditions: ["STC: 1000 W/m², 25 °C, AM 1.5G", "NMOT: 800 W/m², NMOT temperature", "Simulator ≥ A⁺AA"],
    equipmentUsed: ["Class A⁺AA solar simulator", "I-V tracer", "Reference cell", "Temperature sensors"],
    measurements: ["Full I-V at STC", "Full I-V at NMOT", "Pmax, Isc, Voc, FF at both"],
    passCriteria: ["STC Pmax within nominal ± tolerance", "NMOT ratio consistent with temp coefficients", "No anomalous I-V shape"],
    resultFields: [
      { label: "Pmax at STC", unit: "W", type: "number" },
      { label: "Pmax at NMOT", unit: "W", type: "number" },
      { label: "Isc at STC", unit: "A", type: "number" },
      { label: "Voc at STC", unit: "V", type: "number" },
      { label: "FF at STC", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "mqt-07", clause: "MQT 07 (10.7)", testName: "Hot-Spot Endurance Test",
    purpose: "Verify module withstands hot-spot heating when worst-case cells are shaded.",
    testConditions: ["1000 ± 100 W/m²", "Worst-case cell identified & fully shaded", "5-hour exposure", "Short-circuit or open-circuit (worst case)"],
    equipmentUsed: ["Solar simulator / sunlight", "IR camera", "Opaque shading", "Thermocouples", "I-V tracer", "Data logger"],
    measurements: ["Max cell temperature", "Temperature profile over 5 h", "I-V before & after", "Visual inspection after"],
    passCriteria: ["No visual defects (MQT 01)", "Pmax degradation < 5 %", "Insulation ≥ MQT 03", "No melting / burning"],
    resultFields: [
      { label: "Max Cell Temp", unit: "°C", type: "number" },
      { label: "Duration", unit: "h", type: "number", defaultValue: "5" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "mqt-08", clause: "MQT 08 (10.8)", testName: "UV Preconditioning",
    purpose: "Precondition module with UV to reveal UV-induced degradation before thermal/humidity tests.",
    testConditions: ["Module at 60 ± 5 °C", "UV 280–400 nm", "Total UVA dose ≥ 15 kWh/m²", "UVB ≥ 5 kWh/m²", "Short-circuit or open-circuit"],
    equipmentUsed: ["UV chamber", "UV radiometer (UVA + UVB)", "Temperature sensors", "UV dose integrator / data logger"],
    measurements: ["Cumulative UVA & UVB dose", "Module temperature", "Daily UV irradiance", "Exposure duration"],
    passCriteria: ["UVA ≥ 15 kWh/m²", "UVB ≥ 5 kWh/m²", "No visual defects", "Pmax degradation < 5 %"],
    resultFields: [
      { label: "Total UVA Dose", unit: "kWh/m²", type: "number" },
      { label: "Total UVB Dose", unit: "kWh/m²", type: "number" },
      { label: "Module Temp", unit: "°C", type: "number" },
      { label: "Duration", unit: "h", type: "number" },
      { label: "Pmax Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "mqt-09", clause: "MQT 09 (10.9)", testName: "Thermal Cycling (TC200)",
    purpose: "Verify module withstands thermal fatigue from repeated −40 °C ↔ +85 °C cycles.",
    testConditions: ["−40 °C to +85 °C", "200 cycles (TC200) or 50 (TC50)", "Ramp ≤ 100 °C/h", "Dwell ≥ 10 min at extremes", "Current injection at Imp during high-T dwell"],
    equipmentUsed: ["Environmental chamber", "≥ 3 thermocouples", "DC supply for injection", "Chamber controller / recorder", "I-V tracer"],
    measurements: ["Air & module temperature profiles", "Cycle count & duration", "I-V before & after", "Insulation before & after"],
    passCriteria: ["Pmax degradation < 5 % (TC200)", "< 8 % (TC400/600)", "Insulation ≥ MQT 03", "No major visual defects", "Wet leakage OK"],
    resultFields: [
      { label: "Cycles", unit: "", type: "number", defaultValue: "200" },
      { label: "Temp Range", unit: "°C", type: "text", defaultValue: "−40 to +85" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
      { label: "Insulation After", unit: "GΩ", type: "number" },
    ],
  },
  {
    id: "mqt-10", clause: "MQT 10 (10.10)", testName: "Humidity-Freeze (HF10)",
    purpose: "Verify module withstands high-T / high-RH followed by sub-zero temperatures.",
    testConditions: ["85 °C / 85 % RH ≥ 20 h", "−40 °C ≥ 0.5 h", "10 cycles", "Transition ≤ 4 h"],
    equipmentUsed: ["Environmental chamber with humidity", "T / RH sensors", "Data logger", "I-V tracer"],
    measurements: ["T & RH profiles", "Module surface T", "Cycle count", "I-V before & after", "Insulation before & after"],
    passCriteria: ["Pmax degradation < 5 %", "Insulation ≥ MQT 03", "No major visual defects", "Wet leakage OK"],
    resultFields: [
      { label: "Cycles", unit: "", type: "number", defaultValue: "10" },
      { label: "Max Temp", unit: "°C", type: "number", defaultValue: "85" },
      { label: "Max RH", unit: "%", type: "number", defaultValue: "85" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "mqt-11", clause: "MQT 11 (10.11)", testName: "Damp Heat (DH1000)",
    purpose: "Verify module withstands prolonged 85 °C / 85 % RH (accelerated aging).",
    testConditions: ["85 ± 2 °C", "85 ± 5 % RH", "1000 h continuously", "Open-circuit"],
    equipmentUsed: ["Environmental chamber with humidity", "Calibrated T / RH sensors", "Data logger (15-min intervals)", "I-V tracer"],
    measurements: ["Continuous T & RH log", "Total exposure time", "I-V before & after", "Insulation before & after", "Visual before & after"],
    passCriteria: ["Pmax degradation < 5 %", "Insulation ≥ MQT 03", "No major visual defects", "Wet leakage OK"],
    resultFields: [
      { label: "Duration", unit: "h", type: "number", defaultValue: "1000" },
      { label: "Chamber Temp", unit: "°C", type: "number", defaultValue: "85" },
      { label: "Chamber RH", unit: "%", type: "number", defaultValue: "85" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
      { label: "Insulation After", unit: "GΩ", type: "number" },
    ],
  },
  {
    id: "mqt-12", clause: "MQT 12 (10.12)", testName: "Robustness of Terminations",
    purpose: "Verify terminations withstand mechanical stress during installation & service.",
    testConditions: ["Pull 40 N for 1 min per conductor", "Push 10 N for 1 min on J-box", "Rated torque on screw terminals", "Room temperature 23 ± 5 °C"],
    equipmentUsed: ["Calibrated force gauge (0–100 N)", "Torque wrench", "Test fixtures", "Inspection tools"],
    measurements: ["Force & duration per termination", "Displacement assessment", "Continuity after stress", "J-box adhesion"],
    passCriteria: ["No terminal displacement", "No visible damage", "Continuity maintained", "J-box adhesion intact", "No potting cracks"],
    resultFields: [
      { label: "Pull Force", unit: "N", type: "number", defaultValue: "40" },
      { label: "Pull Result", unit: "", type: "pass_fail" },
      { label: "Push Force", unit: "N", type: "number", defaultValue: "10" },
      { label: "Push Result", unit: "", type: "pass_fail" },
      { label: "Continuity", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mqt-13", clause: "MQT 13 (10.13)", testName: "Wet Leakage Current Test",
    purpose: "Evaluate insulation under wet conditions for outdoor safety.",
    testConditions: ["Module wetted / submerged in surfactant solution", "Water 22 ± 3 °C, resistivity < 3500 Ω·cm", "500 V DC (or Vsys max) for 2 min"],
    equipmentUsed: ["Wet leakage tank / spray", "Insulation tester (500 / 1000 V DC)", "Water conductivity meter", "Thermometer", "Timer"],
    measurements: ["Leakage current (µA)", "Water temperature", "Water resistivity", "Applied voltage"],
    passCriteria: ["Leakage ≤ area × 40 µA/m²", "No breakdown", "No arcing"],
    resultFields: [
      { label: "Leakage Current", unit: "µA", type: "number" },
      { label: "Module Area", unit: "m²", type: "number" },
      { label: "Normalized Leakage", unit: "µA/m²", type: "number" },
      { label: "Applied Voltage", unit: "V", type: "number" },
      { label: "Water Temp", unit: "°C", type: "number" },
    ],
  },
  {
    id: "mqt-14", clause: "MQT 14 (10.14)", testName: "Mechanical Load Test",
    purpose: "Verify module withstands wind, snow and static loads.",
    testConditions: ["Standard: 3 × ±2400 Pa", "Heavy snow: +5400 / −2400 Pa", "Hold ≥ 1 h each", "Ramp ≤ 100 Pa/s", "Manufacturer mounting"],
    equipmentUsed: ["Mechanical load tester", "Pressure transducer", "Load distribution frame", "Data logger", "I-V tracer"],
    measurements: ["Pressure (Pa) front & rear", "Duration per step", "Deflection", "I-V & EL before & after"],
    passCriteria: ["No mechanical failure", "Pmax degradation < 5 %", "Insulation ≥ MQT 03", "No major visual defects"],
    resultFields: [
      { label: "Front Load", unit: "Pa", type: "number", defaultValue: "2400" },
      { label: "Rear Load", unit: "Pa", type: "number", defaultValue: "2400" },
      { label: "Cycles", unit: "", type: "number", defaultValue: "3" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "mqt-15", clause: "MQT 15 (10.15)", testName: "Hail Test",
    purpose: "Verify module withstands hailstone impact.",
    testConditions: ["25 mm ice ball, 7.53 g ± 5 %", "Velocity 23 m/s ± 5 %", "11 impact points (Table 3)", "Module at 25 ± 5 °C"],
    equipmentUsed: ["Pneumatic hail launcher", "Ice ball molds", "Optical velocity sensors", "Balance", "I-V tracer", "EL camera"],
    measurements: ["Ball diameter & mass", "Impact velocity per shot", "Impact map", "Visual & EL after", "I-V before & after"],
    passCriteria: ["No major cracks (MQT 01)", "Pmax degradation < 5 %", "Insulation ≥ MQT 03", "No glass breakage"],
    resultFields: [
      { label: "Ball Diameter", unit: "mm", type: "number", defaultValue: "25" },
      { label: "Ball Mass", unit: "g", type: "number", defaultValue: "7.53" },
      { label: "Velocity", unit: "m/s", type: "number", defaultValue: "23" },
      { label: "Impacts", unit: "", type: "number", defaultValue: "11" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "mqt-16", clause: "MQT 16 (10.16)", testName: "Bypass Diode Thermal Test",
    purpose: "Assess long-term reliability and thermal behaviour of bypass diodes.",
    testConditions: ["Chamber 75 ± 2 °C", "1.25 × Isc through each diode", "1 h per diode", "Monitor junction temperature"],
    equipmentUsed: ["Environmental chamber", "DC supply (current-controlled)", "Thermocouples (inside & outside J-box)", "Data logger (30 s)", "I-V tracer"],
    measurements: ["Diode junction T vs. time", "Max diode T", "Forward voltage drop", "Chamber ambient T"],
    passCriteria: ["T < manufacturer rated Tj max", "No thermal runaway", "Diode functional after test", "No J-box / potting damage", "Pmax degradation < 5 %"],
    resultFields: [
      { label: "Chamber Temp", unit: "°C", type: "number", defaultValue: "75" },
      { label: "Applied Current", unit: "A", type: "number" },
      { label: "Max Diode Temp", unit: "°C", type: "number" },
      { label: "Rated Max Tj", unit: "°C", type: "number" },
      { label: "Vf Drop", unit: "V", type: "number" },
      { label: "Diode OK", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mqt-17", clause: "MQT 17 (10.17)", testName: "Static Mechanical Load Test",
    purpose: "Assess ability to withstand static wind uplift and snow loads over extended periods.",
    testConditions: ["+5400 Pa front for 3 h", "−2400 Pa rear for 3 h", "Manufacturer mounting", "Static only"],
    equipmentUsed: ["Static load frame", "Pneumatic / weight loading", "Pressure sensor", "Deflection gauges", "I-V tracer"],
    measurements: ["Pressure & duration", "Max deflection (centre)", "Visual & EL after", "I-V before & after"],
    passCriteria: ["No mechanical failure", "Returns to original shape", "Pmax degradation < 5 %", "Insulation ≥ MQT 03"],
    resultFields: [
      { label: "Front Load", unit: "Pa", type: "number", defaultValue: "5400" },
      { label: "Rear Load", unit: "Pa", type: "number", defaultValue: "2400" },
      { label: "Duration", unit: "h", type: "number", defaultValue: "3" },
      { label: "Max Deflection", unit: "mm", type: "number" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 61730:2016 — PV Module Safety (MST 01–12)
// ---------------------------------------------------------------------------
export const IEC_61730_TESTS: TestDefinition[] = [
  {
    id: "mst-01", clause: "MST 01", testName: "Visual Inspection",
    purpose: "Detect visible safety hazards: sharp edges, exposed live parts, broken glass, damaged insulation.",
    testConditions: ["Room temperature", "> 1000 lux", "Before & after each safety test"],
    equipmentUsed: ["Inspection table", "Magnifying lens", "Camera", "Ruler"],
    measurements: ["Surface defects", "Exposed conductors", "Insulation integrity", "Label compliance"],
    passCriteria: ["No exposed live parts", "No sharp edges", "Safety labels compliant with IEC 61730-1", "No broken glass / compromised encapsulation"],
    resultFields: [
      { label: "Safety Labels", unit: "", type: "pass_fail" },
      { label: "No Exposed Parts", unit: "", type: "pass_fail" },
      { label: "No Sharp Edges", unit: "", type: "pass_fail" },
      { label: "Encapsulation", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mst-02", clause: "MST 02", testName: "Accessibility Test",
    purpose: "Verify live parts are not accessible using standard test probes.",
    testConditions: ["Jointed test finger (IEC 61032 Probe B)", "10 N force", "Normal mounting position"],
    equipmentUsed: ["Jointed test finger", "Force gauge (10 N)", "Continuity tester"],
    measurements: ["Connector openings", "Frame gaps", "Junction box access"],
    passCriteria: ["Probe does not contact live parts", "No electrical indication", "Openings adequately protected"],
    resultFields: [
      { label: "Connector", unit: "", type: "pass_fail" },
      { label: "Frame Gaps", unit: "", type: "pass_fail" },
      { label: "Junction Box", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mst-03", clause: "MST 03", testName: "Cut Susceptibility Test",
    purpose: "Evaluate backsheet resistance to cutting by sharp objects.",
    testConditions: ["30 N force with test blade", "Room temperature 23 ± 5 °C", "Multiple rear locations"],
    equipmentUsed: ["Standardized test blade", "Force gauge (30 N)", "Insulation tester"],
    measurements: ["Cut depth per location", "Insulation resistance after", "Damage assessment"],
    passCriteria: ["No penetration to live parts", "Insulation ≥ 40 MΩ·m² after", "No arcing on dielectric test"],
    resultFields: [
      { label: "Cut Depth", unit: "mm", type: "number" },
      { label: "Penetration", unit: "", type: "pass_fail" },
      { label: "Insulation After", unit: "MΩ·m²", type: "number" },
    ],
  },
  {
    id: "mst-04", clause: "MST 04", testName: "Ground Continuity Test",
    purpose: "Verify exposed conductive parts are reliably connected to grounding point.",
    testConditions: ["2.5 × rated current or 25 A (whichever greater)", "2 minutes", "Room temperature"],
    equipmentUsed: ["Ground bond tester", "4-wire resistance measurement", "Current source"],
    measurements: ["Resistance grounding → each exposed part", "Test current", "Voltage drop"],
    passCriteria: ["Resistance < 0.1 Ω", "No excessive heating", "Mechanically sound"],
    resultFields: [
      { label: "Ground Resistance", unit: "Ω", type: "number" },
      { label: "Test Current", unit: "A", type: "number" },
      { label: "Voltage Drop", unit: "mV", type: "number" },
    ],
  },
  {
    id: "mst-05", clause: "MST 05", testName: "Impulse Voltage Test",
    purpose: "Verify insulation withstands lightning / switching voltage transients.",
    testConditions: ["1.2/50 µs waveform (IEC 60060-1)", "Voltage per system-voltage category", "3 positive + 3 negative impulses", "≥ 1 s interval"],
    equipmentUsed: ["Impulse voltage generator", "Voltage divider & oscilloscope", "Safety barriers"],
    measurements: ["Peak voltage each impulse", "Waveform verification", "Flashover / breakdown indication"],
    passCriteria: ["No flashover / breakdown", "No disruptive discharge", "Insulation OK after (MST 06)"],
    resultFields: [
      { label: "Test Voltage", unit: "kV", type: "number" },
      { label: "Positive Impulses", unit: "", type: "number", defaultValue: "3" },
      { label: "Negative Impulses", unit: "", type: "number", defaultValue: "3" },
      { label: "Flashover", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mst-06", clause: "MST 06", testName: "Dielectric Withstand Test",
    purpose: "Verify insulation withstands rated voltage without breakdown over extended period.",
    testConditions: ["1000 V + 4 × Vsys (AC) or 1500 V + 2 × Vsys (DC)", "1 minute", "Between shorted outputs & frame"],
    equipmentUsed: ["Hipot tester", "Leakage current meter", "Safety barriers"],
    measurements: ["Applied voltage", "Leakage current", "Duration", "Breakdown indication"],
    passCriteria: ["No breakdown", "Leakage within limits", "No tracking / arcing"],
    resultFields: [
      { label: "Applied Voltage", unit: "V", type: "number" },
      { label: "Leakage Current", unit: "mA", type: "number" },
      { label: "Duration", unit: "min", type: "number", defaultValue: "1" },
      { label: "Breakdown", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mst-07", clause: "MST 07", testName: "Wet Leakage Current Test",
    purpose: "Measure insulation resistance under wet conditions for electrical-shock safety.",
    testConditions: ["Module wetted / submerged", "Water < 3500 Ω·cm", "500 V DC or Vsys max", "Room temperature"],
    equipmentUsed: ["Megohmmeter", "Wetting / immersion tank", "Conductivity meter"],
    measurements: ["Insulation resistance (MΩ)", "Leakage (µA)", "Water T & conductivity", "Applied voltage"],
    passCriteria: ["Insulation ≥ 40 MΩ·m²", "Wet leakage ≤ 40 µA/m²"],
    resultFields: [
      { label: "Insulation Resistance", unit: "MΩ", type: "number" },
      { label: "Leakage Current", unit: "µA", type: "number" },
      { label: "Module Area", unit: "m²", type: "number" },
      { label: "Normalized", unit: "MΩ·m²", type: "number" },
    ],
  },
  {
    id: "mst-08", clause: "MST 08", testName: "Temperature Test",
    purpose: "Determine max component temperatures under worst-case operation; verify within safety limits.",
    testConditions: ["1000 W/m²", "Ambient ≥ 40 °C", "Open-circuit (worst case for T)", "Steady-state"],
    equipmentUsed: ["Solar simulator / outdoor", "Thermocouples on cells, J-box, connectors, backsheet", "Data logger", "Pyranometer"],
    measurements: ["T of each critical component", "Ambient T", "Irradiance", "Time to steady state"],
    passCriteria: ["No component exceeds rated max T", "Backsheet within specs", "J-box within rating", "Connector within rating"],
    resultFields: [
      { label: "Max Cell Temp", unit: "°C", type: "number" },
      { label: "Max J-Box Temp", unit: "°C", type: "number" },
      { label: "Max Connector Temp", unit: "°C", type: "number" },
      { label: "Max Backsheet Temp", unit: "°C", type: "number" },
      { label: "Ambient Temp", unit: "°C", type: "number" },
    ],
  },
  {
    id: "mst-09", clause: "MST 09", testName: "Hot-Spot Test (Safety)",
    purpose: "Verify hot-spot conditions do not create fire hazard or compromise safety.",
    testConditions: ["Worst-case cell shaded", "1000 W/m² for 5 h", "Combustible material behind (if applicable)", "Monitor ignition / smoke"],
    equipmentUsed: ["Solar simulator / outdoor", "IR camera", "Thermocouples", "Combustible fabric"],
    measurements: ["Max hot-spot T", "Duration", "Smoke / ignition / melting"],
    passCriteria: ["No fire / ignition", "No melting exposing live parts", "Safe to handle after cooling"],
    resultFields: [
      { label: "Max Hot-Spot Temp", unit: "°C", type: "number" },
      { label: "Duration", unit: "h", type: "number", defaultValue: "5" },
      { label: "Fire / Ignition", unit: "", type: "pass_fail" },
      { label: "Melting", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mst-10", clause: "MST 10", testName: "Reverse Current Overload Test",
    purpose: "Verify module safely withstands reverse current flow.",
    testConditions: ["135 % Isc reverse for 2 h", "Continuous T monitoring"],
    equipmentUsed: ["DC supply (current-controlled)", "Thermocouples", "Data logger"],
    measurements: ["Reverse current", "Module & diode T", "Duration", "Visual after"],
    passCriteria: ["No fire / smoke / melting", "Diode T within limits", "Passes visual & insulation after"],
    resultFields: [
      { label: "Reverse Current", unit: "A", type: "number" },
      { label: "Duration", unit: "h", type: "number", defaultValue: "2" },
      { label: "Max Temp", unit: "°C", type: "number" },
      { label: "Fire / Smoke", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "mst-11", clause: "MST 11", testName: "Module Breakage Test",
    purpose: "Verify broken glass does not create safety hazard.",
    testConditions: ["Break front glass with specified impactor", "Impact at centre", "Normal mounting"],
    equipmentUsed: ["Test impactor", "Safety PPE", "Insulation tester"],
    measurements: ["Breakage pattern", "Exposed live parts", "Sharp edges", "Insulation after"],
    passCriteria: ["No live parts exposed", "Tempered glass → small fragments", "Insulation adequate after"],
    resultFields: [
      { label: "Breakage Pattern", unit: "", type: "text" },
      { label: "Exposed Parts", unit: "", type: "pass_fail" },
      { label: "Sharp Edges", unit: "", type: "pass_fail" },
      { label: "Insulation After", unit: "MΩ", type: "number" },
    ],
  },
  {
    id: "mst-12", clause: "MST 12", testName: "Fire Test (Spread of Flame)",
    purpose: "Assess fire resistance and ability to resist flame spread.",
    testConditions: ["Fire class per local codes (A / B / C)", "Burning brand or spread-of-flame test", "Specified inclination"],
    equipmentUsed: ["Fire test apparatus (UL 790 / IEC 61730-2)", "Gas burner / brand", "Timer & thermocouple", "Video recorder"],
    measurements: ["Flame spread distance", "Burning duration after removal", "Falling particles", "Structural integrity"],
    passCriteria: ["Flame spread within class limits", "No falling burning particles", "Self-extinguish within time", "Structural integrity maintained"],
    resultFields: [
      { label: "Fire Class", unit: "", type: "text" },
      { label: "Flame Spread", unit: "mm", type: "number" },
      { label: "Extinguish Time", unit: "s", type: "number" },
      { label: "Falling Debris", unit: "", type: "pass_fail" },
      { label: "Structural OK", unit: "", type: "pass_fail" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 61853:2018 — Energy Rating
// ---------------------------------------------------------------------------
export const IEC_61853_IRRADIANCE_LEVELS = [100, 200, 400, 600, 800, 1000, 1100];
export const IEC_61853_TEMPERATURE_LEVELS = [15, 25, 50, 75];

export const IEC_61853_TESTS: TestDefinition[] = [
  {
    id: "iec61853-power-matrix", clause: "Clause 7", testName: "Power Rating Matrix",
    purpose: "Measure power at combinations of irradiance (100–1100 W/m²) and temperature (15–75 °C) for energy yield prediction.",
    testConditions: ["Irradiance: 100, 200, 400, 600, 800, 1000, 1100 W/m²", "Temperature: 15, 25, 50, 75 °C", "Simulator ≥ A⁺AA or natural sunlight", "Spectral mismatch correction"],
    equipmentUsed: ["Variable-irradiance simulator", "Temperature-controlled platform", "I-V tracer", "Reference cell", "Spectroradiometer"],
    measurements: ["Pmax at each (G, T) pair", "Full I-V at each condition", "28-point matrix"],
    passCriteria: ["STC Pmax within nominal ± tolerance", "Monotonic with irradiance", "Decreasing with temperature", "No anomalous I-V shapes"],
    resultFields: [
      { label: "Pmax STC (1000, 25)", unit: "W", type: "number" },
      { label: "Pmax (200, 25)", unit: "W", type: "number" },
      { label: "Pmax (800, 50)", unit: "W", type: "number" },
      { label: "Low-Light Ratio", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "iec61853-spectral", clause: "Clause 9", testName: "Spectral Response Measurement",
    purpose: "Measure spectral responsivity for spectral correction in energy rating.",
    testConditions: ["Monochromatic scan 300–1200 nm", "Module at 25 ± 1 °C", "Bias irradiance ≈ 1 sun"],
    equipmentUsed: ["Monochromator / tunable source", "Calibrated photodetector", "Lock-in amplifier", "Temperature stage"],
    measurements: ["Spectral responsivity (A/W) vs. λ", "EQE vs. λ", "Short-circuit spectral response"],
    passCriteria: ["Covers 300–1200 nm", "SNR > 100:1", "Band-gap consistent with technology"],
    resultFields: [
      { label: "Peak Responsivity", unit: "A/W", type: "number" },
      { label: "Peak λ", unit: "nm", type: "number" },
      { label: "Band Gap", unit: "eV", type: "number" },
      { label: "Range", unit: "nm", type: "text" },
    ],
  },
  {
    id: "iec61853-angular", clause: "Clause 10", testName: "Angle of Incidence Correction",
    purpose: "Measure angular response for correcting energy predictions at non-normal incidence.",
    testConditions: ["AOI 0°–85° in 5° steps", "Collimated source or sun tracker", "Module at 25 ± 2 °C", "1000 W/m² at normal"],
    equipmentUsed: ["Collimated source / tracker", "Rotary stage", "I-V tracer", "Reference cell"],
    measurements: ["Isc at each AOI", "IAM at each angle", "Comparison with cosine"],
    passCriteria: ["Data covers 0°–75°", "IAM(0°) = 1.0", "IAM ≤ 1.0 all angles", "Smooth monotonic decrease"],
    resultFields: [
      { label: "IAM 30°", unit: "", type: "number" },
      { label: "IAM 50°", unit: "", type: "number" },
      { label: "IAM 60°", unit: "", type: "number" },
      { label: "IAM 75°", unit: "", type: "number" },
    ],
  },
  {
    id: "iec61853-tempcoeff", clause: "Clause 11", testName: "Temperature Coefficients",
    purpose: "Determine α (Isc), β (Voc), γ (Pmax) temperature coefficients.",
    testConditions: ["25–75 °C, ≥ 5 points", "1000 W/m²", "Rear-surface centre thermocouple"],
    equipmentUsed: ["Simulator / outdoor", "Temperature stage", "I-V tracer", "Thermocouples"],
    measurements: ["Isc, Voc, Pmax vs. T", "Linear regression", "R² coefficient"],
    passCriteria: ["Within manufacturer specs", "R² > 0.99", "≥ 5 points"],
    resultFields: [
      { label: "α (Isc)", unit: "%/°C", type: "number" },
      { label: "β (Voc)", unit: "%/°C", type: "number" },
      { label: "γ (Pmax)", unit: "%/°C", type: "number" },
      { label: "R² α", unit: "", type: "number" },
      { label: "R² β", unit: "", type: "number" },
      { label: "R² γ", unit: "", type: "number" },
    ],
  },
  {
    id: "iec61853-cser", clause: "Clause 8", testName: "Energy Rating Calculation (CSER)",
    purpose: "Calculate Climate Specific Energy Rating using measured power matrix, spectral, angular, and temperature data.",
    testConditions: ["Based on data from Clauses 7, 9, 10, 11", "6 reference climates (IEC 61853-4)", "Calculation per IEC 61853-3"],
    equipmentUsed: ["Calculation software per IEC 61853-3", "Reference-climate meteorological data"],
    measurements: ["Annual kWh/kWp per climate", "Performance ratio per climate", "CSER value"],
    passCriteria: ["All 6 climates calculated", "Physically consistent", "Methodology documented"],
    resultFields: [
      { label: "Subtropical Arid", unit: "kWh/kWp", type: "number" },
      { label: "Subtropical Humid", unit: "kWh/kWp", type: "number" },
      { label: "Temperate Continental", unit: "kWh/kWp", type: "number" },
      { label: "Temperate Coastal", unit: "kWh/kWp", type: "number" },
      { label: "Tropical", unit: "kWh/kWp", type: "number" },
      { label: "High Altitude", unit: "kWh/kWp", type: "number" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 61701 — Salt Mist Corrosion
// ---------------------------------------------------------------------------
export const IEC_61701_TESTS: TestDefinition[] = [
  {
    id: "salt-sev1", clause: "Clause 7 (Sev 1)", testName: "Salt Mist - Severity 1",
    purpose: "Assess corrosion resistance in moderate coastal / marine environments.",
    testConditions: ["5 % NaCl, pH 6.5–7.2", "35 ± 2 °C spray", "Spray 2 h / dry 22 h @ 40 °C < 30 % RH", "4 cycles"],
    equipmentUsed: ["Salt spray chamber (ISO 9227)", "Spray nozzles", "pH meter", "Hygrometer", "I-V tracer"],
    measurements: ["Spray density & pH per cycle", "T & RH", "I-V before & after", "Visual each cycle", "Insulation after"],
    passCriteria: ["Pmax degradation < 5 %", "No safety-compromising corrosion", "Insulation ≥ MQT 03", "No delamination / moisture"],
    resultFields: [
      { label: "Severity", unit: "", type: "text", defaultValue: "1" },
      { label: "Cycles", unit: "", type: "number", defaultValue: "4" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
      { label: "Insulation After", unit: "GΩ", type: "number" },
      { label: "Corrosion Notes", unit: "", type: "text" },
    ],
  },
  {
    id: "salt-sev6", clause: "Clause 7 (Sev 6)", testName: "Salt Mist - Severity 6",
    purpose: "Assess corrosion resistance at highest severity for extreme coastal / offshore.",
    testConditions: ["5 % NaCl, pH 6.5–7.2", "35 ± 2 °C spray", "Spray 2 h / dry 22 h", "96 cycles"],
    equipmentUsed: ["Salt spray chamber (ISO 9227)", "Spray nozzles", "pH meter", "I-V tracer"],
    measurements: ["Same as Sev 1 + intermediate I-V at 25/50/75 %"],
    passCriteria: ["Pmax degradation < 5 %", "No safety-compromising corrosion", "Insulation OK", "Labels legible"],
    resultFields: [
      { label: "Severity", unit: "", type: "text", defaultValue: "6" },
      { label: "Cycles", unit: "", type: "number", defaultValue: "96" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
      { label: "Insulation After", unit: "GΩ", type: "number" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 62716 — Ammonia Corrosion
// ---------------------------------------------------------------------------
export const IEC_62716_TESTS: TestDefinition[] = [
  {
    id: "ammonia-1", clause: "Clause 7", testName: "Ammonia Corrosion Resistance",
    purpose: "Assess resistance to ammonia corrosion in agricultural environments.",
    testConditions: ["500 ± 100 ppm NH₃", "60 ± 2 °C", "90 ± 5 % RH", "5-day exposure + 2-day recovery × N cycles", "7–21 days total exposure"],
    equipmentUsed: ["NH₃ chamber", "Gas supply & concentration monitor", "T/RH controllers", "Leak detector", "PPE", "I-V tracer"],
    measurements: ["NH₃ concentration (continuous)", "T & RH (continuous)", "I-V before / during / after", "Visual each cycle", "Insulation & wet leakage after"],
    passCriteria: ["Pmax degradation < 5 %", "No safety-compromising corrosion", "Insulation ≥ MQT 03", "Wet leakage OK"],
    resultFields: [
      { label: "NH₃", unit: "ppm", type: "number", defaultValue: "500" },
      { label: "Temp", unit: "°C", type: "number", defaultValue: "60" },
      { label: "RH", unit: "%", type: "number", defaultValue: "90" },
      { label: "Exposure", unit: "days", type: "number" },
      { label: "Cycles", unit: "", type: "number" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
      { label: "Insulation After", unit: "GΩ", type: "number" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 62804 — PID (Potential Induced Degradation)
// ---------------------------------------------------------------------------
export const IEC_62804_TESTS: TestDefinition[] = [
  {
    id: "pid-method-a", clause: "Clause 5 (Method A)", testName: "PID Stress Test – Method A (Chamber)",
    purpose: "Assess PID susceptibility by applying system voltage bias under 85°C / 85% RH for 96 hours.",
    testConditions: ["85 ± 2 °C", "85 ± 5 % RH", "±Vsys (1000 V or 1500 V) applied", "96 h duration", "Modules shorted, bias between active circuit & frame"],
    equipmentUsed: ["Environmental chamber", "DC power supply (≥ 1500 V)", "Insulation tester", "I-V tracer", "EL camera"],
    measurements: ["I-V before & after (STC)", "EL imaging before & after", "Insulation resistance", "Leakage current during stress", "Power degradation"],
    passCriteria: ["Pmax degradation ≤ 5 %", "No major visual defects", "Insulation ≥ 40 MΩ·m²", "Wet leakage OK"],
    resultFields: [
      { label: "Applied Voltage", unit: "V", type: "number" },
      { label: "Duration", unit: "h", type: "number", defaultValue: "96" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
      { label: "Insulation After", unit: "GΩ", type: "number" },
    ],
  },
  {
    id: "pid-method-b", clause: "Clause 5 (Method B)", testName: "PID Stress Test – Method B (Outdoor/Surface)",
    purpose: "Assess PID susceptibility using conductive surface layer at elevated temperature.",
    testConditions: ["Surface conductive layer (Al foil or conductive paste)", "60 ± 5 °C module temperature", "±Vsys applied", "96 h duration"],
    equipmentUsed: ["Outdoor / thermal chamber", "DC power supply", "Al foil / conductive paste", "I-V tracer", "EL camera"],
    measurements: ["I-V before & after", "EL imaging", "Leakage current"],
    passCriteria: ["Pmax degradation ≤ 5 %", "No visual defects"],
    resultFields: [
      { label: "Applied Voltage", unit: "V", type: "number" },
      { label: "Module Temp", unit: "°C", type: "number", defaultValue: "60" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "pid-recovery", clause: "Annex A", testName: "PID Recovery Test",
    purpose: "Evaluate recovery behaviour of PID-affected modules under reverse bias or thermal annealing.",
    testConditions: ["Reverse polarity bias at 1000 V", "85 °C / < 40 % RH", "24–96 h recovery period"],
    equipmentUsed: ["Environmental chamber", "DC power supply", "I-V tracer", "EL camera"],
    measurements: ["I-V at intervals during recovery", "EL imaging at intervals", "Recovery ratio (%)"],
    passCriteria: ["Recovery documented (informative)", "Recovery ratio reported"],
    resultFields: [
      { label: "Recovery Duration", unit: "h", type: "number" },
      { label: "Pmax Post-PID", unit: "W", type: "number" },
      { label: "Pmax After Recovery", unit: "W", type: "number" },
      { label: "Recovery Ratio", unit: "%", type: "percentage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC TS 63209 — LeTID (Light & elevated Temperature Induced Degradation)
// ---------------------------------------------------------------------------
export const IEC_63209_TESTS: TestDefinition[] = [
  {
    id: "letid-light-soak", clause: "Clause 7", testName: "LeTID Light Soaking Test",
    purpose: "Detect Light and elevated Temperature Induced Degradation in c-Si modules (B-O and Cu-related CID).",
    testConditions: ["75 ± 5 °C module temperature", "1000 ± 100 W/m² irradiance", "Isc or Imp injection", "≥ 162 kWh/m² cumulative dose (200+ h)", "Monitored at intervals"],
    equipmentUsed: ["Solar simulator / outdoor exposure", "Temperature controller", "I-V tracer", "EL camera", "Dose integrator"],
    measurements: ["I-V at regular intervals (every 24–48 h)", "EL imaging pre/post", "Cumulative irradiation dose", "Module temperature log"],
    passCriteria: ["Pmax degradation ≤ 5 % from stabilized baseline", "No major visual defects"],
    resultFields: [
      { label: "Total Dose", unit: "kWh/m²", type: "number" },
      { label: "Duration", unit: "h", type: "number" },
      { label: "Module Temp", unit: "°C", type: "number", defaultValue: "75" },
      { label: "Pmax Stabilized", unit: "W", type: "number" },
      { label: "Pmax After LeTID", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "letid-dark-anneal", clause: "Clause 8", testName: "LeTID Dark Annealing (Accelerated)",
    purpose: "Accelerated LeTID test via dark annealing at elevated temperature to detect degradation potential.",
    testConditions: ["75 ± 2 °C in dark", "Open-circuit", "≥ 162 h duration", "Monitored at intervals"],
    equipmentUsed: ["Environmental chamber (dark)", "I-V tracer", "EL camera"],
    measurements: ["I-V at intervals", "Power trajectory (rise, peak, decline)", "EL comparison"],
    passCriteria: ["Pmax degradation ≤ 5 % from peak", "Trajectory consistent with LeTID model"],
    resultFields: [
      { label: "Duration", unit: "h", type: "number" },
      { label: "Chamber Temp", unit: "°C", type: "number", defaultValue: "75" },
      { label: "Pmax Initial", unit: "W", type: "number" },
      { label: "Pmax Peak", unit: "W", type: "number" },
      { label: "Pmax Final", unit: "W", type: "number" },
      { label: "Degradation from Peak", unit: "%", type: "percentage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 62788 — Material Testing (Backsheet, Encapsulant, UV)
// ---------------------------------------------------------------------------
export const IEC_62788_TESTS: TestDefinition[] = [
  {
    id: "mat-backsheet-adhesion", clause: "IEC 62788-1-4", testName: "Backsheet Adhesion Peel Test",
    purpose: "Measure peel strength of backsheet-to-encapsulant bond to assess delamination risk.",
    testConditions: ["90° or 180° peel angle", "50 mm/min peel rate", "25 ± 2 °C specimen temperature", "10 mm strip width"],
    equipmentUsed: ["Universal testing machine (UTM)", "Peel jig", "Sample cutter", "Force recorder"],
    measurements: ["Peel force (N/mm)", "Failure mode (adhesive, cohesive, mixed)", "Force-displacement curve"],
    passCriteria: ["Peel strength ≥ 40 N/m (typical threshold)", "No adhesive failure at backsheet-encapsulant interface"],
    resultFields: [
      { label: "Peel Strength", unit: "N/m", type: "number" },
      { label: "Failure Mode", unit: "", type: "text" },
      { label: "Peel Angle", unit: "°", type: "number" },
      { label: "Strip Width", unit: "mm", type: "number", defaultValue: "10" },
    ],
  },
  {
    id: "mat-gel-content", clause: "IEC 62788-1-2", testName: "Encapsulant Gel Content (Cross-linking Degree)",
    purpose: "Determine degree of cross-linking of EVA/POE encapsulant via solvent extraction.",
    testConditions: ["Xylene or toluene extraction", "Soxhlet apparatus, reflux 8 h", "Sample mass 0.2–0.5 g", "105 °C drying"],
    equipmentUsed: ["Soxhlet extractor", "Analytical balance (0.0001 g)", "Drying oven", "Solvent fume hood"],
    measurements: ["Initial mass (g)", "Post-extraction dry mass (g)", "Gel content (%)"],
    passCriteria: ["EVA gel content ≥ 70 % (typical)", "POE gel content ≥ 60 %"],
    resultFields: [
      { label: "Initial Mass", unit: "g", type: "number" },
      { label: "Post-Extraction Mass", unit: "g", type: "number" },
      { label: "Gel Content", unit: "%", type: "percentage" },
      { label: "Encapsulant Type", unit: "", type: "text" },
    ],
  },
  {
    id: "mat-uv-cutoff", clause: "IEC 62788-7-2", testName: "UV Cut-off Wavelength Measurement",
    purpose: "Determine UV transmittance and cut-off wavelength of front encapsulant/glass stack.",
    testConditions: ["Spectrophotometer 200–800 nm scan", "Integrating sphere", "Sample at room temperature"],
    equipmentUsed: ["UV-Vis spectrophotometer", "Integrating sphere", "Reference standards", "Sample holder"],
    measurements: ["Transmittance spectrum (T vs λ)", "UV cut-off wavelength (λ at T = 1%)", "Total UV transmittance (280–400 nm)"],
    passCriteria: ["UV cut-off ≤ 360 nm for EVA", "Total UV transmittance documented"],
    resultFields: [
      { label: "UV Cut-off λ", unit: "nm", type: "number" },
      { label: "T at 350 nm", unit: "%", type: "percentage" },
      { label: "T at 380 nm", unit: "%", type: "percentage" },
      { label: "Total UV T (280-400)", unit: "%", type: "percentage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 62938 — Non-Uniform Snow Load
// ---------------------------------------------------------------------------
export const IEC_62938_TESTS: TestDefinition[] = [
  {
    id: "snow-light", clause: "Clause 7 (Light)", testName: "Non-Uniform Snow Load – Light Severity",
    purpose: "Assess module resistance to non-uniform snow load at light severity level.",
    testConditions: ["Non-uniform load profile per Annex A", "Light severity: 1400 Pa non-uniform", "3 cycles", "1 h hold per cycle"],
    equipmentUsed: ["Mechanical load tester", "Non-uniform loading fixture", "Pressure sensors", "Deflection gauges", "I-V tracer"],
    measurements: ["Applied pressure profile", "Deflection at centre & edges", "I-V before & after", "Visual & EL before & after"],
    passCriteria: ["Pmax degradation < 5 %", "No glass breakage", "No frame deformation", "Insulation OK"],
    resultFields: [
      { label: "Max Load", unit: "Pa", type: "number", defaultValue: "1400" },
      { label: "Cycles", unit: "", type: "number", defaultValue: "3" },
      { label: "Max Deflection", unit: "mm", type: "number" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "snow-heavy", clause: "Clause 7 (Heavy)", testName: "Non-Uniform Snow Load – Heavy Severity",
    purpose: "Assess module resistance to non-uniform snow load at heavy severity level.",
    testConditions: ["Non-uniform load profile per Annex A", "Heavy severity: 2800 Pa non-uniform", "3 cycles", "1 h hold per cycle"],
    equipmentUsed: ["Mechanical load tester", "Non-uniform loading fixture", "Pressure sensors", "Deflection gauges", "I-V tracer"],
    measurements: ["Applied pressure profile", "Deflection at centre & edges", "I-V before & after", "Visual & EL before & after"],
    passCriteria: ["Pmax degradation < 5 %", "No glass breakage", "No frame deformation", "Insulation OK"],
    resultFields: [
      { label: "Max Load", unit: "Pa", type: "number", defaultValue: "2800" },
      { label: "Cycles", unit: "", type: "number", defaultValue: "3" },
      { label: "Max Deflection", unit: "mm", type: "number" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 61345 — UV Test for Thin-Film Modules
// ---------------------------------------------------------------------------
export const IEC_61345_TESTS: TestDefinition[] = [
  {
    id: "uv-thinfilm", clause: "Clause 7", testName: "UV Exposure Test (Thin-Film)",
    purpose: "Evaluate UV stability of thin-film PV modules (CdTe, CIGS, a-Si) under accelerated UV exposure.",
    testConditions: ["Module temperature 60 ± 5 °C", "UV irradiance 250–400 nm", "Total dose ≥ 50 kWh/m²", "Short-circuit during exposure"],
    equipmentUsed: ["UV exposure chamber", "UV radiometer", "Module temperature sensors", "I-V tracer", "EL camera"],
    measurements: ["Cumulative UV dose", "Module temperature", "I-V before & after", "Visual inspection", "EL imaging"],
    passCriteria: ["Pmax degradation ≤ 5 %", "No delamination", "No discoloration", "Insulation OK"],
    resultFields: [
      { label: "UV Dose", unit: "kWh/m²", type: "number" },
      { label: "Duration", unit: "h", type: "number" },
      { label: "Module Temp", unit: "°C", type: "number", defaultValue: "60" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
      { label: "Degradation", unit: "%", type: "percentage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// UL 61730 / UL 1703 — North American Safety
// ---------------------------------------------------------------------------
export const UL_61730_TESTS: TestDefinition[] = [
  {
    id: "ul-visual", clause: "UL 61730 §10.1", testName: "Visual Inspection (UL)",
    purpose: "Detect visible safety hazards per UL listing requirements.",
    testConditions: ["Room temperature", "> 1000 lux", "Check UL marking compliance"],
    equipmentUsed: ["Inspection table", "Magnifying lens", "Camera"],
    measurements: ["Surface defects", "UL marking verification", "Listing label compliance"],
    passCriteria: ["UL listing marks correct", "No exposed conductors", "Safety labels per UL 61730"],
    resultFields: [
      { label: "UL Marking", unit: "", type: "pass_fail" },
      { label: "Safety Labels", unit: "", type: "pass_fail" },
      { label: "Physical Integrity", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "ul-ground-continuity", clause: "UL 61730 §10.4", testName: "Ground Continuity (UL)",
    purpose: "Verify grounding per NEC and UL requirements.",
    testConditions: ["25 A or 2× rated current", "2 minutes", "Per NEC 690.43"],
    equipmentUsed: ["Ground bond tester", "4-wire measurement"],
    measurements: ["Ground resistance", "Test current", "Equipment grounding conductor check"],
    passCriteria: ["Ground resistance < 0.1 Ω", "EGC bonding verified"],
    resultFields: [
      { label: "Ground Resistance", unit: "Ω", type: "number" },
      { label: "Test Current", unit: "A", type: "number" },
      { label: "EGC Bond", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "ul-fire-rating", clause: "UL 61730 / UL 790", testName: "Fire Classification (UL)",
    purpose: "Determine fire classification per UL 790 (Class A, B, or C) for rooftop mounting.",
    testConditions: ["Burning brand test per UL 790", "Spread-of-flame test", "Specified roof deck assembly"],
    equipmentUsed: ["UL 790 fire test apparatus", "Gas burner", "Thermocouple array", "Video recorder"],
    measurements: ["Flame spread distance", "Burn-through", "Falling particles", "Classification result"],
    passCriteria: ["Meets declared fire class (A/B/C)", "No burn-through", "Self-extinguishing"],
    resultFields: [
      { label: "Fire Class", unit: "", type: "text" },
      { label: "Flame Spread", unit: "mm", type: "number" },
      { label: "Burn-Through", unit: "", type: "pass_fail" },
      { label: "Self-Extinguish", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "ul-hipot", clause: "UL 61730 §10.6", testName: "Dielectric Withstand (UL)",
    purpose: "Verify insulation integrity per UL requirements.",
    testConditions: ["1000 V + 2 × Vsys for 1 min (DC) or per UL 1703", "Between outputs & frame"],
    equipmentUsed: ["Hipot tester", "Leakage current meter"],
    measurements: ["Applied voltage", "Leakage current", "Breakdown indicator"],
    passCriteria: ["No breakdown", "Leakage within limits"],
    resultFields: [
      { label: "Applied Voltage", unit: "V", type: "number" },
      { label: "Leakage Current", unit: "mA", type: "number" },
      { label: "Breakdown", unit: "", type: "pass_fail" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IS 14286 / BIS — Indian Bureau of Standards
// ---------------------------------------------------------------------------
export const IS_14286_TESTS: TestDefinition[] = [
  {
    id: "bis-visual", clause: "IS 14286 Clause 7", testName: "Visual Inspection (BIS)",
    purpose: "Visual inspection per BIS requirements for Indian market certification.",
    testConditions: ["As per IEC 61215 + BIS additional markings check", "BIS logo verification", "IS marking compliance"],
    equipmentUsed: ["Inspection table", "Camera", "BIS marking reference"],
    measurements: ["BIS logo presence", "IS marking compliance", "Standard visual checks"],
    passCriteria: ["BIS logo correctly applied", "IS marking legible & permanent", "No visual defects"],
    resultFields: [
      { label: "BIS Logo", unit: "", type: "pass_fail" },
      { label: "IS Marking", unit: "", type: "pass_fail" },
      { label: "Visual Check", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "bis-performance", clause: "IS 14286 Clause 8", testName: "Performance Verification (BIS)",
    purpose: "Verify STC performance per BIS requirements (aligned with IEC 61215 MQT 02).",
    testConditions: ["STC: 1000 W/m², 25 °C, AM 1.5G", "Per IS 14286 / IEC 61215"],
    equipmentUsed: ["Solar simulator ≥ A⁺AA", "I-V tracer", "Reference cell"],
    measurements: ["Pmax, Isc, Voc, Imp, Vmp, FF"],
    passCriteria: ["Pmax within declared ± tolerance", "Meets BIS declared parameters"],
    resultFields: [
      { label: "Pmax", unit: "W", type: "number" },
      { label: "Isc", unit: "A", type: "number" },
      { label: "Voc", unit: "V", type: "number" },
      { label: "FF", unit: "%", type: "percentage" },
      { label: "BIS Compliance", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "bis-safety", clause: "IS 14286 Clause 9", testName: "Safety Tests (BIS)",
    purpose: "Safety qualification tests per BIS requirements (aligned with IEC 61730).",
    testConditions: ["Insulation, wet leakage, ground continuity per IS 14286", "Additional tropical climate considerations"],
    equipmentUsed: ["Hipot tester", "Insulation tester", "Ground bond tester"],
    measurements: ["Insulation resistance", "Wet leakage current", "Ground continuity"],
    passCriteria: ["Insulation ≥ 40 MΩ·m²", "Ground resistance < 0.1 Ω", "No breakdown"],
    resultFields: [
      { label: "Insulation", unit: "MΩ·m²", type: "number" },
      { label: "Wet Leakage", unit: "µA/m²", type: "number" },
      { label: "Ground Resistance", unit: "Ω", type: "number" },
      { label: "BIS Safety", unit: "", type: "pass_fail" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 62915 — BoM & Type Test Matrix
// ---------------------------------------------------------------------------
export const IEC_62915_TESTS: TestDefinition[] = [
  {
    id: "bom-change-assessment", clause: "IEC 62915 Clause 5", testName: "BoM Change Impact Assessment",
    purpose: "Assess impact of Bill of Materials changes on existing type test certification per IEC 62915.",
    testConditions: ["Review original type test certification", "Identify changed components", "Risk assessment per Annex A matrix"],
    equipmentUsed: ["Documentation review", "BoM comparison tools", "Type test matrix spreadsheet"],
    measurements: ["Changed components list", "Impact classification (critical/major/minor)", "Required re-test scope"],
    passCriteria: ["All BoM changes classified", "Re-test scope determined", "No unassessed critical changes"],
    resultFields: [
      { label: "Components Changed", unit: "", type: "number" },
      { label: "Critical Changes", unit: "", type: "number" },
      { label: "Major Changes", unit: "", type: "number" },
      { label: "Minor Changes", unit: "", type: "number" },
      { label: "Re-tests Required", unit: "", type: "number" },
    ],
  },
  {
    id: "bom-retest-matrix", clause: "IEC 62915 Annex A", testName: "Type Test Re-Test Matrix",
    purpose: "Generate re-test matrix showing which MQTs/MSTs must be repeated for each BoM change category.",
    testConditions: ["Cross-reference BoM change vs. IEC 61215/61730 test clauses", "Per Annex A Table A.1"],
    equipmentUsed: ["IEC 62915 Annex A matrix", "Original certification records"],
    measurements: ["Test matrix (component × test clause)", "Required vs. optional re-tests"],
    passCriteria: ["Matrix complete for all changed components", "All mandatory re-tests identified"],
    resultFields: [
      { label: "Total MQTs Affected", unit: "", type: "number" },
      { label: "Total MSTs Affected", unit: "", type: "number" },
      { label: "Mandatory Re-tests", unit: "", type: "number" },
      { label: "Optional Re-tests", unit: "", type: "number" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 60904 — PV Device Measurement (expanded tests)
// ---------------------------------------------------------------------------
export const IEC_60904_TESTS: TestDefinition[] = [
  {
    id: "iv-measurement", clause: "IEC 60904-1", testName: "I-V Characteristics Measurement",
    purpose: "Determine current-voltage characteristics of PV device under STC.",
    testConditions: ["Irradiance 1000 ± 20 W/m²", "Cell/module temperature 25 ± 1 °C", "Spectrum AM 1.5G", "4-wire connection"],
    equipmentUsed: ["Class A⁺AA solar simulator", "I-V curve tracer", "Calibrated reference cell", "Temperature sensors"],
    measurements: ["Isc, Voc, Pmax, Imp, Vmp", "Full I-V curve (≥ 100 points)", "Fill Factor"],
    passCriteria: ["Irradiance stability ± 2 %", "Temperature stability ± 1 °C", "Spectral match verified"],
    resultFields: [
      { label: "Pmax", unit: "W", type: "number" },
      { label: "Isc", unit: "A", type: "number" },
      { label: "Voc", unit: "V", type: "number" },
      { label: "Imp", unit: "A", type: "number" },
      { label: "Vmp", unit: "V", type: "number" },
      { label: "Fill Factor", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "spectral-response", clause: "IEC 60904-8", testName: "Spectral Response Measurement",
    purpose: "Measure spectral responsivity of PV device for spectral mismatch correction.",
    testConditions: ["Monochromatic scan 300–1200 nm", "Bandwidth ≤ 20 nm", "Device at 25 ± 2 °C", "Bias illumination ~1 sun"],
    equipmentUsed: ["Monochromator system", "Lock-in amplifier", "Calibrated detector", "Bias light source"],
    measurements: ["Spectral responsivity (A/W) vs wavelength", "External Quantum Efficiency (EQE)", "Integrated Isc check"],
    passCriteria: ["Coverage 300–1200 nm", "Noise < 1 % of signal", "Integrated Isc within 3 % of measured"],
    resultFields: [
      { label: "Peak SR", unit: "A/W", type: "number" },
      { label: "Peak Wavelength", unit: "nm", type: "number" },
      { label: "Integrated Isc", unit: "A", type: "number" },
      { label: "Measured Isc", unit: "A", type: "number" },
    ],
  },
  {
    id: "ref-device-cal", clause: "IEC 60904-2/4", testName: "Reference Device Calibration",
    purpose: "Calibrate reference solar cell/device for use in I-V measurements.",
    testConditions: ["Natural sunlight or primary reference", "Spectral mismatch correction applied", "Temperature 25 ± 1 °C"],
    equipmentUsed: ["Primary reference cell (WPVS/PTB/NREL traceable)", "Spectroradiometer", "I-V tracer", "Temperature sensors"],
    measurements: ["Isc at STC", "Spectral mismatch factor M", "Temperature coefficients", "Calibration uncertainty"],
    passCriteria: ["Uncertainty ≤ 1.5 % (k=2)", "Traceability documented", "Mismatch factor within 2 %"],
    resultFields: [
      { label: "Isc (STC)", unit: "A", type: "number" },
      { label: "Mismatch Factor M", unit: "", type: "number" },
      { label: "Uncertainty (k=2)", unit: "%", type: "percentage" },
      { label: "Traceability", unit: "", type: "text" },
    ],
  },
  {
    id: "linearity", clause: "IEC 60904-10", testName: "Linearity of Isc with Irradiance",
    purpose: "Verify Isc linearity over irradiance range for accurate low-light corrections.",
    testConditions: ["Irradiance 100–1100 W/m² in ≥ 5 steps", "Temperature 25 ± 1 °C", "Neutral density filters or variable irradiance"],
    equipmentUsed: ["Solar simulator with variable irradiance", "ND filter set", "I-V tracer", "Reference cell"],
    measurements: ["Isc at each irradiance level", "Linearity deviation (%)", "Non-linearity factor"],
    passCriteria: ["Linearity within ± 2 % (200–1000 W/m²)", "Non-linearity factor documented"],
    resultFields: [
      { label: "Max Deviation", unit: "%", type: "percentage" },
      { label: "Non-linearity Factor", unit: "", type: "number" },
      { label: "Range Tested", unit: "W/m²", type: "text" },
      { label: "Points Measured", unit: "", type: "number" },
    ],
  },
  {
    id: "spectral-mismatch", clause: "IEC 60904-7", testName: "Spectral Mismatch Correction",
    purpose: "Calculate and apply spectral mismatch correction factor M between test device and reference.",
    testConditions: ["Spectral data of: simulator, AM1.5G reference, test device SR, reference device SR"],
    equipmentUsed: ["Spectroradiometer", "Reference SR data", "Test device SR data", "Calculation software"],
    measurements: ["Simulator spectrum", "Mismatch factor M", "Corrected Isc"],
    passCriteria: ["M within 0.98–1.02 for Class A⁺ spectral match", "Correction factor applied to results"],
    resultFields: [
      { label: "Mismatch Factor M", unit: "", type: "number" },
      { label: "Uncorrected Isc", unit: "A", type: "number" },
      { label: "Corrected Isc", unit: "A", type: "number" },
      { label: "Spectral Class", unit: "", type: "text" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Calibration Report Tests
// ---------------------------------------------------------------------------
export const CALIBRATION_TESTS: TestDefinition[] = [
  {
    id: "cal-solar-sim", clause: "Cal-001", testName: "Solar Simulator Calibration",
    purpose: "Calibrate solar simulator per IEC 60904-9 and verify classification (A⁺/A/B/C).",
    testConditions: ["Spectral match measurement", "Spatial uniformity scan", "Temporal stability measurement"],
    equipmentUsed: ["Spectroradiometer", "Reference cell array", "Uniformity scanner", "Oscilloscope"],
    measurements: ["Spectral match ratio per band", "Spatial non-uniformity (%)", "Temporal instability (%)"],
    passCriteria: ["Classification meets declared class", "All 3 parameters within class limits"],
    resultFields: [
      { label: "Spectral Class", unit: "", type: "text" },
      { label: "Spatial Class", unit: "", type: "text" },
      { label: "Temporal Class", unit: "", type: "text" },
      { label: "Overall Class", unit: "", type: "text" },
      { label: "Non-uniformity", unit: "%", type: "percentage" },
      { label: "Instability", unit: "%", type: "percentage" },
    ],
  },
  {
    id: "cal-chamber", clause: "Cal-002", testName: "Environmental Chamber Calibration",
    purpose: "Calibrate environmental test chamber temperature and humidity sensors.",
    testConditions: ["Multi-point T calibration: −40, 0, 25, 50, 85 °C", "Multi-point RH calibration: 30, 50, 85 %"],
    equipmentUsed: ["NABL-traceable reference thermometer", "Traceable hygrometer", "Data logger"],
    measurements: ["T deviation at each setpoint", "RH deviation at each setpoint", "Uniformity within chamber"],
    passCriteria: ["T accuracy ± 2 °C", "RH accuracy ± 5 %", "Uniformity within spec"],
    resultFields: [
      { label: "T Accuracy", unit: "°C", type: "number" },
      { label: "RH Accuracy", unit: "%", type: "number" },
      { label: "T Uniformity", unit: "°C", type: "number" },
      { label: "Cal Interval", unit: "months", type: "number" },
    ],
  },
  {
    id: "cal-ref-cell", clause: "Cal-003", testName: "Reference Cell Calibration",
    purpose: "Calibrate reference solar cell with traceability to WPVS or national standard.",
    testConditions: ["Natural sunlight or primary standard", "Temperature 25 ± 0.5 °C", "Spectral mismatch correction"],
    equipmentUsed: ["Primary reference cell", "Spectroradiometer", "Temperature-controlled stage", "I-V tracer"],
    measurements: ["Isc at STC", "Spectral mismatch factor", "Uncertainty budget"],
    passCriteria: ["Uncertainty ≤ 1.5 % (k=2)", "Traceability chain documented"],
    resultFields: [
      { label: "Isc (STC)", unit: "A", type: "number" },
      { label: "Sensitivity", unit: "V/(W/m²)", type: "number" },
      { label: "Uncertainty (k=2)", unit: "%", type: "percentage" },
      { label: "Traceability", unit: "", type: "text" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Measurement Uncertainty Report Tests
// ---------------------------------------------------------------------------
export const UNCERTAINTY_TESTS: TestDefinition[] = [
  {
    id: "unc-power", clause: "GUM §8", testName: "Power Measurement Uncertainty",
    purpose: "Calculate combined and expanded uncertainty for Pmax measurement at STC.",
    testConditions: ["Per GUM (JCGM 100:2008)", "Coverage factor k=2 (95 % confidence)"],
    equipmentUsed: ["Uncertainty calculation spreadsheet", "Calibration certificates", "Type A data sets"],
    measurements: ["Type A components (repeatability)", "Type B components (equipment, reference, spectral)", "Combined standard uncertainty", "Expanded uncertainty"],
    passCriteria: ["Uncertainty budget complete", "All sources identified", "Coverage factor stated"],
    resultFields: [
      { label: "Type A Unc", unit: "%", type: "percentage" },
      { label: "Type B Unc", unit: "%", type: "percentage" },
      { label: "Combined Unc", unit: "%", type: "percentage" },
      { label: "Expanded Unc (k=2)", unit: "%", type: "percentage" },
      { label: "Coverage Factor", unit: "", type: "number", defaultValue: "2" },
    ],
  },
  {
    id: "unc-temperature", clause: "GUM §8", testName: "Temperature Measurement Uncertainty",
    purpose: "Calculate uncertainty budget for module temperature measurement.",
    testConditions: ["Per GUM methodology", "All temperature measurement sources considered"],
    equipmentUsed: ["Calibration certificates for T sensors", "Data acquisition specs"],
    measurements: ["Thermocouple calibration unc", "DAQ resolution", "Thermal contact resistance", "Combined temperature uncertainty"],
    passCriteria: ["Total T uncertainty ≤ ± 1 °C (k=2)"],
    resultFields: [
      { label: "Sensor Cal Unc", unit: "°C", type: "number" },
      { label: "DAQ Resolution", unit: "°C", type: "number" },
      { label: "Contact Unc", unit: "°C", type: "number" },
      { label: "Combined (k=2)", unit: "°C", type: "number" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Incoming Inspection Report Tests
// ---------------------------------------------------------------------------
export const INCOMING_INSPECTION_TESTS: TestDefinition[] = [
  {
    id: "insp-receiving", clause: "SOP-RCV-001", testName: "Receiving Inspection",
    purpose: "Inspect incoming PV modules for shipping damage, packaging integrity, and label verification.",
    testConditions: ["Ambient conditions", "Within 24 h of receipt", "Photography of packaging & module"],
    equipmentUsed: ["Inspection table", "Camera", "Barcode scanner", "Measuring tape"],
    measurements: ["Packaging condition", "Module visual condition", "Label verification", "Quantity check"],
    passCriteria: ["No shipping damage", "Labels match order", "Quantity correct", "Packaging intact"],
    resultFields: [
      { label: "Packaging Condition", unit: "", type: "pass_fail" },
      { label: "Module Condition", unit: "", type: "pass_fail" },
      { label: "Labels Match", unit: "", type: "pass_fail" },
      { label: "Quantity Correct", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "insp-visual-detailed", clause: "SOP-RCV-002", testName: "Detailed Visual Inspection (Incoming)",
    purpose: "Detailed visual inspection of module for pre-existing defects before testing.",
    testConditions: ["Diffused lighting > 1000 lux", "Module at room temperature", "Front & rear surfaces"],
    equipmentUsed: ["Inspection table", "10× magnifier", "Camera", "Flashlight"],
    measurements: ["Cell cracks", "Discoloration", "Frame condition", "Glass condition", "J-box & connectors"],
    passCriteria: ["No pre-existing cracks visible", "No shipping damage", "All connectors intact"],
    resultFields: [
      { label: "Front Glass", unit: "", type: "pass_fail" },
      { label: "Cells (visual)", unit: "", type: "pass_fail" },
      { label: "Backsheet", unit: "", type: "pass_fail" },
      { label: "Frame", unit: "", type: "pass_fail" },
      { label: "J-Box & Connectors", unit: "", type: "pass_fail" },
    ],
  },
  {
    id: "insp-el-incoming", clause: "SOP-RCV-003", testName: "EL Imaging (Incoming)",
    purpose: "EL imaging to document cell-level condition of module at receipt.",
    testConditions: ["Dark room", "Forward bias at Isc", "Exposure: 10–30 s"],
    equipmentUsed: ["EL camera (Si-CCD or InGaAs)", "DC power supply", "Dark enclosure"],
    measurements: ["Full-module EL image", "Cell crack detection", "Inactive cell areas"],
    passCriteria: ["EL baseline documented", "Pre-existing cracks recorded"],
    resultFields: [
      { label: "EL Image Captured", unit: "", type: "pass_fail" },
      { label: "Cracks Detected", unit: "", type: "number" },
      { label: "Inactive Areas", unit: "", type: "number" },
      { label: "Overall Quality", unit: "", type: "text" },
    ],
  },
];

// ---------------------------------------------------------------------------
// IEC 62782 — Sand/Dust Abrasion
// ---------------------------------------------------------------------------
export const IEC_62782_TESTS: TestDefinition[] = [
  {
    id: "sand-abrasion", clause: "IEC 62782 Clause 7", testName: "Sand/Dust Abrasion Test",
    purpose: "Evaluate resistance of module front surface to abrasion by wind-blown sand and dust particles.",
    testConditions: ["Sand particle size 0.1–0.5 mm", "Impact velocity 10–20 m/s", "Controlled angle of impact", "Specified duration / mass of sand"],
    equipmentUsed: ["Sand blasting chamber", "Air compressor", "Sand hopper", "Glass transmittance meter", "I-V tracer"],
    measurements: ["Glass transmittance before & after", "Surface roughness", "Haze measurement", "I-V before & after"],
    passCriteria: ["Transmittance loss < 2 %", "No glass breakage", "No exposed live parts"],
    resultFields: [
      { label: "T Before", unit: "%", type: "percentage" },
      { label: "T After", unit: "%", type: "percentage" },
      { label: "T Loss", unit: "%", type: "percentage" },
      { label: "Haze Before", unit: "%", type: "percentage" },
      { label: "Haze After", unit: "%", type: "percentage" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After", unit: "W", type: "number" },
    ],
  },
  {
    id: "dml-sand", clause: "IEC 62782 + 61215-2 MQT16", testName: "Dynamic Mechanical Load + Sand Exposure",
    purpose: "Combined test: dynamic mechanical load cycling followed by sand abrasion to simulate real-world desert conditions.",
    testConditions: ["DML: ±1000 Pa, 1000 cycles", "Followed by sand abrasion per IEC 62782", "Module in standard mounting"],
    equipmentUsed: ["DML test frame", "Sand abrasion chamber", "I-V tracer", "EL camera"],
    measurements: ["Deflection during DML", "I-V before, after DML, after sand", "EL before & after"],
    passCriteria: ["Pmax degradation < 5 % (combined)", "No structural failure", "No glass breakage"],
    resultFields: [
      { label: "DML Cycles", unit: "", type: "number", defaultValue: "1000" },
      { label: "DML Pressure", unit: "Pa", type: "number", defaultValue: "1000" },
      { label: "Pmax Before", unit: "W", type: "number" },
      { label: "Pmax After DML", unit: "W", type: "number" },
      { label: "Pmax After Sand", unit: "W", type: "number" },
      { label: "Total Degradation", unit: "%", type: "percentage" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getTestDefinitions(standard: string): TestDefinition[] {
  switch (standard) {
    case "iec_61215_qualification": return IEC_61215_TESTS;
    case "iec_61730_safety": return IEC_61730_TESTS;
    case "iec_61853_energy": return IEC_61853_TESTS;
    case "iec_61701_salt": return IEC_61701_TESTS;
    case "iec_62716_ammonia": return IEC_62716_TESTS;
    case "iec_62804_pid": return IEC_62804_TESTS;
    case "iec_63209_letid": return IEC_63209_TESTS;
    case "iec_62788_material": return IEC_62788_TESTS;
    case "iec_62938_snow": return IEC_62938_TESTS;
    case "iec_61345_uv_thinfilm": return IEC_61345_TESTS;
    case "ul_61730_safety": return UL_61730_TESTS;
    case "is_14286_bis": return IS_14286_TESTS;
    case "iec_62915_bom": return IEC_62915_TESTS;
    case "iec_60904_measurement": return IEC_60904_TESTS;
    case "calibration_report": return CALIBRATION_TESTS;
    case "uncertainty_report": return UNCERTAINTY_TESTS;
    case "incoming_inspection": return INCOMING_INSPECTION_TESTS;
    case "iec_62782_sand": return IEC_62782_TESTS;
    default: return [];
  }
}

export function getStandardLabel(reportType: string): string {
  const labels: Record<string, string> = {
    iec_61215_qualification: "IEC 61215:2021",
    iec_61730_safety: "IEC 61730:2016",
    iec_61853_energy: "IEC 61853:2018",
    iec_61701_salt: "IEC 61701:2020",
    iec_62716_ammonia: "IEC 62716:2013",
    iec_60904_measurement: "IEC 60904",
    iec_62804_pid: "IEC TS 62804:2015",
    iec_63209_letid: "IEC TS 63209",
    iec_62788_material: "IEC 62788",
    iec_62938_snow: "IEC 62938",
    iec_61345_uv_thinfilm: "IEC 61345",
    ul_61730_safety: "UL 61730 / UL 1703",
    is_14286_bis: "IS 14286 (BIS)",
    iec_62915_bom: "IEC 62915",
    calibration_report: "ISO/IEC 17025",
    uncertainty_report: "GUM (JCGM 100)",
    incoming_inspection: "Internal SOP",
    iec_62782_sand: "IEC 62782",
    custom: "Custom",
  };
  return labels[reportType] || reportType;
}

export function getStandardTitle(reportType: string): string {
  const titles: Record<string, string> = {
    iec_61215_qualification: "Design Qualification & Type Approval Test Report",
    iec_61730_safety: "Safety Qualification Test Report",
    iec_61853_energy: "Energy Rating Test Report",
    iec_61701_salt: "Salt Mist Corrosion Test Report",
    iec_62716_ammonia: "Ammonia Corrosion Resistance Test Report",
    iec_60904_measurement: "PV Device Measurement Report",
    iec_62804_pid: "Potential Induced Degradation (PID) Test Report",
    iec_63209_letid: "LeTID (Light & Elevated Temperature Induced Degradation) Test Report",
    iec_62788_material: "Material Testing Report",
    iec_62938_snow: "Non-Uniform Snow Load Test Report",
    iec_61345_uv_thinfilm: "UV Test Report (Thin-Film Modules)",
    ul_61730_safety: "North American Safety Qualification Report (UL Listing)",
    is_14286_bis: "BIS Certification Test Report",
    iec_62915_bom: "BoM Change Impact & Type Test Matrix Report",
    calibration_report: "Equipment Calibration Certificate",
    uncertainty_report: "Measurement Uncertainty Budget Report",
    incoming_inspection: "Incoming Module Inspection Report",
    iec_62782_sand: "Sand/Dust Abrasion Test Report",
    custom: "Custom Test Report",
  };
  return titles[reportType] || "Test Report";
}
