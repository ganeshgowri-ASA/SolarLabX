"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { masterIndexData, standardInfo, type TestIndexStatus } from "@/lib/master-index-data";
import { toast } from "sonner";

const statusConfig: Record<TestIndexStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Completed", color: "text-green-700", bg: "bg-green-100" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-100" },
  scheduled: { label: "Scheduled", color: "text-purple-700", bg: "bg-purple-100" },
  not_started: { label: "Not Started", color: "text-gray-500", bg: "bg-gray-100" },
  skipped: { label: "Skipped", color: "text-orange-700", bg: "bg-orange-100" },
  failed: { label: "Failed", color: "text-red-700", bg: "bg-red-100" },
};

const resultConfig: Record<string, { label: string; color: string }> = {
  pass: { label: "PASS", color: "text-green-700 bg-green-100" },
  fail: { label: "FAIL", color: "text-red-700 bg-red-100" },
  pending: { label: "PENDING", color: "text-yellow-700 bg-yellow-100" },
  "n/a": { label: "N/A", color: "text-gray-500 bg-gray-100" },
};

type SortField = "sequence" | "clause" | "testName" | "status" | "assignedTo" | "scheduledDate";
type SortDir = "asc" | "desc";

export default function MasterIndexTab() {
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("sequence");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const standards = useMemo(() => Array.from(new Set(masterIndexData.map((d) => d.standard))), []);
  const modules = useMemo(() => Array.from(new Set(masterIndexData.map((d) => d.moduleId))), []);
  const categories = useMemo(() => Array.from(new Set(masterIndexData.map((d) => d.category))), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return masterIndexData
      .filter((d) => {
        if (filterStandard !== "all" && d.standard !== filterStandard) return false;
        if (filterStatus !== "all" && d.status !== filterStatus) return false;
        if (filterCategory !== "all" && d.category !== filterCategory) return false;
        if (filterModule !== "all" && d.moduleId !== filterModule) return false;
        if (q && !d.testName.toLowerCase().includes(q) && !d.clause.toLowerCase().includes(q) && !d.assignedTo.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortField === "sequence") return (a.sequence - b.sequence) * dir;
        const aVal = a[sortField] ?? "";
        const bVal = b[sortField] ?? "";
        return aVal.localeCompare(bVal) * dir;
      });
  }, [filterStandard, filterStatus, filterCategory, filterModule, search, sortField, sortDir]);

  // Summary stats
  const stats = useMemo(() => {
    const source = filterStandard === "all" ? masterIndexData : masterIndexData.filter((d) => d.standard === filterStandard);
    const total = source.length;
    const completed = source.filter((d) => d.status === "completed").length;
    const inProgress = source.filter((d) => d.status === "in_progress").length;
    const scheduled = source.filter((d) => d.status === "scheduled").length;
    const notStarted = source.filter((d) => d.status === "not_started").length;
    const passed = source.filter((d) => d.result === "pass").length;
    const failed = source.filter((d) => d.result === "fail").length;
    return { total, completed, inProgress, scheduled, notStarted, passed, failed };
  }, [filterStandard]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const handleExport = (format: "excel" | "pdf") => {
    toast.success(`Master Index exported as ${format.toUpperCase()} (${filtered.length} entries)`);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-7">
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Total Tests</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">In Progress</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Scheduled</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Not Started</CardDescription>
            <CardTitle className="text-2xl text-gray-500">{stats.notStarted}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Passed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.passed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardDescription className="text-xs">Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Progress by Standard */}
      <div className="grid gap-3 md:grid-cols-4">
        {standards.map((std) => {
          const info = standardInfo[std];
          const entries = masterIndexData.filter((d) => d.standard === std);
          const done = entries.filter((d) => d.status === "completed").length;
          const pct = Math.round((done / entries.length) * 100);
          return (
            <Card
              key={std}
              className={cn("cursor-pointer transition-shadow hover:shadow-md", filterStandard === std && "ring-2 ring-primary")}
              onClick={() => setFilterStandard(filterStandard === std ? "all" : std)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{std}</CardTitle>
                  <Badge variant="outline" className={cn(pct === 100 ? "border-green-500 text-green-700" : pct >= 50 ? "border-blue-500 text-blue-700" : "border-orange-500 text-orange-700")}>
                    {pct}%
                  </Badge>
                </div>
                <CardDescription className="text-xs">{info?.fullName ?? std}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {done}/{entries.length} completed
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search tests, clauses, assignees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-64"
            />
            <select
              value={filterStandard}
              onChange={(e) => setFilterStandard(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Standards</option>
              {standards.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
                Export Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Index Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium cursor-pointer hover:text-primary w-10" onClick={() => toggleSort("sequence")}>#{sortIndicator("sequence")}</th>
                  <th className="p-2 text-left font-medium cursor-pointer hover:text-primary w-24" onClick={() => toggleSort("clause")}>Clause{sortIndicator("clause")}</th>
                  <th className="p-2 text-left font-medium cursor-pointer hover:text-primary" onClick={() => toggleSort("testName")}>Test Name{sortIndicator("testName")}</th>
                  <th className="p-2 text-left font-medium w-24">Category</th>
                  <th className="p-2 text-left font-medium w-24">Module</th>
                  <th className="p-2 text-left font-medium cursor-pointer hover:text-primary w-28" onClick={() => toggleSort("status")}>Status{sortIndicator("status")}</th>
                  <th className="p-2 text-left font-medium w-20">Result</th>
                  <th className="p-2 text-left font-medium cursor-pointer hover:text-primary w-28" onClick={() => toggleSort("assignedTo")}>Assigned{sortIndicator("assignedTo")}</th>
                  <th className="p-2 text-left font-medium cursor-pointer hover:text-primary w-28" onClick={() => toggleSort("scheduledDate")}>Scheduled{sortIndicator("scheduledDate")}</th>
                  <th className="p-2 text-left font-medium w-28">Completed</th>
                  <th className="p-2 text-left font-medium">Equipment</th>
                  <th className="p-2 text-left font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-muted-foreground">No tests match the current filters.</td>
                  </tr>
                ) : (
                  filtered.map((entry) => {
                    const sc = statusConfig[entry.status];
                    const rc = resultConfig[entry.result];
                    return (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-2 text-muted-foreground">{entry.sequence}</td>
                        <td className="p-2 font-mono text-xs">{entry.clause}</td>
                        <td className="p-2 font-medium">{entry.testName}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-[10px]">{entry.category}</Badge>
                        </td>
                        <td className="p-2 font-mono text-xs">{entry.moduleId}</td>
                        <td className="p-2">
                          <Badge variant="outline" className={cn("text-[10px]", sc.color, sc.bg)}>{sc.label}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className={cn("text-[10px]", rc.color)}>{rc.label}</Badge>
                        </td>
                        <td className="p-2 text-xs">{entry.assignedTo}</td>
                        <td className="p-2 text-xs text-muted-foreground">{entry.scheduledDate || "—"}</td>
                        <td className="p-2 text-xs text-muted-foreground">{entry.completedDate || "—"}</td>
                        <td className="p-2 text-xs text-muted-foreground">{entry.equipment}</td>
                        <td className="p-2 text-xs text-muted-foreground max-w-[200px] truncate">{entry.remarks || "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {masterIndexData.length} test entries
      </p>
    </div>
  );
}
