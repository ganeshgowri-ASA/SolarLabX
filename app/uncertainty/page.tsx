"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator,
  BarChart3,
  FlaskConical,
  Zap,
  Thermometer,
  FileText,
  Plus,
  Trash2,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";

// Utility Functions

function toStandardUncertainty(value: number, distribution: string): number {
  switch (distribution) {
    case "Normal":
      return value;
    case "Uniform":
      return value / Math.sqrt(3);
    case "Triangular":
      return value / Math.sqrt(6);
    default:
      return value;
  }
}

function computeCombinedUncertainty(components: UncertaintyComponent[]): number {
  const sumVariance = components.reduce((sum, c) => {
    const ui = toStandardUncertainty(c.value, c.distribution);
    return sum + Math.pow(c.sensitivityCoefficient * ui, 2);
  }, 0);
  return Math.sqrt(sumVariance);
}

function welchSatterthwaite(components: UncertaintyComponent[], uc: number): number {
  if (uc === 0) return Infinity;
  const uc4 = Math.pow(uc, 4);
  const denominator = components.reduce((sum, c) => {
    const ui = toStandardUncertainty(c.value, c.distribution);
    const ciui = c.sensitivityCoefficient * ui;
    const dof = c.degreesOfFreedom;
    if (!isFinite(dof) || dof === 0) return sum;
    return sum + Math.pow(ciui, 4) / dof;
  }, 0);
  if (denominator === 0) return Infinity;
  return Math.round(uc4 / denominator);
}

function coverageFactorLookup(dof: number): number {
  if (!isFinite(dof) || dof >= 100) return 2.0;
  const table: Record<number, number> = {
    1: 12.71, 2: 4.30, 3: 3.18, 4: 2.78, 5: 2.57,
    6: 2.45, 7: 2.36, 8: 2.31, 9: 2.26, 10: 2.23,
    15: 2.13, 20: 2.09, 25: 2.06, 30: 2.04, 50: 2.01,
  };
  if (table[dof]) return table[dof];
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let lower = keys[0];
  let upper = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (keys[i] <= dof && keys[i + 1] >= dof) {
      lower = keys[i];
      upper = keys[i + 1];
      break;
    }
  }
  const frac = (dof - lower) / (upper - lower);
  return table[lower] + frac * (table[upper] - table[lower]);
}

// Types

interface UncertaintyComponent {
  id: string;
  sourceName: string;
  type: "Type A" | "Type B";
  distribution: "Normal" | "Uniform" | "Triangular";
  value: number;
  sensitivityCoefficient: number;
  degreesOfFreedom: number;
  unit: string;
}

// Default Data

const DEFAULT_COMPONENTS: UncertaintyComponent[] = [
  { id: "1", sourceName: "Reference cell calibration", type: "Type B", distribution: "Normal", value: 1.5, sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, unit: "%" },
  { id: "2", sourceName: "Spatial non-uniformity", type: "Type B", distribution: "Uniform", value: 2.0, sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, unit: "%" },
  { id: "3", sourceName: "Spectral mismatch", type: "Type B", distribution: "Normal", value: 1.0, sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, unit: "%" },
  { id: "4", sourceName: "Temperature measurement", type: "Type B", distribution: "Normal", value: 1.0, sensitivityCoefficient: 0.4, degreesOfFreedom: Infinity, unit: "\u00b0C" },
  { id: "5", sourceName: "Current measurement", type: "Type B", distribution: "Normal", value: 0.1, sensitivityCoefficient: 1.0, degreesOfFreedom: Infinity, unit: "%" },
  { id: "6", sourceName: "Repeatability", type: "Type A", distribution: "Normal", value: 0.3, sensitivityCoefficient: 1.0, degreesOfFreedom: 9, unit: "%" },
];

const CHART_COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#16a34a", "#0891b2", "#d97706", "#4f46e5"];

// Main Component

export default function UncertaintyDashboard() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Uncertainty Calculator</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          ISO/IEC 17025 compliant measurement uncertainty evaluation using the GUM
          (JCGM 100:2008) methodology. Calculate Type A and Type B uncertainties,
          perform Monte Carlo simulations, and generate accreditation-ready budget reports.
        </p>
      </div>

      <Tabs defaultValue="gum" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="gum" className="flex items-center gap-1.5 text-xs">
            <Calculator className="h-3.5 w-3.5" /> GUM Calculator
          </TabsTrigger>
          <TabsTrigger value="typeA" className="flex items-center gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> Type A Analysis
          </TabsTrigger>
          <TabsTrigger value="montecarlo" className="flex items-center gap-1.5 text-xs">
            <FlaskConical className="h-3.5 w-3.5" /> Monte Carlo
          </TabsTrigger>
          <TabsTrigger value="ivcurve" className="flex items-center gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" /> IV Curve Uncertainty
          </TabsTrigger>
          <TabsTrigger value="environmental" className="flex items-center gap-1.5 text-xs">
            <Thermometer className="h-3.5 w-3.5" /> Environmental
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Budget Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gum"><GUMCalculatorTab /></TabsContent>
        <TabsContent value="typeA"><TypeATab /></TabsContent>
        <TabsContent value="montecarlo"><MonteCarloTab /></TabsContent>
        <TabsContent value="ivcurve"><IVCurveTab /></TabsContent>
        <TabsContent value="environmental"><EnvironmentalTab /></TabsContent>
        <TabsContent value="reports"><BudgetReportsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// Tab 1: GUM Calculator

