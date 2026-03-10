// @ts-nocheck
"use client";

import { PurchaseOrder } from "@/lib/types/procurement";
import { cn, formatDate } from "@/lib/utils";

const timelineSteps = [
  { key: "Draft", label: "Draft" },
  { key: "Pending Approval", label: "Pending" },
  { key: "Approved", label: "Approved" },
  { key: "Ordered", label: "Ordered" },
  { key: "Delivered", label: "Delivered" },
  { key: "Closed", label: "Closed" },
];

const fatSatSteps = [
  "Not Started",
  "FAT Scheduled",
  "FAT Complete",
  "SAT Scheduled",
  "SAT Complete",
  "Accepted",
];

function getStepIdx(status: string): number {
  const idx = timelineSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function POTimeline({ po }: { po: PurchaseOrder }) {
  const currentIdx = getStepIdx(po.status);
  const fatIdx = fatSatSteps.indexOf(po.fatSatStatus);

  return (
    <div className="space-y-6">
      {/* PO Status */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">PO Status Timeline</h3>
        <div className="flex items-center justify-between">
          {timelineSteps.map((step, idx) => {
            const isComplete = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {idx > 0 && <div className={cn("flex-1 h-0.5", isComplete ? "bg-green-500" : "bg-gray-200")} />}
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                    isComplete && "bg-green-500 text-white",
                    isCurrent && "bg-primary-600 text-white",
                    !isComplete && !isCurrent && "bg-gray-200 text-gray-500"
                  )}>
                    {isComplete ? "\u2713" : idx + 1}
                  </div>
                  {idx < timelineSteps.length - 1 && <div className={cn("flex-1 h-0.5", isComplete ? "bg-green-500" : "bg-gray-200")} />}
                </div>
                <span className="text-[10px] mt-1 text-gray-500">{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
          <div>
            <span className="text-gray-500">Order Date:</span>
            <p className="font-medium">{formatDate(po.orderDate)}</p>
          </div>
          <div>
            <span className="text-gray-500">Expected Delivery:</span>
            <p className="font-medium">{formatDate(po.expectedDelivery)}</p>
          </div>
          <div>
            <span className="text-gray-500">Actual Delivery:</span>
            <p className="font-medium">{po.actualDelivery ? formatDate(po.actualDelivery) : "Pending"}</p>
          </div>
        </div>
      </div>

      {/* FAT/SAT Status */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">FAT/SAT Status</h3>
        <div className="flex items-center justify-between">
          {fatSatSteps.map((step, idx) => {
            const isComplete = idx < fatIdx;
            const isCurrent = idx === fatIdx;
            return (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {idx > 0 && <div className={cn("flex-1 h-0.5", isComplete ? "bg-green-500" : "bg-gray-200")} />}
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",
                    isComplete && "bg-green-500 text-white",
                    isCurrent && "bg-primary-600 text-white",
                    !isComplete && !isCurrent && "bg-gray-200 text-gray-500"
                  )}>
                    {isComplete ? "\u2713" : idx + 1}
                  </div>
                  {idx < fatSatSteps.length - 1 && <div className={cn("flex-1 h-0.5", isComplete ? "bg-green-500" : "bg-gray-200")} />}
                </div>
                <span className="text-[9px] mt-1 text-gray-500 text-center">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
