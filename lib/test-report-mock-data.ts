// @ts-nocheck
// Shared mock data for IEC 61215:2021 + IEC 61730:2023 Test Report Template

export const REPORT_INFO = {
  reportNo: "SLX-TERF-2024-0047",
  issueDate: "2024-11-15",
  revision: "00",
  lab: "Accredited Test Laboratory",
  accreditation: "ISO/IEC 17025:2017 | IECEE CB Scheme | NABL Accredited",
  labAddress: "Solar Technology Park, Industrial Zone, PIN 560 100",
  manufacturer: "Module Manufacturer",
  applicant: "Applicant Organization",
  model: "SM-400M-BF-HG",
  productFamily: "SM-400M Series Bifacial Glass-Glass",
  type: "400W Mono-Si PERC N-type Bifacial Half-Cut",
  ratedPower: "400 Wp",
  cellType: "Mono-Si PERC N-type Bifacial Half-Cut (156.75 × 78.375 mm)",
  dimensions: "1755 × 1038 × 35 mm",
  weight: "22.5 kg",
  standards: [
    "IEC 61215-1:2021",
    "IEC 61215-1-1:2021",
    "IEC 61730-1:2023",
    "IEC 61730-2:2023",
    "IEC TS 62804-1:2015 (PID)",
    "IEC TS 63209-1:2021 (LeTID)",
  ],
  ieceeRef: "OD-2048 Rev.4 (2023)",
  safetyClass: "Class II",
  applicationClass: "A (Standard)",
  fireClass: "Type 1",
  maxSystemVoltage: "1500 V DC",
  testingPeriod: "2024-08-01 to 2024-11-10",
};

export const MODULE_SPECS = {
  Pmax: 400,
  Isc: 9.99,
  Voc: 49.20,
  Imp: 9.48,
  Vmp: 42.15,
  FF: 81.3,
  efficiency: 21.98,
  tempCoeffPmax: -0.35,
  tempCoeffIsc: 0.04,
  tempCoeffVoc: -0.27,
  cellsTotal: 108,
  cellsConfig: "6 × 18 half-cut",
  strings: 3,
  bypassDiodes: 3,
  frontGlass: "3.2 mm AR-coated tempered glass",
  rearGlass: "2.0 mm tempered glass",
  encapsulant: "EVA (front) + POE (rear)",
  frame: "Anodized aluminum alloy 6005A-T5, 35 mm",
  junctionBox: "IP68, 3 diode compartments",
  connector: "MC4 compatible, TÜV approved, 1200 mm cable, 4 mm²",
  nmot: "44.2 ± 2 °C",
};

export const IV_PRE = [
  { V: 0, I: 9.99, P: 0 },
  { V: 5, I: 9.98, P: 49.9 },
  { V: 10, I: 9.97, P: 99.7 },
  { V: 15, I: 9.96, P: 149.4 },
  { V: 20, I: 9.95, P: 199.0 },
  { V: 25, I: 9.94, P: 248.5 },
  { V: 30, I: 9.92, P: 297.6 },
  { V: 35, I: 9.87, P: 345.5 },
  { V: 38, I: 9.78, P: 371.6 },
  { V: 40, I: 9.65, P: 386.0 },
  { V: 42, I: 9.48, P: 398.2 },
  { V: 43, I: 9.20, P: 395.6 },
  { V: 44, I: 8.75, P: 385.0 },
  { V: 45, I: 8.10, P: 364.5 },
  { V: 46, I: 7.15, P: 328.9 },
  { V: 47, I: 5.80, P: 272.6 },
  { V: 48, I: 3.90, P: 187.2 },
  { V: 49, I: 1.50, P: 73.5 },
  { V: 49.2, I: 0, P: 0 },
];

export const IV_POST = IV_PRE.map((pt) => ({
  V: pt.V,
  I: parseFloat((pt.I * 0.983).toFixed(2)),
  P: parseFloat((pt.P * 0.983).toFixed(1)),
}));

export const IV_COMBINED = IV_PRE.map((pt, i) => ({
  V: pt.V,
  "I Pre": pt.I,
  "P Pre": pt.P,
  "I Post": IV_POST[i].I,
  "P Post": IV_POST[i].P,
}));

export const INSULATION_TREND = [
  { label: "Initial", value: 12500 },
  { label: "Post TC200", value: 11800 },
  { label: "Post TC400", value: 11200 },
  { label: "Post HF", value: 10900 },
  { label: "Post DH", value: 9800 },
  { label: "Post Hail", value: 10200 },
];

