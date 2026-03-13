// @ts-nocheck
"use client";
import React from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WET_LEAKAGE_TREND, EL_SEVERITY, TC_PRE_POST } from "@/lib/test-report-mock-data";
import { PassBadge, SectionTitle, TRow } from "./TestReportSections1to5";

// ── SECTION 6: Wet Leakage Current ────────────────────────────────────────────
const WL_TABLE = [
  { point: "Initial", voltage: "500 V", current: "2.1", area: "1.822", specific: "3.83", result: "PASS" },
  { point: "Post TC200", voltage: "500 V", current: "2.4", area: "1.822", specific: "4.37", result: "PASS" },
  { point: "Post HF10", voltage: "500 V", current: "2.7", area: "1.822", specific: "4.92", result: "PASS" },
  { point: "Post DH1000", voltage: "500 V", current: "3.1", area: "1.822", specific: "5.65", result: "PASS" },
  { point: "Post Hail", voltage: "500 V", current: "2.8", area: "1.822", specific: "5.10", result: "PASS" },
];

export function Section6WetLeakage() {
  return (
    <section id="section-6" className="mb-10">
      <SectionTitle num={6} title="Wet Leakage Current Test (MQT 15 / MST 12)" clause="IEC 61215-2 §4.15 / IEC 61730-2 §10.12" />
      <div className="text-sm text-muted-foreground mb-3">
        Module immersed in aqueous surfactant solution (wetting agent per §4.15). Test voltage: 500 V DC for Class II. Duration: 2 min at test voltage after stabilisation. Acceptance: I<sub>leak</sub> × Area ≤ 40 mA·m².
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["Test Point", "Applied V (V)", "Leakage I (mA)", "Area (m²)", "I×A (mA·m²)", "Criterion (≤40 mA·m²)", "Result"]} />
          </thead>
          <tbody>
            {WL_TABLE.map((r) => (
              <TRow key={r.point} cells={[r.point, r.voltage, r.current, r.area, r.specific, "≤ 40 mA·m²", <PassBadge key="v" result={r.result} />]} />
            ))}
          </tbody>
        </table>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Wet Leakage Current Trend (mA·m²)</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WET_LEAKAGE_TREND} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 45]} label={{ value: "mA·m²", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => [`${v} mA·m²`, "Wet Leakage"]} />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "Max 40 mA·m²", fill: "#ef4444", fontSize: 10 }} />
                <Bar dataKey="value" fill="#8b5cf6" name="Wet Leakage" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// ── SECTION 7: Ground Continuity ──────────────────────────────────────────────
