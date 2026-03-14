// @ts-nocheck
"use client";

import { useState } from "react";

const REPORT_NO = "SLX-RPT-LETID-2026-001";

const MODULES = [
  { id: "SLX-M101", mcind: "MCIND-2026-011", manufacturer: "Jinko Solar", type: "JKM545M-72HL4-BDVP", cell: "Mono-PERC Bifacial", cells: "144 half-cut", dims: "2278 × 1134 × 30 mm", bifaciality: "0.70", year: "2025" },
  { id: "SLX-M102", mcind: "MCIND-2026-012", manufacturer: "Jinko Solar", type: "JKM545M-72HL4-BDVP", cell: "Mono-PERC Bifacial", cells: "144 half-cut", dims: "2278 × 1134 × 30 mm", bifaciality: "0.70", year: "2025" },
  { id: "SLX-M103", mcind: "MCIND-2026-013", manufacturer: "Jinko Solar", type: "JKM545M-72HL4-BDVP", cell: "Mono-PERC Bifacial", cells: "144 half-cut", dims: "2278 × 1134 × 30 mm", bifaciality: "0.70", year: "2025" },
];

// STC data columns: Nameplate / Initial(A) / After B-O Precon(B) / After LeTID(C) → deviation chains
const STC_FRONT = [
  { param: "Pmax (W)", np: "545", A: "547.8", B: "534.2", C: "537.1", devBA: "−2.48%", devCB: "+0.55%", devCA: "−1.95%", pass: true },
  { param: "Vmpp (V)", np: "41.8", A: "42.01", B: "41.22", C: "41.48", devBA: "−1.88%", devCB: "+0.63%", devCA: "−1.26%", pass: true },
  { param: "Impp (A)", np: "13.03", A: "13.04", B: "12.96", C: "12.95", devBA: "−0.61%", devCB: "−0.08%", devCA: "−0.69%", pass: true },
  { param: "Voc (V)", np: "49.8", A: "49.98", B: "49.82", C: "49.91", devBA: "−0.32%", devCB: "+0.18%", devCA: "−0.14%", pass: true },
  { param: "Isc (A)", np: "13.85", A: "13.87", B: "13.81", C: "13.83", devBA: "−0.43%", devCB: "+0.14%", devCA: "−0.29%", pass: true },
  { param: "FF (%)", np: "79.1", A: "79.25", B: "77.82", C: "78.31", devBA: "−1.80%", devCB: "+0.63%", devCA: "−1.19%", pass: true },
];
const STC_REAR = [
  { param: "Pmax (W)", np: "381.5", A: "384.5", B: "374.9", C: "376.3", devBA: "−2.50%", devCB: "+0.37%", devCA: "−2.14%", pass: true },
  { param: "Vmpp (V)", np: "41.2", A: "41.45", B: "40.71", C: "40.89", devBA: "−1.79%", devCB: "+0.44%", devCA: "−1.35%", pass: true },
  { param: "Impp (A)", np: "9.12", A: "9.16", B: "9.11", C: "9.09", devBA: "−0.55%", devCB: "−0.22%", devCA: "−0.76%", pass: true },
  { param: "Voc (V)", np: "49.3", A: "49.52", B: "49.38", C: "49.46", devBA: "−0.28%", devCB: "+0.16%", devCA: "−0.12%", pass: true },
  { param: "Isc (A)", np: "9.81", A: "9.84", B: "9.79", C: "9.81", devBA: "−0.51%", devCB: "+0.20%", devCA: "−0.30%", pass: true },
  { param: "FF (%)", np: "78.8", A: "79.01", B: "77.58", C: "78.05", devBA: "−1.81%", devCB: "+0.61%", devCA: "−1.21%", pass: true },
];

