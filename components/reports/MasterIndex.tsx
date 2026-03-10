"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  masterIndexEntries,
  testStatusColors,
  type MasterIndexEntry,
  type TestStatus,
} from "@/lib/master-index-data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const resultStyles: Record<string, string> = {
  pass: "bg-green-100 text-green-800",
  fail: "bg-red-100 text-red-800",
  pending: "bg-gray-100 text-gray-500",
  "n/a": "bg-gray-50 text-gray-400",
};

type SortField = "testId" | "testName" | "standard" | "clause" | "moduleId" | "status" | "startDate" | "result";
type SortDir = "asc" | "desc";

function cmp(a: string, b: string, dir: SortDir) {
  return dir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MasterIndex() {
  const [search, setSearch] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | TestStatus>("all");
  const [filterResult, setFilterResult] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [sortField, setSortField] = useState<SortField>("testId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Unique values for filters
  const standards = useMemo(() => Array.from(new Set(masterIndexEntries.map((e) => e.standard))).sort(), []);
  const modules = useMemo(() => Array.from(new Set(masterIndexEntries.map((e) => e.moduleId))).sort(), []);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let data = masterIndexEntries.filter((e) => {
      const matchesSearch =
        !q ||
        e.testName.toLowerCase().includes(q) ||
        e.testId.toLowerCase().includes(q) ||
        e.clause.toLowerCase().includes(q) ||
        e.moduleId.toLowerCase().includes(q) ||
        e.manufacturer.toLowerCase().includes(q) ||
        e.assignedTo.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q);
      const matchesStandard = filterStandard === "all" || e.standard === filterStandard;
      const matchesStatus = filterStatus === "all" || e.status === filterStatus;
      const matchesResult = filterResult === "all" || e.result === filterResult;
      const matchesModule = filterModule === "all" || e.moduleId === filterModule;
      return matchesSearch && matchesStandard && matchesStatus && matchesResult && matchesModule;
    });

    data = [...data].sort((a, b) => cmp(String(a[sortField]), String(b[sortField]), sortDir));
    return data;
  }, [search, filterStandard, filterStatus, filterResult, filterModule, sortField, sortDir]);

  // Stats
  const stats = useMemo(() => {
    const total = masterIndexEntries.length;
    const completed = masterIndexEntries.filter((e) => e.status === "completed").length;
    const inProgress = masterIndexEntries.filter((e) => e.status === "in_progress").length;
    const scheduled = masterIndexEntries.filter((e) => e.status === "scheduled").length;
    const passed = masterIndexEntries.filter((e) => e.result === "pass").length;
    const failed = masterIndexEntries.filter((e) => e.result === "fail").length;
    return { total, completed, inProgress, scheduled, passed, failed };
  }, []);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleExport(format: "excel" | "pdf") {
    toast.success(`Master Index exported as ${format.toUpperCase()}`);
  }

  const sortIcon = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardDescription className="text-xs">Total Tests</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardDescription className="text-xs">Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardDescription className="text-xs">In Progress</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardDescription className="text-xs">Scheduled</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardDescription className="text-xs">Passed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.passed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardDescription className="text-xs">Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search tests, modules, staff..."
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
          onChange={(e) => setFilterStatus(e.target.value as "all" | TestStatus)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="scheduled">Scheduled</option>
          <option value="not_started">Not Started</option>
          <option value="on_hold">On Hold</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All Results</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="pending">Pending</option>
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
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
          Export Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
          Export PDF
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {masterIndexEntries.length} test entries
      </p>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {([
                ["testId", "Test ID"],
                ["testName", "Test Name"],
                ["standard", "Standard"],
                ["clause", "Clause"],
                ["moduleId", "Module"],
                ["status", "Status"],
                ["startDate", "Start Date"],
                ["result", "Result"],
              ] as [SortField, string][]).map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80 whitespace-nowrap select-none"
                >
                  {label}{sortIcon(field)}
                </th>
              ))}
              <th className="p-2 text-left font-medium">Assigned To</th>
              <th className="p-2 text-left font-medium">Equipment</th>
              <th className="p-2 text-left font-medium">Report #</th>
              <th className="p-2 text-left font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-6 text-center text-muted-foreground">
                  No entries match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((entry) => {
                const sc = testStatusColors[entry.status];
                return (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 font-mono text-xs whitespace-nowrap">{entry.testId}</td>
                    <td className="p-2 font-medium whitespace-nowrap">{entry.testName}</td>
                    <td className="p-2 whitespace-nowrap">{entry.standard}</td>
                    <td className="p-2 font-mono text-xs">{entry.clause}</td>
                    <td className="p-2 font-mono text-xs whitespace-nowrap">{entry.moduleId}</td>
                    <td className="p-2">
                      <Badge variant="outline" className={cn("text-xs whitespace-nowrap", sc.bg, sc.text)}>
                        {entry.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-2 whitespace-nowrap">{entry.startDate || "—"}</td>
                    <td className="p-2">
                      <Badge variant="outline" className={cn("text-xs", resultStyles[entry.result])}>
                        {entry.result.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-2 whitespace-nowrap">{entry.assignedTo}</td>
                    <td className="p-2 text-xs whitespace-nowrap">{entry.equipment}</td>
                    <td className="p-2 font-mono text-xs whitespace-nowrap">{entry.reportNumber || "—"}</td>
                    <td className="p-2 text-xs max-w-[200px] truncate">{entry.remarks || "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standard breakdown cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {standards.map((std) => {
          const entries = masterIndexEntries.filter((e) => e.standard === std);
          const completed = entries.filter((e) => e.status === "completed").length;
          const pct = Math.round((completed / entries.length) * 100);
          return (
            <Card key={std}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{std}</CardTitle>
                  <Badge variant="outline" className={cn(
                    pct === 100 ? "border-green-500 text-green-700" :
                    pct >= 50 ? "border-blue-500 text-blue-700" :
                    "border-gray-400 text-gray-600"
                  )}>
                    {pct}%
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {completed}/{entries.length} tests completed
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
