// @ts-nocheck
"use client";

import { Milestone } from "@/lib/types/projects";
import { cn, formatDate } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Completed: "bg-green-500",
  Pending: "bg-gray-300",
  Overdue: "bg-red-500",
};

export default function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Milestones</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {milestones.map((ms, idx) => (
            <div key={ms.id} className="flex gap-4 relative">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10", statusStyles[ms.status])}>
                {ms.status === "Completed" ? (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-xs font-bold text-white">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{ms.name}</h4>
                  <span className={cn(
                    "badge",
                    ms.status === "Completed" ? "bg-green-100 text-green-700" :
                    ms.status === "Overdue" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  )}>
                    {ms.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{ms.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">Due: {formatDate(ms.dueDate)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
