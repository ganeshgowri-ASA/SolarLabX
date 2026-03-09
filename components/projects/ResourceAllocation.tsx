"use client";

import { ResourceAllocation as ResourceType } from "@/lib/types/projects";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  Chamber: "bg-purple-100 text-purple-700",
  Simulator: "bg-blue-100 text-blue-700",
  Equipment: "bg-green-100 text-green-700",
  Staff: "bg-orange-100 text-orange-700",
};

export default function ResourceAllocationView({ resources }: { resources: ResourceType[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Resource Allocation</h3>
      <div className="space-y-3">
        {resources.map((res) => (
          <div key={res.id} className="flex items-center gap-3">
            <span className={cn("badge shrink-0 w-20 justify-center", typeColors[res.type])}>
              {res.type}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 truncate">{res.name}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-2">{res.utilizationPercent}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    res.utilizationPercent >= 90 ? "bg-red-500" :
                    res.utilizationPercent >= 70 ? "bg-yellow-500" :
                    "bg-green-500"
                  )}
                  style={{ width: `${res.utilizationPercent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
