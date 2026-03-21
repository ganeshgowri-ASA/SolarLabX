// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, AlertTriangle, Clock, TrendingUp, TrendingDown,
  BarChart3, Activity, FlaskConical, Microscope, Settings, Zap, Download,
  Target, Copy, EyeOff, GitCompare, Printer, FileText, ClipboardList, Shield, Users,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, ScatterChart, Scatter, Cell,
  PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type PTStatus = "Pass" | "Satisfactory" | "Questionable" | "Unsatisfactory";
type MVStatus = "Validated" | "In Progress" | "Pending" | "Failed";
type EQStatus = "Qualified" | "Requalification Due" | "In Progress" | "Failed";

interface PTRecord {
  id: string;
  ptProvider: string;
  parameter: string;
  round: string;
  date: string;
  zScore: number;
  enNumber?: number;
  assignedValue: number;
  labValue: number;
  unit: string;
  status: PTStatus;
  standard: string;
}

interface ILCRecord {
  id: string;
  parameter: string;
  labs: string[];
  labValue: number;
  meanValue: number;
  stdDev: number;
  enNumber: number;
  date: string;
  status: PTStatus;
}

interface MVRecord {
  id: string;
  method: string;
  standard: string;
  parameter: string;
  accuracy: number;
  precision: number;
  lod: number;
  loq: number;
  linearityR2: number;
  repeatability: number;
  reproducibility: number;
  status: MVStatus;
  validatedBy: string;
  date: string;
}

interface EQRecord {
  id: string;
  equipment: string;
  equipmentId: string;
  standard: string;
  iqStatus: EQStatus;
  oqStatus: EQStatus;
  pqStatus: EQStatus;
  iqDate: string;
  oqDate: string;
  pqDate: string;
  nextRequalification: string;
  qualifiedBy: string;
}

