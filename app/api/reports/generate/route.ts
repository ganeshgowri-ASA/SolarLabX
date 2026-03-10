import { NextRequest, NextResponse } from "next/server";
import {
  getTestDefinitions,
  getStandardLabel,
  getStandardTitle,
  type DetailedTestResult,
} from "@/lib/report-test-definitions";

/**
 * POST /api/reports/generate
 * Generate an ISO 17025 compliant test report.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reportType,
      reportScope = "complete",
      selectedTests = [],
      moduleId,
      manufacturer,
      moduleModel = "",
      serialNumber = "",
      ratedPower = "",
      dimensions = "",
      cellType = "",
      numberOfCells = "",
      testRequestNumber = "",
      additionalNotes = "",
    } = body;

    if (!reportType || !moduleId || !manufacturer) {
      return NextResponse.json(
        { error: "reportType, moduleId, and manufacturer are required" },
        { status: 400 }
      );
    }

    const allDefs = getTestDefinitions(reportType);
    const defs =
      reportScope === "complete"
        ? allDefs
        : allDefs.filter((d) => selectedTests.includes(d.id));

    if (defs.length === 0) {
      return NextResponse.json(
        { error: "No test definitions found for the selected standard/tests" },
        { status: 400 }
      );
    }

    const reportNumber =
      testRequestNumber ||
      `TR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
    const today = new Date().toISOString().split("T")[0];

    // Generate detailed test results with demo values
    const detailedResults: DetailedTestResult[] = defs.map((def) => {
      const values: Record<string, string> = {};
      def.resultFields.forEach((f) => {
        if (f.defaultValue) {
          values[f.label] = f.defaultValue;
        } else if (f.type === "pass_fail") {
          values[f.label] = "Pass";
        } else if (f.type === "number") {
          values[f.label] = "Pending";
        } else if (f.type === "percentage") {
          values[f.label] = "Pending";
        } else {
          values[f.label] = "Pending";
        }
      });

      return {
        testId: def.id,
        clause: def.clause,
        testName: def.testName,
        result: "pending" as const,
        values,
        observations: "",
        equipmentUsed: def.equipmentUsed,
        testDate: today,
        testedBy: "Lab Technician",
      };
    });

    // Also produce a simplified SampleReport for backward compatibility
    const simpleResults = defs.map((def) => ({
      testName: def.testName,
      clause: def.clause,
      result: "pass" as const,
      value: "Pending",
      limit: def.passCriteria[0] || "",
    }));

    const standard = getStandardLabel(reportType);
    const standardTitle = getStandardTitle(reportType);

    return NextResponse.json({
      report: {
        id: `rpt-${Date.now()}`,
        title: `${standardTitle} - ${manufacturer} ${moduleModel}`.trim(),
        reportNumber,
        reportType,
        standard,
        moduleId,
        manufacturer,
        status: "draft",
        createdAt: today,
        updatedAt: today,
        preparedBy: "Lab Technician",
        reviewedBy: "",
        approvedBy: "",
        testResults: simpleResults,
      },
      detailedReport: {
        reportNumber,
        reportVersion: "1.0",
        standard,
        standardTitle,
        moduleInfo: {
          moduleId,
          manufacturer,
          model: moduleModel,
          serialNumber,
          ratedPower,
          dimensions,
          cellType,
          numberOfCells,
        },
        testResults: detailedResults,
        reportDate: today,
        preparedBy: "Lab Technician",
        reviewedBy: "",
        approvedBy: "",
        additionalNotes,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        reportType,
        reportScope,
        testCount: defs.length,
        totalAvailableTests: allDefs.length,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Internal server error during report generation" },
      { status: 500 }
    );
  }
}
