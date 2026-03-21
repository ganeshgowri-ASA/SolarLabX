// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Search, Download, TrendingUp, FlaskConical, Repeat2, EyeOff, GitCompareArrows,
  CheckCircle2, XCircle, AlertTriangle, BarChart3
} from "lucide-react"

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function zScoreColor(z: number) {
  const abs = Math.abs(z)
  if (abs <= 2) return "bg-green-100 text-green-700"
  if (abs <= 3) return "bg-yellow-100 text-yellow-700"
  return "bg-red-100 text-red-700"
}

function zScoreLabel(z: number) {
  const abs = Math.abs(z)
  if (abs <= 2) return "Satisfactory"
  if (abs <= 3) return "Questionable"
  return "Unsatisfactory"
}

function enScoreColor(en: number) {
  const abs = Math.abs(en)
  if (abs <= 1) return "bg-green-100 text-green-700"
  return "bg-red-100 text-red-700"
}

function passFail(pass: boolean) {
  return pass
    ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> Pass</span>
    : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700"><XCircle className="h-3 w-3" /> Fail</span>
}

// Simple sparkline-like bar chart
function MiniBar({ values, colorFn }: { values: number[]; colorFn: (v: number) => string }) {
  const max = Math.max(...values.map(Math.abs), 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div key={i} className={`w-3 rounded-t ${colorFn(v)}`}
          style={{ height: `${Math.max((Math.abs(v) / max) * 100, 8)}%` }}
          title={v.toFixed(2)} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PT ANALYSIS SUB-TAB
// ═══════════════════════════════════════════════════════════════════════════════

interface PTRecord {
  id: string; round: string; testType: string; parameter: string
  assignedValue: number; labValue: number; stdDev: number; unit: string
  labUncertainty: number; refUncertainty: number
}

const PT_DATA: PTRecord[] = [
  { id: "PT-2025-01", round: "NABL PT Round 14", testType: "IV", parameter: "Pmax", assignedValue: 345.2, labValue: 344.8, stdDev: 1.5, unit: "W", labUncertainty: 1.2, refUncertainty: 0.8 },
  { id: "PT-2025-02", round: "NABL PT Round 14", testType: "IV", parameter: "Isc", assignedValue: 9.85, labValue: 9.82, stdDev: 0.05, unit: "A", labUncertainty: 0.04, refUncertainty: 0.03 },
  { id: "PT-2025-03", round: "NABL PT Round 14", testType: "IV", parameter: "Voc", assignedValue: 46.2, labValue: 46.35, stdDev: 0.15, unit: "V", labUncertainty: 0.12, refUncertainty: 0.08 },
  { id: "PT-2025-04", round: "NABL PT Round 14", testType: "INS", parameter: "Insulation Resistance", assignedValue: 500, labValue: 495, stdDev: 12, unit: "MΩ", labUncertainty: 8, refUncertainty: 5 },
  { id: "PT-2025-05", round: "NABL PT Round 13", testType: "WLT", parameter: "Leakage Current", assignedValue: 15.0, labValue: 14.2, stdDev: 0.8, unit: "μA", labUncertainty: 0.6, refUncertainty: 0.4 },
  { id: "PT-2025-06", round: "NABL PT Round 13", testType: "TT", parameter: "Temperature Coefficient (Pmax)", assignedValue: -0.38, labValue: -0.41, stdDev: 0.02, unit: "%/°C", labUncertainty: 0.015, refUncertainty: 0.01 },
  { id: "PT-2025-07", round: "NABL PT Round 13", testType: "EL", parameter: "Crack Detection Rate", assignedValue: 95.0, labValue: 93.5, stdDev: 2.0, unit: "%", labUncertainty: 1.5, refUncertainty: 1.0 },
  { id: "PT-2025-08", round: "NABL PT Round 12", testType: "IV", parameter: "Pmax", assignedValue: 340.0, labValue: 341.5, stdDev: 1.8, unit: "W", labUncertainty: 1.3, refUncertainty: 0.9 },
  { id: "PT-2025-09", round: "NABL PT Round 12", testType: "INS", parameter: "Insulation Resistance", assignedValue: 520, labValue: 530, stdDev: 15, unit: "MΩ", labUncertainty: 10, refUncertainty: 6 },
  { id: "PT-2025-10", round: "NABL PT Round 12", testType: "IV", parameter: "Fill Factor", assignedValue: 76.5, labValue: 76.8, stdDev: 0.4, unit: "%", labUncertainty: 0.3, refUncertainty: 0.2 },
]

function calcZ(rec: PTRecord) { return (rec.labValue - rec.assignedValue) / rec.stdDev }
function calcEn(rec: PTRecord) {
  return (rec.labValue - rec.assignedValue) / Math.sqrt(rec.labUncertainty ** 2 + rec.refUncertainty ** 2)
}

function PTAnalysisPanel() {
  const [testFilter, setTestFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    if (testFilter === "all") return PT_DATA
    return PT_DATA.filter(d => d.testType === testFilter)
  }, [testFilter])

  const zValues = filtered.map(calcZ)
  const enValues = filtered.map(calcEn)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={testFilter} onValueChange={setTestFilter}>
          <SelectTrigger className="w-[160px] text-xs"><SelectValue placeholder="Test Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            <SelectItem value="IV">IV Characterization</SelectItem>
            <SelectItem value="INS">Insulation (INS)</SelectItem>
            <SelectItem value="WLT">Wet Leakage (WLT)</SelectItem>
            <SelectItem value="TT">Temp. Coefficient (TT)</SelectItem>
            <SelectItem value="EL">EL Imaging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Z-Score Trend</CardTitle></CardHeader>
          <CardContent>
            <MiniBar values={zValues} colorFn={v => zScoreColor(v).split(" ")[0]} />
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-200" /> |Z|≤2</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-200" /> 2&lt;|Z|≤3</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-200" /> |Z|&gt;3</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">En-Score Trend</CardTitle></CardHeader>
          <CardContent>
            <MiniBar values={enValues} colorFn={v => enScoreColor(v).split(" ")[0]} />
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-200" /> |En|≤1</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-200" /> |En|&gt;1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Round</TableHead>
                <TableHead className="text-xs">Test</TableHead>
                <TableHead className="text-xs">Parameter</TableHead>
                <TableHead className="text-xs">Assigned</TableHead>
                <TableHead className="text-xs">Lab Value</TableHead>
                <TableHead className="text-xs">Unit</TableHead>
                <TableHead className="text-xs">Z-Score</TableHead>
                <TableHead className="text-xs">Z Eval</TableHead>
                <TableHead className="text-xs">En-Score</TableHead>
                <TableHead className="text-xs">En Eval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(rec => {
                const z = calcZ(rec)
                const en = calcEn(rec)
                return (
                  <TableRow key={rec.id}>
                    <TableCell className="text-xs font-mono">{rec.id}</TableCell>
                    <TableCell className="text-xs">{rec.round}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{rec.testType}</Badge></TableCell>
                    <TableCell className="text-xs">{rec.parameter}</TableCell>
                    <TableCell className="text-xs font-mono">{rec.assignedValue}</TableCell>
                    <TableCell className="text-xs font-mono">{rec.labValue}</TableCell>
                    <TableCell className="text-xs">{rec.unit}</TableCell>
                    <TableCell><span className={`text-xs font-bold px-1.5 py-0.5 rounded ${zScoreColor(z)}`}>{z.toFixed(2)}</span></TableCell>
                    <TableCell className="text-xs">{zScoreLabel(z)}</TableCell>
                    <TableCell><span className={`text-xs font-bold px-1.5 py-0.5 rounded ${enScoreColor(en)}`}>{en.toFixed(2)}</span></TableCell>
                    <TableCell className="text-xs">{Math.abs(en) <= 1 ? "Pass" : "Fail"}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERMEDIATE CHECKS SUB-TAB
// ═══════════════════════════════════════════════════════════════════════════════

interface IntermediateCheck {
  id: string; equipment: string; eqId: string; parameter: string
  nominalValue: number; measuredValue: number; unit: string
  acceptanceCriteria: string; tolerance: number; date: string; technician: string
}

const INTERMEDIATE_CHECKS: IntermediateCheck[] = [
  { id: "IC-001", equipment: "Solar Simulator", eqId: "SS-001", parameter: "Irradiance", nominalValue: 1000, measuredValue: 998.5, unit: "W/m²", acceptanceCriteria: "±2%", tolerance: 2, date: "2026-03-15", technician: "A. Patel" },
  { id: "IC-002", equipment: "Solar Simulator", eqId: "SS-001", parameter: "Spatial Uniformity", nominalValue: 2.0, measuredValue: 1.8, unit: "%", acceptanceCriteria: "≤2%", tolerance: 2, date: "2026-03-15", technician: "A. Patel" },
  { id: "IC-003", equipment: "Reference Cell", eqId: "RC-001", parameter: "Isc", nominalValue: 8.55, measuredValue: 8.53, unit: "A", acceptanceCriteria: "±0.5%", tolerance: 0.5, date: "2026-03-14", technician: "S. Verma" },
  { id: "IC-004", equipment: "Insulation Tester", eqId: "IT-001", parameter: "Test Voltage", nominalValue: 1000, measuredValue: 1002, unit: "V", acceptanceCriteria: "±1%", tolerance: 1, date: "2026-03-13", technician: "V. Kumar" },
  { id: "IC-005", equipment: "Climate Chamber", eqId: "CC-001", parameter: "Temperature", nominalValue: 85.0, measuredValue: 85.3, unit: "°C", acceptanceCriteria: "±2°C", tolerance: 2, date: "2026-03-12", technician: "M. Singh" },
  { id: "IC-006", equipment: "Climate Chamber", eqId: "CC-001", parameter: "Humidity", nominalValue: 85.0, measuredValue: 84.5, unit: "%RH", acceptanceCriteria: "±5%RH", tolerance: 5, date: "2026-03-12", technician: "M. Singh" },
  { id: "IC-007", equipment: "Megohmmeter", eqId: "MG-001", parameter: "Resistance (500V)", nominalValue: 100, measuredValue: 99.2, unit: "MΩ", acceptanceCriteria: "±5%", tolerance: 5, date: "2026-03-10", technician: "V. Kumar" },
  { id: "IC-008", equipment: "Data Acquisition System", eqId: "DAQ-001", parameter: "Voltage Channel", nominalValue: 10.000, measuredValue: 10.003, unit: "V", acceptanceCriteria: "±0.1%", tolerance: 0.1, date: "2026-03-08", technician: "A. Patel" },
]

function checkPass(chk: IntermediateCheck) {
  const deviation = Math.abs((chk.measuredValue - chk.nominalValue) / chk.nominalValue) * 100
  return deviation <= chk.tolerance
}

function IntermediateChecksPanel() {
  const [eqFilter, setEqFilter] = useState<string>("all")
  const equipments = [...new Set(INTERMEDIATE_CHECKS.map(c => c.equipment))]

  const filtered = eqFilter === "all" ? INTERMEDIATE_CHECKS : INTERMEDIATE_CHECKS.filter(c => c.equipment === eqFilter)

  // Drift values for chart
  const driftValues = filtered.map(c => ((c.measuredValue - c.nominalValue) / c.nominalValue) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={eqFilter} onValueChange={setEqFilter}>
          <SelectTrigger className="w-[200px] text-xs"><SelectValue placeholder="Equipment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            {equipments.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Drift chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Drift Chart (% deviation from nominal)</CardTitle></CardHeader>
        <CardContent>
          <MiniBar values={driftValues} colorFn={v => Math.abs(v) <= 1 ? "bg-green-200" : Math.abs(v) <= 2 ? "bg-yellow-200" : "bg-red-200"} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Equipment</TableHead>
                <TableHead className="text-xs">Eq. ID</TableHead>
                <TableHead className="text-xs">Parameter</TableHead>
                <TableHead className="text-xs">Nominal</TableHead>
                <TableHead className="text-xs">Measured</TableHead>
                <TableHead className="text-xs">Unit</TableHead>
                <TableHead className="text-xs">Criteria</TableHead>
                <TableHead className="text-xs">Result</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Technician</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(chk => (
                <TableRow key={chk.id}>
                  <TableCell className="text-xs font-mono">{chk.id}</TableCell>
                  <TableCell className="text-xs">{chk.equipment}</TableCell>
                  <TableCell className="text-xs font-mono">{chk.eqId}</TableCell>
                  <TableCell className="text-xs">{chk.parameter}</TableCell>
                  <TableCell className="text-xs font-mono">{chk.nominalValue}</TableCell>
                  <TableCell className="text-xs font-mono">{chk.measuredValue}</TableCell>
                  <TableCell className="text-xs">{chk.unit}</TableCell>
                  <TableCell className="text-xs">{chk.acceptanceCriteria}</TableCell>
                  <TableCell>{passFail(checkPass(chk))}</TableCell>
                  <TableCell className="text-xs">{chk.date}</TableCell>
                  <TableCell className="text-xs">{chk.technician}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPLICATE TESTS SUB-TAB
// ═══════════════════════════════════════════════════════════════════════════════

interface ReplicateTest {
  id: string; testType: string; sampleId: string; parameter: string; unit: string
  readings: number[]; acceptableCV: number; date: string; analyst: string
}

const REPLICATE_DATA: ReplicateTest[] = [
  { id: "RT-001", testType: "IV", sampleId: "MOD-2026-045", parameter: "Pmax", unit: "W", readings: [345.2, 345.5, 344.8, 345.1, 345.3], acceptableCV: 0.5, date: "2026-03-18", analyst: "A. Patel" },
  { id: "RT-002", testType: "IV", sampleId: "MOD-2026-045", parameter: "Isc", unit: "A", readings: [9.82, 9.84, 9.81, 9.83, 9.82], acceptableCV: 0.5, date: "2026-03-18", analyst: "A. Patel" },
  { id: "RT-003", testType: "INS", sampleId: "MOD-2026-046", parameter: "Insulation Resistance", unit: "MΩ", readings: [510, 515, 508, 512, 511], acceptableCV: 2.0, date: "2026-03-17", analyst: "V. Kumar" },
  { id: "RT-004", testType: "WLT", sampleId: "MOD-2026-047", parameter: "Leakage Current", unit: "μA", readings: [12.5, 12.8, 12.3, 12.6, 12.7], acceptableCV: 3.0, date: "2026-03-16", analyst: "S. Verma" },
  { id: "RT-005", testType: "IV", sampleId: "MOD-2026-048", parameter: "Fill Factor", unit: "%", readings: [76.2, 76.5, 76.1, 76.4, 76.3], acceptableCV: 0.5, date: "2026-03-15", analyst: "A. Patel" },
  { id: "RT-006", testType: "EL", sampleId: "MOD-2026-049", parameter: "Mean Intensity", unit: "counts", readings: [4520, 4580, 4490, 4550, 4530], acceptableCV: 2.0, date: "2026-03-14", analyst: "M. Singh" },
]

function calcStats(readings: number[]) {
  const n = readings.length
  const mean = readings.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(readings.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1))
  const cv = (std / mean) * 100
  const range = Math.max(...readings) - Math.min(...readings)
  return { mean, std, cv, range }
}

function ReplicateTestsPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Test</TableHead>
                <TableHead className="text-xs">Sample</TableHead>
                <TableHead className="text-xs">Parameter</TableHead>
                <TableHead className="text-xs">Readings</TableHead>
                <TableHead className="text-xs">Mean</TableHead>
                <TableHead className="text-xs">Std Dev</TableHead>
                <TableHead className="text-xs">CV%</TableHead>
                <TableHead className="text-xs">Range</TableHead>
                <TableHead className="text-xs">Limit</TableHead>
                <TableHead className="text-xs">Result</TableHead>
                <TableHead className="text-xs">Analyst</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REPLICATE_DATA.map(rec => {
                const s = calcStats(rec.readings)
                const pass = s.cv <= rec.acceptableCV
                return (
                  <TableRow key={rec.id}>
                    <TableCell className="text-xs font-mono">{rec.id}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{rec.testType}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{rec.sampleId}</TableCell>
                    <TableCell className="text-xs">{rec.parameter}</TableCell>
                    <TableCell className="text-xs font-mono">{rec.readings.join(", ")}</TableCell>
                    <TableCell className="text-xs font-mono font-medium">{s.mean.toFixed(2)}</TableCell>
                    <TableCell className="text-xs font-mono">{s.std.toFixed(3)}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {s.cv.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{s.range.toFixed(2)} {rec.unit}</TableCell>
                    <TableCell className="text-xs">CV ≤ {rec.acceptableCV}%</TableCell>
                    <TableCell>{passFail(pass)}</TableCell>
                    <TableCell className="text-xs">{rec.analyst}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLIND TESTING SUB-TAB
// ═══════════════════════════════════════════════════════════════════════════════

interface BlindTest {
  id: string; sampleCode: string; testType: string; parameter: string; unit: string
  hiddenValue: number; analystResult: number; analyst: string; date: string
  tolerancePct: number
}

const BLIND_DATA: BlindTest[] = [
  { id: "BT-001", sampleCode: "BLIND-A", testType: "IV", parameter: "Pmax", unit: "W", hiddenValue: 342.5, analystResult: 343.1, analyst: "A. Patel", date: "2026-03-10", tolerancePct: 1.0 },
  { id: "BT-002", sampleCode: "BLIND-A", testType: "IV", parameter: "Isc", unit: "A", hiddenValue: 9.78, analystResult: 9.76, analyst: "A. Patel", date: "2026-03-10", tolerancePct: 1.0 },
  { id: "BT-003", sampleCode: "BLIND-B", testType: "INS", parameter: "Insulation Resistance", unit: "MΩ", hiddenValue: 480, analystResult: 475, analyst: "V. Kumar", date: "2026-03-08", tolerancePct: 5.0 },
  { id: "BT-004", sampleCode: "BLIND-C", testType: "WLT", parameter: "Leakage Current", unit: "μA", hiddenValue: 18.5, analystResult: 19.1, analyst: "S. Verma", date: "2026-03-05", tolerancePct: 5.0 },
  { id: "BT-005", sampleCode: "BLIND-D", testType: "IV", parameter: "Pmax", unit: "W", hiddenValue: 350.0, analystResult: 348.2, analyst: "M. Singh", date: "2026-03-01", tolerancePct: 1.0 },
  { id: "BT-006", sampleCode: "BLIND-D", testType: "IV", parameter: "Voc", unit: "V", hiddenValue: 46.50, analystResult: 46.42, analyst: "M. Singh", date: "2026-03-01", tolerancePct: 1.0 },
]

function BlindTestingPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Blind / Double-Blind Sample Testing</CardTitle>
          <CardDescription className="text-xs">Hidden reference values revealed after analyst submission</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Sample Code</TableHead>
                <TableHead className="text-xs">Test</TableHead>
                <TableHead className="text-xs">Parameter</TableHead>
                <TableHead className="text-xs">Hidden Value</TableHead>
                <TableHead className="text-xs">Analyst Result</TableHead>
                <TableHead className="text-xs">Unit</TableHead>
                <TableHead className="text-xs">Deviation %</TableHead>
                <TableHead className="text-xs">Tolerance</TableHead>
                <TableHead className="text-xs">Result</TableHead>
                <TableHead className="text-xs">Analyst</TableHead>
                <TableHead className="text-xs">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BLIND_DATA.map(bt => {
                const dev = Math.abs((bt.analystResult - bt.hiddenValue) / bt.hiddenValue) * 100
                const pass = dev <= bt.tolerancePct
                return (
                  <TableRow key={bt.id}>
                    <TableCell className="text-xs font-mono">{bt.id}</TableCell>
                    <TableCell className="text-xs font-mono">{bt.sampleCode}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{bt.testType}</Badge></TableCell>
                    <TableCell className="text-xs">{bt.parameter}</TableCell>
                    <TableCell className="text-xs font-mono">{bt.hiddenValue}</TableCell>
                    <TableCell className="text-xs font-mono">{bt.analystResult}</TableCell>
                    <TableCell className="text-xs">{bt.unit}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {dev.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">±{bt.tolerancePct}%</TableCell>
                    <TableCell>{passFail(pass)}</TableCell>
                    <TableCell className="text-xs">{bt.analyst}</TableCell>
                    <TableCell className="text-xs">{bt.date}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALTERNATIVE INSTRUMENTATION SUB-TAB
// ═══════════════════════════════════════════════════════════════════════════════

interface AltInstrRecord {
  id: string; sampleId: string; parameter: string; unit: string
  method1: { name: string; value: number; uncertainty: number }
  method2: { name: string; value: number; uncertainty: number }
  method3?: { name: string; value: number; uncertainty: number }
}

const ALT_INSTR_DATA: AltInstrRecord[] = [
  {
    id: "AI-001", sampleId: "MOD-2026-050", parameter: "Pmax", unit: "W",
    method1: { name: "Flash (Pasan)", value: 345.2, uncertainty: 1.2 },
    method2: { name: "Steady-State (Wacom)", value: 344.8, uncertainty: 1.5 },
    method3: { name: "Outdoor (IEC 60904-1)", value: 343.5, uncertainty: 2.8 },
  },
  {
    id: "AI-002", sampleId: "MOD-2026-050", parameter: "Isc", unit: "A",
    method1: { name: "Flash (Pasan)", value: 9.85, uncertainty: 0.04 },
    method2: { name: "Steady-State (Wacom)", value: 9.83, uncertainty: 0.05 },
    method3: { name: "Outdoor (IEC 60904-1)", value: 9.80, uncertainty: 0.08 },
  },
  {
    id: "AI-003", sampleId: "MOD-2026-050", parameter: "Voc", unit: "V",
    method1: { name: "Flash (Pasan)", value: 46.32, uncertainty: 0.10 },
    method2: { name: "Steady-State (Wacom)", value: 46.28, uncertainty: 0.12 },
    method3: { name: "Outdoor (IEC 60904-1)", value: 46.15, uncertainty: 0.25 },
  },
  {
    id: "AI-004", sampleId: "MOD-2026-051", parameter: "Pmax", unit: "W",
    method1: { name: "Flash (Pasan)", value: 410.5, uncertainty: 1.4 },
    method2: { name: "Steady-State (Wacom)", value: 409.8, uncertainty: 1.8 },
  },
  {
    id: "AI-005", sampleId: "MOD-2026-051", parameter: "Fill Factor", unit: "%",
    method1: { name: "Flash (Pasan)", value: 77.2, uncertainty: 0.3 },
    method2: { name: "Steady-State (Wacom)", value: 77.0, uncertainty: 0.4 },
  },
]

function calcEnBetween(v1: number, u1: number, v2: number, u2: number) {
  return (v1 - v2) / Math.sqrt(u1 ** 2 + u2 ** 2)
}

function AltInstrumentationPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Alternative Instrumentation Comparison</CardTitle>
          <CardDescription className="text-xs">Flash vs Steady-State vs Outdoor IV measurement comparison with En-score evaluation</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Sample</TableHead>
                <TableHead className="text-xs">Parameter</TableHead>
                <TableHead className="text-xs">Method 1</TableHead>
                <TableHead className="text-xs">Value ± U</TableHead>
                <TableHead className="text-xs">Method 2</TableHead>
                <TableHead className="text-xs">Value ± U</TableHead>
                <TableHead className="text-xs">En (1 vs 2)</TableHead>
                {ALT_INSTR_DATA.some(d => d.method3) && <>
                  <TableHead className="text-xs">Method 3</TableHead>
                  <TableHead className="text-xs">Value ± U</TableHead>
                  <TableHead className="text-xs">En (1 vs 3)</TableHead>
                </>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALT_INSTR_DATA.map(rec => {
                const en12 = calcEnBetween(rec.method1.value, rec.method1.uncertainty, rec.method2.value, rec.method2.uncertainty)
                const en13 = rec.method3 ? calcEnBetween(rec.method1.value, rec.method1.uncertainty, rec.method3.value, rec.method3.uncertainty) : null
                return (
                  <TableRow key={rec.id}>
                    <TableCell className="text-xs font-mono">{rec.id}</TableCell>
                    <TableCell className="text-xs font-mono">{rec.sampleId}</TableCell>
                    <TableCell className="text-xs">{rec.parameter}</TableCell>
                    <TableCell className="text-xs">{rec.method1.name}</TableCell>
                    <TableCell className="text-xs font-mono">{rec.method1.value} ± {rec.method1.uncertainty} {rec.unit}</TableCell>
                    <TableCell className="text-xs">{rec.method2.name}</TableCell>
                    <TableCell className="text-xs font-mono">{rec.method2.value} ± {rec.method2.uncertainty} {rec.unit}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${enScoreColor(en12)}`}>{en12.toFixed(2)}</span>
                    </TableCell>
                    {ALT_INSTR_DATA.some(d => d.method3) && <>
                      <TableCell className="text-xs">{rec.method3?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{rec.method3 ? `${rec.method3.value} ± ${rec.method3.uncertainty} ${rec.unit}` : "—"}</TableCell>
                      <TableCell>
                        {en13 !== null
                          ? <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${enScoreColor(en13)}`}>{en13.toFixed(2)}</span>
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                    </>}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN QC/QA TAB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function QCQATab() {
  const [subTab, setSubTab] = useState("pt-analysis")

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="cursor-pointer" onClick={() => setSubTab("pt-analysis")}>
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <div className="text-lg font-bold">{PT_DATA.length}</div>
            <div className="text-xs text-muted-foreground">PT Results</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setSubTab("intermediate")}>
          <CardContent className="pt-4 pb-3 text-center">
            <FlaskConical className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <div className="text-lg font-bold">{INTERMEDIATE_CHECKS.length}</div>
            <div className="text-xs text-muted-foreground">Intermediate Checks</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setSubTab("replicate")}>
          <CardContent className="pt-4 pb-3 text-center">
            <Repeat2 className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <div className="text-lg font-bold">{REPLICATE_DATA.length}</div>
            <div className="text-xs text-muted-foreground">Replicate Tests</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setSubTab("blind")}>
          <CardContent className="pt-4 pb-3 text-center">
            <EyeOff className="h-5 w-5 mx-auto text-amber-600 mb-1" />
            <div className="text-lg font-bold">{BLIND_DATA.length}</div>
            <div className="text-xs text-muted-foreground">Blind Tests</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setSubTab("alt-instr")}>
          <CardContent className="pt-4 pb-3 text-center">
            <GitCompareArrows className="h-5 w-5 mx-auto text-red-600 mb-1" />
            <div className="text-lg font-bold">{ALT_INSTR_DATA.length}</div>
            <div className="text-xs text-muted-foreground">Alt. Instrumentation</div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="pt-analysis" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" /> PT Analysis
          </TabsTrigger>
          <TabsTrigger value="intermediate" className="text-xs">
            <FlaskConical className="h-3 w-3 mr-1" /> Intermediate Checks
          </TabsTrigger>
          <TabsTrigger value="replicate" className="text-xs">
            <Repeat2 className="h-3 w-3 mr-1" /> Replicate Tests
          </TabsTrigger>
          <TabsTrigger value="blind" className="text-xs">
            <EyeOff className="h-3 w-3 mr-1" /> Blind Testing
          </TabsTrigger>
          <TabsTrigger value="alt-instr" className="text-xs">
            <GitCompareArrows className="h-3 w-3 mr-1" /> Alt. Instrumentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pt-analysis" className="mt-4"><PTAnalysisPanel /></TabsContent>
        <TabsContent value="intermediate" className="mt-4"><IntermediateChecksPanel /></TabsContent>
        <TabsContent value="replicate" className="mt-4"><ReplicateTestsPanel /></TabsContent>
        <TabsContent value="blind" className="mt-4"><BlindTestingPanel /></TabsContent>
        <TabsContent value="alt-instr" className="mt-4"><AltInstrumentationPanel /></TabsContent>
      </Tabs>
    </div>
  )
}
