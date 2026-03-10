// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DocumentHeader from "@/components/iec60904/DocumentHeader";
import { generateDocNumber, calculateECT, type ECTResult } from "@/lib/iec60904";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

export default function Part5Page() {
  const [docNumber] = useState(() => generateDocNumber(5, "protocol"));
  const [vocMeasured, setVocMeasured] = useState("37.2");
  const [vocSTC, setVocSTC] = useState("38.5");
  const [betaVoc, setBetaVoc] = useState("-0.118");
  const [irradiance, setIrradiance] = useState("980");
  const [nCells, setNCells] = useState("60");
  const [result, setResult] = useState<ECTResult | null>(null);

  // Multi-point data for correlation
  const [correlationData, setCorrelationData] = useState([
    { vocMeas: 37.8, tempSensor: 28, irr: 1000 },
    { vocMeas: 37.2, tempSensor: 32, irr: 980 },
    { vocMeas: 36.5, tempSensor: 38, irr: 950 },
    { vocMeas: 35.8, tempSensor: 45, irr: 920 },
    { vocMeas: 35.2, tempSensor: 50, irr: 900 },
  ]);

  function handleCalculate() {
    const r = calculateECT(
      parseFloat(vocMeasured), parseFloat(vocSTC), parseFloat(betaVoc),
      parseFloat(irradiance), parseInt(nCells)
    );
    setResult(r);
  }

  const ectCorrelation = correlationData.map((d) => {
    const r = calculateECT(d.vocMeas, parseFloat(vocSTC), parseFloat(betaVoc), d.irr, parseInt(nCells));
    return { tempSensor: d.tempSensor, ectVoc: r.ect, irradiance: d.irr };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-5: Equivalent Cell Temperature</h1>
        <p className="text-muted-foreground mt-1">Determination of equivalent cell temperature (ECT) from Voc method</p>
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
              <DocumentHeader docNumber={docNumber} partNumber={5} title="ECT Determination Protocol" standard="IEC 60904-5 Ed.2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Voc Method for ECT Determination</h3>
                <p className="text-sm text-muted-foreground">
                  The equivalent cell temperature is determined from the open-circuit voltage
                  using the known temperature coefficient of Voc. This provides the actual
                  junction temperature of the PV device.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">ECT Formula</h3>
                <p className="font-mono text-sm">ECT = T_STC + (Voc_measured - Voc_STC - ΔVoc_irr) / β_Voc</p>
                <p className="text-xs text-muted-foreground mt-1">where β_Voc is the temperature coefficient of Voc (V/°C)</p>
                <p className="text-xs text-muted-foreground">ΔVoc_irr is the irradiance correction for Voc</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Procedure</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Determine Voc at STC from module datasheet or measurement</li>
                  <li>Determine β_Voc temperature coefficient from datasheet or measurement</li>
                  <li>Measure Voc under actual operating conditions</li>
                  <li>Record actual irradiance</li>
                  <li>Apply irradiance correction to measured Voc</li>
                  <li>Calculate ECT using the formula above</li>
                  <li>Compare with back-of-module temperature sensor for validation</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>ECT Measurement Data</CardTitle>
              <CardDescription>Enter Voc measurement and module parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><Label>Measured Voc (V)</Label><Input value={vocMeasured} onChange={(e) => setVocMeasured(e.target.value)} className="font-mono" /></div>
                <div><Label>Voc at STC (V)</Label><Input value={vocSTC} onChange={(e) => setVocSTC(e.target.value)} className="font-mono" /></div>
                <div><Label>β_Voc (V/°C)</Label><Input value={betaVoc} onChange={(e) => setBetaVoc(e.target.value)} className="font-mono" /></div>
                <div><Label>Irradiance (W/m²)</Label><Input value={irradiance} onChange={(e) => setIrradiance(e.target.value)} className="font-mono" /></div>
                <div><Label>Number of Cells</Label><Input value={nCells} onChange={(e) => setNCells(e.target.value)} className="font-mono" /></div>
              </div>
              <Button onClick={handleCalculate}>Calculate ECT</Button>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Multi-Point Correlation Data</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voc (V)</TableHead>
                      <TableHead>Sensor Temp (°C)</TableHead>
                      <TableHead>Irradiance (W/m²)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {correlationData.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Input value={d.vocMeas} onChange={(e) => {
                            const newData = [...correlationData];
                            newData[i] = { ...d, vocMeas: parseFloat(e.target.value) || 0 };
                            setCorrelationData(newData);
                          }} className="font-mono w-24 h-8" />
                        </TableCell>
                        <TableCell>
                          <Input value={d.tempSensor} onChange={(e) => {
                            const newData = [...correlationData];
                            newData[i] = { ...d, tempSensor: parseFloat(e.target.value) || 0 };
                            setCorrelationData(newData);
                          }} className="font-mono w-24 h-8" />
                        </TableCell>
                        <TableCell>
                          <Input value={d.irr} onChange={(e) => {
                            const newData = [...correlationData];
                            newData[i] = { ...d, irr: parseFloat(e.target.value) || 0 };
                            setCorrelationData(newData);
                          }} className="font-mono w-24 h-8" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Sensor vs ECT Correlation</CardTitle>
              <CardDescription>Comparison of back-of-module sensor temperature and ECT from Voc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={ectCorrelation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="tempSensor" label={{ value: "Sensor Temperature (°C)", position: "insideBottom", offset: -5 }} tick={{ fontSize: 11 }} />
                  <YAxis label={{ value: "ECT (°C)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine stroke="#94a3b8" strokeDasharray="5 5" segment={[{ x: 20, y: 20 }, { x: 55, y: 55 }]} />
                  <Line type="monotone" dataKey="ectVoc" stroke="#2563eb" name="ECT from Voc" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>

              {result && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">ECT</div>
                    <div className="font-bold font-mono text-lg">{result.ect.toFixed(1)} °C</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Voc Measured</div>
                    <div className="font-bold font-mono">{result.vocMeasured} V</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Voc STC</div>
                    <div className="font-bold font-mono">{result.vocSTC} V</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">Irradiance</div>
                    <div className="font-bold font-mono">{result.irradiance} W/m²</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={5} title="ECT Determination Report" standard="IEC 60904-5 Ed.2" />
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Equivalent Cell Temperature</TableCell><TableCell className="font-mono font-bold">{result.ect.toFixed(2)}</TableCell><TableCell>°C</TableCell></TableRow>
                      <TableRow><TableCell>Measured Voc</TableCell><TableCell className="font-mono">{result.vocMeasured}</TableCell><TableCell>V</TableCell></TableRow>
                      <TableRow><TableCell>Voc at STC</TableCell><TableCell className="font-mono">{result.vocSTC}</TableCell><TableCell>V</TableCell></TableRow>
                      <TableRow><TableCell>β_Voc</TableCell><TableCell className="font-mono">{result.betaVoc}</TableCell><TableCell>V/°C</TableCell></TableRow>
                      <TableRow><TableCell>Irradiance</TableCell><TableCell className="font-mono">{result.irradiance}</TableCell><TableCell>W/m²</TableCell></TableRow>
                    </TableBody>
                  </Table>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Document: {docNumber} | Standard: IEC 60904-5 Ed.2 | ISO/IEC 17025 compliant</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Calculate ECT first to view results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
