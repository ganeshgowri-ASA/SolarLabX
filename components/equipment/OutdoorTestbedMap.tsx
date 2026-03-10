// @ts-nocheck
"use client";

import { OutdoorTestPosition } from "@/lib/types/equipment";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OutdoorTestbedMapProps {
  positions: OutdoorTestPosition[];
}

const statusColors: Record<string, string> = {
  Occupied: "bg-blue-500 text-white hover:bg-blue-600",
  Available: "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200",
  Reserved: "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200",
};

// Color-code by project
const projectColors: Record<string, string> = {
  "PRJ-2026-001": "bg-blue-500 text-white",
  "PRJ-2026-002": "bg-purple-500 text-white",
  "PRJ-2026-003": "bg-amber-400 text-amber-900",
  "PRJ-2026-004": "bg-emerald-500 text-white",
};

export default function OutdoorTestbedMap({ positions }: OutdoorTestbedMapProps) {
  const occupied = positions.filter((p) => p.status === "Occupied").length;
  const available = positions.filter((p) => p.status === "Available").length;
  const reserved = positions.filter((p) => p.status === "Reserved").length;

  // Get unique projects
  const projectMap = new Map<string, string>();
  positions.forEach((p) => {
    if (p.projectId && p.projectName) {
      projectMap.set(p.projectId, p.projectName);
    }
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Outdoor Test Bed - 72 Positions</CardTitle>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-blue-500 inline-block" />{occupied} Occupied</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-green-200 border border-green-300 inline-block" />{available} Available</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-200 border border-amber-300 inline-block" />{reserved} Reserved</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Project legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from(projectMap.entries()).map(([id, name]) => (
            <div key={id} className="flex items-center gap-1.5">
              <span className={cn("h-3 w-3 rounded", projectColors[id] || "bg-gray-400")} />
              <span className="text-[10px] text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>

        {/* Grid map: 12 columns x 6 rows */}
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-12 gap-1.5">
            {positions.map((pos) => {
              const bgColor = pos.projectId
                ? projectColors[pos.projectId] || statusColors[pos.status]
                : statusColors[pos.status];

              return (
                <Tooltip key={pos.position}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-10 rounded flex items-center justify-center text-[10px] font-medium cursor-pointer transition-colors",
                        bgColor
                      )}
                    >
                      {pos.position}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <div className="space-y-0.5">
                      <p className="font-medium">Position {pos.position} - {pos.status}</p>
                      {pos.moduleId && <p>Module: {pos.moduleId}</p>}
                      {pos.sampleId && <p>Sample: {pos.sampleId}</p>}
                      {pos.projectName && <p>Project: {pos.projectName}</p>}
                      {pos.installDate && <p>Installed: {pos.installDate}</p>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
