"use client";

import { SafetyEquipment } from "@/lib/types/electrical-safety";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SafetyEquipmentStatusProps {
  equipment: SafetyEquipment[];
}

const calStatusColors: Record<string, string> = {
  Valid: "bg-green-100 text-green-700",
  "Due Soon": "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

export default function SafetyEquipmentStatus({ equipment }: SafetyEquipmentStatusProps) {
  const valid = equipment.filter(e => e.calibrationStatus === "Valid").length;
  const dueSoon = equipment.filter(e => e.calibrationStatus === "Due Soon").length;
  const overdue = equipment.filter(e => e.calibrationStatus === "Overdue").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{valid}</p>
            <p className="text-[10px] text-muted-foreground">Calibration Valid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{dueSoon}</p>
            <p className="text-[10px] text-muted-foreground">Cal Due Soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{overdue}</p>
            <p className="text-[10px] text-muted-foreground">Cal Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((eq) => (
          <Card key={eq.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{eq.name}</h3>
                  <p className="text-xs text-muted-foreground">{eq.manufacturer} {eq.model}</p>
                </div>
                <Badge className={cn("text-[10px]", calStatusColors[eq.calibrationStatus])}>
                  {eq.calibrationStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                <div><span className="font-medium text-foreground">S/N:</span> {eq.serialNumber}</div>
                <div><span className="font-medium text-foreground">Test Type:</span> {eq.type}</div>
              </div>

              <div className="bg-muted/50 rounded p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Calibrated</span>
                  <span className="font-medium text-foreground">
                    {new Date(eq.calibrationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Due</span>
                  <span className={cn("font-medium", eq.calibrationStatus === "Overdue" ? "text-red-600" : eq.calibrationStatus === "Due Soon" ? "text-amber-600" : "text-foreground")}>
                    {new Date(eq.calibrationDue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate</span>
                  <span className="font-medium text-foreground">{eq.certificateNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
