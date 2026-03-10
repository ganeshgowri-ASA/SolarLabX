"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ComposedChart,
} from "recharts";

interface FindingData {
  month: string;
  major: number;
  minor: number;
  ofi: number;
  obs: number;
}

interface ClosureData {
  month: string;
  opened: number;
  closed: number;
  rate: number;
}

interface DepartmentData {
  department: string;
  majorNC: number;
  minorNC: number;
  observation: number;
  ofi: number;
  total: number;
}

interface RecurrenceItem {
  finding: string;
  occurrences: number;
  riskLevel: string;
}

const SEVERITY_COLORS = {
  major: "#ef4444",
  minor: "#f97316",
  ofi: "#3b82f6",
  obs: "#9ca3af",
};

// Stacked bar chart for monthly severity trend
export function FindingsTrendChart({ data }: { data: FindingData[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Findings Trend (Stacked Bar)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="major" name="Major NC" fill={SEVERITY_COLORS.major} stackId="a" />
          <Bar dataKey="minor" name="Minor NC" fill={SEVERITY_COLORS.minor} stackId="a" />
          <Bar dataKey="ofi" name="OFI" fill={SEVERITY_COLORS.ofi} stackId="a" />
          <Bar dataKey="obs" name="Observation" fill={SEVERITY_COLORS.obs} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Grouped bar chart for closure rate comparison
export function ClosureRateChart({ data }: { data: ClosureData[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Finding Closure Rate (Grouped Bar)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="%" />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="opened" name="Opened" fill="#ef4444" barSize={20} />
          <Bar yAxisId="left" dataKey="closed" name="Closed" fill="#22c55e" barSize={20} />
          <Line yAxisId="right" type="monotone" dataKey="rate" name="Closure %" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Horizontal bar chart for findings by department
export function DepartmentFindingsChart({ data }: { data: DepartmentData[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Findings by Department (Horizontal Bar)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} width={95} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="majorNC" name="Major NC" fill={SEVERITY_COLORS.major} stackId="dept" />
          <Bar dataKey="minorNC" name="Minor NC" fill={SEVERITY_COLORS.minor} stackId="dept" />
          <Bar dataKey="observation" name="Observation" fill="#eab308" stackId="dept" />
          <Bar dataKey="ofi" name="OFI" fill={SEVERITY_COLORS.ofi} stackId="dept" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Pareto chart for finding types
export function FindingTypePareto({ data }: { data: DepartmentData[] }) {
  // Aggregate totals by type across all departments
  const typeData = [
    { type: "Minor NC", count: data.reduce((s, d) => s + d.minorNC, 0) },
    { type: "Major NC", count: data.reduce((s, d) => s + d.majorNC, 0) },
    { type: "Observation", count: data.reduce((s, d) => s + d.observation, 0) },
    { type: "OFI", count: data.reduce((s, d) => s + d.ofi, 0) },
  ].sort((a, b) => b.count - a.count);

  const grandTotal = typeData.reduce((s, d) => s + d.count, 0);
  let cumulative = 0;
  const paretoData = typeData.map((d) => {
    cumulative += d.count;
    return { ...d, cumPct: Math.round((cumulative / grandTotal) * 100) };
  });

  const barColors = {
    "Major NC": SEVERITY_COLORS.major,
    "Minor NC": SEVERITY_COLORS.minor,
    OFI: SEVERITY_COLORS.ofi,
    Observation: "#eab308",
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Finding Type Pareto Analysis</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={paretoData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="type" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="count" name="Count">
            {paretoData.map((entry, idx) => (
              <Cell key={idx} fill={barColors[entry.type as keyof typeof barColors] || "#6b7280"} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="cumPct" name="Cumulative %" stroke="#1e40af" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Stacked bar chart for recurrence analysis
export function RecurrenceChart({ data }: { data: RecurrenceItem[] }) {
  const riskColors: Record<string, string> = {
    High: "#ef4444",
    Medium: "#eab308",
    Low: "#22c55e",
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recurrence Analysis</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="finding"
            tick={{ fontSize: 10 }}
            width={180}
          />
          <Tooltip />
          <Bar dataKey="occurrences" name="Occurrences">
            {data.map((entry, idx) => (
              <Cell key={idx} fill={riskColors[entry.riskLevel] || "#6b7280"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> High Risk</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> Medium Risk</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Low Risk</span>
      </div>
    </div>
  );
}
