"use client";

import { AuditPlan } from "@/lib/types/audit";
import { cn } from "@/lib/utils";

interface AuditCalendarProps {
  audits: AuditPlan[];
  currentMonth?: Date;
}

const statusColors: Record<string, string> = {
  Planned: "bg-blue-200 text-blue-800 border-blue-300",
  "In Progress": "bg-yellow-200 text-yellow-800 border-yellow-300",
  Completed: "bg-green-200 text-green-800 border-green-300",
  Cancelled: "bg-gray-200 text-gray-800 border-gray-300",
};

export default function AuditCalendar({ audits, currentMonth = new Date(2026, 2, 1) }: AuditCalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function getAuditsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return audits.filter((a) => {
      return a.scheduledDate <= dateStr && a.endDate >= dateStr;
    });
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{monthName}</h3>
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dayAudits = day ? getAuditsForDay(day) : [];
          const isToday = day === 9 && month === 2 && year === 2026;
          return (
            <div
              key={i}
              className={cn(
                "bg-white p-1 min-h-[80px]",
                !day && "bg-gray-50"
              )}
            >
              {day && (
                <>
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday && "bg-primary-600 text-white font-bold"
                  )}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayAudits.map((a) => (
                      <div
                        key={a.id}
                        className={cn("rounded px-1 py-0.5 text-[10px] truncate border", statusColors[a.status])}
                        title={a.title}
                      >
                        {a.title.substring(0, 20)}...
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
