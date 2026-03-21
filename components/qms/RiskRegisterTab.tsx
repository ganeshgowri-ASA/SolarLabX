// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Download, Plus,
  TrendingDown, BarChart3, Eye
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type RiskCategory = "Technical" | "Operational" | "Financial" | "Compliance" | "Safety";
type RiskStatus = "Open" | "Mitigated" | "Closed";

interface Risk {
  id: string;
  description: string;
  category: RiskCategory;
  likelihood: number; // 1-5 (maps to Occurrence for RPN)
  impact: number;     // 1-5 (maps to Severity for RPN)
  detection: number;  // 1-10 (Detection score for RPN)
  mitigation: string;
  owner: string;
  status: RiskStatus;
  reviewDate: string;
  trend: "up" | "stable" | "down";
}

// ─── RPN / CPN helpers ──────────────────────────────────────────────────────

/** Map 1-5 likelihood to 1-10 occurrence scale */
function toOccurrence(likelihood: number): number {
  return likelihood * 2;
}

/** Map 1-5 impact to 1-10 severity scale */
function toSeverity(impact: number): number {
  return impact * 2;
}

/** RPN = Severity(1-10) x Occurrence(1-10) x Detection(1-10) */
function calcRPN(r: Risk): number {
  return toSeverity(r.impact) * toOccurrence(r.likelihood) * r.detection;
}

