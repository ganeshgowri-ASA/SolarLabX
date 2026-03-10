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
import LinearityChart from "@/components/iec60904/LinearityChart";
import { generateDocNumber, analyzeLinearity, type LinearityPoint, type LinearityResult } from "@/lib/iec60904";

const DEFAULT_LINEARITY_DATA: LinearityPoint[] = [
  { irradiance: 100, isc: 0.96 },
  { irradiance: 200, isc: 1.91 },
  { irradiance: 300, isc: 2.87 },
  { irradiance: 400, isc: 3.82 },
  { irradiance: 500, isc: 4.78 },
  { irradiance: 600, isc: 5.72 },
  { irradiance: 700, isc: 6.68 },
  { irradiance: 800, isc: 7.62 },
  { irradiance: 900, isc: 8.58 },
  { irradiance: 1000, isc: 9.52 },
  { irradiance: 1100, isc: 10.45 },
  { irradiance: 1200, isc: 11.38 },
];

export default function Part10Page() {
  const [docNumber] = useState(() => generateDocNumber(10, "protocol"));
  const [data, setData] = useState(DEFAULT_LINEARITY_DATA);
  const [result, setResult] = useState<LinearityResult | null>(null);

  function handleAnalyze() {
    if (data.length >= 2) {
      setResult(analyzeLinearity(data));
    }
  }

  function updatePoint(index: number, field: "irradiance" | "isc", value: string) {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: parseFloat(value) || 0 };
    setData(newData);
  }

  function addPoint() {
    const lastG = data.length > 0 ? data[data.length - 1].irradiance + 100 : 100;
    setData([...data, { irradiance: lastG, isc: 0 }]);
  }

  function removePoint(index: number) {
    setData(data.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-10: Linearity</h1>
        <p className="text-muted-foreground mt-1">Methods of linearity measurement - Isc vs irradiance</p>
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
              <DocumentHeader docNumber={docNumber} partNumber={10} title="Linearity Measurement Protocol" standard="IEC 60904-10 Ed.2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Purpose</h3>
                <p className="text-sm text-muted-foreground">
                  Verify that the short-circuit current of a PV device is linearly proportional to
                  irradiance. Non-linearity must be quantified and accounted for in uncertainty budgets.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Procedure</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Set up solar simulator or natural sunlight with calibrated attenuators</li>
                  <li>Measure Isc at minimum 8 irradiance levels (100-1200 W/m²)</li>
                  <li>Maintain constant temperature (± 2°C)</li>
                  <li>Record irradiance from calibrated reference cell</li>
                  <li>Perform linear regression: Isc = slope × G + intercept</li>
                  <li>Calculate deviation at each point from linear fit</li>
                  <li>Maximum deviation &lt; 2% indicates acceptable linearity</li>
                </ol>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm mb-2">Acceptance Criteria</h3>
                <Table>
                  <TableBody>
                    <TableRow><TableCell>Max deviation from linearity</TableCell><TableCell className="font-mono">&lt; ± 2%</TableCell></TableRow>
                    <TableRow><TableCell>R² (coefficient of determination)</TableCell><TableCell className="font-mono">&gt; 0.999</TableCell></TableRow>
                    <TableRow><TableCell>Minimum irradiance levels</TableCell><TableCell className="font-mono">≥ 8 points</TableCell></TableRow>
                    <TableRow><TableCell>Irradiance range</TableCell><TableCell className="font-mono">100 - 1200 W/m²</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Point Calibration Data</CardTitle>
              <CardDescription>Enter Isc at multiple irradiance levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Point</TableHead>
                    <TableHead>Irradiance (W/m²)</TableHead>
                    <TableHead>Isc (A)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Input value={d.irradiance} onChange={(e) => updatePoint(i, "irradiance", e.target.value)} className="font-mono w-28 h-8" />
                      </TableCell>
                      <TableCell>
                        <Input value={d.isc} onChange={(e) => updatePoint(i, "isc", e.target.value)} className="font-mono w-28 h-8" />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removePoint(i)} className="text-red-500">Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex gap-2">
                <Button variant="outline" onClick={addPoint}>Add Point</Button>
                <Button onClick={handleAnalyze}>Analyze Linearity</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Linearity Analysis</CardTitle>
              <CardDescription>Isc vs Irradiance with linear fit and deviation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result ? (
                <>
                  <LinearityChart result={result} />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">R²</div>
                      <div className="font-bold font-mono">{result.rSquared.toFixed(6)}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Max Deviation</div>
                      <div className="font-bold font-mono">{result.maxDeviation.toFixed(3)}%</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Slope</div>
                      <div className="font-bold font-mono">{result.slope.toFixed(6)}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Linear?</div>
                      <StatusBadge status={result.isLinear ? "pass" : "fail"} size="sm" label={result.isLinear ? "YES" : "NO"} />
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Irradiance</TableHead>
                        <TableHead>Normalized Isc</TableHead>
                        <TableHead>Linear Fit</TableHead>
                        <TableHead>Deviation (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.normalizedData.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono">{d.irradiance}</TableCell>
                          <TableCell className="font-mono">{d.normalizedIsc.toFixed(4)}</TableCell>
                          <TableCell className="font-mono">{d.linearFit.toFixed(4)}</TableCell>
                          <TableCell className={`font-mono ${Math.abs(d.deviation) > 2 ? "text-red-500" : ""}`}>{d.deviation.toFixed(3)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-12">Enter data and click analyze.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={10} title="Linearity Measurement Report" standard="IEC 60904-10 Ed.2" />
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Parameter</TableHead><TableHead>Value</TableHead><TableHead>Criteria</TableHead><TableHead>Status</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>R²</TableCell>
                        <TableCell className="font-mono">{result.rSquared.toFixed(6)}</TableCell>
                        <TableCell>&gt; 0.999</TableCell>
                        <TableCell><StatusBadge status={result.rSquared > 0.999 ? "pass" : "fail"} size="sm" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Max Deviation</TableCell>
                        <TableCell className="font-mono">{result.maxDeviation.toFixed(3)}%</TableCell>
                        <TableCell>&lt; 2%</TableCell>
                        <TableCell><StatusBadge status={result.isLinear ? "pass" : "fail"} size="sm" /></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Data Points</TableCell>
                        <TableCell className="font-mono">{result.data.length}</TableCell>
                        <TableCell>≥ 8</TableCell>
                        <TableCell><StatusBadge status={result.data.length >= 8 ? "pass" : "fail"} size="sm" /></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Document: {docNumber} | Standard: IEC 60904-10 Ed.2 | ISO/IEC 17025 compliant</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Analyze data first to view results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
