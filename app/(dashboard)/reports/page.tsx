// @ts-nocheck
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sampleReports } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  draft: "#6b7280",
  pending_review: "#eab308",
  approved: "#22c55e",
  issued: "#3b82f6",
};

export default function ReportsDashboard() {
  const approved = sampleReports.filter((r) => r.status === "approved").length;
  const pending = sampleReports.filter((r) => r.status === "pending_review").length;
  const drafts = sampleReports.filter((r) => r.status === "draft").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Reports</h1>
          <p className="text-muted-foreground mt-1">
            Automated ISO 17025 compliant test report generation
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/reports/generate">
            <Button>Generate Report</Button>
          </Link>
          <Link href="/reports/iec-full">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">IEC Full Report</Button>
          </Link>
          <Link href="/reports/templates">
            <Button variant="outline">Templates</Button>
          </Link>
          <Link href="/reports/test-report-template">
            <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950">
              TERF Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reports</CardDescription>
            <CardTitle className="text-3xl">{sampleReports.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl text-gray-600">{drafts}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {sampleReports.map((report) => {
            const passCount = report.testResults.filter((t) => t.result === "pass").length;
            const totalCount = report.testResults.length;
            return (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">{report.reportNumber}</span>
                          <Badge style={{ backgroundColor: (statusColors[report.status] || "#6b7280") + "20", color: statusColors[report.status] }}>
                            {report.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge variant={report.testResults.every((t) => t.result !== "fail") ? "default" : "destructive"}>
                            {report.testResults.every((t) => t.result !== "fail") ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                        <h3 className="font-medium mt-1">{report.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{report.standard}</span>
                          <span>Module: {report.moduleId}</span>
                          <span>{report.manufacturer}</span>
                          <span>{passCount}/{totalCount} passed</span>
                          <span>Updated: {report.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Pending Approvals */}
      {pending > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
          <div className="space-y-3">
            {sampleReports
              .filter((r) => r.status === "pending_review")
              .map((report) => (
                <Link key={report.id} href={`/reports/${report.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm">{report.reportNumber}</span>
                          <h3 className="font-medium">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Prepared by {report.preparedBy} on {report.createdAt}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
