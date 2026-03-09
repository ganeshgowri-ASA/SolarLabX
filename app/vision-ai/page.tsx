"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Upload,
  Camera,
  Thermometer,
  GitCompare,
  Layers,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Eye,
  ImageIcon,
  TrendingUp,
  Activity,
  Search,
  FileText,
  Download,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const elDefects = [
  { id: 1, type: "Cell Crack", count: 7, severity: "Critical" as const, location: "Cells A3, B5, C2, D7, E1, F4, G6", confidence: 96.2 },
  { id: 2, type: "Inactive Area", count: 3, severity: "Major" as const, location: "Cells B2, D4, F6", confidence: 93.8 },
  { id: 3, type: "Shunt Path", count: 2, severity: "Major" as const, location: "Cells C5, E3", confidence: 89.4 },
  { id: 4, type: "Broken Interconnect", count: 1, severity: "Critical" as const, location: "String 2 → String 3 junction", confidence: 97.1 },
  { id: 5, type: "Micro-crack", count: 12, severity: "Minor" as const, location: "Distributed across strings 1-3", confidence: 85.6 },
  { id: 6, type: "PID Degradation", count: 4, severity: "Major" as const, location: "Edge cells Row 1, Row 6", confidence: 91.3 },
];

const elPreTestSummary = {
  totalCells: 72,
  defectiveCells: 4,
  passRate: 94.4,
  avgConfidence: 92.1,
  defects: [
    { type: "Micro-crack", count: 3, severity: "Minor" as const },
    { type: "Minor shunt", count: 1, severity: "Minor" as const },
  ],
};

const elPostTestSummary = {
  totalCells: 72,
  defectiveCells: 18,
  passRate: 75.0,
  avgConfidence: 93.4,
  defects: [
    { type: "Cell Crack", count: 7, severity: "Critical" as const },
    { type: "Inactive Area", count: 3, severity: "Major" as const },
    { type: "Micro-crack", count: 12, severity: "Minor" as const },
    { type: "Broken Interconnect", count: 1, severity: "Critical" as const },
    { type: "PID Degradation", count: 4, severity: "Major" as const },
  ],
};

const visualInspectionDefects = [
  { id: 1, component: "Front Surface", defectType: "Snail Trail", severity: "Minor" as const, location: "Cells B3-B6, diagonal pattern", imageRef: "IMG-VS-001", notes: "Light discoloration along cell edges, 12cm total length" },
  { id: 2, component: "Front Surface", defectType: "Cell Discoloration", severity: "Major" as const, location: "Cell D4, center", imageRef: "IMG-VS-002", notes: "Yellowing observed, approx 40% of cell area affected" },
  { id: 3, component: "Front Surface", defectType: "Cell Chip", severity: "Minor" as const, location: "Cell A1, top-left corner", imageRef: "IMG-VS-003", notes: "Small chip <2mm, no active area impact" },
  { id: 4, component: "Front Surface", defectType: "Broken Glass", severity: "Critical" as const, location: "Area near Cell F2-F3", imageRef: "IMG-VS-004", notes: "Hairline crack 8cm, safety concern per IEC 61730" },
  { id: 5, component: "Back Surface", defectType: "Backsheet Damage", severity: "Major" as const, location: "Lower-right quadrant, 15x8cm area", imageRef: "IMG-VS-005", notes: "Crazing pattern, potential moisture ingress risk" },
  { id: 6, component: "Back Surface", defectType: "Delamination", severity: "Critical" as const, location: "Center area, behind cells C3-D4", imageRef: "IMG-VS-006", notes: "Visible air pocket ~6cm diameter, active area affected" },
  { id: 7, component: "Back Surface", defectType: "Junction Box Crack", severity: "Major" as const, location: "J-box housing, top seal", imageRef: "IMG-VS-007", notes: "Seal integrity compromised, IP65 rating at risk" },
  { id: 8, component: "Frame / Edge", defectType: "Frame Corrosion", severity: "Minor" as const, location: "Bottom rail, left corner", imageRef: "IMG-VS-008", notes: "Surface oxidation ~3cm, cosmetic at current stage" },
  { id: 9, component: "Frame / Edge", defectType: "Seal Failure", severity: "Major" as const, location: "Top edge sealant, right side", imageRef: "IMG-VS-009", notes: "Sealant separation 5cm, moisture pathway" },
  { id: 10, component: "Frame / Edge", defectType: "Label Damage", severity: "Minor" as const, location: "Nameplate, back surface", imageRef: "IMG-VS-010", notes: "Partially faded, serial number still legible" },
];

