"use client"

import React, { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Upload,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
} from "lucide-react"
import {
  ROUTINE_TESTS,
  ACCELERATED_TESTS,
  generateOMRFilename,
} from "@/lib/data/omr-route-card-v2-data"
import type { BubbleStatus, ScannedBubbleResult, OMRRouteCardV2 } from "@/lib/data/omr-route-card-v2-data"

// ============================================================================
// Photo Scanner: Upload image of physical OMR card, detect filled bubbles
// Uses Canvas API dark pixel analysis
// ============================================================================

interface OMRPhotoScannerProps {
  card: OMRRouteCardV2
  onScanComplete: (results: ScannedBubbleResult[]) => void
}

export function OMRPhotoScanner({ card, onScanComplete }: OMRPhotoScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResults, setScanResults] = useState<ScannedBubbleResult[]>([])
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [correctionMode, setCorrectionMode] = useState(false)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImageSrc(dataUrl)
      setImageLoaded(false)
      setScanResults([])

      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        setImageLoaded(true)
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }, [])

  const analyzeBubbles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    setScanning(true)
    const ctx = canvas.getContext("2d")
    if (!ctx) { setScanning(false); return }

    const results: ScannedBubbleResult[] = []
    const rows = ROUTINE_TESTS.length
    const cols = ACCELERATED_TESTS.length

    // Calculate grid positions (assume OMR card has standard layout)
    // Header occupies top 15%, matrix starts at 20% from top, 12% from left
    const startX = canvas.width * 0.12
    const startY = canvas.height * 0.20
    const cellW = (canvas.width * 0.85 - startX) / cols
    const cellH = (canvas.height * 0.85 - startY) / rows
    const bubbleRadius = Math.min(cellW, cellH) * 0.3

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = startX + cellW * (c + 0.5)
        const cy = startY + cellH * (r + 0.5)

        // Sample pixels in the bubble region
        const sampleSize = Math.max(4, Math.floor(bubbleRadius))
        let darkPixels = 0
        let totalPixels = 0

        for (let dx = -sampleSize; dx <= sampleSize; dx++) {
          for (let dy = -sampleSize; dy <= sampleSize; dy++) {
            if (dx * dx + dy * dy > sampleSize * sampleSize) continue
            const px = Math.floor(cx + dx)
            const py = Math.floor(cy + dy)
            if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height) continue

            const pixel = ctx.getImageData(px, py, 1, 1).data
            const brightness = (pixel[0] + pixel[1] + pixel[2]) / 3
            totalPixels++
            if (brightness < 100) darkPixels++
          }
        }

        const fillRatio = totalPixels > 0 ? darkPixels / totalPixels : 0

        // Determine status based on fill ratio and color analysis
        let detectedStatus: BubbleStatus = "empty"
        let confidence = 0

        if (fillRatio > 0.5) {
          // Check predominant color for pass(green) vs fail(red)
          const centerPixel = ctx.getImageData(Math.floor(cx), Math.floor(cy), 1, 1).data
          const r_val = centerPixel[0]
          const g_val = centerPixel[1]

          if (g_val > r_val + 30) {
            detectedStatus = "pass"
            confidence = Math.min(0.99, 0.6 + fillRatio * 0.35)
          } else if (r_val > g_val + 30) {
            detectedStatus = "fail"
            confidence = Math.min(0.99, 0.6 + fillRatio * 0.35)
          } else {
            // Dark fill likely means filled bubble on printed OMR
            detectedStatus = "pass"
            confidence = Math.min(0.95, 0.5 + fillRatio * 0.4)
          }
        } else if (fillRatio > 0.25) {
          detectedStatus = "in-progress"
          confidence = 0.4 + fillRatio * 0.3
        } else {
          detectedStatus = "empty"
          confidence = 0.8 + (1 - fillRatio) * 0.15
        }

        results.push({
          routineTest: ROUTINE_TESTS[r].code,
          acceleratedTest: ACCELERATED_TESTS[c].code,
          detectedStatus,
          confidence: Math.round(confidence * 100) / 100,
          x: Math.floor(cx),
          y: Math.floor(cy),
          corrected: false,
        })

        // Draw detection overlay on canvas
        ctx.beginPath()
        ctx.arc(cx, cy, bubbleRadius, 0, Math.PI * 2)
        ctx.strokeStyle =
          detectedStatus === "pass"
            ? "#22c55e"
            : detectedStatus === "fail"
            ? "#ef4444"
            : detectedStatus === "in-progress"
            ? "#f59e0b"
            : "#9ca3af"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    setScanResults(results)
    setScanning(false)
  }, [])

  const handleCorrection = useCallback(
    (idx: number, newStatus: BubbleStatus) => {
      setScanResults((prev) =>
        prev.map((r, i) =>
          i === idx ? { ...r, detectedStatus: newStatus, corrected: true } : r
        )
      )
    },
    []
  )

  const handleApplyResults = useCallback(() => {
    onScanComplete(scanResults)
  }, [scanResults, onScanComplete])

  const handleExportResults = useCallback(() => {
    const csvHeader = "RoutineTest,AcceleratedTest,Status,Confidence,Corrected,Filename\n"
    const csvRows = scanResults
      .filter((r) => r.detectedStatus !== "empty")
      .map((r) => {
        const fn = generateOMRFilename(
          card.projectId,
          card.moduleId,
          r.acceleratedTest,
          r.routineTest,
          "Post",
          "Set1"
        )
        return `${r.routineTest},${r.acceleratedTest},${r.detectedStatus},${r.confidence},${r.corrected},${fn}`
      })
      .join("\n")

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${card.projectId}_${card.moduleId}_scan_results.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [scanResults, card])

  const filledCount = scanResults.filter((r) => r.detectedStatus !== "empty").length
  const lowConfCount = scanResults.filter(
    (r) => r.detectedStatus !== "empty" && r.confidence < 0.7
  ).length

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Upload Physical OMR Card Photo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Take a photo of the filled OMR route card. The system will detect filled bubbles
                using dark pixel analysis and auto-generate IEC-compliant filenames.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {imageLoaded && (
                <Button onClick={analyzeBubbles} disabled={scanning} variant="secondary">
                  <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? "animate-spin" : ""}`} />
                  {scanning ? "Scanning..." : "Analyze Bubbles"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Preview */}
      {imageSrc && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Scanned Image Preview</CardTitle>
            <CardDescription>
              {imageLoaded
                ? scanResults.length > 0
                  ? `Detected ${filledCount} filled bubbles out of ${scanResults.length} total`
                  : "Image loaded. Click &quot;Analyze Bubbles&quot; to detect filled marks."
                : "Loading image..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[400px] border rounded">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Results Table */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Detection Results</CardTitle>
                <CardDescription>
                  {filledCount} bubbles detected &bull;{" "}
                  {lowConfCount > 0 && (
                    <span className="text-amber-600 font-medium">
                      {lowConfCount} low confidence &mdash; review needed
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCorrectionMode(!correctionMode)}
                >
                  {correctionMode ? "Done Correcting" : "Manual Correction"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportResults}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export CSV
                </Button>
                <Button size="sm" onClick={handleApplyResults}>
                  Apply to Matrix
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Routine</TableHead>
                    <TableHead>Accelerated</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Filename</TableHead>
                    {correctionMode && <TableHead>Correct</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanResults
                    .filter((r) => r.detectedStatus !== "empty")
                    .map((result, idx) => {
                      const fn = generateOMRFilename(
                        card.projectId,
                        card.moduleId,
                        result.acceleratedTest,
                        result.routineTest,
                        "Post",
                        "Set1"
                      )
                      const originalIdx = scanResults.indexOf(result)
                      return (
                        <TableRow
                          key={`${result.routineTest}-${result.acceleratedTest}`}
                          className={result.confidence < 0.7 ? "bg-amber-50" : ""}
                        >
                          <TableCell className="font-mono font-bold text-sm">
                            {result.routineTest}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {result.acceleratedTest}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                result.detectedStatus === "pass"
                                  ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                                  : result.detectedStatus === "fail"
                                  ? "border-red-400 text-red-700 bg-red-50"
                                  : "border-amber-400 text-amber-700 bg-amber-50"
                              }
                            >
                              {result.corrected && "* "}
                              {result.detectedStatus === "pass" && (
                                <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                              )}
                              {result.detectedStatus === "fail" && (
                                <XCircle className="h-3 w-3 mr-1 inline" />
                              )}
                              {result.detectedStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    result.confidence >= 0.8
                                      ? "bg-emerald-500"
                                      : result.confidence >= 0.6
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${result.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono">
                                {(result.confidence * 100).toFixed(0)}%
                              </span>
                              {result.confidence < 0.7 && (
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-[10px] max-w-[200px] truncate">
                            {fn}
                          </TableCell>
                          {correctionMode && (
                            <TableCell>
                              <Select
                                value={result.detectedStatus}
                                onValueChange={(val) =>
                                  handleCorrection(originalIdx, val as BubbleStatus)
                                }
                              >
                                <SelectTrigger className="w-[110px] h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pass">Pass</SelectItem>
                                  <SelectItem value="fail">Fail</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="empty">Empty</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
