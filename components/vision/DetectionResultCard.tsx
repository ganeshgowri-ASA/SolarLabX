import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DefectClassBadge } from "./DefectClassBadge";
import { ConfidenceBar } from "./ConfidenceBar";

export interface DetectionResult {
  id: string;
  imageName: string;
  imageUrl: string;
  inspectionType: string;
  date: string;
  moduleId: string;
  defects: {
    class: string;
    confidence: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  status: "completed" | "processing" | "failed";
}

export function DetectionResultCard({ result }: { result: DetectionResult }) {
  const defectCount = result.defects.length;
  const avgConfidence = defectCount > 0
    ? result.defects.reduce((sum, d) => sum + d.confidence, 0) / defectCount
    : 0;

  return (
    <Link href={`/vision-ai/results/${result.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{result.imageName}</CardTitle>
            <Badge variant={result.status === "completed" ? "default" : "secondary"}>
              {result.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Module: {result.moduleId}</span>
            <span>|</span>
            <span>{result.inspectionType.toUpperCase()}</span>
            <span>|</span>
            <span>{result.date}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{defectCount} defect{defectCount !== 1 ? "s" : ""} found</span>
              {defectCount > 0 && (
                <span className="text-muted-foreground">
                  Avg confidence: {(avgConfidence * 100).toFixed(1)}%
                </span>
              )}
            </div>
            {defectCount > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(result.defects.map((d) => d.class))).map((cls) => (
                  <DefectClassBadge key={cls} defectClass={cls} showSeverity={false} />
                ))}
              </div>
            )}
            {defectCount > 0 && (
              <ConfidenceBar confidence={avgConfidence} />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
