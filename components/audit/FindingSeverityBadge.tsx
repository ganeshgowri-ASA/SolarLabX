// @ts-nocheck
import { cn } from "@/lib/utils";
import { FindingSeverity, FindingStatus } from "@/lib/types/audit";

const severityStyles: Record<FindingSeverity, string> = {
  "Major NC": "bg-red-100 text-red-800 border-red-200",
  "Minor NC": "bg-orange-100 text-orange-800 border-orange-200",
  "OFI": "bg-blue-100 text-blue-800 border-blue-200",
  "Observation": "bg-gray-100 text-gray-800 border-gray-200",
};

const statusStyles: Record<FindingStatus, string> = {
  "Open": "bg-red-50 text-red-700",
  "In Progress": "bg-yellow-50 text-yellow-700",
  "Verification": "bg-purple-50 text-purple-700",
  "Closed": "bg-green-50 text-green-700",
  "Overdue": "bg-red-100 text-red-800",
};

export function FindingSeverityBadge({ severity }: { severity: FindingSeverity }) {
  return (
    <span className={cn("badge border", severityStyles[severity])}>
      {severity}
    </span>
  );
}

export function FindingStatusBadge({ status }: { status: FindingStatus }) {
  return (
    <span className={cn("badge", statusStyles[status])}>
      {status}
    </span>
  );
}
