// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function DampHeatPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-DH-2026-001"
      title="Damp Heat Test"
      subtitle="IEC 61215-2:2021 · MQT 13 (DH1000) · 1000 Hours · 85°C / 85% RH"
      accent="#065f46"
      standard="IEC 61215-2 MQT 13"
      testConditions={[
        ["Temperature", "85°C ± 2°C"],
        ["Relative Humidity", "85% RH ± 5%"],
        ["Duration", "1000 hours"],
        ["Ramp Rate", "≤ 100°C/hr, ≤ 10%RH/hr"],
        ["Monitoring", "Every 4 hours"],
        ["Standard", "IEC 61215-2:2021 §4.12"],
      ]}
      results={[
        { sample: "SLX-M501", pmaxBefore: "432.1", pmaxAfter: "427.2", delta: "−1.13%", riso: "5890 MΩ·m²", visual: "Minor discolouration", elChange: "None", pass: true },
        { sample: "SLX-M502", pmaxBefore: "431.8", pmaxAfter: "427.0", delta: "−1.11%", riso: "5920 MΩ·m²", visual: "Minor discolouration", elChange: "None", pass: true },
        { sample: "SLX-M503", pmaxBefore: "432.0", pmaxAfter: "427.3", delta: "−1.09%", riso: "5910 MΩ·m²", visual: "Minor discolouration", elChange: "None", pass: true },
      ]}
      criterion="ΔPmax < 5%, RISO·A ≥ 40 MΩ·m², no delamination, bubbling, or circuit failure after 1000 hours at 85°C/85%RH"
      purpose="Evaluates the ability of the module to withstand the effects of long-term penetration of humidity (moisture). High humidity at elevated temperature accelerates the degradation of encapsulant, interconnections, and electrical insulation. The DH1000 test is one of the most critical tests for predicting field lifetime in tropical and sub-tropical climates."
      equipment={[
        "Damp Heat Chamber: Binder MKF-720 (NABL Cal. SLX-EQ-026, Valid: 2026-12-31)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "Insulation Tester: Fluke 1555C (Cal. SLX-EQ-018, Valid: 2026-10-31)",
        "Reference Cell: Eppley PSP-5 (Cal. SLX-EQ-003, Valid: 2026-06-30)",
      ]}
      overallDelta="−1.13%"
      extraSections={
        <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "4px", fontSize: "8.5pt" }}>
          <strong>Note on Discolouration:</strong> Minor yellowing observed on encapsulant edges (all 3 samples) consistent with typical EVA thermal degradation. Discolouration is considered cosmetic and does not affect safety or electrical performance. Power degradation of ~1.1% is within normal range for DH1000 for Mono-PERC technology.
        </div>
      }
    />
  );
}
