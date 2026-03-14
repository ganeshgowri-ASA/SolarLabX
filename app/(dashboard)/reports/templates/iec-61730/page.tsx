// @ts-nocheck
"use client";

const REPORT_NO = "SLX-RPT-IEC61730-2026-001";
const ACCENT = "#7c2d12";

const MST_RESULTS = [
  { id: "MST01", name: "Visual Inspection", result: "PASS", value: "No relevant defects", criterion: "Per IEC 61730-1 Annex", date: "2026-01-18" },
  { id: "MST02", name: "Accessibility Test", result: "PASS", value: "≥ 2 mm creepage", criterion: "≥ 2 mm", date: "2026-01-18" },
  { id: "MST03", name: "Cut Susceptibility", result: "PASS", value: "No penetration", criterion: "No penetration", date: "2026-01-19" },
  { id: "MST04", name: "Continuity of Bond", result: "PASS", value: "R_bond = 0.042 Ω", criterion: "< 0.1 Ω", date: "2026-01-20" },
  { id: "MST05", name: "Impulse Voltage", result: "PASS", value: "6000 V pk, 1.2/50 µs", criterion: "No breakdown", date: "2026-01-21" },
  { id: "MST06", name: "Ground Continuity", result: "PASS", value: "R = 0.038 Ω (max)", criterion: "< 0.1 Ω", date: "2026-01-22" },
  { id: "MST07", name: "Wet Hi-Pot Test", result: "PASS", value: "2200 V AC, 2 min", criterion: "No breakdown", date: "2026-01-23" },
  { id: "MST08", name: "Dielectric Withstand", result: "PASS", value: "2×Vsys + 1000 V = 4000 V", criterion: "No dielectric breakdown", date: "2026-01-24" },
  { id: "MST09", name: "Insulation Test", result: "PASS", value: "RISO·A = 6200 MΩ·m²", criterion: "≥ 40 MΩ·m²", date: "2026-01-25" },
  { id: "MST10", name: "Hot Spot Endurance", result: "PASS", value: "ΔT_max = 18°C", criterion: "No critical defects", date: "2026-02-02" },
  { id: "MST11", name: "Bypass Diode Thermal", result: "PASS", value: "T_junction = 68°C", criterion: "≤ 128°C", date: "2026-02-03" },
  { id: "MST12", name: "Mechanical Load", result: "PASS", value: "5400 Pa static, 3 cycles", criterion: "No cracking, ΔPmax < 5%", date: "2026-02-22" },
  { id: "MST13", name: "Salt Mist Corrosion", result: "PASS", value: "ΔPmax = −0.7%", criterion: "< 5%, no corrosion", date: "2026-03-01" },
  { id: "MST14", name: "Robustness of Terminations", result: "PASS", value: "No failures", criterion: "No damage", date: "2026-02-19" },
  { id: "MST15", name: "Module Breakage", result: "PASS", value: "No penetration through module", criterion: "No escape of hazardous material", date: "2026-02-28" },
];

