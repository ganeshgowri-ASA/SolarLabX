"use client";

import { projects, projectMetrics } from "@/lib/data/projects-data";
import ProjectCard from "@/components/projects/ProjectCard";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ProjectsDashboard() {
  const activeProjects = projects.filter((p) => p.status === "Active");
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const avgCompletion = Math.round(
    activeProjects.reduce((sum, p) => sum + p.completionPercent, 0) / (activeProjects.length || 1)
  );

  const barColors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
        <a href="/projects/new" className="btn-primary text-sm">+ New Project</a>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active Projects</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{activeProjects.length}</p>
          <p className="text-xs text-gray-400 mt-1">{projects.length} total</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Completion</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{avgCompletion}%</p>
          <p className="text-xs text-gray-400 mt-1">Active projects</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Budget</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalBudget)}</p>
          <p className="text-xs text-gray-400 mt-1">Across all projects</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Budget Spent</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-400 mt-1">{Math.round((totalSpent / totalBudget) * 100)}% utilized</p>
        </div>
      </div>

      {/* Resource Utilization Chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Resource Utilization</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={projectMetrics.resourceUtilization} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
            <Tooltip />
            <Bar dataKey="utilization" name="Utilization %">
              {projectMetrics.resourceUtilization.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.utilization >= 90 ? "#ef4444" : entry.utilization >= 70 ? "#f59e0b" : "#22c55e"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Project Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">All Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
