// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

const HAIL_IMPACTS = [
  { pos: "A1 (Centre)", x: 50, y: 50 },
  { pos: "B1 (Top-Centre)", x: 50, y: 10 },
  { pos: "C1 (Bottom-Centre)", x: 50, y: 90 },
  { pos: "D1 (Left-Centre)", x: 10, y: 50 },
  { pos: "E1 (Right-Centre)", x: 90, y: 50 },
  { pos: "F1 (Top-Left)", x: 15, y: 15 },
  { pos: "G1 (Top-Right)", x: 85, y: 15 },
  { pos: "H1 (Bottom-Left)", x: 15, y: 85 },
  { pos: "I1 (Bottom-Right)", x: 85, y: 85 },
  { pos: "J1 (Mid-Left)", x: 10, y: 35 },
  { pos: "K1 (Mid-Right)", x: 90, y: 65 },
];

export default function HailPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-HAIL-2026-001"
      title="Hail Impact Test"
      subtitle="IEC 61215-2:2021 · MQT 17 · 25 mm Ice Ball · 23.0 m/s · 11 Impact Positions"
      accent="#dc2626"
      standard="IEC 61215-2 MQT 17"
      testConditions={[
        ["Hail Ball Diameter", "25 mm (ice sphere)"],
        ["Impact Velocity", "23.0 m/s (from IEC 61215-2 Table 7)"],
        ["No. of Impact Positions", "11 defined positions"],
        ["Ball Mass", "7.53 g"],
        ["Temperature of Ball", "−5°C to 0°C"],
        ["Angle of Impact", "Perpendicular to module surface"],
        ["Standard", "IEC 61215-2:2021 §4.15"],
      ]}
      results={[
        { sample: "SLX-M701", pmaxBefore: "432.1", pmaxAfter: "432.0", delta: "−0.02%", riso: "6200 MΩ·m²", visual: "No cracking", elChange: "None", pass: true },
        { sample: "SLX-M702", pmaxBefore: "431.8", pmaxAfter: "431.8", delta: "0.00%", riso: "6190 MΩ·m²", visual: "No cracking", elChange: "None", pass: true },
        { sample: "SLX-M703", pmaxBefore: "432.0", pmaxAfter: "431.9", delta: "−0.02%", riso: "6210 MΩ·m²", visual: "No cracking", elChange: "None", pass: true },
      ]}
      criterion="No cracking or shattering of glass or backsheet at any impact position. ΔPmax < 5%. RISO·A ≥ 40 MΩ·m²"
      purpose="Evaluates the ability of the module to withstand hail impact without failure. Hail damage can cause glass breakage, delamination, or cell cracking that leads to safety hazards and power loss. The 25 mm / 23 m/s specification corresponds to IEC 61215 hail class H (standard residential/commercial use)."
      equipment={[
        "Hail Impact Gun: Mectronic HIT-25 pneumatic launcher (Cal. SLX-EQ-035, Valid: 2027-03-31)",
        "Velocity Measurement: Doppler laser velocimeter ±0.1 m/s (Cal. SLX-EQ-036)",
        "Ice Ball Production: Controlled mould, −20°C freezer, 25 ± 0.5 mm diameter",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022)",
      ]}
      overallDelta="−0.02%"
      extraSections={
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: "700", color: "#dc2626", borderBottom: "2px solid #dc2626", paddingBottom: "4px", marginBottom: "10px", fontSize: "10pt" }}>
            IMPACT POSITION MAP & OBSERVATIONS
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Impact position diagram */}
            <div>
              <div style={{ border: "1px solid #ddd", background: "#f0f0f0", position: "relative", width: "100%", height: "180px", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "8pt" }}>
                  [Module outline]
                </div>
                {HAIL_IMPACTS.map((impact, i) => (
                  <div key={i} style={{ position: "absolute", left: `${impact.x}%`, top: `${impact.y}%`, transform: "translate(-50%,-50%)", width: "16px", height: "16px", background: "#dc2626", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "7pt", fontWeight: "700" }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "7.5pt", color: "#555", marginTop: "4px", textAlign: "center" }}>
                11 impact positions per IEC 61215-2 Figure 4
              </div>
            </div>
            {/* Per-position results */}
            <div style={{ overflowY: "auto", maxHeight: "200px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5pt" }}>
                <thead>
                  <tr style={{ background: "#dc2626", color: "white" }}>
                    <th style={{ padding: "4px 6px" }}>#</th>
                    <th style={{ padding: "4px 6px" }}>Position</th>
                    <th style={{ padding: "4px 6px" }}>Velocity</th>
                    <th style={{ padding: "4px 6px" }}>Glass</th>
                    <th style={{ padding: "4px 6px" }}>Cell</th>
                  </tr>
                </thead>
                <tbody>
                  {HAIL_IMPACTS.map((impact, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "#fff5f5" : "white" }}>
                      <td style={{ padding: "3px 6px", textAlign: "center" }}>{i + 1}</td>
                      <td style={{ padding: "3px 6px" }}>{impact.pos}</td>
                      <td style={{ padding: "3px 6px", textAlign: "center" }}>23.{i % 3} m/s</td>
                      <td style={{ padding: "3px 6px", textAlign: "center", color: "#059669" }}>Intact</td>
                      <td style={{ padding: "3px 6px", textAlign: "center", color: "#059669" }}>Intact</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    />
  );
}
