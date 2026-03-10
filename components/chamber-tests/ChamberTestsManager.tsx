// @ts-nocheck
"use client";

import { useState } from "react";
import { ChamberTest } from "@/lib/types/chamber-tests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ChamberScheduleGantt from "./ChamberScheduleGantt";
import ChamberStatusDashboard from "./ChamberStatusDashboard";
import ChamberLoadingPlan from "./ChamberLoadingPlan";
import ChamberUtilizationChart from "./ChamberUtilizationChart";
import CyclesReview from "./CyclesReview";

interface ChamberTestsManagerProps {
  tests: ChamberTest[];
}

const testTypeColors: Record<string, string> = {
  TC: "bg-blue-100 text-blue-700",
  HF: "bg-cyan-100 text-cyan-700",
  DH: "bg-orange-100 text-orange-700",
  UV: "bg-amber-100 text-amber-700",
  "Hot Spot": "bg-red-100 text-red-700",
};

const statusColors: Record<string, string> = {
  Running: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Completed: "bg-gray-100 text-gray-700",
  Paused: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

export default function ChamberTestsManager({ tests }: ChamberTestsManagerProps) {
  const [selectedTest, setSelectedTest] = useState<ChamberTest | null>(null);

  const running = tests.filter((t) => t.status === "Running");
  const scheduled = tests.filter((t) => t.status === "Scheduled");
  const totalChambers = 17;
  const activeChambers = running.length;

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Chambers</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{totalChambers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Active Tests</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">{activeChambers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Scheduled</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{scheduled.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Idle Chambers</p>
            <p className="text-xl font-bold text-muted-foreground mt-0.5">{totalChambers - activeChambers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Utilization</p>
            <p className="text-xl font-bold text-primary mt-0.5">{Math.round((activeChambers / totalChambers) * 100)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Modules</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{running.reduce((s, t) => s + t.sampleIds.length, 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs for chamber tests features */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status Dashboard</TabsTrigger>
          <TabsTrigger value="tests">Active Tests ({running.length})</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="cycles">Cycles Review</TabsTrigger>
          <TabsTrigger value="loading">Loading Plans</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <ChamberStatusDashboard tests={tests} />
        </TabsContent>

        <TabsContent value="tests">
          <div className="space-y-3">
            {running.map((test) => (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{test.testName}</h3>
                        <Badge className={cn("text-[10px]", testTypeColors[test.testType])}>{test.testType}</Badge>
                        <Badge className={cn("text-[10px]", statusColors[test.status])}>{test.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {test.standard} | Chamber: {test.chamberName} | Project: {test.projectName}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setSelectedTest(selectedTest?.id === test.id ? null : test)}
                    >
                      {selectedTest?.id === test.id ? "Close" : "Details"}
                    </Button>
                  </div>

                  {/* Progress */}
                  {test.cycleData && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Cycle {test.cycleData.currentCycleNumber} of {test.cycleData.totalCycles}
                        </span>
                        <span className="font-medium text-foreground">
                          {Math.round((test.cycleData.completedCycles / test.cycleData.totalCycles) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(test.cycleData.completedCycles / test.cycleData.totalCycles) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Parameters row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-3 text-xs">
                    <div className="bg-muted/50 rounded p-2 text-center">
                      <p className="text-muted-foreground">Temp Range</p>
                      <p className="font-semibold text-foreground">{test.parameters.tempMin}°C to {test.parameters.tempMax}°C</p>
                    </div>
                    {test.parameters.humidityMax !== null && (
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-muted-foreground">Humidity</p>
                        <p className="font-semibold text-foreground">{test.parameters.humidityMax}%RH</p>
                      </div>
                    )}
                    <div className="bg-muted/50 rounded p-2 text-center">
                      <p className="text-muted-foreground">Cycles</p>
                      <p className="font-semibold text-foreground">{test.parameters.totalCycles}</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2 text-center">
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">{test.parameters.totalDuration}h</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2 text-center">
                      <p className="text-muted-foreground">Modules</p>
                      <p className="font-semibold text-foreground">{test.sampleIds.length}</p>
                    </div>
                    {test.schedule.estimatedCompletion && (
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-muted-foreground">Est. Complete</p>
                        <p className="font-semibold text-foreground">
                          {new Date(test.schedule.estimatedCompletion).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Anomalies */}
                  {test.cycleData && test.cycleData.anomalies.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Anomalies ({test.cycleData.anomalies.filter(a => !a.resolved).length} unresolved)
                      </p>
                      <div className="space-y-1">
                        {test.cycleData.anomalies.slice(0, 3).map((anomaly) => (
                          <div key={anomaly.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-[9px]",
                                anomaly.severity === "Critical" ? "bg-red-100 text-red-700" :
                                anomaly.severity === "Major" ? "bg-amber-100 text-amber-700" :
                                "bg-yellow-100 text-yellow-700"
                              )}>
                                {anomaly.severity}
                              </Badge>
                              <span className="text-muted-foreground">Cycle {anomaly.cycleNumber}:</span>
                              <span className="text-foreground">{anomaly.type}</span>
                            </div>
                            <Badge className={cn("text-[9px]", anomaly.resolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                              {anomaly.resolved ? "Resolved" : "Open"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded details */}
                  {selectedTest?.id === test.id && test.cycleData && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <CyclesReview test={test} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Scheduled tests */}
            {scheduled.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-muted-foreground mt-6 mb-2">Scheduled Tests</h3>
                {scheduled.map((test) => (
                  <Card key={test.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground">{test.testName}</h3>
                            <Badge className={cn("text-[10px]", testTypeColors[test.testType])}>{test.testType}</Badge>
                            <Badge className={cn("text-[10px]", statusColors[test.status])}>{test.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Chamber: {test.chamberName} | Project: {test.projectName} | Starts: {new Date(test.schedule.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{test.parameters.totalCycles} cycles</p>
                          <p>{test.sampleIds.length} modules</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <ChamberScheduleGantt />
        </TabsContent>

        <TabsContent value="cycles">
          <div className="space-y-4">
            {running.filter(t => t.cycleData).map((test) => (
              <Card key={test.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {test.testName}
                    <Badge className={cn("text-[10px]", testTypeColors[test.testType])}>{test.testType}</Badge>
                    <span className="text-xs text-muted-foreground font-normal">- {test.chamberName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CyclesReview test={test} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loading">
          <ChamberLoadingPlan tests={tests} />
        </TabsContent>

        <TabsContent value="utilization">
          <ChamberUtilizationChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
