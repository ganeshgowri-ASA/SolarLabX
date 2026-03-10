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
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Target,
  Gauge,
  FileDown,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
} from "recharts";
import {
  type DataPoint,
  type StatisticalSummary,
  type IECTolerance,
  IEC_TOLERANCES,
  calculateStatistics,
  generateHistogramBins,
  checkIECPassFail,
  generateMockData,
} from "@/lib/data-analysis";

type AnalysisTab = "overview" | "histogram" | "trend" | "comparative" | "passfail";

const PARAMETERS = ["Pmax", "Voc", "Isc", "FF"] as const;

const tabDefs: { key: AnalysisTab; label: string }[] = [
  { key: "overview", label: "Statistical Overview" },
  { key: "histogram", label: "Histograms" },
  { key: "trend", label: "Trend Analysis" },
  { key: "comparative", label: "Comparative" },
  { key: "passfail", label: "Pass/Fail" },
];

export default function DataAnalysisPage() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");
  const [selectedParameter, setSelectedParameter] = useState<string>("Pmax");

  // Generate mock datasets for all parameters
  const datasets = useMemo(() => {
    const nominals: Record<string, number> = { Pmax: 400, Voc: 49.5, Isc: 10.2, FF: 79.5 };
    const stds: Record<string, number> = { Pmax: 1.2, Voc: 0.8, Isc: 0.6, FF: 0.5 };
    const map: Record<string, DataPoint[]> = {};
    for (const p of PARAMETERS) {
      map[p] = generateMockData(p, nominals[p], stds[p], 60);
    }
    return map;
  }, []);

  const currentData = datasets[selectedParameter] || [];
  const values = currentData.map((d) => d.value);

  const tolerance = IEC_TOLERANCES.find((t) => t.parameter === selectedParameter);
  const nominal = tolerance?.nominalValue ?? 400;
  const tolPct = tolerance?.upperLimit ?? 3;
  const lsl = nominal * (1 - tolPct / 100);
  const usl = nominal * (1 + tolPct / 100);

  const stats = useMemo(() => calculateStatistics(values, lsl, usl), [values, lsl, usl]);
  const histogramData = useMemo(() => generateHistogramBins(values, 12), [values]);

  // All parameters stats for overview
  const allStats = useMemo(() => {
    return PARAMETERS.map((p) => {
      const vals = datasets[p].map((d) => d.value);
      const tol = IEC_TOLERANCES.find((t) => t.parameter === p);
      const nom = tol?.nominalValue ?? 0;
      const tp = tol?.upperLimit ?? 3;
      return {
        parameter: p,
        unit: datasets[p][0]?.unit || "",
        ...calculateStatistics(vals, nom * (1 - tp / 100), nom * (1 + tp / 100)),
        nominal: nom,
      };
    });
  }, [datasets]);

  // Trend data (values over time)
  const trendData = useMemo(() => {
    return currentData.map((d, i) => ({
      index: i + 1,
      value: d.value,
      sample: d.sampleId,
      timestamp: new Date(d.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    }));
  }, [currentData]);

  // Comparative data across operators/equipment
  const comparativeData = useMemo(() => {
    const byOperator: Record<string, number[]> = {};
    currentData.forEach((d) => {
      if (!byOperator[d.operator]) byOperator[d.operator] = [];
      byOperator[d.operator].push(d.value);
    });
    return Object.entries(byOperator).map(([op, vals]) => {
      const s = calculateStatistics(vals, lsl, usl);
      return { operator: op, mean: Number(s.mean.toFixed(3)), stdDev: Number(s.stdDev.toFixed(4)), count: s.count, cpk: Number(s.cpk.toFixed(2)) };
    });
  }, [currentData, lsl, usl]);

  const handleExportCSV = useCallback(() => {
    const header = "ID,Sample,Parameter,Value,Unit,Timestamp,Standard,Operator,Equipment\n";
    const rows = currentData.map((d) =>
      `${d.id},${d.sampleId},${d.parameter},${d.value},${d.unit},${d.timestamp},${d.testStandard},${d.operator},${d.equipment}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-analysis-${selectedParameter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentData, selectedParameter]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Analysis</h1>
          <p className="text-muted-foreground">
            Statistical analysis, SPC charts, and IEC tolerance verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
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

      {/* Parameter Selector + KPIs */}
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select value={selectedParameter} onValueChange={setSelectedParameter}>
            <SelectTrigger>
              <SelectValue placeholder="Select parameter" />
            </SelectTrigger>
            <SelectContent>
              {PARAMETERS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 flex-1">
          <KPICard icon={Target} label="Mean" value={stats.mean.toFixed(3)} unit={currentData[0]?.unit} />
          <KPICard icon={Activity} label="Std Dev" value={stats.stdDev.toFixed(4)} trend={stats.cv < 1 ? "good" : "warn"} />
          <KPICard icon={Gauge} label="Cp" value={stats.cp.toFixed(2)} trend={stats.cp >= 1.33 ? "good" : "warn"} />
          <KPICard icon={Gauge} label="Cpk" value={stats.cpk.toFixed(2)} trend={stats.cpk >= 1.33 ? "good" : stats.cpk >= 1 ? "warn" : "bad"} />
          <KPICard icon={BarChart3} label="CV%" value={`${stats.cv.toFixed(2)}%`} />
          <KPICard
            icon={stats.passFail === "pass" ? CheckCircle2 : stats.passFail === "marginal" ? AlertTriangle : XCircle}
            label="Status"
            value={stats.passFail.toUpperCase()}
            trend={stats.passFail === "pass" ? "good" : stats.passFail === "marginal" ? "warn" : "bad"}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabDefs.map((t) => (
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
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab allStats={allStats} />}
      {activeTab === "histogram" && (
        <HistogramTab
          data={histogramData}
          stats={stats}
          parameter={selectedParameter}
          lsl={lsl}
          usl={usl}
          nominal={nominal}
        />
      )}
      {activeTab === "trend" && (
        <TrendTab data={trendData} parameter={selectedParameter} lsl={lsl} usl={usl} mean={stats.mean} />
      )}
      {activeTab === "comparative" && (
        <ComparativeTab data={comparativeData} parameter={selectedParameter} />
      )}
      {activeTab === "passfail" && <PassFailTab datasets={datasets} />}
    </div>
  );
}

// KPI Card
function KPICard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit?: string;
  trend?: "good" | "warn" | "bad";
}) {
  const trendColor =
    trend === "good" ? "text-green-600" : trend === "warn" ? "text-amber-600" : trend === "bad" ? "text-red-600" : "text-foreground";
  return (
    <Card className="flex-1">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${trendColor}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className={`text-lg font-bold mt-1 ${trendColor}`}>
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// Overview Tab - all parameters stats table
function OverviewTab({ allStats }: { allStats: (StatisticalSummary & { parameter: string; unit: string; nominal: number })[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistical Summary — All Parameters</CardTitle>
          <CardDescription>IEC 61215/61730 test data statistical overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">n</TableHead>
                <TableHead className="text-right">Mean</TableHead>
                <TableHead className="text-right">Std Dev</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead className="text-right">Max</TableHead>
                <TableHead className="text-right">CV%</TableHead>
                <TableHead className="text-right">Cp</TableHead>
                <TableHead className="text-right">Cpk</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStats.map((s) => (
                <TableRow key={s.parameter}>
                  <TableCell className="font-medium">{s.parameter}</TableCell>
                  <TableCell>{s.unit}</TableCell>
                  <TableCell className="text-right">{s.count}</TableCell>
                  <TableCell className="text-right">{s.mean.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{s.stdDev.toFixed(4)}</TableCell>
                  <TableCell className="text-right">{s.min.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{s.max.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{s.cv.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{s.cp.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">{s.cpk.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.passFail === "pass" ? "default" : s.passFail === "marginal" ? "secondary" : "destructive"}
                    >
                      {s.passFail === "pass" ? "PASS" : s.passFail === "marginal" ? "MARGINAL" : "FAIL"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Cp/Cpk bar chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Process Capability Index (Cpk)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={allStats.map((s) => ({ parameter: s.parameter, Cp: Number(s.cp.toFixed(2)), Cpk: Number(s.cpk.toFixed(2)) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="parameter" />
                <YAxis domain={[0, "auto"]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={1.33} stroke="#22c55e" strokeDasharray="5 5" label="Cpk=1.33" />
                <ReferenceLine y={1.0} stroke="#f97316" strokeDasharray="5 5" label="Cpk=1.0" />
                <Bar dataKey="Cp" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cpk" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coefficient of Variation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={allStats.map((s) => ({ parameter: s.parameter, cv: Number(s.cv.toFixed(2)) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="parameter" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="cv" fill="#a855f7" radius={[4, 4, 0, 0]}>
                  {allStats.map((s, i) => (
                    <Cell key={i} fill={s.cv < 1 ? "#22c55e" : s.cv < 2 ? "#f97316" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Histogram Tab
function HistogramTab({
  data,
  stats,
  parameter,
  lsl,
  usl,
  nominal,
}: {
  data: { bin: string; count: number; cumulative: number }[];
  stats: StatisticalSummary;
  parameter: string;
  lsl: number;
  usl: number;
  nominal: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{parameter} Distribution</CardTitle>
            <CardDescription>
              Histogram with normal overlay — LSL: {lsl.toFixed(2)}, USL: {usl.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Cumulative", angle: 90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Frequency">
                  {data.map((_, i) => (
                    <Cell key={i} fill="#f97316" opacity={0.8} />
                  ))}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} name="Cumulative" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descriptive Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                ["Count (n)", stats.count],
                ["Mean", stats.mean.toFixed(4)],
                ["Std Dev (σ)", stats.stdDev.toFixed(4)],
                ["Median", stats.median.toFixed(4)],
                ["Min", stats.min.toFixed(4)],
                ["Max", stats.max.toFixed(4)],
                ["Range", stats.range.toFixed(4)],
                ["CV%", `${stats.cv.toFixed(2)}%`],
                ["Nominal", nominal.toFixed(2)],
                ["LSL", lsl.toFixed(2)],
                ["USL", usl.toFixed(2)],
                ["Cp", stats.cp.toFixed(3)],
                ["Cpk", stats.cpk.toFixed(3)],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono font-medium">{val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Trend Tab - control chart style
function TrendTab({
  data,
  parameter,
  lsl,
  usl,
  mean,
}: {
  data: { index: number; value: number; sample: string; timestamp: string }[];
  parameter: string;
  lsl: number;
  usl: number;
  mean: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{parameter} — Individual Values Control Chart</CardTitle>
        <CardDescription>
          UCL/LCL from IEC specification limits. Mean line shown in orange.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: "Measurement #", position: "insideBottomRight", offset: -5 }} />
            <YAxis domain={[lsl * 0.998, usl * 1.002]} />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-2 shadow text-xs">
                    <p className="font-medium">Sample: {d.sample}</p>
                    <p>Value: {d.value}</p>
                    <p className="text-muted-foreground">{d.timestamp}</p>
                  </div>
                );
              }}
            />
            <Legend />
            <ReferenceLine y={usl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "USL", position: "right" }} />
            <ReferenceLine y={lsl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "LSL", position: "right" }} />
            <ReferenceLine y={mean} stroke="#f97316" strokeDasharray="3 3" label={{ value: "Mean", position: "right" }} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2 }} name={parameter} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Comparative Tab
function ComparativeTab({
  data,
  parameter,
}: {
  data: { operator: string; mean: number; stdDev: number; count: number; cpk: number }[];
  parameter: string;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{parameter} — Operator Comparison</CardTitle>
          <CardDescription>Mean ± σ and Cpk by operator for reproducibility assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operator</TableHead>
                <TableHead className="text-right">n</TableHead>
                <TableHead className="text-right">Mean</TableHead>
                <TableHead className="text-right">Std Dev</TableHead>
                <TableHead className="text-right">Cpk</TableHead>
                <TableHead>Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((d) => (
                <TableRow key={d.operator}>
                  <TableCell className="font-medium">{d.operator}</TableCell>
                  <TableCell className="text-right">{d.count}</TableCell>
                  <TableCell className="text-right font-mono">{d.mean}</TableCell>
                  <TableCell className="text-right font-mono">{d.stdDev}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{d.cpk}</TableCell>
                  <TableCell>
                    <Badge variant={d.cpk >= 1.33 ? "default" : "destructive"}>
                      {d.cpk >= 1.33 ? "Capable" : "Review"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Operator Mean Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operator" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mean" fill="#f97316" radius={[4, 4, 0, 0]} name="Mean" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Pass/Fail Tab
function PassFailTab({ datasets }: { datasets: Record<string, DataPoint[]> }) {
  const results = useMemo(() => {
    return PARAMETERS.map((p) => {
      const vals = datasets[p].map((d) => d.value);
      const tol = IEC_TOLERANCES.find((t) => t.parameter === p);
      const nom = tol?.nominalValue ?? 0;
      const tolPct = tol?.upperLimit ?? 3;

      const checks = vals.map((v) => checkIECPassFail(p, v, nom, tolPct));
      const passCount = checks.filter((c) => c.pass).length;
      const failCount = checks.filter((c) => !c.pass).length;
      const maxDev = Math.max(...checks.map((c) => Math.abs(c.deviationPct)));

      return {
        parameter: p,
        standard: tol?.standard ?? "",
        clause: tol?.clause ?? "",
        nominal: nom,
        tolerance: `±${tolPct}%`,
        total: vals.length,
        passed: passCount,
        failed: failCount,
        passRate: ((passCount / vals.length) * 100).toFixed(1),
        maxDeviation: maxDev.toFixed(2),
        verdict: failCount === 0 ? "PASS" : "FAIL",
      };
    });
  }, [datasets]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">IEC Tolerance Verification</CardTitle>
          <CardDescription>Pass/fail assessment per IEC 61215 / IEC 61730 specification limits</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Standard</TableHead>
                <TableHead>Clause</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead className="text-right">Tolerance</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Passed</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="text-right">Pass Rate</TableHead>
                <TableHead className="text-right">Max Dev%</TableHead>
                <TableHead>Verdict</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.parameter}>
                  <TableCell className="font-medium">{r.parameter}</TableCell>
                  <TableCell>{r.standard}</TableCell>
                  <TableCell>{r.clause}</TableCell>
                  <TableCell className="text-right font-mono">{r.nominal}</TableCell>
                  <TableCell className="text-right">{r.tolerance}</TableCell>
                  <TableCell className="text-right">{r.total}</TableCell>
                  <TableCell className="text-right text-green-600 font-medium">{r.passed}</TableCell>
                  <TableCell className="text-right text-red-600 font-medium">{r.failed}</TableCell>
                  <TableCell className="text-right">{r.passRate}%</TableCell>
                  <TableCell className="text-right font-mono">{r.maxDeviation}%</TableCell>
                  <TableCell>
                    <Badge variant={r.verdict === "PASS" ? "default" : "destructive"}>
                      {r.verdict === "PASS" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> PASS</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> FAIL</>
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pass rate visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pass Rate by Parameter</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="parameter" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip />
              <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="3 3" />
              <Bar dataKey="passRate" name="Pass Rate %" radius={[4, 4, 0, 0]}>
                {results.map((r, i) => (
                  <Cell key={i} fill={r.verdict === "PASS" ? "#22c55e" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
