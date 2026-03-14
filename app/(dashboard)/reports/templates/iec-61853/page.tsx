// @ts-nocheck
"use client";

const REPORT_NO = "SLX-RPT-IEC61853-2026-001";
const ACCENT = "#5b21b6";

// Power matrix: irradiance (W/m²) rows × temperature (°C) cols
const IRRAD = [100, 200, 400, 600, 800, 1000, 1100];
const TEMPS = [15, 25, 50, 75];
// Pmax values (W) for each irradiance × temperature combination (mock data for 430 Wp module)
const PMATRIX = [
  [39.8, 38.4, 34.2, 30.1],
  [81.2, 78.9, 71.2, 63.8],
  [166.4, 162.1, 147.8, 133.4],
  [252.1, 246.3, 225.4, 204.2],
  [338.8, 331.2, 303.8, 276.1],
  [432.1, 422.4, 388.1, 353.6],
  [474.2, 463.8, 426.4, 388.9],
];

function pColor(val: number, nom = 430) {
  const pct = val / nom * 100;
  if (pct >= 95) return "#bbf7d0";
  if (pct >= 70) return "#bfdbfe";
  if (pct >= 40) return "#fef9c3";
  return "#fed7aa";
}

const ENERGY_RATING = [
  { climate: "Desert (Sonoran)", location: "Phoenix, AZ", YEPEAK: "432.1", YE: "1892", ref: "Pref = 430 W" },
  { climate: "Temperate (Cfb)", location: "Berlin, DE", YEPEAK: "421.3", YE: "1124", ref: "Pref = 430 W" },
  { climate: "Tropical (Am)", location: "Mumbai, IN", YEPEAK: "428.7", YE: "1456", ref: "Pref = 430 W" },
  { climate: "Sub-Arctic (Dfc)", location: "Helsinki, FI", YEPEAK: "418.2", YE: "892", ref: "Pref = 430 W" },
];

