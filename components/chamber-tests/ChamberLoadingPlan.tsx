// @ts-nocheck
"use client";

import { ChamberTest } from "@/lib/types/chamber-tests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChamberLoadingPlanProps {
  tests: ChamberTest[];
}

export default function ChamberLoadingPlan({ tests }: ChamberLoadingPlanProps) {
  const activeTests = tests.filter(t => t.status === "Running" || t.status === "Scheduled");

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Module placement and orientation for each chamber test
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTests.map((test) => (
          <Card key={test.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{test.chamberName} - {test.testName}</CardTitle>
                <Badge className={cn(
                  "text-[10px]",
                  test.status === "Running" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                )}>
                  {test.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{test.projectName}</p>
            </CardHeader>
            <CardContent>
              {/* Chamber visual */}
              <div className="border-2 border-dashed rounded-lg p-3 bg-muted/20">
                <div className="grid grid-cols-2 gap-2">
                  {test.loadingPlan.map((slot) => (
                    <div
                      key={slot.position}
                      className={cn(
                        "border rounded p-2 text-center text-xs",
                        slot.orientation === "Portrait" ? "aspect-[3/4]" : "aspect-[4/3]",
                        "flex flex-col items-center justify-center bg-card"
                      )}
                    >
                      <p className="font-semibold text-foreground text-[11px]">{slot.moduleId}</p>
                      <p className="text-[9px] text-muted-foreground">Pos {slot.position}</p>
                      <Badge className="text-[8px] mt-1 bg-muted text-muted-foreground">
                        {slot.orientation}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    {test.loadingPlan.length} module{test.loadingPlan.length !== 1 ? "s" : ""} loaded
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Test Type:</span>{" "}
                  <span className="font-medium text-foreground">{test.testType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Standard:</span>{" "}
                  <span className="font-medium text-foreground">{test.standard}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Temp Range:</span>{" "}
                  <span className="font-medium text-foreground">{test.parameters.tempMin}°C to {test.parameters.tempMax}°C</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium text-foreground">{test.parameters.totalDuration}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
