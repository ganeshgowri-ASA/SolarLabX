// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function IEC62915BoMPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-BOM-2026-001"
      title="BoM Change Impact Report"
      subtitle="IEC 62915 · Type Test Re-Test Matrix · Component Change Assessment"
      accent="#4f46e5"
      standard="IEC 62915"
      moduleSpecs={[
        ["Manufacturer", "Axitec Energy GmbH"],
        ["Model", "AC-430MH/144V"],
        ["Technology", "Mono-PERC"],
        ["Original Type Test Report", "TÜV-RPT-2024-4821"],
        ["BoM Revision", "Rev. C → Rev. D"],
        ["Assessment Date", "2026-03-14"],
      ]}
      testConditions={[
        ["Assessment Scope", "BoM Change Classification per IEC 62915"],
        ["Reference BoM", "Rev. C (Type-Tested, 2024-08-15)"],
        ["Proposed BoM", "Rev. D (Pending Assessment)"],
        ["Change Categories Reviewed", "Encapsulant, Backsheet, Junction Box"],
        ["Classification Method", "IEC 62915 Annex A Decision Matrix"],
        ["Original Certification Body", "TÜV Rheinland"],
      ]}
      results={[
        { sample: "Encapsulant (EVA → POE)", pmaxBefore: "Original", pmaxAfter: "Changed", delta: "Critical", riso: "N/A", visual: "Material change", elChange: "Re-test required", pass: true },
        { sample: "Backsheet (TPT → TPE)", pmaxBefore: "Original", pmaxAfter: "Changed", delta: "Major", riso: "N/A", visual: "Supplier change", elChange: "Partial re-test", pass: true },
        { sample: "Junction Box (JB-40 → JB-45)", pmaxBefore: "Original", pmaxAfter: "Changed", delta: "Minor", riso: "N/A", visual: "Rating upgrade", elChange: "Documentation only", pass: true },
      ]}
      criterion="All BoM changes classified, Re-test scope determined, No unassessed critical changes"
      purpose="This report assesses the impact of Bill of Materials (BoM) changes on the existing IEC 61215 / IEC 61730 type test certification per IEC 62915. Each component change is classified (Critical / Major / Minor) using the IEC 62915 Annex A decision matrix to determine whether full re-testing, partial re-testing, or documentation review is sufficient to maintain the type approval certificate validity."
      equipment={[
        "Documentation Review System",
        "IEC 62915 Annex A Matrix",
        "Original Type Test Certificates",
        "BoM Version Control System",
      ]}
      overallDelta="Assessed"
      extraSections={
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11pt", fontWeight: "800", color: "#4f46e5", borderBottom: "2.5px solid #4f46e5", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
            RE-TEST MATRIX (IEC 62915 ANNEX A)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "12px" }}>
            <thead>
              <tr style={{ background: "#4f46e5", color: "white" }}>
                <th style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>Test (MQT/MST)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Encapsulant (EVA→POE)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Backsheet (TPT→TPE)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Junction Box (JB-40→JB-45)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["MQT 11 – Hot Spot", "● Required", "○ Not Required", "○ Not Required"],
                ["MQT 12 – UV Preconditioning", "● Required", "● Required", "○ Not Required"],
                ["MQT 13 – Damp Heat", "● Required", "● Required", "○ Not Required"],
                ["MQT 14 – Humidity Freeze", "● Required", "● Required", "○ Not Required"],
                ["MQT 15 – Thermal Cycling", "● Required", "● Required", "○ Not Required"],
                ["MQT 16 – Mechanical Load", "○ Not Required", "○ Not Required", "○ Not Required"],
                ["MQT 17 – Hail Test", "○ Not Required", "○ Not Required", "○ Not Required"],
                ["MST 11 – Accessibility", "○ Not Required", "○ Not Required", "● Required"],
                ["MST 16 – Bypass Diode", "○ Not Required", "○ Not Required", "● Required"],
                ["MST 21 – Fire Test", "● Required", "● Required", "○ Not Required"],
                ["MST 25 – Reverse Current", "○ Not Required", "○ Not Required", "● Required"],
              ].map(([test, enc, bs, jb], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f5f3ff" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontWeight: "500" }}>{test}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: enc.startsWith("●") ? "#dc2626" : "#059669" }}>{enc}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: bs.startsWith("●") ? "#dc2626" : "#059669" }}>{bs}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: jb.startsWith("●") ? "#dc2626" : "#059669" }}>{jb}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: "7.5pt", color: "#666", padding: "6px 10px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
            <strong>Legend:</strong> ● Required – Re-test must be performed &nbsp;|&nbsp; ○ Not Required – Original test data remains valid
          </div>
        </div>
      }
    />
  );
}
