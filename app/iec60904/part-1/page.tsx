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
import IVCurveChart from "@/components/iec60904/IVCurveChart";
import { analyzeIVCurve, generateIVCurve, generateDocNumber, type IVDataPoint, type IVAnalysisResult } from "@/lib/iec60904";

const SAMPLE_IV_DATA = `0.000,9.450
2.000,9.448
4.000,9.445
6.000,9.440
8.000,9.430
10.00,9.415
12.00,9.400
14.00,9.380
16.00,9.350
18.00,9.310
20.00,9.260
22.00,9.190
24.00,9.100
26.00,8.980
28.00,8.810
30.00,8.580
31.00,8.400
32.00,8.150
33.00,7.800
34.00,7.300
35.00,6.500
36.00,5.300
37.00,3.500
38.00,1.200
38.50,0.000`;

export default function Part1Page() {
  const [docNumber] = useState(() => generateDocNumber(1, "protocol"));
  const [ivText, setIvText] = useState(SAMPLE_IV_DATA);
  const [area, setArea] = useState("1.638");
  const [irradiance, setIrradiance] = useState("1000");
  const [result, setResult] = useState<IVAnalysisResult | null>(null);

  // Manual data entry
  const [manualIsc, setManualIsc] = useState("");
  const [manualVoc, setManualVoc] = useState("");
  const [manualImpp, setManualImpp] = useState("");
  const [manualVmpp, setManualVmpp] = useState("");
  const [manualPmax, setManualPmax] = useState("");

  function handleAnalyze() {
    const lines = ivText.trim().split("\n");
    const data: IVDataPoint[] = lines
      .map((l) => {
        const p = l.split(",").map((s) => parseFloat(s.trim()));
        return p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]) ? { voltage: p[0], current: p[1] } : null;
      })
      .filter(Boolean) as IVDataPoint[];
    if (data.length > 1) {
      setResult(analyzeIVCurve(data, parseFloat(area) || 1.638, parseFloat(irradiance) || 1000));
    }
  }

  function handleGenerateSynthetic() {
    const isc = parseFloat(manualIsc) || 9.5;
    const voc = parseFloat(manualVoc) || 38.5;
    const curve = generateIVCurve(isc, voc, 0.4, 300, 50);
    setIvText(curve.map((p) => `${p.voltage.toFixed(3)},${p.current.toFixed(4)}`).join("\n"));
  }

  const manualFF = manualIsc && manualVoc && manualPmax
    ? (parseFloat(manualPmax) / (parseFloat(manualIsc) * parseFloat(manualVoc)) * 100).toFixed(2)
    : "";
  const manualEff = manualPmax && area && irradiance
    ? ((parseFloat(manualPmax) / (parseFloat(area) * parseFloat(irradiance))) * 100).toFixed(2)
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-1: I-V Characteristics</h1>
        <p className="text-muted-foreground mt-1">
          Measurement of photovoltaic current-voltage characteristics under STC (1000 W/m², 25°C, AM1.5G)
        </p>
      </div>

      <Tabs defaultValue="protocol">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
          <TabsTrigger value="data">Data Entry</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Protocol Tab */}
        <TabsContent value="protocol">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={1} title="I-V Curve Measurement Protocol" standard="IEC 60904-1 Ed.2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Standard Test Conditions (STC)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <div className="font-bold text-lg">1000 W/m²</div>
                    <div className="text-xs text-muted-foreground">Irradiance</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <div className="font-bold text-lg">25 °C</div>
                    <div className="text-xs text-muted-foreground">Cell Temperature</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <div className="font-bold text-lg">AM 1.5G</div>
                    <div className="text-xs text-muted-foreground">Spectrum</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Test Procedure</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Verify solar simulator classification per IEC 60904-9</li>
                  <li>Calibrate reference cell per IEC 60904-2</li>
                  <li>Set irradiance to 1000 W/m² using reference cell</li>
                  <li>Allow DUT to reach thermal equilibrium at 25°C ± 2°C</li>
                  <li>Connect DUT using 4-wire Kelvin sensing</li>
                  <li>Perform forward I-V sweep from Isc to Voc</li>
                  <li>Record at minimum 100 data points</li>
                  <li>Apply spectral mismatch correction (IEC 60904-7)</li>
                  <li>Apply temperature correction to STC</li>
                  <li>Calculate electrical parameters: Isc, Voc, Pmax, FF, η</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Required Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {["Solar Simulator (Class A+AA)", "Reference Cell", "I-V Curve Tracer", "Temperature Sensor", "4-Wire Probe", "Data Acquisition System"].map((eq) => (
                    <Badge key={eq} variant="outline">{eq}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Acceptance Criteria</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Requirement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow><TableCell>Irradiance</TableCell><TableCell>1000 ± 20 W/m²</TableCell></TableRow>
                    <TableRow><TableCell>Temperature</TableCell><TableCell>25 ± 2 °C</TableCell></TableRow>
                    <TableRow><TableCell>Sweep time</TableCell><TableCell>Appropriate for DUT capacitance</TableCell></TableRow>
                    <TableRow><TableCell>Data points</TableCell><TableCell>≥ 100 points on I-V curve</TableCell></TableRow>
                    <TableRow><TableCell>Repeatability</TableCell><TableCell>Pmax within ± 1%</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Entry Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Entry</CardTitle>
              <CardDescription>Enter measured I-V curve data or key parameters directly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Module Area (m²)</Label>
                  <Input value={area} onChange={(e) => setArea(e.target.value)} className="font-mono" />
                </div>
                <div>
                  <Label>Irradiance (W/m²)</Label>
                  <Input value={irradiance} onChange={(e) => setIrradiance(e.target.value)} className="font-mono" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Manual Parameter Entry</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><Label>Isc (A)</Label><Input value={manualIsc} onChange={(e) => setManualIsc(e.target.value)} placeholder="e.g. 9.45" className="font-mono" /></div>
                  <div><Label>Voc (V)</Label><Input value={manualVoc} onChange={(e) => setManualVoc(e.target.value)} placeholder="e.g. 38.5" className="font-mono" /></div>
                  <div><Label>Impp (A)</Label><Input value={manualImpp} onChange={(e) => setManualImpp(e.target.value)} placeholder="e.g. 8.95" className="font-mono" /></div>
                  <div><Label>Vmpp (V)</Label><Input value={manualVmpp} onChange={(e) => setManualVmpp(e.target.value)} placeholder="e.g. 31.5" className="font-mono" /></div>
                  <div><Label>Pmax (W)</Label><Input value={manualPmax} onChange={(e) => setManualPmax(e.target.value)} placeholder="e.g. 282.0" className="font-mono" /></div>
                  <div>
                    <Label>Fill Factor (%)</Label>
                    <Input value={manualFF} readOnly className="font-mono bg-muted" />
                  </div>
                  <div>
                    <Label>Efficiency (%)</Label>
                    <Input value={manualEff} readOnly className="font-mono bg-muted" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">I-V Curve Data (Voltage, Current CSV)</h3>
                <textarea
                  className="w-full h-48 font-mono text-sm border rounded-md p-3 bg-background"
                  value={ivText}
                  onChange={(e) => setIvText(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleAnalyze}>Analyze I-V Curve</Button>
                  <Button variant="outline" onClick={handleGenerateSynthetic}>Generate Synthetic Curve</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>I-V Curve Analysis</CardTitle>
              <CardDescription>IV curve plotting, Rs/Rsh extraction, fill factor analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result ? (
                <>
                  <IVCurveChart data={result.curve} powerCurve={result.powerCurve} showPower />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Rs (Series)</div>
                      <div className="font-bold font-mono">{result.params.rs.toFixed(3)} Ω</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Rsh (Shunt)</div>
                      <div className="font-bold font-mono">{result.params.rsh.toFixed(1)} Ω</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Ideal FF</div>
                      <div className="font-bold font-mono">{(result.ffLoss.idealFF * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Actual FF</div>
                      <div className="font-bold font-mono">{(result.params.ff * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Fill Factor Loss Analysis</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Loss Mechanism</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow><TableCell>Rs Loss Factor</TableCell><TableCell className="font-mono">{result.ffLoss.rsLoss.toFixed(4)}</TableCell></TableRow>
                        <TableRow><TableCell>Rsh Loss Factor</TableCell><TableCell className="font-mono">{result.ffLoss.rshLoss.toFixed(4)}</TableCell></TableRow>
                        <TableRow><TableCell>FF (Ideal)</TableCell><TableCell className="font-mono">{(result.ffLoss.idealFF * 100).toFixed(2)}%</TableCell></TableRow>
                        <TableRow><TableCell>FF (Actual)</TableCell><TableCell className="font-mono">{(result.params.ff * 100).toFixed(2)}%</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  Enter I-V data in the Data Entry tab and click &quot;Analyze I-V Curve&quot; to see results.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={1} title="I-V Measurement Results" standard="IEC 60904-1 Ed.2" />
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Short-Circuit Current</TableCell><TableCell className="font-mono">Isc</TableCell><TableCell className="font-mono">{result.params.isc.toFixed(3)}</TableCell><TableCell>A</TableCell></TableRow>
                      <TableRow><TableCell>Open-Circuit Voltage</TableCell><TableCell className="font-mono">Voc</TableCell><TableCell className="font-mono">{result.params.voc.toFixed(3)}</TableCell><TableCell>V</TableCell></TableRow>
                      <TableRow><TableCell>MPP Current</TableCell><TableCell className="font-mono">Impp</TableCell><TableCell className="font-mono">{result.params.impp.toFixed(3)}</TableCell><TableCell>A</TableCell></TableRow>
                      <TableRow><TableCell>MPP Voltage</TableCell><TableCell className="font-mono">Vmpp</TableCell><TableCell className="font-mono">{result.params.vmpp.toFixed(3)}</TableCell><TableCell>V</TableCell></TableRow>
                      <TableRow><TableCell>Maximum Power</TableCell><TableCell className="font-mono">Pmax</TableCell><TableCell className="font-mono">{result.params.pmax.toFixed(2)}</TableCell><TableCell>W</TableCell></TableRow>
                      <TableRow><TableCell>Fill Factor</TableCell><TableCell className="font-mono">FF</TableCell><TableCell className="font-mono">{(result.params.ff * 100).toFixed(2)}</TableCell><TableCell>%</TableCell></TableRow>
                      <TableRow><TableCell>Efficiency</TableCell><TableCell className="font-mono">η</TableCell><TableCell className="font-mono">{result.params.efficiency.toFixed(2)}</TableCell><TableCell>%</TableCell></TableRow>
                      <TableRow><TableCell>Series Resistance</TableCell><TableCell className="font-mono">Rs</TableCell><TableCell className="font-mono">{result.params.rs.toFixed(3)}</TableCell><TableCell>Ω</TableCell></TableRow>
                      <TableRow><TableCell>Shunt Resistance</TableCell><TableCell className="font-mono">Rsh</TableCell><TableCell className="font-mono">{result.params.rsh.toFixed(1)}</TableCell><TableCell>Ω</TableCell></TableRow>
                    </TableBody>
                  </Table>

                  <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                    <p>Document: {docNumber}</p>
                    <p>Test Conditions: {result.params.irradiance} W/m², Cell Area: {result.params.area} m²</p>
                    <p>Standard: IEC 60904-1 Ed.2 | ISO/IEC 17025 compliant</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  Analyze data first to view results.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
