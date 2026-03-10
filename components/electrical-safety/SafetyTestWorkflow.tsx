"use client";

import { ElectricalSafetyProject, SafetyTest } from "@/lib/types/electrical-safety";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SafetyTestWorkflowProps {
  project: ElectricalSafetyProject;
}

const testStatusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Pass: "bg-green-100 text-green-700",
  Fail: "bg-red-100 text-red-700",
  Conditional: "bg-amber-100 text-amber-700",
};

const testStatusBorder: Record<string, string> = {
  Pending: "border-l-gray-300",
  "In Progress": "border-l-blue-500",
  Pass: "border-l-green-500",
  Fail: "border-l-red-500",
  Conditional: "border-l-amber-500",
};

export default function SafetyTestWorkflow({ project }: SafetyTestWorkflowProps) {
  return (
    <div className="space-y-3">
      {project.tests.map((test) => (
        <Card key={test.id} className={cn("border-l-4", testStatusBorder[test.status])}>
          <CardContent className="p-4">
            {/* Test header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2",
                    test.status === "Pass" ? "bg-green-100 border-green-500 text-green-700" :
                    test.status === "In Progress" ? "bg-blue-100 border-blue-500 text-blue-700" :
                    "bg-muted border-muted-foreground/30 text-muted-foreground"
                  )}>
                    {test.sequence}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">{test.type}</h4>
                  <Badge className={cn("text-[10px]", testStatusColors[test.status])}>
                    {test.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground ml-8">
                  {test.standard} - {test.clause} | Equipment: {test.equipment}
                </p>
              </div>
              <div className="text-right">
                {test.calibrationValid ? (
                  <Badge className="text-[9px] bg-green-100 text-green-700">Cal Valid</Badge>
                ) : (
                  <Badge className="text-[9px] bg-red-100 text-red-700">Cal Invalid</Badge>
                )}
              </div>
            </div>

            {/* Test parameters */}
            <div className="ml-8 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
              {test.parameters.testVoltage !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Test Voltage</p>
                  <p className="font-semibold text-foreground">{test.parameters.testVoltage}V</p>
                </div>
              )}
              {test.parameters.testDuration !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold text-foreground">{test.parameters.testDuration}s</p>
                </div>
              )}
              {test.parameters.leakageLimit !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Leakage Limit</p>
                  <p className="font-semibold text-foreground">{test.parameters.leakageLimit} &mu;A</p>
                </div>
              )}
              {test.parameters.resistanceLimit !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Resistance Limit</p>
                  <p className="font-semibold text-foreground">{test.parameters.resistanceLimit} M&Omega;&middot;m&sup2;</p>
                </div>
              )}
              {test.parameters.impulseVoltage !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Impulse Voltage</p>
                  <p className="font-semibold text-foreground">{test.parameters.impulseVoltage}V</p>
                </div>
              )}
              {test.parameters.impulseCount !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Impulse Count</p>
                  <p className="font-semibold text-foreground">{test.parameters.impulseCount}</p>
                </div>
              )}
              {test.parameters.appliedCurrent !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Applied Current</p>
                  <p className="font-semibold text-foreground">{test.parameters.appliedCurrent}A</p>
                </div>
              )}
              {test.parameters.contactResistanceLimit !== undefined && (
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-muted-foreground">Contact Res. Limit</p>
                  <p className="font-semibold text-foreground">{test.parameters.contactResistanceLimit} &Omega;</p>
                </div>
              )}
            </div>

            {/* Results */}
            {test.results && (
              <div className="ml-8 border rounded-lg p-3 mb-3 bg-muted/20">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Results</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Measured</p>
                    <p className="font-bold text-foreground text-sm">{test.results.measured} {test.results.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Limit</p>
                    <p className="font-semibold text-foreground">{test.results.limit} {test.results.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uncertainty</p>
                    <p className="font-semibold text-foreground">&plusmn;{test.results.uncertainty} {test.results.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Verdict</p>
                    <Badge className={cn("text-[10px]", test.results.passFail === "Pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                      {test.results.passFail}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                  <span>Temp: {test.results.ambientTemp}°C</span>
                  <span>RH: {test.results.ambientHumidity}%</span>
                  <span>{new Date(test.results.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div className="ml-8">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Safety Checklist ({test.checklist.filter(c => c.completed).length}/{test.checklist.length})
              </h5>
              <div className="space-y-1.5">
                {test.checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-xs">
                    <span className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
                      item.completed
                        ? "bg-green-100 border-green-500 text-green-700"
                        : "bg-background border-muted-foreground/30"
                    )}>
                      {item.completed && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    <span className={cn(
                      "flex-1",
                      item.completed ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {item.description}
                      {item.critical && !item.completed && (
                        <Badge className="ml-1 text-[8px] bg-red-100 text-red-700">Critical</Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technician & notes */}
            {(test.technician || test.notes) && (
              <div className="ml-8 mt-3 pt-3 border-t grid grid-cols-2 gap-3 text-xs">
                {test.technician && (
                  <div>
                    <span className="text-muted-foreground">Technician:</span>{" "}
                    <span className="font-medium text-foreground">{test.technician}</span>
                  </div>
                )}
                {test.notes && (
                  <div>
                    <span className="text-muted-foreground">Notes:</span>{" "}
                    <span className="text-foreground">{test.notes}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
