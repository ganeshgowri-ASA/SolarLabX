"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  teamMembers,
  manpowerTasks,
  leaveRecords,
  skillMatrix,
  COMPLEXITY_CONFIG,
} from "@/lib/data/manpower-data";
import type { ManpowerTask, TeamMember, TaskComplexity, TaskStatus } from "@/lib/types/manpower";
import TimesheetMatrix from "@/components/manpower/TimesheetMatrix";
import TimesheetTab from "@/components/manpower/TimesheetTab";
import TaskReassignmentComponent from "@/components/manpower/TaskReassignment";
import ShiftRoster from "@/components/manpower/ShiftRoster";

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-700" },
  "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  "on-hold": { label: "On Hold", color: "bg-amber-100 text-amber-700" },
};

const SKILL_NAMES = ["TC200", "DH1000", "UV", "STC", "Mech Load", "Hail", "Dielectric", "EL Imaging", "Report Writing", "Uncertainty"];

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const start = new Date(baseDate);
  start.setDate(start.getDate() - day + 1); // Start from Monday
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function ManpowerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentDate] = useState(new Date(2026, 2, 19));
  const [tasks, setTasks] = useState<ManpowerTask[]>([...manpowerTasks]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("all");

  // Summary stats
  const stats = useMemo(() => {
    const totalMembers = teamMembers.length;
    const availableMembers = teamMembers.filter((m) => m.availability === "available").length;
    const totalHoursWeek = teamMembers.reduce((s, m) => s + m.hoursThisWeek, 0);
    const maxHoursWeek = teamMembers.reduce((s, m) => s + m.maxHoursPerWeek, 0);
    const unassignedTasks = tasks.filter((t) => !t.assigneeId && t.status !== "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const overloadedMembers = teamMembers.filter((m) => m.hoursThisWeek > m.maxHoursPerWeek).length;
    return { totalMembers, availableMembers, totalHoursWeek, maxHoursWeek, unassignedTasks, inProgressTasks, pendingTasks, overloadedMembers };
  }, [tasks]);

  // Drag and drop handlers
  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTask(taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((memberId: string) => {
    if (!draggedTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggedTask
          ? { ...t, assigneeId: memberId, assigneeName: teamMembers.find((m) => m.id === memberId)?.name || null }
          : t
      )
    );
    setDraggedTask(null);
  }, [draggedTask]);

  // Auto-suggest assignment
  const getSuggestedAssignee = useCallback((task: ManpowerTask): TeamMember | null => {
    const candidates = teamMembers
      .filter((m) => m.availability !== "on-leave")
      .filter((m) => task.requiredSkills.some((s) => m.skills.includes(s) || m.qualifiedTests.some((qt) => s.toLowerCase().includes(qt.toLowerCase()))))
      .sort((a, b) => {
        const aUtil = a.hoursThisWeek / a.maxHoursPerWeek;
        const bUtil = b.hoursThisWeek / b.maxHoursPerWeek;
        return aUtil - bUtil;
      });
    return candidates[0] || null;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Manpower Resource Allocation</h1>
        <p className="text-sm text-muted-foreground">Team scheduling, task assignment, and workload management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Team Size</p><p className="text-xl font-bold mt-0.5">{stats.totalMembers}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Available</p><p className="text-xl font-bold text-green-600 mt-0.5">{stats.availableMembers}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hours Used</p><p className="text-xl font-bold mt-0.5">{stats.totalHoursWeek}/{stats.maxHoursWeek}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Utilization</p><p className="text-xl font-bold mt-0.5">{Math.round((stats.totalHoursWeek / stats.maxHoursWeek) * 100)}%</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">In Progress</p><p className="text-xl font-bold text-blue-600 mt-0.5">{stats.inProgressTasks}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p><p className="text-xl font-bold text-amber-600 mt-0.5">{stats.pendingTasks}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Unassigned</p><p className="text-xl font-bold text-red-600 mt-0.5">{stats.unassignedTasks}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-[10px] text-muted-foreground uppercase tracking-wide">Overloaded</p><p className="text-xl font-bold text-red-600 mt-0.5">{stats.overloadedMembers}</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="tasks">Task Board</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          <TabsTrigger value="reassignment">Task Reassignment</TabsTrigger>
          <TabsTrigger value="shift-roster">Shift Roster</TabsTrigger>
          <TabsTrigger value="skills">Skill Matrix</TabsTrigger>
          <TabsTrigger value="training">Training & Competency</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Team Overview */}
        <TabsContent value="overview" className="space-y-4">
          <TeamCapacityOverview members={teamMembers} />
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar" className="space-y-4">
          <ManpowerCalendar currentDate={currentDate} tasks={tasks} selectedMember={selectedMember} onSelectMember={setSelectedMember} />
        </TabsContent>

        {/* Task Board */}
        <TabsContent value="tasks" className="space-y-4">
          <TaskBoard
            tasks={tasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            getSuggestedAssignee={getSuggestedAssignee}
            onAssignTask={(taskId: string, memberId: string) => {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === taskId
                    ? { ...t, assigneeId: memberId, assigneeName: teamMembers.find((m) => m.id === memberId)?.name || null, status: "in-progress" as const }
                    : t
                )
              );
            }}
          />
        </TabsContent>

        {/* Timesheet */}
        <TabsContent value="timesheet" className="space-y-4">
          <TimesheetTab />
        </TabsContent>

        {/* Task Reassignment */}
        <TabsContent value="reassignment" className="space-y-4">
          <TaskReassignmentComponent />
        </TabsContent>

        {/* Shift Roster */}
        <TabsContent value="shift-roster" className="space-y-4">
          <ShiftRoster />
        </TabsContent>

        {/* Skill Matrix */}
        <TabsContent value="skills" className="space-y-4">
          <SkillMatrixView />
        </TabsContent>

        {/* Training & Competency */}
        <TabsContent value="training" className="space-y-4">
          <TrainingCompetencyTab />
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="space-y-4">
          <UtilizationReports members={teamMembers} tasks={tasks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Team Capacity Overview
function TeamCapacityOverview({ members }: { members: TeamMember[] }) {
  return (
    <div className="space-y-4">
      {/* Workload Balancing Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Team Workload Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => {
            const weekUtil = Math.round((member.hoursThisWeek / member.maxHoursPerWeek) * 100);
            const monthUtil = Math.round((member.hoursThisMonth / member.maxHoursPerMonth) * 100);
            const isOverloaded = weekUtil > 100;
            const onLeave = leaveRecords.filter((l) => l.memberId === member.id && l.approved);

            return (
              <div key={member.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.role}</span>
                    </div>
                    <Badge className={cn("text-[10px]",
                      member.availability === "available" ? "bg-green-100 text-green-700" :
                      member.availability === "busy" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {member.availability}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Weekly</span>
                        <span className={cn("font-medium", isOverloaded ? "text-red-600" : "text-foreground")}>{member.hoursThisWeek}h / {member.maxHoursPerWeek}h ({weekUtil}%)</span>
                      </div>
                      <Progress value={Math.min(weekUtil, 100)} className={cn("h-2", isOverloaded && "[&>div]:bg-red-500", weekUtil >= 90 && weekUtil <= 100 && "[&>div]:bg-amber-500")} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Monthly</span>
                        <span className="font-medium">{member.hoursThisMonth}h / {member.maxHoursPerMonth}h ({monthUtil}%)</span>
                      </div>
                      <Progress value={Math.min(monthUtil, 100)} className={cn("h-2", monthUtil > 100 && "[&>div]:bg-red-500")} />
                    </div>
                  </div>

                  {onLeave.length > 0 && (
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {onLeave.map((l) => (
                        <span key={l.id} className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Leave: {l.startDate} to {l.endDate} ({l.type})
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    {member.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{skill}</span>
                    ))}
                    {member.skills.length > 5 && <span className="text-[9px] text-muted-foreground">+{member.skills.length - 5}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// Manpower Calendar
function ManpowerCalendar({
  currentDate,
  tasks,
  selectedMember,
  onSelectMember,
}: {
  currentDate: Date;
  tasks: ManpowerTask[];
  selectedMember: string;
  onSelectMember: (v: string) => void;
}) {
  const weekDates = getWeekDates(currentDate);
  const filteredMembers = selectedMember === "all" ? teamMembers : teamMembers.filter((m) => m.id === selectedMember);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Select value={selectedMember} onValueChange={onSelectMember}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue placeholder="All Members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 text-xs">
          {(Object.entries(COMPLEXITY_CONFIG) as [TaskComplexity, typeof COMPLEXITY_CONFIG[TaskComplexity]][]).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={cn("w-3 h-3 rounded-full", config.color)} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-muted-foreground">Leave</span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-2 text-left font-semibold w-40">Team Member</th>
                  {weekDates.map((d, i) => {
                    const dateStr = formatDate(d);
                    const isToday = dateStr === "2026-03-19";
                    return (
                      <th key={dateStr} className={cn("p-2 text-center font-semibold", isToday && "bg-primary/10")}>
                        <div>{DAY_NAMES_SHORT[i]}</div>
                        <div className={cn("w-7 h-7 flex items-center justify-center rounded-full mx-auto font-bold", isToday && "bg-primary text-primary-foreground")}>{d.getDate()}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-t">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{member.avatar}</div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-[10px] text-muted-foreground">{member.role}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((d) => {
                      const dateStr = formatDate(d);
                      const isToday = dateStr === "2026-03-19";
                      const leave = leaveRecords.find((l) => l.memberId === member.id && l.approved && dateStr >= l.startDate && dateStr <= l.endDate);
                      const memberTasks = tasks.filter((t) => t.assigneeId === member.id && dateStr >= t.startDate && dateStr <= t.endDate && t.status !== "completed");

                      return (
                        <td key={dateStr} className={cn("p-1 align-top min-w-[120px]", isToday && "bg-primary/5")}>
                          {leave ? (
                            <div className="bg-gray-200 text-gray-600 rounded px-1.5 py-1 text-[10px] font-medium">
                              {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              {memberTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "rounded px-1.5 py-1 text-[10px] font-medium truncate",
                                    COMPLEXITY_CONFIG[task.complexity].bgColor,
                                    COMPLEXITY_CONFIG[task.complexity].textColor
                                  )}
                                  title={task.title}
                                >
                                  {task.title.length > 20 ? task.title.substring(0, 20) + "..." : task.title}
                                </div>
                              ))}
                            </div>
                          )}
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
    </div>
  );
}

// Task Board
function TaskBoard({
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  getSuggestedAssignee,
  onAssignTask,
}: {
  tasks: ManpowerTask[];
  onDragStart: (taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (memberId: string) => void;
  getSuggestedAssignee: (task: ManpowerTask) => TeamMember | null;
  onAssignTask: (taskId: string, memberId: string) => void;
}) {
  const [complexityFilter, setComplexityFilter] = useState<string>("all");

  const filteredTasks = complexityFilter === "all" ? tasks : tasks.filter((t) => t.complexity === complexityFilter);

  const unassigned = filteredTasks.filter((t) => !t.assigneeId && t.status !== "completed");
  const assigned = filteredTasks.filter((t) => t.assigneeId && t.status !== "completed");

  return (
    <div className="space-y-4">
      {/* Complexity legend and filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(Object.entries(COMPLEXITY_CONFIG) as [TaskComplexity, typeof COMPLEXITY_CONFIG[TaskComplexity]][]).map(([key, config]) => (
            <div key={key} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border", config.bgColor, config.textColor)}>
              <span className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
              {config.label}
            </div>
          ))}
        </div>
        <Select value={complexityFilter} onValueChange={setComplexityFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="All Complexity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Complexity</SelectItem>
            <SelectItem value="high">High Brainer</SelectItem>
            <SelectItem value="medium">Medium Brainer</SelectItem>
            <SelectItem value="low">Lower Brainer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Unassigned Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unassigned Tasks ({unassigned.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {unassigned.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">All tasks are assigned</p>
            ) : (
              unassigned.map((task) => {
                const suggested = getSuggestedAssignee(task);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    className="border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", COMPLEXITY_CONFIG[task.complexity].color)} />
                        <span className="text-sm font-medium">{task.title}</span>
                      </div>
                      <Badge className={cn("text-[10px]", COMPLEXITY_CONFIG[task.complexity].bgColor, COMPLEXITY_CONFIG[task.complexity].textColor)}>
                        {COMPLEXITY_CONFIG[task.complexity].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4 mb-2">{task.description}</p>
                    <div className="flex items-center justify-between ml-4">
                      <div className="flex gap-1 flex-wrap">
                        {task.requiredSkills.map((s) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{task.estimatedHours}h est.</span>
                    </div>
                    {suggested && (
                      <div className="mt-2 ml-4 flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                        <span className="text-[10px] text-primary">Suggested: {suggested.name} ({Math.round((suggested.hoursThisWeek / suggested.maxHoursPerWeek) * 100)}% loaded)</span>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => onAssignTask(task.id, suggested.id)}>
                          Assign
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Team Members (Drop Targets) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Team Members - Drop to Assign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teamMembers.map((member) => {
              const memberTasks = assigned.filter((t) => t.assigneeId === member.id);
              const util = Math.round((member.hoursThisWeek / member.maxHoursPerWeek) * 100);
              return (
                <div
                  key={member.id}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(member.id)}
                  className="border rounded-lg p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{member.avatar}</div>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-[10px] text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-xs font-semibold", util > 100 ? "text-red-600" : util >= 90 ? "text-amber-600" : "text-green-600")}>{util}%</div>
                      <div className="text-[10px] text-muted-foreground">{member.hoursThisWeek}h/{member.maxHoursPerWeek}h</div>
                    </div>
                  </div>
                  {memberTasks.length > 0 && (
                    <div className="space-y-1 ml-10">
                      {memberTasks.map((task) => (
                        <div key={task.id} className={cn("text-[10px] px-2 py-1 rounded font-medium truncate", COMPLEXITY_CONFIG[task.complexity].bgColor, COMPLEXITY_CONFIG[task.complexity].textColor)}>
                          {task.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skill Matrix View
function SkillMatrixView() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Skills Proficiency Matrix (1-5 Scale)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left font-semibold w-40 sticky left-0 bg-background z-10">Team Member</th>
                {SKILL_NAMES.map((skill) => (
                  <th key={skill} className="p-2 text-center font-semibold">{skill}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skillMatrix.map((entry) => (
                <tr key={entry.memberId} className="border-b hover:bg-muted/30">
                  <td className="p-2 font-medium sticky left-0 bg-background z-10">{entry.memberName}</td>
                  {SKILL_NAMES.map((skill) => {
                    const level = entry.skills[skill] || 0;
                    return (
                      <td key={skill} className="p-1 text-center">
                        <div className={cn(
                          "w-8 h-8 mx-auto rounded-md flex items-center justify-center font-bold",
                          level >= 5 ? "bg-green-500 text-white" :
                          level >= 4 ? "bg-green-200 text-green-800" :
                          level >= 3 ? "bg-yellow-200 text-yellow-800" :
                          level >= 2 ? "bg-orange-200 text-orange-800" :
                          level >= 1 ? "bg-red-200 text-red-800" :
                          "bg-gray-100 text-gray-400"
                        )}>
                          {level}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="flex gap-3 mt-3 pt-3 border-t">
          {[
            { level: 5, label: "Expert", color: "bg-green-500 text-white" },
            { level: 4, label: "Advanced", color: "bg-green-200 text-green-800" },
            { level: 3, label: "Intermediate", color: "bg-yellow-200 text-yellow-800" },
            { level: 2, label: "Basic", color: "bg-orange-200 text-orange-800" },
            { level: 1, label: "Beginner", color: "bg-red-200 text-red-800" },
          ].map((item) => (
            <div key={item.level} className="flex items-center gap-1.5 text-xs">
              <div className={cn("w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold", item.color)}>{item.level}</div>
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Training & Competency (ISO 17025 Clause 6.2)

const AUTHORIZATION_LEVELS = ["Trainee", "Supervised", "Independent", "Trainer"] as const;
type AuthorizationLevel = typeof AUTHORIZATION_LEVELS[number];

const AUTH_LEVEL_COLORS: Record<AuthorizationLevel, string> = {
  Trainee: "bg-red-100 text-red-700",
  Supervised: "bg-amber-100 text-amber-700",
  Independent: "bg-green-100 text-green-700",
  Trainer: "bg-blue-100 text-blue-700",
};

const IEC_STANDARDS = ["IEC 61215", "IEC 61730", "IEC 61853", "IEC 60904", "IEC 62716", "IEC 61701", "IEC 62804"];

interface TrainingRecord {
  id: string;
  memberId: string;
  memberName: string;
  trainingTitle: string;
  standard: string;
  completedDate: string;
  expiryDate: string;
  authLevel: AuthorizationLevel;
  certNumber: string;
}

interface CompetencyEntry {
  memberId: string;
  memberName: string;
  role: string;
  authorizations: Record<string, AuthorizationLevel>;
  trainingRecords: TrainingRecord[];
}

const competencyData: CompetencyEntry[] = teamMembers.map((m, idx) => ({
  memberId: m.id,
  memberName: m.name,
  role: m.role,
  authorizations: Object.fromEntries(
    IEC_STANDARDS.map((std, si) => {
      const levels: AuthorizationLevel[] = ["Trainee", "Supervised", "Independent", "Trainer"];
      const level = levels[Math.min(3, Math.floor((m.skills.length + si + idx) % 4))];
      return [std, level];
    })
  ),
  trainingRecords: [
    {
      id: `TR-${m.id}-001`,
      memberId: m.id,
      memberName: m.name,
      trainingTitle: `${m.qualifiedTests[0] || "General"} Testing Qualification`,
      standard: IEC_STANDARDS[idx % IEC_STANDARDS.length],
      completedDate: "2025-08-15",
      expiryDate: idx % 3 === 0 ? "2026-02-15" : "2027-08-15",
      authLevel: idx % 4 === 0 ? "Trainer" : idx % 3 === 0 ? "Independent" : "Supervised",
      certNumber: `CERT-${String(idx + 1).padStart(4, "0")}`,
    },
    {
      id: `TR-${m.id}-002`,
      memberId: m.id,
      memberName: m.name,
      trainingTitle: "ISO 17025 Awareness",
      standard: "ISO 17025",
      completedDate: "2025-06-01",
      expiryDate: "2026-06-01",
      authLevel: "Independent",
      certNumber: `CERT-ISO-${String(idx + 1).padStart(4, "0")}`,
    },
  ],
}));

const upcomingTraining = [
  { id: "UT-001", title: "IEC 61215:2021 Updates", date: "2026-04-10", instructor: "Dr. Priya Mehta", participants: 6, standard: "IEC 61215" },
  { id: "UT-002", title: "EL Imaging Advanced Techniques", date: "2026-04-22", instructor: "Rajesh Kumar", participants: 4, standard: "IEC 60904" },
  { id: "UT-003", title: "Measurement Uncertainty Workshop", date: "2026-05-05", instructor: "External - NABL", participants: 8, standard: "ISO 17025" },
  { id: "UT-004", title: "Environmental Chamber Operation", date: "2026-05-15", instructor: "Amit Sharma", participants: 5, standard: "IEC 61215" },
];

function TrainingCompetencyTab() {
  const [viewMode, setViewMode] = useState<"matrix" | "records" | "calendar">("matrix");

  const expiringSoon = competencyData
    .flatMap((c) => c.trainingRecords)
    .filter((r) => {
      const expiry = new Date(r.expiryDate);
      const now = new Date("2026-03-22");
      const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 90 && diffDays > 0;
    });

  const expired = competencyData
    .flatMap((c) => c.trainingRecords)
    .filter((r) => new Date(r.expiryDate) < new Date("2026-03-22"));

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Staff</p>
            <p className="text-xl font-bold mt-0.5">{competencyData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fully Qualified</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">
              {competencyData.filter((c) => Object.values(c.authorizations).every((a) => a === "Independent" || a === "Trainer")).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Expiring Soon</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{expiringSoon.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Expired</p>
            <p className="text-xl font-bold text-red-600 mt-0.5">{expired.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        {(["matrix", "records", "calendar"] as const).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setViewMode(mode)}
          >
            {mode === "matrix" ? "Competency Matrix" : mode === "records" ? "Training Records" : "Training Calendar"}
          </Button>
        ))}
      </div>

      {/* Competency Matrix */}
      {viewMode === "matrix" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Staff Competency Matrix — ISO 17025 Clause 6.2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-xs border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-semibold w-40 sticky left-0 bg-background z-10">Staff Member</th>
                    <th className="p-2 text-left font-semibold w-28">Role</th>
                    {IEC_STANDARDS.map((std) => (
                      <th key={std} className="p-2 text-center font-semibold">{std}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competencyData.map((entry) => (
                    <tr key={entry.memberId} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium sticky left-0 bg-background z-10">{entry.memberName}</td>
                      <td className="p-2 text-muted-foreground">{entry.role}</td>
                      {IEC_STANDARDS.map((std) => {
                        const level = entry.authorizations[std] || "Trainee";
                        return (
                          <td key={std} className="p-1 text-center">
                            <span className={cn("inline-block px-2 py-1 rounded text-[10px] font-semibold", AUTH_LEVEL_COLORS[level])}>
                              {level}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="flex gap-3 mt-3 pt-3 border-t">
              {AUTHORIZATION_LEVELS.map((level) => (
                <div key={level} className="flex items-center gap-1.5 text-xs">
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", AUTH_LEVEL_COLORS[level])}>{level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Records */}
      {viewMode === "records" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Training Records with Expiry Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-semibold">Cert #</th>
                    <th className="p-2 text-left font-semibold">Staff Member</th>
                    <th className="p-2 text-left font-semibold">Training</th>
                    <th className="p-2 text-left font-semibold">Standard</th>
                    <th className="p-2 text-center font-semibold">Auth Level</th>
                    <th className="p-2 text-left font-semibold">Completed</th>
                    <th className="p-2 text-left font-semibold">Expiry</th>
                    <th className="p-2 text-center font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {competencyData.flatMap((c) => c.trainingRecords).map((record) => {
                    const expiry = new Date(record.expiryDate);
                    const now = new Date("2026-03-22");
                    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                    const statusText = diffDays < 0 ? "Expired" : diffDays <= 90 ? "Expiring Soon" : "Valid";
                    const statusColor = diffDays < 0 ? "bg-red-100 text-red-700" : diffDays <= 90 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";

                    return (
                      <tr key={record.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-mono text-muted-foreground">{record.certNumber}</td>
                        <td className="p-2 font-medium">{record.memberName}</td>
                        <td className="p-2">{record.trainingTitle}</td>
                        <td className="p-2">{record.standard}</td>
                        <td className="p-2 text-center">
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", AUTH_LEVEL_COLORS[record.authLevel])}>
                            {record.authLevel}
                          </span>
                        </td>
                        <td className="p-2 text-muted-foreground">{record.completedDate}</td>
                        <td className="p-2 text-muted-foreground">{record.expiryDate}</td>
                        <td className="p-2 text-center">
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold", statusColor)}>{statusText}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Calendar */}
      {viewMode === "calendar" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Upcoming Training & Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTraining.map((t) => (
                  <div key={t.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="text-center shrink-0 w-14">
                      <div className="text-lg font-bold text-primary">{new Date(t.date).getDate()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        {new Date(t.date).toLocaleDateString("en-US", { month: "short" })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{t.title}</span>
                        <Badge className="text-[10px] bg-primary/10 text-primary">{t.standard}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Instructor: {t.instructor}</span>
                        <span>{t.participants} participants</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Certifications Alert */}
          {(expiringSoon.length > 0 || expired.length > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-amber-600">Certification Renewal Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expired.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded border border-red-200 bg-red-50 text-xs">
                      <div>
                        <span className="font-medium text-red-800">{r.memberName}</span>
                        <span className="text-red-600 ml-2">— {r.trainingTitle}</span>
                      </div>
                      <Badge className="bg-red-100 text-red-700 text-[10px]">Expired {r.expiryDate}</Badge>
                    </div>
                  ))}
                  {expiringSoon.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded border border-amber-200 bg-amber-50 text-xs">
                      <div>
                        <span className="font-medium text-amber-800">{r.memberName}</span>
                        <span className="text-amber-600 ml-2">— {r.trainingTitle}</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Expires {r.expiryDate}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Utilization Reports
function UtilizationReports({ members, tasks }: { members: TeamMember[]; tasks: ManpowerTask[] }) {
  const weeklyData = members.map((m) => ({
    ...m,
    weekUtil: Math.round((m.hoursThisWeek / m.maxHoursPerWeek) * 100),
    monthUtil: Math.round((m.hoursThisMonth / m.maxHoursPerMonth) * 100),
    taskCount: tasks.filter((t) => t.assigneeId === m.id && t.status !== "completed").length,
    completedCount: tasks.filter((t) => t.assigneeId === m.id && t.status === "completed").length,
  }));

  const highBrainerCount = tasks.filter((t) => t.complexity === "high").length;
  const medBrainerCount = tasks.filter((t) => t.complexity === "medium").length;
  const lowBrainerCount = tasks.filter((t) => t.complexity === "low").length;
  const totalEstHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const totalActualHours = tasks.reduce((s, t) => s + t.actualHours, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Task Distribution by Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {([
                { label: "High Brainer", count: highBrainerCount, total: tasks.length, config: COMPLEXITY_CONFIG.high },
                { label: "Medium Brainer", count: medBrainerCount, total: tasks.length, config: COMPLEXITY_CONFIG.medium },
                { label: "Lower Brainer", count: lowBrainerCount, total: tasks.length, config: COMPLEXITY_CONFIG.low },
              ] as const).map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-3 h-3 rounded-full", item.config.color)} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="text-muted-foreground">{item.count} tasks ({item.total > 0 ? Math.round((item.count / item.total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.config.color)} style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hours Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <p className="text-2xl font-bold text-blue-600">{totalEstHours}h</p>
                <p className="text-xs text-blue-700 mt-1">Estimated Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <p className="text-2xl font-bold text-green-600">{totalActualHours}h</p>
                <p className="text-xs text-green-700 mt-1">Actual Hours</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50">
                <p className="text-2xl font-bold text-amber-600">{totalEstHours - totalActualHours}h</p>
                <p className="text-xs text-amber-700 mt-1">Remaining</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50">
                <p className="text-2xl font-bold text-purple-600">{totalEstHours > 0 ? Math.round((totalActualHours / totalEstHours) * 100) : 0}%</p>
                <p className="text-xs text-purple-700 mt-1">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-member utilization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Individual Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold">Member</th>
                  <th className="p-2 text-left font-semibold">Role</th>
                  <th className="p-2 text-center font-semibold">Weekly Util.</th>
                  <th className="p-2 text-center font-semibold">Monthly Util.</th>
                  <th className="p-2 text-center font-semibold">Active Tasks</th>
                  <th className="p-2 text-center font-semibold">Available Hours</th>
                  <th className="p-2 font-semibold">Weekly Load</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-muted/30">
                    <td className="p-2 font-medium">{m.name}</td>
                    <td className="p-2 text-muted-foreground">{m.role}</td>
                    <td className="p-2 text-center">
                      <span className={cn("font-semibold", m.weekUtil > 100 ? "text-red-600" : m.weekUtil >= 90 ? "text-amber-600" : "text-green-600")}>{m.weekUtil}%</span>
                    </td>
                    <td className="p-2 text-center">{m.monthUtil}%</td>
                    <td className="p-2 text-center">{m.taskCount}</td>
                    <td className="p-2 text-center">{Math.max(0, m.maxHoursPerWeek - m.hoursThisWeek)}h</td>
                    <td className="p-2">
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            m.weekUtil > 100 ? "bg-red-500" : m.weekUtil >= 90 ? "bg-amber-500" : "bg-green-500"
                          )}
                          style={{ width: `${Math.min(m.weekUtil, 100)}%` }}
                        />
                      </div>
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
