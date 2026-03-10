"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  Cell,
  ReferenceLine,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  Filter,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Sigma,
} from "lucide-react"
import {
  generateMockData,
  calculateStatistics,
  generateHistogram,
  IEC_TOLERANCES,
  PARAMETER_LABELS,
  type DataPoint,
  type StatisticalSummary,
} from "@/lib/data-analysis"

const CHART_COLORS = {
  primary: "hsl(24, 95%, 53%)",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#eab308",
  purple: "#a855f7",
}

const TIME_RANGES = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
  { label: "All", months: 0 },
]

type ParameterKey = "pmax" | "voc" | "isc" | "ff" | "efficiency"

export default function DataAnalysisPage() {
  const [activeParameter, setActiveParameter] = useState<ParameterKey>("pmax")
  const [timeRange, setTimeRange] = useState("All")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [selectedManufacturer, setSelectedManufacturer] = useState("all")

  const allData = useMemo(() => generateMockData(), [])

  const batches = useMemo(() => {
    const set = new Set(allData.map((d) => d.batchId))
    return Array.from(set).sort()
  }, [allData])

  const manufacturers = useMemo(() => {
    const set = new Set(allData.map((d) => d.manufacturer))
    return Array.from(set).sort()
  }, [allData])

  const filteredData = useMemo(() => {
    let data = allData
    if (selectedBatch !== "all") {
      data = data.filter((d) => d.batchId === selectedBatch)
    }
    if (selectedManufacturer !== "all") {
      data = data.filter((d) => d.manufacturer === selectedManufacturer)
    }
    if (timeRange !== "All") {
      const rangeConfig = TIME_RANGES.find((r) => r.label === timeRange)
      if (rangeConfig && rangeConfig.months > 0) {
        const cutoff = new Date()
        cutoff.setMonth(cutoff.getMonth() - rangeConfig.months)
        const cutoffStr = cutoff.toISOString().split("T")[0]
        data = data.filter((d) => d.testDate >= cutoffStr)
      }
    }
    return data
  }, [allData, selectedBatch, selectedManufacturer, timeRange])

  const parameterValues = useMemo(
    () => filteredData.map((d) => d[activeParameter] as number),
    [filteredData, activeParameter]
  )

  const tolerance = IEC_TOLERANCES[activeParameter]

  const stats = useMemo(
    () => calculateStatistics(parameterValues, tolerance.lsl, tolerance.usl),
    [parameterValues, tolerance]
  )

  const histogramData = useMemo(
    () => generateHistogram(parameterValues, 12),
    [parameterValues]
  )

  const passCount = useMemo(
    () => filteredData.filter((d) => d.result === "pass").length,
    [filteredData]
  )
  const failCount = filteredData.length - passCount
  const passRate =
    filteredData.length > 0
      ? parseFloat(((passCount / filteredData.length) * 100).toFixed(1))
      : 0

  // Trend data sorted by date
  const trendData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => a.testDate.localeCompare(b.testDate))
      .map((d) => ({
        date: d.testDate,
        value: d[activeParameter] as number,
        sampleId: d.sampleId,
        result: d.result,
      }))
  }, [filteredData, activeParameter])

  const ucl = stats.mean + 3 * stats.stdDev
  const lcl = stats.mean - 3 * stats.stdDev

  // Batch comparison data
  const batchComparisonData = useMemo(() => {
    const groups: Record<string, number[]> = {}
    allData.forEach((d) => {
      if (!groups[d.batchId]) groups[d.batchId] = []
      groups[d.batchId].push(d[activeParameter] as number)
    })
    return Object.entries(groups).map(([batch, values]) => {
      const s = calculateStatistics(values, tolerance.lsl, tolerance.usl)
      return {
        batch,
        mean: s.mean,
        min: s.min,
        max: s.max,
        stdDev: s.stdDev,
        cpk: s.cpk,
        count: s.count,
      }
    })
  }, [allData, activeParameter, tolerance])

  // Manufacturer comparison scatter data
  const manufacturerScatterData = useMemo(() => {
    return allData.map((d) => ({
      manufacturer: d.manufacturer,
      pmax: d.pmax,
      efficiency: d.efficiency,
      voc: d.voc,
      isc: d.isc,
      ff: d.ff,
      result: d.result,
    }))
  }, [allData])

  // Manufacturer box plot data (simulated)
  const manufacturerBoxData = useMemo(() => {
    const groups: Record<string, number[]> = {}
    allData.forEach((d) => {
      if (!groups[d.manufacturer]) groups[d.manufacturer] = []
      groups[d.manufacturer].push(d[activeParameter] as number)
    })
    return Object.entries(groups).map(([mfr, values]) => {
      const sorted = [...values].sort((a, b) => a - b)
      const n = sorted.length
      const q1 = sorted[Math.floor(n * 0.25)]
      const median = sorted[Math.floor(n * 0.5)]
      const q3 = sorted[Math.floor(n * 0.75)]
      return {
        manufacturer: mfr,
        min: sorted[0],
        q1,
        median,
        q3,
        max: sorted[n - 1],
        iqr: parseFloat((q3 - q1).toFixed(3)),
      }
    })
  }, [allData, activeParameter])

  // Pass/fail by batch
  const passFailByBatch = useMemo(() => {
    const groups: Record<string, { pass: number; fail: number; total: number }> = {}
    allData.forEach((d) => {
      if (!groups[d.batchId]) groups[d.batchId] = { pass: 0, fail: 0, total: 0 }
      groups[d.batchId].total++
      if (d.result === "pass") groups[d.batchId].pass++
      else groups[d.batchId].fail++
    })
    return Object.entries(groups).map(([batch, counts]) => ({
      batch,
      pass: counts.pass,
      fail: counts.fail,
      total: counts.total,
      passRate: parseFloat(((counts.pass / counts.total) * 100).toFixed(1)),
    }))
  }, [allData])

  // Pass/fail by manufacturer
  const passFailByManufacturer = useMemo(() => {
    const groups: Record<string, { pass: number; fail: number; total: number }> = {}
    allData.forEach((d) => {
      if (!groups[d.manufacturer])
        groups[d.manufacturer] = { pass: 0, fail: 0, total: 0 }
      groups[d.manufacturer].total++
      if (d.result === "pass") groups[d.manufacturer].pass++
      else groups[d.manufacturer].fail++
    })
    return Object.entries(groups).map(([mfr, counts]) => ({
      manufacturer: mfr,
      pass: counts.pass,
      fail: counts.fail,
      total: counts.total,
      passRate: parseFloat(((counts.pass / counts.total) * 100).toFixed(1)),
    }))
  }, [allData])

  // Pass/fail by standard
  const passFailByStandard = useMemo(() => {
    const groups: Record<string, { pass: number; fail: number; total: number }> = {}
    allData.forEach((d) => {
      if (!groups[d.testStandard])
        groups[d.testStandard] = { pass: 0, fail: 0, total: 0 }
      groups[d.testStandard].total++
      if (d.result === "pass") groups[d.testStandard].pass++
      else groups[d.testStandard].fail++
    })
    return Object.entries(groups).map(([std, counts]) => ({
      standard: std,
      pass: counts.pass,
      fail: counts.fail,
      total: counts.total,
      passRate: parseFloat(((counts.pass / counts.total) * 100).toFixed(1)),
    }))
  }, [allData])

  // Tolerance visualization data
  const toleranceVisData = useMemo(() => {
    return Object.entries(IEC_TOLERANCES).map(([key, tol]) => {
      const values = filteredData.map((d) => d[key as ParameterKey] as number)
      const s = calculateStatistics(values, tol.lsl, tol.usl)
      return {
        parameter: PARAMETER_LABELS[key],
        key,
        mean: s.mean,
        lsl: tol.lsl,
        usl: tol.usl,
        min: s.min,
        max: s.max,
        unit: tol.unit,
        withinSpec: s.mean >= tol.lsl && s.mean <= tol.usl,
      }
    })
  }, [filteredData])

  // Normal distribution curve data
  const normalCurveData = useMemo(() => {
    const points = 50
    const range = stats.max - stats.min
    const padding = range * 0.15
    const start = stats.min - padding
    const end = stats.max + padding
    const step = (end - start) / points
    return Array.from({ length: points + 1 }, (_, i) => {
      const x = start + i * step
      const z = (x - stats.mean) / (stats.stdDev || 1)
      const y =
        (1 / ((stats.stdDev || 1) * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * z * z)
      return {
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(6)),
      }
    })
  }, [stats])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Analysis</h1>
          <p className="text-muted-foreground">
            Statistical analysis, trend monitoring, and process capability for PV
            test data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="parameter">Parameter</Label>
              <Select
                value={activeParameter}
                onValueChange={(v) => setActiveParameter(v as ParameterKey)}
              >
                <SelectTrigger id="parameter" className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PARAMETER_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch">Batch</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger id="batch" className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select
                value={selectedManufacturer}
                onValueChange={setSelectedManufacturer}
              >
                <SelectTrigger id="manufacturer" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Manufacturers</SelectItem>
                  {manufacturers.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedBatch("all")
                setSelectedManufacturer("all")
                setTimeRange("All")
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trend">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trend Analysis
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <Target className="mr-2 h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="passfail">
            <Activity className="mr-2 h-4 w-4" />
            Pass/Fail Analysis
          </TabsTrigger>
        </TabsList>

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Samples</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredData.length}</div>
                <p className="text-xs text-muted-foreground">
                  {batches.length} batches
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pass Rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{passRate}%</span>
                  <Badge
                    variant={passRate >= 95 ? "default" : "destructive"}
                    className={
                      passRate >= 95
                        ? "bg-green-500/15 text-green-500 hover:bg-green-500/25"
                        : ""
                    }
                  >
                    {passRate >= 95 ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {passCount}P / {failCount}F
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>
                  Mean {PARAMETER_LABELS[activeParameter]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.mean} {tolerance.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  Range: {stats.min} - {stats.max}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Process Capability (Cpk)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{stats.cpk}</span>
                  <Badge
                    variant={stats.cpk >= 1.33 ? "default" : "destructive"}
                    className={
                      stats.cpk >= 1.33
                        ? "bg-green-500/15 text-green-500 hover:bg-green-500/25"
                        : stats.cpk >= 1.0
                        ? "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25"
                        : ""
                    }
                  >
                    {stats.cpk >= 1.33
                      ? "Capable"
                      : stats.cpk >= 1.0
                      ? "Marginal"
                      : "Incapable"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Std Deviation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.stdDev} {tolerance.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cp: {stats.cp}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistical Summary + Histogram */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sigma className="h-5 w-5" />
                  Statistical Summary
                </CardTitle>
                <CardDescription>
                  {PARAMETER_LABELS[activeParameter]} - {filteredData.length}{" "}
                  samples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Mean</span>
                    <span className="font-mono font-medium">
                      {stats.mean} {tolerance.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Std Deviation</span>
                    <span className="font-mono font-medium">
                      {stats.stdDev} {tolerance.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Median</span>
                    <span className="font-mono font-medium">
                      {stats.median} {tolerance.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Minimum</span>
                    <span className="font-mono font-medium">
                      {stats.min} {tolerance.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Maximum</span>
                    <span className="font-mono font-medium">
                      {stats.max} {tolerance.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Count</span>
                    <span className="font-mono font-medium">{stats.count}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">
                      LSL / USL
                    </span>
                    <span className="font-mono font-medium">
                      {tolerance.lsl} / {tolerance.usl} {tolerance.unit}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Cp</span>
                    <span className="font-mono font-medium">{stats.cp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cpk</span>
                    <span className="font-mono font-medium">{stats.cpk}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histogram */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribution Histogram
                </CardTitle>
                <CardDescription>
                  {PARAMETER_LABELS[activeParameter]} frequency distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={histogramData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <ReferenceLine
                      x={histogramData.findIndex(
                        (b) =>
                          tolerance.lsl >= parseFloat(b.range.split("-")[0]) &&
                          tolerance.lsl < parseFloat(b.range.split("-")[1])
                      )}
                      stroke={CHART_COLORS.red}
                      strokeDasharray="5 5"
                      label={{ value: "LSL", position: "top", fill: CHART_COLORS.red }}
                    />
                    <ReferenceLine
                      x={histogramData.findIndex(
                        (b) =>
                          tolerance.usl >= parseFloat(b.range.split("-")[0]) &&
                          tolerance.usl < parseFloat(b.range.split("-")[1])
                      )}
                      stroke={CHART_COLORS.red}
                      strokeDasharray="5 5"
                      label={{ value: "USL", position: "top", fill: CHART_COLORS.red }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {histogramData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.midpoint >= tolerance.lsl &&
                            entry.midpoint <= tolerance.usl
                              ? CHART_COLORS.primary
                              : CHART_COLORS.red
                          }
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Normal Distribution Overlay */}
          <Card>
            <CardHeader>
              <CardTitle>Normal Distribution Curve</CardTitle>
              <CardDescription>
                Bell curve overlay for {PARAMETER_LABELS[activeParameter]} with
                specification limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={normalCurveData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <ReferenceLine
                    x={tolerance.lsl}
                    stroke={CHART_COLORS.red}
                    strokeDasharray="5 5"
                    label={{ value: "LSL", position: "top", fill: CHART_COLORS.red }}
                  />
                  <ReferenceLine
                    x={tolerance.usl}
                    stroke={CHART_COLORS.red}
                    strokeDasharray="5 5"
                    label={{ value: "USL", position: "top", fill: CHART_COLORS.red }}
                  />
                  <ReferenceLine
                    x={stats.mean}
                    stroke={CHART_COLORS.blue}
                    strokeDasharray="3 3"
                    label={{ value: "Mean", position: "top", fill: CHART_COLORS.blue }}
                  />
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 2: TREND ANALYSIS ===================== */}
        <TabsContent value="trend" className="space-y-6">
          {/* Time Range Buttons */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {PARAMETER_LABELS[activeParameter]} - Time Series
                  </CardTitle>
                  <CardDescription>
                    Control chart with UCL/LCL (Mean +/- 3 sigma)
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {TIME_RANGES.map((r) => (
                    <Button
                      key={r.label}
                      variant={timeRange === r.label ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(r.label)}
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value: number) => [
                      `${value} ${tolerance.unit}`,
                      PARAMETER_LABELS[activeParameter],
                    ]}
                  />
                  <ReferenceLine
                    y={stats.mean}
                    stroke={CHART_COLORS.blue}
                    strokeDasharray="3 3"
                    label={{
                      value: `Mean: ${stats.mean}`,
                      position: "insideTopRight",
                      fill: CHART_COLORS.blue,
                      fontSize: 11,
                    }}
                  />
                  <ReferenceLine
                    y={ucl}
                    stroke={CHART_COLORS.red}
                    strokeDasharray="5 5"
                    label={{
                      value: `UCL: ${ucl.toFixed(2)}`,
                      position: "insideTopRight",
                      fill: CHART_COLORS.red,
                      fontSize: 11,
                    }}
                  />
                  <ReferenceLine
                    y={lcl}
                    stroke={CHART_COLORS.red}
                    strokeDasharray="5 5"
                    label={{
                      value: `LCL: ${lcl.toFixed(2)}`,
                      position: "insideBottomRight",
                      fill: CHART_COLORS.red,
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={1.5}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props
                      const color =
                        payload.result === "pass"
                          ? CHART_COLORS.green
                          : CHART_COLORS.red
                      return (
                        <circle
                          key={`dot-${payload.sampleId}`}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={color}
                          stroke={color}
                          strokeWidth={1}
                        />
                      )
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Trend Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Control Limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">UCL (Mean + 3s)</span>
                  <span className="font-mono text-sm font-medium">
                    {ucl.toFixed(3)} {tolerance.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Center Line</span>
                  <span className="font-mono text-sm font-medium">
                    {stats.mean} {tolerance.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">LCL (Mean - 3s)</span>
                  <span className="font-mono text-sm font-medium">
                    {lcl.toFixed(3)} {tolerance.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Out of Control Points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trendData.filter((d) => d.value > ucl || d.value < lcl).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {trendData.length} data points exceed control limits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Spec Limit Violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    trendData.filter(
                      (d) => d.value < tolerance.lsl || d.value > tolerance.usl
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  samples outside IEC tolerance ({tolerance.lsl} - {tolerance.usl}{" "}
                  {tolerance.unit})
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================== TAB 3: COMPARISON ===================== */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Batch Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Batch-to-Batch Comparison</CardTitle>
              <CardDescription>
                Mean {PARAMETER_LABELS[activeParameter]} by batch with error bars
                (min/max)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batchComparisonData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="batch" tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} ${tolerance.unit}`,
                      name === "mean"
                        ? "Mean"
                        : name === "min"
                        ? "Min"
                        : name === "max"
                        ? "Max"
                        : name,
                    ]}
                  />
                  <Legend />
                  <ReferenceLine
                    y={tolerance.lsl}
                    stroke={CHART_COLORS.red}
                    strokeDasharray="5 5"
                    label={{ value: "LSL", position: "left", fill: CHART_COLORS.red }}
                  />
                  <ReferenceLine
                    y={tolerance.usl}
                    stroke={CHART_COLORS.red}
                    strokeDasharray="5 5"
                    label={{ value: "USL", position: "left", fill: CHART_COLORS.red }}
                  />
                  <Bar
                    dataKey="mean"
                    fill={CHART_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                    name="Mean"
                  />
                  <Bar
                    dataKey="min"
                    fill={CHART_COLORS.blue}
                    radius={[4, 4, 0, 0]}
                    name="Min"
                    opacity={0.5}
                  />
                  <Bar
                    dataKey="max"
                    fill={CHART_COLORS.green}
                    radius={[4, 4, 0, 0]}
                    name="Max"
                    opacity={0.5}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Manufacturer Scatter */}
          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Comparison - Scatter Plot</CardTitle>
              <CardDescription>
                Pmax vs Efficiency by manufacturer (pass/fail color-coded)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="pmax"
                    type="number"
                    name="Pmax (W)"
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "Pmax (W)",
                      position: "insideBottom",
                      offset: -5,
                    }}
                  />
                  <YAxis
                    dataKey="efficiency"
                    type="number"
                    name="Efficiency (%)"
                    tick={{ fontSize: 11 }}
                    label={{
                      value: "Efficiency (%)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      value,
                      name,
                    ]}
                  />
                  <Legend />
                  <Scatter
                    name="Pass"
                    data={manufacturerScatterData.filter(
                      (d) => d.result === "pass"
                    )}
                    fill={CHART_COLORS.green}
                    opacity={0.6}
                  />
                  <Scatter
                    name="Fail"
                    data={manufacturerScatterData.filter(
                      (d) => d.result === "fail"
                    )}
                    fill={CHART_COLORS.red}
                    opacity={0.8}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Box Plot Simulation */}
          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Distribution (Box Plot)</CardTitle>
              <CardDescription>
                {PARAMETER_LABELS[activeParameter]} - Min / Q1 / Median / Q3 /
                Max by manufacturer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={manufacturerBoxData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="manufacturer" tick={{ fontSize: 11 }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} ${tolerance.unit}`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="min"
                    fill={CHART_COLORS.blue}
                    opacity={0.4}
                    name="Min"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="q1"
                    fill={CHART_COLORS.blue}
                    opacity={0.6}
                    name="Q1"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="median"
                    fill={CHART_COLORS.primary}
                    name="Median"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="q3"
                    fill={CHART_COLORS.green}
                    opacity={0.6}
                    name="Q3"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="max"
                    fill={CHART_COLORS.green}
                    opacity={0.4}
                    name="Max"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Batch Cpk Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Process Capability Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium text-muted-foreground">
                        Batch
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Count
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Mean
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Std Dev
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Min
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Max
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Cpk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchComparisonData.map((row) => (
                      <tr key={row.batch} className="border-b last:border-0">
                        <td className="py-2 font-medium">{row.batch}</td>
                        <td className="py-2 text-right font-mono">{row.count}</td>
                        <td className="py-2 text-right font-mono">{row.mean}</td>
                        <td className="py-2 text-right font-mono">{row.stdDev}</td>
                        <td className="py-2 text-right font-mono">{row.min}</td>
                        <td className="py-2 text-right font-mono">{row.max}</td>
                        <td className="py-2 text-right">
                          <Badge
                            variant={row.cpk >= 1.33 ? "default" : "destructive"}
                            className={
                              row.cpk >= 1.33
                                ? "bg-green-500/15 text-green-500 hover:bg-green-500/25"
                                : row.cpk >= 1.0
                                ? "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25"
                                : ""
                            }
                          >
                            {row.cpk}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 4: PASS/FAIL ANALYSIS ===================== */}
        <TabsContent value="passfail" className="space-y-6">
          {/* Pass/Fail Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* By Batch */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Batch</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={passFailByBatch} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="batch"
                      type="category"
                      tick={{ fontSize: 10 }}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="pass"
                      stackId="a"
                      fill={CHART_COLORS.green}
                      name="Pass"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="fail"
                      stackId="a"
                      fill={CHART_COLORS.red}
                      name="Fail"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By Manufacturer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Manufacturer</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={passFailByManufacturer} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="manufacturer"
                      type="category"
                      tick={{ fontSize: 10 }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="pass"
                      stackId="a"
                      fill={CHART_COLORS.green}
                      name="Pass"
                    />
                    <Bar
                      dataKey="fail"
                      stackId="a"
                      fill={CHART_COLORS.red}
                      name="Fail"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By Standard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Test Standard</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={passFailByStandard} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="standard"
                      type="category"
                      tick={{ fontSize: 10 }}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="pass"
                      stackId="a"
                      fill={CHART_COLORS.green}
                      name="Pass"
                    />
                    <Bar
                      dataKey="fail"
                      stackId="a"
                      fill={CHART_COLORS.red}
                      name="Fail"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* IEC Tolerance Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>IEC Tolerance Compliance</CardTitle>
              <CardDescription>
                Mean values vs specification limits for all parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {toleranceVisData.map((item) => {
                  const range = item.usl - item.lsl
                  const meanPct = ((item.mean - item.lsl) / range) * 100
                  const clampedPct = Math.max(0, Math.min(100, meanPct))
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.parameter}</span>
                        <span className="font-mono text-muted-foreground">
                          {item.mean} {item.unit} (LSL: {item.lsl} / USL:{" "}
                          {item.usl})
                        </span>
                      </div>
                      <div className="relative h-6 w-full rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${clampedPct}%`,
                            backgroundColor: item.withinSpec
                              ? CHART_COLORS.green
                              : CHART_COLORS.red,
                            opacity: 0.7,
                          }}
                        />
                        <div
                          className="absolute top-0 h-full w-0.5 bg-foreground"
                          style={{ left: `${clampedPct}%` }}
                          title={`Mean: ${item.mean}`}
                        />
                        <div className="absolute inset-y-0 flex w-full items-center justify-between px-2 text-xs font-mono">
                          <span>{item.lsl}</span>
                          <span>{item.usl}</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Badge
                          variant={item.withinSpec ? "default" : "destructive"}
                          className={
                            item.withinSpec
                              ? "bg-green-500/15 text-green-500 hover:bg-green-500/25"
                              : ""
                          }
                        >
                          {item.withinSpec ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {item.withinSpec ? "Within Spec" : "Out of Spec"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
              <CardDescription>
                Showing {Math.min(filteredData.length, 50)} of{" "}
                {filteredData.length} samples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium text-muted-foreground">
                        Sample ID
                      </th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">
                        Batch
                      </th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">
                        Manufacturer
                      </th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Pmax (W)
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Voc (V)
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Isc (A)
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        FF
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Eff (%)
                      </th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">
                        Standard
                      </th>
                      <th className="pb-2 text-center font-medium text-muted-foreground">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 50).map((row) => (
                      <tr
                        key={row.sampleId}
                        className="border-b last:border-0 hover:bg-muted/50"
                      >
                        <td className="py-2 font-mono font-medium">
                          {row.sampleId}
                        </td>
                        <td className="py-2">{row.batchId}</td>
                        <td className="py-2">{row.manufacturer}</td>
                        <td className="py-2">{row.testDate}</td>
                        <td className="py-2 text-right font-mono">{row.pmax}</td>
                        <td className="py-2 text-right font-mono">{row.voc}</td>
                        <td className="py-2 text-right font-mono">{row.isc}</td>
                        <td className="py-2 text-right font-mono">{row.ff}</td>
                        <td className="py-2 text-right font-mono">
                          {row.efficiency}
                        </td>
                        <td className="py-2">{row.testStandard}</td>
                        <td className="py-2 text-center">
                          <Badge
                            variant={
                              row.result === "pass" ? "default" : "destructive"
                            }
                            className={
                              row.result === "pass"
                                ? "bg-green-500/15 text-green-500 hover:bg-green-500/25"
                                : ""
                            }
                          >
                            {row.result === "pass" ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {row.result.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
