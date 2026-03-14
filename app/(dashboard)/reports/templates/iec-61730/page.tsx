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
import { PmaxStabilizationChart, InsulationResistanceChart } from "@/components/reports/ReportSummaryCharts";

const ACCENT = "#7c2d12";

const moduleInfo = {
  manufacturer: "Axitec Energy GmbH & Co. KG",
  model: "AC-430MH/144V",
  type: "Monocrystalline PERC, Half-cut",
  pmax: "430 Wp",
  voc: "43.2 V",
  isc: "12.83 A",
  applicationClass: "A (SCA) – Highest Safety Class",
  maxSystemVoltage: "1500 V DC",
  fireClass: "Class C (IEC 61730-1)",
  reportNo: "SLX-RPT-IEC61730-2026-001",
  date: "2026-03-14",
  customer: "SolarTech Industries Pvt. Ltd.",
  customerAddress: "Plot 47, Solar SEZ, Rajkot, Gujarat – 360 004, India",
  projectRef: "STI-LAB-2026-007",
};

const initialMSTs = [
  {
    id: "MST 01", name: "Visual Inspection", clause: "IEC 61730-2 §10.1",
    safety_aspect: "General workmanship & labelling",
    test_condition: "Ambient, full visual assessment per IEC 61730-1 Annex A",
    equipment: "Magnifying glass (10×), calibrated lux meter",
    criterion: "No defects per IEC 61730-1 Annex; all safety labels readable",
    measuredValue: "No relevant defects, all labels readable, frame intact",
    result: "PASS",
    observations: "All safety markings, IEC symbols, and certification logos intact; no delamination, bubbles, or broken interconnects observed.",
  },
  {
    id: "MST 02", name: "Accessibility Test", clause: "IEC 61730-2 §10.2",
    safety_aspect: "Protection against electric shock – live part access",
    test_condition: "1 mm test probe per IEC 60529; measurement of creepage/clearance distances",
    equipment: "IEC test probe set, digital calipers, HV insulation tester",
    criterion: "Creepage ≥ 2 mm for Class A; live parts inaccessible with 1 mm probe",
    measuredValue: "Creepage distance: 8.2 mm (AC accessible), 6.5 mm (DC parts), all live parts inaccessible with 1 mm probe",
    result: "PASS",
    observations: "Both creepage and clearance values comfortably exceed minimum requirements for Application Class A / 1500 V DC system voltage.",
  },
  {
    id: "MST 03", name: "Cut Susceptibility", clause: "IEC 61730-2 §10.3",
    safety_aspect: "Backsheet / encapsulant integrity under mechanical cut",
    test_condition: "Blade force 3.0 ± 0.5 N, 40 passes at 100 mm/s, specimen 300 × 300 mm",
    equipment: "Cut susceptibility tester (Zwick/Roell), calibrated force gauge",
    criterion: "No penetration to live parts through backsheet",
    measuredValue: "Blade force: 3.1 N, No penetration through backsheet after 40 passes",
    result: "PASS",
    observations: "Backsheet (TPT) exhibited no cuts reaching the encapsulant layer; no trace of metallic contact during all 40 passes.",
  },
  {
    id: "MST 04", name: "Ground Continuity", clause: "IEC 61730-2 §10.4",
    safety_aspect: "Protective earth bonding of metallic frame",
    test_condition: "25 A AC applied between PE terminal and 6 frame points; measure bond resistance",
    equipment: "Milliohm meter (Megger DLRO10, cal. valid 2027-01), 25 A AC source",
    criterion: "< 0.1 Ω per test point",
    measuredValue: "R_bond (frame-to-PE) = 0.042 Ω max, measured at 6 points",
    result: "PASS",
    observations: "All six frame-to-PE measurement points yielded resistance values between 0.031 Ω and 0.042 Ω; well within the 0.1 Ω limit.",
  },
  {
    id: "MST 05", name: "Impulse Voltage", clause: "IEC 61730-2 §10.5",
    safety_aspect: "Insulation withstand against lightning / switching transients",
    test_condition: "Standard 1.2/50 μs impulse; 6000 V peak; 3 positive + 3 negative impulses between circuit and frame",
    equipment: "Impulse voltage generator (Haefely PSURGE 2000, cal. 2026-01)",
    criterion: "No insulation breakdown, no flashover in 6 shots",
    measuredValue: "6000 V peak (1.2/50 μs), 3 positive + 3 negative impulses, no breakdown",
    result: "PASS",
    observations: "No breakdown, flashover, or arc detected during any of the six impulse shots. Post-test insulation resistance unchanged.",
  },
  {
    id: "MST 06", name: "Dielectric Withstand (Dry & Wet)", clause: "IEC 61730-2 §10.6",
    safety_aspect: "Insulation integrity under sustained high voltage – dry and wet",
    test_condition: "Dry: 4000 V AC (= 2 × 1500 + 1000 V) for 60 s; Wet: 2200 V AC for 120 s, module fully wetted per §10.51",
    equipment: "HV dielectric tester (Seaward PV150), leakage current monitor",
    criterion: "No dielectric breakdown; wet leakage < 50 μA",
    measuredValue: "Dry: 4000 V AC (2×1500+1000) for 60 s, no breakdown. Wet: 2200 V AC for 2 min, leakage < 50 μA",
    result: "PASS",
    observations: "Dry test: leakage stabilised at 12 μA at 4000 V. Wet test: peak leakage 38 μA. No flashover or breakdown in either test.",
  },
  {
    id: "MST 11", name: "Temperature Test", clause: "IEC 61730-2 §10.11",
    safety_aspect: "Material temperature ratings & hot-spot risk",
    test_condition: "Module at Pmax, 1000 W/m² irradiance; IR thermography; measure T at junction box, cable, frame, cells",
    equipment: "FLIR T840 IR camera (cal. 2026-02), class AAA solar simulator, calibrated thermocouples",
    criterion: "No temperature exceeding material ratings; T_junction-box ≤ 90 °C",
    measuredValue: "Hot-spot temp (IR): 68.2 °C, Frame: 58.1 °C, Junction box: 62.4 °C, Cable: 55.3 °C",
    result: "PASS",
    observations: "All temperature values well below material ratings. Junction box reached 62.4 °C (limit 90 °C). No hot-spot anomalies beyond single shaded cell test in MST 12.",
  },
  {
    id: "MST 12", name: "Hot-Spot Endurance", clause: "IEC 61730-2 §10.12",
    safety_aspect: "Sustained hot-spot safety – fire/burn risk",
    test_condition: "One cell fully shaded; 1000 W/m²; 5 h exposure; IR monitoring throughout; immediate post-test visual inspection",
    equipment: "FLIR T840, class AAA simulator, shadow mask, thermocouple DAQ",
    criterion: "No fire, no permanent damage beyond defined limits; ΔT_hotspot documented",
    measuredValue: "Hotspot ΔT = 18 °C under 5 h exposure with 1 shaded cell, no burn/discoloration",
    result: "PASS",
    observations: "Steady-state hot-spot ΔT stabilised at 18 °C. No discolouration, delamination, or burn marks post-test. Bypass diode functioned correctly.",
  },
  {
    id: "MST 13", name: "Ignitability", clause: "IEC 61730-2 §10.13",
    safety_aspect: "Module surface ignitability – fire risk classification",
    test_condition: "Open flame 30 s exposure on backsheet, frame, J-box; 3 specimens each surface; evaluate self-extinguish time",
    equipment: "Bunsen burner assembly, stopwatch, fume extraction chamber",
    criterion: "No sustained ignition (HB classification minimum); self-extinguishing within 10 s",
    measuredValue: "No ignition of external flame after 30 s exposure on 3 samples, self-extinguishing within 2 s",
    result: "PASS",
    observations: "Backsheet (TPT) self-extinguished in ≤ 2 s on all three specimens. Frame (anodised aluminium) showed no ignition. J-box (PA66 UL94-V0) passed.",
  },
  {
    id: "MST 14", name: "Bypass Diode Thermal", clause: "IEC 61730-2 §10.14",
    safety_aspect: "Bypass diode junction temperature – overheating risk",
    test_condition: "Apply 1.25 × Isc = 16.04 A forward bias per diode for 1 h; measure T_junction via IR or thermocouple on case",
    equipment: "Programmable DC power supply (Chroma 62150H), FLIR T840 IR, K-type thermocouples",
    criterion: "T_junction ≤ T_j_max − 10 °C = 140 °C (rated T_j_max = 150 °C)",
    measuredValue: "T_junction = 68 °C @ 1.25 × Isc = 16.04 A for 1 h, T_max_diode_rating = 150 °C",
    result: "PASS",
    observations: "Junction temperature of bypass diodes reached steady state at 68 °C, providing 82 °C margin to T_j_max. No thermal runaway observed.",
  },
  {
    id: "MST 16", name: "AC Ground Fault (Insulation) Test", clause: "IEC 61730-2 §10.16",
    safety_aspect: "Insulation adequacy for Class A leakage current limit",
    test_condition: "Measure insulation resistance per §10.51 / §10.52 after wet conditioning; calculate ground fault current at 1.25 × Isc",
    equipment: "Seaward PV150 insulation tester, wetting rig, temperature chamber",
    criterion: "RISO·A ≥ 40 MΩ·m²; ground fault current ≤ 3.5 mA for Class A accessible installation",
    measuredValue: "Ground fault current at 1.25 × Isc: 0.8 mA (limit 3.5 mA) with RISO·A = 6200 MΩ·m²",
    result: "PASS",
    observations: "Insulation resistance far exceeds minimum; calculated ground fault current of 0.8 mA provides 77 % margin below the 3.5 mA Class A limit.",
  },
  {
    id: "MST 17", name: "Reverse Current Overload", clause: "IEC 61730-2 §10.17",
    safety_aspect: "Bypass diode and module safety under reverse current",
    test_condition: "Apply 1.35 × Isc = 17.3 A reverse current for 2 h; IR monitoring; check bypass diode rating",
    equipment: "Programmable DC source (Chroma 62150H), IR camera, thermocouple DAQ",
    criterion: "No thermal runaway, no fire, no permanent damage; bypass diode rating confirmed adequate",
    measuredValue: "Applied 1.35 × Isc = 17.3 A reverse for 2 h, no thermal runaway, bypass diode rating 15 A confirmed adequate",
    result: "PASS",
    observations: "Bypass diodes clipped reverse current as expected. Maximum diode case temperature: 72 °C. No delamination or discoloration observed post-test.",
  },
  {
    id: "MST 21", name: "Thermal Cycling", clause: "IEC 61730-2 §10.21",
    safety_aspect: "Insulation integrity after thermal stress cycling",
    test_condition: "TC200: −40 °C to +85 °C, ramp 100 °C/h, dwell 10 min; 200 cycles; electrical tests pre/post",
    equipment: "ACS DY110 climate chamber (cal. 2026-01), IV tracer, insulation tester",
    criterion: "ΔPmax < 5 %; no delamination, cracking; RISO·A ≥ 40 MΩ·m²",
    measuredValue: "TC200: −40 °C to +85 °C × 200 cycles, ΔPmax = −0.4 %, RISO·A = 5950 MΩ·m²",
    result: "PASS",
    observations: "Post-TC200: ΔPmax = −0.4 % (limit 5 %). No delamination, no cracked cells, no broken interconnects. Insulation resistance 5950 MΩ·m².",
  },
  {
    id: "MST 22", name: "Humidity Freeze", clause: "IEC 61730-2 §10.22",
    safety_aspect: "Insulation & structural integrity after humidity freeze cycles",
    test_condition: "HF10: 85 %RH / +40 °C soak → −40 °C freeze → +85 °C dry; 10 cycles; electrical tests pre/post",
    equipment: "ACS DY110 climate chamber, IV tracer, insulation tester, calipers",
    criterion: "ΔPmax < 5 %; no physical damage; RISO·A ≥ 40 MΩ·m²",
    measuredValue: "HF10: 85 %RH / +40 °C → −40 °C, 10 cycles, ΔPmax = −0.3 %",
    result: "PASS",
    observations: "No cracking of glass, frame, or junction box. ΔPmax = −0.3 % well within limit. Post-test RISO·A = 6080 MΩ·m².",
  },
  {
    id: "MST 25", name: "UV Pre-conditioning", clause: "IEC 61730-2 §10.25",
    safety_aspect: "Encapsulant & polymer degradation under UV exposure",
    test_condition: "15 kWh/m² UV dose (λ = 280–400 nm) per IEC 61345; irradiance 250 W/m² UV; T_module = 60 ± 5 °C",
    equipment: "UV test chamber (Atlas SUNTEST XLS+, cal. 2025-12), UV radiometer",
    criterion: "ΔPmax < 5 %; no bubbles, cracks, or discolouration in encapsulant",
    measuredValue: "15 kWh/m² UV dose (λ = 280–400 nm), ΔPmax = −0.2 %, no discolouration",
    result: "PASS",
    observations: "Encapsulant (EVA) showed no yellowing, delamination, or bubbles. Glass anti-reflection coating intact. ΔPmax = −0.2 %.",
  },
  {
    id: "MST 26", name: "Mechanical Load Test", clause: "IEC 61730-2 §10.26",
    safety_aspect: "Structural & insulation integrity under wind/snow loads",
    test_condition: "±5400 Pa uniformly distributed load (UDL); 3 cycles front + 3 cycles rear; 1 h per load cycle; electrical tests pre/post",
    equipment: "Mechanical load frame (Zwick Z050, cal. 2025-11), vacuum bag, IV tracer",
    criterion: "ΔPmax < 5 %; no glass breakage, no cracked cells; RISO·A ≥ 40 MΩ·m²",
    measuredValue: "±5400 Pa static, 3 cycles each, ΔPmax = −0.2 %, no cracking",
    result: "PASS",
    observations: "No glass breakage, no delamination, no cell cracks (post-test EL imaging). ΔPmax = −0.2 %. RISO·A = 6100 MΩ·m² post-test.",
  },
  {
    id: "MST 32", name: "Module Breakage", clause: "IEC 61730-2 §10.32",
    safety_aspect: "Fragment containment / safety glazing performance",
    test_condition: "1 kg steel ball dropped from 1 m height at 5 impact points (4 quadrants + centre); evaluate fragment scatter",
    equipment: "Drop-impact tower (1 kg ball, 1 m drop rig), measuring tape, marking grid",
    criterion: "No penetration; no escaping fragments > 75 mm from impact point",
    measuredValue: "1 kg steel ball at 1 m height at 5 points, no penetration, fragments retained within ±75 mm",
    result: "PASS",
    observations: "Tempered glass fragmented into small, low-energy pieces at all 5 impact points. No fragment escaped beyond 65 mm. No backsheet penetration.",
  },
  {
    id: "MST 34", name: "Fire Test", clause: "IEC 61730-2 §10.34",
    safety_aspect: "Fire spread classification – Class C",
    test_condition: "Burning brand (4 brands, 5 min each) + wind exposure (12 km/h) on module surface; evaluate flame spread, brands, glowing",
    equipment: "Outdoor fire test stand, wind speed meter (anemometer), IR camera",
    criterion: "Class C: no flame spread beyond module area; no through-holes; no falling burning brands",
    measuredValue: "Class C fire test passed (burning brand + wind exposure), no flame spread beyond module area",
    result: "PASS",
    observations: "Module achieved Class C fire rating. No flame propagation beyond module boundaries. No falling burning debris. Backsheet self-extinguished.",
  },
  {
    id: "MST 42", name: "Hail Impact", clause: "IEC 61730-2 §10.42",
    safety_aspect: "Glass / backsheet integrity under hail impact",
    test_condition: "25 mm ice ball at 23 m/s (Ekin = 6.2 J) at 11 points per IEC 61215-2 Annex E; visual + electrical post-test",
    equipment: "Hail gun rig, 25 mm steel ball (equivalent mass), velocity radar gun, IV tracer",
    criterion: "No glass breakage; no backsheet penetration; no damage compromising safety",
    measuredValue: "25 mm ice ball @ 23 m/s at 11 points per IEC 61215-2 Annex E, no glass breakage",
    result: "PASS",
    observations: "No glass cracking, no cell cracks (post-test EL), no frame deformation at all 11 impact points. Post-test insulation resistance unchanged.",
  },
  {
    id: "MST 51", name: "Wet Leakage Current", clause: "IEC 61730-2 §10.51",
    safety_aspect: "Insulation resistance under wet / outdoor conditions",
    test_condition: "Module fully wetted (conductive solution); 500 V DC for 2 min; measure RISO and leakage current; normalise to module area",
    equipment: "Seaward PV150, conductive wetting rig, IEC 61215-2 §4.4 solution, calibrated ammeter",
    criterion: "RISO·A ≥ 40 MΩ·m²",
    measuredValue: "RISO·A = 6150 MΩ·m² (test voltage: 500 V DC), leakage current = 0.08 mA",
    result: "PASS",
    observations: "Wet insulation resistance 6150 MΩ·m² exceeds the 40 MΩ·m² requirement by a factor of >150. Leakage current 0.08 mA far below 3.5 mA limit.",
  },
  {
    id: "MST 52", name: "Insulation Test (Dry)", clause: "IEC 61730-2 §10.52",
    safety_aspect: "Dry insulation resistance baseline verification",
    test_condition: "Dry module at ambient temperature; 500 V DC applied between short-circuited circuit and earthed frame for 60 s",
    equipment: "Seaward PV150 (cal. 2026-01), shorting wires, earthing lead",
    criterion: "RISO·A ≥ 40 MΩ·m²",
    measuredValue: "RISO·A = 6200 MΩ·m² (dry, 500 V DC for 1 min)",
    result: "PASS",
    observations: "Dry insulation resistance 6200 MΩ·m², confirming excellent baseline insulation. Value consistent across three pre/post measurement points.",
  },
  {
    id: "MST 53", name: "Damp Heat", clause: "IEC 61730-2 §10.53",
    safety_aspect: "Long-term insulation & encapsulant integrity in humid heat",
    test_condition: "85 °C / 85 % RH for 1000 h; electrical tests (IV, EL, RISO) at 0 h, 500 h, and 1000 h",
    equipment: "ACS DY110 climate chamber (1000 h endurance run), IV tracer, EL imager",
    criterion: "ΔPmax < 5 %; RISO·A ≥ 40 MΩ·m²",
    measuredValue: "85 °C / 85 % RH for 1000 h, ΔPmax = −1.1 %, RISO·A = 5800 MΩ·m²",
    result: "PASS",
    observations: "ΔPmax = −1.1 % at 1000 h, well within 5 % limit. Post-DH EL image shows no new inactive areas. RISO·A = 5800 MΩ·m².",
  },
  {
    id: "MST 54", name: "Robustness of Terminations", clause: "IEC 61730-2 §10.54",
    safety_aspect: "Cable/connector integrity under mechanical stress",
    test_condition: "Tension 40 N (10 s hold), torque 2.5 N·m (3 turns) per connector type; bending 5 cycles over 75 mm radius mandrel",
    equipment: "Digital force gauge (Imada ZTA-200N), torque wrench, bending mandrel fixture",
    criterion: "No cable damage; no connector pull-out; electrical continuity maintained < 0.1 Ω",
    measuredValue: "Tension 40 N, torque 2.5 N·m, bending per procedure, all connectors intact",
    result: "PASS",
    observations: "MC4 connectors locked correctly; no pull-out at 40 N. Cable insulation undamaged after bending. Continuity < 0.045 Ω at all terminations.",
  },
];

