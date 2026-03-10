"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  masterTestIndex,
  testStatusConfig,
  type MasterTestIndexEntry,
  type TestStatus,
} from "@/lib/master-index-data";
import { toast } from "sonner";

type SortField = "testId" | "testName" | "clause" | "standard" | "status" | "moduleId" | "chamber" | "startDate" | "assignedTo";
type SortDir = "asc" | "desc";

export function MasterTestIndex() {
  const [search, setSearch] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [sortField, setSortField] = useState<SortField>("testId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const standards = useMemo(() => Array.from(new Set(masterTestIndex.map((e) => e.standard))), []);
  const modules = useMemo(() => Array.from(new Set(masterTestIndex.map((e) => e.moduleId))), []);
  const assignees = useMemo(() => Array.from(new Set(masterTestIndex.map((e) => e.assignedTo))), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return masterTestIndex
      .filter((e) => {
        const matchSearch =
          !q ||
          e.testId.toLowerCase().includes(q) ||
          e.testName.toLowerCase().includes(q) ||
          e.clause.toLowerCase().includes(q) ||
          e.moduleId.toLowerCase().includes(q) ||
          e.chamber.toLowerCase().includes(q) ||
          e.assignedTo.toLowerCase().includes(q) ||
          e.remarks.toLowerCase().includes(q);
        const matchStandard = filterStandard === "all" || e.standard === filterStandard;
        const matchStatus = filterStatus === "all" || e.status === filterStatus;
        const matchModule = filterModule === "all" || e.moduleId === filterModule;
        const matchAssignee = filterAssignee === "all" || e.assignedTo === filterAssignee;
        return matchSearch && matchStandard && matchStatus && matchModule && matchAssignee;
      })
      .sort((a, b) => {
        const aVal = a[sortField] || "";
        const bVal = b[sortField] || "";
        const cmp = aVal.localeCompare(bVal);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [search, filterStandard, filterStatus, filterModule, filterAssignee, sortField, sortDir]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const completed = filtered.filter((e) => e.status === "completed").length;
    const inProgress = filtered.filter((e) => e.status === "in_progress").length;
    const scheduled = filtered.filter((e) => e.status === "scheduled").length;
    const failed = filtered.filter((e) => e.status === "failed").length;
    const passed = filtered.filter((e) => e.result === "pass").length;
    return { total, completed, inProgress, scheduled, failed, passed };
  }, [filtered]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  function handleExport(format: "excel" | "pdf") {
    toast.success(`Master Index exported as ${format.toUpperCase()}`);
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardDescription className="text-xs">Total Tests</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardDescription className="text-xs">Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardDescription className="text-xs">In Progress</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardDescription className="text-xs">Scheduled</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardDescription className="text-xs">Passed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.passed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3">
            <CardDescription className="text-xs">Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Progress bar per standard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Completion by Standard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {standards.map((std) => {
              const entries = masterTestIndex.filter((e) => e.standard === std);
              const done = entries.filter((e) => e.status === "completed").length;
              const pct = Math.round((done / entries.length) * 100);
              return (
                <div key={std} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-28 shrink-0">{std}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-20 text-right">
                    {done}/{entries.length} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters + Search + Export */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-56"
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
          {(Object.keys(testStatusConfig) as TestStatus[]).map((s) => (
            <option key={s} value={s}>{testStatusConfig[s].label}</option>
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
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all">All Assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
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

      {/* Main Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {([
                    ["testId", "Test ID"],
                    ["testName", "Test Name"],
                    ["clause", "Clause"],
                    ["standard", "Standard"],
                    ["status", "Status"],
                    ["moduleId", "Module"],
                    ["chamber", "Chamber"],
                    ["assignedTo", "Assigned To"],
                    ["startDate", "Start Date"],
                  ] as [SortField, string][]).map(([field, label]) => (
                    <th
                      key={field}
                      className="p-2 text-left font-medium cursor-pointer hover:bg-muted/80 select-none whitespace-nowrap"
                      onClick={() => handleSort(field)}
                    >
                      {label}{sortIndicator(field)}
                    </th>
                  ))}
                  <th className="p-2 text-left font-medium whitespace-nowrap">End Date</th>
                  <th className="p-2 text-left font-medium whitespace-nowrap">Result</th>
                  <th className="p-2 text-left font-medium whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-muted-foreground">
                      No tests match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => {
                    const sc = testStatusConfig[entry.status];
                    return (
                      <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-2 font-mono text-xs whitespace-nowrap">{entry.testId}</td>
                        <td className="p-2 whitespace-nowrap">{entry.testName}</td>
                        <td className="p-2 font-mono text-xs whitespace-nowrap">{entry.clause}</td>
                        <td className="p-2 whitespace-nowrap">{entry.standard}</td>
                        <td className="p-2">
                          <Badge
                            variant="outline"
                            className="text-xs whitespace-nowrap"
                            style={{ backgroundColor: sc.bg, color: sc.color, borderColor: sc.color + "40" }}
                          >
                            {sc.label}
                          </Badge>
                        </td>
                        <td className="p-2 font-mono text-xs whitespace-nowrap">{entry.moduleId}</td>
                        <td className="p-2 text-xs whitespace-nowrap">{entry.chamber}</td>
                        <td className="p-2 text-xs whitespace-nowrap">{entry.assignedTo}</td>
                        <td className="p-2 text-xs whitespace-nowrap">{entry.startDate || "-"}</td>
                        <td className="p-2 text-xs whitespace-nowrap">{entry.endDate || "-"}</td>
                        <td className="p-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              entry.result === "pass" && "bg-green-100 text-green-800",
                              entry.result === "fail" && "bg-red-100 text-red-800",
                              entry.result === "pending" && "bg-gray-100 text-gray-500",
                            )}
                          >
                            {entry.result.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs text-muted-foreground max-w-[200px] truncate" title={entry.remarks}>
                          {entry.remarks || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {masterTestIndex.length} test entries
      </p>
    </div>
  );
}
