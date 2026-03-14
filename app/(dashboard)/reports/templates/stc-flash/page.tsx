// @ts-nocheck
"use client";

const REPORT_NO = "SLX-RPT-STC-2026-001";

const MODULES = [
  { id: "SLX-F001", model: "AC-430MH/144V", make: "Axitec", np: { pmax: 430, vmpp: 35.8, impp: 12.01, voc: 43.2, isc: 12.83, ff: 77.8 } },
  { id: "SLX-F002", model: "AC-430MH/144V", make: "Axitec", np: { pmax: 430, vmpp: 35.8, impp: 12.01, voc: 43.2, isc: 12.83, ff: 77.8 } },
  { id: "SLX-F003", model: "JKM545M-72HL4-BDVP", make: "Jinko", np: { pmax: 545, vmpp: 41.8, impp: 13.03, voc: 49.8, isc: 13.85, ff: 79.1 } },
  { id: "SLX-F004", model: "JKM545M-72HL4-BDVP", make: "Jinko", np: { pmax: 545, vmpp: 41.8, impp: 13.03, voc: 49.8, isc: 13.85, ff: 79.1 } },
];

type Meas = { pmax: number; vmpp: number; impp: number; voc: number; isc: number; ff: number };

const measA: Meas[] = [
  { pmax: 432.1, vmpp: 35.92, impp: 12.03, voc: 43.41, isc: 12.85, ff: 77.91 },
  { pmax: 431.8, vmpp: 35.89, impp: 12.02, voc: 43.38, isc: 12.84, ff: 77.89 },
  { pmax: 547.8, vmpp: 42.01, impp: 13.04, voc: 49.98, isc: 13.87, ff: 79.25 },
  { pmax: 546.9, vmpp: 41.97, impp: 13.03, voc: 49.94, isc: 13.86, ff: 79.19 },
];
const measB: Meas[] = [
  { pmax: 429.8, vmpp: 35.71, impp: 12.04, voc: 43.25, isc: 12.80, ff: 78.01 },
  { pmax: 429.5, vmpp: 35.68, impp: 12.03, voc: 43.22, isc: 12.79, ff: 77.98 },
  { pmax: 534.2, vmpp: 41.22, impp: 12.96, voc: 49.82, isc: 13.81, ff: 77.82 },
  { pmax: 533.9, vmpp: 41.19, impp: 12.95, voc: 49.79, isc: 13.80, ff: 77.79 },
];
const measC: Meas[] = [
  { pmax: 427.1, vmpp: 35.52, impp: 12.02, voc: 43.11, isc: 12.77, ff: 77.85 },
  { pmax: 427.3, vmpp: 35.54, impp: 12.01, voc: 43.13, isc: 12.76, ff: 77.88 },
  { pmax: 519.8, vmpp: 40.85, impp: 12.73, voc: 49.41, isc: 13.62, ff: 77.11 },
  { pmax: 520.1, vmpp: 40.88, impp: 12.73, voc: 49.44, isc: 13.63, ff: 77.14 },
];

function dev(a: number, b: number) {
  return ((b - a) / a * 100).toFixed(2);
}

function DevCell({ val }: { val: string }) {
  const n = parseFloat(val);
  const color = Math.abs(n) < 0.5 ? "#059669" : Math.abs(n) < 2 ? "#d97706" : "#dc2626";
  return <td style={{ padding: "4px 6px", textAlign: "center", color, fontWeight: "600" }}>{n > 0 ? "+" : ""}{val}%</td>;
}

const PARAMS: { key: keyof Meas; label: string; unit: string }[] = [
  { key: "pmax", label: "Pmax", unit: "W" },
  { key: "vmpp", label: "Vmpp", unit: "V" },
  { key: "impp", label: "Impp", unit: "A" },
  { key: "voc", label: "Voc", unit: "V" },
  { key: "isc", label: "Isc", unit: "A" },
  { key: "ff", label: "FF", unit: "%" },
];