export function Section7GroundContinuity() {
  return (
    <section id="section-7" className="mb-10">
      <SectionTitle num={7} title="Ground Continuity / Equipotential Bonding (MST 13)" clause="IEC 61730-2:2023 §10.13" />
      <div className="text-sm text-muted-foreground mb-3">
        Test current: 25 A AC for 2 s between frame and each accessible conductive part. Acceptance: Resistance ≤ 0.1 Ω. Applies to Class II modules with accessible conductive parts (frame, J-box housing).
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["Test Point A → B", "Test Current (A)", "Duration (s)", "Measured R (mΩ)", "Criterion (≤ 100 mΩ)", "Result"]} />
          </thead>
          <tbody>
            {[
              ["Frame corner 1 → Frame corner 2", "25 A AC", "2", "45.2", "≤ 100 mΩ", "PASS"],
              ["Frame corner 1 → Frame corner 3", "25 A AC", "2", "47.8", "≤ 100 mΩ", "PASS"],
              ["Frame corner 1 → Frame corner 4", "25 A AC", "2", "48.1", "≤ 100 mΩ", "PASS"],
              ["Frame → J-box housing (accessible)", "25 A AC", "2", "46.5", "≤ 100 mΩ", "PASS"],
              ["Frame → Grounding lug (if present)", "25 A AC", "2", "42.3", "≤ 100 mΩ", "PASS"],
            ].map(([a, b, c, d, e, f]) => (
              <TRow key={a} cells={[a, b, c, d, e, <PassBadge key="v" result={f} />]} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — Maximum measured resistance: 48.1 mΩ. All measurement points well within the 100 mΩ (0.1 Ω) criterion.
      </div>
    </section>
  );
}

// ── SECTION 8: Impulse Voltage Test ───────────────────────────────────────────
export function Section8ImpulseVoltage() {
  return (
    <section id="section-8" className="mb-10">
      <SectionTitle num={8} title="Impulse Voltage Test (MST 14)" clause="IEC 61730-2:2023 §10.14" />
      <div className="text-sm text-muted-foreground mb-3">
        Standard lightning impulse waveform 1.2/50 μs per IEC 60060-1. Test voltage level determined by max system voltage (1500 V DC → impulse category III → 6 kV per IEC 60664-1). Three positive + three negative impulses applied between circuit conductors and frame.
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["Polarity", "Peak Voltage (kV)", "Waveform", "No. Impulses", "Insulation R Before (MΩ)", "Insulation R After (MΩ)", "Flashover / Breakdown", "Result"]} />
          </thead>
          <tbody>
            {[
              ["Positive", "6.0", "1.2/50 μs", "3", "10 900", "10 850", "None", "PASS"],
              ["Negative", "6.0", "1.2/50 μs", "3", "10 850", "10 790", "None", "PASS"],
            ].map(([a, b, c, d, e, f, g, h]) => (
              <TRow key={a} cells={[a, b, c, d, e, f, g, <PassBadge key="v" result={h} />]} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — No flashover, puncture, or breakdown observed during or after impulse application. Insulation resistance verified after test; no significant reduction detected.
      </div>
    </section>
  );
}

// ── SECTION 9: EL Imaging Results ─────────────────────────────────────────────
const EL_TABLE = [
  { point: "Initial", cracks: 0, inactive: 0, dark: 0, hotspot: 0, severity: 0.8, note: "Baseline — all cells active" },
  { point: "Post UV", cracks: 0, inactive: 0, dark: 0, hotspot: 0, severity: 1.1, note: "Minor luminescence uniformity variation" },
  { point: "Post TC200", cracks: 1, inactive: 0, dark: 0, hotspot: 0, severity: 1.6, note: "1 hairline microcrack in cell #47 (non-critical)" },
  { point: "Post TC400", cracks: 2, inactive: 0, dark: 0, hotspot: 0, severity: 2.3, note: "2 microcracks, no inactive areas" },
  { point: "Post HF10", cracks: 1, inactive: 0, dark: 0, hotspot: 0, severity: 1.9, note: "1 additional microcrack, cell edges" },
  { point: "Post DH1000", cracks: 3, inactive: 0, dark: 0, hotspot: 0, severity: 2.7, note: "3 microcracks, potential snail-trail precursor" },
  { point: "Post ML", cracks: 2, inactive: 0, dark: 0, hotspot: 0, severity: 2.1, note: "Post mechanical load — no new inactive cells" },
  { point: "Post Hail", cracks: 3, inactive: 0, dark: 0, hotspot: 0, severity: 2.4, note: "No new cracks from hail impact" },
];

export function Section9ELImaging() {
  return (
    <section id="section-9" className="mb-10">
      <SectionTitle num={9} title="Electroluminescence (EL) Imaging Results" clause="IEC 60904-13 / Lab SOP EL-003" />
      <div className="text-sm text-muted-foreground mb-3">
        EL imaging performed at I = Isc (9.99 A) per laboratory SOP. Camera: cooled Si-CCD, 1024×1024 px. Integration time: 2 s. Defect classification per IEC TS 61836. Severity score: 0 (none) to 10 (critical).
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["Test Point", "Cracks", "Inactive Cells", "Dark Areas", "Hotspots", "Severity (0–10)", "Observation"]} />
          </thead>
          <tbody>
            {EL_TABLE.map((r) => (
              <TRow key={r.point} cells={[r.point, r.cracks, r.inactive, r.dark, r.hotspot,
                <span key="s" className={`font-bold ${r.severity > 5 ? "text-red-600" : r.severity > 2.5 ? "text-yellow-600" : "text-green-600"}`}>{r.severity}</span>,
                r.note,
              ]} />
            ))}
          </tbody>
        </table>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">EL Severity Score Progression Across Sequence</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EL_SEVERITY} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} label={{ value: "Severity (0–10)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => [`${v}`, "Severity Score"]} />
                <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "Critical Level 5", fill: "#ef4444", fontSize: 10 }} />
                <Bar dataKey="score" fill="#f59e0b" name="EL Severity" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">All severity scores remain below the critical threshold of 5.0. Microcracks identified are non-active-area-affecting (cell edges). No inactive cells or dark areas detected throughout the full test sequence.</p>
        </CardContent>
      </Card>
    </section>
  );
}

