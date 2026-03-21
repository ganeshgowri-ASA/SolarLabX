// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  CalendarCheck,
  Activity,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

// --- Mock Data ---

interface CheckScheduleItem {
  id: string;
  equipment: string;
  equipmentId: string;
  checkParameter: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  acceptanceCriteria: string;
  lastCheckDate: string;
  lastResult: "Pass" | "Fail";
  nextDue: string;
  status: "OK" | "Due Soon" | "Overdue" | "Failed";
  trend: "up" | "down" | "stable";
  lastValue?: string;
}

interface CheckLogEntry {
  id: string;
  timestamp: string;
  equipment: string;
  parameter: string;
  result: "Pass" | "Fail";
  value: string;
  performedBy: string;
  notes?: string;
}

const checkSchedule: CheckScheduleItem[] = [
  {
    id: "IC-001",
    equipment: "Solar Simulator SS-01",
    equipmentId: "EQ-SS-01",
    checkParameter: "Irradiance Uniformity",
    frequency: "Weekly",
    acceptanceCriteria: "\u00b12% of 1000 W/m\u00b2",
    lastCheckDate: "2026-03-18",
    lastResult: "Pass",
    nextDue: "2026-03-25",
    status: "OK",
    trend: "stable",
    lastValue: "1.4%",
  },
  {
    id: "IC-002",
    equipment: "Solar Simulator SS-01",
    equipmentId: "EQ-SS-01",
    checkParameter: "Spectral Match Verification",
    frequency: "Monthly",
    acceptanceCriteria: "Class A+ (0.75\u20131.25)",
    lastCheckDate: "2026-03-05",
    lastResult: "Pass",
    nextDue: "2026-04-05",
    status: "OK",
    trend: "stable",
    lastValue: "0.98",
  },
  {
    id: "IC-003",
    equipment: "Reference Cell RC-01",
    equipmentId: "EQ-RC-01",
    checkParameter: "Short-Circuit Current (Isc)",
    frequency: "Daily",
    acceptanceCriteria: "\u00b10.5% of calibrated value (142.3 mA)",
    lastCheckDate: "2026-03-21",
    lastResult: "Pass",
    nextDue: "2026-03-22",
    status: "OK",
    trend: "stable",
    lastValue: "142.18 mA",
  },
  {
    id: "IC-004",
    equipment: "Climate Chamber CC-01",
    equipmentId: "EQ-CC-01",
    checkParameter: "Temperature Uniformity",
    frequency: "Weekly",
    acceptanceCriteria: "\u00b12\u00b0C across test volume",
    lastCheckDate: "2026-03-17",
    lastResult: "Pass",
    nextDue: "2026-03-24",
    status: "Due Soon",
    trend: "up",
    lastValue: "1.6\u00b0C",
  },
  {
    id: "IC-005",
    equipment: "Climate Chamber CC-01",
    equipmentId: "EQ-CC-01",
    checkParameter: "Humidity Accuracy",
    frequency: "Weekly",
    acceptanceCriteria: "\u00b13% RH at 85% RH",
    lastCheckDate: "2026-03-17",
    lastResult: "Fail",
    nextDue: "2026-03-24",
    status: "Failed",
    trend: "down",
    lastValue: "3.8% RH",
  },
  {
    id: "IC-006",
    equipment: "EL Camera EL-01",
    equipmentId: "EQ-EL-01",
    checkParameter: "Pixel Response Check",
    frequency: "Monthly",
    acceptanceCriteria: "<0.1% dead pixels",
    lastCheckDate: "2026-02-28",
    lastResult: "Pass",
    nextDue: "2026-03-28",
    status: "OK",
    trend: "stable",
    lastValue: "0.02%",
  },
  {
    id: "IC-007",
    equipment: "EL Camera EL-01",
    equipmentId: "EQ-EL-01",
    checkParameter: "Focus Verification",
    frequency: "Weekly",
    acceptanceCriteria: "MTF >70% at Nyquist",
    lastCheckDate: "2026-03-14",
    lastResult: "Pass",
    nextDue: "2026-03-21",
    status: "Overdue",
    trend: "stable",
    lastValue: "74%",
  },
  {
    id: "IC-008",
    equipment: "I-V Tracer IV-01",
    equipmentId: "EQ-IV-01",
    checkParameter: "Zero Offset Check",
    frequency: "Daily",
    acceptanceCriteria: "\u00b10.05 V, \u00b10.5 mA",
    lastCheckDate: "2026-03-21",
    lastResult: "Pass",
    nextDue: "2026-03-22",
    status: "OK",
    trend: "stable",
    lastValue: "0.02 V / 0.3 mA",
  },
  {
    id: "IC-009",
    equipment: "I-V Tracer IV-01",
    equipmentId: "EQ-IV-01",
    checkParameter: "Reference Module Measurement",
    frequency: "Weekly",
    acceptanceCriteria: "\u00b11% of Pmax (310\u00b13.1 W)",
    lastCheckDate: "2026-03-18",
    lastResult: "Pass",
    nextDue: "2026-03-25",
    status: "OK",
    trend: "stable",
    lastValue: "309.6 W",
  },
  {
    id: "IC-010",
    equipment: "Spectroradiometer SR-01",
    equipmentId: "EQ-SR-01",
    checkParameter: "Wavelength Accuracy",
    frequency: "Monthly",
    acceptanceCriteria: "\u00b10.5 nm (Hg lines)",
    lastCheckDate: "2026-03-01",
    lastResult: "Pass",
    nextDue: "2026-04-01",
    status: "OK",
    trend: "stable",
    lastValue: "0.3 nm",
  },
];

