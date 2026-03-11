// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Package, GitBranch, ClipboardList, Calendar, AlertTriangle, CheckCircle2,
  Clock, ChevronRight, Plus, Search, Download, FileText, Zap, Layers,
  BarChart3, Target, ArrowRight, Info, Edit3, Wrench, Activity
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BOMItem {
  id: string
  partNumber: string
  description: string
  manufacturer: string
  partType: "cell" | "glass" | "encapsulant" | "backsheet" | "frame" | "junction_box" | "interconnect" | "adhesive" | "other"
  revision: string
  status: "approved" | "pending" | "deprecated" | "under_review"
  certImpact: "none" | "low" | "medium" | "high" | "critical"
  linkedTests: string[]
  notes: string
}

interface DesignChange {
  id: string
  dcr: string
  title: string
  bomItems: string[]
  changeType: "material_substitution" | "geometry" | "process" | "supplier" | "electrical" | "structural"
  status: "draft" | "under_review" | "approved" | "rejected" | "implemented"
  impactLevel: "none" | "minor" | "moderate" | "major" | "critical"
  affectedTests: string[]
  rereqTests: string[]
  submittedBy: string
  submittedDate: string
  approvedDate?: string
  description: string
  justification: string
}

interface TestPlanItem {
  id: string
  testCode: string
  testName: string
  standard: string
  sampleCount: number
  durationDays: number
  startDate: string
  endDate: string
  status: "planned" | "in_progress" | "completed" | "waived"
  linkedDCR?: string
  linkedBOM?: string[]
  equipment: string
  technician: string
  notes: string
}

