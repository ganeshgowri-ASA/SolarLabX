// @ts-nocheck
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { IVCurveComparisonChart } from "@/components/reports/IVCurveComparisonChart"
import { PmaxStabilizationChart, PowerDegradationChart, DEFAULT_STABILIZATION_DATA, DEFAULT_DEGRADATION_DATA, DEFAULT_SAMPLE_IDS } from "@/components/reports/ReportSummaryCharts"

/* ───────────────────────────── sample data ───────────────────────────── */

const project = {
  number: "CERT-2026-0147",
  title: "Type Approval Certification – SolarTech ST-500M",
  client: {
    name: "SolarTech Energy Pvt. Ltd.",
    address: "Plot 42, Solar Park SEZ, Bengaluru 560100, India",
    contact: "Mr. Arvind Kulkarni",
    email: "arvind.k@solartech-energy.in",
    phone: "+91-80-4567-8901",
  },
  module: {
    model: "ST-500M",
    type: "Mono-crystalline PERC Half-cut",
    power: "500 Wp",
    cells: "144 (6 × 24) half-cut",
    dimensions: "2278 × 1134 × 35 mm",
    weight: "27.5 kg",
    junction: "IP68, 3 bypass diodes",
    connector: "MC4-EVO2",
    glass: "3.2 mm tempered, AR coated",
    backsheet: "Multi-layer PPE",
    frame: "Anodized aluminium 40 mm",
  },
  standards: [
    "IEC 61215-1:2021",
    "IEC 61215-1-1:2021",
    "IEC 61215-2:2021",
    "IEC 61730-1:2023",
    "IEC 61730-2:2023",
    "IEC 61853-1:2011",
    "IEC 61853-2:2016",
    "IEC 61701:2020",
  ],
  dateReceived: "2026-01-12",
  dateStarted: "2026-01-20",
  dateTarget: "2026-06-30",
  status: "In Progress",
  docFormatNo: "SLX/RF/TR-001",
  recordNo: "SLX/REC/2026/0147",
  revision: "Rev 02",
  pageCount: "1 of 1",
  issueDate: "2026-01-20",
  reviewDate: "2027-01-20",
}

/* ────── Gantt schedule ────── */

const ganttStart = new Date("2026-01-20")
const ganttEnd = new Date("2026-06-30")
const totalDays = Math.ceil((ganttEnd.getTime() - ganttStart.getTime()) / 86400000)

interface GanttTask {
  id: string
  label: string
  standard: string
  start: string
  end: string
  color: string
}

