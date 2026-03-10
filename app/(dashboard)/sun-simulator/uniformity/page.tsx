// @ts-nocheck
"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ClassificationBadge from "@/components/sun-simulator/ClassificationBadge";
import UniformityHeatmap from "@/components/sun-simulator/UniformityHeatmap";
import { calculateUniformity, type UniformityResult } from "@/lib/sun-simulator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

function generateGrid(rows: number, cols: number): number[][] {
  const grid: number[][] = [];
  const cr = (rows - 1) / 2;
  const cc = (cols - 1) / 2;
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const dist = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2);
      const maxDist = Math.sqrt(cr ** 2 + cc ** 2);
      const dropoff = 1 - 0.03 * (dist / maxDist);
      row.push(Math.round((1000 * dropoff + (Math.random() - 0.5) * 6) * 10) / 10);
    }
    grid.push(row);
  }
  return grid;
}

export default function UniformityPage() {
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(8);
  const [grid, setGrid] = useState<number[][]>(() => generateGrid(8, 8));
  const [result, setResult] = useState<UniformityResult | null>(null);

  const handleGenerate = useCallback(() => {
    const newGrid = generateGrid(rows, cols);
    setGrid(newGrid);
    setResult(null);
  }, [rows, cols]);

  function handleCalculate() {
    setResult(calculateUniformity(grid));
  }

  // Row and column profiles
  const rowProfile = grid.map((row, i) => ({
    index: i + 1,
    mean: row.reduce((a, b) => a + b, 0) / row.length,
  }));

  const colProfile = grid[0]
    ? grid[0].map((_, ci) => ({
        index: ci + 1,
        mean: grid.reduce((sum, row) => sum + row[ci], 0) / grid.length,
      }))
    : [];

  const globalMean = result?.mean ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Spatial Non-Uniformity Mapping</h1>
        <p className="text-muted-foreground mt-1">
          Measure and visualize irradiance distribution across the test plane per IEC 60904-9
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Grid Configuration</CardTitle>
          <CardDescription>Set grid dimensions and generate sample irradiance data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div>
              <Label>Rows (3-15)</Label>
              <Input
                type="number"
                min={3}
                max={15}
                value={rows}
                onChange={(e) => setRows(Math.max(3, Math.min(15, parseInt(e.target.value) || 3)))}
                className="w-24"
              />
            </div>
            <div>
              <Label>Cols (3-15)</Label>
              <Input
                type="number"
                min={3}
                max={15}
                value={cols}
                onChange={(e) => setCols(Math.max(3, Math.min(15, parseInt(e.target.value) || 3)))}
                className="w-24"
              />
            </div>
            <Button onClick={handleGenerate} variant="outline">
              Generate Random Sample Data
            </Button>
            <Button onClick={handleCalculate}>Calculate Uniformity</Button>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Irradiance Heatmap</CardTitle>
          <CardDescription>
            Color-coded spatial distribution of irradiance. Green = high, Red = low relative to mean.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <UniformityHeatmap grid={grid} stats={result} />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Click &quot;Calculate Uniformity&quot; to see the heatmap visualization.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Uniformity Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-8">
              <ClassificationBadge grade={result.grade} size="lg" label="Uniformity Grade" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Non-Uniformity</p>
                  <p className="text-2xl font-bold">{result.nonUniformity.toFixed(3)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mean Irradiance</p>
                  <p className="text-2xl font-bold">{result.mean.toFixed(1)} W/m2</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Std. Deviation</p>
                  <p className="text-2xl font-bold">{result.std.toFixed(2)} W/m2</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Min</p>
                  <p className="text-lg font-semibold text-red-600">{result.min.toFixed(1)} W/m2</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max</p>
                  <p className="text-lg font-semibold text-blue-600">{result.max.toFixed(1)} W/m2</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CV%</p>
                  <p className="text-lg font-semibold">{result.cv.toFixed(3)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row / Column Profiles */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Row Profile</CardTitle>
              <CardDescription>Mean irradiance per row</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={rowProfile} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="index"
                    label={{ value: "Row", position: "insideBottom", offset: -5 }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v.toFixed(2)} />
                  <ReferenceLine y={globalMean} stroke="#6b7280" strokeDasharray="3 3" label={{ value: `Mean: ${globalMean.toFixed(1)}`, fill: "#6b7280", fontSize: 10 }} />
                  <Line type="monotone" dataKey="mean" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Row Mean" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Column Profile</CardTitle>
              <CardDescription>Mean irradiance per column</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={colProfile} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="index"
                    label={{ value: "Column", position: "insideBottom", offset: -5 }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v.toFixed(2)} />
                  <ReferenceLine y={globalMean} stroke="#6b7280" strokeDasharray="3 3" label={{ value: `Mean: ${globalMean.toFixed(1)}`, fill: "#6b7280", fontSize: 10 }} />
                  <Line type="monotone" dataKey="mean" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="Col Mean" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
