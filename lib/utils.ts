import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateId(prefix: string): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    in_progress: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    attention: "bg-orange-100 text-orange-800",
    overdue: "bg-red-100 text-red-800",
    active: "bg-green-100 text-green-800",
    calibrated: "bg-green-100 text-green-800",
    due_soon: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    destructive: "bg-red-100 text-red-800",
    low: "bg-blue-100 text-blue-800",
    normal: "bg-green-100 text-green-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
    critical: "bg-red-100 text-red-800",
    // test result values
    pass: "bg-green-100 text-green-800",
    fail: "bg-red-100 text-red-800",
    na: "bg-gray-50 text-gray-500",
    // schedule / workflow states
    scheduled: "bg-blue-100 text-blue-800",
    delayed: "bg-red-100 text-red-800",
    open: "bg-gray-100 text-gray-800",
    on_hold: "bg-amber-100 text-amber-800",
    // equipment states
    busy: "bg-red-100 text-red-800",
    inactive: "bg-gray-100 text-gray-500",
    warning: "bg-orange-100 text-orange-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

/** Returns a Tailwind `bg-*-500` class for a small circular status dot. */
export function getStatusDot(status: string): string {
  const dots: Record<string, string> = {
    pass: "bg-green-500",
    fail: "bg-red-500",
    completed: "bg-green-500",
    in_progress: "bg-blue-500",
    delayed: "bg-red-500",
    scheduled: "bg-blue-500",
    pending: "bg-gray-300",
    active: "bg-green-500",
    overdue: "bg-red-500",
    warning: "bg-orange-500",
    on_hold: "bg-amber-500",
    na: "bg-gray-200",
  };
  return dots[status] || "bg-gray-300";
}

/** Returns paired `border-* bg-*` Tailwind classes for result card rows. */
export function getResultBorder(result: string): string {
  const borders: Record<string, string> = {
    pass: "border-green-200 bg-green-50",
    fail: "border-red-200 bg-red-50",
    in_progress: "border-blue-200 bg-blue-50",
    pending: "border-gray-100 bg-gray-50",
    na: "border-gray-100 bg-gray-50",
  };
  return borders[result] || "border-gray-100 bg-gray-50";
}

/** Returns a solid `bg-*-400` class for Gantt bar fills. */
export function getGanttBar(status: string): string {
  const bars: Record<string, string> = {
    completed: "bg-green-400",
    in_progress: "bg-amber-400",
    delayed: "bg-red-400",
    scheduled: "bg-blue-400",
    pending: "bg-blue-400",
  };
  return bars[status] || "bg-blue-400";
}

export function getDaysUntil(date: Date | string): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
