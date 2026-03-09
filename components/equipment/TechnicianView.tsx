"use client";

import { Technician } from "@/lib/types/equipment";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TechnicianViewProps {
  technicians: Technician[];
}

const availColors: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  Busy: "bg-blue-100 text-blue-700",
  "On Leave": "bg-gray-100 text-gray-600",
};

export default function TechnicianView({ technicians }: TechnicianViewProps) {
  const available = technicians.filter((t) => t.availability === "Available").length;
  const busy = technicians.filter((t) => t.availability === "Busy").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Manpower - Skills Matrix & Availability</CardTitle>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{available} available</span>
            <span>{busy} busy</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {technicians.map((tech) => {
            const utilization = Math.round((tech.hoursThisWeek / tech.maxHoursPerWeek) * 100);
            return (
              <div key={tech.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {tech.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{tech.name}</span>
                      <span className="text-xs text-muted-foreground">{tech.role}</span>
                    </div>
                    <Badge className={cn("text-[10px]", availColors[tech.availability])}>
                      {tech.availability}
                    </Badge>
                  </div>

                  {tech.currentTask && (
                    <p className="text-[10px] text-muted-foreground mb-1">
                      Current: {tech.currentTask}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-1.5">
                    <Progress
                      value={utilization}
                      className={cn(
                        "h-1.5 flex-1",
                        utilization > 100 && "[&>div]:bg-red-500",
                        utilization >= 90 && utilization <= 100 && "[&>div]:bg-amber-500"
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground w-20 text-right">
                      {tech.hoursThisWeek}h / {tech.maxHoursPerWeek}h
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {tech.skills.map((skill) => (
                      <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {tech.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tech.certifications.map((cert) => (
                        <span key={cert} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                          {cert}
                        </span>
                      ))}
                    </div>
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
