"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReportWizard, type ReportGenerateParams } from "@/components/reports/ReportWizard";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { DetailedTestReport } from "@/components/reports/DetailedTestReport";
import { PDFGenerator } from "@/components/reports/PDFGenerator";
import { PowerMatrix } from "@/components/reports/PowerMatrix";
import { getTestDefinitions, type DetailedTestResult, type TestDefinition } from "@/lib/report-test-definitions";
import type { SampleReport } from "@/lib/mock-data";

interface DetailedReportData {
  reportNumber: string;
  reportVersion: string;
  standard: string;
  standardTitle: string;
  moduleInfo: {
    moduleId: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    ratedPower: string;
    dimensions: string;
    cellType: string;
    numberOfCells: string;
  };
  testResults: DetailedTestResult[];
  reportDate: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
  additionalNotes: string;
}

export default function GenerateReportPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [simpleReport, setSimpleReport] = useState<SampleReport | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedReportData | null>(null);
  const [testDefs, setTestDefs] = useState<TestDefinition[]>([]);
  const [viewMode, setViewMode] = useState<"detailed" | "summary">("detailed");
  const [reportType, setReportType] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (params: ReportGenerateParams) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Report generation failed");
      }

      const data = await response.json();
      setSimpleReport(data.report);
      setDetailedReport(data.detailedReport);
      setReportType(params.reportType);

      const defs = getTestDefinitions(params.reportType);
      const filteredDefs =
        params.reportScope === "complete"
          ? defs
          : defs.filter((d) => params.selectedTests.includes(d.id));
      setTestDefs(filteredDefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      // Fallback demo
      const defs = getTestDefinitions(params.reportType);
      const filteredDefs = params.reportScope === "complete" ? defs : defs.filter((d) => params.selectedTests.includes(d.id));
      setTestDefs(filteredDefs);
      setReportType(params.reportType);

      const today = new Date().toISOString().split("T")[0];
      const rptNum = `TR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;

      const demoResults: DetailedTestResult[] = filteredDefs.map((def) => {
        const values: Record<string, string> = {};
        def.resultFields.forEach((f) => {
          values[f.label] = f.defaultValue || "Pending";
        });
        return {
          testId: def.id,
          clause: def.clause,
          testName: def.testName,
          result: "pass" as const,
          values,
          observations: "",
          equipmentUsed: def.equipmentUsed,
          testDate: today,
          testedBy: "Lab Technician",
        };
      });

      setDetailedReport({
        reportNumber: rptNum,
        reportVersion: "1.0",
        standard: params.reportType.includes("61215") ? "IEC 61215:2021"
          : params.reportType.includes("61730") ? "IEC 61730:2016"
          : params.reportType.includes("61853") ? "IEC 61853:2018"
          : params.reportType.includes("61701") ? "IEC 61701:2020"
          : params.reportType.includes("62716") ? "IEC 62716:2013"
          : "Custom",
        standardTitle: `Test Report - ${params.manufacturer}`,
        moduleInfo: {
          moduleId: params.moduleId,
          manufacturer: params.manufacturer,
          model: params.moduleModel,
          serialNumber: params.serialNumber,
          ratedPower: params.ratedPower,
          dimensions: params.dimensions,
          cellType: params.cellType,
          numberOfCells: params.numberOfCells,
        },
        testResults: demoResults,
        reportDate: today,
        preparedBy: "Lab Technician",
        reviewedBy: "",
        approvedBy: "",
        additionalNotes: params.additionalNotes,
      });

      setSimpleReport({
        id: `rpt-${Date.now()}`,
        title: `Test Report - ${params.manufacturer} ${params.moduleModel || "Module"}`,
        reportNumber: rptNum,
        reportType: params.reportType,
        standard: "Custom",
        moduleId: params.moduleId,
        manufacturer: params.manufacturer,
        status: "draft",
        createdAt: today,
        updatedAt: today,
        preparedBy: "Lab Technician",
        reviewedBy: "",
        approvedBy: "",
        testResults: filteredDefs.map((d) => ({
          testName: d.testName,
          clause: d.clause,
          result: "pass" as const,
          value: "Pending",
          limit: d.passCriteria[0] || "",
        })),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetReport = () => {
    setSimpleReport(null);
    setDetailedReport(null);
    setTestDefs([]);
    setReportType("");
    setError(null);
  };

  const showPowerMatrix = reportType === "iec_61853_energy";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Test Report</h1>
        <p className="text-muted-foreground mt-1">
          Create an ISO 17025 compliant test report using the step-by-step wizard
        </p>
      </div>

      {!detailedReport && (
        <ReportWizard onGenerate={handleGenerate} isGenerating={isGenerating} />
      )}

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {error} (Showing demo report below)
        </div>
      )}

      {detailedReport && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Generated Report</h2>
              <div className="flex bg-muted rounded-md p-0.5 ml-4">
                <button
                  onClick={() => setViewMode("detailed")}
                  className={`px-3 py-1 text-sm rounded ${viewMode === "detailed" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
                >
                  Detailed View
                </button>
                <button
                  onClick={() => setViewMode("summary")}
                  className={`px-3 py-1 text-sm rounded ${viewMode === "summary" ? "bg-background shadow-sm font-medium" : "text-muted-foreground"}`}
                >
                  Summary View
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PDFGenerator
                detailedMode
                reportNumber={detailedReport.reportNumber}
                reportVersion={detailedReport.reportVersion}
                standard={detailedReport.standard}
                standardTitle={detailedReport.standardTitle}
                moduleInfo={detailedReport.moduleInfo}
                testResults={detailedReport.testResults}
                testDefinitions={testDefs}
                reportDate={detailedReport.reportDate}
                preparedBy={detailedReport.preparedBy}
                reviewedBy={detailedReport.reviewedBy}
                approvedBy={detailedReport.approvedBy}
              />
              <Button variant="outline" size="sm" onClick={resetReport}>
                Generate Another
              </Button>
            </div>
          </div>

          {/* Power Matrix for IEC 61853 */}
          {showPowerMatrix && <PowerMatrix nominalPower={400} editable />}

          {/* Report Content */}
          {viewMode === "detailed" ? (
            <DetailedTestReport
              reportNumber={detailedReport.reportNumber}
              reportVersion={detailedReport.reportVersion}
              standard={detailedReport.standard}
              standardTitle={detailedReport.standardTitle}
              moduleInfo={detailedReport.moduleInfo}
              testResults={detailedReport.testResults}
              testDefinitions={testDefs}
              reportDate={detailedReport.reportDate}
              preparedBy={detailedReport.preparedBy}
              reviewedBy={detailedReport.reviewedBy}
              approvedBy={detailedReport.approvedBy}
            />
          ) : (
            simpleReport && (
              <>
                <ReportViewer report={simpleReport} />
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
