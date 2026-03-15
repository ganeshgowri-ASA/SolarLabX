// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportWizard, ReportGenerateParams } from "@/components/reports/ReportWizard";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { SignatureBlock } from "@/components/reports/SignatureBlock";
import { IVCurveComparisonChart } from "@/components/reports/IVCurveComparisonChart";
import { PmaxStabilizationChart, PowerDegradationChart, DEFAULT_STABILIZATION_DATA, DEFAULT_DEGRADATION_DATA, DEFAULT_SAMPLE_IDS, DEFAULT_PRE_IV_PARAMS, DEFAULT_POST_IV_PARAMS } from "@/components/reports/ReportSummaryCharts";
import { FileText, FileDown, Table2, Printer } from "lucide-react";
import { toast } from "sonner";
import type { SampleReport } from "@/lib/mock-data";

export default function GenerateReportPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<SampleReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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
      setGeneratedReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      // Show demo report
      const demoReport: SampleReport = {
        id: `rpt-new-${Date.now()}`,
        title: `${params.reportType.replace(/_/g, " ").toUpperCase()} - ${params.manufacturer} ${params.moduleModel || "Module"}`,
        reportNumber: `TR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
        reportType: params.reportType,
        standard: params.reportType.includes("61215") ? "IEC 61215:2021" : params.reportType.includes("61730") ? "IEC 61730:2016" : params.reportType.includes("61853") ? "IEC 61853:2018" : "Custom",
        moduleId: params.moduleId,
        manufacturer: params.manufacturer,
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        preparedBy: "Lab Technician",
        reviewedBy: "",
        approvedBy: "",
        testResults: [
          { testName: "Visual Inspection", clause: "MQT 01", result: "pass" },
          { testName: "Maximum Power Determination", clause: "MQT 02", result: "pass", value: "405.2 W", limit: ">400 W" },
          { testName: "Insulation Test", clause: "MQT 03", result: "pass", value: "4.2 GR", limit: ">40 MR" },
          { testName: "Thermal Cycling TC200", clause: "MQT 11", result: "pass", value: "-2.1%", limit: "<5% degradation" },
          { testName: "Damp Heat DH1000", clause: "MQT 13", result: "pass", value: "-3.2%", limit: "<5% degradation" },
        ],
      };
      setGeneratedReport(demoReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: string) => {
    if (format === "pdf" || format === "print") {
      window.print();
      return;
    }
    toast.success(`${format.toUpperCase()} export initiated`, {
      description: `Your ${format.toUpperCase()} file will be ready shortly.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Test Report</h1>
        <p className="text-muted-foreground mt-1">
          Create an ISO 17025 compliant test report using the step-by-step wizard
        </p>
      </div>

      {!generatedReport && (
        <ReportWizard onGenerate={handleGenerate} isGenerating={isGenerating} />
      )}

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {error} (Showing demo report below)
        </div>
      )}

      {generatedReport && (
        <div className="space-y-6">
          {/* Export Toolbar */}
          <div className="no-print sticky top-0 z-50 flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Generated Report</h2>
              <button
                onClick={() => setGeneratedReport(null)}
                className="text-sm text-primary hover:underline"
              >
                Generate Another
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleExport("pdf")} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
                <FileText className="h-4 w-4" /> PDF
              </button>
              <button onClick={() => handleExport("word")} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
                <FileDown className="h-4 w-4" /> Word
              </button>
              <button onClick={() => handleExport("excel")} className="px-3 py-1.5 text-sm border rounded bg-white hover:bg-gray-100 flex items-center gap-1">
                <Table2 className="h-4 w-4" /> Excel
              </button>
              <button onClick={() => handleExport("print")} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>

          <div ref={reportRef} id="generated-report-content">
            <ReportViewer report={generatedReport} />

            {/* I-V Curve & Summary Charts */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">I-V Curve Comparison & Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <IVCurveComparisonChart
                  preParams={DEFAULT_PRE_IV_PARAMS}
                  postParams={DEFAULT_POST_IV_PARAMS}
                  title="Pre vs Post Test I-V Curve Overlay"
                  height={280}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PmaxStabilizationChart
                    data={DEFAULT_STABILIZATION_DATA}
                    sampleIds={DEFAULT_SAMPLE_IDS}
                    ratedPmax={430}
                    height={220}
                  />
                  <PowerDegradationChart
                    data={DEFAULT_DEGRADATION_DATA}
                    sampleIds={DEFAULT_SAMPLE_IDS}
                    height={220}
                  />
                </div>
              </CardContent>
            </Card>

            <SignatureBlock report={generatedReport} />
          </div>
        </div>
      )}
    </div>
  );
}
