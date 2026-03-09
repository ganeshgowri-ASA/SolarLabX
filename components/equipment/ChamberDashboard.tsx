"use client";

import { ChamberStatus } from "@/lib/types/equipment";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ChamberDashboardProps {
  chambers: ChamberStatus[];
}

const statusColors: Record<string, string> = {
  Available: "bg-green-100 text-green-700 border-green-200",
  "In-Use": "bg-blue-100 text-blue-700 border-blue-200",
  Maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  Calibration: "bg-purple-100 text-purple-700 border-purple-200",
};

const statusDot: Record<string, string> = {
  Available: "bg-green-500",
  "In-Use": "bg-blue-500 animate-pulse",
  Maintenance: "bg-amber-500",
  Calibration: "bg-purple-500",
};

export default function ChamberDashboard({ chambers }: ChamberDashboardProps) {
  const inUse = chambers.filter((c) => c.status === "In-Use").length;
  const available = chambers.filter((c) => c.status === "Available").length;
  const maintenance = chambers.filter((c) => c.status === "Maintenance" || c.status === "Calibration").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">{inUse} In-Use</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{available} Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">{maintenance} Maintenance/Cal</span>
        </div>
      </div>

      {/* Chamber Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {chambers.map((chamber) => (
          <Card key={chamber.id} className={cn("border-l-4", chamber.status === "In-Use" ? "border-l-blue-500" : chamber.status === "Available" ? "border-l-green-500" : chamber.status === "Maintenance" ? "border-l-amber-500" : "border-l-purple-500")}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", statusDot[chamber.status])} />
                  <span className="text-sm font-semibold text-foreground">{chamber.name}</span>
                </div>
                <Badge className={cn("text-[10px]", statusColors[chamber.status])}>
                  {chamber.status}
                </Badge>
              </div>

              {chamber.status === "In-Use" && chamber.currentTest && (
                <>
                  <div className="text-xs text-foreground font-medium mb-0.5">{chamber.currentTest}</div>
                  <div className="text-[10px] text-muted-foreground mb-2">{chamber.testType} | {chamber.projectId}</div>

                  <Progress value={chamber.progress} className="h-1.5 mb-1" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                    <span>{chamber.progress}% complete</span>
                    <span>{chamber.timeRemaining} remaining</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-center">
                    {chamber.temperature !== null && (
                      <div>
                        <p className={cn("text-sm font-bold", Math.abs(chamber.temperature - (chamber.setpointTemp || 0)) > 2 ? "text-amber-600" : "text-foreground")}>
                          {chamber.temperature.toFixed(1)}°C
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          SP: {chamber.setpointTemp}°C
                        </p>
                      </div>
                    )}
                    {chamber.humidity !== null && (
                      <div>
                        <p className={cn("text-sm font-bold", Math.abs(chamber.humidity - (chamber.setpointHumidity || 0)) > 2 ? "text-amber-600" : "text-foreground")}>
                          {chamber.humidity.toFixed(1)}%RH
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          SP: {chamber.setpointHumidity}%RH
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {chamber.status === "Available" && (
                <div className="text-xs text-green-600 mt-1">Ready for assignment</div>
              )}

              {(chamber.status === "Maintenance" || chamber.status === "Calibration") && (
                <div className="text-xs text-amber-600 mt-1">Under {chamber.status.toLowerCase()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
