// @ts-nocheck
import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number;
  className?: string;
}

export function ConfidenceBar({ confidence, className }: ConfidenceBarProps) {
  const percentage = confidence * 100;
  const color =
    percentage >= 90 ? "bg-green-500" :
    percentage >= 70 ? "bg-yellow-500" :
    "bg-red-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums w-12 text-right">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}
