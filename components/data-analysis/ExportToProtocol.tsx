"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Link2,
  Send,
  BarChart3,
  TrendingUp,
  Zap,
  Activity,
  Target,
  FileDown,
  FileSpreadsheet,
  Printer,
} from "lucide-react"
import { toast } from "sonner"
import type {
  DataLinkageRecord,
  AnalysisExportPayload,
  ChartExportData,
} from "@/lib/data-linkage"
import {
  mockDataLinkages,
  mockExportCharts,
} from "@/lib/data-linkage"

// ============================================================================
// Chart type icons
// ============================================================================

const chartTypeIcons: Record<string, React.ReactNode> = {
  iv_curve: <Zap className="h-4 w-4 text-blue-600" />,
  spc_chart: <Activity className="h-4 w-4 text-green-600" />,
  trend_plot: <TrendingUp className="h-4 w-4 text-orange-600" />,
  comparison: <Target className="h-4 w-4 text-purple-600" />,
  histogram: <BarChart3 className="h-4 w-4 text-cyan-600" />,
  pass_fail: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
}

const chartTypeLabels: Record<string, string> = {
  iv_curve: "I-V Curve",
  spc_chart: "SPC Control Chart",
  trend_plot: "Trend Plot",
  comparison: "Comparison Chart",
  histogram: "Distribution Histogram",
  pass_fail: "Pass/Fail Summary",
}

// ============================================================================
// Data Linkage Chain Visualization
// ============================================================================

interface DataLinkageChainProps {
  linkage: DataLinkageRecord
}

