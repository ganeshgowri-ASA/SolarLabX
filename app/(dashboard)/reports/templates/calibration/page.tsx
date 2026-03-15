// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";
import { IVCurveChart } from "@/components/reports/charts/IVCurveChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";

export default function CalibrationCertificatePage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-CAL-2026-001"
      title="Equipment Calibration Certificate"
      subtitle="ISO/IEC 17025:2017 · NABL Accredited · Metrological Traceability"
      accent="#7e22ce"
      standard="ISO/IEC 17025:2017"
      moduleSpecs={[
        ["Calibration Lab", "SolarLabX Metrology Division"],
        ["Accreditation", "NABL TC-8192"],
        ["Calibration Scope", "Electrical, Thermal, Optical"],
        ["Calibration Procedure", "SOP-CAL-001 Rev. 3"],
        ["Ambient Conditions", "23.0°C ± 1.0°C, 45% RH ± 5%"],
        ["Calibration Interval", "12 months"],
      ]}
      testConditions={[
        ["Reference Standard (Irradiance)", "Eppley PSP-5 (NPL Traceable, Cal. 2025-11-20)"],
        ["Reference Standard (Temperature)", "Fluke 1524 (PTB Traceable, Cal. 2025-09-15)"],
        ["Reference Standard (Electrical)", "Keysight 34470A (NIST Traceable, Cal. 2025-10-01)"],
        ["Setpoints Verified", "5 points per range"],
        ["Repeatability Runs", "10 measurements per setpoint"],
        ["Coverage Factor", "k = 2 (95.45% confidence)"],
      ]}
      results={[
        { sample: "Sun Simulator (Spire 4600SLP)", pmaxBefore: "1000 W/m²", pmaxAfter: "999.3 W/m²", delta: "−0.07%", riso: "U = ±1.2%", visual: "No defects", elChange: "None", pass: true },
        { sample: "TC Chamber (Binder MKF-720)", pmaxBefore: "−40.0°C / +85.0°C", pmaxAfter: "−39.8°C / +85.2°C", delta: "±0.2°C", riso: "U = ±0.3°C", visual: "No defects", elChange: "None", pass: true },
        { sample: "Reference Cell (WPVS-RC-01)", pmaxBefore: "2.450 A", pmaxAfter: "2.448 A", delta: "−0.08%", riso: "U = ±0.5%", visual: "No defects", elChange: "None", pass: true },
      ]}
      criterion="Within declared accuracy, Traceability chain documented, Uncertainty calculated"
      purpose="This calibration certificate documents the metrological verification of critical laboratory equipment used in IEC 61215 / IEC 61730 / IEC 60904 testing. All calibrations are performed in accordance with ISO/IEC 17025:2017 requirements with full traceability to national or international measurement standards (NPL India, PTB Germany, NIST USA). The expanded measurement uncertainty is reported at a coverage factor of k = 2, corresponding to approximately 95.45% confidence level."
      equipment={[
        "Reference Pyranometer: Eppley PSP-5 (NPL Cal. No. NPL/SR-2025-1847)",
        "Reference Thermometer: Fluke 1524 (PTB Cal. No. PTB-T-2025-0912)",
        "Reference Multimeter: Keysight 34470A (NIST Cal. No. NIST-E-2025-2103)",
        "Reference Resistance Decade: IET Labs SRP-100K (Cal. SLX-EQ-045)",
        "Data Acquisition: NI PXIe-4302 (Cal. SLX-EQ-051)",
        "Barometric Reference: Vaisala PTB330 (Cal. SLX-EQ-048)",
      ]}
      overallDelta="Within Spec"
      testSpecificCharts={
        <>
          <div style={{ marginBottom: "16px" }}>
            <IVCurveChart />
          </div>
        </>
      }
      uncertaintySection={
        <ReportUncertaintyBudgetTable
          rows={TEST_UNCERTAINTY_CONFIGS.flasher_stc.rows}
          measurand={TEST_UNCERTAINTY_CONFIGS.flasher_stc.measurand}
          measuredValue={432.0}
          unit={TEST_UNCERTAINTY_CONFIGS.flasher_stc.unit}
          combinedUncertainty={TEST_UNCERTAINTY_CONFIGS.flasher_stc.combinedUncertainty}
          coverageFactor={TEST_UNCERTAINTY_CONFIGS.flasher_stc.coverageFactor}
          expandedUncertainty={TEST_UNCERTAINTY_CONFIGS.flasher_stc.expandedUncertainty}
          compact
        />
      }
      extraSections={
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11pt", fontWeight: "800", color: "#7e22ce", borderBottom: "2.5px solid #7e22ce", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
            METROLOGICAL TRACEABILITY CHAIN
          </div>
          <div style={{ border: "1px solid #e9d5ff", borderRadius: "6px", padding: "14px", background: "#faf5ff", fontSize: "8.5pt", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "SI Units (BIPM)", bg: "#581c87", color: "white" },
                { label: "→", bg: "transparent", color: "#7e22ce" },
                { label: "NMI (NPL / PTB / NIST)", bg: "#7e22ce", color: "white" },
                { label: "→", bg: "transparent", color: "#7e22ce" },
                { label: "SolarLabX Reference Standards", bg: "#a855f7", color: "white" },
                { label: "→", bg: "transparent", color: "#7e22ce" },
                { label: "Working Equipment (UUT)", bg: "#c084fc", color: "white" },
              ].map((item, i) => (
                item.label === "→" ? (
                  <span key={i} style={{ fontSize: "14pt", fontWeight: "800", color: item.color }}>→</span>
                ) : (
                  <span key={i} style={{ background: item.bg, color: item.color, padding: "4px 12px", borderRadius: "4px", fontWeight: "600", fontSize: "8pt" }}>{item.label}</span>
                )
              ))}
            </div>
          </div>

          <div style={{ fontSize: "11pt", fontWeight: "800", color: "#7e22ce", borderBottom: "2.5px solid #7e22ce", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
            CALIBRATION INTERVAL RECOMMENDATION
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "12px" }}>
            <thead>
              <tr style={{ background: "#7e22ce", color: "white" }}>
                <th style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>Equipment</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Current Interval</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Drift Observed</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Recommended Interval</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Next Due</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sun Simulator (Spire 4600SLP)", "12 months", "0.07% (stable)", "12 months", "2027-03-14"],
                ["TC Chamber (Binder MKF-720)", "12 months", "0.2°C (stable)", "12 months", "2027-03-14"],
                ["Reference Cell (WPVS-RC-01)", "12 months", "0.08% (stable)", "12 months", "2027-03-14"],
              ].map(([equip, current, drift, recommended, due], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#faf5ff" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontWeight: "500" }}>{equip}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{current}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: "#059669" }}>{drift}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600" }}>{recommended}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}
