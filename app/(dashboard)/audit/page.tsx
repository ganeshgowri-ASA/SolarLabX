// @ts-nocheck
"use client";

import Link from "next/link";
import { auditPlans, auditFindings, auditMetrics } from "@/lib/data/audit-data";
import { FindingSeverityBadge, FindingStatusBadge } from "@/components/audit/FindingSeverityBadge";
import { FindingsTrendChart, ClosureRateChart } from "@/components/audit/TrendChart";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

export default function AuditDashboard() {
  const upcomingAudits = auditPlans.filter((a) => a.status === "Planned" || a.status === "In Progress");
  const openFindings = auditFindings.filter((f) => f.status !== "Closed");
  const totalFindings = auditFindings.length;
  const closedFindings = auditFindings.filter((f) => f.status === "Closed").length;
  const closureRate = totalFindings > 0 ? Math.round((closedFindings / totalFindings) * 100) : 0;
  const majorNCs = auditFindings.filter((f) => f.severity === "Major NC" && f.status !== "Closed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Management</h1>
        <div className="flex gap-2">
          <Link href="/audit/plans" className="btn-secondary text-sm">View All Plans</Link>
          <Link href="/audit/findings" className="btn-secondary text-sm">View Findings</Link>
          <Link href="/audit/car" className="btn-primary text-sm">CAR/8D Reports</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Upcoming Audits</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{upcomingAudits.length}</p>
          <p className="text-xs text-gray-400 mt-1">Planned & In Progress</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Open Findings</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{openFindings.length}</p>
          <p className="text-xs text-gray-400 mt-1">Requiring attention</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Closure Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{closureRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{closedFindings}/{totalFindings} findings closed</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Open Major NCs</p>
          <p className={cn("text-3xl font-bold mt-1", majorNCs > 0 ? "text-red-600" : "text-green-600")}>{majorNCs}</p>
          <p className="text-xs text-gray-400 mt-1">Critical findings</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FindingsTrendChart data={auditMetrics.findingsByMonth} />
        <ClosureRateChart data={auditMetrics.closureRate} />
      </div>

      {/* Upcoming Audits Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming Audits</h2>
          <Link href="/audit/plans" className="text-xs text-primary-600 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">
                    <Link href={`/audit/plans/${audit.id}`} className="text-primary-600 hover:underline">
                      {audit.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{audit.title}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-primary-50 text-primary-700">{audit.standard}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{audit.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(audit.scheduledDate)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("badge", statusStyles[audit.status])}>{audit.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{audit.leadAuditor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Open Findings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Open Findings</h2>
          <Link href="/audit/findings" className="text-xs text-primary-600 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {openFindings.map((finding) => (
                <tr key={finding.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">
                    <Link href={`/audit/findings/${finding.id}`} className="text-primary-600 hover:underline">
                      {finding.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-sm truncate">{finding.description}</td>
                  <td className="px-4 py-3"><FindingSeverityBadge severity={finding.severity} /></td>
                  <td className="px-4 py-3"><FindingStatusBadge status={finding.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(finding.targetDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{finding.responsiblePerson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
