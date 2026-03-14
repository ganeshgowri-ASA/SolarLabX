// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function UncertaintyBudgetPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-UNC-2026-001"
      title="Measurement Uncertainty Budget"
      subtitle="GUM (JCGM 100:2008) · Power Measurement at STC · k=2 Coverage"
      accent="#0891b2"
      standard="GUM (JCGM 100:2008)"
      moduleSpecs={[
        ["Measurand", "Maximum Power (Pmax) at STC"],
        ["STC Conditions", "1000 W/m², 25°C, AM1.5G"],
        ["Module Under Test", "AC-430MH/144V (Mono-PERC)"],
        ["Measurement Method", "I-V Curve Tracing (IEC 60904-1)"],
        ["Coverage Factor", "k = 2 (95.45% confidence)"],
        ["GUM Methodology", "JCGM 100:2008 (ISO/IEC Guide 98-3)"],
      ]}
      testConditions={[
        ["Simulator Class", "AAA+ (IEC 60904-9 Ed.3)"],
        ["Reference Cell", "WPVS-RC-01 (PTB Calibrated)"],
        ["I-V Tracer", "Spire 4600SLP (NABL Cal.)"],
        ["Temperature Sensor", "Pt100 (±0.1°C, Class AA)"],
        ["Irradiance Monitor", "Si Reference Cell (±0.5%)"],
        ["Repeatability Runs", "25 consecutive measurements"],
      ]}
      results={[
        { sample: "Irradiance Setting", pmaxBefore: "±0.50%", pmaxAfter: "0.98", delta: "0.245%", riso: "Type B", visual: "Rectangular", elChange: "Dominant", pass: true },
        { sample: "Temperature Correction", pmaxBefore: "±0.30%", pmaxAfter: "0.45", delta: "0.068%", riso: "Type B", visual: "Normal", elChange: "Secondary", pass: true },
        { sample: "Spectral Mismatch", pmaxBefore: "±0.40%", pmaxAfter: "0.72", delta: "0.144%", riso: "Type B", visual: "Rectangular", elChange: "Significant", pass: true },
        { sample: "I-V Measurement Repeatability", pmaxBefore: "±0.15%", pmaxAfter: "1.00", delta: "0.150%", riso: "Type A", visual: "Normal", elChange: "Minor", pass: true },
        { sample: "Reference Cell Calibration", pmaxBefore: "±0.35%", pmaxAfter: "0.85", delta: "0.149%", riso: "Type B", visual: "Normal", elChange: "Significant", pass: true },
        { sample: "Data Acquisition / DAQ", pmaxBefore: "±0.10%", pmaxAfter: "0.58", delta: "0.029%", riso: "Type B", visual: "Rectangular", elChange: "Minor", pass: true },
      ]}
      criterion="Expanded uncertainty (k=2) documented, All sources identified, Coverage factor stated"
      purpose="This report documents the complete measurement uncertainty budget for maximum power (Pmax) determination at Standard Test Conditions (STC) per the GUM methodology (JCGM 100:2008). All significant sources of uncertainty are identified, quantified as Type A (statistical) or Type B (other means), and combined using the law of propagation of uncertainty. The expanded uncertainty is reported with coverage factor k = 2, providing approximately 95.45% confidence level as required by ISO/IEC 17025:2017 for accredited test results."
      equipment={[
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001)",
        "Reference Cell: WPVS-RC-01 (PTB Cal. No. PTB-PV-2025-1192)",
        "I-V Tracer: Spire integrated (Cal. SLX-EQ-002)",
        "Pt100 Temperature Sensor: Class AA (Cal. SLX-EQ-015)",
        "Data Acquisition: NI PXIe-4302 (Cal. SLX-EQ-051)",
        "Spectroradiometer: EKO MS-711 (Cal. SLX-EQ-038)",
      ]}
      overallDelta="U = ±1.8%"
      extraSections={
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11pt", fontWeight: "800", color: "#0891b2", borderBottom: "2.5px solid #0891b2", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
            UNCERTAINTY BUDGET SUMMARY
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "12px" }}>
            <thead>
              <tr style={{ background: "#0891b2", color: "white" }}>
                <th style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>Uncertainty Source (xi)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Type</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Distribution</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Value (±%)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Divisor</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>ci</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>u(xi) (%)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Contribution (%²)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Irradiance Setting", "B", "Rectangular", "0.50", "√3", "0.98", "0.283", "0.0770"],
                ["Temperature Correction", "B", "Normal", "0.30", "2", "0.45", "0.068", "0.0009"],
                ["Spectral Mismatch", "B", "Rectangular", "0.40", "√3", "0.72", "0.166", "0.0143"],
                ["I-V Repeatability", "A", "Normal (n=25)", "0.15", "√25", "1.00", "0.030", "0.0009"],
                ["Reference Cell Cal.", "B", "Normal", "0.35", "2", "0.85", "0.149", "0.0159"],
                ["DAQ Resolution", "B", "Rectangular", "0.10", "√3", "0.58", "0.033", "0.0006"],
                ["Spatial Non-uniformity", "B", "Rectangular", "0.60", "√3", "0.90", "0.312", "0.0789"],
              ].map(([source, type, dist, val, div, ci, uxi, contrib], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#ecfeff" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontWeight: "500" }}>{source}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600", color: type === "A" ? "#0891b2" : "#7c3aed" }}>{type}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontSize: "7.5pt" }}>{dist}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{val}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{div}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{ci}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600" }}>{uxi}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{contrib}</td>
                </tr>
              ))}
              <tr style={{ background: "#0891b2", color: "white", fontWeight: "700" }}>
                <td colSpan={6} style={{ padding: "5px 8px", textAlign: "right" }}>Combined Standard Uncertainty uc(Pmax):</td>
                <td style={{ padding: "5px 8px", textAlign: "center" }}>0.434%</td>
                <td style={{ padding: "5px 8px", textAlign: "center" }}>—</td>
              </tr>
              <tr style={{ background: "#065666", color: "white", fontWeight: "700" }}>
                <td colSpan={6} style={{ padding: "5px 8px", textAlign: "right" }}>Expanded Uncertainty U (k=2, 95.45%):</td>
                <td colSpan={2} style={{ padding: "5px 8px", textAlign: "center", fontSize: "10pt" }}>±0.87%</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: "7.5pt", color: "#666", padding: "6px 10px", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "4px" }}>
            <strong>Note:</strong> The reported expanded uncertainty U = ±0.87% (k=2) applies to the Pmax measurement at STC. This uncertainty does not include contributions from module-to-module variability or long-term drift. The dominant contributor is spatial non-uniformity of the solar simulator (40.6% of variance).
          </div>
        </div>
      }
    />
  );
}
