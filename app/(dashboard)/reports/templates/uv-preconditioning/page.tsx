// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";
import { StabilizationDosageChart } from "@/components/reports/charts/StabilizationDosageChart";
import { PrePostComparisonChart } from "@/components/reports/charts/PrePostComparisonChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";

export default function UVPreconditioningPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-UV-2026-001"
      title="UV Preconditioning Test"
      subtitle="IEC 61215-2:2021 · MQT 10 · 15 kWh/m² UV Dose · 280–400 nm · 60°C Module Temperature"
      accent="#6d28d9"
      standard="IEC 61215-2 MQT 10"
      testConditions={[
        ["UV Wavelength Range", "280 – 400 nm"],
        ["UV Dose (280–320 nm)", "≥ 5 kWh/m²"],
        ["UV Dose (280–400 nm)", "≥ 15 kWh/m²"],
        ["Module Temperature", "60°C ± 5°C"],
        ["UV Source", "1000 W Xenon arc lamp (filtered)"],
        ["Irradiance (UV)", "100 ± 20 W/m² (280–400 nm)"],
        ["Standard", "IEC 61215-2:2021 §4.10"],
      ]}
      results={[
        { sample: "SLX-M801", pmaxBefore: "432.1", pmaxAfter: "431.2", delta: "−0.21%", riso: "6220 MΩ·m²", visual: "No discolouration", elChange: "None", pass: true },
        { sample: "SLX-M802", pmaxBefore: "431.8", pmaxAfter: "430.9", delta: "−0.21%", riso: "6190 MΩ·m²", visual: "No discolouration", elChange: "None", pass: true },
        { sample: "SLX-M803", pmaxBefore: "432.0", pmaxAfter: "431.1", delta: "−0.21%", riso: "6210 MΩ·m²", visual: "No discolouration", elChange: "None", pass: true },
      ]}
      criterion="ΔPmax < 5%, no delamination, no cracking, no significant discolouration, RISO·A ≥ 40 MΩ·m²"
      purpose="UV preconditioning stabilises photo-degradable materials (encapsulants such as EVA, POE) before climate stress tests. The UV test also independently verifies that module materials are UV-stable. Modules that discolour or delaminate during UV preconditioning may fail subsequent damp heat and thermal cycling tests due to compromised encapsulant integrity."
      equipment={[
        "UV Test Chamber: Atlas UV2000 Xenon Arc (NABL Cal. SLX-EQ-027, Valid: 2026-10-31)",
        "UV Radiometer: Solarlight PMA2100 (Cal. SLX-EQ-028, Valid: 2026-12-31)",
        "Module Temperature Sensor: PT100 4-wire (Cal. SLX-EQ-029, Valid: 2026-12-31)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "Colorimeter: Konica Minolta CM-700d (for discolouration measurement, Cal. SLX-EQ-032)",
      ]}
      overallDelta="−0.21%"
      testSpecificCharts={
        <>
          <div style={{ marginBottom: "16px" }}>
            <StabilizationDosageChart />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <PrePostComparisonChart
              data={[
                { sampleId: "SLX-M801", preValue: 432.1, postValue: 431.2 },
                { sampleId: "SLX-M802", preValue: 431.8, postValue: 430.9 },
                { sampleId: "SLX-M803", preValue: 432.0, postValue: 431.1 },
              ]}
              parameter="Pmax" unit="W" threshold={5} thresholdType="max_degradation_pct"
            />
          </div>
        </>
      }
      uncertaintySection={
        <ReportUncertaintyBudgetTable
          rows={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.rows}
          measurand={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.measurand}
          measuredValue={432.0}
          unit={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.unit}
          combinedUncertainty={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.combinedUncertainty}
          coverageFactor={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.coverageFactor}
          expandedUncertainty={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.expandedUncertainty}
          compact
        />
      }
      extraSections={
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontWeight: "700", color: "#6d28d9", borderBottom: "2px solid #6d28d9", paddingBottom: "4px", marginBottom: "10px", fontSize: "10pt" }}>
            UV DOSE MONITORING & COLORIMETRY
          </div>
          <div className="grid grid-cols-2 gap-4" style={{ fontSize: "8.5pt" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px", background: "#faf5ff" }}>
              <div style={{ fontWeight: "700", color: "#6d28d9", marginBottom: "6px" }}>UV Dose Delivered</div>
              <table style={{ width: "100%", fontSize: "8pt", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "#6d28d9", color: "white" }}><th style={{ padding: "3px 6px" }}>Band</th><th style={{ padding: "3px 6px" }}>Target</th><th style={{ padding: "3px 6px" }}>Delivered</th><th style={{ padding: "3px 6px" }}>Status</th></tr></thead>
                <tbody>
                  {[["280–320 nm", "≥ 5 kWh/m²", "5.2 kWh/m²", "OK"], ["280–400 nm", "≥ 15 kWh/m²", "15.4 kWh/m²", "OK"]].map(([b, t, d, s], i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "3px 6px" }}>{b}</td>
                      <td style={{ padding: "3px 6px" }}>{t}</td>
                      <td style={{ padding: "3px 6px", fontWeight: "600" }}>{d}</td>
                      <td style={{ padding: "3px 6px", color: "#059669" }}>{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px", background: "#faf5ff" }}>
              <div style={{ fontWeight: "700", color: "#6d28d9", marginBottom: "6px" }}>Colorimetry (ΔE*)</div>
              <table style={{ width: "100%", fontSize: "8pt", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "#6d28d9", color: "white" }}><th style={{ padding: "3px 6px" }}>Sample</th><th style={{ padding: "3px 6px" }}>ΔL*</th><th style={{ padding: "3px 6px" }}>Δa*</th><th style={{ padding: "3px 6px" }}>ΔE*</th><th style={{ padding: "3px 6px" }}>Verdict</th></tr></thead>
                <tbody>
                  {[["SLX-M801", "+0.2", "+0.1", "0.3"], ["SLX-M802", "+0.3", "+0.1", "0.4"], ["SLX-M803", "+0.2", "+0.0", "0.3"]].map(([s, l, a, e], i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "3px 6px" }}>{s}</td>
                      <td style={{ padding: "3px 6px" }}>{l}</td>
                      <td style={{ padding: "3px 6px" }}>{a}</td>
                      <td style={{ padding: "3px 6px", fontWeight: "600" }}>{e}</td>
                      <td style={{ padding: "3px 6px", color: "#059669" }}>Negligible</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: "7.5pt", color: "#666", marginTop: "4px" }}>ΔE* &lt; 3 = imperceptible discolouration</div>
            </div>
          </div>
        </div>
      }
    />
  );
}
