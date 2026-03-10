"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  Zap,
  Plus,
  Trash2,
  Download,
  Sun,
  Thermometer,
  FileDown,
  Activity,
  TrendingUp,
  BarChart3,
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
  ComposedChart,
  Area,
} from "recharts";
import {
  type IVCurveData,
  type TemperatureCorrectionParams,
  generateDemoCurves,
  generateIVCurve,
  extractIVParameters,
  correctToSTC,
  correctToNMOT,
  DEFAULT_TEMP_COEFFICIENTS,
  CURVE_COLORS,
} from "@/lib/iv-curve";

type IVTab = "curves" | "parameters" | "correction" | "diode";

const tabs: { key: IVTab; label: string }[] = [
  { key: "curves", label: "IV & PV Curves" },
  { key: "parameters", label: "Parameters Table" },
  { key: "correction", label: "Temp Correction" },
  { key: "diode", label: "Diode Model" },
];

export default function IVCurvePage() {
  const [activeTab, setActiveTab] = useState<IVTab>("curves");
  const [curves, setCurves] = useState<IVCurveData[]>(() => generateDemoCurves());
  const [selectedCurves, setSelectedCurves] = useState<Set<string>>(() => new Set(generateDemoCurves().map((c) => c.id)));
  const [showPV, setShowPV] = useState(true);
  const [tempCoeffs, setTempCoeffs] = useState<TemperatureCorrectionParams>(DEFAULT_TEMP_COEFFICIENTS);

  // Custom curve form
  const [customForm, setCustomForm] = useState({
    label: "",
    isc: "10.2",
    voc: "49.5",
    rs: "0.35",
    rsh: "500",
    n: "1.2",
    temp: "25",
    irr: "1000",
  });

  const visibleCurves = useMemo(
    () => curves.filter((c) => selectedCurves.has(c.id)),
    [curves, selectedCurves]
  );

  // Combined chart data for multi-curve overlay
  const chartData = useMemo(() => {
    if (visibleCurves.length === 0) return [];
    const maxPoints = Math.max(...visibleCurves.map((c) => c.points.length));
    const data: Record<string, number | undefined>[] = [];
    for (let i = 0; i < maxPoints; i++) {
      const point: Record<string, number | undefined> = {};
      for (const curve of visibleCurves) {
        const p = curve.points[Math.min(i, curve.points.length - 1)];
        point[`v_${curve.id}`] = p.voltage;
        point[`i_${curve.id}`] = p.current;
        point[`p_${curve.id}`] = p.power;
      }
      // Use first visible curve voltage as X axis
      point.voltage = visibleCurves[0].points[Math.min(i, visibleCurves[0].points.length - 1)].voltage;
      data.push(point);
    }
    return data;
  }, [visibleCurves]);

  // Per-curve data for individual plotting
  const perCurveData = useMemo(() => {
    const map: Record<string, { voltage: number; current: number; power: number }[]> = {};
    for (const c of visibleCurves) {
      map[c.id] = c.points.map((p) => ({ voltage: p.voltage, current: p.current, power: p.power }));
    }
    return map;
  }, [visibleCurves]);

  const toggleCurve = (id: string) => {
    setSelectedCurves((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addCustomCurve = () => {
    const isc = parseFloat(customForm.isc);
    const voc = parseFloat(customForm.voc);
    const rs = parseFloat(customForm.rs);
    const rsh = parseFloat(customForm.rsh);
    const n = parseFloat(customForm.n);
    const temp = parseFloat(customForm.temp);
    const irr = parseFloat(customForm.irr);
    if ([isc, voc, rs, rsh, n, temp, irr].some(isNaN)) return;

    const points = generateIVCurve(isc, voc, rs, rsh, n, temp, irr);
    const params = extractIVParameters(points);
    const id = `custom-${Date.now()}`;
    const label = customForm.label || `Custom @ ${temp}°C, ${irr}W/m²`;
    const newCurve: IVCurveData = {
      id,
      label,
      points,
      ...params,
      rs,
      rsh,
      n,
      temperature: temp,
      irradiance: irr,
      color: CURVE_COLORS[curves.length % CURVE_COLORS.length],
    };
    setCurves((prev) => [...prev, newCurve]);
    setSelectedCurves((prev) => { const next = new Set(prev); next.add(id); return next; });
  };

  const removeCurve = (id: string) => {
    setCurves((prev) => prev.filter((c) => c.id !== id));
    setSelectedCurves((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleCorrectToSTC = (curveId: string) => {
    const curve = curves.find((c) => c.id === curveId);
    if (!curve) return;
    const corrected = correctToSTC(curve, tempCoeffs);
    setCurves((prev) => [...prev, corrected]);
    setSelectedCurves((prev) => { const next = new Set(prev); next.add(corrected.id); return next; });
  };

  const handleCorrectToNMOT = (curveId: string) => {
    const curve = curves.find((c) => c.id === curveId);
    if (!curve) return;
    const corrected = correctToNMOT(curve, tempCoeffs);
    setCurves((prev) => [...prev, corrected]);
    setSelectedCurves((prev) => { const next = new Set(prev); next.add(corrected.id); return next; });
  };

  const handleExportCSV = useCallback(() => {
    let csv = "Curve,Voltage(V),Current(A),Power(W)\n";
    for (const c of visibleCurves) {
      for (const p of c.points) {
        csv += `${c.label},${p.voltage},${p.current},${p.power}\n`;
      }
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "iv-curves.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [visibleCurves]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IV Curve Analysis</h1>
          <p className="text-muted-foreground">
            Current-Voltage characterization, parameter extraction, and temperature correction
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Curve Selector + Add Custom */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Curves</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {curves.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={selectedCurves.has(c.id)}
                  onChange={() => toggleCurve(c.id)}
                  className="rounded"
                />
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="truncate flex-1">{c.label}</span>
                {c.id.startsWith("custom") && (
                  <button onClick={() => removeCurve(c.id)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Add Custom Curve</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <Label className="text-[10px]">Isc (A)</Label>
                  <Input className="h-7 text-xs" value={customForm.isc} onChange={(e) => setCustomForm((f) => ({ ...f, isc: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px]">Voc (V)</Label>
                  <Input className="h-7 text-xs" value={customForm.voc} onChange={(e) => setCustomForm((f) => ({ ...f, voc: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px]">Rs (Ω)</Label>
                  <Input className="h-7 text-xs" value={customForm.rs} onChange={(e) => setCustomForm((f) => ({ ...f, rs: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px]">Rsh (Ω)</Label>
                  <Input className="h-7 text-xs" value={customForm.rsh} onChange={(e) => setCustomForm((f) => ({ ...f, rsh: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px]">n (ideality)</Label>
                  <Input className="h-7 text-xs" value={customForm.n} onChange={(e) => setCustomForm((f) => ({ ...f, n: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px]">T (°C)</Label>
                  <Input className="h-7 text-xs" value={customForm.temp} onChange={(e) => setCustomForm((f) => ({ ...f, temp: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Label className="text-[10px]">Irradiance (W/m²)</Label>
                  <Input className="h-7 text-xs" value={customForm.irr} onChange={(e) => setCustomForm((f) => ({ ...f, irr: e.target.value }))} />
                </div>
              </div>
              <Button size="sm" className="w-full h-7 text-xs" onClick={addCustomCurve}>
                <Plus className="mr-1 h-3 w-3" /> Add Curve
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 border-b">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground px-2">
              <input type="checkbox" checked={showPV} onChange={(e) => setShowPV(e.target.checked)} className="rounded" />
              Show P-V overlay
            </label>
          </div>

          {activeTab === "curves" && (
            <IVChartSection
              curves={visibleCurves}
              perCurveData={perCurveData}
              showPV={showPV}
            />
          )}

          {activeTab === "parameters" && <ParametersTable curves={curves} />}

          {activeTab === "correction" && (
            <CorrectionTab
              curves={curves}
              tempCoeffs={tempCoeffs}
              setTempCoeffs={setTempCoeffs}
              onCorrectSTC={handleCorrectToSTC}
              onCorrectNMOT={handleCorrectToNMOT}
            />
          )}

          {activeTab === "diode" && <DiodeModelTab curves={visibleCurves} />}
        </div>
      </div>
    </div>
  );
}

// IV + PV Chart
function IVChartSection({
  curves,
  perCurveData,
  showPV,
}: {
  curves: IVCurveData[];
  perCurveData: Record<string, { voltage: number; current: number; power: number }[]>;
  showPV: boolean;
}) {
  // Use first curve's voltage range as reference
  const refCurve = curves[0];
  if (!refCurve) return <p className="text-muted-foreground p-4">Select at least one curve to display.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            I-V Characteristics
          </CardTitle>
          <CardDescription>Current vs Voltage with {showPV ? "Power overlay" : "no overlay"}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="voltage"
                type="number"
                domain={[0, "auto"]}
                label={{ value: "Voltage (V)", position: "insideBottomRight", offset: -5 }}
                allowDuplicatedCategory={false}
              />
              <YAxis
                yAxisId="current"
                label={{ value: "Current (A)", angle: -90, position: "insideLeft" }}
              />
              {showPV && (
                <YAxis
                  yAxisId="power"
                  orientation="right"
                  label={{ value: "Power (W)", angle: 90, position: "insideRight" }}
                />
              )}
              <Tooltip />
              <Legend />
              {curves.map((c) => (
                <Line
                  key={`i-${c.id}`}
                  data={perCurveData[c.id]}
                  yAxisId="current"
                  type="monotone"
                  dataKey="current"
                  stroke={c.color}
                  strokeWidth={2}
                  dot={false}
                  name={`${c.label} (I)`}
                  connectNulls
                />
              ))}
              {showPV &&
                curves.map((c) => (
                  <Line
                    key={`p-${c.id}`}
                    data={perCurveData[c.id]}
                    yAxisId="power"
                    type="monotone"
                    dataKey="power"
                    stroke={c.color}
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    name={`${c.label} (P)`}
                    connectNulls
                  />
                ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key parameters cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {curves.slice(0, 4).map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                <CardTitle className="text-sm truncate">{c.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-muted-foreground">Pmax</span><span className="font-mono text-right">{c.pmax.toFixed(2)} W</span>
              <span className="text-muted-foreground">Voc</span><span className="font-mono text-right">{c.voc.toFixed(3)} V</span>
              <span className="text-muted-foreground">Isc</span><span className="font-mono text-right">{c.isc.toFixed(3)} A</span>
              <span className="text-muted-foreground">FF</span><span className="font-mono text-right">{c.ff.toFixed(2)} %</span>
              <span className="text-muted-foreground">Vmpp</span><span className="font-mono text-right">{c.vmpp.toFixed(3)} V</span>
              <span className="text-muted-foreground">Impp</span><span className="font-mono text-right">{c.impp.toFixed(3)} A</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Parameters Table
function ParametersTable({ curves }: { curves: IVCurveData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Extracted IV Parameters</CardTitle>
        <CardDescription>Single-diode model parameters for all curves</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curve</TableHead>
              <TableHead className="text-right">Voc (V)</TableHead>
              <TableHead className="text-right">Isc (A)</TableHead>
              <TableHead className="text-right">Pmax (W)</TableHead>
              <TableHead className="text-right">Vmpp (V)</TableHead>
              <TableHead className="text-right">Impp (A)</TableHead>
              <TableHead className="text-right">FF (%)</TableHead>
              <TableHead className="text-right">Rs (Ω)</TableHead>
              <TableHead className="text-right">Rsh (Ω)</TableHead>
              <TableHead className="text-right">n</TableHead>
              <TableHead className="text-right">T (°C)</TableHead>
              <TableHead className="text-right">G (W/m²)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {curves.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-sm">{c.label}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{c.voc.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono">{c.isc.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono font-medium">{c.pmax.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{c.vmpp.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono">{c.impp.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono">{c.ff.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{c.rs.toFixed(3)}</TableCell>
                <TableCell className="text-right font-mono">{c.rsh.toFixed(1)}</TableCell>
                <TableCell className="text-right font-mono">{c.n.toFixed(2)}</TableCell>
                <TableCell className="text-right">{c.temperature}</TableCell>
                <TableCell className="text-right">{c.irradiance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Temperature Correction Tab
function CorrectionTab({
  curves,
  tempCoeffs,
  setTempCoeffs,
  onCorrectSTC,
  onCorrectNMOT,
}: {
  curves: IVCurveData[];
  tempCoeffs: TemperatureCorrectionParams;
  setTempCoeffs: (c: TemperatureCorrectionParams) => void;
  onCorrectSTC: (id: string) => void;
  onCorrectNMOT: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Temperature Coefficients</CardTitle>
          <CardDescription>Configure coefficients for STC/NMOT/NOCT correction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label className="text-xs">α(Isc) (%/°C)</Label>
              <Input
                type="number"
                step="0.01"
                value={tempCoeffs.alphaIsc}
                onChange={(e) => setTempCoeffs({ ...tempCoeffs, alphaIsc: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-xs">β(Voc) (%/°C)</Label>
              <Input
                type="number"
                step="0.01"
                value={tempCoeffs.betaVoc}
                onChange={(e) => setTempCoeffs({ ...tempCoeffs, betaVoc: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-xs">γ(Pmax) (%/°C)</Label>
              <Input
                type="number"
                step="0.01"
                value={tempCoeffs.gammaPmax}
                onChange={(e) => setTempCoeffs({ ...tempCoeffs, gammaPmax: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label className="text-xs">NMOT (°C)</Label>
              <Input
                type="number"
                step="1"
                value={tempCoeffs.nmot}
                onChange={(e) => setTempCoeffs({ ...tempCoeffs, nmot: parseFloat(e.target.value) || 44 })}
              />
            </div>
            <div>
              <Label className="text-xs">NOCT (°C)</Label>
              <Input
                type="number"
                step="1"
                value={tempCoeffs.noct}
                onChange={(e) => setTempCoeffs({ ...tempCoeffs, noct: parseFloat(e.target.value) || 45 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Correction</CardTitle>
          <CardDescription>
            Select a curve to correct to STC (25°C, 1000 W/m²) or NMOT ({tempCoeffs.nmot}°C, 800 W/m²)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curve</TableHead>
                <TableHead className="text-right">T (°C)</TableHead>
                <TableHead className="text-right">G (W/m²)</TableHead>
                <TableHead className="text-right">Pmax (W)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {curves
                .filter((c) => !c.id.endsWith("-stc") && !c.id.endsWith("-nmot"))
                .map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{c.temperature}</TableCell>
                    <TableCell className="text-right">{c.irradiance}</TableCell>
                    <TableCell className="text-right font-mono">{c.pmax.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onCorrectSTC(c.id)}>
                          <Sun className="mr-1 h-3 w-3" /> Correct to STC
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onCorrectNMOT(c.id)}>
                          <Thermometer className="mr-1 h-3 w-3" /> Correct to NMOT
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Diode Model Tab
function DiodeModelTab({ curves }: { curves: IVCurveData[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Single-Diode Model Parameters</CardTitle>
          <CardDescription>
            Extracted from IV curves: I = I_ph - I₀(e^((V+IRs)/nVt) - 1) - (V+IRs)/Rsh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {curves.map((c) => (
              <Card key={c.id} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <CardTitle className="text-sm">{c.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Photocurrent (Iph)</span>
                    <span className="font-mono">{c.isc.toFixed(3)} A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Series Resistance (Rs)</span>
                    <span className="font-mono">{c.rs.toFixed(3)} Ω</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shunt Resistance (Rsh)</span>
                    <span className="font-mono">{c.rsh.toFixed(1)} Ω</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ideality Factor (n)</span>
                    <span className="font-mono">{c.n.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature</span>
                    <span className="font-mono">{c.temperature} °C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thermal Voltage (nVt)</span>
                    <span className="font-mono">
                      {((c.n * 1.380649e-23 * (c.temperature + 273.15)) / 1.602176634e-19).toFixed(4)} V
                    </span>
                  </div>
                  <div className="pt-2 border-t mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fill Factor</span>
                      <span className="font-mono font-medium">{c.ff.toFixed(2)} %</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Efficiency (η)</span>
                      <span className="font-mono font-medium">
                        {((c.pmax / (c.irradiance * 1.96)) * 100).toFixed(2)} %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
