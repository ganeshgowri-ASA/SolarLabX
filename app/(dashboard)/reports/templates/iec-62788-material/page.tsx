// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function IEC62788MaterialPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-MAT-2026-001"
      title="Material Testing Report"
      subtitle="Backsheet Adhesion · Encapsulant Gel Content · UV Cut-off Wavelength"
      accent="#0d9488"
      standard="IEC 62788"
      testConditions={[
        ["Peel Test Standard", "IEC 62788-1-4"],
        ["Peel Speed", "100 mm/min, 180° peel angle"],
        ["Gel Content Standard", "IEC 62788-1-2"],
        ["Extraction Solvent", "Xylene, 24 h reflux"],
        ["UV Cut-off Standard", "IEC 62788-7-2"],
        ["Spectrophotometer Range", "200–800 nm"],
        ["Ambient Temperature", "23°C ± 2°C"],
        ["Relative Humidity", "50% ± 10% RH"],
      ]}
      results={[
        { sample: "SLX-MAT-001", pmaxBefore: "—", pmaxAfter: "—", delta: "—", riso: "—", visual: "No defects", elChange: "None", pass: true, extra: { "Peel Strength": "68.2 N/m", "Failure Mode": "Cohesive (encapsulant)", "Gel Content": "87.3%", "UV Cut-off λ": "352 nm" } },
        { sample: "SLX-MAT-002", pmaxBefore: "—", pmaxAfter: "—", delta: "—", riso: "—", visual: "No defects", elChange: "None", pass: true, extra: { "Peel Strength": "71.5 N/m", "Failure Mode": "Cohesive (encapsulant)", "Gel Content": "85.9%", "UV Cut-off λ": "349 nm" } },
        { sample: "SLX-MAT-003", pmaxBefore: "—", pmaxAfter: "—", delta: "—", riso: "—", visual: "No defects", elChange: "None", pass: true, extra: { "Peel Strength": "65.8 N/m", "Failure Mode": "Cohesive (encapsulant)", "Gel Content": "88.1%", "UV Cut-off λ": "355 nm" } },
      ]}
      criterion="Gel content ≥ 70% (EVA), Peel strength ≥ 40 N/m, UV cut-off ≤ 360 nm"
      purpose="Characterises critical PV module bill-of-material properties in accordance with the IEC 62788 series. Backsheet adhesion peel testing (IEC 62788-1-4) verifies interfacial bond integrity between encapsulant and backsheet layers. Encapsulant gel content measurement (IEC 62788-1-2) confirms the degree of cross-linking in EVA after lamination. UV cut-off wavelength determination (IEC 62788-7-2) ensures the encapsulant or front-sheet provides adequate UV filtration to protect the cell and backsheet from photodegradation."
      equipment={[
        "Universal Testing Machine: Instron 5944, 2 kN load cell (NABL Cal. SLX-EQ-041, Valid: 2026-12-15)",
        "Soxhlet Extraction Apparatus: Gerhardt SE-414 (Cal. SLX-EQ-042, Valid: 2027-01-31)",
        "Analytical Balance: Mettler Toledo XPR205, 0.01 mg resolution (Cal. SLX-EQ-043, Valid: 2026-09-30)",
        "UV-Vis Spectrophotometer: Shimadzu UV-2600i (Cal. SLX-EQ-044, Valid: 2026-11-30)",
        "Precision Cutter: CEAST SmartCut for specimen preparation (Cal. SLX-EQ-045, Valid: 2026-08-31)",
      ]}
      overallDelta="N/A"
      extraSections={
        <>
          <div style={{ marginBottom: "12px", fontSize: "8.5pt" }}>
            <div style={{ fontSize: "11pt", fontWeight: "800", color: "#0d9488", borderBottom: "2.5px solid #0d9488", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
              MATERIAL TEST DETAIL
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
              <thead>
                <tr style={{ background: "#0d9488", color: "white" }}>
                  {["Sample", "Peel Strength (N/m)", "Failure Mode", "Initial Mass (g)", "Post-Extraction Mass (g)", "Gel Content (%)", "UV Cut-off λ (nm)"].map(h => (
                    <th key={h} style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["SLX-MAT-001", "68.2", "Cohesive", "1.2045", "1.0514", "87.3", "352"],
                  ["SLX-MAT-002", "71.5", "Cohesive", "1.1983", "1.0291", "85.9", "349"],
                  ["SLX-MAT-003", "65.8", "Cohesive", "1.2102", "1.0661", "88.1", "355"],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fafaf8" : "white", borderBottom: "1px solid #e5e7eb" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "5px 8px", textAlign: "center", fontWeight: j === 0 ? "600" : "400" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "4px", fontSize: "8.5pt" }}>
            <strong>Observation:</strong> All three samples exhibited cohesive failure mode in the encapsulant layer during peel testing, indicating excellent backsheet-to-encapsulant adhesion. Gel content values of 85.9–88.1% confirm proper EVA cross-linking well above the 70% minimum. UV cut-off wavelengths of 349–355 nm are within specification, providing adequate UV protection for long-term field deployment.
          </div>
        </>
      }
    />
  );
}
