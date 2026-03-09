"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/vision/ImageUploader";
import { DefectOverlay, Detection } from "@/components/vision/DefectOverlay";
import { DefectClassBadge } from "@/components/vision/DefectClassBadge";
import { ConfidenceBar } from "@/components/vision/ConfidenceBar";
import { INSPECTION_TYPES } from "@/lib/constants";

interface DetectionResponse {
  predictions: Detection[];
  image: { width: number; height: number };
}

export default function DetectPage() {
  const [inspectionType, setInspectionType] = useState("el");
  const [moduleId, setModuleId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResults, setHasResults] = useState(false);

  const handleImageSelect = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setDetections([]);
    setHasResults(false);
    setError(null);
  };

  const handleDetect = async () => {
    if (!imageFile) return;
    setIsDetecting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("inspectionType", inspectionType);
      formData.append("moduleId", moduleId);

      const response = await fetch("/api/vision/detect", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Detection failed");
      }

      const data: DetectionResponse = await response.json();
      setDetections(data.predictions);
      setHasResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detection failed. Please check your API key configuration.");
      // Show demo results on error so the UI is demonstrable
      setDetections([
        { class: "crack", confidence: 0.94, x: 320, y: 240, width: 80, height: 60 },
        { class: "hotspot", confidence: 0.87, x: 520, y: 380, width: 70, height: 50 },
      ]);
      setHasResults(true);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Defect Detection</h1>
        <p className="text-muted-foreground mt-1">
          Upload a PV module image for AI-powered defect detection
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>
                Upload EL images, IR thermography, or visual inspection photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onImageSelect={handleImageSelect} />
            </CardContent>
          </Card>

          {/* Results */}
          {hasResults && imagePreview && (
            <Card>
              <CardHeader>
                <CardTitle>Detection Results</CardTitle>
                <CardDescription>
                  {detections.length} defect{detections.length !== 1 ? "s" : ""} detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DefectOverlay imageSrc={imagePreview} detections={detections} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detection Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Inspection Type</label>
                <Select value={inspectionType} onValueChange={setInspectionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSPECTION_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Module ID</label>
                <Input
                  placeholder="e.g. MOD-2026-0145"
                  value={moduleId}
                  onChange={(e) => setModuleId(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleDetect}
                disabled={!imageFile || isDetecting}
              >
                {isDetecting ? "Detecting..." : "Run Detection"}
              </Button>
              {error && (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                  {error} (Showing demo results)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Detection Summary */}
          {hasResults && detections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Defect Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detections.map((det, i) => (
                    <div key={i} className="space-y-1.5 pb-3 border-b last:border-0 last:pb-0">
                      <DefectClassBadge defectClass={det.class} />
                      <ConfidenceBar confidence={det.confidence} />
                      <p className="text-xs text-muted-foreground">
                        Location: ({Math.round(det.x)}, {Math.round(det.y)}) Size: {Math.round(det.width)}x{Math.round(det.height)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
