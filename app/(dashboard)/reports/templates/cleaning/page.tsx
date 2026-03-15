// @ts-nocheck
"use client";

import { useState } from "react";
import { PrePostComparisonChart } from "@/components/reports/charts/PrePostComparisonChart";
import { ReportUncertaintyBudgetTable } from "@/components/reports/uncertainty/ReportUncertaintyBudgetTable";
import { TEST_UNCERTAINTY_CONFIGS } from "@/components/reports/uncertainty/testUncertaintyConfigs";
import { exportToWord, exportToExcel, type TemplateExportConfig } from "@/components/reports/TemplateExportToolbar";

const REPORT_NO = "SLX-RPT-CLEAN-2026-001";

const MODULE_SPECIMENS = [
  { id: "CLN-M01", make: "Manufacturer A", model: "MX-400M", tech: "Mono-PERC", power: "400 W", qty: 2 },
  { id: "CLN-M02", make: "Manufacturer B", model: "XP-375P", tech: "Poly", power: "375 W", qty: 2 },
  { id: "CLN-M03", make: "Manufacturer C", model: "BF-450G", tech: "Bifacial PERC", power: "450 W", qty: 2 },
];

const SAND_SCHEDULE = [
  { cycles: "1 – 1000", regular: "10g every 5 cycles", storm: "50g every 50 cycles", notes: "Phase 1 – initial wear" },
  { cycles: "1001 – 2000", regular: "10g every 5 cycles", storm: "50g every 50 cycles", notes: "Phase 2 – mid-life simulation" },
  { cycles: "2001 – 8000", regular: "10g every 5 cycles", storm: "50g every 100 cycles", notes: "Phase 3 – long-term durability" },
];

const CLASS_SYSTEM = [
  { cls: "Class A", desc: "Negligible degradation", pmax: "< 0.5%", isc: "< 0.3%", ref: "≥ 0%", color: "#22c55e" },
  { cls: "Class B", desc: "Moderate degradation", pmax: "0.5 – 1.0%", isc: "0.3 – 0.6%", ref: "< 0%", color: "#f59e0b" },
  { cls: "Class C", desc: "Clear degradation", pmax: "> 1.0%", isc: "> 0.6%", ref: "< −0.5%", color: "#ef4444" },
  { cls: "Fail", desc: "Significant damage", pmax: "Any fail criterion", isc: "—", ref: "—", color: "#7c2d12" },
];

const RESULTS_MATRIX = [
  { sample: "CLN-M01 (A)", make: "Mfr A", tech: "Mono-PERC", pmax1000: "−0.18%", pmax2000: "−0.31%", pmax8000: "−0.42%", isc8000: "−0.22%", ref8000: "+0.8%", visual: "A", eirClass: "A", overallClass: "A" },
  { sample: "CLN-M02 (A)", make: "Mfr B", tech: "Poly", pmax1000: "−0.22%", pmax2000: "−0.44%", pmax8000: "−0.71%", isc8000: "−0.38%", ref8000: "+0.6%", visual: "A", eirClass: "A", overallClass: "B" },
  { sample: "CLN-M03 (A)", make: "Mfr C", tech: "Bifacial", pmax1000: "−0.15%", pmax2000: "−0.28%", pmax8000: "−0.38%", isc8000: "−0.19%", ref8000: "+0.9%", visual: "A", eirClass: "A", overallClass: "A" },
];

function ClassBadge({ cls }: { cls: string }) {
  const color = CLASS_SYSTEM.find(c => c.cls === cls)?.color || "#6b7280";
  return <span style={{ background: color, color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "700" }}>{cls}</span>;
}

