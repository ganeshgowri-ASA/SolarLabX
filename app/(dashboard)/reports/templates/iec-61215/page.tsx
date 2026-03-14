// @ts-nocheck
"use client";

const REPORT_NO = "SLX-RPT-IEC61215-2026-001";
const ACCENT = "#1e3a5f";

const MQT_RESULTS = [
  { id: "MQT01", name: "I-V Curve Tracing", clause: "MQT 01", result: "PASS", value: "432.1 W", criterion: "Baseline", tech: "Dr. A. Sharma", date: "2026-01-18" },
  { id: "MQT02", name: "Insulation Test", clause: "MQT 02", result: "PASS", value: "2850 MΩ", criterion: "≥ 40 MΩ·m²", tech: "Mr. R. Verma", date: "2026-01-19" },
  { id: "MQT03", name: "Measurement of Temperature Coefficients", clause: "MQT 03", result: "PASS", value: "α=0.049%/°C β=−0.282%/°C γ=−0.362%/°C", criterion: "Within tolerance", tech: "Ms. K. Mehta", date: "2026-01-20" },
  { id: "MQT04", name: "NMOT Measurement", clause: "MQT 04", result: "PASS", value: "44.2°C", criterion: "±2°C reproducibility", tech: "Dr. A. Sharma", date: "2026-01-22" },
  { id: "MQT05", name: "Performance at STC and NMOT", clause: "MQT 05", result: "PASS", value: "Pmax_NMOT = 332.1 W", criterion: "Consistent with temp coeff.", tech: "Ms. K. Mehta", date: "2026-01-23" },
  { id: "MQT06", name: "Performance at Low Irradiance", clause: "MQT 06", result: "PASS", value: "ΔPmax = −0.8% @ 200 W/m²", criterion: "Decline ≤ expected", tech: "Mr. R. Verma", date: "2026-01-24" },
  { id: "MQT07", name: "Outdoor Exposure Test", clause: "MQT 07", result: "PASS", value: "ΔPmax = −0.3%", criterion: "< 5%", tech: "Dr. A. Sharma", date: "2026-01-28" },
  { id: "MQT08", name: "Hot Spot Endurance", clause: "MQT 08", result: "PASS", value: "Max ΔT = 18°C", criterion: "No degradation > 5%", tech: "Ms. K. Mehta", date: "2026-02-02" },
  { id: "MQT09", name: "UV Preconditioning", clause: "MQT 09", result: "PASS", value: "ΔPmax = −0.2%", criterion: "< 5%", tech: "Mr. D. Rao", date: "2026-02-05" },
  { id: "MQT10", name: "Thermal Cycling", clause: "MQT 10 (TC200)", result: "PASS", value: "ΔPmax = −0.4%", criterion: "< 5%", tech: "Dr. A. Sharma", date: "2026-02-10" },
  { id: "MQT11", name: "Humidity Freeze", clause: "MQT 11 (HF10)", result: "PASS", value: "ΔPmax = −0.3%", criterion: "< 5%", tech: "Mr. R. Verma", date: "2026-02-12" },
  { id: "MQT12", name: "Damp Heat", clause: "MQT 12 (DH1000)", result: "PASS", value: "ΔPmax = −1.1%", criterion: "< 5%", tech: "Ms. K. Mehta", date: "2026-02-18" },
  { id: "MQT13", name: "Robustness of Terminations", clause: "MQT 13", result: "PASS", value: "No failures", criterion: "No breakage", tech: "Mr. D. Rao", date: "2026-02-19" },
  { id: "MQT14", name: "Wet Leakage Current", clause: "MQT 14", result: "PASS", value: "RISO·A = 6200 MΩ·m²", criterion: "≥ 40 MΩ·m²", tech: "Dr. A. Sharma", date: "2026-02-20" },
  { id: "MQT15", name: "Dynamic Mechanical Load", clause: "MQT 15", result: "PASS", value: "5400 Pa x 3 cycles", criterion: "No cracking", tech: "Mr. R. Verma", date: "2026-02-22" },
  { id: "MQT16", name: "Hail Test", clause: "MQT 16", result: "PASS", value: "25mm hail, 23 m/s, 11 impacts", criterion: "No damage", tech: "Ms. K. Mehta", date: "2026-02-24" },
  { id: "MQT17", name: "Ammonia Corrosion", clause: "MQT 17", result: "PASS", value: "ΔPmax = −0.2%", criterion: "< 5%", tech: "Mr. D. Rao", date: "2026-02-26" },
  { id: "MQT18", name: "Salt Mist Corrosion (ref IEC 61701)", clause: "MQT 18", result: "PASS", value: "ΔPmax = −0.7%", criterion: "< 5%", tech: "Dr. A. Sharma", date: "2026-03-01" },
  { id: "MQT19", name: "Sand Abrasion (ref IEC 60068-2-68)", clause: "MQT 19", result: "PASS", value: "ΔPmax = −0.3%", criterion: "< 5%", tech: "Mr. R. Verma", date: "2026-03-03" },
];

