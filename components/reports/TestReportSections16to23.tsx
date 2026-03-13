// @ts-nocheck
"use client";
import React from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { STABILIZATION_DATA, SEQUENCE_SUMMARY, SEQUENCE_PMAX } from "@/lib/test-report-mock-data";
import { PassBadge, SectionTitle, TRow } from "./TestReportSections1to5";

// ── SECTION 16: Bypass Diode Thermal ─────────────────────────────────────────
export function Section16BypassDiodeThermal() {
  return (
    <section id="section-16" className="mb-10">
      <SectionTitle num={16} title="Bypass Diode Thermal Test (MQT 18)" clause="IEC 61215-2:2021 §4.18" />
      <div className="text-sm text-muted-foreground mb-3">
        Module operated at maximum current (Isc) under full shading conditions at T<sub>amb</sub> = 75 °C for 1 h per diode. IR camera measurement of diode junction temperatures. Acceptance: T<sub>diode</sub> ≤ T<sub>max</sub> per manufacturer datasheet (90 °C for this diode type).
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Test Conditions</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Test current per string", "Isc = 9.99 A"],
                  ["Ambient temperature", "75 °C"],
                  ["Test duration", "1 h per diode (3 h total)"],
                  ["Shading configuration", "Full string shaded (1 string at a time)"],
                  ["Temperature measurement", "IR thermography + thermocouple"],
                  ["Acceptance criterion", "T < T_max = 90 °C (mfr. spec)"],
                  ["Diode type", "Schottky, 10 A, T_max 100 °C"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className="py-1 font-medium">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Diode Temperature Results</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Diode", "String", "T_amb (°C)", "T_diode max (°C)", "T_limit (°C)", "Result"]} /></thead>
              <tbody>
                {[
                  ["Diode 1", "String 1 (cells 1–36)", "75", "56.8", "90", "PASS"],
                  ["Diode 2", "String 2 (cells 37–72)", "75", "57.4", "90", "PASS"],
                  ["Diode 3", "String 3 (cells 73–108)", "75", "55.9", "90", "PASS"],
                ].map(([d, s, ta, td, tl, r]) => (
                  <TRow key={d} cells={[d, s, ta, <span key="t" className="font-bold text-blue-600">{td}</span>, tl, <PassBadge key="v" result={r} />]} />
                ))}
              </tbody>
            </table>
            <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 rounded text-xs text-green-800 dark:text-green-200">
              Max diode temperature: <strong>57.4 °C</strong> — 32.6 °C below the 90 °C limit. All three bypass diodes operate well within safe thermal limits.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ── SECTION 17: Hot Spot Endurance ────────────────────────────────────────────
export function Section17HotSpotEndurance() {
  return (
    <section id="section-17" className="mb-10">
      <SectionTitle num={17} title="Hot Spot Endurance Test (MQT 09)" clause="IEC 61215-2:2021 §4.9" />
      <div className="text-sm text-muted-foreground mb-3">
        Worst-case shading scenario determined by IR pre-screening. One cell per string shaded with opaque material. Module operated at maximum power under 1000 W/m² illumination for 5 h per IEC 61215-2 §4.9. IR imaging before, during, and after exposure.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Test Parameters</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Shading pattern", "Worst-case (1 cell per string)"],
                  ["Irradiance", "1000 ± 100 W/m²"],
                  ["Exposure duration", "5 h at Imp/Vmp"],
                  ["Cells shaded (String 1)", "Cell #19 (highest T found in IR pre-scan)"],
                  ["Cells shaded (String 2)", "Cell #65"],
                  ["Cells shaded (String 3)", "Cell #91"],
                  ["Max hot spot T (IR)", "72.3 °C (Cell #65, String 2)"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className="py-1 font-medium">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pre/Post Hot Spot Results</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Check", "Pre", "Post", "Result"]} /></thead>
              <tbody>
                {[
                  ["Pmax (W)", "399.8", "397.3 (−0.63%)", "PASS"],
                  ["Visual inspection", "No defects", "No new defects", "PASS"],
                  ["EL imaging", "Baseline", "No new inactive areas", "PASS"],
                  ["IR hot spot T", "—", "72.3 °C (max, during test)", "PASS"],
                  ["Glass discoloration", "None", "None", "PASS"],
                  ["Encapsulant damage", "None", "None", "PASS"],
                ].map(([p, a, b, c]) => (
                  <TRow key={p} cells={[p, a, b, <PassBadge key="v" result={c} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — No visible damage, no cell breakage, no delamination after 5-h hot-spot exposure. Hot-spot temperature (72.3 °C) is within module operating range and no encapsulant browning was observed.
      </div>
    </section>
  );
}

// ── SECTION 18: NMOT Determination ────────────────────────────────────────────
export function Section18NMOT() {
  const nmotData = [
    { time: "09:00", Tamb: 19.2, Gmod: 798, Tmodule: 43.1 },
    { time: "10:00", Tamb: 20.1, Gmod: 803, Tmodule: 44.0 },
    { time: "11:00", Tamb: 20.8, Gmod: 801, Tmodule: 44.5 },
    { time: "12:00", Tamb: 21.3, Gmod: 799, Tmodule: 44.8 },
    { time: "13:00", Tamb: 20.9, Gmod: 797, Tmodule: 44.3 },
    { time: "14:00", Tamb: 20.5, Gmod: 800, Tmodule: 43.9 },
  ];
  return (
    <section id="section-18" className="mb-10">
      <SectionTitle num={18} title="NMOT (Nominal Module Operating Temperature) Determination (MQT 05)" clause="IEC 61215-2:2021 §4.5" />
      <div className="text-sm text-muted-foreground mb-3">
        NMOT measured per IEC 61215-2 §4.5. Conditions: G = 800 W/m², T<sub>amb</sub> = 20 °C, wind speed = 1.0 m/s. Module mounted in open-rack configuration with ventilation on both sides. Temperature measured by 4 thermocouples on cell surfaces (average reported).
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">NMOT Test Conditions & Result</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Reference irradiance", "800 W/m²"],
                  ["Reference T_amb", "20 °C"],
                  ["Reference wind speed", "1.0 m/s"],
                  ["Mounting", "Open rack, tilt 45°, dual-side ventilation"],
                  ["Thermocouple positions", "4 (cells: TL, TR, BL, BR average)"],
                  ["Average T_module at 800 W/m²", "44.2 °C"],
                  ["Uncertainty (k=2)", "± 2 °C"],
                  ["Declared NMOT", "44.2 ± 2 °C"],
                  ["Standard reference", "44 °C (typical mono-Si)"],
                  ["Result", "PASS (reported as declared value)"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className={`py-1 font-medium ${v.startsWith("PASS") ? "text-green-700 dark:text-green-400" : ""}`}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">NMOT Measurement Data (Sample Day)</CardTitle></CardHeader>
          <CardContent>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={nmotData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" domain={[15, 50]} label={{ value: "Temp (°C)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Tamb" stroke="#6366f1" strokeWidth={2} name="T_amb (°C)" />
                  <Line yAxisId="left" type="monotone" dataKey="Tmodule" stroke="#f97316" strokeWidth={2} name="T_module (°C)" />
                  <ReferenceLine yAxisId="left" y={44.2} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "NMOT 44.2°C", fill: "#22c55e", fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ── SECTION 19: Stabilization ─────────────────────────────────────────────────
export function Section19Stabilization() {
  return (
    <section id="section-19" className="mb-10">
      <SectionTitle num={19} title="Light-Induced Stabilization (MQT 19)" clause="IEC 61215-2:2021 §4.19" />
      <div className="text-sm text-muted-foreground mb-3">
        Modules exposed to light soaking per IEC 61215-2 §4.19. STC measurements taken at each interval. Stabilization criterion: three consecutive measurements within ±2% of each other. Performed prior to performance measurements in each sequence.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Stabilization Data (Light Soaking)</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Exposure (Wh/m²)", "Pmax (W)", "Change from prev.", "Stabilized?"]} /></thead>
              <tbody>
                {STABILIZATION_DATA.map((r, i) => {
                  const prev = i > 0 ? STABILIZATION_DATA[i - 1].Pmax : null;
                  const delta = prev ? (((r.Pmax - prev) / prev) * 100).toFixed(2) : "—";
                  const stabilized = i >= 5;
                  return (
                    <TRow key={r.exposure} cells={[
                      `${r.exposure} Wh/m²`,
                      `${r.Pmax} W`,
                      prev ? `${delta >= 0 ? "+" : ""}${delta}%` : "—",
                      stabilized ? <PassBadge key="s" result="STABLE" /> : "—",
                    ]} />
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pmax vs Light Soaking Exposure</CardTitle></CardHeader>
          <CardContent>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={STABILIZATION_DATA} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="exposure" label={{ value: "Exposure (Wh/m²)", position: "insideBottomRight", offset: -5 }} />
                  <YAxis domain={[395, 402]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(v) => [`${v} W`, "Pmax"]} />
                  <ReferenceLine x={300} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "Stabilised →", fill: "#22c55e", fontSize: 10 }} />
                  <Line type="monotone" dataKey="Pmax" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Pmax (W)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — Stabilization achieved at 300 Wh/m² exposure. Three consecutive measurements (300, 350, 400 Wh/m²) within ±0.02% of each other, well within the ±2% criterion.
      </div>
    </section>
  );
}

// ── SECTION 20: Full Sequence Summary ─────────────────────────────────────────
export function Section20FullSequenceSummary() {
  const seqColors: Record<string, string> = {
    "A": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "B": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "C": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "D": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    "A/B/C/D": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    "Pre": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    "Optional": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "—": "bg-gray-50 text-gray-500",
  };
  return (
    <section id="section-20" className="mb-10">
      <SectionTitle num={20} title="Full Test Sequence Summary" clause="IEC 61215-1:2021 Figure 2 / IEC 61730-2:2023" />
      <div className="text-sm text-muted-foreground mb-3">
        Complete summary of all Module Qualification Tests (MQT) and Module Safety Tests (MST) performed in this qualification campaign. Sequences A, B, C, D per IEC 61215-1:2021 Figure 2.
      </div>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-xs border border-border rounded">
          <thead>
            <TRow header cells={["Test", "Description", "Clause", "Seq.", "Pre-Value", "Post-Value", "Δ / Change", "Limit", "Result"]} />
          </thead>
          <tbody>
            {SEQUENCE_SUMMARY.map((r, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 font-bold text-primary">{r.mq}</td>
                <td className="px-3 py-2">{r.test}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{r.clause}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${seqColors[r.seq] || "bg-gray-100"}`}>{r.seq}</span>
                </td>
                <td className="px-3 py-2">{r.initialPmax}</td>
                <td className="px-3 py-2 font-semibold">{r.finalPmax}</td>
                <td className={`px-3 py-2 font-semibold ${r.delta && r.delta.startsWith("−") ? "text-orange-600" : ""}`}>{r.delta}</td>
                <td className="px-3 py-2 text-muted-foreground">{r.limit}</td>
                <td className="px-3 py-2"><PassBadge result={r.result} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Overall Sequence Pmax Degradation Summary</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SEQUENCE_PMAX} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-10} textAnchor="end" />
                <YAxis domain={[360, 410]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => [`${v} W`, "Pmax"]} />
                <Legend />
                <ReferenceLine y={380} stroke="#f97316" strokeDasharray="5 3" label={{ value: "−5% limit", fill: "#f97316", fontSize: 10 }} />
                <ReferenceLine y={368} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "−8% limit (Seq B)", fill: "#ef4444", fontSize: 10 }} />
                <Bar dataKey="Pmax" name="Final Pmax (W)" radius={[4, 4, 0, 0]}>
                  {SEQUENCE_PMAX.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#3b82f6", "#8b5cf6", "#f97316", "#22c55e", "#06b6d4"][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">All sequences pass their respective degradation limits. Sequence B (TC600) shows highest degradation at −3.75% vs the 8% limit. All sequences are within their respective IEC 61215 acceptance criteria.</p>
        </CardContent>
      </Card>
    </section>
  );
}

// ── SECTION 21: PID Test ──────────────────────────────────────────────────────
export function Section21PIDTest() {
  return (
    <section id="section-21" className="mb-10">
      <SectionTitle num={21} title="Potential Induced Degradation (PID) Test — IEC TS 62804" clause="IEC TS 62804-1:2015 §5" />
      <div className="text-sm text-muted-foreground mb-3">
        PID test per IEC TS 62804-1 §5 (stress method 1 — system voltage method). Module connected with negative polarity. Acceptance: Pmax degradation ≤ 5% after stress.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">PID Test Conditions</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Applied voltage", "−1000 V DC (frame to circuit)"],
                  ["Temperature", "60 °C"],
                  ["Humidity", "85% RH"],
                  ["Duration", "96 hours"],
                  ["Polarity", "Negative (frame at +1000 V)"],
                  ["Standard", "IEC TS 62804-1:2015 Method 1"],
                  ["Acceptance", "Pmax ≥ 95% of initial"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className="py-1 font-medium">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pre/Post PID Results</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Parameter", "Pre-Stress", "Post-Stress", "Change", "Limit", "Result"]} /></thead>
              <tbody>
                {[
                  ["Pmax (W)", "399.8", "396.8", "−0.75%", "<5%", "PASS"],
                  ["Isc (A)", "9.99", "9.93", "−0.60%", "—", "PASS"],
                  ["Voc (V)", "49.20", "49.05", "−0.30%", "—", "PASS"],
                  ["FF (%)", "81.3", "81.0", "−0.37%", "—", "PASS"],
                  ["Insulation (MΩ·m²)", "12 500", "11 800", "−5.6%", ">40", "PASS"],
                ].map(([p, a, b, c, d, e]) => (
                  <TRow key={p} cells={[p, a, b, c, d, <PassBadge key="v" result={e} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — Pmax degradation only −0.75% after 96 h PID stress at −1000 V, 60 °C, 85% RH. Module demonstrates excellent PID resistance. PERC N-type cell technology inherently shows low PID susceptibility.
      </div>
    </section>
  );
}

// ── SECTION 22: LeTID Test ────────────────────────────────────────────────────
export function Section22LeTIDTest() {
  const letidData = [
    { phase: "Initial", pmax: 399.8 },
    { phase: "After LeTID injection\n(60°C, 2h)", pmax: 397.5 },
    { phase: "After recovery\n(annealing 200°C, 10min)", pmax: 396.2 },
  ];
  return (
    <section id="section-22" className="mb-10">
      <SectionTitle num={22} title="LeTID Test (Light and elevated Temperature Induced Degradation) — IEC TS 63209" clause="IEC TS 63209-1:2021" />
      <div className="text-sm text-muted-foreground mb-3">
        LeTID stress per IEC TS 63209-1. Current injection at elevated module temperature simulates long-term LeTID under field conditions. N-type mono-Si cells have intrinsically lower LeTID susceptibility compared to p-type.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">LeTID Test Conditions</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Module temperature", "60 °C"],
                  ["Irradiance equivalent", "1 sun (100 mA/cm² injection)"],
                  ["Injection duration", "2 hours"],
                  ["Recovery condition", "Annealing at 200 °C for 10 min"],
                  ["Standard", "IEC TS 63209-1:2021"],
                  ["Cell type", "Mono-Si PERC N-type (low LeTID risk)"],
                  ["Acceptance", "Pmax degradation ≤ 5%"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className="py-1 font-medium">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pmax Through LeTID Phases</CardTitle></CardHeader>
          <CardContent>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={letidData} margin={{ top: 5, right: 20, left: 5, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" tick={{ fontSize: 9 }} angle={-10} textAnchor="end" />
                  <YAxis domain={[390, 405]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(v) => [`${v} W`, "Pmax"]} />
                  <Bar dataKey="pmax" fill="#6366f1" name="Pmax" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <table className="w-full text-sm border rounded mb-3">
        <thead><TRow header cells={["Phase", "Pmax (W)", "Change", "Limit", "Result"]} /></thead>
        <tbody>
          {[
            ["Initial baseline", "399.8 W", "—", "—", "—"],
            ["Post-injection (60°C, 2h)", "397.5 W", "−0.58%", "<5%", "PASS"],
            ["Post-recovery (anneal)", "396.2 W", "−0.90% (from initial)", "<5%", "PASS"],
          ].map(([p, a, b, c, e]) => (
            <TRow key={p} cells={[p, a, b, c, e && e !== "—" ? <PassBadge key="v" result={e} /> : e]} />
          ))}
        </tbody>
      </table>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — Net Pmax degradation −0.90% after LeTID injection + recovery. N-type PERC cell architecture confirms minimal LeTID susceptibility, consistent with published literature for this cell type.
      </div>
    </section>
  );
}

// ── SECTION 23: Conclusion & Certification Decision ───────────────────────────
export function Section23Conclusion() {
  return (
    <section id="section-23" className="mb-10">
      <SectionTitle num={23} title="Conclusion & Certification Decision" />
      <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950 mb-6">
        <div className="text-center">
          <div className="text-4xl font-black text-green-700 dark:text-green-400 mb-1">PASS</div>
          <div className="text-lg font-semibold">Overall Qualification Verdict: COMPLIANT</div>
          <div className="text-sm text-muted-foreground mt-1">
            IEC 61215-1:2021 / IEC 61215-1-1:2021 / IEC 61730-1:2023 / IEC 61730-2:2023
          </div>
        </div>
      </div>
      <div className="text-sm mb-4">
        All Module Qualification Tests (MQT) and Module Safety Tests (MST) specified in IEC 61215-1:2021 and IEC 61730-2:2023 have been successfully completed for the module type:
      </div>
      <div className="bg-muted rounded p-3 font-mono text-sm mb-4">
        Model: SM-400M-BF-HG · Type: 400W Mono-Si PERC N-type Bifacial · Pmax: 400 Wp
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Summary Statistics</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Total tests performed", "23"],
                  ["PASS", "23"],
                  ["FAIL", "0"],
                  ["N/A", "0"],
                  ["Max Pmax degradation (any seq.)", "−3.75% (Seq B / TC400)"],
                  ["Min insulation post-test", "9,800 MΩ·m² (>>40 MΩ·m²)"],
                  ["Max wet leakage post-test", "3.1 mA·m² (<<40 mA·m²)"],
                  ["Overall result", "PASS — ALL TESTS"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b">
                    <td className="py-1 text-muted-foreground pr-3">{k}</td>
                    <td className={`py-1 font-bold ${v.includes("PASS") ? "text-green-700 dark:text-green-400" : v.includes("FAIL") ? "text-red-600" : ""}`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Deviations & Observations</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ol className="list-decimal ml-4 space-y-2">
              <li>Slight encapsulant yellowing (ΔE &lt; 3.0) noted post-DH1000 — within acceptable limits per laboratory practice; no impact on performance.</li>
              <li>Two microcracks detected by EL post-TC400 (cells 47 and 83) — non-active-area-affecting; no inactive cells; classified as minor per IEC TS 61836.</li>
              <li>Insulation resistance showed expected reduction with environmental stress; all values remain &gt;9,800 MΩ·m² (247× above 40 MΩ·m² limit).</li>
              <li>PID and LeTID tests are supplementary (IEC TS level) and not mandatory for CB scheme certification but included for completeness.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-3 gap-4 text-sm">
        {[
          { role: "Prepared By", name: "Test Engineer", dept: "PV Testing Department", date: "2024-11-12", sig: "______________________" },
          { role: "Reviewed By", name: "Senior Engineer", dept: "Technical Review", date: "2024-11-14", sig: "______________________" },
          { role: "Approved By", name: "Lab Manager", dept: "Quality & Certification", date: "2024-11-15", sig: "______________________" },
        ].map((s) => (
          <div key={s.role} className="border rounded p-4">
            <div className="font-bold text-primary mb-2">{s.role}</div>
            <div className="space-y-1 text-muted-foreground">
              <div>Name: <span className="text-foreground font-medium">{s.name}</span></div>
              <div>Dept: {s.dept}</div>
              <div>Date: {s.date}</div>
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs mb-1">Signature:</div>
                <div className="font-mono">{s.sig}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 bg-muted rounded text-xs text-muted-foreground">
        <strong>Report Issued By:</strong> {"> Accredited Test Laboratory — ISO/IEC 17025:2017 Accredited"}<br />
        <strong>Accreditation Scope:</strong> PV module testing per IEC 61215, IEC 61730, IEC 61853, IEC 60904 series<br />
        <strong>IECEE CB Scheme:</strong> Participant — OD-2048 Rev.4 (2023)<br />
        <strong>Disclaimer:</strong> This report relates only to the items tested. It shall not be reproduced, except in full, without written permission of the laboratory. Results are valid only for the samples tested.
      </div>
    </section>
  );
}