export default function CleaningRobotReportPage() {
  const [reportNo] = useState(REPORT_NO);
  const [issueDate] = useState("2026-03-14");
  const [customer] = useState("SolarBot Technologies Pvt. Ltd.");
  const [robotModel] = useState("CleanMax Pro R-500");

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
        }
      `}</style>

      {/* Toolbar */}
      {(() => {
        const exportConfig: TemplateExportConfig = {
          reportNo, title: "Robotic PV Module Cleaning System Evaluation", subtitle: "Project/Custom Report Format · 8000 Cleaning Cycle Simulation",
          standard: "Custom / Project Spec", date: issueDate,
          moduleSpecs: MODULE_SPECIMENS.map(m => [m.id, `${m.make} ${m.model} (${m.tech}, ${m.power})`] as [string, string]),
          testConditions: [["Robot Model", robotModel], ["Customer", customer], ["Total Cycles", "8000"], ["Sand Type", "ISO 12103-1 A4 (coarse)"]],
          purpose: "Evaluate the effect of robotic cleaning on PV module performance and surface integrity over 8000 simulated cleaning cycles.",
          tables: [
            { title: "Sand Spraying Schedule", headers: ["Cycles", "Regular Soiling", "Storm Simulation", "Notes"],
              rows: SAND_SCHEDULE.map(s => [s.cycles, s.regular, s.storm, s.notes]) },
            { title: "Classification System", headers: ["Class", "Description", "ΔPmax", "ΔIsc", "Reflectance"],
              rows: CLASS_SYSTEM.map(c => [c.cls, c.desc, c.pmax, c.isc, c.ref]) },
            { title: "Results Matrix", headers: ["Sample", "Make", "Tech", "ΔPmax@1000", "ΔPmax@2000", "ΔPmax@8000", "ΔIsc@8000", "Ref@8000", "Visual", "Overall"],
              rows: RESULTS_MATRIX.map(r => [r.sample, r.make, r.tech, r.pmax1000, r.pmax2000, r.pmax8000, r.isc8000, r.ref8000, r.visual, r.overallClass]) },
          ],
        };
        return (
          <div className="no-print sticky top-0 z-50 flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Robotic Cleaning Evaluation Report</h1>
              <p className="text-sm text-gray-500">Project/Custom Report Format · 8000 Cleaning Cycle Simulation</p>
            </div>
            <div className="flex gap-2">
              <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
              <button onClick={() => window.print()} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF
              </button>
              <button onClick={() => exportToWord(exportConfig)} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Word
              </button>
              <button onClick={() => exportToExcel(exportConfig)} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Excel
              </button>
              <button onClick={() => window.print()} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
            </div>
          </div>
        );
      })()}

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none" style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "10pt", color: "#1a1a1a" }}>

        {/* ═══ COVER PAGE ═══ */}
        <div style={{ minHeight: "297mm", display: "flex", flexDirection: "column", padding: "20mm 20mm 15mm" }}>
          {/* Header */}
          <div style={{ borderBottom: "3px solid #065f46", paddingBottom: "12px", marginBottom: "16px" }}>
            <div className="flex items-start justify-between">
              <div>
                <div style={{ fontSize: "22pt", fontWeight: "800", color: "#065f46" }}>☀ SolarLabX</div>
                <div style={{ fontSize: "9pt", color: "#059669", marginTop: "2px" }}>Solar PV Testing &amp; Certification Laboratory</div>
                <div style={{ fontSize: "8pt", color: "#666", marginTop: "4px" }}>
                  NABL TC-8192 · ISO/IEC 17025:2017 · Plot 47, MIDC, Pune – 411018, India
                </div>
              </div>
              <div style={{ border: "1px solid #ddd", padding: "8px 12px", borderRadius: "4px", background: "#f9f9f9", fontSize: "8pt" }}>
                <table><tbody>
                  <tr><td style={{ paddingRight: "12px", color: "#555" }}>Report No:</td><td style={{ fontWeight: "700", fontFamily: "monospace" }}>{reportNo}</td></tr>
                  <tr><td style={{ color: "#555" }}>Date:</td><td>{issueDate}</td></tr>
                  <tr><td style={{ color: "#555" }}>Type:</td><td>Project Evaluation</td></tr>
                </tbody></table>
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ background: "#065f46", color: "white", padding: "20px", borderRadius: "4px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "11pt", fontWeight: "600", marginBottom: "6px" }}>PROJECT EVALUATION REPORT</div>
            <div style={{ fontSize: "18pt", fontWeight: "800", marginBottom: "8px" }}>Robotic PV Module Cleaning System</div>
            <div style={{ fontSize: "10pt", opacity: 0.85 }}>Soiling Resistance &amp; Cleaning Efficacy Evaluation</div>
            <div style={{ fontSize: "9pt", opacity: 0.7, marginTop: "4px" }}>8000 Cleaning Cycle Simulation | Sand &amp; Dust Accelerated Test | Robot: {robotModel}</div>
          </div>

          {/* Customer / Scope */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "20px" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontSize: "8pt", fontWeight: "700", color: "#065f46", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Client Information</div>
              <div style={{ fontSize: "8.5pt" }}>
                <p><strong>Organization:</strong> {customer}</p>
                <p><strong>Robot Model:</strong> {robotModel}</p>
                <p><strong>Contact:</strong> Mr. Rajiv Mehta · +91-98765-43210</p>
                <p><strong>PO Reference:</strong> SBT-2026-EVL-0021</p>
              </div>
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontSize: "8pt", fontWeight: "700", color: "#065f46", textTransform: "uppercase", marginBottom: "6px", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Test Scope</div>
              <div style={{ fontSize: "8.5pt" }}>
                <p><strong>Module Types:</strong> 3 different makes (6 modules)</p>
                <p><strong>Simulated Years:</strong> ~20 years</p>
                <p><strong>Total Cycles:</strong> 8000</p>
                <p><strong>Test Period:</strong> 2025-11-01 to 2026-02-28</p>
                <p><strong>DustIQ Sensors:</strong> 4 positions</p>
              </div>
            </div>
          </div>

          {/* Key findings */}
          <div style={{ border: "1px solid #d1fae5", borderRadius: "6px", padding: "12px 16px", marginBottom: "16px", background: "#f0fdf4" }}>
            <div style={{ fontWeight: "700", color: "#065f46", marginBottom: "8px" }}>KEY FINDINGS</div>
            <div className="grid grid-cols-3 gap-4" style={{ fontSize: "8.5pt" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18pt", fontWeight: "800", color: "#065f46" }}>3/3</div>
                <div style={{ color: "#666" }}>Modules – Class A or B</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18pt", fontWeight: "800", color: "#065f46" }}>+0.77%</div>
                <div style={{ color: "#666" }}>Avg. Reflectance Improvement</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18pt", fontWeight: "800", color: "#065f46" }}>&lt; 0.5%</div>
                <div style={{ color: "#666" }}>Avg. Pmax Degradation @ 8000 cycles</div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: "auto", border: "1px solid #ddd", borderRadius: "4px", padding: "16px" }}>
            <div style={{ fontSize: "8pt", fontWeight: "700", color: "#065f46", marginBottom: "12px", textTransform: "uppercase" }}>Authorisation</div>
            <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
              {[
                { role: "Prepared By", name: "Mr. A. Singh", title: "Lab Technician" },
                { role: "Checked By", name: "Ms. T. Kumar", title: "Sr. Engineer" },
                { role: "Authorized By", name: "Prof. G. Krishnan", title: "Tech. Manager" },
                { role: "Issued By", name: "Mr. D. Rao", title: "Quality Manager" },
              ].map((sig) => (
                <div key={sig.role} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
                  <div style={{ fontWeight: "600" }}>{sig.name}</div>
                  <div style={{ color: "#666", fontSize: "7.5pt" }}>{sig.title}</div>
                  <div style={{ color: "#065f46", fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ EXECUTIVE SUMMARY ═══ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SH num="1" title="EXECUTIVE SUMMARY" color="#065f46" />
          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "4px", padding: "14px", marginBottom: "16px", fontSize: "8.5pt" }}>
            <p style={{ marginBottom: "10px" }}>
              SolarLabX was commissioned by {customer} to conduct an independent evaluation of the {robotModel} robotic cleaning system for compatibility with solar PV modules. The evaluation consisted of an accelerated 8000-cycle cleaning simulation using controlled sand and dust soiling, equivalent to approximately 20 years of field operation.
            </p>
            <p style={{ marginBottom: "10px" }}>
              Three module makes with two samples each (6 modules total) were subjected to the full test sequence. Electrical performance (STC I-V), electroluminescence (EL) imaging, infrared (IR) thermography, reflectance measurements, and visual inspection were conducted at 0, 1000, 2000, and 8000 cleaning cycles.
            </p>
            <p>
              All three module makes were classified as Class A or Class B based on the SolarLabX Cleaning Compatibility Classification System, indicating negligible to moderate degradation attributable to the robotic cleaning process. No module failures or serious defects were observed. The {robotModel} is considered compatible with all three module types evaluated.
            </p>
          </div>

          <SH num="2" title="INTRODUCTION & MOTIVATION" color="#065f46" />
          <div style={{ fontSize: "8.5pt" }}>
            <p style={{ marginBottom: "8px" }}>Soiling of PV module surfaces is a significant source of energy yield loss in arid and semi-arid regions. Robotic cleaning systems offer a water-saving, labour-efficient alternative to manual or conventional cleaning. However, repeated mechanical contact between cleaning brushes and the module glass surface may induce:</p>
            <ul style={{ paddingLeft: "20px", marginBottom: "8px" }}>
              <li>ARC (Anti-Reflective Coating) abrasion and degradation</li>
              <li>Micro-scratches reducing light transmission</li>
              <li>Mechanical stress leading to micro-cracks in PV cells</li>
              <li>Frame or junction box damage from repeated traversal</li>
            </ul>
            <p>This evaluation quantifies these effects under controlled conditions and provides an objective classification of module compatibility.</p>
          </div>
        </div>

        {/* ═══ SCOPE OF WORK ═══ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SH num="3" title="SCOPE OF WORK" color="#065f46" />

          <SH2>3.1 Test Specimens</SH2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: "#065f46", color: "white" }}>
                {["Lab ID", "Make", "Model", "Technology", "Rated Power", "Quantity", "Sample Nos."].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULE_SPECIMENS.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px" }}>{m.id}</td>
                  <td style={{ padding: "4px 8px" }}>{m.make}</td>
                  <td style={{ padding: "4px 8px" }}>{m.model}</td>
                  <td style={{ padding: "4px 8px" }}>{m.tech}</td>
                  <td style={{ padding: "4px 8px" }}>{m.power}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{m.qty}</td>
                  <td style={{ padding: "4px 8px" }}>A, B</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH2>3.2 Robot Specifications</SH2>
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px" }}>
            <InfoBlock items={[
              ["Robot Model", robotModel],
              ["Cleaning Method", "Rotating brush + air blower"],
              ["Brush Material", "Microfiber (17mm filament)"],
              ["Brush Pressure", "12 N/m² ± 1 N/m²"],
              ["Speed", "0.8 m/s nominal"],
              ["Water Use", "Dry cleaning (waterless)"],
            ]} />
            <InfoBlock items={[
              ["Module Tilt Range", "10° – 35°"],
              ["Operating Weight", "28 kg"],
              ["Drive System", "Rail-guided autonomous"],
              ["Control", "Programmable PLC + GPS"],
              ["Power Source", "24 V DC battery"],
              ["Cycle Definition", "1 full pass (end-to-end)"],
            ]} />
          </div>

          <SH2>3.3 Sand & Dust Specifications</SH2>
          <InfoBlock items={[
            ["Sand Type", "IEC 60068-2-68 Test Dust (Arizona Road Dust, medium grade)"],
            ["Particle Size", "D50 = 35 µm (distribution: 1–200 µm)"],
            ["Density", "1.67 g/cm³"],
            ["Application Method", "Pneumatic spray nozzle at 50 cm distance"],
            ["Pre-test Cleaning", "All modules cleaned to optical baseline before cycle 0"],
          ]} />
        </div>

        {/* ═══ METHODOLOGY ═══ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SH num="4" title="METHODOLOGY & TEST SETUP" color="#065f46" />

          <SH2>4.1 Test Setup (MMS Layout)</SH2>
          <div style={{ border: "1px dashed #ccc", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9", marginBottom: "10px", borderRadius: "4px", fontSize: "8.5pt", color: "#888" }}>
            [MMS Layout Diagram – 3×2 module array, robot rail, DustIQ sensor positions (S1–S4), sand spray nozzle]
          </div>
          <InfoBlock items={[
            ["Array Layout", "3 module makes × 2 samples = 6 modules in 2×3 portrait array"],
            ["Tilt Angle", "15° (fixed)"],
            ["Orientation", "South-facing"],
            ["DustIQ Sensors", "4 positions: S1 (top-L), S2 (top-R), S3 (bottom-L), S4 (bottom-R)"],
            ["Robot Parking", "North end of rail"],
            ["Sand Nozzle", "3.5 m above panel centre, 60° spray cone"],
          ]} />

          <SH2>4.2 Sand Spraying Schedule</SH2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#065f46", color: "white" }}>
                {["Cycle Range", "Regular Soiling", "Sand Storm Simulation", "Notes"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SAND_SCHEDULE.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{row.cycles}</td>
                  <td style={{ padding: "5px 8px" }}>{row.regular}</td>
                  <td style={{ padding: "5px 8px" }}>{row.storm}</td>
                  <td style={{ padding: "5px 8px", color: "#666" }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH2>4.3 Testing Sequence</SH2>
          <div className="grid grid-cols-3 gap-4" style={{ marginTop: "8px" }}>
            {[
              { phase: "Phase 1: 0 → 1000 cycles", checks: ["Initial measurements (Cycle 0)", "EL + IV + IR + Reflectance", "Visual Inspection", "Measurements at 1000 cycles"] },
              { phase: "Phase 2: 1000 → 2000 cycles", checks: ["Continue soiling + cleaning", "Measurements at 2000 cycles", "EL + IV + IR + Reflectance", "Visual Inspection"] },
              { phase: "Phase 3: 2000 → 8000 cycles", checks: ["Reduced storm frequency", "Measurements at 4000 & 8000", "Full characterisation at 8000", "Final classification"] },
            ].map((ph) => (
              <div key={ph.phase} style={{ border: "1px solid #d1fae5", borderRadius: "4px", padding: "10px", background: "#f0fdf4" }}>
                <div style={{ fontWeight: "700", color: "#065f46", marginBottom: "6px", fontSize: "8.5pt" }}>{ph.phase}</div>
                <ul style={{ paddingLeft: "14px", fontSize: "7.5pt", color: "#374151" }}>
                  {ph.checks.map(c => <li key={c} style={{ marginBottom: "3px" }}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ TEST RESULTS ═══ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SH num="5" title="TEST RESULTS" color="#065f46" />

          <SH2>5.1 STC Performance – Summary (Reference Module Corrected)</SH2>
          <p style={{ fontSize: "8pt", color: "#666", marginBottom: "8px" }}>
            Deviation values shown are corrected for reference module drift. Formula: ΔP_corrected = ΔP_MUT − ΔP_REF
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
            <thead>
              <tr style={{ background: "#065f46", color: "white" }}>
                <th style={{ padding: "5px 8px" }}>Sample</th>
                <th style={{ padding: "5px 8px" }}>Technology</th>
                <th style={{ padding: "5px 8px", textAlign: "center" }}>ΔPmax @ 1000</th>
                <th style={{ padding: "5px 8px", textAlign: "center" }}>ΔPmax @ 2000</th>
                <th style={{ padding: "5px 8px", textAlign: "center" }}>ΔPmax @ 8000</th>
                <th style={{ padding: "5px 8px", textAlign: "center" }}>ΔIsc @ 8000</th>
                <th style={{ padding: "5px 8px", textAlign: "center" }}>Class</th>
              </tr>
            </thead>
            <tbody>
              {RESULTS_MATRIX.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{r.sample}</td>
                  <td style={{ padding: "5px 8px" }}>{r.tech}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>{r.pmax1000}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#d97706" }}>{r.pmax2000}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: parseFloat(r.pmax8000) < -0.5 ? "#d97706" : "#059669" }}>{r.pmax8000}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.isc8000}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><ClassBadge cls={r.overallClass} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH2>5.2 Image Comparison Matrix (Visual / IR / EL)</SH2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "7.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#334155", color: "white" }}>
                <th style={{ padding: "5px 8px" }}>Sample</th>
                {["Visual @ 0", "EL @ 0", "IR @ 0", "Visual @ 1000", "EL @ 1000", "Visual @ 2000", "EL @ 2000", "Visual @ 8000", "EL @ 8000", "IR @ 8000"].map(h => (
                  <th key={h} style={{ padding: "4px 6px", textAlign: "center", fontSize: "6.5pt" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULE_SPECIMENS.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontWeight: "600", fontSize: "7pt" }}>{m.id}</td>
                  {Array.from({ length: 10 }, (_, j) => (
                    <td key={j} style={{ padding: "3px", textAlign: "center" }}>
                      <div style={{ width: "40px", height: "32px", background: j < 3 ? "#111" : j < 6 ? "#111" : "#111", border: "1px dashed #555", borderRadius: "2px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5.5pt", color: "#888" }}>
                        [Img]
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <SH2>5.3 EL Analysis – Defect Summary</SH2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginTop: "8px" }}>
            <thead>
              <tr style={{ background: "#065f46", color: "white" }}>
                {["Sample", "Defect Type", "Pre-test", "@ 1000", "@ 2000", "@ 8000", "Attribution"].map(h => (
                  <th key={h} style={{ padding: "5px 8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["CLN-M01", "Microcracks", "None", "None", "None", "None", "—"],
                ["CLN-M01", "Contact defects", "None", "None", "1 cell", "1 cell", "Pre-existing?"],
                ["CLN-M02", "Dark cells", "None", "None", "None", "None", "—"],
                ["CLN-M02", "Branched cracks", "None", "None", "None", "None", "—"],
                ["CLN-M03", "Shunting", "None", "None", "None", "None", "—"],
              ].map(([sample, defect, p0, p1, p2, p8, attr], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px" }}>{sample}</td>
                  <td style={{ padding: "4px 8px" }}>{defect}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: "#059669" }}>{p0}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: "#059669" }}>{p1}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: p2 !== "None" ? "#d97706" : "#059669" }}>{p2}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center", color: p8 !== "None" ? "#d97706" : "#059669" }}>{p8}</td>
                  <td style={{ padding: "4px 8px", color: "#666" }}>{attr}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH2>5.4 Reflectance Measurements (400–1000 nm)</SH2>
          <p style={{ fontSize: "8pt", color: "#666", marginBottom: "8px" }}>6 measurement positions per module. Values shown as average reflectance change vs. initial.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: "#334155", color: "white" }}>
                {["Sample", "P1 (TL)", "P2 (TC)", "P3 (TR)", "P4 (BL)", "P5 (BC)", "P6 (BR)", "Mean Δ Ref %", "Class"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { id: "CLN-M01", vals: ["+0.82", "+0.79", "+0.84", "+0.77", "+0.81", "+0.83"], mean: "+0.81%" },
                { id: "CLN-M02", vals: ["+0.61", "+0.58", "+0.65", "+0.54", "+0.60", "+0.62"], mean: "+0.60%" },
                { id: "CLN-M03", vals: ["+0.92", "+0.88", "+0.94", "+0.87", "+0.91", "+0.93"], mean: "+0.91%" },
              ].map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "4px 8px", fontWeight: "600" }}>{r.id}</td>
                  {r.vals.map((v, j) => <td key={j} style={{ padding: "4px 8px", textAlign: "center", color: "#059669" }}>{v}</td>)}
                  <td style={{ padding: "4px 8px", textAlign: "center", fontWeight: "700", color: "#059669" }}>{r.mean}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}><ClassBadge cls="Class A" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ TEST-SPECIFIC CHARTS & UNCERTAINTY ═══ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SH num="5.5" title="PRE/POST COMPARISON CHART" color="#065f46" />
          <div style={{ marginBottom: "16px" }}>
            <PrePostComparisonChart />
          </div>

          <SH num="5.6" title="MEASUREMENT UNCERTAINTY BUDGET" color="#065f46" />
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
        </div>

        {/* ═══ CLASSIFICATION & CONCLUSIONS ═══ */}
        <div className="page-break" style={{ padding: "12mm 20mm", fontSize: "9pt" }}>
          <SH num="6" title="CLASSIFICATION SYSTEM" color="#065f46" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <thead>
              <tr style={{ background: "#065f46", color: "white" }}>
                {["Class", "Description", "ΔPmax Criterion", "ΔIsc Criterion", "Reflectance Criterion"].map(h => (
                  <th key={h} style={{ padding: "5px 8px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASS_SYSTEM.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px" }}><ClassBadge cls={row.cls} /></td>
                  <td style={{ padding: "5px 8px" }}>{row.desc}</td>
                  <td style={{ padding: "5px 8px" }}>{row.pmax}</td>
                  <td style={{ padding: "5px 8px" }}>{row.isc}</td>
                  <td style={{ padding: "5px 8px" }}>{row.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <SH num="7" title="CONCLUSIONS" color="#065f46" />
          <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11pt", fontWeight: "700", color: "#065f46", marginBottom: "6px" }}>✓ ROBOT COMPATIBLE WITH ALL 3 MODULE TYPES TESTED</div>
            <p style={{ fontSize: "8.5pt", color: "#166534" }}>
              The {robotModel} robotic cleaning system completed 8000 cleaning cycles without causing significant degradation to any of the 3 PV module types tested. Reflectance measurements confirm positive soiling removal efficacy. No module failures or safety-critical defects were observed.
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
              <tr style={{ background: "#065f46", color: "white" }}>
                {["Make", "Technology", "ΔPmax @8000", "ΔIsc @8000", "Reflectance", "Visual Inspection", "Overall Class"].map(h => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESULTS_MATRIX.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "5px 8px", fontWeight: "600" }}>{r.make}</td>
                  <td style={{ padding: "5px 8px" }}>{r.tech}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>{r.pmax8000}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>{r.isc8000}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: "#059669" }}>{r.ref8000}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><ClassBadge cls={r.visual === "A" ? "Class A" : "Class B"} /></td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}><ClassBadge cls={r.overallClass === "A" ? "Class A" : "Class B"} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "30px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
            <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
              {[
                { role: "Prepared By", name: "Mr. A. Singh", title: "Lab Technician" },
                { role: "Checked By", name: "Ms. T. Kumar", title: "Sr. Engineer" },
                { role: "Authorized By", name: "Prof. G. Krishnan", title: "Tech. Manager" },
                { role: "Issued By", name: "Mr. D. Rao", title: "Quality Manager" },
              ].map((sig) => (
                <div key={sig.role} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
                  <div style={{ fontWeight: "600" }}>{sig.name}</div>
                  <div style={{ color: "#666", fontSize: "7.5pt" }}>{sig.title}</div>
                  <div style={{ color: "#065f46", fontSize: "7.5pt", fontWeight: "600" }}>{sig.role}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: "16px", fontSize: "7.5pt", color: "#666", borderTop: "1px solid #eee", paddingTop: "8px" }}>
            End of Report – {reportNo} · SolarLabX, Pune · NABL TC-8192
          </div>
        </div>

      </div>
    </>
  );
}

function SH({ num, title, color = "#1e3a5f" }: { num: string; title: string; color?: string }) {
  return <div style={{ fontSize: "11pt", fontWeight: "800", color, borderBottom: `2.5px solid ${color}`, paddingBottom: "5px", marginBottom: "12px" }}>{num}. {title}</div>;
}
function SH2({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "9.5pt", fontWeight: "700", color: "#334155", marginTop: "12px", marginBottom: "6px" }}>{children}</div>;
}
function InfoBlock({ items }: { items: [string, string][] }) {
  return (
    <div style={{ fontSize: "8.5pt", border: "1px solid #e5e7eb", padding: "10px", borderRadius: "4px", background: "#f8fafc" }}>
      {items.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
          <span style={{ color: "#666", minWidth: "130px" }}>{k}:</span>
          <span style={{ fontWeight: "500" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
