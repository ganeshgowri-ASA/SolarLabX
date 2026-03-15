// @ts-nocheck
"use client";

import { PrePostComparisonChart } from "@/components/reports/charts/PrePostComparisonChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";

const REPORT_NO = "SLX-RPT-IEC61701-2026-001";
const ACCENT = "#0e7490";

const SEVERITY_LEVELS = [
  { level: "SM", desc: "Salt Mist – Mild (equivalent to 20 km from coast)", duration: "96h", nacl: "5%", pass: true },
  { level: "S1", desc: "Severity Level 1 (200h salt mist)", duration: "200h", nacl: "5%", pass: true },
  { level: "S2", desc: "Severity Level 2 (40h + drying + 96h salt mist)", duration: "136h", nacl: "5%", pass: true },
  { level: "S3", desc: "Severity Level 3 (S1 + humidity, aggressive)", duration: "200h", nacl: "5%", pass: true },
  { level: "S4", desc: "Severity Level 4 (MST13 equivalent)", duration: "200h", nacl: "5%", pass: true },
];

const TEST_SEQUENCE = [
  { step: "Pre-test STC", result: "432.1 W", deviation: "Baseline", pass: true },
  { step: "Pre-test Insulation", result: "RISO·A = 6200 MΩ·m²", deviation: "≥ 40 MΩ·m²", pass: true },
  { step: "Pre-test Visual", result: "No defects", deviation: "—", pass: true },
  { step: "Salt Mist Exposure (S4 level – 200h, 35°C, 5% NaCl)", result: "Completed", deviation: "—", pass: true },
  { step: "Dry-out (25°C, 50%RH, 24h)", result: "Completed", deviation: "—", pass: true },
  { step: "Post-test Visual", result: "Minor salt deposit, no corrosion", deviation: "See Section 5", pass: true },
  { step: "Post-test Insulation", result: "RISO·A = 5980 MΩ·m²", deviation: "≥ 40 MΩ·m²", pass: true },
  { step: "Post-test STC", result: "429.1 W", deviation: "−0.70%", pass: true },
];

const SAMPLES = ["SLX-M201", "SLX-M202", "SLX-M203"];