const recentCheckLogs: CheckLogEntry[] = [
  { id: "LOG-001", timestamp: "2026-03-21 08:30", equipment: "Reference Cell RC-01", parameter: "Short-Circuit Current (Isc)", result: "Pass", value: "142.18 mA", performedBy: "R. Kumar" },
  { id: "LOG-002", timestamp: "2026-03-21 08:15", equipment: "I-V Tracer IV-01", parameter: "Zero Offset Check", result: "Pass", value: "0.02 V / 0.3 mA", performedBy: "S. Patel" },
  { id: "LOG-003", timestamp: "2026-03-20 09:00", equipment: "Reference Cell RC-01", parameter: "Short-Circuit Current (Isc)", result: "Pass", value: "142.25 mA", performedBy: "R. Kumar" },
  { id: "LOG-004", timestamp: "2026-03-20 08:45", equipment: "I-V Tracer IV-01", parameter: "Zero Offset Check", result: "Pass", value: "0.01 V / 0.2 mA", performedBy: "S. Patel" },
  { id: "LOG-005", timestamp: "2026-03-19 09:10", equipment: "Reference Cell RC-01", parameter: "Short-Circuit Current (Isc)", result: "Pass", value: "142.31 mA", performedBy: "R. Kumar" },
  { id: "LOG-006", timestamp: "2026-03-18 14:00", equipment: "Solar Simulator SS-01", parameter: "Irradiance Uniformity", result: "Pass", value: "1.4%", performedBy: "A. Mehta" },
  { id: "LOG-007", timestamp: "2026-03-17 11:30", equipment: "Climate Chamber CC-01", parameter: "Temperature Uniformity", result: "Pass", value: "1.6\u00b0C", performedBy: "P. Sharma" },
  { id: "LOG-008", timestamp: "2026-03-17 11:45", equipment: "Climate Chamber CC-01", parameter: "Humidity Accuracy", result: "Fail", value: "3.8% RH deviation", performedBy: "P. Sharma", notes: "Sensor drift suspected. CAPA raised: CAPA-2026-018" },
  { id: "LOG-009", timestamp: "2026-03-18 10:00", equipment: "I-V Tracer IV-01", parameter: "Reference Module Measurement", result: "Pass", value: "309.6 W", performedBy: "S. Patel" },
  { id: "LOG-010", timestamp: "2026-03-14 16:00", equipment: "EL Camera EL-01", parameter: "Focus Verification", result: "Pass", value: "74% MTF", performedBy: "V. Reddy" },
];

// Trend data: Reference Cell Isc over 8 days
const refCellTrendData = [
  { date: "Mar 14", value: 142.35, ucl: 143.01, lcl: 141.59 },
  { date: "Mar 15", value: 142.28, ucl: 143.01, lcl: 141.59 },
  { date: "Mar 16", value: 142.22, ucl: 143.01, lcl: 141.59 },
  { date: "Mar 17", value: 142.19, ucl: 143.01, lcl: 141.59 },
  { date: "Mar 18", value: 142.30, ucl: 143.01, lcl: 141.59 },
  { date: "Mar 19", value: 142.31, ucl: 143.01, lcl: 141.59 },
  { date: "Mar 20", value: 142.25, ucl: 143.01, lcl: 141.59 },
  { date: "Mar 21", value: 142.18, ucl: 143.01, lcl: 141.59 },
];

// Trend data: Climate Chamber Temperature Uniformity over 6 weeks
const chamberTempTrendData = [
  { date: "Feb 10", value: 1.2, ucl: 2.0, lcl: 0.0 },
  { date: "Feb 17", value: 1.1, ucl: 2.0, lcl: 0.0 },
  { date: "Feb 24", value: 1.3, ucl: 2.0, lcl: 0.0 },
  { date: "Mar 03", value: 1.4, ucl: 2.0, lcl: 0.0 },
  { date: "Mar 10", value: 1.5, ucl: 2.0, lcl: 0.0 },
  { date: "Mar 17", value: 1.6, ucl: 2.0, lcl: 0.0 },
];

