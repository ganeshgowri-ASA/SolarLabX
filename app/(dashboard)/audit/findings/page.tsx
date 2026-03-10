// @ts-nocheck
"use client";

import Link from "next/link";
import { auditFindings } from "@/lib/data/audit-data";
import { FindingSeverityBadge, FindingStatusBadge } from "@/components/audit/FindingSeverityBadge";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { FindingSeverity, FindingStatus } from "@/lib/types/audit";

export default function FindingsPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = auditFindings.filter((f) => {
    if (filterSeverity !== "all" && f.severity !== filterSeverity) return false;
    if (filterStatus !== "all" && f.status !== filterStatus) return false;
    return true;
  });

  const severityCounts = {
    "Major NC": auditFindings.filter((f) => f.severity === "Major NC").length,
    "Minor NC": auditFindings.filter((f) => f.severity === "Minor NC").length,
    OFI: auditFindings.filter((f) => f.severity === "OFI").length,
    Observation: auditFindings.filter((f) => f.severity === "Observation").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Findings</h1>
        <Link href="/audit" className="btn-secondary text-sm">&larr; Back to Audit Dashboard</Link>
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Major NC</p>
          <p className="text-2xl font-bold text-red-600">{severityCounts["Major NC"]}</p>
        </div>
        <div className="card border-l-4 border-l-orange-500">
          <p className="text-xs text-gray-500">Minor NC</p>
          <p className="text-2xl font-bold text-orange-600">{severityCounts["Minor NC"]}</p>
        </div>
        <div className="card border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">OFI</p>
          <p className="text-2xl font-bold text-blue-600">{severityCounts.OFI}</p>
        </div>
        <div className="card border-l-4 border-l-gray-400">
          <p className="text-xs text-gray-500">Observation</p>
          <p className="text-2xl font-bold text-gray-600">{severityCounts.Observation}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="label">Severity</label>
          <select className="input" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="Major NC">Major NC</option>
            <option value="Minor NC">Minor NC</option>
            <option value="OFI">OFI</option>
            <option value="Observation">Observation</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Verification">Verification</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Audit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clause</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link href={`/audit/findings/${f.id}`} className="text-primary-600 hover:underline">{f.id}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">{f.auditTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{f.clause}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{f.description}</td>
                  <td className="px-4 py-3"><FindingSeverityBadge severity={f.severity} /></td>
                  <td className="px-4 py-3"><FindingStatusBadge status={f.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(f.targetDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.responsiblePerson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