export default function STCFlashPage() {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-container { box-shadow: none !important; max-width: 100% !important; }
          .page-break { break-before: page; }
          @page { size: A4 landscape; margin: 12mm; }
          thead { display: table-header-group; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold">STC Flash Test Analysis</h1>
          <p className="text-sm text-gray-500">IEC 60904-1 / IEC 61215-2 MQT06 · Multi-stage measurement comparison</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">🖨 Print / Save PDF</button>
        </div>
      </div>

      <div className="report-container max-w-6xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9.5pt", color: "#1a1a1a" }}>
        <div style={{ padding: "12mm 16mm" }}>

          {/* Header */}
          <div style={{ borderBottom: "3px solid #1e3a5f", paddingBottom: "10px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "18pt", fontWeight: "800", color: "#1e3a5f" }}>☀ SolarLabX</div>
              <div style={{ fontSize: "8pt", color: "#666" }}>NABL TC-8192 · ISO/IEC 17025:2017 · Pune, India</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14pt", fontWeight: "700", color: "#1e3a5f" }}>STC Flash Test Analysis</div>
              <div style={{ fontSize: "8.5pt", color: "#555" }}>Report No: <strong style={{ fontFamily: "monospace" }}>{REPORT_NO}</strong></div>
              <div style={{ fontSize: "8pt", color: "#666" }}>Date: 2026-03-14 · Simulator: Spire 4600SLP (AAA+)</div>
            </div>
          </div>

          <div style={{ marginBottom: "14px", fontSize: "8.5pt", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "4px", padding: "8px 12px" }}>
            <strong>Legend:</strong>&nbsp;
            <strong>(NP)</strong> Nameplate value &nbsp;|&nbsp;
            <strong>(A)</strong> Initial STC measurement &nbsp;|&nbsp;
            <strong>(B)</strong> After stabilisation / preconditioning &nbsp;|&nbsp;
            <strong>(C)</strong> After test sequence / N cycles &nbsp;|&nbsp;
            <strong>Δ A/NP</strong> Deviation A vs Nameplate &nbsp;|&nbsp;
            <strong>Δ B/A</strong> Deviation B vs A &nbsp;|&nbsp;
            <strong>Δ C/A</strong> Net deviation C vs Initial &nbsp;|&nbsp;
            Ref-corrected: reference module drift subtracted
          </div>

          {/* Module-wise analysis cards */}
          {MODULES.map((m, mi) => {
            const np = m.np;
            const A = measA[mi];
            const B = measB[mi];
            const C = measC[mi];
            return (
              <div key={mi} style={{ marginBottom: "24px", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
                {/* Card header */}
                <div style={{ background: "#1e3a5f", color: "white", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "10pt", fontWeight: "700" }}>Module {mi + 1}: {m.id}</span>
                    <span style={{ fontSize: "8pt", opacity: 0.8, marginLeft: "12px" }}>{m.make} · {m.model}</span>
                  </div>
                  <div style={{ fontSize: "8.5pt" }}>
                    <span style={{ background: parseFloat(dev(A.pmax, C.pmax)) > -5 ? "#22c55e" : "#ef4444", color: "white", padding: "2px 8px", borderRadius: "3px" }}>
                      {parseFloat(dev(A.pmax, C.pmax)) > -5 ? "PASS" : "FAIL"} · ΔPmax: {dev(A.pmax, C.pmax) > "0" ? "+" : ""}{dev(A.pmax, C.pmax)}%
                    </span>
                  </div>
                </div>

                {/* Data table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                    <thead>
                      <tr style={{ background: "#334155", color: "white" }}>
                        <th style={{ padding: "5px 8px", textAlign: "left", width: "80px" }}>Parameter</th>
                        <th style={{ padding: "5px 8px", textAlign: "center" }}>Nameplate (NP)</th>
                        <th style={{ padding: "5px 8px", textAlign: "center" }}>Initial (A)</th>
                        <th style={{ padding: "5px 8px", textAlign: "center", background: "#1e40af" }}>Δ A/NP</th>
                        <th style={{ padding: "5px 8px", textAlign: "center" }}>Post Precond. (B)</th>
                        <th style={{ padding: "5px 8px", textAlign: "center", background: "#1e40af" }}>Δ B/A</th>
                        <th style={{ padding: "5px 8px", textAlign: "center" }}>Post Test (C)</th>
                        <th style={{ padding: "5px 8px", textAlign: "center", background: "#166534" }}>Δ C/A (Net)</th>
                        <th style={{ padding: "5px 8px", textAlign: "center", background: "#166534" }}>Δ C/NP</th>
                        <th style={{ padding: "5px 8px", textAlign: "center" }}>Criterion</th>
                        <th style={{ padding: "5px 8px", textAlign: "center" }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PARAMS.map((p, pi) => {
                        const npVal = np[p.key];
                        const aVal = A[p.key];
                        const bVal = B[p.key];
                        const cVal = C[p.key];
                        const dANP = dev(npVal, aVal);
                        const dBA = dev(aVal, bVal);
                        const dCA = dev(aVal, cVal);
                        const dCNP = dev(npVal, cVal);
                        const pass = Math.abs(parseFloat(dCA)) < (p.key === "pmax" ? 5 : 10);
                        return (
                          <tr key={pi} style={{ background: pi % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                            <td style={{ padding: "4px 8px", fontWeight: "600" }}>{p.label} ({p.unit})</td>
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>{npVal.toFixed(p.key === "pmax" ? 0 : 2)}</td>
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>{aVal.toFixed(p.key === "pmax" ? 1 : 2)}</td>
                            <DevCell val={dANP} />
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>{bVal.toFixed(p.key === "pmax" ? 1 : 2)}</td>
                            <DevCell val={dBA} />
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>{cVal.toFixed(p.key === "pmax" ? 1 : 2)}</td>
                            <DevCell val={dCA} />
                            <DevCell val={dCNP} />
                            <td style={{ padding: "4px 6px", textAlign: "center", fontSize: "7.5pt", color: "#666" }}>
                              {p.key === "pmax" ? "< 5%" : "< 10%"}
                            </td>
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>
                              <span style={{ background: pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 6px", borderRadius: "3px", fontSize: "7pt", fontWeight: "700" }}>
                                {pass ? "PASS" : "FAIL"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* I-V curve placeholder + summary */}
                <div style={{ padding: "10px 12px", background: "#f8fafc", borderTop: "1px solid #e5e7eb", display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ border: "1px dashed #ccc", width: "140px", height: "80px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", fontSize: "7pt", color: "#999", borderRadius: "3px" }}>
                    [I-V Curve Overlay A/B/C]
                  </div>
                  <div style={{ fontSize: "7.5pt", color: "#555" }}>
                    <p style={{ marginBottom: "3px" }}><strong>Flash Test Conditions:</strong> Irradiance = 1000 W/m² ± 2% · Cell Temp = 25°C ± 1°C · Spectrum AM1.5G</p>
                    <p style={{ marginBottom: "3px" }}><strong>Reference Cell:</strong> Eppley PSP-5 · Cal. No. SLX-EQ-003 · Last Cal: 2025-12-15</p>
                    <p style={{ marginBottom: "3px" }}><strong>Measurement Uncertainty:</strong> Pmpp ±2.55% · Voc ±1.44% · Isc ±2.21% (k=2, 95%)</p>
                    <p><strong>Ref Module Correction:</strong> Applied. Ref module Pmax deviation = −0.08% (Δ C/A). Corrected from MUT values.</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary Comparison */}
          <div className="page-break" style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "11pt", fontWeight: "800", color: "#1e3a5f", borderBottom: "2.5px solid #1e3a5f", paddingBottom: "5px", marginBottom: "12px" }}>
              SUMMARY COMPARISON – ALL MODULES
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
              <thead>
                <tr style={{ background: "#1e3a5f", color: "white" }}>
                  <th style={{ padding: "5px 8px" }}>Module ID</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Pmax NP (W)</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Pmax Initial (A)</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Pmax Post-Test (C)</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Δ C/A (Pmax)</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Δ C/NP (Pmax)</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Voc Δ C/A</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Isc Δ C/A</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>FF Δ C/A</th>
                  <th style={{ padding: "5px 8px", textAlign: "center" }}>Overall</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m, mi) => {
                  const A = measA[mi]; const C = measC[mi]; const np = m.np;
                  const dPCA = dev(A.pmax, C.pmax);
                  const dPCNP = dev(np.pmax, C.pmax);
                  const pass = Math.abs(parseFloat(dPCA)) < 5;
                  return (
                    <tr key={mi} style={{ background: mi % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "5px 8px", fontWeight: "600" }}>{m.id}</td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>{np.pmax}</td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>{A.pmax.toFixed(1)}</td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>{C.pmax.toFixed(1)}</td>
                      <td style={{ padding: "5px 8px", textAlign: "center", color: "#d97706", fontWeight: "700" }}>
                        {parseFloat(dPCA) > 0 ? "+" : ""}{dPCA}%
                      </td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>{parseFloat(dPCNP) > 0 ? "+" : ""}{dPCNP}%</td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>{dev(A.voc, C.voc)}%</td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>{dev(A.isc, C.isc)}%</td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>{dev(A.ff, C.ff)}%</td>
                      <td style={{ padding: "5px 8px", textAlign: "center" }}>
                        <span style={{ background: pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "700" }}>
                          {pass ? "PASS" : "FAIL"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signature */}
            <div style={{ marginTop: "30px", borderTop: "1px solid #ddd", paddingTop: "16px" }}>
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
                    <div style={{ color: "#1e3a5f", fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
                    <div style={{ color: "#999", fontSize: "7pt" }}>Date: 2026-03-14</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: "12px", fontSize: "7.5pt", color: "#666" }}>
              {REPORT_NO} · SolarLabX, Pune · NABL TC-8192 · ISO/IEC 17025:2017
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
