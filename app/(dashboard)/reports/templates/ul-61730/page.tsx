// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function UL61730Page() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-UL-2026-001"
      title="UL Safety Qualification"
      subtitle="UL 61730 / UL 1703 · North American Safety · Fire Class A · NEC 690"
      accent="#dc2626"
      standard="UL 61730 / UL 1703"
      testConditions={[
        ["Standard", "UL 61730-1/-2 & UL 1703"],
        ["Fire Classification", "Type 1 (Class A fire rating)"],
        ["System Voltage", "1500 V DC"],
        ["Dielectric Withstand", "3540 V AC, 1 min"],
        ["Impulse Voltage", "8 kV, 1.2/50 μs"],
        ["Ground Continuity", "2× rated current, 2 min"],
        ["Wet Leakage Current", "Surface wetting per UL 61730-2"],
        ["Spread of Flame", "Burning brand per UL 790 / UL 1703"],
      ]}
      results={[
        { sample: "SLX-M801", pmaxBefore: "430.5", pmaxAfter: "430.2", delta: "−0.07%", riso: "7200 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Dielectric": "PASS – No breakdown", "Ground Cont.": "0.04 Ω", "Wet Leakage": "12.3 μA", "Fire Class": "A" } },
        { sample: "SLX-M802", pmaxBefore: "431.0", pmaxAfter: "430.7", delta: "−0.07%", riso: "7150 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Dielectric": "PASS – No breakdown", "Ground Cont.": "0.05 Ω", "Wet Leakage": "11.8 μA", "Fire Class": "A" } },
        { sample: "SLX-M803", pmaxBefore: "430.8", pmaxAfter: "430.5", delta: "−0.07%", riso: "7180 MΩ·m²", visual: "No defects", elChange: "None", pass: true, extra: { "Dielectric": "PASS – No breakdown", "Ground Cont.": "0.03 Ω", "Wet Leakage": "13.1 μA", "Fire Class": "A" } },
      ]}
      criterion="All UL safety tests passed, Fire classification achieved, Ground continuity < 0.1 Ω"
      purpose="Evaluates the safety of PV modules for the North American market in accordance with UL 61730 and the legacy UL 1703 standard. This certification ensures compliance with the National Electrical Code (NEC 690) and local building codes. Key safety evaluations include dielectric withstand to verify insulation integrity at system voltage, impulse voltage to simulate lightning-induced transients, ground continuity to verify protective earthing, wet leakage current to confirm electrical safety under rain conditions, and fire classification (UL 790 / UL 1703 spread of flame) to establish the roof-mount fire rating required by building authorities."
      equipment={[
        "HV Dielectric Tester: Associated Research HypotULTRA 7804 (NABL Cal. SLX-EQ-061, Valid: 2026-12-31)",
        "Impulse Voltage Generator: Haefely PSURGE 30 (Cal. SLX-EQ-062, Valid: 2027-02-28)",
        "Ground Continuity Tester: Chroma 19032 (Cal. SLX-EQ-063, Valid: 2026-10-31)",
        "Wet Leakage Current System: Custom SLX-WLC-01 (Cal. SLX-EQ-064, Valid: 2026-11-30)",
        "Fire Test Apparatus: UL 790 spread-of-flame deck (Cal. SLX-EQ-065, Valid: 2026-09-30)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
      ]}
      overallDelta="−0.07%"
      extraSections={
        <>
          <div style={{ marginBottom: "12px", fontSize: "8.5pt" }}>
            <div style={{ fontSize: "11pt", fontWeight: "800", color: "#dc2626", borderBottom: "2.5px solid #dc2626", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
              UL SAFETY TEST DETAIL
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px" }}>
              <thead>
                <tr style={{ background: "#dc2626", color: "white" }}>
                  {["Sample", "Dielectric (3540 V AC)", "Impulse (8 kV)", "Ground Cont. (Ω)", "Wet Leakage (μA)", "Fire Class", "Result"].map(h => (
                    <th key={h} style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["SLX-M801", "No breakdown", "No flashover", "0.04", "12.3", "A", "PASS"],
                  ["SLX-M802", "No breakdown", "No flashover", "0.05", "11.8", "A", "PASS"],
                  ["SLX-M803", "No breakdown", "No flashover", "0.03", "13.1", "A", "PASS"],
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fafaf8" : "white", borderBottom: "1px solid #e5e7eb" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "5px 8px", textAlign: "center", fontWeight: j === 0 ? "600" : "400", color: cell === "PASS" || cell === "No breakdown" || cell === "No flashover" ? "#059669" : undefined }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginBottom: "12px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "4px", fontSize: "8.5pt" }}>
            <strong>UL Compliance Note:</strong> All three samples passed the complete UL 61730 / UL 1703 safety test sequence. Dielectric withstand at 3540 V AC (1 min) showed no insulation breakdown. Ground continuity measured 0.03–0.05 Ω, well below the 0.1 Ω limit. Wet leakage currents of 11.8–13.1 μA are within the allowable threshold. Fire classification per UL 790 confirmed Class A rating for all samples. Modules are suitable for NEC 690 compliant installations in the United States and Canada.
          </div>
        </>
      }
    />
  );
}
