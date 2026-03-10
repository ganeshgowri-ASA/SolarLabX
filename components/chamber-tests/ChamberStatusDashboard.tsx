// @ts-nocheck
"use client";

import { ChamberTest } from "@/lib/types/chamber-tests";
import { chamberStatuses } from "@/lib/data/equipment-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ChamberStatusDashboardProps {
  tests: ChamberTest[];
}

const statusDot: Record<string, string> = {
  Available: "bg-green-500",
  "In-Use": "bg-blue-500 animate-pulse",
  Maintenance: "bg-amber-500",
  Calibration: "bg-purple-500",
};

const statusBadge: Record<string, string> = {
  Available: "bg-green-100 text-green-700 border-green-200",
  "In-Use": "bg-blue-100 text-blue-700 border-blue-200",
  Maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  Calibration: "bg-purple-100 text-purple-700 border-purple-200",
};

const statusBorderColors: Record<string, string> = {
  Available: "border-l-green-500",
  "In-Use": "border-l-blue-500",
  Maintenance: "border-l-amber-500",
  Calibration: "border-l-purple-500",
};

export default function ChamberStatusDashboard({ tests }: ChamberStatusDashboardProps) {
  const testMap = new Map(tests.filter(t => t.status === "Running").map(t => [t.chamberId, t]));

  const inUse = chamberStatuses.filter(c => c.status === "In-Use").length;
  const available = chamberStatuses.filter(c => c.status === "Available").length;
  const maintenance = chamberStatuses.filter(c => c.status === "Maintenance" || c.status === "Calibration").length;

  // Group chambers by type
  const tcChambers = chamberStatuses.filter(c => c.id.includes("TC"));
  const dhChambers = chamberStatuses.filter(c => c.id.includes("DH"));
  const hfChambers = chamberStatuses.filter(c => c.id.includes("HF"));
  const uvChambers = chamberStatuses.filter(c => c.id.includes("UV"));

  const groups = [
    { title: "Thermal Cycling Chambers", chambers: tcChambers },
    { title: "Damp Heat Chambers", chambers: dhChambers },
    { title: "Humidity Freeze Chambers", chambers: hfChambers },
    { title: "UV Preconditioning Chambers", chambers: uvChambers },
  ];

  return (
    <div className="space-y-6">
      {/* Status summary */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-foreground font-medium">{inUse} Running</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-foreground font-medium">{available} Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-foreground font-medium">{maintenance} Maintenance/Cal</span>
        </div>
      </div>

      {/* Chamber groups */}
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">{group.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {group.chambers.map((chamber) => {
              const test = testMap.get(chamber.id);
              return (
                <Card key={chamber.id} className={cn("border-l-4", statusBorderColors[chamber.status])}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", statusDot[chamber.status])} />
                        <span className="text-sm font-semibold text-foreground">{chamber.name}</span>
                      </div>
                      <Badge className={cn("text-[10px]", statusBadge[chamber.status])}>
                        {chamber.status === "In-Use" ? "Running" : chamber.status}
                      </Badge>
                    </div>

                    {chamber.status === "In-Use" && test && (
                      <>
                        <div className="text-xs text-foreground font-medium mb-0.5">{test.testName}</div>
                        <div className="text-[10px] text-muted-foreground mb-2">
                          {test.standard} | {test.projectId}
                        </div>

                        {test.cycleData && (
                          <>
                            <Progress
                              value={(test.cycleData.completedCycles / test.cycleData.totalCycles) * 100}
                              className="h-1.5 mb-1"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                              <span>Cycle {test.cycleData.currentCycleNumber}/{test.cycleData.totalCycles}</span>
                              <span>{Math.round((test.cycleData.completedCycles / test.cycleData.totalCycles) * 100)}%</span>
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-center">
                          {chamber.temperature !== null && (
                            <div>
                              <p className={cn(
                                "text-sm font-bold",
                                chamber.setpointTemp !== null && Math.abs(chamber.temperature - chamber.setpointTemp) > 2
                                  ? "text-amber-600"
                                  : "text-foreground"
                              )}>
                                {chamber.temperature.toFixed(1)}°C
                              </p>
                              <p className="text-[9px] text-muted-foreground">SP: {chamber.setpointTemp}°C</p>
                            </div>
                          )}
                          {chamber.humidity !== null && (
                            <div>
                              <p className={cn(
                                "text-sm font-bold",
                                chamber.setpointHumidity !== null && Math.abs(chamber.humidity - chamber.setpointHumidity) > 2
                                  ? "text-amber-600"
                                  : "text-foreground"
                              )}>
                                {chamber.humidity.toFixed(1)}%RH
                              </p>
                              <p className="text-[9px] text-muted-foreground">SP: {chamber.setpointHumidity}%RH</p>
                            </div>
                          )}
                        </div>

                        {test.cycleData && test.cycleData.anomalies.filter(a => !a.resolved).length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <Badge className="text-[9px] bg-red-100 text-red-700">
                              {test.cycleData.anomalies.filter(a => !a.resolved).length} unresolved anomaly
                            </Badge>
                          </div>
                        )}
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
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
