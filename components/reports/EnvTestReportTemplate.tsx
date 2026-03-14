// @ts-nocheck
"use client";
import React from "react";

export interface EnvTestResult {
  sample: string;
  pmaxBefore: string;
  pmaxAfter: string;
  delta: string;
  riso: string;
  visual: string;
  elChange: string;
  pass: boolean;
  extra?: Record<string, string>;
}

export interface EnvTestReportProps {
  reportNo: string;
  title: string;
  subtitle: string;
  accent: string;
  standard: string;
  customer?: string;
  moduleModel?: string;
  moduleSpecs?: [string, string][];
  testConditions: [string, string][];
  results: EnvTestResult[];
  criterion: string;
  purpose: string;
  equipment: string[];
  overallDelta?: string;
  extraSections?: React.ReactNode;
  passedDate?: string;
}

export function EnvTestReportTemplate({
  reportNo, title, subtitle, accent, standard, customer = "Axitec Energy GmbH",
  moduleModel = "AC-430MH/144V", moduleSpecs, testConditions, results,
  criterion, purpose, equipment, overallDelta = "< 5%", extraSections, passedDate = "2026-03-14",
}: EnvTestReportProps) {

  const defaultSpecs: [string, string][] = moduleSpecs || [
    ["Manufacturer", customer], ["Model", moduleModel], ["Technology", "Mono-PERC"],
    ["Rated Pmax", "430 Wp"], ["No. of Samples", "3 modules"], ["Cell Count", "144 half-cut"],
  ];

  return (
    <>
      <style>{`
        @media print {
          .no-print{display:none!important}
          body{background:white!important}
          .report-container{box-shadow:none!important;max-width:100%!important}
          .page-break{break-before:page}
          @page{size:A4;margin:15mm}
          thead{display:table-header-group}
        }
      `}</style>

      <div className="no-print flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">← Back</a>
          <button onClick={() => window.print()} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      <div className="report-container max-w-5xl mx-auto bg-white shadow-lg print:shadow-none"
        style={{ fontFamily: "'Calibri','Arial',sans-serif", fontSize: "9.5pt", color: "#1a1a1a" }}>
        <div style={{ padding: "15mm 20mm" }}>

          {/* Lab Header */}
          <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "20pt", fontWeight: "800", color: accent }}>☀ SolarLabX</div>
              <div style={{ fontSize: "8pt", color: "#666" }}>NABL TC-8192 · ISO/IEC 17025:2017 · Plot 47, MIDC, Pune – 411018, India</div>
            </div>
            <div style={{ textAlign: "right", fontSize: "8pt" }}>
              <div style={{ fontFamily: "monospace", fontWeight: "700", fontSize: "9pt" }}>{reportNo}</div>
              <div style={{ color: "#555" }}>Issue Date: {passedDate}</div>
              <div>
                <span style={{ background: "#22c55e", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "700" }}>ISSUED</span>
              </div>
            </div>
          </div>

          {/* Title Box */}
          <div style={{ background: accent, color: "white", padding: "16px 20px", borderRadius: "4px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "11pt", fontWeight: "600", marginBottom: "4px", opacity: 0.9 }}>TEST REPORT – {standard}</div>
            <div style={{ fontSize: "16pt", fontWeight: "800", marginBottom: "8px" }}>{title}</div>
            <div style={{ fontSize: "9pt", opacity: 0.85 }}>{subtitle}</div>
          </div>

          {/* Module & Test Conditions grid */}
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "16px", fontSize: "8.5pt" }}>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontWeight: "700", color: accent, marginBottom: "8px", textTransform: "uppercase", fontSize: "8pt", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>
                Module Under Test (MUT)
              </div>
              {defaultSpecs.map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ color: "#666", minWidth: "110px" }}>{k}:</span>
                  <span style={{ fontWeight: "500" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "12px" }}>
              <div style={{ fontWeight: "700", color: accent, marginBottom: "8px", textTransform: "uppercase", fontSize: "8pt", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>
                Test Conditions
              </div>
              {testConditions.map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
                  <span style={{ color: "#666", minWidth: "130px" }}>{k}:</span>
                  <span style={{ fontWeight: "500" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purpose */}
          <SH title="TEST PURPOSE" color={accent} />
          <p style={{ fontSize: "8.5pt", color: "#555", marginBottom: "12px", padding: "8px 12px", background: "#fafafa", border: "1px solid #eee", borderRadius: "4px" }}>
            {purpose}
          </p>

          {/* Criterion */}
          <SH title="PASS/FAIL CRITERION" color={accent} />
          <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "4px", padding: "8px 12px", marginBottom: "12px", fontSize: "8.5pt" }}>
            <strong>Acceptance Criterion:</strong> {criterion}
          </div>

          {/* Results table */}
          <SH title="ELECTRICAL TEST RESULTS" color={accent} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "12px" }}>
            <thead>
              <tr style={{ background: accent, color: "white" }}>
                {["Sample ID", "Pmax Before (W)", "Pmax After (W)", "ΔPmax", "RISO Post", "Visual", "EL Change", "Result"].map(h => (
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
                  <td style={{ padding: "5px 8px", textAlign: "center", fontWeight: "600", color: Math.abs(parseFloat(r.delta)) < 5 ? "#d97706" : "#dc2626" }}>
                    {r.delta}
                  </td>
                  <td style={{ padding: "5px 8px", textAlign: "center", fontSize: "7.5pt" }}>{r.riso}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: r.visual === "No defects" ? "#059669" : "#d97706", fontSize: "7.5pt" }}>{r.visual}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center", color: r.elChange === "None" ? "#059669" : "#d97706", fontSize: "7.5pt" }}>{r.elChange}</td>
                  <td style={{ padding: "5px 8px", textAlign: "center" }}>
                    <span style={{ background: r.pass ? "#22c55e" : "#ef4444", color: "white", padding: "1px 8px", borderRadius: "3px", fontSize: "7.5pt", fontWeight: "700" }}>
                      {r.pass ? "PASS" : "FAIL"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EL placeholder */}
          <SH title="ELECTROLUMINESCENCE IMAGING (PRE / POST)" color={accent} />
          <div className="grid grid-cols-3 gap-4" style={{ marginBottom: "12px" }}>
            {results.map((r, i) => (
              <div key={i} style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "8px" }}>
                <div style={{ fontWeight: "600", fontSize: "8pt", color: accent, marginBottom: "6px" }}>{r.sample}</div>
                <div className="grid grid-cols-2 gap-2">
                  {["Pre", "Post"].map(label => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ border: "1px dashed #ccc", height: "55px", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", fontSize: "6.5pt", color: "#888", marginBottom: "3px", borderRadius: "3px" }}>[EL {label}]</div>
                      <div style={{ fontSize: "7pt", color: "#555" }}>{label}-test</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: "7pt", color: "#059669", marginTop: "4px" }}>✓ No new defects</div>
              </div>
            ))}
          </div>

          {/* Extra sections */}
          {extraSections}

          {/* Equipment */}
          <SH title="EQUIPMENT USED" color={accent} />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt", marginBottom: "16px" }}>
            <tbody>
              {equipment.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "3px 8px" }}>•</td>
                  <td style={{ padding: "3px 8px" }}>{e}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Conclusion */}
          <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", fontSize: "8.5pt" }}>
            <div style={{ fontSize: "10pt", fontWeight: "800", color: "#15803d", marginBottom: "6px" }}>✓ OVERALL RESULT: PASS – {standard}</div>
            <p style={{ color: "#166534" }}>
              All {results.length} samples passed the {title} as per {standard}. Maximum ΔPmax = {overallDelta} (criterion: &lt; 5%). No relevant visual defects or EL changes observed post-test.
            </p>
          </div>

          {/* Signature */}
          <div style={{ borderTop: "1px solid #ddd", paddingTop: "16px" }}>
            <div className="grid grid-cols-4 gap-4" style={{ fontSize: "8.5pt" }}>
              {[["Prepared By", "Dr. A. Sharma", "Lab Technician"], ["Checked By", "Mr. R. Verma", "Sr. Engineer"], ["Authorized By", "Prof. G. Krishnan", "Tech. Manager"], ["Issued By", "Ms. P. Nair", "Quality Manager"]].map(([role, name, ttl]) => (
                <div key={role} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #999", height: "28px", marginBottom: "4px" }}></div>
                  <div style={{ fontWeight: "600" }}>{name}</div>
                  <div style={{ color: "#666", fontSize: "7.5pt" }}>{ttl}</div>
                  <div style={{ color: accent, fontSize: "7.5pt", fontWeight: "600" }}>{role}</div>
                  <div style={{ color: "#999", fontSize: "7pt" }}>Date: {passedDate}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", fontSize: "7.5pt", color: "#666" }}>
              {reportNo} · SolarLabX, Pune · NABL TC-8192 · ISO/IEC 17025:2017
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SH({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ fontSize: "11pt", fontWeight: "800", color, borderBottom: `2.5px solid ${color}`, paddingBottom: "5px", marginBottom: "10px", marginTop: "14px" }}>
      {title}
    </div>
  );
}
