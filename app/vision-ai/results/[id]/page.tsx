"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DefectClassBadge } from "@/components/vision/DefectClassBadge";
import { ConfidenceBar } from "@/components/vision/ConfidenceBar";
import { DefectOverlay } from "@/components/vision/DefectOverlay";
import { sampleDetectionResults } from "@/lib/mock-data";
import { DEFECT_TYPES, SEVERITY_LEVELS } from "@/lib/constants";

export default function DetectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const result = sampleDetectionResults.find((r) => r.id === id);

  if (!result) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Detection Not Found</h1>
        <p className="text-muted-foreground mt-2">The detection result with ID &quot;{id}&quot; was not found.</p>
        <Link href="/vision-ai/results">
          <Button className="mt-4">Back to Results</Button>
        </Link>
      </div>
    );
  }

  const defectSummary = result.defects.reduce(
    (acc, d) => {
      acc[d.class] = (acc[d.class] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const severityCounts = result.defects.reduce(
    (acc, d) => {
      const dt = DEFECT_TYPES.find((t) => t.id === d.class);
      const sev = dt?.severity || "minor";
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{result.imageName}</h1>
            <Badge variant={result.status === "completed" ? "default" : "secondary"}>
              {result.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span>Module: {result.moduleId}</span>
            <span>Type: {result.inspectionType.toUpperCase()}</span>
            <span>Date: {result.date}</span>
          </div>
        </div>
        <Link href="/vision-ai/results">
          <Button variant="outline">Back to Results</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Annotated Image */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Annotated Image</CardTitle>
              <CardDescription>
                {result.defects.length} defect{result.defects.length !== 1 ? "s" : ""} detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.imageUrl ? (
                <DefectOverlay imageSrc={result.imageUrl} detections={result.defects} />
              ) : (
                <div className="bg-muted rounded-lg h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p className="font-medium">Image Preview</p>
                    <p className="text-sm mt-1">
                      {result.defects.length} defect{result.defects.length !== 1 ? "s" : ""} found in {result.inspectionType.toUpperCase()} image
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details Panel */}
        <div className="space-y-6">
          {/* Severity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(SEVERITY_LEVELS).map(([key, info]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: info.color }}>
                      {info.label}
                    </span>
                    <span className="font-bold text-lg">{severityCounts[key] || 0}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Defect Types Found */}
          <Card>
            <CardHeader>
              <CardTitle>Defect Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(defectSummary).map(([cls, count]) => (
                  <div key={cls} className="flex items-center justify-between">
                    <DefectClassBadge defectClass={cls} showSeverity={false} />
                    <span className="text-sm font-medium">{count}x</span>
                  </div>
                ))}
                {result.defects.length === 0 && (
                  <p className="text-sm text-green-600 font-medium">No defects detected - Module passed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Individual Defect Details */}
      {result.defects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Defect Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">#</th>
                    <th className="text-left py-3 px-4 font-medium">Defect Class</th>
                    <th className="text-left py-3 px-4 font-medium">Confidence</th>
                    <th className="text-left py-3 px-4 font-medium">Location (x, y)</th>
                    <th className="text-left py-3 px-4 font-medium">Size (w x h)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.defects.map((det, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 px-4">{i + 1}</td>
                      <td className="py-3 px-4">
                        <DefectClassBadge defectClass={det.class} />
                      </td>
                      <td className="py-3 px-4 w-48">
                        <ConfidenceBar confidence={det.confidence} />
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        ({Math.round(det.x)}, {Math.round(det.y)})
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {Math.round(det.width)} x {Math.round(det.height)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
