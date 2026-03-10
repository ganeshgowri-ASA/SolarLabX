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
  ReferenceLine,
} from "recharts";
import type { UncertaintyComponent } from "@/lib/uncertainty";

interface TornadoChartProps {
  components: UncertaintyComponent[];
  measuredValue: number;
  combinedUncertainty: number;
}

export default function TornadoChart({ components, measuredValue, combinedUncertainty }: TornadoChartProps) {
  // For each component, show the effect of varying it by ±1 standard uncertainty
  const sorted = [...components].sort((a, b) => b.percentageContribution - a.percentageContribution);
  const top10 = sorted.slice(0, 10);

  const data = top10.map((c) => {
    const effect = c.sensitivityCoefficient * c.standardUncertainty;
    return {
      name: c.name.length > 30 ? c.name.slice(0, 27) + "..." : c.name,
      fullName: c.name,
      low: -effect,
      high: effect,
      pct: c.percentageContribution,
      type: c.type,
    };
  });

  const maxEffect = Math.max(...data.map((d) => Math.abs(d.high)), 0.001);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 160, bottom: 20 }}
        >
          <XAxis
            type="number"
            domain={[-maxEffect * 1.2, maxEffect * 1.2]}
            tickFormatter={(v: number) => v.toFixed(3)}
            tick={{ fontSize: 10 }}
            label={{ value: "Effect on measurand (±1σ)", position: "insideBottom", offset: -10, fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10 }}
            width={150}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${Math.abs(value).toFixed(4)}`,
              name === "low" ? "Negative effect" : "Positive effect",
            ]}
            labelFormatter={(label: string) => {
              const item = data.find((d) => d.name === label);
              return item ? `${item.fullName} (${item.pct.toFixed(1)}%)` : label;
            }}
          />
          <ReferenceLine x={0} stroke="#374151" strokeWidth={1} />
          <Bar dataKey="low" stackId="tornado" radius={[4, 0, 0, 4]}>
            {data.map((entry, i) => (
              <Cell key={`low-${i}`} fill={entry.type === "typeA" ? "#93c5fd" : "#fdba74"} />
            ))}
          </Bar>
          <Bar dataKey="high" stackId="tornado" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={`high-${i}`} fill={entry.type === "typeA" ? "#3b82f6" : "#f97316"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
