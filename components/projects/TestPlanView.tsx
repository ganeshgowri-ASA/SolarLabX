"use client";

import { useState } from "react";
import { testPlans, testPlanTemplates, testSequences } from "@/lib/data/iec-guidelines-data";
import { TestPlan, TestPlanSequence, TestSequenceGroup } from "@/lib/types/iec-guidelines";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Approved: "bg-blue-100 text-blue-700",
  "In Progress": "bg-green-100 text-green-700",
  Completed: "bg-purple-100 text-purple-700",
  Pending: "bg-gray-100 text-gray-700",
  Failed: "bg-red-100 text-red-700",
};

const groupColors: Record<TestSequenceGroup, string> = {
  A: "bg-blue-100 text-blue-700",
  B: "bg-purple-100 text-purple-700",
  C: "bg-orange-100 text-orange-700",
  D: "bg-emerald-100 text-emerald-700",
  E: "bg-red-100 text-red-700",
};

function getSequenceProgress(seq: TestPlanSequence): number {
  if (seq.tests.length === 0) return 0;
  const completed = seq.tests.filter((t) => t.status === "Completed").length;
  return Math.round((completed / seq.tests.length) * 100);
}

function getPlanProgress(plan: TestPlan): number {
  const allTests = plan.sequences.flatMap((s) => s.tests);
  if (allTests.length === 0) return 0;
  const completed = allTests.filter((t) => t.status === "Completed").length;
  return Math.round((completed / allTests.length) * 100);
}

export default function TestPlanView() {
  const [selectedPlan, setSelectedPlan] = useState<TestPlan | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const activePlans = testPlans.filter((p) => p.status === "In Progress");
  const totalTests = testPlans.reduce((sum, p) => sum + p.sequences.reduce((s, seq) => s + seq.tests.length, 0), 0);
  const completedTests = testPlans.reduce(
    (sum, p) => sum + p.sequences.reduce((s, seq) => s + seq.tests.filter((t) => t.status === "Completed").length, 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Test Plans</p>
            <p className="text-2xl font-bold text-primary mt-1">{testPlans.length}</p>
            <p className="text-xs text-muted-foreground">{activePlans.length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Tests</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalTests}</p>
            <p className="text-xs text-muted-foreground">{completedTests} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Completion</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0}%</p>
            <p className="text-xs text-muted-foreground">overall progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Templates</p>
            <p className="text-2xl font-bold text-foreground mt-1">{testPlanTemplates.length}</p>
            <p className="text-xs text-muted-foreground">available</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => toast.info("New test plan wizard coming soon")}>
          + New Test Plan
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
          {showTemplates ? "Hide Templates" : "View Templates"}
        </Button>
      </div>

      {/* Templates */}
      {showTemplates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testPlanTemplates.map((tpl) => (
            <Card key={tpl.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{tpl.name}</CardTitle>
                <Badge variant="outline" className="text-[10px] w-fit">{tpl.standard}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{tpl.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tpl.moduleTypes.map((mt) => (
                    <Badge key={mt} variant="secondary" className="text-[10px]">{mt}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{tpl.estimatedDuration}</span>
                  <span>{tpl.sampleCount} samples</span>
                  <span>{tpl.sequenceCount} sequences</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => toast.success(`Template "${tpl.name}" applied to new test plan`)}>
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test Plans List */}
      {testPlans.map((plan) => {
        const progress = getPlanProgress(plan);
        return (
          <Card key={plan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{plan.name}</CardTitle>
                  <Badge className={cn(statusStyles[plan.status], "text-[10px]")}>{plan.status}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setSelectedPlan(plan); setDetailOpen(true); }}>
                  Details
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Standard: {plan.standard}</span>
                <span>Module: {plan.moduleType}</span>
                <span>Samples: {plan.sampleCount}</span>
                <span>Duration: {plan.totalDuration}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.sequences.map((seq) => {
                  const seqProgress = getSequenceProgress(seq);
                  return (
                    <div key={seq.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(groupColors[seq.sequenceGroup], "text-[10px]")}>{seq.sequenceGroup}</Badge>
                          <span className="text-sm font-medium">{seq.sequenceName}</span>
                          <Badge className={cn(statusStyles[seq.status], "text-[10px]")}>{seq.status}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {seq.startDate} to {seq.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={seqProgress} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-muted-foreground">{seqProgress}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Assigned: {seq.assignedTo}</span>
                        <span>{seq.tests.length} tests</span>
                        <span>{seq.tests.filter((t) => t.status === "Completed").length} completed</span>
                        {seq.dependencies.length > 0 && (
                          <span>Depends on: {seq.dependencies.join(", ")}</span>
                        )}
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead className="w-[80px]">Code</TableHead>
                            <TableHead>Test</TableHead>
                            <TableHead className="w-[80px]">Duration</TableHead>
                            <TableHead className="w-[140px]">Equipment</TableHead>
                            <TableHead className="w-[120px]">Assigned To</TableHead>
                            <TableHead className="w-[90px]">Status</TableHead>
                            <TableHead className="w-[120px]">Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {seq.tests.map((test) => (
                            <TableRow key={test.id}>
                              <TableCell className="text-center">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                                  {test.order}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-[10px]">{test.mqtCode}</TableCell>
                              <TableCell className="text-xs">{test.name}</TableCell>
                              <TableCell className="text-xs">{test.duration}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{test.equipment}</TableCell>
                              <TableCell className="text-xs">{test.assignedTo}</TableCell>
                              <TableCell>
                                <Badge className={cn(statusStyles[test.status], "text-[10px]")}>{test.status}</Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                {test.result ? (
                                  <span className={test.result.includes("Pass") || test.result.includes("No defects") ? "text-green-600" : "text-foreground"}>
                                    {test.result}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Plan Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Test plan details and approval workflow
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Standard</p>
                  <p className="text-sm font-medium">{selectedPlan.standard}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Module Type</p>
                  <p className="text-sm">{selectedPlan.moduleType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={cn(statusStyles[selectedPlan.status], "mt-1")}>{selectedPlan.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sample Count</p>
                  <p className="text-sm">{selectedPlan.sampleCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="text-sm">{selectedPlan.createdBy} ({selectedPlan.createdDate})</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Approved By</p>
                  <p className="text-sm">{selectedPlan.approvedBy ? `${selectedPlan.approvedBy} (${selectedPlan.approvedDate})` : "Pending approval"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedPlan.notes}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Sequences ({selectedPlan.sequences.length})</p>
                {selectedPlan.sequences.map((seq) => (
                  <div key={seq.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge className={cn(groupColors[seq.sequenceGroup], "text-[10px]")}>{seq.sequenceGroup}</Badge>
                      <span className="text-sm">{seq.sequenceName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{seq.tests.length} tests</span>
                      <Badge className={cn(statusStyles[seq.status], "text-[10px]")}>{seq.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              {selectedPlan.status === "Draft" && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); toast.info("Edit mode coming soon"); }}>
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => { setDetailOpen(false); toast.success("Test plan submitted for approval"); }}>
                    Submit for Approval
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
