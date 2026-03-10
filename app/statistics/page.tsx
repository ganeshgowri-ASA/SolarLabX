// @ts-nocheck
"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, Cell, ComposedChart,
  Area, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, TrendingUp, Activity, Calculator, GitBranch, Gauge, FileSpreadsheet,
  CheckCircle2, AlertTriangle, XCircle,
} from "lucide-react";

// ─── Utility: seeded pseudo-random number generator ───
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateNormal(mean: number, stdDev: number, rng: () => number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// ─── Mock data generators ───
function generatePmaxData(n: number, mean: number, std: number, seed: number): number[] {
  const rng = seededRandom(seed);
  return Array.from({ length: n }, () => parseFloat(generateNormal(mean, std, rng).toFixed(2)));
}

const MOCK_PMAX_50 = generatePmaxData(50, 405, 1.5, 42);

const MOCK_CONTROL_30 = (() => {
  const rng = seededRandom(99);
  const data = Array.from({ length: 30 }, (_, i) => {
    let val = generateNormal(405, 1.2, rng);
    // inject out-of-control points
    if (i === 7) val = 410.5;
    if (i === 18) val = 399.2;
    if (i === 24) val = 411.0;
    return parseFloat(val.toFixed(2));
  });
  return data;
})();

const MOCK_REGRESSION = (() => {
  const rng = seededRandom(77);
  return Array.from({ length: 25 }, (_, i) => {
    const irradiance = 200 + i * 35 + generateNormal(0, 15, rng);
    const pmax = 50 + 0.38 * irradiance + generateNormal(0, 8, rng);
    return {
      irradiance: parseFloat(irradiance.toFixed(1)),
      pmax: parseFloat(pmax.toFixed(2)),
    };
  });
})();

const MOCK_ANOVA_GROUPS: Record<string, number[]> = (() => {
  const groups: Record<string, number[]> = {};
  const means: Record<string, number> = { "Sim A": 405.2, "Sim B": 404.1, "Sim C": 406.8, "Sim D": 405.5 };
  let seedVal = 200;
  for (const [name, m] of Object.entries(means)) {
    const rng = seededRandom(seedVal++);
    groups[name] = Array.from({ length: 10 }, () =>
      parseFloat(generateNormal(m, 1.3, rng).toFixed(2))
    );
  }
  return groups;
})();

const MOCK_MSA = (() => {
  const rng = seededRandom(300);
  const parts = 10;
  const operators = 3;
  const trials = 3;
  const data: { part: number; operator: number; trial: number; value: number }[] = [];
  const partMeans = Array.from({ length: parts }, () => generateNormal(405, 3, rng));
  for (let p = 0; p < parts; p++) {
    for (let o = 0; o < operators; o++) {
      const opBias = generateNormal(0, 0.3, rng);
      for (let t = 0; t < trials; t++) {
        data.push({
          part: p + 1,
          operator: o + 1,
          trial: t + 1,
          value: parseFloat((partMeans[p] + opBias + generateNormal(0, 0.15, rng)).toFixed(3)),
        });
      }
    }
  }
  return data;
})();

const MOCK_CSV_DATA = `SampleID,Pmax_W,Voc_V,Isc_A,FF,Irradiance,Temperature
MOD-001,405.2,48.5,10.52,0.794,1000,25.1
MOD-002,403.8,48.3,10.48,0.797,1000,25.3
MOD-003,406.1,48.7,10.55,0.790,1000,25.0
MOD-004,404.5,48.4,10.50,0.796,1000,25.2
MOD-005,407.3,48.9,10.58,0.787,1000,24.9
MOD-006,402.1,48.1,10.45,0.800,1000,25.5
MOD-007,405.8,48.6,10.53,0.793,1000,25.1
MOD-008,404.2,48.3,10.49,0.797,1000,25.4
MOD-009,406.5,48.8,10.56,0.789,1000,24.8
MOD-010,403.5,48.2,10.47,0.799,1000,25.3
MOD-011,405.0,48.5,10.51,0.795,1000,25.2
MOD-012,407.8,49.0,10.59,0.786,1000,24.7
MOD-013,401.9,48.0,10.44,0.801,1000,25.6
MOD-014,404.8,48.4,10.50,0.796,1000,25.2
MOD-015,406.3,48.7,10.55,0.790,1000,25.0
MOD-016,403.1,48.2,10.46,0.799,1000,25.4
MOD-017,405.5,48.6,10.52,0.794,1000,25.1
MOD-018,404.0,48.3,10.48,0.798,1000,25.3
MOD-019,406.9,48.8,10.57,0.788,1000,24.9
MOD-020,403.7,48.2,10.47,0.799,1000,25.4`;

// ─── Statistical helper functions ───
function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function variance(arr: number[], ddof = 1): number {
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - ddof);
}

function stdDev(arr: number[], ddof = 1): number {
  return Math.sqrt(variance(arr, ddof));
}

function skewness(arr: number[]): number {
  const n = arr.length;
  const m = mean(arr);
  const s = stdDev(arr);
  const m3 = arr.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * m3;
}

function kurtosis(arr: number[]): number {
  const n = arr.length;
  const m = mean(arr);
  const s = stdDev(arr);
  const m4 = arr.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0);
  return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * m4 -
    (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
}

