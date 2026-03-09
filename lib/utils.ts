import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
    overdue: "bg-red-100 text-red-800",
    pending: "bg-orange-100 text-orange-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
  };
  return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
