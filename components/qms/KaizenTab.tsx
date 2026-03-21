// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp, CheckCircle2, Clock, XCircle, Plus, Download,
  BarChart3, Lightbulb, Target, Users, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type InitiativeStatus = "Proposed" | "In Progress" | "Completed" | "Rejected";
type KaizenCategory = "Process" | "Equipment" | "Safety" | "Quality" | "Cost";

interface KaizenEvent {
  id: string;
  date: string;
  description: string;
  category: KaizenCategory;
  impactScore: number;
  responsible: string;
  status: InitiativeStatus;
  beforeMetric: string;
  afterMetric: string;
  saving?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const KAIZEN_EVENTS: KaizenEvent[] = [
  {
    id: "KZN-001",
    date: "2026-01-08",
    description: "Standardize IV curve measurement procedure to reduce setup time",
    category: "Process",
    impactScore: 8,
    responsible: "Rajan Kumar",
    status: "Completed",
    beforeMetric: "45 min/sample",
    afterMetric: "28 min/sample",
    saving: "38% time reduction",
  },
  {
    id: "KZN-002",
    date: "2026-01-15",
    description: "Implement barcode scanning for sample chain of custody",
    category: "Quality",
    impactScore: 9,
    responsible: "Priya Sharma",
    status: "Completed",
    beforeMetric: "3.2% entry errors",
    afterMetric: "0.1% entry errors",
    saving: "97% error reduction",
  },
  {
    id: "KZN-003",
    date: "2026-02-01",
    description: "Redesign thermal chamber loading rack for better airflow",
    category: "Equipment",
    impactScore: 7,
    responsible: "Arvind Nair",
    status: "In Progress",
    beforeMetric: "±8°C uniformity",
    afterMetric: "±3°C (target)",
    saving: "Improved test validity",
  },
  {
    id: "KZN-004",
    date: "2026-02-10",
    description: "Automate calibration reminder notifications",
    category: "Process",
    impactScore: 6,
    responsible: "Meena Pillai",
    status: "Completed",
    beforeMetric: "Manual tracking, 2 missed/qtr",
    afterMetric: "0 missed calibrations",
    saving: "100% on-time calibration",
  },
  {
    id: "KZN-005",
    date: "2026-02-18",
    description: "Batch test reporting template for IEC 61215 series",
    category: "Process",
    impactScore: 8,
    responsible: "Suresh Menon",
    status: "In Progress",
    beforeMetric: "4 hrs/report",
    afterMetric: "1.5 hrs (target)",
    saving: "62% time reduction",
  },
  {
    id: "KZN-006",
    date: "2026-02-25",
    description: "Personal protective equipment upgrade for UV testing area",
    category: "Safety",
    impactScore: 9,
    responsible: "Kavya Reddy",
    status: "Completed",
    beforeMetric: "Basic UV goggles",
    afterMetric: "Full-face UV shields + gloves",
    saving: "Enhanced operator safety",
  },
  {
    id: "KZN-007",
    date: "2026-03-05",
    description: "Consolidate reagent purchasing for cost savings",
    category: "Cost",
    impactScore: 5,
    responsible: "Rajan Kumar",
    status: "Proposed",
    beforeMetric: "₹1.2L/quarter reagents",
    afterMetric: "₹0.8L (target)",
    saving: "₹40K/quarter",
  },
  {
    id: "KZN-008",
    date: "2026-03-10",
    description: "Cross-train technicians on sun simulator operation",
    category: "Process",
    impactScore: 7,
    responsible: "Priya Sharma",
    status: "Proposed",
    beforeMetric: "2 qualified operators",
    afterMetric: "5 qualified operators",
    saving: "Reduced bottlenecks",
  },
  {
    id: "KZN-009",
    date: "2026-03-12",
    description: "Replace aging reference cell with new calibrated unit",
    category: "Equipment",
    impactScore: 4,
    responsible: "Arvind Nair",
    status: "Rejected",
    beforeMetric: "Drift ±0.8%",
    afterMetric: "Not approved – budget constraints",
    saving: "Deferred to Q3 2026",
  },
];

const MONTHLY_TRENDS = [
  { month: "Oct '25", proposed: 2, inProgress: 1, completed: 1, rejected: 0 },
  { month: "Nov '25", proposed: 3, inProgress: 2, completed: 2, rejected: 1 },
  { month: "Dec '25", proposed: 1, inProgress: 3, completed: 3, rejected: 0 },
  { month: "Jan '26", proposed: 4, inProgress: 2, completed: 4, rejected: 1 },
  { month: "Feb '26", proposed: 3, inProgress: 3, completed: 3, rejected: 0 },
  { month: "Mar '26", proposed: 3, inProgress: 2, completed: 1, rejected: 1 },
];

const CATEGORY_COLORS: Record<KaizenCategory, string> = {
  Process: "#3b82f6",
  Equipment: "#8b5cf6",
  Safety: "#ef4444",
  Quality: "#10b981",
  Cost: "#f59e0b",
};

const STATUS_CONFIG: Record<InitiativeStatus, { color: string; icon: any; badge: string }> = {
  Proposed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Lightbulb, badge: "outline" },
  "In Progress": { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, badge: "outline" },
  Completed: { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2, badge: "outline" },
  Rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, badge: "outline" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function KaizenTab() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<InitiativeStatus | "All">("All");
  const [filterCategory, setFilterCategory] = useState<KaizenCategory | "All">("All");

