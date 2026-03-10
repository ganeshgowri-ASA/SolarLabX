"use client";

import { useState } from "react";
import { projects, projectMetrics, teamMembers, projectTemplates } from "@/lib/data/projects-data";
import { KanbanColumn, Task } from "@/lib/types/projects";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KanbanBoard from "@/components/projects/KanbanBoard";
import GanttChart from "@/components/projects/GanttChart";
import SprintView from "@/components/projects/SprintView";
import ResourceView from "@/components/projects/ResourceView";
import ProjectDashboardWidgets from "@/components/projects/ProjectDashboardWidgets";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const statusStyles: Record<string, string> = {
  Planning: "bg-gray-100 text-gray-700",
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const priorityFilterOptions = ["All", "P0", "P1", "P2", "P3", "P4"];
const assigneeFilterOptions = ["All", ...Array.from(new Set(projects.flatMap((p) => p.tasks.map((t) => t.assignee))))];

export default function ProjectsDashboardClient() {
  const [selectedProject, setSelectedProject] = useState(projects[0].id);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [tasks, setTasks] = useState<Task[]>(() => {
    const project = projects.find((p) => p.id === selectedProject);
    return project ? [...project.tasks] : [];
  });

  const project = projects.find((p) => p.id === selectedProject)!;

  const handleProjectChange = (id: string) => {
    setSelectedProject(id);
    const p = projects.find((pr) => pr.id === id);
    if (p) setTasks([...p.tasks]);
  };

  const handleTaskMove = (taskId: string, newColumn: KanbanColumn) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, column: newColumn, completionPercent: newColumn === "Done" ? 100 : t.completionPercent }
          : t
      )
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== "All" && t.assignee !== assigneeFilter) return false;
    return true;
  });

  const activeProjects = projects.filter((p) => p.status === "Active");
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const avgCompletion = Math.round(
    activeProjects.reduce((sum, p) => sum + p.completionPercent, 0) / (activeProjects.length || 1)
  );
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter((t) => t.column === "Done").length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Management</h1>
          <p className="text-sm text-muted-foreground">Solar PV test campaign tracking and resource management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Project data exported successfully")}>
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </Button>
          <Button size="sm" onClick={() => toast.info("New project wizard coming soon")}>+ New Project</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Projects</p>
            <p className="text-2xl font-bold text-primary mt-1">{activeProjects.length}</p>
            <p className="text-xs text-muted-foreground">{projects.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Completion</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{avgCompletion}%</p>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Budget</p>
            <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalBudget)}</p>
            <p className="text-xs text-muted-foreground">{Math.round((totalSpent / totalBudget) * 100)}% utilized</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tasks</p>
            <p className="text-2xl font-bold text-foreground mt-1">{completedTasks}/{totalTasks}</p>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Team Members</p>
            <p className="text-2xl font-bold text-foreground mt-1">{teamMembers.length}</p>
            <p className="text-xs text-muted-foreground">{teamMembers.filter((m) => m.hoursLogged / m.hoursCapacity > 0.9).length} at capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Selector & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedProject} onValueChange={handleProjectChange}>
          <SelectTrigger className="w-[350px]">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", p.status === "Active" ? "bg-green-500" : p.status === "Planning" ? "bg-gray-400" : "bg-yellow-500")} />
                  {p.name.length > 40 ? p.name.slice(0, 40) + "..." : p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityFilterOptions.map((p) => (
              <SelectItem key={p} value={p}>{p === "All" ? "All Priorities" : p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            {assigneeFilterOptions.map((a) => (
              <SelectItem key={a} value={a}>{a === "All" ? "All Assignees" : a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge className={cn(statusStyles[project.status])}>{project.status}</Badge>
        <span className="text-xs text-muted-foreground">
          {project.testStandards.join(", ")}
        </span>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <KanbanBoard tasks={filteredTasks} onTaskMove={handleTaskMove} />
        </TabsContent>

        <TabsContent value="gantt">
          <GanttChart tasks={filteredTasks} projectStart={project.startDate} projectEnd={project.endDate} />
        </TabsContent>

        <TabsContent value="sprints">
          <SprintView
            sprints={project.sprints}
            tasks={tasks}
            velocityData={projectMetrics.velocityData}
          />
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-6">
            <ResourceView teamMembers={teamMembers} />

            {/* Resource Utilization Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Equipment Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={projectMetrics.resourceUtilization} layout="vertical" margin={{ left: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ProjectDashboardWidgets
            cycleTimeData={projectMetrics.cycleTimeData}
            throughputWeekly={projectMetrics.throughputWeekly}
          />
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectTemplates.map((tpl) => (
              <Card key={tpl.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tpl.standards.map((std) => (
                      <Badge key={std} variant="secondary" className="text-[10px]">{std}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{tpl.estimatedDuration}</span>
                    <span>{tpl.taskCount} tasks</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => toast.success(`Template "${tpl.name}" applied`)}>
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
