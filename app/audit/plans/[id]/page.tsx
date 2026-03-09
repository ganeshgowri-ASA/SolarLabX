"use client";

import Link from "next/link";
import { auditPlans, auditFindings } from "@/lib/data/audit-data";
import AuditChecklist from "@/components/audit/AuditChecklist";
import { FindingSeverityBadge, FindingStatusBadge } from "@/components/audit/FindingSeverityBadge";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";


const statusStyles: Record<string, string> = {
  Planned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
};

export default function AuditPlanDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const audit = auditPlans.find((a) => a.id === id);

  if (!audit) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900">Audit plan not found</h2>
        <Link href="/audit/plans" className="text-primary-600 hover:underline mt-2 inline-block">Back to Audit Plans</Link>
      </div>
    );
  }

  const relatedFindings = auditFindings.filter((f) => f.auditId === audit.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/audit/plans" className="text-sm text-primary-600 hover:underline">&larr; Back to Audit Plans</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{audit.title}</h1>
          <p className="text-sm text-gray-500">{audit.id}</p>
        </div>
        <span className={cn("badge text-sm px-3 py-1", statusStyles[audit.status])}>{audit.status}</span>
      </div>

      {/* Audit Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Audit Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Standard</dt>
              <dd className="font-medium mt-0.5"><span className="badge bg-primary-50 text-primary-700">{audit.standard}</span></dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium mt-0.5">{audit.type}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Department</dt>
              <dd className="font-medium mt-0.5">{audit.department}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Scheduled Period</dt>
              <dd className="font-medium mt-0.5">{formatDate(audit.scheduledDate)} - {formatDate(audit.endDate)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">Scope</dt>
              <dd className="font-medium mt-0.5">{audit.scope}</dd>
            </div>
          </dl>

          <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">Objectives</h3>
          <ul className="space-y-1">
            {audit.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Audit Team</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Lead Auditor</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {audit.leadAuditor.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{audit.leadAuditor}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Team Members</p>
              <div className="space-y-2 mt-1">
                {audit.auditTeam.filter((m) => m !== audit.leadAuditor).map((member) => (
                  <div key={member} className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-700">
                        {member.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">{member}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Audit Checklist</h2>
        <AuditChecklist items={audit.checklistItems} />
      </div>

      {/* Related Findings */}
      {relatedFindings.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Findings from This Audit</h2>
          <div className="space-y-3">
            {relatedFindings.map((f) => (
              <Link key={f.id} href={`/audit/findings/${f.id}`} className="block border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono text-primary-600">{f.id}</span>
                  <div className="flex gap-2">
                    <FindingSeverityBadge severity={f.severity} />
                    <FindingStatusBadge status={f.status} />
                  </div>
                </div>
                <p className="text-sm text-gray-700">{f.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
