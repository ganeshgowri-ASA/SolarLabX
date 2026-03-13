// @ts-nocheck
"use client";
import React from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DH_TREND } from "@/lib/test-report-mock-data";
import { PassBadge, SectionTitle, TRow } from "./TestReportSections1to5";

// ── SECTION 11: Humidity Freeze ────────────────────────────────────────────────
export function Section11HumidityFreeze() {
  return (
    <section id="section-11" className="mb-10">
      <SectionTitle num={11} title="Humidity Freeze Test (MQT 12)" clause="IEC 61215-2:2021 §4.12" />
      <div className="text-sm text-muted-foreground mb-3">
        10 cycles: module conditioned at +85 °C / 85% RH for 20 h per cycle, then cooled to −40 °C within 0.5–1 h. Total exposure: 200 h at 85/85 + 10 freeze cycles.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Test Conditions</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["No. of cycles", "10"],
                  ["High T/RH", "+85 °C, 85% RH"],
                  ["Dwell at 85/85", "≥ 20 h per cycle"],
                  ["Low temperature", "−40 °C"],
                  ["Cooling rate", "≤ 100 °C/h"],
                  ["Dwell at −40 °C", "≥ 30 min"],
                  ["Reconnection", "Passive (no current)"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className="py-1 font-medium">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pre/Post Results</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Parameter", "Pre-Test", "Post-Test", "Change", "Limit", "Result"]} /></thead>
              <tbody>
                {[
                  ["Pmax (W)", "399.8", "392.1", "−1.93%", "<5%", "PASS"],
                  ["Isc (A)", "9.99", "9.88", "−1.10%", "Report", "PASS"],
                  ["Voc (V)", "49.20", "49.03", "−0.35%", "Report", "PASS"],
                  ["FF (%)", "81.3", "80.8", "−0.61%", "Report", "PASS"],
                  ["Insulation (MΩ·m²)", "12 500", "10 900", "−12.8%", ">40", "PASS"],
                  ["Wet Leakage (mA·m²)", "2.1", "2.7", "+28.6%", "<40", "PASS"],
                ].map(([p, a, b, c, d, e]) => (
                  <TRow key={p} cells={[p, a, b, c, d, <PassBadge key="v" result={e} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — Pmax degradation −1.93% after 10 HF cycles. EL imaging post-test shows no new microcracks. Visual inspection: no delamination, no bubbles.
      </div>
    </section>
  );
}

// ── SECTION 12: Damp Heat ──────────────────────────────────────────────────────
export function Section12DampHeat() {
  return (
    <section id="section-12" className="mb-10">
      <SectionTitle num={12} title="Damp Heat Test (MQT 13) — DH 1000 h" clause="IEC 61215-2:2021 §4.13" />
      <div className="text-sm text-muted-foreground mb-3">
        1000 continuous hours at 85 °C, 85% RH (±2 °C, ±5% RH). Acceptance: Pmax degradation ≤ 5%. Insulation and wet leakage current measured before and after exposure.
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pre/Post Comparison</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Parameter", "Pre-Test", "Post-Test", "Change", "Limit", "Result"]} /></thead>
              <tbody>
                {[
                  ["Pmax (W)", "399.8", "388.2", "−2.90%", "<5%", "PASS"],
                  ["Isc (A)", "9.99", "9.83", "−1.60%", "Report", "PASS"],
                  ["Voc (V)", "49.20", "48.80", "−0.81%", "Report", "PASS"],
                  ["Imp (A)", "9.48", "9.34", "−1.48%", "Report", "PASS"],
                  ["Vmp (V)", "42.15", "41.56", "−1.40%", "Report", "PASS"],
                  ["FF (%)", "81.3", "80.6", "−0.86%", "Report", "PASS"],
                  ["Insulation (MΩ·m²)", "12 500", "9 800", "−21.6%", ">40", "PASS"],
                  ["Wet Leakage (mA·m²)", "2.1", "3.1", "+47.6%", "<40", "PASS"],
                ].map(([p, a, b, c, d, e]) => (
                  <TRow key={p} cells={[p, a, b, c, d, <PassBadge key="v" result={e} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pmax Degradation Over 1000 h</CardTitle></CardHeader>
          <CardContent>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DH_TREND} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hours" label={{ value: "Hours", position: "insideBottomRight", offset: -5 }} />
                  <YAxis domain={[380, 405]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(v) => [`${v} W`, "Pmax"]} />
                  <ReferenceLine y={380} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "−5% limit", fill: "#ef4444", fontSize: 10 }} />
                  <Line type="monotone" dataKey="Pmax" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Pmax (W)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — Total degradation −2.90% after 1000 h DH. Well within the 5% limit. Slight increase in wet leakage current (from 2.1 to 3.1 mA·m²) still far below the 40 mA·m² criterion.
      </div>
    </section>
  );
}

// ── SECTION 13: UV Preconditioning ────────────────────────────────────────────
export function Section13UVPreconditioning() {
  return (
    <section id="section-13" className="mb-10">
      <SectionTitle num={13} title="UV Preconditioning (MQT 10)" clause="IEC 61215-2:2021 §4.10" />
      <div className="text-sm text-muted-foreground mb-3">
        UV exposure per IEC 61215-2 §4.10 (MQT 10.1). Module temperature during exposure: 60 ± 5 °C. UV source bandwidth: 280–385 nm. Total UVA dose: 15 kWh/m², UVB dose: 5 kWh/m².
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">UV Exposure Parameters</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Standard", "IEC 61215-2 §4.10 (MQT 10.1)"],
                  ["UVA dose (315–385 nm)", "15 kWh/m²"],
                  ["UVB dose (280–315 nm)", "5 kWh/m²"],
                  ["Total UV dose", "20 kWh/m²"],
                  ["Module temperature", "60 ± 5 °C"],
                  ["UV irradiance", "≤ 250 W/m² (total UV band)"],
                  ["Exposure duration (approx)", "≈ 80 h (continuous)"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-3">{k}</td><td className="py-1 font-medium">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pre/Post Results</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Parameter", "Pre", "Post", "Change", "Limit", "Result"]} /></thead>
              <tbody>
                {[
                  ["Pmax (W)", "399.8", "397.2", "−0.65%", "<5%", "PASS"],
                  ["Isc (A)", "9.99", "9.95", "−0.40%", "Report", "PASS"],
                  ["Voc (V)", "49.20", "49.12", "−0.16%", "Report", "PASS"],
                  ["FF (%)", "81.3", "81.1", "−0.25%", "Report", "PASS"],
                  ["Visual", "No defects", "No defects", "—", "No damage", "PASS"],
                  ["EL Severity", "0.8", "1.1", "+0.3", "<5", "PASS"],
                ].map(([p, a, b, c, d, e]) => (
                  <TRow key={p} cells={[p, a, b, c, d, <PassBadge key="v" result={e} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Result: PASS</strong> — Minimal degradation (−0.65%) after UV preconditioning. No encapsulant yellowing or delamination observed. UV preconditioning confirms adequate UV stability of encapsulant materials.
      </div>
    </section>
  );
}

// ── SECTION 14: Mechanical Load ────────────────────────────────────────────────
export function Section14MechanicalLoad() {
  const mlData = [
    { load: "Front 2400 Pa — Cycle 1", deflection: "12.3 mm", postPmax: "399.2 W", result: "PASS" },
    { load: "Front 2400 Pa — Cycle 2", deflection: "12.1 mm", postPmax: "399.0 W", result: "PASS" },
    { load: "Front 2400 Pa — Cycle 3", deflection: "12.4 mm", postPmax: "398.8 W", result: "PASS" },
    { load: "Rear 2400 Pa — Cycle 1", deflection: "11.8 mm", postPmax: "398.5 W", result: "PASS" },
    { load: "Rear 2400 Pa — Cycle 2", deflection: "11.9 mm", postPmax: "398.2 W", result: "PASS" },
    { load: "Rear 2400 Pa — Cycle 3", deflection: "12.0 mm", postPmax: "397.9 W", result: "PASS" },
  ];
  const mlChart = [
    { cycle: "Front ×3\n2400 Pa", pmax: 398.8 },
    { cycle: "Rear ×3\n2400 Pa", pmax: 396.5 },
  ];
  return (
    <section id="section-14" className="mb-10">
      <SectionTitle num={14} title="Mechanical Load Test (MQT 16)" clause="IEC 61215-2:2021 §4.16" />
      <div className="text-sm text-muted-foreground mb-3">
        Uniform static load applied front and rear per IEC 61215-2 §4.16. Load: 2400 Pa (standard, suitable for wind/snow loads ≤ 2.4 kPa). 3 loading cycles each direction. Mounting: 4-point per manufacturer drawing. Deflection measured at centre.
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["Load Application", "Max Deflection (mm)", "Post-Cycle Pmax (W)", "EL Post", "Visual Post", "Result"]} />
          </thead>
          <tbody>
            {mlData.map((r) => (
              <TRow key={r.load} cells={[r.load, r.deflection, r.postPmax, "No new defects", "No cracks", <PassBadge key="v" result={r.result} />]} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Final Post-ML IV Results</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Parameter", "Pre-ML", "Post-ML", "Change", "Result"]} /></thead>
              <tbody>
                {[
                  ["Pmax (W)", "399.8", "396.5", "−0.83%", "PASS"],
                  ["Isc (A)", "9.99", "9.93", "−0.60%", "PASS"],
                  ["Voc (V)", "49.20", "49.10", "−0.20%", "PASS"],
                  ["FF (%)", "81.3", "81.1", "−0.25%", "PASS"],
                ].map(([p, a, b, c, e]) => (
                  <TRow key={p} cells={[p, a, b, c, <PassBadge key="v" result={e} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pmax Post Front/Rear Load Cycles</CardTitle></CardHeader>
          <CardContent>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mlChart} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
                  <YAxis domain={[390, 405]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(v) => [`${v} W`, "Pmax"]} />
                  <Bar dataKey="pmax" fill="#22c55e" name="Pmax (W)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ── SECTION 15: Hail Test ──────────────────────────────────────────────────────
const HAIL_IMPACTS = [
  { pt: 1, location: "Centre of module", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 2, location: "Corner (top-left)", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 3, location: "Corner (top-right)", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 4, location: "Corner (bot-left)", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 5, location: "Corner (bot-right)", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 6, location: "Mid-top edge", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 7, location: "Mid-bottom edge", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 8, location: "Mid-left edge", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 9, location: "Mid-right edge", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 10, location: "1/4 diagonal from TL", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
  { pt: 11, location: "1/4 diagonal from BR", preVI: "PASS", postVI: "No crack", postEL: "No new defect", postInsul: "PASS", result: "PASS" },
];

export function Section15HailTest() {
  return (
    <section id="section-15" className="mb-10">
      <SectionTitle num={15} title="Hail Impact Test (MQT 17)" clause="IEC 61215-2:2021 §4.17 / IEC 62938" />
      <div className="text-sm text-muted-foreground mb-3">
        Ice ball parameters per IEC 61215-2 §4.17 Table 3: Ø 25 mm, mass 7.53 g, impact speed 23.0 m/s, kinetic energy 1.99 J. 11 impact points per module per standard map. Module at ambient temperature (20 °C). Angle of incidence: perpendicular.
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        {[
          ["Ice ball diameter", "25 mm"],
          ["Ice ball mass", "7.53 g"],
          ["Impact speed", "23.0 m/s"],
          ["Kinetic energy", "1.99 J"],
          ["Angle of incidence", "90° (normal)"],
          ["Module temperature", "20 ± 5 °C"],
          ["No. impact points", "11"],
          ["Standard reference", "IEC 62938, Table 3"],
          ["Ice ball source", "Refrigerator freezer + launcher"],
        ].map(([k, v]) => (
          <div key={k} className="bg-muted rounded p-2">
            <div className="text-muted-foreground text-xs">{k}</div>
            <div className="font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["Impact #", "Location", "Pre-VI", "Post-VI (glass)", "Post-EL", "Post-Insulation", "Result"]} />
          </thead>
          <tbody>
            {HAIL_IMPACTS.map((r) => (
              <TRow key={r.pt} cells={[r.pt, r.location, r.preVI, r.postVI, r.postEL, r.postInsul, <PassBadge key="v" result={r.result} />]} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <table className="w-full text-sm border rounded">
            <thead><TRow header cells={["Post-Hail IV Parameter", "Pre", "Post", "Change", "Result"]} /></thead>
            <tbody>
              {[
                ["Pmax (W)", "399.8", "395.9", "−0.98%", "PASS"],
                ["Isc (A)", "9.99", "9.92", "−0.70%", "PASS"],
                ["Voc (V)", "49.20", "49.05", "−0.30%", "PASS"],
                ["FF (%)", "81.3", "81.0", "−0.37%", "PASS"],
              ].map(([p, a, b, c, e]) => (
                <TRow key={p} cells={[p, a, b, c, <PassBadge key="v" result={e} />]} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
          <strong>Result: PASS</strong><br /><br />
          No front or rear glass cracking at any of the 11 impact points. No delamination. No new EL defects post-hail. Insulation resistance within specification. Pmax degradation −0.98% only.
          <br /><br />
          Module qualifies for hail resistance per IEC 61215-2 §4.17 (Ø 25 mm / 23 m/s).
        </div>
      </div>
    </section>
  );
}
