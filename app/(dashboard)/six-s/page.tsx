// @ts-nocheck
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard, ClipboardCheck, MapPin, Trophy, CheckCircle2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────── reusable components ───────── */
function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", colors[color] || colors.gray)}>{label}</span>;
}

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/60">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ───────── sample data ───────── */
const sixSLabels = ["Sort", "Set in Order", "Shine", "Standardize", "Sustain", "Safety"];

const zoneScores = [
  { zone: "Zone A – Flash Tester", scores: [90, 85, 88, 82, 78, 92], overall: 86 },
  { zone: "Zone B – Thermal Chambers", scores: [82, 80, 75, 78, 72, 88], overall: 79 },
  { zone: "Zone C – UV Test Area", scores: [95, 92, 90, 88, 85, 90], overall: 90 },
  { zone: "Zone D – Module Handling", scores: [70, 65, 60, 68, 62, 80], overall: 68 },
  { zone: "Zone E – Chemical Storage", scores: [88, 85, 82, 80, 78, 95], overall: 85 },
  { zone: "Zone F – EL Imaging Room", scores: [92, 88, 90, 85, 82, 88], overall: 88 },
];

const auditChecklist = [
  { category: "Sort (Seiri)", items: [
    { item: "Unnecessary items removed from workbench", status: true },
    { item: "Red-tagged items dispositioned within 48 hrs", status: true },
    { item: "Only active test samples on lab floor", status: false },
    { item: "Expired chemicals removed from storage", status: true },
  ]},
  { category: "Set in Order (Seiton)", items: [
    { item: "Tools returned to shadow boards", status: true },
    { item: "Cables and probes organized and labeled", status: false },
    { item: "Floor markings for equipment zones intact", status: true },
    { item: "Sample storage bins labeled (IEC standard ref)", status: true },
  ]},
  { category: "Shine (Seiso)", items: [
    { item: "Workstations cleaned at end of shift", status: true },
    { item: "Chamber interiors free of debris", status: true },
    { item: "No dust on optical equipment (EL camera, spectrometer)", status: true },
    { item: "Spill kits fully stocked", status: false },
  ]},
  { category: "Standardize (Seiketsu)", items: [
    { item: "6S checklist posted at each zone", status: true },
    { item: "Color-coded zones consistently applied", status: true },
    { item: "Standard work instructions displayed", status: true },
    { item: "Cleaning schedule followed and signed off", status: false },
  ]},
  { category: "Sustain (Shitsuke)", items: [
    { item: "Weekly 6S audit completed", status: true },
    { item: "Non-conformances tracked in CAPA", status: true },
    { item: "6S training completed (quarterly)", status: false },
    { item: "Management walkthrough (monthly)", status: true },
  ]},
  { category: "Safety", items: [
    { item: "Emergency exits clear and marked", status: true },
    { item: "PPE available and in good condition", status: true },
    { item: "First aid kit inspected (monthly)", status: true },
    { item: "MSDS sheets accessible for all chemicals", status: true },
  ]},
];

const leaderboard = [
  { name: "Priya Sharma", zone: "Zone C", audits: 12, avgScore: 92, trend: "up" },
  { name: "Ganesh Reddy", zone: "Zone A", audits: 10, avgScore: 88, trend: "up" },
  { name: "Arjun Kumar", zone: "Zone F", audits: 11, avgScore: 86, trend: "stable" },
  { name: "Meena Thakur", zone: "Zone E", audits: 9, avgScore: 85, trend: "up" },
  { name: "Ravi Patel", zone: "Zone B", audits: 8, avgScore: 79, trend: "down" },
  { name: "Sunita Joshi", zone: "Zone D", audits: 7, avgScore: 68, trend: "down" },
];

