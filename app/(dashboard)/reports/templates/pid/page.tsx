// @ts-nocheck
"use client";

import { useState } from "react";
import { IVCurveComparisonChart } from "@/components/reports/IVCurveComparisonChart";
import { PmaxStabilizationChart, InsulationResistanceChart, PowerDegradationChart } from "@/components/reports/ReportSummaryCharts";

const REPORT_NO = "SLX-RPT-PID-2026-001";

const MODULES = [
  { id: "SLX-M001", mcind: "MCIND-2026-001", manufacturer: "Axitec Energy GmbH", type: "AC-430MH/144V", cell: "Mono-PERC", cells: "144 (72×2 half-cut)", dims: "2108 × 1048 × 35 mm", frame: "Anodized Aluminium", year: "2025" },
  { id: "SLX-M002", mcind: "MCIND-2026-002", manufacturer: "Axitec Energy GmbH", type: "AC-430MH/144V", cell: "Mono-PERC", cells: "144 (72×2 half-cut)", dims: "2108 × 1048 × 35 mm", frame: "Anodized Aluminium", year: "2025" },
  { id: "SLX-M003", mcind: "MCIND-2026-003", manufacturer: "Axitec Energy GmbH", type: "AC-430MH/144V", cell: "Mono-PERC", cells: "144 (72×2 half-cut)", dims: "2108 × 1048 × 35 mm", frame: "Anodized Aluminium", year: "2025" },
  { id: "SLX-M004", mcind: "MCIND-2026-004", manufacturer: "Axitec Energy GmbH", type: "AC-430MH/144V", cell: "Mono-PERC", cells: "144 (72×2 half-cut)", dims: "2108 × 1048 × 35 mm", frame: "Anodized Aluminium", year: "2025" },
];

const STC_DATA = [
  { param: "Pmax (W)", nameplate: "430", initialA: "432.1", afterB: "431.8", devA: "+0.49%", devB: "-0.07%", pass: true },
  { param: "Vmpp (V)", nameplate: "35.8", initialA: "35.92", afterB: "35.88", devA: "+0.34%", devB: "-0.11%", pass: true },
  { param: "Impp (A)", nameplate: "12.01", initialA: "12.03", afterB: "12.02", devA: "+0.17%", devB: "-0.08%", pass: true },
  { param: "Voc (V)", nameplate: "43.2", initialA: "43.41", afterB: "43.38", devA: "+0.49%", devB: "-0.07%", pass: true },
  { param: "Isc (A)", nameplate: "12.83", initialA: "12.85", afterB: "12.84", devA: "+0.16%", devB: "-0.08%", pass: true },
  { param: "FF (%)", nameplate: "77.8", initialA: "77.91", afterB: "77.89", devA: "+0.14%", devB: "-0.03%", pass: true },
];

const WLC_DATA = [
  { label: "Pre-PID (-ve)", readings: ["6250", "6180", "6210"], riso: "≥40 MΩ·m²", result: "PASS" },
  { label: "Post-PID (-ve)", readings: ["5890", "5920", "5910"], riso: "≥40 MΩ·m²", result: "PASS" },
  { label: "Pre-PID (+ve)", readings: ["6340", "6280", "6310"], riso: "≥40 MΩ·m²", result: "PASS" },
  { label: "Post-PID (+ve)", readings: ["5980", "6010", "5990"], riso: "≥40 MΩ·m²", result: "PASS" },
];

