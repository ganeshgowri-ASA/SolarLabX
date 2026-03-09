"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DetectionResultCard } from "@/components/vision/DetectionResultCard";
import {
  DefectTrendLineChart,
  DefectDistributionChart,
  generateSampleTrendData,
  generateSampleDistribution,
} from "@/components/vision/DefectTrendChart";
import { sampleDetectionResults } from "@/lib/mock-data";
import { useMemo } from "react";

export default function VisionAIDashboard() {
  const trendData = useMemo(() => generateSampleTrendData(), []);
  const distribution = useMemo(() => generateSampleDistribution(), []);

  const totalScans = sampleDetectionResults.length;
  const totalDefects = sampleDetectionResults.reduce((sum, r) => sum + r.defects.length, 0);
  const passRate = ((sampleDetectionResults.filter((r) => r.defects.length === 0).length / totalScans) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vision AI</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered defect detection for solar PV modules
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/vision-ai/detect">
            <Button>New Detection</Button>
          </Link>
          <Link href="/vision-ai/results">
            <Button variant="outline">View All Results</Button>
          </Link>
          <Link href="/vision-ai/analytics">
            <Button variant="outline">Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Scans</CardDescription>
            <CardTitle className="text-3xl">{totalScans}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Defects Found</CardDescription>
            <CardTitle className="text-3xl text-destructive">{totalDefects}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pass Rate</CardDescription>
            <CardTitle className="text-3xl text-green-600">{passRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">No defects detected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Model Accuracy</CardDescription>
            <CardTitle className="text-3xl">96.3%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Roboflow model mAP</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Defect Trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <DefectTrendLineChart data={trendData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Defect Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DefectDistributionChart data={distribution} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Scans</h2>
          <Link href="/vision-ai/results">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleDetectionResults.slice(0, 3).map((result) => (
            <DetectionResultCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </div>
  );
}
