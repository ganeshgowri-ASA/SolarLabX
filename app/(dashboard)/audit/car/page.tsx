// @ts-nocheck
"use client";

import Link from "next/link";
import { carReports } from "@/lib/data/audit-data";
import { cn, formatDate } from "@/lib/utils";

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  "D1-Team": "D1: Team Formation",
  "D2-Problem": "D2: Problem Definition",
  "D3-Containment": "D3: Containment Actions",
  "D4-RootCause": "D4: Root Cause Analysis",
  "D5-Corrective": "D5: Corrective Actions",
  "D6-Implementation": "D6: Implementation",
  "D7-Prevention": "D7: Prevention",
  "D8-Closure": "D8: Closure",
};

export default function CARListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">CAR/8D Problem-Solving Reports</h1>
        <Link href="/audit" className="btn-secondary text-sm">&larr; Back to Audit Dashboard</Link>
      </div>

      <div className="card">
        <p className="text-sm text-gray-600 mb-4">
          Corrective Action Reports using the 8D methodology for systematic problem-solving. Each report follows the D1-D8 discipline structure.
        </p>
      </div>

      <div className="space-y-4">
        {carReports.map((car) => (
          <Link key={car.id} href={`/audit/car/${car.id}`} className="card block hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-primary-600">{car.id}</span>
                  <span className={cn("badge", priorityStyles[car.priority])}>{car.priority}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mt-1">{car.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Finding: {car.findingId}</p>
              </div>
              <span className="badge bg-primary-50 text-primary-700">{statusLabels[car.status]}</span>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1">
              {Object.keys(statusLabels).map((step, idx) => {
                const currentIdx = Object.keys(statusLabels).indexOf(car.status);
                return (
                  <div
                    key={step}
                    className={cn(
                      "h-2 flex-1 rounded-full",
                      idx < currentIdx ? "bg-green-500" :
                      idx === currentIdx ? "bg-primary-500" :
                      "bg-gray-200"
                    )}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>Team Lead: {car.d1Team.leader}</span>
              <span>Created: {formatDate(car.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
