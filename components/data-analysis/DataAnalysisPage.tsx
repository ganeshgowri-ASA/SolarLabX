"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  FileSearch,
  Upload,
  CheckCircle2,
  FlaskConical,
  LineChart as LineChartIcon,
  Link2,
  FileDown,
  Clock,
  Plus,
} from "lucide-react";
import { RawDataImport } from "./RawDataImport";
import { DataValidation } from "./DataValidation";
import { AnalysisEngine } from "./AnalysisEngine";
import { AnalysisCharts } from "./AnalysisCharts";
import { TraceabilityPanel } from "./TraceabilityPanel";
import { ExportPanel } from "./ExportPanel";
import type { IECStandard } from "@/lib/data/data-analysis-data";
import {
  mockAnalysisReports,
  mockEquipmentRefs,
  mockUncertaintyBudget,
} from "@/lib/data/data-analysis-data";

const standardTabs: { value: IECStandard; label: string; description: string }[] = [
  { value: "IEC 61215", label: "IEC 61215", description: "Design Qualification & Type Approval" },
  { value: "IEC 61730", label: "IEC 61730", description: "Safety Qualification" },
  { value: "IEC 61853", label: "IEC 61853", description: "Energy Rating" },
  { value: "IEC 60891", label: "IEC 60891", description: "I-V Translation Procedures" },
  { value: "IEC 60904", label: "IEC 60904", description: "Reference Device & Measurement" },
];

const subSections = [
  { id: "import", label: "Raw Data Import", icon: Upload },
  { id: "validation", label: "Data Validation", icon: CheckCircle2 },
  { id: "analysis", label: "Analysis Engine", icon: FlaskConical },
  { id: "charts", label: "Charts", icon: LineChartIcon },
  { id: "traceability", label: "Traceability", icon: Link2 },
  { id: "export", label: "Export", icon: FileDown },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  validated: "bg-amber-100 text-amber-700",
  reviewed: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function DataAnalysisPage() {
  const [activeStandard, setActiveStandard] = useState<IECStandard>("IEC 61215");
  const [activeSection, setActiveSection] = useState("import");
  const [showReportList, setShowReportList] = useState(true);

  const filteredReports = mockAnalysisReports.filter((r) => r.standard === activeStandard);
  const sampleReport = mockAnalysisReports[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Analysis</h1>
          <p className="text-muted-foreground">
            IEC standard-based analysis workflows with full traceability per ISO 17025
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowReportList(!showReportList)}>
            <Clock className="mr-2 h-4 w-4" />
            {showReportList ? "Hide" : "Show"} Reports
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> New Analysis
          </Button>
        </div>
      </div>

      {/* Top-Level Standard Tabs */}
      <Tabs value={activeStandard} onValueChange={(v) => setActiveStandard(v as IECStandard)}>
        <TabsList className="grid w-full grid-cols-5">
          {standardTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {standardTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-4">
            {/* Standard Info */}
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{tab.label} Analysis</p>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
                  </Badge>
                  <Select value={activeSection} onValueChange={setActiveSection}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subSections.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Existing Reports List */}
            {showReportList && filteredReports.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileSearch className="h-4 w-4" /> Analysis Reports — {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Sample</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-mono text-sm text-primary">
                            {report.reportNumber}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {report.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {report.sampleName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={statusColors[report.status] || ""}
                            >
                              {report.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-sm">{report.createdBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Sub-Section Navigation */}
            <div className="flex gap-1 border-b pb-0">
              {subSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveSection(section.id)}
                    className="rounded-b-none"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {section.label}
                  </Button>
                );
              })}
            </div>

            {/* Sub-Section Content */}
            <div>
              {activeSection === "import" && (
                <RawDataImport standard={activeStandard} />
              )}
              {activeSection === "validation" && (
                <DataValidation standard={activeStandard} />
              )}
              {activeSection === "analysis" && (
                <AnalysisEngine standard={activeStandard} />
              )}
              {activeSection === "charts" && (
                <AnalysisCharts standard={activeStandard} />
              )}
              {activeSection === "traceability" && (
                <TraceabilityPanel
                  reportNumber={sampleReport.reportNumber}
                  rawDataFileId={sampleReport.rawDataFileId}
                  equipmentUsed={
                    filteredReports[0]?.equipmentUsed || mockEquipmentRefs.slice(0, 3)
                  }
                  uncertaintyBudget={
                    filteredReports[0]?.uncertaintyBudget || mockUncertaintyBudget
                  }
                  auditTrail={
                    filteredReports[0]?.auditTrail || sampleReport.auditTrail
                  }
                />
              )}
              {activeSection === "export" && (
                <ExportPanel
                  standard={activeStandard}
                  existingReportCount={filteredReports.length}
                />
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
