"use client";

import { Button } from "@/components/ui/button";
import type { SampleReport } from "@/lib/mock-data";

interface PDFGeneratorProps {
  report: SampleReport;
}

export function PDFGenerator({ report }: PDFGeneratorProps) {
  const handleGenerateHTML = () => {
    const passCount = report.testResults.filter((t) => t.result === "pass").length;
    const totalCount = report.testResults.length;
    const overallResult = report.testResults.every((t) => t.result !== "fail") ? "PASS" : "FAIL";

    const html = `<!DOCTYPE html>
<html><head><title>${report.reportNumber} - ${report.title}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; font-size: 14px; }
  .header { text-align: center; border: 2px solid #333; padding: 20px; margin-bottom: 30px; }
  .header h1 { margin: 0; font-size: 18px; }
  .header .subtitle { font-size: 16px; margin-top: 5px; }
  .header .report-no { font-family: monospace; margin-top: 10px; }
  .confidential { color: #999; font-size: 12px; letter-spacing: 2px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
  .meta-item label { font-size: 12px; color: #666; display: block; }
  .meta-item span { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f0f0f0; font-weight: bold; }
  .pass { color: #16a34a; font-weight: bold; }
  .fail { color: #dc2626; font-weight: bold; }
  .overall { text-align: center; padding: 15px; margin: 20px 0; font-size: 16px; font-weight: bold; }
  .overall.pass-bg { background: #f0fdf4; border: 2px solid #16a34a; color: #16a34a; }
  .overall.fail-bg { background: #fef2f2; border: 2px solid #dc2626; color: #dc2626; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-top: 40px; text-align: center; }
  .sig-block { border-top: 2px dashed #999; padding-top: 10px; }
  .sig-block .name { font-style: italic; min-height: 40px; display: flex; align-items: flex-end; justify-content: center; }
  .footer { text-align: center; font-size: 11px; color: #999; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; }
  @media print { body { margin: 0; } }
</style></head><body>
<div class="header">
  <p class="confidential">CONFIDENTIAL</p>
  <h1>TEST REPORT</h1>
  <p class="subtitle">${report.title}</p>
  <p class="report-no">${report.reportNumber}</p>
</div>

<div class="meta-grid">
  <div class="meta-item"><label>Standard</label><span>${report.standard}</span></div>
  <div class="meta-item"><label>Report Date</label><span>${report.createdAt}</span></div>
  <div class="meta-item"><label>Module ID</label><span>${report.moduleId}</span></div>
  <div class="meta-item"><label>Manufacturer</label><span>${report.manufacturer}</span></div>
</div>

<h2>Test Results Summary</h2>
<table>
  <thead><tr><th>Test</th><th>Clause</th><th>Result</th><th>Measured Value</th><th>Acceptance Criteria</th></tr></thead>
  <tbody>
    ${report.testResults.map((t) => `<tr>
      <td>${t.testName}</td>
      <td>${t.clause}</td>
      <td class="${t.result}">${t.result.toUpperCase()}</td>
      <td>${t.value || "-"}</td>
      <td>${t.limit || "-"}</td>
    </tr>`).join("")}
  </tbody>
</table>

<div class="overall ${overallResult === "PASS" ? "pass-bg" : "fail-bg"}">
  OVERALL RESULT: ${overallResult} (${passCount}/${totalCount} tests passed)
</div>

<div class="signatures">
  <div>
    <div class="sig-block"><div class="name">${report.preparedBy}</div></div>
    <p><strong>Prepared By</strong><br>Lab Technician<br>${report.createdAt}</p>
  </div>
  <div>
    <div class="sig-block"><div class="name">${report.reviewedBy || ""}</div></div>
    <p><strong>Reviewed By</strong><br>Lab Manager<br>${report.updatedAt}</p>
  </div>
  <div>
    <div class="sig-block"><div class="name">${report.approvedBy || ""}</div></div>
    <p><strong>Approved By</strong><br>Lab Director<br>________</p>
  </div>
</div>

<div class="footer">
  <p>This report shall not be reproduced except in full, without written permission of the laboratory.</p>
  <p>ISO/IEC 17025:2017 Compliant Test Report | SolarLabX PV Testing Laboratory</p>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.reportNumber}_Report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

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