const irHotspots = [
  { id: 1, cellArea: "Cell A3", temperature: 72.4, deltaT: 28.1, status: "Critical" as const },
  { id: 2, cellArea: "Cell C5", temperature: 58.6, deltaT: 14.3, status: "Warning" as const },
  { id: 3, cellArea: "Cell D7", temperature: 65.2, deltaT: 20.9, status: "Critical" as const },
  { id: 4, cellArea: "Cell F2", temperature: 52.1, deltaT: 7.8, status: "Warning" as const },
  { id: 5, cellArea: "String 2 Bus", temperature: 48.3, deltaT: 4.0, status: "Normal" as const },
  { id: 6, cellArea: "Cell B6", temperature: 46.8, deltaT: 2.5, status: "Normal" as const },
  { id: 7, cellArea: "Bypass Diode 1", temperature: 61.3, deltaT: 17.0, status: "Warning" as const },
  { id: 8, cellArea: "Cell E4", temperature: 44.9, deltaT: 0.6, status: "Normal" as const },
  { id: 9, cellArea: "Cell G1", temperature: 55.7, deltaT: 11.4, status: "Warning" as const },
  { id: 10, cellArea: "Junction Box", temperature: 43.2, deltaT: -1.1, status: "Normal" as const },
];

const irSummary = {
  maxTemp: 72.4,
  minTemp: 42.8,
  avgTemp: 44.3,
  maxDeltaT: 28.1,
  hotSpotCount: 4,
};

const comparisonBefore = {
  label: "Pre-Stress Test (IEC 61215 Baseline)",
  date: "2026-01-15",
  totalDefects: 4,
  critical: 0,
  major: 1,
  minor: 3,
  passRate: 94.4,
  defects: [
    { type: "Micro-crack", count: 3, severity: "Minor" as const },
    { type: "Minor Shunt", count: 1, severity: "Minor" as const },
  ],
};

const comparisonAfter = {
  label: "Post-Stress Test (TC200 + HF10 + DH1000)",
  date: "2026-03-05",
  totalDefects: 29,
  critical: 8,
  major: 10,
  minor: 11,
  passRate: 75.0,
  defects: [
    { type: "Cell Crack", count: 7, severity: "Critical" as const },
    { type: "Inactive Area", count: 3, severity: "Major" as const },
    { type: "Micro-crack", count: 12, severity: "Minor" as const },
    { type: "Broken Interconnect", count: 1, severity: "Critical" as const },
    { type: "PID Degradation", count: 4, severity: "Major" as const },
    { type: "Shunt Path", count: 2, severity: "Major" as const },
  ],
};

const comparisonMetrics = {
  newDefects: 25,
  worsened: 3,
  passToFail: 14,
  overlayFindings: [
    "EL + IR correlation: 3 of 4 hotspots co-located with EL-detected cracks (Cells A3, C5, D7)",
    "Bypass diode thermal anomaly correlates with String 2 inactive area in EL image",
    "PID-affected edge cells show both reduced EL intensity and elevated thermal signature (+8-12°C above string average)",
    "New post-stress crack at Cell E1 not yet showing thermal anomaly — early stage defect",
  ],
};

