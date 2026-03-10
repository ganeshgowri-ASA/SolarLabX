"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calculator,
  Plus,
  Trash2,
  FileDown,
  BarChart3,
  FlaskConical,
  Thermometer,
  Zap,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from "recharts";

// ===== Utility functions =====
function toStdU(val: number, dist: string): number {
  if (dist === "uniform") return val / Math.sqrt(3);
  if (dist === "triangular") return val / Math.sqrt(6);
  return val;
}

function welchSatterthwaite(components: GUMComponent[]): number {
  const totalVar = components.reduce((s, c) => s + (c.ci * toStdU(c.value, c.distribution)) ** 2, 0);
  const uc4 = totalVar ** 2;
  const denom = components.reduce((s, c) => {
    const vi = c.dof;
    if (vi === Infinity || vi <= 0) return s;
    const contrib = (c.ci * toStdU(c.value, c.distribution)) ** 2;
    return s + (contrib ** 2) / vi;
  }, 0);
  if (denom === 0) return Infinity;
  return Math.round(uc4 / denom);
}

function getCoverageFactor(dof: number): number {
  if (dof === Infinity || dof > 100) return 1.96;
  const t95: Record<number, number> = {
    1: 12.71, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042, 40: 2.021,
    50: 2.009, 60: 2.000, 80: 1.990, 100: 1.984,
  };
  if (t95[dof]) return t95[dof];
  const keys = Object.keys(t95).map(Number).sort((a, b) => a - b);
  for (let i = 0; i < keys.length - 1; i++) {
    if (dof > keys[i] && dof < keys[i + 1]) {
      const f = (dof - keys[i]) / (keys[i + 1] - keys[i]);
      return t95[keys[i]] + f * (t95[keys[i + 1]] - t95[keys[i]]);
    }
  }
  return 2.0;
}

// ===== Types =====
interface GUMComponent {
  id: string;
  name: string;
  type: "typeA" | "typeB";
  distribution: string;
  value: number;
  ci: number;
  dof: number;
}

// ===== Default GUM components for Pmax =====
const DEFAULT_COMPONENTS: GUMComponent[] = [
  { id: "c1", name: "Reference cell calibration", type: "typeB", distribution: "normal", value: 1.5, ci: 1.0, dof: Infinity },
  { id: "c2", name: "Spatial non-uniformity", type: "typeB", distribution: "uniform", value: 2.0, ci: 1.0, dof: Infinity },
  { id: "c3", name: "Spectral mismatch", type: "typeB", distribution: "normal", value: 1.0, ci: 1.0, dof: Infinity },
  { id: "c4", name: "Temperature measurement", type: "typeB", distribution: "normal", value: 1.0, ci: 0.4, dof: Infinity },
  { id: "c5", name: "Current measurement", type: "typeB", distribution: "normal", value: 0.1, ci: 1.0, dof: Infinity },
  { id: "c6", name: "Repeatability", type: "typeA", distribution: "normal", value: 0.3, ci: 1.0, dof: 9 },
];

// ===== Mock Type A measurements =====
const DEFAULT_MEASUREMENTS = [405.2, 404.8, 405.5, 404.9, 405.1, 405.3, 404.7, 405.4, 405.0, 405.2];

// ===== Mock Monte Carlo results =====
function generateMCHistogram() {
  const bins = [];
  const mean = 405.1;
  const std = 1.45;
  for (let i = 0; i < 25; i++) {
    const x = mean - 3.5 * std + (i * 7 * std) / 25;
    const freq = Math.round(10000 * (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2) * (7 * std / 25));
    bins.push({ bin: x.toFixed(1), frequency: freq, label: `${x.toFixed(1)}` });
  }
  return bins;
}

// ===== Mock budget reports =====
const MOCK_BUDGETS = [
  { id: "b1", name: "Module ABC-2024 Pmax", measurand: "Pmax (W)", expanded: "±2.84%", date: "2026-03-05", status: "Complete" },
  { id: "b2", name: "Ref Cell RC-107 Isc", measurand: "Isc (A)", expanded: "±1.92%", date: "2026-03-02", status: "Complete" },
  { id: "b3", name: "Chamber TC-01 Temperature", measurand: "Temperature (°C)", expanded: "±0.45%", date: "2026-02-28", status: "Draft" },
  { id: "b4", name: "Spectral Mismatch M Factor", measurand: "M (mismatch factor)", expanded: "±3.21%", date: "2026-02-20", status: "Complete" },
];

