// @ts-nocheck
"use client";

import { useState } from "react";
import { Task, KanbanColumn } from "@/lib/types/projects";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const columns: KanbanColumn[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];

const columnColors: Record<KanbanColumn, string> = {
  Backlog: "border-t-gray-400",
  "To Do": "border-t-blue-400",
  "In Progress": "border-t-amber-400",
  Review: "border-t-purple-400",
  Done: "border-t-green-400",
};

const priorityColors: Record<string, string> = {
  P0: "bg-red-100 text-red-800",
  P1: "bg-orange-100 text-orange-800",
  P2: "bg-yellow-100 text-yellow-800",
  P3: "bg-blue-100 text-blue-800",
  P4: "bg-gray-100 text-gray-700",
};

const labelColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-cyan-100 text-cyan-700",
  "bg-amber-100 text-amber-700",
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newColumn: KanbanColumn) => void;
}

export default function KanbanBoard({ tasks, onTaskMove }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const getTasksByColumn = (col: KanbanColumn) =>
    tasks.filter((t) => t.column === col);

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDrop = (col: KanbanColumn) => {
    if (draggedTask && onTaskMove) {
      onTaskMove(draggedTask, col);
    }
    setDraggedTask(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = getTasksByColumn(col);
        return (
          <div
            key={col}
            className={cn("flex-shrink-0 w-72 rounded-lg bg-muted/50 border-t-4", columnColors[col])}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col)}
          >
            <div className="p-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{col}</h3>
              <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
                {colTasks.length}
              </span>
            </div>

            <div className="p-2 space-y-2 min-h-[200px]">
              {colTasks.map((task) => {
                const subtasksDone = task.subtasks?.filter((s) => s.done).length;
                const isExpanded = expandedTask === task.id;

                return (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                    className={cn(
                      "p-3 cursor-pointer hover:shadow-md transition-shadow",
                      draggedTask === task.id && "opacity-50"
                    )}
                  >
                    {/* Labels */}
                    {(task.labels?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.labels?.slice(0, 3).map((label, i) => (
                          <span
                            key={label}
                            className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", labelColors[i % labelColors.length])}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title & Priority */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-xs font-medium text-foreground leading-tight">{task.name}</h4>
                      <Badge className={cn("text-[10px] shrink-0", priorityColors[task.priority])}>
                        {task.priority}
                      </Badge>
                    </div>

                    {/* Subtasks progress */}
                    {(task.subtasks?.length ?? 0) > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {subtasksDone}/{task.subtasks?.length ?? 0}
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(subtasksDone / task.subtasks?.length ?? 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Time tracking */}
                    {task.timeEstimate > 0 && (
                      <div className="text-[10px] text-muted-foreground mb-2">
                        {task.timeSpent}h / {task.timeEstimate}h logged
                      </div>
                    )}

                    {/* Footer: Assignee + Due date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                          {task.assigneeAvatar}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{task.assignee.split(" ")[0]}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(task.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
                        <p className="text-xs text-muted-foreground">{task.description}</p>

                        {(task.subtasks?.length ?? 0) > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-medium text-foreground">Subtasks:</p>
                            {(task.subtasks ?? []).map((st) => (
                              <div key={st.id} className="flex items-center gap-1.5 text-[10px]">
                                <span className={st.done ? "text-green-600" : "text-muted-foreground"}>
                                  {st.done ? "✓" : "○"}
                                </span>
                                <span className={cn(st.done && "line-through text-muted-foreground")}>{st.name}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {(task.comments?.length ?? 0) > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-medium text-foreground">Comments ({task.comments?.length ?? 0}):</p>
                            {task.comments?.slice(-2).map((c) => (
                              <div key={c.id} className="text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5">
                                <span className="font-medium">{c.author.split(" ")[0]}:</span> {c.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
