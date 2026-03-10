// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ProjectDashboardWidgetsProps {
  cycleTimeData: { task: string; days: number; category: string }[];
  throughputWeekly: { week: string; completed: number }[];
}

const categoryColors: Record<string, string> = {
  Characterization: "#8b5cf6",
  Measurement: "#3b82f6",
  Environmental: "#ef4444",
  Mechanical: "#f59e0b",
  Safety: "#ec4899",
};

export default function ProjectDashboardWidgets({ cycleTimeData, throughputWeekly }: ProjectDashboardWidgetsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Cycle Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Average Cycle Time (Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cycleTimeData} layout="vertical" margin={{ left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="task" tick={{ fontSize: 10 }} width={70} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="days" name="Days" radius={[0, 2, 2, 0]}>
                {cycleTimeData.map((entry, idx) => (
                  <Cell key={idx} fill={categoryColors[entry.category] || "#6b7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Throughput */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Weekly Throughput (Tasks Completed)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={throughputWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