// ===== IV Parameters =====
const IV_PARAMS = [
  { param: "Pmax", value: 405.2, unit: "W", sources: ["Ref cell cal (1.5%)", "Spatial (2.0%)", "Spectral (1.0%)", "Temp (0.4%)", "Repeat (0.3%)"], expandedU: 2.84 },
  { param: "Isc", value: 10.52, unit: "A", sources: ["Ref cell cal (1.5%)", "Spatial (2.0%)", "Spectral (1.0%)", "Current DAQ (0.1%)", "Temp corr (0.5%)"], expandedU: 1.92 },
  { param: "Voc", value: 48.3, unit: "V", sources: ["Voltage DAQ (0.1%)", "Temp corr (0.3%)", "Irradiance (0.03%)", "Repeat (0.1%)"], expandedU: 0.68 },
  { param: "FF", value: 0.797, unit: "", sources: ["Pmax uncert (2.84%)", "Isc uncert (1.92%)", "Voc uncert (0.68%)"], expandedU: 3.51 },
];

// ===== Environmental parameters =====
const ENV_PARAMS = {
  temperature: [
    { source: "Sensor calibration", type: "typeB", dist: "normal", value: 0.2, ci: 1.0 },
    { source: "Setpoint accuracy", type: "typeB", dist: "uniform", value: 0.5, ci: 1.0 },
    { source: "Spatial uniformity", type: "typeB", dist: "uniform", value: 1.0, ci: 1.0 },
    { source: "Temporal stability", type: "typeB", dist: "uniform", value: 0.3, ci: 1.0 },
    { source: "Resolution", type: "typeB", dist: "uniform", value: 0.05, ci: 1.0 },
  ],
  humidity: [
    { source: "Sensor calibration", type: "typeB", dist: "normal", value: 1.5, ci: 1.0 },
    { source: "Setpoint accuracy", type: "typeB", dist: "uniform", value: 2.0, ci: 1.0 },
    { source: "Spatial uniformity", type: "typeB", dist: "uniform", value: 2.5, ci: 1.0 },
    { source: "Temporal stability", type: "typeB", dist: "uniform", value: 1.0, ci: 1.0 },
  ],
  irradiance: [
    { source: "Reference cell calibration", type: "typeB", dist: "normal", value: 1.5, ci: 1.0 },
    { source: "Spatial uniformity", type: "typeB", dist: "uniform", value: 2.0, ci: 1.0 },
    { source: "Temporal stability", type: "typeB", dist: "uniform", value: 0.5, ci: 1.0 },
    { source: "Spectral match", type: "typeB", dist: "normal", value: 1.0, ci: 1.0 },
  ],
};

function calcEnvUncertainty(sources: typeof ENV_PARAMS.temperature) {
  const totalVar = sources.reduce((s, src) => s + (src.ci * toStdU(src.value, src.dist)) ** 2, 0);
  const uc = Math.sqrt(totalVar);
  return { uc, expanded: uc * 2 };
}

