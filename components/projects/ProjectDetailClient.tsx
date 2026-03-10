// @ts-nocheck
"use client";

import Link from "next/link";
import { use } from "react";
import { projects } from "@/lib/data/projects-data";
import GanttChart from "@/components/projects/GanttChart";
import MilestoneTracker from "@/components/projects/MilestoneTracker";
import ResourceAllocationView from "@/components/projects/ResourceAllocation";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Planning: "bg-gray-100 text-gray-700",
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const columnStatusStyles: Record<string, string> = {
  Backlog: "bg-gray-100 text-gray-600",
  "To Do": "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Review: "bg-purple-100 text-purple-700",
  Done: "bg-green-100 text-green-700",
};

const priorityStyles: Record<string, string> = {
  P0: "bg-red-100 text-red-700",
  P1: "bg-orange-100 text-orange-700",
  P2: "bg-yellow-100 text-yellow-700",
  P3: "bg-blue-100 text-blue-700",
  P4: "bg-gray-100 text-gray-600",
};

export default function ProjectDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <h2 className="text-lg font-semibold text-foreground">Project not found</h2>
        <Link href="/projects" className="text-primary hover:underline mt-2 inline-block">Back to Projects</Link>
      </div>
    );
  }

  const budgetPct = Math.round((project.spent / project.budget) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/projects" className="text-sm text-primary hover:underline">&larr; Back to Projects</Link>
          <h1 className="text-2xl font-bold text-foreground mt-1">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{project.id}</span>
            <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", statusStyles[project.status])}>{project.status}</span>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Client</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">{project.client}</p>
          <p className="text-xs text-muted-foreground mt-1">{project.clientContact}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Timeline</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">PM: {project.projectManager}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Completion</p>
          <p className="text-2xl font-bold text-primary mt-0.5">{project.completionPercent}%</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary rounded-full" style={{ width: `${project.completionPercent}%` }} />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="text-sm font-semibold text-foreground mt-0.5">
            {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
          </p>
          <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className={cn("h-full rounded-full", budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-yellow-500" : "bg-green-500")}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{budgetPct}% utilized</p>
        </div>
      </div>

      {/* Test Standards */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-2">Test Standards</h2>
        <div className="flex flex-wrap gap-2">
          {project.testStandards.map((std) => (
            <span key={std} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">{std}</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">{project.description}</p>
      </div>

      {/* Samples */}
      {project.samples.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Test Samples</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {project.samples.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 text-sm font-mono text-muted-foreground">{s.id}</td>
                    <td className="px-3 py-2 text-sm text-foreground">{s.name}</td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">{s.type}</td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">{s.quantity}</td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">{formatDate(s.receivedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      {project.tasks.length > 0 && (
        <GanttChart
          tasks={project.tasks}
          projectStart={project.startDate}
          projectEnd={project.endDate}
          projectName={project.name}
          projectManager={project.projectManager}
          completionPercent={project.completionPercent}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {project.milestones.length > 0 && (
          <MilestoneTracker milestones={project.milestones} />
        )}
        {project.resources.length > 0 && (
          <ResourceAllocationView resources={project.resources} />
        )}
      </div>

      {/* Tasks Table */}
      {project.tasks.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Task Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Task</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Assignee</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {project.tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-muted/50">
                    <td className="px-3 py-2 text-sm text-foreground">{task.name}</td>
                    <td className="px-3 py-2">
                      <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", columnStatusStyles[task.column])}>{task.column}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", priorityStyles[task.priority])}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-muted-foreground">{task.assignee}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{task.timeSpent}h / {task.timeEstimate}h</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${task.completionPercent}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{task.completionPercent}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
