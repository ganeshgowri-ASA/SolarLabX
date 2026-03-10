"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart,
} from "recharts";
import type { LinearityResult } from "@/lib/iec60904";

interface LinearityChartProps {
  result: LinearityResult;
  height?: number;
}

export default function LinearityChart({ result, height = 350 }: LinearityChartProps) {
  const chartData = result.normalizedData.map((d) => ({
    irradiance: d.irradiance,
    measured: d.normalizedIsc,
    fit: d.linearFit,
    deviation: d.deviation,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="irradiance" label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
        <YAxis label={{ value: "Normalized Isc", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => v.toFixed(4)} />
        <Legend />
        <Scatter dataKey="measured" fill="#2563eb" name="Measured" />
        <Line type="monotone" dataKey="fit" stroke="#dc2626" name="Linear Fit" dot={false} strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