const ganttTasks: GanttTask[] = [
  // IEC 61215
  { id: "g1", label: "Visual Inspection (MQT 01)", standard: "IEC 61215", start: "2026-01-20", end: "2026-01-25", color: "bg-blue-500" },
  { id: "g2", label: "STC Performance (MQT 02)", standard: "IEC 61215", start: "2026-01-26", end: "2026-02-05", color: "bg-blue-500" },
  { id: "g3", label: "Insulation Resistance (MQT 03)", standard: "IEC 61215", start: "2026-02-06", end: "2026-02-12", color: "bg-blue-500" },
  { id: "g4", label: "Temperature Coefficients (MQT 04)", standard: "IEC 61215", start: "2026-02-06", end: "2026-02-20", color: "bg-blue-500" },
  { id: "g5", label: "NOCT Determination (MQT 05)", standard: "IEC 61215", start: "2026-02-21", end: "2026-03-05", color: "bg-blue-500" },
  { id: "g6", label: "UV Preconditioning (MQT 10)", standard: "IEC 61215", start: "2026-03-06", end: "2026-03-25", color: "bg-blue-400" },
  { id: "g7", label: "Thermal Cycling 200 (MQT 11)", standard: "IEC 61215", start: "2026-03-26", end: "2026-05-01", color: "bg-blue-400" },
  { id: "g8", label: "Humidity Freeze (MQT 12)", standard: "IEC 61215", start: "2026-05-02", end: "2026-05-16", color: "bg-blue-400" },
  { id: "g9", label: "Damp Heat 1000h (MQT 13)", standard: "IEC 61215", start: "2026-03-26", end: "2026-05-16", color: "bg-blue-400" },
  { id: "g10", label: "Mechanical Load (MQT 16)", standard: "IEC 61215", start: "2026-02-13", end: "2026-02-20", color: "bg-blue-600" },
  { id: "g11", label: "Hail Test (MQT 17)", standard: "IEC 61215", start: "2026-02-21", end: "2026-02-25", color: "bg-blue-600" },
  { id: "g12", label: "Hotspot Test (MQT 09)", standard: "IEC 61215", start: "2026-02-26", end: "2026-03-05", color: "bg-blue-600" },
  // IEC 61730
  { id: "g13", label: "Accessibility Test (MST 11)", standard: "IEC 61730", start: "2026-01-26", end: "2026-02-02", color: "bg-emerald-500" },
  { id: "g14", label: "Cut Susceptibility (MST 12)", standard: "IEC 61730", start: "2026-02-03", end: "2026-02-08", color: "bg-emerald-500" },
  { id: "g15", label: "Impulse Voltage (MST 14)", standard: "IEC 61730", start: "2026-05-17", end: "2026-05-24", color: "bg-emerald-500" },
  { id: "g16", label: "Dielectric Withstand (MST 16)", standard: "IEC 61730", start: "2026-05-25", end: "2026-06-01", color: "bg-emerald-500" },
  { id: "g17", label: "Wet Leakage (MST 17)", standard: "IEC 61730", start: "2026-06-02", end: "2026-06-08", color: "bg-emerald-600" },
  { id: "g18", label: "Fire Test (MST 24)", standard: "IEC 61730", start: "2026-06-09", end: "2026-06-15", color: "bg-emerald-600" },
  // IEC 61853
  { id: "g19", label: "Energy Rating Matrix", standard: "IEC 61853", start: "2026-02-21", end: "2026-03-15", color: "bg-amber-500" },
  { id: "g20", label: "NMOT Determination", standard: "IEC 61853", start: "2026-03-16", end: "2026-03-25", color: "bg-amber-500" },
  { id: "g21", label: "Spectral Response", standard: "IEC 61853", start: "2026-03-16", end: "2026-03-28", color: "bg-amber-400" },
  // IEC 61701
  { id: "g22", label: "Salt Mist Corrosion – Severity 6", standard: "IEC 61701", start: "2026-05-17", end: "2026-06-20", color: "bg-rose-500" },
  // Final
  { id: "g23", label: "Final Performance & Report", standard: "IEC 61215", start: "2026-06-15", end: "2026-06-30", color: "bg-violet-500" },
]

/* ────── Pass/Fail matrix ────── */

type TestStatus = "PASS" | "FAIL" | "PENDING" | "IN PROGRESS" | "N/A"

interface MatrixRow {
  standard: string
  clauses: { name: string; status: TestStatus }[]
}