export default function LeTIDReportPage() {
  const [reportNo] = useState(REPORT_NO);
  const [issueDate] = useState("2026-03-14");
  const [preparedBy] = useState("Ms. K. Mehta");
  const [checkedBy] = useState("Dr. S. Pillai");
  const [authorizedBy] = useState("Prof. G. Krishnan");
  const [issuedBy] = useState("Mr. D. Rao");

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-container { box-shadow: none !important; max-width: 100% !important; }
          .page-break { break-before: page; }
          @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold text-gray-800">LeTID Test Report – IEC CD 61215:2020</h1>
          <p className="text-sm text-gray-500">Light and elevated Temperature Induced Degradation · Bifacial Modules</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri', 'Arial', sans-serif", fontSize: "10pt", color: "#1a1a1a" }}>

        {/* ═══════════════ COVER PAGE ═══════════════ */}
        <div style={{ minHeight: "297mm", display: "flex", flexDirection: "column", padding: "20mm 20mm 15mm" }}>
          {/* Lab Header */}
          <div style={{ borderBottom: "3px solid #0f4c81", paddingBottom: "12px", marginBottom: "16px" }}>
            <div className="flex items-start justify-between">
              <div>
                <div style={{ fontSize: "22pt", fontWeight: "800", color: "#0f4c81", letterSpacing: "-0.5px" }}>☀ SolarLabX</div>
                <div style={{ fontSize: "9pt", color: "#2d7dd2", marginTop: "2px" }}>Solar PV Testing &amp; Certification Laboratory</div>
                <div style={{ fontSize: "8pt", color: "#666", marginTop: "4px" }}>
                  NABL Accredited · ISO/IEC 17025:2017 · Accreditation No: TC-8192<br />
                  Plot 47, MIDC Industrial Area, Pune – 411018, Maharashtra, India
                </div>
              </div>
              <div style={{ textAlign: "right", border: "1px solid #ddd", padding: "8px 12px", borderRadius: "4px", background: "#f9f9f9", fontSize: "8pt" }}>
                <table>
                  <tbody>
                    <tr><td style={{ paddingRight: "12px", color: "#555" }}>Report No:</td><td style={{ fontWeight: "700", fontFamily: "monospace" }}>{reportNo}</td></tr>
                    <tr><td style={{ color: "#555" }}>Issue Date:</td><td>{issueDate}</td></tr>
                    <tr><td style={{ color: "#555" }}>Status:</td><td><span style={{ background: "#22c55e", color: "white", padding: "1px 6px", borderRadius: "3px", fontSize: "7pt" }}>ISSUED</span></td></tr>
                    <tr><td style={{ color: "#555" }}>Pages:</td><td>20</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Title Box */}
          <div style={{ background: "#0f4c81", color: "white", padding: "20px", borderRadius: "4px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "13pt", fontWeight: "600", marginBottom: "6px" }}>TEST REPORT</div>
            <div style={{ fontSize: "18pt", fontWeight: "800", marginBottom: "8px" }}>
              Light and elevated Temperature Induced Degradation (LeTID) Test
            </div>
            <div style={{ fontSize: "10pt", opacity: 0.85 }}>as per IEC CD 61215:2020 (Annex C – LeTID Evaluation Protocol)</div>
            <div style={{ fontSize: "9pt", opacity: 0.7, marginTop: "4px" }}>Bifacial Mono-PERC Crystalline Silicon Modules · 144 Half-Cut Cells</div>
          </div>

          {/* Customer / Lab Info */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "20px" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontSize: "8pt", fontWeight: "700", color: "#0f4c81", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Customer Information</div>
              <div style={{ fontSize: "8.5pt" }}>
                <p><strong>Organization:</strong> Jinko Solar Technology Co., Ltd.</p>
                <p><strong>Address:</strong> No. 1 Jinkeyuan Road, Shangrao, Jiangxi 334100, P.R. China</p>
                <p><strong>Contact:</strong> Ms. Li Wei · +86-793-846-5678</p>
                <p><strong>Email:</strong> quality@jinkosolar.com</p>
                <p><strong>PO Reference:</strong> JKO-2026-SLX-0089</p>
              </div>
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontSize: "8pt", fontWeight: "700", color: "#0f4c81", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Test Summary</div>
              <div style={{ fontSize: "8.5pt" }}>
                <p><strong>Standard:</strong> IEC CD 61215:2020 – LeTID Protocol</p>
                <p><strong>Technology:</strong> Bifacial Mono-PERC, 144 half-cut cells</p>
                <p><strong>Samples:</strong> 3 modules</p>
                <p><strong>Test Period:</strong> 2026-01-10 to 2026-03-05</p>
                <p><strong>LeTID Duration:</strong> 200 hours</p>
              </div>
            </div>
          </div>

          {/* Overall Result */}
          <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", padding: "12px 20px", marginBottom: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "14pt", fontWeight: "800", color: "#15803d" }}>✓ OVERALL RESULT: PASS</span>
            <div style={{ fontSize: "8.5pt", color: "#166534", marginTop: "4px" }}>All 3 samples passed LeTID test – Power recovery observed post-LeTID, degradation within limits</div>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "16px" }}>
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#0f4c81", marginBottom: "12px", textTransform: "uppercase" }}>Authorisation &amp; Signatures</div>
            <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
              {[
                { role: "Prepared By", name: preparedBy, title: "Lab Technician" },
                { role: "Checked By", name: checkedBy, title: "Senior Engineer" },
                { role: "Authorized By", name: authorizedBy, title: "Technical Manager" },
                { role: "Issued By", name: issuedBy, title: "Quality Manager" },
              ].map((sig) => (
                <div key={sig.role} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
                  <div style={{ fontWeight: "600" }}>{sig.name}</div>
                  <div style={{ color: "#666", fontSize: "7.5pt" }}>{sig.title}</div>
                  <div style={{ color: "#0f4c81", fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
                  <div style={{ color: "#999", fontSize: "7pt" }}>Date: {issueDate}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "7.5pt", color: "#999", borderTop: "1px solid #eee", paddingTop: "8px" }}>
            CONFIDENTIAL – SolarLabX Report {reportNo} · Reproduction requires written consent.
          </div>
        </div>

        {/* ═══════════════ DISCLAIMER & TOC ═══════════════ */}
        <div className="page-break" style={{ padding: "15mm 20mm", fontSize: "8.5pt" }}>
          <SectionHeader num="1" title="DISCLAIMER" accent="#0f4c81" />
          <p style={{ marginBottom: "10px" }}>This report presents results of LeTID evaluation tests performed by SolarLabX on the module samples submitted by the customer. The results relate exclusively to the items tested. The test methodology follows the draft IEC CD 61215:2020 Annex C protocol for LeTID characterisation.</p>
          <p style={{ marginBottom: "10px" }}>LeTID (Light and elevated Temperature Induced Degradation) is a transient degradation effect observed in p-type Mono-PERC and some other technologies under illumination at elevated temperatures. This report characterises the extent of degradation and recovery of the submitted modules according to the standardised protocol.</p>
          <p>Measurement uncertainty evaluated per JCGM 100:2008 (GUM). Expanded uncertainty stated at 95% confidence (k=2). Results traceable to PTB/NIST standards via NABL accredited reference instruments.</p>

          <SectionHeader num="2" title="TABLE OF CONTENTS" accent="#0f4c81" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <tbody>
              {[
                ["1", "Disclaimer", "2"],
                ["2", "Table of Contents", "2"],
                ["3", "Test Sequence Flowchart", "3"],
                ["4", "Module Description", "4"],
                ["5", "Initial STC Measurement (A)", "5"],
                ["6", "B-O CID Preconditioning", "7"],
                ["7", "STC After B-O Preconditioning (B)", "8"],
                ["8", "EL Imaging – Pre-LeTID", "10"],
                ["9", "LeTID Stress Test Parameters", "11"],
                ["10", "STC After LeTID (C)", "12"],
                ["11", "EL Imaging – Post-LeTID", "15"],
                ["12", "Visual Inspection", "16"],
                ["13", "Reproducibility Analysis", "17"],
                ["14", "Measurement Uncertainty", "18"],
                ["15", "Equipment Used", "19"],
                ["16", "Conclusions", "20"],
              ].map(([sec, title, page]) => (
                <tr key={sec} style={{ borderBottom: "1px dotted #ddd" }}>
                  <td style={{ padding: "4px 8px", width: "30px" }}>{sec}</td>
                  <td style={{ padding: "4px 8px" }}>{title}</td>
                  <td style={{ padding: "4px 8px", textAlign: "right", width: "40px" }}>{page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ TEST SEQUENCE ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="3" title="TEST SEQUENCE FLOWCHART" accent="#0f4c81" />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", marginTop: "16px" }}>
            {[
              { label: "Receive Modules\n& Registration", bg: "#0f4c81", color: "white", shape: "rounded" },
              null,
              { label: "Visual Inspection (Pre)", bg: "#dbeafe", color: "#1e3a5f", shape: "rect", border: "#3b82f6" },
              null,
              { label: "STC Flash Test\nInitial Measurement (A)\n[Front & Rear]", bg: "#dbeafe", color: "#1e3a5f", shape: "rect", border: "#3b82f6" },
              null,
              { label: "B-O CID Preconditioning\nIsc current · 25°C · 24hr\n(Dark Chamber – no illumination)", bg: "#fef3c7", color: "#92400e", shape: "rect", border: "#f59e0b" },
              null,
              { label: "STC Flash Test\nAfter B-O Preconditioning (B)\n[Front & Rear]", bg: "#dbeafe", color: "#1e3a5f", shape: "rect", border: "#3b82f6" },
              null,
              { label: "EL Imaging\n(Pre-LeTID at Isc)", bg: "#dbeafe", color: "#1e3a5f", shape: "rect", border: "#3b82f6" },
              null,
              { label: "LeTID Stress Test\n75°C · RH 45% · Isc−Imp current · 200hr", bg: "#fce7f3", color: "#831843", shape: "rect", border: "#ec4899" },
              null,
              { label: "STC Flash Test\nAfter LeTID (C)\n[Front & Rear]", bg: "#d1fae5", color: "#065f46", shape: "rect", border: "#22c55e" },
              null,
              { label: "EL Imaging + Visual Inspection\n(Post-LeTID)", bg: "#d1fae5", color: "#065f46", shape: "rect", border: "#22c55e" },
              null,
              { label: "REPORT\nISSUED", bg: "#0f4c81", color: "white", shape: "rounded" },
            ].map((step, i) => step === null ? (
              <div key={i} style={{ width: "2px", height: "18px", background: "#94a3b8" }} />
            ) : (
              <div key={i} style={{
                background: step.bg, color: step.color, padding: "10px 28px", textAlign: "center",
                fontWeight: "600", fontSize: "8.5pt",
                borderRadius: step.shape === "rounded" ? "6px" : "4px",
                border: step.border ? `2px solid ${step.border}` : "none",
                minWidth: "280px",
              }}>
                {step.label.split("\n").map((l, j) => <div key={j}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ MODULE DESCRIPTION ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="4" title="MODULE DESCRIPTION" accent="#0f4c81" />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "12px" }}>Three bifacial Mono-PERC modules were received. All samples are of identical specification. Module is double-glass bifacial type with 144 half-cut cells arranged in 6 strings of 24 cells.</p>

          <div className="grid grid-cols-3 gap-4">
            {MODULES.map((m, i) => (
              <div key={i} style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
                <div style={{ fontWeight: "700", color: "#0f4c81", marginBottom: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", fontSize: "9.5pt" }}>
                  Sample {i + 1}
                </div>
                <table style={{ fontSize: "7.5pt", width: "100%" }}>
                  <tbody>
                    {[
                      ["Lab No.", m.id],
                      ["MCIND No.", m.mcind],
                      ["Maker", m.manufacturer],
                      ["Model", m.type],
                      ["Cell", m.cell],
                      ["Cells", m.cells],
                      ["Dims (mm)", m.dims],
                      ["Bifaciality", m.bifaciality],
                      ["Year", m.year],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ color: "#666", paddingRight: "6px", paddingBottom: "3px", width: "45%" }}>{k}:</td>
                        <td style={{ fontWeight: "500", paddingBottom: "3px", fontSize: "7pt" }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="grid grid-cols-3 gap-1 mt-3">
                  {["Front", "Rear", "Label"].map(label => (
                    <div key={label} style={{ border: "1px dashed #ccc", height: "55px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9", fontSize: "6.5pt", color: "#999" }}>
                      [{label}]
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cell layout for 144 half-cut (6 strings × 24) */}
          <SubHeader>4.1 Cell Layout (6 Strings × 24 Half-Cut Cells)</SubHeader>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "6pt" }}>
              <thead>
                <tr>
                  <th style={{ width: "18px", padding: "2px" }}></th>
                  {Array.from({ length: 24 }, (_, i) => (
                    <th key={i} style={{ width: "24px", padding: "2px", textAlign: "center", color: "#666", fontWeight: "normal" }}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["A", "B", "C", "D", "E", "F"].map(row => (
                  <tr key={row}>
                    <td style={{ fontWeight: "700", color: "#0f4c81", padding: "1px 3px", fontSize: "7pt" }}>{row}</td>
                    {Array.from({ length: 24 }, (_, i) => (
                      <td key={i} style={{ width: "24px", height: "16px", border: "0.5px solid #94a3b8", background: "#e0f2fe", textAlign: "center", color: "#555", fontSize: "5.5pt" }}>✓</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "7.5pt", color: "#666", marginTop: "4px" }}>Cell matrix – front side. ✓ = no defect detected. Rear side identical configuration.</p>
        </div>

        {/* ═══════════════ B-O CID PRECONDITIONING ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="5" title="B-O CID PRECONDITIONING" accent="#0f4c81" />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "12px" }}>
            Boron-Oxygen (B-O) complex Induced Degradation (CID) preconditioning is performed to stabilise LID prior to LeTID assessment. Modules are stressed at Isc current at room temperature in a dark chamber for 24 hours without illumination.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <InfoGrid accent="#0f4c81" items={[
                ["Applied Current", "Isc (≈ 13.87 A per module)"],
                ["Temperature", "25°C ± 2°C"],
                ["Duration", "24 hours"],
                ["Illumination", "None (dark chamber)"],
                ["Chamber Used", "Weiss BDL-720 Dark Box"],
                ["SMU Used", "Keysight N6705C DC Power Analyser"],
              ]} />
            </div>
            <div>
              <InfoGrid accent="#0f4c81" items={[
                ["Start Date", "2026-01-18"],
                ["End Date", "2026-01-19"],
                ["Current Stability", "±0.5% over 24 hr"],
                ["Temperature Stability", "±0.8°C"],
                ["Monitoring Interval", "Every 15 min"],
                ["Cal. Cert. SMU", "SLX-EQ-031 (Valid: 2026-11-30)"],
              ]} />
            </div>
          </div>

          <SubHeader>5.1 B-O Preconditioning Results</SubHeader>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#0f4c81", color: "white" }}>
                {["Sample", "Applied Current (A)", "Voltage at End (V)", "Power Dissipated (W)", "Duration (hr)", "Status"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px" }}>{m.id}</td>
                  <td style={{ padding: "5px 8px", textAlign: "right" }}>13.87</td>
                  <td style={{ padding: "5px 8px", textAlign: "right" }}>0.42</td>
                  <td style={{ padding: "5px 8px", textAlign: "right" }}>5.83</td>
                  <td style={{ padding: "5px 8px", textAlign: "right" }}>24.0</td>
                  <td style={{ padding: "5px 8px" }}><PassBadge pass={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: "7.5pt", color: "#666", marginTop: "6px" }}>
            Note: B-O CID preconditioning saturates the B-O complex degradation. Any subsequent degradation observed during LeTID can then be attributed solely to the LeTID mechanism.
          </p>
        </div>

        {/* ═══════════════ STC RESULTS – FRONT & REAR ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="6" title="STC FLASH TEST RESULTS – FRONT & REAR SIDES" accent="#0f4c81" />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "8px" }}>
            STC: 1000 W/m² · 25°C · AM1.5G | Bifacial measurement: rear covered with opaque black back-sheet during front measurement and vice versa.
          </p>
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "12px" }}>
            <strong>(A)</strong> Initial measurement &nbsp;·&nbsp; <strong>(B)</strong> After B-O CID Preconditioning &nbsp;·&nbsp; <strong>(C)</strong> After LeTID (200 hr)
          </p>

          {/* FRONT SIDE */}
          <SubHeader>6.1 Front Side STC Results (Sample 1: {MODULES[0].id})</SubHeader>
          <STCTable data={STC_FRONT} accentColor="#0f4c81" />
          <div style={{ fontSize: "7.5pt", color: "#666", margin: "4px 0 14px", padding: "0 4px" }}>
            Criterion: (C−A)/A × 100 (net LeTID degradation) must be within ±5% for Pmax. Recovery from B→C indicates LeTID mechanism.
          </div>

          {/* REAR SIDE */}
          <SubHeader>6.2 Rear Side STC Results (Sample 1: {MODULES[0].id})</SubHeader>
          <STCTable data={STC_REAR} accentColor="#0f4c81" isRear />

          {/* Reproducibility section */}
          <div className="page-break" />
          <SubHeader>6.3 Gate Analysis – Reproducibility (P_BO and n values)</SubHeader>
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>
            Gate analysis performed per IEC CD 61215:2020 Annex C to confirm reproducibility across samples. P_BO = power at B-O saturation; n = number of BO complexes; r = recovery coefficient.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: "#0f4c81", color: "white" }}>
                {["Sample", "P_BO (W)", "ΔP_LeTID (%)", "n (BO complexes)", "r (recovery %)", "SMU Uncertainty", "Chamber Uncertainty"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "center", fontSize: "7.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px" }}>{m.id}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>534.{i + 1}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#d97706" }}>−2.4{i + 8}%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>3.2 × 10⁻³</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>+0.5{i + 3}%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>±0.5%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>±1°C, ±3%RH</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ LETID TEST PARAMETERS ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="7" title="LeTID STRESS TEST PARAMETERS" accent="#0f4c81" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <InfoGrid accent="#0f4c81" items={[
                ["Applied Current", "Isc − Imp (≈ 0.84 A per module)"],
                ["Temperature", "75°C ± 2°C"],
                ["Relative Humidity", "45% RH ± 5%"],
                ["Duration", "200 hours"],
                ["Number of Cycles", "1"],
                ["Illumination", "None (current-only)"],
              ]} />
            </div>
            <div>
              <InfoGrid accent="#0f4c81" items={[
                ["Start Date", "2026-01-22"],
                ["End Date", "2026-01-31"],
                ["Chamber", "Weiss WT-600/70 Climatic"],
                ["SMU", "Keysight N6705C"],
                ["Monitoring", "Every 30 min"],
                ["Current Stability", "±0.3% over 200 hr"],
              ]} />
            </div>
          </div>

          <SubHeader>7.1 EL Images – Pre & Post LeTID (Sample 1)</SubHeader>
          <div className="grid grid-cols-4 gap-3" style={{ marginTop: "8px" }}>
            {["Pre-LeTID Front", "Pre-LeTID Rear", "Post-LeTID Front", "Post-LeTID Rear"].map(label => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ border: "1px dashed #ccc", height: "100px", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", fontSize: "7pt", color: "#666", marginBottom: "4px", borderRadius: "3px" }}>
                  [EL Image – {label.split(" ")[0]}]
                </div>
                <div style={{ fontSize: "7pt", color: "#555" }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "8px", fontSize: "8.5pt", color: "#555" }}>
            <strong>EL Observation:</strong> No visible microcrack formation or new dark cell areas detected post-LeTID. Minor shunting present in cells E8-E9 (pre-existing, confirmed by comparison). No new defects attributable to LeTID stress.
          </div>

          <SubHeader>7.2 Visual Inspection Summary</SubHeader>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#334155", color: "white" }}>
                {["Sample", "Pre-LeTID Visual", "Post-LeTID Visual", "Defects Found", "Result"].map(h => (
                  <th key={h} style={{ padding: "5px 8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px" }}>{m.id}</td>
                  <td style={{ padding: "5px 8px" }}>No defects</td>
                  <td style={{ padding: "5px 8px" }}>No new defects</td>
                  <td style={{ padding: "5px 8px", color: "#059669" }}>None</td>
                  <td style={{ padding: "5px 8px" }}><PassBadge pass={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ CONCLUSIONS ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="8" title="CONCLUSIONS" accent="#0f4c81" />

          <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11pt", fontWeight: "700", color: "#15803d", marginBottom: "6px" }}>✓ ALL SAMPLES PASSED – IEC CD 61215:2020 LeTID Protocol</div>
            <p style={{ fontSize: "8.5pt", color: "#166534" }}>
              All 3 bifacial Mono-PERC samples of Jinko JKM545M-72HL4-BDVP passed the LeTID evaluation per IEC CD 61215:2020 Annex C. After B-O CID preconditioning, maximum power degradation (B→A) was ≈2.5%. Post-LeTID recovery (C→B) of ≈0.55% was observed, consistent with the LeTID mechanism. Net degradation post-LeTID vs. initial (C→A) was within the acceptable limit.
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: "#0f4c81", color: "white" }}>
                {["Sample", "ΔPmax B→A", "ΔPmax C→B", "ΔPmax C→A", "Front EL", "Rear EL", "Visual", "Overall"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{m.id}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#d97706" }}>−2.48%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>+0.55%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#d97706" }}>−1.95%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#0f4c81", marginBottom: "12px" }}>AUTHORISATION</div>
            <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
              {[
                { role: "Prepared By", name: preparedBy, title: "Lab Technician" },
                { role: "Checked By", name: checkedBy, title: "Senior Engineer" },
                { role: "Authorized By", name: authorizedBy, title: "Technical Manager" },
                { role: "Issued By", name: issuedBy, title: "Quality Manager" },
              ].map((sig) => (
                <div key={sig.role} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
                  <div style={{ fontWeight: "600" }}>{sig.name}</div>
                  <div style={{ color: "#666", fontSize: "7.5pt" }}>{sig.title}</div>
                  <div style={{ color: "#0f4c81", fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
                  <div style={{ color: "#999", fontSize: "7pt" }}>Date: {issueDate}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px", padding: "8px 12px", background: "#f8fafc", border: "1px solid #ddd", borderRadius: "4px", fontSize: "7.5pt", color: "#666" }}>
            <strong>End of Report – {reportNo}</strong> · SolarLabX, Pune · NABL TC-8192 · ISO/IEC 17025:2017 Accredited
          </div>
        </div>

      </div>
    </>
  );
}

/* ─── Sub-components ─── */
function SectionHeader({ num, title, accent = "#1e3a5f" }: { num: string; title: string; accent?: string }) {
  return (
    <div style={{ fontSize: "11pt", fontWeight: "800", color: accent, borderBottom: `2.5px solid ${accent}`, paddingBottom: "5px", marginBottom: "12px" }}>
      {num}. {title}
    </div>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "9.5pt", fontWeight: "700", color: "#334155", marginTop: "12px", marginBottom: "6px" }}>
      {children}
    </div>
  );
}

function InfoGrid({ items, accent = "#1e3a5f" }: { items: [string, string][]; accent?: string }) {
  return (
    <div style={{ fontSize: "8.5pt", border: "1px solid #e5e7eb", padding: "10px", borderRadius: "4px", background: "#f8fafc" }}>
      {items.map(([k, v]) => (
        <div key={k} className="flex gap-2" style={{ marginBottom: "3px" }}>
          <span style={{ color: "#666", minWidth: "140px" }}>{k}:</span>
          <span style={{ fontWeight: "500" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function STCTable({ data, accentColor, isRear = false }: { data: any[]; accentColor: string; isRear?: boolean }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
      <thead>
        <tr style={{ background: accentColor, color: "white" }}>
          <th style={{ padding: "5px 8px", textAlign: "left" }}>Parameter</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>Nameplate</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>Initial (A)</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>After B-O Precon (B)</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>After LeTID (C)</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>Dev B→A</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>Dev C→B</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>Dev C→A</th>
          <th style={{ padding: "5px 8px", textAlign: "center" }}>Pass</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
            <td style={{ padding: "4px 8px", fontWeight: "500" }}>{row.param}</td>
            <td style={{ padding: "4px 8px", textAlign: "center" }}>{isRear ? (parseFloat(row.np) * 0.70).toFixed(1) : row.np}</td>
            <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.A}</td>
            <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.B}</td>
            <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.C}</td>
            <td style={{ padding: "4px 8px", textAlign: "center", color: "#d97706" }}>{row.devBA}</td>
            <td style={{ padding: "4px 8px", textAlign: "center", color: "#059669" }}>{row.devCB}</td>
            <td style={{ padding: "4px 8px", textAlign: "center", color: "#d97706" }}>{row.devCA}</td>
            <td style={{ padding: "4px 8px", textAlign: "center" }}><PassBadge pass={row.pass} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PassBadge({ pass }: { pass: boolean }) {
  return (
    <span style={{ background: pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600" }}>
      {pass ? "PASS" : "FAIL"}
    </span>
  );
}