const insulationChartData = [
  { test: "MST 51 (Wet)", measured: 6150, required: 40 },
  { test: "MST 52 (Dry)", measured: 6200, required: 40 },
  { test: "MST 53 (DH)", measured: 5800, required: 40 },
  { test: "MST 21 (TC200)", measured: 5950, required: 40 },
  { test: "MST 22 (HF10)", measured: 6080, required: 40 },
  { test: "MST 26 (Mech)", measured: 6100, required: 40 },
];

const constructionMaterials = [
  { component: "Frame", material: "Aluminium Alloy 6005-T5, anodised", standard: "EN 755-2", status: "Compliant" },
  { component: "Front Glass", material: "3.2 mm tempered AR-coated low-iron solar glass", standard: "IEC 61730-1 Table 3", status: "Compliant" },
  { component: "Backsheet", material: "TPT (Tedlar-PET-Tedlar), UL 1703 listed", standard: "IEC 61730-1 §7.5.1", status: "Compliant" },
  { component: "Encapsulant", material: "EVA (cross-linked), CTI ≥ 175 V", standard: "IEC 61730-1 §7.5.2", status: "Compliant" },
  { component: "Junction Box", material: "IP68 rated, PA66 UL94-V0 housing", standard: "IEC 60529, IEC 61730-1", status: "Compliant" },
  { component: "Bypass Diodes", material: "3 × Schottky, 15 A / 45 V rated", standard: "IEC 61730-2 §10.14", status: "Compliant" },
  { component: "Cables", material: "PV1-F 4 mm², UV/ozone resistant, 1500 V rated", standard: "EN 50618", status: "Compliant" },
  { component: "Connectors", material: "MC4 (Stäubli), IP68, UL 6703 listed", standard: "IEC 62852", status: "Compliant" },
];

