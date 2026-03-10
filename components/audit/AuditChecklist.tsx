// @ts-nocheck
"use client";

import { ChecklistItem } from "@/lib/types/audit";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Conforming: "bg-green-100 text-green-700",
  "Non-Conforming": "bg-red-100 text-red-700",
  "Not Applicable": "bg-gray-50 text-gray-400",
};

const statusIcons: Record<string, string> = {
  Pending: "M12 8v4m0 4h.01",
  Conforming: "M5 13l4 4L19 7",
  "Non-Conforming": "M6 18L18 6M6 6l12 12",
  "Not Applicable": "M20 12H4",
};

export default function AuditChecklist({ items }: { items: ChecklistItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500">No checklist items defined yet.</p>
      </div>
    );
  }

  const conforming = items.filter((i) => i.status === "Conforming").length;
  const nonConforming = items.filter((i) => i.status === "Non-Conforming").length;
  const pending = items.filter((i) => i.status === "Pending").length;

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <div className="badge bg-green-100 text-green-700 px-3 py-1">
          Conforming: {conforming}
        </div>
        <div className="badge bg-red-100 text-red-700 px-3 py-1">
          Non-Conforming: {nonConforming}
        </div>
        <div className="badge bg-gray-100 text-gray-600 px-3 py-1">
          Pending: {pending}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clause</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evidence Required</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {item.clause}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                  {item.requirement}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                  {item.evidenceRequired}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={cn("badge", statusStyles[item.status])}>
                    <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={statusIcons[item.status]} />
                    </svg>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                  {item.notes || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
