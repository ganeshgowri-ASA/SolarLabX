/**
 * Shared Tailwind badge-class maps for common domain values.
 * Import these instead of redefining local color maps in each component.
 */

/** low=blue, medium=yellow, high=orange, critical=red — light badge style */
export const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

/**
 * Lifecycle/workflow state badge classes with border accent.
 * Covers the Planned → In Progress → Completed/Cancelled arc used
 * by audit, project, and QMS modules.
 */
export const LIFECYCLE_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  Planned: "bg-blue-200 text-blue-800 border-blue-300",
  "In Progress": "bg-yellow-200 text-yellow-800 border-yellow-300",
  Completed: "bg-green-200 text-green-800 border-green-300",
  Done: "bg-green-200 text-green-800 border-green-300",
  Cancelled: "bg-gray-200 text-gray-800 border-gray-300",
  Failed: "bg-red-200 text-red-800 border-red-300",
};

/** Returns the SEVERITY_COLORS class for `level`; falls back to `fallback`. */
export function severityBadgeClass(
  level: string,
  fallback = "bg-gray-100 text-gray-700"
): string {
  return SEVERITY_COLORS[level.toLowerCase()] ?? fallback;
}

/** Returns the LIFECYCLE_COLORS class for `status`; falls back to `fallback`. */
export function lifecycleBadgeClass(
  status: string,
  fallback = "bg-gray-100 text-gray-700"
): string {
  return LIFECYCLE_COLORS[status] ?? fallback;
}
