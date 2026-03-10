"use client";

import { chamberUtilization } from "@/lib/data/chamber-tests-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ChamberUtilizationChart() {
  const avgUtil = Math.round(
    chamberUtilization.reduce((s, c) => s + c.utilizationPercent, 0) / chamberUtilization.length
  );
  const totalTests = chamberUtilization.reduce((s, c) => s + c.testsCompleted + c.testsInProgress, 0);
  const totalRunHours = chamberUtilization.reduce((s, c) => s + c.runningHours, 0);

  // Sort by utilization descending
  const sorted = [...chamberUtilization].sort((a, b) => b.utilizationPercent - a.utilizationPercent);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{avgUtil}%</p>
            <p className="text-[10px] text-muted-foreground">Avg Utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalRunHours.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Run Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalTests}</p>
            <p className="text-[10px] text-muted-foreground">Total Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{chamberUtilization.length}</p>
            <p className="text-[10px] text-muted-foreground">Chambers Tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Utilization bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Chamber Utilization (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.map((chamber) => (
            <div key={chamber.chamberId} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-medium w-16">{chamber.chamberName}</span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{chamber.runningHours}h run</span>
                  <span>{chamber.maintenanceHours}h maint</span>
                  <span>{chamber.testsInProgress} active</span>
                  <span className="font-semibold text-foreground w-10 text-right">{chamber.utilizationPercent}%</span>
                </div>
              </div>
              <div className="h-5 bg-muted rounded-full overflow-hidden relative">
                {/* Running segment */}
                <div
                  className={cn(
                    "absolute h-full rounded-l-full",
                    chamber.utilizationPercent >= 90 ? "bg-red-500" :
                    chamber.utilizationPercent >= 70 ? "bg-amber-500" :
                    chamber.utilizationPercent >= 40 ? "bg-green-500" :
                    "bg-blue-400"
                  )}
                  style={{ width: `${chamber.utilizationPercent}%` }}
                />
                {/* Maintenance segment */}
                <div
                  className="absolute h-full bg-purple-400/60"
                  style={{
                    left: `${chamber.utilizationPercent}%`,
                    width: `${(chamber.maintenanceHours / chamber.totalHours) * 100}%`,
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
                  {chamber.utilizationPercent}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          <span>Over 90% (overloaded)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          <span>70-89% (high)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-500" />
          <span>40-69% (optimal)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue-400" />
          <span>Under 40% (underutilized)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-purple-400/60" />
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
}
