"use client";

import { TeamMember } from "@/lib/types/projects";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResourceViewProps {
  teamMembers: TeamMember[];
}

export default function ResourceView({ teamMembers }: ResourceViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Team Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const utilization = Math.round((member.hoursLogged / member.hoursCapacity) * 100);
              return (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-foreground">{member.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{member.role}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.tasksAssigned} tasks | {member.hoursLogged}h / {member.hoursCapacity}h
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={utilization}
                        className={cn(
                          "h-2 flex-1",
                          utilization >= 90 && "[&>div]:bg-red-500",
                          utilization >= 70 && utilization < 90 && "[&>div]:bg-amber-500"
                        )}
                      />
                      <span className={cn(
                        "text-xs font-medium w-10 text-right",
                        utilization >= 90 ? "text-red-600" :
                        utilization >= 70 ? "text-amber-600" :
                        "text-green-600"
                      )}>
                        {utilization}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {member.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
