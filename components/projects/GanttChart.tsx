"use client";

import { useRef } from "react";
import { Task } from "@/lib/types/projects";
import { cn } from "@/lib/utils";

interface GanttChartProps {
  tasks: Task[];
  projectStart: string;
  projectEnd: string;
  projectName?: string;
  projectManager?: string;
  completionPercent?: number;
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

export default function GanttChart({ tasks, projectStart, projectEnd, projectName, projectManager, completionPercent }: GanttChartProps) {
  const ganttRef = useRef<HTMLDivElement>(null);
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

  const handleDownloadPDF = () => {
    const el = ganttRef.current;
    if (!el) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const startFormatted = start.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
    const endFormatted = end.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gantt Chart - ${projectName || "Project"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; font-size: 11px; color: #1a1a1a; }
          .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { font-size: 18px; color: #1e40af; }
          .header p { font-size: 11px; color: #6b7280; margin-top: 2px; }
          .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .meta-item { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; }
          .meta-item .label { font-size: 9px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
          .meta-item .value { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-top: 2px; }
          .gantt-content { overflow: visible; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f1f5f9; text-align: left; padding: 6px 8px; font-size: 9px; font-weight: 600; color: #475569; text-transform: uppercase; border: 1px solid #e2e8f0; }
          td { padding: 5px 8px; font-size: 10px; border: 1px solid #e2e8f0; }
          .priority-P0 { color: #dc2626; font-weight: 700; }
          .priority-P1 { color: #ea580c; font-weight: 600; }
          .priority-P2 { color: #ca8a04; }
          .priority-P3 { color: #2563eb; }
          .priority-P4 { color: #6b7280; }
          .status-done { color: #16a34a; }
          .status-progress { color: #2563eb; }
          .status-todo { color: #ca8a04; }
          .status-backlog { color: #6b7280; }
          .critical { background: #fef2f2; }
          .legend { display: flex; gap: 12px; margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
          .legend span { font-size: 9px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
          .legend .dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
          .footer { margin-top: 24px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print { body { padding: 15px; } @page { size: landscape; margin: 10mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Project Gantt Chart</h1>
          <p>${projectName || "Project"}</p>
        </div>
        <div class="meta-grid">
          <div class="meta-item"><div class="label">Project</div><div class="value">${projectName || "-"}</div></div>
          <div class="meta-item"><div class="label">Timeline</div><div class="value">${startFormatted} - ${endFormatted}</div></div>
          <div class="meta-item"><div class="label">Project Manager</div><div class="value">${projectManager || "-"}</div></div>
          <div class="meta-item"><div class="label">Completion</div><div class="value">${completionPercent ?? "-"}%</div></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:30%">Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Start</th>
              <th>End</th>
              <th>Progress</th>
              <th>Critical Path</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map((task) => {
              const isCrit = criticalIds.has(task.id);
              const statusClass = task.column === "Done" ? "status-done" : task.column === "In Progress" ? "status-progress" : task.column === "To Do" ? "status-todo" : "status-backlog";
              return `<tr class="${isCrit ? "critical" : ""}">
                <td>${task.name}</td>
                <td class="priority-${task.priority}">${task.priority}</td>
                <td class="${statusClass}">${task.column}</td>
                <td>${task.assignee}</td>
                <td>${new Date(task.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
                <td>${new Date(task.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</td>
                <td>${task.completionPercent}%</td>
                <td>${isCrit ? "Yes" : "-"}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
        <div class="legend">
          <span><span class="dot" style="background:#16a34a"></span> Done</span>
          <span><span class="dot" style="background:#2563eb"></span> In Progress</span>
          <span><span class="dot" style="background:#ca8a04"></span> To Do</span>
          <span><span class="dot" style="background:#6b7280"></span> Backlog</span>
          <span><span class="dot" style="background:#ef4444"></span> Critical Path</span>
        </div>
        <div class="footer">SolarLabX Project Management | Generated ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })} | Confidential</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  return (
    <div ref={ganttRef} className="rounded-lg border bg-card p-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Gantt Chart with Dependencies</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
            <span className="text-[10px] text-muted-foreground mr-2">Critical Path</span>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border bg-white text-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Gantt PDF
          </button>
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
