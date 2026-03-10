// @ts-nocheck
"use client";

import { ChamberTest, CycleGroup, CycleAnomaly } from "@/lib/types/chamber-tests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CyclesReviewProps {
  test: ChamberTest;
}

const groupStatusColors: Record<string, string> = {
  "Pass": "bg-green-100 text-green-700",
  "Fail": "bg-red-100 text-red-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Pending": "bg-gray-100 text-gray-600",
};

const anomalySeverityColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-700",
  Major: "bg-amber-100 text-amber-700",
  Minor: "bg-yellow-100 text-yellow-700",
};

export default function CyclesReview({ test }: CyclesReviewProps) {
  if (!test.cycleData) return null;
  const { cycleData } = test;
  const completionPct = Math.round((cycleData.completedCycles / cycleData.totalCycles) * 100);

  return (
    <div className="space-y-4">
      {/* Overall cycle progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{cycleData.completedCycles}</p>
          <p className="text-[10px] text-muted-foreground">Completed Cycles</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{cycleData.totalCycles}</p>
          <p className="text-[10px] text-muted-foreground">Total Required</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">{completionPct}%</p>
          <p className="text-[10px] text-muted-foreground">Overall Progress</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{cycleData.anomalies.length}</p>
          <p className="text-[10px] text-muted-foreground">Anomalies</p>
        </div>
      </div>

      {/* MQT Cycle Groups */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          MQT Cycle Groups (IEC 61215)
        </h4>
        <div className="space-y-3">
          {cycleData.cycleGroups.map((group) => (
            <CycleGroupCard key={group.id} group={group} />
          ))}
        </div>
      </div>

      {/* Temperature vs Time visualization */}
      {cycleData.temperatureLog.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Temperature Profile (Last 30 Cycles)
          </h4>
          <TemperatureChart log={cycleData.temperatureLog} tempMin={test.parameters.tempMin} tempMax={test.parameters.tempMax} />
        </div>
      )}

      {/* Anomalies table */}
      {cycleData.anomalies.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Anomaly Log
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left p-2 font-semibold">Cycle</th>
                  <th className="text-left p-2 font-semibold">Type</th>
                  <th className="text-left p-2 font-semibold">Severity</th>
                  <th className="text-left p-2 font-semibold">Description</th>
                  <th className="text-left p-2 font-semibold">Value</th>
                  <th className="text-left p-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {cycleData.anomalies.map((anomaly) => (
                  <AnomalyRow key={anomaly.id} anomaly={anomaly} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CycleGroupCard({ group }: { group: CycleGroup }) {
  const pct = Math.round((group.completedCycles / group.requiredCycles) * 100);
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{group.name}</span>
          <span className="text-xs text-muted-foreground">({group.mqtRef})</span>
        </div>
        <Badge className={cn("text-[10px]", groupStatusColors[group.status])}>
          {group.status}
        </Badge>
      </div>
      <div className="flex items-center gap-3 mb-1.5">
        <Progress
          value={pct}
          className={cn(
            "h-2.5 flex-1",
            group.status === "Pass" && "[&>div]:bg-green-500",
            group.status === "Fail" && "[&>div]:bg-red-500"
          )}
        />
        <span className="text-xs font-medium text-foreground w-12 text-right">{pct}%</span>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{group.completedCycles} / {group.requiredCycles} cycles completed</span>
        <span>Cycles {group.startCycle} - {group.endCycle}</span>
      </div>
    </div>
  );
}

function AnomalyRow({ anomaly }: { anomaly: CycleAnomaly }) {
  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30">
      <td className="p-2 font-medium text-foreground">#{anomaly.cycleNumber}</td>
      <td className="p-2 text-foreground">{anomaly.type}</td>
      <td className="p-2">
        <Badge className={cn("text-[9px]", anomalySeverityColors[anomaly.severity])}>
          {anomaly.severity}
        </Badge>
      </td>
      <td className="p-2 text-muted-foreground max-w-[200px] truncate">{anomaly.description}</td>
      <td className="p-2 text-foreground">
        {anomaly.value} <span className="text-muted-foreground">(limit: {anomaly.limit})</span>
      </td>
      <td className="p-2">
        <Badge className={cn("text-[9px]", anomaly.resolved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
          {anomaly.resolved ? "Resolved" : "Open"}
        </Badge>
      </td>
    </tr>
  );
}

function TemperatureChart({ log, tempMin, tempMax }: { log: { cycle: number; temperature: number; phase: string }[]; tempMin: number; tempMax: number }) {
  // Simple ASCII-style temperature visualization using CSS bars
  const tempRange = tempMax - tempMin;
  const height = 160;

  // Sample every 4th point to avoid overcrowding
  const sampled = log.filter((_, i) => i % 4 === 0).slice(0, 60);

  return (
    <div className="border rounded-lg p-3 bg-muted/20">
      <div className="flex items-end gap-px h-40 overflow-x-auto">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between h-full w-12 shrink-0 text-[9px] text-muted-foreground pr-1">
          <span>{tempMax}°C</span>
          <span>{Math.round((tempMax + tempMin) / 2)}°C</span>
          <span>{tempMin}°C</span>
        </div>
        {/* Data bars */}
        {sampled.map((entry, i) => {
          const normalized = (entry.temperature - tempMin) / tempRange;
          const barHeight = Math.max(normalized * height, 2);
          const isHot = entry.temperature > (tempMax + tempMin) / 2;
          return (
            <div
              key={i}
              className="flex flex-col-reverse items-center"
              style={{ height: `${height}px` }}
              title={`Cycle ${entry.cycle} | ${entry.temperature.toFixed(1)}°C | ${entry.phase}`}
            >
              <div
                className={cn(
                  "w-2 rounded-t-sm transition-all",
                  isHot ? "bg-red-400" : "bg-blue-400"
                )}
                style={{ height: `${barHeight}px` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2 pt-2 border-t text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-red-400" />
          <span>Hot phase</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-blue-400" />
          <span>Cold phase</span>
        </div>
        <span className="ml-auto">Hover bars for details</span>
      </div>
    </div>
  );
}
