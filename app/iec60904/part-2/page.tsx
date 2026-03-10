// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DocumentHeader from "@/components/iec60904/DocumentHeader";
import StatusBadge from "@/components/iec60904/StatusBadge";
import CalibrationChainViz from "@/components/iec60904/CalibrationChainViz";
import { generateDocNumber, isCalibrationValid, daysUntilExpiry, type ReferenceDeviceCalibration } from "@/lib/iec60904";

const SAMPLE_CALIBRATIONS: ReferenceDeviceCalibration[] = [
  {
    deviceId: "RC-2024-001", calibrationValue: 134.2, calibrationDate: "2025-06-15",
    expiryDate: "2027-06-15", calibrationLab: "NREL (USA)", certificateNumber: "NREL-PV-2025-0142",
    uncertainty: 1.1, coverageFactor: 2.0, spectralResponseType: "c-Si",
    temperatureCoefficient: 0.05,
    traceabilityChain: ["World Photovoltaic Scale (WPVS)", "NREL Primary Reference Cell", "Working Reference Cell RC-2024-001"],
  },
  {
    deviceId: "RC-2024-002", calibrationValue: 128.7, calibrationDate: "2025-03-20",
    expiryDate: "2027-03-20", calibrationLab: "PTB (Germany)", certificateNumber: "PTB-PV-2025-0087",
    uncertainty: 0.9, coverageFactor: 2.0, spectralResponseType: "mc-Si",
    temperatureCoefficient: 0.04,
    traceabilityChain: ["World Photovoltaic Scale (WPVS)", "PTB Primary Standard", "Transfer Standard TS-45", "Working Reference Cell RC-2024-002"],
  },
  {
    deviceId: "RC-2023-003", calibrationValue: 112.5, calibrationDate: "2024-01-10",
    expiryDate: "2025-07-10", calibrationLab: "AIST (Japan)", certificateNumber: "AIST-PV-2024-0031",
    uncertainty: 1.3, coverageFactor: 2.0, spectralResponseType: "CdTe",
    temperatureCoefficient: 0.08,
    traceabilityChain: ["World Photovoltaic Scale (WPVS)", "AIST Primary Reference", "Working Reference Cell RC-2023-003"],
  },
];