// ── SECTION 10: Thermal Cycling ────────────────────────────────────────────────
const TC_PRE_POST_CHART = [
  { name: "TC200 Pre", Pmax: 399.8 },
  { name: "TC200 Post", Pmax: 393.5 },
  { name: "TC400 Post", Pmax: 384.8 },
];

export function Section10ThermalCycling() {
  return (
    <section id="section-10" className="mb-10">
      <SectionTitle num={10} title="Thermal Cycling Test (MQT 11)" clause="IEC 61215-2:2021 §4.11" />
      <div className="text-sm text-muted-foreground mb-3">
        Thermal cycling performed per IEC 61215-2 §4.11. Chamber: forced-air convection. Ramp rate: ≤ 100 °C/h. Dwell at extremes: ≥ 10 min. Modules connected at Isc (current-through) for TC400 sequence.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">MQT 11.1 — TC200 (Sequence A)</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Cycles", "200"],
                  ["Temp range", "−40 °C to +85 °C"],
                  ["Ramp rate", "≤ 100 °C/h"],
                  ["Dwell at −40 °C", "≥ 10 min"],
                  ["Dwell at +85 °C", "≥ 10 min"],
                  ["Current injection", "None (passive TC200)"],
                  ["Pre Pmax", "399.8 W"],
                  ["Post Pmax", "393.5 W (−1.58%)"],
                  ["Pre Isc", "9.99 A → Post 9.87 A"],
                  ["Pre Voc", "49.20 V → Post 49.05 V"],
                  ["Pre FF", "81.3% → Post 81.0%"],
                  ["Insulation (pre)", "12 500 MΩ·m²"],
                  ["Insulation (post)", "11 200 MΩ·m²"],
                  ["Degradation limit", "< 5%"],
                  ["Result", "PASS"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className={`py-1 font-medium ${v === "PASS" ? "text-green-700 dark:text-green-400" : ""}`}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">MQT 11.2 — TC400 (Sequence B)</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Cycles", "400 (cumulative from 0)"],
                  ["Temp range", "−40 °C to +85 °C"],
                  ["Ramp rate", "≤ 100 °C/h"],
                  ["Current injection", "Isc per string (TC200→TC400)"],
                  ["Pre Pmax", "399.8 W (initial)"],
                  ["Post Pmax", "384.8 W (−3.75%)"],
                  ["Pre Isc", "9.99 A → Post 9.78 A"],
                  ["Pre Voc", "49.20 V → Post 48.85 V"],
                  ["Pre FF", "81.3% → Post 80.6%"],
                  ["Insulation (post)", "10 900 MΩ·m²"],
                  ["Degradation limit", "< 8%"],
                  ["Result", "PASS"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className={`py-1 font-medium ${v === "PASS" ? "text-green-700 dark:text-green-400" : ""}`}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Pmax Pre/Post TC200 and TC400</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TC_PRE_POST_CHART} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[370, 410]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => [`${v} W`, "Pmax"]} />
                <ReferenceLine y={380} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "−5% limit (TC200)", fill: "#ef4444", fontSize: 10 }} />
                <ReferenceLine y={368} stroke="#f97316" strokeDasharray="5 3" label={{ value: "−8% limit (TC400)", fill: "#f97316", fontSize: 10 }} />
                <Bar dataKey="Pmax" fill="#3b82f6" name="Pmax (W)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">TC200: −1.58% degradation (limit 5%), TC400: −3.75% degradation (limit 8%). Both sequences pass with comfortable margin.</p>
        </CardContent>
      </Card>
    </section>
  );
}