// --- Status Styling ---

const statusConfig: Record<string, { label: string; color: string; borderColor: string }> = {
  OK: { label: "OK", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", borderColor: "border-l-green-500" },
  "Due Soon": { label: "Due Soon", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", borderColor: "border-l-amber-500" },
  Overdue: { label: "Overdue", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", borderColor: "border-l-red-500" },
  Failed: { label: "Failed", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", borderColor: "border-l-red-500" },
};

const resultConfig: Record<string, { color: string }> = {
  Pass: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  Fail: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const frequencyConfig: Record<string, { color: string }> = {
  Daily: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  Weekly: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  Monthly: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
};

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-amber-500" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-red-500" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

export default function IntermediateChecks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFrequency, setFilterFrequency] = useState<string>("All");

  // Computed stats
  const stats = useMemo(() => {
    const daily = checkSchedule.filter((c) => c.frequency === "Daily");
    const weekly = checkSchedule.filter((c) => c.frequency === "Weekly");
    const monthly = checkSchedule.filter((c) => c.frequency === "Monthly");
    const overdue = checkSchedule.filter((c) => c.status === "Overdue").length;
    const failed = checkSchedule.filter((c) => c.status === "Failed").length;
    const dueSoon = checkSchedule.filter((c) => c.status === "Due Soon").length;
    const ok = checkSchedule.filter((c) => c.status === "OK").length;

    return {
      daily: { total: daily.length, pass: daily.filter((c) => c.lastResult === "Pass").length },
      weekly: { total: weekly.length, pass: weekly.filter((c) => c.lastResult === "Pass").length },
      monthly: { total: monthly.length, pass: monthly.filter((c) => c.lastResult === "Pass").length },
      overdue,
      failed,
      dueSoon,
      ok,
    };
  }, []);

  // Filtered schedule
  const filteredSchedule = useMemo(() => {
    return checkSchedule.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.checkParameter.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFrequency = filterFrequency === "All" || item.frequency === filterFrequency;
      return matchesSearch && matchesFrequency;
    });
  }, [searchQuery, filterFrequency]);

  // Alert items: failed or overdue
  const alertItems = useMemo(() => {
    return checkSchedule.filter((c) => c.status === "Overdue" || c.status === "Failed");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Intermediate Checks &mdash; ISO 17025 Clause 6.4.10
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled verification of equipment between calibrations to maintain confidence in performance
          </p>
        </div>
        <Button size="sm" className="gap-1">
          <ClipboardList className="h-4 w-4" />
          Log New Check
        </Button>
      </div>

      {/* 1. Schedule Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Daily Checks</span>
              <CalendarCheck className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.daily.pass}/{stats.daily.total}</p>
            <p className="text-[10px] text-muted-foreground">passed today</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Weekly Checks</span>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.weekly.pass}/{stats.weekly.total}</p>
            <p className="text-[10px] text-muted-foreground">passed this week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Monthly Checks</span>
              <Clock className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.monthly.pass}/{stats.monthly.total}</p>
            <p className="text-[10px] text-muted-foreground">passed this month</p>
          </CardContent>
        </Card>

        <Card className={cn("border-l-4", stats.overdue + stats.failed > 0 ? "border-l-red-500" : "border-l-green-500")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Alerts</span>
              <AlertTriangle className={cn("h-4 w-4", stats.overdue + stats.failed > 0 ? "text-red-500" : "text-green-500")} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.overdue + stats.failed}</p>
            <p className="text-[10px] text-muted-foreground">
              {stats.overdue} overdue, {stats.failed} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 5. Alert System */}
      {alertItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Active Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertItems.map((item) => (
              <Card
                key={item.id}
                className="border-red-300 dark:border-red-800 border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="text-sm font-semibold text-foreground truncate">{item.equipment}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{item.checkParameter}</p>
                      <p className="text-xs text-muted-foreground">
                        Last checked: {new Date(item.lastCheckDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {item.lastValue && <span className="ml-2 font-medium text-foreground">Value: {item.lastValue}</span>}
                      </p>
                    </div>
                    <Badge className={cn("text-[10px] shrink-0 ml-2", statusConfig[item.status].color)}>
                      {item.status}
                    </Badge>
                  </div>
                  {item.status === "Failed" && (
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-2 font-medium">
                      Result exceeded acceptance criteria: {item.acceptanceCriteria}
                    </p>
                  )}
                  {item.status === "Overdue" && (
                    <p className="text-[10px] text-red-600 dark:text-red-400 mt-2 font-medium">
                      Due: {new Date(item.nextDue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} &mdash; Action required immediately
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. Check Schedule Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Check Schedule</CardTitle>
              <CardDescription className="text-xs">All intermediate check parameters with status tracking</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search equipment or parameter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs w-56"
                />
              </div>
              <div className="flex gap-1">
                {["All", "Daily", "Weekly", "Monthly"].map((freq) => (
                  <Button
                    key={freq}
                    variant={filterFrequency === freq ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={() => setFilterFrequency(freq)}
                  >
                    {freq}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-t bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Equipment</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Check Parameter</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Frequency</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Acceptance Criteria</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last Check</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Last Result</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Next Due</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-t hover:bg-muted/30 transition-colors",
                      (item.status === "Failed" || item.status === "Overdue") && "bg-red-50/30 dark:bg-red-950/10"
                    )}
                  >
                    <td className="p-3">
                      <div className="font-medium text-foreground">{item.equipment}</div>
                      <div className="text-[10px] text-muted-foreground">{item.equipmentId}</div>
                    </td>
                    <td className="p-3 text-foreground">{item.checkParameter}</td>
                    <td className="p-3">
                      <Badge className={cn("text-[10px]", frequencyConfig[item.frequency].color)}>
                        {item.frequency}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground max-w-[180px]">{item.acceptanceCriteria}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(item.lastCheckDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Badge className={cn("text-[10px]", resultConfig[item.lastResult].color)}>
                          {item.lastResult === "Pass" ? (
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-0.5" />
                          )}
                          {item.lastResult}
                        </Badge>
                        <TrendIcon trend={item.trend} />
                      </div>
                      {item.lastValue && (
                        <span className="text-[10px] text-muted-foreground">{item.lastValue}</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(item.nextDue).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="p-3">
                      <Badge className={cn("text-[10px]", statusConfig[item.status].color)}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSchedule.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No check schedules matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Check Logging Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Check Results</CardTitle>
          <CardDescription className="text-xs">Last 10 intermediate check entries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-t bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Equipment</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Parameter</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Result</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Performed By</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentCheckLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={cn(
                      "border-t hover:bg-muted/30 transition-colors",
                      log.result === "Fail" && "bg-red-50/30 dark:bg-red-950/10"
                    )}
                  >
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-medium text-foreground">{log.equipment}</td>
                    <td className="p-3 text-foreground">{log.parameter}</td>
                    <td className="p-3">
                      <Badge className={cn("text-[10px]", resultConfig[log.result].color)}>
                        {log.result === "Pass" ? (
                          <CheckCircle2 className="h-3 w-3 mr-0.5" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-0.5" />
                        )}
                        {log.result}
                      </Badge>
                    </td>
                    <td className="p-3 text-foreground font-mono">{log.value}</td>
                    <td className="p-3 text-muted-foreground">{log.performedBy}</td>
                    <td className="p-3 text-muted-foreground max-w-[200px] truncate">{log.notes || "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 4. Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Reference Cell Isc Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Reference Cell Isc Trend</CardTitle>
            <CardDescription className="text-xs">
              Daily short-circuit current verification &mdash; RC-01 (Calibrated: 142.30 mA)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={refCellTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis
                  domain={[141.4, 143.2]}
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                  tickFormatter={(v) => `${v.toFixed(1)}`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number) => [`${value.toFixed(2)} mA`, "Isc"]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={143.01}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "UCL +0.5%", position: "right", fill: "#ef4444", fontSize: 9 }}
                />
                <ReferenceLine
                  y={141.59}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "LCL -0.5%", position: "right", fill: "#ef4444", fontSize: 9 }}
                />
                <ReferenceLine
                  y={142.30}
                  stroke="#3b82f6"
                  strokeDasharray="2 2"
                  label={{ value: "Target", position: "right", fill: "#3b82f6", fontSize: 9 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                  name="Isc (mA)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chamber Temperature Uniformity Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Chamber Temperature Uniformity Trend</CardTitle>
            <CardDescription className="text-xs">
              Weekly temperature uniformity check &mdash; CC-01 (Limit: &le;2.0&deg;C)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chamberTempTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis
                  domain={[0, 2.5]}
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                  tickFormatter={(v) => `${v.toFixed(1)}`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(value: number) => [`${value.toFixed(1)} \u00b0C`, "Uniformity"]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <ReferenceLine
                  y={2.0}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label={{ value: "UCL 2.0\u00b0C", position: "right", fill: "#ef4444", fontSize: 9 }}
                />
                <ReferenceLine
                  y={0}
                  stroke="#94a3b8"
                  strokeDasharray="2 2"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#f59e0b" }}
                  activeDot={{ r: 5 }}
                  name="Uniformity (\u00b0C)"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-3 w-3" />
              <span>Upward trend detected &mdash; approaching UCL. Review chamber sensor calibration.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}