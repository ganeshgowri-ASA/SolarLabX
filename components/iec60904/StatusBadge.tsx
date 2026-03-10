// @ts-nocheck
"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pass" | "marginal" | "fail" | "pending";
  label?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  pass: { bg: "bg-emerald-500", text: "text-white", label: "PASS" },
  marginal: { bg: "bg-yellow-500", text: "text-white", label: "MARGINAL" },
  fail: { bg: "bg-red-500", text: "text-white", label: "FAIL" },
  pending: { bg: "bg-gray-400", text: "text-white", label: "PENDING" },
};

const sizeConfig = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-2 text-base font-bold",
};

export default function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center rounded-full font-medium", config.bg, config.text, sizeConfig[size])}>
      {label || config.label}
    </span>
  );
}