/** CPN = Severity(1-10) x Occurrence(1-10) */
function calcCPN(r: Risk): number {
  return toSeverity(r.impact) * toOccurrence(r.likelihood);
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const RISKS: Risk[] = [
  {
    id: "RSK-001",
    description: "Reference standard cell out-of-calibration detected mid-campaign",
    category: "Technical",
    likelihood: 3,
    impact: 5,
    detection: 6,
    mitigation: "Monthly verification against NABL-traceable reference; keep backup calibrated cell",
    owner: "Arvind Nair",
    status: "Open",
    reviewDate: "2026-04-01",
    trend: "stable",
  },
  {
    id: "RSK-002",
    description: "Loss of accreditation due to surveillance audit non-conformity",
    category: "Compliance",
    likelihood: 2,
    impact: 5,
    detection: 4,
    mitigation: "Internal pre-audit checklist; quarterly management review; corrective action register",
    owner: "Priya Sharma",
    status: "Mitigated",
    reviewDate: "2026-06-15",
    trend: "down",
  },
  {
    id: "RSK-003",
    description: "UV lamp aging causing spectral mismatch beyond IEC 60904-9 Class A limit",
    category: "Technical",
    likelihood: 4,
    impact: 4,
    detection: 7,
    mitigation: "Biannual spectral irradiance measurement; lamp replacement schedule at 1500 hr",
    owner: "Meena Pillai",
    status: "Open",
    reviewDate: "2026-05-01",
    trend: "up",
  },
  {
    id: "RSK-004",
    description: "Key technician attrition reducing test throughput capacity",
    category: "Operational",
    likelihood: 3,
    impact: 3,
    detection: 5,
    mitigation: "Cross-training program; documented SOPs; competitive retention package",
    owner: "Rajan Kumar",
    status: "Open",
    reviewDate: "2026-04-15",
    trend: "stable",
  },
  {
    id: "RSK-005",
    description: "ERP system downtime disrupting LIMS data entry during peak testing season",
    category: "Operational",
    likelihood: 2,
    impact: 3,
    detection: 3,
    mitigation: "Offline paper backup forms; cloud sync; vendor SLA for 4-hour recovery",
    owner: "Suresh Menon",
    status: "Mitigated",
    reviewDate: "2026-07-01",
    trend: "down",
  },
  {
    id: "RSK-006",
    description: "Budget overrun due to unexpected equipment repair in Q2",
    category: "Financial",
    likelihood: 3,
    impact: 3,
    detection: 6,
    mitigation: "10% contingency budget; preventive maintenance schedule; annual equipment insurance",
    owner: "Kavya Reddy",
    status: "Open",
    reviewDate: "2026-04-30",
    trend: "stable",
  },
  {
    id: "RSK-007",
    description: "UV radiation exposure to operators during IEC 62716 damp heat testing",
    category: "Safety",
    likelihood: 2,
    impact: 4,
    detection: 3,
    mitigation: "UV-rated PPE mandatory; safety interlock on chamber doors; annual safety training",
    owner: "Arvind Nair",
    status: "Mitigated",
    reviewDate: "2026-03-31",
    trend: "down",
  },
  {
    id: "RSK-008",
    description: "Data integrity breach in digital test records",
    category: "Compliance",
    likelihood: 1,
    impact: 5,
    detection: 2,
    mitigation: "Role-based access control; audit logs; encrypted backups; pen-test annually",
    owner: "Priya Sharma",
    status: "Closed",
    reviewDate: "2026-12-31",
    trend: "down",
  },
  {
    id: "RSK-009",
    description: "Delayed vendor delivery of test samples impacting schedule",
    category: "Operational",
    likelihood: 4,
    impact: 2,
    detection: 4,
    mitigation: "Buffer stock agreement; alternate supplier pre-qualified; client communication SOP",
    owner: "Rajan Kumar",
    status: "Open",
    reviewDate: "2026-05-15",
    trend: "stable",
  },
  {
    id: "RSK-010",
    description: "Client confidentiality breach via unsecured report sharing",
    category: "Compliance",
    likelihood: 1,
    impact: 4,
    detection: 2,
    mitigation: "Password-protected PDFs; secure client portal; staff confidentiality training",
    owner: "Suresh Menon",
    status: "Closed",
    reviewDate: "2026-12-31",
    trend: "down",
  },
];

const TREND_DATA = [
  { month: "Oct '25", open: 9, mitigated: 3, closed: 1 },
  { month: "Nov '25", open: 9, mitigated: 3, closed: 2 },
  { month: "Dec '25", open: 8, mitigated: 4, closed: 2 },
  { month: "Jan '26", open: 8, mitigated: 4, closed: 2 },
  { month: "Feb '26", open: 7, mitigated: 4, closed: 2 },
  { month: "Mar '26", open: 6, mitigated: 3, closed: 2 },
];

const CATEGORY_COLORS: Record<RiskCategory, string> = {
  Technical: "#8b5cf6",
  Operational: "#3b82f6",
  Financial: "#f59e0b",
  Compliance: "#ef4444",
  Safety: "#ec4899",
};

const STATUS_COLORS: Record<RiskStatus, string> = {
  Open: "bg-red-50 text-red-700 border-red-200",
  Mitigated: "bg-amber-50 text-amber-700 border-amber-200",
  Closed: "bg-green-50 text-green-700 border-green-200",
};

// ─── Risk Score Cell Color (for 5x5 matrix score) ──────────────────────────

function riskColor(score: number): string {
  if (score >= 15) return "bg-red-600 text-white";
  if (score >= 10) return "bg-orange-500 text-white";
  if (score >= 6) return "bg-amber-400 text-black";
  if (score >= 3) return "bg-yellow-300 text-black";
  return "bg-green-200 text-black";
}

// ─── RPN Color Coding ───────────────────────────────────────────────────────

function rpnColor(rpn: number): string {
  if (rpn >= 200) return "bg-red-600 text-white";
  if (rpn >= 100) return "bg-orange-500 text-white";
  if (rpn >= 50) return "bg-amber-400 text-black";
  return "bg-green-400 text-black";
}

function matrixColor(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 15) return "#dc2626";
  if (score >= 10) return "#f97316";
  if (score >= 6) return "#eab308";
  if (score >= 3) return "#a3e635";
  return "#4ade80";
}

// ─── Risk Matrix ──────────────────────────────────────────────────────────────

