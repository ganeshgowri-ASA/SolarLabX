"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import type { MonteCarloResult } from "@/lib/uncertainty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonteCarloChartProps {
  result: MonteCarloResult;
  measuredValue: number;
  measurand: string;
  unit: string;
}

export default function MonteCarloChart({ result, measuredValue, measurand, unit }: MonteCarloChartProps) {
  const maxCount = Math.max(...result.histogram.map((h) => h.count));

  return (
    <div className="space-y-6">
      {/* Histogram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monte Carlo Distribution ({result.iterations.toLocaleString()} iterations)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-4 text-sm">
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <div className="text-xs text-muted-foreground">MC Mean</div>
              <div className="font-mono font-semibold">{result.mean.toFixed(4)}</div>
            </div>
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <div className="text-xs text-muted-foreground">MC Std Dev</div>
              <div className="font-mono font-semibold">{result.standardDeviation.toFixed(4)}</div>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="text-xs text-muted-foreground">95% CI Lower</div>
              <div className="font-mono font-semibold">{result.percentile2_5.toFixed(4)}</div>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <div className="text-xs text-muted-foreground">95% CI Upper</div>
              <div className="font-mono font-semibold">{result.percentile97_5.toFixed(4)}</div>
            </div>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.histogram} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
                <XAxis
                  dataKey="bin"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v: number) => v.toPrecision(4)}
                  tick={{ fontSize: 10 }}
                  label={{ value: `${measurand} (${unit})`, position: "insideBottom", offset: -15, fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Frequency", angle: -90, position: "insideLeft", offset: 0, fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number) => [value, "Count"]}
                  labelFormatter={(v: number) => `${measurand}: ${Number(v).toPrecision(5)} ${unit}`}
                />
                <ReferenceLine
                  x={measuredValue}
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{ value: "Measured", position: "top", fontSize: 10, fill: "#dc2626" }}
                />
                <ReferenceLine
                  x={result.percentile2_5}
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{ value: "2.5%", position: "top", fontSize: 9, fill: "#16a34a" }}
                />
                <ReferenceLine
                  x={result.percentile97_5}
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{ value: "97.5%", position: "top", fontSize: 9, fill: "#16a34a" }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {result.histogram.map((entry, index) => {
                    const inRange =
                      entry.bin >= result.percentile2_5 && entry.bin <= result.percentile97_5;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={inRange ? "#3b82f6" : "#94a3b8"}
                        opacity={inRange ? 0.8 : 0.4}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Convergence plot */}
      {result.convergenceData.length > 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monte Carlo Convergence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.convergenceData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="iteration"
                    tick={{ fontSize: 10 }}
                    label={{ value: "Iterations", position: "insideBottom", offset: -10, fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    domain={["auto", "auto"]}
                    label={{ value: "Running Mean", angle: -90, position: "insideLeft", offset: 0, fontSize: 11 }}
                  />
                  <Tooltip formatter={(value: number) => value.toFixed(4)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="runningMean"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Running Mean"
                  />
                  <ReferenceLine
                    y={measuredValue}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: "Measured", fontSize: 10 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
