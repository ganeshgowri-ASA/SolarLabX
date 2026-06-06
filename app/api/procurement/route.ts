import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api-auth";
import { rfqs, vendors, purchaseOrders, tbeMatrix, procurementMetrics } from "@/lib/data/procurement-data";

const ProcurementPostSchema = z.object({
  action: z.enum(["create-rfq", "create-po", "evaluate-vendor", "approve-po", "update-fat-sat", "submit-tbe"]),
  vendorId: z.string().max(100).optional(),
  poId: z.string().max(100).optional(),
  rfqId: z.string().max(100).optional(),
  approvedBy: z.string().max(200).optional(),
  newStatus: z.string().max(100).optional(),
  scores: z.record(z.number()).optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (type === "rfq") {
    if (id) {
      const rfq = rfqs.find((r) => r.id === id);
      if (!rfq) return NextResponse.json({ error: "RFQ not found" }, { status: 404 });
      const relatedTBE = tbeMatrix.rfqId === id ? tbeMatrix : null;
      return NextResponse.json({ rfq, tbe: relatedTBE });
    }
    return NextResponse.json({ rfqs, total: rfqs.length });
  }

  if (type === "vendors") {
    if (id) {
      const vendor = vendors.find((v) => v.id === id);
      if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      return NextResponse.json({ vendor });
    }
    const status = searchParams.get("status");
    let filtered = [...vendors];
    if (status) filtered = filtered.filter((v) => v.status === status);
    return NextResponse.json({ vendors: filtered, total: filtered.length });
  }

  if (type === "po") {
    if (id) {
      const po = purchaseOrders.find((p) => p.id === id);
      if (!po) return NextResponse.json({ error: "PO not found" }, { status: 404 });
      return NextResponse.json({ po });
    }
    const status = searchParams.get("status");
    let filtered = [...purchaseOrders];
    if (status) filtered = filtered.filter((p) => p.status === status);
    return NextResponse.json({ purchaseOrders: filtered, total: filtered.length });
  }

  if (type === "metrics") {
    return NextResponse.json({ metrics: procurementMetrics });
  }

  return NextResponse.json({
    summary: {
      openPOs: purchaseOrders.filter((po) => !["Closed", "Delivered"].includes(po.status)).length,
      pendingRFQs: rfqs.filter((r) => ["Draft", "Issued"].includes(r.status)).length,
      activeVendors: vendors.filter((v) => v.status === "Active").length,
      totalPOValue: purchaseOrders.reduce((s, po) => s + po.totalAmount, 0),
    },
  });
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const raw = await request.json();
  const parsed = ProcurementPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }
  const body = parsed.data;

  if (body.action === "create-rfq") {
    return NextResponse.json({
      success: true,
      message: "RFQ created successfully",
      id: `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, "0")}`,
    });
  }

  if (body.action === "create-po") {
    return NextResponse.json({
      success: true,
      message: "Purchase order created",
      id: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, "0")}`,
    });
  }

  if (body.action === "evaluate-vendor") {
    return NextResponse.json({ success: true, message: "Vendor evaluation updated" });
  }

  if (body.action === "approve-po") {
    return NextResponse.json({ success: true, message: "PO approved" });
  }

  if (body.action === "update-fat-sat") {
    return NextResponse.json({ success: true, message: "FAT/SAT status updated" });
  }

  if (body.action === "submit-tbe") {
    return NextResponse.json({ success: true, message: "TBE submitted" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