function DataLinkageChain({ linkage }: DataLinkageChainProps) {
  const steps = [
    { label: "Project", value: linkage.projectId, color: "bg-blue-100 text-blue-700 border-blue-300" },
    { label: "Sample", value: linkage.sampleId, color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
    { label: "Test Data", value: linkage.testDataId, color: "bg-gray-100 text-gray-700 border-gray-300" },
    { label: "Analysis", value: linkage.analysisId || "—", color: "bg-purple-100 text-purple-700 border-purple-300" },
    { label: "Protocol", value: linkage.protocolReportId || "—", color: "bg-orange-100 text-orange-700 border-orange-300" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((step, idx) => (
        <React.Fragment key={step.label}>
          <div className={`px-2 py-1 rounded border text-xs font-mono ${step.color}`}>
            <span className="text-[10px] font-sans font-medium block leading-tight">{step.label}</span>
            {step.value}
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ============================================================================
// Export to Protocol Dialog
// ============================================================================

interface ExportToProtocolDialogProps {
  linkage: DataLinkageRecord
  onExport: (payload: AnalysisExportPayload) => void
}

function ExportToProtocolDialog({ linkage, onExport }: ExportToProtocolDialogProps) {
  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(
    new Set(mockExportCharts.map((c) => c.id))
  )
  const [targetProtocol, setTargetProtocol] = useState("")
  const [exportFormat, setExportFormat] = useState<"pdf" | "xlsx">("pdf")

  const toggleChart = (chartId: string) => {
    setSelectedCharts((prev) => {
      const next = new Set(prev)
      if (next.has(chartId)) next.delete(chartId)
      else next.add(chartId)
      return next
    })
  }

  const handleExport = () => {
    const payload: AnalysisExportPayload = {
      analysisId: linkage.analysisId,
      projectId: linkage.projectId,
      sampleId: linkage.sampleId,
      standard: linkage.standard,
      testName: linkage.testName,
      statistics: {
        parameter: "Pmax",
        mean: 457.0,
        stdDev: 2.7,
        min: 448.2,
        max: 465.8,
        median: 457.1,
        count: 120,
        cp: 1.85,
        cpk: 1.62,
        lsl: 427.5,
        usl: 472.5,
        passRate: 96.7,
      },
      charts: mockExportCharts.filter((c) => selectedCharts.has(c.id)),
      passFailResult: "pass",
      exportedAt: new Date().toISOString(),
      exportedBy: "Dr. Ravi Kumar",
    }
    onExport(payload)
  }

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Export Analysis to Test Protocol
        </DialogTitle>
        <DialogDescription>
          Send analyzed data, graphs, and pass/fail results to the test protocol report for{" "}
          <span className="font-semibold">{linkage.sampleName}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 pt-2">
        {/* Source Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Analysis ID</p>
            <p className="font-mono font-bold">{linkage.analysisId}</p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Standard</p>
            <p className="font-semibold">{linkage.standard}</p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Test</p>
            <p className="font-semibold">{linkage.testName}</p>
          </div>
          <div className="rounded border p-2">
            <p className="text-xs text-muted-foreground">Result</p>
            <Badge variant="default" className="bg-green-600">PASS (96.7%)</Badge>
          </div>
        </div>

        {/* Target Protocol */}
        <div>
          <Label>Target Protocol Report</Label>
          <Select value={targetProtocol} onValueChange={setTargetProtocol}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select protocol to populate..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TP-61215-TC-2026-001">TP-61215-TC-2026-001 (Thermal Cycling)</SelectItem>
              <SelectItem value="TP-61215-IV-2026-002">TP-61215-IV-2026-002 (I-V at STC)</SelectItem>
              <SelectItem value="TP-61730-INS-2026-001">TP-61730-INS-2026-001 (Insulation)</SelectItem>
              <SelectItem value="TP-61853-ER-2026-001">TP-61853-ER-2026-001 (Energy Rating)</SelectItem>
              <SelectItem value="new">+ Create New Protocol Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Charts Selection */}
        <div>
          <Label className="mb-2 block">Charts to Auto-Populate into Protocol</Label>
          <div className="space-y-2">
            {mockExportCharts.map((chart) => (
              <label
                key={chart.id}
                className="flex items-start gap-3 rounded border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCharts.has(chart.id)}
                  onChange={() => toggleChart(chart.id)}
                  className="mt-0.5 rounded border-gray-300"
                />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {chartTypeIcons[chart.chartType]}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{chart.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{chart.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                    {chartTypeLabels[chart.chartType]}
                  </Badge>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedCharts.size} of {mockExportCharts.length} charts selected
          </p>
        </div>

        {/* Export Format */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Export Format</Label>
            <Select
              value={exportFormat}
              onValueChange={(v) => setExportFormat(v as "pdf" | "xlsx")}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF with Embedded Charts</SelectItem>
                <SelectItem value="xlsx">Excel with Chart Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prepared By</Label>
            <Input className="mt-1" defaultValue="Dr. Ravi Kumar" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleExport} disabled={!targetProtocol && selectedCharts.size === 0}>
            <Send className="mr-2 h-4 w-4" />
            Export to Protocol
          </Button>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Download {exportFormat.toUpperCase()}
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

// ============================================================================
// Main ExportToProtocol Component
// ============================================================================

export function ExportToProtocol() {
  const [linkages, setLinkages] = useState<DataLinkageRecord[]>(mockDataLinkages)
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredLinkages = filterStatus === "all"
    ? linkages
    : linkages.filter((l) => l.status === filterStatus)

  const handleExport = (payload: AnalysisExportPayload) => {
    setLinkages((prev) =>
      prev.map((l) =>
        l.analysisId === payload.analysisId
          ? { ...l, status: "exported" as const, updatedAt: new Date().toISOString() }
          : l
      )
    )
    toast.success(
      `Analysis ${payload.analysisId} exported to protocol. ${payload.charts.length} charts included.`
    )
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    analyzed: "bg-blue-100 text-blue-700",
    exported: "bg-green-100 text-green-700",
    linked: "bg-emerald-100 text-emerald-700",
  }

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Link2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{linkages.length}</p>
                <p className="text-xs text-muted-foreground">Total Linkages</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {linkages.filter((l) => l.status === "analyzed").length}
                </p>
                <p className="text-xs text-muted-foreground">Ready to Export</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Send className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {linkages.filter((l) => l.status === "exported" || l.status === "linked").length}
                </p>
                <p className="text-xs text-muted-foreground">Exported/Linked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockExportCharts.length}</p>
                <p className="text-xs text-muted-foreground">Available Charts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Linkage Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Data Linkage: Project → Sample → Test Data → Analysis → Protocol
              </CardTitle>
              <CardDescription>
                Export analyzed data with graphs directly to test protocol reports
              </CardDescription>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="exported">Exported</SelectItem>
                <SelectItem value="linked">Linked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLinkages.map((linkage) => (
              <Card key={linkage.id} className="border">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {linkage.projectName}
                        <span className="text-muted-foreground font-normal ml-2">
                          ({linkage.sampleName})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {linkage.testName} — {linkage.standard}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={statusColors[linkage.status] || ""}
                      >
                        {linkage.status}
                      </Badge>
                      {(linkage.status === "analyzed" || linkage.status === "linked") && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Send className="h-3 w-3 mr-1" />
                              Export to Protocol
                            </Button>
                          </DialogTrigger>
                          <ExportToProtocolDialog
                            linkage={linkage}
                            onExport={handleExport}
                          />
                        </Dialog>
                      )}
                    </div>
                  </div>

                  <DataLinkageChain linkage={linkage} />

                  {/* Available charts for this linkage */}
                  {linkage.analysisId && (
                    <div className="flex flex-wrap gap-1.5">
                      {mockExportCharts.slice(0, 4).map((chart) => (
                        <Badge
                          key={chart.id}
                          variant="secondary"
                          className="text-xs gap-1"
                        >
                          {chartTypeIcons[chart.chartType]}
                          {chartTypeLabels[chart.chartType]}
                        </Badge>
                      ))}
                      {mockExportCharts.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{mockExportCharts.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PDF/Excel Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Bulk Export with Embedded Charts
          </CardTitle>
          <CardDescription>
            Generate PDF or Excel reports with all analysis charts embedded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chart</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Data Points</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExportCharts.map((chart) => (
                <TableRow key={chart.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {chartTypeIcons[chart.chartType]}
                    {chart.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{chartTypeLabels[chart.chartType]}</Badge>
                  </TableCell>
                  <TableCell>{chart.dataPoints}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                    {chart.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success(`Exported ${chart.title} as PDF`)}
                      >
                        <FileDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.success(`Exported ${chart.title} as Excel`)}
                      >
                        <FileSpreadsheet className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => toast.success("PDF report with all charts generated")}>
              <FileDown className="mr-2 h-4 w-4" />
              Export All as PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Excel workbook with chart data generated")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export All as Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
