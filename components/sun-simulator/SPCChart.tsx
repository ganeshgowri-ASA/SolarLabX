"use client";

import { SPCResult } from "@/lib/sun-simulator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface SPCChartProps {
  result: SPCResult;
  type: "xbar" | "range";
}

export default function SPCChart({ result, type }: SPCChartProps) {
  const isXbar = type === "xbar";
  const values = isXbar ? result.xBar : result.range;
  const ucl = isXbar ? result.xBarUCL : result.rUCL;
  const lcl = isXbar ? result.xBarLCL : result.rLCL;
  const center = isXbar ? result.xBarMean : result.rMean;

  const chartData = values.map((v, i) => ({
    subgroup: result.subgroups[i],
    value: v,
    outOfControl: v > ucl || v < lcl,
  }));

  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">
        {isXbar ? "X-bar Chart" : "R Chart"}
      </h4>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="subgroup"
            label={{ value: "Subgroup", position: "insideBottom", offset: -5 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => v.toFixed(4)} />
          <ReferenceLine
            y={ucl}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{ value: `UCL: ${ucl.toFixed(3)}`, fill: "#ef4444", fontSize: 10, position: "right" }}
          />
          <ReferenceLine
            y={lcl}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{ value: `LCL: ${lcl.toFixed(3)}`, fill: "#ef4444", fontSize: 10, position: "right" }}
          />
          <ReferenceLine
            y={center}
            stroke="#16a34a"
            strokeDasharray="3 3"
            label={{ value: `CL: ${center.toFixed(3)}`, fill: "#16a34a", fontSize: 10, position: "right" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.outOfControl) {
                return (
                  <circle
                    key={`dot-${payload.subgroup}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#ef4444"
                    stroke="#ef4444"
                  />
                );
              }
              return (
                <circle
                  key={`dot-${payload.subgroup}`}
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill="#2563eb"
                  stroke="#2563eb"
                />
              );
            }}
            name={isXbar ? "X-bar" : "Range"}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
