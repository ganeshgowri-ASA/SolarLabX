import { NextRequest, NextResponse } from "next/server";
import { auditPlans, auditFindings, carReports, auditMetrics } from "@/lib/data/audit-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const standard = searchParams.get("standard");
  const status = searchParams.get("status");

  if (type === "findings") {
    let findings = [...auditFindings];
    const severity = searchParams.get("severity");
    const findingStatus = searchParams.get("status");
    if (severity) findings = findings.filter((f) => f.severity === severity);
    if (findingStatus) findings = findings.filter((f) => f.status === findingStatus);
    return NextResponse.json({ findings, total: findings.length });
  }

  if (type === "car") {
    return NextResponse.json({ carReports });
  }

  if (type === "metrics") {
    return NextResponse.json({ metrics: auditMetrics });
  }

  // Default: audit plans
  let plans = [...auditPlans];
  if (standard) plans = plans.filter((p) => p.standard === standard);
  if (status) plans = plans.filter((p) => p.status === status);

  return NextResponse.json({ plans, total: plans.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === "create-plan") {
    // In production, this would save to database via Prisma
    return NextResponse.json({
      success: true,
      message: "Audit plan created successfully",
      id: `AUD-${new Date().getFullYear()}-${String(auditPlans.length + 1).padStart(3, "0")}`,
    });
  }

  if (action === "create-finding") {
    return NextResponse.json({
      success: true,
      message: "Finding recorded successfully",
      id: `FND-${new Date().getFullYear()}-${String(auditFindings.length + 1).padStart(3, "0")}`,
    });
  }

  if (action === "create-car") {
    return NextResponse.json({
      success: true,
      message: "CAR/8D report initiated",
      id: `CAR-${new Date().getFullYear()}-${String(carReports.length + 1).padStart(3, "0")}`,
    });
  }

  if (action === "update-finding-status") {
    const { findingId, newStatus } = body;
    return NextResponse.json({
      success: true,
      message: `Finding ${findingId} status updated to ${newStatus}`,
    });
  }

  if (action === "update-car-step") {
    const { carId, step } = body;
    return NextResponse.json({
      success: true,
      message: `CAR ${carId} advanced to ${step}`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
