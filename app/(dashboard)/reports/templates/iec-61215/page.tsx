// @ts-nocheck
"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { IVCurveComparisonChart } from "@/components/reports/IVCurveComparisonChart";
import { PmaxStabilizationChart, InsulationResistanceChart, PowerDegradationChart, DEFAULT_STABILIZATION_DATA, DEFAULT_INSULATION_DATA, DEFAULT_DEGRADATION_DATA, DEFAULT_SAMPLE_IDS } from "@/components/reports/ReportSummaryCharts";

const REPORT_NO = "SLX-RPT-IEC61215-2026-001";
const ACCENT = "#1e3a5f";

/* ─── Static IV curve data (STC: 1000W/m², 25°C, AM1.5) for 430W module ─── */
const ivDataSTC = [
  { v: 0, i: 12.85, p: 0 }, { v: 2, i: 12.84, p: 25.68 }, { v: 5, i: 12.83, p: 64.15 },
  { v: 10, i: 12.80, p: 128.0 }, { v: 15, i: 12.74, p: 191.1 }, { v: 20, i: 12.62, p: 252.4 },
  { v: 25, i: 12.44, p: 311.0 }, { v: 28, i: 12.28, p: 343.8 }, { v: 30, i: 12.10, p: 363.0 },
  { v: 32, i: 11.84, p: 378.9 }, { v: 33, i: 11.66, p: 384.8 }, { v: 34, i: 11.41, p: 388.0 },
  { v: 35, i: 11.08, p: 387.8 }, { v: 35.3, i: 12.19, p: 430.3 }, { v: 36, i: 10.21, p: 367.6 },
  { v: 38, i: 8.42, p: 320.0 }, { v: 39, i: 6.80, p: 265.2 }, { v: 40, i: 4.90, p: 196.0 },
  { v: 41, i: 3.10, p: 127.1 }, { v: 42, i: 1.55, p: 65.1 }, { v: 43.0, i: 0.42, p: 18.1 },
  { v: 43.24, i: 0, p: 0 },
];
const ivDataNMOT = [
  { v: 0, i: 10.57, p: 0 }, { v: 2, i: 10.56, p: 21.12 }, { v: 5, i: 10.55, p: 52.75 },
  { v: 10, i: 10.51, p: 105.1 }, { v: 15, i: 10.44, p: 156.6 }, { v: 20, i: 10.33, p: 206.6 },
  { v: 25, i: 10.18, p: 254.5 }, { v: 28, i: 10.00, p: 280.0 }, { v: 30, i: 9.78, p: 293.4 },
  { v: 32, i: 9.44, p: 302.1 }, { v: 33.5, i: 9.03, p: 302.5 }, { v: 34.5, i: 8.51, p: 293.6 },
  { v: 36, i: 7.20, p: 259.2 }, { v: 37, i: 5.80, p: 214.6 }, { v: 38, i: 4.18, p: 158.8 },
  { v: 39, i: 2.50, p: 97.5 }, { v: 40, i: 1.10, p: 44.0 }, { v: 40.18, i: 0, p: 0 },
];

/* ─── Pre/Post power degradation data across test sequence ─── */
const prePostData = [
  { test: "Initial", pmax: 430.8, delta: 0 },
  { test: "MQT09", pmax: 429.5, delta: -0.30 },
  { test: "MQT11", pmax: 429.3, delta: -0.35 },
  { test: "MQT12", pmax: 428.1, delta: -0.63 },
  { test: "MQT13", pmax: 427.8, delta: -0.70 },
  { test: "MQT10", pmax: 427.6, delta: -0.74 },
  { test: "MQT14", pmax: 426.1, delta: -1.09 },
  { test: "MQT16", pmax: 425.3, delta: -1.27 },
  { test: "MQT06", pmax: 429.2, delta: -0.37 },
];

