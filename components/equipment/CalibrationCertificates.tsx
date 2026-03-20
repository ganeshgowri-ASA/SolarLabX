// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { calibrationCertificates, calibrationAlerts } from "@/lib/data/calibration-certificate-data";
import type { CalibrationCertificate, CalibrationAlert } from "@/lib/types/calibration-certificate";

const STATUS_CONFIG = {
  valid: { label: "Valid", color: "bg-green-100 text-green-700" },
  "expiring-soon": { label: "Expiring Soon", color: "bg-amber-100 text-amber-700" },
  expired: { label: "Expired", color: "bg-red-100 text-red-700" },
};

const ALERT_CONFIG = {
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700", icon: "🔴" },
  "30-day": { label: "30-Day Warning", color: "bg-red-50 text-red-600", icon: "🟠" },
  "60-day": { label: "60-Day Warning", color: "bg-amber-50 text-amber-600", icon: "🟡" },
  "90-day": { label: "90-Day Notice", color: "bg-blue-50 text-blue-600", icon: "🔵" },
};

export default function CalibrationCertificates() {
  const [certificates, setCertificates] = useState<CalibrationCertificate[]>([...calibrationCertificates]);
  const [alerts, setAlerts] = useState<CalibrationAlert[]>([...calibrationAlerts]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CalibrationCertificate | null>(null);
  const [parseResult, setParseResult] = useState<Partial<CalibrationCertificate> | null>(null);

  const stats = useMemo(() => {
    const valid = certificates.filter((c) => c.status === "valid").length;
    const expiringSoon = certificates.filter((c) => c.status === "expiring-soon").length;
    const expired = certificates.filter((c) => c.status === "expired").length;
    const total = certificates.length;
    const overdueAlerts = alerts.filter((a) => a.alertLevel === "overdue").length;
    const warningAlerts = alerts.filter((a) => a.alertLevel === "30-day" || a.alertLevel === "60-day").length;
    return { valid, expiringSoon, expired, total, overdueAlerts, warningAlerts };
  }, [certificates, alerts]);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Simulate parsing the uploaded certificate
    const mockParsed: Partial<CalibrationCertificate> = {
      equipmentId: "EQ-TC-05",
      equipmentName: "Thermal Cycling Chamber TC-05",
      certificateNumber: `CAL-NEW-${Date.now().toString(36).toUpperCase()}`,
      calibrationDate: "2026-03-15",
      nextDueDate: "2026-09-15",
      calibrationAgency: "National Calibration Lab (NABL Accredited)",
      parametersCalibrated: [
        { name: "Temperature", range: "-40°C to +85°C", uncertainty: "±0.4°C", unit: "°C", result: "pass" },
        { name: "Humidity", range: "40% to 95% RH", uncertainty: "±2.5% RH", unit: "% RH", result: "pass" },
      ],
      fileName: file.name,
      fileType: file.type.includes("pdf") ? "pdf" : "image",
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      status: "valid",
      notes: "",
    };
    setParseResult(mockParsed);
  }

  function handleConfirmUpload() {
    if (!parseResult) return;
    const newCert: CalibrationCertificate = {
      id: `CC-${String(certificates.length + 1).padStart(3, "0")}`,
      equipmentId: parseResult.equipmentId || "",
      equipmentName: parseResult.equipmentName || "",
      certificateNumber: parseResult.certificateNumber || "",
      calibrationDate: parseResult.calibrationDate || "",
      nextDueDate: parseResult.nextDueDate || "",
      calibrationAgency: parseResult.calibrationAgency || "",
      parametersCalibrated: parseResult.parametersCalibrated || [],
      fileName: parseResult.fileName || "",
      fileType: parseResult.fileType || "pdf",
      fileSize: parseResult.fileSize || "",
      uploadedBy: "Current User",
      uploadedAt: "2026-03-20",
      status: parseResult.status || "valid",
      notes: parseResult.notes || "",
    };
    setCertificates((prev) => [...prev, newCert]);
    setParseResult(null);
    setUploadDialogOpen(false);
  }

  function handleAcknowledgeAlert(alertId: string) {
    setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, acknowledged: true } : a));
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Status Dashboard</TabsTrigger>
          <TabsTrigger value="certificates">Certificates ({stats.total})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.filter((a) => !a.acknowledged).length})</TabsTrigger>
          <TabsTrigger value="upload">Upload & Parse</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Total Certificates</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Calibrated</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.valid}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Due Soon</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.expiringSoon}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Overdue</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.expired}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueAlerts + stats.warningAlerts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Compliance</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Status breakdown bars */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Calibration Status by Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center gap-3 p-2 rounded border hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{cert.equipmentName}</span>
                      <span className="text-[10px] text-muted-foreground">({cert.equipmentId})</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Cert: {cert.certificateNumber} | Agency: {cert.calibrationAgency.split("(")[0].trim()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(cert.nextDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <Badge className={cn("text-[10px] mt-0.5", STATUS_CONFIG[cert.status].color)}>
                      {STATUS_CONFIG[cert.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates List */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Certificate History</CardTitle>
                <Button size="sm" className="h-7 text-xs" onClick={() => { setActiveTab("upload"); }}>
                  + Upload Certificate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-xs border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-semibold">Equipment</th>
                      <th className="p-2 text-left font-semibold">Certificate #</th>
                      <th className="p-2 text-left font-semibold">Cal. Date</th>
                      <th className="p-2 text-left font-semibold">Next Due</th>
                      <th className="p-2 text-left font-semibold">Agency</th>
                      <th className="p-2 text-center font-semibold">Parameters</th>
                      <th className="p-2 text-center font-semibold">Status</th>
                      <th className="p-2 text-left font-semibold">Uploaded By</th>
                      <th className="p-2 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => (
                      <tr key={cert.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">
                          <div className="font-medium">{cert.equipmentName.length > 30 ? cert.equipmentName.substring(0, 30) + "..." : cert.equipmentName}</div>
                          <div className="text-[10px] text-muted-foreground">{cert.equipmentId}</div>
                        </td>
                        <td className="p-2 font-mono">{cert.certificateNumber}</td>
                        <td className="p-2">{new Date(cert.calibrationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="p-2">{new Date(cert.nextDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="p-2">{cert.calibrationAgency.split("(")[0].trim()}</td>
                        <td className="p-2 text-center">{cert.parametersCalibrated.length}</td>
                        <td className="p-2 text-center">
                          <Badge className={cn("text-[10px]", STATUS_CONFIG[cert.status].color)}>
                            {STATUS_CONFIG[cert.status].label}
                          </Badge>
                        </td>
                        <td className="p-2">{cert.uploadedBy}</td>
                        <td className="p-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setSelectedCert(cert)}>
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Detail View */}
          {selectedCert && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Certificate Details - {selectedCert.certificateNumber}</CardTitle>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedCert(null)}>Close</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Equipment</p>
                    <p className="text-sm font-medium">{selectedCert.equipmentName}</p>
                    <p className="text-xs text-muted-foreground">{selectedCert.equipmentId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Calibration Agency</p>
                    <p className="text-sm font-medium">{selectedCert.calibrationAgency}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Calibration Date</p>
                    <p className="text-sm font-medium">{new Date(selectedCert.calibrationDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Next Due Date</p>
                    <p className="text-sm font-medium">{new Date(selectedCert.nextDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold mb-2">Calibrated Parameters</p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="p-2 text-left font-semibold">Parameter</th>
                        <th className="p-2 text-left font-semibold">Range</th>
                        <th className="p-2 text-left font-semibold">Uncertainty</th>
                        <th className="p-2 text-left font-semibold">Unit</th>
                        <th className="p-2 text-center font-semibold">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCert.parametersCalibrated.map((param, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 font-medium">{param.name}</td>
                          <td className="p-2">{param.range}</td>
                          <td className="p-2 font-mono">{param.uncertainty}</td>
                          <td className="p-2">{param.unit}</td>
                          <td className="p-2 text-center">
                            <Badge className={cn("text-[10px]",
                              param.result === "pass" ? "bg-green-100 text-green-700" :
                              param.result === "conditional" ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {param.result.charAt(0).toUpperCase() + param.result.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">File</p>
                    <p className="font-medium">{selectedCert.fileName}</p>
                    <p className="text-muted-foreground">{selectedCert.fileSize}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Uploaded By</p>
                    <p className="font-medium">{selectedCert.uploadedBy}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Upload Date</p>
                    <p className="font-medium">{new Date(selectedCert.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Notes</p>
                    <p className="font-medium">{selectedCert.notes || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Calibration Alerts (30/60/90 Day Warnings)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No calibration alerts</p>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      alert.acknowledged ? "opacity-50" : "",
                      ALERT_CONFIG[alert.alertLevel].color
                    )}
                  >
                    <div className="text-lg shrink-0">{ALERT_CONFIG[alert.alertLevel].icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold">{alert.equipmentName}</span>
                        <Badge className={cn("text-[10px]", ALERT_CONFIG[alert.alertLevel].color)}>
                          {ALERT_CONFIG[alert.alertLevel].label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Certificate: {alert.certificateNumber} | Due: {new Date(alert.nextDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {alert.daysUntilDue < 0
                          ? ` | Overdue by ${Math.abs(alert.daysUntilDue)} days`
                          : ` | ${alert.daysUntilDue} days remaining`}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {!alert.acknowledged ? (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          Acknowledge
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Acknowledged</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload & Parse */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upload Calibration Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="text-4xl mb-3">📄</div>
                <p className="text-sm font-medium mb-1">Drop calibration certificate here or click to browse</p>
                <p className="text-xs text-muted-foreground mb-4">Supports PDF and image files (JPG, PNG)</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button asChild size="sm">
                    <span>Select File</span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Parse Results */}
          {parseResult && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Parsed Certificate Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-green-700 font-medium">Certificate parsed successfully. Review extracted data below.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Equipment ID</label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                      value={parseResult.equipmentId || ""}
                      onChange={(e) => setParseResult({ ...parseResult, equipmentId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Equipment Name</label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                      value={parseResult.equipmentName || ""}
                      onChange={(e) => setParseResult({ ...parseResult, equipmentName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Certificate Number</label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                      value={parseResult.certificateNumber || ""}
                      onChange={(e) => setParseResult({ ...parseResult, certificateNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Calibration Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                      value={parseResult.calibrationDate || ""}
                      onChange={(e) => setParseResult({ ...parseResult, calibrationDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Next Due Date</label>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                      value={parseResult.nextDueDate || ""}
                      onChange={(e) => setParseResult({ ...parseResult, nextDueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Calibration Agency</label>
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 text-xs"
                      value={parseResult.calibrationAgency || ""}
                      onChange={(e) => setParseResult({ ...parseResult, calibrationAgency: e.target.value })}
                    />
                  </div>
                </div>

                {parseResult.parametersCalibrated && parseResult.parametersCalibrated.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold mb-2">Extracted Parameters</p>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="p-2 text-left font-semibold">Parameter</th>
                          <th className="p-2 text-left font-semibold">Range</th>
                          <th className="p-2 text-left font-semibold">Uncertainty</th>
                          <th className="p-2 text-left font-semibold">Unit</th>
                          <th className="p-2 text-center font-semibold">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.parametersCalibrated.map((param, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-2">{param.name}</td>
                            <td className="p-2">{param.range}</td>
                            <td className="p-2 font-mono">{param.uncertainty}</td>
                            <td className="p-2">{param.unit}</td>
                            <td className="p-2 text-center">
                              <Badge className="text-[10px] bg-green-100 text-green-700">Pass</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-[10px] text-muted-foreground uppercase block mb-1">Notes</label>
                  <textarea
                    className="w-full border rounded px-2 py-1.5 text-xs h-16"
                    value={parseResult.notes || ""}
                    onChange={(e) => setParseResult({ ...parseResult, notes: e.target.value })}
                    placeholder="Additional notes about this calibration..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleConfirmUpload}>
                    Confirm & Save Certificate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setParseResult(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