function GUMCalculatorTab() {
  const [measurand, setMeasurand] = useState("Pmax");
  const [measuredValue, setMeasuredValue] = useState(405.2);
  const [unit, setUnit] = useState("W");
  const [components, setComponents] = useState<UncertaintyComponent[]>(DEFAULT_COMPONENTS);
  const [nextId, setNextId] = useState(7);

  const [newSource, setNewSource] = useState("");
  const [newType, setNewType] = useState<"Type A" | "Type B">("Type B");
  const [newDist, setNewDist] = useState<"Normal" | "Uniform" | "Triangular">("Normal");
  const [newValue, setNewValue] = useState("");
  const [newCi, setNewCi] = useState("1.0");
  const [newDof, setNewDof] = useState("");
  const [newUnit, setNewUnit] = useState("%");

  const results = useMemo(() => {
    const uc = computeCombinedUncertainty(components);
    const veff = welchSatterthwaite(components, uc);
    const k = coverageFactorLookup(veff);
    const U = k * uc;
    const relU = measuredValue !== 0 ? (U / measuredValue) * 100 : 0;

    const budgetRows = components.map((c) => {
      const ui = toStandardUncertainty(c.value, c.distribution);
      const ciui = c.sensitivityCoefficient * ui;
      const variance = ciui * ciui;
      return { ...c, ui, ciui, variance };
    });

    const totalVariance = budgetRows.reduce((s, r) => s + r.variance, 0);
    const budgetWithPercent = budgetRows.map((r) => ({
      ...r,
      percentContribution: totalVariance > 0 ? (r.variance / totalVariance) * 100 : 0,
    }));

    return { uc, veff, k, U, relU, budget: budgetWithPercent, totalVariance };
  }, [components, measuredValue]);

  const paretoData = useMemo(() => {
    return [...results.budget]
      .sort((a, b) => b.percentContribution - a.percentContribution)
      .map((r) => ({
        name: r.sourceName.length > 18 ? r.sourceName.slice(0, 16) + "..." : r.sourceName,
        fullName: r.sourceName,
        contribution: parseFloat(r.percentContribution.toFixed(1)),
      }));
  }, [results.budget]);

  function addComponent() {
    if (!newSource || !newValue) return;
    const comp: UncertaintyComponent = {
      id: String(nextId),
      sourceName: newSource,
      type: newType,
      distribution: newDist,
      value: parseFloat(newValue),
      sensitivityCoefficient: parseFloat(newCi) || 1.0,
      degreesOfFreedom: newType === "Type B" ? Infinity : (newDof ? parseFloat(newDof) : Infinity),
      unit: newUnit,
    };
    setComponents([...components, comp]);
    setNextId(nextId + 1);
    setNewSource("");
    setNewValue("");
    setNewCi("1.0");
    setNewDof("");
  }

  function removeComponent(id: string) {
    setComponents(components.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Measurand Definition</CardTitle>
          <CardDescription>Define the measurement quantity and its value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Measurand Name</Label>
              <Input value={measurand} onChange={(e) => setMeasurand(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Measured Value</Label>
              <Input type="number" value={measuredValue} onChange={(e) => setMeasuredValue(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Uncertainty Component</CardTitle>
          <CardDescription>Define a new source of uncertainty to include in the budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3 items-end">
            <div className="space-y-2">
              <Label className="text-xs">Source Name</Label>
              <Input placeholder="e.g. DAQ resolution" value={newSource} onChange={(e) => setNewSource(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as "Type A" | "Type B")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Type A">Type A</SelectItem>
                  <SelectItem value="Type B">Type B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Distribution</Label>
              <Select value={newDist} onValueChange={(v) => setNewDist(v as "Normal" | "Uniform" | "Triangular")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Uniform">Uniform</SelectItem>
                  <SelectItem value="Triangular">Triangular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Value</Label>
              <Input type="number" placeholder="0.0" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sensitivity Coeff. (ci)</Label>
              <Input type="number" value={newCi} onChange={(e) => setNewCi(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Degrees of Freedom</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder={newType === "Type B" ? "\u221e" : "n-1"}
                  value={newDof}
                  onChange={(e) => setNewDof(e.target.value)}
                />
                <Button onClick={addComponent} size="icon" className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-blue-600 font-medium">Combined Std. Uncertainty (uc)</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">{results.uc.toFixed(4)}</p>
            <p className="text-xs text-blue-500">{unit}</p>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-violet-600 font-medium">Effective DOF (veff)</p>
            <p className="text-2xl font-bold text-violet-800 mt-1">
              {isFinite(results.veff) ? results.veff : "\u221e"}
            </p>
            <p className="text-xs text-violet-500">Welch-Satterthwaite</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-amber-600 font-medium">Coverage Factor (k)</p>
            <p className="text-2xl font-bold text-amber-800 mt-1">{results.k.toFixed(2)}</p>
            <p className="text-xs text-amber-500">95% confidence</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-emerald-600 font-medium">Expanded Uncertainty (U)</p>
            <p className="text-2xl font-bold text-emerald-800 mt-1">{"\u00b1"}{results.U.toFixed(4)}</p>
            <p className="text-xs text-emerald-500">{unit}</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <CardContent className="pt-6 text-center">
            <p className="text-xs text-rose-600 font-medium">Relative Expanded U</p>
            <p className="text-2xl font-bold text-rose-800 mt-1">{"\u00b1"}{results.relU.toFixed(2)}%</p>
            <p className="text-xs text-rose-500">k={results.k.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uncertainty Budget</CardTitle>
          <CardDescription>
            {measurand} = {measuredValue} {unit} | U = {"\u00b1"}{results.U.toFixed(4)} {unit} (k={results.k.toFixed(2)}, 95%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Distribution</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">u(xi)</TableHead>
                <TableHead className="text-right">ci</TableHead>
                <TableHead className="text-right">ci{"\u00b7"}u(xi)</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="w-[200px]">% Contribution</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.budget.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-sm">{row.sourceName}</TableCell>
                  <TableCell>
                    <Badge variant={row.type === "Type A" ? "default" : "secondary"} className="text-xs">
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{row.distribution}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.value.toFixed(3)} {row.unit}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.ui.toFixed(4)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.sensitivityCoefficient.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.ciui.toFixed(4)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.variance.toFixed(6)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.percentContribution} className="h-2 flex-1" />
                      <span className="text-xs font-mono w-12 text-right">{row.percentContribution.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeComponent(row.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sensitivity Analysis - Pareto Chart</CardTitle>
          <CardDescription>Variance contribution of each uncertainty source (sorted descending)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paretoData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "% Contribution", angle: -90, position: "insideLeft" }} />
                <RechartsTooltip />
                <Bar dataKey="contribution" name="% Contribution" radius={[4, 4, 0, 0]}>
                  {paretoData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Tab 2: Type A Analysis

const DEFAULT_MEASUREMENTS = "405.2\n404.8\n405.5\n404.9\n405.1\n405.3\n404.7\n405.4\n405.0\n405.2";

function TypeATab() {
  const [rawData, setRawData] = useState(DEFAULT_MEASUREMENTS);

  const analysis = useMemo(() => {
    const values = rawData
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number)
      .filter((n) => !isNaN(n));

    if (values.length < 2) return null;

    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const stdUncertainty = stdDev / Math.sqrt(n);
    const dof = n - 1;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.max(5, Math.min(15, Math.ceil(Math.sqrt(n))));
    const binWidth = (max - min) / binCount || 0.1;
    const bins: { range: string; center: number; count: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const count = values.filter((v) => (i === binCount - 1 ? v >= lo && v <= hi : v >= lo && v < hi)).length;
      bins.push({
        range: lo.toFixed(2) + "-" + hi.toFixed(2),
        center: (lo + hi) / 2,
        count,
      });
    }

    const m3 = values.reduce((s, v) => s + Math.pow(v - mean, 3), 0) / n;
    const m4 = values.reduce((s, v) => s + Math.pow(v - mean, 4), 0) / n;
    const skewness = stdDev > 0 ? m3 / Math.pow(stdDev, 3) : 0;
    const kurtosis = stdDev > 0 ? m4 / Math.pow(stdDev, 4) - 3 : 0;

    return { values, n, mean, stdDev, stdUncertainty, dof, bins, skewness, kurtosis };
  }, [rawData]);

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Repeated Measurements</CardTitle>
            <CardDescription>Enter one measurement per line. Pre-populated with Pmax readings (W).</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              className="font-mono h-64"
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="Enter measurements, one per line..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              {analysis ? analysis.n + " valid measurements detected" : "Enter at least 2 measurements"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Type A Evaluation Results</CardTitle>
            <CardDescription>Statistical analysis of repeated observations</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Number of observations (n)</p>
                    <p className="text-xl font-bold">{analysis.n}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Degrees of Freedom (n-1)</p>
                    <p className="text-xl font-bold">{analysis.dof}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600">Mean</p>
                    <p className="text-xl font-bold text-blue-800">{analysis.mean.toFixed(4)} W</p>
                  </div>
                  <div className="p-3 bg-violet-50 rounded-lg">
                    <p className="text-xs text-violet-600">Standard Deviation (s)</p>
                    <p className="text-xl font-bold text-violet-800">{analysis.stdDev.toFixed(4)} W</p>
                  </div>
                </div>
                <Separator />
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-600 font-medium">{"Standard Uncertainty u(x) = s / \u221an"}</p>
                  <p className="text-3xl font-bold text-emerald-800 mt-1">
                    {analysis.stdUncertainty.toFixed(4)} W
                  </p>
                  <p className="text-xs text-emerald-500 mt-1">
                    {"= " + analysis.stdDev.toFixed(4) + " / \u221a" + analysis.n + " | DOF = " + analysis.dof}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Normal Distribution Assessment</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <span className="text-muted-foreground">Skewness: </span>
                      <span className="font-mono">{analysis.skewness.toFixed(3)}</span>
                      <Badge variant={Math.abs(analysis.skewness) < 1 ? "default" : "secondary"} className="ml-2 text-xs">
                        {Math.abs(analysis.skewness) < 1 ? "OK" : "Skewed"}
                      </Badge>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <span className="text-muted-foreground">Excess Kurtosis: </span>
                      <span className="font-mono">{analysis.kurtosis.toFixed(3)}</span>
                      <Badge variant={Math.abs(analysis.kurtosis) < 2 ? "default" : "secondary"} className="ml-2 text-xs">
                        {Math.abs(analysis.kurtosis) < 2 ? "OK" : "Non-normal"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Enter at least 2 measurements to see results.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Measurement Histogram</CardTitle>
            <CardDescription>{"Frequency distribution of " + analysis.n + " observations"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.bins} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#2563eb" name="Frequency" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Tab 3: Monte Carlo

function MonteCarloTab() {
  const [numSims, setNumSims] = useState(10000);
  const [seed, setSeed] = useState(42);
  const [hasRun, setHasRun] = useState(false);

  const mcResults = useMemo(() => {
    function mulberry32(a: number) {
      return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rand = mulberry32(seed);

    function randNormal(mean: number, std: number): number {
      const u1 = rand();
      const u2 = rand();
      return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    function randUniform(half: number): number {
      return (rand() - 0.5) * 2 * half;
    }

    const baseValue = 405.2;
    const samples: number[] = [];

    for (let i = 0; i < numSims; i++) {
      let y = baseValue;
      y += randNormal(0, (1.5 / 100) * baseValue) * 1.0;
      y += randUniform((2.0 / 100) * baseValue) * 1.0;
      y += randNormal(0, (1.0 / 100) * baseValue) * 1.0;
      y += randNormal(0, 1.0) * 0.4;
      y += randNormal(0, (0.1 / 100) * baseValue) * 1.0;
      y += randNormal(0, (0.3 / 100) * baseValue) * 1.0;
      samples.push(y);
    }

    samples.sort((a, b) => a - b);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const std = Math.sqrt(samples.reduce((s, v) => s + (v - mean) ** 2, 0) / (samples.length - 1));
    const p2_5 = samples[Math.floor(samples.length * 0.025)];
    const p97_5 = samples[Math.floor(samples.length * 0.975)];
    const expandedU = (p97_5 - p2_5) / 2;

    const min = samples[0];
    const max = samples[samples.length - 1];
    const binCount = 20;
    const binWidth = (max - min) / binCount;
    const bins = [];
    for (let i = 0; i < binCount; i++) {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const center = (lo + hi) / 2;
      let count = 0;
      for (const s of samples) {
        if (i === binCount - 1 ? s >= lo && s <= hi : s >= lo && s < hi) count++;
      }
      bins.push({ range: center.toFixed(1), count, lo, hi });
    }

    return { mean, std, p2_5, p97_5, expandedU, bins, n: samples.length };
  }, [numSims, seed]);

  const gumUc = computeCombinedUncertainty(DEFAULT_COMPONENTS);
  const gumVeff = welchSatterthwaite(DEFAULT_COMPONENTS, gumUc);
  const gumK = coverageFactorLookup(gumVeff);
  const gumU = gumK * gumUc;

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monte Carlo Simulation (MCM)</CardTitle>
          <CardDescription>
            Supplement 1 to the GUM (JCGM 101:2008) - Propagation of distributions using Monte Carlo method.
            This provides a numerical alternative to the GUM analytical framework, especially useful when the
            measurement model is nonlinear or when input distributions are asymmetric.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Number of Simulations</Label>
              <Input
                type="number"
                value={numSims}
                onChange={(e) => setNumSims(parseInt(e.target.value) || 10000)}
              />
            </div>
            <div className="space-y-2">
              <Label>Random Seed</Label>
              <Input type="number" value={seed} onChange={(e) => setSeed(parseInt(e.target.value) || 42)} />
            </div>
            <Button onClick={() => setHasRun(true)} className="h-10">
              <FlaskConical className="h-4 w-4 mr-2" /> Run Simulation
            </Button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium text-gray-700">Model: Y = Pmax (base 405.2 W)</p>
            <p className="mt-1">
              Inputs: Reference cell cal. (Normal), Spatial uniformity (Uniform), Spectral mismatch (Normal),
              Temperature (Normal), Current meas. (Normal), Repeatability (Normal)
            </p>
          </div>
        </CardContent>
      </Card>

      {hasRun && (
        <>
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-blue-600 font-medium">MC Mean</p>
                <p className="text-xl font-bold text-blue-800">{mcResults.mean.toFixed(3)} W</p>
              </CardContent>
            </Card>
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-violet-600 font-medium">MC Std Dev</p>
                <p className="text-xl font-bold text-violet-800">{mcResults.std.toFixed(3)} W</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-amber-600 font-medium">2.5th Percentile</p>
                <p className="text-xl font-bold text-amber-800">{mcResults.p2_5.toFixed(2)} W</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-emerald-600 font-medium">97.5th Percentile</p>
                <p className="text-xl font-bold text-emerald-800">{mcResults.p97_5.toFixed(2)} W</p>
              </CardContent>
            </Card>
            <Card className="bg-rose-50 border-rose-200">
              <CardContent className="pt-6 text-center">
                <p className="text-xs text-rose-600 font-medium">Expanded U (95%)</p>
                <p className="text-xl font-bold text-rose-800">{"\u00b1"}{mcResults.expandedU.toFixed(3)} W</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{"Output Distribution (" + numSims.toLocaleString() + " simulations)"}</CardTitle>
              <CardDescription>Histogram of simulated Pmax values (20 bins)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mcResults.bins} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" angle={-35} textAnchor="end" tick={{ fontSize: 10 }} label={{ value: "Pmax (W)", position: "insideBottom", offset: -30 }} />
                    <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#7c3aed" name="Frequency" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GUM vs Monte Carlo Comparison</CardTitle>
              <CardDescription>Validation of GUM analytical results against numerical simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead className="text-right">GUM Result</TableHead>
                    <TableHead className="text-right">Monte Carlo Result</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead>Agreement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Standard Uncertainty</TableCell>
                    <TableCell className="text-right font-mono">{gumUc.toFixed(4)} W</TableCell>
                    <TableCell className="text-right font-mono">{mcResults.std.toFixed(4)} W</TableCell>
                    <TableCell className="text-right font-mono">{Math.abs(gumUc - mcResults.std).toFixed(4)} W</TableCell>
                    <TableCell>
                      <Badge variant={Math.abs(gumUc - mcResults.std) / gumUc < 0.1 ? "default" : "secondary"}>
                        {Math.abs(gumUc - mcResults.std) / gumUc < 0.1 ? "Good" : "Review"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Expanded Uncertainty (95%)</TableCell>
                    <TableCell className="text-right font-mono">{"\u00b1"}{gumU.toFixed(4)} W</TableCell>
                    <TableCell className="text-right font-mono">{"\u00b1"}{mcResults.expandedU.toFixed(4)} W</TableCell>
                    <TableCell className="text-right font-mono">{Math.abs(gumU - mcResults.expandedU).toFixed(4)} W</TableCell>
                    <TableCell>
                      <Badge variant={Math.abs(gumU - mcResults.expandedU) / gumU < 0.1 ? "default" : "secondary"}>
                        {Math.abs(gumU - mcResults.expandedU) / gumU < 0.1 ? "Good" : "Review"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Coverage Factor / Interval</TableCell>
                    <TableCell className="text-right font-mono">k = {gumK.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">[{mcResults.p2_5.toFixed(2)}, {mcResults.p97_5.toFixed(2)}]</TableCell>
                    <TableCell className="text-right font-mono">-</TableCell>
                    <TableCell><Badge>Consistent</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Tab 4: IV Curve Uncertainty

interface IVParam {
  name: string;
  symbol: string;
  value: number;
  unit: string;
  sources: { name: string; type: string; distribution: string; value: number; ci: number }[];
}

function IVCurveTab() {
  const ivParams: IVParam[] = useMemo(
    () => [
      {
        name: "Maximum Power",
        symbol: "Pmax",
        value: 405.2,
        unit: "W",
        sources: [
          { name: "Reference cell cal.", type: "B", distribution: "Normal", value: 1.5, ci: 1.0 },
          { name: "Spatial non-uniformity", type: "B", distribution: "Uniform", value: 2.0, ci: 1.0 },
          { name: "Spectral mismatch", type: "B", distribution: "Normal", value: 1.0, ci: 1.0 },
          { name: "Temperature correction", type: "B", distribution: "Normal", value: 0.5, ci: 0.8 },
          { name: "I-V curve fitting", type: "B", distribution: "Normal", value: 0.2, ci: 1.0 },
          { name: "Repeatability", type: "A", distribution: "Normal", value: 0.3, ci: 1.0 },
        ],
      },
      {
        name: "Short-circuit Current",
        symbol: "Isc",
        value: 10.52,
        unit: "A",
        sources: [
          { name: "Reference cell cal.", type: "B", distribution: "Normal", value: 1.2, ci: 1.0 },
          { name: "Spectral mismatch", type: "B", distribution: "Normal", value: 0.8, ci: 1.0 },
          { name: "Current shunt accuracy", type: "B", distribution: "Normal", value: 0.05, ci: 1.0 },
          { name: "Repeatability", type: "A", distribution: "Normal", value: 0.15, ci: 1.0 },
        ],
      },
      {
        name: "Open-circuit Voltage",
        symbol: "Voc",
        value: 48.3,
        unit: "V",
        sources: [
          { name: "Voltmeter accuracy", type: "B", distribution: "Normal", value: 0.1, ci: 1.0 },
          { name: "Temperature correction", type: "B", distribution: "Normal", value: 0.3, ci: 1.0 },
          { name: "Irradiance correction", type: "B", distribution: "Normal", value: 0.1, ci: 0.5 },
          { name: "Repeatability", type: "A", distribution: "Normal", value: 0.1, ci: 1.0 },
        ],
      },
      {
        name: "Fill Factor",
        symbol: "FF",
        value: 0.797,
        unit: "",
        sources: [
          { name: "Pmax uncertainty", type: "B", distribution: "Normal", value: 1.8, ci: 1.0 },
          { name: "Isc uncertainty", type: "B", distribution: "Normal", value: 1.0, ci: 1.0 },
          { name: "Voc uncertainty", type: "B", distribution: "Normal", value: 0.35, ci: 1.0 },
          { name: "Repeatability", type: "A", distribution: "Normal", value: 0.2, ci: 1.0 },
        ],
      },
    ],
    []
  );

  const ivResults = useMemo(() => {
    return ivParams.map((param) => {
      const uc = Math.sqrt(
        param.sources.reduce((s, src) => {
          const ui = src.distribution === "Uniform" ? src.value / Math.sqrt(3) : src.distribution === "Triangular" ? src.value / Math.sqrt(6) : src.value;
          return s + (src.ci * ui) ** 2;
        }, 0)
      );
      const k = 2.0;
      const U = k * uc;
      return { ...param, uc, k, U };
    });
  }, [ivParams]);

  const barData = ivResults.map((r) => ({
    name: r.symbol,
    uncertainty: parseFloat(r.U.toFixed(2)),
  }));

  return (
    <div className="space-y-6 mt-4">
      <Card className="bg-gradient-to-r from-blue-50 to-violet-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Flash Test I-V Measurement Uncertainty</CardTitle>
          <CardDescription>
            IEC 60904-1 compliant I-V characterization uncertainty analysis for solar cell/module testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {ivResults.map((r) => (
              <div key={r.symbol} className="p-4 bg-white rounded-lg border text-center">
                <p className="text-xs text-muted-foreground">{r.name}</p>
                <p className="text-lg font-bold mt-1">
                  {r.value} {r.unit}
                </p>
                <p className="text-sm font-mono text-blue-700 mt-1">{"\u00b1"}{r.U.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">k={r.k.toFixed(1)}, 95%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">I-V Parameters at STC</CardTitle>
          <CardDescription>{"Standard Test Conditions: 1000 W/m\u00b2, 25\u00b0C cell temperature, AM1.5G spectrum"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{"Irradiance (W/m\u00b2)"}</Label>
              <Input type="number" defaultValue={1000} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>{"Temperature (\u00b0C)"}</Label>
              <Input type="number" defaultValue={25.0} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Spectrum</Label>
              <Input defaultValue="AM1.5G (IEC 60904-3)" readOnly className="bg-gray-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uncertainty Sources per I-V Parameter</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Uncertainty Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Distribution</TableHead>
                <TableHead className="text-right">Value (%)</TableHead>
                <TableHead className="text-right">ci</TableHead>
                <TableHead className="text-right">{"ci\u00b7u(xi) (%)"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ivParams.map((param) =>
                param.sources.map((src, idx) => (
                  <TableRow key={param.symbol + "-" + idx}>
                    {idx === 0 && (
                      <TableCell rowSpan={param.sources.length} className="font-medium border-r">
                        {param.symbol}
                        <br />
                        <span className="text-xs text-muted-foreground">{param.value} {param.unit}</span>
                      </TableCell>
                    )}
                    <TableCell className="text-sm">{src.name}</TableCell>
                    <TableCell>
                      <Badge variant={src.type === "A" ? "default" : "secondary"} className="text-xs">
                        {"Type " + src.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{src.distribution}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{src.value.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{src.ci.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {(src.ci * (src.distribution === "Uniform" ? src.value / Math.sqrt(3) : src.value)).toFixed(3)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relative Expanded Uncertainty Comparison</CardTitle>
          <CardDescription>Expanded uncertainty (k=2, 95%) for each I-V parameter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Expanded U (%)", angle: -90, position: "insideLeft" }} />
                <RechartsTooltip formatter={(value: number) => ["\u00b1" + value + "%", "Expanded Uncertainty"]} />
                <Bar dataKey="uncertainty" name="U (k=2)" radius={[6, 6, 0, 0]}>
                  {barData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Tab 5: Environmental

interface EnvSource {
  name: string;
  value: number;
  distribution: string;
  unit: string;
}

interface EnvParam {
  parameter: string;
  setpoint: string;
  sources: EnvSource[];
  color: string;
  bgColor: string;
  borderColor: string;
}

function EnvironmentalTab() {
  const envParams: EnvParam[] = useMemo(
    () => [
      {
        parameter: "Temperature",
        setpoint: "85\u00b0C (DH test) / -40\u00b0C (TC test)",
        color: "text-red-800",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        sources: [
          { name: "Setpoint accuracy", value: 0.5, distribution: "Normal", unit: "\u00b0C" },
          { name: "Spatial uniformity", value: 1.0, distribution: "Uniform", unit: "\u00b0C" },
          { name: "Temporal stability", value: 0.3, distribution: "Uniform", unit: "\u00b0C" },
          { name: "Sensor calibration", value: 0.2, distribution: "Normal", unit: "\u00b0C" },
          { name: "Radiation effects", value: 0.1, distribution: "Uniform", unit: "\u00b0C" },
        ],
      },
      {
        parameter: "Humidity",
        setpoint: "85% RH (DH test)",
        color: "text-blue-800",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        sources: [
          { name: "Setpoint accuracy", value: 1.5, distribution: "Normal", unit: "% RH" },
          { name: "Spatial uniformity", value: 2.0, distribution: "Uniform", unit: "% RH" },
          { name: "Temporal stability", value: 0.8, distribution: "Uniform", unit: "% RH" },
          { name: "Sensor calibration", value: 0.5, distribution: "Normal", unit: "% RH" },
        ],
      },
      {
        parameter: "Irradiance",
        setpoint: "1000 W/m\u00b2 (Sun simulator)",
        color: "text-amber-800",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        sources: [
          { name: "Spatial uniformity", value: 1.0, distribution: "Uniform", unit: "%" },
          { name: "Temporal instability", value: 0.5, distribution: "Uniform", unit: "%" },
          { name: "Spectral match", value: 1.5, distribution: "Normal", unit: "%" },
          { name: "Reference cell calibration", value: 1.2, distribution: "Normal", unit: "%" },
          { name: "Data acquisition", value: 0.1, distribution: "Uniform", unit: "%" },
        ],
      },
    ],
    []
  );

  const envResults = useMemo(() => {
    return envParams.map((param) => {
      const uc = Math.sqrt(
        param.sources.reduce((s, src) => {
          const ui =
            src.distribution === "Uniform"
              ? src.value / Math.sqrt(3)
              : src.distribution === "Triangular"
              ? src.value / Math.sqrt(6)
              : src.value;
          return s + ui * ui;
        }, 0)
      );
      const k = 2.0;
      const U = k * uc;
      return { ...param, uc, k, U };
    });
  }, [envParams]);

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Environmental Chamber Uncertainty</CardTitle>
          <CardDescription>
            Uncertainty evaluation for environmental test chambers used in IEC 61215 / IEC 61730 qualification testing.
            Covers temperature, humidity, and irradiance measurement uncertainties.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {envResults.map((r) => (
          <Card key={r.parameter} className={r.bgColor + " " + r.borderColor}>
            <CardContent className="pt-6 text-center">
              <p className={"text-sm font-medium " + r.color}>{r.parameter} Uncertainty</p>
              <p className={"text-3xl font-bold mt-2 " + r.color}>
                {"\u00b1"}{r.U.toFixed(3)} {r.sources[0].unit}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {"uc = " + r.uc.toFixed(3) + " | k = " + r.k.toFixed(1) + " (95%)"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{r.setpoint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {envResults.map((r) => (
        <Card key={r.parameter}>
          <CardHeader>
            <CardTitle className="text-lg">{r.parameter} Uncertainty Budget</CardTitle>
            <CardDescription>{"Setpoint: " + r.setpoint}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead className="text-right">{"Value (" + r.sources[0].unit + ")"}</TableHead>
                  <TableHead className="text-right">{"u(xi) (" + r.sources[0].unit + ")"}</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="w-[180px]">% Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {r.sources.map((src, idx) => {
                  const ui =
                    src.distribution === "Uniform"
                      ? src.value / Math.sqrt(3)
                      : src.distribution === "Triangular"
                      ? src.value / Math.sqrt(6)
                      : src.value;
                  const variance = ui * ui;
                  const totalVar = r.uc * r.uc;
                  const pct = totalVar > 0 ? (variance / totalVar) * 100 : 0;
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-sm">{src.name}</TableCell>
                      <TableCell className="text-sm">{src.distribution}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{src.value.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{ui.toFixed(4)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{variance.toFixed(6)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs font-mono w-12 text-right">{pct.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="font-bold bg-gray-50">
                  <TableCell colSpan={3}>Combined Standard Uncertainty (uc)</TableCell>
                  <TableCell className="text-right font-mono">{r.uc.toFixed(4)}</TableCell>
                  <TableCell className="text-right font-mono">{(r.uc * r.uc).toFixed(6)}</TableCell>
                  <TableCell className="text-right font-mono">100%</TableCell>
                </TableRow>
                <TableRow className="font-bold bg-gray-100">
                  <TableCell colSpan={3}>{"Expanded Uncertainty (k=" + r.k.toFixed(1) + ", 95%)"}</TableCell>
                  <TableCell className="text-right font-mono">{r.U.toFixed(4)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Tab 6: Budget Reports

const MOCK_BUDGETS = [
  {
    id: "budget-001",
    name: "Module ABC-2024 Pmax",
    measurand: "Pmax (W)",
    value: 405.2,
    expandedUncertainty: "\u00b12.84%",
    date: "2026-03-05",
    status: "Complete" as const,
    components: [
      { source: "Reference cell cal.", type: "B", dist: "Normal", value: 1.5, ci: 1.0, pct: 42.8 },
      { source: "Spatial uniformity", type: "B", dist: "Uniform", value: 2.0, ci: 1.0, pct: 25.4 },
      { source: "Spectral mismatch", type: "B", dist: "Normal", value: 1.0, ci: 1.0, pct: 19.1 },
      { source: "Temperature", type: "B", dist: "Normal", value: 1.0, ci: 0.4, pct: 3.1 },
      { source: "Current meas.", type: "B", dist: "Normal", value: 0.1, ci: 1.0, pct: 0.2 },
      { source: "Repeatability", type: "A", dist: "Normal", value: 0.3, ci: 1.0, pct: 1.7 },
    ],
  },
  {
    id: "budget-002",
    name: "Ref Cell RC-107 Isc",
    measurand: "Isc (A)",
    value: 10.52,
    expandedUncertainty: "\u00b11.92%",
    date: "2026-03-02",
    status: "Complete" as const,
    components: [
      { source: "Reference cell cal.", type: "B", dist: "Normal", value: 1.2, ci: 1.0, pct: 55.2 },
      { source: "Spectral mismatch", type: "B", dist: "Normal", value: 0.8, ci: 1.0, pct: 24.5 },
      { source: "Current shunt", type: "B", dist: "Normal", value: 0.05, ci: 1.0, pct: 0.1 },
      { source: "Repeatability", type: "A", dist: "Normal", value: 0.15, ci: 1.0, pct: 0.9 },
    ],
  },
  {
    id: "budget-003",
    name: "Chamber TC-01 Temperature",
    measurand: "Temperature (\u00b0C)",
    value: 85.0,
    expandedUncertainty: "\u00b10.45\u00b0C",
    date: "2026-02-28",
    status: "Draft" as const,
    components: [
      { source: "Setpoint accuracy", type: "B", dist: "Normal", value: 0.5, ci: 1.0, pct: 48.1 },
      { source: "Spatial uniformity", type: "B", dist: "Uniform", value: 1.0, ci: 1.0, pct: 32.1 },
      { source: "Temporal stability", type: "B", dist: "Uniform", value: 0.3, ci: 1.0, pct: 2.9 },
      { source: "Sensor calibration", type: "B", dist: "Normal", value: 0.2, ci: 1.0, pct: 7.7 },
    ],
  },
  {
    id: "budget-004",
    name: "Spectral Mismatch M Factor",
    measurand: "M (mismatch factor)",
    value: 1.002,
    expandedUncertainty: "\u00b13.21%",
    date: "2026-02-20",
    status: "Complete" as const,
    components: [
      { source: "Reference cell SR", type: "B", dist: "Normal", value: 2.0, ci: 1.0, pct: 48.3 },
      { source: "DUT SR", type: "B", dist: "Normal", value: 1.5, ci: 1.0, pct: 27.2 },
      { source: "Simulator spectrum", type: "B", dist: "Normal", value: 1.0, ci: 1.0, pct: 12.1 },
      { source: "AM1.5G reference", type: "B", dist: "Normal", value: 0.5, ci: 1.0, pct: 3.0 },
      { source: "Repeatability", type: "A", dist: "Normal", value: 0.4, ci: 1.0, pct: 1.9 },
    ],
  },
];

function BudgetReportsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Saved Uncertainty Budgets</h2>
          <p className="text-sm text-muted-foreground">
            {MOCK_BUDGETS.length + " budgets | " + MOCK_BUDGETS.filter((b) => b.status === "Complete").length + " complete, " + MOCK_BUDGETS.filter((b) => b.status === "Draft").length + " draft"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export All CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export All PDF
          </Button>
        </div>
      </div>

      {MOCK_BUDGETS.map((budget) => (
        <Card key={budget.id}>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedId(expandedId === budget.id ? null : budget.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <CardTitle className="text-base">{budget.name}</CardTitle>
                  <CardDescription>{budget.measurand + " = " + budget.value}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono font-semibold text-sm">{budget.expandedUncertainty}</p>
                  <p className="text-xs text-muted-foreground">{budget.date}</p>
                </div>
                <Badge variant={budget.status === "Complete" ? "default" : "secondary"}>
                  {budget.status}
                </Badge>
                {expandedId === budget.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedId === budget.id && (
            <CardContent>
              <Separator className="mb-4" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Distribution</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">ci</TableHead>
                    <TableHead className="w-[200px]">% Contribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budget.components.map((comp, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-sm">{comp.source}</TableCell>
                      <TableCell>
                        <Badge variant={comp.type === "A" ? "default" : "secondary"} className="text-xs">
                          {"Type " + comp.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{comp.dist}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{comp.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{comp.ci.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={comp.pct} className="h-2 flex-1" />
                          <span className="text-xs font-mono w-12 text-right">{comp.pct.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> View Full Report
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> CSV
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