/* ─── Full 22-MQT dataset per IEC 61215-2:2021 ─── */
const INITIAL_MQTS = [
  {
    id: "MQT01", name: "Visual Inspection",
    clause: "MQT 01", standard_ref: "IEC 61215-2 §4.1",
    test_condition: "Pre/post each stress test; bright diffuse light ~1000 lx",
    equipment: "Illuminated inspection table, magnifying glass ×5",
    criterion: "No cracks, delamination, discoloration per IEC 61215-1 Table 1",
    preValue: "No relevant defects found",
    postValue: "No new defects after full sequence",
    result: "PASS", technician: "Dr. A. Sharma", date: "2026-01-15",
    observations: "Frame seals intact; no bubbling in encapsulant; junction box lid sealed.",
  },
  {
    id: "MQT02", name: "Maximum Power Determination (STC Flash)",
    clause: "MQT 02", standard_ref: "IEC 61215-2 §4.2",
    test_condition: "STC: 1000 W/m², 25±2°C, AM1.5G, IEC 60904-3",
    equipment: "Class AAA Pulsed Solar Simulator (Sinton Instruments SS200)",
    criterion: "Baseline measurement for degradation tracking",
    preValue: "Pmax=430.8W, Voc=43.24V, Isc=12.85A, Vmpp=35.31V, Impp=12.20A, FF=0.7786",
    postValue: "Pmax=429.2W (ΔPmax=−0.4% from baseline)",
    result: "PASS", technician: "Dr. A. Sharma", date: "2026-01-15",
    observations: "I-V curve shape nominal; no signs of shunting or series resistance increase.",
  },
  {
    id: "MQT03", name: "Insulation Test",
    clause: "MQT 03", standard_ref: "IEC 61215-2 §4.3",
    test_condition: "DC 1000V applied frame-to-terminals (all shorted); 1 min; per IEC 61215-1 §10.3",
    equipment: "Insulation Resistance Tester (Kyoritsu KEW 3128)",
    criterion: "RISO × A ≥ 40 MΩ·m²",
    preValue: "RISO=2850 MΩ (RISO·A=6200 MΩ·m²)",
    postValue: "RISO·A=5800 MΩ·m² (post DH1000)",
    result: "PASS", technician: "Mr. R. Verma", date: "2026-01-16",
    observations: "All values well above 40 MΩ·m² limit. No leakage path detected.",
  },
  {
    id: "MQT04", name: "Measurement of Temperature Coefficients",
    clause: "MQT 04", standard_ref: "IEC 61215-2 §4.4 / IEC 60891",
    test_condition: "Flash test at 5 temperatures: 15, 25, 35, 50, 65°C; 1000 W/m²",
    equipment: "Temperature-controlled solar simulator; Pt100 sensors (Class A)",
    criterion: "Reproducibility within ±0.002%/°C for 3 measurements",
    preValue: "α(Isc)=+0.049%/°C, β(Voc)=−0.282%/°C, δ(Pmax)=−0.362%/°C",
    postValue: "N/A (characterization test only)",
    result: "PASS", technician: "Ms. K. Mehta", date: "2026-01-18",
    observations: "Coefficients consistent with manufacturer datasheet ±0.001%/°C.",
  },
  {
    id: "MQT05", name: "NMOT Determination",
    clause: "MQT 05", standard_ref: "IEC 61215-2 §4.5 / IEC 60904-5",
    test_condition: "Outdoor: G=800 W/m², Ta=20°C, wind=1 m/s, open rack tilt 45°",
    equipment: "Outdoor test station with calibrated reference cell (Kipp & Zonen CMP22)",
    criterion: "Reproducibility ±2°C over 3 days measurement",
    preValue: "NMOT=44.2±0.5°C",
    postValue: "N/A (characterization test only)",
    result: "PASS", technician: "Dr. A. Sharma", date: "2026-01-20",
    observations: "Average of 3 clear-sky days. NMOT consistent with manufacturer stated 44°C.",
  },
  {
    id: "MQT06", name: "Performance at STC and NMOT",
    clause: "MQT 06", standard_ref: "IEC 61215-2 §4.6",
    test_condition: "STC (1000 W/m², 25°C) and NMOT (800 W/m², Tc=NMOT)",
    equipment: "Class AAA Pulsed Solar Simulator (Sinton Instruments SS200)",
    criterion: "Consistent with rated values; ΔPmax from rated ≤ ±5%",
    preValue: "Pmax=430.8W, Voc=43.24V, Isc=12.85A (STC initial)",
    postValue: "Pmax=429.2W (ΔPmax=−0.4%) | Pmax_NMOT=332.6W, Voc_NMOT=40.18V, Isc_NMOT=10.57A",
    result: "PASS", technician: "Ms. K. Mehta", date: "2026-01-22",
    observations: "Final STC flash post full test sequence. Degradation well within limit.",
  },
  {
    id: "MQT07", name: "Performance at NMOT",
    clause: "MQT 07", standard_ref: "IEC 61215-2 §4.7",
    test_condition: "Irradiance=800 W/m², cell temp=NMOT=44.2°C",
    equipment: "Class AAA Solar Simulator; Pt100 temperature sensors",
    criterion: "Consistent with STC performance and temperature coefficients",
    preValue: "Pmax_NMOT=332.6W, Voc_NMOT=40.18V, Isc_NMOT=10.57A",
    postValue: "N/A (characterization test)",
    result: "PASS", technician: "Mr. R. Verma", date: "2026-01-23",
    observations: "Calculated Pmax at NMOT from STC + temperature coefficients matches within 0.3%.",
  },
  {
    id: "MQT08", name: "Performance at Low Irradiance",
    clause: "MQT 08", standard_ref: "IEC 61215-2 §4.8 / IEC 60904-1",
    test_condition: "200 W/m² and 400 W/m², 25°C (aperture adjustment on simulator)",
    equipment: "Class AAA Solar Simulator with variable aperture; calibrated reference cell",
    criterion: "Relative efficiency decline within expected range; no reverse-current issues",
    preValue: "Pmax@200W/m²=79.4W (η_rel=−1.2%), Pmax@400W/m²=163.8W (η_rel=−0.5%)",
    postValue: "N/A (characterization test only)",
    result: "PASS", technician: "Mr. D. Rao", date: "2026-01-25",
    observations: "PERC technology shows excellent low-light performance. Fill factor maintained.",
  },
  {
    id: "MQT09", name: "Outdoor Exposure",
    clause: "MQT 09", standard_ref: "IEC 61215-2 §4.9",
    test_condition: "Min. 60 kWh/m² total irradiation; outdoor south-facing 30° tilt",
    equipment: "Outdoor test station, pyranometer (Kipp & Zonen CMP11)",
    criterion: "ΔPmax < 5% from baseline",
    preValue: "Pmax=430.8W (initial baseline)",
    postValue: "Pmax=429.5W (ΔPmax=−0.3%)",
    result: "PASS", technician: "Dr. A. Sharma", date: "2026-01-28",
    observations: "Initial light-induced degradation (LID) stabilized. No soiling observed (cleaned before final flash).",
  },
  {
    id: "MQT10", name: "Hot-Spot Endurance",
    clause: "MQT 10", standard_ref: "IEC 61215-2 §4.10",
    test_condition: "1000 W/m² illumination with one cell shaded; 5 h; worst-case hotspot identification first via IR thermography",
    equipment: "Steady-state solar simulator (Spire 4600SLP); FLIR A700 IR camera",
    criterion: "No irreversible damage; ΔPmax < 5% from pre-test; no bypass diode failure",
    preValue: "Max hotspot ΔT=18°C at 5h exposure; identified cell at position R7-C12",
    postValue: "ΔPmax=−0.4%, No physical damage; bypass diodes functional",
    result: "PASS", technician: "Ms. K. Mehta", date: "2026-02-02",
    observations: "Hotspot temperature 72°C maximum. Well below encapsulant degradation threshold.",
  },
  {
    id: "MQT11", name: "UV Preconditioning",
    clause: "MQT 11", standard_ref: "IEC 61215-2 §4.11 / IEC 60068-2-5",
    test_condition: "15 kWh/m² UV dose, λ=280–400nm, 60°C module temperature",
    equipment: "UV test chamber (Atlas SUNTEST XXL+); calibrated UV radiometer",
    criterion: "ΔPmax < 5%; no delamination or discoloration",
    preValue: "15 kWh/m² UV dose applied; λ=280-400nm; pre-test Pmax=429.5W",
    postValue: "ΔPmax=−0.2% (429.5→429.3W); No delamination; slight EVA yellowing normal",
    result: "PASS", technician: "Mr. D. Rao", date: "2026-02-05",
    observations: "UV dose verified by radiometer integration. EVA yellowing within acceptable limits (Δb*<3).",
  },
  {
    id: "MQT12", name: "Thermal Cycling (TC200)",
    clause: "MQT 12", standard_ref: "IEC 61215-2 §4.12",
    test_condition: "TC200: −40°C to +85°C, 200 cycles, 3 h/cycle (ramp+soak), RH<75%",
    equipment: "Temperature cycling chamber (Thermotron SE-600); Pt100 module sensors",
    criterion: "ΔPmax < 5% from pre-TC baseline; RISO·A ≥ 40 MΩ·m²",
    preValue: "Pre-TC200: Pmax=429.3W; RISO·A=6100 MΩ·m²",
    postValue: "ΔPmax=−0.4% (429.3→428.1W); RISO·A=5950 MΩ·m²",
    result: "PASS", technician: "Dr. A. Sharma", date: "2026-02-10",
    observations: "No solder joint failures observed. EL post-TC200 shows no new cracks. Connector integrity verified.",
  },
  {
    id: "MQT13", name: "Humidity Freeze (HF10)",
    clause: "MQT 13", standard_ref: "IEC 61215-2 §4.13",
    test_condition: "HF10: 85% RH at +85°C soak, then ramp to −40°C and hold; 10 cycles",
    equipment: "Temperature/humidity chamber (ESPEC PL-3KPH); dew point sensor",
    criterion: "ΔPmax < 5%; RISO·A ≥ 40 MΩ·m²; no delamination",
    preValue: "Pre-HF10: Pmax=428.1W; RISO·A=5950 MΩ·m²",
    postValue: "ΔPmax=−0.3% (428.1→427.8W); RISO·A=6050 MΩ·m²",
    result: "PASS", technician: "Mr. R. Verma", date: "2026-02-12",
    observations: "No delamination at frame edges. RISO improved slightly—moisture expelled during freeze cycles.",
  },
  {
    id: "MQT14", name: "Damp Heat (DH1000)",
    clause: "MQT 14", standard_ref: "IEC 61215-2 §4.14",
    test_condition: "85°C / 85% RH, 1000 hours continuous; per IEC 60068-2-78",
    equipment: "Damp heat chamber (Thermotron HB-842); calibrated RH/T logger",
    criterion: "ΔPmax < 5%; RISO·A ≥ 40 MΩ·m²; no delamination",
    preValue: "Pre-DH1000: Pmax=427.6W; RISO·A=6050 MΩ·m²",
    postValue: "ΔPmax=−1.1% (427.6→426.1W); RISO·A=5800 MΩ·m²",
    result: "PASS", technician: "Ms. K. Mehta", date: "2026-02-18",
    observations: "Largest degradation step in sequence—expected for 1000h DH. EVA cross-link density check performed (OK). PID resistance confirmed.",
  },
  {
    id: "MQT15", name: "Bypass Diode Thermal Test",
    clause: "MQT 15", standard_ref: "IEC 61215-2 §4.15 / IEC 61215-1 §10.15",
    test_condition: "1.25×Isc=16.04A applied per diode for 1h; ambient 75°C in chamber",
    equipment: "Constant-current source (EA-PSI 9200-25); thermal chamber; K-type thermocouple on each diode case",
    criterion: "T_junction ≤ T_max(diode) + 128°C; all diodes functional post-test",
    preValue: "T_junction_max=68°C (diode 2 worst case); Itest=16.04A",
    postValue: "All 3 bypass diodes functional; T_j≤68°C; no diode failure",
    result: "PASS", technician: "Mr. D. Rao", date: "2026-02-19",
    observations: "Diode temperature well below rated limit. Junction box IP68 seal intact post-test.",
  },
  {
    id: "MQT16", name: "Mechanical Load (Static)",
    clause: "MQT 16", standard_ref: "IEC 61215-2 §4.16",
    test_condition: "Static load ±5400 Pa (uniform pressure bag), 3 cycles each direction (front+rear); per IEC 61215-1 §10.16",
    equipment: "Load frame with pressure bag system; calibrated pressure gauge",
    criterion: "No cracking of glass or cells; ΔPmax < 5%; no delamination",
    preValue: "Pre-ML: Pmax=426.1W; Glass intact",
    postValue: "ΔPmax=−0.2% (426.1→425.3W); No glass breakage; No cell cracks via EL",
    result: "PASS", technician: "Dr. A. Sharma", date: "2026-02-22",
    observations: "Post-test EL imaging confirmed no new micro-cracks. Mounting hole integrity verified.",
  },
  {
    id: "MQT17", name: "Hail Test",
    clause: "MQT 17", standard_ref: "IEC 61215-2 §4.17 / IEC 61215-2 Annex E",
    test_condition: "25mm ice ball at 23 m/s (11 impact points per Annex E pattern)",
    equipment: "Hail cannon with 25mm diameter ice projectiles; high-speed camera",
    criterion: "No damage (cracking/shattering) at all 11 impact points",
    preValue: "25mm ice ball, v=23 m/s, 11 impact points per IEC 61215-2 Annex E",
    postValue: "No glass breakage; No delamination at any of 11 impact points",
    result: "PASS", technician: "Mr. R. Verma", date: "2026-02-24",
    observations: "All 11 impact points visually inspected and EL imaged. Frame corners and center tested.",
  },
  {
    id: "MQT18", name: "Robustness of Terminations",
    clause: "MQT 18", standard_ref: "IEC 61215-2 §4.18",
    test_condition: "Tensile force 40N axial; bending/twisting per IEC 61215-1 §10.18 procedure",
    equipment: "Universal tensile tester (Zwick Z010); cable grip fixtures",
    criterion: "No failures; connector/cable continuity maintained; no visible damage",
    preValue: "Tensile force 40N applied; twisting/bending per procedure on both +/− cables",
    postValue: "No cable/connector damage; continuity maintained (Ω unchanged)",
    result: "PASS", technician: "Ms. K. Mehta", date: "2026-02-25",
    observations: "MC4 connector locking mechanism intact. Overmoulding on cable entry point undamaged.",
  },
  {
    id: "MQT19", name: "Wet Leakage Current",
    clause: "MQT 19", standard_ref: "IEC 61215-2 §4.19 / IEC 61215-1 §10.14",
    test_condition: "Module surface wetted with conductive solution (0.1% NaCl); 500V DC applied frame-to-shorted-terminals",
    equipment: "Wet leakage tester (Hipot tester Megger MIT515); spray apparatus",
    criterion: "RISO × A ≥ 40 MΩ·m²; leakage current < 1 mA",
    preValue: "RISO·A=6200 MΩ·m²; Leakage current=0.08 mA",
    postValue: "RISO·A=6150 MΩ·m²; Leakage current=0.09 mA",
    result: "PASS", technician: "Mr. D. Rao", date: "2026-02-26",
    observations: "Wet surface resistance uniform across module face. Edge seal integrity confirmed.",
  },
  {
    id: "MQT20", name: "Light Soaking / Stabilization",
    clause: "MQT 20", standard_ref: "IEC 61215-2 §4.20",
    test_condition: "Light soak: 5–10 kWh/m² (Class AAA simulator); flash test after each kWh/m² increment",
    equipment: "Class AAA steady-state solar simulator; calibrated reference cell",
    criterion: "Pmax stable within ±0.5% over 3 consecutive measurements",
    preValue: "Initial Pmax=434.2W (light-soaked from production; slight LID expected)",
    postValue: "Stabilized Pmax=430.8W (−0.8% from initial; stable within ±0.5% over 3 meas.)",
    result: "PASS", technician: "Dr. A. Sharma", date: "2026-01-15",
    observations: "LID stabilization complete after ~5 kWh/m². Stabilized value used as baseline for all subsequent tests.",
  },
  {
    id: "MQT21", name: "EL Imaging (Electroluminescence)",
    clause: "MQT 21", standard_ref: "IEC 61215-2 §4.21 / IEC TS 60904-13",
    test_condition: "DC current injection at Isc; cooled CCD Si detector; dark enclosure",
    equipment: "EL Imaging System (Sensovation SIS-HR-EL); calibrated current source",
    criterion: "No new inactive cells; no crack propagation beyond defined limits",
    preValue: "Pre-test: No inactive cells; uniform luminescence across all 144 cells",
    postValue: "Post-sequence: 1 minor crack in non-critical area (<2% cell area, cell active); no inactive cells",
    result: "PASS", technician: "Ms. K. Mehta", date: "2026-03-05",
    observations: "Micro-crack in cell R4-C22 detected post mechanical load. Cell remains electrically active. Within acceptance criteria.",
  },
  {
    id: "MQT22", name: "Mechanical Stress – Bifacial Qualification",
    clause: "MQT 22", standard_ref: "IEC 61215-2 §4.22",
    test_condition: "N/A – monofacial module (no rear glass); bifacial qualification not required",
    equipment: "N/A",
    criterion: "Not applicable for monofacial module design",
    preValue: "N/A – monofacial module",
    postValue: "N/A",
    result: "N/A", technician: "Dr. A. Sharma", date: "2026-01-15",
    observations: "AC-430MH/144V is a monofacial module with opaque white composite polymer backsheet. MQT 22 not applicable.",
  },
];

