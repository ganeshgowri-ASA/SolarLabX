// @ts-nocheck
"use client";
import { EnvTestReportTemplate } from "@/components/reports/EnvTestReportTemplate";

export default function IEC62782SandPage() {
  return (
    <EnvTestReportTemplate
      reportNo="SLX-RPT-SAND-2026-001"
      title="Sand/Dust Abrasion Test"
      subtitle="IEC 62782 · DML + Abrasion · Glass Transmittance · Haze Analysis"
      accent="#b45309"
      standard="IEC 62782"
      moduleSpecs={[
        ["Manufacturer", "Axitec Energy GmbH"],
        ["Model", "AC-430MH/144V"],
        ["Technology", "Mono-PERC"],
        ["Glass Type", "3.2mm Low-Iron Tempered, AR Coated"],
        ["Rated Pmax", "430 Wp"],
        ["No. of Samples", "3 modules"],
      ]}
      testConditions={[
        ["Sand/Dust Type", "ISO 12103 A4 Coarse Test Dust"],
        ["Particle Size", "1–200 μm (mean 70 μm)"],
        ["Impact Velocity", "9.0 m/s ± 0.5 m/s"],
        ["Impact Angle", "45° ± 2° (from glass normal)"],
        ["Sand Flow Rate", "15 g/min ± 2 g/min"],
        ["Exposure Duration", "10 minutes per cycle × 5 cycles"],
        ["Total Sand Mass", "750 g per sample"],
        ["Standard Clause", "IEC 62782:2022 §7"],
      ]}
      results={[
        { sample: "SLX-M801", pmaxBefore: "432.1", pmaxAfter: "428.6", delta: "−0.81%", riso: "5870 MΩ·m²", visual: "Minor surface abrasion", elChange: "None", pass: true, extra: { transmittanceBefore: "94.2%", transmittanceAfter: "92.8%", hazeBefore: "0.8%", hazeAfter: "2.1%" } },
        { sample: "SLX-M802", pmaxBefore: "431.8", pmaxAfter: "428.2", delta: "−0.83%", riso: "5840 MΩ·m²", visual: "Minor surface abrasion", elChange: "None", pass: true, extra: { transmittanceBefore: "94.1%", transmittanceAfter: "92.5%", hazeBefore: "0.9%", hazeAfter: "2.3%" } },
        { sample: "SLX-M803", pmaxBefore: "432.0", pmaxAfter: "428.8", delta: "−0.74%", riso: "5900 MΩ·m²", visual: "Minor surface abrasion", elChange: "None", pass: true, extra: { transmittanceBefore: "94.3%", transmittanceAfter: "93.0%", hazeBefore: "0.7%", hazeAfter: "1.9%" } },
      ]}
      criterion="Transmittance loss < 2%, No glass breakage, Pmax degradation < 5%"
      purpose="This test evaluates the resistance of the PV module front glass surface to degradation caused by sand and dust particle impingement, simulating desert and arid environment field conditions. The test per IEC 62782 subjects the module glass surface to controlled abrasion using standardized test dust (ISO 12103 A4) at defined velocity and angle. Pre- and post-test measurements of glass transmittance, haze, and module electrical performance quantify the impact of abrasion on energy yield. This test is critical for modules deployed in Middle Eastern, North African, and Indian desert environments."
      equipment={[
        "Sand Abrasion Chamber: Custom SLX-SAND-01 (Cal. SLX-EQ-062, Valid: 2026-10-31)",
        "Spectrophotometer: Agilent Cary 5000 UV-Vis-NIR (Cal. SLX-EQ-055, Valid: 2026-09-15)",
        "Haze Meter: BYK Gardner Haze-Gard i (Cal. SLX-EQ-058, Valid: 2026-11-30)",
        "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001, Valid: 2026-11-30)",
        "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022, Valid: 2027-01-31)",
        "Anemometer: Testo 405i (Cal. SLX-EQ-063, Valid: 2026-08-31)",
        "Test Dust: ISO 12103 A4 Coarse (Lot: PTI-2026-C4-0189)",
      ]}
      overallDelta="−0.83%"
      extraSections={
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11pt", fontWeight: "800", color: "#b45309", borderBottom: "2.5px solid #b45309", paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
            OPTICAL MEASUREMENT RESULTS (TRANSMITTANCE & HAZE)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: "12px" }}>
            <thead>
              <tr style={{ background: "#b45309", color: "white" }}>
                <th style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>Sample</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>T% (Pre)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>T% (Post)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>ΔT%</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Haze (Pre)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Haze (Post)</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>ΔHaze</th>
                <th style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["SLX-M801", "94.2%", "92.8%", "−1.4%", "0.8%", "2.1%", "+1.3%"],
                ["SLX-M802", "94.1%", "92.5%", "−1.6%", "0.9%", "2.3%", "+1.4%"],
                ["SLX-M803", "94.3%", "93.0%", "−1.3%", "0.7%", "1.9%", "+1.2%"],
              ].map(([sample, tPre, tPost, deltaT, hPre, hPost, deltaH], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fffbeb" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontWeight: "600" }}>{sample}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{tPre}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{tPost}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600", color: "#b45309" }}>{deltaT}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{hPre}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{hPost}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "600", color: "#b45309" }}>{deltaH}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>
                    <span style={{ background: "#22c55e", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "700" }}>PASS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: "7.5pt", color: "#666", padding: "6px 10px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "4px" }}>
            <strong>Note:</strong> Maximum transmittance loss of 1.6% (SLX-M802) is within the 2% acceptance criterion. Haze increase of +1.2% to +1.4% is consistent with mild AR coating abrasion. No glass breakage, delamination, or structural damage observed on any sample. Glass surface microscopy images archived in LIMS (Job: J-2026-0162).
          </div>
        </div>
      }
    />
  );
}
