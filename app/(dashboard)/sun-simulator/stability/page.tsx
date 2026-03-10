// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ClassificationBadge from "@/components/sun-simulator/ClassificationBadge";
import StabilityTimeSeries from "@/components/sun-simulator/StabilityTimeSeries";
import {
  calculateTemporalStability,
  type TemporalStabilityResult,
} from "@/lib/sun-simulator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function generateSTISample(): string {
  const base = 1000;
  const vals: number[] = [];
  for (let i = 0; i < 50; i++) {
    vals.push(Math.round((base + (Math.random() - 0.5) * 6) * 100) / 100);
  }
  return vals.join(",");
}

function generateLTISample(): string {
  const base = 1000;
  const vals: number[] = [];
  for (let i = 0; i < 30; i++) {
    // Add a slight drift
    const drift = i * 0.02;
    vals.push(Math.round((base + drift + (Math.random() - 0.5) * 8) * 100) / 100);
  }
  return vals.join(",");
}

function rollingWindow(data: { time: number; irradiance: number }[], windowSize: number) {
  const results: { time: number; instability: number }[] = [];
  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    const vals = window.map((d) => d.irradiance);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const inst = (max + min) > 0 ? ((max - min) / (max + min)) * 100 : 0;
    results.push({ time: data[i + Math.floor(windowSize / 2)].time, instability: inst });
  }
  return results;
}

export default function StabilityPage() {
  const [stiText, setStiText] = useState(generateSTISample);
  const [ltiText, setLtiText] = useState(generateLTISample);
  const [result, setResult] = useState<TemporalStabilityResult | null>(null);

  function handleCalculate() {
    const stiVals = stiText.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    const ltiVals = ltiText.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    if (stiVals.length > 1 && ltiVals.length > 1) {
      setResult(
        calculateTemporalStability(
          stiVals.map((v, i) => ({ time: i * 0.1, irradiance: v })),
          ltiVals.map((v, i) => ({ time: i * 60, irradiance: v }))
        )
      );
    }
  }

  const stiRolling = result ? rollingWindow(result.stiData, Math.min(10, Math.max(3, Math.floor(result.stiData.length / 5)))) : [];
  const ltiRolling = result ? rollingWindow(result.ltiData, Math.min(8, Math.max(3, Math.floor(result.ltiData.length / 4)))) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Temporal Instability Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Short-term (STI) and long-term (LTI) temporal instability per IEC 60904-9 Ed.3
        </p>
      </div>

      {/* STI Input */}
      <Card>
        <CardHeader>
          <CardTitle>Short-Term Instability (STI)</CardTitle>
          <CardDescription>
            Irradiance measurements during a single flash or short measurement window (comma-separated W/m2 values)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>STI Irradiance Values</Label>
              <textarea
                className="w-full h-24 font-mono text-sm border rounded-md p-3 bg-background mt-1"
                value={stiText}
                onChange={(e) => setStiText(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => setStiText(generateSTISample())}>
            Generate Sample STI Data
          </Button>
        </CardContent>
      </Card>

      {/* LTI Input */}
      <Card>
        <CardHeader>
          <CardTitle>Long-Term Instability (LTI)</CardTitle>
          <CardDescription>
            Irradiance measurements over an extended period, typically hours (comma-separated W/m2 values)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>LTI Irradiance Values</Label>
              <textarea
                className="w-full h-24 font-mono text-sm border rounded-md p-3 bg-background mt-1"
                value={ltiText}
                onChange={(e) => setLtiText(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" onClick={() => setLtiText(generateLTISample())}>
            Generate Sample LTI Data
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleCalculate} size="lg">
        Analyze Temporal Stability
      </Button>

      {result && (
        <>
          {/* STI Results */}
          <Card>
            <CardHeader>
              <CardTitle>STI Time Series</CardTitle>
              <CardDescription>Short-term irradiance variation during measurement</CardDescription>
            </CardHeader>
            <CardContent>
              <StabilityTimeSeries
                data={result.stiData}
                instability={result.sti}
                grade={result.stiGrade}
              />
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <ClassificationBadge grade={result.stiGrade} size="md" label="STI Grade" />
                  <div>
                    <p className="text-lg font-bold">STI = {result.sti.toFixed(4)}%</p>
                    <p className="text-sm text-muted-foreground">
                      Threshold: A+ &le; 0.5%, A &le; 2%, B &le; 5%, C &le; 10%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LTI Results */}
          <Card>
            <CardHeader>
              <CardTitle>LTI Time Series</CardTitle>
              <CardDescription>Long-term irradiance variation over extended period</CardDescription>
            </CardHeader>
            <CardContent>
              <StabilityTimeSeries
                data={result.ltiData}
                instability={result.lti}
                grade={result.ltiGrade}
              />
              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <ClassificationBadge grade={result.ltiGrade} size="md" label="LTI Grade" />
                  <div>
                    <p className="text-lg font-bold">LTI = {result.lti.toFixed(4)}%</p>
                    <p className="text-sm text-muted-foreground">
                      Threshold: A+ &le; 1%, A &le; 2%, B &le; 5%, C &le; 10%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rolling Window Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">STI Rolling Window Instability</CardTitle>
                <CardDescription>Sliding window analysis of short-term variation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stiRolling} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="time"
                      label={{ value: "Time (s)", position: "insideBottom", offset: -5 }}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis label={{ value: "Instab. (%)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => v.toFixed(4) + "%"} labelFormatter={(v) => `t = ${Number(v).toFixed(1)}s`} />
                    <Line type="monotone" dataKey="instability" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Rolling STI" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">LTI Rolling Window Instability</CardTitle>
                <CardDescription>Sliding window analysis of long-term variation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={ltiRolling} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="time"
                      label={{ value: "Time (min)", position: "insideBottom", offset: -5 }}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => (v / 60).toFixed(0)}
                    />
                    <YAxis label={{ value: "Instab. (%)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => v.toFixed(4) + "%"} labelFormatter={(v) => `t = ${(Number(v) / 60).toFixed(0)} min`} />
                    <Line type="monotone" dataKey="instability" stroke="#f97316" strokeWidth={2} dot={false} name="Rolling LTI" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Overall Temporal Grade */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Temporal Classification</CardTitle>
              <CardDescription>Worst of STI and LTI grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-12 py-4">
                <ClassificationBadge grade={result.stiGrade} size="md" label="STI" />
                <span className="text-2xl text-muted-foreground">+</span>
                <ClassificationBadge grade={result.ltiGrade} size="md" label="LTI" />
                <span className="text-2xl text-muted-foreground">=</span>
                <ClassificationBadge grade={result.overallGrade} size="lg" label="Temporal Grade" />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
