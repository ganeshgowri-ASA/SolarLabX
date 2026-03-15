// @ts-nocheck
"use client";

import { useTemplateExport, type TemplateExportConfig, type ExportTableData } from "@/lib/useTemplateExport";

export type { TemplateExportConfig, ExportTableData };

/* ── Toolbar Component ───────────────────────────────────────────────────────── */

interface TemplateExportToolbarProps {
  config: TemplateExportConfig;
  title?: string;
  subtitle?: string;
}

export function TemplateExportToolbar({ config, title, subtitle }: TemplateExportToolbarProps) {
  const { handleExportWord, handleExportExcel, exportingWord, exportingExcel } = useTemplateExport();

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
          onClick={() => handleExportWord(config)}
          disabled={exportingWord}
          className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exportingWord ? "Exporting..." : "Word"}
        </button>
        <button
          onClick={() => handleExportExcel(config)}
          disabled={exportingExcel}
          className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {exportingExcel ? "Exporting..." : "Excel"}
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
