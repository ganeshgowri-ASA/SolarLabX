"use client";

import Link from "next/link";
import { projects } from "@/lib/data/projects-data";
import GanttChart from "@/components/projects/GanttChart";
import MilestoneTracker from "@/components/projects/MilestoneTracker";
import ResourceAllocationView from "@/components/projects/ResourceAllocation";
import { formatDate, formatCurrency, cn } from "@/lib/utils";
import { use } from "react";

const statusStyles: Record<string, string> = {
  Planning: "bg-gray-100 text-gray-700",
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const taskStatusStyles: Record<string, string> = {
  "Not Started": "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Blocked: "bg-red-100 text-red-700",
  Overdue: "bg-red-100 text-red-800",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-lg font-semibold text-gray-900">Project not found</h2>
        <Link href="/projects" className="text-primary-600 hover:underline mt-2 inline-block">Back to Projects</Link>
      </div>
    );
  }

  const budgetPct = Math.round((project.spent / project.budget) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/projects" className="text-sm text-primary-600 hover:underline">&larr; Back to Projects</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{project.id}</span>
            <span className={cn("badge", statusStyles[project.status])}>{project.status}</span>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500">Client</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{project.client}</p>
          <p className="text-xs text-gray-500 mt-1">{project.clientContact}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Timeline</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </p>
          <p className="text-xs text-gray-500 mt-1">PM: {project.projectManager}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Completion</p>
          <p className="text-2xl font-bold text-primary-600 mt-0.5">{project.completionPercent}%</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${project.completionPercent}%` }} />
          </div>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Budget</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
          </p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div
              className={cn("h-full rounded-full", budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-yellow-500" : "bg-green-500")}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{budgetPct}% utilized</p>
        </div>
      </div>

      {/* Test Standards */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Test Standards</h2>
        <div className="flex flex-wrap gap-2">
          {project.testStandards.map((std) => (
            <span key={std} className="badge bg-primary-50 text-primary-700 px-3 py-1">{std}</span>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">{project.description}</p>
      </div>

      {/* Samples */}
      {project.samples.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Test Samples</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {project.samples.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 text-sm font-mono text-gray-600">{s.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{s.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{s.type}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{s.quantity}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{formatDate(s.receivedDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      {project.tasks.length > 0 && (
        <GanttChart tasks={project.tasks} projectStart={project.startDate} projectEnd={project.endDate} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        {project.milestones.length > 0 && (
          <MilestoneTracker milestones={project.milestones} />
        )}

        {/* Resources */}
        {project.resources.length > 0 && (
          <ResourceAllocationView resources={project.resources} />
        )}
      </div>

      {/* Tasks Table */}
      {project.tasks.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Task Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {project.tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">{task.name}</td>
                    <td className="px-3 py-2">
                      <span className={cn("badge", taskStatusStyles[task.status])}>{task.status}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("badge",
                        task.priority === "Critical" ? "bg-red-100 text-red-700" :
                        task.priority === "High" ? "bg-orange-100 text-orange-700" :
                        task.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      )}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">{task.assignee}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{formatDate(task.startDate)}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{formatDate(task.endDate)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${task.completionPercent}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{task.completionPercent}%</span>
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
