"use client";

import { Task } from "@/lib/types/projects";
import { cn } from "@/lib/utils";

interface GanttChartProps {
  tasks: Task[];
  projectStart: string;
  projectEnd: string;
}

const priorityColors: Record<string, string> = {
  P0: "border-l-red-500",
  P1: "border-l-orange-500",
  P2: "border-l-yellow-500",
  P3: "border-l-blue-500",
  P4: "border-l-gray-400",
};

const columnBarColors: Record<string, string> = {
  Done: "bg-green-500",
  "In Progress": "bg-blue-500",
  "To Do": "bg-amber-400",
  Review: "bg-purple-500",
  Backlog: "bg-gray-300",
};

export default function GanttChart({ tasks, projectStart, projectEnd }: GanttChartProps) {
  const start = new Date(projectStart);
  const end = new Date(projectEnd);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const months: { name: string; startPct: number; widthPct: number }[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const monthStart = new Date(cursor);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const effectiveEnd = monthEnd > end ? end : monthEnd;
    const dayOffset = Math.ceil((monthStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dayWidth = Math.ceil((effectiveEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    months.push({
      name: monthStart.toLocaleString("default", { month: "short", year: "numeric" }),
      startPct: (dayOffset / totalDays) * 100,
      widthPct: (dayWidth / totalDays) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
    cursor.setDate(1);
  }

  function getBarPosition(taskStart: string, taskEnd: string) {
    const ts = new Date(taskStart);
    const te = new Date(taskEnd);
    const leftDays = Math.max(0, Math.ceil((ts.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const widthDays = Math.ceil((te.getTime() - ts.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return {
      left: `${(leftDays / totalDays) * 100}%`,
      width: `${(widthDays / totalDays) * 100}%`,
    };
  }

  const today = new Date(2026, 2, 9);
  const todayOffset = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const todayPct = (todayOffset / totalDays) * 100;

  // Identify critical path (P0 tasks and their dependency chains)
  const criticalIds = new Set<string>();
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  tasks.forEach((t) => {
    if (t.priority === "P0") {
      criticalIds.add(t.id);
      const walk = (id: string) => {
        const task = taskMap.get(id);
        task?.dependencies.forEach((d) => {
          criticalIds.add(d);
          walk(d);
        });
      };
      walk(t.id);
    }
  });

  return (
    <div className="rounded-lg border bg-card p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Gantt Chart with Dependencies</h3>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
          <span className="text-[10px] text-muted-foreground mr-2">Critical Path</span>
        </div>
      </div>

      <div className="min-w-[900px]">
        {/* Month headers */}
        <div className="relative h-8 mb-2 border-b">
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex items-center text-xs font-medium text-muted-foreground border-l pl-1"
              style={{ left: `${m.startPct}%`, width: `${m.widthPct}%` }}
            >
              {m.name}
            </div>
          ))}
        </div>

        {/* Task rows */}
        <div className="space-y-1">
          {tasks.map((task) => {
            const pos = getBarPosition(task.startDate, task.endDate);
            const isCritical = criticalIds.has(task.id);
            return (
              <div key={task.id} className="flex items-center gap-2 h-8">
                <div
                  className={cn(
                    "w-52 shrink-0 text-xs text-foreground truncate pl-2 py-1 rounded border-l-4",
                    priorityColors[task.priority]
                  )}
                  title={task.name}
                >
                  {task.name}
                </div>
                <div className="flex-1 relative h-6 bg-muted/30 rounded">
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                    style={{ left: `${todayPct}%` }}
                  />
                  <div
                    className={cn(
                      "absolute top-0.5 bottom-0.5 rounded-sm flex items-center",
                      columnBarColors[task.column] || "bg-gray-300",
                      isCritical && "ring-2 ring-red-400 ring-offset-1"
                    )}
                    style={{ left: pos.left, width: pos.width }}
                    title={`${task.name}: ${task.completionPercent}%`}
                  >
                    {task.completionPercent > 0 && task.completionPercent < 100 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-black/15 rounded-l-sm"
                        style={{ width: `${task.completionPercent}%` }}
                      />
                    )}
                    <span className="text-[9px] text-white font-medium px-1 relative z-10 truncate">
                      {task.completionPercent}%
                    </span>
                  </div>
                </div>
                <div className="w-8 shrink-0">
                  <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
                    {task.assigneeAvatar}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-green-500" /><span className="text-xs text-muted-foreground">Done</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-blue-500" /><span className="text-xs text-muted-foreground">In Progress</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-amber-400" /><span className="text-xs text-muted-foreground">To Do</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-gray-300" /><span className="text-xs text-muted-foreground">Backlog</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-0.5 bg-red-400" /><span className="text-xs text-muted-foreground">Today</span></div>
        </div>
      </div>
    </div>
  );
}