export default function IEC61853Page() {
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
          <h1 className="text-xl font-bold">IEC 61853 Energy Rating Report</h1>
          <p className="text-sm text-gray-500">IEC 61853-1/2/3/4 · Power Matrix · Climate-Specific Energy Output</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">🖨 Print / Save PDF</button>
        </div>
      </div>

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9.5pt" }}>
        <div style={{ padding: "15mm 20mm" }}>

          {/* Header */}
          <div style={{ borderBottom: `3px solid ${ACCENT}`, paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "20pt", fontWeight: "800", color: ACCENT }}>☀ SolarLabX</div>
              <div style={{ fontSize: "8pt", color: "#666" }}>NABL TC-8192 · ISO/IEC 17025:2017 · Pune, India</div>
            </div>
            <div style={{ textAlign: "right", fontSize: "8pt" }}>
              <div style={{ fontFamily: "monospace", fontWeight: "700" }}>{REPORT_NO}</div>
              <div>Date: 2026-03-14</div>
            </div>
          </div>

          <div style={{ background: ACCENT, color: "white", padding: "16px", borderRadius: "4px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "11pt", fontWeight: "600", marginBottom: "4px" }}>TEST REPORT</div>
            <div style={{ fontSize: "16pt", fontWeight: "800", marginBottom: "6px" }}>PV Module Energy Rating</div>
            <div style={{ fontSize: "9pt", opacity: 0.85 }}>IEC 61853-1:2011 · IEC 61853-2:2016 · IEC 61853-3:2018 · IEC 61853-4:2018</div>
            <div style={{ fontSize: "8.5pt", opacity: 0.7, marginTop: "4px" }}>Axitec AC-430MH/144V · 430 Wp Mono-PERC · 4 Climate Zones</div>
          </div>

          <SH title="MODULE UNDER TEST" color={ACCENT} />
          <div className="grid grid-cols-4 gap-3" style={{ fontSize: "8.5pt", border: "1px solid #e5e7eb", padding: "12px", borderRadius: "4px", background: "#faf5ff", marginBottom: "16px" }}>
            {[["Manufacturer", "Axitec Energy GmbH"], ["Model", "AC-430MH/144V"], ["Technology", "Mono-PERC"], ["Rated Pmax", "430 Wp"],
              ["No. of Cells", "144 half-cut"], ["Voc", "43.2 V"], ["Isc", "12.83 A"], ["α (Isc)", "+0.049%/°C"],
              ["β (Voc)", "−0.282%/°C"], ["γ (Pmax)", "−0.362%/°C"], ["NMOT", "44.2°C"], ["Frame", "Anodized Al"]].map(([k, v]) => (
              <div key={k}><span style={{ color: "#666" }}>{k}:</span><br /><strong>{v}</strong></div>
            ))}
          </div>

          <SH title="POWER MATRIX – Pmax (W) at STC Irradiance × Module Temperature" color={ACCENT} />
          <p style={{ fontSize: "8pt", color: "#666", marginBottom: "8px" }}>Per IEC 61853-1. Values measured at 7 irradiance levels × 4 temperature levels. Reference irradiance correction applied.</p>
          <div style={{ overflowX: "auto", marginBottom: "16px" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "8.5pt", width: "100%" }}>
              <thead>
                <tr style={{ background: ACCENT, color: "white" }}>
                  <th style={{ padding: "6px 10px" }}>G (W/m²) ↓ · T (°C) →</th>
                  {TEMPS.map(t => <th key={t} style={{ padding: "6px 16px", textAlign: "center" }}>{t}°C</th>)}
                  <th style={{ padding: "6px 10px", textAlign: "center", background: "#7c3aed" }}>Avg</th>
                </tr>
              </thead>
              <tbody>
                {IRRAD.map((g, gi) => {
                  const row = PMATRIX[gi];
                  const avg = (row.reduce((a, b) => a + b, 0) / row.length);
                  return (
                    <tr key={g} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "5px 10px", fontWeight: "600", background: "#f3f4f6" }}>{g}</td>
                      {row.map((val, ti) => (
                        <td key={ti} style={{ padding: "5px 16px", textAlign: "center", background: pColor(val), fontWeight: "600" }}>
                          {val.toFixed(1)}
                        </td>
                      ))}
                      <td style={{ padding: "5px 10px", textAlign: "center", fontWeight: "700", background: "#ede9fe" }}>
                        {avg.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4" style={{ fontSize: "7.5pt", marginBottom: "16px" }}>
            {[["≥95% Pnom", "#bbf7d0"], ["70–95%", "#bfdbfe"], ["40–70%", "#fef9c3"], ["<40%", "#fed7aa"]].map(([l, c]) => (
              <div key={l} className="flex items-center gap-1">
                <div style={{ width: "14px", height: "14px", background: c, border: "1px solid #ddd" }} />
                <span>{l}</span>
              </div>
            ))}
          </div>

          <SH title="ENERGY RATING – CLIMATE ZONE ANALYSIS (IEC 61853-3/4)" color={ACCENT} />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>Annual energy yield (YE) per climate zone, normalised to reference irradiance. Calculated per IEC 61853-3 spectral correction and IEC 61853-4 climate datasets.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: ACCENT, color: "white" }}>
                {["Climate Zone", "Reference Location", "Pmax @ STC (W)", "Annual Energy Yield YE (kWh/kWp)", "Reference", "Result"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENERGY_RATING.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#faf5ff" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{r.climate}</td>
                  <td style={{ padding: "5px 8px" }}>{r.location}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.YEPEAK}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", fontWeight: "700", color: "#5b21b6" }}>{r.YE}</td>
                  <td style={{ padding: "5px 8px", color: "#666" }}>{r.ref}</td>
                  <td style={{ padding: "5px 8px" }}><PB pass={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH title="TEMPERATURE COEFFICIENTS (IEC 61853-1 §6)" color={ACCENT} />
          <div className="grid grid-cols-3 gap-4" style={{ fontSize: "8.5pt" }}>
            {[
              { param: "α (Isc)", val: "+0.049 %/°C", desc: "Temperature coefficient of Isc", measured: "+0.049 ± 0.003 %/°C" },
              { param: "β (Voc)", val: "−0.282 %/°C", desc: "Temperature coefficient of Voc", measured: "−0.282 ± 0.008 %/°C" },
              { param: "γ (Pmax)", val: "−0.362 %/°C", desc: "Temperature coefficient of Pmax", measured: "−0.362 ± 0.010 %/°C" },
            ].map(({ param, val, desc, measured }) => (
              <div key={param} style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px", background: "#faf5ff" }}>
                <div style={{ fontWeight: "800", color: ACCENT, fontSize: "16pt", marginBottom: "4px" }}>{val}</div>
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>{param}</div>
                <div style={{ color: "#666", fontSize: "7.5pt", marginBottom: "4px" }}>{desc}</div>
                <div style={{ fontSize: "7.5pt" }}><strong>Measured:</strong> {measured}</div>
                <div style={{ fontSize: "7.5pt" }}><strong>Method:</strong> Thermal chamber, 5 temperature levels, 15–75°C</div>
              </div>
            ))}
          </div>

          <div className="page-break" />
          <SH title="SPECTRAL CORRECTION & MEASUREMENT METHODOLOGY" color={ACCENT} />
          <div style={{ fontSize: "8.5pt", border: "1px solid #ddd", borderRadius: "4px", padding: "12px", background: "#faf5ff" }}>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Solar Simulator", "Spire 4600SLP (AAA+)"],
                ["Spectral Range", "300 – 1200 nm"],
                ["Reference Cell", "Eppley PSP-5 (Cal. SLX-EQ-003)"],
                ["Thermal Control", "Peltier element, ±0.3°C stability"],
                ["Irradiance Levels", "100, 200, 400, 600, 800, 1000, 1100 W/m²"],
                ["Temperature Levels", "15, 25, 50, 75°C"],
                ["Spectral Correction", "Per IEC 60891 Procedure 1 & 3"],
                ["Uncertainty Pmpp", "±2.55% (k=2, 95%)"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ color: "#666", minWidth: "130px" }}>{k}:</span>
                  <span style={{ fontWeight: "500" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <SignBlock accent={ACCENT} reportNo={REPORT_NO} />
        </div>
      </div>
    </>
  );
}

function SH({ title, color }) {
  return <div style={{ fontSize: "11pt", fontWeight: "800", color, borderBottom: `2.5px solid ${color}`, paddingBottom: "5px", marginBottom: "12px", marginTop: "16px" }}>{title}</div>;
}
function PB({ pass }) {
  return <span style={{ background: pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600" }}>{pass ? "PASS" : "FAIL"}</span>;
}
function SignBlock({ accent, reportNo }) {
  return (
    <div style={{ marginTop: "24px", borderTop: "1px solid #ddd", paddingTop: "16px" }}>
      <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
        {[["Prepared By", "Dr. A. Sharma"], ["Checked By", "Mr. R. Verma"], ["Authorized By", "Prof. G. Krishnan"], ["Issued By", "Ms. P. Nair"]].map(([role, name]) => (
          <div key={role} style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
            <div style={{ fontWeight: "600" }}>{name}</div>
            <div style={{ color: accent, fontSize: "7.5pt", fontWeight: "600" }}>{role}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", fontSize: "7.5pt", color: "#666" }}>{reportNo} · SolarLabX · NABL TC-8192</div>
    </div>
  );
}