const passFailMatrix: MatrixRow[] = [
  {
    standard: "IEC 61215",
    clauses: [
      { name: "MQT 01\nVisual", status: "PASS" },
      { name: "MQT 02\nSTC", status: "PASS" },
      { name: "MQT 03\nInsulation", status: "PASS" },
      { name: "MQT 04\nTemp Coeff", status: "PASS" },
      { name: "MQT 05\nNOCT", status: "IN PROGRESS" },
      { name: "MQT 09\nHotspot", status: "PENDING" },
      { name: "MQT 10\nUV Pre", status: "PENDING" },
      { name: "MQT 11\nTC200", status: "PENDING" },
      { name: "MQT 12\nHF10", status: "PENDING" },
      { name: "MQT 13\nDH1000", status: "PENDING" },
      { name: "MQT 16\nMech Load", status: "PASS" },
      { name: "MQT 17\nHail", status: "PASS" },
    ],
  },
  {
    standard: "IEC 61730",
    clauses: [
      { name: "MST 11\nAccess", status: "PASS" },
      { name: "MST 12\nCut Susc.", status: "PASS" },
      { name: "MST 14\nImpulse V", status: "PENDING" },
      { name: "MST 16\nDielectric", status: "PENDING" },
      { name: "MST 17\nWet Leak", status: "PENDING" },
      { name: "MST 24\nFire", status: "PENDING" },
      { name: "MST 25\nBypass", status: "PASS" },
      { name: "MST 26\nReverse", status: "PASS" },
      { name: "MST 34\nContinuity", status: "PASS" },
      { name: "MST 42\nLabelling", status: "PASS" },
      { name: "MST 51\nConstr.", status: "PASS" },
      { name: "MST 52\nThick.", status: "PASS" },
    ],
  },
  {
    standard: "IEC 61853",
    clauses: [
      { name: "Clause 7\nI-V Matrix", status: "PENDING" },
      { name: "Clause 8\nNMOT", status: "PENDING" },
      { name: "Clause 9\nSpectral", status: "PENDING" },
      { name: "Clause 10\nAngle Inc.", status: "PENDING" },
      { name: "Clause 11\nLow Irr.", status: "PENDING" },
      { name: "Part 2\nEnergy", status: "PENDING" },
    ],
  },
  {
    standard: "IEC 61701",
    clauses: [
      { name: "Cl 5\nSalt Mist 6", status: "PENDING" },
      { name: "Cl 6\nPost Exp.", status: "PENDING" },
      { name: "Cl 7\nWet Leak", status: "PENDING" },
    ],
  },
]

/* ────── Sample allocation ────── */

interface SampleRow {
  sampleIds: string
  sequence: string
  tests: string
  standard: string
  status: string
}

const sampleAllocation: SampleRow[] = [
  { sampleIds: "SM-001, SM-002", sequence: "Seq A – Design Qual", tests: "MQT 01-05, 10, 11, 12, 02, 03", standard: "IEC 61215", status: "In Progress" },
  { sampleIds: "SM-003, SM-004", sequence: "Seq B – Design Qual", tests: "MQT 01-05, 10, 13, 02, 03", standard: "IEC 61215", status: "In Progress" },
  { sampleIds: "SM-005, SM-006", sequence: "Seq C – Mechanical", tests: "MQT 01, 02, 16, 17, 09, 02, 03", standard: "IEC 61215", status: "Completed" },
  { sampleIds: "SM-007, SM-008", sequence: "Seq D – Safety", tests: "MST 11-17, 24-26, 34, 42, 51, 52", standard: "IEC 61730", status: "In Progress" },
  { sampleIds: "SM-009", sequence: "Seq E – Energy Rating", tests: "I-V matrix, NMOT, Spectral, Angle", standard: "IEC 61853", status: "Pending" },
  { sampleIds: "SM-010, SM-011", sequence: "Seq F – Salt Mist", tests: "Salt mist severity 6, post-exposure", standard: "IEC 61701", status: "Pending" },
  { sampleIds: "SM-012", sequence: "Seq G – Spare / Control", tests: "STC reference measurements", standard: "All", status: "Active" },
]

/* ────── Equipment ────── */

interface Equipment {
  name: string
  id: string
  calDue: string
  allocation: string
  utilization: number
}

