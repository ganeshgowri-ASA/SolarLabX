// @ts-nocheck
"use client";

import { useState } from "react";
import { ElectricalSafetyProject, SafetyTest } from "@/lib/types/electrical-safety";
import { electricalSafetyProjects, safetyEquipment } from "@/lib/data/electrical-safety-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SafetyTestWorkflow from "./SafetyTestWorkflow";
import SafetyEquipmentStatus from "./SafetyEquipmentStatus";

const projectStatusColors: Record<string, string> = {
  "Draft": "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Completed": "bg-green-100 text-green-700",
  "On Hold": "bg-amber-100 text-amber-700",
};

const testStatusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Pass: "bg-green-100 text-green-700",
  Fail: "bg-red-100 text-red-700",
  Conditional: "bg-amber-100 text-amber-700",
};

export default function ElectricalSafetyClient() {
  const [selectedProject, setSelectedProject] = useState<ElectricalSafetyProject | null>(null);

  const projects = electricalSafetyProjects;
  const inProgress = projects.filter(p => p.status === "In Progress").length;
  const completed = projects.filter(p => p.status === "Completed").length;
  const totalTests = projects.reduce((s, p) => s + p.tests.length, 0);
  const passedTests = projects.reduce((s, p) => s + p.tests.filter(t => t.status === "Pass").length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Electrical Safety & Protocol</h1>
          <p className="text-sm text-muted-foreground">IEC 61730 electrical safety test management and certification</p>
        </div>
        <Button size="sm">+ New Safety Test</Button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Projects</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">In Progress</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Completed</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">{completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Tests</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{totalTests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tests Passed</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">{passedTests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pass Rate</p>
            <p className="text-xl font-bold text-primary mt-0.5">
              {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Safety Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="workflow">Test Workflow</TabsTrigger>
          <TabsTrigger value="equipment">Equipment Status</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{project.moduleName}</h3>
                        <Badge className={cn("text-[10px]", projectStatusColors[project.status])}>
                          {project.status}
                        </Badge>
                        <Badge className="text-[10px] bg-purple-100 text-purple-700">{project.safetyClass}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {project.standard} | {project.projectName} | Assigned: {project.assignedTo}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.certificateNumber && (
                        <Badge className="text-[10px] bg-green-100 text-green-700">
                          Cert: {project.certificateNumber}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                      >
                        {selectedProject?.id === project.id ? "Close" : "Details"}
                      </Button>
                    </div>
                  </div>

                  {/* Test progress */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {project.tests.filter(t => t.status === "Pass").length} of {project.tests.length} tests passed
                      </span>
                      <span className="font-medium text-foreground">
                        {Math.round((project.tests.filter(t => t.status === "Pass").length / project.tests.length) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(project.tests.filter(t => t.status === "Pass").length / project.tests.length) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Test sequence summary */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {project.tests.map((test) => (
                      <div key={test.id} className="flex items-center gap-1.5">
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2",
                          test.status === "Pass" ? "bg-green-100 border-green-500 text-green-700" :
                          test.status === "Fail" ? "bg-red-100 border-red-500 text-red-700" :
                          test.status === "In Progress" ? "bg-blue-100 border-blue-500 text-blue-700 animate-pulse" :
                          "bg-muted border-muted-foreground/30 text-muted-foreground"
                        )}>
                          {test.sequence}
                        </div>
                        <span className="text-[10px] text-muted-foreground hidden md:inline">{test.type.split(" ").slice(0, 2).join(" ")}</span>
                        {test.sequence < project.tests.length && (
                          <span className="text-muted-foreground/40 mx-0.5">&rarr;</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Expanded details */}
                  {selectedProject?.id === project.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <SafetyTestWorkflow project={project} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflow">
          <div className="space-y-6">
            {projects.filter(p => p.status === "In Progress").map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    {project.moduleName} - {project.standard}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{project.projectName}</p>
                </CardHeader>
                <CardContent>
                  <SafetyTestWorkflow project={project} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment">
          <SafetyEquipmentStatus equipment={safetyEquipment} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
