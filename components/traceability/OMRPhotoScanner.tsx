"use client"

import React, { useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Camera,
  Upload,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  RotateCcw,
  ZoomIn,
} from "lucide-react"
import { toast } from "sonner"
import { mockOMRRouteCards } from "@/lib/data-linkage"

// ============================================================================
// Simulated scan result type
// ============================================================================

interface ScanResult {
  id: string
  routeCardId: string
  stationNumber: number
  scannedAt: string
  confidence: number
  detectedValues: {
    passFail: "pass" | "fail" | "pending"
    checksDetected: number
    totalChecks: number
    measurements: { parameter: string; value: number; unit: string }[]
  }
  status: "success" | "partial" | "failed"
  imagePreview: string | null
  notes: string
}

// Mock scan history
const mockScanHistory: ScanResult[] = [
  {
    id: "SCAN-001",
    routeCardId: "OMR-RC-001",
    stationNumber: 1,
    scannedAt: new Date(Date.now() - 3600000).toISOString(),
    confidence: 97.5,
    detectedValues: {
      passFail: "pass",
      checksDetected: 4,
      totalChecks: 4,
      measurements: [
        { parameter: "Pmax", value: 405.2, unit: "W" },
        { parameter: "Voc", value: 49.5, unit: "V" },
      ],
    },
    status: "success",
    imagePreview: null,
    notes: "",
  },
  {
    id: "SCAN-002",
    routeCardId: "OMR-RC-001",
    stationNumber: 2,
    scannedAt: new Date(Date.now() - 7200000).toISOString(),
    confidence: 82.3,
    detectedValues: {
      passFail: "pass",
      checksDetected: 3,
      totalChecks: 4,
      measurements: [
        { parameter: "Pmax", value: 403.8, unit: "W" },
      ],
    },
    status: "partial",
    imagePreview: null,
    notes: "Bubble #3 unclear, manual verification needed",
  },
]

// ============================================================================
// OMR Photo Scanner Component
// ============================================================================

export function OMRPhotoScanner() {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>(mockScanHistory)
  const [selectedCard, setSelectedCard] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG)")
      return
    }

    simulateScan(file.name)
  }

  const simulateScan = (filename: string) => {
    setIsScanning(true)

    // Simulate processing delay
    setTimeout(() => {
      const confidence = 85 + Math.random() * 14
      const newScan: ScanResult = {
        id: `SCAN-${String(scanHistory.length + 1).padStart(3, "0")}`,
        routeCardId: selectedCard || mockOMRRouteCards[0]?.id || "OMR-RC-001",
        stationNumber: Math.floor(Math.random() * 5) + 1,
        scannedAt: new Date().toISOString(),
        confidence: Math.round(confidence * 10) / 10,
        detectedValues: {
          passFail: confidence > 90 ? "pass" : "pending",
          checksDetected: Math.floor(Math.random() * 2) + 3,
          totalChecks: 4,
          measurements: [
            { parameter: "Pmax", value: 400 + Math.random() * 10, unit: "W" },
            { parameter: "Voc", value: 48 + Math.random() * 3, unit: "V" },
          ],
        },
        status: confidence > 90 ? "success" : "partial",
        imagePreview: null,
        notes: "",
      }

      setLastScan(newScan)
      setScanHistory((prev) => [newScan, ...prev])
      setIsScanning(false)
      toast.success(
        `Scan complete: ${newScan.confidence}% confidence — ${filename}`
      )
    }, 2000)
  }

  const getStatusBadge = (status: ScanResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Success</Badge>
      case "partial":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Partial</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Failed</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Scanner Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Scan OMR Sheet
            </CardTitle>
            <CardDescription>
              Upload a photo of a filled OMR route card for automatic data extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Route Card</Label>
              <Select value={selectedCard} onValueChange={setSelectedCard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route card to match" />
                </SelectTrigger>
                <SelectContent>
                  {mockOMRRouteCards.map((rc) => (
                    <SelectItem key={rc.id} value={rc.id}>
                      {rc.id} — {rc.sampleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">
                Upload OMR sheet photo
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                JPG, PNG — ensure all bubbles are clearly visible
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isScanning ? "Processing..." : "Upload Image"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => simulateScan("camera-capture.jpg")}
                  disabled={isScanning}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
              </div>
            </div>

            {isScanning && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Processing OMR sheet...</p>
                  <p className="text-xs text-blue-600">Detecting bubbles, checkmarks, and measurements</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Scan Result */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ZoomIn className="h-5 w-5" />
              Last Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastScan ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{lastScan.id}</span>
                  {getStatusBadge(lastScan.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Route Card</p>
                    <p className="font-mono">{lastScan.routeCardId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Station</p>
                    <p className="font-mono">#{lastScan.stationNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Confidence</p>
                    <p className={`font-bold ${lastScan.confidence > 90 ? "text-green-600" : "text-amber-600"}`}>
                      {lastScan.confidence}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Result</p>
                    <p className="font-medium capitalize">{lastScan.detectedValues.passFail}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Detected Measurements</p>
                  <div className="space-y-1">
                    {lastScan.detectedValues.measurements.map((m, i) => (
                      <div key={i} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                        <span className="font-mono">{m.parameter}</span>
                        <span className="font-bold">{m.value.toFixed(1)} {m.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Checks: {lastScan.detectedValues.checksDetected}/{lastScan.detectedValues.totalChecks} detected
                  </p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(lastScan.detectedValues.checksDetected / lastScan.detectedValues.totalChecks) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {lastScan.status === "partial" && (
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Some fields require manual verification. Review detected values before confirming.</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Confirm & Save
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Rescan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No scan results yet</p>
                <p className="text-xs text-muted-foreground">Upload an OMR sheet photo to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Scan History</CardTitle>
          <CardDescription>Recent OMR sheet scans and their results</CardDescription>
        </CardHeader>
        <CardContent>
          {scanHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No scans yet</p>
          ) : (
            <div className="space-y-2">
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <ScanLine className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {scan.id} — Station #{scan.stationNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scan.routeCardId} • {new Date(scan.scannedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-mono ${scan.confidence > 90 ? "text-green-600" : "text-amber-600"}`}>
                      {scan.confidence}%
                    </span>
                    {getStatusBadge(scan.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