function RiskMatrix({ risks }: { risks: Risk[] }) {
  const LIKELIHOODS = [5, 4, 3, 2, 1];
  const IMPACTS = [1, 2, 3, 4, 5];
  const LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
  const IMPACT_LABELS = ["Negligible", "Minor", "Moderate", "Major", "Catastrophic"];

  return (
    <div className="overflow-x-auto">
      <div className="text-xs text-muted-foreground mb-2 font-medium text-center">
        Likelihood vs Impact Matrix (ISO 17025 Clause 8.5)
      </div>
      <div className="inline-block">
        <div className="flex items-end mb-1">
          <div className="w-28" />
          {IMPACTS.map((imp) => (
            <div key={imp} className="w-16 text-center text-xs font-medium text-muted-foreground truncate">
              {IMPACT_LABELS[imp - 1]}
            </div>
          ))}
        </div>
        {LIKELIHOODS.map((lik) => (
          <div key={lik} className="flex items-center mb-1">
            <div className="w-28 text-xs text-muted-foreground text-right pr-2 truncate">
              {LABELS[lik - 1]}
            </div>
            {IMPACTS.map((imp) => {
              const score = lik * imp;
              const cellRisks = risks.filter((r) => r.likelihood === lik && r.impact === imp);
              return (
                <div
                  key={imp}
                  className="w-16 h-12 border border-white/40 flex flex-col items-center justify-center rounded-sm mx-0.5 relative cursor-default"
                  style={{ backgroundColor: matrixColor(lik, imp) }}
                  title={`L${lik} × I${imp} = ${score}\n${cellRisks.map((r) => r.id).join(", ")}`}
                >
                  <span className="text-xs font-bold opacity-70">{score}</span>
                  {cellRisks.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                      {cellRisks.map((r) => (
                        <span key={r.id} className="text-[9px] bg-white/70 text-gray-800 rounded px-0.5 font-mono">
                          {r.id.replace("RSK-", "")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* Legend */}
        <div className="flex gap-3 mt-3 text-xs flex-wrap">
          {[
            { label: "Critical (≥15)", color: "#dc2626" },
            { label: "High (10-14)", color: "#f97316" },
            { label: "Medium (6-9)", color: "#eab308" },
            { label: "Low (3-5)", color: "#a3e635" },
            { label: "Negligible (1-2)", color: "#4ade80" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RiskRegisterTab() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RiskStatus | "All">("All");
  const [filterCategory, setFilterCategory] = useState<RiskCategory | "All">("All");

  const filtered = RISKS.filter((r) => {
    const matchSearch =
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchCat = filterCategory === "All" || r.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const openRisks = RISKS.filter((r) => r.status === "Open");
  const top5 = [...RISKS]
    .sort((a, b) => calcRPN(b) - calcRPN(a))
    .slice(0, 5);

  const exportCSV = () => {
    const rows = [
      ["ID", "Description", "Category", "Likelihood(Occ)", "Impact(Sev)", "Risk Score", "Severity(1-10)", "Occurrence(1-10)", "Detection", "RPN", "CPN", "Mitigation", "Owner", "Status", "Review Date"],
      ...RISKS.map((r) => [
        r.id, r.description, r.category, r.likelihood, r.impact,
        r.likelihood * r.impact, toSeverity(r.impact), toOccurrence(r.likelihood),
        r.detection, calcRPN(r), calcCPN(r), r.mitigation, r.owner, r.status, r.reviewDate,
      ]),
    ];
    const csv = rows.map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "risk-register.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Reference */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <Shield className="h-4 w-4 text-red-600 flex-shrink-0" />
        <span>
          <strong>ISO 17025:2017 Clause 8.5 – Actions to address risks and opportunities:</strong> The laboratory shall plan and implement actions to address the risks and opportunities.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Open Risks</div>
            <div className="text-2xl font-bold text-red-700">{RISKS.filter((r) => r.status === "Open").length}</div>
            <div className="text-xs text-muted-foreground">Require action</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Mitigated</div>
            <div className="text-2xl font-bold text-amber-700">{RISKS.filter((r) => r.status === "Mitigated").length}</div>
            <div className="text-xs text-muted-foreground">Under control</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">Closed</div>
            <div className="text-2xl font-bold text-green-700">{RISKS.filter((r) => r.status === "Closed").length}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-muted-foreground">High RPN</div>
            <div className="text-2xl font-bold text-orange-700">
              {RISKS.filter((r) => calcRPN(r) >= 200).length}
            </div>
            <div className="text-xs text-muted-foreground">RPN ≥200</div>
          </CardContent>
        </Card>
      </div>

      {/* Matrix + Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-red-600" /> 5×5 Risk Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskMatrix risks={RISKS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" /> Top 5 Risks by RPN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {top5.map((r, i) => {
              const rpn = calcRPN(r);
              const cpn = calcCPN(r);
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{r.description}</div>
                    <div className="text-[10px] text-muted-foreground">{r.id} · {r.category} · {r.owner} · CPN: {cpn}</div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${rpnColor(rpn)}`}
                  >
                    RPN {rpn}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* RPN Legend */}
      <div className="flex gap-3 text-xs flex-wrap px-1">
        <span className="text-muted-foreground font-medium">RPN Scale:</span>
        {[
          { label: "Critical (≥200)", cls: "bg-red-600 text-white" },
          { label: "High (100-199)", cls: "bg-orange-500 text-white" },
          { label: "Medium (50-99)", cls: "bg-amber-400 text-black" },
          { label: "Low (<50)", cls: "bg-green-400 text-black" },
        ].map((l) => (
          <span key={l.label} className={`flex items-center gap-1 px-2 py-0.5 rounded ${l.cls}`}>
            {l.label}
          </span>
        ))}
      </div>

      {/* Risk Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-green-600" /> Risk Status Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TREND_DATA} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="open" name="Open" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="mitigated" name="Mitigated" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="closed" name="Closed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Register Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-red-600" /> Risk Register
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search risks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-xs w-44"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="h-7 text-xs border rounded px-2 bg-background"
              >
                {["All", "Open", "Mitigated", "Closed"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="h-7 text-xs border rounded px-2 bg-background"
              >
                {["All", "Technical", "Operational", "Financial", "Compliance", "Safety"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={exportCSV}>
                <Download className="h-3 w-3 mr-1" /> Export CSV
              </Button>
              <Button size="sm" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Risk
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left py-2 px-3 font-medium">ID</th>
                <th className="text-left py-2 px-3 font-medium">Description</th>
                <th className="text-left py-2 px-3 font-medium">Category</th>
                <th className="text-center py-2 px-3 font-medium" title="Likelihood (1-5) / Occurrence">L</th>
                <th className="text-center py-2 px-3 font-medium" title="Impact (1-5) / Severity">I</th>
                <th className="text-center py-2 px-3 font-medium" title="Risk Score = L × I">Score</th>
                <th className="text-center py-2 px-3 font-medium" title="Severity (1-10) = Impact × 2">Sev</th>
                <th className="text-center py-2 px-3 font-medium" title="Detection (1-10)">Det</th>
                <th className="text-center py-2 px-3 font-medium" title="RPN = Severity × Occurrence × Detection">RPN</th>
                <th className="text-center py-2 px-3 font-medium" title="CPN = Severity × Occurrence">CPN</th>
                <th className="text-left py-2 px-3 font-medium">Owner</th>
                <th className="text-left py-2 px-3 font-medium">Mitigation</th>
                <th className="text-left py-2 px-3 font-medium">Status</th>
                <th className="text-left py-2 px-3 font-medium">Review Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const score = r.likelihood * r.impact;
                const rpn = calcRPN(r);
                const cpn = calcCPN(r);
                const severity10 = toSeverity(r.impact);
                return (
                  <tr key={r.id} className={`border-b hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="py-2 px-3 font-mono text-red-700">{r.id}</td>
                    <td className="py-2 px-3 max-w-[200px]">
                      <p className="truncate" title={r.description}>{r.description}</p>
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-white text-[10px] font-medium"
                        style={{ backgroundColor: CATEGORY_COLORS[r.category] }}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{r.likelihood}</td>
                    <td className="py-2 px-3 text-center font-bold">{r.impact}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${riskColor(score)}`}>
                        {score}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{severity10}</td>
                    <td className="py-2 px-3 text-center font-bold">{r.detection}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${rpnColor(rpn)}`}>
                        {rpn}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-blue-100 text-blue-800">
                        {cpn}
                      </span>
                    </td>
                    <td className="py-2 px-3">{r.owner}</td>
                    <td className="py-2 px-3 max-w-[180px]">
                      <p className="truncate text-muted-foreground" title={r.mitigation}>{r.mitigation}</p>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">{r.reviewDate}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-muted-foreground">
                    No risks match your filters.
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