export default function IEC61215Page() {
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
          <h1 className="text-xl font-bold">IEC 61215:2021 Design Qualification Report</h1>
          <p className="text-sm text-gray-500">Crystalline Silicon PV Modules · All 19 MQTs</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">🖨 Print / Save PDF</button>
        </div>
      </div>

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9.5pt", color: "#1a1a1a" }}>
        <div style={{ padding: "15mm 20mm" }}>
          <ReportHeader
            reportNo={REPORT_NO}
            title="Design Qualification &amp; Type Approval"
            subtitle="IEC 61215-1:2021 · IEC 61215-2:2021 · Crystalline Silicon Terrestrial PV Modules"
            accent={ACCENT}
            customer="Axitec Energy GmbH & Co. KG"
            module="AC-430MH/144V (Mono-PERC, 430 Wp, 144 half-cut cells)"
            period="2026-01-15 to 2026-03-05"
            samples="3 modules"
            result="PASS"
          />

          <div className="page-break" />

          <SH title="TEST RESULTS SUMMARY – ALL MQTs" accent={ACCENT} />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>All 19 Module Qualification Tests (MQTs) performed per IEC 61215-2:2021 on representative samples.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
            <thead>
              <tr style={{ background: ACCENT, color: "white" }}>
                {["Test ID", "Test Name", "Clause", "Measured Value", "Criterion", "Technician", "Date", "Result"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontSize: "7.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MQT_RESULTS.map((t, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontFamily: "monospace", fontSize: "7.5pt" }}>{t.id}</td>
                  <td style={{ padding: "4px 8px" }}>{t.name}</td>
                  <td style={{ padding: "4px 8px", fontFamily: "monospace", fontSize: "7.5pt" }}>{t.clause}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{t.value}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{t.criterion}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{t.tech}</td>
                  <td style={{ padding: "4px 8px", fontSize: "7.5pt" }}>{t.date}</td>
                  <td style={{ padding: "4px 8px" }}><PassBadge pass={t.result === "PASS"} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="page-break" />
          <ModuleInfoSection accent={ACCENT} />
          <UncertaintySection accent={ACCENT} />
          <SignatureBlock accent={ACCENT} reportNo={REPORT_NO} />
        </div>
      </div>
    </>
  );
}

/* ─── Shared components ─── */
function ReportHeader({ reportNo, title, subtitle, accent, customer, module: mod, period, samples, result }) {
  return (
    <>
      <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "20pt", fontWeight: "800", color: accent }}>☀ SolarLabX</div>
          <div style={{ fontSize: "8pt", color: "#666" }}>NABL TC-8192 · ISO/IEC 17025:2017 · Pune, India</div>
        </div>
        <div style={{ textAlign: "right", fontSize: "8pt" }}>
          <div style={{ fontFamily: "monospace", fontWeight: "700" }}>{reportNo}</div>
          <div style={{ color: "#555" }}>Issue Date: 2026-03-14</div>
        </div>
      </div>
      <div style={{ background: accent, color: "white", padding: "16px", borderRadius: "4px", marginBottom: "16px", textAlign: "center" }}>
        <div style={{ fontSize: "11pt", fontWeight: "600", marginBottom: "4px" }}>TEST REPORT</div>
        <div style={{ fontSize: "16pt", fontWeight: "800", marginBottom: "6px" }}>{title}</div>
        <div style={{ fontSize: "9pt", opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: subtitle }} />
      </div>
      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px", fontSize: "8.5pt" }}>
        {[
          [["Customer", customer], ["Module", mod], ["Samples", samples], ["Test Period", period]],
          [["Lab", "SolarLabX – PV Testing Division, Pune"], ["Accreditation", "NABL TC-8192 / IEC 17025:2017"], ["Standard", subtitle.replace(/<[^>]*>/g, "")], ["Overall Result", result]],
        ].map((col, ci) => (
          <div key={ci} style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
            {col.map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                <span style={{ color: "#666", minWidth: "90px" }}>{k}:</span>
                <span style={{ fontWeight: k === "Overall Result" ? "800" : "500", color: k === "Overall Result" ? "#15803d" : "inherit" }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function SH({ title, accent }: { title: string; accent: string }) {
  return <div style={{ fontSize: "11pt", fontWeight: "800", color: accent, borderBottom: `2.5px solid ${accent}`, paddingBottom: "5px", marginBottom: "12px", marginTop: "16px" }}>{title}</div>;
}

function ModuleInfoSection({ accent }) {
  return (
    <>
      <SH title="MODULE UNDER TEST (MUT)" accent={accent} />
      <div className="grid grid-cols-4 gap-3" style={{ fontSize: "8.5pt", border: "1px solid #e5e7eb", padding: "12px", borderRadius: "4px", background: "#f8fafc", marginBottom: "12px" }}>
        {[
          ["Manufacturer", "Axitec Energy GmbH"], ["Model", "AC-430MH/144V"], ["Cell Tech.", "Mono-PERC"], ["No. of Cells", "144 half-cut"],
          ["Rated Pmax", "430 Wp"], ["Voc", "43.2 V"], ["Isc", "12.83 A"], ["Dimensions", "2108 × 1048 × 35 mm"],
          ["Year", "2025"], ["Frame", "Anodized Al"], ["Glass", "3.2mm ARC tempered"], ["Connector", "MC4 compatible"],
        ].map(([k, v]) => (
          <div key={k}><span style={{ color: "#666" }}>{k}:</span><br /><strong>{v}</strong></div>
        ))}
      </div>
    </>
  );
}

function UncertaintySection({ accent }) {
  return (
    <>
      <SH title="MEASUREMENT UNCERTAINTY" accent={accent} />
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
        <thead>
          <tr style={{ background: "#334155", color: "white" }}>
            {["Parameter", "Expanded Uncertainty", "k", "Confidence"].map(h => <th key={h} style={{ padding: "5px 8px" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {[["Pmpp", "±2.55%", "2", "95%"], ["Voc", "±1.44%", "2", "95%"], ["Isc", "±2.21%", "2", "95%"], ["Temperature", "±0.5°C", "2", "95%"], ["Irradiance", "±2.0%", "2", "95%"]].map(([p, u, k, c], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "4px 8px" }}>{p}</td>
              <td style={{ padding: "4px 8px", color: "#1e3a5f", fontWeight: "600" }}>{u}</td>
              <td style={{ padding: "4px 8px" }}>{k}</td>
              <td style={{ padding: "4px 8px" }}>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function SignatureBlock({ accent, reportNo }) {
  return (
    <div style={{ marginTop: "24px", borderTop: "1px solid #ddd", paddingTop: "16px" }}>
      <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
        {[
          { role: "Prepared By", name: "Dr. A. Sharma", title: "Lab Technician" },
          { role: "Checked By", name: "Mr. R. Verma", title: "Sr. Engineer" },
          { role: "Authorized By", name: "Prof. G. Krishnan", title: "Tech. Manager" },
          { role: "Issued By", name: "Ms. P. Nair", title: "Quality Manager" },
        ].map((sig) => (
          <div key={sig.role} style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
            <div style={{ fontWeight: "600" }}>{sig.name}</div>
            <div style={{ color: "#666", fontSize: "7.5pt" }}>{sig.title}</div>
            <div style={{ color: accent, fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
            <div style={{ color: "#999", fontSize: "7pt" }}>Date: 2026-03-14</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "12px", fontSize: "7.5pt", color: "#666" }}>{reportNo} · SolarLabX, Pune · NABL TC-8192</div>
    </div>
  );
}

function PassBadge({ pass }: { pass: boolean }) {
  return <span style={{ background: pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600" }}>{pass ? "PASS" : "FAIL"}</span>;
}
