// @ts-nocheck
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Thermometer,
  Sun,
  Wind,
  Gauge,
  TrendingDown,
  Activity,
  FileDown,
  Calculator,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  type NMOTInput,
  type ModuleSpecs,
  type NMOTResult,
  calculateNMOT,
  calculateNOCT,
  calculateCellTemp,
  calculatePerformanceAtNMOT,
  generateIrradianceTempModel,
  generatePRCurve,
  DEFAULT_MODULE_SPECS,
} from "@/lib/nmot-noct";

export default function NMOTNOCTPage() {
  const [moduleSpecs, setModuleSpecs] = useState<ModuleSpecs>(DEFAULT_MODULE_SPECS);
  const [nmotInput, setNmotInput] = useState<NMOTInput>({
    nocTmeasured: 43,
    windSpeed: 1,
    ambientTemp: 20,
    irradiance: 800,
    mountingType: "open_rack",
  });

  const nmotValue = useMemo(() => calculateNMOT(nmotInput), [nmotInput]);
  const noctValue = useMemo(() => calculateNOCT(nmotInput.nocTmeasured, nmotInput.mountingType), [nmotInput]);

  const performanceResult = useMemo(
    () => calculatePerformanceAtNMOT(moduleSpecs, nmotValue, nmotInput.irradiance),
    [moduleSpecs, nmotValue, nmotInput.irradiance]
  );

  const tempModelData = useMemo(() => generateIrradianceTempModel(nmotValue), [nmotValue]);
  const prCurveData = useMemo(() => generatePRCurve(moduleSpecs, nmotValue), [moduleSpecs, nmotValue]);

  // Group temp model data by irradiance for line chart
  const irradianceLevels = [200, 400, 600, 800, 1000, 1200];
  const irradianceChartData = useMemo(() => {
    const ambients = [0, 10, 20, 30, 40, 50];
    return ambients.map((ta) => {
      const row: Record<string, number> = { ambient: ta };
      for (const g of irradianceLevels) {
        const found = tempModelData.find((d) => d.ambient === ta && d.irradiance === g);
        row[`G${g}`] = found?.cellTemp ?? 0;
      }
      return row;
    });
  }, [tempModelData, nmotValue]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NMOT / NOCT Calculator</h1>
          <p className="text-muted-foreground">
            IEC 61215 Nominal Module Operating Temperature and performance derating
          </p>
        </div>
        <Button size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          PDF Report
        </Button>
      </div>

      {/* Input Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Module Specs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Module Specifications (STC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label className="text-xs">Pmax (W)</Label>
                <Input
                  type="number"
                  value={moduleSpecs.pmaxSTC}
                  onChange={(e) => setModuleSpecs((s) => ({ ...s, pmaxSTC: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Voc (V)</Label>
                <Input
                  type="number"
                  value={moduleSpecs.vocSTC}
                  onChange={(e) => setModuleSpecs((s) => ({ ...s, vocSTC: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Isc (A)</Label>
                <Input
                  type="number"
                  value={moduleSpecs.iscSTC}
                  onChange={(e) => setModuleSpecs((s) => ({ ...s, iscSTC: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">FF (%)</Label>
                <Input
                  type="number"
                  value={moduleSpecs.ffSTC}
                  onChange={(e) => setModuleSpecs((s) => ({ ...s, ffSTC: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">γ(Pmax) (%/°C)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={moduleSpecs.tempCoefficients.alphaPmax}
                  onChange={(e) =>
                    setModuleSpecs((s) => ({
                      ...s,
                      tempCoefficients: { ...s.tempCoefficients, alphaPmax: parseFloat(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">β(Voc) (%/°C)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={moduleSpecs.tempCoefficients.alphaVoc}
                  onChange={(e) =>
                    setModuleSpecs((s) => ({
                      ...s,
                      tempCoefficients: { ...s.tempCoefficients, alphaVoc: parseFloat(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">α(Isc) (%/°C)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={moduleSpecs.tempCoefficients.alphaIsc}
                  onChange={(e) =>
                    setModuleSpecs((s) => ({
                      ...s,
                      tempCoefficients: { ...s.tempCoefficients, alphaIsc: parseFloat(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NMOT Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" />
              NMOT / NOCT Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label className="text-xs">Measured NOCT (°C)</Label>
                <Input
                  type="number"
                  value={nmotInput.nocTmeasured}
                  onChange={(e) => setNmotInput((s) => ({ ...s, nocTmeasured: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Wind Speed (m/s)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={nmotInput.windSpeed}
                  onChange={(e) => setNmotInput((s) => ({ ...s, windSpeed: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Ambient Temp (°C)</Label>
                <Input
                  type="number"
                  value={nmotInput.ambientTemp}
                  onChange={(e) => setNmotInput((s) => ({ ...s, ambientTemp: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label className="text-xs">Irradiance (W/m²)</Label>
                <Input
                  type="number"
                  value={nmotInput.irradiance}
                  onChange={(e) => setNmotInput((s) => ({ ...s, irradiance: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Mounting Type</Label>
                <Select
                  value={nmotInput.mountingType}
                  onValueChange={(v) => setNmotInput((s) => ({ ...s, mountingType: v as NMOTInput["mountingType"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open_rack">Open Rack (+0°C)</SelectItem>
                    <SelectItem value="close_roof">Close Roof Mount (+3°C)</SelectItem>
                    <SelectItem value="bipv">BIPV (+6°C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results KPIs */}
      <div className="grid gap-4 md:grid-cols-6">
        <ResultKPI icon={Thermometer} label="NMOT" value={`${nmotValue.toFixed(1)}°C`} desc="IEC 61215:2021" />
        <ResultKPI icon={Thermometer} label="NOCT" value={`${noctValue.toFixed(1)}°C`} desc="Legacy IEC 61215" />
        <ResultKPI icon={Thermometer} label="Cell Temp" value={`${performanceResult.cellTemp.toFixed(1)}°C`} desc={`at ${nmotInput.irradiance} W/m²`} />
        <ResultKPI icon={Gauge} label="Perf. Ratio" value={`${(performanceResult.performanceRatio * 100).toFixed(1)}%`} desc="PR at NMOT" />
        <ResultKPI icon={TrendingDown} label="Temp Derate" value={`${(performanceResult.tempDerate * 100).toFixed(2)}%`} desc="Power derating" />
        <ResultKPI icon={Activity} label="Pmax (NMOT)" value={`${performanceResult.correctedPmax.toFixed(1)} W`} desc={`from ${moduleSpecs.pmaxSTC} W STC`} />
      </div>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance at NMOT Conditions</CardTitle>
          <CardDescription>
            Corrected electrical parameters at NMOT = {nmotValue.toFixed(1)}°C, {nmotInput.irradiance} W/m²
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead className="text-right">STC Value</TableHead>
                <TableHead className="text-right">NMOT Value</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Change %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { param: "Pmax", stc: moduleSpecs.pmaxSTC, nmot: performanceResult.correctedPmax, unit: "W" },
                { param: "Voc", stc: moduleSpecs.vocSTC, nmot: performanceResult.correctedVoc, unit: "V" },
                { param: "Isc", stc: moduleSpecs.iscSTC, nmot: performanceResult.correctedIsc, unit: "A" },
              ].map((r) => {
                const change = r.nmot - r.stc;
                const changePct = (change / r.stc) * 100;
                return (
                  <TableRow key={r.param}>
                    <TableCell className="font-medium">{r.param}</TableCell>
                    <TableCell className="text-right font-mono">{r.stc.toFixed(3)} {r.unit}</TableCell>
                    <TableCell className="text-right font-mono font-medium">{r.nmot.toFixed(3)} {r.unit}</TableCell>
                    <TableCell className={`text-right font-mono ${change < 0 ? "text-red-500" : "text-green-600"}`}>
                      {change >= 0 ? "+" : ""}{change.toFixed(3)} {r.unit}
                    </TableCell>
                    <TableCell className={`text-right font-mono ${changePct < 0 ? "text-red-500" : "text-green-600"}`}>
                      {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Irradiance vs Cell Temp */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cell Temperature vs Ambient</CardTitle>
            <CardDescription>At different irradiance levels (NMOT = {nmotValue.toFixed(1)}°C)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={irradianceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ambient" label={{ value: "Ambient (°C)", position: "insideBottomRight", offset: -5 }} />
                <YAxis label={{ value: "Cell Temp (°C)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                {irradianceLevels.map((g, i) => {
                  const colors = ["#3b82f6", "#22c55e", "#eab308", "#f97316", "#ef4444", "#a855f7"];
                  return (
                    <Line
                      key={g}
                      type="monotone"
                      dataKey={`G${g}`}
                      stroke={colors[i]}
                      strokeWidth={2}
                      dot={false}
                      name={`${g} W/m²`}
                    />
                  );
                })}
                <ReferenceLine y={25} stroke="#666" strokeDasharray="3 3" label="STC" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Ratio Curve */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Ratio vs Ambient Temperature</CardTitle>
            <CardDescription>At 800 W/m² irradiance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={prCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ambient" label={{ value: "Ambient (°C)", position: "insideBottomRight", offset: -5 }} />
                <YAxis
                  yAxisId="pr"
                  domain={[80, 115]}
                  label={{ value: "PR (%)", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="power"
                  orientation="right"
                  label={{ value: "Power (W)", angle: 90, position: "insideRight" }}
                />
                <Tooltip />
                <Legend />
                <ReferenceLine yAxisId="pr" y={100} stroke="#22c55e" strokeDasharray="3 3" label="100%" />
                <Line yAxisId="pr" type="monotone" dataKey="pr" stroke="#f97316" strokeWidth={2} dot={false} name="PR (%)" />
                <Line yAxisId="power" type="monotone" dataKey="power" stroke="#3b82f6" strokeWidth={2} dot={false} name="Power (W)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultKPI({
  icon: Icon,
  label,
  value,
  desc,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-[10px] text-muted-foreground">{desc}</div>
      </CardContent>
    </Card>
  );
}
