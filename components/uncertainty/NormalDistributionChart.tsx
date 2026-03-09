"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface NormalDistributionChartProps {
  mean: number;
  uncertainty: number;
  coverageFactor: number;
}

function normalPDF(x: number, mu: number, sigma: number): number {
  if (sigma === 0) return x === mu ? 1 : 0;
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

export default function NormalDistributionChart({
  mean,
  uncertainty,
  coverageFactor,
}: NormalDistributionChartProps) {
  const sigma = coverageFactor > 0 ? uncertainty / coverageFactor : uncertainty / 2;

  const data = useMemo(() => {
    const points: { x: number; y: number; inRange: number }[] = [];
    const range = 4 * (sigma || 1);
    const step = range / 50;
    const lower = mean - uncertainty;
    const upper = mean + uncertainty;

    for (let i = -50; i <= 50; i++) {
      const x = mean + i * step;
      const y = normalPDF(x, mean, sigma || 0.001);
      const inRange = x >= lower && x <= upper ? y : 0;
      points.push({
        x: parseFloat(x.toPrecision(6)),
        y: parseFloat(y.toPrecision(6)),
        inRange: parseFloat(inRange.toPrecision(6)),
      });
    }
    return points;
  }, [mean, uncertainty, sigma]);

  const lower = mean - uncertainty;
  const upper = mean + uncertainty;

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="x"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v: number) => v.toPrecision(4)}
            tick={{ fontSize: 11 }}
            label={{ value: "Measurand Value", position: "insideBottom", offset: -10, fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v: number) => v.toFixed(3)}
            tick={{ fontSize: 11 }}
            label={{ value: "Probability Density", angle: -90, position: "insideLeft", offset: 0, fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => value.toFixed(6)}
            labelFormatter={(label: number) => `x = ${label}`}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke="#94a3b8"
            fill="#e2e8f0"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="inRange"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.5}
          />
          <ReferenceLine
            x={mean}
            stroke="#1e40af"
            strokeWidth={2}
            strokeDasharray="4 4"
            label={{ value: "Mean", position: "top", fontSize: 11, fill: "#1e40af" }}
          />
          <ReferenceLine
            x={parseFloat(lower.toPrecision(6))}
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            label={{ value: "-U", position: "top", fontSize: 10, fill: "#dc2626" }}
          />
          <ReferenceLine
            x={parseFloat(upper.toPrecision(6))}
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            label={{ value: "+U", position: "top", fontSize: 10, fill: "#dc2626" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
