"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { SignatureBlock } from "@/components/reports/SignatureBlock";
import { PDFGenerator } from "@/components/reports/PDFGenerator";
import { DetailedTestReport } from "@/components/reports/DetailedTestReport";
import { sampleReports } from "@/lib/mock-data";
import { getTestDefinitions, type DetailedTestResult } from "@/lib/report-test-definitions";

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const report = sampleReports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Report Not Found</h1>
        <p className="text-muted-foreground mt-2">The report with ID &quot;{id}&quot; was not found.</p>
        <Link href="/reports">
          <Button className="mt-4">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  // Build detailed test results from the sample report data
  const testDefs = getTestDefinitions(report.reportType);
  const detailedResults: DetailedTestResult[] = report.testResults.map((tr) => {
    const def = testDefs.find((d) => d.clause.includes(tr.clause) || d.testName === tr.testName);
    return {
      testId: def?.id || tr.clause,
      clause: tr.clause,
      testName: tr.testName,
      result: tr.result,
      values: tr.value ? { [def?.resultFields[0]?.label || "Value"]: tr.value } : {},
      observations: "",
      equipmentUsed: def?.equipmentUsed || [],
      testDate: report.createdAt,
      testedBy: report.preparedBy,
    };
  });

  const standardLabel = report.standard;
  const hasDetailedDefs = testDefs.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Report Details</h1>
          <p className="text-muted-foreground mt-1">{report.reportNumber}</p>
        </div>
        <div className="flex gap-3">
          <PDFGenerator report={report} />
          <Link href="/reports">
            <Button variant="outline">Back to Reports</Button>
          </Link>
        </div>
      </div>

      {hasDetailedDefs ? (
        <DetailedTestReport
          reportNumber={report.reportNumber}
          reportVersion="1.0"
          standard={standardLabel}
          standardTitle={report.title}
          moduleInfo={{
            moduleId: report.moduleId,
            manufacturer: report.manufacturer,
            model: "",
            serialNumber: "",
            ratedPower: "",
            dimensions: "",
            cellType: "",
            numberOfCells: "",
          }}
          testResults={detailedResults}
          testDefinitions={testDefs}
          reportDate={report.createdAt}
          preparedBy={report.preparedBy}
          reviewedBy={report.reviewedBy}
          approvedBy={report.approvedBy}
        />
      ) : (
        <>
          <ReportViewer report={report} />
          <SignatureBlock report={report} />
        </>
      )}
    </div>
  );
}
