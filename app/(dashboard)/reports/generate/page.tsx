"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportWizard, ReportGenerateParams } from "@/components/reports/ReportWizard";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { SignatureBlock } from "@/components/reports/SignatureBlock";
import type { SampleReport } from "@/lib/mock-data";

export default function GenerateReportPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<SampleReport | null>(null);
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generated Report</h2>
            <button
              onClick={() => setGeneratedReport(null)}
              className="text-sm text-primary hover:underline"
            >
              Generate Another Report
            </button>
          </div>
          <ReportViewer report={generatedReport} />
          <SignatureBlock report={generatedReport} />
        </div>
      )}
    </div>
  );
}