const equipment: Equipment[] = [
  { name: "Pasan IIIc Sun Simulator", id: "EQ-SS-001", calDue: "2026-09-15", allocation: "STC & performance testing", utilization: 85 },
  { name: "Espec PV-3000 Env. Chamber", id: "EQ-EC-001", calDue: "2026-07-22", allocation: "DH 1000h (Seq B)", utilization: 92 },
  { name: "Espec TSA-302 Thermal Cycling", id: "EQ-TC-001", calDue: "2026-08-10", allocation: "TC 200 (Seq A)", utilization: 88 },
  { name: "Atlas UVTest Chamber", id: "EQ-UV-001", calDue: "2026-11-05", allocation: "UV Preconditioning", utilization: 65 },
  { name: "Instron 5985 Mech Load", id: "EQ-ML-001", calDue: "2026-06-30", allocation: "MQT 16 Mechanical Load", utilization: 40 },
  { name: "Hail Impact Tester", id: "EQ-HI-001", calDue: "2026-12-01", allocation: "MQT 17 Hail", utilization: 15 },
  { name: "Ascott S450iP Salt Spray", id: "EQ-SM-001", calDue: "2026-10-18", allocation: "IEC 61701 Salt Mist", utilization: 0 },
  { name: "Megger MIT515 Insulation Tester", id: "EQ-IT-001", calDue: "2026-05-20", allocation: "Insulation & wet leakage", utilization: 55 },
  { name: "Chroma 19032 Hipot Tester", id: "EQ-DW-001", calDue: "2026-08-28", allocation: "Dielectric withstand / impulse", utilization: 30 },
  { name: "EL Imaging System (Greateyes)", id: "EQ-EL-001", calDue: "2027-01-10", allocation: "Pre/post EL imaging all sequences", utilization: 78 },
]

/* ────── Signatures ────── */

const signatures = [
  { role: "Project Engineer", name: "Mr. Raghav Menon", date: "2026-01-20", signed: true },
  { role: "Technical Manager", name: "Dr. Priya Sharma", date: "2026-01-22", signed: true },
  { role: "Quality Assurance Manager", name: "Mr. Deepak Verma", date: "", signed: false },
  { role: "Laboratory Director", name: "Dr. Suresh Nair", date: "", signed: false },
]

/* ──────────────────────────── helpers ──────────────────────────── */

function statusBadge(status: TestStatus) {
  const map: Record<TestStatus, string> = {
    PASS: "bg-green-100 text-green-800 border-green-300",
    FAIL: "bg-red-100 text-red-800 border-red-300",
    PENDING: "bg-gray-100 text-gray-600 border-gray-300",
    "IN PROGRESS": "bg-blue-100 text-blue-800 border-blue-300",
    "N/A": "bg-gray-50 text-gray-400 border-gray-200",
  }
  return map[status] ?? "bg-gray-100 text-gray-600 border-gray-300"
}

function barLeft(dateStr: string) {
  const d = new Date(dateStr)
  const offset = Math.max(0, (d.getTime() - ganttStart.getTime()) / 86400000)
  return (offset / totalDays) * 100
}

function barWidth(startStr: string, endStr: string) {
  const s = new Date(startStr)
  const e = new Date(endStr)
  const dur = Math.max(1, (e.getTime() - s.getTime()) / 86400000)
  return (dur / totalDays) * 100
}

function utilizationColor(pct: number) {
  if (pct >= 80) return "bg-red-500"
  if (pct >= 50) return "bg-amber-500"
  return "bg-green-500"
}

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */

