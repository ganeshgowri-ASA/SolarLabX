// @ts-nocheck
"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { DEFECT_TYPES } from "@/lib/constants";

interface TrendDataPoint {
  date: string;
  total: number;
  critical: number;
  major: number;
  minor: number;
}

interface DefectDistribution {
  name: string;
  count: number;
  color: string;
}

export function DefectTrendLineChart({ data }: { data: TrendDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis fontSize={12} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total Defects" />
        <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
        <Line type="monotone" dataKey="major" stroke="#f97316" strokeWidth={2} name="Major" />
        <Line type="monotone" dataKey="minor" stroke="#eab308" strokeWidth={2} name="Minor" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DefectDistributionChart({ data }: { data: DefectDistribution[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="count"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DefectTypeBarChart({ data }: { data: DefectDistribution[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" fontSize={12} />
        <YAxis type="category" dataKey="name" width={150} fontSize={12} />
        <Tooltip />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Generate sample trend data for demonstration
export function generateSampleTrendData(): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const critical = Math.floor(Math.random() * 5);
    const major = Math.floor(Math.random() * 8);
    const minor = Math.floor(Math.random() * 6);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: critical + major + minor,
      critical,
      major,
      minor,
    });
  }
  return data;
}

export function generateSampleDistribution(): DefectDistribution[] {
  return DEFECT_TYPES.slice(0, 6).map((dt) => ({
    name: dt.label,
    count: Math.floor(Math.random() * 50) + 5,
    color: dt.color,
  }));
}
