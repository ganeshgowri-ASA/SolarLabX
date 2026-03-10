"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ReportTemplate } from "@/components/reports/ReportTemplate";
import { REPORT_TYPES } from "@/lib/constants";

export default function ReportTemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Report Templates</h1>
          <p className="text-muted-foreground mt-1">
            ISO 17025 compliant report templates for various IEC standards
          </p>
        </div>
        <Link href="/reports/generate">
          <Button>Generate Report</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((type) => (
          <Link key={type.id} href={`/reports/generate?type=${type.id}`}>
            <ReportTemplate templateId={type.id} />
          </Link>
        ))}
      </div>
    </div>
  );
}
