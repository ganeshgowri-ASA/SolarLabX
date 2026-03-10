// @ts-nocheck
"use client";

import { TestFlowStep } from "@/lib/types/equipment";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestFlowRouteProps {
  steps: TestFlowStep[];
}

const statusColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Completed: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", dot: "bg-green-500" },
  Active: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", dot: "bg-blue-500 animate-pulse" },
  Pending: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500", dot: "bg-gray-300" },
};

export default function TestFlowRoute({ steps }: TestFlowRouteProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Sample Test Flow Route - IEC 61215/61730</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-wrap gap-2">
          {steps.map((step, i) => {
            const colors = statusColors[step.status];
            return (
              <div key={step.id} className="flex items-center">
                <div className={cn("rounded-lg border p-3 min-w-[120px]", colors.bg, colors.border)}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", colors.dot)} />
                    <span className={cn("text-xs font-medium", colors.text)}>{step.station}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{step.equipment}</p>
                  <p className="text-[10px] text-muted-foreground">{step.duration}</p>
                </div>
                {i < steps.length - 1 && (
                  <svg className="h-4 w-4 text-muted-foreground shrink-0 mx-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-3 border-t">
          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /><span className="text-xs text-muted-foreground">Completed</span></div>
          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /><span className="text-xs text-muted-foreground">Active</span></div>
          <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" /><span className="text-xs text-muted-foreground">Pending</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
