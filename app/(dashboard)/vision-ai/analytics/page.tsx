// @ts-nocheck
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DefectTrendLineChart,
  DefectDistributionChart,
  DefectTypeBarChart,
  generateSampleTrendData,
  generateSampleDistribution,
} from "@/components/vision/DefectTrendChart";
import { sampleDetectionResults } from "@/lib/mock-data";
import { DEFECT_TYPES, SEVERITY_LEVELS } from "@/lib/constants";

export default function AnalyticsPage() {
  const trendData = useMemo(() => generateSampleTrendData(), []);
  const distribution = useMemo(() => generateSampleDistribution(), []);

  // Compute analytics from sample data
  const totalScans = sampleDetectionResults.length;
  const totalDefects = sampleDetectionResults.reduce((sum, r) => sum + r.defects.length, 0);
  const avgDefectsPerScan = totalScans > 0 ? (totalDefects / totalScans).toFixed(1) : "0";

  const allDefects = sampleDetectionResults.flatMap((r) => r.defects);
  const avgConfidence = allDefects.length > 0
    ? (allDefects.reduce((sum, d) => sum + d.confidence, 0) / allDefects.length * 100).toFixed(1)
    : "0";

  const severityCounts = allDefects.reduce((acc, d) => {
    const dt = DEFECT_TYPES.find((t) => t.id === d.class);
    const sev = dt?.severity || "minor";
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const inspectionTypeCounts = sampleDetectionResults.reduce((acc, r) => {
    acc[r.inspectionType] = (acc[r.inspectionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const yieldRate = ((sampleDetectionResults.filter((r) => {
    return !r.defects.some((d) => {
      const dt = DEFECT_TYPES.find((t) => t.id === d.class);
      return dt?.severity === "critical";
    });
  }).length / totalScans) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Defect Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive defect trend analysis, yield metrics, and quality insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Scans</CardDescription>
            <CardTitle className="text-2xl">{totalScans}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Defects</CardDescription>
            <CardTitle className="text-2xl text-destructive">{totalDefects}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Defects/Scan</CardDescription>
            <CardTitle className="text-2xl">{avgDefectsPerScan}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Confidence</CardDescription>
            <CardTitle className="text-2xl">{avgConfidence}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Yield Rate</CardDescription>
            <CardTitle className="text-2xl text-green-600">{yieldRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">No critical defects</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Defect Rate Over Time (30 Days)</CardTitle>
          <CardDescription>Daily defect counts by severity level</CardDescription>
        </CardHeader>
        <CardContent>
          <DefectTrendLineChart data={trendData} />
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Defect Types</CardTitle>
            <CardDescription>Distribution of defect classes</CardDescription>
          </CardHeader>
          <CardContent>
            <DefectTypeBarChart data={distribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Defect Distribution</CardTitle>
            <CardDescription>Proportional breakdown by type</CardDescription>
          </CardHeader>
          <CardContent>
            <DefectDistributionChart data={distribution} />
          </CardContent>
        </Card>
      </div>

      {/* Severity & Inspection Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(SEVERITY_LEVELS).map(([key, info]) => {
                const count = severityCounts[key] || 0;
                const pct = totalDefects > 0 ? (count / totalDefects) * 100 : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: info.color }}>{info.label}</span>
                      <span className="font-medium">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: info.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inspection Type Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(inspectionTypeCounts).map(([type, count]) => {
                const pct = (count / totalScans) * 100;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="uppercase font-medium">{type}</span>
                      <span>{count} scans ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
