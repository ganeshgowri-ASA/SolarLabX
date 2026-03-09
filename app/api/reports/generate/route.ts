import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reports/generate
 * Generate an ISO 17025 compliant test report.
 *
 * Accepts JSON body with:
 * - reportType: The type of report (iec_61215_qualification, etc.)
 * - moduleId: PV module identifier
 * - manufacturer: Module manufacturer
 * - moduleModel: Module model name
 * - serialNumber: Module serial number
 * - testRequestNumber: Test request reference
 * - additionalNotes: Optional notes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, moduleId, manufacturer, moduleModel, serialNumber, testRequestNumber, additionalNotes } = body;

    if (!reportType || !moduleId || !manufacturer) {
      return NextResponse.json(
        { error: "reportType, moduleId, and manufacturer are required" },
        { status: 400 }
      );
    }

    // Generate report structure based on type
    const report = generateReportStructure({
      reportType,
      moduleId,
      manufacturer,
      moduleModel: moduleModel || "",
      serialNumber: serialNumber || "",
      testRequestNumber: testRequestNumber || "",
      additionalNotes: additionalNotes || "",
    });

    return NextResponse.json({
      report,
      metadata: {
        timestamp: new Date().toISOString(),
        reportType,
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

interface ReportParams {
  reportType: string;
  moduleId: string;
  manufacturer: string;
  moduleModel: string;
  serialNumber: string;
  testRequestNumber: string;
  additionalNotes: string;
}

// Test result templates per report type based on IEC standards
const testResultTemplates: Record<string, { testName: string; clause: string; result: "pass" | "n/a"; value?: string; limit?: string }[]> = {
  iec_61215_qualification: [
    { testName: "Visual Inspection", clause: "MQT 01", result: "pass" },
    { testName: "Maximum Power Determination", clause: "MQT 02", result: "pass", value: "Pending", limit: "Nominal +/-3%" },
    { testName: "Insulation Test", clause: "MQT 03", result: "pass", value: "Pending", limit: ">40 MO" },
    { testName: "Temperature Coefficients", clause: "MQT 04", result: "pass", value: "Pending" },
    { testName: "NMOT Determination", clause: "MQT 05", result: "pass", value: "Pending" },
    { testName: "Performance at STC", clause: "MQT 06", result: "pass", value: "Pending", limit: "Nominal +/-3%" },
    { testName: "Performance at NMOT", clause: "MQT 07", result: "pass", value: "Pending" },
    { testName: "Performance at Low Irradiance", clause: "MQT 08", result: "pass", value: "Pending" },
    { testName: "Outdoor Exposure Test", clause: "MQT 09", result: "pass", value: "Pending", limit: "<5% degradation" },
    { testName: "Hot-spot Endurance Test", clause: "MQT 10", result: "pass" },
    { testName: "UV Preconditioning", clause: "MQT 11.1", result: "pass", value: "15 kWh/m2 UV" },
    { testName: "Thermal Cycling TC200", clause: "MQT 11.2", result: "pass", value: "Pending", limit: "<5% degradation" },
    { testName: "Humidity-Freeze", clause: "MQT 12", result: "pass", value: "Pending", limit: "<5% degradation" },
    { testName: "Damp Heat DH1000", clause: "MQT 13", result: "pass", value: "Pending", limit: "<5% degradation" },
    { testName: "Robustness of Terminations", clause: "MQT 14", result: "pass" },
    { testName: "Wet Leakage Current", clause: "MQT 15", result: "pass", value: "Pending", limit: "<10 uA/m2" },
    { testName: "Mechanical Load", clause: "MQT 16", result: "pass", value: "2400/5400 Pa" },
    { testName: "Hail Test", clause: "MQT 17", result: "pass", value: "25mm @ 23 m/s" },
    { testName: "Bypass Diode Test", clause: "MQT 18", result: "pass" },
  ],
  iec_61730_safety: [
    { testName: "Visual Inspection", clause: "MST 01", result: "pass" },
    { testName: "Accessibility Test", clause: "MST 11", result: "pass" },
    { testName: "Cut Susceptibility", clause: "MST 12", result: "pass" },
    { testName: "Ground Continuity", clause: "MST 13", result: "pass", value: "Pending", limit: "<0.1 O" },
    { testName: "Impulse Voltage", clause: "MST 14", result: "pass" },
    { testName: "Dielectric Withstand", clause: "MST 15", result: "pass" },
    { testName: "Insulation Resistance", clause: "MST 16", result: "pass", value: "Pending", limit: ">40 MO" },
    { testName: "Wet Leakage Current", clause: "MST 17", result: "pass", value: "Pending", limit: "<10 uA/m2" },
    { testName: "Temperature Test", clause: "MST 21", result: "pass" },
    { testName: "Hot-spot Test", clause: "MST 22", result: "pass" },
    { testName: "Reverse Current Overload", clause: "MST 26", result: "pass" },
    { testName: "Module Breakage", clause: "MST 32", result: "pass" },
  ],
  iec_61853_energy: [
    { testName: "Power Rating at STC", clause: "7.1", result: "pass", value: "Pending", limit: "Nominal +/-3%" },
    { testName: "Power at NMOT", clause: "7.2", result: "pass", value: "Pending" },
    { testName: "Power at Low Irradiance", clause: "7.3", result: "pass", value: "Pending" },
    { testName: "Spectral Response", clause: "9", result: "pass" },
    { testName: "Angular Response", clause: "10", result: "pass" },
    { testName: "Temperature Coefficients (alpha)", clause: "11", result: "pass", value: "Pending" },
    { testName: "Temperature Coefficients (beta)", clause: "11", result: "pass", value: "Pending" },
    { testName: "Temperature Coefficients (gamma)", clause: "11", result: "pass", value: "Pending" },
    { testName: "NMOT Determination", clause: "12", result: "pass", value: "Pending" },
    { testName: "Energy Rating (CSER)", clause: "8", result: "pass", value: "Pending" },
  ],
  iec_60904_measurement: [
    { testName: "I-V Characteristics at STC", clause: "60904-1", result: "pass", value: "Pending" },
    { testName: "Reference Device Calibration", clause: "60904-2", result: "pass" },
    { testName: "Spectral Mismatch Correction", clause: "60904-7", result: "pass", value: "Pending" },
    { testName: "Spectral Response Measurement", clause: "60904-8", result: "pass" },
    { testName: "Solar Simulator Classification", clause: "60904-9", result: "pass" },
    { testName: "Linearity Measurement", clause: "60904-10", result: "pass" },
  ],
  custom: [
    { testName: "Custom Test 1", clause: "-", result: "n/a" },
    { testName: "Custom Test 2", clause: "-", result: "n/a" },
  ],
};

const standardMap: Record<string, string> = {
  iec_61215_qualification: "IEC 61215:2021",
  iec_61730_safety: "IEC 61730:2016",
  iec_61853_energy: "IEC 61853:2018",
  iec_60904_measurement: "IEC 60904",
  custom: "Custom",
};

const titleMap: Record<string, string> = {
  iec_61215_qualification: "IEC 61215 Design Qualification Test Report",
  iec_61730_safety: "IEC 61730 Safety Qualification Test Report",
  iec_61853_energy: "IEC 61853 Energy Rating Test Report",
  iec_60904_measurement: "IEC 60904 Measurement Test Report",
  custom: "Custom Test Report",
};

function generateReportStructure(params: ReportParams) {
  const reportNumber = params.testRequestNumber || `TR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  const testResults = testResultTemplates[params.reportType] || testResultTemplates.custom;

  return {
    id: `rpt-${Date.now()}`,
    title: `${titleMap[params.reportType] || "Test Report"} - ${params.manufacturer} ${params.moduleModel}`.trim(),
    reportNumber,
    reportType: params.reportType,
    standard: standardMap[params.reportType] || "Custom",
    moduleId: params.moduleId,
    manufacturer: params.manufacturer,
    status: "draft" as const,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
    preparedBy: "Lab Technician",
    reviewedBy: "",
    approvedBy: "",
    testResults: testResults.map((t) => ({ ...t })),
  };
}
