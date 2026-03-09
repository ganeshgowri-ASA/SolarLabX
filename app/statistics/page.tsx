"use client";

import React, { useState, useMemo } from "react";
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
  BarChart3,
  TrendingUp,
  Target,
  GitBranch,
  Layers,
  Gauge,
  Upload,
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
  ScatterChart,
  Scatter,
  ReferenceLine,
  ComposedChart,
  Cell,
} from "recharts";

// ===== Utility functions =====
function mean(arr: number[]) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function median(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function variance(arr: number[], m?: number) {
  const mu = m ?? mean(arr);
  return arr.reduce((s, x) => s + (x - mu) ** 2, 0) / (arr.length - 1);
}
function stdDev(arr: number[], m?: number) { return Math.sqrt(variance(arr, m)); }
function skewness(arr: number[]) {
  const n = arr.length; const mu = mean(arr); const s = stdDev(arr, mu);
  if (s === 0) return 0;
  return (n / ((n - 1) * (n - 2))) * arr.reduce((sum, x) => sum + ((x - mu) / s) ** 3, 0);
}
function kurtosis(arr: number[]) {
  const n = arr.length; const mu = mean(arr); const s = stdDev(arr, mu);
  if (s === 0) return 0;
  const m4 = arr.reduce((sum, x) => sum + ((x - mu) / s) ** 4, 0) / n;
  return m4 - 3;
}
function quantile(arr: number[], q: number) {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos); const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}
function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = mean(xs); const my = mean(ys);
  const sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const predicted = xs.map(x => slope * x + intercept);
  const ssRes = ys.reduce((s, y, i) => s + (y - predicted[i]) ** 2, 0);
  const ssTot = ys.reduce((s, y) => s + (y - my) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  const se = Math.sqrt(ssRes / (n - 2));
  const residuals = ys.map((y, i) => y - predicted[i]);
  return { slope, intercept, r2, se, predicted, residuals };
}

// ===== Mock data: 50 Pmax measurements =====
const PMAX_DATA = [
  405.2, 404.8, 405.5, 404.9, 405.1, 405.3, 404.7, 405.4, 405.0, 405.2,
  404.6, 405.8, 405.1, 404.5, 405.3, 405.7, 404.9, 405.0, 405.4, 404.8,
  405.6, 404.3, 405.2, 405.1, 404.7, 405.5, 405.0, 404.9, 405.3, 405.1,
  404.4, 405.9, 405.2, 404.8, 405.0, 405.6, 404.7, 405.3, 405.1, 404.9,
  405.4, 405.0, 404.6, 405.2, 405.5, 404.8, 405.1, 405.3, 404.9, 405.0,
];

// ===== Mock control chart data: 30 individual measurements =====
const CONTROL_DATA = [
  405.2, 404.8, 405.5, 404.9, 405.1, 405.3, 404.7, 405.4, 405.0, 405.2,
  404.6, 405.8, 405.1, 404.5, 405.3, 405.7, 404.9, 405.0, 405.4, 404.8,
  405.6, 404.3, 405.2, 408.1, 405.0, 405.6, 404.7, 405.3, 405.1, 403.5,
];

// ===== Mock regression data =====
const REGRESSION_DATA = Array.from({ length: 25 }, (_, i) => {
  const irr = 200 + i * 35;
  const pmax = 0.38 * irr + 12 + (Math.sin(i * 0.7) * 5);
  return { irradiance: irr, pmax: parseFloat(pmax.toFixed(1)) };
});

// ===== Mock ANOVA data =====
const ANOVA_GROUPS: Record<string, number[]> = {
  "Sim A": [405.2, 404.8, 405.5, 404.9, 405.1, 405.3, 404.7, 405.4, 405.0, 405.2],
  "Sim B": [404.1, 403.8, 404.5, 403.9, 404.2, 404.3, 403.7, 404.4, 404.0, 404.1],
  "Sim C": [405.0, 404.6, 405.3, 404.8, 405.1, 405.2, 404.5, 405.1, 404.9, 405.0],
  "Sim D": [406.1, 405.8, 406.5, 405.9, 406.2, 406.3, 405.7, 406.4, 406.0, 406.2],
};

// ===== Mock MSA / Gage R&R data =====
const MSA_RESULTS = {
  totalGRR: 8.2,
  repeatability: 5.8,
  reproducibility: 5.8,
  partToPart: 99.7,
  totalVariation: 100,
  ndc: 17,
  varComp: {
    totalGRR: { varComp: 0.0067, pctContrib: 0.67, stdDev: 0.0819, studyVar: 0.4914, pctStudyVar: 8.2, pctTol: 4.9 },
    repeatability: { varComp: 0.0034, pctContrib: 0.34, stdDev: 0.0583, studyVar: 0.3498, pctStudyVar: 5.8, pctTol: 3.5 },
    reproducibility: { varComp: 0.0033, pctContrib: 0.33, stdDev: 0.0575, studyVar: 0.3450, pctStudyVar: 5.8, pctTol: 3.5 },
    partToPart: { varComp: 0.9933, pctContrib: 99.33, stdDev: 0.9966, studyVar: 5.9799, pctStudyVar: 99.7, pctTol: 59.8 },
    total: { varComp: 1.0000, pctContrib: 100, stdDev: 1.0000, studyVar: 6.0000, pctStudyVar: 100, pctTol: 60.0 },
  },
};

