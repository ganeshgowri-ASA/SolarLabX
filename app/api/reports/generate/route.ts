import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getTestDefinitions,
  getStandardLabel,
  getStandardTitle,
  type DetailedTestResult,
} from "@/lib/report-test-definitions";

const ALLOWED_REPORT_TYPES = [
  "iec61215", "iec61730", "iec61853", "iec62716", "iec61701", "iec62804", "iec60904",
] as const;

const ALLOWED_SCOPES = ["complete", "selected"] as const;

const ReportRequestSchema = z.object({
  reportType: z.enum(ALLOWED_REPORT_TYPES),
  reportScope: z.enum(ALLOWED_SCOPES).default("complete"),
  selectedTests: z.array(z.string().max(50)).max(50).default([]),
  moduleId: z.string().min(1).max(100).trim(),
  manufacturer: z.string().min(1).max(200).trim(),
  moduleModel: z.string().max(200).trim().default(""),
  serialNumber: z.string().max(100).trim().default(""),
  ratedPower: z.string().max(50).trim().default(""),
  dimensions: z.string().max(100).trim().default(""),
  cellType: z.string().max(100).trim().default(""),
  numberOfCells: z.string().max(20).trim().default(""),
  testRequestNumber: z.string().max(50).trim().default(""),
  additionalNotes: z.string().max(2000).trim().default(""),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = ReportRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      reportType,
      reportScope,
      selectedTests,
      moduleId,
      manufacturer,
      moduleModel,
      serialNumber,
      ratedPower,
      dimensions,
      cellType,
      numberOfCells,
      testRequestNumber,
      additionalNotes,
    } = parsed.data;

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
