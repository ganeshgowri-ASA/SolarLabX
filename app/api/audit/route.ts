import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { auditPlans, auditFindings, carReports, auditMetrics } from "@/lib/data/audit-data";

const AuditPostSchema = z.object({
  action: z.enum(["create-plan", "create-finding", "create-car", "update-finding-status", "update-car-step"]),
  findingId: z.string().max(50).optional(),
  newStatus: z.string().max(50).optional(),
  carId: z.string().max(50).optional(),
  step: z.string().max(100).optional(),
  title: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  standard: z.string().max(100).optional(),
  severity: z.enum(["minor", "major", "critical", "ofi"]).optional(),
  auditor: z.string().max(200).optional(),
  auditee: z.string().max(200).optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

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

  let plans = [...auditPlans];
  if (standard) plans = plans.filter((p) => p.standard === standard);
  if (status) plans = plans.filter((p) => p.status === status);

  return NextResponse.json({ plans, total: plans.length });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const raw = await request.json();
  const parsed = AuditPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const body = parsed.data;

  if (body.action === "create-plan") {
    return NextResponse.json({
      success: true,
      message: "Audit plan created successfully",
      id: `AUD-${new Date().getFullYear()}-${String(auditPlans.length + 1).padStart(3, "0")}`,
    });
  }

  if (body.action === "create-finding") {
    return NextResponse.json({
      success: true,
      message: "Finding recorded successfully",
      id: `FND-${new Date().getFullYear()}-${String(auditFindings.length + 1).padStart(3, "0")}`,
    });
  }

  if (body.action === "create-car") {
    return NextResponse.json({
      success: true,
      message: "CAR/8D report initiated",
      id: `CAR-${new Date().getFullYear()}-${String(carReports.length + 1).padStart(3, "0")}`,
    });
  }

  if (body.action === "update-finding-status") {
    return NextResponse.json({
      success: true,
      message: `Finding status updated`,
    });
  }

  if (body.action === "update-car-step") {
    return NextResponse.json({
      success: true,
      message: `CAR advanced`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
