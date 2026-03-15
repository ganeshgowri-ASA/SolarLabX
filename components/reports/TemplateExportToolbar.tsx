// @ts-nocheck
"use client";

import { toast } from "sonner";

/* ── Types ───────────────────────────────────────────────────────────────────── */

export interface ExportTableData {
  title: string;
  headers: string[];
  rows: (string | number | boolean)[][];
}

export interface TemplateExportConfig {
  reportNo: string;
  title: string;
  subtitle: string;
  standard?: string;
  date?: string;
  moduleSpecs?: [string, string][];
  testConditions?: [string, string][];
  equipment?: string[];
  criterion?: string;
  purpose?: string;
  overallResult?: string;
  tables: ExportTableData[];
}

/* ── Word Export ──────────────────────────────────────────────────────────────── */

export async function exportToWord(config: TemplateExportConfig) {
  window.alert('exportToWord called');
  console.error('[DEBUG exportToWord] Function called with config:', config?.reportNo);
  try {
   try {
    console.error('[DEBUG exportToWord] About to dynamically import docx...');
    const {
      Document, Packer, Paragraph, Table, TableRow, TableCell,
      TextRun, HeadingLevel, AlignmentType, WidthType,
      BorderStyle, ShadingType, Header, Footer, PageNumber,
    } = await import("docx");
    console.error('[DEBUG exportToWord] docx imported successfully. ShadingType:', typeof ShadingType, ShadingType);

    const accent = "#0f4c81";
    const date = config.date || new Date().toISOString().slice(0, 10);

    // Helper to create a bordered table cell
    const cell = (text: string, opts?: { bold?: boolean; shading?: string; width?: number; alignment?: typeof AlignmentType[keyof typeof AlignmentType] }) =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text, bold: opts?.bold, size: 18, font: "Calibri" })],
          alignment: opts?.alignment || AlignmentType.LEFT,
          spacing: { before: 40, after: 40 },
        })],
        shading: opts?.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
        width: opts?.width ? { size: opts.width, type: WidthType.DXA } : undefined,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
        },
      });

    // Key-value pair table (for specs, conditions)
    const kvTable = (pairs: [string, string][]) =>
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: pairs.map(([k, v]) =>
          new TableRow({
            children: [
              cell(k, { bold: true, shading: "f3f4f6", width: 3200 }),
              cell(v),
            ],
          })
        ),
      });

    // Data table
    const dataTable = (tbl: ExportTableData) =>
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Header row with white text on dark blue background
          new TableRow({
            children: tbl.headers.map(h =>
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: h, bold: true, size: 18, font: "Calibri", color: "ffffff" })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 40 },
                })],
                shading: { type: ShadingType.SOLID, color: "1e3a5f" },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
                  right: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
                },
              })
            ),
            tableHeader: true,
          }),
          ...tbl.rows.map((row, ri) =>
            new TableRow({
              children: row.map(val =>
                cell(String(val), { shading: ri % 2 === 0 ? "fafafa" : undefined })
              ),
            })
          ),
        ],
      });

    // Build sections
    const children: any[] = [];

    // Cover / Title
    children.push(
      new Paragraph({ spacing: { after: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "SolarLabX", size: 48, bold: true, font: "Calibri", color: "0f4c81" })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: "Solar PV Testing & Certification Laboratory", size: 22, font: "Calibri", color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "NABL TC-8192 · ISO/IEC 17025:2017 · Pune, India", size: 18, font: "Calibri", color: "999999" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "TEST REPORT", size: 28, bold: true, font: "Calibri", color: "0f4c81" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: config.title, size: 36, bold: true, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: config.subtitle, size: 22, font: "Calibri", color: "555555" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Report No: ${config.reportNo}`, size: 20, font: "Calibri" }),
          new TextRun({ text: `    |    Date: ${date}`, size: 20, font: "Calibri" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );

    // Module Specifications
    if (config.moduleSpecs && config.moduleSpecs.length > 0) {
      children.push(
        new Paragraph({
          text: "MODULE UNDER TEST",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        }),
        kvTable(config.moduleSpecs),
        new Paragraph({ spacing: { after: 200 } }),
      );
    }

    // Test Conditions
    if (config.testConditions && config.testConditions.length > 0) {
      children.push(
        new Paragraph({
          text: "TEST CONDITIONS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        }),
        kvTable(config.testConditions),
        new Paragraph({ spacing: { after: 200 } }),
      );
    }

    // Purpose
    if (config.purpose) {
      children.push(
        new Paragraph({
          text: "TEST PURPOSE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: config.purpose, size: 20, font: "Calibri" })],
          spacing: { after: 200 },
        }),
      );
    }

    // Criterion
    if (config.criterion) {
      children.push(
        new Paragraph({
          text: "PASS/FAIL CRITERION",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: config.criterion, size: 20, font: "Calibri", bold: true })],
          spacing: { after: 200 },
        }),
      );
    }

    // Data Tables
    for (const tbl of config.tables) {
      children.push(
        new Paragraph({
          text: tbl.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        }),
        dataTable(tbl),
        new Paragraph({ spacing: { after: 200 } }),
      );
    }

    // Equipment
    if (config.equipment && config.equipment.length > 0) {
      children.push(
        new Paragraph({
          text: "EQUIPMENT USED",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        }),
        ...config.equipment.map(eq =>
          new Paragraph({
            children: [new TextRun({ text: `• ${eq}`, size: 20, font: "Calibri" })],
            spacing: { after: 60 },
          })
        ),
        new Paragraph({ spacing: { after: 200 } }),
      );
    }

    // Overall Result
    children.push(
      new Paragraph({
        text: "CONCLUSION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({
          text: config.overallResult || `All samples passed the ${config.title} as per ${config.standard || "applicable standard"}.`,
          size: 22, font: "Calibri", bold: true, color: "15803d",
        })],
        spacing: { after: 200 },
      }),
    );

    // Signatories
    children.push(
      new Paragraph({
        text: "SIGNATORIES",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: ["Prepared By", "Checked By", "Authorized By", "Issued By"].map(role =>
              cell(role, { bold: true, shading: "f3f4f6" })
            ),
          }),
          new TableRow({
            children: ["Dr. A. Sharma", "Mr. R. Verma", "Prof. G. Krishnan", "Ms. P. Nair"].map(name =>
              cell(name)
            ),
          }),
          new TableRow({
            children: ["Lab Technician", "Sr. Engineer", "Tech. Manager", "Quality Manager"].map(t =>
              cell(t)
            ),
          }),
          new TableRow({
            children: Array(4).fill(null).map(() => cell(`Date: ${date}`)),
          }),
        ],
      }),
    );

    // Footer
    children.push(
      new Paragraph({ spacing: { after: 200 } }),
      new Paragraph({
        children: [new TextRun({
          text: `${config.reportNo} · SolarLabX, Pune · NABL TC-8192 · ISO/IEC 17025:2017`,
          size: 16, font: "Calibri", color: "999999",
        })],
        alignment: AlignmentType.CENTER,
      }),
    );

    const doc = new Document({
      styles: {
        paragraphStyles: [{
          id: "Heading2",
          name: "Heading 2",
          run: { size: 24, bold: true, font: "Calibri", color: "0f4c81" },
          paragraph: { spacing: { before: 240, after: 80 } },
        }],
      },
      sections: [{
        properties: {},
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [
                new TextRun({ text: `SolarLabX · ${config.reportNo}`, size: 16, font: "Calibri", color: "999999" }),
              ],
              alignment: AlignmentType.RIGHT,
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [
                new TextRun({ text: "Page ", size: 16, font: "Calibri", color: "999999" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Calibri", color: "999999" }),
                new TextRun({ text: " of ", size: 16, font: "Calibri", color: "999999" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: "Calibri", color: "999999" }),
              ],
              alignment: AlignmentType.CENTER,
            })],
          }),
        },
        children,
      }],
    });

    console.error('[DEBUG exportToWord] About to call Packer.toBlob...');
    const blob = await Packer.toBlob(doc);
    console.error('[DEBUG exportToWord] Blob created, size:', blob.size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.reportNo}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.error('[DEBUG exportToWord] Download triggered successfully');
    toast.success("Word document exported successfully");
   } catch (err: any) {
    console.error("[DEBUG exportToWord] INNER error:", err);
    toast.error(`Word export failed: ${err?.message || "Unknown error"}`);
   }
  } catch (e: any) {
    window.alert('ERROR: ' + e.message);
    console.error("[DEBUG exportToWord] OUTER error:", e);
  }
}

/* ── Excel Export ─────────────────────────────────────────────────────────────── */

export async function exportToExcel(config: TemplateExportConfig) {
  window.alert('exportToExcel called');
  console.error('[DEBUG exportToExcel] Function called with config:', config?.reportNo);
  try {
   try {
    console.error('[DEBUG exportToExcel] About to dynamically import xlsx...');
    const XLSX = await import("xlsx");
    console.error('[DEBUG exportToExcel] xlsx imported successfully. utils:', typeof XLSX.utils);

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData: (string | undefined)[][] = [
      ["SolarLabX - Test Report"],
      [],
      ["Report No", config.reportNo],
      ["Title", config.title],
      ["Subtitle", config.subtitle],
      ["Standard", config.standard || ""],
      ["Date", config.date || new Date().toISOString().slice(0, 10)],
      [],
    ];

    if (config.moduleSpecs && config.moduleSpecs.length > 0) {
      summaryData.push(["MODULE UNDER TEST"]);
      for (const [k, v] of config.moduleSpecs) {
        summaryData.push([k, v]);
      }
      summaryData.push([]);
    }

    if (config.testConditions && config.testConditions.length > 0) {
      summaryData.push(["TEST CONDITIONS"]);
      for (const [k, v] of config.testConditions) {
        summaryData.push([k, v]);
      }
      summaryData.push([]);
    }

    if (config.purpose) {
      summaryData.push(["PURPOSE", config.purpose]);
    }
    if (config.criterion) {
      summaryData.push(["CRITERION", config.criterion]);
    }
    if (config.equipment && config.equipment.length > 0) {
      summaryData.push([], ["EQUIPMENT"]);
      for (const eq of config.equipment) {
        summaryData.push([eq]);
      }
    }

    summaryData.push([], ["OVERALL RESULT", config.overallResult || "PASS"]);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Data sheets
    for (const tbl of config.tables) {
      const sheetData: (string | number | boolean)[][] = [tbl.headers, ...tbl.rows];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws["!cols"] = tbl.headers.map(() => ({ wch: 18 }));
      // Sanitize sheet name: remove invalid chars and truncate to 31 chars (Excel limit)
      const sheetName = tbl.title.replace(/[[\]:*?/\\]/g, "").slice(0, 31) || "Sheet";
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    console.error('[DEBUG exportToExcel] About to write workbook...');
    const wbOut = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    console.error('[DEBUG exportToExcel] Workbook written, creating blob...');
    const blob = new Blob([wbOut], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    console.error('[DEBUG exportToExcel] Blob created, size:', blob.size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.reportNo}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.error('[DEBUG exportToExcel] Download triggered successfully');
    toast.success("Excel file exported successfully");
   } catch (err: any) {
    console.error("[DEBUG exportToExcel] INNER error:", err);
    toast.error(`Excel export failed: ${err?.message || "Unknown error"}`);
   }
  } catch (e: any) {
    window.alert('ERROR: ' + e.message);
    console.error("[DEBUG exportToExcel] OUTER error:", e);
  }
}

/* ── Toolbar Component ───────────────────────────────────────────────────────── */

interface TemplateExportToolbarProps {
  config: TemplateExportConfig;
  title?: string;
  subtitle?: string;
}

export function TemplateExportToolbar({ config, title, subtitle }: TemplateExportToolbarProps) {
  return (
    <div className="no-print sticky top-0 z-50 flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border shadow-sm">
      <div>
        <h1 className="text-xl font-bold">{title || config.title}</h1>
        <p className="text-sm text-gray-500">{subtitle || config.subtitle}</p>
      </div>
      <div className="flex gap-2">
        <a href="/reports/templates" className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100">
          ← Back
        </a>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </button>
        <button
          onClick={() => exportToWord(config)}
          className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Word
        </button>
        <button
          onClick={() => exportToExcel(config)}
          className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Excel
        </button>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>
    </div>
  );
}
