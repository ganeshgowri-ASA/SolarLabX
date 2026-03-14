// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function IEC62938SnowPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-SNOW-2026-001"
      title="Non-Uniform Snow Load Test"
      subtitle="IEC 62938 · Light & Heavy Severity · Deflection Analysis"
      accent="#2563eb"
      standard="IEC 62938"
      testConditions={[
        ["Standard", "IEC 62938:2020"],
        ["Load Type", "Non-uniform (triangular distribution)"],
        ["Light Severity Load", "2400 Pa (front face)"],
        ["Heavy Severity Load", "5400 Pa (front face)"],
        ["Load Application", "Pneumatic bladder, 3 cycles each"],
        ["Hold Duration", "1 hour per cycle at peak load"],
        ["Deflection Measurement", "LVDT at centre & quarter points"],
        ["Ambient Temperature", "−10°C ± 2°C"],
      ]}
      results={[
        { sample: "SLX-M701", pmaxBefore: "431.5", pmaxAfter: "429.8", delta: "−0.39%", riso: "6120 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Max Deflection (Light)": "8.2 mm", "Max Deflection (Heavy)": "14.6 mm", "Residual Deflection": "0.3 mm" } },
        { sample: "SLX-M702", pmaxBefore: "432.0", pmaxAfter: "430.1", delta: "−0.44%", riso: "6050 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Max Deflection (Light)": "8.5 mm", "Max Deflection (Heavy)": "15.1 mm", "Residual Deflection": "0.4 mm" } },
        { sample: "SLX-M703", pmaxBefore: "431.8", pmaxAfter: "430.3", delta: "−0.35%", riso: "6090 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Max Deflection (Light)": "7.9 mm", "Max Deflection (Heavy)": "14.3 mm", "Residual Deflection": "0.2 mm" } },
      ]}
      criterion="Pmax degradation < 5%, No structural failure, Deflection within limits"
      purpose="Evaluates the ability of PV modules to withstand non-uniform mechanical loads caused by snow accumulation as specified in IEC 62938. Unlike IEC 61215 MQT 16 which applies uniform loads, this test simulates realistic triangular snow load distribution that occurs when snow slides and accumulates asymmetrically on tilted modules. Both light severity (2400 Pa) and heavy severity (5400 Pa) loading profiles are applied to assess structural integrity, electrical performance retention, and permanent deformation under field-representative snow conditions."
      equipment={[
        "Mechanical Load Tester: EagleStar ML-5000 pneumatic (NABL Cal. SLX-EQ-031, Valid: 2026-11-30)",
        "LVDT Displacement Sensors: HBM WA/20 mm ×4 (Cal. SLX-EQ-032, Valid: 2026-10-31)",
        "Pressure Controller: Parker Hannifin PCD-P3 (Cal. SLX-EQ-033, Valid: 2027-01-15)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "Climate Chamber: Weiss WKL-1000 for −10°C conditioning (Cal. SLX-EQ-034, Valid: 2026-12-31)",
      ]}
      overallDelta="−0.44%"
      extraSections={
        <>
          <div style={{ marginBottom: "12px", fontSize: "8.5pt" }}>
            <div style={{ fontSize: "11pt", fontWeight: "800", color: "#2563eb", borderBottom: "2.5px solid #2563eb", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
              DEFLECTION ANALYSIS
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
              <thead>
                <tr style={{ background: "#2563eb", color: "white" }}>
                  {["Sample", "Light (2400 Pa) Deflection", "Heavy (5400 Pa) Deflection", "Residual Deflection", "Frame Integrity", "Glass Crack"].map(h => (
                    <th key={h} style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["SLX-M701", "8.2 mm", "14.6 mm", "0.3 mm", "OK", "None"],
                  ["SLX-M702", "8.5 mm", "15.1 mm", "0.4 mm", "OK", "None"],
                  ["SLX-M703", "7.9 mm", "14.3 mm", "0.2 mm", "OK", "None"],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fafaf8" : "white", borderBottom: "1px solid #e5e7eb" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "5px 8px", textAlign: "center", fontWeight: j === 0 ? "600" : "400", color: cell === "OK" || cell === "None" ? "#059669" : undefined }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "4px", fontSize: "8.5pt" }}>
            <strong>Note:</strong> Maximum deflection under heavy severity (5400 Pa) was 15.1 mm at module centre (SLX-M702), well within the allowable limit for this frame design. Residual deflection after load removal was ≤ 0.4 mm across all samples, confirming elastic behaviour with no permanent deformation. No glass fracture, cell cracking (per EL), or frame distortion was observed.
          </div>
        </>
      }
    />
  );
}