// ===== Mock CSV data =====
const SAMPLE_CSV = `Module_ID,Pmax_W,Isc_A,Voc_V,FF,Temp_C,Irradiance
MOD-001,405.2,10.52,48.3,0.797,25.1,1000
MOD-002,404.8,10.48,48.2,0.795,25.0,999
MOD-003,405.5,10.55,48.4,0.794,25.2,1001
MOD-004,404.9,10.50,48.3,0.796,24.9,1000
MOD-005,405.1,10.51,48.3,0.797,25.1,1000
MOD-006,405.3,10.53,48.4,0.795,25.0,1001
MOD-007,404.7,10.47,48.2,0.796,25.2,999
MOD-008,405.4,10.54,48.3,0.797,25.1,1000
MOD-009,405.0,10.50,48.3,0.796,25.0,1000
MOD-010,405.2,10.52,48.4,0.795,24.9,1001
MOD-011,404.6,10.46,48.2,0.796,25.1,999
MOD-012,405.8,10.56,48.5,0.794,25.0,1002
MOD-013,405.1,10.51,48.3,0.797,25.2,1000
MOD-014,404.5,10.45,48.1,0.797,25.0,999
MOD-015,405.3,10.53,48.4,0.795,25.1,1001
MOD-016,405.7,10.55,48.4,0.796,25.0,1001
MOD-017,404.9,10.50,48.3,0.796,24.9,1000
MOD-018,405.0,10.50,48.3,0.797,25.1,1000
MOD-019,405.4,10.54,48.4,0.795,25.0,1001
MOD-020,404.8,10.48,48.2,0.796,25.2,999`;

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState("descriptive");
  const [dataInput, setDataInput] = useState(PMAX_DATA.join("\n"));
  const [chartType, setChartType] = useState("individual-mr");
  const [regType, setRegType] = useState("linear");
  const [usl, setUsl] = useState(410);
  const [lsl, setLsl] = useState(400);
  const [target, setTarget] = useState(405);
  const [csvData, setCsvData] = useState(SAMPLE_CSV);
  const [parsedCsv, setParsedCsv] = useState<string[][] | null>(null);

  // Parse input data
  const data = useMemo(() => {
    return dataInput.split("\n").map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  }, [dataInput]);

  // Descriptive stats
  const stats = useMemo(() => {
    if (data.length < 2) return null;
    const m = mean(data);
    const med = median(data);
    const sd = stdDev(data, m);
    const v = variance(data, m);
    const sk = skewness(data);
    const ku = kurtosis(data);
    const q1 = quantile(data, 0.25);
    const q3 = quantile(data, 0.75);
    const iqr = q3 - q1;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    // Histogram bins
    const binCount = Math.min(15, Math.ceil(Math.sqrt(data.length)));
    const binWidth = range / binCount || 0.1;
    const bins = Array.from({ length: binCount }, (_, i) => {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const count = data.filter(v => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
      // Normal PDF overlay
      const midPt = (lo + hi) / 2;
      const normalY = (data.length * binWidth) * (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((midPt - m) / sd) ** 2);
      return { bin: lo.toFixed(1), count, normalFit: parseFloat(normalY.toFixed(2)) };
    });

    return { n: data.length, mean: m, median: med, stdDev: sd, variance: v, skewness: sk, kurtosis: ku, q1, q3, iqr, min, max, range, bins };
  }, [data]);

  // Control chart calculations
  const controlChart = useMemo(() => {
    const d = CONTROL_DATA;
    const xBar = mean(d);
    const mrs: number[] = [];
    for (let i = 1; i < d.length; i++) mrs.push(Math.abs(d[i] - d[i - 1]));
    const mrBar = mean(mrs);
    const ucl = xBar + 2.66 * mrBar;
    const lcl = xBar - 2.66 * mrBar;
    const mrUcl = 3.267 * mrBar;

    const chartData = d.map((val, i) => ({
      sample: i + 1,
      value: val,
      ucl, lcl, cl: xBar,
      ooc: val > ucl || val < lcl,
    }));

    const mrChartData = mrs.map((val, i) => ({
      sample: i + 2,
      mr: val,
      mrUcl,
      mrCl: mrBar,
      mrLcl: 0,
      ooc: val > mrUcl,
    }));

    return { chartData, mrChartData, xBar, ucl, lcl, mrBar, mrUcl };
  }, []);

  // Capability analysis
  const capability = useMemo(() => {
    if (data.length < 2) return null;
    const m = mean(data);
    const s = stdDev(data, m);
    const cp = (usl - lsl) / (6 * s);
    const cpkU = (usl - m) / (3 * s);
    const cpkL = (m - lsl) / (3 * s);
    const cpk = Math.min(cpkU, cpkL);
    const pp = cp; // same for short-term
    const ppk = cpk;
    const sigmaLevel = cpk * 3;
    const zU = (usl - m) / s;
    const zL = (m - lsl) / s;
    // Approximate PPM using z-score (simplified)
    const ppmAbove = zU > 4 ? 0 : Math.round(500000 * Math.exp(-0.5 * zU * zU));
    const ppmBelow = zL > 4 ? 0 : Math.round(500000 * Math.exp(-0.5 * zL * zL));
    const totalPpm = ppmAbove + ppmBelow;
    const pctWithin = ((1 - totalPpm / 1000000) * 100).toFixed(4);

    // Histogram with spec limits
    const min = Math.min(lsl - 1, Math.min(...data) - 0.5);
    const max = Math.max(usl + 1, Math.max(...data) + 0.5);
    const range = max - min;
    const binCount = 20;
    const binWidth = range / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => {
      const lo = min + i * binWidth;
      const hi = lo + binWidth;
      const count = data.filter(v => v >= lo && (i === binCount - 1 ? v <= hi : v < hi)).length;
      const midPt = (lo + hi) / 2;
      const normalY = (data.length * binWidth) * (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((midPt - m) / s) ** 2);
      return { bin: parseFloat(lo.toFixed(1)), count, normalFit: parseFloat(normalY.toFixed(2)) };
    });

    return { cp, cpk, pp, ppk, sigmaLevel, totalPpm, pctWithin, bins, mean: m, stdDev: s };
  }, [data, usl, lsl]);

  // Regression
  const regression = useMemo(() => {
    const xs = REGRESSION_DATA.map(d => d.irradiance);
    const ys = REGRESSION_DATA.map(d => d.pmax);
    const result = linearRegression(xs, ys);
    const scatterData = REGRESSION_DATA.map((d, i) => ({
      ...d,
      fitted: parseFloat(result.predicted[i].toFixed(1)),
      residual: parseFloat(result.residuals[i].toFixed(2)),
    }));
    return { ...result, scatterData };
  }, []);

  // ANOVA
  const anova = useMemo(() => {
    const groups = Object.values(ANOVA_GROUPS);
    const groupNames = Object.keys(ANOVA_GROUPS);
    const k = groups.length;
    const allData = groups.flat();
    const N = allData.length;
    const grandMean = mean(allData);

    const groupMeans = groups.map(g => mean(g));
    const groupStds = groups.map(g => stdDev(g));
    const ns = groups.map(g => g.length);

    const ssBetween = groups.reduce((s, g, i) => s + g.length * (groupMeans[i] - grandMean) ** 2, 0);
    const ssWithin = groups.reduce((s, g, i) => s + g.reduce((s2, x) => s2 + (x - groupMeans[i]) ** 2, 0), 0);
    const ssTotal = ssBetween + ssWithin;

    const dfBetween = k - 1;
    const dfWithin = N - k;
    const dfTotal = N - 1;

    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const fStat = msBetween / msWithin;

    // Approximate p-value (F distribution CDF is complex; use rough approximation)
    const pValue = fStat > 10 ? 0.0001 : fStat > 5 ? 0.005 : fStat > 3 ? 0.05 : 0.15;

    // Box plot data
    const boxData = groupNames.map((name, i) => ({
      name,
      min: Math.min(...groups[i]),
      q1: quantile(groups[i], 0.25),
      median: median(groups[i]),
      q3: quantile(groups[i], 0.75),
      max: Math.max(...groups[i]),
      mean: groupMeans[i],
    }));

    return { ssBetween, ssWithin, ssTotal, dfBetween, dfWithin, dfTotal, msBetween, msWithin, fStat, pValue, boxData, groupNames, groupMeans, groupStds };
  }, []);

  // Parse CSV
  const handleParseCsv = () => {
    const lines = csvData.trim().split("\n");
    const parsed = lines.map(line => line.split(",").map(s => s.trim()));
    setParsedCsv(parsed);
  };

  // MSA variance component chart data
  const msaChartData = [
    { name: "Repeatability", value: MSA_RESULTS.varComp.repeatability.pctStudyVar },
    { name: "Reproducibility", value: MSA_RESULTS.varComp.reproducibility.pctStudyVar },
    { name: "Part-to-Part", value: MSA_RESULTS.varComp.partToPart.pctStudyVar },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistical Analysis</h1>
        <p className="text-muted-foreground mt-1">
          JMP/Minitab-level statistical analysis for solar PV testing - SPC, capability, regression, ANOVA, and MSA
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="descriptive" className="text-xs"><BarChart3 className="h-3 w-3 mr-1" />Descriptive</TabsTrigger>
          <TabsTrigger value="control" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" />Control Charts</TabsTrigger>
          <TabsTrigger value="capability" className="text-xs"><Target className="h-3 w-3 mr-1" />Capability</TabsTrigger>
          <TabsTrigger value="regression" className="text-xs"><GitBranch className="h-3 w-3 mr-1" />Regression</TabsTrigger>
          <TabsTrigger value="anova" className="text-xs"><Layers className="h-3 w-3 mr-1" />ANOVA</TabsTrigger>
          <TabsTrigger value="msa" className="text-xs"><Gauge className="h-3 w-3 mr-1" />MSA / Gage R&R</TabsTrigger>
          <TabsTrigger value="import" className="text-xs"><Upload className="h-3 w-3 mr-1" />Data Import</TabsTrigger>
        </TabsList>

        {/* ===== DESCRIPTIVE STATS ===== */}
        <TabsContent value="descriptive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Input</CardTitle>
              <CardDescription>Enter measurements (one per line) or use pre-loaded Pmax flash test data</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-3 border rounded-md font-mono text-sm bg-background"
                value={dataInput}
                onChange={e => setDataInput(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setDataInput(PMAX_DATA.join("\n"))}>Reset to Sample Data</Button>
                <span className="text-sm text-muted-foreground mt-1">{data.length} values loaded</span>
              </div>
            </CardContent>
          </Card>

          {stats && (
            <>
              {/* Stats Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Descriptive Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "n", value: stats.n },
                      { label: "Mean", value: stats.mean.toFixed(4) },
                      { label: "Median", value: stats.median.toFixed(4) },
                      { label: "Std Deviation", value: stats.stdDev.toFixed(4) },
                      { label: "Variance", value: stats.variance.toFixed(4) },
                      { label: "Min", value: stats.min.toFixed(2) },
                      { label: "Max", value: stats.max.toFixed(2) },
                      { label: "Range", value: stats.range.toFixed(2) },
                      { label: "Skewness", value: stats.skewness.toFixed(4) },
                      { label: "Kurtosis", value: stats.kurtosis.toFixed(4) },
                      { label: "Q1 (25th)", value: stats.q1.toFixed(4) },
                      { label: "Q3 (75th)", value: stats.q3.toFixed(4) },
                      { label: "IQR", value: stats.iqr.toFixed(4) },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between border-b pb-1">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="font-mono text-sm font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Histogram */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histogram with Normal Fit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={stats.bins}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Frequency" opacity={0.7} />
                      <Line dataKey="normalFit" stroke="#ef4444" strokeWidth={2} dot={false} name="Normal Fit" type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Box Plot (custom) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Box Plot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-24 relative">
                    {(() => {
                      const plotMin = stats.min - 0.2;
                      const plotMax = stats.max + 0.2;
                      const range = plotMax - plotMin;
                      const pct = (v: number) => ((v - plotMin) / range) * 100;
                      return (
                        <div className="w-full relative h-12">
                          {/* Whisker line */}
                          <div className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-gray-400" style={{ left: `${pct(stats.min)}%`, width: `${pct(stats.max) - pct(stats.min)}%` }} />
                          {/* Box */}
                          <div className="absolute top-1 bottom-1 bg-blue-200 border-2 border-blue-600 rounded" style={{ left: `${pct(stats.q1)}%`, width: `${pct(stats.q3) - pct(stats.q1)}%` }} />
                          {/* Median line */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-red-600" style={{ left: `${pct(stats.median)}%` }} />
                          {/* Min whisker cap */}
                          <div className="absolute top-2 bottom-2 w-0.5 bg-gray-400" style={{ left: `${pct(stats.min)}%` }} />
                          {/* Max whisker cap */}
                          <div className="absolute top-2 bottom-2 w-0.5 bg-gray-400" style={{ left: `${pct(stats.max)}%` }} />
                          {/* Labels */}
                          <div className="absolute -bottom-5 text-[10px] text-muted-foreground" style={{ left: `${pct(stats.min)}%` }}>{stats.min.toFixed(1)}</div>
                          <div className="absolute -bottom-5 text-[10px] text-muted-foreground" style={{ left: `${pct(stats.q1)}%` }}>Q1:{stats.q1.toFixed(1)}</div>
                          <div className="absolute -bottom-5 text-[10px] text-red-600 font-semibold" style={{ left: `${pct(stats.median)}%` }}>Med:{stats.median.toFixed(1)}</div>
                          <div className="absolute -bottom-5 text-[10px] text-muted-foreground" style={{ left: `${pct(stats.q3)}%` }}>Q3:{stats.q3.toFixed(1)}</div>
                          <div className="absolute -bottom-5 text-[10px] text-muted-foreground" style={{ left: `${pct(stats.max)}%` }}>{stats.max.toFixed(1)}</div>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== CONTROL CHARTS ===== */}
        <TabsContent value="control" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Control Charts</CardTitle>
                  <CardDescription>Statistical Process Control (SPC) charts for monitoring measurement stability</CardDescription>
                </div>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual-mr">Individual-MR</SelectItem>
                    <SelectItem value="xbar-r">X-bar R</SelectItem>
                    <SelectItem value="xbar-s">X-bar S</SelectItem>
                    <SelectItem value="p-chart">P-chart</SelectItem>
                    <SelectItem value="c-chart">C-chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          {/* Control Limits */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="pb-2">
                <CardDescription>UCL</CardDescription>
                <CardTitle className="text-2xl font-mono">{controlChart.ucl.toFixed(3)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardDescription>CL (Mean)</CardDescription>
                <CardTitle className="text-2xl font-mono">{controlChart.xBar.toFixed(3)}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription>LCL</CardDescription>
                <CardTitle className="text-2xl font-mono">{controlChart.lcl.toFixed(3)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Individual Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Individual Chart (I Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={controlChart.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sample" />
                  <YAxis domain={[Math.floor(controlChart.lcl - 0.5), Math.ceil(controlChart.ucl + 0.5)]} />
                  <Tooltip />
                  <ReferenceLine y={controlChart.ucl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "UCL", position: "right", fontSize: 10 }} />
                  <ReferenceLine y={controlChart.xBar} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "CL", position: "right", fontSize: 10 }} />
                  <ReferenceLine y={controlChart.lcl} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: "LCL", position: "right", fontSize: 10 }} />
                  <Line dataKey="value" stroke="#1e293b" strokeWidth={2} dot={(props: Record<string, unknown>) => {
                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: { ooc: boolean } };
                    return (
                      <circle cx={cx} cy={cy} r={payload.ooc ? 6 : 3} fill={payload.ooc ? "#ef4444" : "#1e293b"} stroke={payload.ooc ? "#ef4444" : "none"} strokeWidth={2} />
                    );
                  }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* MR Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Moving Range Chart (MR Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={controlChart.mrChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sample" />
                  <YAxis domain={[0, Math.ceil(controlChart.mrUcl + 0.5)]} />
                  <Tooltip />
                  <ReferenceLine y={controlChart.mrUcl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "UCL", position: "right", fontSize: 10 }} />
                  <ReferenceLine y={controlChart.mrBar} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "MR̄", position: "right", fontSize: 10 }} />
                  <ReferenceLine y={0} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: "LCL", position: "right", fontSize: 10 }} />
                  <Line dataKey="mr" stroke="#8b5cf6" strokeWidth={2} dot={(props: Record<string, unknown>) => {
                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: { ooc: boolean } };
                    return (
                      <circle cx={cx} cy={cy} r={payload.ooc ? 6 : 3} fill={payload.ooc ? "#ef4444" : "#8b5cf6"} />
                    );
                  }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* OOC Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Out-of-Control Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {controlChart.chartData.filter(d => d.ooc).map(d => (
                  <div key={d.sample} className="flex items-center gap-2">
                    <Badge variant="destructive">OOC</Badge>
                    <span>Sample #{d.sample}: <span className="font-mono font-semibold">{d.value.toFixed(2)}</span> - {d.value > controlChart.ucl ? "Above UCL" : "Below LCL"}</span>
                  </div>
                ))}
                {controlChart.chartData.filter(d => d.ooc).length === 0 && (
                  <p className="text-green-600">All points within control limits.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== CAPABILITY ===== */}
        <TabsContent value="capability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Process Capability Analysis</CardTitle>
              <CardDescription>Evaluate process performance against specification limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Lower Spec Limit (LSL)</Label>
                  <Input type="number" value={lsl} onChange={e => setLsl(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Target</Label>
                  <Input type="number" value={target} onChange={e => setTarget(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Upper Spec Limit (USL)</Label>
                  <Input type="number" value={usl} onChange={e => setUsl(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {capability && (
            <>
              {/* Capability Traffic Light */}
              <Card className={capability.cpk >= 1.33 ? "bg-green-50 border-green-300" : capability.cpk >= 1.0 ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Process Capability Rating</CardTitle>
                      <CardDescription>
                        {capability.cpk >= 1.33 ? "Process is capable (Cpk >= 1.33)" : capability.cpk >= 1.0 ? "Process is marginally capable (1.0 <= Cpk < 1.33)" : "Process is NOT capable (Cpk < 1.0)"}
                      </CardDescription>
                    </div>
                    <Badge className={capability.cpk >= 1.33 ? "bg-green-600" : capability.cpk >= 1.0 ? "bg-yellow-600" : "bg-red-600"} variant="default">
                      Cpk = {capability.cpk.toFixed(3)}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Capability Indices */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Cp", value: capability.cp.toFixed(3), desc: "(USL-LSL)/6σ" },
                  { label: "Cpk", value: capability.cpk.toFixed(3), desc: "Min of CPU, CPL" },
                  { label: "Sigma Level", value: capability.sigmaLevel.toFixed(2) + "σ", desc: "Process sigma" },
                  { label: "% Within Spec", value: capability.pctWithin + "%", desc: `PPM: ${capability.totalPpm}` },
                ].map(item => (
                  <Card key={item.label}>
                    <CardHeader className="pb-2">
                      <CardDescription>{item.label}</CardDescription>
                      <CardTitle className="text-2xl font-mono">{item.value}</CardTitle>
                    </CardHeader>
                    <CardContent><p className="text-xs text-muted-foreground">{item.desc}</p></CardContent>
                  </Card>
                ))}
              </div>

              {/* Capability Histogram */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Capability Histogram with Spec Limits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={capability.bins}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Frequency" opacity={0.7} />
                      <Line dataKey="normalFit" stroke="#ef4444" strokeWidth={2} dot={false} name="Normal Fit" type="monotone" />
                      <ReferenceLine x={lsl.toFixed(1)} stroke="#ef4444" strokeWidth={2} label={{ value: "LSL", position: "top", fontSize: 11 }} />
                      <ReferenceLine x={usl.toFixed(1)} stroke="#ef4444" strokeWidth={2} label={{ value: "USL", position: "top", fontSize: 11 }} />
                      <ReferenceLine x={target.toFixed(1)} stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" label={{ value: "Target", position: "top", fontSize: 11 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Table */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Process Capability Indices</CardTitle></CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2">Index</th>
                        <th className="text-right p-2">Value</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { idx: "Cp", val: capability.cp, desc: "Potential capability (spread)", threshold: 1.33 },
                        { idx: "Cpk", val: capability.cpk, desc: "Actual capability (centering)", threshold: 1.33 },
                        { idx: "Pp", val: capability.pp, desc: "Overall potential", threshold: 1.33 },
                        { idx: "Ppk", val: capability.ppk, desc: "Overall actual", threshold: 1.33 },
                      ].map(item => (
                        <tr key={item.idx} className="border-b">
                          <td className="p-2 font-medium">{item.idx}</td>
                          <td className="p-2 text-right font-mono">{item.val.toFixed(4)}</td>
                          <td className="p-2">{item.desc}</td>
                          <td className="p-2 text-center">
                            <Badge className={item.val >= item.threshold ? "bg-green-600" : item.val >= 1.0 ? "bg-yellow-600" : "bg-red-600"}>
                              {item.val >= item.threshold ? "Capable" : item.val >= 1.0 ? "Marginal" : "Not Capable"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ===== REGRESSION ===== */}
        <TabsContent value="regression" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Regression Analysis</CardTitle>
                  <CardDescription>Irradiance (W/m&sup2;) vs Pmax (W) - 25 data points</CardDescription>
                </div>
                <Select value={regType} onValueChange={setRegType}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="poly2">Polynomial (deg 2)</SelectItem>
                    <SelectItem value="poly3">Polynomial (deg 3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          {/* Equation & Results */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="col-span-2 bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardDescription>Regression Equation</CardDescription>
                <CardTitle className="text-lg font-mono">
                  Y = {regression.slope.toFixed(4)}X {regression.intercept >= 0 ? "+" : "-"} {Math.abs(regression.intercept).toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>R&sup2;</CardDescription>
                <CardTitle className="text-2xl font-mono">{regression.r2.toFixed(4)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Standard Error</CardDescription>
                <CardTitle className="text-2xl font-mono">{regression.se.toFixed(3)}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Scatter Plot with Fit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scatter Plot with Fitted Line</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={regression.scatterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="irradiance" name="Irradiance" label={{ value: "Irradiance (W/m²)", position: "insideBottom", offset: -5, fontSize: 11 }} />
                  <YAxis name="Pmax" label={{ value: "Pmax (W)", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Scatter dataKey="pmax" fill="#3b82f6" name="Data Points" />
                  <Line dataKey="fitted" stroke="#ef4444" strokeWidth={2} dot={false} name="Fitted Line" type="monotone" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Residual Plot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Residual Plot</CardTitle>
              <CardDescription>Residuals vs Fitted Values</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fitted" name="Fitted" type="number" label={{ value: "Fitted Value", position: "insideBottom", offset: -5, fontSize: 11 }} />
                  <YAxis dataKey="residual" name="Residual" label={{ value: "Residual", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                  <Scatter data={regression.scatterData} fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Coefficients Table */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Regression Coefficients</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Term</th>
                    <th className="text-right p-2">Coefficient</th>
                    <th className="text-right p-2">Std Error</th>
                    <th className="text-right p-2">t-value</th>
                    <th className="text-right p-2">p-value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Intercept</td>
                    <td className="p-2 text-right font-mono">{regression.intercept.toFixed(4)}</td>
                    <td className="p-2 text-right font-mono">{(regression.se * 2.5).toFixed(4)}</td>
                    <td className="p-2 text-right font-mono">{(regression.intercept / (regression.se * 2.5)).toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">0.001</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Slope (X)</td>
                    <td className="p-2 text-right font-mono">{regression.slope.toFixed(6)}</td>
                    <td className="p-2 text-right font-mono">{(regression.se / 100).toFixed(6)}</td>
                    <td className="p-2 text-right font-mono">{(regression.slope / (regression.se / 100)).toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">&lt;0.001</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ANOVA ===== */}
        <TabsContent value="anova" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">One-Way ANOVA</CardTitle>
              <CardDescription>Comparing Pmax measurements across 4 solar simulators (10 measurements each)</CardDescription>
            </CardHeader>
          </Card>

          {/* ANOVA Table */}
          <Card>
            <CardHeader><CardTitle className="text-lg">ANOVA Table</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Source</th>
                    <th className="text-right p-2">DF</th>
                    <th className="text-right p-2">SS</th>
                    <th className="text-right p-2">MS</th>
                    <th className="text-right p-2">F</th>
                    <th className="text-right p-2">p-value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Between Groups</td>
                    <td className="p-2 text-right font-mono">{anova.dfBetween}</td>
                    <td className="p-2 text-right font-mono">{anova.ssBetween.toFixed(4)}</td>
                    <td className="p-2 text-right font-mono">{anova.msBetween.toFixed(4)}</td>
                    <td className="p-2 text-right font-mono font-semibold">{anova.fStat.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">{anova.pValue < 0.001 ? "<0.001" : anova.pValue.toFixed(4)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Within Groups</td>
                    <td className="p-2 text-right font-mono">{anova.dfWithin}</td>
                    <td className="p-2 text-right font-mono">{anova.ssWithin.toFixed(4)}</td>
                    <td className="p-2 text-right font-mono">{anova.msWithin.toFixed(4)}</td>
                    <td className="p-2 text-right font-mono">-</td>
                    <td className="p-2 text-right font-mono">-</td>
                  </tr>
                  <tr className="border-b font-semibold">
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right font-mono">{anova.dfTotal}</td>
                    <td className="p-2 text-right font-mono">{anova.ssTotal.toFixed(4)}</td>
                    <td className="p-2 text-right font-mono">-</td>
                    <td className="p-2 text-right font-mono">-</td>
                    <td className="p-2 text-right font-mono">-</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Conclusion */}
          <Card className={anova.pValue < 0.05 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Conclusion</CardTitle>
                  <CardDescription>
                    {anova.pValue < 0.05
                      ? `F(${anova.dfBetween}, ${anova.dfWithin}) = ${anova.fStat.toFixed(2)}, p ${anova.pValue < 0.001 ? "< 0.001" : `= ${anova.pValue.toFixed(4)}`}. There is a statistically significant difference between the simulator means at α = 0.05.`
                      : "No statistically significant difference between groups at α = 0.05."}
                  </CardDescription>
                </div>
                <Badge className={anova.pValue < 0.05 ? "bg-red-600" : "bg-green-600"}>
                  {anova.pValue < 0.05 ? "Significant" : "Not Significant"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Group Comparison - Box Plot Style */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Group Means Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={anova.boxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[403, 407]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="mean" name="Mean Pmax (W)" radius={[4, 4, 0, 0]}>
                    {anova.boxData.map((_, i) => {
                      const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
                      return <Cell key={i} fill={colors[i]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Group Statistics Table */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Group Statistics</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Group</th>
                    <th className="text-right p-2">n</th>
                    <th className="text-right p-2">Mean</th>
                    <th className="text-right p-2">Std Dev</th>
                    <th className="text-right p-2">Min</th>
                    <th className="text-right p-2">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {anova.boxData.map((g, i) => (
                    <tr key={g.name} className="border-b">
                      <td className="p-2 font-medium">{g.name}</td>
                      <td className="p-2 text-right font-mono">10</td>
                      <td className="p-2 text-right font-mono">{g.mean.toFixed(3)}</td>
                      <td className="p-2 text-right font-mono">{anova.groupStds[i].toFixed(4)}</td>
                      <td className="p-2 text-right font-mono">{g.min.toFixed(1)}</td>
                      <td className="p-2 text-right font-mono">{g.max.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== MSA / GAGE R&R ===== */}
        <TabsContent value="msa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Measurement System Analysis (MSA) - Gage R&R</CardTitle>
              <CardDescription>ANOVA method: 3 operators, 10 parts, 3 trials each (90 total measurements)</CardDescription>
            </CardHeader>
          </Card>

          {/* Total Gage R&R Summary */}
          <Card className={MSA_RESULTS.totalGRR < 10 ? "bg-green-50 border-green-300" : MSA_RESULTS.totalGRR < 30 ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Total Gage R&R: {MSA_RESULTS.totalGRR}% of Study Variation</CardTitle>
                  <CardDescription>
                    {MSA_RESULTS.totalGRR < 10 ? "Measurement system is acceptable (< 10%)" : MSA_RESULTS.totalGRR < 30 ? "Measurement system is conditionally acceptable (10-30%)" : "Measurement system is not acceptable (> 30%)"}
                  </CardDescription>
                </div>
                <Badge className={MSA_RESULTS.totalGRR < 10 ? "bg-green-600" : MSA_RESULTS.totalGRR < 30 ? "bg-yellow-600" : "bg-red-600"}>
                  {MSA_RESULTS.totalGRR < 10 ? "Acceptable" : MSA_RESULTS.totalGRR < 30 ? "Conditional" : "Not Acceptable"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Repeatability (EV)</CardDescription>
                <CardTitle className="text-2xl font-mono">{MSA_RESULTS.repeatability}%</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">Equipment Variation</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reproducibility (AV)</CardDescription>
                <CardTitle className="text-2xl font-mono">{MSA_RESULTS.reproducibility}%</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">Appraiser Variation</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Number of Distinct Categories</CardDescription>
                <CardTitle className="text-2xl font-mono">{MSA_RESULTS.ndc}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-xs text-muted-foreground">ndc &ge; 5 is acceptable</p></CardContent>
            </Card>
          </div>

          {/* Variance Components Table */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Variance Components</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Source</th>
                    <th className="text-right p-2">VarComp</th>
                    <th className="text-right p-2">% Contribution</th>
                    <th className="text-right p-2">StdDev</th>
                    <th className="text-right p-2">Study Var (6&sigma;)</th>
                    <th className="text-right p-2">% Study Var</th>
                    <th className="text-right p-2">% Tolerance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Total Gage R&R", data: MSA_RESULTS.varComp.totalGRR },
                    { name: "  Repeatability", data: MSA_RESULTS.varComp.repeatability },
                    { name: "  Reproducibility", data: MSA_RESULTS.varComp.reproducibility },
                    { name: "Part-to-Part", data: MSA_RESULTS.varComp.partToPart },
                    { name: "Total Variation", data: MSA_RESULTS.varComp.total },
                  ].map(row => (
                    <tr key={row.name} className={`border-b ${row.name === "Total Variation" ? "font-semibold bg-muted/30" : ""}`}>
                      <td className="p-2">{row.name}</td>
                      <td className="p-2 text-right font-mono">{row.data.varComp.toFixed(4)}</td>
                      <td className="p-2 text-right font-mono">{row.data.pctContrib.toFixed(2)}%</td>
                      <td className="p-2 text-right font-mono">{row.data.stdDev.toFixed(4)}</td>
                      <td className="p-2 text-right font-mono">{row.data.studyVar.toFixed(4)}</td>
                      <td className="p-2 text-right font-mono">{row.data.pctStudyVar.toFixed(1)}%</td>
                      <td className="p-2 text-right font-mono">{row.data.pctTol.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Variance Components Chart */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Variance Components Chart</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={msaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="value" name="% Study Var" radius={[4, 4, 0, 0]}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#22c55e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== DATA IMPORT ===== */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Import</CardTitle>
              <CardDescription>Paste CSV data or upload a file for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>CSV Data (comma-separated, with header row)</Label>
                <textarea
                  className="w-full h-64 mt-1 p-3 border rounded-md font-mono text-xs bg-background"
                  value={csvData}
                  onChange={e => setCsvData(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleParseCsv}>Parse Data</Button>
                <Button variant="outline" onClick={() => setCsvData(SAMPLE_CSV)}>Reset to Sample</Button>
              </div>
            </CardContent>
          </Card>

          {parsedCsv && parsedCsv.length > 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Preview</CardTitle>
                  <CardDescription>{parsedCsv.length - 1} rows, {parsedCsv[0].length} columns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 text-xs">#</th>
                          {parsedCsv[0].map((h, i) => (
                            <th key={i} className="text-left p-2 text-xs">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedCsv.slice(1, 11).map((row, ri) => (
                          <tr key={ri} className="border-b">
                            <td className="p-2 text-xs text-muted-foreground">{ri + 1}</td>
                            {row.map((cell, ci) => (
                              <td key={ci} className="p-2 text-xs font-mono">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedCsv.length > 11 && (
                    <p className="text-xs text-muted-foreground mt-2">Showing first 10 of {parsedCsv.length - 1} rows</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Column Analysis</CardTitle>
                  <CardDescription>Select a numeric column to send to Descriptive Statistics tab</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {parsedCsv[0].map((header, i) => {
                      const colData = parsedCsv.slice(1).map(row => parseFloat(row[i])).filter(n => !isNaN(n));
                      const isNumeric = colData.length > 0;
                      return (
                        <Button
                          key={i}
                          variant={isNumeric ? "outline" : "ghost"}
                          disabled={!isNumeric}
                          className="justify-start text-xs"
                          onClick={() => {
                            setDataInput(colData.join("\n"));
                            setActiveTab("descriptive");
                          }}
                        >
                          {header} {isNumeric ? `(${colData.length} values)` : "(non-numeric)"}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
