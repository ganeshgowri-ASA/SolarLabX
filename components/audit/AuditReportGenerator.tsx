// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import { AuditPlan, AuditFinding } from "@/lib/types/audit";
import { formatDate } from "@/lib/utils";

interface AuditReportGeneratorProps {
  plans: AuditPlan[];
  findings: AuditFinding[];
  correctiveActions: {
    id: string;
    findingId: string;
    description: string;
    responsiblePerson: string;
    department: string;
    targetDate: string;
    completedDate: string | null;
    status: string;
  }[];
}

export default function AuditReportGenerator({
  plans,
  findings,
  correctiveActions,
}: AuditReportGeneratorProps) {
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const selectedAudit = plans.find((p) => p.id === selectedAuditId);
  const auditFindings = findings.filter((f) => f.auditId === selectedAuditId);
  const auditCAs = correctiveActions.filter((ca) =>
    auditFindings.some((f) => f.id === ca.findingId)
  );

  const severityCounts = {
    "Major NC": auditFindings.filter((f) => f.severity === "Major NC").length,
    "Minor NC": auditFindings.filter((f) => f.severity === "Minor NC").length,
    OFI: auditFindings.filter((f) => f.severity === "OFI").length,
    Observation: auditFindings.filter((f) => f.severity === "Observation").length,
  };
  const totalFindings = auditFindings.length;

  const handleGenerateReport = () => {
    if (!selectedAuditId) return;
    setShowReport(true);
  };

  const handleExportPDF = () => {
    const printContents = reportRef.current;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Audit Report - ${selectedAudit?.id || ""}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; padding: 40px; font-size: 11px; line-height: 1.5; }
          .report-header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px; }
          .report-header h1 { font-size: 20px; color: #1e40af; margin-bottom: 4px; }
          .report-header p { font-size: 12px; color: #6b7280; }
          .section { margin-bottom: 20px; page-break-inside: avoid; }
          .section-title { font-size: 13px; font-weight: 700; color: #1e40af; border-bottom: 1px solid #dbeafe; padding-bottom: 4px; margin-bottom: 8px; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .field { margin-bottom: 6px; }
          .field-label { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
          .field-value { font-size: 11px; color: #1a1a1a; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th { background: #f1f5f9; text-align: left; padding: 6px 8px; font-size: 10px; font-weight: 600; color: #475569; text-transform: uppercase; border: 1px solid #e2e8f0; }
          td { padding: 6px 8px; font-size: 11px; border: 1px solid #e2e8f0; }
          .severity-major { background: #fef2f2; color: #b91c1c; font-weight: 600; }
          .severity-minor { background: #fff7ed; color: #c2410c; font-weight: 600; }
          .severity-ofi { background: #eff6ff; color: #1d4ed8; font-weight: 600; }
          .severity-obs { background: #f9fafb; color: #4b5563; font-weight: 600; }
          .summary-box { display: inline-block; padding: 8px 16px; margin-right: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0; border-radius: 4px; text-align: center; }
          .summary-box .count { font-size: 18px; font-weight: 700; }
          .summary-box .label { font-size: 9px; text-transform: uppercase; color: #6b7280; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #9ca3af; }
          .checklist-conform { color: #15803d; }
          .checklist-nonconform { color: #b91c1c; font-weight: 600; }
          .checklist-pending { color: #d97706; }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${printContents.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Report Generation Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedAuditId}
          onChange={(e) => {
            setSelectedAuditId(e.target.value);
            setShowReport(false);
          }}
          className="border rounded-md px-3 py-2 text-sm bg-white text-gray-900 min-w-[300px]"
        >
          <option value="">Select an audit to generate report...</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.id} - {plan.title}
            </option>
          ))}
        </select>
        <button
          onClick={handleGenerateReport}
          disabled={!selectedAuditId}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Report
        </button>
        {showReport && (
          <button
            onClick={handleExportPDF}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to PDF
          </button>
        )}
      </div>

      {/* Report Preview */}
      {showReport && selectedAudit && (
        <div className="card border-2 border-primary-200">
          <div ref={reportRef}>
            {/* Report Header */}
            <div className="report-header" style={{ textAlign: "center", borderBottom: "3px solid #1e40af", paddingBottom: "16px", marginBottom: "24px" }}>
              <h1 style={{ fontSize: "20px", color: "#1e40af", marginBottom: "4px" }}>
                AUDIT REPORT
              </h1>
              <p style={{ fontSize: "14px", color: "#374151" }}>{selectedAudit.title}</p>
              <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                Report ID: {selectedAudit.id} | Generated: {formatDate(new Date())}
              </p>
            </div>

            {/* Audit Details */}
            <div className="section" style={{ marginBottom: "20px" }}>
              <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                1. Audit Details
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Standard</p>
                  <p className="text-sm text-gray-900">{selectedAudit.standard}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Audit Type</p>
                  <p className="text-sm text-gray-900">{selectedAudit.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Department</p>
                  <p className="text-sm text-gray-900">{selectedAudit.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Status</p>
                  <p className="text-sm text-gray-900">{selectedAudit.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Audit Period</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedAudit.scheduledDate)} - {formatDate(selectedAudit.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Lead Auditor</p>
                  <p className="text-sm text-gray-900">{selectedAudit.leadAuditor}</p>
                </div>
              </div>
            </div>

            {/* Audit Team */}
            <div className="section" style={{ marginBottom: "20px" }}>
              <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                2. Audit Team
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                {selectedAudit.auditTeam.map((member, i) => (
                  <li key={i}>
                    {member}
                    {member === selectedAudit.leadAuditor && (
                      <span className="text-xs text-primary-600 ml-1">(Lead Auditor)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Scope & Objectives */}
            <div className="section" style={{ marginBottom: "20px" }}>
              <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                3. Audit Scope & Objectives
              </h2>
              <div className="mb-3">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Scope</p>
                <p className="text-sm text-gray-800">{selectedAudit.scope}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Objectives</p>
                <ul className="list-decimal list-inside text-sm text-gray-800 space-y-1">
                  {selectedAudit.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Findings Summary */}
            <div className="section" style={{ marginBottom: "20px" }}>
              <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                4. Findings Summary
              </h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="border rounded-md px-4 py-2 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-gray-900">{totalFindings}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Total</p>
                </div>
                <div className="border border-red-200 bg-red-50 rounded-md px-4 py-2 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-red-700">{severityCounts["Major NC"]}</p>
                  <p className="text-[10px] text-red-600 uppercase">Major NC</p>
                </div>
                <div className="border border-orange-200 bg-orange-50 rounded-md px-4 py-2 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-orange-700">{severityCounts["Minor NC"]}</p>
                  <p className="text-[10px] text-orange-600 uppercase">Minor NC</p>
                </div>
                <div className="border border-blue-200 bg-blue-50 rounded-md px-4 py-2 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-blue-700">{severityCounts.OFI}</p>
                  <p className="text-[10px] text-blue-600 uppercase">OFI</p>
                </div>
                <div className="border border-gray-200 bg-gray-50 rounded-md px-4 py-2 text-center min-w-[80px]">
                  <p className="text-xl font-bold text-gray-700">{severityCounts.Observation}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Observation</p>
                </div>
              </div>

              {totalFindings === 0 ? (
                <p className="text-sm text-gray-500 italic">No findings recorded for this audit.</p>
              ) : (
                <table className="min-w-full border-collapse text-sm" style={{ marginTop: "6px" }}>
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Clause</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Responsible</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Target Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditFindings.map((f) => (
                      <tr key={f.id}>
                        <td className="border px-3 py-2 font-mono text-xs">{f.id}</td>
                        <td className="border px-3 py-2 font-mono text-xs">{f.clause}</td>
                        <td className={`border px-3 py-2 text-xs font-semibold ${
                          f.severity === "Major NC" ? "bg-red-50 text-red-700" :
                          f.severity === "Minor NC" ? "bg-orange-50 text-orange-700" :
                          f.severity === "OFI" ? "bg-blue-50 text-blue-700" :
                          "bg-gray-50 text-gray-700"
                        }`}>
                          {f.severity}
                        </td>
                        <td className="border px-3 py-2 text-xs">{f.description}</td>
                        <td className="border px-3 py-2 text-xs">{f.status}</td>
                        <td className="border px-3 py-2 text-xs">{f.responsiblePerson}</td>
                        <td className="border px-3 py-2 text-xs">{formatDate(f.targetDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Finding Details */}
            {auditFindings.length > 0 && (
              <div className="section" style={{ marginBottom: "20px" }}>
                <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                  5. Finding Details
                </h2>
                {auditFindings.map((f, idx) => (
                  <div key={f.id} className="mb-4 p-3 border rounded-md" style={{ pageBreakInside: "avoid" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold font-mono">{f.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        f.severity === "Major NC" ? "bg-red-100 text-red-700" :
                        f.severity === "Minor NC" ? "bg-orange-100 text-orange-700" :
                        f.severity === "OFI" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {f.severity}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-semibold text-gray-600">Clause:</p>
                        <p className="text-gray-800">{f.clause}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-600">Status:</p>
                        <p className="text-gray-800">{f.status}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-semibold text-gray-600">Description:</p>
                        <p className="text-gray-800">{f.description}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-semibold text-gray-600">Evidence:</p>
                        <p className="text-gray-800">{f.evidence || "Pending collection"}</p>
                      </div>
                      {f.rootCause && (
                        <div className="md:col-span-2">
                          <p className="font-semibold text-gray-600">Root Cause:</p>
                          <p className="text-gray-800">{f.rootCause}</p>
                        </div>
                      )}
                      {f.correctiveAction && (
                        <div className="md:col-span-2">
                          <p className="font-semibold text-gray-600">Corrective Action Plan:</p>
                          <p className="text-gray-800 whitespace-pre-line">{f.correctiveAction}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Corrective Actions */}
            {auditCAs.length > 0 && (
              <div className="section" style={{ marginBottom: "20px" }}>
                <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                  6. Corrective Action Tracker
                </h2>
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">CA ID</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Responsible</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Target</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Completed</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditCAs.map((ca) => (
                      <tr key={ca.id}>
                        <td className="border px-3 py-2 font-mono text-xs">{ca.id}</td>
                        <td className="border px-3 py-2 text-xs">{ca.description}</td>
                        <td className="border px-3 py-2 text-xs">{ca.responsiblePerson}</td>
                        <td className="border px-3 py-2 text-xs">{formatDate(ca.targetDate)}</td>
                        <td className="border px-3 py-2 text-xs">{ca.completedDate ? formatDate(ca.completedDate) : "-"}</td>
                        <td className={`border px-3 py-2 text-xs font-semibold ${
                          ca.status === "Completed" || ca.status === "Verified" ? "text-green-700" :
                          ca.status === "Overdue" ? "text-red-700" :
                          ca.status === "In Progress" ? "text-yellow-700" :
                          "text-blue-700"
                        }`}>
                          {ca.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Checklist Results */}
            {selectedAudit.checklistItems.length > 0 && (
              <div className="section" style={{ marginBottom: "20px" }}>
                <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                  {auditCAs.length > 0 ? "7" : "6"}. Checklist Assessment Results
                </h2>
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Clause</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Requirement</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAudit.checklistItems.map((item) => (
                      <tr key={item.id}>
                        <td className="border px-3 py-2 font-mono text-xs">{item.clause}</td>
                        <td className="border px-3 py-2 text-xs">{item.requirement}</td>
                        <td className={`border px-3 py-2 text-xs font-semibold ${
                          item.status === "Conforming" ? "text-green-700" :
                          item.status === "Non-Conforming" ? "text-red-700" :
                          "text-yellow-700"
                        }`}>
                          {item.status}
                        </td>
                        <td className="border px-3 py-2 text-xs">{item.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span>Conforming: {selectedAudit.checklistItems.filter((i) => i.status === "Conforming").length}</span>
                  <span>Non-Conforming: {selectedAudit.checklistItems.filter((i) => i.status === "Non-Conforming").length}</span>
                  <span>Pending: {selectedAudit.checklistItems.filter((i) => i.status === "Pending").length}</span>
                </div>
              </div>
            )}

            {/* Conclusion / Timeline */}
            <div className="section" style={{ marginBottom: "20px" }}>
              <h2 className="section-title" style={{ fontSize: "14px", fontWeight: 700, color: "#1e40af", borderBottom: "1px solid #dbeafe", paddingBottom: "4px", marginBottom: "12px" }}>
                Conclusion & Timeline
              </h2>
              <div className="text-sm text-gray-800 space-y-2">
                <p>
                  This audit was conducted in accordance with <strong>{selectedAudit.standard}</strong> requirements.
                  A total of <strong>{totalFindings} finding(s)</strong> were identified
                  {severityCounts["Major NC"] > 0 && (
                    <>, including <strong className="text-red-700">{severityCounts["Major NC"]} Major Non-Conformit{severityCounts["Major NC"] > 1 ? "ies" : "y"}</strong></>
                  )}
                  {severityCounts["Minor NC"] > 0 && (
                    <>, <strong className="text-orange-700">{severityCounts["Minor NC"]} Minor NC{severityCounts["Minor NC"] > 1 ? "s" : ""}</strong></>
                  )}
                  .
                </p>
                {severityCounts["Major NC"] > 0 && (
                  <p className="text-red-800 font-medium">
                    Major non-conformities require immediate corrective action. All corrective actions must be completed and verified before the next scheduled audit.
                  </p>
                )}
                <p>
                  Corrective actions are tracked and must be closed by their respective target dates.
                  Verification of effectiveness will be conducted during follow-up audits.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: "32px", paddingTop: "12px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
              <p className="text-xs text-gray-400">
                SolarLabX Audit Management System | Report generated on {formatDate(new Date())} | Confidential
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