export const WET_LEAKAGE_TREND = [
  { label: "Initial", value: 2.1 },
  { label: "Post TC", value: 2.4 },
  { label: "Post HF", value: 2.7 },
  { label: "Post DH", value: 3.1 },
  { label: "Post Hail", value: 2.8 },
];

export const EL_SEVERITY = [
  { label: "Initial", score: 0.8 },
  { label: "Post UV", score: 1.1 },
  { label: "Post TC200", score: 1.6 },
  { label: "Post TC400", score: 2.3 },
  { label: "Post HF", score: 1.9 },
  { label: "Post DH", score: 2.7 },
  { label: "Post ML", score: 2.1 },
  { label: "Post Hail", score: 2.4 },
];

export const TC_PRE_POST = [
  { group: "TC200 Pre", Pmax: 399.8, Isc: 9.99, Voc: 49.20, FF: 81.3 },
  { group: "TC200 Post", Pmax: 393.5, Isc: 9.87, Voc: 49.05, FF: 81.0 },
  { group: "TC400 Pre", Pmax: 399.8, Isc: 9.99, Voc: 49.20, FF: 81.3 },
  { group: "TC400 Post", Pmax: 384.8, Isc: 9.78, Voc: 48.85, FF: 80.6 },
];

export const DH_TREND = [
  { hours: 0, Pmax: 399.8 },
  { hours: 200, Pmax: 397.2 },
  { hours: 400, Pmax: 395.1 },
  { hours: 600, Pmax: 393.0 },
  { hours: 800, Pmax: 391.2 },
  { hours: 1000, Pmax: 388.2 },
];

export const STABILIZATION_DATA = [
  { exposure: 50, Pmax: 398.1 },
  { exposure: 100, Pmax: 398.8 },
  { exposure: 150, Pmax: 399.2 },
  { exposure: 200, Pmax: 399.5 },
  { exposure: 250, Pmax: 399.7 },
  { exposure: 300, Pmax: 399.8 },
  { exposure: 350, Pmax: 399.8 },
  { exposure: 400, Pmax: 399.8 },
];

