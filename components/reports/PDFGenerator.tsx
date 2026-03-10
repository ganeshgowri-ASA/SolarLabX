"use client";

import { Button } from "@/components/ui/button";
import type { SampleReport } from "@/lib/mock-data";
import type { DetailedTestResult, TestDefinition, LabDetails } from "@/lib/report-test-definitions";
import { DEFAULT_LAB_DETAILS } from "@/lib/report-test-definitions";
import { generateNextDocumentNumber } from "@/lib/document-numbering";

interface PDFGeneratorProps {
  report?: SampleReport;
  detailedMode?: boolean;
  labDetails?: LabDetails;
  reportNumber?: string;
  reportVersion?: string;
  standard?: string;
  standardTitle?: string;
  moduleInfo?: {
    moduleId: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    ratedPower: string;
    dimensions: string;
    cellType: string;
    numberOfCells: string;
  };
  testResults?: DetailedTestResult[];
  testDefinitions?: TestDefinition[];
  reportDate?: string;
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
}

export function PDFGenerator({
  report,
  detailedMode = false,
  labDetails = DEFAULT_LAB_DETAILS,
  reportNumber = "",
  reportVersion = "1.0",
  standard = "",
  standardTitle = "",
  moduleInfo,
  testResults = [],
  testDefinitions = [],
  reportDate = "",
  preparedBy = "",
  reviewedBy = "",
  approvedBy = "",
}: PDFGeneratorProps) {

  const handleGenerateHTML = () => {
    let html: string;

    // Auto-generate a traceable document number if not provided
    const effectiveReportNumber = reportNumber || report?.reportNumber || generateNextDocumentNumber('test_report', { standard: standard || report?.standard || 'IEC 61215' });

    if (detailedMode && testResults.length > 0) {
      html = generateDetailedHTML();
    } else if (report) {
      html = generateSimpleHTML(report);
    } else {
      return;
    }

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${effectiveReportNumber}_Report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  function generateSimpleHTML(r: SampleReport): string {
    const passCount = r.testResults.filter((t) => t.result === "pass").length;
    const totalCount = r.testResults.length;
    const overallResult = r.testResults.every((t) => t.result !== "fail") ? "PASS" : "FAIL";

    return `<!DOCTYPE html>
<html><head><title>${r.reportNumber} - ${r.title}</title>
<style>${baseCSS()}</style></head><body>
<div class="header">
  <p class="confidential">CONFIDENTIAL</p>
  <h1>TEST REPORT</h1>
  <p class="subtitle">${r.title}</p>
  <p class="report-no">${r.reportNumber}</p>
</div>
<div class="meta-grid">
  <div class="meta-item"><label>Standard</label><span>${r.standard}</span></div>
  <div class="meta-item"><label>Report Date</label><span>${r.createdAt}</span></div>
  <div class="meta-item"><label>Module ID</label><span>${r.moduleId}</span></div>
  <div class="meta-item"><label>Manufacturer</label><span>${r.manufacturer}</span></div>
</div>
<h2>Test Results Summary</h2>
<table>
  <thead><tr><th>Test</th><th>Clause</th><th>Result</th><th>Measured Value</th><th>Acceptance Criteria</th></tr></thead>
  <tbody>${r.testResults.map((t) => `<tr><td>${t.testName}</td><td>${t.clause}</td><td class="${t.result}">${t.result.toUpperCase()}</td><td>${t.value || "—"}</td><td>${t.limit || "—"}</td></tr>`).join("")}</tbody>
</table>
<div class="overall ${overallResult === "PASS" ? "pass-bg" : "fail-bg"}">OVERALL: ${overallResult} (${passCount}/${totalCount} passed)</div>
${signaturesHTML(r.preparedBy, r.reviewedBy || "", r.approvedBy || "", r.createdAt, r.updatedAt)}
${footerHTML()}
</body></html>`;
  }

  function generateDetailedHTML(): string {
    const passCount = testResults.filter((t) => t.result === "pass").length;
    const failCount = testResults.filter((t) => t.result === "fail").length;
    const total = testResults.filter((t) => t.result !== "n/a").length;
    const overallResult = failCount === 0 && passCount > 0 ? "PASS" : failCount > 0 ? "FAIL" : "PENDING";
    const mi = moduleInfo!;

    let testDetailsSections = "";
    testResults.forEach((tr, idx) => {
      const def = testDefinitions.find((d) => d.id === tr.testId);
      if (!def) return;
      const resultBg = tr.result === "pass" ? "#f0fdf4" : tr.result === "fail" ? "#fef2f2" : "#f9fafb";
      const resultColor = tr.result === "pass" ? "#16a34a" : tr.result === "fail" ? "#dc2626" : "#6b7280";

      testDetailsSections += `
<div class="test-section" style="page-break-inside: avoid;">
  <div class="test-header">
    <strong>${idx + 1}. ${def.testName}</strong> <span class="clause">(${def.clause})</span>
    <span class="result-badge" style="background:${resultBg}; color:${resultColor}">${tr.result.toUpperCase()}</span>
  </div>
  <div class="test-body">
    <p><strong>Purpose:</strong> ${def.purpose}</p>
    <p><strong>Test Conditions:</strong></p>
    <ul>${def.testConditions.map((c) => `<li>${c}</li>`).join("")}</ul>
    <p><strong>Equipment Used:</strong></p>
    <div class="equipment">${(tr.equipmentUsed.length ? tr.equipmentUsed : def.equipmentUsed).map((e) => `<span class="eq-tag">${e}</span>`).join("")}</div>
    <p><strong>Measurements:</strong></p>
    <ul>${def.measurements.map((m) => `<li>${m}</li>`).join("")}</ul>
    <table class="results-table">
      <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
      <tbody>${def.resultFields.map((f) => `<tr><td>${f.label}</td><td><strong>${tr.values[f.label] || f.defaultValue || "—"}</strong></td><td>${f.unit}</td></tr>`).join("")}</tbody>
    </table>
    <p><strong>Pass/Fail Criteria:</strong></p>
    <ul>${def.passCriteria.map((c) => `<li class="${tr.result}">${tr.result === "pass" ? "✓" : tr.result === "fail" ? "✗" : "○"} ${c}</li>`).join("")}</ul>
    ${tr.observations ? `<p><strong>Observations:</strong> ${tr.observations}</p>` : ""}
    <p class="meta-small">Tested by: ${tr.testedBy || "—"} | Date: ${tr.testDate || "—"}</p>
  </div>
</div>`;
    });

    return `<!DOCTYPE html>
<html><head><title>${reportNumber} - ${standardTitle}</title>
<style>${baseCSS()}
.lab-header { text-align:center; border:2px solid #1e40af; padding:20px; margin-bottom:20px; }
.lab-header h1 { margin:0; font-size:20px; color:#1e40af; }
.lab-header .accr { font-size:11px; color:#666; margin-top:5px; }
.module-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; }
.module-grid .item label { font-size:11px; color:#666; display:block; }
.module-grid .item span { font-weight:bold; font-size:13px; }
.test-section { border:1px solid #e5e7eb; border-radius:6px; margin:15px 0; }
.test-header { background:#f8fafc; padding:10px 15px; border-bottom:1px solid #e5e7eb; display:flex; align-items:center; gap:10px; }
.test-header .clause { font-family:monospace; font-size:12px; color:#6b7280; }
.test-header .result-badge { margin-left:auto; padding:2px 10px; border-radius:12px; font-size:12px; font-weight:bold; }
.test-body { padding:15px; }
.test-body ul { margin:5px 0 10px 20px; }
.test-body li { margin:2px 0; }
.test-body li.pass { color:#16a34a; }
.test-body li.fail { color:#dc2626; }
.equipment { display:flex; flex-wrap:wrap; gap:5px; margin:5px 0 10px; }
.eq-tag { background:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:12px; }
.results-table { width:100%; border-collapse:collapse; margin:10px 0; }
.results-table th, .results-table td { border:1px solid #e5e7eb; padding:6px 10px; text-align:left; font-size:13px; }
.results-table th { background:#f8fafc; }
.meta-small { font-size:11px; color:#9ca3af; margin-top:10px; }
</style></head><body>
<div class="lab-header">
  <p class="confidential">CONFIDENTIAL</p>
  <h1>${labDetails.labName}</h1>
  <p style="font-size:13px; color:#444;">${labDetails.address}</p>
  <p class="accr">Accreditation: ${labDetails.accreditationNumber} | ${labDetails.accreditationBody}</p>
</div>

<div class="header" style="border:none; padding:10px;">
  <h1 style="font-size:18px;">TEST REPORT</h1>
  <p class="subtitle">${standardTitle}</p>
  <p style="font-size:13px; color:#666;">As per ${standard}</p>
  <p class="report-no">${reportNumber} (v${reportVersion})</p>
</div>

<h2>1. Module Under Test</h2>
<div class="module-grid">
  <div class="item"><label>Module ID</label><span>${mi.moduleId}</span></div>
  <div class="item"><label>Manufacturer</label><span>${mi.manufacturer}</span></div>
  <div class="item"><label>Model</label><span>${mi.model || "—"}</span></div>
  <div class="item"><label>Serial Number</label><span>${mi.serialNumber || "—"}</span></div>
  <div class="item"><label>Rated Power</label><span>${mi.ratedPower || "—"}</span></div>
  <div class="item"><label>Dimensions</label><span>${mi.dimensions || "—"}</span></div>
  <div class="item"><label>Cell Type</label><span>${mi.cellType || "—"}</span></div>
  <div class="item"><label>Cells</label><span>${mi.numberOfCells || "—"}</span></div>
</div>

<h2>2. Test Results Summary</h2>
<table>
  <thead><tr><th>#</th><th>Test Name</th><th>Clause</th><th>Result</th><th>Key Value</th><th>Date</th></tr></thead>
  <tbody>${testResults.map((tr, i) => {
    const kv = Object.entries(tr.values).find(([, v]) => v)?.[1] || "—";
    return `<tr><td>${i + 1}</td><td>${tr.testName}</td><td>${tr.clause}</td><td class="${tr.result}">${tr.result.toUpperCase()}</td><td>${kv}</td><td>${tr.testDate}</td></tr>`;
  }).join("")}</tbody>
</table>
<div class="overall ${overallResult === "PASS" ? "pass-bg" : overallResult === "FAIL" ? "fail-bg" : ""}" style="${overallResult === "PENDING" ? "background:#fefce8;border:2px solid #eab308;color:#a16207;" : ""}">
  OVERALL: ${overallResult} (${passCount} passed, ${failCount} failed, ${testResults.length - total} N/A)
</div>

<h2>3. Detailed Test Results</h2>
${testDetailsSections}

<div style="page-break-before: always;"></div>
<h2>4. Authorization & Signatures</h2>
${signaturesHTML(preparedBy, reviewedBy, approvedBy, reportDate, reportDate)}
${footerHTML()}
</body></html>`;
  }

  function baseCSS(): string {
    return `
body { font-family: Arial, sans-serif; max-width: 900px; margin: 30px auto; padding: 20px; line-height: 1.5; font-size: 13px; }
.header { text-align: center; padding: 15px; margin-bottom: 20px; }
.header h1 { margin: 0; font-size: 18px; }
.header .subtitle { font-size: 15px; margin-top: 5px; }
.header .report-no { font-family: monospace; margin-top: 8px; font-size: 14px; }
.confidential { color: #999; font-size: 11px; letter-spacing: 3px; }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 15px 0; padding: 12px; background: #f9f9f9; border-radius: 6px; }
.meta-item label { font-size: 11px; color: #666; display: block; }
.meta-item span { font-weight: bold; }
h2 { font-size: 15px; margin-top: 25px; padding-bottom: 5px; border-bottom: 2px solid #1e40af; color: #1e40af; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
th, td { border: 1px solid #ddd; padding: 7px 10px; text-align: left; }
th { background: #f0f0f0; font-weight: bold; }
.pass { color: #16a34a; font-weight: bold; }
.fail { color: #dc2626; font-weight: bold; }
.n\\/a, .pending { color: #6b7280; }
.overall { text-align: center; padding: 12px; margin: 15px 0; font-size: 15px; font-weight: bold; border-radius: 6px; }
.overall.pass-bg { background: #f0fdf4; border: 2px solid #16a34a; color: #16a34a; }
.overall.fail-bg { background: #fef2f2; border: 2px solid #dc2626; color: #dc2626; }
.signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 25px; margin-top: 30px; text-align: center; }
.sig-block { border-top: 2px dashed #999; padding-top: 8px; }
.sig-block .name { font-style: italic; min-height: 40px; display: flex; align-items: flex-end; justify-content: center; }
.footer { text-align: center; font-size: 10px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 8px; }
@media print { body { margin: 0; } .test-section { page-break-inside: avoid; } }`;
  }

  function signaturesHTML(prep: string, rev: string, appr: string, d1: string, d2: string): string {
    return `<div class="signatures">
  <div><div class="sig-block"><div class="name">${prep}</div></div><p><strong>Prepared By</strong><br>Lab Technician<br>${d1}</p></div>
  <div><div class="sig-block"><div class="name">${rev}</div></div><p><strong>Reviewed By</strong><br>Lab Manager<br>${rev ? d2 : "________"}</p></div>
  <div><div class="sig-block"><div class="name">${appr}</div></div><p><strong>Approved By</strong><br>Lab Director<br>${appr ? "________" : "________"}</p></div>
</div>`;
  }

  function footerHTML(): string {
    return `<div class="footer">
  <p>This report shall not be reproduced except in full, without written permission of the laboratory.</p>
  <p>ISO/IEC 17025:2017 Compliant Test Report | ${labDetails.labName}</p>
</div>`;
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleGenerateHTML}>
        Export HTML Report
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        Print Report
      </Button>
    </div>
  );
}