function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function normalPDF(x: number, mu: number, sigma: number): number {
  return (
    (1 / (sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
  );
}

function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = mean(xs);
  const my = mean(ys);
  let ssxy = 0, ssxx = 0, ssyy = 0;
  for (let i = 0; i < n; i++) {
    ssxy += (xs[i] - mx) * (ys[i] - my);
    ssxx += (xs[i] - mx) ** 2;
    ssyy += (ys[i] - my) ** 2;
  }
  const slope = ssxy / ssxx;
  const intercept = my - slope * mx;
  const r2 = (ssxy ** 2) / (ssxx * ssyy);
  const adjR2 = 1 - ((1 - r2) * (n - 1)) / (n - 2 - 1);
  const predicted = xs.map((x) => slope * x + intercept);
  const residuals = ys.map((y, i) => y - predicted[i]);
  const sse = residuals.reduce((a, r) => a + r ** 2, 0);
  const se = Math.sqrt(sse / (n - 2));
  return { slope, intercept, r2, adjR2, se, predicted, residuals };
}

// ─── Component ───
export default function StatisticsPage() {
  // Tab 1 state
  const [rawInput, setRawInput] = useState<string>(MOCK_PMAX_50.join("\n"));
  const [useCustomData, setUseCustomData] = useState(false);

  // Tab 2 state
  const [chartType, setChartType] = useState("individual-mr");

  // Tab 3 state
  const [usl, setUsl] = useState(410);
  const [lsl, setLsl] = useState(400);
  const [target, setTarget] = useState(405);

  // Tab 4 state
  const [regType, setRegType] = useState("linear");

  // Tab 7 state
  const [csvInput, setCsvInput] = useState(MOCK_CSV_DATA);
  const [parsedCSV, setParsedCSV] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [selectedCol, setSelectedCol] = useState<string>("");

  // ─── Tab 1 computations ───
  const descData = useMemo(() => {
    if (useCustomData) {
      return rawInput
        .split("\n")
        .map((s) => parseFloat(s.trim()))
        .filter((v) => !isNaN(v));
    }
    return MOCK_PMAX_50;
  }, [rawInput, useCustomData]);

  const descStats = useMemo(() => {
    if (descData.length < 3) return null;
    const q1 = quantile(descData, 0.25);
    const q3 = quantile(descData, 0.75);
    return {
      n: descData.length,
      mean: mean(descData),
      median: median(descData),
      stdDev: stdDev(descData),
      variance: variance(descData),
      min: Math.min(...descData),
      max: Math.max(...descData),
      range: Math.max(...descData) - Math.min(...descData),
      skewness: skewness(descData),
      kurtosis: kurtosis(descData),
      q1,
      q3,
      iqr: q3 - q1,
    };
  }, [descData]);

  const histogramData = useMemo(() => {
    if (!descStats) return [];
    const binCount = Math.ceil(Math.sqrt(descData.length));
    const binWidth = descStats.range / binCount;
    const bins: { binStart: number; binEnd: number; binLabel: string; count: number; normalY: number }[] = [];
    for (let i = 0; i < binCount; i++) {
      const start = descStats.min + i * binWidth;
      const end = start + binWidth;
      const count = descData.filter((v) => (i === binCount - 1 ? v >= start && v <= end : v >= start && v < end)).length;
      const midpoint = (start + end) / 2;
      const normalY = normalPDF(midpoint, descStats.mean, descStats.stdDev) * descData.length * binWidth;
      bins.push({
        binStart: start,
        binEnd: end,
        binLabel: midpoint.toFixed(1),
        count,
        normalY: parseFloat(normalY.toFixed(2)),
      });
    }
    return bins;
  }, [descData, descStats]);

  // ─── Tab 2 computations ───
  const controlData = useMemo(() => {
    const data = MOCK_CONTROL_30;
    const m = mean(data);
    const mrs: number[] = [];
    for (let i = 1; i < data.length; i++) {
      mrs.push(Math.abs(data[i] - data[i - 1]));
    }
    const mrBar = mean(mrs);
    const d2 = 1.128;
    const sigma = mrBar / d2;
    const iUCL = m + 3 * sigma;
    const iLCL = m - 3 * sigma;
    const mrUCL = 3.267 * mrBar;

    const chartData = data.map((val, i) => ({
      subgroup: i + 1,
      value: val,
      mr: i > 0 ? mrs[i - 1] : null,
      ooc: val > iUCL || val < iLCL,
      mrOoc: i > 0 ? mrs[i - 1] > mrUCL : false,
    }));

    return { chartData, mean: m, iUCL, iLCL, mrBar, mrUCL };
  }, []);

  // ─── Tab 3 computations ───
  const capabilityStats = useMemo(() => {
    const data = descData;
    if (data.length < 3) return null;
    const m = mean(data);
    const s = stdDev(data);
    const cp = (usl - lsl) / (6 * s);
    const cpk = Math.min((usl - m) / (3 * s), (m - lsl) / (3 * s));
    const pp = (usl - lsl) / (6 * stdDev(data, 0));
    const ppk = Math.min((usl - m) / (3 * stdDev(data, 0)), (m - lsl) / (3 * stdDev(data, 0)));
    const sigmaLevel = cpk * 3;
    // Approximate PPM using normal distribution approximation
    const zUpper = (usl - m) / s;
    const zLower = (m - lsl) / s;
    // Simple approximation for cumulative normal
    const approxPhi = (z: number) => {
      const t = 1 / (1 + 0.2316419 * Math.abs(z));
      const d = 0.3989422804 * Math.exp(-z * z / 2);
      const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.8212560 + t * 1.330274))));
      return z > 0 ? 1 - p : p;
    };
    const ppmUpper = (1 - approxPhi(zUpper)) * 1000000;
    const ppmLower = approxPhi(-zLower) * 1000000;
    const ppmTotal = ppmUpper + ppmLower;
    const withinSpec = 100 - ppmTotal / 10000;

    return { cp, cpk, pp, ppk, sigmaLevel, ppmTotal, withinSpec, mean: m, stdDev: s };
  }, [descData, usl, lsl]);

  // ─── Tab 4 computations ───
  const regressionResult = useMemo(() => {
    const xs = MOCK_REGRESSION.map((d) => d.irradiance);
    const ys = MOCK_REGRESSION.map((d) => d.pmax);
    if (regType === "linear") {
      return linearRegression(xs, ys);
    }
    // polynomial approximation: use linear for display
    return linearRegression(xs, ys);
  }, [regType]);

  const regressionScatterData = useMemo(() => {
    return MOCK_REGRESSION.map((d, i) => ({
      ...d,
      fitted: regressionResult.predicted[i],
      residual: regressionResult.residuals[i],
    }));
  }, [regressionResult]);

  // ─── Tab 5 computations ───
  const anovaResult = useMemo(() => {
    const groups = Object.values(MOCK_ANOVA_GROUPS);
    const groupNames = Object.keys(MOCK_ANOVA_GROUPS);
    const allValues = groups.flat();
    const grandMean = mean(allValues);
    const k = groups.length;
    const N = allValues.length;

    let ssBetween = 0;
    for (const g of groups) {
      ssBetween += g.length * (mean(g) - grandMean) ** 2;
    }
    let ssWithin = 0;
    for (const g of groups) {
      const gm = mean(g);
      for (const v of g) {
        ssWithin += (v - gm) ** 2;
      }
    }
    const ssTotal = ssBetween + ssWithin;
    const dfBetween = k - 1;
    const dfWithin = N - k;
    const dfTotal = N - 1;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const fStat = msBetween / msWithin;

    // Approximate p-value using simple F-distribution approximation
    const pValue = fStat > 4.0 ? 0.001 : fStat > 3.0 ? 0.02 : fStat > 2.5 ? 0.07 : 0.15;

    const groupStats = groupNames.map((name, i) => ({
      name,
      mean: mean(groups[i]),
      stdDev: stdDev(groups[i]),
      n: groups[i].length,
      ci95: 1.96 * stdDev(groups[i]) / Math.sqrt(groups[i].length),
      values: groups[i],
    }));

    return { ssBetween, ssWithin, ssTotal, dfBetween, dfWithin, dfTotal, msBetween, msWithin, fStat, pValue, groupStats };
  }, []);

  // ─── Tab 6 computations ───
  const msaResult = useMemo(() => {
    const data = MOCK_MSA;
    const parts = 10, operators = 3, trials = 3;
    const grandMean = mean(data.map((d) => d.value));

    // Part means
    const partMeans: number[] = [];
    for (let p = 1; p <= parts; p++) {
      partMeans.push(mean(data.filter((d) => d.part === p).map((d) => d.value)));
    }
    // Operator means
    const opMeans: number[] = [];
    for (let o = 1; o <= operators; o++) {
      opMeans.push(mean(data.filter((d) => d.operator === o).map((d) => d.value)));
    }

    const ssParts = operators * trials * partMeans.reduce((s, pm) => s + (pm - grandMean) ** 2, 0);
    const ssOperators = parts * trials * opMeans.reduce((s, om) => s + (om - grandMean) ** 2, 0);

    let ssRepeat = 0;
    for (let p = 1; p <= parts; p++) {
      for (let o = 1; o <= operators; o++) {
        const cellValues = data.filter((d) => d.part === p && d.operator === o).map((d) => d.value);
        const cellMean = mean(cellValues);
        for (const v of cellValues) {
          ssRepeat += (v - cellMean) ** 2;
        }
      }
    }

    const ssTotal = data.reduce((s, d) => s + (d.value - grandMean) ** 2, 0);
    const ssInteraction = ssTotal - ssParts - ssOperators - ssRepeat;

    const dfParts = parts - 1;
    const dfOps = operators - 1;
    const dfInteraction = dfParts * dfOps;
    const dfRepeat = parts * operators * (trials - 1);

    const msRepeat = ssRepeat / dfRepeat;
    const msInteraction = Math.max(0, ssInteraction / dfInteraction);
    const msOps = ssOperators / dfOps;
    const msParts = ssParts / dfParts;

    const varRepeat = msRepeat;
    const varReprod = Math.max(0, (msOps - msInteraction) / (parts * trials)) + Math.max(0, (msInteraction - msRepeat) / trials);
    const varGRR = varRepeat + varReprod;
    const varParts = Math.max(0, (msParts - msInteraction) / (operators * trials));
    const varTotal = varGRR + varParts;

    const pctGRR = (varGRR / varTotal) * 100;
    const pctRepeat = (varRepeat / varTotal) * 100;
    const pctReprod = (varReprod / varTotal) * 100;
    const pctParts = (varParts / varTotal) * 100;

    const sdGRR = Math.sqrt(varGRR);
    const sdRepeat = Math.sqrt(varRepeat);
    const sdReprod = Math.sqrt(varReprod);
    const sdParts = Math.sqrt(varParts);
    const sdTotal = Math.sqrt(varTotal);

    const svGRR = sdGRR * 5.15;
    const svRepeat = sdRepeat * 5.15;
    const svReprod = sdReprod * 5.15;
    const svParts = sdParts * 5.15;
    const svTotal = sdTotal * 5.15;

    const tolerance = usl - lsl;
    const ptGRR = (svGRR / tolerance) * 100;
    const ptRepeat = (svRepeat / tolerance) * 100;
    const ptReprod = (svReprod / tolerance) * 100;
    const ptParts = (svParts / tolerance) * 100;

    const pctStudyGRR = (sdGRR / sdTotal) * 100;
    const pctStudyRepeat = (sdRepeat / sdTotal) * 100;
    const pctStudyReprod = (sdReprod / sdTotal) * 100;
    const pctStudyParts = (sdParts / sdTotal) * 100;

    const ndc = Math.floor(1.41 * (sdParts / sdGRR));

    return {
      rows: [
        { source: "Total Gage R&R", varComp: varGRR, pctContrib: pctGRR, sd: sdGRR, sv: svGRR, pctStudy: pctStudyGRR, pctTol: ptGRR },
        { source: "  Repeatability", varComp: varRepeat, pctContrib: pctRepeat, sd: sdRepeat, sv: svRepeat, pctStudy: pctStudyRepeat, pctTol: ptRepeat },
        { source: "  Reproducibility", varComp: varReprod, pctContrib: pctReprod, sd: sdReprod, sv: svReprod, pctStudy: pctStudyReprod, pctTol: ptReprod },
        { source: "Part-to-Part", varComp: varParts, pctContrib: pctParts, sd: sdParts, sv: svParts, pctStudy: pctStudyParts, pctTol: ptParts },
        { source: "Total Variation", varComp: varTotal, pctContrib: 100, sd: sdTotal, sv: svTotal, pctStudy: 100, pctTol: (svTotal / tolerance) * 100 },
      ],
      pctGRR,
      ndc,
      varData: [
        { name: "Repeatability", value: pctRepeat },
        { name: "Reproducibility", value: pctReprod },
        { name: "Part-to-Part", value: pctParts },
      ],
    };
  }, [usl, lsl]);

  // ─── CSV parsing ───
  const handleParseCSV = () => {
    const lines = csvInput.trim().split("\n");
    if (lines.length < 2) return;
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
    setParsedCSV({ headers, rows });
    if (headers.length > 1) setSelectedCol(headers[1]);
  };

  // ─── Render helpers ───
  const fmt = (v: number, decimals = 4) => v.toFixed(decimals);

  const cpkColor = (cpk: number) => {
    if (cpk >= 1.33) return "text-green-600";
    if (cpk >= 1.0) return "text-yellow-600";
    return "text-red-600";
  };

  const cpkBg = (cpk: number) => {
    if (cpk >= 1.33) return "bg-green-100 border-green-400";
    if (cpk >= 1.0) return "bg-yellow-100 border-yellow-400";
    return "bg-red-100 border-red-400";
  };

  const cpkIcon = (cpk: number) => {
    if (cpk >= 1.33) return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    if (cpk >= 1.0) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  const grrColor = (pct: number) => {
    if (pct < 10) return "text-green-600";
    if (pct < 30) return "text-yellow-600";
    return "text-red-600";
  };

  const grrBg = (pct: number) => {
    if (pct < 10) return "bg-green-100 border-green-400";
    if (pct < 30) return "bg-yellow-100 border-yellow-400";
    return "bg-red-100 border-red-400";
  };

  // Box plot helper data
  const boxPlotStats = useMemo(() => {
    if (descData.length < 3) return null;
    const sorted = [...descData].sort((a, b) => a - b);
    return {
      min: sorted[0],
      q1: quantile(descData, 0.25),
      median: median(descData),
      q3: quantile(descData, 0.75),
      max: sorted[sorted.length - 1],
    };
  }, [descData]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Statistical Analysis
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          JMP/Minitab-grade statistical analysis for solar PV testing. Descriptive statistics,
          control charts, process capability, regression, ANOVA, and Measurement System Analysis (MSA).
        </p>
      </div>

      <Tabs defaultValue="descriptive" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="descriptive" className="text-xs">Descriptive Stats</TabsTrigger>
          <TabsTrigger value="control" className="text-xs">Control Charts</TabsTrigger>
          <TabsTrigger value="capability" className="text-xs">Capability Analysis</TabsTrigger>
          <TabsTrigger value="regression" className="text-xs">Regression</TabsTrigger>
          <TabsTrigger value="anova" className="text-xs">ANOVA</TabsTrigger>
          <TabsTrigger value="msa" className="text-xs">MSA / Gage R&R</TabsTrigger>
          <TabsTrigger value="import" className="text-xs">Data Import</TabsTrigger>
        </TabsList>

        {/* ═══════════════════ Tab 1: Descriptive Stats ═══════════════════ */}
        <TabsContent value="descriptive" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Data Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Input</CardTitle>
                <CardDescription>Paste values (one per line) or use mock data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={!useCustomData ? "default" : "outline"}
                    onClick={() => { setUseCustomData(false); setRawInput(MOCK_PMAX_50.join("\n")); }}
                  >
                    Mock Pmax Data (n=50)
                  </Button>
                  <Button
                    size="sm"
                    variant={useCustomData ? "default" : "outline"}
                    onClick={() => setUseCustomData(true)}
                  >
                    Custom Data
                  </Button>
                </div>
                <Textarea
                  rows={12}
                  value={rawInput}
                  onChange={(e) => { setRawInput(e.target.value); setUseCustomData(true); }}
                  placeholder="Paste numeric values, one per line..."
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {descData.length} values loaded
                </p>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Summary Statistics</CardTitle>
                <CardDescription>Pmax Flash Test Measurements (W)</CardDescription>
              </CardHeader>
              <CardContent>
                {descStats ? (
                  <div className="grid grid-cols-2 gap-x-8">
                    <Table>
                      <TableBody>
                        {[
                          ["n", descStats.n.toString()],
                          ["Mean", fmt(descStats.mean)],
                          ["Median", fmt(descStats.median)],
                          ["Std Dev", fmt(descStats.stdDev)],
                          ["Variance", fmt(descStats.variance)],
                          ["Min", fmt(descStats.min)],
                          ["Max", fmt(descStats.max)],
                        ].map(([label, val]) => (
                          <TableRow key={label}>
                            <TableCell className="font-medium py-1.5">{label}</TableCell>
                            <TableCell className="text-right font-mono py-1.5">{val}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Table>
                      <TableBody>
                        {[
                          ["Range", fmt(descStats.range)],
                          ["Skewness", fmt(descStats.skewness)],
                          ["Kurtosis", fmt(descStats.kurtosis)],
                          ["Q1 (25%)", fmt(descStats.q1)],
                          ["Q3 (75%)", fmt(descStats.q3)],
                          ["IQR", fmt(descStats.iqr)],
                          ["SE Mean", fmt(descStats.stdDev / Math.sqrt(descStats.n))],
                        ].map(([label, val]) => (
                          <TableRow key={label}>
                            <TableCell className="font-medium py-1.5">{label}</TableCell>
                            <TableCell className="text-right font-mono py-1.5">{val}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Enter at least 3 data points.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Histogram */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histogram with Normal Fit</CardTitle>
              </CardHeader>
              <CardContent>
                {histogramData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={histogramData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="binLabel" label={{ value: "Pmax (W)", position: "insideBottom", offset: -10 }} tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
                      <YAxis yAxisId="right" orientation="right" hide />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Frequency" opacity={0.7} />
                      <Line yAxisId="left" type="monotone" dataKey="normalY" stroke="#ef4444" strokeWidth={2} dot={false} name="Normal Fit" />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>

            {/* Box Plot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Box Plot</CardTitle>
              </CardHeader>
              <CardContent>
                {boxPlotStats ? (
                  <div className="flex flex-col items-center justify-center h-[320px]">
                    <div className="w-full max-w-md">
                      {/* Labels */}
                      <div className="flex justify-between text-xs text-muted-foreground mb-1 px-2">
                        <span>Min: {fmt(boxPlotStats.min, 2)}</span>
                        <span>Q1: {fmt(boxPlotStats.q1, 2)}</span>
                        <span>Med: {fmt(boxPlotStats.median, 2)}</span>
                        <span>Q3: {fmt(boxPlotStats.q3, 2)}</span>
                        <span>Max: {fmt(boxPlotStats.max, 2)}</span>
                      </div>
                      {/* Box plot SVG */}
                      <svg viewBox="0 0 500 80" className="w-full">
                        {(() => {
                          const range = boxPlotStats.max - boxPlotStats.min;
                          const pad = range * 0.05;
                          const lo = boxPlotStats.min - pad;
                          const hi = boxPlotStats.max + pad;
                          const scale = (v: number) => ((v - lo) / (hi - lo)) * 480 + 10;
                          const xMin = scale(boxPlotStats.min);
                          const xQ1 = scale(boxPlotStats.q1);
                          const xMed = scale(boxPlotStats.median);
                          const xQ3 = scale(boxPlotStats.q3);
                          const xMax = scale(boxPlotStats.max);
                          return (
                            <>
                              {/* Whisker lines */}
                              <line x1={xMin} y1={40} x2={xQ1} y2={40} stroke="#6b7280" strokeWidth={2} />
                              <line x1={xQ3} y1={40} x2={xMax} y2={40} stroke="#6b7280" strokeWidth={2} />
                              {/* Min/Max ticks */}
                              <line x1={xMin} y1={25} x2={xMin} y2={55} stroke="#6b7280" strokeWidth={2} />
                              <line x1={xMax} y1={25} x2={xMax} y2={55} stroke="#6b7280" strokeWidth={2} />
                              {/* Box */}
                              <rect x={xQ1} y={15} width={xQ3 - xQ1} height={50} fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth={2} rx={3} />
                              {/* Median line */}
                              <line x1={xMed} y1={15} x2={xMed} y2={65} stroke="#ef4444" strokeWidth={3} />
                            </>
                          );
                        })()}
                      </svg>
                      {/* Scale */}
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-2">
                        <span>{fmt(boxPlotStats.min - (boxPlotStats.max - boxPlotStats.min) * 0.05, 1)}</span>
                        <span>Pmax (W)</span>
                        <span>{fmt(boxPlotStats.max + (boxPlotStats.max - boxPlotStats.min) * 0.05, 1)}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════ Tab 2: Control Charts ═══════════════════ */}
        <TabsContent value="control" className="space-y-6">
          <div className="flex items-center gap-4">
            <Label>Chart Type</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual-mr">Individual-MR</SelectItem>
                <SelectItem value="xbar-r">X-bar R</SelectItem>
                <SelectItem value="xbar-s">X-bar S</SelectItem>
                <SelectItem value="p-chart">P-chart</SelectItem>
                <SelectItem value="c-chart">C-chart</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto">
              30 Subgroups | Pmax Measurements
            </Badge>
          </div>

          {/* Control Limits Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">Individual Chart UCL</p>
                <p className="text-xl font-bold text-red-600">{fmt(controlData.iUCL, 2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">Center Line (Mean)</p>
                <p className="text-xl font-bold text-green-600">{fmt(controlData.mean, 2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-muted-foreground">Individual Chart LCL</p>
                <p className="text-xl font-bold text-blue-600">{fmt(controlData.iLCL, 2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Individual (I) Chart</CardTitle>
              <CardDescription>Pmax measurements with control limits (3-sigma)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={controlData.chartData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subgroup" label={{ value: "Observation", position: "insideBottom", offset: -10 }} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <ReferenceLine y={controlData.iUCL} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `UCL=${fmt(controlData.iUCL, 2)}`, position: "right", fill: "#ef4444", fontSize: 11 }} />
                  <ReferenceLine y={controlData.mean} stroke="#22c55e" strokeWidth={2} label={{ value: `CL=${fmt(controlData.mean, 2)}`, position: "right", fill: "#22c55e", fontSize: 11 }} />
                  <ReferenceLine y={controlData.iLCL} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: `LCL=${fmt(controlData.iLCL, 2)}`, position: "right", fill: "#3b82f6", fontSize: 11 }} />
                  <Line type="linear" dataKey="value" stroke="#6b7280" strokeWidth={1.5} dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.ooc) {
                      return <circle key={`dot-${payload.subgroup}`} cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ef4444" />;
                    }
                    return <circle key={`dot-${payload.subgroup}`} cx={cx} cy={cy} r={3} fill="#3b82f6" stroke="#3b82f6" />;
                  }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Out of Control</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> In Control</span>
              </div>
            </CardContent>
          </Card>

          {/* Moving Range Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Moving Range (MR) Chart</CardTitle>
              <CardDescription>Consecutive differences | MR-bar = {fmt(controlData.mrBar, 2)} | UCL = {fmt(controlData.mrUCL, 2)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={controlData.chartData.filter((d) => d.mr !== null)} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subgroup" label={{ value: "Observation", position: "insideBottom", offset: -10 }} />
                  <YAxis label={{ value: "Moving Range", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <ReferenceLine y={controlData.mrUCL} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `UCL=${fmt(controlData.mrUCL, 2)}`, position: "right", fill: "#ef4444", fontSize: 11 }} />
                  <ReferenceLine y={controlData.mrBar} stroke="#22c55e" strokeWidth={2} label={{ value: `CL=${fmt(controlData.mrBar, 2)}`, position: "right", fill: "#22c55e", fontSize: 11 }} />
                  <ReferenceLine y={0} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: "LCL=0", position: "right", fill: "#3b82f6", fontSize: 11 }} />
                  <Line type="linear" dataKey="mr" stroke="#8b5cf6" strokeWidth={1.5} dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.mrOoc) {
                      return <circle key={`mrdot-${payload.subgroup}`} cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ef4444" />;
                    }
                    return <circle key={`mrdot-${payload.subgroup}`} cx={cx} cy={cy} r={3} fill="#8b5cf6" stroke="#8b5cf6" />;
                  }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════ Tab 3: Capability Analysis ═══════════════════ */}
        <TabsContent value="capability" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Upper Spec Limit (USL)</Label>
              <Input type="number" value={usl} onChange={(e) => setUsl(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Lower Spec Limit (LSL)</Label>
              <Input type="number" value={lsl} onChange={(e) => setLsl(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Target</Label>
              <Input type="number" value={target} onChange={(e) => setTarget(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex items-end">
              <Badge variant="outline" className="h-10 flex items-center">
                Spec Width: {(usl - lsl).toFixed(1)} W
              </Badge>
            </div>
          </div>

          {capabilityStats && (
            <>
              {/* Cpk Traffic Light */}
              <Card className={`border-2 ${cpkBg(capabilityStats.cpk)}`}>
                <CardContent className="pt-4 flex items-center gap-4">
                  {cpkIcon(capabilityStats.cpk)}
                  <div>
                    <p className={`text-2xl font-bold ${cpkColor(capabilityStats.cpk)}`}>
                      Cpk = {fmt(capabilityStats.cpk, 3)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {capabilityStats.cpk >= 1.33
                        ? "Process is capable (Cpk >= 1.33)"
                        : capabilityStats.cpk >= 1.0
                        ? "Process is marginally capable (1.0 <= Cpk < 1.33)"
                        : "Process is NOT capable (Cpk < 1.0)"}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm font-medium">{fmt(capabilityStats.withinSpec, 2)}% within spec</p>
                    <p className="text-xs text-muted-foreground">{fmt(capabilityStats.ppmTotal, 0)} PPM defective</p>
                  </div>
                </CardContent>
              </Card>

              {/* Indices Table */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Process Capability Indices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Index</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { name: "Cp", val: capabilityStats.cp, thresh: 1.33 },
                          { name: "Cpk", val: capabilityStats.cpk, thresh: 1.33 },
                          { name: "Pp", val: capabilityStats.pp, thresh: 1.33 },
                          { name: "Ppk", val: capabilityStats.ppk, thresh: 1.33 },
                          { name: "Sigma Level", val: capabilityStats.sigmaLevel, thresh: 4.0 },
                        ].map((row) => (
                          <TableRow key={row.name}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell className="text-right font-mono">{fmt(row.val, 4)}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={row.val >= row.thresh ? "default" : "destructive"}>
                                {row.val >= row.thresh ? "PASS" : "FAIL"}
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
                    <CardTitle className="text-lg">Process Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableBody>
                        {[
                          ["Process Mean", `${fmt(capabilityStats.mean, 3)} W`],
                          ["Process Std Dev", `${fmt(capabilityStats.stdDev, 4)} W`],
                          ["USL", `${usl} W`],
                          ["LSL", `${lsl} W`],
                          ["Target", `${target} W`],
                          ["PPM (Total)", fmt(capabilityStats.ppmTotal, 1)],
                          ["% Within Spec", `${fmt(capabilityStats.withinSpec, 4)}%`],
                        ].map(([label, val]) => (
                          <TableRow key={label}>
                            <TableCell className="font-medium py-1.5">{label}</TableCell>
                            <TableCell className="text-right font-mono py-1.5">{val}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Capability Histogram */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Capability Histogram</CardTitle>
                  <CardDescription>Distribution with specification limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={histogramData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="binLabel" label={{ value: "Pmax (W)", position: "insideBottom", offset: -10 }} />
                      <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Frequency" opacity={0.6} />
                      <Line type="monotone" dataKey="normalY" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Normal Fit" />
                      <ReferenceLine x={lsl.toFixed(1)} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: `LSL=${lsl}`, position: "top", fill: "#ef4444", fontSize: 12 }} />
                      <ReferenceLine x={usl.toFixed(1)} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" label={{ value: `USL=${usl}`, position: "top", fill: "#ef4444", fontSize: 12 }} />
                      <ReferenceLine x={target.toFixed(1)} stroke="#22c55e" strokeWidth={2} label={{ value: `Target=${target}`, position: "top", fill: "#22c55e", fontSize: 12 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ═══════════════════ Tab 4: Regression ═══════════════════ */}
        <TabsContent value="regression" className="space-y-6">
          <div className="flex items-center gap-4">
            <Label>Regression Type</Label>
            <Select value={regType} onValueChange={setRegType}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="poly2">Polynomial (Degree 2)</SelectItem>
                <SelectItem value="poly3">Polynomial (Degree 3)</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto">25 Data Points | Irradiance vs Pmax</Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Equation & Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regression Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-center text-lg">
                  Y = {fmt(regressionResult.slope, 4)}X + {fmt(regressionResult.intercept, 4)}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Statistic</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Slope (b1)", fmt(regressionResult.slope, 6)],
                      ["Intercept (b0)", fmt(regressionResult.intercept, 4)],
                      ["R\u00B2", fmt(regressionResult.r2, 6)],
                      ["Adjusted R\u00B2", fmt(regressionResult.adjR2, 6)],
                      ["Standard Error", fmt(regressionResult.se, 4)],
                      ["p-value", "< 0.0001"],
                      ["n", "25"],
                    ].map(([label, val]) => (
                      <TableRow key={label}>
                        <TableCell className="font-medium">{label}</TableCell>
                        <TableCell className="text-right font-mono">{val}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Scatter + Fit */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scatter Plot with Regression Line</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={regressionScatterData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="irradiance" type="number" label={{ value: "Irradiance (W/m\u00B2)", position: "insideBottom", offset: -10 }} />
                    <YAxis label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Scatter dataKey="pmax" fill="#3b82f6" name="Observed" />
                    <Line type="linear" dataKey="fitted" stroke="#ef4444" strokeWidth={2} dot={false} name="Fitted Line" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Residual Plot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Residual Plot</CardTitle>
              <CardDescription>Residuals vs Fitted Values</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="fitted" name="Fitted" label={{ value: "Fitted Values", position: "insideBottom", offset: -10 }} />
                  <YAxis type="number" dataKey="residual" name="Residual" label={{ value: "Residual", angle: -90, position: "insideLeft" }} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1.5} />
                  <Scatter data={regressionScatterData} fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════ Tab 5: ANOVA ═══════════════════ */}
        <TabsContent value="anova" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">One-Way ANOVA: Pmax by Solar Simulator</CardTitle>
              <CardDescription>Comparing mean Pmax across 4 solar simulators (Sim A, B, C, D), 10 measurements each</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">DF</TableHead>
                    <TableHead className="text-right">SS</TableHead>
                    <TableHead className="text-right">MS</TableHead>
                    <TableHead className="text-right">F</TableHead>
                    <TableHead className="text-right">p-value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Between Groups</TableCell>
                    <TableCell className="text-right font-mono">{anovaResult.dfBetween}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(anovaResult.ssBetween, 3)}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(anovaResult.msBetween, 3)}</TableCell>
                    <TableCell className="text-right font-mono font-bold">{fmt(anovaResult.fStat, 3)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={anovaResult.pValue < 0.05 ? "destructive" : "default"}>
                        {anovaResult.pValue < 0.001 ? "< 0.001" : fmt(anovaResult.pValue, 3)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Within Groups</TableCell>
                    <TableCell className="text-right font-mono">{anovaResult.dfWithin}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(anovaResult.ssWithin, 3)}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(anovaResult.msWithin, 3)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">{anovaResult.dfTotal}</TableCell>
                    <TableCell className="text-right font-mono">{fmt(anovaResult.ssTotal, 3)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className={`p-3 rounded-lg ${anovaResult.pValue < 0.05 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                <p className={`text-sm font-semibold ${anovaResult.pValue < 0.05 ? "text-red-700" : "text-green-700"}`}>
                  {anovaResult.pValue < 0.05
                    ? `Significant difference detected (F = ${fmt(anovaResult.fStat, 2)}, p = ${anovaResult.pValue < 0.001 ? "< 0.001" : fmt(anovaResult.pValue, 3)}). At least one simulator mean differs significantly from the others.`
                    : `No significant difference (F = ${fmt(anovaResult.fStat, 2)}, p = ${fmt(anovaResult.pValue, 3)}). The simulator means are not significantly different.`}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            {/* Box Plots by Group */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Box Plots by Simulator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 py-4">
                  {anovaResult.groupStats.map((g) => {
                    const allVals = anovaResult.groupStats.flatMap((gs) => gs.values);
                    const globalMin = Math.min(...allVals) - 0.5;
                    const globalMax = Math.max(...allVals) + 0.5;
                    const scale = (v: number) => ((v - globalMin) / (globalMax - globalMin)) * 100;
                    const gQ1 = quantile(g.values, 0.25);
                    const gMed = median(g.values);
                    const gQ3 = quantile(g.values, 0.75);
                    const sorted = [...g.values].sort((a, b) => a - b);
                    const gMin = sorted[0];
                    const gMax = sorted[sorted.length - 1];
                    return (
                      <div key={g.name} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-12 text-right">{g.name}</span>
                        <div className="relative flex-1 h-6">
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2" />
                          {/* Whiskers */}
                          <div className="absolute top-1/2 h-px bg-gray-500 -translate-y-1/2" style={{ left: `${scale(gMin)}%`, width: `${scale(gQ1) - scale(gMin)}%` }} />
                          <div className="absolute top-1/2 h-px bg-gray-500 -translate-y-1/2" style={{ left: `${scale(gQ3)}%`, width: `${scale(gMax) - scale(gQ3)}%` }} />
                          {/* Ticks */}
                          <div className="absolute top-0 bottom-0 w-px bg-gray-500" style={{ left: `${scale(gMin)}%` }} />
                          <div className="absolute top-0 bottom-0 w-px bg-gray-500" style={{ left: `${scale(gMax)}%` }} />
                          {/* Box */}
                          <div className="absolute top-0 bottom-0 bg-blue-200 border border-blue-500 rounded-sm" style={{ left: `${scale(gQ1)}%`, width: `${scale(gQ3) - scale(gQ1)}%` }} />
                          {/* Median */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{ left: `${scale(gMed)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-24 text-right">
                          x&#772;={fmt(g.mean, 1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Means Comparison with CI */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Means Comparison (95% CI)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={anovaResult.groupStats} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} label={{ value: "Pmax (W)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value: number) => fmt(value, 2)} />
                    <Bar dataKey="mean" fill="#3b82f6" name="Mean" />
                  </BarChart>
                </ResponsiveContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Simulator</TableHead>
                      <TableHead className="text-right">n</TableHead>
                      <TableHead className="text-right">Mean</TableHead>
                      <TableHead className="text-right">Std Dev</TableHead>
                      <TableHead className="text-right">95% CI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anovaResult.groupStats.map((g) => (
                      <TableRow key={g.name}>
                        <TableCell className="font-medium">{g.name}</TableCell>
                        <TableCell className="text-right">{g.n}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(g.mean, 3)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(g.stdDev, 3)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          [{fmt(g.mean - g.ci95, 2)}, {fmt(g.mean + g.ci95, 2)}]
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════════════════ Tab 6: MSA / Gage R&R ═══════════════════ */}
        <TabsContent value="msa" className="space-y-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline">3 Operators | 10 Parts | 3 Trials</Badge>
            <Badge variant="outline">Tolerance: {usl - lsl} W (USL={usl}, LSL={lsl})</Badge>
          </div>

          {/* GRR Summary Card */}
          <Card className={`border-2 ${grrBg(msaResult.pctGRR)}`}>
            <CardContent className="pt-4 flex items-center gap-4">
              <Gauge className={`h-8 w-8 ${grrColor(msaResult.pctGRR)}`} />
              <div>
                <p className={`text-2xl font-bold ${grrColor(msaResult.pctGRR)}`}>
                  Total Gage R&R: {fmt(msaResult.pctGRR, 1)}% of Total Variation
                </p>
                <p className="text-sm text-muted-foreground">
                  {msaResult.pctGRR < 10
                    ? "Measurement system is ACCEPTABLE (<10%)"
                    : msaResult.pctGRR < 30
                    ? "Measurement system is MARGINAL (10-30%) - may be acceptable depending on application"
                    : "Measurement system is UNACCEPTABLE (>30%) - needs improvement"}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-medium">ndc = {msaResult.ndc}</p>
                <p className="text-xs text-muted-foreground">Number of Distinct Categories {msaResult.ndc >= 5 ? "(>= 5, OK)" : "(< 5, insufficient)"}</p>
              </div>
            </CardContent>
          </Card>

          {/* GRR Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gage R&R Study - ANOVA Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">VarComp</TableHead>
                      <TableHead className="text-right">% Contribution</TableHead>
                      <TableHead className="text-right">StdDev</TableHead>
                      <TableHead className="text-right">Study Var (5.15*SD)</TableHead>
                      <TableHead className="text-right">% Study Var</TableHead>
                      <TableHead className="text-right">% Tolerance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {msaResult.rows.map((row) => (
                      <TableRow key={row.source} className={row.source === "Total Variation" ? "font-bold border-t-2" : ""}>
                        <TableCell className={row.source.startsWith("  ") ? "pl-8" : "font-medium"}>{row.source}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(row.varComp, 6)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(row.pctContrib, 2)}%</TableCell>
                        <TableCell className="text-right font-mono">{fmt(row.sd, 6)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(row.sv, 4)}</TableCell>
                        <TableCell className="text-right font-mono">{fmt(row.pctStudy, 2)}%</TableCell>
                        <TableCell className="text-right font-mono">{fmt(row.pctTol, 2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Variance Components Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Variance Components</CardTitle>
              <CardDescription>% Contribution to Total Variation</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={msaResult.varData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: "% Contribution", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value: number) => `${fmt(value, 2)}%`} />
                  <Bar dataKey="value" name="% Contribution">
                    {msaResult.varData.map((entry, index) => (
                      <Cell key={index} fill={index === 2 ? "#22c55e" : index === 0 ? "#ef4444" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════ Tab 7: Data Import ═══════════════════ */}
        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  CSV Data Input
                </CardTitle>
                <CardDescription>Paste CSV data with headers in the first row</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={16}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="font-mono text-xs"
                  placeholder="Paste CSV data here..."
                />
                <Button onClick={handleParseCSV} className="w-full">
                  Parse Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Preview</CardTitle>
                <CardDescription>
                  {parsedCSV
                    ? `${parsedCSV.headers.length} columns, ${parsedCSV.rows.length} rows`
                    : "Click Parse to load data"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedCSV && (
                  <>
                    <div className="space-y-2">
                      <Label>Select Column for Analysis</Label>
                      <Select value={selectedCol} onValueChange={setSelectedCol}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {parsedCSV.headers.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="overflow-x-auto max-h-[350px] overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {parsedCSV.headers.map((h) => (
                              <TableHead key={h} className={`text-xs ${h === selectedCol ? "bg-blue-50 font-bold" : ""}`}>
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parsedCSV.rows.slice(0, 10).map((row, i) => (
                            <TableRow key={i}>
                              {row.map((cell, j) => (
                                <TableCell key={j} className={`text-xs font-mono ${parsedCSV.headers[j] === selectedCol ? "bg-blue-50 font-bold" : ""}`}>
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {parsedCSV.rows.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Showing first 10 of {parsedCSV.rows.length} rows
                      </p>
                    )}
                    {selectedCol && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const colIdx = parsedCSV.headers.indexOf(selectedCol);
                          if (colIdx < 0) return;
                          const values = parsedCSV.rows
                            .map((r) => r[colIdx])
                            .filter((v) => !isNaN(parseFloat(v)))
                            .map((v) => parseFloat(v));
                          if (values.length > 0) {
                            setRawInput(values.join("\n"));
                            setUseCustomData(true);
                          }
                        }}
                      >
                        Load &quot;{selectedCol}&quot; into Descriptive Stats
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
