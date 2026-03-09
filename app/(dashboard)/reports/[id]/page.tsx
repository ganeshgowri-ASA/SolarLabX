"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { SignatureBlock } from "@/components/reports/SignatureBlock";
import { PDFGenerator } from "@/components/reports/PDFGenerator";
import { sampleReports } from "@/lib/mock-data";

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

      <ReportViewer report={report} />
      <SignatureBlock report={report} />
    </div>
  );
}
