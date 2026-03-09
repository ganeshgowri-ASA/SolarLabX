"use client";

import { Equipment } from "@/lib/types/equipment";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EquipmentRegistryProps {
  equipment: Equipment[];
  selectedCategory: string;
}

const statusColors: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  "In-Use": "bg-blue-100 text-blue-700",
  Maintenance: "bg-amber-100 text-amber-700",
  Calibration: "bg-purple-100 text-purple-700",
};

const calibrationStatusColors: Record<string, string> = {
  Valid: "bg-green-100 text-green-700",
  "Due Soon": "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function EquipmentRegistry({ equipment, selectedCategory }: EquipmentRegistryProps) {
  const filtered = selectedCategory === "All"
    ? equipment
    : equipment.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground mb-2">{filtered.length} equipment items</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((eq) => (
          <Card key={eq.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{eq.name}</h3>
                  <p className="text-xs text-muted-foreground">{eq.manufacturer} {eq.model}</p>
                </div>
                <Badge className={cn("text-[10px] shrink-0 ml-2", statusColors[eq.status])}>
                  {eq.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                <div><span className="font-medium text-foreground">S/N:</span> {eq.serialNumber}</div>
                <div><span className="font-medium text-foreground">Location:</span> {eq.location}</div>
              </div>

              {eq.currentProject && (
                <div className="text-xs bg-muted/50 rounded p-2 mb-3">
                  <span className="font-medium text-foreground">Project:</span> {eq.currentProject}
                  {eq.currentSample && <span className="ml-2 text-muted-foreground">| {eq.currentSample}</span>}
                </div>
              )}

              {/* Calibration */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Calibration</span>
                <Badge className={cn("text-[10px]", calibrationStatusColors[eq.calibration.status])}>
                  {eq.calibration.status}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mb-3">
                Next due: {new Date(eq.calibration.nextDue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{eq.kpis.utilizationRate}%</p>
                  <p className="text-[9px] text-muted-foreground">Utilization</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{eq.kpis.availability}%</p>
                  <p className="text-[9px] text-muted-foreground">Availability</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{eq.kpis.mtbf}h</p>
                  <p className="text-[9px] text-muted-foreground">MTBF</p>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="mt-2">
                <Progress
                  value={eq.kpis.utilizationRate}
                  className={cn(
                    "h-1.5",
                    eq.kpis.utilizationRate >= 90 && "[&>div]:bg-red-500",
                    eq.kpis.utilizationRate >= 70 && eq.kpis.utilizationRate < 90 && "[&>div]:bg-amber-500"
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
