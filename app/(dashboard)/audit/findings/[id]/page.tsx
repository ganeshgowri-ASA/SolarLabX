"use client";

import Link from "next/link";
import { auditFindings, carReports } from "@/lib/data/audit-data";
import { FindingSeverityBadge, FindingStatusBadge } from "@/components/audit/FindingSeverityBadge";
import { formatDate } from "@/lib/utils";
import { use } from "react";

export default function FindingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const finding = auditFindings.find((f) => f.id === id);

  if (!finding) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900">Finding not found</h2>
        <Link href="/audit/findings" className="text-primary-600 hover:underline mt-2 inline-block">Back to Findings</Link>
      </div>
    );
  }

  const linkedCAR = carReports.find((c) => c.findingId === finding.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/audit/findings" className="text-sm text-primary-600 hover:underline">&larr; Back to Findings</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{finding.id}</h1>
          <p className="text-sm text-gray-500">From: {finding.auditTitle}</p>
        </div>
        <div className="flex gap-2">
          <FindingSeverityBadge severity={finding.severity} />
          <FindingStatusBadge status={finding.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Finding Details */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Finding Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Clause Reference</dt>
                <dd className="text-sm font-medium text-gray-900 mt-0.5">{finding.clause}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Description</dt>
                <dd className="text-sm text-gray-700 mt-0.5">{finding.description}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Evidence</dt>
                <dd className="text-sm text-gray-700 mt-0.5 bg-gray-50 p-3 rounded">{finding.evidence}</dd>
              </div>
            </dl>
          </div>

          {/* Root Cause & Corrective Action */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Root Cause Analysis & Corrective Action</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500 uppercase">Root Cause</dt>
                <dd className="text-sm text-gray-700 mt-0.5">
                  {finding.rootCause || <span className="text-gray-400 italic">Not yet identified</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 uppercase">Corrective Action</dt>
                <dd className="text-sm text-gray-700 mt-0.5 whitespace-pre-line">
                  {finding.correctiveAction || <span className="text-gray-400 italic">Not yet defined</span>}
                </dd>
              </div>
              {finding.verificationNotes && (
                <div>
                  <dt className="text-xs text-gray-500 uppercase">Verification Notes</dt>
                  <dd className="text-sm text-gray-700 mt-0.5 bg-green-50 p-3 rounded border border-green-200">
                    {finding.verificationNotes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Details</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Responsible Person</dt>
                <dd className="font-medium mt-0.5">{finding.responsiblePerson}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Target Date</dt>
                <dd className="font-medium mt-0.5">{formatDate(finding.targetDate)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Closure Date</dt>
                <dd className="font-medium mt-0.5">
                  {finding.closureDate ? formatDate(finding.closureDate) : "Pending"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium mt-0.5">{formatDate(finding.createdAt)}</dd>
              </div>
            </dl>
          </div>

          {linkedCAR && (
            <div className="card border-l-4 border-l-primary-500">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Linked CAR/8D Report</h2>
              <Link href={`/audit/car/${linkedCAR.id}`} className="text-sm text-primary-600 hover:underline">
                {linkedCAR.id} - {linkedCAR.title}
              </Link>
              <p className="text-xs text-gray-500 mt-1">Status: {linkedCAR.status}</p>
            </div>
          )}

          <div className="card">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Related Audit</h2>
            <Link href={`/audit/plans/${finding.auditId}`} className="text-sm text-primary-600 hover:underline">
              {finding.auditId}
            </Link>
            <p className="text-xs text-gray-500 mt-1">{finding.auditTitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