interface GanttTask {
  id: string
  name: string
  type: "phase" | "test" | "milestone"
  startDate: string
  endDate: string
  progress: number
  status: "not_started" | "in_progress" | "completed" | "delayed"
  dependencies?: string[]
  phase?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BOM: BOMItem[] = [
  { id: "bom-001", partNumber: "CELL-M10-182", description: "M10 Mono-Si PERC Cell 182mm", manufacturer: "LONGi Solar",
    partType: "cell", revision: "B", status: "approved", certImpact: "critical",
    linkedTests: ["MQT 02", "MQT 04", "MQT 11", "MQT 13"], notes: "Primary cell technology for 410W module" },
  { id: "bom-002", partNumber: "GLASS-AR-3.2", description: "3.2mm AR Coated Low-Iron Tempered Glass", manufacturer: "AGC Solar",
    partType: "glass", revision: "A", status: "approved", certImpact: "medium",
    linkedTests: ["MQT 16", "MQT 17"], notes: "Anti-reflective coating grade" },
  { id: "bom-003", partNumber: "EVA-F-0.45", description: "Fast-Cure EVA Encapsulant 0.45mm", manufacturer: "Mitsui Chemicals",
    partType: "encapsulant", revision: "C", status: "under_review", certImpact: "high",
    linkedTests: ["MQT 13", "MQT 11", "MQT 12"], notes: "Under review for UV resistance upgrade" },
  { id: "bom-004", partNumber: "BS-KPF-0.35", description: "KPF Composite Backsheet 0.35mm", manufacturer: "Coveme",
    partType: "backsheet", revision: "A", status: "approved", certImpact: "high",
    linkedTests: ["MQT 13", "MQT 15", "MST 17"], notes: "IEC 62788 tested" },
  { id: "bom-005", partNumber: "FRM-AL-6005", description: "Anodized Aluminum Frame 6005-T5", manufacturer: "Jinko Metals",
    partType: "frame", revision: "A", status: "approved", certImpact: "low",
    linkedTests: ["MQT 16", "MQT 14"], notes: "30mm height, anodized silver" },
  { id: "bom-006", partNumber: "JB-IP68-4A", description: "IP68 Junction Box 4A bypass diodes", manufacturer: "Amphenol",
    partType: "junction_box", revision: "B", status: "pending", certImpact: "critical",
    linkedTests: ["MQT 18", "MST 22", "MQT 15"], notes: "New supplier qualification in progress" },
  { id: "bom-007", partNumber: "RIBBON-0.25", description: "Tabbing Ribbon 0.25×1.5mm Sn-Pb", manufacturer: "Ulbrich",
    partType: "interconnect", revision: "A", status: "approved", certImpact: "medium",
    linkedTests: ["MQT 11", "MQT 14"], notes: "Standard solder ribbon" },
  { id: "bom-008", partNumber: "SEAL-MS-BLK", description: "Black Moisture Seal Silicone", manufacturer: "Henkel",
    partType: "adhesive", revision: "A", status: "approved", certImpact: "low",
    linkedTests: ["MQT 13"], notes: "Frame edge seal" },
  { id: "bom-009", partNumber: "EVA-POE-0.45", description: "POE Film Encapsulant 0.45mm (alternative)", manufacturer: "Hangzhou First",
    partType: "encapsulant", revision: "A", status: "under_review", certImpact: "high",
    linkedTests: ["MQT 13", "MQT 11", "MQT 15"], notes: "Proposed replacement for EVA-F-0.45" },
  { id: "bom-010", partNumber: "CONN-MC4-30A", description: "MC4 Compatible Connector 30A H4 Series", manufacturer: "Stäubli",
    partType: "other", revision: "A", status: "approved", certImpact: "medium",
    linkedTests: ["MQT 14", "MST 51"], notes: "TÜV certified MC4 connector" },
]

const MOCK_CHANGES: DesignChange[] = [
  { id: "dc-001", dcr: "DCR-2026-007", title: "Replace EVA encapsulant with POE film",
    bomItems: ["bom-003", "bom-009"], changeType: "material_substitution",
    status: "under_review", impactLevel: "major",
    affectedTests: ["MQT 11", "MQT 12", "MQT 13", "MQT 15"],
    rereqTests: ["MQT 11 (TC200)", "MQT 13 (DH1000)", "MQT 15 (Wet Leakage)"],
    submittedBy: "Rajesh Kumar", submittedDate: "2026-02-28",
    description: "Switch from standard EVA to POE (Polyolefin Elastomer) front encapsulant for improved UV resistance and lower PID risk",
    justification: "POE shows 40% better UV stability in accelerated tests. Eliminates acetic acid outgassing. Reduces PID risk in high-voltage systems." },
  { id: "dc-002", dcr: "DCR-2026-005", title: "Upgrade junction box to new supplier (Amphenol)",
    bomItems: ["bom-006"], changeType: "supplier",
    status: "approved", impactLevel: "critical",
    affectedTests: ["MQT 18", "MST 22", "MQT 15"],
    rereqTests: ["MQT 18 (Bypass Diode Thermal)", "MST 22 (Bypass Diode Functionality)"],
    submittedBy: "Priya Sharma", submittedDate: "2026-01-15", approvedDate: "2026-02-10",
    description: "Change junction box supplier from Multicontact to Amphenol H4 series for cost reduction and improved IP68 sealing",
    justification: "30% cost reduction. Amphenol H4 is pre-certified IEC 61215 component. Full retest of bypass diode functions required per IEC 62915." },
  { id: "dc-003", dcr: "DCR-2026-003", title: "Frame height reduction from 35mm to 30mm",
    bomItems: ["bom-005"], changeType: "geometry",
    status: "implemented", impactLevel: "moderate",
    affectedTests: ["MQT 16", "MQT 17"],
    rereqTests: ["MQT 16 (Static Mechanical Load)", "MQT 17 (Hail)"],
    submittedBy: "Arun Patel", submittedDate: "2025-12-01", approvedDate: "2025-12-20",
    description: "Reduce anodized aluminum frame height from 35mm to 30mm for improved aesthetics and reduced material cost",
    justification: "Structural FEA analysis confirms 30mm frame meets 2400Pa load requirement. Retested per IEC 62915 change control." },
  { id: "dc-004", dcr: "DCR-2026-009", title: "Bifacial cell upgrade – M10 PERC to TOPCon",
    bomItems: ["bom-001"], changeType: "electrical",
    status: "draft", impactLevel: "critical",
    affectedTests: ["MQT 02", "MQT 04", "MQT 06", "MQT 11", "MQT 13", "MQT 18"],
    rereqTests: ["Full IEC 61215 re-certification required", "MQT 02", "MQT 04", "MQT 06", "MQT 11", "MQT 13"],
    submittedBy: "Deepa Nair", submittedDate: "2026-03-05",
    description: "Upgrade from PERC to TOPCon cell technology to achieve 22%+ efficiency. Full model family redesign.",
    justification: "Market demand for >22% modules. TOPCon achieves 22.5% efficiency with better temperature coefficients. Requires full IEC 62915 change management." },
]

const MOCK_TEST_PLAN: TestPlanItem[] = [
  { id: "tp-001", testCode: "MQT 01", testName: "Visual Inspection", standard: "IEC 61215",
    sampleCount: 3, durationDays: 1, startDate: "2026-03-15", endDate: "2026-03-15",
    status: "planned", linkedDCR: "DCR-2026-007", linkedBOM: ["bom-003", "bom-009"],
    equipment: "Lightbox + Camera", technician: "Rajesh Kumar", notes: "Initial inspection for POE change" },
  { id: "tp-002", testCode: "MQT 11", testName: "Thermal Cycling TC200", standard: "IEC 61215",
    sampleCount: 3, durationDays: 28, startDate: "2026-03-20", endDate: "2026-04-17",
    status: "planned", linkedDCR: "DCR-2026-007", linkedBOM: ["bom-003", "bom-009"],
    equipment: "Thermal Chamber TC-01", technician: "Rajesh Kumar", notes: "Critical re-test for encapsulant change" },
  { id: "tp-003", testCode: "MQT 13", testName: "Damp Heat DH1000", standard: "IEC 61215",
    sampleCount: 3, durationDays: 45, startDate: "2026-03-20", endDate: "2026-05-04",
    status: "planned", linkedDCR: "DCR-2026-007", linkedBOM: ["bom-003", "bom-009"],
    equipment: "Humidity Chamber HC-01", technician: "Priya Sharma", notes: "1000h DH for POE validation" },
  { id: "tp-004", testCode: "MQT 15", testName: "Wet Leakage Current", standard: "IEC 61215",
    sampleCount: 3, durationDays: 1, startDate: "2026-05-06", endDate: "2026-05-06",
    status: "planned", linkedDCR: "DCR-2026-007", linkedBOM: ["bom-003"],
    equipment: "Immersion Tank", technician: "Arun Patel", notes: "Post-DH leakage test" },
  { id: "tp-005", testCode: "MQT 18", testName: "Bypass Diode Thermal", standard: "IEC 61215",
    sampleCount: 2, durationDays: 2, startDate: "2026-03-10", endDate: "2026-03-11",
    status: "in_progress", linkedDCR: "DCR-2026-005", linkedBOM: ["bom-006"],
    equipment: "Thermal Camera + Power Supply", technician: "Deepa Nair", notes: "Amphenol JB qualification" },
  { id: "tp-006", testCode: "MST 22", testName: "Bypass Diode Functionality", standard: "IEC 61730",
    sampleCount: 2, durationDays: 1, startDate: "2026-03-12", endDate: "2026-03-12",
    status: "planned", linkedDCR: "DCR-2026-005", linkedBOM: ["bom-006"],
    equipment: "Safety Test Station", technician: "Deepa Nair", notes: "JB supplier change verification" },
  { id: "tp-007", testCode: "MQT 16", testName: "Static Mechanical Load 2400Pa", standard: "IEC 61215",
    sampleCount: 2, durationDays: 1, startDate: "2026-01-10", endDate: "2026-01-10",
    status: "completed", linkedDCR: "DCR-2026-003", linkedBOM: ["bom-005"],
    equipment: "Load Frame", technician: "Vikram Singh", notes: "Frame height change – PASS" },
]

const GANTT_TASKS: GanttTask[] = [
  { id: "ph1", name: "Phase 1: BOM Baseline", type: "phase", startDate: "2026-03-01", endDate: "2026-03-14", progress: 80, status: "in_progress", phase: "baseline" },
  { id: "t1", name: "MQT 01 – Visual Inspection", type: "test", startDate: "2026-03-15", endDate: "2026-03-15", progress: 0, status: "not_started", phase: "baseline", dependencies: ["ph1"] },
  { id: "t2", name: "MQT 02 – Pmax at STC", type: "test", startDate: "2026-03-15", endDate: "2026-03-15", progress: 0, status: "not_started", phase: "baseline", dependencies: ["ph1"] },
  { id: "m1", name: "Milestone: Baseline Approval", type: "milestone", startDate: "2026-03-16", endDate: "2026-03-16", progress: 0, status: "not_started", dependencies: ["t1", "t2"] },
  { id: "ph2", name: "Phase 2: Change Validation Tests", type: "phase", startDate: "2026-03-17", endDate: "2026-05-10", progress: 5, status: "not_started", phase: "validation" },
  { id: "t3", name: "MQT 18 – Bypass Diode (JB change)", type: "test", startDate: "2026-03-10", endDate: "2026-03-11", progress: 60, status: "in_progress", phase: "validation" },
  { id: "t4", name: "MST 22 – Bypass Diode Func.", type: "test", startDate: "2026-03-12", endDate: "2026-03-12", progress: 0, status: "not_started", phase: "validation", dependencies: ["t3"] },
  { id: "t5", name: "MQT 11 – TC200 (POE encap)", type: "test", startDate: "2026-03-20", endDate: "2026-04-17", progress: 0, status: "not_started", phase: "validation", dependencies: ["m1"] },
  { id: "t6", name: "MQT 13 – DH1000 (POE encap)", type: "test", startDate: "2026-03-20", endDate: "2026-05-04", progress: 0, status: "not_started", phase: "validation", dependencies: ["m1"] },
  { id: "t7", name: "MQT 15 – Wet Leakage", type: "test", startDate: "2026-05-06", endDate: "2026-05-06", progress: 0, status: "not_started", phase: "validation", dependencies: ["t6"] },
  { id: "m2", name: "Milestone: Change Tests Complete", type: "milestone", startDate: "2026-05-07", endDate: "2026-05-07", progress: 0, status: "not_started", dependencies: ["t4", "t5", "t7"] },
  { id: "ph3", name: "Phase 3: Certification Submission", type: "phase", startDate: "2026-05-08", endDate: "2026-05-31", progress: 0, status: "not_started", phase: "submission" },
  { id: "t8", name: "Test Report Compilation", type: "test", startDate: "2026-05-08", endDate: "2026-05-12", progress: 0, status: "not_started", phase: "submission", dependencies: ["m2"] },
  { id: "m3", name: "Milestone: CB Submission", type: "milestone", startDate: "2026-05-31", endDate: "2026-05-31", progress: 0, status: "not_started", dependencies: ["t8"] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  deprecated: "bg-gray-100 text-gray-500",
  under_review: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-700",
  implemented: "bg-emerald-100 text-emerald-700",
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  waived: "bg-purple-100 text-purple-700",
  not_started: "bg-gray-100 text-gray-500",
  delayed: "bg-red-100 text-red-700",
}

const impactColors = {
  none: "bg-gray-100 text-gray-500",
  low: "bg-green-100 text-green-700",
  minor: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  moderate: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  major: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
}

const certImpactColors = {
  none: "text-gray-400",
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-orange-600",
  critical: "text-red-600",
}

const partTypeLabels = {
  cell: "Cell", glass: "Glass", encapsulant: "Encapsulant", backsheet: "Backsheet",
  frame: "Frame", junction_box: "Junction Box", interconnect: "Interconnect",
  adhesive: "Adhesive", other: "Other",
}

function getDaysBetween(start: string, end: string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1
}

// Simple Gantt bar calculation relative to project start
const PROJECT_START = "2026-03-01"
const PROJECT_END = "2026-05-31"
const totalDays = getDaysBetween(PROJECT_START, PROJECT_END)

function getBarStyle(start: string, end: string) {
  const startOffset = Math.max(0, getDaysBetween(PROJECT_START, start) - 1)
  const duration = getDaysBetween(start, end)
  const left = (startOffset / totalDays) * 100
  const width = Math.max(0.5, (duration / totalDays) * 100)
  return { left: `${left}%`, width: `${width}%` }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IEC62915Page() {
  const [activeTab, setActiveTab] = useState("bom")
  const [bomSearch, setBomSearch] = useState("")
  const [bomFilter, setBomFilter] = useState("all")
  const [selectedChange, setSelectedChange] = useState<DesignChange | null>(null)

  const filteredBOM = useMemo(() => {
    return MOCK_BOM.filter(item => {
      if (bomFilter !== "all" && item.partType !== bomFilter) return false
      if (bomSearch && !item.description.toLowerCase().includes(bomSearch.toLowerCase()) &&
          !item.partNumber.toLowerCase().includes(bomSearch.toLowerCase())) return false
      return true
    })
  }, [bomFilter, bomSearch])

  const bomStats = {
    total: MOCK_BOM.length,
    approved: MOCK_BOM.filter(b => b.status === "approved").length,
    underReview: MOCK_BOM.filter(b => b.status === "under_review").length,
    pending: MOCK_BOM.filter(b => b.status === "pending").length,
    critical: MOCK_BOM.filter(b => b.certImpact === "critical").length,
  }

  const changeStats = {
    total: MOCK_CHANGES.length,
    draft: MOCK_CHANGES.filter(c => c.status === "draft").length,
    underReview: MOCK_CHANGES.filter(c => c.status === "under_review").length,
    approved: MOCK_CHANGES.filter(c => c.status === "approved").length,
    implemented: MOCK_CHANGES.filter(c => c.status === "implemented").length,
    critical: MOCK_CHANGES.filter(c => c.impactLevel === "critical").length,
  }

  const testStats = {
    total: MOCK_TEST_PLAN.length,
    planned: MOCK_TEST_PLAN.filter(t => t.status === "planned").length,
    inProgress: MOCK_TEST_PLAN.filter(t => t.status === "in_progress").length,
    completed: MOCK_TEST_PLAN.filter(t => t.status === "completed").length,
    totalSamples: MOCK_TEST_PLAN.reduce((s, t) => s + t.sampleCount, 0),
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            IEC 62915 – BoM & Design Change Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bill of Materials tracking, design change control, test plan matrix, and certification project scheduler
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New DCR
          </Button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "BOM Items", value: bomStats.total, sub: `${bomStats.approved} approved`, color: "text-blue-600", icon: Package },
          { label: "Under Review", value: bomStats.underReview, sub: "BOM items", color: "text-amber-600", icon: Edit3 },
          { label: "Design Changes", value: changeStats.total, sub: `${changeStats.underReview} in review`, color: "text-purple-600", icon: GitBranch },
          { label: "Critical Changes", value: changeStats.critical, sub: "require full retest", color: "text-red-600", icon: AlertTriangle },
          { label: "Test Plan Items", value: testStats.total, sub: `${testStats.inProgress} in progress`, color: "text-green-600", icon: ClipboardList },
          { label: "Total Samples", value: testStats.totalSamples, sub: "in test matrix", color: "text-gray-700", icon: Layers },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap bg-muted">
          <TabsTrigger value="bom" className="text-xs">
            <Package className="h-3 w-3 mr-1" /> Bill of Materials
          </TabsTrigger>
          <TabsTrigger value="changes" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" /> Design Changes
          </TabsTrigger>
          <TabsTrigger value="testplan" className="text-xs">
            <ClipboardList className="h-3 w-3 mr-1" /> Test Plan Matrix
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" /> Project Scheduler
          </TabsTrigger>
        </TabsList>

        {/* ── BOM TAB ─────────────────────────────────────────────── */}
        <TabsContent value="bom" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input placeholder="Search BOM..." className="pl-8 h-8 text-xs w-48"
                     value={bomSearch} onChange={e => setBomSearch(e.target.value)} />
            </div>
            <Select value={bomFilter} onValueChange={setBomFilter}>
              <SelectTrigger className="h-8 text-xs w-36">
                <SelectValue placeholder="Part Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(partTypeLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">{filteredBOM.length} items</span>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Part
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-36">Part Number</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs w-28">Manufacturer</TableHead>
                  <TableHead className="text-xs w-24">Type</TableHead>
                  <TableHead className="text-xs w-16">Rev</TableHead>
                  <TableHead className="text-xs w-24">Status</TableHead>
                  <TableHead className="text-xs w-24">Cert Impact</TableHead>
                  <TableHead className="text-xs w-40">Linked Tests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBOM.map(item => (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="text-xs font-mono font-medium">{item.partNumber}</TableCell>
                    <TableCell className="text-xs">
                      <div>{item.description}</div>
                      {item.notes && <div className="text-muted-foreground text-xs">{item.notes}</div>}
                    </TableCell>
                    <TableCell className="text-xs">{item.manufacturer}</TableCell>
                    <TableCell>
                      <Badge className="text-xs bg-gray-100 text-gray-700">{partTypeLabels[item.partType]}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-center">{item.revision}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColors[item.status]}`}>
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold ${certImpactColors[item.certImpact]}`}>
                        {item.certImpact.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.linkedTests.map(t => (
                          <span key={t} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{t}</span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Certification Impact Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(["critical", "high", "medium", "low", "none"] as const).map(level => {
                    const count = MOCK_BOM.filter(b => b.certImpact === level).length
                    return (
                      <div key={level} className="flex items-center gap-3">
                        <span className={`text-xs font-semibold w-16 ${certImpactColors[level]}`}>{level.toUpperCase()}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full">
                          <div className={`h-2 rounded-full ${level === "critical" ? "bg-red-500" : level === "high" ? "bg-orange-500" : level === "medium" ? "bg-yellow-500" : level === "low" ? "bg-green-500" : "bg-gray-300"}`}
                               style={{ width: `${(count / MOCK_BOM.length) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  BOM Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(["approved", "under_review", "pending", "deprecated"] as const).map(st => {
                    const count = MOCK_BOM.filter(b => b.status === st).length
                    return (
                      <div key={st} className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded w-24 text-center ${statusColors[st]}`}>{st.replace(/_/g, " ")}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full">
                          <div className={`h-2 rounded-full ${st === "approved" ? "bg-green-500" : st === "under_review" ? "bg-blue-500" : st === "pending" ? "bg-yellow-500" : "bg-gray-400"}`}
                               style={{ width: `${(count / MOCK_BOM.length) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DESIGN CHANGES TAB ──────────────────────────────────── */}
        <TabsContent value="changes" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-2">
            {[
              { label: "Draft", value: changeStats.draft, color: "text-gray-600", bg: "bg-gray-100" },
              { label: "Under Review", value: changeStats.underReview, color: "text-blue-700", bg: "bg-blue-100" },
              { label: "Approved", value: changeStats.approved, color: "text-green-700", bg: "bg-green-100" },
              { label: "Implemented", value: changeStats.implemented, color: "text-emerald-700", bg: "bg-emerald-100" },
              { label: "Critical Impact", value: changeStats.critical, color: "text-red-700", bg: "bg-red-100" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-lg p-3 ${bg}`}>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className={`text-xs ${color}`}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Change List */}
            <div className="lg:col-span-1 space-y-3">
              {MOCK_CHANGES.map(dc => (
                <Card key={dc.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${selectedChange?.id === dc.id ? "ring-2 ring-primary" : ""} ${dc.impactLevel === "critical" ? "border-l-4 border-l-red-500" : dc.impactLevel === "major" ? "border-l-4 border-l-orange-500" : ""}`}
                      onClick={() => setSelectedChange(selectedChange?.id === dc.id ? null : dc)}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-primary">{dc.dcr}</span>
                      <Badge className={`text-xs ${statusColors[dc.status]}`}>{dc.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="text-sm font-medium mb-1">{dc.title}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${impactColors[dc.impactLevel]}`}>
                        {dc.impactLevel} impact
                      </span>
                      <span className="text-xs text-muted-foreground">{dc.changeType.replace(/_/g, " ")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Re-tests: <span className="font-medium text-orange-600">{dc.rereqTests.length}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">By: {dc.submittedBy} · {dc.submittedDate}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Change Detail */}
            <div className="lg:col-span-2">
              {selectedChange ? (
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-mono text-primary">{selectedChange.dcr}</CardTitle>
                        <CardDescription className="text-sm font-medium text-foreground mt-1">{selectedChange.title}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`text-xs ${statusColors[selectedChange.status]}`}>{selectedChange.status.replace(/_/g, " ")}</Badge>
                        <Badge className={`text-xs ${impactColors[selectedChange.impactLevel]}`}>{selectedChange.impactLevel} impact</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">DESCRIPTION</div>
                      <p className="text-sm">{selectedChange.description}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">JUSTIFICATION</div>
                      <p className="text-sm">{selectedChange.justification}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-2">AFFECTED TESTS</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedChange.affectedTests.map(t => (
                            <span key={t} className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded font-mono">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-2">RE-REQUIRED TESTS</div>
                        <div className="space-y-1">
                          {selectedChange.rereqTests.map(t => (
                            <div key={t} className="flex items-center gap-1 text-xs text-red-700">
                              <ArrowRight className="h-3 w-3 shrink-0" />
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">AFFECTED BOM ITEMS</div>
                      <div className="space-y-1">
                        {selectedChange.bomItems.map(bomId => {
                          const bom = MOCK_BOM.find(b => b.id === bomId)
                          return bom ? (
                            <div key={bomId} className="flex items-center gap-2 text-xs p-2 rounded bg-muted">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono font-medium">{bom.partNumber}</span>
                              <span className="text-muted-foreground">{bom.description}</span>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground border-t pt-3">
                      Submitted by <strong>{selectedChange.submittedBy}</strong> on {selectedChange.submittedDate}
                      {selectedChange.approvedDate && <> · Approved {selectedChange.approvedDate}</>}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <GitBranch className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Select a design change to view details</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── TEST PLAN MATRIX TAB ─────────────────────────────────── */}
        <TabsContent value="testplan" className="space-y-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              Test matrix for IEC 62915 change validation — {testStats.total} tests, {testStats.totalSamples} samples
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Test
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-20">Code</TableHead>
                  <TableHead className="text-xs">Test Name</TableHead>
                  <TableHead className="text-xs w-24">Standard</TableHead>
                  <TableHead className="text-xs w-16">Samples</TableHead>
                  <TableHead className="text-xs w-16">Duration</TableHead>
                  <TableHead className="text-xs w-24">Start</TableHead>
                  <TableHead className="text-xs w-24">End</TableHead>
                  <TableHead className="text-xs w-24">Status</TableHead>
                  <TableHead className="text-xs w-24">DCR Link</TableHead>
                  <TableHead className="text-xs w-28">Technician</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TEST_PLAN.map(tp => (
                  <TableRow key={tp.id} className="hover:bg-muted/50">
                    <TableCell className="text-xs font-mono font-bold text-primary">{tp.testCode}</TableCell>
                    <TableCell className="text-xs font-medium">{tp.testName}</TableCell>
                    <TableCell>
                      <Badge className="text-xs bg-blue-50 text-blue-700">{tp.standard}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center font-mono">{tp.sampleCount}</TableCell>
                    <TableCell className="text-xs text-center font-mono">{tp.durationDays}d</TableCell>
                    <TableCell className="text-xs font-mono">{tp.startDate}</TableCell>
                    <TableCell className="text-xs font-mono">{tp.endDate}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColors[tp.status]}`}>
                        {tp.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tp.linkedDCR && (
                        <span className="text-xs font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{tp.linkedDCR}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{tp.technician.split(" ")[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Test Plan Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Planned", value: testStats.planned, color: "bg-blue-100 text-blue-700" },
              { label: "In Progress", value: testStats.inProgress, color: "bg-amber-100 text-amber-700" },
              { label: "Completed", value: testStats.completed, color: "bg-green-100 text-green-700" },
              { label: "Total Samples", value: testStats.totalSamples, color: "bg-gray-100 text-gray-700" },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <div className={`text-2xl font-bold px-3 py-1 rounded ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── PROJECT SCHEDULER (GANTT) TAB ────────────────────────── */}
        <TabsContent value="scheduler" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">IEC 62915 Certification Project Schedule</h2>
              <p className="text-xs text-muted-foreground">Mar 1 – May 31, 2026 · {totalDays} days</p>
            </div>
            <div className="flex gap-3 text-xs">
              {[
                { color: "bg-blue-500", label: "Phase" },
                { color: "bg-amber-400", label: "In Progress" },
                { color: "bg-gray-300", label: "Not Started" },
                { color: "bg-green-500", label: "Completed" },
                { color: "bg-purple-500", label: "Milestone" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Month Headers */}
          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Month row */}
                <div className="flex mb-1">
                  <div className="w-60 shrink-0 text-xs text-muted-foreground pr-2">Task</div>
                  <div className="flex-1 relative">
                    <div className="flex text-xs text-muted-foreground">
                      {["Mar", "Apr", "May"].map((m, i) => (
                        <div key={m} className="flex-1 border-l border-border pl-1">{m} 2026</div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gantt Rows */}
                <div className="space-y-1">
                  {GANTT_TASKS.map(task => {
                    const barStyle = getBarStyle(task.startDate, task.endDate)
                    const barColor = task.type === "milestone"
                      ? "bg-purple-500"
                      : task.status === "completed" ? "bg-green-500"
                      : task.status === "in_progress" ? "bg-amber-400"
                      : task.type === "phase" ? "bg-blue-400 opacity-60"
                      : "bg-gray-300"

                    return (
                      <div key={task.id} className="flex items-center gap-2 h-7">
                        <div className={`w-60 shrink-0 flex items-center gap-1 pr-2 ${task.type === "phase" ? "font-semibold" : task.type === "milestone" ? "text-purple-700" : ""}`}>
                          {task.type === "milestone" && <Target className="h-3 w-3 text-purple-500 shrink-0" />}
                          {task.type === "phase" && <Activity className="h-3 w-3 text-blue-500 shrink-0" />}
                          {task.type === "test" && <Wrench className="h-3 w-3 text-gray-400 shrink-0" />}
                          <span className={`text-xs truncate ${task.type === "phase" ? "text-blue-700" : "text-foreground"}`}>{task.name}</span>
                        </div>
                        <div className="flex-1 relative h-5 bg-muted rounded">
                          <div
                            className={`absolute h-full rounded ${barColor} ${task.type === "milestone" ? "w-2 h-2 rotate-45 top-1.5" : ""}`}
                            style={task.type === "milestone" ? { left: barStyle.left } : barStyle}
                          >
                            {task.type !== "milestone" && task.progress > 0 && (
                              <div
                                className="h-full rounded bg-black/20"
                                style={{ width: `${task.progress}%` }}
                              />
                            )}
                          </div>
                          {task.type !== "milestone" && (
                            <span className="absolute right-1 top-0.5 text-xs text-muted-foreground/60">
                              {task.startDate.slice(5)} – {task.endDate.slice(5)}
                            </span>
                          )}
                        </div>
                        <div className="w-16 shrink-0 text-right">
                          <Badge className={`text-xs ${statusColors[task.status]}`}>
                            {task.status === "not_started" ? "–" : `${task.progress}%`}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {GANTT_TASKS.filter(t => t.status === "completed").map(t => (
                  <div key={t.id} className="flex items-center gap-2 py-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                    <span className="text-xs">{t.name}</span>
                  </div>
                ))}
                {GANTT_TASKS.filter(t => t.status === "completed").length === 0 && (
                  <p className="text-xs text-muted-foreground">No completed tasks yet</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {GANTT_TASKS.filter(t => t.status === "in_progress").map(t => (
                  <div key={t.id} className="flex items-center gap-2 py-1">
                    <div className="w-3 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-xs">{t.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{t.progress}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {GANTT_TASKS.filter(t => t.type === "milestone" && t.status !== "completed").map(t => (
                  <div key={t.id} className="flex items-center gap-2 py-1">
                    <Target className="h-3 w-3 text-purple-500 shrink-0" />
                    <span className="text-xs">{t.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{t.startDate.slice(5)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
