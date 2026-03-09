"use client";

import { Sprint, Task } from "@/lib/types/projects";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

interface SprintViewProps {
  sprints: Sprint[];
  tasks: Task[];
  velocityData: { sprint: string; planned: number; completed: number }[];
}

const sprintStatusColors: Record<string, string> = {
  Planning: "bg-gray-100 text-gray-700",
  Active: "bg-green-100 text-green-700",
  Completed: "bg-blue-100 text-blue-700",
};

export default function SprintView({ sprints, tasks, velocityData }: SprintViewProps) {
  const activeSprint = sprints.find((s) => s.status === "Active");

  const getSprintTasks = (sprintId: string) =>
    tasks.filter((t) => t.sprintId === sprintId);

  const getSprintProgress = (sprintId: string) => {
    const spTasks = getSprintTasks(sprintId);
    if (spTasks.length === 0) return 0;
    const done = spTasks.filter((t) => t.column === "Done").length;
    return Math.round((done / spTasks.length) * 100);
  };

  // Burndown data for active sprint
  const burndownData = activeSprint
    ? (() => {
        const spTasks = getSprintTasks(activeSprint.id);
        const totalPoints = spTasks.length;
        const sprintStart = new Date(activeSprint.startDate);
        const sprintEnd = new Date(activeSprint.endDate);
        const totalDays = Math.ceil((sprintEnd.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24));
        const today = new Date(2026, 2, 9);
        const elapsedDays = Math.min(
          totalDays,
          Math.ceil((today.getTime() - sprintStart.getTime()) / (1000 * 60 * 60 * 24))
        );
        const doneTasks = spTasks.filter((t) => t.column === "Done").length;

        return Array.from({ length: totalDays + 1 }, (_, i) => {
          const idealRemaining = totalPoints - (totalPoints * i) / totalDays;
          let actualRemaining: number | null = null;
          if (i <= elapsedDays) {
            // Simulate burndown
            const progress = i / elapsedDays;
            actualRemaining = totalPoints - Math.round(doneTasks * progress);
          }
          return {
            day: `Day ${i}`,
            ideal: Math.round(idealRemaining * 10) / 10,
            actual: actualRemaining,
          };
        });
      })()
    : [];

  return (
    <div className="space-y-6">
      {/* Sprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sprints.map((sprint) => {
          const spTasks = getSprintTasks(sprint.id);
          const progress = getSprintProgress(sprint.id);
          const doneTasks = spTasks.filter((t) => t.column === "Done").length;
          const inProgressTasks = spTasks.filter((t) => t.column === "In Progress").length;

          return (
            <Card key={sprint.id} className={cn(sprint.status === "Active" && "ring-2 ring-primary")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{sprint.name}</CardTitle>
                  <Badge className={cn("text-[10px]", sprintStatusColors[sprint.status])}>
                    {sprint.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(sprint.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - {new Date(sprint.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="h-2 mb-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground mb-3">
                  <span>{doneTasks}/{spTasks.length} tasks done</span>
                  <span>{inProgressTasks} in progress</span>
                </div>
                {sprint.goals.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-foreground">Goals:</p>
                    {sprint.goals.map((g, i) => (
                      <div key={i} className="flex items-start gap-1 text-[10px] text-muted-foreground">
                        <span className="mt-0.5 shrink-0">-</span>
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Velocity Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sprint Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sprint" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="planned" fill="hsl(var(--muted-foreground))" name="Planned" radius={[2, 2, 0, 0]} />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Burndown Chart */}
        {activeSprint && burndownData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Burndown - {activeSprint.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={burndownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="ideal" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Ideal" dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" name="Actual" strokeWidth={2} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