export default function PIDReportPage() {
  const [reportNo, setReportNo] = useState(REPORT_NO);
  const [customer, setCustomer] = useState("Axitec Energy GmbH & Co. KG, Schützenstraße 35, 80335 München, Germany");
  const [issueDate, setIssueDate] = useState("2026-03-14");
  const [preparedBy, setPreparedBy] = useState("Dr. A. Sharma");
  const [checkedBy, setCheckedBy] = useState("Mr. R. Verma");
  const [authorizedBy, setAuthorizedBy] = useState("Prof. G. Krishnan");
  const [issuedBy, setIssuedBy] = useState("Ms. P. Nair");

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .report-container { box-shadow: none !important; max-width: 100% !important; }
          .page-break { break-before: page; }
          @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
          @page { @top-center { content: "SolarLabX – CONFIDENTIAL"; font-size: 8pt; color: #666; } }
          @page { @bottom-center { content: "Report No: ${reportNo}  |  Page " counter(page) " of " counter(pages); font-size: 8pt; color: #666; } }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
        .editable-field { border-bottom: 1px dashed #aaa; min-width: 120px; display: inline-block; padding: 1px 4px; }
        .editable-field:focus { outline: none; border-bottom-color: #2563eb; background: #eff6ff; }
        input.editable-input { border: none; border-bottom: 1px dashed #aaa; background: transparent; padding: 1px 4px; font-size: inherit; font-family: inherit; width: 100%; }
        input.editable-input:focus { outline: none; border-bottom-color: #2563eb; background: #eff6ff; }
      `}</style>

      {/* Toolbar */}
      <div className="no-print flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold text-gray-800">PID Test Report – IEC TS 62804-1:2015</h1>
          <p className="text-sm text-gray-500">Edit fields below · Click Print / Save as PDF when ready</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri', 'Arial', sans-serif", fontSize: "10pt", color: "#1a1a1a" }}>

        {/* ═══════════════ COVER PAGE ═══════════════ */}
        <div style={{ minHeight: "297mm", display: "flex", flexDirection: "column", padding: "20mm 20mm 15mm" }}>

          {/* Lab Header */}
          <div style={{ borderBottom: "3px solid #1e3a5f", paddingBottom: "12px", marginBottom: "16px" }}>
            <div className="flex items-start justify-between">
              <div>
                <div style={{ fontSize: "22pt", fontWeight: "800", color: "#1e3a5f", letterSpacing: "-0.5px" }}>☀ SolarLabX</div>
                <div style={{ fontSize: "9pt", color: "#4a6fa5", marginTop: "2px" }}>Solar PV Testing &amp; Certification Laboratory</div>
                <div style={{ fontSize: "8pt", color: "#666", marginTop: "4px" }}>
                  NABL Accredited · ISO/IEC 17025:2017 · Accreditation No: TC-8192<br />
                  Plot 47, MIDC Industrial Area, Pune – 411018, Maharashtra, India<br />
                  Tel: +91-20-2712-4567 · Email: lab@solarlabx.in · www.solarlabx.in
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "8pt", color: "#666", border: "1px solid #ddd", padding: "8px 12px", borderRadius: "4px", background: "#f9f9f9" }}>
                  <table style={{ fontSize: "8pt" }}>
                    <tbody>
                      <tr><td style={{ paddingRight: "12px", color: "#555" }}>Report No:</td><td style={{ fontWeight: "700", fontFamily: "monospace" }}>{reportNo}</td></tr>
                      <tr><td style={{ color: "#555" }}>Issue Date:</td><td>{issueDate}</td></tr>
                      <tr><td style={{ color: "#555" }}>Status:</td><td><span style={{ background: "#22c55e", color: "white", padding: "1px 6px", borderRadius: "3px", fontSize: "7pt" }}>ISSUED</span></td></tr>
                      <tr><td style={{ color: "#555" }}>Pages:</td><td>18</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Report Title Box */}
          <div style={{ background: "#1e3a5f", color: "white", padding: "20px", borderRadius: "4px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "13pt", fontWeight: "600", marginBottom: "6px" }}>TEST REPORT</div>
            <div style={{ fontSize: "18pt", fontWeight: "800", marginBottom: "8px" }}>
              Potential Induced Degradation (PID) Test
            </div>
            <div style={{ fontSize: "10pt", opacity: 0.85 }}>as per IEC TS 62804-1:2015 Method A</div>
            <div style={{ fontSize: "9pt", opacity: 0.7, marginTop: "4px" }}>Crystalline Silicon Terrestrial PV Modules</div>
          </div>

          {/* Customer / Lab Info */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "20px" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontSize: "8pt", fontWeight: "700", color: "#1e3a5f", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Customer Information</div>
              <div style={{ fontSize: "8.5pt" }}>
                <p><strong>Organization:</strong> Axitec Energy GmbH &amp; Co. KG</p>
                <p><strong>Address:</strong> Schützenstraße 35, 80335 München, Germany</p>
                <p><strong>Contact:</strong> Mr. Klaus Weber · +49-89-4567-890</p>
                <p><strong>Email:</strong> testing@axitec-energy.de</p>
                <p><strong>PO Reference:</strong> AXI-2026-LAB-0042</p>
              </div>
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontSize: "8pt", fontWeight: "700", color: "#1e3a5f", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Laboratory Information</div>
              <div style={{ fontSize: "8.5pt" }}>
                <p><strong>Laboratory:</strong> SolarLabX – PV Testing Division</p>
                <p><strong>Location:</strong> Pune, Maharashtra, India</p>
                <p><strong>Accreditation:</strong> NABL TC-8192 / IEC 17025:2017</p>
                <p><strong>Test Location:</strong> On-site (Lab premises)</p>
                <p><strong>Test Period:</strong> 2026-01-15 to 2026-03-01</p>
              </div>
            </div>
          </div>

          {/* Module Summary */}
          <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px", marginBottom: "24px", background: "#f8fafc" }}>
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#1e3a5f", marginBottom: "8px" }}>MODULE UNDER TEST (MUT) SUMMARY</div>
            <div className="grid grid-cols-4 gap-3" style={{ fontSize: "8.5pt" }}>
              <div><span style={{ color: "#666" }}>Manufacturer:</span><br /><strong>Axitec Energy GmbH</strong></div>
              <div><span style={{ color: "#666" }}>Model:</span><br /><strong>AC-430MH/144V</strong></div>
              <div><span style={{ color: "#666" }}>Technology:</span><br /><strong>Mono-PERC</strong></div>
              <div><span style={{ color: "#666" }}>Rated Power:</span><br /><strong>430 Wp</strong></div>
              <div><span style={{ color: "#666" }}>No. of Samples:</span><br /><strong>4 modules</strong></div>
              <div><span style={{ color: "#666" }}>Cell Count:</span><br /><strong>144 half-cut</strong></div>
              <div><span style={{ color: "#666" }}>Dimensions:</span><br /><strong>2108 × 1048 × 35 mm</strong></div>
              <div><span style={{ color: "#666" }}>Frame:</span><br /><strong>Anodized Al</strong></div>
            </div>
          </div>

          {/* Overall Result Banner */}
          <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", padding: "12px 20px", marginBottom: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "14pt", fontWeight: "800", color: "#15803d" }}>✓ OVERALL RESULT: PASS</span>
            <div style={{ fontSize: "8.5pt", color: "#166534", marginTop: "4px" }}>All 4 samples passed PID test with power degradation &lt; 5% – IEC TS 62804-1:2015 Method A</div>
          </div>

          {/* Signatures Block */}
          <div style={{ marginTop: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "16px" }}>
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#1e3a5f", marginBottom: "12px", textTransform: "uppercase" }}>Authorisation &amp; Signatures</div>
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
                  <div style={{ color: "#1e3a5f", fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
                  <div style={{ color: "#999", fontSize: "7pt" }}>Date: {issueDate}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidential footer */}
          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "7.5pt", color: "#999", borderTop: "1px solid #eee", paddingTop: "8px" }}>
            CONFIDENTIAL – This report is issued to the customer named above. Reproduction in full or in part requires written consent of SolarLabX.
          </div>
        </div>

        {/* ═══════════════ DISCLAIMER ═══════════════ */}
        <div className="page-break" style={{ padding: "15mm 20mm", fontSize: "8.5pt" }}>
          <div style={{ fontSize: "11pt", fontWeight: "700", color: "#1e3a5f", borderBottom: "2px solid #1e3a5f", paddingBottom: "6px", marginBottom: "14px" }}>DISCLAIMER</div>
          <p style={{ marginBottom: "10px" }}>This report presents the results of tests performed by SolarLabX on the module samples submitted by the customer as identified herein. The results relate exclusively to the items tested. This report shall not be reproduced, except in full, without written approval of SolarLabX.</p>
          <p style={{ marginBottom: "10px" }}>The tests were conducted in accordance with IEC TS 62804-1:2015 Method A. SolarLabX is accredited by the National Accreditation Board for Testing and Calibration Laboratories (NABL), India, under accreditation number TC-8192, which is a signatory to the ILAC Mutual Recognition Arrangement (MRA). The results are traceable to national/international measurement standards.</p>
          <p style={{ marginBottom: "10px" }}>The reported measurement uncertainty was evaluated in accordance with the JCGM 100:2008 (GUM) methodology. The expanded uncertainty is stated at a 95% confidence level with a coverage factor k = 2.</p>
          <p style={{ marginBottom: "10px" }}>SolarLabX is not responsible for the design, manufacture, or future performance of the module. This report does not constitute a product certification or endorsement by SolarLabX or any affiliated body.</p>
          <p><strong>NABL Scope of Accreditation:</strong> Electrical, Thermal, Mechanical, and Environmental testing of PV modules as per IEC 61215, IEC 61730, IEC 62804, IEC 60891, IEC 60904 series.</p>

          <div style={{ marginTop: "20px", fontSize: "11pt", fontWeight: "700", color: "#1e3a5f", borderBottom: "2px solid #1e3a5f", paddingBottom: "6px", marginBottom: "14px" }}>TABLE OF CONTENTS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <tbody>
              {[
                ["1", "Disclaimer", "2"],
                ["2", "Report Overview & Summary of Test Results", "3"],
                ["3", "Test Sequence Flowchart", "4"],
                ["4", "Module Description", "5"],
                ["5", "Preconditioning", "6"],
                ["6", "STC Measurements (Initial & Post-PID)", "7"],
                ["7", "Visual Inspection (Pre & Post PID)", "9"],
                ["8", "Wet Leakage Current", "11"],
                ["9", "Ground Continuity Test", "12"],
                ["10", "Electroluminescence (EL) Imaging", "13"],
                ["11", "PID Test Parameters & Conditions", "15"],
                ["12", "Measurement Uncertainty", "16"],
                ["13", "Equipment Used", "17"],
                ["14", "Conclusions", "18"],
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

        {/* ═══════════════ REPORT OVERVIEW ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="1" title="REPORT OVERVIEW" />

          <SubHeader>1.1 Test Package Summary</SubHeader>
          <InfoGrid items={[
            ["Report Number", reportNo],
            ["Standard", "IEC TS 62804-1:2015 Method A"],
            ["Test Type", "Potential Induced Degradation (PID)"],
            ["Customer", "Axitec Energy GmbH & Co. KG"],
            ["Module Model", "AC-430MH/144V"],
            ["No. of Samples", "4 modules"],
            ["Test Voltage", "±1500 V DC"],
            ["Test Duration", "96 hours per polarity"],
            ["Temperature", "85°C"],
            ["Relative Humidity", "85% RH"],
            ["Date Received", "2026-01-14"],
            ["Date of Issue", issueDate],
          ]} />

          <SubHeader>1.2 Summary of Test Results</SubHeader>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#1e3a5f", color: "white" }}>
                {["Test", "Standard / Clause", "Test Condition", "Criterion", "Result"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Visual Inspection (Pre)", "IEC 62804-1 §6.1", "Pre-test", "No relevant defects", "PASS"],
                ["STC – Initial (MQT 06)", "IEC 61215-2 MQT06", "1000 W/m², 25°C, AM1.5", "Baseline measurement", "PASS"],
                ["Wet Leakage Current (Pre)", "IEC 61215-2 MQT15", "1000 V DC, 25°C", "RISO·A ≥ 40 MΩ·m²", "PASS"],
                ["Ground Continuity (Pre)", "IEC 61730-2 MST13", "25 A, 2×Rmin", "R < 0.1 Ω", "PASS"],
                ["EL Imaging (Pre)", "IEC 62804-1 §6.3", "At Isc", "No relevant defects", "PASS"],
                ["PID Test (−1500 V)", "IEC 62804-1 §7.1", "85°C, 85% RH, 96h", "ΔPmax < 5%", "PASS"],
                ["PID Test (+1500 V)", "IEC 62804-1 §7.1", "85°C, 85% RH, 96h", "ΔPmax < 5%", "PASS"],
                ["Visual Inspection (Post)", "IEC 62804-1 §6.1", "Post-test", "No relevant defects", "PASS"],
                ["STC – After PID (MQT 06)", "IEC 61215-2 MQT06", "1000 W/m², 25°C, AM1.5", "ΔPmax < 5%", "PASS"],
                ["Wet Leakage Current (Post)", "IEC 61215-2 MQT15", "1000 V DC, 25°C", "RISO·A ≥ 40 MΩ·m²", "PASS"],
                ["Ground Continuity (Post)", "IEC 61730-2 MST13", "25 A, 2×Rmin", "R < 0.1 Ω", "PASS"],
                ["EL Imaging (Post)", "IEC 62804-1 §6.3", "At Isc & 0.1×Isc", "No relevant defects", "PASS"],
              ].map(([test, std, cond, crit, res], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px" }}>{test}</td>
                  <td style={{ padding: "5px 8px", fontFamily: "monospace", fontSize: "7.5pt" }}>{std}</td>
                  <td style={{ padding: "5px 8px" }}>{cond}</td>
                  <td style={{ padding: "5px 8px" }}>{crit}</td>
                  <td style={{ padding: "5px 8px" }}>
                    <span style={{ background: "#22c55e", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600" }}>{res}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ TEST SEQUENCE ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="2" title="TEST SEQUENCE FLOWCHART" />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", marginTop: "16px" }}>
            {[
              { label: "START", style: { background: "#1e3a5f", color: "white", borderRadius: "50%", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "9pt" } },
              null,
              { label: "Preconditioning\n(5.5 kWh/m² irradiation)", style: { background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "STC Flash Test\n(MQT06 – Initial Measurement A)", style: { background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "I-V Curve Trace\n(MQT01)", style: { background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "EL Imaging\n(Pre-PID at Isc)", style: { background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "Wet Leakage Current\n(MQT15 – Pre-PID)", style: { background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "Ground Continuity\n(MST13 – Pre-PID)", style: { background: "#dbeafe", border: "2px solid #3b82f6", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "PID Test\n(−1500 V, 85°C, 85% RH, 96h)", style: { background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "PID Test\n(+1500 V, 85°C, 85% RH, 96h)", style: { background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "Post-PID Measurements\n(STC / EL / WLC / GCT / Visual)", style: { background: "#d1fae5", border: "2px solid #22c55e", borderRadius: "4px", padding: "8px 20px", textAlign: "center", fontWeight: "600", fontSize: "8.5pt" } },
              null,
              { label: "END", style: { background: "#1e3a5f", color: "white", borderRadius: "50%", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "9pt" } },
            ].map((step, i) => step === null ? (
              <div key={i} style={{ width: "2px", height: "20px", background: "#94a3b8" }} />
            ) : (
              <div key={i} style={step.style}>
                {step.label.split("\n").map((l, j) => <div key={j}>{l}</div>)}
              </div>
            ))}
          </div>
          <p style={{ marginTop: "20px", fontSize: "8pt", color: "#666", textAlign: "center" }}>
            Note: Loop between PID cycles is performed if recovery observation is required per Annex A of IEC TS 62804-1:2015
          </p>
        </div>

        {/* ═══════════════ MODULE DESCRIPTION ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="3" title="MODULE DESCRIPTION" />
          <p style={{ marginBottom: "12px", fontSize: "8.5pt", color: "#555" }}>The following 4 modules were received from the customer and tested as per IEC TS 62804-1:2015. All modules are of the same model and specification.</p>
          <div className="grid grid-cols-2 gap-4">
            {MODULES.map((m, i) => (
              <div key={i} style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px", background: i % 2 === 0 ? "#f8fafc" : "white" }}>
                <div style={{ fontWeight: "700", color: "#1e3a5f", marginBottom: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>
                  Sample {i + 1} – {m.id}
                </div>
                <table style={{ fontSize: "8pt", width: "100%" }}>
                  <tbody>
                    {[
                      ["Serial No.", m.id],
                      ["MCIND / Lab No.", m.mcind],
                      ["Manufacturer", m.manufacturer],
                      ["Module Type", m.type],
                      ["Cell Material", m.cell],
                      ["No. of Cells", m.cells],
                      ["Dimensions (mm)", m.dims],
                      ["Frame Type", m.frame],
                      ["Year of Manufacture", m.year],
                    ].map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ color: "#666", paddingRight: "8px", paddingBottom: "3px", width: "45%" }}>{k}:</td>
                        <td style={{ fontWeight: "500", paddingBottom: "3px" }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Module image placeholder */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {["Front", "Rear", "Nameplate"].map(label => (
                    <div key={label} style={{ border: "1px dashed #ccc", borderRadius: "3px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9", fontSize: "7pt", color: "#999" }}>
                      [{label}]
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ PRECONDITIONING ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="4" title="PRECONDITIONING" />
          <SubHeader>4.1 Light Soaking (IEC 61215-2 §4.5)</SubHeader>
          <InfoGrid items={[
            ["Start Date", "2026-01-15"],
            ["End Date", "2026-01-16"],
            ["Radiation Source", "Natural Sunlight (Pune, India)"],
            ["Irradiation Dosage", "5.5 kWh/m²"],
            ["Irradiance Range", "700 – 1100 W/m²"],
            ["Ambient Temperature", "22 – 31°C"],
            ["Module Temperature", "35 – 52°C"],
            ["Spectral Condition", "AM 1.5 (approx.)"],
          ]} />
          <div style={{ marginTop: "12px", padding: "8px 12px", background: "#dbeafe", borderRadius: "4px", fontSize: "8.5pt" }}>
            <strong>Note:</strong> Modules were pre-conditioned by natural light soaking to achieve a cumulative irradiation of 5.5 kWh/m² to stabilize light-induced degradation (LID) effects prior to initial STC measurement.
          </div>

          <SubHeader>4.2 Preconditioning Acceptance Criteria</SubHeader>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#1e3a5f", color: "white" }}>
                {["Parameter", "Minimum Dosage", "Achieved", "Status"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px" }}>Sample {i + 1} – {m.id}</td>
                  <td style={{ padding: "5px 8px" }}>5.0 kWh/m²</td>
                  <td style={{ padding: "5px 8px" }}>5.5 kWh/m²</td>
                  <td style={{ padding: "5px 8px" }}>
                    <PassBadge pass={true} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ STC RESULTS ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="5" title="STC FLASH TEST RESULTS" />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>
            STC: Irradiance 1000 W/m² · Cell Temperature 25°C · Air Mass AM1.5G · Reference cell calibration traceable to PTB/NIST
          </p>
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "12px" }}>
            <strong>Measurement (A):</strong> Initial STC measurement (post-preconditioning) &nbsp;|&nbsp; <strong>Measurement (B):</strong> Post-PID STC measurement
          </p>

          {MODULES.map((m, mi) => (
            <div key={mi} style={{ marginBottom: "20px" }}>
              <div style={{ fontWeight: "700", color: "#1e3a5f", fontSize: "9.5pt", marginBottom: "6px", padding: "4px 8px", background: "#e8f0fe", borderRadius: "3px" }}>
                Sample {mi + 1}: {m.id} | {m.manufacturer} | {m.type}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                <thead>
                  <tr style={{ background: "#334155", color: "white" }}>
                    <th style={{ padding: "5px 8px", textAlign: "left" }}>Parameter</th>
                    <th style={{ padding: "5px 8px", textAlign: "center" }}>Nameplate</th>
                    <th style={{ padding: "5px 8px", textAlign: "center" }}>Initial (A)</th>
                    <th style={{ padding: "5px 8px", textAlign: "center" }}>After PID (B)</th>
                    <th style={{ padding: "5px 8px", textAlign: "center" }}>Dev. A→Name</th>
                    <th style={{ padding: "5px 8px", textAlign: "center" }}>Dev. B→A (ΔPmax)</th>
                    <th style={{ padding: "5px 8px", textAlign: "center" }}>Pass?</th>
                  </tr>
                </thead>
                <tbody>
                  {STC_DATA.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "4px 8px", fontWeight: "500" }}>{row.param}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.nameplate}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.initialA}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}>{row.afterB}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center", color: "#2563eb" }}>{row.devA}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center", color: "#059669", fontWeight: "600" }}>{row.devB}</td>
                      <td style={{ padding: "4px 8px", textAlign: "center" }}><PassBadge pass={row.pass} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: "7.5pt", color: "#666", marginTop: "4px", padding: "0 4px" }}>
                Pass criterion: Power degradation (B–A)/A × 100 &lt; 5% | Expanded uncertainty: Pmpp ±2.55%, Voc ±1.44%, Isc ±2.21% (k=2)
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════ VISUAL INSPECTION ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="6" title="VISUAL INSPECTION" />

          <SubHeader>6.1 Pre-PID Visual Inspection</SubHeader>
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>Visual inspection per IEC 61215-1 §4.1 and IEC TS 62804-1 §6.1. Grid: Rows A–F (strings), Columns 1–12 (cells)</p>

          {/* Cell grid for one sample */}
          <div style={{ overflowX: "auto", marginBottom: "16px" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "7pt" }}>
              <thead>
                <tr>
                  <th style={{ width: "20px" }}></th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} style={{ width: "28px", padding: "2px", textAlign: "center", color: "#666" }}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["A", "B", "C", "D", "E", "F"].map(row => (
                  <tr key={row}>
                    <td style={{ fontWeight: "700", color: "#1e3a5f", padding: "2px 4px" }}>{row}</td>
                    {Array.from({ length: 12 }, (_, i) => (
                      <td key={i} style={{ width: "28px", height: "20px", border: "1px solid #94a3b8", background: "#f0f9ff", textAlign: "center", fontSize: "6pt", color: "#666" }}>OK</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "8pt", color: "#555" }}><strong>Observations (Pre-PID):</strong> No visual defects observed. All cells appear uniform. No cracks, delamination, discolouration, or broken interconnects noted.</p>

          <SubHeader>6.2 Post-PID Visual Inspection</SubHeader>
          <div style={{ overflowX: "auto", marginBottom: "16px" }}>
            <table style={{ borderCollapse: "collapse", fontSize: "7pt" }}>
              <thead>
                <tr>
                  <th style={{ width: "20px" }}></th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} style={{ width: "28px", padding: "2px", textAlign: "center", color: "#666" }}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["A", "B", "C", "D", "E", "F"].map(row => (
                  <tr key={row}>
                    <td style={{ fontWeight: "700", color: "#1e3a5f", padding: "2px 4px" }}>{row}</td>
                    {Array.from({ length: 12 }, (_, i) => (
                      <td key={i} style={{ width: "28px", height: "20px", border: "1px solid #94a3b8", background: "#f0fdf4", textAlign: "center", fontSize: "6pt", color: "#666" }}>OK</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "8pt", color: "#555" }}><strong>Observations (Post-PID):</strong> No new visual defects observed after PID testing. No discolouration, delamination, or corrosion noted. Modules appear in original condition.</p>
        </div>

        {/* ═══════════════ WET LEAKAGE CURRENT ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="7" title="WET LEAKAGE CURRENT TEST" />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>Performed per IEC 61215-2 MQT15. Test voltage: 1000 V DC. Duration: 2 min. Test area: 2.208 m². Pass criterion: RISO × Area ≥ 40 MΩ·m²</p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#1e3a5f", color: "white" }}>
                {["Condition", "Sample", "Reading 1 (MΩ)", "Reading 2 (MΩ)", "Reading 3 (MΩ)", "Mean RISO (MΩ)", "RISO × Area (MΩ·m²)", "Result"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", fontSize: "7.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WLC_DATA.map((row, ri) =>
                MODULES.map((m, mi) => (
                  <tr key={`${ri}-${mi}`} style={{ background: (ri * 4 + mi) % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                    {mi === 0 && <td rowSpan={4} style={{ padding: "5px 8px", fontWeight: "600", verticalAlign: "middle", background: ri % 2 === 0 ? "#e8f0fe" : "#f8fafc", borderBottom: "2px solid #94a3b8" }}>{row.label}</td>}
                    <td style={{ padding: "5px 8px" }}>{m.id}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{row.readings[0]}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{row.readings[1]}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{row.readings[2]}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{(parseInt(row.readings[0]) + parseInt(row.readings[1]) + parseInt(row.readings[2])) / 3 | 0}</td>
                    <td style={{ padding: "5px 8px", textAlign: "right" }}>{((parseInt(row.readings[0]) + parseInt(row.readings[1]) + parseInt(row.readings[2])) / 3 * 2.208).toFixed(1)}</td>
                    <td style={{ padding: "5px 8px" }}><PassBadge pass={true} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ GROUND CONTINUITY ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="8" title="GROUND CONTINUITY TEST" />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>Per IEC 61730-2 MST13. Test current: 25 A (2 × max fuse rating). 4-wire measurement. Pass criterion: R &lt; 0.1 Ω</p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: "#1e3a5f", color: "white" }}>
                {["Condition", "Sample", "Point 1 (Ω)", "Point 2 (Ω)", "Point 3 (Ω)", "Point 4 (Ω)", "Max R (Ω)", "Result"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: "600", fontSize: "7.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["Pre-PID", "Post-PID"].map((cond, ci) =>
                MODULES.map((m, mi) => (
                  <tr key={`${ci}-${mi}`} style={{ background: (ci * 4 + mi) % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                    {mi === 0 && <td rowSpan={4} style={{ padding: "5px 8px", fontWeight: "600", verticalAlign: "middle", background: ci % 2 === 0 ? "#e8f0fe" : "#f8fafc", borderBottom: "2px solid #94a3b8" }}>{cond}</td>}
                    <td style={{ padding: "5px 8px" }}>{m.id}</td>
                    {["0.042", "0.038", "0.041", "0.039"].map((v, vi) => (
                      <td key={vi} style={{ padding: "5px 8px", textAlign: "right" }}>{v}</td>
                    ))}
                    <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: "600", color: "#059669" }}>0.042</td>
                    <td style={{ padding: "5px 8px" }}><PassBadge pass={true} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ EL IMAGING ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="9" title="ELECTROLUMINESCENCE (EL) IMAGING" />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "10px" }}>EL images acquired at Isc (full current) and 0.1 × Isc. Camera: InGaAs SWIR, 1280×1024 px. Integration time: 1000 ms.</p>

          {MODULES.map((m, mi) => (
            <div key={mi} style={{ marginBottom: "16px", border: "1px solid #ddd", borderRadius: "4px", padding: "10px" }}>
              <div style={{ fontWeight: "700", color: "#1e3a5f", marginBottom: "8px" }}>Sample {mi + 1}: {m.id}</div>
              <div className="grid grid-cols-4 gap-3">
                {["Pre-PID @ Isc", "Pre-PID @ 0.1×Isc", "Post-PID @ Isc", "Post-PID @ 0.1×Isc"].map(label => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ border: "1px dashed #ccc", borderRadius: "3px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", fontSize: "7pt", color: "#666", marginBottom: "4px" }}>
                      [EL Image]
                    </div>
                    <div style={{ fontSize: "7pt", color: "#555" }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "8px", fontSize: "8pt", color: "#555" }}>
                <strong>Observation:</strong> No relevant dark areas, cracks, or inactive cell regions observed. Uniform EL emission across all cells. No significant change pre- vs. post-PID.
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════ PID TEST PARAMETERS ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="10" title="PID TEST PARAMETERS & CONDITIONS" />

          <div className="grid grid-cols-2 gap-6">
            <div>
              <SubHeader>10.1 Stress Parameters (–1500 V Polarity)</SubHeader>
              <InfoGrid items={[
                ["Applied Voltage", "−1500 V DC ± 1%"],
                ["Temperature", "85°C ± 2°C"],
                ["Relative Humidity", "85% RH ± 5%"],
                ["Duration", "96 hours"],
                ["No. of Cycles", "1"],
                ["Ramp Rate (T)", "≤5°C/min"],
                ["Voltage Ramp", "≤100 V/s"],
                ["Connection", "Frame at negative terminal"],
              ]} />
            </div>
            <div>
              <SubHeader>10.2 Stress Parameters (+1500 V Polarity)</SubHeader>
              <InfoGrid items={[
                ["Applied Voltage", "+1500 V DC ± 1%"],
                ["Temperature", "85°C ± 2°C"],
                ["Relative Humidity", "85% RH ± 5%"],
                ["Duration", "96 hours"],
                ["No. of Cycles", "1"],
                ["Ramp Rate (T)", "≤5°C/min"],
                ["Voltage Ramp", "≤100 V/s"],
                ["Connection", "Frame at positive terminal"],
              ]} />
            </div>
          </div>

          <SubHeader>10.3 Equipment Used</SubHeader>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#1e3a5f", color: "white" }}>
                {["Equipment", "Make / Model", "Cal. No.", "Cal. Due Date"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Solar Simulator (AAA+)", "Spire 4600SLP", "SLX-EQ-001", "2026-09-30"],
                ["PID Test Chamber", "Weiss WT-600/70", "SLX-EQ-012", "2026-06-30"],
                ["HV DC Power Supply", "Heinzinger PNC 3000", "SLX-EQ-015", "2026-08-31"],
                ["EL Camera (InGaAs)", "Xenics Bobcat-1.7", "SLX-EQ-022", "2027-01-31"],
                ["Insulation Tester", "Fluke 1555C", "SLX-EQ-018", "2026-10-31"],
                ["4-Wire Resistance", "Hioki RM3548", "SLX-EQ-019", "2026-12-31"],
                ["Reference Cell", "Eppley PSP-5", "SLX-EQ-003", "2026-06-30"],
              ].map(([eq, make, cal, due], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px" }}>{eq}</td>
                  <td style={{ padding: "4px 8px" }}>{make}</td>
                  <td style={{ padding: "4px 8px", fontFamily: "monospace", fontSize: "8pt" }}>{cal}</td>
                  <td style={{ padding: "4px 8px" }}>{due}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SubHeader>10.4 Measurement Uncertainty</SubHeader>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#334155", color: "white" }}>
                {["Parameter", "Expanded Uncertainty (k=2)", "Coverage Factor", "Confidence Level"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Pmpp", "±2.55%", "k = 2", "95%"],
                ["Voc", "±1.44%", "k = 2", "95%"],
                ["Isc", "±2.21%", "k = 2", "95%"],
                ["Vmpp", "±1.65%", "k = 2", "95%"],
                ["Impp", "±2.12%", "k = 2", "95%"],
                ["Temperature (PID Chamber)", "±0.5°C", "k = 2", "95%"],
                ["Relative Humidity", "±2% RH", "k = 2", "95%"],
                ["Applied Voltage", "±0.1%", "k = 2", "95%"],
              ].map(([param, unc, k, conf], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontWeight: "500" }}>{param}</td>
                  <td style={{ padding: "4px 8px", color: "#1e3a5f", fontWeight: "600" }}>{unc}</td>
                  <td style={{ padding: "4px 8px" }}>{k}</td>
                  <td style={{ padding: "4px 8px" }}>{conf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════ I-V CURVE & SUMMARY CHARTS ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="11" title="I-V CURVE COMPARISON & SUMMARY ANALYSIS" />
          <IVCurveComparisonChart
            preParams={{ voc: 43.24, isc: 12.85, vmp: 35.92, imp: 12.03, pmax: 432.1, ff: 0.7791 }}
            postParams={{ voc: 43.18, isc: 12.84, vmp: 35.88, imp: 12.02, pmax: 431.8, ff: 0.7789 }}
            title="PID Test – I-V Curve Overlay (Pre vs Post)"
            height={280}
          />
          <div style={{ marginTop: "16px" }}>
            <PmaxStabilizationChart
              data={[
                { stage: "Initial", "SLX-M001": 432.1, "SLX-M002": 431.9, "SLX-M003": 432.0, "SLX-M004": 431.8 },
                { stage: "Pre-PID", "SLX-M001": 432.0, "SLX-M002": 431.8, "SLX-M003": 431.9, "SLX-M004": 431.7 },
                { stage: "PID -V", "SLX-M001": 431.8, "SLX-M002": 431.6, "SLX-M003": 431.7, "SLX-M004": 431.5 },
                { stage: "Recovery", "SLX-M001": 431.9, "SLX-M002": 431.7, "SLX-M003": 431.8, "SLX-M004": 431.6 },
                { stage: "PID +V", "SLX-M001": 431.8, "SLX-M002": 431.6, "SLX-M003": 431.7, "SLX-M004": 431.5 },
                { stage: "Final", "SLX-M001": 431.8, "SLX-M002": 431.6, "SLX-M003": 431.7, "SLX-M004": 431.5 },
              ]}
              sampleIds={["SLX-M001", "SLX-M002", "SLX-M003", "SLX-M004"]}
              ratedPmax={430}
              height={230}
            />
          </div>
        </div>

        {/* ═══════════════ CONCLUSIONS ═══════════════ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SectionHeader num="12" title="CONCLUSIONS" />
          <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11pt", fontWeight: "700", color: "#15803d", marginBottom: "6px" }}>✓ ALL SAMPLES PASSED – IEC TS 62804-1:2015 Method A</div>
            <p style={{ fontSize: "8.5pt", color: "#166534" }}>
              All 4 samples of Axitec AC-430MH/144V modules passed the PID test per IEC TS 62804-1:2015 Method A. Power degradation due to PID was below the 5% criterion for all modules under both negative and positive polarities. No relevant visual, EL, or electrical defects were observed after stress.
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: "#1e3a5f", color: "white" }}>
                {["Sample", "Pmax Deviation (−V)", "Pmax Deviation (+V)", "Visual", "WLC", "GCT", "EL", "Overall"].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "center", fontWeight: "600" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{m.id}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>−0.07%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>−0.05%</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><PassBadge pass={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#1e3a5f", marginBottom: "12px" }}>AUTHORISATION</div>
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
                  <div style={{ color: "#1e3a5f", fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
                  <div style={{ color: "#999", fontSize: "7pt" }}>Date: {issueDate}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "20px", padding: "8px 12px", background: "#f8fafc", border: "1px solid #ddd", borderRadius: "4px", fontSize: "7.5pt", color: "#666" }}>
            <strong>End of Report – {reportNo}</strong><br />
            This report is accredited under NABL TC-8192 conforming to ISO/IEC 17025:2017. Results are traceable to national standards.
            SolarLabX, Pune. <em>Total Pages: 18</em>
          </div>
        </div>

      </div>
    </>
  );
}

/* ─── Reusable sub-components ─── */
function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ fontSize: "11pt", fontWeight: "800", color: "#1e3a5f", borderBottom: "2.5px solid #1e3a5f", paddingBottom: "5px", marginBottom: "12px" }}>
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

function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1" style={{ fontSize: "8.5pt", border: "1px solid #e5e7eb", padding: "10px", borderRadius: "4px", background: "#f8fafc" }}>
      {items.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <span style={{ color: "#666", minWidth: "130px" }}>{k}:</span>
          <span style={{ fontWeight: "500" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function PassBadge({ pass }: { pass: boolean }) {
  return (
    <span style={{
      background: pass ? "#22c55e" : "#ef4444",
      color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "600"
    }}>
      {pass ? "PASS" : "FAIL"}
    </span>
  );
}
