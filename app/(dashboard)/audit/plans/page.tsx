"use client";

import Link from "next/link";
import { auditPlans } from "@/lib/data/audit-data";
import AuditCalendar from "@/components/audit/AuditCalendar";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

const statusStyles: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

export default function AuditPlansPage() {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [filterStandard, setFilterStandard] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = auditPlans.filter((a) => {
    if (filterStandard !== "all" && a.standard !== filterStandard) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Plans & Schedule</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={cn("btn-secondary text-sm", view === "list" && "bg-primary-50 border-primary-300")}
          >
            List View
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn("btn-secondary text-sm", view === "calendar" && "bg-primary-50 border-primary-300")}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label className="label">Standard</label>
          <select
            className="input"
            value={filterStandard}
            onChange={(e) => setFilterStandard(e.target.value)}
          >
            <option value="all">All Standards</option>
            <option value="ISO 9001">ISO 9001</option>
            <option value="ISO 17025">ISO 17025</option>
            <option value="IATF 16949">IATF 16949</option>
            <option value="VDA 6.3">VDA 6.3</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {view === "calendar" ? (
        <AuditCalendar audits={filtered} />
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lead Auditor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Findings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono">
                      <Link href={`/audit/plans/${audit.id}`} className="text-primary-600 hover:underline">
                        {audit.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{audit.title}</td>
                    <td className="px-4 py-3"><span className="badge bg-primary-50 text-primary-700">{audit.standard}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{audit.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{audit.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(audit.scheduledDate)} - {formatDate(audit.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("badge", statusStyles[audit.status])}>{audit.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{audit.leadAuditor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{audit.findings.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
