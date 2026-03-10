"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SPCChart from "@/components/sun-simulator/SPCChart";
import {
  calculateSPC,
  calculateGageRR,
  type SPCDataPoint,
  type SPCResult,
  type GageRRResult,
} from "@/lib/sun-simulator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// Generate realistic SPC sample data: 20 subgroups of 5
function generateSPCData(): SPCDataPoint[] {
  const data: SPCDataPoint[] = [];
  const mean = 1000;
  for (let i = 1; i <= 20; i++) {
    const values: number[] = [];
    for (let j = 0; j < 5; j++) {
      values.push(Math.round((mean + (Math.random() - 0.5) * 10) * 100) / 100);
    }
    data.push({ subgroup: i, values });
  }
  return data;
}

// Generate Gage R&R sample data: 3 operators x 5 parts x 3 trials
function generateGageRRData(): number[][][] {
  const data: number[][][] = [];
  const partMeans = [998.5, 999.2, 1000.0, 1000.8, 1001.5];
  for (let op = 0; op < 3; op++) {
    const opData: number[][] = [];
    const opBias = (op - 1) * 0.3; // slight operator bias
    for (let p = 0; p < 5; p++) {
      const trials: number[] = [];
      for (let t = 0; t < 3; t++) {
        trials.push(Math.round((partMeans[p] + opBias + (Math.random() - 0.5) * 1.5) * 100) / 100);
      }
      opData.push(trials);
    }
    data.push(opData);
  }
  return data;
}