export default function IEC61701Page() {
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

      <div className="no-print sticky top-0 z-50 flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold">IEC 61701:2020 Salt Mist Corrosion Report</h1>
          <p className="text-sm text-gray-500">PV Module Salt Mist Corrosion Testing · Severity Level S4</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            PDF
          </button>
          <button onClick={() => { /* word export placeholder */ }} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Word
          </button>
          <button onClick={() => { /* excel export placeholder */ }} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Excel
          </button>
          <button onClick={() => window.print()} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9.5pt" }}>
        <div style={{ padding: "15mm 20mm" }}>

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
            <div style={{ fontSize: "16pt", fontWeight: "800", marginBottom: "6px" }}>Salt Mist Corrosion Test</div>
            <div style={{ fontSize: "9pt", opacity: 0.85 }}>IEC 61701:2020 · Severity Level S4 · 200 Hours · 5% NaCl</div>
            <div style={{ fontSize: "8.5pt", opacity: 0.7, marginTop: "4px" }}>Suitable for coastal &amp; marine environments up to 1 km from sea</div>
          </div>

          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px", fontSize: "8.5pt" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              {[["Customer", "Axitec Energy GmbH"], ["Module", "AC-430MH/144V (430 Wp)"], ["Severity Level", "S4 (most stringent)"], ["Duration", "200 hours"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ color: "#666", minWidth: "100px" }}>{k}:</span><span style={{ fontWeight: "500" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              {[["Salt Concentration", "5% NaCl (by mass)"], ["Temperature", "35°C ± 2°C"], ["pH", "6.5 – 7.2"], ["Overall Result", "PASS"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ color: "#666", minWidth: "100px" }}>{k}:</span>
                  <span style={{ fontWeight: k === "Overall Result" ? "800" : "500", color: k === "Overall Result" ? "#15803d" : "inherit" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <SH title="SEVERITY LEVELS REFERENCE" color={ACCENT} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: ACCENT, color: "white" }}>
                {["Level", "Description", "Duration", "NaCl Conc.", "Tested?"].map(h => <th key={h} style={{ padding: "5px 8px" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {SEVERITY_LEVELS.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f0f9ff" : "white", borderBottom: "1px solid #e5e7eb", fontWeight: r.level === "S4" ? "700" : "normal" }}>
                  <td style={{ padding: "5px 8px" }}>{r.level}</td>
                  <td style={{ padding: "5px 8px" }}>{r.desc}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.duration}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.nacl}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.level === "S4" ? <PB pass={true} /> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH title="TEST SEQUENCE & RESULTS" color={ACCENT} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: "#334155", color: "white" }}>
                {["Test Step", "Measured Value / Observation", "Criterion / Limit", "Result"].map(h => <th key={h} style={{ padding: "5px 8px" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {TEST_SEQUENCE.map((t, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f0f9ff" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "500" }}>{t.step}</td>
                  <td style={{ padding: "5px 8px" }}>{t.result}</td>
                  <td style={{ padding: "5px 8px" }}>{t.deviation}</td>
                  <td style={{ padding: "5px 8px" }}>{t.result !== "Completed" ? <PB pass={t.pass} /> : <span style={{ color: "#666" }}>N/A</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH title="PER-SAMPLE ELECTRICAL RESULTS" color={ACCENT} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: ACCENT, color: "white" }}>
                {["Sample", "Pmax Before (W)", "Pmax After (W)", "ΔPmax", "Voc Δ", "Isc Δ", "RISO After", "Visual", "Result"].map(h => <th key={h} style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {SAMPLES.map((s, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f0f9ff" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{s}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>432.{i + 1}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>429.{i + 1}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#d97706" }}>−0.7{i}%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>−0.3%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>−0.2%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>598{i} MΩ·m²</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>Minor deposit</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PB pass={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH title="CORROSION ASSESSMENT" color={ACCENT} />
          <div className="grid grid-cols-3 gap-4" style={{ fontSize: "8.5pt" }}>
            {["Frame", "Junction Box", "Connectors"].map(part => (
              <div key={part} style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
                <div style={{ fontWeight: "700", color: ACCENT, marginBottom: "6px" }}>{part}</div>
                <div style={{ border: "1px dashed #ccc", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9", fontSize: "7pt", color: "#999", marginBottom: "6px" }}>[Post-test photo]</div>
                <div style={{ fontSize: "7.5pt" }}>
                  <p><strong>Observation:</strong> Minor white salt deposits on surface</p>
                  <p><strong>Corrosion:</strong> None detected</p>
                  <p><strong>Verdict:</strong> <span style={{ color: "#059669", fontWeight: "600" }}>ACCEPTABLE</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* Pre/Post Comparison Chart */}
          <SH title="PRE/POST POWER COMPARISON" color={ACCENT} />
          <div style={{ marginBottom: "16px" }}>
            <PrePostComparisonChart
              data={SAMPLES.map((s, i) => ({ sampleId: s, preValue: 432.1 - i * 0.1, postValue: 429.1 - i * 0.2 }))}
              parameter="Pmax" unit="W" threshold={5} thresholdType="max_degradation_pct"
            />
          </div>

          {/* Uncertainty Budget */}
          <SH title="MEASUREMENT UNCERTAINTY BUDGET" color={ACCENT} />
          <div style={{ fontSize: "7.5pt", color: "#666", marginBottom: "8px" }}>
            Per GUM JCGM 100:2008 · ISO/IEC 17025:2017 §7.6
          </div>
          <ReportUncertaintyBudgetTable
            rows={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.rows}
            measurand={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.measurand}
            measuredValue={432.0}
            unit={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.unit}
            combinedUncertainty={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.combinedUncertainty}
            coverageFactor={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.coverageFactor}
            expandedUncertainty={TEST_UNCERTAINTY_CONFIGS.tc_dh_hf.expandedUncertainty}
            compact
          />

          <div style={{ marginTop: "16px", background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", padding: "12px", fontSize: "8.5pt" }}>
            <strong style={{ color: "#15803d", fontSize: "10pt" }}>✓ PASS – IEC 61701:2020 Severity Level S4</strong><br />
            All 3 samples passed the salt mist corrosion test. Power degradation ΔPmax ≤ 5% and insulation resistance ≥ 40 MΩ·m². No corrosion or electrical safety concerns detected.
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