function PassBadge({ result }: { result: string }) {
  const pass = result === "PASS";
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide"
      style={{
        background: pass ? "#dcfce7" : "#fee2e2",
        color: pass ? "#166534" : "#7f1d1d",
        border: `1px solid ${pass ? "#86efac" : "#fca5a5"}`,
      }}
    >
      {pass ? "✔ PASS" : "✘ FAIL"}
    </span>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <span
        className={`text-sm ${highlight ? "font-semibold" : "text-gray-700"}`}
        style={highlight ? { color: ACCENT } : {}}
      >
        {value}
      </span>
    </div>
  );
}

function MSTCard({ mst, onEdit }: { mst: typeof initialMSTs[0]; onEdit: (id: string, val: string) => void }) {
  return (
    <div className="border rounded-xl overflow-hidden mb-6 shadow-sm" style={{ borderColor: "#e5e7eb" }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: ACCENT }}>
        <div className="flex items-center gap-3">
          <span className="text-white font-mono font-bold text-sm bg-white/20 px-2 py-0.5 rounded">
            {mst.id}
          </span>
          <span className="text-white font-semibold text-sm">{mst.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-xs font-mono">{mst.clause}</span>
          <PassBadge result={mst.result} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x" style={{ background: "#fafafa" }}>
        <div className="p-4 space-y-2">
          <InfoRow label="Safety Aspect" value={mst.safety_aspect} />
          <InfoRow label="Test Condition" value={mst.test_condition} />
          <InfoRow label="Equipment" value={mst.equipment} />
          <InfoRow label="Acceptance Criterion" value={mst.criterion} highlight />
        </div>
        <div className="p-4 space-y-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Measured / Observed Value
            </label>
            <textarea
              className="w-full text-sm border rounded p-2 focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: "#d1d5db", minHeight: "60px" }}
              value={mst.measuredValue}
              rows={3}
              onChange={(e) => onEdit(mst.id, e.target.value)}
            />
          </div>
          <InfoRow label="Observations" value={mst.observations} />
        </div>
      </div>
    </div>
  );
}

