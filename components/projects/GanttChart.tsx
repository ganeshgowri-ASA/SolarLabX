// @ts-nocheck
"use client";

import { Task } from "@/lib/types/projects";
import { cn } from "@/lib/utils";

interface GanttChartProps {
  tasks: Task[];
  projectStart: string;
  projectEnd: string;
}

const statusColors: Record<string, string> = {
  "Not Started": "bg-gray-300",
  "In Progress": "bg-blue-500",
  "Completed": "bg-green-500",
  "Blocked": "bg-red-500",
  "Overdue": "bg-red-400",
};

const priorityIndicator: Record<string, string> = {
  Critical: "border-l-4 border-l-red-500",
  High: "border-l-4 border-l-orange-500",
  Medium: "border-l-4 border-l-yellow-500",
  Low: "border-l-4 border-l-gray-400",
};

export default function GanttChart({ tasks, projectStart, projectEnd }: GanttChartProps) {
  const start = new Date(projectStart);
  const end = new Date(projectEnd);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Generate month headers
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

  // Today marker
  const today = new Date(2026, 2, 9); // March 9, 2026
  const todayOffset = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const todayPct = (todayOffset / totalDays) * 100;

  return (
    <div className="card overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Project Gantt Chart</h3>
      <div className="min-w-[800px]">
        {/* Month headers */}
        <div className="relative h-8 mb-2 border-b border-gray-200">
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex items-center text-xs font-medium text-gray-500 border-l border-gray-200 pl-1"
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
            return (
              <div key={task.id} className="flex items-center gap-2 h-8">
                <div className={cn("w-48 shrink-0 text-xs text-gray-700 truncate pl-2 py-1 rounded", priorityIndicator[task.priority])} title={task.name}>
                  {task.name}
                </div>
                <div className="flex-1 relative h-6 bg-gray-50 rounded">
                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                    style={{ left: `${todayPct}%` }}
                  />
                  {/* Task bar */}
                  <div
                    className={cn("absolute top-0.5 bottom-0.5 rounded-sm flex items-center", statusColors[task.status])}
                    style={{ left: pos.left, width: pos.width }}
                    title={`${task.name}: ${task.completionPercent}%`}
                  >
                    {/* Completion overlay */}
                    {task.completionPercent > 0 && task.completionPercent < 100 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-black/10 rounded-l-sm"
                        style={{ width: `${task.completionPercent}%` }}
                      />
                    )}
                    <span className="text-[9px] text-white font-medium px-1 relative z-10 truncate">
                      {task.completionPercent}%
                    </span>
                  </div>
                </div>
                <div className="w-16 shrink-0 text-xs text-gray-500 text-right">
                  {task.assignee.split(" ")[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-green-500" /><span className="text-xs text-gray-500">Completed</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-blue-500" /><span className="text-xs text-gray-500">In Progress</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-gray-300" /><span className="text-xs text-gray-500">Not Started</span></div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-0.5 bg-red-400" /><span className="text-xs text-gray-500">Today</span></div>
        </div>
      </div>
    </div>
  );
}
