import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SampleReport } from "@/lib/mock-data";

interface ReportViewerProps {
  report: SampleReport;
}

export function ReportViewer({ report }: ReportViewerProps) {
  const statusColors: Record<string, string> = {
    draft: "#6b7280",
    pending_review: "#eab308",
    approved: "#22c55e",
    issued: "#3b82f6",
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center border-b pb-6 mb-6">
            <p className="text-sm text-muted-foreground">CONFIDENTIAL</p>
            <h1 className="text-xl font-bold mt-2">TEST REPORT</h1>
            <p className="text-lg font-medium mt-1">{report.title}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="font-mono text-sm">{report.reportNumber}</span>
              <Badge style={{ backgroundColor: (statusColors[report.status] || "#6b7280") + "20", color: statusColors[report.status] }}>
                {report.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Report Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Standard:</span>
                <span className="ml-2 font-medium">{report.standard}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Module ID:</span>
                <span className="ml-2 font-medium">{report.moduleId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Manufacturer:</span>
                <span className="ml-2 font-medium">{report.manufacturer}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Date Created:</span>
                <span className="ml-2 font-medium">{report.createdAt}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2 font-medium">{report.updatedAt}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Prepared By:</span>
                <span className="ml-2 font-medium">{report.preparedBy}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Test Name</th>
                  <th className="text-left py-3 px-4 font-medium">Clause</th>
                  <th className="text-left py-3 px-4 font-medium">Result</th>
                  <th className="text-left py-3 px-4 font-medium">Value</th>
                  <th className="text-left py-3 px-4 font-medium">Limit/Criteria</th>
                </tr>
              </thead>
              <tbody>
                {report.testResults.map((test, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{test.testName}</td>
                    <td className="py-3 px-4 font-mono text-xs">{test.clause}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={test.result === "pass" ? "default" : test.result === "fail" ? "destructive" : "secondary"}
                      >
                        {test.result.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{test.value || "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{test.limit || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Overall Result: </span>
              <Badge
                variant={report.testResults.every((t) => t.result !== "fail") ? "default" : "destructive"}
                className="ml-1"
              >
                {report.testResults.every((t) => t.result !== "fail") ? "PASS" : "FAIL"}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {report.testResults.filter((t) => t.result === "pass").length}/{report.testResults.length} tests passed
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
