// @ts-nocheck
"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { staffMembers, taskReassignments as initialReassignments, timesheetEntries } from "@/lib/data/timesheet-data";
import type { TaskReassignment as TaskReassignmentType, StaffMember } from "@/lib/types/timesheet";

const REASSIGNMENT_STATUS = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
};

export default function TaskReassignment() {
  const [reassignments, setReassignments] = useState<TaskReassignmentType[]>([...initialReassignments]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newHandoverNotes, setNewHandoverNotes] = useState("");
  const [selectedAbsentee, setSelectedAbsentee] = useState<string>("");
  const [selectedReliever, setSelectedReliever] = useState<string>("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  // Find absent staff today
  const todayStr = "2026-03-20";
  const absentStaff = useMemo(() => {
    const absentIds = new Set<string>();
    timesheetEntries.forEach((e) => {
      if (e.date === todayStr && (e.status === "absent" || e.status === "leave")) {
        absentIds.add(e.staffId);
      }
    });
    return staffMembers.filter((s) => absentIds.has(s.id));
  }, []);

  // Available relievers: staff who are working today and in compatible skill groups
  const getAvailableRelievers = useCallback((absenteeId: string): StaffMember[] => {
    const absentee = staffMembers.find((s) => s.id === absenteeId);
    if (!absentee) return [];
    const workingIds = new Set<string>();
    timesheetEntries.forEach((e) => {
      if (e.date === todayStr && (e.status === "regular" || e.status === "overtime")) {
        workingIds.add(e.staffId);
      }
    });
    return staffMembers
      .filter((s) => workingIds.has(s.id) && s.id !== absenteeId)
      .filter((s) => s.skillGroup === absentee.skillGroup || s.type === absentee.type)
      .slice(0, 5);
  }, []);

  function handleDragStart(reassignmentId: string) {
    setDraggedTask(reassignmentId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(relieverId: string) {
    if (!draggedTask) return;
    const reliever = staffMembers.find((s) => s.id === relieverId);
    if (!reliever) return;
    setReassignments((prev) =>
      prev.map((r) =>
        r.id === draggedTask ? { ...r, relieverId, relieverName: reliever.name, status: "accepted" as const, notificationSent: true } : r
      )
    );
    setDraggedTask(null);
  }

  function handleCreateReassignment() {
    if (!selectedAbsentee || !selectedReliever || !newTaskDesc) return;
    const absentee = staffMembers.find((s) => s.id === selectedAbsentee);
    const reliever = staffMembers.find((s) => s.id === selectedReliever);
    if (!absentee || !reliever) return;

    const newR: TaskReassignmentType = {
      id: `TR-${String(reassignments.length + 1).padStart(3, "0")}`,
      originalAssigneeId: absentee.id,
      originalAssigneeName: absentee.name,
      relieverId: reliever.id,
      relieverName: reliever.name,
      taskDescription: newTaskDesc,
      date: todayStr,
      handoverNotes: newHandoverNotes,
      status: "pending",
      notificationSent: true,
    };
    setReassignments((prev) => [...prev, newR]);
    setShowNewForm(false);
    setNewHandoverNotes("");
    setSelectedAbsentee("");
    setSelectedReliever("");
    setNewTaskDesc("");
  }

  return (
    <div className="space-y-4">
      {/* Absent Staff Alert */}
      {absentStaff.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700">Absent Staff Today ({todayStr})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {absentStaff.map((staff) => {
                const relievers = getAvailableRelievers(staff.id);
                return (
                  <div key={staff.id} className="bg-white rounded-lg border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">
                          {staff.code}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{staff.name}</p>
                          <p className="text-[10px] text-muted-foreground">{staff.role} | {staff.skillGroup}</p>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-700 text-[10px]">Absent</Badge>
                    </div>
                    {relievers.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">Suggested Relievers:</p>
                        <div className="space-y-1">
                          {relievers.map((r) => (
                            <div key={r.id} className="flex items-center justify-between text-[10px] p-1 rounded bg-green-50">
                              <span className="font-medium">{r.name} ({r.code})</span>
                              <span className="text-muted-foreground">{r.skillGroup}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reassignment Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Task Reassignments</h3>
        <Button size="sm" className="h-7 text-xs" onClick={() => setShowNewForm(!showNewForm)}>
          + New Reassignment
        </Button>
      </div>

      {/* New Reassignment Form */}
      {showNewForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Create Task Reassignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Absent Staff Member</label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-xs"
                  value={selectedAbsentee}
                  onChange={(e) => setSelectedAbsentee(e.target.value)}
                >
                  <option value="">Select staff member...</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code}) - {s.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase block mb-1">Assign Reliever</label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-xs"
                  value={selectedReliever}
                  onChange={(e) => setSelectedReliever(e.target.value)}
                >
                  <option value="">Select reliever...</option>
                  {selectedAbsentee
                    ? getAvailableRelievers(selectedAbsentee).map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code}) - {s.skillGroup}</option>
                      ))
                    : staffMembers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Task Description</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1.5 text-xs"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Describe the task to be reassigned..."
              />
            </div>
            <div className="mb-4">
              <label className="text-[10px] text-muted-foreground uppercase block mb-1">Handover Notes</label>
              <textarea
                className="w-full border rounded px-2 py-1.5 text-xs h-16"
                value={newHandoverNotes}
                onChange={(e) => setNewHandoverNotes(e.target.value)}
                placeholder="Important information for the reliever..."
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateReassignment}>Create & Notify Reliever</Button>
              <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag-and-drop reassignment board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Reassignments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending / Active Reassignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reassignments.filter((r) => r.status !== "completed").length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No pending reassignments</p>
            ) : (
              reassignments.filter((r) => r.status !== "completed").map((r) => (
                <div
                  key={r.id}
                  draggable
                  onDragStart={() => handleDragStart(r.id)}
                  className="border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium">{r.taskDescription}</p>
                      <p className="text-[10px] text-muted-foreground">
                        From: {r.originalAssigneeName} → To: {r.relieverName}
                      </p>
                    </div>
                    <Badge className={cn("text-[10px]", REASSIGNMENT_STATUS[r.status].color)}>
                      {REASSIGNMENT_STATUS[r.status].label}
                    </Badge>
                  </div>
                  {r.handoverNotes && (
                    <div className="bg-muted/50 rounded p-2 mt-2 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Notes:</span> {r.handoverNotes}
                    </div>
                  )}
                  {r.notificationSent && (
                    <div className="mt-1 text-[9px] text-green-600 flex items-center gap-1">
                      <span>✓</span> Notification sent to reliever
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Available Relievers (Drop targets) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Available Staff - Drop to Reassign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {staffMembers
              .filter((s) => !absentStaff.some((a) => a.id === s.id))
              .slice(0, 12)
              .map((staff) => (
                <div
                  key={staff.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(staff.id)}
                  className="flex items-center justify-between border rounded-lg p-2 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                      staff.type === "permanent" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {staff.code}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{staff.name}</p>
                      <p className="text-[10px] text-muted-foreground">{staff.role} | {staff.skillGroup}</p>
                    </div>
                  </div>
                  <Badge className={cn("text-[10px]", staff.type === "permanent" ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600")}>
                    {staff.type === "permanent" ? "Permanent" : "Contract"}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Completed Reassignments */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Completed Reassignment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold">Date</th>
                  <th className="p-2 text-left font-semibold">Task</th>
                  <th className="p-2 text-left font-semibold">Original Assignee</th>
                  <th className="p-2 text-left font-semibold">Reliever</th>
                  <th className="p-2 text-left font-semibold">Handover Notes</th>
                  <th className="p-2 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {reassignments.filter((r) => r.status === "completed").map((r) => (
                  <tr key={r.id} className="border-b hover:bg-muted/30">
                    <td className="p-2">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="p-2 font-medium">{r.taskDescription}</td>
                    <td className="p-2">{r.originalAssigneeName}</td>
                    <td className="p-2">{r.relieverName}</td>
                    <td className="p-2 text-muted-foreground max-w-[200px] truncate">{r.handoverNotes}</td>
                    <td className="p-2 text-center">
                      <Badge className="text-[10px] bg-green-100 text-green-700">Completed</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
