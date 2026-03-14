// @ts-nocheck
"use client";
export default function ThermalCyclingPage() {
  return <EnvTestReport
    reportNo="SLX-RPT-TC-2026-001"
    title="Thermal Cycling Test"
    subtitle="IEC 61215-2:2021 · MQT 11 (TC200) · 200 Cycles · −40°C to +85°C"
    accent="#b45309"
    standard="IEC 61215-2 MQT 11"
    testConditions={[
      ["Temp Range", "−40°C to +85°C"],
      ["No. of Cycles", "200 (TC200)"],
      ["Ramp Rate", "≤ 100°C/hr"],
      ["Dwell Time", "10 min at extremes"],
      ["Transfer Time", "< 30 s between extremes"],
      ["Humidity (High T)", "< 75% RH during heating"],
    ]}
    results={[
      { sample: "SLX-M301", pmaxBefore: "432.1", pmaxAfter: "430.4", delta: "−0.39%", riso: "6180 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
      { sample: "SLX-M302", pmaxBefore: "431.8", pmaxAfter: "430.2", delta: "−0.37%", riso: "6210 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
      { sample: "SLX-M303", pmaxBefore: "431.9", pmaxAfter: "430.1", delta: "−0.42%", riso: "6150 MΩ·m²", visual: "No defects", elChange: "None", pass: true },
    ]}
    criterion="ΔPmax < 5%, RISO·A ≥ 40 MΩ·m², no major visual defects"
    purpose="Determines the ability of the module to withstand thermal mismatch, fatigue and other stresses caused by repeated changes in temperature."
    equipment={["Thermal Cycling Chamber: Weiss WT-600/70 (Cal. SLX-EQ-020)", "Solar Simulator: Spire 4600SLP AAA+ (Cal. SLX-EQ-001)", "EL Camera: Xenics Bobcat-1.7 (Cal. SLX-EQ-022)"]}
  />;
}

function EnvTestReport({ reportNo, title, subtitle, accent, standard, testConditions, results, criterion, purpose, equipment }) {
  return (
    <>
      <style>{`@media print { .no-print{display:none!important} body{background:white!important} .report-container{box-shadow:none!important} .page-break{break-before:page} @page{size:A4;margin:15mm} thead{display:table-header-group} }`}</style>
      <div className="no-print flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">🖨 Print / Save PDF</button>
        </div>
      </div>
      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9.5pt" }}>
        <div style={{ padding: "15mm 20mm" }}>
          {/* Header */}
          <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "20pt", fontWeight: "800", color: accent }}>☀ SolarLabX</div>
              <div style={{ fontSize: "8pt", color: "#666" }}>NABL TC-8192 · ISO/IEC 17025:2017 · Pune, India</div>
            </div>
            <div style={{ textAlign: "right", fontSize: "8pt" }}>
              <div style={{ fontFamily: "monospace", fontWeight: "700" }}>{reportNo}</div>
              <div>Date: 2026-03-14</div>
            </div>
          </div>
          <div style={{ background: accent, color: "white", padding: "16px", borderRadius: "4px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "11pt", fontWeight: "600", marginBottom: "4px" }}>TEST REPORT – {standard}</div>
            <div style={{ fontSize: "16pt", fontWeight: "800", marginBottom: "6px" }}>{title}</div>
            <div style={{ fontSize: "9pt", opacity: 0.85 }}>{subtitle}</div>
          </div>

          {/* Module info + test conditions */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px", fontSize: "8.5pt" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              <div style={{ fontWeight: "700", color: accent, marginBottom: "6px", textTransform: "uppercase", fontSize: "8pt" }}>Module Under Test</div>
              {[["Manufacturer", "Axitec Energy GmbH"], ["Model", "AC-430MH/144V"], ["Technology", "Mono-PERC"], ["Rated Pmax", "430 Wp"], ["No. of Samples", "3 modules"], ["Cell Count", "144 half-cut"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ color: "#666", minWidth: "100px" }}>{k}:</span><span style={{ fontWeight: "500" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              <div style={{ fontWeight: "700", color: accent, marginBottom: "6px", textTransform: "uppercase", fontSize: "8pt" }}>Test Conditions</div>
              {testConditions.map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ color: "#666", minWidth: "120px" }}>{k}:</span><span style={{ fontWeight: "500" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <SH title="TEST PURPOSE" color={accent} />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "12px", padding: "8px 12px", background: "#fafafa", border: "1px solid #eee", borderRadius: "4px" }}>{purpose}</p>

          <SH title="PASS/FAIL CRITERION" color={accent} />
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "4px", padding: "8px 12px", marginBottom: "12px", fontSize: "8.5pt" }}>
            <strong>Criterion:</strong> {criterion}
          </div>

          <SH title="TEST RESULTS" color={accent} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: accent, color: "white" }}>
                {["Sample ID", "Pmax Before (W)", "Pmax After (W)", "ΔPmax", "RISO Post (MΩ·m²)", "Visual Inspection", "EL Change", "Result"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fafaf8" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{r.sample}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.pmaxBefore}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.pmaxAfter}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: Math.abs(parseFloat(r.delta)) < 5 ? "#d97706" : "#dc2626", fontWeight: "600" }}>{r.delta}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.riso}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>{r.visual}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>{r.elChange}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PB pass={r.pass} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH title="EQUIPMENT USED" color={accent} />
          <ul style={{ fontSize: "8.5pt", paddingLeft: "20px", marginBottom: "12px" }}>
            {equipment.map(e => <li key={e} style={{ marginBottom: "3px" }}>{e}</li>)}
          </ul>

          <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", padding: "12px", fontSize: "8.5pt", marginBottom: "16px" }}>
            <strong style={{ color: "#15803d", fontSize: "10pt" }}>✓ OVERALL RESULT: PASS – {standard}</strong><br />
            All 3 samples passed. Maximum ΔPmax = −0.42% (criterion: &lt; 5%). No relevant visual defects or EL changes observed.
          </div>

          <div style={{ marginTop: "24px", borderTop: "1px solid #ddd", paddingTop: "16px" }}>
            <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
              {[["Prepared By", "Dr. A. Sharma"], ["Checked By", "Mr. R. Verma"], ["Authorized By", "Prof. G. Krishnan"], ["Issued By", "Ms. P. Nair"]].map(([role, name]) => (
                <div key={role} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
                  <div style={{ fontWeight: "600" }}>{name}</div>
                  <div style={{ color: accent, fontSize: "7.5pt", fontWeight: "600" }}>{role}</div>
                  <div style={{ color: "#999", fontSize: "7pt" }}>Date: 2026-03-14</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", fontSize: "7.5pt", color: "#666" }}>{reportNo} · SolarLabX · NABL TC-8192</div>
          </div>
        </div>
      </div>
    </>
  );
}

function SH({ title, color }) {
  return <div style={{ fontSize: "11pt", fontWeight: "800", color, borderBottom: `2.5px solid ${color}`, paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>{title}</div>;
}
function PB({ pass }) {
  return <span style={{ background: pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600" }}>{pass ? "PASS" : "FAIL"}</span>;
}