const batchItems = [
  { id: "MOD-2026-0451", imageType: "EL", status: "Complete" as const, defectsFound: 3, severity: "Minor" as const },
  { id: "MOD-2026-0452", imageType: "EL + IR", status: "Complete" as const, defectsFound: 8, severity: "Critical" as const },
  { id: "MOD-2026-0453", imageType: "Visual", status: "Complete" as const, defectsFound: 2, severity: "Minor" as const },
  { id: "MOD-2026-0454", imageType: "EL", status: "Processing" as const, defectsFound: 0, severity: "Minor" as const },
  { id: "MOD-2026-0455", imageType: "IR", status: "Queued" as const, defectsFound: 0, severity: "Minor" as const },
  { id: "MOD-2026-0456", imageType: "EL + IR + Visual", status: "Queued" as const, defectsFound: 0, severity: "Minor" as const },
  { id: "MOD-2026-0457", imageType: "EL", status: "Failed" as const, defectsFound: 0, severity: "Minor" as const },
  { id: "MOD-2026-0458", imageType: "Visual", status: "Complete" as const, defectsFound: 5, severity: "Major" as const },
];

const defectDistributionData = [
  { name: "Cell Cracks", value: 32, color: "#ef4444" },
  { name: "Micro-cracks", value: 24, color: "#f97316" },
  { name: "Hotspots", value: 18, color: "#eab308" },
  { name: "Snail Trails", value: 12, color: "#22c55e" },
  { name: "PID", value: 8, color: "#3b82f6" },
  { name: "Delamination", value: 4, color: "#8b5cf6" },
  { name: "Other", value: 2, color: "#6b7280" },
];

const paretoData = [
  { defect: "Cell Crack", count: 32, cumPct: 32 },
  { defect: "Micro-crack", count: 24, cumPct: 56 },
  { defect: "Hotspot", count: 18, cumPct: 74 },
  { defect: "Snail Trail", count: 12, cumPct: 86 },
  { defect: "PID", count: 8, cumPct: 94 },
  { defect: "Delam.", count: 4, cumPct: 98 },
  { defect: "Other", count: 2, cumPct: 100 },
];

const trendData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 1, 8 + i);
  const base = 3 + Math.floor(Math.random() * 5);
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    defects: base,
    critical: Math.max(0, Math.floor(base * 0.2 + (Math.random() - 0.5) * 2)),
    inspections: 4 + Math.floor(Math.random() * 6),
  };
});