interface NCRecord {
  id: string;
  ncRef: string;
  description: string;
  source: string;
  severity: "Critical" | "Major" | "Minor";
  status: "Open" | "In Progress" | "Closed";
  capaRef?: string;
  date: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const PT_RECORDS: PTRecord[] = [
  { id: "1", ptProvider: "EPTIS / NABL PT", parameter: "Isc (Short-circuit current)", round: "2025-R1", date: "2025-01-20", zScore: 0.45, enNumber: 0.38, assignedValue: 9.82, labValue: 9.87, unit: "A", status: "Pass", standard: "IEC 60904-1" },
  { id: "2", ptProvider: "EPTIS / NABL PT", parameter: "Voc (Open-circuit voltage)", round: "2025-R1", date: "2025-01-20", zScore: -1.20, enNumber: 0.82, assignedValue: 46.3, labValue: 45.8, unit: "V", status: "Satisfactory", standard: "IEC 60904-1" },
  { id: "3", ptProvider: "EPTIS / NABL PT", parameter: "Pmax (Maximum power)", round: "2025-R1", date: "2025-01-20", zScore: 0.89, enNumber: 0.61, assignedValue: 400.2, labValue: 401.8, unit: "W", status: "Pass", standard: "IEC 60904-1" },
  { id: "4", ptProvider: "NABL PT – Thermal", parameter: "Thermal Cycling – ΔPmax", round: "2024-R2", date: "2024-09-15", zScore: -2.15, enNumber: 1.42, assignedValue: -1.2, labValue: -1.6, unit: "%", status: "Questionable", standard: "IEC 61215-1" },
  { id: "5", ptProvider: "NABL PT – Thermal", parameter: "Damp Heat – Insulation Resistance", round: "2024-R2", date: "2024-09-15", zScore: 0.12, enNumber: 0.09, assignedValue: 1850, labValue: 1860, unit: "MΩ", status: "Pass", standard: "IEC 61215-1" },
  { id: "6", ptProvider: "EPTIS – Spectral", parameter: "AM1.5G Spectral Irradiance", round: "2025-R1", date: "2025-02-10", zScore: 3.20, enNumber: 2.1, assignedValue: 1000, labValue: 1012, unit: "W/m²", status: "Unsatisfactory", standard: "IEC 60904-3" },
];

const ILC_RECORDS: ILCRecord[] = [
  { id: "1", parameter: "Pmax @ STC", labs: ["Lab A", "Lab B", "Lab C (this lab)", "Lab D", "Lab E"], labValue: 399.5, meanValue: 400.1, stdDev: 1.8, enNumber: 0.47, date: "2025-01-30", status: "Pass" },
  { id: "2", parameter: "Efficiency (%)", labs: ["Lab A", "Lab B", "Lab C (this lab)", "Lab D"], labValue: 21.3, meanValue: 21.5, stdDev: 0.4, enNumber: 0.71, date: "2025-01-30", status: "Satisfactory" },
  { id: "3", parameter: "FF (Fill Factor)", labs: ["Lab A", "Lab B", "Lab C (this lab)", "Lab D", "Lab E"], labValue: 0.785, meanValue: 0.791, stdDev: 0.010, enNumber: 0.84, date: "2025-01-30", status: "Satisfactory" },
];

const MV_RECORDS: MVRecord[] = [
  { id: "1", method: "IV Curve Measurement at STC", standard: "IEC 60904-1", parameter: "Pmax, Isc, Voc, FF", accuracy: 0.4, precision: 0.2, lod: 0.01, loq: 0.05, linearityR2: 0.9998, repeatability: 0.15, reproducibility: 0.32, status: "Validated", validatedBy: "Dr. S. Kumar", date: "2024-11-01" },
  { id: "2", method: "Spectral Responsivity Measurement", standard: "IEC 60904-8", parameter: "SR(λ), EQE(λ)", accuracy: 0.8, precision: 0.5, lod: 0.001, loq: 0.005, linearityR2: 0.9994, repeatability: 0.40, reproducibility: 0.72, status: "Validated", validatedBy: "S. Rao", date: "2024-10-15" },
  { id: "3", method: "Thermal Cycling Performance", standard: "IEC 61215-1", parameter: "ΔPmax, ΔIsc, ΔVoc", accuracy: 0.3, precision: 0.2, lod: 0.01, loq: 0.05, linearityR2: 0.9995, repeatability: 0.10, reproducibility: 0.25, status: "Validated", validatedBy: "A. Mehta", date: "2024-09-01" },
  { id: "4", method: "EL Imaging Defect Detection", standard: "IEC 60904-13", parameter: "Crack area %, defect classification", accuracy: 2.1, precision: 1.8, lod: 0.5, loq: 2.0, linearityR2: 0.9810, repeatability: 1.50, reproducibility: 2.80, status: "In Progress", validatedBy: "K. Iyer", date: "2026-02-01" },
  { id: "5", method: "IR Thermography", standard: "IEC 62446-3", parameter: "ΔT hotspot (K)", accuracy: 1.5, precision: 0.8, lod: 0.5, loq: 2.0, linearityR2: 0.9920, repeatability: 0.60, reproducibility: 1.20, status: "Pending", validatedBy: "—", date: "—" },
];

const EQ_RECORDS: EQRecord[] = [
  { id: "1", equipment: "Solar Simulator AAA+", equipmentId: "SS-001", standard: "IEC 60904-9 Ed.3", iqStatus: "Qualified", oqStatus: "Qualified", pqStatus: "Qualified", iqDate: "2022-03-10", oqDate: "2022-04-05", pqDate: "2022-05-20", nextRequalification: "2026-05-20", qualifiedBy: "Dr. S. Kumar" },
  { id: "2", equipment: "Climate Chamber TC-1000", equipmentId: "CC-001", standard: "IEC 61215 / IEC 60068", iqStatus: "Qualified", oqStatus: "Qualified", pqStatus: "Requalification Due", iqDate: "2020-06-01", oqDate: "2020-07-15", pqDate: "2020-08-30", nextRequalification: "2025-08-30", qualifiedBy: "A. Mehta" },
  { id: "3", equipment: "EL Imaging System", equipmentId: "EL-001", standard: "IEC 60904-13", iqStatus: "Qualified", oqStatus: "Qualified", pqStatus: "In Progress", iqDate: "2025-01-10", oqDate: "2025-02-15", pqDate: "—", nextRequalification: "—", qualifiedBy: "K. Iyer" },
  { id: "4", equipment: "I-V Curve Tracer", equipmentId: "IV-001", standard: "IEC 60904-1", iqStatus: "Qualified", oqStatus: "Qualified", pqStatus: "Qualified", iqDate: "2023-01-20", oqDate: "2023-02-10", pqDate: "2023-03-01", nextRequalification: "2027-03-01", qualifiedBy: "S. Rao" },
  { id: "5", equipment: "Spectroradiometer", equipmentId: "SR-001", standard: "IEC 60904-9", iqStatus: "Qualified", oqStatus: "In Progress", pqStatus: "Pending", iqDate: "2025-12-01", oqDate: "—", pqDate: "—", nextRequalification: "—", qualifiedBy: "S. Rao" },
];

const NC_RECORDS: NCRecord[] = [
  { id: "1", ncRef: "NC-2025-001", description: "Spectral irradiance measurement deviation > 2σ in PT round", source: "Proficiency Testing", severity: "Critical", status: "In Progress", capaRef: "CAPA-2025-003", date: "2025-02-12" },
  { id: "2", ncRef: "NC-2025-002", description: "EL imaging qualification not completed within scheduled timeline", source: "Internal Audit", severity: "Major", status: "Open", capaRef: undefined, date: "2025-03-05" },
  { id: "3", ncRef: "NC-2024-015", description: "Climate chamber PQ requalification overdue by 3 months", source: "Management Review", severity: "Major", status: "In Progress", capaRef: "CAPA-2024-010", date: "2024-12-01" },
  { id: "4", ncRef: "NC-2024-009", description: "Minor deviation in IV curve repeat measurements – within spec", source: "Internal QC Check", severity: "Minor", status: "Closed", capaRef: undefined, date: "2024-08-20" },
];

// ─── Trend Data ───────────────────────────────────────────────────────────────

const Z_SCORE_TREND = [
  { round: "2023-R1", Isc: 0.2, Voc: -0.5, Pmax: 0.8 },
  { round: "2023-R2", Isc: -0.3, Voc: -0.8, Pmax: 0.3 },
  { round: "2024-R1", Isc: 0.6, Voc: -1.1, Pmax: 1.2 },
  { round: "2024-R2", Isc: -0.1, Voc: -0.9, Pmax: 0.5 },
  { round: "2025-R1", Isc: 0.45, Voc: -1.20, Pmax: 0.89 },
];

const QC_CHART_DATA = [
  { month: "Oct-24", Pmax: 400.2, UCL: 402, LCL: 398, CL: 400 },
  { month: "Nov-24", Pmax: 399.8, UCL: 402, LCL: 398, CL: 400 },
  { month: "Dec-24", Pmax: 401.1, UCL: 402, LCL: 398, CL: 400 },
  { month: "Jan-25", Pmax: 400.5, UCL: 402, LCL: 398, CL: 400 },
  { month: "Feb-25", Pmax: 399.3, UCL: 402, LCL: 398, CL: 400 },
  { month: "Mar-25", Pmax: 400.8, UCL: 402, LCL: 398, CL: 400 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PT_STATUS_CONFIG: Record<PTStatus, { color: string; bg: string }> = {
  Pass:           { color: "text-green-700",  bg: "bg-green-50" },
  Satisfactory:   { color: "text-blue-700",   bg: "bg-blue-50" },
  Questionable:   { color: "text-amber-700",  bg: "bg-amber-50" },
  Unsatisfactory: { color: "text-red-700",    bg: "bg-red-50" },
};

const EQ_STATUS_CONFIG: Record<EQStatus, { color: string; icon: any }> = {
  Qualified:              { color: "text-green-600", icon: CheckCircle2 },
  "Requalification Due":  { color: "text-amber-600", icon: Clock },
  "In Progress":          { color: "text-blue-600",  icon: Activity },
  Failed:                 { color: "text-red-600",   icon: AlertTriangle },
};

function zScoreColor(z: number) {
  const abs = Math.abs(z);
  if (abs <= 2) return "text-green-700";
  if (abs <= 3) return "text-amber-700";
  return "text-red-700";
}

function enColor(en: number) {
  if (en <= 1) return "text-green-700";
  if (en <= 2) return "text-amber-700";
  return "text-red-700";
}

// ─── Sub-Tab Components ───────────────────────────────────────────────────────

function ProficiencyTestingTab() {
  const pass = PT_RECORDS.filter(r => r.status === "Pass").length;
  const satisfactory = PT_RECORDS.filter(r => r.status === "Satisfactory").length;
  const questionable = PT_RECORDS.filter(r => r.status === "Questionable").length;
  const unsatisfactory = PT_RECORDS.filter(r => r.status === "Unsatisfactory").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pass (|z|≤2)", value: pass, color: "text-green-600", border: "border-l-green-500" },
          { label: "Satisfactory", value: satisfactory, color: "text-blue-600", border: "border-l-blue-500" },
          { label: "Questionable (2<|z|≤3)", value: questionable, color: "text-amber-600", border: "border-l-amber-500" },
          { label: "Unsatisfactory (|z|>3)", value: unsatisfactory, color: "text-red-600", border: "border-l-red-500" },
        ].map(s => (
          <Card key={s.label} className={cn("border-l-4", s.border)}>
            <CardContent className="pt-4 pb-3">
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {unsatisfactory > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span><strong>Action Required:</strong> {unsatisfactory} parameter(s) with |z|{">"} 3. Immediate investigation and corrective action required per ISO 17025 Clause 7.7.2.</span>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">PT Results – z-Score & En Number</CardTitle>
          <CardDescription className="text-xs">|z| ≤ 2: Satisfactory · 2 {"<"} |z| ≤ 3: Questionable · |z| {">"} 3: Unsatisfactory · En ≤ 1: Satisfactory</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["Provider", "Parameter", "Round", "Date", "Assigned", "Lab Value", "Unit", "z-Score", "En", "Status", "Standard"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PT_RECORDS.map(r => {
                  const sc = PT_STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 whitespace-nowrap">{r.ptProvider}</td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={r.parameter}>{r.parameter}</td>
                      <td className="px-3 py-2 font-mono">{r.round}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{r.date}</td>
                      <td className="px-3 py-2 font-mono">{r.assignedValue}</td>
                      <td className="px-3 py-2 font-mono">{r.labValue}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.unit}</td>
                      <td className={cn("px-3 py-2 font-bold font-mono", zScoreColor(r.zScore))}>{r.zScore > 0 ? "+" : ""}{r.zScore.toFixed(2)}</td>
                      <td className={cn("px-3 py-2 font-bold font-mono", r.enNumber !== undefined ? enColor(r.enNumber) : "text-muted-foreground")}>
                        {r.enNumber !== undefined ? r.enNumber.toFixed(2) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", sc.bg, sc.color)}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{r.standard}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> z-Score Trend (Last 5 Rounds)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={Z_SCORE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="round" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[-4, 4]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "+2σ", fontSize: 9 }} />
              <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "-2σ", fontSize: 9 }} />
              <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "+3σ", fontSize: 9 }} />
              <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "-3σ", fontSize: 9 }} />
              <Line type="monotone" dataKey="Isc" stroke="#3b82f6" dot={{ r: 3 }} strokeWidth={2} />
              <Line type="monotone" dataKey="Voc" stroke="#8b5cf6" dot={{ r: 3 }} strokeWidth={2} />
              <Line type="monotone" dataKey="Pmax" stroke="#10b981" dot={{ r: 3 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

const labZScores = [
  { lab: "Lab A", zScore: 0.3, enNumber: 0.25 },
  { lab: "Lab B", zScore: -0.8, enNumber: 0.62 },
  { lab: "Lab C (This Lab)", zScore: 0.45, enNumber: 0.47 },
  { lab: "Lab D", zScore: 1.5, enNumber: 1.1 },
  { lab: "Lab E", zScore: -2.3, enNumber: 1.8 },
  { lab: "Lab F", zScore: 0.1, enNumber: 0.08 },
];

const youdenData = [
  { x: 400.2, y: 9.85, lab: "Lab A" },
  { x: 399.1, y: 9.78, lab: "Lab B" },
  { x: 399.5, y: 9.83, lab: "Lab C" },
  { x: 401.5, y: 9.90, lab: "Lab D" },
  { x: 397.8, y: 9.72, lab: "Lab E" },
  { x: 400.0, y: 9.82, lab: "Lab F" },
];

const labRankingByEn = [...labZScores].sort((a, b) => a.enNumber - b.enNumber);

function InterLabComparisonTab() {
  return (
    <div className="space-y-4">
      {/* Results Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Inter-Laboratory Comparison Results</CardTitle>
          <CardDescription className="text-xs">En ≤ 1: Satisfactory · En {">"} 1: Unsatisfactory. Compared against consensus mean.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["Parameter", "Date", "Lab Value", "Mean", "Std Dev", "En Number", "Status", "Participants"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ILC_RECORDS.map(r => {
                  const sc = PT_STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{r.parameter}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.date}</td>
                      <td className="px-3 py-2 font-mono">{r.labValue}</td>
                      <td className="px-3 py-2 font-mono">{r.meanValue}</td>
                      <td className="px-3 py-2 font-mono">±{r.stdDev}</td>
                      <td className={cn("px-3 py-2 font-bold font-mono", enColor(r.enNumber))}>{r.enNumber.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", sc.bg, sc.color)}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{r.labs.length} labs</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* z-Score Comparison: Horizontal Bar per Lab */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" /> z-Score Comparison by Lab
          </CardTitle>
          <CardDescription className="text-xs">|z| ≤ 2: Satisfactory (green) · 2 &lt; |z| ≤ 3: Questionable (amber) · |z| &gt; 3: Unsatisfactory (red)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={labZScores} layout="vertical" margin={{ top: 4, right: 30, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} domain={[-3, 3]} />
              <YAxis type="category" dataKey="lab" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <ReferenceLine x={2} stroke="#f59e0b" strokeDasharray="4 4" />
              <ReferenceLine x={-2} stroke="#f59e0b" strokeDasharray="4 4" />
              <ReferenceLine x={3} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine x={-3} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine x={0} stroke="#6b7280" strokeWidth={1} />
              <Bar dataKey="zScore" name="z-Score" radius={[0, 3, 3, 0]}>
                {labZScores.map((entry, i) => (
                  <Cell key={i} fill={Math.abs(entry.zScore) <= 2 ? "#10b981" : Math.abs(entry.zScore) <= 3 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Youden Plot */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Youden Plot (Pmax vs Isc)</CardTitle>
            <CardDescription className="text-xs">Paired measurements &mdash; systematic lab biases appear as clusters away from center</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" name="Pmax (W)" tick={{ fontSize: 10 }} domain={[396, 403]} label={{ value: "Pmax (W)", fontSize: 10, position: "bottom", offset: 5 }} />
                <YAxis type="number" dataKey="y" name="Isc (A)" tick={{ fontSize: 10 }} domain={[9.7, 9.95]} label={{ value: "Isc (A)", fontSize: 10, angle: -90, position: "insideLeft" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ strokeDasharray: "3 3" }} formatter={(value: number, name: string) => [value.toFixed(2), name]} />
                <ReferenceLine x={400.1} stroke="#6b7280" strokeDasharray="4 4" label={{ value: "Mean Pmax", fontSize: 8 }} />
                <ReferenceLine y={9.82} stroke="#6b7280" strokeDasharray="4 4" label={{ value: "Mean Isc", fontSize: 8 }} />
                <Scatter data={youdenData} fill="#6366f1">
                  {youdenData.map((_, i) => (
                    <Cell key={i} fill={["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#6366f1"][i]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-1">
              {youdenData.map((d, i) => (
                <span key={d.lab} className="text-[10px] flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#6366f1"][i] }} />
                  {d.lab}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lab Performance Ranking by En */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lab Performance Ranking (En Number)</CardTitle>
            <CardDescription className="text-xs">Sorted by En number &mdash; lower is better. En ≤ 1: Satisfactory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={labRankingByEn} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="lab" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 2]} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "En=1 limit", fontSize: 9 }} />
                <Bar dataKey="enNumber" name="En Number" radius={[3, 3, 0, 0]}>
                  {labRankingByEn.map((entry, i) => (
                    <Cell key={i} fill={entry.enNumber <= 1 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ILC En Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">En Numbers &mdash; ILC Parameter Summary</CardTitle>
          <CardDescription className="text-xs">Consensus values with En evaluation per parameter</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ILC_RECORDS.map(r => ({ name: r.parameter.split(" ")[0], En: r.enNumber, labValue: r.labValue, mean: r.meanValue }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 2]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "En=1", fontSize: 9 }} />
              <Bar dataKey="En" name="En Number" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Report */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-600" /> ILC Participation Report</CardTitle>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7"><Download className="h-3 w-3" /> Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-3 bg-muted/20 text-xs text-center">
            <p className="font-bold text-foreground">SolarLabX PV Testing Laboratory</p>
            <p className="text-muted-foreground">ILC Participation Report &mdash; RPT-ILC-2026-001 | Round: 2025-R1</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="border rounded p-2 text-center">
              <p className="text-muted-foreground">Parameters Tested</p>
              <p className="text-xl font-bold text-blue-600">3</p>
            </div>
            <div className="border rounded p-2 text-center">
              <p className="text-muted-foreground">All En ≤ 1</p>
              <p className="text-xl font-bold text-green-600">Yes</p>
            </div>
            <div className="border rounded p-2 text-center">
              <p className="text-muted-foreground">Participating Labs</p>
              <p className="text-xl font-bold text-purple-600">5</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Conclusions &amp; Corrective Actions:</p>
            <p>All three parameters (Pmax, Efficiency, FF) achieved satisfactory En numbers (all &lt; 1.0). Lab performance is within acceptable limits for all measured quantities. No corrective actions required. Lab D (En=1.1) and Lab E (En=1.8) show unsatisfactory performance &mdash; shared with those labs for their corrective action.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-3">
            {[{ role: "Prepared By", name: "S. Rao" }, { role: "Reviewed By", name: "A. Mehta" }, { role: "Approved By", name: "Dr. S. Kumar" }].map(s => (
              <div key={s.role} className="text-xs space-y-1">
                <p className="font-semibold text-foreground">{s.role}</p>
                <div className="border-b border-dashed border-muted-foreground/50 h-6" />
                <p className="text-muted-foreground">{s.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MethodValidationTab() {
  const STATUS_CONFIG: Record<MVStatus, { color: string; bg: string }> = {
    Validated:   { color: "text-green-700", bg: "bg-green-50" },
    "In Progress": { color: "text-blue-700",  bg: "bg-blue-50" },
    Pending:     { color: "text-amber-700", bg: "bg-amber-50" },
    Failed:      { color: "text-red-700",   bg: "bg-red-50" },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["Validated", "In Progress", "Pending", "Failed"] as MVStatus[]).map(s => (
          <Card key={s} className={cn("border-l-4", s === "Validated" ? "border-l-green-500" : s === "In Progress" ? "border-l-blue-500" : s === "Pending" ? "border-l-amber-500" : "border-l-red-500")}>
            <CardContent className="pt-4 pb-3">
              <div className={cn("text-2xl font-bold", STATUS_CONFIG[s].color)}>{MV_RECORDS.filter(r => r.status === s).length}</div>
              <div className="text-xs text-muted-foreground">{s}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Method Validation Records</CardTitle>
          <CardDescription className="text-xs">ISO 17025 Clause 7.2.2 – All validation parameters per method</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["Method", "Standard", "Accuracy (%)", "Precision (%)", "LOD", "LOQ", "R² (Lin.)", "Repeatab. (%)", "Reproduc. (%)", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MV_RECORDS.map(r => {
                  const sc = STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium max-w-[180px] truncate" title={r.method}>{r.method}</td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.standard}</td>
                      <td className="px-3 py-2 font-mono">{r.accuracy}</td>
                      <td className="px-3 py-2 font-mono">{r.precision}</td>
                      <td className="px-3 py-2 font-mono">{r.lod}</td>
                      <td className="px-3 py-2 font-mono">{r.loq}</td>
                      <td className={cn("px-3 py-2 font-mono font-bold", r.linearityR2 >= 0.999 ? "text-green-600" : r.linearityR2 >= 0.995 ? "text-amber-600" : "text-red-600")}>
                        {r.linearityR2.toFixed(4)}
                      </td>
                      <td className="px-3 py-2 font-mono">{r.repeatability}</td>
                      <td className="px-3 py-2 font-mono">{r.reproducibility}</td>
                      <td className="px-3 py-2">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", sc.bg, sc.color)}>{r.status}</span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EquipmentQualificationTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Fully Qualified (IQ+OQ+PQ)", value: EQ_RECORDS.filter(r => r.pqStatus === "Qualified").length, color: "text-green-600", border: "border-l-green-500" },
          { label: "Requalification Due", value: EQ_RECORDS.filter(r => r.iqStatus === "Requalification Due" || r.oqStatus === "Requalification Due" || r.pqStatus === "Requalification Due").length, color: "text-amber-600", border: "border-l-amber-500" },
          { label: "Qualification In Progress", value: EQ_RECORDS.filter(r => r.iqStatus === "In Progress" || r.oqStatus === "In Progress" || r.pqStatus === "In Progress").length, color: "text-blue-600", border: "border-l-blue-500" },
        ].map(s => (
          <Card key={s.label} className={cn("border-l-4", s.border)}>
            <CardContent className="pt-4 pb-3">
              <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600" />
            Equipment Qualification Records – IQ / OQ / PQ
          </CardTitle>
          <CardDescription className="text-xs">Per IEC 61215/61730/60904 and GAMP5 methodology. IQ=Installation · OQ=Operational · PQ=Performance Qualification</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["Equipment", "ID", "Standard", "IQ", "OQ", "PQ", "IQ Date", "OQ Date", "PQ Date", "Next Requalification", "Qualified By"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EQ_RECORDS.map(r => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{r.equipment}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.equipmentId}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.standard}</td>
                    {([r.iqStatus, r.oqStatus, r.pqStatus] as EQStatus[]).map((s, i) => {
                      const sc = EQ_STATUS_CONFIG[s];
                      return (
                        <td key={i} className="px-3 py-2">
                          <span className={cn("flex items-center gap-1", sc.color)}>
                            <sc.icon className="h-3 w-3" />
                            <span className="text-[10px] font-medium">{s}</span>
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.iqDate}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.oqDate}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.pqDate}</td>
                    <td className={cn("px-3 py-2 whitespace-nowrap font-medium",
                      r.nextRequalification !== "—" && new Date(r.nextRequalification) < new Date() ? "text-red-600" : "text-foreground")}>
                      {r.nextRequalification}
                      {r.nextRequalification !== "—" && new Date(r.nextRequalification) < new Date() && <AlertTriangle className="inline ml-1 h-3 w-3" />}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.qualifiedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NCSection() {
  const SEV_CONFIG = {
    Critical: { color: "text-red-700",    bg: "bg-red-50 border-red-200" },
    Major:    { color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
    Minor:    { color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  };
  const ST_CONFIG = {
    Open:        { color: "text-red-600",   icon: AlertTriangle },
    "In Progress": { color: "text-blue-600", icon: Activity },
    Closed:      { color: "text-green-600", icon: CheckCircle2 },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Non-Conformances Summary (QC/QA Origin)
        </CardTitle>
        <CardDescription className="text-xs">Linked to CAPA module for corrective and preventive actions</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                {["NC Ref", "Description", "Source", "Severity", "Status", "CAPA Ref", "Date"].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NC_RECORDS.map(r => {
                const sev = SEV_CONFIG[r.severity];
                const st = ST_CONFIG[r.status];
                return (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono font-bold text-blue-700">{r.ncRef}</td>
                    <td className="px-3 py-2 max-w-[260px]">{r.description}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.source}</td>
                    <td className="px-3 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded border text-[10px] font-bold", sev.bg, sev.color)}>{r.severity}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("flex items-center gap-1", st.color)}>
                        <st.icon className="h-3 w-3" />
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.capaRef ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{r.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Z-Score Analysis Sub-Tab ────────────────────────────────────────────────

const Z_SCORE_EXTENDED = [
  { round: "2022-R1", Isc: 0.8, Voc: -0.3, Pmax: 1.1 },
  { round: "2022-R2", Isc: -0.5, Voc: 0.2, Pmax: -0.4 },
  { round: "2023-R1", Isc: 0.2, Voc: -0.5, Pmax: 0.8 },
  { round: "2023-R2", Isc: -0.3, Voc: -0.8, Pmax: 0.3 },
  { round: "2024-R1", Isc: 0.6, Voc: -1.1, Pmax: 1.2 },
  { round: "2024-R2", Isc: -0.1, Voc: -0.9, Pmax: 0.5 },
  { round: "2025-R1", Isc: 0.45, Voc: -1.20, Pmax: 0.89 },
  { round: "2025-R2", Isc: -0.2, Voc: -1.5, Pmax: 0.6 },
];

const PARAM_ZSCORE_SUMMARY = [
  { param: "Isc", meanZ: 0.13, stdZ: 0.43, withinLimits: 100, latestZ: -0.2 },
  { param: "Voc", meanZ: -0.76, stdZ: 0.49, withinLimits: 100, latestZ: -1.5 },
  { param: "Pmax", meanZ: 0.62, stdZ: 0.47, withinLimits: 100, latestZ: 0.6 },
  { param: "ΔPmax (TC)", meanZ: -2.15, stdZ: 0, withinLimits: 0, latestZ: -2.15 },
  { param: "Insul. Res.", meanZ: 0.12, stdZ: 0, withinLimits: 100, latestZ: 0.12 },
  { param: "Spectral Irr.", meanZ: 3.20, stdZ: 0, withinLimits: 0, latestZ: 3.20 },
];

function ZScoreAnalysisTab() {
  const allZScores = PT_RECORDS.map(r => r.zScore);
  const meanZ = allZScores.reduce((a, b) => a + b, 0) / allZScores.length;
  const stdZ = Math.sqrt(allZScores.reduce((a, b) => a + (b - meanZ) ** 2, 0) / allZScores.length);
  const withinTwo = allZScores.filter(z => Math.abs(z) <= 2).length;
  const withinThree = allZScores.filter(z => Math.abs(z) <= 3).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
        <Target className="h-4 w-4 shrink-0 mt-0.5" />
        <span><strong>ISO 17025 Clause 7.7.2:</strong> z-score evaluation — |z| ≤ 2: Satisfactory (green), 2 &lt; |z| ≤ 3: Questionable (amber), |z| &gt; 3: Unsatisfactory (red). En ≤ 1: Satisfactory.</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Mean z-Score</div>
            <div className="text-2xl font-bold text-blue-600">{meanZ.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">All parameters</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Std Dev (z)</div>
            <div className="text-2xl font-bold text-purple-600">{stdZ.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Across PT records</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Within |z| ≤ 2</div>
            <div className="text-2xl font-bold text-green-600">{Math.round((withinTwo / allZScores.length) * 100)}%</div>
            <div className="text-xs text-muted-foreground">{withinTwo}/{allZScores.length} parameters</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Within |z| ≤ 3</div>
            <div className="text-2xl font-bold text-amber-600">{Math.round((withinThree / allZScores.length) * 100)}%</div>
            <div className="text-xs text-muted-foreground">{withinThree}/{allZScores.length} parameters</div>
          </CardContent>
        </Card>
      </div>

      {/* Historical z-Score Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" /> Historical z-Score Trend (2022–2025)
          </CardTitle>
          <CardDescription className="text-xs">Color zones: Green |z|≤2, Amber 2&lt;|z|≤3, Red |z|&gt;3</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={Z_SCORE_EXTENDED} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="round" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[-4, 4]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "+2σ", fontSize: 9, position: "right" }} />
              <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "-2σ", fontSize: 9, position: "right" }} />
              <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "+3σ", fontSize: 9, position: "right" }} />
              <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "-3σ", fontSize: 9, position: "right" }} />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
              <Line type="monotone" dataKey="Isc" stroke="#3b82f6" dot={{ r: 4 }} strokeWidth={2} />
              <Line type="monotone" dataKey="Voc" stroke="#8b5cf6" dot={{ r: 4 }} strokeWidth={2} />
              <Line type="monotone" dataKey="Pmax" stroke="#10b981" dot={{ r: 4 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Parameter-wise z-Score Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Parameter-wise Latest z-Scores & En Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PT_RECORDS.map(r => ({ name: r.parameter.split(" ")[0], zScore: r.zScore, En: r.enNumber ?? 0 }))} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="4 4" />
              <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="4 4" />
              <Bar dataKey="zScore" name="z-Score" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="En" name="En Number" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Parameter Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["Parameter", "Latest z", "Mean z", "Std Dev", "% Within Limits", "Status"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PARAM_ZSCORE_SUMMARY.map((p, i) => (
                  <tr key={p.param} className={`border-b hover:bg-muted/30 ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                    <td className="px-3 py-2 font-medium">{p.param}</td>
                    <td className={cn("px-3 py-2 font-mono font-bold", zScoreColor(p.latestZ))}>{p.latestZ > 0 ? "+" : ""}{p.latestZ.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono">{p.meanZ.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono">{p.stdZ.toFixed(2)}</td>
                    <td className={cn("px-3 py-2 font-bold", p.withinLimits === 100 ? "text-green-600" : p.withinLimits >= 80 ? "text-amber-600" : "text-red-600")}>{p.withinLimits}%</td>
                    <td className="px-3 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold",
                        Math.abs(p.latestZ) <= 2 ? "bg-green-50 text-green-700" : Math.abs(p.latestZ) <= 3 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                      )}>
                        {Math.abs(p.latestZ) <= 2 ? "Pass" : Math.abs(p.latestZ) <= 3 ? "Questionable" : "Unsatisfactory"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced: Radar Chart + Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar/Spider Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Parameter-wise z-Score Radar Chart</CardTitle>
            <CardDescription className="text-xs">|z| values plotted on radar &mdash; smaller area = better performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={PARAM_ZSCORE_SUMMARY.map(p => ({ param: p.param, z: Math.abs(p.latestZ) }))}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="param" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 4]} tick={{ fontSize: 9 }} />
                <Radar name="|z-Score|" dataKey="z" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Waterfall / Historical z-Score Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">z-Score History Area Chart (Pmax)</CardTitle>
            <CardDescription className="text-xs">Visualizing z-score magnitude evolution over PT rounds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={Z_SCORE_EXTENDED} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="round" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[-4, 4]} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="4 4" />
                <ReferenceLine y={-2} stroke="#f59e0b" strokeDasharray="4 4" />
                <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="4 4" />
                <ReferenceLine y={-3} stroke="#ef4444" strokeDasharray="4 4" />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
                <Area type="monotone" dataKey="Pmax" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="Isc" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="Voc" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Downloadable Report Template */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> z-Score Analysis Report</CardTitle>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7"><Download className="h-3 w-3" /> Download Report</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-3 bg-muted/20 text-xs text-center">
            <p className="font-bold text-foreground">SolarLabX PV Testing Laboratory</p>
            <p className="text-muted-foreground">z-Score Analysis Report &mdash; RPT-ZSC-2026-001</p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="border rounded p-2 text-center">
              <p className="text-muted-foreground">Mean |z|</p>
              <p className="text-lg font-bold text-blue-600">{(allZScores.reduce((a, b) => a + Math.abs(b), 0) / allZScores.length).toFixed(2)}</p>
            </div>
            <div className="border rounded p-2 text-center">
              <p className="text-muted-foreground">Within ±2σ</p>
              <p className="text-lg font-bold text-green-600">{Math.round((withinTwo / allZScores.length) * 100)}%</p>
            </div>
            <div className="border rounded p-2 text-center">
              <p className="text-muted-foreground">Unsatisfactory</p>
              <p className="text-lg font-bold text-red-600">{allZScores.filter(z => Math.abs(z) > 3).length}</p>
            </div>
            <div className="border rounded p-2 text-center">
              <p className="text-muted-foreground">PT Rounds</p>
              <p className="text-lg font-bold text-purple-600">{Z_SCORE_EXTENDED.length}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Summary &amp; Actions:</p>
            <p>{Math.round((withinTwo / allZScores.length) * 100)}% of z-scores fall within |z| ≤ 2 (satisfactory). Spectral Irradiance measurement (z=3.20) requires immediate corrective action. Voc shows slight negative bias trend &mdash; monitor in next round. All other parameters stable and within control limits.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-3">
            {[{ role: "Prepared By", name: "S. Rao" }, { role: "Reviewed By", name: "A. Mehta" }, { role: "Approved By", name: "Dr. S. Kumar" }].map(s => (
              <div key={s.role} className="text-xs space-y-1">
                <p className="font-semibold text-foreground">{s.role}</p>
                <div className="border-b border-dashed border-muted-foreground/50 h-6" />
                <p className="text-muted-foreground">{s.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Replicate Testing Sub-Tab ──────────────────────────────────────────────

interface ReplicateRecord {
  id: string; parameter: string; unit: string; sampleId: string;
  measurements: number[]; mean: number; stdDev: number; rsd: number;
}

const REPLICATE_RECORDS: ReplicateRecord[] = [
  { id: "REP-001", parameter: "Pmax", unit: "W", sampleId: "MOD-2026-042", measurements: [400.2, 400.5, 399.8, 400.1, 400.3], mean: 400.18, stdDev: 0.25, rsd: 0.062 },
  { id: "REP-002", parameter: "Isc", unit: "A", sampleId: "MOD-2026-042", measurements: [9.82, 9.85, 9.81, 9.83, 9.84], mean: 9.83, stdDev: 0.016, rsd: 0.163 },
  { id: "REP-003", parameter: "Voc", unit: "V", sampleId: "MOD-2026-042", measurements: [46.3, 46.2, 46.4, 46.3, 46.2], mean: 46.28, stdDev: 0.084, rsd: 0.181 },
  { id: "REP-004", parameter: "Pmax", unit: "W", sampleId: "MOD-2026-055", measurements: [385.1, 385.8, 384.9, 386.2, 385.5], mean: 385.50, stdDev: 0.52, rsd: 0.135 },
  { id: "REP-005", parameter: "Isc", unit: "A", sampleId: "MOD-2026-055", measurements: [9.55, 9.58, 9.53, 9.60, 9.56], mean: 9.564, stdDev: 0.027, rsd: 0.282 },
  { id: "REP-006", parameter: "Voc", unit: "V", sampleId: "MOD-2026-055", measurements: [45.1, 45.0, 45.3, 45.1, 45.2], mean: 45.14, stdDev: 0.114, rsd: 0.253 },
  { id: "REP-007", parameter: "FF", unit: "%", sampleId: "MOD-2026-042", measurements: [78.5, 78.3, 78.6, 78.4, 78.5], mean: 78.46, stdDev: 0.114, rsd: 0.145 },
  { id: "REP-008", parameter: "Efficiency", unit: "%", sampleId: "MOD-2026-042", measurements: [21.2, 21.3, 21.1, 21.2, 21.3], mean: 21.22, stdDev: 0.084, rsd: 0.396 },
];

function rsdColor(rsd: number) {
  if (rsd < 1) return "text-green-700";
  if (rsd < 2) return "text-amber-700";
  return "text-red-700";
}

const repeatabilityTrend = [
  { month: "Oct-25", Pmax: 0.06, Isc: 0.15, Voc: 0.18 },
  { month: "Nov-25", Pmax: 0.07, Isc: 0.17, Voc: 0.16 },
  { month: "Dec-25", Pmax: 0.05, Isc: 0.14, Voc: 0.20 },
  { month: "Jan-26", Pmax: 0.08, Isc: 0.16, Voc: 0.19 },
  { month: "Feb-26", Pmax: 0.06, Isc: 0.18, Voc: 0.17 },
  { month: "Mar-26", Pmax: 0.062, Isc: 0.163, Voc: 0.181 },
];

const boxPlotData = REPLICATE_RECORDS.filter(r => r.sampleId === "MOD-2026-042").map(r => ({
  name: r.parameter,
  min: Math.min(...r.measurements),
  max: Math.max(...r.measurements),
  mean: r.mean,
  q1: r.mean - r.stdDev,
  q3: r.mean + r.stdDev,
}));

function ReplicateTestingTab() {
  const rsdData = REPLICATE_RECORDS.map(r => ({ name: `${r.parameter} (${r.sampleId.slice(-3)})`, rsd: r.rsd }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-800">
        <Copy className="h-4 w-4 shrink-0 mt-0.5" />
        <span><strong>ISO 17025 Clause 7.7.1:</strong> Replicate testing monitors measurement repeatability. %RSD &lt; 1%: Excellent, 1-2%: Acceptable, &gt; 2%: Investigation required.</span>
      </div>

      {/* Protocol / Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-green-600" /> Replicate Testing Protocol
          </CardTitle>
          <CardDescription className="text-xs">Standard operating procedure for replicate measurements per ISO 17025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border rounded-lg p-3 bg-muted/20">
            <div><span className="text-muted-foreground">Sample ID:</span> <span className="font-mono font-bold text-foreground">MOD-2026-042</span></div>
            <div><span className="text-muted-foreground">Test Method:</span> <span className="font-medium text-foreground">IEC 60904-1</span></div>
            <div><span className="text-muted-foreground">No. of Replicates:</span> <span className="font-bold text-foreground">5</span></div>
            <div><span className="text-muted-foreground">Acceptance:</span> <span className="font-bold text-green-600">%RSD &lt; 2%</span></div>
          </div>
          <div className="text-xs space-y-1.5">
            <p className="font-semibold text-foreground">Procedure Checklist:</p>
            {[
              "Verify equipment calibration status before testing",
              "Condition sample at STC (25°C ± 2°C) for minimum 30 minutes",
              "Perform 5 consecutive IV curve measurements",
              "Record ambient conditions (irradiance, temperature, humidity)",
              "Calculate mean, std dev, and %RSD for each parameter",
              "Compare %RSD against acceptance thresholds",
              "Document results and sign off",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 border-2 border-green-400 rounded shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{i + 1}. {step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* %RSD Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">%RSD by Parameter</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rsdData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <ReferenceLine y={1} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "1%", fontSize: 9 }} />
              <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "2%", fontSize: 9 }} />
              <Bar dataKey="rsd" name="%RSD" fill="#10b981" radius={[3, 3, 0, 0]}>
                {rsdData.map((entry, i) => (
                  <Cell key={i} fill={entry.rsd < 1 ? "#10b981" : entry.rsd < 2 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Box-and-Whisker Style (Min/Mean/Max bars) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Measurement Distribution (MOD-2026-042)</CardTitle>
            <CardDescription className="text-xs">Min/Mean/Max range per parameter</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={boxPlotData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="min" name="Min" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="mean" name="Mean" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="max" name="Max" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Repeatability Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Repeatability Trend (%RSD over Time)</CardTitle>
            <CardDescription className="text-xs">Monthly %RSD tracking for key parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={repeatabilityTrend} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 0.3]} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine y={0.2} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Warning", fontSize: 9 }} />
                <Line type="monotone" dataKey="Pmax" stroke="#10b981" dot={{ r: 3 }} strokeWidth={2} />
                <Line type="monotone" dataKey="Isc" stroke="#3b82f6" dot={{ r: 3 }} strokeWidth={2} />
                <Line type="monotone" dataKey="Voc" stroke="#8b5cf6" dot={{ r: 3 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* %RSD Gauge Zones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">%RSD Zone Classification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {REPLICATE_RECORDS.filter((_, i) => i < 4).map(r => (
              <div key={r.id} className="flex items-center gap-3 text-xs">
                <span className="w-32 font-medium text-foreground truncate">{r.parameter} ({r.sampleId.slice(-3)})</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden bg-muted relative">
                  <div className="absolute inset-0 flex">
                    <div className="bg-green-500/20 flex-[1]" />
                    <div className="bg-amber-500/20 flex-[1]" />
                    <div className="bg-red-500/20 flex-[1]" />
                  </div>
                  <div className="absolute top-0 h-full w-1 bg-foreground rounded" style={{ left: `${Math.min(r.rsd / 3 * 100, 100)}%` }} />
                </div>
                <span className={cn("w-16 text-right font-mono font-bold", rsdColor(r.rsd))}>{r.rsd.toFixed(3)}%</span>
                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", r.rsd < 1 ? "bg-green-50 text-green-700" : r.rsd < 2 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>
                  {r.rsd < 1 ? "Excellent" : r.rsd < 2 ? "Acceptable" : "Investigate"}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-4 text-[10px] mt-2 text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30 inline-block" /> Excellent (&lt;1%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/30 inline-block" /> Acceptable (1-2%)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 inline-block" /> Investigation (&gt;2%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements Log Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Replicate Measurements Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["ID", "Sample", "Parameter", "Measurements", "Mean", "Std Dev", "%RSD", "Status"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REPLICATE_RECORDS.map((r, i) => (
                  <tr key={r.id} className={`border-b hover:bg-muted/30 ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                    <td className="px-3 py-2 font-mono text-blue-700">{r.id}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.sampleId}</td>
                    <td className="px-3 py-2 font-medium">{r.parameter} ({r.unit})</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.measurements.join(", ")}</td>
                    <td className="px-3 py-2 font-mono font-bold">{r.mean.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono">{r.stdDev.toFixed(3)}</td>
                    <td className={cn("px-3 py-2 font-mono font-bold", rsdColor(r.rsd))}>{r.rsd.toFixed(3)}%</td>
                    <td className="px-3 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold",
                        r.rsd < 1 ? "bg-green-50 text-green-700" : r.rsd < 2 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                      )}>
                        {r.rsd < 1 ? "Excellent" : r.rsd < 2 ? "Acceptable" : "Investigate"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report Format */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-green-600" /> Replicate Testing Report</CardTitle>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7"><Download className="h-3 w-3" /> Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-3 bg-muted/20 text-xs">
            <div className="text-center mb-2">
              <p className="font-bold text-foreground">SolarLabX PV Testing Laboratory</p>
              <p className="text-muted-foreground">Replicate Testing Report &mdash; RPT-REP-2026-008</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div><span className="text-muted-foreground">Date:</span> 21-Mar-2026</div>
              <div><span className="text-muted-foreground">Method:</span> IEC 60904-1</div>
              <div><span className="text-muted-foreground">Replicates:</span> 5</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Conclusions:</p>
            <p>All parameters tested show %RSD well below the 2% investigation threshold. Measurement repeatability is confirmed satisfactory for Pmax (0.062%), Isc (0.163%), Voc (0.181%), FF (0.145%), and Efficiency (0.396%). No corrective actions required.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-3">
            {[{ role: "Tested By", name: "S. Patel" }, { role: "Reviewed By", name: "A. Mehta" }, { role: "Approved By", name: "Dr. S. Kumar" }].map(s => (
              <div key={s.role} className="text-xs space-y-1">
                <p className="font-semibold text-foreground">{s.role}</p>
                <div className="border-b border-dashed border-muted-foreground/50 h-6" />
                <p className="text-muted-foreground">{s.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Blind Testing Sub-Tab ──────────────────────────────────────────────────

interface BlindRecord {
  id: string; sampleId: string; parameter: string; unit: string;
  trueValue: number; measuredValue: number; bias: number; pctBias: number; acceptableLimit: number; status: "Pass" | "Fail";
}

const BLIND_RECORDS: BlindRecord[] = [
  { id: "BLD-001", sampleId: "BLD-PV-001", parameter: "Pmax", unit: "W", trueValue: 400.0, measuredValue: 400.8, bias: 0.8, pctBias: 0.20, acceptableLimit: 1.0, status: "Pass" },
  { id: "BLD-002", sampleId: "BLD-PV-001", parameter: "Isc", unit: "A", trueValue: 9.80, measuredValue: 9.83, bias: 0.03, pctBias: 0.31, acceptableLimit: 1.0, status: "Pass" },
  { id: "BLD-003", sampleId: "BLD-PV-002", parameter: "Pmax", unit: "W", trueValue: 385.0, measuredValue: 386.5, bias: 1.5, pctBias: 0.39, acceptableLimit: 1.0, status: "Pass" },
  { id: "BLD-004", sampleId: "BLD-PV-002", parameter: "Voc", unit: "V", trueValue: 45.50, measuredValue: 45.02, bias: -0.48, pctBias: -1.05, acceptableLimit: 1.0, status: "Fail" },
  { id: "BLD-005", sampleId: "BLD-PV-003", parameter: "Pmax", unit: "W", trueValue: 410.0, measuredValue: 410.3, bias: 0.3, pctBias: 0.07, acceptableLimit: 1.0, status: "Pass" },
  { id: "BLD-006", sampleId: "BLD-PV-003", parameter: "Efficiency", unit: "%", trueValue: 21.50, measuredValue: 21.45, bias: -0.05, pctBias: -0.23, acceptableLimit: 1.0, status: "Pass" },
];

const biasHistogramData = [
  { range: "-1.5 to -1.0", count: 1 },
  { range: "-1.0 to -0.5", count: 0 },
  { range: "-0.5 to 0.0", count: 1 },
  { range: "0.0 to 0.5", count: 3 },
  { range: "0.5 to 1.0", count: 1 },
];

const biasPerParam = BLIND_RECORDS.map(r => ({ name: `${r.parameter} (${r.sampleId.slice(-3)})`, pctBias: r.pctBias }));

function BlindTestingTab() {
  const passCount = BLIND_RECORDS.filter(r => r.status === "Pass").length;
  const chartData = BLIND_RECORDS.map(r => ({
    name: `${r.parameter} (${r.sampleId.slice(-3)})`,
    True: r.trueValue,
    Measured: r.measuredValue,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-800">
        <EyeOff className="h-4 w-4 shrink-0 mt-0.5" />
        <span><strong>Blind Testing (ISO 17025 Clause 7.7.1):</strong> Samples tested without knowledge of true values. %Bias within ±{BLIND_RECORDS[0]?.acceptableLimit}% is acceptable. {passCount}/{BLIND_RECORDS.length} passed.</span>
      </div>

      {/* Protocol */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-purple-600" /> Blind Sample Management Protocol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Sample Coding Procedure:</p>
              <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                <li>Quality Manager assigns unique blind code (BLD-PV-XXX)</li>
                <li>True values sealed in envelope, stored securely</li>
                <li>Samples submitted to lab with blind code only</li>
                <li>Operator performs routine testing per standard SOP</li>
                <li>Results recorded against blind code</li>
                <li>Quality Manager decodes and calculates bias</li>
              </ol>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Bias Detection Methodology:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>%Bias = (Measured - True) / True × 100</li>
                <li>Acceptance: |%Bias| ≤ 1.0% for electrical parameters</li>
                <li>Systematic bias: &gt;3 consecutive same-sign biases</li>
                <li>Failed samples trigger CAPA investigation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">True vs Measured Values</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="True" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Measured" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scatter: True vs Measured with 1:1 line */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">True vs Measured Scatter (1:1 Reference)</CardTitle>
            <CardDescription className="text-xs">Points on the diagonal indicate zero bias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" name="True Value" tick={{ fontSize: 10 }} label={{ value: "True Value", fontSize: 10, position: "bottom", offset: 5 }} />
                <YAxis type="number" dataKey="y" name="Measured" tick={{ fontSize: 10 }} label={{ value: "Measured", fontSize: 10, angle: -90, position: "insideLeft" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ strokeDasharray: "3 3" }} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 500, y: 500 }]} stroke="#6b7280" strokeDasharray="4 4" />
                <Scatter data={BLIND_RECORDS.map(r => ({ x: r.trueValue, y: r.measuredValue, name: r.parameter }))} fill="#8b5cf6">
                  {BLIND_RECORDS.map((r, i) => (
                    <Cell key={i} fill={r.status === "Pass" ? "#10b981" : "#ef4444"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* %Bias Bar per Parameter */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">%Bias per Parameter</CardTitle>
            <CardDescription className="text-xs">Green: within ±1%, Red: outside limits</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={biasPerParam} layout="vertical" margin={{ top: 4, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={100} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine x={1} stroke="#ef4444" strokeDasharray="4 4" />
                <ReferenceLine x={-1} stroke="#ef4444" strokeDasharray="4 4" />
                <ReferenceLine x={0} stroke="#6b7280" strokeWidth={1} />
                <Bar dataKey="pctBias" name="%Bias" radius={[0, 3, 3, 0]}>
                  {biasPerParam.map((entry, i) => (
                    <Cell key={i} fill={Math.abs(entry.pctBias) <= 1 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bias Histogram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Bias Distribution Histogram</CardTitle>
          <CardDescription className="text-xs">Distribution of %Bias values across all blind samples</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={biasHistogramData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="Frequency" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Blind Sample Results</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["ID", "Sample", "Parameter", "True Value", "Measured", "Bias", "%Bias", "Limit", "Status"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLIND_RECORDS.map((r, i) => (
                  <tr key={r.id} className={cn("border-b hover:bg-muted/30", i % 2 !== 0 ? "bg-muted/10" : "", r.status === "Fail" ? "bg-red-50/50" : "")}>
                    <td className="px-3 py-2 font-mono text-purple-700">{r.id}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{r.sampleId}</td>
                    <td className="px-3 py-2 font-medium">{r.parameter} ({r.unit})</td>
                    <td className="px-3 py-2 font-mono">{r.trueValue}</td>
                    <td className="px-3 py-2 font-mono">{r.measuredValue}</td>
                    <td className={cn("px-3 py-2 font-mono font-bold", r.bias >= 0 ? "text-blue-700" : "text-red-700")}>{r.bias > 0 ? "+" : ""}{r.bias.toFixed(2)}</td>
                    <td className={cn("px-3 py-2 font-mono font-bold", Math.abs(r.pctBias) <= r.acceptableLimit ? "text-green-700" : "text-red-700")}>{r.pctBias > 0 ? "+" : ""}{r.pctBias.toFixed(2)}%</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">±{r.acceptableLimit}%</td>
                    <td className="px-3 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", r.status === "Pass" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-purple-600" /> Blind Testing Evaluation Report</CardTitle>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7"><Download className="h-3 w-3" /> Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-3 bg-muted/20 text-xs text-center">
            <p className="font-bold text-foreground">SolarLabX PV Testing Laboratory</p>
            <p className="text-muted-foreground">Blind Testing Evaluation Report &mdash; RPT-BLD-2026-003</p>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Bias Analysis Conclusions:</p>
            <p>{passCount} of {BLIND_RECORDS.length} blind samples passed within ±1.0% bias acceptance criteria. One Voc measurement (BLD-PV-002) showed -1.05% bias exceeding the limit &mdash; CAPA investigation initiated for potential systematic offset in voltage measurement channel.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-3">
            {[{ role: "Tested By", name: "R. Kumar" }, { role: "Reviewed By", name: "A. Mehta" }, { role: "Approved By", name: "Dr. S. Kumar" }].map(s => (
              <div key={s.role} className="text-xs space-y-1">
                <p className="font-semibold text-foreground">{s.role}</p>
                <div className="border-b border-dashed border-muted-foreground/50 h-6" />
                <p className="text-muted-foreground">{s.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Alternative Method Testing Sub-Tab ─────────────────────────────────────

interface AltMethodRecord {
  id: string; parameter: string; unit: string;
  method1: string; method2: string;
  value1: number; value2: number; difference: number; average: number;
  r2: number; status: "Equivalent" | "Significant Diff.";
}

const ALT_METHOD_RECORDS: AltMethodRecord[] = [
  { id: "ALT-001", parameter: "Pmax", unit: "W", method1: "Simulator AAA+ (IEC 60904-1)", method2: "Outdoor STC (IEC 60904-3)", value1: 400.2, value2: 399.5, difference: 0.7, average: 399.85, r2: 0.9987, status: "Equivalent" },
  { id: "ALT-002", parameter: "Isc", unit: "A", method1: "Simulator AAA+ (IEC 60904-1)", method2: "Outdoor STC (IEC 60904-3)", value1: 9.82, value2: 9.78, difference: 0.04, average: 9.80, r2: 0.9992, status: "Equivalent" },
  { id: "ALT-003", parameter: "Voc", unit: "V", method1: "Simulator AAA+ (IEC 60904-1)", method2: "Outdoor STC (IEC 60904-3)", value1: 46.3, value2: 45.8, difference: 0.5, average: 46.05, r2: 0.9945, status: "Equivalent" },
  { id: "ALT-004", parameter: "Efficiency", unit: "%", method1: "IV Curve + Area (IEC 60904-1)", method2: "Calorimetric (IEC 61853-1)", value1: 21.3, value2: 20.8, difference: 0.5, average: 21.05, r2: 0.9820, status: "Significant Diff." },
  { id: "ALT-005", parameter: "Insulation Res.", unit: "MΩ", method1: "Megger (IEC 61730)", method2: "Hi-Pot Tester (IEC 61730)", value1: 1850, value2: 1840, difference: 10, average: 1845, r2: 0.9978, status: "Equivalent" },
];

function AltMethodTestingTab() {
  const meanDiff = ALT_METHOD_RECORDS.reduce((a, r) => a + r.difference, 0) / ALT_METHOD_RECORDS.length;
  const sdDiff = Math.sqrt(ALT_METHOD_RECORDS.reduce((a, r) => a + (r.difference - meanDiff) ** 2, 0) / ALT_METHOD_RECORDS.length);
  const blandAltmanData = ALT_METHOD_RECORDS.map(r => ({ x: r.average, y: r.difference, name: r.parameter }));
  const r2BarData = ALT_METHOD_RECORDS.map(r => ({ name: r.parameter, r2: r.r2 }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan-50 border border-cyan-200 text-xs text-cyan-800">
        <GitCompare className="h-4 w-4 shrink-0 mt-0.5" />
        <span><strong>ISO 17025 Clause 7.7.1:</strong> Method comparison studies verify equivalence between alternative test methods. R² ≥ 0.99 and differences within ±1.96 SD indicate acceptable agreement.</span>
      </div>

      {/* Protocol */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><ClipboardList className="h-4 w-4 text-cyan-600" /> Method Comparison Protocol</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border rounded-lg p-3 bg-muted/20">
            <div><span className="text-muted-foreground">Primary Method:</span> <span className="font-medium text-foreground">IEC 60904-1 Indoor</span></div>
            <div><span className="text-muted-foreground">Alt. Method:</span> <span className="font-medium text-foreground">IEC 60904-3 Outdoor</span></div>
            <div><span className="text-muted-foreground">Sample Set:</span> <span className="font-bold text-foreground">5 modules</span></div>
            <div><span className="text-muted-foreground">Acceptance:</span> <span className="font-bold text-green-600">R² ≥ 0.99</span></div>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Procedure:</p>
            <p>Test identical samples using both methods under controlled conditions. Calculate Bland-Altman difference statistics, regression R², slope, and intercept. Methods are considered equivalent if R² ≥ 0.99, slope within 0.98-1.02, and all differences fall within ±1.96 SD limits of agreement.</p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Bland-Altman Plot */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Enhanced Bland-Altman Plot</CardTitle>
          <CardDescription className="text-xs">Mean diff: {meanDiff.toFixed(2)} | Limits of Agreement: [{(meanDiff - 1.96 * sdDiff).toFixed(2)}, {(meanDiff + 1.96 * sdDiff).toFixed(2)}] | SD: {sdDiff.toFixed(3)}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" dataKey="x" name="Average" tick={{ fontSize: 10 }} label={{ value: "Average of Methods", fontSize: 10, position: "bottom", offset: 5 }} />
              <YAxis type="number" dataKey="y" name="Difference" tick={{ fontSize: 10 }} label={{ value: "Difference (M1 - M2)", fontSize: 10, angle: -90, position: "insideLeft" }} />
              <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ strokeDasharray: "3 3" }} />
              <ReferenceLine y={meanDiff} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: `Mean=${meanDiff.toFixed(2)}`, fontSize: 9, position: "right" }} />
              <ReferenceLine y={meanDiff + 1.96 * sdDiff} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `+1.96SD=${(meanDiff + 1.96 * sdDiff).toFixed(2)}`, fontSize: 9, position: "right" }} />
              <ReferenceLine y={meanDiff - 1.96 * sdDiff} stroke="#ef4444" strokeDasharray="4 4" label={{ value: `-1.96SD=${(meanDiff - 1.96 * sdDiff).toFixed(2)}`, fontSize: 9, position: "right" }} />
              <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1} />
              <Scatter data={blandAltmanData} fill="#6366f1">
                {blandAltmanData.map((_, i) => (
                  <Cell key={i} fill={ALT_METHOD_RECORDS[i].status === "Equivalent" ? "#10b981" : "#ef4444"} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Regression Plot */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Regression: Method 1 vs Method 2</CardTitle>
            <CardDescription className="text-xs">Overall R² = 0.9978 | Slope = 0.999 | Intercept = 0.12</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" name="Method 1" tick={{ fontSize: 10 }} label={{ value: "Method 1", fontSize: 10, position: "bottom", offset: 5 }} />
                <YAxis type="number" dataKey="y" name="Method 2" tick={{ fontSize: 10 }} label={{ value: "Method 2", fontSize: 10, angle: -90, position: "insideLeft" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={ALT_METHOD_RECORDS.map(r => ({ x: r.value1, y: r.value2, name: r.parameter }))} fill="#3b82f6">
                  {ALT_METHOD_RECORDS.map((r, i) => (
                    <Cell key={i} fill={r.r2 >= 0.99 ? "#10b981" : "#ef4444"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* R² Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">R² per Parameter</CardTitle>
            <CardDescription className="text-xs">Threshold: R² ≥ 0.99 (green), R² ≥ 0.98 (amber), R² &lt; 0.98 (red)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={r2BarData} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0.97, 1.0]} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0.99} stroke="#10b981" strokeDasharray="4 4" label={{ value: "R²=0.99", fontSize: 9 }} />
                <ReferenceLine y={0.98} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "R²=0.98", fontSize: 9 }} />
                <Bar dataKey="r2" name="R²" radius={[3, 3, 0, 0]}>
                  {r2BarData.map((entry, i) => (
                    <Cell key={i} fill={entry.r2 >= 0.99 ? "#10b981" : entry.r2 >= 0.98 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Method Comparison Results</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["ID", "Parameter", "Method 1", "Method 2", "Value 1", "Value 2", "Diff", "R²", "Status"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALT_METHOD_RECORDS.map((r, i) => (
                  <tr key={r.id} className={cn("border-b hover:bg-muted/30", i % 2 !== 0 ? "bg-muted/10" : "")}>
                    <td className="px-3 py-2 font-mono text-cyan-700">{r.id}</td>
                    <td className="px-3 py-2 font-medium">{r.parameter} ({r.unit})</td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[160px] truncate" title={r.method1}>{r.method1}</td>
                    <td className="px-3 py-2 text-muted-foreground max-w-[160px] truncate" title={r.method2}>{r.method2}</td>
                    <td className="px-3 py-2 font-mono">{r.value1}</td>
                    <td className="px-3 py-2 font-mono">{r.value2}</td>
                    <td className={cn("px-3 py-2 font-mono font-bold", Math.abs(r.difference) < 1 ? "text-green-700" : "text-amber-700")}>{r.difference > 0 ? "+" : ""}{r.difference.toFixed(2)}</td>
                    <td className={cn("px-3 py-2 font-mono font-bold", r.r2 >= 0.99 ? "text-green-700" : r.r2 >= 0.98 ? "text-amber-700" : "text-red-700")}>{r.r2.toFixed(4)}</td>
                    <td className="px-3 py-2">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", r.status === "Equivalent" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-600" /> Method Comparison Report</CardTitle>
            <Button size="sm" variant="outline" className="gap-1 text-xs h-7"><Download className="h-3 w-3" /> Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-3 bg-muted/20 text-xs text-center">
            <p className="font-bold text-foreground">SolarLabX PV Testing Laboratory</p>
            <p className="text-muted-foreground">Alternative Method Comparison Report &mdash; RPT-ALT-2026-002</p>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Conclusions:</p>
            <p>4 of 5 parameters demonstrate method equivalence (R² ≥ 0.99, differences within LoA). Efficiency measurement by calorimetric method (IEC 61853-1) shows significant systematic difference (R²=0.982) compared to IV curve method &mdash; calorimetric method not recommended as alternative for efficiency reporting without correction factor.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t pt-3">
            {[{ role: "Tested By", name: "S. Rao" }, { role: "Reviewed By", name: "A. Mehta" }, { role: "Approved By", name: "Dr. S. Kumar" }].map(s => (
              <div key={s.role} className="text-xs space-y-1">
                <p className="font-semibold text-foreground">{s.role}</p>
                <div className="border-b border-dashed border-muted-foreground/50 h-6" />
                <p className="text-muted-foreground">{s.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QCQATab() {
  const [subTab, setSubTab] = useState("pt");

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "PT Rounds (YTD)", value: "2", icon: FlaskConical, color: "text-blue-600", border: "border-l-blue-500" },
          { label: "Validated Methods", value: MV_RECORDS.filter(r => r.status === "Validated").length.toString(), icon: Microscope, color: "text-green-600", border: "border-l-green-500" },
          { label: "Fully Qualified Equip.", value: EQ_RECORDS.filter(r => r.pqStatus === "Qualified").length.toString(), icon: Settings, color: "text-purple-600", border: "border-l-purple-500" },
          { label: "Open NCs", value: NC_RECORDS.filter(r => r.status !== "Closed").length.toString(), icon: AlertTriangle, color: "text-amber-600", border: "border-l-amber-500" },
        ].map(s => (
          <Card key={s.label} className={cn("border-l-4", s.border)}>
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              <s.icon className={cn("h-6 w-6", s.color)} />
              <div>
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QC Control Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            QC Control Chart – Pmax Reference Module (Monthly)
          </CardTitle>
          <CardDescription className="text-xs">Shewhart X-bar chart with UCL/CL/LCL. Limits per ISO 17025 Clause 7.7.1</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={QC_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[396, 404]} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="UCL" stroke="#ef4444" dot={false} strokeDasharray="4 4" strokeWidth={1} />
              <Line type="monotone" dataKey="CL" stroke="#6366f1" dot={false} strokeDasharray="2 2" strokeWidth={1} />
              <Line type="monotone" dataKey="LCL" stroke="#ef4444" dot={false} strokeDasharray="4 4" strokeWidth={1} />
              <Line type="monotone" dataKey="Pmax" stroke="#10b981" dot={{ r: 4, fill: "#10b981" }} strokeWidth={2} name="Measured Pmax (W)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-auto flex-wrap bg-muted">
          <TabsTrigger value="pt" className="text-xs">
            <FlaskConical className="h-3 w-3 mr-1" /> Proficiency Testing
          </TabsTrigger>
          <TabsTrigger value="ilc" className="text-xs">
            <Zap className="h-3 w-3 mr-1" /> Inter-lab Comparison
          </TabsTrigger>
          <TabsTrigger value="mv" className="text-xs">
            <Microscope className="h-3 w-3 mr-1" /> Method Validation
          </TabsTrigger>
          <TabsTrigger value="eq" className="text-xs">
            <Settings className="h-3 w-3 mr-1" /> Equipment Qualification
          </TabsTrigger>
          <TabsTrigger value="nc" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" /> Non-Conformances
          </TabsTrigger>
          <TabsTrigger value="zscore" className="text-xs">
            <Target className="h-3 w-3 mr-1" /> Z-Score Analysis
          </TabsTrigger>
          <TabsTrigger value="replicate" className="text-xs">
            <Copy className="h-3 w-3 mr-1" /> Replicate Testing
          </TabsTrigger>
          <TabsTrigger value="blind" className="text-xs">
            <EyeOff className="h-3 w-3 mr-1" /> Blind Testing
          </TabsTrigger>
          <TabsTrigger value="alt-method" className="text-xs">
            <GitCompare className="h-3 w-3 mr-1" /> Alt. Method Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pt" className="mt-4"><ProficiencyTestingTab /></TabsContent>
        <TabsContent value="ilc" className="mt-4"><InterLabComparisonTab /></TabsContent>
        <TabsContent value="mv" className="mt-4"><MethodValidationTab /></TabsContent>
        <TabsContent value="eq" className="mt-4"><EquipmentQualificationTab /></TabsContent>
        <TabsContent value="nc" className="mt-4"><NCSection /></TabsContent>
        <TabsContent value="zscore" className="mt-4"><ZScoreAnalysisTab /></TabsContent>
        <TabsContent value="replicate" className="mt-4"><ReplicateTestingTab /></TabsContent>
        <TabsContent value="blind" className="mt-4"><BlindTestingTab /></TabsContent>
        <TabsContent value="alt-method" className="mt-4"><AltMethodTestingTab /></TabsContent>
      </Tabs>
    </div>
  );
}
