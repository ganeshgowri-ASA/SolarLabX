// @ts-nocheck
"use client";

import Link from "next/link";
import { carReports } from "@/lib/data/audit-data";
import CARWorkflow, { IshikawaDiagram, FiveWhyAnalysis } from "@/components/audit/CARWorkflow";
import { cn, formatDate } from "@/lib/utils";
import { use } from "react";

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-gray-100 text-gray-800",
};

const actionStatusStyles: Record<string, string> = {
  Planned: "bg-gray-100 text-gray-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Verified: "bg-blue-100 text-blue-700",
};

export default function CARDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const car = carReports.find((c) => c.id === id);

  if (!car) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900">CAR report not found</h2>
        <Link href="/audit/car" className="text-primary-600 hover:underline mt-2 inline-block">Back to CAR Reports</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/audit/car" className="text-sm text-primary-600 hover:underline">&larr; Back to CAR Reports</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{car.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-gray-500">{car.id}</span>
            <span className={cn("badge", priorityStyles[car.priority])}>{car.priority} Priority</span>
          </div>
        </div>
      </div>

      {/* 8D Workflow Progress */}
      <CARWorkflow car={car} />

      {/* D1: Team Formation */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">D1: Team Formation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Team Leader</p>
            <p className="font-medium">{car.d1Team.leader}</p>
          </div>
          <div>
            <p className="text-gray-500">Team Members</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {car.d1Team.members.map((m) => (
                <span key={m} className="badge bg-gray-100 text-gray-700">{m}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-500">Sponsor</p>
            <p className="font-medium">{car.d1Team.sponsor}</p>
          </div>
        </div>
      </div>

      {/* D2: Problem Definition */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">D2: Problem Description</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Problem Statement</dt>
            <dd className="mt-0.5 text-gray-900 font-medium">{car.d2Problem.statement}</dd>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <dt className="text-green-700 font-medium">IS (Problem exists where)</dt>
              <dd className="mt-0.5 text-gray-700">{car.d2Problem.isIs}</dd>
            </div>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <dt className="text-red-700 font-medium">IS NOT (Problem does not exist where)</dt>
              <dd className="mt-0.5 text-gray-700">{car.d2Problem.isNot}</dd>
            </div>
          </div>
          <div>
            <dt className="text-gray-500">Impact</dt>
            <dd className="mt-0.5 text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">{car.d2Problem.impact}</dd>
          </div>
        </dl>
      </div>

      {/* D3: Containment */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">D3: Interim Containment Actions</h2>
        <ul className="space-y-2">
          {car.d3Containment.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <svg className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {action}
            </li>
          ))}
        </ul>
        {car.d3Containment.implementedDate && (
          <p className="text-xs text-gray-500 mt-3">Implemented: {formatDate(car.d3Containment.implementedDate)}</p>
        )}
        {car.d3Containment.verification && (
          <p className="text-xs text-green-600 mt-1">Verification: {car.d3Containment.verification}</p>
        )}
      </div>

      {/* D4: Root Cause Analysis */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">D4: Root Cause Analysis</h2>
        <IshikawaDiagram data={car.d4RootCause.ishikawa} />
        <FiveWhyAnalysis data={car.d4RootCause.fiveWhy} />

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Identified Root Causes</h3>
          <ul className="space-y-2">
            {car.d4RootCause.rootCauses.map((rc, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="bg-red-100 text-red-700 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {rc}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* D5: Corrective Actions */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">D5: Permanent Corrective Actions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsible</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {car.d5Corrective.actions.map((action) => (
                <tr key={action.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm font-mono text-gray-600">{action.id}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{action.description}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{action.responsible}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{formatDate(action.targetDate)}</td>
                  <td className="px-3 py-2">
                    <span className={cn("badge", actionStatusStyles[action.status])}>{action.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* D6-D8 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">D6: Implementation & Verification</h2>
          <p className="text-sm text-gray-700">{car.d6Implementation.plan}</p>
          <p className="text-xs text-gray-500 mt-2">Verification: {car.d6Implementation.verificationMethod}</p>
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">D7: Systemic Prevention</h2>
          <ul className="space-y-1">
            {car.d7Prevention.systemicActions.map((a, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
                <span className="text-gray-400">-</span>{a}
              </li>
            ))}
          </ul>
          {car.d7Prevention.lessonsLearned && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Lessons Learned</p>
              <p className="text-xs text-gray-700 mt-0.5 italic">{car.d7Prevention.lessonsLearned}</p>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">D8: Closure</h2>
          {car.d8Closure.closedDate ? (
            <div className="text-sm">
              <p className="text-gray-700">Closed: {formatDate(car.d8Closure.closedDate)}</p>
              <p className="text-gray-700">By: {car.d8Closure.closedBy}</p>
              <p className="text-gray-700 mt-2">{car.d8Closure.effectiveness}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Pending closure - actions must be completed and verified first</p>
          )}
        </div>
      </div>
    </div>
  );
}