export default function CertificationProjectReportPage() {
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null)

  const handleExport = (format: string) => {
    if (format === "PDF") {
      window.print()
    } else {
      toast.success(`${format} export initiated`, {
        description: `Certification project report will be exported as ${format}. Please wait...`,
      })
    }
  }

  /* ─── month markers for Gantt ─── */
  const months: { label: string; left: number }[] = []
  const cursor = new Date(ganttStart)
  cursor.setDate(1)
  if (cursor < ganttStart) cursor.setMonth(cursor.getMonth() + 1)
  while (cursor <= ganttEnd) {
    const offset = (cursor.getTime() - ganttStart.getTime()) / 86400000
    months.push({
      label: cursor.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      left: (offset / totalDays) * 100,
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  /* ─── group gantt tasks by standard ─── */
  const ganttGroups: Record<string, GanttTask[]> = {}
  for (const t of ganttTasks) {
    if (!ganttGroups[t.standard]) ganttGroups[t.standard] = []
    ganttGroups[t.standard].push(t)
  }

  /* ─── counts ─── */
  const allClauses = passFailMatrix.flatMap((r) => r.clauses)
  const passCount = allClauses.filter((c) => c.status === "PASS").length
  const failCount = allClauses.filter((c) => c.status === "FAIL").length
  const pendingCount = allClauses.filter((c) => c.status === "PENDING").length
  const inProgressCount = allClauses.filter((c) => c.status === "IN PROGRESS").length

  return (
    <>
      {/* ── print styles ── */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #cert-report, #cert-report * { visibility: visible; }
          #cert-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          @page { margin: 15mm; size: A4 landscape; }
          .shadow-sm, .shadow, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .border { border-color: #d1d5db !important; }
        }
      `}</style>

      <div id="cert-report" className="space-y-6 pb-12">
        {/* ═══════ ISO 17025 DOCUMENT HEADER ═══════ */}
        <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 text-sm">
            {/* Logo / Lab name block */}
            <div className="col-span-3 border-r-2 border-b-2 border-gray-800 p-3 flex flex-col justify-center items-center bg-gray-50">
              <div className="text-lg font-bold text-gray-900 tracking-wide">SolarLabX</div>
              <div className="text-[10px] text-gray-500 mt-0.5">NABL Accredited Testing Laboratory</div>
              <div className="text-[10px] text-gray-500">Accreditation No. T-XXXX</div>
            </div>
            {/* Title block */}
            <div className="col-span-6 border-r-2 border-b-2 border-gray-800 p-3 flex flex-col justify-center items-center">
              <div className="text-base font-bold text-gray-900 text-center">CERTIFICATION PROJECT REPORT</div>
              <div className="text-xs text-gray-600 mt-0.5 text-center">
                Photovoltaic Module Type Approval Testing
              </div>
            </div>
            {/* Doc control block */}
            <div className="col-span-3 border-b-2 border-gray-800 p-2 text-xs space-y-0.5 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-gray-500">Doc Format No:</span>
                <span className="font-medium">{project.docFormatNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Record No:</span>
                <span className="font-medium">{project.recordNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Revision:</span>
                <span className="font-medium">{project.revision}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Page:</span>
                <span className="font-medium">{project.pageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Issue Date:</span>
                <span className="font-medium">{project.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Review Date:</span>
                <span className="font-medium">{project.reviewDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ PAGE HEADING ═══════ */}
        <div className="no-print">
          <h1 className="text-2xl font-bold text-gray-900">Certification Project Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete project overview for PV module type-approval certification covering IEC 61215, 61730, 61853 &amp; 61701
          </p>
        </div>

        {/* ═══════ 1. PROJECT OVERVIEW ═══════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>1. Project Overview</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
                {project.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Client Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                  <div><span className="text-gray-500 w-20 inline-block">Client:</span> <span className="font-medium">{project.client.name}</span></div>
                  <div><span className="text-gray-500 w-20 inline-block">Contact:</span> {project.client.contact}</div>
                  <div><span className="text-gray-500 w-20 inline-block">Email:</span> {project.client.email}</div>
                  <div><span className="text-gray-500 w-20 inline-block">Phone:</span> {project.client.phone}</div>
                  <div className="text-xs text-gray-400 pt-1">{project.client.address}</div>
                </div>
              </div>

              {/* Module Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Module Under Test</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                  <div><span className="text-gray-500">Model:</span> <span className="font-semibold">{project.module.model}</span></div>
                  <div><span className="text-gray-500">Type:</span> {project.module.type}</div>
                  <div><span className="text-gray-500">Rated Power:</span> {project.module.power}</div>
                  <div><span className="text-gray-500">Cells:</span> {project.module.cells}</div>
                  <div><span className="text-gray-500">Dimensions:</span> {project.module.dimensions}</div>
                  <div><span className="text-gray-500">Weight:</span> {project.module.weight}</div>
                  <div><span className="text-gray-500">Glass:</span> {project.module.glass}</div>
                  <div><span className="text-gray-500">Frame:</span> {project.module.frame}</div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Project Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                  <div><span className="text-gray-500">Project No:</span> <span className="font-bold text-gray-900">{project.number}</span></div>
                  <div><span className="text-gray-500">Date Received:</span> {project.dateReceived}</div>
                  <div><span className="text-gray-500">Date Started:</span> {project.dateStarted}</div>
                  <div><span className="text-gray-500">Target Completion:</span> {project.dateTarget}</div>
                  <div className="pt-2">
                    <span className="text-gray-500 block mb-1">Standards Scope:</span>
                    <div className="flex flex-wrap gap-1">
                      {project.standards.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] font-normal">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════ 2. TEST SCHEDULE / GANTT CHART ═══════ */}
        <Card className="print-break">
          <CardHeader className="pb-3">
            <CardTitle>2. Test Schedule – Gantt Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Month header */}
                <div className="relative h-7 border-b border-gray-200 mb-1">
                  {months.map((m) => (
                    <div
                      key={m.label}
                      className="absolute top-0 text-[10px] font-medium text-gray-500 border-l border-gray-300 pl-1"
                      style={{ left: `${Math.max(0, m.left)}%` }}
                    >
                      {m.label}
                    </div>
                  ))}
                </div>

                {/* Task rows grouped by standard */}
                {Object.entries(ganttGroups).map(([std, tasks]) => (
                  <div key={std} className="mb-3">
                    <div className="text-[11px] font-semibold text-gray-700 mb-1 pl-1">{std}</div>
                    {tasks.map((task) => (
                      <div key={task.id} className="relative h-7 mb-0.5">
                        {/* grid lines */}
                        {months.map((m) => (
                          <div
                            key={m.label}
                            className="absolute top-0 h-full border-l border-gray-100"
                            style={{ left: `${m.left}%` }}
                          />
                        ))}
                        {/* bar */}
                        <div
                          className={`absolute top-1 h-5 rounded ${task.color} opacity-90 flex items-center overflow-hidden`}
                          style={{
                            left: `${barLeft(task.start)}%`,
                            width: `${Math.max(barWidth(task.start, task.end), 1.5)}%`,
                          }}
                          title={`${task.label}: ${task.start} → ${task.end}`}
                        >
                          <span className="text-[9px] text-white font-medium truncate px-1.5 whitespace-nowrap">
                            {task.label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-500" /> IEC 61215</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500" /> IEC 61730</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500" /> IEC 61853</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-rose-500" /> IEC 61701</span>
                  <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-violet-500" /> Final / Reporting</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════ 3. PASS/FAIL MATRIX ═══════ */}
        <Card className="print-break">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>3. Pass / Fail Matrix</span>
              <div className="flex gap-3 text-xs font-normal">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" /> Pass: {passCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" /> Fail: {failCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" /> In Progress: {inProgressCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" /> Pending: {pendingCount}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 bg-gray-50 border border-gray-200 font-semibold min-w-[100px]">Standard</th>
                    {/* Dynamic column headers per row rendered inline */}
                  </tr>
                </thead>
                <tbody>
                  {passFailMatrix.map((row) => (
                    <tr key={row.standard}>
                      <td className="p-2 border border-gray-200 font-semibold bg-gray-50 align-top whitespace-nowrap">
                        {row.standard}
                      </td>
                      {row.clauses.map((cl, i) => (
                        <td key={i} className="p-1.5 border border-gray-200 text-center align-top min-w-[75px]">
                          <div className="text-[10px] text-gray-500 whitespace-pre-line leading-tight mb-1">{cl.name}</div>
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${statusBadge(cl.status)}`}
                          >
                            {cl.status}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ═══════ 4. SAMPLE ALLOCATION ═══════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>4. Sample Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Sample IDs</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Test Sequence</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Tests Included</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Standard</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleAllocation.map((s, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="p-2.5 border border-gray-200 font-medium whitespace-nowrap">{s.sampleIds}</td>
                      <td className="p-2.5 border border-gray-200">{s.sequence}</td>
                      <td className="p-2.5 border border-gray-200 text-xs text-gray-600">{s.tests}</td>
                      <td className="p-2.5 border border-gray-200">
                        <Badge variant="outline" className="text-[10px]">{s.standard}</Badge>
                      </td>
                      <td className="p-2.5 border border-gray-200">
                        <Badge
                          variant="outline"
                          className={
                            s.status === "Completed"
                              ? "bg-green-50 text-green-700 border-green-200 text-[10px]"
                              : s.status === "In Progress"
                              ? "bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                              : s.status === "Active"
                              ? "bg-violet-50 text-violet-700 border-violet-200 text-[10px]"
                              : "bg-gray-50 text-gray-600 border-gray-200 text-[10px]"
                          }
                        >
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Total samples: 12 modules (SM-001 through SM-012) &middot; Includes 1 control/spare module
            </div>
          </CardContent>
        </Card>

        {/* ═══════ 5. PERFORMANCE CHARACTERIZATION ═══════ */}
        <Card className="print-break">
          <CardHeader className="pb-3">
            <CardTitle>5. Performance Characterization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <IVCurveComparisonChart
              preParams={{ voc: 49.8, isc: 13.25, vmp: 41.7, imp: 12.00, pmax: 500, ff: 0.756 }}
              postParams={{ voc: 49.5, isc: 13.18, vmp: 41.4, imp: 11.92, pmax: 493.5, ff: 0.757 }}
              title="Certification Project – I-V Curve Comparison"
              height={260}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PmaxStabilizationChart
                data={DEFAULT_STABILIZATION_DATA}
                sampleIds={DEFAULT_SAMPLE_IDS}
                ratedPmax={500}
                height={200}
              />
              <PowerDegradationChart
                data={DEFAULT_DEGRADATION_DATA}
                sampleIds={DEFAULT_SAMPLE_IDS}
                height={200}
              />
            </div>
          </CardContent>
        </Card>

        {/* ═══════ 6. EQUIPMENT UTILIZATION ═══════ */}
        <Card className="print-break">
          <CardHeader className="pb-3">
            <CardTitle>5. Equipment Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Equipment</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Asset ID</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Cal. Due</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold">Allocation</th>
                    <th className="text-left p-2.5 border border-gray-200 font-semibold min-w-[180px]">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((eq, idx) => (
                    <tr key={eq.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="p-2.5 border border-gray-200 font-medium">{eq.name}</td>
                      <td className="p-2.5 border border-gray-200 font-mono text-xs">{eq.id}</td>
                      <td className="p-2.5 border border-gray-200 text-xs">{eq.calDue}</td>
                      <td className="p-2.5 border border-gray-200 text-xs text-gray-600">{eq.allocation}</td>
                      <td className="p-2.5 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${utilizationColor(eq.utilization)} transition-all`}
                              style={{ width: `${eq.utilization}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{eq.utilization}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ═══════ 7. PROJECT SIGN-OFF ═══════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>6. Project Sign-off</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {signatures.map((sig) => (
                <div
                  key={sig.role}
                  className={`border rounded-lg p-4 ${sig.signed ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-gray-50/30"}`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{sig.role}</div>
                  <div className="h-16 border-b-2 border-dashed border-gray-300 flex items-end justify-center pb-1 mb-2">
                    {sig.signed ? (
                      <span className="text-lg font-serif italic text-gray-700">{sig.name.split(" ").pop()}</span>
                    ) : (
                      <span className="text-xs text-gray-300">Signature pending</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-700">{sig.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {sig.signed ? `Signed: ${sig.date}` : "Date: _______________"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <strong>Note:</strong> This report requires sign-off from all four authorities before it can be issued as a final certification project summary. QA Manager and Laboratory Director signatures are pending completion of all test sequences.
            </div>
          </CardContent>
        </Card>

        {/* ═══════ 6. COMBINED EXPORT ═══════ */}
        <div className="no-print flex flex-wrap items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="text-sm font-medium text-gray-700 mr-2">Export Report:</span>
          <Button variant="outline" size="sm" onClick={() => handleExport("PDF")}>
            PDF (Print)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("Word (.docx)")}>
            Word
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("Excel (.xlsx)")}>
            Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("CSV")}>
            CSV
          </Button>
          <div className="flex-1" />
          <span className="text-[10px] text-gray-400">
            {project.docFormatNo} &middot; {project.revision} &middot; Generated {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </>
  )
}
