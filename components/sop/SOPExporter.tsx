// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import type { SampleSOP } from "@/lib/mock-data";
import { generateNextDocumentNumber } from "@/lib/document-numbering";

interface SOPExporterProps {
  sop: SampleSOP;
}

export function SOPExporter({ sop }: SOPExporterProps) {
  // Use existing SOP number or generate a traceable one
  const effectiveSopNumber = sop.sopNumber || generateNextDocumentNumber('sop', { department: 'GEN' });

  const handleExportText = () => {
    const content = [
      `STANDARD OPERATING PROCEDURE`,
      `Document No: ${effectiveSopNumber}`,
      `Version: ${sop.version}`,
      `Title: ${sop.title}`,
      `Standard: ${sop.standard} - ${sop.clause}`,
      `Author: ${sop.author}`,
      `Status: ${sop.status}`,
      ``,
      `1. PURPOSE`,
      sop.sections.purpose,
      ``,
      `2. SCOPE`,
      sop.sections.scope,
      ``,
      `3. REFERENCES`,
      sop.sections.references,
      ``,
      `4. DEFINITIONS`,
      sop.sections.definitions,
      ``,
      `5. RESPONSIBILITIES`,
      sop.sections.responsibilities,
      ``,
      `6. PROCEDURE`,
      sop.sections.procedure,
      ``,
      `7. RECORDS`,
      sop.sections.records,
      ``,
      `8. REVISION HISTORY`,
      sop.sections.revisionHistory,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${effectiveSopNumber}_${sop.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHTML = () => {
    const html = `<!DOCTYPE html>
<html><head><title>${effectiveSopNumber} - ${sop.title}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
  h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
  .meta div { font-size: 14px; }
  .meta strong { display: block; color: #666; font-size: 12px; }
  h2 { color: #1a56db; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
  .procedure { white-space: pre-wrap; }
</style></head><body>
<h1>STANDARD OPERATING PROCEDURE</h1>
<div class="meta">
  <div><strong>Document No.</strong>${effectiveSopNumber}</div>
  <div><strong>Version</strong>${sop.version}</div>
  <div><strong>Standard</strong>${sop.standard} - ${sop.clause}</div>
  <div><strong>Status</strong>${sop.status.replace("_", " ").toUpperCase()}</div>
  <div><strong>Author</strong>${sop.author}</div>
  <div><strong>Approver</strong>${sop.approver}</div>
</div>
<h2>1. Purpose</h2><p>${sop.sections.purpose}</p>
<h2>2. Scope</h2><p>${sop.sections.scope}</p>
<h2>3. References</h2><p>${sop.sections.references}</p>
<h2>4. Definitions</h2><p>${sop.sections.definitions}</p>
<h2>5. Responsibilities</h2><p>${sop.sections.responsibilities}</p>
<h2>6. Procedure</h2><div class="procedure">${sop.sections.procedure}</div>
<h2>7. Records</h2><p>${sop.sections.records}</p>
<h2>8. Revision History</h2><div class="procedure">${sop.sections.revisionHistory}</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${effectiveSopNumber}_${sop.title.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportText}>
        Export TXT
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportHTML}>
        Export HTML
      </Button>
    </div>
  );
}