export const SEQUENCE_SUMMARY = [
  { mq: "MQT 01", test: "Visual Inspection", clause: "Cl.4.1/IEC61215-2:2021", seq: "A/B/C/D", initialPmax: "399.8", finalPmax: "—", delta: "—", limit: "No defects", result: "PASS" },
  { mq: "MQT 05", test: "NMOT Determination", clause: "Cl.4.5", seq: "Pre", initialPmax: "—", finalPmax: "44.2°C", delta: "—", limit: "Report value", result: "PASS" },
  { mq: "MQT 06", test: "STC Performance (Seq A)", clause: "Cl.4.6", seq: "A", initialPmax: "399.8", finalPmax: "392.4", delta: "−1.85%", limit: "<5%", result: "PASS" },
  { mq: "MQT 06", test: "STC Performance (Seq B)", clause: "Cl.4.6", seq: "B", initialPmax: "399.8", finalPmax: "384.8", delta: "−3.75%", limit: "<8%", result: "PASS" },
  { mq: "MQT 06", test: "STC Performance (Seq C)", clause: "Cl.4.6", seq: "C", initialPmax: "399.8", finalPmax: "388.2", delta: "−2.90%", limit: "<5%", result: "PASS" },
  { mq: "MQT 06", test: "STC Performance (Seq D)", clause: "Cl.4.6", seq: "D", initialPmax: "399.8", finalPmax: "396.1", delta: "−0.93%", limit: "<5%", result: "PASS" },
  { mq: "MQT 09", test: "Hot Spot Endurance", clause: "Cl.4.9", seq: "B", initialPmax: "399.8", finalPmax: "397.3", delta: "−0.63%", limit: "No damage", result: "PASS" },
  { mq: "MQT 10", test: "UV Preconditioning", clause: "Cl.4.10", seq: "A", initialPmax: "399.8", finalPmax: "397.2", delta: "−0.65%", limit: "<5%", result: "PASS" },
  { mq: "MQT 11.1", test: "Thermal Cycling TC200", clause: "Cl.4.11", seq: "A", initialPmax: "399.8", finalPmax: "393.5", delta: "−1.58%", limit: "<5%", result: "PASS" },
  { mq: "MQT 11.2", test: "Thermal Cycling TC400", clause: "Cl.4.11", seq: "B", initialPmax: "399.8", finalPmax: "384.8", delta: "−3.75%", limit: "<8%", result: "PASS" },
  { mq: "MQT 12", test: "Humidity Freeze HF10", clause: "Cl.4.12", seq: "A", initialPmax: "399.8", finalPmax: "392.1", delta: "−1.93%", limit: "<5%", result: "PASS" },
  { mq: "MQT 13", test: "Damp Heat DH1000", clause: "Cl.4.13", seq: "C", initialPmax: "399.8", finalPmax: "388.2", delta: "−2.90%", limit: "<5%", result: "PASS" },
  { mq: "MQT 15", test: "Wet Leakage Current", clause: "Cl.4.15", seq: "A/B/C/D", initialPmax: "2.1 mA·m²", finalPmax: "3.1 mA·m²", delta: "+47%", limit: "<40 mA·m²", result: "PASS" },
  { mq: "MQT 16", test: "Mechanical Load", clause: "Cl.4.16", seq: "D", initialPmax: "399.8", finalPmax: "396.5", delta: "−0.83%", limit: "<5%", result: "PASS" },
  { mq: "MQT 17", test: "Hail Impact Test", clause: "Cl.4.17", seq: "D", initialPmax: "399.8", finalPmax: "395.9", delta: "−0.98%", limit: "No cracks", result: "PASS" },
  { mq: "MQT 18", test: "Bypass Diode Thermal", clause: "Cl.4.18", seq: "A", initialPmax: "58°C", finalPmax: "—", delta: "—", limit: "<90°C", result: "PASS" },
  { mq: "MQT 19", test: "Stabilization", clause: "Cl.4.19", seq: "Pre", initialPmax: "399.8", finalPmax: "399.8", delta: "Stable", limit: "±2% 3 consec.", result: "PASS" },
  { mq: "MST 11", test: "Insulation Resistance", clause: "IEC61730-2:§10.11", seq: "A/B/C/D", initialPmax: "12500 MΩ·m²", finalPmax: "9800 MΩ·m²", delta: "−21.6%", limit: ">40 MΩ·m²", result: "PASS" },
  { mq: "MST 12", test: "Wet Leakage (Safety)", clause: "IEC61730-2:§10.12", seq: "A/B/C/D", initialPmax: "2.1 mA·m²", finalPmax: "3.1 mA·m²", delta: "+47%", limit: "<40 mA·m²", result: "PASS" },
  { mq: "MST 13", test: "Ground Continuity", clause: "IEC61730-2:§10.13", seq: "D", initialPmax: "0.048 Ω", finalPmax: "—", delta: "—", limit: "<0.1 Ω", result: "PASS" },
  { mq: "MST 14", test: "Impulse Voltage", clause: "IEC61730-2:§10.14", seq: "C", initialPmax: "No breakdown", finalPmax: "—", delta: "—", limit: "No flashover", result: "PASS" },
  { mq: "PID", test: "PID Test (IEC TS 62804)", clause: "IEC TS 62804-1", seq: "Optional", initialPmax: "399.8", finalPmax: "396.8", delta: "−0.75%", limit: "<5%", result: "PASS" },
  { mq: "LeTID", test: "LeTID (IEC TS 63209)", clause: "IEC TS 63209-1", seq: "Optional", initialPmax: "399.8", finalPmax: "396.2", delta: "−0.90%", limit: "<5%", result: "PASS" },
];

export const VISUAL_ITEMS = [
  { item: "Broken or cracked cells", preResult: "None detected", postResult: "None detected", verdict: "PASS" },
  { item: "Delamination (front glass/encapsulant)", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Delamination (rear encapsulant/backsheet)", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Bubbles or blisters in encapsulant", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Deformation of frame", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Cracked or broken frame", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Junction box damage", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Connector damage or corrosion", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Cable damage or insulation breach", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Discoloration of encapsulant", preResult: "None", postResult: "Slight yellowing (<ΔE 3.0)", verdict: "PASS" },
  { item: "Broken interconnects (visible)", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Glass breakage (front or rear)", preResult: "None", postResult: "None", verdict: "PASS" },
  { item: "Soiling or contamination", preResult: "Cleaned per §4.1", postResult: "Cleaned per §4.1", verdict: "PASS" },
];

export const SEQUENCE_PMAX = [
  { name: "Initial (pre-test)", Pmax: 399.8, limit: 380 },
  { name: "Post Seq A\n(UV+TC200+HF)", Pmax: 392.4, limit: 380 },
  { name: "Post Seq B\n(TC600)", Pmax: 384.8, limit: 368 },
  { name: "Post Seq C\n(DH1000)", Pmax: 388.2, limit: 380 },
  { name: "Post Seq D\n(ML+Hail)", Pmax: 396.1, limit: 380 },
];
