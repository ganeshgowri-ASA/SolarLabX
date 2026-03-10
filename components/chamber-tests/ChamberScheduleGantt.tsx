// @ts-nocheck
"use client";

import { chamberScheduleEvents } from "@/lib/data/chamber-tests-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const months = ["Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026"];
const monthStarts = [
  new Date("2026-02-01").getTime(),
  new Date("2026-03-01").getTime(),
  new Date("2026-04-01").getTime(),
  new Date("2026-05-01").getTime(),
  new Date("2026-06-01").getTime(),
];
const timelineStart = new Date("2026-02-01").getTime();
const timelineEnd = new Date("2026-07-01").getTime();
const totalDuration = timelineEnd - timelineStart;

// Group events by chamber
const chamberNames = Array.from(new Set(chamberScheduleEvents.map(e => e.chamberName))).sort();

export default function ChamberScheduleGantt() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Chamber Schedule Timeline</CardTitle>
        <p className="text-xs text-muted-foreground">Feb 2026 - Jun 2026</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Month headers */}
            <div className="flex border-b pb-2 mb-2">
              <div className="w-24 shrink-0 text-xs font-medium text-muted-foreground">Chamber</div>
              <div className="flex-1 flex">
                {months.map((month, i) => {
                  const monthStart = monthStarts[i];
                  const nextMonth = i < monthStarts.length - 1 ? monthStarts[i + 1] : timelineEnd;
                  const width = ((nextMonth - monthStart) / totalDuration) * 100;
                  return (
                    <div
                      key={month}
                      className="text-[10px] text-muted-foreground font-medium border-l border-dashed pl-1"
                      style={{ width: `${width}%` }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chamber rows */}
            {chamberNames.map((chamberName) => {
              const events = chamberScheduleEvents.filter(e => e.chamberName === chamberName);
              return (
                <div key={chamberName} className="flex items-center mb-1.5 min-h-[28px]">
                  <div className="w-24 shrink-0 text-xs font-medium text-foreground">{chamberName}</div>
                  <div className="flex-1 relative h-6 bg-muted/30 rounded">
                    {/* Grid lines */}
                    {monthStarts.map((ms, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-dashed border-muted-foreground/20"
                        style={{ left: `${((ms - timelineStart) / totalDuration) * 100}%` }}
                      />
                    ))}
                    {/* Events */}
                    {events.map((event) => {
                      const start = new Date(event.startDate).getTime();
                      const end = new Date(event.endDate).getTime();
                      const left = ((start - timelineStart) / totalDuration) * 100;
                      const width = ((end - start) / totalDuration) * 100;
                      return (
                        <div
                          key={event.id}
                          className={cn(
                            "absolute top-0.5 h-5 rounded text-[9px] text-white font-medium flex items-center px-1.5 truncate cursor-default",
                            event.color,
                            event.status === "Scheduled" && "opacity-60"
                          )}
                          style={{ left: `${Math.max(left, 0)}%`, width: `${Math.min(width, 100 - left)}%` }}
                          title={`${event.testName} (${event.projectId})`}
                        >
                          {event.testName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Today indicator */}
            <div className="flex items-center mt-3">
              <div className="w-24 shrink-0" />
              <div className="flex-1 relative h-4">
                {(() => {
                  const today = new Date("2026-03-10").getTime();
                  const leftPct = ((today - timelineStart) / totalDuration) * 100;
                  return (
                    <div
                      className="absolute top-0 w-px h-full bg-primary"
                      style={{ left: `${leftPct}%` }}
                    >
                      <div className="absolute -top-0.5 -left-2 text-[9px] text-primary font-bold">Today</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
          {chamberScheduleEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-1.5 text-[10px]">
              <span className={cn("h-2.5 w-2.5 rounded-sm", event.color)} />
              <span className="text-muted-foreground">{event.testName}</span>
              <Badge className={cn("text-[8px]", event.status === "Running" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>
                {event.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