export default function SPCPage() {
  // SPC State
  const [spcData, setSpcData] = useState<SPCDataPoint[]>(generateSPCData);
  const [subgroupSize] = useState(5);
  const [usl, setUsl] = useState(1010);
  const [lsl, setLsl] = useState(990);
  const [spcResult, setSpcResult] = useState<SPCResult | null>(null);

  // Gage R&R State
  const [gageData, setGageData] = useState<number[][][]>(generateGageRRData);
  const [gageResult, setGageResult] = useState<GageRRResult | null>(null);

  function handleSPCCalc() {
    setSpcResult(calculateSPC(spcData, usl, lsl));
  }

  function handleGageCalc() {
    setGageResult(calculateGageRR(gageData));
  }

  function regenerateSPC() {
    const newData = generateSPCData();
    setSpcData(newData);
    setSpcResult(null);
  }

  function regenerateGage() {
    const newData = generateGageRRData();
    setGageData(newData);
    setGageResult(null);
  }

  const cpkColor = spcResult
    ? spcResult.cpk >= 1.33 ? "text-green-600" : spcResult.cpk >= 1.0 ? "text-yellow-600" : "text-red-600"
    : "";

  const cpColor = spcResult
    ? spcResult.cp >= 1.33 ? "text-green-600" : spcResult.cp >= 1.0 ? "text-yellow-600" : "text-red-600"
    : "";

  const gageVarianceData = gageResult
    ? [
        { component: "Repeatability", variance: gageResult.repeatability ** 2, pct: (gageResult.repeatability ** 2 / gageResult.totalVariation ** 2) * 100 },
        { component: "Reproducibility", variance: gageResult.reproducibility ** 2, pct: (gageResult.reproducibility ** 2 / gageResult.totalVariation ** 2) * 100 },
        { component: "Part-to-Part", variance: gageResult.partVariation ** 2, pct: (gageResult.partVariation ** 2 / gageResult.totalVariation ** 2) * 100 },
      ]
    : [];

  const gageColors = ["#ef4444", "#f97316", "#22c55e"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SPC Charts & MSA</h1>
        <p className="text-muted-foreground mt-1">
          Statistical Process Control and Measurement System Analysis for sun simulator quality monitoring
        </p>
      </div>

      <Tabs defaultValue="xbar">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="xbar">X-bar R Chart</TabsTrigger>
          <TabsTrigger value="gagerr">Gage R&R</TabsTrigger>
        </TabsList>

        {/* X-bar R Chart Tab */}
        <TabsContent value="xbar">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SPC Configuration</CardTitle>
                <CardDescription>
                  {spcData.length} subgroups of {subgroupSize} measurements each
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end flex-wrap">
                  <div>
                    <Label>USL (Upper Spec Limit)</Label>
                    <Input
                      type="number"
                      value={usl}
                      onChange={(e) => setUsl(parseFloat(e.target.value) || 1010)}
                      className="w-32"
                    />
                  </div>
                  <div>
                    <Label>LSL (Lower Spec Limit)</Label>
                    <Input
                      type="number"
                      value={lsl}
                      onChange={(e) => setLsl(parseFloat(e.target.value) || 990)}
                      className="w-32"
                    />
                  </div>
                  <Button variant="outline" onClick={regenerateSPC}>
                    Regenerate Sample Data
                  </Button>
                  <Button onClick={handleSPCCalc}>Calculate SPC</Button>
                </div>

                {/* Data table preview */}
                <div className="max-h-48 overflow-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subgroup</TableHead>
                        {Array.from({ length: subgroupSize }, (_, i) => (
                          <TableHead key={i} className="text-center">M{i + 1}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spcData.map((sg) => (
                        <TableRow key={sg.subgroup}>
                          <TableCell className="font-medium">{sg.subgroup}</TableCell>
                          {sg.values.map((v, i) => (
                            <TableCell key={i} className="text-center font-mono text-sm">
                              {v.toFixed(2)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {spcResult && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <SPCChart result={spcResult} type="xbar" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <SPCChart result={spcResult} type="range" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Process Capability</CardTitle>
                    <CardDescription>Cp and Cpk indices with USL={usl}, LSL={lsl}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Cp</p>
                        <p className={`text-3xl font-bold ${cpColor}`}>{spcResult.cp.toFixed(3)}</p>
                        <Badge variant={spcResult.cp >= 1.33 ? "success" : spcResult.cp >= 1.0 ? "warning" : "destructive"}>
                          {spcResult.cp >= 1.33 ? "Capable" : spcResult.cp >= 1.0 ? "Marginal" : "Not Capable"}
                        </Badge>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Cpk</p>
                        <p className={`text-3xl font-bold ${cpkColor}`}>{spcResult.cpk.toFixed(3)}</p>
                        <Badge variant={spcResult.cpk >= 1.33 ? "success" : spcResult.cpk >= 1.0 ? "warning" : "destructive"}>
                          {spcResult.cpk >= 1.33 ? "Capable" : spcResult.cpk >= 1.0 ? "Marginal" : "Not Capable"}
                        </Badge>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">X-bar Mean</p>
                        <p className="text-3xl font-bold">{spcResult.xBarMean.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">R Mean</p>
                        <p className="text-3xl font-bold">{spcResult.rMean.toFixed(3)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Gage R&R Tab */}
        <TabsContent value="gagerr">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gage R&R Configuration</CardTitle>
                <CardDescription>
                  3 operators, 5 parts, 3 trials per measurement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div>
                    <Label>Operators</Label>
                    <Input type="number" value={3} disabled className="w-20" />
                  </div>
                  <div>
                    <Label>Parts</Label>
                    <Input type="number" value={5} disabled className="w-20" />
                  </div>
                  <div>
                    <Label>Trials</Label>
                    <Input type="number" value={3} disabled className="w-20" />
                  </div>
                  <Button variant="outline" onClick={regenerateGage}>
                    Regenerate Data
                  </Button>
                  <Button onClick={handleGageCalc}>Calculate Gage R&R</Button>
                </div>

                {/* Data display */}
                <div className="max-h-64 overflow-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operator</TableHead>
                        <TableHead>Part</TableHead>
                        <TableHead className="text-center">Trial 1</TableHead>
                        <TableHead className="text-center">Trial 2</TableHead>
                        <TableHead className="text-center">Trial 3</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gageData.map((op, oi) =>
                        op.map((part, pi) => (
                          <TableRow key={`${oi}-${pi}`}>
                            {pi === 0 && (
                              <TableCell rowSpan={op.length} className="font-medium border-r">
                                Op {oi + 1}
                              </TableCell>
                            )}
                            <TableCell>Part {pi + 1}</TableCell>
                            {part.map((v, ti) => (
                              <TableCell key={ti} className="text-center font-mono text-sm">
                                {v.toFixed(2)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {gageResult && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Gage R&R Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Repeatability (EV)</p>
                        <p className="text-2xl font-bold">{gageResult.repeatability.toFixed(4)}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Reproducibility (AV)</p>
                        <p className="text-2xl font-bold">{gageResult.reproducibility.toFixed(4)}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Gage R&R</p>
                        <p className="text-2xl font-bold">{gageResult.gageRR.toFixed(4)}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Part Variation (PV)</p>
                        <p className="text-2xl font-bold">{gageResult.partVariation.toFixed(4)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 rounded-lg border-2" style={{
                        borderColor: gageResult.gageRRPercent <= 10 ? "#22c55e" : gageResult.gageRRPercent <= 30 ? "#eab308" : "#ef4444"
                      }}>
                        <p className="text-sm text-muted-foreground mb-1">Gage R&R %</p>
                        <p className={`text-4xl font-bold ${
                          gageResult.gageRRPercent <= 10 ? "text-green-600" : gageResult.gageRRPercent <= 30 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {gageResult.gageRRPercent.toFixed(2)}%
                        </p>
                        <Badge
                          variant={gageResult.gageRRPercent <= 10 ? "success" : gageResult.gageRRPercent <= 30 ? "warning" : "destructive"}
                          className="mt-2"
                        >
                          {gageResult.gageRRPercent <= 10 ? "Acceptable" : gageResult.gageRRPercent <= 30 ? "Marginal" : "Unacceptable"}
                        </Badge>
                      </div>
                      <div className="text-center p-6 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">NDC (Distinct Categories)</p>
                        <p className={`text-4xl font-bold ${gageResult.ndc >= 5 ? "text-green-600" : "text-red-600"}`}>
                          {gageResult.ndc}
                        </p>
                        <Badge variant={gageResult.ndc >= 5 ? "success" : "destructive"} className="mt-2">
                          {gageResult.ndc >= 5 ? "Adequate" : "Inadequate"} (need &ge; 5)
                        </Badge>
                      </div>
                      <div className="text-center p-6 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-1">Total Variation</p>
                        <p className="text-4xl font-bold">{gageResult.totalVariation.toFixed(4)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Variance Components</CardTitle>
                    <CardDescription>Breakdown of measurement system variation sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={gageVarianceData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="component" tick={{ fontSize: 12 }} />
                        <YAxis label={{ value: "% of Total Variation", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => v.toFixed(2) + "%"} />
                        <Bar dataKey="pct" name="% Contribution">
                          {gageVarianceData.map((_, i) => (
                            <Cell key={i} fill={gageColors[i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
