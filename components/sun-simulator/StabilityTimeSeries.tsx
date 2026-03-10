// @ts-nocheck
"use client";

import { ClassificationGrade } from "@/lib/sun-simulator";
import ClassificationBadge from "./ClassificationBadge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  CartesianGrid,
  ComposedChart,
} from "recharts";

interface StabilityTimeSeriesProps {
  data: { time: number; irradiance: number }[];
  instability: number;
  grade: ClassificationGrade;
}

export default function StabilityTimeSeries({
  data,
  instability,
  grade,
}: StabilityTimeSeriesProps) {
  const values = data.map((d) => d.irradiance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const chartData = data.map((d) => ({
    ...d,
    upper: mean + (mean * instability) / 100,
    lower: mean - (mean * instability) / 100,
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="time"
            label={{ value: "Time (s)", position: "insideBottom", offset: -5 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={["auto", "auto"]}
            label={{ value: "Irradiance (W/m\u00b2)", angle: -90, position: "insideLeft" }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: number) => v.toFixed(2)}
            labelFormatter={(v) => `t = ${v}s`}
          />
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="rgba(239,68,68,0.1)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="white"
            fillOpacity={1}
          />
          <ReferenceLine y={max} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Max: ${max.toFixed(1)}`, fill: "#ef4444", fontSize: 10 }} />
          <ReferenceLine y={min} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `Min: ${min.toFixed(1)}`, fill: "#ef4444", fontSize: 10 }} />
          <ReferenceLine y={mean} stroke="#6b7280" strokeDasharray="2 2" label={{ value: `Mean: ${mean.toFixed(1)}`, fill: "#6b7280", fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="irradiance"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 2 }}
            name="Irradiance"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4">
        <ClassificationBadge grade={grade} size="sm" />
        <span className="text-sm font-medium">
          Instability: {instability.toFixed(3)}%
        </span>
      </div>
    </div>
  );
}