/* ───────── page ───────── */
export default function SixSPage() {
  const [tab, setTab] = useState("dashboard");

  const overallAvg = Math.round(zoneScores.reduce((s, z) => s + z.overall, 0) / zoneScores.length);
  const compliantZones = zoneScores.filter((z) => z.overall >= 80).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">6S Implementation</h1>
          <p className="text-sm text-gray-500 mt-1">Sort · Set in Order · Shine · Standardize · Sustain · Safety</p>
        </div>
        <div className="flex gap-3">
          <div className="card !py-2 !px-4 text-center">
            <p className="text-xs text-gray-500">Overall Score</p>
            <p className={cn("text-xl font-bold", overallAvg >= 80 ? "text-green-600" : "text-yellow-600")}>{overallAvg}%</p>
          </div>
          <div className="card !py-2 !px-4 text-center">
            <p className="text-xs text-gray-500">Compliant Zones</p>
            <p className="text-xl font-bold text-blue-600">{compliantZones}/{zoneScores.length}</p>
          </div>
          <div className="card !py-2 !px-4 text-center">
            <p className="text-xs text-gray-500">Last Audit</p>
            <p className="text-xl font-bold text-gray-700">Mar 18</p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs">
            <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-1.5 text-xs">
            <ClipboardCheck className="h-3.5 w-3.5" /> Audit Checklist
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5" /> Zone Scores
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1.5 text-xs">
            <Trophy className="h-3.5 w-3.5" /> Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">6S Category Averages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sixSLabels.map((label, idx) => {
              const avg = Math.round(zoneScores.reduce((s, z) => s + z.scores[idx], 0) / zoneScores.length);
              return (
                <div key={label} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">{idx + 1}. {label}</span>
                    <Badge label={avg >= 80 ? "Good" : avg >= 60 ? "Needs Work" : "Critical"} color={avg >= 80 ? "green" : avg >= 60 ? "yellow" : "red"} />
                  </div>
                  <ScoreBar score={avg} />
                </div>
              );
            })}
          </div>

          <h2 className="text-lg font-semibold mt-6">Zone Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zoneScores.map((z) => (
              <div key={z.zone} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 text-sm">{z.zone}</span>
                  <Badge label={`${z.overall}%`} color={z.overall >= 80 ? "green" : z.overall >= 60 ? "yellow" : "red"} />
                </div>
                <ScoreBar score={z.overall} />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Audit Checklist */}
        <TabsContent value="checklist" className="space-y-6 mt-4">
          <h2 className="text-lg font-semibold">6S Audit Checklist</h2>
          {auditChecklist.map((cat) => {
            const passed = cat.items.filter((i) => i.status).length;
            return (
              <div key={cat.category} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{cat.category}</h3>
                  <Badge label={`${passed}/${cat.items.length}`} color={passed === cat.items.length ? "green" : "yellow"} />
                </div>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.item} className="flex items-center gap-3 text-sm">
                      {item.status
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                      <span className={item.status ? "text-gray-700" : "text-red-600 font-medium"}>{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Zone Scores */}
        <TabsContent value="zones" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Zone-wise 6S Scores</h2>
          <DataTable
            columns={["Zone", ...sixSLabels, "Overall"]}
            rows={zoneScores.map((z) => [
              z.zone,
              ...z.scores.map((s, i) => <Badge key={i} label={`${s}`} color={s >= 80 ? "green" : s >= 60 ? "yellow" : "red"} />),
              <Badge key="o" label={`${z.overall}%`} color={z.overall >= 80 ? "green" : z.overall >= 60 ? "yellow" : "red"} />,
            ])}
          />
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">6S Champions Leaderboard</h2>
          <DataTable
            columns={["Rank", "Name", "Zone", "Audits Done", "Avg Score", "Trend"]}
            rows={leaderboard.map((p, i) => [
              <span key="r" className={cn("font-bold", i === 0 ? "text-yellow-600" : i === 1 ? "text-gray-500" : i === 2 ? "text-orange-600" : "text-gray-400")}>#{i + 1}</span>,
              p.name,
              p.zone,
              String(p.audits),
              <Badge key="s" label={`${p.avgScore}%`} color={p.avgScore >= 80 ? "green" : p.avgScore >= 60 ? "yellow" : "red"} />,
              p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : "→",
            ])}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
