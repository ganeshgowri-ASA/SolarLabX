"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  equipmentCalendarEvents,
  EQUIPMENT_STATUS_CONFIG,
  EQUIPMENT_CATEGORIES,
} from "@/lib/data/equipment-calendar-data";
import type { EquipmentCalendarEvent, CalendarViewMode, EquipmentCalendarStatus } from "@/lib/types/equipment-calendar";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const start = new Date(baseDate);
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getEventsForDate(events: EquipmentCalendarEvent[], dateStr: string): EquipmentCalendarEvent[] {
  return events.filter((e) => dateStr >= e.startDate && dateStr <= e.endDate);
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8am - 5pm

export default function EquipmentCalendarView() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 19)); // March 19, 2026
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<EquipmentCalendarEvent | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<Set<EquipmentCalendarStatus>>(
    new Set(Object.keys(EQUIPMENT_STATUS_CONFIG) as EquipmentCalendarStatus[])
  );
  const [showHeatmap, setShowHeatmap] = useState(false);

  const filteredEvents = useMemo(() => {
    return equipmentCalendarEvents.filter((e) => {
      if (selectedCategory !== "All" && e.equipmentCategory !== selectedCategory) return false;
      if (!activeStatuses.has(e.status)) return false;
      return true;
    });
  }, [selectedCategory, activeStatuses]);

  const toggleStatus = useCallback((status: EquipmentCalendarStatus) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "month") d.setMonth(d.getMonth() - 1);
      else if (viewMode === "week") d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return d;
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "month") d.setMonth(d.getMonth() + 1);
      else if (viewMode === "week") d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return d;
    });
  }, [viewMode]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date(2026, 2, 19));
  }, []);

  // Conflict detection
  const conflicts = useMemo(() => {
    const conflictList: { equipmentId: string; date: string; events: EquipmentCalendarEvent[] }[] = [];
    const allDates = new Set<string>();
    equipmentCalendarEvents.forEach((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        allDates.add(formatDate(d));
      }
    });
    allDates.forEach((dateStr) => {
      const equipmentMap = new Map<string, EquipmentCalendarEvent[]>();
      equipmentCalendarEvents.forEach((e) => {
        if (dateStr >= e.startDate && dateStr <= e.endDate) {
          const existing = equipmentMap.get(e.equipmentId) || [];
          existing.push(e);
          equipmentMap.set(e.equipmentId, existing);
        }
      });
      equipmentMap.forEach((events, equipmentId) => {
        if (events.length > 1) {
          conflictList.push({ equipmentId, date: dateStr, events });
        }
      });
    });
    return conflictList;
  }, []);

  const todayStr = "2026-03-19";

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigatePrev}>&lt;</Button>
          <Button variant="outline" size="sm" onClick={navigateToday}>Today</Button>
          <Button variant="outline" size="sm" onClick={navigateNext}>&gt;</Button>
          <h3 className="text-lg font-semibold ml-2">
            {viewMode === "day"
              ? currentDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
              : viewMode === "week"
              ? `Week of ${getWeekDates(currentDate)[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - ${getWeekDates(currentDate)[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
              : `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md overflow-hidden">
            {(["month", "week", "day"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  viewMode === mode ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <Button
            variant={showHeatmap ? "default" : "outline"}
            size="sm"
            className="text-xs h-8"
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            Heatmap
          </Button>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(EQUIPMENT_STATUS_CONFIG) as [EquipmentCalendarStatus, typeof EQUIPMENT_STATUS_CONFIG[EquipmentCalendarStatus]][]).map(([status, config]) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all",
              activeStatuses.has(status) ? `${config.bgColor} ${config.textColor} ${config.borderColor}` : "bg-muted/50 text-muted-foreground border-transparent opacity-50"
            )}
          >
            <span className={cn("w-3 h-3 rounded-full", config.color)} />
            {config.label}
          </button>
        ))}
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Double-Booking Conflicts Detected ({conflicts.length})</p>
            <div className="space-y-1">
              {conflicts.slice(0, 3).map((c, i) => (
                <p key={i} className="text-xs text-red-600">
                  {c.events[0].equipmentName} on {c.date}: {c.events.map((e) => e.title).join(" vs ")}
                </p>
              ))}
              {conflicts.length > 3 && <p className="text-xs text-red-500">...and {conflicts.length - 3} more</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Views */}
      {showHeatmap ? (
        <HeatmapView events={filteredEvents} currentDate={currentDate} />
      ) : viewMode === "month" ? (
        <MonthView events={filteredEvents} currentDate={currentDate} todayStr={todayStr} onSelectEvent={setSelectedEvent} />
      ) : viewMode === "week" ? (
        <WeekView events={filteredEvents} currentDate={currentDate} todayStr={todayStr} onSelectEvent={setSelectedEvent} />
      ) : (
        <DayView events={filteredEvents} currentDate={currentDate} todayStr={todayStr} onSelectEvent={setSelectedEvent} />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-background border rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedEvent.equipmentName}</p>
              </div>
              <Badge className={cn("text-xs", EQUIPMENT_STATUS_CONFIG[selectedEvent.status].bgColor, EQUIPMENT_STATUS_CONFIG[selectedEvent.status].textColor)}>
                {EQUIPMENT_STATUS_CONFIG[selectedEvent.status].label}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {selectedEvent.testName && (
                <div><span className="font-medium text-muted-foreground">Test:</span> <span>{selectedEvent.testName}</span></div>
              )}
              {selectedEvent.sampleId && (
                <div><span className="font-medium text-muted-foreground">Sample ID:</span> <span>{selectedEvent.sampleId}</span></div>
              )}
              {selectedEvent.projectName && (
                <div><span className="font-medium text-muted-foreground">Project:</span> <span>{selectedEvent.projectName}</span></div>
              )}
              <div><span className="font-medium text-muted-foreground">Operator:</span> <span>{selectedEvent.operator}</span></div>
              <div><span className="font-medium text-muted-foreground">Start:</span> <span>{selectedEvent.startDate}</span></div>
              <div><span className="font-medium text-muted-foreground">End:</span> <span>{selectedEvent.endDate}</span></div>
              {selectedEvent.projectId && (
                <div><span className="font-medium text-muted-foreground">Project ID:</span> <span>{selectedEvent.projectId}</span></div>
              )}
              <div><span className="font-medium text-muted-foreground">Equipment:</span> <span>{selectedEvent.equipmentId}</span></div>
            </div>
            {selectedEvent.notes && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                <span className="font-medium">Notes:</span> {selectedEvent.notes}
              </div>
            )}
            <Button className="mt-4 w-full" onClick={() => setSelectedEvent(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Month View
function MonthView({
  events,
  currentDate,
  todayStr,
  onSelectEvent,
}: {
  events: EquipmentCalendarEvent[];
  currentDate: Date;
  todayStr: string;
  onSelectEvent: (e: EquipmentCalendarEvent) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card>
      <CardContent className="p-2">
        <div className="grid grid-cols-7 gap-px bg-muted/30">
          {DAY_NAMES.map((d) => (
            <div key={d} className="p-2 text-center text-xs font-semibold text-muted-foreground bg-background">
              {d}
            </div>
          ))}
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[100px] bg-background/50 p-1" />;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = getEventsForDate(events, dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                className={cn(
                  "min-h-[100px] bg-background p-1 border-t",
                  isToday && "ring-2 ring-primary ring-inset"
                )}
              >
                <div className={cn(
                  "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  isToday && "bg-primary text-primary-foreground"
                )}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className={cn(
                        "w-full text-left text-[10px] px-1 py-0.5 rounded truncate block font-medium",
                        EQUIPMENT_STATUS_CONFIG[event.status].bgColor,
                        EQUIPMENT_STATUS_CONFIG[event.status].textColor
                      )}
                      title={`${event.equipmentName}: ${event.title}`}
                    >
                      {event.equipmentName.split(" ").pop()} - {event.title.split(" - ")[0]}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Week View
function WeekView({
  events,
  currentDate,
  todayStr,
  onSelectEvent,
}: {
  events: EquipmentCalendarEvent[];
  currentDate: Date;
  todayStr: string;
  onSelectEvent: (e: EquipmentCalendarEvent) => void;
}) {
  const weekDates = getWeekDates(currentDate);

  return (
    <Card>
      <CardContent className="p-2">
        <div className="grid grid-cols-8 gap-px bg-muted/30">
          {/* Header */}
          <div className="p-2 text-xs font-semibold text-muted-foreground bg-background">Equipment</div>
          {weekDates.map((d) => {
            const dateStr = formatDate(d);
            const isToday = dateStr === todayStr;
            return (
              <div key={dateStr} className={cn("p-2 text-center text-xs font-semibold bg-background", isToday && "bg-primary/10")}>
                <div className="text-muted-foreground">{DAY_NAMES[d.getDay()]}</div>
                <div className={cn("w-7 h-7 flex items-center justify-center rounded-full mx-auto font-bold", isToday && "bg-primary text-primary-foreground")}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
          {/* Equipment rows */}
          {getUniqueEquipment(events).map((eq) => (
            <WeekEquipmentRow key={eq.id} equipmentId={eq.id} equipmentName={eq.name} events={events} weekDates={weekDates} todayStr={todayStr} onSelectEvent={onSelectEvent} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WeekEquipmentRow({
  equipmentId,
  equipmentName,
  events,
  weekDates,
  todayStr,
  onSelectEvent,
}: {
  equipmentId: string;
  equipmentName: string;
  events: EquipmentCalendarEvent[];
  weekDates: Date[];
  todayStr: string;
  onSelectEvent: (e: EquipmentCalendarEvent) => void;
}) {
  const eqEvents = events.filter((e) => e.equipmentId === equipmentId);

  return (
    <>
      <div className="p-2 text-xs font-medium bg-background truncate" title={equipmentName}>
        {equipmentName.replace("Chamber ", "").replace("Tester ", "")}
      </div>
      {weekDates.map((d) => {
        const dateStr = formatDate(d);
        const isToday = dateStr === todayStr;
        const dayEvents = eqEvents.filter((e) => dateStr >= e.startDate && dateStr <= e.endDate);

        return (
          <div key={dateStr} className={cn("min-h-[60px] bg-background p-0.5", isToday && "bg-primary/5")}>
            {dayEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={cn(
                  "w-full text-[10px] px-1 py-1 rounded mb-0.5 text-left truncate font-medium",
                  EQUIPMENT_STATUS_CONFIG[event.status].bgColor,
                  EQUIPMENT_STATUS_CONFIG[event.status].textColor
                )}
                title={event.title}
              >
                {event.title.split(" - ")[0]}
              </button>
            ))}
          </div>
        );
      })}
    </>
  );
}

// Day View
function DayView({
  events,
  currentDate,
  todayStr,
  onSelectEvent,
}: {
  events: EquipmentCalendarEvent[];
  currentDate: Date;
  todayStr: string;
  onSelectEvent: (e: EquipmentCalendarEvent) => void;
}) {
  const dateStr = formatDate(currentDate);
  const dayEvents = getEventsForDate(events, dateStr);
  const isToday = dateStr === todayStr;

  const byEquipment = new Map<string, EquipmentCalendarEvent[]>();
  dayEvents.forEach((e) => {
    const existing = byEquipment.get(e.equipmentId) || [];
    existing.push(e);
    byEquipment.set(e.equipmentId, existing);
  });

  return (
    <Card>
      <CardContent className="p-4">
        {isToday && <Badge className="mb-3 bg-primary/10 text-primary">Today</Badge>}
        {dayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No events scheduled for this day</p>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[200px_1fr] gap-px bg-muted/30">
              <div className="p-2 text-xs font-semibold text-muted-foreground bg-background">Equipment</div>
              <div className="p-2 bg-background">
                <div className="grid grid-cols-10 gap-px">
                  {HOURS.map((h) => (
                    <div key={h} className="text-[10px] text-center text-muted-foreground">{h}:00</div>
                  ))}
                </div>
              </div>
              {Array.from(byEquipment.entries()).map(([eqId, eqEvents]) => (
                <DayEquipmentRow key={eqId} equipmentId={eqId} events={eqEvents} onSelectEvent={onSelectEvent} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DayEquipmentRow({
  equipmentId,
  events,
  onSelectEvent,
}: {
  equipmentId: string;
  events: EquipmentCalendarEvent[];
  onSelectEvent: (e: EquipmentCalendarEvent) => void;
}) {
  return (
    <>
      <div className="p-2 text-xs font-medium bg-background truncate" title={events[0]?.equipmentName}>
        {events[0]?.equipmentName.replace("Chamber ", "").replace("Tester ", "")}
      </div>
      <div className="p-1 bg-background">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onSelectEvent(event)}
            className={cn(
              "w-full text-xs px-2 py-2 rounded mb-1 text-left font-medium flex items-center gap-2",
              EQUIPMENT_STATUS_CONFIG[event.status].bgColor,
              EQUIPMENT_STATUS_CONFIG[event.status].textColor
            )}
          >
            <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", EQUIPMENT_STATUS_CONFIG[event.status].color)} />
            <span className="truncate">{event.title}</span>
            <span className="text-[10px] opacity-70 ml-auto shrink-0">{event.operator}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// Heatmap View
function HeatmapView({
  events,
  currentDate,
}: {
  events: EquipmentCalendarEvent[];
  currentDate: Date;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const uniqueEquipment = getUniqueEquipment(events);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Equipment Utilization Heatmap - {MONTH_NAMES[month]} {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-1 text-left font-medium w-40 sticky left-0 bg-background z-10">Equipment</th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th key={i} className="p-1 text-center min-w-[28px] font-medium">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueEquipment.map((eq) => (
                <tr key={eq.id} className="border-t">
                  <td className="p-1 font-medium truncate max-w-[160px] sticky left-0 bg-background z-10" title={eq.name}>
                    {eq.name.replace("Chamber ", "").replace("Tester ", "")}
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayEvents = events.filter((e) => e.equipmentId === eq.id && dateStr >= e.startDate && dateStr <= e.endDate);
                    const event = dayEvents[0];

                    return (
                      <td key={day} className="p-0.5">
                        <div
                          className={cn(
                            "w-full h-6 rounded-sm",
                            event ? EQUIPMENT_STATUS_CONFIG[event.status].color : "bg-muted/30",
                            event && "opacity-80"
                          )}
                          title={event ? `${event.title} (${EQUIPMENT_STATUS_CONFIG[event.status].label})` : "Available"}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Heatmap Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
          {(Object.entries(EQUIPMENT_STATUS_CONFIG) as [EquipmentCalendarStatus, typeof EQUIPMENT_STATUS_CONFIG[EquipmentCalendarStatus]][]).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1.5 text-xs">
              <span className={cn("w-4 h-3 rounded-sm", config.color)} />
              <span className="text-muted-foreground">{config.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-4 h-3 rounded-sm bg-muted/30" />
            <span className="text-muted-foreground">Available</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getUniqueEquipment(events: EquipmentCalendarEvent[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  events.forEach((e) => map.set(e.equipmentId, e.equipmentName));
  return Array.from(map.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
