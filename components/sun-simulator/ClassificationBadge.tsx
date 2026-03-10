// @ts-nocheck
"use client";

import { ClassificationGrade } from "@/lib/sun-simulator";
import { cn } from "@/lib/utils";

interface ClassificationBadgeProps {
  grade: ClassificationGrade;
  size?: "sm" | "md" | "lg";
  label?: string;
}

const gradeStyles: Record<ClassificationGrade, string> = {
  "A+": "bg-emerald-500 text-white",
  A: "bg-green-500 text-white",
  B: "bg-yellow-400 text-yellow-900",
  C: "bg-orange-500 text-white",
  Fail: "bg-red-600 text-white",
};

const sizeStyles = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-20 h-20 text-3xl",
};

export default function ClassificationBadge({
  grade,
  size = "md",
  label,
}: ClassificationBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold shadow-md",
          gradeStyles[grade],
          sizeStyles[size]
        )}
      >
        {grade}
      </div>
      {label && (
        <span className="text-xs text-muted-foreground font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
