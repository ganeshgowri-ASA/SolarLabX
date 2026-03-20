// @ts-nocheck
"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { staffMembers, shiftDefinitions, shiftAssignments as initialAssignments, shiftSwapRequests as initialSwapRequests } from "@/lib/data/timesheet-data";
import type { ShiftAssignment, ShiftSwapRequest, ShiftType } from "@/lib/types/timesheet";

const SHIFT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" },
  B: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
  C: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
  OFF: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200" },
  LEAVE: { bg: "bg-gray-200", text: "text-gray-600", border: "border-gray-300" },
  HOLIDAY: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-300" },
};

export default function ShiftRoster() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([...initialAssignments]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([...initialSwapRequests]);
  const [activeSubTab, setActiveSubTab] = useState("weekly");
  const [selectedWeekStart, setSelectedWeekStart] = useState(16); // March 16 week
  const [draggedStaff, setDraggedStaff] = useState<{ staffId: string; date: string } | null>(null);

  // Week view: 7 days starting from selectedWeekStart
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = selectedWeekStart + i;
      const date = `2026-03-${String(day).padStart(2, "0")}`;
      const d = new Date(2026, 2, day);
      return { day, date, dow: d.getDay(), dayName: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] };
    });
  }, [selectedWeekStart]);

  // Build lookup
  const assignmentMap = useMemo(() => {
    const map = new Map<string, ShiftAssignment>();
    assignments.forEach((a) => map.set(`${a.staffId}-${a.date}`, a));
    return map;
  }, [assignments]);

  // Shift statistics
  const shiftStats = useMemo(() => {
    const stats = new Map<string, { totalShifts: number; nightShifts: number; totalHours: number; overtimeHours: number }>();
    staffMembers.forEach((staff) => {
      let totalShifts = 0, nightShifts = 0, totalHours = 0;
      assignments.forEach((a) => {
        if (a.staffId === staff.id) {
          const shiftDef = shiftDefinitions.find((sd) => sd.code === a.shift);
          if (shiftDef && shiftDef.hours > 0) {
            totalShifts++;
            totalHours += shiftDef.hours;
            if (a.shift === "C") nightShifts++;
          }
        }
      });
      const overtime = Math.max(0, totalHours - 176); // ~22 working days * 8h
      stats.set(staff.id, { totalShifts, nightShifts, totalHours, overtimeHours: overtime });
    });
    return stats;
  }, [assignments]);

  function handleShiftChange(staffId: string, date: string, newShift: ShiftType) {
    setAssignments((prev) => {
      const key = `${staffId}-${date}`;
      const existing = prev.find((a) => a.staffId === staffId && a.date === date);
      if (existing) {
        return prev.map((a) =>
          a.staffId === staffId && a.date === date ? { ...a, shift: newShift } : a
        );
      }
      return [...prev, { staffId, date, shift: newShift, isReliever: false, relievingFor: null, tasks: [] }];
    });
  }

  function handleDragStart(staffId: string, date: string) {
    setDraggedStaff({ staffId, date });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDropOnCell(targetStaffId: string, targetDate: string) {
    if (!draggedStaff) return;
    const sourceAssignment = assignmentMap.get(`${draggedStaff.staffId}-${draggedStaff.date}`);
    const targetAssignment = assignmentMap.get(`${targetStaffId}-${targetDate}`);
    if (sourceAssignment && targetAssignment) {
      // Swap shifts
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.staffId === draggedStaff.staffId && a.date === draggedStaff.date) {
            return { ...a, shift: targetAssignment.shift };
          }
          if (a.staffId === targetStaffId && a.date === targetDate) {
            return { ...a, shift: sourceAssignment.shift };
          }
          return a;
        })
      );
    }
    setDraggedStaff(null);
  }

  function handleApproveSwap(requestId: string) {
    setSwapRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: "approved" as const } : r)
    );
  }

  function handleRejectSwap(requestId: string) {
    setSwapRequests((prev) =>
      prev.map((r) => r.id === requestId ? { ...r, status: "rejected" as const } : r)
    );
  }

  return (
    <div className="space-y-4">
      {/* Shift Definitions */}
      <div className="flex items-center gap-3 flex-wrap">
        {shiftDefinitions.filter((s) => s.hours > 0).map((s) => (
          <div key={s.code} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border", SHIFT_COLORS[s.code]?.bg, SHIFT_COLORS[s.code]?.text, SHIFT_COLORS[s.code]?.border)}>
            <span className="font-bold">{s.code}</span>
            <span>{s.name}</span>
            <span className="text-muted-foreground">({s.startTime}-{s.endTime})</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border bg-gray-100 text-gray-500">
          <span className="font-bold">OFF</span> Day Off
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="weekly">Weekly Roster</TabsTrigger>
          <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          <TabsTrigger value="swaps">Swap Requests ({swapRequests.filter((r) => r.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="statistics">Shift Statistics</TabsTrigger>
        </TabsList>

        {/* Weekly Roster */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedWeekStart(Math.max(1, selectedWeekStart - 7))}>
              ← Previous Week
            </Button>
            <span className="text-sm font-medium">
              March {selectedWeekStart} - {Math.min(selectedWeekStart + 6, 31)}, 2026
            </span>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedWeekStart(Math.min(25, selectedWeekStart + 7))}>
              Next Week →
            </Button>
          </div>

          <Card>
            <CardContent className="p-2">
              <div className="overflow-auto">
                <table className="w-full text-xs border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="p-2 text-left font-semibold w-48 border-b">Staff</th>
                      {weekDays.map((d) => (
                        <th key={d.date} className={cn("p-2 text-center font-semibold border-b min-w-[100px]", d.dow === 0 && "bg-red-50")}>
                          <div>{d.dayName}</div>
                          <div className={cn("text-sm", d.dow === 0 && "text-red-500")}>{d.day}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Permanent Staff */}
                    <tr><td colSpan={8} className="p-1 text-[10px] font-bold text-blue-600 bg-blue-50/50 uppercase tracking-wide">Permanent Staff (P1-P12)</td></tr>
                    {staffMembers.filter((s) => s.type === "permanent").map((staff) => (
                      <tr key={staff.id} className="border-b hover:bg-muted/20">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">{staff.code}</span>
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-[10px] text-muted-foreground">{staff.role}</div>
                            </div>
                          </div>
                        </td>
                        {weekDays.map((d) => {
                          const assignment = assignmentMap.get(`${staff.id}-${d.date}`);
                          const shift = assignment?.shift || "OFF";
                          const colors = SHIFT_COLORS[shift] || SHIFT_COLORS.OFF;
                          return (
                            <td key={d.date} className={cn("p-1 text-center", d.dow === 0 && "bg-red-50/30")}>
                              <div
                                draggable
                                onDragStart={() => handleDragStart(staff.id, d.date)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDropOnCell(staff.id, d.date)}
                                className={cn(
                                  "rounded-md p-1.5 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
                                  colors.bg, colors.text, "border", colors.border
                                )}
                              >
                                <div className="font-bold text-sm">{shift}</div>
                                {assignment?.tasks?.[0] && (
                                  <div className="text-[9px] mt-0.5 truncate opacity-75">{assignment.tasks[0].length > 15 ? assignment.tasks[0].substring(0, 15) + "..." : assignment.tasks[0]}</div>
                                )}
                                {assignment?.isReliever && (
                                  <div className="text-[8px] mt-0.5 font-semibold">↻ Relieving</div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                    {/* Off-role Staff */}
                    <tr><td colSpan={8} className="p-1 text-[10px] font-bold text-orange-600 bg-orange-50/50 uppercase tracking-wide">Off-Role / Contract Staff (O1-O12)</td></tr>
                    {staffMembers.filter((s) => s.type === "off-role").map((staff) => (
                      <tr key={staff.id} className="border-b hover:bg-muted/20">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[9px] font-bold">{staff.code}</span>
                            <div>
                              <div className="font-medium">{staff.name}</div>
                              <div className="text-[10px] text-muted-foreground">{staff.role}</div>
                            </div>
                          </div>
                        </td>
                        {weekDays.map((d) => {
                          const assignment = assignmentMap.get(`${staff.id}-${d.date}`);
                          const shift = assignment?.shift || "OFF";
                          const colors = SHIFT_COLORS[shift] || SHIFT_COLORS.OFF;
                          return (
                            <td key={d.date} className={cn("p-1 text-center", d.dow === 0 && "bg-red-50/30")}>
                              <div
                                draggable
                                onDragStart={() => handleDragStart(staff.id, d.date)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDropOnCell(staff.id, d.date)}
                                className={cn(
                                  "rounded-md p-1.5 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
                                  colors.bg, colors.text, "border", colors.border
                                )}
                              >
                                <div className="font-bold text-sm">{shift}</div>
                                {assignment?.tasks?.[0] && (
                                  <div className="text-[9px] mt-0.5 truncate opacity-75">{assignment.tasks[0].length > 15 ? assignment.tasks[0].substring(0, 15) + "..." : assignment.tasks[0]}</div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly View */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">March 2026 - Monthly Shift Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-[9px] border-collapse" style={{ minWidth: "1200px" }}>
                  <thead className="sticky top-0 bg-background z-10">
                    <tr>
                      <th className="p-1 text-left font-semibold w-32 border-b sticky left-0 bg-background z-20">Staff</th>
                      {Array.from({ length: 31 }, (_, i) => {
                        const d = new Date(2026, 2, i + 1);
                        const dow = d.getDay();
                        return (
                          <th key={i} className={cn("p-0.5 text-center font-semibold border-b min-w-[28px]", dow === 0 && "bg-red-50")}>
                            <div className="text-[8px]">{["S", "M", "T", "W", "T", "F", "S"][dow]}</div>
                            <div>{i + 1}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map((staff) => (
                      <tr key={staff.id} className="border-b">
                        <td className="p-1 sticky left-0 bg-background z-10">
                          <span className="font-medium">{staff.code} {staff.name.split(" ")[0]}</span>
                        </td>
                        {Array.from({ length: 31 }, (_, i) => {
                          const date = `2026-03-${String(i + 1).padStart(2, "0")}`;
                          const assignment = assignmentMap.get(`${staff.id}-${date}`);
                          const shift = assignment?.shift || "OFF";
                          const colors = SHIFT_COLORS[shift] || SHIFT_COLORS.OFF;
                          const dow = new Date(2026, 2, i + 1).getDay();
                          return (
                            <td key={i} className={cn("p-0.5 text-center", dow === 0 && "bg-red-50/30")}>
                              <div className={cn("rounded px-0.5 py-0.5 font-bold", colors.bg, colors.text)}>
                                {shift.charAt(0)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Swap Requests */}
        <TabsContent value="swaps" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shift Swap Requests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {swapRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No swap requests</p>
              ) : (
                swapRequests.map((req) => (
                  <div key={req.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">{req.requesterName}</span>
                          <span className="text-xs text-muted-foreground">↔</span>
                          <span className="text-sm font-semibold">{req.targetName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Date: {new Date(req.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" | "}Swap: <Badge className={cn("text-[10px]", SHIFT_COLORS[req.fromShift]?.bg, SHIFT_COLORS[req.fromShift]?.text)}>{req.fromShift}</Badge>
                          {" → "}<Badge className={cn("text-[10px]", SHIFT_COLORS[req.toShift]?.bg, SHIFT_COLORS[req.toShift]?.text)}>{req.toShift}</Badge>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Reason: {req.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-[10px]",
                          req.status === "pending" ? "bg-amber-100 text-amber-700" :
                          req.status === "approved" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </Badge>
                        {req.status === "pending" && (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 text-green-600" onClick={() => handleApproveSwap(req.id)}>
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 text-red-600" onClick={() => handleRejectSwap(req.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shift Statistics - March 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-semibold">Staff</th>
                      <th className="p-2 text-left font-semibold">Type</th>
                      <th className="p-2 text-left font-semibold">Role</th>
                      <th className="p-2 text-center font-semibold">Total Shifts</th>
                      <th className="p-2 text-center font-semibold">Night Shifts</th>
                      <th className="p-2 text-center font-semibold">Total Hours</th>
                      <th className="p-2 text-center font-semibold">Overtime</th>
                      <th className="p-2 font-semibold">Workload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffMembers.map((staff) => {
                      const stats = shiftStats.get(staff.id);
                      const util = stats ? Math.round((stats.totalHours / 176) * 100) : 0;
                      return (
                        <tr key={staff.id} className="border-b hover:bg-muted/30">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold",
                                staff.type === "permanent" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                              )}>
                                {staff.code}
                              </span>
                              <span className="font-medium">{staff.name}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge className={cn("text-[10px]", staff.type === "permanent" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600")}>
                              {staff.type === "permanent" ? "Perm" : "Cont"}
                            </Badge>
                          </td>
                          <td className="p-2 text-muted-foreground">{staff.role}</td>
                          <td className="p-2 text-center font-medium">{stats?.totalShifts || 0}</td>
                          <td className="p-2 text-center">
                            <span className={cn(stats?.nightShifts && stats.nightShifts > 5 ? "text-purple-600 font-semibold" : "")}>
                              {stats?.nightShifts || 0}
                            </span>
                          </td>
                          <td className="p-2 text-center font-medium">{stats?.totalHours || 0}h</td>
                          <td className="p-2 text-center">
                            <span className={cn(stats?.overtimeHours && stats.overtimeHours > 0 ? "text-orange-600 font-semibold" : "text-muted-foreground")}>
                              {stats?.overtimeHours || 0}h
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  util > 100 ? "bg-red-500" : util >= 90 ? "bg-amber-500" : "bg-green-500"
                                )}
                                style={{ width: `${Math.min(util, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{util}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Export */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              Export Roster (PDF)
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Export Roster (Excel)
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
