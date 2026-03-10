// @ts-nocheck
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import type { UncertaintyComponent } from "@/lib/uncertainty";

interface SensitivityAnalysisProps {
  components: UncertaintyComponent[];
}

export default function SensitivityAnalysis({ components }: SensitivityAnalysisProps) {
  const sorted = [...components].sort(
    (a, b) => b.percentageContribution - a.percentageContribution
  );

  const data = sorted.map((c) => ({
    name: c.name.length > 25 ? c.name.slice(0, 22) + "..." : c.name,
    fullName: c.name,
    contribution: parseFloat(c.percentageContribution.toFixed(2)),
    type: c.type,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 150, bottom: 10 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
            tick={{ fontSize: 11 }}
            label={{ value: "% Contribution to Combined Variance", position: "insideBottom", offset: -5, fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={140}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)}%`, "Contribution"]}
            labelFormatter={(label: string) => {
              const item = data.find((d) => d.name === label);
              return item ? `${item.fullName} (${item.type === "typeA" ? "Type A" : "Type B"})` : label;
            }}
          />
          <Legend
            payload={[
              { value: "Type A (Statistical)", type: "rect", color: "#3b82f6" },
              { value: "Type B (Other)", type: "rect", color: "#f97316" },
            ]}
          />
          <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.type === "typeA" ? "#3b82f6" : "#f97316"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
