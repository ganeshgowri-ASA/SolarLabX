// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageSquarePlus, CheckCircle2, Clock, XCircle, Eye, Download,
  Users, TrendingUp, BarChart3, Star, Send, Lightbulb
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type SuggestionStatus = "New" | "Under Review" | "Approved" | "Implemented" | "Rejected";
type SuggestionCategory = "Process" | "Safety" | "Equipment" | "Quality" | "Cost" | "Environment" | "IT";

interface Suggestion {
  id: string;
  submitter: string;
  date: string;
  category: SuggestionCategory;
  description: string;
  expectedBenefit: string;
  status: SuggestionStatus;
  reviewer?: string;
  implementationDate?: string;
  impact?: "High" | "Medium" | "Low";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SUGGESTIONS: Suggestion[] = [
  {
    id: "SUG-001",
    submitter: "Rajan Kumar",
    date: "2025-10-05",
    category: "Process",
    description: "Introduce digital checklist on tablet for pre-test equipment verification to eliminate paper-based forms",
    expectedBenefit: "Save 15 min/day per technician; reduce paper usage by 80%",
    status: "Implemented",
    reviewer: "Priya Sharma",
    implementationDate: "2025-11-15",
    impact: "High",
  },
  {
    id: "SUG-002",
    submitter: "Meena Pillai",
    date: "2025-10-18",
    category: "Safety",
    description: "Install UV-blocking film on windows adjacent to UV aging test chamber",
    expectedBenefit: "Reduce UV exposure risk for nearby workstations",
    status: "Implemented",
    reviewer: "Arvind Nair",
    implementationDate: "2025-12-01",
    impact: "High",
  },
  {
    id: "SUG-003",
    submitter: "Suresh Menon",
    date: "2025-11-02",
    category: "IT",
    description: "Dashboard widget showing real-time chamber temperature and humidity via IoT sensors",
    expectedBenefit: "Instant visibility; faster response to deviations; reduced manual monitoring",
    status: "Approved",
    reviewer: "Priya Sharma",
    impact: "High",
  },
  {
    id: "SUG-004",
    submitter: "Kavya Reddy",
    date: "2025-11-10",
    category: "Cost",
    description: "Negotiate bulk purchase agreement with calibration lab for 20% cost reduction",
    expectedBenefit: "Save ₹30K annually on external calibration costs",
    status: "Implemented",
    reviewer: "Rajan Kumar",
    implementationDate: "2026-01-01",
    impact: "Medium",
  },
  {
    id: "SUG-005",
    submitter: "Arvind Nair",
    date: "2025-11-22",
    category: "Quality",
    description: "Add uncertainty budget auto-calculation to IEC 60904-3 test report template",
    expectedBenefit: "Reduce calculation errors; save 30 min per report",
    status: "Under Review",
    reviewer: "Meena Pillai",
    impact: "High",
  },
  {
    id: "SUG-006",
    submitter: "Rajan Kumar",
    date: "2025-12-03",
    category: "Environment",
    description: "Set up solar-powered charging station for lab equipment batteries to reduce grid consumption",
    expectedBenefit: "Reduce lab electricity costs; improve sustainability metrics",
    status: "Under Review",
    reviewer: "Kavya Reddy",
    impact: "Medium",
  },
  {
    id: "SUG-007",
    submitter: "Priya Sharma",
    date: "2025-12-15",
    category: "Process",
    description: "Introduce weekly 5-minute stand-up meetings for cross-team test schedule alignment",
    expectedBenefit: "Reduce scheduling conflicts by 50%; improve cross-team communication",
    status: "Implemented",
    reviewer: "Suresh Menon",
    implementationDate: "2026-01-10",
    impact: "Medium",
  },
  {
    id: "SUG-008",
    submitter: "Meena Pillai",
    date: "2026-01-07",
    category: "Equipment",
    description: "Label all cable connections on sun simulator with color-coded tags for quick identification",
    expectedBenefit: "Reduce setup errors; speed up troubleshooting",
    status: "Approved",
    reviewer: "Arvind Nair",
    impact: "Low",
  },
  {
    id: "SUG-009",
    submitter: "Suresh Menon",
    date: "2026-01-20",
    category: "IT",
    description: "Automated email alert when calibration due date is within 30 days",
    expectedBenefit: "Zero missed calibrations; reduce manual tracking effort",
    status: "Implemented",
    reviewer: "Priya Sharma",
    implementationDate: "2026-02-15",
    impact: "High",
  },
  {
    id: "SUG-010",
    submitter: "Kavya Reddy",
    date: "2026-02-01",
    category: "Process",
    description: "Create visual work instruction cards (laminated) for each test station",
    expectedBenefit: "Faster onboarding of new staff; reduce SOP reference time",
    status: "New",
    impact: "Medium",
  },
  {
    id: "SUG-011",
    submitter: "Arvind Nair",
    date: "2026-02-14",
    category: "Quality",
    description: "Implement statistical process control chart for I-V curve repeatability across simulators",
    expectedBenefit: "Early detection of simulator drift; better IEC 60904-9 compliance",
    status: "Under Review",
    reviewer: "Meena Pillai",
    impact: "High",
  },
  {
    id: "SUG-012",
    submitter: "Rajan Kumar",
    date: "2026-02-25",
    category: "Safety",
    description: "Add emergency stop button accessible from both ends of the EL imaging station",
    expectedBenefit: "Enhanced electrical safety; compliance with local safety regulations",
    status: "Approved",
    reviewer: "Kavya Reddy",
    impact: "High",
  },
  {
    id: "SUG-013",
    submitter: "Priya Sharma",
    date: "2026-03-05",
    category: "Cost",
    description: "Reuse packaging foam from incoming samples for outgoing shipments instead of buying new foam",
    expectedBenefit: "Save ₹15K/year on packaging materials; reduce waste",
    status: "New",
    impact: "Low",
  },
  {
    id: "SUG-014",
    submitter: "Suresh Menon",
    date: "2026-03-12",
    category: "Process",
    description: "Add a shared digital library of IEC/ISO standards accessible on lab intranet",
    expectedBenefit: "Faster standard lookup; ensure everyone uses current versions",
    status: "Rejected",
    reviewer: "Rajan Kumar",
    impact: "Medium",
  },
];

const MONTHLY_SUGGESTIONS = [
  { month: "Oct '25", new: 2, implemented: 0, rejected: 0 },
  { month: "Nov '25", new: 4, implemented: 1, rejected: 0 },
  { month: "Dec '25", new: 2, implemented: 2, rejected: 0 },
  { month: "Jan '26", new: 3, implemented: 3, rejected: 0 },
  { month: "Feb '26", new: 3, implemented: 2, rejected: 0 },
  { month: "Mar '26", new: 2, implemented: 1, rejected: 1 },
];

const CATEGORY_COLORS: Record<SuggestionCategory, string> = {
  Process: "#3b82f6",
  Safety: "#ef4444",
  Equipment: "#8b5cf6",
  Quality: "#10b981",
  Cost: "#f59e0b",
  Environment: "#06b6d4",
  IT: "#6366f1",
};

const STATUS_CONFIG: Record<SuggestionStatus, { color: string; icon: any }> = {
  New: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: MessageSquarePlus },
  "Under Review": { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Eye },
  Approved: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: CheckCircle2 },
  Implemented: { color: "bg-green-50 text-green-700 border-green-200", icon: Star },
  Rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SuggestionTrackerTab() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<SuggestionStatus | "All">("All");
  const [filterCategory, setFilterCategory] = useState<SuggestionCategory | "All">("All");
  const [showForm, setShowForm] = useState(false);

  const filtered = SUGGESTIONS.filter((s) => {
    const matchSearch =
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.submitter.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    const matchCat = filterCategory === "All" || s.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const implemented = SUGGESTIONS.filter((s) => s.status === "Implemented").length;
  const implementationRate = Math.round((implemented / SUGGESTIONS.length) * 100);

  // Top contributors
  const contributorMap: Record<string, number> = {};
  SUGGESTIONS.forEach((s) => {
    contributorMap[s.submitter] = (contributorMap[s.submitter] ?? 0) + 1;
  });
  const topContributors = Object.entries(contributorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const categoryData = (["Process", "Safety", "Equipment", "Quality", "Cost", "Environment", "IT"] as SuggestionCategory[]).map(
    (cat) => ({
      name: cat,
      count: SUGGESTIONS.filter((s) => s.category === cat).length,
      fill: CATEGORY_COLORS[cat],
    })
  );

  const exportCSV = () => {
    const rows = [
      ["ID", "Submitter", "Date", "Category", "Description", "Expected Benefit", "Status", "Reviewer", "Implementation Date", "Impact"],
      ...SUGGESTIONS.map((s) => [
        s.id, s.submitter, s.date, s.category, s.description, s.expectedBenefit,
        s.status, s.reviewer ?? "", s.implementationDate ?? "", s.impact ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "suggestions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
        <Lightbulb className="h-4 w-4 text-purple-600 flex-shrink-0" />
        <span>
          <strong>Employee Suggestion System:</strong> Capturing lab improvement ideas from all staff in line with ISO 17025:2017 Clause 8.6 — continuous improvement culture.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Total Suggestions</div>
            <div className="text-2xl font-bold">{SUGGESTIONS.length}</div>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Implemented</div>
            <div className="text-2xl font-bold text-green-700">{implemented}</div>
            <div className="text-xs text-muted-foreground">{implementationRate}% implementation rate</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Pending Review</div>
            <div className="text-2xl font-bold text-amber-700">
              {SUGGESTIONS.filter((s) => s.status === "New" || s.status === "Under Review").length}
            </div>
            <div className="text-xs text-muted-foreground">Awaiting decision</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Contributors</div>
            <div className="text-2xl font-bold text-purple-700">{Object.keys(contributorMap).length}</div>
            <div className="text-xs text-muted-foreground">Unique submitters</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" /> Monthly Suggestion Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={MONTHLY_SUGGESTIONS} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="new" name="Submitted" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="implemented" name="Implemented" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" /> Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {topContributors.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <div className="flex-1 text-xs font-medium truncate">{name}</div>
                <div className="flex items-center gap-1">
                  <div
                    className="h-2 rounded-full bg-purple-400"
                    style={{ width: `${(count / topContributors[0][1]) * 60}px` }}
                  />
                  <span className="text-xs font-bold text-purple-700 w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-2">By Category</div>
              {categoryData.filter((c) => c.count > 0).map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground w-16 truncate">{cat.name}</span>
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(cat.count / SUGGESTIONS.length) * 80}px`, backgroundColor: cat.fill }}
                  />
                  <span className="text-xs font-bold" style={{ color: cat.fill }}>{cat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestion Form (collapsible) */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-600" /> Submit a New Suggestion
            </CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Hide Form" : "Open Form"}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Submitter Name</label>
                <Input placeholder="Your name" className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Category</label>
                <select className="w-full h-8 text-xs border rounded px-2 bg-background">
                  {["Process", "Safety", "Equipment", "Quality", "Cost", "Environment", "IT"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1 block">Suggestion Description</label>
                <textarea
                  placeholder="Describe your improvement suggestion in detail…"
                  className="w-full h-20 text-xs border rounded px-2 py-1.5 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium mb-1 block">Expected Benefit</label>
                <Input placeholder="What benefit do you expect? (time saved, cost reduced, safety improved…)" className="h-8 text-xs" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button size="sm" className="h-8 text-xs">
                  <Send className="h-3 w-3 mr-1" /> Submit Suggestion
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Suggestions Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" /> All Suggestions
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search suggestions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-xs w-44"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="h-7 text-xs border rounded px-2 bg-background"
              >
                {["All", "New", "Under Review", "Approved", "Implemented", "Rejected"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="h-7 text-xs border rounded px-2 bg-background"
              >
                {["All", "Process", "Safety", "Equipment", "Quality", "Cost", "Environment", "IT"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportCSV}>
                <Download className="h-3 w-3 mr-1" /> Export
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
                <th className="text-left py-2 px-3 font-medium">Submitter</th>
                <th className="text-left py-2 px-3 font-medium">Category</th>
                <th className="text-left py-2 px-3 font-medium">Description</th>
                <th className="text-left py-2 px-3 font-medium">Expected Benefit</th>
                <th className="text-left py-2 px-3 font-medium">Impact</th>
                <th className="text-left py-2 px-3 font-medium">Reviewer</th>
                <th className="text-left py-2 px-3 font-medium">Impl. Date</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const cfg = STATUS_CONFIG[s.status];
                const StatusIcon = cfg.icon;
                return (
                  <tr key={s.id} className={`border-b hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="py-2 px-3 font-mono text-purple-700">{s.id}</td>
                    <td className="py-2 px-3 text-muted-foreground">{s.date}</td>
                    <td className="py-2 px-3 font-medium">{s.submitter}</td>
                    <td className="py-2 px-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-white text-[10px] font-medium"
                        style={{ backgroundColor: CATEGORY_COLORS[s.category] }}
                      >
                        {s.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 max-w-[180px]">
                      <p className="truncate" title={s.description}>{s.description}</p>
                    </td>
                    <td className="py-2 px-3 max-w-[140px]">
                      <p className="truncate text-muted-foreground" title={s.expectedBenefit}>{s.expectedBenefit}</p>
                    </td>
                    <td className="py-2 px-3">
                      {s.impact && (
                        <span
                          className={`text-xs font-medium ${
                            s.impact === "High" ? "text-green-700" : s.impact === "Medium" ? "text-amber-700" : "text-gray-500"
                          }`}
                        >
                          {s.impact}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{s.reviewer ?? "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{s.implementationDate ?? "—"}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No suggestions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
