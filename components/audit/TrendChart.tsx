// @ts-nocheck
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

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

export function FindingsTrendChart({ data }: { data: FindingData[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Findings by Severity (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="major" name="Major NC" fill="#ef4444" stackId="a" />
          <Bar dataKey="minor" name="Minor NC" fill="#f97316" stackId="a" />
          <Bar dataKey="ofi" name="OFI" fill="#3b82f6" stackId="a" />
          <Bar dataKey="obs" name="Observation" fill="#9ca3af" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClosureRateChart({ data }: { data: ClosureData[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Finding Closure Rate</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="opened" name="Opened" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="closed" name="Closed" stroke="#22c55e" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
