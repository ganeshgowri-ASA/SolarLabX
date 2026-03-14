// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function IS14286BISPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-BIS-2026-001"
      title="BIS Certification Test Report"
      subtitle="IS 14286 · Bureau of Indian Standards · ISI Mark · ALMM Listing"
      accent="#ea580c"
      standard="IS 14286 (BIS)"
      testConditions={[
        ["Standard", "IS 14286:2020 (Part 1 & Part 2)"],
        ["Aligned With", "IEC 61215:2021 & IEC 61730:2016"],
        ["Certification Scheme", "BIS CRS – ISI Mark (CM/L No.)"],
        ["ALMM Applicability", "MNRE Approved Module & Manufacturer List"],
        ["System Voltage", "1500 V DC"],
        ["STC Conditions", "1000 W/m², 25°C, AM 1.5G"],
        ["Test Sequence", "Full qualification (MQT 01–21)"],
        ["Lab Accreditation", "NABL TC-8192 / BIS Recognized"],
      ]}
      results={[
        { sample: "SLX-M901", pmaxBefore: "432.3", pmaxAfter: "427.5", delta: "−1.11%", riso: "5980 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Dielectric": "PASS", "Wet Leakage": "9.8 μA", "Nameplate Pmax": "430 Wp (−0.5%)" } },
        { sample: "SLX-M902", pmaxBefore: "431.9", pmaxAfter: "427.1", delta: "−1.11%", riso: "6010 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Dielectric": "PASS", "Wet Leakage": "10.2 μA", "Nameplate Pmax": "430 Wp (−0.4%)" } },
        { sample: "SLX-M903", pmaxBefore: "432.1", pmaxAfter: "427.8", delta: "−0.99%", riso: "5950 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Dielectric": "PASS", "Wet Leakage": "9.5 μA", "Nameplate Pmax": "430 Wp (−0.5%)" } },
      ]}
      criterion="BIS marking verified, Performance within tolerance, Safety tests passed"
      purpose="Evaluates PV modules for Bureau of Indian Standards (BIS) certification under IS 14286, which is the Indian adoption of IEC 61215 and IEC 61730 with additional national deviations. This certification is mandatory for modules to receive the ISI Mark and for listing on the MNRE Approved List of Models and Manufacturers (ALMM), which is required for all government-funded and grid-connected solar projects in India. The test sequence covers design qualification (Part 1) and safety qualification (Part 2), including all electrical, environmental, and mechanical tests with Indian-specific nameplate power verification and marking requirements."
      equipment={[
        "Solar Simulator: Spire 4600SLP AAA+ (NABL Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "Insulation Tester: Fluke 1555C (Cal. SLX-EQ-018, Valid: 2026-10-31)",
        "Damp Heat Chamber: Binder MKF-720 (Cal. SLX-EQ-026, Valid: 2026-12-31)",
        "Thermal Cycling Chamber: Weiss WKL-1000 (Cal. SLX-EQ-027, Valid: 2026-12-31)",
        "Mechanical Load Tester: EagleStar ML-5000 (Cal. SLX-EQ-031, Valid: 2026-11-30)",
        "HV Dielectric Tester: Associated Research HypotULTRA 7804 (Cal. SLX-EQ-061, Valid: 2026-12-31)",
        "Reference Cell: Eppley PSP-5 (Cal. SLX-EQ-003, Valid: 2026-06-30)",
      ]}
      overallDelta="−1.11%"
      extraSections={
        <>
          <div style={{ marginBottom: "12px", fontSize: "8.5pt" }}>
            <div style={{ fontSize: "11pt", fontWeight: "800", color: "#ea580c", borderBottom: "2.5px solid #ea580c", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
              BIS COMPLIANCE SUMMARY
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
              <thead>
                <tr style={{ background: "#ea580c", color: "white" }}>
                  {["Requirement", "IS 14286 Clause", "Status", "Remarks"].map(h => (
                    <th key={h} style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Nameplate Power Verification", "Cl. 4.2", "PASS", "Measured Pmax within −3% to +3% of rated"],
                  ["ISI Mark & Labelling", "Cl. 7", "PASS", "BIS logo, CM/L No., IS 14286 reference present"],
                  ["Design Qualification (Part 1)", "All MQTs", "PASS", "ΔPmax < 5%, RISO > 40 MΩ·m²"],
                  ["Safety Qualification (Part 2)", "MSTs", "PASS", "Dielectric, wet leakage, grounding verified"],
                  ["Indian Deviation – Hot Spot", "Annex A", "PASS", "Max cell temp 142°C (< 200°C limit)"],
                  ["ALMM Documentation", "MNRE Order", "SUBMITTED", "Factory audit report & test data filed"],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fafaf8" : "white", borderBottom: "1px solid #e5e7eb" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "5px 8px", textAlign: j === 0 ? "left" : "center", fontWeight: j === 0 ? "600" : "400", color: cell === "PASS" ? "#059669" : cell === "SUBMITTED" ? "#d97706" : undefined, fontSize: j === 1 ? "7.5pt" : undefined }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "4px", fontSize: "8.5pt" }}>
            <strong>BIS Certification Note:</strong> All three samples passed the complete IS 14286 (Part 1 & Part 2) qualification test sequence. Nameplate power verification confirmed rated Pmax of 430 Wp within the ±3% tolerance band. ISI marking and labelling comply with BIS requirements. ALMM documentation including factory audit report, bill of materials, and complete test data has been submitted to MNRE for Approved List listing. This report is valid for BIS certification application under the Conformity Registration Scheme (CRS).
          </div>
        </>
      }
    />
  );
}