export default function IEC61215Page() {
  const [mqts, setMqts] = useState(INITIAL_MQTS);
  const [activeTab, setActiveTab] = useState("cover");

  const updateMqt = (id: string, field: string, value: string) => {
    setMqts((prev) => prev.map((m) => m.id === id ? { ...m, [field]: value } : m));
  };

  const passCount = mqts.filter((m) => m.result === "PASS").length;
  const naCount = mqts.filter((m) => m.result === "N/A").length;
  const failCount = mqts.filter((m) => m.result === "FAIL").length;
  const overallPass = failCount === 0;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-container { box-shadow: none !important; max-width: 100% !important; }
          .page-break { break-before: page; padding-top: 8mm; }
          @page { size: A4 portrait; margin: 12mm 15mm; }
          thead { display: table-header-group; }
          [role="tablist"] { display: none !important; }
          [role="tabpanel"] { display: block !important; }
        }
        .mqt-card { border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 14px; overflow: hidden; }
        .mqt-card-header { padding: 8px 12px; display: flex; align-items: center; gap: 10px; }
        .mqt-card-body { padding: 12px; font-size: 8.5pt; }
        .mqt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mqt-field label { display: block; font-size: 7.5pt; color: #64748b; margin-bottom: 2px; }
        .mqt-field input { width: 100%; border: 1px solid #cbd5e1; border-radius: 3px; padding: 3px 6px; font-size: 8pt; }
        .toc-item { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #e2e8f0; font-size: 9pt; cursor: pointer; }
        .toc-item:hover { color: #1e3a5f; }
      `}</style>

      {/* Top Bar */}
      <div className="no-print sticky top-0 z-50 flex items-center justify-between mb-3 p-3 bg-slate-50 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-800">IEC 61215:2021 Design Qualification Test Report</h1>
          <p className="text-xs text-slate-500">Axitec AC-430MH/144V · All 22 MQTs · SolarLabX NABL TC-8192</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            PDF
          </button>
          <button onClick={() => {}} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Word
          </button>
          <button onClick={() => {}} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Excel
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      <div className="report-container max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="no-print flex flex-wrap h-auto gap-1 p-2 bg-slate-100 border-b rounded-none">
            {[
              ["cover", "Cover & TOC"],
              ["module", "Module Description"],
              ["sequence", "Test Sequence"],
              ["perf", "Performance (MQT 01-08)"],
              ["env", "Environmental (MQT 09-14)"],
              ["mech", "Mechanical (MQT 15-22)"],
              ["comparison", "Pre/Post Comparison"],
              ["summary", "Summary & Conclusion"],
              ["annexures", "Annexures"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="text-xs px-3 py-1.5 data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ══════════════════════ TAB: COVER ══════════════════════ */}
          <TabsContent value="cover" className="p-0">
            <div style={{ padding: "14mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              {/* Header bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `4px solid ${ACCENT}`, paddingBottom: "12px", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "22pt", fontWeight: "900", color: ACCENT, letterSpacing: "-0.5px" }}>SolarLabX</div>
                  <div style={{ fontSize: "8.5pt", color: "#64748b", marginTop: "2px" }}>Solar PV Lab Operations Suite · PV Testing Division</div>
                  <div style={{ fontSize: "8pt", color: "#64748b" }}>Plot 12-B, MIDC Bhosari, Pune 411026, Maharashtra, India</div>
                  <div style={{ fontSize: "8pt", color: "#64748b" }}>Tel: +91-20-2712-4400 · Email: pvlab@solarlabx.com</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ background: "#fbbf24", color: "#1a1a1a", padding: "4px 10px", borderRadius: "4px", fontSize: "8pt", fontWeight: "700", marginBottom: "4px" }}>NABL TC-8192</div>
                  <div style={{ fontSize: "7.5pt", color: "#64748b" }}>ISO/IEC 17025:2017 Accredited</div>
                  <div style={{ fontSize: "7.5pt", color: "#64748b" }}>Validity: 2024-11-01 to 2026-10-31</div>
                </div>
              </div>

              {/* Title block */}
              <div style={{ background: ACCENT, color: "white", padding: "20px 24px", borderRadius: "6px", marginBottom: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "9pt", fontWeight: "600", opacity: 0.8, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "2px" }}>Test Report</div>
                <div style={{ fontSize: "18pt", fontWeight: "900", marginBottom: "6px", lineHeight: 1.2 }}>Design Qualification & Type Approval</div>
                <div style={{ fontSize: "10pt", opacity: 0.85, marginBottom: "6px" }}>IEC 61215-1:2021 · IEC 61215-2:2021</div>
                <div style={{ fontSize: "8.5pt", opacity: 0.75 }}>Terrestrial Photovoltaic (PV) Modules – Design Qualification and Type Approval</div>
                <div style={{ fontSize: "8.5pt", opacity: 0.75 }}>Crystalline Silicon Photovoltaic (PV) Modules</div>
              </div>

              {/* Info tables */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px", fontSize: "8.5pt" }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ background: "#f1f5f9", padding: "6px 10px", fontWeight: "700", fontSize: "8pt", borderBottom: "1px solid #e2e8f0", color: ACCENT }}>CLIENT INFORMATION</div>
                  {[
                    ["Customer", "Axitec Energy GmbH & Co. KG"],
                    ["Address", "Steinbeisstr. 5, 68723 Schwetzingen, Germany"],
                    ["Contact", "Dr. Klaus Weber, Quality Manager"],
                    ["Email", "k.weber@axitec-energy.eu"],
                    ["PO Number", "AX-2026-PV-0042"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "4px 10px" }}>
                      <span style={{ color: "#64748b", minWidth: "80px" }}>{k}</span>
                      <span style={{ fontWeight: "500" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ background: "#f1f5f9", padding: "6px 10px", fontWeight: "700", fontSize: "8pt", borderBottom: "1px solid #e2e8f0", color: ACCENT }}>REPORT DETAILS</div>
                  {[
                    ["Report No.", REPORT_NO],
                    ["Issue Date", "2026-03-14"],
                    ["Test Period", "2026-01-15 to 2026-03-05"],
                    ["No. of Samples", "3 modules (S/N: AX430-2025-001/002/003)"],
                    ["Overall Result", overallPass ? "PASS" : "FAIL"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "4px 10px" }}>
                      <span style={{ color: "#64748b", minWidth: "80px" }}>{k}</span>
                      <span style={{ fontWeight: k === "Overall Result" ? "800" : "500", color: k === "Overall Result" ? "#16a34a" : "inherit" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: "5px", padding: "12px", marginBottom: "16px" }}>
                <div style={{ fontWeight: "700", fontSize: "8.5pt", color: ACCENT, marginBottom: "10px" }}>AUTHORIZATION & SIGNATURES</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", fontSize: "8pt" }}>
                  {[
                    { role: "Prepared By", name: "Dr. A. Sharma", title: "Senior Lab Technician", date: "2026-03-10" },
                    { role: "Checked By", name: "Mr. R. Verma", title: "Sr. PV Test Engineer", date: "2026-03-12" },
                    { role: "Authorized By", name: "Prof. G. Krishnan", title: "Technical Manager", date: "2026-03-13" },
                    { role: "Issued By", name: "Ms. P. Nair", title: "Quality Manager", date: "2026-03-14" },
                  ].map((s) => (
                    <div key={s.role} style={{ textAlign: "center" }}>
                      <div style={{ height: "24px", borderBottom: "1px solid #94a3b8", marginBottom: "4px" }}></div>
                      <div style={{ fontWeight: "700" }}>{s.name}</div>
                      <div style={{ color: "#64748b" }}>{s.title}</div>
                      <div style={{ color: ACCENT, fontWeight: "600", marginTop: "2px" }}>{s.role}</div>
                      <div style={{ color: "#94a3b8", fontSize: "7pt" }}>{s.date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "4px", padding: "10px 12px", fontSize: "7.5pt", color: "#78350f", marginBottom: "14px" }}>
                <strong>DISCLAIMER:</strong> This test report relates only to the items tested. The results contained herein shall not be reproduced except in full without the written permission of SolarLabX. This report is issued under the accreditation of NABL (TC-8192) for tests within the scope of accreditation. Tests outside NABL scope are marked accordingly.
              </div>
              <div style={{ background: "#f0f9ff", border: "1px solid #7dd3fc", borderRadius: "4px", padding: "8px 12px", fontSize: "7.5pt", color: "#0c4a6e", marginBottom: "16px" }}>
                <strong>CONFIDENTIALITY:</strong> This document is confidential and intended solely for the use of Axitec Energy GmbH & Co. KG. Unauthorized disclosure, copying, or distribution is prohibited. Classification: CONFIDENTIAL — COMMERCIAL.
              </div>

              {/* TOC */}
              <SH title="TABLE OF CONTENTS" accent={ACCENT} />
              <div style={{ fontSize: "9pt" }}>
                {[
                  ["1", "Cover Page, Disclaimer & Table of Contents", "1"],
                  ["2", "Module Description & Test Samples", "2"],
                  ["3", "Test Sequence Diagram (Sequences A, B, C, D)", "3"],
                  ["4", "Performance Tests – MQT 01 to MQT 08", "4"],
                  ["5", "Environmental Tests – MQT 09 to MQT 14", "6"],
                  ["6", "Mechanical & Other Tests – MQT 15 to MQT 22", "8"],
                  ["7", "Pre/Post Comparison Tables & Charts", "10"],
                  ["8", "Summary, Pass/Fail Table & Conclusion", "11"],
                  ["9", "Annexures: Equipment List, Calibration & Environmental Log", "12"],
                ].map(([n, title, pg]) => (
                  <div key={n} className="toc-item" onClick={() => {
                    const tabMap = {"1":"cover","2":"module","3":"sequence","4":"perf","5":"env","6":"mech","7":"comparison","8":"summary","9":"annexures"};
                    setActiveTab(tabMap[n] || "cover");
                  }}>
                    <span><strong>{n}.</strong> {title}</span>
                    <span style={{ color: "#94a3b8" }}>pg. {pg}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: MODULE ══════════════════════ */}
          <TabsContent value="module" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9pt", color: "#1a1a1a" }}>
              <SH title="2. MODULE DESCRIPTION & TEST SAMPLES" accent={ACCENT} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ background: ACCENT, color: "white", padding: "6px 10px", fontWeight: "700", fontSize: "8.5pt" }}>ELECTRICAL PARAMETERS (STC)</div>
                  {[
                    ["Manufacturer", "Axitec Energy GmbH & Co. KG"],
                    ["Model", "AC-430MH/144V"],
                    ["Technology", "Monocrystalline PERC, Half-cut"],
                    ["Rated Pmax", "430 Wp"],
                    ["Voc", "43.2 V"],
                    ["Isc", "12.83 A"],
                    ["Vmpp", "35.3 V"],
                    ["Impp", "12.19 A"],
                    ["Fill Factor", "0.777 (77.7%)"],
                    ["Max System Voltage", "1500 V DC"],
                    ["Operating Temp.", "−40°C to +85°C"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "4px 10px", fontSize: "8.5pt" }}>
                      <span style={{ color: "#64748b", minWidth: "110px" }}>{k}</span>
                      <span style={{ fontWeight: "600" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ background: ACCENT, color: "white", padding: "6px 10px", fontWeight: "700", fontSize: "8.5pt" }}>CONSTRUCTION & MATERIALS</div>
                  {[
                    ["Cell Type", "144 (2×72) half-cut mono PERC"],
                    ["Cell Dimensions", "~182 × 91 mm (M10 half-cut)"],
                    ["Module Dimensions", "2108 × 1048 × 35 mm"],
                    ["Weight", "22.3 kg"],
                    ["Glass", "3.2mm ARC low-iron tempered"],
                    ["Frame", "Anodized Al alloy 6005-T5"],
                    ["Backsheet", "White composite polymer (TPT)"],
                    ["Encapsulant", "EVA (cross-linked, UV-stable)"],
                    ["Junction Box", "IP68 rated, 3 bypass diodes"],
                    ["Connectors", "MC4-compatible (Stäubli)"],
                    ["Cable", "4 mm² PV1-F, length: 1200 mm"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", borderBottom: "1px solid #f1f5f9", padding: "4px 10px", fontSize: "8.5pt" }}>
                      <span style={{ color: "#64748b", minWidth: "110px" }}>{k}</span>
                      <span style={{ fontWeight: "600" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Samples table */}
              <SH title="TEST SAMPLE DETAILS" accent={ACCENT} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                <thead>
                  <tr style={{ background: ACCENT, color: "white" }}>
                    {["Sample No.", "Serial Number", "Date of Receipt", "Condition at Receipt", "Assigned Tests", "Remarks"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontWeight: "600" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["S-01", "AX430-2025-001", "2026-01-13", "Good – no visible damage", "Seq A: MQT01,02,03,04,05,06,07,08,20", "Primary sample for all characterization"],
                    ["S-02", "AX430-2025-002", "2026-01-13", "Good – no visible damage", "Seq B: MQT01,09,10,11,12,13,14,01", "Environmental durability sequence"],
                    ["S-03", "AX430-2025-003", "2026-01-13", "Good – no visible damage", "Seq C: MQT01,15,16,17,18,19,01", "Mechanical & robustness sequence"],
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      {row.map((cell, j) => <td key={j} style={{ padding: "5px 10px" }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Temperature coefficient table */}
              <SH title="TEMPERATURE COEFFICIENTS (MQT 04 RESULTS)" accent={ACCENT} />
              <table style={{ width: "60%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                <thead>
                  <tr style={{ background: "#334155", color: "white" }}>
                    {["Parameter", "Symbol", "Value (%/°C)", "Manufacturer Stated"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Current at MPP (Isc)", "α", "+0.049", "+0.049"],
                    ["Voltage at MPP (Voc)", "β", "−0.282", "−0.280"],
                    ["Power at MPP (Pmax)", "δ", "−0.362", "−0.360"],
                  ].map(([p, s, v, m], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "5px 10px" }}>{p}</td>
                      <td style={{ padding: "5px 10px", fontFamily: "monospace", fontWeight: "700" }}>{s}</td>
                      <td style={{ padding: "5px 10px", color: "#1e3a5f", fontWeight: "700" }}>{v}</td>
                      <td style={{ padding: "5px 10px", color: "#64748b" }}>{m}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: SEQUENCE ══════════════════════ */}
          <TabsContent value="sequence" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              <SH title="3. TEST SEQUENCE DIAGRAM – IEC 61215-2:2021" accent={ACCENT} />
              <p style={{ fontSize: "8.5pt", color: "#64748b", marginBottom: "16px" }}>
                Testing is conducted following the multi-sequence approach per IEC 61215-2:2021. Three samples are allocated across Sequences A, B, and C.
              </p>
              <TestSequenceDiagram accent={ACCENT} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "20px", fontSize: "8pt" }}>
                {[
                  { seq: "Sequence A", sample: "S-01", tests: "MQT 01 → MQT 20 → MQT 02 → MQT 03 → MQT 04 → MQT 05 → MQT 06 → MQT 07 → MQT 08 → MQT 01", desc: "Characterization & performance baseline" },
                  { seq: "Sequence B", sample: "S-02", tests: "MQT 01 → MQT 09 → MQT 11 → MQT 12 → MQT 13 → MQT 10 → MQT 14 → MQT 15 → MQT 01 → MQT 02", desc: "Environmental durability & degradation" },
                  { seq: "Sequence C", sample: "S-03", tests: "MQT 01 → MQT 16 → MQT 17 → MQT 18 → MQT 19 → MQT 21 → MQT 01 → MQT 02", desc: "Mechanical, hail, robustness, EL imaging" },
                ].map((s) => (
                  <div key={s.seq} style={{ border: "1px solid #e2e8f0", borderRadius: "5px", padding: "10px" }}>
                    <div style={{ fontWeight: "700", color: ACCENT, marginBottom: "4px" }}>{s.seq}</div>
                    <div style={{ color: "#475569", marginBottom: "4px" }}>Sample: <strong>{s.sample}</strong></div>
                    <div style={{ color: "#64748b", lineHeight: "1.6" }}>{s.tests}</div>
                    <div style={{ color: "#94a3b8", marginTop: "6px", fontStyle: "italic" }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: PERFORMANCE ══════════════════════ */}
          <TabsContent value="perf" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              <SH title="4. PERFORMANCE TESTS – MQT 01 to MQT 08" accent={ACCENT} />
              {mqts.filter((_, i) => i < 8).map((m) => (
                <MqtCard key={m.id} mqt={m} accent={ACCENT} onUpdate={updateMqt} />
              ))}
              {/* IV Curve chart */}
              <SH title="IV / PV CURVES – MQT 02 (STC) & MQT 07 (NMOT)" accent={ACCENT} />
              <p style={{ fontSize: "8pt", color: "#64748b", marginBottom: "10px" }}>Measured I-V and P-V curves at STC (1000 W/m², 25°C) and NMOT (800 W/m², 44.2°C).</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "8.5pt", fontWeight: "700", color: ACCENT, marginBottom: "6px" }}>I-V Curve (Current vs. Voltage)</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="v" type="number" domain={[0, 44]} label={{ value: "Voltage (V)", position: "insideBottom", offset: -2, fontSize: 9 }} tick={{ fontSize: 8 }} />
                      <YAxis domain={[0, 14]} label={{ value: "Current (A)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 8 }} />
                      <Tooltip formatter={(v, n) => [v.toFixed(2), n === "i_stc" ? "I_STC (A)" : "I_NMOT (A)"]} labelFormatter={(l) => `V = ${l}V`} />
                      <Legend wrapperStyle={{ fontSize: "8pt" }} />
                      <Line data={ivDataSTC} type="monotone" dataKey="i" name="I_STC" stroke={ACCENT} strokeWidth={2} dot={false} />
                      <Line data={ivDataNMOT} type="monotone" dataKey="i" name="I_NMOT" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div style={{ fontSize: "8.5pt", fontWeight: "700", color: ACCENT, marginBottom: "6px" }}>P-V Curve (Power vs. Voltage)</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="v" type="number" domain={[0, 44]} label={{ value: "Voltage (V)", position: "insideBottom", offset: -2, fontSize: 9 }} tick={{ fontSize: 8 }} />
                      <YAxis domain={[0, 450]} label={{ value: "Power (W)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 8 }} />
                      <Tooltip formatter={(v, n) => [v.toFixed(1) + " W", n]} labelFormatter={(l) => `V = ${l}V`} />
                      <Legend wrapperStyle={{ fontSize: "8pt" }} />
                      <Line data={ivDataSTC} type="monotone" dataKey="p" name="P_STC" stroke={ACCENT} strokeWidth={2} dot={false} />
                      <Line data={ivDataNMOT} type="monotone" dataKey="p" name="P_NMOT" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: ENVIRONMENTAL ══════════════════════ */}
          <TabsContent value="env" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              <SH title="5. ENVIRONMENTAL DURABILITY TESTS – MQT 09 to MQT 14" accent={ACCENT} />
              {mqts.filter((_, i) => i >= 8 && i < 14).map((m) => (
                <MqtCard key={m.id} mqt={m} accent={ACCENT} onUpdate={updateMqt} />
              ))}
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: MECHANICAL ══════════════════════ */}
          <TabsContent value="mech" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              <SH title="6. MECHANICAL & OTHER TESTS – MQT 15 to MQT 22" accent={ACCENT} />
              {mqts.filter((_, i) => i >= 14).map((m) => (
                <MqtCard key={m.id} mqt={m} accent={ACCENT} onUpdate={updateMqt} />
              ))}
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: COMPARISON ══════════════════════ */}
          <TabsContent value="comparison" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              <SH title="7. PRE/POST COMPARISON – POWER DEGRADATION ACROSS TEST SEQUENCE" accent={ACCENT} />
              <p style={{ fontSize: "8.5pt", color: "#64748b", marginBottom: "14px" }}>
                The table and chart below track cumulative Pmax degradation (from stabilized baseline of 430.8 W) across the test sequence on Sample S-02 (Sequence B).
              </p>
              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "20px" }}>
                <thead>
                  <tr style={{ background: ACCENT, color: "white" }}>
                    {["Test Stage", "Pmax (W)", "ΔPmax (%)", "RISO·A (MΩ·m²)", "Visual", "Status"].map(h => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Initial (Stabilized)", 430.8, 0.00, 6200, "No defects", "PASS"],
                    ["After MQT 09 (Outdoor)", 429.5, -0.30, 6180, "No defects", "PASS"],
                    ["After MQT 11 (UV)", 429.3, -0.35, 6150, "Slight EVA yellow", "PASS"],
                    ["After MQT 12 (TC200)", 428.1, -0.63, 5950, "No defects", "PASS"],
                    ["After MQT 13 (HF10)", 427.8, -0.70, 6050, "No defects", "PASS"],
                    ["After MQT 10 (Hotspot)", 427.6, -0.74, 6020, "No new defects", "PASS"],
                    ["After MQT 14 (DH1000)", 426.1, -1.09, 5800, "Minor frame discolor.", "PASS"],
                    ["After MQT 16 (Mech. Load)", 425.3, -1.27, 5780, "No glass damage", "PASS"],
                    ["Final MQT 06 (STC Flash)", 429.2, -0.37, "—", "No defects", "PASS"],
                  ].map(([stage, pmax, delta, riso, vis, stat], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "5px 10px", fontWeight: "600" }}>{stage}</td>
                      <td style={{ padding: "5px 10px", fontFamily: "monospace" }}>{pmax}</td>
                      <td style={{ padding: "5px 10px", fontFamily: "monospace", color: parseFloat(String(delta)) < -2 ? "#dc2626" : "#16a34a" }}>{delta}</td>
                      <td style={{ padding: "5px 10px", fontFamily: "monospace" }}>{riso}</td>
                      <td style={{ padding: "5px 10px" }}>{vis}</td>
                      <td style={{ padding: "5px 10px" }}><PassBadge pass={stat === "PASS"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bar chart */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "8.5pt", fontWeight: "700", color: ACCENT, marginBottom: "8px" }}>Pmax Degradation % Across Test Sequence</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={prePostData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="test" tick={{ fontSize: 7.5 }} angle={-35} textAnchor="end" />
                      <YAxis domain={[-1.5, 0.1]} tick={{ fontSize: 8 }} label={{ value: "ΔPmax (%)", angle: -90, position: "insideLeft", fontSize: 8 }} />
                      <Tooltip formatter={(v) => [v.toFixed(2) + "%", "ΔPmax"]} />
                      <Bar dataKey="delta" name="ΔPmax (%)">
                        {prePostData.map((_, idx) => (
                          <Cell key={idx} fill={prePostData[idx].delta < -1.0 ? "#f59e0b" : ACCENT} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div style={{ fontSize: "8.5pt", fontWeight: "700", color: ACCENT, marginBottom: "8px" }}>Absolute Pmax (W) Across Test Sequence</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={prePostData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="test" tick={{ fontSize: 7.5 }} angle={-35} textAnchor="end" />
                      <YAxis domain={[420, 435]} tick={{ fontSize: 8 }} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 8 }} />
                      <Tooltip formatter={(v) => [v.toFixed(1) + " W", "Pmax"]} />
                      <Bar dataKey="pmax" fill="#16a34a" name="Pmax (W)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: SUMMARY ══════════════════════ */}
          <TabsContent value="summary" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              <SH title="8. PASS/FAIL SUMMARY – ALL 22 MQTs" accent={ACCENT} />

              {/* Summary badges */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                {[
                  { label: "Total MQTs", count: 22, bg: "#f1f5f9", text: "#1e293b" },
                  { label: "PASS", count: passCount, bg: "#dcfce7", text: "#16a34a" },
                  { label: "FAIL", count: failCount, bg: "#fee2e2", text: "#dc2626" },
                  { label: "N/A", count: naCount, bg: "#fef9c3", text: "#854d0e" },
                  { label: "Overall", count: overallPass ? "PASS" : "FAIL", bg: overallPass ? "#dcfce7" : "#fee2e2", text: overallPass ? "#16a34a" : "#dc2626" },
                ].map((b) => (
                  <div key={b.label} style={{ flex: 1, textAlign: "center", padding: "10px", background: b.bg, borderRadius: "6px", border: `1px solid ${b.text}20` }}>
                    <div style={{ fontSize: "18pt", fontWeight: "900", color: b.text }}>{b.count}</div>
                    <div style={{ fontSize: "8pt", color: "#64748b" }}>{b.label}</div>
                  </div>
                ))}
              </div>

              {/* Full summary table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
                <thead>
                  <tr style={{ background: ACCENT, color: "white" }}>
                    {["MQT ID", "Test Name", "Standard Ref.", "Criterion", "Pre-Test Value", "Post-Test Value", "Technician", "Date", "Result"].map(h => (
                      <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mqts.map((m, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "4px 8px", fontFamily: "monospace", fontWeight: "700", fontSize: "7.5pt", color: ACCENT }}>{m.id}</td>
                      <td style={{ padding: "4px 8px", fontWeight: "600" }}>{m.name}</td>
                      <td style={{ padding: "4px 8px", fontSize: "7pt", color: "#64748b" }}>{m.standard_ref}</td>
                      <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{m.criterion}</td>
                      <td style={{ padding: "4px 8px", fontSize: "7pt", color: "#334155" }}>{m.preValue}</td>
                      <td style={{ padding: "4px 8px", fontSize: "7pt", color: "#334155" }}>{m.postValue}</td>
                      <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{m.technician}</td>
                      <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{m.date}</td>
                      <td style={{ padding: "4px 8px" }}>
                        {m.result === "N/A"
                          ? <span style={{ background: "#fef9c3", color: "#854d0e", padding: "1px 7px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600" }}>N/A</span>
                          : <PassBadge pass={m.result === "PASS"} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* I-V Curve Comparison */}
              <div className="page-break">
                <SH title="I-V CURVE COMPARISON (PRE vs POST TEST SEQUENCE)" accent={ACCENT} />
                <IVCurveComparisonChart
                  preParams={{ voc: 43.24, isc: 12.85, vmp: 35.31, imp: 12.20, pmax: 430.8, ff: 0.7786 }}
                  postParams={{ voc: 43.10, isc: 12.80, vmp: 35.15, imp: 12.15, pmax: 429.2, ff: 0.7770 }}
                  title="IEC 61215 Full Sequence – I-V Curve Overlay"
                  height={300}
                />
              </div>

              {/* Summary Charts */}
              <div className="page-break">
                <SH title="SUMMARY ANALYSIS CHARTS" accent={ACCENT} />
                <div style={{ marginBottom: "16px" }}>
                  <PmaxStabilizationChart
                    data={DEFAULT_STABILIZATION_DATA}
                    sampleIds={DEFAULT_SAMPLE_IDS}
                    ratedPmax={430}
                    height={250}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px" }}>
                  <InsulationResistanceChart
                    data={DEFAULT_INSULATION_DATA}
                    sampleIds={DEFAULT_SAMPLE_IDS}
                    height={220}
                  />
                  <PowerDegradationChart
                    data={DEFAULT_DEGRADATION_DATA}
                    sampleIds={DEFAULT_SAMPLE_IDS}
                    height={220}
                  />
                </div>
              </div>

              {/* Conclusion */}
              <SH title="CONCLUSION & CERTIFICATION STATEMENT" accent={ACCENT} />
              <div style={{ border: `2px solid ${overallPass ? "#16a34a" : "#dc2626"}`, borderRadius: "6px", padding: "14px 16px", background: overallPass ? "#f0fdf4" : "#fef2f2", marginBottom: "16px" }}>
                <div style={{ fontSize: "12pt", fontWeight: "900", color: overallPass ? "#16a34a" : "#dc2626", marginBottom: "8px" }}>
                  OVERALL QUALIFICATION RESULT: {overallPass ? "PASS" : "FAIL"}
                </div>
                <p style={{ fontSize: "9pt", lineHeight: "1.6", color: "#334155" }}>
                  Based on the testing conducted at SolarLabX PV Testing Division (NABL TC-8192) in accordance with IEC 61215-1:2021 and IEC 61215-2:2021, the photovoltaic module model <strong>Axitec AC-430MH/144V</strong> has been subjected to all applicable Module Qualification Tests (MQT 01 through MQT 22). The module has successfully demonstrated compliance with all applicable test criteria. The maximum cumulative power degradation observed was <strong>−1.27% (ΔPmax)</strong> after the full test sequence, which is well within the IEC 61215-1:2021 acceptance limit of <strong>−5%</strong>. Insulation resistance maintained above 40 MΩ·m² throughout. No critical defects (glass breakage, delamination, inactive cells, bypass diode failure) were observed.
                </p>
                <p style={{ fontSize: "9pt", lineHeight: "1.6", color: "#334155", marginTop: "8px" }}>
                  This qualification report confirms that the module design meets the requirements for terrestrial photovoltaic operation as specified in IEC 61215:2021. The report is issued under NABL accreditation scope TC-8192.
                </p>
              </div>
              <UncertaintySection accent={ACCENT} />
              <SignatureBlock accent={ACCENT} reportNo={REPORT_NO} />
            </div>
          </TabsContent>

          {/* ══════════════════════ TAB: ANNEXURES ══════════════════════ */}
          <TabsContent value="annexures" className="p-0">
            <div style={{ padding: "12mm 18mm", fontFamily: "'Calibri','Arial',sans-serif", color: "#1a1a1a" }}>
              <SH title="9. ANNEXURES" accent={ACCENT} />

              {/* Equipment list */}
              <SH title="ANNEXURE A – EQUIPMENT & INSTRUMENT LIST" accent={ACCENT} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "18px" }}>
                <thead>
                  <tr style={{ background: ACCENT, color: "white" }}>
                    {["Equip. ID", "Description", "Make / Model", "Serial No.", "Cal. Due Date", "Cal. Status"].map(h => (
                      <th key={h} style={{ padding: "5px 8px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["SLX-SS-01", "Pulsed Solar Simulator (Class AAA)", "Sinton Instruments SS200", "SS200-2023-087", "2026-07-31", "VALID"],
                    ["SLX-SS-02", "Steady-State Solar Simulator", "Spire 4600SLP", "4600-2022-041", "2026-05-30", "VALID"],
                    ["SLX-CH-01", "TC Chamber (−40 to +150°C)", "Thermotron SE-600", "SE600-2021-012", "2026-08-31", "VALID"],
                    ["SLX-CH-02", "Damp Heat Chamber (85°C/85%RH)", "Thermotron HB-842", "HB842-2021-008", "2026-08-31", "VALID"],
                    ["SLX-CH-03", "T/H Cycling Chamber (ESPEC)", "ESPEC PL-3KPH", "PL3K-2022-019", "2026-09-30", "VALID"],
                    ["SLX-UV-01", "UV Weathering Chamber", "Atlas SUNTEST XXL+", "STX-2020-034", "2026-06-30", "VALID"],
                    ["SLX-IR-01", "IR Thermal Camera", "FLIR A700", "A700-2023-155", "2026-11-30", "VALID"],
                    ["SLX-EL-01", "EL Imaging System", "Sensovation SIS-HR-EL", "SIS-2022-007", "2026-10-31", "VALID"],
                    ["SLX-INS-01", "Insulation Resistance Tester", "Kyoritsu KEW 3128", "3128-2024-201", "2026-12-31", "VALID"],
                    ["SLX-PY-01", "Pyranometer (Kipp & Zonen)", "CMP22 with CVF4", "CMP22-2021-033", "2026-07-15", "VALID"],
                    ["SLX-RC-01", "Reference Solar Cell", "Fraunhofer ISE", "ISE-2023-RC-012", "2026-06-30", "VALID"],
                    ["SLX-HL-01", "Hail Impact Cannon", "In-house design SLX-HC-2019", "HC-2019-001", "2026-04-30", "VALID"],
                    ["SLX-LF-01", "Load Frame (±6000 Pa)", "In-house with calibrated P transducer", "LF-2020-001", "2026-05-31", "VALID"],
                    ["SLX-TT-01", "Universal Tensile Tester", "Zwick Z010", "Z010-2018-044", "2026-09-15", "VALID"],
                    ["SLX-T-01", "Pt100 Module Sensors (×4)", "Omega PR-10", "Various – batch 2024", "2026-12-31", "VALID"],
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "4px 8px", color: j === 5 ? "#16a34a" : "inherit", fontWeight: j === 5 ? "700" : "400" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Environmental log */}
              <SH title="ANNEXURE B – ENVIRONMENTAL CONDITIONS LOG (SELECTED)" accent={ACCENT} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "18px" }}>
                <thead>
                  <tr style={{ background: "#334155", color: "white" }}>
                    {["Date", "Test Area", "Ambient Temp. (°C)", "RH (%)", "Barometric P. (hPa)", "Technician"].map(h => (
                      <th key={h} style={{ padding: "5px 8px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["2026-01-15", "Flash Test Lab", "23.1±0.5", "48±3", "1013", "Dr. A. Sharma"],
                    ["2026-01-28", "Outdoor Test Area", "21.8±1.0", "55±5", "1011", "Dr. A. Sharma"],
                    ["2026-02-02", "Simulator Lab", "24.2±0.5", "47±3", "1012", "Ms. K. Mehta"],
                    ["2026-02-10", "Chamber Room", "22.5±0.5", "50±3", "1013", "Dr. A. Sharma"],
                    ["2026-02-18", "Chamber Room", "22.8±0.5", "51±3", "1012", "Ms. K. Mehta"],
                    ["2026-03-05", "Flash Test Lab", "23.5±0.5", "49±3", "1013", "Dr. A. Sharma"],
                  ].map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      {row.map((cell, j) => <td key={j} style={{ padding: "4px 8px" }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Referenced standards */}
              <SH title="ANNEXURE C – REFERENCED STANDARDS & DOCUMENTS" accent={ACCENT} />
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                <thead>
                  <tr style={{ background: "#334155", color: "white" }}>
                    {["Standard", "Title", "Edition", "Applicability"].map(h => (
                      <th key={h} style={{ padding: "5px 8px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["IEC 61215-1:2021", "Terrestrial PV modules – Design qualification – Part 1: Test requirements", "Ed. 3", "All tests"],
                    ["IEC 61215-2:2021", "Terrestrial PV modules – Design qualification – Part 2: Test procedures", "Ed. 3", "All procedures"],
                    ["IEC 60904-1:2020", "PV devices – Measurement of I-V characteristics", "Ed. 3", "MQT 02, 06, 07, 08"],
                    ["IEC 60904-3:2019", "PV devices – AM1.5G reference spectrum", "Ed. 4", "STC definition"],
                    ["IEC 60904-5:2011", "PV devices – NOCT determination", "Ed. 2", "MQT 05"],
                    ["IEC 60891:2021", "PV devices – Translation procedures", "Ed. 3", "MQT 04"],
                    ["IEC 60068-2-78:2012", "Environmental testing – Damp heat", "Ed. 3", "MQT 14"],
                    ["IEC 61215-2:2021 Annex E", "Hail impact test procedure", "Ed. 3", "MQT 17"],
                    ["IEC TS 60904-13:2018", "EL imaging of PV modules", "Ed. 1", "MQT 21"],
                    ["ISO/IEC 17025:2017", "General requirements for testing and calibration laboratories", "Ed. 3", "Lab quality system"],
                    ["JCGM 100:2008 (GUM)", "Guide to the Expression of Uncertainty in Measurement", "Ed. 1", "All uncertainty"],
                  ].map(([std, title, ed, app], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "4px 8px", fontFamily: "monospace", color: ACCENT, fontWeight: "600", fontSize: "7.5pt" }}>{std}</td>
                      <td style={{ padding: "4px 8px" }}>{title}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>{ed}</td>
                      <td style={{ padding: "4px 8px", color: "#64748b" }}>{app}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: "16px", fontSize: "8pt", color: "#94a3b8", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                {REPORT_NO} · Issue 1 · Page 12 of 12 · SolarLabX PV Testing Division, Pune · NABL TC-8192 · 2026-03-14
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

/* ─── Shared helper components ─── */

function SH({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{
      fontSize: "10.5pt", fontWeight: "800", color: accent,
      borderBottom: `2.5px solid ${accent}`, paddingBottom: "5px",
      marginBottom: "12px", marginTop: "18px",
    }}>
      {title}
    </div>
  );
}

function PassBadge({ pass }: { pass: boolean }) {
  return (
    <span style={{
      background: pass ? "#16a34a" : "#dc2626",
      color: "white", padding: "2px 9px",
      borderRadius: "3px", fontSize: "7.5pt", fontWeight: "700",
    }}>
      {pass ? "PASS" : "FAIL"}
    </span>
  );
}

function MqtCard({ mqt, accent, onUpdate }: { mqt: any; accent: string; onUpdate: (id: string, field: string, val: string) => void }) {
  const isNA = mqt.result === "N/A";
  const isPass = mqt.result === "PASS";
  const borderColor = isNA ? "#fbbf24" : isPass ? "#16a34a" : "#dc2626";
  const headerBg = isNA ? "#fef9c3" : isPass ? "#f0fdf4" : "#fef2f2";

  return (
    <div className="mqt-card" style={{ borderColor, borderLeft: `4px solid ${borderColor}` }}>
      <div className="mqt-card-header" style={{ background: headerBg }}>
        <span style={{
          background: accent, color: "white", padding: "3px 10px",
          borderRadius: "4px", fontSize: "8pt", fontWeight: "800", fontFamily: "monospace",
        }}>
          {mqt.id}
        </span>
        <span style={{ fontWeight: "700", fontSize: "9.5pt", flex: 1 }}>{mqt.name}</span>
        <span style={{ fontSize: "7.5pt", color: "#64748b", marginRight: "8px" }}>{mqt.standard_ref}</span>
        {isNA
          ? <span style={{ background: "#fbbf24", color: "#78350f", padding: "2px 9px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "700" }}>N/A</span>
          : <PassBadge pass={isPass} />}
      </div>
      <div className="mqt-card-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "7.5pt", color: "#64748b", marginBottom: "2px", fontWeight: "600" }}>Test Conditions</div>
            <div style={{ fontSize: "8pt", color: "#334155", lineHeight: "1.5" }}>{mqt.test_condition}</div>
          </div>
          <div>
            <div style={{ fontSize: "7.5pt", color: "#64748b", marginBottom: "2px", fontWeight: "600" }}>Equipment Used</div>
            <div style={{ fontSize: "8pt", color: "#334155", lineHeight: "1.5" }}>{mqt.equipment}</div>
          </div>
          <div>
            <div style={{ fontSize: "7.5pt", color: "#64748b", marginBottom: "2px", fontWeight: "600" }}>Acceptance Criterion</div>
            <div style={{ fontSize: "8pt", color: "#334155", fontWeight: "600", lineHeight: "1.5" }}>{mqt.criterion}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
          <div className="mqt-field">
            <label>Pre-Test / Measured Value</label>
            <input
              type="text"
              value={mqt.preValue}
              onChange={(e) => onUpdate(mqt.id, "preValue", e.target.value)}
              style={{ background: "#f8fafc" }}
            />
          </div>
          <div className="mqt-field">
            <label>Post-Test / Result Value</label>
            <input
              type="text"
              value={mqt.postValue}
              onChange={(e) => onUpdate(mqt.id, "postValue", e.target.value)}
              style={{ background: "#f8fafc" }}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px", fontSize: "8pt" }}>
          <div style={{ background: "#f1f5f9", padding: "5px 8px", borderRadius: "3px" }}>
            <span style={{ color: "#64748b" }}>Observations: </span>
            <span style={{ color: "#334155" }}>{mqt.observations}</span>
          </div>
          <div style={{ background: "#f1f5f9", padding: "5px 8px", borderRadius: "3px" }}>
            <span style={{ color: "#64748b" }}>Technician: </span>
            <span style={{ fontWeight: "600" }}>{mqt.technician}</span>
          </div>
          <div style={{ background: "#f1f5f9", padding: "5px 8px", borderRadius: "3px" }}>
            <span style={{ color: "#64748b" }}>Test Date: </span>
            <span style={{ fontWeight: "600", fontFamily: "monospace" }}>{mqt.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestSequenceDiagram({ accent }: { accent: string }) {
  const BOX_W = 72, BOX_H = 28, GAP = 10;
  const seqA = ["MQT 20", "MQT 01", "MQT 02", "MQT 03", "MQT 04", "MQT 05", "MQT 06", "MQT 07", "MQT 08", "MQT 01"];
  const seqB = ["MQT 01", "MQT 09", "MQT 11", "MQT 12", "MQT 13", "MQT 10", "MQT 14", "MQT 15", "MQT 01", "MQT 02"];
  const seqC = ["MQT 01", "MQT 16", "MQT 17", "MQT 18", "MQT 19", "MQT 21", "MQT 01", "MQT 02"];

  const Row = ({ label, color, items, y }: { label: string; color: string; items: string[]; y: number }) => {
    const totalW = items.length * (BOX_W + GAP) - GAP;
    return (
      <g>
        <text x={0} y={y + BOX_H / 2 + 4} fontSize={9} fontWeight="700" fill={color}>{label}</text>
        {items.map((item, i) => {
          const x = 80 + i * (BOX_W + GAP);
          const isRepeat = i > 0 && items[i] === "MQT 01";
          const bg = item === "MQT 01" ? "#e0f2fe" : item === "MQT 02" ? "#fef9c3" : color === accent ? "#dbeafe" : color === "#16a34a" ? "#dcfce7" : "#fef3c7";
          const tc = color === accent ? accent : color;
          return (
            <g key={i}>
              {i > 0 && (
                <line x1={x - GAP} y1={y + BOX_H / 2} x2={x} y2={y + BOX_H / 2} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#arrow)" />
              )}
              <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={4} fill={bg} stroke={tc} strokeWidth={1.5} />
              <text x={x + BOX_W / 2} y={y + BOX_H / 2 + 4} textAnchor="middle" fontSize={8} fontWeight="700" fill={tc}>{item}</text>
            </g>
          );
        })}
        <rect x={80} y={y - 4} width={items.length * (BOX_W + GAP) - GAP} height={BOX_H + 8} rx={6} fill="none" stroke={color} strokeWidth={0.5} strokeDasharray="4 3" opacity={0.4} />
      </g>
    );
  };

  return (
    <svg width="100%" viewBox="0 0 980 220" style={{ border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fafafa" }}>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
        </marker>
      </defs>
      <text x={490} y={18} textAnchor="middle" fontSize={10} fontWeight="800" fill={accent}>IEC 61215-2:2021 — Test Sequence Overview</text>
      <Row label="Seq. A" color={accent} items={seqA} y={30} />
      <Row label="Seq. B" color="#16a34a" items={seqB} y={90} />
      <Row label="Seq. C" color="#d97706" items={seqC} y={150} />
      {/* Legend */}
      <rect x={20} y={186} width={12} height={12} fill="#e0f2fe" stroke={accent} strokeWidth={1.5} rx={2} />
      <text x={36} y={197} fontSize={8} fill="#334155">Visual Inspection / Flash</text>
      <rect x={150} y={186} width={12} height={12} fill="#dbeafe" stroke={accent} strokeWidth={1.5} rx={2} />
      <text x={166} y={197} fontSize={8} fill="#334155">Performance</text>
      <rect x={260} y={186} width={12} height={12} fill="#dcfce7" stroke="#16a34a" strokeWidth={1.5} rx={2} />
      <text x={276} y={197} fontSize={8} fill="#334155">Environmental</text>
      <rect x={370} y={186} width={12} height={12} fill="#fef3c7" stroke="#d97706" strokeWidth={1.5} rx={2} />
      <text x={386} y={197} fontSize={8} fill="#334155">Mechanical / Robustness</text>
    </svg>
  );
}

function UncertaintySection({ accent }: { accent: string }) {
  return (
    <>
      <SH title="MEASUREMENT UNCERTAINTY STATEMENT (ISO/IEC 17025 / GUM)" accent={accent} />
      <p style={{ fontSize: "8pt", color: "#64748b", marginBottom: "10px" }}>
        All expanded uncertainties are stated at a confidence level of approximately 95% (coverage factor k=2) in accordance with JCGM 100:2008.
      </p>
      <table style={{ width: "65%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
        <thead>
          <tr style={{ background: "#334155", color: "white" }}>
            {["Parameter", "Type A (u_A)", "Type B (u_B)", "Combined (u_c)", "Expanded U (k=2)", "Confidence"].map(h => (
              <th key={h} style={{ padding: "5px 8px", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ["Pmpp (W)", "0.42%", "1.23%", "1.30%", "±2.55%", "95%"],
            ["Voc (V)", "0.31%", "0.68%", "0.75%", "±1.44%", "95%"],
            ["Isc (A)", "0.38%", "1.05%", "1.12%", "±2.21%", "95%"],
            ["Fill Factor", "0.45%", "0.88%", "0.99%", "±1.95%", "95%"],
            ["Module Temp. (°C)", "0.2°C", "0.4°C", "0.45°C", "±0.5°C", "95%"],
            ["Irradiance (W/m²)", "0.5%", "0.9%", "1.03%", "±2.0%", "95%"],
          ].map(([p, ta, tb, uc, U, cf], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "4px 8px", fontWeight: "600" }}>{p}</td>
              <td style={{ padding: "4px 8px", fontFamily: "monospace" }}>{ta}</td>
              <td style={{ padding: "4px 8px", fontFamily: "monospace" }}>{tb}</td>
              <td style={{ padding: "4px 8px", fontFamily: "monospace" }}>{uc}</td>
              <td style={{ padding: "4px 8px", fontFamily: "monospace", color: accent, fontWeight: "700" }}>{U}</td>
              <td style={{ padding: "4px 8px" }}>{cf}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function SignatureBlock({ accent, reportNo }: { accent: string; reportNo: string }) {
  return (
    <div style={{ marginTop: "24px", borderTop: "2px solid #e2e8f0", paddingTop: "16px" }}>
      <div style={{ fontWeight: "700", fontSize: "9pt", color: accent, marginBottom: "12px" }}>AUTHORIZATION & SIGNATURES</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", fontSize: "8.5pt" }}>
        {[
          { role: "Prepared By", name: "Dr. A. Sharma", title: "Senior Lab Technician", emp: "SLX-T-001", date: "2026-03-10" },
          { role: "Checked By", name: "Mr. R. Verma", title: "Sr. PV Test Engineer", emp: "SLX-E-003", date: "2026-03-12" },
          { role: "Authorized By", name: "Prof. G. Krishnan", title: "Technical Manager", emp: "SLX-M-001", date: "2026-03-13" },
          { role: "Issued By", name: "Ms. P. Nair", title: "Quality Manager", emp: "SLX-Q-001", date: "2026-03-14" },
        ].map((sig) => (
          <div key={sig.role} style={{ textAlign: "center" }}>
            <div style={{ height: "30px", borderBottom: "1px solid #94a3b8", marginBottom: "6px" }}></div>
            <div style={{ fontWeight: "700" }}>{sig.name}</div>
            <div style={{ color: "#64748b", fontSize: "7.5pt" }}>{sig.title}</div>
            <div style={{ color: "#94a3b8", fontSize: "7pt" }}>Emp: {sig.emp}</div>
            <div style={{ color: accent, fontWeight: "700", marginTop: "3px", fontSize: "7.5pt" }}>{sig.role}</div>
            <div style={{ color: "#94a3b8", fontSize: "7pt" }}>Date: {sig.date}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "14px", fontSize: "7.5pt", color: "#94a3b8", textAlign: "center" }}>
        {reportNo} · Issue 1 · SolarLabX PV Testing Division · Plot 12-B, MIDC Bhosari, Pune 411026 · NABL TC-8192 · 2026-03-14
      </div>
    </div>
  );
}
