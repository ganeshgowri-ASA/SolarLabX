// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TestDefinition, DetailedTestResult, LabDetails } from "@/lib/report-test-definitions";
import { DEFAULT_LAB_DETAILS } from "@/lib/report-test-definitions";

interface DetailedTestReportProps {
  labDetails?: LabDetails;
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
  testDefinitions: TestDefinition[];
  reportDate: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
}

export function DetailedTestReport({
  labDetails = DEFAULT_LAB_DETAILS,
  reportNumber,
  reportVersion,
  standard,
  standardTitle,
  moduleInfo,
  testResults,
  testDefinitions,
  reportDate,
  preparedBy,
  reviewedBy,
  approvedBy,
}: DetailedTestReportProps) {
  const passCount = testResults.filter((t) => t.result === "pass").length;
  const failCount = testResults.filter((t) => t.result === "fail").length;
  const totalTests = testResults.filter((t) => t.result !== "n/a").length;
  const overallPass = failCount === 0 && passCount > 0;

  return (
    <div className="space-y-6 print:space-y-4" id="detailed-report">
      {/* Lab Header */}
      <Card className="print:shadow-none print:border-2 print:border-black">
        <CardContent className="p-6 print:p-4">
          <div className="text-center border-b-2 border-primary pb-4 mb-4">
            <p className="text-xs tracking-widest text-muted-foreground">CONFIDENTIAL</p>
            <h1 className="text-xl font-bold mt-1">{labDetails.labName}</h1>
            <p className="text-sm text-muted-foreground">{labDetails.address}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Accreditation: {labDetails.accreditationNumber} | {labDetails.accreditationBody}
            </p>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-lg font-bold uppercase">TEST REPORT</h2>
            <p className="text-base font-semibold">{standardTitle}</p>
            <p className="text-sm text-muted-foreground">As per {standard}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Report Number</span>
              <span className="font-mono font-medium">{reportNumber}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Version</span>
              <span className="font-medium">{reportVersion}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Date of Issue</span>
              <span className="font-medium">{reportDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Overall Result</span>
              <Badge variant={overallPass ? "default" : "destructive"} className="mt-0.5">
                {overallPass ? "PASS" : failCount > 0 ? "FAIL" : "PENDING"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Under Test */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">1. Module Under Test (MUT)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-muted-foreground block text-xs">Module ID</span><span className="font-medium">{moduleInfo.moduleId}</span></div>
            <div><span className="text-muted-foreground block text-xs">Manufacturer</span><span className="font-medium">{moduleInfo.manufacturer}</span></div>
            <div><span className="text-muted-foreground block text-xs">Model</span><span className="font-medium">{moduleInfo.model || "—"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Serial Number</span><span className="font-medium">{moduleInfo.serialNumber || "—"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Rated Power</span><span className="font-medium">{moduleInfo.ratedPower || "—"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Dimensions</span><span className="font-medium">{moduleInfo.dimensions || "—"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Cell Type</span><span className="font-medium">{moduleInfo.cellType || "—"}</span></div>
            <div><span className="text-muted-foreground block text-xs">Number of Cells</span><span className="font-medium">{moduleInfo.numberOfCells || "—"}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">2. Test Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-2 px-3 text-left font-medium w-8">#</th>
                  <th className="py-2 px-3 text-left font-medium">Test Name</th>
                  <th className="py-2 px-3 text-left font-medium w-28">Clause</th>
                  <th className="py-2 px-3 text-left font-medium w-20">Result</th>
                  <th className="py-2 px-3 text-left font-medium">Key Value</th>
                  <th className="py-2 px-3 text-left font-medium w-28">Test Date</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((tr, i) => {
                  const keyValue = Object.entries(tr.values).find(([, v]) => v)?.[1] || "—";
                  return (
                    <tr key={tr.testId} className="border-b last:border-0">
                      <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-2 px-3 font-medium">{tr.testName}</td>
                      <td className="py-2 px-3 font-mono text-xs">{tr.clause}</td>
                      <td className="py-2 px-3">
                        <Badge variant={tr.result === "pass" ? "default" : tr.result === "fail" ? "destructive" : "secondary"}>
                          {tr.result.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">{keyValue}</td>
                      <td className="py-2 px-3 text-muted-foreground">{tr.testDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 pt-3 border-t flex justify-between text-sm">
            <span className="text-muted-foreground">
              {passCount} passed, {failCount} failed, {testResults.length - totalTests} N/A — {totalTests} total tests
            </span>
            <Badge variant={overallPass ? "default" : "destructive"}>
              OVERALL: {overallPass ? "PASS" : failCount > 0 ? "FAIL" : "PENDING"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Individual Test Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">3. Detailed Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {testResults.map((tr, idx) => {
            const def = testDefinitions.find((d) => d.id === tr.testId);
            if (!def) return null;
            return (
              <div key={tr.testId} className="border rounded-lg p-4 print:break-inside-avoid">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">
                    {idx + 1}. {def.testName}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">({def.clause})</span>
                  </h4>
                  <Badge variant={tr.result === "pass" ? "default" : tr.result === "fail" ? "destructive" : "secondary"}>
                    {tr.result.toUpperCase()}
                  </Badge>
                </div>

                {/* Purpose */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Purpose</p>
                  <p className="text-sm">{def.purpose}</p>
                </div>

                {/* Test Conditions */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Test Conditions</p>
                  <ul className="text-sm space-y-0.5">
                    {def.testConditions.map((c, i) => (
                      <li key={i} className="flex gap-2"><span className="text-muted-foreground">-</span>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Equipment */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Equipment Used</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(tr.equipmentUsed.length > 0 ? tr.equipmentUsed : def.equipmentUsed).map((eq, i) => (
                      <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{eq}</span>
                    ))}
                  </div>
                </div>

                {/* Measurements */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Measurements</p>
                  <ul className="text-sm space-y-0.5">
                    {def.measurements.map((m, i) => (
                      <li key={i} className="flex gap-2"><span className="text-muted-foreground">-</span>{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Results Table */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Results</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="py-1.5 px-3 text-left font-medium border-r">Parameter</th>
                          <th className="py-1.5 px-3 text-left font-medium border-r">Value</th>
                          <th className="py-1.5 px-3 text-left font-medium">Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {def.resultFields.map((field) => (
                          <tr key={field.label} className="border-t">
                            <td className="py-1.5 px-3 border-r">{field.label}</td>
                            <td className="py-1.5 px-3 font-medium border-r">
                              {tr.values[field.label] || field.defaultValue || "—"}
                            </td>
                            <td className="py-1.5 px-3 text-muted-foreground">{field.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pass/Fail Criteria */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Pass/Fail Criteria</p>
                  <ul className="text-sm space-y-0.5">
                    {def.passCriteria.map((c, i) => (
                      <li key={i} className="flex gap-2">
                        <span className={tr.result === "pass" ? "text-green-600" : tr.result === "fail" ? "text-red-600" : "text-muted-foreground"}>
                          {tr.result === "pass" ? "✓" : tr.result === "fail" ? "✗" : "○"}
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Observations */}
                {tr.observations && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Observations</p>
                    <p className="text-sm bg-muted/30 p-2 rounded">{tr.observations}</p>
                  </div>
                )}

                {/* Tested by */}
                <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                  <span>Tested by: {tr.testedBy || "—"}</span>
                  <span>Date: {tr.testDate || "—"}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card className="print:break-before-page">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">4. Authorization & Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Prepared By", name: preparedBy, role: "Lab Technician", date: reportDate },
              { label: "Reviewed By", name: reviewedBy, role: "Lab Manager", date: reviewedBy ? reportDate : "" },
              { label: "Approved By", name: approvedBy, role: "Lab Director", date: approvedBy ? reportDate : "" },
            ].map((sig) => (
              <div key={sig.label} className="text-center space-y-3">
                <div className="border-b-2 border-dashed pb-8 min-h-[60px] flex items-end justify-center">
                  {sig.name && <span className="italic text-sm text-muted-foreground">{sig.name}</span>}
                </div>
                <div>
                  <p className="font-medium text-sm">{sig.label}</p>
                  <p className="text-xs text-muted-foreground">{sig.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">Date: {sig.date || "________"}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground text-center space-y-1">
            <p>This report shall not be reproduced except in full, without written permission of the laboratory.</p>
            <p>ISO/IEC 17025:2017 Compliant Test Report | {labDetails.labName}</p>
            <p>Report version: {reportVersion} | {reportNumber}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
