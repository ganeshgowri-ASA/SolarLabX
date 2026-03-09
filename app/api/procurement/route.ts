import { NextRequest, NextResponse } from "next/server";
import { rfqs, vendors, purchaseOrders, tbeMatrix, procurementMetrics } from "@/lib/data/procurement-data";

export async function GET(request: NextRequest) {
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

  // Default: summary
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
  const body = await request.json();
  const { action } = body;

  if (action === "create-rfq") {
    return NextResponse.json({
      success: true,
      message: "RFQ created successfully",
      id: `RFQ-${new Date().getFullYear()}-${String(rfqs.length + 1).padStart(3, "0")}`,
    });
  }

  if (action === "create-po") {
    return NextResponse.json({
      success: true,
      message: "Purchase order created",
      id: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, "0")}`,
    });
  }

  if (action === "evaluate-vendor") {
    const { vendorId, scores } = body;
    return NextResponse.json({
      success: true,
      message: `Vendor ${vendorId} evaluation updated`,
    });
  }

  if (action === "approve-po") {
    const { poId, approvedBy } = body;
    return NextResponse.json({
      success: true,
      message: `PO ${poId} approved by ${approvedBy}`,
    });
  }

  if (action === "update-fat-sat") {
    const { poId, newStatus } = body;
    return NextResponse.json({
      success: true,
      message: `PO ${poId} FAT/SAT status updated to ${newStatus}`,
    });
  }

  if (action === "submit-tbe") {
    const { rfqId } = body;
    return NextResponse.json({
      success: true,
      message: `TBE submitted for RFQ ${rfqId}`,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