export default function Part2Page() {
  const [docNumber] = useState(() => generateDocNumber(2, "protocol"));
  const [calibrations, setCalibrations] = useState(SAMPLE_CALIBRATIONS);
  const [selectedCal, setSelectedCal] = useState<ReferenceDeviceCalibration | null>(null);
  const [newDeviceId, setNewDeviceId] = useState("");
  const [newCalValue, setNewCalValue] = useState("");
  const [newLab, setNewLab] = useState("");
  const [newCertNo, setNewCertNo] = useState("");
  const [newUncertainty, setNewUncertainty] = useState("");
  const [newType, setNewType] = useState("c-Si");
  const [newTempCoeff, setNewTempCoeff] = useState("");

  function handleAddCalibration() {
    if (!newDeviceId || !newCalValue) return;
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 2);
    const newCal: ReferenceDeviceCalibration = {
      deviceId: newDeviceId,
      calibrationValue: parseFloat(newCalValue) || 0,
      calibrationDate: now.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      calibrationLab: newLab || "In-house",
      certificateNumber: newCertNo || `CAL-${Date.now()}`,
      uncertainty: parseFloat(newUncertainty) || 2.0,
      coverageFactor: 2.0,
      spectralResponseType: newType,
      temperatureCoefficient: parseFloat(newTempCoeff) || 0.05,
      traceabilityChain: ["World Photovoltaic Scale (WPVS)", newLab || "In-house", `Working Reference Cell ${newDeviceId}`],
    };
    setCalibrations([...calibrations, newCal]);
    setNewDeviceId("");
    setNewCalValue("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-2: Reference Devices</h1>
        <p className="text-muted-foreground mt-1">Requirements for PV reference devices and calibration tracking</p>
      </div>

      <Tabs defaultValue="protocol">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
          <TabsTrigger value="data">Data Entry</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="protocol">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={2} title="Reference Cell Calibration Protocol" standard="IEC 60904-2 Ed.3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Requirements for PV Reference Devices</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Reference devices shall be primary or secondary reference cells</li>
                  <li>Calibration traceable to World Photovoltaic Scale (WPVS)</li>
                  <li>Spectral responsivity data must be available</li>
                  <li>Calibration value expressed as short-circuit current under STC</li>
                  <li>Expanded uncertainty shall be stated with coverage factor k=2</li>
                  <li>Temperature coefficient of Isc must be known</li>
                  <li>Recalibration interval: typically 2 years</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Spectral Requirements</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Spectral Range</TableHead>
                      <TableHead>Application</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow><TableCell>c-Si</TableCell><TableCell>300 - 1200 nm</TableCell><TableCell>Crystalline silicon modules</TableCell></TableRow>
                    <TableRow><TableCell>mc-Si</TableCell><TableCell>300 - 1200 nm</TableCell><TableCell>Multi-crystalline modules</TableCell></TableRow>
                    <TableRow><TableCell>CdTe</TableCell><TableCell>300 - 900 nm</TableCell><TableCell>Thin-film CdTe modules</TableCell></TableRow>
                    <TableRow><TableCell>a-Si</TableCell><TableCell>300 - 800 nm</TableCell><TableCell>Amorphous silicon modules</TableCell></TableRow>
                    <TableRow><TableCell>CIGS</TableCell><TableCell>300 - 1300 nm</TableCell><TableCell>CIGS thin-film modules</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Reference Device Registration</CardTitle>
              <CardDescription>Add and manage reference cell calibration data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><Label>Device ID</Label><Input value={newDeviceId} onChange={(e) => setNewDeviceId(e.target.value)} placeholder="RC-2025-001" /></div>
                <div><Label>Calibration Value (mA)</Label><Input value={newCalValue} onChange={(e) => setNewCalValue(e.target.value)} placeholder="134.2" className="font-mono" /></div>
                <div><Label>Calibration Lab</Label><Input value={newLab} onChange={(e) => setNewLab(e.target.value)} placeholder="NREL" /></div>
                <div><Label>Certificate No.</Label><Input value={newCertNo} onChange={(e) => setNewCertNo(e.target.value)} placeholder="NREL-PV-2025-XXX" /></div>
                <div><Label>Uncertainty (%)</Label><Input value={newUncertainty} onChange={(e) => setNewUncertainty(e.target.value)} placeholder="1.1" className="font-mono" /></div>
                <div><Label>Cell Type</Label><Input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="c-Si" /></div>
                <div><Label>Temp Coeff (%/°C)</Label><Input value={newTempCoeff} onChange={(e) => setNewTempCoeff(e.target.value)} placeholder="0.05" className="font-mono" /></div>
              </div>
              <Button onClick={handleAddCalibration}>Add Reference Device</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Calibration Tracking & Traceability</CardTitle>
              <CardDescription>View calibration status and traceability chain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Cal. Value</TableHead>
                    <TableHead>Lab</TableHead>
                    <TableHead>Uncertainty</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calibrations.map((cal) => {
                    const valid = isCalibrationValid(cal);
                    const days = daysUntilExpiry(cal);
                    return (
                      <TableRow key={cal.deviceId}>
                        <TableCell className="font-mono">{cal.deviceId}</TableCell>
                        <TableCell>{cal.spectralResponseType}</TableCell>
                        <TableCell className="font-mono">{cal.calibrationValue} mA</TableCell>
                        <TableCell>{cal.calibrationLab}</TableCell>
                        <TableCell className="font-mono">±{cal.uncertainty}% (k={cal.coverageFactor})</TableCell>
                        <TableCell>{cal.expiryDate}</TableCell>
                        <TableCell>
                          <StatusBadge status={valid ? (days < 90 ? "marginal" : "pass") : "fail"} size="sm"
                            label={valid ? (days < 90 ? `${days}d left` : "Valid") : "Expired"} />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCal(cal)}>View Chain</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {selectedCal && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Traceability Chain: {selectedCal.deviceId}</h3>
                  <CalibrationChainViz chain={selectedCal.traceabilityChain} />
                  <div className="text-xs text-muted-foreground mt-2">
                    Certificate: {selectedCal.certificateNumber} | Lab: {selectedCal.calibrationLab}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={2} title="Reference Device Inventory" standard="IEC 60904-2 Ed.3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="font-bold text-2xl text-primary">{calibrations.length}</div>
                    <div className="text-xs text-muted-foreground">Total Devices</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="font-bold text-2xl text-emerald-500">{calibrations.filter((c) => isCalibrationValid(c)).length}</div>
                    <div className="text-xs text-muted-foreground">Valid</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="font-bold text-2xl text-red-500">{calibrations.filter((c) => !isCalibrationValid(c)).length}</div>
                    <div className="text-xs text-muted-foreground">Expired</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground border-t pt-3">
                  <p>Document: {docNumber} | Standard: IEC 60904-2 Ed.3 | ISO/IEC 17025 compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
