// @ts-nocheck
import TestReportTemplate from "@/components/reports/TestReportTemplate";

export default function TestReportTemplatePage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          IEC 61215:2021 + IEC 61730:2023 Full Sequential Test Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          TERF (Test Report Format) · IECEE DELPQP Program Structure · All MQT / MST with data tables, pre/post graphs and results
        </p>
      </div>
      <TestReportTemplate />
    </div>
  );
}