export default function IEC61730Page() {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-container { box-shadow: none !important; max-width: 100% !important; }
          .page-break { break-before: page; }
          @page { size: A4; margin: 15mm; }
          thead { display: table-header-group; }
        }
      `}</style>
      <div className="no-print flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold">IEC 61730:2023 Safety Qualification Report</h1>
          <p className="text-sm text-gray-500">PV Module Safety Qualification · All 15 MSTs</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">🖨 Print / Save PDF</button>
        </div>
      </div>

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9.5pt" }}>
        <div style={{ padding: "15mm 20mm" }}>
          <ReportCover
            reportNo={REPORT_NO} accent={ACCENT}
            title="Safety Qualification Test"
            subtitle="IEC 61730-1:2023 (Requirements) · IEC 61730-2:2023 (Testing) · Application Class A – 1500 V System Voltage"
            customer="Axitec Energy GmbH & Co. KG" module="AC-430MH/144V · 430 Wp · Application Class A (SCA)" samples="3 modules"
          />

          <div className="page-break" />

          <SH title="SAFETY QUALIFICATION TEST RESULTS – ALL MSTs" color={ACCENT} />
          <div style={{ marginBottom: "10px", padding: "8px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "4px", fontSize: "8pt" }}>
            <strong>Application Class:</strong> Class A (SCA) · <strong>Maximum System Voltage:</strong> 1500 V DC · <strong>Fire Safety Class:</strong> Class C (highest)
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
            <thead>
              <tr style={{ background: ACCENT, color: "white" }}>
                {["Test ID", "Safety Test Name", "Measured Value / Observation", "Pass Criterion", "Date", "Result"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MST_RESULTS.map((t, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff7ed" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontFamily: "monospace", fontSize: "7.5pt" }}>{t.id}</td>
                  <td style={{ padding: "4px 8px", fontWeight: "500" }}>{t.name}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{t.value}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{t.criterion}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{t.date}</td>
                  <td style={{ padding: "4px 8px" }}><PB pass={t.result === "PASS"} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="page-break" />

          <SH title="ELECTRICAL SAFETY MEASUREMENTS" color={ACCENT} />
          <div className="grid grid-cols-2 gap-4" style={{ fontSize: "8.5pt" }}>
            {[
              { label: "Dielectric Withstand (MST08)", items: [["Applied Voltage", "4000 V AC (2×Vsys + 1000)"], ["Duration", "60 seconds"], ["Test Configuration", "All conductors shorted, frame earthed"], ["Outcome", "No flashover, breakdown, or surface tracking"]] },
              { label: "Wet Hi-Pot (MST07)", items: [["Applied Voltage", "2200 V AC"], ["Duration", "2 minutes"], ["Water Conductivity", "< 10 µS/cm"], ["Outcome", "No flashover, leakage current < 50 µA"]] },
              { label: "Impulse Voltage (MST05)", items: [["Peak Voltage", "6000 V (1.2/50 µs waveform)"], ["No. of Impulses", "3 positive, 3 negative"], ["Polarity", "Both polarities"], ["Outcome", "No insulation breakdown"]] },
              { label: "Bypass Diode Thermal (MST11)", items: [["Max Junction Temp", "68°C"], ["Criterion", "≤ T_max + 128°C"], ["Test Current", "1.25 × Isc"], ["Duration", "1 hour"]] },
            ].map(({ label, items }) => (
              <div key={label} style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
                <div style={{ fontWeight: "700", color: ACCENT, marginBottom: "8px", fontSize: "9pt", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>{label}</div>
                {items.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
                    <span style={{ color: "#666", minWidth: "130px" }}>{k}:</span>
                    <span style={{ fontWeight: "500" }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <SH title="COMPLIANCE STATEMENT" color={ACCENT} />
          <div style={{ background: "#fff7ed", border: `2px solid ${ACCENT}`, borderRadius: "6px", padding: "14px", fontSize: "8.5pt" }}>
            <p style={{ fontWeight: "700", color: ACCENT, marginBottom: "8px", fontSize: "10pt" }}>✓ SAFETY QUALIFICATION: PASS – IEC 61730:2023</p>
            <p>The module type <strong>Axitec AC-430MH/144V</strong> has successfully passed all applicable safety qualification tests per IEC 61730-2:2023. The module complies with the requirements of IEC 61730-1:2023 for Application Class A (SCA) at 1500 V maximum system voltage. The module is deemed safe for installation and operation in utility-scale and commercial PV systems.</p>
          </div>

          <SignatureBlock accent={ACCENT} reportNo={REPORT_NO} />
        </div>
      </div>
    </>
  );
}

function ReportCover({ reportNo, accent, title, subtitle, customer, module: mod, samples }) {
  return (
    <>
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "20pt", fontWeight: "800", color: accent }}>☀ SolarLabX</div>
          <div style={{ fontSize: "8pt", color: "#666" }}>NABL TC-8192 · ISO/IEC 17025:2017 · Pune, India</div>
        </div>
        <div style={{ textAlign: "right", fontSize: "8pt" }}>
          <div style={{ fontFamily: "monospace", fontWeight: "700" }}>{reportNo}</div>
          <div>Issue Date: 2026-03-14</div>
        </div>
      </div>
      <div style={{ background: accent, color: "white", padding: "16px", borderRadius: "4px", marginBottom: "16px", textAlign: "center" }}>
        <div style={{ fontSize: "11pt", fontWeight: "600", marginBottom: "4px" }}>TEST REPORT</div>
        <div style={{ fontSize: "16pt", fontWeight: "800", marginBottom: "6px" }}>{title}</div>
        <div style={{ fontSize: "8.5pt", opacity: 0.85 }}>{subtitle}</div>
      </div>
      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px", fontSize: "8.5pt" }}>
        <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
          {[["Customer", customer], ["Module", mod], ["Samples", samples], ["Period", "2026-01-15 to 2026-03-05"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
              <span style={{ color: "#666", minWidth: "80px" }}>{k}:</span><span style={{ fontWeight: "500" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
          {[["Lab", "SolarLabX – PV Testing, Pune"], ["Accreditation", "NABL TC-8192"], ["Standard", subtitle.substring(0, 40)], ["Overall", "PASS"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
              <span style={{ color: "#666", minWidth: "80px" }}>{k}:</span>
              <span style={{ fontWeight: k === "Overall" ? "800" : "500", color: k === "Overall" ? "#15803d" : "inherit" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SH({ title, color }) {
  return <div style={{ fontSize: "11pt", fontWeight: "800", color, borderBottom: `2.5px solid ${color}`, paddingBottom: "5px", marginBottom: "12px", marginTop: "16px" }}>{title}</div>;
}

function SignatureBlock({ accent, reportNo }) {
  return (
    <div style={{ marginTop: "24px", borderTop: "1px solid #ddd", paddingTop: "16px" }}>
      <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
        {[["Prepared By", "Dr. A. Sharma", "Lab Technician"], ["Checked By", "Mr. R. Verma", "Sr. Engineer"], ["Authorized By", "Prof. G. Krishnan", "Tech. Manager"], ["Issued By", "Ms. P. Nair", "Quality Manager"]].map(([role, name, title]) => (
          <div key={role} style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
            <div style={{ fontWeight: "600" }}>{name}</div>
            <div style={{ color: "#666", fontSize: "7.5pt" }}>{title}</div>
            <div style={{ color: accent, fontSize: "7.5pt", fontWeight: "600" }}>{role}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", fontSize: "7.5pt", color: "#666" }}>{reportNo} · SolarLabX · NABL TC-8192</div>
    </div>
  );
}

function PB({ pass }) {
  return <span style={{ background: pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600" }}>{pass ? "PASS" : "FAIL"}</span>;
}
