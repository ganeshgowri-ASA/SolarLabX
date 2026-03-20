// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { staffMembers, timesheetEntries } from "@/lib/data/timesheet-data";
import type { TimesheetEntry, CellStatus } from "@/lib/types/timesheet";

const STATUS_COLORS: Record<CellStatus, { bg: string; text: string; label: string }> = {
  regular: { bg: "bg-green-100", text: "text-green-800", label: "Regular" },
  overtime: { bg: "bg-orange-100", text: "text-orange-800", label: "Overtime" },
  absent: { bg: "bg-red-100", text: "text-red-800", label: "Absent" },
  leave: { bg: "bg-gray-200", text: "text-gray-700", label: "Leave" },
  holiday: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Holiday" },
  off: { bg: "bg-gray-100", text: "text-gray-500", label: "Off" },
};

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function TimesheetMatrix() {
  const [month] = useState(2); // March = index 2
  const [year] = useState(2026);
  const [filterType, setFilterType] = useState<string>("all");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const filteredStaff = filterType === "all"
    ? staffMembers
    : staffMembers.filter((s) => s.type === filterType);

  // Build lookup map
  const entryMap = useMemo(() => {
    const map = new Map<string, TimesheetEntry>();
    timesheetEntries.forEach((e) => {
      map.set(`${e.staffId}-${e.date}`, e);
    });
    return map;
  }, []);

  // Calculate totals per staff
  const staffTotals = useMemo(() => {
    const totals = new Map<string, { totalHours: number; overtimeHours: number; daysWorked: number; daysAbsent: number; daysLeave: number }>();
    filteredStaff.forEach((staff) => {
      let totalHours = 0, overtimeHours = 0, daysWorked = 0, daysAbsent = 0, daysLeave = 0;
      days.forEach((day) => {
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const entry = entryMap.get(`${staff.id}-${date}`);
        if (entry) {
          totalHours += entry.hoursWorked;
          overtimeHours += entry.overtimeHours;
          if (entry.status === "regular" || entry.status === "overtime") daysWorked++;
          if (entry.status === "absent") daysAbsent++;
          if (entry.status === "leave") daysLeave++;
        }
      });
      totals.set(staff.id, { totalHours, overtimeHours, daysWorked, daysAbsent, daysLeave });
    });
    return totals;
  }, [filteredStaff, days, entryMap, month, year]);

  // Daily totals
  const dailyTotals = useMemo(() => {
    return days.map((day) => {
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      let hours = 0;
      filteredStaff.forEach((staff) => {
        const entry = entryMap.get(`${staff.id}-${date}`);
        if (entry) hours += entry.hoursWorked;
      });
      return hours;
    });
  }, [days, filteredStaff, entryMap, month, year]);

  const grandTotalHours = dailyTotals.reduce((s, h) => s + h, 0);
  const grandOvertimeHours = Array.from(staffTotals.values()).reduce((s, t) => s + t.overtimeHours, 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">{MONTH_NAMES[month]} {year} Timesheet</h3>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff ({staffMembers.length})</SelectItem>
              <SelectItem value="permanent">Permanent (12)</SelectItem>
              <SelectItem value="off-role">Off-Role/Contract (12)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {Object.entries(STATUS_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1 text-[10px]">
              <span className={cn("w-3 h-3 rounded-sm", val.bg)} />
              <span className="text-muted-foreground">{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground uppercase">Total Hours</p><p className="text-xl font-bold mt-0.5">{grandTotalHours}h</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground uppercase">Overtime</p><p className="text-xl font-bold text-orange-600 mt-0.5">{grandOvertimeHours}h</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground uppercase">Staff Count</p><p className="text-xl font-bold mt-0.5">{filteredStaff.length}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground uppercase">Avg Hours/Person</p><p className="text-xl font-bold mt-0.5">{filteredStaff.length > 0 ? Math.round(grandTotalHours / filteredStaff.length) : 0}h</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-[10px] text-muted-foreground uppercase">Working Days</p><p className="text-xl font-bold mt-0.5">{days.filter((d) => { const dow = new Date(year, month, d).getDay(); return dow !== 0; }).length}</p></CardContent></Card>
      </div>

      {/* Matrix Table */}
      <Card>
        <CardContent className="p-2">
          <div className="overflow-auto max-h-[600px]">
            <table className="w-full text-[10px] border-collapse" style={{ minWidth: `${200 + daysInMonth * 42 + 180}px` }}>
              <thead className="sticky top-0 bg-background z-10">
                <tr>
                  <th className="p-1 text-left font-semibold border-b sticky left-0 bg-background z-20 min-w-[140px]">Staff</th>
                  <th className="p-1 text-left font-semibold border-b min-w-[50px]">Type</th>
                  {days.map((day) => {
                    const date = new Date(year, month, day);
                    const dow = date.getDay();
                    const isSunday = dow === 0;
                    return (
                      <th key={day} className={cn("p-1 text-center font-semibold border-b min-w-[38px]", isSunday && "bg-red-50")}>
                        <div>{dayNames[dow].charAt(0)}</div>
                        <div className={cn(isSunday && "text-red-500")}>{day}</div>
                      </th>
                    );
                  })}
                  <th className="p-1 text-center font-semibold border-b min-w-[40px]">Hrs</th>
                  <th className="p-1 text-center font-semibold border-b min-w-[30px]">OT</th>
                  <th className="p-1 text-center font-semibold border-b min-w-[30px]">Days</th>
                  <th className="p-1 text-center font-semibold border-b min-w-[30px]">Abs</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => {
                  const totals = staffTotals.get(staff.id);
                  return (
                    <tr key={staff.id} className="border-b hover:bg-muted/20">
                      <td className="p-1 sticky left-0 bg-background z-10">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0",
                            staff.type === "permanent" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                          )}>
                            {staff.code}
                          </span>
                          <span className="font-medium truncate max-w-[90px]">{staff.name}</span>
                        </div>
                      </td>
                      <td className="p-1">
                        <Badge className={cn("text-[8px]", staff.type === "permanent" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600")}>
                          {staff.type === "permanent" ? "Perm" : "Cont"}
                        </Badge>
                      </td>
                      {days.map((day) => {
                        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const entry = entryMap.get(`${staff.id}-${date}`);
                        const cellKey = `${staff.id}-${day}`;
                        const isHovered = hoveredCell === cellKey;

                        if (!entry) {
                          return <td key={day} className="p-0.5 text-center"><div className="w-full h-6 rounded bg-gray-50" /></td>;
                        }

                        return (
                          <td
                            key={day}
                            className="p-0.5 text-center relative"
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div className={cn(
                              "w-full h-6 rounded flex items-center justify-center font-medium cursor-default transition-colors",
                              STATUS_COLORS[entry.status].bg,
                              STATUS_COLORS[entry.status].text,
                            )}>
                              {entry.hoursWorked > 0 ? `${entry.hoursWorked}` : entry.shift.charAt(0)}
                            </div>
                            {isHovered && (
                              <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-popover border rounded-md shadow-lg p-2 min-w-[140px] text-left">
                                <p className="font-semibold">{staff.name}</p>
                                <p className="text-muted-foreground">Shift: {entry.shift}</p>
                                <p className="text-muted-foreground">Hours: {entry.hoursWorked}h {entry.overtimeHours > 0 ? `(+${entry.overtimeHours} OT)` : ""}</p>
                                <p className="text-muted-foreground">Task: {entry.taskAssigned}</p>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-1 text-center font-bold">{totals?.totalHours || 0}</td>
                      <td className="p-1 text-center font-bold text-orange-600">{totals?.overtimeHours || 0}</td>
                      <td className="p-1 text-center">{totals?.daysWorked || 0}</td>
                      <td className="p-1 text-center text-red-600">{(totals?.daysAbsent || 0) + (totals?.daysLeave || 0)}</td>
                    </tr>
                  );
                })}
                {/* Daily Totals Row */}
                <tr className="border-t-2 font-bold bg-muted/30">
                  <td className="p-1 sticky left-0 bg-muted/30 z-10">Daily Total</td>
                  <td className="p-1" />
                  {dailyTotals.map((hours, i) => (
                    <td key={i} className="p-1 text-center">{hours > 0 ? hours : ""}</td>
                  ))}
                  <td className="p-1 text-center">{grandTotalHours}</td>
                  <td className="p-1 text-center text-orange-600">{grandOvertimeHours}</td>
                  <td className="p-1" />
                  <td className="p-1" />
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