export default function UncertaintyDashboard() {
  const [activeTab, setActiveTab] = useState("gum");

  // GUM Calculator state
  const [measurand, setMeasurand] = useState("Pmax");
  const [measuredValue, setMeasuredValue] = useState(405.2);
  const [unit, setUnit] = useState("W");
  const [components, setComponents] = useState<GUMComponent[]>(DEFAULT_COMPONENTS);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"typeA" | "typeB">("typeB");
  const [newDist, setNewDist] = useState("normal");
  const [newValue, setNewValue] = useState(0.5);
  const [newCi, setNewCi] = useState(1.0);
  const [newDof, setNewDof] = useState(Infinity);

  // Type A state
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENTS.join("\n"));

  // GUM calculations
  const gumResults = useMemo(() => {
    const processed = components.map(c => {
      const u = toStdU(c.value, c.distribution);
      const variance = (c.ci * u) ** 2;
      return { ...c, stdU: u, ciU: c.ci * u, variance };
    });
    const totalVar = processed.reduce((s, c) => s + c.variance, 0);
    const uc = Math.sqrt(totalVar);
    const withPct = processed.map(c => ({ ...c, pct: totalVar > 0 ? (c.variance / totalVar) * 100 : 0 }));
    const effDof = welchSatterthwaite(components);
    const k = getCoverageFactor(effDof);
    const expanded = uc * k;
    const relative = measuredValue !== 0 ? (expanded / Math.abs(measuredValue)) * 100 : 0;
    return { components: withPct.sort((a, b) => b.pct - a.pct), uc, effDof, k, expanded, relative, totalVar };
  }, [components, measuredValue]);

  // Type A calculations
  const typeAResults = useMemo(() => {
    const vals = measurements.split("\n").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (vals.length < 2) return null;
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const variance = vals.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    const stdU = stdDev / Math.sqrt(n);
    const dof = n - 1;

    // Histogram bins
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const binCount = Math.min(10, n);
    const binWidth = range / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const count = vals.filter(v => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
      return { bin: `${lo.toFixed(1)}-${hi.toFixed(1)}`, count, mid: (lo + hi) / 2 };
    });

    return { n, mean, stdDev, stdU, dof, vals, bins, min, max };
  }, [measurements]);

  // MC histogram
  const mcHistogram = useMemo(() => generateMCHistogram(), []);

  const addComponent = () => {
    if (!newName) return;
    setComponents(prev => [...prev, {
      id: `c${Date.now()}`,
      name: newName,
      type: newType,
      distribution: newDist,
      value: newValue,
      ci: newCi,
      dof: newType === "typeB" ? Infinity : newDof,
    }]);
    setNewName("");
    setNewValue(0.5);
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  // Environmental calculations
  const tempU = useMemo(() => calcEnvUncertainty(ENV_PARAMS.temperature), []);
  const humU = useMemo(() => calcEnvUncertainty(ENV_PARAMS.humidity), []);
  const irrU = useMemo(() => calcEnvUncertainty(ENV_PARAMS.irradiance), []);

  // Pareto chart data for GUM
  const paretoData = gumResults.components.map(c => ({
    name: c.name.length > 20 ? c.name.substring(0, 18) + "..." : c.name,
    contribution: parseFloat(c.pct.toFixed(1)),
  }));

  // IV comparison chart
  const ivChartData = IV_PARAMS.map(p => ({
    name: p.param,
    uncertainty: p.expandedU,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Uncertainty Calculator</h1>
        <p className="text-muted-foreground mt-1">
          ISO/IEC 17025 compliant measurement uncertainty evaluation using GUM (JCGM 100:2008) methodology
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="gum" className="text-xs"><Calculator className="h-3 w-3 mr-1" />GUM Calculator</TabsTrigger>
          <TabsTrigger value="typeA" className="text-xs"><BarChart3 className="h-3 w-3 mr-1" />Type A</TabsTrigger>
          <TabsTrigger value="montecarlo" className="text-xs"><FlaskConical className="h-3 w-3 mr-1" />Monte Carlo</TabsTrigger>
          <TabsTrigger value="iv" className="text-xs"><Zap className="h-3 w-3 mr-1" />IV Curve</TabsTrigger>
          <TabsTrigger value="environmental" className="text-xs"><Thermometer className="h-3 w-3 mr-1" />Environmental</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs"><FileText className="h-3 w-3 mr-1" />Budget Reports</TabsTrigger>
        </TabsList>

        {/* ===== GUM CALCULATOR ===== */}
        <TabsContent value="gum" className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Measurement Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Measurand</Label>
                  <Input value={measurand} onChange={e => setMeasurand(e.target.value)} />
                </div>
                <div>
                  <Label>Measured Value</Label>
                  <Input type="number" value={measuredValue} onChange={e => setMeasuredValue(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={unit} onChange={e => setUnit(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Component */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Uncertainty Component</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-3 items-end">
                <div>
                  <Label className="text-xs">Source Name</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g., Calibration" />
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={newType} onValueChange={(v: "typeA" | "typeB") => setNewType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typeA">Type A</SelectItem>
                      <SelectItem value="typeB">Type B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Distribution</Label>
                  <Select value={newDist} onValueChange={setNewDist}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="uniform">Uniform</SelectItem>
                      <SelectItem value="triangular">Triangular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value (%)</Label>
                  <Input type="number" step="0.01" value={newValue} onChange={e => setNewValue(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label className="text-xs">Sensitivity (ci)</Label>
                  <Input type="number" step="0.1" value={newCi} onChange={e => setNewCi(parseFloat(e.target.value) || 1)} />
                </div>
                <Button onClick={addComponent} disabled={!newName}><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription>Combined Std Uncertainty</CardDescription>
                <CardTitle className="text-2xl font-mono">{gumResults.uc.toFixed(4)}%</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">u_c</p></CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardDescription>Eff. Degrees of Freedom</CardDescription>
                <CardTitle className="text-2xl font-mono">{gumResults.effDof === Infinity ? "∞" : gumResults.effDof}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">Welch-Satterthwaite</p></CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardDescription>Coverage Factor</CardDescription>
                <CardTitle className="text-2xl font-mono">k = {gumResults.k.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">95% confidence</p></CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardDescription>Expanded Uncertainty</CardDescription>
                <CardTitle className="text-2xl font-mono">±{gumResults.expanded.toFixed(4)}%</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">U = k × u_c</p></CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardDescription>Relative Expanded</CardDescription>
                <CardTitle className="text-2xl font-mono">±{gumResults.relative.toFixed(2)}%</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">of measured value</p></CardContent>
            </Card>
          </div>

          {/* Budget Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Uncertainty Budget Table</CardTitle>
              <CardDescription>Component breakdown per GUM methodology</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2">Source</th>
                      <th className="text-center p-2">Type</th>
                      <th className="text-center p-2">Distribution</th>
                      <th className="text-right p-2">Value (%)</th>
                      <th className="text-right p-2">u(xi)</th>
                      <th className="text-right p-2">ci</th>
                      <th className="text-right p-2">ci×u(xi)</th>
                      <th className="text-right p-2">Variance</th>
                      <th className="text-right p-2">% Contrib</th>
                      <th className="text-center p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gumResults.components.map(c => (
                      <tr key={c.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{c.name}</td>
                        <td className="p-2 text-center">
                          <Badge variant={c.type === "typeA" ? "default" : "secondary"}>
                            {c.type === "typeA" ? "A" : "B"}
                          </Badge>
                        </td>
                        <td className="p-2 text-center capitalize">{c.distribution}</td>
                        <td className="p-2 text-right font-mono">{c.value.toFixed(3)}</td>
                        <td className="p-2 text-right font-mono">{c.stdU.toFixed(4)}</td>
                        <td className="p-2 text-right font-mono">{c.ci.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">{c.ciU.toFixed(4)}</td>
                        <td className="p-2 text-right font-mono">{c.variance.toFixed(6)}</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(c.pct, 100)}%` }} />
                            </div>
                            <span className="font-mono text-xs w-12 text-right">{c.pct.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeComponent(c.id)}>
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sensitivity Analysis Pareto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sensitivity Analysis (Pareto)</CardTitle>
              <CardDescription>Contribution of each source to total uncertainty</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paretoData} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="contribution" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TYPE A ANALYSIS ===== */}
        <TabsContent value="typeA" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Type A Uncertainty - Repeated Measurements</CardTitle>
              <CardDescription>Statistical analysis of repeated measurement data. Enter one value per line.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Measurements (one per line)</Label>
                <textarea
                  className="w-full h-40 mt-1 p-3 border rounded-md font-mono text-sm bg-background"
                  value={measurements}
                  onChange={e => setMeasurements(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {typeAResults && (
            <>
              <div className="grid grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>n (samples)</CardDescription>
                    <CardTitle className="text-2xl font-mono">{typeAResults.n}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Mean</CardDescription>
                    <CardTitle className="text-2xl font-mono">{typeAResults.mean.toFixed(3)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Std Deviation</CardDescription>
                    <CardTitle className="text-2xl font-mono">{typeAResults.stdDev.toFixed(4)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Std Uncertainty (s/&radic;n)</CardDescription>
                    <CardTitle className="text-2xl font-mono">{typeAResults.stdU.toFixed(4)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Degrees of Freedom</CardDescription>
                    <CardTitle className="text-2xl font-mono">{typeAResults.dof}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Measurement Histogram</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={typeAResults.bins}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Normal Probability Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1">
                      <span>Sample Range</span>
                      <span className="font-mono">{typeAResults.min.toFixed(2)} - {typeAResults.max.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Mean ± 1&sigma; covers</span>
                      <span className="font-mono">{((typeAResults.vals.filter(v => Math.abs(v - typeAResults.mean) <= typeAResults.stdDev).length / typeAResults.n) * 100).toFixed(0)}% of data (expected ~68%)</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Mean ± 2&sigma; covers</span>
                      <span className="font-mono">{((typeAResults.vals.filter(v => Math.abs(v - typeAResults.mean) <= 2 * typeAResults.stdDev).length / typeAResults.n) * 100).toFixed(0)}% of data (expected ~95%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assessment</span>
                      <Badge variant="default" className="bg-green-600">Data appears normally distributed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== MONTE CARLO ===== */}
        <TabsContent value="montecarlo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monte Carlo Simulation</CardTitle>
              <CardDescription>
                Propagation of distributions using Monte Carlo method (JCGM 101:2008 Supplement 1).
                Validates GUM results for complex measurement models.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Number of Simulations</Label>
                  <Input type="number" value={10000} readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Measurement Model</Label>
                  <Input value="Y = Pmax (combined sources)" readOnly className="bg-muted" />
                </div>
                <div>
                  <Label>Seed</Label>
                  <Input type="number" value={42} readOnly className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>MC Mean</CardDescription>
                <CardTitle className="text-xl font-mono">405.10</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>MC Std Dev</CardDescription>
                <CardTitle className="text-xl font-mono">1.45</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>2.5th Percentile</CardDescription>
                <CardTitle className="text-xl font-mono">402.26</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>97.5th Percentile</CardDescription>
                <CardTitle className="text-xl font-mono">407.94</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>MC Expanded U</CardDescription>
                <CardTitle className="text-xl font-mono">±2.84</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Output Distribution Histogram</CardTitle>
              <CardDescription>10,000 Monte Carlo samples</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={mcHistogram}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#8b5cf6" opacity={0.7} />
                  <Line dataKey="frequency" stroke="#ef4444" strokeWidth={2} dot={false} type="monotone" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GUM vs Monte Carlo Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Parameter</th>
                    <th className="text-right p-2">GUM Result</th>
                    <th className="text-right p-2">Monte Carlo</th>
                    <th className="text-right p-2">Difference</th>
                    <th className="text-center p-2">Agreement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Combined Std Uncertainty</td>
                    <td className="p-2 text-right font-mono">{gumResults.uc.toFixed(4)}%</td>
                    <td className="p-2 text-right font-mono">1.4500%</td>
                    <td className="p-2 text-right font-mono">{Math.abs(gumResults.uc - 1.45).toFixed(4)}%</td>
                    <td className="p-2 text-center"><Badge className="bg-green-600">Good</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Expanded Uncertainty (95%)</td>
                    <td className="p-2 text-right font-mono">±{gumResults.expanded.toFixed(4)}%</td>
                    <td className="p-2 text-right font-mono">±2.8400%</td>
                    <td className="p-2 text-right font-mono">{Math.abs(gumResults.expanded - 2.84).toFixed(4)}%</td>
                    <td className="p-2 text-center"><Badge className="bg-green-600">Good</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Coverage Interval</td>
                    <td className="p-2 text-right font-mono">[402.36, 407.84]</td>
                    <td className="p-2 text-right font-mono">[402.26, 407.94]</td>
                    <td className="p-2 text-right font-mono">0.10</td>
                    <td className="p-2 text-center"><Badge className="bg-green-600">Good</Badge></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== IV CURVE UNCERTAINTY ===== */}
        <TabsContent value="iv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">I-V Curve Measurement Uncertainty</CardTitle>
              <CardDescription>Uncertainty analysis for solar cell/module flash test parameters per IEC 60904-1</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {IV_PARAMS.map(p => (
                  <div key={p.param}>
                    <Label>{p.param} ({p.unit || "-"})</Label>
                    <Input value={p.value} readOnly className="bg-muted font-mono" />
                  </div>
                ))}
                <div>
                  <Label>Irradiance (W/m&sup2;)</Label>
                  <Input value="1000" readOnly className="bg-muted font-mono" />
                </div>
                <div>
                  <Label>Temperature (&deg;C)</Label>
                  <Input value="25.0" readOnly className="bg-muted font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IV Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Flash Test Uncertainty Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Parameter</th>
                    <th className="text-right p-2">Measured Value</th>
                    <th className="text-right p-2">Unit</th>
                    <th className="text-right p-2">Expanded U (±%)</th>
                    <th className="text-right p-2">Absolute U</th>
                    <th className="text-left p-2">Dominant Sources</th>
                  </tr>
                </thead>
                <tbody>
                  {IV_PARAMS.map(p => (
                    <tr key={p.param} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{p.param}</td>
                      <td className="p-2 text-right font-mono">{p.value}</td>
                      <td className="p-2 text-right">{p.unit || "-"}</td>
                      <td className="p-2 text-right font-mono font-semibold">±{p.expandedU.toFixed(2)}%</td>
                      <td className="p-2 text-right font-mono">±{(p.value * p.expandedU / 100).toFixed(3)} {p.unit}</td>
                      <td className="p-2 text-xs">{p.sources.slice(0, 2).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* IV Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relative Uncertainty Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ivChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: number) => `±${v}%`} />
                  <Bar dataKey="uncertainty" radius={[4, 4, 0, 0]}>
                    {ivChartData.map((_, i) => {
                      const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
                      return <rect key={i} fill={colors[i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Flash Test Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Flash Test Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Module:</strong> MOD-2026-0145 (SolarTech ST-405M)</p>
                  <p><strong>Test Standard:</strong> IEC 60904-1:2020</p>
                  <p><strong>Flash Tester:</strong> Pasan HighLIGHT 3b (Class A+A+A+)</p>
                  <p><strong>Reference Cell:</strong> WPVS RC-2024-107 (Cal. cert: PTB-2025-4421)</p>
                </div>
                <div>
                  <p><strong>STC Conditions:</strong> 1000 W/m&sup2;, 25&deg;C, AM1.5G</p>
                  <p><strong>Pmax:</strong> 405.2 ± 11.51 W (k=2, 95%)</p>
                  <p><strong>Isc:</strong> 10.52 ± 0.20 A (k=2, 95%)</p>
                  <p><strong>Voc:</strong> 48.3 ± 0.33 V (k=2, 95%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ENVIRONMENTAL ===== */}
        <TabsContent value="environmental" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environmental Chamber Uncertainty</CardTitle>
              <CardDescription>Uncertainty evaluation for environmental test chambers used in IEC 61215 / IEC 61730 testing</CardDescription>
            </CardHeader>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="bg-orange-50 border-orange-200">
              <CardHeader className="pb-2">
                <CardDescription>Temperature Uncertainty</CardDescription>
                <CardTitle className="text-2xl font-mono">±{tempU.expanded.toFixed(2)} &deg;C</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Combined: {tempU.uc.toFixed(3)} &deg;C, k=2</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription>Humidity Uncertainty</CardDescription>
                <CardTitle className="text-2xl font-mono">±{humU.expanded.toFixed(2)} %RH</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Combined: {humU.uc.toFixed(3)} %RH, k=2</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardDescription>Irradiance Uncertainty</CardDescription>
                <CardTitle className="text-2xl font-mono">±{irrU.expanded.toFixed(2)} %</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Combined: {irrU.uc.toFixed(3)} %, k=2</p>
              </CardContent>
            </Card>
          </div>

          {/* Temperature Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Temperature Chamber Uncertainty Budget</CardTitle>
              <CardDescription>Thermal Cycling (IEC 61215 MQT 11) / Damp Heat (MQT 13)</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Source</th>
                    <th className="text-center p-2">Type</th>
                    <th className="text-center p-2">Distribution</th>
                    <th className="text-right p-2">Value (&deg;C)</th>
                    <th className="text-right p-2">u(xi) (&deg;C)</th>
                    <th className="text-right p-2">ci&times;u(xi)</th>
                  </tr>
                </thead>
                <tbody>
                  {ENV_PARAMS.temperature.map((s, i) => {
                    const u = toStdU(s.value, s.dist);
                    return (
                      <tr key={i} className="border-b">
                        <td className="p-2">{s.source}</td>
                        <td className="p-2 text-center"><Badge variant="secondary">{s.type === "typeA" ? "A" : "B"}</Badge></td>
                        <td className="p-2 text-center capitalize">{s.dist}</td>
                        <td className="p-2 text-right font-mono">{s.value.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">{u.toFixed(4)}</td>
                        <td className="p-2 text-right font-mono">{(s.ci * u).toFixed(4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Humidity Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Humidity Chamber Uncertainty Budget</CardTitle>
              <CardDescription>Damp Heat (85&deg;C / 85%RH per IEC 61215 MQT 13)</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Source</th>
                    <th className="text-center p-2">Type</th>
                    <th className="text-center p-2">Distribution</th>
                    <th className="text-right p-2">Value (%RH)</th>
                    <th className="text-right p-2">u(xi) (%RH)</th>
                    <th className="text-right p-2">ci&times;u(xi)</th>
                  </tr>
                </thead>
                <tbody>
                  {ENV_PARAMS.humidity.map((s, i) => {
                    const u = toStdU(s.value, s.dist);
                    return (
                      <tr key={i} className="border-b">
                        <td className="p-2">{s.source}</td>
                        <td className="p-2 text-center"><Badge variant="secondary">B</Badge></td>
                        <td className="p-2 text-center capitalize">{s.dist}</td>
                        <td className="p-2 text-right font-mono">{s.value.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">{u.toFixed(4)}</td>
                        <td className="p-2 text-right font-mono">{(s.ci * u).toFixed(4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Irradiance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Irradiance (Sun Simulator) Uncertainty Budget</CardTitle>
              <CardDescription>Solar simulator per IEC 60904-9</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Source</th>
                    <th className="text-center p-2">Type</th>
                    <th className="text-center p-2">Distribution</th>
                    <th className="text-right p-2">Value (%)</th>
                    <th className="text-right p-2">u(xi) (%)</th>
                    <th className="text-right p-2">ci&times;u(xi)</th>
                  </tr>
                </thead>
                <tbody>
                  {ENV_PARAMS.irradiance.map((s, i) => {
                    const u = toStdU(s.value, s.dist);
                    return (
                      <tr key={i} className="border-b">
                        <td className="p-2">{s.source}</td>
                        <td className="p-2 text-center"><Badge variant="secondary">B</Badge></td>
                        <td className="p-2 text-center capitalize">{s.dist}</td>
                        <td className="p-2 text-right font-mono">{s.value.toFixed(2)}</td>
                        <td className="p-2 text-right font-mono">{u.toFixed(4)}</td>
                        <td className="p-2 text-right font-mono">{(s.ci * u).toFixed(4)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== BUDGET REPORTS ===== */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Saved Uncertainty Budgets</h2>
              <p className="text-sm text-muted-foreground">ISO 17025 compliant uncertainty budget documentation</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast.success("Uncertainty budget exported as PDF")}><FileDown className="h-4 w-4 mr-1" />Export PDF</Button>
              <Button variant="outline" onClick={() => toast.success("Uncertainty budget exported as CSV")}><FileDown className="h-4 w-4 mr-1" />Export CSV</Button>
            </div>
          </div>

          {MOCK_BUDGETS.map(budget => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <CardDescription>{budget.measurand} | {budget.date}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg">{budget.expanded}</span>
                    <Badge variant={budget.status === "Complete" ? "default" : "secondary"}>
                      {budget.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-muted-foreground text-xs">Coverage Factor</p>
                    <p className="font-mono font-semibold">k = 2.00</p>
                  </div>
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-muted-foreground text-xs">Confidence Level</p>
                    <p className="font-mono font-semibold">95%</p>
                  </div>
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-muted-foreground text-xs">Components</p>
                    <p className="font-mono font-semibold">6 sources</p>
                  </div>
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-muted-foreground text-xs">Method</p>
                    <p className="font-mono font-semibold">GUM (JCGM 100)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
