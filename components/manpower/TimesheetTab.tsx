// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { staffMembers } from "@/lib/data/timesheet-data";
import {
  Clock, Download, Plus, CheckCircle2, AlertTriangle, FileText,
  BarChart3, ChevronLeft, ChevronRight, User, Calendar, TrendingUp
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ApprovalStatus = "Draft" | "Submitted" | "Approved" | "Rejected";
type ViewMode = "weekly" | "monthly";

interface TimesheetRow {
  id: string;
  date: string;
  projectId: string;
  activity: string;
  startTime: string;
  endTime: string;
  hours: number;
  overtime: number;
  status: ApprovalStatus;
}

interface EmployeeTimesheet {
  employeeId: string;
  employeeName: string;
  role: string;
  period: string; // "YYYY-WW" or "YYYY-MM"
  rows: TimesheetRow[];
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITIES = [
  "IEC 61215 Testing",
  "IEC 61730 Testing",
  "IEC 61853 Testing",
  "IEC 60904 Testing",
  "IEC 62716 Ammonia Test",
  "IEC 61701 Salt Mist Test",
  "Calibration",
  "Data Analysis",
  "Report Writing",
  "Training",
  "Equipment Maintenance",
  "Sample Handling",
  "Client Meeting",
  "Admin",
  "SOP Review",
  "Internal Audit",
  "Leave",
];

const PROJECT_IDS = [
  "PRJ-2026-001", "PRJ-2026-002", "PRJ-2026-003", "PRJ-2026-004",
  "PRJ-2026-005", "PRJ-2026-006", "ADMIN", "TRAINING", "CALIBRATION",
];

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; bg: string; text: string; border: string }> = {
  Draft:     { label: "Draft",     bg: "bg-gray-100",   text: "text-gray-700",   border: "border-gray-300" },
  Submitted: { label: "Submitted", bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-300" },
  Approved:  { label: "Approved",  bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300" },
  Rejected:  { label: "Rejected",  bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300" },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const ACTIVITY_COLORS: Record<string, string> = {
  "IEC 61215 Testing": "bg-blue-500",
  "IEC 61730 Testing": "bg-indigo-500",
  "IEC 61853 Testing": "bg-violet-500",
  "IEC 60904 Testing": "bg-purple-500",
  "Calibration":       "bg-amber-500",
  "Data Analysis":     "bg-cyan-500",
  "Report Writing":    "bg-teal-500",
  "Training":          "bg-green-500",
  "Admin":             "bg-gray-500",
  "Leave":             "bg-rose-400",
};

// ─── Seed Data ──────────────────────────────────────────────────────────────────

function generateSeedRows(employeeId: string, year: number, month: number): TimesheetRow[] {
  const rows: TimesheetRow[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const activities = ACTIVITIES.slice(0, 8);
  const projects = PROJECT_IDS.slice(0, 6);
  let id = 1;
  for (let day = 1; day <= Math.min(daysInMonth, 21); day++) {
    const d = new Date(year, month, day);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const actIdx = (parseInt(employeeId.replace(/\D/g, ""), 10) + day) % activities.length;
    const projIdx = (parseInt(employeeId.replace(/\D/g, ""), 10) + day) % projects.length;
    const overtime = day % 7 === 0 ? 2 : 0;
    const status: ApprovalStatus = day <= 14 ? "Approved" : day <= 18 ? "Submitted" : "Draft";
    rows.push({
      id: `${employeeId}-${year}${month}${String(day).padStart(2, "0")}-${id++}`,
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      projectId: projects[projIdx],
      activity: activities[actIdx],
      startTime: "09:00",
      endTime: overtime ? "19:00" : "17:00",
      hours: 8,
      overtime,
      status,
    });
  }
  return rows;
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.bg, cfg.text, cfg.border)}>
      {status === "Approved"  && <CheckCircle2 className="h-3 w-3" />}
      {status === "Rejected"  && <AlertTriangle className="h-3 w-3" />}
      {status === "Submitted" && <Clock className="h-3 w-3" />}
      {status === "Draft"     && <FileText className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

function SummaryBar({ rows }: { rows: TimesheetRow[] }) {
  const totalHours   = rows.reduce((s, r) => s + r.hours, 0);
  const overtimeHrs  = rows.reduce((s, r) => s + r.overtime, 0);
  const leaveHrs     = rows.filter(r => r.activity === "Leave").reduce((s, r) => s + r.hours, 0);
  const regularHrs   = totalHours - overtimeHrs - leaveHrs;
  const maxHrs       = rows.length * 8;
  const utilization  = maxHrs > 0 ? Math.round(((totalHours - leaveHrs) / maxHrs) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      {[
        { label: "Regular Hours",   value: regularHrs,   color: "text-green-600",  bg: "bg-green-50" },
        { label: "Overtime Hours",  value: overtimeHrs,  color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Leave Hours",     value: leaveHrs,     color: "text-rose-600",   bg: "bg-rose-50" },
        { label: "Utilization",     value: `${utilization}%`, color: "text-blue-600", bg: "bg-blue-50" },
      ].map(item => (
        <div key={item.label} className={cn("rounded-lg p-3 border", item.bg)}>
          <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function ActivityChart({ rows }: { rows: TimesheetRow[] }) {
  const byActivity = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach(r => map.set(r.activity, (map.get(r.activity) ?? 0) + r.hours + r.overtime));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [rows]);
  const total = byActivity.reduce((s, [, h]) => s + h, 0);
  if (total === 0) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          Hours by Activity (Monthly Summary)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {byActivity.map(([activity, hours]) => {
            const pct = Math.round((hours / total) * 100);
            const color = ACTIVITY_COLORS[activity] ?? "bg-slate-400";
            return (
              <div key={activity} className="flex items-center gap-3">
                <div className="w-36 text-xs text-right text-muted-foreground truncate">{activity}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div className={cn("h-4 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-16 text-xs font-medium text-right">{hours}h ({pct}%)</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function TimesheetTable({
  rows, onStatusChange, editable
}: {
  rows: TimesheetRow[];
  onStatusChange?: (id: string, status: ApprovalStatus) => void;
  editable?: boolean;
}) {
  if (rows.length === 0) {
    return <div className="text-center py-8 text-muted-foreground text-sm">No timesheet entries for this period.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Project ID</th>
            <th className="px-3 py-2 text-left">Activity</th>
            <th className="px-3 py-2 text-center">Start</th>
            <th className="px-3 py-2 text-center">End</th>
            <th className="px-3 py-2 text-center">Hours</th>
            <th className="px-3 py-2 text-center">OT</th>
            <th className="px-3 py-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} className={cn("border-t hover:bg-muted/30 transition-colors", idx % 2 === 0 ? "" : "bg-muted/10")}>
              <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{row.date}</td>
              <td className="px-3 py-2 text-xs font-medium text-blue-700">{row.projectId}</td>
              <td className="px-3 py-2 text-xs">{row.activity}</td>
              <td className="px-3 py-2 text-center text-xs font-mono">{row.startTime}</td>
              <td className="px-3 py-2 text-center text-xs font-mono">{row.endTime}</td>
              <td className="px-3 py-2 text-center font-semibold">{row.hours}</td>
              <td className="px-3 py-2 text-center">
                {row.overtime > 0 ? (
                  <span className="text-orange-600 font-semibold">{row.overtime}</span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-center">
                {editable && onStatusChange ? (
                  <select
                    className="text-xs border rounded px-1 py-0.5"
                    value={row.status}
                    onChange={e => onStatusChange(row.id, e.target.value as ApprovalStatus)}
                  >
                    {(Object.keys(STATUS_CONFIG) as ApprovalStatus[]).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={row.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 bg-muted/40 font-semibold text-xs">
            <td className="px-3 py-2" colSpan={5}>Totals</td>
            <td className="px-3 py-2 text-center">{rows.reduce((s, r) => s + r.hours, 0)}</td>
            <td className="px-3 py-2 text-center text-orange-600">{rows.reduce((s, r) => s + r.overtime, 0)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TimesheetTab() {
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedEmployee, setSelectedEmployee] = useState<string>(staffMembers[0].id);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // March
  const [isManager, setIsManager] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState<Partial<TimesheetRow>>({
    date: "", projectId: PROJECT_IDS[0], activity: ACTIVITIES[0],
    startTime: "09:00", endTime: "17:00", hours: 8, overtime: 0, status: "Draft"
  });

  // State per employee timesheets
  const [timesheets, setTimesheets] = useState<Record<string, EmployeeTimesheet>>(() => {
    const seed: Record<string, EmployeeTimesheet> = {};
    staffMembers.slice(0, 8).forEach(staff => {
      const key = `${staff.id}-${year}-${month}`;
      seed[key] = {
        employeeId: staff.id,
        employeeName: staff.name,
        role: staff.role,
        period: `${year}-${String(month + 1).padStart(2, "0")}`,
        rows: generateSeedRows(staff.id, year, month),
      };
    });
    return seed;
  });

  const tsKey = `${selectedEmployee}-${year}-${month}`;
  const employee = staffMembers.find(s => s.id === selectedEmployee)!;
  const ts = timesheets[tsKey] ?? {
    employeeId: selectedEmployee,
    employeeName: employee?.name ?? "",
    role: employee?.role ?? "",
    period: `${year}-${String(month + 1).padStart(2, "0")}`,
    rows: [],
  };

  // Filter by week if weekly mode
  const getWeekRows = (rows: TimesheetRow[], weekOffset: number) => {
    const d = new Date(year, month, 1);
    d.setDate(d.getDate() + weekOffset * 7);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);
    const start = weekStart.toISOString().split("T")[0];
    const end = weekEnd.toISOString().split("T")[0];
    return rows.filter(r => r.date >= start && r.date <= end);
  };

  const [weekOffset, setWeekOffset] = useState(0);
  const displayedRows = viewMode === "weekly" ? getWeekRows(ts.rows, weekOffset) : ts.rows;

  // Overall submission status
  const overallStatus: ApprovalStatus = useMemo(() => {
    if (ts.rows.length === 0) return "Draft";
    if (ts.rows.every(r => r.status === "Approved")) return "Approved";
    if (ts.rows.some(r => r.status === "Rejected")) return "Rejected";
    if (ts.rows.some(r => r.status === "Submitted")) return "Submitted";
    return "Draft";
  }, [ts.rows]);

  function updateTs(updater: (prev: EmployeeTimesheet) => EmployeeTimesheet) {
    setTimesheets(prev => ({
      ...prev,
      [tsKey]: updater(prev[tsKey] ?? ts),
    }));
  }

  function handleSubmit() {
    updateTs(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.status === "Draft" ? { ...r, status: "Submitted" } : r),
      submittedAt: new Date().toISOString(),
    }));
  }

  function handleApproveAll() {
    updateTs(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.status === "Submitted" ? { ...r, status: "Approved" } : r),
      approvedBy: "Dr. Meera Patel",
      approvedAt: new Date().toISOString(),
    }));
  }

  function handleRejectAll() {
    updateTs(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.status === "Submitted" ? { ...r, status: "Rejected" } : r),
      rejectionReason: "Please review and resubmit with correct project codes.",
    }));
  }

  function handleRowStatusChange(rowId: string, status: ApprovalStatus) {
    updateTs(prev => ({
      ...prev,
      rows: prev.rows.map(r => r.id === rowId ? { ...r, status } : r),
    }));
  }

  function handleAddRow() {
    if (!newRow.date || !newRow.projectId || !newRow.activity) return;
    const row: TimesheetRow = {
      id: `${selectedEmployee}-${newRow.date}-${Date.now()}`,
      date: newRow.date!,
      projectId: newRow.projectId!,
      activity: newRow.activity!,
      startTime: newRow.startTime ?? "09:00",
      endTime: newRow.endTime ?? "17:00",
      hours: Number(newRow.hours ?? 8),
      overtime: Number(newRow.overtime ?? 0),
      status: "Draft",
    };
    updateTs(prev => ({ ...prev, rows: [...prev.rows, row].sort((a, b) => a.date.localeCompare(b.date)) }));
    setShowAddRow(false);
    setNewRow({ date: "", projectId: PROJECT_IDS[0], activity: ACTIVITIES[0], startTime: "09:00", endTime: "17:00", hours: 8, overtime: 0, status: "Draft" });
  }

  function exportCSV() {
    const headers = ["Date","Project ID","Activity","Start","End","Hours","Overtime","Status"];
    const rows = [headers, ...displayedRows.map(r =>
      [r.date, r.projectId, r.activity, r.startTime, r.endTime, r.hours, r.overtime, r.status]
    )];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet-${employee?.name?.replace(/\s+/g, "-")}-${ts.period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasDraft = ts.rows.some(r => r.status === "Draft");
  const hasSubmitted = ts.rows.some(r => r.status === "Submitted");

  return (
    <div className="space-y-4">
      {/* ── Header Controls ── */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-52 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.code}) — {s.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {/* Month/Year picker */}
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium min-w-28 text-center">{MONTH_NAMES[month]} {year}</span>
          <Button variant="outline" size="icon" className="h-8 w-8"
            onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border overflow-hidden text-xs">
            <button
              className={cn("px-3 py-1.5", viewMode === "weekly" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
              onClick={() => setViewMode("weekly")}>Weekly</button>
            <button
              className={cn("px-3 py-1.5 border-l", viewMode === "monthly" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted")}
              onClick={() => setViewMode("monthly")}>Monthly</button>
          </div>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={exportCSV}>
            <Download className="h-3 w-3" /> Export CSV
          </Button>

          <Button
            variant="outline" size="sm"
            className={cn("h-8 text-xs", isManager ? "border-amber-500 text-amber-700" : "")}
            onClick={() => setIsManager(m => !m)}>
            {isManager ? "Manager View" : "Employee View"}
          </Button>
        </div>
      </div>

      {/* ── Week nav (weekly mode) ── */}
      {viewMode === "weekly" && (
        <div className="flex items-center gap-2 text-sm">
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
            <ChevronLeft className="h-4 w-4" /> Prev Week
          </Button>
          <span className="text-muted-foreground">Week {weekOffset >= 0 ? `+${weekOffset}` : weekOffset}</span>
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
            Next Week <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Employee Card ── */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              {employee?.name}
              <span className="text-xs font-normal text-muted-foreground">— {employee?.role}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Period: {MONTH_NAMES[month]} {year} &nbsp;|&nbsp; Employee ID: {employee?.code} &nbsp;|&nbsp; Type: {employee?.type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={overallStatus} />
            {ts.approvedBy && (
              <span className="text-xs text-muted-foreground">Approved by {ts.approvedBy}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryBar rows={ts.rows} />
        </CardContent>
      </Card>

      {/* ── Approval Workflow Banner ── */}
      {overallStatus === "Rejected" && ts.rejectionReason && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span><strong>Rejected:</strong> {ts.rejectionReason}</span>
        </div>
      )}

      {/* ── Timesheet Table ── */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Timesheet Entries ({viewMode === "weekly" ? "This Week" : MONTH_NAMES[month]})
            <Badge variant="outline" className="ml-1 text-xs">{displayedRows.length} rows</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAddRow(v => !v)}>
            <Plus className="h-3 w-3" /> Add Entry
          </Button>
        </CardHeader>

        {showAddRow && (
          <div className="px-4 pb-3 border-b">
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="text-xs text-muted-foreground">Date</label>
                <Input type="date" className="h-7 text-xs w-36" value={newRow.date}
                  onChange={e => setNewRow(r => ({ ...r, date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Project ID</label>
                <Select value={newRow.projectId} onValueChange={v => setNewRow(r => ({ ...r, projectId: v }))}>
                  <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{PROJECT_IDS.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Activity</label>
                <Select value={newRow.activity} onValueChange={v => setNewRow(r => ({ ...r, activity: v }))}>
                  <SelectTrigger className="h-7 w-44 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTIVITIES.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Start</label>
                <Input type="time" className="h-7 w-24 text-xs" value={newRow.startTime}
                  onChange={e => setNewRow(r => ({ ...r, startTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">End</label>
                <Input type="time" className="h-7 w-24 text-xs" value={newRow.endTime}
                  onChange={e => setNewRow(r => ({ ...r, endTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hours</label>
                <Input type="number" min={0} max={24} className="h-7 w-16 text-xs" value={newRow.hours}
                  onChange={e => setNewRow(r => ({ ...r, hours: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">OT</label>
                <Input type="number" min={0} max={12} className="h-7 w-16 text-xs" value={newRow.overtime}
                  onChange={e => setNewRow(r => ({ ...r, overtime: Number(e.target.value) }))} />
              </div>
              <Button size="sm" className="h-7 text-xs" onClick={handleAddRow}>Save</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAddRow(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <CardContent className="pt-3">
          <TimesheetTable
            rows={displayedRows}
            onStatusChange={isManager ? handleRowStatusChange : undefined}
            editable={isManager}
          />
        </CardContent>
      </Card>

      {/* ── Approval Actions ── */}
      <div className="flex flex-wrap gap-2">
        {!isManager && hasDraft && (
          <Button size="sm" className="gap-2" onClick={handleSubmit}>
            <CheckCircle2 className="h-4 w-4" />
            Submit for Approval
          </Button>
        )}
        {isManager && hasSubmitted && (
          <>
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleApproveAll}>
              <CheckCircle2 className="h-4 w-4" /> Approve All Submitted
            </Button>
            <Button size="sm" variant="destructive" className="gap-2" onClick={handleRejectAll}>
              <AlertTriangle className="h-4 w-4" /> Reject All Submitted
            </Button>
          </>
        )}
      </div>

      {/* ── Activity Chart ── */}
      <ActivityChart rows={ts.rows} />

      {/* ── Utilization Overview (all employees) ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            Team Utilization — {MONTH_NAMES[month]} {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {staffMembers.slice(0, 8).map(staff => {
              const key = `${staff.id}-${year}-${month}`;
              const rows = timesheets[key]?.rows ?? [];
              const totalHours = rows.reduce((s, r) => s + r.hours + r.overtime, 0);
              const maxHours = 22 * 8; // ~22 working days × 8h
              const pct = Math.min(100, Math.round((totalHours / maxHours) * 100));
              const color = pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : pct >= 50 ? "bg-blue-500" : "bg-gray-300";
              return (
                <div key={staff.id} className="flex items-center gap-3">
                  <div className="w-32 text-xs truncate">{staff.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={cn("h-3 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-20 text-xs text-right text-muted-foreground">{totalHours}h / {pct}%</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Utilization = Total Hours / (22 working days × 8h). &gt;90%: overloaded, 75–90%: optimal, &lt;50%: under-utilized.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