export default function IEC61730ReportPage() {
  const [msts, setMsts] = useState(initialMSTs);

  const handleEdit = (id: string, val: string) => {
    setMsts((prev) => prev.map((m) => (m.id === id ? { ...m, measuredValue: val } : m)));
  };

  const passCount = msts.filter((m) => m.result === "PASS").length;
  const failCount = msts.filter((m) => m.result === "FAIL").length;

  const elecMSTs = msts.filter((m) =>
    ["MST 01", "MST 02", "MST 03", "MST 04", "MST 05", "MST 06", "MST 51", "MST 52"].includes(m.id)
  );
  const thermalMSTs = msts.filter((m) =>
    ["MST 11", "MST 12", "MST 13", "MST 14", "MST 16", "MST 17"].includes(m.id)
  );
  const envMSTs = msts.filter((m) =>
    ["MST 21", "MST 22", "MST 25", "MST 26", "MST 53"].includes(m.id)
  );
  const mechMSTs = msts.filter((m) =>
    ["MST 32", "MST 34", "MST 42", "MST 54"].includes(m.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: ACCENT }}>
            IEC 61730:2016 – Safety Qualification Test Report
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Report No.: {moduleInfo.reportNo} &nbsp;|&nbsp; Date: {moduleInfo.date} &nbsp;|&nbsp; Lab: SolarLabX (NABL TC-8192)
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow"
          style={{ background: ACCENT }}
        >
          Print / Export PDF
        </button>
      </div>

      <div className="px-6 pb-10">
        <Tabs defaultValue="cover">
          <TabsList className="flex flex-wrap gap-1 h-auto mb-6 bg-white border rounded-xl p-1 shadow-sm">
            {[
              { value: "cover", label: "Cover & TOC" },
              { value: "module", label: "Module & Construction" },
              { value: "elec", label: "Electrical Safety" },
              { value: "thermal", label: "Thermal Safety" },
              { value: "env", label: "Environmental" },
              { value: "mech", label: "Mechanical & Fire" },
              { value: "summary", label: "Summary & Classification" },
              { value: "annexures", label: "Annexures" },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all data-[state=active]:text-white data-[state=active]:shadow"
                style={{ ["--tw-ring-color" as string]: ACCENT }}
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ─── COVER PAGE ─── */}
          <TabsContent value="cover">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {/* Header banner */}
              <div
                className="px-10 py-8 text-white"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #450a0a 100%)` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono tracking-widest text-red-200 uppercase mb-1">
                      SolarLabX – Solar PV Testing Laboratory
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight">IEC 61730:2016</h2>
                    <h3 className="text-xl font-semibold text-red-100 mt-1">
                      Photovoltaic (PV) Module Safety Qualification
                    </h3>
                    <p className="text-sm text-red-200 mt-2">
                      Test Report for Module Design Qualification &amp; Type Approval
                    </p>
                  </div>
                  <div className="text-right text-xs text-red-200 space-y-1">
                    <div>NABL Accreditation: <span className="font-bold text-white">TC-8192</span></div>
                    <div>Report No.: <span className="font-bold text-white">{moduleInfo.reportNo}</span></div>
                    <div>Issue Date: <span className="font-bold text-white">{moduleInfo.date}</span></div>
                    <div>Revision: <span className="font-bold text-white">00</span></div>
                  </div>
                </div>
              </div>

              {/* Module & Customer summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x border-b">
                <div className="p-7">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Module Under Test</h4>
                  {[
                    ["Manufacturer", moduleInfo.manufacturer],
                    ["Model / Type", `${moduleInfo.model} – ${moduleInfo.type}`],
                    ["Rated Power", moduleInfo.pmax],
                    ["Voc / Isc", `${moduleInfo.voc} / ${moduleInfo.isc}`],
                    ["Application Class", moduleInfo.applicationClass],
                    ["Max. System Voltage", moduleInfo.maxSystemVoltage],
                    ["Fire Safety Class", moduleInfo.fireClass],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-gray-100 last:border-0 text-sm">
                      <span className="text-gray-500 font-medium">{k}</span>
                      <span className="font-semibold text-gray-800 text-right ml-4">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="p-7">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Customer &amp; Project</h4>
                  {[
                    ["Customer", moduleInfo.customer],
                    ["Address", moduleInfo.customerAddress],
                    ["Project Ref.", moduleInfo.projectRef],
                    ["Samples Received", "2026-02-10"],
                    ["Testing Start", "2026-02-12"],
                    ["Testing End", "2026-03-12"],
                    ["Report Date", moduleInfo.date],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-gray-100 last:border-0 text-sm">
                      <span className="text-gray-500 font-medium">{k}</span>
                      <span className="font-semibold text-gray-800 text-right ml-4">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applicable Standards */}
              <div className="p-7 border-b">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Applicable Standards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ["IEC 61730-1:2016", "Photovoltaic (PV) module safety qualification – Part 1: Requirements for construction"],
                    ["IEC 61730-2:2016", "Photovoltaic (PV) module safety qualification – Part 2: Requirements for testing"],
                    ["IEC 61215-1:2021", "Terrestrial PV modules – Design qualification & type approval – Part 1: Test requirements"],
                    ["IEC 61215-2:2021", "Terrestrial PV modules – Part 2: Test procedures"],
                    ["IEC 60529:2013", "Degrees of protection provided by enclosures (IP Code)"],
                    ["IEC 62852:2014", "Connectors for DC-application in photovoltaic systems"],
                    ["ISO/IEC 17025:2017", "General requirements for competence of testing & calibration laboratories"],
                    ["NABL-141:2020", "NABL accreditation criteria for testing & calibration laboratories"],
                  ].map(([std, desc]) => (
                    <div key={std} className="flex gap-3 text-sm items-start">
                      <span className="font-bold shrink-0" style={{ color: ACCENT }}>{std}</span>
                      <span className="text-gray-600">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table of Contents */}
              <div className="p-7 border-b">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Table of Contents</h4>
                <div className="space-y-1 text-sm">
                  {[
                    ["1", "Cover Page, Applicable Standards, Disclaimer", "Cover & TOC"],
                    ["2", "Module Description & Construction Assessment (Part 1)", "Module & Construction"],
                    ["3", "Electrical Safety Tests (MST 01–06, MST 51–52)", "Electrical Safety"],
                    ["4", "Thermal Safety Tests (MST 11–14, MST 16–17)", "Thermal Safety"],
                    ["5", "Environmental Tests (MST 21–22, MST 25–26, MST 53)", "Environmental"],
                    ["6", "Mechanical & Fire Tests (MST 32, MST 34, MST 42, MST 54)", "Mechanical & Fire"],
                    ["7", "Safety Classification, Summary & Conclusion", "Summary & Classification"],
                    ["8", "Annexures – Equipment, Calibration & Environmental Log", "Annexures"],
                  ].map(([num, title, tab]) => (
                    <div
                      key={num}
                      className="flex items-baseline gap-2 border-b border-dotted border-gray-200 pb-1"
                    >
                      <span className="font-mono text-gray-400 w-5 shrink-0">{num}.</span>
                      <span className="text-gray-700 flex-1">{title}</span>
                      <span className="text-xs text-gray-400 shrink-0">[{tab}]</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="p-7 border-b">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Authorisation & Signatures
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    ["Prepared By", "Dr. Ananya Krishnan", "PV Test Engineer", "2026-03-13"],
                    ["Technically Checked", "Mr. Rajesh Iyer", "Senior Lab Manager", "2026-03-13"],
                    ["Authorised By", "Dr. Priya Sundar", "Technical Director", "2026-03-14"],
                    ["Issued By", "Ms. Kavitha Nair", "Quality Manager", "2026-03-14"],
                  ].map(([role, name, title, date]) => (
                    <div key={role} className="border rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{role}</div>
                      <div className="h-8 border-b border-dashed border-gray-300 mb-2" />
                      <div className="font-semibold text-sm text-gray-800">{name}</div>
                      <div className="text-xs text-gray-500">{title}</div>
                      <div className="text-xs text-gray-400 mt-1">{date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-7 bg-amber-50 rounded-b-2xl">
                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
                  Disclaimer & Confidentiality Statement
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  This test report has been prepared by SolarLabX (NABL Accredited Lab TC-8192) in accordance with ISO/IEC
                  17025:2017. The results contained herein are valid solely for the sample(s) tested and do not constitute
                  product certification or endorsement. Partial reproduction of this report is not permitted without prior
                  written approval of SolarLabX. The report shall be treated as <strong>CONFIDENTIAL</strong> and disclosed
                  only to the authorised customer and relevant certification bodies. SolarLabX accepts no responsibility for
                  the use or misuse of these results by third parties. All measurements are traceable to national/international
                  standards through NABL-approved calibration chains.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* ─── MODULE & CONSTRUCTION ─── */}
          <TabsContent value="module">
            <div className="space-y-6">
              {/* Module Description */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-1" style={{ color: ACCENT }}>Module Description</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Detailed specification of the photovoltaic module under test per IEC 61730-2 §5.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ["Manufacturer", moduleInfo.manufacturer],
                    ["Model Designation", moduleInfo.model],
                    ["Cell Technology", moduleInfo.type],
                    ["Cell Count & Config.", "144 cells (6 × 24), half-cut, 3-string"],
                    ["Rated Peak Power (Pmax)", moduleInfo.pmax],
                    ["Open Circuit Voltage (Voc)", moduleInfo.voc],
                    ["Short Circuit Current (Isc)", moduleInfo.isc],
                    ["Vmpp / Impp", "36.4 V / 11.81 A"],
                    ["Module Efficiency", "21.3 %"],
                    ["Module Dimensions", "1879 × 1045 × 35 mm"],
                    ["Weight", "22.5 kg"],
                    ["Application Class", moduleInfo.applicationClass],
                    ["Max. System Voltage", moduleInfo.maxSystemVoltage],
                    ["Fire Safety Class", moduleInfo.fireClass],
                    ["Temp. Coefficient Pmax", "−0.34 %/°C"],
                    ["NOCT", "43 ± 2 °C"],
                    ["STC Irradiance", "1000 W/m²"],
                    ["STC Temperature", "25 °C"],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg px-4 py-3">
                      <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{k}</div>
                      <div className="text-sm font-bold text-gray-800 mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Construction Assessment */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-1" style={{ color: ACCENT }}>
                  Construction Assessment – IEC 61730-1:2016
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Material review and construction drawings evaluation per IEC 61730-1 prior to safety testing.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ background: ACCENT }}>
                        {["Component", "Material / Specification", "Applicable Standard / Clause", "Review Status"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-white font-semibold text-xs uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {constructionMaterials.map((row, i) => (
                        <tr key={row.component} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-4 py-3 font-semibold text-gray-800">{row.component}</td>
                          <td className="px-4 py-3 text-gray-700">{row.material}</td>
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{row.standard}</td>
                          <td className="px-4 py-3">
                            <span className="text-green-700 font-bold text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                              ✔ {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Creepage & Clearance */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT }}>
                  Creepage & Clearance Distances (IEC 61730-1 §6.3)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "DC Side (Module Circuit)", value: "6.5 mm", req: "≥ 4.0 mm @ 1500 V", ok: true },
                    { label: "AC Accessible Side", value: "8.2 mm", req: "≥ 2.0 mm (Class A)", ok: true },
                    { label: "Clearance (Air Gap)", value: "5.8 mm", req: "≥ 3.0 mm @ 1500 V DC", ok: true },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className={`rounded-xl p-5 border ${c.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                    >
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{c.label}</div>
                      <div className="text-3xl font-extrabold" style={{ color: c.ok ? "#166534" : ACCENT }}>
                        {c.value}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Requirement: {c.req}</div>
                      <div className={`text-xs font-bold mt-2 ${c.ok ? "text-green-700" : "text-red-700"}`}>
                        {c.ok ? "✔ COMPLIANT" : "✘ NON-COMPLIANT"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                  <strong>Construction Pre-Test Review:</strong> All construction drawings, bill of materials, and component
                  certificates reviewed and approved. No non-conformities identified. Pre-test construction assessment:{" "}
                  <strong>PASS</strong>.
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── ELECTRICAL SAFETY ─── */}
          <TabsContent value="elec">
            <div className="space-y-6">
              {/* Safety Warning Notice */}
              <div className="rounded-xl border-2 border-amber-400 bg-amber-50 px-6 py-4 flex gap-4 items-start">
                <span className="text-2xl shrink-0 mt-0.5">&#9888;</span>
                <div>
                  <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wider">
                    Safety Warning Notice – High Voltage Tests
                  </h4>
                  <p className="text-amber-700 text-sm mt-1">
                    The electrical safety tests in this section involve voltages up to <strong>6000 V peak (MST 05)</strong>.
                    All tests must be conducted by qualified HV-trained personnel only. The test area must be cordoned off
                    with appropriate interlock safeguards. IEC 60900 rated insulated tools and full PPE (gloves rated
                    ≥ CAT III, face shield, insulating matting) are mandatory. Fully discharge all capacitance before
                    handling. Never work alone. Emergency isolation procedures must be briefed before commencement.
                  </p>
                </div>
              </div>

              {/* Insulation Resistance Chart */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-1" style={{ color: ACCENT }}>
                  Insulation Resistance Summary (RISO·A in MΩ·m²)
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Measured insulation resistance values (area-normalised) compared against the 40 MΩ·m² minimum requirement
                  across all relevant MSTs.
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={insulationChartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="test" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      label={{ value: "MΩ·m²", angle: -90, position: "insideLeft", offset: 10, fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v, n) => [
                        `${v} MΩ·m²`,
                        n === "measured" ? "Measured RISO·A" : "Minimum Required",
                      ]}
                    />
                    <Legend
                      formatter={(v) =>
                        v === "measured" ? "Measured RISO·A" : "Minimum Requirement (40 MΩ·m²)"
                      }
                    />
                    <Bar dataKey="measured" name="measured" radius={[4, 4, 0, 0]}>
                      {insulationChartData.map((_, i) => (
                        <Cell key={i} fill={ACCENT} />
                      ))}
                    </Bar>
                    <Bar dataKey="required" name="required" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  All measured values exceed the minimum requirement by a factor of &gt;140×.
                </p>
              </div>

              {elecMSTs.map((mst) => (
                <MSTCard key={mst.id} mst={mst} onEdit={handleEdit} />
              ))}
            </div>
          </TabsContent>

          {/* ─── THERMAL SAFETY ─── */}
          <TabsContent value="thermal">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-lg font-bold mb-1" style={{ color: ACCENT }}>Thermal Safety Tests</h3>
                <p className="text-sm text-gray-500">
                  Tests covering temperature limits, hot-spot risk, ignitability, bypass diode thermal performance,
                  and reverse current protection per IEC 61730-2 §10.11–§10.17.
                </p>
              </div>
              {thermalMSTs.map((mst) => (
                <MSTCard key={mst.id} mst={mst} onEdit={handleEdit} />
              ))}
            </div>
          </TabsContent>

          {/* ─── ENVIRONMENTAL ─── */}
          <TabsContent value="env">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-lg font-bold mb-1" style={{ color: ACCENT }}>Environmental Tests</h3>
                <p className="text-sm text-gray-500">
                  Long-term environmental stress tests including thermal cycling, humidity freeze, UV pre-conditioning,
                  mechanical load, and damp heat per IEC 61730-2 §10.21–§10.53. Primary safety criteria: RISO·A ≥
                  40 MΩ·m² and ΔPmax &lt; 5 % throughout.
                </p>
              </div>
              {envMSTs.map((mst) => (
                <MSTCard key={mst.id} mst={mst} onEdit={handleEdit} />
              ))}
            </div>
          </TabsContent>

          {/* ─── MECHANICAL & FIRE ─── */}
          <TabsContent value="mech">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <h3 className="text-lg font-bold mb-1" style={{ color: ACCENT }}>Mechanical &amp; Fire Tests</h3>
                <p className="text-sm text-gray-500">
                  Tests assessing mechanical robustness, fragment containment (breakage), fire classification, hail
                  resistance, and termination integrity per IEC 61730-2 §10.32–§10.54.
                </p>
              </div>
              {mechMSTs.map((mst) => (
                <MSTCard key={mst.id} mst={mst} onEdit={handleEdit} />
              ))}
            </div>
          </TabsContent>

          {/* ─── SUMMARY & CLASSIFICATION ─── */}
          <TabsContent value="summary">
            <div className="space-y-6">
              {/* Safety Classification */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT }}>
                  Safety Classification Result (IEC 61730-1:2016)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Application Class",
                      value: "Class A (SCA)",
                      sub: "Accessible installation (highest safety class)",
                    },
                    {
                      label: "Maximum System Voltage",
                      value: "1500 V DC",
                      sub: "Tested & qualified for 1500 V DC systems",
                    },
                    {
                      label: "Fire Safety Class",
                      value: "Class C",
                      sub: "IEC 61730-1 fire performance classification",
                    },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="rounded-xl border-2 p-6 text-center"
                      style={{ borderColor: "#86efac", background: "#f0fdf4" }}
                    >
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{c.label}</div>
                      <div className="text-2xl font-extrabold mb-1" style={{ color: ACCENT }}>
                        {c.value}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">{c.sub}</div>
                      <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                        ✔ CONFIRMED
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* I-V Curve Comparison */}
              <div className="page-break" style={{ marginBottom: "24px" }}>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: ACCENT, borderBottom: `2px solid ${ACCENT}`, paddingBottom: "4px" }}>
                  I-V Curve Comparison (Pre vs Post Safety Tests)
                </h3>
                <IVCurveComparisonChart
                  preParams={{ voc: 43.24, isc: 12.85, vmp: 35.31, imp: 12.20, pmax: 430.8, ff: 0.7786 }}
                  postParams={{ voc: 43.15, isc: 12.82, vmp: 35.20, imp: 12.16, pmax: 426.1, ff: 0.7695 }}
                  title="IEC 61730 Safety Tests – I-V Curve Overlay"
                  height={280}
                />
              </div>

              {/* Insulation Resistance Trend */}
              <div style={{ marginBottom: "24px" }}>
                <InsulationResistanceChart
                  data={[
                    { stage: "Initial", "SM-007": 6500, "SM-008": 6480 },
                    { stage: "Post-Impulse", "SM-007": 6350, "SM-008": 6320 },
                    { stage: "Post-Dielectric", "SM-007": 6200, "SM-008": 6180 },
                    { stage: "Post-TC200", "SM-007": 5980, "SM-008": 5950 },
                    { stage: "Final", "SM-007": 5820, "SM-008": 5800 },
                  ]}
                  sampleIds={["SM-007", "SM-008"]}
                  height={220}
                />
              </div>

              {/* Overall result banner */}
              <div
                className="rounded-2xl px-8 py-6 flex items-center justify-between"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, #450a0a)` }}
              >
                <div>
                  <div className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-1">
                    Overall Safety Qualification Result
                  </div>
                  <div className="text-white text-3xl font-extrabold tracking-wide">
                    SAFETY QUALIFIED – PASS
                  </div>
                  <div className="text-red-200 text-sm mt-1">
                    IEC 61730:2016 – Part 1 &amp; Part 2 | Application Class A | 1500 V DC | Fire Class C
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono text-sm">
                    {passCount}/{msts.length} tests PASS
                  </div>
                  {failCount > 0 && (
                    <div className="text-red-300 font-bold text-sm">{failCount} FAIL(s)</div>
                  )}
                  <div className="text-red-200 text-xs mt-1">Report: {moduleInfo.reportNo}</div>
                </div>
              </div>

              {/* Full MST summary table */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT }}>
                  Complete MST Pass/Fail Summary (All {msts.length} Tests)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ background: ACCENT }}>
                        {["MST ID", "Test Name", "Clause", "Safety Aspect", "Criterion (Summary)", "Result"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-3 py-2.5 text-white font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msts.map((m, i) => (
                        <tr key={m.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2 font-mono font-bold text-xs" style={{ color: ACCENT }}>
                            {m.id}
                          </td>
                          <td className="px-3 py-2 font-semibold text-gray-800 text-xs">{m.name}</td>
                          <td className="px-3 py-2 text-gray-500 font-mono text-xs whitespace-nowrap">{m.clause}</td>
                          <td className="px-3 py-2 text-gray-600 text-xs">{m.safety_aspect}</td>
                          <td className="px-3 py-2 text-gray-600 text-xs max-w-xs">
                            {m.criterion.length > 60 ? m.criterion.slice(0, 60) + "…" : m.criterion}
                          </td>
                          <td className="px-3 py-2">
                            <PassBadge result={m.result} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conclusion */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT }}>Conclusion</h3>
                <div className="text-gray-700 space-y-3 text-sm leading-relaxed">
                  <p>
                    The photovoltaic module <strong>{moduleInfo.model}</strong> manufactured by{" "}
                    <strong>{moduleInfo.manufacturer}</strong> has been subjected to a comprehensive safety qualification
                    test programme in accordance with <strong>IEC 61730-1:2016</strong> (Requirements for Construction)
                    and <strong>IEC 61730-2:2016</strong> (Requirements for Testing). All{" "}
                    <strong>{msts.length} Module Safety Tests (MSTs)</strong> prescribed for the claimed application class
                    have been successfully completed.
                  </p>
                  <p>
                    The module has demonstrated compliance with all safety requirements applicable to{" "}
                    <strong>Application Class A (SCA – Safely Connected and Accessible)</strong> installations, a maximum
                    system voltage of <strong>1500 V DC</strong>, and <strong>Fire Safety Class C</strong> as defined in
                    IEC 61730-1. The module passed all electrical insulation tests with RISO·A values exceeding
                    5800 MΩ·m² (minimum: 40 MΩ·m²), all thermal safety tests including bypass diode thermal and
                    hot-spot endurance, all environmental stress tests with ΔPmax within 1.1 % (limit: 5 %), and all
                    mechanical and fire performance tests.
                  </p>
                  <p>
                    Based on the results contained in this report, SolarLabX certifies that the{" "}
                    <strong>Axitec AC-430MH/144V</strong> module meets the safety qualification requirements of{" "}
                    <strong>IEC 61730:2016</strong> and is{" "}
                    <strong>RECOMMENDED FOR CERTIFICATION</strong> under Application Class A / 1500 V DC / Fire
                    Class C designation.
                  </p>
                  <p className="text-xs text-gray-400">
                    This conclusion is valid for the sample(s) tested under the conditions specified herein. Results are
                    not to be extrapolated to other module types or configurations. Report No. {moduleInfo.reportNo},
                    Issue Date {moduleInfo.date}, SolarLabX NABL TC-8192.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ─── ANNEXURES ─── */}
          <TabsContent value="annexures">
            <div className="space-y-6">
              {/* Annexure A – Equipment List */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT }}>
                  Annexure A – Test Equipment & Instruments
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ background: ACCENT }}>
                        {["Eq. ID", "Description", "Make / Model", "Range / Accuracy", "Cal. Due Date", "Cal. Cert. No."].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left px-3 py-2.5 text-white font-semibold text-xs uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["EQ-01", "Class AAA Solar Simulator", "Spire SPI-Sun 5600SLP", "1000 W/m², ±2 %", "2027-01-15", "NABL-CAL-2026-0041"],
                        ["EQ-02", "HV Dielectric / Insulation Tester", "Seaward PV150", "0–5000 V DC / ±1.5 %", "2026-11-30", "NABL-CAL-2026-0078"],
                        ["EQ-03", "Impulse Voltage Generator", "Haefely PSURGE 2000", "0–10 kV, 1.2/50 μs", "2026-09-22", "NABL-CAL-2026-0095"],
                        ["EQ-04", "IR Thermographic Camera", "FLIR T840", "−20 to +650 °C / ±1 °C", "2026-07-10", "NABL-CAL-2026-0103"],
                        ["EQ-05", "Climate Chamber (TC/HF/DH)", "ACS DY110", "−70 to +180 °C, 10–98 %RH", "2027-03-01", "NABL-CAL-2026-0112"],
                        ["EQ-06", "Programmable DC Power Supply", "Chroma 62150H-600S", "0–600 V / 0–25 A", "2026-12-18", "NABL-CAL-2026-0124"],
                        ["EQ-07", "Milliohm Meter", "Megger DLRO10", "0.1 μΩ–1000 Ω / ±0.2 %", "2026-08-05", "NABL-CAL-2026-0137"],
                        ["EQ-08", "UV Test Chamber", "Atlas SUNTEST XLS+", "250–800 W/m² UV, λ 280–800 nm", "2025-12-10", "NABL-CAL-2025-0289"],
                        ["EQ-09", "Mechanical Load Frame", "Zwick/Roell Z050", "0–50 kN / ±0.5 %", "2026-10-14", "NABL-CAL-2026-0156"],
                        ["EQ-10", "EL Imaging System", "Oswald EL PRO-3", "1340×1024 px InGaAs", "2026-06-30", "NABL-CAL-2026-0168"],
                        ["EQ-11", "Reference Cell (c-Si)", "Kipp & Zonen SRC-1000", "0–1300 W/m² / ±0.5 %", "2026-04-22", "NABL-CAL-2026-0181"],
                        ["EQ-12", "Digital Calipers", "Mitutoyo 500-196-30", "0–300 mm / ±0.01 mm", "2026-11-08", "NABL-CAL-2026-0192"],
                      ].map(([id, desc, make, range, due, cert], i) => (
                        <tr key={id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2 font-mono text-xs font-bold" style={{ color: ACCENT }}>{id}</td>
                          <td className="px-3 py-2 font-semibold text-gray-800 text-xs">{desc}</td>
                          <td className="px-3 py-2 text-gray-700 text-xs">{make}</td>
                          <td className="px-3 py-2 text-gray-600 text-xs">{range}</td>
                          <td className="px-3 py-2 text-xs font-mono">{due}</td>
                          <td className="px-3 py-2 text-xs font-mono text-gray-500">{cert}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annexure B – Environmental Log */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-1" style={{ color: ACCENT }}>
                  Annexure B – Laboratory Environmental Conditions Log
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Ambient conditions recorded in the electrical/optical test area during key test dates. Acceptance range:
                  23 ± 5 °C, 30–70 % RH per ISO/IEC 17025.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr style={{ background: ACCENT }}>
                        {["Date", "Time", "Temp (°C)", "Humidity (%RH)", "Pressure (hPa)", "Recorded By"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-3 py-2.5 text-white font-semibold text-xs uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["2026-02-12", "09:00", "23.4", "51.2", "1012.3", "Ravi Kumar"],
                        ["2026-02-14", "10:15", "22.8", "49.7", "1013.1", "Ananya K."],
                        ["2026-02-18", "09:30", "23.1", "52.0", "1011.8", "Ravi Kumar"],
                        ["2026-02-25", "11:00", "24.2", "53.5", "1010.5", "Pradeep M."],
                        ["2026-03-03", "09:45", "23.6", "50.3", "1013.7", "Ananya K."],
                        ["2026-03-08", "10:30", "22.5", "48.9", "1014.2", "Ravi Kumar"],
                        ["2026-03-12", "09:00", "23.8", "51.8", "1012.9", "Pradeep M."],
                      ].map(([date, time, temp, rh, press, by], i) => (
                        <tr key={date + time} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-3 py-2 font-mono text-xs">{date}</td>
                          <td className="px-3 py-2 font-mono text-xs">{time}</td>
                          <td className="px-3 py-2 text-xs font-semibold">{temp}</td>
                          <td className="px-3 py-2 text-xs font-semibold">{rh}</td>
                          <td className="px-3 py-2 text-xs">{press}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{by}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Annexure C – Calibration Traceability */}
              <div className="bg-white rounded-2xl shadow-sm border p-7">
                <h3 className="text-lg font-bold mb-3" style={{ color: ACCENT }}>
                  Annexure C – Calibration Traceability Statement
                </h3>
                <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                  <p>
                    All measuring instruments and test equipment used in this testing campaign are calibrated by
                    NABL-accredited calibration laboratories. Calibration certificates are traceable to the{" "}
                    <strong>National Physical Laboratory (NPL), New Delhi</strong> for primary measurement standards
                    and to <strong>BIPM</strong> via NABL&apos;s mutual recognition arrangement under the CIPM MRA.
                  </p>
                  <p>
                    Calibration validity was verified prior to test commencement. All calibration due dates extend
                    beyond the final test date of 2026-03-12. No equipment with expired calibration was used during
                    the course of this testing programme. Calibration records are maintained in SolarLabX LIMS under
                    project reference <strong>STI-LAB-2026-007</strong>.
                  </p>
                  <p className="text-xs text-gray-400">
                    For calibration certificate copies, contact: quality@solarlabx.in | Reference: NABL TC-8192 |
                    QMS Document: SLX-QMS-CAL-001 Rev.03
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body { font-size: 11px; }
          button { display: none !important; }
          [role="tablist"] { display: none !important; }
          [role="tabpanel"] { display: block !important; page-break-inside: avoid; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