const severityBreakdown = [
  { severity: "Critical", count: 14, color: "#ef4444" },
  { severity: "Major", count: 22, color: "#f97316" },
  { severity: "Minor", count: 38, color: "#eab308" },
  { severity: "Informational", count: 6, color: "#6b7280" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: "Critical" | "Major" | "Minor" }) {
  const variant = severity === "Critical" ? "destructive" : severity === "Major" ? "default" : "secondary";
  return <Badge variant={variant}>{severity}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Complete":
      return <Badge className="bg-green-600 text-white hover:bg-green-700">{status}</Badge>;
    case "Processing":
      return <Badge className="bg-blue-600 text-white hover:bg-blue-700">{status}</Badge>;
    case "Queued":
      return <Badge variant="secondary">{status}</Badge>;
    case "Failed":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function ThermalStatusBadge({ status }: { status: "Normal" | "Warning" | "Critical" }) {
  if (status === "Critical") return <Badge variant="destructive">{status}</Badge>;
  if (status === "Warning") return <Badge className="bg-amber-500 text-white hover:bg-amber-600">{status}</Badge>;
  return <Badge className="bg-green-600 text-white hover:bg-green-700">{status}</Badge>;
}

function StatCard({ title, value, subtitle, icon: Icon, valueClass }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  valueClass?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">{title}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass || ""}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisionAIDashboard() {
  const [batchFilter, setBatchFilter] = useState<string>("all");

  const filteredBatch = useMemo(() => {
    if (batchFilter === "all") return batchItems;
    return batchItems.filter((b) => b.status.toLowerCase() === batchFilter);
  }, [batchFilter]);

  const batchStats = useMemo(() => {
    const total = batchItems.length;
    const processed = batchItems.filter((b) => b.status === "Complete").length;
    const pass = batchItems.filter((b) => b.status === "Complete" && b.severity !== "Critical").length;
    const fail = batchItems.filter((b) => b.status === "Complete" && b.severity === "Critical").length;
    const progress = Math.round(((processed + batchItems.filter((b) => b.status === "Failed").length) / total) * 100);
    return { total, processed, pass, fail, progress };
  }, []);

  const analyticsStats = useMemo(() => {
    const totalInspections = trendData.reduce((s, d) => s + d.inspections, 0);
    const totalDefects = trendData.reduce((s, d) => s + d.defects, 0);
    const avgDefects = (totalDefects / totalInspections).toFixed(1);
    const totalCritical = trendData.reduce((s, d) => s + d.critical, 0);
    const critRate = ((totalCritical / totalDefects) * 100).toFixed(1);
    return { totalInspections, avgDefects, critRate };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vision AI</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered defect detection for solar PV modules — EL, IR, and Visual inspection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="el-analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="el-analysis" className="flex items-center gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            EL Analysis
          </TabsTrigger>
          <TabsTrigger value="visual-inspection" className="flex items-center gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" />
            Visual Inspection
          </TabsTrigger>
          <TabsTrigger value="ir-thermography" className="flex items-center gap-1.5 text-xs">
            <Thermometer className="h-3.5 w-3.5" />
            IR Thermography
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-1.5 text-xs">
            <GitCompare className="h-3.5 w-3.5" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-1.5 text-xs">
            <Layers className="h-3.5 w-3.5" />
            Batch Processing
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: EL Analysis ─────────────────────────────────────────────── */}
        <TabsContent value="el-analysis" className="space-y-6">
          {/* Upload Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload EL Image</CardTitle>
              <CardDescription>Drag and drop or click to upload electroluminescence images for AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-sm font-medium">Drop EL images here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports TIFF, PNG, JPEG up to 50MB. 16-bit images recommended.</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Total Cells Analyzed" value={72} icon={Activity} subtitle="6 strings x 12 cells" />
            <StatCard title="Defective Cells" value={18} icon={AlertTriangle} valueClass="text-destructive" subtitle="25% of total cells" />
            <StatCard title="Pass Rate" value="75.0%" icon={CheckCircle2} valueClass="text-amber-500" subtitle="Threshold: 95%" />
            <StatCard title="Average Confidence" value="92.2%" icon={TrendingUp} valueClass="text-blue-600" subtitle="AI model confidence" />
          </div>

          {/* Defect Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detected Defects</CardTitle>
              <CardDescription>AI analysis results for module MOD-2026-0452 — EL forward bias 1.0A</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Defect Type</TableHead>
                    <TableHead className="text-center">Count</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Confidence %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elDefects.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.type}</TableCell>
                      <TableCell className="text-center">{d.count}</TableCell>
                      <TableCell className="text-center"><SeverityBadge severity={d.severity} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[280px]">{d.location}</TableCell>
                      <TableCell className="text-right font-mono">{d.confidence.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Before / After Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Before / After EL Comparison</CardTitle>
              <CardDescription>Pre-test vs Post-test (TC200 + HF10) electroluminescence analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Pre-Test Baseline
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>Cells Analyzed: <span className="font-mono font-medium">{elPreTestSummary.totalCells}</span></p>
                    <p>Defective Cells: <span className="font-mono font-medium">{elPreTestSummary.defectiveCells}</span></p>
                    <p>Pass Rate: <span className="font-mono font-medium text-green-600">{elPreTestSummary.passRate}%</span></p>
                    <p>Avg Confidence: <span className="font-mono font-medium">{elPreTestSummary.avgConfidence}%</span></p>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    {elPreTestSummary.defects.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{d.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{d.count}</span>
                          <SeverityBadge severity={d.severity} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Post-Test Results
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>Cells Analyzed: <span className="font-mono font-medium">{elPostTestSummary.totalCells}</span></p>
                    <p>Defective Cells: <span className="font-mono font-medium text-destructive">{elPostTestSummary.defectiveCells}</span></p>
                    <p>Pass Rate: <span className="font-mono font-medium text-amber-500">{elPostTestSummary.passRate}%</span></p>
                    <p>Avg Confidence: <span className="font-mono font-medium">{elPostTestSummary.avgConfidence}%</span></p>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    {elPostTestSummary.defects.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{d.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{d.count}</span>
                          <SeverityBadge severity={d.severity} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Visual Inspection ───────────────────────────────────────── */}
        <TabsContent value="visual-inspection" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Module Under Test" value="MOD-2026-0452" icon={Search} subtitle="72-cell mono-PERC, 400Wp" />
            <StatCard title="Total Defects Found" value={10} icon={AlertTriangle} valueClass="text-destructive" subtitle="Per IEC 62446 criteria" />
            <StatCard title="Critical Defects" value={2} icon={XCircle} valueClass="text-destructive" subtitle="Requires immediate action" />
            <StatCard title="Inspection Status" value="Complete" icon={CheckCircle2} valueClass="text-green-600" subtitle="All surfaces inspected" />
          </div>

          {/* Front Surface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" /> Front Surface Inspection
              </CardTitle>
              <CardDescription>Glass, cell, and encapsulant inspection results</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Defect Type</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Image Ref</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visualInspectionDefects.filter((d) => d.component === "Front Surface").map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.component}</TableCell>
                      <TableCell>{d.defectType}</TableCell>
                      <TableCell className="text-center"><SeverityBadge severity={d.severity} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.location}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{d.imageRef}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px]">{d.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Back Surface */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" /> Back Surface Inspection
              </CardTitle>
              <CardDescription>Backsheet, encapsulant, and junction box inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Defect Type</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Image Ref</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visualInspectionDefects.filter((d) => d.component === "Back Surface").map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.component}</TableCell>
                      <TableCell>{d.defectType}</TableCell>
                      <TableCell className="text-center"><SeverityBadge severity={d.severity} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.location}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{d.imageRef}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px]">{d.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Frame / Edge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" /> Frame &amp; Edge Inspection
              </CardTitle>
              <CardDescription>Frame, edge seal, and label inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Defect Type</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Image Ref</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visualInspectionDefects.filter((d) => d.component === "Frame / Edge").map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.component}</TableCell>
                      <TableCell>{d.defectType}</TableCell>
                      <TableCell className="text-center"><SeverityBadge severity={d.severity} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.location}</TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{d.imageRef}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px]">{d.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: IR Thermography ─────────────────────────────────────────── */}
        <TabsContent value="ir-thermography" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard title="Max Temperature" value={`${irSummary.maxTemp}°C`} icon={Thermometer} valueClass="text-destructive" />
            <StatCard title="Min Temperature" value={`${irSummary.minTemp}°C`} icon={Thermometer} valueClass="text-blue-500" />
            <StatCard title="Average Temperature" value={`${irSummary.avgTemp}°C`} icon={Thermometer} />
            <StatCard title="Max ΔT" value={`${irSummary.maxDeltaT}°C`} icon={AlertTriangle} valueClass="text-destructive" subtitle="Threshold: 20°C" />
            <StatCard title="Hot Spots Detected" value={irSummary.hotSpotCount} icon={Zap} valueClass="text-amber-500" subtitle="ΔT > 10°C" />
          </div>

          {/* Hotspot Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hot Spot Detection Results</CardTitle>
              <CardDescription>Thermal analysis of module MOD-2026-0452 under 1000 W/m² irradiance, STC conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cell / Area</TableHead>
                    <TableHead className="text-right">Temperature (°C)</TableHead>
                    <TableHead className="text-right">ΔT from Avg (°C)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {irHotspots.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.cellArea}</TableCell>
                      <TableCell className="text-right font-mono">{h.temperature.toFixed(1)}</TableCell>
                      <TableCell className={`text-right font-mono ${h.deltaT > 15 ? "text-destructive font-semibold" : h.deltaT > 5 ? "text-amber-500" : ""}`}>
                        {h.deltaT > 0 ? "+" : ""}{h.deltaT.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center"><ThermalStatusBadge status={h.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* String Failure & Bypass Diode */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">String Failure Identification</CardTitle>
                <CardDescription>Inter-string thermal balance analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { string: "String 1", avgTemp: 44.1, status: "Normal", cells: "A1-A12" },
                    { string: "String 2", avgTemp: 52.8, status: "Elevated", cells: "B1-B12, C1-C12" },
                    { string: "String 3", avgTemp: 44.6, status: "Normal", cells: "D1-D12, E1-E12" },
                    { string: "String 4", avgTemp: 43.9, status: "Normal", cells: "F1-F12, G1-G12" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{s.string} <span className="text-muted-foreground font-normal">({s.cells})</span></p>
                        <p className="text-xs text-muted-foreground">Avg: {s.avgTemp}°C</p>
                      </div>
                      <Badge variant={s.status === "Elevated" ? "destructive" : "secondary"}>{s.status}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  String 2 shows elevated average temperature (+8.7°C above module average). Possible high-resistance interconnect or partial shading effect. Recommend I-V curve trace for confirmation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bypass Diode Assessment</CardTitle>
                <CardDescription>Bypass diode thermal and functional status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { diode: "Bypass Diode 1", temp: 61.3, deltaT: 17.0, status: "Warning" as const, note: "Elevated temp — possible forward bias activation" },
                    { diode: "Bypass Diode 2", temp: 44.2, deltaT: -0.1, status: "Normal" as const, note: "Within normal operating range" },
                    { diode: "Bypass Diode 3", temp: 45.1, deltaT: 0.8, status: "Normal" as const, note: "Within normal operating range" },
                  ].map((d, i) => (
                    <div key={i} className="p-3 rounded-lg border space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{d.diode}</p>
                        <ThermalStatusBadge status={d.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">Temp: {d.temp}°C | ΔT: {d.deltaT > 0 ? "+" : ""}{d.deltaT}°C</p>
                      <p className="text-xs text-muted-foreground italic">{d.note}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Bypass Diode 1 correlates with String 2 thermal anomaly. Diode may be conducting due to cell mismatch or shading. Recommend dark I-V and diode forward voltage test.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 4: Comparison ──────────────────────────────────────────────── */}
        <TabsContent value="comparison" className="space-y-6">
          {/* Comparison Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="New Defects Found" value={comparisonMetrics.newDefects} icon={AlertTriangle} valueClass="text-destructive" subtitle="Post-stress new findings" />
            <StatCard title="Defects Worsened" value={comparisonMetrics.worsened} icon={TrendingUp} valueClass="text-amber-500" subtitle="Severity increased" />
            <StatCard title="Pass → Fail Transitions" value={comparisonMetrics.passToFail} icon={XCircle} valueClass="text-destructive" subtitle="Cells that degraded" />
          </div>

          {/* Side-by-side panels */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Panel */}
            <Card className="border-green-200">
              <CardHeader className="bg-green-50 dark:bg-green-950/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" /> Before — Pre-Stress Test
                </CardTitle>
                <CardDescription>{comparisonBefore.label} — {comparisonBefore.date}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Total Defects</p>
                    <p className="text-2xl font-bold">{comparisonBefore.totalDefects}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                    <p className="text-2xl font-bold text-green-600">{comparisonBefore.passRate}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="destructive">Critical: {comparisonBefore.critical}</Badge>
                  <Badge>Major: {comparisonBefore.major}</Badge>
                  <Badge variant="secondary">Minor: {comparisonBefore.minor}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Defect Summary</p>
                  {comparisonBefore.defects.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{d.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{d.count}</span>
                        <SeverityBadge severity={d.severity} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* After Panel */}
            <Card className="border-red-200">
              <CardHeader className="bg-red-50 dark:bg-red-950/20 rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" /> After — Post-Stress Test
                </CardTitle>
                <CardDescription>{comparisonAfter.label} — {comparisonAfter.date}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Total Defects</p>
                    <p className="text-2xl font-bold text-destructive">{comparisonAfter.totalDefects}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                    <p className="text-2xl font-bold text-amber-500">{comparisonAfter.passRate}%</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="destructive">Critical: {comparisonAfter.critical}</Badge>
                  <Badge>Major: {comparisonAfter.major}</Badge>
                  <Badge variant="secondary">Minor: {comparisonAfter.minor}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Defect Summary</p>
                  {comparisonAfter.defects.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{d.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{d.count}</span>
                        <SeverityBadge severity={d.severity} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* EL + IR Overlay Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">EL + IR Overlay Analysis</CardTitle>
              <CardDescription>Cross-modal correlation findings from electroluminescence and infrared thermography overlay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparisonMetrics.overlayFindings.map((finding, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{i + 1}</span>
                    </div>
                    <p className="text-sm">{finding}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 5: Batch Processing ────────────────────────────────────────── */}
        <TabsContent value="batch" className="space-y-6">
          {/* Batch Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Total Modules" value={batchStats.total} icon={Layers} subtitle="In current batch" />
            <StatCard title="Processed" value={batchStats.processed} icon={CheckCircle2} valueClass="text-green-600" subtitle={`${Math.round((batchStats.processed / batchStats.total) * 100)}% complete`} />
            <StatCard title="Pass" value={batchStats.pass} icon={CheckCircle2} valueClass="text-green-600" subtitle="No critical defects" />
            <StatCard title="Fail" value={batchStats.fail} icon={XCircle} valueClass="text-destructive" subtitle="Critical defects found" />
          </div>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Progress</CardTitle>
              <CardDescription>Batch ID: BATCH-2026-0089 — Started 2026-03-09 09:30</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-mono font-medium">{batchStats.progress}%</span>
              </div>
              <Progress value={batchStats.progress} />
              <p className="text-xs text-muted-foreground">
                {batchStats.processed} of {batchStats.total} modules analyzed. Estimated time remaining: ~12 minutes.
              </p>
            </CardContent>
          </Card>

          {/* Batch Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Module Queue</CardTitle>
                <CardDescription>All modules in current batch</CardDescription>
              </div>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module ID</TableHead>
                    <TableHead>Image Type</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Defects Found</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatch.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-medium">{item.id}</TableCell>
                      <TableCell>{item.imageType}</TableCell>
                      <TableCell className="text-center"><StatusBadge status={item.status} /></TableCell>
                      <TableCell className="text-center font-mono">
                        {item.status === "Complete" ? item.defectsFound : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.status === "Complete" ? <SeverityBadge severity={item.severity} /> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === "Complete" && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><FileText className="h-4 w-4" /></Button>
                          </div>
                        )}
                        {item.status === "Failed" && (
                          <Button variant="ghost" size="sm" className="text-destructive">Retry</Button>
                        )}
                        {item.status === "Queued" && (
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status === "Processing" && (
                          <Button variant="ghost" size="sm" disabled>
                            <Activity className="h-4 w-4 animate-pulse" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 6: Analytics ───────────────────────────────────────────────── */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Inspections This Month" value={analyticsStats.totalInspections} icon={Camera} subtitle="All modalities combined" />
            <StatCard title="Avg Defects / Module" value={analyticsStats.avgDefects} icon={Activity} subtitle="Across all inspections" />
            <StatCard title="Most Common Defect" value="Cell Crack" icon={AlertTriangle} subtitle="32% of all findings" />
            <StatCard title="Critical Defect Rate" value={`${analyticsStats.critRate}%`} icon={XCircle} valueClass="text-destructive" subtitle="Of total defects found" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Defect Distribution</CardTitle>
                <CardDescription>Breakdown by defect category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={defectDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {defectDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pareto Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Defect Pareto Analysis</CardTitle>
                <CardDescription>Frequency ranking with cumulative percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paretoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="defect" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" label={{ value: "Count", angle: -90, position: "insideLeft" }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: "Cum %", angle: 90, position: "insideRight" }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Defect Count" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="cumPct" stroke="#ef4444" name="Cumulative %" strokeWidth={2} dot={{ r: 3 }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trend Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Defect Trend (30 Days)</CardTitle>
                <CardDescription>Daily defect counts and inspection volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="defects" stroke="#3b82f6" name="Total Defects" strokeWidth={2} />
                    <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="inspections" stroke="#22c55e" name="Inspections" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Severity Breakdown Horizontal Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Severity Breakdown</CardTitle>
                <CardDescription>Distribution of findings by severity level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={severityBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="severity" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" name="Defect Count" radius={[0, 4, 4, 0]}>
                      {severityBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