  const filtered = KAIZEN_EVENTS.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.responsible.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || e.status === filterStatus;
    const matchCat = filterCategory === "All" || e.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const totals = {
    total: KAIZEN_EVENTS.length,
    completed: KAIZEN_EVENTS.filter((e) => e.status === "Completed").length,
    inProgress: KAIZEN_EVENTS.filter((e) => e.status === "In Progress").length,
    proposed: KAIZEN_EVENTS.filter((e) => e.status === "Proposed").length,
    avgImpact: (
      KAIZEN_EVENTS.reduce((s, e) => s + e.impactScore, 0) / KAIZEN_EVENTS.length
    ).toFixed(1),
  };

  const categoryData = (["Process", "Equipment", "Safety", "Quality", "Cost"] as KaizenCategory[]).map(
    (cat) => ({
      name: cat,
      count: KAIZEN_EVENTS.filter((e) => e.category === cat).length,
      fill: CATEGORY_COLORS[cat],
    })
  );

  const exportCSV = () => {
    const rows = [
      ["ID", "Date", "Description", "Category", "Impact Score", "Responsible", "Status", "Before", "After", "Saving"],
      ...KAIZEN_EVENTS.map((e) => [
        e.id, e.date, e.description, e.category, e.impactScore, e.responsible,
        e.status, e.beforeMetric, e.afterMetric, e.saving ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "kaizen-events.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Reference */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <span>
          <strong>ISO 17025:2017 Clause 8.6 – Improvement:</strong> The laboratory shall identify and select opportunities for improvement, implement actions and review the effectiveness.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Total Initiatives</div>
            <div className="text-2xl font-bold">{totals.total}</div>
            <div className="text-xs text-blue-600">All time</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold text-green-700">{totals.completed}</div>
            <div className="text-xs text-muted-foreground">{Math.round((totals.completed / totals.total) * 100)}% success rate</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold text-amber-700">{totals.inProgress}</div>
            <div className="text-xs text-muted-foreground">Active now</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Proposed</div>
            <div className="text-2xl font-bold text-purple-700">{totals.proposed}</div>
            <div className="text-xs text-muted-foreground">Awaiting review</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Avg Impact Score</div>
            <div className="text-2xl font-bold text-teal-700">{totals.avgImpact}</div>
            <div className="text-xs text-muted-foreground">out of 10</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" /> Monthly Improvement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MONTHLY_TRENDS} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#f59e0b" stackId="a" />
                <Bar dataKey="proposed" name="Proposed" fill="#3b82f6" stackId="a" />
                <Bar dataKey="rejected" name="Rejected" fill="#ef4444" stackId="a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" /> Improvements by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 4, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Kaizen Events Log
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search events…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-xs w-44"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="h-7 text-xs border rounded px-2 bg-background"
              >
                {["All", "Proposed", "In Progress", "Completed", "Rejected"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="h-7 text-xs border rounded px-2 bg-background"
              >
                {["All", "Process", "Equipment", "Safety", "Quality", "Cost"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportCSV}>
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
              <Button size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Kaizen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left py-2 px-3 font-medium">ID</th>
                <th className="text-left py-2 px-3 font-medium">Date</th>
                <th className="text-left py-2 px-3 font-medium">Description</th>
                <th className="text-left py-2 px-3 font-medium">Category</th>
                <th className="text-center py-2 px-3 font-medium">Impact</th>
                <th className="text-left py-2 px-3 font-medium">Responsible</th>
                <th className="text-left py-2 px-3 font-medium">Before</th>
                <th className="text-left py-2 px-3 font-medium">After / Saving</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev, i) => {
                const cfg = STATUS_CONFIG[ev.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={ev.id} className={`border-b hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="py-2 px-3 font-mono text-blue-700">{ev.id}</td>
                    <td className="py-2 px-3 text-muted-foreground">{ev.date}</td>
                    <td className="py-2 px-3 max-w-[220px]">
                      <p className="truncate" title={ev.description}>{ev.description}</p>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: CATEGORY_COLORS[ev.category] }}
                      >
                        {ev.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`font-bold ${ev.impactScore >= 8 ? "text-green-700" : ev.impactScore >= 6 ? "text-amber-700" : "text-gray-600"}`}
                      >
                        {ev.impactScore}/10
                      </span>
                    </td>
                    <td className="py-2 px-3">{ev.responsible}</td>
                    <td className="py-2 px-3 text-muted-foreground max-w-[100px]">
                      <p className="truncate" title={ev.beforeMetric}>{ev.beforeMetric}</p>
                    </td>
                    <td className="py-2 px-3 max-w-[130px]">
                      <p className="truncate text-green-700" title={ev.saving ?? ev.afterMetric}>
                        {ev.saving ?? ev.afterMetric}
                      </p>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {ev.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No kaizen events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Before/After Metrics Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-green-600" /> Before / After Metrics — Completed Improvements
          </CardTitle>
          <CardDescription className="text-xs">Visual snapshot of measurable outcomes from completed kaizen events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {KAIZEN_EVENTS.filter((e) => e.status === "Completed").map((ev) => (
              <div key={ev.id} className="border rounded-lg p-3 bg-green-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-green-700">{ev.id}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[ev.category] }}
                  >
                    {ev.category}
                  </span>
                </div>
                <p className="text-xs font-medium mb-2 leading-tight">{ev.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-red-50 border border-red-200 rounded p-1.5">
                    <div className="text-red-500 font-medium mb-0.5">Before</div>
                    <div className="text-red-700">{ev.beforeMetric}</div>
                  </div>
                  <ArrowUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 bg-green-50 border border-green-200 rounded p-1.5">
                    <div className="text-green-600 font-medium mb-0.5">After</div>
                    <div className="text-green-700">{ev.saving ?? ev.afterMetric}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> {ev.responsible}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
